<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List rule logs (v2) | https://docs.langchain.com/langsmith/smith-api/run/list-rule-logs-v2 -->

# 列出规则日志（v2）

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/runs/rules/{rule_id}/logs/v2
使用基于游标的分页列出特定规则的日志。

该端点使用 run_outcomes_count 正确处理 S3 存储的结果
预测批量大小并避免过度获取。