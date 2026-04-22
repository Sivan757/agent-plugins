# SHEIN Open API — Fabric API

Supplier fabric inventory management — inbound/outbound sync, quality inspection, order shipping, and quick supply.

## Table of Contents

- [Supplier inventory-inbound synchronization interface](#supplier-inventory-inbound-synchronization-interface)
- [Supplier inventory-outbound synchronization interface](#supplier-inventory-outbound-synchronization-interface)
- [Supplier Quality Inspection - Cloth Inspection Report](#supplier-quality-inspection---cloth-inspection-report)
- [Supplier Order - Shipping Information](#supplier-order---shipping-information)
- [Supplier Inventory - Inventory Synchronization Interface](#supplier-inventory---inventory-synchronization-interface)
- [Initiate quick supply task](#initiate-quick-supply-task)

---

## Supplier inventory-inbound synchronization interface

> **Official docs**: [Supplier inventory-inbound synchronization interface](https://open.sheincorp.com/documents/apidoc/detail/3000493)

**Method**: `POST` &nbsp; **Path**: `/material/in-inventory`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `supplierMaterialName` | string | No | Supplier material name |
| `materialCode` | string | Yes | System docking material coding |
| `materialColorCode` | string | No | Supplier material color number |
| `materialColorName` | string | No | Supplier material color |
| `width` | string | No | Door width (cm) |
| `weight` | string | No | Gram weight (g/m2) |
| `dyelotNumber` | string | Yes | Cylinder number |
| `numberCode` | string | Yes | Article number |
| `repertoryNum` | string | Yes | The quantity of this storage |
| `unit` | string | Yes | unit |
| `warehouseName` | string | Yes | warehouse name |
| `warehouseAddr` | string | Yes | Warehouse Address |
| `rfidCode` | string | No | RFID encoding |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

---

## Supplier inventory-outbound synchronization interface

> **Official docs**: [Supplier inventory-outbound synchronization interface](https://open.sheincorp.com/documents/apidoc/detail/3000489)

**Method**: `POST` &nbsp; **Path**: `/material/out-inventory`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `numberCode` | string | Yes | Bar code |
| `outNum` | string | Yes | The quantity shipped this time |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | Yes |
| `traceId` | string | No |

---

## Supplier Quality Inspection - Cloth Inspection Report

> **Official docs**: [Supplier Quality Inspection - Cloth Inspection Report](https://open.sheincorp.com/documents/apidoc/detail/3000492)

**Method**: `POST` &nbsp; **Path**: `/material/receive-cloth-report`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `acode` | string | Yes | Bar code |
| `sysDockMaterialCode` | string | Yes | System docking code |
| `practicalWidth` | decimal | Yes | Width |
| `practicalWeight` | decimal | Yes | Color difference |
| `chromaticAberration` | string | Yes | Color difference |
| `unit` | integer | Yes | unit |
| `num` | decimal | No | quantity |
| `points` | string | Yes | Point deduction for 100 square meters |
| `loss` | string | Yes | Deduction |
| `level` | string | No | grade |
| `result` | integer | Yes | Test results |
| `fileUrlList` | string[] | Yes | picture |
| `fileType` | integer | Yes | File type 0-picture (a single file supports a maximum of 30M), 1-PDF (a single file supports a maximum of 30M) |
| `qcBy` | string | Yes | cloth inspector |
| `qcTime` | string | Yes | 验布时间，时间格式：yyyy-MM-dd 例如：2020-09-01 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

---

## Supplier Order - Shipping Information

> **Official docs**: [Supplier Order - Shipping Information](https://open.sheincorp.com/documents/apidoc/detail/3000490)

**Method**: `POST` &nbsp; **Path**: `/material/sales-order-deliver-info`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `salesOrderList` | string[] | Yes | Sales order number |
| `deliverNo` | string | Yes | Shipment Number |
| `deliverStatus` | integer | Yes | Shipping status (1 shipped, 2 distribution completed, 3 distribution canceled) |
| `deliverDetail` | object[] | Yes | Shipping details |
| `clothNo` | string | Yes | Bar code |
| `tankNo` | string | Yes | Cylinder number |
| `num` | decimal | Yes | Quantity (excluding space difference) |
| `sysDockMaterialCode` | string | Yes | System docking code |
| `fullNum` | decimal | No | Shipping quantity (including space difference) |
| `unit` | string | No | Shipping unit (excluding air difference) |
| `fullUnit` | string | No | Shipping unit (including air difference) |
| `operateTime` | string | Yes | Operating time |
| `operateMan` | string | Yes | Operator |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `deliverNo` | string | No |
| `traceId` | string | No |

---

## Supplier Inventory - Inventory Synchronization Interface

> **Official docs**: [Supplier Inventory - Inventory Synchronization Interface](https://open.sheincorp.com/documents/apidoc/detail/3000491)

**Method**: `POST` &nbsp; **Path**: `/material/sync-inventory`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `supplierMaterialName` | string | No | Supplier material name |
| `materialCode` | string | Yes | System docking material coding |
| `materialColorCode` | string | No | Supplier material color number |
| `materialColorName` | string | No | Supplier material color |
| `width` | string | No | Door width (cm) |
| `weight` | string | No | Gram weight (g/m2) |
| `dyelotNumber` | string | Yes | Cylinder number |
| `numberCode` | string | Yes | Article number |
| `repertoryNum` | string | Yes | Stock quantity |
| `unit` | string | Yes | unit |
| `warehouseName` | string | Yes | warehouse name |
| `warehouseAddr` | string | Yes | Warehouse Address |
| `rfidCode` | string | No | RFID encoding |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

---

## Initiate quick supply task

> **Official docs**: [Initiate quick supply task](https://open.sheincorp.com/documents/apidoc/detail/3001378)

**Method**: `POST` &nbsp; **Path**: `/material/mesCreateAddSupp`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `factoryId` | string | Yes |  |
| `factory` | string | Yes |  |
| `produceOrderId` | integer | No |  |
| `orderNum` | double | No |  |
| `materialSku` | string | Yes |  |
| `supplierCode` | string | Yes |  |
| `addTime` | string | Yes |  |
| `addSuppSource` | integer | No |  |
| `hasAudit` | string | No |  |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | Yes |
| `msg` | string | No |
| `info` | object | No |
| `id` | integer | No |
| `addSuppStatus` | integer | No |

---
