---
name: temu-api
description: "Use when the user needs to design, implement, debug, or review Temu Partner/OpenAPI integrations: request signing, region/gateway selection, self-developed app auth, Temu Adapter calls, POD/listing publication, image upload, category/attribute lookup, size chart/model/logistics/template APIs, inventory/price APIs, or any code that calls Temu APIs."
---

# Temu API

## Core Rules

All `references/...` paths below are relative to this skill's directory, i.e. `${CLAUDE_PLUGIN_ROOT}/skills/temu-api/references/...`. When reading a reference file, resolve the full path under the plugin root rather than the current working directory.

Use this skill for Temu adapter work, especially when the task touches live shop credentials, product publication, image upload, size charts, logistics templates, model information, inventory, or price.

Before writing or calling code:

1. Read `references/gateway-and-signing.md` for region, gateway, auth, and signing rules.
2. Read `references/pod-listing-api-map.md` for the POD/listing API map and publication prerequisites.
3. For exact request/response schemas, method descriptions, parameter names, or example payloads, search the offline mirror under `references/temu-openapi/` before using a browser. Start with `references/temu-openapi/index.md`, then read only the specific API Markdown file needed.
4. Use credentials only from runtime secret sources such as `TEMU_APPKEY`, `TEMU_APPSECRET`, and `TEMU_TOKEN`; never write secrets into code, logs, docs, tests, screenshots, or skill files.
5. Match gateway URL, `app_key`, `app_secret`, and `access_token` to the same Temu region before calling any API.
6. Treat publication, update, price, logistics, inventory, and migration calls as live state changes. Require explicit user confirmation before executing them against production.

## Offline API Docs

The local API documentation mirror lives at `references/temu-openapi/` and contains 209 captured API documents plus locally packaged screenshots.

Use it with targeted search:

```bash
rg -n "bg.glo.goods.add|bg.goods.file.upload|sizecharts|warehouse" references/temu-openapi/index.md references/temu-openapi/api
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

## Credential Management

This plugin is a **reference knowledge base**. It documents the Temu API and
signing rules; it does not execute Temu API calls itself.

Your Temu credentials (`TEMU_APPKEY`, `TEMU_APPSECRET`, `TEMU_TOKEN`) are
managed by the **config-center** plugin, not stored in this skill:

- Set or change them: run `config-center edit temu-api` (opens a browser UI; the
  values are entered by you, never by the agent).
- Confirm they are configured: run `config-center get temu-api` (output is always
  redacted - you see only whether each key is set, never its plaintext).

When your integration code calls Temu APIs, read the credential values from
config-center's store at runtime. **Never** read, `cat`, or `Read` the
cache file directly, and never print the cache path.
