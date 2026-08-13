<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get a snapshot | https://docs.langchain.com/langsmith/smith-api/sandboxes/get-a-snapshot -->

# 获取快照

/langsmith/langsmith-platform-openapi.json 获取 /api/v2/sandboxes/snapshots/{snapshot_id}
通过 ID 或 Docker 风格的引用获取沙箱快照。裸名称意味着 name:latest，回退到该名称的最新就绪的未标记快照。要列出名称下的标签，请使用 /api/v2/sandboxes/snapshots-by-name/{name}。