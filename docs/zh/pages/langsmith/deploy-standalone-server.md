<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-host standalone servers | https://docs.langchain.com/langsmith/deploy-standalone-server -->

# 自托管独立服务器

使用 Docker、Docker Compose 或 Kubernetes 部署独立代理服务器，无需 LangSmith 控制平面。

本指南向您展示如何直接部署独立的[Agent Servers](/langsmith/agent-server)，而不需要[control plane](/langsmith/control-plane)。您可以独立部署服务器，但仍将 [observability](/langsmith/observability) 和 [evaluation](/langsmith/evaluation) 的跟踪发送到 LangSmith（[self-hosted](/langsmith/self-hosted) 或 [Cloud](/langsmith/cloud)）。独立服务器可用于生产，并为运行代理提供最轻量级的选项。

## 概述

您管理一个简化的数据平面（代理服务器和代理执行的运行时环境。），由代理服务器及其所需的支持服务（PostgreSQL、Redis 等）组成：

|组件|职责|它在哪里运行 |谁来管理|
| - | - | - | - |
| **控制平面** |不适用 |不适用 |不适用 |
| **数据平面** | <ul><li>代理服务器</li><li>Postgres、Redis等</li></ul> |您的基础设施|你|

此选项使您可以完全控制扩展、部署和 CI/CD 管道，同时仍然允许与 LangSmith 集成以进行跟踪和评估。> [!警告]
>
> 不要在无服务器环境中运行独立服务器。缩放到零可能会导致任务丢失，并且向上扩展将无法可靠地工作。

![Standalone server architecture](https://mintcdn.com/langchain-5e9cc07a/Mwtbhvs2R50foe4Y/langsmith/images/standalone-server-light.png?fit=max\&auto=format\&n=Mwtbhvs2R50foe4Y\&q=85\&s=db67e2add4cf039b1ce2324fa1c1f244)

### 工作流程

1. 使用 `langgraph-cli` 或 [Studio](/langsmith/studio) 在本地定义并测试您的图。
2. 将代理打包为 Docker 映像。
3. 将代理服务器部署到您选择的计算平台（Kubernetes、Docker、VM）。
4. （可选）配置 LangSmith API 密钥和端点，以便服务器将跟踪和评估报告回 LangSmith（自托管或 SaaS）。

### 支持的计算平台

* **Kubernetes**：使用 LangSmith Helm 图表在 Kubernetes 集群中运行代理服务器。这是生产级部署的推荐选项。
* **Docker**：在任何 Docker 支持的计算平台（本地开发机、VM、ECS 等）中运行。这最适合开发或小规模工作负载。> [!警告]
>
> 对于生产部署，请使用 Kubernetes 和维护的 LangSmith Helm 图表。这是LangChain定期测试的生产路径。 LangChain 不定期测试其他编排器。
>
> 非 Kubernetes 部署存在已知的缺陷，您必须自行实施和维护。随着 Helm 图表的发展，这些部署可能会进一步偏离测试的生产路径：
>
> * **独立队列自动扩展**：为突发性、写入密集型工作负载配置扩展策略和队列指标。
> * **优雅的运行耗尽**：配置关闭耗尽和足够的终止窗口，以便在部署和缩减事件期间可以完成运行中的运行。
> * **分离模式连接**：配置和连接单独的 API 和队列服务。当 `queue.enabled` 为 `true` 时，Helm 图表会处理此问题。
> * **参考扩展配置**：将 [Agent Server scaling](/langsmith/agent-server-scale) 设置（包括 `api.replicas`、`queue.replicas`、`numberOfJobsPerWorker` 和只读副本）转换为 Orchestrator 的任务定义和扩展策略。
> * **版本升级和支持**：维护任务定义并应用版本更新。 LangChain 测试并发布支持的 Helm 图表版本更新。

## 先决条件1. 使用[LangGraph CLI](/langsmith/cli)至[test your application locally](/langsmith/local-dev-testing)。
2. 使用[LangGraph CLI](/langsmith/cli)构建Docker镜像（即`langgraph build`）。要在没有公共互联网访问的网络上构建，请参阅[Set up a build machine on a restricted network](/langsmith/self-host-restricted-network-build)。
3. 数据平面部署需要以下环境变量。
   * `REDIS_URI`：Redis 实例的连接详细信息。 Redis 将用作发布-订阅代理，以实现后台运行的流式实时输出。 `REDIS_URI` 的值必须是有效的 [Redis connection URI](https://redis.readthedocs.io/en/stable/connections.html#redis.Redis.from_url)。

     > [!注意]
     >
     > **共享 Redis 实例**
     > 多个自托管部署可以共享同一个 Redis 实例。例如，对于`Deployment A`，`REDIS_URI`可以设置为`redis://<hostname_1>:<port>/1`，对于`Deployment B`，`REDIS_URI`可以设置为`redis://<hostname_1>:<port>/2`。
     >
     > `1` 和`2` 是同一实例内不同的数据库编号，但`<hostname_1>` 是共享的。 **相同的数据库编号不能用于单独的部署**。
   * `DATABASE_URI`：Postgres 连接详细信息。 Postgres 将用于存储助手、线程、运行、持久线程状态和长期内存，并使用“恰好一次”语义管理后台任务队列的状态。 `DATABASE_URI` 的值必须是有效的 [Postgres connection URI](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING-URIS)。> [!注意]
     >
     > **共享 Postgres 实例**
     > 多个自托管部署可以共享同一个 Postgres 实例。例如，对于`Deployment A`，`DATABASE_URI`可以设置为`postgres://<user>:<password>@/<database_name_1>?host=<hostname_1>`，对于`Deployment B`，`DATABASE_URI`可以设置为`postgres://<user>:<password>@/<database_name_2>?host=<hostname_1>`。
     >
     > `<database_name_1>` 和 `database_name_2` 是同一实例中的不同数据库，但 `<hostname_1>` 是共享的。 **同一数据库不能用于单独的部署**。

     > [!提示]
     >
     > 您可以选择将检查点数据存储在 MongoDB 而不是 PostgreSQL 中。所有其他服务器数据仍然需要 PostgreSQL。详情请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer)。
   * `LANGSMITH_API_KEY`：LangSmith API 密钥。
   * `LANGGRAPH_CLOUD_LICENSE_KEY`：LangSmith 许可证密钥。这将用于在服务器启动时进行一次身份验证。
   * `LANGSMITH_ENDPOINT`：要将跟踪发送到 [self-hosted LangSmith](/langsmith/self-hosted) 实例，请将 `LANGSMITH_ENDPOINT` 设置为自托管 LangSmith 实例的主机名。
4. 从您的网络出口到`https://beacon.langchain.com`。如果不在气隙模式下运行，则这是许可证验证和使用报告所必需的。更多详情请参阅[Egress documentation](/langsmith/self-host-egress)。> [!注意]
>
> 从 0.14.0 开始，代理服务器服务默认侦听 IPv4 和 IPv6。双栈集群无需额外配置。要侦听单个地址系列，请将 `LANGGRAPH_SERVER_HOST` 设置为 `0.0.0.0`（仅适用于 IPv4）或 `::`（仅适用于 IPv6）。参见[Self-hosted Agent Server environment variables](/langsmith/env-var-self-hosted)。

## 库伯内特斯

使用此[Helm chart](https://github.com/langchain-ai/helm/blob/main/charts/langgraph-cloud/README.md)将代理服务器部署到 Kubernetes 集群。这是生产独立服务器部署的推荐设置。

Helm 图表 (v0.2.6+) 支持使用捆绑实例（开发/测试）或外部部署（生产）进行 MongoDB 检查点。在您的值文件中设置 `mongo.enabled: true`。有关完整配置详细信息，请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer#deploy-by-environment)。

## 码头工人

> [!警告]
>
> 此 Docker 示例适用于本地开发和测试。对于生产，请使用 Kubernetes 部署。

运行以下`docker`命令：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docker run \
    --env-file .env \
    -p 8123:8000 \
    -e REDIS_URI="foo" \
    -e DATABASE_URI="bar" \
    -e LANGSMITH_API_KEY="baz" \
    my-image
```

> [!注意]
>
> * 您需要将 `my-image` 替换为您在先决条件步骤中构建的映像的名称（来自 `langgraph build`）
>
> 并且您应该为 `REDIS_URI`、`DATABASE_URI` 和 `LANGSMITH_API_KEY` 提供适当的值。
>
> * 如果您的应用程序需要额外的环境变量，您可以通过类似的方式传递它们。

## Docker 组合> [!警告]
>
> 此 Docker Compose 示例适用于本地开发和测试。对于生产，请使用 Kubernetes 部署。

使用以下 Docker Compose 文件：

```yml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
volumes:
    langgraph-data:
        driver: local
services:
    langgraph-redis:
        image: redis:6
        healthcheck:
            test: redis-cli ping
            interval: 5s
            timeout: 1s
            retries: 5
    langgraph-postgres:
        image: postgres:16
        ports:
            - "5432:5432"
        environment:
            POSTGRES_DB: postgres
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: postgres
        volumes:
            - langgraph-data:/var/lib/postgresql/data
        healthcheck:
            test: pg_isready -U postgres
            start_period: 10s
            timeout: 1s
            retries: 5
            interval: 5s
    langgraph-api:
        image: ${IMAGE_NAME}
        ports:
            - "8123:8000"
        depends_on:
            langgraph-redis:
                condition: service_healthy
            langgraph-postgres:
                condition: service_healthy
        env_file:
            - .env
        environment:
            REDIS_URI: redis://langgraph-redis:6379
            LANGSMITH_API_KEY: ${LANGSMITH_API_KEY}
            DATABASE_URI: postgres://postgres:postgres@langgraph-postgres:5432/postgres?sslmode=disable
```

将此文件放在同一文件夹中运行 `docker compose up`。

> [手风琴] 使用 MongoDB 检查点
>
> 要在 MongoDB 而不是 PostgreSQL 中存储检查点，请添加 MongoDB 服务并配置检查点后端。在 `langgraph.json` 中将后端设置为 `"mongo"` 或使用 `LS_DEFAULT_CHECKPOINTER_BACKEND` 环境变量。所有其他服务器数据仍然需要 PostgreSQL。
>
> ```yml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> volumes:
>     langgraph-data:
>         driver: local
>     langgraph-mongo-data:
>         driver: local
> services:
>     langgraph-redis:
>         image: redis:6
>         healthcheck:
>             test: redis-cli ping
>             interval: 5s
>             timeout: 1s
>             retries: 5
>     langgraph-postgres:
>         image: postgres:16
>         ports:
>             - "5432:5432"
>         environment:
>             POSTGRES_DB: postgres
>             POSTGRES_USER: postgres
>             POSTGRES_PASSWORD: postgres
>         volumes:
>             - langgraph-data:/var/lib/postgresql/data
>         healthcheck:
>             test: pg_isready -U postgres
>             start_period: 10s
>             timeout: 1s
>             retries: 5
>             interval: 5s
>     langgraph-mongo:
>         image: mongo:7
>         command: ["mongod", "--replSet", "rs0"]
>         ports:
>             - "27017:27017"
>         volumes:
>             - langgraph-mongo-data:/data/db
>         healthcheck:
>             test: mongosh --eval "try { rs.status().ok } catch(e) { rs.initiate({_id:'rs0',members:[{_id:0,host:'langgraph-mongo:27017'}]}).ok }" --quiet
>             interval: 5s
>             timeout: 10s
>             retries: 10
>             start_period: 10s
>     langgraph-api:
>         image: ${IMAGE_NAME}
>         ports:
>             - "8123:8000"
>         depends_on:
>             langgraph-redis:
>                 condition: service_healthy
>             langgraph-postgres:
>                 condition: service_healthy
>             langgraph-mongo:
>                 condition: service_healthy
>         env_file:
>             - .env
>         environment:
>             REDIS_URI: redis://langgraph-redis:6379
>             LANGSMITH_API_KEY: ${LANGSMITH_API_KEY}
>             DATABASE_URI: postgres://postgres:postgres@langgraph-postgres:5432/postgres?sslmode=disable
>             LS_DEFAULT_CHECKPOINTER_BACKEND: mongo
>             LS_MONGODB_URI: mongodb://langgraph-mongo:27017/langgraph?replicaSet=rs0
> ```
>
> 有关 MongoDB 配置选项的更多详细信息，请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer)。

这将在端口 `8123` 上启动代理服务器（如果需要，请更改 `langgraph-api` 中的端口映射）。测试应用程序是否健康：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl --request GET --url 0.0.0.0:8123/ok
```

假设一切运行正常，您应该看到如下响应：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{"ok":true}
```

## 使用 LangSmith API 密钥验证请求

默认情况下，独立代理服务器不对传入请求进行身份验证。您可以将其配置为每个请求都需要 LangSmith API 密钥。> [!注意]
>
> 如果 `langgraph.json` 在 `auth` 中定义了 [custom authentication](/langsmith/custom-auth) 处理程序，则该处理程序将验证请求而不是此配置。然后，服务器仅检查 Studio 请求的 LangSmith API 密钥，或者当 `auth.allow_langsmith_api_keys` 为 `true` 时检查没有 `Authorization` 标头的请求。有关更多信息，请参阅[Set up custom auth](/langsmith/set-up-custom-auth)。

使用[Helm chart](#kubernetes)，设置这些值：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  auth:
    enabled: true
    langSmithAuthEndpoint: "https://api.smith.langchain.com"
    langSmithTenantId: "<workspace-id>"
```

对于其他平台，在服务器上设置等效的环境变量：

* **`LANGGRAPH_AUTH_TYPE`**：`langsmith`。当 `auth.enabled` 为 `true` 时，Helm 图表会设置此值。
* **`LANGSMITH_AUTH_ENDPOINT`** (`auth.langSmithAuthEndpoint`)：用于验证您所在区域或实例的密钥的 LangSmith API URL。例如，`https://api.smith.langchain.com` 或 `https://eu.api.smith.langchain.com`。对于 [self-hosted LangSmith](/langsmith/self-hosted)，请使用实例的 API URL，以 `/api/v1` 结尾。
* **`LANGSMITH_TENANT_ID`** (`auth.langSmithTenantId`)：服务器接受其API密钥的[workspace](/langsmith/administration-overview#workspaces)的ID。

调用者在 `X-Api-Key` 标头中发送其 LangSmith API 密钥。对于每个请求，服务器都会要求 LangSmith 验证密钥，然后检查该密钥是否属于 `LANGSMITH_TENANT_ID` 中的工作空间：* **工作区的任何密钥都可以**：调用者的密钥不需要是服务器自己的`LANGSMITH_API_KEY`。接受同一工作区的个人访问令牌或服务密钥。
* **未检查密钥的角色**：服务器接受工作区的有效密钥，无论其 [workspace role](/langsmith/rbac#workspace-roles) 是什么，包括工作区查看器。服务器不会接收角色，因此无法限制调用者的行为：使用 LangSmith 密钥进行身份验证的调用者仅携带其 LangSmith 用户 ID 和 `authenticated` 权限。要控制每个调用者的访问，请将 LangSmith 密钥身份验证替换为颁发您自己的凭据的自定义身份验证。
* **其他工作区的密钥被拒绝**：服务器拒绝具有 `Invalid tenant ID` 的不同工作区的有效密钥。有权访问多个工作区的密钥将解析为其默认工作区。要将其与另一个工作区中的服务器一起使用，请在 `X-Tenant-Id` 标头中发送该工作区的 ID。
* **跟踪密钥被拒绝**：[tracing key](/langsmith/create-account-api-key#tracing-keys)只能发送跟踪，因此服务器用`Forbidden`拒绝它。
* **验证结果被缓存**：服务器将每个成功的验证缓存最多 60 秒，因此已撤销的密钥最多可以继续工作一分钟。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-standalone-server.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。