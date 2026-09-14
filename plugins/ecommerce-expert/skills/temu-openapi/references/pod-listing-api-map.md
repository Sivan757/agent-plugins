# POD Listing API Map

Captured from logged-in Temu Partner documentation on 2026-06-17. API index source:

- https://agentpartner.temu.com/document?cataId=875198836203

Developer publishing flow source:

- https://agentpartner.temu.com/document?cataId=875196199516&docId=896172443264

This file is an API map, not a complete schema dump. Open the linked document IDs for exact request/response fields before implementation.

## Publication Dependency Chain

For POD T-shirt templates, treat supplier blank-shirt data as a reusable local product template:

- fixed: category, colors, sizes, size chart, model, warehouse, shipping/freight template, delivery time, packaging, product attributes, baseline price.
- variable per design: artwork, generated/cutout/mockup images, AI copy, final title/detail media, review state.

Temu publication flow:

1. Resolve leaf category.
2. Resolve site, warehouse, freight/logistics template.
3. Fetch category attribute template.
4. Resolve sale specs such as color and size.
5. Create/select a size chart that exactly matches published sizes.
6. Upload product images/videos and use returned URLs.
7. Build SPU/SKC/SKU payload and submit `bg.glo.goods.add` or the current goods publish API.
8. Store returned `productId`, `productSkcId`, and `productSkuId`.

## Core Goods APIs

| Purpose | API | Doc |
| --- | --- | --- |
| Publish goods | `bg.glo.goods.add` | https://agentpartner.temu.com/document?cataId=875198836203&docId=925526695187 |
| Query goods list | `bg.glo.goods.list.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=924479235154 |
| Query goods detail | `bg.glo.goods.detail.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=925528074151 |
| Update goods | `bg.glo.goods.update` | https://agentpartner.temu.com/document?cataId=875198836203&docId=925532416793 |
| Migrate goods | `bg.glo.goods.migrate` | https://agentpartner.temu.com/document?cataId=875198836203&docId=924481089321 |
| Edit pictures | `bg.glo.goods.edit.pictures.submit` | https://agentpartner.temu.com/document?cataId=875198836203&docId=924486362213 |
| Add property | `bg.glo.goods.add.property` | https://agentpartner.temu.com/document?cataId=875198836203&docId=925533793591 |
| Edit property | `bg.glo.goods.edit.property` | https://agentpartner.temu.com/document?cataId=875198836203&docId=924487372748 |
| Edit logistics template | `bg.glo.goodslogistics.template.edit` | https://agentpartner.temu.com/document?cataId=875198836203&docId=925534357132 |

## Category And Attribute APIs

| Purpose | API | Doc |
| --- | --- | --- |
| Category tree | `bg.glo.goods.cats.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=933920620800 |
| Category match | `bg.glo.goods.category.match` | https://agentpartner.temu.com/document?cataId=875198836203&docId=934980522381 |
| Category attributes | `bg.glo.goods.attrs.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=934974974297 |
| Parent sale specs | `bg.glo.goods.parentspec.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=929747769955 |
| Create sale spec | `bg.glo.goods.spec.create` | https://agentpartner.temu.com/document?cataId=875198836203&docId=931841951080 |
| Accessories | `bg.glo.goods.accessories.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=929748813829 |
| Brand | `bg.glo.goods.brand.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=932867285290 |

Publishing notes:

- Send category path fields from level 1 to the leaf; unused deeper category fields are `0`.
- `bg.goods.attrs.get`/`bg.glo.goods.attrs.get` must receive a leaf `catId`; empty attribute templates often mean the category is not a leaf.
- Sale specs must form a Cartesian product. Example: 2 colors x 5 sizes means 10 SKUs.
- If the template allows custom specs (`inputMaxSpecNum` non-zero), select parent specs and create child specs before publishing.
- For apparel, SKC is generally color-based. Non-apparel usually uses one SKC.

## Size Chart APIs

| Purpose | API | Doc |
| --- | --- | --- |
| Size chart metadata | `bg.glo.goods.sizecharts.meta.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=933921709056 |
| Size chart class | `bg.glo.goods.sizecharts.class.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=934975863040 |
| Size chart settings | `bg.glo.goods.sizecharts.settings.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=934976723937 |
| Query size charts | `bg.glo.goods.sizecharts.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=934978194903 |
| Create template temp id | `bg.glo.goods.sizecharts.template.create` | https://agentpartner.temu.com/document?cataId=875198836203&docId=934978536360 |
| Create size chart | `bg.glo.goods.sizecharts.create` | https://agentpartner.temu.com/document?cataId=875198836203&docId=933923560660 |

Size chart rules captured from the publishing-flow doc:

- Query class by leaf `catId`; if `classType=1`, it is a set/suit and may require multiple related class ids.
- Query metadata/settings to discover columns and allowed sizes.
- Reusable size charts behave like seller-center templates, but their ids are not directly used for publishing; call `sizecharts.template.create` to produce a temporary business id.
- Non-reusable size chart creation can return a business id used directly for publishing.
- Size chart records must exactly match the sizes in the SKU payload.
- When no size chart applies, pass empty arrays for size-template fields rather than `[0]`.

## Image, Video, And Asset APIs

| Purpose | API | Doc |
| --- | --- | --- |
| Image upload | `bg.goods.image.upload.global` | https://agentpartner.temu.com/document?cataId=875198836203&docId=929743122710 |
| AI text-to-picture task | `bg.goods.texttopicture.add.global` | https://agentpartner.temu.com/document?cataId=875198836203&docId=922387453346 |
| Picture compression | `bg.glo.picturecompression.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=921337345322 |
| Color image URL | `bg.glo.colorimageurl.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=929744601978 |
| CM to IN image conversion | `bg.glo.fancy.image.cm2in` | https://agentpartner.temu.com/document?cataId=875198836203&docId=929745291948 |
| Photo recommendation category | `bg.glo.goods.photorecommendationcategory.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=921339267612 |

Publishing notes:

- Product image/video URLs must be returned by Temu upload/processing APIs before they are used in publish payloads.
- If Temu rejects a product image ratio, inspect the original base64/source sent to the upload API, not only the compressed/rendered preview.
- Keep local DAM ids, md5s, generated image ids, mockup slot ids, Temu upload URLs, and publish payload slots separately.

## Logistics, Warehouse, Model, And Instructions

| Purpose | API | Doc |
| --- | --- | --- |
| Warehouse list | `bg.btg.goods.stock.warehouse.list.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=929731654843 |
| Logistics template | `bg.glo.logistics.template.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=929751463671 |
| Add model info | `bg.glo.modelinfo.add` | https://agentpartner.temu.com/document?cataId=875198836203&docId=934970190173 |
| Edit model info | `bg.glo.modelinfo.edit` | https://agentpartner.temu.com/document?cataId=875198836203&docId=933919398945 |
| Model categories | `bg.glo.modelcats.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=933919999698 |
| Model info | `bg.glo.modelinfo.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=934971950681 |
| Upload instructions | `bg.glo.goods.instructions.upload` | https://agentpartner.temu.com/document?cataId=875198836203&docId=934964084137 |

Semi-managed publishing requires site, warehouse, freight/logistics template, and delivery information. Full-managed flows may skip some semi-managed logistics fields.

## Inventory And Price Adjacent APIs

Use these only after the publication template and region are confirmed.

| Purpose | API | Doc |
| --- | --- | --- |
| Stock route add | `bg.btg.goods.stock.route.add` | https://agentpartner.temu.com/document?cataId=875198836203&docId=931819715810 |
| Stock quantity update | `bg.btg.goods.stock.quantity.update` | https://agentpartner.temu.com/document?cataId=875198836203&docId=929727846558 |
| Stock quantity get | `bg.btg.goods.stock.quantity.get` | https://agentpartner.temu.com/document?cataId=875198836203&docId=929728959750 |
| Semi price review query | `bg.semi.price.review.page.query.order` | https://agentpartner.temu.com/document?cataId=875198836203&docId=929730272138 |
| Semi price adjustment review | `bg.semi.adjust.price.batch.review.order` | https://agentpartner.temu.com/document?cataId=875198836203&docId=931820964658 |
| Semi price adjustment query | `bg.semi.adjust.price.page.query.order` | https://agentpartner.temu.com/document?cataId=875198836203&docId=931822060910 |

Price-field warning from the publishing-flow FAQ:

- Semi-managed goods use site-specific supplier prices.
- Full-managed goods use supplier price.
- Do not send both shapes blindly.
