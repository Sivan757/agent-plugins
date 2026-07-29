import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "withoutbg",
  version: "0.1.0",
  description: "Run and verify withoutbg AI background-removal workflows for local or API-based image cutouts. Use when the user needs to remove image backgrounds, create transparent PNG or WebP assets, batch-process product photos, people, apparel, stickers, ecommerce images, social images, or compare cutout quality; also use for alpha-channel validation, checkerboard previews, mask-style QA, and complex foreground/background workflow decomposition.",
  author: { name: "Agent Plugins" },
  category: "Coding",
  interface: {
    displayName: "withoutbg",
    shortDescription: "Run and verify withoutbg AI background-removal workflows for local or API-based image cutouts. Use when the user needs to remove image backgrounds, create transparent PNG or WebP assets, batch-process product photos, people, apparel, stickers, ecommerce images, social images, or compare cutout quality; also use for alpha-channel validation, checkerboard previews, mask-style QA, and complex foreground/background workflow decomposition.",
    longDescription: "Run and verify withoutbg AI background-removal workflows for local or API-based image cutouts. Use when the user needs to remove image backgrounds, create transparent PNG or WebP assets, batch-process product photos, people, apparel, stickers, ecommerce images, social images, or compare cutout quality; also use for alpha-channel validation, checkerboard previews, mask-style QA, and complex foreground/background workflow decomposition.",
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
      description: "Run and verify withoutbg AI background-removal workflows for local or API-based image cutouts. Use when the user needs to remove image backgrounds, create transparent PNG or WebP assets, batch-process product photos, people, apparel, stickers, ecommerce images, social images, or compare cutout quality; also use for alpha-channel validation, checkerboard previews, mask-style QA, and complex foreground/background workflow decomposition.",
    },
  },
} satisfies PluginConfig;
