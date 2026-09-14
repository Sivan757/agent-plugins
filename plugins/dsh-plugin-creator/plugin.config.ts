import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "dsh-plugin-creator",
  version: "0.1.0",
  description:
    "Author, package, install, and debug DeepSeek Harness (dsh) plugins in a separate repository: plugin module shape, Config, cordis.yml composition, bundle packaging, dsh plugin add, and distribution traps",
  author: { name: "Agent Plugins" },
  keywords: [
    "dsh",
    "deepseek-harness",
    "cordis",
    "plugin",
    "bundle",
    "skill",
  ],
  marketplace: {
    description:
      "Author, package, install, and debug DeepSeek Harness (dsh) plugins from a separate repository. Covers the plugin module shape (apply / inject / Config), cordis.yml composition and patch overrides, bundle packaging (package.json dsh.bundle), dsh plugin add, tool / service / event registration, and git-install and distribution traps. Use when the user mentions a dsh plugin, DeepSeek Harness plugin, @deepseek-ai/dsh-*, cordis.yml, cordis.patch.yml, defineTool, dsh plugin add, or wants to build a dsh extension in their own repository.",
  },
} satisfies PluginConfig;
