import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "dsh-agent-notes",
  version: "0.2.0",
  description: "Archive DeepSeek Harness Agent Notes. Use when adding, auditing, pruning, archiving, restoring, or reviewing Agent Notes in a deepseek-harness checkout.",
  author: { name: "Agent Plugins" },
  category: "Productivity",
  surfaces: {
    skills: true,
  },
} satisfies PluginConfig;
