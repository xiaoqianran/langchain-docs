<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Validate rule | https://docs.langchain.com/langsmith/smith-api/run/validate-rule -->

# 验证规则

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/runs/rules/validate
通过使用测试数据执行规则来验证规则，而不创建保存的规则。

此端点允许在保存之前测试作为法官的 LLM 评估程序。它接受
规则配置（与规则创建相同）和测试数据，执行评估器，
并以与batch_invoke_evaluator相同的格式返回评估结果。

仅支持 LLM 作为法官规则（评估者）。不允许代码评估器。

评估器执行跟踪被写入数据库（在“评估器”中）
项目），它允许用户查看评估器执行历史记录。