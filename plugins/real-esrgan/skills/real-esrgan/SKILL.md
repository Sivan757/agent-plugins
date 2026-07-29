---
name: real-esrgan
description: Local Real-ESRGAN image super-resolution and clarity workflows using realesrgan-ncnn-vulkan, Upscayl-adjacent outputs, and ImageMagick verification. Use when the user needs to upscale, enhance, or compare raster images, transparent cutouts, print-ready PNG artwork, product/social/ecommerce images, AI-generated images, or batch image folders while preserving alpha, DPI metadata, canvas placement, and reproducible quality checks.
---

# Real-ESRGAN

Use this skill to build practical local Real-ESRGAN workflows for image super-resolution. Prefer small, verified command sequences over one opaque batch command when alpha, print size, or visual fidelity matters.

Official docs:

- Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Real-ESRGAN ncnn Vulkan: https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan
- Upscayl: https://github.com/upscayl/upscayl
- ncnn: https://github.com/Tencent/ncnn

Real-ESRGAN is not mathematically lossless. When a user says "lossless upscale" or "lossless clarity", interpret the practical target as: preserve originals, use lossless/intermediate PNG when appropriate, preserve alpha/canvas/DPI metadata deliberately, and verify outputs. AI-generated detail is synthetic.

## Prerequisites

`realesrgan-ncnn-vulkan` is required and is NOT on PATH by default after installation. ImageMagick (`magick`) is also required for verification steps.

**macOS install:**

1. Download the prebuilt `realesrgan-ncnn-vulkan` binary from GitHub Releases:
   https://github.com/xinntao/Real-ESRGAN/releases (choose the `macos` zip for your architecture).

2. Unzip and either add the extracted directory to PATH or invoke the binary by its full path.

3. The binary must be able to find its `models/` folder. Either run it from the directory that contains `models/`, or pass the models path explicitly:
   ```bash
   realesrgan-ncnn-vulkan -m /path/to/models -i input.png -o output.png
   ```

4. Verify the binary is reachable:
   ```bash
   command -v realesrgan-ncnn-vulkan || /full/path/to/realesrgan-ncnn-vulkan -h
   ```

**ImageMagick:**

```bash
brew install imagemagick
```

Verify: `magick -version`

## Route By Task

Load only the reference needed for the current task:

- CLI operations: see [references/cli.md](references/cli.md) for binary discovery, model selection, single-image commands, batch commands, thread/tile settings, alpha/DPI restoration, and speed checks.
- Complex pipelines: see [references/pipelines.md](references/pipelines.md) for Issue Tree / MECE decomposition, small-cutout versus print-canvas decisioning, alpha-preserved print workflows, comparison matrices, and QA.

## Standard Workflow

1. Inspect the environment and inputs first:

```bash
command -v realesrgan-ncnn-vulkan
realesrgan-ncnn-vulkan -h
magick identify -format 'format=%m size=%wx%h res=%x,%y %[units] channels=%[channels] bytes=%b\n' input.png
```

2. Choose the processing path:

- Use Real-ESRGAN on the smallest meaningful subject image when the final file is a large transparent print canvas made from a small cutout.
- Use Real-ESRGAN on the final print-size image only when the high-resolution raster itself contains meaningful detail that should be enhanced.
- Use ImageMagick resize, not Real-ESRGAN, for pure DPI metadata changes, exact pixel art scaling, QR codes, masks, or hard-edged technical graphics.

3. Run Real-ESRGAN to a new path:

```bash
realesrgan-ncnn-vulkan \
  -i input.png \
  -o output-x4.png \
  -n realesrgan-x4plus \
  -s 4 \
  -f png \
  -j 1:2:2
```

4. Restore metadata or alpha when needed:

```bash
magick output-x4.png -units PixelsPerInch -density 300 output-x4-300dpi.png
```

5. Verify outputs:

```bash
test -s output-x4.png
magick identify -format 'format=%m size=%wx%h res=%x,%y %[units] channels=%[channels] bytes=%b\n' output-x4.png
```

Check dimensions, alpha channel, DPI metadata, file size, visible edges, text/logos, and whether the AI invented unwanted texture.

## Complex Image Pipeline Workflow

For commercial, ecommerce, apparel, print, social, or transparent-artwork requests, treat the problem as image pipeline design plus tool orchestration. Do not start by asking "what is the one upscale command?" Start with an Issue Tree / MECE breakdown, then turn it into a reproducible pipeline DAG.

Use this reasoning frame:

1. Define the output: final pixel dimensions, physical print size, DPI metadata, transparent/opaque background, required format, and delivery constraints.
2. Inventory inputs: source dimensions, alpha channel, canvas padding, DPI metadata, crop/trim boxes, masks, text/logos, and whether a smaller subject cutout exists.
3. Choose the enhancement target: original cutout, trimmed subject, full canvas, selected crop tiles, or multiple alternatives for comparison.
4. Choose model and parameters: photo/product/general, illustration/anime, tile size, thread pipeline, output format, and whether TTA is worth the cost.
5. Preserve structure: keep alpha masks, canvas placement, density metadata, and original filenames intentionally.
6. Split into verifiable passes: probe -> optional trim/canvas analysis -> Real-ESRGAN -> resize/place/copy alpha -> verify -> compare sample crops -> final export.
7. Benchmark representative files before full batch. Large print canvases can be minutes per image; small cutouts may be seconds per image.
8. Choose tools: keep Real-ESRGAN for neural super-resolution; use ImageMagick for alpha, canvas, DPI, compositing, and deterministic resizing.

Common finding: for print artwork created by placing a small transparent cutout onto a 300 DPI canvas, upscaling the small cutout first and then placing it into the final print canvas can look better and run much faster than enhancing the already enlarged print canvas.

## Boundary Rules

Use Real-ESRGAN when:

- The goal is perceptual super-resolution or clarity improvement for photos, illustrations, product art, AI images, or transparent cutouts.
- Synthetic detail is acceptable after visual inspection.
- The workflow can be verified with dimensions, alpha checks, generated comparison crops, and spot checks.

Use ImageMagick instead when:

- The task is only DPI metadata, format conversion, canvas placement, compositing, trimming, alpha copying, deterministic resizing, or pixel-exact scaling.
- The source is pixel art, a QR code, a barcode, a mask, or a technical drawing where invented pixels are harmful.

Use another tool or manual review when:

- Text, logos, legal marks, product labels, face identity, or small typography must be faithfully preserved.
- The user needs manual retouching, vector reconstruction, OCR-aware text redraw, or brand/legal approval.

## Safety Notes

- Do not overwrite originals. Write to a new output directory by default.
- Quote paths that contain spaces.
- Treat DPI as metadata; changing DPI alone does not increase real detail.
- Preserve alpha deliberately. Real-ESRGAN may process alpha, but exact cutout boundaries often require copying or resizing the original alpha mask after enhancement.
- Avoid launching multiple Real-ESRGAN processes on one GPU unless measured; use one process with directory input and tune `-j` first.
- For large PNGs, estimate output size before running: 4x scale means 16x pixels.
