<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy LangSmith on GCP with Terraform | https://docs.langchain.com/langsmith/self-host-terraform-gcp-deploy -->

# 使用 Terraform 在 GCP 上部署 LangSmith

使用 LangChain Terraform 模块在 GCP GKE 上配置自托管 LangSmith 的端到端演练。

与公共 [Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/gcp) 一起将 LangSmith 部署到 GCP。通过将部署管理为代码，您可以跨项目版本控制、检查和重现 LangSmith 环境，而无需通过 Google Cloud 控制台进行点击。

安装分两个阶段运行：

1. **基础设施**：Terraform 提供 VPC、GKE、Cloud SQL、Memorystore、GCS 和工作负载身份。
2. **应用程序**：LangSmith Helm 图表，使用部署脚本安装或直接使用`helm` 安装。

基本安装后，通过设置标志和重新部署来启用可选附加组件。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {'flowchart': {'nodeSpacing': 25, 'rankSpacing': 30}}}%%
graph TB
    subgraph stage1["Set up infrastructure"]
        direction LR
        Start["source setup-env.sh<br/>secrets to Secret Manager"]
        TF["terraform apply"]
        Infra["VPC · GKE · Cloud SQL<br/>Memorystore · GCS<br/>Workload Identity"]
        Bootstrap["Bootstrap workloads<br/>cert-manager · KEDA<br/>Envoy Gateway"]
        Start --> TF --> Infra -->|GKE ready| Bootstrap
    end
    subgraph stage2["Deploy the application"]
        direction LR
        Deploy["make init-values<br/>make deploy"]
        DNS["Point DNS A record<br/>at Gateway IP"]
        Cert["cert-manager issues<br/>Let's Encrypt cert"]
        Running["LangSmith running<br/>all pods healthy"]
        Deploy --> DNS --> Cert --> Running
    end
    stage1 --> stage2

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class Start,DNS trigger
    class TF,Bootstrap,Deploy,Cert process
    class Infra neutral
    class Running output

    style stage1 fill:none,stroke:#40668D,stroke-width:1px
    style stage2 fill:none,stroke:#40668D,stroke-width:1px
```

当您使用 `tls_certificate_source = "letsencrypt"` 设置域时，适用 DNS 和证书步骤。通过 `tls_certificate_source = "none"` 和 `langsmith_domain = ""`，LangSmith 在网关 IP 上提供 HTTP 服务。

## 先决条件

### 所需工具

|工具|版本 |目的|
| - | - | - |
|谷歌云 SDK (`gcloud`) | 450 | 450身份验证、查询 GCP 资源、管理 GKE 凭据 |
|地形 | 1.11 | 1.11运行基础设施模块 |
| `kubectl` | 1.28 | 1.28检查 GKE 集群 |
|头盔| 3.12 | 3.12安装和管理LangSmith图表|

在 macOS 上安装：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
brew install --cask google-cloud-sdk
brew install kubectl helm
brew tap hashicorp/tap && brew install hashicorp/tap/terraform

gcloud version
terraform version
kubectl version --client
helm version
```

### 所需的 GCP APITerraform 在首次应用时自动启用这些功能，但必须首先启用 `cloudresourcemanager.googleapis.com`，以便 Terraform 可以启用其余功能。手动启用所有内容以实现快速首次运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud services enable \
  container.googleapis.com \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  storage.googleapis.com \
  iam.googleapis.com \
  secretmanager.googleapis.com \
  certificatemanager.googleapis.com \
  servicenetworking.googleapis.com \
  cloudresourcemanager.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  --project <your-project-id>
```

### 所需的 IAM 角色

运行 Terraform 的主体需要在目标项目上具有以下角色。初始部署稳定后，修剪到最低权限。

|角色 |目的|
| - | - |
| `roles/container.admin` |创建和管理 GKE 集群 |
| `roles/compute.networkAdmin` |创建VPC、子网、防火墙规则 |
| `roles/iam.serviceAccountAdmin` |为 Workload Identity 创建服务帐户 |
| `roles/cloudsql.admin` |创建和管理 Cloud SQL 实例 |
| `roles/redis.admin` |创建和管理 Memorystore Redis |
| `roles/storage.admin` |创建 GCS 存储桶和生命周期策略 |
| `roles/resourcemanager.projectIamAdmin` |在配置期间授予 IAM 绑定 |
| `roles/servicenetworking.networksAdmin` |创建私有服务连接（Cloud SQL 和 Redis 所需）|
| `roles/compute.securityAdmin` |创建防火墙规则和 SSL 证书 |
| `roles/iam.serviceAccountUser` |将服务帐户附加到 GKE 节点 |
| `roles/serviceusage.serviceUsageAdmin` |启用所需的 GCP API |

添加 `roles/secretmanager.admin`，因此 `setup-env.sh` 和可选的 `secrets` 模块可以写入 Secret Manager，当 `enable_dns_module = true` 时，可以写入 `roles/dns.admin`，当设置 `smithdb_bucket_kms_key` 时，可以写入密钥上的 `roles/cloudkms.admin`。该模块的[PERMISSIONS.md](https://github.com/langchain-ai/terraform/blob/main/modules/gcp/PERMISSIONS.md)列出了全套。

### 验证

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud auth login
gcloud config set project <your-project-id>
gcloud auth application-default login
```您还需要 LangSmith 许可证密钥 ([contact our sales team](https://www.langchain.com/contact-sales))。对于 HTTPS，您还需要一个由您控制其 DNS 的域或子域。

## 快速入门

> [!提示]
>
> 有关 `make` 目标、所需变量和常见约束的简明备忘单，请参阅 [GCP quick reference](/langsmith/self-host-terraform-gcp-quick-reference)。

要获得从零到正在运行的 LangSmith 实例的最快路径，请按顺序运行这些命令。他们部署了 Helm Chart 0.17。要部署图表 0.16，请参阅[Clone and configure](#clone-and-configure)。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# 1. Clone the public modules
git clone https://github.com/langchain-ai/terraform.git
cd terraform/modules/gcp

# 2. Generate terraform.tfvars interactively (Enter accepts current values)
make quickstart

# 3. Load secrets into Secret Manager
#    Must be sourced, not executed
source infra/scripts/setup-env.sh
export LANGSMITH_ADMIN_EMAIL="<your-admin-email>"

# 4. Validate environment
make preflight

# 5. Provision infrastructure (~25 to 35 min)
make init
make plan
make apply

# 6. Configure kubectl
make kubeconfig
kubectl get nodes

# 7. Deploy LangSmith via Helm (~8 to 12 min)
make init-values
make deploy

# 8. Get the Gateway IP for DNS
kubectl get gateway -n envoy-gateway-system \
  -o jsonpath='{.items[0].status.addresses[0].value}'
```

以下部分详细介绍了每个阶段。

## 提供基础设施

Terraform 提供以下 GCP 资源：|资源 |目的|
| - | - |
| VPC+子网+云NAT |集群和托管服务的专用网络|
|私人服务连接| Cloud SQL 和 Memorystore 私有 IP 的 VPC 对等互连 |
| GKE 集群（标准或 Autopilot）| Kubernetes 计算、启用 Workload Identity |
|云 SQL PostgreSQL | LangSmith 运营数据、HA备用、私有IP |
|内存存储Redis |队列和缓存、STANDARD\_HA 层、私有 IP |
| GCS铲斗|跟踪有效负载 blob 存储、生命周期规则 |
| Workload Identity 服务帐户 |无需静态密钥的每个 Pod GCP 访问 |
|证书管理器、KEDA、Envoy Gateway |与基础设施一起安装的 Bootstrap 工作负载 |

### 克隆并配置

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git clone https://github.com/langchain-ai/terraform.git
cd terraform/modules/gcp
```

所有后续命令都从`modules/gcp/`运行。运行 `make help` 以获得完整的目标列表。

> [!注意]
>
> `main` 分支和 `v0.17.x` 发布标签部署 Helm Chart 0.17，本指南对它们进行了介绍。 `v0.16.x`标签部署图表0.16。要停留在图表 0.16 上，请列出标签并查看最新的 `v0.16.x` 标签：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> git tag -l 'v0.16.*' --sort=-v:refname | head -1
> git checkout <tag>
> ```
>
> 以“图表 0.16”开头的注释描述了 0.16 线的不同之处。要将现有部署移至图表 0.17，请参阅 [Upgrade from chart 0.16](#upgrade-from-chart-0-16)。

使用交互式向导生成 `terraform.tfvars`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make quickstart
```该向导会要求您选择 Dev/POC 或 Production 配置文件，然后提示输入项目 ID、命名前缀、区域、GKE 大小、TLS 源、外部与集群内服务以及可选的附加标志。生产配置文件提供了附加组件； Dev/POC 配置文件将其关闭。上面写着`infra/terraform.tfvars`。重新运行预选现有值；在每次提示时按 Enter 键以保留当前配置。

更喜欢手动编辑：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cp infra/terraform.tfvars.example infra/terraform.tfvars
vi infra/terraform.tfvars
```

对于占用空间最小的开发安装，请从 `infra/terraform.tfvars.minimum` 开始。典型的生产配置：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
project_id       = "<your-gcp-project-id>"
name_prefix      = "ls"
environment      = "prod"
langsmith_domain = "langsmith.example.com"

region = "us-west2"
zone   = "us-west2-a"

postgres_source = "external"
redis_source    = "external"

clickhouse_source = "in-cluster"

tls_certificate_source = "letsencrypt"
letsencrypt_email      = "ops@example.com"

enable_langsmith_deployment = true
```

不要将许可证密钥和密码放在`terraform.tfvars` 之外。 `setup-env.sh` 将它们存储在 Secret Manager 中并将其导出为 `TF_VAR_*` 变量。请参阅每个输入变量的[GCP variables reference](/langsmith/self-host-terraform-gcp-variables)。

> [!提示]
>
> 在应用之前配置远程状态后端。将`infra/backend.tf.example`复制到`infra/backend.tf`并将其指向您控制的GCS存储桶。本地状态很脆弱，在目录重组期间可能会丢失。

### 将机密加载到机密管理器中

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
source infra/scripts/setup-env.sh
```该脚本从 `terraform.tfvars` 读取 `project_id`、`name_prefix`、`environment` 和 `region`，并将每个秘密存储为 `langsmith-<name_prefix>-<environment>-<key>`。对于每个密钥，它会重复使用导出的值、读取现有的 Secret Manager 密钥、自动生成密钥（适用于 API 密钥盐、JWT 密钥和 Fernet 密钥），或者提示您。您提供 Postgres 密码、许可证密钥和初始管理员密码。管理员密码至少需要 12 个字符，包含小写字母、大写字母和符号。必须获取脚本，因为 `make` 无法将环境变量导出回父 shell。

`make deploy` 从同一 shell 读取这些 `TF_VAR_*` 值和 `LANGSMITH_ADMIN_EMAIL`，因此从源脚本的 shell 运行它。要稍后列出、读取或轮换机密，请运行 `make secrets`。

### 飞行前检查

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make preflight
```

`make preflight` 验证`gcloud` 身份验证、项目计费、所需的 GCP API、Terraform 所需的 IAM 权限以及 CPU 等区域配额。传递 `ARGS="--domain <your-domain>"` 还可检查匹配的 Cloud DNS 区域。在这里发现差距比`terraform apply`中期发现差距更快。

### 申请

> [!注意]
>
> 在干净的项目上配置 GCP 云基础需要 25 到 35 分钟。不要中断应用。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init
make plan
make apply
````make plan` 显示了建议的差异。在应用之前检查输出。 `make apply` 按依赖顺序进行配置：VPC 和网络，然后是 GKE（大约 10 到 15 分钟）、私有服务连接、Cloud SQL（大约 10 分钟，具有 HA）、Memorystore、GCS 和引导工作负载。

等效直接 Terraform 流：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd modules/gcp/infra

terraform init
terraform plan
terraform apply
```

### 配置 kubectl

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make kubeconfig
kubectl get nodes
```

所有节点都应报告`Ready`。

### 验证引导组件

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n cert-manager
kubectl get pods -n keda
kubectl get secrets -n langsmith
```

cert-manager、KEDA 和 LangSmith 命名空间机密都应该就位。

## 部署LangSmith

使用两个受支持的部署路径之一：

|路径|命令|何时使用 |
| - | - | - |
| [Script-driven Helm deploy *(recommended)*](#script-driven-helm-deploy-recommended) | `make init-values && make deploy` |交互式输出、kubeconfig 刷新、预检检查。最适合首次部署和第二天重新部署。 |
| [Manual Helm install](#manual-helm-install) | `helm upgrade --install langsmith langchain/langsmith ...` |直接使用`helm`，无需包装脚本。最适合拥有现有 Helm 工具的团队。 |

### 脚本驱动的 Helm 部署（推荐）

两个命令安装 LangSmith 图表，并使用从 Terraform 输出连接的合理默认值：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd modules/gcp

make init-values
make deploy
````init-values.sh` 从 `LANGSMITH_ADMIN_EMAIL` 获取管理员电子邮件（或提示），然后从 `terraform.tfvars` 读取 `sizing_profile` 和 `enable_*` 标志，并将匹配值文件从 `helm/values/examples/` 复制到 `helm/values/`。它还会使用您的主机名、工作负载身份注释和 GCS 存储桶名称生成 `values-overrides.yaml`。该文件还以明文形式保存机密：许可证密钥、API 密钥盐、JWT 机密、管理员密码以及 SSO 启用时的 OIDC 客户端机密。该模块的 `.gitignore` 排除了它，因此不要提交或共享它。

`make deploy` 运行 `helm/scripts/deploy.sh`，刷新 kubeconfig，运行预检检查，根据 `TF_VAR_*` 值和 `LANGSMITH_ADMIN_EMAIL` 构建 `langsmith-config` Kubernetes Secret，应用分层值文件，然后运行 ​​`helm upgrade --install`。

> [!注意]
>
> 部署脚本默认安装 Helm 图表版本 `~0.17.0` 并拒绝 0.17 行之外的版本。要固定特定的 0.17 版本，请在 `terraform.tfvars` 中设置 `langsmith_helm_chart_version` 或导出 `CHART_VERSION`。
>
> 在图表 0.16 上，默认为 `~0.16.0`，脚本拒绝 0.16 线以外的版本。

图表安装和 Pod 准备就绪预计需要 8 到 12 分钟。

如果您完成了脚本驱动的部署，请跳至[Verify and configure DNS](#verify-and-configure-dns)。以下路径是脚本驱动部署的替代路径。### 手动 Helm 安装

最适合直接运行`helm`而无需脚本的团队。首先生成所需的秘密：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export API_KEY_SALT=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)
export AGENT_BUILDER_ENCRYPTION_KEY=$(python3 -c \
  "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
export INSIGHTS_ENCRYPTION_KEY=$(python3 -c \
  "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="<strong-password>"
```

附带的 `helm/values/values.yaml` 设置 `config.blobStorage.engine: GCS`（本机 GCS 模式），因此 Blob 存储通过 Workload Identity 进行身份验证，无需 HMAC 密钥。每个组件的 Workload Identity 注释位于 `values-overrides.yaml` 中；使用`make init-values`生成它，或者手动添加每个组件的`serviceAccount.annotations."iam.gke.io/gcp-service-account"`。

以下命令安装图表 0.17。在图 0.16 上，使用`--version ~0.16.0`。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm repo add langchain https://langchain-ai.github.io/helm
helm repo update

helm upgrade --install langsmith langchain/langsmith \
  --namespace langsmith \
  --create-namespace \
  --version ~0.17.0 \
  -f helm/values/values.yaml \
  -f helm/values/values-overrides.yaml \
  --set config.langsmithLicenseKey="<your-license-key>" \
  --set config.apiKeySalt="$API_KEY_SALT" \
  --set config.basicAuth.jwtSecret="$JWT_SECRET" \
  --set config.hostname="<your-langsmith-domain>" \
  --set config.basicAuth.initialOrgAdminEmail="$ADMIN_EMAIL" \
  --set config.basicAuth.initialOrgAdminPassword="$ADMIN_PASSWORD" \
  --set config.agentBuilder.encryptionKey="$AGENT_BUILDER_ENCRYPTION_KEY" \
  --set insights.encryptionKey="$INSIGHTS_ENCRYPTION_KEY" \
  --set config.blobStorage.bucketName="$(terraform -chdir=infra output -raw storage_bucket_name)" \
  --set gateway.enabled=true \
  --set ingress.enabled=false \
  --wait --timeout 15m
```

> [!注意]
>
> 要使用 S3 兼容的 Blob 存储而不是 Workload Identity，请添加 `--set config.blobStorage.engine=S3` 并使用 `--set config.blobStorage.accessKey=<key>` 和 `--set config.blobStorage.accessKeySecret=<secret>` 传递 HMAC 密钥。在 **云存储** > **设置** > **互操作性** 下创建 HMAC 密钥。

### 验证并配置 DNS

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith

EXTERNAL_IP=$(kubectl get gateway -n envoy-gateway-system \
  -o jsonpath='{.items[0].status.addresses[0].value}')

echo "Create A record: $EXTERNAL_IP -> <your-langsmith-domain>"

kubectl get certificate -n langsmith
```

Terraform 还记录了地址：`make tf ARGS="output -raw ingress_ip"`。输出读取`pending`，直到网关获得地址；在这种情况下，请使用上面的 `kubectl get gateway` 查找。该网关被命名为`<name_prefix>-<environment>-gateway`。

在 DNS A 记录解析为网关 IP 之前，cert-manager 无法颁发 Let's Encrypt 证书。在您的 DNS 提供商处创建记录，等待传播，然后重新检查证书状态。

### 尺寸配置文件

在`terraform.tfvars`中设置`sizing_profile`，然后重新运行`make init-values && make deploy`。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sizing_profile = "production"   # default | minimum | dev | production | production-large
```|简介 |何时使用 |
| - | - |
| `default` |图表默认值，未应用叠加 |
| `minimum` |绝对地板，适合`e2-standard-4`。停车成本或 CI 烟雾测试 |
| `dev` |单一副本，最少的资源 |
| `production` |具有 HPA 的多副本。推荐用于实际工作负载 |
| `production-large` |高内存、高CPU。 50 多个用户或每秒 1000 多个跟踪 |

### 预期的 Pod

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith-ace-backend-xxx          1/1  Running    0
langsmith-backend-xxx              1/1  Running    0
langsmith-backend-auth-bootstrap   0/1  Completed  0
langsmith-backend-ch-migrations    0/1  Completed  0
langsmith-backend-migrations       0/1  Completed  0
langsmith-clickhouse-0             1/1  Running    0
langsmith-frontend-xxx             1/1  Running    0
langsmith-ingest-queue-xxx         1/1  Running    0
langsmith-platform-backend-xxx     1/1  Running    0
langsmith-playground-xxx           1/1  Running    0
langsmith-queue-xxx                1/1  Running    0
```

## 启用附加组件

每个附加组件都由 `infra/terraform.tfvars` 中的标志控制。设置标志，然后重新运行`make init-values && make deploy`。首先运行`make apply`来创建云资源的附加组件：

* SmithDB 和沙箱。
* 当 Postgres 或 Redis 位于外部时，Fleet、独立 Polly 和独立 Insights。

> [!注意]
>
> 本节中的附加组件需要 Helm 图表版本 0.16.0 或更高版本。

### LangSmith 部署

添加 `host-backend`、`listener` 和 `operator`。在启用已弃用的 Agent Builder 路径或 `enable_polly` 之前需要。 Terraform 在`enable_langsmith_deployment = true`（默认）时安装 KEDA。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_deployments = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd modules/gcp

make init-values  # copy langsmith-values-agent-deploys.yaml
make deploy       # roll out host-backend + listener + operator
```

如果您使用 [manual Helm command](#manual-helm-install) 安装，请将覆盖层和部署 URL 添加到该命令，然后重新运行它。将这两行直接插入到 `--wait --timeout 15m` 行上方：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
-f helm/values/examples/langsmith-values-agent-deploys.yaml \
--set config.deployment.url="https://<your-langsmith-domain>" \
```

该覆盖设置 `config.deployment.enabled: true` 并启用 `host-backend`、`listener` 和 `operator`。

验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep -E "host-backend|listener|operator"
kubectl get lgp -n langsmith
kubectl get crd | grep langchain
kubectl get pods -n keda
```> [!警告]
>
> `config.deployment.url` 必须包含 `https://`。如果没有协议，操作员生成的代理将无限期地陷入`DEPLOYING`。

### 舰队

> [!注意]
>
> Fleet 是以前称为 Agent Builder 的功能的当前形式，作为独立服务部署。

您可以通过`enable_fleet`启用舰队。与已弃用的 `enable_agent_builder` 路径不同，它不需要 LangSmith 部署。借助外部 Postgres 和 Redis，Terraform 在 Cloud SQL 上配置专用的 `langsmith_fleet` 数据库，并创建指向现有 Cloud SQL 和 Memorystore 实例的 `langsmith-fleet-postgres` 和 `langsmith-fleet-redis` 密钥。队列重用`langsmith_agent_builder_encryption_key`，因此从`enable_agent_builder` 迁移会保留相同的密钥和数据。

> [!注意]
>
> 舰队需要您的许可证中的 Agent Builder 或舰队权利。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_fleet = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd modules/gcp

make apply        # provision the Fleet Cloud SQL database + secrets
make init-values  # copy langsmith-values-fleet.yaml
make deploy       # roll out the standalone-fleet-* services
```

验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep standalone-fleet
```

> [!警告]
>
> 请勿同时启用 `enable_fleet` 和 `enable_agent_builder`。部署脚本拒绝组合，因为 Fleet 替换了旧的 Agent Builder 路径。

### 代理生成器（已弃用）

> [!注意]
>
> 在 GCP 上，`enable_agent_builder` 已弃用，取而代之的是 [Fleet](#fleet) (`enable_fleet`)。使用 Fleet 进行新部署。本节记录了现有安装的旧路径。先决条件：LangSmith 部署正常。添加 Agent Builder UI 及其工具和触发器服务器。 Helm Chart 0.16 删除了捆绑的代理引导作业，因此此路径不再注册代理运行时，并且当您在没有 Fleet 的情况下启用它时，部署脚本会发出警告。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_agent_builder = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init-values
make deploy
```

验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep -E "tool-server|trigger-server"
```

### 见解和波莉

Insights 支持 ClickHouse 支持的跟踪分析。 Polly 是人工智能评估和监控代理。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_insights = true
enable_polly    = true   # requires enable_deployments = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init-values
make deploy
```

使用 `clickhouse_source = "in-cluster"`，`init-values.sh` 直接写入 Insights 值文件。对于外部 ClickHouse，它会提示输入连接详细信息并创建 `langsmith-clickhouse` Kubernetes Secret。

要针对 Cloud SQL 和 Memorystore 实例而不是集群内数据库运行 Insights 或 Polly，还需设置 `enable_standalone_insights = true` 或 `enable_standalone_polly = true`。两者都不需要LangSmith部署。对于外部 Postgres 和 Redis，首先运行 `make apply`，以便 Terraform 创建专用数据库和机密。

验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep -E "insights|polly"
kubectl get pods -n langsmith -w
```

> [!警告]
>
> 首次启用后，`langsmith_insights_encryption_key` 和 `langsmith_polly_encryption_key` 不得更改。旋转将永久破坏现有的加密数据。

### 史密斯数据库SmithDB 是列式存储和查询引擎，在 LangSmith 版本中与 ClickHouse 一起运行。 `enable_smithdb` provisions a dedicated Cloud SQL metastore (PostgreSQL 18), a GCS object-store bucket, a Workload Identity service account, and cache and compute node pools. SmithDB 需要 GKE 标准； Terraform 在 Autopilot 上拒绝它。

部署有两个变量：

* **`smithdb_sizing`**：`minimal`、`small`、`medium` 或 `large`。未设置时，它遵循`sizing_profile`。 `minimal`大小不创建SmithDB节点池，运行在普通节点池上。
* **`smithdb_cache_storage`**：`local-ssd` 适用于本地 SSD 缓存节点，或 `network-disk` 适用于 C3 缓存池上每个 Pod 的 Hyperdisk 平衡卷。未设置时，`minimal` 使用`network-disk`，其他尺寸使用`local-ssd`。

有关每个大小解析为的节点池和元存储默认值，请参阅 [SmithDB variables](/langsmith/self-host-terraform-gcp-variables#smithdb)。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_smithdb = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make apply
make init-values  # copy langsmith-values-smithdb.yaml and generate its sizing and overrides files
make deploy
```

生成的 `langsmith-values-smithdb-sizing.yaml` 设置 SmithDB 资源、缓存卷和节点放置。不要将它们设置在`langsmith-values-smithdb.yaml`中。要稍后更改大小或缓存，请运行`make smithdb-configure SIZING=<size> [CACHE=<local-ssd|network-disk>]`，然后运行`make deploy-all`。

LangSmith 然后分阶段转移到 SmithDB。 ClickHouse 始终保持启用状态。 `make smithdb-phase` 在`terraform.tfvars` 设置阶段标志。每个阶段后运行`make deploy-all`，只有在前一个阶段健康后才进入下一个阶段：1. `make smithdb-phase PHASE=dual-write` 设置`smithdb_ingestion_enabled = true`，它将新写入路由到 SmithDB 以及 ClickHouse。 `make quickstart` starts new installs in this stage.
2. `make smithdb-phase PHASE=backfill`还设置了`smithdb_migration_enabled = true`，从ClickHouse回填历史数据。要选择回填开始的位置，请添加 `START_TIME=<RFC 3339 timestamp>`。
3. `make smithdb-phase PHASE=cutover` 设置`smithdb_query_enabled = true` 并关闭回填，因此 UI 和 API 读取来自 SmithDB。在回填完成之前，目标拒绝切换。 With no backfill to wait for, add `FORCE=true`.

`make smithdb-status` 报告当前阶段、大小、pod、作业和回填进度。

While the backfill runs, every chart version change requires deleting the backfill Job before the next deploy. `make deploy` 停止并打印 `kubectl delete job` 命令。 Backfill progress is kept, so the new Job resumes rather than starting over.> [!注意]
>
> 在图表 0.16 上，SmithDB 始终使用本地 SSD 和计算节点池，并且`smithdb_sizing`、`smithdb_cache_storage` 和`make smithdb-*` 目标不存在。手动设置`terraform.tfvars`中的三个阶段标志，并在每次更改后运行`make deploy-all`。回填阶段需要其 `make apply` 步骤：Terraform 授予 SmithDB 服务帐户对跟踪存储桶的读取权限，并仅在 `smithdb_migration_enabled = true` 时提高命名空间配额。回填阶段需要 Helm Chart 0.16.6 或更高版本。

验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep smithdb
```

### 沙箱

`enable_sandboxes` 为LangSmith 沙箱提供基础设施：支持 KVM 的沙箱主机节点池、用于 JuiceFS 元数据的专用 Memorystore 实例以及 JuiceFS 配置 Secret。沙箱主机 Pod 自行挂载 JuiceFS，并且 `juicefs-format` 作业在第一次部署时准备卷。沙箱需要 GKE 标准和`enable_gcp_iam_module = true`，并且该模块需要外部 Redis (`redis_source = "external"`)。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_sandboxes = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make apply
source infra/scripts/setup-env.sh   # generates the sandbox callback signing key
make init-values
make deploy
```

If your Helm release name is not `langsmith`, set `platform_backend_component_label` to `<release-name>-platform-backend` so the sandbox host can reach the platform backend.

部署脚本根据图表的应用程序版本设置沙箱主机图像标签，因此图像始终与图表匹配。> [!注意]
>
> 在chart 0.16上，沙箱通过chart安装的JuiceFS CSI驱动挂载JuiceFS，`terraform.tfvars`中需要`sandbox_host_image_tag`。 Chart 0.17 ignores that variable.

### Expected pods by add-on

**LangSmith 部署添加：** `langsmith-host-backend`、`langsmith-listener`、`langsmith-operator`。

**机队新增：** `langsmith-standalone-fleet-api-server`、`langsmith-standalone-fleet-queue`、`langsmith-fleet-tool-server`、`langsmith-fleet-trigger-server`。

**Agent Builder adds:** `langsmith-fleet-tool-server`, `langsmith-fleet-trigger-server`.

**Insights 和 Polly 添加：** `langsmith-standalone-insights-api-server`、`langsmith-standalone-polly-api-server` 及其队列工作负载。使用 `enable_insights` 或 `enable_polly` 而不是独立标志，每个标志还运行集群内 `-postgres` 和 `-redis` StatefulSet。

**SmithDB 添加：** `langsmith-smithdb-cluster-manager`、`langsmith-smithdb-ingestion`、`langsmith-smithdb-query`、`langsmith-smithdb-compaction`、`langsmith-smithdb-compaction-worker`。

## Upgrade from chart 0.16

> [!警告]
>
> Back up the databases before you upgrade.不支持从图表 0.17 降级至 0.16。

要将部署从 `v0.16.x` 标签移至图表 0.17：

1. 查看`main`或最新的`v0.17.x`标签。2. 在运行`make apply`之前，编辑`infra/terraform.tfvars`：
   * 如果设置了`sandbox_host_image_tag`，请将其删除。 0.17 模块忽略它。
   * 清除`langsmith_helm_chart_version`中的`0.16.x`值，或设置`0.17.x`补丁，并运行`unset CHART_VERSION`（如果您的shell设置了它）。 `deploy.sh` 从 Terraform 输出读取引脚，因此 `terraform.tfvars` 中的更改仅在 `make apply` 之后生效。
   * 使用 SmithDB，选择大小。现在，未设置的`smithdb_sizing`紧随`sizing_profile`：`production`给出`medium`，`production-large`给出`large`，`minimum`给出`minimal`，它没有SmithDB节点池。对于 `medium` 和 `large`，Terraform 替换了缓存池，对于 `large` 还替换了计算池。 `large` 运行 12 个 SmithDB Pod，请求约 350 个 vCPU。要保持图表 0.16 池，请运行 `make smithdb-configure SIZING=small CACHE=local-ssd`。
   * 使用 SmithDB 和创建的元存储，未设置的 `smithdb_metastore_tier` 现在会跟随大小，并且调整大小会使 Cloud SQL 离线不到 60 秒。要保留当前等级，请设置`smithdb_metastore_tier = "db-custom-2-8192"`。
   * 使用 SmithDB，删除 `smithdb_metastore_use_ssl = true`。 Cloud SQL 身份验证代理现在是已创建元存储的默认设置，并且在设置两者时计划会失败。要在没有代理的情况下保持连接（模式 2，仅用于测试和登台），请设置 `smithdb_metastore_use_auth_proxy = false`。* 使用沙箱，`sizing_profile`设置为`production`或`production-large`，没有`sandbox_host_machine_type`，设置`sandbox_host_machine_type = "n2-standard-8"`。该 pin 会保留当前沙箱主机节点及其安装的卷，直到步骤 7 中的耗尽为止。

3. 使用SmithDB，删除已完成的回填作业。该图表将已完成的作业保留 7 天，升级会更改其 pod 模板。命令参见[Deploy refuses because the SmithDB backfill Job changed](/langsmith/self-host-terraform-gcp-troubleshooting#deploy-refuses-because-the-smithdb-backfill-job-changed)。

4. 使用 SmithDB，替换图表 0.17 拒绝的 0.16 覆盖。然后仅添加回未设置 `nodeSelector`、`tolerations`、`volumes`、`volumeMounts` 或 `resources` 的编辑：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   cp helm/values/langsmith-values-smithdb.yaml helm/values/langsmith-values-smithdb-0.16.yaml
   cp helm/values/examples/langsmith-values-smithdb.yaml helm/values/langsmith-values-smithdb.yaml
   ```

5. Run `make apply`.对于`ingress_type = "envoy"`（默认），它还将 Envoy Gateway 升级到 v1.9.2。规划维护窗口：控制平面必须运行 Kubernetes 1.33 到 1.36，Envoy 代理重新启动一次，并且打开时间超过 60 秒的连接会丢弃。启用 SmithDB 后，`make init-values` 会失败，直到 Terraform 状态包含 0.17 模块输出。

6. 运行 `make init-values` 重新生成没有图表 0.16 `sandboxes.juicefs.csi` 块的沙箱值。7. 运行`make deploy`。 With Sandboxes enabled, the deploy stops while sandbox volumes are still mounted through the JuiceFS CSI driver, and prints the `kubectl delete` commands for the sandbox-host workload and JuiceFS claims.运行它们，等到只剩下 `juicefs-csi-*` Pod，然后再次运行 `make deploy`。运行沙箱停止，但它们的数据保留在对象存储和 Redis 中，图 0.17 挂载相同的 JuiceFS 卷。

8. 如果您在步骤 2 中固定了 `sandbox_host_machine_type`，请移除该引脚并再次运行 `make apply`。 GKE 为新机器类型重新创建每个沙箱主机节点，并且正在运行的沙箱停止。

If you enabled Engine in your own values, chart 0.17 also requires `engine.usageSigningSecret` (at least 32 characters), or an `engine_usage_signing_secret` key in the Secret that `config.existingSecretName` names.

0.17 模块还停止授予 LangSmith 服务帐户项目范围的 Secret Manager 访问权限。如果您添加的工作负载将 Secret Manager 读取为该服务帐户，请设置 `grant_project_secret_accessor = true` 或授予对特定机密的访问权限。

有关更改的完整列表，请参阅 Terraform 存储库中的 [⟦T304⟧](https://github.com/langchain-ai/terraform/blob/main/MIGRATION-0.16-to-0.17.md) 和 [SmithDB upgrade steps](https://github.com/langchain-ai/terraform/blob/main/modules/gcp/SMITHDB.md#upgrade-from-chart-016)。

## 关键注意事项* `config.deployment.url` 必须包含 `https://`。如果没有它，操作员产生的代理就会陷入`DEPLOYING`。
* LangSmith 部署需要`config.deployment.enabled: true`。仅设置不带 `enabled: true` 的 URL 会导致图表静默跳过 `listener` 和 `operator`。
* 首次启用后加密密钥不得更改。旋转`langsmith_insights_encryption_key`或`langsmith_polly_encryption_key`会永久破坏现有的加密数据。
* Envoy 网关 IP 在拆卸时发生变化。删除网关后，GCP 会释放外部 IP。重新申请后，会发出新的IP，因此请更新您的DNS A记录。
* `langsmith-ksa` 注释不是永久的。 Terraform 在 Helm 版本之外的 `k8s-bootstrap` 模块中创建 `langsmith-ksa`，因此它无法在命名空间删除后幸存。 `deploy.sh` 幂等地重新创建并重新注释它。如果操作员 Pod 在集群重建后失去 GCS 访问权限，请重新运行 `make deploy`。

## 后续步骤

* 参考[GCP variables](/langsmith/self-host-terraform-gcp-variables)和[quick reference](/langsmith/self-host-terraform-gcp-quick-reference)。
* 查看 [GCP architecture](/langsmith/self-host-terraform-gcp-architecture) 的模块结构、流量和工作负载身份。
* 当出现故障时，请检查[GCP troubleshooting guide](/langsmith/self-host-terraform-gcp-troubleshooting)。
* 使用 [LangSmith Deployment](/langsmith/enable-self-hosted-deployment) 在 UI 中启用代理部署。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-gcp-deploy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。