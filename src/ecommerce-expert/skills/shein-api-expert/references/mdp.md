# SHEIN Open API — MDP Service API

Manufacturing data platform — bulk orders, print tasks, transfer tasks, customer requirements, and external ERP integration.

## Table of Contents

- [Get bulk order](#get-bulk-order)
- [Provides updated MDP print job start](#provides-updated-mdp-print-job-start)
- [Provide updated MDP print task completion](#provide-updated-mdp-print-task-completion)
- [Provide scanning for production scheduling to create waves](#provide-scanning-for-production-scheduling-to-create-waves)
- [Provide update for MDP transfer task start](#provide-update-for-mdp-transfer-task-start)
- [Provide update for MDP transfer task end](#provide-update-for-mdp-transfer-task-end)
- [Create customer requirements pending completion review](#create-customer-requirements-pending-completion-review)
- [Get customer information based on printing factory code](#get-customer-information-based-on-printing-factory-code)
- [Get available printing factories based on name](#get-available-printing-factories-based-on-name)
- [Call for external suppliers - Re-record order meters and cut pieces](#call-for-external-suppliers---re-record-order-meters-and-cut-pieces)
- [Call for external suppliers - Synchronize order information (status, shipment)](#call-for-external-suppliers---synchronize-order-information-status,-shipment)
- [WeChat Mini Program login](#wechat-mini-program-login)
- [Hanging Card Aggregation Operations (Shelving/Outbound/Relocation)](#挂卡聚合操作上架or出库or移位)
- [Add or update card hanging information](#add-or-update-card-hanging-information)
- [Get Printer Device List](#Get Printer Device List)
- [Add or cancel device exception](#add-or-cancel-device-exception)
- [Receive external ERP completed orders](#receive-external-erp-completed-orders)
- [Provide external ERP material task query interface](#provide-external-erp-material-task-query-interface)
- [External query operation log (for applet call)](#external-query-operation-log-for-applet-call)
- [Provide external ERP flower pattern development pagination query interface](#provide-external-erp-flower-pattern-development-pagination-query-interface)

---

## Get bulk order

> **Official docs**: [Get bulk order](https://open.sheincorp.com/documents/apidoc/detail/3001429)

**Method**: `POST` &nbsp; **Path**: `/mdp/get-order-info-list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pageNum` | integer | Yes |  |
| `pageSize` | integer | Yes |  |
| `orderStatus` | integer | No | 1-In production; 2-Pre-production confirmation; 3-In printing; 4-In transfer; 5-In washing; 6-In burning; 7-Awaiting shipment; 8-Awaiting delivery; 9-Completed; 10-All; |
| `orderTimeStart` | string | Yes | Maximum time span of 30 days |
| `orderTimeEnd` | string | Yes | Maximum time span of 30 days |
| `prospectTimeStart` | string | No | 预计交期开始，时间跨度最大30天 |
| `prospectTimeEnd` | string | No | 预计交期结束 |
| `deliveryTimeStart` | string | No | Shipping time begins |
| `deliveryTimeEnd` | string | No | Delivery time has ended |
| `garmentConfirmTimeStart` | string | No | 成衣厂确认时间开始 |
| `garmentConfirmTimeEnd` | string | No | 成衣厂确认时间结束 |
| `latestSignforTimeStart` | string | No | Starting from the latest delivery date |
| `latestSignforTimeEnd` | string | No | 最晚签收日期结束 |
| `salesSource` | integer | No | 1 希音 2自建 |
| `orderSystemSource` | integer | No | 1 FOB 2 MDP 3 GMP |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `list` | object[] | No |
| `orderId` | string | No |
| `designStyle` | string | No |
| `processNo` | string | No |
| `hangTagCode` | string | No |
| `imageUrl` | string | No |
| `finalMaterialSku` | string | No |
| `finalMaterialName` | string | No |
| `originalMaterialSku` | string | No |
| `originalMaterialName` | string | No |
| `flowerCode` | string | No |
| `orderNum` | decimal | No |
| `orderPrice` | decimal | No |
| `orderSizeNum` | string | No |
| `isBurnFlower` | integer | No |
| `isPosition` | integer | No |
| `isFirstOrder` | integer | No |
| `firstReturnOrder` | integer | No |
| `isInvoice` | integer | No |
| `flameRetardant` | integer | No |
| `isHighRiskOrder` | integer | No |
| `isComplexStyle` | integer | No |
| `isFirstProcess` | integer | No |
| `isPushAgain` | integer | No |
| `isDeliveryExpired` | integer | No |
| `isSignSoonExpire` | integer | No |
| `isSignExpired` | integer | No |
| `width` | decimal | No |
| `weight` | decimal | No |
| `originalMaterialColor` | string | No |
| `recommendLocationCode` | string | No |
| `orderTime` | string | No |
| `garmentConfirmTime` | string | No |
| `targetDeliveryTime` | string | No |
| `latestProspectTime` | string | No |
| `confirmDeliveryTime` | string | No |
| `latestSignforTime` | string | No |
| `garmentFactory` | string | No |
| `flowerImage` | string | No |
| `hangCardNo` | string | No |
| `cargoLocationCode` | string | No |
| `printModelList` | string | No |
| `salesSource` | string | No |
| `orderSystemSource` | string | No |

---

## Provides updated MDP print job start

> **Official docs**: [Provides updated MDP print job start](https://open.sheincorp.com/documents/apidoc/detail/3001421)

**Method**: `POST` &nbsp; **Path**: `/mdp/product/print-task/begin`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | No | Processing number/exception number/production exception number |
| `designStyle` | string | Yes | Design number |
| `finalMaterialSku` | string | Yes | Product SKU |
| `userCode` | string | No | Operator's user code |
| `operateTime` | string | Yes | 操作时间必填 |
| `equipmentCode` | string | No | 设备编号 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |

---

## Provide updated MDP print task completion

> **Official docs**: [Provide updated MDP print task completion](https://open.sheincorp.com/documents/apidoc/detail/3001422)

**Method**: `POST` &nbsp; **Path**: `/mdp/product/print-task/finish`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | No | Processing number/exception number/production exception number |
| `designStyle` | string | No | 设计款号,orderNo为空时必填 |
| `finalMaterialSku` | string | No | 成品sku,orderNo为空时必填 |
| `actualPrintNum` | double | Yes | Actual print meter |
| `wasteNum` | double | No | Loss |
| `userCode` | string | No | Operator's user code |
| `operateTime` | string | Yes | Operating time |
| `equipmentCode` | string | No | 设备编号 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |

---

## Provide scanning for production scheduling to create waves

> **Official docs**: [Provide scanning for production scheduling to create waves](https://open.sheincorp.com/documents/apidoc/detail/3001420)

**Method**: `POST` &nbsp; **Path**: `/mdp/product/schedule/allocation-confirm`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNoList` | string | No | Processing number/exception number/production exception number |
| `userCode` | string | No | Operator's user code |
| `operateTime` | datetime | No | Operating time |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `productionTaskNoList` | string | No |

---

## Provide update for MDP transfer task start

> **Official docs**: [Provide update for MDP transfer task start](https://open.sheincorp.com/documents/apidoc/detail/3001419)

**Method**: `POST` &nbsp; **Path**: `/mdp/product/transfer-print-task/begin`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | Yes | Processing number/exception number/production exception number |
| `userCode` | string | No | Operator's user code |
| `operateTime` | string | Yes | Operation time, 2025-01-01 01:00:00 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |

---

## Provide update for MDP transfer task end

> **Official docs**: [Provide update for MDP transfer task end](https://open.sheincorp.com/documents/apidoc/detail/3001418)

**Method**: `POST` &nbsp; **Path**: `/mdp/product/transfer-print-task/finish`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNo` | string | Yes | Processing number/exception number/production exception number |
| `userCode` | string | No | Operator's user code |
| `operateTime` | string | Yes | Operation time, 2025-01-01 01:00:00 |
| `transferPrintNumList` | object | No | Actual transfer printing meters (mandatory if no post-finishing is required, not filled if post-finishing is required) |
| `actualPrintNum` | decimal | Yes | Transfer printing meters |
| `serialNo` | integer | Yes | Serial number |
| `tankNo` | string | No | Cylinder number |
| `wasteNum` | double | No | Loss, supports 2 decimal places |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `orderNo` | string | No |
| `barcodeList` | object | No |
| `barcode` | string | No |
| `num` | decimal | No |

---

## Create customer requirements pending completion review

> **Official docs**: [Create customer requirements pending completion review](https://open.sheincorp.com/documents/apidoc/detail/3001427)

**Method**: `POST` &nbsp; **Path**: `/mdp/order/customer-requirement/create-customer-requirement`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `customerCode` | string | Yes | 客户code |
| `customerRemark` | string | No | 客户备注,客户备注不能超过100个字符 |
| `factoryUserCode` | string | Yes | 印花厂管理员code |
| `orderPic` | string | No | 商品图片链接 |
| `produceOrderId` | string | Yes | Production order, limited to 50 characters, restricted to uppercase and lowercase letters and numbers |
| `saleNum` | double | No | 销售数量,数量最多8位整数，2位小数 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |

---

## Get customer information based on printing factory code

> **Official docs**: [Get customer information based on printing factory code](https://open.sheincorp.com/documents/apidoc/detail/3001426)

**Method**: `POST` &nbsp; **Path**: `/mdp/order/customer-requirement/get-factory-customer-list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `factoryUserCode` | string | Yes | Printing factory administrator code |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `detailMsg` | string | No |
| `info` | object | Yes |
| `list` | object | Yes |
| `customerCode` | string | No |
| `customerName` | string | No |
| `msg` | string | No |
| `time` | string | No |

---

## Get available printing factories based on name

> **Official docs**: [Get available printing factories based on name](https://open.sheincorp.com/documents/apidoc/detail/3001425)

**Method**: `POST` &nbsp; **Path**: `/mdp/order/customer-requirement/get-factory-list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `factoryName` | string | Yes | 印花工厂名称，左精确匹配 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `detailMsg` | string | No |
| `info` | object | Yes |
| `list` | object | Yes |
| `factoryName` | string | No |
| `factoryUserCode` | string | No |
| `msg` | string | No |
| `time` | string | No |

---

## Call for external suppliers - Re-record order meters and cut pieces

> **Official docs**: [Call for external suppliers - Re-record order meters and cut pieces](https://open.sheincorp.com/documents/apidoc/detail/3001424)

**Method**: `POST` &nbsp; **Path**: `/mdp/order/goods/reenter-order-info`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `bagInfoList` | object[] | No | Burning flower, bag information list, only required when burning flower pieces are cut |
| `sizeInfoList` | object[] | Yes | Size information |
| `quantity` | integer | Yes | Quantity,Burn detail actual quantity must be less than or equal to 999 |
| `size` | string | Yes | size |
| `operateTime` | string | Yes | operateTime |
| `orderNo` | string | Yes | Processing Number |
| `reenterType` | integer | Yes | Re-record type, 1, finished fabric, 2, burnt flower cut piece |
| `transferPrintList` | object[] | No | Transfer printing row count, only required when finished fabric |
| `num` | double | Yes | Transfer printing meter count, up to 3-digit integer, 2 decimal places |
| `serialNo` | integer | Yes | Transfer printing serial number |
| `userCode` | string | No | Operator's user code |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `info` | object | Yes |
| `bagInfoList` | object[] | No |
| `barCode` | string | No |
| `sizeInfoList` | object[] | Yes |
| `quantity` | integer | No |
| `size` | string | No |
| `orderNo` | string | No |
| `transferPrintList` | object[] | No |
| `clothGuid` | string | No |
| `num` | double | No |
| `msg` | string | No |

---

## Call for external suppliers - Synchronize order information (status, shipment)

> **Official docs**: [Call for external suppliers - Synchronize order information (status, shipment)](https://open.sheincorp.com/documents/apidoc/detail/3001467)

**Method**: `POST` &nbsp; **Path**: `/mdp/order/goods/sync-order-info`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNoList` | string[] | Yes | Processing Number, (Shipping supports multiple, up to 20, transfer completion and flower burning completion only support single) |
| `orderStatus` | integer | Yes | Order synchronization status, 1、Transfer printing completed、2、Burning flower completed 3、Shipment |
| `userCode` | string | No | Operator's user code |
| `operateTime` | string | Yes | Operating time |
| `transferPrintList` | object[] | No | Transfer printing row count, only required when transfer printing is completed |
| `serialNo` | integer | Yes | Transfer printing serial number |
| `num` | decimal | Yes | Transfer printing meters |
| `bagInfoList` | object[] | No | Burning flower bag information list, only required when burning flower is completed |
| `sizeInfoList` | object[] | Yes |  |
| `size` | string | Yes | size |
| `quantity` | string | Yes | quantity |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `info` | object | Yes |
| `bagInfoList` | object[] | Yes |
| `barCode` | string | No |
| `sizeInfoList` | object[] | Yes |
| `quantity` | integer | No |
| `size` | string | No |
| `burnDeliveryInfo` | object | Yes |
| `burnDeliveryInfoDetailRespList` | object[] | Yes |
| `burnFlowerDetail` | string | No |
| `burnFlowerPrice` | double | No |
| `burnFlowerTotalPrice` | double | No |
| `produceOrderId` | string | No |
| `deliveryNo` | string | No |
| `deliveryVoucherUrl` | string | No |
| `garmentFactory` | string | No |
| `signUrl` | string | No |
| `deliveryInfo` | object | Yes |
| `deliveryInfoDetailRespList` | object[] | Yes |
| `clothNo` | string | No |
| `count` | double | No |
| `deliveryNum` | double | No |
| `produceOrderId` | string | No |
| `quotedPrice` | double | No |
| `deliveryNo` | string | No |
| `deliveryVoucherUrl` | string | No |
| `garmentFactory` | string | No |
| `signUrl` | string | No |
| `orderNo` | string | No |
| `transferPrintList` | object[] | Yes |
| `clothGuid` | string | No |
| `num` | double | No |
| `serialNo` | string | No |
| `msg` | string | No |

---

## WeChat Mini Program login

> **Official docs**: [WeChat Mini Program login](https://open.sheincorp.com/documents/apidoc/detail/3001417)

**Method**: `POST` &nbsp; **Path**: `/mdp/wx-mini-program/login`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `openid` | string | Yes | openid |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `detailMsg` | string | No |
| `info` | object | No |
| `permissionRespList` | object[] | No |
| `link` | string | No |
| `permissionName` | string | No |
| `userCode` | string | No |
| `userId` | int64 | No |
| `userName` | string | No |
| `msg` | string | No |
| `time` | datetime | No |

---

## Hanging Card Aggregation Operations (Shelving/Outbound/Relocation)

> **Official docs**: [Hanging Card Aggregation Operations (Shelving/Outbound/Relocation)](https://open.sheincorp.com/documents/apidoc/detail/3001430)

**Method**: `POST` &nbsp; **Path**: `/mdp/hangcard/operate`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `groundingOperateParam` | object | No | 上架操作参数 |
| `cargoLocationCode` | string | Yes | 货位编号 |
| `hangCardNo` | string | Yes | Hanger number |
| `operationType` | integer | Yes | 操作类型 1:挂卡上架 2:挂卡出库 3:挂卡移位 |
| `outboundOperateParam` | object | No | 出库操作参数 |
| `hangCardNos` | string[] | Yes | 挂卡编号集合 |
| `outboundType` | integer | Yes | 出库类型 1-配货出库 2-报废出库 |
| `shiftOperateParam` | object | No | 移位操作参数 |
| `cargoLocation` | string | Yes | 货位编号 |
| `hangCardNo` | string | Yes | Hanger number |
| `userCode` | string | Yes | userCode |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `detailMsg` | string | No |
| `info` | object | No |
| `msg` | string | No |
| `time` | datetime | No |

---

## Add or update card hanging information

> **Official docs**: [Add or update card hanging information](https://open.sheincorp.com/documents/apidoc/detail/3001431)

**Method**: `POST` &nbsp; **Path**: `/mdp/hang-card/add-or-update`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `handCardInfoList` | object[] | No | 挂卡信息 |
| `designStyle` | string | No | Design number |
| `designer` | string | No | Designer |
| `equipmentId` | int64 | No | 开发设备id |
| `finalGoodsSku` | string | No | Product SKU |
| `flowerCode` | string | No | Flower pattern |
| `hangCardNo` | string | No | Hanger number |
| `supplierHangCardNo` | string | No | 供应商挂卡编号 |
| `userCode` | string | Yes | userCode |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `detailMsg` | string | No |
| `info` | object | No |
| `handCardInfoList` | object[] | No |
| `designStyle` | string | No |
| `designer` | string | No |
| `equipmentId` | int64 | No |
| `finalGoodsSku` | string | No |
| `flowerCode` | string | No |
| `hangCardNo` | string | No |
| `supplierHangCardNo` | string | No |
| `msg` | string | No |
| `time` | datetime | No |

---

## Get Printer Device List

> **Official docs**: [Get Printer Device List](https://open.sheincorp.com/documents/apidoc/detail/3001432)

**Method**: `POST` &nbsp; **Path**: `/mdp/basic-configure/production-equipment/get-print-equipmentList`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `userCode` | string | Yes | userCode |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `detailMsg` | string | No |
| `info` | object | No |
| `list` | object[] | No |
| `equipmentCode` | string | No |
| `equipmentName` | string | No |
| `id` | int64 | No |
| `machineTableCode` | string | No |
| `msg` | string | No |
| `time` | datetime | No |

---

## Add or cancel device exception

> **Official docs**: [Add or cancel device exception](https://open.sheincorp.com/documents/apidoc/detail/3001433)

**Method**: `POST` &nbsp; **Path**: `/mdp/basic-configure/production-equipment/add-or-cancel-equipment-exception`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `equipmentCode` | string | Yes | 设备code |
| `operationType` | integer | Yes | 操作类型：1-设备异常 2-设备解除异常 |
| `userCode` | string | Yes | userCode |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `detailMsg` | string | No |
| `info` | object | No |
| `msg` | string | No |
| `time` | datetime | No |

---

## Receive external ERP completed orders

> **Official docs**: [Receive external ERP completed orders](https://open.sheincorp.com/documents/apidoc/detail/3001434)

**Method**: `POST` &nbsp; **Path**: `/mdp/order/goods/external/receive-external-erp-complete-order`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `completeOrderList` | object[] | Yes | 完结订单信息列表 |
| `commodityName` | string | Yes | product name |
| `commodityType` | integer | No | 商品类型 |
| `customerName` | string | Yes | Customer name |
| `orderNum` | double | Yes | 销售数量 |
| `requirementNo` | string | Yes | 需求单号 |
| `salePrice` | double | Yes | 销售单价 |
| `unit` | integer | Yes | unit |
| `userCode` | string | No | Operator's user code |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `detailMsg` | string | No |
| `info` | object | No |
| `processNoList` | string[] | No |
| `msg` | string | No |
| `time` | datetime | No |

---

## Provide external ERP material task query interface

> **Official docs**: [Provide external ERP material task query interface](https://open.sheincorp.com/documents/apidoc/detail/3001469)

**Method**: `POST` &nbsp; **Path**: `/mdp/process/get-process-develop-info-list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `carftNo` | string | No | 工艺单号 |
| `createdTimeEnd` | string | Yes | 单据生成结束时间（时间戳）最大查询时间1个月 |
| `createdTimeStart` | string | Yes | 单据生成开始时间（时间戳） 最大查询时间1个月 |
| `developStatusList` | integer[] | Yes | 状态 20-调色中 90-小样审批 110-线上批色 30-排版中 120-线上批版 40-打版中 100-送版中 70-版料已签收 80-待排版 50-已完成 |
| `pageNum` | integer | Yes | page number |
| `pageSize` | integer | No | 页大小，不传默认30，最大100 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `detailMsg` | string | No |
| `info` | object | Yes |
| `count` | integer | No |
| `list` | object[] | Yes |
| `carftNo` | string | No |
| `createdTime` | bigint | No |
| `cutMethodProcessPartName` | string | No |
| `cutRemark` | string | No |
| `designImageUrlList` | string[] | No |
| `designNo` | string | No |
| `developChannel` | integer | No |
| `developChannelName` | string | No |
| `finalMaterialSku` | string | No |
| `flowerCode` | string | No |
| `flowerImageUrl` | string | No |
| `isBurnFlower` | integer | No |
| `isBurnFlowerName` | string | No |
| `isNeedQc` | integer | No |
| `isNeedQcName` | string | No |
| `isPosition` | integer | No |
| `isPositionName` | string | No |
| `materialName` | string | No |
| `materialSku` | string | No |
| `needNum` | double | No |
| `purchaseNo` | string | No |
| `quotedPrice` | double | No |
| `referenceDesignStyle` | string | No |
| `sampleCount` | integer | No |
| `systemSource` | integer | No |
| `systemSourceName` | string | No |
| `twiceCarft` | string | No |
| `twiceCarftId` | integer | No |
| `developStatus` | integer | No |
| `developStatusName` | string | No |
| `msg` | string | No |
| `time` | string | No |

---

## External query operation log (for applet call)

> **Official docs**: [External query operation log (for applet call)](https://open.sheincorp.com/documents/apidoc/detail/3001470)

**Method**: `POST` &nbsp; **Path**: `/mdp/order/external/get-order-log-list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `orderNoList` | string[] | Yes | 单据编号列表（加工单号/异常单号/生产异常单号），最多20个 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `detailMsg` | string | No |
| `info` | object | No |
| `list` | object[] | No |
| `logs` | object[] | No |
| `operationDetail` | string | No |
| `operationStatus` | string | No |
| `operationTime` | string | No |
| `operator` | string | No |
| `orderNo` | string | No |
| `msg` | string | No |
| `time` | datetime | No |

---

## Provide external ERP flower pattern development pagination query interface

> **Official docs**: [Provide external ERP flower pattern development pagination query interface](https://open.sheincorp.com/documents/apidoc/detail/3001474)

**Method**: `POST` &nbsp; **Path**: `/mdp/flower/get-pattern-dev-page-list`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `createdTimeEnd` | bigint | Yes | 单据生成结束时间（时间戳）最大查询时间1个月 |
| `createdTimeStart` | bigint | Yes | 单据生成开始时间（时间戳）最大查询时间1个月 |
| `pageNum` | integer | Yes | 页码，分页时必填 |
| `pageSize` | integer | No | Quantity per page |
| `status` | integer | Yes | 状态 2:绘图中 3:待审核 4:已完成 5-已取消 |
| `subTaskNo` | string | No | 子任务单号 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `detailMsg` | string | No |
| `info` | object | No |
| `count` | int64 | No |
| `list` | object[] | No |
| `brandGroupName` | string | No |
| `createdBy` | string | No |
| `createdTime` | datetime | No |
| `description` | string | No |
| `designGroup` | string | No |
| `designRemark` | string | No |
| `developType` | integer | No |
| `developTypeName` | string | No |
| `isColorMatchingName` | string | No |
| `merchandiser` | string | No |
| `originalMaterialList` | object[] | No |
| `originalMaterialName` | string | No |
| `originalMaterialSku` | string | No |
| `plmPatternCode` | string | No |
| `referenceImgList` | string[] | No |
| `referencePatternCode` | string | No |
| `remark` | string | No |
| `subTaskNo` | string | No |
| `transparentBottomImage` | string | No |
| `twiceCarftNameList` | string[] | No |
| `msg` | string | No |
| `time` | datetime | No |

---
