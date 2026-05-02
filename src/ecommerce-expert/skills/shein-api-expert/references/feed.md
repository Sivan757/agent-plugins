# SHEIN Open API — Feed API

Bulk product operations via Feed files — create, upload, and query feed processing results.

## Table of Contents

- [Create Feed file](#create-feed-file)
- [Query Feed file](#query-feed-file)
- [Upload Feed file](#upload-feed-file)
- [Create Feed](#create-feed)
- [Get Feed Result](#get-feed-result)
- [Cancel Feed](#cancel-feed)

---

## Create Feed file

> **Official docs**: [Create Feed file](https://open.sheincorp.com/documents/apidoc/detail/3001229)

**Method**: `POST` &nbsp; **Path**: `/sem/feed/createFeedDocument`

**Applicable to**: Self-operated


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `contentType` | string | Yes |  |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `result` | object | No |
| `feedDocumentId` | string | No |
| `url` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/sem/feed/createFeedDocument' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
"contentType": "application/json"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "result": {
            "feedDocumentId": "MzgxMDk0NDVfMTBfNDI0XzE3MzM1NDQxMzkyMTY=.json",
            "url": "http://openapi-test01.sheincorp.cn/open-api/sem/feed/uploadDocumentContent"
        }
    },
    "bbl": null,
    "traceId": "192508e1a84df9de"
}
```

---

## Query Feed file

> **Official docs**: [Query Feed file](https://open.sheincorp.com/documents/apidoc/detail/3001226)

**Method**: `GET` &nbsp; **Path**: `/sem/feed/getFeedDocument`

**Applicable to**: Self-operated


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `feedDocumentId` | string | Yes | feedDocumentId; Example: /open-api/sem/feed/getFeedDocument?feedDocumentId=MzgxMDk0NDVfMTBfNDI0XzE3MzM1NDQxMzkyMTY=.json |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `result` | object | No |
| `feedDocumentId` | string | No |
| `url` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.cn/open-api/sem/feed/getFeedDocument?feedDocumentId=MzgxMDk0NDVfMTBfNDI0XzE3MzM1NDQxMzkyMTY=.json' \
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
        "result": {
            "feedDocumentId": "MzgxMDk0NDVfMTBfNDI0XzE3MzM1NDQxMzkyMTY=.json",
            "url": "https://ssmp-openapi.oss-cn-shenzhen.aliyuncs.com/MzgxMDk0NDVfMTBfNDI0XzE3MzM1NDQxMzkyMTY%3D.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=LTAI5tRoCW5YFGVY6MxxWKBM%2F20241207%2Fcn-shenzhen%2Fs3%2Faws4_request&X-Amz-Date=20241207T063926Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=f4f7d126bad44e6a3d195f938fbb51d24e455bd242976cb0c350b6e028b41ec1"
        }
    },
    "bbl": null,
    "traceId": "e81b64a20c0419d9"
}
```

---

## Upload Feed file

> **Official docs**: [Upload Feed file](https://open.sheincorp.com/documents/apidoc/detail/3001227)

**Method**: `POST` &nbsp; **Path**: `/sem/feed/uploadDocumentContent`

**Applicable to**: Self-operated


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `feedDocumentId` | string | Yes | feedDocumentId; Example: /open-api/sem/feed/uploadDocumentContent?feed_document_id=openapi-sem/2024-10-25/21613915_10_359_17298584717301157959690244.json |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.cn/open-api/sem/feed/uploadDocumentContent?feed_document_id=openapi-sem/2024-10-25/21613915_10_359_17298584717301157959690244.json' \
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
    "info": null,
    "bbl": null,
    "traceId": "ff4ab44d11bd319d"
}
```

---

## Create Feed

> **Official docs**: [Create Feed](https://open.sheincorp.com/documents/apidoc/detail/3001230)

**Method**: `POST` &nbsp; **Path**: `/sem/feed/createFeed`

**Applicable to**: Self-operated


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `feedDocumentId` | string | No | Name of the feed file |
| `feedType` | string | No | Processing method of the file, currently supporting 'PRODUCT_LISTING' |
| `version` | string | No | Version; default is missing |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `result` | int64 | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/sem/feed/createFeed' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
"feedDocumentId": "MzgxMDk0NDVfMTBfNDI0XzE3MzM1NDQxMzkyMTY=.json",
"feedType": "PRODUCT_LISTING",
"version":""
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "result": 1865289089032323072
    },
    "bbl": null,
    "traceId": "5ec8a3225d111eca"
}
```

---

## Get Feed Result

> **Official docs**: [Get Feed Result](https://open.sheincorp.com/documents/apidoc/detail/3001234)

**Method**: `GET` &nbsp; **Path**: `/sem/feed/getFeed`

**Applicable to**: Self-operated


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `feedId` | int64 | Yes | feedId; obtained by creating a Feed task |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `result` | object | No |
| `createdTime` | string | No |
| `feedId` | int64 | No |
| `feedType` | string | No |
| `processingEndTime` | string | No |
| `processingStartTime` | string | No |
| `processingStatus` | string | No |
| `resultDocumentUrl` | string | No |
| `resultFeedDocumentId` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.com/open-api/sem/feed/getFeed' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--form-data '{
"KEY":["1865289089032323072"]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "result": {
            "feedId": 1849789420770537472,
            "feedType": "PRODUCT_LISTING",
            "createdTime": "2024-10-25 20:25:40",
            "processingStatus": "CANCELLED",
            "processingStartTime": "2024-12-07 14:56:01",
            "processingEndTime": "2024-12-07 14:56:02",
            "resultFeedDocumentId": "MzgxMDk0NDVfMTBfNDI0XzE3MzM1NDQxMzkyMTY=.json",
            "resultDocumentUrl": "https://ssmp-openapi.oss-cn-shenzhen.aliyuncs.com/openapi-sem/2024-10-25/21613915_10_359_17298584717301157959690244.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=LTAI5tRoCW5YFGVY6MxxWKBM%2F20241102%2Fcn-shenzhen%2Fs3%2Faws4_request&X-Amz-Date=20241102T005904Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=bfbc1fd2d2c042df5e1915cf422a440ec0b64a2916b35a902243cfcdf54ca7df"
        }
    },
    "bbl": null,
    "traceId": "4b1404e5bc8ce847"
}
```

---

## Cancel Feed

> **Official docs**: [Cancel Feed](https://open.sheincorp.com/documents/apidoc/detail/3001233)

**Method**: `POST` &nbsp; **Path**: `/sem/feed/cancelFeed`

**Applicable to**: Self-operated


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `feedId` | int64 | Yes | feedId；form-data |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.com/open-api/sem/feed/cancelFeed' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--form-data '{
"feedId":["1865289089032323072"]
}'
```

### Response Example

```json
{
    "code": "openapi-sem031011",
    "msg": "feed in wrong status",
    "info": null,
    "bbl": null,
    "traceId": "aef8df7efdbf4231"
}
```

---
