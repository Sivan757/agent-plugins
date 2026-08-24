import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "real-esrgan",
  version: "0.1.0",
  description: "Local Real-ESRGAN image super-resolution and clarity workflows using realesrgan-ncnn-vulkan, Upscayl-adjacent outputs, and ImageMagick verification. Use when the user needs to upscale, enhance, or compare raster images, transparent cutouts, print-ready PNG artwork, product/social/ecommerce images, AI-generated images, or batch image folders while preserving alpha, DPI metadata, canvas placement, and reproducible quality checks.",
  author: { name: "Agent Plugins" },
  category: "Coding",
  interface: {
    displayName: "real-esrgan",
    shortDescription: "Local Real-ESRGAN image super-resolution and clarity workflows using realesrgan-ncnn-vulkan, Upscayl-adjacent outputs, and ImageMagick verification. Use when the user needs to upscale, enhance, or compare raster images, transparent cutouts, print-ready PNG artwork, product/social/ecommerce images, AI-generated images, or batch image folders while preserving alpha, DPI metadata, canvas placement, and reproducible quality checks.",
    longDescription: "Local Real-ESRGAN image super-resolution and clarity workflows using realesrgan-ncnn-vulkan, Upscayl-adjacent outputs, and ImageMagick verification. Use when the user needs to upscale, enhance, or compare raster images, transparent cutouts, print-ready PNG artwork, product/social/ecommerce images, AI-generated images, or batch image folders while preserving alpha, DPI metadata, canvas placement, and reproducible quality checks.",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  surfaces: {
    skills: true,
  },
  marketplace: {
    claude: {
      description: "Local Real-ESRGAN image super-resolution and clarity workflows using realesrgan-ncnn-vulkan, Upscayl-adjacent outputs, and ImageMagick verification. Use when the user needs to upscale, enhance, or compare raster images, transparent cutouts, print-ready PNG artwork, product/social/ecommerce images, AI-generated images, or batch image folders while preserving alpha, DPI metadata, canvas placement, and reproducible quality checks.",
    },
  },
} satisfies PluginConfig;
