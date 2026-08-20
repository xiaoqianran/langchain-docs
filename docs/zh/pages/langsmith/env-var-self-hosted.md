<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-hosted Agent Server environment variables | https://docs.langchain.com/langsmith/env-var-self-hosted -->

# 自托管代理服务器环境变量

部署在 [self-hosted](/langsmith/deploy-to-self-hosted-overview) 基础设施上时，代理服务器支持以下环境变量。有关特定于云部署的变量，请参阅[Cloud Agent Server environment variables](/langsmith/env-var-cloud)。

## `BG_JOB_ISOLATED_LOOPS`

将 `BG_JOB_ISOLATED_LOOPS` 设置为 `True` 以在与服务 API 事件循环分开的隔离事件循环中执行后台运行。

<Warning>
启用此标志并不能消除根本问题。它将同步阻塞工作从服务 API 的事件循环中移出，以便运行状况检查不再失败，但阻塞代码继续在后台循环上运行，并且**将**继续导致生产中出现问题，例如吞吐量下降、尾部延迟峰值、工作人员饥饿或连接池耗尽（请参阅下面的池大小警告）以及负载下扩展不佳。要正确解决这些问题，请在整个代理中使用本机异步驱动程序和异步代码。这意味着像`httpx`或`aiohttp`这样的异步HTTP客户端（尽管我们建议缓存客户端以避免加载SSL上下文的CPU开销），像`asyncpg`或`psycopg[async]`这样的异步数据库驱动程序，以及异步模型SDK。对于不可避免的同步库，请将特定调用包装在 `asyncio.to_thread(...)` 或 `loop.run_in_executor(...)` 中，而不是为整个部署启用此标志。
</Warning>

如果图/节点的实现包含同步代码，则应将此环境变量设置为`True`。在这种情况下，同步代码将阻塞服务 API 事件循环，这可能会导致 API 不可用。 API 不可用的一个症状是由于运行状况检查失败而导致应用程序不断重新启动。<Warning>
启用 `BG_JOB_ISOLATED_LOOPS` 时，每个后台工作程序都在自己的线程中运行，并具有 **单独的 Postgres 连接池**。每个工作线程池大小为 `LANGGRAPH_POSTGRES_POOL_MAX_SIZE // N_JOBS_PER_WORKER`。例如，对于 `LANGGRAPH_POSTGRES_POOL_MAX_SIZE=20` 和 `N_JOBS_PER_WORKER=15`，每个工作线程仅获得一个只有 1 个连接的池。每个工作线程规模较小的池更容易出现连接失败，因为单个过时的连接代表了池的很大一部分。如果启用隔离循环，请确保 `LANGGRAPH_POSTGRES_POOL_MAX_SIZE` 足够大，以便为每个工作线程提供至少几个连接。
</Warning>

默认为`False`。

## `BG_JOB_MAX_RETRIES`

可重试故障（例如暂时性数据库错误、服务器关闭取消）后后台运行重试的最大次数。当运行因可重试错误而失败时，它会被放回队列中并从最后一个检查点步骤恢复。如果运行超过最大重试次数，则将其标记为失败。

默认为`3`。

## `BG_JOB_SHUTDOWN_GRACE_PERIOD_SECS`指定队列收到关闭信号后服务器将等待后台作业完成的时间（以秒为单位）。过了这段时间，服务器将强制终止。默认为 `180` 秒。最大值为`3600`秒。设置此项可确保作业在关闭期间有足够的时间干净地完成。添加到`langgraph-api==0.2.16`。

## `BG_JOB_TIMEOUT_SECS`

可以增加后台运行的超时时间。但是，云部署的基础设施对 API 请求强制执行 1 小时的超时限制。这意味着客户端和服务器之间的连接将在 1 小时后超时。这是不可配置的。

后台运行可以执行超过 1 小时，但如果运行时间超过 1 小时，客户端必须重新连接到服务器（例如通过`POST /threads/{thread_id}/runs/{run_id}/stream`加入流）以检索运行的输出。

默认为`86400`。

## `CORS_ALLOW_ORIGINS`

设置 `CORS_ALLOW_ORIGINS` 以指定允许的来源。
- 允许单一来源的示例：`CORS_ALLOW_ORIGINS=https://example.com`
- 允许多个来源的示例：`CORS_ALLOW_ORIGINS=https://example.com,https://app.example.com`

有关高级 CORS 配置，请参阅[how to add custom CORS configuration](/langsmith/cli#customizing-http-middleware-and-headers)。

默认为 `*`（所有来源）。

## 支持的 Datadog 环境变量 {#dd_api_key}在部署上设置这些环境变量或机密，以将代理服务器跟踪和日志发送到 Datadog。每个变量仅在设置`DD_API_KEY`时才生效，它将应用程序进程包装在Datadog的[⟦T33⟧](https://ddtrace.readthedocs.io/en/stable/installation_quickstart.html)跟踪器和日志收集代理中。

- **`DD_API_KEY`**：你的[Datadog API key](https://docs.datadoghq.com/account_management/api-app-keys/)。必需的。将任何跟踪或日志发送到 Datadog 都需要它。
- **`DD_LOGS_ENABLED`**：设置为 `true` 将代理服务器日志转发到 Datadog。省略它或将其设置为`false`以禁用日志转发。
- **`DD_LOGS_INJECTION`**：设置为 `true` 可将跟踪和跨度标识符添加到日志中，以便日志与跟踪相关联。
- **`DD_TRACE_ENABLED`**：控制Datadog跟踪收集。设置为 `true` 来收集跟踪信息，或设置为 `false` 来禁用它。
- **`DD_SITE`**：要发送数据的 Datadog 站点，例如 `datadoghq.com` 或 `datadoghq.eu`。默认为`datadoghq.com`。
- **`DD_ENV`**：应用于跟踪和日志的环境名称，例如`production`。
- **`DD_SERVICE`**：应用于跟踪和日志的服务名称。
- **`DD_TRACE_DEBUG`**：设置为 `true` 以在故障排除时在 `ddtrace` 跟踪器中启用调试日志记录。
- **`DD_LOG_LEVEL`**：故障排除时的Datadog Agent日志级别，例如`debug`。

有关完整的跟踪选项集，请参阅 [⟦T55⟧ environment variables](https://ddtrace.readthedocs.io/en/stable/configuration.html) 参考。<Note>
启用 `DD_API_KEY`（以及`ddtrace-run`）可能会覆盖或干扰您可能已在应用程序代码中检测的其他自动检测解决方案（例如 OpenTelemetry）。
</Note>

## `LANGGRAPH_POSTGRES_POOL_MAX_SIZE`

从 langgraph-api 版本 `0.2.12` 开始，可以使用 `LANGGRAPH_POSTGRES_POOL_MAX_SIZE` 环境变量控制 Postgres 连接池（每个副本）的最大大小。通过设置此变量，您可以确定服务器与 Postgres 数据库建立的同时连接数的上限。

例如，如果部署扩展到 10 个副本，并且 `LANGGRAPH_POSTGRES_POOL_MAX_SIZE` 配置为 `150`，则最多可以建立 `1500` 到 Postgres 的连接。这对于数据库资源有限（或更多可用）的部署或者出于性能或扩展原因需要调整连接行为的部署特别有用。

当[⟦T64⟧](#bg_job_isolated_loops)启用时，池不共享。相反，每个后台工作线程都会创建自己的池，最大大小为`LANGGRAPH_POSTGRES_POOL_MAX_SIZE / N_JOBS_PER_WORKER`。减小池大小时请记住这一点。适合共享池的值可能会导致隔离循环下的每个工作线程池非常小。

默认为 `150` 连接。

## `LS_CHECKPOINT_DELETE`用于延迟检查点删除的 JSON 值配置。启用后，线程删除和修剪操作会将检查点排入队列以进行后台删除，而不是同步删除，从而将 I/O 移出请求热路径。有`langgraph-api>=0.8.1`可供选择。

<Note>
仅支持默认的 PostgreSQL 检查点后端。延迟删除将成为未来版本中的默认设置。
</Note>

接受的字段：

- `enabled`（布尔值，默认`false`）：当`true`时，线程删除和修剪操作将检查点排入`checkpoint_delete_queue`并立即返回，后台工作人员清空队列。
- `enabledWorkerOnly`（布尔值，默认`false`）：仅运行后台排出工作程序，而不将新条目排队。在将 `enabled` 回滚到 `false` 后，使用它来完成队列的排空。
- `pollIntervalMs`（整数，默认`5000`）：工作线程轮询队列的频率，以毫秒为单位。
- `batchSize`（整数，默认`25`）：每个事务工作线程出队的检查点条目数。较小的值将 I/O 分散到更长的时间，但代价是更长的漏电延迟。
- `batchSleepMs`（整数，默认`500`）：当队列非空时，worker 在批次之间休眠的时间，以毫秒为单位。

示例：`LS_CHECKPOINT_DELETE='{"enabled":true,"batchSize":10,"pollIntervalMs":1000}'`。默认为禁用（同步检查点删除）。

## `LS_DEFAULT_CHECKPOINTER_BACKEND`

为未在 `langgraph.json` 中指定的代理服务器设置默认 [checkpointer backend](/langsmith/configure-checkpointer)。接受的值：`"default"` (PostgreSQL)、`"mongo"`、`"custom"`。

如果应用程序的 `langgraph.json` 包含 `checkpointer.backend` 值，则它优先于该变量。

当设置为 `"mongo"` 时，您还必须通过 [⟦T92⟧](#ls_mongodb_uri) 提供 MongoDB 连接 URI。

## `LANGSMITH_TRACING`

将 `LANGSMITH_TRACING` 设置为 `false` 以禁用对 LangSmith 的跟踪。

<Note>
对于基于运行时条件（例如每个客户端要求或数据敏感性）的选择性跟踪控制，请参阅[Conditional tracing](/langsmith/conditional-tracing)。
</Note>

默认为`true`。

## `LOG_COLOR`

这主要与通过 `langgraph dev` 命令使用开发服务器的上下文有关。将 `LOG_COLOR` 设置为 `true` 以在使用默认控制台渲染器时启用 ANSI 颜色的控制台输出。通过将此变量设置为 `false` 禁用颜色输出会生成单色日志。默认为`true`。

## `LOG_LEVEL`

配置[log level](https://docs.python.org/3/library/logging.html#logging-levels)。默认为`INFO`。

## `LOG_JSON`

将 `LOG_JSON` 设置为 `true`，以使用配置的 `JSONRenderer` 将所有日志消息呈现为 JSON 对象。这会产生结构化日志，日志管理系统可以轻松解析或摄取这些日志。默认为`false`。

## `N_JOBS_PER_WORKER`单个队列工作线程从代理服务器任务队列中并发执行的最大运行数。默认为`10`。

这限制了并发运行执行，而不是您的部署可以服务的 API 请求的数量。请求服务能力由 API 服务器处理，并独立于该值进行扩展。有关调整指南，请参阅[Configure Agent Server for scale](/langsmith/agent-server-scale)。

## `LS_APM_OTEL_ENABLED`

要为您的部署配置 OpenTelemetry APM 跟踪，请将 `LS_APM_OTEL_ENABLED` 设置为 `true`，并将 `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` 或 `OTEL_EXPORTER_OTLP_ENDPOINT` 设置为目标跟踪摄取端点。请注意，在 `0.7.17` 之后的服务器版本中，需要 `LS_APM_OTEL_ENABLED` 和其他两个导出端点之一来激活 OpenTelemetry APM 跟踪。

指定其他[⟦T119⟧ environment variables](https://opentelemetry.io/docs/collector/configuration/)来配置跟踪、日志记录和其他检测。

```shell
# If you set LS_APM_OTEL_ENABLED AND (OTEL_EXPORTER_OTLP_TRACES_ENDPOINT or OTEL_EXPORTER_OTLP_ENDPOINT),
# the server starts with OpenTelemetry instrumentation enabled.
LS_APM_OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=<target trace ingestion endpoint>
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.nr-data.net
OTEL_SERVICE_NAME=MY_LANGSMITH_DEPLOYMENT
OTEL_EXPORTER_OTLP_HEADERS=api-key=<YOUR_INGEST_LICENSE_KEY>
LANGSMITH_OTEL_ENABLED=true
# Common OTEL settings
OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT=4095
OTEL_EXPORTER_OTLP_COMPRESSION=gzip
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE=delta
OTEL_PYTHON_EXCLUDED_URLS=/metrics,/ok,/info
# Optional: OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
```

例如，要将 OpenTelemetry 跟踪提交到 [New Relic's US region](https://docs.newrelic.com/docs/opentelemetry/best-practices/opentelemetry-otlp/)，请设置以下内容：

```shell
LS_APM_OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://otlp.nr-data.net/v1/traces
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.nr-data.net
OTEL_EXPORTER_OTLP_HEADERS=api-key=<YOUR_INGEST_LICENSE_KEY>
```

<Note>
OTel APM 跟踪已在代理服务器版本`0.5.32` 中添加，目前处于 Alpha 阶段。
</Note>

## `LS_MONGODB_URI`

MongoDB 检查点后端的 MongoDB 连接 URI。

URI 必须指向副本集成员或`mongos` 路由器，并且必须在路径中包含数据库名称。

详情请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer)。

## `REDIS_KEY_PREFIX`<Info>
**适用于 API 服务器版本 0.1.9+**
API Server 版本 0.1.9 及更高版本支持此环境变量。
</Info>

指定 Redis 键的前缀。这允许多个 Agent Server 实例通过使用不同的键前缀共享同一个 Redis 实例。

默认为`''`。

## `REDIS_MAX_CONNECTIONS`

Redis 连接池（每个副本）的最大大小可以使用 `REDIS_MAX_CONNECTIONS` 环境变量进行控制。通过设置此变量，您可以确定服务器与 Redis 实例建立的同时连接数的上限。

例如，如果部署扩展到 10 个副本，并且 `REDIS_MAX_CONNECTIONS` 配置为 `150`，则最多可以建立 `1500` 与 Redis 的连接。

默认为 `2000`。

## `RESUMABLE_STREAM_TTL_SECONDS`

Redis 中可恢复流数据的生存时间（以秒为单位）。

创建运行并对输出进行流式传输时，可以将流配置为可恢复（例如`stream_resumable=True`）。如果流是可恢复的，则流的输出将临时存储在 Redis 中。该数据的 TTL 可以通过设置`RESUMABLE_STREAM_TTL_SECONDS`来配置。

有关如何实现可恢复流的更多详细信息，请参阅 [Python](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.RunsClient.stream) 和 [JS/TS](https://langchain-ai.github.io/langgraphjs/reference/classes/sdk_client.RunsClient.html#stream) SDK。

默认为 `120` 秒。<Note>
当存在大量具有大量或频繁流输出的并发运行时，为 `RESUMABLE_STREAM_TTL_SECONDS` 设置非常高的值可能会导致大量 Redis 内存使用。将此值设置为最小值以在网络中断期间启用恢复，并首选检查点以实现长期持久性和执行快照。
</Note>

## `AGENT_POSTGRES_IAM_AUTH_PROVIDER`

将 `AGENT_POSTGRES_IAM_AUTH_PROVIDER` 设置为 `aws`、`azure` 或 `gcp`，以将 PostgreSQL 连接 URI 中的密码替换为短期云身份令牌。需要`langgraph-api>=0.12.0`。

有关提供程序先决条件和连接 URI 要求，请参阅 [Configure IAM authentication for data stores](/langsmith/configure-iam-auth)。

## `AGENT_REDIS_IAM_AUTH_PROVIDER`

将 `AGENT_REDIS_IAM_AUTH_PROVIDER` 设置为 `aws`、`azure` 或 `gcp`，以使用短期云身份令牌对 Redis 连接进行身份验证。需要`langgraph-api>=0.12.0`。

有关提供程序先决条件和连接 URI 要求，请参阅 [Configure IAM authentication for data stores](/langsmith/configure-iam-auth)。

## `LANGGRAPH_SERVER_HOST`

设置 `LANGGRAPH_SERVER_HOST` 来控制代理服务器监听哪些地址族：

* **空字符串**：同时监听 IPv4 和 IPv6。这是从 `langgraph-api>=0.14.0` 开始的默认设置。
* **`0.0.0.0`**：仅在 IPv4 上侦听。
* **`::`**：仅在 IPv6 上侦听。

`langgraph-api` 0.14.0 之前的版本默认为`0.0.0.0`，仅侦听 IPv4。

## `LANGSMITH_API_KEY`要将跟踪发送到自托管 LangSmith 实例，请将 `LANGSMITH_API_KEY` 设置为从自托管实例创建的 API 密钥。

## `LANGSMITH_ENDPOINT`

要将跟踪发送到自托管 LangSmith 实例，请将 `LANGSMITH_ENDPOINT` 设置为自托管实例的主机名。

## `MOUNT_PREFIX`

设置 `MOUNT_PREFIX` 以在特定路径前缀下为代理服务器提供服务。这对于服务器位于需要特定路径前缀的反向代理或负载均衡器后面的部署非常有用。

例如，如果服务器要在`https://example.com/langgraph`下提供服务，请将`MOUNT_PREFIX`设置为`/langgraph`。

## `POSTGRES_URI_CUSTOM`

指定 `POSTGRES_URI_CUSTOM` 使用自定义 Postgres 实例。 `POSTGRES_URI_CUSTOM` 的值必须是有效的 [Postgres connection URI](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING-URIS)。

Postgres：

* 版本 15.8 或更高版本。
* 必须存在初始数据库，并且连接 URI 必须引用该数据库。

控制平面功能：* 如果指定`POSTGRES_URI_CUSTOM`，控制平面将不会为服务器提供数据库。
* 如果删除`POSTGRES_URI_CUSTOM`，控制平面将不会为服务器提供数据库，也不会删除外部管理的Postgres实例。
* 如果删除`POSTGRES_URI_CUSTOM`，修订版部署将不会成功。一旦指定了 `POSTGRES_URI_CUSTOM`，就必须始终为部署的生命周期进行设置。
* 如果删除部署，控制平面不会删除外部管理的 Postgres 实例。
* `POSTGRES_URI_CUSTOM`的值可以更新。例如，可以更新 URI 中的密码。

数据库连接：

* 自定义 Postgres 实例必须可由代理服务器访问。用户负责确保连接。

## `REDIS_CLUSTER`

<Warning>
此功能处于 Alpha 版本。
</Warning>

将 `REDIS_CLUSTER` 设置为 `True` 以启用 Redis 集群模式。启用后，系统将使用集群模式连接到Redis。这在连接到 Redis 集群部署时非常有用。

默认为`False`。

## `REDIS_URI_CUSTOM`

指定 `REDIS_URI_CUSTOM` 使用自定义 Redis 实例。 `REDIS_URI_CUSTOM` 的值必须是有效的 [Redis connection URI](https://redis-py.readthedocs.io/en/stable/connections.html#redis.Redis.from_url)。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/env-var-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>