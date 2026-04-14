---
name: shein-api-expert
description: >-
  SHEIN Open Platform API knowledge base with full parameter specs for 173 endpoints —
  authentication, HMAC-SHA256 request signing, endpoint catalog, error codes, and integration
  patterns for the SHEIN e-commerce seller/merchant platform. Use this skill whenever the user
  mentions SHEIN API, SHEIN seller integration, SHEIN Open Platform, SHEIN developer platform,
  SHEIN order management, SHEIN product listing, SHEIN fulfillment/shipping, SHEIN logistics,
  SHEIN purchase order, SHEIN inventory, SHEIN MES, SHEIN MDP, or needs to build any integration
  with SHEIN's seller ecosystem. Also use when you see API paths like "/open-api/goods/*",
  "/open-api/order/*", "/open-api/shipping/*", "/open-api/stock/*", "/open-api/finance/*",
  "/open-api/material/*", "/open-api/cargo/*", "/open-api/mes/*", "/open-api/mdp/*",
  "open.sheincorp.com", or "openapi.sheincorp.com". Even if you think you know the SHEIN API,
  use this skill — your training data likely has incorrect endpoint names and parameters.
---

# SHEIN Open Platform API — Knowledge Base

This skill contains comprehensive reference material for the SHEIN Open Platform API.
Use it to guide developers building integrations with SHEIN's seller/merchant ecosystem.

## Quick Facts

- **Protocol**: HTTPS, POST-only (all endpoints use POST)
- **Auth**: openKeyId + secretKey obtained via store authorization + tempToken exchange
- **Signing**: HMAC-SHA256 with Base64 encoding, prepended with 5-char random key
- **Content-Type**: `application/json;charset=UTF-8`
- **Response format**: JSON — `{ "code": "0", "msg": "OK", "info": { ... }, "traceId": "..." }`
- **Timestamp**: Millisecond precision, valid for 5 minutes
- **Developer types**: Self-operated merchants, Third-party ISV, Platform-invited
- **Merchant modes**: Self-operated, Semi-managed, Fully-managed, POP, OEM/ODM, Shein-operated

## API Host

| Environment | Host |
|---|---|
| Production (CN) | `https://openapi.sheincorp.cn/open-api/` |
| Production (Global) | `https://openapi.sheincorp.com/open-api/` |

All API paths are prefixed with `/open-api/`. For example, the full URL for the auth endpoint is:
`https://openapi.sheincorp.com/open-api/auth/get-by-token`

## Common Request Headers (every request)

| Header | Type | Required | Description |
|---|---|---|---|
| `x-lt-appid` | string | Yes | Developer appId — used for the initial `/auth/get-by-token` call |
| `x-lt-openKeyId` | string | Yes | Store openKeyId — used for all authenticated API calls after key exchange |
| `x-lt-timestamp` | string | Yes | Millisecond timestamp (valid for 5 minutes) |
| `x-lt-signature` | string | Yes | HMAC-SHA256 signature (see Signature section below) |
| `Content-Type` | string | Yes | Fixed: `application/json;charset=UTF-8` |
| `language` | string | No | Response language: `en`, `fr`, `es`, `de`, `zh-cn`, `th`, `pt-br`, `ja` |

> **Note**: Use `x-lt-appid` only for the initial auth call (`/auth/get-by-token`). For all subsequent API calls, use `x-lt-openKeyId` instead.

## Signature Algorithm (HMAC-SHA256)

Every request must include an `x-lt-signature` header. The algorithm:

1. **Extract URL path** — from the full URL, take the path after the domain
   - URL: `https://openapi.sheincorp.com/open-api/auth/get-by-token`
   - Path: `/open-api/auth/get-by-token`

2. **Get timestamp** — millisecond-precision Unix timestamp (e.g., `1583398764000`)

3. **Concatenate signature value** — join three components with `&`:
   ```
   value = openKeyId + "&" + timestamp + "&" + requestPath
   ```
   Example: `test_key&1583398764000&/open-api/auth/get-by-token`

4. **Generate 5-digit random key** — alphanumeric string (called `randomKey`)

5. **Build encryption key** — append randomKey to secretKey:
   ```
   key = secretKey + randomKey
   ```

6. **HMAC-SHA256** — compute HMAC-SHA256 of the value using the key

7. **Base64 encode** — encode the HMAC result

8. **Prepend randomKey** — final signature = `randomKey + base64Result`

### Special case: getbytoken endpoint

When calling `/auth/get-by-token` for the first time (no openKeyId/secretKey yet),
use the developer's `APP_ID` and `APP_SecretKey` instead to generate the signature.

### Request Format

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/auth/get-by-token' \
  --header 'x-lt-appid: YOUR_APP_ID' \
  --header 'x-lt-signature: YOUR_SIGNATURE' \
  --header 'x-lt-timestamp: 1752560461085' \
  --header 'language: en' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "tempToken": "de723b1c-210b-4ecc-8da4-5f1da6ea0a9b"
  }'
```

## Authorization Flow

### Step-by-step

1. **Developer constructs authorization link** — include appId and redirect URI
2. **Merchant logs in** — uses SHEIN main account to authorize the app
3. **Get tempToken** — SHEIN redirects to callback URL with `tempToken`
4. **Exchange for credentials** — call `/auth/get-by-token` with `tempToken`
5. **Decrypt secretKey** — the returned `secretKey` is encrypted with developer's `appSecretKey`

### Authorization URL format

```
https://open.sheincorp.com/authorize?appId=YOUR_APP_ID&redirectUrl=YOUR_CALLBACK&state=YOUR_STATE
```

### Response from getbytoken

```json
{
  "code": "0",
  "msg": "OK",
  "info": {
    "secretKey": "CQsi1eOAf...YQqmG",
    "appid": "10AF15E7DD802804E7140BE2D326D",
    "openKeyId": "5C83782096BA46008D66C424CB39803F",
    "state": "OPENAPI",
    "supplierId": 21840925,
    "supplierBusinessMode": "POP-US"
  }
}
```

### Merchant Business Modes

| Mode | Description |
|---|---|
| `POP-US` | American POP store |
| `POP-GLOBAL` | Cross-border POP store |
| `SFS` | Stock, fulfill, and manage customer orders |

## Common Response Format

All API responses follow this structure:

```json
{
  "code": "0",
  "msg": "OK",
  "info": { ... },
  "traceId": "7b0461d5534f3e1"
}
```

- `code` = `"0"` means success
- `msg` = human-readable message
- `info` = response payload (object)
- `traceId` = unique request ID for debugging

## Common Signature Error Causes

| Issue | Description |
|---|---|
| Wrong domain | Using incorrect API host for the request |
| Malformed headers | Missing or malformed `x-lt-appid`, `x-lt-timestamp`, or `x-lt-signature` |
| Key reset | Merchant reset their keys — old openKeyId/secretKey are invalid |
| Unencrypted secretKey | Using the encrypted secretKey without decrypting with appSecretKey first |
| Expired timestamp | Timestamp older than 5 minutes |

## API Categories Overview

| Category | File | Endpoints | Description |
|---|---|---|---|
| **Authorization** | `references/authorization.md` | 1 | Store key exchange via tempToken |
| **Product** | `references/product.md` | 40 | Publish, edit, query products; categories, attributes, images, brands, pricing, shelf management |
| **Feed API** | `references/feed.md` | 6 | Bulk product operations via Feed files |
| **Product Compliance** | `references/compliance.md` | 12 | Agency bindings, real shot images, label templates, certificates, warning text |
| **Customer Order** | `references/order.md` | 17 | Order list/details, address export, express upload, logistics ordering, tracking, splitting |
| **Refunds** | `references/refunds.md` | 3 | Return order listing, details, and receiving |
| **Purchase Order** | `references/purchase-order.md` | 18 | Purchase orders, JIT orders, shipping info, delivery orders, stocking |
| **Inventory & Sales** | `references/inventory.md` | 5 | Warehouse management, stock queries, inventory modifications, SKU sales |
| **Custom Products** | `references/custom-products.md` | 5 | Custom product data, production templates, composite tasks |
| **Finance** | `references/finance.md` | 6 | Billing, sales details, debit/replenishment, invoices, statements |
| **Fabric** | `references/fabric.md` | 6 | Supplier fabric inventory — inbound/outbound sync, quality inspection, shipping |
| **Logistics Provider** | `references/logistics.md` | 11 | Logistics provider callbacks — tracking, waybills, weight, settlement |
| **Store** | `references/store.md` | 3 | Store info queries, announcement list/details |
| **MES** | `references/mes.md` | 16 | Factory MES — procurement, picking, BOM, production orders, cutting, sewing |
| **Cooperation Warehouse** | `references/cooperation-warehouse.md` | 4 | Authenticated warehouse — waybill upload, outbound orders |
| **MDP Service** | `references/mdp.md` | 20 | Manufacturing data platform — bulk orders, print tasks, ERP integration |

**Total: 173 API endpoints with full parameter specs across 16 domain files.**

## When to Read Reference Files

Read only the file(s) relevant to the user's question — do not load all references at once.

| User's question is about... | Read this file |
|---|---|
| Store authorization, getting openKeyId/secretKey, tempToken | `references/authorization.md` |
| Publishing, editing, or querying products; categories, attributes, images, brands | `references/product.md` |
| Bulk product operations via Feed files | `references/feed.md` |
| Product compliance, agency companies, real shot images, labels, certificates | `references/compliance.md` |
| Customer orders, order list/details, shipping, tracking, express info | `references/order.md` |
| Returns, refunds, return order management | `references/refunds.md` |
| Purchase orders, JIT orders, delivery orders, stocking | `references/purchase-order.md` |
| Warehouse management, stock queries, inventory | `references/inventory.md` |
| Custom/personalized products, production templates | `references/custom-products.md` |
| Billing, invoices, statements, financial reports | `references/finance.md` |
| Supplier fabric management, cloth inspection | `references/fabric.md` |
| Logistics provider integrations, tracking callbacks, waybills | `references/logistics.md` |
| Store information, announcements | `references/store.md` |
| Factory MES systems, procurement, production orders | `references/mes.md` |
| Platform cooperation warehouse, outbound orders | `references/cooperation-warehouse.md` |
| MDP service, print tasks, external ERP integration | `references/mdp.md` |
| General integration patterns, auth flow code, signature code | See the Signature Algorithm and Authorization Flow sections above |

## Partner Platform URLs

| Resource | URL |
|---|---|
| Developer Platform | `https://open.sheincorp.com` |
| API Documentation | `https://open.sheincorp.com/documents/apidoc` |
| Developer Guide | `https://open.sheincorp.com/documents/system` |
| Signature Rules | `https://open.sheincorp.com/documents/system/passwdrule` |
| Seller Learning Center | `https://lms.sheincorp.cn` |
| Seller Enroll Portal | `https://seller.sheincorp.cn` |
| Contact | `openapi@shein.com` |
