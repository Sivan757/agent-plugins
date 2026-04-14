# Temu Partner API — Authorization API

Token management, seller authorization, and mall information.

## Table of Contents

- [bg.open.accesstoken.create](#bgopenaccesstokencreate)
- [bg.open.accesstoken.info.get](#bgopenaccesstokeninfoget)
- [temu.local.mall.tags.get](#temulocalmalltagsget)

---

## `bg.open.accesstoken.create`

> **Official docs**: [bg.open.accesstoken.create](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=82674d12ebe64af2820d62ebbc2ecc16)

Temu's authorization callback interface allows developers to receive notifications when a user has successfully authorized their application. When after the user grants permission, Temu will redirect back to the developer's specified callback URL with an authorization code. Use this api to request an access token.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `code` | STRING | False | This code is used to obtain an access token. The temporary authorization code can only be used once and expires after 10 minutes. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | The success or failure status returned in API response: true: success, false: fail. |
| `errorCode` | INTEGER | The failure status code returned in the API response. |
| `errorMsg` | STRING | The failure messages returned in API response. Reasons of failure will be described in the message. |
| `result` | OBJECT | Specific return information. |
| `expiredTime` | LONG | Expiration timestamp in seconds for access token. The unix timestamp represents the date and time the access token will expire. |
| `mallId` | LONG | Temu's unique identifier for a mall. Required param for most APIs. |
| `mallType` | INTEGER | mallType: {1-SEMI, 100-LOCAL} |
| `regionId` | LONG | the region which the mall belongs to, e.g. USA-211 |
| `apiScopeList` | STRING[] | A list of APIs that the current token has been authorized for, presented in the form of API names (e.g. xx.yyy.zz). |
| `appSubscribeEventCodeList` | STRING[] | A list of event codes you have subscribed. |
| `appSubscribeStatus` | INTEGER | Indicates the status of pushing for your application. Here are possible values. 0: events are pushed normally. 1: events pushing is stopped for reasons (e.g. callback errors). |
| `authEventCodeList` | OBJECT[] | A list of events your access token is authorized to receive. |
| `accessToken` | STRING | The token for API access, using to identify your permission to the api. |
| `associatedMallTokenList` | OBJECT[] | Associated authorization generated token list. |
| `mallId` | LONG | Temu's unique identifier for a mall. Required param for most APIs. |
| `accessToken` | STRING | The token for API access, using to identify your permission to the api. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 110020001 | System error, please try again. |  |
| 110020002 | Invalid code, please check and try again. |  |
| 110020003 | The error occurred when creating access token, please authorize again. |  |

---

## `bg.open.accesstoken.info.get`

> **Official docs**: [bg.open.accesstoken.info.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=93de550b56c8417caccb88824be3e614)

This interface allows merchants to view the API permissions associated with their currently authorized token, providing a list of authorized API endpoints.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | The success or failure status returned in API response: true: success, false: fail. |
| `errorCode` | INTEGER | The failure status code returned in the API response. |
| `errorMsg` | STRING | The failure messages returned in API response. Reasons of failure will be described in the message. |
| `result` | OBJECT | Specific return information. |
| `expiredTime` | LONG | Expiration timestamp in seconds for access token. The unix timestamp represents the date and time the access token will expire. |
| `mallId` | LONG | Temu's unique identifier for a mall. Required param for most APIs. |
| `mallType` | INTEGER | mallType: {1-SEMI, 100-LOCAL} |
| `semiUniqueId` | STRING | Unique identifier for semi-managed stores |
| `regionId` | LONG | the region which the mall belongs to, e.g. USA-211 |
| `apiScopeList` | STRING[] | A list of APIs that the current token has been authorized for, presented in the form of API names (e.g. xx.yyy.zz). |
| `appSubscribeEventCodeList` | STRING[] | A list of event codes you have subscribed. |
| `appSubscribeStatus` | INTEGER | Indicates the status of pushing for your application. Here are possible values. 0: events are pushed normally. 1: events pushing is stopped for reasons (e.g. callback errors). |
| `authEventCodeList` | OBJECT[] | A list of events your access token is authorized to receive. |
| `eventCode` | STRING | Unique identifier for each event. |
| `permitsStatus` | INTEGER | Indicates the status of receiving this event for your application. Here are possible values. 0: events receiving is disabled. 1: events receiving is enabled. |

---

## `temu.local.mall.tags.get`

> **Official docs**: [temu.local.mall.tags.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=8e8c5ca086834135bfa943405e66b18b)

This API allows sellers to retrieve the list of store tags currently assigned to their store.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `tags` | INTEGER[] | These are store-specific tags used to guide store behavior in both product-listing and fulfillment scenarios. The full list of tag enumerations is as follows: 0: No Special Label (INIT) — Stores wi... |

---
