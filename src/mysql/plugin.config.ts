import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "mysql",
  version: "0.11.2",
  description: "Enables AI to execute SQL queries against MySQL databases via Node.js scripts with multi-database connection support.",
  author: { name: "Agent Plugins" },
  keywords: ["mysql", "sql", "database", "query", "mysql2", "node"],
  category: "Coding",
  interface: {
    displayName: "MySQL",
    shortDescription: "Enables AI to execute SQL queries against MySQL databases via Node.js scripts with multi-databa…",
    longDescription: "Enables AI to execute SQL queries against MySQL databases via Node.js scripts with multi-database connection support.",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  build: {
    entry: "src/mysql.ts",
    output: "dist/mysql.mjs",
  },
  surfaces: {
    skills: true,
    hooks: "native",
  },
  marketplace: {
    codex: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    claude: {
      description: "Enables AI to execute SQL queries against MySQL databases via Node.js with multi-connection support for cross-database analysis.",
    },
  },
} satisfies PluginConfig;
