<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Generate a sandbox file download link | https://docs.langchain.com/langsmith/smith-api/sandboxes/generate-a-sandbox-file-download-link -->

# 生成沙盒文件下载链接

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/sandboxes/boxes/{name}/download-url
生成一个令牌化链接，无需进一步身份验证即可从沙箱下载单个文件。这会创建一个令牌而不是创建一个可寻址资源，因此它返回 200 且没有 Location 标头。令牌固定沙箱、文件路径、响应内容类型和处置以及沙箱标志，因此链接无法重新指向另一个文件或在较弱的策略下提供服务。该文件始终提供 Content-Security-Policy：一个沙箱指令，加上一个 default-src，用于保存对文件自己的下载主机的每次提取和一组预先批准的第三方来源。 csp_sandbox_flags 可能会通过允许下载、允许表单、允许模态、允许方向锁定、允许指针锁定、允许弹出窗口、允许演示、允许同源、允许脚本或允许用户激活来放松沙箱。每个文件都从其自己的主机提供服务，源自沙箱和路径，因此allow-same-origin 提供了其他文件无法读取的页面 localStorage 和 IndexedDB，并为同一文件重新生成链接来保留它们。csp_sandbox 设置为 false 会完全删除沙箱指令，并且必须省略 csp_sandbox_flags。 csp_source_bundles 选择第三方来源：当省略该字段时，cdnjs、google-fonts、jsdelivr 和 unpkg 都允许，“none”将文件保存到其自己的主机，“any”根本不发送默认 src。除非设置了expires_in_seconds，否则链接永远不会过期。该链接由沙箱服务域提供，而不是 API 主机。