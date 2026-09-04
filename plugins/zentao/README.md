# Zentao

Zentao（禅道）CLI 技能插件。通过 `zentao` 命令行工具查询和操作禅道项目管理数据，覆盖项目集、产品、项目、执行、需求、Bug、任务、测试用例、测试单、产品计划、版本、发布、反馈、工单、应用、用户、附件等模块的增删改查及状态流转。

移植自 [easysoft/zentao-skills](https://github.com/easysoft/zentao-skills)（MIT License），当前跟随上游 `zentao-cli` 技能版本 0.1.7；上游已弃用的 `zentao-api`、`zentao-tour` 技能未包含。

## Golden path

- 用户提到禅道 / zentao、查询项目进展、获取 Bug 列表、创建任务、更新需求状态等项目管理操作时，加载 `skills/zentao-cli/SKILL.md` 并按其指引调用 `zentao` CLI。

## Fallback primitives

无本地命令封装；本插件只提供技能说明，所有操作通过 `zentao` CLI 完成（安装：`npm install -g zentao-cli`，认证：`zentao login`）。
