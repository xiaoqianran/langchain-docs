<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS Terraform quick reference | https://docs.langchain.com/langsmith/self-host-terraform-aws-quick-reference -->

# AWS Terraform 快速参考

在 AWS EKS 上为 LangSmith 创建目标、Terraform 命令、kubectl、AWS CLI 和 Helm 操作。

针对使用 [AWS Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/aws) 预置的 AWS LangSmith 部署进行日常操作的命令备忘单。所有 `make` 目标都从 `modules/aws/` 运行。运行 `make help` 以获得内联摘要。

有关完整的部署设置，请参阅[AWS deployment guide](/langsmith/self-host-terraform-aws-deploy)。

## 首次设置

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd terraform/modules/aws

# 1. Generate terraform.tfvars (interactive wizard)
make quickstart

# 2. Load secrets into SSM Parameter Store and export TF_VAR_* into your shell.
#    Use `source`: Make runs each target in a subshell.
source infra/scripts/setup-env.sh

# 2a. Confirm secrets and TF_VAR_* are set (optional but recommended)
make secrets

# 3. Provision infrastructure
make init
make plan       # review: confirm no unexpected destroy or replace actions
make apply

# 4. Point kubectl at the EKS cluster
source infra/scripts/set-kubeconfig.sh

# 5. Generate Helm values from Terraform outputs
make init-values

# 5a. Verify post-infra state (optional)
make preflight-post

# 6. Deploy LangSmith
make deploy
```

`make quickstart` 和 `source infra/scripts/setup-env.sh` 完成后，快速路径：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make quickdeploy        # interactive (prompts before terraform apply)
make quickdeploy-auto   # non-interactive (auto-approves terraform)
```

## 第 2 天运营

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Check deployment state across all layers; print next-step guidance
make status

# Re-deploy after editing Helm values or upgrading
make deploy

# Pin a chart version for one deploy (or set langsmith_helm_chart_version in tfvars)
CHART_VERSION=<version> make deploy

# Raise the Helm timeout (default 30m)
HELM_TIMEOUT=45m make deploy

# Re-generate Helm values after Terraform changes
make init-values

# Re-sync ESO secrets without redeploying
make apply-eso

# Check SSM secrets and TF_VAR_* export status (read-only)
make secrets

# List all SSM parameters with last-modified timestamps
make secrets-list

# Manage SSM secrets interactively (view, set, diff vs cluster)
make ssm

# Point kubectl at the EKS cluster
source infra/scripts/set-kubeconfig.sh
```

## 飞行前检查

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Pre-Terraform: AWS credentials + IAM permissions
make preflight

# Post-infra (after make init-values): kubectl, SSM params, Helm values, TLS config
make preflight-post

# SSM only: confirm all parameters are populated (after sourcing setup-env.sh)
make preflight-ssm
```

## 附加组件

附加组件由 `infra/terraform.tfvars` 中的 `enable_*` 标志控制。设置标志，运行`make apply`，重新运行`make init-values`以复制匹配的值文件，然后运行`make deploy`。 Fleet、Insights 和 LangSmith 与外部存储、沙箱和 SmithDB 聊天都会创建 Terraform 资源。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_deployments     = true   # LangSmith Deployment (listener, operator, host-backend)
enable_fleet           = true   # Fleet (formerly Agent Builder); needs external Postgres and Redis when fleet_storage = "external" (default)
enable_insights        = true   # AI-powered trace analysis
enable_polly           = true   # LangSmith Chat (formerly Polly)
enable_usage_telemetry = false  # Extended usage telemetry
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make apply
make init-values
make deploy
```

`enable_agent_builder` 在图表 v16 中被删除。将其设置为 `true` 无法在 `terraform plan` 进行验证，因此请改用 `enable_fleet`。

## 尺寸配置文件

在`terraform.tfvars`中设置`sizing_profile`，然后重新运行`make init-values && make deploy`。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sizing_profile = "production"        # multi-replica with HPA (recommended)
sizing_profile = "production-large"  # high-volume (~50 users, ~1000 traces/sec)
sizing_profile = "dev"               # single-replica, minimal resources
sizing_profile = "minimum"           # smallest footprint, for constrained clusters
sizing_profile = "default"           # chart defaults (no sizing file)
```

## 制定目标

### 设置和秘密|命令|描述 |
| - | - |
| `make quickstart` |交互式向导。生成`infra/terraform.tfvars`（区域、节点大小、TLS 方法、附加组件）。 |
| `make setup-env` |打印用于将机密加载到 shell 中的确切 `source` 命令。无法直接导出变量。 |
| `make secrets` |显示每个参数的 SSM 机密状态 (`✓ SET` / `✗ MISSING`)，检查 `TF_VAR_*` 导出，给出后续步骤。 |
| `make secrets-list` |列出此部署的所有 SSM 参数以及上次修改的时间戳。 |
| `make ssm` |交互式 SSM 参数管理器。查看、设置、验证、比较集群 Secret。要旋转某个值，请设置一个新值。 |

### 飞行前

|命令|描述 |
| - | - |
| `make preflight` |在 Terraform 运行之前验证 AWS 凭证、IAM 权限和所需的 CLI 工具。 |
| `make preflight-post` |在`make init-values`之后、`make deploy`之前运行。检查 kubectl 上下文、集群可访问性、填充的 SSM 参数、存在的 Helm 值、TLS 配置。 |
| `make preflight-ssm` |仅检查 SSM 参数。范围比 `preflight-post` 更窄。 |

### 基础设施

`make init`、`make plan`、`make apply` 和 `make destroy` 将 `ARGS` 传递到 Terraform。例如：`make plan ARGS="-target=module.eks"`、`make plan ARGS="-out=tfplan"`，然后`make apply ARGS="tfplan"`、`make apply ARGS="-auto-approve"` 或 `make init ARGS="-upgrade"`。|命令|描述 |
| - | - |
| `make init` | `terraform init`。下载提供程序和模块。可以安全地重新运行。 |
| `make plan` | `terraform plan`。预览更改。每次申请前都要审查。 |
| `make apply` | `terraform apply`。配置 VPC、EKS、RDS、ElastiCache、S3、ALB、IRSA。 |
| `make destroy` | `terraform destroy`。拆除所有基础设施。运行`make uninstall`，先关闭删除保护。打印 `make purge-secrets` 作为下一步。 |
| `make tf ARGS="<subcommand>"` |在 `infra/` 中运行任何 Terraform 子命令，例如 `make tf ARGS="output -raw cluster_name"` 或 `make tf ARGS="state list"`。 |
| `make purge-secrets` |在 `make destroy` 之后删除此部署的 SSM 参数。当 Terraform 状态仍然有资源时拒绝，并要求您输入前缀进行确认。 |
| `make teardown-byo-sg BYO_SECURITY_GROUP_IDS="sg-..."` |从模块创建的 VPC 中删除在 Terraform 外部创建的安全组，以便 `make destroy` 可以删除 VPC。 |

### 头盔部署|命令|描述 |
| - | - |
| `make init-values` |从 Terraform 输出生成 `helm/values/langsmith-values-overrides.yaml`。根据 `enable_*` 标志复制附加值文件。 |
| `make deploy` |通过 Helm 部署或升级 LangSmith。更新 kubeconfig、运行预检、ESO 同步、分层值构建和核心准备情况检查。清除卡住的 `pending-upgrade` 或 `pending-install` 版本，并刷新过时的 ALB 主机名。 |
| `make apply-eso` |仅重新应用 ESO `ClusterSecretStore` 和 `ExternalSecret`。在轮换 Secret 后使用，无需完全重新部署 Helm。 |
| `make uninstall` |卸载 LangSmith Helm 版本。 Terraform 基础设施保持完好。 `DELETE_DATA_PVCS=true` 还删除了 ClickHouse PVC。 |

### 快速路径

|命令|描述 |
| - | - |
| `make quickdeploy` |通过一个命令进行完整部署。链 `terraform apply`、kubeconfig、`init-values` 和 Helm 使用门进行部署。需要 `make quickstart` 和来源的 `setup-env.sh`。 |
| `make quickdeploy-auto` |与`quickdeploy`相同，但非交互式。将 `-auto-approve` 传递给 terraform。 |
| `make deploy-all` |依次运行 `make apply`、`make kubeconfig`、`make init-values` 和 `make deploy`。 `make deploy` 在安装前刷新 kubeconfig。 |

### 实用程序|命令|描述 |
| - | - |
| `make status` |检查所有层的部署状态，打印下一步要运行的内容。启用 SmithDB 时报告 SmithDB 摄取和查询门。 |
| `make status-quick` |与 `status` 相同，但跳过 SSM、kubeconfig、Helm 发布和 Kubernetes 查询（更快）。 |
| `make kubeconfig` |打印要运行的`source infra/scripts/set-kubeconfig.sh`命令。将其导出 `KUBECONFIG` 到专用的 `~/.kube/langsmith-<cluster>` 文件，而不是编辑 `~/.kube/config`。 |
| `make tls` | BYO ACM 证书 + Route 53 A 别名。当设置了`langsmith_domain`并且需要DNS布线时使用。 |
| `make clean` |删除本地 Terraform 状态、备份、日志、生成的 Helm 值和 `terraform.tfvars`。追随`make destroy`和`make purge-secrets`。当 Terraform 状态仍跟踪资源或保留 SSM 参数时拒绝。如果状态已消失但本地状态备份仍然存在，则要求您在删除它们之前输入`DELETE BACKUPS`。 |

### 测试|命令|描述 |
| - | - |
| `make test-e2e` |针对当前集群的端到端网关测试（ALB 或 Envoy Gateway）。 |
| `make test-permutations` |在当前集群上按顺序进行排列测试。使用 `ARGS="1 2 5"` 作为子集。 |
| `make test-parallel` |跨隔离集群并行排列测试。您的集群未受影响。 |
| `make test-quickstart` |测试 `make quickstart` Route 53 选择和更新模式默认值。不进行 AWS 调用。 |

## kubectl

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Pod health
kubectl get pods -n langsmith
kubectl get pods -n langsmith -w
kubectl describe pod <pod-name> -n langsmith
kubectl logs <pod-name> -n langsmith --tail=100 -f
kubectl logs <pod-name> -n langsmith --previous --tail=50

# Gateway routes (default Envoy Gateway mode)
kubectl get gateway,httproute -n langsmith

# Ingress (classic ALB Ingress mode only)
kubectl get ingress -n langsmith
kubectl describe ingress -n langsmith

# External Secrets Operator sync status
kubectl get externalsecret langsmith-config -n langsmith

# TLS
kubectl get certificate -n langsmith
kubectl get challenges -n langsmith
kubectl describe certificate <cert-name> -n langsmith

# Helm
helm status langsmith -n langsmith
helm history langsmith -n langsmith
helm get values langsmith -n langsmith

# IRSA: check per-component service account annotations
kubectl get sa -n langsmith -o yaml | grep eks.amazonaws.com

# LangSmith Deployment (LangGraph Platform)
kubectl get lgp -n langsmith
kubectl get crd | grep langchain
kubectl get pods -n keda
```

## AWS CLI

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# EKS
aws eks list-clusters --region <region>
aws eks describe-cluster --name <cluster-name> --region <region>
aws eks update-kubeconfig --region <region> --name <cluster-name>

# RDS
aws rds describe-db-instances \
  --query "DBInstances[?contains(DBInstanceIdentifier,'<name_prefix>-<environment>')]"

# ElastiCache
aws elasticache describe-cache-clusters \
  --query "CacheClusters[?contains(CacheClusterId,'<name_prefix>-<environment>')]"

# S3
aws s3 ls s3://<bucket-name>
aws s3api get-bucket-location --bucket <bucket-name>

# ALB
aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?contains(LoadBalancerName,'<name_prefix>-<environment>')]"

# VPC endpoint
aws ec2 describe-vpc-endpoints \
  --filters "Name=service-name,Values=com.amazonaws.<region>.s3" \
  --query "VpcEndpoints[].State"

# SSM secrets (names only, so no secret value is printed)
aws ssm get-parameters-by-path --path "/langsmith/<name_prefix>-<environment>/" \
  --query "Parameters[].Name"

# IAM role
aws iam get-role --role-name <irsa-role-name>
```

## 地形

从 `modules/aws/` 运行这些：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make plan ARGS="-target=module.eks"
make apply ARGS="-target=module.eks"
make tf ARGS="output"
make tf ARGS="output -raw cluster_name"
# Entry point in Envoy (default), Istio, and NGINX modes; unused in classic ALB Ingress mode
make tf ARGS="output -raw alb_dns_name"
make tf ARGS="output -raw langsmith_irsa_role_arn"
make tf ARGS="output -raw bucket_name"
make tf ARGS="state list"
```

## 拆解

<Warning>
  拆卸会永久删除 LangSmith 数据。步骤 1 删除 ClickHouse 卷，步骤 4 删除 S3 中的每个跟踪对象，步骤 6 删除 SSM 参数。这些参数包括 API 密钥盐、JWT 密钥和加密密钥，这些参数永远不能更改。从 `-final` RDS 快照恢复的数据库需要它们：如果没有原始盐和密钥，现有 API 密钥将停止工作，并且无法读取加密数据。如果保留快照，请在 `make purge-secrets` 之前将 SSM 参数导出到安全位置。
</Warning>

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd terraform/modules/aws

# 1. Uninstall LangSmith. DELETE_DATA_PVCS=true also deletes the ClickHouse PVC,
#    whose EBS volume is otherwise left behind after destroy.
DELETE_DATA_PVCS=true make uninstall

# 2. Load the database and Redis credentials that apply and destroy require
source infra/scripts/setup-env.sh

# 3. Turn off deletion protection in infra/terraform.tfvars, then apply:
#      postgres_deletion_protection          = false
#      smithdb_metastore_deletion_protection = false   # only if SmithDB is enabled
make apply

# 4. Empty the trace bucket, which Terraform cannot delete while it holds objects
aws s3 rm s3://<bucket-name> --recursive

# 5. Destroy infrastructure
make destroy

# 6. Delete this deployment's SSM parameters
make purge-secrets

# 7. Remove local state, generated values, logs, and terraform.tfvars
make clean
```启用 SmithDB 后，还要在 `make destroy` 之前清空 SmithDB 存储桶，或在步骤 3 中设置 `smithdb_s3_force_destroy = true`。启用存储桶版本控制后，`aws s3 rm` 会留下旧的对象版本；在 S3 控制台或使用 `aws s3api delete-objects` 删除它们。

如果`make destroy`无法删除模块创建的VPC，因为在Terraform之外创建的安全组仍在其中，请运行`make teardown-byo-sg BYO_SECURITY_GROUP_IDS="sg-..."`，然后再次运行`make destroy`。当`create_vpc = false`时，脚本拒绝运行。

RDS 拍摄名为 `<identifier>-final` 的最终快照，除非 `postgres_skip_final_snapshot = true`。启用 SmithDB 后，元存储 RDS 还会获取 `-final` 快照，除非 `smithdb_metastore_skip_final_snapshot = true`。如果该快照仍然存在，则重复销毁会失败并显示 `DBSnapshotAlreadyExists`。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-aws-quick-reference.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>