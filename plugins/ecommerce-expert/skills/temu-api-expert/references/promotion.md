# Temu Partner API — Promotion API

Query promotion activities, enroll goods, and manage promotion operations.

## Table of Contents

- [bg.promotion.activity.query](#bgpromotionactivityquery)
- [bg.promotion.activity.candidate.goods.query](#bgpromotionactivitycandidategoodsquery)
- [bg.promotion.activity.goods.query](#bgpromotionactivitygoodsquery)
- [bg.promotion.activity.goods.enroll](#bgpromotionactivitygoodsenroll)
- [bg.promotion.activity.goods.operation.query](#bgpromotionactivitygoodsoperationquery)
- [bg.promotion.activity.goods.update](#bgpromotionactivitygoodsupdate)

---

## `bg.promotion.activity.query`

> **Official docs**: [bg.promotion.activity.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=05820fed7179430c8e353905692d51b6)

query the local to local activity

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageNumber` | INTEGER | True | page number for pagination, default is 1. |
| `activityEndTime` | LONG | False | end time for querying activity, in seconds. |
| `activityIdList` | LONG[] | False | unique identifier for the activity |
| `activityStatus` | INTEGER | False | the status of activity 1 - Not started 2 - Ongoing 3 - Ended |
| `pageSize` | INTEGER | True | Page size for pagination, default is 10, max is 100. |
| `activityStartTime` | LONG | False | start time for querying activity, in seconds. |
| `activityType` | INTEGER | True | the type of activity 2 - lightning deals 13 - advanced big sale 27 - Clearance deals 100 - official big sale |
| `onlyQueryJoinedActivity` | BOOLEAN | False | whether to query only joined activities. TRUE / FALSE |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT | query result |
| `success` | BOOLEAN | Whether the request was successful or not |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 220010001 | parameter is illegal |  |
| 220010002 | system error, please try again later |  |

---

## `bg.promotion.activity.candidate.goods.query`

> **Official docs**: [bg.promotion.activity.candidate.goods.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=0a11814e7d4146b595918ff3c0f3e239)

the local to local activity candidate goods

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `activityId` | LONG | True | unique identifier for the activity |
| `pageNumber` | INTEGER | True | page number for pagination, default is 1. |
| `pageSize` | INTEGER | True | Page size for pagination, default is 10, max is 100. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT | query result |
| `success` | BOOLEAN | Whether the request was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 220010001 | parameter is illegal |  |
| 220010002 | system error, please try again later |  |
| 220010003 | The activity has been cancelled, please select another activity to participate |  |
| 220010004 | The activity has ended, please select another activity to participate |  |

---

## `bg.promotion.activity.goods.query`

> **Official docs**: [bg.promotion.activity.goods.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=08f3f87d05a24bac882732141e0d9672)

query the local to local activity goods

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `activityId` | LONG | True | unique identifier for the activity |
| `pageNumber` | INTEGER | True | page number for pagination, default is 1. |
| `pageSize` | INTEGER | True | Page size for pagination, default is 10, max is 100. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT | query result |
| `success` | BOOLEAN | Whether the request was successful or not |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 220010001 | parameter is illegal |  |
| 220010002 | system error, please try again later |  |
| 220010003 | The activity has been cancelled, please select another activity to participate |  |
| 220010004 | The activity has ended, please select another activity to participate |  |

---

## `bg.promotion.activity.goods.enroll`

> **Official docs**: [bg.promotion.activity.goods.enroll](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=27a87ec9d0d94273a48096c050f17854)

enroll products in the local to local activity

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `activityId` | LONG | True | unique identifier for the activity |
| `enrollGoods` | OBJECT | True | goods information required for activity registration |
| `traceCode` | STRING | False | Optional. The traceCode is an Idempotent Key for single operations. Its length cannot exceed 32 characters. |
| `enrollSkuList` | OBJECT[] | True | sku information required for registering activity |
| `activityQuantity` | LONG | True | activity quantity, the quantity you set for participating activities. This is independent of product quantity |
| `goodsId` | LONG | True | goods id |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT | enrollment result |
| `success` | BOOLEAN | Whether the request was successful or not |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 220010001 | parameter is illegal |  |
| 220010002 | system error, please try again later |  |
| 220010003 | The activity has been cancelled, please select another activity to participate |  |
| 220010004 | The activity has ended, please select another activity to participate |  |

---

## `bg.promotion.activity.goods.operation.query`

> **Official docs**: [bg.promotion.activity.goods.operation.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=57a37eb5dd104e3f9f90118e3276b291)

query the result of operation in the local to local activity

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `draftIdList` | LONG[] | True | goods registration activity draft id, which will be generated when the pre-procedure is successfully completed. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT[] | operation result |
| `success` | BOOLEAN | Whether the request was successful or not |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 220010001 | parameter is illegal |  |
| 220010002 | system error, please try again later |  |

---

## `bg.promotion.activity.goods.update`

> **Official docs**: [bg.promotion.activity.goods.update](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=29959238217c41f38f5904e32bf1d14f)

update activity goods information in the local to local activity

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `traceCode` | STRING | False | Optional. The traceCode is an Idempotent Key for single operations. Its length cannot exceed 32 characters. |
| `activityId` | LONG | True | unique identifier for the activity |
| `activityQuantity` | LONG | False | activity quantity, the quantity you set for participating activities. This is independent of product quantity. The updated activity quantity must be more than the original one. |
| `goodsId` | LONG | True | goods id |
| `operateType` | INTEGER | True | the type of operation. It determines which parameters are required. For example, if the operation type is 20, then the "activityQuantity" parameter must not be null, while all other parameters shou... |
| `updateSkuList` | OBJECT[] | False | sku information required for updating activity sku information |
| `addSkuList` | OBJECT[] | False | sku information required for adding activity sku information |
| `activitySupplierPrice` | LONG | False | the base price you set for activities, the items in the activity quantity are sold at the activity price and settled at the activity base price. |
| `skuId` | LONG | False | sku id |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT | update result |
| `success` | BOOLEAN | Whether the request was successful or not |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 220010001 | parameter is illegal |  |
| 220010002 | system error, please try again later |  |
| 220010003 | The activity has been cancelled, please select another activity to participate |  |
| 220010004 | The activity has ended, please select another activity to participate |  |

---
