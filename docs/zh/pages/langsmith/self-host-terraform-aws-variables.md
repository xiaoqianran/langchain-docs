<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS Terraform variables reference | https://docs.langchain.com/langsmith/self-host-terraform-aws-variables -->

# AWS Terraform 变量参考

AWS EKS 上自托管的 LangSmith 的 Terraform 变量的完整参考。

[AWS Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/aws) 公开的每个输入变量的完整参考。首次填写 `terraform.tfvars` 或调整现有部署时使用它。

变量分为两类：

* **不敏感**（区域、大小、功能标志）：在 `infra/terraform.tfvars` 中设置。
* **敏感**（许可证密钥、密码、加密密钥）：通过 `infra/scripts/setup-env.sh` 获取，将它们写入 AWS SSM Parameter Store；然后，外部 Secrets Operator 将它们同步到集群中。

对于端到端安装，请参阅[deploy guide](/langsmith/self-host-terraform-aws-deploy)。有关模块如何组合在一起的信息，请参阅[architecture reference](/langsmith/self-host-terraform-aws-architecture)。

＃＃ 核|变量|默认 |必填|描述 |
| ------------- | ----------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name_prefix` | — |是的 |所有资源名称的前缀。最多 15 个字符：小写字母、数字和连字符，以字母开头。格式：`{prefix}-{environment}-{resource}`。 |
| `environment` | `dev` |没有|环境标签：`dev`、`staging`、`prod`、`test` 或 `uat`。                                                                                                       |
| `region` | `us-west-2` |没有|所有资源的 AWS 区域。                                                                                                                                      |
| `owner` | `""` |没有|负责部署的团队或个人。作为标签应用。                                                                                               || `cost_center` | `""` |没有|成本中心或计费标签。非空时用作标签。                                                                                                     |
| `tags` | `{}` |没有|附加标签应用于所有资源。                                                                                                                          |

## 网络

|变量|默认 |必填|描述 |
| -------------------- | -------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `create_vpc` | `true` |没有|创建新的 VPC。设置 `false` 以使用现有的。                                       |
| `vpc_id` | `null` |当 `!create_vpc` |现有VPC ID。                                                                            |
| `private_subnets` | `[]` |当 `!create_vpc` |现有私有子网 ID。                                                                || `public_subnets` | `[]` |当 `!create_vpc` |现有公有子网 ID。                                                                 |
| `vpc_cidr_block` | `null` |当 `!create_vpc` |现有 VPC CIDR 块。                                                                    |
| `vpc_private_subnets` | `[]` |没有|当 `create_vpc = true` 时覆盖私有子网的 CIDR。空使用模块默认值。 |
| `vpc_public_subnets` | `[]` |没有|当 `create_vpc = true` 时覆盖公共子网的 CIDR。空使用模块默认值。  |

## EKS|变量|默认 |必填|描述 |
| --------------------------------- | ---------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enable_public_eks_cluster` | `true` |没有|启用公共 EKS API 端点。设置 `false` 为私有集群，并启用 `create_bastion` 通过 SSM 从堡垒运行 Terraform 和 Helm。 |
| `eks_public_access_cidrs` | `["0.0.0.0/0"]` |没有|允许 CIDR 到达公共 EKS API 端点。限制企业 VPN 出口 CIDR 以锁定访问。                                       || `eks_cluster_version` | `1.33` |没有| EKS Kubernetes 版本。                                                                                                                               |
| `eks_managed_node_group_defaults` | `{ami_type = "AL2023_x86_64_STANDARD"}` |没有|默认配置应用于所有受管节点组。                                                                                             |
| `eks_managed_node_groups` |一组`default`：`m5.4xlarge`，最少 3 个/最多 10 |没有|受管节点组定义。省略时，`desired_size` 默认为 `min_size`。                                                                   |
| `create_gp3_storage_class` | `true` |没有|创建`gp3`并将其设置为默认`StorageClass`并启用卷扩展。                                                                  |
| `eks_cluster_enabled_log_types` | `["api", "audit", "authenticator", "controllerManager", "scheduler"]` |没有|发送到 CloudWatch 的 EKS 控制平面日志类型。将 `[]` 设置为禁用。                                                                                  || `eks_addons` | `{}` |没有| EKS 托管附加配置（`coredns`、`kube-proxy`、`vpc-cni` 等）。                                                                  |
| `create_langsmith_irsa_role` | `true` |没有|为 LangSmith Pod 创建 IRSA 角色（S3 访问）。                                                                                                  |

## PostgreSQL (RDS)|变量|默认|必填 |描述 |
| ---------------------------------------------------------- | ------------- | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `postgres_source` | `external` |没有| `external`（具有私有访问权限的 RDS）或 `in-cluster`（通过 Helm 部署）。                                |
| `postgres_instance_type` | `db.t3.large` |没有| RDS实例类。                                                                                      |
| `postgres_storage_gb` | `10` |没有|初始 RDS 存储（以 GB 为单位）。                                                                               |
| `postgres_max_storage_gb` | `100` |没有|最大 RDS 存储（以 GB 为单位）（自动缩放）。                                                                 || `postgres_username` | `langsmith` |没有| RDS 数据库用户名。                                                                                   |
| `postgres_engine_version` | `16` |没有| PostgreSQL 引擎版本。 PG 14 将于 2026 年 11 月停产；建议新部署使用 16。    |
| `postgres_password` | `""` |当外部 | RDS 密码。通过`TF_VAR_postgres_password`设置，或者通过`setup-env.sh`自动生成并存储在SSM中。 |
| `postgres_iam_database_authentication_enabled` | `true` |没有|在 RDS 上启用 IAM 数据库身份验证。                                                               |
| `postgres_iam_database_user` | `null` |没有|用于 IAM 身份验证的数据库用户。必须以 `GRANT rds_iam TO <user>` 存在于 PostgreSQL 中。           |
| `postgres_deletion_protection` | `true` |没有|防止意外删除 RDS。为开发/测试环境设置`false`。                                  |
| `postgres_backup_retention_period` | `7` |没有|保留自动 RDS 备份的天数。 `0` 禁用备份。                                              |

## Redis（ElastiCache）|变量|默认|必填 |描述 |
| -------------------- | ------------------ | ------------- | -------------------------------------------------------------------------------------------------------------- |
| `redis_source` | `external` |没有| `external`（具有私有访问权限的 ElastiCache）或 `in-cluster`（通过 Helm 部署）。                              |
| `redis_instance_type` | `cache.m6g.xlarge` |没有| ElastiCache 节点类型。                                                                                         |
| `redis_auth_token` | `""` |当外部 | ElastiCache 身份验证令牌。由`setup-env.sh`自动生成并存储在SSM中。通过`TF_VAR_redis_auth_token`设置。 |

## S3|变量|默认 |必填|描述 |
| ----------------------- | -------- | -------- | -------------------------------------------------------------------------------------------------- |
| `s3_ttl_enabled` | `true` |没有|启用 S3 生命周期规则以使跟踪 blob 过期。                                    |
| `s3_ttl_short_days` | `14` |没有|短期对象过期前的天数（`ttl_s/` 前缀）。                         |
| `s3_ttl_long_days` | `400` |没有|长期对象过期前的天数（`ttl_l/` 前缀）。                          |
| `s3_kms_key_arn` | `""` |没有|用于 S3 加密的 KMS CMK ARN。空使用 SSE-S3 (AES256)。                          |
| `s3_versioning_enabled` | `false` |没有|启用 S3 存储桶版本控制。由于保留以前的版本，因此增加了存储成本。 |

## TLS 和 DNS|变量|默认 |必填|描述 |
| -------------------------- | ----------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tls_certificate_source` | `acm` |没有| TLS 源：`acm`、`letsencrypt`（通过 ALB 解决的证书管理器 HTTP-01 ACME）或`none`。对于通过 Route 53（集群内网关）进行的 DNS-01 质询，请改用 `create_cert_manager_irsa`；两者是相互排斥的。 |
| `acm_certificate_arn` | `""` |当 `acm` |现有 ACM 证书 ARN。                                                                                                                                                                                                         || `letsencrypt_email` | `""` |当 `letsencrypt` | Let's Encrypt ACME 注册的电子邮件。                                                                                                                                                                                            |
| `langsmith_domain` | `""` |没有|自定义域。设置后（且 `acm_certificate_arn` 为空），将配置 Route 53 托管区域、ACM 证书和别名记录。空使用 ALB 主机名。                                                                      |
| `dns_include_wildcard_san` | `false` |没有|将通配符 SAN (`*.<langsmith_domain>`) 添加到 ACM 证书。子域上的 HTTPS 需要。                                                                                                                                   |
| `langsmith_namespace` | `langsmith` |没有| LangSmith 的 Kubernetes 命名空间。                                                                                                                                                                                                   |

## 入口|变量|默认 |必填 |描述 |
| -------------------------------------- | ----------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `alb_scheme` | `internet-facing` |没有| ALB 方案：`internet-facing`（公共子网）或 `internal`（私有子网，可通过 VPN、对等互连或 PrivateLink 访问）。                                                                                                                   || `alb_allowed_cidr_blocks` | `["0.0.0.0/0"]` |没有|允许 CIDR 通过 HTTP/HTTPS 到达 ALB。限制 VPN 或办公室 CIDR 以进行受限访问部署。                                                                                                                                 |
| `alb_access_logs_enabled` | `false` |没有|启用对专用 S3 存储桶的 ALB 访问日志记录。                                                                                                                                                                                           |
| `enable_envoy_gateway` | `false` |没有|安装 Envoy Gateway（Kubernetes Gateway API）而不是 ALB Ingress。多命名空间数据平面部署所需。                                                                                                                    || `enable_nginx_ingress` | `false` |没有|安装 NGINX 入口控制器。 ALB 通过 `TargetGroupBinding` 转发到 NGINX 控制器 Pod。                                                                                                                                   |
| `enable_istio_gateway` | `false` |没有|在节点安全组上为 istiod sidecar-injector webhook 打开端口 15017。在 EKS 上运行 Istio 时需要。                                                                                                                       |
| `istio_nlb_scheme` | `internet-facing` |没有| Istio 入口网关 NLB 方案：`internet-facing` 或 `internal`。由设置向导写入`tfvars`，但尚未被任何模块使用； Istio 路径当前使用 ALB `TargetGroupBinding` 后面的 ClusterIP 服务。 |
| `create_cert_manager_irsa` | `false` |没有|通过 Route 53 创建用于 cert-manager DNS-01 质询的 IRSA 角色。这是 Let's Encrypt with Istio Gateway 所必需的。应用后运行`make tls`。                                                                                              || `cert_manager_hosted_zone_id` | `""` |当`create_cert_manager_irsa` | cert-manager DNS-01 TXT 记录的 Route 53 托管区域 ID。                                                                                                                                                                                  |

## ClickHouse

|变量|默认 |必填|描述 |
| ------------------- | ------------ | -------- | ---------------------------------------------------------------------------------------------------------- |
| `clickhouse_source` | `in-cluster` |没有| `in-cluster`（仅限开发/POC）或`external`（LangChain Managed ClickHouse，推荐用于生产）。 |

## 堡垒（私有集群）|变量|默认 |必填|描述 |
| -------------------------------------- | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `create_bastion` | `false` |没有|在公有子网中创建 EC2 堡垒，以便通过 SSM 会话管理器或 SSH 进行私有集群访问。 |
| `bastion_instance_type` | `t3.micro` |没有|堡垒的 EC2 实例类型。                                                                  |
| `bastion_key_name` | `null` |没有|用于 SSH 的 EC2 密钥对。 Empty 仅使用 SSM 会话管理器。                                          |
| `bastion_enable_ssh` | `false` |没有|打开堡垒安全组上的端口 22。                                                         |
| `bastion_ssh_allowed_cidrs` | `[]` |没有| CIDR 允许通过 SSH 连接到堡垒。仅当`bastion_enable_ssh = true`时使用。                    |
| `bastion_root_volume_size_gb` | `20` |没有|堡垒的根 EBS 卷大小（以 GB 为单位）。                                                         |

## 安全和审计|变量|默认 |必填|描述 |
| ------------------------------------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create_cloudtrail` | `false` |没有|创建 CloudTrail 跟踪记录对 S3 的 AWS API 调用。如果账户级或组织级跟踪已存在，则跳过。                                     |
| `cloudtrail_multi_region` | `true` |没有|记录所有区域的 API 调用。                                                                                                                   |
| `cloudtrail_log_retention_days` | `365` |没有|在 S3 中保留 CloudTrail 日志的天数。 `0` 无限期保留它们。                                                                                     || `create_waf` | `false` |没有|将 WAFv2 Web ACL 附加到 ALB（针对 OWASP Top 10、IP 信誉、错误输入的 AWS 托管规则）。成本：大约`$8`到`$10`/月基。                  |
| `create_firewall` | `false` |没有|部署 AWS 网络防火墙以进行基于 FQDN 的出口过滤。需要`create_vpc = true`。成本：每个端点大约`$0.395/hr`加上`$0.065/GB`。      |
| `firewall_allowed_fqdns` | `["beacon.langchain.com"]` |没有| `create_firewall = true` 时允许出站流量的域。与 TLS SNI 和 HTTP 主机标头匹配。所有其他目的地均被删除。 |
| `firewall_subnet_cidr` | `10.0.64.0/21` |没有|防火墙子网的 CIDR。必须位于 VPC CIDR 内，并且不得与私有或公有子网重叠。                                              |

## 尺寸和功能标志`sizing_profile`和大多数`enable_*`标志由`init-values.sh`和`deploy.sh`读取； Terraform 不会直接作用于它们。它们会影响脚本生成的 Helm 覆盖文件。三个独立标志（`enable_fleet`、`enable_standalone_polly`、`enable_standalone_insights`）是例外：Terraform 读取它们以创建数据库初始化作业和 Kubernetes 机密，并对它们所需的外部 Postgres 和 Redis 输入强制执行计划时前提条件。

|变量|默认|必填|描述 |
| ---------------------------- | ---------| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sizing_profile` | `default` |没有|头盔尺寸：`production`、`production-large`、`dev`、`minimum` 或 `default`。                                                     |
| `enable_deployments` | `false` |没有|启用 LangSmith 部署（侦听器、操作员、主机后端）。需要部署许可证权利。                      || `enable_agent_builder` | `false` |没有|启用代理生成器。需要 `enable_deployments = true` 和 Agent Builder 权利。                                      |
| `enable_insights` | `false` |没有|启用 Insights（ClickHouse 支持的分析）。需要 Insights 权利。                                                  |
| `enable_polly` | `false` |没有|启用 Polly（AI 评估和监控）。需要 `enable_deployments = true` 和 Polly 权利。                       |
| `enable_usage_telemetry` | `false` |没有|启用扩展使用遥测报告。                                                                                         |
| `enable_fleet` | `false` |没有|启用队列独立部署（图表 v0.15+）。需要 `enable_deployments = true` 以及外部 Postgres 和 Redis。           |
| `enable_standalone_polly` | `false` |没有|启用 Polly 独立部署（图表 v0.15+）。不需要`enable_deployments`。需要外部 Postgres 和 Redis。    |
| `enable_standalone_insights` | `false` |没有|启用 Insights 独立部署（图表 v0.15+）。不需要`enable_deployments`。需要外部 Postgres 和 Redis。 |

## 敏感值（用`setup-env.sh`设置）Sourcing `infra/scripts/setup-env.sh` 将这些写入 AWS SSM Parameter Store。外部 Secrets Operator 将它们作为 Kubernetes 密钥同步到集群中。这些不是声明的 Terraform 变量，并且在 `terraform.tfvars` 中没有位置；只能通过 SSM 设置它们。

|变量|描述 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `langsmith_license_key` | LangSmith 企业许可证密钥。                                                           |
| `langsmith_admin_password` |初始组织管理员密码。至少 12 个字符，包含小写字母、大写字母和符号。 |
| `langsmith_api_key_salt` |用于散列 API 密钥的盐。首次部署后必须保持稳定。                             |
| `langsmith_jwt_secret` |基本身份验证会话的 JWT 密钥。必须保持稳定。                                       |
| `langsmith_deployments_encryption_key` | LangSmith 部署的 Fernet 密钥。绝对不能改变。                                    || `langsmith_agent_builder_encryption_key` | Agent Builder 的 Fernet 密钥。绝对不能改变。                                            |
| `langsmith_insights_encryption_key` | Fernet 洞察的关键。绝对不能改变。                                                 |
| `langsmith_polly_encryption_key` |波莉的 Fernet 钥匙。绝对不能改变。                                                    |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-aws-variables.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>