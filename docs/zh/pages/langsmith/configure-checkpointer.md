<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure checkpointer backend | https://docs.langchain.com/langsmith/configure-checkpointer -->

# 配置检查点后端

配置代理服务器以使用 PostgreSQL、MongoDB 或检查点存储的自定义实现。

[Agent Server](/langsmith/agent-server) 使用检查点后端保留图形状态。默认情况下，LangSmith 将检查点与其他服务器数据一起存储在 PostgreSQL 中。您可以切换到 MongoDB 或提供自定义实现。

<Note>
  无论检查点后端如何，LangSmith 始终需要 PostgreSQL 来实现线程、运行、助手、cron 和 [memory store](/oss/python/langgraph/stores)。检查点后端仅控制检查点数据的存储位置。
</Note>

## 可用的后端|后端|存储|配置|使用案例|
| ---------| ------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `default` | PostgreSQL |无（内置）|标准部署 |
| `mongo` | MongoDB | `langgraph.json` 或 `LS_DEFAULT_CHECKPOINTER_BACKEND` 环境变量 |与现有 MongoDB 基础设施的团队 |
| `custom` |用户提供| `langgraph.json` |自定义存储后端（请参阅[custom checkpointer](/langsmith/custom-checkpointer)）|

## 默认（PostgreSQL）

PostgreSQL 是默认的检查点后端。无需配置。要使用自定义 PostgreSQL 实例，请设置 [⟦T14⟧](/langsmith/env-var-self-hosted) 环境变量。

## 设置 MongoDB 检查点

<Info>
  需要代理服务器 v0.7.64 或更高版本。
</Info>

### 先决条件* MongoDB **副本集**（不支持独立 `mongod`）。这可以是自我管理的副本集、`mongos`路由器或托管服务（例如 MongoDB Atlas）。
* 路径中包含数据库名称的连接 URI（例如，`/langgraph`）。

### 选择后端

使用以下方法之一将后端设置为 `"mongo"`：

**在 `langgraph.json`** 中（应用程序级别 - 与您的应用程序代码捆绑在一起）：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./agent.py:graph"
  },
  "checkpointer": {
    "backend": "mongo",
    "ttl": {
      "strategy": "delete",
      "default_ttl": 43200,
      "sweep_interval_minutes": 10
    }
  }
}
```

**通过环境变量**（平台级 - 用于管理独立部署的操作员）：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LS_DEFAULT_CHECKPOINTER_BACKEND=mongo
```

该环境变量为未在 `langgraph.json` 中指定的代理服务器设置默认后端。如果 `langgraph.json` 包含 `backend` 值，则优先。

### 提供 MongoDB URI

在部署时设置 `LS_MONGODB_URI` 环境变量：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LS_MONGODB_URI="mongodb://user:password@host:27017/langgraph?replicaSet=rs0"
```

### 连接 URI 要求

URI 必须：

* 指向副本集成员或`mongos`路由器
* 路径中包含目标数据库名称

有效示例：

```
mongodb://user:password@host:27017/langgraph?replicaSet=rs0
mongodb://host1:27017,host2:27017,host3:27017/mydb?replicaSet=prod-rs
mongodb+srv://user:password@cluster.example.net/langgraph
```

### 按环境部署

<Tabs>
  <Tab title="Standalone (Kubernetes)">
    [langgraph-cloud Helm chart](https://github.com/langchain-ai/helm/blob/main/charts/langgraph-cloud/README.md) (v0.2.6+) 具有内置的 MongoDB 支持。在您的值文件中启用它：

    **捆绑的 MongoDB**（开发和测试）：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mongo:
      enabled: true
      resources:
        requests:
          cpu: 500m
          memory: 1Gi
      persistence:
        size: 8Gi
    ```

    该图表部署单节点 MongoDB 副本集并自动配置服务器以使用它。**外部 MongoDB**（生产）：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mongo:
      enabled: true
      external:
        enabled: true
        connectionUrl: "mongodb://user:password@mongo.example.net:27017/langgraph?replicaSet=rs0"
    ```

    或者引用现有的 Kubernetes 密钥：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mongo:
      enabled: true
      external:
        enabled: true
        existingSecretName: "my-mongo-secret"
    ```

    该秘密必须包含 `mongodb_connection_url` 密钥。
  </Tab>

  <Tab title="Standalone (Docker)">
    如果您的 `langgraph.json` 已将 `backend` 设置为 `"mongo"`，则只需提供 URI。否则，设置两个环境变量：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    docker run \
        --env-file .env \
        -p 8123:8000 \
        -e REDIS_URI="redis://redis:6379" \
        -e DATABASE_URI="postgres://postgres:postgres@postgres:5432/postgres" \
        -e LS_DEFAULT_CHECKPOINTER_BACKEND=mongo \
        -e LS_MONGODB_URI="mongodb://mongo:27017/langgraph?replicaSet=rs0" \
        -e LANGSMITH_API_KEY="..." \
        my-image
    ```

    有关 MongoDB 的完整 Docker Compose 示例，请参阅 [standalone server guide](/langsmith/deploy-standalone-server)。
  </Tab>

  <Tab title="Cloud">
    在 `langgraph.json` 中将 `backend` 设置为 `"mongo"`，然后将 `LS_MONGODB_URI` 添加为 LangSmith UI 部署设置中的环境变量。

    您的 MongoDB 实例必须可从云数据平面访问。像 [MongoDB Atlas](https://www.mongodb.com/atlas) 这样的托管服务非常适合此目的。

    PostgreSQL 仍然自动配置非检查点数据。
  </Tab>
</Tabs>

## 自定义检查点

要使用 PostgreSQL 或 MongoDB 以外的存储后端，请实现自定义 [BaseCheckpointSaver](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.base.BaseCheckpointSaver)。详情请参阅[Add custom checkpointer](/langsmith/custom-checkpointer)。

## 相关

* [Configure TTLs](/langsmith/configure-ttl) 用于检查点和商店物品过期
* LangGraph 中的[Persistence concepts](/oss/python/langgraph/persistence)
* [Data plane](/langsmith/data-plane)架构
* [Environment variables](/langsmith/env-var-cloud)参考

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/configure-checkpointer.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>