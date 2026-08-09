<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get a single run | https://docs.langchain.com/langsmith/smith-api/runs/get-a-single-run -->

# 获取单次运行

/langsmith/langsmith-platform-openapi.json 获取 /api/v2/runs/{run_id}
返回给定会话的按 ID 运行的一次。使用`selects`查询参数（可重复）来选择要返回的字段。

自托管部署需要 LangSmith `v0.16` 或更高版本。