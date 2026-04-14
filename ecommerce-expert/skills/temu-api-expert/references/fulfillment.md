# Temu Partner API — Fulfillment API

Shipment confirmation, logistics companies, buy-shipping (labels, scanforms, pickup), tracking, and co-warehouse fulfillment.

## Table of Contents

- [bg.logistics.companies.get](#bglogisticscompaniesget)
- [bg.logistics.shipment.v2.confirm](#bglogisticsshipmentv2confirm)
- [bg.logistics.shipment.sub.confirm](#bglogisticsshipmentsubconfirm)
- [bg.logistics.shipment.v2.get](#bglogisticsshipmentv2get)
- [bg.logistics.shipment.shippingtype.update](#bglogisticsshipmentshippingtypeupdate)
- [bg.logistics.warehouse.list.get](#bglogisticswarehouselistget)
- [bg.logistics.shippingservices.get](#bglogisticsshippingservicesget)
- [temu.logistics.shiplogisticstype.get](#temulogisticsshiplogisticstypeget)
- [bg.logistics.shipment.create](#bglogisticsshipmentcreate)
- [bg.logistics.shipment.result.get](#bglogisticsshipmentresultget)
- [bg.logistics.shipment.update](#bglogisticsshipmentupdate)
- [bg.logistics.shipment.document.get](#bglogisticsshipmentdocumentget)
- [bg.order.unshipped.package.get](#bgorderunshippedpackageget)
- [bg.logistics.shipped.package.confirm](#bglogisticsshippedpackageconfirm)
- [temu.logistics.label.list.get](#temulogisticslabellistget)
- [temu.logistics.scanform.create](#temulogisticsscanformcreate)
- [temu.logistics.scanform.get](#temulogisticsscanformget)
- [temu.logistics.scanform.document.get](#temulogisticsscanformdocumentget)
- [temu.logistics.candidate.scanform.list.get](#temulogisticscandidatescanformlistget)
- [temu.logistics.shipment.pickup.reservation.create](#temulogisticsshipmentpickupreservationcreate)
- [temu.logistics.shipment.pickup.reservation.result.get](#temulogisticsshipmentpickupreservationresultget)
- [temu.logistics.shipment.pickup.reservation.cancel](#temulogisticsshipmentpickupreservationcancel)
- [temu.track.trackinginfo.get](#temutracktrackinginfoget)
- [bg.cooperativewarehouse.provider.list](#bgcooperativewarehouseproviderlist)
- [bg.cooperativewarehouse.token.authorization](#bgcooperativewarehousetokenauthorization)
- [bg.cooperativewarehouse.fulfill.submit](#bgcooperativewarehousefulfillsubmit)
- [bg.cooperativewarehouse.fulfill.cancel](#bgcooperativewarehousefulfillcancel)
- [bg.cooperativewarehouse.fulfill.query](#bgcooperativewarehousefulfillquery)
- [temu.cooperativewarehouse.skurelationship.create](#temucooperativewarehouseskurelationshipcreate)
- [temu.cooperativewarehouse.skurelationship.get](#temucooperativewarehouseskurelationshipget)

---

## `bg.logistics.companies.get`

> **Official docs**: [bg.logistics.companies.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=90f7c26187c84294a7bb0b9ca23703c6)

Obtain full logistics providers that support shipping at the corresponding regoin

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `regionId` | INTEGER | True | regionId Full encoding can be obtained through the following link https://partner.temu.com/documentation?menu_code=38e79b35d2cb463d85619c1c786dd303&sub_menu_code=97bf9f5f4f454a589fb3192725bfeb7a |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT[] |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |

---

## `bg.logistics.shipment.v2.confirm`

> **Official docs**: [bg.logistics.shipment.v2.confirm](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=70cca1a3690044eaae4a28de6de76bb1)

The bg.logistics.shipment.v2.confirm interface is designed to synchronize and return order fulfillment information through this interface. Switch the order status from pending shipment to shipped.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `sendType` | INTEGER | True | SendType,enumerated as follows: 0:All the products in one parent order are shipped in one package with one tracking number 1:Partical products in one parent order are shipped in multiple packages w... |
| `sendRequestList` | OBJECT[] | True | Shipment package details |
| `carrierId` | LONG | True | Carrier ID, it's the same ID with the logisticsServiceProviderId you got from "bg.logistics.companies.get". |
| `trackingNumber` | STRING | True | Tracking Number. |
| `selfShippingWarehouseId` | STRING | True | The shipment warehouse ID can be obtained from the bg.logistics.warehouse.list.get interface. |
| `orderSendInfoList` | OBJECT[] | True | Product List in this package. |
| `confirmAcceptance` | STRING[] | False | Confirmation matters for this shipment,enumerated as follows: DENY_CANCELLATION: Reject the cancellation request for this order; DENY_ADDRESS_CHANGE: Reject the address change request for this orde... |
| `subSendRequests` | OBJECT[] | False | Sub Send Requests |
| `carrierId` | LONG | True | Logistics Company ID |
| `trackingNumber` | STRING | True | Waybill Number |
| `selfShippingWarehouseId` | STRING | True | Self-Delivery Warehouse ID |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | result |
| `assistantAgreementText` | STRING | Enables intelligent trajectory assistant to detect and correct potential mistakes in carrier entries. |
| `warningMessage` | STRING[] | Provides relevant prompts related to the current shipping request. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120012004 | The order has been shipped. This submission is not effective for the shipped order. |  |
| 120012015 | Combined delivery failed since the delivery addresses for PO orders are different. |  |
| 120015050 | This package contains an age-restricted order. Only specified logistics providers can be used for... |  |
| 120014001 | Tracking number is blank. |  |
| 120014023 | Tracking number is invalid: {*}. |  |
| 120014005 | Tracking number may be invalid. Please verify before proceeding. |  |
| 120012064 | The parentOrderSn is not valid for the selected selfShippingWarehouseId. |  |
| 120012063 | The parentOrderSn is not valid for the selected selfShippingWarehouseId. |  |
| 120012041 | A duplicate sub-order number has been entered for tracking number {*}. |  |
| 120018069 | Main mall does not support self-importing shipping orders for sub-mall. Please change the shippin... |  |
| 120014022 | Incorrect trackingNumber/carrierId. Please check and retry. |  |
| 120011098 | A package is allowed to add a maximum of only 10 sub tracking numbers. |  |
| 120011045 | For splitSubPackage quantity needs to be 1. |  |
| 120015543 | The Order with label "signature_required_on_delivery" and other orders cannot be fulfilled at the... |  |
| 120015037 | This logistics provider does not support this business scenario. |  |
| 120012035 | Your store has been restricted from using the Confirm shipment function. Because your store has a... |  |
| 120011030 | Cooperative warehouse order fulfillment restricted. |  |
| 120015530 | Order with "Y2_advance_sale" label can be only fulfilled by Temu integrated logistics. |  |
| 120011086 | Please fill in the warehouse management type and warehouse brand in the Temu seller center first.... |  |
| 120011085 | selfShippingWarehouseId is invalid, please have a check |  |
| 120011092 | Your store has been restricted from confirming shipment by FedEx tracking number. Please use the ... |  |
| 120011091 | Your store has been restricted from confirming shipment by tracking number. Please use the online... |  |
| 120012020 | Buy shipping failed. Package number {*} is existent. Courier and tracking number cannot be entere... | Please request "bg.logistics.shipment.shppingtype.update" to fulfill by non-integrated channel. |
| 120011059 | Your store has been restricted from confirming shipment by USPS tracking number. Please use the o... |  |
| 120014020 | Delivery failed because the tracking number cannot be recognized. Please delete specific symbol s... |  |
| 120011031 | The provider has at least one unsigned agreement. Please go to the home page to sign. |  |
| 120015518 | The order with "US-to-CA" Label and the order without "US-to-CA" Label can't be shipped together. |  |
| 120012023 | Address change pending. Please process before shipping. |  |
| 120012030 | Order cancel pending. Please process before shipping. |  |
| 120011065 | Please fill in the shipping address. |  |
| 120014019 | Cannot ship with Platform-Generated tracking number. |  |
| 120011006 | The parameter warehouseId is invalid. |  |
| 120015026 | A large items template has been used for the items in this package. Only specified logistics prov... |  |
| 120015527 | Missing required parameter selfShippingWarehouseId |  |
| 120012031 | The current parent order has a pending risk control alert. |  |
| 120018021 | The BC order is not allowed. |  |
| 120012007 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |
| 120017007 | The cancellation application is under review and cannot be shipped. |  |
| 120011072 | The request area is incorrect. Please check the request area and replace it with the correct requ... |  |
| 120012016 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |
| 120015528 | O-orders of COD type exist in body, and COD type O-orders can only be shipped with Temu Label. |  |
| 120012034 | Your store has been restricted from confirming shipment by tracking number. Please use the online... |  |
| 120015030 | A large items template has been used for the items in this package. Only specified logistics prov... |  |
| 120015531 | Only order with "Y2_advance_sale" label can be fulfilled by warehouse in "other" type. |  |
| 120014003 | Duplicate tracking number |  |
| 120014004 | Tracking number has been used |  |
| 120014006 | System abnormality, please try again later |  |
| 120014008 | Delivery failed because the tracking number cannot be recognized. Please check and try again. |  |

---

## `bg.logistics.shipment.sub.confirm`

> **Official docs**: [bg.logistics.shipment.sub.confirm](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=4f1172f777924859bf3f53663572df6e)

The bg.logistics.shipment.sub.confirm interface should only be used in scenarios where the smallest sku needs to be shipped as split packages, and can append the sub-parcel information to the main parcel.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `mainPackageSn` | STRING | True | Package number that you already shipped. You can get the package number from "bg.logistics.shipment.get. |
| `sendSubRequestList` | OBJECT[] | False | Send Sub Package Info. |
| `carrierId` | LONG | True | Carrier ID. |
| `trackingNumber` | STRING | True | Tracking Number. |
| `selfShippingWarehouseId` | STRING | True | The shipment warehouse ID can be obtained from the bg.logistics.warehouse.list.get interface. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | BOOLEAN |  |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120015050 | This package contains an age-restricted order. Only specified logistics providers can be used for... |  |
| 120014001 | Tracking number is blank. |  |
| 120014023 | Tracking number is invalid: {*}. |  |
| 120014005 | Tracking number may be invalid. Please verify before proceeding. |  |
| 120012064 | The parentOrderSn is not valid for the selected selfShippingWarehouseId. |  |
| 120012063 | The parentOrderSn is not valid for the selected selfShippingWarehouseId. |  |
| 120014022 | Incorrect trackingNumber/carrierId. Please check and retry. |  |
| 120012043 | Sub-package can only be added once. |  |
| 120015037 | This logistics provider does not support this business scenario. |  |
| 120012035 | Your store has been restricted from using the Confirm shipment function. Because your store has a... |  |
| 120015530 | Order with "Y2_advance_sale" label can be only fulfilled by Temu integrated logistics. |  |
| 120011086 | Please fill in the warehouse management type and warehouse brand in the Temu seller center first.... |  |
| 120011085 | selfShippingWarehouseId is invalid, please have a check |  |
| 120011092 | Your store has been restricted from confirming shipment by FedEx tracking number. Please use the ... |  |
| 120011091 | Your store has been restricted from confirming shipment by tracking number. Please use the online... |  |
| 120011059 | Your store has been restricted from confirming shipment by USPS tracking number. Please use the o... |  |
| 120014020 | Delivery failed because the tracking number cannot be recognized. Please delete specific symbol s... |  |
| 120011001 | System abnormality, please check the data and try again |  |
| 120011002 | Invalid request parameters. |  |
| 120011006 | The parameter warehouseId is invalid. |  |
| 120011020 | Invalid request parameters |  |
| 120011022 | Invalid request parameters |  |
| 120011030 | Cooperative warehouse order fulfillment restricted. |  |
| 120011031 | The provider has at least one unsigned agreement. Please go to the home page to sign. |  |
| 120014003 | Duplicate tracking number |  |
| 120014004 | Tracking number has been used |  |
| 120014006 | System abnormality, please try again later |  |
| 120015002 | Invalid logistics company ID |  |
| 120015559 | Delivery failed because the tracking number cannot be recognized. Please check and try again. |  |
| 120015560 | The requirements for creating a package are incorrect or conditions are not met. Please check again. |  |
| 120011065 | Please fill in the shipping address. |  |
| 120015026 | A large items template has been used for the items in this package. Only specified logistics prov... |  |
| 120015527 | Missing required parameter selfShippingWarehouseId |  |
| 120018021 | The BC order is not allowed. |  |
| 120018027 | The packageSn is invalid. Please check the request area or if the packageSn is nonexistent etc. |  |
| 120015528 | O-orders of COD type exist in body, and COD type O-orders can only be shipped with Temu Label. |  |
| 120012034 | Your store has been restricted from confirming shipment by tracking number. Please use the online... |  |
| 120015030 | A large items template has been used for the items in this package. Only specified logistics prov... |  |
| 120015531 | Only order with "Y2_advance_sale" label can be fulfilled by warehouse in "other" type. |  |
| 120014008 | Delivery failed because the tracking number cannot be recognized. Please check and try again. |  |
| 120014019 | Cannot ship with Platform-Generated tracking number. |  |

---

## `bg.logistics.shipment.v2.get`

> **Official docs**: [bg.logistics.shipment.v2.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=dc8c6008a27a4ed0b003a0cd1b365c50)

The bg.logistics.shipment.v2.get interface is for sellers to verify shipped info after self-fulfillment.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `parentOrderSn` | STRING | True | Parent Order Number. |
| `orderSn` | STRING | True | Order Number. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | result |
| `shipmentInfoDTO` | OBJECT[] | shipment result |
| `carrierId` | LONG | Carrier ID, it's the same ID with the logisticsServiceProviderId you got from "bg.logistics.companies.get". |
| `carrierName` | STRING | Carrier name, it's the same name with the logisticsServiceProviderId you got from "bg.logistics.companies.get". |
| `trackingNumber` | STRING | Tracking Number. For Y2 orders, trackingNumber will be returned solely when the API call timestamp ≥ earliestTimeGetShippingDocument. |
| `skuId` | LONG | SKU ID. |
| `quantity` | INTEGER | Quantity of the product. |
| `packageSn` | STRING | Package number |
| `packageDeliveryType` | INTEGER | Package delivery type,enumerated as follows: 1:Seller fulfills this order by non-integrated channel 2:Seller fulfills this order by Temu-integrated channel 3:Cooperative warehouse fulfills this ord... |
| `trackingWarningLabel` | INTEGER | Tracking warning labels, 0: No issues 1: No tracking information 2: Potentially incorrect 3: The receiving address is inconsistent 4: Over time collection |
| `cooperativeWarehouseDTO` | OBJECT | Only when this order is fulfilled by the cooperative warehouse, this parameter may return DTO information. If this order is fulfilled by the seller, this parameter may return empty. |
| `subPackageShipmentInfoList` | OBJECT[] | subPackage Shipment result |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120011072 | The request area is incorrect. Please check the request area and replace it with the correct requ... |  |
| 120012007 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |
| 120012016 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |

---

## `bg.logistics.shipment.shippingtype.update`

> **Official docs**: [bg.logistics.shipment.shippingtype.update](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=5e15820c84b84b6a9af7b28645c38d23)

The bg.logistics.shipment.shippingtype.update interface is used by sellers to update logistics tracking numbers, supporting the following scenarios: non-integrated logistics updating logistics tracking numbers; Temu-integrated logistics has been changed to non-integrated logistics.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `editPackageRequestList` | OBJECT[] | False | edit package request list |
| `packageSn` | STRING | True | package number |
| `trackingNumber` | STRING | True | tracking number |
| `shipCompanyId` | LONG | True | it's the same ID with the logisticsServiceProviderId you got from "bg.logistics.companies.get". |
| `selfShippingWarehouseId` | STRING | True | The shipment warehouse ID can be obtained from the bg.logistics.warehouse.list.get interface. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | BOOLEAN |  |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120012015 | Combined delivery failed since the delivery addresses for PO orders are different. |  |
| 120015050 | This package contains an age-restricted order. Only specified logistics providers can be used for... |  |
| 120012064 | The parentOrderSn is not valid for the selected selfShippingWarehouseId. |  |
| 120012063 | The parentOrderSn is not valid for the selected selfShippingWarehouseId. |  |
| 120014022 | Incorrect trackingNumber/carrierId. Please check and retry. |  |
| 120015037 | This logistics provider does not support this business scenario. |  |
| 120018010 | The packages {*} have been canceled. Please fulfill again by Temu non-integrated logistics or Tem... |  |
| 120015528 | O-orders of COD type exist in body, and COD type O-orders can only be shipped with Temu Label. |  |
| 120012035 | Your store has been restricted from using the Confirm shipment function. Because your store has a... |  |
| 120018015 | The package has been canceled, please fulfill again by Temu non-integrated logistics or Temu inte... |  |
| 120011030 | Cooperative warehouse order fulfillment restricted. |  |
| 120015530 | Order with "Y2_advance_sale" label can be only fulfilled by Temu integrated logistics. |  |
| 120018049 | Failed to update shipping information. Please cancel the appointment for pickup first. |  |
| 120011086 | Please fill in the warehouse management type and warehouse brand in the Temu seller center first.... |  |
| 120011085 | selfShippingWarehouseId is invalid, please have a check |  |
| 120011092 | Your store has been restricted from confirming shipment by FedEx tracking number. Please use the ... |  |
| 120011091 | Your store has been restricted from confirming shipment by tracking number. Please use the online... |  |
| 120011059 | Your store has been restricted from confirming shipment by USPS tracking number. Please use the o... |  |
| 120014020 | Delivery failed because the tracking number cannot be recognized. Please delete specific symbol s... |  |
| 120011020 | Invalid request parameters |  |
| 120011043 | Missing required parameters for 'sendSubRequestList'. |  |
| 120011044 | Exceeded maximum allowed attached packages. Limit is 10. |  |
| 120011045 | For splitSubPackage quantity needs to be 1. |  |
| 120015520 | Call failed: Cannot convert subPackage to self-shipment. |  |
| 120014019 | Cannot ship with Platform-Generated tracking number. |  |
| 120015026 | A large items template has been used for the items in this package. Only specified logistics prov... |  |
| 120018021 | The BC order is not allowed. |  |
| 120018027 | The packageSn is invalid. Please check the request area or if the packageSn is nonexistent etc. |  |
| 120015529 | The current package does not meet the modification conditions and cannot be edited. |  |
| 120012034 | Your store has been restricted from confirming shipment by tracking number. Please use the online... |  |
| 120015030 | A large items template has been used for the items in this package. Only specified logistics prov... |  |
| 120015527 | Missing required parameter selfShippingWarehouseId |  |
| 120015531 | Only order with "Y2_advance_sale" label can be fulfilled by warehouse in "other" type. |  |

---

## `bg.logistics.warehouse.list.get`

> **Official docs**: [bg.logistics.warehouse.list.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=bd462f852e7547a7a62bf6bba6023a24)

Sellers can use this API to obtain the shop's warehouse information.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `returnEnableBuyShippingLabelOnly` | BOOLEAN | False | 1. returnEnableBuyShippingLabelOnly=True: Only warehouses that support purchasing Temu shipping labels will be returned. 2. returnEnableBuyShippingLabelOnly=False: All warehouses will be returned (... |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `warehouseList` | OBJECT[] | Seller warehouse list |
| `warehouseId` | STRING | Warehouse ID |
| `warehouseName` | STRING | Warehouse name |
| `regionId1` | LONG | Region ID that the warehouse is located |
| `defaultWarehouse` | BOOLEAN | Whether this warehouse is the default warehouse |
| `warehouseManagementType` | INTEGER | warehouse management type: 0: cooperative warehouse 1: self built warehouse 2: family warehouse 3: other |
| `warehouseBrand` | STRING | warehouse brand: if the warehouse management type=0, then the warehouse brand will return with value. if the warehouse management type=1 or warehouse management type=2, then the warehouse brand wil... |
| `enableBuyShippingLabel` | BOOLEAN | 1. enableBuyShippingLabel=True: This warehouse supports purchasing Temu shipping labels for package fulfillment. 2. enableBuyShippingLabel=False: This warehouse does not support purchasing Temu shi... |
| `pushOrderToOpenPlatform` | BOOLEAN | "pushOrderToOpenPlatform=true" means you should push the order to open platform instead of pushing the order to warehouse directly. |
| `supportsUspsGroundAdvantage` | BOOLEAN | Indicates whether the warehouse supports USPS Ground Advantage shipping. The value is true if the warehouse supports this service. |
| `cooperativeWarehouseAuthorizationStatus` | BOOLEAN | Has the authorization for the cooperation warehouse been completed |

---

## `bg.logistics.shippingservices.get`

> **Official docs**: [bg.logistics.shippingservices.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=18c1c2de89184d4e93a0f958da7bfc88)

The bg.logistics.shippingservices.get interface is for sellers to retrieve supported shipping carriers based on package dimensions and weight, which allows sellers to quickly determine which carriers can handle shipment based on the provided package weight and volume information. This interface simplifies the process of selecting the right shipping option, ensuring packages arrive safely and on time.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `warehouseId` | STRING | True | Warehouse ID. |
| `orderSnList` | STRING[] | False | Product List in this package. |
| `shipOrderInfoList` | OBJECT[] | False | Order Info List |
| `weight` | STRING | True | The weight of the package. For local U.S. orders, this filed should be input with integer and the decimal places should be input by extendWeight. For Non-local U.S. orders, two decimal places are f... |
| `weightUnit` | STRING | True | The unit of the weight. The weight unit for packages in the United States is "lb" while in other countries it is "kg". |
| `extendWeight` | STRING | False | The extend weight of the package. For local U.S. orders, the decimal places are filled with integer through this parameter while extendWeightUnit is "oz". |
| `extendWeightUnit` | STRING | False | The unit of the extend weight. For local U.S. orders, the extend weight unit for packages is "oz". |
| `length` | STRING | True | The length of the package, the length should be input with two decimal places. |
| `width` | STRING | True | width of the package, width should be input with two decimal places. |
| `height` | STRING | True | height of the package, height should be input with two decimal places |
| `dimensionUnit` | STRING | True | dimension(eg:length/width/height) Unit. The dimension unit for packages in the United States is "in". while in other countries it is "cm" |
| `signatureOnDelivery` | BOOLEAN | False | Is Signature Required for Delivery Confirmation? |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `onlineChannelDtoList` | OBJECT[] | List of available shipping channels for this package. |
| `unavailableChannelDtoList` | OBJECT[] | List of online shipLogisticsType but not available for this package. |
| `channelId` | LONG | Channel ID |
| `shipCompanyId` | LONG | Ship Company ID |
| `shippingCompanyName` | STRING | Shipping Company Name |
| `shipLogisticsType` | STRING | Ship Logistics Type |
| `estimatedText` | STRING | Estimated Text |
| `unavailableReason` | STRING | The Reason why this shipLogisticsType is online but there is no available channel to fulfill this package. |
| `supportInterlineShipping` | BOOLEAN | Whether can be interline shipping |
| `unavailableInterlineChannelList` | OBJECT[] | List of interline channels |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120015507 | Wrong package {*} information. Try again. |  |
| 120012061 | The current parent order has a pending risk control alert, It is not recommended to proceed with ... |  |
| 120018070 | Only one of orderSnList or <parentOrderSn, orderSn>list can be passed in. |  |
| 120018072 | At least one of orderSnList and <parentOrderSn, orderSn>list must be passed in. |  |
| 120018071 | This orderSn does not exist under the specified parentOrderSn. |  |
| 120011015 | Incomplete warehouse details. Update in Seller Central to process shipment. |  |
| 120015544 | Orders {*} need to sign on delivery. Please request the field "signatureOnDelivery" with "True". |  |
| 120011030 | Cooperative warehouse order fulfillment restricted. |  |
| 120013007 | Product sku sensitive query fail |  |
| 120013008 | Order lacks necessary sensitive attributes. |  |
| 120013009 | Order lacks necessary sensitive attributes. |  |
| 120011047 | Not support local mall |  |
| 120011006 | The parameter warehouseId is invalid. |  |
| 120012007 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |
| 120015521 | The parameter Weight should be integer. |  |
| 120012016 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |
| 120011072 | The request area is incorrect. Please check the request area and replace it with the correct requ... |  |

---

## `temu.logistics.shiplogisticstype.get`

> **Official docs**: [temu.logistics.shiplogisticstype.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=81e2cc2b0d6f4443b29ea8d1596e0fca)

You can get all online ship logistics type information from this api. After that, they can call "bg.logistics.shipment.create" to buy-shipping on Temu. Once you choose to buy-shipping with ship logistics type, Temu will automatically chose the most recommended channel id and buy-shipping for you.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `regionId` | LONG | True | regionId |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `regionId` | LONG | regionId |
| `shipLogisticsTypeInfoDTOList` | OBJECT[] | Ship Logistics Type Info List |
| `shipCompanyId` | LONG | Logistics Company ID |
| `shippingCompanyName` | STRING | Logistics Company Name |
| `shipLogisticsType` | STRING | Ship Logistics Type |
| `logisticsProviderLabelList` | STRING[] | logistics Provider Label List, enumerated values include {INTERLINE_CHANNEL} |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120011001 | System abnormality, please check the data and try again |  |
| 120011002 | Invalid request parameters. |  |
| 120011072 | The request area is incorrect. Please check the request area and replace it with the correct requ... |  |

---

## `bg.logistics.shipment.create`

> **Official docs**: [bg.logistics.shipment.create](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=1eadab72ed8041318604b163dd75cdac)

The bg.logistics.shipment.create interface is for sellers to place online logistics orders and receive package numbers, which enables to effortlessly place logistics orders with selected carriers online.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `sendType` | INTEGER | True | SendType 0:All the products in one parent order are shipped in one package with one tracking number 1:Partical products in one parent order are shipped in multiple packages with multiple tracking n... |
| `sendRequestList` | OBJECT[] | False | Package List Information |
| `shipLater` | BOOLEAN | False | Ship Later TRUE: apply to create the package apply to create the tracking numbers from Temu-integrated carriers online. Mark this package as "ship later". Order with "Y2_advance_sale" label must se... |
| `shipLaterLimitTime` | STRING | False | For orders without "Y2_advance_sale" label, the deadline for later shipment, with options being: 24,48,72,96,120 hours. For orders with"Y2_advance_sale" label, the deadline for later shipment, with... |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `packageSnList` | STRING[] | Package Number List |
| `shipLaterLimitTime` | STRING | For orders without "Y2_advance_sale" label, the deadline for later shipment, with options being: 24, 48, 72, 96 hours. For orders with"Y2_advance_sale" label, the deadline for later shipment, with ... |
| `warningMessage` | STRING[] | Provides relevant prompts related to the current shipping request. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120012003 | Incomplete order. |  |
| 120011111 | This order uses a split channel, and the parameter `interlineShipCompanyList` is needed. |  |
| 120011110 | No eligible channelId meet the specified requirements. Please check the parameters. |  |
| 120012015 | Combined delivery failed since the delivery addresses for PO orders are different. |  |
| 120011112 | Missing parameter `shipCompanyId`. |  |
| 120011113 | Invalid request: The `orderSendInfoList` is missing the `orderSn` value for one or more orders. |  |
| 120013002 | Item quantity does not match. |  |
| 120015038 | Please note that the Buy Shipping service is not applicable to age-restricted product sales. |  |
| 120018074 | The cooperative warehouse mode does not support merging and shipping orders from multiple stores |  |
| 120018079 | The warehouseid has not completed the cooperative warehouse authorization |  |
| 120018080 | The current channel must be shipped later |  |
| 120018084 | Shipping from a cooperative warehouse and do not support unpacking sub packages |  |
| 120018085 | The channel used by {*} needs to be shipped through a cooperative warehouse |  |
| 120018086 | The current channel USPSMailingDateOffset prohibits the input of 0 |  |
| 120018088 | Failed to buy-shipping on platform , reason :{*} |  |
| 120019030 | The number of packages must be less than {*} |  |
| 120011018 | Orders with "signature_required_on_delivery" can only buy shipping label from the channel which p... |  |
| 120015507 | Wrong package {*} information. Try again. |  |
| 120011017 | The input warehouse does not support the USPS Ground Advantage shipping service. It is recommende... |  |
| 120012044 | This channel requires passing the exam to gain access. |  |
| 120012061 | The current parent order has a pending risk control alert, It is not recommended to proceed with ... |  |
| 120019009 | Invalid pickup reservation time. See pickupRules for valid options. |  |
| 120011015 | Incomplete warehouse details. Update in Seller Central to process shipment. |  |
| 120015040 | The parent order {*} can not be fulfilled by the selected logistics provider due to the customer'... |  |
| 120015545 | Orders with "signature_required_on_delivery" can only buy shipping label from the channel which p... |  |
| 120015543 | The Order with label "signature_required_on_delivery" and other orders cannot be fulfilled at the... |  |
| 120015037 | This logistics provider does not support this business scenario. |  |
| 120018063 | Your funds have been reserved, so you are temporarily unable to use the 'Buy shipping' function. |  |
| 120018036 | COD package transaction is ongoing, please try again later. |  |
| 120018028 | COD orders and PPD orders can't buy shipping label in one open api request. |  |
| 120011057 | COD orders cannot be combined with PPD orders for shipping in one package. |  |
| 120011053 | COD orders do not allow shipping later, please set shipLater=FALSE. |  |
| 120011051 | COD orders do not allow adding sub-packages |  |
| 120012037 | Order can only buy shipping label after the "earliestTimeBuyShippingLabel". |  |
| 120019019 | Invalid pickup time range. Please ensure times are within the next 5 calendar days (8:00-17:00), ... |  |
| 120015032 | You should choose one fulfillment way and fulfill channelId or shipLogisticsType. |  |
| 120011030 | Cooperative warehouse order fulfillment restricted. |  |
| 120011089 | Purchasing shipping labels for Amazon FBA warehouses is not supported. |  |
| 120015533 | The order with "Y2_advance_sale" label and the order without "Y2_advance_sale" label can't be ful... |  |
| 120015532 | shipLaterLimitTime is invalid, please check the valid value for orders with "Y2_advance_sale" label |  |
| 120015534 | Order with "Y2_advance_sale" label should set "shipLater=true" when you are fulfilled by Temu int... |  |
| 120015531 | Only order with "Y2_advance_sale" label can be fulfilled by warehouse in "other" type. |  |
| 120011082 | Failed to buy the shipping label. Please fill in the warehouse management type and warehouse bran... |  |
| 120015518 | The order with "US-to-CA" Label and the order without "US-to-CA" Label can't be shipped together. |  |
| 120011043 | Missing required parameters for 'sendSubRequestList'. |  |
| 120011044 | Exceeded maximum allowed attached packages. Limit is 10. |  |
| 120011045 | For splitSubPackage quantity needs to be 1. |  |
| 120012029 | Warehouse and recipient in different countries splitSubPackage cannot enter "TRUE". |  |
| 120015520 | Call failed: Cannot convert subPackage to self-shipment. |  |
| 120012023 | Address change pending. Please process before shipping. |  |
| 120012030 | Order cancel pending. Please process before shipping. |  |
| 120019016 | Unexpected parameter pickupTime. |  |
| 120019017 | Miss required parameter pickupTime. |  |
| 120015026 | A large items template has been used for the items in this package. Only specified logistics prov... |  |
| 120013007 | Product sku sensitive query fail |  |
| 120013008 | Order lacks necessary sensitive attributes. |  |
| 120013009 | Order lacks necessary sensitive attributes. |  |
| 120011047 | Not support local mall |  |
| 120011048 | Usage channel does not match the confirmation scenario |  |
| 120012031 | The current parent order has a pending risk control alert. |  |
| 120018020 | The BBC order is not allowed. |  |
| 120011020 | Invalid request parameters |  |
| 120015027 | A large items template has been used for the items in this package. Only special channels can be ... |  |
| 120018025 | Orders exist after-sales applications, please complete the processing before operation |  |
| 120012007 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |
| 120015521 | The parameter Weight should be integer. |  |
| 120011006 | The parameter warehouseId is invalid. |  |
| 120011072 | The request area is incorrect. Please check the request area and replace it with the correct requ... |  |
| 120012016 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |
| 120015528 | O-orders of COD type exist in body, and COD type O-orders can only be shipped with Temu Label. |  |
| 120012013 | You have already requested by Temu integrated logistics. Please check whether request is successf... | Please request "bg.logistics.shipment.result.get" to ensure whether the fulfillment request is su... |

---

## `bg.logistics.shipment.result.get`

> **Official docs**: [bg.logistics.shipment.result.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=6aca164dab4c448e8c86229306c86590)

The bg.logistics.shipment.result.get interface is for sellers to query the result of placing online logistics orders, with the shipping label status including in-progress{0}, successful{1}, and failed{2}.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `packageSnList` | STRING[] | False | Package number list |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `packageInfoResultList` | OBJECT[] | package infomation result list |
| `packageSn` | STRING | package numebr |
| `packageDeliveryType` | INTEGER | package delivery type |
| `warehouseId` | STRING | warehouse id |
| `warehouseName` | STRING | warehouse name |
| `shippingLabelStatus` | INTEGER | The latest shipping label status: 0-pending, 1-successful, 2-failing, 3-canceled, 9-converted to non-integrated logistics. |
| `failReasonText` | STRING | fail reason text |
| `solutionText` | STRING | solution text |
| `canChangeToManualSend` | BOOLEAN | whether can be changed to manual send |
| `weight` | STRING | The weight of the package. For local U.S. orders, this filed should be input with integer and the decimal places should be input by extendWeight. For Non-local U.S. orders, two decimal places are f... |
| `weightUnit` | STRING | The unit of the weight. The weight unit for packages in the United States is "lb" while in other countries it is "kg". |
| `extendWeight` | STRING | extend weight |
| `extendWeightUnit` | STRING | The unit of the extend weight. For local U.S. orders, the extend weight unit for packages is "oz". |
| `length` | STRING | The length of the packag. Length should be input with two decimal places. |
| `width` | STRING | The width of the package. Width should be input with two decimal places. |
| `height` | STRING | The height of the package. Height should be input with two decimal places. |
| `dimensionUnit` | STRING | dimension unit |
| `channelId` | LONG | channel id |
| `signServiceId` | LONG | The signServiceID represents the unique identifier for the delivery confirmation service purchased. This ID is only returned when has purchased the service. If the service has not been purchased, t... |
| `shipCompanyId` | LONG | ship company id |
| `shippingCompanyName` | STRING | shipping company name |
| `shipLogisticsType` | STRING | ship logistics type |
| `estimatedText` | STRING | estimated text |
| `estimatedCurrencyCode` | STRING | estimated currency code, demo: USD |
| `estimatedAmount` | STRING | estimated amount, demo : $12.12 |
| `trackingNumber` | STRING | Tracking number. For Y2 orders, tracking number will be returned solely when the API call timestamp ≥ earliestTimeGetShippingDocument. |
| `warningMessage` | STRING[] | warning message |
| `orderSendInfoList` | OBJECT[] | order information |
| `pickupEndTime` | LONG | pickup end time |
| `pickupStartTime` | LONG | pickup start time |
| `reservationSn` | STRING | reservation number |
| `subPackageType` | STRING | sub package type |
| `subPackageSnList` | STRING[] | sub package number list |
| `mainPackageSn` | STRING | main package number |
| `isConfirmAfterPickup` | BOOLEAN | If isConfirmAfterPickup is true, Temu will automatically change the package status to shipped. If isConfirmAfterPickup is false, Temu will not automatically change the package status to shipped. It... |
| `uspsMailingDateOffset` | INTEGER | Per USPS policy, unmanifested labels cannot be printed before the mailingDate. This field sets the mailingDate with enum values {0,1,2,3,4}, indicating the label status changes to manifested at 00:... |
| `shipLabelPrintableTime` | LONG | The manifest calculated based on the parcel order determines the parcel mailing date. Before this date, the shipping label cannot be obtained. It is also recommended not to deliver the parcel to th... |
| `interlineShipCompanyList` | OBJECT[] | List of interline ship companies |
| `cwFulfillNo` | STRING | If using a cooperation warehouse for shipment, this information will return the corresponding order number of the cooperation warehouse |

---

## `bg.logistics.shipment.update`

> **Official docs**: [bg.logistics.shipment.update](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=43a8da366d5847b9a7faf13915ce57d6)

The bg.logistics.shipment.update interface is for sellers to create shipment logistics orders later, and to re-order online if the order fails.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `retrySendPackageRequestList` | OBJECT[] | False | retry Package List Information |
| `shipCompanyId` | LONG | True | Ship Company ID, you can get this ID from "bg.logistics.shippingservices.get" |
| `packageSn` | STRING | False | retry package number |
| `orderSendInfoList` | OBJECT[] | False | Product List in this package |
| `warehouseId` | STRING | True | Warehouse ID |
| `weight` | STRING | True | The weight of the package. For local U.S. orders, this filed should be input with integer and the decimal places should be input by extendWeight. For Non-local U.S. orders, two decimal places are f... |
| `weightUnit` | STRING | True | The unit of the weight. The weight unit for packages in the United States is "lb" while in other countries it is "kg". |
| `extendWeight` | STRING | False | The extend weight of the package. For local U.S. orders, the decimal places are filled with integer through this parameter while extendWeightUnit is "oz". |
| `extendWeightUnit` | STRING | False | The unit of the extend weight. For local U.S. orders, the extend weight unit for packages is "oz". |
| `length` | STRING | True | The length of the package, the length should be input with two decimal places |
| `width` | STRING | True | width of the package, width should be input with two decimal places |
| `height` | STRING | True | height of the package, height should be input with two decimal places |
| `dimensionUnit` | STRING | True | dimension(eg:length/width/height) Unit. The dimension unit for packages in the United States is "in". while in other countries it is "cm" |
| `channelId` | LONG | False | Channel ID, you can get this ID from "bg.logistics.shippingservices.get" |
| `shipLogisticsType` | STRING | False | Ship logistics type, you can get this type from "temu.logistics.shiplogisticstype.get" |
| `interlineShipCompanyList` | OBJECT[] | False | List of interline ship companies |
| `confirmAcceptance` | STRING[] | False | Confirmation matters for this shipment, enumerated as follows: DENY_CANCELLATION: Reject the cancellation request for this order; DENY_ADDRESS_CHANGE: Reject the address change request for this ord... |
| `signServiceId` | LONG | False | Unique Identifier for Signature Service |
| `pickupEndTime` | LONG | False | The end time for scheduling pickup, with a timestamp of seconds |
| `pickupStartTime` | LONG | False | The start time for scheduling pickup, with a timestamp of seconds |
| `splitSubPackage` | BOOLEAN | False | Is Single SKU Split into Multiple Packages TRUE:Indicates that the scenario involves splitting a single SKU into multiple packages. FALSE or not filled: Indicates that the scenario does not involve... |
| `autoConfirmAfterPickup` | BOOLEAN | False | When autoConfirmAfterPickup = true, Temu will automatically mark the package as shipped once a tracking status update indicates the package has been picked up. This feature only works with logistic... |
| `uspsMailingDateOffset` | INTEGER | False | Per USPS policy, unmanifested labels cannot be printed before the mailingDate. This field sets the mailingDate with enum values {0,1,2,3,4}, indicating the label status changes to manifested at 00:... |
| `retrySendSubRequestList` | OBJECT[] | False | retry subpackage List Information |
| `cooperativeWarehouseShipment` | BOOLEAN | False | The USPS direct shipping method must pass true; If this value is not passed, the system defaults to false; If the non-USPS direct channel fails to meet the cooperation warehouse push order requirem... |
| `shipLaterLimitTime` | STRING | False | Usage Rules: shipLaterLimitTime can be updated only if the order was created with shipLater=true via bg.logistics.shipment.create Available Options by Order Label: - For orders without the "Y2_adva... |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | BOOLEAN |  |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120015038 | Please note that the Buy Shipping service is not applicable to age-restricted product sales. |  |
| 120018074 | The cooperative warehouse mode does not support merging and shipping orders from multiple stores |  |
| 120018079 | The warehouseid has not completed the cooperative warehouse authorization |  |
| 120018080 | The current channel must be shipped later |  |
| 120018082 | This channel is not supported for shipping |  |
| 120018084 | Shipping from a cooperative warehouse and do not support unpacking sub packages |  |
| 120018085 | The channel used by {*} needs to be shipped through a cooperative warehouse |  |
| 120018086 | The current channel USPSMailingDateOffset prohibits the input of 0 |  |
| 120018088 | Failed to buy-shipping on platform , reason :{*} |  |
| 120011020 | Invalid request parameters |  |
| 120018078 | Cannot set shipLaterLimitTime: order was created for immediate shipment. |  |
| 120011018 | Orders with "signature_required_on_delivery" can only buy shipping label from the channel which p... |  |
| 120015507 | Wrong package {*} information. Try again. |  |
| 120011017 | The input warehouse does not support the USPS Ground Advantage shipping service. It is recommende... |  |
| 120012044 | This channel requires passing the exam to gain access. |  |
| 120012061 | The current parent order has a pending risk control alert, It is not recommended to proceed with ... |  |
| 120019009 | Invalid pickup reservation time. See pickupRules for valid options. |  |
| 120011015 | Incomplete warehouse details. Update in Seller Central to process shipment. |  |
| 120015040 | The parent order {*} can not be fulfilled by the selected logistics provider due to the customer'... |  |
| 120015545 | Orders with "signature_required_on_delivery" can only buy shipping label from the channel which p... |  |
| 120015543 | The Order with label "signature_required_on_delivery" and other orders cannot be fulfilled at the... |  |
| 120015037 | This logistics provider does not support this business scenario. |  |
| 120018063 | Your funds have been reserved, so you are temporarily unable to use the 'Buy shipping' function. |  |
| 120018010 | The packages {*} have been canceled. Please fulfill again by Temu non-integrated logistics or Tem... |  |
| 120018062 | COD orders do not allow updating shipping information. |  |
| 120011051 | COD orders do not allow adding sub-packages |  |
| 120012037 | Order can only buy shipping label after the "earliestTimeBuyShippingLabel". |  |
| 120019019 | Invalid pickup time range. Please ensure times are within the next 5 calendar days (8:00-17:00), ... |  |
| 120015032 | You should choose one fulfillment way and fulfill channelId or shipLogisticsType. |  |
| 120011030 | Cooperative warehouse order fulfillment restricted. |  |
| 120011089 | Purchasing shipping labels for Amazon FBA warehouses is not supported. |  |
| 120015531 | Only order with "Y2_advance_sale" label can be fulfilled by warehouse in "other" type. |  |
| 120015532 | shipLaterLimitTime is invalid, please check the valid value for orders with "Y2_advance_sale" label |  |
| 120015533 | The order with "Y2_advance_sale" label and the order without "Y2_advance_sale" label can't be ful... |  |
| 120015534 | Order with "Y2_advance_sale" label should set "shipLater=true" when you are fulfilled by Temu int... |  |
| 120018049 | Failed to update shipping information. Please cancel the appointment for pickup first. |  |
| 120011082 | Failed to buy the shipping label. Please fill in the warehouse management type and warehouse bran... |  |
| 120015518 | The order with "US-to-CA" Label and the order without "US-to-CA" Label can't be shipped together. |  |
| 120011043 | Missing required parameters for 'sendSubRequestList'. |  |
| 120011044 | Exceeded maximum allowed attached packages. Limit is 10. |  |
| 120011045 | For splitSubPackage quantity needs to be 1. |  |
| 120012029 | Warehouse and recipient in different countries splitSubPackage cannot enter "TRUE". |  |
| 120015520 | Call failed: Cannot convert subPackage to self-shipment. |  |
| 120012023 | Address change pending. Please process before shipping. |  |
| 120012030 | Order cancel pending. Please process before shipping. |  |
| 120019016 | Unexpected parameter pickupTime. |  |
| 120019017 | Miss required parameter pickupTime. |  |
| 120018017 | Does not support retrying twice |  |
| 120018013 | Does not support this package retry |  |
| 120015026 | A large items template has been used for the items in this package. Only specified logistics prov... |  |
| 120013007 | Product sku sensitive query fail |  |
| 120013008 | Order lacks necessary sensitive attributes. |  |
| 120013009 | Order lacks necessary sensitive attributes. |  |
| 120018004 | Only allow adjustments to warehouseId, weight, dimensions, shipping company, etc. |  |
| 120011047 | Not support local mall |  |
| 120011048 | Usage channel does not match the confirmation scenario |  |
| 120012031 | The current parent order has a pending risk control alert. |  |
| 120018020 | The BBC order is not allowed. |  |
| 120015027 | A large items template has been used for the items in this package. Only special channels can be ... |  |
| 120018025 | Orders exist after-sales applications, please complete the processing before operation |  |
| 120012007 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |
| 120015521 | The parameter Weight should be integer. |  |
| 120011006 | The parameter warehouseId is invalid. |  |
| 120011072 | The request area is incorrect. Please check the request area and replace it with the correct requ... |  |
| 120012016 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |
| 120018027 | The packageSn is invalid. Please check the request area or if the packageSn is nonexistent etc. |  |
| 120015528 | O-orders of COD type exist in body, and COD type O-orders can only be shipped with Temu Label. |  |
| 120018002 | The package is not in failed state, please check the package status. |  |

---

## `bg.logistics.shipment.document.get`

> **Official docs**: [bg.logistics.shipment.document.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=e2d5025ff75e4c7881cd786912ec8b63)

The bg.logistics.shipment.document.get interface is for sellers to obtain the express delivery waybill which has been fulfilled successfully by Temu-integrated channel so as to facilitate the printing of the express delivery waybill and the package out of the warehouse.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `documentType` | STRING | False | Document Type: - SHIPPING_LABEL_PDF: the document URL will return the shipping label in PDF format for all the carriers you choose. - SHIPPING_LABEL_PNG: the document URL will return the shipping l... |
| `packageSnList` | STRING[] | False | Package List that needs to get the shipping label |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `shippingLabelUrlList` | OBJECT[] | Package List that needs to get the shipping label |
| `warningMessage` | STRING[] | Reason for inability to print waybill |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120018075 | The package {*} only supports shipping from cooperative warehouses and restricts the printing of ... |  |
| 120018012 | USPS labels require manifestation before printing. Check 'shipLabelPrintableTime' via 'bg.logisti... |  |
| 120018010 | The packages {*} have been canceled. Please fulfill again by Temu non-integrated logistics or Tem... |  |
| 120012038 | Order can only get shipping document after the "earliestTimeGetShippingDocument". |  |
| 120011030 | Cooperative warehouse order fulfillment restricted. |  |
| 120018027 | The packageSn is invalid. Please check the request area or if the packageSn is nonexistent etc. |  |

---

## `bg.order.unshipped.package.get`

> **Official docs**: [bg.order.unshipped.package.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=5798cc84b38e4ca59bb60895d66630c9)

The bg.order.unshipped.package.get interface is for sellers to query information about packages that have been fulfilled successfully by Temu-integrated channel.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageNumber` | INTEGER | True | Page number |
| `pageSize` | INTEGER | True | Page size |
| `parentOrderSnList` | STRING[] | False | Parent order number list |
| `orderSnList` | STRING[] | False | Order number list |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `totalItemNum` | INTEGER | Total number of unshipped packages |
| `unshippedPackage` | OBJECT[] | Unshipped package list |
| `packageSn` | STRING | Package Number |
| `carrierId` | LONG | Carrier ID |
| `carrierName` | STRING | Carrier name |
| `trackingNumber` | STRING | Tracking number |
| `packageDetail` | OBJECT | Package info detail |
| `subPackageType` | STRING | Sub package type |
| `subPackageSnList` | STRING[] | Sub package number list |
| `mainPackageSn` | STRING | Main package number |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120011030 | Cooperative warehouse order fulfillment restricted. |  |
| 120011072 | The request area is incorrect. Please check the request area and replace it with the correct requ... |  |
| 120012016 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |

---

## `bg.logistics.shipped.package.confirm`

> **Official docs**: [bg.logistics.shipped.package.confirm](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=aa4f29c85bfe460a8666bb92025a1743)

The bg.logistics.shipped.package.confirm interface is for sellers to support batch conversion of packages that have been fulfilled successfully by Temu-integrated channel but not shipped to shipped, and will be automatically converted to shipped if not converted within 48 hours.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `packageSendInfoList` | OBJECT[] | True | This field is used to confirm the list of packages that have been transitioned to the shipped status. |
| `packageDetail` | OBJECT[] | True | package detail |
| `packageSn` | STRING | True | package number |
| `trackingNumber` | STRING | True | tracking number |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120018087 | The current package {*} is shipped from a cooperative warehouse and manual confirmation of shipme... |  |
| 120018010 | The packages {*} have been canceled. Please fulfill again by Temu non-integrated logistics or Tem... |  |
| 120014002 | The field trackingNumber {*} does not match packageSn {*}. Please check the matching relationship... |  |
| 120011030 | Cooperative warehouse order fulfillment restricted. |  |
| 120018015 | The package has been canceled, please fulfill again by Temu non-integrated logistics or Temu inte... |  |
| 120012012 | There are no shippable orders matching the item. |  |
| 120012004 | The order has been shipped. This submission is not effective for the shipped order. |  |
| 120013002 | Item quantity does not match. |  |
| 120011046 | Sub package not allowed. |  |
| 120015026 | A large items template has been used for the items in this package. Only specified logistics prov... |  |
| 120015027 | A large items template has been used for the items in this package. Only special channels can be ... |  |
| 120018025 | Orders exist after-sales applications, please complete the processing before operation |  |
| 120011072 | The request area is incorrect. Please check the request area and replace it with the correct requ... |  |
| 120012007 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |
| 120012016 | The parentOrder or Order is invalid. Please check if the parentOrder matches the Order, the paren... |  |
| 120018027 | The packageSn is invalid. Please check the request area or if the packageSn is nonexistent etc. |  |

---

## `temu.logistics.label.list.get`

> **Official docs**: [temu.logistics.label.list.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=df97424d08f641f7adf942aa5accde3b)

You can use this API to retrieve shipping label information fulfilled via Temu's platform. Please note that this API is only available for labels generated through the Temu platform.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `packageSnList` | STRING[] | False | package sn list |
| `temuLabelStatus` | INTEGER | False | Temu label status,enumeration values include:{0-Pending, 1-Successful, 2-Failed, 3-Canceled} |
| `printStatus` | INTEGER | False | Print status,enumeration values include:{0-Not printed, 1-Printed} |
| `createAtStart` | INTEGER | False | call begin time |
| `createAtEnd` | INTEGER | False | call end time |
| `trackingNumberList` | STRING[] | False | tracking number list |
| `shippingCompanyIdList` | STRING[] | False | shipping company id list |
| `parentOrderSnList` | STRING[] | False | parent order sn list |
| `pageNumber` | INTEGER | True | current page number of the result |
| `pageSize` | INTEGER | True | page size for pagination |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `totalItemNum` | INTEGER | total item num |
| `shippingLabelInfoList` | OBJECT[] | shipping label info list |
| `packageSn` | STRING | package sn |
| `shippingLabelStatus` | INTEGER | Temu label status,enumeration values include:{0-Pending, 1-Successful, 2-Failed, 3-Canceled} |
| `labelPrintStatus` | INTEGER | Print status,enumeration values include:{0-Not printed, 1-Printed} |
| `createTime` | INTEGER | label call time |
| `orderInfoList` | OBJECT[] | order info list |
| `trackingInfoList` | OBJECT[] | tracking info list |
| `warehouseInfo` | OBJECT | tracking info list |
| `packageDimensionInfo` | OBJECT | package dimension info |
| `cwFulfillNo` | STRING | If using a cooperation warehouse for shipment, this information will return the corresponding order number of the cooperation warehouse |

---

## `temu.logistics.scanform.create`

> **Official docs**: [temu.logistics.scanform.create](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=f70e104a1e114ce4a16bc17fcd7996fb)

The "temu.logistics.scanform.create" interface is for sellers to create scanforms according to the check conditions after entering lists packages.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `packageSnList` | STRING[] | True | package number list |
| `shipCompanyId` | LONG | True | Ship company id |
| `warehouseId` | STRING | True | Warehouse id |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `scanFormInfoList` | OBJECT[] | Scan Form Information |
| `scanFormSn` | STRING | Scan form serial number, the unique identification field when creating a scan form. |
| `packageSnList` | STRING[] | Package number List |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120016063 | The selected packages {*} are fulfilled by a cooperative warehouse. No scan form needs to be gene... |  |
| 120011099 | At least {*} packages must be included in order to generate the corresponding scanform. |  |
| 120016062 | The current packages cannot generate the same scan form. Please request the "temu.logistics.candi... |  |
| 120016061 | The current packages have inconsistent warehouseId. Please request the "temu.logistics.candidate.... |  |
| 120016060 | The current packages have inconsistent shipCompanyID. Please request the "temu.logistics.candidat... |  |
| 120016056 | The selected packages {*} have been associated with other scan forms. |  |
| 120016054 | The mailing date must be between the current date and current date + 7 days (exclusive).Please ch... |  |
| 120016055 | Shipping labels must be successfully bought for the packages.Please check packages {*}. |  |
| 120016053 | Only USPS logistics is supported. Please check packages {*}. |  |
| 120016059 | The destination region must be U.S.. |  |
| 120016051 | The destination region must be consistent. |  |
| 120016052 | The {*} is invalid. Please check the request area or if the packageSn is nonexistent. |  |
| 120011067 | The selected packages exceed the maximum limit of 500. |  |
| 120011001 | System abnormality, please check the data and try again |  |
| 120011002 | Invalid request parameters. |  |
| 120018010 | The packages {*} have been canceled. Please fulfill again by Temu non-integrated logistics or Tem... |  |

---

## `temu.logistics.scanform.get`

> **Official docs**: [temu.logistics.scanform.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=149c9009ef1c4d8294d8ece504db0eb7)

The "temu.logistics.scanform.get" interface is for sellers to get detail information of scanforms such as status of the scanform.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageNumber` | INTEGER | True | Page number for pagination |
| `pageSize` | INTEGER | True | Page size for pagination, max is 10. |
| `scanFormSnList` | STRING[] | False | Scan form serial number list, the lists of the unique identification field when creating a scan form. |
| `shipCompanyIdList` | LONG[] | False | Ship company id list |
| `warehouseIdList` | STRING[] | False | Warehouse id list |
| `scanFormCreateStatus` | INTEGER | False | The status of scan form: 1-under creation; 2-successful; 3-failed. |
| `scanFormCreateTimeStart` | INTEGER | False | Start time for querying scan form creating time with second-level timestamp. |
| `scanFormCreateTimeEnd` | INTEGER | False | End time for querying scan form creating time with second-level timestamp. |
| `trackingNumberList` | STRING[] | False | Tracking number list |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `total` | INTEGER | The total number of scan forms |
| `scanFormInfoList` | OBJECT[] | Scan form information |
| `scanFormCreateStatus` | INTEGER | The status of scan form: 1-under creation; 2-successful; 3-failed. |
| `failReason` | STRING | The reason why the logistics provider returned the failed creation of the scan form. |
| `scanFormSn` | STRING | Scan form id, the unique identification field when creating a scan form. |
| `scanFormNumber` | STRING | Scan form serial number, the unique identification field when creating a scan form. |
| `shipCompanyId` | LONG | Ship company id |
| `shippingCompanyName` | STRING | Ship company name |
| `warehouseId` | STRING | Warehouse id |
| `labelCount` | INTEGER | Label count. The label and the package have a one-to-one relationship. |
| `scanFormCreateTime` | STRING | Scan form create time |
| `scanFormPackageList` | OBJECT[] | The packages information included in the scan form. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120016057 | The pageSize exceeds the maximum limit of 10. |  |
| 120011001 | System abnormality, please check the data and try again |  |
| 120011002 | Invalid request parameters. |  |

---

## `temu.logistics.scanform.document.get`

> **Official docs**: [temu.logistics.scanform.document.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=1c9d0c2fade74f48a6bb22296c6fc509)

The "temu.logistics.scanform.document.get" interface is for sellers to get scanform documents with package numbers.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `scanFormSn` | STRING | True | Scan form serial number, the unique identification field when creating a scan form. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `url` | STRING | Scan form document url with PDF format. The API caller needs to call this URL to get the scan form document in PDF format. This URL will expire in 10 minutes once it is created. If the scan form do... |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120016058 | The status of {*} is failed. Please check the failReason by "temu.logistics.scanform.get". |  |
| 120011070 | The {*} is invalid. Please check the request area or if the scanFormSn is nonexistent. |  |
| 120011001 | System abnormality, please check the data and try again |  |
| 120011002 | Invalid request parameters. |  |

---

## `temu.logistics.candidate.scanform.list.get`

> **Official docs**: [temu.logistics.candidate.scanform.list.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=5b920f670469435f9cbbf9d70ae0b86b)

The "temu.logistics.candidate.scanform.list.get" interface is for sellers to get lists of package numbers that can be used to generate a scanform based on shipCompanyId and warehouseId.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `shipCompanyId` | LONG | True | Ship Company ID |
| `warehouseId` | STRING | True | Warehouse ID |
| `pageNumber` | INTEGER | True | Page number for pagination |
| `pageSize` | INTEGER | True | Page size for pagination, max is 500. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `checkBatchAddScanFormList` | OBJECT[] | Scan Form Information List |
| `packageSnList` | STRING[] | Package Number List |
| `labelCount` | INTEGER | Label count. The label and the package have a one-to-one relationship. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120016059 | The destination region must be U.S.. |  |
| 120016051 | The destination region must be consistent. |  |
| 120011001 | System abnormality, please check the data and try again |  |
| 120011002 | Invalid request parameters. |  |

---

## `temu.logistics.shipment.pickup.reservation.create`

> **Official docs**: [temu.logistics.shipment.pickup.reservation.create](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=aff85d40b1364572a8383bcf5171f75b)

The temu.logistics.shipment.pickup.reservation.create API enables sellers to schedule package pickups. When multiple packages meet the criteria for consolidated pickup appointments, they will be merged into a single reservation (reservationSn). Note: Reservation results must be retrieved via temu.logistics.shipment.pickup.reservation.result.get.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pickupStartTime` | LONG | True | The start time for scheduling pickup, with a timestamp of seconds |
| `pickupEndTime` | LONG | True | The end time for scheduling pickup, with a timestamp of seconds |
| `packageSnList` | STRING[] | True | packageSn list, maximum 50 |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `pickupReservationList` | OBJECT[] | pickupReservationList |
| `pickupStartTime` | LONG | The start time for scheduling pickup, with a timestamp of seconds |
| `pickupEndTime` | LONG | The end time for scheduling pickup, with a timestamp of seconds |
| `packageSnList` | STRING[] | packageSn list, maximum 50 |
| `pickupWarehouseId` | STRING | The identity of warehouse |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120019030 | The number of packages must be less than {*} |  |
| 120019009 | Invalid pickup reservation time. See pickupRules for valid options. |  |
| 120011002 | Invalid request parameters. |  |
| 120019001 | We haven't support the pickup reservation of this channel through open api yet. |  |
| 120019002 | The PackageSn in one api call doesn't match, please make sure they come from the same channel and... |  |
| 120019005 | PackageSn in "packageSnList" is invalid,please have a check. |  |
| 120019006 | The pickup reservation of this pacakge is under going, you can't make the pickup reservation again. |  |
| 120019025 | The pickupStartTime or pickupEndTime is invalid, please get the valid time slot from "bg.logistic... |  |
| 120019023 | There are duplicated packageSn in one api call, please delete one. |  |

---

## `temu.logistics.shipment.pickup.reservation.result.get`

> **Official docs**: [temu.logistics.shipment.pickup.reservation.result.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=5cfaf127fdea4d419c6c9aa9c1b2536a)

The temu.logistics.shipment.pickup.reservation.result.get API retrieves reservation details for the current package. When multiple packages correspond to one reservationSn, the response returns all packages under that reservation.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `packageSnList` | STRING[] | True | packageSn list, maximum 50 |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `reservationResultList` | OBJECT[] | Info List |
| `reservationSn` | STRING | The reservationSn matched by the packageSn. |
| `reservationStatus` | INTEGER | reservationStatus. RESERVING(1, "Reservation"), RESERVE_SUCCESS(2, "Reservation success"), CANCEL(3, "Reservation cancel"), RESERVE_FAIL(4, "Reservation fail"), CANCEL_ING(5, "Reservation canceling"), |
| `packageSnList` | STRING[] | The packageSn under this reservationSn ; if multiple packages exist under the reservationSn , all packages will be returned. |

---

## `temu.logistics.shipment.pickup.reservation.cancel`

> **Official docs**: [temu.logistics.shipment.pickup.reservation.cancel](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=eed978adf76e473e8d7239b0bbc19c9e)

The temu.logistics.shipment.pickup.reservation.cancel API enables sellers to cancel reservationSn.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `reservationSn` | STRING | True | reservation Sn |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 120011002 | Invalid request parameters. |  |
| 120019007 | The reservationSn is invalid. |  |
| 120019010 | The channel don't allow seller cancel the pickup reservation. |  |
| 120019022 | Current reservation status don't allow you to cancel the reservation, only successful reservation... |  |

---

## `temu.track.trackinginfo.get`

> **Official docs**: [temu.track.trackinginfo.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=e4ec6bc629bf42e38346de78b297d349)

Logistics trajectory detail query interface

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `packageSn` | STRING | False | packageSn |
| `language` | STRING | False | language |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `packageSn` | STRING | packageSn |
| `trackingNum` | STRING | Tracking number. Returns only the last-mile tracking number if the parcel is transported in multiple segments. |
| `trackingInfo` | OBJECT[] | The tracking info of the package |
| `logisticsUpdatedAt` | STRING | The time when the tracking information was last updated,in seconds(timestamp). |
| `logisticsStatus` | STRING | Core logistics node status: defaults to English if the requested language is not supported. |
| `statusText` | STRING | Core logistics node description: defaults to the carrier's language if the requested language is not supported. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 170070012 | Unsupported languages, {*} | Change the supported language |
| 170070011 | Tracking Number Not Found | Tracking information for this logistics number was not found. Please confirm the number is correc... |
| 170070010 | Invalid Parameters: {*} | Parameters are invalid or missing. Please check the value and format of the {field name} field. |

---

## `bg.cooperativewarehouse.provider.list`

> **Official docs**: [bg.cooperativewarehouse.provider.list](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=e77d444a60b540039bfa1fc64e3cada7)

cooperate warehouse erp order

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `needAllPlatformProviders` | BOOLEAN | False | needAllPlatformProviders |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `permitsStatus` | INTEGER | permitsStatus |
| `warehouseProviderList` | OBJECT[] | warehouseProviderList |
| `warehouseProviderCode` | STRING | warehouseProviderCode |
| `warehouseProviderBrandName` | STRING | warehouseProviderBrandName |
| `supportedPackageDeliveryType` | INTEGER[] | supportedPackageDeliveryType |
| `supportedShipCompany` | OBJECT[] | supportedShipCompany |
| `regionId` | STRING[] | regionId |
| `cwCustomerCodeList` | STRING[] | cwCustomerCodeList |
| `supportNoCwCustomCode` | INTEGER | supportNoCwCustomCode |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 170020001 | This ERP provider is not supported. |  |
| 170020002 | This mall is not authorized to the cooperative warehouse service provider. |  |
| 170020003 | The parameter is illegal, please check and try again. |  |
| 170020004 | This fulfillment order not exists, please check if the fulfillment number is correct. |  |
| 170020005 | This cooperative warehouse customer code is not match the authorized customer code. |  |

---

## `bg.cooperativewarehouse.token.authorization`

> **Official docs**: [bg.cooperativewarehouse.token.authorization](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=607fb76a2ef943d78e97dadbeca71aad)

Cooperative warehouse token authorization

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `cwAppKey` | STRING | False | cwAppKey |
| `cwAccessToken` | STRING | True | cwAccessToken |
| `cwCustomerCode` | STRING | True | cwCustomerCode |
| `warehouseProviderCode` | STRING | True | warehouseProviderCode |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 170020001 | This ERP provider is not supported. |  |
| 170020002 | This mall is not authorized to the cooperative warehouse service provider. |  |
| 170020003 | The parameter is illegal, please check and try again. |  |
| 170020004 | This fulfillment order not exists, please check if the fulfillment number is correct. |  |
| 170020005 | This cooperative warehouse customer code is not match the authorized customer code. |  |

---

## `bg.cooperativewarehouse.fulfill.submit`

> **Official docs**: [bg.cooperativewarehouse.fulfill.submit](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=d2d218ed9b8c4356aec5033744abe90b)

cooperativewarehouse_fulfill

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `warehouseProviderCode` | STRING | True | cooperative warehouse provider code |
| `authorizeType` | INTEGER | False | Cooperation warehouse authorization methods (0 (using platform authorization information), 1 (directly uploading authorization information) When not transmitted, it defaults to 0 |
| `authorizeKey` | STRING | False | cooperative warehouse authorization app key |
| `authorizeToken` | STRING | False | Cooperative Warehouse Authorization Token, mandatory when authorizeType is 1 |
| `cwCustomerCode` | STRING | False | cooperative warehouse customer code, mandatory when authorizeType is 0 |
| `warehouseCode` | STRING | True | cooperative warehouse code |
| `erpFulfillNo` | STRING | True | erp fulfill number |
| `tailShippingMode` | INTEGER | False | tail shipping mode |
| `logisticsProductCode` | STRING | False | logistics product code |
| `packageSn` | STRING | False | package sn |
| `shipCompanyId` | LONG | False | ship company id |
| `channelId` | LONG | False | channel id |
| `channelVersionId` | LONG | False | channel version id |
| `shipCompanyName` | STRING | False | ship company name |
| `trackingNumber` | STRING | False | trackingNumber |
| `shippingLabelFileType` | STRING | False | ship label file type |
| `shippingLabelFileBase64` | STRING | False | shippingLabelFileBase64 |
| `shipLogisticsType` | STRING | False | shipLogisticsType |
| `orderList` | OBJECT[] | True | sub order list |
| `parentOrderSn` | STRING | True | parent order sn |
| `orderSn` | STRING | True | order sn |
| `skuId` | LONG | False | product sku id (Deprecated) |
| `productSkuId` | LONG | False | product sku id |
| `cwSkuCode` | STRING | True | warehouse product sku code |
| `quantity` | INTEGER | True | product sku quantity |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | response result |
| `cwFulfillNo` | STRING | cwFulfillNo |
| `erpFulfillNo` | STRING | erpFulfillNo |
| `fulfillStatus` | INTEGER | fulfillStatus |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 170020041 | ChannelId, shipCompanyName and logisticType not match, please check! |  |
| 170020040 | The tracking number corresponding to this package does not match the trackingNumber field. |  |
| 170020039 | The package number does not exist. |  |
| 170020038 | The [authorizeType] is 1, and the required parameter [authorizeToken] has not been filled in |  |
| 170020037 | The [authorizeType] is 0, and the required parameter [cwCustomerCode] has not been filled in |  |
| 170020036 | The [tailShippingMode] is 1, and the required parameter [shipLogisticsType] has not been filled in |  |
| 170020035 | The [tailShippingMode] is 1, and the required parameter [channelId] has not been filled in |  |
| 170020034 | The [tailShippingMode] is 1, and the required parameter [shipCompanyId] has not been filled in |  |
| 170020033 | The [tailShippingMode] is 1, and the required parameter [shippingLabelFileBase64] has not been fi... |  |
| 170020032 | The [tailShippingMode] is 1, and the required parameter [shippingLabelFileType] has not been fill... |  |
| 170020031 | [tailShippingMode] is 1, and the required parameter [trackingNumber] has not been filled in |  |
| 170020030 | The [tailShippingMode] is 1, and the required parameter [shipCompanyName] has not been filled in |  |
| 170020029 | The [tailShippingMode] is 1, and the required parameter [packageSn] has not been filled in |  |
| 170020028 | The [tailShippingMode] is 0, and the required parameter [logisticsProductCode] has not been fille... |  |
| 170020027 | Parameter [quantity] is required but not provided in the input |  |
| 170020026 | Parameter [cwSkuCode] is required but not provided in the input |  |
| 170020025 | Parameter [parentOrderSn] is required but not provided in the input |  |
| 170020024 | Parameter [orderSn] is required but not provided in the input |  |
| 170020023 | Parameter [orderList] is required but not provided in the input |  |
| 170020022 | Parameter [erpFulfillNo] is required but not provided in the input |  |
| 170020021 | Parameter [warehouseProviderCode] is required but not provided in the input |  |
| 170020017 | Parameter {*} is required but not provided in the input. |  |
| 170020018 | The [authorizeType] is {*} , and the required parameter {*} has not been filled in. |  |
| 170020019 | The [tailShippingMode] is {*} and the required parameter {*} has not been filled in. |  |
| 170020001 | This ERP provider is not supported. |  |
| 170020002 | This mall is not authorized to the cooperative warehouse service provider. |  |
| 170020003 | The parameter is illegal, please check and try again. |  |
| 170020005 | This cooperative warehouse customer code is not match the authorized customer code. |  |
| 170020009 | This fulfillment order already exists, please submit another one. |  |
| 170020004 | This fulfillment order not exists, please check if the fulfillment number is correct. |  |
| 170020006 | This fulfillment order has wrong tail shipping mode, please check and try again. |  |
| 170020007 | This fulfillment order has wrong shipping label file type, please check and try again. |  |
| 170020008 | This fulfillment order has wrong shipping label file content, please check and try again. |  |
| 170020010 | The service provider does not support shipping label for the current shippingCompanyName. Please ... |  |
| 170020011 | This ship company id not match with the ship company name mapped. |  |
| 170020012 | The parentOrderSn in fulfill order is invalid. |  |
| 170020013 | The service provider has not signed the DPA Agreement of the country and cannot perform the contr... |  |
| 170020014 | The cooperative warehouse service provider returned: API authorization exception, please update t... |  |
| 170020015 | The current order does not support address query, please check! |  |
| 170020016 | Your store has been restricted from using the function of logistics shipping by partner warehouse... |  |

---

## `bg.cooperativewarehouse.fulfill.cancel`

> **Official docs**: [bg.cooperativewarehouse.fulfill.cancel](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=085d46b8a6604228b371e0706ac4af7d)

cooperation warehouse ERP order

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `erpFulfillNo` | STRING | True | erpFulfillNo |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 170020001 | This ERP provider is not supported. |  |
| 170020002 | This mall is not authorized to the cooperative warehouse service provider. |  |
| 170020003 | The parameter is illegal, please check and try again. |  |
| 170020004 | This fulfillment order not exists, please check if the fulfillment number is correct. |  |
| 170020005 | This cooperative warehouse customer code is not match the authorized customer code. |  |

---

## `bg.cooperativewarehouse.fulfill.query`

> **Official docs**: [bg.cooperativewarehouse.fulfill.query](https://partner-us.temu.com/login?redirectUrl=https%3A%2F%2Fpartner-us.temu.com%2Fdocumentation%3Fmenu_code%3Dfb16b05f7a904765aac4af3a24b87d4a%26sub_menu_code%3D343bd5191b0f429580dfaa863906c478)

### Request Parameters

_No additional request parameters._

### Response Parameters

_Standard response format (success, errorCode, errorMsg, result)._

---

## `temu.cooperativewarehouse.skurelationship.create`

### Request Parameters

_No additional request parameters._

### Response Parameters

_Standard response format (success, errorCode, errorMsg, result)._

---

## `temu.cooperativewarehouse.skurelationship.get`

### Request Parameters

_No additional request parameters._

### Response Parameters

_Standard response format (success, errorCode, errorMsg, result)._

---
