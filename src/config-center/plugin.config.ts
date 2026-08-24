import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "config-center",
  version: "0.1.1",
  description: "Local configuration center for managing plugin credentials and environment state. Agent-facing reads are redacted; modifications require the HTML UI.",
  author: { name: "Agent Plugins" },
  keywords: ["config", "credentials", "secrets", "env", "management"],
  category: "Productivity",
  interface: {
    displayName: "Config Center",
    shortDescription: "Manage plugin credentials and env config",
    longDescription: "Local configuration center for managing plugin credentials and environment state.",
    developerName: "Agent Plugins",
    category: "Productivity",
  },
  build: {
    entry: "src/config-center.ts",
    output: "dist/config-center.mjs",
  },
  surfaces: {
    skills: true,
    hooks: "native",
  },
  marketplace: {
    codex: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
  },
} satisfies PluginConfig;
