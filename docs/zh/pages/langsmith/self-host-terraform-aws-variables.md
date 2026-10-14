<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS Terraform variables reference | https://docs.langchain.com/langsmith/self-host-terraform-aws-variables -->

# AWS Terraform 变量参考

AWS EKS 上自托管的 LangSmith Terraform 变量的完整参考。

[AWS Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/aws) 公开的每个输入变量的完整参考。首次填写 `terraform.tfvars` 或调整现有部署时使用它。

变量分为两类：

* **不敏感**（区域、大小、功能标志）：在 `infra/terraform.tfvars` 中设置。
* **敏感**（许可证密钥、密码、加密密钥）：通过 `infra/scripts/setup-env.sh` 获取，将它们写入 AWS SSM Parameter Store；然后，外部 Secrets Operator 将它们同步到集群中。

对于端到端安装，请参阅[deploy guide](/langsmith/self-host-terraform-aws-deploy)。有关模块如何组合在一起的信息，请参阅[architecture reference](/langsmith/self-host-terraform-aws-architecture)。

＃＃ 核|变量|默认 |必填|描述 |
| - | - | - | - |
| `name_prefix` |无 |是的 |所有资源名称的前缀。最多 15 个字符：小写字母、数字和连字符，以字母开头。格式：`{prefix}-{environment}-{resource}`。 |
| `environment` | `dev` |没有|环境标签：`dev`、`staging`、`prod`、`test` 或 `uat`。 |
| `region` | `us-west-2` |没有|所有资源的 AWS 区域。 |
| `owner` | `""` |没有|负责部署的团队或个人。作为标签应用。 |
| `cost_center` | `""` |没有|成本中心或计费标签。非空时用作标签。 |
| `tags` | `{}` |没有|附加标签应用于所有资源。 |

## 网络|变量|默认 |必填|描述 |
| - | - | - | - |
| `create_vpc` | `true` |没有|创建新的 VPC。设置 `false` 以使用现有的。 |
| `vpc_id` | `null` |当 `!create_vpc` |现有VPC ID。 |
| `private_subnets` | `[]` |当 `!create_vpc` |现有私有子网 ID。 |
| `public_subnets` | `[]` |当 `!create_vpc` 和 `alb_scheme = "internet-facing"` |现有公有子网 ID。 `internal` ALB 不需要。 |
| `vpc_cidr_block` | `null` |当 `!create_vpc` |现有 VPC CIDR 块。 |
| `vpc_private_subnets` | `[]` |没有|当 `create_vpc = true` 时覆盖私有子网的 CIDR。空使用模块默认值。 |
| `vpc_public_subnets` | `[]` |没有|当 `create_vpc = true` 时覆盖公共子网的 CIDR。空使用模块默认值。 |

## EKS|变量|默认 |必填|描述 |
| - | - | - | - |
| `enable_public_eks_cluster` | `true` |没有|启用公共 EKS API 端点。设置 `false` 为私有集群，并启用 `create_bastion` 通过 SSM 从堡垒运行 Terraform 和 Helm。 |
| `eks_public_access_cidrs` | `["0.0.0.0/0"]` |没有|允许 CIDR 到达公共 EKS API 端点。限制企业 VPN 出口 CIDR 以锁定访问。 |
| `eks_cluster_version` | `1.34` |没有| EKS Kubernetes 版本，`X.Y` 格式。有了`enable_smithdb = true`，保持`smithdb_karpenter_chart_version`兼容。 |
| `eks_managed_node_group_defaults` | `{ami_type = "AL2023_x86_64_STANDARD"}` |没有|默认配置应用于所有受管节点组。 |
| `eks_managed_node_groups` |一组`default`：`m5.4xlarge`，最少 3 个/最多 10 |没有|受管节点组定义。省略时，`desired_size` 默认为 `min_size`。 |
| `create_gp3_storage_class` | `true` |没有|创建`gp3`并将其设置为默认`StorageClass`并启用卷扩展。 |
| `eks_cluster_enabled_log_types` | `["api", "audit", "authenticator", "controllerManager", "scheduler"]` |没有|发送到 CloudWatch 的 EKS 控制平面日志类型。将 `[]` 设置为禁用。 |
| `eks_addons` | `{}` |没有| EKS 托管附加配置（`coredns`、`kube-proxy`、`vpc-cni` 等）。 |
| `create_langsmith_irsa_role` | `true` |没有|为 LangSmith Pod 创建 IRSA 角色（S3 访问）。 || `enable_bedrock_access` | `false` |没有|将 Bedrock `InvokeModel` 策略附加到 LangSmith IRSA 角色，以便 LangSmith Pod 可以通过工作负载身份而不是静态 AWS 密钥来调用 Bedrock 模型。需要`create_langsmith_irsa_role = true`。 |

## PostgreSQL (RDS)

|变量|默认 |必填|描述 |
| - | - | - | - |
| `postgres_source` | `external` |没有| `external`（具有私有访问权限的 RDS）或 `in-cluster`（通过 Helm 部署）。 |
| `postgres_instance_type` | `db.t3.large` |没有| RDS实例类。 |
| `postgres_storage_gb` | `10` |没有|初始 RDS 存储（以 GB 为单位）。 |
| `postgres_max_storage_gb` | `100` |没有|最大 RDS 存储（以 GB 为单位）（自动缩放）。 |
| `postgres_username` | `langsmith` |没有| RDS 数据库用户名。 |
| `postgres_engine_version` | `16` |没有| PostgreSQL 引擎版本。 PG 14 将于 2026 年 11 月停产；建议新部署使用 16。 |
| `postgres_password` | `""` |当外部 | RDS 主密码。如果参数尚不存在，则`setup-env.sh`生成（`openssl rand -hex 32`）并存储到SSM中；要在首次运行时提供您自己的脚本，请在获取脚本之前导出 `TF_VAR_postgres_password`。要旋转它，请运行 `manage-ssm.sh set`，然后运行 ​​`unset TF_VAR_postgres_password` 或打开一个新 shell，再次获取 `setup-env.sh`，然后运行 ​​`make apply`，以便 Terraform 更新 RDS 和 `langsmith-postgres` Secret。然后运行 ​​`kubectl rollout restart deployment -n langsmith` 以便 Pod 读取新密码。必须为 8 到 128 个字符，不得包含 `/`、`@`、`"`、`'` 或空格。 || `postgres_iam_database_authentication_enabled` | `true` |没有|在 RDS 上启用 IAM 数据库身份验证。 |
| `postgres_iam_database_user` | `null` |没有|用于 IAM 身份验证的数据库用户。必须以 `GRANT rds_iam TO <user>` 存在于 PostgreSQL 中。 |
| `postgres_deletion_protection` | `true` |没有|防止意外删除 RDS。为开发/测试环境设置`false`。 |
| `postgres_backup_retention_period` | `7` |没有|保留自动 RDS 备份的天数。 `0` 禁用备份。 |
| `postgres_skip_final_snapshot` | `false` |没有|当RDS实例被销毁时，跳过最终快照。为同名重建的开发/测试堆栈设置`true`；否则 destroy 会留下一个 `<name>-final` 快照。 |
| `postgres_existing_security_group_id` | `null` |没有|将现有安全组附加到 RDS 实例，而不是创建安全组。 Terraform 不管理其规则；它必须已允许来自 VPC CIDR 的 TCP 5432。 |

## Redis（ElastiCache）|变量|默认 |必填|描述 |
| - | - | - | - |
| `redis_source` | `external` |没有| `external`（具有私有访问权限的 ElastiCache）或 `in-cluster`（通过 Helm 部署）。 |
| `redis_instance_type` | `cache.m6g.xlarge` |没有| ElastiCache 节点类型。 |
| `redis_auth_token` | `""` |当外部 | ElastiCache 身份验证令牌，至少 16 个字符。如果参数尚不存在，则`setup-env.sh`生成（`openssl rand -hex 32`）并存储到SSM中；要在首次运行时提供您自己的脚本，请在获取脚本之前导出 `TF_VAR_redis_auth_token`。要轮换它，请运行 `manage-ssm.sh set`，然后运行 ​​`unset TF_VAR_redis_auth_token` 或打开一个新 shell，再次获取 `setup-env.sh`，然后运行 ​​`make apply`，以便 Terraform 更新 ElastiCache 和 `langsmith-redis` Secret。然后运行 ​​`kubectl rollout restart deployment -n langsmith` 以便 Pod 读取新令牌。 |
| `redis_existing_security_group_id` | `null` |没有|将现有安全组附加到 ElastiCache 复制组，而不是创建安全组。 Terraform 不管理其规则；它必须已允许来自 VPC CIDR 的 TCP 6379。 |

## S3|变量|默认 |必填|描述 |
| - | - | - | - |
| `s3_ttl_enabled` | `true` |没有|启用 S3 生命周期规则以使跟踪 blob 过期。 |
| `s3_ttl_short_days` | `14` |没有|短期对象过期前的天数（`ttl_s/` 前缀）。 |
| `s3_ttl_long_days` | `400` |没有|长期对象过期前的天数（`ttl_l/` 前缀）。 |
| `s3_kms_key_arn` | `""` |没有|用于 S3 加密的 KMS CMK ARN。空使用 SSE-S3 (AES256)。 |
| `s3_versioning_enabled` | `false` |没有|启用 S3 存储桶版本控制。由于保留以前的版本，因此增加了存储成本。 |

## TLS 和 DNS|变量|默认 |必填|描述 |
| - | - | - | - |
| `tls_certificate_source` | `acm` |没有| TLS 源：`acm`、`letsencrypt`（通过 ALB 解决的证书管理器 HTTP-01 ACME）或`none`。对于通过 Route 53（集群内网关）进行的 DNS-01 质询，请改用 `create_cert_manager_irsa`；两者是相互排斥的。 |
| `acm_certificate_arn` | `""` |当 `acm` 和 `langsmith_domain` 为空时 |现有 ACM 证书 ARN。留空并设置 `langsmith_domain` 以进行 Terraform 请求并验证证书。 |
| `letsencrypt_email` | `""` |当 `letsencrypt` 或 `create_cert_manager_irsa` | Let's Encrypt ACME 注册的电子邮件。 |
| `langsmith_domain` | `""` |当 `acm` 和 `acm_certificate_arn` 为空时 |自定义域。当设置且 `acm_certificate_arn` 为空时，Terraform 将创建 Route 53 托管区域（或使用 `dns_existing_zone_id`）、请求 ACM 证书并创建 ALB 别名记录。空使用 ALB 主机名。 |
| `dns_create_zone` | `true` |没有|为 `langsmith_domain` 创建公共 Route 53 托管区域。设置`false`将验证和别名记录写入`dns_existing_zone_id`。 |
| `dns_existing_zone_id` | `""` |当`dns_create_zone = false`、`langsmith_domain`设置且`acm_certificate_arn`为空时 | `langsmith_domain` 或父域的现有公共 Route 53 托管区域的 ID（以 `Z` 开头）。 || `dns_include_wildcard_san` | `false` |没有|将通配符 SAN (`*.<langsmith_domain>`) 添加到 ACM 证书。子域上的 HTTPS 需要。 |
| `langsmith_namespace` | `langsmith` |没有| LangSmith 的 Kubernetes 命名空间。 |

## 入口

|变量|默认 |必填|描述 |
| - | - | - | - |
| `alb_scheme` | `internet-facing` |没有| ALB 方案：`internet-facing`（公共子网）或 `internal`（私有子网，可通过 VPN、对等互连或 PrivateLink 访问）。 |
| `alb_allowed_cidr_blocks` | `["0.0.0.0/0"]` |没有|允许 CIDR 通过 HTTP/HTTPS 到达 ALB。限制 VPN 或办公室 CIDR 以进行受限访问部署。 |
| `alb_access_logs_enabled` | `false` |没有|启用对专用 S3 存储桶的 ALB 访问日志记录。 |
| `alb_existing_security_group_id` | `null` |没有|将现有安全组附加到 ALB，而不是创建安全组。 Terraform 不管理其规则；它必须已经允许来自 `alb_allowed_cidr_blocks` 的 HTTP 和 HTTPS。 |
| `enable_envoy_gateway` | `null` |没有|安装 Envoy 网关；该图表在 ALB 后面创建网关 API `HTTPRoute` 资源。未设置表示 `true`，除非 `enable_istio_gateway` 或 `enable_nginx_ingress` 是 `true`。为普通 ALB 支持的 Ingress 设置 `false`。支持跨命名空间的分割数据平面路由。 || `enable_nginx_ingress` | `false` |没有|安装 NGINX 入口控制器。 ALB 通过 `TargetGroupBinding` 转发到 NGINX 控制器 Pod。关闭 Envoy 网关默认设置。 |
| `enable_istio_gateway` | `false` |没有|安装 Istio（`istio-base`、`istiod`，以及 ALB `TargetGroupBinding` 后面的入口网关），并在节点安全组上为 istiod sidecar-injector webhook 打开端口 15017。关闭 Envoy 网关默认设置。 |
| `create_cert_manager_irsa` | `false` |没有|通过 Route 53 和 `letsencrypt-prod` DNS-01 `ClusterIssuer` 创建用于证书管理器 DNS-01 质询的 IRSA 角色（需要 `langsmith_domain` 和 `cert_manager_hosted_zone_id`）。与 Istio 网关一起使用。与`tls_certificate_source = "letsencrypt"`互斥。 |
| `cert_manager_hosted_zone_id` | `""` |当 `create_cert_manager_irsa` | cert-manager DNS-01 TXT 记录的 Route 53 托管区域 ID。 |

Terraform 拒绝将 `enable_envoy_gateway`、`enable_istio_gateway` 和 `enable_nginx_ingress` 中的多个设置为 `true` 的配置。

## ClickHouse

|变量|默认 |必填|描述 |
| - | - | - | - |
| `clickhouse_source` | `in-cluster` |没有| `in-cluster` 或 `external`（LangChain 托管 ClickHouse）。 |

## 史密斯数据库

`enable_smithdb` 提供 SmithDB 依赖项。三个门需要`enable_smithdb = true`，`smithdb_migration_enabled`和`smithdb_query_enabled`各需要`smithdb_ingestion_enabled = true`。|变量|默认 |必填|描述 |
| - | - | - | - |
| `enable_smithdb` | `false` |没有|配置 SmithDB 依赖项：本地 NVMe 实例上的专用元存储 RDS、S3 存储桶、IRSA 角色和 Karpenter 节点池。 |
| `smithdb_ingestion_enabled` | `false` |没有|将新写入路由到 SmithDB。需要`enable_smithdb`。 |
| `smithdb_migration_enabled` | `false` |没有|启用历史 ClickHouse 到 SmithDB 迁移。需要`smithdb_ingestion_enabled`。 |
| `smithdb_query_enabled` | `false` |没有|提供来自 SmithDB 的查询。需要`smithdb_ingestion_enabled`。 |
| `langsmith_release_name` | `langsmith` |没有| Helm 发布名称； SmithDB IRSA 信任范围为`<release>-langsmith-smithdb`。必须与 `deploy.sh` 使用的版本匹配。 |
| `smithdb_metastore_source` | `create` |没有| `create`（专用 RDS）或 `external`。必须与应用程序数据库分开。 |
| `smithdb_metastore_instance_class` | `db.m6g.large` |没有| Metastore RDS 实例类。 |
| `smithdb_metastore_engine_version` | `18` |没有| Metastore PostgreSQL 版本。 |
| `smithdb_metastore_allocated_storage` | `50` |没有|元存储存储（以 GB 为单位）。 |
| `smithdb_metastore_multi_az` | `false` |没有|运行元存储多可用区。 |
| `smithdb_metastore_deletion_protection` | `true` |没有|防止元存储删除；销毁前设置`false`。 |
| `smithdb_metastore_backup_retention_period` | `7` |没有|元存储备份天数； `0` 禁用备份。 |
| `smithdb_metastore_skip_final_snapshot` | `false` |没有|跳过销毁时的最终快照。 || `smithdb_metastore_use_ssl` | `true` |没有|通过 SSL 连接到元存储。 |
| `smithdb_metastore_master_username` | `smithdb` |没有|创建的元存储的主用户名。 Terraform 生成密码。 |
| `smithdb_external_metastore_host` | `null` |当 `enable_smithdb` 和 `external` |现有元存储主机名。 |
| `smithdb_external_metastore_port` | `5432` |没有|现有元存储端口。 |
| `smithdb_external_metastore_database` | `smithdb` |没有|现有元存储数据库名称。 |
| `smithdb_external_metastore_username` | `null` |当 `enable_smithdb` 和 `external` |现有元存储用户名。 |
| `smithdb_external_metastore_password` | `null` |当 `enable_smithdb` 和 `external` |现有元存储密码。敏感的;用`TF_VAR_smithdb_external_metastore_password`设置。 |
| `smithdb_existing_metastore_security_group_id` | `null` |没有|将现有安全组附加到创建的元存储。 |
| `smithdb_manage_byo_security_group_rules` | `false` |没有|让 Terraform 将 EKS 节点中的 TCP 5432 规则添加到现有安全组。 |
| `smithdb_bucket_name` | `""` |没有|桶名称；空生成`{name_prefix}-{environment}-smithdb-{suffix}`。 |
| `smithdb_s3_versioning_enabled` | `false` |没有|启用存储桶版本控制。 |
| `smithdb_s3_force_destroy` | `false` |没有|允许删除非空存储桶。仅测试堆栈。 |
| `smithdb_karpenter_chart_version` | `1.6.3` |没有|卡彭特图表版本；必须匹配`eks_cluster_version`（1.34需要1.6或更高版本，1.35需要1.9或更高版本，1.36需要1.13）。 |
| `smithdb_karpenter_ami_alias` | `al2023@latest` |没有| `EC2NodeClass` AMI 别名。 |
| `smithdb_node_arch` | `amd64` |没有| `amd64` 或 `arm64`。 || `smithdb_capacity_type` | `["on-demand"]` |没有|卡彭特容量类型；按需推荐。 |
| `smithdb_instance_store_sizes` | `["4xlarge", "8xlarge", "16xlarge"]` |没有|实例存储池中允许的大小。 |
| `smithdb_instance_store_min_local_nvme_gib` | `800` |没有|每个实例存储节点的最小本地 NVMe（以 GiB 为单位）。 |
| `smithdb_instance_store_limits` | `{cpu = 512, memory = "4096Gi"}` |没有|实例存储池 CPU 和内存上限。 |
| `smithdb_compute_sizes` | `["2xlarge", "4xlarge", "8xlarge"]` |没有|计算池中允许的大小。 |
| `smithdb_compute_limits` | `{cpu = 256, memory = "1024Gi"}` |没有|计算池 CPU 和内存上限。 |
| `smithdb_node_root_volume_size_gb` | `100` |没有| SmithDB 节点的根 EBS 大小（以 GB 为单位）。 |

## 堡垒（私有集群）|变量|默认 |必填|描述 |
| - | - | - | - |
| `create_bastion` | `false` |没有|创建 EC2 堡垒，以便通过 SSM 会话管理器或 SSH 进行私有集群访问。它在私有子网中运行，除非`bastion_enable_ssh = true`。 |
| `bastion_instance_type` | `t3.micro` |没有|堡垒的 EC2 实例类型。 |
| `bastion_key_name` | `null` |没有|用于 SSH 的 EC2 密钥对。 Empty 仅使用 SSM 会话管理器。 |
| `bastion_enable_ssh` | `false` |没有|打开堡垒安全组上的端口 22，并将堡垒放置在具有公共 IP 的公共子网中。 |
| `bastion_ssh_allowed_cidrs` | `[]` |没有| CIDR 允许通过 SSH 连接到堡垒。仅当`bastion_enable_ssh = true`时使用。 |
| `bastion_root_volume_size_gb` | `20` |没有|堡垒的根 EBS 卷大小（以 GB 为单位）。 |
| `bastion_existing_security_group_id` | `null` |没有|将现有安全组附加到堡垒，而不是创建安全组。 Terraform 不管理其规则。 |

## 安全和审计|变量|默认 |必填|描述 |
| - | - | - | - |
| `create_cloudtrail` | `false` |没有|创建 CloudTrail 跟踪记录对 S3 的 AWS API 调用。如果账户级或组织级跟踪已存在，则跳过。 |
| `cloudtrail_multi_region` | `true` |没有|记录所有区域的 API 调用。 |
| `cloudtrail_log_retention_days` | `365` |没有|在 S3 中保留 CloudTrail 日志的天数。 `0` 无限期保留它们。 |
| `create_waf` | `false` |没有|将 WAFv2 Web ACL 附加到 ALB（针对 OWASP Top 10、IP 信誉、错误输入的 AWS 托管规则）。成本：约 `$8` 至 `$10`/mo 基。 |
| `create_firewall` | `false` |没有|部署 AWS 网络防火墙以进行基于 FQDN 的出口过滤。需要`create_vpc = true`。成本：每个端点大约 `$0.395/hr` 加`$0.065/GB`。 |
| `firewall_allowed_fqdns` | `["beacon.langchain.com"]` |没有| `create_firewall = true` 时允许出站流量的域。与 TLS SNI 和 HTTP 主机标头匹配。所有其他目的地均被删除。 |
| `firewall_subnet_cidr` | `10.0.64.0/21` |没有|防火墙子网的 CIDR。必须位于 VPC CIDR 内，并且不得与私有子网（默认 `10.0.0.0/21`、`10.0.8.0/21` 和 `10.0.16.0/21`）或公有子网（默认 `10.0.40.0/21`、`10.0.48.0/21` 和 `10.0.56.0/21`）重叠。 |

## 尺寸和功能标志此表中的 `sizing_profile` 和 `enable_*` 标志由 `init-values.sh` 和 `deploy.sh` 读取，它们选择 Helm 覆盖文件。 Terraform 仅在需要专用数据库时才对标志起作用：`enable_fleet` 与 `fleet_storage = "external"`、`enable_insights` 或 `enable_polly` 及其 `*_storage = "external"`、以及 `enable_standalone_insights` 或 `enable_standalone_polly`。对于这些，Terraform 创建数据库初始化作业和 Kubernetes 密钥，并且计划时间前提条件要求 `postgres_source` 和 `redis_source` 为 `external`。

|变量|默认 |必填|描述 |
| - | - | - | - |
| `sizing_profile` | `default` |没有|头盔尺寸：`production`、`production-large`、`dev`、`minimum` 或 `default`。 |
| `langsmith_helm_chart_version` | `""`​​ |没有|将 LangSmith Helm 图表固定到确切的 `0.17.x` 补丁上。 Empty部署最新的v17补丁。验证拒绝其他行。 `CHART_VERSION` 环境变量会覆盖它。在 `v0.16.*` 模块版本上，使用 `0.16.x` 补丁。 |
| `enable_deployments` | `false` |没有|启用LangSmith部署（侦听器、操作员、主机后端）。需要部署许可证权利。 |
| `enable_fleet` | `false` |没有|启用队列及其所需的主机后端。不需要`enable_deployments`。对于 `fleet_storage = "external"`（默认），要求 `postgres_source` 和 `redis_source` 为 `external`。取代`enable_agent_builder`。 || `fleet_storage` | `external` |没有| Fleet 保存 PostgreSQL 和 Redis 数据的位置：`external`（要求 `postgres_source` 和 `redis_source` 为 `external`）或 `in-cluster`。 |
| `enable_insights` | `false` |没有|启用 Insights（人工智能驱动的跟踪分析）。需要 Insights 权利。存储遵循`insights_storage`。 |
| `insights_storage` | `in-cluster` |没有| Insights 保存其 PostgreSQL 和 Redis 数据的位置：`in-cluster`（图表 StatefulSets）或 `external`（共享 RDS 和 ElastiCache 上的专用数据库；要求 `postgres_source` 和 `redis_source` 为 `external`）。 |
| `enable_polly` | `false` |没有|启用 LangSmith 聊天（以前称为 Polly）。不需要`enable_deployments`。需要 LangSmith 聊天权限。存储遵循`polly_storage`。 |
| `polly_storage` | `in-cluster` |没有|其中 LangSmith Chat 保存其 PostgreSQL 和 Redis 数据：`in-cluster` 或 `external`（与 `insights_storage` 规则相同）。 |
| `enable_standalone_polly` | `false` |没有| `enable_polly = true` 和 `polly_storage = "external"` 的旧简写：共享 RDS 和 ElastiCache 上的专用数据库。要求 `postgres_source` 和 `redis_source` 为 `external`。 |
| `enable_standalone_insights` | `false` |没有| `enable_insights = true` 和 `insights_storage = "external"` 的旧简写：共享 RDS 和 ElastiCache 上的专用数据库。 ClickHouse 仍然是必需的。要求 `postgres_source` 和 `redis_source` 为 `external`。 |
| `enable_usage_telemetry` | `false` |没有|启用扩展使用遥测报告。 || `enable_sso_oidc` | `false` |没有|通过任何 OIDC 提供商启用 SSO 并关闭基本身份验证。首先将`oauth-client-id`、`oauth-client-secret`、`oauth-issuer-url`与`infra/scripts/manage-ssm.sh set`一起存储在SSM中；没有它们，`make init-values`就会失败。仅在首次安装后、确认组织管理员访问权限后才将其打开。 |

<Warning>
  `enable_agent_builder` 在图表 v16 中被删除。将其设置为 `true` 无法在 `terraform plan` 进行验证，因此将 `enable_agent_builder = true` 替换为 `enable_fleet = true`。
</Warning>

## 沙箱

|变量|默认 |必填|描述 |
| - | - | - | - |
| `enable_sandboxes` | `false` |没有|提供 LangSmith 沙箱先决条件：专用 JuiceFS 元数据 ElastiCache、`sandbox-host` 节点组和 JuiceFS 配置密钥。沙盒主机需要可用的 KVM (`/dev/kvm`)：裸机或嵌套虚拟化 x86\_64 类型。需要 LangSmith Helm Chart v16 或更高版本。 |
| `sandbox_host_node_count` | `1` |没有|沙箱主机节点的固定数量。至少`1`。 |
| `sandbox_host_instance_types` | `["m5d.metal"]` |没有|沙箱主机节点组的实例类型。必须公开 KVM。在没有实例存储的类型上，设置 `sandbox_host_local_nvme_bootstrap_enabled = false`。 |
| `sandbox_host_local_nvme_bootstrap_enabled` | `true` |没有|格式化本地 NVMe 实例存储设备：第一个作为交换，其余作为 JuiceFS 缓存。 || `sandbox_host_local_nvme_expected_device_count` | `4` |没有|每个主机必须拥有的实例存储 NVMe 设备的数量。必须与实例类型匹配。 |
| `sandbox_host_node_group_overrides` | `{}` |没有|高级覆盖合并到生成的沙箱主机节点组中。 |
| `sandbox_juicefs_name` | `sandbox-juicefs` |没有|沙盒快照和文件系统状态的 JuiceFS 卷名称。 |
| `sandbox_juicefs_redis_instance_type` | `cache.m6g.large` |没有| JuiceFS 元数据 Redis 的 ElastiCache 节点类型。 |
| `sandbox_juicefs_redis_snapshot_retention_limit` | `7` |没有| JuiceFS 元数据 Redis 的自动快照天数，`0` 到 `35`。 |
| `sandbox_juicefs_csi_config_secret_name` | `juicefs-csi-config` |没有| Terraform 在 LangSmith 命名空间中创建的 JuiceFS 配置密钥的名称，其键为 `name`、`metaurl`、`storage` 和 `bucket`。作为 `sandboxes.juicefs.existingSecretName` 传递到图表（图表 v16：`sandboxes.juicefs.csi.existingSecretName`）。 |
| `sandbox_juicefs_csi_config_secret_revision` | `1` |没有|增量重写只写 JuiceFS 配置密钥。重写不会重新启动`sandbox-host`，因此请在应用后重新启动它，例如使用默认发布名称和命名空间的`kubectl rollout restart deployment/langsmith-sandbox-host -n langsmith`。 |
| `sandbox_service_url_base_url` | `""` |没有|在沙箱内运行的 HTTP 服务的基本 URL。主机需要通配符 DNS 和 TLS。 |

## 敏感值（用`setup-env.sh`设置）寻源 `infra/scripts/setup-env.sh` 从 `/langsmith/{name_prefix}-{environment}/` 下的 SSM 参数存储中读取每个值。首次运行时，它会生成或提示输入值并将其存储在 SSM 中；外部 Secrets Operator 将 SSM 同步到集群中。 Terraform 仅读取 `postgres_password`、`redis_auth_token` 和 `sandbox_juicefs_redis_auth_token`；其他`TF_VAR_*`值已声明但未使用，因此`terraform.tfvars`中的值永远不会达到SSM。要提供您自己的值，请在获取脚本之前将其导出，仅当参数尚不存在时，脚本才会将其写入 SSM。对于 Terraform，导出的值也优先于 SSM。要更改存储的值，请运行`manage-ssm.sh set`。对于 Terraform 读取的三个值，`setup-env.sh` 不会重新读取已导出的变量，因此取消设置或打开新 shell，再次获取 `setup-env.sh`，然后运行 ​​`make apply`，以便 RDS 和 ElastiCache 凭证匹配。然后重新启动读取更改后的凭据的部署。|变量|描述 |
| - | - |
| `LANGSMITH_LICENSE_KEY` |环境变量，而不是 Terraform 变量。企业许可证密钥。第一次运行时提示。 |
| `LANGSMITH_ADMIN_PASSWORD` |环境变量。初始组织管理员密码。提示。至少 12 个字符，包含一个小写字母、一个大写字母和一个符号。 |
| `LANGSMITH_ADMIN_EMAIL` |环境变量。初始组织管理员电子邮件。提示。 |
| `postgres_password` | RDS 主密码。自动生成。由 Terraform 阅读。 |
| `redis_auth_token` | ElastiCache 身份验证令牌。自动生成。由 Terraform 阅读。 |
| `langsmith_api_key_salt` |用于散列 API 密钥的盐。自动生成。更改它会使每个 API 密钥失效。 |
| `langsmith_jwt_secret` |基本身份验证会话的 JWT 密钥。自动生成。更改它会注销每个用户。 |
| `langsmith_deployments_encryption_key` |用于 LangSmith 部署的 Fernet 密钥。自动生成。绝对不能改变。 |
| `langsmith_agent_builder_encryption_key` | Fleet 的 Fernet 密钥（为了兼容性而保留名称）。自动生成。绝对不能改变。 |
| `langsmith_insights_encryption_key` | Fernet 洞察的关键。自动生成。绝对不能改变。 |
| `langsmith_polly_encryption_key` | LangSmith 聊天的 Fernet 密钥（以前称为 Polly）。自动生成。绝对不能改变。 |
| `sandbox_juicefs_redis_auth_token` | JuiceFS 元数据 Redis 身份验证令牌。当`enable_sandboxes = true`时自动生成。由 Terraform 阅读。 || `sandbox_callback_signing_jwk` | Ed25519 用于沙箱回调的私有 JWK。当`enable_sandboxes = true`时自动生成。 |

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-aws-variables.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>