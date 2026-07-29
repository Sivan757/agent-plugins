# Temu API文档离线镜像

Captured at: 2026-06-17T05:08:50.202Z
Source catalog: https://agentpartner.temu.com/document?cataId=875198836203
Documents: 209

## 使用方式

- 先用 `rg` 在本目录搜索接口名、docId、字段名或流程关键词。
- 只读取命中的具体 Markdown 文件；不要一次性加载整个镜像。
- 文档示例中的 `app_key`、`access_token`、`app_secret`、`sign` 和临时签名查询串已脱敏。
- 生产发布、库存、价格、物流等写操作仍需重新确认当前线上文档和用户授权。

## 文档索引

### 【必读】PA网关

- [PA网关调用说明](api/01-必读-PA网关/01-929750644349-PA网关调用说明.md)

### 货品API组

- [bg.goods.add](api/02-货品API组/01-875202591662-bg.goods.add.md) - 上传供应商货品
- [bg.goods.topselling.soldout.get](api/02-货品API组/02-877295850607-bg.goods.topselling.soldout.get.md) - 批量查询爆款售罄商品
- [bg.product.search](api/02-货品API组/03-877297510235-bg.product.search.md) - 查询货品生命周期状态
- [bg.goods.brand.get](api/02-货品API组/04-877298892663-bg.goods.brand.get.md) - 货品品牌查询
- [bg.goods.suggest.supplyprice.get](api/02-货品API组/05-877300301642-bg.goods.suggest.supplyprice.get.md) - 查询建议申报参考价
- [bg.goods.detail.get](api/02-货品API组/06-887778895107-bg.goods.detail.get.md) - 商品详情查询接口
- [bg.goods.list.get](api/02-货品API组/07-899313688269-bg.goods.list.get.md) - 商品列表查询
- [bg.goods.migrate](api/02-货品API组/08-902459443915-bg.goods.migrate.md) - 货品搬运接口
- [bg.goods.warehouse.list.get](api/02-货品API组/09-905604741223-bg.goods.warehouse.list.get.md) - 根据站点查询可绑定的发货仓库信息接口
- [bg.logistics.template.get](api/02-货品API组/10-906654082572-bg.logistics.template.get.md) - 查询运费模板列表
- [bg.goods.file.upload](api/02-货品API组/11-911895868661-bg.goods.file.upload.md) - 货品文件上传接口
- [bg.goods.customs.property.check](api/02-货品API组/12-921334459989-bg.goods.customs.property.check.md) - 货品清关属性校验接口
- [货品发布样例](api/02-货品API组/13-909798859447-货品发布样例.md)

### 货品API组-PA

- [bg.glo.goods.add](api/03-货品API组-PA/01-925526695187-bg.glo.goods.add.md) - 上传供应商货品
- [bg.glo.goods.list.get](api/03-货品API组-PA/02-924479235154-bg.glo.goods.list.get.md) - 商品列表查询
- [bg.glo.goods.migrate](api/03-货品API组-PA/04-924481089321-bg.glo.goods.migrate.md) - 货品搬运接口
- [bg.glo.goods.topselling.soldout.get](api/03-货品API组-PA/05-924481378182-bg.glo.goods.topselling.soldout.get.md) - 批量查询爆款售罄商品
- [bg.btg.goods.stock.warehouse.list.get](api/03-货品API组-PA/06-931823464808-bg.btg.goods.stock.warehouse.list.get.md) - 根据站点查询可绑定的发货仓库信息接口
- [bg.glo.product.search](api/03-货品API组-PA/07-931835549486-bg.glo.product.search.md) - 查询货品生命周期状态
- [bg.glo.best.seller.invitation.query](api/03-货品API组-PA/08-931840586312-bg.glo.best.seller.invitation.query.md) - best seller招标单查询
- [bg.glo.logistics.template.get](api/03-货品API组-PA/09-929751463671-bg.glo.logistics.template.get.md) - 查询运费模板列表
- [bg.glo.goods.brand.get](api/03-货品API组-PA/10-932867285290-bg.glo.goods.brand.get.md) - 货品品牌查询
- [bg.glo.goods.removed.get](api/03-货品API组-PA/11-934966325331-bg.glo.goods.removed.get.md) - 卖家中心已废弃列表
- [bg.glo.goods.detail.get](api/03-货品API组-PA/03-925528074151-bg.glo.goods.detail.get.md) - 商品详情查询接口

### 库存管理API组

- [bg.virtualinventoryjit.get](api/04-库存管理API组/01-877301680397-bg.virtualinventoryjit.get.md) - 虚拟库存查询
- [bg.virtualinventoryjit.edit](api/04-库存管理API组/02-877302748309-bg.virtualinventoryjit.edit.md) - 虚拟库存编辑
- [bg.goods.quantity.get](api/04-库存管理API组/03-877304730595-bg.goods.quantity.get.md) - OpenApi查询半托管商品销售库存
- [bg.goods.quantity.update](api/04-库存管理API组/04-877304793024-bg.goods.quantity.update.md) - OpenApi半托管销售库存更新接口
- [bg.goods.warehouse.list.get](api/04-库存管理API组/05-877306493160-bg.goods.warehouse.list.get.md) - 根据站点查询可绑定的发货仓库信息接口
- [bg.goods.routestock.add](api/04-库存管理API组/06-877307157301-bg.goods.routestock.add.md) - 半托管新增路由绑定及库存填写接口

### 库存管理API组-PA

- [bg.btg.goods.stock.route.add](api/05-库存管理API组-PA/01-931819715810-bg.btg.goods.stock.route.add.md) - 半托管新增路由绑定及库存填写接口
- [bg.btg.goods.stock.quantity.update](api/05-库存管理API组-PA/02-929727846558-bg.btg.goods.stock.quantity.update.md) - OpenApi半托管销售库存更新接口
- [bg.btg.goods.stock.quantity.get](api/05-库存管理API组-PA/03-929728959750-bg.btg.goods.stock.quantity.get.md) - OpenApi查询半托管商品销售库存
- [bg.btg.goods.stock.warehouse.list.get](api/05-库存管理API组-PA/04-929731654843-bg.btg.goods.stock.warehouse.list.get.md) - 根据站点查询可绑定的发货仓库信息接口
- [bg.qtg.stock.virtualinventoryjit.get](api/05-库存管理API组-PA/05-931834215788-bg.qtg.stock.virtualinventoryjit.get.md) - 虚拟库存查询
- [bg.qtg.stock.virtualinventoryjit.edit](api/05-库存管理API组-PA/06-929747124710-bg.qtg.stock.virtualinventoryjit.edit.md) - 虚拟库存编辑

### 图片处理API组

- [bg.compliancepicture.get](api/06-图片处理API组/01-877312568691-bg.compliancepicture.get.md) - 批量识别牛皮癣图片
- [bg.algo.dimension.image.check](api/06-图片处理API组/02-877314478665-bg.algo.dimension.image.check.md) - 尺寸图校验
- [bg.algo.dimension.image.check.result](api/06-图片处理API组/03-877315400953-bg.algo.dimension.image.check.result.md) - 尺寸图校验结果查询
- [bg.algo.image.translate.result](api/06-图片处理API组/04-877319222238-bg.algo.image.translate.result.md) - 商品图片翻译接口查询
- [bg.algo.image.translate](api/06-图片处理API组/05-877317634802-bg.algo.image.translate.md) - 商品图片翻译

### 图片处理API组-PA

- [bg.goods.image.upload.global](api/07-图片处理API组-PA/01-929743122710-bg.goods.image.upload.global.md) - bas64图片上传-global
- [bg.goods.texttopicture.add.global](api/07-图片处理API组-PA/02-931831117226-bg.goods.texttopicture.add.global.md) - 文字转图片-global
- [bg.glo.picturecompression.get](api/07-图片处理API组-PA/03-931832124814-bg.glo.picturecompression.get.md) - 高清图片压缩处理
- [bg.glo.colorimageurl.get](api/07-图片处理API组-PA/04-929744601978-bg.glo.colorimageurl.get.md) - 色块图获取
- [bg.glo.fancy.image.cm2in](api/07-图片处理API组-PA/05-929745291948-bg.glo.fancy.image.cm2in.md) - 图片中cm转inch
- [bg.compliancepicture.get.global](api/07-图片处理API组-PA/06-931836881413-bg.compliancepicture.get.global.md) - 批量识别牛皮癣图片
- [bg.algo.image.translate.global](api/07-图片处理API组-PA/07-931837530976-bg.algo.image.translate.global.md) - 商品图片翻译
- [bg.algo.image.translate.result.global](api/07-图片处理API组-PA/08-931838146384-bg.algo.image.translate.result.global.md) - 商品图片翻译接口查询

### 说明书API组

- [bg.goods.instructions.upload](api/08-说明书API组/01-877320754990-bg.goods.instructions.upload.md) - 文件上传接口
- [bg.goods.instructionslanguages.get](api/08-说明书API组/02-877322448059-bg.goods.instructionslanguages.get.md) - 说明书语种查询信息
- [bg.goods.instructionstranslation.get](api/08-说明书API组/03-877323323256-bg.goods.instructionstranslation.get.md) - 说明书翻译接口
- [bg.goods.translationresult.get](api/08-说明书API组/04-877324169548-bg.goods.translationresult.get.md) - 查询说明书翻译结果
- [bg.goods.catsmandatory.get](api/08-说明书API组/05-900363340240-bg.goods.catsmandatory.get.md) - 类目必填信息接口

### 说明书API组-PA

- [bg.glo.goods.edit.guide.file](api/09-说明书API组-PA/01-924487751531-bg.glo.goods.edit.guide.file.md) - 编辑货品说明书
- [bg.glo.goods.instructions.upload](api/09-说明书API组-PA/02-934964084137-bg.glo.goods.instructions.upload.md) - 文件上传接口
- [bg.glo.goods.instructionstranslation.get](api/09-说明书API组-PA/03-933917623161-bg.glo.goods.instructionstranslation.get.md) - 说明书翻译接口
- [bg.glo.goods.translationresult.get](api/09-说明书API组-PA/04-934967109203-bg.glo.goods.translationresult.get.md) - 查询说明书翻译结果
- [bg.glo.goods.instructionslanguages.get](api/09-说明书API组-PA/05-934968648403-bg.glo.goods.instructionslanguages.get.md) - 说明书语种查询信息

### 类目属性API组

- [bg.goods.cats.get](api/10-类目属性API组/01-877327073796-bg.goods.cats.get.md) - 货品类目查询
- [bg.goods.attrs.get](api/10-类目属性API组/02-877328004022-bg.goods.attrs.get.md) - 货品模板查询
- [bg.goods.parentspec.get](api/10-类目属性API组/03-877329273263-bg.goods.parentspec.get.md) - 查询父规格列表
- [bg.goods.spec.create](api/10-类目属性API组/04-877330657708-bg.goods.spec.create.md) - 创建规格
- [bg.goods.category.match](api/10-类目属性API组/05-877332258227-bg.goods.category.match.md) - 新增建品类目映射
- [bg.goods.category.mapping](api/10-类目属性API组/06-877333477871-bg.goods.category.mapping.md) - 查询中文类目映射接口
- [bg.goods.attribute.mapping](api/10-类目属性API组/07-877335725050-bg.goods.attribute.mapping.md) - 内外属性映射
- [bg.goods.accessories.get](api/10-类目属性API组/08-912943934304-bg.goods.accessories.get.md) - 货品包装清单类型查询
- [bg.vehicle.library.prop.dependency.query](api/10-类目属性API组/09-921332758769-bg.vehicle.library.prop.dependency.query.md) - 货品车型库属性值查询
- [bg.vehicle.library.query](api/10-类目属性API组/10-922381252884-bg.vehicle.library.query.md) - 货品车型库模板查询
- [bg.glo.goods.photorecommendationcategory.get](api/10-类目属性API组/11-921339267612-bg.glo.goods.photorecommendationcategory.get.md) - 外部商品图片映射temu类目

### 类目属性API组-PA

- [bg.glo.goods.catsmandatory.get](api/11-类目属性API组-PA/01-924490387484-bg.glo.goods.catsmandatory.get.md) - 类目必填信息接口
- [bg.goods.redress.correctrecord.query](api/11-类目属性API组-PA/02-927626811283-bg.goods.redress.correctrecord.query.md) - 查询商品类目纠正列表
- [bg.goods.redress.optionalcategory.correct](api/11-类目属性API组-PA/03-927627255758-bg.goods.redress.optionalcategory.correct.md) - 纠正商品类目
- [bg.glo.goods.parentspec.get](api/11-类目属性API组-PA/04-929747769955-bg.glo.goods.parentspec.get.md) - 查询父规格列表
- [bg.glo.goods.spec.create](api/11-类目属性API组-PA/05-931841951080-bg.glo.goods.spec.create.md) - 创建规格
- [bg.glo.goods.accessories.get](api/11-类目属性API组-PA/06-929748813829-bg.glo.goods.accessories.get.md) - 货品包装清单类型查询
- [bg.goods.attribute.mapping.global](api/11-类目属性API组-PA/07-933915727207-bg.goods.attribute.mapping.global.md) - 内外属性映射
- [bg.glo.goods.cats.get](api/11-类目属性API组-PA/08-933920620800-bg.glo.goods.cats.get.md) - 子类目查询
- [bg.glo.goods.attrs.get](api/11-类目属性API组-PA/09-934974974297-bg.glo.goods.attrs.get.md) - 货品发布类目属性模板查询
- [bg.glo.goods.category.match](api/11-类目属性API组-PA/10-934980522381-bg.glo.goods.category.match.md) - 类目搜索

### 视频上传API组

- [bg.goods.video.upload.sign.get.global](api/12-视频上传API组/01-922385371829-bg.goods.video.upload.sign.get.global.md) - 查询视频上传sign接口-global
- [bg.goods.big.video.upload.result.get.global](api/12-视频上传API组/02-922387061211-bg.goods.big.video.upload.result.get.global.md) - 查询视频转码结果接口-global
- [视频上传流程](api/12-视频上传API组/03-917139576842-视频上传流程.md)

### 尺码表API组

- [bg.goods.sizecharts.get](api/13-尺码表API组/01-877347300105-bg.goods.sizecharts.get.md) - 查询尺码表模板
- [bg.goods.sizecharts.template.create](api/13-尺码表API组/02-877348687822-bg.goods.sizecharts.template.create.md) - 创建尺码表货品模板
- [bg.goods.sizecharts.class.get](api/13-尺码表API组/03-877348824010-bg.goods.sizecharts.class.get.md) - 查询尺码分类接口
- [bg.goods.sizecharts.create](api/13-尺码表API组/04-877350073467-bg.goods.sizecharts.create.md) - 新增尺码表接口
- [bg.goods.sizecharts.settings.get](api/13-尺码表API组/05-877350954517-bg.goods.sizecharts.settings.get.md) - 查询尺码模板规则
- [bg.goods.imagesizechart.get](api/13-尺码表API组/06-877352774367-bg.goods.imagesizechart.get.md) - 图片提取尺码表
- [bg.goods.sizecharts.meta.get](api/13-尺码表API组/07-877353491299-bg.goods.sizecharts.meta.get.md) - 查询尺码表元信息

### 尺码表API组-PA

- [bg.glo.goods.size.template.edit](api/14-尺码表API组-PA/01-925536879257-bg.glo.goods.size.template.edit.md) - 编辑货品尺码表
- [bg.glo.goods.sizecharts.meta.get](api/14-尺码表API组-PA/02-933921709056-bg.glo.goods.sizecharts.meta.get.md) - 尺码组元信息查询
- [bg.glo.goods.sizecharts.class.get](api/14-尺码表API组-PA/03-934975863040-bg.glo.goods.sizecharts.class.get.md) - 尺码组查询
- [bg.glo.goods.sizecharts.settings.get](api/14-尺码表API组-PA/04-934976723937-bg.glo.goods.sizecharts.settings.get.md) - 尺码表可选发布码查询
- [bg.glo.goods.sizecharts.get](api/14-尺码表API组-PA/05-934978194903-bg.glo.goods.sizecharts.get.md) - 查询尺码表模板
- [bg.glo.goods.sizecharts.template.create](api/14-尺码表API组-PA/06-934978536360-bg.glo.goods.sizecharts.template.create.md) - 根据尺码表模板创建货品尺码表
- [bg.glo.goods.sizecharts.create](api/14-尺码表API组-PA/07-933923560660-bg.glo.goods.sizecharts.create.md) - 创建尺码表

### 模特API组

- [bg.modelinfo.get](api/15-模特API组/01-877341788052-bg.modelinfo.get.md) - 模特信息查询
- [bg.modelcats.get](api/15-模特API组/02-877343110579-bg.modelcats.get.md) - 可添加模特类目查询
- [bg.modelinfo.add](api/15-模特API组/03-877344447432-bg.modelinfo.add.md) - 新增模特信息
- [bg.modelinfo.edit](api/15-模特API组/04-877344987565-bg.modelinfo.edit.md) - 编辑模特信息

### 模特API组-PA

- [bg.glo.modelinfo.add](api/16-模特API组-PA/01-934970190173-bg.glo.modelinfo.add.md) - 新增模特信息
- [bg.glo.modelinfo.edit](api/16-模特API组-PA/02-933919398945-bg.glo.modelinfo.edit.md) - 编辑模特信息
- [bg.glo.modelcats.get](api/16-模特API组-PA/03-933919999698-bg.glo.modelcats.get.md) - 可添加模特类目查询
- [bg.glo.modelinfo.get](api/16-模特API组-PA/04-934971950681-bg.glo.modelinfo.get.md) - 模特信息查询

### 寄样/质检/退货API组

- [bg.refund.returnpackage.get](api/17-寄样-质检-退货API组/01-877355656670-bg.refund.returnpackage.get.md) - 退货包裹查询接口
- [bg.refund.returnpackagedetail.get](api/17-寄样-质检-退货API组/02-877356156839-bg.refund.returnpackagedetail.get.md) - 退货包裹详情查询
- [bg.refund.returnpackagelist.get](api/17-寄样-质检-退货API组/03-877357625845-bg.refund.returnpackagelist.get.md) - 退供包裹明细列表
- [bg.goods.qualityinspection.get](api/17-寄样-质检-退货API组/04-877358586514-bg.goods.qualityinspection.get.md) - 质检列表查询
- [bg.goods.qualityinspectiondetail.get](api/17-寄样-质检-退货API组/05-877360192843-bg.goods.qualityinspectiondetail.get.md) - 质检结果详情查看
- [bg.sample.order.get](api/17-寄样-质检-退货API组/06-899316604827-bg.sample.order.get.md) - 寄样单查询
- [bg.sample.send](api/17-寄样-质检-退货API组/07-899318389808-bg.sample.send.md) - 寄样发货

### 备货及发货API组

- [bg.shiporder.staging.get](api/18-备货及发货API组/01-877362437763-bg.shiporder.staging.get.md) - 查询发货台接口
- [bg.shiporderv3.create](api/18-备货及发货API组/02-877363521599-bg.shiporderv3.create.md) - 创建发货单接口v3
- [bg.shiporder.staging.add](api/18-备货及发货API组/03-877365095165-bg.shiporder.staging.add.md) - 加入发货台接口
- [bg.shiporder.cancel](api/18-备货及发货API组/04-877365979882-bg.shiporder.cancel.md) - 发货单取消
- [bg.shiporderv2.get](api/18-备货及发货API组/05-877366803148-bg.shiporderv2.get.md) - 查询发货单v2
- [bg.mall.address.add](api/18-备货及发货API组/06-877368590889-bg.mall.address.add.md) - 卖家发货地址创建
- [bg.mall.address.get](api/18-备货及发货API组/07-877369025160-bg.mall.address.get.md) - 卖家地址查询
- [bg.logistics.company.get](api/18-备货及发货API组/08-877369974057-bg.logistics.company.get.md) - 快递公司查询
- [bg.shiporder.packing.send](api/18-备货及发货API组/09-877371096318-bg.shiporder.packing.send.md) - 装箱发货接口
- [bg.shiporder.packing.match](api/18-备货及发货API组/10-877372462318-bg.shiporder.packing.match.md) - 装箱发货校验
- [bg.shiporder.package.get](api/18-备货及发货API组/11-877374260423-bg.shiporder.package.get.md) - 发货包裹查询
- [bg.shiporder.package.edit](api/18-备货及发货API组/12-900362063372-bg.shiporder.package.edit.md) - 发货包裹编辑
- [bg.shiporder.receiveaddressv2.get](api/18-备货及发货API组/13-877375480432-bg.shiporder.receiveaddressv2.get.md) - 大仓收货地址查询v2
- [bg.shiporder.logisticsorder.match](api/18-备货及发货API组/14-877376122122-bg.shiporder.logisticsorder.match.md) - 物流单号与可用物流公司校验
- [bg.shiporder.logistics.get](api/18-备货及发货API组/15-877378100662-bg.shiporder.logistics.get.md) - 自行委托三方物流公司查询接口
- [bg.shiporder.logistics.change](api/18-备货及发货API组/16-877378826334-bg.shiporder.logistics.change.md) - 修改物流接口
- [bg.purchaseorderv2.get](api/18-备货及发货API组/17-877379616150-bg.purchaseorderv2.get.md) - 采购单查询v2
- [bg.purchaseorder.apply](api/18-备货及发货API组/18-877380983051-bg.purchaseorder.apply.md) - 采购备货申请
- [bg.shiporderv3.logisticsmatch.get](api/18-备货及发货API组/19-886730016425-bg.shiporderv3.logisticsmatch.get.md) - 平台推荐物流商匹配接口V3
- [bg.purchaseorder.edit](api/18-备货及发货API组/20-922390279809-bg.purchaseorder.edit.md) - 修改备货单下单数量
- [bg.predict.volume.get](api/18-备货及发货API组/21-927625458896-bg.predict.volume.get.md) - 获取预估体积
- [bg.purchaseorder.cancel](api/18-备货及发货API组/22-931839452482-bg.purchaseorder.cancel.md) - 批量取消待接单的备货单

### 运单标签&箱唛

- [bg.logistics.boxmarkinfo.get](api/19-运单标签-箱唛/01-910849146238-bg.logistics.boxmarkinfo.get.md) - 箱唛查询
- [bg.shiporder.express.note.get](api/19-运单标签-箱唛/02-929734542314-bg.shiporder.express.note.get.md) - 物流运单标签获取
- [箱唛打印说明](api/19-运单标签-箱唛/03-910847737016-箱唛打印说明.md)
- [运单标签打印说明](api/19-运单标签-箱唛/04-931827203865-运单标签打印说明.md)

### 商品条码API组-PA

- [bg.glo.goods.custom.label.get](api/20-商品条码API组-PA/02-924483272975-bg.glo.goods.custom.label.get.md) - 定制品商品条码查询
- [bg.glo.goods.labelv2.get](api/20-商品条码API组-PA/03-925530254496-bg.glo.goods.labelv2.get.md) - 商品条码查询V2
- [条码打印说明](api/20-商品条码API组-PA/01-931825798694-条码打印说明.md)

### 销售API组

- [bg.goods.salesv2.get](api/21-销售API组/01-877385749076-bg.goods.salesv2.get.md) - 销售管理分仓组数据查询接口

### 活动API组

- [bg.marketing.activity.list.get](api/22-活动API组/01-895122902657-bg.marketing.activity.list.get.md) - 查询活动列表
- [bg.marketing.activity.detail.get](api/22-活动API组/02-895121252332-bg.marketing.activity.detail.get.md) - 查询活动详情
- [bg.marketing.activity.product.get](api/22-活动API组/03-895119781318-bg.marketing.activity.product.get.md) - 查询活动商品
- [bg.marketing.activity.session.list.get](api/22-活动API组/04-895123255220-bg.marketing.activity.session.list.get.md) - 查询活动场次列表
- [bg.marketing.activity.enroll.submit](api/22-活动API组/05-895120930798-bg.marketing.activity.enroll.submit.md) - 活动报名提交
- [bg.marketing.activity.enroll.list.get](api/22-活动API组/06-902458032485-bg.marketing.activity.enroll.list.get.md) - 查询活动报名记录

### 活动API组-PA

- [仅自研应用特殊申请通过后使用](api/23-活动API组-PA/01-929733196012-仅自研应用特殊申请通过后使用.md)
- [bg.marketing.activity.detail.get.global](api/23-活动API组-PA/02-924492762131-bg.marketing.activity.detail.get.global.md) - 查询活动详情
- [bg.marketing.activity.list.get.global](api/23-活动API组-PA/03-925541647527-bg.marketing.activity.list.get.global.md) - 查询活动列表
- [bg.marketing.activity.product.get.global](api/23-活动API组-PA/04-925542694225-bg.marketing.activity.product.get.global.md) - 查询活动商品
- [bg.marketing.activity.session.list.get.global](api/23-活动API组-PA/05-925544038104-bg.marketing.activity.session.list.get.global.md) - 查询活动场次列表
- [bg.marketing.activity.enroll.list.get.global](api/23-活动API组-PA/06-925545287212-bg.marketing.activity.enroll.list.get.global.md) - 查询活动报名记录
- [bg.marketing.activity.enroll.submit.global](api/23-活动API组-PA/07-925545774394-bg.marketing.activity.enroll.submit.global.md) - 活动报名提交

### 基础API组

- [bg.mall.info.get](api/24-基础API组/01-881490244071-bg.mall.info.get.md) - 查询当前token对应店铺类型信息
- [bg.open.accesstoken.info.get](api/24-基础API组/02-881490740978-bg.open.accesstoken.info.get.md) - 查询当前token对应授权信息

### 基础API组-PA

- [bg.open.accesstoken.info.get.global](api/25-基础API组-PA/01-929722395417-bg.open.accesstoken.info.get.global.md) - 查询当前token对应授权信息-global

### 编辑API组

- [bg.goods.update](api/26-编辑API组/01-898264107502-bg.goods.update.md) - 货品更新接口
- [bg.goods.edit](api/26-编辑API组/02-898264747556-bg.goods.edit.md) - 货品编辑
- [bg.goods.edit.sensitive.attr](api/26-编辑API组/03-898265919235-bg.goods.edit.sensitive.attr.md) - 编辑货品敏感品属性
- [bg.goods.edit.task.apply](api/26-编辑API组/04-898267810581-bg.goods.edit.task.apply.md) - 发起货品修改单
- [bg.goods.edit.task.submit](api/26-编辑API组/05-898268033395-bg.goods.edit.task.submit.md) - 提交货品修改单
- [bg.goods.edit.pictures.submit](api/26-编辑API组/06-899314893477-bg.goods.edit.pictures.submit.md) - 修改商品素材
- [bg.goodslogistics.template.edit](api/26-编辑API组/07-899315998808-bg.goodslogistics.template.edit.md) - 编辑商品运费模板
- [bg.goods.edit.property](api/26-编辑API组/08-900361168169-bg.goods.edit.property.md) - 编辑货品属性
- [bg.goods.add.property](api/26-编辑API组/10-918188622978-bg.goods.add.property.md) - 新增货品属性
- [bg.goods.edit.guide.file](api/26-编辑API组/09-899319938658-bg.goods.edit.guide.file.md) - 编辑货品说明书

### 编辑API组-PA

- [bg.glo.goods.edit.task.submit](api/27-编辑API组-PA/01-924483837164-bg.glo.goods.edit.task.submit.md) - 提交货品修改单
- [bg.glo.goods.edit.sensitive.attr](api/27-编辑API组-PA/02-924485149181-bg.glo.goods.edit.sensitive.attr.md) - 编辑货品敏感品属性
- [bg.glo.goods.edit.pictures.submit](api/27-编辑API组-PA/03-924486362213-bg.glo.goods.edit.pictures.submit.md) - 修改商品素材
- [bg.glo.goods.update](api/27-编辑API组-PA/04-925532416793-bg.glo.goods.update.md) - 货品更新接口
- [bg.glo.goods.add.property](api/27-编辑API组-PA/05-925533793591-bg.glo.goods.add.property.md) - 新增货品属性
- [bg.glo.goods.edit.property](api/27-编辑API组-PA/06-924487372748-bg.glo.goods.edit.property.md) - 编辑货品属性
- [bg.glo.goodslogistics.template.edit](api/27-编辑API组-PA/07-925534357132-bg.glo.goodslogistics.template.edit.md) - 编辑商品运费模板
- [bg.glo.goods.edit.task.apply](api/27-编辑API组-PA/08-932868418031-bg.glo.goods.edit.task.apply.md) - 发起货品修改单

### 申报价/核价/调价API组

- [bg.goods.price.list.get](api/28-申报价-核价-调价API组/01-901410718805-bg.goods.price.list.get.md) - 货品供货价查询
- [bg.price.review.page.query](api/28-申报价-核价-调价API组/02-899321422992-bg.price.review.page.query.md) - 分页查询核价单
- [bg.price.review.confirm](api/28-申报价-核价-调价API组/03-901412462419-bg.price.review.confirm.md) - 同意核价单建议价
- [bg.price.review.reject](api/28-申报价-核价-调价API组/04-901413494559-bg.price.review.reject.md) - 不同意核价单建议价（并给出新的申报价）
- [bg.semi.adjust.price.page.query](api/28-申报价-核价-调价API组/05-901413934857-bg.semi.adjust.price.page.query.md) - 分页查询半托管调价单
- [bg.semi.adjust.price.batch.review](api/28-申报价-核价-调价API组/06-901415202031-bg.semi.adjust.price.batch.review.md) - 半托管批量确认/拒绝调价单
- [bg.full.adjust.price.batch.review](api/28-申报价-核价-调价API组/07-908749899377-bg.full.adjust.price.batch.review.md) - 全托管批量确认/拒绝调价单
- [bg.full.adjust.price.page.query](api/28-申报价-核价-调价API组/08-908751475686-bg.full.adjust.price.page.query.md) - 分页查询全托管调价单

### 申报价/核价/调价API组-PA

- [仅自研应用单独申请后调用](api/29-申报价-核价-调价API组-PA/01-931824917972-仅自研应用单独申请后调用.md)
- [bg.glo.goods.price.list.get](api/29-申报价-核价-调价API组-PA/02-924491336796-bg.glo.goods.price.list.get.md) - 货品供货价查询
- [bg.semi.adjust.price.batch.review.order](api/29-申报价-核价-调价API组-PA/03-931820964658-bg.semi.adjust.price.batch.review.order.md) - 半托管批量确认/拒绝调价单
- [bg.semi.adjust.price.page.query.order](api/29-申报价-核价-调价API组-PA/04-931822060910-bg.semi.adjust.price.page.query.order.md) - 分页查询半托管调价单
- [bg.semi.price.review.page.query.order](api/29-申报价-核价-调价API组-PA/05-929730272138-bg.semi.price.review.page.query.order.md) - 分页查询半托管核价单
- [bg.semi.price.review.confirm.order](api/29-申报价-核价-调价API组-PA/06-929730556932-bg.semi.price.review.confirm.order.md) - 半托管同意核价单建议价
- [bg.semi.price.review.reject.order](api/29-申报价-核价-调价API组-PA/07-931823247765-bg.semi.price.review.reject.order.md) - 半托管不同意核价单建议价（并给出新的申报价）

### JIT组

- [bg.jitmode.activate](api/30-JIT组/01-915050521341-bg.jitmode.activate.md) - 打开JIT
- [bg.virtualinventoryjit.get](api/30-JIT组/02-916094805907-bg.virtualinventoryjit.get.md) - 虚拟库存查询
- [bg.virtualinventoryjit.edit](api/30-JIT组/03-916096164969-bg.virtualinventoryjit.edit.md) - 虚拟库存编辑
- [bg.virtualinventoryjit.rule.sign](api/30-JIT组/04-916097664850-bg.virtualinventoryjit.rule.sign.md) - jit预售规则签署接口
- [bg.virtualinventoryjit.rule.get](api/30-JIT组/05-915052173981-bg.virtualinventoryjit.rule.get.md) - jit预售规则查询接口

### JIT组-PA

- [bg.glo.jitmode.activate](api/31-JIT组-PA/01-924495543423-bg.glo.jitmode.activate.md) - 打开JIT

### 全托广告API组-PA

- [bg.glo.searchrec.ad.create](api/32-全托广告API组-PA/01-931828091626-bg.glo.searchrec.ad.create.md) - 创建广告接口
- [bg.glo.searchrec.ad.modify](api/32-全托广告API组-PA/02-929741160712-bg.glo.searchrec.ad.modify.md) - 修改广告接口
- [bg.glo.searchrec.ad.batch.modify](api/32-全托广告API组-PA/03-931828782212-bg.glo.searchrec.ad.batch.modify.md) - 批量修改广告接口
- [bg.glo.searchrec.ad.roas.pred](api/32-全托广告API组-PA/04-929735887634-bg.glo.searchrec.ad.roas.pred.md) - 广告投资回报率查询接口
- [bg.glo.searchrec.ad.detail.query](api/32-全托广告API组-PA/05-929736716892-bg.glo.searchrec.ad.detail.query.md) - 广告投放状态查询接口
- [bg.glo.searchrec.ad.goods.create.query](api/32-全托广告API组-PA/06-929738220635-bg.glo.searchrec.ad.goods.create.query.md) - 广告商品可创建查询接口
- [bg.glo.searchrec.ad.log.query](api/32-全托广告API组-PA/07-931830463288-bg.glo.searchrec.ad.log.query.md) - 操作日志查询接口
- [bg.glo.searchrec.ad.reports.goods.query](api/32-全托广告API组-PA/08-929739237497-bg.glo.searchrec.ad.reports.goods.query.md) - 广告商品投放数据效果（商品维度）
- [bg.glo.searchrec.ad.reports.mall.query](api/32-全托广告API组-PA/09-929740420731-bg.glo.searchrec.ad.reports.mall.query.md) - 整体投放数据效果（店铺维度）

### 全托管库存API组-PA

- [bg.qtg.stock.virtualinventoryjit.get](api/33-全托管库存API组-PA/01-929749856571-bg.qtg.stock.virtualinventoryjit.get.md) - 虚拟库存查询
- [bg.qtg.stock.virtualinventoryjit.edit](api/33-全托管库存API组-PA/02-931843405940-bg.qtg.stock.virtualinventoryjit.edit.md) - 虚拟库存编辑

