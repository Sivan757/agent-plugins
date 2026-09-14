---
name: analytics
description: "数据分析域的技能入口。覆盖9个主题：ab-test-analysis、benchmark、benchmark-methodology、click-path-audit、cohort-analysis、dashboard-builder、data-storytelling、kpi-dashboard-design、metrics-dashboard。当任务落在数据分析范围内时先读本文件，再按下方路由表只读需要的那一篇——不要一次读完整个 references。适用场景：把业务问题转成有明确口径、可复算、可被质疑的指标。"
---

# 数据分析（`analytics`）

**这个技能什么时候适用**：把业务问题转成有明确口径、可复算、可被质疑的指标。任务不属于本域时，先看文末的「跨域去哪看」。

## 怎么用这个技能（重要）

这是一个**入口**，不是手册。`references/` 下有 9 篇主题文档，**不要整目录读**。正确做法：

1. 按下面路由表的「什么时候读」列，挑出与本任务真正相关的那 1–3 篇；
2. 用 `Read` 读 `${CLAUDE_PLUGIN_ROOT}/skills/analytics/references/<主题>/guide.md`；
3. 那篇文档如果自带 `references/`、`assets/`、`scripts/`，按需再读；
4. 路由表没覆盖的问题，用 `Glob` 在 `references/` 里按关键词找。

## 路由表

| 主题 | 什么时候读它 |
| --- | --- |
| `ab-test-analysis` | Analyze A/B test results with statistical significance, sample size validation, confidence intervals, and ship/extend/s… |
| `benchmark` | Use this skill to measure performance baselines, detect regressions before/after PRs, and compare stack alternatives. |
| `benchmark-methodology` | Use after competitive-platform-analysis has produced a tiered competitor set. |
| `click-path-audit` | Trace every user-facing button/touchpoint through its full state change sequence to find bugs where functions individua… |
| `cohort-analysis` | Perform cohort analysis on user engagement data — retention curves, feature adoption trends, and segment-level insights. |
| `dashboard-builder` | Build monitoring dashboards that answer real operator questions for Grafana, SigNoz, and similar platforms. |
| `data-storytelling` | Transform data into compelling narratives using visualization, context, and persuasive structure. |
| `kpi-dashboard-design` | Design effective KPI dashboards with metrics selection, visualization best practices, and real-time monitoring patterns. |
| `metrics-dashboard` | Define and design a product metrics dashboard with key metrics, data sources, visualization types, and alert thresholds. |

## 本域的硬要求

- 分子分母、时间窗口、去重键、排除条件四项缺一不可，且要写明为什么这么选
- 列出至少两个口径歧义点与你的取舍，不要假装只有一个答案
- SQL 要真的执行过或至少静态核对过；不能执行的要说清为什么

## 交付物形态

- 指标定义（分子/分母/窗口/排除）
- 取数 SQL
- 校验与对账脚本
- 看板结构
