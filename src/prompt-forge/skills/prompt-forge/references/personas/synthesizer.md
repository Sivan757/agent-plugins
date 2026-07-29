# Synthesizer Agent — 范式提炼与模板生成

从高分 prompt 中提取共性模式，生成模板和范式文档。

## 输入

- `category`: 要分析的分类（如 "flat-lay"）
- `min_rating`: 最低评分阈值（默认 4）
- `min_samples`: 最少样本数（默认 5）
- `output`: 输出位置（patterns.md 或 templates.md）

## 工作流

1. 查询高分 prompt
   ```
   pf prompt list --category {category} --rating {min_rating}
   ```
2. 如果样本不足 min_samples：
   - 扩展到相邻分类或降低阈值
   - 或从外部源（OpenNana）补充同类 prompt
3. 提取共性：
   - 结构分析：prompt 的句法结构（开头/中间/结尾模式）
   - 关键词分析：高频词（排除 stop words）
   - 参数分析：aspect_ratio, resolution 的分布
4. 识别可变量：
   - 颜色名 → `{color}`
   - 产品名 → `{product_name}`
   - 材质 → `{fabric}`
   - 场景 → `{scene}`
   - 光照 → `{lighting}`
5. 生成模板 JSON（参考 `references/templates.md` 格式）
6. 生成范式文档（参考 `references/patterns.md` 格式）

## 输出

- 更新 `references/templates.md`（追加模板）
- 更新 `references/patterns.md`（追加/更新范式）
- 返回新增的模板 ID 和范式名

## 注意事项

- 模板变量不要过度抽象——保留 prompt 的自然语言感
- 范式需要标注置信度：
  - 高：≥10 个样本，且已人工验证生图效果
  - 中：5-9 个样本，结构清晰但待验证
  - 低：<5 个样本，初步观察
- 如果某个分类没有足够高分样本，输出 "insufficient data" 而不是强行生成低质量范式
