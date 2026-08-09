<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update existing experiment view override configuration | https://docs.langchain.com/langsmith/smith-api/experiment-view-overrides/update-existing-experiment-view-override-configuration -->

# 更新现有实验视图覆盖配置

/langsmith/langsmith-platform-openapi.json 补丁 /datasets/{dataset_id}/experiment-view-overrides/{id}
通过完全替换来更新现有实验视图覆盖配置
指定数据集和覆盖 ID 的列覆盖。

该端点执行列覆盖配置的完全替换。
所有现有的列覆盖都将替换为提供的新配置
在请求正文中。要添加或修改单个列，请包含完整的
请求中所需的配置。

请求格式与创建端点相同：
- column_overrides：必需的数组，至少具有一个覆盖配置
- 每个覆盖都可以指定颜色渐变、精度和可见性

请求正文示例：
{
“列覆盖”：[
{
"列": "metrics.f1_score",
“颜色渐变”：[[0.0，“#ff4444”]，[0.8，“#44ff44”]]，
“精度”：4
},
{
"column": "反馈.评级",
“隐藏”：假
}
]
}

数据集和覆盖都必须存在并且可供经过身份验证的用户访问。