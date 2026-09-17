# Temu Partner API — Order API

Query orders, order details, shipping info, amounts, and customizations.

## Table of Contents

- [bg.order.list.v2.get](#bgorderlistv2get)
- [bg.order.detail.v2.get](#bgorderdetailv2get)
- [bg.order.shippinginfo.v2.get](#bgordershippinginfov2get)
- [bg.order.decryptshippinginfo.get](#bgorderdecryptshippinginfoget)
- [bg.order.amount.query](#bgorderamountquery)
- [bg.order.combinedshipment.list.get](#bgordercombinedshipmentlistget)
- [bg.order.customization.get](#bgordercustomizationget)
- [temu.local.order.verification.upload](#temulocalorderverificationupload)

---

## `bg.order.list.v2.get`

> **Official docs**: [bg.order.list.v2.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=554fd46b45ee49269cbdd6d4008a5dc1)

The bg.order.list.v2.get interface is designed for support batch return of corresponding order lists based on filtering criteria.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageNumber` | INTEGER | False | Page number for pagination, default is 1. |
| `pageSize` | INTEGER | False | Page size for pagination, default is 10, max is 100. |
| `parentOrderStatus` | INTEGER | False | Parent order status, default is to query all. Enum values: 0 :All, 1 :PENDING, Pending status 2 :UN_SHIPPING, Awaiting shipment 3 :CANCELED, Order canceled, 4 :SHIPPED, Order shipped, 5 : RECEIPTED... |
| `parentOrderSnList` | STRING[] | False | List of parent order numbers, max 20 per request. |
| `createAfter` | INTEGER | False | Start time for querying parent order creation, in seconds(timestamp). Defines the starting range of the creation time when querying parent orders. -Must be used in conjunction with createBefore. |
| `createBefore` | INTEGER | False | End time for querying parent order creation, in seconds(timestamp). Defines the ending range (closed interval) of the creation time when querying parent orders. -Must be used in conjunction with cr... |
| `expectShipLatestTimeStart` | INTEGER | False | Start time for querying expected latest shipment, in seconds. |
| `expectShipLatestTimeEnd` | INTEGER | False | End time for querying expected latest shipment, in seconds. |
| `updateAtStart` | INTEGER | False | Start time for querying order update, in seconds(timestamp). Defines the starting range of the status change time when querying parent orders. -Must be used in conjunction with updateAtEnd. |
| `updateAtEnd` | INTEGER | False | End time for querying order update, in seconds(timestamp). Defines the ending range (closed interval) of the status change time when querying parent orders. -Must be used in conjunction with update... |
| `parentConfirmTimeStart` | INTEGER | False | - Query the confirmed start time of the parentorder, with the input parameter in seconds (timestamp) - Define the starting range for the final confirmation time when querying the parentorder - Must... |
| `parentConfirmTimeEnd` | INTEGER | False | -Query the confirmation end time of the parentorder in seconds (timestamp) as a parameter -Define the end range of confirmation time when querying parentorder -Must be used together with parentConf... |
| `regionId` | LONG | False | Region ID, e.g., USA - 211. |
| `fulfillmentTypeList` | STRING[] | False | the type of order fulfillment.enum values: fulfillBySeller :fulfill by seller, fulfillByCooperativeWarehouse : fulfill by CooperativeWarehouse. |
| `parentOrderLabel` | STRING[] | False | List of PO order status labels: soon_to_be_overdue past_due pending_buyer_cancellation pending_buyer_address_change pending_risk_control_alert signature_required_on_delivery |
| `packageAbnormalTypeList` | STRING[] | False | There may be logistics anomalies after the order is shipped: WRONG_SHIPPING_ADDRESS SUSPECTED_ERROR_PROVIDER NO_TRACK TRACK_TOO_EARLY OVERTIME_COLLECTION TRACK_COLLECT_FAIL |
| `sortby` | STRING | False | Sort by, output in reverse order. By default, the order creation time is used. The corresponding enumeration is:updateTime,createTime. |
| `hasPreSaleOrder` | BOOLEAN | False | Whether the parent order contains presale orders for inventory in transit. |
| `hasQualificationRequiredOrder` | BOOLEAN | False | Whether the parent order contains orders that require qualification upload |
| `skuId` | LONG | False | SKU ID |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `pageItems` | OBJECT[] | Page items |
| `totalItemNum` | INTEGER | Total number of matching records. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 140020012 | parentConfirmTimeEnd needs to be greater than the parentConfirmTimeStart |  |
| 140020013 | {*} not passed in |  |
| 140020014 | The format of {*} is inaccurate and requires a second level timestamp |  |
| 140020001 | This interface does not support cross-border sellers. Please check whether the store bound to the... |  |

---

## `bg.order.detail.v2.get`

> **Official docs**: [bg.order.detail.v2.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=9bf33a25319e4d7bbaf5ece4b823b9c3)

The bg.order.detail.v2.get interface is designed for merchants to retrieve detailed information about a specific order within their respective stores. This functionality provides merchants with access to comprehensive order details, enabling them to process, fulfill, and manage individual orders with precision.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentOrderSn` | STRING | True | Parent order number |
| `fulfillmentTypeList` | STRING[] | False | the type of order fulfillment.enum values: fulfillBySeller :fulfill by seller, fulfillByCooperativeWarehouse : fulfill by CooperativeWarehouse. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | result |
| `parentOrderMap` | OBJECT | Parent order information. |
| `orderList` | OBJECT[] | Order information. |
| `orderSn` | STRING | Order number (sub-order number). |
| `quantity` | INTEGER | The quantity of saler needs to fulfill. quantity=originalOrderQuantity-canceledQuantityBeforeShipment. |
| `canceledQuantityBeforeShipment` | INTEGER | The quantity of canceled before shipment. |
| `originalOrderQuantity` | INTEGER | originalOrderQuantity |
| `goodsId` | LONG | Goods ID. |
| `packageSnInfo` | OBJECT[] | package information |
| `packageAbnormalTypeList` | STRING[] | There may be logistics anomalies after the order is shipped: WRONG_SHIPPING_ADDRESS SUSPECTED_ERROR_PROVIDER NO_TRACK TRACK_TOO_EARLY OVERTIME_COLLECTION TRACK_COLLECT_FAIL SIGNED_BUT_UNRECEIVED_TASK |
| `skuId` | LONG | Sku id. It is only valid for LOCAL sellers not SEMI sellers. |
| `spec` | STRING | Product specification description for customer |
| `originalSpecName` | STRING | Product specification description for seller. Only for orders whose confirmation time is within no more than six months, please fill in this field. |
| `thumbUrl` | STRING | Thumbnail image URL. |
| `goodsName` | STRING | Product name for customer |
| `originalGoodsName` | STRING | Product name for seller. Only for orders whose confirmation time is within no more than six months, please fill in this field. |
| `orderStatus` | INTEGER | Status of the order. 1-PENDING; 2-UN_SHIPPING; 3-CANCELED; 4-SHIPPED; 41-PARTIALLY_SHIPPED; 5-DELIVERED; 51-PARTIALLY_DELIVERED. |
| `productList` | OBJECT[] | Product information. |
| `orderLabel` | OBJECT[] | The label of order |
| `fulfillmentWarning` | STRING[] | Fulfillment Prompt.enum values: SAVE_SN_INFORMATION_FOR_RETURN- It is recommended to save sn information for this order to identify the authenticity of the returned goods. REQUIRES_AUTHENTICATION_R... |
| `fulfillmentType` | STRING | The type of order fulfillmen,enum values: fulfillBySeller, fulfillByCooperativeWarehouse. |
| `inventoryDeductionWarehouseId` | STRING | The id of inventory deduction warehouse. |
| `inventoryDeductionWarehouseName` | STRING | The name of inventory deduction warehouse. |
| `orderPaymentType` | STRING | Order payment type: COD, PPD |
| `isCancelledDuringPending` | BOOLEAN | Whether the order is completely cancelled during the pending period |
| `earliestTimeBuyShippingLabel` | INTEGER | Order can only buy shipping label after this time. |
| `earliestTimeGetShippingDocument` | INTEGER | Order can only get shipping document after this time. |
| `orderShippingTime` | INTEGER | Time when the order was shipped. If the order contains unshipped or delayed packages, the return value is null. |
| `isShipmentConsolidatedByMainMall` | BOOLEAN | When true, indicates the PO has been consolidated for shipment by the main mall. This requires shipment confirmation and shipping label operations on the main mall side. |
| `orderCreateTime` | INTEGER | The time when the order was created. |
| `qualificationUploadEndTime` | LONG | Deadline for uploading order qualification documents |
| `hasUploadedEvidence` | BOOLEAN | Whether the merchant has uploaded verification information such as SN, IMEI, and appraisal report. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 140020001 | This interface does not support cross-border sellers. Please check whether the store bound to the... |  |
| 140020002 | Order not found |  |
| 140020003 | The provider has at least one unsigned agreement. Please go to the home page to sign. |  |

---

## `bg.order.shippinginfo.v2.get`

> **Official docs**: [bg.order.shippinginfo.v2.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=ccc2f59661584f5e8e205d85ddb9a6c9)

The bg.order.shippinginfo.get.V2 interface is designed to retrieve shipping address information for a specific order. This functionality is crucial for merchants and logistics providers to ensure that orders are shipped to the correct location.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentOrderSn` | STRING | False | parentOrderSn |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `receiptName` | STRING | Name |
| `receiptAdditionalName` | STRING | Additional Name |
| `mobile` | STRING | Phone Number |
| `backupMobile` | STRING | Alternate Phone |
| `mail` | STRING | Virtual Email |
| `regionName1` | STRING | First-Level Administrative Division Name |
| `regionName2` | STRING | Secondary Administrative Division Name |
| `regionName3` | STRING | Third-Level Administrative Division Name |
| `regionName4` | STRING | Fourth-Level Administrative Division Name |
| `addressLine1` | STRING | Address Line 1 |
| `addressLine2` | STRING | Address Line 2 |
| `addressLine3` | STRING | Address Line 3 |
| `postCode` | STRING | Postal Code |
| `addressLineAll` | STRING | Address Line 1 + Line 2 + Line 3 |
| `addressExtra` | OBJECT | addressExtra |
| `warning` | OBJECT | warning information |
| `isRestriction` | BOOLEAN | isRestriction |
| `reason` | INTEGER | When there is an address return restriction, it indicates the restriction scenario, which may be enumerated as follows: 1-COD, 2-Restricting self shipment, 3-promise only buy shipping. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 180020001 | This country has not yet opened address query capabilities |  |
| 180020003 | Invalid param |  |
| 180020004 | Invalid business type |  |
| 180020008 | Please sign on DPA agreement first |  |
| 180020030 | Your store has been restricted from confirming shipment by tracking number. Please use the online... |  |

---

## `bg.order.decryptshippinginfo.get`

> **Official docs**: [bg.order.decryptshippinginfo.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=001b8d067220423c9da40c8c3b4010be)

bg.order.decryptshippinginfo.get interface is designed to retrieve sensitive shipping address information for a specific order.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentOrderSn` | STRING | False | parentOrderSn |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `receiptName` | STRING | Name |
| `receiptAdditionalName` | STRING | Additional Name |
| `mobile` | STRING | Phone Number |
| `backupMobile` | STRING | Alternate Phone |
| `mail` | STRING | Virtual Email |
| `regionName1` | STRING | regionName1 |
| `regionName2` | STRING | regionName2 |
| `regionName3` | STRING | regionName3 |
| `regionName4` | STRING | regionName4 |
| `addressLine1` | STRING | addressLine1 |
| `addressLine2` | STRING | addressLine2 |
| `addressLine3` | STRING | addressLine3 |
| `postCode` | STRING | postCode |
| `addressLineAll` | STRING | addressLineAll |
| `addressExtra` | OBJECT | addressExtra |
| `firstName` | STRING | firstName |
| `lastName` | STRING | lastName |
| `additionalFirstName` | STRING | additionalFirstName |
| `additionalLastName` | STRING | additionalLastName |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 180020001 | This country has not yet opened address query capabilities |  |
| 180020003 | Invalid param |  |
| 180020004 | Invalid business type |  |
| 180020008 | Please sign on DPA agreement first |  |
| 180020030 | Your store has been restricted from confirming shipment by tracking number. Please use the online... |  |

---

## `bg.order.amount.query`

> **Official docs**: [bg.order.amount.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=5454abbb70374f4ba7f72ac654fdb174)

Provide the supply price information corresponding to the orders for the self-developed ERP

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentOrderSn` | STRING | True | Parent order number. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `parentOrderMap` | OBJECT | Parent order information. |
| `orderList` | OBJECT[] | Order information. |
| `warning` | STRING[] | warning message |

---

## `bg.order.combinedshipment.list.get`

> **Official docs**: [bg.order.combinedshipment.list.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=67de1544d4ca4a8dbd78f57911a5159b)

The bg.order.combinedshipment.list.get interface is designed for merchants to retrieve combined shipping groups including lists of parent orders that can be combined for shipping.

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
| `result` | OBJECT |  |
| `combinedShippingGroups` | OBJECT[] | Combined shipping groups including lists of parent orders that can be combined for shipping. |
| `combinedShippingGroup` | OBJECT[] | A list of parent orders that can be combined for shipping. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 140020001 | This interface does not support cross-border sellers. Please check whether the store bound to the... |  |
| 140020005 | Invalid parameter, Please correct and retry. | Check if the request parameters are correct and resend the request. |

---

## `bg.order.customization.get`

> **Official docs**: [bg.order.customization.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=e8f86a2f5241441e9b095bf309d04dce)

Self developed sellers and third-party ISVs obtain customized product content information in bulk through Open API

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `orderSnList` | STRING[] | False | orderSnList, up to 10 orders can be queried at once |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT[] |  |
| `orderSn` | STRING | OrderSn corresponding to customized information |
| `customizedType` | INTEGER | Customized type, enum values: - 1: pure text customization, no customized templates - 2: customized graphics and text, with customized templates available |
| `customizedData` | STRING | Graphic customization content, in json format, this field will only be returned when customizedType=2 |
| `previewList` | OBJECT[] | Graphic customization preview information, this field will only be returned when customizedType=2 |
| `templateId` | LONG | Customization template ID when user created customized information, return null when there is no template for the product |
| `templateType` | INTEGER | Customization template type when user created customized information, return null when there is no template for the product, enum values: - 1: only image - 2: only text - 3: text and image |
| `customizedText` | STRING | Customization text, this field will only be returned when customizedType=1 |
| `customizedSvgList` | OBJECT[] | Customized information list in SVG format |
| `compressedFileUrl` | STRING | Image URL and Compression file URL, The API caller needs to call this URL to get the document This URL will expire in 10 minutes once it is created. if the URL is expired, you can call this API aga... |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120020001 | API service exception, please try again later. | API service exception, please try again later. |
| 120020002 | Invalid request. | Please check the request parameters. |
| 120020003 | There are no orderSns in body. | Please pass the correct orderSns value. |
| 120020004 | The passed OrderSns value do not contain a custom type order. | Please pass the correct custom product orderSn value. |
| 120020005 | OrderSns are invalid. | OrderSns are invalid, please have a check. |

---

## `temu.local.order.verification.upload`

> **Official docs**: [temu.local.order.verification.upload](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=0dc7ab71b3434d6fbaf0a7a0141fc3d5)

The interface supports uploading serial numbers (SN) / International Mobile Equipment Identity (IMEI) of high-value goods, or authentication information for second-hand goods.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `orderList` | OBJECT[] | False | order unique info list |
| `orderSn` | STRING | False | order sn |
| `verificationInfo` | OBJECT[] | False | electronic ams open unique info list |
| `secondHandVerificationInfo` | OBJECT[] | False | second hand ams open verification info |
| `secondHandProofCertificateCode` | STRING | False | second hand proof certificate code |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 140040001 | request param error |  |
| 140040003 | please try again later |  |
| 140040005 | This order is not in the "wait-shipping" status. |  |
| 140040006 | This order is not a designated order and does not require verification (high-value order, pre-own... |  |
| 140040007 | The parameters uploaded for this order are incorrect. |  |
| 140040008 | Only the serial number (SN) can be transmitted; transmitting the IMEI results in an error. |  |
| 140040009 | Only IMEI can be transmitted; transmitting SN results in an error. |  |
| 140040010 | The number of items uploaded for this order does not match the number of SKU. |  |

---
