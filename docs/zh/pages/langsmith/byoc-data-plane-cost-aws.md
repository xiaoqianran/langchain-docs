<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS data plane cost estimate | https://docs.langchain.com/langsmith/byoc-data-plane-cost-aws -->

# AWS 数据平面成本估算

运行 SmithDB 的 LangSmith BYOC 数据平面的粗略 AWS 成本，以及使用 ClickHouse 创建的数据平面的旧估算。

> [!警告]
>
> 这些是估计值，而不是报价。 AWS 更改价格，恕不另行通知。您的账单取决于区域、使用情况以及与 AWS 的任何折扣协议，例如企业折扣计划或储蓄计划。

这是您 AWS 账户中 LangSmith 数据平面的大致每月费用。

> [!注意]
>
> 只要部署保持在安全操作限制内，任何资源的扩展容量都可以在需要时降低。对于注重成本或预生产部署，可以关闭多可用区。这降低了每月的成本，但降低了容错能力。> [选项卡] SmithDB
>
> 2026 年 10 月 21 日或之后创建的数据平面仅运行 SmithDB。他们不运行 ClickHouse 或 ZooKeeper。此估计是针对低跟踪量，大约每秒运行 10 次和每秒 10 次查询。参见[Configure SmithDB for scale](/langsmith/self-host-smithdb-scale)。 LangSmith 根据跟踪量的需要增加容量。
>
> |面积 |每月粗略估计|笔记|
> | - | - | - |
> | RDS PostgreSQL | $100–$150 | `db.t4g.medium`，多可用区，50 GB 起始存储。 |
> | ElastiCache Redis | 285 美元 | 3 个分片，每个分片 1 个副本：6 个 `cache.t4g.medium` 节点。 |
> | EKS 控制平面 | 75 美元 |一个 EKS 集群，按标准小时定价。 |
> |系统节点组| 210 美元 | 3 个`m6i.large` 按需节点。 |
> |应用程序工作节点| $700–$2,000 | LangSmith Pod 的 Karpenter 节点。 |
> | EBS 卷 | $40–$80 |节点启动磁盘。 SmithDB 缓存使用节点磁盘，而不是单独的 gp3 卷。 |
> |网络| $150–$300 | NAT 网关、负载均衡器、PrivateLink 或 VPC 终端节点以及小批量数据处理。 |
> | S3、Secrets Manager、CloudWatch | $50–$200 |低容量基线。随着跟踪负载、日志和保留的增长而增长。 |> | SmithDB 计算 | $1,400–$2,045 |低端为 1 x `c6id.8xlarge` 加 1 x `c6a.2xlarge`。高端为 1 x `i3.8xlarge`，或 2 x `i3.4xlarge`，加上 1 x `c6a.2xlarge`。查询、摄取和压缩工作线程使用较大的节点。 |
> | SmithDB 元存储 | 120 美元 | RDS PostgreSQL 18，`db.t4g.medium`，多可用区，100 GB gp3。 |
> | SmithDB 存储桶 | $5–$120 | S3 存储成本很大程度上取决于跟踪负载大小和保留。 |
>
> 预计每月总额：**\$3,135–\$5,585**
>
> ### SmithDB 对象存储定价
>
> |每条迹线的存储大小 | 14 天保留 | 400 天保留 |
> | - | - | - |
> | 10 KB |每年 2 美元 |每年 74 美元 |
> | 50 KB |每年 15 美元 |每年 368 美元 |
> | 200 KB |每年 52 美元 |每年 1,472 美元 |
>
> 有关 SmithDB 基础设施的详细信息，请参阅[Prepare SmithDB supporting infrastructure](/langsmith/self-host-smithdb-infrastructure)。> [选项卡] ClickHouse（已弃用）
>
>> [!警告]
>>
>> ClickHouse 已弃用，支持于 LangSmith v0.19 结束。 2026 年 10 月 21 日或之后创建的数据平面仅运行 SmithDB。此估计适用于该日期之前使用 ClickHouse 创建且尚未迁移到 SmithDB 的数据平面。
>
> ClickHouse 还可以作为单个节点而不是复制集群运行。这降低了每月的成本，但降低了容错能力。
>
> |面积 |每月粗略估计|笔记|
> | - | - | - |
> | RDS PostgreSQL | $100–$150 | `db.t4g.medium`，多可用区，50 GB 起始存储。 |
> | ElastiCache Redis | 285 美元 | 3 个分片，每个分片 1 个副本：6 个 `cache.t4g.medium` 节点。 |
> | EKS 控制平面 | 75 美元 |一个 EKS 集群，按标准小时定价。 |
> |系统节点组| 210 美元 | 3 个`m6i.large` 按需节点。 |
> |应用程序、ClickHouse 和 ZooKeeper 工作节点 | $1,000–$1,500 | LangSmith Pod 和 ClickHouse Pod。 |
> | EBS 卷 | $200–$350 | ClickHouse、ZooKeeper、节点卷和 gp3 性能设置。 |
> |网络| $150–$300 | NAT 网关、负载均衡器、PrivateLink 或 VPC 终端节点以及小批量数据处理。 |> | S3、Secrets Manager、CloudWatch | $50–$200 |低容量基线。随着跟踪负载、日志和保留的增长而增长。 |
>
> 预计每月总额：**\$2,070–\$3,070**

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-data-plane-cost-aws.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。