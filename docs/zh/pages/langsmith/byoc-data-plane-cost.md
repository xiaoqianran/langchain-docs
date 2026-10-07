<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS data plane cost estimate | https://docs.langchain.com/langsmith/byoc-data-plane-cost -->

# AWS 数据平面成本估算

LangSmith BYOC 数据平面的粗略 AWS 成本，以及 ClickHouse 占用空间和 SmithDB 节点、元存储和存储估算。

<Warning>
  这些是估计值，而不是报价。 AWS 更改价格，恕不另行通知。您的账单取决于区域、使用情况以及与 AWS 的任何折扣协议，例如企业折扣计划或储蓄计划。
</Warning>

这是您 AWS 账户中 LangSmith 数据平面的大致每月费用。

<Note>
  只要部署保持在安全操作限制内，任何资源的扩展容量都可以在需要时降低。对于注重成本或预生产部署，可以关闭多可用区。这降低了每月的成本，但降低了容错能力。
</Note>

<Tabs>
  <Tab title="ClickHouse">
    ClickHouse 还可以作为单个节点而不是复制集群运行。这降低了每月的成本，但降低了容错能力。|面积 |每月粗略估计|笔记|
    | - | - | - |
    | RDS PostgreSQL | $100–$150 | `db.t4g.medium`，多可用区，50 GB 起始存储。 |
    | ElastiCache Redis | $140–$280 |没有只读副本的低端。如果启用了只读副本，则高端。 |
    | EKS 控制平面 | 75 美元 |一个 EKS 集群，按标准小时定价。 |
    |系统节点组| 210 美元 | 3 个`m6i.large` 按需节点。 |
    |应用程序、ClickHouse 和 ZooKeeper 工作节点 | $1,000–$1,500 | LangSmith Pod 和 ClickHouse Pod。 |
    | EBS 卷 | $200–$350 | ClickHouse、ZooKeeper、节点卷和 gp3 性能设置。 |
    |网络| $150–$300 | NAT 网关、负载均衡器、PrivateLink 或 VPC 终端节点以及小批量数据处理。 |
    | S3、Secrets Manager、CloudWatch | $50–$200 |低容量基线。随着跟踪负载、日志和保留的增长而增长。 |

    预计每月总额：**\$1,925–\$3,065**
  </Tab>

  <Tab title="SmithDB">
    默认情况下，SmithDB 从 [Configure SmithDB for scale](/langsmith/self-host-smithdb-scale) 开始运行小型层：每秒大约 10 次运行和每秒 10 次查询。 LangSmith 根据跟踪量的需要增加该层。<Warning>
      SmithDB 迁移后，ClickHouse 和 ZooKeeper 进行了缩减。如果担心成本，可以关闭 ClickHouse。这降低了每月的成本，但降低了可靠性，因为没有 ClickHouse 后备。
    </Warning>

    |面积 |每月粗略估计|笔记|
    | - | - | - |
    | RDS PostgreSQL | $100–$150 | `db.t4g.medium`，多可用区，50 GB 起始存储。 |
    | ElastiCache Redis | $140–$280 |没有只读副本的低端。如果启用了只读副本，则高端。 |
    | EKS 控制平面 | 75 美元 |一个 EKS 集群，按标准小时定价。 |
    |系统节点组| 210 美元 | 3 个`m6i.large` 按需节点。 |
    |应用程序、ClickHouse 和 ZooKeeper 工作节点 | 650 美元 |降低 ClickHouse 成本。 |
    | EBS 卷 | $200–$350 | ClickHouse、ZooKeeper、节点卷和 gp3 性能设置。一旦这些数量减少，价格就会下降。 |
    |网络| $150–$300 | NAT 网关、负载均衡器、PrivateLink 或 VPC 终端节点以及小批量数据处理。 |
    | S3、Secrets Manager、CloudWatch | $50–$200 |低容量基线。随着跟踪负载、日志和保留的增长而增长。 || SmithDB 计算 | 1,550 美元 | 2 x `m7gd.4xlarge` 跨两个可用区，加上每个节点上的 100 GiB gp3 启动卷。 |
    | SmithDB 元存储 | 210 美元 | Aurora PostgreSQL 18 Serverless v2，写入器和读取器，至少 1 ACU，50 GB。 |
    | SmithDB 存储桶 | $5–$120 | S3 存储成本很大程度上取决于跟踪负载大小和保留。 |

    预计每月总额：**\$3,340–\$4,095**

    ### SmithDB 对象存储定价

    |每条迹线的存储大小 | 14 天保留 | 400 天保留 |
    | - | - | - |
    | 10 KB |每年 2 美元 |每年 74 美元 |
    | 50 KB |每年 15 美元 |每年 368 美元 |
    | 200 KB |每年 52 美元 |每年 1,472 美元 |

    [ClickHouse backfill](/langsmith/self-host-smithdb-migrate) 需要额外的 `m7gd.4xlarge` 来完成迁移工作，费用约为 **\$24 每天**。当回填完成时，该成本将停止（作业将在几天内完成，具体取决于跟踪量）。

    有关 SmithDB 基础设施的详细信息，请参阅[Prepare SmithDB supporting infrastructure](/langsmith/self-host-smithdb-infrastructure)。
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-data-plane-cost.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>