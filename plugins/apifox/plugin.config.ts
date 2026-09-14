import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "apifox",
  version: "1.1.0",
  description:
    "Apifox CLI skills for delivering a set of APIs end to end and for managing API projects: design endpoints and schemas, configure environments and mocks, create and run interface test cases/scenarios/suites, export or publish docs, and land the change through branch collaboration. Use when the user asks to manage Apifox project resources (endpoints, environments, schemas, mocks, branches), run test cases/scenarios/suites via the apifox CLI, import or export OpenAPI/Postman/Apifox-native formats, or debug apifox CLI behavior.",
  author: { name: "Agent Plugins" },
  keywords: ["apifox", "api", "cli", "api-testing", "test-automation", "openapi", "postman", "branch", "ci"],
} satisfies PluginConfig;
