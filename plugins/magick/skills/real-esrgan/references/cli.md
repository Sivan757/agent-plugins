# CLI Operations

Use these recipes for local `realesrgan-ncnn-vulkan` workflows. Probe before choosing a command and verify outputs afterward.

## Binary Discovery

Check for a runnable binary:

```bash
command -v realesrgan-ncnn-vulkan
realesrgan-ncnn-vulkan -h
```

When a portable binary is used, run it from the directory that contains its `models/` folder or pass `-m /path/to/models`.

```bash
/path/to/realesrgan-ncnn-vulkan \
  -i input.png \
  -o output.png \
  -m /path/to/models \
  -n realesrgan-x4plus \
  -s 4 \
  -f png
```

## Input Probe

Use ImageMagick for image metadata and alpha inspection:

```bash
magick identify -format 'format=%m size=%wx%h res=%x,%y %[units] channels=%[channels] colorspace=%[colorspace] bytes=%b\n' input.png
magick input.png -alpha extract -threshold 0 -format 'alpha-bbox=%@ full=%wx%h\n' info:
```

For folders:

```bash
magick identify -format '%f | %wx%h | res=%x,%y %[units] | channels=%[channels] | bytes=%b\n' input_dir/*.png
```

## Model Selection

Verify available model files before assuming a model exists:

```bash
find /path/to/models -maxdepth 1 -type f | sort
```

Typical choices:

- `realesrgan-x4plus`: default for photos, product images, print artwork, and mixed raster graphics.
- `realesrgan-x4plus-anime`: illustrations, anime-style images, flat color art.
- `realesr-animevideov3`: anime/video-frame-oriented model when bundled.
- `realesrnet-x4plus`: lower hallucination if available, often less aggressively sharpened.

If text or logos matter, test multiple models on one representative crop before full batch.

## Single Image

Run x4 super-resolution to PNG:

```bash
realesrgan-ncnn-vulkan \
  -i input.png \
  -o output-x4.png \
  -n realesrgan-x4plus \
  -s 4 \
  -f png \
  -j 1:2:2
```

Set DPI metadata after output if needed:

```bash
magick output-x4.png -units PixelsPerInch -density 300 output-x4-300dpi.png
```

## Batch Folder

Use directory input/output for one Real-ESRGAN process:

```bash
mkdir -p out-x4
realesrgan-ncnn-vulkan \
  -i input_dir \
  -o out-x4 \
  -n realesrgan-x4plus \
  -s 4 \
  -f png \
  -j 1:2:2
```

Tune `-j load:proc:save` only after a baseline. For many small images, try `-j 4:4:4`. For large images, try `-j 1:2:2` or `-j 1:1:1`.

Avoid external parallelism first. Multiple Real-ESRGAN processes often compete for the same GPU and can be slower or less stable than a single directory batch.

## Tile Size

Use `-t 0` or omit `-t` for automatic tiling. Use smaller tiles to reduce memory pressure on large images:

```bash
realesrgan-ncnn-vulkan -i large.png -o large-x4.png -n realesrgan-x4plus -s 4 -f png -t 256 -j 1:1:1
```

Use larger tiles only after testing:

```bash
realesrgan-ncnn-vulkan -i large.png -o large-x4.png -n realesrgan-x4plus -s 4 -f png -t 512 -j 1:2:2
```

## Same-Size Clarity

To enhance a print-size image while keeping the original dimensions, run x4 and then downsample:

```bash
realesrgan-ncnn-vulkan -i print.png -o print-x4-native.png -n realesrgan-x4plus -s 4 -f png -t 512 -j 1:2:2
magick print-x4-native.png -resize 3543x3661! -units PixelsPerInch -density 300 print-clarity-same-size.png
```

Prefer exact alpha preservation when the original print canvas alpha must remain unchanged:

```bash
magick \
  \( print-clarity-same-size.png -alpha off \) \
  \( print.png -alpha extract \) \
  -compose CopyOpacity -composite \
  -units PixelsPerInch -density 300 \
  print-clarity-same-size-alpha-preserved.png
```

## Alpha Verification

Compare alpha channels when preserving a cutout boundary matters:

```bash
compare -metric AE \
  \( original.png -alpha extract \) \
  \( output.png -alpha extract \) \
  null:
```

`0 (0)` means identical alpha. If nonzero but the bounding box is unchanged, inspect edges visually before accepting.

## Speed Benchmark

Benchmark representative files before full batch:

```bash
/usr/bin/time -p realesrgan-ncnn-vulkan -i sample.png -o sample-x4.png -n realesrgan-x4plus -s 4 -f png -j 1:2:2
```

Record:

- input dimensions and file size
- output dimensions and file size
- model, tile size, and `-j`
- elapsed `real` seconds
- whether alpha/DPI restoration was included

## Output Verification

```bash
test -s output.png
magick identify -format '%f | %wx%h | res=%x,%y %[units] | channels=%[channels] | bytes=%b\n' output.png
```

For print work, verify both native x4 and final same-size output if both are produced.
