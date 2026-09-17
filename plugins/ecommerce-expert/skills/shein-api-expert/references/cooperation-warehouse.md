# SHEIN Open API — Platform Cooperation Warehouse API

Authenticated warehouse operations — logistics waybill upload, outbound order management, and service provider callbacks.

## Table of Contents

- [Upload logistics waybill](#upload-logistics-waybill)
- [Callback outbound order creation result](#callback-outbound-order-creation-result)
- [Void outbound order](#void-outbound-order)
- [Authentication Warehouse Call-Receive Authentication Warehouse Service Provider Warehouse Channel Change Interface](#authentication-warehouse-call-receive-authentication-warehouse-service-provider-warehouse-channel-change-interface)

---

## Upload logistics waybill

> **Official docs**: [Upload logistics waybill](https://open.sheincorp.com/documents/apidoc/detail/3001262)

**Method**: `POST` &nbsp; **Path**: `/order/openapi/auth/order/express-upload`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderGoodsExpressInfos` | object[] | Yes |  |
| `expressCode` | string | Yes | Length 100 |
| `authChannelCode` | string | Yes | Length 100 |
| `authWarehouseCode` | string | Yes | Length 100 |
| `goodsId` | bigint | Yes |  |
| `authExpressName` | string | Yes | Length 100 |
| `isDelete` | integer | Yes |  |
| `sheinWarehouseSerialNo` | string | Yes | Length 100 |
| `billno` | string | Yes | Length 100 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object[] | No |
| `goodsId` | int64 | No |
| `errorMessages` | string[] | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.cn/open-api/order/openapi/auth/order/express-upload' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570681772' \
--header 'uberctx-traffic-mark: iosshus' \
--header 'x-lt-clientCode:TEST' \

--data-raw '{
    "sheinWarehouseSerialNo": "PU25071732969199617",
    "billno": "GSO1C737S000HS8",
    "orderGoodsExpressInfos": [
        {
            "goodsId": "523023111111111",
            "expressCode": "1493538620000000000",
            "authExpressName": "Fedex",
            "customerCode": "YYTEST",
            "authChannelCode": "channel_test",
            "authWarehouseCode": "AAAA",
            "isDelete": 2
        },
        {
            "goodsId": "523023643722222222",
            "expressCode": "1493538620000000000",
            "authExpressName": "Fedex",
            "customerCode": "YYTEST",
            "authChannelCode": "channel_test",
            "authWarehouseCode": "AAAA",
            "isDelete": 2
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

    }
}
```

---

## Callback outbound order creation result

> **Official docs**: [Callback outbound order creation result](https://open.sheincorp.com/documents/apidoc/detail/3001263)

**Method**: `POST` &nbsp; **Path**: `/order/openapi/auth/order/outbound-result`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `failReason` | string | No | Creation failure reason |
| `failReasonCode` | string | No | Failure reason code |
| `sheinWarehouseSerialNo` | string | Yes | Platform batch number, length 100 |
| `outboundOrderNo` | string | No | Outbound order number |
| `result` | integer | Yes | Outbound order creation result: 1-Successful, 2-Failed |
| `billno` | string | No | Order Number |
| `isUnpack` | integer | No | Whether to unpack: 1-Yes, 2-No |
| `outboundOrderResults` | object[] | No | When unpacking is 'Yes', outbound result cannot be empty |
| `outboundOrderNo` | string | No | Outbound order number |
| `goodsIds` | long[] | No | Outbound product collection |
| `authChannelCode` | string | No | Verification warehouse logistics channel code |
| `authWarehouseCode` | string | No | Verification warehouse physical code |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.cn/open-api/order/openapi/auth/order/outbound-result' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570681772' \
--header 'uberctx-traffic-mark: iosshus' \
--header 'x-lt-clientCode:TEST' \

--data-raw '{
    "sheinWarehouseSerialNo": "PU25071111111111",
    "result": 1,
    "failReasonCode": "",
    "failReason": "",
    "outboundOrderNo": "DO250717093111111111",
    "billno": "GSO111111111"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {

    }
}
```

---

## Void outbound order

> **Official docs**: [Void outbound order](https://open.sheincorp.com/documents/apidoc/detail/3001264)

**Method**: `POST` &nbsp; **Path**: `/order/openapi/auth/order/outbound-cancel`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `cancelReason` | integer | Yes | Sender cancellation reasons enumeration 1 Warehouse stock insufficient 2 Incorrect or incomplete buyer address 3 Logistics provider unable to deliver 4 Buyer placed order maliciously 5 Platform forced cancellation, successful verified warehouse in... |
| `sheinWarehouseSerialNo` | string | Yes | Length 100 |
| `outboundOrderNo` | string | Yes | Length 100 |
| `remark` | string | No | Length 512 |
| `billno` | string | Yes | Length 100 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.cn/open-api/order/openapi/auth/order/outbound-cancel' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570681772' \
--header 'uberctx-traffic-mark: iosshus' \
--header 'x-lt-clientCode:TEST' \

--data-raw '{
    "sheinWarehouseSerialNo": "PU25071732961111111",
    "billno": "GSO1C737S111111",
    "outboundOrderNo": "DO25071709303111111",
    "cancelReason": 5,
    "remark": "****"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {

    }
}
```

---

## Authentication Warehouse Call-Receive Authentication Warehouse Service Provider Warehouse Channel Change Interface

> **Official docs**: [Authentication Warehouse Call-Receive Authentication Warehouse Service Provider Warehouse Channel Change Interface](https://open.sheincorp.com/documents/apidoc/detail/3001265)

**Method**: `POST` &nbsp; **Path**: `/lsps-java/auth/entity-change`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `auth_service_code` | string | No | Certified Warehouse Service Provider Code |
| `channel_list` | object | No | Channel List |
| `change_type` | integer | No | Channel change type, 1. Add new 2. Disable |
| `channel_code` | string | No | Channel Code |
| `channel_name` | string | No | Channel Name |
| `channel_ware_code` | string | No | Channel Available Warehouse Code |
| `time` | datetime | No | Update time, year-month-day hour:minute:second format:yyyy-MM-dd HH:mm:ss |
| `type` | integer | No | Type: 1.Warehouse Information 2.Channel Information; if 1, Warehouse list is mandatory, if 2, Channel list is mandatory |
| `warehouse_list` | object | No | Warehouse List |
| `change_type` | integer | No | Warehouse change type, 1. Add new 2. Disable |
| `warehouse_code` | string | No | Physical Warehouse Code |
| `warehouse_name` | string | No | 物理仓库名称 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `msg` | string | No |

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {

    }
}
```

---
