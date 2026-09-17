# Temu Partner API — Integration Guide

Detailed guide for integrating with the Temu Partner Open API platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Authentication Flow](#authentication-flow)
3. [Signature Generation](#signature-generation)
4. [Making API Calls](#making-api-calls)
5. [Python Signature Example](#python-signature-example)
6. [Rate Limiting](#rate-limiting)
7. [Error Handling](#error-handling)
8. [Sandbox Testing](#sandbox-testing)
9. [Webhook Integration](#webhook-integration)
10. [Common Patterns](#common-patterns)

---

## Prerequisites

1. **Register** on the Temu Partner Platform (US/EU/Global)
2. **Create an App** — get your `app_key` and `app_secret`
3. **Publish the App** on the App Store (or use as private app)
4. **Get Seller Authorization** — the seller must authorize your app to get an `access_token`

### Partner Platform URLs

| Region | URL |
|---|---|
| US | https://partner-us.temu.com |
| EU | https://partner-eu.temu.com |
| Global | https://partner.temu.com |

---

## Authentication Flow

### Option 1: Manual Authorization

1. Seller logs into Seller Center > Authorization Management
2. Clicks "Authorize a new app" and selects your app
3. Chooses which permission scopes to grant
4. System displays `access_token` — seller copies it to your app
5. Your app stores and uses this token for API calls

### Option 2: Callback Authorization (Recommended)

1. Configure your `redirect_url` in the Partner Platform app settings
2. Seller authorizes your app in Seller Center
3. Temu redirects to your `redirect_url` with a `code` parameter
4. Your backend calls `bg.open.accesstoken.create` with the code
5. Response contains `accessToken`, `mallId`, `expiredTime`, `apiScopeList`

**Important**: When calling `bg.open.accesstoken.create` for the first time,
set the `access_token` common parameter equal to the `code` value.

### Option 3: In-app Authorization

Construct an authorization URL for the seller to visit directly:

```
https://seller.temu.com/open-platform/client-manage/authorization?appKey={YOUR_APP_KEY}&redirect_uri={YOUR_CALLBACK_URL}&state={CUSTOM_STATE}
```

Site-specific base URLs:
- US: `https://seller.temu.com`
- EU: `https://seller-eu.temu.com`

After authorization, Temu redirects to your `redirect_uri` with:
- `app_key` — your application key
- `callback_host` — the API host to use (e.g., `openapi-b-us.temu.com`)
- `code` — authorization code to exchange for token
- `state` — your custom state value passed through

### Token Response Example

```json
{
  "errorCode": 1000000,
  "errorMsg": "",
  "success": true,
  "result": {
    "accessToken": "uplv3hfyt5kcwoymrgnajnbl1ow5qxlz...",
    "mallId": 1024,
    "expiredTime": 1765634102,
    "apiScopeList": [
      "bg.order.list.get",
      "bg.order.detail.get",
      "bg.logistics.shipment.confirm",
      "..."
    ],
    "appSubscribeEventCodeList": [
      "bg_order_status_change_event",
      "bg_aftersales_status_change",
      "..."
    ]
  }
}
```

---

## Signature Generation

### Algorithm: MD5

1. **Collect** all parameters (common + request-specific) as flat key-value pairs
2. **Sort** keys in ASCII ascending order
3. **Concatenate** as `key1value1key2value2...` — no separators, no encoding
4. **Wrap** with `app_secret`: `{app_secret}{concatenated_string}{app_secret}`
5. **Hash** with MD5 and convert to **UPPERCASE**

### Step-by-Step Example

**Given**:
- `app_key` = `f00df00df00df00df00df00df00df00d` <!-- secret-scan: allow -->
- `app_secret` = `cafef00dcafef00dcafef00dcafef00dcafef00d` <!-- secret-scan: allow -->
- `access_token` = `z0exampletokenz0exampletokenz0exampletokenz0exampletoken` <!-- secret-scan: allow -->
- `type` = `bg.logistics.shipment.confirm`
- `timestamp` = `1711009072`
- `data_type` = `JSON`
- `sendType` = `0`
- `sendRequestList` = `[{"orderSendInfoList":[{"quantity":1,"orderSn":"211-21905473070712792","parentOrderSn":"PO-211-21905452099192792","goodsId":601099548666279,"skuId":17592352673534}],"carrierId":"699272611","trackingNumber":"270324232756"}]`

**Step 1** — Sort keys alphabetically:
`access_token`, `app_key`, `data_type`, `sendRequestList`, `sendType`, `timestamp`, `type`

**Step 2** — Concatenate key+value pairs:
```text secret-scan: allow
access_tokenz0exampletokenz0exampletokenz0exampletokenz0exampletokenapp_keyf00df00df00df00df00df00df00df00ddata_typeJSONsendRequestList[...]sendType0timestamp1711009072typebg.logistics.shipment.confirm
```

**Step 3** — Wrap with app_secret:
```text secret-scan: allow
cafef00dcafef00dcafef00dcafef00dcafef00d{above_string}cafef00dcafef00dcafef00dcafef00dcafef00d
```

**Step 4** — MD5 → uppercase:
```text secret-scan: allow
7286CF9573ACE90B570185BD97FEB438
```

---

## Making API Calls

### Request Structure

All API calls use **POST** with **JSON body**:

```
POST https://openapi-b-us.temu.com/openapi/router
Content-Type: application/json

{
  "type": "bg.order.list.v2.get",
  "app_key": "YOUR_APP_KEY",
  "access_token": "SELLER_TOKEN",
  "data_type": "JSON",
  "timestamp": 1711009072,
  "sign": "COMPUTED_SIGN",
  "version": "V1",
  "request": {
    "pageNumber": 1,
    "pageSize": 20,
    "parentOrderStatus": 2
  }
}
```

### Response Structure

All responses follow this format:

```json
{
  "errorCode": 1000000,
  "errorMsg": "",
  "requestId": "us-0b0bfc9c-f61d-4530-b1a3-bb19704de637",
  "success": true,
  "result": {
    // API-specific response data
  }
}
```

- `errorCode` = `1000000` means success
- `success` = `true` indicates the request was processed
- `requestId` is useful for debugging with Temu support
- `result` contains the API-specific response payload

### Host Selection

Choose the API host based on the seller's store region:

| Store Region | API Host |
|---|---|
| United States | `https://openapi-b-us.temu.com/openapi/router` |
| EU countries | `https://openapi-b-eu.temu.com/openapi/router` |
| Global (Mexico, Japan, etc.) | `https://openapi-b-global.temu.com/openapi/router` |

---

## Python Signature Example

```python
import hashlib
import json
import time
import requests

def generate_sign(params: dict, app_secret: str) -> str:
    """Generate MD5 signature for Temu API request."""
    # Sort parameters by key in ASCII order
    sorted_params = sorted(params.items(), key=lambda x: x[0])

    # Concatenate key-value pairs
    sign_str = ""
    for key, value in sorted_params:
        if isinstance(value, (dict, list)):
            sign_str += f"{key}{json.dumps(value, separators=(',', ':'), ensure_ascii=False)}"
        else:
            sign_str += f"{key}{value}"

    # Wrap with app_secret
    sign_str = f"{app_secret}{sign_str}{app_secret}"

    # MD5 hash, uppercase
    return hashlib.md5(sign_str.encode("utf-8")).hexdigest().upper()


def call_temu_api(
    api_type: str,
    app_key: str,
    app_secret: str,
    access_token: str,
    host: str = "https://openapi-b-us.temu.com/openapi/router",
    **request_params
) -> dict:
    """Make a Temu API call with automatic signing."""
    params = {
        "type": api_type,
        "app_key": app_key,
        "access_token": access_token,
        "data_type": "JSON",
        "timestamp": str(int(time.time())),
        **request_params,
    }

    params["sign"] = generate_sign(params, app_secret)

    response = requests.post(
        host,
        json=params,
        headers={"Content-Type": "application/json"},
    )
    return response.json()


# Usage example: Get order list
result = call_temu_api(
    api_type="bg.order.list.v2.get",
    app_key="YOUR_APP_KEY",
    app_secret="YOUR_APP_SECRET",
    access_token="SELLER_ACCESS_TOKEN",
    request={"pageNumber": 1, "pageSize": 20, "parentOrderStatus": 2},
)
print(result)
```

---

## Rate Limiting

- **Default**: 20 requests per second per `app_key`
- Rate limits are **dynamically adjustable**
- To request an increase: email `partner@temu.com` with your use case
- When rate limited, implement exponential backoff

---

## Error Handling

### Gateway-Level Errors (3000xxx)

These are validation errors at the API gateway before your request reaches the business logic:

- **3000001** (SIGN_UNVALID): Re-check your signature algorithm. Common causes:
  - Wrong parameter sorting
  - Including `sign` in the signature calculation (don't)
  - Incorrect app_secret
  - JSON serialization differences (extra spaces, key ordering)

- **3000011/3000012** (timestamp): Ensure your server clock is within ±300 seconds of Temu servers

- **3000021/3000027** (permission): Your app_key doesn't have the API scope. Check Partner Platform.

- **3000032** (access_token permission): The seller's authorization doesn't include this API.
  Ask the seller to re-authorize with the required permissions.

- **3000033** (token mismatch): The access_token was issued for a different app_key.

- **3000034** (token expired): The access_token has expired. Get a new token from the seller.

### Business-Level Errors (2000000)

Error code `2000000` (BUSINESS_EXCEPTION) indicates a business logic error.
The `errorMsg` field will contain specific details about what went wrong.

---

## Sandbox Testing

Temu provides sandbox test shops for development testing.
See the Developer Guide > Sandbox Test Shops section in the Partner Platform documentation.

---

## Webhook Integration

### Setup

1. Subscribe to events in your app configuration on the Partner Platform
2. Implement a webhook receiver endpoint
3. Process incoming events and acknowledge with `bg.tmc.message.update`

### Available Events

| Event Code | When It Fires |
|---|---|
| `bg_open_event_test` | Test event for verifying your webhook |
| `bg_order_status_change_event` | Order created, paid, shipped, delivered, etc. |
| `bg_trade_logistics_address_changed` | Buyer updates shipping address |
| `bg_aftersales_status_change` | Return/refund status changes |
| `bg_cancel_order_status_change` | Cancellation request created, approved, rejected |

### Best Practice

- Always acknowledge messages promptly with `bg.tmc.message.update`
- Implement idempotent message processing (events may be delivered more than once)
- Use webhook events to trigger order sync rather than polling `bg.order.list.v2.get`

---

## Common Patterns

### Pagination

Most list APIs support pagination:
```json
{
  "request": {
    "pageNumber": 1,
    "pageSize": 20
  }
}
```

- `pageNumber` starts at 1 (default)
- `pageSize` max is typically 100
- Check `totalCount` in response to know total pages

### Order Sync Workflow

1. **Initial sync**: Call `bg.order.list.v2.get` with `createAfter`/`createBefore` date range
2. **Ongoing**: Subscribe to `bg_order_status_change_event` webhook
3. **On event**: Call `bg.order.detail.v2.get` for the specific order
4. **Ship**: Call `bg.logistics.shipment.v2.confirm` with carrier and tracking number

### Product Listing Workflow

1. **Get categories**: `bg.local.goods.cats.get` or `bg.local.goods.category.recommend`
2. **Get attributes**: `temu.local.product.attributes.get` (V2) for the chosen category
3. **Upload images**: `bg.local.goods.image.upload`
4. **Create product**: `temu.local.goods.v2.add` (V2 recommended)
5. **Check status**: `bg.local.goods.publish.status.get` to monitor review status
6. **List/delist**: `bg.local.goods.sale.status.set`
