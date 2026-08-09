<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete evaluator | https://docs.langchain.com/langsmith/smith-api/evaluators/delete-evaluator -->

# 删除评估器

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/platform/evaluators/{evaluator_id}
删除评估者。当delete_run_rules为true时，首先删除引用此评估器的所有运行规则（同一租户）。当删除评估器行时，关联的 llm_evaluators 和 code_evaluators 行将通过外键级联删除。