<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Download a sandbox file | https://docs.langchain.com/langsmith/smith-api/sandboxes/download-a-sandbox-file -->

# 下载沙箱文件

/langsmith/langsmith-platform-openapi.json 获取 /api/v2/sandboxes/{sandbox_id}/download
从沙箱文件系统路径下载文件内容。支持 HTTP 范围请求：发送 Range 标头（例如 `bytes=0-1023`）以接收仅包含该字节范围的 206。每个响应都带有一个 ETag；将其作为 If-Range 发送回来以安全地恢复（更改的文件返回 200 以及整个文件而不是不匹配的字节），或者作为 If-None-Match 发送回来以在文件未更改时获取 304。 HEAD 返回相同的标头，包括 Content-Length 中的文件大小，但没有正文。