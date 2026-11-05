<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC operations on Azure | https://docs.langchain.com/langsmith/byoc-operations-azure -->

# Azure 上的 BYOC 操作

LangChain 如何在 Azure 上扩展、升级和维护 LangSmith BYOC 数据平面，包括实例大小、维护时段和审核。

LangChain 在配置后操作您的 Azure 数据平面，包括升级、扩展、监控和安全修补。您无需调整或调整每项服务。对于 AWS 上的 BYOC，请参阅 [BYOC operations](/langsmith/byoc-operations-aws)。

## 自动缩放

LangChain 随着负载变化扩展数据平面：

* **无状态LangSmith服务**：KEDA 在其最小和最大副本数量之间缩放每个服务。大多数服务的目标是其请求资源的 70% CPU 和 80% 内存。
* **集群节点**：AKS [node auto-provisioning](https://learn.microsoft.com/azure/aks/node-autoprovision) 为无法调度的 Pod 添加容量，并删除未使用的容量。每个节点池都有 CPU 和内存限制。通用池限制为 100 个 vCPU 和 400 GiB 内存。系统节点池为三个节点。
* **存储**：启用 PostgreSQL 存储自动增长。 Blob 存储随着使用量的增加而增长，生命周期规则根据跟踪负载的保留层使跟踪负载过期。
* **数据库**：LangChain 监控使用情况，并可以更改 PostgreSQL 和 Redis 大小、服务副本计数和节点池限制。SmithDB 使用专用节点池进行计算和本地 NVMe 缓存存储。有关存储配置和保留，请参阅[Data stores](/langsmith/byoc-architecture-azure#data-stores)和[Data protection](/langsmith/byoc-architecture-azure#data-protection)。

## 高可用性

数据平面在支持区域冗余的 PostgreSQL 备用服务器。 Azure 托管 Redis 有一个副本以实现高可用性。 Blob 存储在具有可用区的区域中使用区域冗余存储 (ZRS)，在其他地方使用本地冗余存储 (LRS)。

## 实例大小

数据平面从以下数据库和系统节点大小开始。如需不同尺寸，请联系LangChain团队。

|资源 |默认尺寸 |
| - | - |
| PostgreSQL (LangSmith) | PostgreSQL 18，`GP_Standard_D2ds_v4`，具有自动增长功能的 32 GiB 存储 |
| PostgreSQL（SmithDB 元存储）| PostgreSQL 18，`GP_Standard_D2ds_v4`，具有自动增长功能的 128 GiB 存储 |
| Azure 托管 Redis | `Balanced_B3`，启用高可用性，禁用持久性 |
| AKS系统节点池 |三个`Standard_D2s_v6`节点，固定大小 |
|应用程序和 SmithDB 节点 |在每个节点池的限制内自动配置节点 |

LangSmith 服务从以下资源请求和自动缩放范围开始：|服务 |最小副本 |最大副本数 | CPU 请求 |内存请求|
| - | - | - | - | - |
|后端 | 2 | 20 | 1 | 4GiB |
|平台后台| 2 | 20 | 500m | 1 GiB |
|摄取队列 | 2 | 20 | 2 | 4GiB |
|队列| 1 | 10 | 10 1 | 4GiB |
|听众| 1 | 10 | 10 1 | 1500 MiB |
|主机后台 | 1 | 10 | 10 500m | 1000 MiB |
| ACE 后端 | 1 | 10 | 10 1 | 2 GiB |
|普雷西迪奥 | 1 | 10 | 10 250m | 2 GiB |

## LangSmith 升级

LangChain 管理LangSmith 版本升级。服务使用水平 Pod 自动缩放和 Pod 中断预算来限制更换 Pod 的影响。更新期间的可用性取决于服务的副本计数和可用集群容量。

## 支持服务升级

LangChain 管理 Istio 和 KEDA 等支持服务以及 LangSmith 工作负载。 Azure 数据平面将跟踪存储在 SmithDB 中，并且不运行 ClickHouse。

## Kubernetes 集群升级

AKS 在数据平面的维护时段内自动应用 Kubernetes 补丁版本和节点映像更新。系统节点池在升级期间使用激增节点，以便 Pod 可以转移到新容量。

## 维护窗口Azure 数据平面每周有一个四小时的维护窗口（UTC）。默认为星期日 07:00–11:00 UTC (`sun:07:00-sun:11:00`)。 AKS 升级和 PostgreSQL 维护使用此窗口。

要更改窗口，请使用[Change data plane settings](/langsmith/byoc-onboarding-azure#change-data-plane-settings)中描述的API。 LangSmith UI 中的维护窗口设置表单仅支持 AWS。

## 可观察性

数据平面从 Azure Monitor 读取 PostgreSQL 和 Redis 指标，并将运行状况指标报告给LangChain。您可以像在自托管部署上一样配置 LangSmith 服务日志、指标和跟踪。参见[Export LangSmith telemetry to your observability backend](/langsmith/export-backend)。

您可以部署自己的可观察性和安全监控代理，只要它们不干扰 LangSmith 工作负载即可。

## 故障排除

LangChain 通过委派的 Microsoft Entra 角色管理数据平面中的资源。这些管理角色不会授予 Blob 存储、PostgreSQL 或 Redis 上的数据角色。完整的权限模型请参见[Access and permissions](/langsmith/byoc-architecture-azure#access-and-permissions)。

当故障排除需要数据时，您可以自己运行查询，然后验证和清理输出，然后再与 LangChain 共享。如果工程师需要临时访问权限，LangChain 团队会与您协调访问权限。

## 审计* **LangSmith审计日志**：数据平面操作记录在数据平面中，控制平面操作记录在控制平面中。参见[Audit logs](/langsmith/audit-logs)。
* **Azure 活动日志**：记录对订阅中的 Azure 资源管理器的 LangSmith 调用。
* **资源和网络日志**：LangSmith 不配置 Azure 诊断设置或 VNet 流日志。默认情况下，不收集 AKS 控制平面和审核日志、Key Vault 审核日志、PostgreSQL 日志和网络流日志。配置诊断设置和流日志以收集它们。

您负责查看这些日志并配置警报。

## 另请参阅

* [BYOC architecture on Azure](/langsmith/byoc-architecture-azure)
* [Azure data plane cost estimate](/langsmith/byoc-data-plane-cost-azure)
* [Using BYOC](/langsmith/byoc-usage)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-operations-azure.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。