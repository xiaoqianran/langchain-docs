<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to add TTLs to your application | https://docs.langchain.com/langsmith/configure-ttl -->

# 如何将 TTL 添加到您的应用程序中

<Tip>
  **先决条件**
  本指南假设您熟悉 [LangSmith](/langsmith/observability)、[Persistence](/oss/python/langgraph/persistence) 和 [Cross-thread persistence](/oss/python/langgraph/stores) 概念。
</Tip>

LangSmith 保留了[checkpoints](/oss/python/langgraph/checkpointers#checkpoints)（线程状态）和[cross-thread memories](/oss/python/langgraph/stores)（存储项）。您可以在[⟦T4⟧](/langsmith/application-structure#configuration-file)中配置生存时间（TTL）策略来自动管理该数据的生命周期，防止无限期累积。

## 配置线程和检查点TTL

检查点捕获对话线程的状态。设置 TTL 会自动删除或修剪过期数据。

将 `checkpointer.ttl` 配置添加到您的 `langgraph.json` 文件中：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./agent.py:graph"
  },
  "checkpointer": {
    "ttl": {
      "strategy": "delete",
      "sweep_interval_minutes": 60,
      "default_ttl": 43200
    }
  }
}
```* `strategy`：指定到期时采取的操作。默认为`"delete"`。
  * `"delete"`：当 TTL 过期时，删除整个线程，包括所有关联的运行和检查点数据。
  * `"keep_latest"`：保留线程和最新检查点，但删除后续运行不需要的旧检查点数据。
* `sweep_interval_minutes`：定义系统检查过期检查点的频率（以分钟为单位）。默认为 5 分钟。
* `default_ttl`：设置默认 TTL 窗口（以分钟为单位）（例如，43200 分钟 = 30 天）。 `delete` 窗口在应用 TTL 时启动，并且不会随活动刷新。当运行完成或线程状态更新时，`keep_latest`窗口会刷新。如果省略，线程默认不会过期。
* `sweep_limit`: (*Agent server v0.8+*) 设置sweeper 在一次迭代中处理的线程数。默认为 `10000`（代理服务器 v0.12+）或 `1000`（代理服务器 v0.8-0.11）。

<Note>
  全局 TTL 配置适用于新线程。 `delete` 策略不会追溯应用于现有线程。 `keep_latest`策略适用于运行完成或状态更新后的现有线程；不活动的现有线程保持不变。
</Note>

## 配置商店商品 TTL存储项允许跨线程数据持久化。为存储项配置 TTL 有助于通过删除陈旧数据来管理内存。

将 `store.ttl` 配置添加到您的 `langgraph.json` 文件中：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./agent.py:graph"
  },
  "store": {
    "ttl": {
      "refresh_on_read": true,
      "sweep_interval_minutes": 120,
      "default_ttl": 10080
    }
  }
}
```

* `refresh_on_read`：（可选，默认`true`）如果`true`，通过`get`或`search`访问项目会重置其过期计时器。如果`false`，则TTL仅在`put`刷新。
* `sweep_interval_minutes`：（可选，默认`5`）定义系统检查过期项目的频率（以分钟为单位）。
* `default_ttl`：（可选）设置商店商品的默认生命周期（以分钟为单位）（例如，10080 分钟 = 7 天）。仅适用于部署此配置后创建的项目；现有项目不会改变。如果您需要清除较旧的项目，请手动删除它们。如果省略，则默认情况下项目不会过期。

## 组合 TTL 配置

您可以为两个检查点配置 TTL，并将项目存储在同一 `langgraph.json` 文件中，以便为每种数据类型设置不同的策略。这是一个例子：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./agent.py:graph"
  },
  "checkpointer": {
    "ttl": {
      "strategy": "delete",
      "sweep_interval_minutes": 60,
      "default_ttl": 43200
    }
  },
  "store": {
    "ttl": {
      "refresh_on_read": true,
      "sweep_interval_minutes": 120,
      "default_ttl": 10080
    }
  }
}
```

## 配置每个线程的 TTL

您可以申请[TTL configurations per-thread](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.create)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
thread = await client.threads.create(
    ttl={
        "strategy": "delete",
        "ttl": 43200  # 30 days in minutes
    }
)
```

<Note>
  线程级 TTL 会覆盖该线程的默认 TTL 并使用上述策略行为。
</Note>

## 运行时覆盖对于商店物品，将 `ttl` 传递给 `put` 以覆盖默认寿命。将`refresh_ttl`传递给`get`或`search`来控制读取刷新是否过期。

## 部署流程

在`langgraph.json`中配置 TTL 后，部署或重新启动 LangGraph 应用程序以使更改生效。使用 [⟦T39⟧](/langsmith/local-dev-testing#langgraph-dev) 进行本地开发，或使用 [⟦T40⟧](/langsmith/local-dev-testing#langgraph-up) 进行 Docker 部署。

有关其他可配置选项的详细信息，请参阅[LangGraph CLI reference page](/langsmith/cli#configuration-file)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/configure-ttl.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>