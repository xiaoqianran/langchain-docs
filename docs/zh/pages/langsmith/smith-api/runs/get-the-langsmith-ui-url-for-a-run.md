<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get the LangSmith UI URL for a run | https://docs.langchain.com/langsmith/smith-api/runs/get-the-langsmith-ui-url-for-a-run -->

# 获取运行的 LangSmith UI URL

/langsmith/langsmith-platform-openapi.json 获取 /api/v2/runs/{run_id}/url
返回用于在 LangSmith UI 中查看特定运行的 URL。调用者必须提供
run的project_id和trace_id作为查询参数； start_time 是可选的。

自托管部署需要 LangSmith `v0.16` 或更高版本。