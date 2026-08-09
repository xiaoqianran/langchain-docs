<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prune Threads | https://docs.langchain.com/langsmith/agent-server-api/threads/prune-threads -->

# 修剪线程

/langsmith/agent-server-openapi.json 发布 /threads/prune
按 ID 修剪线程。 “删除”策略完全删除线程。 “keep_latest”策略会修剪旧的检查点，但保留线程及其最新状态。