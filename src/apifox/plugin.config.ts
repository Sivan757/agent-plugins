import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "apifox",
  version: "1.0.0",
  description:
    "Apifox CLI skills for managing API projects, running interface automation tests, importing/exporting API docs, and handling branch collaboration. Use when the user asks to manage Apifox project resources (endpoints, environments, schemas, mocks, branches), run test cases/scenarios/suites via the apifox CLI, import or export OpenAPI/Postman/Apifox-native formats, or debug apifox CLI behavior.",
  author: { name: "Agent Plugins" },
  keywords: [
    "apifox",
    "api",
    "cli",
    "api-testing",
    "test-automation",
    "openapi",
    "postman",
    "branch",
    "ci",
  ],
  category: "Productivity",
  interface: {
    displayName: "apifox",
    shortDescription:
      "Apifox CLI skills for managing API projects, running interface automation tests, importing/exporting API docs, and handling branch collaboration.",
    longDescription:
      "Port of the official apifox/apifox-cli-skills (8 SKILL.md files) into an Agent Plugins skill-only plugin. Provides a general apifox-cli entry plus domain skills for test-case, test-scenario, test-automation, branch collaboration, import/export with quality gates, CLI checkup, and the API-lifecycle workflow. The skills drive the apifox CLI through its --help / cli-schema validate / agentHints.nextSteps loop and never guess payloads from memory.",
    developerName: "Agent Plugins",
    category: "Productivity",
  },
  surfaces: {
    skills: true,
  },
  marketplace: {
    claude: {
      description:
        "Apifox CLI skills for managing API projects, running interface automation tests, importing/exporting API docs, and handling branch collaboration. Use when the user asks to manage Apifox project resources (endpoints, environments, schemas, mocks, branches), run test cases/scenarios/suites via the apifox CLI, import or export OpenAPI/Postman/Apifox-native formats, or debug apifox CLI behavior.",
    },
  },
} satisfies PluginConfig;
