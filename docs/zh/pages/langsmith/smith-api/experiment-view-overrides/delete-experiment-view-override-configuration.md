<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete experiment view override configuration | https://docs.langchain.com/langsmith/smith-api/experiment-view-overrides/delete-experiment-view-override-configuration -->

# 删除实验视图覆盖配置

/langsmith/langsmith-platform-openapi.json 删除 /datasets/{dataset_id}/experiment-view-overrides/{id}
永久删除数据集的实验视图覆盖配置。
此操作删除所有列覆盖设置，包括颜色渐变、
精确配置和可见性设置。

删除后，实验视图将恢复为默认列显示设置。
此操作无法撤消 - 您需要重新创建覆盖配置
如果您想恢复自定义列设置。

数据集和覆盖都必须存在并且可供经过身份验证的用户访问。
如果覆盖不存在或者用户没有权限，操作将会失败
数据集的适当权限。