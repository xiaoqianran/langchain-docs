<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Scalability & resilience | https://docs.langchain.com/langsmith/scalability-and-resilience -->

# 可扩展性和弹性

LangSmith 旨在随着您的工作负载水平扩展。该服务的每个实例都是无状态的，并且在内存中不保留任何资源。该服务旨在妥善处理添加或删除的新实例，包括硬关闭情况。

## 服务器可扩展性

当您向服务添加更多实例时，只要在它们前面放置适当的负载平衡器机制，它们就会分担 HTTP 负载。在大多数部署方式中，我们会自动为服务配置负载均衡器。在“无控制平面的自托管”模式中，您有责任添加负载均衡器。由于实例是无状态的，任何负载平衡策略都可以工作，因此不需要或不建议使用会话粘性。服务器的任何实例都可以与任何队列实例通信（通过 Redis PubSub），这意味着取消或流式传输正在进行的运行的请求可以由任何任意实例处理。

## 队列可扩展性当您向服务添加更多队列工作线程时，它们将线性增加运行吞吐量，因为每个队列工作线程都配置为执行一定数量的并发运行（`N_JOBS_PER_WORKER`，默认为 10）。该值控制并发运行执行，而不是部署可以服务的 API 请求数量。每次运行的每次尝试都将由单个实例处理，并通过 Postgres 的 MVCC 模型强制执行一次语义（有关崩溃弹性的详细信息，请参阅下面的部分）。由于暂时性数据库错误而失败的尝试最多重试 3 次。我们不使用长期事务或锁，这使我们能够更有效地利用 Postgres 资源。

## 韧性

当队列实例处理运行时，该队列工作线程将在 Redis 中记录定期心跳时间戳。

当收到正常关闭请求 (SIGINT) 时，实例进入关闭模式，该模式

* 停止接受新的HTTP请求
* 为任何正在进行的运行提供有限的秒数来完成（如果未完成，它将被放回队列中）
* 阻止实例从队列中获取更多运行如果由于服务器崩溃或基础设施故障而发生硬关闭，任何正在进行的运行都将被内部清理任务拾取，该任务会查找已突破心跳窗口的正在进行的运行。清理器每 2 分钟运行一次，并将运行放回到队列中，以供另一个实例来拾取它们。

## Postgres 弹性

对于 LangSmith 管理 Postgres 数据库的部署模式，有定期备份和连续复制的备用副本以实现自动故障转移。此 Postgres 配置仅在 [Cloud deployment option](/langsmith/cloud) 中适用于 [Dedicated deployment type](/langsmith/cloud-platform-features#deployment-types)。

所有与 Postgres 的通信都会针对可重试的错误实现重试。如果 Postgres 暂时不可用，例如在数据库重新启动期间，大多数/所有流量应继续成功。 Postgres 的长期故障将导致代理服务器不可用。

## Redis 弹性

所有需要持久存储的数据都存储在 Postgres 中，而不是 Redis 中。 Redis 仅用于临时元数据以及实例之间的通信。因此我们对 Redis 没有持久性要求。所有与 Redis 的通信都会针对可重试的错误实现重试。如果 Redis 暂时不可用（例如在数据库重新启动期间），则大多数/所有流量应继续成功。 Redis 长时间故障将导致 Agent Server 不可用。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/scalability-and-resilience.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>