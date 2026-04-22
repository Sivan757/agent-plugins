# SHEIN Open API — Purchase Order API

Purchase order information, JIT order correspondence, stocking orders, and product stocking info.

## Table of Contents

- [Obtain purchase order information](#obtain-purchase-order-information)
- [JIT parent order and child order correspondence query interface](#jit-parent-order-and-child-order-correspondence-query-interface)
- [Shipping basic information query interface](#shipping-basic-information-query-interface)
- [Express inquiry](#express-inquiry)
- [Query the estimated shipping cost of shein cooperative logistics](#query-the-estimated-shipping-cost-of-shein-cooperative-logistics)
- [Search for freight forwarder information](#search-for-freight-forwarder-information)
- [Receiving warehouse information query](#receiving-warehouse-information-query)
- [Create delivery Order](#create-delivery-order)
- [Query delivery order list](#query-delivery-order-list)
- [Modify and cancel shipping orders](#modify-and-cancel-shipping-orders)
- [Shipping order dimension printing form](#shipping-order-dimension-printing-form)
- [Product printing barcode](#product-printing-barcode)
- [Manually place stocking orders](#manually-place-stocking-orders)
- [Stocking order review list](#stocking-order-review-list)
- [Query product stocking information list](#query-product-stocking-information-list)
- [Print Box Marks or Package Labels](#Print Box Marks or Package Labels)
- [Logistics company information query (to be abandoned)](#logistics-company-information-query-to-be-abandoned)
- [Query SHEIN Warehouse Receiving Information](#查询shein仓库的收件信息)

---

## Obtain purchase order information

> **Official docs**: [Obtain purchase order information](https://open.sheincorp.com/documents/apidoc/detail/3001651)

**Method**: `GET` &nbsp; **Path**: `/order/purchase-order-infos`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNos` | string | No | Purchase order number, supported in batches separated by ',', up to 200 purchase order numbers can be requested at a time |
| `skcs` | string | No | skc list |
| `type` | integer | No | Purchase order type; 1: Urgent purchase/ 2: Stock |
| `supplierCodes` | string | No | Merchant SKU array |
| `combineTimeStart` | string | No | Stock or urgent purchase order dispatch time - start; Date format 2018-05-23 10:29:59; Query cannot exceed 60 days |
| `combineTimeEnd` | string | No | Order sending time for stock orders or urgent purchase orders - end; Date format 2018-05-23 10:29:59; Query should not exceed 60 days |
| `pageNumber` | integer | No | page number |
| `pageSize` | integer | No | Page size, maximum of 200 records |
| `updateTimeStart` | string | No | Order update time for stock orders or urgent purchase orders - start; Date format 2018-05-23 10:29:59; Query should not exceed 60 days |
| `updateTimeEnd` | string | No | Order update time for stock orders or urgent purchase orders - end; Date format 2018-05-23 10:29:59; Query should not exceed 60 days |
| `selectJitMother` | integer | No | Jit master order query identifier; 1: Return all purchase orders (including Jit master order)/ 2 or not specified: Return other purchase orders excluding Jit master order |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `count` | double | No |
| `pageNo` | double | No |
| `pageSize` | double | No |
| `list` | object[] | No |
| `orderNo` | string | No |
| `typeName` | string | No |
| `type` | int64 | No |
| `orderExtends` | object[] | No |
| `skc` | string | No |
| `price` | double | No |
| `skuCode` | string | No |
| `suffixZh` | string | No |
| `needQuantity` | integer | No |
| `orderQuantity` | integer | No |
| `deliveryQuantity` | integer | No |
| `receiptQuantity` | integer | No |
| `storageQuantity` | integer | No |
| `defectiveQuantity` | integer | No |
| `supplierCode` | string | No |
| `remark` | string | No |
| `imgPath` | string | No |
| `skuImg` | string | No |
| `requestDeliveryQuantity` | string | No |
| `noRequestDeliveryQuantity` | string | No |
| `alreadyDeliveryQuantity` | string | No |
| `supplierSku` | string | No |
| `currencyName` | string | No |
| `currency` | string | No |
| `currencyId` | integer | No |
| `isPriorProductionName` | string | No |
| `isJitMotherName` | string | No |
| `updateTime` | datetime | No |
| `supplierName` | string | No |
| `orderSupervisor` | string | No |
| `addUid` | string | No |
| `requestDeliveryTime` | datetime | No |
| `orderLabelInfo` | object[] | No |
| `orderLabel` | integer | No |
| `orderLabelName` | string | No |
| `goodsLevel` | object[] | No |
| `goodsLevel` | integer | No |
| `goodsLevelName` | string | No |
| `requestReceiptTime` | datetime | Yes |
| `requestTakeParcelTime` | string | No |
| `addTime` | string | No |
| `allocateTime` | string | No |
| `reserveTime` | string | No |
| `receiptTime` | string | No |
| `checkTime` | string | No |
| `storageTime` | string | No |
| `returnTime` | string | No |
| `firstMarkName` | string | No |
| `firstMark` | boolean | No |
| `prepareTypeName` | string | No |
| `prepareTypeId` | integer | No |
| `categoryName` | string | No |
| `orderMarkName` | string | No |
| `warehouseName` | string | No |
| `urgentTypeName` | string | No |
| `urgentType` | integer | No |
| `storageId` | string | No |
| `recommendedSubWarehouseId` | string | No |
| `countryMarket` | int64 | No |
| `requestCompleteTime` | string | No |
| `isProductionCompletionName` | string | No |
| `isAllDeliveryName` | string | No |
| `isDeliveryName` | string | No |
| `status` | integer | No |
| `statusName` | string | No |
| `deliveryTime` | datetime | No |
| `customInfoId` | string | No |
| `customInfo` | json | No |
| `attributeVersion` | integer | No |
| `isIncrementOnWay` | integer | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.cn/open-api/order/purchase-order-infos?orderNos=PB2505200000635' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570729613' \
--header 'language: US' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0", 
    "msg": "OK", 
    "info": {
        "count": 1, 
        "pageNo": 1, 
        "pageSize": 20, 
        "list": [
            {
                "orderNo": "PB2505200000635", 
                "typeName": "急采", 
                "currencyName": "人民币元", 
                "currency": null, 
                "supplierName": "H12", 
                "orderSupervisor": "练红秀", 
                "addUid": "dms-root", 
                "requestDeliveryTime": "2025-04-23 23:59:59", 
                "orderLabelInfo": [
                    {
                        "orderLabel": 163, 
                        "orderLabelName": ""
                    }, 
                    {
                        "orderLabel": 13, 
                        "orderLabelName": "安检"
                    }, 
                    {
                        "orderLabel": 193, 
                        "orderLabelName": "履约评估考核订单"
                    }
                ], 
                "goodsLevel": [
                    {
                        "goodsLevel": 228, 
                        "goodsLevelName": "退供款"
                    }
                ], 
                "addTime": "2025-04-23 06:17:38", 
                "allocateTime": "2025-04-23 06:21:05", 
                "reserveTime": "1970-01-01 08:00:01", 
                "receiptTime": "1970-01-01 08:00:01", 
                "checkTime": "1970-01-01 08:00:01", 
                "storageTime": "2025-04-24 21:44:48", 
                "returnTime": "1970-01-01 08:00:01", 
                "requestTakeParcelTime": "2025-04-23 23:59:59", 
                "requestReceiptTime": null, 
                "firstMarkName": "否", 
                "prepareTypeName": "备货单", 
                "categoryName": "1急采", 
                "orderMarkName": "正常备货", 
                "warehouseName": "佛山仓", 
                "urgentTypeName": "", 
                "urgentType": null, 
                "storageId": 1, 
                "recommendedSubWarehouseId": 0, 
                "requestCompleteTime": null, 
                "isProductionCompletionName": null, 
                "isAllDeliveryName": null, 
                "isDeliveryName": null, 
                "currencyId": 156, 
                "firstMark": 2, 
                "orderMarkId": 733, 
                "prepareTypeId": 17, 
                "category": 0, 
                "type": 1, 
                "status": 8, 
                "statusName": "已完成", 
                "updateTime": "2025-04-25 01:21:59", 
                "isJitMotherName": "否", 
                "isPriorProductionName": null, 
                "orderExtends": [
                    {
                        "skc": "s255904", 
                        "price": 73, 
                        "needQuantity": null, 
                        "orderQuantity": 1, 
                        "deliveryQuantity": 1, 
                        "receiptQuantity": 0, 
                        "storageQuantity": 1, 
                        "defectiveQuantity": 0, 
                        "supplierCode": "SWLC1265-5BR28", 
                        "remark": "", 
                        "imgPath": "https://img.ltwebstatic.com/images3_spmp/2025/03/14/e2/1741946708842dfe053372c941778f161b55e09e60.jpg", 
                        "skuImg": "", 
                        "requestDeliveryQuantity": null, 
                        "noRequestDeliveryQuantity": null, 
                        "alreadyDeliveryQuantity": null, 
                        "supplierSku": "SBR28", 
                        "skuCode": "I2840edmz", 
                        "suffixZh": "棕色-28 inch"
                    }
                ], 
                "deliveryTime": "2025-04-23 17:13:16", 
                "customInfoId": "", 
                "customInfo": null
            }
        ]
    }, 
    "bbl": { }, 
    "traceId": "b30354e8da18ea2e"
}
```

---

## JIT parent order and child order correspondence query interface

> **Official docs**: [JIT parent order and child order correspondence query interface](https://open.sheincorp.com/documents/apidoc/detail/3001489)

**Method**: `GET` &nbsp; **Path**: `/order/get-mothe-child-orders`

**Applicable to**: Fully-managed, Shein-operated, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNos` | string | Yes | Purchase order number, batch is supported, and a maximum of 200 purchase order numbers can be requested at one time. |
| `selectJitMother` | integer | Yes | 1. Yes (indicates that the query is for the parent order); 2. No (indicates that the query is for the sub-order, including combined orders) |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object[] | No |
| `orderNo` | string | Yes |
| `motherOrChildOrders` | object[] | Yes |
| `orderNo` | string | No |
| `status` | string | No |
| `statusName` | string | No |
| `error` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.cn/open-api/order/get-mothe-child-orders?orderNos=J230517600016,J230619600017,J230614600034&selectJitMother=1' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570729613' \
--header 'language: EN' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "",
    "info": [
        {
            "orderNo": "J230517600016",
            "motherOrChildOrders": []
        },
        {
            "orderNo": "J230619600017",
            "motherOrChildOrders": []
        },
        {
            "orderNo": "J230614600034",
            "motherOrChildOrders": []
        }
    ],
    "error": null
}
```

---

## Shipping basic information query interface

> **Official docs**: [Shipping basic information query interface](https://open.sheincorp.com/documents/apidoc/detail/3001654)

**Method**: `GET` &nbsp; **Path**: `/shipping/basic`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderType` | integer | Yes | Order type, 1: Urgent purchase, 2: Stock preparation |
| `addressId` | integer | No | Different shipping addresses can be matched with different courier services. If a shipping address is not selected, some logistics companies cannot match your shipment. |
| `orderNoList` | string | No | Order number list |
| `includeSharedAddr` | integer | No | Do you want to query shared shipping addresses? 1: Yes, 2: No, default is 1 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `addressList` | object[] | No |
| `addressId` | integer | No |
| `addressName` | string | No |
| `isSharedAddress` | integer | No |
| `deliveryTypeList` | object[] | No |
| `deliveryTypeName` | string | No |
| `deliveryTypeValue` | integer | No |
| `expressCompanyList` | object[] | No |
| `companyCode` | string | No |
| `companyName` | string | No |
| `isSupport` | boolean | No |
| `isRecommend` | string | No |
| `motorcadeList` | object[] | No |
| `isSupport` | boolean | No |
| `motorcadeId` | string | No |
| `motorcadeName` | string | No |
| `packageType` | integer | No |
| `shippingRouteList` | string | No |
| `supplierWarehouseList` | object[] | No |
| `supplierWarehouseId` | int64 | No |
| `warehouseName` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.cn/open-api/shipping/basic?orderType=1' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570464986' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "deliveryTypeList": [
            {
                "deliveryTypeName": "快递/物流送货",
                "deliveryTypeValue": 1
            },
            {
                "deliveryTypeName": "送货上门",
                "deliveryTypeValue": 2
            },
            {
                "deliveryTypeName": "定点收货",
                "deliveryTypeValue": 3
            },
            {
                "deliveryTypeName": "新增发货方式",
                "deliveryTypeValue": 4
            },
            {
                "deliveryTypeName": "上门查货",
                "deliveryTypeValue": 21
            },
            {
                "deliveryTypeName": "送货上门",
                "deliveryTypeValue": 10
            }
        ],
        "addressList": [
            {
                "addressName": "河南地址",
                "addressId": 4722
            },
            {
                "addressName": "青羊地址",
                "addressId": 4721
            },
            {
                "addressName": "宝鸡",
                "addressId": 4720
            }
        ],
        "supplierWarehouseList": [
            {
                "warehouseName": "323432",
                "supplierWarehouseId": 78377
            },
            {
                "warehouseName": "仓库kkiki",
                "supplierWarehouseId": 78376
            },
            {
                "warehouseName": "总仓",
                "supplierWarehouseId": 78359
            }
        ],
        "expressCompanyList": [
            {
                "companyName": "提前我认为其他完全放弃",
                "companyCode": "afasfsag",
                "isSupport": true
            },
            {
                "companyName": "车门",
                "companyCode": "chemen",
                "isSupport": true
            },
            {
                "companyName": "dhl",
                "companyCode": "dhl",
                "isSupport": false
            },
            {
                "companyName": "fedex",
                "companyCode
```

---

## Express inquiry

> **Official docs**: [Express inquiry](https://open.sheincorp.com/documents/apidoc/detail/3001340)

**Method**: `POST` &nbsp; **Path**: `/shipping/express-company-list-v2`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `addressId` | int64 | Yes | Shipping address ID, obtained from the interface |
| `deliveryType` | string | Yes | Shipping method, fixed to 1 |
| `orderType` | string | Yes | Purchase Order Type 1: Urgent / 2: Stock |
| `reserveParcelTime` | string | Yes | Reserve Pickup Time (yyyy-MM-dd HH:mm:ss) |
| `purchaseOrders` | object[] | Yes | Purchase Order Details |
| `orderNo` | string | Yes | Purchase Order No |
| `skuInfos` | object[] | Yes | Purchase Order Item Details |
| `qty` | integer | Yes | Purchase Order Shipment Quantity |
| `skuCode` | string | Yes | SHEIN sku code |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `shippingMethods` | object[] | No |
| `agedProductCode` | string | No |
| `agedProductName` | string | No |
| `expressInfos` | object[] | No |
| `companyCode` | string | No |
| `companyName` | string | No |
| `isRecommend` | boolean | No |
| `purchaseOrders` | string[] | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.cn/open-api/shipping/express-company-list-v2' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570817402' \
--data-raw '{
  "type": 2,
  "addressId": "19687",
  "reserveParcelTime": "2024-08-31 10:29:59",
  "deliveryType": 1,
  "orderType": 1,
  "purchaseOrders": [
      {"orderNo":"J241210600019",
      "skuInfos": [
          {
              "qty": 1,
              "skuCode": "I62fjn9xnam8"
          }
      ]
      },
      {"orderNo":"J241210600017",
      "skuInfos": [
          {
              "qty": 1,
              "skuCode": "I62fjn9xnam8"
          }
      ]

      },
      {"orderNo":"J241210600021",
      "skuInfos": [
          {
              "qty": 1,
              "skuCode": "I62fjn9xnam8"
          }
      ]

      }


  ]
 
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "shippingMethods": [
            {
                "agedProductCode": "GEF",
                "agedProductName": "默认时效产品",
                "purchaseOrders": [
                    "B241217500033",
                    "B241217500031",
                    "B241217500032"
                ],
                "expressInfos": [
                    {
                        "companyName": "顺丰",
                        "companyCode": "shunfeng",
                        "isSupport": true,
                        "isRecommend": false
                    },
                    {
                        "companyName": "车门",
                        "companyCode": "chemen",
                        "isSupport": true,
                        "isRecommend": true
                    },
                    {
                        "companyName": "跨越",
                        "companyCode": "kuayue",
                        "isSupport": true,
                        "isRecommend": false
                    },
                    {
                        "companyName": "Anjun",
                        "companyCode": "TMS-anjun",
                        "isSupport": true,
                        "isRecommend": false
                    }
                ]
            }
        ]
    },
    "bbl": null,
    "traceId": "7caca8b96ad583a3"
}
```

---

## Query the estimated shipping cost of shein cooperative logistics

> **Official docs**: [Query the estimated shipping cost of shein cooperative logistics](https://open.sheincorp.com/documents/apidoc/detail/3001312)

**Method**: `POST` &nbsp; **Path**: `/openapi-business-backend/purchase-estimated-fee`

**Applicable to**: Fully-managed, Shein-operated, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `addressId` | integer | Yes | Shipping address ID; Obtained from the Shipping Basic Information Query interface; |
| `agedProductCode` | string | Yes | Time product code; get it from the Logistics Product Query interface; |
| `expressInfoList` | object[] | Yes | Query logistics company information; we recommend all logistics companies under this time product; |
| `companyCode` | string | Yes | Logistics company code; get it from the companyCode field in the Logistics Product Query interface; |
| `isRecommend` | boolean | Yes | Is the logistics company recommended; mandatory if the logistics company is recommended logistics; missing or incorrect information may affect the cost query result, but will not affect the actual order cost); |
| `orderNoList` | string[] | Yes | Order number list; this field is mandatory in full management scenarios; |
| `orderType` | integer | Yes | Order type; 1: Urgent purchase/ 2: Stock preparation |
| `weight` | double | Yes | Weight; unit kg, supports up to 4 decimal places; the maximum value of actual weight or volumetric weight is taken; |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `successList` | object[] | No |
| `companyCode` | string | No |
| `convertedEstimatedDeduction` | double | No |
| `currency` | string | No |
| `exemptionAmount` | double | No |
| `isRecommend` | boolean | No |
| `rightsType` | integer | No |
| `failedList` | object[] | No |
| `code` | string | No |
| `companyCode` | string | No |
| `reason` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.cn/open-api/idms/review-orders' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1753080399011' \
--data-raw '{
    "agedProductCode": "SNV",
    "weight": "19.80",
    "orderType": 1,
    "addressId": 21189702,
    "orderNoList": [
        "PB2506250000027"
    ],
    "expressInfoList": [
        {
            "companyCode": "chemen",
            "isRecommend": true
        },
        {
            "companyCode": "kuayue",
            "isRecommend": false
        },
        {
            "companyCode": "TMS-anjun",
            "isRecommend": false
        },
        {
            "companyCode": "EULOG",
            "isRecommend": false
        }
    ]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "successList": [],
        "failedList": [
            {
                "code": "COSTESTIMATION0003",
                "companyCode": "chemen",
                "reason": "获取物流运费失败"
            },
            {
                "code": "COSTESTIMATION0003",
                "companyCode": "kuayue",
                "reason": "获取物流运费失败"
            },
            {
                "code": "COSTESTIMATION0003",
                "companyCode": "TMS-anjun",
                "reason": "获取物流运费失败"
            },
            {
                "code": "COSTESTIMATION0003",
                "companyCode": "EULOG",
                "reason": "获取物流运费失败"
            }
        ]
    },
    "traceId": "c2a98c0db5911d25"
}
```

---

## Search for freight forwarder information

> **Official docs**: [Search for freight forwarder information](https://open.sheincorp.com/documents/apidoc/detail/3001647)

**Method**: `POST` &nbsp; **Path**: `/pfmp/shipping/thirdPartyAndChannelList`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNoList` | string[] | No | Order number list |
| `sellerAddressId` | int64 | Yes | Merchant shipping address ID |
| `shippingRoute` | integer | No | Shipping routes: 1. Direct delivery; 2. Consolidation. |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `data` | object[] | No |
| `forwarderAccountId` | string | No |
| `forwarderAccountName` | string | No |
| `isClmsOrder` | boolean | No |
| `orderConditionList` | integer[] | No |
| `productChannelList` | object[] | No |
| `productChannelId` | string | No |
| `productChannelName` | string | No |
| `sceneConditionList` | object[] | No |
| `orderConditionList` | integer[] | No |
| `scene` | integer | No |
| `thirdPartyCode` | string | No |
| `thirdPartyName` | string | No |
| `thirdPartyType` | integer | No |
| `meta` | object | No |
| `count` | integer | No |
| `customObj` | object | No |
| `msg` | string | No |

---

## Receiving warehouse information query

> **Official docs**: [Receiving warehouse information query](https://open.sheincorp.com/documents/apidoc/detail/3001646)

**Method**: `GET` &nbsp; **Path**: `/shipping/warehouse`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `addressId` | int64 | Yes | Obtain from Shipping Basic Information Query Interface; |
| `coding` | string | No | Fleet code |
| `expressMode` | string | No | Express code |
| `orderType` | integer | Yes | Order type; 1: urgent purchase; 2: stocking up |
| `sendType` | integer | Yes | Shipping Method; Retrieved from Shipping Basic Information Query Interface; |
| `orderNoList` | string[] | No | Purchase Order Number; Recommended to Fill Out, Will Affect Address Accuracy; Maximum Input of 200; |
| `shippingRoute` | integer | No | 发货路径： 1：直送 2：集货 默认值为1，直送 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `subWareHouseId` | integer | No |
| `subWarehouseName` | string | No |
| `warehouseAddress` | string | No |
| `warehouseContact` | string | No |
| `warehousePhone` | string | No |
| `consolidationSubWareHouseId` | integer | No |
| `consolidationSubWarehouseName` | string | No |
| `consolidationWarehouseAddress` | string | No |
| `consolidationWarehouseCityArea` | string | No |
| `consolidationWarehouseCityName` | string | No |
| `consolidationWarehouseContact` | string | No |
| `consolidationWarehousePhone` | string | No |
| `consolidationWarehouseProvinceName` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.cn/open-api/shipping/warehouse?addressId=4721&expressMode=shunfeng&orderType=1&sendType=1&orderNoList=1234566,234566,2345667' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570729613' \
--header 'language: EN' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "subWareHouseId": 4,
        "subWarehouseName": "佛山佳明仓",
        "warehouseAddress": "广东 深圳市 大鹏 12345",
        "warehouseContact": "佳明仓",
        "warehousePhone": "15222222222"
    },
    "bbl": null
}
```

---

## Create delivery Order

> **Official docs**: [Create delivery Order](https://open.sheincorp.com/documents/apidoc/detail/3001652)

**Method**: `POST` &nbsp; **Path**: `/shipping/orderToShipping`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `adminName` | string | Yes | Username (can be defined by the ERP system; used by the system to record the operator of this shipment; not displayed on the page) |
| `agedProductCode` | string | No | Time-sensitive product codes can be obtained from the Logistics Product Query API. |
| `arrivalTime` | datetime | No | Schedule SEHIN arrival time (yyyy-MM-dd HH:mm:ss). This field is required when deliveryType=4 or 21. |
| `coding` | string | No | Fleet code, required when deliveryType=2 and using fleet self-delivery scenario |
| `deliveryType` | integer | Yes | Shipping method, please obtain the enum values of shipping methods available to merchants from shipping basic information query; |
| `expressId` | string | No | The courier code is obtained from the `companyCode` field of the `Logistics Product Query` interface in SHEIN integrated logistics scenarios, and from the `companyCode` field of the `Shipping Basic Information Query` interface in non-SHEIN integra... |
| `expressInfo` | object[] | Yes | Waymark Parcel Information |
| `addrId` | int64 | Yes | Shipping address ID, obtained from the Shipping Basic Information Query API |
| `expressCode` | string | No | Track number, applicable to non-SHIEN integrated logistics scenarios |
| `packageNumber` | integer | Yes | Total number of packages (when using the box/mark type = total number of packages from all orders) |
| `packageWeight` | double | No | Package weight (unit: kg) |
| `reserveParcelTime` | datetime | No | Scheduled pickup time (yyyy-MM-dd HH:mm:ss), required when using SHEIN Integrated Logistics or SHEIN Integrated Fleet for delivery |
| `list` | object[] | No |  |
| `skuCode` | string | Yes | sku code, takes all SKUs in the input parameter of the purchase order |
| `orderNo` | string | Yes | Order number |
| `orderQuantity` | integer | No | Order quantity |
| `packageNum` | integer | No | Number of packages (required when shipping; the same number of packages must be entered for the same order) |
| `tempDeliveryQuantity` | integer | Yes | Actual shipment quantity: If the quantity to be shipped is greater than 500, each shipment must contain more than 150. |
| `packingInfoList` | object | No | Packing details, required when shippingRoute is 1 |
| `packQuantity` | integer | Yes | Quantity per carton |
| `skuCode` | string | Yes | SKU code of the box |
| `orderType` | integer | Yes | Order type, 1: Urgent purchase, 2: Stock preparation |
| `shippingRoute` | integer | No | Shipping path, 0: No shipping path, 1: Direct delivery path, 2: Consolidation path |
| `supplierWarehouseId` | int64 | Yes | Merchant warehouse id |
| `thirdPartyChannel` | int64 | No | Freight forwarding channels |
| `thirdPartyChannelName` | string | No | Freight Forwarding Channel Name |
| `thirdPartyOrderMethod` | integer | No | Ordering methods by freight forwarders:1: SHEIN places the order on your behalf2: Merchant places the order themselves |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `deliveryCode` | string | Yes |
| `expressCode` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.cn/open-api/shipping/orderToShipping' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
  "agedProductCode": "abc",
  "adminName": "root test",
  "coding": "",
  "deliveryType": 1,
  "expressId": "kuayue",
  "expressInfo": [
    {
      "addrId": 688495,
      "expressCode": "",
      "packageNumber": 3,
      "reserveParcelTime": "2025-12-27 23:20:00"
    }
  ],
  "list": [
    {
      "orderNo": "PB2505220000462",
      "orderQuantity": "1",
      "packageNum": 1,
      "skuCode": "I24lsfii3qse",
      "tempDeliveryQuantity": 1,
      "type": 0
    },
    {
      "orderNo": "PB2505220000433",
      "orderQuantity": "1",
      "packageNum": 1,
      "skuCode": "I24lsfii3qse",
      "tempDeliveryQuantity": 1,
      "type": 0
    }
  ],
  "orderType": 2,
  "subWarehouseId": 27,
  "supplierWarehouseId": 89755
}'
```

### Response Example

```json
{
    "code": "0032001",
    "msg": "B231107500397订单状态不能发货",
    "info": null,
    "bbl": null
}
```

---

## Query delivery order list

> **Official docs**: [Query delivery order list](https://open.sheincorp.com/documents/apidoc/detail/3001645)

**Method**: `GET` &nbsp; **Path**: `/shipping/delivery`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `deliveryCode` | string | No | Shipping Number |
| `startTime` | string | No | Query by shipment date; Date format yyyy-MM-dd HH:mm:ss |
| `endTime` | string | No | Query by shipment date; Date format yyyy-MM-dd HH:mm:ss |
| `page` | integer | No | Page Number |
| `perPage` | integer | No | Number of pages per page, maximum 200 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `count` | int64 | No |
| `list` | object[] | No |
| `addTime` | datetime | No |
| `deliveryCode` | string | No |
| `deliveryOrderDataList` | object[] | No |
| `deliveryQuantity` | integer | No |
| `orderNo` | string | No |
| `skc` | string | Yes |
| `skuCode` | string | No |
| `deliveryType` | integer | No |
| `deliveryTypeName` | string | No |
| `expressCode` | string | No |
| `expressCompanyName` | string | No |
| `expressId` | string | No |
| `packageWeight` | double | No |
| `preReceiptTime` | datetime | No |
| `receiptTime` | datetime | No |
| `reserveParcelTime` | datetime | No |
| `sendPackage` | integer | No |
| `supplierWarehouseId` | int64 | No |
| `supplierWarehouseName` | string | No |
| `takeParcelTime` | datetime | No |
| `consolidationInfo` | object | No |
| `address` | string | No |
| `carrierName` | string | No |
| `deliveryType` | integer | No |
| `deliveryTypeName` | string | No |
| `expressCode` | string | No |
| `expressId` | string | No |
| `person` | string | No |
| `phone` | string | No |
| `reserveParcelTime` | datetime | No |
| `thirdPartyChannel` | int64 | No |
| `thirdPartyChannelName` | integer | No |
| `thirdPartyOrderMethod` | integer | No |
| `warehouseId` | int64 | No |
| `warehouseName` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.cn/open-api/shipping/delivery?deliveryCode=20250430100099' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570681772' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "count": 296,
        "list": [
            {
                "deliveryCode": "20240124100007",
                "deliveryType": 1,
                "deliveryTypeName": "快递/物流送货",
                "expressId": "chemen",
                "expressCompanyName": "车门",
                "expressCode": "S0085029226880",
                "sendPackage": 10,
                "packageWeight": 0.00,
                "takeParcelTime": null,
                "reserveParcelTime": "2024-01-25 18:33",
                "addTime": "2024-01-24 13:50:38",
                "preReceiptTime": "1970-01-01 08:00:01",
                "receiptTime": "1970-01-01 08:00:01",
                "supplierWarehouseId": 78377,
                "supplierWarehouseName": "323432",
                "deliveryOrderDataList": [
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yilwrnq",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yilyuw3",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yim0j0g",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yim24bo",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yim4075",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yim5nov",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yim79g5",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yim8u9s",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yimaioa",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yimc0zi",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yimdlcs",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yimf5oe",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    },
                    {
                        "skc": "se2204266637766551",
                        "skuCode": "I0103yimiv2c",
                        "orderNo": "B231102500137-1",
                        "deliveryQuantity": 710
                    }
                ]
            },
            {
                "deliveryCode": "20240124100002",
                "deliveryType": 2,
                "deliveryTypeName": "送货上门",
                "expressId": "",
                "expressCompanyName": "",
                "expressCode": "",
                "sendPackage": 2,
                "packageWeight": 2.00,
                "takeParcelTime": null,
                "reserveParcelTime": null,
                "addTime": "2024-01-24 11:12:22",
                "preReceiptTime": "1970-01-01 08:00:01",
                "receiptTime": "1970-01-01 08:00:01",
                "supplierWarehouseId": 78377,
                "supplierWarehouseName": "323432",
                "deliveryOrderDataList": [
                    {
                        "skc": "ss23110643492437",
                        "skuCode": "I3jrx7cgrjdu",
                        "orderNo": "B240102500419",
                        "deliveryQuantity": 5
                    }
                ]
            }
        ]
    },
    "bbl": null
}
```

---

## Modify and cancel shipping orders

> **Official docs**: [Modify and cancel shipping orders](https://open.sheincorp.com/documents/apidoc/detail/3001650)

**Method**: `POST` &nbsp; **Path**: `/shipping/modify-delivery-order-info`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `addUid` | string | Yes | Operator, fill in as 'openapi' by default |
| `deleteOrderNos` | string[] | No | Cancelled shipment order number |
| `deliveryNo` | string | Yes | Shipment Number |
| `list` | object[] | No | Transfer orders that are not deleted in the shipment order data here |
| `deliveryQuantity` | integer | No | Order quantity of goods |
| `orderNo` | string | No | order number |
| `packageNum` | integer | No | Order package quantity, only valid for type = box mark, please confirm the package type |
| `skuCode` | string | No | sku encoding |
| `packingInfoList` | object | No | Packaging details, only applicable to overseas warehouse scenarios |
| `packQuantity` | integer | No | Packaging quantity, only applicable to overseas warehouse scenarios |
| `packageNumber` | integer | No | Total number of packages corresponding to the courier number |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": null,
    "bbl": null
}
```

---

## Shipping order dimension printing form

> **Official docs**: [Shipping order dimension printing form](https://open.sheincorp.com/documents/apidoc/detail/3001293)

**Method**: `POST` &nbsp; **Path**: `/shipping/delivery/print-package`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `deliveryNo` | string | Yes | Shipment Number |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `info` | object | Yes |
| `url` | string | Yes |
| `packingType` | integer | Yes |
| `orderNoList` | string[] | Yes |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.cn/open-api/shipping/delivery/print-package' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570817402' \
--data-raw '{
 "deliveryNo": "20231109100004"
}'
```

### Response Example

```json
{
	"code": "0",
	"msg": "OK",
	"info": {
		"packingType": 2,
		"orderNoList": ["B231114500244", "B231114500299"],
		"url": "https://html2pdf.oss-cn-shenzhen.aliyuncs.com/pdf2-test/gmp/2024/3/15/1710468575962-1ef06e76916803df2de67c2cdc6f40f9.oss.pdf?AWSAccessKeyId=LTAI5tLUgHZGZqEUN2t8bPCR&Expires=1710470376&Signature=yTr%2FESgjmuQlBd%2B50HmHNzmfQqU%3D"
	}
}
```

---

## Product printing barcode

> **Official docs**: [Product printing barcode](https://open.sheincorp.com/documents/apidoc/detail/3001653)

**Method**: `POST` &nbsp; **Path**: `/goods/print-barcode`

**Applicable to**: Fully-managed, Shein-operated


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `data` | object[] | Yes |  |
| `orderNo` | string | Yes | Purchase order number |
| `supplierSku` | string | No | seller sku code and sheinSku are mandatory fields, sheinSku usage is recommended |
| `printNumber` | integer | Yes | Array The cumulative number of prints in this field cannot exceed 2000; the scene of customizing the urgent purchase order uses the imported parameter of the urgent purchase order; |
| `sheinSku` | string | Yes | sheinSku is sku_code, sku_code is the system code generated by SHEIN when the product is published |
| `printContentType` | integer | No | Specify barcode display content (default print merchant item number); 1: Merchant item number/ 2: Merchant SKU code |
| `printFormatType` | integer | No | Specify barcode print size (only applicable to Brazilian merchants, non-Brazilian merchants default print 20*70); 1: Print 20*70/ 2: Print 25*40 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `info` | object | Yes |
| `url` | string | No |
| `errorData` | object[] | No |
| `orderNo` | string | Yes |
| `supplierSku` | string | Yes |
| `errorMsg` | string[] | Yes |
| `printNumber` | integer | Yes |
| `sheinSku` | string | Yes |
| `codingInfoList` | object[] | No |
| `orderNo` | string | Yes |
| `supplierSku` | string | No |
| `sheinSku` | string | Yes |
| `barcode` | string | No |
| `customCodingList` | object[] | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/print-barcode' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "type": 2,
    "data": [
        {
            "orderNo": null,
            "supplierSku": null,
            "printNumber": 1,
            "sheinSku": "I94higsnyh7g"
        }
    ]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "url": "https://html2pdf.oss-cn-shenzhen.aliyuncs.com/pdf2-test/wmd/2024/3/21/1711013716497-32120d0bf83fd7c2e69095e9412e5647.oss.pdf?AWSAccessKeyId=LTAI5tLUgHZGZqEUN2t8bPCR&Expires=1711015516&Signature=d1Y60dws5Qa%2F6lVFtHL8j%2FFRS6E%3D",
        "errorData": [],
        "codingInfoList": [
            {
                "orderNo": "J231019600453",
                "supplierSku": "test_0318",
                "sheinSku": "I9ii6m6za3e7",
                "customCodingList": [
                    "#1001172157#1I9ii6m6za3e7oVwnm4M#4284554690725891",
                    "#1001172157#1I9ii6m6za3e7oVwnm4Q#4284554880772097"
                ],
                "barcode": null
            }
        ]
    },
    "bbl": null
}
```

---

## Manually place stocking orders

> **Official docs**: [Manually place stocking orders](https://open.sheincorp.com/documents/apidoc/detail/3001537)

**Method**: `POST` &nbsp; **Path**: `/idms/create-order`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `paramList` | object[] | Yes | Order parameters |
| `skc` | string | Yes | shein skc code |
| `skuCodeList` | object[] | Yes | Order parameters under sku |
| `skuCode` | string | Yes | shein sku code |
| `orderCount` | integer | Yes | Order quantity |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |

---

## Stocking order review list

> **Official docs**: [Stocking order review list](https://open.sheincorp.com/documents/apidoc/detail/3001294)

**Method**: `POST` &nbsp; **Path**: `/idms/review-orders`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skcList` | string[] | No | shein skc code |
| `supplierCodeList` | string[] | No | Supplier or number |
| `orderNoList` | string[] | No | Stock order number |
| `addTimeBegin` | string | No | Start creation time |
| `addTimeEnd` | string | No | Creation Time Ended |
| `pageNum` | string | No | page number |
| `pageSize` | string | No | Quantity per page |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `count` | integer | No |
| `list` | object[] | No |
| `id` | integer | No |
| `imgPath` | string | No |
| `supplierCode` | string | No |
| `skc` | string | No |
| `orderMode` | string | No |
| `applyStatus` | string | No |
| `orderAccount` | string | No |
| `stockType` | string | No |
| `orderSign` | string | No |
| `applyNotes` | string | No |
| `orderNo` | string | No |
| `skuList` | object[] | No |
| `skuCode` | string | No |
| `suffixZh` | string | No |
| `orderCount` | integer | No |
| `adviceCount` | integer | No |
| `addTime` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.cn/open-api/idms/review-orders' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752201122529' \
--data-raw '{
 
 
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "count": 0,
        "list": []
    },
    "bbl": null,
    "traceId": "666d308310855ef5"
}
```

---

## Query product stocking information list

> **Official docs**: [Query product stocking information list](https://open.sheincorp.com/documents/apidoc/detail/3001443)

**Method**: `POST` &nbsp; **Path**: `/openapi-business-backend/stock-goods-list`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pageNum` | integer | No | Page Number; Default 1; |
| `pageSize` | integer | No | Number per page; Default 20; MAX: 20; |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `count` | integer | No |
| `list` | object | No |
| `id` | integer | No |
| `imgPath` | string | No |
| `supplierCode` | string | No |
| `skc` | string | No |
| `spuName` | string | No |
| `categoryName` | string | No |
| `shelfDays` | integer | No |
| `operateLabelList` | object[] | No |
| `type` | string | No |
| `name` | string | No |
| `value` | integer | No |
| `note` | string | No |
| `activityList` | object | No |
| `name` | string | No |
| `date` | string | No |
| `rightsLabelList` | object[] | No |
| `type` | string | No |
| `name` | string | No |
| `value` | integer | No |
| `note` | string | No |
| `activityList` | object | No |
| `name` | string | No |
| `date` | string | No |
| `goodsLabelList` | object[] | No |
| `type` | string | No |
| `name` | string | No |
| `value` | integer | No |
| `note` | string | No |
| `supplyStatus` | object | No |
| `type` | string | No |
| `name` | string | No |
| `value` | integer | No |
| `note` | string | No |
| `shelfStatus` | object | No |
| `type` | string | No |
| `name` | string | No |
| `value` | integer | No |
| `note` | string | No |
| `saleModel` | object | No |
| `type` | string | No |
| `name` | string | No |
| `value` | integer | No |
| `note` | string | No |
| `qualityGrade` | object | No |
| `type` | string | No |
| `name` | string | No |
| `value` | integer | No |
| `note` | string | No |
| `goodsLevel` | object | No |
| `type` | string | No |
| `goodsLevelName` | string | No |
| `goodsLevel` | integer | No |
| `note` | string | No |
| `stockStandard` | object | No |
| `type` | string | No |
| `name` | string | No |
| `value` | integer | No |
| `note` | string | No |
| `skuList` | object[] | No |
| `id` | string | No |
| `skuCode` | string | No |
| `suffixZh` | string | No |
| `predictDaySales` | integer | No |
| `orderCnt` | integer | No |
| `totalSaleVolume` | integer | No |
| `c7dSaleCnt` | integer | No |
| `c30dSaleCnt` | integer | No |
| `stayDeliver` | integer | No |
| `stayShelf` | integer | No |
| `transit` | integer | No |
| `stock` | integer | No |
| `transitSale` | integer | No |
| `preemptionNum` | integer | No |
| `stockSaleDays` | integer | No |
| `saleDays` | integer | No |
| `goodsDate` | integer | No |
| `stockDays` | integer | No |
| `jitGoodsTime` | string | No |
| `jitStockUpDay` | string | No |
| `adviceOrderCount` | integer | No |
| `orderCount` | integer | No |
| `planUrgentCount` | integer | No |
| `price` | string | No |
| `currencySymbol` | string | No |
| `autoOrderStatus` | integer | No |
| `allotPassage` | integer | No |
| `mallSaleStatus` | integer | No |
| `invoiceStatusName` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.cn/open-api/openapi-business-backend/stock-goods-list' \
--header 'x-lt-signature: test0' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752154263008' \
--data-raw '{
 
 
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "count": 10,
        "list": [
            {
                "id": 3058691,
                "picUrl": "https://imgdeal-test01.shein.com/v4/j/pi/2025/04/20/06/17451210808e6a3b15608fa1192d57fcba7b3fdda6_square.jpg",
                "imgPath": "https://imgdeal-test01.shein.com/v4/j/pi/2025/04/20/06/17451210808e6a3b15608fa1192d57fcba7b3fdda6_square.jpg",
                "supplierCode": "111",
                "skc": "ss25042044640264012",
                "spu": "s250420446402",
                "spuName": "s250420446402",
                "categoryName": "女士短连衣裙",
                "shelfDays": 0,
                "operateLabelList": [],
                "rightsLabelList": [],
                "goodsLabelList": [],
                "supplyStatus": {
                    "type": "success",
                    "name": "正常供货",
                    "value": null,
                    "goodsLevelName": "正常供货",
                    "goodsLevel": null,
                    "note": null,
                    "sortValue": null,
                    "activityList": null,
                    "exitPlatformActivity": false
                },
                "shelfStatus": {
                    "type": "warning",
                    "name": "待上架",
                    "value": 0,
                    "goodsLevelName": "待上架",
                    "goodsLevel": 0,
                    "note": null,
                    "sortValue": null,
                    "activityList": null,
                    "exitPlatformActivity": false
                },
                "saleModel": {
                    "type": "success",
                    "name": "实际库存",
                    "value": null,
                    "goodsLevelName": "实际库存",
                    "goodsLevel": null,
                    "note": null,
                    "sortValue": null,
                    "activityList": null,
                    "exitPlatformActivity": false
                },
                "qualityGrade": null,
                "goodsLevel": null,
                "stockStandard": null,
                "stockWarnStatus": null,
                "skuList": [
                    {
                        "id": 1515922,
                        "skuCode": "I5cmbaujgtlf",
                        "attr": "黄色-XXS",
                        "suffixZh": "黄色-XXS",
                        "predictDaySales": 0,
                        "orderCnt": 0,
                        "totalSaleVolume": 0,
                        "c7dSaleCnt": 0,
                        "c30dSaleCnt": 0,
                        "stayDeliver": 0,
                        "stayShelf": 0,
                        "transit": 0,
                        "stock": 0,
                        "transitSale": 0,
                        "preemptionNum": 0,
                        "allotPassage": 0,
                        "planUrgentCount": 0,
                        "stockSaleDays": 0.0,
                        "saleDays": 0.0,
                        "goodsDate": 0,
                        "stockDays": 0,
                        "jitGoodsTime": null,
                        "jitStockUpDay": null,
                        "adviceOrderCount": null,
                        "orderCount": 0,
                        "autoOrderStatus": null,
                        "price": "999.80",
                        "currencySymbol": "USD",
                        "mallSaleStatus": null,
                        "invoiceStatusName": null
                    },
                    {
                        "id": 1515921,
                        "skuCode": "I5cmbaujha2n",
                        "attr": "黄色-XS",
                        "suffixZh": "黄色-XS",
                        "predictDaySales": 0,
                        "orderCnt": 0,
                        "totalSaleVolume": 0,
                        "c7dSaleCnt": 0,
                        "c30dSaleCnt": 0,
                        "stayDeliver": 0,
                        "stayShelf": 0,
                        "transit": 0,
                        "stock": 0,
                        "transitSale": 0,
                        "preemptionNum": 0,
                        "allotPassage": 0,
                        "planUrgentCount": 0,
                        "stockSaleDays": 0.0,
                        "saleDays": 0.0,
                        "goodsDate": 0,
                        "stockDays": 0,
                        "jitGoodsTime": null,
                        "jitStockUpDay": null,
                        "adviceOrderCount": null,
                        "orderCount": 0,
                        "autoOrderStatus": null,
                        "price": "999.80",
                        "currencySymbol": "USD",
                        "mallSaleStatus": null,
                        "invoiceStatusName": null
                    },
                    {
                        "id": null,
                        "skuCode": "合计",
                        "attr": "合计",
                        "suffixZh": "合计",
                        "predictDaySales": 0,
                        "orderCnt": null,
                        "totalSaleVolume": 0,
                        "c7dSaleCnt": 0,
                        "c30dSaleCnt": 0,
                        "stayDeliver": 0,
                        "stayShelf": 0,
                        "transit": 0,
                        "stock": 0,
                        "transitSale": 0,
                        "preemptionNum": 0,
                        "allotPassage": 0,
                        "planUrgentCount": 0,
                        "stockSaleDays": 0.0,
                        "saleDays": 0.0,
                        "goodsDate": null,
                        "stockDays": null,
                        "jitGoodsTime": null,
                        "jitStockUpDay": null,
                        "adviceOrderCount": null,
                        "orderCount": 0,
                        "autoOrderStatus": null,
                        "price": "-",
                        "currencySymbol": "USD",
                        "mallSaleStatus": null,
                        "invoiceStatusName": null
                    }
                ]
            },
            {
                "id": 3058264,
                "picUrl": "https://imgdeal-test01.shein.com/v4/j/pi/2025/04/20/3b/1745121133b9b00faf092921ef37679a195d1e9eb8.jpg",
                "imgPath": "https://imgdeal-test01.shein.com/v4/j/pi/2025/04/20/3b/1745121133b9b00faf092921ef37679a195d1e9eb8.jpg",
                "supplierCode": "222",
                "skc": "ss25042054684812177",
                "spu": "s250420546848",
                "spuName": "s250420546848",
                "categoryName": "女士短连衣裙",
                "shelfDays": 0,
                "operateLabelList": [],
                "rightsLabelList": [],
                "goodsLabelList": [],
                "supplyStatus": {
                    "type": "success",
                    "name": "正常供货",
                    "value": null,
                    "goodsLevelName": "正常供货",
                    "goodsLevel": null,
                    "note": null,
                    "sortValue": null,
                    "activityList": null,
                    "exitPlatformActivity": false
                },
                "shelfStatus": {
                    "type": "warning",
                    "name": "待上架",
                    "value": 0,
                    "goodsLevelName": "待上架",
                    "goodsLevel": 0,
                    "note": null,
                    "sortValue": null,
                    "activityList": null,
                    "exitPlatformActivity": false
                },
                "saleModel": {
                    "type": "success",
                    "name": "实际库存",
                    "value": null,
                    "goodsLevelName": "实际库存",
                    "goodsLevel": null,
                    "note": null,
                    "sortValue": null,
                    "activityList": null,
                    "exitPlatformActivity": false
                },
                "qualityGrade": null,
                "goodsLevel": null,
                "stockStandard": null,
                "stockWarnStatus": null,
                "skuList": [
                    {
                        "id": 1515919,
                        "skuCode": "I7bd8r8hgfj8",
                        "attr": "灰色-XXS",
                        "suffixZh": "灰色-XXS",
                        "predictDaySales": 0,
                        "orderCnt": 0,
                        "totalSaleVolume": 0,
                        "c7dSaleCnt": 0,
                        "c30dSaleCnt": 0,
                        "stayDeliver": 0,
                        "stayShelf": 0,
                        "transit": 0,
                        "stock": 0,
                        "transitSale": 0,
                        "preemptionNum": 0,
                        "allotPassage": 0,
                        "planUrgentCount": 0,
                        "stockSaleDays": 0.0,
                        "saleDays": 0.0,
                        "goodsDate": 0,
                        "stockDays": 0,
                        "jitGoodsTime": null,
                        "jitStockUpDay": null,
                        "adviceOrderCount": null,
                        "orderCount": 0,
                        "autoOrderStatus": null,
                        "price": "999.80",
                        "currencySymbol": "USD",
                        "mallSaleStatus": null,
                        "invoiceStatusName": null
                    },
                    {
                        "id": 1515920,
                        "skuCode": "I7bd8r8hgys4",
                        "attr": "灰色-XS",
                        "suffixZh": "灰色-XS",
                        "predictDaySales": 0,
                        "orderCnt": 0,
                        "totalSaleVolume": 0,
                        "c7dSaleCnt": 0,
                        "c30dSaleCnt": 0,
                        "stayDeliver": 0,
                        "stayShelf": 0,
                        "transit": 0,
                        "stock": 0,
                        "transitSale": 0,
                        "preemptionNum": 0,
                        "allotPassage": 0,
                        "planUrgentCount": 0,
                        "stockSaleDays": 0.0,
                        "saleDays": 0.0,
                        "goodsDate": 0,
                        "stockDays": 0,
                        "jitGoodsTime": null,
                        "jitStockUpDay": null,
                        "adviceOrderCount": null,
                        "orderCount": 0,
                        "autoOrderStatus": null,
                        "price": "999.80",
                        "currencySymbol": "USD",
                        "mallSaleStatus": null,
                        "invoiceStatusName": null
                    },
                    {
                        "id": null,
                        "skuCode": "合计",
                        "attr": "合计",
                        "suffixZh": "合计",
                        "predictDaySales": 0,
                        "orderCnt": null,
                        "totalSaleVolume": 0,
                        "c7dSaleCnt": 0,
                        "c30dSaleCnt": 0,
                        "stayDeliver": 0,
                        "stayShelf": 0,
                        "transit": 0,
                        "stock": 0,
                        "transitSale": 0,
                        "preemptionNum": 0,
                        "allotPassage": 0,
                        "planUrgentCount": 0,
                        "stockSaleDays": 0.0,
                        "saleDays": 0.0,
                        "goodsDate": null,
                        "stockDays": null,
                        "jitGoodsTime": null,
                        "jitStockUpDay": null,
                        "adviceOrderCount": null,
                        "orderCount": 0,
                        "autoOrderStatus": null,
                        "price": "-",
                        "currencySymbol": "USD",
                        "mallSaleStatus": null,
                        "invoiceStatusName": null
                    }
                ]
            }
        ],
        "message": null,
        "updateTime": null
    },
    "bbl": null,
    "traceId": "eb7393ff54fcfc40"
}
```

---

## Print Box Marks or Package Labels

> **Official docs**: [Print Box Marks or Package Labels](https://open.sheincorp.com/documents/apidoc/detail/3001659)

**Method**: `POST` &nbsp; **Path**: `/order/print-package`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | Yes | One of the order numbers on the delivery note |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `info` | object | Yes |
| `orderNoList` | string[] | Yes |
| `packingType` | string | Yes |
| `url` | string | Yes |
| `traceId` | string | No |

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "packingType": 1,
        "orderNoList": [
            "B230309500033",
            "B230309500034",
            "B230313500015",
            "B230313500016",
            "B230313500017",
            "B230314500012",
            "B230314500013",
            "P230314500023",
            "P230314500024",
            "P230314500025",
            "B230316500030",
            "B230316500030-1",
            "P230317500004",
            "P230317500005",
            "P230317500006",
            "P230317500007",
            "P230317500008",
            "P230317500009",
            "B230317500037",
            "B230317500038",
            "B230317500039",
            "B230317500040",
            "B230317500041",
            "B230317500042",
            "P230317500010",
            "B230317500047",
            "B230317500048",
            "B230317500049",
            "B230317500052",
            "P230317500011",
            "P230317500012",
            "B230317500055",
            "P230317500013",
            "P230317500014",
            "B230317500056",
            "P230317500015",
            "B230317500057",
            "B230317500059",
            "B230317500060",
            "B230317500061",
            "B230317500062",
            "B230317500064",
            "B230317500065",
            "P230317500016",
            "P230317500017",
            "B230317500066",
            "B230317500067",
            "P230317500018",
            "P230317500019",
            "B230317500068",
            "B230317500069",
            "P230317500020",
            "P230317500021",
            "P230317500022",
            "P230317500023",
            "B230317500071",
            "B230317500072",
            "P230317500024",
            "P230317500025",
            "B230317500073",
            "P230317500026",
            "B230317500074",
            "B230317500075",
            "B230320500079",
            "P230320500002",
            "P230320500003",
            "B230320500083",
```

---

## Logistics company information query (to be abandoned)

> **Official docs**: [Logistics company information query (to be abandoned)](https://open.sheincorp.com/documents/apidoc/detail/3001300)

**Method**: `GET` &nbsp; **Path**: `/shipping/express-company-list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `addressId` | integer | Yes | Shipping address ID, can be matched to the last level |
| `orderType` | integer | No | Order type 1: Urgent purchase 2: Stock up; recommended to fill in, may affect data accuracy |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object[] | No |
| `companyCode` | string | No |
| `companyName` | string | No |
| `isSupport` | boolean | No |
| `msg` | string | No |
| `traceId` | string | No |

---

## Query SHEIN Warehouse Receiving Information

> **Official docs**: [Query SHEIN Warehouse Receiving Information](https://open.sheincorp.com/documents/apidoc/detail/3001660)

**Method**: `GET` &nbsp; **Path**: `/order/storage-receiver-info`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `storage_id` | integer | Yes |  |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `msg` | string | No |
| `info` | object | Yes |
| `address` | string | No |
| `person` | string | No |
| `phone` | string | No |

---
