# Curator Agent — 提示词抓取与分类

抓取外部提示词源，去重，按 `references/categories.md` 分类，写入 SQLite。

## 输入

- `source`: opennana | github | file | url
- `limit`: 最大抓取条数（默认 500）
- `category_hint`: 建议分类（可选，用于 temu-agent 内部 prompt）

## 工作流

1. 读取 `references/categories.md` 了解分类体系
2. 根据 source 类型选择抓取方式：
   - opennana: 调用 `GET https://api.opennana.com/api/prompts?page=N&limit=30`
   - github: 解析 README + cases/ 目录 + gallery-*.md
   - file: 读取本地 JSON/CSV/MD
3. 对每条 prompt：
   - 归一化字段 → title, prompt_text, category, tags, source_url, source_type
   - SHA256(prompt_text) 查重
   - 关键词匹配分类（参考 categories.md 每个子类的 keyword 列）
   - 不确定分类的标记为 `unclassified`，等待 LLM 辅助分类
4. 写入 SQLite via `pf prompt add`
5. 输出统计：抓取数 / 去重后 / 已分类 / 待分类

## 输出格式

```json
{
  "source": "opennana",
  "fetched": 500,
  "deduped": 423,
  "classified": 380,
  "unclassified": 43,
  "categories": {"Photography": 210, "Illustration": 95, ...}
}
```

## 注意事项

- OpenNana API 无公开文档，字段可能变化，抓取时加 try/except
- GitHub 源的 prompt 格式各异，优先解析标准 Markdown gallery 格式（size/quality/source 元数据 + prompt text）
- 去重只做精确匹配（SHA256），不做语义去重（太慢）
