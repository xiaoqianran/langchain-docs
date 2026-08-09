<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get a public shared trace run | https://docs.langchain.com/langsmith/smith-api/runs/get-a-public-shared-trace-run -->

# 获取公共共享跟踪运行

/langsmith/langsmith-platform-openapi.json 获取 /api/v2/public/{share_token}/run/{run_id}
返回由共享令牌标识的跟踪内的一次运行。该请求仅提供运行 ID 和该运行的确切 start_time 坐标。

自托管部署需要 LangSmith `v0.16` 或更高版本。