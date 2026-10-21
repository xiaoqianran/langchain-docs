<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC FAQ | https://docs.langchain.com/langsmith/byoc-faq -->

# 自带设备常见问题解答

有关 LangSmith BYOC 的常见问题解答，涵盖数据驻留、访问、设置、数据平面模型和持续操作。

## 设置

> **我可以部署到哪些云和区域？**
>
> BYOC 在具有美国控制平面的 AWS 上普遍可用 (GA)。计划于 2026 年下半年支持更多云提供商。有关受支持的 AWS 区域，请参阅[Regions and cloud providers](/langsmith/byoc#regions-and-cloud-providers)。

> **我需要专用 AWS 账户吗？**
>
> 否。LangChain 建议使用新帐户以实现更清晰的计费，并且因为某些权限无法限定于特定资源，但这不是必需的。

> **我可以将 BYOC 安装到现有 VPC 中吗？**
>
> 是的。使用 [Bring your own VPC (BYOVPC)](/langsmith/byoc-byovpc)，您可以提供 VPC 和子网。您可以使用[reference Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/byovpc)创建VPC，也可以使用现有的满足网络要求的VPC。
>
> 要从客户角色中删除 VPC 创建权限，请在 [⟦T1⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role) 中设置 `allow_vpc_creation_permissions = false`，并在 `vpc_ids` 中包含您的 VPC ID。

> **我可以在同一个 VPC 中部署多个数据平面吗？**
>
> 是的。在同一个VPC中部署多个数据平面需要[Bring your own VPC (BYOVPC)](/langsmith/byoc-byovpc)。每个数据平面必须使用不同的子网。不要在数据平面之间共享子网。> **我可以将现有数据平面移至我自己的 VPC 中吗？**
>
> 不可以。不支持将现有数据平面移动到不同的 VPC，也不支持在创建后更改其 VPC 和子网配置。

> **我可以将 BYOC 安装到现有 EKS 集群中吗？**
>
> 不，并且没有计划支持它。 LangChain 代表您操作集群，包括升级和修补，专用集群使可靠的管理成为可能。

> **我可以在 LangSmith VPC 或集群中运行自己的工作负载吗？**
>
> 是的，只要它们不干扰 LangSmith 的功能即可。
>
> 在 AWS 账户中，请记住，授予跨账户角色的某些权限无法按标签限定范围，这就是 LangChain 建议使用专用账户的原因。
>
> 在 Kubernetes 集群中，不干扰LangSmith的被动工作负载就可以，例如可观察性和安全监控代理。当您部署它们时：
>
> * 使用您自己的节点组和容忍度，而不是 LangSmith 运行的节点组和容忍度。
> * 部署到 LangSmith 使用的命名空间之外的命名空间中。
> * 请勿编辑资源LangChain条款。
>
> LangChain 对干扰工作负载引起的停机或问题不承担任何责任。> **我应该为我的角色的外部 ID 设置什么值？**
>
> LangChain 提供外部ID。导航到 **设置 > 数据平面**，然后使用 **数据平面** 标题旁边的复制按钮进行复制。应用 `langsmith-byoc-role` Terraform 模块时使用此值。角色的信任策略必须在其 `ExternalId` 条件下使用此值。

> **配置需要多长时间？**
>
> 数据平面的端到端配置大约需要 60 到 90 分钟。由于 AWS 资源配置不一致，配置时间可能会有所不同。

> **如果配置失败会发生什么？**
>
> 数据平面转换至`Provisioning Failed`。失败通常是由于缺少跨账户角色的权限造成的，或者是由于服务控制策略 (SCP) 阻止了LangChain 需要执行的操作造成的。
>
> 完全按照发布的方式应用 [⟦T6⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role)，无需任何编辑或更改。修改的模块是缺少权限的常见原因。
>
> 联系LangChain团队。更正权限后，配置会自动协调。> **我应该使用什么 VPC CIDR 范围？**
>
> `/18` 和 `/16` 之间的私有 RFC 1918 范围。如果您计划使用 VPC 对等互连，请选择一个与您想要建立对等互连的 VPC 不重叠的范围。 CIDR 范围在配置后无法更改。

> **如何通过专用端点访问数据平面？**
>
> 默认情况下，数据平面配置有私有终端节点，因此您需要私有连接，例如 Tailscale、AWS PrivateLink 或 VPC 对等互连。

> **我的服务端点是否暴露在互联网上？**
>
> 不需要。默认情况下，服务位于私有负载均衡器后面，只能从 VPC 内部或通过您配置的私有连接进行访问。
>
> 数据平面端点可以在配置时公开。参见[Onboarding](/langsmith/byoc-onboarding)。

> **我可以使用自己的 DNS 域吗？**
>
> 不需要。数据平面是在标准 LangChain BYOC 域下配置的。在 **设置 > 数据平面** 下找到您的数据平面 API URL。

> **如何停用数据平面？**
>
> 将 [⟦T9⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role) 与 `allow_delete_permissions = true` 重新应用，这将授予删除 LangSmith 托管资源所需的权限。
>
> 然后在 LangSmith UI 中选择 **删除数据平面**。 LangChain 取消配置您帐户中的基础设施。## 数据和安全

> **敏感数据是否会离开我的 VPC？**
>
> 不会。当用户打开 `aws.smith.langchain.com` 时，浏览器会从 LangChain 的云端获取 LangSmith UI 包。加载后，应用程序会将敏感数据的每个请求路由到您的 VPC。
>
> 参见[Data traffic](/langsmith/byoc-architecture#data-traffic)。

> **LangChain 团队可以在我的帐户中做什么？**
>
> LangChain 可以管理LangSmith 创建的资源的基础设施，仅此而已。权限的范围由 `managed_by=langsmith` 标签确定，因此该角色无法对您帐户中不相关的资源执行操作。
>
> 该角色不拥有授予数据访问的权限。参见[How least privilege is enforced](/langsmith/byoc-architecture#how-least-privilege-is-enforced)。

> **LangChain可以读取我的痕迹或数据库内容吗？**
>
> 不。跨账户角色是基础设施范围而不是数据范围。它可以管理保存数据的资源，但跟踪存储桶上不保存 `s3:GetObject`，PostgreSQL 不保存 `rds-db:connect`，Redis 也不保存 `elasticache:Connect`。
>
> 访问数据本身需要您明确授予权限，例如在发生事件期间。参见[How least privilege is enforced](/langsmith/byoc-architecture#how-least-privilege-is-enforced)。

> **LangChain 员工对我的环境和数据有什么访问权限？**
>
> 没有固定的数据访问。如果事件需要访问您的数据，LangChain 要么要求您自己运行查询，要么请求打破玻璃访问。> **LangSmith 支持客户管理的加密密钥吗？**
>
> 不是今天。使用云提供商管理的密钥对静态数据进行加密。计划支持客户管理的加密密钥 (CMK)。

> **如何撤销LangChain的访问权限？**
>
> 您在自己的账户中创建并拥有跨账户角色，因此您可以撤消访问权限，而无需涉及 LangChain。删除角色或其与LangChain帐户的信任关系，会阻止控制平面承担该角色，并停止数据平面资源的协调。

> **我可以撤销配置期间授予的个人权限吗？**
>
> 是的，但该角色需要其权限来持续协调数据平面，并管理、升级和扩展它。删除它们可能会破坏这些操作。
>
> 如果您需要删除特定权限，请先联系 LangChain 团队，以便审核更改。 LangChain 不对因未经审查而删除权限而导致的停机或问题负责。> **控制平面中LangChain有什么？**
>
> 身份验证、组织和工作区配置、计费和使用元数据、哈希 API 密钥以及静态前端资产。
>
> 跟踪、提示、数据集、评估器、实验、见解运行、注释队列、代理部署和工作区秘密都位于您的数据平面中。

> **哪些数据会离开我的帐户？**
>
> 仅运营数据，并且通过 PrivateLink 而不是公共互联网传输：
>
> * **身份验证请求**：数据平面调用控制平面来验证请求、验证 API 密钥并解析角色和权限。
> * **配置**：从控制平面加载的组织和工作区配置。
> * **计费和使用元数据**。
> * **操作遥测**。
>
> 痕迹等敏感数据不会离开您的帐户。它仅从数据平面到达请求它的最终用户。参见[Data traffic](/langsmith/byoc-architecture#data-traffic)。> **流量是否通过公共互联网传输？**
>
> No.
>
> * **控制平面到数据平面**：所有通信都通过 AWS PrivateLink 双向传输。
> * **S3**：流量通过 VPC 终端节点传输，使用 HTTPS 加密。
> * **容器镜像**：通过 VPC 终端节点从 LangChain 账户拉取。
>
> See [Connectivity](/langsmith/byoc-architecture#connectivity).

> **我可以限制来自数据平面的出站网络流量吗？**
>
> 是的。
>
> 对于LangChain 管理的 VPC，BYOC 支持控制数据平面出口的网络防火墙。请联系LangChain团队启用它。
>
> 启用后，防火墙默认拒绝所有出站流量。然后，您可以配置允许数据平面到达的目的地的允许列表：
>
> * **域**：完全限定的域名，例如模型提供程序 API 端点或公共 Docker 注册表。
> * **CIDR 范围**：IP 范围，例如内部服务或私有子网。
>
> 通过 BYOVPC，您可以管理自己的防火墙和出口控制。您的网络必须继续满足 [BYOVPC network requirements](/langsmith/byoc-byovpc#meet-the-network-requirements)。

> **我可以使用自己的私人注册表吗？**
>
> 不是今天。容器映像是通过 VPC 终端节点从 LangChain AWS 账户中提取的。对私有注册中心的支持已列入路线图。> **控制平面如何到达我的 Kubernetes API 服务器？**
>
> Over AWS PrivateLink.管理路径仅公开集群的 Kubernetes API 服务器，LangChain 用于安装和协调 LangSmith 组件。
>
> EKS 集群是私有的：API 服务器端点没有公共访问权限，工作节点没有公共 IP 地址。无法通过该连接访问您的数据，并且 LangChain 无法通过公共互联网访问您的环境。 See [Connectivity](/langsmith/byoc-architecture#connectivity).

> **如果我的数据平面位于美国境外，控制平面在哪里运行？**
>
> 无论您将数据平面放置在何处，控制平面都以`us-east-2` 运行。如果您在美国境外配置数据平面，您的敏感应用程序数据将保留在该地区，而控制平面元数据将保留在美国。 See [Regions and cloud providers](/langsmith/byoc#regions-and-cloud-providers).

## 数据平面和工作空间

> **组织、数据平面和工作空间如何关联？**
>
> 数据平面属于一个组织，工作空间只属于一个数据平面。使用数据平面进行数据的物理分离，使用工作空间进行数据平面内的逻辑分离。 See [Organizations, data planes, and workspaces](/langsmith/byoc-usage#organizations-data-planes-and-workspaces).> **Can I run more than one data plane?**
>
> 是的。一个组织可以拥有多个数据平面，每个数据平面都位于自己的 AWS 账户和区域中。
>
> 默认限制为每个组织五个数据平面。要部署更多内容，请联系 LangChain 团队。

> **一个组织可以同时拥有云和 BYOC 工作区吗？**
>
> 是的。 LangSmith 云上的工作区路由到 LangChain 管理的后端而不是数据平面，因此两者可以在同一组织中共存。这也意味着您可以从 AWS 云试用迁移到 BYOC，同时重复使用相同的组织、用户、角色和 SSO 配置。

## 操作

> **谁负责 BYOC 部署中的内容？**
>
> LangChain 运行控制平面并通过委派的最小权限访问管理数据平面基础设施。您拥有 AWS 账户、网络连接、数据平面中的数据以及账户内的安全监控。
>
> 有关平台和基础设施、数据和安全以及运营和支持的完整划分，请参阅[BYOC shared responsibility model](/langsmith/byoc-shared-responsibility)。> **Who upgrades LangSmith, and how often?**
>
> LangChain 每周升级一次数据平面中的 LangSmith 版本。升级是滚动进行的，因此不会出现整个服务停机的情况。 Istio 和 KEDA 等支持服务定期升级，LangChain 管理所有 EKS 集群升级。
>
> Support for release channels is coming soon.参见[Operations](/langsmith/byoc-operations)。

> **What about Kubernetes upgrades?**
>
> LangChain 在 AWS 支持终止日期之前主动拥有并执行 EKS 升级，并与您协调窗口。
>
> Control plane upgrades are transparent.节点组升级使用 make-before-break 语义逐个滚动节点，因此您可能会在 Pod 重新启动时看到短暂的连接重置，但不会丢失数据。参见[Kubernetes cluster upgrades](/langsmith/byoc-operations#kubernetes-cluster-upgrades)。

> **Do upgrades cause downtime?**
>
> 不会。服务运行由水平 Pod 自动缩放器调整大小的多个副本，并且 Pod 中断预算限制了同时不可用的副本数量，因此滚动更新和节点耗尽都不会导致服务低于其所需的容量。
>
> 可能导致停机的维护（例如重新启动 RDS 或 ElastiCache）发生在LangChain 提前与您协调的计划维护时段内。> **Who monitors the data plane?**
>
> LangChain operates the data plane after provisioning, including monitoring for uptime and error recovery, scaling, upgrades, and security patching.由于部署在您自己的帐户中运行，因此您已经操作的云控制也适用于它。

> **我可以为 LangSmith BYOC 设置自己的可观测性吗？**
>
> 是的。 You can install observability tooling such as collectors and agents into the EKS cluster, as long as it does not interfere with the operation of LangSmith.
>
> LangSmith 服务发出日志、指标和跟踪的方式与自托管相同，因此适用相同的配置。参见[Export LangSmith telemetry to your observability backend](/langsmith/export-backend)。

> **如何处理高可用性和灾难恢复？**
>
> 默认情况下，数据平面已配置为实现高可用性，跨单个区域内的多个可用区运行。 All stateful components are backed up.
>
> 数据平面不跨区域，因此整个区域丢失的恢复依赖于这些备份。参见[High availability](/langsmith/byoc-operations#high-availability)。> **如何处理备份？**
>
> 备份在您自己的帐户中运行：
>
> * **RDS**：每天进行备份。
> * **ClickHouse**：每天进行备份并存储在 S3 存储桶中。
> * **ElastiCache**：不进行备份，因为数据是短暂的。

> **LangChain 是否为 BYOC 数据平面提供正常运行时间 SLA？**
>
> 不会。数据平面在您的 AWS 账户中运行，因此其可用性取决于您控制的资源，包括账户本身、您配置用于访问数据平面的专用连接以及适用于账户的服务配额和策略。 LangChain 不承诺其不单独控制的基础设施的正常运行时间目标。
>
> LangChain 仍然监控数据平面的正常运行时间和错误恢复、扩展它并应用升级和安全补丁。参见[Operations](/langsmith/byoc-operations)。

## 成本

> **我可以使用 BYOC 支付什么费用？**
>
> 两份单独的账单：
>
> * **基础设施**：数据平面在您自己的 AWS 账户中运行，因此您拥有基础设施并通过云提供商账单支付费用。
> * **LangSmith**：由 LangChain 根据您的合同和使用情况开具发票。
>
> LangChain 提供与 AWS Marketplace 的集成。

## 特性和迁移> **哪些 LangSmith 功能适用于 BYOC？**
>
> 请参阅 [Available features](/langsmith/byoc#available-features) 了解当前支持的功能列表。

> **我可以将现有 LangSmith 实例迁移到 BYOC 吗？**
>
> 部分。可以复制用户、角色、数据集、实验、提示、注释队列配置、自动化规则、仪表板和队列资源。今天没有迁移痕迹。参见[Migrate to BYOC](/langsmith/byoc-migration)。

## 另请参阅

* [BYOC overview](/langsmith/byoc)
* [Why BYOC](/langsmith/byoc-why)
* [BYOC architecture](/langsmith/byoc-architecture)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-faq.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。