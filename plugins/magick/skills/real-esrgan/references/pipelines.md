# Complex Pipelines

Use this guide for ecommerce, apparel, social, print-ready PNG, and transparent cutout workflows where the processing order affects quality, runtime, or alpha fidelity.

## Issue Tree / MECE Frame

Break the task into independent decisions before writing commands:

```text
1. Output contract
   - pixel dimensions
   - physical print size and DPI metadata
   - transparent or opaque background
   - required file format and file-size constraints

2. Input inventory
   - original source images
   - cutouts, masks, or alpha channels
   - print-size canvases
   - trim boxes and placement offsets
   - text, logos, labels, faces, or legal marks

3. Enhancement strategy
   - small subject first
   - final canvas directly
   - crop/tile comparison
   - model alternatives

4. Preservation strategy
   - copy original alpha
   - resize alpha
   - preserve canvas placement
   - restore DPI metadata

5. Verification
   - dimensions and density
   - alpha diff and alpha bounding boxes
   - visual crop comparisons
   - batch timing and failure logs
```

## Pipeline DAG

Represent the work as a DAG:

```text
probe inputs
  -> decide subject/canvas route
  -> run Real-ESRGAN on selected target
  -> deterministic resize/composite with ImageMagick
  -> copy or resize alpha mask
  -> restore DPI metadata
  -> verify dimensions/alpha/file sizes
  -> inspect representative crops
```

Keep intermediate files when diagnosing quality:

- native Real-ESRGAN x4 output
- same-size clarity output
- alpha-preserved output
- comparison crops
- logs with timing and parameters

## Small Cutout To Print Canvas

Use this when a final 300 DPI print PNG was created by enlarging a small transparent cutout. This often gives better quality and much lower runtime than enhancing the already enlarged canvas.

Steps:

1. Probe the cutout and print canvas:

```bash
magick identify -format '%f | %wx%h | res=%x,%y %[units] | channels=%[channels] | bytes=%b\n' cutouts/*.png print-300dpi/*.png
magick print-300dpi/item.png -alpha extract -threshold 0 -format 'bbox=%@ full=%wx%h\n' info:
```

2. Upscale the cutout:

```bash
realesrgan-ncnn-vulkan -i cutouts -o cutouts-x4 -n realesrgan-x4plus -s 4 -f png -j 1:2:2
```

3. Place the enhanced cutout into the print canvas at the original alpha bounding box:

```bash
magick -size 3543x3661 canvas:none \
  \( cutouts-x4/item.png -trim +repage -resize 2452x3147! \) \
  -geometry +545+257 -compose over -composite \
  -units PixelsPerInch -density 300 \
  item-cutout-x4-to-print.png
```

4. If exact print alpha is required, copy the original print alpha:

```bash
magick \
  \( item-cutout-x4-to-print.png -alpha off \) \
  \( print-300dpi/item.png -alpha extract \) \
  -compose CopyOpacity -composite \
  -units PixelsPerInch -density 300 \
  item-cutout-x4-to-print-alpha-preserved.png
```

## Direct Print-Canvas Clarity

Use this when the print-size raster already contains meaningful detail and the user wants to compare same-size clarity.

Steps:

1. Run x4 with a tile size suitable for large images:

```bash
realesrgan-ncnn-vulkan \
  -i print-300dpi/item.png \
  -o print-native-x4/item.png \
  -n realesrgan-x4plus \
  -s 4 \
  -f png \
  -t 512 \
  -j 1:2:2
```

2. Downsample back to the original print dimensions:

```bash
magick print-native-x4/item.png \
  -resize 3543x3661! \
  -units PixelsPerInch -density 300 \
  print-clarity-same-size/item.png
```

3. Copy original alpha when the same cutout boundary must be exact:

```bash
magick \
  \( print-clarity-same-size/item.png -alpha off \) \
  \( print-300dpi/item.png -alpha extract \) \
  -compose CopyOpacity -composite \
  -units PixelsPerInch -density 300 \
  print-clarity-same-size-alpha-preserved/item.png
```

## Comparison Matrix

For a serious quality decision, produce these candidates:

```text
A. original cutout -> deterministic print resize
B. cutout -> Real-ESRGAN x4 -> print canvas
C. print canvas -> Real-ESRGAN x4 -> downsample to original print size
D. print canvas -> deterministic unsharp only
```

Compare at the same final dimensions and same alpha boundary. Do not compare a native 4x output against a same-size print output as if they serve the same delivery target.

## Visual QA

Inspect representative crops:

- letter edges and small text
- logo-like shapes and numbers
- product edges and transparent halos
- high-contrast black/white outlines
- flat-color regions where AI noise is visible
- repeated strokes or paint splashes where artifacts can look plausible but wrong

Create crop sheets only when the user wants visual deliverables. Otherwise write outputs to named directories and report paths.

## Failure Modes

- DPI-only changes do not create detail.
- Directly enhancing a large canvas can be much slower and may only sharpen interpolation artifacts.
- Downsampling an enhanced image can alter semi-transparent edge pixels unless original alpha is copied back.
- AI can distort text, numbers, logos, badges, faces, or product labels.
- `-s 2` may still run an x4 model internally depending on the bundled model path, so benchmark instead of assuming it is much faster.
- Huge native x4 outputs consume disk and memory quickly: 4x width and height means 16x pixels.

## Batch Discipline

Use a bounded output tree:

```text
upscale-tests/
  cutouts-realesrgan-x4/
  cutouts-realesrgan-x4-to-print-300dpi-alpha-preserved/
  print-300dpi-realesrgan-x4-native/
  print-300dpi-realesrgan-clarity-same-size-alpha-preserved/
  reports/
```

Write a timing log with model, tile, `-j`, input dimensions, and elapsed seconds. Stop after one or two representative large files if the batch is minutes per image and the user has not explicitly asked for full processing.
