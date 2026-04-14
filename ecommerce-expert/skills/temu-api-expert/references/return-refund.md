# Temu Partner API — Return and Refund API

After-sales order management, return labels, refund processing, and carrier information.

## Table of Contents

- [temu.aftersales.refund.issue](#temuaftersalesrefundissue)
- [bg.aftersales.parentaftersales.list.get](#bgaftersalesparentaftersaleslistget)
- [bg.aftersales.aftersales.list.get](#bgaftersalesaftersaleslistget)
- [temu.aftersales.parentaftersales.detail.get](#temuaftersalesparentaftersalesdetailget)
- [bg.aftersales.parentreturnorder.get](#bgaftersalesparentreturnorderget)
- [temu.aftersales.returnaddress.get](#temuaftersalesreturnaddressget)
- [temu.aftersales.returnlabel.prepare.get](#temuaftersalesreturnlabelprepareget)
- [temu.aftersales.signature.get](#temuaftersalessignatureget)
- [temu.aftersales.upload.returnlabel](#temuaftersalesuploadreturnlabel)
- [temu.aftersales.carrier.get](#temuaftersalescarrierget)

---

## `temu.aftersales.refund.issue`

> **Official docs**: [temu.aftersales.refund.issue](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=8b7b98c50ba04d5ab96d17b5c4d2410f)

This interface is designed to enable merchants to efficiently process refund requests within the e-commerce platform.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentAfterSalesSn` | STRING | True | After-sales Parent Order Number, Required |
| `parentOrderSn` | STRING | True | Order Number |
| `openApiRefundType` | INTEGER | True | Refund Type; enumerated as follows:1-Full Refund |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 130010004 | no afterSales found |  |
| 130010005 | operate forbid |  |
| 130010003 | There were some payable in your account, please process them in the merchant workbench before pro... |  |
| 130010000 | system error |  |
| 130010001 | The parameter is illegal. Please check if the input parameter meets the regulations. |  |

---

## `bg.aftersales.parentaftersales.list.get`

> **Official docs**: [bg.aftersales.parentaftersales.list.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=36d2f55993344cf2991815f675493560)

This interface is designed to provide real-time updates on the current after-sales status of an order within an e-commerce platform. It allows merchants and buyers to retrieve detailed information about the progress of a refund or return request, facilitating efficient communication and processing.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageSize` | INTEGER | False | Page size for pagination, default is 10, max is 200. |
| `pageNo` | INTEGER | False | Page number for pagination, default is 1. |
| `parentOrderSnList` | STRING[] | False | The list of parent order numbers to limit the query. |
| `parentAfterSalesSnList` | STRING[] | False | The list of parent after-sales order numbers to limit the query. |
| `createAtStart` | INTEGER | False | The start time for querying the status change time of parent after-sales orders, in seconds (timestamp). Defines the starting range of the status change time when querying parent after-sales orders. |
| `createAtEnd` | INTEGER | False | The end time for querying the creation time of parent after-sales orders, in seconds (timestamp). Defines the ending range (closed interval) of the creation time when querying parent after-sales or... |
| `updateAtStart` | INTEGER | False | The start time for querying the status change time of parent after-sales orders, in seconds (timestamp). Defines the starting range of the status change time when querying parent after-sales orders. |
| `updateAtEnd` | INTEGER | False | The end time for querying the status change time of parent after-sales orders, in seconds (timestamp). Defines the ending range (closed interval) of the status change time when querying parent afte... |
| `afterSalesStatusGroup` | INTEGER | False | The after-sales order status group, enumerated as follows: 1: Pending, 2: Requested, 3: Package Shipped, 4: Platform Reviewing, 5: Refunded, 6: Rejected, 7: Cancelled. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `total` | LONG | Total number of matching records. |
| `pageNumber` | INTEGER | Current page number of the result. |
| `data` | OBJECT[] | The record data returned from this query. |
| `parentAfterSalesSn` | STRING | Parent after-sales-order number. |
| `parentOrderSn` | STRING | Parent order number. |
| `afterSalesType` | INTEGER | Type of after-sales service,enumerated as follows: 1: refund only 2: return and refund |
| `parentAfterSalesStatus` | INTEGER | Current parent after-sales status. enumerated as follows: 1: Buyer has applied for a refund, pending processing, 2: Buyer has shipped the return package, 3: Return package has been received, pendin... |
| `createAt` | INTEGER | Last update time of the parent after-sales order, in seconds (timestamp). |
| `afterSalesStatusGroup` | INTEGER | The after-sales order status group, enumerated as follows: 1: Pending, 2: Requested, 3: Package Shipped, 4: Platform Reviewing, 5: Refunded, 6: Rejected, 7: Cancelled. |
| `updateAt` | INTEGER | Last update time of the parent after-sales order,in seconds (timestamp). |
| `availableOperateList` | INTEGER[] | The after-sales order supports operations list, enumerated as follows: 1.full refund, 10.upload return label. |
| `operateExpireTimeMs` | LONG | Operate expire time, unit in milliseconds. |
| `returnDeliveryType` | INTEGER | Return delivery type, enumerated as follows: 3.drop off 4.pick up. |

---

## `bg.aftersales.aftersales.list.get`

> **Official docs**: [bg.aftersales.aftersales.list.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=d1675103eeed444fa3d650aa33b462be)

This interface is designed for use in an e-commerce platform, specifically for handling after-sales service requests related to product returns and refunds. The interface allows merchants or administrators to retrieve a list of after-sales service requests made by buyers, including detailed information about each request.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageSize` | INTEGER | False | Page size for pagination, default is 10, max is 200. |
| `pageNo` | INTEGER | False | Page number for pagination, default is 1. |
| `parentAfterSalesSnList` | STRING[] | True | The list of parent after-sales order numbers to limit the query. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `total` | LONG | Total number of records. |
| `pageNumber` | INTEGER | Current page number of the result. |
| `data` | OBJECT[] | data |
| `afterSalesSn` | STRING | after-sales order number. |
| `parentAfterSalesSn` | STRING | Parent after-sales order number. |
| `productSkuId` | LONG | product sku id. |
| `goodsId` | LONG | Goods ID. |
| `skuId` | LONG | SKU ID. |
| `productList` | OBJECT[] | Product information list. |
| `applyAfterSalesGoodsNumber` | LONG | Number of items applied for after-sales service. |
| `afterSalesStatus` | INTEGER | Current after-sales status, enumerated as follows: 1: Buyer has applied for a refund, pending processing, 2: Buyer has shipped the return package, 3: Return package has been received, pending merch... |
| `afterSalesType` | INTEGER | Type of after-sales service,enumerated as follows: 1: Refund only, 2: Return and refund. |

---

## `temu.aftersales.parentaftersales.detail.get`

> **Official docs**: [temu.aftersales.parentaftersales.detail.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=f2551431265c4ea788e73fc3a741d075)

This interface is designed to provide detailed information on after-sales orders in real time

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentOrderSn` | STRING | True | Order Number |
| `parentAfterSalesSn` | STRING | True | Parent After-Sales Order Number |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `parentAfterSalesSn` | STRING | After-Sales Parent Order Number |
| `parentOrderSn` | STRING | Parent Order Number |
| `afterSalesType` | INTEGER | After-Sales Type |
| `parentAfterSalesStatus` | INTEGER | Current After-Sales Status1: Buyer applied for refund, pending processing2: Buyer's return package has been shipped3: Return package received, pending merchant processing4: Refund initiated, system... |
| `createAtMillis` | LONG | Parent After-Sales Order Creation Time, unit in milliseconds |
| `lastUpdateAtMillis` | LONG | After-sales order's last update time, unit in milliseconds |
| `availableOperateList` | INTEGER[] | After-sales order's available operate list |
| `afterSalesList` | OBJECT[] | After-Sales Sub-Order Details |
| `refundSummary` | OBJECT | refund summary |
| `buyerTotalRefund` | OBJECT | buyer total refund |
| `retailPriceRefundTaxExcl` | OBJECT | retail price refund tax excl |
| `shippingAmountRefundTaxExcl` | OBJECT | shipping amount refund tax excl |
| `discountFromTEMURefund` | OBJECT | discount from TEMU refund |
| `discountFromSellerRefund` | OBJECT | discount from seller refund |
| `taxTotalRefund` | OBJECT | tax total refund |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 130010000 | system error |  |
| 130010005 | operate forbid |  |
| 130010001 | The parameter is illegal. Please check if the input parameter meets the regulations. |  |
| 130010002 | The order has been fully shipped. |  |

---

## `bg.aftersales.parentreturnorder.get`

> **Official docs**: [bg.aftersales.parentreturnorder.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=986d1dc0ad9d4d44a380b8078405bae2)

This interface is designed to provide merchants or administrators within an e-commerce platform with detailed return logistics information for a set of after-sales service requests.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentAfterSalesSn` | STRING | True | parent after-sales order number. |
| `afterSalesSn` | STRING | False | after-sales order number. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |

---

## `temu.aftersales.returnaddress.get`

> **Official docs**: [temu.aftersales.returnaddress.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=05d0a325704d4d538d708f3e256168e0)

temu.aftersales.returnaddress.get interface is designed to retrieve sensitive shipping address information for a specific return order.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentAfterSalesSn` | STRING | True | parentAfterSalesSn |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
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


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 180020001 | This country has not yet opened address query capabilities |  |
| 180020008 | Please sign on DPA agreement first |  |
| 180021001 | full managed, unSupport query address |  |
| 180021002 | only refund type, unSupport query address |  |
| 180021003 | uploaded label, unSupport query address |  |
| 180021004 | no need upload label, unSupport query address |  |

---

## `temu.aftersales.returnlabel.prepare.get`

> **Official docs**: [temu.aftersales.returnlabel.prepare.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=f6d52305e84d4945b2b1c8d3218bbe20)

This interface is designed to query return label preparation information.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentAfterSalesSn` | STRING | True | Parent after-sales order number. |
| `parentOrderSn` | STRING | True | Parent order number. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `availableReturnWarehouseList` | OBJECT[] | List of available merchant return warehouses. |
| `userPickUpTimezone` | STRING | User's pick up timezone. |
| `userSelectedPickUpTimeList` | OBJECT[] | List of user selected pick up time interval. |
| `merchantLatestPickUpTime` | LONG | Merchant's latest optional selected timestamp, unit in milliseconds. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 130010001 | The parameter is illegal. Please check if the input parameter meets the regulations. |  |
| 130010005 | operate forbid |  |

---

## `temu.aftersales.signature.get`

> **Official docs**: [temu.aftersales.signature.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=026c7431ac634dec9da8d7ab3c5a4825)

This interface is designed to query signature information.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `signature` | STRING | Signature required for uploading files, can only be used once and expires after 300 seconds. |

---

## `temu.aftersales.upload.returnlabel`

> **Official docs**: [temu.aftersales.upload.returnlabel](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=9058c531e8cb41e0939db689ef059eaf)

This interface is designed to upload return label.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentAfterSalesSn` | STRING | True | Parent after-sales order number. |
| `parentOrderSn` | STRING | True | Parent order number. |
| `returnLabelDTOList` | OBJECT[] | False | Return label information. |
| `pickUpTimeScheduleMode` | INTEGER | False | Pick up time scheduling mode, required for pick up, enumerated as follows: 1: Select user's preferred time interval, 2: Re-schedule time interval, 3: Select latest pick up time point. |
| `startTimestamp` | LONG | False | Start timestamp, unit in milliseconds, required for pick up time schedule mode 1 and 2. |
| `endTimestamp` | LONG | False | End timestamp, unit in milliseconds, required for pick up time schedule mode 1 and 2. |
| `latestTimestamp` | LONG | False | Latest timestamp, unit in milliseconds, required for pick up time schedule mode 3. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Empty field |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 130010000 | system error |  |
| 130010001 | The parameter is illegal. Please check if the input parameter meets the regulations. |  |
| 130010004 | no afterSales found |  |
| 130010005 | operate forbid |  |
| 130010006 | return label invalid |  |
| 130010007 | tracking number invalid |  |

---

## `temu.aftersales.carrier.get`

> **Official docs**: [temu.aftersales.carrier.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=c1eceff2f3434bef8246668cc557ebb5)

This interface is designed to query return carrier information.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `returnWarehouseRegionId1` | LONG | True | Merchant return warehouse primary region id. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `carrierDTOList` | OBJECT[] | List of return carrier information. |
| `carrierId` | LONG | Logistics company id. |
| `carrierName` | STRING | Logistics company name. |

---
