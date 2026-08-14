<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC FAQ | https://docs.langchain.com/langsmith/byoc-faq -->

# 自带设备常见问题解答

有关 LangSmith BYOC 的常见问题解答，涵盖数据驻留、访问、设置、数据平面模型和持续操作。

## 设置

<Accordion title="Which clouds and regions can I deploy to?">
  BYOC 在具有美国控制平面的 AWS 上普遍可用 (GA)。计划于 2026 年下半年支持更多云提供商。有关受支持的 AWS 区域，请参阅[Regions and cloud providers](/langsmith/byoc#regions-and-cloud-providers)。
</Accordion>

<Accordion title="Do I need a dedicated AWS account?">
  不可以。LangChain 建议使用新帐户以实现更清晰的计费，并且因为某些权限无法限定到特定资源，但这不是必需的。
</Accordion>

<Accordion title="Can I install BYOC into an existing VPC?">
  不是今天。 LangChain为每个数据平面提供专用的VPC。计划支持部署到现有 VPC。
</Accordion>

<Accordion title="Can I install BYOC into an existing EKS cluster?">
  不，并且没有计划支持它。 LangChain 代表您操作集群，包括升级和修补，专用集群使可靠的管理成为可能。
</Accordion>

<Accordion title="Can I run my own workloads in the LangSmith VPC or cluster?">
  是的，只要它们不干扰LangSmith的功能即可。

  在 AWS 账户中，请记住，授予跨账户角色的某些权限无法按标签限定范围，这就是 LangChain 建议使用专用账户的原因。在 Kubernetes 集群中，不干扰LangSmith的被动工作负载就可以，例如可观察性和安全监控代理。当您部署它们时：

  * 使用您自己的节点组和容忍度，而不是运行 LangSmith 的节点组和容忍度。
  * 部署到 LangSmith 使用的命名空间之外的命名空间中。
  * 请勿编辑资源LangChain条款。

  LangChain 不对因工作负载干扰而导致的停机或问题负责。
</Accordion>

<Accordion title="How long does provisioning take?">
  数据平面的端到端配置大约需要 60 到 90 分钟。由于 AWS 资源配置不一致，配置时间可能会有所不同。
</Accordion>

<Accordion title="What happens if provisioning fails?">
  数据平面转换到`Provisioning Failed`。失败通常是由于缺少跨账户角色的权限造成的，或者是由于服务控制策略 (SCP) 阻止了LangChain 需要执行的操作造成的。

  完全按照发布的方式应用[⟦T1⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role)，无需任何编辑或更改。修改的模块是缺少权限的常见原因。

  联系LangChain团队。更正权限后，配置会自动协调。
</Accordion>

<Accordion title="What VPC CIDR range should I use?">
  私有 RFC 1918 范围介于 `/18` 和 `/16` 之间。 LangChain 为该范围内的数据平面提供专用VPC。如果您计划使用 VPC 对等互连，请选择一个与您想要建立对等互连的 VPC 不重叠的范围。 CIDR 范围在配置后无法更改。
</Accordion>

<Accordion title="How do I reach a data plane with a private endpoint?">
  默认情况下，数据平面配置有私有终端节点，因此您需要私有连接，例如 Tailscale、AWS PrivateLink 或 VPC 对等互连。
</Accordion>

<Accordion title="Are my service endpoints exposed to the internet?">
  不会。默认情况下，服务位于私有负载均衡器后面，只能从 VPC 内部或通过您配置的私有连接进行访问。

  数据平面端点可以在配置时公开。参见[Onboarding](/langsmith/byoc-onboarding)。
</Accordion>

<Accordion title="Can I use my own DNS domain?">
  不会。数据平面是在标准 LangChain BYOC 域下配置的。在 **设置 > 数据平面** 下找到您的数据平面 API URL。
</Accordion>

<Accordion title="How do I decommission a data plane?">
  使用 `allow_delete_permissions = true` 重新应用 [⟦T4⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role)，这将授予删除 LangSmith 托管资源所需的权限。

  然后在 LangSmith UI 中选择 **删除数据平面**。 LangChain 取消配置您帐户中的基础设施。
</Accordion>

## 数据和安全

<Accordion title="Does sensitive data ever leave my VPC?">
  不会。当用户打开 `aws.smith.langchain.com` 时，浏览器会从 LangChain 的云端获取 LangSmith UI 包。加载后，应用程序会将敏感数据的每个请求路由到您的 VPC。

  参见[Data traffic](/langsmith/byoc-architecture#data-traffic)。
</Accordion><Accordion title="What can the LangChain team do in my account?">
  LangChain 可以管理LangSmith 创建的资源的基础设施，仅此而已。权限的范围由 `managed_by=langsmith` 标签确定，因此该角色无法对您帐户中不相关的资源执行操作。

  该角色不拥有授予数据访问的权限。参见[How least privilege is enforced](/langsmith/byoc-architecture#how-least-privilege-is-enforced)。
</Accordion>

<Accordion title="Can LangChain read my traces or database contents?">
  不。跨账户角色是基础设施范围而不是数据范围。它可以管理保存数据的资源，但在跟踪存储桶上不保存 `s3:GetObject`，不保存 PostgreSQL 的 `rds-db:connect`，也不保存 Redis 的 `elasticache:Connect`。

  访问数据本身需要您明确授予权限，例如在事件期间。参见[How least privilege is enforced](/langsmith/byoc-architecture#how-least-privilege-is-enforced)。
</Accordion>

<Accordion title="What access do LangChain employees have to my environment and data?">
  没有固定的数据访问。如果事件需要访问您的数据，LangChain 要么要求您自己运行查询，要么请求打破玻璃访问。
</Accordion>

<Accordion title="Does LangSmith support customer-managed encryption keys?">
  不是今天。使用云提供商管理的密钥对静态数据进行加密。计划支持客户管理的加密密钥 (CMK)。
</Accordion><Accordion title="How do I revoke LangChain's access?">
  您在自己的账户中创建并拥有跨账户角色，因此您可以撤消访问权限，而无需涉及 LangChain。删除角色或其与LangChain帐户的信任关系，会阻止控制平面承担该角色，并停止数据平面资源的协调。
</Accordion>

<Accordion title="Can I revoke individual permissions granted during provisioning?">
  是的，但该角色需要其权限来持续协调数据平面，并管理、升级和扩展它。删除它们可能会破坏这些操作。

  如果您需要删除特定权限，请先联系 LangChain 团队，以便审核更改。 LangChain 不对因未经审查而删除权限而导致的停机或问题负责。
</Accordion>

<Accordion title="What does LangChain hold in the control plane?">
  身份验证、组织和工作区配置、计费和使用元数据、哈希 API 密钥以及静态前端资产。

  跟踪、提示、数据集、评估器、实验、见解运行、注释队列、代理部署和工作区秘密都存在于您的数据平面中。
</Accordion>

<Accordion title="What data leaves my account?">
  仅运营数据，并且通过 PrivateLink 而不是公共互联网传输：* **身份验证请求**：数据平面调用控制平面来验证请求、验证 API 密钥并解析角色和权限。
  * **配置**：从控制平面加载的组织和工作区配置。
  * **计费和使用元数据**。
  * **操作遥测**。

  痕迹等敏感数据不会离开您的帐户。它仅从数据平面到达请求它的最终用户。参见[Data traffic](/langsmith/byoc-architecture#data-traffic)。
</Accordion>

<Accordion title="Does traffic go over the public internet?">
  不。

  * **控制平面到数据平面**：所有通信都通过 AWS PrivateLink 双向传输。
  * **S3**：流量通过 VPC 终端节点传输，使用 HTTPS 加密。
  * **容器镜像**：通过 VPC 终端节点从 LangChain 账户拉取。

  参见[Connectivity](/langsmith/byoc-architecture#connectivity)。
</Accordion>

<Accordion title="Can I use my own private registry?">
  不是今天。容器映像是通过 VPC 终端节点从 LangChain AWS 账户中提取的。对私有注册表的支持已列入路线图。
</Accordion>

<Accordion title="How does the control plane reach my Kubernetes API server?">
  通过 AWS PrivateLink。管理路径仅公开集群的 Kubernetes API 服务器，LangChain 用于安装和协调 LangSmith 组件。EKS 集群是私有的：API 服务器端点没有公共访问权限，工作节点没有公共 IP 地址。无法通过该连接访问您的数据，并且 LangChain 无法通过公共互联网访问您的环境。参见[Connectivity](/langsmith/byoc-architecture#connectivity)。
</Accordion>

<Accordion title="Where does the control plane run if my data plane is in the EU or APAC?">
  无论您将数据平面放置在何处，控制平面都以 `us-east-2` 运行。如果您在欧盟或亚太地区配置数据平面，您的敏感应用程序数据将保留在该区域，而控制平面元数据将保留在美国。参见[Regions and cloud providers](/langsmith/byoc#regions-and-cloud-providers)。
</Accordion>

## 数据平面和工作空间

<Accordion title="How do organizations, data planes, and workspaces relate?">
  数据平面属于一个组织，工作空间只属于一个数据平面。使用数据平面进行数据的物理分离，使用工作空间进行数据平面内的逻辑分离。参见[Organizations, data planes, and workspaces](/langsmith/byoc-usage#organizations-data-planes-and-workspaces)。
</Accordion>

<Accordion title="Can I run more than one data plane?">
  是的。一个组织可以拥有多个数据平面，每个数据平面都位于自己的 AWS 账户和区域中。

  默认限制是每个组织五个数据平面。要部署更多内容，请联系 LangChain 团队。
</Accordion><Accordion title="Can one organization hold both Cloud and BYOC workspaces?">
  是的。 LangSmith 云上的工作区路由到 LangChain 管理的后端而不是数据平面，因此两者可以在同一组织中共存。这也意味着您可以从 AWS 云试用迁移到 BYOC，同时重复使用相同的组织、用户、角色和 SSO 配置。
</Accordion>

## 操作

<Accordion title="Who upgrades LangSmith, and how often?">
  LangChain 每周升级一次数据平面中的 LangSmith 版本。升级是滚动进行的，因此不会出现整个服务停机的情况。 Istio 和 KEDA 等支持服务定期升级，LangChain 管理所有 EKS 集群升级。

  对发布渠道的支持即将推出。参见[Operations](/langsmith/byoc-operations)。
</Accordion>

<Accordion title="What about Kubernetes upgrades?">
  LangChain 在 AWS 支持终止日期之前主动拥有并执行 EKS 升级，并与您协调窗口。

  控制平面升级是透明的。节点组升级使用 make-before-break 语义逐个滚动节点，因此您可能会在 Pod 重新启动时看到短暂的连接重置，但不会丢失数据。参见[Kubernetes cluster upgrades](/langsmith/byoc-operations#kubernetes-cluster-upgrades)。
</Accordion><Accordion title="Do upgrades cause downtime?">
  不会。服务运行由水平 Pod 自动缩放器确定大小的多个副本，并且 Pod 中断预算限制了同时不可用的副本数量，因此滚动更新和节点耗尽都不会导致服务容量低于其所需容量。

  可能导致停机的维护（例如重新启动 RDS 或 ElastiCache）发生在LangChain 提前与您协调的计划维护时段内。
</Accordion>

<Accordion title="Who monitors the data plane?">
  LangChain 在配置后操作数据平面，包括监视正常运行时间和错误恢复、扩展、升级和安全修补。由于部署在您自己的帐户中运行，因此您已经操作的云控制也适用于它。
</Accordion>

<Accordion title="Can I set up my own observability for LangSmith BYOC?">
  是的。您可以在EKS集群中安装收集器、代理等可观测性工具，只要不干扰LangSmith的运行即可。

  LangSmith 服务发出日志、指标和跟踪的方式与自托管相同，因此适用相同的配置。参见[Export LangSmith telemetry to your observability backend](/langsmith/export-backend)。
</Accordion>

<Accordion title="How are high availability and disaster recovery handled?">
  默认情况下，数据平面已配置为实现高可用性，跨单个区域内的多个可用区运行。所有有状态组件均已备份。数据平面不跨越区域，因此整个区域丢失的恢复依赖于这些备份。参见[High availability](/langsmith/byoc-operations#high-availability)。
</Accordion>

<Accordion title="How are backups handled?">
  备份在您自己的帐户中运行：

  * **RDS**：每天进行备份。
  * **ClickHouse**：每天进行备份并存储在 S3 存储桶中。
  * **ElastiCache**：不进行备份，因为数据是短暂的。
</Accordion>

<Accordion title="Does LangChain offer an uptime SLA for BYOC data planes?">
  不会。数据平面在您的 AWS 账户中运行，因此其可用性取决于您控制的资源，包括账户本身、您配置用于访问数据平面的专用连接以及适用于账户的服务配额和策略。 LangChain 不承诺其不单独控制的基础设施的正常运行时间目标。

  LangChain 仍然监控数据平面的正常运行时间和错误恢复、扩展它并应用升级和安全补丁。参见[Operations](/langsmith/byoc-operations)。
</Accordion>

## 成本

<Accordion title="What do I pay for with BYOC?">
  两份单独的账单：

  * **基础设施**：数据平面在您自己的 AWS 账户中运行，因此您拥有基础设施并通过云提供商账单支付费用。
  * **LangSmith**：由LangChain根据您的合同和使用情况开具发票。

  LangChain 提供与 AWS Marketplace 的集成。
</Accordion>## 特性和迁移

<Accordion title="Which LangSmith features work on BYOC?">
  请参阅 [Available features](/langsmith/byoc#available-features) 了解当前支持的功能列表。
</Accordion>

<Accordion title="Can I migrate an existing LangSmith instance to BYOC?">
  部分。用户、角色、数据集、实验、提示、注释队列配置、自动化规则和仪表板可以从云或自托管实例复制。今天没有迁移痕迹。要计划迁移，[contact the LangChain sales team](https://www.langchain.com/contact-sales)。
</Accordion>

## 另请参阅

* [BYOC overview](/langsmith/byoc)
* [Why BYOC](/langsmith/byoc-why)
* [BYOC architecture](/langsmith/byoc-architecture)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-faq.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>