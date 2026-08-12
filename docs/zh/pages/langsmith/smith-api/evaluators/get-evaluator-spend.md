<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get evaluator spend | https://docs.langchain.com/langsmith/smith-api/evaluators/get-evaluator-spend -->

# 获取评估者支出

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/evaluators/spend
返回所请求的 7 天期间每天的 LLM 评估者支出，按评估者、资源或运行规则分组。 group_by、evaluator_id、session_id 或 dataset_id 之一是必需的。 Resource_id、type、feedback_key 和 tag_value_id 可以与 group_by 一起提供以缩小列表聚合范围。