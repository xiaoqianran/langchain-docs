<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-hosted LangSmith on AWS | https://docs.langchain.com/langsmith/aws-self-hosted -->

# 在 AWS 上自托管 LangSmith

当在[Amazon Web Services (AWS)](https://aws.amazon.com/)上运行LangSmith时，[self-hosted](/langsmith/self-hosted)模式会部署一个完整的具有可观察性功能的LangSmith平台。

此页面提供：

- [Initial setup steps](#initial-setup) 用于部署到 EKS、配置托管服务和设置身份验证。
- [AWS-specific architecture patterns](#reference-architecture) 和参考图。
- [Service recommendations](#compute-options) 和最佳实践。
- [AWS Well-Architected best practices](#aws-well-architected-best-practices) 实现卓越运营、安全性和可靠性。

<Note>
LangChain 发布生产就绪的 [Terraform modules for AWS](https://github.com/langchain-ai/terraform/tree/main/modules/aws)，在单个工作流程中配置 EKS、RDS、ElastiCache、S3 和网络。从 [Deploy with Terraform overview](/langsmith/self-host-terraform) 开始，在 Terraform 和仅 Helm 路径之间进行选择。
</Note>

## 初始设置

<Steps>
  <Step title="Deploy to Kubernetes">
    沿着[Kubernetes installation guide](/langsmith/kubernetes)行驶。 LangSmith 在 Amazon Elastic Kubernetes Service (EKS) 上进行了测试。

    **EKS 特定说明：**
    - 确保安装 EBS CSI 驱动程序以实现持久存储
    - 使用`ebs.csi.aws.com`存储类配置器
  </Step>

  <Step title="Configure external services">
    对于生产部署，请连接到 AWS 托管服务：

    <CardGroup cols={2}>
      <Card title="Amazon S3" icon="database" href="/langsmith/self-host-blob-storage#amazon-s3">
        将跟踪数据存储在 S3 中
      </Card>
      <Card title="Amazon RDS" icon="database" href="/langsmith/self-host-external-postgres#amazon-rds">
        PostgreSQL数据库
      </Card>
      <Card title="Amazon ElastiCache" icon="cpu" href="/langsmith/self-host-external-redis#amazon-elasticache">
        Redis 或 Valkey 用于缓存
      </Card>
      <Card title="ClickHouse Cloud" icon="chart-line" href="/langsmith/self-host-external-clickhouse">
        分析数据库
      </Card>
    </CardGroup>
  </Step><Step title="Set up authentication">
    使用 [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) 对 AWS 服务的 LangSmith Pod 进行身份验证，无需静态凭证。

    **关键页面：**
    - [S3 IRSA configuration](/langsmith/self-host-blob-storage#amazon-s3)
    - [RDS IAM authentication](/langsmith/self-host-external-postgres#iam-authentication)
    - [ElastiCache IAM authentication](/langsmith/self-host-external-redis#iam-authentication)
  </Step>
</Steps>

完成这些初始设置步骤后，您可以查看下面的完整 AWS 架构和最佳实践。

## 参考架构

我们建议利用 AWS 的托管服务来提供可扩展、安全且有弹性的平台。以下架构适用于自托管和混合，并与 [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/) 保持一致：

![Architecture diagram showing AWS relations to LangSmith services](/langsmith/images/aws-architecture-self-hosted.png)- <Icon icon="globe" /> **入口和网络**：请求通过 [Amazon Application Load Balancer (ALB)](https://aws.amazon.com/elasticloadbalancing/application-load-balancer/) 在 [VPC](https://aws.amazon.com/vpc/) 内输入，使用基于 [AWS WAF](https://aws.amazon.com/waf/) 和 [IAM](https://aws.amazon.com/iam/) 的身份验证进行保护。
- <Icon icon="cube" /> **前端和后端服务：** 容器在 [Amazon EKS](https://aws.amazon.com/eks/) 上运行，在 ALB 后面进行编排，并根据需要将请求路由到集群内的其他服务。
- <Icon icon="database" /> **存储和数据库：**
  - [Amazon RDS for PostgreSQL](https://aws.amazon.com/rds/postgresql/) 或 [Aurora](https://aws.amazon.com/rds/aurora/)：已部署代理的元数据、项目、用户以及短期和长期内存。 LangSmith 支持 PostgreSQL 版本 14 或更高版本。
  - [Amazon ElastiCache](https://aws.amazon.com/elasticache/)（Redis 或 Valkey）：缓存和作业队列。 ElastiCache 可以处于单实例或集群模式。 LangSmith 需要 Redis OSS 版本 5 或更高版本，或 Valkey 8。
  - ClickHouse + [Amazon EBS](https://aws.amazon.com/ebs/)：分析和跟踪存储。
    - 我们建议使用[externally managed ClickHouse solution](/langsmith/self-host-external-clickhouse)，除非出于安全或合规原因
    阻止你这样做。
    - 混合部署不需要 ClickHouse。
  - [Amazon S3](https://aws.amazon.com/s3/)：用于跟踪工件和遥测的对象存储。

- <Icon icon="sparkles" /> **LLM 集成：** 可选择将请求代理到 [Amazon Bedrock](https://aws.amazon.com/bedrock/) 或 [Amazon SageMaker](https://aws.amazon.com/sagemaker/) 以进行 LLM 推理。
- <Icon icon="chart-line" /> **监控和可观察性：** 与 [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) 集成


## 计算选项

LangSmith 根据您的要求支持多种计算选项：|计算选项 |描述 |适合 |
|-----------------|-------------|--------------|
| **弹性 Kubernetes 服务（首选）** |高级扩展和多租户支持 |大型企业|
| **基于 EC2** |完全控制，BYO-infra |受监管或气隙环境 |

## AWS 架构完善的最佳实践

本参考旨在与 AWS 架构完善的框架的六大支柱保持一致：

### 卓越运营

- 使用 IaC ([CloudFormation](https://aws.amazon.com/cloudformation/) / [Terraform](https://www.terraform.io/)) 自动化部署。
- 使用[AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)进行配置。
- 将您的 LangSmith 实例配置为 [export telemetry data](/langsmith/export-backend) 并通过 [CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) 持续监控。
- 管理[LangSmith deployments](/langsmith/deployment)的首选方法是创建一个CI进程来构建[Agent Server](/langsmith/agent-server)图像并将其推送到[ECR](https://aws.amazon.com/ecr/)。在 PR 合并时将新修订部署到暂存或生产之前，为拉取请求创建测试部署。

### 安全

- 使用具有最小权限策略的[IAM](https://aws.amazon.com/iam/)角色。
- 启用静态加密（[RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html)、[S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingEncryption.html)、ClickHouse 卷）和传输中加密 (TLS 1.2+)。
- 与[AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)集成以获得凭证。
- 将 [Amazon Cognito](https://aws.amazon.com/cognito/) 作为 IDP 与 LangSmith 的内置身份验证和授权功能结合使用，以确保对代理及其工具的访问安全。### 可靠性

- 跨地域复制LangSmith[data plane](/langsmith/data-plane)：将相同的数据平面部署到不同地域的Kubernetes集群上，进行LangSmith部署。跨 [Multi-AZ](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/) 部署 [RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html) 和 [ECS](https://aws.amazon.com/ecs/) 服务。
- 为后端工作人员实施[auto-scaling](https://aws.amazon.com/autoscaling/)。
- 使用[Amazon Route 53](https://aws.amazon.com/route53/)健康检查和故障转移策略。

### 性能效率

- 利用 [EC2](https://aws.amazon.com/ec2/) 实例来优化计算。
- 对于不经常访问的跟踪数据使用[S3 Intelligent-Tiering](https://aws.amazon.com/s3/storage-classes/intelligent-tiering/)。

### 成本优化

- 使用[Compute Savings Plans](https://aws.amazon.com/savingsplans/compute-pricing/)调整[EKS](https://aws.amazon.com/eks/)集群的大小。
- 使用 [AWS Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/) 仪表板监控成本 KPI。

### 可持续性

- 通过按需计算最大限度地减少空闲工作负载。
- 将遥测数据存储在低延迟、低成本的层中。
- 为非生产环境启用自动关闭。

## 安全性和合规性

LangSmith 可配置为：

- 仅[PrivateLink](https://aws.amazon.com/privatelink/) 访问（除了计费所需的出口外，没有公共互联网暴露）。
- S3、RDS 和 EBS 基于[KMS](https://aws.amazon.com/kms/) 的加密密钥。
- 审计日志记录到[CloudWatch](https://aws.amazon.com/cloudwatch/)和[AWS CloudTrail](https://aws.amazon.com/cloudtrail/)。

客户可以根据需要在[GovCloud](https://aws.amazon.com/govcloud-us/)、ISO 或 HIPAA 区域进行部署。

## 监控和评估

使用 LangSmith 可以：

- 从[Bedrock](https://aws.amazon.com/bedrock/)或[SageMaker](https://aws.amazon.com/sagemaker/)上运行的LLM应用程序捕获跟踪。
- 通过[LangSmith datasets](/langsmith/manage-datasets)评估模型输出。
- 跟踪延迟、令牌使用情况和成功率。集成：

- [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) 仪表板。
- [OpenTelemetry](https://opentelemetry.io/) 和 [Prometheus](https://prometheus.io/) 出口商。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/aws-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>