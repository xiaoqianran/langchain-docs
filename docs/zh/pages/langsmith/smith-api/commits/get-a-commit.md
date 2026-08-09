<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get a commit | https://docs.langchain.com/langsmith/smith-api/commits/get-a-commit -->

# 获取提交

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/commits/{owner}/{repo}/{commit}
通过哈希、标签或存储库的“最新”检索特定提交。
该端点支持经过身份验证和未经身份验证的访问。
经过身份验证的用户可以访问私有存储库，而未经身份验证的用户只能访问公共存储库。
提交解析逻辑：
- “latest”或空：获取最近的提交
- 少于 8 个字符：仅检查标签
- 8 个或更多字符：优先考虑提交哈希而不是标签，同时检查两者