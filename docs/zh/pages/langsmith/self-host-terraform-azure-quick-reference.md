<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Azure Terraform quick reference | https://docs.langchain.com/langsmith/self-host-terraform-azure-quick-reference -->

# Azure Terraform 快速参考

使 LangSmith 在 AKS 上自托管目标、Terraform、kubectl、Azure CLI 和 Helm 命令。

针对使用 [Azure Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/azure) 预配的 Azure LangSmith 部署进行日常操作的命令备忘单。所有 `make` 目标都从 `modules/azure/` 运行。运行 `make help` 以获得内联摘要。

有关完整的部署演练，请参阅[Azure deployment guide](/langsmith/self-host-terraform-azure-deploy)。

## 部署概述

|舞台|部署什么 |命令|
| - | - | - |
|基础设施| AKS + Postgres + Redis + Blob + Key Vault + 证书管理器 + KEDA + 入口 | `make apply` |
|应用程序秘密 | LangSmith 应用程序机密写入 Key Vault。永远不会覆盖现有的秘密 | `make seed-secrets` |
|集群凭据 | Key Vault 中的 Kubeconfig + Kubernetes 秘密 | `make kubeconfig && make k8s-secrets` |
| LangSmith | LangSmith 通过 shell 脚本发布 Helm | `make init-values && make deploy` |
| LangSmith 部署插件 |主机后端、侦听器、操作员。首先将 `default_node_pool_min_count` 提升到 5 | `make apply && make init-values && make deploy` |
|舰队附加组件 |舰队工具服务器和触发器服务器，以及专用的 `langsmith_fleet` Postgres 数据库。需要 `enable_deployments` 和 `postgres_source = "external"` | `make apply && make init-values && make deploy` |
|代理生成器附加组件 | Fleet 取代的传统路径：工具服务器和触发服务器 | `make init-values && make deploy` |
|见解 + Polly 附加组件 |洞察分析，Polly 评估代理 | `make init-values && make deploy` ||史密斯数据库 | PostgreSQL 18 元存储、Blob 容器、工作负载身份。需要图表 0.17，`v0.17.*` 模块标签上的默认值 | `make apply && make init-values && make deploy` |
| LLM 网关插件 | Gateway pod，以及具有 PII 编辑功能的 Presidio 分析器。测试版 | `make init-values && make deploy` |
|与 OIDC 的 SSO | OIDC 登录，禁用基本身份验证。首先将三个 `langsmith-oauth-*` 机密存储在 Key Vault 中 | `make k8s-secrets && make init-values && make deploy` |

## 首次设置

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd terraform/modules/azure
git checkout "$(git tag -l 'v0.17.*' --sort=-v:refname | head -1)"   # newest v0.17 release

# 1. Generate terraform.tfvars (interactive wizard)
make quickstart

# 2. Write Terraform inputs (Postgres password, license key, admin email)
#    to secrets.auto.tfvars. Re-runs offer the previous values as defaults
make setup-env

# 3. Preflight (Azure CLI, RBAC, providers)
make preflight

# 4. Deploy infrastructure (~15 to 20 min)
#    make apply runs three stages, and each prompts for confirmation
make init
make apply

# 5. Write the LangSmith app secrets into Key Vault (never overwrites)
make seed-secrets

# 6. Cluster credentials + Kubernetes Secrets
make kubeconfig
make k8s-secrets

# 7. Generate Helm values from Terraform outputs
make init-values

# 8. Deploy LangSmith (~10 min)
make deploy

# 9. Health check
make status
```

或者，在 `make init` 之后，一次性运行步骤 4 到 8 的其余部分：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make deploy-all   # apply → seed-secrets → kubeconfig → k8s-secrets → init-values → deploy
```

## 第 2 天运营

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make status         # health check that prints the next command to run
make status-quick   # skip the Key Vault, kubeconfig, Kubernetes, and Helm checks (faster)
make deploy         # re-deploy after any Helm value changes
make init-values    # re-generate values after Terraform changes
make kubeconfig     # refresh cluster credentials
make seed-secrets   # write any missing app secrets into Key Vault
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

## 附加组件

附加组件由 `infra/terraform.tfvars` 中的标志控制。设置标志，然后重新运行`make init-values && make deploy`。 `enable_fleet` 和 `enable_smithdb` 也会创建 Terraform 资源，因此首先运行 `make apply`。 `init-values.sh` 自动将匹配的覆盖写入`helm/values/`。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
sizing_profile       = "production"   # minimum | dev | production | production-large
enable_deployments   = true           # LangSmith Deployment add-on (listener + operator + host-backend)
enable_fleet         = true           # Fleet add-on (requires enable_deployments and postgres_source = "external")
enable_agent_builder = false          # legacy Agent Builder (requires enable_deployments); cannot be combined with enable_fleet
enable_insights      = true           # Insights analytics add-on
enable_polly         = true           # Polly AI eval add-on (needs enable_deployments)
enable_llm_gateway   = false          # LLM Gateway, in beta (chart 0.17)
enable_gateway_pii_redaction = false  # Presidio PII redaction (requires enable_llm_gateway)
enable_sso_oidc      = false          # OIDC SSO; enable only after logging in as the org admin with basic auth
```

<Warning>
  LangSmith 部署附加组件首先需要 `default_node_pool_min_count = 5`。操作员生成的 pod 需要节点净空；如果没有它，特工吊舱将无限期地停留在 `Pending` 中。
</Warning>

## 尺寸配置文件

在`terraform.tfvars`中设置`sizing_profile`，然后重新运行`make init-values && make deploy`。|简介 |何时使用 |
| - | - |
| `minimum` |停车成本、CI 冒烟测试、单用户演示。预计实际流量下会出现 OOM。 |
| `dev` |本地开发、CI 管道、集成测试、短期 POC 的轻度非生产。 |
| `production` | *推荐*用于生产。所有无状态组件上具有 HPA 的多副本。 |
| `production-large` |基于规模指南的大容量起点（〜50 个并发用户，〜1000 条跟踪/秒）。 |

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

# Envoy Gateway (default ingress_controller)
kubectl get gateway,httproute -n langsmith
kubectl get svc -n envoy-gateway-system -l gateway.envoyproxy.io/owning-gateway-name=langsmith-gateway

# Ingress (nginx, istio, agic)
kubectl get ingress -n langsmith
kubectl describe ingress -n langsmith

# NGINX LoadBalancer external IP (ingress_controller = "nginx")
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

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

# Azure Managed Redis
az redisenterprise list
az redisenterprise show --cluster-name <cluster> --resource-group <rg>

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

从 `modules/azure/` 通过 `make` 运行 Terraform。 `ARGS` 已附加到 Terraform 命令中，因此您不需要 `-chdir`。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init ARGS="-upgrade"                  # re-resolve provider versions
make plan                                  # plan the full infrastructure
make plan ARGS="-out=tfplan"               # save a plan file
make apply ARGS="-auto-approve"            # three stages, no prompts
make tf ARGS="apply tfplan"                # apply a saved plan
make plan ARGS="-target=module.aks"        # plan one module

make tf ARGS="output"
make tf ARGS="output -raw aks_cluster_name"
make tf ARGS="output -raw keyvault_name"
make tf ARGS="output -raw storage_account_name"

make tf ARGS="state list"
```

## 关键限制* `make apply` 运行三个目标阶段（Azure 基础设施、Kubernetes 引导程序，然后是其他所有阶段），每个阶段都会提示确认。 `ARGS="-auto-approve"` 跳过所有三个提示。
* 在`terraform destroy`之前卸载Helm。 Azure 负载均衡器拥有子网引用；保留它会阻止 VNet 删除。首先运行`make uninstall`。
* `config.deployment.url` 必须包含 `https://`。如果没有它，操作员产生的代理就会陷入`DEPLOYING`。
* LangSmith 部署附加组件需要`config.deployment.enabled: true`。仅设置不带 `enabled: true` 的 URL 会静默跳过 `listener` 和 `operator`。
* 首次启用后加密密钥不得更改。旋转`insights_encryption_key`或`polly_encryption_key`会永久破坏现有的加密数据。
* 首次启用 Polly 后滚动前端。 Polly 注册后出现`langsmith-polly-config` ConfigMap；较早启动的前端 Pod 不接收它。
* `letsencrypt` (HTTP-01) 仅适用于 `nginx`、`istio`（自我管理）和 `envoy-gateway`。对于 `istio-addon` 或 `agic`，请将 `dns01` 与自定义域一起使用，将 `existing` 与您自己的证书一起使用，或将 `none` 用于仅 HTTP。
* 在第一次应用之前设置`aks_private_cluster_enabled`、`aks_private_dns_zone_id`和`aks_control_plane_identity`。 Plan 拒绝对现有集群上的任何一个进行更改。* `v0.17.*`模块标签仅部署图表0.17行，`v0.16.*`标签仅部署0.16。在 `v0.16.*` 标签上，`enable_smithdb = true` 需要 0.17 行，因此使用它设置 `langsmith_helm_chart_version = "~0.17.0"`。运行图表 0.17 的部署无法返回到 0.16。
* 仅在您以组织管理员身份使用基本身份验证登录后才启用 `enable_sso_oidc`。该标志禁用基本身份验证。
* Key Vault 销毁后进入 90 天软删除。使用`keyvault_purge_protection = false`，运行`az keyvault purge`立即收回名称。

## 拆解

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make uninstall   # removes Helm release + LangSmith Deployment resources; prompts to delete namespace
helm uninstall ingress-nginx -n ingress-nginx --wait   # only with ingress_controller = "nginx"
make destroy     # destroys all Azure infrastructure via terraform destroy
make clean       # removes local secrets, config, helm values, and tfstate files
```

`make destroy-force` 和 `make clean-force` 运行相同的步骤，没有确认提示。

<Warning>
  `make clean-force` 还回答保护仍跟踪资源的状态文件的提示，然后删除 `terraform.tfstate`。对于默认的本地后端，该文件是唯一的状态，因此在 `make destroy` 成功之前运行它会孤立 Azure 资源。仅在成功 `make destroy` 后运行 `make clean-force`。
</Warning>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-azure-quick-reference.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>