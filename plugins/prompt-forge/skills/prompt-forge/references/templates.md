# 提示词模板库

模板是将已验证的 prompt 变量化后的成果。用 `{variable}` 标记可替换部分。

## 使用方法

1. 选择匹配的模板
2. 填入变量值
3. 可选：调整 `parameters`（aspect_ratio, resolution）
4. 生成完整 prompt → 发给生图 API

## 商品生图模板

### tpl-flat-lay-001: 电商平铺主图

```json
{
  "template": "A professional e-commerce flat lay of a {color} {product_name}, front view, laid flat on {surface}. Natural {lighting} creates soft shadows under the fabric edges. The {fabric} fabric shows natural {texture} and realistic textile grain. The {surface} surface is subtly visible beneath. Overhead slightly angled perspective. No watermarks, no logos, no props.",
  "variables": {
    "color": {"type": "string", "required": true, "example": "navy blue"},
    "product_name": {"type": "string", "required": true, "example": "cotton crew-neck t-shirt"},
    "surface": {"type": "enum", "values": ["light wooden table", "white marble surface", "natural linen cloth"], "default": "light wooden table"},
    "lighting": {"type": "enum", "values": ["daylight from large window", "soft diffused studio light", "morning sunlight"], "default": "daylight from large window"},
    "fabric": {"type": "string", "required": true, "example": "cotton"},
    "texture": {"type": "enum", "values": ["micro-wrinkles from folding", "soft natural creases", "gentle draped folds"], "default": "micro-wrinkles from folding"}
  },
  "default_params": {"aspect_ratio": "3:4", "resolution": "1K"},
  "source": "curated"
}
```

### tpl-model-scene-001: 多人种模特场景

```json
{
  "template": "A group of four young American adults (one Caucasian woman, one African American man, one Hispanic woman, one Asian man) all wearing the same {color} {product_name}, standing together in {scene}. Each model has a natural relaxed {pose}. The matching {color} garments create a cohesive group look. Full body shots showing the complete outfit on diverse body types. {lighting} lighting, shallow depth of field. Lifestyle fashion photography, warm and authentic atmosphere. The {fabric} garments show natural drape and subtle wrinkles.",
  "variables": {
    "color": {"type": "string", "required": true},
    "product_name": {"type": "string", "required": true},
    "scene": {"type": "enum", "values": ["a sunlit urban streetscape with brick walls", "a bright modern studio", "a natural outdoor park setting", "a beach boardwalk at golden hour"], "default": "a sunlit urban streetscape with brick walls"},
    "pose": {"type": "string", "default": "poses — some with hands in pockets, some smiling, some looking away candidly"},
    "lighting": {"type": "enum", "values": ["Natural golden hour", "Soft studio", "Bright daylight"], "default": "Natural golden hour"},
    "fabric": {"type": "string", "required": true}
  },
  "default_params": {"aspect_ratio": "3:4", "resolution": "2K"},
  "source": "curated"
}
```

### tpl-detail-001: 细节特写拼贴

```json
{
  "template": "A product detail collage showing close-up macro shots of a {color} {product_name}: {detail_parts}. Each detail area is sharply focused with macro lens quality, showing fabric weave, stitching precision, and construction quality. Clean light background, arranged in a {layout} layout. Professional e-commerce detail photography. No watermarks, no logos.",
  "variables": {
    "color": {"type": "string", "required": true},
    "product_name": {"type": "string", "required": true},
    "detail_parts": {"type": "string", "default": "collar stitching and neckline construction, sleeve hem and cuff detail, fabric texture close-up, bottom hem and side seam finishing"},
    "layout": {"type": "enum", "values": ["2x2 grid", "horizontal strip", "vertical column"], "default": "2x2 grid"}
  },
  "default_params": {"aspect_ratio": "4:3", "resolution": "1K"},
  "source": "curated"
}
```

### tpl-size-chart-001: US 尺码图

```json
{
  "template": "A clean modern US-market size chart infographic for a {product_name}. Available sizes: {sizes}. Measurements in inches (chest width, body length, sleeve length). Design: minimalist American retail style, black text on white background, with subtle measurement diagram icons. Header reads 'Find Your Perfect Fit' in bold sans-serif. Professional US e-commerce size guide. No photographs. Aspect ratio 3:4.",
  "variables": {
    "product_name": {"type": "string", "required": true},
    "sizes": {"type": "string", "default": "S, M, L, XL, 2XL"}
  },
  "default_params": {"aspect_ratio": "3:4", "resolution": "1K"},
  "source": "curated"
}
```

### tpl-selling-001: 卖点详解图

```json
{
  "template": "A product feature highlight graphic for a {product_name}. Key selling points:\n{bullet_points}\n\nDesign: modern clean fashion infographic style, soft pastel accent colors, large readable typography, icons for each feature. White background with subtle gradient. Professional e-commerce marketing graphic. No photographs.",
  "variables": {
    "product_name": {"type": "string", "required": true},
    "bullet_points": {"type": "string", "required": true, "example": "• 180gsm premium cotton\n• Regular fit, true to size\n• Pre-shrunk fabric\n• Machine washable"}
  },
  "default_params": {"aspect_ratio": "1:1", "resolution": "1K"},
  "source": "curated"
}
```

## Amazon Nano Banana Pro 电商套图（社区验证）

来源: wearesellers.com 社区，Nano Banana Pro 实测。7 张套图覆盖完整 Amazon 产品详情页需求。

### AMZ-001: 主图 Hero / Main Image

```json
{
  "template": "Generate a professional Amazon main image. Using the precise appearance of the product from the reference image, a realistic rendering is performed, preserving true colors, proportions, and details. The product is placed in the center of the frame, occupying at least 85% of the space, against a pure white background (RGB 255,255,255). Professional studio lighting is used, with soft, natural shadows, high-brightness illumination, and sharp global focus. No additional props, text, logos, or elements are included. The result is a clean, minimalist, business e-commerce style with ultra-high detail and 4K resolution.",
  "variables": {},
  "default_params": {"model": "nano-banana-pro", "requires_reference": true},
  "source": "wearesellers community, validated with output images"
}
```

### AMZ-002: 生活方式图 Lifestyle

```json
{
  "template": "Generate an Amazon lifestyle image based on the provided reference image. The image automatically infers the most suitable target users, environment, and benefit presentation method based on product appearance and typical uses. The product must be clearly visible and centered, with natural lighting, realistic proportions and shadows, a comfortable or efficient atmosphere, an overall realistic style, high detail, no text overlays, and a professional Amazon A+ content style.",
  "variables": {},
  "default_params": {"model": "nano-banana-pro", "requires_reference": true},
  "source": "wearesellers community, validated with output images"
}
```

### AMZ-003: 信息图 Infographic / Key Features

```json
{
  "template": "Based on the product in the reference image, generate an Amazon product infographic. Analyze the product usage scenarios and core functional technologies, and generate a key selling point using a large title in the top white space. Use minimalist arrows to label 2-3 brief material features of the product, leaving natural white space for adding text/labels. The style should be modern and minimalist, with a soft, light gradient background. Use soft studio lighting to eliminate shadows, and achieve 8K resolution for photorealistic results.",
  "variables": {},
  "default_params": {"model": "nano-banana-pro", "requires_reference": true},
  "source": "wearesellers community, validated with output images"
}
```

### AMZ-004: 多角度图 Multi-Angle Views

```json
{
  "template": "Based on the product in the reference image, generate one image each: front view, side view, back view, and top view. White background, professional lighting, and photos must be taken strictly according to the proportions shown in the attached image. No modifications to the product design are permitted.",
  "variables": {},
  "default_params": {"model": "nano-banana-pro", "requires_reference": true},
  "source": "wearesellers community, validated with output images"
}
```

### AMZ-005: 场景图 Multi-Scene Usage Grid

```json
{
  "template": "Generate an Amazon infographic grid based on the products in the reference images, showcasing multiple real-world usage scenarios for the products in the attached reference photos. Automatically identify 4-6 suitable life scenarios and corresponding benefits based on product type and appearance. Arrange small, realistic scene images in a grid or collage format, with each scene subtly overlaid with brief text describing the benefits or context. Natural lighting ensures clear product visibility in each scene, maintaining a consistent style and high detail, suitable for Amazon product detail pages.",
  "variables": {},
  "default_params": {"model": "nano-banana-pro", "requires_reference": true},
  "source": "wearesellers community, validated with output images"
}
```

### AMZ-006: 材质工艺图 Material & Craftsmanship

```json
{
  "template": "Generate a detailed Amazon infographic based on the product in the reference image, focusing on materials and craftsmanship. The product is centrally positioned and rendered realistically. Key craftsmanship features are automatically analyzed and highlighted based on visible textures, surface finishes, structural details, seams, and materials. Include zoom-in images, arrows, or labels, along with concise descriptive text (all derived from product analysis). Clean layout, subtle icons, white background, and ultra-sharp text and details create a professional product presentation style.",
  "variables": {},
  "default_params": {"model": "nano-banana-pro", "requires_reference": true},
  "source": "wearesellers community, validated with output images"
}
```

### AMZ-007: 尺寸参数图 Dimensions / Specs

```json
{
  "template": "Generate an Amazon-compatible size chart based on the product in the reference image. The product is centered, and parameters such as height, width, depth, weight, and capacity are automatically and concisely labeled based on visible or logical dimensions. Typical specifications for the product type are included. Features a minimalist background, sharp lines, and a readable sans-serif font; realistic rendering; high precision; and an e-commerce optimized style.",
  "variables": {},
  "default_params": {"model": "nano-banana-pro", "requires_reference": true},
  "source": "wearesellers community, validated with output images"
}
```

## 设计风格模板（待扩充）

占位 — 后续从 agent/curator 抓取的提示词库中提炼。优先级：
1. typography/slogan 文字模板
2. humor-meme 幽默模板
3. boho-floral 花卉模板
4. vintage-retro 复古模板
