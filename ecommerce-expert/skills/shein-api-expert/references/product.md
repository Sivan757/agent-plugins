# SHEIN Open API — Product API

Product publishing, editing, querying, category/attribute management, images, brands, and pricing.

## Table of Contents

- [Product publish or Edit](#product-publish-or-edit)
- [Confirm whether the store can publish products](#confirm-whether-the-store-can-publish-products)
- [Confirm whether the product is editable](#confirm-whether-the-product-is-editable)
- [Partial product editing](#partial-product-editing)
- [Check product audit status](#check-product-audit-status)
- [Product list API](#product-list-api)
- [Query product detail by spu（new）](#query-product-detail-by-spunew)
- [Comprehensive product query](#comprehensive-product-query)
- [sku item details query (to be deprecated soon)](#sku-item-details-query-to-be-deprecated-soon)
- [Get the final category](#get-the-final-category)
- [Store check optional attributes](#store-check-optional-attributes)
- [Query whether custom attribute values are supported](#query-whether-custom-attribute-values-are-supported)
- [Add custom attribute values](#add-custom-attribute-values)
- [Query associated attribute filling rules](#query-associated-attribute-filling-rules)
- [Product release field specifications (including default language)](#product-release-field-specifications-including-default-language)
- [Query whether the merchant sku already exists](#query-whether-the-merchant-sku-already-exists)
- [Image and text recognition recommended category](#image-and-text-recognition-recommended-category)
- [Convert image link](#convert-image-link)
- [Local Image Upload](#local-image-upload)
- [Query store site and currency information (new)](#query-store-site-and-currency-information-new)
- [Get brand list](#get-brand-list)
- [Product price update API](#product-price-update-api)
- [Update cost API](#update-cost-api)
- [Obtain store listing quota](#obtain-store-listing-quota)
- [Product listed and product pending listed](#product-listed-and-product-pending-listed)
- [Query store site and site currencies (old)](#query-store-site-and-site-currencies-old)
- [Query full brand information](#query-full-brand-information)
- [Get the list of IPs available for the store](#get-the-list-of-ips-available-for-the-store)
- [Get the list of discuss prices](#get-the-list-of-discuss-prices)
- [Process discuss order](#process-discuss-order)
- [Upload document file for discuss order](#upload-document-file-for-discuss-order)
- [Check product certificate requirements and verification status](#check-product-certificate-requirements-and-verification-status)
- [Documents required to query the certificate (New)](#documents-required-to-query-the-certificate-new)
- [Upload certificate file](#upload-certificate-file)
- [Create/edit product certificate pool](#createedit-product-certificate-pool)
- [Create/edit shop certificate pool](#createedit-shop-certificate-pool)
- [SKC bind product certificate pool](#skc-bind-product-certificate-pool)
- [Commodity interface - obtain SKC and size in batches according to the barcode](#commodity-interface---obtain-skc-and-size-in-batches-according-to-the-barcode)
- [Commodity interface - full query SKC/SKU/design model number relationship list](#commodity-interface---full-query-skcskudesign-model-number-relationship-list)
- [Product withdrawal](#product-withdrawal)

---

## Product publish or Edit

> **Official docs**: [Product publish or Edit](https://open.sheincorp.com/documents/apidoc/detail/3001676)

**Method**: `POST` &nbsp; **Path**: `/goods/product/publishOrEdit`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `brand_code` | string | No | Brand code available for the store。Mandatory for some merchants, confirmed via【Product release specifications】API. When field_key=brand_code & required=true, it is mandatory. Code must be obtained from【Store brand list query】API。When editing produ... |
| `category_id` | int64 | Yes | Last-level category id。Obtained through the 【Query shop last-level category】API, last_category=true represents the last-level category. Note: When editing SPUs that have been approved, modifying category_id is not allowed. |
| `product_type_id` | int64 | No | Product type ID。When publishing new products, you need to obtain it through the 【Shop query product final classification】API。When editing products, it is recommended to obtain it through /open-api/goods/spu-info。The platform may modify the product... |
| `source_system` | string | No | Fixed OpenAPI |
| `spu_name` | string | No | Platform-generated unique SPU code。Do not send for new published products/adding SKC to already published products, but it is mandatory for editing。 |
| `supplier_code` | string | No | Merchant item number, to the main specification granularity, up to 200 characters, see supplier_code FAQ |
| `suit_flag` | string | No | Is it a set. 1-Yes, 0-No.API does not currently support sets, so it must be 0. If not provided, the system defaults to 0. |
| `is_spu_pic` | boolean | No | Whether the new image solution will be used. true-use the new solution, false-use the old solutionNot sending the field defaults to false. The differences in uploading between the new and old solutions are significant, please refer to the product ... |
| `ip_character_list` | object[] | No | Product IP. Currently, only 1 IP is supported for each product.Available IPs for the store can be obtained through the interface: /open-api/goods/query-ip-list. To confirm whether the store can pass IP, check the specification interface, "ip_chara... |
| `ip_id` | int64 | Yes | The ID of the IP. If ip_character_list is passed, ip_id is required. |
| `ip_name` | string | No | The English name of the IP |
| `ip_name_cn` | string | No | The Chinese name of the IP |
| `fill_configuration_info` | object | No | product information filling rules.There are many new filling rules for product release. The interface layer is compatible with both new and old schemes, but developers need to inform the platform through this field whether the new or old scheme is... |
| `filled_quantity_to_sku` | boolean | No | Whether to fill in the quantity at the sku level.Not all merchants and categories support passing quantities at the sku level. Please check the product release specifications first. If "field_key": "quantity_info", and "show"="true", it means that... |
| `fill_configuration_tags` | string[] | No | Whether certain information was filled in this input. If information A was filled, enter A here. Currently available enumerated values: PACKAGE_TYPE_TO_SKU - Corresponds to SKU-level packaging type (package_type) |
| `image_info` | object | No | SPU image list。Can only be uploaded when is_spu_pic=true, please refer to the product image plan for details。When editing product information, not passing the field means clearing the data。 |
| `image_group_code` | string | No | Image group code.Cannot be passed when releasing new products/adding new SKC under published products, but is mandatory for editing. Obtain it through querying SPU details. |
| `image_info_list` | object[] | No | Image list.For information on what types of images are required, quantity limits, and size requirements for each type of image, please refer to Product image plan for details. |
| `image_item_id` | int64 | No | Unique image code generated by the platform.For newly published products/adding SKC to already published products, it is not required to send. In edits, in some cases, it is mandatory to send. Please refer to the input example |
| `image_sort` | integer | No | Image sequence number.Sequence values within the same image group cannot be duplicated. If the image is sent with type=1, then this image must have sort=1. |
| `image_type` | integer | No | Image type。1-Main image,2-Detail image,5-Block image,6-Color block image。 To know which types of images are required, quantity restrictions, and size requirements for each type of image, please refer to Product Image Plan for detailed information。 |
| `image_url` | string | No | Image link。Must be a SHEIN format URL, obtained through External link conversion or Local image upload。 |
| `multi_language_desc_list` | object[] | No | Product description list (supports multiple languages)When editing product information, if the field is not provided, the data will be cleared. |
| `language` | string | Yes | Language.If a description is provided, the default language must also be provided. The default language can be obtained through the Product release specifications API default_language. |
| `name` | string | Yes | Multilingual description, up to 5000 characters. Please do not enter HTML content, emojis, or special symbols (validation regex: .*[\\ud800\\udc00-\\udbff\\udfff\\ud800-\\udfff].*) |
| `multi_language_name_list` | object[] | Yes | Product name list (supports multiple languages) |
| `language` | string | Yes | Language.If a description is provided, the default language must also be provided. The default language can be obtained through the Product release specifications API default_language. |
| `name` | string | Yes | Product name, at least 2 characters, up to 1000 characters, emojis are not supported. |
| `product_attribute_list` | object[] | Yes | Product attribute list.This list can only include attributes with attribute_type=3/4. For usage of attributes, please refer to Product Attribute Documentation.When editing product information, not passing this field means clearing the attributes. |
| `attribute_extra_value` | string | No | Attribute value (manual input type)。When the attribute input method attribute_mode=0/4，it needs to be entered here. Supports positive integers and text inputWhen attribute_type=3 and attribute_mode=4 (dropdown multi-select + manual input), the sum... |
| `attribute_id` | int64 | Yes | Attribute ID.In product attributes, only attributes with attribute_type=3/4 can be provided.Mandatory product attributes are of 2 types: first, attributes with attribute_status=3, confirmed through store-available attributes; second, mandatory rel... |
| `attribute_value_id` | int64 | Yes | Attribute value ID. When the attribute input method is attribute_mode=1/3/4, this parameter needs to be entered here.When attribute_mode=3 (drop-down single selection), it means that there can only be 1 attribute value ID under attribute ID; when ... |
| `site_list` | object[] | No | Publishing site.Available modes: self-operated, semi-managed, POP.When publishing new products/adding SKC to already published products, it must be provided. When editing, it cannot be provided. |
| `main_site` | string | No | Main site.The value of the mainSite field obtained through the [Query store sellable sites and site currencies] API |
| `sub_site_list` | string[] | No | Sub-site。Mandatory for new product launches, obtained through the 【Query shop available sites and site currencies】API, only the value of 【siteAbbr】 with site_status=1 (enabled status) can be used. |
| `size_attribute_list` | object[] | No | Size chart。Size attributes are complex，please refer toProduct attribute document。When there are required size attributes among the available attributes，the size chart must be uploaded。（type=2&status=3）When editing product information，not submittin... |
| `attribute_id` | int64 | No | Attribute ID. This field can only be used for attributes with attribute_type=2. There are mandatory size attributes, attribute_status=3 is a mandatory attribute, verified through Store available attributes . |
| `attribute_value_id` | int64 | No | Attribute value ID.Size attribute does not require this value, it needs to be assigned in attribute_extra_value. |
| `attribute_extra_value` | string | No | Attribute value (manual input type).When the input method of the attribute attribute_mode=0/4, parameters need to be entered here. Only positive integers are supported. |
| `relate_sale_attribute_id` | int64 | No | Associated sales attribute ID.Size attributes can be associated with sales attributes to form a size chart.Note: Only sku dimension attributes can be associated.For example, size: size attribute: length, sales attribute: size-S, combined to form a... |
| `relate_sale_attribute_value_id` | int64 | No | Associated sales attribute value ID.Note: Only SKU-level attributes can be associated. |
| `relate_sale_attribute_value` | string | No | Associated custom attribute values。When the attribute value of the SKU is a custom attribute value, enter the parameter here。The content needs to be consistent with the SKU attribute value。If the value form is used in the SKU attribute value, the ... |
| `skc_list` | object[] | Yes | SKC list。A maximum of 40 SKCs under one SPU. |
| `image_info` | object | Yes | SKC image list。The image upload requirements for the new and old image plans are different, please refer to Product image plan to confirm which image types, quantity limits, and size requirements are needed for the SKC level。When editing product i... |
| `image_group_code` | string | No | Image group code。Do not send for new published products/adding SKC to already published products, but it is mandatory for editing。Obtain through Query SPU details。 |
| `image_info_list` | object[] | Yes | image list |
| `image_item_id` | long | No | Platform-generated unique image code。Do not send for new published products/adding SKC to already published products, but it is mandatory in some situations when editing。Please refer to the input example |
| `image_sort` | integer | Yes | Image sequence number。The sequence values within the same image group cannot be repeated。Note that the image with image_type=1 must have sort=1。 |
| `image_type` | integer | Yes | Image type. 1-Main image (up to 1), 2-Detail image (up to 10), 5-Square image, 6-Color block image (Color block image is optional for single SKC, mandatory for multiple SKCs).For the types of images required, quantity limits, and size requirements... |
| `image_url` | string | Yes | Image link。Must be a SHEIN format URL, obtained through External link conversion or Local image upload。 |
| `sale_attribute` | object | Yes | SKC sales attribute。It must be passed when publishing a new product/adding SKC under an already published product. It is mandatory in the editing scenario but cannot be modified. A product has and only has 1 SKC sales attribute.This field can only... |
| `attribute_id` | int64 | Yes | Sales Attribute ID |
| `attribute_value_id` | int64 | Yes | Sales attribute value ID |
| `custom_attribute_value` | string | No | Custom attribute value。See the document for details on how to use。Only when the sales attribute ID supports custom attribute values can this field be filled. It can be confirmed through/open-api/goods/get-custom-attribute-permission-config。Attribu... |
| `language` | string | No | Language of the custom attribute value.Supported languages: en, zh-cn, fr, es, it. If the ERP does not provide multilingual content, the platform will perform system translation. |
| `skc_name` | string | No | The unique SKC code generated by the platform.It cannot be passed in the add scenario, it is mandatory in the edit scenario if updating a published SKC, and it is not required if adding a new SKC. |
| `supplier_code` | string | Yes | Merchant-side SKC dimension item number, up to 200 characters |
| `skc_title` | string | No | SKC dimension product title.Mandatory for some merchants, confirmed through the Product publishing specification interface, "field_key":"skc_title","required":"true" is mandatory, "show":"false" cannot be passed. Just provide the title in the defa... |
| `sku_list` | object[] | Yes | SKU list。A maximum of 400 SKUs (200 available, 200 discontinued) under one SKCEven if there are no SKUs under SKC, SKU list data is still required. In this case, the sales attributes of the SKU can be left blank. |
| `cost_info` | object | No | SKU supply priceAvailable application modes: semi-managed, fully managed. Newly published product/added SKCSKU must be passed, cannot be passed during editing. To update the approved SKU supply price, you need to call the API 【Update supply price】... |
| `cost_price` | string | No | Supply price。Up to 2 decimal places。Numbers between 0-100000。Negative numbers cannot be entered。 |
| `currency` | string | No | Currency abbreviation.The currency available to merchants is the 【currency】 in the Product Release Specification. |
| `height` | string | Yes | Including package dimensions: Height（cm）。Supports entering positive numbers, up to 2 decimal places。 |
| `length` | string | Yes | Including package dimensions: Length（cm）。Supports entering positive numbers, up to 2 decimal places。 |
| `width` | string | Yes | Including package dimensions: Width（cm）。Supports entering positive numbers, up to 2 decimal places。 |
| `weight` | integer | Yes | Weight with packaging: weight (g).Supports input of positive integers, 0 is not allowed |
| `mall_state` | integer | Yes | SKU mall sales status.1. On sale; 2. Off sale; Note: If the SKU is set to off sale, the SKU stock quantity will not be saved, and the stock quantity will be displayed as empty in the merchant backend. |
| `sku_code` | string | No | Unique SKU code generated by the platform.Not allowed for new product releases/adding SKU under an already released product, required when editing an existing SKU |
| `stop_purchase` | integer | No | Purchase status (only for exclusive use and mandatory)1: Available, 2: Unavailable |
| `image_info` | object | No | SKU image list。All products can upload SKU images, only one image is supported. Mandatory under any of the following conditions: 1. If one SKU under SKC has an image, then all SKUs under SKC need to upload images. 2. When the quantity of SKU ≥ 2, ... |
| `image_group_code` | string | No | Image group code。Do not send for new published products/adding SKC to already published products, but it is mandatory for editing。Obtain through Query SPU details。 |
| `image_info_list` | object[] | No | Image list.To know what types of images are required, the quantity restrictions, and the size requirements for each type of image, please refer to Product Image Plan for more details. |
| `image_item_id` | int64 | No | Platform-generated unique image code。Do not send for new published products/adding SKC to already published products, but it is mandatory in some situations when editing。Please refer to the input example |
| `image_sort` | integer | No | Image sequence number。The sequence values within the same image group cannot be repeated。If the image sent is of type=1, this image must have sort=1。 |
| `image_type` | integer | No | Image type。SKU images only support image_type=1。Image requirements are as follows：● Pixel 1340px*1785px；or aspect ratio 1:1, pixel range 900px-2200px● Format JPG/JPEG/PNG● Size ≤3MB |
| `image_url` | string | No | Image link。Must be a SHEIN format URL, obtained through External link conversion or Local image upload。 |
| `supplier_sku` | string | Yes | SKU code maintained by the merchant. supplier_sku must be unique in the store and cannot be duplicated. One supplier_sku corresponds to one platform SKU, with a maximum of 200 characters. It can be confirmed via endpoint if the entered value alrea... |
| `supplier_barcode` | object | No | Merchant barcode。Only some merchants can use it, need to confirm through the interface：/open-api/goods/query-publish-fill-in-standard，In the response, supplier_barcode's show=true means it can be filled.Not required, if it is an update scenario, p... |
| `barcode` | string | No | Product barcode. Regardless of the barcode type, only numbers are supported, up to 32 characters.Barcodes cannot be duplicated among SKUs under the same SKC. |
| `barcode_type` | string | No | Barcode type. Enumerated values: EAN, UPC |
| `competing_product_link` | string | No | Product information reference link.Required for some merchants, confirm through the product publishing specification interface, "field_key":"reference_product_link","required":"true" is mandatory, "show":"false" cannot be transmitted. Link charact... |
| `price_info_list` | object[] | Yes | Price information (only for self-operation and POP use).Mandatory for new product releases/new SKCSKU additions, cannot be passed during editing. Updating the price of an already published SKU requires adjustment through 【Update product price】.The... |
| `base_price` | double | Yes | Original price。Only positive numbers are supported, cannot be equal to 0, up to 2 decimal places (Japanese yen does not support decimals). The original price must be greater than the special price. |
| `currency` | string | Yes | Currency abbreviation。Currency is bound to the site, for example, the US site currency is USD. The currency of each site can be obtained through Query Site Currency. |
| `special_price` | double | No | Special price。Only positive numbers are supported, cannot be equal to 0, up to 2 decimal places (Japanese yen does not support decimals). The special price must be less than the original price. |
| `sub_site` | string | Yes | Site (subsite)。The range of sites where the store can list products is obtained via Query site currency. Here, use site_status=1 (enabled) site_abbr |
| `sale_attribute_list` | object[] | No | SKU sales attribute list.Only attributes with attribute_type=1 and attribute_label=0/1 can be input. attribute_status=3 is a mandatory attribute and must be confirmed through store available attributes;If there is no SKU under SKC, the sales attri... |
| `attribute_id` | int64 | No | Sales Attribute ID |
| `attribute_value_id` | int64 | No | Sales attribute value ID |
| `custom_attribute_value` | string | No | Custom attribute value。See the document for usage details。Only when the sales attribute ID supports custom attribute values can this field be used. You can confirm through /open-api/goods/get-custom-attribute-permission-config。Attribute value requ... |
| `language` | string | No | Language of the custom attribute value.Supported languages: en, zh-cn, fr, es, it. If the ERP does not provide multilingual content, the platform will perform system translation. |
| `stock_info_list` | object[] | Yes | Inventory InformationMandatory when releasing new products/adding new SKCs, not applicable in editing scenarios. For inventory updates, use Modify Inventory (Self-Operation & Semi-Managed), Supplier Inventory Update (Fully Managed). |
| `inventory_num` | integer | Yes | Total product inventory, value range [0,99999] |
| `supplier_warehouse_id` | string | No | Merchant warehouse ID 。When a store has multiple warehouses, this field is mandatory，can be obtained through【Merchant warehouse list query】API |
| `supplier_warehouse_name` | string | No | Merchant warehouse name。Can be obtained through the API 【Merchant warehouse list query】。 |
| `quantity_info` | object | No | SKU dimension quantity informationThis interface input field “filled_quantity_to_sku”="true" allows values to be passed in this field. For more quantity input examples, refer toFAQ |
| `quantity_type` | integer | No | Quantity type。1-single item 2-multiple items of the same product 3-mixed set（unrelated to the status defined by suit_flag）Approved SKUs cannot modify quantity information。 |
| `quantity_unit` | integer | No | Quantity unit。1-piece 2-pair 3-setFor all SKUs under the same SKC, the quantity unit must remain consistent。Approved SKUs cannot modify quantity information。 |
| `quantity` | integer | No | quantity value.The quantity information of approved SKUs cannot be modified. |
| `package_type` | string | No | SKU dimension packaging type. Fill in the field fill_configuration_tags with PACKAGE_TYPE_TO_SKU in this interface, then the field can be filled, and values 0-4 can be passed;Enumeration values: 0: Clear packaging 1: Soft packaging + soft items, 2... |
| `minimum_stock_quantity` | string | No | Minimum stock quantity。 Only integers are supported, range: [1，1000000] 。Whether the value can be passed needs to be confirmed through the product release specification API, "field_key":"minimum_stock_quantity","required":"true" is mandatory, "sho... |
| `suggested_retail_price` | object | No | Suggested retail price. Not available for all merchants, must be confirmed via product publishing specification endpoint, where "field_key":"suggest_price","required":"true" indicates it is mandatory, and "show":"false" indicates it cannot be sent... |
| `currency` | string | No | Currency abbreviation。Available currency list: USD, CNY, EUR, SAR, AED, CAD, MXN, HKD, VND, THB, GBP, INR, BRL, TRY, NZD. Currently, there is no interface for dynamically querying available currencies. |
| `price` | double | No | Price。Only positive numbers are supported, cannot be equal to 0, up to 2 decimal places (Japanese yen does not support decimals). |
| `site_detail_image_info_list` | object[] | No | Site detail image list.Image requirements: Upload 3:4 images, images with pixels greater than 900px, up to 10 images can be supported.Some merchants cannot upload images, please check the product release specifications. If "field_key": "product_de... |
| `image_group_code` | string | No | Image group code。Cannot be passed in new scenarios, but is mandatory when updating a published SKC in edit scenarios (unless review fails). Obtain it via Query SPU Details。 |
| `site_abbr_list` | string[] | No | List of sites |
| `image_info_list` | object[] | No | Picture information |
| `image_item_id` | string | No | Do not send the first added detail images, if you need to change existing detail images, send the image group ID |
| `image_sort` | integer | No | Sorting |
| `image_url` | string | No | Image linkMust be a SHEIN format URL, which can be obtained through External link conversion or Local image upload. Use type=7 for conversion. |
| `proof_of_stock_list` | object[] | No | Proof of stock.Required for some merchants, confirmed via product release specification interface, "field_key":"proof_of_stock","required":"true" when required, "show":"false" when not allowedSupports image, PDF format files, size not exceeding 3M... |
| `file_name` | string | No | File name |
| `type` | string | No | File type.1: Image; 2: PDF |
| `url` | string | No | File link. |
| `shelf_require` | string | No | Whether it is mandatory to arrive at the SHEIN warehouse before being listed. 0: No, 1: Yes.Mandatory in full management mode, for other modes, confirm whether it is mandatory through the product publishing specification interface, "field_key":"sh... |
| `shelf_way` | string | No | Listing method。1-Automatic listing；2-Scheduled listing。 |
| `hope_on_sale_date` | string | No | Expected listing date。 When shelf_way=2-Scheduled listing, hope_on_sale_date is mandatory, otherwise it is not filled; the time should be given to the second, and the value should be given according to Beijing time, e.g.:2022-03-21 00:00:00。 |
| `sale_attribute_sort_list` | object[] | No | Sales attribute sorting。Set the display order of attribute values on the consumer product details page。 Please call the 【Product Release Field Specifications (including default language)】 API, and determine whether this sales attribute supports so... |
| `attribute_id` | int64 | Yes | Attribute name ID |
| `in_order_attribute_value_id_list` | int64[] | No | Attribute value ID sorting list 。The list is arranged in the desired order to ensure that the order of attribute values on the product details page matches the order in the incoming parameters 。 |
| `in_order_attribute_value_list` | object[] | No | A sorted list of attribute value IDs/custom attribute value notes. If there are custom attribute values under an attribute, this field must be used. Use the corresponding field for the type of attribute value, and input them in order according to ... |
| `attribute_value_id` | string | No | Attribute value ID |
| `custom_attribute_value` | string | No | The content of the custom attribute value. The input content must be exactly the same as the attribute value filled in the sales attributes. |
| `sample_info` | object | No | Sample information。Whether values can be passed needs to be confirmed via the Product Release Specifications API。 When "field_key":"sample_spec","required":"true", it is mandatory。 When sample information is mandatory, the outermost size_attribute... |
| `sample_spec` | object | No | Sample specification |
| `main_spec` | object | No | Main sales attribute information of the sample。 |
| `attribute_id` | long | No | Main sales attribute id |
| `attribute_value_id` | long | No | Main sales attribute value id |
| `attribute_value_name` | string | No | Custom attribute value of the main sales attribute |
| `sub_spec_list` | object[] | No | Information on the secondary sales attributes of the sample; common ones are size |
| `attribute_id` | string | No | Secondary sales attribute id |
| `attribute_value_id` | string | No | Secondary sales attribute value id |
| `attribute_value_name` | string | No | Custom attribute value of the secondary sales attribute |
| `sample_judge_type` | integer | No | Approval type (2: Bulk fabric samples), fixed as 2 |
| `reserve_sample_flag` | integer | No | Sample retention (1: Yes; 2: No), fixed as 2 |
| `spot_flag` | integer | No | Ready product (1: Yes; 2: No) |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `code` | string | Yes |
| `info` | object | No |
| `pre_valid_result` | object[] | No |
| `form` | string | No |
| `messages` | string[] | No |
| `module` | string | No |
| `mcc_valid_result` | object[] | No |
| `message` | string | No |
| `type` | integer | No |
| `filtered_result` | object[] | No |
| `scene` | string | No |
| `message` | string | No |
| `spu_name` | string | No |
| `skc_list` | object[] | No |
| `skc_name` | string | No |
| `sku_list` | object[] | No |
| `sku_code` | string | No |
| `supplier_sku` | string | No |
| `success` | boolean | No |
| `version` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/product/publishOrEdit' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752723623139' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
  "category_id": "20039882",
  "brand_code": "",
  "multi_language_desc_list": [
    {
      "language": "en",
      "name": "<p>Cool and comfortable for staying active on the go, our SLF Mesh Short are made from soft, lightweight mesh fabric that lets your skin breathe freely. The longer 9-inch leg length has room to cover up quickly if you need to, while wide side pockets make it easy to stash a phone or keys.</p>\n<p>The SLF Mesh Shorts add a fun flair to your wardrobe. Pair them with your favorite hoodie and some sneakers for an effortless look.</p>\n<p><b>Shorts Features</b></p>\n<ul>\n<li>Trendy style</li>\n<li>Lightweight mesh fabric</li>\n<li>Elastic stretch waistline</li>\n<li>Standard fit</li>\n<li>Side pockets</li>\n<li>Model is wearing size medium</li>\n</ul><br><br>Fulfilled by SLEEFS"
    }
  ],
  "multi_language_name_list": [
    {
      "language": "en",
      "name": "Amphibious Camo Shorts - 5\""
    }
  ],
  "site_list": [
    {
      "main_site": "shein",
      "sub_site_list": [
        "shein-fr"
      ]
    }
  ],
  "skc_list": [
    {
      "shelf_way": "1",
      "image_info": {
        "image_info_list": [
          {
            "image_sort": 1,
            "image_type": 1,
            "image_url": "https://imgdeal-test01.shein.com/images3_pi/2024/12/05/4d/17333665721070007089_square.jpeg"
          },
          {
            "image_sort": 2,
            "image_type": 2,
            "image_url": "https://imgdeal-test01.shein.com/images3_pi/2024/12/05/4d/17333665721070007089_square.jpeg"
          },
          {
            "image_sort": 3,
            "image_type": 5,
            "image_url": "https://imgdeal-test01.shein.com/images3_pi/2024/12/05/73/17333665751070007089.jpeg"
          },
          {
            "image_sort": 4,
            "image_type": 6,
            "image_url": "https://imgdeal-test01.shein.com/images3_pi/2024/12/05/ae/17333665792390132818.jpeg"
          }
        ]
      },
      "sale_attribute": {
        "attribute_id": 2147484187,
        "attribute_value_id": 2147488294
      },
      "skc_name": "",
      "sku_list": [
        {
          "mall_state": 1,
          "sku_code": "",
          "height": "20",
          "sale_attribute_list": [
            {
              "attribute_id": 2147484186,
              "attribute_value_id": 19884726
            }
          ],
          "stop_purchase": 1,
          "supplier_sku": "",
          "weight": 10,
          "width": "10",
          "length": "10"
        }
      ],
      "supplier_code": "54369dd1-68ef-4996-94b5-6486e584a5951"
    }
  ],
  "suggested_retail_price": {
    "currency": "USD",
    "price": 20
  },
  "suit_flag": 0,
  "spu_name": ""
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "success": true,
        "spu_name": "MM2412222464",
        "skc_list": [
            {
                "skc_name": "sMM24122224647569",
                "sku_list": [
                    {
                        "sku_code": "I7be1tn2tfoo",
                        "supplier_sku": "sc_eu20241127001ss241113986146541TEST2"
                    }
                ]
            }
        ],
        "version": "SPMP241222341208032",
        "pre_valid_result": null,
        "mcc_valid_result": null,
        "extra": {}
    },
    "bbl": null,
    "traceId": "3acb2f3aa7649de9"
}
```

---

## Confirm whether the store can publish products

> **Official docs**: [Confirm whether the store can publish products](https://open.sheincorp.com/documents/apidoc/detail/3001589)

**Method**: `GET` &nbsp; **Path**: `/goods/product/check-publish-permission`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `brandCode` | string | No | Brand code。Only self-operated/semi-managed merchants support input parameters, used to confirm whether the brand used for release is a quota-exempt brand。If the input brand is an exempt brand，then this product will not occupy the on-shelf quota。Th... |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `canPublishProduct` | boolean | No |
| `reason` | string | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request GET 'https://openapi.sheincorp.com/open-api/goods/product/check-publish-permission?brandCode=2tgt1' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1770370981988' \
--header 'language: US' \
--header 'Accept: */*' \
--header 'Host: openapi.sheincorp.com' \
--header 'Connection: keep-alive'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "canPublishProduct": true,
        "reason": null
    },
    "traceId": "29e7c7cb2976bf6d"
}
```

---

## Confirm whether the product is editable

> **Official docs**: [Confirm whether the product is editable](https://open.sheincorp.com/documents/apidoc/detail/3001380)

**Method**: `POST` &nbsp; **Path**: `/goods/product/check-edit-permission`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `spuName` | string | Yes | Platform-generated unique SPU code |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `editable` | boolean | No |
| `reason` | string | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/product/check-edit-permission' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1756362653696' \
--header 'language: CN' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
    "spuName":"r24152505587"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "reason": "SPU下存在审核中的SKC，请在审核完成后再进行编辑。",
        "editable": false
    },
    "traceId": "f923e287b37a1c60"
}
```

---

## Partial product editing

> **Official docs**: [Partial product editing](https://open.sheincorp.com/documents/apidoc/detail/3001517)

**Method**: `POST` &nbsp; **Path**: `/goods/product/partialEdit`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `spu_name` | string | Yes | The unique SPU code generated by the platform。Required。 |
| `category_id` | int64 | No | Last level category id。 |
| `product_type_id` | int64 | No | Product type id。 |
| `supplier_code` | string | No | Merchant product number, down to the main specification granularity, up to 200 characters |
| `brand_code` | string | No | Brand code available for the store。 |
| `is_spu_pic` | boolean | No | Whether to use the new image scheme. true-use new scheme, false-use old scheme.If switching from false to true, all types of images at all levels required in the new scheme must be submitted. |
| `image_info` | object | No | SPU image list。Editing is only allowed when the product originally allows SPU images (i.e., the product's original is_spu_pic=true). |
| `image_group_code` | string | No | The unique code of the image group, generated by the platform。 |
| `image_info_list` | object[] | Yes | Image details |
| `image_item_id` | int64 | No | The unique code of the image, generated by the platform。 |
| `image_sort` | integer | No | Image sorting.The serial number values within the same image group cannot be repeated. The sort of type=1 images must be 1. |
| `image_type` | integer | No | Image types. 1-Main image, 2-Detail image, 5-Block image, 6-Color block image.For details on which types of images are required, quantity limits, and size requirements for each type of image, please refer to Product Image Plan. |
| `image_url` | string | No | Image link.It must be a SHEIN format URL, which can be obtained through External Link Conversion or Local Image Upload. |
| `multi_language_name_list` | object[] | No | Product name list (Supports multiple languages)This field cannot be left empty, an error will occur if the field is passed as "" during editing. |
| `language` | string | Yes | Language.If a value is passed, the default language must be provided, and the default language must be obtained through the Product Release Specification API default_language. |
| `name` | string | Yes | Product name, up to 1000 characters, emoji not supported. |
| `multi_language_desc_list` | object[] | No | Product description list (supports multiple languages) |
| `language` | string | Yes | Language.If a value is passed, the default language must be provided, and the default language must be obtained through the Product Release Specification API default_language. |
| `name` | string | Yes | Multilingual description, up to 5000 characters, emojis are not supported. |
| `product_attribute_list` | object[] | No | Product attribute list. If you want to update product attribute information, you need to submit the complete attribute list.This list can only include attribute_type=3/4 attributes. For attribute usage instructions, please refer to the Product Att... |
| `attribute_id` | int64 | Yes | Attribute ID。Only attributes with attribute_type=3/4 can be entered in product attributes。There are 2 types of required product attributes: First, attributes with attribute_status=3, confirmed through store available attributes; second, associated... |
| `attribute_value_id` | int64 | No | Attribute value ID. When the input method of the attribute is attribute_mode=1/3/4, the parameter needs to be passed here.When attribute_mode=3 (dropdown single selection), it means that there can only be one attribute value ID under the attribute... |
| `attribute_extra_value` | string | No | Attribute value (manual input type)。When the input method of the attribute attribute_mode=0/4, it needs to be entered here。Positive integers and text input are supportedWhen attribute_type=3 and attribute_mode=4 (dropdown multi-select + manual inp... |
| `size_attribute_list` | object[] | No | Size attribute (size chart)。Note: If the product already has a size chart, and the attribute values of the SKUs under the product increase during partial editing, new size chart data must be submitted simultaneously. For example, if the SKU was or... |
| `attribute_id` | int64 | Yes | Attribute ID。This field can only be entered for attributes with attribute_type=2。 |
| `attribute_value_id` | int64 | No | Attribute value ID.Size attributes do not need to pass this value, it needs to be given in attribute_extra_value. |
| `attribute_extra_value` | string | No | Attribute value (manual input type).When the input method of the attribute is attribute_mode=0/4, the parameter needs to be passed here. Only positive integers are supported. |
| `relate_sale_attribute_id` | int64 | No | Associated sales attribute ID.Size attributes can be associated with sales attributes to form a size chart. Note: Only SKU dimension attributes can be associated. For example, size: size attribute: length, sales attribute: size-S, the combination ... |
| `relate_sale_attribute_value_id` | int64 | No | Associated sales attribute value ID.Note: Can only be associated with sku dimension attributes. |
| `relate_sale_attribute_value` | string | No | Associated custom attribute values. When the attribute value of the SKU is a custom attribute value, pass the parameter here, and the content needs to be consistent with the SKU attribute value. If the value form is used in the SKU attribute value... |
| `sale_attribute_sort_list` | object[] | No | Sales attribute sorting.Note: If the product originally has a custom sorting, when adding SKC or SKU during partial editing, the complete sorting value needs to be submitted at the same time. |
| `attribute_id` | int64 | Yes | Property Name ID |
| `in_order_attribute_value_id_list` | int64[] | No | Attribute value ID sorting list。The list is arranged in the desired order to ensure that the order on the product detail page is consistent with the order of attribute values in the input parameters。 |
| `in_order_attribute_value_list` | object[] | No | Sorted attribute value ID/custom attribute value remark list. If there are custom attribute values under the attribute, this field is required. Enter the corresponding field below according to the form of the attribute value, and input in order.Fo... |
| `attribute_value_id` | int64 | No | Attribute value ID |
| `custom_attribute_value` | string | No | The content of the custom attribute value. The input parameter content must be exactly the same as the attribute value filled in the sales attributes. |
| `skc_list` | object[] | No | SKC information list.A maximum of 40 SKCs under one SPU. |
| `skc_name` | string | No | SKC unique code, generated by the platform.Required when editing SKC. |
| `sale_attribute` | object | No | SKC sales attribute。This field can only be used for attributes with attribute_type=1 and attribute_label=1。Mandatory sales attributes exist, attribute_status=3 is a mandatory attribute, confirmed through Available store attributes。 |
| `attribute_id` | int64 | No | Sales Attribute ID |
| `attribute_value_id` | int64 | No | Sales attribute value ID |
| `custom_attribute_value` | string | No | 自定义属性值。使用方式详见文档。仅在销售属性ID支持自定义属性值时，才可在此字段内入参，可通过/open-api/goods/get-custom-attribute-permission-config确认。属性值要求：字符数50以内；支持半角符号，不可输入全角符号；不支持unicode，检验表达式可参考：String emojiPattern = "[\\uD83C-\\uDBFF\\uDC00-\\uDFFF\\u2600-\\u27ff]" |
| `language` | string | No | Language of custom attribute values.Supported languages: en, zh-cn, fr, es, it. If ERP does not pass multilingual content, the platform will perform system translation. |
| `skc_title` | string | No | SKC dimension product title。Mandatory for some merchants, confirmed through Product release specification API, "field_key":"skc_title","required":"true" is mandatory, "show":"false" cannot be passed。Provide the title in the default language。Not pa... |
| `supplier_code` | string | No | Merchant-side SKC dimension item number, up to 200 characters |
| `image_info` | object | No | SKC image list |
| `image_group_code` | string | No | The unique code of the image group, generated by the platform。 |
| `image_info_list` | object[] | Yes | Image details |
| `image_item_id` | int64 | No | The unique code of the image, generated by the platform。 |
| `image_sort` | integer | Yes | Image sorting.The serial number values within the same image group cannot be repeated. The sort of type=1 images must be 1. |
| `image_type` | integer | Yes | Image types. 1-Main image, 2-Detail image, 5-Block image, 6-Color block image.For details on which types of images are required, quantity limits, and size requirements for each type of image, please refer to Product Image Plan. |
| `image_url` | string | Yes | Image link.It must be a SHEIN format URL, which can be obtained through External Link Conversion or Local Image Upload. |
| `site_detail_image_info_list` | object[] | No | SKC site detail image list。All images passed in are type=7. |
| `image_group_code` | string | No | The unique code of the image group, generated by the platform。Required when editing and can be obtained through /open-api/goods/spu-info. |
| `image_info_list` | object[] | Yes | Image details |
| `image_item_id` | int64 | No | The unique code of the image, generated by the platform。 |
| `image_sort` | integer | Yes | Image sorting.Sequence values in the same image group cannot be repeated. |
| `image_url` | string | Yes | Image link.It must be a SHEIN format URL, which can be obtained through External Link Conversion or Local Image Upload. |
| `site_abbr_list` | string[] | Yes | Site list |
| `suggested_retail_price` | object | No | Suggested retail price。Not all merchants can use it, whether the value can be passed needs to be confirmed through the Product Release Specification API, "field_key":"suggest_price","required":"true" must be filled in, "show":"false" cannot be pas... |
| `currency` | string | Yes | Currency abbreviation。The currencies available to merchants are the 【currency】 in the Product Release Specification。（Currently, JPY is not supported, USD can be used temporarily） |
| `price` | double | Yes | Price.Up to 2 decimal places (Japanese yen does not support decimals). |
| `shelf_require` | string | No | Whether mandatory delivery to SHEIN warehouse is required。0: No, 1: Yes。Mandatory in full management mode, whether mandatory in other modes must be verified through the Product Release Specification Interface, "field_key":"shelf_require","required... |
| `shelf_way` | integer | No | Listing method. 1-Automatic listing; 2-Scheduled listing.Mandatory for fully managed and semi-managed merchants. |
| `hope_on_sale_date` | datetime | No | Expected listing time.When shelf_way=2-Scheduled listing, hope_on_sale_date is required, otherwise it is not filled; Time is given to hours, minutes, and seconds, values are given in Beijing time, e.g.:2022-03-21 00:00:00. |
| `proof_of_stock_list` | object[] | No | Stock proof。Mandatory for some merchants, must be verified through the Product Release Specification Interface, "field_key":"proof_of_stock","required":"true" is mandatory, "show":"false" cannot be transmittedSupports image, PDF format files, size... |
| `file_name` | string | Yes | File name |
| `type` | integer | Yes | File type.1: Image; 2: PDF |
| `url` | string | Yes | File link. |
| `sku_list` | object[] | No | SKU list。 |
| `sku_code` | string | No | SKU unique code, generated by the platform.Required when editing SKU. |
| `sale_attribute_list` | object[] | No | SKU销售属性列表。只能入参attribute_type=1 且 attribute_label=0/1的属性。attribute_status=3为必填属性，需通过店铺可用属性确认；SKC下无SKU时，销售属性给空；若有SKU，最多有2个属性，且不同SKC下SKU属性数量需相同。新增SKU时必传，编辑场景不可修改。 |
| `attribute_id` | int64 | Yes | Sales Attribute ID |
| `attribute_value_id` | int64 | No | Sales attribute value ID |
| `custom_attribute_value` | string | No | 自定义属性值。使用方式详见文档。仅在销售属性ID支持自定义属性值时，才可在此字段内入参，可通过/open-api/goods/get-custom-attribute-permission-config确认。属性值要求：字符数50以内；支持半角符号，不可输入全角符号；不支持unicode，检验表达式可参考：String emojiPattern = "[\\uD83C-\\uDBFF\\uDC00-\\uDFFF\\u2600-\\u27ff]" |
| `language` | string | No | Language of custom attribute values.Supported languages: en, zh-cn, fr, es, it. If ERP does not pass multilingual content, the platform will perform system translation. |
| `supplier_sku` | string | No | Merchant-maintained SKU code。supplier_sku must be unique within the store and cannot be repeated。1 supplier_sku corresponds to only 1 platform SKU, up to 200 characters。You can confirm whether the entered value already exists in the store through ... |
| `length` | string | No | Including packaging dimensions: length (cm)。Supports input of positive numbers, up to 2 decimal places。 |
| `width` | string | No | Package dimensions: Width (cm)。Supports positive numbers, up to 2 decimal places。 |
| `height` | string | No | Package dimensions: Height (cm)。Supports positive numbers, up to 2 decimal places。 |
| `weight` | integer | No | Including packaging weight: weight (g)。Supports input of positive integers, 0 cannot be entered |
| `mall_state` | integer | No | SKU mall sales status。1. On sale; 2. Off sale; Note: If the SKU is set to off sale, the inventory quantity of the SKU will not be saved, and the inventory quantity will be displayed as empty in the merchant backend |
| `stop_purchase` | integer | No | Procurement status (only available for fully managed).1: Available for procurement, 2: Procurement stopped |
| `quantity_info` | object | No | SKU dimension quantity informationIf the product already has SKU dimension quantity, when adding SKC or SKU in partial editing, all new SKUs need to provide quantity。 |
| `quantity` | integer | Yes | Quantity value。The quantity information of approved SKUs cannot be modified。 |
| `quantity_type` | integer | Yes | Quantity type. 1-Single piece 2-Multiple pieces of the same item.The quantity information of approved SKUs cannot be modified. |
| `quantity_unit` | integer | Yes | Unit of quantity. 1-Piece 2-PairAll SKUs under the same SKC must maintain the same unit of quantity. The quantity information of approved SKUs cannot be modified. |
| `package_type` | integer | No | SKU dimension packaging type. Enumeration values: 0: Clear packaging 1: Soft packaging + soft items, 2: Soft packaging + hard items, 3: Hard packaging, 4: Vacuum.If the product already has SKU dimension packaging type, when adding SKC or SKU durin... |
| `supplier_barcode` | object | No | Merchant barcode。Only available for some merchants, needs to be confirmed through the interface：/open-api/goods/query-publish-fill-in-standard，supplier_barcode's show=true in the response indicates it can be filled。 |
| `barcode` | string | Yes | Product barcode。Regardless of the barcode type, only numbers are supported, up to 32 digits。Under the same SKC, barcodes in SKU cannot be repeated。 |
| `barcode_type` | string | Yes | Barcode type. Enumerated values: EAN, UPC |
| `image_info` | object | No | SKU image list。If the product originally has SKU images, when adding SKC or SKU during partial editing, all new SKUs must provide SKU images |
| `image_group_code` | string | No | The unique code of the image group, generated by the platform。Required when editing and can be obtained through /open-api/goods/spu-info. |
| `image_info_list` | object[] | Yes | Image details |
| `image_item_id` | int64 | No | The unique code of the image, generated by the platform。If providing a new image, it can be left blank; if providing an old image, it needs to be filled in and can be obtained through /open-api/goods/spu-info. |
| `image_sort` | integer | No | Image sorting.The serial number values within the same image group cannot be repeated. The sort of type=1 images must be 1. |
| `image_type` | integer | No | Image type.SKU images can only be type=1 images. |
| `image_url` | string | No | Image link.It must be a SHEIN format URL, which can be obtained through External Link Conversion or Local Image Upload. |
| `price_info_list` | object[] | No | Price information (for self-operation and POP use only)Mandatory when adding SKC/SKU, not allowed when editing。To update the price of published SKUs, adjust through 【Update product price】。Price is provided based on the dimension of the listing site。 |
| `base_price` | double | Yes | Original price。Only numbers are supported, up to 2 decimal places (Japanese yen does not support decimals)。The original price must be greater than the special price。 |
| `currency` | string | Yes | Currency abbreviation.Currency is bound to the site, for example, the US site currency is given as USD. The currency of each site can be obtained through Query Site Currency. |
| `special_price` | double | No | Special price.Only numbers are supported, up to 2 decimal places (Japanese Yen does not support decimals). The special price must be lower than the original price. |
| `sub_site` | string | Yes | Site (sub-site).The range of sites where the store can be listed can be obtained through Query Site Currency. Use site_status=1 (enabled) site_abbr here. |
| `cost_info` | object | No | SKU supply priceApplicable application modes: semi-managed, fully managed. Mandatory when adding SKCSKU, not allowed during editing. If you need to update the SKU supply price that has been approved, you need to call the 【Update Supply Price】API t... |
| `cost_price` | string | Yes | Supply price. Up to 2 decimal places. Numbers must be between 0-100000. Negative numbers cannot be entered. |
| `currency` | string | Yes | Currency abbreviation。The currencies available to merchants are the 【currency】 in the Product Release Specification |
| `stock_info_list` | object[] | No | Inventory informationMandatory when adding SKC/SKU, not allowed in editing scenarios. To update inventory, use Modify Inventory (Self-operated & Semi-managed), Purchaser Inventory Update (Fully Managed) to process. |
| `inventory_num` | integer | Yes | Total product inventory。Can be 0， |
| `supplier_warehouse_id` | int64 | No | Merchant warehouse ID 。If the store has multiple warehouses, this field is required，can be obtained through the 【Merchant Warehouse List Query】API |
| `supplier_warehouse_name` | string | No | Merchant warehouse name。Can be obtained through the 【Merchant Warehouse List Query】API。 |
| `competing_product_link` | string | No | 商品信息参考链接。部分商家必填，通过商品发布规范接口确认，"field_key":"reference_product_link","required":"true"时必填，"show":"false"时不可传。链接字符长度不超过300。编辑时不穿字段代表清空数据。 |
| `minimum_stock_quantity` | integer | No | Minimum stock quantity。Only integers are supported, range: [1，1000000] 。Whether the value can be passed needs to be confirmed through the Product Release Specification API, "field_key":"minimum_stock_quantity","required":"true" must be filled in, ... |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `extra` | object | No |
| `mcc_valid_result` | object[] | No |
| `message` | string | No |
| `type` | integer | No |
| `pre_valid_result` | object[] | No |
| `form` | string | No |
| `form_name` | string | No |
| `messages` | string[] | No |
| `module` | string | No |
| `other_language_message_map` | object | No |
| `*` | string[] | No |
| `skc_error_message_map` | object | No |
| `*` | object | No |
| `skc_list` | object[] | No |
| `skc_name` | string | No |
| `sku_list` | object[] | No |
| `sku_code` | string | No |
| `supplier_sku` | string | No |
| `spu_name` | string | No |
| `success` | boolean | No |
| `version` | string | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'http://openapi-test01.sheincorp.cn/open-api/goods/product/partialEdit' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1766713566501' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--header 'Host: openapi-test01.sheincorp.cn' \
--header 'Connection: keep-alive' \
--data-raw '{
  "spu_name": "c2512231945875937",
  "skc_list": [
    {
      "sale_attribute": {
        "attribute_id": 2147484187,
        "custom_attribute_value":"new bennie custom attribute 1224 for skc"
      },
      "shelf_way": 1,
      "supplier_code":"newskc",
      "image_info": {
        "image_info_list": [
          {
            "image_sort": 1,
            "image_type": 1,
            "image_url": "https://imgdeal-test01.shein.com/images3_pi/2024/12/10/27/17338148602250996226.jpeg"
          },
          {
            "image_sort": 4,
            "image_type": 6,
            "image_url": "https://imgdeal-test01.shein.com/images3_pi/2024/12/10/27/17338148602250996226.jpeg"
          }
        ]
      },
      "site_detail_image_info_list": [
        {
          "image_info_list": [
            {
              "image_sort": 1,
              "image_url": "https://imgdeal-test01.shein.com/images3_pi/2024/12/10/27/17338148602250996226.jpeg"
            }
          ],
          "site_abbr_list": [
            "shein-us"
          ]
        }
      ],
      "proof_of_stock_list": [
        {
          "file_name": "fd",
          "type": "1",
          "url": "https://imgdeal-test01.shein.com/images3_pi/2024/12/10/27/17338148602250996226.jpeg"
        }
      ],
      "sku_list": [
        {
          "sale_attribute_list": [
            {
              "attribute_id": 2147484186,
              "attribute_value_id":2147488283,
              "language":"en"
            }
          ],
          "price_info_list": [
            {
              "base_price": 334,
              "currency": "USD",
              "special_price": 35,
              "sub_site": "shein-us"
            }
          ],
          "stock_info_list": [
            {
              "supplier_warehouse_id":"PS8399728690",
              "inventory_num": 1
            }
          ],
          "supplier_sku": "3663024554556-6403",
          "mall_state": 1,
          "height": "1",
          "length": "1",
          "weight": "1",
          "width": "1"
        },
        {
          "sale_attribute_list": [
            {
              "attribute_id": 2147484186,
              "attribute_value_id":2147493697,
              "language":"en"
            }
          ],
          "price_info_list": [
            {
              "base_price": 334,
              "currency": "USD",
              "special_price": 35,
              "sub_site": "shein-us"
            }
          ],
          "stock_info_list": [
            {
              "supplier_warehouse_id":"PS8399728690",
              "inventory_num": 1
            }
          ],
          "supplier_sku": "36630056-6403",
          "mall_state": 1,
          "height": "1",
          "length": "1",
          "weight": "1",
          "width": "1"
        }
      ]
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
        "success": true,
        "spu_name": "c2512231945875937",
        "skc_list": [
            {
                "skc_name": "sc251223194587593767372",
                "sku_list": [
                    {
                        "sku_code": "I4mjm7n4ypw0dl",
                        "supplier_sku": "3663024554556-6403"
                    },
                    {
                        "sku_code": "I8mjm7n4yrjafi",
                        "supplier_sku": "36630056-6403"
                    }
                ]
            }
        ],
        "version": "SPMP251226144044259",
        "pre_valid_result": null,
        "mcc_valid_result": null,
        "burying_point_result": [],
        "extra": {},
        "filtered_result": null
    },
    "bbl": null,
    "traceId": "842bcf487b244a5f"
}
```

---

## Check product audit status

> **Official docs**: [Check product audit status](https://open.sheincorp.com/documents/apidoc/detail/3001368)

**Method**: `POST` &nbsp; **Path**: `/goods/query-document-state`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `spuList` | object[] | Yes | SPU list, up to 10 SPU per transmission |
| `spuName` | string | Yes | spuName, spuName are system codes generated by SHEIN |
| `version` | string | No | Review version number. When the product is published or an edit is submitted, the response will include version. |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `data` | object[] | No |
| `skcList` | object[] | No |
| `documentSn` | string | No |
| `documentState` | integer | No |
| `failedReason` | object[] | No |
| `content` | string | No |
| `language` | string | No |
| `skcName` | string | No |
| `spuName` | string | No |
| `version` | string | No |
| `meta` | object | No |
| `count` | integer | No |
| `customObj` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/query-document-state' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752724239028' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "spuList": [
        {
            "spuName": "MM2404076986",
            "version": "SPMP240407262081729"
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
        "data": [
            {
                "spuName": "MM2404076986",
                "version": "SPMP240407262081729",
                "skcList": [
                    {
                        "skcName": "sMM24040769866671",
                        "documentSn": "SPMPA320240407000135",
                        "documentState": 3,
                        "failedReason": [
                            {
                                "language": "zh-cn",
                                "content": "禁忌:frankie test12;1111111"
                            },
                            {
                                "language": "zh-cn",
                                "content": "上新管控:测试上新管控驳回·1;1111111"
                            }
                        ]
                    }
                ]
            }
        ],
        "meta": {
            "count": 1,
            "customObj": null
        }
    },
    "bbl": null
}
```

---

## Product list API

> **Official docs**: [Product list API](https://open.sheincorp.com/documents/apidoc/detail/3001239)

**Method**: `POST` &nbsp; **Path**: `/openapi-business-backend/product/query`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pageNum` | integer | No | Page number, default: 1 |
| `pageSize` | integer | No | page size, default: 50 |
| `insertTimeEnd` | string | No | End time of the product listing (when the product is first approved) Example: 2024-11-15 19:00:00 |
| `insertTimeStart` | string | No | Start time of the product listing (when the product is first approved) Example: 2024-11-15 20:00:00 |
| `updateTimeEnd` | string | No | End time of the product update (Update range includes not only product information changes but also internal system update time). Example: 2024-11-15 19:00:00 |
| `updateTimeStart` | string | No | Start time of the product update (Update range includes not only product information changes but also internal system update time). Example: 2024-11-15 19:00:00 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `info` | object | No |
| `data` | object[] | No |
| `skcName` | string | No |
| `skuCodeList` | string[] | No |
| `spuName` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/openapi-business-backend/product/query' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752724525405' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "pageNum": 1, "pageSize": 50
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
                "skcName": "sM22040955900525",
                "skuCodeList": [
                    "I065lggbkwpe",
                    "I065lggbejle",
                    "I065lggb9yr6",
                    "I065lggbivg3",
                    "I065lggbg9pt",
                    "I065lggbclpa",
                    "I065lggb4uy5"
                ],
                "spuName": "M2204095590"
            },
            {
                "skcName": "sM22120115814401",
                "skuCodeList": [
                    "I9bqt81qmsv0"
                ],
                "spuName": "M2212011581"
            }
        ]
    }
}
```

---

## Query product detail by spu（new）

> **Official docs**: [Query product detail by spu（new）](https://open.sheincorp.com/documents/apidoc/detail/3001548)

**Method**: `POST` &nbsp; **Path**: `/goods/spu-info`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `languageList` | string[] | Yes | Language list. Refers to which language information will be returned for product name, product description, and attribute name. It is recommended to input the merchant's default language to ensure valid data can be obtained. The default language c... |
| `spuName` | string | Yes | Platform-generated unique code。It will be returned when the product is published or can be obtained through the Product List interface。 Only SPUs that are published and approved by the platform can have information queried。 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `code` | string | Yes |
| `info` | object | No |
| `brandCode` | string | No |
| `categoryId` | int64 | No |
| `ipCharacterList` | object[] | No |
| `ipCharacterId` | int64 | No |
| `ipCharacterName` | string | No |
| `ipCharacterNameCn` | string | No |
| `dimensionAttributeInfoList` | object[] | No |
| `attributeId` | int64 | No |
| `attributeMultiList` | object[] | No |
| `attributeName` | string | No |
| `language` | string | No |
| `dimensionAttributeAdditionList` | object[] | No |
| `additionValue` | string | No |
| `relateSaleAttributeId` | int64 | No |
| `relateSaleAttributeValueId` | int64 | No |
| `productAttributeInfoList` | object[] | No |
| `attributeId` | int64 | No |
| `attributeMultiList` | object[] | No |
| `attributeName` | string | No |
| `language` | string | No |
| `attributeValue` | string | No |
| `attributeValueId` | int64 | No |
| `attributeValueMultiList` | object[] | No |
| `attributeValueName` | string | No |
| `language` | string | No |
| `productMultiDescList` | object[] | No |
| `language` | string | No |
| `productDesc` | string | No |
| `productMultiNameList` | object[] | No |
| `language` | string | No |
| `productName` | string | No |
| `productTypeId` | int64 | No |
| `skcInfoList` | object[] | No |
| `attributeId` | int64 | No |
| `attributeMultiList` | object[] | No |
| `attributeName` | string | No |
| `language` | string | No |
| `attributeValueId` | int64 | No |
| `attributeValueMultiList` | object[] | No |
| `attributeValueName` | string | No |
| `language` | string | No |
| `productMultiNameList` | object[] | No |
| `language` | string | No |
| `productName` | string | No |
| `proofOfStockInfoList` | object[] | No |
| `fileName` | string | No |
| `type` | integer | No |
| `url` | string | No |
| `shelfStatusInfoList` | object[] | No |
| `firstShelfTime` | datetime | No |
| `lastShelfTime` | datetime | No |
| `lastUpdateTime` | datetime | No |
| `shelfStatus` | integer | No |
| `siteAbbr` | string | No |
| `recycleInfoList` | object[] | No |
| `recycleStatus` | integer | No |
| `subSite` | string | No |
| `siteDetailImageInfoList` | object[] | No |
| `imageGroupCode` | string | No |
| `imageInfoList` | object[] | No |
| `imageItemId` | int64 | No |
| `imageSort` | integer | No |
| `imageUrl` | string | No |
| `siteInfoList` | object[] | No |
| `channel` | string | No |
| `mainSite` | string | No |
| `site` | string | No |
| `sampleInfo` | object | No |
| `reserveSampleFlag` | integer | No |
| `sampleJudgeType` | integer | No |
| `sampleCode` | string | No |
| `spotFlag` | integer | No |
| `skcImageInfoList` | object[] | No |
| `groupCode` | string | No |
| `imageItemId` | int64 | No |
| `imageMediumUrl` | string | No |
| `imageSmallUrl` | string | No |
| `imageType` | string | No |
| `imageUrl` | string | No |
| `sort` | integer | No |
| `skcName` | string | No |
| `skuInfoList` | object[] | No |
| `height` | string | No |
| `length` | string | No |
| `mallState` | integer | No |
| `stopPurchase` | integer | No |
| `saleAttributeList` | object[] | No |
| `attributeId` | int64 | No |
| `attributeValueId` | int64 | No |
| `attributeValueMultiList` | object[] | No |
| `attributeValueName` | string | No |
| `language` | string | No |
| `priceInfoList` | object[] | No |
| `basePrice` | double | No |
| `currency` | string | No |
| `site` | string | No |
| `specialPrice` | double | No |
| `skuCode` | string | No |
| `skuImageInfoList` | object | No |
| `groupCode` | string | No |
| `imageItemId` | int64 | No |
| `imageMediumUrl` | string | No |
| `imageSmallUrl` | string | No |
| `imageType` | string | No |
| `imageUrl` | string | No |
| `sort` | integer | No |
| `costInfoList` | object[] | No |
| `costPrice` | double | No |
| `currency` | string | No |
| `skuSupplierInfo` | object | No |
| `supplierBarcodeEnabled` | boolean | No |
| `supplierBarcodeList` | object[] | No |
| `barcode_list` | string[] | No |
| `barcode_type` | string | No |
| `supplierSku` | string | No |
| `weight` | integer | No |
| `width` | string | No |
| `quantityType` | integer | No |
| `quantityUnit` | integer | No |
| `quantity` | integer | No |
| `packageType` | integer | No |
| `srpPriceInfo` | object | No |
| `currency` | string | No |
| `srpPrice` | double | No |
| `supplierCode` | string | No |
| `spuName` | string | No |
| `spuImageInfoList` | object | No |
| `groupCode` | string | No |
| `imageItemId` | int64 | No |
| `imageMediumUrl` | string | No |
| `imageSmallUrl` | string | No |
| `imageType` | string | No |
| `imageUrl` | string | No |
| `sort` | string | No |
| `supplierCode` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/spu-info' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752732946244' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "languageList": [
        "zh-cn"],
    "spuName": "MM2404163183"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "spuName": "MM2404163183",
        "categoryId": 1980,
        "productTypeId": 71,
        "brandCode": "",
        "supplierCode": "openapimx",
        "productMultiNameList": [
            {
                "productName": "Produto De Teste Openapi Mx custom valuesdsd",
                "language": "zh-cn"
            }
        ],
        "productMultiDescList": [
            {
                "productDesc": "",
                "language": "zh-cn"
            }
        ],
        "productAttributeInfoList": [
            {
                "attributeId": 40,
                "attributeMultiList": [
                    {
                        "attributeName": "适合类型",
                        "language": "zh-cn"
                    }
                ],
                "attributeValueId": 132,
                "attributeValueMultiList": [
                    {
                        "attributeValueName": "男朋友",
                        "language": "zh-cn"
                    }
                ],
                "attributeValue": null
            },
            {
                "attributeId": 39,
                "attributeMultiList": [
                    {
                        "attributeName": "面料弹性-id39",
                        "language": "zh-cn"
                    }
                ],
                "attributeValueId": 279,
                "attributeValueMultiList": [
                    {
                        "attributeValueName": "面料无弹性.",
                        "language": "zh-cn"
                    }
                ],
                "attributeValue": null
            },
            {
                "attributeId": 54,
                "attributeMultiList": [
                    {
                        "attributeName": "长度（54）",
                        "language": "zh-cn"
                    }
                ],
                "attributeValueId": 408,
                "attributeValueMultiList": [
                    {
                        "attributeValueName": "长款",
                        "language": "zh-cn"
                    }
                ],
                "attributeValue": null
            },
            {
                "attributeId": 90,
                "attributeMultiList": [
                    {
                        "attributeName": "袖长id90",
                        "language": "zh-cn"
                    }
                ],
                "attributeValueId": 409,
                "attributeValueMultiList": [
                    {
                        "attributeValueName": "长袖",
                        "language": "zh-cn"
                    }
                ],
                "attributeValue": null
            },
            {
                "attributeId": 87,
                "attributeMultiList": [
                    {
                        "attributeName": "尺寸",
                        "language": "zh-cn"
                    }
                ],
                "attributeValueId": 756,
                "attributeValueMultiList": [
                    {
                        "attributeValueName": "XXL",
                        "language": "zh-cn"
                    }
                ],
                "attributeValue": null
            },
            {
                "attributeId": 58,
                "attributeMultiList": [
                    {
                        "attributeName": "是否带里衬58",
                        "language": "zh-cn"
                    }
                ],
                "attributeValueId": 1001808,
                "attributeValueMultiList": [
                    {
                        "attributeValueName": "无内衬",
                        "language": "zh-cn"
                    }
                ],
                "attributeValue": null
            },
            {
                "attributeId": 87,
                "attributeMultiList": [
                    {
                        "attributeName": "尺寸",
                        "language": "zh-cn"
                    }
                ],
                "attributeValueId": 2147484569,
                "attributeValueMultiList": [
                    {
                        "attributeValueName": "323分",
                        "language": "zh-cn"
                    }
                ],
                "attributeValue": null
            },
            {
                "attributeId": 27,
                "attributeMultiList": [
                    {
                        "attributeName": "颜色",
                        "language": "zh-cn"
                    }
                ],
                "attributeValueId": 2147484570,
                "attributeValueMultiList": [
                    {
                        "attributeValueName": "黑色434",
                        "language": "zh-cn"
                    }
                ],
                "attributeValue": null
            }
        ],
        "dimensionAttributeInfoList": [],
        "spuImageInfoList": null,
        "skcInfoList": [
            {
                "skcName": "sMM24041631833322",
                "supplierCode": "openapimx",
                "sampleInfo": {
                    "sampleCode": "",
                    "reserveSampleFlag": 0,
                    "spotFlag": 0,
                    "sampleJudgeType": 2
                },
                "productMultiNameList": [
                    {
                        "productName": "Produto De Teste Openapi Mx custom valuesdsd",
                        "language": "zh-cn"
                    }
                ],
                "attributeId": 27,
                "attributeMultiList": [
                    {
                        "attributeName": "颜色",
                        "language": "zh-cn"
                    }
                ],
                "attributeValueId": 2147484570,
                "attributeValueMultiList": [
                    {
                        "attributeValueName": "黑色434",
                        "language": "zh-cn"
                    }
                ],
                "skuInfoList": [
                    {
                        "skuCode": "I05xh21a82o5",
                        "supplierSku": "black-XXL",
                        "length": "11.00",
                        "width": "11.00",
                        "height": "11.00",
                        "weight": 222,
                        "mallState": 1,
                        "stopPurchase": 1,
                        "saleAttributeList": [
                            {
                                "attributeId": 87,
                                "attributeValueId": 756,
                                "attributeValueMultiList": [
                                    {
                                        "attributeValueName": "XXL",
                                        "language": "zh-cn"
                                    }
                                ]
                            }
                        ],
                        "priceInfoList": [
                            {
                                "site": "shein-mx",
                                "basePrice": 23.00,
                                "specialPrice": 0.00,
                                "currency": "MXN"
                            }
                        ],
                        "costInfoList": [],
                        "skuImageInfoList": null
                    },
                    {
                        "skuCode": "I05xh21am74l",
                        "supplierSku": "black-323分",
                        "length": "11.00",
                        "width": "11.00",
                        "height": "11.00",
                        "weight": 222,
                        "mallState": 1,
                        "stopPurchase": 1,
                        "saleAttributeList": [
                            {
                                "attributeId": 87,
                                "attributeValueId": 2147484569,
                                "attributeValueMultiList": [
                                    {
                                        "attributeValueName": "323分",
                                        "language": "zh-cn"
                                    }
                                ]
                            }
                        ],
                        "priceInfoList": [
                            {
                                "site": "shein-mx",
                                "basePrice": 333.00,
                                "specialPrice": 0.00,
                                "currency": "MXN"
                            }
                        ],
                        "costInfoList": [],
                        "skuImageInfoList": null
                    }
                ],
                "shelfStatusInfoList": [
                    {
                        "siteAbbr": "shein-mx",
                        "shelfStatus": 0,
                        "lastShelfTime": "2018-08-28 00:00:00",
                        "firstShelfTime": "1970-01-01 08:00:01",
                        "lastUpdateTime": "2024-04-18 19:44:38"
                    }
                ],
                "skcImageInfoList": [
                    {
                        "groupCode": "G772lhlxbqpk",
                        "imageItemId": 2147571028,
                        "imageType": "MAIN",
                        "imageMediumUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/1b/17132456933631648684_thumbnail_405x552.jpg",
                        "imageSmallUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/1b/17132456933631648684_thumbnail_220x293.jpg",
                        "imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/1b/17132456933631648684.jpg",
                        "sort": 1
                    },
                    {
                        "groupCode": "G772lhlxbqpk",
                        "imageItemId": 2147571029,
                        "imageType": "DETAIL",
                        "imageMediumUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/54/17132456951187015405_thumbnail_405x552.jpg",
                        "imageSmallUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/54/17132456951187015405_thumbnail_220x293.jpg",
                        "imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/54/17132456951187015405.jpg",
                        "sort": 2
                    },
                    {
                        "groupCode": "G772lhlxbqpk",
                        "imageItemId": 2147571030,
                        "imageType": "SQUARE",
                        "imageMediumUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/dc/17132457012319655615_thumbnail_405x552.jpg",
                        "imageSmallUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/dc/17132457012319655615_thumbnail_220x293.jpg",
                        "imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/dc/17132457012319655615.jpg",
                        "sort": 3
                    },
                    {
                        "groupCode": "G772lhlxbqpk",
                        "imageItemId": 2147571031,
                        "imageType": "PIECE",
                        "imageMediumUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/dc/17132457012755121747_thumbnail_405x552.jpg",
                        "imageSmallUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/dc/17132457012755121747_thumbnail_220x293.jpg",
                        "imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2024/04/16/dc/17132457012755121747.jpg",
                        "sort": 4
                    }
                ],
                "siteDetailImageInfoList": null,
                "proofOfStockInfoList": [],
                "srpPriceInfo": null
            }
        ]
    },
    "bbl": null
}
```

---

## Comprehensive product query

> **Official docs**: [Comprehensive product query](https://open.sheincorp.com/documents/apidoc/detail/3001634)

**Method**: `POST` &nbsp; **Path**: `/goods/searchProduct`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pageNum` | integer | Yes | Page number, starting from 1 |
| `pageSize` | integer | Yes | Page size, maximum 10 |
| `categoryIds` | int64[] | No | Last-level category ID list, up to 10 at a time。 |
| `spuNameList` | string[] | No | SPU code list (platform code), up to 10 at a time。 |
| `skcNameList` | string[] | No | SKC code list (platform code)，up to 10 at a time。 |
| `skuCodeList` | string[] | No | SKU code list (platform code)，up to 10 at a time。 |
| `skcSupplierCodeList` | string[] | No | SKC item number list (merchant maintained item number)，up to 10 at a time。 |
| `supplierSkuList` | string[] | No | Merchant SKU list (merchant maintained SKU item number)，up to 10 at a time |
| `skcShelfStatus` | integer | No | SKC shelf status，0:Off the shelf 1:On the shelf。Pending and sold out are both considered off the shelf。 |
| `languageList` | string[] | No | Language list，determines the language content returned for product information such as name，attribute name，and attribute value name。A maximum of 5 languages can be input at a time，if not provided，English is returned by default。 |
| `createTimeStart` | string | No | SPU release time period (start time)，format yyyy-MM-dd HH:mm:ss。Release time definition: SPU first review pass time。 |
| `createTimeEnd` | string | No | SPU release time period (end time)，format yyyy-MM-dd HH:mm:ss。Release time definition: SPU first review pass time。 |
| `updateTimeEnd` | string | No | SPU update time period (end time), format yyyy-MM-dd HH:mm:ss。Update time definition: Updates caused by changes in the title, brand, IP, or attributes of any SKC under SPU. Does not include updates to price or inventory。 |
| `updateTimeStart` | string | No | SPU update time period (start time)，format yyyy-MM-dd HH:mm:ss。Update time definition: Updates caused by changes in the title, brand, IP, or attributes of any SKC under the SPU。Does not include price or inventory updates。 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | No |
| `info` | object | No |
| `meta` | object | No |
| `count` | integer | No |
| `data` | object[] | No |
| `spuName` | string | No |
| `spuShelfStatus` | integer | No |
| `categoryId` | string | No |
| `skcList` | object[] | No |
| `skcName` | string | No |
| `skcShelfStatus` | integer | No |
| `supplierCode` | string | No |
| `skcMainPicUrl` | string | No |
| `skcTitle` | object[] | No |
| `language` | string | No |
| `title` | string | No |
| `skcSalesAttribute` | object[] | No |
| `language` | string | No |
| `attributeId` | string | No |
| `attributeName` | string | No |
| `attributeValueId` | string | No |
| `attributeValueName` | string | No |
| `skcSiteShelfStatusList` | object[] | No |
| `status` | integer | No |
| `subSite` | string | No |
| `skuList` | object[] | No |
| `skuCode` | string | No |
| `supplierSku` | string | No |
| `skuSalesAttributeList` | object[] | No |
| `language` | string | No |
| `attributeId` | string | No |
| `attributeName` | string | No |
| `attributeValueId` | string | No |
| `attributeValueName` | string | No |
| `costList` | object[] | No |
| `cost` | double | No |
| `currency` | string | No |
| `priceList` | object[] | No |
| `site` | string | No |
| `currency` | string | No |
| `basePrice` | double | No |
| `specialPrice` | double | No |
| `inventoryList` | object[] | No |
| `warehouseId` | string | No |
| `inventoryNum` | integer | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/searchProduct' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1774494443833' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
  "pageSize": 3,
  "pageNum": 1,
  "skcShelfStatus": 0,
  "createTimeStart": "2026-01-01 00:00:00",
  "createTimeEnd": "2026-02-01 00:00:00"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "meta": {
            "count": 60891
        },
        "data": [
            {
                "spuName": "a2601281717698647",
                "spuShelfStatus": 0,
                "categoryId": "20039881",
                "skcList": [
                    {
                        "skcName": "sa260128171769864787801",
                        "skcTitle": [
                            {
                                "language": "en",
                                "title": "Roll To Class In Pride With This San Francisco Giants Wheeled Backpack. Two Large Compartments With Padded Computer Sleeve For 17inch Laptop Or Tablet. Large Front Zippered Organizer Pocket With Pen Loops, Slots & Key Fob. Retractable Handle. Padded, Adjustable Shoulder Straps. Kick Plate Protects Bottom. Side Mesh Pocket. 19\"H X 9\"W X 7.5\"D. 600denier Polyester. Wipe Clean. Imported. Shop Our Full Assortment Of San Francisco Giants Items Here. When Youre , Youre Family! Size One Size. Color Gray. Gender Unisex. Age Group Adult. Material OTHER MATERIAL. Skechers® ! Hands Free Slipins® Bounder Boys Shoes, Boys, #&!(!&) Sdahsd Asd Newborn & Infant Royal Kentucky Wildcats #1 Fan Foam Finger Bodysuit, Kids Unisex, Skechers® ! Hands Free Slipins® Bounder Boys Shoes, Boys Mens Columbia PFG UPF 40 Tamiami™ II Long Sleeve ButtonDown Shirt,"
                            }
                        ],
                        "skcMainPicUrl": "https://imgdeal-test01.shein.com/v4/j/pi/2026/01/21/49/17689368571ef48fdfe8bdd052d1daaa88ee0bee6c.jpg",
                        "skcSalesAttribute": [
                            {
                                "language": "en",
                                "attributeId": "2147484187",
                                "attributeName": "OPENAPI-Color",
                                "attributeValueId": "536",
                                "attributeValueName": "Purple"
                            }
                        ],
                        "supplierCode": "Testing_4567",
                        "skcShelfStatus": 0,
                        "skcSiteShelfStatusList": [
                            {
                                "subSite": "shein-mx",
                                "status": 0
                            },
                            {
                                "subSite": "shein-it",
                                "status": 0
                            },
                            {
                                "subSite": "shein-us",
                                "status": 0
                            }
                        ],
                        "skuList": [
                            {
                                "skuCode": "I7mkxtb0qh7f53",
                                "supplierSku": "Tesing_1234",
                                "skuSalesAttributeList": [
                                    {
                                        "language": "en",
                                        "attributeId": "2147484186",
                                        "attributeName": "OPENAPI-Size",
                                        "attributeValueId": "2147488283",
                                        "attributeValueName": "30*20"
                                    }
                                ],
                                "priceList": [
                                    {
                                        "site": "shein-us",
                                        "currency": "USD",
                                        "basePrice": 62.99,
                                        "specialPrice": 0.0
                                    }
                                ],
                                "costList": null,
                                "inventoryList": [
                                    {
                                        "warehouseId": "PS3417911133",
                                        "inventoryNum": 5
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "spuName": "a2601281716859981",
                "spuShelfStatus": 0,
                "categoryId": "20039881",
                "skcList": [
                    {
                        "skcName": "sa260128171685998123762",
                        "skcTitle": [
                            {
                                "language": "en",
                                "title": "Mens New Era Purple Los Angeles Lakers Side Logo 9FIFTY Snapback Hat"
                            }
                        ],
                        "skcMainPicUrl": "https://imgdeal-test01.shein.com/v4/j/pi/2026/01/21/49/17689368571ef48fdfe8bdd052d1daaa88ee0bee6c.jpg",
                        "skcSalesAttribute": [
                            {
                                "language": "en",
                                "attributeId": "2147484187",
                                "attributeName": "OPENAPI-Color",
                                "attributeValueId": "536",
                                "attributeValueName": "Purple"
                            }
                        ],
                        "supplierCode": "Testing_456",
                        "skcShelfStatus": 0,
                        "skcSiteShelfStatusList": [
                            {
                                "subSite": "shein-mx",
                                "status": 0
                            },
                            {
                                "subSite": "shein-it",
                                "status": 0
                            },
                            {
                                "subSite": "shein-us",
                                "status": 0
                            }
                        ],
                        "skuList": [
                            {
                                "skuCode": "I0mkxt98pe995u",
                                "supplierSku": "Tesing_123",
                                "skuSalesAttributeList": [
                                    {
                                        "language": "en",
                                        "attributeId": "2147484186",
                                        "attributeName": "OPENAPI-Size",
                                        "attributeValueId": "2147488283",
                                        "attributeValueName": "30*20"
                                    }
                                ],
                                "priceList": [
                                    {
                                        "site": "shein-us",
                                        "currency": "USD",
                                        "basePrice": 62.99,
                                        "specialPrice": 0.0
                                    }
                                ],
                                "costList": null,
                                "inventoryList": [
                                    {
                                        "warehouseId": "PS3417911133",
                                        "inventoryNum": 5
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "spuName": "a2601271703231232",
                "spuShelfStatus": 0,
                "categoryId": "20040046",
                "skcList": [
                    {
                        "skcName": "sa260127170323123298625",
                        "skcTitle": [
                            {
                                "language": "en",
                                "title": "1L * 2 Bottles Of Large-Capacity Children's Milk Shampoo, Body Wash, Gentle Two-In-One Baby Wash, Newborn Care"
                            }
                        ],
                        "skcMainPicUrl": "https://imgdeal-test01.shein.com/v4/j/pi/2026/01/27/c9/17695046002cc8b0bce31365a408b64eef8555bc97.jpg",
                        "skcSalesAttribute": [
                            {
                                "language": "en",
                                "attributeId": "2147484187",
                                "attributeName": "OPENAPI-Color",
                                "attributeValueId": "2147488295",
                                "attributeValueName": "Navy"
                            }
                        ],
                        "supplierCode": "122",
                        "skcShelfStatus": 0,
                        "skcSiteShelfStatusList": [
                            {
                                "subSite": "shein-mx",
                                "status": 0
                            },
                            {
                                "subSite": "shein-it",
                                "status": 0
                            },
                            {
                                "subSite": "shein-us",
                                "status": 0
                            }
                        ],
                        "skuList": [
                            {
                                "skuCode": "I1mkwdcx1rdcym",
                                "supplierSku": "",
                                "skuSalesAttributeList": [
                                    {
                                        "language": "en",
                                        "attributeId": "2147484186",
                                        "attributeName": "OPENAPI-Size",
                                        "attributeValueId": "2147488283",
                                        "attributeValueName": "30*20"
                                    }
                                ],
                                "priceList": [
                                    {
                                        "site": "shein-us",
                                        "currency": "USD",
                                        "basePrice": 600.0,
                                        "specialPrice": 500.0
                                    }
                                ],
                                "costList": null,
                                "inventoryList": [
                                    {
                                        "warehouseId": "PS3417911133",
                                        "inventoryNum": 99
                                    }
                                ]
                            },
                            {
                                "skuCode": "I0mkwdcx1tj32k",
                                "supplierSku": "",
                                "skuSalesAttributeList": [
                                    {
                                        "language": "en",
                                        "attributeId": "2147484186",
                                        "attributeName": "OPENAPI-Size",
                                        "attributeValueId": "19884748",
                                        "attributeValueName": "70*50*30cm"
                                    }
                                ],
                                "priceList": [
                                    {
                                        "site": "shein-us",
                                        "currency": "USD",
                                        "basePrice": 600.0,
                                        "specialPrice": 500.0
                                    }
                                ],
                                "costList": null,
                                "inventoryList": [
                                    {
                                        "warehouseId": "PS3417911133",
                                        "inventoryNum": 99
                                    }
                                ]
                            },
                            {
                                "skuCode": "I3mkwdcx1sft80",
                                "supplierSku": "",
                                "skuSalesAttributeList": [
                                    {
                                        "language": "en",
                                        "attributeId": "2147484186",
                                        "attributeName": "OPENAPI-Size",
                                        "attributeValueId": "2147488282",
                                        "attributeValueName": "27*20"
                                    }
                                ],
                                "priceList": [
                                    {
                                        "site": "shein-us",
                                        "currency": "USD",
                                        "basePrice": 600.0,
                                        "specialPrice": 500.0
                                    }
                                ],
                                "costList": null,
                                "inventoryList": [
                                    {
                                        "warehouseId": "PS3417911133",
                                        "inventoryNum": 99
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "traceId": "61256b62aa6bb5ed"
}
```

---

## sku item details query (to be deprecated soon)

> **Official docs**: [sku item details query (to be deprecated soon)](https://open.sheincorp.com/documents/apidoc/detail/3001085)

**Method**: `POST` &nbsp; **Path**: `/openapi-business-backend/product/full-detail`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skuCodes` | string[] | Yes | skucode, supports up to 100, skucode is the system code generated by SHEIN |
| `language` | string | No | Language, Default Chinese: zh-cnSupported Languages: English:en French:fr Spanish:es German:de Chinese:zh-cn Thai:th Brazilian Portuguese:pt-br |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `info` | object[] | No |
| `skuCode` | string | Yes |
| `spuName` | string | No |
| `skcName` | string | No |
| `productName` | object | No |
| `productName` | string | No |
| `language` | string | No |
| `productDesc` | object | No |
| `productDesc` | string | No |
| `language` | string | No |
| `productNumber` | string | No |
| `sellerSku` | string | No |
| `goodsInventory` | object | No |
| `inventoryQuantity` | integer | No |
| `lockedQuantity` | integer | No |
| `usableInventory` | integer | No |
| `tempLockQuantity` | integer | No |
| `warehouseInventoryList` | object[] | No |
| `warehouseCode` | string | No |
| `warehouseType` | string | No |
| `inventoryQuantity` | integer | No |
| `lockedQuantity` | integer | No |
| `usableInventory` | integer | No |
| `tempLockQuantity` | integer | No |
| `skuCode` | string | No |
| `attributeLists` | object[] | No |
| `attributeId` | long | No |
| `attributeValueMulti` | object | No |
| `attributeAdditionList` | object[] | No |
| `additionAttrValueMulti` | object | No |
| `additionValue` | string | No |
| `additionAttrValueId` | string | No |
| `additionAttrMulti` | object | No |
| `additionAttrId` | string | No |
| `attributeValueId` | string | No |
| `attributeMulti` | object | No |
| `language` | string | No |
| `attributeMulti` | string | No |
| `attributeType` | string | No |
| `skuAttributeLists` | object[] | No |
| `attributeValueMulti` | object | No |
| `attributeValueMulti` | string | No |
| `language` | string | No |
| `attributeValueId` | string | No |
| `attributeMulti` | object | No |
| `attributeMulti` | string | No |
| `language` | string | No |
| `attributeId` | string | No |
| `saleAttribute` | object | No |
| `attributeValueMulti` | object | No |
| `language` | string | No |
| `attributeValueMulti` | string | No |
| `attributeId` | string | No |
| `attributeMulti` | object | No |
| `language` | string | No |
| `attributeMulti` | string | No |
| `attributeValueId` | string | No |
| `currentPrices` | object[] | No |
| `shopPrice` | double | No |
| `specialPrice` | double | No |
| `site` | string | No |
| `specialPriceStart` | datetime | No |
| `specialPriceEnd` | datetime | No |
| `salePrice` | double | No |
| `terminal` | string | No |
| `currency` | string | No |
| `suggestedRetailPrice` | object | No |
| `srpPrice` | string | No |
| `currency` | string | No |
| `multiCurrencyCostList` | object[] | No |
| `cost` | string | No |
| `currency` | string | No |
| `categoryName` | string | No |
| `categoryId` | string | No |
| `imageList` | object[] | No |
| `imageType` | string | No |
| `sort` | integer | No |
| `imageMediumUrl` | string | No |
| `imageSmallUrl` | string | No |
| `imageUrl` | string | No |
| `imageItemId` | long | No |
| `groupCode` | string | No |
| `skuDimensionsInfo` | object | No |
| `length` | string | No |
| `width` | string | No |
| `height` | string | No |
| `weight` | string | No |
| `shelfDetails` | object[] | No |
| `isOnShelf` | boolean | No |
| `lastUpdateTime` | string | No |
| `site` | string | No |
| `stockMode` | string | No |
| `isRecycled` | string | No |
| `productTypeId` | string | No |
| `brandCode` | string | No |
| `stopPurchase` | string | Yes |
| `mallStateList` | object[] | Yes |
| `mallState` | string | Yes |
| `siteDetailImageInfoList` | object[] | No |
| `imageGroupCode` | string | No |
| `imageInfoList` | object[] | No |
| `imageItemId` | long | No |
| `imageSort` | integer | No |
| `imageUrl` | string | No |
| `siteList` | object[] | No |
| `channel` | string | No |
| `mainSite` | string | No |
| `site` | string | No |
| `proofOfStockList` | object[] | No |
| `fileName` | string | No |
| `type` | integer | No |
| `url` | string | No |
| `competingProductLink` | string | No |
| `sampleInfo` | object | No |
| `reserveSampleFlag` | string | No |
| `spotFlag` | string | No |
| `sampleJudgeType` | string | No |
| `sampleCode` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/openapi-business-backend/product/full-detail' \
--header 'x-lt-signature: test0N2M2M2YyOGYxOTFjOTlhZTk1ZGJmZWEwY2VkNDA3NzM5MzgwNDVkNGMzODhhOTZlOTU1MWM3MWU5MTA4NzI2Mg==' \
--header 'x-lt-openKeyId: 6DF5F597AEF84494B42388C63F4632B3' \
--header 'x-lt-timestamp: 1692620638880' \
--header 'Content-Type: application/json;charset=UTF-8' \
--data-raw '{
    "skuCodes": [
        "I967uum2xi2q"
    ],
    "language": "en"
}'
```

### Response Example

```json
{
	"code": "0",
	"msg": "OK",
	"info": [{
		"spuName": "w2301056886",
		"categoryId": 2233,
		"categoryName": "大码毛衣半身裙",
		"skuDimensionsInfo": {
			"length": "12.00",
			"width": "12.00",
			"weight": "12",
			"height": "12.00"
		},
		"isSaleAttribute": 1,
		"productNumber": "123",
		"productTypeId": 1031,
		"skcName": "sw23010568863917",
		"skcCode": "O07f497x809b",
		"brandCode": "",
		"productName": {
			"language": "zh-cn",
			"productName": "商品测试详情图0626"
		},
		"goodsInventory": {
			"inventoryQuantity": 0,
			"lockedQuantity": 0,
			"tempLockQuantity": 0,
			"sellerSku": null,
			"usableInventory": 0,
			"skuCode": "I07f497xa731",
			"warehouseInventoryList": []
		},
		"shelfDetails": null,
		"productDesc": {
			"productDesc": "",
			"language": "zh-cn"
		},
		"currentPrices": [{
			"productCode": "I07f497xa731",
			"site": "shein-www",
			"shopPrice": 12.00,
			"currency": "USD",
			"terminal": null,
			"specialPrice": 12.00,
			"specialPriceStart": null,
			"salePrice": 12.00,
			"specialPriceEnd": null,
			"suggestedRetailPrice": null,
			"multiCurrencyCostList": [{
				"cost": 12.00,
				"currency": "CNY"
			}]
		}],
		"sellerSku": "",
		"imageList": [{
			"imageItemId": 4177814,
			"groupCode": "G3ck0j5himvq",
			"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/01/05/1672915851294102400.jpeg",
			"imageMediumUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/01/05/1672915851294102400_thumbnail_405x552.jpeg",
			"sort": 1,
			"imageSmallUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/01/05/1672915851294102400_thumbnail_220x293.jpeg",
			"imageType": "MAIN"
		}, {
			"imageItemId": 2147510583,
			"groupCode": "G3ck0j5himvq",
			"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/26/16877583224104183094.jpg",
			"imageMediumUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/26/16877583224104183094_thumbnail_405x552.jpg",
			"sort": 2,
			"imageSmallUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/26/16877583224104183094_thumbnail_220x293.jpg",
			"imageType": "DETAIL"
		}, {
			"imageItemId": 4177815,
			"groupCode": "G3ck0j5himvq",
			"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/01/05/16729158581743044934.jpeg",
			"imageMediumUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/01/05/16729158581743044934_thumbnail_405x552.jpeg",
			"sort": 3,
			"imageSmallUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/01/05/16729158581743044934_thumbnail_220x293.jpeg",
			"imageType": "SQUARE"
		}, {
			"imageItemId": 4177816,
			"groupCode": "G3ck0j5himvq",
			"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/01/05/16729158633401920931.jpeg",
			"imageMediumUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/01/05/16729158633401920931_thumbnail_405x552.jpeg",
			"sort": 4,
			"imageSmallUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/01/05/16729158633401920931_thumbnail_220x293.jpeg",
			"imageType": "PIECE"
		}],
		"skuCode": "I07f497xa731",
		"attributeLists": [{
			"attributeValueMulti": {
				"attributeValueMulti": "否",
				"language": "zh-cn"
			},
			"attributeAdditionList": [],
			"attributeId": 9,
			"attributeMulti": {
				"attributeMulti": "腰带修改属性名",
				"language": "zh-cn"
			},
			"attributeType": 4,
			"attributeValueId": 459
		}, {
			"attributeValueMulti": {
				"attributeValueMulti": "雨靴",
				"language": "zh-cn"
			},
			"attributeAdditionList": [],
			"attributeId": 1000455,
			"attributeMulti": {
				"attributeMulti": "关务种类",
				"language": "zh-cn"
			},
			"attributeType": 4,
			"attributeValueId": 1002593
		}],
		"saleAttribute": {
			"attributeValueMulti": {
				"attributeValueMulti": "S",
				"language": "zh-cn"
			},
			"attributeId": 87,
			"attributeMulti": {
				"attributeMulti": "尺寸",
				"language": "zh-cn"
			},
			"attributeValueId": 568
		},
		"skuAttributeLists": [{
			"attributeValueMulti": {
				"attributeValueMulti": "高腰",
				"language": "zh-cn"
			},
			"attributeId": 1000253,
			"attributeMulti": {
				"attributeMulti": "腰高",
				"language": "zh-cn"
			},
			"attributeValueId": 1001537
		}],
		"stopPurchase": 1,
		"mallStateList": [{
			"mallState": 1
		}],
		"siteDetailImageInfoList": [{
			"imageGroupCode": "G4101b6x0x2q",
			"imageInfoList": [{
				"imageItemId": 1147525967,
				"imageSort": 1,
				"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/27/16878497173382906927.jpg"
			}, {
				"imageItemId": 1147525968,
				"imageSort": 2,
				"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/27/1687849716132016602.jpg"
			}, {
				"imageItemId": 1147525969,
				"imageSort": 3,
				"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/27/16878497172100198531.jpg"
			}, {
				"imageItemId": 1147525972,
				"imageSort": 4,
				"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/27/16878497171538544330.jpg"
			}, {
				"imageItemId": 1147525970,
				"imageSort": 5,
				"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/27/168784971786427267.jpg"
			}, {
				"imageItemId": 1147525973,
				"imageSort": 6,
				"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/27/16878497172692858196.jpg"
			}, {
				"imageItemId": 1147525971,
				"imageSort": 7,
				"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/27/16878497171257169109.jpg"
			}, {
				"imageItemId": 1147525974,
				"imageSort": 8,
				"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/27/1687849717267425053.jpg"
			}, {
				"imageItemId": 1147525966,
				"imageSort": 9,
				"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/27/16878497172530412707.jpg"
			}, {
				"imageItemId": 1147525975,
				"imageSort": 10,
				"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/27/16878497181300119333.jpg"
			}],
			"siteList": [{
				"channel": "",
				"mainSite": "rw",
				"site": "rw-fr"
			}]
		}, {
			"imageGroupCode": "G1gn3ar0kuri",
			"imageInfoList": [{
				"imageItemId": 1147525978,
				"imageSort": 1,
				"imageUrl": "http://imgdeal-test01.shein.com/images3_pi/2023/06/27/16878503612266741411.jpg"
			}],
			"siteList": [{
				"channel": "",
				"mainSite": "shein",
				"site": "shein-roe"
			}, {
				"channel": "",
				"mainSite": "shein",
				"site": "shein-euqs"
			}, {
				"channel": "",
				"mainSite": "shein",
				"site": "shein-uk"
			}, {
				"channel": "",
				"mainSite": "shein",
				"site": "shein-ca"
			}, {
				"channel": "",
				"mainSite": "shein",
				"site": "shein-ma"
			}]
		}],
		"proofOfStockList": null,
		"sampleInfo": {
			"reserveSampleFlag": 0,
			"sampleCode": "",
			"spotFlag": 0,
			"sampleJudgeType": 2
		},
		"competingProductLink": null
	}]
}
```

---

## Get the final category

> **Official docs**: [Get the final category](https://open.sheincorp.com/documents/apidoc/detail/3001594)

**Method**: `POST` &nbsp; **Path**: `/goods/query-category-tree`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

_No additional request parameters._

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `code` | string | Yes |
| `info` | object | No |
| `data` | object[] | No |
| `category_id` | int64 | No |
| `category_name` | string | No |
| `children` | object[] | No |
| `last_category` | boolean | No |
| `parent_category_id` | int64 | No |
| `product_type_id` | int64 | No |
| `meta` | object | No |
| `count` | integer | No |
| `customObj` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/query-category-tree' \
--header 'language: en' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733442579' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "data": [
            {
                "category_id": 2028,
                "product_type_id": 0,
                "parent_category_id": 0,
                "category_name": "女士",
                "last_category": false,
                "children": [
                    {
                        "category_id": 2033,
                        "product_type_id": 0,
                        "parent_category_id": 2028,
                        "category_name": "Clothing",
                        "last_category": false,
                        "children": [
                            {
                                "category_id": 1767,
                                "product_type_id": 0,
                                "parent_category_id": 2033,
                                "category_name": "Dresses中文",
                                "last_category": false,
                                "children": [
                                    {
                                        "category_id": 1727,
                                        "product_type_id": 1080,
                                        "parent_category_id": 1767,
                                        "category_name": "Dresses/中文-四级",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 1740,
                                        "product_type_id": 1080,
                                        "parent_category_id": 1767,
                                        "category_name": "长裤",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 1756,
                                        "product_type_id": 165,
                                        "parent_category_id": 1767,
                                        "category_name": "女士首饰套装",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 1757,
                                        "product_type_id": 80,
                                        "parent_category_id": 1767,
                                        "category_name": "耳环",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 1759,
                                        "product_type_id": 79,
                                        "parent_category_id": 1767,
                                        "category_name": "戒指",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 1777,
                                        "product_type_id": 91,
                                        "parent_category_id": 1767,
                                        "category_name": "女士胸针",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 1871,
                                        "product_type_id": 164,
                                        "parent_category_id": 1767,
                                        "category_name": "打底裤",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 1912,
                                        "product_type_id": 75,
                                        "parent_category_id": 1767,
                                        "category_name": "短裤",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 2157,
                                        "product_type_id": 1178,
                                        "parent_category_id": 1767,
                                        "category_name": "男士公文包",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 2209,
                                        "product_type_id": 367,
                                        "parent_category_id": 1767,
                                        "category_name": "Lakensets met kussenslopen",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 2336,
                                        "product_type_id": 1031,
                                        "parent_category_id": 1767,
                                        "category_name": "库尔塔套装",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 2709,
                                        "product_type_id": 571,
                                        "parent_category_id": 1767,
                                        "category_name": "Women Sweatpants",
                                        "last_category": true,
                                        "children": []
                                    },
                                    {
                                        "category_id": 10409,
                                        "product_type_id": 1080,
                                        "parent_category_id": 1767,
                                        "category_name": "非服装分类",
                                        "last_category": true,
                                        "children": []
                                    }
                                ]
                            },
{
                "category_id": 10011520,
                "product_type_id": 0,
                "parent_category_id": 0,
                "category_name": "分类1208",
                "last_category": false,
                "children": [
                    {
                        "category_id": 10011707,
                        "product_type_id": 2147485898,
                        "parent_category_id": 10011520,
                        "category_name": "测试二级分类111",
                        "last_category": true,
                        "children": []
                    },
                    {
                        "category_id": 10011712,
                        "product_type_id": 2147485901,
                        "parent_category_id": 10011520,
                        "category_name": "测试二级分类222",
                        "last_category": true,
                        "children": []
                    },
                    {
                        "category_id": 10011917,
                        "product_type_id": 2147486497,
                        "parent_category_id": 10011520,
                        "category_name": "测试4级分类C4",
                        "last_category": true,
                        "children": []
                    },
                    {
                        "category_id": 10011918,
                        "product_type_id": 2147486498,
                        "parent_category_id": 10011520,
                        "category_name": "测试2级分类2",
                        "last_category": true,
                        "children": []
                    }
                ]
            }
        ],
        "meta": {
            "count": 47,
            "customObj": null
        }
    },
    "bbl": null
}
```

---

## Store check optional attributes

> **Official docs**: [Store check optional attributes](https://open.sheincorp.com/documents/apidoc/detail/3001482)

**Method**: `POST` &nbsp; **Path**: `/goods/query-attribute-template`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `product_type_id_list` | int64[] | Yes | Type id collection, supports up to10 type ids in a single call |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `code` | string | Yes |
| `info` | object | No |
| `data` | object[] | No |
| `attribute_infos` | object[] | No |
| `attribute_id` | long | No |
| `attribute_name` | string | No |
| `attribute_is_show` | int64 | No |
| `attribute_type` | int64 | No |
| `attribute_label` | int64 | No |
| `attribute_mode` | int64 | No |
| `attribute_input_num` | integer | No |
| `attribute_status` | int64 | No |
| `attribute_remark_list` | integer[] | No |
| `attribute_value_info_list` | object[] | No |
| `attribute_value` | string | No |
| `attribute_value_id` | long | No |
| `is_show` | int64 | No |
| `is_custom_attribute_value` | boolean | No |
| `supplier_id` | long | No |
| `product_type_id` | long | No |
| `meta` | object | No |
| `count` | integer | No |
| `customObj` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/query-attribute-template' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "product_type_id_list": [
        2147503175
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
                "product_type_id": 2512,
                "business_mode": 1,
                "attribute_infos": [
                    {
                        "attribute_id": 87,
                        "attribute_name": "尺寸",
                        "attribute_name_en": "Size",
                        "attribute_is_show": 1,
                        "attribute_source": 1,
                        "attribute_label": 0,
                        "attribute_mode": 2,
                        "data_dimension": 1,
                        "attribute_status": 3,
                        "attribute_type": 1,
                        "business_mode": 1,
                        "is_sample": 1,
                        "supplier_id": 0,
                        "attribute_doc": null,
                        "attribute_doc_image_list": null,
                        "attribute_value_info_list": [
                            {
                                "attribute_value_id": 474,
                                "attribute_value": "单一尺寸",
                                "attribute_value_en": "one-size",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1448,
                                "attribute_value": "",
                                "attribute_value_en": "",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 568,
                                "attribute_value": "S",
                                "attribute_value_en": "S",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 417,
                                "attribute_value": "M(中文)",
                                "attribute_value_en": "M",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 387,
                                "attribute_value": "L-中文",
                                "attribute_value_en": "L",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 754,
                                "attribute_value": "XL中文",
                                "attribute_value_en": "XL_en",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 756,
                                "attribute_value": "XXL",
                                "attribute_value_en": "XXL",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 758,
                                "attribute_value": "XXXL",
                                "attribute_value_en": "XXXL",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 759,
                                "attribute_value": "XXXXL",
                                "attribute_value_en": "XXXXL",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            }
                        ]
                    },
                    {
                        "attribute_id": 27,
                        "attribute_name": "颜色",
                        "attribute_name_en": "color",
                        "attribute_is_show": 1,
                        "attribute_source": 1,
                        "attribute_label": 1,
                        "attribute_mode": 2,
                        "data_dimension": 1,
                        "attribute_status": 3,
                        "attribute_type": 1,
                        "business_mode": 1,
                        "is_sample": 0,
                        "supplier_id": 0,
                        "attribute_doc": null,
                        "attribute_doc_image_list": null,
                        "attribute_value_info_list": [
                            {
                                "attribute_value_id": 78,
                                "attribute_value": "杏色",
                                "attribute_value_en": "Apricot",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 81,
                                "attribute_value": "军绿色",
                                "attribute_value_en": "Army Green",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 103,
                                "attribute_value": "米色",
                                "attribute_value_en": "Beige",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 112,
                                "attribute_value": "黑色",
                                "attribute_value_en": "Black",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 113,
                                "attribute_value": "黑白色",
                                "attribute_value_en": "Black and White",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 118,
                                "attribute_value": "blackk",
                                "attribute_value_en": "blackk",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 137,
                                "attribute_value": "青铜色",
                                "attribute_value_en": "Bronze",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 140,
                                "attribute_value": "棕色",
                                "attribute_value_en": "Brown",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 144,
                                "attribute_value": "酒红色",
                                "attribute_value_en": "Burgundy",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 152,
                                "attribute_value": "驼色",
                                "attribute_value_en": "Camel",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 171,
                                "attribute_value": "香槟色",
                                "attribute_value_en": "Champagne",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 182,
                                "attribute_value": "明亮",
                                "attribute_value_en": "Clear",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 322,
                                "attribute_value": "姜黄色",
                                "attribute_value_en": "Ginger",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 330,
                                "attribute_value": "金黄",
                                "attribute_value_en": "Gold",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 334,
                                "attribute_value": "绿色",
                                "attribute_value_en": "Green",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 336,
                                "attribute_value": "灰色",
                                "attribute_value_en": "Grey",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 364,
                                "attribute_value": "玫红色",
                                "attribute_value_en": "Hot Pink",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 379,
                                "attribute_value": "黄褐",
                                "attribute_value_en": "Khaki",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 421,
                                "attribute_value": "紫红色",
                                "attribute_value_en": "Maroon",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 447,
                                "attribute_value": "彩色",
                                "attribute_value_en": "Multicolor",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 475,
                                "attribute_value": "橘色",
                                "attribute_value_en": "Orange",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 513,
                                "attribute_value": "粉色",
                                "attribute_value_en": "Pink",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 536,
                                "attribute_value": "紫色",
                                "attribute_value_en": "Purple",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 544,
                                "attribute_value": "红色",
                                "attribute_value_en": "Red",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 562,
                                "attribute_value": "宝蓝色",
                                "attribute_value_en": "Royal Blue",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 601,
                                "attribute_value": "银色",
                                "attribute_value_en": "Silver",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 739,
                                "attribute_value": "白色",
                                "attribute_value_en": "Whiteen",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 762,
                                "attribute_value": "黄色",
                                "attribute_value_en": "Yellow",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 2427,
                                "attribute_value": "",
                                "attribute_value_en": "",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 2431,
                                "attribute_value": "",
                                "attribute_value_en": "",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 2436,
                                "attribute_value": "Mint Green",
                                "attribute_value_en": "Mint Green",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 2486,
                                "attribute_value": "Light Grey",
                                "attribute_value_en": "Light Grey",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 2493,
                                "attribute_value": "Dark Grey",
                                "attribute_value_en": "Dark Grey",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 2566,
                                "attribute_value": "frankie_test",
                                "attribute_value_en": "frankie_test",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000107,
                                "attribute_value": "秋",
                                "attribute_value_en": "秋",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000108,
                                "attribute_value": "冬",
                                "attribute_value_en": "冬",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000109,
                                "attribute_value": "流行款",
                                "attribute_value_en": "DYJ_流行款_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000110,
                                "attribute_value": "时尚款",
                                "attribute_value_en": "DYJ_时尚款_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000111,
                                "attribute_value": "复色款",
                                "attribute_value_en": "DYJ_复色款_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000112,
                                "attribute_value": "DYJ_新款",
                                "attribute_value_en": "DYJ_新款",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000113,
                                "attribute_value": "DYJ_套用版型款",
                                "attribute_value_en": "DYJ_套用版型款",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000114,
                                "attribute_value": "DYJ_针织",
                                "attribute_value_en": "DYJ_针织",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000115,
                                "attribute_value": "梭织",
                                "attribute_value_en": "DYJ_梭织_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000116,
                                "attribute_value": "DYJ_毛织",
                                "attribute_value_en": "DYJ_毛织_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000117,
                                "attribute_value": "pink",
                                "attribute_value_en": "pink",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000118,
                                "attribute_value": "BLUE",
                                "attribute_value_en": "BLUE",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000119,
                                "attribute_value": "修身",
                                "attribute_value_en": "DYJ_修身_en",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000120,
                                "attribute_value": "宽松",
                                "attribute_value_en": "DYJ_宽松_en",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000121,
                                "attribute_value": "紧身",
                                "attribute_value_en": "DYJ_紧身_en",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000123,
                                "attribute_value": "DYJ_H",
                                "attribute_value_en": "DYJ_H_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000126,
                                "attribute_value": "DYJ_棒球领",
                                "attribute_value_en": "DYJ_棒球领_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000127,
                                "attribute_value": "DYJ_翻领",
                                "attribute_value_en": "DYJ_翻领_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000128,
                                "attribute_value": "DYJ_泡泡袖",
                                "attribute_value_en": "DYJ_泡泡袖_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000129,
                                "attribute_value": "DYJ_蝙蝠袖",
                                "attribute_value_en": "DYJ_蝙蝠袖_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000130,
                                "attribute_value": "DYJ_踩脚裤",
                                "attribute_value_en": "DYJ_踩脚裤_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000131,
                                "attribute_value": "DYJ_阔腿裤",
                                "attribute_value_en": "DYJ_阔腿裤_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000132,
                                "attribute_value": "DYJ_泡泡裙",
                                "attribute_value_en": "DYJ_泡泡裙_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000133,
                                "attribute_value": "DYJ_鱼尾裙",
                                "attribute_value_en": "DYJ_鱼尾裙_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000134,
                                "attribute_value": "DYJ_超短款",
                                "attribute_value_en": "DYJ_超短款_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000135,
                                "attribute_value": "DYJ_常规款",
                                "attribute_value_en": "DYJ_常规款",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            },
                            {
                                "attribute_value_id": 1000136,
                                "attribute_value": "DYJ_超长袖",
                                "attribute_value_en": "DYJ_超长袖_EN",
                                "is_custom_attribute_value": false,
                                "is_show": 1,
                                "supplier_id": 0,
                                "attribute_value_doc": null,
                                "attribute_value_doc_image_list": null,
                                "attribute_value_group_list": null
                            }
                        ]
                    },
                ],
                "attribute_id": [
                    87,
                    27,
                    109,
                    160,
                    1000547,
                    62,
                    55,
                    118,
                    48,
                    32,
                    1000411,
                    1000463,
                    1000186,
                    1000462,
                    1000407,
                    1000546,
                    1000576,
                    1000062
                ]
            }
        ],
        "meta": {
            "count": 1,
            "customObj": null
        }
    },
    "bbl": null
}
```

---

## Query whether custom attribute values are supported

> **Official docs**: [Query whether custom attribute values are supported](https://open.sheincorp.com/documents/apidoc/detail/3001369)

**Method**: `POST` &nbsp; **Path**: `/goods/get-custom-attribute-permission-config`

**Applicable to**: Self-operated, Fully-managed, Shein-operated, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `category_id_list` | int64[] | Yes | Last-level category ID, supports up to 200 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `code` | string | Yes |
| `info` | object | No |
| `data` | object[] | No |
| `attribute_id` | int64 | No |
| `last_category_id` | int64 | No |
| `has_permission` | integer | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/get-custom-attribute-permission-config' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "category_id_list": [
        2103
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
                "has_permission": 1,
                "last_category_id": 2103,
                "attribute_id": 27
            },
            {
                "has_permission": 1,
                "last_category_id": 2103,
                "attribute_id": 87
            }
        ],
        "meta": {
            "count": 2,
            "customObj": null
        }
    },
    "bbl": null
}
```

---

## Add custom attribute values

> **Official docs**: [Add custom attribute values](https://open.sheincorp.com/documents/apidoc/detail/3001483)

**Method**: `POST` &nbsp; **Path**: `/goods/add-custom-attribute-value`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `attribute_id` | int64 | Yes | Attribute ID。Under which attribute to add the custom attribute value。 |
| `attribute_value` | string | Yes | Custom attribute value. Up to 100 characters, special symbols must use half-width, full-width symbols are not supported。 |
| `category_id` | int64 | Yes | Sub-category ID |
| `attribute_value_name_multis` | object[] | No | Multilingual for custom attribute value |
| `language` | string | No | Language |
| `attribute_value_name_multi` | string | No | Custom attribute value (multilingual)。Up to 100 characters, special symbols must use half-width, full-width symbols are not supported。 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `code` | string | Yes |
| `info` | object | No |
| `attribute_id` | int64 | No |
| `attribute_value_id` | int64 | No |
| `attribute_value_name` | string | No |
| `category_id` | int64 | No |
| `supplier_id` | int64 | No |
| `supplier_source` | integer | No |
| `attribute_value_multi_arr` | object[] | No |
| `attribute_value_name_multi` | string | No |
| `language` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/add-custom-attribute-value' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "attribute_id": 27,
    "attribute_value": "Navy/Bittersweet/Peacoat",
    "category_id": 4455
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "supplier_id": ******,
        "supplier_source": 10,
        "category_id": 4455,
        "attribute_id": 27,
        "attribute_value_id": 5242406,
        "attribute_value_name": "Navy/Bittersweet/Peacoat",
        "attribute_value_multi_arr": [
            {
                "attribute_value_name_multi": "البحرية / حلو ومر / Peacoat",
                "language": "ar"
            },
            {
                "attribute_value_name_multi": "Navy/Bittersweet/Peacoat",
                "language": "cs-cz"
            },
            {
                "attribute_value_name_multi": "Marineblau/Bittersüß/Peacoat",
                "language": "de"
            },
            {
                "attribute_value_name_multi": "Ναυτικό/Γλυκόπικρο/Παγώνι",
                "language": "el-gr"
            },
            {
                "attribute_value_name_multi": "Navy/Bittersweet/Peacoat",
                "language": "en"
            },
            {
                "attribute_value_name_multi": "Azul marino/Agridulce/Chaquetón",
                "language": "es"
            },
            {
                "attribute_value_name_multi": "Bleu marine/doux-amer/caban",
                "language": "fr"
            },
            {
                "attribute_value_name_multi": "חיל הים/מריר/טווס",
                "language": "he"
            },
            {
                "attribute_value_name_multi": "Angkatan Laut/Pahit Manis/Peacoat",
                "language": "id"
            },
            {
                "attribute_value_name_multi": "Blu marino/Agrodolce/Peacoat",
                "language": "it"
            },
            {
                "attribute_value_name_multi": "ネイビー/ビタースイート/ピーコート",
                "language": "ja"
            },
            {
                "attribute_value_name_multi": "네이비/비터스위트/피코트",
                "language": "ko"
            },
            {
                "attribute_value_name_multi": "Marineblauw/bitterzoet/peacoat",
                "language": "nl"
            },
            {
                "attribute_value_name_multi": "Granatowy / Słodko-gorzki / Peacoat",
                "language": "pl"
            },
            {
                "attribute_value_name_multi": "Marinha/Agridoce/Peacoat",
                "language": "pt-br"
            },
            {
                "attribute_value_name_multi": "Marinha/Agridoce/Peacoat",
                "language": "pt-pt"
            },
            {
                "attribute_value_name_multi": "Темно-синий/горько-сладкий/бушлат",
                "language": "ru"
            },
            {
                "attribute_value_name_multi": "Navy/Bittersweet/Peacoat",
                "language": "sv"
            },
            {
                "attribute_value_name_multi": "สีกรมท่า/สีหวานอมขมกลืน/สีพีโค้ต",
                "language": "th"
            },
            {
                "attribute_value_name_multi": "Lacivert/Acı tatlı/Tavuskuşu",
                "language": "tr"
            },
            {
                "attribute_value_name_multi": "Màu xanh hải quân/ngọt đắng/peacoat",
                "language": "vi"
            },
            {
                "attribute_value_name_multi": "海军蓝/苦乐参半/豌豆大衣",
                "language": "zh-cn"
            },
            {
                "attribute_value_name_multi": "海軍藍/苦樂參半/短大衣",
                "language": "zh-tw"
            }
        ]
    },
    "bbl": null
}
```

---

## Query associated attribute filling rules

> **Official docs**: [Query associated attribute filling rules](https://open.sheincorp.com/documents/apidoc/detail/3001366)

**Method**: `POST` &nbsp; **Path**: `/goods/get-associated-attribute-rules`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `get_linked_rule_req_list` | object[] | Yes | Enter all filled product attributes (excluding sales and size attributes), the API will return which associated attributes are mandatory under these attribute combinations.Supports querying associated attribute rules for multiple products simultan... |
| `group_id` | string | No | Group ID, can be a developer-defined value, used for positioning in batch product queries, supports up to 10 groups in a single request. |
| `category_id` | int64 | Yes | Product final category id |
| `product_type_id` | int64 | Yes | Type id corresponding to the product final category |
| `attribute_list` | object[] | Yes | List of filled product attributes. There is no limit to the number of attribute_id in the list. |
| `attribute_id` | int64 | Yes | Attribute name id |
| `attribute_value_id` | int64 | No | Attribute value id; if there are multiple attribute values under the attribute name, multiple sets of information need to be provided.When the input method of the attribute value attribute_mode=4 (dropdown selection+manual input), input the value ... |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `msg` | string | Yes |
| `info` | object | Yes |
| `data` | object[] | Yes |
| `group_id` | string | No |
| `link_rule_attribute_list` | object[] | No |
| `attribute_id` | int64 | No |
| `attribute_value_list` | int64[] | No |
| `attribute_value_pre_fill_list` | int64[] | No |
| `meta` | object | Yes |
| `count` | integer | No |
| `traceId` | string | Yes |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/get-associated-attribute-rules' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1753682806205' \
--header 'language: en' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
   "get_linked_rule_req_list":[
    {
        
        "group_id":1,
        "category_id": 20039919,
        "product_type_id": 2147503231,
        "attribute_list":[
            {
                "attribute_id":2147484223,
                "attribute_value_id":2147488193
            },
            {
                "attribute_id":2147484194,
                "attribute_value_id":7627286
            },
            {
                "attribute_id": 2147484194,
                "attribute_value_id":7627280
            }
        ]
    },
     {
        
        "group_id":2,
        "category_id": 20039919,
        "product_type_id": 2147503231,
        "attribute_list":[
            {
                "attribute_id":2147484223,
                "attribute_value_id":21474881945
            },
            {
                "attribute_id":2147484194,
                "attribute_value_id":762725546
            },
            {
                "attribute_id": 21474841954,
                "attribute_value_id":762280
            }
        ]
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
        "data": [
            {
                "group_id": "1",
                "link_rule_attribute_list": [
                    {
                        "attribute_id": 2147484196,
                        "attribute_value_list": [
                            440,
                            442
                        ],
                        "attribute_value_pre_fill_list": []
                    },
                    {
                        "attribute_id": 2147484188,
                        "attribute_value_list": [
                            290,
                            372,
                            325,
                            327,
                            62,
                            154,
                            91
                        ],
                        "attribute_value_pre_fill_list": [
                            154,
                            91
                        ]
                    }
                ]
            },
            {
                "group_id": "2",
                "link_rule_attribute_list": [
                    {
                        "attribute_id": 2147484196,
                        "attribute_value_list": [
                            440,
                            442
                        ],
                        "attribute_value_pre_fill_list": []
                    },
                    {
                        "attribute_id": 2147484188,
                        "attribute_value_list": [
                            290,
                            372,
                            325,
                            327,
                            62,
                            154,
                            91
                        ],
                        "attribute_value_pre_fill_list": [
                            154,
                            91
                        ]
                    }
                ]
            }
        ],
        "meta": {
            "count": 2,
            "customObj": null
        }
    },
    "bbl": null,
    "traceId": "55d05009ca82c48f"
}
```

---

## Product release field specifications (including default language)

> **Official docs**: [Product release field specifications (including default language)](https://open.sheincorp.com/documents/apidoc/detail/3001595)

**Method**: `POST` &nbsp; **Path**: `/goods/query-publish-fill-in-standard`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `category_id` | long | No | Lowest-level category ID. When querying the filling specifications of the following information, the lowest-level category ID is required as a parameter:Whether the category supports SPU dimension images, sample information, SKU packaging type, SK... |
| `spu_name` | string | No | SKC code generated by SHEIN。This input parameter is only used to check whether a specific SPU is currently using the new image scheme, other scenarios do not need to be passed; usage is rare。 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `fill_in_standard_list` | object[] | Yes |
| `field_key` | string | Yes |
| `module` | string | Yes |
| `required` | boolean | Yes |
| `show` | boolean | Yes |
| `currency` | string | Yes |
| `default_language` | string | Yes |
| `picture_config_list` | object[] | No |
| `field_key` | string | No |
| `is_true` | boolean | No |
| `support_sale_attribute_sort` | boolean | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/query-publish-fill-in-standard' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "fill_in_standard_list": [
            {
                "module": "supplier_info",
                "field_key": "minimum_stock_quantity",
                "required": false,
                "show": false
            },
            {
                "module": "reference_info",
                "field_key": "reference_product_link",
                "required": false,
                "show": false
            },
            {
                "module": "reference_info",
                "field_key": "proof_of_stock",
                "required": false,
                "show": false
            },
            {
                "module": "supplier_info",
                "field_key": "quantity_info",
                "required": false,
                "show": false
            },
            {
                "module": "supplier_info",
                "field_key": "package_type",
                "required": false,
                "show": true
            },
            {
                "module": "supplier_info",
                "field_key": "supplier_barcode",
                "required": false,
                "show": false
            },
            {
                "module": "basic_info",
                "field_key": "skc_title",
                "required": false,
                "show": false
            },
            {
                "module": "sales_info",
                "field_key": "shelf_require",
                "required": false,
                "show": false
            },
            {
                "module": "basic_info",
                "field_key": "brand_code",
                "required": false,
                "show": true
            },
            {
                "module": "supplier_info",
                "field_key": "stop_purchase",
                "required": false,
                "show": false
            },
            {
                "module": "supplier_info",
                "field_key": "mall_state",
                "required": false,
                "show": true
            },
            {
                "module": "sales_info",
                "field_key": "suggest_price",
                "required": false,
                "show": true
            },
            {
                "module": "product_detail_pic",
                "field_key": "product_detail_pic",
                "required": false,
                "show": true
            },
            {
                "module": "basic_info",
                "field_key": "ip_character",
                "required": false,
                "show": false
            },
            {
                "module": "sample_info",
                "field_key": "sample_spec",
                "required": false,
                "show": false
            }
        ],
        "default_language": "pt-br",
        "picture_config_list": [
            {
                "field_key": "switch_spu_picture",
                "is_true": false
            },
            {
                "field_key": "spu_image_detail_show",
                "is_true": true
            },
            {
                "field_key": "spu_image_detail_required",
                "is_true": false
            },
            {
                "field_key": "spu_image_detail_single",
                "is_true": true
            },
            {
                "field_key": "spu_image_square_show",
                "is_true": true
            },
            {
                "field_key": "spu_image_square_required",
                "is_true": false
            },
            {
                "field_key": "skc_image_detail_show",
                "is_true": true
            },
            {
                "field_key": "skc_image_detail_required",
                "is_true": false
            },
            {
                "field_key": "skc_image_detail_single",
                "is_true": true
            },
            {
                "field_key": "skc_image_square_show",
                "is_true": true
            },
            {
                "field_key": "skc_image_square_required",
                "is_true": false
            }
        ],
        "currency": "USD",
        "support_sale_attribute_sort": false
    },
    "bbl": null,
    "traceId": "b8c61539ef4cf58b"
}
```

---

## Query whether the merchant sku already exists

> **Official docs**: [Query whether the merchant sku already exists](https://open.sheincorp.com/documents/apidoc/detail/3001437)

**Method**: `POST` &nbsp; **Path**: `/goods/product/check-supplierSku-repeated`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `supplierSkuList` | string[] | Yes | Merchant sku。Up to 200 can be queried at a time。 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object[] | Yes |
| `supplierSku` | string | No |
| `repeated` | boolean | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/product/check-supplierSku-repeated' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1761136234195' \
--header 'language: en' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
"supplierSkuList":["34534543","46fjdsfsdfsdlr"]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": [
        {
            "supplierSku": "34534543",
            "repeated": false
        },
        {
            "supplierSku": "46fjdsfsdfsdlr",
            "repeated": false
        }
    ],
    "traceId": "ccc40d75be5a760e"
}
```

---

## Image and text recognition recommended category

> **Official docs**: [Image and text recognition recommended category](https://open.sheincorp.com/documents/apidoc/detail/3001363)

**Method**: `POST` &nbsp; **Path**: `/goods/image-category-suggestion`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `url` | string | No | Image URL. External image addresses can be used, only JPG/JPEG/PNG formats are supported, size ≤3MB.url, productInfo, one of these values must be input, or both can be input. |
| `productInfo` | string | No | Product copy information. You can input any product-related text information such as product descriptions or product names, in any language, within 1000 characters, emojis are not supported.url, productInfo, one of these values must be input, or b... |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `data` | object[] | No |
| `categoryId` | string | No |
| `order` | integer | No |
| `vote` | integer | No |
| `meta` | object | No |
| `count` | integer | No |
| `customObj` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/image-category-suggestion' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1754986656203' \
--header 'language: en' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{

    "url":"https://m.media-amazon.com/images/I/818KIweHGaL._AC_SX679_.jpg",
    "productInfo":"12 Inch Round Woven Placemats Set of 8, VIBRATITE Jute Rope Braided Table Mats, Boho Farmhouse Rustic Woven Tassel Place Mats for Indoor and Outdoor Dining Table, Party, Kitchen Decor"

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
                "categoryId": "8642",
                "order": 1,
                "vote": 8
            },
            {
                "categoryId": "13011",
                "order": 2,
                "vote": 2
            }
        ],
        "meta": {
            "count": 2,
            "customObj": null
        }
    },
    "bbl": null,
    "traceId": "4dd3812a348d1f5b"
}
```

---

## Convert image link

> **Official docs**: [Convert image link](https://open.sheincorp.com/documents/apidoc/detail/3001360)

**Method**: `POST` &nbsp; **Path**: `/goods/transform-pic`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `image_type` | integer | Yes | Image type (1: Main image; 2: Detail image; 5: Square image; 6: Color block image; 7: Detail page image).Refer to the description at the top of the document for the requirements of each image type. |
| `original_url` | string | Yes | Image address. |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `failure_reason` | string | No |
| `original` | string | Yes |
| `transformed` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/transform-pic' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
  "image_type": 2,
  "original_url": "http://imgdeal-test01.shein.com/images3_pi/2023/11/15/fe/17000325694031071724_square.jpg"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "original": "http://imgdeal-test01.shein.com/images3_pi/2023/11/15/fe/17000325694031071724_square.jpg",
        "transformed": "",
        "failure_reason": "图片下载异常"
    },
    "bbl": null
}
```

---

## Local Image Upload

> **Official docs**: [Local Image Upload](https://open.sheincorp.com/documents/apidoc/detail/3001359)

**Method**: `POST` &nbsp; **Path**: `/goods/upload-pic`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `image_type` | int64 | Yes | Image type (1: main image; 2: detail image; 5: block image; 6: color block image; 7: detail image) Refer to the description at the top of the document for the requirements of each type of image. |
| `file` | blob | Yes | Image File |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | Yes |
| `info` | object | Yes |
| `npid` | string | No |
| `code` | string | No |
| `info` | object | Yes |
| `height` | integer | No |
| `image_hex_type` | string | No |
| `image_url` | string | No |
| `size` | integer | No |
| `width` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/upload-pic' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Host: openapi-test01.sheincorp.cn' \
--form 'image_type="2"' \
--form 'file=@"/Users/10124378/Downloads/760eecab5aab4e7a8adec5961c795e50 (1).jpg"'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "image_url": "http://imgdeal-test01.shein.com/images3_pi/2023/11/15/3c/17000397694031071724_square.jpg",
        "width": 1200,
        "height": 1200,
        "size": 363846,
        "image_hex_type": "jpg"
    },
    "bbl": null
}
```

---

## Query store site and currency information (new)

> **Official docs**: [Query store site and currency information (new)](https://open.sheincorp.com/documents/apidoc/detail/3001249)

**Method**: `POST` &nbsp; **Path**: `/goods/query-site-list`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

_No additional request parameters._

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `code` | string | Yes |
| `info` | object | No |
| `data` | object[] | No |
| `main_site` | string | No |
| `main_site_name` | string | No |
| `sub_site_list` | object[] | No |
| `currency` | string | No |
| `site_abbr` | string | No |
| `site_name` | string | No |
| `site_status` | integer | No |
| `store_type` | integer | No |
| `symbol_left` | string | No |
| `symbol_right` | string | No |
| `meta` | object | No |
| `count` | integer | No |
| `customObj` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/query-site-list' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw ''
```

### Response Example

```json
{
  "code": "0",
  "msg": "OK",
  "info": {
    "data": [
      {
        "main_site": "shein",
        "main_site_name": "SHEIN",
        "sub_site_list": [
          {
            "site_name": "SHEIN法国站",
            "site_abbr": "shein-fr",
            "site_status": 1,
            "store_type": 1,
            "currency": "EUR",
            "symbol_left": "",
            "symbol_right": "€"
          },
          {
            "site_name": "SHEIN西班牙站",
            "site_abbr": "shein-es",
            "site_status": 1,
            "store_type": 1,
            "currency": "EUR",
            "symbol_left": "",
            "symbol_right": "€"
          },
          {
            "site_name": "SHEIN德国站",
            "site_abbr": "shein-de",
            "site_status": 1,
            "store_type": 1,
            "currency": "EUR",
            "symbol_left": "",
            "symbol_right": "€"
          },
          {
            "site_name": "SHEIN意大利站",
            "site_abbr": "shein-it",
            "site_status": 1,
            "store_type": 1,
            "currency": "EUR",
            "symbol_left": "",
            "symbol_right": "€"
          },
          {
            "site_name": "SHEIN荷兰站",
            "site_abbr": "shein-nl",
            "site_status": 1,
            "store_type": 1,
            "currency": "EUR",
            "symbol_left": "",
            "symbol_right": "€"
          },
          {
            "site_name": "SHEIN波兰站",
            "site_abbr": "shein-pl",
            "site_status": 1,
            "store_type": 1,
            "currency": "PLN",
            "symbol_left": "",
            "symbol_right": "zł"
          },
          {
            "site_name": "SHEIN奥地利站",
            "site_abbr": "shein-at",
            "site_status": 1,
            "store_type": 1,
            "currency": "EUR",
            "symbol_left": "",
            "symbol_right": "€"
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
  "traceId": "bbfb5e663a06cfee"
}
```

---

## Get brand list

> **Official docs**: [Get brand list](https://open.sheincorp.com/documents/apidoc/detail/3001250)

**Method**: `POST` &nbsp; **Path**: `/goods/query-brand-list`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

_No additional request parameters._

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `code` | string | Yes |
| `info` | object | No |
| `data` | object[] | No |
| `brand_code` | string | No |
| `brand_name` | string | No |
| `meta` | object | No |
| `count` | integer | No |
| `customObj` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/query-brand-list' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "data": [
            {
                "brand_code": "2u1ys",
                "brand_name": "shein品牌"
            },
            {
                "brand_code": "2pg9i",
                "brand_name": "这是品牌"
            },
            {
                "brand_code": "24rjv",
                "brand_name": "品牌数据"
            },
            {
                "brand_code": "2nz97",
                "brand_name": "品牌111"
            }
        ],
        "meta": {
            "count": 4,
            "customObj": null
        }
    },
    "bbl": null
}
```

---

## Product price update API

> **Official docs**: [Product price update API](https://open.sheincorp.com/documents/apidoc/detail/3001407)

**Method**: `POST` &nbsp; **Path**: `/openapi-business-backend/product/price/save`

**Applicable to**: Self-operated


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `productPriceList` | object[] | No | Item Price Information List, Max Length 100 |
| `productCode` | string | Yes | transfer sku_code, sku_code is the system code generated by SHEIN for product publication |
| `currencyCode` | string | Yes | Currency, the selling currency used on the SHEIN platform, such as BRL, THB, USD, MXN. For specific currencies, please refer to Store Site and Currency Information (New) |
| `shopPrice` | double | Yes | original price |
| `specialPrice` | double | No | Special Price, Note: When special price is not sent, the default special price is updated to 0! |
| `site` | string | Yes | Site - Can only transmit subsites. For example, shein-us |
| `riseReason` | string | No | Reason for price increase。 Enum:1-Product cost increased,2-Logistics fulfillment cost increased,3-Price restored after event ended,4-Other,5-Logistics fulfillment cost increased（Logistics rule adjustment） |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `data` | object[] | No |
| `success` | boolean | No |
| `message` | string | No |
| `productCode` | string | No |
| `site` | string | No |
| `status` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/openapi-business-backend/product/price/save' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752734980846' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "productPriceList": [{
        "currencyCode": "MXN",
        "productCode": "I11mesukkwwr",
        "site": "shein-mx",
        "shopPrice": 1,
        "riseReason":null,
        "specialPrice":null


    }]
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
                "success": true,
                "message": "价格调整成功",
                "productCode": "I11mesukkwwr",
                "site": "shein-mx"
                "status":1
            }
        ]
    }
}
```

---

## Update cost API

> **Official docs**: [Update cost API](https://open.sheincorp.com/documents/apidoc/detail/3001315)

**Method**: `POST` &nbsp; **Path**: `/goods/update-cost`

**Applicable to**: Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skc_info_list` | object[] | Yes | skc information |
| `skc_name` | string | Yes | skc_name, skc_name is the system code generated by SHEIN for product release |
| `sku_info_list` | object[] | Yes | sku information |
| `cost` | double | Yes | Updated supply price.A value greater than 0 and less than 100000, up to 2 decimal places. |
| `currency` | string | Yes | Currency. Needs to be obtained through Product publishing field specifications (including default languages), field "currency" |
| `sku_code` | string | Yes | sku_code, sku_code is the system code generated by SHEIN for product release |
| `spu_name` | string | Yes | spu_name, spu_name is the system code generated by SHEIN for product release |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `npid` | string | No |
| `code` | string | Yes |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/update-cost' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "spu_name": "xS25121523423",
    "skc_info_list": [
        {
            "skc_name": "sf24112312321581",
            "sku_info_list": [
                {
                    "cost": "10.55",
                    "currency": "EUR",
                    "sku_code": "I1231281em4e"
                },
                {
                    "cost": "10.55",
                    "currency": "EUR",
                    "sku_code": "I12312311ew4e"
                },
                {
                    "cost": "10.55",
                    "currency": "EUR",
                    "sku_code": "I122211281ef4e"
                }
            ]
        }
    ]
}'
```

### Response Example

```json
{"code":"0",
 "msg":"OK",
  "info":null,
  "bbl":null,
  "traceId":"c2222a9c0223234e"
 }
```

---

## Obtain store listing quota

> **Official docs**: [Obtain store listing quota](https://open.sheincorp.com/documents/apidoc/detail/3001544)

**Method**: `POST` &nbsp; **Path**: `/goods/query-shelf-quota`

**Applicable to**: Self-operated, Semi-managed, POP


### Request Parameters

_No additional request parameters._

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | Yes |
| `need` | boolean | No |
| `total_quota_count` | integer | No |
| `on_shelf_count` | integer | No |
| `remain_count` | integer | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/query-shelf-quota' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1768183146359' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "need": true,
        "total_quota_count": 2000,
        "on_shelf_count": 0,
        "remain_count": 2000
    },
    "bbl": null,
    "traceId": "63b1dabf446528dc"
}
```

---

## Product listed and product pending listed

> **Official docs**: [Product listed and product pending listed](https://open.sheincorp.com/documents/apidoc/detail/3001253)

**Method**: `POST` &nbsp; **Path**: `/goods/modify-skc-shelf`

**Applicable to**: Self-operated, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skc_site_info_list` | object[] | Yes | On-off shelf site information, supports a maximum of 100 data in one call |
| `shelf_state` | integer | Yes | On-off shelf operation; 1. Publish, 2. Unpublish |
| `site_list` | string[] | Yes | Product site to be modified |
| `skc_name` | string | Yes | skc_name, skc_nameis the system code generated by SHEIN for product release |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `code` | string | Yes |
| `info` | object | No |
| `failure_count` | integer | No |
| `failure_results` | object[] | No |
| `code` | string | No |
| `identity` | string | No |
| `line_index` | integer | No |
| `msg` | string | No |
| `success_count` | integer | No |
| `total_count` | integer | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/modify-skc-shelf' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "skc_site_info_list": [
        {
            "shelf_state": 2,
            "site_list": [
                "shein-fr"
            ],
            "skc_name":"sMM23072039123259"
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
        "success_count": 1,
        "failure_count": 0,
        "total_count": 1,
        "failure_results": []
    },
    "bbl": null
}
```

---

## Query store site and site currencies (old)

> **Official docs**: [Query store site and site currencies (old)](https://open.sheincorp.com/documents/apidoc/detail/3001254)

**Method**: `POST` &nbsp; **Path**: `/openapi-business-backend/site/query`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pageNum` | integer | No | page num |
| `pageSize` | integer | No | page size |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `info` | object[] | No |
| `mainSite` | string | No |
| `mainSiteName` | string | No |
| `subSiteList` | object[] | No |
| `currency` | string | No |
| `siteAbbr` | string | No |
| `siteName` | string | No |
| `storeType` | string | No |
| `symbolLeft` | string | No |
| `symbolRight` | string | No |
| `rateInfo` | object[] | No |
| `currency` | string | No |
| `rate` | double | No |
| `fixedRate` | double | No |
| `rateType` | integer | No |
| `symbolLeft` | string | No |
| `symbolRight` | string | No |
| `siteLanguage_list` | object[] | No |
| `name` | string | No |
| `isAvailable` | string | No |
| `abbr` | string | No |
| `sort` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/openapi-business-backend/site/query' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "pageNum": 1, "pageSize": 10
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": [
        {
            "mainSite": "shein",
            "mainSiteName": "SHEIN",
            "subSiteList": [
                {
                    "storeType": null,
                    "symbolLeft": "$",
                    "rateInfo": [
                        {
                            "rateType": 1,
                            "rate": 1.000000,
                            "fixedRate": 1.00000000,
                            "symbolLeft": "$",
                            "symbolRight": "",
                            "currency": "USD"
                        }
                    ],
                    "siteName": "SHEIN国际站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "西班牙语",
                            "sort": null,
                            "abbr": "es"
                        },
                        {
                            "isAvailable": null,
                            "name": "法国法文",
                            "sort": null,
                            "abbr": "fr-fr"
                        },
                        {
                            "isAvailable": null,
                            "name": "西班牙文",
                            "sort": null,
                            "abbr": "es-es"
                        },
                        {
                            "isAvailable": null,
                            "name": "英语",
                            "sort": null,
                            "abbr": "en"
                        }
                    ],
                    "currency": "USD",
                    "siteAbbr": "shein-www"
                },
                {
                    "storeType": null,
                    "symbolLeft": "",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 0.946253,
                            "fixedRate": 9.00000000,
                            "symbolLeft": "",
                            "symbolRight": "€",
                            "currency": "EUR"
                        }
                    ],
                    "siteName": "SHEIN法国站",
                    "symbolRight": "€",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "法国法文",
                            "sort": null,
                            "abbr": "fr-fr"
                        },
                        {
                            "isAvailable": null,
                            "name": "葡萄牙语",
                            "sort": null,
                            "abbr": "pt-pt-pt"
                        },
                        {
                            "isAvailable": null,
                            "name": "法语",
                            "sort": null,
                            "abbr": "fr"
                        },
                        {
                            "isAvailable": null,
                            "name": "意大利语",
                            "sort": null,
                            "abbr": "it"
                        }
                    ],
                    "currency": "EUR",
                    "siteAbbr": "shein-fr"
                },
                {
                    "storeType": null,
                    "symbolLeft": "",
                    "rateInfo": [
                        {
                            "rateType": 1,
                            "rate": 0.946253,
                            "fixedRate": 1.23100000,
                            "symbolLeft": "",
                            "symbolRight": "€",
                            "currency": "EUR"
                        }
                    ],
                    "siteName": "SHEIN西班牙站",
                    "symbolRight": "€",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "西班牙文",
                            "sort": null,
                            "abbr": "es-es"
                        }
                    ],
                    "currency": "EUR",
                    "siteAbbr": "shein-es"
                },
                {
                    "storeType": null,
                    "symbolLeft": "",
                    "rateInfo": [
                        {
                            "rateType": 1,
                            "rate": 0.946253,
                            "fixedRate": 1.00000000,
                            "symbolLeft": "",
                            "symbolRight": "€",
                            "currency": "EUR"
                        }
                    ],
                    "siteName": "SHEIN德国站",
                    "symbolRight": "€",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "德国德文",
                            "sort": null,
                            "abbr": "de-de"
                        },
                        {
                            "isAvailable": null,
                            "name": "沙特阿拉伯文",
                            "sort": null,
                            "abbr": "ar-sa"
                        },
                        {
                            "isAvailable": null,
                            "name": "德语",
                            "sort": null,
                            "abbr": "de"
                        }
                    ],
                    "currency": "EUR",
                    "siteAbbr": "shein-de"
                },
                {
                    "storeType": null,
                    "symbolLeft": "",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 94.339623,
                            "fixedRate": 98.30000000,
                            "symbolLeft": "",
                            "symbolRight": "руб.",
                            "currency": "RUB"
                        }
                    ],
                    "siteName": "SHEIN俄罗斯站",
                    "symbolRight": "руб.",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "俄罗斯俄文",
                            "sort": null,
                            "abbr": "ru-ru"
                        },
                        {
                            "isAvailable": null,
                            "name": "俄罗斯语",
                            "sort": null,
                            "abbr": "ru"
                        }
                    ],
                    "currency": "RUB",
                    "siteAbbr": "shein-ru"
                },
                {
                    "storeType": null,
                    "symbolLeft": "",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 0.946253,
                            "fixedRate": 0E-8,
                            "symbolLeft": "",
                            "symbolRight": "€",
                            "currency": "EUR"
                        }
                    ],
                    "siteName": "SHEIN意大利站",
                    "symbolRight": "€",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "意大利文",
                            "sort": null,
                            "abbr": "it-it"
                        },
                        {
                            "isAvailable": null,
                            "name": "意大利语",
                            "sort": null,
                            "abbr": "it"
                        }
                    ],
                    "currency": "EUR",
                    "siteAbbr": "shein-it"
                },
                {
                    "storeType": null,
                    "symbolLeft": "SR",
                    "rateInfo": [
                        {
                            "rateType": 1,
                            "rate": 3.753754,
                            "fixedRate": 38.00000000,
                            "symbolLeft": "SR",
                            "symbolRight": "",
                            "currency": "SAR"
                        }
                    ],
                    "siteName": "SHEIN阿拉伯站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "沙特阿拉伯文",
                            "sort": null,
                            "abbr": "ar-sa"
                        },
                        {
                            "isAvailable": null,
                            "name": "阿拉伯语",
                            "sort": null,
                            "abbr": "ar"
                        }
                    ],
                    "currency": "SAR",
                    "siteAbbr": "shein-ar"
                },
                {
                    "storeType": null,
                    "symbolLeft": "NT$",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 32.467532,
                            "fixedRate": 0E-8,
                            "symbolLeft": "NT$",
                            "symbolRight": "",
                            "currency": "TWD"
                        }
                    ],
                    "siteName": "SHEIN台湾站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "台湾",
                            "sort": null,
                            "abbr": "zh-tw1"
                        }
                    ],
                    "currency": "TWD",
                    "siteAbbr": "shein-tw"
                },
                {
                    "storeType": null,
                    "symbolLeft": "$",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 1.000000,
                            "fixedRate": 0E-8,
                            "symbolLeft": "$",
                            "symbolRight": "",
                            "currency": "USD"
                        }
                    ],
                    "siteName": "SHEIN美国站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "美式英语",
                            "sort": null,
                            "abbr": "en-us"
                        },
                        {
                            "isAvailable": null,
                            "name": "西班牙语",
                            "sort": null,
                            "abbr": "es"
                        },
                        {
                            "isAvailable": null,
                            "name": "西班牙文",
                            "sort": null,
                            "abbr": "es-es"
                        },
                        {
                            "isAvailable": null,
                            "name": "英语",
                            "sort": null,
                            "abbr": "en"
                        },
                        {
                            "isAvailable": null,
                            "name": "德国德文",
                            "sort": null,
                            "abbr": "de-de"
                        }
                    ],
                    "currency": "USD",
                    "siteAbbr": "shein-us"
                },
                {
                    "storeType": null,
                    "symbolLeft": "GBP£",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 0.809061,
                            "fixedRate": 0E-8,
                            "symbolLeft": "GBP£",
                            "symbolRight": "",
                            "currency": "GBP"
                        }
                    ],
                    "siteName": "SHEIN英国站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "美式英语",
                            "sort": null,
                            "abbr": "en-us"
                        }
                    ],
                    "currency": "GBP",
                    "siteAbbr": "shein-uk"
                },
                {
                    "storeType": null,
                    "symbolLeft": "AU$",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 1.557147,
                            "fixedRate": 0E-8,
                            "symbolLeft": "AU$",
                            "symbolRight": "",
                            "currency": "AUD"
                        }
                    ],
                    "siteName": "SHEIN澳大利亚站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "美式英语",
                            "sort": null,
                            "abbr": "en-us"
                        }
                    ],
                    "currency": "AUD",
                    "siteAbbr": "shein-au"
                },
                {
                    "storeType": null,
                    "symbolLeft": "₹",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 83.612040,
                            "fixedRate": 0E-8,
                            "symbolLeft": "₹",
                            "symbolRight": "",
                            "currency": "INR"
                        }
                    ],
                    "siteName": "SHEIN印度站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "美式英语",
                            "sort": null,
                            "abbr": "en-us"
                        }
                    ],
                    "currency": "INR",
                    "siteAbbr": "shein-in"
                },
                {
                    "storeType": null,
                    "symbolLeft": "$",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 1.000000,
                            "fixedRate": 0E-8,
                            "symbolLeft": "$",
                            "symbolRight": "",
                            "currency": "USD"
                        }
                    ],
                    "siteName": "shein美国清仓站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "美式英语",
                            "sort": null,
                            "abbr": "en-us"
                        }
                    ],
                    "currency": "USD",
                    "siteAbbr": "shein-sus"
                },
                {
                    "storeType": null,
                    "symbolLeft": "$MXN",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 16.806723,
                            "fixedRate": 21.00000000,
                            "symbolLeft": "$MXN",
                            "symbolRight": "",
                            "currency": "MXN"
                        }
                    ],
                    "siteName": "SHEIN墨西哥站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "美式英语",
                            "sort": null,
                            "abbr": "en-us"
                        },
                        {
                            "isAvailable": null,
                            "name": "西班牙文",
                            "sort": null,
                            "abbr": "es-es"
                        }
                    ],
                    "currency": "MXN",
                    "siteAbbr": "shein-mx"
                },
                {
                    "storeType": null,
                    "symbolLeft": "SR",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 3.753754,
                            "fixedRate": 0E-8,
                            "symbolLeft": "SR",
                            "symbolRight": "",
                            "currency": "SAR"
                        }
                    ],
                    "siteName": "SHEIN沙特阿拉伯站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "美式英语",
                            "sort": null,
                            "abbr": "en-us"
                        },
                        {
                            "isAvailable": null,
                            "name": "沙特阿拉伯文",
                            "sort": null,
                            "abbr": "ar-sa"
                        }
                    ],
                    "currency": "SAR",
                    "siteAbbr": "shein-sa"
                },
                {
                    "storeType": null,
                    "symbolLeft": "KWD",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 0.308791,
                            "fixedRate": 0E-8,
                            "symbolLeft": "KWD",
                            "symbolRight": "",
                            "currency": "KWD"
                        }
                    ],
                    "siteName": "SHEIN科威特站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "美式英语",
                            "sort": null,
                            "abbr": "en-us"
                        },
                        {
                            "isAvailable": null,
                            "name": "沙特阿拉伯文",
                            "sort": null,
                            "abbr": "ar-sa"
                        }
                    ],
                    "currency": "KWD",
                    "siteAbbr": "shein-kw"
                },
                {
                    "storeType": null,
                    "symbolLeft": "AED",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 3.672825,
                            "fixedRate": 0E-8,
                            "symbolLeft": "AED",
                            "symbolRight": "",
                            "currency": "AED"
                        }
                    ],
                    "siteName": "SHEIN阿联酋站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "美式英语",
                            "sort": null,
                            "abbr": "en-us"
                        },
                        {
                            "isAvailable": null,
                            "name": "沙特阿拉伯文",
                            "sort": null,
                            "abbr": "ar-sa"
                        }
                    ],
                    "currency": "AED",
                    "siteAbbr": "shein-ae"
                },
                {
                    "storeType": null,
                    "symbolLeft": "QR",
                    "rateInfo": [
                        {
                            "rateType": 1,
                            "rate": 3.696721,
                            "fixedRate": 3.65000000,
                            "symbolLeft": "QR",
                            "symbolRight": "RQ",
                            "currency": "QAR"
                        }
                    ],
                    "siteName": "SHEIN卡塔尔站",
                    "symbolRight": "RQ",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "美式英语",
                            "sort": null,
                            "abbr": "en-us"
                        },
                        {
                            "isAvailable": null,
                            "name": "沙特阿拉伯文",
                            "sort": null,
                            "abbr": "ar-sa"
                        }
                    ],
                    "currency": "QAR",
                    "siteAbbr": "shein-qa"
                },
                {
                    "storeType": null,
                    "symbolLeft": "OM",
                    "rateInfo": [
                        {
                            "rateType": 0,
                            "rate": 0.385986,
                            "fixedRate": 0E-8,
                            "symbolLeft": "OM",
                            "symbolRight": "",
                            "currency": "OMR"
                        }
                    ],
                    "siteName": "SHEIN阿曼站",
                    "symbolRight": "",
                    "siteLanguageList": [
                        {
                            "isAvailable": null,
                            "name": "美式英语",
                            "sort": null,
                            "abbr": "en-us"
                        },
                        {
                            "isAvailable": null,
                            "name": "沙特阿拉伯文",
                            "sort": null,
                            "abbr": "ar-sa"
                        }
                    ],
                    "currency": "OMR",
                    "siteAbbr": "shein-om"
                },
                
            ]
        }
    ]
}
```

---

## Query full brand information

> **Official docs**: [Query full brand information](https://open.sheincorp.com/documents/apidoc/detail/3001255)

**Method**: `GET` &nbsp; **Path**: `/goods-brand/whole-brands`


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `page_num` | integer | No | page number |
| `page_size` | integer | No | Number of single pages, maximum no more than 400 |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `code` | string | Yes |
| `info` | object | No |
| `data` | object[] | No |
| `brand_code` | string | No |
| `brand_name` | string | No |
| `meta` | object | No |
| `count` | integer | No |
| `customObj` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods-brand/whole-brands' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "pageNum": 1, "pageSize": 10
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
                "brand_code": "24kzh",
                "brand_name": "Vailonliss"
            },
            {
                "brand_code": "2wz6m",
                "brand_name": "MIA MAKEUP"
            },
            {
                "brand_code": "32unv",
                "brand_name": "RDL"
            },
            {
                "brand_code": "2k861",
                "brand_name": "Adidas Originals"
            },
            {
                "brand_code": "2bamm",
                "brand_name": "LEGO"
            },
            {
                "brand_code": "2au82",
                "brand_name": ""
            },
            {
                "brand_code": "2pz5p",
                "brand_name": "LINKOOL"
            },
            {
                "brand_code": "2m4z4",
                "brand_name": "Snoya"
            },
            {
                "brand_code": "37l7q",
                "brand_name": "Important Store"
            },
            {
                "brand_code": "3e86g",
                "brand_name": "Homy Goods"
            }
        ],
        "meta": {
            "count": 10,
            "customObj": null
        }
    },
    "bbl": null
}
```

---

## Get the list of IPs available for the store

> **Official docs**: [Get the list of IPs available for the store](https://open.sheincorp.com/documents/apidoc/detail/3001513)

**Method**: `POST` &nbsp; **Path**: `/goods/query-ip-list`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pageSize` | integer | Yes | Number per page, the maximum number per page is 200 |
| `idMax` | bigint | Yes | The largest id returned in the last query result, idMax. Please enter 0 for the first query. |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | No |
| `count` | integer | Yes |
| `idMax` | integer | Yes |
| `list` | object[] | No |
| `id` | bigint | No |
| `merchantExternalId` | bigint | No |
| `ipId` | bigint | No |
| `ipName` | string | No |
| `ipNameCn` | string | No |
| `ipGroupId` | bigint | No |
| `ipGroupName` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'http://openapi-test01.sheincorp.cn/open-api/goods/query-ip-list' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1766633364428' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "pageSize":200,
    "idMax":0
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "count": 1,
        "idMax": 112093,
        "list": [
            {
                "id": 112093,
                "merchantExternalId": 38109363,
                "merchantSource": 10,
                "ipId": 39425,
                "ipName": "Mickey Mouse",
                "ipNameCn": "米老鼠",
                "ipGroupId": 258,
                "ipGroupName": "迪士尼"
            }
        ]
    },
    "bbl": null,
    "traceId": "6d6a201432ebcf87"
}
```

---

## Get the list of discuss prices

> **Official docs**: [Get the list of discuss prices](https://open.sheincorp.com/documents/apidoc/detail/3001560)

**Method**: `POST` &nbsp; **Path**: `/goods/discuss/query-discuss-list`

**Applicable to**: Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `discussStatus` | integer | No | Bargaining order status,。 1:Pending merchant confirmation 2:Pending platform review 3:Accept bargaining 4:Do not accept bargaining 5:Bargaining terminated-Successful 6:Bargaining terminated-Failed |
| `pageNum` | integer | Yes | Number of pages. It is recommended to start querying from 1 |
| `pageSize` | integer | Yes | Number of items per page, up to 200 per page |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `info` | object | Yes |
| `count` | integer | No |
| `data` | object[] | Yes |
| `allPicUrls` | string[] | No |
| `appealCount` | integer | No |
| `appealReason` | string | No |
| `discussSn` | string | No |
| `discussStatus` | integer | No |
| `discussType` | integer | No |
| `fileUploadList` | object[] | Yes |
| `file_name` | string | No |
| `object_key` | string | No |
| `type` | integer | No |
| `url` | string | No |
| `isSizeSamePrice` | integer | No |
| `mainPicUrl` | string | No |
| `productTitle` | string | No |
| `reason` | string | No |
| `saleAttributeValue` | string | No |
| `serialNumber` | integer | No |
| `skcName` | string | No |
| `skuCostPrices` | object[] | Yes |
| `costPriceHistories` | object[] | Yes |
| `costPrice` | double | No |
| `currency` | string | No |
| `serialNumber` | integer | No |
| `latestCostPrice` | double | No |
| `saleAttributeValues` | string[] | No |
| `skuCode` | string | No |
| `suggestCostCurrency` | string | No |
| `suggestCostPrice` | double | No |
| `spuName` | string | No |
| `supplierCode` | string | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'http://openapi-test01.sheincorp.cn/open-api/goods/discuss/query-discuss-list' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1762494208230' \
--header 'language: US' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
  "discussStatus":"",
  "pageNum":1,
  "pageSize":10
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
                "discussSn": "YJ30251107172948307968",
                "discussStatus": 1,
                "spuName": "s2501228549",
                "skcName": "ss25012285492844",
                "supplierCode": "1234287-westmonth-481.1",
                "productTitle": "SRAH'SHOPEELHOE Electric Anti-Wrinkle Eye Cream Lifting Firming Moisturizing Reducing Fine Lines Eye Bags Dark Circles Eye Care11999888",
                "saleAttributeValue": "Army Green",
                "mainPicUrl": "https://img.ltwebstatic.com/images3_spmp/2024/11/29/be/1732860076c6e0d55b84433a061ae2bd3aaf18473b_square.jpg",
                "allPicUrls": [
                    "https://img.ltwebstatic.com/images3_spmp/2024/11/29/be/1732860076c6e0d55b84433a061ae2bd3aaf18473b_square.jpg",
                    "https://img.ltwebstatic.com/images3_spmp/2025/01/22/cc/17375297668e8a6193029f772d9da4244cb673da92_square.jpg",
                    "https://img.ltwebstatic.com/images3_spmp/2025/01/22/1e/1737529770d0eff71f021c0216ab5382199a89b6bb_square.jpg",
                    "https://img.ltwebstatic.com/images3_spmp/2025/01/22/e7/173752977548b263cd797420d7d4e9c5a596bdcf6f_square.jpg",
                    "https://imgdeal-test01.shein.com/images3_pi/2025/01/22/00/17375297821232599685_square.jpeg",
                    "https://imgdeal-test01.shein.com/images3_pi/2025/01/22/a6/17375297844286045663_square.jpeg",
                    "https://imgdeal-test01.shein.com/images3_pi/2025/01/22/26/17375297872895279191_square.jpeg",
                    "https://img.ltwebstatic.com/images3_spmp/2024/11/29/be/1732860076c6e0d55b84433a061ae2bd3aaf18473b_square.jpg",
                    "https://img.ltwebstatic.com/images3_spmp/2025/01/21/58/17374406563ab9ef9bf71874ee0a3a6697fedc29fe.jpg",
                    "https://img.ltwebstatic.com/images3_spmp/2025/01/21/c8/1737440653da9e412d426641d7950bce6e8d3cc529_square.jpg",
                    "https://imgdeal-test01.shein.com/images3_pi/2025/01/22/5b/17375297893352422689.jpeg",
                    "https://img.ltwebstatic.com/images3_spmp/2024/11/29/09/17328677228845557c7afea1dfb5673220d7e8a72b.jpg"
                ],
                "serialNumber": 2,
                "skuCostPrices": [
                    {
                        "skuCode": "I4ajkf1r3xrs",
                        "saleAttributeValues": [],
                        "costPriceHistories": [
                            {
                                "serialNumber": 0,
                                "costPrice": 481.1,
                                "currency": "EUR"
                            },
                            {
                                "serialNumber": 1,
                                "costPrice": 480.0,
                                "currency": "EUR"
                            }
                        ],
                        "suggestCostPrice": 280.0,
                        "suggestCostCurrency": "EUR",
                        "latestCostPrice": 480.0
                    }
                ],
                "discussType": 3,
                "appealReason": "",
                "appealCount": 3,
                "fileUploadList": null,
                "reason": null,
                "isSizeSamePrice": 0
            },
            {
                "discussSn": "YJ30251107169517383680",
                "discussStatus": 1,
                "spuName": "f250606571555",
                "skcName": "sf25060657155599136",
                "supplierCode": "C3OGFO-TTP8UV-Y2IE9K",
                "productTitle": "shein",
                "saleAttributeValue": "tight",
                "mainPicUrl": "https://imgdeal-test01.shein.com/v4/j/pi/2025/06/06/32/1749190480c43a1f8a66b2ae3ce659dba397531431_square.jpg",
                "allPicUrls": [
                    "https://imgdeal-test01.shein.com/v4/j/pi/2025/06/06/32/1749190480c43a1f8a66b2ae3ce659dba397531431_square.jpg",
                    "https://imgdeal-test01.shein.com/v4/j/pi/2025/06/06/5f/17491904828572b894374054d55304cf37a943c75c_square.jpg",
                    "https://imgdeal-test01.shein.com/v4/p/pi/2025/06/06/78/174919048333ee43378e1afdcd591559215de743c4_square.png",
                    "https://imgdeal-test01.shein.com/v4/j/pi/2025/06/06/7f/1749190484babc7fda118a3fe5151cf0a00529aec3_square.jpg",
                    "https://imgdeal-test01.shein.com/v4/j/pi/2025/06/06/47/1749190489b161ef52b8519e11190b229d77ce4da4_square.jpg",
                    "https://imgdeal-test01.shein.com/v4/p/pi/2025/06/06/4f/17491904911f230b051303efbca75ef381297f3825_square.png",
                    "https://imgdeal-test01.shein.com/v4/j/pi/2025/06/06/24/1749190491ea920fab83ea4bc6d7c5fa5d06bb7e7f_square.jpg"
                ],
                "serialNumber": 1,
                "skuCostPrices": [
                    {
                        "skuCode": "I84mm55j5vwd",
                        "saleAttributeValues": [
                            "Flowers"
                        ],
                        "costPriceHistories": [
                            {
                                "serialNumber": 0,
                                "costPrice": 1.0,
                                "currency": "EUR"
                            }
                        ],
                        "suggestCostPrice": 0.01,
                        "suggestCostCurrency": "EUR",
                        "latestCostPrice": null
                    },
                    {
                        "skuCode": "I84mm55j6dc5",
                        "saleAttributeValues": [
                            "Print"
                        ],
                        "costPriceHistories": [
                            {
                                "serialNumber": 0,
                                "costPrice": 1.0,
                                "currency": "EUR"
                            }
                        ],
                        "suggestCostPrice": 0.01,
                        "suggestCostCurrency": "EUR",
                        "latestCostPrice": null
                    }
                ],
                "discussType": 3,
                "appealReason": "",
                "appealCount": 4,
                "fileUploadList": null,
                "reason": null,
                "isSizeSamePrice": 0
            },
            {
                "discussSn": "YJ30251107169332834304",
                "discussStatus": 1,
                "spuName": "f250606571555",
                "skcName": "sf25060657155510001",
                "supplierCode": "C3OGFO-TTP8UV-8OWXJP",
                "productTitle": "shein",
                "saleAttributeValue": "DYJ_ long sleeves",
                "mainPicUrl": "https://imgdeal-test01.shein.com/v4/j/pi/2025/06/06/32/1749190480c43a1f8a66b2ae3ce659dba397531431_square.jpg",
                "allPicUrls": [
                    "https://imgdeal-test01.shein.com/v4/j/pi/2025/06/06/32/1749190480c43a1f8a66b2ae3ce659dba397531431_square.jpg",
                    "https://imgdeal-test01.shein.com/v4/j/pi/2025/06/06/5f/17491904828572b894374054d55304cf37a943c75c_square.jpg",
                    "https://imgdeal-test01.shein.com/v4/p/pi/2025/06/06/78/174919048333ee43378e1afdcd591559215de743c4_square.png",
                    "https://imgdeal-test01.shein.com/v4/j/pi/2025/06/06/7f/1749190484babc7fda118a3fe5151cf0a00529aec3_square.jpg",
                    "https://imgdeal-test01.shein.com/v4/j/pi/2025/06/06/9d/17491904888cd6eda5353e7ac06aafd3f0b028e164_square.jpg"
                ],
                "serialNumber": 1,
                "skuCostPrices": [
                    {
                        "skuCode": "I84mm55j4qpu",
                        "saleAttributeValues": [
                            "Print"
                        ],
                        "costPriceHistories": [
                            {
                                "serialNumber": 0,
                                "costPrice": 1.0,
                                "currency": "EUR"
                            }
                        ],
                        "suggestCostPrice": 0.01,
                        "suggestCostCurrency": "EUR",
                        "latestCostPrice": null
                    },
                    {
                        "skuCode": "I84mm55j3ss0",
                        "saleAttributeValues": [
                            "Flowers"
                        ],
                        "costPriceHistories": [
                            {
                                "serialNumber": 0,
                                "costPrice": 1.0,
                                "currency": "EUR"
                            }
                        ],
                        "suggestCostPrice": 0.01,
                        "suggestCostCurrency": "EUR",
                        "latestCostPrice": null
                    }
                ],
                "discussType": 3,
                "appealReason": "",
                "appealCount": 4,
                "fileUploadList": null,
                "reason": null,
                "isSizeSamePrice": 0
            }
        ],
        "count": 3
    },
    "bbl": null,
    "traceId": "f2d4974508bd3d5b"
}
```

---

## Process discuss order

> **Official docs**: [Process discuss order](https://open.sheincorp.com/documents/apidoc/detail/3001614)

**Method**: `POST` &nbsp; **Path**: `/goods/discuss/process-discuss`

**Applicable to**: Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `confirmInfos` | object[] | No | When the bargaining order operation=【Agree to the platform's suggested price】or【Reject, give up listing】, please input parameters in this field。Note：Each bargaining order can only execute one operation, do not input parameters in confirmInfos、crea... |
| `discussAuditType` | string | Yes | Operation type1-Agree to the platform's suggested price； 2-Reject, give up listing |
| `discussSn` | string | Yes | Bargaining order numberOnly bargaining orders with discussStatus=1 (pending merchant confirmation) can use this interface call for processing。 |
| `createCostDiscusses` | object[] | No | When the bargaining order operation=【Requote】, please input parameters in this field。Note：Each bargaining order can only execute one operation, do not input parameters in confirmInfos、createCostDiscusses to execute multiple operations at the same ... |
| `discussSn` | string | Yes | Bargaining number。Only bargaining orders with discussStatus=1 (awaiting merchant confirmation) can use this interface call. |
| `discussStep` | integer | Yes | Number of rounds for the bargaining order。The number of times each bargaining order can communicate the price is limited, if the number=0, it means that a new quotation cannot be initiated again。Value logic=Obtain the bargaining order list interfa... |
| `fileUploadList` | object[] | No | Upload negotiation materials |
| `file_name` | string | No | Original file name (maintained by developer) |
| `object_key` | string | No | File key, generated by the platform, obtained after uploading the file through the interface /open-api/goods/discuss/upload-discuss-file |
| `type` | integer | No | File type. Only 1:Image is supported |
| `url` | string | No | File url, generated by the platform, obtained after uploading the file through the interface /open-api/goods/discuss/upload-discuss-file |
| `reason` | string | No | The seller fills in the reason for initiating the bargaining, up to 255 characters |
| `skcName` | string | Yes | Platform's skc code |
| `skuCostInfoList` | object[] | Yes | The list of SKU cost prices for initiating a bargain |
| `cost` | double | Yes | Cost price |
| `currency` | string | Yes | Currency |
| `lastCost` | double | Yes | The cost price of the last quotation.Value logic= Query the bargaining list API: /open-api/goods/discuss/query-discuss-list, in the response under "costPriceHistories", the cost price of the group with the largest "serialNumber" value (i.e., the p... |
| `lastCurrency` | string | Yes | The currency of the last quotation.Value logic= Query the bargaining list API: /open-api/goods/discuss/query-discuss-list, in the response under "costPriceHistories", the currency of the group with the largest "serialNumber" value |
| `skuCode` | string | Yes | The platform's SKU code |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `failCount` | integer | No |
| `successCount` | integer | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'http://openapi-test01.sheincorp.cn/open-api/goods/discuss/process-discuss' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1762495278098' \
--header 'language: US' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
  "createCostDiscusses": [
    {
      "discussSn": "YJ30251107172948307968",
      "discussStep": 2,
      "fileUploadList": [
        {
          "file_name": "test_file_name",
          "object_key": "rdpas251107-4299811744231955199.jpeg",
          "type": 1,
          "url": "https://fsproxy-test.ltwebstatic.com/dpas-test/dpas251107-4299811744231955199.jpeg?Expires=1762505860&Signature=6d389801c0dd26ab78ea1f3b2a0a8c3b&AccessKeyId=dpas"
        }
      ],
      "reason": "test reason",
      "skcName": "ss25012285492844",
      "skuCostInfoList": [
        {
          "cost": 400.00,
          "currency": "EUR",
          "lastCost": 480,
          "lastCurrency": "EUR",
          "skuCode": "I4ajkf1r3xrs"
        }
      ]
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
        "successCount": 1,
        "failCount": 0
    },
    "bbl": null,
    "traceId": "c6b789192a4e8eec"
}
```

---

## Upload document file for discuss order

> **Official docs**: [Upload document file for discuss order](https://open.sheincorp.com/documents/apidoc/detail/3001444)

**Method**: `POST` &nbsp; **Path**: `/goods/discuss/upload-discuss-file`

**Applicable to**: Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `file` | blob | Yes | Local files. Only images are supported, maximum size 10MB. |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | No |
| `msg` | string | No |
| `info` | object | Yes |
| `objectKey` | string | No |
| `url` | string | No |
| `bbl` | json | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/discuss/upload-discuss-file?type=1' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1762484930853' \
--header 'language: zh-cn' \
--header 'Host: openapi.sheincorp.com' \
--form 'file=@"cmMtdXBsb2FkLTE3NjI0MTQwMjE2MDktMg==/filename.jpg"'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "objectKey": "dpas251107-7150871783334178560.jpg",
        "url": "https://file.ltwebstatic.com/dpas-prod/dpas251107-7150871783334178560.jpg?Expires=1765076931&Signature=03cc841e17edf49f479ee3039c9c8f28&AccessKeyId=dpas"
    },
    "bbl": null,
    "traceId": "16d42bd414ac9f73"
}
```

---

## Check product certificate requirements and verification status

> **Official docs**: [Check product certificate requirements and verification status](https://open.sheincorp.com/documents/apidoc/detail/3001179)

**Method**: `POST` &nbsp; **Path**: `/goods/get-certificate-rule`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `attributeList` | object[] | No | Attribute array |
| `attributeId` | int64 | No | Common attribute ID of the product; attribute_type=4 attributes in the interface for communicating with the store4 attributes |
| `attributeValueId` | int64 | No | Common attribute value ID of the product; Common attribute ID of the product, attribute_type=4 values in the interface for communicating with the store4 attribute values |
| `categoryId` | int64 | No | Product's end-level category ID |
| `certificatePoolId` | int64[] | No | Certificate pool ID; obtainable by creating a certificate pool, can be used to check the current verification status of the certificate pool |
| `siteArrList` | string[] | No | Site information for product sales |
| `spuName` | string | No | SPU generated by the SHEIN platform, corresponding to the product publication's spu_name; It is recommended to use spu to query the necessary certificates for the product and the certificate review status |
| `systemId` | string | No | Source system: Fixed transmitted spmp |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `key` | string | No |
| `npid` | string | No |
| `tag` | string | No |
| `value` | string | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `data` | object[] | No |
| `certificateDimension` | integer | No |
| `certificateLabel` | string | No |
| `certificateMissStatus` | boolean | No |
| `certificatePoolList` | object[] | No |
| `auditStatus` | string | No |
| `certificateExpireStatus` | string | No |
| `certificatePoolFileList` | object[] | No |
| `certificateUrl` | string | No |
| `certificateUrlName` | string | No |
| `certificatePoolId` | int64 | No |
| `expireTime` | datetime | No |
| `pqmsCertificateSn` | string | No |
| `certificateTypeId` | int64 | No |
| `certificateTypeValue` | string | No |
| `fileModelUrl` | string | No |
| `isRequired` | boolean | No |
| `mergeSiteInfoList` | object[] | No |
| `mergeSiteName` | string | No |
| `subSiteList` | string[] | No |
| `otherSourceCertInfoList` | object[] | No |
| `auditStatus` | string | No |
| `certificateExpireStatus` | string | No |
| `certificatePoolFileList` | object[] | No |
| `certificateUrl` | string | No |
| `certificateUrlName` | string | No |
| `expireTime` | datetime | No |
| `pqmsCertificateSn` | string | No |
| `systemSource` | string | No |
| `selfCertificateList` | object[] | No |
| `certificateTypeId` | int64 | No |
| `certificateTypeName` | string | No |
| `meta` | object | No |
| `count` | integer | No |
| `customObj` | object | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/get-certificate-rule' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751009482524' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
  "spuName": "a250620506652"
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
        "certificateTypeId": 230,
        "mergeSiteInfoList": [
          {
            "mergeSiteName": "欧洲",
            "subSiteList": [
              "SHEIN西班牙站"
            ]
          }
        ],
        "certificateTypeValue": "EN ISO16321检测报告",
        "fileModelUrl": "",
        "certificateDimension": 1,
        "certificateLabel": 0,
        "certificateMissStatus": false,
        "isRequired": true,
        "certificatePoolList": [
          {
            "certificatePoolId": 8623835,
            "certificateExpireStatus": 1,
            "expireTime": "2029-11-12 00:00:00",
            "auditStatus": 3,
            "pqmsCertificateSn": "spmp202411150553014",
            "certificatePoolFileList": [
              {
                "certificateUrlName": "Doc.pdf",
                "certificateUrl": "https://lt-pqms.oss-cn-shenzhen.aliyuncs.com/gpc202411150038838.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250106T051757Z&X-Amz-SignedHeaders=host&X-Amz-Expires=431999&X-Amz-Credential=LTAI5tKvGuVMaYLBaMkpkiBr/20250106/oss-cn-shenzhen/s3/aws4_request&X-Amz-Signature=d29f718de41f5dd01555dadb89ddf22ad759917f6f31275a80dfa0ee39ebd407"
              }
            ]
          }
        ],
        "otherSourceCertInfoList": [],
        "selfCertificateList": []
      },
      {
        "certificateTypeId": 456,
        "mergeSiteInfoList": [
          {
            "mergeSiteName": "欧洲",
            "subSiteList": [
              "SHEIN西班牙站"
            ]
          }
        ],
        "certificateTypeValue": "GPSR欧盟责任人",
        "fileModelUrl": "",
        "certificateDimension": 1,
        "certificateLabel": 0,
        "certificateMissStatus": false,
        "isRequired": false,
        "certificatePoolList": [],
        "otherSourceCertInfoList": null,
        "selfCertificateList": []
      }
    ],
    "meta": {
      "count": 2,
      "customObj": null
    }
  },
  "bbl": null,
  "traceId": "d7e2b83cdbd786ec"
```

---

## Documents required to query the certificate (New)

> **Official docs**: [Documents required to query the certificate (New)](https://open.sheincorp.com/documents/apidoc/detail/3001476)

**Method**: `POST` &nbsp; **Path**: `/goods/certificate/get-all-certificate-type-list-v2`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


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
| `data` | object | No |
| `certificateTypeInfoList` | object[] | No |
| `certificateDimension` | integer | No |
| `certificateLabel` | string | No |
| `certificateType` | string | No |
| `certificateTypeId` | int64 | No |
| `fileModelUrl` | string | No |
| `isEnabled` | integer | No |
| `otherPresetInfoList` | object[] | No |
| `inputType` | integer | No |
| `isRequired` | integer | No |
| `presetId` | int64 | No |
| `presetName` | string | No |
| `presetRemark` | string | No |
| `presetValueList` | object[] | No |
| `presetValue` | string | No |
| `presetValueId` | int64 | No |
| `sourceFrom` | string | No |
| `unit` | string | No |
| `presetInfoList` | object[] | No |
| `inputType` | integer | No |
| `isRequired` | integer | No |
| `presetId` | int64 | No |
| `presetName` | string | No |
| `presetRemark` | string | No |
| `presetValueList` | object[] | No |
| `presetValue` | string | No |
| `presetValueId` | int64 | No |
| `unit` | string | No |
| `srmDetectionAgencyList` | object[] | No |
| `detectionAgency` | object | No |
| `detectionAgencyId` | int64 | No |
| `detectionAgencyName` | string | No |
| `laboratoryList` | object[] | No |
| `laboratoryId` | int64 | No |
| `laboratoryName` | string | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/certificate/get-all-certificate-type-list-v2' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751009366889' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "data": [
            {
                "certificateTypeId": 1,
                "certificateLabel": 1,
                "certificateType": "自符类型证书-01certificate_type_id1",
                "certificateDimension": 1,
                "fileModelUrl": "http://filetest.ltwebstatic.com/pqmsfile/2023/12/11/78/17022631422752902183.jpg",
                "isEnabled": 1,
                "srmDetectionAgencyList": null,
                "presetInfoList": [
                    {
                        "presetId": 230,
                        "presetName": "signing_method",
                        "presetRemark": "signing_methodpreset_name230",
                        "inputType": 1,
                        "unit": "",
                        "isRequired": 1,
                        "presetValueList": [
                            {
                                "presetValueId": 240108177,
                                "presetValue": "线上签署preset_value240108177"
                            },
                            {
                                "presetValueId": 240108176,
                                "presetValue": "本地上传preset_value240108176"
                            }
                        ]
                    },
                    {
                        "presetId": 232,
                        "presetName": "Certificate label",
                        "presetRemark": "Certificate labelpreset_name232",
                        "inputType": 2,
                        "unit": "",
                        "isRequired": 1,
                        "presetValueList": [
                            {
                                "presetValueId": 240108180,
                                "presetValue": "自符声明preset_value240108180"
                            }
                        ]
                    }
                ],
                "otherPresetInfoList": []
            },
            {
                "certificateTypeId": 2,
                "certificateLabel": 1,
                "certificateType": "自符类型证书-02certificate_type_id2",
                "certificateDimension": 1,
                "fileModelUrl": "",
                "isEnabled": 1,
                "srmDetectionAgencyList": null,
                "presetInfoList": [
                    {
                        "presetId": 232,
                        "presetName": "Certificate label",
                        "presetRemark": "Certificate labelpreset_name232",
                        "inputType": 2,
                        "unit": "",
                        "isRequired": 1,
                        "presetValueList": [
                            {
                                "presetValueId": 240108180,
                                "presetValue": "自符声明preset_value240108180"
                            }
                        ]
                    },
                    {
                        "presetId": 230,
                        "presetName": "signing_method",
                        "presetRemark": "signing_methodpreset_name230",
                        "inputType": 1,
                        "unit": "",
                        "isRequired": 1,
                        "presetValueList": [
                            {
                                "presetValueId": 240108176,
                                "presetValue": "本地上传preset_value240108176"
                            },
                            {
                                "presetValueId": 240108177,
                                "presetValue": "线上签署preset_value240108177"
                            }
                        ]
                    }
                ],
                "otherPresetInfoList": []
            },
            {
                "certificateTypeId": 3,
                "certificateLabel": 0,
                "certificateType": "我是证书类型id3certificate_type_id3",
                "certificateDimension": 1,
                "fileModelUrl": "",
                "isEnabled": 1,
                "srmDetectionAgencyList": null,
                "presetInfoList": [
                    {
                        "presetId": 213,
                        "presetName": "product_description",
                        "presetRemark": "product_descriptionpreset_name213",
                        "inputType": 3,
                        "unit": "",
                        "isRequired": 0,
                        "presetValueList": null
                    },
                    {
                        "presetId": 210,
                        "presetName": "testing_organization",
                        "presetRemark": "testing_organizationpreset_name210",
                        "inputType": 1,
                        "unit": "",
                        "isRequired": 0,
                        "presetValueList": [
                            {
                                "presetValueId": 240108094,
                                "presetValue": "ITSpreset_value240108094"
                            },
                            {
                                "presetValueId": 240108092,
                                "presetValue": "SGSpreset_value240108092"
                            },
                            {
                                "presetValueId": 240108093,
                                "presetValue": "BVpreset_value240108093"
                            }
                        ]
                    },
                    {
                        "presetId": 216,
                        "presetName": "certificate_effective_time",
                        "presetRemark": "certificate_effective_timepreset_name216",
                        "inputType": 4,
                        "unit": "",
                        "isRequired": 1,
                        "presetValueList": null
                    },
                    {
                        "presetId": 187,
                        "presetName": "Dangerous_goods_classification",
                        "presetRemark": "危险品分类",
                        "inputType": 1,
                        "unit": "",
                        "isRequired": 1,
                        "presetValueList": [
                            {
                                "presetValueId": 240094503,
                                "presetValue": "第一类（爆炸品）"
                            }
                        ]
                    }
                ],
                "otherPresetInfoList": [
                    {
                        "sourceFrom": "SRM",
                        "presetId": 229,
                        "presetName": "Testing organization",
                        "presetRemark": "Testing organizationpreset_name229",
                        "inputType": 1,
                        "unit": "",
                        "isRequired": 0,
                        "presetValueList": [
                            {
                                "presetValueId": 456549082,
                                "presetValue": "天津津检危险品技术品有限公司preset_value456549082"
                            },
                            {
                                "presetValueId": 456549074,
                                "presetValue": "检测项目变更机构55preset_value456549074"
                            },
                            {
                                "presetValueId": 456549060,
                                "presetValue": "新机构4preset_value456549060"
                            },
                            {
                                "presetValueId": 456549056,
                                "presetValue": "新机构3preset_value456549056"
                            },
                            {
                                "presetValueId": 456549052,
                                "presetValue": "新机构2preset_value456549052"
                            }
                        ]
                    }
                ]
            },
         ],
        "meta": {
            "count": 270,
            "customObj": null
        }
    },
    "bbl": null
}
```

---

## Upload certificate file

> **Official docs**: [Upload certificate file](https://open.sheincorp.com/documents/apidoc/detail/3001180)

**Method**: `POST` &nbsp; **Path**: `/goods/upload-certificate-file`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `file` | string | Yes | file; single file upload within 20MB, in PDF/PNG/JPG/JPEG format |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `key` | string | No |
| `npid` | string | No |
| `tag` | string | No |
| `value` | string | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `certificateUrl` | string | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/upload-certificate-file' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751009780680' \
--header 'language: zh-cn' \
--header 'Host: openapi.sheincorp.com' \
--form 'file=@"cmMtdXBsb2FkLTE3NTA4MzM4OTk3NzgtMTY=/test file.jpeg"'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "certificateUrl": "https://pqms-1259571579.cos.ap-nanjing.myqcloud.com/gpc2905843696225904640.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250627T073621Z&X-Amz-SignedHeaders=host&X-Amz-Expires=432000&X-Amz-Credential=AKIDIPGrBE0VjgOpztXu1sSmqnY5NPBiz1nJ/20250627/ap-nanjing/s3/aws4_request&X-Amz-Signature=228e2d5c60193375b823ea28ab7b2524ebec2965a248793925d92abcf6e6fe40",
        "imageMd5": "1706e04c14c7d08d16f788327d9cea4a"
    },
    "bbl": null,
    "traceId": "6d46a5a85bbe5869"
}
```

---

## Create/edit product certificate pool

> **Official docs**: [Create/edit product certificate pool](https://open.sheincorp.com/documents/apidoc/detail/3001477)

**Method**: `POST` &nbsp; **Path**: `/goods/save-or-update-certificate-pool`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `certificatePoolId` | int64 | No | Certificate pool id |
| `certificateRelationInfoList` | object[] | No | Certificate related fields mainly include: certificate number/certificate update alert time/product name/battery signal/certificate validity period etc. |
| `certificateRelationNameId` | int64 | No | Related field names Testing agency/certificate number/certificate update alert time/product name/battery signal/certificate validity period etc. |
| `certificateRelationValue` | string | No | When the inputType is 3 or 4, custom values required for the certificate field should be entered in this field. Date format example: 2025-01-01 00:00:00 |
| `certificateRelationValueId` | int64 | No | Related field values |
| `certificateTypeId` | int64 | Yes | Certificate type id 注意：certificateTypeId=844（Product identifier）is currently not supported for upload via API, please filter this type of certificate. |
| `certificateUrl` | string | Yes | Certificate file address |
| `certificateUrlName` | string | Yes | Certificate file name |
| `otherCertificateRelationInfoList` | object[] | No | External certificate related field |
| `certificateRelationNameId` | int64 | No | Related field names Testing agency/certificate number/certificate update alert time/product name/battery signal/certificate validity period etc. |
| `certificateRelationValue` | string | No | When the inputType is 3 or 4, custom values required for the certificate field should be entered in this field. Date format example: 2025-01-01 00:00:00 |
| `certificateRelationValueId` | int64 | No | Related field values |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `key` | string | No |
| `npid` | string | No |
| `tag` | string | No |
| `value` | string | No |
| `npid` | string | No |
| `code` | string | Yes |
| `info` | object | No |
| `certificatePoolId` | int64 | No |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/save-or-update-certificate-pool' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751010107986' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
  "certificateRelationInfoList": [
    {
      "certificateRelationNameId": 2147483696,
      "certificateRelationValue": "",
      "certificateRelationValueId": 2147483746
    }
  ],
  "certificateTypeId": 4,
  "certificateUrl": "https://pqms-1259571579.cos.ap-nanjing.myqcloud.com/gpc202401103648636.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240110T061443Z&X-Amz-SignedHeaders=host&X-Amz-Expires=431999&X-Amz-Credential=AKIDIPGrBE0VjgOpztXu1sSmqnY5NPBiz1nJ/20240110/ap-nanjing/s3/aws4_request&X-Amz-Signature=e83cf7132554570790546c4c8d90eb9e0a91a3866af84574ff7284ceb5e4f8bd",
  "certificateUrlName": "test.jpeg",
  "otherCertificateRelationInfoList": []
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "certificatePoolId": 7781
    },
    "bbl": null
}
```

---

## Create/edit shop certificate pool

> **Official docs**: [Create/edit shop certificate pool](https://open.sheincorp.com/documents/apidoc/detail/3001182)

**Method**: `POST` &nbsp; **Path**: `/goods/save-or-update-supplier-certificate`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `certificatePoolId` | int64 | No | Certificate pool id, if passed this value then updates, if not passed default is to add new |
| `certificateTypeId` | int64 | Yes | Certificate type ID |
| `certificateUrl` | string | Yes | Certificate file address |
| `certificateUrlName` | string | Yes | Certificate file name |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `key` | string | No |
| `npid` | string | No |
| `tag` | string | No |
| `value` | string | No |
| `npid` | string | No |
| `code` | string | Yes |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/save-or-update-supplier-certificate' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751010644959' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
    "certificatePoolId": 7108,
    "certificateTypeId": 135,
    "certificateUrl": "https://pqms-1259571579.cos.ap-nanjing.myqcloud.com/gpc202401111845086.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240111T020804Z&X-Amz-SignedHeaders=host&X-Amz-Expires=431999&X-Amz-Credential=AKIDIPGrBE0VjgOpztXu1sSmqnY5NPBiz1nJ/20240111/ap-nanjing/s3/aws4_request&X-Amz-Signature=b4d6b45148b51c934bed41e0547b7c586737d7bf71061dc4475eabfe77f420a3",
    "certificateUrlName": "16952760533746985150.jpeg"
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": null,
    "bbl": null
}
```

---

## SKC bind product certificate pool

> **Official docs**: [SKC bind product certificate pool](https://open.sheincorp.com/documents/apidoc/detail/3001183)

**Method**: `POST` &nbsp; **Path**: `/goods/save-certificate-pool-skc-bind`

**Applicable to**: Self-operated, Fully-managed, Semi-managed, POP


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skcCertificatePoolRelationList` | object[] | Yes | Collection of SKC and certificate pool certificate binding relationships |
| `certificatePoolIdList` | int64[] | Yes | Certificate pool ID collection |
| `skcName` | string | Yes | SKC generated by SHEIN platform, corresponding product's published skc_name |
| `spuName` | string | Yes | SPU generated by SHEIN platform, corresponding product's published spu_name |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `bbl` | object | No |
| `info` | object | No |
| `*` | object[] | No |
| `key` | string | No |
| `npid` | string | No |
| `tag` | string | No |
| `value` | string | No |
| `npid` | string | No |
| `code` | string | Yes |
| `msg` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi.sheincorp.com/open-api/goods/save-certificate-pool-skc-bind' \
--header 'x-lt-signature: test' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-timestamp: 1751010761337' \
--header 'language: zh-cn' \
--header 'Content-Type: application/json' \
--header 'Host: openapi.sheincorp.com' \
--data-raw '{
  "skcCertificatePoolRelationList": [
    {
      "spuName": "s2409195445",
      "skcName": "ss24091954454649",
      "certificatePoolIdList": [
        9867,
        9817
      ]
    },
    {
      "spuName": "s2409199897",
      "skcName": "ss24091998977394",
      "certificatePoolIdList": [
        9867,
        9817
      ]
    }
  ]
}'
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": null,
    "bbl": null
}
```

---

## Commodity interface - obtain SKC and size in batches according to the barcode

> **Official docs**: [Commodity interface - obtain SKC and size in batches according to the barcode](https://open.sheincorp.com/documents/apidoc/detail/3001485)

**Method**: `POST` &nbsp; **Path**: `/goods/batch-skc-size`

**Applicable to**: Fully-managed, Shein-operated


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `data` | string[] | Yes | Product barcode array |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | double | No |
| `msg` | string | No |
| `info` | object | No |
| `key` | object | No |
| `skc` | string | No |
| `size` | string | No |
| `sku_code` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/batch-skc-size' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
    "data": [
        "1001251036",
        "1001251037",
        "1001251040",
        "1001251042",
        "S521121-1Y",
        "S420866-86I"
    ]
}'
```

### Response Example

```json
{
    "code": 0,
    "msg": "接口请求成功",
    "info": {
        "S420866-86I": {
            "skc": "dress171226321",
            "size": "1XL",
            "sku_code": "I2fmtzyqyrlh"
        },
        "1001251042": {
            "skc": "ss23111007205737",
            "size": "43",
            "sku_code": "I83q8737u0r6"
        },
        "1001251036": {
            "skc": "s23111033121496",
            "size": "90D",
            "sku_code": "I83q7zm3axla"
        },
        "1001251037": {
            "skc": "s23111033121496",
            "size": "75A",
            "sku_code": "I83q7zm3c5db"
        },
        "S521121-1Y": {
            "skc": "tee180628702",
            "size": "XS",
            "sku_code": ""
        },
        "1001251040": {
            "skc": "ss23111007205737",
            "size": "75A",
            "sku_code": "I83q8737spbk"
        }
    }
}
```

---

## Commodity interface - full query SKC/SKU/design model number relationship list

> **Official docs**: [Commodity interface - full query SKC/SKU/design model number relationship list](https://open.sheincorp.com/documents/apidoc/detail/3001486)

**Method**: `GET` &nbsp; **Path**: `/goods/number-list`

**Applicable to**: Fully-managed, Shein-operated


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `page` | integer | Yes | page number |
| `per_page` | integer | Yes | The amount of data per page, the maximum value is 100 |
| `type` | integer | Yes | Number query type enum. 1: skc, 2: design number design_code, it is recommended to enter parameter 1, enter parameter 2 in some scenarios the data may not exist |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | integer | No |
| `msg` | string | No |
| `info` | object | Yes |
| `page` | integer | No |
| `per_page` | integer | No |
| `count` | integer | No |
| `list` | object[] | Yes |
| `skc` | string | No |
| `sku_code` | string | No |
| `supplier_sku` | string | No |
| `design_code` | string | No |
| `attribute` | string | No |
| `traceId` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/number-list?page=1&per_page=100&type=1' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw ''
```

### Response Example

```json
{
    "code": "0",
    "msg": "OK",
    "info": {
        "page": 1,
        "per_page": 100,
        "count": 1960,
        "list": [
            {
                "skc": "ss23111525874412",
                "supplier_sku": "",
                "design_code": "",
                "sku_code": "I3eu5zp1payu",
                "attribute": "XL-3"
            },
            {
                "skc": "ss23111525874412",
                "supplier_sku": "",
                "design_code": "",
                "sku_code": "I3eu5zp1puhu",
                "attribute": "XL-2pc"
            },
            {
                "skc": "ss23111525874412",
                "supplier_sku": "",
                "design_code": "",
                "sku_code": "I3eu5zp1qbm2",
                "attribute": "XL-4pcs"
            },
            {
                "skc": "ss23111525874412",
                "supplier_sku": "",
                "design_code": "",
                "sku_code": "I3eu5zp1qvhh",
                "attribute": "XL-ww"
            },
            {
                "skc": "ss23111594783030",
                "supplier_sku": "",
                "design_code": "",
                "sku_code": "I14ly1k1jfj7",
                "attribute": "XL-qqqqw"
            },
            {
                "skc": "ss23111594783030",
                "supplier_sku": "",
                "design_code": "",
                "sku_code": "I3eu4ni3200b",
                "attribute": "XL-ww"
            },
            {
                "skc": "ss23111594783030",
                "supplier_sku": "",
                "design_code": "",
                "sku_code": "I3eu4ni32ffa",
                "attribute": "XL-3"
            },
            {
                "skc": "ss23111594783030",
                "supplier_sku": "",
                "design_code": "",
                "sku_code": "I3eu4ni32uep",
                "attribute": "XL-2pc"
            },
            {
                "skc": "ss23111594783030",
                "supplier_sku": "",
                "design
```

---

## Product withdrawal

> **Official docs**: [Product withdrawal](https://open.sheincorp.com/documents/apidoc/detail/3001259)

**Method**: `POST` &nbsp; **Path**: `/goods/revoke-product`

**Applicable to**: Self-operated, Fully-managed, Semi-managed


### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `spuName` | string | Yes | spuName, spuName returned after successful product release |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Yes |
| `info` | object | No |
| `failCount` | integer | No |
| `failList` | object[] | No |
| `documentSn` | string | No |
| `msg` | string | No |
| `skcName` | string | No |
| `successCount` | integer | No |
| `successList` | object[] | No |
| `documentSn` | string | No |
| `skcName` | string | No |
| `total` | integer | No |
| `msg` | string | No |

### Request Example

```bash
curl --location --request POST 'https://openapi-test01.sheincorp.cn/open-api/goods/revoke-product' \
--header 'language: zh-cn' \
--header 'x-lt-openKeyId: test' \
--header 'x-lt-signature: test' \
--header 'x-lt-timestamp: 1752733538805' \
--header 'Content-Type: application/json' \
--header 'Host: openapi-test01.sheincorp.cn' \
--data-raw '{
   "spuName": "s2502064450"
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
"documentSn": "SPMPA420250211000105",
"skcName": "ss25021193534484"
            },
            {
"documentSn": "SPMPA420250211000104",
"skcName": "ss25021193538318"
            }
        ],
"failList": [],
"total": 2,
"successCount": 2,
"failCount": 0
    },
"bbl": null,
"traceId": "c5374300f0a2e5f4"
}
```

---
