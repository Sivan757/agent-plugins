import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "magick",
  version: "0.2.0",
  description:
    "Image workflows for conversion, resizing, compression, normalization, clothing mockup overlays, watermarks, labels, contact sheets, chroma-key transparency and print cutouts, metadata, visual QA, and PDF/SVG rasterization with ImageMagick; local super-resolution and clarity enhancement with Real-ESRGAN; and AI background removal with withoutbg for transparent PNG/WebP assets — each verified so alpha, DPI metadata, and canvas placement survive the pipeline.",
  author: { name: "Agent Plugins" },
  keywords: [
    "image",
    "imagemagick",
    "magick",
    "real-esrgan",
    "upscale",
    "super-resolution",
    "withoutbg",
    "background-removal",
    "transparent-png",
    "mockup",
    "batch",
  ],
} satisfies PluginConfig;
