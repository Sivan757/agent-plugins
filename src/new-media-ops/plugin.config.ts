import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "new-media-ops",
  version: "0.1.1",
  description: "Plans, drafts, formats, packages, and safely stages Chinese new-media content for WeChat Official Account, WeChat image-text posts, and Xiaohongshu.",
  author: { name: "Agent Plugins" },
  keywords: ["new-media", "wechat", "xiaohongshu", "markdown", "content", "drafts", "publishing"],
  category: "Productivity",
  interface: {
    displayName: "新媒体运营",
    shortDescription: "分析、撰写、排版并安全暂存微信公众号、微信贴图和小红书内容。",
    longDescription: "Provides an AI-guided new-media operations workflow with local CLI support for article analysis, draft packaging, WeChat-compatible Markdown formatting, WeChat draft API staging, and Xiaohongshu-ready draft packages. The MVP stages drafts only and never performs final publishing.",
    developerName: "Agent Plugins",
    category: "Productivity",
    capabilities: [
      "Article analysis",
      "Draft packaging",
      "WeChat Markdown formatting",
      "WeChat draft staging",
      "Xiaohongshu draft assets"
    ],
    defaultPrompt: [
      "分析这篇文章并给出新媒体选题方案。",
      "把这篇 Markdown 排版成微信公众号草稿。",
      "生成微信贴图/小绿书图文消息草稿包。",
      "生成小红书图文草稿包。"
    ],
  },
  build: {
    entry: "src/new-media-ops.ts",
    output: "dist/new-media-ops.mjs",
  },
  surfaces: {
    skills: true,
  },
  marketplace: {
    codex: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    claude: {
      description: "New-media operations workflow for analysis, writing, formatting, and draft-only staging on WeChat and Xiaohongshu.",
    },
  },
} satisfies PluginConfig;
