<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List runs in a trace | https://docs.langchain.com/langsmith/smith-api/runs/list-runs-in-a-trace -->

# 列出跟踪中的运行

/langsmith/langsmith-platform-openapi.json 获取 /api/v2/traces/{trace_id}/runs
返回最小/最大开始时间内跟踪 ID 的运行。可选`filter`；可重复的`selects`来选择要返回的字段。

自托管部署需要 LangSmith `v0.16` 或更高版本。