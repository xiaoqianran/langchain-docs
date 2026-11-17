<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update a project | https://docs.langchain.com/langsmith/smith-api/sessions/update-a-project -->

# 更新一个项目

/langsmith/langsmith-platform-openapi.json 补丁 /api/v2/sessions/{session_id}
更新提供的字段并返回刷新的资源，而无需可选的运行统计信息。省略的字段保持不变。 Null 清除描述、default_dataset_id、end_time 或其他。 Extra 合并顶级键；空值删除键。