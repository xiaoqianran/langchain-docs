<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: GCP Terraform quick reference | https://docs.langchain.com/langsmith/self-host-terraform-gcp-quick-reference -->

# GCP Terraform 快速参考

使LangSmith的目标、Terraform、kubectl、gcloud 和 Helm 命令在 GKE 上自托管。

针对使用 [GCP Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/gcp) 配置的 GCP LangSmith 部署进行日常操作的命令备忘单。所有 `make` 目标都从 `modules/gcp/` 运行。运行 `make help` 以获得内联摘要。命令反映了部署 Helm Chart 0.17 的 `main` 分支和 `v0.17.x` 标签。 `v0.16.x` 标签上不存在 `smithdb-*` 目标。

## 部署概述

|舞台|部署什么 |命令|
| - | - | - |
|基础设施| VPC + GKE + Cloud SQL + Memorystore + GCS + IAM + 证书管理器 + KEDA + Envoy 网关 | `make apply` |
|集群凭据 | Kubeconfig 连接到新的 GKE 集群 | `make kubeconfig` |
| LangSmith底座|前端、后端、摄取、队列、ClickHouse | `make init-values && make deploy` |
|舰队附加组件（独立）| Standalone-fleet-\* API 服务器、工具服务器、触发服务器、队列 | `make apply && make init-values && make deploy` |
| LangSmith 部署插件 |主机后端、侦听器、操作员 | `make init-values && make deploy` |
| Agent Builder 附加组件（已弃用） |工具服务器、触发服务器| `make init-values && make deploy` |
|见解 + Polly 附加组件 |洞察分析，Polly 评估代理 | `make init-values && make deploy` |
| SmithDB 附加组件 | Metastore、对象存储桶、节点池、SmithDB 服务 | `make apply && make init-values && make deploy` ||沙盒附加组件 |沙盒主机节点池、JuiceFS 元数据 Redis | `make apply && make init-values && make deploy` |

每个阶段都建立在前一个阶段的基础上。在启用下一个 Pod 之前，请验证 Pod 是否正常。

## 首次设置

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd terraform/modules/gcp

# Interactive wizard: generates terraform.tfvars
make quickstart

# Set up secrets in Secret Manager (auto-generates salts + Fernet keys)
# Must be sourced so it can export TF_VAR_* into your shell
source infra/scripts/setup-env.sh
export LANGSMITH_ADMIN_EMAIL="<your-admin-email>"

# Validate credentials, APIs, permissions, and quotas
make preflight

# Deploy infrastructure
make init
make plan
make apply

# Generate Helm values from Terraform outputs
make init-values

# Deploy LangSmith
make deploy
```

`make deploy-all` 在一个命令中链接 `apply`、`init-values` 和 `deploy`。从您获取 `setup-env.sh` 的 shell 运行 `make init-values` 和 `make deploy`；部署脚本从中读取`TF_VAR_*`秘密和`LANGSMITH_ADMIN_EMAIL`。

## 第 2 天运营

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Check deployment state and next-step guidance
make status              # full check
make status-quick        # skip Secret Manager and K8s queries

# Re-deploy after changing Helm values or upgrading chart version
make deploy

# Re-generate Helm values after Terraform changes
make init-values

# Manage Secret Manager secrets interactively
make secrets

# Update kubeconfig for the GKE cluster
make kubeconfig

# SmithDB: run only the commands you need, with your own values
make smithdb-status                                  # read-only: gates, sizing, pods, backfill progress
make smithdb-configure SIZING=<size> CACHE=<cache>  # minimal | small | medium | large; local-ssd | network-disk
make smithdb-phase PHASE=<phase>                     # off | dual-write | backfill | cutover
make deploy-all                                      # apply the change: apply, init-values, deploy
```

`make kubeconfig` 包裹`helm/scripts/get-kubeconfig.sh`。要直接调用脚本，请将集群名称、区域和项目作为参数传递，或忽略它们以读取 Terraform 输出。

`make smithdb-configure` 和 `make smithdb-phase` 仅编辑 `terraform.tfvars`，`make deploy-all` 应用更改。大小更改可以替换 SmithDB 节点池。离开`backfill`阶段会删除回填Job及其任务数据库； `make smithdb-phase PHASE=cutover` 拒绝，直到每个回填行都被提升，但早期阶段没有这样的检查。

有关 SmithDB 推出阶段，请参阅部署指南中的[SmithDB](/langsmith/self-host-terraform-gcp-deploy#smithdb)。

## 附加组件

在`terraform.tfvars`中设置标志，然后在`make init-values && make deploy`中设置。 `init-values.sh` 自动将匹配的示例文件复制到`helm/values/`。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# terraform.tfvars
enable_deployments   = true
enable_fleet         = true   # Fleet (formerly Agent Builder), standalone; no enable_deployments required
enable_agent_builder = false  # deprecated, superseded by enable_fleet; mutually exclusive with it
enable_insights      = true
enable_polly         = true   # requires enable_deployments = true + Polly license
enable_usage_telemetry = true # extended usage telemetry
```

要在初始安装后添加附加组件而不重新运行 `init-values.sh`，请手动复制：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cp helm/values/examples/langsmith-values-agent-deploys.yaml helm/values/
cp helm/values/examples/langsmith-values-fleet.yaml         helm/values/
cp helm/values/examples/langsmith-values-insights.yaml      helm/values/
cp helm/values/examples/langsmith-values-polly.yaml         helm/values/

make deploy
```

## 尺寸配置文件

在`terraform.tfvars`中设置`sizing_profile`，然后重新运行`make init-values && make deploy`。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sizing_profile = "production"   # default | minimum | dev | production | production-large
```|简介 |何时使用 |
| - | - |
| `default` |图表默认值：快速测试，不应用叠加 |
| `minimum` |绝对楼层；适合`e2-standard-4`；用于收费停车或 CI 烟雾测试 |
| `dev` |单一副本，最少的资源 |
| `production` |具有HPA的多副本；推荐用于实际工作负载|
| `production-large` |高内存和CPU； 50 多个用户或每秒 1000 多个跟踪 |

## kubectl

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Pod health
kubectl get pods -n langsmith
kubectl get pods -n langsmith -w
kubectl describe pod <pod-name> -n langsmith
kubectl logs <pod-name> -n langsmith --tail=100 -f
kubectl logs <pod-name> -n langsmith --previous --tail=50

# Backend logs (live)
kubectl logs -n langsmith deploy/langsmith-backend --tail=100 -f

# Gateway and HTTPRoute
kubectl get gateway -n envoy-gateway-system
kubectl get httproute -n langsmith
kubectl get svc -n envoy-gateway-system

# TLS
kubectl get certificate -n langsmith
kubectl get challenges -n langsmith
kubectl describe certificate <cert-name> -n langsmith
kubectl get clusterissuer

# Workload Identity
kubectl get serviceaccount langsmith-ksa -n langsmith -o yaml | grep annotation -A5

# Helm
helm status langsmith -n langsmith
helm history langsmith -n langsmith
helm get values langsmith -n langsmith

# LangSmith Deployment
kubectl get lgp -n langsmith
kubectl get crd | grep langchain
```

## 云云

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Re-auth if you hit oauth2 invalid_grant / invalid_rapt errors
gcloud auth login
gcloud auth application-default login

# Cluster credentials
gcloud container clusters get-credentials <cluster-name> --region <region> --project <project-id>

# List clusters
gcloud container clusters list --project <project-id>

# Cluster status
gcloud container clusters describe <cluster-name> --region <region> --format="value(status)"

# Cloud SQL
gcloud sql instances list --project <project-id>
gcloud sql instances describe <instance-name> --format="value(ipAddresses)"

# Memorystore Redis
gcloud redis instances list --region <region>
gcloud redis instances describe <instance-name> --region <region> --format="value(host)"

# GCS bucket
gsutil ls gs://<bucket-name>
gsutil iam get gs://<bucket-name>

# Workload Identity binding
gcloud iam service-accounts get-iam-policy <gsa-email> --project <project-id>

# Enabled APIs
gcloud services list --enabled --project <project-id>

# VPC peering
gcloud services vpc-peerings list --network <vpc-name> --project <project-id>

# Secret Manager
gcloud secrets list --project <project-id> --filter="name:langsmith"
gcloud secrets versions access latest --secret=<secret-id> --project <project-id>
```

## 地形

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd modules/gcp/infra

terraform init
terraform plan
terraform apply

# Target a specific module
terraform apply -target=module.networking

# Outputs
terraform output
terraform output -raw cluster_name
terraform output -raw storage_bucket_name

# State
terraform state list
terraform state show module.gke_cluster
terraform refresh
```

## 关键限制

* 在`terraform destroy`之前卸载Helm。 Envoy Gateway 负载均衡器引用 VPC；保留它会阻止网络删除。始终先运行 `make uninstall`。
* `config.deployment.url` 必须包含 `https://`。如果没有协议，操作员产生的代理就会陷入`DEPLOYING`。
* LangSmith 部署附加组件需要`config.deployment.enabled: true`。仅设置不带 `enabled: true` 的 URL 会静默跳过 `listener` 和 `operator`。
* 首次启用后加密密钥不得更改。旋转`langsmith_insights_encryption_key`或`langsmith_polly_encryption_key`会永久破坏现有的加密数据。
* Envoy 网关 IP 在拆卸时发生变化。删除网关后，GCP 会释放外部 IP。 `terraform destroy`后重新申请，更新您的 DNS A 记录。* 从图表 0.16 升级有门。 `deploy.sh` 拒绝升级，而 `values-overrides.yaml` 仍具有 `sandboxes.juicefs.csi` 块，而 JuiceFS CSI 卷或挂载 Pod 仍保留，或者当 `helm/values/` 仍具有图表 0.16 SmithDB 覆盖。每次拒绝都会打印清除它的命令。完整程序请参见[Upgrade from chart 0.16](/langsmith/self-host-terraform-gcp-deploy#upgrade-from-chart-0-16)。
* `langsmith-ksa` 注释不是永久的。 Terraform 在 Helm 版本之外的 `k8s-bootstrap` 模块中创建 ServiceAccount，因此它无法在命名空间删除后保留下来。 `deploy.sh` 幂等地重新创建并重新注释它。

## 拆解

<Warning>
  拆卸会永久删除 Cloud SQL 实例。 Cloud SQL 在删除时不会拍摄最终快照：其自动备份、按需备份和时间点恢复日志将随实例一起删除。要保留数据，请在步骤 1 之前将其导出到此部署之外的存储桶。跳过一次性测试堆栈的导出。
</Warning>

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Export the LangSmith database. Repeat for the SmithDB metastore with
# smithdb_metastore_instance_name and --database=smithdb.
PROJECT_ID=<project-id>
BACKUP_BUCKET=gs://<export-bucket>
PG=$(terraform -chdir=infra output -raw postgres_instance_name)
SA=$(gcloud sql instances describe "$PG" --project "$PROJECT_ID" \
  --format="value(serviceAccountEmailAddress)")
gcloud storage buckets add-iam-policy-binding "$BACKUP_BUCKET" \
  --member="serviceAccount:$SA" --role=roles/storage.objectAdmin
gcloud sql export sql "$PG" "$BACKUP_BUCKET/${PG}-final.sql.gz" \
  --database=langsmith --project "$PROJECT_ID"
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# 1. Remove LangSmith Deployment resources (if the add-on was enabled)
kubectl delete lgp --all -n langsmith 2>/dev/null || true

# 2. Uninstall LangSmith
make uninstall

# 3. Load the TF_VAR_* secrets
source infra/scripts/setup-env.sh

# 4. Set the teardown flags below in terraform.tfvars, then apply them
terraform -chdir=infra apply \
  -target=module.gke_cluster -target=module.cloudsql \
  -target=module.smithdb -target=module.networking

# 5. Destroy
make destroy
```

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# terraform.tfvars
gke_deletion_protection      = false
postgres_deletion_protection = false

# Only when enable_smithdb = true and smithdb_metastore_source = "create"
smithdb_metastore_deletion_protection = false

# Optional, any SmithDB install: lets make destroy delete the SmithDB bucket and
# its trace segments. With the default (false), make destroy stops at a
# non-empty SmithDB bucket.
smithdb_bucket_force_destroy = true
```

删除保护也适用于 Cloud SQL API 级别，因此步骤 4 中的目标应用必须在 `make destroy` 之前运行，即使保护已关闭。如果您从未启用过 SmithDB，请删除 `module.smithdb` 目标。要同时删除集群内数据库的永久磁盘，请在步骤 2 中运行 `DELETE_DATA_PVCS=true make uninstall`。

***<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-gcp-quick-reference.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>