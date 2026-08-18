# 标准工作流

## W1: 提示词入库（Prompt Ingestion）

```
步骤 1: 选择数据源
  → OpenNana API, GitHub awesome-list, 手动导入

步骤 2: 抓取（spawn curator agent）
  → 读取 agents/curator.md, spawn with source + limit + output path

步骤 3: 规范化
  → 统一字段映射：title, prompt_text, category, tags, source_url, source_type
  → 脚本: scripts/normalize.py

步骤 4: 去重
  → SHA256(prompt_text) 精确去重
  → 可选：语义相似度去重（慢但更准）
  → 命令: pf source dedup

步骤 5: 分类
  → 按 references/categories.md 匹配
  → 命令: pf prompt add --category auto

步骤 6: 存储
  → 写入 SQLite
```

## W2: 提示词模板化（Prompt Templating）

```
步骤 1: 筛选候选 prompt
  → pf prompt list --rating 4 --limit 50

步骤 2: 识别可变量
  → 对比同分类的高分 prompt，找出差异部分
  → 颜色名、产品名、材质、光照、场景 → 标记为 {variable}

步骤 3: 生成 template JSON
  → 定义变量类型（string/enum）、默认值、示例值
  → 存入 templates.md

步骤 4: 验证
  → 用默认变量值生成 prompt → 对比原始 prompt
  → 用随机变量值生成 3 个变体 → 检查语法合理性
```

## W3: 生图 + 评估（Generate + Evaluate）

```
步骤 1: 选择 prompt/template
  → pf prompt search "flat lay cotton"
  → 或选模板: references/templates.md → tpl-flat-lay-001

步骤 2: 生图
  → 调用 KIE / OpenAI / GLM API
  → 保存输出到 knowledge/product-images/{group_id}/{color}/

步骤 3: 关联
  → pf image link <prompt_id> <image_path>

步骤 4: 评估（可选，用户主动触发）
  → pf image rate <prompt_id> [1-5]
  → 记录评分理由（comment）
```

## W4: 范式提炼（Pattern Extraction）

```
步骤 1: 筛选样本
  → pf prompt list --rating 4 --category flat-lay --limit 100

步骤 2: 提取共性
  → spawn synthesizer agent (agents/synthesizer.md)
  → Agent 分析：结构模式、高频关键词、参数分布

步骤 3: 聚类
  → 按结构相似度聚类
  → 每类提取代表性 pattern

步骤 4: 存储
  → 写入 references/patterns.md
  → 关联源 prompt ID 列表
```
