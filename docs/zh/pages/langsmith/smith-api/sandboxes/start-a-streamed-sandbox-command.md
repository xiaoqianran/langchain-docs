<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Start a streamed sandbox command | https://docs.langchain.com/langsmith/smith-api/sandboxes/start-a-streamed-sandbox-command -->

# 启动流式沙箱命令

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/{sandbox_id}/execute/stream/start
在沙箱内执行命令，并将 stdout/stderr 作为具有 Base64 有效负载的服务器发送事件进行流式传输。需要 v2 运行时上的沙箱。传递 command_id 会重用正在运行的命令，而不是启动第二个命令。当沙箱的输出缓冲区需要 ack 时，响应以 ack_required 事件结束；从报告的偏移量继续到恢复端点。