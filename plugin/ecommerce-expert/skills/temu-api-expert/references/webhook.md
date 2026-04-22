# Temu Partner API — Webhook API

Event subscription management and message acknowledgment.

## Table of Contents

- [bg.tmc.message.update](#bgtmcmessageupdate)

---

## `bg.tmc.message.update`

> **Official docs**: [bg.tmc.message.update](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=6e5817f037534093ba2dd91399aeff46)

This API updates the shop's webhook for specific event codes.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `cancelEventCodeList` | STRING[] | False | To cancel event codes of shop's webhook. Max number of code: 20. |
| `permitEventCodeList` | STRING[] | False | To add event codes of shop's webhook. Max number of code: 20. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | BOOLEAN | Specific return information. |
| `success` | BOOLEAN | The success or failure status returned in API response: true: success, false: fail. |
| `errorCode` | INTEGER | The success or failure status code returned in API response. |
| `errorMsg` | STRING | The success or failure messages returned in API response. Reasons of failure will be described in the message. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 110020005 | Cancel and permit parameters must not exceed 20. |  |
| 110020006 | Cancel and permit parameters are not allowed to be the same. |  |
| 110020007 | Too many requests in 1 sec, please try again later. |  |
| 110020008 | Access_token don't have this event access, please ask for seller to authorize this event in selle... |  |
| 110020009 | App don't have this event subscription. |  |

---
