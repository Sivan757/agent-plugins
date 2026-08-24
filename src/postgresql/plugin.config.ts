import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "postgresql",
  version: "0.6.1",
  description: "Enables AI to execute SQL queries against PostgreSQL databases via Node.js scripts with multi-database connection support.",
  author: { name: "Agent Plugins" },
  keywords: ["postgresql", "sql", "database", "query", "pg", "node"],
  category: "Coding",
  interface: {
    displayName: "PostgreSQL",
    shortDescription: "Enables AI to execute SQL queries against PostgreSQL databases via Node.js scripts with multi-d…",
    longDescription: "Enables AI to execute SQL queries against PostgreSQL databases via Node.js scripts with multi-database connection support.",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  build: {
    entry: "src/postgresql.ts",
    output: "dist/postgresql.mjs",
  },
  surfaces: {
    skills: true,
  },
  marketplace: {
    claude: {
      description: "Enables AI to execute SQL queries against PostgreSQL databases via Node.js with multi-connection support for schema inspection and discovery.",
    },
  },
} satisfies PluginConfig;
