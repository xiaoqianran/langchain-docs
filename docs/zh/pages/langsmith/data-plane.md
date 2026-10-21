<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith data plane | https://docs.langchain.com/langsmith/data-plane -->

# LangSmith数据平面

*数据平面* 由您的 [Agent Servers](/langsmith/agent-server)（部署）、其支持基础设施以及持续轮询来自 [LangSmith control plane](/langsmith/control-plane) 的更新的侦听器应用程序组成。

## 服务器基础设施

除了[Agent Server](/langsmith/agent-server)本身之外，每个服务器的以下基础设施组件也包含在“数据平面”的广义定义中：

* **PostgreSQL**：用户、运行和内存数据的持久层。
* **Redis**：工作人员的通信和临时元数据。
* **秘密存储**：环境秘密的安全管理。
* **自动缩放器**：根据负载缩放服务器容器。

## 监听器应用程序

数据平面侦听器应用程序定期调用 [control plane APIs](/langsmith/control-plane#control-plane-api) 来：

* 确定是否应创建新的部署。
* 确定是否应更新现有部署（即新修订版）。
* 确定是否应删除现有部署。

换句话说，数据平面侦听器读取控制平面的最新状态（所需状态），并采取措施协调未完成的部署（当前状态）以匹配最新状态。

## PostgreSQLPostgreSQL 将服务器资源（线程、运行、助手、cron）和保存在[long-term memory store](/oss/python/langgraph/persistence#memory-store)中的项目存储起来。它也是[checkpoints](/oss/python/langgraph/persistence)（图执行状态）的默认后端。您可以选择将检查点存储在 MongoDB 中 - 请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer)。无论检查点后端如何，PostgreSQL 始终是必需的。

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

在 LangSmith 云上，[Dedicated deployments](/langsmith/cloud-platform-features#scaling) 自动缩放单独的 API 服务器和队列工作池。无服务器部署可在零到一个副本之间扩展。

在自托管数据平面上，自动缩放取决于安装的操作员版本和配置。当前算子使用CPU进行HPA缩放。启用 KEDA 后，单独的队列工作线程还可以根据需要更多副本的指标在挂起和运行的[runs](/langsmith/runs)上进行扩展。两条路径均不使用内存作为缩放触发器。

CPU 目标是 CPU 限制的 50%：`queue_cpu_limit` 对于队列工作线程，`cpu_limit` 对于 API 服务器。 CPU 请求不会影响目标。例如，`queue_cpu: 0.3` 和 `queue_cpu_limit: 1.8` 为队列工作人员提供了每个 pod 900m 的目标。 KEDA 积压目标是每个工作人员已配置作业的 75%，向下舍入至少为 1。

要降低 CPU 请求而不更改部署扩展时间，请在 `resource_spec` 中发送请求和限制。如果忽略限制，则默认为请求的 2 倍，因此降低请求也会降低扩展目标。参见[Resource spec](/langsmith/api-ref-control-plane#resource-spec)。缩小行为取决于自动缩放器和运算符版本。有关自托管配置的详细信息，请参阅[Configure Agent Server for scale](/langsmith/agent-server-scale)。

### MongoDB 检查点

> [!注意]
>
> 适用于 [Cloud](/langsmith/cloud)（具有外部管理的 MongoDB 实例）和 [Standalone](/langsmith/deploy-standalone-server) 部署。

您可以使用 MongoDB 作为检查点存储的替代后端。配置后，MongoDB 仅处理检查点数据 - 所有其他服务器资源仍然需要 PostgreSQL。

请参阅[Configure checkpointer backend](/langsmith/configure-checkpointer) 了解设置说明。

### LangSmith 追踪

代理服务器自动配置为将跟踪发送到LangSmith。有关每个部署选项的详细信息，请参阅下表。

|云|混合动力|自托管 |
| - | - | - |
|需要跟踪LangSmith SaaS。 |可选禁用跟踪或跟踪LangSmith SaaS。 |可选禁用跟踪，跟踪到LangSmith SaaS，或跟踪到自托管LangSmith。 |

### 遥测

代理服务器会自动配置为报告遥测元数据以用于计费目的。有关每个部署选项的详细信息，请参阅下表。|云|混合动力|自托管 |
| - | - | - |
|遥测数据发送至LangSmith SaaS。 |遥测数据发送至LangSmith SaaS。 |自我报告气隙许可证密钥的使用情况（审核）。遥测数据发送至 LangSmith SaaS 以获取 LangSmith 许可证密钥。 |

### 许可

代理服务器自动配置为执行许可证密钥验证。有关每个部署选项的详细信息，请参阅下表。

|云|混合动力|自托管 |
| - | - | - |
| LangSmith API 密钥已根据 LangSmith SaaS 进行验证。 | LangSmith API 密钥已根据 LangSmith SaaS 进行验证。 |气隙许可证密钥或针对LangSmith SaaS 进行验证的平台许可证密钥。 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/data-plane.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。