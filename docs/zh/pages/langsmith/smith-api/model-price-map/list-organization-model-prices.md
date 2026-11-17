<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List organization model prices | https://docs.langchain.com/langsmith/smith-api/model-price-map/list-organization-model-prices -->

# 列出组织模型价格

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/orgs/current/model-price-map
列出为此组织设置的型号价格。

仅返回组织自己的条目，而不返回工作区或
LangSmith 工作区的默认条目也定价；列出那些
来自`GET /model-price-map`的工作区。