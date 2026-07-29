# Common Commands

Use these recipes for straightforward `withoutbg` work. Probe before choosing commands and verify output transparency afterward.

## Environment

Create an isolated environment when `withoutbg` is not already available:

```bash
uv venv .venv --python 3.12
uv pip install --python .venv/bin/python withoutbg pillow
.venv/bin/withoutbg --help
```

If `uv` is unavailable:

```bash
python3 -m venv .venv
.venv/bin/pip install withoutbg pillow
.venv/bin/withoutbg --help
```

## Input Normalization

Download remote images first:

```bash
curl -L 'https://example.com/image.avif' -o input.avif
```

Convert fragile or uncommon formats to a local sRGB PNG:

```bash
magick input.avif -auto-orient -colorspace sRGB -alpha off normalized.png
```

Probe inputs:

```bash
magick identify -format '%f format=%m size=%wx%h channels=%[channels] colorspace=%[colorspace]\n' input.png
```

## Single Image

Run the local open-source model:

```bash
withoutbg input.jpg --output output.png --format png --verbose
```

The default output path is `<stem>-withoutbg.png` when `--output` is omitted:

```bash
withoutbg input.jpg --format png --verbose
```

## Batch Folder

Run one CLI batch so the model loads once:

```bash
mkdir -p out
withoutbg inputs/ --batch --output-dir out --format png --verbose
```

Supported CLI input extensions include `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tiff`, and `.webp`. Normalize AVIF/HEIC first with ImageMagick.

## API Mode

Use API mode only when the user explicitly asks for Pro quality or supplies credentials:

```bash
export WITHOUTBG_API_KEY='sk_...'
withoutbg input.jpg --use-api --output output.png --format png --verbose
```

Do not print, store, or commit API keys. Prefer environment variables over inline `--api-key`.

## Python API

Use Python for custom batch naming, mixed sources, detailed error handling, or pipeline integration:

```python
from pathlib import Path
from withoutbg import WithoutBG

model = WithoutBG.opensource()
for src in sorted(Path("inputs").glob("*")):
    if src.suffix.lower() not in {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}:
        continue
    result = model.remove_background(src).convert("RGBA")
    result.save(Path("out") / f"{src.stem}-withoutbg.png")
```

Use explicit ONNX paths when models are already downloaded:

```bash
export WITHOUTBG_DEPTH_MODEL_PATH=/path/to/depth_anything_v2_vits_slim.onnx
export WITHOUTBG_ISNET_MODEL_PATH=/path/to/isnet.onnx
export WITHOUTBG_MATTING_MODEL_PATH=/path/to/focus_matting_1.0.0.onnx
export WITHOUTBG_REFINER_MODEL_PATH=/path/to/focus_refiner_1.0.0.onnx
withoutbg inputs/ --batch --output-dir out --format png --verbose
```

## Download Reliability

The local open-source mode downloads model weights from Hugging Face on first use. The main model file (`withoutbg-open-weights.onnx`) is approximately 450MB and the first run will be slow. If downloads fail or hang:

```bash
export HF_HOME=/abs/path/to/task-cache/huggingface
export HF_HUB_DISABLE_XET=1
withoutbg input.jpg --output output.png --format png --verbose
```

**Manual-download fallback (stronger):** When Hugging Face connections drop repeatedly, download the model once by hand and point the CLI at the local file:

```bash
curl -L -o withoutbg-open-weights.onnx \
  https://huggingface.co/withoutbg/withoutbg-openweights-onnx/resolve/main/withoutbg-open-weights.onnx
export WITHOUTBG_ONNX_PATH="$(pwd)/withoutbg-open-weights.onnx"
withoutbg input.jpg --output output.png --format png --verbose
```

For repeatable production work, download the four ONNX files once from `withoutbg/focus` and use the `WITHOUTBG_*_MODEL_PATH` variables above.

## Alpha Verification

Confirm output has an alpha channel:

```bash
magick identify -format '%f format=%m size=%wx%h channels=%[channels]\n' out/*.png
```

Confirm transparency is actually present:

```bash
for f in out/*.png; do
  min=$(magick "$f" -alpha extract -format '%[fx:minima]' info:)
  max=$(magick "$f" -alpha extract -format '%[fx:maxima]' info:)
  echo "$(basename "$f") alpha_min=$min alpha_max=$max"
done
```

Interpretation:

- `channels=srgba` or `rgba`: alpha exists.
- `alpha_min=0`: at least some pixels are fully transparent.
- `alpha_max` near `1`: at least some pixels are fully or mostly opaque.
- `alpha_min=1 alpha_max=1`: alpha exists but the image is effectively opaque.

## Preview Generation

Create checkerboard and white-background previews:

```bash
read w h < <(magick identify -format '%w %h' output.png)
magick -size ${w}x${h} pattern:checkerboard output.png -compose over -composite output-checker.png
magick output.png -background white -alpha remove -alpha off output-white.jpg
```

Create a contact sheet:

```bash
magick montage out/*-checker.png -geometry 280x280+12+12 -tile 4x contact-sheet.png
```

## Troubleshooting

- If transparency is missing, ensure `--format png` or `--format webp`; JPG flattens alpha.
- If internal foreground detail becomes semi-transparent, inspect alpha previews and consider a different model/API/manual edit.
- If a URL fails, download it first and normalize the local file.
- If model downloads are flaky, use a task-local `HF_HOME`, disable Xet, or pass explicit ONNX paths.
- If batch output names keep source extensions, force output paths in Python or use CLI `--format png`.
