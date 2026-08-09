<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: GCP Terraform variables reference | https://docs.langchain.com/langsmith/self-host-terraform-gcp-variables -->

# GCP Terraform 变量参考

GCP GKE 上自托管的 LangSmith 的 Terraform 变量的完整参考。

[GCP Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/gcp) 公开的每个输入变量的完整参考。首次填写 `terraform.tfvars` 或调整现有部署时使用它。

变量分为两类：

* **不敏感**（区域、大小、功能标志）：在 `infra/terraform.tfvars` 中设置。
* **敏感**（许可证密钥、密码、加密密钥）：通过 `infra/scripts/setup-env.sh` 获取，它将它们写入 Google Secret Manager 并将其导出以用于 Terraform 和 Helm 步骤。

对于端到端安装，请参阅[deploy guide](/langsmith/self-host-terraform-gcp-deploy)。有关模块如何组合在一起的信息，请参阅[architecture reference](/langsmith/self-host-terraform-gcp-architecture)。

＃＃ 核|变量|默认 |必填|描述 |
| ---------------- | ---------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project_id` | — |是的 |创建资源的 GCP 项目 ID。                                                                                        |
| `region` | `us-west2` |没有| GCP 区域提供区域资源。                                                                                                 |
| `zone` | `us-west2-a` |没有|用于区域资源的 GCP 区域。                                                                                                      |
| `environment` | `prod` |没有|应用于标签的环境名称：`dev`、`staging`或`prod`。                                                                   || `name_prefix` | `ls` |没有|所有资源名称的前缀。 1～11个字符，以小写字母开头；仅限小写字母、数字和连字符。 |
| `unique_suffix` | `true` |没有|将随机后缀附加到资源名称。推荐用于多租户项目。                                                   |
| `owner` | `platform-team` |没有|所有者标签应用于所有资源。                                                                                              |
| `cost_center` | `""` |没有|用于计费归属的成本中心标签。                                                                                         |
| `labels` | `{}` |没有|附加标签应用于所有资源。                                                                                        |

## 网络|变量|默认|必填|描述 |
| -------------------------------------- | ------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subnet_cidr` | `10.0.0.0/20` |没有| GKE 子网的 CIDR。不得与现有范围重叠。                                                                                                                                                                                             || `pods_cidr` | `10.4.0.0/14` |没有| GKE Pod 的 CIDR。不得与子网或服务范围重叠。                                                                                                                                                                                      |
| `services_cidr` | `10.8.0.0/20` |没有| GKE 服务的 CIDR。不得与子网或 Pod 范围重叠。                                                                                                                                                                                      |
| `gke_master_authorized_cidrs` | `[]` |没有|允许外部 CIDR 到达 GKE 控制平面端点。空使控制平面可公开访问，因此 Terraform 管理的 Helm 和 `kubectl` 步骤可以从任何应用主机工作。填充用于生产的操作员和 CI 出口 CIDR。 |

## GKE|变量|默认 |必填|描述 |
| -------------------------------------- | ---------------- | -------- | ------------------------------------------------------------------------------------------ |
| `gke_use_autopilot` | `false` |没有|使用 GKE Autopilot 模式。 Autopilot 始终使用 Dataplane V2。                                |
| `gke_node_count` | `2` |没有|每个区域的初始节点数（仅限标准模式）。                                          |
| `gke_min_nodes` | `2` |没有|每个区域用于自动缩放的最小节点数。                                                    |
| `gke_max_nodes` | `10` |没有|每个区域用于自动缩放的最大节点数。                                                    |
| `gke_machine_type` | `e2-standard-4` |没有| GKE 节点机器类型（例如 `e2-standard-4`、`n2-standard-8`）。                      |
| `gke_disk_size` | `100` |没有|节点磁盘大小（以 GB 为单位）。                                                                      || `gke_release_channel` | `REGULAR` |没有| GKE 发布通道：`RAPID`、`REGULAR` 或 `STABLE`。                                      |
| `gke_deletion_protection` | `true` |没有|在 GKE 集群上启用删除保护。                                             |
| `gke_network_policy_provider` | `DATA_PLANE_V2` |没有|网络策略提供程序：`CALICO`（旧版）或`DATA_PLANE_V2`（基于 Cilium，推荐）。 |

## PostgreSQL（云 SQL）

|变量|默认|必填 |描述 |
| ------------------------------------------ | ------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- || `postgres_source` | `external` |没有| `external`（具有私有 IP 的 Cloud SQL）或 `in-cluster`（通过 Helm 部署）。                                                                                                                                   |
| `postgres_version` | `POSTGRES_15` |没有| Cloud SQL PostgreSQL 版本。                                                                                                                                                                                 |
| `postgres_tier` | `db-custom-2-8192` |没有| Cloud SQL 机器层（例如 `db-f1-micro`、`db-custom-2-8192`）。                                                                                                                                       |
| `postgres_disk_size` | `50` |没有| Cloud SQL 磁盘大小（以 GB 为单位）。                                                                                                                                                                                    || `postgres_high_availability` | `true` |没有|启用 Cloud SQL HA（区域备用）。                                                                                                                                                                       |
| `postgres_deletion_protection` | `true` |没有|在 Cloud SQL 上启用删除保护。                                                                                                                                                                      |
| `postgres_database_flags` |见描述|没有| Cloud SQL 实例上设置的数据库标志。默认为 `max_connections = 500` 加上检查点和连接日志记录标志。                                                                               |
| `postgres_ssl_mode` | `ENCRYPTED_ONLY` |没有| Cloud SQL SSL 强制执行。 `ENCRYPTED_ONLY` 每个连接都需要 TLS。 `ALLOW_UNENCRYPTED_AND_ENCRYPTED` 接受明文。 `TRUSTED_CLIENT_CERTIFICATE_REQUIRED` 还需要客户端证书。 |
| `postgres_password` | `""` |当外部 |云 SQL 密码。通过`TF_VAR_postgres_password`设置，或通过`setup-env.sh`存储在Secret Manager中。                                                                                                        |

## Redis（内存存储）|变量|默认 |必填|描述 |
| ---------------------------------- | ----------- | -------- | ------------------------------------------------------------------------------------------ |
| `redis_source` | `external` |没有| `external`（具有私有IP的Memorystore）或`in-cluster`（通过Helm部署）。 |
| `redis_version` | `REDIS_7_0` |没有| Memorystore Redis 版本。                                                    |
| `redis_memory_size` | `5` |没有| Memorystore Redis 内存大小（以 GB 为单位）。                                          |
| `redis_high_availability` | `true` |没有|启用 Memorystore HA（标准 HA 层）。                                     |
| `redis_prevent_destroy` | `false` |没有|防止 Redis 实例被 Terraform 意外破坏。                   |

## ClickHouse|变量|默认 |必填|描述 |
| ---------------------- | ------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `clickhouse_source` | `in-cluster` |没有| `in-cluster`（仅限开发/POC）、`langsmith-managed`（建议用于生产）或`external`（自托管）。 |
| `clickhouse_host` | `""` |当管理或外部时| ClickHouse 主机。                                                                                            |
| `clickhouse_port` | `9440` |没有| ClickHouse 本机协议端口（`9440` 对于 TLS，`9000` 对于非 TLS）。                                       |
| `clickhouse_http_port` | `8443` |没有| ClickHouse HTTP 端口（`8443` 对于 TLS，`8123` 对于非 TLS）。                                                  |
| `clickhouse_user` | `default` |没有| ClickHouse 用户名。                                                                                        || `clickhouse_password` | `""` |当管理或外部时|点击房屋密码。                                                                                        |
| `clickhouse_database` | `default` |没有| ClickHouse 数据库名称。                                                                                   |
| `clickhouse_tls` | `true` |没有|为 ClickHouse 连接启用 TLS。                                                                      |
| `clickhouse_ca_cert` | `""` |没有|用于 TLS 验证的 ClickHouse CA 证书 (PEM)。 Empty 使用系统 CA。                                |

## GCS 存储|变量|默认 |必填|描述 |
| ------------------------ | -------- | -------- | ------------------------------------------------------------------ |
| `storage_ttl_short_days` | `14` |没有| `ttl_s/` 前缀的 GCS TTL（以天为单位）。                          |
| `storage_ttl_long_days` | `400` |没有| `ttl_l/` 前缀的 GCS TTL（以天为单位）。                          |
| `storage_force_destroy` | `false` |没有|即使存储桶内有对象，也允许删除存储桶。谨慎使用。 |

## LangSmith 应用程序|变量|默认 |必填|描述 |
| ------------------------------------------ | ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `langsmith_namespace` | `langsmith` |没有| LangSmith 的 Kubernetes 命名空间。                                                                                                                                                                                               |
| `langsmith_domain` | `langsmith.example.com` |没有| LangSmith 的完全限定域名。                                                                                                                                                                                        || `langsmith_license_key` | `""` |没有|许可证密钥。使用`TF_VAR_langsmith_license_key`。                                                                                                                                                                                  |
| `langsmith_helm_chart_version` | `""` |没有|咨询图表版本，作为 Terraform 输出公开。部署脚本通过`CHART_VERSION`环境变量（默认`~0.15.1`，最新的`0.15.x`补丁）固定图表线。导出 `CHART_VERSION` 进行覆盖。 |

## 入口和 TLS|变量|默认 |必填|描述 |
| ------------------------ | ---------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `install_ingress` | `true` |没有|通过 Terraform 安装入口控制器。网关仅支持 HTTPS，因此 `tls_certificate_source` 必须是 `letsencrypt` 或 `existing`。 |
| `ingress_type` | `envoy` |没有|入口类型：`envoy`（已实现）或`istio` / `other`（保留）。                                                                     |
| `tls_certificate_source` | `none` |没有| `none`、`letsencrypt`（通过证书管理器自动）或`existing`（提供您自己的证书）。                                                    |
| `install_cert_manager` | `false` |没有|为 Let's Encrypt 证书安装 cert-manager。                                                                                      || `letsencrypt_email` | `""` |当 `letsencrypt` | Let's Encrypt 通知的电子邮件。                                                                                                    |
| `tls_certificate_crt` | `""` |当 `existing` | TLS 证书 (PEM)。加载`file()`。                                                                                                |
| `tls_certificate_key` | `""` |当`existing` | TLS 私钥 (PEM)。加载`file()`。                                                                                                |
| `tls_secret_name` | `langsmith-tls` |没有| Kubernetes 中 TLS 密钥的名称。                                                                                                    |

## 科达|变量|默认 |必填|描述 |
| -------------------------------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enable_langsmith_deployment` | `true` |没有|安装 KEDA 以实现 LangSmith 工作线程的队列驱动自动缩放。这是 KEDA 安装开关，而不是 LangSmith 部署功能（请参阅`enable_deployments`）。 |

## 可选的 GCP 模块|变量|默认 |必填 |描述 |
| ------------------------------------------ | -------- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| `enable_gcp_iam_module` | `true` |没有|线路 `modules/iam` 用于工作负载身份和存储桶 IAM 绑定。                  |
| `enable_secret_manager_module` | `false` |没有|连接 `modules/secrets` 将生成的引导凭据存储在 Secret Manager 中。 |
| `enable_dns_module` | `false` |没有|连接 `modules/dns` 用于 Cloud DNS 和托管证书。                        |
| `dns_create_zone` | `true` |没有|启用 DNS 模块后，创建新的 Cloud DNS 托管区域。                |
| `dns_existing_zone_name` | `""` |当`!dns_create_zone` |要使用的现有 Cloud DNS 区域。                                                    |
| `dns_create_certificate` | `true` |没有|启用 DNS 模块时创建 Google 管理的 SSL 证书。            |

## 尺寸和功能标志`app` Terraform 层和 Helm 部署脚本读取这些标志以启用匹配的图表组件并配置每个功能的数据库。部署脚本读取 `sizing_profile` 来选择 Helm 大小调整覆盖。

|变量|默认|必填|描述 |
| ---------------------------- | ---------| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sizing_profile` | `default` |没有| Helm 大小：`production`（\~20 个用户，\~100 条记录/秒）、`production-large`（\~50 个用户，\~1000 条记录/秒）、`dev`（单副本）、`minimum`（停车楼层成本，不用于生产），或`default`（图表默认值）。 || `enable_deployments` | `false` |没有|启用 LangSmith 部署（侦听器、操作员、主机后端）。需要部署许可证权利。                                                                                                            |
| `enable_agent_builder` | `false` |没有|启用代理生成器。需要 `enable_deployments = true` 和 Agent Builder 权利。                                                                                                                            |
| `enable_insights` | `false` |没有|启用 Insights（ClickHouse 支持的分析）。需要 Insights 权利。                                                                                                                                        |
| `enable_polly` | `false` |没有|启用 Polly（AI 评估和监控）。需要 `enable_deployments = true` 和 Polly 权利。                                                                                                             || `enable_fleet` | `false` |没有|启用队列独立部署（图表 v0.15+）。不需要`enable_deployments`。从 `enable_agent_builder` 迁移时重用 `langsmith_agent_builder_encryption_key`。                                    |
| `enable_standalone_polly` | `false` |没有|启用 Polly 独立部署（图表 v0.15+）。不需要`enable_deployments`。重复使用`langsmith_polly_encryption_key`。                                                                                       |
| `enable_standalone_insights` | `false` |没有|启用 Insights 独立部署（图表 v0.15+）。不需要`enable_deployments`。重复使用`langsmith_insights_encryption_key`。                                                                                 |
| `enable_usage_telemetry` | `false` |没有|启用扩展使用遥测报告 (`PHONE_HOME_USAGE_REPORTING_ENABLED`)。                                                                                                                                        |

## 敏感值（用`setup-env.sh`设置）

Sourcing `infra/scripts/setup-env.sh` 将这些写入 Google Secret Manager 并将它们导出到 Terraform 和 Helm 步骤的当前 shell 中。切勿将这些内联设置在 `terraform.tfvars` 中。|变量|描述 |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| `langsmith_license_key` | LangSmith 企业许可证密钥。                               |
| `langsmith_admin_password` |初始组织管理员密码。                                     |
| `langsmith_api_key_salt` |用于散列 API 密钥的盐。首次部署后必须保持稳定。 |
| `langsmith_jwt_secret` |基本身份验证会话的 JWT 密钥。必须保持稳定。           |
| `langsmith_deployments_encryption_key` | LangSmith 部署的 Fernet 密钥。绝对不能改变。         |
| `langsmith_agent_builder_encryption_key` | Agent Builder 的 Fernet 密钥。绝对不能改变。                |
| `langsmith_insights_encryption_key` | Fernet 洞察的关键。绝对不能改变。                     |
| `langsmith_polly_encryption_key` |波莉的 Fernet 钥匙。绝对不能改变。                        |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-gcp-variables.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>