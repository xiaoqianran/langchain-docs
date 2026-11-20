<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Put org default usage limit | https://docs.langchain.com/langsmith/smith-api/usage-limits/put-org-default-usage-limit -->

# 设置组织默认使用限制

/langsmith/langsmith-platform-openapi.json 把 /api/v1/usage-limits/org/default
为新工作区设置组织的默认每月跟踪限制和警报阈值；使用 `apply_to`，还可以更新现有工作区，而不受自身限制。

`alert_thresholds`替换存储的列表；省略它会清除阈值。要在不强制执行限制的情况下向工作区发出警报，请将 `limit_value` 设置为 -1 并发送 `COUNT` 阈值； `PERCENT` 阈值需要一个限制。