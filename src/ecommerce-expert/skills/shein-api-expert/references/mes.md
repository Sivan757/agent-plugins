# SHEIN Open API — MES (Manufacturing Execution System) API

Factory manufacturing interfaces — procurement, picking, BOM, production orders, cutting, sewing, and invoice queries.

## Table of Contents

- [MES-FAC-002 Procurement information interface](#mes-fac-002-procurement-information-interface)
- [MES-FAC-003 Picking information interface](#mes-fac-003-picking-information-interface)
- [MES-FAC-004 secondary process interface](#mes-fac-004-secondary-process-interface)
- [MES-FAC-005 bulk goods BOM interface](#mes-fac-005-bulk-goods-bom-interface)
- [Information query interface](#information-query-interface)
- [Query material exception detailed interface](#query-material-exception-detailed-interface)
- [Query purchase order details interface](#query-purchase-order-details-interface)
- [Query production order number by time](#query-production-order-number-by-time)
- [Query invoice information](#query-invoice-information)
- [Check supplier’s final stock](#check-supplier’s-final-stock)
- [Query production orders](#query-production-orders)
- [MES-FAC-001 order data acquisition interface](#mes-fac-001-order-data-acquisition-interface)
- [Update supplier tail goods](#update-supplier-tail-goods)
- [Sewing completed](#sewing-completed)
- [Cutting bed completed](#cutting-bed-completed)
- [Query order information based on order number](#query-order-information-based-on-order-number)

---

## MES-FAC-002 Procurement information interface

> **Official docs**: [MES-FAC-002 Procurement information interface](https://open.sheincorp.com/documents/apidoc/detail/3000507)

**Method**: `POST` &nbsp; **Path**: `/mes/get-purchase-info`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `acceptOrderEndTime` | string | No | 接单结束时间 |
| `acceptOrderStartTime` | string | No | 接单起始时间 |
| `factoryIdList` | integer[] | No | 工厂id集合 |
| `produceOrderIdList` | integer[] | No | 订单编号 |
| `skc` | string | No | sku |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object[] | Yes |
| `produceOrderId` | integer | No |
| `purchaseInfo` | object[] | Yes |
| `materialColor` | string | No |
| `materialName` | string | No |
| `materialSku` | string | No |
| `materialType` | string | No |
| `price` | double | No |
| `purchaseCode` | string | No |
| `purchaseType` | string | No |
| `simpleUse` | double | No |
| `singleAmountKg` | double | No |
| `supplierAddr` | string | No |
| `supplierCode` | string | No |
| `supplierColorNum` | string | No |
| `supplierLoss` | double | No |
| `supplierName` | string | No |
| `supplierPhone` | string | No |
| `weight` | double | No |
| `width` | double | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": [
        {
            "produceOrderId": 8292325,
            "purchaseInfo": [
                {
                    "materialColor": "红色",
                    "materialName": "拉链一定要成功！",
                    "materialSku": "F00002518",
                    "materialType": "隐形拉链",
                    "price": 356.1626,
                    "purchaseCode": "8292325-P03",
                    "purchaseType": "辅料A",
                    "simpleUse": 4.00,
                    "singleAmountKg": 0.0000,
                    "supplierAddr": "",
                    "supplierCode": "2252",
                    "supplierColorNum": "3",
                    "supplierLoss": 0.5000,
                    "supplierName": "拿爪",
                    "supplierPhone": "",
                    "weight": 190.0000,
                    "width": 38.0000
                },
                {
                    "materialColor": "煤黑色",
                    "materialName": "dd",
                    "materialSku": "M00019142",
                    "materialType": "雪纺",
                    "price": 1.0000,
                    "purchaseCode": "8292325-P02",
                    "purchaseType": "里料A",
                    "simpleUse": 7.00,
                    "singleAmountKg": 0.0000,
                    "supplierAddr": "",
                    "supplierCode": "dd",
                    "supplierColorNum": "12#",
                    "supplierLoss": 3.0000,
                    "supplierName": "村长钻饰",
                    "supplierPhone": "",
                    "weight": 123.0000,
                    "width": 123.0000
                },
                {
                    "materialColor": "gukj",
                    "materialName": "数码成品底布公斤",
                    "materialSku": "M00019006",
                    "materialType": "风衣料",
                    "price": 2.6978,
                    "purchaseCode": "8292325-P01",
                    "purchaseType": "面料A",
                    "simpleUse": 5.00,
                    "singleAmo
```

---

## MES-FAC-003 Picking information interface

> **Official docs**: [MES-FAC-003 Picking information interface](https://open.sheincorp.com/documents/apidoc/detail/3000508)

**Method**: `POST` &nbsp; **Path**: `/mes/get-material-info`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `acceptOrderEndTime` | string | No | 接单结束时间 |
| `acceptOrderStartTime` | string | No | Order starting time |
| `factoryIdList` | integer[] | No | Factory id collection |
| `produceOrderIdList` | integer[] | No | order number |
| `skc` | string | No | sku |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object[] | Yes |
| `pickMaterialInfo` | object[] | Yes |
| `detailList` | object[] | Yes |
| `materialColor` | string | No |
| `materialName` | string | No |
| `materialSku` | string | No |
| `pickNum` | double | No |
| `planUseNum` | double | No |
| `weight` | double | No |
| `width` | double | No |
| `kind` | integer | No |
| `materialOuterId` | string | No |
| `materialPickCode` | string | No |
| `pickMaterialTypeStr` | string | No |
| `statusStr` | string | No |
| `produceOrderId` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": [
        {
            "pickMaterialInfo": [
                {
                    "detailList": [
                        {
                            "materialColor": "数码印花（以实物为准）",
                            "materialName": "数码成品底布公斤",
                            "materialSku": "M00019006",
                            "pickNum": 0.00,
                            "planUseNum": 5025.00,
                            "weight": 23.00,
                            "width": 22.00
                        }
                    ],
                    "kind": 1,
                    "materialOuterId": "DJG202111180023",
                    "materialPickCode": "8292325-P01",
                    "pickMaterialTypeStr": "印花厂领料（FOB）",
                    "statusStr": "待配料"
                }
            ],
            "produceOrderId": 8292325
        }
    ],
    "msg": "success"
}
```

---

## MES-FAC-004 secondary process interface

> **Official docs**: [MES-FAC-004 secondary process interface](https://open.sheincorp.com/documents/apidoc/detail/3000509)

**Method**: `POST` &nbsp; **Path**: `/mes/get-second-precess`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `acceptOrderEndTime` | string | No | Order end time |
| `acceptOrderStartTime` | string | No | Order starting time |
| `factoryIdList` | integer[] | No | Factory id collection |
| `produceOrderIdList` | integer[] | No | order number |
| `skc` | string | No | sku |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object[] | Yes |
| `produceOrderId` | integer | No |
| `secondProcessInfo` | object[] | Yes |
| `craftFactory` | string | No |
| `craftRecordCode` | string | No |
| `purchasePrice` | double | No |
| `type` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": [
        {
            "produceOrderId": 8292325,
            "secondProcessInfo": [
                {
                    "craftFactory": "宝丽洗水厂",
                    "craftRecordCode": "GY6355563",
                    "purchasePrice": 36.0,
                    "type": "定位裁剪"
                }
            ]
        },
        {
            "produceOrderId": 19383746,
            "secondProcessInfo": [
                {
                    "craftFactory": "裁片片-测试",
                    "craftRecordCode": "GY6792156",
                    "purchasePrice": 0.01,
                    "type": "染色"
                }
            ]
        }
    ],
    "msg": "success"
}
```

---

## MES-FAC-005 bulk goods BOM interface

> **Official docs**: [MES-FAC-005 bulk goods BOM interface](https://open.sheincorp.com/documents/apidoc/detail/3000510)

**Method**: `POST` &nbsp; **Path**: `/mes/get-big-goods-bom`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `produceOrderId` | integer | No | 订单编号 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object | Yes |
| `bigGoodsBom` | object[] | Yes |
| `color` | string | No |
| `firstClass` | string | No |
| `materialName` | string | No |
| `materialSku` | string | No |
| `materialType` | string | No |
| `oneSimpleUse` | double | No |
| `part` | string | No |
| `planUse` | string | No |
| `process` | string | No |
| `processRemark` | string | No |
| `supplierLoss` | string | No |
| `unit` | string | No |
| `weight` | double | No |
| `width` | double | No |
| `partName` | string | No |
| `partCode` | string | No |
| `componentId` | long | No |
| `version` | string | No |
| `multiPiecesQuantity` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": {
        "bigGoodsBom": [
            {
                "color": "橙子色",
                "firstClass": "针织",
                "materialName": "12粉色摩托车33232",
                "materialSku": "M00029907",
                "materialType": "面料A",
                "oneSimpleUse": 1.0005,
                "part": "33",
                "partName": "",
                "planUse": "57.02米",
                "process": "",
                "processRemark": "",
                "supplierLoss": "5.55%",
                "unit": "米",
                "weight": 23.00,
                "width": 23.00
            },
            {
                "color": "橙子色",
                "firstClass": "针织",
                "materialName": "粉色摩托车33232",
                "materialSku": "M00029906",
                "materialType": "面料Z",
                "oneSimpleUse": 2.0000,
                "part": "帽子",
                "partName": "",
                "planUse": "113.4米",
                "process": "",
                "processRemark": "",
                "supplierLoss": "5%",
                "unit": "米",
                "weight": 23.00,
                "width": 23.00
            }
        ],
        "multiPiecesQuantity": 1
    },
    "msg": "success"
}
```

---

## Information query interface

> **Official docs**: [Information query interface](https://open.sheincorp.com/documents/apidoc/detail/3000511)

**Method**: `POST` &nbsp; **Path**: `/mes/bundle-info`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `bundleNum` | string | No | Zhahao |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object | Yes |
| `bundleNum` | string | No |
| `bundlePieces` | integer | No |
| `designCode` | string | No |
| `produceOrderId` | integer | No |
| `size` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": {
        "bundleNum": "19474755-P1-B01",
        "bundlePieces": 1000,
        "designCode": "W1diu2211140040",
        "produceOrderId": 19474755,
        "size": "29"
    },
    "msg": "success"
}
```

---

## Query material exception detailed interface

> **Official docs**: [Query material exception detailed interface](https://open.sheincorp.com/documents/apidoc/detail/3000512)

**Method**: `POST` &nbsp; **Path**: `/mes/material-anomalous/list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `factoryIds` | integer[] | No | Factory permissions |
| `pageNo` | integer | No | current page number |
| `pageSize` | integer | No | Quantity per page |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object | Yes |
| `pageNo` | integer | No |
| `pageSize` | integer | No |
| `recoders` | object[] | Yes |
| `anomalousAmount` | double | No |
| `anomalousReason` | integer | No |
| `anomalousStatus` | integer | No |
| `anomalousType` | integer | No |
| `dataSource` | integer | No |
| `isInvoice` | integer | No |
| `isTrace` | integer | No |
| `materialAnomalousCode` | string | No |
| `materialDeliveryCode` | string | No |
| `materialSku` | string | No |
| `requireAmount` | double | No |
| `taxRate` | double | No |
| `totalPage` | integer | No |
| `totalRecoder` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "currentPageNo": 1,
    "info": [
        {
            "anomalousAmount": 0.00,
            "anomalousReason": 0,
            "anomalousStatus": 6,
            "anomalousType": 5,
            "dataSource": 0,
            "isInvoice": 2,
            "isTrace": 0,
            "materialAnomalousCode": "YC520550001",
            "materialDeliveryCode": " ",
            "materialSku": "M00015323",
            "requireAmount": 15101.10,
            "taxRate": 0.0000
        }
    ],
    "msg": "success",
    "totalPageNo": 1
}
```

---

## Query purchase order details interface

> **Official docs**: [Query purchase order details interface](https://open.sheincorp.com/documents/apidoc/detail/3000513)

**Method**: `POST` &nbsp; **Path**: `/mes/purchase-detail-info-list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `produceOrderId` | integer | No | order number |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object[] | Yes |
| `batchColorResult` | string | No |
| `materialColor` | string | No |
| `materialName` | string | No |
| `materialSku` | string | No |
| `materialType` | string | No |
| `price` | double | No |
| `purchaseCode` | string | No |
| `purchaseType` | string | No |
| `simpleUse` | double | No |
| `singleAmountKg` | double | No |
| `supplierAddr` | string | No |
| `supplierCode` | string | No |
| `supplierColorNum` | string | No |
| `supplierLoss` | double | No |
| `supplierName` | string | No |
| `supplierPhone` | string | No |
| `weight` | double | No |
| `width` | double | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": [
        {
            "materialColor": "灰色",
            "materialName": "别用这个sku-高风险专用5",
            "materialSku": "M00019674",
            "materialType": "洗水棉",
            "planTotalAmount": 1223.2500,
            "price": 2.3250,
            "purchaseCode": "9366229-P01",
            "purchaseType": "面料A",
            "simpleUse": 1.00,
            "singleAmountKg": 0.0000,
            "size": "",
            "supplierAddr": "",
            "supplierCode": "拿爪最好的物料",
            "supplierColorNum": "104",
            "supplierLoss": 5.0000,
            "supplierName": "拿爪",
            "supplierPhone": "",
            "weight": 155.0000,
            "width": 125.0000
        }
    ],
    "msg": "success"
}
```

---

## Query production order number by time

> **Official docs**: [Query production order number by time](https://open.sheincorp.com/documents/apidoc/detail/3000514)

**Method**: `POST` &nbsp; **Path**: `/mes/query-produce-order-ids`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `endTime` | string | Yes | End Time |
| `startTime` | string | Yes | Starting time |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | integer[] | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": [
        19501135,
        19516725,
        19516811,
        19516726,
        19516727,
        19485938,
        19516806
    ],
    "msg": "success"
}
```

---

## Query invoice information

> **Official docs**: [Query invoice information](https://open.sheincorp.com/documents/apidoc/detail/3000515)

**Method**: `POST` &nbsp; **Path**: `/mes/deliver-order/list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `acceptOrderEndTime` | string | No | Order end time |
| `acceptOrderStartTime` | string | No | Order starting time |
| `factoryIdList` | integer[] | No | Factory id collection |
| `produceOrderIdList` | integer[] | No | order number |
| `skc` | string | No | sku |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object[] | Yes |
| `deliverNumber` | string | No |
| `deliverStatus` | integer | No |
| `deliverStatusStr` | string | No |
| `deliveryInfo` | object[] | Yes |
| `diffRateValue` | integer | No |
| `forecastValue` | integer | No |
| `quantity` | integer | No |
| `quantityInterval` | string | No |
| `sizeName` | string | No |
| `deliveryQty` | integer | No |
| `deliverySizeDetails` | string | No |
| `inspectionTime` | object | Yes |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | integer | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `produceOrderId` | integer | No |
| `qualityInfo` | string | No |
| `reason` | integer | No |
| `reasonStr` | string | No |
| `returnInfo` | object[] | Yes |
| `diffRateValue` | integer | No |
| `forecastValue` | integer | No |
| `quantity` | integer | No |
| `quantityInterval` | string | No |
| `sizeName` | string | No |
| `returnInfoStr` | string | No |
| `returnQty` | integer | No |
| `returnStatus` | integer | No |
| `returnStatusStr` | string | No |
| `returnTime` | object | Yes |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | integer | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `returnType` | integer | No |
| `returnTypeStr` | string | No |
| `sendTime` | object | Yes |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | integer | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `storeInfo` | object[] | Yes |
| `diffRateValue` | integer | No |
| `forecastValue` | integer | No |
| `quantity` | integer | No |
| `quantityInterval` | string | No |
| `sizeName` | string | No |
| `storeInfoStr` | string | No |
| `storeTime` | object | Yes |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | integer | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `storedQty` | integer | No |
| `subProduceOrderCode` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": [
        {
            "deliverNumber": "19486148-1-F01",
            "deliverStatusStr": "作废",
            "deliveryInfo": [
                {
                    "quantity": 30,
                    "sizeName": "28"
                }
            ],
            "deliveryQty": 30,
            "produceOrderId": 19486148,
            "reasonStr": "首次发货",
            "receiveTime": null,
            "returnInfoStr": "",
            "returnStatusStr": "返工中",
            "sendTime": "2023-09-06 16:04:45",
            "storedQty": 20,
            "subProduceOrderCode": "19486148-1"
        },
        {
            "deliverNumber": "",
            "deliverStatusStr": "待发货",
            "deliveryQty": 0,
            "produceOrderId": 19486148,
            "reasonStr": "首次发货",
            "receiveTime": null,
            "returnInfoStr": "",
            "returnStatusStr": "返工中",
            "storedQty": 20,
            "subProduceOrderCode": "19486148-1"
        },
        {
            "deliverNumber": "19486148-2-F01",
            "deliverStatusStr": "作废",
            "deliveryInfo": [
                {
                    "quantity": 30,
                    "sizeName": "28"
                }
            ],
            "deliveryQty": 30,
            "produceOrderId": 19486148,
            "reasonStr": "首次发货",
            "receiveTime": null,
            "returnInfoStr": "",
            "returnStatusStr": "返工中",
            "sendTime": "2023-09-06 16:04:47",
            "storedQty": 20,
            "subProduceOrderCode": "19486148-2"
        },
        {
            "deliverNumber": "",
            "deliverStatusStr": "待发货",
            "deliveryQty": 0,
            "produceOrderId": 19486148,
            "reasonStr": "首次发货",
            "receiveTime": null,
            "returnInfoStr": "",
            "returnStatusStr": "返工中",
            "storedQty": 20,
            "subProduceOrderCode": "19486148-2"
        },
        {
            "deliverNumber": "19486148-3-F01",
            "deliverSt
```

---

## Check supplier’s final stock

> **Official docs**: [Check supplier’s final stock](https://open.sheincorp.com/documents/apidoc/detail/3000522)

**Method**: `POST` &nbsp; **Path**: `/mes/order-inventory-surplus/list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `factoryIds` | integer[] | No | Factory permissions |
| `pageNo` | integer | No | current page number |
| `pageSize` | integer | No | Quantity per page |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object | Yes |
| `pageNo` | integer | No |
| `pageSize` | integer | No |
| `recoders` | object[] | Yes |
| `inventoryType` | integer | No |
| `isDismount` | integer | No |
| `sizeInfo` | string | No |
| `skc` | string | No |
| `totalSurplus` | integer | No |
| `totalPage` | integer | No |
| `totalRecoder` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "currentPageNo": 1,
    "info": [
        {
            "skc":"swfXXXXXasf123",
            "totalSurplus":40,
            "sizeInfo":"S:30<br/>M:10",
            "isDismount":0,
            "inventoryType":1
        }
    ],
    "msg": "success",
    "totalPageNo": 1
}
```

---

## Query production orders

> **Official docs**: [Query production orders](https://open.sheincorp.com/documents/apidoc/detail/3000521)

**Method**: `POST` &nbsp; **Path**: `/mes/get-produce-order-info`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `produceOrderId` | integer | Yes | order number |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object | No |
| `acceptOrderTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `clothCostFeeDetail` | object[] | No |
| `category` | string | No |
| `clothCostFeeDetail` | object[] | No |
| `burningPrintTipFlag` | boolean | No |
| `componentId` | int64 | No |
| `invoiceState` | integer | No |
| `materialMeter` | string | No |
| `materialSku` | string | No |
| `partCode` | string | No |
| `partName` | string | No |
| `preUnitName` | string | No |
| `price` | double | No |
| `profit` | double | No |
| `profitRate` | double | No |
| `scaleValue` | double | No |
| `secondaryProcessName` | string | No |
| `simpleAccount` | string | No |
| `simpleUse` | string | No |
| `standard` | string | No |
| `superTaxRate` | string | No |
| `superTaxRateDecimal` | double | No |
| `supplierLoss` | string | No |
| `supplierName` | string | No |
| `supplierProfit` | string | No |
| `title` | string | No |
| `unitPrice` | double | No |
| `invoiceState` | integer | No |
| `littleSumCost` | double | No |
| `profitForOrder` | double | No |
| `scale` | double | No |
| `sumCost` | double | No |
| `sumCostDesc` | string | No |
| `sumCostExProfit` | double | No |
| `sumCostForSale` | double | No |
| `sumCostTotal` | double | No |
| `superTaxRate` | double | No |
| `type` | string | No |
| `cutBedInfo` | object[] | No |
| `diffRateValue` | integer | No |
| `forecastValue` | integer | No |
| `quantity` | integer | No |
| `quantityInterval` | string | No |
| `sizeName` | string | No |
| `cutBedQty` | integer | No |
| `deliveryTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `designCode` | string | No |
| `isFirst` | string | No |
| `isUrgent` | string | No |
| `leadTimeDelayedDays` | integer | No |
| `linkTotalDays` | integer | No |
| `orderInfo` | object[] | No |
| `diffRateValue` | integer | No |
| `forecastValue` | integer | No |
| `quantity` | integer | No |
| `quantityInterval` | string | No |
| `sizeName` | string | No |
| `orderPrice` | double | No |
| `orderTotalDays` | integer | No |
| `orderType` | string | No |
| `pic` | string | No |
| `pickMaterialInfo` | object[] | No |
| `detailList` | object[] | No |
| `kind` | integer | No |
| `materialOuterId` | string | No |
| `materialPickCode` | string | No |
| `pickMaterialType` | integer | No |
| `pickMaterialTypeStr` | string | No |
| `status` | integer | No |
| `statusStr` | string | No |
| `placeOrderTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `processCostFee` | double | No |
| `processProfit` | double | No |
| `produceOrderId` | integer | No |
| `producer` | string | No |
| `purchaseInfo` | object[] | No |
| `batchColorResult` | string | No |
| `materialColor` | string | No |
| `materialName` | string | No |
| `materialSku` | string | No |
| `materialType` | string | No |
| `price` | double | No |
| `purchaseCode` | string | No |
| `purchaseType` | string | No |
| `simpleUse` | double | No |
| `singleAmountKg` | double | No |
| `supplierAddr` | string | No |
| `supplierCode` | string | No |
| `supplierColorNum` | string | No |
| `supplierLoss` | double | No |
| `supplierName` | string | No |
| `supplierPhone` | string | No |
| `weight` | double | No |
| `width` | double | No |
| `quantity` | integer | No |
| `refSku` | string | No |
| `scale` | double | No |
| `secondProcess` | object[] | No |
| `processName` | string | No |
| `simpleUse` | string | No |
| `supplierName` | string | No |
| `unitPrice` | double | No |
| `secondProcessInstance` | object | No |
| `processName` | string | No |
| `simpleUse` | string | No |
| `supplierName` | string | No |
| `unitPrice` | double | No |
| `sku` | string | No |
| `status` | string | No |
| `statusCode` | string | No |
| `stockType` | string | No |
| `weavingType` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": {
        "acceptOrderTime": "2022-06-30 14:22:57",
        "clothCostFeeDetail": [
            {
                "category": "加工费",
                "clothCostFeeDetail": [
                    {
                        "burningPrintTipFlag": false,
                        "componentId": "970",
                        "materialMeter": "-",
                        "partCode": "O31bsvm136z18754",
                        "partName": "护肘en",
                        "price": "12.00",
                        "profitRate": 0.1168,
                        "simpleAccount": "-",
                        "simpleUse": "-",
                        "supplierLoss": "-",
                        "supplierProfit": "-",
                        "title": "W1diu2110010059",
                        "unitPrice": "12.00"
                    },
                    {
                        "burningPrintTipFlag": false,
                        "componentId": "971",
                        "materialMeter": "-",
                        "partCode": "O31bsvm136z10682",
                        "partName": "上衣",
                        "price": "12.00",
                        "profitRate": 0.1168,
                        "simpleAccount": "-",
                        "simpleUse": "-",
                        "supplierLoss": "-",
                        "supplierProfit": "-",
                        "title": "W1diu2110010059",
                        "unitPrice": "12.00"
                    }
                ],
                "littleSumCost": "24.00",
                "scale": 2.30,
                "sumCostDesc": "61.65<br>(含倍率：55.20,含利润：6.45)",
                "sumCostForSale": "55.20",
                "sumCostTotal": "61.65"
            },
            {
                "category": "物料费",
                "clothCostFeeDetail": [
                    {
                        "burningPrintTipFlag": false,
                        "componentId": "970",
                        "invoiceState": 2,
                        "mate
```

---

## MES-FAC-001 order data acquisition interface

> **Official docs**: [MES-FAC-001 order data acquisition interface](https://open.sheincorp.com/documents/apidoc/detail/3000520)

**Method**: `POST` &nbsp; **Path**: `/mes/get-order-info`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `acceptOrderEndTime` | string | No | Order end time |
| `acceptOrderStartTime` | string | No | Order starting time |
| `factoryIdList` | integer[] | No | Factory id collection |
| `produceOrderIdList` | integer[] | Yes | order number |
| `skc` | string | No | sku |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object[] | No |
| `acceptOrderTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `cutBedInfo` | object[] | No |
| `diffRateValue` | integer | No |
| `forecastValue` | integer | No |
| `quantity` | integer | No |
| `quantityInterval` | string | No |
| `sizeName` | string | No |
| `cutBedQty` | integer | No |
| `cutInfoStr` | string | No |
| `deliveryTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `designCode` | string | No |
| `factoryId` | int64 | No |
| `isFirst` | boolean | No |
| `isUrgent` | boolean | No |
| `orderInfo` | object[] | No |
| `diffRateValue` | integer | No |
| `forecastValue` | integer | No |
| `quantity` | integer | No |
| `quantityInterval` | string | No |
| `sizeName` | string | No |
| `orderInfoStr` | string | No |
| `orderPrice` | double | No |
| `orderRecordId` | int64 | No |
| `orderType` | string | No |
| `orderTypeInt` | integer | No |
| `pic` | string | No |
| `placeOrderTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `produceOrderId` | integer | No |
| `producer` | string | No |
| `quantity` | integer | No |
| `refSku` | string | No |
| `secondProcess` | object[] | No |
| `processName` | string | No |
| `simpleUse` | string | No |
| `supplierName` | string | No |
| `unitPrice` | double | No |
| `sku` | string | No |
| `status` | string | No |
| `statusInt` | integer | No |
| `stockType` | string | No |
| `stockTypeInt` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": [
        {
            "acceptOrderTime": "1000-01-01 00:00:00",
            "cutBedInfo": [
                {
                    "quantityInterval": "950",
                    "sizeName": "XXL"
                }
            ],
            "cutBedQty": 950,
            "deliveryTime": "2022-01-16",
            "designCode": "W1diu2107020007",
            "isFirst": true,
            "isUrgent": false,
            "orderInfo": [
                {
                    "quantity": 950,
                    "sizeName": "XXL"
                }
            ],
            "orderPrice": "567.56",
            "orderRecordId": "9111130000000059412",
            "orderType": "FOB",
            "pic": "https://filetest.ltwebstatic.com/spiderfile/aifd/2021/5/16220821371440386787.jpg",
            "placeOrderTime": "2022-01-12 14:36:17",
            "produceOrderId": 9298549,
            "producer": "52055分厂1",
            "quantity": 950,
            "refSku": "",
            "sku": "mM21052766243933",
            "status": "已发货",
            "stockType": "JIT备货"
        },
        {
            "acceptOrderTime": "2022-05-13 16:44:38",
            "cutBedInfo": [
                {
                    "quantityInterval": "39",
                    "sizeName": "S"
                }
            ],
            "cutBedQty": 39,
            "deliveryTime": "2022-02-25",
            "designCode": "W1diu2107020005",
            "isFirst": true,
            "isUrgent": false,
            "orderInfo": [
                {
                    "quantity": 30,
                    "sizeName": "S"
                }
            ],
            "orderPrice": "12.00",
            "orderRecordId": "9111130000000059754",
            "orderType": "FOB",
            "pic": "https://imgdeal-test01.shein.com/pi_img/2021/06/01/16225347921750591502.jpg",
            "placeOrderTime": "2022-02-28 13:50:16",
            "produceOrderId": 9315846,
            "producer": "52055分厂1",
            "quantity": 30,
            "refS
```

---

## Update supplier tail goods

> **Official docs**: [Update supplier tail goods](https://open.sheincorp.com/documents/apidoc/detail/3000519)

**Method**: `POST` &nbsp; **Path**: `/mes/order-inventory-surplus/update`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `produceOrderId` | integer | Yes | order number |
| `sizeInfo` | object[] | Yes |  |
| `size` | string | Yes | size |
| `quantity` | integer | Yes | quantity |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "msg": "success"
}
```

---

## Sewing completed

> **Official docs**: [Sewing completed](https://open.sheincorp.com/documents/apidoc/detail/3000518)

**Method**: `POST` &nbsp; **Path**: `/mes/sew-end`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `produceOrderId` | integer | No |  |
| `dispatchStaffInfos` | object[] | Yes |  |
| `operatorName` | string | No |  |
| `bundleNum` | string | No |  |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object | Yes |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "msg": "success"
}
```

---

## Cutting bed completed

> **Official docs**: [Cutting bed completed](https://open.sheincorp.com/documents/apidoc/detail/3000517)

**Method**: `POST` &nbsp; **Path**: `/mes/end-cut-bed`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `produceOrderId` | integer | No |  |
| `operatorNames` | string[] | No |  |
| `bundleDetailList` | object[] | Yes |  |
| `size` | string | No |  |
| `number` | integer | No |  |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `produceOrderId` | integer | No |
| `bundleDetailList` | object[] | Yes |
| `bundleNum` | string | No |
| `size` | string | No |
| `number` | integer | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": {
        "produceOrderId":19399708,
        "bundleDetailList":[
            {
                "bundleNum":"19399708-P1-B01",
                "size":"S",
                "number":20
            }
        ]
    },
    "msg": "success"
}
```

---

## Query order information based on order number

> **Official docs**: [Query order information based on order number](https://open.sheincorp.com/documents/apidoc/detail/3000516)

**Method**: `POST` &nbsp; **Path**: `/mes/query-produce-order-info-by-id`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `produceOrderId` | integer | Yes | order number |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `detailMsg` | string | No |
| `info` | object | No |
| `acceptOrderTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `clothCostFeeDetail` | object[] | No |
| `category` | string | No |
| `clothCostFeeDetail` | object[] | No |
| `burningPrintTipFlag` | boolean | No |
| `componentId` | int64 | No |
| `invoiceState` | integer | No |
| `materialMeter` | string | No |
| `materialSku` | string | No |
| `partCode` | string | No |
| `partName` | string | No |
| `preUnitName` | string | No |
| `price` | double | No |
| `profit` | double | No |
| `profitRate` | double | No |
| `scaleValue` | double | No |
| `secondaryProcessName` | string | No |
| `simpleAccount` | string | No |
| `simpleUse` | string | No |
| `standard` | string | No |
| `superTaxRate` | string | No |
| `superTaxRateDecimal` | double | No |
| `supplierId` | integer | No |
| `supplierLoss` | string | No |
| `supplierName` | string | No |
| `supplierProfit` | string | No |
| `title` | string | No |
| `unitPrice` | double | No |
| `invoiceState` | integer | No |
| `littleSumCost` | double | No |
| `profitForOrder` | double | No |
| `scale` | double | No |
| `sumCost` | double | No |
| `sumCostDesc` | string | No |
| `sumCostExProfit` | double | No |
| `sumCostForSale` | double | No |
| `sumCostTotal` | double | No |
| `superTaxRate` | double | No |
| `type` | string | No |
| `colors` | string | No |
| `cutBedInfo` | object[] | No |
| `diffRateValue` | integer | No |
| `forecastValue` | integer | No |
| `quantity` | integer | No |
| `quantityInterval` | string | No |
| `sizeName` | string | No |
| `cutBedQty` | integer | No |
| `deliverInfos` | object[] | No |
| `deliverOrderNum` | integer | No |
| `isAllowDelivery` | integer | No |
| `notifyDeliveryTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `overLimitOrderNum` | integer | No |
| `qualityOrderNum` | integer | No |
| `rejectOrderNum` | integer | No |
| `storeTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `subOrderBackTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `subProduceOrderCode` | string | No |
| `totalOrderNum` | integer | No |
| `deliveryTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `designCode` | string | No |
| `excetionTypes` | integer[] | No |
| `firstReturnOrder` | integer | No |
| `isFirst` | string | No |
| `isUrgent` | string | No |
| `leadTimeDelayedDays` | integer | No |
| `linkTotalDays` | integer | No |
| `multiPiecesQuantity` | integer | No |
| `orderInfo` | object[] | No |
| `diffRateValue` | integer | No |
| `forecastValue` | integer | No |
| `quantity` | integer | No |
| `quantityInterval` | string | No |
| `sizeName` | string | No |
| `orderPrice` | double | No |
| `orderTotalDays` | integer | No |
| `orderType` | string | No |
| `pic` | string | No |
| `pickMaterialInfo` | object[] | No |
| `detailList` | object[] | No |
| `kind` | integer | No |
| `materialOuterId` | string | No |
| `materialPickCode` | string | No |
| `pickMaterialType` | integer | No |
| `pickMaterialTypeStr` | string | No |
| `status` | integer | No |
| `statusStr` | string | No |
| `placeOrderTime` | object | No |
| `date` | integer | No |
| `day` | integer | No |
| `hours` | integer | No |
| `minutes` | integer | No |
| `month` | integer | No |
| `nanos` | integer | No |
| `seconds` | integer | No |
| `time` | int64 | No |
| `timezoneOffset` | integer | No |
| `year` | integer | No |
| `processCostFee` | double | No |
| `processProfit` | double | No |
| `produceOrderId` | integer | No |
| `producer` | string | No |
| `purchaseInfo` | object[] | No |
| `batchColorResult` | string | No |
| `materialColor` | string | No |
| `materialName` | string | No |
| `materialSku` | string | No |
| `materialType` | string | No |
| `planTotalAmount` | double | No |
| `price` | double | No |
| `purchaseCode` | string | No |
| `purchaseType` | string | No |
| `simpleUse` | double | No |
| `singleAmountKg` | double | No |
| `size` | string | No |
| `supplierAddr` | string | No |
| `supplierCode` | string | No |
| `supplierColorNum` | string | No |
| `supplierLoss` | double | No |
| `supplierName` | string | No |
| `supplierPhone` | string | No |
| `weight` | double | No |
| `width` | double | No |
| `quantity` | integer | No |
| `refSku` | string | No |
| `scale` | double | No |
| `secondProcess` | object[] | No |
| `processName` | string | No |
| `simpleUse` | string | No |
| `supplierName` | string | No |
| `unitPrice` | double | No |
| `secondProcessInstance` | object | No |
| `processName` | string | No |
| `simpleUse` | string | No |
| `supplierName` | string | No |
| `unitPrice` | double | No |
| `seriesBrandName` | string | No |
| `skcLevel` | integer | No |
| `sku` | string | No |
| `status` | string | No |
| `statusCode` | string | No |
| `stockType` | string | No |
| `weavingType` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "info": {
        "acceptOrderTime": "2023-02-14 10:23:12",
        "clothCostFeeDetail": [
            {
                "category": "加工费",
                "clothCostFeeDetail": [
                    {
                        "burningPrintTipFlag": false,
                        "componentId": "31188",
                        "materialMeter": "-",
                        "partCode": "O9ajfg9p0hkl4584",
                        "partName": "上衣",
                        "price": "1.36",
                        "profitRate": 0.1168,
                        "simpleAccount": "-",
                        "simpleUse": "-",
                        "supplierLoss": "-",
                        "supplierProfit": "-",
                        "title": "测试部件？新增衣车通用动作2个*2(2个)",
                        "unitPrice": "1.36"
                    },
                    {
                        "burningPrintTipFlag": false,
                        "componentId": "31189",
                        "materialMeter": "-",
                        "partCode": "O9ajfg9p0hkl1515",
                        "partName": "下装_cn",
                        "price": "0.68",
                        "profitRate": 0.1168,
                        "simpleAccount": "-",
                        "simpleUse": "-",
                        "supplierLoss": "-",
                        "supplierProfit": "-",
                        "title": "测试部件？新增衣车通用动作2个*2",
                        "unitPrice": "0.68"
                    },
                    {
                        "burningPrintTipFlag": false,
                        "componentId": "31190",
                        "materialMeter": "-",
                        "partCode": "O9ajfg9p0hkl2385",
                        "partName": "领结",
                        "price": "0.68",
                        "profitRate": 0.1168,
                        "simpleAccount": "-",
                        "simpleUse": "-",
                        "supplierLoss": "-",
                        "supplierProfit
```

---
