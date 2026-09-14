---
name: ops
description: "部署运维域的技能入口。覆盖34个主题：bash-defensive-patterns、canary-watch、ci-cd-and-automation、create-github-action-workflow-specification、dependabot、deployment-patterns、deployment-pipeline-design、devops-rollout-plan、distributed-tracing、docker-patterns 等。当任务落在部署运维范围内时先读本文件，再按下方路由表只读需要的那一篇——不要一次读完整个 references。适用场景：让服务能可靠地构建、部署、观测与回滚。"
---

# 部署运维（`ops`）

**这个技能什么时候适用**：让服务能可靠地构建、部署、观测与回滚。任务不属于本域时，先看文末的「跨域去哪看」。

## 怎么用这个技能（重要）

这是一个**入口**，不是手册。`references/` 下有 34 篇主题文档，**不要整目录读**。正确做法：

1. 按下面路由表的「什么时候读」列，挑出与本任务真正相关的那 1–3 篇；
2. 用 `Read` 读 `${CLAUDE_PLUGIN_ROOT}/skills/ops/references/<主题>/guide.md`；
3. 那篇文档如果自带 `references/`、`assets/`、`scripts/`，按需再读；
4. 路由表没覆盖的问题，用 `Glob` 在 `references/` 里按关键词找。

## 路由表

| 主题 | 什么时候读它 |
| --- | --- |
| `bash-defensive-patterns` | Master defensive Bash programming techniques for production-grade scripts. |
| `canary-watch` | Use this skill to monitor and verify a deployed URL after releases — checks HTTP endpoints, SSE streams, static assets,… |
| `ci-cd-and-automation` | Automates CI/CD pipeline setup. |
| `create-github-action-workflow-specification` | Create a formal specification for an existing GitHub Actions CI/CD workflow, optimized for AI consumption and workflow … |
| `dependabot` | >- |
| `deployment-patterns` | Deployment workflows, CI/CD pipeline patterns, Docker containerization, health checks, rollback strategies, and product… |
| `deployment-pipeline-design` | Design multi-stage CI/CD pipelines with approval gates, security checks, and deployment orchestration. |
| `devops-rollout-plan` | Generate comprehensive rollout plans with preflight checks, step-by-step deployment, verification signals, rollback pro… |
| `distributed-tracing` | Implement distributed tracing with Jaeger and Tempo to track requests across microservices and identify performance bot… |
| `docker-patterns` | Docker and Docker Compose patterns for local development, hardened CLI installer harnesses, container security, network… |
| `github-actions-efficiency` | Audit GitHub Actions workflow efficiency and recommend fixes to reduce CI minutes and costs. |
| `github-actions-hardening` | Security hardening reviewer for GitHub Actions workflow files (.github/workflows/*.yml). |
| `github-actions-runtime-upgrade-conventions` | Upgrade GitHub Actions to supported runtimes by selecting safe action versions, preserving workflow behavior, and valid… |
| `github-actions-templates` | Create production-ready GitHub Actions workflows for automated testing, building, and deploying applications. |
| `github-release` | > |
| `gitlab-ci-patterns` | Build GitLab CI/CD pipelines with multi-stage workflows, caching, and distributed runners for scalable automation. |
| `gitops-workflow` | Implement GitOps workflows with ArgoCD and Flux for automated, declarative Kubernetes deployments with continuous recon… |
| `grafana-dashboards` | Create and manage production Grafana dashboards for real-time visualization of system and application metrics. |
| `helm-chart-scaffolding` | Design, organize, and manage Helm charts for templating and packaging Kubernetes applications with reusable configurati… |
| `incident-postmortem` | Use when an outage, production incident, or significant service degradation has occurred and the team needs to write a … |
| `incident-runbook-templates` | Create structured incident response runbooks with step-by-step procedures, escalation paths, and recovery actions. |
| `k8s-manifest-generator` | Create production-ready Kubernetes manifests for Deployments, Services, ConfigMaps, and Secrets following best practice… |
| `k8s-security-policies` | Implement Kubernetes security policies including NetworkPolicy, PodSecurityPolicy, and RBAC for production-grade securi… |
| `kubernetes-patterns` | Kubernetes workload patterns, resource management, RBAC, probes, autoscaling, ConfigMap/Secret handling, and kubectl de… |
| `multi-stage-dockerfile` | Create optimized multi-stage Dockerfiles for any language or framework |
| `observability-and-instrumentation` | Instruments code so production behavior is visible and diagnosable. |
| `on-call-handoff-patterns` | Master on-call shift handoffs with context transfer, escalation procedures, and documentation. |
| `postmortem-writing` | Write effective blameless postmortems with root cause analysis, timelines, and action items. |
| `production-audit` | Local-evidence production readiness audit for shipped apps, pre-launch reviews, post-merge checks, and "what breaks in … |
| `prometheus-configuration` | Set up Prometheus for comprehensive metric collection, storage, and monitoring of infrastructure and applications. |
| `secrets-management` | Implement secure secrets management for CI/CD pipelines using Vault, AWS Secrets Manager, or native platform solutions. |
| `shellcheck-configuration` | Master ShellCheck static analysis configuration and usage for shell script quality. |
| `shipping-and-launch` | Prepares production launches. |
| `slo-implementation` | Define and implement Service Level Indicators (SLIs) and Service Level Objectives (SLOs) with error budgets and alertin… |

## 本域的硬要求

- 镜像分层的顺序要服务于缓存命中，且必须核对启动器/入口类是否真的在镜像里
- 探针要确认鉴权与端点是否真的可访问——被鉴权挡住的探针会让 Pod 永不就绪
- 构建期注入的环境变量与 profile 必须显式指定，否则会把非生产配置带进生产

## 交付物形态

- Dockerfile
- K8s / Compose 清单
- 流水线定义
- 回滚与排查方案
