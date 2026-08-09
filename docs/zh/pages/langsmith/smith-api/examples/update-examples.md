<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update examples | https://docs.langchain.com/langsmith/smith-api/examples/update-examples -->

# 更新示例

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/platform/datasets/{dataset_id}/examples
此端点允许客户端通过发送 multipart/form-data PATCH 请求来更新指定数据集中的现有示例。
每个表单部分包含 JSON 编码数据或二进制附件文件以更新示例。