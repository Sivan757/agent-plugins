---
name: design
description: "UI/UX 设计域的技能入口。覆盖28个主题：accessibility、accessibility-compliance、antfu-design、anti-ui-slop、draw-io-diagram-generator、drawio、drawio-logical-diagrams、excalidraw-diagram-generator、image-annotations、interaction-design 等。当任务落在UI/UX 设计范围内时先读本文件，再按下方路由表只读需要的那一篇——不要一次读完整个 references。适用场景：让界面在视觉与交互上成立，并能被工程无损实现。"
---

# UI/UX 设计（`design`）

**这个技能什么时候适用**：让界面在视觉与交互上成立，并能被工程无损实现。任务不属于本域时，先看文末的「跨域去哪看」。

## 怎么用这个技能（重要）

这是一个**入口**，不是手册。`references/` 下有 28 篇主题文档，**不要整目录读**。正确做法：

1. 按下面路由表的「什么时候读」列，挑出与本任务真正相关的那 1–3 篇；
2. 用 `Read` 读 `${CLAUDE_PLUGIN_ROOT}/skills/design/references/<主题>/guide.md`；
3. 那篇文档如果自带 `references/`、`assets/`、`scripts/`，按需再读；
4. 路由表没覆盖的问题，用 `Glob` 在 `references/` 里按关键词找。

## 路由表

| 主题 | 什么时候读它 |
| --- | --- |
| `accessibility` | Design, implement, and audit inclusive digital products using WCAG 2.2 Level AA. |
| `accessibility-compliance` | Implement WCAG 2.2 compliant interfaces with mobile accessibility, inclusive design patterns, and assistive technology … |
| `antfu-design` | antfu-style design conventions, broadened. |
| `anti-ui-slop` | Stop coding agents from shipping generic UI. |
| `draw-io-diagram-generator` | Use when creating, editing, or generating draw.io diagram files (.drawio, .drawio.svg, .drawio.png). |
| `drawio` | Generate draw.io diagrams as .drawio files and export to PNG/SVG/PDF with embedded XML |
| `drawio-logical-diagrams` | Creates professional logical flow diagrams and logical system architecture diagrams using draw.io XML format (.drawio f… |
| `excalidraw-diagram-generator` | Generate Excalidraw diagrams from natural language descriptions. |
| `image-annotations` | Annotate screenshots, diagrams, and images with callout rectangles, arrows, labels, and color-coded highlights using PI… |
| `interaction-design` | Design and implement microinteractions, motion design, transitions, and user feedback patterns. |
| `liquid-glass-design` | iOS 26 Liquid Glass design system — dynamic glass material with blur, reflection, and interactive morphing for SwiftUI,… |
| `make-interfaces-feel-better` | Apply concrete design-engineering details that make interfaces feel polished. |
| `motion-advanced` | Advanced motion patterns for React / Next.js — drag & drop, gestures, text animations, SVG path drawing, custom hooks, … |
| `motion-foundations` | Motion tokens, spring presets, performance rules, device adaptation, accessibility enforcement, and SSR safety for Reac… |
| `motion-patterns` | Production-ready animation patterns for React / Next.js — button, modal, toast, stagger, page transitions, exit animati… |
| `penpot-uiux-design` | Comprehensive guide for creating professional UI/UX designs in Penpot using MCP tools. |
| `plantuml-ascii` | Generate ASCII art diagrams using PlantUML text mode. |
| `responsive-design` | Implement modern responsive layouts using container queries, fluid typography, CSS Grid, and mobile-first breakpoint st… |
| `screen-reader-testing` | Test web applications with screen readers including VoiceOver, NVDA, and JAWS. |
| `system` | Use this skill to generate or audit design systems, check visual consistency, and review PRs that touch styling. |
| `system-patterns` | Build scalable design systems with design tokens, theming infrastructure, and component architecture patterns. |
| `taste` | A creative-direction (taste) layer for music videos and short-form edits in the angelcore / cloud-trance / hyperpop vis… |
| `taste-application` | Generate new video against a distilled style pack and cut it into a finished piece - plan takes from the reference's cu… |
| `taste-distillation` | Measure a set of reference videos into a reusable style pack - colour grade as a 3D LUT, cut rhythm as a shot-length di… |
| `visual-design-foundations` | Apply typography, color theory, spacing systems, and iconography principles to create cohesive visual designs. |
| `wcag-audit-patterns` | Conduct WCAG 2.2 accessibility audits with automated testing, manual verification, and remediation guidance. |
| `web-design-guidelines` | Review UI code for Web Interface Guidelines compliance. |
| `web-design-reviewer` | This skill enables visual inspection of websites running locally or remotely to identify and fix design issues. |

## 本域的硬要求

- 间距/颜色/字号一律走 token 档位，不出现裸 hex 与非档位像素
- 可访问性按 WCAG 检查对比度、焦点、语义标签
- 设计结论要能落到具体组件与属性上，不停留在形容词

## 交付物形态

- 设计系统与 token 定义
- 组件规范
- 页面视觉方向
- 响应式与 a11y 检查清单
