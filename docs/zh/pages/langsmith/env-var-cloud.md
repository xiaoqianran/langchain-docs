<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Cloud Agent Server environment variables | https://docs.langchain.com/langsmith/env-var-cloud -->

# 云代理服务器环境变量

部署在云端时LangSmith代理服务器支持的环境变量。

部署在[Cloud](/langsmith/deploy-to-cloud-overview)上时，代理服务器支持以下环境变量。有关自托管部署特定的变量，请参阅[Self-hosted Agent Server environment variables](/langsmith/env-var-self-hosted)。

## `BG_JOB_ISOLATED_LOOPS`

将 `BG_JOB_ISOLATED_LOOPS` 设置为 `True` 以在与服务 API 事件循环分开的隔离事件循环中执行后台运行。

> [!警告]
>
> 启用此标志并不能消除根本问题。它将同步阻塞工作从服务 API 的事件循环中移出，以便运行状况检查不再失败，但阻塞代码继续在后台循环上运行，并且**将**继续导致生产中出现问题，例如吞吐量下降、尾部延迟峰值、工作人员饥饿或连接池耗尽（请参阅下面的池大小警告）以及负载下扩展不佳。
>> 要正确解决这些问题，请在整个代理中使用本机异步驱动程序和异步代码。这意味着像`httpx`或`aiohttp`这样的异步HTTP客户端（尽管我们建议缓存客户端以避免加载SSL上下文的CPU开销），像`asyncpg`或`psycopg[async]`这样的异步数据库驱动程序，以及异步模型SDK。对于不可避免的同步库，请将特定调用包装在 `asyncio.to_thread(...)` 或 `loop.run_in_executor(...)` 中，而不是为整个部署启用此标志。

如果图/节点的实现包含同步代码，则应将此环境变量设置为`True`。在这种情况下，同步代码将阻塞服务 API 事件循环，这可能会导致 API 不可用。 API 不可用的一个症状是由于运行状况检查失败而导致应用程序不断重新启动。> [!警告]
>
> 当启用 `BG_JOB_ISOLATED_LOOPS` 时，每个后台工作线程都在自己的线程中运行，并具有 **单独的 Postgres 连接池**。每个工作线程池大小为 `LANGGRAPH_POSTGRES_POOL_MAX_SIZE // N_JOBS_PER_WORKER`。例如，对于 `LANGGRAPH_POSTGRES_POOL_MAX_SIZE=20` 和 `N_JOBS_PER_WORKER=15`，每个工作线程仅获得一个只有 1 个连接的池。每个工作线程规模较小的池更容易出现连接失败，因为单个过时的连接代表了池的很大一部分。如果启用隔离循环，请确保 `LANGGRAPH_POSTGRES_POOL_MAX_SIZE` 足够大，以便为每个工作线程提供至少几个连接。

默认为`False`。

## `BG_JOB_MAX_RETRIES`

在可重试的故障（例如暂时性数据库错误、服务器关闭取消）后重试后台运行的最大次数。当运行因可重试错误而失败时，它会被放回队列中并从最后一个检查点步骤恢复。如果运行超过最大重试次数，则将其标记为失败。

默认为`3`。

## `BG_JOB_SHUTDOWN_GRACE_PERIOD_SECS`指定队列收到关闭信号后服务器将等待后台作业完成的时间（以秒为单位）。过了这段时间，服务器将强制终止。默认为 `180` 秒。最大值为`3600`秒。设置此项可确保作业在关闭期间有足够的时间干净地完成。添加到`langgraph-api==0.2.16`。

## `BG_JOB_TIMEOUT_SECS`

可以增加后台运行的超时时间。但是，云部署的基础架构对 API 请求强制执行 1 小时的超时限制。这意味着客户端和服务器之间的连接将在 1 小时后超时。这是不可配置的。

后台运行可以执行超过 1 小时，但如果运行时间超过 1 小时，客户端必须重新连接到服务器（例如通过`POST /threads/{thread_id}/runs/{run_id}/stream`加入流）以检索运行的输出。

默认为`86400`。

## `CORS_ALLOW_ORIGINS`

设置 `CORS_ALLOW_ORIGINS` 以指定允许的来源。

* 允许单一来源的示例：`CORS_ALLOW_ORIGINS=https://example.com`
* 允许多个来源的示例：`CORS_ALLOW_ORIGINS=https://example.com,https://app.example.com`

如需高级 CORS 配置，请参阅[how to add custom CORS configuration](/langsmith/cli#customizing-http-middleware-and-headers)。

默认为 `*`（所有来源）。

## `DEFAULT_A2A_ASSISTANT_ID`

当请求没有`assistant_id`查询参数时，将`DEFAULT_A2A_ASSISTANT_ID`设置为服务器从`/.well-known/agent-card.json`返回的[agent card](/langsmith/server-a2a#agent-card-discovery)助手的ID。如果未设置，则不带 `assistant_id` 查询参数的 `/.well-known/agent-card.json` 请求将返回 `400` 错误。 `/a2a/{assistant_id}`端点从路径中获取助手ID并忽略此变量。

## 支持的 Datadog 环境变量

在部署上设置这些环境变量或机密，以将代理服务器跟踪和日志发送到 Datadog。每个变量仅在设置`DD_API_KEY`时生效，它将应用程序进程包装在Datadog的[⟦T42⟧](https://ddtrace.readthedocs.io/en/stable/installation_quickstart.html)跟踪器和日志收集代理中。

* **`DD_API_KEY`**：您的[Datadog API key](https://docs.datadoghq.com/account_management/api-app-keys/)。必需的。将任何跟踪或日志发送到 Datadog 都需要它。
* **`DD_LOGS_ENABLED`**：设置为 `true` 将代理服务器日志转发到 Datadog。省略它或将其设置为`false`以禁用日志转发。
* **`DD_LOGS_INJECTION`**：设置为 `true` 可将跟踪和跨度标识符添加到日志中，以便日志与跟踪相关联。
* **`DD_TRACE_ENABLED`**：控制Datadog跟踪收集。设置为 `true` 来收集跟踪信息，或设置为 `false` 来禁用它。
* **`DD_SITE`**：要发送数据的Datadog站点，例如`datadoghq.com`或`datadoghq.eu`。默认为 `datadoghq.com`。
* **`DD_ENV`**：应用于跟踪和日志的环境名称，例如`production`。
* **`DD_SERVICE`**：应用于跟踪和日志的服务名称。* **`DD_TRACE_DEBUG`**：设置为 `true` 以在故障排除时在 `ddtrace` 跟踪器中启用调试日志记录。
* **`DD_LOG_LEVEL`**：故障排除时的Datadog Agent日志级别，例如`debug`。

有关完整的跟踪选项集，请参阅 [⟦T64⟧ environment variables](https://ddtrace.readthedocs.io/en/stable/configuration.html) 参考。

> [!注意]
>
> 启用 `DD_API_KEY`（以及`ddtrace-run`）可能会覆盖或干扰您可能已在应用程序代码中检测的其他自动检测解决方案（例如 OpenTelemetry）。

## `FF_OPTIMIZED_STREAMING`

控制 API 服务器如何从 Redis 读取流式运行输出。启用后，它们从 Redis Streams 读取它。禁用后，他们通过 Redis Pub/Sub 读取它。

> [!注意]
>
> `FF_OPTIMIZED_STREAMING` 需要代理服务器 v0.7.93 或更高版本。从 v0.19.0rc1 开始，存储每次运行的事件和 v0.19.0 候选版本中的 `true` 默认首舰。

从 Agent Server v0.19.0rc1 开始，服务器将每次运行的流事件存储在 Redis Streams 中，无论 `FF_OPTIMIZED_STREAMING` 的值是多少。客户端可以恢复任何运行的流，而不仅仅是使用`stream_resumable=True`创建的运行。 [⟦T72⟧](#resumable_stream_ttl_seconds) 设置Redis 保留事件的时间。要调整它们的 Redis 内存大小，请参阅 [Size Redis memory for streaming](/langsmith/agent-server-scale#size-redis-memory-for-streaming)。设置 `FF_OPTIMIZED_STREAMING=false` 以通过 Redis Pub/Sub 继续读取。一旦部署运行 v0.19.0rc1 或更高版本，请更改其自己的部署中的值。如果部署从早期版本升级并更改值，则打开的流可能会错过仍在早期版本上的副本中的实时事件，直到客户端重新连接。对于 Redis 集群，如果变量设置为 `true`，请在一次部署中将其删除，然后在下一次部署中将其设置为 `false`。在集群模式下，变量显式为 `true` 的服务器不会发送实时 Pub/Sub 事件，因此标记关闭的服务器上的读取器会错过其事件，直到重新连接为止。

在早期版本中，服务器仅在禁用该标志时存储可恢复运行的事件。在启用标志继续通过 Redis Pub/Sub 传输之前，不可恢复运行已开始。

接受布尔值 `true` 和 `false`。从 Agent Server v0.19.0rc1 开始默认为 `true`，在早期版本中默认为 `false`。

## `FF_PROFILE_IMPORTS`

将 `FF_PROFILE_IMPORTS` 设置为 `true` 以找出图表加载缓慢的原因。默认为`false`。添加到`langgraph-api==0.6.8`。代理服务器在启动时导入图形模块时运行图形代码，因此导入时发生的工作会延迟准备时间。示例包括网络调用、数据库或客户端设置、读取大文件以及大量依赖项导入。当图形导入时间超过 3 秒时，服务器会记录一条警告，建议设置此变量。

通过设置变量，服务器会分析从您的配置加载的每个 Python 模块的导入。这涵盖了您的图表、自定义应用程序、身份验证处理程序、存储、检查点和加密模块。如果导入中的任何函数至少需要 1 秒，服务器会记录一条 `slow_import_profile` 警告，其中列出最多 10 个最慢的函数。每个条目都会显示该函数、其累积时间以及在模块中调用该函数的位置。该报告采用以下格式，并附有说明性值：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Slow startup for './agent.py:graph' (12.3s)

    Slowest operations:
       10.84s  connect_to_database      clients/db.py:42
               ↳ from agent.py (module-level)
```

该报告识别出缓慢的操作，因此您可以将其移动到函数内或延迟初始化它，而不是在导入时运行它。

请记住以下几点：* 分析会增加开销，因此报告的时间比正常情况要高。解决问题后删除该变量。
* 在模块顶层进行的调用归因于`(module-level)`，没有行号。
* 每次耗时不到 1 秒的操作不会出现在报告中，即使其中许多操作加起来导致导入速度很慢。
* 导入分析仅适用于 Python 图表。尚不支持 JavaScript 图表。
* 仅分析导入时间。导入图表后的延迟（例如自定义应用程序生命周期内的延迟）不会出现。

## `LANGGRAPH_AES_KEY` 和 `LANGGRAPH_AES_JSON_KEYS`

将 `LANGGRAPH_AES_KEY` 设置为 16、24 或 32 字节密钥以加密静态检查点。将 `LANGGRAPH_AES_JSON_KEYS` 设置为以逗号分隔的 JSON 密钥列表，以便对它们出现在线程、助手、运行、cron 和存储数据中的任何位置进行加密。 `LANGGRAPH_AES_JSON_KEYS` 需要 `LANGGRAPH_AES_KEY`。

有关设置和密钥轮换，请参阅[Configure AES encryption at rest](/langsmith/aes-encryption)。

## `LANGGRAPH_API_URL`

将 `LANGGRAPH_API_URL` 设置为客户端用于访问部署的 URL。服务器将其用作：

* [A2A agent cards](/langsmith/server-a2a#agent-card-discovery) 中的基本 URL。
* OpenAPI 规范中的 `servers` 条目在 `/openapi.json` 上提供服务。
* 每次运行元数据中的 `langgraph_api_url` 键。如果未设置，服务器将根据传入请求构建代理卡 URL。当客户端通过不同的主机（例如反向代理）到达服务器时设置它。

## `LANGGRAPH_DEFAULT_RECURSION_LIMIT`

将 `LANGGRAPH_DEFAULT_RECURSION_LIMIT` 设置为运行的默认 [recursion limit](/oss/python/langgraph/graph-api#recursion-limit)：图形在引发错误之前执行的最大超级步数。传入运行配置的 `recursion_limit` 会覆盖它。

默认为`10011`。

## `LANGGRAPH_POSTGRES_POOL_MAX_SIZE`

从 langgraph-api 版本 `0.2.12` 开始，Postgres 连接池（每个副本）的最大大小可以使用 `LANGGRAPH_POSTGRES_POOL_MAX_SIZE` 环境变量进行控制。通过设置此变量，您可以确定服务器与 Postgres 数据库建立的同时连接数的上限。

例如，如果部署扩展到 10 个副本，并且 `LANGGRAPH_POSTGRES_POOL_MAX_SIZE` 配置为 `150`，则最多可以建立 `1500` 与 Postgres 的连接。这对于数据库资源有限（或更多可用）的部署或者出于性能或扩展原因需要调整连接行为的部署特别有用。当[⟦T109⟧](#bg_job_isolated_loops)启用时，池不共享。相反，每个后台工作线程都会创建自己的池，最大大小为`LANGGRAPH_POSTGRES_POOL_MAX_SIZE / N_JOBS_PER_WORKER`。减小池大小时请记住这一点。适合共享池的值可能会导致隔离循环下的每个工作线程池非常小。

默认为 `150` 连接。

## `LANGGRAPH_THREAD_HISTORY_MAX_STATE_BYTES`

单个 [thread history](/langsmith/agent-server-api/threads/get-thread-history) 响应的最大大小（以字节为单位）。每个历史记录条目都包含完整的线程状态，因此从大线程请求许多条目可能会使用大量服务器内存。

如果下一个状态将使响应超过此限制，服务器将返回迄今为止的状态，该状态可能小于`limit`。始终包含最新状态，即使它本身就大于限制。要阅读较旧的状态，请使用 `before` 进行翻页。

该限制适用于 JSON 编码的响应。一旦达到限制，服务器就会停止读取检查点，因此这也限制了历史请求使用的内存量。负值会阻止服务器启动。提供`langgraph-api>=0.17.0`。

默认为`0`，即没有限制。

## `LS_CHECKPOINT_DELETE`用于延迟检查点删除的 JSON 值配置。启用后，线程删除和修剪操作会将检查点排入队列以进行后台删除，而不是同步删除，从而将 I/O 移出请求热路径。适用于`langgraph-api>=0.8.1`。

> [!注意]
>
> 仅支持默认的 PostgreSQL 检查点后端。延迟删除将成为未来版本中的默认设置。

接受的字段：

* `enabled`（布尔值，默认`false`）：当`true`时，线程删除和剪枝操作将检查点排入`checkpoint_delete_queue`并立即返回，后台工作人员清空队列。
* `enabledWorkerOnly`（布尔值，默认`false`）：仅运行后台排出工作程序，而不将新条目排队。在将 `enabled` 回滚到 `false` 后，使用它来完成队列的排空。
* `pollIntervalMs`（整数，默认`5000`）：worker 轮询队列的频率，以毫秒为单位。
* `batchSize`（整数，默认`25`）：每个事务工作线程出队的检查点条目数。较小的值将 I/O 分散到更长的时间，但代价是更长的排出延迟。
* `batchSleepMs`（整数，默认`500`）：当队列非空时，worker 在批次之间休眠的时间，以毫秒为单位。

示例：`LS_CHECKPOINT_DELETE='{"enabled":true,"batchSize":10,"pollIntervalMs":1000}'`。默认为禁用（同步检查点删除）。

## `LS_DEFAULT_CHECKPOINTER_BACKEND`

为未在 `langgraph.json` 中指定的代理服务器设置默认 [checkpointer backend](/langsmith/configure-checkpointer)。接受的值：`"default"` (PostgreSQL)、`"mongo"`、`"custom"`。

如果应用程序的 `langgraph.json` 包含 `checkpointer.backend` 值，则它优先于该变量。

当设置为 `"mongo"` 时，您还必须通过 [⟦T142⟧](#ls_mongodb_uri) 提供 MongoDB 连接 URI。

## `LANGSMITH_TRACING`

将 `LANGSMITH_TRACING` 设置为 `false` 以禁用对 LangSmith 的跟踪。

> [!注意]
>
> 对于基于运行时条件（例如每个客户端要求或数据敏感性）的选择性跟踪控制，请参阅[Conditional tracing](/langsmith/conditional-tracing)。

默认为`true`。

## `LOG_COLOR`

这主要与通过 `langgraph dev` 命令使用开发服务器的上下文相关。将 `LOG_COLOR` 设置为 `true` 以在使用默认控制台渲染器时启用 ANSI 颜色的控制台输出。通过将此变量设置为 `false` 禁用颜色输出会生成单色日志。默认为`true`。

## `LOG_LEVEL`

配置[log level](https://docs.python.org/3/library/logging.html#logging-levels)。默认为`INFO`。

## `LOG_JSON`

将 `LOG_JSON` 设置为 `true`，以使用配置的 `JSONRenderer` 将所有日志消息呈现为 JSON 对象。这会产生结构化日志，日志管理系统可以轻松解析或摄取这些日志。默认为`false`。

## `N_JOBS_PER_WORKER`单个队列工作线程从代理服务器任务队列中并发执行的最大运行数。默认为`10`。

这限制了并发运行执行，而不是您的部署可以服务的 API 请求的数量。请求服务能力由 API 服务器处理，并独立于该值进行扩展。有关调整指南，请参阅[Configure Agent Server for scale](/langsmith/agent-server-scale)。

## `LS_APM_OTEL_ENABLED`

要为您的部署配置 OpenTelemetry APM 跟踪，请将 `LS_APM_OTEL_ENABLED` 设置为 `true`，并将 `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` 或 `OTEL_EXPORTER_OTLP_ENDPOINT` 设置为目标跟踪摄取端点。请注意，在 `0.7.17` 之后的服务器版本中，需要 `LS_APM_OTEL_ENABLED` 和其他两个导出端点之一来激活 OpenTelemetry APM 跟踪。

指定其他[⟦T169⟧ environment variables](https://opentelemetry.io/docs/collector/configuration/)来配置跟踪、日志记录和其他检测。

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LS_APM_OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://otlp.nr-data.net/v1/traces
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.nr-data.net
OTEL_EXPORTER_OTLP_HEADERS=api-key=<YOUR_INGEST_LICENSE_KEY>
```

> [!注意]
>
> OTel APM 跟踪已在代理服务器版本`0.5.32` 中添加，目前处于 Alpha 阶段。

## `LS_MONGODB_URI`

MongoDB 检查点后端的 MongoDB 连接 URI。如果未设置`LS_MONGODB_URI`，服务器将读取`MONGODB_URI`。

URI 必须指向副本集成员或`mongos` 路由器，并且必须在路径中包含数据库名称。

详情请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer)。

## `LSD_CACHE_PACKAGES_DISTRIBUTIONS`当`LSD_CACHE_PACKAGES_DISTRIBUTIONS`为`true`时，服务器每个进程缓存一次`importlib.metadata.packages_distributions()`的结果。有些包在导入时多次调用该函数，这会减慢图形加载速度，尤其是在启用 Datadog 跟踪 (`ddtrace`) 时。如果您的部署在运行时安装或删除包，请将其设置为 `false`。

默认为`true`。

## `REDIS_KEY_PREFIX`

> [!注意]
>
> **适用于 API 服务器版本 0.1.9+**
> API Server 0.1.9 及以上版本支持此环境变量。

指定 Redis 键的前缀。这允许多个 Agent Server 实例通过使用不同的键前缀共享同一个 Redis 实例。

默认为`''`。

## `REDIS_URI_CUSTOM`

> [!注意]
>
> **仅适用于混合和自托管**
> 自定义 Redis 实例仅适用于 [Hybrid](/langsmith/hybrid) 和 [Self-Hosted](/langsmith/self-hosted) 部署。

指定 `REDIS_URI_CUSTOM` 使用自定义 Redis 实例。 `REDIS_URI_CUSTOM` 的值必须是有效的 [Redis connection URI](https://redis.readthedocs.io/en/stable/connections.html#redis.Redis.from_url)。

## `REDIS_MAX_CONNECTIONS`Redis 连接池（每个副本）的最大大小可以使用 `REDIS_MAX_CONNECTIONS` 环境变量进行控制。它调整 Go 核心池和 Python 服务器池的大小。这些池并不保存副本打开到 Redis 的每个连接。例如，启用 [⟦T189⟧](#ff_optimized_streaming) 后，流读取将使用大小为 [⟦T190⟧](#redis_stream_read_max_connections) 的单独池。

对于 Go 核心，默认为 `500`；对于 Python 服务器，默认为 `2000`。

## `REDIS_STREAM_READ_MAX_CONNECTIONS`

`REDIS_STREAM_READ_MAX_CONNECTIONS` 设置每个副本用于读取流的 Redis 连接池的最大大小。仅当[⟦T195⟧](#ff_optimized_streaming)启用时才适用。每个打开的流在等待事件时都会从该池中获取一个连接。在代理服务器 v0.19.0rc1 及更高版本中可用。

该池与 [⟦T196⟧](#redis_max_connections) 是分开的。启用 `FF_OPTIMIZED_STREAMING` 后，每个副本可以在这些池之上打开最多 `REDIS_STREAM_READ_MAX_CONNECTIONS` Redis 连接。

如果副本的打开流多于池的连接数，则流将等待空闲连接，并且它们的事件会延迟到达。发生这种情况时提高该值，只要 Redis `maxclients` 限制有空间容纳来自每个副本的额外连接。

默认为`2000`。

## `RESUMABLE_STREAM_TTL_SECONDS`

Redis 中可恢复流数据的生存时间（以秒为单位）。创建运行并对输出进行流式传输时，可以将流配置为可恢复（例如`stream_resumable=True`）。如果流是可恢复的，则流的输出将临时存储在 Redis 中。该数据的 TTL 可以通过设置`RESUMABLE_STREAM_TTL_SECONDS`来配置。

从 Agent Server v0.19.0rc1 开始，服务器存储每次运行的流输出，无论是否可恢复。线程上的每个新事件都会修剪该线程早于 `RESUMABLE_STREAM_TTL_SECONDS` 的事件，并且其余事件在该线程的最新事件之后 `RESUMABLE_STREAM_TTL_SECONDS` 过期。

有关如何实现可恢复流的更多详细信息，请参阅 [Python](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.RunsClient.stream) 和 [JS/TS](https://reference.langchain.com/javascript/langchain-langgraph-sdk/client/RunsClient) SDK。

默认为 `120` 秒。

> [!注意]
>
> 当存在大量具有大量或频繁流输出的并发运行时，为 `RESUMABLE_STREAM_TTL_SECONDS` 设置非常高的值可能会导致大量 Redis 内存使用。将此值设置为最小值以在网络中断期间启用恢复，并首选检查点以实现长期持久性和执行快照。
> 要调整存储事件的 Redis 内存大小，请参阅 [Size Redis memory for streaming](/langsmith/agent-server-scale#size-redis-memory-for-streaming)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/env-var-cloud.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。