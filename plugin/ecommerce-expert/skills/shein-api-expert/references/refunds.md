# SHEIN Open API — Refunds API

Return order listing, return order details, and return order receiving.

## Table of Contents

- [Query return order list](#query-return-order-list)
- [Query return order details](#query-return-order-details)
- [Receive return order](#receive-return-order)

---

## Query return order list

> **Official docs**: [Query return order list](https://open.sheincorp.com/documents/apidoc/detail/3001281)

**Method**: `POST` &nbsp; **Path**: `/return-order/list`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `queryType` | integer | Yes | Time query dimension type: 1: Time when the return order is issued to the merchant/ 2: Time when the buyer applies for a return/ 3: Return order update time |
| `startTime` | string | Yes | yyyy-MM-dd HH:mm:ss defaults to query data within 48 hours |
| `endTime` | string | Yes | yyyy-MM-dd HH:mm:ss defaults to query data within 48 hours |
| `page` | integer | Yes | Request page number |
| `pageSize` | integer | Yes | limit【1,30】 |
| `returnOrderStatus` | integer | No | 1: Closed/ 2: Applied/ 3: Cancelled/ 5: Received/ 6: Delivered/ 7: Pending handover/ 8: Pending SHEIN warehouse transfer/ 9: Completed |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `traceId` | string | No |
| `info` | object | Yes |
| `count` | integer | No |
| `returnOrderList` | object[] | Yes |
| `returnOrderNo` | string | No |
| `returnOrderStatus` | integer | No |
| `addTime` | string | No |
| `requestReturnTime` | string | No |
| `updateTime` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/return-order/list' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570817402' \
--data-raw '{
    "queryType": 1,
    "startTime": "2024-05-23 00:00:00",
    "endTime": "2024-05-24 23:59:40",
    "page": 1,
    "pageSize": 10,
    "returnOrderStatus": 5
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "count": 1,
        "returnOrderList": [
            {
                "returnOrderNo": "NGGQM0NLE1",
                "returnOrderStatus": 5,
                "addTime": "2024-05-23 10:49:36",
                "requestReturnTime": "2024-05-23 10:49:23",
                "updateTime": "2024-05-23 10:49:37"
            }
        ]
    },
    "bbl": {}
}
```

---

## Query return order details

> **Official docs**: [Query return order details](https://open.sheincorp.com/documents/apidoc/detail/3001282)

**Method**: `POST` &nbsp; **Path**: `/return-order/details`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `returnOrderNoList` | string[] | Yes | Up to 30 items |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `traceId` | string | No |
| `info` | object[] | Yes |
| `returnOrderNo` | string | No |
| `returnOrderStatus` | integer | No |
| `noReturnGoodsSign` | integer | No |
| `returnOrderTagCode` | integer | No |
| `orderNo` | string | No |
| `site` | string | No |
| `shippingCode` | string | No |
| `platformExpressNo` | string | No |
| `memberExpressNo` | string | No |
| `expressCompanyName` | string | No |
| `refundOrderNos` | string[] | Yes |
| `refundWaybill` | json | No |
| `refundExpressCompanyName` | string | No |
| `performanceCost` | integer | No |
| `invoiceStatus` | integer | No |
| `requestReturnTime` | string | No |
| `allocateTime` | string | No |
| `lastUpdateTime` | string | No |
| `sellerSignedTime` | string | No |
| `cancelTime` | string | No |
| `completedTime` | string | No |
| `checkStatus` | integer | No |
| `stockMode` | integer | No |
| `receiveType` | integer | No |
| `returnGoodsInfoList` | object[] | Yes |
| `goodsId` | bigint | No |
| `sku` | string | No |
| `skc` | string | No |
| `goodsSn` | string | No |
| `skuSn` | string | No |
| `commodityAttributeList` | object[] | Yes |
| `attrValueId` | string | No |
| `attrName` | string | No |
| `language` | string | No |
| `goodsTitle` | string | No |
| `imageUrl` | string | No |
| `goodsStatus` | integer | No |
| `returnImageList` | object[] | Yes |
| `type` | integer | No |
| `link` | string | No |
| `currency` | string | No |
| `saleCurrency` | string | No |
| `sellerCurrencyPrice` | decimal | No |
| `costPrice` | decimal | No |
| `settleCurrencyPromotionPrice` | decimal | No |
| `sellerCurrencyStoreCouponPrice` | decimal | No |
| `sellerCurrencyPromotionPrice` | decimal | No |
| `estimateCommission` | decimal | No |
| `commissionSaleTax` | decimal | No |
| `performancePrice` | decimal | No |
| `returnExpense` | decimal | No |
| `sellerRealTax` | decimal | No |
| `estimateIncomeMoney` | decimal | No |
| `estimateTaxIncomeMoney` | decimal | No |
| `returnReasonList` | object[] | Yes |
| `language` | string | No |
| `reason` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/return-order/details' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570817402' \
--data-raw '{
  "returnOrderNoList": [
    "NPVYE07KE2"
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
      "returnOrderNo": "NPVYE07KE2",
      "returnOrderStatus": 6,
      "noReturnGoodsSign": 0,
      "returnOrderTagCode": null,
      "orderNo": "GSONPS56A004WJ8",
      "site": "shein-es",
      "shippingCode": "",
      "platformExpressNo": "PQ7LEW0400154360117460Q",
      "memberExpressNo": "",
      "expressCompanyName": "Return with Post Office label",
      "refundOrderNos": [],
      "refundWaybill": "",
      "refundExpressCompanyName": "",
      "performanceCost": 0,
      "invoiceStatus": 1,
      "requestReturnTime": "2024-12-10 15:42:01",
      "allocateTime": "2024-12-10 15:42:03",
      "lastUpdateTime": "2024-12-12 21:52:29",
      "sellerSignedTime": "",
      "cancelTime": "",
      "completedTime": "",
      "checkStatus": 2,
      "stockMode": 3,
      "receiveType": 0,
      "returnGoodsInfoList": [
        {
          "goodsId": 837115739,
          "sku": "I43cll4jk2za",
          "skc": "sl2410020038321928",
          "goodsSn": "4008789710079",
          "currency": "EUR",
          "saleCurrency": null,
          "skuSn": "17009016",
          "commodityAttributeList": [
            {
              "attrValueId": "447,474",
              "attrName": "多色-均码",
              "language": "CN"
            },
            {
              "attrValueId": "447,474",
              "attrName": "Multicolor-one-size",
              "language": "US"
            },
            {
              "attrValueId": "447,474",
              "attrName": "Multicolorido-Tamanho Único",
              "language": "PT"
            },
            {
              "attrValueId": "447,474",
              "attrName": "มัลติคัลเลอร์-ไซส์เดียว",
              "language": "TH"
            },
            {
              "attrValueId": "447,474",
              "attrName": "Multicolor-Unitalla",
              "language": "ES"
            },
            {
              "attrValueId": "447,474",
              "attrName": "Multicolore-Tagli Unica",
              "language": "IT"
            }
          ],
          "goodsTitle": "Playmobil Centro De Cuidados De Animales - Entrega en 24/48h (Península)",
          "imageUrl": "https://img.ltwebstatic.com/images3_spmp/2024/10/02/cc/17278484841dfa54bb4f8f1f062973439b4bf39737_square_thumbnail_220x293.jpg",
          "goodsStatus": 6,
          "returnImageList": [
            {
              "type": 1,
              "link": ""
            }
          ],
          "sellerCurrencyPrice": 115.99,
          "costPrice": null,
          "sellerCurrencyStoreCouponPrice": 0,
          "sellerCurrencyPromotionPrice": 0,
          "settleCurrencyPromotionPrice": null,
          "estimateCommission": 9.28,
          "commissionSaleTax": 0,
          "performancePrice": 0,
          "returnExpense": 0,
          "sellerRealTax": 0,
          "estimateIncomeMoney": 106.71,
          "estimateTaxIncomeMoney": 106.71,
          "returnReasonList": [
            {
              "language": "CN",
              "reason": "我不喜歡，不想要了。"
            },
            {
              "language": "EN",
              "reason": "Don't like so I don't want it"
            },
            {
              "language": "PT",
              "reason": "Eu não gosto disso, e não quero isso."
            },
            {
              "language": "TH",
              "reason": "ฉันไม่ชอบมัน ฉันไม่ต้องการมันแล้ว"
            },
            {
              "language": "ES",
              "reason": "No me gusta, no lo quiero."
            }
          ]
        }
      ]
    }
  ],
  "bbl": {},
  "traceId": "87cd406a2d5d4961"
}
```

---

## Receive return order

> **Official docs**: [Receive return order](https://open.sheincorp.com/documents/apidoc/detail/3001283)

**Method**: `POST` &nbsp; **Path**: `/return-order/sign-return-order`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `returnOrderNo` | string | Yes | Return order number |
| `goodsIdList` | integer[] | Yes | List of signed returned product Ids |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `traceId` | string | No |
| `info` | object | Yes |
| `returnOrderNo` | string | No |
| `goodsIdList` | long[] | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/return-order/sign-return-order' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570817402' \
--data-raw '{
"returnOrderNo": "NRMFM000MT",
"goodsIdList": [4277386877782017]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "returnOrderNo": "NRMFM000MT",
        "goodsIdList": [
            4277386877782017
        ]
    }
}
```

---
