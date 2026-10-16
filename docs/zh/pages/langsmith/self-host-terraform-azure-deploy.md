<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy LangSmith on Azure with Terraform | https://docs.langchain.com/langsmith/self-host-terraform-azure-deploy -->

# 使用 Terraform 在 Azure 上部署 LangSmith

使用 LangChain Terraform 模块在 Azure AKS 上配置自托管的 LangSmith 的端到端演练。

使用公共 [Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/azure) 将 LangSmith 部署到 Azure。通过将部署管理为代码，您可以跨订阅版本化、查看和重现 LangSmith 环境，而无需单击 Azure 门户。

安装分两个阶段运行：

1. **基础设施**：Terraform 提供 AKS、Postgres、Redis、Blob 存储、Key Vault、证书管理器、KEDA 和入口。
2. **应用程序**：Helm 针对集群安装 LangSmith 图表。

基本安装完成后，通过设置标志和重新部署来启用可选附加组件（LangSmith Deployment、Fleet、Insights、Polly、SmithDB 和 LLM Gateway）和 SSO。<Note>
  这些页面遵循模块的 `v0.17.*` 发布标签，这些标签部署了 LangSmith Helm 图表 0.17 行。在模块标签中，前两个数字命名图表线，最后一个数字是模块修订版，因此`v0.17.4`仍然部署最新的0.17图表补丁。 `v0.16.*`标签部署图表0.16。他们没有 LLM 网关或 SSO 标志，并联合 8 个工作负载身份服务帐户而不是 10 个。从 v0.16.56 开始，他们仅部署 SmithDB，并将 `langsmith_helm_chart_version` 设置为 `~0.17.0`。运行图表 0.17 的部署无法返回到 0.16。
</Note>

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {'flowchart': {'nodeSpacing': 25, 'rankSpacing': 30}}}%%
graph TB
    subgraph stage1["Set up infrastructure"]
        direction LR
        Start["make setup-env<br/>secrets to secrets.auto.tfvars"]
        TF["terraform apply<br/>(3 stages)"]
        Infra["AKS · PostgreSQL · Redis<br/>Blob · Key Vault<br/>Managed Identity"]
        Bootstrap["Bootstrap workloads<br/>cert-manager · KEDA<br/>Envoy Gateway"]
        Start --> TF --> Infra -->|AKS ready| Bootstrap
    end
    subgraph stage2["Deploy the application"]
        direction LR
        Secrets["make seed-secrets<br/>+ kubeconfig + k8s-secrets<br/>Key Vault to langsmith-config-secret"]
        Deploy["make init-values + deploy<br/>helm install langsmith"]
        DNS["deploy.sh sets dns_label<br/>+ Let's Encrypt cert"]
        Running["LangSmith running<br/>all pods healthy"]
        Secrets --> Deploy --> DNS --> Running
    end
    stage1 --> stage2

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class Start trigger
    class TF,Bootstrap,Secrets,Deploy,DNS process
    class Infra neutral
    class Running output

    style stage1 fill:none,stroke:#40668D,stroke-width:1px
    style stage2 fill:none,stroke:#40668D,stroke-width:1px
```

## 先决条件

### 所需工具

|工具|版本 |目的|
| - | - | - |
| Azure CLI (`az`) | 2.50 或更高版本 |身份验证、查询 Azure 资源、管理 AKS 凭据 |
|地形 | 1.11.0 或更高版本 |运行基础设施模块 |
| `kubectl` | 1.34 或更高版本 |检查 AKS 集群 |
|头盔| 3.12 或更高版本 |安装和管理LangSmith图表|
| `kubelogin` |最新 |登录到具有 Entra ID 集成的集群（`aks_entra_only`，或具有 Entra ID 的附加集群）。否则不需要 |

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
brew install azure-cli kubectl helm
brew tap hashicorp/tap && brew install hashicorp/tap/terraform

az --version
terraform version
kubectl version --client
helm version

# Only for a cluster with Entra ID integration
brew install Azure/kubelogin/kubelogin
kubelogin --version
```使用 `aks_private_cluster_enabled = true`，从具有到 API 服务器专用终结点的网络路径的主机（例如集群 VNet 或对等网络中的跳转主机）运行 Terraform 和 `make` 目标，并使用解析专用区域的 DNS。对于 `keyvault_private_endpoint_enabled = true`、`make apply`、`make seed-secrets` 和 `make k8s-secrets` 需要一个能够解析保管库专用端点的主机。参见[Key Vault variables](/langsmith/self-host-terraform-azure-variables#key-vault)。

### 必需的 Azure RBAC

运行 Terraform 的身份需要在订阅上具有以下角色：

|角色 |目的|
| - | - |
| `Contributor` |创建和管理所有 Azure 资源 |
| `User Access Administrator` 或 `Role Based Access Control Administrator` |为 Key Vault、Blob、cert-manager 托管身份创建角色分配 |

`Owner` 包括两者。单独使用`Contributor`是不够的，因为它无法创建角色分配。

您提供的用户分配的控制平面身份 (`aks_control_plane_identity = "user"`) 和私有 DNS 区域需要进一步的授权，如[PERMISSIONS.md](https://github.com/langchain-ai/terraform/blob/main/modules/azure/PERMISSIONS.md) 中列出。

### 验证

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
az login
az account set --subscription <your-subscription-id>
az account show
```

您还需要 LangSmith 许可证密钥 ([contact the LangChain sales team](https://www.langchain.com/contact-sales)) 和 `dns_label`（Azure 子域，无需 DNS 设置）或自定义 `langsmith_domain`。

## 快速入门

对于从零到正在运行的 LangSmith 实例的最快路径：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# 1. Clone the public modules and check out the newest v0.17 release
git clone https://github.com/langchain-ai/terraform.git
cd terraform/modules/azure
git checkout "$(git tag -l 'v0.17.*' --sort=-v:refname | head -1)"

# 2. Generate terraform.tfvars interactively
make quickstart

# 3. Bootstrap secrets (writes infra/secrets.auto.tfvars, chmod 600, gitignored)
make setup-env

# 4. Validate environment
make preflight

# 5. Provision infrastructure (~15 to 20 min; each of the three stages prompts)
make init
make apply

# 6. Seed app secrets into Key Vault, get cluster credentials, push secrets into the cluster
make seed-secrets
make kubeconfig
make k8s-secrets

# 7. Deploy LangSmith via Helm (~10 min)
make init-values
make deploy
```

或者，在 `make init` 之后，一次性运行步骤 5 到 7 的其余部分：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make deploy-all   # apply → seed-secrets → kubeconfig → k8s-secrets → init-values → deploy
````make deploy-all` 在每个 `make apply` 阶段提示处停止。要跳过提示，请运行 `make deploy-all ARGS="-auto-approve"`。 `make seed-secrets` 步骤还提示输入初始管理员密码，因此导出 `LANGSMITH_ADMIN_PASSWORD` 以进行无人值守运行。

## 提供基础设施

Terraform 提供以下 Azure 资源：

|资源 |类型 |目的|
| - | - | - |
|资源组| `azurerm_resource_group` |所有资源的容器 |
|虚拟网络| `azurerm_virtual_network` |隔离网络（默认10.0.0.0/17） |
| AKS 集群 | `azurerm_kubernetes_cluster` | Kubernetes，所有工作负载都在这里运行 |
|入口控制器 |头盔|外部负载均衡器 + TLS 终止（默认为 Envoy Gateway）|
| PostgreSQL 灵活服务器 | `azurerm_postgresql_flexible_server` |组织配置，运行元数据（外部层）|
| Azure 托管 Redis | `azapi_resource` (Microsoft.Cache/redisEnterprise) |跟踪摄取队列，发布/订阅（外部层）|
| Blob 存储 | `azurerm_storage_account` |原始跟踪对象，始终需要 |
|托管身份 | `azurerm_user_assigned_identity` |用于 Pod 到 Blob 身份验证的工作负载身份 |
| Azure 密钥保管库 | `azurerm_key_vault` |存储所有 LangSmith 秘密 |
|证书经理 |头盔|自动化 TLS 证书管理 |
|科达|头盔|为工作人员提供事件驱动的自动缩放功能

### 克隆并配置

克隆模块并查看最新的 `v0.17.*` 发布标签：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git clone https://github.com/langchain-ai/terraform.git
cd terraform/modules/azure
git checkout "$(git tag -l 'v0.17.*' --sort=-v:refname | head -1)"
```要部署图表 0.16，请将 `v0.17.*` 替换为 `v0.16.*`。

所有后续命令都从`modules/azure/`运行。运行 `make help` 以获得完整的目标列表。

使用交互式向导生成 `terraform.tfvars`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make quickstart
```

该向导运行包含 10 个部分的调查问卷，涵盖配置文件、订阅和命名、网络、AKS 大小调整、入口控制器、DNS/TLS、后端服务、Key Vault、大小调整配置文件和安全附加组件。重新运行是安全的：每个提示都会预先选择现有值，并且 Enter 会保留它。

更喜欢手动编辑：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cp infra/terraform.tfvars.example infra/terraform.tfvars
vi infra/terraform.tfvars
```

最低要求值：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Identity
subscription_id = "<your-azure-subscription-id>"

# Location
location = "eastus"

# Naming
name_prefix           = "prod"   # appended to resource names, for example ls-rg-prod
unique_resource_names = true     # new deployments only; see the following warning

# Deployment tier, production recommended
postgres_source   = "external"   # Azure DB for PostgreSQL
redis_source      = "external"   # Azure Managed Redis
clickhouse_source = "in-cluster" # use "external" + LangChain Managed for production

# DNS + TLS (HTTPS via Let's Encrypt on a free Azure subdomain)
dns_label              = "langsmith-prod"   # → langsmith-prod.eastus.cloudapp.azure.com
tls_certificate_source = "letsencrypt"
letsencrypt_email      = "ops@example.com"

# Sizing
sizing_profile = "production"   # minimum | dev | production | production-large
```

`environment` 默认为 `name_prefix`。仅将其设置为使用不同值标记资源。

<Warning>
  `name_prefix` 取代 `identifier`。如果现有`terraform.tfvars`设置了`identifier = "-prod"`，请将其更改为`name_prefix = "prod"`。资源名称不会更改。

  在现有部署上保留 `unique_resource_names` 未设置。打开它会重命名每个资源，Terraform 会以销毁和重新创建的方式运行这些资源。您会丢失 PostgreSQL 和 Blob 存储数据。
</Warning>

<Warning>
  集群内 ClickHouse 作为单个 Pod 运行，没有复制或备份，仅用于开发/POC。对于生产，请使用[LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)。
</Warning>

对于所有变量，请参阅[Azure variables reference](/langsmith/self-host-terraform-azure-variables)。

### 引导程序的秘密

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make setup-env
````setup-env.sh` 写入`infra/secrets.auto.tfvars`（gitignored，`chmod 600`）。 Terraform 会自动选取该文件；不需要 shell 导出。

* **第一次运行**：提示输入 PostgreSQL 管理员密码（按 Enter 键生成密码）、LangSmith 许可证密钥和管理员电子邮件。
* **后续运行**：每个提示都提供先前的值作为默认值。要跳过提示，请在环境中设置 `LANGSMITH_PG_PASSWORD`、`LANGSMITH_LICENSE_KEY` 或 `LANGSMITH_ADMIN_EMAIL`。

管理员密码和生成的应用程序机密不在此文件中。 `make seed-secrets` 在 `make apply` 之后将它们写入 Key Vault。

### 飞行前

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make preflight
```

验证 Azure CLI 身份验证、活动订阅、所需的资源提供程序以及创建角色分配的权限。它还检查订阅优惠类型、区域 vCPU 配额以及该区域是否提供您的 PostgreSQL 版本和 SKU。它确认全局唯一名称是免费的，`terraform.tfvars`和`secrets.auto.tfvars`存在，并且`terraform`、`kubectl`和`helm`位于PATH上。

订阅必须注册 11 个资源提供者：`Microsoft.ContainerService`、`Microsoft.DBforPostgreSQL`、`Microsoft.Cache`、`Microsoft.KeyVault`、`Microsoft.Storage`、`Microsoft.Network`、`Microsoft.Compute`、`Microsoft.Authorization`、 `Microsoft.ManagedIdentity`、`Microsoft.OperationalInsights`、`Microsoft.Insights`。

### 申请

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init
make apply   # ~15 to 20 min on first run; do not interrupt it
````make init` 在 `infra/` 中运行 `terraform init`，它下载提供程序（包括 AzureRM）并初始化后端。每个克隆运行一次。签出新模块标签后，运行`make init ARGS=-upgrade`。

<Note>
  `make apply` 分三个阶段运行：Azure 基础设施，包括 AKS → Kubernetes 引导程序（命名空间、机密、证书管理器、KEDA）→ 剩余资源，例如 DNS 区域和 WAF。每个阶段都会提示确认。要跳过所有三个提示，请运行 `make apply ARGS="-auto-approve"`。
</Note>

### 集群凭证和 Kubernetes Secrets

`make apply` 完成后，将应用程序机密播种到 Key Vault 中，获取集群凭据，并将机密推送到集群中：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make seed-secrets  # admin password + generated secrets → Key Vault (never overwrites)
make kubeconfig    # fetches AKS credentials, merges into ~/.kube/config
make k8s-secrets   # Key Vault → langsmith-config-secret in the langsmith namespace
```

`make seed-secrets` 提示输入 LangSmith 管理员密码，或读取 `LANGSMITH_ADMIN_PASSWORD`。它生成 API 密钥盐、JWT 密钥和四个 Fernet 加密密钥。它只写入丢失的秘密，因此重新运行是安全的。

`make k8s-secrets` 从 Key Vault 中读取 8 个机密，加上三个 `langsmith-oauth-*` 机密（如果存在），并创建或更新 `langsmith-config-secret`。重新运行是安全的。

在具有 Entra ID 集成的集群上，`make kubeconfig` 会将上下文转换为通过 `kubelogin` 作为您的 `az` 身份登录。

### 验证基础设施

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# All nodes Ready
kubectl get nodes

# Bootstrap components, all Running
kubectl get pods -n cert-manager           # 3 pods
kubectl get pods -n keda                   # 3 pods
kubectl get pods -n envoy-gateway-system   # Envoy Gateway controller (default ingress_controller)

# Workload Identity ServiceAccount, should have client-id annotation
kubectl get sa langsmith-ksa -n langsmith \
  -o jsonpath='{.metadata.annotations}'

# Terraform outputs that the Helm scripts read
terraform -chdir=infra output
```

## 部署LangSmith`make init-values` 生成 Helm 值，`make deploy` 安装 LangSmith Helm 图表。对首次部署和第 2 天重新部署使用相同的两个命令。

### 使用 Helm 进行部署

#### 生成 Helm 值

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init-values
```

`make init-values` 读取 `terraform output` 和 `terraform.tfvars` 并生成填充了所有字段的 `helm/values/values-overrides.yaml`：

* `config.hostname`，您的 FQDN（来自 `dns_label` 或 `langsmith_domain`）。
* `config.initialOrgAdminEmail`，第一个组织管理员帐户。
* `config.existingSecretName: langsmith-config-secret`，秘密参考。
* `config.blobStorage`，存储帐户名称 + 容器 + Workload Identity 客户端 ID。
* 8 个 ServiceAccounts 的工作负载身份注释（后端、平台后端、队列、摄取队列、主机后端、侦听器、舰队工具服务器、舰队触发服务器）。
* Ingress + TLS 块：`letsencrypt`、`dns01` 和 `existing` 的 `langsmith-tls` 秘密名称，以及 `letsencrypt` 和 `dns01` 的证书管理器注释。使用 `envoy-gateway`，图表创建网关 API 路由而不是入口。
* Postgres 和 Redis 外部秘密引用（当`postgres_source = "external"` / `redis_source = "external"` 时）。
* `insights.enabled`和`polly.enabled`，从`enable_insights`和`enable_polly`设置。

对于 `clickhouse_source = "external"`，`make init-values` 还会提示输入 ClickHouse 连接详细信息并创建 `langsmith-clickhouse` 密钥。`make init-values` 还将尺寸覆盖和任何启用的附加覆盖写入`helm/values/`。它从 `helm/values/examples/` 复制其中的大部分内容并生成 Insights、LLM Gateway 和 PII 叠加层。

#### 部署

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make deploy   # ~10 min
```

`make deploy` 执行以下操作：

1. 验证`values-overrides.yaml`存在并且是从当前`terraform.tfvars`生成的。
2. 通过使用`service.beta.kubernetes.io/azure-dns-label-name`注释LoadBalancer服务，将`dns_label`应用于`nginx`、`istio`和`istio-addon`的公共IP。
3. 如果 `tls_certificate_source` 是 `letsencrypt` 或 `dns01`（幂等），则创建 `letsencrypt-prod` 证书管理器 `ClusterIssuer`。对于 `existing`，检查`langsmith-tls` Secret 是否存在且类型为 `kubernetes.io/tls`。
4. 验证`langsmith-config-secret`是否存在；如果 Key Vault 丢失，则会自动创建。使用外部 ClickHouse，检查 `langsmith-clickhouse` 秘密。
5. 验证附加标志。 Agent Builder 和 Fleet 需要`enable_deployments = true`，Fleet 需要外部 PostgreSQL，两者不能一起运行。
6. 构建并记录价值链，并拒绝仍在图表 0.15 架构上的值文件。
7. 在继续之前自动恢复任何卡住的 `pending-upgrade` 头盔释放。
8. 对于`envoy-gateway`，创建`EnvoyProxy`（承载`dns_label`）、`GatewayClass`和`langsmith-gateway`网关。9. 运行`helm upgrade --install langsmith langchain/langsmith --timeout 20m`。长超时涵盖安装后迁移作业，首次安装时最多需要 5 分钟。图表版本为 `~0.17.0`，最新的 0.17 补丁，除非 `langsmith_helm_chart_version` 或 `CHART_VERSION` 环境变量命名为 0.17 补丁。该脚本拒绝任何其他图表线。
10. 使用 Workload Identity 客户端 ID 注释 `langsmith-ksa` ServiceAccount。
11. 将 `enable_llm_gateway = true` 和 `ingress_controller` 设置为 `nginx` 或 `agic`，对 `/gateway/` 应用 `<release>-llm-gateway` 入口，其中 `<release>` 是图表全名（默认为 `langsmith`），并带有900 秒超时。关闭网关后，它会删除剩余的网关。

要观察 Pod 的出现，请在第二个终端中运行 `kubectl get pods -n langsmith -w`。

### 验证部署

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# All pods Running or Completed (~17 pods)
kubectl get pods -n langsmith

# Routes: HTTPRoutes for envoy-gateway, an Ingress for nginx, istio, and agic
kubectl get httproute -n langsmith
kubectl get ingress -n langsmith

# TLS certificate issued
kubectl get certificate -n langsmith   # READY: True

# Helm release status
helm list -n langsmith
```

预期的 pod 状态（全部在 5 分钟后运行）：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith-ace-backend-xxxxx              1/1   Running     0   5m
langsmith-backend-xxxxx                  1/1   Running     0   5m
langsmith-backend-auth-bootstrap-xxxxx   0/1   Completed   0   5m
langsmith-backend-ch-migrations-xxxxx    0/1   Completed   0   5m
langsmith-backend-migrations-xxxxx       0/1   Completed   0   5m
langsmith-clickhouse-0                   1/1   Running     0   5m
langsmith-frontend-xxxxx                 1/1   Running     0   5m
langsmith-ingest-queue-xxxxx             1/1   Running     0   5m
langsmith-platform-backend-xxxxx         1/1   Running     0   5m
langsmith-playground-xxxxx               1/1   Running     0   5m
langsmith-queue-xxxxx                    1/1   Running     0   5m
```

打开 `https://<HOSTNAME>` 并使用 Key Vault 中的管理员电子邮件和密码登录：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
az keyvault secret show \
  --vault-name $(terraform -chdir=infra output -raw keyvault_name) \
  --name langsmith-admin-password \
  --query value -o tsv
```

### 价值链

`make deploy` 按此顺序应用 Helm 值文件（冲突时最后一个文件获胜）：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
1. helm/values/values.yaml                              ← Azure base values (committed)
2. helm/values/values-overrides.yaml                    ← hostname, WI client-id, auth, postgres/redis
3. (add-on files when enable_* flags are set)           ← agent-deploys, agent-builder, fleet, insights, polly, llm-gateway, gateway-pii
4. helm/values/langsmith-values-sizing-<profile>.yaml   ← resource requests + HPA settings
5. helm/values/langsmith-values-smithdb*.yaml           ← when enable_smithdb = true
```

`helm/values/`、`values-overrides.yaml` 和 `langsmith-values-*.yaml` 覆盖层中生成的文件将被 gitignored，因为它们包含实时机密。 `make init-values` 写入它们，从 `helm/values/examples/` 复制大部分覆盖。 `make clean` 还会删除已提交的 `values.yaml`，并且 `git checkout -- helm/values/values.yaml` 会恢复它。

### 第 2 天运营

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make status         # 9-section health check
make status-quick   # skip the Key Vault, kubeconfig, Kubernetes, and Helm checks (faster)
make deploy         # re-deploy after any Helm value changes
make init-values    # re-generate values after Terraform changes
make kubeconfig     # refresh cluster credentials
make k8s-secrets    # re-create langsmith-config-secret from Key Vault
```### 从图表 0.16 升级

<Warning>
  升级前备份数据库。 LangSmith 数据库迁移是只向前的，因此部署在运行 0.17 后无法返回到图表 0.16。有关更多信息，请参阅[Upgrade an installation](/langsmith/self-host-upgrades)。
</Warning>

要将部署从图表 0.16 移至 0.17：

1. 查看最新的`v0.17.*`模块标签：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   git fetch --tags
   git checkout "$(git tag -l 'v0.17.*' --sort=-v:refname | head -1)"
   ```

2. 运行`make init ARGS=-upgrade`更新新标签的提供程序和模块。

3. 检查新标签上的 `infra/variables.tf` 是否声明了 `terraform.tfvars` 设置的每个变量。

   <Warning>
     在 `v0.16.*` 行添加的变量会到达稍后标记中的 `v0.17.*` 行。 v0.17.0 未声明 `ingress_load_balancer`、`ingress_load_balancer_subnet_id`、`ingress_load_balancer_ip`、`ingress_load_balancer_manage_subnet_assignment`、`envoy_gateway_image_registry` 或 `envoy_gateway_image_pull_secret_name`，这是 v0.17.1 添加的。 `aks_network_owner_checks` 到达稍后标签中的 `v0.17.*` 行。 Terraform 仅警告 `terraform.tfvars` 中未声明的变量，因此在缺少该变量的标签上设置变量的部署会丢失该设置而不会出现错误。
   </Warning>

4. 如果 `terraform.tfvars` 将 `langsmith_helm_chart_version` 设置为 0.16 版本，请清除它或设置 0.17 版本，然后运行 `unset CHART_VERSION`（如果您的 shell 设置了它）。在 0.16 值上，`deploy.sh` 与 `does not resolve to the chart 0.17 line` 一起退出。

5. 运行`make apply`。它添加了两个 LLM Gateway 联合凭据。

6. 运行`make init-values`重新生成图表0.17形状中的值文件。

7. 运行`make deploy`。如果您在自己的值中启用了 Engine，图表 0.17 还需要 `engine.usageSigningSecret`（至少 32 个字符），或者 `config.existingSecretName` 命名的 Secret 中的 `engine_usage_signing_secret` 键。

除了两个联合凭据之外，Azure 上的升级仅移动图表图钉。仍在图 0.15 上的安装必须首先遵循 [⟦T242⟧](https://github.com/langchain-ai/terraform/blob/main/MIGRATION-0.15-to-0.16.md)。有关图表更改的完整列表，请参阅[⟦T243⟧](https://github.com/langchain-ai/terraform/blob/main/MIGRATION-0.16-to-0.17.md)。

## 启用附加组件

每个附加组件都由 `infra/terraform.tfvars` 中的标志控制。设置标志，重新运行`make init-values`以重新生成值，然后重新运行`make deploy`。

### LangSmith 部署

启用 [LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform)，它允许您直接从 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-self-host-terraform-azure-deploy) 将代理部署和管理为 API 服务器。这添加了三个新的 Pod。

|吊舱 |角色 |工作负载身份 |
| - | - | - |
| `langsmith-host-backend` | LangSmith 部署控制平面API。管理部署生命周期，将状态存储在共享 PostgreSQL 中。 |是的 |
| `langsmith-listener` |监视主机后端，在 Kubernetes 中创建和更新 `LangGraphPlatform` CRD。 |是的 |
| `langsmith-operator` |协调 CRD。创建每个部署的 Deployment、StatefulSet 和服务。 |没有 |

#### 首先扩展节点池

在启用之前，将 `default_node_pool_min_count` 提高到至少 5。操作员按需生成代理部署 Pod，并需要节点空间：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
default_node_pool_min_count = 5      # operator pods need headroom
enable_deployments          = true
```如果没有这个净空，操作员生成的代理吊舱将无限期地停留在 `Pending` 中。

#### 应用、重新生成值、部署

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make apply          # scale up node pool (~5 min)
make init-values    # picks up enable_deployments = true → generates add-on overlay
make deploy         # rolls out host-backend + listener + operator
```

`make init-values` 将LangSmith 部署附加覆盖层 (`langsmith-values-agent-deploys.yaml`) 添加到价值链。它会自动注入：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  deployment:
    enabled: true                          # REQUIRED, without this listener and operator are skipped silently
    url: "https://<your-hostname>"         # must match config.hostname (with protocol)
    tlsEnabled: true                       # set based on tls_certificate_source
```

如果没有`url`中的`https://`协议，运营商部署的代理将陷入`DEPLOYING`。 `make init-values` 在每次运行时都会覆盖这些值，因此请勿在覆盖文件中编辑它们。

#### 验证

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# All three pods Running
kubectl get pods -n langsmith | grep -E "host-backend|listener|operator"

# LangSmith Deployment CRDs registered
kubectl get crd | grep langchain

# List LangSmith Deployments (empty on first deploy, populated when you create a deployment)
kubectl get lgp -n langsmith
```

预期：`langsmith-host-backend`、`langsmith-listener` 和 `langsmith-operator` 全部运行。 Pod 总数：\~20 个正在运行 + 3 个已完成的作业。

KEDA 已与基础设施一起安装。使用 `enable_deployments = true`，操作员可以为每个代理部署的工作队列创建 KEDA `ScaledObject` 资源。 Worker Pod 在空闲时缩小到零，并根据 Redis 队列深度进行扩展。

### 舰队

[Fleet](/langsmith/fleet) 是受支持的 Agent Builder 后续版本。与其他附加标志不同，`enable_fleet` 还驱动 Terraform。 `make apply` 在外部 PostgreSQL 服务器上创建专用的 `langsmith_fleet` 数据库和 `langsmith-fleet-postgres` Kubernetes 密钥。

`make init-values` 和 `make deploy` 强制执行三项要求：

* `enable_deployments = true`
* `postgres_source = "external"`
* `enable_agent_builder = false`

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_deployments = true    # required prerequisite
enable_fleet       = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make apply          # creates the langsmith_fleet database and secret
make init-values    # appends langsmith-values-fleet.yaml to the values chain
make deploy
```Fleet 重复使用 `langsmith-config-secret` 中的 Agent Builder 加密密钥。其 Redis 作为图表管理的 Pod 在集群中运行，因为 Azure 托管 Redis 无法在自己的逻辑数据库中隔离 Fleet。

`langsmith-fleet-tool-server` 和 `langsmith-fleet-trigger-server` ServiceAccounts 需要工作负载标识才能访问 Azure Blob 存储。他们的联合凭证已在`infra/modules/k8s-cluster/main.tf`中预先注册；无需额外设置。

验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep fleet
```

### 代理生成器

`enable_agent_builder` 是旧路径。在图表 0.16 及更高版本中，它添加了 Agent Builder UI 导航项以及 Fleet 工具和触发器服务器，但没有代理运行时。请使用 [Fleet](#fleet) 代替。这两个标志是互斥的，当两者都设置时，或者当 `enable_deployments` 关闭时，`make deploy` 会停止并出现错误。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_deployments   = true    # required prerequisite
enable_agent_builder = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init-values    # appends langsmith-values-agent-builder.yaml to values chain
make deploy
```

<Warning>
  不要将 `config.agentBuilder.encryptionKey` 内嵌设置在 `values-overrides.yaml` 中。内联值会覆盖 `langsmith-config-secret` 中的键并造成不匹配。
</Warning>

### 见解和波莉

两个特征，彼此独立；启用其中一个而不启用另一个。 Polly 在 LangSmith 部署上运行，因此请设置 `enable_deployments = true`。部署脚本不会检查这一点。* **见解**：人工智能驱动的跟踪分析。在 LangSmith 痕迹中显示图案和异常。作为静态 `standalone-insights` api 服务器和队列 Pod 运行。覆盖设置顶级`insights.enabled: true`。
* **Polly**：人工智能驱动的评估和监控代理。作为静态 `standalone-polly` api 服务器和队列 Pod 运行。覆盖设置顶级`polly.enabled: true`。

无需`terraform apply`；运行`make init-values && make deploy`。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_deployments = true    # Polly runs on LangSmith Deployment
enable_insights    = true    # Insights analytics
enable_polly       = true    # Polly AI evaluation agent
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init-values    # appends insights + polly add-on overlays to the values chain
make deploy         # rolling update, ~5 min
```

Insights 叠加层仅打开该功能。 ClickHouse 连接位于 `values-overrides.yaml` 中，由 `terraform.tfvars` 中的 `clickhouse_source` 驱动。

验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Static Insights and Polly pods
kubectl get pods -n langsmith | grep -E "clickhouse|standalone-insights|standalone-polly"

# Confirm Insights is enabled in Helm values
helm get values langsmith -n langsmith | grep -A3 insights
# Expected: enabled: true
```

<Warning>
  **首次启用后加密密钥不得更改。** 更改 `insights_encryption_key` 或 `polly_encryption_key` 会永久损坏所有现有加密数据。没有恢复路径。这些密钥位于 Key Vault 中并且永远不会自动轮换。
</Warning>

如果首次启用后 Polly UI 显示“无法连接到 LangGraph 服务器”，则前端在 `langsmith-polly-config` ConfigMap 存在之前启动。运行`kubectl rollout restart deployment langsmith-frontend -n langsmith`。

### 史密斯数据库

<Warning>
  Azure 上的 SmithDB 需要 LangSmith Helm 图表 0.17 系列上的稳定版本，`v0.17.*` 模块标签默认部署该版本。 0.17 候选版本不是受支持的配置。在 `v0.16.*` 标签上，SmithDB 需要 v0.16.56 或更高版本以及 `langsmith_helm_chart_version = "~0.17.0"`。
</Warning>`enable_smithdb = true` 提供 SmithDB 所需的 Azure 基础设施：专用的 PostgreSQL 18 元存储、Blob 容器、工作负载身份和高级 SSD v2 缓存卷。它还需要一个非空的`availability_zones`，因为高级 SSD v2 仅附加到大多数区域中的区域虚拟机。 AKS 仅在创建集群时应用区域，因此如果您计划使用 SmithDB，请在第一个 `make apply` 中设置 `availability_zones`。在没有区域创建的集群上，稍后添加它们会通过计划，但模块会忽略现有节点池上的区域更改：节点保持非区域性，并且每个计划都会打印区域漂移警告。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_smithdb     = true
availability_zones = ["1", "2", "3"]
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make apply          # creates the SmithDB infrastructure
make init-values    # generates langsmith-values-smithdb.yaml and langsmith-values-smithdb-overrides.yaml
make deploy
```

有关版本要求以及摄取、迁移和查询标志，请参阅[Azure module repo](https://github.com/langchain-ai/terraform/blob/main/modules/azure/SMITHDB.md)中的`SMITHDB.md`。

### 法学硕士网关

`enable_llm_gateway = true` 部署 [LLM Gateway](/langsmith/llm-gateway)，它允许一个 LangSmith API 密钥在您的组织配置的提供商之间调用模型。 LLM Gateway 处于测试阶段，需要图表 0.17。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_llm_gateway           = true
enable_gateway_pii_redaction = false   # true adds the Presidio analyzer for PII redaction
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init-values    # generates langsmith-values-llm-gateway.yaml
make deploy
```

客户端到达LangSmith主机名上的网关：

|客户端格式|基本网址 |
| - | - |
| OpenAI 聊天完成和回复 | `https://<hostname>/gateway/v1` |
| Anthropic 留言 | `https://<hostname>/gateway` |部署后，组织管理员打开工作区的网关，添加提供程序机密并授予访问权限。欲了解更多信息，请参阅[LLM Gateway admin setup](/langsmith/llm-gateway-admin-setup)。

* **工作负载身份**：无论是否设置该标志，Terraform 都会联合 `<release>-agent-gateway` 和 `<release>-presidio-analyzer` ServiceAccounts，因此从 `v0.17.*` 标签应用的集群不需要 `make apply`。在最后从旧标签应用的集群上，首先运行 `make apply` 一次。
* **超时**：模型调用最多可以运行 900 秒。将 `ingress_controller` 设置为 `nginx` 或 `agic` 时，`make deploy` 为 `/gateway/` 提供 900 秒超时的自己的 Ingress，而 `make uninstall` 将其删除。 Istio 默认不设置请求超时。使用 `envoy-gateway` 或 `none`，`make init-values` 会打印警告，并且您自己提高该控制器上的超时。
* **PII 修订**：`enable_gateway_pii_redaction = true` 添加了 Presidio 分析器并为新组织启用修订。它需要`enable_llm_gateway = true`。分析器映像 `mcr.microsoft.com/presidio-analyzer` 来自 Microsoft 的注册表，因此私有注册表镜像必须将其包含在该路径下。

### 与 OIDC 的 SSO

`enable_sso_oidc = true` 通过标准 OIDC 提供商（例如 Microsoft Entra ID、Okta、Auth0 或 Google Workspace）将 LangSmith 登录从基本身份验证切换到 [SSO](/langsmith/self-host-sso)。<Warning>
  仅在初始安装后，以组织管理员身份使用基本身份验证登录后，才启用 SSO。该标志会禁用基本身份验证，因此在管理员帐户存在之前启用它会将您锁定在用户界面之外。如果您使用 SCIM，请在 SSO 之后进行设置。
</Warning>

要启用单点登录：

1. 将 OIDC 客户端凭据存储在 Key Vault 中：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   ./infra/scripts/manage-keyvault.sh set langsmith-oauth-client-id '<client-id>'
   ./infra/scripts/manage-keyvault.sh set langsmith-oauth-issuer-url '<issuer-url>'
   make keyvault   # set langsmith-oauth-client-secret; the prompt hides the value
   ```

   通过`make keyvault`设置客户端密钥，它会读取值而不回显它。通过命令行传递，秘密会显示在进程列表和 shell 历史记录中。

   对于 Entra ID，发行人 URL 为 `https://login.microsoftonline.com/<tenant-id>/v2.0`。需要 `/v2.0` 后缀。
2. 将`enable_sso_oidc = true`设置为`infra/terraform.tfvars`。
3. 重新创建 Kubernetes 密钥、重新生成值并部署：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   make k8s-secrets
   make init-values
   make deploy
   ```

当三个 Key Vault 机密中的任何一个丢失时，`make init-values` 会停止并出现错误。

### 附加组件摘要|相|新豆荚 |总\~运行|
| - | - | - |
|基础安装 |核心LangSmith（后端、前端、队列、摄取队列、clickhouse 等）| \~17 |
| LangSmith 部署| `host-backend`、`listener`、`operator` | \~20 |
|舰队| `fleet-tool-server`、`fleet-trigger-server` 和 Fleet 集群内 Redis |变化 |
|见解和波莉 | `standalone-insights` 和 `standalone-polly` api 服务器和队列 Pod |变化 |
|法学硕士网关| `agent-gateway`，加上带有 PII 编辑的 `presidio-analyzer` |变化 |

## 入口控制器

将`ingress_controller`设置在`terraform.tfvars`之前`make apply`。有关完整的 TLS 兼容性矩阵，请参阅 [Azure module repo](https://github.com/langchain-ai/terraform/blob/main/modules/azure/INGRESS_CONTROLLERS.md) 中的 `INGRESS_CONTROLLERS.md`。|价值| Terraform 安装什么 |最适合 |
| - | - | - |
| `envoy-gateway` *（默认）* | `gateway-helm` OCI 图表，Kubernetes 网关 API |标准部署。本机网关 API。 |
| `nginx` | `ingress-nginx` 带有 Azure LB 的 Helm 图表 |旧版 Ingress 兼容性。 |
| `istio-addon` | AKS 服务网格附加组件（Azure 管理的 Istio）| Azure 管理的 Istio 网格、多数据平面、mTLS。 |
| `istio` | `istio-base` + `istiod` + `istio-ingressgateway` |自我管理的 Istio。全网格和边车注入。 |
| `agic` | Azure 应用程序网关 v2 + AKS 管理的 `ingress_application_gateway` 附加组件 | Enterprise Azure、本机 L7 WAF、仅 HTTP、具有自定义域的 `dns01` 或具有您自己的证书的 `existing`。 |
| `none` |无入口控制器 |已经运行自己的控制器的集群。 |

<Warning>
  在现有部署上更改 `ingress_controller` 会删除旧控制器及其负载均衡器，并且公共 IP 会发生更改。如果部署运行 ingress-nginx 并且 `ingress_controller` 未设置，`make plan` 和 `make apply` 将停止并出现错误。设置`ingress_controller = "nginx"`以保留NGINX，或设置`ingress_controller = "envoy-gateway"`以移动。要移动，请连续运行 `make apply`、`make init-values` 和 `make deploy`，然后更新指向旧 IP 的任何 DNS A 记录。
</Warning><Warning>
  `letsencrypt` (HTTP-01) 仅适用于 `nginx`、`istio`（自我管理）和 `envoy-gateway`。 `istio-addon` 不会创建 IngressClass，因此 ACME 求解器无法接收流量。使用 `agic`，应用程序网关重写了 ACME 质询路径，因此 HTTP-01 求解器失败。对于两者，请将 `dns01` 与自定义域一起使用，将 `existing` 与您自己的证书一起使用，或将 `none` 用于仅 HTTP。
</Warning>

## DNS 和 TLS

`dns_label` 为您提供免费的 Azure 子域 `<label>.<region>.cloudapp.azure.com`，无需域注册或 DNS 区域。 `deploy.sh` 自动注释正确的 LoadBalancer 服务。对于 `envoy-gateway`，它在 EnvoyProxy 资源上设置标签。

默认 `tls_certificate_source` 为 `letsencrypt`。

**仅限 HTTP（演示或开发）：**

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dns_label              = "langsmith-prod"
tls_certificate_source = "none"
```

**使用 Let's Encrypt 添加 HTTPS（nginx、自管理 istio 或 envoy-gateway）：**

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dns_label              = "langsmith-prod"
tls_certificate_source = "letsencrypt"
letsencrypt_email      = "you@example.com"
```

**自定义域 + DNS-01（所有控制器，在防火墙后面工作）：**

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith_domain       = "langsmith.mycompany.com"
tls_certificate_source = "dns01"
letsencrypt_email      = "you@example.com"
create_dns_zone        = true
install_cert_manager   = true # default; dns01 requires it
# After deploy: add ingress_ip = "<lb-ip>" and re-run make apply (creates A record)
```

**您自己的证书：**

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith_domain       = "langsmith.mycompany.com"
tls_certificate_source = "existing"
```

在`make deploy`之前，在`langsmith`命名空间中创建一个名为`langsmith-tls`的`kubernetes.io/tls` Secret。首先放置叶证书，然后放置中间证书。如果 Secret 丢失或类型错误，`deploy.sh` 将停止。更新是您的责任。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl -n langsmith create secret tls langsmith-tls --cert=fullchain.pem --key=privkey.pem
```如果 LangSmith 调用的私有 CA 签名端点，请将 `langsmith_custom_ca_secret_name` 设置为保存 CA 捆绑包的 `langsmith` 命名空间中的 Secret。捆绑密钥默认为`ca.crt`；用 `langsmith_custom_ca_secret_key` 覆盖它。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl -n langsmith create secret generic <secret-name> --from-file=ca.crt=ca-bundle.pem
```

**dns01流程：**

1. `make apply` 创建 Azure DNS 区域并输出 4 个名称服务器。
2. 在您的注册商处，为指向这 4 个名称服务器的子域添加 NS 记录。使用 NS 委派，而不是 CNAME：cert-manager 将 DNS-01 TXT 记录写入区域，因此 Azure DNS 必须对该子域具有权威性。
3. 验证：`dig NS langsmith.mycompany.com @8.8.8.8`。
4. `make deploy` 自动通过 DNS-01 颁发证书（Workload Identity 将 TXT 记录写入 Azure DNS）。
5. 获取LB IP，将`ingress_ip = "<ip>"`添加到`terraform.tfvars`，然后添加`make apply`（创建A记录）。对于`envoy-gateway`，运行`kubectl get svc -n envoy-gateway-system -l gateway.envoyproxy.io/owning-gateway-name=langsmith-gateway`。对于`nginx`​​，运行`kubectl get svc -n ingress-nginx`。
6. `make status` 准确显示每个阶段要添加的 NS 和 A 记录。

## 后续步骤

* 参考[Azure variables](/langsmith/self-host-terraform-azure-variables)和[quick reference](/langsmith/self-host-terraform-azure-quick-reference)。
* 查看 [Azure architecture](/langsmith/self-host-terraform-azure-architecture) 的模块结构、流量和工作负载身份。
* 当出现故障时，请检查[Azure troubleshooting guide](/langsmith/self-host-terraform-azure-troubleshooting)。
* 使用 [LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform) 在 UI 中启用代理部署。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-azure-deploy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>