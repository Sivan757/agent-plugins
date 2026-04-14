# SHEIN Open API — Product Compliance API

Agency company bindings, real shot images, label templates, compliance certificates, and warning text management.

## Table of Contents

- [Query agency company list](#query-agency-company-list)
- [Query SKC's agency company binding requirements](#query-skc's-agency-company-binding-requirements)
- [Bind SKC and the agency company](#bind-skc-and-the-agency-company)
- [Query SKC's real shot image requirements](#query-skc's-real-shot-image-requirements)
- [Get full environmental material information (New)](#get-full-environmental-material-information-new)
- [Query SKC available label templates](#query-skc-available-label-templates)
- [Print compliance label](#print-compliance-label)
- [Upload real shot image](#upload-real-shot-image)
- [Bind SKC and real shot image](#bind-skc-and-real-shot-image)
- [Query the filling rules of the warning text certificate](#query-the-filling-rules-of-the-warning-text-certificate)
- [Query the binding status of SKC warning language](#query-the-binding-status-of-skc-warning-language)
- [Update SKC warning text](#update-skc-warning-text)

---

## Query agency company list

> **Official docs**: [Query agency company list](https://open.sheincorp.com/documents/apidoc/detail/3001487)

**Method**: `POST` &nbsp; **Path**: `/goods-compliance/agency-list`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pageSize` | integer | Yes | Number of items per page, maximum 100 per page |
| `pageNum` | integer | Yes | Page number. It is recommended to start querying from 1 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object[] | No |
| `agencyId` | int64 | No |
| `agencyName` | string | No |
| `agencyType` | integer | No |
| `agencySubType` | integer | No |
| `agencyStartTime` | string | No |
| `agencyEndTime` | string | No |
| `agencyStatus` | integer | No |
| `applyFailureReason` | string[] | No |
| `applyStatus` | integer | No |
| `coveredProductRange` | integer | No |
| `createTime` | datetime | No |
| `updateTime` | datetime | No |
| `supplierId` | int64 | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods-compliance/agency-list' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751006263039' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
    "pageSize":10,
    "pageNum":1
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": [
        {
            "agencyId": 39141249,
            "agencyName": "Europe02",
            "agencyType": 0,
            "agencySubType": 21,
            "agencyStartTime": "2025-04-22",
            "agencyEndTime": "2025-04-30",
            "agencyStatus": 1,
            "applyFailureReason": null,
            "applyStatus": 1,
            "coveredProductRange": 2,
            "createTime": "2025-04-29 11:03:44",
            "updateTime": "2025-04-29 11:03:44",
            "supplierId": 21498967
        },
        {
            "agencyId": 39144435,
            "agencyName": "Europe01",
            "agencyType": 0,
            "agencySubType": 20,
            "agencyStartTime": "2025-04-22",
            "agencyEndTime": "2025-04-30",
            "agencyStatus": 1,
            "applyFailureReason": null,
            "applyStatus": 1,
            "coveredProductRange": 2,
            "createTime": "2025-04-25 15:20:16",
            "updateTime": "2025-04-25 15:20:16",
            "supplierId": 21498967
        },
        {
            "agencyId": 39140804,
            "agencyName": "test",
            "agencyType": 2,
            "agencySubType": 0,
            "agencyStartTime": "2025-04-17",
            "agencyEndTime": "2025-05-02",
            "agencyStatus": 1,
            "applyFailureReason": null,
            "applyStatus": 1,
            "coveredProductRange": 1,
            "createTime": "2025-04-18 10:48:36",
            "updateTime": "2025-04-18 10:48:36",
            "supplierId": 21498967
        },
        {
            "agencyId": 39139694,
            "agencyName": "Manufacturer",
            "agencyType": 3,
            "agencySubType": 0,
            "agencyStartTime": null,
            "agencyEndTime": null,
            "agencyStatus": 0,
            "applyFailureReason": null,
            "applyStatus": 1,
            "coveredProductRange": 2,
            "createTime": "2025-03-24 16:26:12",
            "updateTime": "2025-04-14 14:53:09",
            "supplierId": 21498967
        },
        {
            "agencyId": 39077342,
            "agencyName": "supplier certificate time",
            "agencyType": 1,
            "agencySubType": 0,
            "agencyStartTime": "2025-03-10",
            "agencyEndTime": "2025-03-28",
            "agencyStatus": 1,
            "applyFailureReason": [
                "代理协议已失效或解除，请重新办理",
                "代理协议签约主体需和SHEIN平台店铺营业主体一致，请重新办理"
            ],
            "applyStatus": 2,
            "coveredProductRange": 2,
            "createTime": "2025-03-10 10:57:30",
            "updateTime": "2025-03-20 19:38:14",
            "supplierId": 21498967
        },
        {
            "agencyId": 39020958,
            "agencyName": "英国代理0227",
            "agencyType": 1,
            "agencySubType": 0,
            "agencyStartTime": "2025-02-27",
            "agencyEndTime": "2025-03-27",
            "agencyStatus": 1,
            "applyFailureReason": null,
            "applyStatus": 1,
            "coveredProductRange": 2,
            "createTime": "2025-02-27 19:51:01",
            "updateTime": "2025-02-27 19:51:01",
            "supplierId": 21498467
        }
    ],
    "traceId": "ed67b86de127ca50"
}
```

---

## Query SKC's agency company binding requirements

> **Official docs**: [Query SKC's agency company binding requirements](https://open.sheincorp.com/documents/apidoc/detail/3001170)

**Method**: `POST` &nbsp; **Path**: `/goods-compliance/skc-agency-detail`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pageSize` | integer | Yes | Number of items per page, maximum 100 |
| `pageNum` | integer | Yes | Page number, it is recommended to start querying from 1 |
| `skcList` | string[] | No | SKC, supports batch query |
| `skcShelfStatusList` | integer[] | No | Filter SKC listing status. 0-Pending listing, SKC status. 1-Listed, 2-Unlisted, 3-Sold out |
| `reviewStatusList` | integer[] | No | Filter the binding status of SKC and agency company. 1-Pending binding; 2-Pending review (merchant backend will show binding successful, API layer can also be understood as binding successful); 3-Binding failed; 4-Binding successful. |
| `isRequired` | integer | No | Filter whether SKC must bind a certain type of agency company. 0-No, 1-Yes, 10-Unknown (this is a transient state, the momentary state when a new SKC is generated) |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object[] | No |
| `skc` | string | No |
| `reviewState` | integer | No |
| `agencyType` | integer | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods-compliance/skc-agency-detail' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751006598999' \
--header 'language: zh-cn' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
    "pageSize":10,
    "pageNum":1,
    "skcList":["s24124352242434353"]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": [
        {
            "skc": "dress14081203",
            "reviewState": 4,
            "agencyType": 0
        },
        {
            "skc": "dress14081203",
            "reviewState": 2,
            "agencyType": 3
        },
        {
            "skc": "dress14081203",
            "reviewState": 2,
            "agencyType": 2
        },
        {
            "skc": "dress14081203",
            "reviewState": 4,
            "agencyType": 1
        }
    ],
    "traceId": "c3a742cfc3655f98"
}
```

---

## Bind SKC and the agency company

> **Official docs**: [Bind SKC and the agency company](https://open.sheincorp.com/documents/apidoc/detail/3001172)

**Method**: `POST` &nbsp; **Path**: `/goods-compliance/save-skc-agency`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skc` | string[] | Yes | skc |
| `agencyType` | integer | Yes | Primary type of agency company。0-EU responsible person; 1-UK agent; 2-US agent; 3-Manufacturer |
| `agencyId` | string | No | Agency company ID。Can be obtained through Query declaration company list to get agencyId。 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods-compliance/save-skc-agency' \
--header 'x-lt-signature: test \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751006946539' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
    "skc":["dress1481203"],
    "agencyType":0,
    "agencyId":39141435
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": null,
    "traceId": "f19e4bcaa433aba3"
}
```

---

## Query SKC's real shot image requirements

> **Official docs**: [Query SKC's real shot image requirements](https://open.sheincorp.com/documents/apidoc/detail/3001394)

**Method**: `POST` &nbsp; **Path**: `/goods-compliance/skc-label-list`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pageSize` | integer | Yes | Number of items per page, up to 100 |
| `pageNum` | integer | Yes | Page number, it is recommended to start querying from 1 |
| `skcList` | string[] | Yes | SKC, supports batch query |
| `skcShelfStatusList` | integer[] | No | SKC's listing status. 0-Pending listing; 1-Listed; 2-Delisted; 3-Sold out |
| `reviewStatusList` | integer[] | No | Review status of a certain information element in the real shot images uploaded by SKC. 1-Pending upload; 2-In effect; 3-Review not passed. |
| `isRequired` | integer | No | Whether a certain information element must be reflected in the real shot images uploaded by SKC. 0-No, 1-Yes, 10-Unknown (momentary state when SKC is generated, can be ignored) |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object[] | No |
| `skc` | string | No |
| `skcShelfStatus` | string[] | No |
| `skcLabelInfoList` | object[] | No |
| `isRequired` | integer | No |
| `labelId` | int64 | No |
| `labelName` | string | No |
| `labelGroup` | string | No |
| `siteList` | string[] | No |
| `reviewStatus` | integer | No |
| `failReason` | string[] | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods-compliance/skc-label-list' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751007220030' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
    "pageSize":10,
    "pageNum":1,
    "skcList":["dress14041203"]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": [
        {
            "skc": "sh2412030799611160",
            "failReasonList": null,
            "skcShelfStatus": 0,
            "skcLabelInfoList": [
                {
                    "isRequired": 1,
                    "labelId": 2,
                    "labelName": "Electronic Recycling Mark",
                    "siteList": [
                        "SHEIN奥地利站",
                        "SHEIN德国站"
                    ],
                    "reviewStatus": 0
                },
                {
                    "isRequired": 1,
                    "labelId": 4,
                    "labelName": "Model",
                    "siteList": [
                        "SHEIN奥地利站",
                        "SHEIN德国站"
                    ],
                    "reviewStatus": 0
                },
                {
                    "isRequired": 1,
                    "labelId": 5,
                    "labelName": "Electrical parameters",
                    "siteList": [
                        "SHEIN奥地利站",
                        "SHEIN德国站"
                    ],
                    "reviewStatus": 0
                },
                {
                    "isRequired": 1,
                    "labelId": 8,
                    "labelName": "Manufacturer",
                    "siteList": [
                        "SHEIN奥地利站",
                        "SHEIN德国站"
                    ],
                    "reviewStatus": 0
                },
                {
                    "isRequired": 1,
                    "labelId": 9,
                    "labelName": "Manufacturer Address",
                    "siteList": [
                        "SHEIN奥地利站",
                        "SHEIN德国站"
                    ],
                    "reviewStatus": 0
                },
                {
                    "isRequired": 1,
                    "labelId": 10,
                    "labelName": "Manufacturer contact information",
                    "siteList": [
                        "SHEIN奥地利站",
                        "SHEIN德国站"
                    ],
                    "reviewStatus": 0
                },
                {
                    "isRequired": 1,
                    "labelId": 11,
                    "labelName": "EU responsible person (EU|REP  or EC|REP)",
                    "siteList": [
                        "SHEIN奥地利站",
                        "SHEIN德国站"
                    ],
                    "reviewStatus": 0
                },
                {
                    "isRequired": 1,
                    "labelId": 34,
                    "labelName": "CE Mark",
                    "siteList": [
                        "SHEIN奥地利站",
                        "SHEIN德国站"
                    ],
                    "reviewStatus": 0
                }
            ]
        }
    ],
    "traceId": "a5c496a1c82ccb21"
}
```

---

## Get full environmental material information (New)

> **Official docs**: [Get full environmental material information (New)](https://open.sheincorp.com/documents/apidoc/detail/3001174)

**Method**: `GET` &nbsp; **Path**: `/goods-quality/environmental-label-rule/material-quality-tree-v2`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

_No additional request parameters._

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object[] | Yes |
| `packageTypeId` | integer | No |
| `packageTypeName` | string | No |
| `isEnabled` | integer | No |
| `packageMaterials` | object[] | Yes |
| `packageMaterialId` | integer | No |
| `packageMaterialName` | string | No |
| `isEnabled` | integer | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.com//open-api/goods-quality/environmental-label-rule/material-quality-tree-v2' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751007419290' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": [
        {
            "packageTypeId": 6,
            "packageTypeName": "塑料袋",
            "isEnabled": 1,
            "packageMaterials": [
                {
                    "packageMaterialId": 62,
                    "packageMaterialName": "PVC塑料袋",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 66,
                    "packageMaterialName": "PE塑料袋LDPE",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 61,
                    "packageMaterialName": "PE塑料袋HDPE",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 63,
                    "packageMaterialName": "PET塑料袋",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 60,
                    "packageMaterialName": "PP塑料袋",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 65,
                    "packageMaterialName": "PS塑料袋",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 64,
                    "packageMaterialName": "其他塑料袋",
                    "isEnabled": 1
                }
            ]
        },
        {
            "packageTypeId": 7,
            "packageTypeName": "包装盒",
            "isEnabled": 1,
            "packageMaterials": [
                {
                    "packageMaterialId": 67,
                    "packageMaterialName": "PVC塑料盒",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 72,
                    "packageMaterialName": "PE塑料盒LDPE",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 71,
                    "packageMaterialName": "PE塑料盒HDPE",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 74,
                    "packageMaterialName": "PET塑料盒",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 73,
                    "packageMaterialName": "PP塑料盒",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 70,
                    "packageMaterialName": "PS塑料盒",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 69,
                    "packageMaterialName": "其他塑料盒",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 68,
                    "packageMaterialName": "瓦楞纸盒",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 98,
                    "packageMaterialName": "非瓦楞纸盒",
                    "isEnabled": 1
                }
            ]
        },
        {
            "packageTypeId": 8,
            "packageTypeName": "瓶子",
            "isEnabled": 1,
            "packageMaterials": [
                {
                    "packageMaterialId": 79,
                    "packageMaterialName": "PVC塑料瓶",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 81,
                    "packageMaterialName": "PE塑料瓶LDPE",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 75,
                    "packageMaterialName": "PE塑料瓶HDPE",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 78,
                    "packageMaterialName": "PET塑料瓶",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 80,
                    "packageMaterialName": "PP塑料瓶",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 76,
                    "packageMaterialName": "PS塑料瓶",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 77,
                    "packageMaterialName": "其他塑料瓶",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 97,
                    "packageMaterialName": "透明玻璃",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 101,
                    "packageMaterialName": "绿玻璃",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 106,
                    "packageMaterialName": "棕色玻璃",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 107,
                    "packageMaterialName": "有色（非绿/非棕）玻璃",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 99,
                    "packageMaterialName": "钢铁",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 108,
                    "packageMaterialName": "铝",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 105,
                    "packageMaterialName": "其他金属（非钢铁非铝）",
                    "isEnabled": 1
                }
            ]
        },
        {
            "packageTypeId": 9,
            "packageTypeName": "盖子",
            "isEnabled": 1,
            "packageMaterials": [
                {
                    "packageMaterialId": 91,
                    "packageMaterialName": "PVC塑料盖子",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 87,
                    "packageMaterialName": "PE塑料盖子LDPE",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 94,
                    "packageMaterialName": "PE塑料盖子HDPE",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 88,
                    "packageMaterialName": "PET塑料盖子",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 85,
                    "packageMaterialName": "PP塑料盖子",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 84,
                    "packageMaterialName": "PS塑料盖子",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 83,
                    "packageMaterialName": "其他塑料盖子",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 109,
                    "packageMaterialName": "钢铁",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 104,
                    "packageMaterialName": "铝",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 103,
                    "packageMaterialName": "其他金属（非钢铁非铝）",
                    "isEnabled": 1
                }
            ]
        },
        {
            "packageTypeId": 10,
            "packageTypeName": "泡沫板",
            "isEnabled": 1,
            "packageMaterials": [
                {
                    "packageMaterialId": 95,
                    "packageMaterialName": "PVC塑料板",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 93,
                    "packageMaterialName": "PE塑料板LDPE",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 86,
                    "packageMaterialName": "PE塑料板HDPE",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 82,
                    "packageMaterialName": "PET塑料板",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 90,
                    "packageMaterialName": "PP塑料板",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 92,
                    "packageMaterialName": "PS塑料板",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 89,
                    "packageMaterialName": "其他塑料板",
                    "isEnabled": 1
                }
            ]
        },
        {
            "packageTypeId": 11,
            "packageTypeName": "纸板",
            "isEnabled": 1,
            "packageMaterials": [
                {
                    "packageMaterialId": 102,
                    "packageMaterialName": "瓦楞纸板",
                    "isEnabled": 1
                },
                {
                    "packageMaterialId": 100,
                    "packageMaterialName": "非瓦楞纸板",
                    "isEnabled": 1
                }
            ]
        },
        {
            "packageTypeId": 12,
            "packageTypeName": "纸",
            "isEnabled": 1,
            "packageMaterials": [
                {
                    "packageMaterialId": 96,
                    "packageMaterialName": "纸",
                    "isEnabled": 1
                }
            ]
        }
    ],
    "traceId": "4e6ef5f4cb1b5a4"
}
```

---

## Query SKC available label templates

> **Official docs**: [Query SKC available label templates](https://open.sheincorp.com/documents/apidoc/detail/3001373)

**Method**: `POST` &nbsp; **Path**: `/goods-compliance/get-label-template`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skc` | string | Yes | SKC code generated by the platform |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `info` | object | Yes |
| `skc` | string | Yes |
| `labelList` | object[] | No |
| `labelCode` | string | No |
| `labelName` | string | No |
| `labelType` | integer | No |
| `labelPreview` | string | No |
| `traceId` | string | Yes |

### Request Example

```bash
curl --location --request POST 'http://https://openapi.sheincorp.com/open-api/goods-compliance/get-label-template' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1755506960113' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--header 'Connection: keep-alive' \
--data-raw '{
    "skc":"sa25080185896920018"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "skc": "sr250811558984fdsf915",
        "labelList": [
            {
                "labelCode": "1754296911182",
                "labelName": "合并打印：条形码/GPSR/环保标",
                "labelType": 2,
                "labelPreview": "https://pdf.dotfashion.cn/pdf-proxy/pdf2/grc.biz.sheincorp.cn/2025/8/5/1754365094106-253ceb2da73950744fdcaeaa5d2e3987.oss.png"
            },
            {
                "labelCode": "1754295909468",
                "labelName": "合并打印：条形码和GPSR标签",
                "labelType": 2,
                "labelPreview": "https://pdf.dotfashion.cn/pdf-proxy/pdf2/grc.biz.sheincorp.cn/2025/8/5/1754373567623-105b09531ca6c4a1c18670183a4b4c3b.oss.png"
            },
            {
                "labelCode": "Fr-EEE (Big）",
                "labelName": "电子电器包装标签模板（贴在包装上）",
                "labelType": 4,
                "labelPreview": "https://pdf.dotfashion.cn/pdf-proxy/pdf2/grc.biz.sheincorp.cn/2025/4/14/1744613327119-6c5927897406ee147bb5a170f7d1c30e.oss.png"
            },
            {
                "labelCode": "GPSR_Huanbaobiao",
                "labelName": "普货_欧盟GPSR+环保标100*100",
                "labelType": 2,
                "labelPreview": "https://pdf.dotfashion.cn/pdf-proxy/pdf2/grc.biz.sheincorp.cn/2025/4/15/1744682895438-afa95a6ef6f8a175629bafef9f89e773.oss.png"
            },
            {
                "labelCode": "666",
                "labelName": "电子电器本体标签模板（贴在本体上）",
                "labelType": 4,
                "labelPreview": "https://pdf.dotfashion.cn/pdf-proxy/pdf2/grc.biz.sheincorp.cn/2025/4/14/1744611905915-9146f66800464c6f9b406b4904d14fc6.oss.png"
            }
        ]
    },
    "bbl": null,
    "traceId": "1f30b3e61cf81e07"
}
```

---

## Print compliance label

> **Official docs**: [Print compliance label](https://open.sheincorp.com/documents/apidoc/detail/3001385)

**Method**: `POST` &nbsp; **Path**: `/goods-compliance/label-print`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `labelDetailList` | object[] | No | Print rule list。That is, provide specific labels for what content to print。A maximum of 10 sets of rules are supported at a time, too many may cause response timeout。 Before printing labels, please first query the label template available for each... |
| `labelType` | integer | Yes | Label type. Examples of each type of printing can be found in the FAQ at the bottom of the document.1-Environmental label: usually contains environmental information2-GPSR label: usually contains GPSR information (may also have environmental label... |
| `labelCode` | string | No | Printed label template code。Obtain through /open-api/goods-compliance/get-label-templateNot mandatory, if not provided, the system will match all printable labels of the SKC based on the input SKC and labelType for printing。 |
| `printNumber` | integer | No | Label printing quantity。Not mandatory, it will only take effect if labelCode is provided。If not provided, the default is to print 1 copy of each label。 |
| `packageTypeId` | int64 | No | This field will be deprecated later, use packageMaterialList as input parameter (supports printing multiple environmental materials in one label). |
| `packageMaterialId` | int64 | No | This field will be deprecated later, use packageMaterialList as input parameter (supports printing multiple environmental materials in one label). |
| `packageMaterialList` | object[] | No | Environmental material list. Supports printing multiple environmental materials in one label, up to 10 materials.When the label contains environmental information, this list needs to be included as a parameter. Usually labelType=1/2/4/5 can be use... |
| `packageTypeId` | int64 | No | Environmental material type ID. Can be obtained through the interface Get full environmental material information (new).Usually labelType=1/2/4/5 can be used as a parameter, but whether the final print result will have environmental material infor... |
| `packageMaterialId` | int64 | No | Environmental material ID. Can be obtained through the interface Get full environmental material information (new).Usually labelType=1/2/4/5 can be used as a parameter, but whether the final print result will have environmental material informatio... |
| `skc` | string | Yes | Platform-generated unique SKC code.Mandatory, regardless of the type of label, it must be provided. |
| `skuCode` | string | No | SKU displayed in the product barcode. When the label contains barcode information, skucode and suppliersku choose one to be used as a parameter,Usually labelType=2/4/5 can be used as a parameter, but whether the final print result will have produc... |
| `supplierSku` | string | No | SKU displayed in the product barcode. When the label contains barcode information, skucode and suppliersku choose one to be used as a parameter,Usually labelType=2/4/5 can be used as a parameter, but whether the final print result will have produc... |
| `orderNo` | string | No | Purchase order number displayed in the product barcode。Use when the label contains barcode information, not mandatory, if no value is provided, the number will be displayed as empty。Usually, when labelType=2/4/5, it can be used as input, but wheth... |
| `originCountry` | string | No | Country of origin. Used when the label contains GPSR information, custom value entered by the merchant, fill in the country name.Usually labelType=2/4/5 can be used as a parameter. |
| `productBatchNo` | string | No | Product batch number. Used when the label contains GPSR information, custom value entered by the merchant.Usually labelType=2/4/5 can be used as a parameter. |
| `warning` | string | No | Warning。Use when the label contains GPSR information, custom input value by the merchant。Usually, when labelType=2/4/5, it can be used as input。 |
| `uid` | string | Yes | Location ID of the print rules. The location ID of each line must be unique. Custom input by the developer, used to determine which rule failed or succeeded in printing. |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `failedList` | object[] | No |
| `code` | string[] | No |
| `labelType` | integer | No |
| `reason` | string[] | No |
| `uid` | string | No |
| `successList` | object[] | No |
| `labelLength` | integer | No |
| `labelType` | integer | No |
| `labelUrl` | string | No |
| `labelWidth` | integer | No |
| `labelCode` | string | No |
| `uid` | string | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'http://openapi-test01.sheincorp.cn/open-api/goods-compliance/label-print' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1757062136138' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "labelDetailList":[
        {
        "labelCode":"1752493613919",
        "labelType":1,
        "skc":"sa25080185896920018",
        "productBatchNo":"005655435444",
        "originCountry":"china",
        "warning":"warning test",
        "packageMaterialList":[
            {
                "package_material_id":191,
                "package_type_id":113
            },
            {
                "package_material_id":408,
                "package_type_id":113
            }
        ],
        "printNumber":10,
        "skuCode":"I9pfmig3wu1d",
        "uid":1},

        {
        "labelCode":"1754474187729",
        "labelType":5,
        "printNumber":5,
        "skuCode":"I9pfmig3wu1d",
        "uid":2
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
        "successList": [
            {
                "uid": "1",
                "labelType": 1,
                "labelUrl": "https://ssmp-public-test-ali.oss-cn-shenzhen.aliyuncs.com/pdf2-test/pcrs/2025/9/5/1757062138054-a57537e253bf3961c581cab3ba93f4ee.oss.pdf?AWSAccessKeyId=LTAI5tRyBdX9kWZcVCLyWMTF&Expires=1757666940&Signature=FuPwCp9u2c7fbbIu3IGlvD8fOwI%3D",
                "labelCode": "1752493613919",
                "labelWidth": 110,
                "labelLength": 100
            },
            {
                "uid": "2",
                "labelType": 5,
                "labelUrl": "https://ssmp-public-test-ali.oss-cn-shenzhen.aliyuncs.com/pdf2-test/pcrs/2025/9/5/1757062138048-ef08b2bf2044f4a98af7330b5c9b0f87.oss.pdf?AWSAccessKeyId=LTAI5tRyBdX9kWZcVCLyWMTF&Expires=1757666938&Signature=5M7wMNEZXO27twojlMiOmBQmbhY%3D",
                "labelCode": "1754474187729",
                "labelWidth": 60,
                "labelLength": 80
            }
        ],
        "failedList": []
    },
    "bbl": null,
    "traceId": "84e29a98f70cef36"
}
```

---

## Upload real shot image

> **Official docs**: [Upload real shot image](https://open.sheincorp.com/documents/apidoc/detail/3001176)

**Method**: `POST` &nbsp; **Path**: `/goods-compliance/upload-skc-label-picture`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `file` | blob | No | Local image file。Image width and height must not exceed 8000px, size must not exceed 10M, supports png/jpeg/jpg format |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `imageUrl` | string | No |
| `imageMd5` | string | No |
| `msg` | string | No |
| `code` | integer | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods-compliance/upload-skc-label-picture' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751008118526' \
--header 'language: zh-cn' \
--header 'Host: openapi.sheincorp.com' \
--form 'file=@"cmMtdXBsb2FkLTE3NTA4MzM4OTk3NzgtMTM=/test pic.jpeg"'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "imageUrl": "https://lt-pqms.oss-cn-shenzhen.aliyuncs.com/gpc2831944489401059568.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250504T080405Z&X-Amz-SignedHeaders=host&X-Amz-Expires=432000&X-Amz-Credential=LTAI5tKvGuVMaYLBaMkpkiBr/20250507/oss-cn-shenzhen/s3/aws4_request&X-Amz-Signature=af6c6f0d66e4f2d915d3564d15ba30b49c9a172b23a12a54c6e5b5d719cead00",
        "imageMd5": "f39f332f054cf958c9ba4367dce9b1d0",
        "msg": null,
        "code": 0
    },
    "traceId": "ed02f5adb2158378"
}
```

---

## Bind SKC and real shot image

> **Official docs**: [Bind SKC and real shot image](https://open.sheincorp.com/documents/apidoc/detail/3001399)

**Method**: `POST` &nbsp; **Path**: `/goods-compliance/skc-save-label`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skcList` | string[] | Yes | SKC |
| `packageLableList` | object[] | No | Real photo of the packaging type label |
| `imageUrl` | string | No | Image url。 Needs to be obtained through interface conversion /open-api/goods-compliance/label-print |
| `imageMd5` | string | No | The md5 of the image. Must be obtained by converting through /open-api/goods-compliance/label-print |
| `bodyLableList` | object[] | No | Real photo of the product body label |
| `imageUrl` | string | No | Image url。 Needs to be obtained through interface conversion /open-api/goods-compliance/label-print |
| `imageMd5` | string | No | The md5 of the image. Must be obtained by converting through /open-api/goods-compliance/label-print |
| `skcLablePicList` | object[] | No | This field will be deprecated in the future, please do not integrate it anymore. |
| `imageUrl` | string | No | This field will be deprecated in the future, please do not integrate it anymore. |
| `imageMd5` | string | No | This field will be deprecated in the future, please do not integrate it anymore. |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `totalCount` | integer | No |
| `successCount` | integer | No |
| `faildCount` | integer | No |
| `faildList` | object[] | No |
| `skc` | string | No |
| `code` | string | No |
| `reason` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'http://openapi-test01.sheincorp.cn/open-api/goods-compliance/skc-save-label' \
--header 'x-lt-signature: test0NjMxMGVkNjY1ZTcyYWRiYmQxZjAyODhlZWFlODI3MDQ1Y2Q1NDYyZWYyNzYyNjRlZTYwMWJjNTBlNTA5MTg3MQ==' \
--header 'x-lt-openKeyId: C214481C26F84B29AFFCD66698F5697C' \
--header 'x-lt-timestamp: 1758714281777' \
--header 'language: zh-cn' \
--header 'User-Agent: Apifox/1.0.0 (https://apifox.com)' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--header 'Host: openapi-test01.sheincorp.cn' \
--header 'Connection: keep-alive' \
--data-raw '{
    "skcList": ["ss25073111842407126"],
     "packageLableList": [
        {
            "imageUrl": "https://pqms-1259571579.cos.ap-nanjing.myqcloud.com/gpc3033364508363988992.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250923T065654Z&X-Amz-SignedHeaders=host&X-Amz-Expires=432000&X-Amz-Credential=AKIDIPGrBE0VjgOpztXu1sSmqnY5NPBiz1nJ/20250923/ap-nanjing/s3/aws4_request&X-Amz-Signature=baac116bb3cc3f92fa74c4ed790084581fa5f96d83fc5c5e2126b1f84d470215",
            "imageMd5": "29d6ba8d19be1959c1d362c7ece817e0"
            }
            ],
    "bodyLableList": [
        {
            "imageUrl": "https://pqms-1259571579.cos.ap-nanjing.myqcloud.com/gpc3033364508363988992.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250923T065654Z&X-Amz-SignedHeaders=host&X-Amz-Expires=432000&X-Amz-Credential=AKIDIPGrBE0VjgOpztXu1sSmqnY5NPBiz1nJ/20250923/ap-nanjing/s3/aws4_request&X-Amz-Signature=baac116bb3cc3f92fa74c4ed790084581fa5f96d83fc5c5e2126b1f84d470215",
            "imageMd5": "29d6ba8d19be1959c1d362c7ece817e0"
            }
            ],
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "totalCount": 1,
        "successCount": 0,
        "faildCount": 1,
        "faildList": [
            {
                "skc": "s2412134534525",
                "code": "0108",
                "reason": "当前SKC无需上传实拍标签信息，系统已经自动过滤，无需再次操作"
            }
        ]
    },
    "traceId": "e5e3e7147ee7f3ca"
}
```

---

## Query the filling rules of the warning text certificate

> **Official docs**: [Query the filling rules of the warning text certificate](https://open.sheincorp.com/documents/apidoc/detail/3001576)

**Method**: `POST` &nbsp; **Path**: `/goods-compliance/query-warning-certificate-rules`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

_No additional request parameters._

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object[] | No |
| `certificateTypeId` | int64 | No |
| `certificateTypeCode` | string | No |
| `certificateTypeName` | string | No |
| `presetInfo` | object | No |
| `isEnabled` | integer | No |
| `presetFields` | object[] | Yes |
| `fieldCode` | string | No |
| `fieldName` | string | No |
| `fieldType` | integer | No |
| `fieldSort` | integer | No |
| `isEnabled` | integer | No |
| `presetFieldValues` | object[] | Yes |
| `fieldValueId` | int64 | No |
| `fieldValue` | string | No |
| `exclusionFieldValueIds` | int64[] | No |
| `mappingPaths` | object[] | No |
| `fieldValueIds` | int64[] | No |
| `valueSort` | integer | No |
| `isEnabled` | integer | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'http://openapi-test01.sheincorp.cn/open-api/goods-compliance/query-warning-certificate-rules' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1768893293204' \
--header 'language: CN' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": [
        {
            "certificateTypeId": 754,
            "certificateTypeCode": "PlaypenWMWAttr",
            "certificateTypeName": "游戏床警告语",
            "presetInfo": {
                "isEnabled": 1,
                "presetFields": [
                    {
                        "fieldName": "商品属性",
                        "fieldType": 0,
                        "fieldCode": "PAWA1",
                        "fieldSort": 0,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 2455,
                                "fieldValue": "产品是折叠游戏围栏",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": null,
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 2458,
                                "fieldValue": "产品是游戏围栏，但不是折叠游戏围栏",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": null,
                                "valueSort": 1,
                                "isEnabled": 1
                            }
                        ]
                    },
                    {
                        "fieldName": "警告语",
                        "fieldType": 2,
                        "fieldCode": "WAContent",
                        "fieldSort": 1,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 2457,
                                "fieldValue": "警告：请勿将游戏围栏放置在明火或其他热源附近。",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            2455
                                        ]
                                    },
                                    {
                                        "fieldValueIds": [
                                            2458
                                        ]
                                    }
                                ],
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 2456,
                                "fieldValue": "警告：请勿在没有底座的情况下使用游戏围栏。",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            2455
                                        ]
                                    },
                                    {
                                        "fieldValueIds": [
                                            2458
                                        ]
                                    }
                                ],
                                "valueSort": 1,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 2454,
                                "fieldValue": "警告：在将孩子放入本游戏围栏前，请确保围栏已完全搭建好，并且所有锁定装置均已正确锁定。",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            2455
                                        ]
                                    }
                                ],
                                "valueSort": 2,
                                "isEnabled": 1
                            }
                        ]
                    }
                ]
            }
        },
        {
            "certificateTypeId": 666,
            "certificateTypeCode": "PWarningAttr",
            "certificateTypeName": "安抚奶嘴及配件警告语-属性",
            "presetInfo": {
                "isEnabled": 1,
                "presetFields": [
                    {
                        "fieldName": "产品属性",
                        "fieldType": 0,
                        "fieldCode": "Product Attributes_1",
                        "fieldSort": 0,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 479,
                                "fieldValue": "产品是安抚奶嘴",
                                "exclusionFieldValueIds": [
                                    474,
                                    480
                                ],
                                "mappingPaths": null,
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 474,
                                "fieldValue": "产品既不是安抚奶嘴也不是奶嘴链",
                                "exclusionFieldValueIds": [
                                    479,
                                    477,
                                    480
                                ],
                                "mappingPaths": null,
                                "valueSort": 1,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 477,
                                "fieldValue": "有可拆卸的奶嘴保护盖",
                                "exclusionFieldValueIds": [
                                    474,
                                    480
                                ],
                                "mappingPaths": null,
                                "valueSort": 2,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 480,
                                "fieldValue": "产品是安抚奶嘴链",
                                "exclusionFieldValueIds": [
                                    474,
                                    479,
                                    477
                                ],
                                "mappingPaths": null,
                                "valueSort": 3,
                                "isEnabled": 1
                            }
                        ]
                    },
                    {
                        "fieldName": "商品详情页提示内容",
                        "fieldType": 2,
                        "fieldCode": "Toy_Danger_Warning",
                        "fieldSort": 1,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 485,
                                "fieldValue": "WARNING:Inspect carefully before each use. Pull the soother in all directions. Throw away at the first signs of damage or weakness.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            479
                                        ]
                                    }
                                ],
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 484,
                                "fieldValue": "WARNING:Only use dedicated soother holders tested to EN 12586. Never attach other ribbons or cords to a soother, your child may be strangled by them.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            479
                                        ]
                                    }
                                ],
                                "valueSort": 1,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 475,
                                "fieldValue": "WARNING:Do not leave a soother in direct sunlight or near a source of heat, or leave in disinfectant (\"sterilising solution\") for longer than recommended, as this may weaken the teat.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            479
                                        ]
                                    }
                                ],
                                "valueSort": 2,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 482,
                                "fieldValue": "C端透出内容为空",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            474
                                        ]
                                    }
                                ],
                                "valueSort": 3,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 483,
                                "fieldValue": "WARNING:Keep the removable teat protector away from children to avoid suffocation.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            477
                                        ]
                                    }
                                ],
                                "valueSort": 4,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 476,
                                "fieldValue": "WARNING:Before each use check the soother holder carefully. Throw away at the first sign of damage or weakness.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            480
                                        ]
                                    }
                                ],
                                "valueSort": 5,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 478,
                                "fieldValue": "WARNING:Never lengthen the soother holder!",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            480
                                        ]
                                    }
                                ],
                                "valueSort": 6,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 481,
                                "fieldValue": "WARNING:Never attach to cords, ribbons, laces or loose parts of clothing. The child can be strangled.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            480
                                        ]
                                    }
                                ],
                                "valueSort": 7,
                                "isEnabled": 1
                            }
                        ]
                    }
                ]
            }
        },
        {
            "certificateTypeId": 362,
            "certificateTypeCode": "111111",
            "certificateTypeName": "arms_skc维度卖点证书测试",
            "presetInfo": {
                "isEnabled": 1,
                "presetFields": [
                    {
                        "fieldName": "1",
                        "fieldType": 0,
                        "fieldCode": "PAWA1",
                        "fieldSort": 0,
                        "isEnabled": 1,
                        "presetFieldValues": null
                    },
                    {
                        "fieldName": "2",
                        "fieldType": 0,
                        "fieldCode": "WAContent",
                        "fieldSort": 1,
                        "isEnabled": 1,
                        "presetFieldValues": null
                    }
                ]
            }
        },
        {
            "certificateTypeId": 537,
            "certificateTypeCode": "BallWarnings",
            "certificateTypeName": "气球警告语",
            "presetInfo": {
                "isEnabled": 1,
                "presetFields": [
                    {
                        "fieldName": "气球产品危险性描述",
                        "fieldType": 0,
                        "fieldCode": "Ball_Warnings",
                        "fieldSort": 0,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 447,
                                "fieldValue": "警告：非儿童玩具",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": null,
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 446,
                                "fieldValue": "警告：天然乳胶材质",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": null,
                                "valueSort": 1,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 448,
                                "fieldValue": "警告：窒息-未充气或破损气球引起的窒息",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": null,
                                "valueSort": 2,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 450,
                                "fieldValue": "警告：窒息危险 - 含有小零件导致儿童误吞堵住气管引起的窒息。不适用于 3 岁以下儿童。",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": null,
                                "valueSort": 3,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 449,
                                "fieldValue": "警告：使用充气泵",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": null,
                                "valueSort": 4,
                                "isEnabled": 1
                            }
                        ]
                    },
                    {
                        "fieldName": "商详页提示内容",
                        "fieldType": 2,
                        "fieldCode": "Toy_Danger_Warning",
                        "fieldSort": 1,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 451,
                                "fieldValue": "警告：非儿童玩具",
                                "exclusionFieldValueIds": [
                                    452
                                ],
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            447
                                        ]
                                    }
                                ],
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 452,
                                "fieldValue": "警告：天然乳胶材质",
                                "exclusionFieldValueIds": [
                                    451
                                ],
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            446
                                        ]
                                    }
                                ],
                                "valueSort": 1,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 453,
                                "fieldValue": "警告：窒息-未充气或破损气球引起的窒息",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            448
                                        ]
                                    }
                                ],
                                "valueSort": 2,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 454,
                                "fieldValue": "警告：窒息危险 - 含有小零件导致儿童误吞堵住气管引起的窒息。不适用于 3 岁以下儿童。",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            450
                                        ]
                                    }
                                ],
                                "valueSort": 3,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 455,
                                "fieldValue": "警告：使用充气泵",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            449
                                        ]
                                    }
                                ],
                                "valueSort": 4,
                                "isEnabled": 1
                            }
                        ]
                    }
                ]
            }
        },
        {
            "certificateTypeId": 665,
            "certificateTypeCode": "FPWarningAttr",
            "certificateTypeName": "母婴喂养用品警告语-属性",
            "presetInfo": {
                "isEnabled": 1,
                "presetFields": [
                    {
                        "fieldName": "产品属性",
                        "fieldType": 0,
                        "fieldCode": "Product Attributes",
                        "fieldSort": 0,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 459,
                                "fieldValue": "产品带奶嘴",
                                "exclusionFieldValueIds": [
                                    473
                                ],
                                "mappingPaths": null,
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 461,
                                "fieldValue": "玻璃容器",
                                "exclusionFieldValueIds": [
                                    473
                                ],
                                "mappingPaths": null,
                                "valueSort": 1,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 473,
                                "fieldValue": "不存在上述情形",
                                "exclusionFieldValueIds": [
                                    459,
                                    461
                                ],
                                "mappingPaths": null,
                                "valueSort": 2,
                                "isEnabled": 1
                            }
                        ]
                    },
                    {
                        "fieldName": "商详页提示内容",
                        "fieldType": 2,
                        "fieldCode": "Toy_Danger_Warning",
                        "fieldSort": 1,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 458,
                                "fieldValue": "警告：严禁将喂食奶嘴用作安抚奶嘴。",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            459
                                        ]
                                    }
                                ],
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 460,
                                "fieldValue": "警告：玻璃容器可能破裂。",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            461
                                        ]
                                    }
                                ],
                                "valueSort": 1,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 462,
                                "fieldValue": "警告：使用本产品时须有成人监护。",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            459
                                        ]
                                    },
                                    {
                                        "fieldValueIds": [
                                            461
                                        ]
                                    }
                                ],
                                "valueSort": 2,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 472,
                                "fieldValue": "商家端不显示警告提示",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            473
                                        ]
                                    }
                                ],
                                "valueSort": 3,
                                "isEnabled": 1
                            }
                        ]
                    }
                ]
            }
        },
        {
            "certificateTypeId": 743,
            "certificateTypeCode": "Tem1",
            "certificateTypeName": "模版证书配置",
            "presetInfo": {
                "isEnabled": 1,
                "presetFields": [
                    {
                        "fieldName": "类型描述文案",
                        "fieldType": 0,
                        "fieldCode": "PAWA1",
                        "fieldSort": 0,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 2380,
                                "fieldValue": "类型1",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": null,
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 2379,
                                "fieldValue": "类型2",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": null,
                                "valueSort": 1,
                                "isEnabled": 1
                            }
                        ]
                    },
                    {
                        "fieldName": "模版一透出内容",
                        "fieldType": 2,
                        "fieldCode": "WAContent",
                        "fieldSort": 1,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 2378,
                                "fieldValue": "中文",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": null,
                                "valueSort": 0,
                                "isEnabled": 1
                            }
                        ]
                    }
                ]
            }
        },
        {
            "certificateTypeId": 671,
            "certificateTypeCode": "SWarningAttr",
            "certificateTypeName": "婴儿车警告语-属性",
            "presetInfo": {
                "isEnabled": 1,
                "presetFields": [
                    {
                        "fieldName": "婴儿车产品属性",
                        "fieldType": 0,
                        "fieldCode": "Product Attributes_3",
                        "fieldSort": 0,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 527,
                                "fieldValue": "卧式婴儿推车内部长度大于800 mm",
                                "exclusionFieldValueIds": [
                                    529
                                ],
                                "mappingPaths": null,
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 526,
                                "fieldValue": "产品不适用于6个月以下的婴儿使用",
                                "exclusionFieldValueIds": [
                                    529
                                ],
                                "mappingPaths": null,
                                "valueSort": 1,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 528,
                                "fieldValue": "产品是坐式婴儿推车",
                                "exclusionFieldValueIds": [
                                    529
                                ],
                                "mappingPaths": null,
                                "valueSort": 2,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 529,
                                "fieldValue": "不存在上述情形",
                                "exclusionFieldValueIds": [
                                    527,
                                    526,
                                    528
                                ],
                                "mappingPaths": null,
                                "valueSort": 3,
                                "isEnabled": 1
                            }
                        ]
                    },
                    {
                        "fieldName": "商品详情页展示警告语",
                        "fieldType": 2,
                        "fieldCode": "Toy_Danger_Warning",
                        "fieldSort": 1,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 533,
                                "fieldValue": "WARNING:Use a harness as soon as the child can sit unaided.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            527
                                        ]
                                    }
                                ],
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 532,
                                "fieldValue": "WARNING:This seat unit is not suitable for children under 6 months.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            526
                                        ]
                                    }
                                ],
                                "valueSort": 1,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 530,
                                "fieldValue": "WARNING:Always use the restraint system.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            528
                                        ]
                                    }
                                ],
                                "valueSort": 2,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 531,
                                "fieldValue": "没有警告语需要透出",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            529
                                        ]
                                    }
                                ],
                                "valueSort": 3,
                                "isEnabled": 1
                            }
                        ]
                    }
                ]
            }
        },
        {
            "certificateTypeId": 675,
            "certificateTypeCode": "BCSWarningAttr",
            "certificateTypeName": "自行车儿童座椅警告语-属性",
            "presetInfo": {
                "isEnabled": 1,
                "presetFields": [
                    {
                        "fieldName": "自行车儿童座椅产品属性",
                        "fieldType": 0,
                        "fieldCode": "Product Attributes_4",
                        "fieldSort": 0,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 570,
                                "fieldValue": "产品是设计为安装在载重等级为27公斤的行李架上的后置座椅",
                                "exclusionFieldValueIds": [
                                    569
                                ],
                                "mappingPaths": null,
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 569,
                                "fieldValue": "产品是前置座椅",
                                "exclusionFieldValueIds": [
                                    570,
                                    568
                                ],
                                "mappingPaths": null,
                                "valueSort": 1,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 568,
                                "fieldValue": "产品是装在行李架上的后置座椅",
                                "exclusionFieldValueIds": [
                                    569
                                ],
                                "mappingPaths": null,
                                "valueSort": 2,
                                "isEnabled": 1
                            }
                        ]
                    },
                    {
                        "fieldName": "商品详情页提示内容",
                        "fieldType": 2,
                        "fieldCode": "Toy_Danger_Warning",
                        "fieldSort": 1,
                        "isEnabled": 1,
                        "presetFieldValues": [
                            {
                                "fieldValueId": 571,
                                "fieldValue": "WARNING: For safety reasons this seat shall only be fitted to luggage carriers conforming to EN IS0 11243:2016 marked with a 27 kg load capacity.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            570
                                        ]
                                    }
                                ],
                                "valueSort": 0,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 572,
                                "fieldValue": "WARNING: Front seats reduce the manoeuvrability of the bicycle.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            569
                                        ]
                                    }
                                ],
                                "valueSort": 1,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 574,
                                "fieldValue": "WARNING: The movability of the handle bar could be reduced by the seat.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            569
                                        ]
                                    }
                                ],
                                "valueSort": 2,
                                "isEnabled": 1
                            },
                            {
                                "fieldValueId": 573,
                                "fieldValue": "WARNING: Additional security devices shall always be fastened.",
                                "exclusionFieldValueIds": null,
                                "mappingPaths": [
                                    {
                                        "fieldValueIds": [
                                            568
                                        ]
                                    }
                                ],
                                "valueSort": 3,
                                "isEnabled": 1
                            }
                        ]
                    }
                ]
            }
        }
    ],
    "bbl": null,
    "traceId": "9e4e9684a292562f"
}
```

---

## Query the binding status of SKC warning language

> **Official docs**: [Query the binding status of SKC warning language](https://open.sheincorp.com/documents/apidoc/detail/3001577)

**Method**: `POST` &nbsp; **Path**: `/goods-compliance/query-skc-warning-status`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `certificateTypeCodes` | string[] | Yes | Certificate type code list，up to 20（Currently warning certificates are less than 20）。 |
| `pageNum` | integer | Yes | Page number |
| `pageSize` | integer | Yes | Number per page，up to 200 |
| `reviewStates` | integer[] | No | Review status。0=Not submitted for review;1=Pending review;2=Review successful;3=Review rejected |
| `skcNames` | string[] | No | SKC platform code, up to 200 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `data` | object[] | No |
| `skcName` | string | No |
| `items` | object[] | No |
| `certificateTypeCode` | string | No |
| `certificateTypeName` | string | No |
| `certificateTypeId` | integer | No |
| `complianceGroupCode` | string | No |
| `reviewState` | integer | No |
| `isRequired` | integer | No |
| `meta` | object | No |
| `count` | integer | No |
| `customObj` | json | No |
| `bbl` | json | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'http://openapi-test01.sheincorp.cn/open-api/goods-compliance/query-skc-warning-status' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1768984801196' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
  "certificateTypeCodes": [
  "PlaypenWMWAttr",
  "PWarningAttr",
  "111111",
  "BallWarnings",
  "FPWarningAttr",
  "Tem1",
  "SWarningAttr",
  "BCSWarningAttr",
  "EuToyWarnings",
  "cathymuban1",
  "ToyWarningWord",
  "WSWarningAttr",
  "BabyBathPWAttr",
  "InfanBedWMWAttr",
  "BabyRockerWAttr",
  "FCWarningAttr",
  "HCWarningAttr"
]
,
  "pageNum": 1,
  "pageSize": 10,
  "reviewStates": null,
  "skcNames": [
    "s24102107079376"
  ]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "data": [
            {
                "skcName": "s24102107079376",
                "items": [
                    {
                        "certificateTypeCode": "WSWarningAttr",
                        "certificateTypeName": "婴儿安全门栏警告语-属性",
                        "certificateTypeId": 677,
                        "complianceGroupCode": "HGXXL",
                        "reviewState": 0,
                        "isRequired": 1
                    },
                    {
                        "certificateTypeCode": "FCWarningAttr",
                        "certificateTypeName": "婴儿背带警告语-属性",
                        "certificateTypeId": 667,
                        "complianceGroupCode": "HGXXL",
                        "reviewState": 1,
                        "isRequired": 1
                    },
                    {
                        "certificateTypeCode": "SWarningAttr",
                        "certificateTypeName": "婴儿车警告语-属性",
                        "certificateTypeId": 671,
                        "complianceGroupCode": "HGXXL",
                        "reviewState": 1,
                        "isRequired": 1
                    },
                    {
                        "certificateTypeCode": "PWarningAttr",
                        "certificateTypeName": "安抚奶嘴及配件警告语-属性",
                        "certificateTypeId": 666,
                        "complianceGroupCode": "HGXXL",
                        "reviewState": 0,
                        "isRequired": 1
                    },
                    {
                        "certificateTypeCode": "EuToyWarnings",
                        "certificateTypeName": "欧盟玩具安全指令",
                        "certificateTypeId": 396,
                        "complianceGroupCode": "HGXXL",
                        "reviewState": 0,
                        "isRequired": 1
                    },
                    {
                        "certificateTypeCode": "FPWarningAttr",
                        "certificateTypeName": "母婴喂养用品警告语-属性",
                        "certificateTypeId": 665,
                        "complianceGroupCode": "HGXXL",
                        "reviewState": 0,
                        "isRequired": 1
                    },
                    {
                        "certificateTypeCode": "BallWarnings",
                        "certificateTypeName": "气球警告语",
                        "certificateTypeId": 537,
                        "complianceGroupCode": "HGXXL",
                        "reviewState": 0,
                        "isRequired": 1
                    },
                    {
                        "certificateTypeCode": "ToyWarningWord",
                        "certificateTypeName": "玩具窒息危险警告语",
                        "certificateTypeId": 340,
                        "complianceGroupCode": "HGXXL",
                        "reviewState": 0,
                        "isRequired": 1
                    },
                    {
                        "certificateTypeCode": "BCSWarningAttr",
                        "certificateTypeName": "自行车儿童座椅警告语-属性",
                        "certificateTypeId": 675,
                        "complianceGroupCode": "HGXXL",
                        "reviewState": 0,
                        "isRequired": 1
                    },
                    {
                        "certificateTypeCode": "HCWarningAttr",
                        "certificateTypeName": "高脚椅警告语-属性",
                        "certificateTypeId": 669,
                        "complianceGroupCode": "HGXXL",
                        "reviewState": 0,
                        "isRequired": 1
                    }
                ]
            }
        ],
        "meta": {
            "count": 1,
            "customObj": null
        }
    },
    "bbl": null,
    "traceId": "f436fe15a8c3aa20"
}
```

---

## Update SKC warning text

> **Official docs**: [Update SKC warning text](https://open.sheincorp.com/documents/apidoc/detail/3001578)

**Method**: `POST` &nbsp; **Path**: `/goods-compliance/update-skc-warning-certificate`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `certificateTypeCode` | string | Yes | Certificate type code |
| `fieldList` | object[] | Yes | Certificate field information |
| `fieldCode` | string | Yes | Certificate field code. Both regular fields and warning text fields need to be input. For specific input methods, please refer to Solution. |
| `fieldValues` | object[] | Yes | Field value list |
| `fieldValueId` | int64 | Yes | Field value ID |
| `skcNames` | string[] | Yes | SKC platform code, supports batch operations, up to 100 at a time。 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | Yes |
| `successList` | object[] | Yes |
| `skcName` | string | No |
| `failedList` | object[] | Yes |
| `skcName` | string | No |
| `code` | string | No |
| `reason` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'http://openapi-test01.sheincorp.cn/open-api/goods-compliance/update-skc-warning-certificate' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1768893109357' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
  "certificateTypeCode": "PlaypenWMWAttr",
  "fieldList": [
    {
      "fieldCode": "PAWA1",
      "fieldValues": [
        {
          "fieldValueId": 2458
        }    
      ]
    },
    {
      "fieldCode": "WAContent",
      "fieldValues": [
        {
          "fieldValueId": 2457
        },
        {
          "fieldValueId": 2456
        }        
      ]
    } 
  ],
  "skcNames": [
    "s24102107079376"
  ]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "successList": [
            {
                "skcName": "s24102107079376"
            }
        ],
        "failedList": []
    },
    "bbl": null,
    "traceId": "88770fbb0ca32a25"
}
```

---
