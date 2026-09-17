# Developer Workflow

Captured from logged-in Temu Partner developer documentation on 2026-06-17.

Source pages:

- Signing rules: https://agentpartner.temu.com/document?cataId=875196199516&docId=896167235113
- Auth information: https://agentpartner.temu.com/document?cataId=875196199516&docId=896168820140
- Self-developed-only APIs: https://agentpartner.temu.com/document?cataId=875196199516&docId=899322689413
- Region notes: https://agentpartner.temu.com/document?cataId=875196199516&docId=909799935182
- Goods publishing flow: https://agentpartner.temu.com/document?cataId=875196199516&docId=896172443264
- API index: https://agentpartner.temu.com/document?cataId=875198836203

## Self-Developed App Setup

Captured doc guidance:

- `app_key` comes from seller center self-developed app management for product APIs.
- `app_secret` participates in signing and must be protected.
- `access_token` is shop-scoped. The self-developed app doc says the token is valid for 365 days and regenerating a token invalidates the previous one.
- Seller center authorization flow: choose the self-developed app, select API permissions, confirm, and copy the token.
- Some self-developed-only APIs require separate approval. The doc asks developers to provide subject id, appkey, and shop id to the business/contact for approval.

Use environment-backed secrets at runtime. In this workspace, expected variable names are `TEMU_APPKEY`, `TEMU_APPSECRET`, and `TEMU_TOKEN`.

## Region Rules

Captured docs split capabilities across regions. Do not mix gateway URL, app credentials, and access token across regions.

| Scenario | Region |
| --- | --- |
| Full-managed goods publishing, inventory, stocking fulfillment | CN |
| Full-managed compliance qualification | GLOBAL |
| Semi-managed goods publishing | CN |
| Semi-managed inventory, adjustment, price review | PA |
| US semi-managed fulfillment | US |
| EU semi-managed fulfillment | EU |
| Other semi-managed fulfillment/compliance outside US/EU | GLOBAL |
| Local-to-local US goods and fulfillment | US |
| Local-to-local EU goods and fulfillment | EU |
| Other local-to-local | GLOBAL |

Captured gateway examples:

- CN: `https://openapi.kuajingmaihuo.com/openapi/router`
- PA: `https://openapi-b-partner.temu.com/openapi/router`
- US: `https://openapi-b-us.temu.com/openapi/router`
- EU: `https://openapi-b-eu.temu.com/openapi/router`

For a US local POD seller, verify whether the operational model is local-to-local US or semi-managed before picking an endpoint. The docs map those scenarios differently.

## Signing

All API calls require request signing:

1. Prepare the outer request JSON without `sign`.
2. Sort outer keys by ASCII key order.
3. Concatenate `key + value` for the sorted outer keys.
4. Prefix and suffix with `app_secret`.
5. MD5 hash and uppercase the 32-character hex output.
6. Put the result in `sign`.

Only outer keys are sorted. Inner JSON/arrays are not recursively sorted. Value spelling and serialization must match the outgoing request.

## Goods Publishing Flow

The captured goods publishing flow applies to full-managed and semi-managed goods publication.

### 1. Determine Leaf Category

Use one of:

- `bg.goods.cats.get` / `bg.glo.goods.cats.get`: traverse category tree from root to leaf.
- `bg.goods.category.match` / `bg.glo.goods.category.match`: fuzzy-match categories by keyword.

Publish payload category path includes category levels from level 1 to leaf; unused deeper category fields are set to `0`.

### 2. Resolve Site, Warehouse, Freight Template

For semi-managed flows, confirm:

- target site from the semi-managed site list.
- warehouse with warehouse list APIs.
- logistics/freight template with logistics template APIs.
- delivery commitment fields.

Full-managed shops may skip this step.

### 3. Query Attribute Template

Use category attributes API with the leaf category id. Split the response into:

- sale specs: values that determine SKU combinations.
- regular required attributes: non-sale required fields, including parent/child attributes.

Sale specs must form a Cartesian product. For example, 6 colors x 5 sizes means 30 SKU rows.

If custom specs are allowed, query parent specs and create child specs before publication.

### 4. Build Size Chart

Flow:

1. Query size chart class by leaf category.
2. Check whether size chart is required.
3. Query metadata/settings for columns and allowed sizes.
4. Create or select the size chart.
5. Ensure chart records exactly match the published SKU sizes.

Reusable chart ids from seller center or `sizecharts.get` may need a temporary business id from `sizecharts.template.create` before use in publishing. Non-reusable chart creation can return a business id used directly.

### 5. Upload Images And Videos

Images/videos must be uploaded through Temu upload APIs first. Use Temu-returned URLs in publish payloads.

If image ratio validation fails, inspect the original source uploaded to Temu, not just the local preview.

### 6. Build SPU/SKC/SKU

Captured structure:

- One publish request corresponds to one SPU and returns `productId`.
- Apparel SKC usually maps to color and returns `productSkcId`.
- SKU maps to the concrete sale-spec combination and returns `productSkuId`.
- Captured limits: one SPU can have up to 25 SKCs and up to 500 SKUs.

For non-apparel, the main sale spec may be a fixed empty/default value. For apparel, main sale spec is typically color.

## Common Publishing Failures

Captured FAQ patterns:

- Invalid main sale attribute: non-apparel and apparel require different main-sale-spec shapes.
- Size chart contains invalid size specs: SKU sizes and chart records must match exactly.
- URL domain validation failure: image/video URL was not returned by Temu upload APIs.
- Duplicate main sale spec list: non-apparel should not send multiple SKCs.
- Invalid size template id `[0]`: pass empty arrays when there is no size chart.
- Size chart id from `sizecharts.get` used directly: create a temporary business id first.
- Price field mismatch: semi-managed uses site-specific supplier prices; full-managed uses supplier price.
- Semi-managed delivery information missing: include freight template and shipment commitment.
- Attribute template has no data: verify the category id is a leaf category.

## Implementation Planning Notes

For a Console + Conductor + Temu Adapter system:

- Console should manage templates, stores, credentials references, DAM slots, and human review.
- Conductor should orchestrate repeatable jobs: AI copy, image preparation, upload, payload build, validation, review, publish.
- Temu Adapter should be a narrow API boundary with signing, region selection, dry-run, idempotency, audit, and redaction.
- Do not make creative image/copy generation part of the Temu Adapter. Pass approved structured data and assets into it.
