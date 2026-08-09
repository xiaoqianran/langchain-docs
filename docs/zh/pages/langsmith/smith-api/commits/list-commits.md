<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List commits | https://docs.langchain.com/langsmith/smith-api/commits/list-commits -->

# 列出提交

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/commits/{owner}/{repo}
列出存储库的提交，并支持分页。
该端点支持经过身份验证和未经身份验证的访问。
经过身份验证的用户可以访问私有存储库；未经身份验证的用户只能访问公共存储库。
include_stats 参数控制是否计算下载和查看统计信息（默认为 true）。