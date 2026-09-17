# SHEIN Open API — Customer Order API

Order listing, order details, address export, shipping channels, express info upload, logistics ordering, and tracking.

## Table of Contents

- [Query order list API](#query-order-list-api)
- [Query order detail API](#query-order-detail-api)
- [Export address API](#export-address-api)
- [Query channel information at the merchant level](#query-channel-information-at-the-merchant-level)
- [Upload expresses info API](#upload-expresses-info-api)
- [Query warehouse address](#query-warehouse-address)
- [Query available shipping warehouses for the order](#query-available-shipping-warehouses-for-the-order)
- [Query available logistics information for the order](#query-available-logistics-information-for-the-order)
- [Online order](#online-order)
- [Query order result](#query-order-result)
- [Switch export address to shipping](#switch-export-address-to-shipping)
- [Sync invoice info to SHEIN API](#sync-invoice-info-to-shein-api)
- [Print express info API](#print-express-info-api)
- [Customer order logistics tracking inquiry](#customer-order-logistics-tracking-inquiry)
- [Confirmation of no goods API](#confirmation-of-no-goods-api)
- [Cancel splitting order packages](#cancel-splitting-order-packages)
- [Confirm splitting order packages](#confirm-splitting-order-packages)

---

## Query order list API

> **Official docs**: [Query order list API](https://open.sheincorp.com/documents/apidoc/detail/3001269)

**Method**: `POST` &nbsp; **Path**: `/order/order-list`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `queryType` | integer | Yes | Query type: 1: Query based on order issuance time / 2: Query based on order update time (When issuing an order, the issuance time will be synchronized to the update time) |
| `startTime` | string | Yes | Start time; Example: 2024-12-12 15:38:29 (UTC+8) |
| `endTime` | string | Yes | End time; Example: 2024-12-12 15:38:29 (UTC+8) |
| `page` | integer | Yes | Page number |
| `pageSize` | integer | Yes | Number of items returned per page; Please set an integer between 1 and 30 |
| `orderStatus` | integer | No | Order status: 1: Pending processing/ 2: Pending shipment/ 3: Pending shein shipment/ 4: Shipped/ 5: Delivered/ 6: User refunded/ 7: Pending collection/ 8: Reported damage/ 9: Rejected |
| `queryOrderType` | integer | No | Query the orders corresponding to the type of shipping warehouse; 1: Certified warehouse shipping orders / 2: SHEIN warehouse shipping orders / 3: Merchant warehouse shipping orders / 4: All orders; If not provided, Brazilian merchants will return... |
| `cteInvoiceStatus` | integer | No | Brazil market CTE billing status；1: All packages under the order (except canceled ones) have completed billing/ 2: There are packages under the order with incomplete billing |
| `nfeInvoiceStatus` | integer | No | Brazil market NFE invoicing status;1:Completed NFE invoicing/ 2:Incomplete NFE invoicing (for Brazilian sellers, when order invoice information is synchronized through return invoice information, status changes from 2 to 1)/ 3:Need to retransmit N... |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |
| `info` | object | Yes |
| `count` | integer | No |
| `orderList` | object[] | Yes |
| `orderNo` | string | No |
| `orderStatus` | string | No |
| `orderCreateTime` | string | No |
| `orderUpdateTime` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/order/order-list' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
  "queryType": 1,
  "startTime": "2023-08-09 12:00:00",
  "endTime": "2023-08-10 23:59:59",
  "page": 1,
  "pageSize": 30,
  "orderStatus": 1
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "count": 2,
        "orderList": [
            {
                "orderNo": "GSON8H44Y0004CU",
                "orderStatus": "1",
                "orderCreateTime": "2023-08-09 18:03:04",
                "orderUpdateTime": "2023-08-10 17:29:34"
            },
            {
                "orderNo": "H23081033497436161",
                "orderStatus": "1",
                "orderCreateTime": "2023-08-10 17:45:01",
                "orderUpdateTime": "2023-08-11 14:36:34"
            }
        ]
    }
}
```

---

## Query order detail API

> **Official docs**: [Query order detail API](https://open.sheincorp.com/documents/apidoc/detail/3001619)

**Method**: `POST` &nbsp; **Path**: `/order/order-detail`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNoList` | string[] | Yes | Order Number List; Up to 30 items; |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `traceId` | string | No |
| `info` | object[] | Yes |
| `orderNo` | string | No |
| `unProcessReason` | integer[] | No |
| `isOverLimitOrder` | integer | No |
| `orderType` | integer | No |
| `optionalLogisticsList` | integer[] | No |
| `orderLogisticsType` | integer | No |
| `orderPlaceType` | integer | No |
| `receiveMsg` | object | No |
| `city` | string | No |
| `country` | string | No |
| `province` | string | No |
| `postCode` | string | No |
| `performanceType` | string | No |
| `orderStatus` | integer | No |
| `isCod` | integer | No |
| `orderTag` | integer | No |
| `printOrderStatus` | integer | No |
| `invoiceStatus` | integer | No |
| `settleActuallyPrice` | decimal | No |
| `orderGoodsInfoList` | object[] | Yes |
| `goodsId` | bigint | No |
| `skuCode` | string | No |
| `skc` | string | No |
| `goodsSn` | string | No |
| `sellerSku` | string | No |
| `goodsStatus` | integer | No |
| `newGoodsStatus` | integer | No |
| `skuAttribute` | object[] | Yes |
| `attrValueId` | string | No |
| `attrName` | string | No |
| `language` | string | No |
| `timeOutList` | object[] | No |
| `timeOutTime` | datetime | No |
| `timeOutType` | integer | No |
| `goodsTitle` | string | No |
| `spuPicURL` | string | No |
| `goodsWeight` | integer | No |
| `storageTag` | integer | No |
| `performanceTag` | integer | No |
| `goodsExchangeTag` | long | No |
| `beExchangeEntityId` | bigint | No |
| `orderCurrency` | string | No |
| `saleCurrency` | string | No |
| `sellerCurrencyPrice` | decimal | No |
| `costPrice` | decimal | No |
| `orderCurrencyStoreCouponPrice` | decimal | No |
| `orderCurrencyPromotionPrice` | decimal | No |
| `settleCurrencyPromotionPrice` | decimal | No |
| `commission` | decimal | No |
| `commissionRate` | decimal | No |
| `serviceCharge` | decimal | No |
| `performanceServiceCharge` | decimal | No |
| `estimatedIncome` | decimal | No |
| `spuName` | string | No |
| `saleTax` | decimal | No |
| `sellerRealTax` | decimal | No |
| `mxTaxPrice` | decimal | No |
| `commissionSaleTax` | decimal | No |
| `warehouseCode` | string | No |
| `warehouseName` | string | No |
| `sellerCurrencyDiscountPrice` | decimal | No |
| `unpackingGroupNo` | string | No |
| `unpackingGroupInvoiceStatus` | string | No |
| `customizationFlag` | integer | Yes |
| `customizationInfo` | object | No |
| `customInfoId` | string | No |
| `texts` | string[] | No |
| `orderLabels` | string[] | No |
| `packageWaybillList` | object[] | Yes |
| `packageNo` | string | No |
| `deliveryNo` | string | No |
| `waybillNo` | string | No |
| `carrier` | string | No |
| `carrierCode` | string | No |
| `productInventoryList` | object[] | Yes |
| `productId` | string | No |
| `packageLabel` | string | No |
| `sortingCode` | string | No |
| `expressSortingCode` | string | No |
| `isCutOffSeller` | int64 | No |
| `packageInvoiceProblems` | object[] | No |
| `problemCode` | string | No |
| `problemDescEnglish` | string | No |
| `problemField` | string | No |
| `proposalEnglish` | string | No |
| `packageNo` | string | No |
| `orderCurrency` | string | No |
| `saleCurrency` | string | No |
| `productTotalPrice` | decimal | No |
| `totalCostPrice` | decimal | No |
| `storeDiscountTotalPrice` | decimal | No |
| `promotionDiscountTotalPrice` | decimal | No |
| `totalSettleCurrencyPromotionPrice` | decimal | No |
| `totalCommission` | decimal | No |
| `totalServiceCharge` | decimal | No |
| `totalPerformanceServiceCharge` | decimal | No |
| `estimatedGrossIncome` | decimal | No |
| `totalSaleTax` | decimal | No |
| `totalSellerRealTax` | decimal | No |
| `totalMxTaxPrice` | decimal | No |
| `sellerShippingFee` | decimal | No |
| `orderAllocateTime` | string | No |
| `requestDeliveryTime` | string | No |
| `printingTime` | string | No |
| `scheduleDeliveryTime` | string | No |
| `pickUpTime` | string | No |
| `orderReceiptTime` | string | No |
| `orderReturnTime` | string | No |
| `orderMsgUpdateTime` | string | No |
| `orderTime` | string | No |
| `paymentTime` | string | No |
| `deliveryServiceType` | integer | No |
| `performanceBillingType` | integer | No |
| `sellerDeliveryTime` | string | No |
| `warehouseDeliveryTime` | string | No |
| `orderRejectionTime` | string | No |
| `orderReportedLossTime` | string | No |
| `billNo` | string | No |
| `salesArea` | integer | No |
| `stockMode` | integer | No |
| `salesSite` | string | No |
| `storeCode` | integer | No |
| `expectedCollectTime` | string | No |
| `requestPrintTime` | string | No |
| `requestHandoverTime` | string | No |
| `requestSignTime` | string | No |
| `cteInvoiceStatus` | integer | No |
| `paymentInfo` | object | No |
| `payNo` | string | No |
| `payMethod` | string | No |
| `installmentFlag` | integer | No |
| `cardType` | string | No |
| `channelPayNo` | string | No |
| `cnpj` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/order/order-detail' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
  "orderNoList": [
    "GSONPE05Y0004Q7"
  ]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": [
        {
            "orderNo": "GSO1CL53800M5D4",
            "orderType": 1,
            "orderPlaceType": 2,
            "optionalLogisticsList": [
                1,
                2
            ],
            "orderLogisticsType": 0,
            "receiveMsg": {
                "country": "United States",
                "province": "puerto rico",
                "city": "Jeddah",
                "postCode": "39900-000"
            },
            "performanceType": 2,
            "orderStatus": 1,
            "isCod": 2,
            "isOverLimitOrder": 2,
            "unpackingStatus": null,
            "orderTag": 0,
            "deliveryType": 1,
            "printOrderStatus": 1,
            "invoiceStatus": 4,
            "orderGoodsInfoList": [
                {
                    "goodsId": 5230236437987443003,
                    "skuCode": "I73dnsqbbier",
                    "skc": "sa25060976623960851",
                    "goodsSn": "dangao wen 01",
                    "sellerSku": "12312312312333",
                    "goodsStatus": 1,
                    "newGoodsStatus": 1,
                    "skuAttribute": [
                        {
                            "attrValueId": "2147488295",
                            "attrName": "藏蓝色",
                            "language": "CN"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "US"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "PT"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "TH"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "ES"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "IT"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "PL"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "TR"
                        }
                    ],
                    "goodsTitle": "GoodsName111111111111",
                    "spuPicURL": "http://imgdeal-test01.shein.com/pi_img/2021/11/03/16359230894287290938_thumbnail_220x293.jpg",
                    "goodsWeight": 500.0,
                    "storageTag": 1,
                    "performanceTag": 2,
                    "goodsExchangeTag": 1,
                    "unpackingGroupNo": "",
                    "unpackingGroupInvoiceStatus": null,
                    "beExchangeEntityId": 0,
                    "orderCurrency": "USD",
                    "saleCurrency": null,
                    "sellerCurrencyPrice": 12.98,
                    "costPrice": null,
                    "orderCurrencyStoreCouponPrice": 0.0,
                    "orderCurrencyPromotionPrice": 0.0,
                    "settleCurrencyPromotionPrice": null,
                    "commission": 0.0,
                    "commissionRate": 0.0,
                    "serviceCharge": null,
                    "performanceServiceCharge": 0.0,
                    "estimatedIncome": 12.98,
                    "spuName": "a250609766239",
                    "saleTax": 0.37,
                    "sellerRealTax": 0.0,
                    "commissionSaleTax": null,
                    "warehouseCode": "PS2251996304",
                    "warehouseName": "U.S.",
                    "sellerCurrencyDiscountPrice": 17.33,
                    "mxTaxPrice": 0.0,
                    "timeOutList": [
                        {
                            "timeOutType": 1,
                            "timeOutTime": "2025-07-25T19:22:31.000+0800"
                        },
                        {
                            "timeOutType": 100,
                            "timeOutTime": "2025-07-28T06:22:31.000+0800"
                        }
                    ],
                    "customizationFlag": 1,
                    "customizationInfo": {},
                    "freightSource": 0
                },
                {
                    "goodsId": 5230236437987443004,
                    "skuCode": "I73dnsqbbier",
                    "skc": "sa25060976623960851",
                    "goodsSn": "dangao wen 01",
                    "sellerSku": "12312312312333",
                    "goodsStatus": 1,
                    "newGoodsStatus": 1,
                    "skuAttribute": [
                        {
                            "attrValueId": "2147488295",
                            "attrName": "藏蓝色",
                            "language": "CN"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "US"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "PT"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "TH"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "ES"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "IT"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "PL"
                        },
                        {
                            "attrValueId": "2147488295",
                            "attrName": "Navy",
                            "language": "TR"
                        }
                    ],
                    "goodsTitle": "GoodsName111111111111",
                    "spuPicURL": "http://imgdeal-test01.shein.com/pi_img/2021/11/03/16359230894287290938_thumbnail_220x293.jpg",
                    "goodsWeight": 500.0,
                    "storageTag": 1,
                    "performanceTag": 2,
                    "goodsExchangeTag": 1,
                    "unpackingGroupNo": "",
                    "unpackingGroupInvoiceStatus": null,
                    "beExchangeEntityId": 0,
                    "orderCurrency": "USD",
                    "saleCurrency": null,
                    "sellerCurrencyPrice": 12.98,
                    "costPrice": null,
                    "orderCurrencyStoreCouponPrice": 0.0,
                    "orderCurrencyPromotionPrice": 0.0,
                    "settleCurrencyPromotionPrice": null,
                    "commission": 0.0,
                    "commissionRate": 0.0,
                    "serviceCharge": null,
                    "performanceServiceCharge": 0.0,
                    "estimatedIncome": 12.98,
                    "spuName": "a250609766239",
                    "saleTax": 0.37,
                    "sellerRealTax": 0.0,
                    "commissionSaleTax": null,
                    "warehouseCode": "PS2251996304",
                    "warehouseName": "U.S.",
                    "sellerCurrencyDiscountPrice": 17.33,
                    "mxTaxPrice": 0.0,
                    "timeOutList": [
                        {
                            "timeOutType": 1,
                            "timeOutTime": "2025-07-25T19:22:31.000+0800"
                        },
                        {
                            "timeOutType": 100,
                            "timeOutTime": "2025-07-28T06:22:31.000+0800"
                        }
                    ],
                    "customizationFlag": 1,
                    "customizationInfo": {},
                    "freightSource": 0
                }
            ],
            "packageWaybillList": [
                {
                    "packageNo": "GU25072532795729922",
                    "deliveryNo": "GU25072532795729922",
                    "waybillNo": "",
                    "carrier": "",
                    "carrierCode": "",
                    "expressShortName": null,
                    "productInventoryList": [
                        {
                            "productId": "5230236437987443003"
                        },
                        {
                            "productId": "5230236437987443004"
                        }
                    ],
                    "packageLabel": "",
                    "sortingCode": "",
                    "expressSortingCode": "",
                    "isCutOffSeller": 2,
                    "performanceServiceCharge": 0
                }
            ],
            "orderCurrency": "USD",
            "saleCurrency": null,
            "productTotalPrice": 25.96,
            "totalCostPrice": null,
            "storeDiscountTotalPrice": 0.0,
            "promotionDiscountTotalPrice": 0.0,
            "totalSettleCurrencyPromotionPrice": null,
            "totalCommission": 0.0,
            "totalServiceCharge": null,
            "totalPerformanceServiceCharge": 0,
            "sellerShippingFee": null,
            "estimatedGrossIncome": 25.96,
            "totalSaleTax": 0.74,
            "totalSellerRealTax": 0.0,
            "totalMxTaxPrice": 0.0,
            "orderTime": "2025-07-25T17:22:11.000+0800",
            "paymentTime": "2025-07-25T17:22:13.000+0800",
            "orderAllocateTime": "2025-07-25T17:22:31.000+0800",
            "requestDeliveryTime": "2025-07-25T18:22:31.000+0800",
            "requestPrintTime": null,
            "requestHandoverTime": null,
            "requestSignTime": "2025-07-27T05:22:31.000+0800",
            "sellerDeliveryTime": "",
            "warehouseDeliveryTime": "",
            "printingTime": "",
            "scheduleDeliveryTime": "",
            "pickUpTime": "",
            "orderReceiptTime": "",
            "orderRejectionTime": "",
            "orderReportedLossTime": "",
            "orderReturnTime": "",
            "orderMsgUpdateTime": "2025-07-25T17:28:40.319+0800",
            "billNo": "GSO1CL53800M5D4",
            "salesArea": 1,
            "stockMode": 3,
            "salesSite": "shein-us",
            "storeCode": 5318181723,
            "declareCollectionPattern": 2,
            "settleActuallyPrice": 0.0,
            "unProcessReason": [],
            "packageInvoiceProblems": [],
            "expectedCollectTime": "",
            "cteInvoiceStatus": 2,
            "addTime": "2025-07-25T17:22:32.000+0800"
        }
    ],
    "bbl": {},
    "traceId": "fa07cda05e678290"
}
```

---

## Export address API

> **Official docs**: [Export address API](https://open.sheincorp.com/documents/apidoc/detail/3001466)

**Method**: `POST` &nbsp; **Path**: `/order/export-address`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | Yes | Order Number |
| `handleType` | integer | Yes | Operation type; 1: Export only recipient address information / 2: Export recipient address and change order status to pending shipment, i.e., change order status value from "1" to "2" |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |
| `info` | object | Yes |
| `receiveMsgList` | object[] | Yes |
| `orderNo` | string | No |
| `lastName` | string | No |
| `middleName` | string | No |
| `firstName` | string | No |
| `country` | string | No |
| `province` | string | No |
| `city` | string | No |
| `district` | string | No |
| `street` | string | No |
| `address` | string | No |
| `addressExt` | string | No |
| `phone` | string | No |
| `postCode` | string | No |
| `taxNo` | string | No |
| `email` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/order/export-address' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
"orderNo":"GSON8H44Y0004CU", "handleType": 2
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "receiveMsgList": [
            {
                "orderNo": "GSON8H44Y0004CU",
                "lastName": "Price",
                "middleName": null,
                "firstName": "Lindsey",
                "country": "United States",
                "province": "MARYLAND",
                "city": "Port Deposit",
                "district": "frgds",
                "street": "",
                "address": "127 Arthur Avenue",
                "addressExt": "dadao",
                "phone": "55555555",
                "postCode": "21904",
                "taxNo": "66666"
            }
        ],
        "unProcessReason": []
    }
}
```

---

## Query channel information at the merchant level

> **Official docs**: [Query channel information at the merchant level](https://open.sheincorp.com/documents/apidoc/detail/3001598)

**Method**: `POST` &nbsp; **Path**: `/order/express-channel`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `warehouseAddressCode` | string | No | Warehouse address code; if left blank, only the merchant's self-shipping channels are returned; if entered, it can accurately match the available self-shipping and shein cooperative logistics channels under this address and sales site; value is ob... |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `traceId` | string | No |
| `info` | object | Yes |
| `warehouseAddressCode` | string | No |
| `expressChannels` | object[] | Yes |
| `site` | string | No |
| `expressIdCode` | string | No |
| `expressChannelCode` | string | No |
| `platformLogisticsChannels` | object[] | Yes |
| `expressId` | integer | No |
| `expressIdCode` | string | No |
| `site` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/order/express-channel' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
    "warehouseAddressCode":"WH2505093344009216"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "warehouseAddressCode": "WH2505093344009216",
        "expressChannels": [
            {
                "site": "shein-us",
                "expressIdCode": "CDL",
                "expressChannelCode": "USpS-P-LAX-BP2-4",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "DHL ecommerce",
                "expressChannelCode": "USpS-P-JFK-BP2-16",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "FedEx",
                "expressChannelCode": "213131237250214-Na",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "GLS",
                "expressChannelCode": null,
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "LASERSHIP",
                "expressChannelCode": "USpS-P-JFK-BP2-15",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "liusijia000",
                "expressChannelCode": null,
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "liusijia0001",
                "expressChannelCode": null,
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "liusijiaceshi02",
                "expressChannelCode": "ssjj",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "LSO",
                "expressChannelCode": "USpS-P-LAX-BP2-9",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "Nacex",
                "expressChannelCode": "AAOguqing-LHR-SS-P-C1",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "Speedx",
                "expressChannelCode": "Ug2313",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "Test Us NoCategory",
                "expressChannelCode": "Test-Us-NoCategory",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "UDS",
                "expressChannelCode": "USpS-F-DFW-BP2-6",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "Uni",
                "expressChannelCode": "USpS-F-JFK-BP2-17",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "UPS",
                "expressChannelCode": "D2D-N250318-Na",
                "returnExpressCode": null,
                "returnExpressName": null
            },
            {
                "site": "shein-us",
                "expressIdCode": "USPS",
                "expressChannelCode": "USpS-P-JFK-BP2-1",
                "returnExpressCode": null,
                "returnExpressName": null
            }
        ],
        "platformLogisticsChannels": [
            {
                "expressId": 138,
                "expressIdCode": "cassie的快速小屋",
                "site": "shein-us"
            }
        ]
    },
    "bbl": {},
    "traceId": "2ae5f7e9d773db60"
}
```

---

## Upload expresses info API

> **Official docs**: [Upload expresses info API](https://open.sheincorp.com/documents/apidoc/detail/3001274)

**Method**: `POST` &nbsp; **Path**: `/order/import-batch-multiple-express`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | Yes | Order Number |
| `infoList` | object[] | Yes | Waybill information, up to 100 can be transmitted. |
| `expressCode` | string | Yes | Waybill number; if the logistics company's waybill number format is incorrect, it will not pass validation. |
| `expressIdCode` | string | Yes | Logistics companies available to merchants，obtained through 【Query shipping channels】 |
| `expressChannelCode` | string | No | Channel merchant product code，obtained through 【Query shipping channels】 |
| `goodsId` | bigint | Yes | Unique identifier of the product; if multiple pieces of the same product, each goodsId is different, obtained through the order details API. |
| `status` | integer | Yes | Should waybill information be deleted; 1. Delete order waybill information based on goodsId; 2. Update waybill information. |
| `goodExpressRemarkDto` | object | No | Used to supplement package waybill information in scenarios where multiple packages of the same SKU are sent for large items，note that not all merchants have this operation permission； |
| `handleExpressRemark` | integer | Yes | Operation type this time；1:Add or update additional waybill logistics information/ 2:Delete additional waybill logistics information |
| `orderGoodsExpressRemarkList` | object[] | No | Additional waybill logistics information |
| `expressCode` | string | Yes | Waybill number |
| `expressIdCode` | string | Yes | Logistics companies available to merchants，obtained through 【Query shipping channels】 |
| `expressChannelCode` | string | No | Channel merchant product code，obtained through 【Query shipping channels】 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |
| `info` | object[] | Yes |
| `expressCode` | string | No |
| `expressIdCode` | string | No |
| `expressChannelCode` | string | No |
| `goodsId` | bigint | No |
| `errorMsg` | string | No |
| `status` | string | No |
| `errorOrderGoodsExpressRemark` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/order/import-batch-multiple-express' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
    "orderNo": "GSON8F44T00000M",
    "infoList": [
        {
            "expressCode": "EPC15B7844A21",
            "expressIdCode": "TForce",
            "goodsId": 3000000000065815,
            "status": 2
        }
    ]
}'
```

---

## Query warehouse address

> **Official docs**: [Query warehouse address](https://open.sheincorp.com/documents/apidoc/detail/3001335)

**Method**: `POST` &nbsp; **Path**: `/gsp/warehouse-address`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

_No additional request parameters._

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `openApiAddressInfos` | object[] | No |
| `warehouseAddressCode` | string | No |
| `warehouseName` | string | No |
| `salesSite` | string[] | No |
| `addressInfo` | object | No |
| `country` | string | No |
| `province` | string | No |
| `city` | string | No |
| `district` | string | No |
| `postCode` | string | No |
| `address1` | string | No |
| `address2` | string | No |
| `phone` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/gsp/warehouse-address' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1753756515388' \
--header 'Content-Type: application/json;charset=UTF-8' \
--data-raw '{
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "openApiAddressInfos": [
            {
                "warehouseAddressCode": "WH2505093344009216",
                "warehouseName": "美国发货仓",
                "salesSite": [
                    "shein-us"
                ],
                "addressInfo": {
                    "country": "United States",
                    "state": "CALIFORNIA",
                    "city": "Avenal",
                    "district": "",
                    "postCode": "94501",
                    "address1": "test address",
                    "address2": "",
                    "phone": "2313343434"
                }
            }
        ]
    },
    "bbl": {},
    "traceId": "5180cdc2c1911c29"
}
```

---

## Query available shipping warehouses for the order

> **Official docs**: [Query available shipping warehouses for the order](https://open.sheincorp.com/documents/apidoc/detail/3001629)

**Method**: `POST` &nbsp; **Path**: `/gsp/available-shipping-warehouse`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | Yes | Order Number |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | No |
| `traceId` | string | Yes |
| `info` | object | Yes |
| `availableWarehouses` | object[] | Yes |
| `availableStatus` | integer | Yes |
| `unavailableReason` | string | No |
| `unavailableReasonCode` | string | No |
| `warehouseAddressCode` | string | Yes |
| `warehouseName` | string | Yes |
| `orderNo` | string | Yes |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/gsp/available-shipping-warehouse' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
  "orderNoList": [
    "GSONPE05Y0004Q7"
  ]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "orderNo": "GSO16V548000005",
        "availableWarehouses": [
            {
                "warehouseAddressCode": "WH2507144950139904",
                "warehouseName": "test",
                "availableStatus": 1,
                "unavailableReasonCode": null,
                "unavailableReason": null
            },
            {
                "warehouseAddressCode": "WH2603193709455361",
                "warehouseName": "unavailablewarehousetest",
                "availableStatus": 1,
                "unavailableReasonCode": null,
                "unavailableReason": null
            }
        ]
    },
    "bbl": {},
    "traceId": "ff8b429d45297963"
}
```

---

## Query available logistics information for the order

> **Official docs**: [Query available logistics information for the order](https://open.sheincorp.com/documents/apidoc/detail/3001655)

**Method**: `POST` &nbsp; **Path**: `/gsp/order-mapping-channels`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | Yes | Order Number |
| `packageSizeInfo` | object | Yes | Package dimensions |
| `packageHeight` | string | Yes | Height |
| `packageLength` | string | Yes | Length |
| `packageWidth` | string | Yes | Width |
| `unit` | string | Yes | Unit (currently only supports cm) |
| `packageWeightInfo` | object | Yes | Package weight |
| `packageWeight` | string | Yes | Weight, supports decimals |
| `unit` | string | Yes | Unit (currently only supports g) |
| `prePackageInfo` | object | No |  |
| `goodsIds` | int64[] | No | Product id, cod orders need to pass this parameter; non-cod orders do not pass this parameter |
| `warehouseAddressCode` | string | Yes | Warehouse address code |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `traceId` | string | Yes |
| `info` | object | Yes |
| `warehouseAddressCode` | string | No |
| `orderNo` | string | No |
| `preRequestId` | string | No |
| `channelInfoList` | object[] | Yes |
| `expressIdCode` | string | No |
| `expressId` | integer | No |
| `expressChannelCode` | string | No |
| `expressShortName` | string | No |
| `performanceCost` | double | No |
| `currencyCode` | string | No |
| `estimateMinDay` | json | No |
| `estimateMaxDay` | json | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/gsp/order-mapping-channels' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1753756515388' \
--header 'Content-Type: application/json;charset=UTF-8' \
--data-raw '{
  "orderNo": "GSO1Q104T00000F",
  "packageSizeInfo": {
    "packageHeight": "11",
    "packageLength": "11",
    "packageWidth": "11",
    "unit": "cm"
  },
  "packageWeightInfo": {
    "packageWeight": "100",
    "unit": "g"
  },
  "prePackageInfo": {
    "goodsIds": [
      6230236437987393393,
      6230236437987393395
    ]
  },
  "warehouseAddressCode": "WH2511072791432194"
}
'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "warehouseAddressCode": "WH2505093344009216",
        "orderNo": "GSO1CL53800M5D4",
        "preRequestId": "POJ2507283989769217",
        "channelInfoList": [
            {
                "expressIdCode": "123",
                "expressId": 995,
                "expressChannelCode": "usD2D1250707-Na",
                "expressShortName": "",
                "performanceCost": 13.02,
                "currencyCode": "USD",
                "estimateMinDay": null,
                "estimateMaxDay": null
            },
            {
                "expressIdCode": "这是第三方派送服务商11",
                "expressId": 1730,
                "expressChannelCode": "usD2Dtest02250709-Na",
                "expressShortName": "这是资源别称UniTEST02",
                "performanceCost": 69.15,
                "currencyCode": "USD",
                "estimateMinDay": 1,
                "estimateMaxDay": 77
            }
        ]
    },
    "bbl": {},
    "traceId": "5fcc7a8c8c58b02b"
}
```

---

## Online order

> **Official docs**: [Online order](https://open.sheincorp.com/documents/apidoc/detail/3001600)

**Method**: `POST` &nbsp; **Path**: `/gsp/place-express-order`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `expressChannelCode` | string | Yes | Channel provider product code; |
| `packageInfoList` | object[] | Yes | Package details; (currently supports single order multiple packages) |
| `orderNo` | string | Yes | Order Number |
| `goodsIds` | int64[] | No | Each product has a unique ID. If a SKU has multiple items, each item's goodsId is unique, and goodsId can be obtained from the order details |
| `preRequestId` | string | Yes | Channel pre-judgment request ID; obtained by calling the 【Query Available Logistics Information for Order】 interface |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `traceId` | string | Yes |
| `info` | object | No |
| `deliveryNo` | string | No |
| `placeRequestId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/gsp/place-express-order' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1753760372427' \
--header 'Content-Type: application/json;charset=UTF-8' \
--data-raw '{
"expressChannelCode": "D2D-CN99251013-Na",
"packageInfoList":[{
     "goodsIds": [
      6230236437987393393,
      6230236437987393394,
      6230236437987393395
    ],
    "orderNo": "GSO1Q104T00000F"
}],
"preRequestId": "POJ2511122680589312"
}
'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "deliveryNo": "GU25072532795729922",
        "placeRequestId": "2507284064100355"
    },
    "bbl": {},
    "traceId": "5d7090d3839f5a67"
}
```

---

## Query order result

> **Official docs**: [Query order result](https://open.sheincorp.com/documents/apidoc/detail/3001601)

**Method**: `POST` &nbsp; **Path**: `/gsp/check-express-order`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `placeRequestId` | string | No | Order request ID; (order request ID and delivery number cannot both be empty); obtained by calling the 【Place Order Online】/open-api/gsp/place-express-order interface |
| `deliveryNo` | string | No | Waybill number；(Order request id and waybill number cannot be empty at the same time) |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `traceId` | string | Yes |
| `info` | object | No |
| `placeRequestId` | string | No |
| `deliveryNo` | string | No |
| `handleResult` | integer | No |
| `placeStateFailReasonDesc` | string | No |
| `printStatus` | integer | No |
| `warehouseAddressCode` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/gsp/check-express-order' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1753756515388' \
--header 'Content-Type: application/json;charset=UTF-8' \
--data-raw '{
"placeRequestId": "2507284064100355"
}'
```

### Response Example

```json
{
 "code": "0",
 "msg": "OK",
 "info": {
 "placeRequestId": "2602063531109378",
 "deliveryNo": "GU26020626456866816",
 "handleResult": 2,
 "placeStateFailReasonDesc": null,
 "printStatus": 1,
 "expressChannelCode": "D2D-CN99251013-Na",
 "warehouseAddressCode": "WH2511072791432194"
 },
 "bbl": {},
 "traceId": "7b8f97c0335094cb"
}
```

---

## Switch export address to shipping

> **Official docs**: [Switch export address to shipping](https://open.sheincorp.com/documents/apidoc/detail/3001602)

**Method**: `POST` &nbsp; **Path**: `/gsp/switch-self-shipping`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | Yes | Order number; (after calling the interface, self-shipping is done, platform logistics can no longer be used for shipping) |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `traceId` | string | Yes |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/gsp/switch-self-shipping' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1753760372427' \
--header 'Content-Type: application/json;charset=UTF-8' \
--data-raw '{
"orderNo": "2507284064100355"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
            },
    "bbl": {},
    "traceId": "25030823e590f886"
}
```

---

## Sync invoice info to SHEIN API

> **Official docs**: [Sync invoice info to SHEIN API](https://open.sheincorp.com/documents/apidoc/detail/3001527)

**Method**: `POST` &nbsp; **Path**: `/order/sync-invoice-info`

**Applicable to**: Self-operated


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderInvoiceInfos` | object[] | Yes | Upload Invoice Information, Maximum 50 records in one API call |
| `orderNo` | string | Yes | Order Number |
| `unpackingGroupNo` | string | No | Package Group Number; Obtained through order details API |
| `ie` | string | No | I.E. - State Registration Number, Can be left empty, only send invoiceXmlContent |
| `icms` | integer | Yes | 1-TAXED Requires Tax Payment; 2 NO-TAXED No Tax Required; 3-FERR Individual Seller |
| `invoiceNo` | string | No | Invoice number; Maximum length: 100 characters; Can only be empty when sending invoiceXmlContent |
| `invoiceKey` | string | No | Invoice key; Maximum length: 100 characters; Can only be empty when sending invoiceXmlContent |
| `invoiceSn` | string | No | Invoice series number; Maximum length: 100 characters; Can only be empty when sending invoiceXmlContent |
| `amount` | decimal | No | Invoice total amount; Data type: BigDecimal(10,2); Can only be empty when sending invoiceXmlContent |
| `taxNo` | string | No | Tax number, maximum length 100, can be empty, only send invoiceXmlContent |
| `currency` | string | No | Currency (e.g., BRL), can be empty, only send invoiceXmlContent |
| `invoiceType` | string | No | Invoice type (invoice import/export type, platform side invoices only have shipments. Brazil site, bio information: Saída), can be empty, only send invoiceXmlContent |
| `authorizationNumber` | string | No | Invoice authorization number (e.g., 135220009577779), can be empty, only send invoiceXmlContent |
| `authorizationTime` | string | No | Invoice authorization time (e.g., 2022-12-04 00:00:00), can be empty, only send invoiceXmlContent |
| `invoiceIssueTime` | string | No | Invoice issuance time (e.g., 2022-12-04 10:00:00), can be empty, only send invoiceXmlContent |
| `quantity` | string | No | Total quantity on the invoice. BigDecimal(15,4), can be empty, only send invoiceXmlContent |
| `invoiceXmlContent` | string | No | Invoice xml content.The parameter hopefully the entire text can be transferred.If not, need to be URLencode with UTF-8. For Example: Before: |
| `sendMsg` | object | Yes | Sender information |
| `name` | string | Yes | Name (Upload sender's name or company name) |
| `taxNo` | string | Yes | Tax number (e.g., 99867389620, business's CNPJ tax number is 14 digits, individual's CPF tax number is 11 digits) |
| `ie` | string | No | I.E. - State Registration (e.g., 99867389620; if the entity is a company (exempt) or an individual, enter "EXEMPT" here to indicate exemption) |
| `stateProvinceCode` | string | Yes | Two-character code for State and Province (e.g., SP) |
| `cityCode` | string | Yes | City code (for example: 3518800) |
| `city` | string | Yes | City (for example: GUARULHOS) |
| `neighborhood` | string | Yes | Region (for example: CUMBICA, if not, default use S/N) |
| `street` | string | Yes | Street (for example: AVENIDA ORLANDA BERGAMO ESQUINA COM A AVENIDA ABRAAO LINCOLN, if not, default use S/N) |
| `houseNumber` | string | Yes | House number (for example: 1132, if not, default use S/N) |
| `zipCode` | string | Yes | Postal code (for example: 13236533) |
| `receiveMsg` | object | Yes | Recipient Information |
| `name` | string | Yes | Name (Enter the recipient's name or company name) |
| `taxNo` | string | Yes | Tax number (e.g., 99867389620, business's CNPJ tax number is 14 digits, individual's CPF tax number is 11 digits) |
| `ie` | string | No | I.E. - State Registration (e.g., 99867389620; if the entity is a company (exempt) or an individual, enter "EXEMPT" here to indicate exemption) |
| `stateProvinceCode` | string | Yes | Two-character code for State and Province (e.g., SP) |
| `cityCode` | string | Yes | City code (for example: 3518800) |
| `city` | string | Yes | City (for example: GUARULHOS) |
| `neighborhood` | string | Yes | Region (for example: CUMBICA, if not, default use S/N) |
| `street` | string | Yes | Street (for example: AVENIDA ORLANDA BERGAMO ESQUINA COM A AVENIDA ABRAAO LINCOLN, if not, default use S/N) |
| `houseNumber` | string | Yes | House number (for example: 1132, if not, default use S/N) |
| `zipCode` | string | Yes | Postal code (for example: 13236533) |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |
| `info` | json | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/order/sync-invoice-info' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
  "orderInvoiceInfos": [
    {
      "orderNo": "GSONAM44T00NWYG",
      "ie": "ISENTO",
      "icms": "3",
      "invoiceNo": "000000339",
      "invoiceKey": "35211119750001055210100000033912606872431111",
      "invoiceSn": "001",
      "amount": 13870.74,
      "taxNo": "6102",
      "currency": "USD",
      "invoiceType": "Saída",
      "authorizationNumber": "135220009577779",
      "authorizationTime": "2023-07-13 00:00:00",
      "invoiceIssueTime": "2023-07-13 10:00:00",
      "quantity": "910",
      "sendMsg": {
        "name": "哈哈23",
        "taxNo": "99867389622111",
        "ie": "99867389622",
        "stateProvinceCode": "SP",
        "cityCode": "1456781",
        "city": "HHS1",
        "neighborhood": "hh1",
        "street": "换货1",
        "houseNumber": "hh3",
        "zipCode": "06330281"


      },
      "receiveMsg": {
        "name": "哈哈2",
        "taxNo": "99867389622",
        "ie": "99867389623",
        "stateProvinceCode": "SP",
        "cityCode": "1456783",
        "city": "HHS3",
        "neighborhood": "hh3",
        "street": "换货3",
        "houseNumber": "hh3",
        "zipCode": "06330281"
      }
    }
  ]
}'
```

### Response Example

```json
{
  "code": "0",
  "msg": "OK",
  "info": {},
  "bbl": {},
  "traceId": "test"
}
```

---

## Print express info API

> **Official docs**: [Print express info API](https://open.sheincorp.com/documents/apidoc/detail/3001603)

**Method**: `POST` &nbsp; **Path**: `/order/print-express-info`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | No | Order number (in the scenario of platform-specified logistics, input parameter order + package number to obtain the shipping label) |
| `packageNo` | string[] | No | Package number (in the scenario of platform-specified logistics, input parameter order + package number to obtain the shipping label) |
| `deliveryNo` | string | No | Waybill package number (in the offline order scenario, this field is used as an input parameter to print the shipping label); obtained from the Request Order Details interface; |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `traceId` | string | No |
| `info` | object[] | Yes |
| `orderNo` | json | No |
| `packageNo` | json | No |
| `filePdfUrl` | string | No |
| `remark` | json | No |
| `deliveryNo` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/order/print-express-info' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
    "orderNo": "GSONAM44T00NWYG",
    "packageNo": [
        "GC23111521875392514"
    ]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": [
        {
            "orderNo": "GSONAM44T00NWYG",
            "packageNo": "GC23111521875392514",
            "filePdfUrl": "https://html2pdf.oss-cn-shenzhen.aliyuncs.com/pdf2-test/unkown/2023/11/15/1700037991818-1700066791818-121182f5a8ee863d126db23608788fd9.oss.pdf?AWSAccessKeyId=LTAI5tLUgHZGZqEUN2t8bPCR&Expires=1700066792&Signature=K2JWsHXH6z6msbTFvrfkcnKBN5Q%3D"
        }
    ],
    "bbl": {}
}
```

---

## Customer order logistics tracking inquiry

> **Official docs**: [Customer order logistics tracking inquiry](https://open.sheincorp.com/documents/apidoc/detail/3001604)

**Method**: `GET` &nbsp; **Path**: `/gsp/logistics-track`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | No | Forward order number；Either forward order number or return order number must be filled；When querying forward order number, either package number or waybill number must be filled； |
| `packageNo` | string | No | Package number；In case of multiple waybills under the package, all waybill information will be returned； |
| `waybillNo` | string | No | Waybill number；Return information according to the specified waybill number； |
| `returnOrderNo` | string | No | Return order number； |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `traceId` | string | Yes |
| `info` | object | No |
| `trackInfo` | object[] | No |
| `carrier` | string | No |
| `carrierCode` | string | No |
| `waybillNo` | string | No |
| `waybillType` | string | No |
| `tracking` | object[] | No |
| `description` | string | No |
| `nodeCode` | string | No |
| `nodeCodeName` | string | No |
| `updateTimeMillis` | int64 | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.com/open-api/gsp/logistics-track?orderNo=GSH12110300000M&packageNo=GU25042815276285952' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570729613' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "trackInfo": [
            {
                "waybillNo": "PGC250403545463910620250403",
                "carrier": "J&T",
                "carrierCode": "",
                "waybillType": 1,
                "tracking": [
                    {
                        "nodeCode": "in_transport",
                        "nodeCodeName": "运输中",
                        "description": "头程装车扫描",
                        "updateTimeMillis": 1743821802000
                    },
                    {
                        "nodeCode": "in_transport",
                        "nodeCodeName": "运输中",
                        "description": "头程建包扫描",
                        "updateTimeMillis": 1743799058000
                    }
                ]
            },
            {
                "waybillNo": "SHBG1745798733148268",
                "carrier": "USPS",
                "carrierCode": "",
                "waybillType": 2,
                "tracking": [
                    {
                        "nodeCode": "tail_accept",
                        "nodeCodeName": "派件异常",
                        "description": "【InTransit_003】【InTransit_003】ArrivedAtCarrierFacility",
                        "updateTimeMillis": 1742429068000
                    },
                    {
                        "nodeCode": "signed",
                        "nodeCodeName": "运输中",
                        "description": "1",
                        "updateTimeMillis": 1742245709000
                    }
                ]
            },
            {
                "waybillNo": "QA12344444",
                "carrier": "J&T",
                "carrierCode": "",
                "waybillType": 6,
                "tracking": [
                    {
                        "nodeCode": "sign_for",
                        "nodeCodeName": "签收",
                        "description": "送仓扫描",
                        "updateTimeMillis": 1743835065000
                    },
                    {
                        "nodeCode": "sign_for",
                        "nodeCodeName": "签收",
                        "description": "送仓扫描",
                        "updateTimeMillis": 1743830787000
                    },
                    {
                        "nodeCode": "in_transport",
                        "nodeCodeName": "运输中",
                        "description": "头程装车扫描",
                        "updateTimeMillis": 1743821802000
                    },
                    {
                        "nodeCode": "in_transport",
                        "nodeCodeName": "运输中",
                        "description": "头程建包扫描",
                        "updateTimeMillis": 1743799058000
                    }
                ]
            }
        ]
    },
    "bbl": {},
    "traceId": "8ea731caf3385b83"
}
```

---

## Confirmation of no goods API

> **Official docs**: [Confirmation of no goods API](https://open.sheincorp.com/documents/apidoc/detail/3001415)

**Method**: `POST` &nbsp; **Path**: `/order/confirm-no-stock`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skuCode` | string | No | SHEIN platform generated skuCode; skuCode and orderGoodsId cannot be empty at the same time |
| `orderNo` | string | Yes | Order Number |
| `orderGoodsId` | integer | Yes | Unique identifier of the product; if multiple pieces of the same product, each goodsId is different, obtained through the order details API. |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/order/confirm-no-stock' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570817402' \
--data-raw '{
	"orderNo":"GSON8F44T00000N",
	"orderGoodsId":3000000000065821,
        "skuCode": "I95xuum0vjv5"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {}
}
```

---

## Cancel splitting order packages

> **Official docs**: [Cancel splitting order packages](https://open.sheincorp.com/documents/apidoc/detail/3001279)

**Method**: `POST` &nbsp; **Path**: `/order/unpacking-group-remove`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | Yes | Order Number |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/order/unpacking-group-remove' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570817402' \
--data-raw '{
	"orderNo": "GSONYP4490004CA"
}'
```

### Response Example

```json
{
  "code": "0",
  "msg": "OK"
}
```

---

## Confirm splitting order packages

> **Official docs**: [Confirm splitting order packages](https://open.sheincorp.com/documents/apidoc/detail/3001280)

**Method**: `POST` &nbsp; **Path**: `/order/unpacking-group-confirm`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | Yes | Order Number |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/order/unpacking-group-confirm' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570817402' \
--data-raw '{
	"orderNo": "GSONYP4490004CA"
}'
```

### Response Example

```json
{
    "code": "9999004",
    "msg": "For orders that do not require unpacking, there is no need to confirm unpacking.",
    "info": {},
    "bbl": {}
}
```

---
