<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Replace an organization model price | https://docs.langchain.com/langsmith/smith-api/model-price-map/replace-an-organization-model-price -->

# 替换组织模型价格

/langsmith/langsmith-platform-openapi.json 把 /api/v1/orgs/current/model-price-map/{id}
替换该组织设置的模型价格的每个字段。

请求正文是完整条目，而不是部分更新：省略
可选字段将重置为默认值。成本已记录在
现有运行不会重新计算。