---
name: temu-openapi
description: "Temu Partner OpenAPI 离线镜像与接入指南：209 篇接口文档 + 23 篇开发者文档（签名规则、鉴权信息、分区说明、接口列表、调用流程、数据字典、入驻流程），含请求签名、region/网关选择、自研应用鉴权、Temu Adapter 调用、POD/发品发布、图片上传、类目属性、尺码表、模特、物流模板、库存与价格接口，以及用 OpenCLI/Chrome 抓取登录态文档并转成实现方案。凡是涉及 Temu 接口实现、Temu 开放平台、Temu 对接联调、bg.order.* / bg.local.goods.* / bg.logistics.* / temu.local.* 这类接口名，或需要查 Temu 字段与流程时使用。"
---

# Temu OpenAPI

## Core Rules

Use this skill for Temu adapter work, especially when the task touches live shop credentials, product publication, image upload, size charts, logistics templates, model information, inventory, or price.

Before writing or calling code:

1. Read `references/gateway-and-signing.md` for region, gateway, auth, and signing rules.
2. Read `references/pod-listing-api-map.md` for the POD/listing API map and publication prerequisites.
3. Read `references/developer-workflow.md` before planning implementation, especially for self-developed apps, regions, auth, signing, and goods publishing.
4. For exact request/response schemas, method descriptions, parameter names, or example payloads, search the offline mirror under `references/temu-openapi/` before using a browser. Start with `references/temu-openapi/index.md`, then read only the specific Markdown file needed.
5. Use credentials only from runtime secret sources such as `TEMU_APPKEY`, `TEMU_APPSECRET`, and `TEMU_TOKEN`; never write secrets into code, logs, docs, tests, screenshots, or skill files.
6. Match gateway URL, `app_key`, `app_secret`, and `access_token` to the same Temu region before calling any API.
7. Treat publication, update, price, logistics, inventory, and migration calls as live state changes. Require explicit user confirmation before executing them against production.

## Offline Docs

The local mirror lives at `references/temu-openapi/` and holds 232 captured documents plus locally packaged screenshots:

| 分区 | 目录 | 文档数 |
| --- | --- | --- |
| 接口文档 | `references/temu-openapi/api/` | 209 |
| 开发者文档（签名、鉴权、分区、调用流程、数据字典、入驻） | `references/temu-openapi/developer/` | 23 |

Use it with targeted search:

```bash
# 接口
rg -n "bg.glo.goods.add|bg.goods.file.upload|sizecharts|warehouse" references/temu-openapi/index.md references/temu-openapi/api
# 开发指南
rg -n "签名规则|鉴权信息|货品发布流程|自研应用|数据字典" references/temu-openapi/index.md references/temu-openapi/developer
```

Read the exact matched file instead of loading the whole mirror. The mirror was captured from logged-in Temu Partner docs and has redacted `app_key`, `access_token`, `app_secret`, `sign`, and temporary signed query strings. If the user asks for the latest production behavior, verify online before implementation.

## Adapter Pattern

Prefer a Temu Adapter boundary instead of spreading request construction through UI, workflow, or service code:

- Build one canonical signer that sorts only outer parameters and produces uppercase MD5 signatures.
- Normalize common request fields in one place: `type`, `timestamp`, `app_key`, `data_type`, `access_token`, `sign`.
- Redact secrets and tokens in errors, traces, logs, and debug output.
- Add dry-run support that returns the unsigned payload shape, selected region, endpoint, API type, and validation gaps without sending the request.
- Make mutations idempotent where possible by storing local job ids, source template ids, uploaded asset ids, remote product ids, and request/response audit records.

## POD Listing Flow

For T-shirt/POD listing automation, model the flow as:

1. Resolve leaf category and category path.
2. Resolve site, warehouse, freight/logistics template, and delivery commitment.
3. Fetch category attributes and sale specs.
4. Build or select size chart templates matching the exact sizes being published.
5. Upload images/videos through Temu upload APIs and use the returned URLs only.
6. Build SPU/SKC/SKU payloads from the local product template.
7. Run validation and human review.
8. Submit publish/update only after confirmation.

Keep image generation, cutout, mockup, and AI copywriting upstream of the Temu API adapter. The adapter should receive approved assets and structured payload data, not creative instructions.

## Refreshing The Mirror

Read `references/opencli-doc-capture.md` before driving Chrome or capturing documentation.

1. If the task needs current docs, use the already logged-in Chrome tab when available. Prefer OpenCLI browser extraction over scraping public HTML because Temu docs are SPA pages and some content is login-gated.
2. Use the offline mirror first; open the browser only when the mirror is missing the needed page or the user explicitly asks for the latest docs.
3. When capturing, record source URL, doc id, capture date, and update time shown in the doc. Update `references/temu-openapi/` and its `manifest.json` instead of repeatedly browsing the same pages.
4. Keep API method names and document links so another agent can reopen exact schemas.
5. Treat region/gateway guidance as operationally important and re-check before production calls.
6. Prefer small, focused reference files over one large dump.

Do not expose credentials or tokens. Do not execute live publish/update/price/inventory actions unless the user explicitly confirms the action, region, and shop.
