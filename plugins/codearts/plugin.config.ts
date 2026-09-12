import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "codearts",
  version: "0.1.0",
  description:
    "Drive Huawei Cloud CodeArts from the local `codearts` CLI — compilation build, code check, wiki, board, deploy, artifact, repo, and pipeline — with AK/SK or token auth and a generated catalog covering every documented API operation.",
  author: { name: "Agent Plugins" },
  keywords: [
    "huawei",
    "huaweicloud",
    "codearts",
    "devops",
    "ci",
    "cd",
    "pipeline",
    "build",
    "repo",
    "deploy",
    "artifact",
  ],
  marketplace: {
    description:
      "Run Huawei Cloud CodeArts pipelines, builds, code checks, deploys, artifact repositories and code repos from the local codearts CLI, covering the development-to-operations chain end to end.",
  },
} satisfies PluginConfig;
