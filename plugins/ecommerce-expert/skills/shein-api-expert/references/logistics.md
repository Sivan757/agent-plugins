# SHEIN Open API — Logistics Provider API

Logistics provider integrations — network callbacks, tracking data, waybill management, weight callbacks, and settlement.

## Table of Contents

- [Logistic provider network callback interface](#logistic-provider-network-callback-interface)
- [[New] Logistics track callback](#[new]-logistics-track-callback)
- [License plate information callback](#license-plate-information-callback)
- [SF Waybill Uncollected Package Details Callback Interface](#sf-waybill-uncollected-package-details-callback-interface)
- [【New】Logistic weight callback](#【new】logistic-weight-callback)
- [Logistics interface - get courier company information](#logistics-interface---get-courier-company-information)
- [Logistic provider interface - Logistic provider waybill callback](#logistic-provider-interface---logistic-provider-waybill-callback)
- [Logistics providers push trajectory data-unified interface](#logistics-providers-push-trajectory-data-unified-interface)
- [Logistics providers push trajectory data-trackingmore](#logistics-providers-push-trajectory-data-trackingmore)
- [Upload evidence of settlement abnormalities](#upload-evidence-of-settlement-abnormalities)
- [Pick-up timeout/cancel shipment reasons feedback](#pick-up-timeoutcancel-shipment-reasons-feedback)

---

## Logistic provider network callback interface

> **Official docs**: [Logistic provider network callback interface](https://open.sheincorp.com/documents/apidoc/detail/3000496)

**Method**: `POST` &nbsp; **Path**: `/cargo/express-website-message`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `opType` | integer | No | (Not required, verified by SHEIN background) Operation type 1-Add, 2-Modify except the outlet number. |
| `siteCode` | string | Yes | 网点编号 |
| `siteName` | string | Yes | 网点名称 |
| `province` | string | No | 省份 |
| `city` | string | No | 城市 |
| `region` | string | No | 区县 |
| `detail` | string | No | 详细地址 |
| `status` | integer | Yes | Is it open? 1-Yes, 2-No |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `info` | object | No |
| `error` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": "0",
    "msg": "success",
    "info": null,
    "error": ""
}
```

---

## [New] Logistics track callback

> **Official docs**: [[New] Logistics track callback](https://open.sheincorp.com/documents/apidoc/detail/3000505)

**Method**: `POST` &nbsp; **Path**: `/cargo/logistics-trajectory-callback`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `data` | object[] | Yes | data |
| `trackingNumber` | string | Yes | Waybill number |
| `step` | string | No | Routing steps, such as "signing completed" |
| `time` | string | Yes | Routing occurrence time, such as "2021-08-14 08:23:17" |
| `nodeId` | string | Yes | Routing node ID, such as 1000 |
| `desc` | string | No | 路由节点描述 |
| `information` | string | No | json string, differentiated field, if not filled in, please refer to the description for details |
| `plateNo` | string | No | Logistics return license plate, for example, when route node ID=1000 returns, it is the receiving license plate |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": "0",
    "msg": "success",
    "info": null
}
```

---

## License plate information callback

> **Official docs**: [License plate information callback](https://open.sheincorp.com/documents/apidoc/detail/3001045)

**Method**: `POST` &nbsp; **Path**: `/cargo/platenum-callback`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `batchCode` | string | Yes | 批次号 |
| `plateNum` | string | Yes | 车牌号 |
| `expressCodeList` | string[] | Yes | 运单号集合 |
| `plateNumTwo` | string | No | License plate number 2 |
| `estimatedArriveStorageTime` | datetime | No | Estimated arrival time |
| `freightCarType` | string | No | car model |
| `freightCarDepartureTime` | datetime | No | Vehicle departure time |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": null
}
```

---

## SF Waybill Uncollected Package Details Callback Interface

> **Official docs**: [SF Waybill Uncollected Package Details Callback Interface](https://open.sheincorp.com/documents/apidoc/detail/3000498)

**Method**: `POST` &nbsp; **Path**: `/cargo/qc-outside-cancel-sf-express`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `expressNo` | string | Yes | Waybill number |
| `boxNo` | string[] | Yes | Package number, supports multiple |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `info` | object | Yes |
| `box_no` | string[] | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": "0",
    "msg": "",
    "info": {
         "box_no": ["B210517000003-1-2","B210517000003-1-2","B210517000003-1-3"]
    }
}
```

---

## 【New】Logistic weight callback

> **Official docs**: [【New】Logistic weight callback](https://open.sheincorp.com/documents/apidoc/detail/3000928)

**Method**: `POST` &nbsp; **Path**: `/cargo/weight-callback`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `data` | object[] | Yes | data |
| `trackingNumber` | string | Yes | Waybill number |
| `actualWeight` | string | No | Actual weight, such as 100.25 |
| `volumeWeight` | string | No | Volume weight (throwing weight), such as 100.25 |
| `chargeWeight` | string | No | Billing weight, such as 100.25 |
| `packageQuantity` | string | No | Package quantity, such as 5 |
| `volume` | decimal | No | Shipment volume, unit: cubic meter, up to 6 decimal places (e.g. 0.0063) |
| `volumeDetails` | string | No | Volume details, unit: centimeter, length * width * height * quantity, data of different package sizes separated by English letters ", up to 2000 characters (e.g. "30*30*30*2, 20*20*20*1, 10*10*10*2") |
| `packageDetails` | object[] | No | Package details |
| `actualWeight` | double | No | Actual weight, unit: kg |
| `length` | integer | No | Length, unit: cm |
| `width` | integer | No | Width, unit: cm |
| `height` | integer | No | Height, unit: cm |
| `quantity` | integer | No | Quantity, if sub-order number is not sent, quantity is mandatory. If sub-order number is sent, quantity defaults to 1 |
| `subWaybillNo` | string | No | Sub-order number |
| `volume` | double | No | Volume, unit: cubic meter, up to 6 decimal places |
| `volumeWeight` | double | No | Volumetric weight, unit: kg |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": null
}
```

---

## Logistics interface - get courier company information

> **Official docs**: [Logistics interface - get courier company information](https://open.sheincorp.com/documents/apidoc/detail/3001498)

**Method**: `GET` &nbsp; **Path**: `/order/express-infos`


### Request Parameters

_No additional request parameters._

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `list` | object[] | No |
| `id` | double | No |
| `expressName` | string | No |
| `expressCode` | string | No |
| `traceId` | string | No |

### Response Example

```json
{
    "code": "0",
    "msg": "",
    "info": {
        "list": [
            {
                "expressName": "跨越",
                "expressCode": "kuayue",
                "id": "21"
            },
            {
                "expressName": "优速",
                "expressCode": "2",
                "id": "22"
            },
            {
                "expressName": "中通",
                "expressCode": "3",
                "id": "23"
            },
            {
                "expressName": "申通",
                "expressCode": "4",
                "id": "24"
            },
            {
                "expressName": "速尔",
                "expressCode": "5",
                "id": "25"
            },
            {
                "expressName": "顺丰",
                "expressCode": "shunfeng",
                "id": "26"
            },
            {
                "expressName": "快捷",
                "expressCode": "7",
                "id": "27"
            },
            {
                "expressName": "圆通",
                "expressCode": "8",
                "id": "28"
            },
            {
                "expressName": "汇通",
                "expressCode": "9",
                "id": "29"
            },
            {
                "expressName": "韵达",
                "expressCode": "yunda",
                "id": "30"
            },
            {
                "expressName": "其他",
                "expressCode": "11",
                "id": "31"
            },
            {
                "expressName": "京东",
                "expressCode": "jingdong",
                "id": "1100"
            },
            {
                "expressName": "领送",
                "expressCode": "lingsong",
                "id": "1101"
            },
            {
                "expressName": "车门",
                "expressCode": "chemen",
                "id": "10322"
            }
        ]
    },
    "error": null
}
```

---

## Logistic provider interface - Logistic provider waybill callback

> **Official docs**: [Logistic provider interface - Logistic provider waybill callback](https://open.sheincorp.com/documents/apidoc/detail/3000499)

**Method**: `POST` &nbsp; **Path**: `/cargo/express-notify`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `expressNo` | string | Yes | shipment number |
| `customerOrderNumber` | string | Yes | shenin order number |
| `operateType` | integer | Yes | Operation type 1 order notification, 2 waybill modification notification, 3 waybill cancellation notification |
| `code` | integer | Yes | Processing result 1 success, -1 failure |
| `errorInfo` | string | No | Error message description |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `info` | object | Yes |
| `traceId` | string | No |

### Response Example

```json
{
    "code": "0",
    "msg": "success",
    "info": null,
    "bbl": null
}
```

---

## Logistics providers push trajectory data-unified interface

> **Official docs**: [Logistics providers push trajectory data-unified interface](https://open.sheincorp.com/documents/apidoc/detail/3000501)

**Method**: `POST` &nbsp; **Path**: `/cargo/track-notify`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `logistics_tracks` | object[] | Yes |  |
| `logistics_no` | string | Yes |  |
| `order_no` | string | Yes |  |
| `current_track` | object | No | You don’t need to upload it. If you don’t upload it, press the tracks to extract the latest one. |
| `location` | string | No |  |
| `content` | string | No |  |
| `date` | string | No |  |
| `track_code` | string | No |  |
| `extend` | object | No |  |
| `tracks` | object[] | Yes |  |
| `location` | string | Yes |  |
| `content` | string | Yes |  |
| `date` | string | Yes | International time format: 2021-06-20T20:35:00+02:00 |
| `track_code` | string | No | Suggestions for support |
| `extend` | object | No | Additional fields need to be placed here |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | Yes |
| `msg` | string | Yes |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "msg": "success"
}
```

---

## Logistics providers push trajectory data-trackingmore

> **Official docs**: [Logistics providers push trajectory data-trackingmore](https://open.sheincorp.com/documents/apidoc/detail/3000502)

**Method**: `POST` &nbsp; **Path**: `/cargo/track-notify-trackingmore`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `code` | integer | No |  |
| `message` | json | No |  |
| `data` | object | Yes |  |
| `tracking_number` | string | No |  |
| `courier_code` | string | No |  |
| `order_number` | string | No |  |
| `delivery_status` | string | No |  |
| `archived` | boolean | No |  |
| `updating` | boolean | No |  |
| `created_at` | string | No |  |
| `update_date` | string | No |  |
| `shipping_date` | json | No |  |
| `customer_name` | json | No |  |
| `customer_email` | string | No |  |
| `customer_phone` | string | No |  |
| `title` | json | No |  |
| `logistics_channel` | string | No |  |
| `note` | json | No |  |
| `destination` | string | No |  |
| `original` | json | No |  |
| `service_code` | json | No |  |
| `weight` | json | No |  |
| `substatus` | string | No |  |
| `status_info` | json | No |  |
| `previously` | json | No |  |
| `destination_track_number` | json | No |  |
| `exchangeNumber` | json | No |  |
| `consignee` | json | No |  |
| `scheduled_delivery_date` | json | No |  |
| `Scheduled_Address` | json | No |  |
| `latest_event` | string | No |  |
| `lastest_checkpoint_time` | string | No |  |
| `transit_time` | integer | No |  |
| `stay_time` | integer | No |  |
| `origin_info` | object | Yes |  |
| `courier_code` | string | No |  |
| `courier_phone` | string | No |  |
| `weblink` | string | No |  |
| `reference_number` | json | No |  |
| `received_date` | string | No |  |
| `dispatched_date` | json | No |  |
| `departed_airport_date` | json | No |  |
| `arrived_abroad_date` | json | No |  |
| `customs_received_date` | json | No |  |
| `arrived_destination_date` | json | No |  |
| `trackinfo` | object[] | Yes |  |
| `checkpoint_date` | string | No |  |
| `tracking_detail` | string | No |  |
| `location` | json | No |  |
| `checkpoint_delivery_status` | string | No |  |
| `checkpoint_delivery_substatus` | string | No |  |
| `destination_info` | object | Yes |  |
| `courier_code` | string | No |  |
| `courier_phone` | json | No |  |
| `weblink` | string | No |  |
| `reference_number` | json | No |  |
| `received_date` | string | No |  |
| `dispatched_date` | json | No |  |
| `departed_airport_date` | json | No |  |
| `arrived_abroad_date` | json | No |  |
| `customs_received_date` | json | No |  |
| `arrived_destination_date` | json | No |  |
| `trackinfo` | object[] | Yes |  |
| `checkpoint_date` | string | No |  |
| `tracking_detail` | string | No |  |
| `location` | json | No |  |
| `checkpoint_delivery_status` | string | No |  |
| `checkpoint_delivery_substatus` | string | No |  |
| `verify` | object | Yes |  |
| `timestamp` | integer | No |  |
| `signature` | string | No |  |
| `usertag` | string | No |  |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | Yes |
| `msg` | string | Yes |
| `traceId` | string | No |

### Response Example

```json
{
    "code": 0,
    "msg": "success"
}
```

---

## Upload evidence of settlement abnormalities

> **Official docs**: [Upload evidence of settlement abnormalities](https://open.sheincorp.com/documents/apidoc/detail/3000503)

**Method**: `POST` &nbsp; **Path**: `/cargo/quote-return`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `operateType` | integer | Yes | Operation type, enum value: 3-Settlement evidence |
| `quoteAttachment` | string[] | No | Attachments, support for returning multiple attachment links (up to a maximum of 10, each attachment size not exceeding 10M) Links correspond to file format restrictions: jpg, jpeg, png, xlsx, xls, pdf, docx, doc, zip, txt |
| `remark` | string | No | Remarks, limited to not exceed 500 characters (at least one of remarks and attachments must be filled) |
| `trackingNumbers` | string[] | Yes | Waybill number |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

---

## Pick-up timeout/cancel shipment reasons feedback

> **Official docs**: [Pick-up timeout/cancel shipment reasons feedback](https://open.sheincorp.com/documents/apidoc/detail/3000504)

**Method**: `POST` &nbsp; **Path**: `/cargo/timeout-cancel-reason-return`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `trackingNumber` | string | Yes | Waybill number |
| `operateType` | integer | Yes | Operation type Enum value: 1-Pick-up timeout, 2-Cancel shipment |
| `operateSource` | integer | No | Operation source Enum value: 1-User operation, 2-Logistics operation Return value only if the operation type is cancel shipment, evaluate based on the role of the operation (there may be operations such as app, mini program, evaluate based on role) |
| `reasonType` | integer | No | Reason type Enum value: 1-User reason, 2-Logistics reason |
| `remark` | string | No | Remark Do not exceed 500 characters |
| `urlList` | string[] | No | Attachments File URL, supports returning multiple attachment links (up to 10 links, each attachment size not exceeding 10M) Format restrictions for corresponding links: jpg, jpeg, png |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | string | No |
| `traceId` | string | No |

---
