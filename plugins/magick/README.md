# Magick

Image processing workflows — three skills, one plugin. Each skill drives one tool and verifies the
result with ImageMagick, so a pipeline can move between them without losing alpha, DPI metadata, or
canvas placement.

## Skills

### magick

ImageMagick `magick`, `mogrify`, `identify`, `compare`, `composite`, and `montage` workflows —
conversion, resizing, compression, normalization, clothing mockup overlays, watermarks, labels,
contact sheets, chroma-key transparency and print cutouts, metadata, visual QA, PDF/SVG
rasterization, and delegate/format troubleshooting.

### real-esrgan

Local Real-ESRGAN super-resolution and clarity enhancement via `realesrgan-ncnn-vulkan` for raster
images, transparent cutouts, print-ready PNG artwork, product/social/ecommerce images, AI-generated
images, and batch folders.

### withoutbg

AI background removal, local or API-based — transparent PNG/WebP assets, batch product photos,
people, apparel, stickers, plus alpha-channel validation, checkerboard previews, and mask-style QA.

## Structure

```
plugins/magick/
├── plugin.config.ts
└── skills/
    ├── magick/       # ImageMagick
    ├── real-esrgan/  # super-resolution
    └── withoutbg/    # background removal
```

## Choosing A Skill

Use `magick` for deterministic geometry, color, metadata, and compositing work. Reach for
`real-esrgan` only when the content needs synthesized detail — not for pure DPI changes, pixel art,
QR codes, masks, or hard-edged technical graphics. Use `withoutbg` to produce the cutout, then
`magick` to place, resize, and export it.
