import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "teams",
  version: "0.3.0",
  description:
    "Team skill library organised by technical domain. Nine domain agents (product, design, frontend, backend, data, api, test, ops, analytics) each read their own domain skill, which routes to the specific topic document that answers the question — so only the relevant knowledge enters context. Topics cover Vue 3 / Vite, Java 17 / Spring Boot / Spring Cloud / Dubbo / Nacos / Sa-Token, MyBatis-Plus / SQL / Liquibase, OpenAPI contracts, JUnit 5 / Vitest / Playwright, Docker / Kubernetes / CI-CD / Git workflow, plus product, design and analytics practice. Every topic document is either ported verbatim from a pinned upstream commit or authored from official framework documentation; provenance/sources.json records which.",
  author: { name: "Agent Plugins" },
  keywords: [
    "teams",
    "vue",
    "vite",
    "pinia",
    "typescript",
    "java",
    "spring-boot",
    "spring-cloud",
    "dubbo",
    "nacos",
    "sa-token",
    "mybatis-plus",
    "liquibase",
    "ruoyi",
    "openapi",
    "junit5",
    "vitest",
    "playwright",
    "docker",
    "kubernetes",
    "helm",
    "ci-cd",
    "git",
    "worktree",
    "observability",
    "prd",
    "testing",
  ],
  marketplace: {
    description:
      "Nine domain agents (product, design, frontend, backend, data, api, test, ops, analytics) backed by a domain-organised knowledge library: each agent reads its own domain skill, which routes to the one topic document that applies — keeping context small while preserving automatic triggering. Covers Vue 3 + Vite, Java 17 + Spring Boot + Dubbo + Nacos + Sa-Token, MyBatis-Plus + Liquibase, OpenAPI, JUnit 5 / Vitest / Playwright, Docker/Kubernetes, Git workflow, and product/design/analytics practice. Every document is traceable to a pinned upstream commit or to official framework documentation.",
  },
} satisfies PluginConfig;
