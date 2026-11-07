<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC architecture on Azure | https://docs.langchain.com/langsmith/byoc-architecture-azure -->

# Azure 上的 BYOC 架构

LangSmith BYOC 在您的 Azure 订阅中部署什么、数据平面如何连接到 LangChain 控制平面、LangSmith 获得的访问权限以及如何保护数据。

Azure 上的 BYOC 在 Azure 订阅的资源组中运行 LangSmith 数据平面，而 LangChain 在 `centralus` 中其自己的 Azure 环境中运行控制平面。您的跟踪数据保留在您的订阅中。本页面介绍了 LangSmith 部署的内容、流量如何流动、LangSmith 获得的访问权限以及如何保护您的数据。对于 AWS 上的 BYOC，请参阅 [BYOC architecture](/langsmith/byoc-architecture-aws)。

> [!注意]
>
> Azure 上的 BYOC 位于 [beta](/langsmith/release-stages)。资源和权限可能会在版本之间发生变化。此页面上的值是当前的默认值。

要设置数据平面，请遵循[BYOC onboarding on Azure](/langsmith/byoc-onboarding-azure)。

## 控制平面和数据平面|飞机|它在哪里运行 |它包含什么 |
| - | - | - |
| **控制平面** | LangChain 的 Azure 环境，`centralus`，位于 [azure.smith.langchain.com](https://azure.smith.langchain.com) |身份验证、组织和工作区配置、计费和使用元数据、LangSmith API 密钥以及静态前端资产 |
| **数据平面** |您选择的区域中的 Azure 订阅中的一个资源组 |跟踪、提示、数据集、评估器、实验、注释队列、代理部署、工作区机密和其他应用程序数据 |

![BYOC architecture diagram for Azure. The LangSmith UI and the client apps in your application VNet reach the data plane over VNet peering or a VPN gateway, which terminates at an internal load balancer. The load balancer feeds an Istio ingress in an AKS cluster in your Azure subscription, which routes to the LangSmith services that run the backend and SmithDB, and those services read and write Blob Storage, Azure PostgreSQL, and Azure Managed Redis. The LangChain cloud control plane in centralus holds Crossplane, on-call engineers, alerting, and the LangSmith control plane services. Crossplane reaches the AKS API with Entra ID for scaling and upgrades, the data plane sends auth and telemetry back over Private Link, and the control plane uses Entra ID workload identity to provision resources in your subscription.](https://mintcdn.com/langchain-5e9cc07a/HiBWiLuTxHfhLZqh/langsmith/images/byoc-architecture-azure.png?fit=max\&auto=format\&n=HiBWiLuTxHfhLZqh\&q=85\&s=54272d117dfa6d190ee105d21bcf3452)

数据平面的生命周期为：

1. 应用 LangSmith Terraform 模块，该模块创建资源组和 Key Vault，并为 LangSmith BYOC 应用程序提供资源组上的两个角色。
2. 使用 LangSmith API 创建数据平面。控制平面检查其访问权限，并将数据平面的引导密钥写入您的 Key Vault。
3. 控制平面在资源组中创建网络、AKS 集群、数据库和存储，然后在集群上安装 LangSmith。
4. 数据面向控制面汇报，状态变为`active`。
5. LangChain 升级、扩展和修复数据平面，直到将其删除。

## 部署什么LangSmith 创建资源组中的所有数据平面资源。 AKS 还创建节点资源组 `<name>-smith-aks-nodes` 并对其进行管理。

### 网络

LangSmith 从创建请求中的 `vpc_cidr` 范围创建 VNet，并将其划分为子网。对于 `/16` VNet：

|子网|尺寸|使用 |
| - | - | - |
| AKS | `/20` | AKS 节点和 Pod。出站流量通过具有一个静态公共 IP 地址的 NAT 网关。 |
|专用端点 | `/24` | PostgreSQL、Redis、Blob 存储、Key Vault 和 LangSmith 控制平面的共享专用端点。 |

专用终结点子网上的一个网络安全组使用三个应用程序安全组，仅允许来自 AKS 子网的流量：到 PostgreSQL 终结点的 TCP 5432、到 Redis 终结点的 TCP 10000 和 8500 到 8599，以及到 Blob 存储、Key Vault 和控制平面终结点的 TCP 443。

AKS 子网占用 VNet 的十六分之一，专用终结点子网占用 VNet 的 1/256。 `/18` VNet 提供`/22` AKS 子网和`/26` 专用端点子网。 Kubernetes 服务范围来自 VNet 外部：`10.240.0.0/16`，或 `192.168.0.0/16`（如果您的 VNet 与 `10.240.0.0/16` 重叠）。链接到 VNet 的私有 DNS 区域将 PostgreSQL、Redis、Key Vault 和 Blob 存储解析到其私有终结点。

### 计算

* **AKS**：标准层上的 Kubernetes 1.35。没有公共 API 端点的私有集群。本地帐户和运行命令被禁用。身份验证使用 Microsoft Entra ID 和 Azure RBAC 进行 Kubernetes 授权。 OIDC 颁发者和工作负载身份已启用。
* **网络插件**：Azure CNI 和 Cilium 用于数据路径和网络策略。
* **系统节点池**：Azure Linux 上的三个 `Standard_D2s_v6` 节点，分布在该区域的可用区中，为关键附加组件保留。
* **应用程序节点**：[Node auto-provisioning](https://learn.microsoft.com/azure/aks/node-autoprovision) 根据 Pod 需要添加和删除节点。它使用版本 5 或更高版本的按需 D、E 和 F 系列 VM。每个节点池都有 CPU 和内存限制。通用池限制为 100 个 vCPU 和 400 GiB 内存。 SmithDB 在自己的池上运行，包括具有本地 NVMe 磁盘作为缓存的虚拟机池。
* **升级**：AKS 在数据平面的 [maintenance window](/langsmith/byoc-onboarding-azure#change-data-plane-settings) 中自动应用 Kubernetes 补丁版本和节点映像更新。

### 数据存储|商店 |配置|
| - | - |
| **PostgreSQL** (LangSmith) | Azure Database for PostgreSQL 灵活服务器、PostgreSQL 18、`GP_Standard_D2ds_v4`、具有自动增长功能的 32 GiB 存储。支持区域冗余高可用性的区域。备份保留7天，无异地冗余备份。仅 Microsoft Entra 身份验证，无密码身份验证，无公共访问。 |
| **PostgreSQL**（SmithDB 元存储）|第二个灵活的服务器，PostgreSQL 18，`GP_Standard_D2ds_v4`，128 GiB 存储。相同的可用性、备份和访问设置。 |
| **Azure 托管 Redis** | `Balanced_B3` 高可用，OSS集群策略，无持久化。仅 TLS，禁用访问密钥，无公共访问。 |
| **Blob 存储** |跟踪负载和附件以及 SmithDB 数据的存储帐户。 StorageV2、标准、有可用区的区域为 ZRS，其他区域为 LRS。仅支持 TLS 1.2 或更高版本的 HTTPS。共享密钥访问和公共网络访问被禁用。 |
| **密钥库** |您创建的保管库。数据平面通过专用端点读取其引导密钥，并每小时刷新一次。 |数据平面在[SmithDB](/langsmith/self-host-smithdb)中存储和查询跟踪，其数据在Blob存储中，其元数据在SmithDB PostgreSQL服务器中。他们不运行 ClickHouse。

### DNS 和入口

* **主机名**：`<data_plane_id>.azure.langchain-byoc.com`。 LangSmith 为资源组中的主机名创建公共 DNS 区域，并将其从 LangChain 拥有的父区域委托。
* **负载均衡器**：Azure 标准负载均衡器，公共或内部，由创建请求中的 `public_load_balancer` 设置。
* **私有 DNS**：对于内部负载均衡器，主机名通过链接到数据平面 VNet 的私有 DNS 区域进行解析。公共区域保存证书验证记录，而不是内部端点地址。您的用户和应用程序需要通过私有区域进行 DNS 解析。
* **Ingress**：Istio 入口网关。 HTTP重定向到HTTPS，网关拒绝`TRACE`、`TRACK`和`CONNECT`方法。
* **TLS**：证书管理器通过 DNS-01 质询获取主机名的 Let's Encrypt 证书。

### 身份数据平面工作负载通过与 AKS OIDC 颁发者的工作负载身份联合，使用资源组中用户分配的托管身份。不存在存储密钥、数据库密码或客户端机密。每个身份仅具有其工作负载所需的角色，例如 Blob 容器上的数据角色、PostgreSQL 数据库角色或保管库上的`Key Vault Secrets User`。

## 连接性

|路径|网络|认证|
| - | - | - |
| Azure 资源管理器的控制平面 | HTTPS 到公共 Azure 资源管理器端点 |租户中LangSmith BYOC 应用程序的 Microsoft Entra 令牌 |
| AKS API 的控制平面 |私人链接。 LangChain 控制平面网络中的专用端点连接到集群的 API 服务器。 AKS API 没有公共端点。 | Microsoft Entra 令牌和 Azure RBAC |
|数据平面到控制平面|私人链接。数据平面的共享专用端点子网中的专用端点连接到 LangSmith 控制平面。资源组中的私有 DNS 区域将 LangSmith API 和遥测主机名解析到它。 |数据平面令牌 ||您的用户和应用程序到数据平面|公共或内部负载均衡器 | LangSmith API 密钥和通过控制平面登录 |

数据平面通过 NAT 网关从 LangChain 的容器注册表中提取 LangSmith 容器镜像。

数据平面将操作数据发送到控制平面，例如身份验证请求、运行状况指标和使用情况。与在 AWS 上一样，LangSmith UI 从控制平面加载静态资产，并将应用程序数据的每个请求发送到数据平面。参见[Data traffic](/langsmith/byoc-architecture-aws#data-traffic)。

## 访问和权限

LangChain 通过一个多租户 Microsoft Entra 应用程序 **LangSmith BYOC** 管理您的数据平面。您将其服务主体添加到您的租户，并为其赋予每个数据平面资源组上的角色。应用程序不请求任何 Microsoft Graph 权限。

控制平面不保存您的租户的存储凭据。它在 AKS 上运行，工作负载身份联合将 pod 令牌交换为租户中的 LangSmith BYOC 应用程序的令牌。只有提供和管理数据平面的控制平面服务才能获得该令牌。

### 角色分配|角色 |范围 |为什么LangSmith需要它 |
| - | - | - |
| `langsmith-byoc-<key>-<suffix>`（定制）|数据平面资源组|创建、更新和删除数据平面资源，将引导密钥写入 Key Vault，并批准 AKS API 和数据存储的专用终结点。该角色为其允许的每个操作命名。 |
|与 `reduced_access = true` 相同的自定义角色 |数据平面资源组|数据平面处于活动状态后，减少角色操作。升级、扩展和修复数据平面，但无法删除它、其数据存储或其网络，也无法创建角色分配。 |
| `User Access Administrator` |数据平面资源组|为数据平面的托管标识分配角色，并创建自定义 Blob 数据角色。当您设置 `reduced_access = true` 时，Terraform 会删除此分配。 |
| `Azure Kubernetes Service RBAC Cluster Admin` |数据平面的 AKS 集群 |在集群上安装并升级LangSmith。 LangSmith 自行创建此角色分配。 |[Terraform module](https://github.com/langchain-ai/terraform/blob/main/modules/byoc/azure/langsmith-byoc-access/main.tf)为每个数据平面创建一个自定义角色，并将资源组作为其唯一的可分配范围。这两个角色分配都将您组织的外部 ID 作为其描述。当它们不匹配时，LangSmith 拒绝创建数据平面，这会将资源组绑定到您的 LangSmith 组织。

### LangChain 可以访问什么，不能访问什么

|项目 | LangChain 访问 |
| - | - |
|数据平面资源组中的资源 |创建、更改和删除 |
|数据平面资源组中的角色分配 |创建和删除 |
|数据平面的 AKS 集群 |集群管理|
|您订阅中的其他资源组和资源 |无 |
| AKS 节点资源组 |没有任何。 AKS 可以管理它。 |
|您的 Microsoft Entra 目录和 Microsoft Graph |无 |
| Blob 存储、PostgreSQL 和 Redis 中的数据 |无数据角色。在您设置`reduced_access = true`之前，`User Access Administrator`可以授予一个。您的活动日志记录每个角色分配。 |
| Key Vault 秘密值 |通过 Azure 资源管理器编写。没有读取机密的角色。 |

要删除 LangSmith 的访问权限，请参阅 [Remove LangSmith access](/langsmith/byoc-onboarding-azure#remove-langsmith-access)。

## 数据保护

### 加密|商店 |休息时|运输途中 |
| - | - | - |
| Blob 存储 | Microsoft 管理的密钥 |仅 HTTPS、TLS 1.2 或更高版本 |
| PostgreSQL | Microsoft 管理的密钥 | TLS，采用 Microsoft Entra 身份验证 |
| Redis | Microsoft 管理的密钥 |仅 TLS |
|密钥库 | Microsoft 管理的密钥 | TLS，通过专用端点 |
| AKS 磁盘 | Microsoft 管理的密钥 |流量停留在集群中 |

### 保留

* **跟踪有效负载**：Blob 生命周期规则会在其保留层结束时删除每个对象。短期跟踪的默认值为 14 天，长期跟踪的默认值为 400 天。您可以使用 `ttl` 设置更改两者。参见[Change data plane settings](/langsmith/byoc-onboarding-azure#change-data-plane-settings)。
* **Blob 版本**：启用版本控制，以前的版本将在创建 7 天后删除。删除的容器可以在 7 天内恢复。 Blob 软删除已禁用，因此过期的跟踪不会超过其保留层的寿命。
* **PostgreSQL**：自动备份在同一区域保留 7 天。
* **Redis**：没有持久性，也没有备份。 Redis 仅保存短暂的数据。

### 删除删除数据平面时，LangSmith 会删除 AKS 集群、PostgreSQL、Redis 和网络资源。它保留您的资源组、Key Vault 以及保存跟踪和 SmithDB 数据的 Blob 存储帐户。详情请参见[Delete a data plane](/langsmith/byoc-onboarding-azure#delete-a-data-plane)。

## 扩展和操作

LangChain 在配置后操作您的 Azure 数据平面。请参阅 [BYOC operations on Azure](/langsmith/byoc-operations-azure) 了解自动扩展、默认实例大小、升级和维护时段。有关估计的基础设施成本，请参阅[Azure data plane cost estimate](/langsmith/byoc-data-plane-cost-azure)。

### 日志

您的 Azure 活动日志记录对 Azure 资源管理器的 LangSmith 调用。要收集资源和网络日志，请在订阅中配置诊断设置和 VNet 流日志。有关可用日志和您的责任，请参阅[Auditing](/langsmith/byoc-operations-azure#auditing)。

## 另请参阅

* [BYOC overview](/langsmith/byoc)
* [BYOC onboarding on Azure](/langsmith/byoc-onboarding-azure)
* [BYOC shared responsibility model](/langsmith/byoc-shared-responsibility)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-architecture-azure.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。