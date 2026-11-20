<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: GCP data plane cost estimate | https://docs.langchain.com/langsmith/byoc-data-plane-cost-gcp -->

# GCP 数据平面成本估算

运行 SmithDB 的 LangSmith BYOC 数据平面的 Google Cloud 粗略成本，具有默认资源大小和沙箱的单独估算。

> [!警告]
>
> 这些是估计值，而不是报价。 Google Cloud 更改价格，恕不另行通知。您的账单取决于区域、使用情况以及您通过 Google Cloud 获得的任何折扣（例如承诺使用折扣）。

这是 [LangSmith BYOC data plane on GCP](/langsmith/byoc-architecture-gcp) 的每月粗略费用。 GCP 数据平面运行 SmithDB，而不是 ClickHouse。

该估算使用 `us-west1` 和每月 730 小时的美元按需定价。它不包括持续使用折扣，Google Cloud 会自动将其应用于 N2 和 N2D 虚拟机。数据库、Redis 和节点池大小是新数据平面的默认值。应用程序和 SmithDB 节点计数基于 LangChain 操作的低跟踪量测试数据平面。 LangSmith 根据跟踪量的需要增加容量。

> [!注意]
>
> 只要部署保持在安全操作限制内，任何资源的扩展容量都可以在需要时降低。

## 每月粗略估计

沙箱不包括在该估计中。参见[Sandbox add-on](#sandbox-add-on)。|面积 |每月粗略估计|笔记|
| - | - | - |
| GKE 集群管理 | 73 美元 |一个区域 GKE 集群，收费为 0.10 美元/小时。 |
|系统节点池 | 455 美元 | 3 个`n2-standard-4` 节点，每个区域一个，具有 100 GB 平衡永久磁盘启动磁盘。 |
|应用程序工作节点| $800–$1,600 | LangSmith Pod 的 4 到 8 个`e2-standard-8` 节点，由 GKE 节点自动配置创建，具有 100 GB 标准永久性磁盘启动磁盘。 |
| SmithDB 节点 | $637–$1,274 | 1 到 2 个 `n2-standard-16` 节点，每个节点有 2 个本地 SSD (750 GB)，用于 SmithDB 查询、摄取和压缩工作线程。该池最多可扩展至 16 个节点。 |
| Cloud SQL for PostgreSQL，LangSmith | 214 美元 | PostgreSQL 18，企业版，`db-custom-2-7680`（2 个 vCPU，7.5 GB），高可用性，50 GB SSD 存储。 |
| Cloud SQL for PostgreSQL、SmithDB 元存储 | 195 美元 | PostgreSQL 18，企业版，`db-custom-2-4096`（2 个 vCPU，4 GB），高可用性，100 GB SSD 存储。 |
| Redis 集群的内存存储 | \~\$46 | 1 个分片和 1 个副本：2 个 `REDIS_SHARED_CORE_NANO` 节点。 |
|网络| $50–$150 | Cloud NAT、入口负载均衡器、LangSmith 控制平面的 Private Service Connect 端点、外部 IP 地址和小批量数据处理。 ||云存储、秘密管理器、云日志、云监控 | $25–$200 |低容量基线。随着跟踪负载、保留和日志量的增长而增长。 |

预计每月总额（不包括沙箱）：**\$2,495–\$4,207**

### 估算注意事项

* **Cloud SQL** 对主数据库和备用数据库进行定价以实现高可用性。存储空间会自动增长，超出限额的备份存储空间会产生额外费用。
* **SmithDB** 将其缓存保留在本地 SSD 上。它们不是单独计费的永久性磁盘。如果第一个 SmithDB 池无法添加节点，例如在区域缺货期间，GKE 会改为扩展后备池：`n2d-standard-16`，然后`c3-standard-22-lssd`，然后`c3d-standard-30-lssd`。
* **Cloud NAT** 每个虚拟机每小时的费用为 0.0014 美元，另加处理的每 GB 0.045 美元。
* **Cloud Logging** 从每个数据平面子网接收 VPC 流日志。超出每月免费限额的摄取按 GB 计费。

### SmithDB 对象存储定价

SmithDB 将跟踪数据存储在数据平面的 Cloud Storage 存储桶中，`us-west1` 中的标准存储定价为每月每 GB 0.020 美元。这些数字假设每月约有 200 万条痕迹。|每条迹线的存储大小 | 14 天保留 | 400 天保留 |
| - | - | - |
| 10 KB |每年 2 美元 |每年 64 美元 |
| 50 KB |每年 11 美元 |每年 320 美元 |
| 200 KB |每年 45 美元 |每年 1,280 美元 |

有关 SmithDB 基础设施的详细信息，请参阅[Prepare SmithDB supporting infrastructure](/langsmith/self-host-smithdb-infrastructure)。

## 沙箱插件

如果您的数据平面运行沙箱，请为这些资源单独预算：

|面积 |每月粗略估计|笔记|
| - | - | - |
|沙箱节点池 | $637–$1,911 | 1 到 3 个 `n2-standard-16` 节点，每个节点有 2 个本地 SSD (750 GB)。该池至少保持一个节点运行。 |
| Redis 集群的内存存储 | +\$162 | Redis 迁移到 2 个 `REDIS_STANDARD_SMALL` 节点，每月总计约 208 美元，因为沙箱将其文件系统元数据保存在 Redis 中。 |
|云存储|基于使用 |沙盒文件系统存储在数据平面存储桶中。 |

## 另请参阅

* [Google Cloud pricing calculator](https://cloud.google.com/products/calculator)
* [Compute Engine VM pricing](https://cloud.google.com/compute/vm-instance-pricing)
* [GKE pricing](https://cloud.google.com/kubernetes-engine/pricing)
* [Cloud SQL pricing](https://cloud.google.com/sql/pricing)
* [Memorystore for Redis Cluster pricing](https://cloud.google.com/memorystore/docs/cluster/pricing)
* [Cloud NAT pricing](https://cloud.google.com/nat/pricing)
* [BYOC architecture on GCP](/langsmith/byoc-architecture-gcp)
* [Configure SmithDB for scale](/langsmith/self-host-smithdb-scale)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-data-plane-cost-gcp.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。