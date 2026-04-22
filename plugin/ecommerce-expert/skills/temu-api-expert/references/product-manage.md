# Temu Partner API — Product API — Manage Products

Update, query, list, delete products and SKUs. Manage stock, compliance, sale status, and external serial numbers.

## Table of Contents

- [bg.local.goods.partial.update](#bglocalgoodspartialupdate)
- [bg.local.goods.update](#bglocalgoodsupdate)
- [temu.local.goods.sku.stock.query](#temulocalgoodsskustockquery)
- [bg.local.goods.stock.edit](#bglocalgoodsstockedit)
- [temu.local.goods.delete](#temulocalgoodsdelete)
- [bg.local.goods.sku.list.price.query](#bglocalgoodsskulistpricequery)
- [bg.local.goods.publish.status.get](#bglocalgoodspublishstatusget)
- [bg.local.goods.detail.query](#bglocalgoodsdetailquery)
- [bg.local.goods.sku.list.query](#bglocalgoodsskulistquery)
- [temu.local.sku.list.retrieve](#temulocalskulistretrieve)
- [bg.local.goods.list.query](#bglocalgoodslistquery)
- [temu.local.goods.list.retrieve](#temulocalgoodslistretrieve)
- [temu.local.goods.spec.info.get](#temulocalgoodsspecinfoget)
- [bg.local.goods.category.check](#bglocalgoodscategorycheck)
- [bg.local.goods.property.get](#bglocalgoodspropertyget)
- [bg.local.goods.property.relations](#bglocalgoodspropertyrelations)
- [bg.local.goods.property.relations.level.template](#bglocalgoodspropertyrelationsleveltemplate)
- [bg.local.goods.property.relations.template](#bglocalgoodspropertyrelationstemplate)
- [bg.local.goods.out.sn.set](#bglocalgoodsoutsnset)
- [bg.local.goods.sku.out.sn.set](#bglocalgoodsskuoutsnset)
- [bg.local.compliance.goods.list.query](#bglocalcompliancegoodslistquery)
- [bg.local.goods.compliance.edit](#bglocalgoodscomplianceedit)
- [bg.local.goods.sale.status.set](#bglocalgoodssalestatusset)
- [temu.local.goods.pre.sale.status.edit](#temulocalgoodspresalestatusedit)
- [bg.local.goods.videocoverimage.get](#bglocalgoodsvideocoverimageget)

---

## `bg.local.goods.partial.update`

> **Official docs**: [bg.local.goods.partial.update](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=6de74ed5afe74f89966b3ff23dfd7498)

Edit a subset of the product properties (e.g. description, brand, images, attributes).

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |
| `goodsId` | LONG | True | Product Number |
| `goodsBasic` | OBJECT | False | goods basic |
| `goodsServicePromise` | OBJECT | False | goods service promise |
| `goodsProperty` | OBJECT | False | goods property |
| `goodsOriginInfo` | OBJECT | False | Country/region of Origin |
| `bulletPoints` | STRING[] | False | bullet points |
| `goodsDesc` | STRING | False | goods desc |
| `guideFileInfo` | OBJECT | False | guide file info |
| `goodsSizeChartList` | OBJECT | False | goods size chart list |
| `goodsSizeImage` | STRING[] | False | The URL of the size chart image |
| `skuList` | OBJECT[] | False | sku list |
| `goodsTrademark` | OBJECT | False | goods trademark |
| `goodsVehiclePropertyRelation` | OBJECT | False | Vehicle date |
| `secondHand` | OBJECT | False | second hand info |
| `modifyId` | STRING | False | Product information modification ID, goods is unique, and the corresponding audit results can be queried using this ID in the future |
| `saveMode` | INTEGER | False | ERP product publish status: 1 = Submitted; 2 = Saved as draft |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `goodsId` | LONG | Product ID |
| `productType` | INTEGER | Product type. It is used to describe the type of a product, a product can only belong to one type. The possible enumerated values are presented below. 1: Normal product 2: Custom product 3: Made-to... |
| `skuInfoList` | OBJECT[] | Sku information list |
| `skuId` | LONG | Sku id |
| `outSkuSn` | STRING | External sku code |
| `specList` | OBJECT[] | Specification information |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150011028 | Specification information repeated: [{*}]. |  |
| 150010157 | The groupId is required. |  |
| 150011067 | Invalid preparation time. This product only supports a preparation time range of {*}-{*}. |  |
| 150010257 | For "Made-to-order" products in the food category, "Shelf Life" field should be between 1-10 days. |  |
| 150010256 | This category is not supported for "Made-to-order" products. |  |
| 150011074 | Upload {*} to {*} images |  |
| 150011073 | Use {*} characters or fewer for bullet point |  |
| 150011072 | Bullet point must not exceed {*} |  |
| 150011071 | Use {*} characters or fewer for product description |  |
| 150011070 | Use {*} characters or fewer for product name |  |
| 150011051 | Exceeded the maximum number of uploaded files. |  |
| 150010251 | The value of the "numberOfPieces" field should be between 1-10000. |  |
| 150010239 | For "single set", the "numberOfPieces" field can only be "1" and the "individuallyPacked" field c... |  |
| 150010240 | For "Multi-piece set", "numberOfPieces" needs to be greater than 1. |  |
| 150010241 | The value of the "netContentNumber" field should be between 0-10000. |  |
| 150010242 | The value of the "originTotalNetContentNumber" field should be between 0-10000. |  |
| 150010243 | "multiplePackage" is required, please fill in and try again. |  |
| 150010244 | The "originNetContentNumber"/"originTotalNetContentNumber" and the "netContentUnitCode" field nee... |  |
| 150010245 | Fields "originNetContentNumber" and "originTotalNetContentNumber" cannot be filled in simultaneou... |  |
| 150010246 | The field "originNetContentNumber" can only be filled in for "Single set" and "Multi-piece set". |  |
| 150010247 | The field "originTotalNetContentNumber" can only be filled in for "Mixed set of different product... |  |
| 150010248 | "skuClassification", "numberOfPieces","pieceUnitCode"and "individuallyPacked" are required, |  |
| 150010249 | "originNetContentNumber" field is required, please fill in and try again. |  |
| 150010252 | "originTotalNetContentNumber" field is required, please fill in and try again. |  |
| 150010250 | The field "mixedSetType" can only be filled in for "Mixed set of different products" and "Mixed s... |  |
| 150011027 | The product is missing tax code information. |  |
| 150011066 | The input {*} is incorrect, the aspect ratio is not {*}. |  |
| 150011065 | The input {*} is incorrect, the width and height are below {*}. |  |
| 150011064 | The input {*} is incorrect, image exceeds {*}. |  |
| 150010237 | The newly added specification information is missing in the goods properties. |  |
| 150011063 | Upload at most {*} images for Detail image |  |
| 150011025 | Invalid specification value ID: {*}. |  |
| 150011023 | New version processing. |  |
| 150011022 | Specification information repeated: {*}. |  |
| 150010236 | SKC must not exceed 25 |  |
| 150010235 | Please enter template name of size charts |  |
| 150010234 | The property value of the charger type is invalid. |  |
| 150010149 | The size specification entry is not in one group. |  |
| 150010142 | Template name of size charts duplicate |  |
| 150011060 | Video resolution should not below {*}p |  |
| 150011056 | Use {*} characters or fewer for product description |  |
| 150011024 | The country/region of origin is filled in incorrectly, please select a valid value given by the s... |  |
| 150011019 | The input {*}:{*} is incorrect, please modify it. |  |
| 150011018 | Price currency {*} can have at most {*} decimal points. |  |
| 150011010 | The keyword attribute [{*}] is required, please fill in accurately and appropriately |  |
| 150011006 | Shipping template binding error: {*} |  |
| 150011004 | Supports up to {*} images of product label for country/region of origin. |  |
| 150010224 | Unsupported value for Unit count. |  |
| 150010225 | For mixed sets, fields do not need to be filled in. |  |
| 150010226 | SKU type field is required, please fill in and try again. |  |
| 150010227 | The value should be between 0 and 10000. |  |
| 150010228 | Unsupported value for Unit type. |  |
| 150010232 | The "Condition" field should not be filled in for this product. |  |
| 150010231 | The "Condition" field cannot be edited after the product is published. |  |
| 150010230 | For used-product, "Condiiton" field is required. |  |
| 150010223 | Second-hand stores can only list books and consumer electronics. |  |
| 150011003 | Invalid Request Parameters [{*}] |  |
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010007 | Enter the correct property |  |
| 150010008 | Category not found |  |
| 150010009 | Enter the product name |  |
| 150010010 | Use 500 characters or fewer for product name |  |
| 150010011 | Only use letters, numbers and common punctuation for product name |  |
| 150010012 | Use 2000 characters or fewer for product description |  |
| 150010013 | Bullet point must not exceed 5 |  |
| 150010014 | Use 200 characters or fewer for bullet point |  |
| 150010015 | Value for apparel SKC is required |  |
| 150010016 | Add at least one SKU |  |
| 150010017 | Some SKU specifications are empty |  |
| 150010018 | Invalid handling time |  |
| 150010019 | Invalid fulfillment channel |  |
| 150010020 | Upload 3 to 10 images |  |
| 150010021 | Upload at most one video |  |
| 150010022 | Upload image URL link |  |
| 150010023 | Upload the video |  |
| 150010024 | Upload 3 to 10 images |  |
| 150010025 | Select the shipping template |  |
| 150010026 | Weight must be greater than 0 |  |
| 150010027 | Variant too long |  |
| 150010028 | Quantity must be between 0 and 1000000 |  |
| 150010029 | Incorrect price unit |  |
| 150010030 | Price input error |  |
| 150010031 | Shipping template not found |  |
| 150010032 | The size chart parameters are abnormal |  |
| 150010033 | Complete the size chart |  |
| 150010034 | Only use numbers for size chart |  |
| 150010035 | Size chart element value exceeds limit |  |
| 150010036 | Enter the US size |  |
| 150010038 | Size element is required |  |
| 150010039 | US size must be an integer or a decimal ending in 0.5 |  |
| 150010040 | Complete the required fields |  |
| 150010041 | List price must be greater than base price |  |
| 150010042 | Category unavailable |  |
| 150010043 | Chinese characters not allowed in text |  |
| 150010044 | Special characters not allowed in text |  |
| 150010045 | Incorrect text language |  |
| 150010046 | Invalid image format |  |
| 150010047 | Inappropriate content |  |
| 150010048 | Upload product carousel images |  |
| 150010049 | Upload SKU thumbnail image |  |
| 150010050 | Upload SKC carousel images |  |
| 150010051 | Invalid video |  |
| 150010052 | Rich text not supported |  |
| 150010053 | Upload 3 to 10 images |  |
| 150010054 | Invalid image |  |
| 150010055 | Incorrect image ratio |  |
| 150010056 | Image exceeds 3MB |  |
| 150010057 | Width below 1340px, height below 1785px |  |
| 150010058 | Width and Height below 800px |  |
| 150010059 | Video length exceeds 180 seconds |  |
| 150010060 | Video exceeds 100MB |  |
| 150010061 | Incorrect video ratio |  |
| 150010062 | Video resolution below 720P |  |
| 150010063 | Invalid video format |  |
| 150010065 | SKU must not exceed 500 |  |
| 150010066 | Published variants cannot be deleted |  |
| 150010067 | For non-apparel categories, only one SKC is allowed |  |
| 150010068 | Apparel category SKC's specId is invalid |  |
| 150010069 | SKC specification does not exist within the SKU specifications |  |
| 150010070 | Partial SKU specification information is incomplete |  |
| 150010071 | Parent specification ID retrieval failed |  |
| 150010072 | Number of specifications exceeds limit |  |
| 150010073 | SKU specification information is inconsisten |  |
| 150010074 | The number of SKUs and the product of specifications do not match |  |
| 150010075 | Within the same SKC, SKU specification value IDs are duplicated |  |
| 150010076 | SKU specification value ID is incorrect |  |
| 150010077 | SKU's parent specifications are inconsistent |  |
| 150010078 | Product must have at least one SKC |  |
| 150010079 | The sub-specification names for a single SKU are duplicated |  |
| 150010080 | If an SKC is in a listed status, then at least one SKU must be in a listed status |  |
| 150010081 | If goods are in a listed status, then at least one SKC must be in a listed status |  |
| 150010082 | Base price must be greater than 0 with valid currency |  |
| 150010083 | List price must be greater than base price |  |
| 150010084 | Invalid currency |  |
| 150010085 | List price for the same color must match |  |
| 150010086 | Base price for the same color must match |  |
| 150010087 | Invalid currency |  |
| 150010088 | Quantity must be between 0 and 1000000 |  |
| 150010089 | Published SKU cannot be deleted |  |
| 150010090 | SKU duplicated |  |
| 150010091 | Only use letters, numbers and common punctuation for contribution SKU |  |
| 150010092 | Invalid attribute |  |
| 150010093 | Invalid variant |  |
| 150010094 | Attribute or Specification Error |  |
| 150010095 | Variant cannot be edited |  |
| 150010096 | Refresh for latest version |  |
| 150010097 | Category attribute template is abnormal, publishing products is not allowed |  |
| 150010098 | Product deleted |  |
| 150010099 | Product blocked |  |
| 150010100 | Invalid shop |  |
| 150010101 | The product type does not support listing |  |
| 150010102 | The product type does not support modification |  |
| 150010103 | System error: Create a new product |  |
| 150010104 | Refresh for latest version |  |
| 150010105 | Mall information not found |  |
| 150010106 | Shop status abnormal |  |
| 150010107 | Shipping address abnormal |  |
| 150010108 | Complete the shop commission info |  |
| 150010109 | Complete the certification |  |
| 150010110 | Editing Disabled During Review |  |
| 150010111 | Refresh for latest version |  |
| 150010112 | Refresh for latest version |  |
| 150010113 | Apparel SKC attribute should be color type |  |
| 150010114 | SKU duplicated |  |
| 150010115 | Product processing, please try again later. |  |
| 150010116 | Complete the certification |  |
| 150010117 | Add the product guides or documents |  |
| 150010118 | Add the actual photo |  |
| 150010119 | Attribute input is non-compliant |  |
| 150010120 | Approved certification cannot be edited |  |
| 150010121 | Complete the compliance information |  |
| 150010122 | Product processing, please update the certifications later |  |
| 150010123 | SKU must not exceed 500 |  |
| 150010124 | The catId not a leaf category |  |
| 150010125 | Non-existent parentSpecId |  |
| 150010126 | Video exceeds 300MB |  |
| 150010127 | Video length exceeds 60 seconds |  |
| 150010128 | Incorrect image dimensions |  |
| 150010129 | Image exceeds 3MB |  |
| 150010130 | Please add at least two size charts. |  |
| 150010132 | Incorrect file format |  |
| 150010133 | File size is too large. |  |
| 150010134 | Complete the trademark or brand information |  |
| 150010135 | Re-check the trademark or brand information. |  |
| 150010139 | Detail images must not exceed 49 |  |
| 150010140 | For Books, only one SKU is allowed |  |
| 150010131 | Pricing in progress |  |
| 150010138 | Price review status or draft status cannot be approved |  |
| 150010136 | Not in pricing status, no negotiate |  |
| 150010137 | The price is higher than the last offer |  |
| 150010141 | Price input error |  |
| 150010162 | Invalid listPriceType |  |
| 150010163 | Please enter list price |  |
| 150010177 | No more than 3 links can be added |  |
| 150010178 | Use 100 characters or fewer for the explanation |  |
| 150010179 | The compliance information entered incorrectly. |  |
| 150010180 | The compliance information exceeds the maximum number of characters allowed. |  |
| 150010181 | Up to 10 compliance information can be entered. |  |
| 150010182 | The compliance information must contain numbers. |  |
| 150010183 | The compliance information cannot include Chinese characters. |  |
| 150010184 | The compliance information must include letters. |  |
| 150010185 | The compliance information should be entered in the local language. |  |
| 150010186 | The compliance information exceeds the maximum number of characters allowed. |  |
| 150010187 | The compliance information contains prohibited content. |  |
| 150010176 | Select the manufacturer. |  |
| 150010165 | Manufacturer is not available. |  |
| 150010166 | Failed to add the manufacturer. |  |
| 150010167 | Select the responsible person. |  |
| 150010168 | Responsible person is not available. |  |
| 150010169 | Failed to add the responsible person. |  |
| 150010188 | The mall and goods not match. |  |
| 150010189 | The sku and goods not match |  |
| 150010190 | The sku repeat in batch change sku price |  |
| 150010191 | The reason repeat in batch change sku price |  |
| 150010192 | Clothes sku supplier price or reason not equal |  |
| 150010197 | The count of reason is over size. |  |
| 150010198 | The count of SKU is over size. |  |
| 150010200 | Please check and enter the correct compliance information. |  |
| 150010201 | Due to the low pricing assessment approval rate recently, we will limit the number of products th... |  |
| 150010202 | Invalid unit for weight/Invalid unit for volume |  |
| 150010203 | This product doesn't belong to this shop. |  |
| 150010204 | SKU cannot be added. |  |
| 150010205 | You can edit the product after the processing is complete. |  |
| 150010206 | No editing allowed during qualification review |  |
| 150010208 | The relation id or type can not be empty |  |
| 150010209 | The relation type is not match |  |
| 150010210 | The property value id is not exist |  |
| 150010211 | The relation type is not allowed |  |
| 150010212 | The relation id is wrong |  |
| 150010213 | The goods property relation not exist |  |
| 150011000 | Attribute or Specification Error: {*} |  |

---

## `bg.local.goods.update`

> **Official docs**: [bg.local.goods.update](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=b05f4b7598fb4dc7ac47c864aa5d5fc4)

Edit all properties (e.g. description, brand, images, attributes) of a product.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False | request |
| `language` | STRING | False | Language |
| `goodsId` | LONG | True | Product Number |
| `goodsBasic` | OBJECT | False | goods basic |
| `goodsServicePromise` | OBJECT | False | goods service promise |
| `goodsProperty` | OBJECT | False | goods property |
| `goodsOriginInfo` | OBJECT | False | Country/region of Origin |
| `bulletPoints` | STRING[] | False | bullet points |
| `goodsDesc` | STRING | False | goods desc |
| `guideFileInfo` | OBJECT | False | guide file info |
| `goodsSizeChartList` | OBJECT | False | goods size chart list |
| `goodsSizeImage` | STRING[] | False | The URL of the size chart image |
| `skuList` | OBJECT[] | True | sku list |
| `goodsTrademark` | OBJECT | False | goods trademark |
| `goodsVehiclePropertyRelation` | OBJECT | False | Vehicle data |
| `secondHand` | OBJECT | False | second hand info |
| `secondHandGoods` | BOOLEAN | False | whether it's second hand |
| `level` | INTEGER | False | condition |
| `modifyId` | STRING | False | Product information modification ID, goods is unique, and the corresponding audit results can be queried using this ID in the future |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `goodsId` | LONG | Product ID |
| `productType` | INTEGER | Product type. It is used to describe the type of a product, a product can only belong to one type. The possible enumerated values are presented below. 1: Normal product 2: Custom product 3: Made-to... |
| `skuInfoList` | OBJECT[] | Sku information list |
| `skuId` | LONG | Sku id |
| `outSkuSn` | STRING | External sku code |
| `specList` | OBJECT[] | Specification information |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150011028 | Specification information repeated: [{*}]. |  |
| 150010157 | The groupId is required. |  |
| 150011067 | Invalid preparation time. This product only supports a preparation time range of {*}-{*}. |  |
| 150010257 | For "Made-to-order" products in the food category, "Shelf Life" field should be between 1-10 days. |  |
| 150010256 | This category is not supported for "Made-to-order" products. |  |
| 150011074 | Upload {*} to {*} images |  |
| 150011073 | Use {*} characters or fewer for bullet point |  |
| 150011072 | Bullet point must not exceed {*} |  |
| 150011071 | Use {*} characters or fewer for product description |  |
| 150011070 | Use {*} characters or fewer for product name |  |
| 150011051 | Exceeded the maximum number of uploaded files. |  |
| 150010251 | The value of the "numberOfPieces" field should be between 1-10000. |  |
| 150010239 | For "single set", the "numberOfPieces" field can only be "1" and the "individuallyPacked" field c... |  |
| 150010240 | For "Multi-piece set", "numberOfPieces" needs to be greater than 1. |  |
| 150010241 | The value of the "netContentNumber" field should be between 0-10000. |  |
| 150010242 | The value of the "originTotalNetContentNumber" field should be between 0-10000. |  |
| 150010243 | "multiplePackage" is required, please fill in and try again. |  |
| 150010244 | The "originNetContentNumber"/"originTotalNetContentNumber" and the "netContentUnitCode" field nee... |  |
| 150010245 | Fields "originNetContentNumber" and "originTotalNetContentNumber" cannot be filled in simultaneou... |  |
| 150010246 | The field "originNetContentNumber" can only be filled in for "Single set" and "Multi-piece set". |  |
| 150010247 | The field "originTotalNetContentNumber" can only be filled in for "Mixed set of different product... |  |
| 150010248 | "skuClassification", "numberOfPieces","pieceUnitCode"and "individuallyPacked" are required, |  |
| 150010249 | "originNetContentNumber" field is required, please fill in and try again. |  |
| 150010252 | "originTotalNetContentNumber" field is required, please fill in and try again. |  |
| 150010250 | The field "mixedSetType" can only be filled in for "Mixed set of different products" and "Mixed s... |  |
| 150011027 | The product is missing tax code information. |  |
| 150011066 | The input {*} is incorrect, the aspect ratio is not {*}. |  |
| 150011065 | The input {*} is incorrect, the width and height are below {*}. |  |
| 150011064 | The input {*} is incorrect, image exceeds {*}. |  |
| 150010237 | The newly added specification information is missing in the goods properties. |  |
| 150011063 | Upload at most {*} images for Detail image |  |
| 150011025 | Invalid specification value ID: {*}. |  |
| 150011023 | New version processing. |  |
| 150011022 | Specification information repeated: {*}. |  |
| 150010236 | SKC must not exceed 25 |  |
| 150010235 | Please enter template name of size charts |  |
| 150010234 | The property value of the charger type is invalid. |  |
| 150010149 | The size specification entry is not in one group. |  |
| 150010142 | Template name of size charts duplicate |  |
| 150011060 | Video resolution should not below {*}p |  |
| 150011056 | Use {*} characters or fewer for product description |  |
| 150011024 | The country/region of origin is filled in incorrectly, please select a valid value given by the s... |  |
| 150011019 | The input {*}:{*} is incorrect, please modify it. |  |
| 150011018 | Price currency {*} can have at most {*} decimal points. |  |
| 150011010 | The keyword attribute [{*}] is required, please fill in accurately and appropriately |  |
| 150011006 | Shipping template binding error: {*} |  |
| 150011004 | Supports up to {*} images of product label for country/region of origin. |  |
| 150010224 | Unsupported value for Unit count. |  |
| 150010225 | For mixed sets, fields do not need to be filled in. |  |
| 150010226 | SKU type field is required, please fill in and try again. |  |
| 150010227 | The value should be between 0 and 10000. |  |
| 150010228 | Unsupported value for Unit type. |  |
| 150010232 | The "Condition" field should not be filled in for this product. |  |
| 150010231 | The "Condition" field cannot be edited after the product is published. |  |
| 150010230 | For used-product, "Condiiton" field is required. |  |
| 150010223 | Second-hand stores can only list books and consumer electronics. |  |
| 150011003 | Invalid Request Parameters [{*}] |  |
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010007 | Enter the correct property |  |
| 150010008 | Category not found |  |
| 150010009 | Enter the product name |  |
| 150010010 | Use 500 characters or fewer for product name |  |
| 150010011 | Only use letters, numbers and common punctuation for product name |  |
| 150010012 | Use 2000 characters or fewer for product description |  |
| 150010013 | Bullet point must not exceed 5 |  |
| 150010014 | Use 200 characters or fewer for bullet point |  |
| 150010015 | Value for apparel SKC is required |  |
| 150010016 | Add at least one SKU |  |
| 150010017 | Some SKU specifications are empty |  |
| 150010018 | Invalid handling time |  |
| 150010019 | Invalid fulfillment channel |  |
| 150010020 | Upload 3 to 10 images |  |
| 150010021 | Upload at most one video |  |
| 150010022 | Upload image URL link |  |
| 150010023 | Upload the video |  |
| 150010024 | Upload 3 to 10 images |  |
| 150010025 | Select the shipping template |  |
| 150010026 | Weight must be greater than 0 |  |
| 150010027 | Variant too long |  |
| 150010028 | Quantity must be between 0 and 1000000 |  |
| 150010029 | Incorrect price unit |  |
| 150010030 | Price input error |  |
| 150010031 | Shipping template not found |  |
| 150010032 | The size chart parameters are abnormal |  |
| 150010033 | Complete the size chart |  |
| 150010034 | Only use numbers for size chart |  |
| 150010035 | Size chart element value exceeds limit |  |
| 150010036 | Enter the US size |  |
| 150010038 | Size element is required |  |
| 150010039 | US size must be an integer or a decimal ending in 0.5 |  |
| 150010040 | Complete the required fields |  |
| 150010041 | List price must be greater than base price |  |
| 150010042 | Category unavailable |  |
| 150010043 | Chinese characters not allowed in text |  |
| 150010044 | Special characters not allowed in text |  |
| 150010045 | Incorrect text language |  |
| 150010046 | Invalid image format |  |
| 150010047 | Inappropriate content |  |
| 150010048 | Upload product carousel images |  |
| 150010049 | Upload SKU thumbnail image |  |
| 150010050 | Upload SKC carousel images |  |
| 150010051 | Invalid video |  |
| 150010052 | Rich text not supported |  |
| 150010053 | Upload 3 to 10 images |  |
| 150010054 | Invalid image |  |
| 150010055 | Incorrect image ratio |  |
| 150010056 | Image exceeds 3MB |  |
| 150010057 | Width below 1340px, height below 1785px |  |
| 150010058 | Width and Height below 800px |  |
| 150010059 | Video length exceeds 180 seconds |  |
| 150010060 | Video exceeds 100MB |  |
| 150010061 | Incorrect video ratio |  |
| 150010062 | Video resolution below 720P |  |
| 150010063 | Invalid video format |  |
| 150010065 | SKU must not exceed 500 |  |
| 150010066 | Published variants cannot be deleted |  |
| 150010067 | For non-apparel categories, only one SKC is allowed |  |
| 150010068 | Apparel category SKC's specId is invalid |  |
| 150010069 | SKC specification does not exist within the SKU specifications |  |
| 150010070 | Partial SKU specification information is incomplete |  |
| 150010071 | Parent specification ID retrieval failed |  |
| 150010072 | Number of specifications exceeds limit |  |
| 150010073 | SKU specification information is inconsisten |  |
| 150010074 | The number of SKUs and the product of specifications do not match |  |
| 150010075 | Within the same SKC, SKU specification value IDs are duplicated |  |
| 150010076 | SKU specification value ID is incorrect |  |
| 150010077 | SKU's parent specifications are inconsistent |  |
| 150010078 | Product must have at least one SKC |  |
| 150010079 | The sub-specification names for a single SKU are duplicated |  |
| 150010080 | If an SKC is in a listed status, then at least one SKU must be in a listed status |  |
| 150010081 | If goods are in a listed status, then at least one SKC must be in a listed status |  |
| 150010082 | Base price must be greater than 0 with valid currency |  |
| 150010083 | List price must be greater than base price |  |
| 150010084 | Invalid currency |  |
| 150010085 | List price for the same color must match |  |
| 150010086 | Base price for the same color must match |  |
| 150010087 | Invalid currency |  |
| 150010088 | Quantity must be between 0 and 1000000 |  |
| 150010089 | Published SKU cannot be deleted |  |
| 150010090 | SKU duplicated |  |
| 150010091 | Only use letters, numbers and common punctuation for contribution SKU |  |
| 150010092 | Invalid attribute |  |
| 150010093 | Invalid variant |  |
| 150010094 | Attribute or Specification Error |  |
| 150010095 | Variant cannot be edited |  |
| 150010096 | Refresh for latest version |  |
| 150010097 | Category attribute template is abnormal, publishing products is not allowed |  |
| 150010098 | Product deleted |  |
| 150010099 | Product blocked |  |
| 150010100 | Invalid shop |  |
| 150010101 | The product type does not support listing |  |
| 150010102 | The product type does not support modification |  |
| 150010103 | System error: Create a new product |  |
| 150010104 | Refresh for latest version |  |
| 150010105 | Mall information not found |  |
| 150010106 | Shop status abnormal |  |
| 150010107 | Shipping address abnormal |  |
| 150010108 | Complete the shop commission info |  |
| 150010109 | Complete the certification |  |
| 150010110 | Editing Disabled During Review |  |
| 150010111 | Refresh for latest version |  |
| 150010112 | Refresh for latest version |  |
| 150010113 | Apparel SKC attribute should be color type |  |
| 150010114 | SKU duplicated |  |
| 150010115 | Product processing, please try again later. |  |
| 150010116 | Complete the certification |  |
| 150010117 | Add the product guides or documents |  |
| 150010118 | Add the actual photo |  |
| 150010119 | Attribute input is non-compliant |  |
| 150010120 | Approved certification cannot be edited |  |
| 150010121 | Complete the compliance information |  |
| 150010122 | Product processing, please update the certifications later |  |
| 150010123 | SKU must not exceed 500 |  |
| 150010124 | The catId not a leaf category |  |
| 150010125 | Non-existent parentSpecId |  |
| 150010126 | Video exceeds 300MB |  |
| 150010127 | Video length exceeds 60 seconds |  |
| 150010128 | Incorrect image dimensions |  |
| 150010129 | Image exceeds 3MB |  |
| 150010130 | Please add at least two size charts. |  |
| 150010132 | Incorrect file format |  |
| 150010133 | File size is too large. |  |
| 150010134 | Complete the trademark or brand information |  |
| 150010135 | Re-check the trademark or brand information. |  |
| 150010139 | Detail images must not exceed 49 |  |
| 150010140 | For Books, only one SKU is allowed |  |
| 150010131 | Pricing in progress |  |
| 150010138 | Price review status or draft status cannot be approved |  |
| 150010136 | Not in pricing status, no negotiate |  |
| 150010137 | The price is higher than the last offer |  |
| 150010141 | Price input error |  |
| 150010162 | Invalid listPriceType |  |
| 150010163 | Please enter list price |  |
| 150010177 | No more than 3 links can be added |  |
| 150010178 | Use 100 characters or fewer for the explanation |  |
| 150010179 | The compliance information entered incorrectly. |  |
| 150010180 | The compliance information exceeds the maximum number of characters allowed. |  |
| 150010181 | Up to 10 compliance information can be entered. |  |
| 150010182 | The compliance information must contain numbers. |  |
| 150010183 | The compliance information cannot include Chinese characters. |  |
| 150010184 | The compliance information must include letters. |  |
| 150010185 | The compliance information should be entered in the local language. |  |
| 150010186 | The compliance information exceeds the maximum number of characters allowed. |  |
| 150010187 | The compliance information contains prohibited content. |  |
| 150010176 | Select the manufacturer. |  |
| 150010165 | Manufacturer is not available. |  |
| 150010166 | Failed to add the manufacturer. |  |
| 150010167 | Select the responsible person. |  |
| 150010168 | Responsible person is not available. |  |
| 150010169 | Failed to add the responsible person. |  |
| 150010188 | The mall and goods not match. |  |
| 150010189 | The sku and goods not match |  |
| 150010190 | The sku repeat in batch change sku price |  |
| 150010191 | The reason repeat in batch change sku price |  |
| 150010192 | Clothes sku supplier price or reason not equal |  |
| 150010197 | The count of reason is over size. |  |
| 150010198 | The count of SKU is over size. |  |
| 150010200 | Please check and enter the correct compliance information. |  |
| 150010201 | Due to the low pricing assessment approval rate recently, we will limit the number of products th... |  |
| 150010202 | Invalid unit for weight/Invalid unit for volume |  |
| 150010203 | This product doesn't belong to this shop. |  |
| 150010204 | SKU cannot be added. |  |
| 150010205 | You can edit the product after the processing is complete. |  |
| 150010206 | No editing allowed during qualification review |  |
| 150010208 | The relation id or type can not be empty |  |
| 150010209 | The relation type is not match |  |
| 150010210 | The property value id is not exist |  |
| 150010211 | The relation type is not allowed |  |
| 150010212 | The relation id is wrong |  |
| 150010213 | The goods property relation not exist |  |
| 150011000 | Attribute or Specification Error: {*} |  |

---

## `temu.local.goods.sku.stock.query`

> **Official docs**: [temu.local.goods.sku.stock.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=f14a3f28b654441b80f90e76a0a77c6e)

local-local goods B

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |
| `outSkuSnList` | STRING[] | False | External SKU Code List |
| `skuIdList` | LONG[] | False | sku id list |
| `goodsId` | LONG | False | goods id |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT | Result |
| `stockList` | OBJECT[] | Stock Details |
| `goodsId` | LONG | Goods Id |
| `skuStockInfoList` | OBJECT[] | SKU Stock Details |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |

---

## `bg.local.goods.stock.edit`

> **Official docs**: [bg.local.goods.stock.edit](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=429ffa60b265451d9421cd5a2004eeef)

Edit product stock with full-update and diff-update

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsId` | LONG | True | Goods Id |
| `stockType` | INTEGER | False | Stock type. Enumeration values: 0 - self ordinary stock, 1 - self Pre-sale stock; default is self ordinary stock if not filled. |
| `skuStockChangeList` | OBJECT[] | False | skuStockChangeList, means the you can modify stock by diff stock |
| `skuStockTargetList` | OBJECT[] | False | skuStockTargetList,means the you can modify stock by full update the stock to a target level |
| `skuId` | LONG | True | Goods Sku Id |
| `stockTarget` | INTEGER | True | Stock target value, when you set the target stock value, sku's stock will be updated to the target level |
| `requestUniqueKey` | STRING | False | Unique Request Id, if you setted, then it wll be rejected for duplicated request |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT |  |
| `goodsId` | LONG | Goods Id |
| `skuStockEditStatusInfoList` | OBJECT[] | skuStockEditStatusInfoList |
| `operateResult` | BOOLEAN | Stock change result, if true means success |
| `msg` | STRING | Result detail information |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150013003 | Only one stock adjustment method can be active at a time |  |
| 150013002 | Quantity must be between 0 and 1000000 |  |
| 150013001 | Duplicate SKUs detected. Please remove them and try again |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |

---

## `temu.local.goods.delete`

> **Official docs**: [temu.local.goods.delete](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=97853cce1f5140e0aa302b5e530a8c99)

Product deletion

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsId` | LONG | True | goodsId |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `success` | BOOLEAN | delete result |
| `errorMsg` | STRING | error message |

---

## `bg.local.goods.sku.list.price.query`

> **Official docs**: [bg.local.goods.sku.list.price.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=e273cf89dd2747da80e1a106c1ae3dce)

This is an API for batch querying the latest supply prices of SKUs for local-to-local goods.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `querySupplierPriceBaseList` | OBJECT[] | True | Query supplier price base list |
| `goodsId` | LONG | True | Goods ID |
| `skuIdList` | LONG[] | True | SKU ID List |
| `language` | STRING | False | Language |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT | Result |
| `success` | BOOLEAN | Success |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010105 | Mall information not found |  |
| 150010003 | Invalid Request Parameters |  |
| 150010002 | System error, please try again later |  |

---

## `bg.local.goods.publish.status.get`

> **Official docs**: [bg.local.goods.publish.status.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=1d70452c1eba40a2b2382fb08833ae4e)

Batch Query Product Publication Status

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsIdList` | LONG[] | True | Goods Id List |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT | result |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |

---

## `bg.local.goods.detail.query`

> **Official docs**: [bg.local.goods.detail.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=9ebbd5d269014322ad4a6c123b1dfdae)

Query local goods detail

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |
| `goodsId` | LONG | True | goods id |
| `versionQueryType` | INTEGER | False | A flag to indicate what product information to retrieve - 1: Retrieves the latest version of the product information that is currently under review. - 2: Retrieves a snapshot of the product informa... |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `goodsId` | LONG | Product ID |
| `catId` | LONG | The ID of the category of this product. It must be a leaf category that corresponds to the category tree type specified in the category version property. |
| `subStatus` | INTEGER | Product Draft Status |
| `goodsName` | STRING | Product Name |
| `goodsDesc` | STRING | Goods Desc |
| `bulletPoints` | STRING[] | Product Selling Point |
| `customized` | BOOLEAN | Whether Customized Product |
| `productType` | INTEGER | Product type. It is used to describe the type of a product, a product can only belong to one type. The possible enumerated values are presented below. 1: Normal product 2: Custom product 3: Made-to... |
| `sourceSiteInfo` | OBJECT | Source site roduct ID |
| `targetSiteInfo` | OBJECT[] | Target site Product ID |
| `goodsGallery` | OBJECT | A list of images and video to display in the product gallery. Note: - Max number of image URIs: 49 - Max number of video URIs: 1 - Arrange your image URIs in the sequence that they should appear on... |
| `importDesignation` | STRING | Only for USA. If made in USA from imported materials select "Made in USA and Imported." If some units are from USA and some imported select "Made in USA or Imported." If made in USA from Mexican ma... |
| `outGoodsSn` | STRING | The code provided by the platform to providers for marking and managing parent product links, filled in by the merchant. This is used to associate the SKU between TikTok Shop and the external ecomm... |
| `goodsServicePromise` | OBJECT | Merchant Service Information |
| `goodsProperties` | OBJECT[] | Product General Attributes |
| `goodsTrademark` | OBJECT | Trademark Information |
| `goodsSizeChartList` | OBJECT | Product Size Information (Note: Sets may consist of multiple size charts) |
| `goodsSizeImage` | STRING[] | The URL of the size chart image |
| `goodsOriginInfo` | OBJECT | Goods Origin Information |
| `secondHand` | OBJECT | second hand info |
| `itemTaxCode` | STRING | Tax Code |
| `skuList` | OBJECT[] | Sku Commit Query List |
| `saveModeStatus` | INTEGER | Seller review status of products automatically published to Temu |

---

## `bg.local.goods.sku.list.query`

> **Official docs**: [bg.local.goods.sku.list.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=87a0d398417049bfbeb5b190f68a22b2)

Get sku list, as well as get  Variants

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageNo` | INTEGER | False | Page number |
| `pageSize` | INTEGER | False | Page size, with a limit of 100 items per page |
| `orderField` | STRING | False | Sorting field. Supports sorting by goodsId, createTime, goodsName, outGoodsSn, quantity, price. Sorted by creation time by default. |
| `orderType` | INTEGER | False | Sorting type. 0 for descending order, 1 for ascending order. In descending order by default |
| `skuSearchType` | INTEGER | True | Product status: 2 - Available for sale, 3 - Not available for sale |
| `searchText` | STRING | False | Search text: Supports searching by goodsName, goodsId, or SKU code |
| `statusFilterType` | INTEGER | False | Subtype filter type |
| `crtFrom` | LONG | False | Start time of creation, enter timestamp, 13 bits in milliseconds |
| `crtTo` | LONG | False | end time of creation, enter timestamp, 13 bits in milliseconds |
| `skuIdList` | LONG[] | False | sku id list |
| `catIdList` | LONG[] | False | Cat id list, supports both leaf and non-leaf cat id, supports batch |
| `skuStatusFilterType` | INTEGER | True | Product status filter New version field |
| `skuSubStatusFilterType` | INTEGER | False | Product sub-status filter New version field |
| `skuStatusChangeTimeFrom` | LONG | False | Start time of SKU status change, pass parameters by timestamp |
| `skuStatusChangeTimeTo` | LONG | False | End time of SKU status change, pass parameters by timestamp |
| `goodsSearchTags` | INTEGER[] | False | Goods search tags: 1-Low traffic, 4-Restricted traffic |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT |  |
| `pageNo` | INTEGER | Page number |
| `total` | LONG | Total count |
| `skuList` | OBJECT[] | Product list result |
| `goodsName` | STRING | Product title |
| `specName` | STRING | Specification |
| `thumbUrl` | STRING | Preview image URL |
| `goodsId` | LONG | Product ID |
| `skuId` | LONG | SKU ID |
| `skuSn` | STRING | SKU code |
| `stock` | INTEGER | Stock quantity |
| `price` | STRING | Price |
| `retailPrice` | OBJECT | The selling price or retail price of the product |
| `crtTime` | LONG | Creation time in seconds |
| `status4VO` | INTEGER | Product status |
| `subStatus4VO` | INTEGER | Product sub-status |
| `goodsIsOnSale` | INTEGER | Product availability status |
| `currency` | STRING | Currency information |
| `skuStatusChangeTime` | STRING | SKU change time, timestamp format |
| `volumeInfo` | OBJECT | Product volume |
| `weightInfo` | OBJECT | Product weight |
| `skuShowSubStatus4VO` | INTEGER | Product sub-status filter New version field |
| `specList` | OBJECT[] | spec list |
| `lowTrafficTag` | INTEGER | Low traffic tag: 1-low traffic, 2-not low traffic |
| `restrictedTrafficTag` | INTEGER | Restricted traffic tag: 1-restricted traffic, 2-not restricted traffic |

---

## `temu.local.sku.list.retrieve`

> **Official docs**: [temu.local.sku.list.retrieve](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=9775b60761c54bf38022c77c717183a9)

local sku list search

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageSize` | INTEGER | False | Page size, indicating the number of records returned per page, with a limit of 100 per page, 25 per page |
| `pageToken` | STRING | False | The token used to fetch a specific page when there are multiple pages of results. |
| `orderField` | STRING | False | Attribute by which to sort the returned listing items. create_time for sorting by creation time |
| `orderType` | INTEGER | False | The order in which to sort the result items. 0 for descending order, 1 for ascending order. In descending order by default |
| `skuSearchType` | STRING | True | SKU status filter: ACTIVE INACTIVE INCOMPLETE DRAFT DELETED |
| `goodsIdList` | STRING[] | False | Product ID for search limit of 100 |
| `outGoodsSnList` | STRING[] | False | OutGoodsSn for search limit of 100 |
| `skuIdList` | STRING[] | False | Sku ID for search limit of 200 |
| `outSkuSnList` | STRING[] | False | OutSkuSn for search limit of 200 |
| `catIdList` | STRING[] | False | Category id for search limit of 100 |
| `goodsName` | STRING | False | The title or name of the product |
| `goodsCreateTimeFrom` | LONG | False | A date and time that is used to filter listing product. The response includes product that were created at or after this time. Unix timestamp, unit: ms |
| `goodsCreateTimeTo` | LONG | False | A date and time that is used to filter listing product. The response includes product that were created at or before this time. Unix timestamp, unit: ms |
| `skuStatusChangeTimeFrom` | LONG | False | A date and time that is used to filter SKU. The response includes status of SKU that were last updated at or after this time. Unix timestamp, unit: ms |
| `skuStatusChangeTimeTo` | LONG | False | A date and time that is used to filter SKU. The response includes status of SKU that were last updated at or before this time. Unix timestamp, unit: ms |
| `goodsSearchTags` | INTEGER[] | False | Goods search tags: 1-Low traffic, 4-Restricted traffic |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `pagination` | OBJECT | When a request produces a response that exceeds the pageSize, pagination occurs. This means the response is divided into individual pages. To retrieve the next page or the previous page, you must p... |
| `total` | LONG | The total number of items found for the search criteria (only results up to the page count limit will be returned per request regardless of the number found). |
| `skuList` | OBJECT[] | A list of SKU identifiers for the product |
| `skuId` | STRING | Sku ID |
| `goodsId` | STRING | Product ID |
| `goodsName` | STRING | The title or name of the product |
| `thumbUrl` | STRING | The URL for the product's thumbnail image |
| `specName` | STRING | Specification |
| `outSkuSn` | STRING | A list of external SKU (Stock Keeping Unit) codes or serial numbers for the product |
| `outGoodsSn` | STRING | The external product code or serial number |
| `goodsCreateTime` | LONG | The date the product was created |
| `skuStatusChangeTime` | LONG | The date the status of sku were last updated |
| `skuStatus` | STRING | sku status: Active InActive Deleted Incomplete |
| `skuSubStatus` | STRING | sku substatus: Active(ACTIVE,ACTIVE_AT_RISK) InActive(CLOSE, BLOCK, OUT_OF_STOCK) Incomplete(PRICING_UNDER_ASSESSMENT, AUDIT_IN_PROCESS, PRICING_FAILURE, PRODUCT_TO_BE_COMPLETE) Draft(DRAFT) Delete... |
| `catType` | INTEGER | Category type: 0-Clothing category, 1-Other |
| `catId` | STRING | Leaf Category ID |
| `volumeInfo` | OBJECT | Package Volume Information |
| `weightInfo` | OBJECT | Package Weight Information |
| `specList` | OBJECT[] | Specification List |
| `lowTrafficTag` | INTEGER | is low traffic, 1-true 2-false |
| `restrictedTrafficTag` | INTEGER | is restricted traffic, 1-true 2-false |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010001 | Invalid Request Parameters |  |
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |

---

## `bg.local.goods.list.query`

> **Official docs**: [bg.local.goods.list.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=d2a836cf1711473ba1f83597a1b52fb0)

Get product list

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageNo` | INTEGER | True | Page number, used for pagination |
| `pageSize` | INTEGER | True | Page size, indicating the number of records returned per page, with a limit of 100 per page |
| `orderField` | STRING | False | Sorting field. Supports sorting by goodsId, createTime, goodsName, outGoodsSn, quantity, price. Sorted by creation time by default |
| `orderType` | INTEGER | False | Sorting type. 0 for descending order, 1 for ascending order. In descending order by default |
| `goodsSearchType` | INTEGER | True | Product status filter: 1 - Available/off the shelf 4 - Not yet published 5 - Draft 6 - Deleted |
| `searchText` | STRING | False | Search text, supports searching by goodName or goodsId |
| `statusFilterType` | INTEGER | False | Sub-status filter type. Please refer to Goods status description |
| `crtFrom` | LONG | False | Start time of creation, enter timestamp, 13 bits in milliseconds |
| `crtTo` | LONG | False | end time of creation, enter timestamp, 13 bits in milliseconds |
| `goodsIdList` | LONG[] | False | Goods Id List |
| `catIdList` | LONG[] | False | Cat id list, supports both leaf and non-leaf cat id, supports batch |
| `goodsStatusFilterType` | INTEGER | True | Product status filter New version field |
| `goodsSubStatusFilterType` | INTEGER | False | Product sub-status filter New version field |
| `goodsStatusChangeTimeFrom` | LONG | False | Start time of goods status change, pass parameters by timestamp |
| `goodsStatusChangeTimeTo` | LONG | False | End time of goods status change, pass parameters by timestamp |
| `goodsSearchTags` | INTEGER[] | False | Goods search tags: 1-Low traffic, 4-Restricted traffic |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT | result |
| `pageNo` | INTEGER | The page number of the result set |
| `total` | LONG | The total number of items in the result set |
| `goodsList` | OBJECT[] | A list of goods/products in the result set |
| `goodsId` | LONG | The unique identifier for the product |
| `goodsName` | STRING | The title or name of the product |
| `specName` | STRING | The specification or type of the product |
| `thumbUrl` | STRING | The URL for the product's thumbnail image |
| `outGoodsSn` | STRING | The external product code or serial number |
| `status4VO` | INTEGER | The status of the product (e.g., 1 for on sale, 4 for unpublished, etc.) |
| `subStatus4VO` | INTEGER | The sub-status of the product (specific meanings depend on the business logic) |
| `currency` | STRING | The currency information for the product's price |
| `marketPrice` | LONG | The market price or suggested retail price of the product |
| `listPrice` | OBJECT | The market price or suggested retail price of the product |
| `outSkuSnList` | STRING[] | A list of external SKU (Stock Keeping Unit) codes or serial numbers for the product |
| `skuIdList` | LONG[] | A list of SKU identifiers for the product |
| `price` | STRING | The selling price or retail price of the product |
| `retailPrice` | OBJECT | The selling price or retail price of the product |
| `quantity` | INTEGER | The stock quantity or inventory level for the product |
| `crtTime` | LONG | The creation time of the product, in seconds (Unix timestamp) |
| `goodsStatusChangeTime` | STRING | goods change time, timestamp format |
| `catId` | LONG | Category id |
| `brandId` | LONG | Brand id |
| `trademarkId` | LONG | Trademark id |
| `costTemplateId` | STRING | The ID of the delivery options available for your product, delimited by commas. |
| `shipmentLimitSecond` | LONG | Indicates the time, in seconds, between when you receive an order for an item and when you can ship the item. |
| `skuInfoList` | OBJECT[] | A list of SKU identifiers for the product |
| `goodsShowSubStatus` | INTEGER | Product sub-status filter New version field |
| `lowTrafficTag` | INTEGER | Low traffic tag: 1-low traffic, 2-not low traffic |
| `restrictedTrafficTag` | INTEGER | Restricted traffic tag: 1-restricted traffic, 2-not restricted traffic |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |

---

## `temu.local.goods.list.retrieve`

> **Official docs**: [temu.local.goods.list.retrieve](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=7b50a3af47824c4482c7238c6e11aedc)

local goods list search

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageSize` | INTEGER | False | Page size, indicating the number of records returned per page, with a limit of 100 per page, 25 per page |
| `pageToken` | STRING | False | The token used to fetch a specific page when there are multiple pages of results. |
| `orderField` | STRING | False | Attribute by which to sort the returned listing items. create_time for sorting by creation time |
| `orderType` | INTEGER | False | The order in which to sort the result items. 0 for descending order, 1 for ascending order. In descending order by default |
| `goodsSearchType` | STRING | True | Product status filter: ALL("ALL", "ALL = Active + InActive"), ACTIVE("ACTIVE", "Active"), INACTIVE("INACTIVE", "InActive"), INCOMPLETE("INCOMPLETE", "Incomplete"), DRAFT("DRAFT", "Draft"), DELETED(... |
| `goodsIdList` | STRING[] | False | Product ID, supports batch limit of 100 |
| `outGoodsSnList` | STRING[] | False | Out Goods Sn, supports batch limit of 100 |
| `skuIdList` | STRING[] | False | Sku ID, supports batch limit of 200 |
| `outSkuSnList` | STRING[] | False | OutSkuSn for search limit of 200 |
| `catIdList` | STRING[] | False | Category id for search limit of 100 |
| `goodsName` | STRING | False | The title or name of the product |
| `goodsCreateTimeFrom` | LONG | False | A date and time that is used to filter listing product. The response includes product that were created at or after this time. Unix timestamp, unit: ms |
| `goodsCreateTimeTo` | LONG | False | A date and time that is used to filter listing product. The response includes product that were created at or before this time. Unix timestamp, unit: ms |
| `goodsStatusChangeTimeFrom` | LONG | False | A date and time that is used to filter listing product. The response includes status of product that were last updated at or after this time. Unix timestamp, unit: ms |
| `goodsStatusChangeTimeTo` | LONG | False | A date and time that is used to filter listing product. The response includes status of product that were last updated at or before this time. Unix timestamp, unit: ms |
| `goodsSearchTags` | INTEGER[] | False | Goods search tags: 1-Low traffic, 4-Restricted traffic |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `pagination` | OBJECT | When a request produces a response that exceeds the pageSize, pagination occurs. This means the response is divided into individual pages. To retrieve the next page or the previous page, you must p... |
| `total` | LONG | Total number of records. |
| `goodsList` | OBJECT[] | A list of goods/products in the result set |
| `goodsId` | STRING | Product ID |
| `goodsName` | STRING | The title or name of the product |
| `goodsStatus` | STRING | Product status: Active InActive Deleted Draft Incomplete |
| `thumbUrl` | STRING | The URL for the product's thumbnail image |
| `outGoodsSn` | STRING | The external product code or serial number |
| `variationsCount` | INTEGER | Count for SKU |
| `catType` | INTEGER | Category type: 0-Clothing category, 1-Other |
| `catId` | STRING | Leaf Category ID |
| `goodsCreateTime` | LONG | The date the product was created |
| `goodsStatusChangeTime` | LONG | The date the status of product were last updated |
| `brandId` | STRING | Brand id |
| `trademarkId` | STRING | Trademark Authorization ID |
| `costTemplateId` | STRING | The ID of the delivery options available for your product, delimited by commas. |
| `shipmentLimitSecond` | LONG | Indicates the time, in days, between when you receive an order for an item and when you can ship the item. |
| `skuInfoList` | OBJECT[] | A list of SKU identifiers for the product |
| `lowTrafficTag` | INTEGER | tag for Low traffic 1- true 2- false |
| `restrictedTrafficTag` | INTEGER | tag for Restricted traffic 1- true 2- false |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |

---

## `temu.local.goods.spec.info.get`

> **Official docs**: [temu.local.goods.spec.info.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=1094942488d844acaf9d7a3f2c097acd)

Used to query the specification value information in different languages corresponding to the platform's specification ID

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |
| `specIdList` | LONG[] | True | Specification Id List |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `specDTOList` | OBJECT[] | Parent property value and child property value |
| `language` | STRING | Language |
| `specId` | LONG | Specification Id |
| `specName` | STRING | Specification Name |
| `parentSpecId` | LONG | Parent Specification Id |
| `parentSpecName` | STRING | Parent Specification Name |

---

## `bg.local.goods.category.check`

> **Official docs**: [bg.local.goods.category.check](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=2a343c65a03d42d380e9ad835aa7b54b)

precheck category misplacement

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `catId` | LONG | False | category id |
| `hdThumbUrl` | STRING | False | thumb url |
| `carouselImageList` | STRING[] | False | list of carousel images |
| `language` | STRING | False | Language |
| `goodsName` | STRING | False | goods name |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |

---

## `bg.local.goods.property.get`

> **Official docs**: [bg.local.goods.property.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=189dc77cbbb74606999d8eff19c3129d)

Get Temu goods attributes

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | language |
| `goodsName` | STRING | True | Goods name |
| `catId` | LONG | False | Leaf category ID |
| `goodsDesc` | STRING | False | goods description |
| `thirdPartyErpType` | INTEGER | False | third party type |
| `thirdPartyMall` | STRING | False | third party mall |
| `thirdPartyCatName` | STRING | False | third party cat name |
| `goodsPropList` | OBJECT[] | False | Goods Prop List |
| `propName` | STRING | False | Product property name in English |
| `values` | STRING[] | False | Product property values in English |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT | result |
| `goodsPropertyList` | OBJECT[] | goodsPropertyList |
| `pid` | LONG | Basic Property ID |
| `vid` | LONG | Property value ID |
| `value` | STRING | Property value |
| `templatePid` | LONG | Template property ID |
| `refPid` | LONG | Referece Property ID |
| `valueUnit` | STRING | value unit |
| `valueUnitId` | LONG | value unit ID |
| `numberInputValue` | STRING | number input value of component properties |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010003 | Invalid Request Parameters |  |
| 150010002 | System error, please try again later |  |

---

## `bg.local.goods.property.relations`

> **Official docs**: [bg.local.goods.property.relations](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=25388019592c478b899eabe9376233b9)

Query the relational database data associated with goods, such as vehicle library.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `relationType` | INTEGER | True | For relation type, select "1" to query the database of compatible vehicle models. |
| `goodsId` | LONG | True | goods id |
| `relationId` | LONG | True | The compatible vehicle models of different countries and categories are different. You can use relation id, the Id for compatible vehicle models database, to query. |
| `queryLastVersion` | BOOLEAN | True | query last version: True, return the latest product version query last version: False, return the active product version first. if there is no active version, the latest product version will be ret... |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT | Specific information |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010003 | Invalid Request Parameters |  |
| 150010213 | The goods property relation not exist |  |
| 150010210 | The property value id is not exist |  |

---

## `bg.local.goods.property.relations.level.template`

> **Official docs**: [bg.local.goods.property.relations.level.template](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=cf97d2c7db1a4bd5b9cbd5d6e1307285)

Obtaining the hierarchical attribute value and hierarchical id of vehicle type library data.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `catId` | LONG | True | The ID of the category of this product. It must be a leaf category that corresponds to the category tree type specified in the category_version property. |
| `relationType` | INTEGER | True | For relation type, select "1" to query the database of compatible vehicle models. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `levelPropertyDependencyList` | OBJECT[] | levelPropertyDependencyList includes how many levels in the given relationId, the name of attribute value of each level(propertyName), the level and the relations between differnet levels. (In diff... |
| `relationId` | LONG | There compatible vehicle models of different countries and categories are different. You can use relationId, the Id for compatible vehicle models database, to query. |
| `propertyDependencyId` | LONG | An id for propertyName, reflecting the current level in the given relationId. |
| `parentPropertyDependencyId` | LONG | The id of upper/parent level of propertyDependencyId |
| `propertyName` | STRING | The classification name used to describe compatible vehicle models property, such as brand, manufacturer, model. year, trim, variant, engine. |
| `level` | INTEGER | level field, reflecting the level in the compatible vehicle models. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010211 | The relation type is not allowed |  |

---

## `bg.local.goods.property.relations.template`

> **Official docs**: [bg.local.goods.property.relations.template](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=b880b2bb584645d7bfc2178836bdac9d)

Query the full quantum attribute by the dependency id of the parent attribute value and the hierarchical id.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `catId` | LONG | True | The ID of the category of this product. It must be a leaf category that corresponds to the category tree type specified in the category_version property. |
| `relationId` | LONG | True | Relation id |
| `relationType` | INTEGER | True | For relation type, select "1" to query the database of compatible vehicle models. |
| `propertyRelationQueryDTOList` | OBJECT[] | False | It is used to query propertyDependencyId and parentPropertyValueDependencyId. If propertyRelationQueryDTOList is being left empty, all level1 propertyValueId will be returned. |
| `propertyDependencyId` | LONG | False | An id for propertyName, reflecting the current level in the given relationId. |
| `parentPropertyValueDependencyId` | LONG | False | The id of upper/parent level of propertyDependencyId |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `parentPropValDepMapDTOList` | OBJECT[] | Parent property value and child property value |
| `parentPropertyValueDependencyId` | LONG | The id of upper/parent level of propertyDependencyId |
| `propValDepDTOList` | OBJECT[] | The list of data including propertyValue of the lower level of parentPropertyValueDependencyId. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010211 | The relation type is not allowed |  |
| 150010212 | The relation id is wrong |  |

---

## `bg.local.goods.out.sn.set`

> **Official docs**: [bg.local.goods.out.sn.set](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=66773408d99a4341ac75fa26cb299651)

Set contribution ID for goods

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `modifyList` | OBJECT[] | False | Contribution SKU modification List Supports a maximum of 50 entries. |
| `outGoodsSn` | STRING | False | Contribution SKU The character length of a single code must not exceed 40 characters. |
| `goodsId` | LONG | False | Goods id |
| `language` | STRING | False | Language |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT | result |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |

---

## `bg.local.goods.sku.out.sn.set`

> **Official docs**: [bg.local.goods.sku.out.sn.set](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=a6884f4b3f914d71893d40c5524b972f)

Set contribution ID for SKU

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `modifyList` | OBJECT[] | False | Contribution SKU The character length of a single code must not exceed 40 characters. |
| `goodsId` | LONG | False | Goods Id |
| `outSkuSn` | STRING | False | Contribution SKU The character length of a single code must not exceed 40 characters. |
| `skuId` | LONG | False | Goods Sku Id |
| `language` | STRING | False | Language |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT | result |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |

---

## `bg.local.compliance.goods.list.query`

> **Official docs**: [bg.local.compliance.goods.list.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=9673d77aa8ea46d796b206ffb69ad16f)

Product management attribute list query

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `pageNo` | INTEGER | True | Page NO. |
| `pageSize` | INTEGER | True | Page Size, Default 25 |
| `searchText` | STRING | False | Support searching goodName/goodsId/skuId |
| `statusList` | INTEGER[] | False | Status, 1: not submitted, 2: To be reviewed, 3: Reviewing, 4: Action required, 5: Approved, 6: Rejected, 7: To be updated |
| `optionalConditionList` | OBJECT[] | False | Compliance Information Filters |
| `complianceType` | INTEGER | False | 1:Governance attributes,2:General Product Safety Regulation |
| `templateId` | INTEGER | False | 1:Governance attributes,2:General Product Safety Regulation |
| `repType` | INTEGER | False | 2: EU responsible person 3: manufacturer. required when complianceType is 2 |
| `actualPhotoCheckType` | LONG | False | checkType of actual photo, required when complianceType is 3 |
| `certType` | LONG | False | If complianceType is 4, enter the checkType of the qualification |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Success or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Result |
| `total` | LONG | Total |
| `goodsList` | OBJECT[] | Goods list |
| `goodsId` | LONG | Goods Id |
| `goodsName` | STRING | Goods Name |
| `thumbUrl` | STRING | Goods Thumb Url |
| `outGoodsSn` | STRING | External SKU Codes |
| `crtTime` | LONG | Creation time, in seconds |
| `extraTemplateInfoList` | OBJECT[] | Governance attribute template information list |
| `gpsrInfoList` | OBJECT[] | gpsr info list |
| `repInfoList` | OBJECT[] | Responsible Person Info |
| `actualPhotoList` | OBJECT[] | Actual photo list |
| `certificateInfoList` | OBJECT[] | certification list |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010005 | Try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010002 | System error, please try again later |  |

---

## `bg.local.goods.compliance.edit`

> **Official docs**: [bg.local.goods.compliance.edit](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=8f8522c74e024e5ea1244bd3c9e5aff6)

Edit product qualification information

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | language |
| `goodsId` | LONG | True | Goods ID |
| `certificateInfo` | OBJECT | False | Qualification Documents |
| `actualPhoto` | OBJECT | False | Actual Photos |
| `repInfo` | OBJECT | False | Responsible Person Info |
| `extraTemplate` | OBJECT | False | Governance attributes |
| `extraTemplateDetailList` | OBJECT[] | False | attributes List |
| `templateId` | INTEGER | False | Template ID |
| `properties` | MAP | False | propertyId: attribute value Corresponding control type: 1. controlType: 1 Select 2. controlType: 3 Input or select |
| `inputText` | MAP | False | propertyId: input value Corresponding control type: 1. controlType: 0 Input 2. controlType: 3 Input or select 3. controlType: 17 Multi-line input 4. controlType: 18 Double value ratio |
| `compliancePropertyList` | OBJECT[] | False | sku dimension compliance information |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT |  |
| `goodsId` | LONG | Goods Id |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150011114 | Image upload failed. Please try again later. |  |
| 150011113 | The product does not belong to the current store. Please check the product information before sub... |  |
| 150011112 | The product does not exist. Please reselect and submit again. |  |
| 150011111 | Too many images for this category. Please remove extra photos and submit again. |  |
| 150011110 | Required photos are missing: both the product photo and the outer package photo are not uploaded.... |  |
| 150011109 | Unsupported image format. Please upload images in JPG/JPEG/PNG format and try again. |  |
| 150011108 | The image file is too large. Please compress it and upload again. |  |
| 150011107 | Image resolution is too high. Please resize (reduce pixels) and upload again. |  |
| 150011106 | The image URL is unsupported or inaccessible. Please use a valid image link, or re-upload the ima... |  |
| 150011105 | Some photo information is missing, so we can't submit for review. Please check the affected image... |  |
| 150011104 | Incomplete product information. Unable to submit for review. Please reselect the product and try ... |  |
| 150011068 | The specified goodsId does not exist or does not belong to the current shop. |  |
| 150011062 | Compliance information cannot be edited while the SKU is under product review. |  |
| 150011061 | Compliance information cannot be edited while the SKU is under price review. |  |
| 150011055 | {*} is required fields. |  |
| 150011054 | The actual photo link for the SKU is missing. |  |
| 150011053 | The energy efficiency label is non-compliant. |  |
| 150011052 | An unknown certification was uploaded. |  |
| 150011051 | Exceeded the maximum number of uploaded files. |  |
| 150011050 | AVI storage check failed (domain name, tag, etc. validation failed). |  |
| 150011049 | The certification type is null.Please fill in again and submit. |  |
| 150011048 | Certification name or link has not been provided. |  |
| 150011047 | The values of {*} are mutually exclusive. Please fill in again and submit. |  |
| 150011046 | Certification details not filled in. |  |
| 150011045 | {*} are required fields. |  |
| 150011044 | Invalid input for {*}. Please update and resubmit. |  |
| 150011043 | {*} is required. |  |
| 150011042 | {*} numeric value validation failed, such as missing value, non-numeric input, invalid decimal pr... |  |
| 150011041 | Exceeded the maximum number of {*} allowed. |  |
| 150011040 | "{*}" requires manual input and does not support direct selection. |  |
| 150011039 | "{*}" must be selected from predefined options and does not support custom input. |  |
| 150011038 | Duplicate attribute values were entered for a single SKU. |  |
| 150011037 | The SKU-level {*} was mistakenly assigned to the goods-level. |  |
| 150011036 | Multilingual support is not configured. Please check and configure. |  |
| 150011035 | Invalid date. Please check and enter correctly. |  |
| 150011034 | The value of {*} is empty. Please check and enter correctly. |  |
| 150011033 | The {*} format is not compliant. |  |
| 150011032 | The attribute ID of {*} is invalid. |  |
| 150011031 | The entered {*} is non-compliant. Please fill in again and submit. |  |
| 150010131 | Pricing in progress |  |
| 150010207 | Compliance information is incorrect |  |
| 150011019 | The input {*}:{*} is incorrect, please modify it. |  |
| 150010165 | Manufacturer is not available. |  |
| 150010166 | Failed to add the manufacturer. |  |
| 150010167 | Select the responsible person. |  |
| 150010168 | Responsible person is not available. |  |
| 150010169 | Failed to add the responsible person. |  |

---

## `bg.local.goods.sale.status.set`

> **Official docs**: [bg.local.goods.sale.status.set](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=74aca796102c4d4bbbabef21fef34207)

Support goods/SKU dimension for listing and delisting operations

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsId` | LONG | True | Goods Id |
| `skuIdList` | LONG[] | False | Support the inclusion of multiple SKUs. If included, only the SKU will be used for up and down operations |
| `onsale` | INTEGER | True | On/Off shelf status: 0 for off-shelf, 1 for on-shelf |
| `operationType` | INTEGER | False | The operation type for delisting and listing has the following values: null or 1 for goods, and 2 for SKUs. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT | result |
| `success` | BOOLEAN | Is Modification Successful |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |

---

## `temu.local.goods.pre.sale.status.edit`

> **Official docs**: [temu.local.goods.pre.sale.status.edit](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=64f794c706994b9b99349ed0fb30d8bd)

This API allows batch enabling or disabling the pre-sale status for multiple SKUs belonging to a product item.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsId` | LONG | True | Goods Id |
| `targetPreSaleStatus` | INTEGER | True | Target Pre Sale Status, 1:open, 2:close |
| `skuInfoList` | OBJECT[] | True | SKU info List. Maximum allowable Num: 100 |
| `skuId` | LONG | True | Product SKU ID |
| `targetPreSaleStock` | INTEGER | False | Target Pre Sale Stock |
| `preSaleEndTime` | LONG | False | Pre Sale End Time |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `goodsId` | LONG | Goods Id |
| `code` | INTEGER | The main error code. 0 means success. |
| `msg` | STRING | The main error message. |
| `skuOperateResultInfoList` | OBJECT[] | SKU operate result info list |
| `skuId` | LONG | Product SKU ID |
| `code` | INTEGER | The SKU error code. 0 means success. |
| `msg` | STRING | The SKU error message. |

---

## `bg.local.goods.videocoverimage.get`

> **Official docs**: [bg.local.goods.videocoverimage.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=d24b910a9b284c7ca4621133a08f2351)

Used to obtain the cover image of the video screen

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `vidList` | STRING[] | False | vid list for video |

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
| 150010003 | Invalid Request Parameters |  |
| 150010002 | System error, please try again later |  |

---
