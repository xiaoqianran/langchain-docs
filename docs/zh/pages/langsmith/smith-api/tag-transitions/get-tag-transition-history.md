<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get tag transition history | https://docs.langchain.com/langsmith/smith-api/tag-transitions/get-tag-transition-history -->

# 获取标签转换历史记录

/langsmith/langsmith-platform-openapi.json 获取 /repos/{owner}/{repo}/tags/{tag_name}/history
返回特定的转换的分页审核日志
存储库中的标签。每个条目记录一次提交更改
(from_commit → to_commit) 以及执行者。