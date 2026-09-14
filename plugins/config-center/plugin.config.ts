import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "config-center",
  version: "0.2.0",
  description:
    "Local configuration center for managing plugin credentials and environment state. Agent-facing reads are redacted; modifications require the HTML UI.",
  author: { name: "Agent Plugins" },
  keywords: ["config", "credentials", "secrets", "env", "management"],
} satisfies PluginConfig;
