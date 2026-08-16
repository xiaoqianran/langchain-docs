<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC billing | https://docs.langchain.com/langsmith/byoc-billing -->

## 成本模型

BYOC 部署会产生两个单独的账单：

- **AWS**：数据平面在您自己的 AWS 账户中运行，因此 AWS 直接向您收取其创建的基础设施的费用。
- **LangSmith**：LangChain 根据您的合同和使用情况向您开具发票。

LangSmith BYOC 可以与 AWS Marketplace 集成。

## 可计费的 AWS 服务

每个数据平面都会在您的帐户中创建以下资源。 AWS 按自己的费率收费，与您的 LangSmith 合同无关。

|服务 |它涵盖什么 |计费依据|
|--------------------|----------------|------------------------|
| **亚马逊 EKS** |数据平面集群的 Kubernetes 控制平面 |每集群小时 |
| **亚马逊EC2** | EKS 集群中运行的节点 |每实例小时 |
| **亚马逊RDS** |关系工作负载的实例 |每个实例小时，包括多可用区，以及存储、备份和快照 |
| **亚马逊ElastiCache** |用于缓存和排队工作负载的 Redis 实例 |每节点小时 |
| **亚马逊S3** |用于 LangSmith 工作负载、ClickHouse 备份和 VPC 流日志的存储桶 |存储、请求和数据传输 || **亚马逊EBS** |节点根磁盘和 ClickHouse 存储卷 |每月每 GB，加上高于 gp3 基准的预配置 IOPS 和吞吐量 |
| **区域 NAT 网关** |私有子网的出站出站流量 |每小时，加上处理的数据|
| **弹性负载平衡** |两个网络负载均衡器：一个位于 Istio 入口前面，另一个用于 EKS API PrivateLink 端点 |每 NLB 小时，加上 NLCU |
| **AWS PrivateLink** |数据平面使用的接口 VPC 端点 |每个可用区小时的每个接口端点，以及处理的数据 |
| **AWS Lambda 和 Amazon EventBridge** | PrivateLink 端点的协调 |每次调用和每个发布的事件 |
| **亚马逊 CloudWatch 日志** | EKS 控制平面日志 |摄入和储存|
| **VPC 流日志** |将流日志传送到 S3 |每 GB 交付 |
| **亚马逊 53 号公路** |私人托管区 |每个托管区域月，加上查询 |
| **AWS Secrets Manager** | RDS 生成的主密钥和应用程序密钥LangSmith 参考 |每个秘密月份，加上 API 调用 |

### 数据传输

BYOC 中有一些数据传输成本驱动因素：- 跨可用区流量，因为数据平面跨区域运行[highly available](/langsmith/byoc-operations#high-availability)。
- 通过 NAT 网关出口，例如，如果调用模型提供程序，或通过 Webhook 调用外部 API。
- 公共 IPv4 地址，AWS 按地址小时收费。当启用公共入口时，区域 NAT 网关使用一个，面向互联网的负载均衡器使用另一个。

## 服务限制

AWS 强制执行每个区域和每个账户的默认配额。对于新帐户或很少使用的帐户的生产来说，默认值通常太低，因此在部署之前检查以下内容，并在需要时请求增加：- **EC2 vCPU 配额**：至少 64 个 vCPU 按需容量，涵盖 3 个系统节点和 Karpenter 工作负载。
- **子网 IP 容量**：用于 Pod、节点、EKS ENI、负载均衡器以及每个应用程序子网至少 12 个接口端点的空间。
- **VPC 端点**：12 个接口端点和 1 个 S3 网关端点的容量。
- **负载均衡器**：2 个网络负载均衡器及其目标组的容量。
- **EKS**：1 个 EKS 集群的容量。
- **存储**：ClickHouse、ZooKeeper、节点磁盘和其他持久工作负载的 EBS 卷和存储容量。
- **数据库**：2 个 RDS 实例和 3 个 ElastiCache 副本的容量。
- **PrivateLink 和网络**：1 个端点服务和 1 个区域 NAT 网关的容量。

有关当前默认值，请参阅[AWS service quotas](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html)。

如果配置停止或失败，配额耗尽是一个常见原因，此外还有缺少权限和服务控制策略。参见[What happens if provisioning fails?](/langsmith/byoc-faq)。

## 另请参阅

- [BYOC architecture](/langsmith/byoc-architecture)
- [Operations](/langsmith/byoc-operations)
- [BYOC FAQ](/langsmith/byoc-faq)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-billing.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>