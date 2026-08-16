<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-host standalone servers | https://docs.langchain.com/langsmith/deploy-standalone-server -->

# 自托管独立服务器

本指南向您展示如何直接部署独立的[Agent Servers](/langsmith/agent-server)，而不需要[control plane](/langsmith/control-plane)。您可以独立部署服务器，但仍将 [observability](/langsmith/observability) 和 [evaluation](/langsmith/evaluation) 的跟踪发送到 LangSmith（[self-hosted](/langsmith/self-hosted) 或 [Cloud](/langsmith/cloud)）。独立服务器可用于生产，并为运行代理提供最轻量级的选项。

## 概述

您管理一个简化的<Tooltip tip="The runtime environment where your Agent Servers and agents execute.">数据平面</Tooltip>，由代理服务器及其所需的支持服务（PostgreSQL、Redis 等）组成：

|组件|职责|它在哪里运行 |谁来管理|
|------------|--------------------|------------------------|----------------|
| **控制平面** |不适用 |不适用 |不适用 |
| **数据平面** | <ul><li>代理服务器</li><li>Postgres、Redis等</li></ul> |您的基础设施|你|

此选项使您可以完全控制扩展、部署和 CI/CD 管道，同时仍然允许与 LangSmith 集成以进行跟踪和评估。

<Warning>
不要在无服务器环境中运行独立服务器。缩放到零可能会导致任务丢失，并且向上扩展将无法可靠地工作。
</Warning>

<img
    className="block dark:hidden"
    src="/langsmith/images/standalone-server-light.png"
    alt="Standalone server architecture"
/>

<img
    className="hidden dark:block"
    src="/langsmith/images/standalone-server-dark.png"
    alt="Standalone server architecture"
/>

### 工作流程1. 使用 `langgraph-cli` 或 [Studio](/langsmith/studio) 在本地定义并测试您的图。
2. 将代理打包为 Docker 映像。
3. 将代理服务器部署到您选择的计算平台（Kubernetes、Docker、VM）。
4. （可选）配置 LangSmith API 密钥和端点，以便服务器将跟踪和评估报告回 LangSmith（自托管或 SaaS）。

### 支持的计算平台

- **Kubernetes**：使用 LangSmith Helm 图表在 Kubernetes 集群中运行代理服务器。这是生产级部署的推荐选项。
- **Docker**：在任何 Docker 支持的计算平台（本地开发机器、VM、ECS 等）中运行。这最适合开发或小规模工作负载。

<Warning>
对于生产部署，请使用 Kubernetes 和维护的 LangSmith Helm 图表。这是LangChain定期测试的生产路径。 LangChain 不定期测试其他编排器。

非 Kubernetes 部署存在已知的缺陷，您必须自行实现和维护。随着 Helm 图表的发展，这些部署可能会进一步偏离测试的生产路径：- **独立队列自动扩展**：为突发性、写入密集型工作负载配置扩展策略和队列指标。
- **优雅的运行耗尽**：配置关闭耗尽和足够的终止窗口，以便在部署和缩减事件期间完成运行中的运行。
- **分离模式连接**：配置和连接单独的 API 和队列服务。当 `queue.enabled` 为 `true` 时，Helm 图表会处理此问题。
- **参考扩展配置**：将 [Agent Server scaling](/langsmith/agent-server-scale) 设置（包括 `api.replicas`、`queue.replicas`、`numberOfJobsPerWorker` 和只读副本）转换为 Orchestrator 的任务定义和扩展策略。
- **版本升级和支持**：维护任务定义并应用版本更新。 LangChain 测试并发布支持的 Helm 图表版本更新。
</Warning>

## 先决条件1. 使用[LangGraph CLI](/langsmith/cli)至[test your application locally](/langsmith/local-dev-testing)。
2. 使用[LangGraph CLI](/langsmith/cli)构建Docker镜像（即`langgraph build`）。
3. 数据平面部署需要以下环境变量。
  1. `REDIS_URI`：Redis 实例的连接详细信息。 Redis 将用作发布-订阅代理，以实现后台运行的流式实时输出。 `REDIS_URI` 的值必须是有效的 [Redis connection URI](https://redis-py.readthedocs.io/en/stable/connections.html#redis.Redis.from_url)。
        <Note>
        **共享Redis实例**
        多个自托管部署可以共享同一个 Redis 实例。例如，对于`Deployment A`，`REDIS_URI`可以设置为`redis://<hostname_1>:<port>/1`，对于`Deployment B`，`REDIS_URI`可以设置为`redis://<hostname_1>:<port>/2`。`1` 和`2` 是同一实例内的不同数据库编号，但`<hostname_1>` 是共享的。 **相同的数据库编号不能用于单独的部署**。
        </Note>
  2. `DATABASE_URI`：Postgres 连接详细信息。 Postgres 将用于存储助手、线程、运行、持久线程状态和长期内存，并使用“恰好一次”语义管理后台任务队列的状态。 `DATABASE_URI` 的值必须是有效的 [Postgres connection URI](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING-URIS)。
        <Note>
        **共享 Postgres 实例**
        多个自托管部署可以共享同一个 Postgres 实例。例如，对于`Deployment A`，`DATABASE_URI`可以设置为`postgres://<user>:<password>@/<database_name_1>?host=<hostname_1>`，对于`Deployment B`，`DATABASE_URI`可以设置为`postgres://<user>:<password>@/<database_name_2>?host=<hostname_1>`。`<database_name_1>`和`database_name_2`是同一实例中的不同数据库，但`<hostname_1>`是共享的。 **同一数据库不能用于单独的部署**。
        </Note>
        <Tip>
        您可以选择将检查点数据存储在 MongoDB 而不是 PostgreSQL 中。所有其他服务器数据仍然需要 PostgreSQL。详情请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer)。
        </Tip>
  3. `LANGSMITH_API_KEY`：LangSmith API 密钥。
  4. `LANGGRAPH_CLOUD_LICENSE_KEY`：LangSmith 许可证密钥。这将用于在服务器启动时进行一次身份验证。
  5. `LANGSMITH_ENDPOINT`：要将跟踪发送到 [self-hosted LangSmith](/langsmith/self-hosted) 实例，请将 `LANGSMITH_ENDPOINT` 设置为自托管 LangSmith 实例的主机名。不要在 URL 中添加尾部斜杠，因为这可能会导致身份验证错误。
4. 从您的网络出口到`https://beacon.langchain.com`。如果不在气隙模式下运行，则这是许可证验证和使用报告所必需的。更多详情请参阅[Egress documentation](/langsmith/self-host-egress)。

<a id="helm"></a>
## 库伯内特斯

使用此[Helm chart](https://github.com/langchain-ai/helm/blob/main/charts/langgraph-cloud/README.md)将代理服务器部署到 Kubernetes 集群。这是生产独立服务器部署的推荐设置。Helm 图表 (v0.2.6+) 支持使用捆绑实例（开发/测试）或外部部署（生产）进行 MongoDB 检查点。在您的值文件中设置 `mongo.enabled: true`。有关完整配置详细信息，请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer#deploy-by-environment)。

## 码头工人

<Warning>
此 Docker 示例旨在用于本地开发和测试。对于生产，请使用 Kubernetes 部署。
</Warning>

运行以下`docker`命令：

```shell
docker run \
    --env-file .env \
    -p 8123:8000 \
    -e REDIS_URI="foo" \
    -e DATABASE_URI="bar" \
    -e LANGSMITH_API_KEY="baz" \
    my-image
```

<Note>
* 您需要将 `my-image` 替换为您在先决条件步骤中构建的映像的名称（来自 `langgraph build`）

并且您应该为 `REDIS_URI`、`DATABASE_URI` 和 `LANGSMITH_API_KEY` 提供适当的值。

* 如果您的应用程序需要额外的环境变量，您可以以类似的方式传递它们。
</Note>

## Docker 组合

<Warning>
此 Docker Compose 示例旨在用于本地开发和测试。对于生产，请使用 Kubernetes 部署。
</Warning>

使用以下 Docker Compose 文件：

```yml
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

<Accordion title="With MongoDB checkpointing">
要在 MongoDB 而不是 PostgreSQL 中存储检查点，请添加 MongoDB 服务并配置检查点后端。将 `langgraph.json` 中的后端设置为 `"mongo"` 或使用 `LS_DEFAULT_CHECKPOINTER_BACKEND` 环境变量。所有其他服务器数据仍然需要 PostgreSQL。

```yml
volumes:
    langgraph-data:
        driver: local
    langgraph-mongo-data:
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
    langgraph-mongo:
        image: mongo:7
        command: ["mongod", "--replSet", "rs0"]
        ports:
            - "27017:27017"
        volumes:
            - langgraph-mongo-data:/data/db
        healthcheck:
            test: mongosh --eval "try { rs.status().ok } catch(e) { rs.initiate({_id:'rs0',members:[{_id:0,host:'langgraph-mongo:27017'}]}).ok }" --quiet
            interval: 5s
            timeout: 10s
            retries: 10
            start_period: 10s
    langgraph-api:
        image: ${IMAGE_NAME}
        ports:
            - "8123:8000"
        depends_on:
            langgraph-redis:
                condition: service_healthy
            langgraph-postgres:
                condition: service_healthy
            langgraph-mongo:
                condition: service_healthy
        env_file:
            - .env
        environment:
            REDIS_URI: redis://langgraph-redis:6379
            LANGSMITH_API_KEY: ${LANGSMITH_API_KEY}
            DATABASE_URI: postgres://postgres:postgres@langgraph-postgres:5432/postgres?sslmode=disable
            LS_DEFAULT_CHECKPOINTER_BACKEND: mongo
            LS_MONGODB_URI: mongodb://langgraph-mongo:27017/langgraph?replicaSet=rs0
```有关 MongoDB 配置选项的更多详细信息，请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer)。
</Accordion>

这将在端口 `8123` 上启动代理服务器（如果需要，请更改 `langgraph-api` 中的端口映射）。测试应用程序是否健康：

```shell
curl --request GET --url 0.0.0.0:8123/ok
```

假设一切运行正常，您应该看到如下响应：

```shell
{"ok":true}
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-standalone-server.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>