<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy LangSmith on GCP with Terraform | https://docs.langchain.com/langsmith/self-host-terraform-gcp-deploy -->

# 使用 Terraform 在 GCP 上部署 LangSmith

使用 LangChain Terraform 模块在 GCP GKE 上配置自托管的 LangSmith 的端到端演练。

使用公众[Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/gcp)将 LangSmith 部署到 GCP。通过将部署管理为代码，您可以跨项目版本控制、检查和重现 LangSmith 环境，而无需通过 Google Cloud 控制台进行点击。

安装分两个阶段运行：

1. **基础设施**：Terraform 提供 VPC、GKE、Cloud SQL、Memorystore、GCS 和工作负载身份。
2. **应用程序**：LangSmith 图表，与部署脚本或 Terraform `app` 层一起安装。

基本安装后，通过设置标志和重新部署来启用可选附加组件。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {'flowchart': {'nodeSpacing': 25, 'rankSpacing': 30}}}%%
graph TB
    subgraph stage1["Set up infrastructure"]
        direction LR
        Start["setup-env.sh<br/>secrets to Secret Manager"]
        TF["terraform apply"]
        Infra["VPC · GKE · Cloud SQL<br/>Memorystore · GCS<br/>Workload Identity"]
        Bootstrap["Bootstrap workloads<br/>cert-manager · KEDA<br/>Envoy Gateway"]
        Start --> TF --> Infra -->|GKE ready| Bootstrap
    end
    subgraph stage2["Deploy the application"]
        direction LR
        Deploy["make init-values + deploy<br/>helm install langsmith"]
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

## 先决条件

### 所需工具|工具|版本 |目的|
| ------------------------ | | -------- | -------------------------------------------------------------------- |
|谷歌云 SDK (`gcloud`) | 450 | 450身份验证、查询 GCP 资源、管理 GKE 凭据 |
|地形 | 1.5 | 1.5运行基础设施模块 |
| `kubectl` | 1.28 | 1.28检查 GKE 集群 |
|头盔| 3.12 | 3.12安装和管理 LangSmith 图表 |

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

### 所需的 GCP API

Terraform 在首次应用时自动启用这些功能，但必须首先启用 `cloudresourcemanager.googleapis.com`，以便 Terraform 可以启用其余功能。手动启用所有内容以实现快速首次运行：

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

运行 Terraform 的主体需要在目标项目上具有以下角色。初始部署稳定后，修剪到最低权限。|角色 |目的|
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| `roles/container.admin` |创建和管理 GKE 集群 |
| `roles/compute.networkAdmin` |创建VPC、子网、防火墙规则 |
| `roles/iam.serviceAccountAdmin` |为 Workload Identity 创建服务帐户 |
| `roles/cloudsql.admin` |创建和管理 Cloud SQL 实例 |
| `roles/redis.admin` |创建和管理 Memorystore Redis |
| `roles/storage.admin` |创建 GCS 存储桶和生命周期策略 |
| `roles/resourcemanager.projectIamAdmin` |在配置期间授予 IAM 绑定 |
| `roles/servicenetworking.networksAdmin` |创建私有服务连接（Cloud SQL 和 Redis 所需）|

### 验证

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud auth login
gcloud config set project <your-project-id>
gcloud auth application-default login
```

您还需要 LangSmith 许可证密钥 ([contact sales](https://www.langchain.com/contact-sales)) 以及解析为 GCP 的域或子域。

## 快速入门<Tip>
  有关 `make` 目标、所需变量和常见约束的简明备忘单，请参阅 [GCP quick reference](/langsmith/self-host-terraform-gcp-quick-reference)。
</Tip>

要获得从零到正在运行的 LangSmith 实例的最快路径，请按顺序运行以下命令：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# 1. Clone the public modules
git clone https://github.com/langchain-ai/terraform.git
cd terraform/modules/gcp

# 2. Generate terraform.tfvars interactively (Enter accepts current values)
make quickstart

# 3. Load secrets into Secret Manager
#    Must be sourced, not executed
source infra/scripts/setup-env.sh

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
kubectl get gateway -n langsmith \
  -o jsonpath='{.items[0].status.addresses[0].value}'
```

以下部分详细介绍了每个阶段。

## 提供基础设施

Terraform 提供以下 GCP 资源：

|资源 |目的|
| ----------------------------------- | ------------------------------------------------------ |
| VPC+子网+云NAT |集群和托管服务的专用网络|
|私人服务连接| Cloud SQL 和 Memorystore 私有 IP 的 VPC 对等互连 |
| GKE 集群（标准或 Autopilot）| Kubernetes 计算、启用 Workload Identity |
|云 SQL PostgreSQL | LangSmith运营数据、HA备用、私有IP |
|内存存储Redis |队列和缓存、STANDARD\_HA 层、私有 IP |
| GCS铲斗|跟踪有效负载 blob 存储、生命周期规则 || Workload Identity 服务帐户 |无需静态密钥的每个 Pod GCP 访问 |
|证书管理器、KEDA、Envoy Gateway |与基础设施一起安装的 Bootstrap 工作负载 |

### 克隆并配置

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git clone https://github.com/langchain-ai/terraform.git
cd terraform/modules/gcp
```

所有后续命令都从`modules/gcp/`运行。运行 `make help` 以获得完整的目标列表。

使用交互式向导生成 `terraform.tfvars`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make quickstart
```

该向导会提示输入项目 ID、命名前缀、区域、GKE 大小、TLS 源、外部服务与集群内服务以及可选的附加标志。上面写着`infra/terraform.tfvars`。重新运行预选现有值；在每次提示时按 Enter 键以保留当前配置。

更喜欢手动编辑：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cp infra/terraform.tfvars.example infra/terraform.tfvars
vi infra/terraform.tfvars
```

所需的最少变量：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
project_id            = "<your-gcp-project-id>"
name_prefix           = "ls"
environment           = "prod"
langsmith_license_key = "<your-license-key>"
langsmith_domain      = "langsmith.example.com"

region = "us-west2"
zone   = "us-west2-a"

postgres_source   = "external"
postgres_password = "<strong-password>"   # or: export TF_VAR_postgres_password=...

redis_source = "external"

clickhouse_source = "in-cluster"

tls_certificate_source = "letsencrypt"
letsencrypt_email      = "ops@example.com"

enable_langsmith_deployment = true
```

请参阅 [GCP variables reference](/langsmith/self-host-terraform-gcp-variables) 了解每个输入变量。

<Tip>
  在应用之前配置远程状态后端。将`infra/backend.tf.example`复制到`infra/backend.tf`并将其指向您控制的GCS存储桶。本地状态很脆弱，在目录重组期间可能会丢失。
</Tip>

### 将机密加载到机密管理器中

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
source infra/scripts/setup-env.sh
```该脚本读取 `terraform.tfvars`，派生秘密前缀，并且对于每个秘密，可以重用导出的值，读取现有的秘密管理器秘密，自动生成一个秘密（对于盐和 Fernet 密钥），或者提示您。许可证密钥和管理员密码是您交互提供的两个值。必须获取脚本，因为 `make` 无法将环境变量导出回父 shell。

验证秘密是否存在：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make secrets
```

### 飞行前检查

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make preflight
```

`make preflight` 验证活动的 `gcloud` 凭证是否可以执行每个所需的操作、所需的 GCP API 是否已启用以及目标区域是否具有模块请求的 SKU。在这里发现差距比`terraform apply`中期发现差距更快。

### 申请

<Note>
  在干净的项目上配置 GCP 云基础需要 25 到 35 分钟。不要中断应用。
</Note>

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init
make plan
make apply
```

`make plan` 显示了建议的差异。在应用之前检查输出。 `make apply` 按依赖顺序进行配置：VPC 和网络，然后是 GKE（大约 10 到 15 分钟）、私有服务连接、Cloud SQL（使用 HA 大约 10 分钟）、Memorystore、GCS 和引导工作负载。

等效直接 Terraform 流：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd modules/gcp/infra

terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

### 配置 kubectl

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make kubeconfig
kubectl get nodes
```所有节点都应报告`Ready`。

### 验证引导组件

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n cert-manager
kubectl get pods -n keda
kubectl get secrets -n langsmith
```

cert-manager、KEDA 和 LangSmith 命名空间机密都应该就位。

## 部署 LangSmith

使用三个受支持的部署路径之一：

|路径|命令 |何时使用 |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [Script-driven Helm deploy *(recommended)*](#script-driven-helm-deploy-recommended) | `make init-values && make deploy` |交互式输出、kubeconfig 刷新、预检检查。最适合首次部署和第二天重新部署。 |
| [Terraform-managed Helm release](#terraform-managed-helm-release) | `make init-app && make apply-app` | Helm 版本在 Terraform 状态下与基础设施一起管理。最适合 GitOps 和 CI/CD 管道。      || [Manual Helm install](#manual-helm-install) | `helm upgrade --install langsmith langchain/langsmith ...` |直接使用`helm`，无需包装脚本。最适合拥有现有 Helm 工具的团队。                 |

### 脚本驱动的 Helm 部署（推荐）

两个命令安装 LangSmith 图表，并使用从 Terraform 输出连接的合理默认值：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd modules/gcp

make init-values
make deploy
```

`init-values.sh` 提示输入管理员电子邮件，然后从 `terraform.tfvars` 读取 `sizing_profile` 和 `enable_*` 标志，并将匹配值文件从 `helm/values/examples/` 复制到 `helm/values/`。它还会使用您的主机名、工作负载身份注释和 GCS 存储桶名称生成 `values-overrides.yaml`。

`make deploy` 运行 `helm/scripts/deploy.sh`，它刷新 kubeconfig、运行预检检查、应用分层值文件并运行 `helm upgrade --install`。

图表安装和 Pod 准备就绪预计需要 8 到 12 分钟。

如果您完成了脚本驱动的部署，请跳至[Verify and configure DNS](#verify-and-configure-dns)。以下两个路径是脚本驱动部署的替代路径。

### Terraform 管理的 Helm 版本

将整个部署保留在 Terraform 下。 `app` 层包装与部署脚本相同的图表和分层值文件，作为 `helm_release` 资源进行管理。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd modules/gcp

make init-values  # generate the layered values files
make init-app     # pull infra outputs into app/infra.auto.tfvars.json
make apply-app    # terraform apply the Helm release
```在`app/terraform.tfvars`中设置应用层输入（`admin_email`是必需的；`hostname`、`chart_version`、`sizing`和`enable_*`标志是可选的）。 `app`层使用自己的变量名称：`sizing`（不是`sizing_profile`）和`enable_agent_deploys`（不是`enable_deployments`）。 `make init-app` 将基础设施派生的输​​入（集群、存储桶、工作负载身份注释）填充到`app/infra.auto.tfvars.json`。

该版本与`wait = false`一起应用，因为操作员生成的代理在冷集群上可能需要 10 分钟以上；传递的 `terraform apply` 意味着版本已被接受，而不是每个 Pod 都已准备就绪。

如果您完成了 Terraform 管理的 Helm 版本，请跳至 [Verify and configure DNS](#verify-and-configure-dns)。以下路径是替代路径。

### 手动 Helm 安装

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

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm repo add langchain https://langchain-ai.github.io/helm
helm repo update

helm upgrade --install langsmith langchain/langsmith \
  --namespace langsmith \
  --create-namespace \
  --version ~0.15.1 \
  -f ../helm/values/values.yaml \
  -f ../helm/values/values-overrides.yaml \
  --set config.langsmithLicenseKey="<your-license-key>" \
  --set config.apiKeySalt="$API_KEY_SALT" \
  --set config.basicAuth.jwtSecret="$JWT_SECRET" \
  --set config.hostname="<your-langsmith-domain>" \
  --set config.basicAuth.initialOrgAdminEmail="$ADMIN_EMAIL" \
  --set config.basicAuth.initialOrgAdminPassword="$ADMIN_PASSWORD" \
  --set config.agentBuilder.encryptionKey="$AGENT_BUILDER_ENCRYPTION_KEY" \
  --set config.insights.encryptionKey="$INSIGHTS_ENCRYPTION_KEY" \
  --set config.blobStorage.bucketName="$(terraform output -raw storage_bucket_name)" \
  --set gateway.enabled=true \
  --set ingress.enabled=false \
  --wait --timeout 15m
```

<Note>
  要使用 S3 兼容的 Blob 存储而不是 Workload Identity，请添加 `--set config.blobStorage.engine=S3` 并使用 `--set config.blobStorage.accessKey=<key>` 和 `--set config.blobStorage.accessKeySecret=<secret>` 传递 HMAC 密钥。在“云存储”→“设置”→“互操作性”下创建 HMAC 密钥。
</Note>### 验证并配置 DNS

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith

EXTERNAL_IP=$(kubectl get svc -n envoy-gateway-system \
  -l gateway.envoyproxy.io/owning-gateway-name=langsmith-gateway \
  -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}')

echo "Create A record: $EXTERNAL_IP -> <your-langsmith-domain>"

kubectl get certificate -n langsmith
```

在 DNS A 记录解析为网关 IP 之前，cert-manager 无法颁发 Let's Encrypt 证书。在您的 DNS 提供商处创建记录，等待传播，然后重新检查证书状态。

### 尺寸配置文件

在`terraform.tfvars`中设置`sizing_profile`，然后重新运行`make init-values && make deploy`。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sizing_profile = "production"   # default | minimum | dev | production | production-large
```

|简介 |何时使用 |
| ------------------ | -------------------------------------------------------------------------------- |
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
langsmith-backend-migrations       0/1  Completed  0
langsmith-clickhouse-0             1/1  Running    0
langsmith-frontend-xxx             1/1  Running    0
langsmith-ingest-queue-xxx         1/1  Running    0
langsmith-platform-backend-xxx     1/1  Running    0
langsmith-playground-xxx           1/1  Running    0
langsmith-queue-xxx                1/1  Running    0
```

## 启用附加组件

每个附加组件都由 `infra/terraform.tfvars` 中的标志控制。设置标志，重新应用 Terraform，然后重新运行 `make init-values && make deploy`。

### LangSmith 部署添加 `host-backend`、`listener` 和 `operator`。在启用 Agent Builder 或 Insights 之前需要。 KEDA 在`enable_langsmith_deployment = true` 时自动安装。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_deployments = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd modules/gcp

make apply        # push the enable_deployments flag
make init-values  # pick up the change
make deploy       # roll out host-backend + listener + operator
```

验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep -E "host-backend|listener|operator"
kubectl get lgp -n langsmith
kubectl get crd | grep langchain
kubectl get pods -n keda
```

<Warning>
  `config.deployment.url` 必须包含 `https://`。如果没有协议，操作员生成的代理将无限期地陷入`DEPLOYING`。
</Warning>

### 舰队

<Note>
  Fleet 是以前称为 Agent Builder 的功能的当前形式，作为独立服务部署（图表 v0.15+）。
</Note>

您可以通过`enable_fleet`启用舰队。与已弃用的 `enable_agent_builder` 路径不同，它不需要 LangSmith 部署。 Terraform 在 Cloud SQL 上配置专用的 `fleet` 数据库，并将 `langsmith-fleet-postgres` 和 `langsmith-fleet-redis` 密钥连接到现有的 Cloud SQL 和 Memorystore 实例。队列重用`langsmith_agent_builder_encryption_key`，因此从`enable_agent_builder` 迁移会保留相同的密钥和数据。

<Note>
  Fleet 需要 LangSmith Helm 图表 `>=0.15.0` 以及许可证中的 Agent Builder 或 Fleet 权利。
</Note>

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_fleet = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd modules/gcp

make apply        # provision the fleet Cloud SQL database + secrets
make init-values  # copy langsmith-values-fleet.yaml
make deploy       # roll out the standalone-fleet-* services
```

验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep standalone-fleet
```

<Warning>
  请勿同时启用 `enable_fleet` 和 `enable_agent_builder`。舰队值文件设置 `config.agentBuilder.enabled: false`，因此这两个附加组件是互斥的。
</Warning>

### 代理生成器（已弃用）<Note>
  在 GCP 上，`enable_agent_builder` 已弃用，取而代之的是 [Fleet](#fleet)（`enable_fleet`，图表 v0.15+）。使用 Fleet 进行新部署。本节记录了现有安装的旧路径。
</Note>

先决条件：LangSmith 部署正常。添加 `agent-builder-tool-server`、`agent-builder-trigger-server` 和用于注册 Polly 代理 URL 的 `agentBootstrap` 作业。

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
kubectl get pods -n langsmith | grep -E "tool-server|trigger-server|bootstrap"
```

在 `agentBootstrap` 完成后滚动前端，以便它拾取 `langsmith-polly-config` ConfigMap：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl rollout restart deployment langsmith-frontend -n langsmith
```

<Warning>
  跳过前端重启会使 Polly 显示“无法连接到 LangGraph 服务器”。
</Warning>

### 见解和波莉

先决条件：Agent Builder 健康。 Insights 支持 ClickHouse 支持的跟踪分析。 Polly 是人工智能评估和监控代理。同时启用两者。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# infra/terraform.tfvars
enable_insights = true
enable_polly    = true
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init-values
make deploy
```

验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith | grep -E "clio|polly"
kubectl get pods -n langsmith -w
```

<Warning>
  首次启用后，`insights_encryption_key` 和 `polly_encryption_key` 不得更改。旋转将永久破坏现有的加密数据。
</Warning>

### 附加组件预期的 pod

**LangSmith 部署添加：** `langsmith-host-backend`、`langsmith-listener`、`langsmith-operator`。

**机队新增：** `standalone-fleet-api-server`、`standalone-fleet-tool-server`、`standalone-fleet-trigger-server`、`standalone-fleet-queue`。

**Agent Builder 添加：** `langsmith-agent-builder-tool-server`、`langsmith-agent-builder-trigger-server`、`langsmith-agent-builder-bootstrap`（已完成）、`agent-builder-<hash>`（操作员生成）。

**Insights 和 Polly 添加：** `clio-<hash>`（Insights 分析）、`smith-polly-<hash>`（Polly 代理）、`lg-<hash>-0`（LangGraph StatefulSet）。## 关键注意事项

* `config.deployment.url` 必须包含 `https://`。如果没有它，操作员产生的代理就会陷入`DEPLOYING`。
* LangSmith 部署需要`config.deployment.enabled: true`。仅设置不带 `enabled: true` 的 URL 会导致图表静默跳过 `listener` 和 `operator`。
* 首次启用后加密密钥不得更改。旋转`insights_encryption_key`或`polly_encryption_key`会永久破坏现有的加密数据。
* 首次启用 Polly 后滚动前端。 `agentBootstrap` 注册后创建`langsmith-polly-config` ConfigMap。在引导程序完成之前启动的前端 Pod 不会自动拾取它。
* Envoy 网关 IP 在拆卸时发生变化。删除网关后，GCP 会释放外部 IP。重新申请后，会发出新的IP，因此请更新您的DNS A记录。
* `langsmith-ksa` 注释不是永久的。操作符在运行时创建`langsmith-ksa`；它无法在名称空间删除后幸存。 `deploy.sh` 幂等地重新注释它。如果操作员 Pod 在集群重建后失去 GCS 访问权限，请重新运行 `make deploy`。

## 后续步骤

* 参考[GCP variables](/langsmith/self-host-terraform-gcp-variables)和[quick reference](/langsmith/self-host-terraform-gcp-quick-reference)。
* 查看 [GCP architecture](/langsmith/self-host-terraform-gcp-architecture) 的模块结构、流量和工作负载身份。
* 当出现故障时，请检查[GCP troubleshooting guide](/langsmith/self-host-terraform-gcp-troubleshooting)。
* 使用 [LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform) 在 UI 中启用代理部署。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-gcp-deploy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>