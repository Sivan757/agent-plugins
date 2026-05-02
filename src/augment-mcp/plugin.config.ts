import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "augment-mcp",
  version: "0.1.2",
  description: "Integrates Augment Context Engine MCP server for semantic codebase search and retrieval. Requires auggie login for authentication.",
  author: { name: "Agent Plugins" },
  keywords: ["augment", "mcp", "codebase", "semantic-search", "context-engine"],
  category: "Coding",
  interface: {
    displayName: "Augment MCP",
    shortDescription: "Integrates Augment Context Engine MCP server for semantic codebase search and retrieval. Requir…",
    longDescription: "Integrates Augment Context Engine MCP server for semantic codebase search and retrieval. Requires auggie login for authentication.",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  surfaces: {
    hooks: "native",
    mcp: true,
  },
  marketplace: {
    codex: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    claude: {
      description: "Integrates Augment Context Engine MCP server for semantic codebase search and retrieval across repositories.",
    },
  },
} satisfies PluginConfig;
