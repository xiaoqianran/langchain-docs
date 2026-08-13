<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create a sandbox | https://docs.langchain.com/langsmith/smith-api/sandboxes/create-a-sandbox -->

# 创建一个沙箱

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/boxes
从快照创建一个新的沙箱。最多提供`snapshot_id`或`snapshot_name`之一；如果两者均未提供，则服务器使用默认快照。 `snapshot_name` 接受 Docker 风格的 `name` 或 `name:tag` 引用（裸名称解析为 `name:latest`）。