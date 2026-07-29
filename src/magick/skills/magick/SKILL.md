---
name: magick
description: Generate, execute, and verify ImageMagick `magick`, `mogrify`, `identify`, `compare`, `composite`, and `montage` workflows for image conversion, resizing, compression, normalization, clothing mockup overlays, watermarks, labels, contact sheets, chroma-key transparency and print cutouts, metadata, visual QA, PDF/SVG rasterization, and delegate/format troubleshooting.
---

# Magick

Use this skill to build practical ImageMagick workflows for bitmap and rasterized image processing. Prefer small, verified command sequences over one fragile command when the task requires composition, mockups, normalization, or quality checks.

Official docs:

- ImageMagick home: https://imagemagick.org/
- Command-line tools: https://imagemagick.org/script/command-line-tools.php
- Command-line options: https://imagemagick.org/script/command-line-options.php
- Supported formats: https://imagemagick.org/script/formats.php
- Defines and format-specific options: https://imagemagick.org/script/defines.php
- Color management: https://imagemagick.org/script/color-management.php
- Security policy: https://imagemagick.org/script/security-policy.php
- Examples and usage patterns: https://imagemagick.org/Usage/

ImageMagick is image-first. If a video or audio task is not covered here, check the official docs for the relevant coder/delegate behavior, then consider whether the goal belongs in ImageMagick as image-sequence/frame processing or in FFmpeg for native video/audio streams.

## Route By Task

Load only the reference needed for the current task:

- Common commands: see [references/common-commands.md](references/common-commands.md) for conversion, resizing, compression, normalization, watermarks, labels, montage, transparency, metadata, PDF/SVG rasterization, comparison, and validation.
- Complex workflows: see [references/complex-workflows.md](references/complex-workflows.md) for clothing print overlays, chroma-key print cutouts, multi-pass pipelines, visual previews, and troubleshooting.

## Standard Workflow

1. Inspect the environment and inputs first:

```bash
magick -version
magick identify -verbose input.png
magick identify -format 'format=%m size=%wx%h channels=%[channels] colorspace=%[colorspace] bytes=%b\n' input.png
```

2. Check delegate support before assuming a format works:

```bash
magick -list format | rg 'WEBP|AVIF|HEIC|PDF|SVG|JXL'
magick -list configure | rg 'DELEGATES|FEATURES'
```

3. Write to a new path by default. Use `mogrify` only when the user wants in-place batch modification or when `-path out/` is provided.

4. Use the extension to select the output format, and add format-specific options only when needed:

```bash
magick input.jpg -auto-orient -strip -quality 85 output.webp
```

5. Verify outputs:

```bash
test -s output.png
magick identify -format 'format=%m size=%wx%h channels=%[channels] colorspace=%[colorspace] bytes=%b\n' output.png
```

Check dimensions, alpha channel, colorspace, metadata/profile policy, file size, and visual result. For transparency work, generate a checkerboard or white-background preview.

## Complex Image Workflow

For commercial, ecommerce, apparel, social, or print-composition requests, decompose the work into a reproducible image pipeline:

1. Define the target: output format, canvas size, background, alpha policy, assets to place, compression, and delivery constraints.
2. Inventory inputs: dimensions, alpha, color space, profiles, EXIF orientation, frame/page count, logo/print assets, and whether source layers still exist.
3. Choose the image-processing strategy:
   - Existing alpha: preserve, flatten, or place it according to the requested output.
   - Product or social canvas: resize, crop, pad, center, and fill backgrounds explicitly.
   - Clothing mockups: prefer the original print PNG and compose it onto the blank garment.
   - Generated print cutouts: prefer planned chroma-key backgrounds and threshold masks over semantic AI background removal.
   - Text, logos, and badges: use explicit geometry, gravity, opacity, and output previews.
4. Split into verifiable passes: probe -> normalize/compose -> preview -> final export -> verify.
5. Generate previews while iterating:

```bash
magick -size 1000x1000 pattern:checkerboard checker.png
magick checker.png composed.png -compose over -composite composed-preview.png
magick composed.png -background white -alpha remove -alpha off composed-white-preview.jpg
```

6. Keep intermediate normalized assets and placement proofs when quality matters. They are useful for diagnosing scale, alignment, opacity, color, and export issues.

## Boundary Rules

Use ImageMagick when:

- The operation is deterministic image processing: conversion, resizing, compression, normalization, annotation, composition, alpha handling, montage, comparison, or rasterization.
- The task can be verified with `identify`, `compare`, generated previews, and visual spot checks.
- The workflow is batch-oriented and should be repeatable.

Use another tool when:

- The request depends on semantic foreground selection: people, products, garments, hair, glass, shadows, complex backgrounds, or recovering a print from a flattened photo.
- The work requires manual retouching, layer-aware PSD editing, deformation-aware garment mockups, advanced vector editing, or subjective design iteration.
- The task is primarily audio/video stream editing rather than image-frame processing.

## Safety Notes

- Do not overwrite originals unless explicitly requested.
- Quote paths that contain spaces.
- Parentheses must be escaped or quoted in shells: `\( ... \)`.
- Preserve source layers when possible. For clothing mockups, prefer the original print PNG over reverse-extracting the print from a flattened mockup.
- Validate visual results for overlays, transparency, and rasterized assets. Text-only stats cannot tell whether placement, scale, edges, or fine lines look correct.
