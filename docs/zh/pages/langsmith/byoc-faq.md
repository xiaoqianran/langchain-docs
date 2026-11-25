<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC FAQ | https://docs.langchain.com/langsmith/byoc-faq -->

# 自带设备常见问题解答

有关 LangSmith BYOC 的常见问题解答，涵盖数据驻留、访问、设置、数据平面模型和持续操作。

## 设置

> [手风琴] 我可以部署到哪些云和区域？
>
> BYOC 在具有美国控制平面的 AWS 上普遍可用 (GA)。 GCP 和 Azure 上的 BYOC 在 [beta](/langsmith/release-stages) 中可用。请参阅 [Regions and cloud providers](/langsmith/byoc#regions-and-cloud-providers) 了解受支持的 AWS 区域以及 GCP 和 Azure 区域的可用性。

> [手风琴] BYOC 是否支持政府云区域或符合 FIPS 的映像？
>
> 不可以。BYOC 不支持政府云区域，例如 AWS GovCloud（美国），也不提供符合 FIPS 的容器映像。

> [手风琴] 一个云上的控制平面可以管理另一个云上的数据平面吗？
>
> 否。不支持跨云部署。数据平面必须与其控制平面运行在同一云提供商上。例如，AWS 控制平面无法管理 GCP 上的数据平面。
>
> 每个云提供商都有自己的 LangSmith 实例，具有独立的用户和组织。要在多个云提供商上部署数据平面，请在每个提供商的实例上创建一个 LangSmith 组织。有关实例 URL，请参阅 [Regions and cloud providers](/langsmith/byoc#regions-and-cloud-providers)。> [手风琴] 我需要专用的云帐户吗？
>
> 不，但建议：
>
> * **AWS**：LangChain 建议使用新帐户以实现更清晰的计费，并且因为某些权限无法限定于特定资源。
> * **GCP**：使用仅包含 LangSmith 资源的项目。如果项目还拥有其他资源，请在 Terraform 模块中设置 `byo_iam = true`。参见[Before you start on GCP](/langsmith/byoc-onboarding-gcp#before-you-start)。
> * **Azure**：建议专用订阅。每个数据平面都在其自己的资源组中运行。参见[Before you start on Azure](/langsmith/byoc-onboarding-azure#before-you-start)。

> [accordion] 我可以将 BYOC 安装到现有 VPC 中吗？
>
> 在 AWS 上，是的。使用 [Bring your own VPC (BYOVPC)](/langsmith/byoc-byovpc-aws)，您可以提供 VPC 和子网。您可以使用[reference Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/byovpc)创建VPC，也可以使用现有的符合网络要求的VPC。
>
> 要从客户角色中删除 VPC 创建权限，请在 [⟦T2⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role) 中设置 `allow_vpc_creation_permissions = false`，并在 `vpc_ids` 中包含您的 VPC ID。
>
> 在 GCP 和 Azure 上，LangSmith 创建数据平面网络、GCP 上的 VPC 和 Azure 上的 VNet。> [手风琴] 我可以在同一个VPC中部署多个数据平面吗？
>
> 在 AWS 上，是的。在同一个VPC中部署多个数据平面需要[Bring your own VPC (BYOVPC)](/langsmith/byoc-byovpc-aws)。每个数据平面必须使用不同的子网。不要在数据平面之间共享子网。
>
> 在 GCP 和 Azure 上，LangSmith 为每个数据平面创建单独的网络。

> [accordion] 我可以将现有数据平面移至我自己的 VPC 中吗？
>
> 不可以。不支持将现有数据平面移动到不同的 VPC，也不支持在创建后更改其 VPC 和子网配置。

> [accordion] 我可以将 BYOC 安装到现有的 Kubernetes 集群中吗？
>
> 不，并且没有计划支持它。 LangChain 代表您操作集群，包括升级和修补，专用集群使可靠的管理成为可能。> [accordion] 我可以在 LangSmith 网络或集群中运行自己的工作负载吗？
>
> 是的，只要它们不干扰 LangSmith 的功能即可。
>
> 在您的云帐户中，请记住，在 AWS 和 GCP 上，LangChain 持有的某些权限不能仅适用于 LangSmith 资源，这就是建议使用专用帐户或项目的原因。参见[Do I need a dedicated cloud account?](#do-i-need-a-dedicated-cloud-account)
>
> 在 Kubernetes 集群中，不干扰LangSmith的被动工作负载就可以，例如可观察性和安全监控代理。当您部署它们时：
>
> * 使用您自己的节点组和容忍度，而不是运行 LangSmith 的节点组和容忍度。
> * 部署到 LangSmith 使用的命名空间之外的命名空间中。
> * 请勿编辑资源LangChain条款。
>
> LangChain 对干扰工作负载引起的停机或问题不承担任何责任。> [accordion] 我应该使用什么值作为外部 ID？
>
> LangChain 提供外部ID。导航到 **设置 > 数据平面**，然后使用 **数据平面** 标题旁边的复制按钮进行复制。不创造自己的价值。将其传递给您的云的 Terraform 模块：
>
> * **AWS**：应用 `langsmith-byoc-role` Terraform 模块时使用它。角色的信任策略必须在其 `ExternalId` 条件下使用此值。
> * **GCP**：`langsmith-byoc-service-account` Terraform 模块将其设置为配置者服务帐户的描述。参见[Checks at create](/langsmith/byoc-architecture-gcp#checks-at-create)。
> * **Azure**：Terraform 模块将其设置为资源组上LangSmith 角色分配的描述。参见[Role assignments](/langsmith/byoc-architecture-azure#role-assignments)。

> [手风琴] 配置需要多长时间？
>
> 在所有云上，数据平面的端到端配置大约需要 60 到 90 分钟。如果配置遇到问题，数据平面将转换到`Provisioning Failed`。请参阅下一个问题。> [accordion] 如果配置失败会发生什么？
>
> 数据平面转换至`Provisioning Failed`。
>
> 在所有云上，LangSmith 在配置开始之前检查其访问权限，并在检查失败时返回错误。参见[Troubleshoot create errors on GCP](/langsmith/byoc-onboarding-gcp#troubleshoot-create-errors)和[Troubleshoot data plane creation on Azure](/langsmith/byoc-onboarding-azure#troubleshoot-data-plane-creation)。
>
> 在 AWS 上，失败通常是由于缺少跨账户角色的权限或由于服务控制策略 (SCP) 阻止LangChain 需要执行的操作而导致。完全按照发布的方式应用 [⟦T9⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role)，无需任何编辑或更改。修改的模块是缺少权限的常见原因。更正权限后，配置会自动协调。
>
> 如果在任何云上配置失败，请联系 LangChain 团队。

> [手风琴] 我应该为数据平面网络使用什么 CIDR 范围？
>
> 私有 RFC 1918 范围介于 `/18` 和 `/16` 之间。如果您计划使用网络对等互连，请选择一个与您要进行对等互连的网络不重叠的范围。 CIDR 范围在配置后无法更改。

> [accordion] 如何通过专用端点访问数据平面？
>
> 您需要专用连接，例如网络对等互连、VPN 或 Tailscale。有关每个云上的选项，请参阅[Find your data plane endpoint](/langsmith/byoc-usage#find-your-data-plane-endpoint)。> [手风琴] 为什么 LangSmith 说我可能无法通过网络访问此工作区？
>
> 您的机器无法到达保存工作空间的数据平面。浏览器加载LangSmith UI后，它会直接向您的数据平面发送数据请求。使用专用端点，这些请求只能从可以到达数据平面网络的网络成功。
>
> ![LangSmith error screen titled You may not have network access to this workspace. It states that LangSmith cannot reach the data plane for the selected workspace and lists other workspaces grouped by data plane. Reachable data planes show a green header with active Switch buttons. The unreachable data plane shows a red header with disabled Switch buttons.](https://mintcdn.com/langchain-5e9cc07a/a_vO91vE4oZRWYyY/langsmith/images/byoc-data-plane-unreachable.png?fit=max\&auto=format\&n=a_vO91vE4oZRWYyY\&q=85\&s=881f94a84e295064162e8673517245fd)
>
> 屏幕按数据平面对您的工作区进行分组。绿色标题标记浏览器可以访问的数据平面，红色标题标记浏览器无法访问的数据平面。
>
> 修复方法：
>
> 1. 连接到与数据平面具有专用连接的网络。如果您的组织使用企业 VPN，请要求您的 IT 团队通过它路由数据平面的端点。
> 2. 在 Chrome 或 Edge 中，检查是否允许 LangSmith 站点访问本地网络。如果没有它，浏览器甚至会阻止来自您的专用网络的对数据平面的请求。参见[Allow local network access in Chrome and Edge](/langsmith/byoc-usage#allow-local-network-access-in-chrome-and-edge)。
> 3.刷新页面。
>
> 要同时继续工作，请选择可访问数据平面上工作区旁边的 **Switch**。欲了解更多信息，请参阅[Find your data plane endpoint](/langsmith/byoc-usage#find-your-data-plane-endpoint)。> [accordion] 我的服务端点是否暴露在互联网上？
>
> 默认情况下不是。在每个云上，服务默认位于私有负载均衡器后面，只能从数据平面网络内部或通过您配置的私有连接进行访问。
>
> 您可以在创建数据平面时选择公共端点。请参阅 [Create the data plane on AWS](/langsmith/byoc-onboarding-aws#create-the-data-plane)、[Choose a public or internal endpoint on GCP](/langsmith/byoc-onboarding-gcp#choose-a-public-or-internal-endpoint) 和 [BYOC onboarding on Azure](/langsmith/byoc-onboarding-azure#create-a-data-plane)，其中 `public_load_balancer` 设置它。

> [accordion] 我可以使用自己的 DNS 域吗？
>
> 不需要。数据平面是在标准 LangChain BYOC 域下配置的。在 **设置 > 数据平面** 下找到您的数据平面 API URL。> [手风琴] 如何停用数据平面？
>
> 在删除 LangChain 的访问权限之前删除 LangSmith 中的数据平面，因为 LangSmith 需要该访问权限来删除资源：
>
> * **AWS**：使用 `allow_delete_permissions = true` 重新应用 [⟦T13⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role)，这将授予删除 LangSmith 托管资源所需的权限。然后在 LangSmith UI 中选择 **删除数据平面**。 LangChain 取消配置您帐户中的基础设施。
> * **GCP**：使用 API 删除数据平面，如果没有其他数据平面使用该项目，则运行 `terraform destroy`。参见[Delete a data plane on GCP](/langsmith/byoc-onboarding-gcp#delete-a-data-plane)。
> * **Azure**：如果您设置了`reduced_access = true`，请先将其设置回`false`。然后在 LangSmith UI 中或使用 API 删除数据平面。参见[Delete a data plane on Azure](/langsmith/byoc-onboarding-azure#delete-a-data-plane)。
>
> 在 GCP 和 Azure 上，删除会将跟踪数据保留在您的帐户中。

## 数据和安全

> [手风琴] 敏感数据是否会离开我的云环境？
>
> 不会。当用户打开 LangSmith UI 时，浏览器会从 LangChain 的云端获取 UI 包。加载后，应用程序会将敏感数据的每个请求路由到您的数据平面。
>
> 请参阅 [Data traffic on AWS](/langsmith/byoc-architecture-aws#data-traffic)、[How traffic flows on GCP](/langsmith/byoc-architecture-gcp#how-traffic-flows) 和 [Connectivity on Azure](/langsmith/byoc-architecture-azure#connectivity)。> [手风琴] LangChain 团队可以在我的帐户中做什么？
>
> LangChain 可以管理LangSmith 创建的资源的基础设施。访问范围的确定方式取决于云：
>
> * **AWS**：只要 AWS 支持资源级范围界定，权限范围就由 `managed_by=langsmith` 标签和名称前缀确定。该角色不拥有授予数据访问的权限。参见[How least privilege is enforced](/langsmith/byoc-architecture-aws#how-least-privilege-is-enforced)。
> * **GCP**：大多数权限仅适用于名称以 `langsmith-` 开头的资源，或标记为 `managed_by: langsmith` 的 GKE 集群。有些覆盖整个项目。参见[What LangChain can and cannot access on GCP](/langsmith/byoc-architecture-gcp#what-langchain-can-and-cannot-access)。
> * **Azure**：角色的范围仅限于数据平面资源组及其 AKS 群集。 LangChain 没有数据角色，但在设置 `reduced_access = true` 之前，其 `User Access Administrator` 赋值可以授予数据角色。参见[What LangChain can and cannot access on Azure](/langsmith/byoc-architecture-azure#what-langchain-can-and-cannot-access)。> [手风琴] LangChain 可以读取我的痕迹或数据库内容吗？
>
> 不。LangChain 的访问是基础设施范围而不是数据范围。它可以管理保存数据的资源，但其角色没有读取数据的权限：
>
> * **AWS**：跨账户角色在跟踪存储桶上不持有 `s3:GetObject`，对于 PostgreSQL 不持有 `rds-db:connect`，对于 Redis 也不持有 `elasticache:Connect`。对数据本身的访问需要您明确授予。参见[How least privilege is enforced](/langsmith/byoc-architecture-aws#how-least-privilege-is-enforced)。
> * **GCP**：配置者在存储桶上没有`storage.objects.get`，没有`secretmanager.versions.access`，也没有数据库登录权限。这些是其角色的限制，而不是拒绝策略：它可以在`langsmith-`存储桶上设置IAM策略，并且在没有`byo_iam = true`的情况下，授予自己访问数据的项目角色。参见[What LangChain can and cannot access on GCP](/langsmith/byoc-architecture-gcp#what-langchain-can-and-cannot-access)。
> * **Azure**：LangChain 在 Blob 存储、PostgreSQL 或 Redis 上不具有数据角色，但在设置 `reduced_access = true` 之前，其 `User Access Administrator` 分配可以授予一个数据角色。参见[What LangChain can and cannot access on Azure](/langsmith/byoc-architecture-azure#what-langchain-can-and-cannot-access)。
>
> LangChain 在任何云上都没有常设数据访问权限。如果事件需要您的数据，LangChain 首先询问您。请参阅下一个问题。> [手风琴] LangChain 员工对我的环境和数据有什么访问权限？
>
> 没有固定的数据访问。如果事件需要访问您的数据，LangChain 要么要求您自己运行查询，要么请求打破玻璃访问。

> [手风琴] LangSmith 支持客户管理的加密密钥吗？
>
> 在 AWS 上，是的。创建数据平面时，您可以使用自己的 AWS KMS 密钥加密其 S3 存储桶、EBS 卷、EKS 密钥、RDS 数据库和 ElastiCache。参见[Bring your own keys](/langsmith/byoc-byok-aws)。
>
> 在每个云上，默认情况下使用云提供商管理的密钥对静态数据进行加密。在 Azure 上，所有数据存储都使用 Microsoft 管理的密钥。参见[Encryption on Azure](/langsmith/byoc-architecture-azure#encryption)。

> [手风琴] BYOC 会保留痕迹多久？
>
> BYOC 不受适用于 LangSmith 云的延长保留上限的限制。默认情况下，基本跟踪持续 14 天，扩展跟踪持续 400 天。您可以更改数据平面设置中的两个默认值。企业客户还可以缩短每个工作空间的延长时间。参见[Data retention](/langsmith/usage-and-billing#retention-periods)和[Customize extended retention policy](/langsmith/data-purging-compliance#customize-extended-retention-policy)。> [手风琴] 如何撤销LangChain的访问权限？
>
> 您创建并拥有 LangChain 在您的帐户中使用的访问权限，因此您可以在不涉及 LangChain 的情况下撤销它：
>
> * **AWS**：删除跨账户角色，或其与 LangChain 账户的信任关系。控制平面不能再承担它，并停止协调数据平面资源。
> * **GCP**：删除配置者上的令牌创建者绑定以及对 LangChain 控制平面服务帐户的授权。参见[Remove access on GCP](/langsmith/byoc-architecture-gcp#remove-access)。
> * **Azure**：删除 LangSmith 服务主体的角色分配。参见[Remove LangSmith access on Azure](/langsmith/byoc-onboarding-azure#remove-langsmith-access)。
>
> 撤销访问权限后，数据面资源仍保留在您的账户中，LangChain无法再升级或修复。

> [accordion] 我可以撤销配置期间授予的个人权限吗？
>
> 是的，但是LangChain需要其权限来持续协调数据平面，并管理、升级和扩展它。删除它们可能会破坏这些操作。
>
> 如果您需要删除特定权限，请先联系 LangChain 团队，以便审核更改。 LangChain 不对因未经审查而删除权限而导致的停机或问题负责。> [手风琴] LangChain 控制平面里有什么？
>
> 身份验证、组织和工作区配置、计费和使用元数据、哈希 API 密钥以及静态前端资产。
>
> 跟踪、提示、数据集、评估器、实验、见解运行、注释队列、代理部署和工作区秘密都位于您的数据平面中。

> [手风琴] 哪些数据会离开我的帐户？
>
> 仅运营数据。它通过私有连接而不是公共互联网进行传输，例如 AWS PrivateLink、GCP Private Service Connect 或 Azure Private Link：
>
> * **身份验证请求**：数据平面调用控制平面来验证请求、验证 API 密钥并解析角色和权限。
> * **配置**：从控制平面加载的组织和工作区配置。
> * **计费和使用元数据**。
> * **操作遥测**。
>
> 痕迹等敏感数据不会离开您的帐户。它仅从数据平面到达请求它的最终用户。参见[Does sensitive data ever leave my cloud environment?](#does-sensitive-data-ever-leave-my-cloud-environment)> [手风琴] 流量是否通过公共互联网传输？
>
> 这取决于云和路径。
>
> 在 AWS 上，没有：
>
> * **控制平面到数据平面**：所有通信都通过 AWS PrivateLink 双向传输。
> * **S3**：流量通过 VPC 终端节点传输，使用 HTTPS 加密。
> * **容器镜像**：通过 VPC 终端节点从 LangChain 账户拉取。
>
> 参见[Connectivity on AWS](/langsmith/byoc-architecture-aws#connectivity)。
>
> 在 GCP 上：
>
> * **数据平面到控制平面**：专用服务连接，无需互联网。
> * **控制平面到 GKE**：集群基于 DNS 的控制平面端点，它接受外部流量并需要 IAM 身份验证。
> * **Google API 和容器映像**：私有 Google 访问权限，可将流量保留在 Google 网络上。
>
> 参见 [How traffic flows on GCP](/langsmith/byoc-architecture-gcp#how-traffic-flows) 和 [Outbound traffic](/langsmith/byoc-networking-gcp#outbound-traffic)。
>
> 在 Azure 上：
>
> * **控制平面和数据平面**：专用链接，双向。 AKS API 没有公共端点。
> * **到 Azure 资源管理器的控制平面**：HTTPS 到公共 Azure 资源管理器终结点，使用 Microsoft Entra ID 进行身份验证。
> * **容器镜像**：通过 NAT 网关从 LangChain 的容器注册表中提取。
>
> 参见[Connectivity on Azure](/langsmith/byoc-architecture-azure#connectivity)。> [accordion] 我可以限制数据平面的出站网络流量吗？
>
> 在 AWS 上，是的。对于 LangChain 管理的 VPC，BYOC 支持控制数据平面出口的网络防火墙。请联系LangChain团队启用它。
>
> 启用后，防火墙默认拒绝所有出站流量。然后，您可以配置允许数据平面到达的目的地的允许列表：
>
> * **域**：完全限定的域名，例如模型提供程序 API 端点或公共 Docker 注册表。
> * **CIDR 范围**：IP 范围，例如内部服务或私有子网。
>
> 通过 BYOVPC，您可以管理自己的防火墙和出口控制。您的网络必须继续满足[BYOVPC network requirements](/langsmith/byoc-byovpc-aws#meet-the-network-requirements)。
>
> 在 GCP 和 Azure 上，网络防火墙设置不可用。在 GCP 上，出口通过具有静态 IP 地址的 Cloud NAT 离开，或者通过您的网络（如果您从中导入默认路由）离开，您可以在其中过滤它。参见[Outbound traffic on GCP](/langsmith/byoc-networking-gcp#outbound-traffic)。> [accordion] 我可以使用自己的私人注册表吗？
>
> 不是今天。容器镜像从 LangChain 的注册表中提取：在 AWS 上，通过 VPC 端点；在 GCP 上，通过 Private Google Access 来自 Artifact Registry；在 Azure 上，通过 NAT 网关。对私有注册中心的支持已列入路线图。

> [手风琴] 控制平面如何到达我的 Kubernetes API 服务器？
>
> LangChain 使用 Kubernetes API 服务器来安装和协调 LangSmith 组件。无法通过该连接访问您的数据。路径取决于云：
>
> * **AWS**：通过 AWS PrivateLink。管理路径仅公开集群的 Kubernetes API 服务器。 EKS 集群是私有的：API 服务器端点没有公共访问权限，工作节点没有公共 IP 地址。参见[Connectivity on AWS](/langsmith/byoc-architecture-aws#connectivity)。
> * **GCP**：通过 GKE 集群基于 DNS 的控制平面端点，这需要带有 `container.clusters.connect` 的 Google 令牌，然后是 Kubernetes RBAC。节点是私有的。参见[GKE and compute](/langsmith/byoc-architecture-gcp#gke-and-compute)。
> * **Azure**：通过专用链接，连接到没有公共 API 终结点的专用 AKS 群集，并使用 Microsoft Entra ID 和 Azure RBAC。参见[Connectivity on Azure](/langsmith/byoc-architecture-azure#connectivity)。> [手风琴] 如果我的数据平面位于美国境外，控制平面在哪里运行？
>
> 无论您将数据平面放置在何处，控制平面都在每个云的一个区域中运行：`us-east-2` 在 AWS 上、`us-central1` 在 GCP 上以及 `centralus` 在 Azure 上。如果您在美国境外配置数据平面，您的敏感应用程序数据将保留在该地区，而控制平面元数据将保留在美国。参见[Regions and cloud providers](/langsmith/byoc#regions-and-cloud-providers)。

## 数据平面和工作空间

> [手风琴] 组织、数据平面和工作空间如何关联？
>
> 数据平面属于一个组织，工作空间只属于一个数据平面。使用数据平面进行数据的物理分离，使用工作空间进行数据平面内的逻辑分离。参见[Organizations, data planes, and workspaces](/langsmith/byoc-usage#organizations-data-planes-and-workspaces)。

> [accordion] 我可以运行多个数据平面吗？
>
> 是的。一个组织可以拥有多个数据平面，跨同一云提供商的一个或多个云帐户和区域。
>
> 默认限制为每个组织五个数据平面。要部署更多内容，请联系 LangChain 团队。> [手风琴] 一个组织可以同时拥有云和 BYOC 工作区吗？
>
> 是的。 LangSmith 云上的工作区路由到 LangChain 管理的后端而不是数据平面，因此两者可以在同一组织中共存。这也意味着您可以从 AWS 云试用迁移到 BYOC，同时重复使用相同的组织、用户、角色和 SSO 配置。

## 操作

> [手风琴] BYOC 部署中谁负责什么？
>
> LangChain 通过委派的最小权限访问运行控制平面并管理数据平面基础设施。您拥有云帐户、网络连接、数据平面中的数据以及帐户内的安全监控。
>
> 有关平台和基础设施、数据和安全以及运营和支持的完整划分，请参阅[BYOC shared responsibility model](/langsmith/byoc-shared-responsibility)。

> [手风琴] 谁升级LangSmith，多久升级一次？
>
> LangChain 管理LangSmith 版本升级以及Istio、KEDA 等支持服务。在 AWS 上，LangChain 每天都会升级数据平面中的 LangSmith 版本。升级是滚动进行的，因此不会出现整个服务停机的情况。对于 Kubernetes，请参阅 [What about Kubernetes upgrades?](#what-about-kubernetes-upgrades)
>
> 对发布渠道的支持即将推出。参见[LangSmith upgrades on AWS](/langsmith/byoc-operations-aws#langsmith-upgrades)和[LangSmith upgrades on Azure](/langsmith/byoc-operations-azure#langsmith-upgrades)。> [手风琴] Kubernetes 升级怎么样？
>
> 在 AWS 上，LangChain 在 AWS 支持终止日期之前在数据平面的 [maintenance window](/langsmith/byoc-operations-aws#maintenance-window) 中主动拥有并执行 EKS 升级。控制平面升级是透明的。节点组升级使用 make-before-break 语义逐个滚动节点，因此您可能会在 Pod 重新启动时看到短暂的连接重置，但不会丢失数据。参见[Kubernetes cluster upgrades on AWS](/langsmith/byoc-operations-aws#kubernetes-cluster-upgrades)。
>
> 在 Azure 上，AKS 在维护时段自动应用 Kubernetes 补丁版本和节点映像更新。参见[Kubernetes cluster upgrades on Azure](/langsmith/byoc-operations-azure#kubernetes-cluster-upgrades)。
>
> 在GCP上，GKE集群运行在`REGULAR`发布通道上，节点自动升级。参见[GKE and compute](/langsmith/byoc-architecture-gcp#gke-and-compute)。> [手风琴] 升级会导致停机吗？
>
> 不会。服务运行由水平 Pod 自动缩放器调整大小的多个副本，并且 Pod 中断预算限制了同时不可用的副本数量。因此，滚动更新和节点耗尽都不会占用低于其所需容量的服务。
>
> 可能导致停机的维护（例如数据库重新启动）发生在数据平面的每周维护窗口中：
>
> * **AWS**：在 LangSmith UI 或 API 中设置窗口。参见[Maintenance window](/langsmith/byoc-operations-aws#maintenance-window)。
> * **Azure**：通过API设置窗口。参见[Maintenance window on Azure](/langsmith/byoc-operations-azure#maintenance-window)。
> * **GCP**：通过API设置窗口。参见[Change data plane settings](/langsmith/byoc-onboarding-gcp#change-data-plane-settings)。

> [手风琴] 谁监控数据平面？
>
> LangChain 在配置后操作数据平面，包括监控正常运行时间和错误恢复、扩展、升级和安全修补。由于部署在您自己的帐户中运行，因此您已经操作的云控制也适用于它。> [accordion] 我可以为 LangSmith BYOC 设置自己的可观察性吗？
>
> 是的。您可以在数据平面的 Kubernetes 集群中安装收集器、代理等可观察性工具，只要不干扰LangSmith的运行即可。
>
> LangSmith 服务发出日志、指标和跟踪的方式与自托管相同，因此适用相同的配置。参见[Export LangSmith telemetry to your observability backend](/langsmith/export-backend)。

> [手风琴] 高可用和容灾是如何处理的？
>
> 默认情况下，数据平面已配置为实现高可用性，跨单个区域内的多个可用区运行。数据库已备份。参见[How are backups handled?](#how-are-backups-handled)
>
> 数据平面不跨区域，因此整个区域丢失的恢复依赖于这些备份。参见[High availability on AWS](/langsmith/byoc-operations-aws#high-availability)和[High availability on Azure](/langsmith/byoc-operations-azure#high-availability)。> [手风琴] 如何处理备份？
>
> 备份在您自己的帐户中运行。在 AWS 上：
>
> * **RDS**：每天进行备份。
> * **SmithDB**：S3 中的对象存储保存持久跟踪数据。
> * **ClickHouse**：在仍然运行它的数据平面上，每天进行备份并存储在 S3 存储桶中。
> * **ElastiCache**：不进行备份，因为数据是短暂的。
>
> 在 GCP 上，Cloud SQL 保持自动备份和时间点恢复，Cloud Storage 保存持久的跟踪数据。参见[Storage on GCP](/langsmith/byoc-architecture-gcp#storage)。
>
> 在 Azure 上，PostgreSQL 自动备份保留 7 天，Blob 存储保存持久的跟踪数据。 Redis没有持久性，也没有备份。参见[Retention on Azure](/langsmith/byoc-architecture-azure#retention)。> [手风琴] LangChain 是否为 BYOC 数据平面提供正常运行时间 SLA？
>
> 不会。数据平面在您的云帐户中运行，因此其可用性取决于您控制的资源，包括帐户本身、您配置用于访问数据平面的专用连接以及适用于帐户的服务配额和策略。 LangChain 不承诺其不单独控制的基础设施的正常运行时间目标。
>
> LangChain 仍然监控数据平面的正常运行时间和错误恢复、扩展它并应用升级和安全补丁。请参阅 [AWS](/langsmith/byoc-operations-aws) 和 [Azure](/langsmith/byoc-operations-azure) 上的 BYOC 操作。

## 成本

> [手风琴] 我可以使用 BYOC 支付什么费用？
>
> 两份单独的账单：
>
> * **基础设施**：数据平面在您自己的云帐户中运行，因此您拥有基础设施并通过云提供商账单支付费用。
> * **LangSmith**：由 LangChain 根据您的合同和使用情况开具发票。
>
> 有关估算的基础设施成本，请参阅[AWS](/langsmith/byoc-data-plane-cost-aws)、[GCP](/langsmith/byoc-data-plane-cost-gcp) 和 [Azure](/langsmith/byoc-data-plane-cost-azure) 的数据平面成本估算。
>
> 在 AWS 上，LangChain 提供与 AWS Marketplace 的集成。参见[BYOC billing on AWS](/langsmith/byoc-billing-aws)。

## 特性和迁移> [手风琴] 哪些 LangSmith 功能适用于 BYOC？
>
> 请参阅 [Available features](/langsmith/byoc#available-features) 了解当前支持的功能列表。

> [accordion] 我可以将现有的 LangSmith 实例迁移到 BYOC 吗？
>
> 是的。可以复制用户、角色、数据集、实验、提示、注释队列配置、自动化规则、仪表板和队列资源。跟踪迁移仅在 AWS 上可用。联系LangChain团队安排。参见[Migrate to BYOC](/langsmith/byoc-migration)。

## 另请参阅

* [BYOC overview](/langsmith/byoc)
* [Why BYOC](/langsmith/byoc-why)
* [AWS](/langsmith/byoc-architecture-aws)、[GCP](/langsmith/byoc-architecture-gcp) 和 [Azure](/langsmith/byoc-architecture-azure) 上的 BYOC 架构

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-faq.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。