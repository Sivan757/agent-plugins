# SHEIN Open API — Store API

Store information queries and announcement management.

## Table of Contents

- [Query store information](#query-store-information)
- [Query announcement list](#query-announcement-list)
- [Get announcement details](#get-announcement-details)

---

## Query store information

> **Official docs**: [Query store information](https://open.sheincorp.com/documents/apidoc/detail/3001499)

**Method**: `POST` &nbsp; **Path**: `/openapi-business-backend/query-store-info`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

_No additional request parameters._

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `storeInfo` | object | No |
| `storeName` | string | No |
| `storeStatus` | integer | No |
| `supplierId` | int64 | No |
| `supplierBusinessMode` | string | No |
| `storeProductQuota` | object | No |
| `availableLimit` | integer | No |
| `totalLimit` | integer | No |
| `usedQuota` | integer | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/openapi-business-backend/query-store-info' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "storeProductQuota": {
            "totalLimit": 9999,
            "availableLimit": 9999,
            "usedQuota": 0
        },
        "storeInfo": {
            "supplierId": 21871704,
            "storeName": null,
            "storeStatus": null
        }
    },
    "traceId": "a5ba1bf917495ab9"
}
```

---

## Query announcement list

> **Official docs**: [Query announcement list](https://open.sheincorp.com/documents/apidoc/detail/3001144)

**Method**: `POST` &nbsp; **Path**: `/ssls/announcement/get-anno-list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pageNumber` | integer | No | Page number |
| `pageSize` | integer | No | Number of items returned per page; Please set an integer between 1 and 30 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `successList` | object | No |
| `data` | object[] | No |
| `announcementId` | string | No |
| `meta` | object | No |
| `count` | integer | No |
| `customObj` | object | No |
| `msg` | string | No |

---

## Get announcement details

> **Official docs**: [Get announcement details](https://open.sheincorp.com/documents/apidoc/detail/3001145)

**Method**: `POST` &nbsp; **Path**: `/ssls/announcement/get-anno-detail`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `announcementId` | int64 | No | Announcement ID |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `announcementId` | string | No |
| `attachmentList` | object[] | No |
| `name` | string | No |
| `url` | string | No |
| `content` | string | No |
| `importantType` | integer | No |
| `startTime` | datetime | No |
| `tagCode` | string | No |
| `tagDesc` | string | No |
| `title` | string | No |
| `typeCode` | string | No |
| `typeDesc` | string | No |
| `msg` | string | No |

---
