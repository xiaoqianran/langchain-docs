<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create new experiment view override configuration for a dataset | https://docs.langchain.com/langsmith/smith-api/experiment-view-overrides/create-new-experiment-view-override-configuration-for-a-dataset -->

# 为数据集创建新的实验视图覆盖配置

/langsmith/langsmith-platform-openapi.json 发布 /datasets/{dataset_id}/experiment-view-overrides
为具有列显示设置的数据集创建新的实验视图覆盖配置。
该端点允许您通过配置来自定义实验结果的显示方式
特定于列的覆盖，包括颜色、精度和可见性。

该请求必须包含一个具有至少一项覆盖配置的“column_overrides”数组。
每个列覆盖可以指定：
- 列：必填字段名称（必须以输入、输出、参考输出、反馈、指标、附件或元数据开头）
- color_gradient：用于数字数据可视化的可选[数字，颜色]元组数组
- precision：数字列中小数位的可选数字（1-6）
- hide：可选布尔值来控制列可见性

请求正文示例：
{
“列覆盖”：[
{
"column": "输出.准确性",
“颜色渐变”：[[0.0，“#ff0000”]，[0.5，“#ffff00”]，[1.0，“#00ff00”]]，
“精度”：3
},
{
"column": "inputs.model_type",
“隐藏”：假
}
]
}如果数据集已存在覆盖（使用 PATCH 进行更新），则此操作将失败。