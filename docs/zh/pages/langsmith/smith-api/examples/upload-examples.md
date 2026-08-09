<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Upload examples | https://docs.langchain.com/langsmith/smith-api/examples/upload-examples -->

# 上传示例

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/datasets/{dataset_id}/examples
此端点允许客户端通过发送 multipart/form-data POST 请求将示例上传到指定的数据集。
每个表单部分包含 JSON 编码数据或与示例关联的二进制附件文件。