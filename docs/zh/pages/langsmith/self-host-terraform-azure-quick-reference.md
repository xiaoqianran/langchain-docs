<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Azure Terraform quick reference | https://docs.langchain.com/langsmith/self-host-terraform-azure-quick-reference -->

# Azure Terraform 快速参考

针对使用 [Azure Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/azure) 预配的 Azure LangSmith 部署进行日常操作的命令备忘单。所有 `make` 目标都从 `modules/azure/` 运行。运行 `make help` 以获得内联摘要。

有关完整的部署演练，请参阅 [Azure deployment guide](/langsmith/self-host-terraform-azure-deploy)。

## 部署概述

|舞台|部署什么 |命令 |
|---|---|---|
|基础设施| AKS + Postgres + Redis + Blob + Key Vault + 证书管理器 + KEDA + 入口 | `make apply` |
|集群凭据 | Key Vault 中的 Kubeconfig + Kubernetes 秘密 | `make kubeconfig && make k8s-secrets` |
| LangSmith（头盔路径）| LangSmith Helm（~17 个 Pod）通过 shell 脚本 | `make init-values && make deploy` |
| LangSmith（地形路径）|在 Terraform 状态下管理的 Secrets + SA + Helm 版本 | `make init-app && make apply-app` |
| LangSmith 部署插件 |主机后端、侦听器、操作员。首先将 `default_node_pool_min_count` 提升到 5 | `make apply && make init-values && make deploy` |
|代理生成器附加组件 |工具服务器、触发服务器、代理构建器 LGP | `make init-values && make deploy` |
|见解 + Polly 附加组件 | Clio 分析、Polly 评估代理 | `make init-values && make deploy` |

## 首次设置

```bash
cd terraform/modules/azure

# 1. Generate terraform.tfvars (interactive wizard)
make quickstart

# 2. Bootstrap secrets (prompts on first run, reads from Key Vault on repeat)
make setup-env

# 3. Preflight (Azure CLI, RBAC, providers)
make preflight

# 4. Deploy infrastructure (~15 to 20 min)
#    Skip `make plan` on a fresh deploy — kubernetes_manifest needs a live cluster
make init
make apply

# 5. Cluster credentials + Kubernetes Secrets
make kubeconfig
make k8s-secrets

# 6. Generate Helm values from Terraform outputs
make init-values

# 7. Deploy LangSmith (~10 min)
make deploy

# 8. Health check
make status
```

或者一次性运行整个流程：

```bash
make deploy-all      # apply → kubeconfig → k8s-secrets → init-values → deploy
make deploy-all-tf   # apply → init-values → init-app → apply-app (Terraform path)
```

## 第 2 天运营

```bash
make status         # 10-section health check
make status-quick   # skip Key Vault + K8s secret queries (faster)
make deploy         # re-deploy after any Helm value changes
make init-values    # re-generate values after Terraform changes
make kubeconfig     # refresh cluster credentials
make k8s-secrets    # re-create langsmith-config-secret from Key Vault

# Manage Key Vault secrets
make keyvault                                       # interactive menu
./infra/scripts/manage-keyvault.sh list             # all secrets with timestamps
./infra/scripts/manage-keyvault.sh get <secret>     # read a secret
./infra/scripts/manage-keyvault.sh set <key> <val>  # update a secret
./infra/scripts/manage-keyvault.sh validate         # check all required secrets exist
./infra/scripts/manage-keyvault.sh diff             # compare KV vs K8s secret
./infra/scripts/manage-keyvault.sh delete <key>     # soft-delete (recoverable 90 days)
```

## 附加组件附加阶段（3 到 5）由 `infra/terraform.tfvars` 中的标志控制。设置标志，重新运行`init-values && deploy`。 `init-values.sh` 自动将匹配的示例文件复制到`helm/values/`。

```hcl
# infra/terraform.tfvars
sizing_profile       = "production"   # minimum | dev | production | production-large
enable_deployments   = true           # LangSmith Deployment add-on (listener + operator + host-backend)
enable_agent_builder = true           # Agent Builder add-on (requires enable_deployments)
enable_insights      = true           # Insights / Clio analytics add-on
enable_polly         = true           # Polly AI eval add-on (requires enable_deployments)
```

<Warning>
LangSmith 部署附加组件首先需要 `default_node_pool_min_count = 5`。操作员生成的 pod 需要节点净空；如果没有它，特工吊舱将无限期地停留在 `Pending` 中。
</Warning>

## 尺寸配置文件

在`terraform.tfvars`中设置`sizing_profile`，然后重新运行`make init-values && make deploy`。

|简介 |何时使用 |
|---|---|
| `minimum` |停车成本、CI 冒烟测试、单用户演示。预计实际流量下会出现 OOM。 |
| `dev` |本地开发、CI 管道、集成测试、短期 POC 的轻度非生产。 |
| `production` | _推荐_用于生产。所有无状态组件上具有 HPA 的多副本。 |
| `production-large` |基于规模指南的大容量起点（约 50 个并发用户，约 1000 条跟踪/秒）。 |

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

# Ingress
kubectl get ingress -n langsmith
kubectl describe ingress -n langsmith

# NGINX LoadBalancer external IP
kubectl get svc ingress-nginx-controller -n ingress-nginx

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

## Azure CLI

```bash
# Re-auth
az login
az account set --subscription <subscription-id>
az account show

# AKS
az aks list
az aks show --name <cluster> --resource-group <rg>
az aks get-credentials --name <cluster> --resource-group <rg>

# PostgreSQL
az postgres flexible-server list
az postgres flexible-server show --name <server> --resource-group <rg>

# Redis
az redis list
az redis show --name <cache> --resource-group <rg>

# Blob Storage
az storage account list
az storage container list --account-name <account>

# Key Vault
az keyvault list
az keyvault secret list --vault-name <vault>
az keyvault secret show --vault-name <vault> --name <secret> --query value -o tsv

# Application Gateway (AGIC)
az network application-gateway list
```

## 地形

```bash
cd modules/azure/infra

terraform init
terraform plan        # skip on first run, see deploy notes
terraform apply
terraform apply -target=module.aks

terraform output
terraform output -raw aks_cluster_name
terraform output -raw keyvault_name
terraform output -raw storage_account_name

terraform state list
```

## 关键限制- 在新部署中跳过 `make plan`。 `kubernetes_manifest` 资源需要实时集群 API。直接使用`make apply`。
- 在`terraform destroy`之前卸载Helm。 Azure 负载均衡器拥有子网引用；保留它会阻止 VNet 删除。首先运行`make uninstall`。
- `config.deployment.url` 必须包含 `https://`。如果没有它，操作员产生的代理就会陷入`DEPLOYING`。
- LangSmith 部署附加组件需要`config.deployment.enabled: true`。仅设置不带 `enabled: true` 的 URL 会静默跳过 `listener` 和 `operator`。
- 加密密钥在首次启用后不得更改。旋转`insights_encryption_key`或`polly_encryption_key`会永久破坏现有的加密数据。
- 首次启用 Polly 后滚动前端。 `agentBootstrap`注册后创建`langsmith-polly-config`；较早启动的前端 Pod 不接收它。
- `letsencrypt` (HTTP-01) 仅适用于 `nginx`、`istio`（自我管理）和 `envoy-gateway`。对于 `istio-addon` 或 `agic`，请将 `dns01` 与自定义域一起使用，或使用 `none` 仅用于 HTTP。
- Key Vault 销毁后进入 90 天软删除。使用`keyvault_purge_protection = false`，运行`az keyvault purge`立即收回名称。

## 拆解

```bash
make uninstall   # removes Helm release + LGP resources; prompts to delete namespace
make destroy     # destroys all Azure infrastructure via terraform destroy
make clean       # removes local secrets, config, helm values, and tfstate files
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-azure-quick-reference.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>