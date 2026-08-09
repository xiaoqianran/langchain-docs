<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update the issues agent config for a session (Beta) | https://docs.langchain.com/langsmith/smith-api/issues-agent/update-the-issues-agent-config-for-a-session-beta -->

# 更新会话的问题代理配置（测试版）

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/platform/sessions/{session_id}/issues-agent
**测试版：** 该端点正在积极开发中，可能会发生变化，恕不另行通知。

修补代理配置。所有副作用（清除修复字段时
GitHub 存储库更改，设置 agent_overview_repo_id) 发生在
单个 CRUD 事务。省略的字段保持不变。