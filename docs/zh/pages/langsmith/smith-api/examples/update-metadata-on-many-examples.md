<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update metadata on many examples | https://docs.langchain.com/langsmith/smith-api/examples/update-metadata-on-many-examples -->

# 更新许多示例的元数据

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/platform/datasets/{dataset_id}/examples/metadata
按顺序将相同的元数据更改应用于中列出的每个示例
一个数据集。不在数据集中或被删除的示例是
跳过；其余的一起更新，所以如果更新失败则没有一个
他们改变了。回答 207，每个提交的示例 ID 具有一种状态：
已更新，或未找到跳过的示例。元数据键
操作不命名并保留其值。将示例添加到拆分或
从其中删除它们，在 dataset_split 上使用 ARRAY_ADD 或 ARRAY_REMOVE
关键。需要更新数据集的权限。