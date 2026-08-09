<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get experiment view override configuration by specific ID | https://docs.langchain.com/langsmith/smith-api/experiment-view-overrides/get-experiment-view-override-configuration-by-specific-id -->

# 通过特定ID获取实验视图覆盖配置

/langsmith/langsmith-platform-openapi.json 获取 /datasets/{dataset_id}/experiment-view-overrides/{id}
使用数据集 ID 和覆盖 ID 检索特定实验视图覆盖配置。
当您有以下权限时，此端点可以更精确地访问实验视图覆盖
特定的覆盖 ID，对于直接链接或缓存引用很有用。

响应包含与数据集级端点相同的列覆盖信息：
- 带有验证前缀的列标识符
- 数值数据可视化的颜色渐变设置
- 数字精度配置
- 列可见性控制

数据集和覆盖都必须存在并且可供经过身份验证的用户访问。