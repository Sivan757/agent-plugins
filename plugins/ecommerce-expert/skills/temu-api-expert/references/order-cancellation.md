# Temu Partner API — Order Cancellation API

Handle consumer-initiated and merchant-initiated order cancellations.

## Table of Contents

- [bg.aftersales.cancel.list.get](#bgaftersalescancellistget)
- [bg.aftersales.cancel.agree](#bgaftersalescancelagree)
- [temu.order.cancel.appeal.apply](#temuordercancelappealapply)
- [temu.order.cancel.appeal.result.get](#temuordercancelappealresultget)
- [temu.order.cancel.outofstock.apply](#temuordercanceloutofstockapply)
- [temu.order.cancel.outofstock.result.get](#temuordercanceloutofstockresultget)

---

## `bg.aftersales.cancel.list.get`

> **Official docs**: [bg.aftersales.cancel.list.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=d2dce87c546448db83d9ea75e4e86e33)

Query cancel order after-sales information

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageSize` | INTEGER | False | Page size for pagination, default is 10, max is 200. |
| `pageNo` | INTEGER | False | Page number for pagination, default is 1. |
| `parentOrderSnList` | STRING[] | False | Parent order number list. If left empty, there is no restriction on the range of parent order numbers. The maximum number of records per query is 200. |
| `parentAfterSalesSnList` | STRING[] | False | Parent after-sales order number list. If left empty, there is no restriction on the range of parent after-sales order numbers. The maximum number of records per query is 200. |
| `afterSalesStatusGroup` | INTEGER | False | The cancel order after-sales status group, enumerated as follows: 8: Cancel order pending, 9: Cancel order approved, 10: Cancel order rejected, 11: Cancel order revoked. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `total` | LONG | Total number of matching records. |
| `pageNumber` | INTEGER | Current page number of the result. |
| `data` | OBJECT[] | The record data returned from this query. |
| `parentAfterSalesSn` | STRING | Parent after-sales order number for the canceled order. |
| `parentAfterSalesStatus` | INTEGER | Current parent after-sales status, enumerated as follows: 1: Buyer has applied for a refund, pending processing, 4: Refund has been initiated, being processed by the system, 5: Refund has been issu... |
| `afterSalesInfoList` | OBJECT[] | Cancel order after-sales information list. |

---

## `bg.aftersales.cancel.agree`

> **Official docs**: [bg.aftersales.cancel.agree](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=d506404d2c8d43ee9de7b6513f5b19ce)

Agree cancel order

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentAfterSalesSn` | STRING | True | Parent after-sales order number, cannot be empty. |
| `parentOrderSn` | STRING | True | Parent order number, cannot be empty. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT | Empty field |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 130010001 | The parameter is illegal. Please check if the input parameter meets the regulations. |  |
| 130010002 | The order has been fully shipped. |  |
| 130010005 | operate forbid |  |

---

## `temu.order.cancel.appeal.apply`

> **Official docs**: [temu.order.cancel.appeal.apply](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=1f32105635144e479a2be2688294a5d6)

Support merchants to initiate cancellation requests through the interface

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `cancelType` | INTEGER | True | The types of application for cancellation are as follows, corresponding to the enumeration: 2: Suspected batch refund 3: Incorrect address |
| `applyOrder` | OBJECT | True | Details of the application to cancel the order |
| `reason` | OBJECT | True | Explanation of Application Reasons |
| `description` | STRING | True | Explanation of the reason for cancellation initiated |
| `proofUrlList` | STRING[] | True | Related screenshots serve as supplementary evidence to illustrate the rationality of the application. The image needs to be converted into URL information and sent in through temu.order.query.signa... |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | result |
| `applySn` | STRING | apply sn |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120050003 | Cancel appeal failed |  |
| 120050002 | Invalid parent order sn |  |
| 120050001 | Invalid cancel type |  |

---

## `temu.order.cancel.appeal.result.get`

> **Official docs**: [temu.order.cancel.appeal.result.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=8225bf8ac3c445c18304132b77124e5a)

Merchant queries the status of cancellation order appeal records

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `applySnList` | STRING[] | True | Apply sn list |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Result |
| `itemList` | OBJECT[] | result item list |
| `applySn` | STRING | Apply sn |
| `status` | INTEGER | Apply cancel status : 1-Auditing 2-Approved 3-Rejected 4-Apply failed 5-Canceled |

---

## `temu.order.cancel.outofstock.apply`

> **Official docs**: [temu.order.cancel.outofstock.apply](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=469ac7d87e6943c2a3b544f35acb201a)

The user takes the initiative to initiate a stock-out situation, which will be submitted to the risk control department for review.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False | lack stock apply request |
| `parentOrderSn` | STRING | True | parent order sn |
| `orderSnList` | STRING[] | True | order sn list |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT | lack stock apply response |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `applyResult` | BOOLEAN | lack stock apply result true :apply success false: apply fail |
| `failReasonList` | OBJECT[] | apply fail reason list |
| `parentOrderSn` | STRING | parent order sn |
| `orderSn` | STRING | order sn |
| `reasonList` | STRING[] | apply fail reason code list |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 140040001 | request param error |  |
| 140040002 | no fulfillment under this condition |  |
| 140040003 | please try again later |  |

---

## `temu.order.cancel.outofstock.result.get`

> **Official docs**: [temu.order.cancel.outofstock.result.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=78d1b9fb00a54fa295dc73cf4b6981ce)

After applying for out-of-stock, since out-of-stock itself is an asynchronous operation, you need to obtain the latest out-of-stock review status through the query interface

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False | lack stock query request from ams |
| `parentOrderSn` | STRING | True | parent order sn |
| `orderSnList` | STRING[] | True | order sn list |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT | lack stock query response from ams |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `applyResultInfoList` | OBJECT[] | lack stock order apply result info list |
| `orderSn` | STRING | order sn |
| `applyStatus` | INTEGER | lack stock apply status |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 140040001 | request param error |  |
| 140040002 | no fulfillment under this condition |  |
| 140040004 | never apply lack stock |  |

---
