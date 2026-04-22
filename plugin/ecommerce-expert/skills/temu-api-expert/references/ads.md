# Temu Partner API — Ads API

Search/recommendation ad campaign management, reporting, and ROAS prediction.

## Table of Contents

- [temu.searchrec.ad.roas.pred](#temusearchrecadroaspred)
- [temu.searchrec.ad.reports.mall.query](#temusearchrecadreportsmallquery)
- [temu.searchrec.ad.reports.goods.query](#temusearchrecadreportsgoodsquery)
- [temu.searchrec.ad.create](#temusearchrecadcreate)
- [temu.searchrec.ad.detail.query](#temusearchrecaddetailquery)
- [temu.searchrec.ad.log.query](#temusearchrecadlogquery)
- [temu.searchrec.ad.goods.create.query](#temusearchrecadgoodscreatequery)
- [temu.searchrec.ad.modify](#temusearchrecadmodify)

---

## `temu.searchrec.ad.roas.pred`

> **Official docs**: [temu.searchrec.ad.roas.pred](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=dfff26bad8e94ed5abaaf5cdade50c26)

Advertising roas prediction

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsInfoList` | OBJECT[] | True | Goods information list |
| `goodsId` | LONG | True | Goods id |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Success |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `queryAdBidResult` | OBJECT[] | QueryAdBid return body |
| `goodsId` | LONG | Goods id |
| `predList` | OBJECT[] | Different staged roas list |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 230012000 | bad query params | Please check the input parameter format |
| 230012003 | unmatch mall and goods | Please enter the matching mallid and goodsid |
| 230013000 | business exception | Business exception, please try again |
| 230014000 | system exception | System exception, please try again |
| 230016701 | has no permission | Ad operation failed, please try again |
| 230016103 | not signed because of not main account | The account has not been signed, please sign the advertising agreement |

---

## `temu.searchrec.ad.reports.mall.query`

> **Official docs**: [temu.searchrec.ad.reports.mall.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=595f05856989480aa03abd58da203047)

Advertisement overall data report (mall dimension)

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `startTs` | LONG | True | Query start time, millisecond level timestamp (the value starts at 0:00 local time) |
| `endTs` | LONG | True | Query end time, millisecond-level timestamp (the value is based on local time 23:59:59 seconds 999 milliseconds) |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Success |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `reportsSummary` | OBJECT | Overall report information |
| `reportsItemList` | OBJECT[] | Report information by time period, report information divided by day level or hour level (request time span is divided by day level if it is greater than one day, and if it is equal to one day, it ... |
| `summary` | OBJECT | summary |
| `spend` | OBJECT | spend |
| `orderPayAmt` | OBJECT | orderPayAmt |
| `orderPayCnt` | OBJECT | orderPayCnt |
| `goodsNum` | OBJECT | goodsNum |
| `cartCnt` | OBJECT | cartCnt |
| `imprCnt` | OBJECT | imprCnt |
| `clkCnt` | OBJECT | clkCnt |
| `ctr` | OBJECT | ctr |
| `cvr` | OBJECT | cvr |
| `roas` | OBJECT | roas |
| `acos` | OBJECT | acos |
| `transactionCost` | OBJECT | transactionCost |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 230012000 | bad query params | Please check the input parameter format |
| 230012003 | unmatch mall and goods | Please enter the matching mallid and goodsid |
| 230013000 | business exception | Business exception, please try again |
| 230014000 | system exception | System exception, please try again |
| 230016701 | has no permission | Ad operation failed, please try again |
| 230016103 | not signed because of not main account | The account has not been signed, please sign the advertising agreement |

---

## `temu.searchrec.ad.reports.goods.query`

> **Official docs**: [temu.searchrec.ad.reports.goods.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=a218071a0dd24f44a73dcf092a386c97)

Advertisement goods data report (goods dimension)

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `startTs` | LONG | True | Query start time, millisecond level timestamp (the value starts at 0:00 local time) |
| `endTs` | LONG | True | Query end time, millisecond-level timestamp (the value is based on local time 23:59:59 seconds 999 milliseconds) |
| `goodsId` | LONG | True | Goods id |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Success |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `goodsInfo` | OBJECT | Goods information |
| `reportInfo` | OBJECT | Report information |
| `reportsSummary` | OBJECT | Overall report information |
| `reportsItemList` | OBJECT[] | Report information by time period, report information divided by day level or hour level (request time span is divided by day level if it is greater than one day, and if it is equal to one day, it ... |
| `summary` | OBJECT | summary |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 230012000 | bad query params | Please check the input parameter format |
| 230012003 | unmatch mall and goods | Please enter the matching mallid and goodsid |
| 230013000 | business exception | Business exception, please try again |
| 230014000 | system exception | System exception, please try again |
| 230016701 | has no permission | Ad operation failed, please try again |
| 230016103 | not signed because of not main account | The account has not been signed, please sign the advertising agreement |

---

## `temu.searchrec.ad.create`

> **Official docs**: [temu.searchrec.ad.create](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=7bc9231776304158a895e41a816b7805)

Advertisement creation

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `createAdReqs` | OBJECT[] | True | CreateAd parameter |
| `roas` | INTEGER | True | Target roas, multiply the actual value by 10,000 |
| `goodsId` | LONG | True | Goods id |
| `budget` | LONG | True | Advertising daily budget amount, if there is no limit, use -1 |
| `roasType` | INTEGER | False | roasType. 0: ad 1: overAll roas |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Success |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `successCreateProductNum` | INTEGER | Number of goods successfully created |
| `alreadyCreatedGoodsNum` | INTEGER | Number of goods created |
| `successGoodsIdLists` | LONG[] | Successfully created goods ids |
| `createGoodsFailMap` | MAP | Goodsid and reason for failed creation |
| `createGoodsFailObjList` | OBJECT[] | Goodsid and reason for failed creation |
| `goodsId` | LONG | Goods id |
| `reason` | STRING | Reason for creation failure |
| `success` | BOOLEAN | success |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 230012000 | bad query params | Please check the input parameter format |
| 230012003 | unmatch mall and goods | Please enter the matching mallid and goodsid |
| 230013000 | business exception | Business exception, please try again |
| 230014000 | system exception | System exception, please try again |
| 230016701 | has no permission | Ad operation failed, please try again |
| 230016103 | not signed because of not main account | The account has not been signed, please sign the advertising agreement |

---

## `temu.searchrec.ad.detail.query`

> **Official docs**: [temu.searchrec.ad.detail.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=66db5438c37446f49c122829489ac6d4)

Advertising campaign details query

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsList` | LONG[] | True | Goods list |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Success |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `adsDetail` | OBJECT[] | Ads detail |
| `goodsId` | LONG | Goods id |
| `roas` | INTEGER | Roas |
| `budget` | LONG | Budget |
| `reportsSummaryDTO` | OBJECT | Reports summary |
| `adShowStatus` | LONG | Advertising status: 0: no balance; 1: today budget 0; 2: goods sold out; 3: goods offline; 4: goods under review; 5: review rejected; 6: promotion limited; 7: pause; 8: promoting; 9: del; 10: not c... |
| `adPhase` | LONG | Advertising stage: 0: first stage, learning period; 1: second stage, stable period |
| `siteStatusInfoList` | OBJECT[] | Advertising status |
| `summary` | OBJECT | summary |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 230012000 | bad query params | Please check the input parameter format |
| 230012003 | unmatch mall and goods | Please enter the matching mallid and goodsid |
| 230013000 | business exception | Business exception, please try again |
| 230014000 | system exception | System exception, please try again |
| 230016701 | has no permission | Ad operation failed, please try again |
| 230016103 | not signed because of not main account | The account has not been signed, please sign the advertising agreement |

---

## `temu.searchrec.ad.log.query`

> **Official docs**: [temu.searchrec.ad.log.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=c2c5eda51c414e788bab914a297d1881)

Advertisement log query

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsId` | LONG | True | Goods id |
| `startTime` | LONG | True | Query start time, millisecond level timestamp (the value starts at 0:00 local time) |
| `endTime` | LONG | True | Query end time, millisecond-level timestamp (the value is based on local time 23:59:59 seconds 999 milliseconds) |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Success |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `result` | OBJECT[] | Result |
| `updatedAt` | STRING | Modification time |
| `updateSellerName` | STRING | Business name |
| `eventType` | STRING | Modification types: Currently there are three types: add, update, and delete. |
| `changeInfo` | STRING | Modify details |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 230012000 | bad query params | Please check the input parameter format |
| 230012003 | unmatch mall and goods | Please enter the matching mallid and goodsid |
| 230013000 | business exception | Business exception, please try again |
| 230014000 | system exception | System exception, please try again |
| 230016701 | has no permission | Ad operation failed, please try again |
| 230016103 | not signed because of not main account | The account has not been signed, please sign the advertising agreement |

---

## `temu.searchrec.ad.goods.create.query`

> **Official docs**: [temu.searchrec.ad.goods.create.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=374d1f7fefdb4232b7b7a0239cb4465d)

Advertising goods can create query

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsIdList` | LONG[] | True | Goods id list |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Success |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `goodsInfoList` | OBJECT[] | Goods information list |
| `goodsId` | LONG | Goods id |
| `grayReason` | OBJECT[] | Gray reason |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 230012000 | bad query params | Please check the input parameter format |
| 230012003 | unmatch mall and goods | Please enter the matching mallid and goodsid |
| 230013000 | business exception | Business exception, please try again |
| 230014000 | system exception | System exception, please try again |
| 230016701 | has no permission | Ad operation failed, please try again |
| 230016103 | not signed because of not main account | The account has not been signed, please sign the advertising agreement |

---

## `temu.searchrec.ad.modify`

> **Official docs**: [temu.searchrec.ad.modify](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=0b7140898262428eb8a4b28609112651)

Advertisement modify

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `modifyAdDTO` | OBJECT | True | ModifyAdDTO request body |
| `roas` | INTEGER | False | Roas |
| `goodsId` | LONG | False | GoodsId |
| `budget` | LONG | False | Budget |
| `status` | INTEGER | True | Modification type: 1:delete, 2:pause, 3:open, 4:modify budget, 5:modify roas |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Success |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `successModifyProductNum` | INTEGER | The number of goods successfully modified |
| `modifyGoodsRespList` | OBJECT[] | Specific information |
| `goodsId` | LONG | GoodsId |
| `reason` | STRING | Modify failure reason |
| `success` | BOOLEAN | Whether it was successful or not |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 230012000 | bad query params | Please check the input parameter format |
| 230012003 | unmatch mall and goods | Please enter the matching mallid and goodsid |
| 230013000 | business exception | Business exception, please try again |
| 230014000 | system exception | System exception, please try again |
| 230016701 | has no permission | Ad operation failed, please try again |
| 230016103 | not signed because of not main account | The account has not been signed, please sign the advertising agreement |

---
