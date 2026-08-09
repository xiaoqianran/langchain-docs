<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get a gateway policy | https://docs.langchain.com/langsmith/smith-api/gateway-policies/get-a-gateway-policy -->

# 获取网关策略

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/gateway-policies/{id}
按 id 返回单个网关策略。跨组织访问是
被 404 拒绝

**支出跟踪：**支出上限政策包括
`current_spend_usd` 用于活动窗口，以便调用者可以
无需访问单独的端点即可读取每个策略的成本。
警卫政策将其保留为空。