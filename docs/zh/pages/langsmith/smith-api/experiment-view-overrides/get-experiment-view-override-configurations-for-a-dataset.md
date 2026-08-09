<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get experiment view override configurations for a dataset | https://docs.langchain.com/langsmith/smith-api/experiment-view-overrides/get-experiment-view-override-configurations-for-a-dataset -->

# 获取数据集的实验视图覆盖配置

/langsmith/langsmith-platform-openapi.json 获取 /datasets/{dataset_id}/experiment-view-overrides
检索特定数据集的所有实验视图覆盖配置。
该端点返回列显示覆盖，包括颜色渐变，
精度设置和列可见性配置，可自定义如何
实验结果显示在 UI 中。

响应包括所有列覆盖及其显示设置：
- 列标识符（必须以输入、输出、参考输出、反馈、指标、附件或元数据开头）
- 用于数字数据可视化的颜色渐变
- 数字列的精度设置（1-6位小数）
- 隐藏标志以控制列可见性