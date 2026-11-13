<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Azure data plane cost estimate | https://docs.langchain.com/langsmith/byoc-data-plane-cost-azure -->

# Azure 数据平面成本估算

运行 SmithDB 的LangSmith BYOC 数据平面的大致 Azure 基础设施成本，包括示例节点数、排除沙箱和额外费用。

> [!警告]
>
> 这些是估计值，而不是报价。 Azure 更改价格，恕不另行通知。您的账单取决于地区、使用情况和折扣。下面的小计不包括节点磁盘、网络、对象存储和其他使用费用。这不是完整的每月账单。

这是 [LangSmith BYOC data plane on Azure](/langsmith/byoc-architecture-azure) 每月的粗略基础设施成本。 Azure 数据平面运行 SmithDB，而不是 ClickHouse。

该估算使用 `eastus`、Linux VM 和每月 730 小时的美元即用即付价格。数据库和系统节点大小与[default profile](/langsmith/byoc-operations-azure#instance-sizes)匹配。应用程序和 SmithDB 节点数量是假设，而不是固定的部署规模。 AKS 节点自动预配会在每个池的限制内选择 VM 大小和计数。

## 每月粗略估计

此示例预算假设有 2 到 6 个应用程序节点、1 个 SmithDB 缓存节点和 1 个 SmithDB 计算节点。每个计算行覆盖一组单独的虚拟机。 SmithDB 计算不包含在应用程序节点估算中。> [!注意]
>
> 沙箱被排除在基准之外，包括其主机计算、存储和专用端点。该估计并不意味着沙箱默认被禁用或可以自助选择退出。

|面积 |每月粗略估计|笔记|
| - | - | - |
| AKS 控制平面 | 73 美元 |标准等级为 0.10 美元/小时。 |
|系统节点池 | 221 美元 | 3 个 `Standard_D2s_v6` 节点，每个节点 0.101 美元/小时。节点磁盘是额外的。 |
|应用程序工作节点| $589–$1,765 |假设 2 到 6 个 `Standard_D8s_v6` 节点，每个 LangSmith Pod 的费用为 0.403 美元/小时。 |
| SmithDB 缓存节点 | 1,455 美元 |假设查询、摄取和压缩工作人员的 1 `Standard_D32ds_v6` 为 1.993 美元/小时。本地 NVMe 包含在 VM 价格中。 |
| SmithDB 计算节点 | 294 美元 |假设 1 `Standard_D8s_v6` 为 0.403 美元/小时，用于压缩调度和集群管理器。 |
| PostgreSQL，LangSmith | 267 美元 | PostgreSQL 18，`GP_Standard_D2ds_v4`，32 GiB 存储，支持区域冗余备用。包括主计算和备用计算和存储。 |
| PostgreSQL、SmithDB 元存储 | 289 美元 | PostgreSQL 18，`GP_Standard_D2ds_v4`，128 GiB 存储，支持区域冗余备用。包括主计算和备用计算和存储。 || Azure 托管 Redis | 95 美元 | `Balanced_B3`，启用高可用性。两个节点，每个节点 0.065 美元/小时。 |
|节点磁盘|额外的，不包括在内 |节点不使用临时操作系统磁盘的托管操作系统磁盘。 SmithDB 缓存使用本地 NVMe，而不是单独计费的托管缓存磁盘。 |
|网络|额外的，不包括在内 | NAT 网关、负载均衡器、专用端点、公共 IP 地址、数据处理和数据传输。 |
| Blob 存储、Key Vault、DNS 和监控 |额外的，不包括在内 |存储容量、操作、保留以及您启用的任何诊断日志。 |

定价项目的预计每月小计（不包括沙盒）：**\$3,283–\$4,460**。添加上述附加费用、税金和LangSmith费用以估算完整账单。

系统节点从三个`Standard_D4s_v6`减少到三个`Standard_D2s_v6`，每月可节省约 221 美元的虚拟机计算费用。较旧的仅限 D8s_v5 的 SmithDB 估计并不代表专用 NVMe 池。仅较小的系统节点并不能降低总费用。PostgreSQL 估计每 vCore 小时使用 0.089 美元，每 GiB 月使用 0.115 美元。每台服务器都有两个 vCore 和一个匹配的备用服务器。超出所含限额的存储增长和备份存储会产生额外费用。

SmithDB 缓存示例具有 32 个 vCPU 和 128 GiB 内存。 Azure 特定的 Pod 请求为用于查询的 4 个 vCPU 和 8 GiB，用于摄取的 4 个 vCPU 和 8 GiB，以及每个压缩工作线程 8 个 vCPU 和 16 GiB。每个工作线程的缓存请求分别为 200 GiB、100 GiB 和 100 GiB。它们在专用的本地 NVMe 池上运行，与压缩调度程序和集群管理器分开。副本计数、调度开销、升级和负载可能需要更多节点。此示例不保证吞吐量水平或高度可用的 SmithDB 节点布局。对于网络来说，仅 NAT 网关在数据处理之前的费用约为每月 33 美元。在没有沙箱且启用控制平面私有访问的情况下，七个显式客户端私有端点每月的成本约为 51 美元：两个 PostgreSQL、两个 Blob 存储、Redis、Key Vault 和控制平面访问。 AKS 管理专用终结点在 LangChain 的订阅中运行，不属于您的账单的一部分。标准负载均衡器的前五个规则的费用约为每月 18.25 美元。这些费用不包括在小计中。在 Azure 定价计算器中添加部署的资源和流量。

## 沙箱插件

如果您的部署包括沙箱，请为其专用主机节点、Blob 存储和专用终结点单独制定预算。一台示例性 `Standard_D16ds_v6` 主机的成本约为 **\$728 每月**，每小时 $0.997。其专用端点每月增加 7.30 美元，外加沙箱存储和流量费用。额外的主机会增加计算成本。

## 另请参阅

* [Azure retail prices API](https://prices.azure.com/api/retail/prices)
* [Azure pricing calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
* [Azure NAT Gateway pricing](https://azure.microsoft.com/en-us/pricing/details/azure-nat-gateway/)
* [Azure Managed Redis pricing](https://azure.microsoft.com/en-us/pricing/details/managed-redis/)
* [Azure Database for PostgreSQL pricing](https://azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server/)
* [BYOC operations on Azure](/langsmith/byoc-operations-azure)
* [Configure SmithDB for scale](/langsmith/self-host-smithdb-scale)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-data-plane-cost-azure.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。