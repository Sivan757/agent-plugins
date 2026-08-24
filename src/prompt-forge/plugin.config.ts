import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "prompt-forge",
  version: "0.1.1",
  description:
    "Image-generation prompt engineering library with a local SQLite database of 25k+ prompts across 12 sources. Use when the user needs to search, classify, template, evaluate, or manage image generation prompts, or when synthesizing a new prompt from retrieved examples. Ships a `pf` CLI backed by node:sqlite with FTS5 search, dedup, ratings, image links, and a minimal stats server.",
  author: { name: "Agent Plugins" },
  keywords: ["prompts", "image-generation", "sqlite", "rag", "prompt-engineering"],
  category: "Coding",
  interface: {
    displayName: "prompt-forge",
    shortDescription:
      "Image-generation prompt library (25k+ prompts) with search, dedup, ratings, and RAG synthesize workflow.",
    longDescription:
      "Image-generation prompt engineering library with a local SQLite database of 25k+ prompts across 12 sources. Use when the user needs to search, classify, template, evaluate, or manage image generation prompts, or when synthesizing a new prompt from retrieved examples. Ships a `pf` CLI backed by node:sqlite with FTS5 search, dedup, ratings, image links, and a minimal stats server.",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  build: {
    entry: "src/prompt-forge.ts",
    output: "dist/prompt-forge.mjs",
  },
  surfaces: {
    skills: true,
  },
  marketplace: {
  },
} satisfies PluginConfig;
