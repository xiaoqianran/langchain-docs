<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get a model price | https://docs.langchain.com/langsmith/smith-api/model-price-map/get-a-model-price -->

# 获取型号价格

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/model-price-map/{id}
获取此工作区用于计算运行成本的一种模型价格。

列表返回的任何条目都可以在此处阅读：工作区的自定义
条目、其组织条目和 LangSmith 默认条目。
对于工作区未定价的 ID，返回 404，包括
其他工作区的条目。