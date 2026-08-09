<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS Terraform quick reference | https://docs.langchain.com/langsmith/self-host-terraform-aws-quick-reference -->

# AWS Terraform 快速参考

使 LangSmith 的目标、Terraform 命令、kubectl、AWS CLI 和 Helm 操作在 AWS EKS 上自托管。

针对使用 [AWS Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/aws) 预置的 AWS LangSmith 部署进行日常操作的命令备忘单。所有 `make` 目标都从 `modules/aws/` 运行。运行 `make help` 以获得内联摘要。

有关完整的部署设置，请参阅[AWS deployment guide](/langsmith/self-host-terraform-aws-deploy)。

## 首次设置

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd terraform/modules/aws

# 1. Generate terraform.tfvars (interactive wizard)
make quickstart

# 2. Load secrets into SSM Parameter Store and export TF_VAR_* into your shell.
#    Must use `source` — Make runs each target in a subshell.
source infra/scripts/setup-env.sh

# 2a. Confirm secrets and TF_VAR_* are set (optional but recommended)
make secrets

# 3. Provision infrastructure (~20–25 min)
make init
make plan       # review — confirm no unexpected destroy/replace actions
make apply

# 3a. Verify post-infra state (optional)
make preflight-post

# 4. Update kubeconfig for the EKS cluster
make kubeconfig

# 5. Generate Helm values from Terraform outputs
make init-values

# 6. Deploy LangSmith (~10 min)
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

# Re-generate Helm values after Terraform changes
make init-values

# Re-sync ESO secrets without redeploying
make apply-eso

# Check SSM secrets and TF_VAR_* export status (read-only)
make secrets

# List all SSM parameters with last-modified timestamps
make secrets-list

# Manage SSM secrets interactively (view, set, rotate, diff vs cluster)
make ssm

# Update kubeconfig for the EKS cluster
make kubeconfig
```

## 飞行前检查

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Pre-Terraform: AWS credentials + IAM permissions
make preflight

# Post-apply: kubectl, SSM params, Helm values, TLS config
make preflight-post

# SSM only — confirm all parameters are populated (after make setup-env)
make preflight-ssm
```

## 附加组件

附加组件由 `infra/terraform.tfvars` 中的 `enable_*` 标志控制。设置标志，重新运行`init-values`以复制匹配的值文件，然后重新部署。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_deployments     = true   # LangGraph Platform (required for Fleet, Agent Builder, and Polly)
enable_fleet           = true   # Fleet (formerly Agent Builder), standalone (chart v0.15+); requires external Postgres + Redis
enable_agent_builder   = false  # Older agent-builder path; mutually exclusive with enable_fleet
enable_insights        = true   # ClickHouse-backed analytics
enable_polly           = true   # Polly AI eval/monitoring
enable_usage_telemetry = false  # Extended usage telemetry
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init-values
make deploy
```

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
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `make quickstart` |交互式向导。生成`infra/terraform.tfvars`（区域、节点大小、TLS 方法、附加组件）。          |
| `make setup-env` |打印准确的 `source` 命令，用于将机密加载到 shell 中。无法直接导出变量。  |
| `make secrets` |显示每个参数的 SSM 机密状态 (`✓ SET` / `✗ MISSING`)，检查 `TF_VAR_*` 导出，给出后续步骤。 |
| `make secrets-list` |列出此部署的所有 SSM 参数以及上次修改的时间戳。                                |
| `make ssm` |交互式 SSM 参数管理器。查看、设置、旋转、验证、比较集群 Secret。               |

### 飞行前|命令|描述 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `make preflight` |在 Terraform 运行之前验证 AWS 凭证、IAM 权限和所需的 CLI 工具。                                       |
| `make preflight-post` |追赶`make apply`。检查 kubectl 上下文、集群可访问性、填充的 SSM 参数、存在的 Helm 值、TLS 配置。 |
| `make preflight-ssm` |仅检查 SSM 参数。范围比 `preflight-post` 更窄。                                                                 |

＃＃＃ 基础设施|命令 |描述 |
| -------------- | ------------------------------------------------------------------------------------------ |
| `make init` | `terraform init`。下载提供程序和模块。可以安全地重新运行。                         |
| `make plan` | `terraform plan`。预览更改。每次申请前都要审查。                              |
| `make apply` | `terraform apply`。配置 VPC、EKS、RDS、ElastiCache、S3、ALB、IRSA。 20至25分钟。 |
| `make destroy` | `terraform destroy`。拆除所有基础设施。首先运行`make uninstall`。            |

### 头盔部署|命令|描述 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make init-values` |从 Terraform 输出生成 `helm/values/langsmith-values-overrides.yaml`。根据 `enable_*` 标志复制附加值文件。 |
| `make deploy` |通过 Helm 部署或升级 LangSmith。运行预检、ESO 同步、分层值构建和核心准备情况检查。                   |
| `make apply-eso` |仅重新应用 ESO `ClusterSecretStore` 和 `ExternalSecret`。在轮换 Secret 后使用，无需完全重新部署 Helm。              |
| `make uninstall` |卸载 LangSmith Helm 版本。 Terraform 基础设施保持完好。                                                       |

### Terraform 管理的 Helm|命令|描述 |
| ------------------ | -------------------------------------------------------------------------------- |
| `make init-app` |将实时基础设施 Terraform 输出拉入`app/infra.auto.tfvars.json`。 |
| `make plan-app` | `terraform plan` 适用于 `app/` 模块。首先自动运行 `init-app`。  |
| `make apply-app` |通过 Terraform（`app/` 模块）部署 LangSmith Helm 版本。         |
| `make destroy-app` |通过 Terraform 销毁 Helm 版本。基础设施保持完好。 |

### 快速路径

|命令|描述 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `make quickdeploy` |通过一个命令进行完整部署。链条 `terraform apply` → `kubeconfig` → `init-values` → `helm deploy` 带门。 |
| `make quickdeploy-auto` |与`quickdeploy`相同，但非交互式。将 `-auto-approve` 传递给 terraform。                                 |
| `make deploy-all` |按顺序`make apply` → `make kubeconfig` → `make init-values` → `make deploy`。                              |
| `make deploy-all-tf` | `make apply` → `make init-values` → Terraform `app/` 依次规划并应用。                                |

### 实用程序|命令|描述 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make status` |检查所有层的部署状态，打印下一步要运行的内容。                                                                                                                         |
| `make status-quick` |与 `status` 相同，但跳过 SSM 和 Kubernetes 查询（更快）。                                                                                                                           |
| `make kubeconfig` |打印要运行的`source infra/scripts/set-kubeconfig.sh`命令。将其导出 `KUBECONFIG` 到专用的 `~/.kube/langsmith-<cluster>` 文件，而不是编辑 `~/.kube/config`。 |
| `make tls` | BYO ACM 证书 + Route 53 A 别名。当设置了`langsmith_domain`并且需要DNS布线时使用。                                                                                              || `make clean` |删除所有本地生成的敏感文件。追着`make destroy`跑。                                                                                                                 |

### 测试

|命令|描述 |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `make test-e2e` |针对当前集群的端到端网关测试（ALB 或 Envoy Gateway）。            |
| `make test-permutations` |在当前集群上按顺序进行排列测试。使用 `ARGS="1 2 5"` 作为子集。 |
| `make test-parallel` |跨隔离集群并行排列测试。您的集群未受影响。      |

## kubectl

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Pod health
kubectl get pods -n langsmith
kubectl get pods -n langsmith -w
kubectl describe pod <pod-name> -n langsmith
kubectl logs <pod-name> -n langsmith --tail=100 -f
kubectl logs <pod-name> -n langsmith --previous --tail=50

# ALB and ingress
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

# IRSA — check per-component service account annotations
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
  --query "DBInstances[?contains(DBInstanceIdentifier,'langsmith')]"

# ElastiCache
aws elasticache describe-cache-clusters \
  --query "CacheClusters[?contains(CacheClusterId,'langsmith')]"

# S3
aws s3 ls s3://<bucket-name>
aws s3api get-bucket-location --bucket <bucket-name>

# ALB
aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?contains(LoadBalancerName,'langsmith')]"

# VPC endpoint
aws ec2 describe-vpc-endpoints \
  --filters "Name=service-name,Values=com.amazonaws.<region>.s3" \
  --query "VpcEndpoints[].State"

# SSM secrets
aws ssm get-parameters-by-path --path "/langsmith/<base-name>/" --with-decryption

# IAM role
aws iam get-role --role-name <irsa-role-name>
```

## 地形

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd modules/aws/infra

terraform init
terraform plan
terraform apply
terraform apply -target=module.eks
terraform output
terraform output -raw cluster_name
terraform output -raw alb_dns_name
terraform output -raw langsmith_irsa_role_arn
terraform output -raw bucket_name
terraform state list
```

## 拆解

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd terraform/modules/aws

# Option A: script-driven deploy
make uninstall

# Option B: Terraform-managed deploy
make destroy-app

# Then destroy infrastructure:
# 1. Set postgres_deletion_protection = false in infra/terraform.tfvars
# 2. Apply the change, then destroy
cd infra
terraform apply
terraform destroy
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-aws-quick-reference.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>