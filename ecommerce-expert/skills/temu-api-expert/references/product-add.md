# Temu Partner API — Product API — Add Products

Create new product listings, manage categories, attributes, images, compliance, and brand data.

## Table of Contents

- [temu.local.goods.v2.add](#temulocalgoodsv2add)
- [temu.local.product.attributes.get](#temulocalproductattributesget)
- [temu.local.product.variation.get](#temulocalproductvariationget)
- [temu.local.goods.image.v2.upload](#temulocalgoodsimagev2upload)
- [bg.local.goods.add](#bglocalgoodsadd)
- [bg.local.goods.template.get](#bglocalgoodstemplateget)
- [bg.local.goods.spec.id.get](#bglocalgoodsspecidget)
- [bg.local.goods.image.upload](#bglocalgoodsimageupload)
- [bg.local.goods.category.recommend](#bglocalgoodscategoryrecommend)
- [bg.local.goods.cats.get](#bglocalgoodscatsget)
- [bg.local.goods.size.element.get](#bglocalgoodssizeelementget)
- [bg.freight.template.list.query](#bgfreighttemplatelistquery)
- [temu.local.goods.brand.trademark.V2.get](#temulocalgoodsbrandtrademarkv2get)
- [bg.local.goods.gallery.signature.get](#bglocalgoodsgallerysignatureget)
- [temu.local.goods.illegal.vocabulary.check](#temulocalgoodsillegalvocabularycheck)
- [bg.local.goods.sku.out.sn.check](#bglocalgoodsskuoutsncheck)
- [bg.local.goods.out.sn.check](#bglocalgoodsoutsncheck)
- [bg.local.goods.compliance.info.fill.list.query](#bglocalgoodscomplianceinfofilllistquery)
- [bg.local.goods.compliance.rules.get](#bglocalgoodscompliancerulesget)
- [bg.local.goods.compliance.extra.template.get](#bglocalgoodscomplianceextratemplateget)
- [bg.local.goods.compliance.property.check](#bglocalgoodscompliancepropertycheck)
- [bg.local.goods.tax.code.get](#bglocalgoodstaxcodeget)
- [temu.local.goods.sku.net.content.unit.query](#temulocalgoodsskunetcontentunitquery)

---

## `temu.local.goods.v2.add`

> **Official docs**: [temu.local.goods.v2.add](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=91657460a9be4a609df2eef01bc6deef)

Add New Items On Temu

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |
| `goodsBasic` | OBJECT | True | Basic product information. |
| `goodsServicePromise` | OBJECT | True | Seller Service Information |
| `goodsProperty` | OBJECT[] | False | Product attribute. |
| `goodsOriginInfo` | OBJECT | False | Country/region of Origin. |
| `goodsSize` | OBJECT | False | Size chart information. |
| `skuList` | OBJECT[] | True | List of SKUs. There must be at least one SKU. |
| `images` | STRING[] | True | SKU images. |
| `price` | OBJECT | True | Pricing information |
| `quantity` | LONG | True | Inventory quantity |
| `externalSkuId` | STRING | False | External SKU code. |
| `packageInfo` | OBJECT | True | Product Package Information. |
| `specDetails` | OBJECT[] | True | Specifications used for this SKU. There must be at least one parent specification. |
| `barCodeType` | INTEGER | False | External product code type, 1=EAN 2=UPC 3=ISBN 4=GTIN-14. |
| `barCodeId` | STRING | False | External goods code. It needs to conform to the standard specifications of the encoding type. |
| `referenceLink` | STRING | False | Product links on external platforms. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT | Specific information |
| `goodsId` | LONG | Goods Id |
| `productType` | INTEGER | Product type. It is used to describe the type of a product, a product can only belong to one type. The possible enumerated values are presented below. 1: Normal product 2: Custom product 3: Made-to... |
| `skuInfoList` | OBJECT[] | Sku information list |
| `skuId` | LONG | SKU ID |
| `outSkuSn` | STRING | External SKU Code |
| `specList` | OBJECT[] | Specification information |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010157 | The groupId is required. |  |
| 150011100 | The number of products that can be listed each day is limited to {*}. Reason: {*} |  |
| 150011077 | {*} is invalid or not provided. |  |
| 150010255 | The selected level is not applicable to the current product. |  |
| 150010254 | Second-hand stores do not support publishing products in this category. |  |
| 150010253 | The selected businessScope is not applicable to the current product. |  |
| 150010257 | For "Made-to-order" products in the food category, "Shelf Life" field should be between 1-10 days. |  |
| 150010256 | This category is not supported for "Made-to-order" products. |  |
| 150011074 | Upload {*} to {*} images |  |
| 150011073 | Use {*} characters or fewer for bullet point |  |
| 150011072 | Bullet point must not exceed {*} |  |
| 150011071 | Use {*} characters or fewer for product description |  |
| 150011070 | Use {*} characters or fewer for product name |  |
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
| 150010238 | The "productType" does not exist. Please check and try again. The current corresponding relations... |  |
| 150011013 | Used-product shop do not support the listing of custom products. |  |
| 150011015 | Refurbished product shop do not support the listing of custom products. |  |
| 150011057 | "Made-to-order" feature is only available to select qualified sellers. To qualify, please contact... |  |
| 150011059 | "Made-to-order products" are mutually exclusive with other product types, such as used, custom, a... |  |
| 150011067 | Invalid preparation time. This product only supports a preparation time range of {*}-{*}. |  |
| 150011027 | The product is missing tax code information. |  |
| 150011066 | The input {*} is incorrect, the aspect ratio is not {*}. |  |
| 150011065 | The input {*} is incorrect, the width and height are below {*}. |  |
| 150011064 | The input {*} is incorrect, image exceeds {*}. |  |
| 150010237 | The newly added specification information is missing in the goods properties. |  |
| 150011063 | Upload at most {*} images for Detail image |  |
| 150010236 | SKC must not exceed 25 |  |
| 150010235 | Please enter template name of size charts |  |
| 150010234 | The property value of the charger type is invalid. |  |
| 150010149 | The size specification entry is not in one group. |  |
| 150010142 | Template name of size charts duplicate |  |
| 150011060 | Video resolution should not below {*}p |  |
| 150011056 | Use {*} characters or fewer for product description |  |
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
| 150010223 | Second-hand stores can only list books and consumer electronics. |  |
| 150010230 | For used-product, "Condiiton" field is required. |  |
| 150010231 | The "Condition" field cannot be edited after the product is published. |  |
| 150010232 | The "Condition" field should not be filled in for this product. |  |
| 150010175 | The current product does not have permission to be linked to the selected shipping template. |  |
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
| 150010141 | Price input error |  |
| 150010162 | Invalid listPriceType |  |
| 150010163 | Please enter list price |  |
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
| 150010200 | Please check and enter the correct compliance information. |  |
| 150010201 | Due to the low pricing assessment approval rate recently, we will limit the number of products th... |  |
| 150010202 | Invalid unit for weight/Invalid unit for volume |  |
| 150010207 | Compliance information is incorrect |  |
| 150010208 | The relation id or type can not be empty |  |
| 150010209 | The relation type is not match |  |
| 150010210 | The property value id is not exist |  |
| 150010211 | The relation type is not allowed |  |
| 150010212 | The relation id is wrong |  |
| 150010213 | The goods property relation not exist |  |
| 150010218 | Variation information must not be duplicated or too similar across different SKUs |  |
| 150010219 | Bookstores can only list books |  |
| 150010220 | Book products cannot be published by non-book store |  |
| 150011001 | We have limited the number of products that can be listed per day to {*} to optimize product list... |  |
| 150011000 | Attribute or Specification Error: {*} |  |
| 150010217 | The shipping fee calculated by the shipping template bound to the item exceeds the upper limit. P... |  |
| 150011023 | New version processing. |  |

---

## `temu.local.product.attributes.get`

> **Official docs**: [temu.local.product.attributes.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=1ecd9ad752a14d5e9f5297edfd6c8848)

Query Attribute Template

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |
| `catId` | LONG | True | Leaf Node Category ID |
| `costTemplateId` | STRING | False | Some attributes will become mandatory fields when selling across borders. At this point, input costTemplateId, obtained from the bg.freight.template.list.query. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Whether it was successful or not |
| `errorCode` | INTEGER | Error code |
| `errorMsg` | STRING | Error message |
| `result` | OBJECT | Specific information |
| `catId` | LONG | Leaf category id. |
| `language` | STRING | Language. |
| `attributeList` | OBJECT[] | Product attributes list. |
| `refPid` | LONG | Attribute ID. |
| `attributeName` | STRING | Attribute name. |
| `required` | BOOLEAN | True: This attribute is required; False: This attribute is optional. |
| `attributeRules` | OBJECT | Attribute rules. |
| `attributeValueDetail` | OBJECT[] | Attribute value details. |
| `attributeValueUnitList` | OBJECT[] | Attribute value unit. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010042 | Category unavailable |  |
| 150010124 | The catId not a leaf category |  |

---

## `temu.local.product.variation.get`

> **Official docs**: [temu.local.product.variation.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=d23bfec96065492ebe8290c6fe867a19)

Query Mandatory And Optional variations Of Products

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |
| `catId` | LONG | True | Leaf Node Category ID |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `catId` | LONG | Category id |
| `language` | STRING | language |
| `variations` | OBJECT[] | Variant information. Each product needs to have 1-2 parent specifications. |
| `parentSpecId` | LONG | Parent specification ID. |
| `parentSpecName` | STRING | Parent specification name. |
| `required` | BOOLEAN | True: This parent specification is required; False: This parent specification is optional. When all parent specifications under a category are optional, you still need to select one parent specific... |
| `variationType` | INTEGER | Specification value type: 0 - Only preset values can be selected; 1 - Custom input specifications can be selected; 2 - Both preset and custom input specifications can be selected. |
| `specList` | OBJECT[] | Specification Value List. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010042 | Category unavailable |  |
| 150010124 | The catId not a leaf category |  |
| 150010002 | System error, please try again later |  |

---

## `temu.local.goods.image.v2.upload`

> **Official docs**: [temu.local.goods.image.v2.upload](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=37d470d8c6e149f78953311aa0b0296d)

Image material processing

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `fileUrl` | STRING | True | The URL of the image file. |
| `catId` | LONG | True | Leaf category ID. |
| `usage` | INTEGER | True | Use scenarios for images: 1 - Product detail images, send field: detailImage 2 - Product carousel images, send field: goodsCarouselImage 3 - SKU carousel images, send field: images 4 - size chart i... |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `images` | OBJECT[] | Image details |
| `url` | STRING | URL for file |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150011075 | When autoCrop is enabled, the image size must be no larger than {*}px. |  |
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010008 | Category not found |  |
| 150010005 | Try again later |  |
| 150011019 | The input {*}:{*} is incorrect, please modify it. |  |
| 150011021 | Image upload timed out, please try again later |  |
| 150011064 | The input {*} is incorrect, image exceeds {*}. |  |

---

## `bg.local.goods.add`

> **Official docs**: [bg.local.goods.add](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=645953235e964a23a0320b249ba865af)

Add New Items On Temu

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsBasic` | OBJECT | True | the basic product information. |
| `goodsServicePromise` | OBJECT | True | Seller Service Information |
| `goodsProperty` | OBJECT | True | Product attribute |
| `goodsOriginInfo` | OBJECT | False | Country/region of Origin |
| `bulletPoints` | STRING[] | False | bulletPoints |
| `goodsDesc` | STRING | False | Product Description: For detailed product display decoration. |
| `certificationInfo` | OBJECT | False | The list of certifications for your product. |
| `guideFileInfo` | OBJECT | False | Instruction Manual |
| `goodsSizeChartList` | OBJECT | False | Size chart information |
| `goodsSizeImage` | STRING[] | False | The URL of the size chart image |
| `skuList` | OBJECT[] | True | List of SKUs |
| `goodsTrademark` | OBJECT | False | Trademark Information |
| `taxCodeInfo` | OBJECT | False | Tax code information |
| `goodsVehiclePropertyRelation` | OBJECT | False | Vehicle base data |
| `secondHand` | OBJECT | False | second hand info |
| `secondHandGoods` | BOOLEAN | False | whether it's second hand |
| `level` | INTEGER | False | condition |
| `businessScope` | INTEGER | False | 0 - Regular items; 1 - Collectibles; 2 - Luxury Items. The default is 0. |
| `insName` | STRING | False | External agency name. |
| `grade` | STRING | False | External agency rating of the item's secondhand condition. |
| `saveMode` | INTEGER | False | ERP product publish status: 1 = Submitted; 2 = Saved as draft |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT |  |
| `goodsId` | LONG | Goods Id |
| `productType` | INTEGER | Product type. It is used to describe the type of a product, a product can only belong to one type. The possible enumerated values are presented below. 1: Normal product 2: Custom product 3: Made-to... |
| `skuInfoList` | OBJECT[] | Sku information list |
| `warnings` | OBJECT[] | Contains warning information when the request succeeds but further action is required. |
| `message` | STRING | A message that provides additional details or instructions when further action is required after a successful request. |


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
| 150010157 | The groupId is required. |  |
| 150011100 | The number of products that can be listed each day is limited to {*}. Reason: {*} |  |
| 150011077 | {*} is invalid or not provided. |  |
| 150010255 | The selected level is not applicable to the current product. |  |
| 150010254 | Second-hand stores do not support publishing products in this category. |  |
| 150010253 | The selected businessScope is not applicable to the current product. |  |
| 150010257 | For "Made-to-order" products in the food category, "Shelf Life" field should be between 1-10 days. |  |
| 150010256 | This category is not supported for "Made-to-order" products. |  |
| 150011074 | Upload {*} to {*} images |  |
| 150011073 | Use {*} characters or fewer for bullet point |  |
| 150011072 | Bullet point must not exceed {*} |  |
| 150011071 | Use {*} characters or fewer for product description |  |
| 150011070 | Use {*} characters or fewer for product name |  |
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
| 150010238 | The "productType" does not exist. Please check and try again. The current corresponding relations... |  |
| 150011013 | Used-product shop do not support the listing of custom products. |  |
| 150011015 | Refurbished product shop do not support the listing of custom products. |  |
| 150011057 | "Made-to-order" feature is only available to select qualified sellers. To qualify, please contact... |  |
| 150011059 | "Made-to-order products" are mutually exclusive with other product types, such as used, custom, a... |  |
| 150011067 | Invalid preparation time. This product only supports a preparation time range of {*}-{*}. |  |
| 150011027 | The product is missing tax code information. |  |
| 150011066 | The input {*} is incorrect, the aspect ratio is not {*}. |  |
| 150011065 | The input {*} is incorrect, the width and height are below {*}. |  |
| 150011064 | The input {*} is incorrect, image exceeds {*}. |  |
| 150010237 | The newly added specification information is missing in the goods properties. |  |
| 150011063 | Upload at most {*} images for Detail image |  |
| 150010236 | SKC must not exceed 25 |  |
| 150010235 | Please enter template name of size charts |  |
| 150010234 | The property value of the charger type is invalid. |  |
| 150010149 | The size specification entry is not in one group. |  |
| 150010142 | Template name of size charts duplicate |  |
| 150011060 | Video resolution should not below {*}p |  |
| 150011056 | Use {*} characters or fewer for product description |  |
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
| 150010223 | Second-hand stores can only list books and consumer electronics. |  |
| 150010230 | For used-product, "Condiiton" field is required. |  |
| 150010231 | The "Condition" field cannot be edited after the product is published. |  |
| 150010232 | The "Condition" field should not be filled in for this product. |  |
| 150010175 | The current product does not have permission to be linked to the selected shipping template. |  |
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
| 150010141 | Price input error |  |
| 150010162 | Invalid listPriceType |  |
| 150010163 | Please enter list price |  |
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
| 150010200 | Please check and enter the correct compliance information. |  |
| 150010201 | Due to the low pricing assessment approval rate recently, we will limit the number of products th... |  |
| 150010202 | Invalid unit for weight/Invalid unit for volume |  |
| 150010207 | Compliance information is incorrect |  |
| 150010208 | The relation id or type can not be empty |  |
| 150010209 | The relation type is not match |  |
| 150010210 | The property value id is not exist |  |
| 150010211 | The relation type is not allowed |  |
| 150010212 | The relation id is wrong |  |
| 150010213 | The goods property relation not exist |  |
| 150010218 | Variation information must not be duplicated or too similar across different SKUs |  |
| 150010219 | Bookstores can only list books |  |
| 150010220 | Book products cannot be published by non-book store |  |
| 150011001 | We have limited the number of products that can be listed per day to {*} to optimize product list... |  |
| 150011000 | Attribute or Specification Error: {*} |  |
| 150010217 | The shipping fee calculated by the shipping template bound to the item exceeds the upper limit. P... |  |

---

## `bg.local.goods.template.get`

> **Official docs**: [bg.local.goods.template.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=0525e2f6a397495088286ea2e1a9608c)

query product attributes template

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |
| `catId` | LONG | True | Leaf category id |
| `goodsId` | LONG | False | When the attributes of a product are modified, the "goodsId" should be provided to query the corresponding attribute template; otherwise, there might be inconsistencies between the attribute templa... |
| `goodsBrandProperties` | OBJECT[] | False | Brand attribute List |
| `value` | STRING | False | Brand attribute value |
| `refPid` | LONG | False | Brand refer attribute ID |
| `costTemplateId` | STRING | False | Enter the costTemplateId , obtained from the bg.freight.template.list.query. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT |  |
| `inputMaxSpecNum` | INTEGER | Maximum number of custom parent specifications allowed |
| `singleSpecValueNum` | INTEGER | Upper limit of custom specification values under a single parent specification |
| `templateInfo` | OBJECT | Attribute template |
| `userInputParentSpecList` | OBJECT[] | A list of custom parent specifications to be used when there is no template or the template has custom specifications. |
| `parentSpecId` | LONG | The unique identifier of the parent specification. |
| `parentSpecName` | STRING | The name of the parent specification. |
| `feature` | INTEGER | Attribute characteristic. Currently determines whether to group, 0-general, 1-color, 2-size, 3-phone model |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010042 | Category unavailable |  |
| 150010124 | The catId not a leaf category |  |
| 150010203 | This product doesn't belong to this shop. |  |

---

## `bg.local.goods.spec.id.get`

> **Official docs**: [bg.local.goods.spec.id.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=0b40dd37373a440281aafed720615267)

Search And Generate Merchant-Customized Specifications

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `catId` | LONG | True | Category ID |
| `parentSpecId` | LONG | True | Parent specification ID |
| `childSpecName` | STRING | True | Custom child specification name |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010011 | Only use letters, numbers and common punctuation for product name |  |
| 150010027 | Variant too long |  |
| 150010124 | The catId not a leaf category |  |
| 150010125 | Non-existent parentSpecId |  |
| 150010044 | Special characters not allowed in text |  |
| 150010043 | Chinese characters not allowed in text |  |

---

## `bg.local.goods.image.upload`

> **Official docs**: [bg.local.goods.image.upload](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=e84e07e3006b4bcd8835e8227bb65493)

Image material processing

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `scalingType` | INTEGER | False | Scaling Target: 0-Original size, 1-800*800 (1:1), 2-1350*1800 (3:4) |
| `fileUrl` | STRING | False | URL for file |
| `compressionType` | INTEGER | False | Compression: 0-false, 1-true |
| `formatConversionType` | INTEGER | False | Format conversion: 0-jpg, 1-jpeg, 2-png While compressionType=1 and formatConversionType=0 or 1. To complete the image compression |

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
| 150011021 | Image upload timed out, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010002 | System error, please try again later |  |

---

## `bg.local.goods.category.recommend`

> **Official docs**: [bg.local.goods.category.recommend](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=c313f7e3983f407d82d0f7cd88ab5c62)

query recommended category by product name

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsName` | STRING | True | The Name of the product |
| `description` | STRING | False | Goods description |
| `imageUrl` | STRING | False | Goods image url |
| `expandCatType` | INTEGER | False | Expand category type: 0-Apparel, 1-Others, 2-Books, 3-DVD, 4-CD, 5-Seed |
| `expandCatName` | STRING | False | Expand Category Name |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT |  |
| `catId` | LONG | Recommended Leaf Category ID |
| `catIdList` | LONG[] | Recommended Leaf Category ID (List object) |

---

## `bg.local.goods.cats.get`

> **Official docs**: [bg.local.goods.cats.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=7ce116fe6b87443ba2a5320b25bf2b20)

Get Temu Categories

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | language |
| `parentCatId` | LONG | True | Parent Category ID: if not provided, all primary categories will be queried. |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT |  |
| `goodsCatsList` | OBJECT[] | category info list |
| `catId` | LONG | Category ID |
| `catName` | STRING | Category Name |
| `level` | INTEGER | Category Level: 1 - Primary Category, 2 - Secondary Category, 3 - Tertiary Category, 4 - Quaternary Category |
| `parentId` | LONG | Parent Category ID: The ID of the parent category. parent_id=0 indicates a top-level node. |
| `leaf` | BOOLEAN | Is Leaf Category |
| `catType` | INTEGER | Category Type: 0 - Apparel, 1 - Other |
| `availableStatus` | INTEGER | Category status: 0-Available, 1-Not available |
| `expandCatType` | INTEGER | Expand category type: 0-Apparel, 1-Others, 2-Books, 3-DVD, 4-CD, 5-Seed |
| `secondHandCategory` | BOOLEAN | whether second hand category |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010008 | Category not found |  |
| 150010124 | The catId not a leaf category |  |
| 150010042 | Category unavailable |  |

---

## `bg.local.goods.size.element.get`

> **Official docs**: [bg.local.goods.size.element.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=e93835a33b7a40ce8769fdf75561aff4)

Check size chart/image upload limits and requirements for this category.

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | language |
| `catId` | LONG | True | Leaf CatId |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT | result |
| `sizeSpecElementRule` | OBJECT | Size specification element rule |
| `catId` | INTEGER | Category ID |
| `classId` | INTEGER | Size classification ID |
| `isSizeChartRequired` | BOOLEAN | Flag to determine if a size chart is required for product in live |
| `className` | STRING | Size classification name |
| `allowRange` | BOOLEAN | Whether range intervals are supported |
| `needUSSpec` | BOOLEAN | Whether US size is required |
| `localCodeId` | INTEGER | Current size specification element information |
| `localCodeName` | STRING | localCode Name |
| `sizeSpecType` | INTEGER | Size acquisition method: 0 = Get size from attribute template specifications, 1 = Predefined size |
| `sizeSpecElementList` | OBJECT[] | Current size specification element information |
| `setElementList` | OBJECT[] | Set size information |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010124 | The catId not a leaf category |  |
| 150010042 | Category unavailable |  |

---

## `bg.freight.template.list.query`

> **Official docs**: [bg.freight.template.list.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=93fecd4d21fd441a8abcfc1497fa085e)

query freight template list by Temu seller, use for claim that goods logistics fee rules  when listing items

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `result` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |

---

## `temu.local.goods.brand.trademark.V2.get`

> **Official docs**: [temu.local.goods.brand.trademark.V2.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=fc3de2c8546a496d8a5be8d36953e1bd)

Query trademarks and properties

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `page` | INTEGER | True | Page number, used for pagination |
| `size` | INTEGER | True | Page size, indicating the number of records returned per page, with a limit of 100 per page |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `pageNo` | INTEGER | The page number of the result set |
| `totalNum` | LONG | Total number of trademarks |
| `trademarkList` | OBJECT[] | List of trademarks |
| `brandId` | LONG | ID of the brand |
| `brandName` | STRING | Name of the brand |
| `trademarkId` | LONG | ID of the trademark |
| `trademarkName` | STRING | Name of the trademark |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |

---

## `bg.local.goods.gallery.signature.get`

> **Official docs**: [bg.local.goods.gallery.signature.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=a8f8f3dca5ac4e2c8b9e7bc9d64704c8)

Get gallery Signature

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `uploadFileType` | INTEGER | True | Type of file to be uploaded: 1-Image, 2-Video, 3-Manual, 4-Qualification Document |

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

## `temu.local.goods.illegal.vocabulary.check`

> **Official docs**: [temu.local.goods.illegal.vocabulary.check](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=7f9ded1bfce7485798c3862467d5c30e)

check illegal vocabulary

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `goodsName` | STRING | False | Goods name content |
| `goodsDesc` | STRING | False | Goods description content |
| `bulletPoints` | STRING[] | False | Bullet points content |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT |  |
| `checkResult` | STRING | The result of illegal vocabulary check (PASS, FAILED) |
| `failReasonList` | OBJECT[] | A list of failure reasons if checkResult is FAILED |
| `violationItem` | STRING | Violation item Possible values: GOODS_NAME GOODS_DESCRIPTION BULLET_POINTS |
| `violationWarningContentList` | OBJECT[] | Violation warning content |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |

---

## `bg.local.goods.sku.out.sn.check`

> **Official docs**: [bg.local.goods.sku.out.sn.check](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=2b42b46f51c348b69bf8f69c5397279e)

Check if contribution ID for SKU is duplicate

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `outSkuSnList` | STRING[] | False | Contribution SKU Code List: 1. Supports a maximum of 50 entries. 2. The character length of a single code must not exceed 40 characters |
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

## `bg.local.goods.out.sn.check`

> **Official docs**: [bg.local.goods.out.sn.check](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=8a6a6e8b14814d518fe8f004f35b2192)

Check if contribution ID for goods is repeated

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `outGoodsSnList` | STRING[] | False | Contribution Product Code List: 1. Supports a maximum of 50 entries. 2. The character length of a single code must not exceed 100 characters. |
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

## `bg.local.goods.compliance.info.fill.list.query`

> **Official docs**: [bg.local.goods.compliance.info.fill.list.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=f8065a07b2d6441f9f33c2d808dcc593)

local-local goods B, query compliance information fill in the drop-down list

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |
| `page` | INTEGER | True | Page number |
| `size` | INTEGER | True | Number of items per page, maximum 20 |
| `complianceInfoType` | INTEGER | True | Query type 4:A/S Responsible Person |
| `searchText` | STRING | False | search keyword |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `total` | INTEGER | total number of records |
| `authRepInfoList` | OBJECT[] | Responsible Person pagination query result |
| `repType` | INTEGER | Responsible Person Type 4:A/S Responsible Person |
| `repId` | LONG | Responsible Person ID |
| `repName` | STRING | Name |
| `repStatus` | INTEGER | Status 0: Agency Agreement Pending 1: Declaration in Progress 2: Declaration Failed 3: Declaration Successful 4: Agency Not Started 5: Agency Expired |
| `repAddressInfo` | OBJECT | Address |
| `repMobile` | STRING | Company contact details (Telephone) |
| `repTelCode` | INTEGER | Agent Area Code |
| `startTimestamp` | LONG | Agency Start Time (ms) |
| `endTimestamp` | LONG | Agency End Time (ms) |
| `personType` | INTEGER | Person Subtype 3:After Sales Manager, 4: Consumer Consultation Hotline |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |

---

## `bg.local.goods.compliance.rules.get`

> **Official docs**: [bg.local.goods.compliance.rules.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=3f15de61844e4a989d042767a385d8f5)

Query Mandatory Qualification Information

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |
| `goodsId` | LONG | False | Product ID, used to query the existing template for filling in the qualification and images of the product |
| `catId` | LONG | False | Leaf category ID |
| `normalPropertyList` | OBJECT[] | False | Regular product attributes |
| `governPropertyList` | OBJECT[] | False | Product governance attributes |
| `pid` | LONG | False | Attribute ID |
| `refPid` | LONG | False | Reference attribute ID |
| `vid` | LONG | False | Attribute value ID |
| `value` | STRING | False | Attribute value |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT | result |
| `goodsCertList` | OBJECT[] | List of product qualifications |
| `checkInfoList` | OBJECT[] | Product Packaging Real-Shot Photo Inspection Checklist |
| `actualPhotoRequirement` | OBJECT[] | Image requirements for product packaging photos |
| `mustHaveActualPhoto` | BOOLEAN | Whether the actual picture is required |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010124 | The catId not a leaf category |  |

---

## `bg.local.goods.compliance.extra.template.get`

> **Official docs**: [bg.local.goods.compliance.extra.template.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=d72b66d07b1f499bbd80720367e58e1f)

Inquire Required Compliance Information

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | language |
| `catId` | LONG | True | Leaf category IDs |
| `goodsId` | LONG | False | Product ID, used to query the rules of the governance attributes of the product |
| `normalPropertyList` | OBJECT[] | False | Regular product attributes |
| `governPropertyList` | OBJECT[] | False | Product governance attributes |
| `pid` | LONG | False | Attribute ID |
| `refPid` | LONG | False | Reference attribute ID |
| `vid` | LONG | False | Attribute value ID |
| `value` | STRING | False | Attribute value |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | Current request success status: returns True if successful, otherwise returns False. |
| `errorCode` | INTEGER | Error code: Used to refer to the error codes below, which can help find the corresponding solutions for each error. |
| `errorMsg` | STRING | Error message: The feedback content corresponding to the error code. |
| `result` | OBJECT | result |
| `extraTemplateList` | OBJECT[] | Supplementary attributes |
| `extraComplianceInfoList` | OBJECT[] | extra compliance info |
| `guideFileRequirement` | OBJECT | Instruction manual requirements |
| `isRequired` | BOOLEAN | Whether it is required |
| `requiredLanguageList` | STRING[] | List of required languages |


#### Error Codes

| Code | Message | Description |
|---|---|---|
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010042 | Category unavailable |  |
| 150010124 | The catId not a leaf category |  |

---

## `bg.local.goods.compliance.property.check`

> **Official docs**: [bg.local.goods.compliance.property.check](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=e84f651da04f4fedb85d37e375a4e2d8)

Verify Product Attribute Settings

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `normalPropertyList` | OBJECT[] | True | List of normal properties. |
| `vid` | LONG | False | ID of the property value. |
| `pid` | LONG | False | ID of the property. |
| `refPid` | LONG | False | ID of the referenced property. |

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

## `bg.local.goods.tax.code.get`

> **Official docs**: [bg.local.goods.tax.code.get](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=a084faecbad64d7f93c485378b5bd9bf)

local-local goods B

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `catId` | LONG | False | Leaf Category ID |
| `language` | STRING | False | Language |

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
| 150011026 | The current site's products do not require tax code verification. |  |
| 150010002 | System error, please try again later |  |
| 150010003 | Invalid Request Parameters |  |
| 150010005 | Try again later |  |
| 150010042 | Category unavailable |  |

---

## `temu.local.goods.sku.net.content.unit.query`

> **Official docs**: [temu.local.goods.sku.net.content.unit.query](https://partner-us.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a&sub_menu_code=1b99296745854ae08d39a7bbe1e4f7a8)

Query multi-language information of sku transfer type net content unit

### Request Parameters

| Property | Type | Required | Description |
|---|---|---|---|
| `request` | OBJECT | False |  |
| `language` | STRING | False | Language |

### Response Parameters

| Property | Type | Description |
|---|---|---|
| `response` | OBJECT |  |
| `success` | BOOLEAN | success |
| `errorCode` | INTEGER | error code |
| `errorMsg` | STRING | error message |
| `result` | OBJECT | Specific information |
| `netContentUnitTypeDTOList` | OBJECT[] | List of all types of physical unit. |
| `value` | STRING | The type of physical unit, such as weight, volume, area, length, etc. |
| `netContentUnitDTOList` | OBJECT[] | List of a specidic type of physical unit. |

---
