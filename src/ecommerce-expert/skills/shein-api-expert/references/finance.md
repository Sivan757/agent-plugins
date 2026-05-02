# SHEIN Open API — Finance API

Billing lists, sales details, debit/replenishment details, invoice queries, and statement management.

## Table of Contents

- [Billing list](#billing-list)
- [Sales details of the bill](#sales-details-of-the-bill)
- [Debit and  replenishment details of the bill](#debit-and--replenishment-details-of-the-bill)
- [Query the list of invoices](#query-the-list-of-invoices)
- [Query statement list](#query-statement-list)
- [Query statement details](#query-statement-details)

---

## Billing list

> **Official docs**: [Billing list](https://open.sheincorp.com/documents/apidoc/detail/3001626)

**Method**: `POST` &nbsp; **Path**: `/finance/report-list`

**Applicable to**: Fully-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `addTimeEnd` | datetime | No | Expense report generation time end value (Beijing time); format: yyyy-MM-dd HH:mm:ss (Either expense report generation time or last update time is required, up to 7 days data can be queried at a time) |
| `addTimeStart` | datetime | No | Expense report generation time start value (Beijing time); format: yyyy-MM-dd HH:mm:ss (Either expense report generation time or last update time is required, up to 7 days data can be queried at a time) |
| `lastUpdateTimeEnd` | datetime | No | Last update time end value (Beijing time); Format: yyyy-MM-dd HH:mm:ss (Either expense report generation time or last update time is mandatory, maximum 7 days of data can be queried at once) |
| `lastUpdateTimeStart` | datetime | No | Last updated time start value (Beijing time); format: yyyy-MM-dd HH:mm:ss (either invoice generation time or last updated time is mandatory, up to 7 days of data can be queried at a time) |
| `page` | integer | Yes | page number |
| `perPage` | integer | Yes | Page Size, Maximum 200 |
| `settlementStatuses` | integer[] | No | Settlement status; 1: Pending confirmation/ 2: Pending settlement/ 3: Settled/ Default query all if not passed |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `count` | integer | Yes |
| `reportOrderInfos` | object[] | No |
| `addTime` | datetime | Yes |
| `companyName` | string | Yes |
| `completedPayTime` | datetime | No |
| `currencyCode` | string | Yes |
| `estimateIncomeMoneyTotal` | double | Yes |
| `estimatePayTime` | datetime | Yes |
| `expenseType` | integer | Yes |
| `lastUpdateTime` | datetime | Yes |
| `replenishTotal` | int64 | No |
| `reportOrderNo` | string | Yes |
| `salesTotal` | int64 | No |
| `settlementStatus` | integer | Yes |
| `settlementStatusName` | string | Yes |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/finance/report-list' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1752808873480' \
--header 'x-lt-signature: test' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
 "addTimeEnd": "2024-12-24 10:29:59",
 "addTimeStart":"2024-12-17 10:29:59",
 "page": 1,
 "perPage": 100
}'
```

### Response Example

```json
{
 "code": "0",
 "msg": "OK",
 "info": {
 "reportOrderInfos": [
 {
 "reportOrderNo": "B2412164523430915",
 "salesTotal": 0,
 "replenishTotal": 3,
 "addTime": "2024-12-17 19:46:38",
 "lastUpdateTime": "2024-12-17 19:47:12",
 "settlementStatus": 2,
 "settlementStatusName": "Pending settlement",
 "estimatePayTime": "2025-01-16 00:00:00",
 "completedPayTime": "",
 "companyName": "那就",
 "estimateIncomeMoneyTotal": 17.38,
 "currencyCode": "EUR"
 },
 {
 "reportOrderNo": "B2412164532016130",
 "salesTotal": 3,
 "replenishTotal": 0,
 "addTime": "2024-12-17 19:46:38",
 "lastUpdateTime": "2024-12-17 19:47:12",
 "settlementStatus": 2,
 "settlementStatusName": "Pending settlement",
 "estimatePayTime": "2025-01-16 00:00:00",
 "completedPayTime": "",
 "companyName": "TEST 公司",
 "estimateIncomeMoneyTotal": 43.8,
 "currencyCode": "CNY"
 },
 {
 "reportOrderNo": "B2412173138066433",
 "salesTotal": 1,
 "replenishTotal": 1,
 "addTime": "2024-12-17 19:46:38",
 "lastUpdateTime": "2024-12-17 19:48:03",
 "settlementStatus": 2,
 "settlementStatusName": "Pending settlement",
 "estimatePayTime": "2024-12-14 17:00:00",
 "completedPayTime": "",
 "companyName": "INFINITE STYLES SERVICES CO., LIMITED ",
 "estimateIncomeMoneyTotal": 781.54,
 "currencyCode": "CNY"
 },
 {
 "reportOrderNo": "B2412174644020226",
 "salesTotal": 1,
 "replenishTotal": 0,
 "addTime": "2024-12-17 19:46:38",
 "lastUpdateTime": "2024-12-17 19:48:04",
 "settlementStatus": 2,
 "settlementStatusName": "Pending settlement",
 "estimatePayTime": "2024-12-14 17:00:00",
 "completedPayTime": "",
 "companyName": "INFINITE STYLES SERVICES CO., LIMITED ",
 "estimateIncomeMoneyTotal": 43.8,
 "currencyCode": "CNY"
 },
 {
 "reportOrderNo": "B2412174651163650",
 "salesTotal": 1,
 "replenishTotal": 0,
 "addTime": "2024-12-17 19:46:38",
 "lastUpdateTime": "2024-12-17 19:48:04",
 "settlementStatus": 2,
 "settlementStatusName": "Pending settlement",
 "estimatePayTime": "2024-12-14 17:00:00",
 "completedPayTime": "",
 "companyName": "INFINITE STYLES SERVICES CO., LIMITED ",
 "estimateIncomeMoneyTotal": 43.8,
 "currencyCode": "CNY"
 },
 {
 "reportOrderNo": "B2412190026229760",
 "salesTotal": 0,
 "replenishTotal": 0,
 "addTime": "2024-12-19 00:06:40",
 "lastUpdateTime": "2024-12-25 14:13:41",
 "settlementStatus": 1,
 "settlementStatusName": "to be confirmed",
 "estimatePayTime": "2025-01-11 00:00:00",
 "completedPayTime": "",
 "companyName": "ROADGET BUSINESS PTE. LTD.",
 "estimateIncomeMoneyTotal": 94.56,
 "currencyCode": "USD"
 },
 {
 "reportOrderNo": "B2412190064568322",
 "salesTotal": 2,
 "replenishTotal": 0,
 "addTime": "2024-12-19 00:16:26",
 "lastUpdateTime": "2024-12-25 15:32:44",
 "settlementStatus": 1,
 "settlementStatusName": "to be confirmed",
 "estimatePayTime": "2025-01-11 00:00:00",
 "completedPayTime": "2025-12-19 00:16:25",
 "companyName": "ROADGET BUSINESS PTE. LTD.",
 "estimateIncomeMoneyTotal": 9.56,
 "currencyCode": "USD"
 },
 {
 "reportOrderNo": "B2412174812054529",
 "salesTotal": 2,
 "replenishTotal": 2,
 "addTime": "2024-12-19 14:02:49",
 "lastUpdateTime": "2024-12-25 15:19:57",
 "settlementStatus": 1,
 "settlementStatusName": "to be confirmed",
 "estimatePayTime": "2025-01-17 00:00:00",
 "completedPayTime": "2026-01-17 00:00:00",
 "companyName": "INFINITE STYLES SERVICES CO., LIMITED ",
 "estimateIncomeMoneyTotal": 82.04,
 "currencyCode": "USD"
 },
 {
 "reportOrderNo": "B2412183921686531",
 "salesTotal": 2,
 "replenishTotal": 2,
 "addTime": "2024-12-19 14:02:50",
 "lastUpdateTime": "2024-12-19 14:02:49",
 "settlementStatus": 1,
 "settlementStatusName": "to be confirmed",
 "estimatePayTime": "2025-01-16 00:00:00",
 "completedPayTime": "",
 "companyName": "INFINITE STYLES SERVICES CO., LIMITED ",
 "estimateIncomeMoneyTotal": 84.04,
 "currencyCode": "CNY"
 },
 {
 "reportOrderNo": "B2412185000214529",
 "salesTotal": 0,
 "replenishTotal": 0,
 "addTime": "2024-12-19 14:02:50",
 "lastUpdateTime": "2024-12-19 14:02:49",
 "settlementStatus": 1,
 "settlementStatusName": "to be confirmed",
 "estimatePayTime": "2025-01-16 00:00:00",
 "completedPayTime": "",
 "companyName": "INFINITE STYLES SERVICES CO., LIMITED ",
 "estimateIncomeMoneyTotal": 175.2,
 "currencyCode": "CNY"
 },
 {
 "reportOrderNo": "B2412192918793218",
 "salesTotal": 4,
 "replenishTotal": 4,
 "addTime": "2024-12-19 14:02:50",
 "lastUpdateTime": "2024-12-19 14:02:49",
 "settlementStatus": 1,
 "settlementStatusName": "to be confirmed",
 "estimatePayTime": "2025-01-16 00:00:00",
 "completedPayTime": "",
 "companyName": "那就75",
 "estimateIncomeMoneyTotal": 174.36,
 "currencyCode": "CNY"
 },
 {
 "reportOrderNo": "B2412193369681921",
 "salesTotal": 0,
 "replenishTotal": 2,
 "addTime": "2024-12-19 14:20:31",
 "lastUpdateTime": "2024-12-19 14:20:30",
 "settlementStatus": 1,
 "settlementStatusName": "to be confirmed",
 "estimatePayTime": "2025-01-16 00:00:00",
 "completedPayTime": "",
 "companyName": "TEST 公司",
 "estimateIncomeMoneyTotal": 205.05,
 "currencyCode": "CNY"
 },
 {
 "reportOrderNo": "B2403210004",
 "salesTotal": 1,
 "replenishTotal": 0,
 "addTime": "2024-12-19 14:51:03",
 "lastUpdateTime": "2024-12-23 17:29:08",
 "settlementStatus": 2,
 "settlementStatusName": "Pending settlement",
 "estimatePayTime": "2025-01-16 00:00:00",
 "completedPayTime": "",
 "companyName": "TEST 公司",
 "estimateIncomeMoneyTotal": 43.8,
 "currencyCode": ""
 },
 {
 "reportOrderNo": "B2412190180567041",
 "salesTotal": 1,
 "replenishTotal": 1,
 "addTime": "2024-12-19 14:51:03",
 "lastUpdateTime": "2024-12-23 17:28:45",
 "settlementStatus": 2,
 "settlementStatusName": "Pending settlement",
 "estimatePayTime": "2025-01-16 00:00:00",
 "completedPayTime": "",
 "companyName": "INFINITE STYLES SERVICES CO., LIMITED ",
 "estimateIncomeMoneyTotal": 43.02,
 "currencyCode": "CNY"
 },
 {
 "reportOrderNo": "B2412210147608576",
 "salesTotal": 3,
 "replenishTotal": 2,
 "addTime": "2024-12-21 00:37:32",
 "lastUpdateTime": "2024-12-23 17:27:21",
 "settlementStatus": 2,
 "settlementStatusName": "Pending settlement",
 "estimatePayTime": "2025-01-03 00:00:00",
 "completedPayTime": "",
 "companyName": "ROADGET BUSINESS PTE. LTD.",
 "estimateIncomeMoneyTotal": 156.8,
 "currencyCode": "USD"
 }
 ],
 "count": 15
 },
 "bbl": {},
 "traceId": "ba8e56514963c35e"
}
```

---

## Sales details of the bill

> **Official docs**: [Sales details of the bill](https://open.sheincorp.com/documents/apidoc/detail/3001674)

**Method**: `POST` &nbsp; **Path**: `/finance/report-sales-detail`

**Applicable to**: Fully-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | No | value for next page query |
| `perPage` | integer | Yes | Page Size, Maximum 200 |
| `reportOrderNo` | string | Yes | expense invoice number |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `count` | integer | Yes |
| `query` | string | No |
| `reportSalesDetails` | object | No |
| `addTime` | datetime | Yes |
| `amount` | double | Yes |
| `bzOrderNo` | string | Yes |
| `companyName` | string | Yes |
| `expenseType` | integer | Yes |
| `goodsCount` | integer | Yes |
| `id` | string | Yes |
| `inAndOut` | integer | Yes |
| `inAndOutName` | string | Yes |
| `secondOrderType` | integer | Yes |
| `secondOrderTypeName` | string | Yes |
| `settleCurrencyCode` | string | Yes |
| `skcName` | string | No |
| `skuCode` | string | No |
| `supplierSku` | string | No |
| `unitPrice` | double | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/finance/report-sales-detail' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1752818455708' \
--header 'x-lt-signature: test' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
 "query": "OS2407093385925633",
 "perPage": "2",
 "reportOrderNo":"B2412210147608576"
}'
```

### Response Example

```json
{
 "code": "0",
 "msg": "OK",
 "info": {
 "reportSalesDetails": [
 {
 "secondOrderType": 11,
 "secondOrderTypeName": "Guangzhou offline procurement and warehousing",
 "inAndOut": 1,
 "inAndOutName": "income",
 "bzOrderNo": "666861111112557",
 "id": "OS2411205174902784",
 "skcName": "s23030915354544",
 "skuCode": "I0cknhftflu1",
 "goodsCount": 4,
 "settleCurrencyCode": "USD",
 "amount": 47.28,
 "companyName": "ROADGET BUSINESS PTE. LTD.",
 "addTime": "2024-11-20 21:56:03",
 "unitPrice": 11.82
 },
 {
 "secondOrderType": 11,
 "secondOrderTypeName": "Guangzhou offline procurement and warehousing",
 "inAndOut": 1,
 "inAndOutName": "income",
 "bzOrderNo": "186243033161908",
 "id": "OS2412164097933315",
 "skcName": "s23030915354544",
 "skuCode": "I0cknhftflu1",
 "goodsCount": 4,
 "settleCurrencyCode": "USD",
 "amount": 47.28,
 "companyName": "ROADGET BUSINESS PTE. LTD.",
 "addTime": "2024-12-16 17:22:10",
 "unitPrice": 11.82
 }
 ],
 "count": 3,
 "query": null
 },
 "bbl": {},
 "traceId": "270b714cf9d20130"
}
```

---

## Debit and  replenishment details of the bill

> **Official docs**: [Debit and  replenishment details of the bill](https://open.sheincorp.com/documents/apidoc/detail/3001628)

**Method**: `POST` &nbsp; **Path**: `/finance/report-adjustment-detail`

**Applicable to**: Fully-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | No | value for next page query |
| `perPage` | integer | Yes | Page Size, Maximum 200 |
| `reportOrderNo` | string | Yes | expense invoice number |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `count` | integer | Yes |
| `query` | string | No |
| `reportReplenishDetail` | object[] | No |
| `addTime` | datetime | Yes |
| `amount` | double | Yes |
| `bzOrderNo` | string | No |
| `companyName` | string | Yes |
| `expenseType` | integer | Yes |
| `goodsCount` | integer | Yes |
| `id` | string | Yes |
| `replenishCategory` | string | Yes |
| `replenishNo` | string | Yes |
| `replenishType` | integer | Yes |
| `replenishTypeName` | string | Yes |
| `settleCurrencyCode` | string | Yes |
| `skcName` | string | No |
| `skuCode` | string | No |
| `supplierSku` | string | No |
| `unitPrice` | double | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/finance/report-adjustment-detail' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1752818871649' \
--header 'x-lt-signature: test' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
 "perPage": "3",
 "reportOrderNo":"B2412210147608576"
}'
```

### Response Example

```json
{
 "code": "0",
 "msg": "OK",
 "info": {
 "reportReplenishDetail": [
 {
 "replenishNo": "K2411213727879170",
 "replenishType": 1,
 "replenishTypeName": "chargeback",
 "replenishCategory": "Purchasing quality-Customer refund deduction",
 "id": "OF2411213727837185",
 "bzOrderNo": "B240507500057",
 "unitPrice": 7.02,
 "skcName": "s23030915354544",
 "skuCode": null,
 "goodsCount": 1,
 "settleCurrencyCode": "USD",
 "amount": 7.02,
 "companyName": "ROADGET BUSINESS PTE. LTD.",
 "addTime": "2024-11-21 15:48:02"
 },
 {
 "replenishNo": "K2412210112483330",
 "replenishType": 2,
 "replenishTypeName": "Replenishment",
 "replenishCategory": "purchase supplement-Shipping and miscellaneous expenses supplement",
 "id": "OF2412210112467971",
 "bzOrderNo": "B240507500057",
 "unitPrice": 10.99,
 "skcName": "s23030915354544",
 "skuCode": null,
 "goodsCount": 2,
 "settleCurrencyCode": "USD",
 "amount": 21.98,
 "companyName": "ROADGET BUSINESS PTE. LTD.",
 "addTime": "2024-12-21 00:28:37"
 }
 ],
 "count": 2,
 "query": null
 },
 "bbl": {},
 "traceId": "1259ed66a0aa6baa"
}
```

---

## Query the list of invoices

> **Official docs**: [Query the list of invoices](https://open.sheincorp.com/documents/apidoc/detail/3001625)

**Method**: `POST` &nbsp; **Path**: `/finance/report-order-list`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `page` | integer | Yes | Current page |
| `pageSize` | integer | Yes | Number of records per page |
| `reportOrderNo` | string | No | Invoice number |
| `reportStatus` | integer | No | Invoice status: 1 - Payment imminent, 2 - Payment completed, 3 - Payment error |
| `completedPayDate` | string | No | Payment week, format: yyyy-MM-dd, enter any day of the week (this will override the payment completion time). |
| `completedPayTimeStart` | string | No | Payment completion time, format: yyyy-MM-ddHH:mm:ss |
| `completedPayTimeEnd` | string | No | 打款完成开始时间，格式：yyyy-MM-ddHH:mm:ss |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | Yes |
| `count` | integer | No |
| `list` | object[] | Yes |
| `reportOrderNo` | string | Yes |
| `reportStatus` | integer | No |
| `completedPayTime` | string | No |
| `income` | integer | Yes |
| `currencyCode` | string | Yes |
| `paymentMethod` | integer | No |
| `rxAcct` | string | Yes |

---

## Query statement list

> **Official docs**: [Query statement list](https://open.sheincorp.com/documents/apidoc/detail/3001631)

**Method**: `POST` &nbsp; **Path**: `/finance/get-check-order-list`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `bzOrderNos` | string[] | No | Business order number, generally refers to the order number, supports querying up to 100 at a time |
| `checkStatus` | integer | No | Reconciliation statement status:1-Pending settlement, 2-In settlement, 3-Settled, 4-Settlement exception |
| `endAddTime` | datetime | Yes | Query by reconciliation statement generation time, end time of query period, format: yyyy-MM-dd HH:mm:ss |
| `endEstimatePayTime` | datetime | No | Estimated payment date end time, format: yyyy-MM-dd HH:mm:ss |
| `extendOrderNos` | string[] | No | Other business order numbers, such as return orders, penalty orders, supports querying up to 100 at a time |
| `page` | integer | Yes | Current page |
| `pageSize` | integer | Yes | Records per page, up to 30 entries |
| `reportOrderNos` | string | No | List of billing numbers (maximum 100) |
| `secondOrderTypes` | integer[] | No | Secondary bill type, click to view specific enumeration values FAQ |
| `startAddTime` | datetime | Yes | Query by reconciliation statement generation time, start time of query period, format: yyyy-MM-dd HH:mm:ss |
| `startEstimatePayTime` | datetime | No | Estimated payment date start time, format: yyyy-MM-dd HH:mm:ss |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `count` | int64 | No |
| `list` | object[] | No |
| `businessCompletedTime` | datetime | Yes |
| `bzOrderNo` | string | Yes |
| `checkOrderNo` | string | Yes |
| `checkStatus` | integer | Yes |
| `completedPayTime` | datetime | No |
| `currencyCode` | string | Yes |
| `estimateIncomeMoneyTotal` | double | No |
| `estimatePayTime` | datetime | No |
| `incomeExpenditureType` | integer | Yes |
| `reportOrderNo` | string | Yes |
| `secondOrderType` | integer | Yes |
| `site` | string | Yes |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/finance/get-check-order-list' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1752819433511' \
--header 'x-lt-signature: test' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
    "page":1,
    "pageSize":30,
    "startAddTime":"2024-11-11 00:00:00",
    "endAddTime":"2024-11-15 00:00:00",
    "checkStatus":1,
    "bzOrderNos":["GSONP109T00000X"],
    "secondOrderTypes":[1,2,3]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "count": 1,
        "list": [
            {
                "checkOrderNo": "B241114524652546",
                "checkStatus": 1,
                "secondOrderType": 1,
                "incomeExpenditureType": 1,
                "bzOrderNo": "GSONP109T00000X",
                "businessCompletedTime": "2024-11-14 17:47:21",
                "completedPayTime": "",
                "site": "shein-us",
                "currencyCode": "USD",
                "estimateIncomeMoneyTotal": 44.48,
                "reportOrderNo": null,
                "estimatePayTime": "2025-05-19 10:23:58"
            }
        ]
    },
    "bbl": {},
    "traceId": "b4ccfaeb2ffbae42"
}
```

---

## Query statement details

> **Official docs**: [Query statement details](https://open.sheincorp.com/documents/apidoc/detail/3001621)

**Method**: `GET` &nbsp; **Path**: `/finance/get-check-order-detail`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `checkOrderNo` | string | Yes | Reconciliation statement number, can be obtained through the reconciliation statement list API. |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | No |
| `info` | object | No |
| `businessCompletedTime` | datetime | Yes |
| `bzOrderNo` | string | Yes |
| `checkOrderNo` | string | Yes |
| `checkStatus` | integer | Yes |
| `completedPayTime` | datetime | No |
| `currencyCode` | string | Yes |
| `estimateIncomeMoneyTotal` | double | No |
| `estimatePayTime` | datetime | No |
| `incomeExpenditureType` | integer | Yes |
| `itemList` | object[] | No |
| `commissionAmount` | double | No |
| `commissionRate` | double | No |
| `commissionSaleTax` | double | No |
| `costPrice` | double | No |
| `couponAmount` | double | No |
| `incomeAmount` | double | No |
| `performanceCost` | double | No |
| `refundRatio` | string | No |
| `returnExpense` | double | No |
| `returnFreightSubsidy` | double | No |
| `sellerCurrencyPrice` | double | No |
| `sellerCurrencyPromotionPrice` | double | No |
| `sellerRealTax` | double | No |
| `serviceFee` | double | No |
| `settleCurrencyPromotionPrice` | double | No |
| `skuCode` | string | No |
| `stockExpense` | double | No |
| `subjectAmountList` | object[] | No |
| `subjectCode` | string | No |
| `subjectPrice` | double | No |
| `subjectType` | string | No |
| `subsidyTotalAmount` | double | No |
| `whtTotalAmount` | double | No |
| `reportOrderNo` | string | Yes |
| `secondOrderType` | integer | Yes |
| `site` | string | Yes |
| `originalOrderNo` | string | No |
| `showGnreTaxAmount` | double | No |
| `showPerformanceCost` | double | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.com/open-api/finance/get-check-order-list?checkOrderNo=B241114524652546' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1752829588092' \
--header 'x-lt-signature: test' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "checkOrderNo": "B241114524652546",
        "checkStatus": 1,
        "secondOrderType": 1,
        "incomeExpenditureType": 1,
        "bzOrderNo": "GSONP109T00000X1",
        "businessCompletedTime": "2024-11-14 17:47:21",
        "completedPayTime": "",
        "site": "shein-us",
        "currencyCode": "USD",
        "estimateIncomeMoneyTotal": 44.48,
        "reportOrderNo": null,
        "estimatePayTime": "2025-05-19 10:23:58",
        "itemList": [
            {
                "skuCode": "I32gzqxvt3ez",
                "sellerCurrencyPrice": 12.98,
                "costPrice": 0.0,
                "couponAmount": 0.0,
                "settleCurrencyPromotionPrice": 0.0,
                "sellerCurrencyPromotionPrice": 0.0,
                "sellerRealTax": 1.86,
                "commissionSaleTax": 0.0,
                "whtTotalAmount": 0.0,
                "subjectAmountList": [],
                "subsidyTotalAmount": 0.0,
                "commissionRate": 0.0,
                "commissionAmount": 0.0,
                "performanceCost": 0.0,
                "stockExpense": 0.0,
                "returnExpense": 0.0,
                "returnFreightSubsidy": 0.0,
                "serviceFee": 0.0,
                "refundRatio": "0.00",
                "incomeAmount": 11.12
            },
            {
                "skuCode": "I37n4oz29ihf",
                "sellerCurrencyPrice": 12.98,
                "costPrice": 0.0,
                "couponAmount": 0.0,
                "settleCurrencyPromotionPrice": 0.0,
                "sellerCurrencyPromotionPrice": 0.0,
                "sellerRealTax": 1.86,
                "commissionSaleTax": 0.0,
                "whtTotalAmount": 0.0,
                "subjectAmountList": [],
                "subsidyTotalAmount": 0.0,
                "commissionRate": 0.0,
                "commissionAmount": 0.0,
                "performanceCost": 0.0,
                "stockExpense": 0.0,
                "returnExpense": 0.0,
                "returnFreightSubsidy": 0.0,
                "serviceFee": 0.0,
                "refundRatio": "0.00",
                "incomeAmount": 11.12
            },
            {
                "skuCode": "I32gzqxvt3ez",
                "sellerCurrencyPrice": 12.98,
                "costPrice": 0.0,
                "couponAmount": 0.0,
                "settleCurrencyPromotionPrice": 0.0,
                "sellerCurrencyPromotionPrice": 0.0,
                "sellerRealTax": 1.86,
                "commissionSaleTax": 0.0,
                "whtTotalAmount": 0.0,
                "subjectAmountList": [],
                "subsidyTotalAmount": 0.0,
                "commissionRate": 0.0,
                "commissionAmount": 0.0,
                "performanceCost": 0.0,
                "stockExpense": 0.0,
                "returnExpense": 0.0,
                "returnFreightSubsidy": 0.0,
                "serviceFee": 0.0,
                "refundRatio": "0.00",
                "incomeAmount": 11.12
            },
            {
                "skuCode": "I37n4oz29ihf",
                "sellerCurrencyPrice": 12.98,
                "costPrice": 0.0,
                "couponAmount": 0.0,
                "settleCurrencyPromotionPrice": 0.0,
                "sellerCurrencyPromotionPrice": 0.0,
                "sellerRealTax": 1.86,
                "commissionSaleTax": 0.0,
                "whtTotalAmount": 0.0,
                "subjectAmountList": [],
                "subsidyTotalAmount": 0.0,
                "commissionRate": 0.0,
                "commissionAmount": 0.0,
                "performanceCost": 0.0,
                "stockExpense": 0.0,
                "returnExpense": 0.0,
                "returnFreightSubsidy": 0.0,
                "serviceFee": 0.0,
                "refundRatio": "0.00",
                "incomeAmount": 11.12
            }
        ]
    },
    "bbl": {},
    "traceId": "ddd6ff84084802df"
}
```

---
