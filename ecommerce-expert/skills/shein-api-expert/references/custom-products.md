# SHEIN Open API — Custom Products API (定制商品)

Custom product data, production templates, composite tasks, and add-to-cart structure for personalized goods.

## Table of Contents

- [Get Custom Product Data](#Get Custom Product Data)
- [Create Production Template Task](#Create Production Template Task)
- [Get Template Data](#Get Template Data)
- [Query Task Result](#Query Task Result)
- [Query Add-to-Cart Structure Information](#query-add-to-cart-structure-information)

---

## Get Custom Product Data

> **Official docs**: [Get Custom Product Data](https://open.sheincorp.com/documents/apidoc/detail/3001668)

**Method**: `GET` &nbsp; **Path**: `/ccst/v1/custom-infos`

**Applicable to**: Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `customInfoId` | string | Yes | Unique identifier for user-customized information |
| `lang` | string | Yes | 语种输入，影响label字段的语种输出；枚举：英语(美国) en_US , 德语 de_DE , 法语 fr_FR , 葡萄牙语(巴西) pt_BR , 西班牙语 es_ES , 日语 ja_JP , 意大利语 it_IT , 荷兰语 nl_NL , 繁体中文 zh_TW , 简体中文 zh_CN , 希伯来语(以色列) he_IL , 俄语 ru_RU , 阿拉伯语 ar_AR , 泰语 th_TH , 印度尼西亚语 id_ID , 土耳其语 tr_TR , 越南语 vi_VI , 瑞典... |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `data` | object | No |
| `customInfo` | object | No |
| `preview` | object | No |
| `effects` | string[] | No |
| `images` | string[] | No |
| `texts` | string[] | No |
| `stores` | object[] | No |
| `id` | string | No |
| `key` | string | No |
| `label` | string | No |
| `moduleType` | string | No |
| `propertyName` | string | No |
| `type` | string | No |
| `value` | object | No |
| `customizerId` | string | No |
| `customizerVersion` | int64 | No |
| `id` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi-test01.sheincorp.cn/open-api/ccst/v1/custom-infos?customInfoId=58d3dcb1f269463da29dc4a2957cd7a7&lang=zh_CN' \
--header 'x-lt-signature: test0MTQ2NzM3ZDI4ZTJkODU2YzAzMTEyMjc4ZjY3YTFiYzZkZWJiNDk2NGMyOWRhMTNkNzM1YTFjYWU0MGY5YjYxOA==' \
--header 'x-lt-openKeyId: 20553A76716A4299AC612C62FFEDBBF4' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1730379652833' \
--header 'Cookie: gmp_trace=46b216bcb5c344a4858282b25df07984; gsp_trace=7a3f50b4b35b4914b6775c286e10787a; pfmp_trace=0faf1c0b77d549fab42a2243ac81a6c9' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "data": {
        "id": "58d3dcb1f269463da29dc4a2957cd7a7",
        "customInfo": {
            "preview": {
                "effects": [
                    "https://imgdeal-test01.shein.com/images3_ccc/2024/10/31/d7/17303796092517292289.webp"
                ],
                "images": [
                    "https://imgdeal-test01.shein.com/images3_ccc/2024/10/31/17/17303795945296602.webp"
                ],
                "texts": [
                    "123113"
                ]
            },
            "stores": [
                {
                    "id": "738329",
                    "key": "image",
                    "label": "2D 预览",
                    "moduleType": "preview",
                    "propertyName": "2d-preview",
                    "type": "image",
                    "value": "https://imgdeal-test01.shein.com/images3_ccc/2024/10/31/d7/17303796092517292289.webp"
                },
                {
                    "id": "345989",
                    "key": "face",
                    "label": "图片上传",
                    "moduleType": "photo_upload",
                    "propertyName": "photo-upload",
                    "type": "faceattr[]",
                    "value": []
                },
                {
                    "id": "345989",
                    "key": "source",
                    "label": "图片上传",
                    "moduleType": "photo_upload",
                    "propertyName": "photo-upload",
                    "type": "image[]",
                    "value": [
                        "https://imgdeal-test01.shein.com/images3_ccc/2024/10/31/17/17303795945296602.webp"
                    ]
                },
                {
                    "id": "345989",
                    "key": "value",
                    "label": "图片上传",
                    "moduleType": "photo_upload",
                    "propertyName": "photo-upload",
                    "type": "image[]",
                    "value": [
                        "https://imgdeal-test01.shein.com/images3_ccc/2024/10/31/17/17303795945296602.webp"
                    ]
                },
                {
                    "id": "749240",
                    "key": "value",
                    "label": "文本输入框",
                    "moduleType": "text",
                    "propertyName": "text",
                    "type": "string",
                    "value": "123113"
                }
            ]
        }
    },
    "traceId": "21538f8b133b7745"
}
```

---

## Create Production Template Task

> **Official docs**: [Create Production Template Task](https://open.sheincorp.com/documents/apidoc/detail/3001672)

**Method**: `POST` &nbsp; **Path**: `/ccst/v1/composite/task`

**Applicable to**: Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `compositeId` | string | Yes | The order template ID is used to synthesize production images |
| `customInfoId` | string | Yes | Customized data ID, the unique identifier of user-customized data |
| `needUpdate` | boolean | No | Whether to use the updated compositeId, if true is passed, the latest value is returned, if false is passed, the value when the user added to the cart is returned. Default is false. |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `data` | object | No |
| `id` | string | Yes |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/ccst/v1/composite/task' \
--header 'x-lt-signature: test0YmYwNzJjNTEwODcyY2EwMTYxNWNlOTQ1NDI2ZDIyZTJiOWI3NjMzNGU2NWRiNGVjMDA0NTU4ODgxZTU2ODZmMw==' \
--header 'x-lt-openKeyId: 20553A76716A4299AC612C62FFEDBBF4' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1730379935947' \
--header 'Cookie: gmp_trace=46b216bcb5c344a4858282b25df07984; gsp_trace=7a3f50b4b35b4914b6775c286e10787a; pfmp_trace=0faf1c0b77d549fab42a2243ac81a6c9' \
--data-raw '{
  "customInfoId":"58d3dcb1f269463da29dc4a2957cd7a7",
  "compositeId":738329
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "data": {
        "id": "2559732325967204352"
    },
    "traceId": "b2380962c514ebe0"
}
```

---

## Get Template Data

> **Official docs**: [Get Template Data](https://open.sheincorp.com/documents/apidoc/detail/3001670)

**Method**: `GET` &nbsp; **Path**: `/ccst/v1/custom-info/templates`

**Applicable to**: Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `customInfoId` | string | Yes | Customized data ID, obtained from purchase order information |
| `needUpdate` | string | No | Do you want to use the updated value, if true is passed, it returns the latest value, if false is passed, it returns the value when the user added to the cart。Default is false。 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `data` | object | No |
| `customInfoId` | string | No |
| `template` | object[] | No |
| `compositeId` | string | Yes |
| `title` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi-test01.sheincorp.cn/open-api/ccst/v1/custom-info/templates?customInfoId=58d3dcb1f269463da29dc4a2957cd7a7' \
--header 'x-lt-signature: test0MTlhM2I3NmE5NTQwZjYyNjRhNmJiYWJjMGRkN2U3ZmZkNGVjODFiMzY5ZWYwZGE1ZDMyMzgzZTcwNmZkNTMwMw==' \
--header 'x-lt-openKeyId: 20553A76716A4299AC612C62FFEDBBF4' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1730379827105' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "data": {
        "customInfoId": "58d3dcb1f269463da29dc4a2957cd7a7",
        "template": [
            {
                "title": "jing测试(1)",
                "compositeId": "738329"
            }
        ]
    },
    "traceId": "87aaa3af324c707a"
}
```

---

## Query Task Result

> **Official docs**: [Query Task Result](https://open.sheincorp.com/documents/apidoc/detail/3001671)

**Method**: `GET` &nbsp; **Path**: `/ccst/v1/composite/queryTask`

**Applicable to**: Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Get id from endpoint /ccst/openapi/v1/composite/task |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | No |
| `data` | object | No |
| `compositeId` | string | Yes |
| `customInfoId` | string | Yes |
| `failedReason` | string | No |
| `id` | string | Yes |
| `resources` | string[] | No |
| `status` | integer | Yes |

### Request Example

```bash
curl --location --request GET 'https://openapi-test01.sheincorp.cn/open-api/ccst/v1/composite/queryTask?id=2559732325967204352' \
--header 'x-lt-signature: test0MTA3ZDUxYmQzNzkzM2I4ODA3ZGVlY2Y1MmM0ZjhkODJlMTc4Nzk2MTk3ZjRlMzk5ZjRmNjU4MjAzYjU4OTlkOA==' \
--header 'x-lt-openKeyId: 20553A76716A4299AC612C62FFEDBBF4' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1730380016945' \
--header 'Cookie: gmp_trace=46b216bcb5c344a4858282b25df07984; gsp_trace=7a3f50b4b35b4914b6775c286e10787a; pfmp_trace=0faf1c0b77d549fab42a2243ac81a6c9' \
--data-raw '{
  "type": 2,
  "data": [
      {"orderNo":"J240319600007",
      "supplierSku":"b8d",
      "printNumber":"1"
      }
  ]
 
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "data": {
        "id": "2559732325967204352",
        "customInfoId": "58d3dcb1f269463da29dc4a2957cd7a7",
        "compositeId": "738329",
        "status": 2,
        "failedReason": "",
        "resources": [
            "http://filetest.ltwebstatic.com/filetest/2024/10/31/a1/17303799381799911581.png"
        ]
    },
    "traceId": "5c56bc7b2e5af064"
}
```

---

## Query Add-to-Cart Structure Information

> **Official docs**: [Query Add-to-Cart Structure Information](https://open.sheincorp.com/documents/apidoc/detail/3001665)

**Method**: `POST` &nbsp; **Path**: `/ccst/v1/custom-info/queryAddCartInfo`

**Applicable to**: Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `customId` | string | Yes | Custom build ID |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | No |
| `data` | object | No |
| `customInfo` | object | No |
| `preview` | object | No |
| `effects` | string | No |
| `images` | string[] | No |
| `texts` | string[] | No |
| `stores` | object[] | No |
| `id` | string | No |
| `key` | string | No |
| `label` | string | No |
| `moduleType` | string | No |
| `propertyName` | string | No |
| `type` | string | No |
| `value` | object | No |
| `customizerId` | string | No |
| `customizerVersion` | int64 | No |
| `id` | string | No |

---
