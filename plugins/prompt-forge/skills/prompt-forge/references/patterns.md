# 提示词范式

从高分 prompt 中提炼的共性模式。每个范式包含：结构模板、高频关键词、适用场景。

## 范式 1: E-commerce Flat Lay

**适用分类**: Product > Flat Lay  
**结构**:
```
[A professional e-commerce flat lay of] {garment description}
[front view, laid flat on] {surface}
[Natural/Lighting description] creates {shadow quality}
[The {fabric} fabric shows] {texture details}
[Perspective/angle]
[Constraints: no watermarks, no logos, no props]
```

**高频关键词**: flat lay, e-commerce, front view, natural daylight, soft shadows, overhead, wooden table, cotton, micro-wrinkles, realistic textile grain

**置信度**: 高（基于 6 个已验证的 R8543 平铺图生成结果）

## 范式 2: Diverse Lifestyle Model Scene

**适用分类**: Product > Model Scene  
**结构**:
```
[A group of {N} young {nationality} adults (list ethnicities)]
[all wearing the same] {garment}
[standing together in] {scene with lighting}
[Each model has] {pose variety}
[Full body shots on diverse body types]
[Lifestyle photography style]
```

**高频关键词**: group shot, diverse, lifestyle, natural poses, golden hour, brick wall, urban, candid

**置信度**: 高（基于 6 个已验证的 R8543 模特场景生成结果）

## 范式 3: Cinematic Fashion Portrait

**适用分类**: Photography > Cinematic & Film  
**结构**（从 OpenNana 高分 prompt 提炼）:
```
[A {lighting} portrait of] {subject}
[in {setting}, {time of day}]
[{camera_reference} style, {film_stock} tones]
[{composition_style}, {depth_of_field}]
[Emotion: {mood}]
```

**高频关键词**: cinematic, film grain, golden hour, Hasselblad, anamorphic, Kodak Portra, shallow depth of field, candid, editorial

**置信度**: 中（基于 OpenNana 标题分析，待人工验证）

## 范式 4: Brand Identity Poster

**适用分类**: Poster & Graphic Design > Brand & Logo  
**结构**:
```
[A {style} {design_type} for {brand_context}]
[{color_palette} palette, {typography_style} typography]
[{composition} layout on {background}]
[Clean, minimal, professional]
```

**高频关键词**: minimalist, logo, brand identity, lettermark, wordmark, clean, sans-serif, geometric

**置信度**: 中

---

> 范式库持续从高分 prompt 中提炼。置信度标注：高=已验证生图效果，中=分析提炼待验证，低=初步观察
