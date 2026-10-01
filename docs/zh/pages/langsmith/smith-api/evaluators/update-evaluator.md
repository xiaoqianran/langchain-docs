<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update evaluator | https://docs.langchain.com/langsmith/smith-api/evaluators/update-evaluator -->

# 更新评估器

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/platform/evaluators/{evaluator_id}
更新现有评估者的姓名、LLM 配置或代码配置。当代码评估器构建处于 ENQUEUED 或 BUILDING 状态时，返回 409。