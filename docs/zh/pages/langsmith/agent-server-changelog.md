<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agent Server changelog | https://docs.langchain.com/langsmith/agent-server-changelog -->

# 代理服务器变更日志

<Callout icon="rss" color="#4F46E5" iconType="regular">
**订阅**：我们的变更日志包括一个 [RSS feed](https://docs.langchain.com/langsmith/agent-server-changelog/rss.xml)，可以与 [Slack](https://slack.com/help/articles/218688467-Add-RSS-feeds-to-Slack)、[email](https://zapier.com/apps/email/integrations/rss/1441/send-new-rss-feed-entries-via-email)、Discord 机器人（如 [Readybot](https://readybot.io/) 或 [RSS Feeds to Discord Bot](https://rss.app/en/bots/rssfeeds-discord-bot)）以及其他订阅工具集成。
</Callout>


[Agent Server](/langsmith/agent-server) 是一个用于创建和管理基于代理的应用程序的 API 平台。它提供内置持久性、任务队列，并支持大规模部署、配置和运行助手（代理工作流）。此变更日志记录了代理服务器版本的所有值得注意的更新、功能和修复。

## 发布节奏

`langgraph-api` 维护三个发布流：- `latest`：每天早上发布最新的错误修复和测试功能。语义版本控制使用次要版本之外的开发标签，例如 `0.9.0.dev1`。
- `rc`（候选版本）：每三周发布一次，并在关键错误回填的烘焙窗口期间根据需要进行修补。推荐给想要测试下一个稳定版本中的功能的用户。语义版本控制使用次要版本的 rc 标签，例如 `0.9.0rc1`。
- `stable`：从 rc 起每三周发布一次。修补了与安全相关的依赖项冲突或关键错误修复。这是新部署使用的默认版本，建议用于生产使用。语义版本控制使用小凹凸进行常规促销（例如`0.9.0`），并使用补丁凹凸进行回填（例如`0.9.1`）。

默认情况下，部署使用最新的 `stable` 版本，并在每个新修订版上自动更新到最新的 `stable` 版本。要固定到特定版本，请在 langgraph.json 中将 [⟦T12⟧](/langsmith/cli#pinning-api-version) 设置为所需版本。

## v0.13

最新版本：`0.13.0rc5`

<Callout icon="info" color="#F59E0B">
这条小行仍然是候选版本。最后一个稳定版本是`0.12.6`。
</Callout>

### 变化#### 新功能
- 将每个方法的一元响应字节速率限制添加到核心服务器。
- 添加对 Redis 连接的 AWS IAM 身份验证支持。
- 接受 A2A 文件部分作为 LangChain 多模式内容块。
- 减少 JavaScript API Docker 映像大小和 SBOM 组件数量。
- 添加对 A2A FilePart 输出和座席卡上可配置的每个助理媒体模式的支持。
- 添加对代理服务器运行时和映像的 Python 3.14 支持。
- 添加 `A2A_ALLOWED_TOOL_CALL_RESULTS` 环境变量以将 A2A 工具调用结果限制为工具名称白名单。#### 修复
- 修复 Go 核心日志中丢失的请求元数据和跟踪相关性。
- 修复启用 X 射线渲染时带有子图的工厂图形的自托管 Studio 图形可视化。
- 禁用速率限制并在速率限制配置无效时发出警告，而不是阻止服务器启动。
- 仅通过环境变量配置核心速率限制。
- 将 Postgres IAM 身份验证提供程序环境变量重命名为 `AGENT_POSTGRES_IAM_AUTH_PROVIDER`。
- 将 Redis IAM 身份验证提供程序环境变量重命名为 AGENT_REDIS_IAM_AUTH_PROVIDER。
- 修复队列入口点导入顺序，以防止与 API 一起运行时发生端口绑定冲突。
- 修复 A2A 流以将最终输出作为工件返回，并过滤任务历史记录以进行公共对话。
- 将存储搜索和 list_namespaces 修复为与段边界匹配的范围名称空间，并将名称空间标签视为文字字符。
- 修复了如果工作人员在确认取消之前死亡则可以重试取消的运行的错误。
- 修复工具路由使用 Send 对象时 JavaScript 图形检查点故障。
- 在 gRPC 序列化中拒绝 Send.timeout，以防止每个任务超时语义的无提示丢失。- 修复配置自定义静态加密时 DeltaChannel 线程的静默修剪失败问题。
- 恢复任务历史记录中的 A2A 工具结果 DataPart 和流状态更新。

#### 安全
- 在 Postgres 运行时创建条件线程期间强制执行线程授权过滤器 ([GHSA-747p-c922-m55f](https://github.com/langchain-ai/helm/security/advisories/GHSA-747p-c922-m55f))。受影响的版本并未始终在此路径上应用自定义`@auth`过滤器，因此知道其他用户线程 ID 的经过身份验证的用户可以针对该线程创建运行并观察或修改其对话状态。仅使用内存运行时的部署不受影响。

<Accordion title="v0.13 releases">
<Update label="2026-08-17" tags={["agent-server"]}>
## v0.13.0rc5

### 安全
- 在 Postgres 运行时创建条件线程期间强制执行线程授权过滤器 ([GHSA-747p-c922-m55f](https://github.com/langchain-ai/helm/security/advisories/GHSA-747p-c922-m55f))。受影响的版本并未始终在此路径上应用自定义 `@auth` 过滤器，因此知道其他用户线程 ID 的经过身份验证的用户可以针对该线程创建运行并观察或修改其对话状态。仅使用内存运行时的部署不受影响。

</Update>

<Update label="2026-08-12" tags={["agent-server"]}>
## v0.13.0rc4

### 新功能
- 添加 `A2A_ALLOWED_TOOL_CALL_RESULTS` 环境变量以将 A2A 工具调用结果限制为工具名称白名单。

</Update><Update label="2026-08-08" tags={["agent-server"]}>
## v0.13.0rc3

### 新功能
- 添加对 A2A FilePart 输出和座席卡上可配置的每个助理媒体模式的支持。
- 添加对代理服务器运行时和映像的 Python 3.14 支持。

### 修复
- 恢复任务历史记录中的 A2A 工具结果 DataPart 和流状态更新。

</Update>

<Update label="2026-08-06" tags={["agent-server"]}>
## v0.13.0rc2

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-08-04" tags={["agent-server"]}>
## v0.13.0rc1

### 新功能
- 将每个方法的一元响应字节速率限制添加到核心服务器。
- 添加对 Redis 连接的 AWS IAM 身份验证支持。
- 接受 A2A 文件部分作为 LangChain 多模式内容块。
- 减少 JavaScript API Docker 映像大小和 SBOM 组件数量。### 修复
- 修复 Go 核心日志中丢失的请求元数据和跟踪相关性。
- 修复启用 X 射线渲染时带有子图的工厂图形的自托管 Studio 图形可视化。
- 禁用速率限制并在速率限制配置无效时发出警告，而不是阻止服务器启动。
- 仅通过环境变量配置核心速率限制。
- 将 Postgres IAM 身份验证提供程序环境变量重命名为 `AGENT_POSTGRES_IAM_AUTH_PROVIDER`。
- 将 Redis IAM 身份验证提供程序环境变量重命名为 AGENT_REDIS_IAM_AUTH_PROVIDER。
- 修复队列入口点导入顺序，以防止与 API 一起运行时发生端口绑定冲突。
- 修复 A2A 流以将最终输出作为工件返回，并过滤任务历史记录以进行公共对话。
- 将存储搜索和 list_namespaces 修复为与段边界匹配的范围名称空间，并将名称空间标签视为文字字符。
- 修复了如果工作人员在确认取消之前死亡则可以重试取消的运行的错误。
- 修复工具路由使用 Send 对象时 JavaScript 图形检查点故障。
- 在 gRPC 序列化中拒绝 Send.timeout，以防止每个任务超时语义的无提示丢失。- 修复配置自定义静态加密时 DeltaChannel 线程的静默修剪失败问题。

</Update>

</Accordion>


## v0.12

最新版本：`0.12.6`

### 变化

#### 新功能
- 通过 OpenTelemetry Prometheus 客户端发出代理服务器指标，将延迟单位更新为毫秒并重命名多个池计数器。
- 添加助手、运行、crons 和线程的搜索结果成本限制。
- 为 Redis 运行队列添加选择加入跟踪日志记录。
- 添加 gRPC 支持的存储后端，支持使用 TTL 进行获取和放置操作。
- 将速率限制配置限制仪表和每个存储桶关键标签添加到运行时指标。
- 将删除、搜索和列出命名空间添加到 gRPC 存储。
- 在运行中添加`langsmith_session_name`字段以存储LangSmith跟踪项目名称。
- 添加对 Postgres 连接的 Azure IAM 身份验证支持。
- 添加对 Redis 连接的 Azure IAM 身份验证支持。
- 添加 Wolfi Python 和 Node.js 服务器映像的 FIPS 变体。
- 添加 `A2A_ALLOWED_TOOL_CALL_RESULTS` 环境变量以将 A2A 工具调用结果限制为工具名称白名单。#### 修复
- 将面向客户的支持链接更新到支持门户。
- 修复仅 TLS 集群上的 Redis 集群发布/订阅连接失败问题。
- 修复了在无状态线程命令上导致虚假 no_such_interrupt 错误的竞争条件。
- 修复在 JS 部署中使用stream_subgraphs=True 时删除子图的自定义流事件。
- 修复 join_stream 以在按流模式过滤时正确包含命名空间子图事件。
- 修复受影响助手、事件流和 inmem 部署路由的 OpenAPI 文档字符串解析警告。
- 通过等待中断持续来修复 WebSocket 输入响应中的竞争条件。
- 为每个入口点分配 JavaScript 工作端口，以防止共享网络命名空间中发生冲突。
- 修复 OTLP 指标客户端中的直方图存储桶配置。
- 修复每次运行上下文未转发到图形工厂函数的问题。
- 修复默认LangSmith跟踪副本初始化中的竞争条件。
- 修复内存中流发布中可能导致恐慌的竞争条件。
- 将 inmem 线程创建修复为默认值 None。
- 将 JS 部署的读取空闲超时从 15 秒延长至 30 秒。- 修复 JavaScript 远程图形运行以转发请求的持久性模式。
- 当给定无效的速率限制配置时，禁用速率限制并发出警告，而不是阻止启动。
- 重命名 Postgres 和 Redis 的 IAM 身份验证环境变量以防止命名冲突。
- 接受 A2A FilePart 输入并将其转换为 LangChain 多模式内容块。
- 修复并置 API 和队列工作进程之间的自定义 JavaScript 身份验证端口冲突。
- 修复存储搜索和 list_namespaces 以完全匹配命名空间段并将 `_` 和 `%` 视为文字字符。
- 修复工具路由使用 Send 对象时 JS 图形检查点失败的问题。
- 修复 A2A 流，以在终端状态之前将最终输出作为工件返回，并将任务历史记录限制为公共客户端和代理对话轮次。#### 安全
- 修复存储 API 丢弃由身份验证处理程序返回的授权过滤器的问题。
- 默认情况下在 Go 核心服务器中启用 FIPS 140-3 合规性。
- 通过链接基础映像的经过 FIPS 验证的 OpenSSL 提供程序，为 Wolfi/Chainguard FIPS Agent Server 映像中的 Node.js 加密启用 FIPS 模式。
- 在 Postgres 运行时创建条件线程期间强制执行线程授权过滤器 ([GHSA-747p-c922-m55f](https://github.com/langchain-ai/helm/security/advisories/GHSA-747p-c922-m55f))。受影响的版本并未始终在此路径上应用自定义 `@auth` 过滤器，因此知道其他用户线程 ID 的经过身份验证的用户可以针对该线程创建运行并观察或修改其对话状态。仅使用内存运行时的部署不受影响。

#### 一般说明
- 从服务器镜像中删除未使用的`bun`运行时。

<Accordion title="v0.12 releases">
<Update label="2026-08-18" tags={["agent-server"]}>
## v0.12.6

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-08-17" tags={["agent-server"]}>
## v0.12.5### 安全
- 在 Postgres 运行时创建条件线程期间强制执行线程授权过滤器 ([GHSA-747p-c922-m55f](https://github.com/langchain-ai/helm/security/advisories/GHSA-747p-c922-m55f))。受影响的版本并未始终在此路径上应用自定义 `@auth` 过滤器，因此知道其他用户线程 ID 的经过身份验证的用户可以针对该线程创建运行并观察或修改其对话状态。仅使用内存运行时的部署不受影响。

</Update>

<Update label="2026-08-13" tags={["agent-server"]}>
## v0.12.4

### 新功能
- 添加 `A2A_ALLOWED_TOOL_CALL_RESULTS` 环境变量以将 A2A 工具调用结果限制为工具名称白名单。

</Update>

<Update label="2026-08-11" tags={["agent-server"]}>
## v0.12.3

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-08-09" tags={["agent-server"]}>
## v0.12.2

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-08-07" tags={["agent-server"]}>
## v0.12.1

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-08-04" tags={["agent-server"]}>
## v0.12.0

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-08-04" tags={["agent-server"]}>
## v0.12.0rc10

### 修复
- 修复 A2A 流，以在终端状态之前将最终输出作为工件返回，并将任务历史记录限制为公共客户端和代理对话轮次。

</Update>

<Update label="2026-08-04" tags={["agent-server"]}>
## v0.12.0rc9### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-08-03" tags={["agent-server"]}>
## v0.12.0rc8

### 修复
- 修复存储搜索和 list_namespaces 以完全匹配命名空间段并将 `_` 和 `%` 视为文字字符。
- 修复工具路由使用 Send 对象时 JS 图形检查点失败的问题。

</Update>

<Update label="2026-07-24" tags={["agent-server"]}>
## v0.12.0rc7

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-07-23" tags={["agent-server"]}>
## v0.12.0rc6

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-07-23" tags={["agent-server"]}>
## v0.12.0rc5

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-07-21" tags={["agent-server"]}>
## v0.12.0rc4

### 修复
- 接受 A2A FilePart 输入并将其转换为 LangChain 多模式内容块。
- 修复并置 API 和队列工作进程之间的自定义 JavaScript 身份验证端口冲突。

</Update>

<Update label="2026-07-20" tags={["agent-server"]}>
## v0.12.0rc3

### 修复
- 重命名 Postgres 和 Redis 的 IAM 身份验证环境变量以防止命名冲突。

</Update>

<Update label="2026-07-17" tags={["agent-server"]}>
## v0.12.0rc2

### 修复
- 当给定无效的速率限制配置时，禁用速率限制并发出警告，而不是阻止启动。

</Update>

<Update label="2026-07-15" tags={["agent-server"]}>
## v0.12.0rc1### 新功能
- 通过 OpenTelemetry Prometheus 客户端发出代理服务器指标，将延迟单位更新为毫秒并重命名多个池计数器。
- 添加助手、运行、crons 和线程的搜索结果成本限制。
- 为 Redis 运行队列添加选择加入跟踪日志记录。
- 添加 gRPC 支持的存储后端，支持使用 TTL 进行获取和放置操作。
- 将速率限制配置限制仪表和每个存储桶关键标签添加到运行时指标。
- 将删除、搜索和列出命名空间添加到 gRPC 存储。
- 在运行中添加`langsmith_session_name`字段来存储LangSmith跟踪项目名称。
- 添加对 Postgres 连接的 Azure IAM 身份验证支持。
- 添加对 Redis 连接的 Azure IAM 身份验证支持。
- 添加 Wolfi Python 和 Node.js 服务器映像的 FIPS 变体。### 修复
- 将面向客户的支持链接更新到支持门户。
- 修复仅 TLS 集群上的 Redis 集群发布/订阅连接失败问题。
- 修复了在无状态线程命令上导致虚假 no_such_interrupt 错误的竞争条件。
- 修复在 JS 部署中使用stream_subgraphs=True 时删除子图的自定义流事件。
- 修复 join_stream 以在按流模式过滤时正确包含命名空间子图事件。
- 修复受影响助手、事件流和 inmem 部署路由的 OpenAPI 文档字符串解析警告。
- 通过等待中断持续来修复 WebSocket 输入响应中的竞争条件。
- 为每个入口点分配 JavaScript 工作端口，以防止共享网络命名空间中发生冲突。
- 修复 OTLP 指标客户端中的直方图存储桶配置。
- 修复每次运行上下文未转发到图形工厂函数的问题。
- 修复默认LangSmith跟踪副本初始化中的竞争条件。
- 修复内存中流发布中可能导致恐慌的竞争条件。
- 将 inmem 线程创建修复为默认值 None。
- 将 JS 部署的读取空闲超时从 15 秒延长至 30 秒。- 修复 JavaScript 远程图形运行以转发请求的持久性模式。

### 安全
- 修复存储 API 丢弃由身份验证处理程序返回的授权过滤器的问题。
- 默认情况下在 Go 核心服务器中启用 FIPS 140-3 合规性。
- 通过链接基础映像的经过 FIPS 验证的 OpenSSL 提供程序，为 Wolfi/Chainguard FIPS Agent Server 映像中的 Node.js 加密启用 FIPS 模式。

### 一般说明
- 从服务器镜像中删除未使用的`bun`运行时。

</Update>

</Accordion>


## v0.11

最新版本：`0.11.3`

### 变化#### 新功能
- 添加了 DeltaChannel 感知修剪，仅保留状态重建所需的最小祖先检查点，取代了之前拒绝修剪具有活动 Delta 通道的线程的方法。支持 Postgres、SQLite、DeferredDelete 和内存运行时。
- 为 MongoDB 检查点添加了 DeltaChannel 感知修剪，仅保留状态重建所需的最小祖先检查点和 delta 通道 blob。
- 添加了选择加入 Prometheus 指标抓取支持。设置 `LSD_PROM_METRICS_ENABLED=true` 以在端口 `LSD_PROM_METRICS_PORT`（默认 9464）的专用 Prometheus 抓取端点上公开 OTel 指标（运行生命周期、延迟、流、工作量指标）。当两者都配置完毕后，Datadog OTLP 推送将继续与 Prometheus 一起工作。
- 添加了针对一元 core-api RPC 和 Redis 流发布字节的选择加入 Go 核心速率限制，以及 Redis 支持的 GCRA 强制、影子/强制模式以及带有 YAML 覆盖的 `LS_RATE_LIMITS` 引导配置。
- 允许传递自定义证书和密钥文件（`ssl_certfile`、`ssl_keyfile`）以通过 HTTPS 运行开发服务器。
- 添加了 `coreApi.runQueueTraceLog` 配置标志（`LSD_RUN_QUEUE_TRACE_LOG` 环境变量，默认为 `false`）以启用详细的 Redis 运行队列跟踪日志。- 添加了速率限制可观测性指标，包括配置限制指标（`lg_api_rate_limit_configured_rate`、`lg_api_rate_limit_configured_burst`）以及决策、错误和成本指标上的每个存储桶`rate_limit_key`标签。
- 为助手、运行、crons 和线程搜索添加了核心搜索成本率限制，通过现有的速率限制配置和指标进行连接。
- 在每次运行中添加了 `langsmith_session_name` 字段。该字段是启用跟踪时的LangSmith跟踪项目名称。通过 `/info` 公开支持，以便 Studio 可以检测支持该字段的 API 版本。
- 添加了 Wolfi Python 和 JS 服务器映像的 `-fips` 变体（例如 `3.13-wolfi-fips`、`22-wolfi-fips`），使用 Go FIPS 140 加密模块和适用于 Node.js 的 FIPS 强化 OpenSSL 构建。
- 添加了 DeltaChannel 感知修剪，仅保留状态重建所需的最小祖先检查点，取代了之前拒绝修剪具有活动 Delta 通道的线程的方法。
- 在每次运行中添加了 `langsmith_session_name` 字段，并通过 `/info` 公开支持，以便 Studio 可以检测支持该字段的 API 版本。#### 修复
- 修复了协议 v2 在 JS 图上运行时默默失败的问题。由于严格的流模式验证，sidecar 以 400 拒绝了`streamEvents`，错误被吞没，并运行错误报告成功，执行了 0 个节点。在 HTTP 边界处放宽了流模式验证，现在在非 2xx sidecar 响应上引发明显的错误，而不是掩盖故障。
- 修复了针对 JS sidecar（远程）图的协议 v2 事件流，该事件流通过遗留重建路径错误地提供服务。远程图现在使用 LangGraphJS 的本机 v3 流进行 v2 事件流运行，解决工具调用不渲染、无头中断从不执行或恢复以及恢复后最终消息上出现 `400: tool_use ids must be unique` 错误的问题。
- 现在删除运行会跳过使用 DeltaChannel 的线程的检查点删除，并仅删除运行记录。存储增量写入的检查点稍后检查点所依赖的将被保留。使用线程修剪 API 回收增量通道线程上的检查点存储。
- 修复了 Prometheus 指标导出并调整了 OpenTelemetry 导出器配置。- 将 0.11.0rc1 中引入的`starlette`下限放回到`>=0.38.6`，因此`langgraph-api`可以与固定旧版 Starlette 版本的环境一起安装。构建仍然通过锁定文件将 Starlette 解析为 1.0.1。
- 修复了 Event Streaming v2 的 HTTP `input.respond` 验证，以从持久线程行读取挂起的中断，而不是重建线程状态，从而防止有效的 HITL 恢复在重新连接、重新部署或线程状态查找失败后错误地返回 `no_such_interrupt`。
- 修复了`input.respond`，因此可选的`update`和`goto`参数将转发到与恢复值相同的`Command`。
- 修复了从非增量通道迁移到 DeltaChannel 的通道的 DeltaChannel 重播问题。检查点无法正确识别头部种子检查点，这可能会为非加法减速器产生错误的重建状态。
- 修复了在 JS 部署上使用 `stream_mode=["custom"]` 和 `stream_subgraphs=True` 时，从子图发出的自定义流事件不会转发到客户端的问题。
- 修复了使用 `stream_mode` 过滤器调用 `join_stream` 可能导致子图中的非消息事件从结果中错误过滤的错误。- 修复了当 API 服务器和队列工作线程作为同一 Kubernetes pod 中的单独容器运行时的 JS 工作线程端口冲突。队列入口点现在偏移环回端口。
- 修复了 Redis 集群 pub/sub 在 `REDIS_CLUSTER=true` 时无法在仅 TLS 集群上连接的问题，之前曾尝试拨打端口 `0`。
- 修复了指标迁移后的 OTLP 延迟直方图存储桶配置，因此延迟指标使用转换为毫秒的传统秒级存储桶，为长时间 HTTP 轮询、队列等待和运行执行恢复准确的 p95/p99。
- 使队列运行查询字段选择明确以实现向后兼容性，因此可以添加新的运行架构字段，而不会在回滚期间破坏旧服务器版本。
- 当给定无效的速率限制配置时，禁用速率限制并发出警告，而不是阻止启动。#### 安全
- 在 Postgres 运行时创建条件线程期间强制执行线程授权过滤器 ([GHSA-747p-c922-m55f](https://github.com/langchain-ai/helm/security/advisories/GHSA-747p-c922-m55f))。受影响的版本并未始终在此路径上应用自定义 `@auth` 过滤器，因此知道其他用户线程 ID 的经过身份验证的用户可以针对该线程创建运行并观察或修改其对话状态。仅使用内存运行时的部署不受影响。

#### 一般说明
- 包括 PyJWT、LangSmith、密码学、Hono、undici、`golang.org/x/net`、`golang.org/x/crypto` 和 Starlette 的安全依赖项更新。
- 代理服务器指标现在通过专用 Prometheus 抓取端点上的 OpenTelemetry/Prometheus 客户端发出（`LSD_PROM_METRICS_PORT`，默认 9464）。设置 `LSD_PROM_METRICS_ENABLED=true` 以启用端点，设置 `EXPOSE_INTERNAL_METRICS_PROMETHEUS=true` 以公开从主 API `/metrics` 路径迁移的内部指标。默认情况下，Prometheus 端点仅提供 LSD 部署 UI 指标。- 对于 Prometheus 抓取工具和仪表板来说，**可能会造成破坏**：点收集器位于 OTLP Prometheus 端口，而不是主 API `/metrics` 路径。 `lg_api_http_requests_latency_seconds` 现在是 `lg_api_http_requests_latency` 并报告毫秒而不是秒。池请求计数器现在使用 `_total` 后缀（`lg_api_pg_pool_requests_queued_total`、`lg_api_pg_pool_requests_errors_total`）。删除了 `lg_api_pending_runs_wait_time_*` 仪表，取而代之的是 `lg_api_run_queue_wait_time_1st_attempt` 延迟直方图。
- Wolfi (`chainguard-base-fips`) 服务器映像现在提供符合 FIPS 的 Go 核心服务器和 FIPS 模式节点，并且不再包含未使用的 Bun 运行时。
- 对 `thread_ls_user_id_idx` 和 `thread_assistant_id_idx` btree 索引应用搁浅的 Postgres 迁移 `061`。

<Accordion title="v0.11 releases">
<Update label="2026-08-17" tags={["agent-server"]}>
## v0.11.3

### 安全
- 在 Postgres 运行时创建条件线程期间强制执行线程授权过滤器 ([GHSA-747p-c922-m55f](https://github.com/langchain-ai/helm/security/advisories/GHSA-747p-c922-m55f))。受影响的版本并未始终在此路径上应用自定义 `@auth` 过滤器，因此知道其他用户线程 ID 的经过身份验证的用户可以针对该线程创建运行并观察或修改其对话状态。仅使用内存运行时的部署不受影响。

</Update>

<Update label="2026-07-28" tags={["agent-server"]}>
## v0.11.2

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-07-17" tags={["agent-server"]}>
## v0.11.1### 修复
- 当给定无效的速率限制配置时，禁用速率限制并发出警告，而不是阻止启动。

</Update>

<Update label="1970-01-01" tags={["agent-server"]}>
## v0.11.0

### 新功能
- 添加了 DeltaChannel 感知修剪，仅保留状态重建所需的最小祖先检查点，取代了之前拒绝修剪具有活动 Delta 通道的线程的方法。
- 添加了选择加入 Prometheus 指标抓取支持。设置 `LSD_PROM_METRICS_ENABLED=true` 以在端口 `LSD_PROM_METRICS_PORT`（默认 9464）的专用 Prometheus 抓取端点上公开 OTel 指标（运行生命周期、延迟、流、工作量指标）。当两者都配置完毕后，Datadog OTLP 推送将继续与 Prometheus 一起工作。
- 添加了 `coreApi.runQueueTraceLog` 配置标志（`LSD_RUN_QUEUE_TRACE_LOG` 环境变量，默认为 `false`）以启用详细的 Redis 运行队列跟踪日志。
- 在每次运行中添加了 `langsmith_session_name` 字段，并通过 `/info` 公开支持，以便 Studio 可以检测支持该字段的 API 版本。
- 添加了 Wolfi Python 和 JS 服务器映像的 `-fips` 变体（例如 `3.13-wolfi-fips`、`22-wolfi-fips`），使用 Go FIPS 140 加密模块和适用于 Node.js 的 FIPS 强化 OpenSSL 构建。### 修复
- 修复了协议 v2 在 JS 图上运行时默默失败的问题。由于严格的流模式验证，sidecar 以 400 拒绝了`streamEvents`，错误被吞没，并运行错误地报告成功，执行了 0 个节点。在 HTTP 边界处放宽了流模式验证，现在在非 2xx sidecar 响应上引发明显的错误，而不是掩盖故障。
- 修复了针对 JS sidecar（远程）图的协议 v2 事件流，该事件流通过遗留重建路径错误地提供服务。远程图现在使用 LangGraphJS 的本机 v3 流进行 v2 事件流运行，解决工具调用不渲染、无头中断从不执行或恢复以及恢复后最终消息上出现 `400: tool_use ids must be unique` 错误的问题。
- 现在删除运行会跳过使用 DeltaChannel 的线程的检查点删除，并仅删除运行记录。存储增量写入的检查点稍后检查点所依赖的将被保留。使用线程修剪 API 回收增量通道线程上的检查点存储。- 修复了 Event Streaming v2 的 HTTP `input.respond` 验证，以从持久线程行读取挂起的中断，而不是重建线程状态，从而防止有效的 HITL 恢复在重新连接、重新部署或线程状态查找失败后错误地返回 `no_such_interrupt`。
- 修复了`input.respond`，因此可选的`update`和`goto`参数将转发到与恢复值相同的`Command`。
- 修复了从非增量通道迁移到 DeltaChannel 的通道的 DeltaChannel 重播问题。检查点无法正确识别头部种子检查点，这可能会为非加法减速器产生错误的重建状态。
- 修复了在 JS 部署上使用 `stream_mode=["custom"]` 和 `stream_subgraphs=True` 时，从子图发出的自定义流事件不会转发到客户端的问题。
- 修复了使用 `stream_mode` 过滤器调用 `join_stream` 可能导致子图中的非消息事件从结果中错误过滤的错误。
- 修复了 Redis 集群 pub/sub 在 `REDIS_CLUSTER=true` 时无法在仅 TLS 集群上连接的问题，之前曾尝试拨打端口 `0`。- 使队列运行查询字段选择明确以实现向后兼容性，因此可以添加新的运行架构字段，而不会在回滚期间破坏旧服务器版本。

</Update>

<Update label="2026-07-09" tags={["agent-server"]}>
## v0.11.0rc14

### 修复
- 修复了指标迁移后的 OTLP 延迟直方图存储桶配置，因此延迟指标使用转换为毫秒的传统秒级存储桶，为长时间 HTTP 轮询、队列等待和运行执行恢复准确的 p95/p99。
- 使队列运行查询字段选择明确以实现向后兼容性，因此可以添加新的运行架构字段，而不会在回滚期间破坏旧服务器版本。

</Update>

<Update label="2026-07-08" tags={["agent-server"]}>
## v0.11.0rc13

### 修复
- 修复了当 API 服务器和队列工作线程作为同一 Kubernetes pod 中的单独容器运行时的 JS 工作线程端口冲突。队列入口点现在偏移环回端口。
- 修复了 Redis 集群 pub/sub 在 `REDIS_CLUSTER=true` 时无法在仅 TLS 集群上连接的问题，之前曾尝试拨打端口 `0`。

</Update>

<Update label="2026-07-08" tags={["agent-server"]}>
## v0.11.0rc12

### 新功能
- 添加了 Wolfi Python 和 JS 服务器映像的 `-fips` 变体（例如 `3.13-wolfi-fips`、`22-wolfi-fips`），使用 Go FIPS 140 加密模块和适用于 Node.js 的 FIPS 强化 OpenSSL 构建。</Update>

<Update label="2026-07-07" tags={["agent-server"]}>
## v0.11.0rc11

### 新功能
- 在每次运行中添加了 `langsmith_session_name` 字段。该字段是启用跟踪时的LangSmith跟踪项目名称。通过 `/info` 公开支持，以便 Studio 可以检测支持该字段的 API 版本。

### 一般说明
- 对 `thread_ls_user_id_idx` 和 `thread_assistant_id_idx` btree 索引应用搁浅的 Postgres 迁移 `061`。

</Update>

<Update label="2026-07-02" tags={["agent-server"]}>
## v0.11.0rc10

### 新功能
- 为助手、运行、crons 和线程搜索添加了核心搜索成本率限制，通过现有的速率限制配置和指标进行连接。

### 一般说明
- Wolfi (`chainguard-base-fips`) 服务器映像现在提供符合 FIPS 的 Go 核心服务器和 FIPS 模式节点，并且不再包含未使用的 Bun 运行时。

</Update>

<Update label="2026-07-01" tags={["agent-server"]}>
## v0.11.0rc9

### 修复
- 修复了使用 `stream_mode` 过滤器调用 `join_stream` 可能导致子图中的非消息事件从结果中错误过滤的错误。

</Update>

<Update label="2026-06-30" tags={["agent-server"]}>
## v0.11.0rc8### 一般说明
- 代理服务器指标现在通过专用 Prometheus 抓取端点上的 OpenTelemetry/Prometheus 客户端发出（`LSD_PROM_METRICS_PORT`，默认 9464）。设置 `LSD_PROM_METRICS_ENABLED=true` 以启用端点，设置 `EXPOSE_INTERNAL_METRICS_PROMETHEUS=true` 以公开从主 API `/metrics` 路径迁移的内部指标。默认情况下，Prometheus 端点仅提供 LSD 部署 UI 指标。
- 对于 Prometheus 抓取工具和仪表板来说，**可能会造成破坏**：点收集器位于 OTLP Prometheus 端口，而不是主 API `/metrics` 路径。 `lg_api_http_requests_latency_seconds` 现在是 `lg_api_http_requests_latency` 并报告毫秒而不是秒。池请求计数器现在使用 `_total` 后缀（`lg_api_pg_pool_requests_queued_total`、`lg_api_pg_pool_requests_errors_total`）。删除了 `lg_api_pending_runs_wait_time_*` 仪表，取而代之的是 `lg_api_run_queue_wait_time_1st_attempt` 延迟直方图。

</Update>

<Update label="2026-06-30" tags={["agent-server"]}>
## v0.11.0rc7

### 修复
- 修复了在 JS 部署上使用 `stream_mode=["custom"]` 和 `stream_subgraphs=True` 时，从子图发出的自定义流事件不会转发到客户端的问题。

### 一般说明
- 包括 PyJWT、LangSmith、密码学、Hono、undici、`golang.org/x/net`、`golang.org/x/crypto` 和 Starlette 的安全依赖项更新。

</Update>

<Update label="2026-06-26" tags={["agent-server"]}>
## v0.11.0rc6### 新功能
- 添加了速率限制可观测性指标，包括配置限制仪表（`lg_api_rate_limit_configured_rate`、`lg_api_rate_limit_configured_burst`）以及决策、错误和成本指标上的每个存储桶`rate_limit_key`标签。

</Update>

<Update label="2026-06-25" tags={["agent-server"]}>
## v0.11.0rc5

### 修复
- 修复了从非增量通道迁移到 DeltaChannel 的通道的 DeltaChannel 重播问题。检查点无法正确识别头部种子检查点，这可能会为非加法减速器产生错误的重建状态。

</Update>

<Update label="2026-06-18" tags={["agent-server"]}>
## v0.11.0rc4

### 修复
- 修复了 Event Streaming v2 的 HTTP `input.respond` 验证，以从持久线程行读取挂起的中断，而不是重建线程状态，从而防止有效的 HITL 恢复在重新连接、重新部署或线程状态查找失败后错误地返回 `no_such_interrupt`。
- 修复了`input.respond`，因此可选的`update`和`goto`参数将转发到与恢复值相同的`Command`。

</Update>

<Update label="2026-06-18" tags={["agent-server"]}>
## v0.11.0rc3

### 新功能
- 添加了`coreApi.runQueueTraceLog`配置标志（`LSD_RUN_QUEUE_TRACE_LOG`环境变量，默认`false`）以启用详细的Redis运行队列跟踪日志。

</Update>

<Update label="2026-06-17" tags={["agent-server"]}>
## v0.11.0rc2### 修复
- 将0.11.0rc1中引入的`starlette`下限放回到`>=0.38.6`，因此`langgraph-api`可以与固定旧Starlette版本的环境一起安装。构建仍然通过锁定文件将 Starlette 解析为 1.0.1。

</Update>

<Update label="2026-06-11" tags={["agent-server"]}>
## v0.11.0rc1

### 一般说明
- 包括依赖项和安全维护更新。

### 新功能
- 添加了 DeltaChannel 感知修剪，仅保留状态重建所需的最小祖先检查点，取代了之前拒绝修剪具有活动 Delta 通道的线程的方法。支持 Postgres、SQLite、DeferredDelete 和内存运行时。
- 为 MongoDB 检查点添加了 DeltaChannel 感知修剪，仅保留状态重建所需的最小祖先检查点和 delta 通道 blob。
- 添加了选择加入 Prometheus 指标抓取支持。设置 `LSD_PROM_METRICS_ENABLED=true` 以在端口 `LSD_PROM_METRICS_PORT`（默认 9464）的专用 Prometheus 抓取端点上公开 OTel 指标（运行生命周期、延迟、流、工作量指标）。当两者都配置完毕后，Datadog OTLP 推送将继续与 Prometheus 一起工作。- 添加了针对一元 core-api RPC 和 Redis 流发布字节的选择加入 Go 核心速率限制，以及 Redis 支持的 GCRA 强制、影子/强制模式以及带有 YAML 覆盖的 `LS_RATE_LIMITS` 引导配置。
- 允许传递自定义证书和密钥文件（`ssl_certfile`、`ssl_keyfile`）以通过 HTTPS 运行开发服务器。

### 修复
- 修复了协议 v2 在 JS 图上运行时默默失败的问题。由于严格的流模式验证，sidecar 以 400 拒绝了`streamEvents`，错误被吞没，并运行错误地报告成功，执行了 0 个节点。在 HTTP 边界处放宽了流模式验证，现在在非 2xx sidecar 响应上引发明显的错误，而不是掩盖故障。
- 修复了针对 JS sidecar（远程）图的协议 v2 事件流，该事件流通过遗留重建路径错误地提供服务。远程图现在使用 LangGraphJS 的本机 v3 流进行 v2 事件流运行，解决工具调用不渲染、无头中断从不执行或恢复以及恢复后最终消息上出现 `400: tool_use ids must be unique` 错误的问题。- 现在删除运行会跳过使用 DeltaChannel 的线程的检查点删除，并仅删除运行记录。存储增量写入的检查点稍后检查点所依赖的将被保留。使用线程修剪 API 回收增量通道线程上的检查点存储。
- 修复了 Prometheus 指标导出并调整了 OpenTelemetry 导出器配置。

</Update>

</Accordion>


## v0.10

最新版本：`0.10.3`

### 变化

#### 新功能
- 添加了按 ID 端点 (`GET /runs/crons/{cron_id}`) 进行的 cron 检索。
- 添加了 DeltaChannel 感知修剪，仅保留状态重建所需的最小祖先检查点，取代了之前拒绝使用活动 Delta 通道修剪线程的行为。支持 Postgres、SQLite、DeferredDelete 和内存运行时。#### 修复
- 修复了事件流 v2 运行开始处理，以便遵守通过 `config.configurable.checkpoint_id` 提供的检查点重播目标。
- 修复了事件流 v2 `input.respond` 通过 HTTP `POST /commands` 返回 `no_such_interrupt` 的 postgres 后端合法中断。
- 修复了先前时间旅行运行中的线程 `checkpoint_map` 会持续存在并污染后续 `Command(resume=...)` 的错误，导致嵌套子图从一开始就错误地重放。
- 修复了协议 v2 在 JS 图上运行时默默失败的问题。由于严格的流模式验证，sidecar 以 400 拒绝了`streamEvents`，错误被吞没，并运行错误地报告成功，执行了 0 个节点。在 HTTP 边界处放宽了流模式验证，现在在非 2xx sidecar 响应上引发明显的错误，而不是掩盖故障。
- 修复了针对 JS sidecar（远程）图的协议 v2 事件流，该事件流通过遗留重建路径错误地提供服务。远程图现在使用 LangGraphJS 的本机 v3 流进行 v2 事件流运行，解决工具调用不渲染、无头中断从不执行或恢复以及恢复后最终消息上出现 `400: tool_use ids must be unique` 错误的问题。- 使队列运行查询向后兼容添加新字段的更高版本。

#### 安全
- **可能会破坏** 现在默认会拒绝环回 Webhook 目标，以修复身份验证绕过原语 ([GHSA-2c9q-c2q9-qgqv](https://github.com/langchain-ai/helm/security/advisories/GHSA-2c9q-c2q9-qgqv))。 `webhooks.url.disable_loopback` 策略现在默认为 `true`，阻止相对 URL Webhooks（通过进程内 ASGI 传输进行调度并绕过身份验证），以及 localhost / 127.x / ::1 / host.docker.internal 绝对 URL 和 DNS 解析到环回范围的任何主机名（减轻 DNS 重新绑定）。合法需要环回 Webhook 的部署（例如，具有本地主机 Webhook 接收器的 `langgraph dev`，或分派到安装在同一服务器上的自定义 FastAPI 路由的生产设置）可以通过在 `langgraph.json`（或等效的 `LANGGRAPH_WEBHOOKS` JSON env var）中设置 `webhooks.url.disable_loopback: false` 来选择重新加入。仅当您控制环回 Webhook 到达的路由时才执行此操作，因为这些路由是在未经身份验证的情况下调度的。- **可能会破坏** `POST /runs` 和 `POST /threads/{thread_id}/runs` 现在通过 `assistants.read` auth 事件（匹配 cron 创建和直接 GET）授权附加的助手，而不是之前使用的具有不完整负载的 `assistants.search` 事件 ([GHSA-jfj5-wrj9-63x4](https://github.com/langchain-ai/helm/security/advisories/GHSA-jfj5-wrj9-63x4))。仅注册 `@auth.on.assistants.read`（且没有 `.search` 处理程序）的部署容易受到跨用户授权绕过的攻击；现在将在运行创建路径上调用它们现有的读取处理程序。作为深度防御的后续措施，客户端提供的 run/cron 元数据不再从 `Runs.put` 或 `Crons.put` 转发到 `assistants.read` auth 事件有效负载，并且 inmem/postgres 运行时现在同意值形状。使用自定义身份验证处理程序进行部署的重大更改：(1) 之前在运行创建期间调用的任何 `@auth.on.assistants.search` 处理程序不再在那里调用 - 确保您有一个等效的 `@auth.on.assistants.read` 处理程序返回相同的所有者样式过滤器； (2) 从 run/cron 创建调用的 `assistants.read` 事件上的 `value["metadata"]` 不再填充，因此检查或改变它的处理程序必须将该逻辑移至 `@auth.on.runs.create_run` 和 `@auth.on.crons.create` 并依赖于返回过滤器来执行所有权。- 部署现在会在服务器开始时看到一个结构化警告，列出每个未覆盖的调度路径以及要复制的默认拒绝片段。对于注册全局 `@auth.on` 处理程序或仅使用 `@auth.authenticate` 而不使用任何资源级处理程序的部署，该警告不会出现。

#### 一般说明
- v0.10.0rc1 包含安全性和正确性方面的重大更改。更多详情请参阅[Security section](#security)。
- v0.10.0是v0.10.0rc线的稳定升级。特别注意 0.10.0rc1 中潜在的破坏性安全更改。

<Accordion title="v0.10 releases">
<Update label="2026-07-09" tags={["agent-server"]}>
## v0.10.3

### 修复
- 使队列运行查询向后兼容添加新字段的更高版本。

</Update>

<Update label="2026-07-08" tags={["agent-server"]}>
## v0.10.2

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-07-06" tags={["agent-server"]}>
## v0.10.1

### 修复
- 包括依赖项和安全维护更新。

</Update>

<Update label="2026-06-10" tags={["agent-server"]}>
## v0.10.0

### 一般说明
- v0.10.0是v0.10.0rc线的稳定升级。特别注意 0.10.0rc1 中潜在的破坏性安全更改。
- 包括依赖项和安全维护更新。### 新功能
- 添加了 DeltaChannel 感知修剪，仅保留状态重建所需的最小祖先检查点，取代了之前拒绝使用活动 Delta 通道修剪线程的行为。支持 Postgres、SQLite、DeferredDelete 和内存运行时。

</Update>

<Update label="2026-06-05" tags={["agent-server"]}>
## v0.10.0rc3

### 修复
- 修复了针对 JS sidecar（远程）图的协议 v2 事件流，该事件流通过遗留重建路径错误地提供服务。远程图现在使用 LangGraphJS 的本机 v3 流进行 v2 事件流运行，解决工具调用不渲染、无头中断从不执行或恢复以及恢复后最终消息上出现 `400: tool_use ids must be unique` 错误的问题。

</Update>

<Update label="2026-06-02" tags={["agent-server"]}>
## v0.10.0rc2

### 修复
- 修复了协议 v2 在 JS 图上运行时默默失败的问题。由于严格的流模式验证，sidecar 以 400 拒绝了`streamEvents`，错误被吞没，并运行错误地报告成功，执行了 0 个节点。在 HTTP 边界处放宽了流模式验证，现在在非 2xx sidecar 响应上引发明显的错误，而不是掩盖故障。

</Update>

<Update label="2026-06-01" tags={["agent-server"]}>
## v0.10.0rc1### 一般说明
- v0.10.0rc1 包含安全性和正确性方面的重大更改。更多详情请参阅[Security section](#security)。
- 包括依赖项和安全维护更新。

### 新功能
- 添加了按 ID 端点 (`GET /runs/crons/{cron_id}`) 进行的 cron 检索。

### 修复
- 修复了事件流 v2 运行开始处理，以便遵守通过 `config.configurable.checkpoint_id` 提供的检查点重播目标。
- 修复了事件流 v2 `input.respond` 通过 HTTP `POST /commands` 返回 `no_such_interrupt` 的 postgres 后端合法中断。
- 修复了先前时间旅行运行中的线程 `checkpoint_map` 会持续存在并污染后续 `Command(resume=...)` 的错误，导致嵌套子图从一开始就错误地重放。### 安全
- **可能会破坏** 现在默认会拒绝环回 Webhook 目标，以修复身份验证绕过原语 ([GHSA-2c9q-c2q9-qgqv](https://github.com/langchain-ai/helm/security/advisories/GHSA-2c9q-c2q9-qgqv))。 `webhooks.url.disable_loopback` 策略现在默认为 `true`，阻止相对 URL Webhook（通过进程内 ASGI 传输进行调度并绕过身份验证），以及 localhost / 127.x / ::1 / host.docker.internal 绝对 URL 和 DNS 解析到环回范围的任何主机名（减轻 DNS 重新绑定）。合法需要环回 Webhook 的部署（例如，具有本地主机 Webhook 接收器的 `langgraph dev`，或分派到安装在同一服务器上的自定义 FastAPI 路由的生产设置）可以通过在 `langgraph.json`（或等效的 `LANGGRAPH_WEBHOOKS` JSON env var）中设置 `webhooks.url.disable_loopback: false` 来选择重新加入。仅当您控制环回 Webhook 到达的路由时才执行此操作，因为这些路由是在未经身份验证的情况下调度的。- **可能会破坏** `POST /runs` 和 `POST /threads/{thread_id}/runs` 现在通过 `assistants.read` auth 事件（匹配 cron 创建和直接 GET）授权附加的助手，而不是之前使用的具有不完整负载的 `assistants.search` 事件 ([GHSA-jfj5-wrj9-63x4](https://github.com/langchain-ai/helm/security/advisories/GHSA-jfj5-wrj9-63x4))。仅注册 `@auth.on.assistants.read`（且没有 `.search` 处理程序）的部署容易受到跨用户授权绕过的影响；现在将在运行创建路径上调用它们现有的读取处理程序。作为深度防御的后续措施，客户端提供的 run/cron 元数据不再从 `Runs.put` 或 `Crons.put` 转发到 `assistants.read` auth 事件有效负载，并且 inmem/postgres 运行时现在同意值形状。使用自定义身份验证处理程序进行部署的重大更改：(1) 之前在运行创建期间调用的任何 `@auth.on.assistants.search` 处理程序不再被调用 — 确保您有一个等效的 `@auth.on.assistants.read` 处理程序返回相同的所有者样式过滤器； (2) 从 run/cron 创建调用的 `assistants.read` 事件上的 `value["metadata"]` 不再填充，因此检查或改变它的处理程序必须将该逻辑移至 `@auth.on.runs.create_run` 和 `@auth.on.crons.create` 并依赖于返回过滤器来执行所有权。- 部署现在会在服务器开始时看到一个结构化警告，列出每个未覆盖的调度路径以及要复制的默认拒绝片段。对于注册全局 `@auth.on` 处理程序或仅使用 `@auth.authenticate` 而不使用任何资源级处理程序的部署，该警告不会出现。

</Update>

</Accordion>

## v0.9.0

### 一般说明
- v0.9.0是v0.9.0rc线的稳定升级。
- 包括依赖项和安全维护更新。

<Update label="2026-05-11" tags={["agent-server"]}>
## v0.9.0rc1

### 一般说明
- 在 /runs/crons/search 和 /runs/crons/count 中添加了 cron 元数据过滤，匹配助手/线程已有的元数据过滤行为。
- 添加了 Postgres 检查点池调整旋钮，适用于一次加载大量大型检查点的情况。现在可以设置 LANGGRAPH_CHECKPOINTER_POSTGRES_POOL_MIN_SIZE 和 LANGGRAPH_CHECKPOINTER_POSTGRES_POOL_TIMEOUT_SECONDS。
- 修复了当线程没有先前检查点时 mongo 检查点中的 update_state 崩溃的问题。
- 包括安全漏洞的依赖项更新。### 新功能
#### 达美渠道支持
现在支持增量通道，因此检查点可以存储增量状态更新，而不是重复存储完整通道有效负载，这有助于处理大型、重附加状态（例如消息历史记录）。

要使用，请在图形状态中使用 LangGraph 的 DeltaChannel 缩减器模式定义状态通道。
当安装的 langgraph >= 1.2 时启用此行为。
文件：[DeltaChannel reference](/oss/python/langgraph/pregel#deltachannel)

#### 事件流 API
正在引入事件流 API，并提供统一的事件流表面，旨在实现更丰富的实时运行事件和命令/事件工作流程。

功能标志 `FF_V2_EVENT_STREAMING` 可以设置为 true 以启用新的事件流 API。

新的端点包括：
- `POST /threads/{thread_id}/stream/events`
- `POST /threads/{thread_id}/commands`
- `WS /threads/{thread_id}/stream/events`

文件：
- [Agent Server API reference](/langsmith/server-api-ref)
- [LangGraph event streaming reference](/oss/python/langgraph/event-streaming)

</Update>

<Update label="2026-05-05" tags={["agent-server"]}>
## v0.8.7

- 暂时恢复#3296 中的更改，以解决即将发布的 0.8.6 版本的问题。
</Update>

<Update label="2026-05-04" tags={["agent-server"]}>
## v0.8.6- 将 DeltaChannel 集成到 Postgres 检查点中，以实现高效的快照和增量处理。
- 向 API 引入了新的 v2 流原语以增强数据处理。
- 为内存中操作启用动态端口发现。
- 将 A2A 工具结果消息与`toolCallId`相关元数据链接起来，以保持与发起工具调用的一致性。
- 修复了 JS studio 实验未更新实验屏幕的问题，确保正确运行路由至设置了 `reference_example_id` 的实验跟踪项目。
</Update>

<Update label="2026-04-30" tags={["agent-server"]}>
## v0.8.5

- 解决了 Datadog 和 npm 报告的 langgraph JavaScript 依赖项中的安全漏洞。
</Update>

<Update label="2026-04-29" tags={["agent-server"]}>
## v0.8.4

- 在访问日志中包含跟踪/跨度 ID，以改进 Datadog 和 OTel 中的跟踪关联性。
</Update>

<Update label="2026-04-28" tags={["agent-server"]}>
## v0.8.3

- 在集群模式下添加了对基于 IAM 的 Google Cloud Memorystore 身份验证的支持，以实现安全访问。
</Update>

<Update label="2026-04-27" tags={["agent-server"]}>
## v0.8.2

- 修复了`langgraph-api`队列入口点，通过确保运行状况/指标服务器与 IPv6 文字正确绑定，在仅 IPv6 集群上正确启动。
</Update>

<Update label="2026-04-23" tags={["agent-server"]}>
## v0.8.1- 当不需要完整的线程主体时，通过跳过线程状态中的大 `values` 列和运行端点来提高性能。
- 限制检查点摄取批量大小和延迟窗口，以最大限度地减少长时间运行的事务和行锁争用，并使用用于批量大小和延迟控制的新配置标志。
</Update>

<Update label="2026-04-16" tags={["agent-server"]}>
## v0.8.0

此次要版本将运行队列轮询从 Postgres 移至 Redis，从而节省了数据库负载并提高了性能。

在底层，代理服务器使用持久运行队列来管理运行执行。工作人员轮询队列中是否有新的运行并执行它们。以前，队列轮询逻辑通过 Postgres。这可能会导致查询长时间运行，尤其是在高负载下。通过此更新，队列轮询逻辑现在通过 Redis，然后从 Postgres 获取运行详细信息。这使得队列轮询的热路径速度大大加快，并减少了数据库的负载。这不是重大更改，不需要更改代码即可升级，但需要注意以下几点：
- 升级后立即部署时，队列会转移。可能存在一个短暂的窗口，其中线程按非时间顺序进行调度。每个线程内的运行执行顺序仍然得到保证。
- **仅限自托管：** Redis 流量可能会略有增加。在内部测试中，增长幅度不大。
</Update>

<Update label="2026-04-15" tags={["agent-server"]}>
## v0.7.103

- 解决了 checkpoint_delete_queue 的迁移版本冲突，确保正确执行并为将来的迁移添加了重复版本检测。
</Update>

<Update label="2026-04-14" tags={["agent-server"]}>
## v0.7.102

- 通过合并多个中断块并确保一致的中断返回行为，改进了并行中断的处理。
- 更新了 Vite 依赖项以修补安全漏洞 CVE-2026-39363 和 CVE-2026-39364。
- 由于 `1.9.10` 清单中缺少 `arm64` 支持，因此将 Datadog 映像版本固定到 `1.9.9`。
</Update>

<Update label="2026-04-14" tags={["agent-server"]}>
## v0.7.101- 将 Go stdlib 升级到 1.25.9，以解决高严重性漏洞 CVE-2026-32280 和 CVE-2026-32282。
- 改进了 DD 和 OTEL 跟踪器中的错误传播，以处理 UserInterrupt 异常，而不会导致生成器错误。
</Update>

<Update label="2026-04-10" tags={["agent-server"]}>
## v0.7.100

- 实现了检查点的后台删除，以提高线程删除和剪枝性能，减少I/O压力并提高效率。
- 将 `@hono/node-server` 从 1.19.12 升级到 1.19.13，以修复服务静态中间件的安全问题。
- 将 hono 从版本 4.12.9 更新到 4.12.12，包括中间件和实用程序的关键安全补丁。
- 将hono库升级到版本4.12.12，解决了多个安全漏洞。
- 对构建依赖项实施严格的版本锁定，以确保构建之间的一致性。
</Update>

<Update label="2026-04-09" tags={["agent-server"]}>
## v0.7.99- 更新了 OpenAPI 配置，以防止在使用带有路径前缀的 Istio 时，`/docs`“尝试一下”请求中出现 405 错误。
- 在`queue_with_signal`中将`signal.raise_signal(SIGINT)`替换为`sys.exit`，以提高关闭可靠性并处理卡住的线程。
- 为执行程序客户端添加了选择加入 TLS 配置，为现有非环回部署保留向后兼容的明文行为。
- 调整了 Datadog API 密钥配置的优先顺序，以确保正确的密钥使用。
</Update>

<Update label="2026-04-06" tags={["agent-server"]}>
## v0.7.98

- 修复了`langgraph dev`中的导入问题，以确保开发服务器在没有环境变量的情况下工作，并添加了回归测试。
</Update>

<Update label="2026-04-06" tags={["agent-server"]}>
## v0.7.97

- 改进了 JS 图的错误传播，确保来自 `/assistants/<ID>/schemas` 端点的错误消息更清晰。
- 当`LANGGRAPH_SERVER_HOST`等环境变量设置为IPv6地址时，确保稳定启动。
- 通过使用`->>`作为`EqAuthFilter`中的字符串值过滤器来增强查询性能，从而支持使用B树索引。
</Update>

<Update label="2026-04-03" tags={["agent-server"]}>
## v0.7.96

- 通过禁用嵌套循环并在指定时遵循较低的 `statement_timeout` 设置来增强数据库性能。
</Update>

<Update label="2026-04-03" tags={["agent-server"]}>
## v0.7.95- 通过确保在模块加载时导入 `ddtrace` 解决了 `BlockingError`，防止初始化期间发生异步上下文冲突。
- 将 `ddtrace` 上下文传播给工作人员，确保 `langgraph.graph_load` 具有父范围，而不是作为根发出。
- 在`PATCH /threads/{id}`上添加了对`Prefer: return=minimal`的支持，通过返回没有正文的204状态来提高效率。
- 增强了`run_server`，具有动态端口发现功能，可在使用默认端口 (`2024`) 时自动选择可用端口。
</Update>

<Update label="2026-03-31" tags={["agent-server"]}>
## v0.7.94

- 解决了重试超时后 JavaScript 安装错误地成功的问题，确保正确的故障处理。
- 在图工厂负载周围添加了 `langgraph.graph_load` ddtrace 跨度，以提高 APM 可见性。
</Update>

<Update label="2026-03-31" tags={["agent-server"]}>
## v0.7.93

- 在`core-api`模式下启用环境变量的`FF_OPTIMIZED_STREAMING`标志支持。
</Update>

<Update label="2026-03-31" tags={["agent-server"]}>
## v0.7.92

- 修复了运行完成后重新创建 `thread_ttl` 条目，`keep_latest` 线程可以无限期累积检查点的问题。
- 通过缓存`importlib.metadata.packages_distributions()`提高了导入性能，显着减少了将`ddtrace`与Google API包一起使用时的启动时间。
</Update>

<Update label="2026-03-29" tags={["agent-server"]}>
## v0.7.91- 将加密依赖项从 46.0.5 升级到 46.0.6，以解决与对等名称验证中的名称限制相关的安全问题。
- 引入了使用带有新协议版本 (v2) 的 Redis Streams 的优化流实现，以实现更好的性能和可恢复性，具有有效负载压缩和对 Redis 集群只读副本的支持。
</Update>

<Update label="2026-03-27" tags={["agent-server"]}>
## v0.7.90

- 改进了 DR 流程中的错误处理，并为测试设置了 30 秒的默认超时，以确保及时进行 CI 故障跟踪。
- 将 picomatch 从 4.0.3 升级到 4.0.4，以解决严重的安全漏洞。
</Update>

<Update label="2026-03-25" tags={["agent-server"]}>
## v0.7.89

- 增强了队列服务器指标并建立了对 OpenTelemetry SDK 的要求。
- 为`COUNTER_RUN_FAILED_AFTER_RETRY`指标添加了缺失的标签，以提高监控准确性。
</Update>

<Update label="2026-03-24" tags={["agent-server"]}>
## v0.7.87

- 对由于 Redis 相关的流错误而导致的运行失败实施重试，并提供警告日志以提高可见性。
</Update>

<Update label="2026-03-23" tags={["agent-server"]}>
## v0.7.86

- 在所有映像中设置默认值`DD_TRACE_ENABLED=false`，以减少非 Datadog 部署的 Orchestrion 日志噪音。
</Update>

<Update label="2026-03-23" tags={["agent-server"]}>
## v0.7.84- 将嘈杂的警告级别日志降级为信息级别，以减少日志混乱，重点关注信息状态消息，例如许可证精简模式和禁用跟踪。
- 通过 Orchestrion DD APM 跟踪增强了 Go `core-api-grpc`，以实现自动检测并改进跟踪上下文传播。
</Update>

<Update label="2026-03-19" tags={["agent-server"]}>
## v0.7.82

- 通过保留 `kind` 鉴别器并在所有客户端方法名称格式的响应中使用小写状态/角色，确保 A2A 协议合规性。
</Update>

<Update label="2026-03-18" tags={["agent-server"]}>
## v0.7.79

- 推出了`swr`功能的测试版，以改进数据获取功能。
- 将所有 Dockerfile 和 `go.mod` 的 Go 运行时升级到版本 1.25.8，以解决多个 CVE。
</Update>

<Update label="2026-03-17" tags={["agent-server"]}>
## v0.7.77- 引入了 `HTTP_MAX_REQUEST_BODY_BYTES` 配置，将 HTTP 请求正文大小限制为 300MB，对于超大请求返回 413 错误，以防止内存耗尽。
- 添加了对通过 JS 图形工厂中的配置访问存储和检查指针的支持，以促进深度代理初始化。
- 将 `pyasn1` 依赖项从版本 0.6.2 更新到 0.6.3，以增强安全性并修复解析问题。
- 添加了用于记录流端点的第一个字节时间 (TTFB) 和响应大小的检测，改进了访问日志详细信息。
</Update>

<Update label="2026-03-17" tags={["agent-server"]}>
## v0.7.76

- 放宽了`starlette-sse`版本限制以提高依赖兼容性。
</Update>

<Update label="2026-03-17" tags={["agent-server"]}>
## v0.7.75

- 正确关闭`Runs.Enter`中的流以防止缓冲区问题，并添加了窗口大小的可配置环境变量。
</Update>

<Update label="2026-03-16" tags={["agent-server"]}>
## v0.7.74

- 清理了队列关闭操作期间的一些虚假错误日志。
</Update>

<Update label="2026-03-16" tags={["agent-server"]}>
## v0.7.73

- 通过避免不必要的大型 JSONB 值的解构，使用 `extract` 改进了线程搜索性能。
</Update>

<Update label="2026-03-13" tags={["agent-server"]}>
## v0.7.72

- 将undici包从版本7.22.0更新到7.24.0以解决多个安全漏洞。
</Update>

<Update label="2026-03-13" tags={["agent-server"]}>
## v0.7.71- 通过从线程状态检查点和运行创建方法中删除未使用的参数来清理 API。
- 修复了`POST /threads/prune`和`strategy=delete`，以确保完全删除线程记录，而不仅仅是检查点数据。
- 向响应对象添加了 A2A 1.0 `kind` 鉴别器，删除了 `{"task": ...}` 包装器，并修复了 Anthropic 流元数据问题。
- 增加了对Redis队列自定义加密的支持，以增强数据安全性。
</Update>

<Update label="2026-03-11" tags={["agent-server"]}>
## v0.7.69

- 为 crons 添加了可选的 `timezone` 字段，允许在用户指定的时区中进行 `next_run_date` 计算，默认为 UTC。
- 更正了身份验证异常中 401 状态代码的处理，以防止错误地默认为 403。
</Update>

<Update label="2026-03-10" tags={["agent-server"]}>
## v0.7.68- 修复了非 DR 检查点 AES JSON 的问题，以改进功能并扩展测试覆盖范围。
- 修复了 A2A 流，以根据规范将中断工件作为单独的 `artifact-update` 事件正确发出。
- 通过仅提取经过验证的安全成员来确保安全 tarfile 提取，以防止任意文件写入漏洞。
- 通过要求身份验证中间件中的`noauth`路径精确匹配来增强安全性。
- 修复了多任务策略回滚期间被写入线程状态的过时检查点值。
</Update>

<Update label="2026-03-06" tags={["agent-server"]}>
## v0.7.66

- 当`LANGGRAPH_CHECKPOINTER`未设置时，为默认检查点配置添加了`LS_CHECKPOINTER_BACKEND`的回退。
</Update>

<Update label="2026-03-05" tags={["agent-server"]}>
## v0.7.65

- 修复了`messages-tuple`流模式下`tool_call_chunks`包含`args_json`而不是`args`的错误，阻止消息重建并导致错误。
</Update>

<Update label="2026-03-05" tags={["agent-server"]}>
## v0.7.64

- 允许通过 `LS_MONGODB_URI` 或 `MONGODB_URI` 环境变量设置 MongoDB 检查点 URI，并具有优先级规则。
</Update>

<Update label="2026-03-04" tags={["agent-server"]}>
## v0.7.63

- 修复了一个错误，该错误可能会因无效运行而耗尽工作人员而导致队列实例死锁。
</Update>

<Update label="2026-03-02" tags={["agent-server"]}>
## v0.7.61- 修复了竞争条件，以确保正常关闭运行状况和指标服务器。
</Update>

<Update label="2026-02-27" tags={["agent-server"]}>
## v0.7.59

- 更新了 Redis 队列以将 zset 与线程结合使用，将 CPU 使用率降低 25%，并通过消除不必要的锁定和优化索引来提高性能。
</Update>

<Update label="2026-02-26" tags={["agent-server"]}>
## v0.7.58

- 将 `storage_postgres/uv.lock` 中的 `langgraph-checkpoint` 升级到 4.0.0 以解决 CVE-2026-27794，并对依赖项固定问题进行了调整。
</Update>

<Update label="2026-02-26" tags={["agent-server"]}>
## v0.7.57

- 修复了阻止所有用户创建与系统图关联的 cron 的回归。
</Update>

<Update label="2026-02-25" tags={["agent-server"]}>
## v0.7.56

- 添加了对商店 HTTP API 端点中的 `ttl`、`index` 和 `refresh_ttl` 参数的支持，以与 SDK 和进程内商店接口保持一致。
- 在`GET /threads/{thread_id}`端点中添加了对`?include=ttl`查询参数的支持，以返回TTL信息。
- 更新了指标报告以准确说明 PostgreSQL 和 Redis 连接，确保 GRPC 和 Python 指标之间的统计数据一致。
</Update>

<Update label="2026-02-25" tags={["agent-server"]}>
## v0.7.55- 修复了导致新 cron 调度程序后端重复运行调度的错误。
- 重构了`GET /docs`端点以从静态 OpenAPI 规范中读取，以提高与自定义入口配置的兼容性。
</Update>

<Update label="2026-02-24" tags={["agent-server"]}>
## v0.7.54

- 解决了由于硬编码值而导致 gRPC 服务的自定义加密上下文无法正确加载的问题。
</Update>

<Update label="2026-02-24" tags={["agent-server"]}>
## v0.7.52

- 当提供 `feedback_keys` 时，在 `__feedback__` 键下向 `/wait` 和 `/join` 端点响应添加了反馈 URL。
- 添加了对分布式运行时的 Feedback_keys 支持，包括使用 langsmith-go SDK 生成预签名的反馈令牌。
- 将 Werkzeug 从版本 3.1.5 升级到 3.1.6，以解决多段路径中特殊设备名称的 Windows 安全问题。
- 将 Go 运行时升级到 1.25.7，以解决漏洞扫描中发现的关键和高严重性 CVE。
</Update>

<Update label="2026-02-22" tags={["agent-server"]}>
## v0.7.51- 改进了上游中断期间许可证检查的弹性，包括缓存回退、24 小时宽限期以及 Redis 条目的自动清理。
- 当 `LANGSERVE_GRAPHS` 配置更改时，确保助手描述和名称在启动时同步。
- 通过引入两级协议层次结构和修复能力检测来增强 Checkpointer API，以直接支持扩展方法。
</Update>

<Update label="2026-02-20" tags={["agent-server"]}>
## v0.7.49

- 请求有效负载中保留的元数据键现在被悄悄地剥离，而不是导致 422 错误，从而增强了用户体验。
- 修复了存储默认 TTL 不适用于没有显式 TTL 参数写入的项目的问题。
</Update>

<Update label="2026-02-19" tags={["agent-server"]}>
## v0.7.46

- webhooks 中的结构化错误负载现在包括 `error` 和 `message` 字段，取代了之前的平面字符串格式，这可能会影响系统解析 `error` 字段。
- 通过名称空间重写扩展了商店身份验证测试，以增强名称空间处理和跨用户隔离。
</Update>

<Update label="2026-02-19" tags={["agent-server"]}>
## v0.7.45

- 在所有处理路径中用 U+FFFD 替换空字节以防止按键冲突。
</Update><Update label="2026-02-19" tags={["agent-server"]}>
## v0.7.44
- 增加数据库 URI 解析器的灵活性
- 对某些有效负载添加额外的验证
</Update>

<Update label="2026-02-18" tags={["agent-server"]}>
## v0.7.40

- 通过确保在未提供时将`metadata`和`config`填充为空对象`{}`而不是`null`，修复了助理创建中的回归。
</Update>

<Update label="2026-02-17" tags={["agent-server"]}>
## v0.7.39

- 确保在分布式运行时操作中正确传递身份验证配置，以改进执行器功能。
- 为使用基于 RHEL 的容器的企业客户添加了对基于 Red Hat UBI-9 的 Docker 映像的支持。
- 为分布式运行时添加了优雅的关闭切换，允许运行中的运行转移到下一个 Pod，而无需使用重试尝试。
</Update>

<Update label="2026-02-17" tags={["agent-server"]}>
## v0.7.38

- 向线程添加了 `state_updated_at` 字段，用于跟踪有意义的状态更改，允许根据这些更改进行过滤和排序。
- 添加了对核心系统内调度 cron 的支持。
- 使用 x-forwarded-proto 标头确保代理卡中`https` 协议的准确显示，以实现正确的 A2A 客户端功能。
</Update>

<Update label="2026-02-15" tags={["agent-server"]}>
## v0.7.37- 在 BYOC 检查点适配器中添加了 `acopy_thread`、`aprune` 和 `adelete_for_runs` 的通用回退，简化了自定义检查点的实现。
</Update>

<Update label="2026-02-13" tags={["agent-server"]}>
## v0.7.36

- 将 A2A 协议支持更新为 v1.0 RC，重命名为 JSON-RPC 方法，添加了 ListTasks 处理程序，并增强了角色、状态和部件格式以改进集成和合规性。
- 改进了`Crons.search()`和`Crons.count()`的身份验证过滤，以防止未经授权的线程信息访问。
- 修复了 BYOC 检查指针中用于复制、回滚和命名空间过滤操作的缺陷，确保跨不同存储后端的正确处理。
</Update>

<Update label="2026-02-13" tags={["agent-server"]}>
## v0.7.35

- 向 MCP `tools/call` 和 A2A `message/send` 和 `message/stream` 端点添加了可选的 `context` 参数，使中间件能够从标头注入运行时上下文。
</Update>

<Update label="2026-02-13" tags={["agent-server"]}>
## v0.7.33- 通过删除自定义检查点测试跳过、改进类型化序列化以及添加缺失的 Redis 方法来增强 Redis 固定装置。
- 通过清理单引号 HTML onload 属性中的消息名称，解决了 handle_ui 端点中存储的 XSS 漏洞。
- 修复了`put_item`中的授权绕过问题，以确保身份验证处理程序正确重写命名空间。
- 在运行创建期间强制执行助理所有权检查，防止在无主助理上执行，同时确保所有经过身份验证的用户仍然可以访问系统助理。
- 使用 LANGGRAPH_AES_KEY 时，对检查点 blob 实施 AES 加密并写入 Go 检查点。
- 使用所有必要的方法和转换帮助程序实现了初始检查点 gRPC 服务程序。
</Update>

<Update label="2026-02-11" tags={["agent-server"]}>
## v0.7.32- 清理流和 A2A 响应中的错误消息，以保护数据库连接字符串和内部主机名等敏感信息。
- 修复了`join_run_stream`中的错误，以正确处理多个`stream_mode`参数，确保正确解析字符串化的JSON列表。
- 添加了 Node.js 24 镜像的构建、测试和发布流程，支持最新的 LTS 版本。
- 增强的自定义检查点适配器具有新功能和改进的元数据丰富，以实现一致的 API 响应。
- 对执行器 Docker 镜像中的 langgraph 库添加了更严格的版本限制，以防止意外升级。
- 通过清理 SSE 事件和 id 字段以防止 CR/LF 注入来增强安全性。
- 修复了导致 cron 创建的运行使用默认加密上下文而不是正确传播指定加密上下文的问题。
</Update>

<Update label="2026-02-11" tags={["agent-server"]}>
## v0.7.31

- 修正了元数据读取功能，以确保准确的数据处理。
</Update>

<Update label="2026-02-10" tags={["agent-server"]}>
## v0.7.30

- 传播 cron 元数据以获得更全面的调度信息。
- 合并 `PATCH` 请求上的 cron 元数据，通过保留现有数据与其他端点保持一致。
</Update>

<Update label="2026-02-10" tags={["agent-server"]}>
## v0.7.29- 改进了 cron 创建的身份验证语义，以防止权限升级并确保对 cron、线程和助手进行独立过滤。
- 验证 tar 文件条目，以防止 cloudflared 下载过程中的目录遍历漏洞。
- 向`SearchThreadsRequest`添加了ID过滤器以简化线程端点操作。
- 更新了回退机制以使用 Python Postgres 连接来获取线程状态，修复了工作线程完成检查点的问题。
- 引入了带有功能标记的 Redis 队列实现的初始版本，并不断更新。
</Update>

<Update label="2026-02-07" tags={["agent-server"]}>
## v0.7.28

- MCP 和 gRPC 的内部维护和稳定性改进。
</Update>

<Update label="2026-02-07" tags={["agent-server"]}>
## v0.7.27

- 通过删除常见消息类型以实现更清晰的工具定义，改进了 MCP 工具输入模式。
- 添加了 MCP 工具的名称清理，以确保工具名称有效。
</Update>

<Update label="2026-02-07" tags={["agent-server"]}>
## v0.7.26

- 添加了入口时系统密钥的验证。
</Update>

<Update label="2026-02-06" tags={["agent-server"]}>
## v0.7.25

- 将 Python 队列工作器切换为使用核心 go `Runs.next()`。
- 修复了长查询监控中的监控问题
</Update>

<Update label="2026-02-06" tags={["agent-server"]}>
## v0.7.24- 优化了 Postgres 连接处理，以防止在高负载下达到连接限制，并删除了不必要的错误日志。
- 切换到新的后端，使用 gRPC 进行运行管理和流式传输。
</Update>

<Update label="2026-02-05" tags={["agent-server"]}>
## v0.7.23

- 更正了`RunCommand`中`input`字段的解组过程，以确保准确的数据映射并启用之前的门控JS测试。
- 通过在执行开始之前完全订阅来确保运行流的竞争条件处理，并增加了对 `FF_LOG_DROPPED_EVENTS` 环境变量的支持。
</Update>

<Update label="2026-02-04" tags={["agent-server"]}>
## v0.7.22

- 确保 `get_store()` 在自定义路由中工作，支持从用户定义的 Starlette 端点进行存储访问。
</Update>

<Update label="2026-02-05" tags={["agent-server"]}>
## v0.7.21

- 支持补丁/crons/{cron_id}
</Update>

<Update label="2026-02-04" tags={["agent-server"]}>
## v0.7.19

- 核心 API 的自定义加密改进。
</Update>

<Update label="2026-02-04" tags={["agent-server"]}>
## v0.7.18

- 更新核心 API 使用的线程流。
</Update>

<Update label="2026-02-03" tags={["agent-server"]}>
## v0.7.17

- OTEL 仪表现在需要通过 `LS_APM_OTEL_ENABLED=true` 明确选择加入，以改进控制。
</Update>

<Update label="2026-02-03" tags={["agent-server"]}>
## v0.7.16

- 将线程流切换到新的 gRPC 后端以提高性能。
- 在 DR 中引入了副本跟踪，以增强 Studio 中的评估功能。
</Update>

<Update label="2026-02-03" tags={["agent-server"]}>
## v0.7.15- 添加了对使用新的 `is_enabled` 字段暂停 cron 的支持，仅允许执行已启用的 cron 。
- 引入了对 JSON 加密和解密操作的 gRPC 服务器支持。
</Update>

<Update label="2026-02-02" tags={["agent-server"]}>
## v0.7.14

- 确保选定的系统字段排除在自定义加密之外，以防止对非敏感数据进行不必要的加密。
- 引入了带有单元测试的自定义检查点适配器来验证实施检查。
</Update>

<Update label="2026-01-29" tags={["agent-server"]}>
## v0.7.13

- 修复了设置安装前缀时无法通过请求正确保留应用程序状态的错误。
</Update>

<Update label="2026-01-28" tags={["agent-server"]}>
## v0.7.11

- 添加了配置来控制哪些负载字段可以暴露给 webhook。
- 将`/api/langgraph_api/js`组中的所有依赖项（包括`@langchain/core`、`hono`、`@types/react`和`prettier`）更新为最新版本，以提高性能和安全性。
- 将`hono`从4.11.4版本升级到4.11.7，以解决中间件中的多个安全漏洞。
</Update>

<Update label="2026-01-27" tags={["agent-server"]} rss={{ title: "2026-01-27 - agent-server" }}>
## v0.7.10- 将 gRPC 服务器启动超时增加到 1 分钟，以防止与核心服务器的偶尔连接超时。
- 将 @langchain/langgraph 从版本 1.1.0 更新到 1.1.2，引入了对 StateGraph 的混合模式支持以及 GraphNode 和 ConditionalEdgeRouter 实用程序的类型包模式。
</Update>

<Update label="2026-01-23" tags={["agent-server"]} rss={{ title: "2026-01-23 - agent-server" }}>
## v0.7.9

- A2A `messageId` 现在映射到 LangChain 消息 ID，以便跨协议进行正确的消息跟踪。
</Update>

<Update label="2026-01-22" tags={["agent-server"]} rss={{ title: "2026-01-22 - agent-server" }}>
## v0.7.7

- 确保在 gRPC 序列化期间保留检查点元数据中的自定义可配置字段。
</Update>

<Update label="2026-01-21" tags={["agent-server"]} rss={{ title: "2026-01-21 - agent-server" }}>
## v0.7.5

- 设置线程状态时对值、中断和错误强制执行自定义加密，解决了以前的不一致问题。
- 在`message/stream`和`message/send`路由中为`parts`、`role`和`messageId`字段添加了A2A验证检查。
- 添加了本机 A2A 中断支持：现在当图形中断时返回`input-required`状态。在 `message/stream` 和 `message/send` 请求中使用新的 `command` 参数，以使用 `Command` 负载恢复。
- 将 `.well-known/agent-card.json` 安装在 `/a2a/{assistant_id}/` 下，用于 A2A 代理发现。
- 在 `tasks/cancel` 中添加了用于任务存在检查的正确 A2A 错误代码。
</Update>

<Update label="2026-01-21" tags={["agent-server"]} rss={{ title: "2026-01-21 - agent-server" }}>
## v0.7.4- 修复了 Redis URL `ssl_cert_reqs` 字段解析的错误，确保与 redis-go 的兼容性。
- 添加了用于流式运行的 gRPC 客户端，由 `FF_USE_CORE_API` 功能标志控制。
</Update>

<Update label="2026-01-20" tags={["agent-server"]} rss={{ title: "2026-01-20 - agent-server" }}>
## v0.7.2

- 将 `@langchain/langgraph` 更新至版本 1.1.0，引入了图形节点的类型实用程序和条件边，以增强 TypeScript 人体工程学。
</Update>

<Update label="2026-01-17" tags={["agent-server"]} rss={{ title: "2026-01-17 - agent-server" }}>
## v0.7.0

- 默认情况下切换为使用 Go 助手实现以提高性能。
- 添加了 `LANGGRAPH_AES_JSON_KEYS` 配置，以使用密钥名称白名单对指定 JSON 字段启用 AES 加密。
</Update>

<Update label="2026-01-16" tags={["agent-server"]} rss={{ title: "2026-01-16 - agent-server" }}>
## v0.6.39

- 在 Python `core-api` 中添加了对 `Threads.State()` 的 gRPC 客户端支持，改进了线程 ID 和运行计数操作。
</Update>

<Update label="2026-01-15" tags={["agent-server"]} rss={{ title: "2026-01-15 - agent-server" }}>
## v0.6.36

- 验证了auth过滤器中`$and`和`$or`的长度，并优化了不必要的根级过滤器。
</Update>

<Update label="2026-01-12" tags={["agent-server"]} rss={{ title: "2026-01-12 - agent-server" }}>
## v0.6.35

- 通过删除 `code` 字段并标准化所有错误以返回带有 `detail` 字段的 JSON 来统一错误格式。
</Update>

<Update label="2026-01-12" tags={["agent-server"]} rss={{ title: "2026-01-12 - agent-server" }}>
## v0.6.34
- 针对功能标记的内部环境的小修复（未发布）。
</Update>

<Update label="2026-01-12" tags={["agent-server"]} rss={{ title: "2026-01-12 - agent-server" }}>
## v0.6.33
- 针对功能标记的内部环境的小修复（未发布）。
</Update><Update label="2026-01-11" tags={["agent-server"]} rss={{ title: "2026-01-11 - agent-server" }}>
## v0.6.32
- 针对功能标记的内部环境的小修复（未发布）。
</Update>

<Update label="2026-01-11" tags={["agent-server"]} rss={{ title: "2026-01-11 - agent-server" }}>
## v0.6.31

- 正确遵守disable_a2a设置以确保准确的配置处理。
</Update>

<Update label="2026-01-09" tags={["agent-server"]} rss={{ title: "2026-01-09 - agent-server" }}>
## v0.6.29

- 修复小错误。
</Update>

<Update label="2026-01-09" tags={["agent-server"]} rss={{ title: "2026-01-09 - agent-server" }}>
## v0.6.28

- 添加了对 `ParentCommand` 的支持，以正确地将控制传播到父图，从而增强命令处理和导航。
- 添加了用于管理运行操作的 Python gRPC 客户端，增强了 Go 和 Python 实现之间的一致性。
</Update>

<Update label="2026-01-08" tags={["agent-server"]} rss={{ title: "2026-01-08 - agent-server" }}>
## v0.6.27

- 修复了处理空线程元数据时的回归问题。
</Update>

<Update label="2026-01-08" tags={["agent-server"]} rss={{ title: "2026-01-08 - agent-server" }}>
## v0.6.26

- 修复了持久性 gRPC 服务器的端口配置问题。
</Update>

<Update label="2026-01-08" tags={["agent-server"]} rss={{ title: "2026-01-08 - agent-server" }}>
## v0.6.25

- 在执行器层运行 core-api gRPC 服务器以支持图中的环回 API 调用，并删除了用于禁用服务器的不必要的配置。
</Update>

<Update label="2026-01-07" tags={["agent-server"]} rss={{ title: "2026-01-07 - agent-server" }}>
## v0.6.24

- 修复了执行器层中活性探针的行为，解决了 0.6.23 版本中的问题。
</Update>

<Update label="2026-01-07" tags={["agent-server"]} rss={{ title: "2026-01-07 - agent-server" }}>
## v0.6.23- 将 gRPC 服务器运行状况检查与活性探针中的`/ok`端点集成，以确保正确的启动协调。
- 恢复了之前禁用检查点的更改，并添加了仅在测试期间启用 RemoteCheckpointer 的条件。
- 抑制检查点元数据中的 `langgraph_auth_*` 和 `langgraph_request_id` 字段，以防止包含临时用户数据。
</Update>

<Update label="2026-01-06" tags={["agent-server"]} rss={{ title: "2026-01-06 - agent-server" }}>
## v0.6.22

- 解决了使用仅 blob 自定义加密时由于缺少加密上下文而导致的错误，确保正常运行而不会出现错误。
</Update>

<Update label="2026-01-06" tags={["agent-server"]} rss={{ title: "2026-01-06 - agent-server" }}>
## v0.6.21

- 引入了用于运行操作的 Python gRPC 客户端，包括 `Search`、`Get`、`Delete`、`Cancel`、`Stats` 和 `Sweep`，并更新了 API 实现和用于枚举映射的新单元测试套件。
</Update>

<Update label="2026-01-06" tags={["agent-server"]} rss={{ title: "2026-01-06 - agent-server" }}>
## v0.6.19

- 在引擎服务器中复制了`get_state`和`update_state`的OSS实现，并重新启用了`test_weather_subgraph`。
</Update>

<Update label="2026-01-05" tags={["agent-server"]} rss={{ title: "2026-01-05 - agent-server" }}>
## v0.6.18- 添加了对自托管企业用户实施特定许可证声明的功能，从而可以远程禁用 Agent Builder 产品。
- 添加了新的修剪端点以实现更好的资源管理。
- 将图形配置与 Pregel 中的调用配置合并，优先调用设置。
- 向 GET /threads/{id} 端点引入了 `include=ttl` 查询参数，用于可选的 TTL 信息检索，而不影响标准读取性能。
- 引入了 `keep_latest` TTL 策略来保留最新状态，同时通过核心 API 修剪旧检查点。
</Update>

<Update label="2025-12-31" tags={["agent-server"]} rss={{ title: "2025-12-31 - agent-server" }}>
## v0.6.17

- 确保删除代理时停止正在进行的运行，以防止进程延迟。
</Update>

<Update label="2025-12-30" tags={["agent-server"]} rss={{ title: "2025-12-30 - agent-server" }}>
## v0.6.16

- 简化和整合了 Go 持久层中的运行操作，提高了包之间的效率和一致性。
</Update>

<Update label="2025-12-26" tags={["agent-server"]} rss={{ title: "2025-12-26 - agent-server" }}>
## v0.6.15

- 通过在解析文档字符串时添加错误处理，改进了将自定义路由文档字符串转换为 OpenAPI 架构内容的实用程序，适用于使用自定义 Starlette 应用程序的用户。
</Update>

<Update label="2025-12-23" tags={["agent-server"]} rss={{ title: "2025-12-23 - agent-server" }}>
## v0.6.12- 改进了resolve_embeddings，使其更加健壮，从而可以无错误地进行多次调用。
- 将`@langchain/langgraph`从版本1.0.4更新到1.0.7，添加了对远程图上的resumableStreams的支持并取消了toolsCondition。
- 实现`RemoteCheckpointer`以启用子图检查点，增强任务执行的可靠性。
</Update>

<Update label="2025-12-20" tags={["agent-server"]} rss={{ title: "2025-12-20 - agent-server" }}>
## v0.6.11

- 可配置最大重试次数以增强自定义功能。
</Update>

<Update label="2025-12-20" tags={["agent-server"]} rss={{ title: "2025-12-20 - agent-server" }}>
## v0.6.10

- 确保运行取消仅处理“消息”类型的 Redis 事件，从而提高 pubsub 客户端的可靠性。
- 为 Store API `value` 字段添加了自定义加密，允许用户选择要加密的密钥以增强安全性。
- 通过更新 TeeStream 以单独处理事件类型，启用子图自定义事件的流式传输。
</Update>

<Update label="2025-12-18" tags={["agent-server"]} rss={{ title: "2025-12-18 - agent-server" }}>
## v0.6.9

- 为自定义加密强制执行稳定的 JSON 密钥，删除了特定于模型类型的自定义 JSON 函数，并改进了双重加密场景的错误处理。
</Update>

<Update label="2025-12-18" tags={["agent-server"]} rss={{ title: "2025-12-18 - agent-server" }}>
## v0.6.8

- 添加了分析功能以增强性能分析和监控。
</Update>

<Update label="2025-12-18" tags={["agent-server"]} rss={{ title: "2025-12-18 - agent-server" }}>
## v0.6.7

- 记录服务器启动时间以改进监控和诊断。
</Update>

<Update label="2025-12-17" tags={["agent-server"]} rss={{ title: "2025-12-17 - agent-server" }}>
## v0.6.5- 添加了在导入期间触发的警告日志，以提高可见性。
</Update>

<Update label="2025-12-16" tags={["agent-server"]} rss={{ title: "2025-12-16 - agent-server" }}>
## v0.6.4

- 通过并行化元数据和配置流程来增强自定义加密，添加对 thread.config 和一些检查点的加密，改进测试和架构一致性。
- 确保 Go 服务器在队列入口点中以 `core-api` 启动，以实现一致的运行时行为。
</Update>

<Update label="2025-12-15" tags={["agent-server"]} rss={{ title: "2025-12-15 - agent-server" }}>
## v0.6.2

- 解决了指定 `mount_prefix` 时导致重复调用中间件的问题。
</Update>

<Update label="2025-12-15" tags={["agent-server"]} rss={{ title: "2025-12-15 - agent-server" }}>
## v0.6.0

此次要版本更新了流 API `/join-stream` 和 `/stream` 相对于 `last-event-id` 参数的行为，以与 SSE 规范保持一致。以前，传递last-event-id 会返回该消息以及任何后续消息。今后，这些 API 将仅返回提供的 last-event-id 之后的新消息。例如，对于以下流，之前传递last-event-id `2` 将返回id 为`2` 和`3` 的消息，但现在仅返回id 为`3` 的消息：

```json
{
    "id": 1,
    "event": "message",
    "data": {
        "content": "Excluded"
    }
},
{
    "id": 2,
    "event": "message",
    "data": {
        "content": "Passed last-event-id"
    }
},
{
    "id": 3,
    "event": "message",
    "data": {
        "content": "Included"
    }
}
```

此更新还包括一些修复，包括暴露运行流中意外内部事件的错误。


</Update>

<Update label="2025-12-12" tags={["agent-server"]} rss={{ title: "2025-12-12 - agent-server" }}>
## v0.5.42- 修改了 Go 服务器，使其仅依赖 CLI `-service` 标志来确定服务模式，忽略全局设置 `FF_USE_CORE_API` 以实现更好的部署特异性。
</Update>

<Update label="2025-12-11" tags={["agent-server"]} rss={{ title: "2025-12-11 - agent-server" }}>
## v0.5.41

通过确保 ENTERPRISE_SAAS 全局标志的正确初始化，修复了混合模式下 cron 作业的问题。
</Update>

<Update label="2025-12-10" tags={["agent-server"]} rss={{ title: "2025-12-10 - agent-server" }}>
## v0.5.39

- 完成了运行和 cron 的自定义加密的实施，并简化了加密流程。
- 引入了对 `values` 和 `updates` 流模式下的流子图事件的支持。
</Update>

<Update label="2025-12-10" tags={["agent-server"]} rss={{ title: "2025-12-10 - agent-server" }}>
## v0.5.38

- 为线程实现了完整的自定义加密，确保所有线程数据得到正确的保护和加密。
- 确保 Redis 尝试标记始终过期，以防止数据过时。
- 添加了核心身份验证和对 OR/AND 过滤器的支持，增强了安全性和灵活性。
</Update>

<Update label="2025-12-09" tags={["agent-server"]} rss={{ title: "2025-12-09 - agent-server" }}>
## v0.5.37

向助手计数 API 添加了 `name` 参数，以提高搜索灵活性。
</Update>

<Update label="2025-12-09" tags={["agent-server"]} rss={{ title: "2025-12-09 - agent-server" }}>
## v0.5.36

- 引入了可配置的 Webhook 支持，允许用户自定义提交的 Webhook 和标头。
- 在根目录添加了 `/ok` 端点，以便更轻松地进行运行状况检查和简化配置。
</Update><Update label="2025-12-08" tags={["agent-server"]} rss={{ title: "2025-12-08 - agent-server" }}>
## v0.5.34

推出自定义加密中间件，允许用户定义自己的加密方法以增强数据保护。
</Update>

<Update label="2025-12-08" tags={["agent-server"]} rss={{ title: "2025-12-08 - agent-server" }}>
## v0.5.33

将 Uvicorn 的保持活动超时设置为 75 秒，以防止偶尔出现 502 错误并改进连接处理。
</Update>

<Update label="2025-12-06" tags={["agent-server"]} rss={{ title: "2025-12-06 - agent-server" }}>
## v0.5.32

引入了 OpenTelemetry 遥测代理，支持 New Relic 集成。
</Update>

<Update label="2025-12-05" tags={["agent-server"]} rss={{ title: "2025-12-05 - agent-server" }}>
## v0.5.31

添加了 Py-Spy 分析以改进对部署性能的分析，但对覆盖范围有一些限制。
</Update>

<Update label="2025-12-05" tags={["agent-server"]} rss={{ title: "2025-12-05 - agent-server" }}>
## v0.5.30

- 始终配置环回传输客户端以增强可靠性。
- 确保为 JS 中的远程非流方法传递身份验证标头。
</Update>

<Update label="2025-12-04" tags={["agent-server"]} rss={{ title: "2025-12-04 - agent-server" }}>
## v0.5.28

- 引入了更快的、基于 Rust 的 uuid7 实现来提高性能，现在用于 langsmith 和 langchain-core。
- 在 PostgreSQL 身份验证过滤器中添加了对 `$or`​​ 和 `$and` 的支持，以在身份验证检查中启用复杂逻辑。
- 限制 psycopg 和 psycopg-pool 版本以防止启动时无限等待。
</Update>

<Update label="2025-11-26" tags={["agent-server"]} rss={{ title: "2025-11-26 - agent-server" }}>
## v0.5.27- 确保带有过滤器的`runs.list`仅返回运行字段，防止包含错误的状态数据。
- (JS) 将`uuid`从版本10.0.0更新到13.0.0。和 `exit-hook` 从版本 4.0.0 到 5.0.1。
</Update>

<Update label="2025-11-24" tags={["agent-server"]} rss={{ title: "2025-11-24 - agent-server" }}>
## v0.5.26

解决了在 JavaScript 环境中不使用 AsyncBatchedStore 时使用 `store.put` 的问题。
</Update>

<Update label="2025-11-22" tags={["agent-server"]} rss={{ title: "2025-11-22 - agent-server" }}>
## v0.5.25

- 引入了使用新端点通过 `name` 搜索助手的功能。
- 将 store_get 返回类型转换为 JavaScript 中的元组，以确保类型一致性。
</Update>

<Update label="2025-11-21" tags={["agent-server"]} rss={{ title: "2025-11-21 - agent-server" }}>
## v0.5.24

- 添加了 Datadog 的执行器指标并增强了核心流 API 指标，以实现更好的性能跟踪。
- 禁用 Redis Go 维护通知，以防止在低于 8 的 Redis 版本中因不支持的命令而出现启动错误。
</Update>

<Update label="2025-11-20" tags={["agent-server"]} rss={{ title: "2025-11-20 - agent-server" }}>
## v0.5.20

解决了处理大消息时执行程序服务中发生的错误。
</Update>

<Update label="2025-11-19" tags={["agent-server"]} rss={{ title: "2025-11-19 - agent-server" }}>
## v0.5.19

内置langchain-core升级至1.0.7版本，修复提示格式化漏洞。
</Update>

<Update label="2025-11-19" tags={["agent-server"]} rss={{ title: "2025-11-19 - agent-server" }}>
## v0.5.18

引入了带有 `on_run_completed: {keep,delete}` 的持久 cron 线程，以增强 cron 管理和检索选项。
</Update>

<Update label="2025-11-19" tags={["agent-server"]} rss={{ title: "2025-11-19 - agent-server" }}>
## v0.5.17增强的任务处理支持多个中断，与开源功能保持一致。
</Update>

<Update label="2025-11-18" tags={["agent-server"]} rss={{ title: "2025-11-18 - agent-server" }}>
## v0.5.15

为 `Resume` 和 `Goto` 命令添加了自定义 JSON 解组，以修复地图样式空恢复解释问题。
</Update>

<Update label="2025-11-14" tags={["agent-server"]} rss={{ title: "2025-11-14 - agent-server" }}>
## v0.5.14

确保 `pg make start` 命令在启用 core-api 的情况下正常运行。
</Update>

<Update label="2025-11-13" tags={["agent-server"]} rss={{ title: "2025-11-13 - agent-server" }}>
## v0.5.13

支持`include`和`exclude`（`includes`和`excludes`的复数形式键），因为文档错误地声明了对此的支持。现在服务器接受其中之一。
</Update>

<Update label="2025-11-10" tags={["agent-server"]} rss={{ title: "2025-11-10 - agent-server" }}>
## v0.5.11

- 确保在流式传输线程时一致地应用身份验证处理程序，与最新的安全实践保持一致。
- 将 `undici` 依赖性从版本 6.21.3 提升到 7.16.0，引入了各种性能改进和错误修复。
- 将`p-queue`从版本8.0.1更新到9.0.0，引入新功能和重大更改，包括删除`throwOnTimeout`选项。
</Update>

<Update label="2025-11-10" tags={["agent-server"]} rss={{ title: "2025-11-10 - agent-server" }}>
## v0.5.10

在队列 /ok 处理程序中实现了健康检查调用，以提高 Kubernetes 活性和就绪探针兼容性。
</Update>

<Update label="2025-11-09" tags={["agent-server"]} rss={{ title: "2025-11-09 - agent-server" }}>
## v0.5.9- 解决了在 SIGINT 中断期间导致 `elapsed` 变量出现“未绑定本地错误”的问题。
- 将“中断”状态映射到 A2A 的“需要输入”状态，以便更好地调整任务状态。
</Update>

<Update label="2025-11-07" tags={["agent-server"]} rss={{ title: "2025-11-07 - agent-server" }}>
## v0.5.8

- 确保在启动 langgraph-ui 时将环境变量作为字典传递，以与 `uvloop` 兼容。
- 参考 PostgreSQL，实现了 Go 中运行的 CRUD 操作，简化了 JSON 合并并提高了事务可读性。
</Update>

<Update label="2025-11-07" tags={["agent-server"]} rss={{ title: "2025-11-07 - agent-server" }}>
## v0.5.7

将不重试 Redis 客户端替换为重试客户端，以更有效地处理连接错误并降低相应的日志记录严重性。
</Update>

<Update label="2025-11-06" tags={["agent-server"]} rss={{ title: "2025-11-06 - agent-server" }}>
## v0.5.6

- 添加了待处理时间指标，以更好地了解任务等待时间。
- 将`pb.Value`替换为`ChannelValue`以简化代码结构。
</Update>

<Update label="2025-11-05" tags={["agent-server"]} rss={{ title: "2025-11-05 - agent-server" }}>
## v0.5.5

使 Redis `health_check_interval` 更加频繁和可配置，以便更好地处理空闲连接。
</Update>

<Update label="2025-11-05" tags={["agent-server"]} rss={{ title: "2025-11-05 - agent-server" }}>
## v0.5.4

使用 `OPT_REPLACE_SURROGATES` 实现了 `ormsgpack` 并进行了更新，以与影响自定义身份验证依赖项的最新 FastAPI 版本兼容。
</Update>

<Update label="2025-11-03" tags={["agent-server"]} rss={{ title: "2025-11-03 - agent-server" }}>
## v0.5.2在启动期间添加了 PostgreSQL 连接的重试逻辑，以增强部署可靠性，并改进了错误日志记录以方便调试。
</Update>

<Update label="2025-11-03" tags={["agent-server"]} rss={{ title: "2025-11-03 - agent-server" }}>
## v0.5.1

- 解决了 LangChain.js 的 createAgent 功能持久性无法正常运行的问题。
- 通过改进数据库连接池和 gRPC 客户端重用来优化助手 CRUD 性能，减少大负载的延迟。
</Update>

<Update label="2025-10-31" tags={["agent-server"]} rss={{ title: "2025-10-31 - agent-server" }}>
## v0.5.0

此次要版本现在需要 langgraph-checkpoint 版本高于 3.0，以防止早期版本的 langgraph-checkpoint 库中的反序列化漏洞。
`langgraph-checkpoint` 库与 `langgraph` 次要版本 0.4、0.5、0.6 和 1.0 兼容。

此版本删除了对使用“json”类型保存的有效负载反序列化的默认支持，这从来都不是默认的。
默认情况下，对象使用 msgpack 进行序列化。在某些不常见的情况下，有效负载是使用旧的“json”模式序列化的。如果这些有效负载包含自定义 python 对象，则除非您提供 `serde` 配置，否则它们将不再可反序列化：

```json
{
    "checkpointer": {
        "serde": {
            "allowed_json_modules": [
                ["my_agent", "my_file", "SomeType"],
            ]
        }
    }
}
```
</Update>

<Update label="2025-10-29" tags={["agent-server"]} rss={{ title: "2025-10-29 - agent-server" }}>
## v0.4.47- 使用 TypeAdapter 验证和自动更正环境配置类型。
- 添加了对 LangChain.js 和 LangGraph.js 1.x 版的支持，确保兼容性。
- 将 hono 库从版本 4.9.7 更新到 4.10.3，解决了 CORS 中间件安全问题并增强了 JWT 受众验证。
- 引入了模块化基准框架，增加了对助手和流的支持，并改进了现有的斜坡基准方法。
- 引入了用于核心线程 CRUD 操作的 gRPC API，以及更新的 Python 和 TypeScript 客户端。
- 将 `hono` 包从版本 4.9.7 更新到 4.10.2，包括 JWT 受众验证的安全改进。
- 将 `hono` 依赖项从版本 4.9.7 更新到 4.10.3，以修复安全问题并改进 CORS 中间件处理。
- 引入了线程的基本 CRUD 操作，包括创建、获取、修补、删除、搜索、计数和复制，并支持 Go、gRPC 服务器以及 Python 和 TypeScript 客户端。
</Update>

<Update label="2025-10-21" tags={["agent-server"]} rss={{ title: "2025-10-21 - agent-server" }}>
## v0.4.46

添加了一个选项来启用来自子图事件的消息流，使用户可以更好地控制事件通知。
</Update>

<Update label="2025-10-21" tags={["agent-server"]} rss={{ title: "2025-10-21 - agent-server" }}>
## v0.4.45- 实现了对自定义路由授权的支持，由 `enable_custom_route_auth` 标志控制。
- 将默认跟踪设置为关闭以提高性能并简化调试。
</Update>

<Update label="2025-10-18" tags={["agent-server"]} rss={{ title: "2025-10-18 - agent-server" }}>
## v0.4.44

使用 Redis 密钥前缀作为许可证相关密钥，以防止与现有设置发生冲突。
</Update>

<Update label="2025-10-16" tags={["agent-server"]} rss={{ title: "2025-10-16 - agent-server" }}>
## v0.4.43

对 Redis 连接实施健康检查，以防止它们闲置。
</Update>

<Update label="2025-10-15" tags={["agent-server"]} rss={{ title: "2025-10-15 - agent-server" }}>
## v0.4.40

- 通过解决竞争条件并添加测试以确保行为一致，防止可恢复运行和线程流中出现重复消息。
- 确保在确认 pubsub 订阅之前不会开始运行，以防止启动时消息丢失。
- 将平台从 langgraph 重命名为提高清晰度和品牌化。
- 使用后重置 PostgreSQL 连接以防止锁定并改进事务问题的错误报告。
</Update>

<Update label="2025-10-10" tags={["agent-server"]} rss={{ title: "2025-10-10 - agent-server" }}>
## v0.4.39

- `hono`从4.7.6版本升级到4.9.7，解决`bodyLimit`中间件相关的安全问题。
- 允许自定义基本身份验证 URL 以增强灵活性。
- 使用“uv”将“ty”依赖项固定到稳定版本，以防止意外的 linting 失败。
</Update><Update label="2025-10-08" tags={["agent-server"]} rss={{ title: "2025-10-08 - agent-server" }}>
## v0.4.38

- 将 `LANGSMITH_API_KEY` 替换为 `LANGSMITH_CONTROL_PLANE_API_KEY`，以支持需要许可证验证的混合部署。
- 引入了自托管日志摄取支持，可通过 `SELF_HOSTED_LOGS_ENABLED` 和 `SELF_HOSTED_LOGS_ENDPOINT` 环境变量进行配置。
</Update>

<Update label="2025-10-06" tags={["agent-server"]} rss={{ title: "2025-10-06 - agent-server" }}>
## v0.4.37

需要创建复制线程的权限以确保正确的授权。
</Update>

<Update label="2025-10-03" tags={["agent-server"]} rss={{ title: "2025-10-03 - agent-server" }}>
## v0.4.36

- 改进了错误处理并为扫描循环添加了延迟，以便在 Redis 停机或取消错误期间实现更平稳的操作。
- 更新了队列入口点，以在启用 `FF_USE_CORE_API` 时启动 core-api gRPC 服务器。
- 引入了对辅助端点中无效配置的检查，以确保与其他端点的一致性。
</Update>

<Update label="2025-10-02" tags={["agent-server"]} rss={{ title: "2025-10-02 - agent-server" }}>
## v0.4.35- 解决了核心API中的时区问题，确保准确的时间数据检索。
- 引入了新的`middleware_order`设置，在自定义中间件之前应用身份验证中间件，从而可以更好地控制受保护的路由配置。
- 在 Redis 客户端创建期间发生错误时记录 Redis URL。
- 改进了 Go 引擎/运行时上下文传播，以确保一致的执行流程。
- 从执行器入口点删除了不必要的 `assistants.put` 调用以简化流程。
</Update>

<Update label="2025-10-01" tags={["agent-server"]} rss={{ title: "2025-10-01 - agent-server" }}>
## v0.4.34

阻止未经授权的用户更新线程 TTL 设置以增强安全性。
</Update>

<Update label="2025-10-01" tags={["agent-server"]} rss={{ title: "2025-10-01 - agent-server" }}>
## v0.4.33

- 通过记录 `LockNotOwnedError` 并将初始池迁移锁定超时延长至 60 秒，改进了 Redis 锁定的错误处理。
- 更新了 BaseMessage 架构以与最新的 langchain-core 版本保持一致，并同步构建依赖项以实现一致的本地开发。
</Update>

<Update label="2025-09-30" tags={["agent-server"]} rss={{ title: "2025-09-30 - agent-server" }}>
## v0.4.32

- 在 API 映像中添加了 GO 持久层，支持 PostgreSQL 支持的 GRPC 服务器操作并增强了可配置性。
- 当发生超时时将状态设置为错误以改进错误处理。
</Update>

<Update label="2025-09-30" tags={["agent-server"]} rss={{ title: "2025-09-30 - agent-server" }}>
## v0.4.30- 添加了使用 `stream_mode="events"` 时对上下文的支持，并包含了对此功能的新测试。
- 添加了对使用 `$LANGGRAPH_SERVER_PORT` 覆盖服务器端口的支持，并删除了不必要的 Dockerfile `ARG` 以实现更清晰的配置。
- 对线程删除 CTE 中的所有表引用应用授权过滤器以增强安全性。
- 引入了自托管指标摄取功能，允许在设置相应的环境变量时每分钟将指标发送到 OTLP 收集器。
- 确保`set_latest`功能正确更新版本的名称和描述。
</Update>

<Update label="2025-09-26" tags={["agent-server"]} rss={{ title: "2025-09-26 - agent-server" }}>
## v0.4.29

确保在所有场景中正确清理 redis pubsub 连接。
</Update>

<Update label="2025-09-25" tags={["agent-server"]} rss={{ title: "2025-09-25 - agent-server" }}>
## v0.4.28- 向队列指标服务器添加了格式参数以增强自定义功能。
- 更正了 CLI 中的 `MOUNT_PREFIX` 环境变量用法，以与文档保持一致并防止混淆。
- 添加了一项功能，用于在由于没有订阅者而导致消息被丢弃时记录警告，可通过功能标志进行控制。
- 在 Node 镜像中添加了对 Bookworm 和 Bullseye 发行版的支持。
- 通过将执行器定义从`langgraph-go`存储库中移出来合并执行器定义，提高可管理性并更新服务器迁移的检查点设置方法。
- 确保为 a2a 发送正确的响应标头，提高兼容性和通信。
- 整合 PostgreSQL 检查点实现，添加了`/core`目录的 CI 测试，修复了 RemoteStore 测试错误，并通过事务增强了 Store 实现。
- 将 PostgreSQL 迁移添加到队列服务器，以防止在执行迁移之前添加图表时出现错误。
</Update>

<Update label="2025-09-23" tags={["agent-server"]} rss={{ title: "2025-09-23 - agent-server" }}>
## v0.4.27

将 `coredis` 替换为 `redis-py`，以提高高流量负载下的连接处理和可靠性。
</Update>

<Update label="2025-09-22" tags={["agent-server"]} rss={{ title: "2025-09-22 - agent-server" }}>
## v0.4.24- 添加了根据 A2A 规范返回 A2A 呼叫的完整消息历史记录的功能。
- 向 Dockerfiles 添加了 `LANGGRAPH_SERVER_HOST` 环境变量，以支持双堆栈模式的自定义主机设置。
</Update>

<Update label="2025-09-22" tags={["agent-server"]} rss={{ title: "2025-09-22 - agent-server" }}>
## v0.4.23

使用更快的消息编解码器进行 Redis 流式处理。
</Update>

<Update label="2025-09-19" tags={["agent-server"]} rss={{ title: "2025-09-19 - agent-server" }}>
## v0.4.22

将长流处理移植到运行流、加入和取消端点，以改进流管理。
</Update>

<Update label="2025-09-18" tags={["agent-server"]} rss={{ title: "2025-09-18 - agent-server" }}>
## v0.4.21

- 添加了 A2A 流媒体功能并增强了 A2A SDK 的测试。
- 添加了 Prometheus 指标来跟踪图形、中间件和身份验证中的语言使用情况，以提高洞察力。
- 修复了开源软件中与块消息转换相关的错误。
- 从 pubsub 订阅中删除了等待，以减少集群测试中的不稳定，并在关闭套件中添加重试以增强 API 稳定性。
</Update>

<Update label="2025-09-11" tags={["agent-server"]} rss={{ title: "2025-09-11 - agent-server" }}>
## v0.4.20

优化 Pubsub 初始化，以防止开销并解决订阅计时问题，确保更顺畅的运行执行。
</Update>

<Update label="2025-09-11" tags={["agent-server"]} rss={{ title: "2025-09-11 - agent-server" }}>
## v0.4.19

通过解决版本 3.2.10 中引入的功能检查，删除了 psycopg 中的警告。
</Update>

<Update label="2025-09-11" tags={["agent-server"]} rss={{ title: "2025-09-11 - agent-server" }}>
## v0.4.17过滤掉带有安装前缀的日志，以减少日志输出中的噪音。
</Update>

<Update label="2025-09-10" tags={["agent-server"]} rss={{ title: "2025-09-10 - agent-server" }}>
## v0.4.16

- 添加了对 a2a 中隐式线程创建的支持以简化操作。
- 改进了分布式运行时流中的错误序列化和发射，从而实现更全面的测试。
</Update>

<Update label="2025-09-09" tags={["agent-server"]} rss={{ title: "2025-09-09 - agent-server" }}>
## v0.4.13

- 监控运行状况端点中的队列状态，以确保 PostgreSQL 初始化失败时的正确行为。
- 解决了扫描 ID 长度不等的问题，以提高日志清晰度。
- 通过避免 DR 有效负载的重新序列化、使用 msgpack 字节检查进行类似 json 的解析来增强流输出。
</Update>

<Update label="2025-09-04" tags={["agent-server"]} rss={{ title: "2025-09-04 - agent-server" }}>
## v0.4.12

- 即使遇到数据库连接问题，也能确保返回指标。
- 优化更新流以防止不必要的数据传输。
- 将`storage_postgres/langgraph-api-server`中的`hono`从版本4.9.2升级到4.9.6，以提高URL路径解析安全性。
- 为 LangSmith 访问调用添加了重试和内存缓存，以提高针对单一故障的恢复能力。
</Update>

<Update label="2025-09-04" tags={["agent-server"]} rss={{ title: "2025-09-04 - agent-server" }}>
## v0.4.11

在线程更新中添加了对 TTL（生存时间）的支持。
</Update>

<Update label="2025-09-04" tags={["agent-server"]} rss={{ title: "2025-09-04 - agent-server" }}>
## v0.4.10在分布式运行时，更新最终检查点 -> 线程设置的 Serde 逻辑。
</Update>

<Update label="2025-09-02" tags={["agent-server"]} rss={{ title: "2025-09-02 - agent-server" }}>
## v0.4.9

- 添加了对在搜索端点中按 ID 过滤搜索结果的支持，以实现更精确的查询。
- 包括辅助端点的可配置标头，以增强请求定制。
- 实现了一个简单的 A2A 端点，支持代理卡检索、任务创建和任务管理。
</Update>

<Update label="2025-08-30" tags={["agent-server"]} rss={{ title: "2025-08-30 - agent-server" }}>
## v0.4.7

停止包含 x-api-key 以增强安全性。
</Update>

<Update label="2025-08-29" tags={["agent-server"]} rss={{ title: "2025-08-29 - agent-server" }}>
## v0.4.6

修复了加入流时的竞争条件，防止重复启动事件。
</Update>

<Update label="2025-08-29" tags={["agent-server"]} rss={{ title: "2025-08-29 - agent-server" }}>
## v0.4.5

- 确保检查点在队列之前和之后正确启动和停止，以提高关闭和启动效率。
- 解决了取消队列时工作人员被提前取消的问题。
- 通过在 Redis 无法唤醒工作线程的情况下添加后备措施来防止队列终止。
</Update>

<Update label="2025-08-28" tags={["agent-server"]} rss={{ title: "2025-08-28 - agent-server" }}>
## v0.4.4

- 将无状态运行的自定义身份验证 thread_id 设置为 None 以防止冲突。
- 通过添加唤醒工作器和 Redis 锁实现以及更新的扫描逻辑，改进了 Go 运行时中的 Redis 信号。
</Update><Update label="2025-08-27" tags={["agent-server"]} rss={{ title: "2025-08-27 - agent-server" }}>
## v0.4.3

- 向线程流添加了流模式以改进数据处理。
- 为运行添加了持久性参数，以提高数据持久性。
</Update>

<Update label="2025-08-27" tags={["agent-server"]} rss={{ title: "2025-08-27 - agent-server" }}>
## v0.4.2

确保 pubsub 在创建运行之前初始化，以防止因丢失消息而出现错误。
</Update>

<Update label="2025-08-25" tags={["agent-server"]} rss={{ title: "2025-08-25 - agent-server" }}>
## v0.4.0

次要版本 0.4 带来了许多改进以及一些重大更改。

- 在线程流中正确发出尝试消息。
- 通过在集群映射中仅使用线程 ID 进行散列来减少集群冲突，并通过 Stream_thread_cache 优先考虑效率。
- 引入了线程流端点来跟踪顺序执行的运行中的所有输出。
- 使 PostgreSQL 中的过滤器查询生成器对格式错误的表达式更加强大，并改进了验证以防止潜在的安全风险。

此次要版本还包括一些重大更改，以提高服务的可用性和安全性：- 在此次要版本中，我们停止了在运行中自动包含标头作为可配置值的做法。您可以通过在代理服务器配置中设置 **configurable_headers** 来选择特定模式。
- 运行流事件 ID（对于可恢复流）现在采用 `ms-seq` 格式，而不是以前的格式。我们保留对旧格式的向后兼容性，但我们建议对新代码使用新格式。
</Update>

<Update label="2025-08-25" tags={["agent-server"]} rss={{ title: "2025-08-25 - agent-server" }}>
## v0.3.4

- 为 Redis/PG 连接池添加了自定义 Prometheus 指标，并将队列服务器切换到 Uvicorn/Starlette 以改进监控。
- 通过更正 shell 命令格式来恢复 Wolfi 映像构建，并添加 Makefile 目标以使用 nginx 进行测试。
</Update>

<Update label="2025-08-22" tags={["agent-server"]} rss={{ title: "2025-08-22 - agent-server" }}>
## v0.3.3

- 为特定的 Redis 调用添加了超时，以防止工作人员处于活动状态。
- 更新了 Golang 运行时并添加了 pytest 跳过不受支持的功能，包括对将存储传递到节点和消息流的初始支持。
- 引入了反向代理设置，用于服务组合的 Python 和 Node.js 图形，并使用 nginx 处理服务器路由，以促进 Node.js API 服务器的 Postgres/Redis 后端。
</Update><Update label="2025-08-21" tags={["agent-server"]} rss={{ title: "2025-08-21 - agent-server" }}>
## v0.3.1

向池中添加了语句超时以防止长时间运行的查询。
</Update>

<Update label="2025-08-21" tags={["agent-server"]} rss={{ title: "2025-08-21 - agent-server" }}>
## v0.3.0

- 设置默认的15分钟语句超时，并对长时间运行的查询进行监控，以确保系统效率。
- 停止将运行可配置值传播到线程配置，因为如果您指定 checkpoint_id，这可能会导致后续运行出现问题。这是行为上的**轻微破坏性变化**，因为线程值将不再自动反映最近运行的联合配置。然而，我们认为这种行为更直观。
- 通过处理 ops.py 中通道名称中的事件数据，增强了与旧工作程序版本的兼容性。
</Update>

<Update label="2025-08-20" tags={["agent-server"]} rss={{ title: "2025-08-20 - agent-server" }}>
## v0.2.137

修复了未绑定的本地错误并改进了线程中断或错误的日志记录以及类型更新。
</Update>

<Update label="2025-08-20" tags={["agent-server"]} rss={{ title: "2025-08-20 - agent-server" }}>
## v0.2.136

- 添加了增强的日志记录以帮助调试元视图问题。
- 将执行器和运行时升级到最新版本，以提高性能和稳定性。
</Update>

<Update label="2025-08-19" tags={["agent-server"]} rss={{ title: "2025-08-19 - agent-server" }}>
## v0.2.135

确保正确等待异步协程以防止潜在的运行时错误。
</Update>

<Update label="2025-08-18" tags={["agent-server"]} rss={{ title: "2025-08-18 - agent-server" }}>
## v0.2.134增强的搜索功能，允许用户为查询结果选择特定列，从而提高性能。
</Update>

<Update label="2025-08-18" tags={["agent-server"]} rss={{ title: "2025-08-18 - agent-server" }}>
## v0.2.133

- 添加了 cron、线程和助手的计数端点以增强数据跟踪 (#1132)。
- 改进了 SSH 功能，提高可靠性和稳定性。
- 将 @langchain/langgraph-api 更新到版本 0.0.59 以修复无效的状态架构问题。
</Update>

<Update label="2025-08-15" tags={["agent-server"]} rss={{ title: "2025-08-15 - agent-server" }}>
## v0.2.132

- 添加了Go语言镜像以增强项目兼容性和功能。
- 为 JS 工作人员打印内部 PID，以便于通过 SIGUSR1 信号进行过程检查。
- 解决了尝试插入重复运行时发生的`run_pkey`错误。
- 添加了`ty run`命令并切换为使用uuid7来生成运行ID。
- 实现了最初的 Golang 运行时以扩展语言支持。
</Update>

<Update label="2025-08-14" tags={["agent-server"]} rss={{ title: "2025-08-14 - agent-server" }}>
## v0.2.131

添加了对 `object agent spec` 的支持以及 JS 中的描述。
</Update>

<Update label="2025-08-13" tags={["agent-server"]} rss={{ title: "2025-08-13 - agent-server" }}>
## v0.2.130- 添加了功能标志 (FF_RICH_THREADS=false) 以禁用运行创建时的线程更新，减少锁争用并简化线程状态处理。
- 利用`aput`和`apwrite`操作的现有连接来提高性能。
- 改进了解码问题的错误处理，以增强数据处理的可靠性。
- 从日志中排除标头以提高安全性，同时维护运行时功能。
- 修复了阻止将插槽映射到单个节点的错误。
- 添加了调试日志来跟踪 JS 部署中的节点执行情况，以改进问题诊断。
- 将默认多任务策略更改为排队，通过消除在新运行插入期间获取运行中运行的需要来提高吞吐量。
- 优化`Runs.next`和`Runs.sweep`的数据库操作，减少冗余查询，提高效率。
- 通过跳过不必要的运行中运行查询来提高运行创建速度。
</Update>

<Update label="2025-08-11" tags={["agent-server"]} rss={{ title: "2025-08-11 - agent-server" }}>
## v0.2.129

- 停止将内部 LGP 字段传递到上下文以防止破坏类型检查。
- 公开内容位置标头以确保 API 中正确的可恢复行为。
</Update>

<Update label="2025-08-08" tags={["agent-server"]} rss={{ title: "2025-08-08 - agent-server" }}>
## v0.2.128确保助手中`configurable`和`context`之间的同步更新，防止设置错误并支持更平滑的版本过渡。
</Update>

<Update label="2025-08-08" tags={["agent-server"]} rss={{ title: "2025-08-08 - agent-server" }}>
## v0.2.127

从可恢复流中排除未请求的流模式以优化功能。
</Update>

<Update label="2025-08-08" tags={["agent-server"]} rss={{ title: "2025-08-08 - agent-server" }}>
## v0.2.126

- 使访问记录器标头可配置，以增强记录灵活性。
- 消除了 Runs.stats 函数的抖动，以减少昂贵的调用频率并提高性能。
- 为清扫机引入了去抖功能，以提高性能和效率（#1147）。
- 获得了 TTL 扫描锁定，以防止在横向扩展操作期间出现数据库垃圾邮件。
</Update>

<Update label="2025-08-06" tags={["agent-server"]} rss={{ title: "2025-08-06 - agent-server" }}>
## v0.2.125

更新了跟踪上下文副本以使用新格式，确保兼容性。
</Update>

<Update label="2025-08-06" tags={["agent-server"]} rss={{ title: "2025-08-06 - agent-server" }}>
## v0.2.123

向队列副本添加了一个入口点以改进部署管理。
</Update>

<Update label="2025-08-06" tags={["agent-server"]} rss={{ title: "2025-08-06 - agent-server" }}>
## v0.2.122

利用`join`中的持久中断状态来确保完成后正确处理用户的中断状态。
</Update>

<Update label="2025-08-06" tags={["agent-server"]} rss={{ title: "2025-08-06 - agent-server" }}>
## v0.2.121- 将事件合并到单个通道，以防止竞争条件并优化启动性能。
- 确保在队列工作人员上调用自定义生命周期以进行正确设置，并添加测试。
</Update>

<Update label="2025-08-04" tags={["agent-server"]} rss={{ title: "2025-08-04 - agent-server" }}>
## v0.2.120

- 恢复了运行的原始流行为，确保基于 `stream_mode` 设置一致包含中断事件。
- 优化 `Runs.next` 查询，将平均执行时间从约 14.43 毫秒减少到约 2.42 毫秒，从而提高性能。
- 添加了对流模式“任务”和“检查点”的支持，标准化了 UI 命名空间，并升级了`@langchain/langgraph-api`以增强功能。
</Update>

<Update label="2025-07-31" tags={["agent-server"]} rss={{ title: "2025-07-31 - agent-server" }}>
## v0.2.117

在线程上添加了复合索引，以便通过基于所有者的身份验证进行更快的搜索，并将默认排序顺序更新为`updated_at`以提高查询性能。
</Update>

<Update label="2025-07-31" tags={["agent-server"]} rss={{ title: "2025-07-31 - agent-server" }}>
## v0.2.116

将历史检查点的默认数量从 10 个减少到 1 个以优化性能。
</Update>

<Update label="2025-07-31" tags={["agent-server"]} rss={{ title: "2025-07-31 - agent-server" }}>
## v0.2.115

优化缓存重用以提高应用程序性能和效率。
</Update>

<Update label="2025-07-30" tags={["agent-server"]} rss={{ title: "2025-07-30 - agent-server" }}>
## v0.2.113

通过使用 `X-Pagination-Total` 和 `X-Pagination-Next` 更新响应标头来改进线程搜索分页，以实现更好的导航。
</Update>

<Update label="2025-07-30" tags={["agent-server"]} rss={{ title: "2025-07-30 - agent-server" }}>
## v0.2.112- 确保等待同步日志记录方法并添加 linter 以防止将来发生。
- 修复了 JavaScript 任务未正确填充 JS 图表的问题。
</Update>

<Update label="2025-07-29" tags={["agent-server"]} rss={{ title: "2025-07-29 - agent-server" }}>
## v0.2.111

通过在连接打开后立即启动心跳来修复 JS 图形流式传输失败的问题。
</Update>

<Update label="2025-07-29" tags={["agent-server"]} rss={{ title: "2025-07-29 - agent-server" }}>
## v0.2.110

添加中断作为连接操作的默认值，同时保留流行为。
</Update>

<Update label="2025-07-28" tags={["agent-server"]} rss={{ title: "2025-07-28 - agent-server" }}>
## v0.2.109

修复了未设置`config_type`时配置架构丢失的问题，确保配置更可靠。
</Update>

<Update label="2025-07-28" tags={["agent-server"]} rss={{ title: "2025-07-28 - agent-server" }}>
## v0.2.108

准备好与新的上下文 API 支持和错误修复兼容 LangGraph v0.6。
</Update>

<Update label="2025-07-27" tags={["agent-server"]} rss={{ title: "2025-07-27 - agent-server" }}>
## v0.2.107

- 为身份验证过程实施缓存以提高性能和效率。
- 通过合并计数和选择查询优化数据库性能。
</Update>

<Update label="2025-07-27" tags={["agent-server"]} rss={{ title: "2025-07-27 - agent-server" }}>
## v0.2.106

使日志流可恢复，从而增强可靠性并改善重新连接时的用户体验。
</Update>

<Update label="2025-07-27" tags={["agent-server"]} rss={{ title: "2025-07-27 - agent-server" }}>
## v0.2.105

添加了 heapdump 端点以将内存堆信息保存到文件中。
</Update>

<Update label="2025-07-25" tags={["agent-server"]} rss={{ title: "2025-07-25 - agent-server" }}>
## v0.2.103使用正确的元数据端点来解决数据检索问题。
</Update>

<Update label="2025-07-24" tags={["agent-server"]} rss={{ title: "2025-07-24 - agent-server" }}>
## v0.2.102

- 在 wait 方法中捕获中断事件以保留 langgraph 0.5.0 中的先前行为。
- 在 JavaScript 环境中添加了对 SDK structlog 的支持，以增强日志记录功能。
</Update>

<Update label="2025-07-24" tags={["agent-server"]} rss={{ title: "2025-07-24 - agent-server" }}>
## v0.2.101

更正了自托管部署的元数据端点。
</Update>

<Update label="2025-07-22" tags={["agent-server"]} rss={{ title: "2025-07-22 - agent-server" }}>
## v0.2.99

- 通过添加内存缓存并更有效地处理 Redis 连接错误来改进许可证检查。
- 重新加载助手以保留手动创建的助手，同时丢弃从配置文件中删除的助手。
- 恢复了更改以确保 gen UI 的 UI 命名空间是有效的 JavaScript 属性名称。
- 确保生成的 UI 的 UI 命名空间是有效的 JavaScript 属性名称，从而提高 API 合规性。
- 增强了错误处理，以针对无法处理的实体请求返回 422 状态代码。
</Update>

<Update label="2025-07-19" tags={["agent-server"]} rss={{ title: "2025-07-19 - agent-server" }}>
## v0.2.98

向 langgraph 节点添加了上下文，以改进日志过滤和跟踪可见性。
</Update>

<Update label="2025-07-19" tags={["agent-server"]} rss={{ title: "2025-07-19 - agent-server" }}>
## v0.2.97- 改进了与主循环上的 ckpt 摄取工作线程的互操作性，以防止任务调度问题。
- 延迟队列工作程序启动，直到迁移完成后，以防止过早执行。
- 通过添加特定元数据和改进的响应代码来增强线程状态错误处理，以便在创建期间状态更新失败时更加清晰。
- 检索线程状态时公开中断 ID，以提高 API 透明度。
</Update>

<Update label="2025-07-17" tags={["agent-server"]} rss={{ title: "2025-07-17 - agent-server" }}>
## v0.2.96

为可配置标头模式添加了后备机制，以更有效地处理排除/包含设置。
</Update>

<Update label="2025-07-17" tags={["agent-server"]} rss={{ title: "2025-07-17 - agent-server" }}>
## v0.2.95

- 如果已经完成，则避免设置未来，以防止冗余操作。
- 通过将 3.12 以下的 Python 版本从 `typing.TypedDict` 切换到 `typing_extensions.TypedDict`，解决了 CI 中的兼容性错误。
</Update>

<Update label="2025-07-16" tags={["agent-server"]} rss={{ title: "2025-07-16 - agent-server" }}>
## v0.2.94

- 通过省略 langgraph 版本 0.5 及更高版本的待处理发送来提高性能。
- 改进了服务器启动日志，以便在设置 DD_API_KEY 环境变量时提供更清晰的警告。
</Update>

<Update label="2025-07-16" tags={["agent-server"]} rss={{ title: "2025-07-16 - agent-server" }}>
## v0.2.93

删除了运行元数据的 GIN 索引以提高性能。
</Update>

<Update label="2025-07-16" tags={["agent-server"]} rss={{ title: "2025-07-16 - agent-server" }}>
## v0.2.92启用了 blob 和检查点的复制功能，提高了数据管理的灵活性。
</Update>

<Update label="2025-07-16" tags={["agent-server"]} rss={{ title: "2025-07-16 - agent-server" }}>
## v0.2.91

通过内联小值（null、numeric、str 等）减少对 `checkpoint_blobs` 表的写入。这意味着我们不需要为尚未更新的通道存储额外的值。
</Update>

<Update label="2025-07-16" tags={["agent-server"]} rss={{ title: "2025-07-16 - agent-server" }}>
## v0.2.90

通过节点本地后台队列改进检查点写入。
</Update>

<Update label="2025-07-15" tags={["agent-server"]} rss={{ title: "2025-07-15 - agent-server" }}>
## v0.2.89

通过删除外键和更新记录器，将检查点写入与线程/运行状态分离，以防止与超时相关的故障。
</Update>

<Update label="2025-07-14" tags={["agent-server"]} rss={{ title: "2025-07-14 - agent-server" }}>
## v0.2.88

删除了 `run` 表中 `thread` 的外键约束，以简化数据库架构。
</Update>

<Update label="2025-07-14" tags={["agent-server"]} rss={{ title: "2025-07-14 - agent-server" }}>
## v0.2.87

为 Redis 工作信号添加了更详细的日志，以改进调试。
</Update>

<Update label="2025-07-11" tags={["agent-server"]} rss={{ title: "2025-07-11 - agent-server" }}>
## v0.2.86

尊重`/mcp`端点中的工具描述，以与预期功能保持一致。
</Update>

<Update label="2025-07-10" tags={["agent-server"]} rss={{ title: "2025-07-10 - agent-server" }}>
## v0.2.85

在 `runs/wait` 中添加了对 `on_disconnect` 字段的支持，并包含断开连接日志以实现更好的调试。
</Update>

<Update label="2025-07-09" tags={["agent-server"]} rss={{ title: "2025-07-09 - agent-server" }}>
## v0.2.84

删除了不必要的状态更新以简化线程处理并将版本更新到 0.2.84。
</Update>

<Update label="2025-07-09" tags={["agent-server"]} rss={{ title: "2025-07-09 - agent-server" }}>
## v0.2.83- 将可恢复流的默认生存时间缩短至 2 分钟。
- 增强了数据提交逻辑，可根据许可证配置将数据发送到 Beacon 和LangSmith 实例。
- 配置端点时启用将自托管数据提交到 LangSmith 实例。
</Update>

<Update label="2025-07-03" tags={["agent-server"]} rss={{ title: "2025-07-03 - agent-server" }}>
## v0.2.82

通过使用连接实现锁定来解决后台运行中的竞争条件，确保跨 CTE 的可靠执行。
</Update>

<Update label="2025-07-03" tags={["agent-server"]} rss={{ title: "2025-07-03 - agent-server" }}>
## v0.2.81

通过减少初始等待时间来优化运行流，以提高对旧运行或不存在运行的响应能力。
</Update>

<Update label="2025-07-03" tags={["agent-server"]} rss={{ title: "2025-07-03 - agent-server" }}>
## v0.2.80

更正了 `logger.ainfo()` API 调用中的参数传递以解决 TypeError。
</Update>

<Update label="2025-07-02" tags={["agent-server"]} rss={{ title: "2025-07-02 - agent-server" }}>
## v0.2.79

- 通过更正 JSON 序列化以正确处理尾部斜杠，修复了远程图形检查点中的 JsonDecodeError。
- 引入了一个配置标志来在所有路由上全局禁用 webhook。
</Update>

<Update label="2025-07-02" tags={["agent-server"]} rss={{ title: "2025-07-02 - agent-server" }}>
## v0.2.78

- 为 webhook 调用添加了超时重试以提高可靠性。
- 添加了 HTTP 请求指标，包括请求计数和延迟直方图，以增强监控功能。
</Update>

<Update label="2025-07-02" tags={["agent-server"]} rss={{ title: "2025-07-02 - agent-server" }}>
## v0.2.77- 添加了 HTTP 指标以改进性能监控。
- 更改了 Redis 缓存分隔符以减少与子图消息名称的冲突并更新了缓存行为。
</Update>

<Update label="2025-07-01" tags={["agent-server"]} rss={{ title: "2025-07-01 - agent-server" }}>
## v0.2.76

更新了 Redis 缓存分隔符以防止与子图消息发生冲突。
</Update>

<Update label="2025-06-30" tags={["agent-server"]} rss={{ title: "2025-06-30 - agent-server" }}>
## v0.2.74

在隔离循环中安排 webhook，以确保线程安全操作并防止 PYTHONASYNCIODEBUG=1 出现错误。
</Update>

<Update label="2025-06-27" tags={["agent-server"]} rss={{ title: "2025-06-27 - agent-server" }}>
## v0.2.73

- 修复了无限帧循环问题并删除了由于 structlog 的意外行为而导致的 dict_parser。
- 在运行取消期间发生死锁时抛出 409 错误，以优雅地处理锁冲突。
</Update>

<Update label="2025-06-27" tags={["agent-server"]} rss={{ title: "2025-06-27 - agent-server" }}>
## v0.2.72

- 确保与未来的 langgraph 版本兼容。
- 实施了 409 响应状态来处理取消期间的死锁问题。
</Update>

<Update label="2025-06-26" tags={["agent-server"]} rss={{ title: "2025-06-26 - agent-server" }}>
## v0.2.71

改进了日志记录，使日志类型更加清晰和详细。
</Update>

<Update label="2025-06-26" tags={["agent-server"]} rss={{ title: "2025-06-26 - agent-server" }}>
## v0.2.70

改进了错误处理，以更好地区分和记录由用户引起的内部运行超时的 TimeoutErrors。
</Update>

<Update label="2025-06-26" tags={["agent-server"]} rss={{ title: "2025-06-26 - agent-server" }}>
## v0.2.69向 crons API 添加了排序和分页，并更新了架构定义以提高准确性。
</Update>

<Update label="2025-06-26" tags={["agent-server"]} rss={{ title: "2025-06-26 - agent-server" }}>
## v0.2.66

修复了使用 `on_not_exist="create"` 创建具有相同 thread_id 的多个运行时的 404 错误。
</Update>

<Update label="2025-06-25" tags={["agent-server"]} rss={{ title: "2025-06-25 - agent-server" }}>
## v0.2.65

- 确保在必要时仅返回来自`assistant_versions`的字段。
- 确保内存中和 PostgreSQL 用户的数据类型一致，改进内部身份验证处理。
</Update>

<Update label="2025-06-24" tags={["agent-server"]} rss={{ title: "2025-06-24 - agent-server" }}>
## v0.2.64

为版本条目添加了描述，以便更加清晰。
</Update>

<Update label="2025-06-23" tags={["agent-server"]} rss={{ title: "2025-06-23 - agent-server" }}>
## v0.2.62

- 改进了 JS Studio 中自定义身份验证的用户处理。
- 在指标端点中添加了 Prometheus 格式的运行统计信息，以便更好地监控。
- 将 Prometheus 格式的运行统计信息添加到指标端点。
</Update>

<Update label="2025-06-20" tags={["agent-server"]} rss={{ title: "2025-06-20 - agent-server" }}>
## v0.2.61

设置 Redis 连接的最大空闲时间，以防止不必要的打开连接。
</Update>

<Update label="2025-06-20" tags={["agent-server"]} rss={{ title: "2025-06-20 - agent-server" }}>
## v0.2.60

- 增强的错误日志记录包括字典操作的回溯详细信息。
- 添加了 `/metrics` 端点以公开队列工作器指标以进行监控。
</Update>

<Update label="2025-06-18" tags={["agent-server"]} rss={{ title: "2025-06-18 - agent-server" }}>
## v0.2.57- 从可重试异常中删除了 CancelledError，以允许本地中断，同时保持工作线程的可重试性。
- 引入了中间件，以便在收到 SIGINT 后完成正在进行的请求后正常关闭服务器。
- 减少检查点中存储的元数据，仅包含必要的信息。
- 改进了连接运行中的错误处理，以在出现错误时返回错误详细信息。
</Update>

<Update label="2025-06-17" tags={["agent-server"]} rss={{ title: "2025-06-17 - agent-server" }}>
## v0.2.56

通过添加 SIGTERM 信号的处理程序提高了应用程序稳定性。
</Update>

<Update label="2025-06-17" tags={["agent-server"]} rss={{ title: "2025-06-17 - agent-server" }}>
## v0.2.55

- 改进了队列入口点取消的处理。
- 改进了队列入口点的取消处理。
</Update>

<Update label="2025-06-16" tags={["agent-server"]} rss={{ title: "2025-06-16 - agent-server" }}>
## v0.2.54

- 增强了许可证验证期间 LuaLock 超时的错误消息。
- 通过要求显式 ::text 转换并相应更新测试来修复自定义身份验证中的 $contains 过滤器。
- 确保项目和租户 ID 格式化为 UUID 以保持一致性。
</Update>

<Update label="2025-06-13" tags={["agent-server"]} rss={{ title: "2025-06-13 - agent-server" }}>
## v0.2.53- 解决了计时问题，以确保队列仅在图形注册后启动。
- 通过在单个查询中设置线程和运行状态并增强检查点写入期间的错误处理来提高性能。
- 将默认后台宽限期减少至 3 分钟。
</Update>

<Update label="2025-06-12" tags={["agent-server"]} rss={{ title: "2025-06-12 - agent-server" }}>
## v0.2.52

- 现在，当遗漏图表时记录预期图表以提高可追溯性。
- 为可恢复流实现了生存时间 (TTL) 功能。
- 通过添加唯一索引和优化行锁定提高查询效率和一致性。
</Update>

<Update label="2025-06-12" tags={["agent-server"]} rss={{ title: "2025-06-12 - agent-server" }}>
## v0.2.51- 通过将任务标记为准备重试来处理`CancelledError`，改进工作进程中的错误管理。
- 将 LG API 版本和请求 ID 添加到元数据和日志中，以便更好地跟踪。
- 在元数据和日志中添加了 LG API 版本和请求 ID，以提高可追溯性。
- 通过并发创建索引提高数据库性能。
- 确保仅在设置 Redis 运行标记以防止竞争条件后才提交 postgres 写入。
- 通过在 thread_id/running 上添加唯一索引、优化行锁并确保确定性运行选择来增强查询效率和可靠性。
- 通过确保 Postgres 更新仅在设置 Redis 运行标记后发生来解决竞争条件。
</Update>

<Update label="2025-06-07" tags={["agent-server"]} rss={{ title: "2025-06-07 - agent-server" }}>
## v0.2.46

为每个操作引入了一个新连接，同时保留线程状态`update()`和`bulk()`命令中的事务特征。
</Update>

<Update label="2025-06-05" tags={["agent-server"]} rss={{ title: "2025-06-05 - agent-server" }}>
## v0.2.45- 通过合并跟踪上下文增强流功能。
- 从 Crons.search 函数中删除了不必要的查询。
- 解决了为多个 cron 作业安排下一次运行时的连接重用问题。
- 删除了 Crons.search 函数中不必要的查询以提高效率。
- 通过改进连接重用解决了安排下一个 cron 运行的问题。
</Update>

<Update label="2025-06-04" tags={["agent-server"]} rss={{ title: "2025-06-04 - agent-server" }}>
## v0.2.44

- 增强了工作逻辑，以便在达到 Redis 消息限制时先退出管道，然后再继续。
- 引入了 Redis 消息大小上限，并可以选择跳过大于 128 MB 的消息以提高性能。
- 确保管道始终正确关闭以防止资源泄漏。
</Update>

<Update label="2025-06-04" tags={["agent-server"]} rss={{ title: "2025-06-04 - agent-server" }}>
## v0.2.43

- 通过省略元数据调用中的日志并确保价值流中的输出模式合规性来提高性能。
- 确保使用后连接正确关闭。
- 对齐输出格式以严格遵守指定的架构。
- 停止在元数据请求中发送内部日志以提高隐私性。
</Update>

<Update label="2025-06-04" tags={["agent-server"]} rss={{ title: "2025-06-04 - agent-server" }}>
## v0.2.42- 添加了时间戳来跟踪请求运行的开始和结束。
- 在配置设置中添加了跟踪器信息。
- 添加了对带有跟踪上下文的流式传输的支持。
</Update>

<Update label="2025-06-03" tags={["agent-server"]} rss={{ title: "2025-06-03 - agent-server" }}>
## v0.2.41

添加了锁定机制以防止管道执行中出现错误。
</Update>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/agent-server-changelog.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>