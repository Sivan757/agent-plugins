import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "prompt-enhancer",
  version: "0.1.0",
  description: "Enhances vague user prompts into clear, actionable prompts for development, debugging, review, architecture, and implementation work.",
  author: { name: "Agent Plugins" },
  keywords: ["prompt", "prompt-engineering", "clarification", "requirements", "development", "coding"],
  category: "Coding",
  interface: {
    displayName: "Prompt Enhancer",
    shortDescription: "Enhances vague user prompts into clear, actionable prompts for development work.",
    longDescription: "Enhances vague user prompts into clear, actionable prompts for development, debugging, review, architecture, and implementation work.",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  surfaces: {
    skills: true,
  },
  marketplace: {
    codex: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    claude: {
      description: "Enhances vague user prompts into clear, actionable prompts for development, debugging, review, architecture, and implementation work.",
    },
  },
} satisfies PluginConfig;
