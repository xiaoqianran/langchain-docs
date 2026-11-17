<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List run rules | https://docs.langchain.com/langsmith/smith-api/rules/list-run-rules -->

# 列出运行规则

/langsmith/langsmith-platform-openapi.json 获取 /api/v2/runs/rules
按 update_at 和 id 降序列出工作区规则。过滤器与 AND 结合。使用相同的过滤器不变地传递 next_cursor 继续；并发更改可能会影响后面的页面。