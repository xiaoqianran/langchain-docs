<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete an example | https://docs.langchain.com/langsmith/smith-api/examples/delete-an-example -->

# 删除一个例子

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/platform/datasets/{dataset_id}/examples/{example_id}
软删除示例，保留以前的版本及其附件。如果最新版本已被删除，则请求成功，无需创建另一个版本。删除是在当前时间或最新版本之后记录的，以较晚者为准。对于未来版本，最新读取会立即反映删除；时间戳读取仅反映在记录的删除时间戳或之后的删除。