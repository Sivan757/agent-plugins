# SHEIN Open API — Inventory and Sales API

Warehouse management, stock queries, inventory modifications, and SKU sales data.

## Table of Contents

- [Merchant Warehouse List Query (Self-Operated and Semi-Managed Mode)](#merchant-warehouse-list-query-self-operated-and-semi-managed-mode)
- [Inventory inquiry](#inventory-inquiry)
- [Modify Inventory Interface (Self-Operated and Semi-Managed Mode)](#modify-inventory-interface-self-operated-and-semi-managed-mode)
- [Inventory Update for “SHEIN-Owned” and “Agency Operation” mode](#inventory-update-for-“shein-owned”-and-“agency-operation”-mode)
- [Search sales by SKU](#search-sales-by-sku)

---

## Merchant Warehouse List Query (Self-Operated and Semi-Managed Mode)

> **Official docs**: [Merchant Warehouse List Query (Self-Operated and Semi-Managed Mode)](https://open.sheincorp.com/documents/apidoc/detail/3001301)

**Method**: `GET` &nbsp; **Path**: `/msc/warehouse/list`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

_No additional request parameters._

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `list` | object[] | Yes |
| `saleCountryList` | string[] | Yes |
| `warehouseCode` | string | Yes |
| `warehouseName` | string | Yes |
| `warehouseType` | string | Yes |
| `authServiceCode` | string | No |
| `authServiceName` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.com/open-api/msc/warehouse/list' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570729613' \
--data-raw ''
```

### Response Example

```json
{
  "code": "0",
  "msg": "OK",
  "info": {
    "list": [
      {
        "warehouseCode": "PS0426919682",
        "warehouseName": "Girona Warehouse",
        "saleCountryList": [
          "FR",
          "ES",
          "IT",
          "NL",
          "PL"
        ],
        "createType": 3,
        "warehouseType": 1,
        "authServiceCode": "",
        "authServiceName": ""
      },
      {
        "warehouseCode": "PS1993127180",
        "warehouseName": "EU Warehouse",
        "saleCountryList": [
          "DE",
          "FR",
          "ES",
          "IT",
          "NL",
          "PL"
        ],
        "createType": 3,
        "warehouseType": 1,
        "authServiceCode": "",
        "authServiceName": ""
      },
      {
        "warehouseCode": "PS8428226538",
        "warehouseName": "英国",
        "saleCountryList": [
          "GB"
        ],
        "createType": 1,
        "warehouseType": 1,
        "authServiceCode": "",
        "authServiceName": ""
      }
    ]
  },
  "bbl": null,
  "traceId": "38090e8ea1bc33fa"
}
```

---

## Inventory inquiry

> **Official docs**: [Inventory inquiry](https://open.sheincorp.com/documents/apidoc/detail/3001302)

**Method**: `POST` &nbsp; **Path**: `/stock/stock-query`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skuCodeList` | string[] | No | SHEIN generate SKU, transmit with up to 100 items, skuCodeList/skcNameList/spuNameList, make sure only one of the three parameters is not empty; |
| `skcNameList` | string[] | No | SHEIN generate SKC, skuCodeList/skcNameList/spuNameList, make sure only one of the three parameters is not empty; |
| `spuNameList` | string[] | No | SHEIN generate SPU, skuCodeList/skcNameList/spuNameList, make sure only one of the three parameters is not empty; |
| `warehouseType` | string | Yes | Warehouse type; 1: Check preparation for SHEIN warehouse stock / 2: Check virtual stock for semi-managed, self-operated model / 3: Check virtual stock for subcontracted (fully managed), SHEIN-operated model |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `goodsInventory` | object[] | Yes |
| `skcName` | string | Yes |
| `spuName` | string | Yes |
| `skuList` | object[] | Yes |
| `skuCode` | string | Yes |
| `totalInventoryQuantity` | integer | Yes |
| `totalLockedQuantity` | integer | Yes |
| `totalTempLockQuantity` | integer | Yes |
| `totalUsableInventory` | integer | Yes |
| `totalOutOfStockQty` | integer | No |
| `totalTransitQuantity` | integer | No |
| `warehouseInventoryList` | object[] | Yes |
| `inventoryQuantity` | integer | Yes |
| `lockedQuantity` | integer | Yes |
| `tempLockQuantity` | integer | Yes |
| `usableInventory` | integer | Yes |
| `outOfStockQty` | string | No |
| `warehouseCode` | string | Yes |
| `warehouseType` | string | Yes |
| `transitQuantity` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/stock/stock-query' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570817402' \
--data-raw '{
    "skuCodeList": ["I1omh30jb5ld"],
    "warehouseType": 2
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": [
        {
            "goodsInventory": [
                {
                    "spuName": "MM2402234440",
                    "skcName": "sMM24022344403001",
                    "skuList": [
                        {
                            "skuCode": "I1omh30jb5ld",
                            "totalInventoryQuantity": 999,
                            "totalLockedQuantity": 2,
                            "totalUsableInventory": 997,
                            "totalTempLockQuantity": 0,
                            "warehouseInventoryList": [
                                {
                                    "warehouseCode": "PS0618098174",
                                    "warehouseType": "2",
                                    "inventoryQuantity": 999,
                                    "lockedQuantity": 2,
                                    "usableInventory": 997,
                                    "tempLockQuantity": 0
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "bbl": null
}
```

---

## Modify Inventory Interface (Self-Operated and Semi-Managed Mode)

> **Official docs**: [Modify Inventory Interface (Self-Operated and Semi-Managed Mode)](https://open.sheincorp.com/documents/apidoc/detail/3001543)

**Method**: `POST` &nbsp; **Path**: `/gsp/goods/change-inventory`

**Applicable to**: Self-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `updateSkuInventoryQuantityRequests` | object[] | Yes | A single API call can transmit up to 100 SKUs. If the number of products requiring stock modification exceeds 100, developers need to make multiple API calls |
| `changeInventoryQuantity` | integer | No | Total inventory of the product; changeInventoryQuantity and saleInventory are required inputs, and only one can be filled; |
| `skuCode` | string | Yes | SKUs generated by SHEIN platform, only approved SKUs can modify inventory; failed SKUs are not available |
| `warehouseCode` | string | No | Warehouse ID, mandatory if the store has multiple warehouses. Can be viewed through the Seller Warehouse List Query API |
| `saleInventory` | integer | No | Update saleable inventory; saleable inventory=available inventory+temporary lock inventory (order not paid); changeInventoryQuantity and saleInventory are required inputs, and only one can be filled; |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | No |
| `info` | object | No |
| `failedList` | object[] | No |
| `code` | string | No |
| `reason` | string | No |
| `skuCode` | string | No |
| `successList` | object[] | No |
| `skuCode` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/gsp/goods/change-inventory' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570817402' \
--data-raw '{
  "updateSkuInventoryQuantityRequests": [

    {
      "changeInventoryQuantity": 66,
      "skuCode": "I569gfcaeopb",
      "warehouseCode": "PS30720142"
    },

    {
      "changeInventoryQuantity": 66,
      "skuCode": "I91iicgnj561",
      "warehouseCode": "PS56328250"
    },

    {
      "changeInventoryQuantity": 66,
      "skuCode": "mike gu test",
      "warehouseCode": "PS30720142"
    },

    {
      "changeInventoryQuantity": 5,
      "skuCode": "I33sb3sdgytd1",
      "warehouseCode": "PS6039317316"
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
                "skuCode": "I569gfcaeopb",
                "reason": null,
                "code": null
            }
        ],
        "failedList": [
            {
                "skuCode": "I91iicgnj561",
                "reason": "商家仓库未匹配到--SKC非当前商家所属",
                "code": "msc-update-stock-001"
            },
            {
                "skuCode": "mike gu test",
                "reason": "商品SKU不存在--SKC非当前商家所属",
                "code": "msc-update-stock-004"
            },
            {
                "skuCode": "I33sb3sdgytd1",
                "reason": "商家仓库未匹配到--商品SKU不存在--SKC非当前商家所属",
                "code": "msc-update-stock-001"
            }
        ]
    },
    "bbl": null,
    "traceId": "f1c83bbd7037613e"
}
```

---

## Inventory Update for “SHEIN-Owned” and “Agency Operation” mode

> **Official docs**: [Inventory Update for “SHEIN-Owned” and “Agency Operation” mode](https://open.sheincorp.com/documents/apidoc/detail/3001304)

**Method**: `POST` &nbsp; **Path**: `/goods/stock-update`

**Applicable to**: Fully-managed, Shein-operated, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `stock` | object[] | Yes | Inventory entry and exit information: the number of records at a time shall not exceed 200 |
| `skc` | string | Yes | SKC generated by SHEIN platform, equivalent to skc_name in product publishing |
| `shein_sku` | string | Yes | SKU generated by SHEIN platform, equivalent to skucode in product publishing |
| `remark` | string | No | Note: Do not exceed 100 characters |
| `available_number` | string | Yes | Actual Stock Quantity; |
| `stock_type` | string | Yes | Default pass 3, full cover |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |
| `info` | object | Yes |
| `batch_number` | string | No |
| `fail_number` | integer | No |
| `fail_list` | object[] | No |
| `stock_type` | integer | No |
| `sku` | string | No |
| `skc` | string | No |
| `shein_sku` | string | No |
| `attribute` | string | No |
| `access_number` | integer | No |
| `remark` | string | No |
| `fail_code` | string | No |
| `fail_msg` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/stock-update' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570817402' \
--data-raw '{
	"stock": [{
		"stock_type": 3,
		"skc": "sx2410224003123100",
		"shein_sku": "I83ty0f2d502",
		"available_number": 18
	}, {
		"stock_type": 3,
		"skc": "sx2410224003123100",
		"shein_sku": "I83ty0f2h5hc",
		"available_number": 16
	}, {
		"stock_type": 3,
		"skc": "sx2410224003123100",
		"shein_sku": "I83ty0f2ks18",
		"available_number": 7
	}, {
		"stock_type": 3,
		"skc": "sx2410224003123100",
		"shein_sku": "I83ty0f2o8d4",
		"available_number": 0
	}{
		"stock_type": 3,
		"skc": "sx2410220100534309",
		"shein_sku": "I83txx7ku2my",
		"available_number": 12
	}, {
		"stock_type": 3,
		"skc": "sx2410220100534309",
		"shein_sku": "I83txx7kyffc",
		"available_number": 8
	}, {
		"stock_type": 3,
		"skc": "sx2410220100534309",
		"shein_sku": "I83txx7l2vdw",
		"available_number": 1
	}, {
		"stock_type": 3,
		"skc": "sx2410220100534309",
		"shein_sku": "I83txx7l6a2o",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410221254070290",
		"shein_sku": "I23txvm9lzi4",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410221254070290",
		"shein_sku": "I23txvm9qgsn",
		"available_number": 4
	}, {
		"stock_type": 3,
		"skc": "sx2410221254070290",
		"shein_sku": "I23txvm96qgl",
		"available_number": 12
	}, {
		"stock_type": 3,
		"skc": "sx2410221254070290",
		"shein_sku": "I23txvm9aryk",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410221254070290",
		"shein_sku": "I23txvm9emg9",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410221254070290",
		"shein_sku": "I23txvm9i56p",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410221254034919",
		"shein_sku": "I23txvmbfoe9",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410221254034919",
		"shein_sku": "I23txvmbjrjf",
		"available_number": 4
	}, {
		"stock_type": 3,
		"skc": "sx2410221254034919",
		"shein_sku": "I23txvmavt8m",
		"available_number": 12
	}, {
		"stock_type": 3,
		"skc": "sx2410221254034919",
		"shein_sku": "I23txvmb0jj8",
		"available_number": 6
	}, {
		"stock_type": 3,
		"skc": "sx2410221254034919",
		"shein_sku": "I23txvmb4qxl",
		"available_number": 4
	}, {
		"stock_type": 3,
		"skc": "sx2410221254034919",
		"shein_sku": "I23txvmbarhr",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410221254011559",
		"shein_sku": "I23txvmd3fup",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410221254011559",
		"shein_sku": "I23txvmd7gcl",
		"available_number": 1
	}, {
		"stock_type": 3,
		"skc": "sx2410221254011559",
		"shein_sku": "I23txvmcj05d",
		"available_number": 1
	}, {
		"stock_type": 3,
		"skc": "sx2410221254011559",
		"shein_sku": "I23txvmcnkfh",
		"available_number": 6
	}, {
		"stock_type": 3,
		"skc": "sx2410221254011559",
		"shein_sku": "I23txvmcsr69",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410221254011559",
		"shein_sku": "I23txvmcymd2",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410221254075505",
		"shein_sku": "I23txvmdzc81",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410222799301842",
		"shein_sku": "I13xg8k2fsea",
		"available_number": 8
	}, {
		"stock_type": 3,
		"skc": "sx2410222799301842",
		"shein_sku": "I13xg8k2ldy1",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410222799301842",
		"shein_sku": "I13xg8k2rs9p",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410222799336681",
		"shein_sku": "I13xg8k3t5tr",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410222799343532",
		"shein_sku": "I13xg8k4nh8r",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410222799346161",
		"shein_sku": "I13xg8k5q5cc",
		"available_number": 1
	}, {
		"stock_type": 3,
		"skc": "sx2410222799346161",
		"shein_sku": "I13xg8k5uf66",
		"available_number": 7
	}, {
		"stock_type": 3,
		"skc": "sx2410222799346161",
		"shein_sku": "I13xg8k55pi5",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410222799346161",
		"shein_sku": "I13xg8k5a7ge",
		"available_number": 12
	}, {
		"stock_type": 3,
		"skc": "sx2410222799346161",
		"shein_sku": "I13xg8k5ezw6",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410222799346161",
		"shein_sku": "I13xg8k5kavv",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410222799344440",
		"shein_sku": "I13xg8k6krmx",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410222799344440",
		"shein_sku": "I13xg8k6orhm",
		"available_number": 8
	}, {
		"stock_type": 3,
		"skc": "sx2410222799344440",
		"shein_sku": "I13xg8k64fmt",
		"available_number": 10
	}, {
		"stock_type": 3,
		"skc": "sx2410222799344440",
		"shein_sku": "I13xg8k67yqg",
		"available_number": 8
	}, {
		"stock_type": 3,
		"skc": "sx2410222799344440",
		"shein_sku": "I13xg8k6dudg",
		"available_number": 5
	}, {
		"stock_type": 3,
		"skc": "sx2410222799344440",
		"shein_sku": "I13xg8k6hoxy",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410235191171176",
		"shein_sku": "I33ulkf11oph",
		"available_number": 1
	}, {
		"stock_type": 3,
		"skc": "sx2410235191171176",
		"shein_sku": "I33ulkf16pez",
		"available_number": 25
	}, {
		"stock_type": 3,
		"skc": "sx2410235191171176",
		"shein_sku": "I33ulkf0g2bc",
		"available_number": 42
	}, {
		"stock_type": 3,
		"skc": "sx2410235191171176",
		"shein_sku": "I33ulkf0mf9t",
		"available_number": 48
	}, {
		"stock_type": 3,
		"skc": "sx2410235191171176",
		"shein_sku": "I33ulkf0qyki",
		"available_number": 9
	}, {
		"stock_type": 3,
		"skc": "sx2410235191171176",
		"shein_sku": "I33ulkf0w10s",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410235191116114",
		"shein_sku": "I33ulkf27799",
		"available_number": 0
	}, {
		"stock_type": 3,
		"skc": "sx2410235191116114",
		"shein_sku": "I33ulkf2dwfz",
		"available_number": 4
	}, {
		"stock_type": 3,
		"skc": "sx2410235191116114",
		"shein_sku": "I33ulkf1fsuw",
		"available_number": 8
	}, {
		"stock_type": 3,
		"skc": "sx2410235191164731",
		"shein_sku": "I33ulkf49jar",
		"available_number": 0
	}]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "batch_number": "202412251833184",
        "fail_num": 0,
        "fail_list": [

        ]
    },
    "bbl": null,
    "traceId": "185259a2759646b2"
}
```

---

## Search sales by SKU

> **Official docs**: [Search sales by SKU](https://open.sheincorp.com/documents/apidoc/detail/3001305)

**Method**: `POST` &nbsp; **Path**: `/goods/query-sku-sales`

**Applicable to**: Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skuCodeList` | string[] | Yes | skuCode, you can upload a maximum of 100 skuCodes |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `dataList` | object[] | Yes |
| `c30dSaleCnt` | integer | Yes |
| `c7dSaleCnt` | integer | Yes |
| `cydSaleCnt` | integer | Yes |
| `dt` | string | Yes |
| `skuCode` | string | Yes |
| `realTimeSaleCnt` | integer | Yes |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/query-sku-sales' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'Content-Type: application/json;charset=UTF-8' \
--header 'x-lt-timestamp: 1752570849017' \
--data-raw '{
"skuCodeList":["I6il0w9szgmx"]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "dataList": [
            {
                "skuCode": "I46u675r42l4",
                "realTimeSaleCnt": 0,
                "c7dSaleCnt": 0,
                "c30dSaleCnt": 0,
                "dt": ""
            }
        ]
    },
    "bbl": null,
    "traceId": "fe801921785899e"
}
```

---
