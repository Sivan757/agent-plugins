import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "database",
  version: "0.2.0",
  description:
    "Enables AI to execute SQL against MySQL and PostgreSQL from one CLI. Every connection carries its engine, and the database is optional — describe a server once and choose the database per command. Query, discover schemas and databases, list columns, find where a table lives, trace foreign keys, and profile a table, with a guard that refuses write statements until the user confirms.",
  author: { name: "Agent Plugins" },
  keywords: ["database", "sql", "mysql", "postgresql", "query", "schema", "node"],
  marketplace: {
    description:
      "Execute SQL against MySQL and PostgreSQL from one CLI — each connection carries its engine, and the database is optional, so a connection can describe a server and let each command pick the database. Multi-connection support, database/schema discovery, column listing, table location search, foreign-key tracing, table profiling, and a guard on write statements.",
  },
} satisfies PluginConfig;
