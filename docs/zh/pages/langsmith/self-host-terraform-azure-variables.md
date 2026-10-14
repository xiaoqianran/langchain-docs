<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Azure Terraform variables reference | https://docs.langchain.com/langsmith/self-host-terraform-azure-variables -->

# Azure Terraform 变量参考

Azure AKS 上自托管的 LangSmith 主要 Terraform 变量的参考。

您在[Azure Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/azure)中设置的输入变量的参考。首次填写 `terraform.tfvars` 或调整现有部署时使用它。对于此处未列出的命名覆盖和其他高级输入，请参阅[⟦T1⟧](https://github.com/langchain-ai/terraform/blob/main/modules/azure/infra/variables.tf)。

变量分为两类：

* **不敏感**（区域、大小、功能标志）：在 `infra/terraform.tfvars` 中设置。
* **敏感**（许可证密钥、PostgreSQL 密码）：使用 `make setup-env` 设置，将它们写入 `infra/secrets.auto.tfvars`（gitignored，由 Terraform 自动加载）。应用程序机密不是 Terraform 变量。 `make seed-secrets` 将它们写入 Azure Key Vault，如本页末尾的敏感变量部分所述。

端到端安装请参考[deploy guide](/langsmith/self-host-terraform-azure-deploy)。有关模块如何组合在一起的信息，请参阅[architecture reference](/langsmith/self-host-terraform-azure-architecture)。

＃＃ 核|变量|默认 |必填|描述 |
| - | - | - | - |
| `subscription_id` |无 |是的 |用于部署的 Azure 订阅 ID (GUID)。通过`az account show --query id -o tsv`获取它。 |
| `location` | `eastus` |没有|用于部署的 Azure 区域。 |
| `azure_environment` | `public` |没有| Azure 云：`public`（商业 Azure）或 `usgovernment`（Azure 政府）。设置两个云之间不同的提供程序环境以及 DNS 和 Blob 端点名称。覆盖`ARM_ENVIRONMENT`。 Azure 政府不提供 Azure 托管 Redis，因此 `usgovernment` 需要 `redis_source = "in-cluster"`。 |
| `name_prefix` | `""` |没有|此部署的名称，附加到每个资源名称并用作默认的 `environment` 标签。不带连字符书写：`prod` 给出 `langsmith-rg-prod`，或 `ls-rg-prod` 给出 `unique_resource_names = true`。小写字母和数字，用单个连字符分隔。空表示没有后缀。 |
| `unique_resource_names` | `false` |没有|使用防冲突命名方案（`ls-` 基础加上全局唯一名称上的每个订阅哈希）。每个`terraform.tfvars`模板集`true`。将其 `false` 保留在现有部署上：打开它会重命名每个资源，这会破坏并重新创建 PostgreSQL 和存储并丢失其数据。 || `name_suffix_salt` | `""` |没有|旋转计数器混合到全局唯一的 PostgreSQL、Redis、存储和 Key Vault 名称的哈希中。当早期部署仍保留这些名称时（例如软删除的 Key Vault），请更改它（`"2"`，然后`"3"`）。 `unique_resource_names = false` 时无效。在现有部署上更改它会重命名所有四个，这会破坏并重新创建 PostgreSQL 和存储并丢失其数据。 |
| `create_resource_group` | `true` |没有|创建资源组。将 `false` 设置为部署到由 `existing_resource_group_name` 命名的现有组中，因此部署者仅需要该组的权限。 Terraform 保持组的标签、锁和策略分配不变，并且 `terraform destroy` 使组保持原样。 |
| `existing_resource_group_name` | `""` |当 `!create_resource_group` |要部署到的现有资源组的名称。 |
| `environment` | `""` |没有|所有资源上的 `environment` 标签的值。空用`name_prefix`。仅当标签需要与部署名称不同时才设置它。 |
| `owner` | `""` |没有|资源所有者的电子邮件或团队名称。作为标签应用。 |
| `cost_center` | `""` |没有|成本中心或帐单代码。作为标签应用。 |`name_prefix` 取代 `identifier`。仍然设置 `identifier` 的 `terraform.tfvars` 使计划失败。重命名该变量并删除前导连字符：`identifier = "-prod"` 变为`name_prefix = "prod"`。资源名称不会更改。

## 网络

|变量|默认 |必填|描述 |
| - | - | - | - |
| `create_vnet` | `true` |没有|创建新的 VNet。设置 `false` 以自带 VNet。 |
| `vnet_address_space` | `["10.0.0.0/17"]` |没有| VNet Terraform 创建的地址空间。 `create_vnet = false` 时被忽略。选择一个不与您对等或通过 ExpressRoute 或 VPN 到达的任何网络重叠的范围。移动它意味着也移动子网前缀，因为它们的默认值位于`10.0.0.0/17`内。计划拒绝此空间之外的子网前缀。 |
| `vnet_id` | `""` |当`!create_vnet` |现有 VNet 资源 ID。 Terraform 创建的任何子网都位于此 VNet 的资源组中。 |
| `aks_subnet_id` | `""` |当`!create_cluster` | AKS 群集的现有子网 ID。空在 `vnet_id` 中创建子网。现有子网必须承载`Microsoft.Storage`和`Microsoft.KeyVault`服务端点，用于计划检查。设置 `manage_byo_subnet_service_endpoints = true` 让 Terraform 添加它们。对于`keyvault_private_endpoint_enabled = true`，仅需要`Microsoft.Storage`。 || `postgres_subnet_id` | `""` |没有| PostgreSQL 服务器的现有子网 ID。 Empty 在 `vnet_id` 中创建子网。现有子网必须委托给`Microsoft.DBforPostgreSQL/flexibleServers`并且不持有其他资源。 |
| `redis_subnet_id` | `""` |没有| Redis 专用端点的现有子网 ID。空在 `vnet_id` 中创建子网。不得委派子网。 |
| `agic_subnet_id` | `""` |当 `agic` 和 `!create_vnet` |应用程序网关的现有子网 ID。 Terraform 不会在它不拥有的 VNet 中创建此子网。该子网必须是专用的并委托给`Microsoft.Network/applicationGateways`。 |
| `bastion_subnet_id` | `""` |当 `create_bastion` 和 `!create_vnet` | Azure Bastion 的现有子网 ID。 Azure 需要名称 `AzureBastionSubnet` 和 `/26` 或更大的范围。 |
| `postgres_subnet_address_prefix` | `["10.0.32.0/20"]` |没有| PostgreSQL 子网的 CIDR 前缀。可以是不相交的范围。对于 `create_vnet = false`，它必须位于 VNet 的地址空间内。 |
| `redis_subnet_address_prefix` | `["10.0.48.0/20"]` |没有| Redis 子网的 CIDR 前缀。可以是不相交的范围。对于 `create_vnet = false`，它必须位于 VNet 的地址空间内。 || `aks_authorized_ip_ranges` | `[]` |没有|允许外部 CIDR 访问 AKS API 服务器。空使得 API 服务器可公开访问，因此 Terraform 驱动的 Helm 和 `kubectl` 步骤可以从任何应用主机工作。填充用于生产的操作员和 CI 出口 CIDR。不能与`aks_private_cluster_enabled`组合使用。 |
| `aks_outbound_type` | `loadBalancer` |没有|节点如何访问互联网。 `loadBalancer` 在 AKS 管理的负载均衡器上使用出站公共 IP。 `userDefinedRouting` 通过 `aks_subnet_id` 上的路由表将出口发送到防火墙、网络虚拟设备或本地网络； `0.0.0.0/0` 路由必须具有下一跳 `VirtualAppliance` 或 `VirtualNetworkGateway`。 `userAssignedNATGateway` 通过 `aks_subnet_id` 上的 NAT 网关发送出口。两种自定义类型都需要 `create_vnet = false`、提供的 `aks_subnet_id` 以及 Terraform 创建的集群。计划检查子网。 |
| `aks_nat_gateway` | `none` |当`userAssignedNATGateway` | `aks_subnet_id` 上的 NAT 网关：`none`、`existing`（计划检查是否已连接）或 `create`（Terraform 创建标准 NAT 网关和公共 IP 并将它们与子网关联）。需要将`aks_outbound_type`设置为`userAssignedNATGateway`或`userDefinedRouting`。 `aks_nat_gateway_public_ip` 输出给出了创建的 IP。 |
| `aks_nat_gateway_idle_timeout_minutes` | `4` |没有| `aks_nat_gateway = "create"`使NAT网关的TCP空闲超时，4到120分钟。 || `aks_allow_outbound_type_change` | `false` |没有|允许在现有集群上更改`aks_outbound_type`。此更改会移动集群的出口 IP 并删除现有连接，因此请更新防火墙规则和命名旧 IP 的`aks_authorized_ip_ranges`。 |

## AKS

|变量|默认 |必填|描述 |
| - | - | - | - |
| `create_cluster` | `true` |没有|创建新的 AKS 群集。设置 `false` 以附加到现有集群，这还需要 `create_vnet = false` 和 `aks_subnet_id`。 `istio-addon` 进入需要`true`。 |
| `existing_cluster_name` | `""` |当 `!create_cluster` |要附加到的现有 AKS 群集的名称。 |
| `existing_cluster_resource_group_name` | `""` |当 `!create_cluster` |保存现有 AKS 群集的资源组。 |
| `aks_kube_auth` | `auto` |没有| Terraform 的 Kubernetes 和 Helm 提供程序如何登录集群：`auto`、`entra` 或 `certificate`。当集群具有 Entra ID 集成时，`auto` 通过 kubelogin 使用 Microsoft Entra ID，否则使用客户端证书。 Entra 登录需要在 `PATH` 和具有集群管理员权限的 `az login` 上登录 kubelogin。 || `aks_private_cluster_enabled` | `false` |没有|为 API 服务器提供集群 VNet 中的专用终结点，而不是公共地址。然后，应用主机需要到该终结点的网络路径，例如跳转主机、VPN 或对等 VNet 中的运行程序，以及解析专用区域的 DNS。不能与`aks_authorized_ip_ranges`组合使用。在第一个 apply: plan 之前设置：计划拒绝对现有集群进行更改。 |
| `aks_private_dns_zone_id` | `""` |没有|私有 API 服务器的私有 DNS 区域。空或 `System`：AKS 在节点资源组中创建区域。 `None`：AKS 不创建私有区域，并且模块打开公共 FQDN，这是 Azure 需要的`None`。然后，API 服务器名称通过公共 DNS 解析为其私有 IP，因此节点和运营商 DNS 必须解析公共名称。 v0.17.0 未开启公共 FQDN；后来的 `v0.17.*` 标签添加了它。区域资源 ID：AKS 在该区域中注册 API 服务器，这需要 `aks_control_plane_identity = "user"`。需要`aks_private_cluster_enabled = true`。在第一次应用之前设置。 || `aks_entra_only` | `false` |没有| Entra ID 与 Azure RBAC 集成以进行 Kubernetes 授权，并禁用本地帐户。然后，Terraform 的提供程序通过 kubelogin 以 `az` 身份登录，这需要通过 `aks_entra_admin_group_object_ids` 进行集群管理员或 Azure Kubernetes 服务 RBAC 集群管理员角色。不能与`aks_kube_auth = "certificate"`组合使用。 Azure 无法关闭 Entra 集成，因此计划在拥有它的集群上拒绝 `false`。要为现有集群打开它，请单独应用该更改：同一应用中的 Helm 或 Kubernetes 更改失败并显示 401。
| `aks_entra_admin_group_object_ids` | `[]` |没有|授予 cluster-admin 的 Entra 组的对象 ID。需要`aks_entra_only = true`。 |
| `aks_control_plane_identity` | `system` |没有|控制平面运行的身份。 `system`：系统分配的标识，仅在集群存在时存在。 `user`：用户分配的身份，`aks_control_plane_identity_id` 或`<cluster_name>-control-plane`，Terraform 在部署资源组中创建。在第一个 apply: plan 之前设置：计划拒绝对现有集群进行更改。 |
| `aks_control_plane_identity_id` | `""` |当赠款不受管理时|控制平面的现有用户分配标识的资源 ID。需要`aks_control_plane_identity = "user"`。当 `aks_control_plane_identity_manage_grants` 解析为 `false` 时需要。在第一次应用之前设置。 || `aks_control_plane_identity_manage_grants` | `null` |没有| Terraform 是否授予 AKS 子网上的用户分配身份 Network Contributor，以及 VNet 上的 Network Contributor 和区域上的专用 DNS 区域 Contributor（区域 ID 为 `aks_private_dns_zone_id`）。 `null` 遵循 `create_vnet`，因此 Terraform 在其创建的 VNet 上进行授权，并将提供的 VNet 的授权留给其所有者。使用 `false`，计划会检查授权并无法为每个缺失的授权命名主体 ID 和 `az role assignment create` 命令。需要`aks_control_plane_identity = "user"`。参见[PERMISSIONS.md](https://github.com/langchain-ai/terraform/blob/main/modules/azure/PERMISSIONS.md#control-plane-identity-grants)。 |
| `install_cert_manager` | `true` |没有|安装证书管理器。当现有集群已经运行它时设置 `false`，因为 Helm 不会采用它不拥有的版本。 `tls_certificate_source = "dns01"` 需要 `true`。 |
| `install_keda` | `true` |没有|安装 KEDA，它可以扩展 Redis 队列深度上的 LangSmith 队列工作线程。当现有集群已经运行它时，设置`false`。 |
| `aks_sku_tier` | `Standard` |没有| AKS 控制平面层：`Free`（无 SLA）、`Standard`（正常运行时间 SLA）或 `Premium`（允许通过 `aks_support_plan = "AKSLongTermSupport"` 提供长期 Kubernetes 版本支持）。更新到位。 |
| `aks_kubernetes_version` | `1.35` |没有| AKS 集群的 Kubernetes 版本。使用您所在区域支持 `KubernetesOfficial` 的版本，因为 Azure 将较旧的次要版本移至仅限 LTS。 || `aks_network_mode` | `node-subnet` |没有| Azure CNI IP 地址模式：`overlay` 或 `node-subnet`。每个 `terraform.tfvars` 模板都会设置 `overlay`（Microsoft 的建议），其中 Pod 从 `aks_pod_cidr` 获取地址，AKS 子网仅包含节点。默认情况下保持现有集群不变。修复了集群创建时的问题。 |
| `aks_pod_cidr` | `10.244.0.0/16` |没有| `overlay`模式下的Pod地址范围；在 `node-subnet` 模式下被忽略。不得与 VNet、对等网络或本地网络或 `aks_service_cidr` 重叠。每个节点都有一个`/24`，所以一个`/16`承载256个节点。 |
| `aks_os_sku` | `Ubuntu` |没有|默认池和未设置 `os_sku` 的其他池的节点操作系统映像：`Ubuntu`、`AzureLinux`、`AzureLinux3` 或 `Ubuntu2204`。更改会重新映像池的节点。 |
| `default_node_pool_vm_size` | `Standard_D8s_v5` |没有|默认节点池的 VM 大小。 `Standard_D8s_v5` (8 vCPU / 32 GiB) 是具有外部 Postgres 和 Redis 的核心平台的推荐基准。仅将 `Standard_D4s_v5` (4 vCPU / 16 GiB) 用于具有集群内数据库的轻型或演示部署。 || `default_node_pool_min_count` | `1` |没有|默认池的最小节点数。自动缩放器永远不会缩放到该层以下。生产时设置为 3（核心平台需要大约 14.4 个 vCPU，三个 `Standard_D8s_v5` 节点覆盖）。对于最小部署或开发部署，设置为 1。 |
| `default_node_pool_max_count` | `10` |没有|默认池的最大节点数。核心平台采用4~6个节点；启用附加组件时增加空间（LangSmith部署\~6、舰队\~8、见解 10 到 12）。提高此值会立即生效，无需重新启动节点。 |
| `default_node_pool_max_pods` | `60` |没有|默认池中每个节点的最大 Pod 数。 Azure CNI 默认值 30 对于 LangSmith 来说太低； 60 适合单个节点上的完整部署。不可变：更改它会重新创建节点池。 |
| `additional_node_pools` | `large: Standard_D16s_v5, 0 to 2` |没有|额外的节点池。集群内 ClickHouse 需要默认的 `large` 池（`Standard_D16s_v5`，16 vCPU / 64 GiB）（请求最多 4 vCPU / 16 GiB，具体取决于 `sizing_profile`）和 LangSmith 部署代理 Pod。 `min_count = 0` 空闲时将其缩放为零。对于同时部署多个的舰队，将 `max_count` 提高到 3 或更多。没有 `os_sku` 的池使用 `aks_os_sku`。 || `aks_service_cidr` | `""` |当 `!create_vnet` | Kubernetes 服务 CIDR。 Terraform 创建 VNet 时，Empty 使用 `10.0.64.0/20`。不得与 VNet 或与其连接的任何内容重叠。尺寸`/20`。修复了集群创建时的问题。 |
| `aks_dns_service_ip` | `""` |没有| CoreDNS服务IP。必须在`aks_service_cidr`之内。空使用`aks_service_cidr`的第十一个地址（`10.0.64.10`为默认范围）。 |
| `availability_zones` | `[]` |没有| AKS 节点池和 PostgreSQL 服务器的可用区域。 “空”允许 Azure 放置它们，这是当该区域的每个区域未提供 SKU 时唯一有效的设置。使用 `["1", "2", "3"]` 实现区域冗余 HA。仅适用于创建时。 |

私有 API 服务器、Entra 和控制平面身份变量仅适用于 Terraform 创建的集群。在附加集群 (`create_cluster = false`) 上，Terraform 不进行控制平面授权，并且 `aks_kube_auth = "auto"` 检测集群本身的 Entra ID。

## 数据来源|变量|默认 |必填|描述 |
| - | - | - | - |
| `postgres_source` | `external` |没有| `external` 预配 Azure Database for PostgreSQL 灵活服务器（私有 VNet）。 `in-cluster` 使用图表管理的 Postgres pod（仅限开发/演示）。 |
| `redis_source` | `external` |没有| `external` 配置 Azure 托管 Redis（私有 VNet）。 `in-cluster` 使用图表管理的 Redis pod（仅限开发/演示）。 |
| `clickhouse_source` | `in-cluster` |没有| `in-cluster`（仅限开发/POC）或`external`（适用于[LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)），建议用于生产。 |

## PostgreSQL|变量|默认 |必填|描述 |
| - | - | - | - |
| `postgres_admin_username` | `langsmith` |没有| PostgreSQL 管理员用户名。 |
| `postgres_admin_password` | `""` |当外部 | PostgreSQL 管理员密码。通过`make setup-env`设置。 |
| `postgres_database_name` | `langsmith` |没有| LangSmith 数据库的名称。对于 `postgres_source = "external"`，Terraform 在灵活服务器上创建它。使用`in-cluster`则没有效果。 |
| `postgres_version` | `16` |没有|主要 PostgreSQL 版本，11 到 18。LangSmith 需要 14 或更高版本。在现有服务器上提升它会运行不可逆转的就地重大升级。降低它会破坏并重新创建服务器。 |
| `postgres_sku_name` | `GP_Standard_D2ds_v4` |没有| PostgreSQL 灵活服务器的 SKU。 `LocationIsOfferRestricted` 错误或零 vCPU 配额可以仅限于一个 SKU 系列，因此另一个系列可以在不更改区域的情况下清除它。 |
| `postgres_high_availability` | `false` |没有| PostgreSQL 的区域冗余 HA（主备在不同区域）。需要通用或内存优化的 SKU。 |
| `postgres_geo_redundant_backup` | `false` |没有|为 PostgreSQL 启用异地冗余备份。 |
| `postgres_standby_availability_zone` | `""` |没有|将 HA 备用数据库固定到区域。空让 Azure 选择。设置区域也会打开 HA。仅将备用电源固定在已固定的 `availability_zones` 旁边。 || `postgres_private_dns_zone_id` | `""` |没有| PostgreSQL 服务器的现有 `privatelink.postgres` 私有 DNS 区域，包括 SmithDB 元存储。 Empty 在部署资源组中创建一个区域并将其链接到 VNet。提供区域后，Terraform 不会创建任何区域和 VNet 链接，并且区域所有者会链接它。另一个订阅中的区域需要在那里注册 `Microsoft.DBforPostgreSQL` 资源提供者。需要 `postgres_source = "external"` 或 `enable_smithdb = true`。 |

## Redis

|变量|默认 |必填|描述 |
| - | - | - | - |
| `amr_sku` | `Balanced_B1` |没有| Azure 托管 Redis SKU。 `Balanced_B1` (1 GB) 是默认值。 `Balanced_B0` 位于容量最受限的池上，不支持 HA。向上移动（`Balanced_B3`、`Balanced_B5` 等）以获得更多内存。较大的 SKU 无法修复`InsufficientCapacity`，这是区域性的；使用 `redis_location` 代替。取代经典的`redis_capacity`。 |
| `redis_high_availability` | `false` |没有| Azure 托管 Redis 的区域冗余 HA。 Azure 托管 Redis SLA 必需，因此为生产设置 `true`。 `Balanced_B0` 不支持。 |
| `redis_location` | `null` |没有| Redis 集群的区域。 `null` 使用`location`。仅当 Azure 托管 Redis 在您所在区域报告 `InsufficientCapacity` 时才设置它。专用端点位于`location`。 |

## Blob 存储|变量|默认 |必填|描述 |
| - | - | - | - |
| `blob_ttl_enabled` | `true` |没有|在 Blob 容器上启用生命周期 TTL 规则。 |
| `blob_ttl_short_days` | `14` |没有|短期跟踪 blob 的 TTL（以天为单位）。 |
| `blob_ttl_long_days` | `400` |没有|长寿命跟踪 blob 的 TTL（以天为单位）。 |
| `storage_replication_type` | `LRS` |没有|跟踪 blob 帐户的冗余：`LRS`、`GRS`、`RAGRS`、`ZRS`、`GZRS` 或 `RAGZRS`。使用 `ZRS` 进行区域冗余部署。区域冗余组和非区域组之间的更改需要首先进行 Azure 帐户转换。请参阅自述文件[Storage redundancy](https://github.com/langchain-ai/terraform/blob/main/modules/azure/README.md#storage-redundancy)部分。 |
| `storage_allowed_ips` | `[]` |没有|允许通过存储帐户默认拒绝防火墙的公共 IP 或 CIDR。 AKS Pod 流量通过 `Microsoft.Storage` 服务端点自动列入白名单。仅添加需要 blob 数据平面的外部客户端（操作员工作站、CI 运行程序）。 |
| `storage_private_endpoint_enabled` | `false` |没有|通过专用端点访问 Blob 存储并关闭公共端点。适用于跟踪 blob 帐户和 SmithDB 对象存储。 `false` 保留服务端点防火墙。 |
| `storage_private_endpoint_subnet_id` | `""` |没有| Blob 专用终结点的子网。空使用 AKS 子网。 || `storage_private_dns_zone_id` | `""` |没有|用于将端点附加到的现有 `privatelink.blob` 私有 DNS 区域。 Empty 创建一个区域并将其链接到 VNet。当 VNet 已解析该名称时提供中心区域。 |

## 密钥库

|变量|默认 |必填|描述 |
| - | - | - | - |
| `create_keyvault` | `true` |没有|创建一个新的密钥保管库。设置 `false` 以附加到现有保管库。然后，Terraform 将其秘密写入该保管库并忽略 `keyvault_default_action`、`keyvault_allowed_ips` 和 `keyvault_purge_protection`。默认情况下，Terraform 不会授予自身对现有保管库的访问权限，因此在 `keyvault_manage_secrets = true` 时，请在 `make apply` 之前向保管库上的部署者授予 Key Vault Secrets Leader，否则机密写入会失败并显示 403。
| `existing_keyvault_name` | `""` |当`!create_keyvault` |要附加到的现有 Key Vault 的名称。 |
| `existing_keyvault_resource_group_name` | `""` |当 `!create_keyvault` |保存现有 Key Vault 的资源组。 |
| `keyvault_name` | `""` |没有|密钥保管库名称。必须是全局唯一的，长度为 3 到 24 个字符。 Empty 从命名方案中得出名称。仅当`create_keyvault = true`时使用。 |
| `keyvault_purge_protection` | `true` |没有|启用清除保护。为开发/测试设置 `false` 以允许在销毁后立即重用名称。 || `keyvault_default_action` | `Allow` |没有| Key Vault 数据平面防火墙的默认操作。 `Allow` 保持 `make apply` 和 `make seed-secrets` 工作，因为两者都通过数据平面写入机密。生产集 `Deny` 并填充 `keyvault_allowed_ips`。 |
| `keyvault_manage_secrets` | `true` |没有| Terraform 将 `postgres-admin-password` 和 `langsmith-license-key` 写入保管库。 `false` 两者都不写入，因此 `make apply` 不需要 Key Vault 数据平面访问，并且 `make seed-secrets` 随后写入所有九个秘密。当部署者无法持有 Key Vault Secrets Leader 或当 `keyvault_default_action = "Deny"` 阻止应用主机时，设置`false`。应用后将其更改为 `false` 会从保管库中删除这两个机密，因此请先将它们从状态中删除。 |
| `keyvault_manage_terraform_admin_assignment` | `null` |没有| Terraform 是否在保管库上创建部署者的 Key Vault Secrets Leader 授权。 `null` 遵循 `create_keyvault`：Terraform 创建的保管库获得资助，而现有的保管库则没有。当授权已存在时，或者当`principalType`上的ABAC条件拒绝请求时，设置`false`。然后，租户管理员必须在应用之前授予该角色，否则秘密写入将失败并显示 403。| `terraform_principal_type` | `null` |没有|运行 `terraform apply` 的身份的主要类型，在其 Key Vault 机密官员授予中设置：`User`、`Group` 或 `ServicePrincipal`。 `null`​​ 让 Azure 进行推断。当订阅委托角色分配通过 `principalType` 上的 ABAC 条件进行写入时设置它，该条件会拒绝省略字段的请求：`User`（对于交互式 `az login`）、`ServicePrincipal`（对于 CI）。 |
| `keyvault_allowed_ips` | `[]` |没有| `keyvault_default_action = "Deny"` 时允许公共 IP 或 CIDR 通过 Key Vault 防火墙。 AKS 子网通过 `Microsoft.KeyVault` 服务端点自动列入允许名单。不能与`keyvault_private_endpoint_enabled`结合使用。 |
| `keyvault_private_endpoint_enabled` | `false` |没有|通过专用端点到达保管库并关闭其公共网络访问。 Terraform 在每个计划上读取和写入两个密钥并应用，并且 `make seed-secrets` 和 `make k8s-secrets` 读取或写入保管库，因此它们都必须从解析保管库的 `privatelink.vaultcore` 记录的计算机运行，例如 VNet 或对等网络中的跳转主机或自托管运行程序。 `keyvault_manage_secrets = false` 让计划和应用从外部运行。需要`create_keyvault = true`。 |
| `keyvault_private_endpoint_subnet_id` | `""` |没有|保管库专用端点的子网。 Empty 使用 `storage_private_endpoint_subnet_id`，它本身默认为 AKS 子网。 || `keyvault_private_dns_zone_id` | `""` |没有|端点的现有 `privatelink.vaultcore` 私有 DNS 区域。 Empty 创建一个区域并将其链接到 VNet。提供区域后，Terraform 不会创建任何区域和 VNet 链接，并且部署者需要该区域上的 `Microsoft.Network/privateDnsZones/join/action`。参见[PERMISSIONS.md](https://github.com/langchain-ai/terraform/blob/main/modules/azure/PERMISSIONS.md#private-dns-zones-you-own)。 |

## 入口

|变量|默认 |必填|描述 |
| - | - | - | - |
| `ingress_controller` | `envoy-gateway` |没有|入口控制器：`envoy-gateway`（网关 API）、`nginx`（旧版入口兼容性）、`istio`（自管理 Helm）、`istio-addon`（Azure 管理的 Istio，用于 mTLS 或多数据平面）、`agic`（应用程序网关入口控制器），或`none`。在现有部署上更改它会删除旧控制器及其负载均衡器 IP。请参阅 [⟦T432⟧](https://github.com/langchain-ai/terraform/blob/main/modules/azure/INGRESS_CONTROLLERS.md) 了解 TLS 兼容性矩阵。 |
| `istio_version` | `1.29.1` |没有| Istio Helm 图表版本。仅当`ingress_controller = "istio"`时使用。 |
| `istio_addon_revision` | `asm-1-27` |没有| Azure 服务网格修订版 (`asm-1-<minor>`)。使用 `az aks mesh get-revisions --location <region>` 列出可用的修订版本。仅当`ingress_controller = "istio-addon"`时使用。 |
| `agic_subnet_address_prefix` | `["10.0.96.0/24"]` |没有|应用程序网关专用子网的 CIDR。必须为 `/24` 或更大。仅当`ingress_controller = "agic"`时使用。 |
| `agw_sku_tier` | `Standard_v2` |没有|应用程序网关 SKU 层。仅当`ingress_controller = "agic"`时使用。要打开 WAF，请设置 `create_waf = true` 而不是 `WAF_v2`。 || `envoy_gateway_version` | `v1.2.0` |没有| Envoy Gateway Helm 图表版本。仅当`ingress_controller = "envoy-gateway"`时使用。 |
| `ingress_ip` | `""` |没有|入口负载均衡器的公共 IP，由 DNS 模块用于 A 记录。对于`envoy-gateway`，请使用`kubectl get svc -n envoy-gateway-system -l gateway.envoyproxy.io/owning-gateway-name=langsmith-gateway` 获取。对于`nginx`，请使用`kubectl get svc -n ingress-nginx`。 |

## DNS 和 TLS

|变量|默认 |必填|描述 |
| - | - | - | - |
| `dns_label` | `""` |没有|入口负载均衡器的 Azure 公共 IP DNS 标签。结果为 `<label>.<region>.cloudapp.azure.com`（Azure 政府中的`cloudapp.usgovcloudapi.net`）。适用于除 `none` 之外的所有控制器。对于 `agic`，它仅提供 HTTP 服务。空跳过它。 |
| `langsmith_domain` | `""` |当 `dns01` 或 `create_dns_zone` | LangSmith 的自定义主机名（例如，`langsmith.example.com`）。用于 Helm 值和入口 TLS。优先于`dns_label`。 |
| `tls_certificate_source` | `letsencrypt` |没有| `letsencrypt`（通过 cert-manager 的 HTTP-01）、`dns01`（通过 cert-manager 的 DNS-01）、`existing`（您自己的证书，位于 LangSmith 命名空间中名为 `langsmith-tls` 的 `kubernetes.io/tls` Secret，其中 `deploy.sh`检查），或`none`（仅限 HTTP，演示/开发）。 |
| `letsencrypt_email` | `""` |当 `letsencrypt` 或 `dns01` | Let's Encrypt 证书通知的电子邮件。 |
| `create_dns_zone` | `false` |没有|为 LangSmith 域创建 Azure DNS 区域和 A 记录。 DNS-01 颁发所必需的。 || `langsmith_custom_ca_secret_name` | `""` |没有| LangSmith命名空间中的秘密，包含 CA 捆绑包，用于私有 CA 签名的端点。该图表将其安装在 LangSmith 服务中，但不安装在它创建的操作员或其代理部署中。由`init-values.sh`和`deploy.sh`阅读； Terraform 会忽略它。 |
| `langsmith_custom_ca_secret_key` | `ca.crt` |没有|输入保存 PEM 包的 `langsmith_custom_ca_secret_name`。 |

## LangSmith 应用

|变量|默认 |必填|描述 |
| - | - | - | - |
| `langsmith_namespace` | `langsmith` |没有| LangSmith 的 Kubernetes 命名空间。用于确定 Blob 存储的 Workload Identity 范围。 |
| `langsmith_release_name` | `langsmith` |没有|头盔发布名称。用于 Workload Identity 联合凭证主题。 |
| `langsmith_domain` | `""` |当 `dns01` 或 `create_dns_zone` |参见[DNS and TLS](#dns-and-tls)。 |
| `langsmith_helm_chart_version` | `""` |没有|固定图表版本以进行可重复的部署。部署脚本优先级是 `CHART_VERSION` 环境变量，然后是该变量，然后是固定行默认值 `~0.17.0`（最新的 `0.17.x` 补丁）。在任何其他图表线上部署都会失败。在 `v0.16.*` 模块标签上，默认为 `~0.16.0` 并且仅部署 0.16 行，除非 `enable_smithdb = true` 需要 0.17 行：将此变量设置为 `~0.17.0`。 || `langsmith_admin_email` | `""` |没有|初始组织管理员电子邮件（Helm 值中的`initialOrgAdminEmail`）。通过`make setup-env`设置。 |

## 尺寸和附加标志

`init-values.sh` 和 `deploy.sh` 读取这些标志。 Terraform 会忽略它们，除了 `enable_fleet` 以及 `enable_gateway_pii_redaction` 需要 `enable_llm_gateway` 的验证。它们控制脚本生成哪个 Helm 覆盖层。 `enable_llm_gateway`、`enable_gateway_pii_redaction` 和 `enable_sso_oidc` 标志仅存在于 `v0.17.*` 模块标签上。

|变量|默认 |必填|描述 |
| - | - | - | - |
| `sizing_profile` | `production` |没有|头盔尺寸叠加：`minimum`、`dev`、`production` 或 `production-large`。 |
| `enable_deployments` | `false` |没有|启用LangSmith部署（主机后端、侦听器、操作员）。 |
| `enable_agent_builder` | `false` |没有|启用 Fleet 所取代的旧版 Agent Builder UI。需要`enable_deployments = true`。不能与`enable_fleet`结合使用。 |
| `enable_fleet` | `false` |没有|启用 Fleet，Agent Builder 的后继者。需要 `enable_deployments = true` 和 `postgres_source = "external"`。不能与`enable_agent_builder`结合使用。 Terraform 还创建一个 `langsmith_fleet` 数据库和 `langsmith-fleet-postgres` Kubernetes 密钥，因此在部署之前运行 `make apply`。 |
| `enable_insights` | `false` |没有|启用 Insights（ClickHouse 支持的分析）。 || `enable_polly` | `false` |没有|启用 Polly（AI 评估和监控）。 Polly 在 LangSmith 部署上运行，因此也设置 `enable_deployments = true`。部署脚本不会检查这一点。 |
| `enable_llm_gateway` | `false` |没有|部署处于测试阶段的[LLM Gateway](/langsmith/llm-gateway)。需要图表 0.17。参见[LLM Gateway](/langsmith/self-host-terraform-azure-deploy#llm-gateway)。 |
| `enable_gateway_pii_redaction` | `false` |没有|在 LLM 网关旁边运行 Presidio 分析器，从网关流量中编辑 PII，并为新组织打开编辑功能。需要`enable_llm_gateway = true`。 |
| `enable_sso_oidc` | `false` |没有|通过 OIDC 提供商将登录切换到 SSO 并禁用基本身份验证。 `make k8s-secrets` 将客户端 ID、客户端密钥和颁发者 URL 从 Key Vault 复制到 `langsmith-config-secret`。仅当您以组织管理员身份使用基本身份验证登录后才启用。参见[SSO with OIDC](/langsmith/self-host-terraform-azure-deploy#sso-with-oidc)。 |

## 史密斯数据库

SmithDB 是可选的。 `enable_smithdb` 预配 Azure 资源，因此在部署之前运行 `make apply`。它需要图表0.17行，`v0.17.*`模块标签默认部署。在 `v0.16.*` 标签上，SmithDB 需要 v0.16.56 或更高版本以及 `langsmith_helm_chart_version = "~0.17.0"`。有关完整要求，请参阅[⟦T562⟧](https://github.com/langchain-ai/terraform/blob/main/modules/azure/SMITHDB.md)。|变量|默认 |必填|描述 |
| - | - | - | - |
| `enable_smithdb` | `false` |没有|配置 SmithDB 基础设施：专用的 PostgreSQL 18 元存储、Blob 容器、工作负载身份和高级 SSD v2 缓存卷。需要非空 `availability_zones`，因为高级 SSD v2 仅附加到大多数区域中的区域虚拟机。 |
| `smithdb_ingestion_enabled` | `false` |没有|一旦基础设施正常运行，就启用 LangSmith 写入 SmithDB。需要`enable_smithdb = true`。 |
| `smithdb_migration_enabled` | `false` |没有|启用 ClickHouse 到 SmithDB 的迁移作业。需要`smithdb_ingestion_enabled = true`。 |
| `smithdb_query_enabled` | `false` |没有|启用 SmithDB 支持的查询。需要`smithdb_ingestion_enabled = true`。 |
| `smithdb_metastore_admin_username` | `smithdb` |没有| SmithDB PostgreSQL 元存储的管理员用户名。 |
| `smithdb_metastore_admin_password` | `null` |没有|元存储的可选管理员密码。 `null` 通过 Microsoft Entra Workload Identity 进行身份验证。敏感的。 |
| `smithdb_metastore_sku_name` | `GP_Standard_D2ds_v5` |没有|用于元存储的 PostgreSQL 灵活服务器 SKU。 |
| `smithdb_metastore_storage_mb` | `32768` |没有|在 MiB 中分配元存储存储。 |
| `smithdb_metastore_backup_retention_days` | `7` |没有|元存储的自动备份保留（以天为单位）。 |
| `smithdb_storage_account_name` | `""` |没有| SmithDB 的全局唯一存储帐户名称。 Empty 从部署名称中派生出 1。 || `smithdb_storage_replication_type` | `LRS` |没有| SmithDB 对象存储的冗余。与`storage_replication_type`相同的值和规则。 |
| `smithdb_storage_container_name` | `smithdb` |没有| SmithDB 持久数据的 Blob 容器。 |
| `smithdb_cache_storage_class_name` | `""` |没有| SmithDB 缓存卷的高级 SSD v2 存储类的名称。 Empty 派生每个部署的名称。 |
| `smithdb_cache_disk_iops` | `7000` |没有|每个缓存卷配置的 IOPS 为 3000 到 80000。默认情况下需要至少 14 GiB 的缓存卷。 |
| `smithdb_cache_disk_throughput_mbps` | `1000` |没有|每个缓存卷的预配置吞吐量（以 MB/秒为单位），125 到 1200。Azure 允许每个预配置 IOPS 最多 0.25 MB/秒。 |

## 安全和审计|变量|默认 |必填|描述 |
| - | - | - | - |
| `create_waf` | `false` |没有|部署 Azure WAF 策略（OWASP 3.2 加机器人防护）。对于 `ingress_controller = "agic"`，Terraform 将其附加到应用程序网关并设置 `WAF_v2` 层。对于任何其他控制器，该策略对于您拥有的应用程序网关保持独立。 Azure 前门无法使用此策略类型。 |
| `waf_mode` | `Detection` |没有| WAF 强制模式：`Detection`（仅日志）或`Prevention`（阻止）。 OWASP 规则匹配在 LangSmith 提示和跟踪中合法出现的 SQL 和脚本片段。查看防火墙日志是否存在误报，添加排除项，然后切换到 `Prevention`。 |
| `create_diagnostics` | `false` |没有|在 `ingress_controller = "agic"` 时部署 AKS、Key Vault、PostgreSQL 和应用程序网关的 Log Analytics 工作区和诊断设置。 |
| `log_retention_days` | `90` |没有| Log Analytics 工作区保留天数。 |
| `create_bastion` | `false` |没有|部署跳转虚拟机以通过 `az ssh vm` 进行私有 AKS 访问。 |
| `bastion_vm_size` | `Standard_B2s` |没有|堡垒主机的 VM SKU。 |
| `bastion_admin_ssh_public_key` | `""` |没有|用于紧急管理员访问堡垒的 SSH 公钥。 || `bastion_allowed_ssh_cidrs` | `["0.0.0.0/0"]` |没有| CIDR 允许入站 SSH 到达堡垒。限制在生产中的 VPN 或企业范围。 |

## 敏感变量（用`setup-env.sh`设置）

`make setup-env` 将 `postgres_admin_password`、`langsmith_license_key` 和 `langsmith_admin_email` 写入`secrets.auto.tfvars`。 `make apply` 将许可证密钥和 PostgreSQL 密码存储在 Azure Key Vault 中。对于 `keyvault_manage_secrets = false`，`make seed-secrets` 会存储它们。切勿将这些内联设置在 `terraform.tfvars` 中。

[PostgreSQL](#postgresql) 和 [LangSmith application](#langsmith-application) 部分记录了 `postgres_admin_password` 和 `langsmith_admin_email`。此表仅列出了本参考文献中其他地方未出现的敏感变量。

|变量|描述 |
| - | - |
| `langsmith_license_key` | LangSmith 企业许可证密钥。 |

应用程序机密不是 Terraform 变量，因此它们的值永远不会进入 Terraform 状态。 `make seed-secrets` 在 `make apply` 之后将它们写入 Key Vault：初始组织管理员密码、API 密钥盐、JWT 密钥以及用于 LangSmith 部署、Agent Builder、Insights 和 Polly 的 Fernet 加密密钥。它永远不会覆盖现有的秘密，因为更改其中任何一个都会破坏正在运行的部署。要故意旋转一个，请使用`make keyvault`。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-azure-variables.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>