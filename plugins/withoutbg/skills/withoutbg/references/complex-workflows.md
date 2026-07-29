# Complex Workflows

Use this guide for multi-image, ecommerce, apparel, product, social, or production cutout tasks. The goal is not just to run `withoutbg`; it is to produce auditable transparent assets.

## Task Decomposition

Start with an Issue Tree / MECE breakdown, then map it to a pipeline.

```text
1. Deliverable
   - transparent, flattened, or both
   - PNG/WebP/JPEG
   - final canvas size, padding, crop, trim, and naming
   - QA preview requirements

2. Input set
   - local folders, individual files, URLs, archives
   - formats, dimensions, color spaces, EXIF orientation
   - existing alpha or masks
   - product type, person/apparel/sticker/logo/text

3. Foreground difficulty
   - hard edges, hair, fur, glass, shadows, white-on-white, low contrast
   - thin strokes, flags, small text, distressed print textures
   - foreground elements that must not become semi-transparent

4. Processing strategy
   - local open-source withoutbg
   - withoutBG Pro API if credentials and quality requirement justify it
   - compare against another model only when requested or when QA fails

5. Post-processing
   - trim, pad, center, resize, defringe, flatten, compose background
   - preserve or remove shadows
   - export derivatives

6. Validation
   - alpha-channel checks
   - checker/white/dark previews
   - contact sheets
   - hard-case manual review
```

## Pipeline DAG

Represent complex work as a pipeline, not as one command:

```text
collect inputs
  -> normalize local copies
  -> run withoutbg
  -> verify alpha mechanically
  -> create visual previews
  -> inspect hard cases
  -> post-process final assets
  -> package outputs and logs
```

For repeatable work, keep these folders separate:

```text
work/
  inputs/       downloaded originals or copies
  normalized/   model-ready local PNG/JPEG inputs
  cutouts/      raw withoutbg transparent outputs
  final/        post-processed deliverables
  preview/      checker/white/dark/contact-sheet QA images
  logs/         command logs and alpha checks
```

## Strategy Selection

Use local open-source mode when:

- Privacy, cost, or offline repeatability matters.
- The user wants a local test or a free batch run.
- The image set is large enough that loading the model once is valuable.

Use API mode when:

- The user explicitly asks for withoutBG Pro or best quality.
- The user provides `WITHOUTBG_API_KEY` or says to use stored credentials.
- The output is production-critical and local mode fails on key edge cases.

Use a comparison run when:

- The user asks to compare `withoutbg` with `rembg`, Photoshop, or another cutout approach.
- The inputs include difficult classes like transparent objects, hair, distressed print graphics, or foreground text.
- Automated alpha checks pass but visual previews show lost detail.

## Ecommerce Product Flow

1. Copy or download all sources into `inputs/`.
2. Normalize to model-safe local files:

```bash
for f in inputs/*; do
  base=$(basename "$f")
  stem=${base%.*}
  magick "$f" -auto-orient -colorspace sRGB "normalized/${stem}.png"
done
```

3. Run local batch:

```bash
withoutbg normalized/ --batch --output-dir cutouts --format png --verbose 2>&1 | tee logs/withoutbg.log
```

4. Verify alpha:

```bash
for f in cutouts/*.png; do
  min=$(magick "$f" -alpha extract -format '%[fx:minima]' info:)
  max=$(magick "$f" -alpha extract -format '%[fx:maxima]' info:)
  echo "$(basename "$f") alpha_min=$min alpha_max=$max"
done | tee logs/alpha-check.txt
```

5. Generate previews:

```bash
mkdir -p preview
for f in cutouts/*.png; do
  base=$(basename "$f" .png)
  read w h < <(magick identify -format '%w %h' "$f")
  magick -size ${w}x${h} pattern:checkerboard "$f" -compose over -composite "preview/${base}-checker.png"
  magick "$f" -background white -alpha remove -alpha off "preview/${base}-white.jpg"
done
magick montage preview/*-checker.png -geometry 260x260+10+10 -tile 4x preview/contact-sheet.png
```

6. Post-process only after preview review. Example final square product canvas:

```bash
mkdir -p final
for f in cutouts/*.png; do
  base=$(basename "$f" .png)
  magick "$f" -trim +repage -resize 1800x1800\> \
    -background none -gravity center -extent 2000x2000 \
    "final/${base}-2000.png"
done
```

## Apparel and Mockup Flow

For apparel photos or POD mockups, decide what should be removed:

- Remove only the surrounding photo background when the shirt/person should remain.
- Do not use background removal to extract a print from a flattened mockup unless the user explicitly asks for an approximate extraction.
- Preserve the original print PNG or source design when available; it is usually cleaner than reverse-extracting from a photo.

Recommended QA checks:

- Inspect sleeves, hairline, neck, hands, and shirt folds.
- Preview on white, black, and checkerboard backgrounds.
- Confirm logos and distressed textures did not become unintentionally transparent.

## Sticker and Graphic Flow

Sticker-style graphics often have white backgrounds and intentional white foreground ink. Model-based removal can delete foreground white by mistake.

Use this decision path:

1. If the image has a flat white background and foreground does not use white, deterministic ImageMagick thresholding may be better.
2. If foreground includes white text, balls, stars, flags, or texture, compare `withoutbg` with another method and inspect alpha.
3. If model output makes internal art semi-transparent, do not accept it without manual or alternate-model review.

Create an alpha heatmap for diagnosing internal transparency:

```bash
magick cutout.png -alpha extract alpha-mask.png
magick alpha-mask.png -auto-level alpha-mask-contrast.png
```

## Comparison Tests

When comparing withoutbg against another tool, keep inputs identical:

```text
inputs/      originals
normalized/  one normalized copy per source
withoutbg/   withoutbg outputs
other/       comparison outputs
preview/     side-by-side contact sheets
logs/        alpha checks and commands
```

For each output, verify:

- Same input dimensions unless the tool intentionally changes them.
- `channels=srgba` or equivalent alpha.
- `alpha_min=0` and `alpha_max` near `1`.
- Visual edge quality on checkerboard.
- Missing foreground details, haloing, gray fringe, or internal semi-transparency.

## Reporting Results

Report the highest-signal facts:

- Output directories.
- Model/mode used: local open-source or API.
- Number of images processed and number with valid alpha.
- Any download workaround used, such as `HF_HUB_DISABLE_XET=1` or explicit ONNX paths.
- Hard cases that need manual review.
- Preview image path when generated.

Avoid claiming "perfect" cutouts from mechanical alpha checks alone. Alpha checks prove transparency exists; visual QA decides whether the mask is good enough.
