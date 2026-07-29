import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "magick",
  version: "0.1.0",
  description: "Generate, execute, and verify ImageMagick magick, mogrify, identify, compare, composite, and montage workflows for image conversion, resizing, compression, normalization, clothing mockup overlays, watermarks, labels, contact sheets, chroma-key transparency and print cutouts, metadata, visual QA, PDF/SVG rasterization, and delegate/format troubleshooting.",
  author: { name: "Agent Plugins" },
  category: "Coding",
  interface: {
    displayName: "magick",
    shortDescription: "Generate, execute, and verify ImageMagick magick, mogrify, identify, compare, composite, and montage workflows for image conversion, resizing, compression, normalization, clothing mockup overlays, watermarks, labels, contact sheets, chroma-key transparency and print cutouts, metadata, visual QA, PDF/SVG rasterization, and delegate/format troubleshooting.",
    longDescription: "Generate, execute, and verify ImageMagick magick, mogrify, identify, compare, composite, and montage workflows for image conversion, resizing, compression, normalization, clothing mockup overlays, watermarks, labels, contact sheets, chroma-key transparency and print cutouts, metadata, visual QA, PDF/SVG rasterization, and delegate/format troubleshooting.",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  surfaces: {
    skills: true,
    hooks: "native",
  },
  marketplace: {
    codex: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    claude: {
      description: "Generate, execute, and verify ImageMagick magick, mogrify, identify, compare, composite, and montage workflows for image conversion, resizing, compression, normalization, clothing mockup overlays, watermarks, labels, contact sheets, chroma-key transparency and print cutouts, metadata, visual QA, PDF/SVG rasterization, and delegate/format troubleshooting.",
    },
  },
} satisfies PluginConfig;
