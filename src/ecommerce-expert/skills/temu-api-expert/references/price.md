# Temu Partner API — Price API

Price recommendations, price order management, and SKU price changes.

## Table of Contents

- [temu.local.goods.baseprice.recommend](#temulocalgoodsbasepricerecommend)
- [temu.local.goods.recommendedprice.query](#temulocalgoodsrecommendedpricequery)
- [bg.local.goods.priceorder.change.sku.price](#bglocalgoodspriceorderchangeskuprice)
- [bg.local.goods.priceorder.query](#bglocalgoodspriceorderquery)

---

## `temu.local.goods.baseprice.recommend`

> **Official docs**: [temu.local.goods.baseprice.recommend](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=c335c8a2e4574325a6129927d49e7c3a)

recommend baseprice

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False | request |
| `language` | STRING | False | Language |
| `supplierPriceEstimateQry` | OBJECT | True | supplier Price Estimate Qry |
| `trademarkInfo` | OBJECT | False | Brand information, if provided, will assist merchants in suggesting more accurate prices. |
| `goodsBasicInfo` | OBJECT | True | goods Basic information |
| `supplierPriceEstimateSkuQryList` | OBJECT[] | True | supplier price estimate need info |
| `externPlatformPriceInfo` | OBJECT | True | The selling price of the product on other platforms |
| `specIdList` | LONG[] | True | Specification ID List |
| `productDimensionsInfo` | OBJECT | False | product Dimensions Msg |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT | response |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | result |
| `supplierPriceEstimateInfo` | OBJECT | goods estimate supplier info |
| `skuEstimateInfoList` | OBJECT[] | sku estimate supplier info |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150012003 | List price for the same color must match. |  |
| 150012002 | The site size/currency information needs to be consistent with the site's product support informa... |  |
| 150012001 | The "Product Dimensions" information is a mandatory field for the Brazilian site. |  |
| 150010124 | The catId not a leaf category |  |
| 150010003 | Invalid Request Parameters |  |
| 150010002 | System error, please try again later |  |

---

## `temu.local.goods.recommendedprice.query`

> **Official docs**: [temu.local.goods.recommendedprice.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=2e473e289f2541c1b2b2318d841e0f25)

Support merchants in querying the recommended supply prices.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |
| `recommendedPriceType` | INTEGER | True | Recommended price type: 10-Low traffic, 20-Restricted traffic |
| `goodsIdList` | LONG[] | True | Search param: list of Goods ID. The list size should be between 1 and 100 |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `goodsList` | OBJECT[] | Goods recommended price info list |
| `goodsId` | LONG | Goods ID |
| `skuList` | OBJECT[] | SKU recommended price info list |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |

---

## `bg.local.goods.priceorder.change.sku.price`

> **Official docs**: [bg.local.goods.priceorder.change.sku.price](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=dbf95d09e514491f8685013824cecc76)

Support merchants within the white list to modify sku base prices in batches.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsId` | LONG | True | Goods Id |
| `changeSkuPriceDTOList` | OBJECT[] | True | SKU information and reason that adjust price |
| `reason` | STRING | False | The reason of Adjust price |
| `skuChangePriceBaseDTOList` | OBJECT[] | True | SKU information |
| `rejectSkuPricing` | BOOLEAN | False | reject if price order is wait merchant confirm. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Is success |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Return specific information |
| `successSkuList` | LONG[] | SKU list with successfully changed prices |
| `failedSkuList` | LONG[] | SKU list with failed change price |
| `failedSkuReasonMap` | MAP | Reasons for price adjustment failure |
| `successPriceOrderList` | OBJECT[] | List of price orders that request for changing price successfully |
| `priceOrderSn` | STRING | Price order Sn |
| `skuIdList` | LONG[] | List of SKUs corresponding to price order |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150011103 | The price imported from your ERP system for this product has not been confirmed. Please confirm t... |  |
| 150011101 | The price change in this request exceeds the allowed range. Please check the request parameters. ... |  |
| 150019004 | Invalid newSupplierPrice. The recommended price for skuId: {*} is {*}. |  |
| 150011018 | Price currency {*} can have at most {*} decimal points. |  |
| 150010233 | The product is participating in an activity or the activity's cool-down period still applies to t... |  |
| 150010105 | Mall information not found |  |
| 150010188 | The mall and goods not match. |  |
| 150010189 | The sku and goods not match |  |
| 150010190 | The sku repeat in batch change sku price |  |
| 150010191 | The reason repeat in batch change sku price |  |
| 150010192 | Clothes sku supplier price or reason not equal |  |
| 150010197 | The count of reason is over size. |  |
| 150010198 | The count of SKU is over size. |  |
| 150010003 | Invalid Request Parameters |  |

---

## `bg.local.goods.priceorder.query`

> **Official docs**: [bg.local.goods.priceorder.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=dcfb2f00fa4c497ea6ce15fd5b0ae84a)

Support merchants within the white list to query the price offer list.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `page` | INTEGER | False | Page number |
| `size` | INTEGER | False | Page size, lower than 100 |
| `priceOrderType` | INTEGER | False | Pricing type, default is offer for pricing assessment, 1: offer for pricing assessment 2: offer for pricing opportunities or modification |
| `priceOrderSubType` | INTEGER | False | price order sub type, 2002:base price increase invitations; 2003:sales boost. |
| `goodsName` | STRING | False | Search param: goodsName |
| `goodsId` | STRING | False | Search param: goodsId |
| `priceOrderSnList` | STRING[] | False | search param:list of price order sn |
| `orderBy` | STRING | False | The field to sort by: goods_create_time, order_create_time. The default value is order_create_time. |
| `orderByType` | INTEGER | False | The type to sort by: 0-DESC, 1-ASC. The default value is 0-DESC. |
| `goodsCreateTimeFrom` | LONG | False | Search param: The starting time of goods creation |
| `goodsCreateTimeTo` | LONG | False | Search param: The end time of goods creation |
| `priceOrderCreateTimeFrom` | LONG | False | Search param: The starting time of price order creation |
| `priceOrderCreateTimeTo` | LONG | False | Search param: The end time of price order creation |
| `goodsIdList` | STRING[] | False | goodsIdList |
| `status` | INTEGER | False | price order status |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Is success |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Return specific information |
| `pageNum` | INTEGER | Page number |
| `total` | LONG | Total |
| `priceAuditList` | OBJECT[] | Price offer list |
| `priceOrderId` | LONG | Pricing ID |
| `goodsId` | LONG | Goods ID |
| `pricingType` | INTEGER | pricing type: 0: offer for pricing assessment 1: offer for pricing opportunities 2: offer for pricing modification |
| `specName` | STRING[] | Specification Name |
| `skuIdList` | LONG[] | SKU id list |
| `status` | INTEGER | Status of price offer |
| `suggestSupplierPrice` | OBJECT | Reference Base Price |
| `targetSupplierPrice` | OBJECT | New Base Price |
| `sourceSupplierPrice` | OBJECT | source supplier price |
| `supplierPrice` | OBJECT | Final Base Price |
| `reason` | STRING | Rejection Reason |
| `rejectTypeDesc` | STRING | Rejection Type Description |
| `priceCommitId` | LONG | Price commit id |
| `priceCommitVersion` | INTEGER | Price commit version |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010105 | Mall information not found |  |

---
