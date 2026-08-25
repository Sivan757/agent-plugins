import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "hallmark",
  version: "1.1.0",
  description:
    "Anti-AI-slop design skill for greenfield pages, audits, redesigns, and design extraction from URLs or screenshots. Use when the user asks to build a new app or landing page, wants to redesign something, invokes Hallmark by name, or uses audit/redesign/study.",
  author: { name: "Agent Plugins" },
  keywords: [
    "design",
    "ui",
    "anti-ai-slop",
    "typography",
    "oklch",
    "landing-page",
    "audit",
    "redesign",
  ],
  category: "Coding",
  interface: {
    displayName: "hallmark",
    shortDescription:
      "Anti-AI-slop design skill for greenfield pages, audits, redesigns, and design extraction from URLs or screenshots.",
    longDescription:
      "Ported from nutlope/hallmark (MIT). Hallmark picks a macrostructure for the brief, dresses it in one of twenty-one themes, runs fifty-seven slop-test gates plus a pre-emit self-critique, and refuses the on-distribution defaults every LLM was trained into. Four verbs: default build, audit (punch list, no edits), redesign (new visual fingerprint, preserved copy/IA/brand), and study (extract design DNA from a screenshot or URL).",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  surfaces: {
    skills: true,
  },
  marketplace: {
    claude: {
      description:
        "Anti-AI-slop design skill for greenfield pages, audits, redesigns, and design extraction from URLs or screenshots. Use when the user asks to build a new app or landing page, wants to redesign something, invokes Hallmark by name, or uses audit/redesign/study.",
    },
  },
} satisfies PluginConfig;
