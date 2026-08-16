<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith data plane | https://docs.langchain.com/langsmith/data-plane -->

# LangSmith数据平面

_数据平面_ 由您的 [Agent Servers](/langsmith/agent-server)（部署）、其支持基础设施以及不断轮询来自 [LangSmith control plane](/langsmith/control-plane) 的更新的“侦听器”应用程序组成。

## 服务器基础设施

除了[Agent Server](/langsmith/agent-server)本身之外，每个服务器的以下基础设施组件也包含在“数据平面”的广泛定义中：

- **PostgreSQL**：用户、运行和内存数据的持久层。
- **Redis**：工作人员的通信和临时元数据。
- **秘密存储**：环境秘密的安全管理。
- **自动缩放器**：根据负载缩放服务器容器。

## “监听器”应用程序

数据平面“监听器”应用程序定期调用 [control plane APIs](/langsmith/control-plane#control-plane-api) 来：

* 确定是否应创建新的部署。
* 确定是否应更新现有部署（即新修订版）。
* 确定是否应删除现有部署。

换句话说，数据平面“侦听器”读取控制平面的最新状态（所需状态），并采取措施协调未完成的部署（当前状态）以匹配最新状态。

## PostgreSQLPostgreSQL 存储服务器资源（线程、运行、助手、cron）和保存在 [long-term memory store](/oss/python/langgraph/persistence#memory-store) 中的项目。它也是[checkpoints](/oss/python/langgraph/persistence)（图执行状态）的默认后端。您可以选择将检查点存储在 MongoDB 中 - 请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer)。无论检查点后端如何，PostgreSQL 始终是必需的。

## Redis

每个代理服务器中都使用 Redis 作为服务器和队列工作人员进行通信以及存储临时元数据的方式。 Redis 中不存储任何用户或运行数据。

### 通讯

代理服务器中的所有运行均由属于每个部署一部分的后台工作人员池执行。为了启用这些运行的某些功能（例如取消和输出流），我们需要一个用于服务器和处理特定运行的工作人员之间双向通信的通道。我们使用 Redis 来组织这种通信。1. Redis 列表用作在创建新运行时立即唤醒工作线程的机制。此列表中仅存储哨兵值，没有实际运行信息。然后工作程序从 PostgreSQL 检索运行信息。
2. Redis 字符串和 Redis PubSub 通道的组合用于服务器将运行取消请求传达给适当的工作线程。
3. 在处理运行时，工作线程使用 Redis PubSub 通道广播来自代理的流输出。服务器中任何打开的 `/stream` 请求都将订阅该通道，并在任何事件到达时将其转发到响应。 Redis 中任何时候都不会存储任何事件。

### 临时元数据

代理服务器中的运行可能会因特定故障而重试（当前仅适用于运行期间遇到的暂时性 PostgreSQL 错误）。为了限制重试次数（目前限制为每次运行 3 次尝试），我们在 Redis 字符串被拾取时记录尝试次数。除了其 ID 之外，它不包含特定于运行的信息，并在短暂延迟后过期。

## 数据平面特性本节介绍数据平面的各种功能。有关特定于平台的行为，请参阅 [Cloud platform features](/langsmith/cloud-platform-features) 或 [Deploy to self-hosted](/langsmith/deploy-to-self-hosted-overview)。

### 自动缩放

[Dedicated type](/langsmith/cloud-platform-features#deployment-types) 部署自动跨容器扩展。扩展基于 3 个指标：

1.CPU利用率
2. 内存利用率
3.待处理（进行中）数量[runs](/langsmith/runs)

对于 CPU 利用率，自动缩放器的目标是 75% 利用率。这意味着自动缩放器将增加或减少容器数量，以确保 CPU 利用率达到或接近 75%。对于内存利用率，自动缩放器的目标也是 75% 的利用率。

对于挂起运行的数量，自动缩放器的目标是 10 个挂起运行。例如，如果当前容器数量为 1，但挂起运行的数量为 20，则自动缩放程序会将部署扩展到 2 个容器（20 个挂起运行 / 2 个容器 = 每个容器 10 个挂起运行）。

每个指标都是独立计算的，自动缩放器将根据导致容器数量最多的指标来确定缩放操作。这些指标并不都适用于每种容器类型。 [Queue workers](/langsmith/agent-server#runtime-architecture) 根据待处理的运行计数进行扩展 - 当积压的工作量增加时，更多的工作人员会启动以耗尽它。 [API servers](/langsmith/agent-server#runtime-architecture) 可扩展 CPU 和内存，响应客户端请求量。这意味着运行提交的激增不会减慢读取操作（例如获取线程状态）。有关自托管配置的详细信息，请参阅[Configure Agent Server for scale](/langsmith/agent-server-scale)。

缩减规模行动会延迟 30 分钟，然后再采取任何行动。换句话说，如果自动缩放程序决定缩小部署规模，它将首先等待 30 分钟，然后再缩小规模。 30 分钟后，将重新计算指标，如果重新计算的指标导致容器数量少于当前数量，则部署将缩小。否则，部署仍会扩大。此“冷却”期可确保部署不会过于频繁地扩展和缩减。

### MongoDB 检查点

<Info>
适用于 [Cloud](/langsmith/cloud)（具有外部管理的 MongoDB 实例）和 [Standalone](/langsmith/deploy-standalone-server) 部署。
</Info>

您可以使用 MongoDB 作为检查点存储的替代后端。配置后，MongoDB 仅处理检查点数据 - 所有其他服务器资源仍然需要 PostgreSQL。请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer) 了解设置说明。

### LangSmith 追踪

代理服务器自动配置为将跟踪发送到LangSmith。有关每个部署选项的详细信息，请参阅下表。

|云|混合动力|自托管 |
|------------------------|------------------------------------|----------------------|
|需要<br />追踪到LangSmith SaaS。 |可选<br />禁用跟踪或跟踪到LangSmith SaaS。 |可选<br />禁用跟踪，跟踪到LangSmith SaaS，或跟踪到自托管LangSmith。 |

### 遥测

代理服务器会自动配置为报告遥测元数据以用于计费目的。有关每个部署选项的详细信息，请参阅下表。

|云|混合动力|自托管 |
|------------------------|------------------------------------|----------------------|
|遥测数据发送至LangSmith SaaS。 |遥测数据发送至LangSmith SaaS。 |自我报告气隙许可证密钥的使用情况（审核）。<br />将遥测发送至 LangSmith SaaS 以获取 LangSmith 许可证密钥。 |

### 许可

代理服务器自动配置为执行许可证密钥验证。有关每个部署选项的详细信息，请参阅下表。|云|混合动力|自托管 |
|------------------------|------------------------------------|----------------------|
| LangSmith API 密钥已根据 LangSmith SaaS 进行验证。 | LangSmith API 密钥已根据 LangSmith SaaS 进行验证。 |气隙许可证密钥或针对LangSmith SaaS 进行验证的平台许可证密钥。 |

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/data-plane.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>