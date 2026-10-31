<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS data plane cost estimate | https://docs.langchain.com/langsmith/byoc-data-plane-cost -->

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
> 2026 年 10 月 21 日或之后创建的数据平面仅运行 SmithDB。与三副本 ClickHouse 集群相比，不使用 ClickHouse 和 ZooKeeper 运行每月可节省约 **\$980**，与每个副本的单个副本相比每月可节省约 **\$325**。默认情况下，SmithDB 从 [Configure SmithDB for scale](/langsmith/self-host-smithdb-scale) 开始运行小型层：每秒大约 10 次运行和每秒 10 次查询。 LangSmith 根据跟踪量的需要增加该层。
>
> |面积 |每月粗略估计|笔记|
> | - | - | - |
> | RDS PostgreSQL | $100–$150 | `db.t4g.medium`，多可用区，50 GB 起始存储。 |
> | ElastiCache Redis | $140–$280 |没有只读副本的低端。如果启用了只读副本，则高端。 |
> | EKS 控制平面 | 75 美元 |一个 EKS 集群，按标准小时定价。 |
> |系统节点组| 210 美元 | 3 个`m6i.large` 按需节点。 |
> |应用程序工作节点 | ~~$325 | LangSmith 吊舱。 |
> | EBS 卷 | $200–$350 |节点卷和 gp3 性能设置。 |
> |网络| $150–$300 | NAT 网关、负载均衡器、PrivateLink 或 VPC 终端节点以及小批量数据处理。 |> | S3、Secrets Manager、CloudWatch | $50–$200 |低容量基线。随着跟踪负载、日志和保留的增长而增长。 |
> | SmithDB 计算 | 930 美元 | 1 x `m7i.4xlarge` 和 1 x `m7i.2xlarge` 用于小型层，加上大约 400 GiB 的 gp3 缓存和两个 80 GiB 启动卷。本地 NVMe 是可选的，2 x `m7gd.4xlarge` 的成本约为 1,550 美元。 |
> | SmithDB 元存储 | 210 美元 | Aurora PostgreSQL 18 Serverless v2，写入器和读取器，至少 1 ACU，50 GB。 |
> | SmithDB 存储桶 | $5–$120 | S3 存储成本很大程度上取决于跟踪负载大小和保留。 |
>
> 预计每月总额：**\$2,395–\$3,150**
>
> ### SmithDB 对象存储定价
>
> |每条迹线的存储大小 | 14 天保留 | 400 天保留 |
> | - | - | - |
> | 10 KB |每年 2 美元 |每年 74 美元 |
> | 50 KB |每年 15 美元 |每年 368 美元 |
> | 200 KB |每年 52 美元 |每年 1,472 美元 |
>
> 有关 SmithDB 基础设施的详细信息，请参阅 [Prepare SmithDB supporting infrastructure](/langsmith/self-host-smithdb-infrastructure)。> [选项卡] ClickHouse（已弃用）
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
> | ElastiCache Redis | $140–$280 |没有只读副本的低端。如果启用了只读副本，则高端。 |
> | EKS 控制平面 | 75 美元 |一个 EKS 集群，按标准小时定价。 |
> |系统节点组| 210 美元 | 3 个`m6i.large` 按需节点。 |
> |应用程序、ClickHouse 和 ZooKeeper 工作节点 | $1,000–$1,500 | LangSmith Pod 和 ClickHouse Pod。 |
> | EBS 卷 | $200–$350 | ClickHouse、ZooKeeper、节点卷和 gp3 性能设置。 |
> |网络| $150–$300 | NAT 网关、负载均衡器、PrivateLink 或 VPC 终端节点以及小批量数据处理。 |> | S3、Secrets Manager、CloudWatch | $50–$200 |低容量基线。随着跟踪负载、日志和保留的增长而增长。 |
>
> 预计每月总额：**\$1,925–\$3,065**

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-data-plane-cost.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。