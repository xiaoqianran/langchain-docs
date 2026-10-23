<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: GCP Terraform variables reference | https://docs.langchain.com/langsmith/self-host-terraform-gcp-variables -->

# GCP Terraform 变量参考

GCP GKE 上自托管的 LangSmith Terraform 变量的完整参考。

[GCP Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/gcp) 公开的每个输入变量的完整参考。首次填写 `terraform.tfvars` 或调整现有部署时使用它。

变量分为两类：

* **不敏感**（区域、大小、功能标志）：在 `infra/terraform.tfvars` 中设置。
* **敏感**（许可证密钥、密码、加密密钥）：通过 `infra/scripts/setup-env.sh` 获取，它将它们写入 Google Secret Manager 并将其导出以用于 Terraform 和 Helm 步骤。

默认值反映部署 Helm Chart 0.17 的 `main` 分支和 `v0.17.x` 标签。部署图表 0.16 的 `v0.16.x` 标签上不同的行是这样说的。

对于端到端安装，请参阅[deploy guide](/langsmith/self-host-terraform-gcp-deploy)。有关模块如何组合在一起的信息，请参阅[architecture reference](/langsmith/self-host-terraform-gcp-architecture)。

＃＃ 核|变量|默认|必填 |描述 |
| - | - | - | - |
| `project_id` | — |是的 | GCP project ID where resources are created. |
| `region` | `us-west2` |没有| GCP region for regional resources. |
| `zone` | `us-west2-a` |没有| GCP zone for zonal resources. |
| `environment` | `prod` |没有|应用于标签和资源名称的环境名称：`dev`、`staging`、`prod`、`test` 或 `uat`。 `setup-env.sh` 将`terraform.tfvars` 的值导出，回落到`dev`。明确设置它：当它丢失时，`setup-env.sh`仍然用空值（`langsmith-<name_prefix>--<key>`）命名秘密。 |
| `name_prefix` | `ls` |没有|所有资源名称的前缀。 1～11个字符，以小写字母开头； lowercase letters, numbers, and hyphens only. |
| `unique_suffix` | `true` |没有| Append a random suffix to resource names.推荐用于多租户项目。 |
| `owner` | `platform-team` |没有|所有者标签应用于所有资源。 Sourcing `setup-env.sh` 使用 `LANGSMITH_OWNER` 环境变量覆盖它，未设置时该变量为空。 |
| `cost_center` | `""` |没有| Cost center label for billing attribution.采购 `setup-env.sh` 会用 `LANGSMITH_COST_CENTER` 覆盖它。 |
| `labels` | `{}` |没有|附加标签应用于所有资源。 |

## 网络|变量|默认|必填 |描述 |
| - | - | - | - |
| `subnet_cidr` | `10.0.0.0/20` |没有| GKE 子网的 CIDR。不得与现有范围重叠。 |
| `pods_cidr` | `10.4.0.0/14` |没有| GKE Pod 的 CIDR。不得与子网或服务范围重叠。 |
| `services_cidr` | `10.8.0.0/20` |没有| GKE 服务的 CIDR。不得与子网或 Pod 范围重叠。 |
| `gke_master_authorized_cidrs` | `[]` |没有|允许外部 CIDR 到达 GKE 控制平面端点。空使控制平面可公开访问，因此 Terraform 管理的 Helm 和 `kubectl` 步骤可以从任何应用主机工作。填充用于生产的操作员和 CI 出口 CIDR。 |

## GKE|变量|默认|必填 |描述 |
| - | - | - | - |
| `gke_use_autopilot` | `false` |没有|使用 GKE Autopilot 模式。 Autopilot always uses Dataplane V2. |
| `gke_node_count` | `2` |没有|每个区域的初始节点数（仅限标准模式）。 |
| `gke_min_nodes` | `2` |没有|每个区域用于自动缩放的最小节点数。 |
| `gke_max_nodes` | `10` |没有| Maximum nodes per zone for autoscaling. |
| `gke_machine_type` | `e2-standard-4` |没有| GKE 节点机器类型（例如 `e2-standard-4`、`n2-standard-8`）。 |
| `gke_disk_size` | `100` |没有|节点磁盘大小（以 GB 为单位）。 |
| `gke_release_channel` | `REGULAR` |没有| GKE 发布通道：`RAPID`、`REGULAR` 或 `STABLE`。 |
| `gke_deletion_protection` | `true` |没有|在 GKE 集群上启用删除保护。 |
| `gke_node_service_account_email` | `null` |没有| Service account for Standard-mode GKE nodes. `null` 保留 GKE 默认值；生产部署应传递最低权限的节点服务帐户。 Pod 单独使用 Workload Identity。 |
| `gke_network_policy_provider` | `DATA_PLANE_V2` |没有|网络策略提供程序：`CALICO`（旧版）或`DATA_PLANE_V2`（基于 Cilium，推荐）。 |

## PostgreSQL (Cloud SQL)|变量|默认|必填 |描述 |
| - | - | - | - |
| `postgres_source` | `external` |没有| `external`（具有私有 IP 的 Cloud SQL）或 `in-cluster`（通过 Helm 部署）。 |
| `postgres_version` | `POSTGRES_15` |没有| Cloud SQL PostgreSQL version. |
| `postgres_tier` | `db-custom-2-8192` |没有| Cloud SQL 机器层（例如 `db-f1-micro`、`db-custom-2-8192`）。 |
| `postgres_disk_size` | `50` |没有| Cloud SQL 磁盘大小（以 GB 为单位）。 |
| `postgres_high_availability` | `true` |没有| Enable Cloud SQL HA (regional standby). |
| `postgres_deletion_protection` | `true` |没有| Prevent deletion of the Cloud SQL instance from Terraform and from the Cloud SQL API.设置 `false` 并在运行 destroy 之前应用该更改。 |
| `postgres_database_flags` | see description |没有| Cloud SQL 实例上设置的数据库标志。 Defaults to `max_connections = 500` plus checkpoint and connection logging flags. |
| `postgres_ssl_mode` | `ENCRYPTED_ONLY` |没有| Cloud SQL SSL enforcement. `ENCRYPTED_ONLY` 每个连接都需要 TLS。 `ALLOW_UNENCRYPTED_AND_ENCRYPTED` accepts plaintext. `TRUSTED_CLIENT_CERTIFICATE_REQUIRED` also requires a client certificate. |
| `postgres_password` | `""` |当外部 | Cloud SQL password. Set via `TF_VAR_postgres_password`, or stored in Secret Manager by `setup-env.sh`. |

## Redis (Memorystore)|变量|默认|必填 |描述 |
| - | - | - | - |
| `redis_source` | `external` |没有| `external` (Memorystore with private IP) or `in-cluster` (deployed via Helm). |
| `redis_version` | `REDIS_7_0` |没有| Memorystore Redis version. |
| `redis_memory_size` | `5` |没有| Memorystore Redis memory size in GB. |
| `redis_high_availability` | `true` |没有| Enable Memorystore HA (Standard HA tier). |
| `redis_prevent_destroy` | `false` |没有| Prevent accidental Terraform destroy of the Redis instance. |

## ClickHouse

|变量|默认|必填 |描述 |
| - | - | - | - |
| `clickhouse_source` | `in-cluster` |没有| `in-cluster` (dev/POC only), `langsmith-managed` (recommended for production), or `external` (self-hosted). |
| `clickhouse_host` | `""` | when managed or external | ClickHouse host. |
| `clickhouse_port` | `9440` |没有| ClickHouse native protocol port (`9440` for TLS, `9000` for non-TLS). |
| `clickhouse_http_port` | `8443` |没有| ClickHouse HTTP port (`8443` for TLS, `8123` for non-TLS). |
| `clickhouse_user` | `default` |没有| ClickHouse username. |
| `clickhouse_password` | `""` | when managed or external | ClickHouse password. |
| `clickhouse_database` | `default` |没有| ClickHouse database name. |
| `clickhouse_tls` | `true` |没有| Enable TLS for ClickHouse connections. || `clickhouse_ca_cert` | `""` |没有|用于 TLS 验证的 ClickHouse CA 证书 (PEM)。 Empty 使用系统 CA。 |

## GCS 存储

|变量|默认|必填 |描述 |
| - | - | - | - |
| `storage_ttl_short_days` | `14` |没有| GCS TTL in days for the `ttl_s/` prefix. |
| `storage_ttl_long_days` | `400` |没有| GCS TTL in days for the `ttl_l/` prefix. |
| `storage_force_destroy` | `false` |没有| Allow bucket deletion even with objects inside.谨慎使用。 |

## LangSmith application

|变量|默认|必填 |描述 |
| - | - | - | - |
| `langsmith_namespace` | `langsmith` |没有| Kubernetes namespace for LangSmith. |
| `langsmith_domain` | `langsmith.example.com` |没有| Fully qualified domain name for LangSmith. |
| `langsmith_license_key` | `""` |没有|许可证密钥。使用`TF_VAR_langsmith_license_key`。 |
| `langsmith_helm_chart_version` | `""` |没有| Helm chart version for the deploy script.清空安装最新的`0.17.x`补丁（`~0.17.0`）。 An exported `CHART_VERSION` takes precedence.部署脚本拒绝 0.17 行之外的版本。在图表 0.16 上，默认值为 `~0.16.0`，线条为 0.16。 |
| `langsmith_release_name` | `langsmith` |没有|头盔发布名称。必须与部署步骤安装的版本匹配，因为图表创建的服务帐户名称源自该版本。 |

## 入口和 TLS|变量|默认|必填 |描述 |
| - | - | - | - |
| `install_ingress` | `true` |没有|通过 Terraform 安装 Envoy Gateway。网关侦听器遵循 `tls_certificate_source`：`none` 创建 HTTP 侦听器，`letsencrypt` 创建 HTTP 和 HTTPS 侦听器，`existing` 仅创建 HTTPS 侦听器。 |
| `ingress_type` | `envoy` |没有|入口类型：`envoy`（已实现）或`istio` / `other`（保留）。 |
| `tls_certificate_source` | `none` |没有| `none`、`letsencrypt`（通过证书管理器自动）或`existing`（提供您自己的证书）。 |
| `install_cert_manager` | `false` |没有|安装证书管理器。 Terraform 也会在 `tls_certificate_source = "letsencrypt"` 时安装它。 |
| `letsencrypt_email` | `""` |当`letsencrypt` | Let's Encrypt 通知的电子邮件。 |
| `tls_certificate_crt` | `""` |当`existing` | TLS 证书 (PEM)。用`file()`加载。 |
| `tls_certificate_key` | `""` |当`existing` | TLS 私钥 (PEM)。加载`file()`。 |
| `tls_secret_name` | `langsmith-tls` |没有| Kubernetes 中 TLS 密钥的名称。 |

## 科达

|变量|默认|必填 |描述 |
| - | - | - | - |
| `enable_langsmith_deployment` | `true` |没有|安装 KEDA 以实现 LangSmith 工作线程的队列驱动自动缩放。这是 KEDA 安装开关，而不是LangSmith 部署功能（请参阅`enable_deployments`）。 |

## 可选的 GCP 模块|变量|默认|必填 |描述 |
| - | - | - | - |
| `enable_gcp_iam_module` | `true` |没有|线路 `modules/iam` 用于工作负载身份和存储桶 IAM 绑定。 |
| `enable_secret_manager_module` | `false` |没有|连接 `modules/secrets` 将生成的引导凭据存储在 Secret Manager 中。 |
| `grant_project_secret_accessor` | `false` |没有|为整个项目授予LangSmith服务帐户`roles/secretmanager.secretAccessor`。没有模块组件需要它；仅针对您添加的将 Secret Manager 读取为该服务帐户的工作负载设置 `true`。在图 0.16 上，授权始终处于开启状态，并且该变量不存在。 |
| `enable_dns_module` | `false` |没有|连接 `modules/dns` 用于 Cloud DNS 和托管证书。 |
| `dns_create_zone` | `true` |没有|启用 DNS 模块后，创建新的 Cloud DNS 托管区域。 |
| `dns_existing_zone_name` | `""` |当 `!dns_create_zone` |要使用的现有 Cloud DNS 区域。 |
| `dns_create_certificate` | `true` |没有|启用 DNS 模块时创建 Google 管理的 SSL 证书。 |

## 尺寸和功能标志

Helm 部署脚本从 `terraform.tfvars` 读取这些标志以启用匹配的图表组件，而 Terraform 读取 `enable_fleet`、`enable_standalone_polly` 和 `enable_standalone_insights` 以在 Postgres 和 Redis 为外部时配置每个功能数据库。部署脚本读取 `sizing_profile` 来选择 Helm 大小调整覆盖。|变量|默认|必填 |描述 |
| - | - | - | - |
| `sizing_profile` | `default` |没有| Helm 大小：`production`（\~20 个用户，\~100 条记录/秒）、`production-large`（\~50 个用户，\~1000 条记录/秒）、`dev`（单副本）、`minimum`（停车楼层成本，不用于生产），或`default`（图表默认值）。对于 `enable_smithdb = true`，还设置 `smithdb_sizing` 默认值，并设置 `sandbox_host_machine_type` 默认值。 |
| `enable_deployments` | `false` |没有|启用LangSmith部署（侦听器、操作员、主机后端）。需要部署许可证权利。 |
| `enable_agent_builder` | `false` |没有|启用代理生成器。需要 `enable_deployments = true` 和 Agent Builder 权利。 |
| `enable_insights` | `false` |没有|启用 Insights（ClickHouse 支持的分析）。需要 Insights 权利。 |
| `enable_polly` | `false` |没有|启用 Polly（AI 评估和监控）。需要 `enable_deployments = true` 和 Polly 权利。 |
| `enable_fleet` | `false` |没有|启用舰队独立部署。不需要`enable_deployments`。与`enable_agent_builder`互斥。从 `enable_agent_builder` 迁移时重用 `langsmith_agent_builder_encryption_key`。 |
| `enable_standalone_polly` | `false` |没有|启用 Polly 独立部署。不需要`enable_deployments`。重复使用`langsmith_polly_encryption_key`。 |
| `enable_standalone_insights` | `false` |没有|启用 Insights 独立部署。不需要`enable_deployments`。重复使用`langsmith_insights_encryption_key`。 || `enable_sso_oidc` | `false` |没有|通过标准 OIDC 提供商启用 SSO 登录并关闭基本身份验证。 `init-values.sh` 从 `TF_VAR_langsmith_oauth_client_id`、`TF_VAR_langsmith_oauth_client_secret` 和 `TF_VAR_langsmith_oauth_issuer_url` 变量读取客户端 ID、客户端密钥和颁发者 URL，`setup-env.sh` 从 Secret Manager 加载这些变量。仅在使用基本身份验证进行初始安装并确认组织管理员访问权限后启用，或者您将自己锁定在 UI 之外。图表 0.16 上不可用。 |
| `enable_usage_telemetry` | `false` |没有|启用扩展使用遥测报告 (`PHONE_HOME_USAGE_REPORTING_ENABLED`)。 |

## 史密斯数据库

SmithDB 需要 GKE 标准。 Terraform 在 Autopilot 上拒绝 `enable_smithdb`，并拒绝迁移和查询门，除非 `smithdb_ingestion_enabled = true`。|变量|默认|必填 |描述 |
| - | - | - | - |
| `enable_smithdb` | `false` |没有|配置 SmithDB 依赖项：Cloud SQL 元存储、GCS 对象存储、Workload Identity 服务帐户以及缓存和计算节点池。 |
| `smithdb_sizing` | `null` |没有| `minimal`、`small`、`medium` 或 `large`。 `null`跟随`sizing_profile`：`minimum`给出`minimal`，`dev`和`default`给出`small`，`production`给出`medium`，并且`production-large` 给出 `large`。 `minimal`不创建SmithDB节点池，运行在普通节点池上。图表 0.16 上不可用。 |
| `smithdb_cache_storage` | `null` |没有| `local-ssd`（本地 SSD 缓存节点）或 `network-disk`（C3 或 C3D 缓存池上每个 Pod 的 Hyperdisk 平衡卷，或 `standard-rwo` 对于 `minimal`）。 `null` 对于`minimal` 给出`network-disk`，否则给出`local-ssd`。更改替换了缓存节点池。图表 0.16 上不可用。 |
| `smithdb_ingestion_enabled` | `false` |没有|将新写入路由到 SmithDB 以及 ClickHouse。仅在 SmithDB 服务通过就绪检查后启用。 |
| `smithdb_migration_enabled` | `false` |没有|从 ClickHouse 回填历史数据。需要`smithdb_ingestion_enabled`。还运行图表内的 Postgres 以了解迁移任务状态。在 Chart 0.16 上，需要 Helm Chart 版本 0.16.6 或更高版本。 || `smithdb_migration_start_time` | `""` |没有| RFC 3339 格式的回填开始时间，例如`2026-01-01T00:00:00Z`。清空保留图表默认窗口。图表 0.16 上不可用。 |
| `smithdb_query_enabled` | `false` |没有|提供从 SmithDB 读取的 UI 和 API。需要`smithdb_ingestion_enabled`。 |
| `smithdb_metastore_source` | `create` |没有| `create`（专用 Cloud SQL 实例）或 `external`（自带，例如身份验证代理后面的 AlloyDB）。必须是专用的空数据库，绝不是LangSmith 可操作的 Postgres。 |
| `smithdb_metastore_database_version` | `POSTGRES_18` |没有|元存储的 Cloud SQL 版本。 SmithDB 需要 PostgreSQL 18 或更高版本。 |
| `smithdb_metastore_tier` | `null` |没有|用于创建的元存储的 Cloud SQL 机器层。 `null` 跟随`smithdb_sizing`：`minimal` 为`db-custom-2-8192`，`small` 为`db-custom-4-16384`，`medium` 为`db-custom-6-32768`，`db-custom-10-65536` 为`large`。在图表 0.16 上，默认值为 `db-custom-2-8192`。 |
| `smithdb_metastore_disk_size` | `50` |没有|元存储磁盘大小（以 GB 为单位）。自动调整大小已打开，因此这是一个楼层。 |
| `smithdb_metastore_high_availability` | `false` |没有|将元存储作为区域 (HA) Cloud SQL 实例运行。 |
| `smithdb_metastore_deletion_protection` | `true` |没有|防止从 Terraform 和 Cloud SQL API 中删除元存储。设置 `false` 并在运行 destroy 之前应用该更改。 |
| `smithdb_metastore_ssl_mode` | `ENCRYPTED_ONLY` |没有|元存储的 Cloud SQL SSL 强制实施。 || `smithdb_metastore_use_ssl` | `null` |没有|通过 TLS 直接连接到元存储。 `null` 解析为 `smithdb_metastore_use_auth_proxy` 相反。必须是具有身份验证代理的 `false`。在图表 0.16 上，默认值为 `true`。 |
| `smithdb_metastore_use_auth_proxy` | `null` |没有|在每个 SmithDB Pod 中运行 Cloud SQL Auth Proxy sidecar。对于 `smithdb_metastore_source = "create"`，`null` 解析为 `true`；对于 `external`，`false`。需要 `smithdb_metastore_source = "create"` 和 `smithdb_metastore_use_ssl = false`。在图表 0.16 上，默认值为 `false`。 |
| `smithdb_auth_proxy_image` | `gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.25.0` |没有| Sidecar 的 Cloud SQL Auth 代理映像。固定一个准确的标签。 |
| `smithdb_metastore_master_username` | `smithdb` |没有|元存储的主用户名。 |
| `smithdb_metastore_master_password` | `null` |没有|元存储的主密码。 `null` 自动生成一个。用`TF_VAR_smithdb_metastore_master_password`设置。 |
| `smithdb_external_metastore_host` | `null` |当 `external` |元存储的现有 Postgres 实例的主机。在使用 Auth Proxy sidecar 前置 AlloyDB 时使用 `127.0.0.1`。 |
| `smithdb_external_metastore_port` | `5432` |没有|现有元存储的端口。 |
| `smithdb_external_metastore_database` | `smithdb` |没有|现有元存储上的数据库名称。 |
| `smithdb_external_metastore_username` | `null` |当 `external` |现有元存储的用户名。 |
| `smithdb_external_metastore_password` | `null` |没有|现有元存储的密码。使用 AlloyDB IAM 数据库身份验证时为空。用`TF_VAR_smithdb_external_metastore_password`设置。 || `smithdb_bucket_name` | `""` |没有|对象存储桶名称。空自动生成一个。使用单区域存储桶。 |
| `smithdb_bucket_kms_key` | `""` |没有|存储桶上 CMEK 的 Cloud KMS 密钥。 Empty 使用 Google 管理的加密。 |
| `smithdb_bucket_versioning_enabled` | `false` |没有|在存储桶上启用对象版本控制。 |
| `smithdb_bucket_force_destroy` | `false` |没有|允许 Terraform 在销毁时删除非空存储桶。仅针对测试堆栈设置`true`。 |
| `smithdb_service_account_email` | `null` |没有| SmithDB Pod 的现有服务帐户。 `null` 创建一个专用的最低权限。 |
| `smithdb_node_locations` | `[]` |没有| SmithDB 节点池的区域。清空使用该区域中的每个区域；验证机器类型和本地 SSD 可用性后固定此。 |
| `smithdb_instance_store_machine_type` | `null` |没有|缓存池的机器类型。 `null`遵循大小和缓存模式：`local-ssd`使用`n2-standard-16`、`n2-standard-32`或`n2-standard-64`，`network-disk`使用`c3-standard-22`、`c3-standard-44`或`c3-standard-88`，对于 `small`、`medium` 和 `large`。 `network-disk` 需要 C3 或 C3D 类型。在图表 0.16 上，默认值为 `n2-standard-16`。 || `smithdb_instance_store_local_ssd_count` | `null` |没有|每个缓存节点的本地 SSD。每个磁盘可容纳 375 GB。 `null` 给出 `small`、`medium` 和 `large` 以及 `local-ssd` 和 `0` 的 `2`、`4` 或 `8` `network-disk`。 Compute Engine 仅接受每种机器类型的特定计数。为捆绑磁盘的 `-lssd` 机器类型设置 `0`。在图表 0.16 上，默认值为 `2`。 |
| `smithdb_instance_store_disk_size` | `null` |没有|缓存池节点的启动磁盘大小（以 GB 为单位）。 `null` 为 `local-ssd` 提供 `100`，为 `network-disk` 提供 `300`。 `network-disk` 回填至少需要`300`。在图表 0.16 上，默认值为 `100`。 |
| `smithdb_instance_store_min_nodes` | `0` |没有|每个区域的最小缓存池节点。 `0` 让池缩放为零。 |
| `smithdb_instance_store_max_nodes` | `3` |没有|每个区域的最大缓存池节点数。 |
| `smithdb_compute_machine_type` | `null` |没有|计算池的机器类型（压缩、集群管理器、回填任务数据库）。 `null` 为 `small` 和 `medium` 提供 `n2-standard-8`，为 `large` 提供 `n2-standard-16`。在图表 0.16 上，默认值为 `n2-standard-8`。 |
| `smithdb_compute_disk_size` | `100` |没有|计算池节点的启动磁盘大小（以 GB 为单位）。 |
| `smithdb_compute_min_nodes` | `0` |没有|每个区域的最小计算池节点数。 |
| `smithdb_compute_max_nodes` | `3` |没有|每个区域的最大计算池节点数。 |

## 沙箱

沙箱需要 GKE 标准和 `enable_gcp_iam_module = true`。|变量|默认|必填 |描述 |
| - | - | - | - |
| `enable_sandboxes` | `false` |没有|为LangSmith沙箱配置基础设施。需要标准 GKE、外部 Redis、工作负载身份和具有可用 Linux KVM (`/dev/kvm`) 的沙箱主机节点。 |
| `sandbox_host_image_tag` | `""` |没有|已弃用并被忽略；将其从 `terraform.tfvars` 中删除。部署脚本从图表的应用程序版本中设置沙箱主机映像标签。在图表 0.16 上，启用沙箱时需要，并且 `init-values.sh` 在没有它的情况下退出。 |
| `sandbox_service_url_base_url` | `""` |没有|沙箱内运行的 HTTP 服务的服务 URL 的基本 URL。设置时需要主机的通配符 DNS 和 TLS。 |
| `platform_backend_component_label` | `langsmith-platform-backend` |没有|平台后端 Pod 的组件标签，从默认拒绝网络策略中排除，以便沙箱主机可以访问它们。如果您的 Helm 版本未命名为 `langsmith`，请设置为 `<release-name>-platform-backend`。 |
| `sandbox_host_machine_type` | `null` |没有|沙箱主机节点的机器类型。必须支持嵌套虚拟化。 `null` 遵循 `sizing_profile`：`n2-standard-32` 对于 `production` 和 `production-large`，否则为 `n2-standard-8`。不支持 C4 类型，因为池使用 pd-ssd 启动磁盘。在图表 0.16 上，默认值为 `n2-standard-8`。 |
| `sandbox_host_node_count` | `1` |没有|每个区域的初始沙箱主机节点。 || `sandbox_host_min_node_count` | `0` |没有|每个区域的最小沙箱主机节点数。 `0` 让自动缩放器仅保留沙箱主机需要的节点。在图表 0.16 上，默认值为 `1`。 |
| `sandbox_host_max_node_count` | `5` |没有|每个区域的最大沙箱主机节点数。 |
| `sandbox_host_disk_size_gb` | `200` |没有|沙箱主机节点的启动磁盘大小（以 GB 为单位）。 |
| `sandbox_host_ephemeral_local_ssd_count` | `0` |没有|支持沙箱主机节点上的 kubelet 和容器运行时临时存储的本地 SSD。 JuiceFS 缓存保留在启动磁盘上，因此这些磁盘不会加速沙箱文件 I/O。接受 `0`、`1`、`2`、`4`、`8`、`16` 或 `24`，具体取决于机器类型。在图表 0.16 上，任何非负整数都被接受。 |
| `sandbox_default_container_requests` | `{ cpu = "100m", memory = "128Mi" }` |没有|默认请求被注入到沙箱容器中，而忽略它们。 |
| `sandbox_juicefs_name` | `sandbox-juicefs` |没有|沙盒快照和文件系统状态的 JuiceFS 卷名称。 |
| `sandbox_juicefs_redis_memory_size` | `5` |没有|专用 JuiceFS 元数据 Memorystore 实例的内存（以 GB 为单位）。 |
| `sandbox_juicefs_redis_high_availability` | `true` |没有|对 JuiceFS 元数据 Redis 使用标准 HA 层。 |
| `sandbox_juicefs_redis_prevent_destroy` | `false` |没有|防止 Terraform 破坏 JuiceFS 元数据 Redis。 || `sandbox_juicefs_redis_rdb_snapshot_period` | `null` |没有| JuiceFS元数据Redis的RDB快照周期，例如`ONE_HOUR`。 `null` 禁用 RDB 持久化。 |
| `sandbox_juicefs_csi_config_secret_name` | `juicefs-csi-config` |没有| Kubernetes Secret 保存沙箱 JuiceFS 配置，以 `sandboxes.juicefs.existingSecretName` 形式传递到图表。在图表 0.16 上，通过为`sandboxes.juicefs.csi.existingSecretName`。 |
| `sandbox_juicefs_csi_config_secret_revision` | `1` |没有|增量重写JuiceFS配置Secret。重写后图表不会重新启动 sandbox-host，因此请在应用后重新启动它。 |

## 敏感值（用`setup-env.sh`设置）

Sourcing `infra/scripts/setup-env.sh` 将这些内容作为 `langsmith-<name_prefix>-<environment>-<key>` 写入 Google Secret Manager，并将它们导出为当前 shell 中的 `TF_VAR_*` 变量。切勿在 `terraform.tfvars` 中设置这些内联。 `make deploy` 还会从 `LANGSMITH_ADMIN_EMAIL` 环境变量中读取初始管理员电子邮件，而 `setup-env.sh` 未设置该环境变量。|变量|描述 |
| - | - |
| `postgres_password` |云 SQL 密码。提示。 |
| `langsmith_license_key` | LangSmith 企业许可证密钥。提示。 |
| `langsmith_admin_password` |初始组织管理员密码。提示。至少 12 个字符，包含一个小写字母、一个大写字母和一个符号。 |
| `langsmith_api_key_salt` |用于散列 API 密钥的盐。首次部署后必须保持稳定。 |
| `langsmith_jwt_secret` |基本身份验证会话的 JWT 密钥。必须保持稳定。 |
| `langsmith_deployments_encryption_key` |用于 LangSmith 部署的 Fernet 密钥。绝对不能改变。 |
| `langsmith_agent_builder_encryption_key` | Agent Builder 的 Fernet 密钥。绝对不能改变。 |
| `langsmith_insights_encryption_key` | Fernet 洞察的关键。绝对不能改变。 |
| `langsmith_polly_encryption_key` |波莉的 Fernet 钥匙。绝对不能改变。 |
| `sandbox_callback_signing_jwk` |沙箱回调签名密钥。仅当`enable_sandboxes = true`时生成。保持稳定。 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-gcp-variables.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。