---
name: temu-api-expert
description: >-
  Temu Partner Open API knowledge base with full parameter specs for 124 endpoints —
  authentication, request signing, endpoint catalog, error codes, and integration patterns
  for the Temu e-commerce seller platform. Use this skill whenever the user mentions
  Temu API, Temu seller integration, Temu Partner Platform, Temu open API, Temu order
  management, Temu product listing, Temu fulfillment/shipping, Temu webhook events,
  or needs to build any integration with Temu's seller ecosystem. Also use when you see
  API type names like "bg.order.*", "bg.local.goods.*", "bg.logistics.*", "temu.local.*",
  "bg.aftersales.*", "bg.promotion.*", or "temu.searchrec.ad.*". Even if you think you
  know the Temu API, use this skill — your training data likely has incorrect endpoint
  names and parameters.
---

# Temu Partner Open API — Knowledge Base

This skill contains comprehensive reference material for the Temu Partner Open API platform.
Use it to guide developers building integrations with Temu's seller/merchant ecosystem.

## Quick Facts

- **Protocol**: HTTPS, POST-only (no GET/PUT/DELETE)
- **Auth**: OAuth-style access_token obtained via seller authorization
- **Signing**: MD5 signature on every request
- **Response format**: JSON only
- **Rate limit**: 20 qps per app_key (adjustable on request)
- **Regions**: US, EU, Global — each with separate API hosts

## API Hosts

| Environment | Host | Region |
|---|---|---|
| Production US | `https://openapi-b-us.temu.com/openapi/router` | United States |
| Production EU | `https://openapi-b-eu.temu.com/openapi/router` | Germany, Italy, France, Spain, UK, etc. |
| Production Global | `https://openapi-b-global.temu.com/openapi/router` | Mexico, Japan, etc. |

Choose the host that matches the seller's store region.

## Common Parameters (every request)

| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | STRING | Y | API interface name (e.g., `bg.order.list.v2.get`) |
| `app_key` | STRING | Y | Your application key from Partner Platform |
| `access_token` | STRING | Y | Seller's authorization token |
| `timestamp` | STRING | Y | UNIX timestamp in seconds (10 digits). Must be within ±300s of server time |
| `sign` | STRING | Y | MD5 signature (see Signature section below) |
| `data_type` | STRING | Y | Fixed value: `JSON` |
| `version` | STRING | N | API version, defaults to V1 |

## Signature Algorithm (MD5)

Every request must include a `sign` parameter. The algorithm:

1. **Collect all parameters** — common params + request-specific params (flat key-value pairs)
2. **Sort by key** — ASCII ascending order on key names
3. **Concatenate** — join as `key1value1key2value2...` (no separators)
4. **Wrap with app_secret** — prepend and append `app_secret` to the concatenated string
5. **MD5 hash** — compute MD5 of the result, convert to **uppercase**

### Example

Given parameters for `bg.logistics.shipment.confirm`:
```
access_token = z0exampletokenz0exampletokenz0exampletokenz0exampletoken
app_key = f00df00df00df00df00df00df00df00d
data_type = JSON
timestamp = 1711009072
type = bg.logistics.shipment.confirm
sendRequestList = [{"orderSendInfoList":[...],"carrierId":"699272611","trackingNumber":"270324232756"}]
sendType = 0
```

Sorted concatenation with app_secret `cafef00dcafef00dcafef00dcafef00dcafef00d`:
```
cafef00dcafef00dcafef00dcafef00dcafef00daccess_token2nifvmpyymvy...typebg.logistics.shipment.confirmcafef00dcafef00dcafef00dcafef00dcafef00d
```

Result: `sign = 7286CF9573ACE90B570185BD97FEB438`

### Request Format

```bash
curl -X POST https://openapi-b-us.temu.com/openapi/router \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bg.order.list.v2.get",
    "app_key": "YOUR_APP_KEY",
    "access_token": "SELLER_TOKEN",
    "data_type": "JSON",
    "timestamp": 1711009072,
    "sign": "COMPUTED_SIGN",
    "request": { "pageNumber": 1, "pageSize": 20 }
  }'
```

## Authorization Flows

Temu supports three authorization methods:

### 1. Manual Authorization
Seller goes to Seller Center > Authorization Management, selects your app, grants permissions,
and copies the `access_token` to configure in your app.

### 2. Callback Authorization (recommended)
Seller authorizes in Seller Center. A `code` is sent to your app's `redirect_url`.
Your backend exchanges the code for an `access_token` via `bg.open.accesstoken.create`.

### 3. In-app Authorization
Construct an authorization URL that the seller visits directly from your app:
```
https://seller.temu.com/open-platform/client-manage/authorization?appKey=XXX&redirect_uri=XXX&state=XXX
```
After authorization, Temu redirects to your callback with `app_key`, `callback_host`, `code`, and `state`.

### Seller Center URLs by Region

| Seller Type | Region | URL |
|---|---|---|
| Crossborder | US | `https://agentseller.temu.com/open-platform/system-manage/client-manage` |
| Crossborder | EU | `https://agentseller-eu.temu.com/open-platform/system-manage/client-manage` |
| Local | US | `https://seller.temu.com/open-platform/client-manage` |
| Local | EU | `https://seller-eu.temu.com/open-platform/client-manage` |

### Token Exchange (Callback flow)

Call `bg.open.accesstoken.create` with the `code` received in the callback.
When calling for the first time, set `access_token` = `code`.

Response includes: `accessToken`, `mallId`, `expiredTime`, `apiScopeList`.

## Common Error Codes

| Code | Name | Description |
|---|---|---|
| 1000000 | SUCCESS | Request succeeded |
| 2000000 | BUSINESS_EXCEPTION | Internal API call failed |
| 3000000 | BAD_PARAMS | Bad parameters |
| 3000001 | SIGN_UNVALID | Invalid signature |
| 3000002 | — | Missing `type` in body |
| 3000003 | — | API type does not exist |
| 3000004 | — | API type has been sunset |
| 3000010 | — | Missing `timestamp` |
| 3000011 | — | Timestamp invalid (future > 300s) |
| 3000012 | — | Timestamp expired |
| 3000013 | — | Missing `data_type` |
| 3000014 | — | Invalid `data_type` |
| 3000019 | — | Missing `app_key` (as client_id) |
| 3000020 | — | `app_key` does not exist (as client_id) |
| 3000021 | — | `app_key` lacks permission for this API |
| 3000022 | — | App suspended |
| 3000025 | — | Missing `app_key` |
| 3000026 | — | `app_key` does not exist |
| 3000027 | — | `app_key` lacks API permission |
| 3000028 | — | App suspended |
| 3000030 | — | Missing `access_token` |
| 3000031 | — | `access_token` does not exist |
| 3000032 | — | `access_token` lacks API permission — seller must re-authorize |
| 3000033 | — | `access_token` and `app_key` mismatch |
| 3000034 | — | `access_token` expired or refreshed — get new token from seller |

## Rate Limiting

- Default: **20 requests per second** per `app_key`
- Dynamically adjustable — contact `partner@temu.com` for increases
- Rate limits visible in Partner Platform documentation

## API Categories Overview

The Temu API is organized into these domains. For the full endpoint catalog with every API name,
read `references/api-catalog.md`.

| Category | Description | Key APIs |
|---|---|---|
| **Authorization** | Token management, mall tags | `bg.open.accesstoken.create`, `bg.open.accesstoken.info.get` |
| **Product** | Add/manage/update goods, categories, SKUs, compliance, images | `temu.local.goods.v2.add`, `bg.local.goods.list.query`, `bg.local.goods.update` |
| **Price** | Base price recommendations, price order management | `temu.local.goods.baseprice.recommend`, `bg.local.goods.priceorder.change.sku.price` |
| **Order** | Query orders, shipping info, amounts | `bg.order.list.v2.get`, `bg.order.detail.v2.get`, `bg.order.amount.query` |
| **Order Cancellation** | Consumer and merchant-initiated cancellations | `bg.aftersales.cancel.list.get`, `temu.order.cancel.outofstock.apply` |
| **Fulfillment** | Shipment confirmation, buy-shipping, tracking | `bg.logistics.shipment.v2.confirm`, `bg.logistics.companies.get` |
| **Return & Refund** | After-sales, return labels, refund processing | `bg.aftersales.parentaftersales.list.get`, `temu.aftersales.refund.issue` |
| **Promotion** | Activity enrollment, goods management | `bg.promotion.activity.query`, `bg.promotion.activity.goods.enroll` |
| **Webhook** | Event subscriptions and message acknowledgment | `bg.tmc.message.update` |
| **Ads** | Search/recommendation ad management and reporting | `temu.searchrec.ad.create`, `temu.searchrec.ad.reports.mall.query` |

## Webhook Events

| Event Code | Description |
|---|---|
| `bg_open_event_test` | Test event |
| `bg_order_status_change_event` | Order status changed |
| `bg_trade_logistics_address_changed` | Shipping address changed |
| `bg_aftersales_status_change` | After-sales status changed |
| `bg_cancel_order_status_change` | Order cancellation status changed |

## When to Read Reference Files

Each reference file contains **full request/response parameter tables** (property, type, required, description) for every endpoint in that domain.

| Domain | File | Endpoints | When to read |
|---|---|---|---|
| Authorization | `references/authorization.md` | 3 | Token creation, token info, mall tags |
| Product — Add | `references/product-add.md` | 23 | Creating products, categories, attributes, images, compliance |
| Product — Manage | `references/product-manage.md` | 25 | Updating, querying, listing, deleting products/SKUs |
| Price | `references/price.md` | 4 | Price recommendations, price orders |
| Order | `references/order.md` | 8 | Order listing, details, shipping info, amounts |
| Order Cancellation | `references/order-cancellation.md` | 6 | Consumer/merchant cancellation requests |
| Fulfillment | `references/fulfillment.md` | 30 | Shipments, labels, scanforms, pickup, tracking, co-warehouse |
| Return & Refund | `references/return-refund.md` | 10 | After-sales, return labels, refunds |
| Promotion | `references/promotion.md` | 6 | Activity queries, goods enrollment |
| Webhook | `references/webhook.md` | 1 | Event message acknowledgment |
| Ads | `references/ads.md` | 8 | Ad campaigns, reports, ROAS prediction |
| Integration Guide | `references/integration-guide.md` | — | Auth flows, signing code (Python), rate limits, common patterns |

**Total: 124 API endpoints with full parameter specs across 11 domain files.**

Read only the file(s) relevant to the user's question — do not load all references at once.

## Partner Platform URLs

| Resource | URL |
|---|---|
| Partner Platform US | https://partner-us.temu.com |
| Partner Platform EU | https://partner-eu.temu.com |
| Partner Platform Global | https://partner.temu.com |
| Developer Guide | https://partner-us.temu.com/documentation?menu_code=38e79b35d2cb463d85619c1c786dd303 |
| API Reference | https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a |
| Support Email | partner@temu.com |
