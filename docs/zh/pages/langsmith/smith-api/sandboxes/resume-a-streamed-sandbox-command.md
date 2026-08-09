<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Resume a streamed sandbox command | https://docs.langchain.com/langsmith/smith-api/sandboxes/resume-a-streamed-sandbox-command -->

# 恢复流式沙箱命令

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/{sandbox_id}/execute/stream/resume
继续流式传输由流开始端点启动的命令。偏移量也是对其下方所有内容的确认，这会释放沙箱的输出缓冲区并取消暂停等待空间的命令。仅附加：沙箱不再具有的命令返回 404，而不是再次运行。