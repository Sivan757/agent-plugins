import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "mysql",
  version: "0.12.1",
  description:
    "Enables AI to execute SQL queries against MySQL databases via Node.js scripts with multi-database connection support.",
  author: { name: "Agent Plugins" },
  keywords: ["mysql", "sql", "database", "query", "mysql2", "node"],
  marketplace: {
    description:
      "Enables AI to execute SQL queries against MySQL databases via Node.js with multi-connection support for cross-database analysis.",
  },
} satisfies PluginConfig;
