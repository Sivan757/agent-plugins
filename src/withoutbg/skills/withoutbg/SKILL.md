---
name: withoutbg
description: Run and verify withoutbg AI background-removal workflows for local or API-based image cutouts. Use when the user needs to remove image backgrounds, create transparent PNG or WebP assets, batch-process product photos, people, apparel, stickers, ecommerce images, social images, or compare cutout quality; also use for alpha-channel validation, checkerboard previews, mask-style QA, and complex foreground/background workflow decomposition.
---

# withoutbg

Use this skill to build practical `withoutbg` workflows for AI background removal. Prefer transparent PNG output unless the user explicitly asks to flatten the result. For commercial or batch work, treat the task as a reproducible image pipeline: inspect inputs, normalize them, run background removal, verify alpha, generate previews, and record the exact command/model path.

Primary references:

- withoutbg GitHub: https://github.com/withoutbg/withoutbg
- withoutbg model files: https://huggingface.co/withoutbg/focus
- Pillow image modes: https://pillow.readthedocs.io/en/stable/handbook/concepts.html#modes

## Route By Task

Load only the reference needed for the current task:

- Common commands: see [references/common-commands.md](references/common-commands.md) for installation, single image runs, batch runs, API mode, Python API usage, model-cache handling, alpha verification, checkerboard previews, and troubleshooting.
- Complex workflows: see [references/complex-workflows.md](references/complex-workflows.md) for ecommerce/product pipelines, local-vs-API decisions, quality evaluation, post-processing, comparison tests, and structured task decomposition.

## Standard Workflow

1. Inspect the inputs before running a model:

```bash
magick identify -format 'format=%m size=%wx%h channels=%[channels] colorspace=%[colorspace]\n' input.png
```

2. Normalize awkward sources when needed. Download remote URLs first, then convert AVIF/HEIC/WebP/TIFF to a predictable local PNG or high-quality JPEG input.

3. Run `withoutbg` with PNG output when transparency is required:

```bash
withoutbg input.jpg --output output.png --format png --verbose
```

4. Verify the result has a real alpha channel:

```bash
magick identify -format 'format=%m size=%wx%h channels=%[channels]\n' output.png
magick output.png -alpha extract -format 'alpha_min=%[fx:minima] alpha_max=%[fx:maxima]\n' info:
```

`channels=srgba` and `alpha_min=0` indicate transparent pixels exist. If alpha is required, do not accept JPG output; JPEG cannot preserve transparency.

5. Generate visual previews for QA:

```bash
read w h < <(magick identify -format '%w %h' output.png)
magick -size ${w}x${h} pattern:checkerboard output.png -compose over -composite output-checker.png
magick output.png -background white -alpha remove -alpha off output-white.jpg
```

## Complex Background-Removal Workflow

For ecommerce, apparel, social, or batch cutout requests, do not start by asking "what is the one command?" Start with a structured decomposition, then turn it into a verifiable image pipeline.

Use this reasoning frame:

1. Define the output: transparent or flattened, PNG/WebP/JPEG, canvas size, crop policy, padding, shadow policy, color profile, naming scheme, and delivery folder.
2. Inventory inputs: file paths or URLs, dimensions, formats, EXIF orientation, existing alpha, foreground classes, edge difficulty, text/logos, shadows, and whether the source is a mockup or a product photo.
3. Choose processing mode: local open-source model for privacy/free batch work; API mode only when the user provides credentials or explicitly wants Pro quality.
4. Normalize inputs: convert unsupported or fragile formats to local sRGB PNG/JPEG, preserve originals, and avoid in-place overwrites.
5. Run the model: initialize the model once for batch Python workflows; use CLI for simple one-off jobs.
6. Post-process only after inspecting the alpha: trim, pad, resize, defringe, flatten, or compose with backgrounds using ImageMagick when the output spec requires it.
7. Verify outputs: check dimensions, alpha min/max, file sizes, visual previews on checker/white/dark backgrounds, and spot-check hard cases.
8. Package results: provide output paths, comparison previews, logs, and a clear note about model/API mode and any failed or questionable files.

Example MECE issue tree for a product cutout batch:

```text
1. Deliverable
   - transparent PNGs
   - 2000x2000 canvas with 8% padding
   - keep natural product shadow only if it survives cleanly

2. Inputs
   - local folder plus remote product URLs
   - mixed PNG/JPEG/AVIF
   - product photos, apparel mockups, and sticker-style graphics

3. Model run
   - local withoutbg open-source model
   - shared cache/model path
   - batch processing with one model instance

4. Post-process
   - trim transparent border
   - center on output canvas
   - create checkerboard QA preview

5. Validation
   - confirm RGBA/srgba
   - confirm alpha has both 0 and nonzero values
   - review hard cases manually
```

## Boundary Rules

Use `withoutbg` when:

- The task is semantic background removal for photos, products, people, apparel, stickers, or mixed ecommerce images.
- The output needs an alpha channel and model-based foreground separation.
- The workflow benefits from local processing or from withoutBG Pro when the user explicitly supplies API credentials.

Use ImageMagick around `withoutbg` when:

- The task needs deterministic conversion, alpha checks, trimming, padding, resizing, checkerboard previews, flattening, or contact sheets.
- The input is AVIF/HEIC/TIFF or a remote URL that should be normalized before model inference.

Consider another model or manual editing when:

- The foreground has severe transparency, glass, smoke, hair, very low contrast, or text/ink strokes that the model damages.
- The user needs precise human art direction, layer-aware PSD edits, vector reconstruction, or a guaranteed commercial mask.
- The result is for final production and automated QA shows lost foreground detail or unwanted semi-transparency.

## Credential Management

This plugin is a **reference for the withoutbg CLI**. It documents local and
API-based background-removal workflows; it does not run withoutbg itself.

For API mode, manage your `WITHOUTBG_API_KEY` with the **config-center** plugin,
not stored in this skill:

- Set or change it: run `config-center edit withoutbg` (opens a browser UI; the
  value is entered by you, never by the agent).
- Confirm it is configured: run `config-center get withoutbg` (output is always
  redacted - you see only whether the key is set, never its plaintext).

When your integration uses API mode, read the credential value from
config-center's store at runtime. **Never** read, `cat`, or `Read` the
cache file directly, and never print the cache path.

## Safety Notes

- Do not overwrite originals. Write to a new output directory.
- Keep secrets out of commands, logs, and saved files. Prefer `WITHOUTBG_API_KEY` for API mode.
- Use PNG for transparency-sensitive work. JPG output from the CLI flattens alpha onto a white background.
- For batch work, reuse a single model object or a single CLI batch invocation; loading the local models once is much faster than per-image invocations.
- If Hugging Face downloads fail, retry with `HF_HUB_DISABLE_XET=1`, set `HF_HOME` to a task-local cache, or download the ONNX model files once and pass paths through environment variables.
