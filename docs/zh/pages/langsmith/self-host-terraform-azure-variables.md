<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Azure Terraform variables reference | https://docs.langchain.com/langsmith/self-host-terraform-azure-variables -->

# Azure Terraform 变量参考

[Azure Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/azure) 公开的每个输入变量的完整参考。首次填写 `terraform.tfvars` 或调整现有部署时使用它。

变量分为两类：

- **不敏感**（区域、大小、功能标志）：在 `infra/terraform.tfvars` 中设置。
- **敏感**（许可证密钥、密码、加密密钥）：使用 `make setup-env` 设置，将它们写入 `infra/secrets.auto.tfvars`（gitignored，由 Terraform 自动加载）并将它们存储在 Azure Key Vault 中。

对于端到端安装，请参阅[deploy guide](/langsmith/self-host-terraform-azure-deploy)。有关模块如何组合在一起的信息，请参阅[architecture reference](/langsmith/self-host-terraform-azure-architecture)。

## 核心

|变量|默认 |必填|描述 |
|---|---|---|---|
| `subscription_id` | — |是的 |部署的 Azure 订阅 ID。 |
| `location` | `eastus` |没有|用于部署的 Azure 区域。 |
| `identifier` | `""` |没有|每个资源名称附加后缀以区分环境（例如，`-prod`、`-staging`）。必须以连字符开头或为空。 |
| `environment` | `dev` |没有|环境标签应用于所有资源。 |
| `owner` | `""` |没有|资源所有者的电子邮件或团队名称。作为标签应用。 |
| `cost_center` | `""` |没有|成本中心或帐单代码。作为标签应用。 |

## 网络|变量|默认 |必填|描述 |
|---|---|---|---|
| `create_vnet` | `true` |没有|创建新的 VNet。设置 `false` 以引入您自己的 VNet 和子网。 |
| `vnet_id` | `""` |当 `!create_vnet` |现有 VNet 资源 ID。 |
| `aks_subnet_id` | `""` |当 `!create_vnet` | AKS 群集的现有子网 ID。 |
| `postgres_subnet_id` | `""` |当 `!create_vnet` | PostgreSQL 服务器的现有子网 ID。 |
| `redis_subnet_id` | `""` |当 `!create_vnet` | Redis 实例的现有子网 ID。 |
| `postgres_subnet_address_prefix` | `["10.0.32.0/20"]` |没有| PostgreSQL 子网的 CIDR 前缀。可以是不相交的范围。 |
| `redis_subnet_address_prefix` | `["10.0.48.0/20"]` |没有| Redis 子网的 CIDR 前缀。可以是不相交的范围。 |
| `aks_authorized_ip_ranges` | `[]` |没有|允许外部 CIDR 访问 AKS API 服务器。空使 API 服务器可公开访问，因此 Terraform 驱动的 Helm 和 `kubectl` 步骤可以从任何应用主机工作。填充用于生产的操作员和 CI 出口 CIDR。 |

## AKS|变量|默认 |必填|描述 |
|---|---|---|---|
| `default_node_pool_vm_size` | `Standard_D8s_v3` |没有|默认节点池的 VM 大小。 `Standard_D8s_v3` (8 vCPU / 32 GiB) 是具有外部 Postgres 和 Redis 的核心平台的推荐基准。仅将 `Standard_D4s_v3` (4 vCPU / 16 GiB) 用于具有集群内数据库的轻型或演示部署。 |
| `default_node_pool_min_count` | `1` |没有|默认池的最小节点数。自动缩放器永远不会缩放到该层以下。生产时设置为 3（核心平台需要大约 14.4 个 vCPU，三个 `Standard_D8s_v3` 节点覆盖）。对于最小部署或开发部署，设置为 1。 |
| `default_node_pool_max_count` | `10` |没有|默认池的最大节点数。核心平台采用4~6个节点；在启用附加组件时增加空间（LangSmith 部署 ~6、Agent Builder ~8、见解 10 到 12）。提高此值会立即生效，无需重新启动节点。 |
| `default_node_pool_max_pods` | `60` |没有|默认池中每个节点的最大 Pod 数。 Azure CNI 默认值 30 对于 LangSmith 来说太低； 60 适合单个节点上的完整部署。不可变：更改它会重新创建节点池。 || `additional_node_pools` | `large: Standard_D16s_v3, 0–2` |没有|额外的节点池。 ClickHouse（请求 3.5 vCPU / 15 GiB）和 LangSmith 部署代理 Pod 需要默认的 `large` 池（`Standard_D16s_v3`，16 vCPU / 64 GiB）。 `min_count = 0` 空闲时将其缩放为零。对于同时进行多个部署的 Agent Builder，将 `max_count` 提高到 3 或更多。 |
| `aks_service_cidr` | `10.0.64.0/20` |没有| Kubernetes 服务 CIDR。不得与 VNet 重叠。 |
| `aks_dns_service_ip` | `10.0.64.10` |没有| CoreDNS服务IP。必须在`aks_service_cidr`之内。 |
| `aks_deletion_protection` | `true` |没有|防止意外删除 AKS 群集。为开发/测试设置 `false`。 |
| `availability_zones` | `["1"]` |没有|要部署到的可用区域。使用 `["1", "2", "3"]` 实现区域冗余 HA。 |

## 数据来源

|变量|默认 |必填|描述 |
|---|---|---|---|
| `postgres_source` | `external` |没有| `external` 预配 Azure Database for PostgreSQL 灵活服务器（私有 VNet）。 `in-cluster` 使用图表管理的 Postgres pod（仅限开发/演示）。 |
| `redis_source` | `external` |没有| `external` 配置 Azure 托管 Redis（私有 VNet）。 `in-cluster` 使用图表管理的 Redis pod（仅限开发/演示）。 |
| `clickhouse_source` | `in-cluster` |没有| `in-cluster`（仅限开发/POC）或`external`（适用于[LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)），建议用于生产。 |

## PostgreSQL|变量|默认 |必填|描述 |
|---|---|---|---|
| `postgres_admin_username` | `langsmith` |没有| PostgreSQL 管理员用户名。 |
| `postgres_admin_password` | `""` |当外部 | PostgreSQL 管理员密码。通过`make setup-env`设置。 |
| `postgres_database_name` | `langsmith` |没有| LangSmith 连接到的数据库的名称。必须与服务器上存在的数据库匹配。 |
| `postgres_deletion_protection` | `true` |没有|防止意外删除 PostgreSQL 服务器。为开发/测试设置`false`。 |
| `postgres_geo_redundant_backup` | `false` |没有|为 PostgreSQL 启用异地冗余备份。 |
| `postgres_standby_availability_zone` | `""` |没有| PostgreSQL 区域冗余 HA 的备用 AZ。为空会禁用 HA 备用。 |

## Redis

|变量|默认 |必填|描述 |
|---|---|---|---|
| `amr_sku` | `Balanced_B0` |没有| Azure 托管 Redis SKU。 `Balanced_B0`是最小的。如果该区域报告 `AllocationFailed`，则向上移动（`Balanced_B1`、`Balanced_B3` 等）。取代经典的`redis_capacity`。 |

## Blob 存储|变量|默认 |必填|描述 |
|---|---|---|---|
| `blob_ttl_enabled` | `true` |没有|在 Blob 容器上启用生命周期 TTL 规则。 |
| `blob_ttl_short_days` | `14` |没有|短期跟踪 blob 的 TTL（以天为单位）。 |
| `blob_ttl_long_days` | `400` |没有|长寿命跟踪 blob 的 TTL（以天为单位）。 |
| `storage_allowed_ips` | `[]` |没有|允许通过存储帐户默认拒绝防火墙的公共 IP 或 CIDR。 AKS Pod 流量通过 `Microsoft.Storage` 服务端点自动列入白名单。仅添加需要 blob 数据平面的外部客户端（操作员工作站、CI 运行程序）。 |

## 密钥库|变量|默认 |必填|描述 |
|---|---|---|---|
| `keyvault_name` | `""` |没有|密钥保管库名称。必须是全局唯一的，长度为 3 到 24 个字符。当为空时，`main.tf` 计算`langsmith-kv<identifier>`。覆盖以避免命名冲突。 |
| `keyvault_purge_protection` | `true` |没有|启用清除保护。为开发/测试设置 `false` 以允许在销毁后立即重用名称。 |
| `keyvault_default_action` | `Allow` |没有| Key Vault 数据平面防火墙的默认操作。 `Allow` 保持第一个应用（通过数据平面创建秘密）工作。生产集 `Deny` 并填充 `keyvault_allowed_ips`。 |
| `keyvault_allowed_ips` | `[]` |没有| `keyvault_default_action = "Deny"` 时允许公共 IP 或 CIDR 通过 Key Vault 防火墙。 AKS 子网通过 `Microsoft.KeyVault` 服务端点自动列入允许名单。 |

## 入口|变量|默认 |必填|描述 |
|---|---|---|---|
| `ingress_controller` | `nginx` |没有|入口控制器：`nginx`、`istio`（自管理 Helm）、`istio-addon`（Azure 管理的 Istio，建议在 Azure 上使用）、`agic`（应用程序网关入口控制器）、`envoy-gateway`（网关 API）或 `none`。请参阅 [⟦T133⟧](https://github.com/langchain-ai/terraform/blob/main/modules/azure/INGRESS_CONTROLLERS.md) 了解 TLS 兼容性矩阵。 |
| `istio_version` | `1.29.1` |没有| Istio Helm 图表版本。仅当`ingress_controller = "istio"`时使用。 |
| `istio_addon_revision` | `asm-1-27` |没有| Azure 服务网格修订版 (`asm-1-<minor>`)。使用 `az aks mesh get-upgrades` 列出可用的修订版本。仅当`ingress_controller = "istio-addon"`时使用。 |
| `agic_subnet_address_prefix` | `["10.0.96.0/24"]` |没有|应用程序网关专用子网的 CIDR。必须为 `/24` 或更大。仅当`ingress_controller = "agic"`时使用。 |
| `agw_sku_tier` | `Standard_v2` |没有|应用程序网关 SKU 层：`Standard_v2` 或 `WAF_v2`（启用 WAF）。仅当`ingress_controller = "agic"`时使用。 |
| `envoy_gateway_version` | `v1.2.0` |没有| Envoy Gateway Helm 图表版本。仅当`ingress_controller = "envoy-gateway"`时使用。 |
| `ingress_ip` | `""` |没有|入口负载均衡器的公共 IP，由 DNS 模块用于 A 记录。通过`kubectl get svc -n ingress-nginx`获取。 |

## DNS 和 TLS|变量|默认 |必填|描述 |
|---|---|---|---|
| `dns_label` | `""` |没有|入口负载均衡器的 Azure 公共 IP DNS 标签。结果为`<label>.<region>.cloudapp.azure.com`。可与 nginx、istio、istio-addon 和 envoy-gateway 配合使用。空跳过它。 |
| `langsmith_domain` | `""` |没有| LangSmith 的自定义主机名（例如，`langsmith.example.com`）。用于 Helm 值和入口 TLS。优先于`dns_label`。 |
| `tls_certificate_source` | `letsencrypt` |没有| `letsencrypt`（通过证书管理器的 HTTP-01）、`dns01`（通过证书管理器的 DNS-01）、`existing`（自带证书）或 `none`（仅限 HTTP，演示/开发）。 |
| `letsencrypt_email` | `""` |当 `letsencrypt` 或 `dns01` | Let's Encrypt 证书通知的电子邮件。 |
| `create_dns_zone` | `false` |没有|为 LangSmith 域创建 Azure DNS 区域和 A 记录。 DNS-01 颁发所必需的。 |

## LangSmith 应用|变量|默认 |必填|描述 |
|---|---|---|---|
| `langsmith_namespace` | `langsmith` |没有| LangSmith 的 Kubernetes 命名空间。用于确定 Blob 存储的 Workload Identity 范围。 |
| `langsmith_release_name` | `langsmith` |没有|头盔发布名称。用于 Workload Identity 联合凭证主题。 |
| `langsmith_domain` | `""` |没有|参见[DNS and TLS](#dns-and-tls)。 |
| `langsmith_helm_chart_version` | `""` |没有|固定图表版本以进行可重复的部署。部署脚本优先级是 `CHART_VERSION` 环境变量，然后是该变量，然后是固定行默认值 `~0.15.1`（最新的 `0.15.x` 补丁）。 |
| `langsmith_admin_email` | `""` |没有|初始组织管理员电子邮件（Helm 值中的`initialOrgAdminEmail`）。通过`make setup-env`设置。 |

## 尺寸和附加标志

`init-values.sh` 和 `deploy.sh` 读取这些标志； Terraform 会忽略它们。它们控制脚本生成哪个 Helm 覆盖层。|变量|默认 |必填|描述 |
|---|---|---|---|
| `sizing_profile` | `production` |没有|头盔尺寸叠加：`minimum`、`dev`、`production` 或 `production-large`。 |
| `enable_deployments` | `false` |没有|启用LangSmith部署（主机后端、侦听器、操作员）。 |
| `enable_agent_builder` | `false` |没有|启用代理生成器 UI。需要`enable_deployments = true`。 |
| `enable_insights` | `false` |没有|启用 Insights（ClickHouse 支持的分析）。需要`enable_deployments = true`。 |
| `enable_polly` | `false` |没有|启用 Polly（AI 评估和监控）。需要`enable_deployments = true`。 |

## 安全和审计|变量|默认 |必填|描述 |
|---|---|---|---|
| `create_waf` | `false` |没有|部署 Azure WAF 策略（OWASP 3.2 加机器人防护）。创建后附加到应用程序网关或前门。 |
| `waf_mode` | `Prevention` |没有| WAF 强制模式：`Detection`（仅日志）或`Prevention`（阻止）。 |
| `create_diagnostics` | `false` |没有|为 AKS、Key Vault 和 PostgreSQL 部署 Log Analytics 工作区和诊断设置。 |
| `log_retention_days` | `90` |没有| Log Analytics 工作区保留天数。 |
| `create_bastion` | `false` |没有|部署跳转虚拟机以通过 `az ssh vm` 进行私有 AKS 访问。 |
| `bastion_vm_size` | `Standard_B2s` |没有|堡垒主机的 VM SKU。 |
| `bastion_admin_ssh_public_key` | `""` |没有|用于紧急管理员访问堡垒的 SSH 公钥。 |
| `bastion_allowed_ssh_cidrs` | `["0.0.0.0/0"]` |没有| CIDR 允许入站 SSH 到达堡垒。限制在生产中的 VPN 或企业范围。 |

## 敏感变量（用`setup-env.sh`设置）

`make setup-env` 将这些写入`secrets.auto.tfvars`，Terraform 将它们存储在 Azure Key Vault 中。切勿将这些内联设置在 `terraform.tfvars` 中。

`make setup-env` 还管理 `postgres_admin_password` 和 `langsmith_admin_email`，记录在 [PostgreSQL](#postgresql) 和 [LangSmith application](#langsmith-application) 部分。此表仅列出了本参考文献中其他地方未出现的敏感变量。|变量|描述 |
|---|---|
| `langsmith_license_key` | LangSmith 企业许可证密钥。 |
| `langsmith_admin_password` |初始组织管理员密码。 |
| `langsmith_api_key_salt` |用于散列 API 密钥的盐。首次部署后必须保持稳定。 |
| `langsmith_jwt_secret` |基本身份验证会话的 JWT 密钥。必须保持稳定。 |
| `langsmith_deployments_encryption_key` |用于 LangSmith 部署的 Fernet 密钥。绝对不能改变。 |
| `langsmith_agent_builder_encryption_key` | Agent Builder 的 Fernet 密钥。绝对不能改变。 |
| `langsmith_insights_encryption_key` | Fernet 洞察的关键。绝对不能改变。 |
| `langsmith_polly_encryption_key` |波莉的 Fernet 钥匙。绝对不能改变。 |

## 应用程序模块变量（Terraform 路径）

Terraform 路径（`make init-app` 然后`make apply-app`）管理 LangSmith Helm 版本、其 Kubernetes Secret 以及 Terraform 状态下的 Workload Identity ServiceAccount，而不是通过 Helm shell 脚本。它的变量位于`app/terraform.tfvars`中。使用此路径作为 `make init-values && make deploy` 的替代路径。何时选择该路径，请参考[Azure deployment guide](/langsmith/self-host-terraform-azure-deploy)。`make init-app` 自动填充基础设施直通变量（`subscription_id`、`resource_group_name`、`cluster_name`、`keyvault_name`、`storage_account_name`、`storage_container_name`、`workload_identity_client_id`、`langsmith_namespace`、 `tls_certificate_source`、`ingress_controller` 和 `dns_label`）来自基础模块输出。每个都默认为`null`，并在计划时失败，并出现前提条件错误，指出缺少的内容。仅当针对您单独配置的基础架构运行应用程序模块时才覆盖它们。

在`app/terraform.tfvars`中设置以下内容：

|变量|默认 |必填|描述 |
|---|---|---|---|
| `sizing` | `production` |没有|资源大小调整配置文件：`production`、`production-large`、`dev` 或 `none`（图表默认值）。 |
| `postgres_source` | `external` |没有| `external`（Azure Database for PostgreSQL）或`in-cluster`（Helm）。镜像基础值。 |
| `redis_source` | `external` |没有| `external`（Azure 托管 Redis）或 `in-cluster`（Helm）。镜像基础值。 |
| `hostname` | `null` |没有| LangSmith 主机名。未设置时自动从`dns_label`检测到。 |
| `admin_email` | `admin@example.com` |没有|初始组织管理员电子邮件地址。 |
| `release_name` | `langsmith` |没有|头盔发布名称。 |
| `chart_version` | `""` |没有| LangSmith 舵图版本。空用最新的。 |
| `helm_timeout` | `1200` |没有| Helm 安装和升级超时（以秒为单位）。 || `helm_force_update` | `false` |没有|每次应用时强制进行 Helm 升级，即使值未更改也是如此。 |
| `enable_agent_deploys` | `false` |没有|启用LangSmith部署。 |
| `enable_agent_builder` | `false` |没有|启用代理生成器。需要`enable_agent_deploys = true`。 |
| `enable_insights` | `false` |没有|启用见解。需要外部 ClickHouse。 |
| `enable_polly` | `false` |没有|启用 Polly AI 评估和监控。需要`enable_agent_deploys = true`。 |
| `enable_usage_telemetry` | `false` |没有|启用扩展使用遥测报告。 |
| `tls_enabled_for_deploys` | `null` |没有|代理部署端点是否使用 HTTPS。未设置时自动从`tls_certificate_source`检测到。 |
| `clickhouse_host` | `""` |当`enable_insights` | ClickHouse 主机名或端点。 |
| `clickhouse_port` | `8123` |没有| ClickHouse HTTP 端口。 |
| `clickhouse_database` | `default` |没有| ClickHouse 数据库名称。 |
| `clickhouse_username` | `default` |没有| ClickHouse 用户名。 |
| `clickhouse_password` | `""` |没有|点击房屋密码。设置为经过身份验证的 ClickHouse。 |
| `clickhouse_tls` | `true` |没有|为 ClickHouse 连接启用 TLS。 |

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-azure-variables.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>