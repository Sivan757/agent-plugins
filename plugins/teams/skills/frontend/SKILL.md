---
name: frontend
description: "前端工程域的技能入口。覆盖22个主题：a11y、design-direction、javascript-testing-patterns、modern-javascript-patterns、monorepo-management、patterns、pinia、pnpm、premium-frontend-ui、typescript-advanced-types 等。当任务落在前端工程范围内时先读本文件，再按下方路由表只读需要的那一篇——不要一次读完整个 references。适用场景：在既定前端栈上交付可构建、可验证、符合项目约定的界面代码。"
---

# 前端工程（`frontend`）

**这个技能什么时候适用**：在既定前端栈上交付可构建、可验证、符合项目约定的界面代码。任务不属于本域时，先看文末的「跨域去哪看」。

## 怎么用这个技能（重要）

这是一个**入口**，不是手册。`references/` 下有 22 篇主题文档，**不要整目录读**。正确做法：

1. 按下面路由表的「什么时候读」列，挑出与本任务真正相关的那 1–3 篇；
2. 用 `Read` 读 `${CLAUDE_PLUGIN_ROOT}/skills/frontend/references/<主题>/guide.md`；
3. 那篇文档如果自带 `references/`、`assets/`、`scripts/`，按需再读；
4. 路由表没覆盖的问题，用 `Glob` 在 `references/` 里按关键词找。

## 路由表

| 主题 | 什么时候读它 |
| --- | --- |
| `a11y` | > |
| `design-direction` | Set an ECC-specific frontend design direction for production UI work. |
| `javascript-testing-patterns` | Implement comprehensive testing strategies using Jest, Vitest, and Testing Library for unit tests, integration tests, a… |
| `modern-javascript-patterns` | Master ES6+ features including async/await, destructuring, spread operators, arrow functions, promises, modules, iterat… |
| `monorepo-management` | Master monorepo management with Turborepo, Nx, and pnpm workspaces to build efficient, scalable multi-package repositor… |
| `patterns` | Frontend development patterns for React, Next.js, state management, performance optimization, and UI best practices. |
| `pinia` | Pinia official Vue state management library, type-safe and extensible. |
| `pnpm` | Node.js package manager with strict dependency resolution. |
| `premium-frontend-ui` | A comprehensive guide for GitHub Copilot to craft immersive, high-performance web experiences with advanced motion, typ… |
| `typescript-advanced-types` | Master TypeScript's advanced type system including generics, conditional types, mapped types, template literals, and ut… |
| `typescript-docs` | Generates comprehensive TypeScript documentation using JSDoc, TypeDoc, and multi-layered documentation patterns for dif… |
| `ui-engineering` | Builds production-quality, accessible, responsive user-facing UIs. |
| `ui-to-vue` | Use when the user has UI screenshots or design exports that need batch conversion into Vue 3 components, especially wit… |
| `unocss` | UnoCSS instant atomic CSS engine, superset of Tailwind CSS. |
| `vite` | Vite build tool configuration, plugin API, SSR, and Vite 8 Rolldown migration. |
| `vite-patterns` | Vite build tool patterns including config, plugins, HMR, env variables, proxy setup, SSR, library mode, dependency pre-… |
| `vue` | Vue 3 Composition API, script setup macros, reactivity system, and built-in components. |
| `vue-best-practices` | MUST be used for Vue.js tasks. |
| `vue-patterns` | Vue.js 3 Composition API patterns, component architecture, reactivity best practices, Pinia state management, Vue Route… |
| `vue-router-best-practices` | Vue Router 4 patterns, navigation guards, route params, and route-component lifecycle interactions. |
| `vue-testing-best-practices` | Use for Vue.js testing. |
| `vueuse-functions` | Apply VueUse composables where appropriate to build concise, maintainable Vue.js / Nuxt features. |

## 本域的硬要求

- 改完必须跑真实构建与类型检查，并对照基线说明错误数变化
- 目录与命名跟随项目既有约定，不新造一套
- 引用第三方组件库时要读它的真实行为，不按直觉写（例如带自己 loading 契约的列表组件）

## 交付物形态

- 页面/组件实现
- store 与 api 层
- 构建与类型验证结果
