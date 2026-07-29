# 提示词分类体系

基于 OpenNana（11,240 条）和 GPT-Image2-Skill（31 类目）的实际数据归纳。分类覆盖通用图像生成 + temu-agent 商品生图场景。

## 一级分类（7 类）

| # | 分类 | 覆盖范围 | 数据来源 |
|---|------|---------|---------|
| 1 | 📷 **Photography** | 人像/时尚/街拍/美妆/运动/电影感 | OpenNana 最大类（~40%） |
| 2 | 🎨 **Illustration & Art** | 动漫/3D/水彩/版画/像素/概念艺术 | GPT-Image2 核心类 |
| 3 | 🖼 **Poster & Graphic Design** | 电影海报/品牌Logo/社论排版/字体 | OpenNana 次大类 |
| 4 | 🛍 **Product & E-commerce** | 电商平铺/模特场景/细节/尺码/卖点 | temu-agent 专用 |
| 5 | 🏛 **Architecture & Space** | 建筑立面/室内设计/景观/地产 | GPT-Image2 |
| 6 | 👤 **Character & Concept** | 角色设计四视图/奇幻世界观 | GPT-Image2 + OpenNana |
| 7 | ⚙️ **Technical Reference** | 分辨率/比例/光照/色彩/风格迁移 | 跨类目参数 |

## 二级分类

### 📷 Photography（摄影）

| 子类 | 典型 prompt 特征 |
|------|-----------------|
| Fashion & Editorial | fashion, magazine, editorial, luxury, runway, model, high-end |
| Lifestyle & Street | street, cafe, urban, daily life, natural light, candid, CCD |
| Beauty & Cosmetics | beauty, makeup, skincare, cosmetics, skincare ad |
| Sports & Action | football, soccer, basketball, sports, athlete, action shot |
| Couple & Romance | couple, romantic, embrace, kiss, wedding, lovers |
| Selfie & POV | selfie, mirror, phone camera, POV, handheld, casual |
| Cinematic & Film | cinematic, film grain, IMAX, Hasselblad, movie still, anamorphic |
| Portrait Studio | studio lighting, portrait, headshot, softbox, 5000K |

### 🎨 Illustration & Art（插画/艺术）

| 子类 | 典型 prompt 特征 |
|------|-----------------|
| Anime & Manga | anime, manga, Ghibli, Japanese, cartoon, Pixar, Chibi |
| 3D & CGI | 3D render, C4D, Blender, toy, figurine, isometric, voxel |
| Watercolor | watercolor, wash, soft, dreamy, pastel |
| Ink & Traditional | ink, brush, woodcut, linocut, etching, Chinese painting |
| Pixel Art | pixel, 8-bit, 16-bit, retro game, sprite |
| Conceptual & Surreal | surreal, dreamlike, fantasy, double exposure, impossible |
| Fine Art | oil painting, acrylic, impasto, classical, baroque |

### 🖼 Poster & Graphic Design（海报/平面）

| 子类 | 典型 prompt 特征 |
|------|-----------------|
| Movie & Entertainment | movie poster, cinematic poster, blockbuster, film promo |
| Brand & Logo | logo, brand identity, minimalist mark, wordmark, lettermark |
| Typography | typography, lettering, font, text design, calligraphy |
| Event & Celebration | event poster, graduation, holiday, festival, Christmas |
| Editorial & Layout | editorial, magazine layout, grid, spread, multi-panel |

### 🛍 Product & E-commerce（商品/电商）

| 子类 | 典型 prompt 特征 |
|------|-----------------|
| Flat Lay | flat lay, overhead, wooden table, product photography, e-commerce |
| Model Scene | model wearing, group shot, lifestyle, diverse models, fashion |
| Detail Close-up | macro, close-up, stitching, collar, sleeve, fabric texture |
| Size Chart | size chart, measurement guide, fit guide, inches |
| Selling Points | feature highlight, infographic, benefits, product features |
| Food & Beverage | food, drink, beverage, dessert, culinary, gourmet |
| Beauty & Luxury | perfume, cosmetics, jewelry, watch, luxury product |
| Packaging | packaging design, box, pouch, label, unboxing |

### 🏛 Architecture & Space（建筑/空间）

| 子类 | 典型 prompt 特征 |
|------|-----------------|
| Exterior & Facade | building, facade, architecture, exterior, elevation |
| Interior & Room | interior, room, cozy, bedroom, living room, cafe |
| Landscape & Garden | landscape, garden, park, nature, outdoor space |
| Real Estate | real estate, property, luxury home, villa, rendering |
| Urban & Cityscape | cityscape, skyline, street view, aerial, drone |

### 👤 Character & Concept（角色/概念）

| 子类 | 典型 prompt 特征 |
|------|-----------------|
| Character Sheet | character design, turnaround, four views, reference sheet |
| Fantasy | fantasy, warrior, mage, elf, medieval, magical |
| Sci-Fi | sci-fi, cyberpunk, mecha, futuristic, space |
| Historical & Cultural | traditional costume, hanfu, kimono, historical, dynasty |

### ⚙️ Technical Reference（技术参考）

| 子类 | 选项 |
|------|------|
| Resolution | 1K, 2K, 4K |
| Aspect Ratio | 1:1, 3:4, 4:3, 16:9, 9:16, 3:2, 2:3, 21:9 |
| Lighting | natural window, studio softbox, golden hour, overcast, rim, Rembrandt |
| Color Grading | warm, cool, muted, vibrant, desaturated, Kodak, Fuji, cinematic |
| Camera Style | Hasselblad, CCD, GR3, film, iPhone, Polaroid |
| Style Transfer | photo→anime, sketch→realistic, Ghibli filter, 3D→2D |

## 分类匹配规则

入库时按优先级：
1. 用户显式指定 category
2. 来源系统的分类映射（GPT-Image2-Skill 类目 → 本分类）
3. prompt_text + title 关键词匹配（上表 keyword 列）
4. LLM 辅助分类（以上都不明确时，spawn curator agent）

## 与外部源的映射

| 外部源 | 类目数 | 映射方式 |
|--------|--------|---------|
| GPT-Image2-Skill | 31 | 直接映射到 7 大类二级 |
| OpenNana | 无分类 | 关键词 + LLM 自动分类 |
| awesome-nano-banana | ~15 | README 分区 → 二级类目 |
| temu-agent 内部 | 5 | product/ 下专用子类 |
