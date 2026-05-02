import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "aliyunlog",
  version: "1.6.2",
  description: "Enables AI to query Alibaba Cloud SLS (Log Service) logs via @alicloud/log Node.js SDK with environment and service-based quick lookup.",
  author: { name: "Agent Plugins" },
  keywords: ["aliyun", "sls", "log", "aliyunlog", "query", "k8s", "cloud"],
  category: "Coding",
  interface: {
    displayName: "Aliyun Log",
    shortDescription: "Enables AI to query Alibaba Cloud SLS (Log Service) logs via @alicloud/log Node.js SDK with env…",
    longDescription: "Enables AI to query Alibaba Cloud SLS (Log Service) logs via @alicloud/log Node.js SDK with environment and service-based quick lookup.",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  build: {
    entry: "src/aliyunlog.ts",
    output: "dist/aliyunlog.mjs",
  },
  surfaces: {
    skills: true,
    hooks: "native",
  },
  artifact: {
    include: ["dist/sls.proto"],
  },
  marketplace: {
    codex: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    claude: {
      description: "Enables AI to query Alibaba Cloud SLS (Log Service) logs via @alicloud/log Node.js SDK with environment and service-based quick lookup.",
    },
  },
} satisfies PluginConfig;
