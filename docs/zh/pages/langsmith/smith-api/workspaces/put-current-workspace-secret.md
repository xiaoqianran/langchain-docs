<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Put current workspace secret | https://docs.langchain.com/langsmith/smith-api/workspaces/put-current-workspace-secret -->

# 设置当前工作空间的秘密

/langsmith/langsmith-platform-openapi.json 把 /api/v1/workspaces/current/secrets/{key}
创建或更新工作区机密及其可能发送到的主机。

需要工作区管理员。省略值以保留当前值；是的
需要创建一个秘密。 configs 替换秘密的主机；省略
或空恢复已知提供者密钥的内置默认值。价值
永远不会返回。