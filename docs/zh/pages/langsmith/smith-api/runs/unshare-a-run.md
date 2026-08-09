<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Unshare a run | https://docs.langchain.com/langsmith/smith-api/runs/unshare-a-run -->

# 取消分享跑步

/langsmith/langsmith-platform-openapi.json 删除 /api/v2/runs/{trace_id}/share
删除由trace_id 和session_id 标识的跟踪的共享令牌。幂等：无论共享代币是否存在，都会返回 204。

自托管部署需要 LangSmith `v0.16` 或更高版本。