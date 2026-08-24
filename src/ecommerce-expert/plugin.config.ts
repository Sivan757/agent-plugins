import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "ecommerce-expert",
  version: "1.1.0",
  description: "E-commerce platform API knowledge base — SHEIN (173 endpoints) and Temu with full parameter specs, signing algorithms, integration patterns, and offline Temu OpenAPI mirrors (209 endpoint docs, 23 developer guides)",
  author: { name: "Agent Plugins" },
  keywords: ["ecommerce", "shein", "temu", "openapi", "api-reference"],
  category: "Coding",
  interface: {
    displayName: "E-commerce Expert",
    shortDescription: "E-commerce platform API knowledge base — SHEIN (173 endpoints) and Temu with fu…",
    longDescription: "E-commerce platform API knowledge base — SHEIN (173 endpoints) and Temu with full parameter specs, signing algorithms, integration patterns, and offline Temu OpenAPI mirrors (209 endpoint docs, 23 developer guides). Ships four skills: shein-api-expert, temu-api-expert (curated English references), temu-api (adapter workflow plus the offline endpoint mirror), and temu-dev (developer-doc capture workflow plus the developer-guide mirror).",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  surfaces: {
    skills: true,
  },
  marketplace: {
    claude: {
      description: "E-commerce platform API knowledge base — SHEIN (173 endpoints) and Temu with full parameter specs, signing algorithms, integration patterns, and offline Temu OpenAPI mirrors (209 endpoint docs, 23 developer guides)",
    },
  },
} satisfies PluginConfig;
