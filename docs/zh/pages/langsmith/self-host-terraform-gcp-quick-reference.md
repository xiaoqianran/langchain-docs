<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: GCP Terraform quick reference | https://docs.langchain.com/langsmith/self-host-terraform-gcp-quick-reference -->

# GCP Terraform 快速参考

针对使用 [GCP Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/gcp) 配置的 GCP LangSmith 部署进行日常操作的命令备忘单。所有 `make` 目标都从 `modules/gcp/` 运行。运行 `make help` 以获得内联摘要。

## 部署概述

|舞台|部署什么 |命令 |
|---|---|---|
|基础设施| VPC + GKE + Cloud SQL + Memorystore + GCS + IAM + 证书管理器 + KEDA + Envoy 网关 | `make apply` |
|集群凭据 | Kubeconfig 连接到新的 GKE 集群 | `make kubeconfig` |
| LangSmith底座|前端、后端、摄取、队列、ClickHouse | `make init-values && make deploy` |
|舰队附加组件（独立）| Standalone-fleet-* API 服务器、工具服务器、触发服务器、队列 | `make apply && make init-values && make deploy` |
| LangSmith 部署插件 |主机后端、侦听器、操作员 | `make apply && make init-values && make deploy` |
| Agent Builder 附加组件（已弃用） |工具服务器、触发服务器+代理构建器LGP | `make init-values && make deploy` |
|见解 + Polly 附加组件 | Clio 分析、Polly 评估代理 | `make init-values && make deploy` |

每个阶段都建立在前一个阶段的基础上。在启用下一个 Pod 之前，请验证 Pod 是否正常。

## 首次设置

```bash
cd terraform/modules/gcp

# Interactive wizard — generates terraform.tfvars
make quickstart

# Set up secrets in Secret Manager (auto-generates passwords + Fernet keys)
# Must be sourced so it can export TF_VAR_* into your shell
source infra/scripts/setup-env.sh

# Verify secrets are stored correctly
make secrets

# Deploy infrastructure
make init
make plan
make apply

# Generate Helm values from Terraform outputs
make init-values

# Deploy LangSmith
make deploy
```

`make deploy-all` 在一个命令中链接 `apply`、`init-values` 和 `deploy`。

要将 Helm 版本保留在 Terraform 下而不是部署脚本下，请使用 `app` 层：

```bash
make init-values  # generate the layered values files
make init-app     # pull infra outputs into app/infra.auto.tfvars.json
make apply-app    # terraform apply the Helm release (make destroy-app to remove)
````app` 层使用自己的变量名称：`sizing`（不是`sizing_profile`）和`enable_agent_deploys`（不是`enable_deployments`）。

## 第 2 天运营

```bash
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
```

## 附加组件

在`terraform.tfvars`中设置标志，然后在`make init-values && make deploy`中设置标志。 `init-values.sh` 自动将匹配的示例文件复制到`helm/values/`。

```hcl
# terraform.tfvars
enable_deployments   = true
enable_fleet         = true   # Fleet (formerly Agent Builder), standalone (chart v0.15+); no enable_deployments required
enable_agent_builder = false  # deprecated, superseded by enable_fleet; mutually exclusive with it
enable_insights      = true
enable_polly         = true   # requires enable_deployments = true + Polly license
enable_usage_telemetry = true # extended usage telemetry
```

要在初始安装后添加附加组件而不重新运行 `init-values.sh`，请手动复制：

```bash
cp helm/values/examples/langsmith-values-agent-deploys.yaml helm/values/
cp helm/values/examples/langsmith-values-fleet.yaml         helm/values/
cp helm/values/examples/langsmith-values-insights.yaml      helm/values/
cp helm/values/examples/langsmith-values-polly.yaml         helm/values/

make deploy
```

## 尺寸配置文件

在`terraform.tfvars`中设置`sizing_profile`，然后重新运行`make init-values && make deploy`。

```hcl
sizing_profile = "production"   # default | minimum | dev | production | production-large
```

|简介 |何时使用 |
|---|---|
| `default` |图表默认值 - 快速测试，不应用叠加 |
| `minimum` |绝对楼层；适合`e2-standard-4`；用于收费停车或 CI 烟雾测试 |
| `dev` |单一副本，最少的资源 |
| `production` |具有HPA的多副本；推荐用于实际工作负载|
| `production-large` |高内存和CPU； 50 多个用户或每秒 1000 多个跟踪 |

## kubectl

```bash
# Pod health
kubectl get pods -n langsmith
kubectl get pods -n langsmith -w
kubectl describe pod <pod-name> -n langsmith
kubectl logs <pod-name> -n langsmith --tail=100 -f
kubectl logs <pod-name> -n langsmith --previous --tail=50

# Backend logs (live)
kubectl logs -n langsmith deploy/langsmith-backend --tail=100 -f

# Gateway and HTTPRoute
kubectl get gateway -n langsmith
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

```bash
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

```bash
cd modules/gcp/infra

terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars

# Target a specific module
terraform apply -var-file=terraform.tfvars -target=module.networking

# Outputs
terraform output
terraform output -raw cluster_name
terraform output -raw storage_bucket_name

# State
terraform state list
terraform state show module.gke_cluster
terraform refresh -var-file=terraform.tfvars
```

## 关键限制- 在 `terraform destroy` 之前卸载 Helm。 Envoy Gateway 负载均衡器引用 VPC；保留它会阻止网络删除。始终先运行 `make uninstall`。
- `config.deployment.url` 必须包含 `https://`。如果没有协议，操作员产生的代理就会陷入`DEPLOYING`。
- LangSmith 部署附加组件需要`config.deployment.enabled: true`。仅设置不带 `enabled: true` 的 URL 会静默跳过 `listener` 和 `operator`。
- 加密密钥在首次启用后不得更改。旋转`insights_encryption_key`或`polly_encryption_key`会永久破坏现有的加密数据。
- 首次启用 Polly 后滚动前端。 `agentBootstrap`注册后创建`langsmith-polly-config`ConfigMap；较早启动的前端 Pod 不接收它。
- Envoy 网关 IP 在拆卸时发生变化。删除网关后，GCP 会释放外部 IP。 `terraform destroy`后重新申请，更新您的 DNS A 记录。
- `langsmith-ksa`注释不是永久的。操作员在运行时创建 ServiceAccount，并且它不会在命名空间删除后保留下来。 `deploy.sh` 幂等地重新注释它。

## 拆解

```bash
# 1. Remove LangSmith Deployment resources (if the add-on was enabled)
kubectl delete lgp --all -n langsmith 2>/dev/null || true

# 2. Uninstall LangSmith
make uninstall

# 3. Set deletion protection = false in terraform.tfvars, then:
make destroy
```

```hcl
# terraform.tfvars
gke_deletion_protection      = false
postgres_deletion_protection = false
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-gcp-quick-reference.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>