<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Enable SmithDB on self-hosted LangSmith | https://docs.langchain.com/langsmith/self-host-smithdb -->

# 在自托管 LangSmith 上启用 SmithDB

在自托管 LangSmith Kubernetes 安装上与 ClickHouse 一起运行 SmithDB。

<Note>
  SmithDB 是自托管 LangSmith 的可选数据存储。 ClickHouse 在 LangSmith 0.16 上是必需的，并且在 0.17 上保持默认值。不要在 0.17 以下的任何版本上禁用 ClickHouse。最低 LangSmith 版本取决于您的云。参见[Cloud support](#cloud-support)。
</Note>

SmithDB 是为代理跟踪数据构建的列式数据存储：深度嵌套的跨度、多模式内容以及保持打开状态数小时的跨度。它通过每个 Pod 磁盘缓存将持久数据保存在对象存储中，并与现有 ClickHouse 数据存储一起提供 LangSmith 跟踪摄取和查询。

一些 LangSmith 功能，例如轨迹视图、轨迹评估器和过滤器查询语法，需要 SmithDB。参见[SmithDB feature availability](/langsmith/self-host-smithdb-features)。

<CardGroup>
  <Card title="Feature availability" icon="list-check" href="/langsmith/self-host-smithdb-features">
    查看哪些功能需要 SmithDB 以及哪些功能在 ClickHouse 上继续运行。
  </Card>

  <Card title="Install SmithDB" icon="download" href="/langsmith/self-host-smithdb-install">
    部署基础设施、部署 SmithDB 服务、启用双重摄取并在验证后切换查询。
  </Card>

  <Card title="Prepare supporting infrastructure" icon="server" href="/langsmith/self-host-smithdb-infrastructure">
    提供专用的PostgreSQL元存储、对象存储和缓存存储。
  </Card><Card title="Configure for scale" icon="chart-bar" href="/langsmith/self-host-smithdb-scale">
    选择经过测试的资源层并调整 SmithDB 工作负载的大小。
  </Card>

  <Card title="Configure observability" icon="activity" href="/langsmith/self-host-smithdb-observability">
    抓取 SmithDB 指标并将日志和跟踪导出到您的堆栈。
  </Card>

  <Card title="Migrate historical data" icon="transfer" href="/langsmith/self-host-smithdb-migrate">
    在查询切换之前将 ClickHouse 历史记录回填到 SmithDB 中。
  </Card>

  <Card title="Metrics reference" icon="chart-line" href="/langsmith/self-host-smithdb-metrics">
    每个 SmithDB 组件需要关注的指标以及如何读取它们。
  </Card>

  <Card title="Troubleshoot SmithDB" icon="tool" href="/langsmith/self-host-smithdb-troubleshooting">
    收集上下文、禁用 SmithDB 或安全地重置部署。
  </Card>
</CardGroup>

## 云支持

您可以在任何受支持的 LangSmith Kubernetes 安装上启用 SmithDB，无论它是全新的还是已经提供流量的。 [Self-host LangSmith on Kubernetes](/langsmith/kubernetes)覆盖基础安装；上面的指南涵盖了 SmithDB 在其之上添加的所有内容。

这些指南中的示例涵盖 AWS、GCP 和 Azure 上的托管 Kubernetes。它们不涵盖自我管理的集群。

|云|最低版本 |
| - | - |
| AWS（EKS）| LangSmith 0.16，Helm 图表 `0.16.14` 或更高版本 |
| GCP (GKE) | LangSmith 0.16，Helm 图表 `0.16.14` 或更高版本 |
|天蓝色 (AKS) | LangSmith 0.17 |

＃＃ 成分启用 SmithDB 会将以下工作负载添加到您的集群中。三个服务将跟踪数据缓存在磁盘、网络连接卷或本地 SSD 上；另外两个服务规模较小，并且在通用计算上运行。这两个作业运行到完成而不是作为服务。参见[Cache storage](/langsmith/self-host-smithdb-infrastructure#cache-storage)。

|组件|类型 |它有什么作用 |磁盘缓存|缩放 |
| - | - | - | - | - |
|食入|服务 |将传入跟踪写入对象存储 |是的 |卧式|
|查询 |服务 |为 LangSmith UI 和 API 提供跟踪读取服务 |是的 |卧式|
|压实工|服务 |在后台重新组织存储的跟踪，以便查询保持快速 |是的 |卧式|
|压实|服务 |安排压实工人进行的后台工作 |没有 |单实例 |
|集群管理器|服务 |协调其他 SmithDB 服务 |没有 |单实例 |
|元存储迁移 |工作 |在安装过程中准备 SmithDB 元存储 |没有 |运行一次 |
|移民|工作 |回填ClickHouse历史记录；仅当您 [migrate historical data](/langsmith/self-host-smithdb-migrate) | 时才运行没有 |并行度|

## 存储要求自托管 LangSmith 安装使用 PostgreSQL 存储操作数据，使用 Redis 或 Valkey 进行排队和缓存，以及可选的 blob 存储。当安装运行双重摄取时，跟踪和反馈存在于 ClickHouse、SmithDB 或两者中。 SmithDB 添加了自己的元存储、对象存储和缓存存储。

在 0.17 上，新安装可以运行 SmithDB，无需 ClickHouse；参见[Install without ClickHouse](/langsmith/self-host-smithdb-install#install-without-clickhouse)。从现有安装中停用 ClickHouse 是一个单独的过程；考虑之前请通过[Support Portal](https://support.langchain.com/)联系LangChain。

有关适用于 ClickHouse 和 SmithDB 的 SDK 方法更改，请参阅 [Migrate to SmithDB-backed SDK methods](/langsmith/smithdb-sdk-migration)。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>