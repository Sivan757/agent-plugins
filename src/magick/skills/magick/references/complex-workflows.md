# Complex ImageMagick Workflows

Use these patterns when a request needs visual judgment, multi-pass outputs, composition proofs, or troubleshooting.

## Alpha And Composition Preview Loop

Always preview transparent assets and composed outputs on at least one artificial background:

```bash
magick -size 1000x1000 pattern:checkerboard checker.png
magick checker.png composed.png -compose over -composite preview-checker.png
magick composed.png -background white -alpha remove -alpha off preview-white.jpg
```

Use visual inspection for placement, opacity, halos, rasterization quality, text edges, logo edges, fine print, and color shifts.

## Chroma-Key Print Cutout Workflow

Use this workflow for AI-generated POD print sheets that were deliberately prompted with a flat key background, such as pure magenta `#FF00FF`, and optional pure fluorescent green `#00FF00` divider lines. Prefer this deterministic route over AI background removal when the artwork is a flat graphic print; semantic cutout tools can delete distressed ink, letter counters, or internal design elements.

Prompt-side assumptions:

- Background is flat `#FF00FF`; panel dividers, if any, are thin `#00FF00`.
- The artwork does not intentionally use magenta, neon green, or nearby chroma-key colors.
- Letter counters, holes, and negative spaces that should become transparent expose the key background.
- The design has enough padding to crop away divider lines before keying.

For a 2x2 generated sheet, crop away the center divider before transparency work:

```bash
src="sheet.png"
panel_dir="panels"
mkdir -p "$panel_dir"

w=$(magick identify -format '%w' "$src")
h=$(magick identify -format '%h' "$src")
cx=$((w / 2))
cy=$((h / 2))
gap=8

magick "$src" -crop "$((cx - gap))x$((cy - gap))+0+0" +repage "$panel_dir/panel-01.png"
magick "$src" -crop "$((w - cx - gap))x$((cy - gap))+$((cx + gap))+0" +repage "$panel_dir/panel-02.png"
magick "$src" -crop "$((cx - gap))x$((h - cy - gap))+0+$((cy + gap))" +repage "$panel_dir/panel-03.png"
magick "$src" -crop "$((w - cx - gap))x$((h - cy - gap))+$((cx + gap))+$((cy + gap))" +repage "$panel_dir/panel-04.png"
```

Build alpha directly from the panel RGB values. Prefer this over reusing saved `masks/*-mask.png` files: old masks can preserve anti-aliased dark magenta edge pixels and make later cleanup harder. Avoid exact `#FF00FF` keying and plain `-fuzz` as the main method; generated images often contain near-magenta, purple, and compressed edge colors.

```bash
out_dir="cutouts"
mkdir -p "$out_dir"

key_expr='(((u.r>0.30)&&(u.b>0.24)&&((u.r-u.g)>0.07)&&((u.b-u.g)>0.05)&&(abs(u.r-u.b)<0.50))||((u.g>0.45)&&((u.g-u.r)>0.15)&&((u.g-u.b)>0.15)))?0:1'

for panel in "$panel_dir"/panel-*.png; do
  name=$(basename "$panel")
  magick "$panel" -alpha set -channel A -fx "$key_expr" +channel \
    -trim +repage -bordercolor none -border 24 "$out_dir/$name"
done
```

Always run the V5 edge-depink pass after direct keying; do not first decide whether magenta/purple halos are visible. Treat `cutouts` as an intermediate directory and use `cutouts-v5` as the delivery output. V5 only changes purple-like pixels near transparent edges: RGB is replaced with neighboring ink color and target alpha is set to `0.55` (45% transparent).

```bash
v5_edge_depink() {
  src="$1"
  out="$2"
  tmp="${3:-tmp-v5}"
  mkdir -p "$tmp"

  alpha="$tmp/alpha.png"
  bg="$tmp/bg-dilate.png"
  edge="$tmp/edge-zone.png"
  color="$tmp/purple-color.png"
  target="$tmp/target-mask.png"
  donor="$tmp/neighbor-donor.png"
  donor_masked="$tmp/donor-masked.png"
  rgb="$tmp/rgb.png"
  new_alpha="$tmp/alpha-v5.png"

  purple_expr='((u.a>0)&&(u.g<0.16)&&(u.b>0.13)&&(u.r>0.06)&&(u.b>=(u.r*0.85))&&((u.b-u.g)>0.09)&&((u.r-u.g)>0.025))?1:0'

  magick "$src" -alpha extract "$alpha"
  magick "$alpha" -negate -morphology Dilate Disk:2 "$bg"
  magick "$alpha" "$bg" -compose multiply -composite -threshold 1% "$edge"
  magick "$src" -alpha on -channel rgba -fx "$purple_expr" "$color"
  magick "$edge" "$color" -compose multiply -composite -threshold 1% "$target"
  magick "$src" -alpha off -statistic median 5x5 -blur 0x1.2 "$donor"
  magick "$donor" "$target" -compose CopyOpacity -composite "$donor_masked"
  magick "$src" "$donor_masked" -compose over -composite "$rgb"
  magick "$alpha" "$target" -fx 'v>0?0.55:u' "$new_alpha"
  magick "$rgb" "$new_alpha" -compose CopyOpacity -composite \
    -background none -alpha background "$out"
}

depink_dir="cutouts-v5"
mkdir -p "$depink_dir"

for png in "$out_dir"/*.png; do
  name=$(basename "$png")
  v5_edge_depink "$png" "$depink_dir/$name" "tmp-v5/${name%.png}"
done
```

Tune thresholds conservatively. Increasing the magenta range can remove antialiasing and distressed edge bleed, but it can also erase intentional red, purple, or navy ink if the prompt allowed those colors to drift toward the key color. If the artwork must use magenta or neon green, choose a different key color before generation. When original 2x2 sheets are available, re-cut from the sheets instead of repairing already-transparent PNGs.

Verify alpha and residual key colors, then create checkerboard previews:

```bash
visible_key_expr='((u.a>0)&&(((u.r>0.30)&&(u.b>0.24)&&((u.r-u.g)>0.07)&&((u.b-u.g)>0.05)&&(abs(u.r-u.b)<0.50))||((u.g>0.45)&&((u.g-u.r)>0.15)&&((u.g-u.b)>0.15))))?1:0'

for png in "$out_dir"/panel-*.png; do
  magick "$png" -alpha extract \
    -format '%f alpha_min=%[fx:minima] alpha_max=%[fx:maxima] alpha_mean=%[fx:mean]\n' info:

  magick "$png" -alpha on -fx "$visible_key_expr" -colorspace Gray \
    -format '%f key_like_visible=%[fx:mean*w*h]\n' info:

  dims=$(magick identify -format '%wx%h' "$png")
  magick -size "$dims" pattern:checkerboard "$png" -compose over -composite "${png%.png}-checker.jpg"
done
```

## Clothing Print Overlay Workflow

For apparel mockups, separate deterministic steps:

1. Normalize blank garment and print asset.
2. Resize and position the print.
3. Choose blend mode: `over` for opaque prints, `multiply` for dark line art, opacity-adjusted overlay for subtle preview.
4. Export a full mockup and optionally a print-placement proof.

```bash
magick blank-shirt.png \( print.png -resize 360x360 \) \
  -geometry +320+410 -compose multiply -composite mockup.png
```

For realistic fabric deformation, folds, displacement, or perspective, use a mockup engine, PSD workflow, or custom displacement map instead of relying on a single ImageMagick command.

## Validation Checklist

Run these checks before delivery:

```bash
test -s output.png
magick identify -format 'format=%m size=%wx%h channels=%[channels] colorspace=%[colorspace] bytes=%b\n' output.png
```

For transparent or composed outputs:

- Confirm the expected alpha state.
- Preview on checkerboard and white when transparency is part of the deliverable.
- Check placement, scale, opacity, rasterization edges, and fine text or line art.
- Keep placement proofs if the user may ask for refinement.

For normalization:

- Confirm exact dimensions and expected background.
- Confirm metadata policy with `identify -verbose` when relevant.

For comparison:

```bash
magick compare -metric RMSE before.png after.png diff.png
```

## Troubleshooting

Delegate or coder missing:

```bash
magick -version
magick -list format | rg 'HEIC|AVIF|WEBP|PDF|SVG|JXL'
magick -list configure | rg 'DELEGATES'
```

PDF blocked or fails:

- Check Ghostscript delegate availability.
- Check ImageMagick `policy.xml`; PDF reading can be disabled by policy.
- Rasterize only the needed page with `input.pdf[0]` when possible.

SVG differs from browser rendering:

- Check whether the build uses `rsvg`, `cairo`, or the internal SVG renderer.
- Rasterize at higher density, then resize down.

HEIC/AVIF/WebP/JXL fails:

- Confirm the format appears as readable/writable in `magick -list format`.
- Use format-specific `-define` options only after checking the docs.

Unexpected output format:

- ImageMagick selects format from the output extension unless a prefix is used.
- Use `png:output.dat` or `jpg:output` only when extension-based detection is not enough.

Shell parse errors:

- Escape parentheses in zsh/bash: `\( ... \)`.
- Quote filenames and geometry expressions.

Huge files or slow processing:

- Resize early when full resolution is not required.
- Use `-limit memory`, `-limit map`, or a temporary directory if resource limits matter.
- Avoid unnecessary `-verbose` on large batches.
