import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "ecommerce-expert",
  version: "1.0.1",
  description: "E-commerce platform API knowledge base — SHEIN (173 endpoints) and Temu (124 endpoints) with full parameter specs, signing algorithms, and integration patterns",
  author: { name: "Agent Plugins" },
  category: "Coding",
  interface: {
    displayName: "E-commerce Expert",
    shortDescription: "E-commerce platform API knowledge base — SHEIN (173 endpoints) and Temu (124 endpoints) with fu…",
    longDescription: "E-commerce platform API knowledge base — SHEIN (173 endpoints) and Temu (124 endpoints) with full parameter specs, signing algorithms, and integration patterns",
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
      description: "E-commerce platform API knowledge base — SHEIN (173 endpoints) and Temu (124 endpoints) with full parameter specs, signing algorithms, and integration patterns",
    },
  },
} satisfies PluginConfig;
