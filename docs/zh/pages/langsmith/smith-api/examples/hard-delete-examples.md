<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Hard delete examples | https://docs.langchain.com/langsmith/smith-api/examples/hard-delete-examples -->

# 硬删除示例

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/datasets/examples/delete
此端点硬删除数据集示例的“所有”版本。
通过将输入、输出和元数据设置为空并删除附件文件，同时保留示例 ID、数据集 ID 和创建时间戳来执行删除。
重要提示：附件文件最多可能需要 7 天才能删除。输入、输出和元数据立即无效。