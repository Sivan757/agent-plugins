# SHEIN Open API — Authorization API

Store authorization, key exchange, and credential management.

## Table of Contents

- [Exchange openKeyId and secretKey](#exchange-openkeyid-and-secretkey)

---

## Exchange openKeyId and secretKey

> **Official docs**: [Exchange openKeyId and secretKey](https://open.sheincorp.com/documents/apidoc/detail/3001520)

**Method**: `POST` &nbsp; **Path**: `/auth/get-by-token`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `tempToken` | string | Yes | TempToken returned by merchant account login confirmation authorization |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | No |
| `info` | object | No |
| `secretKey` | string | Yes |
| `openKeyId` | string | Yes |
| `appid` | string | Yes |
| `state` | string | No |
| `supplierId` | integer | Yes |
| `supplierBusinessMode` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/auth/get-by-token' \
--header 'x-lt-appid: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752560461085' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--data-raw '{
    "tempToken": "de723b1c-210b-4ecc-8da4-5f1da6ea0a9b"
}'
```

### Response Example

```json
{
  "code": "0",
  "msg": "OK",
  "info": {
    "secretKey": "CQsi1eOAf****************YQqmG",
    "appid": "10AF15E7DD802804E7140BE2D326D",
    "openKeyId": "5C83782096BA46008D66C424CB39803F",
    "state": "OPENAPI",
    "supplierId": 21840925,
    "supplierBusinessMode": "POP-US"
  },
  "traceId": "7b0461d5534f3e1"
}
```

---
