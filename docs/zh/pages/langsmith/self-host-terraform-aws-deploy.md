<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy LangSmith on AWS with Terraform | https://docs.langchain.com/langsmith/self-host-terraform-aws-deploy -->

# 使用 Terraform 在 AWS 上部署 LangSmith

使用 LangChain Terraform 模块在 AWS EKS 上配置自托管的 LangSmith 的端到端演练。

使用公共 [Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/aws) 将 LangSmith 部署到 AWS。通过将部署管理为代码，您可以跨账户版本控制、检查和重现 LangSmith 环境，而无需单击 AWS 控制台。

安装分两个阶段运行：

1. **基础设施**：Terraform 配置 VPC、EKS、RDS、ElastiCache、S3、ALB 和 IAM，然后引导集群附加组件。
2. **应用程序**：Helm 针对集群安装 LangSmith 图表。

基本安装后，通过设置标志和重新部署来启用可选附加组件。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {'flowchart': {'nodeSpacing': 25, 'rankSpacing': 30}}}%%
graph TB
    subgraph stage1["Set up infrastructure"]
        direction LR
        Start["source setup-env.sh<br/>secrets to SSM"]
        TF["make apply"]
        Infra["VPC · EKS · RDS<br/>ElastiCache · S3 · ALB<br/>IAM"]
        Bootstrap["k8s-bootstrap<br/>ESO · KEDA<br/>Envoy Gateway"]
        Start --> TF --> Infra -->|EKS ready| Bootstrap
    end
    subgraph stage2["Deploy the application"]
        direction LR
        Deploy["make init-values<br/>+ make deploy"]
        Helm["helm upgrade --install<br/>ESO syncs secrets"]
        Running["LangSmith running<br/>all pods healthy"]
        Deploy --> Helm --> Running
    end
    stage1 --> stage2

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class Start trigger
    class TF,Bootstrap,Deploy,Helm process
    class Infra neutral
    class Running output

    style stage1 fill:none,stroke:#40668D,stroke-width:1px
    style stage2 fill:none,stroke:#40668D,stroke-width:1px
```

## 先决条件

### 所需工具

|工具|版本 |目的|
| - | - | - |
| AWS CLI | v2 |身份验证、查询 AWS 资源、管理 EKS kubeconfig |
|地形 | 1.11 或更高版本 |运行基础设施模块 |
| `kubectl` | 1.34 或更高版本 |检查EKS集群 |
|头盔| 3.12 或更高版本 |安装和管理LangSmith图表|
| `eksctl` |最新 |可选，方便 kubeconfig 和调试 |

在 macOS 上安装：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
brew install awscli kubectl helm eksctl
brew tap hashicorp/tap && brew install hashicorp/tap/terraform
```

验证每个工具是否位于 `PATH`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws --version
terraform version
kubectl version --client
helm version
```对于 Linux，请遵循 [AWS CLI install guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) 并使用您的发行版的包管理器来获取其余工具。

### 所需的 AWS IAM 权限

运行 Terraform 的 IAM 用户或角色需要 `AdministratorAccess`，或 `PowerUserAccess` 加 `IAMFullAccess`。该模块为 IRSA 创建 IAM 角色和策略，因此仅`PowerUserAccess` 是不够的。对于范围缩小的策略，请参阅模块中的[⟦T32⟧](https://github.com/langchain-ai/terraform/blob/main/modules/aws/PERMISSIONS.md)。

<Tip>
  在您验证并创建 `infra/terraform.tfvars` 后，从 `modules/aws/` 运行 `make preflight`（请参阅 [Clone and configure](#clone-and-configure)）。只读检查确认 CLI 工具、`tfvars` 文件、活动凭证和区域，然后探测对模块使用的每个 AWS 服务的读取访问权限。要测试凭据是否可以创建资源，请运行 `make preflight ARGS="--create-test-resources"`。
</Tip>

### 验证

使用 CLI 配置 AWS 凭证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws configure
```

或者导出环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="us-west-2"
```

确认凭据有效并且目标区域已在帐户中启用：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
aws sts get-caller-identity
aws ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --output table
```

### 许可证密钥和域名* **LangSmith 许可证密钥。** [Contact the LangChain sales team](https://www.langchain.com/contact-sales) 请求一个。设置脚本将密钥存储在 AWS SSM Parameter Store 中，而不是存储在 `tfvars` 中。
* **域（可选）。** 设置 `langsmith_domain` 以在您自己的主机名上提供 LangSmith。如果有域但没有 `acm_certificate_arn`，Terraform 将创建 Route 53 托管区域、请求 ACM 证书并创建 ALB 别名记录。要使用现有托管区域，请设置 `dns_create_zone = false` 和 `dns_existing_zone_id`。如需携带自己的证书，请设置`acm_certificate_arn`。将 `langsmith_domain` 留空以到达 ALB 主机名上的 LangSmith。如果没有域，请设置 `tls_certificate_source = "none"` 来提供纯 HTTP。 `acm_certificate_arn` 也可以在没有域的情况下工作，但 `make preflight-post` 的 TLS 检查失败，因为 `acm` 需要 `langsmith_domain`。

### 集群大小参考

两个独立的设置控制能力：

* **基础设施容量**直接通过基础设施变量`eks_managed_node_groups`、`postgres_instance_type`、`redis_instance_type` 设置实例类型和节点数量。模块默认为 1 个 `m5.4xlarge` 节点组（最少 3 个，最多 10 个）、`db.t3.large`（适用于 RDS）和 `cache.m6g.xlarge`（适用于 ElastiCache）。 `infra/terraform.tfvars.dev`、`terraform.tfvars.minimum` 和 `terraform.tfvars.production` 模板设置更小或更大的值。
* **`sizing_profile`** 选择 Helm 大小调整覆盖（pod 资源请求和限制）。 `init-values.sh`和`deploy.sh`阅读； Terraform 没有。在部署之前，根据目标层调整基础架构的大小。有关每层建议，请参阅[Scaling guidance](/langsmith/self-host-scale)。

<Note>
  对于生产工作负载，还计划配置外部 [LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse) 或自我管理的外部 ClickHouse 集群。仅 dev/POC 支持集群内 ClickHouse。
</Note>

## 快速入门

<Tip>
  有关 `make` 目标、所需变量和常见约束的简明备忘单，请参阅 [AWS quick reference](/langsmith/self-host-terraform-aws-quick-reference)。
</Tip>

要获得从零到正在运行的 LangSmith 实例的最快路径，请按顺序运行以下命令：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# 1. Clone the public modules
git clone https://github.com/langchain-ai/terraform.git
cd terraform/modules/aws

# 2. Generate terraform.tfvars interactively (Enter accepts current values)
make quickstart

# 3. Load secrets into SSM Parameter Store
#    Must be sourced, not executed
source infra/scripts/setup-env.sh

# 4. Provision infrastructure
make init
make plan
make apply

# 5. Configure kubectl
source infra/scripts/set-kubeconfig.sh
kubectl get nodes

# 6. Deploy LangSmith with Helm
make init-values
make deploy

# 7. Confirm
kubectl get pods -n langsmith
kubectl get httproute -n langsmith
```

完成后，`make deploy` 会打印 LangSmith URL。

要在一个命令中链接基础设施和应用程序，请首先在同一个 shell 中运行 `make quickstart` 和 `source infra/scripts/setup-env.sh`，然后：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make quickdeploy          # interactive, prompts before terraform apply
make quickdeploy-auto     # non-interactive, auto-approves terraform
```

`make quickdeploy` 首先检查`setup-env.sh` 导出是否已加载并且`infra/terraform.tfvars` 存在，如果其中一个缺失，则停止并运行命令。如果 `infra/.terraform/` 不存在，则运行 `terraform init`，然后运行 ​​`terraform apply`，源 `set-kubeconfig.sh`，并运行 `init-values` 和 `deploy.sh`。如果 `terraform apply` 失败，请修复问题并重新运行 `make quickdeploy`。如果后面的步骤失败，该命令将打印 `make` 目标以重试。

以下部分详细介绍了每个阶段。

## 提供基础设施

Terraform 提供以下 AWS 资源：|资源 |目的|
| - | - |
| VPC + 子网 + NAT |集群和托管服务的专用网络|
| EKS 集群 + 节点组 | Kubernetes 计算 |
| RDS PostgreSQL | LangSmith运行数据|
| ElastiCache Redis |队列和缓存|
| S3存储桶+VPC端点|跟踪有效负载 blob 存储 |
| ALB + 听众 |入口点；使用 `acm` 终止 TLS |
| IRSA 角色 + IAM 策略 |每服务 AWS 访问 |
| KEDA、外部秘密运营商、Envoy Gateway |引导工作负载与基础设施一起安装。 Envoy 网关是默认入口。 cert-manager 仅为 Let's Encrypt 添加。 |

应用程序机密位于 SSM 参数存储中。 `setup-env.sh` 写入它们，而不是 Terraform，并且外部 Secrets Operator 将它们同步到集群中。

### 克隆并配置

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git clone https://github.com/langchain-ai/terraform.git
cd terraform/modules/aws
```

`main` 分支和 `v0.17.*` 发布标签部署 LangSmith Helm 图表 v17，如本指南所述。

<Note>
  要留在图表 v16 上，请运行 `git checkout release/0.16` 或查看 `v0.16.*` 标签。本指南中的标注标记了图表 v16 的不同之处。
</Note>

所有后续命令都从`modules/aws/`运行。运行 `make help` 以获得完整的目标列表。

使用交互式向导生成 `terraform.tfvars`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make quickstart
```该向导将逐步介绍 13 个部分，包括命名、区域、网络、EKS 大小、数据源、TLS 和 DNS、入口以及可选的附加标志。上面写着`infra/terraform.tfvars`。当文件已存在时，向导会建议使用预先选择的现有值进行更新、重新启动或取消，并首先备份原始文件。有些设置，例如自带的安全组变量（`*_existing_security_group_id`），不在向导中；手动将它们放入`terraform.tfvars`。当向导更新现有文件时，它会删除此类手写设置，因此请从 `infra/terraform.tfvars.backup` 恢复它们。

喜欢手动编辑？复制示例并填写必填字段：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cp infra/terraform.tfvars.example infra/terraform.tfvars
vi infra/terraform.tfvars
```

所需的最少变量：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
name_prefix = "acme"
environment = "prod"
region      = "us-west-2"

eks_cluster_version = "1.34"
eks_managed_node_groups = {
  default = {
    name           = "node-group-default"
    instance_types = ["m5.4xlarge"]
    min_size       = 3
    max_size       = 10
  }
}

postgres_source = "external"
redis_source    = "external"

tls_certificate_source = "acm"
langsmith_domain       = "langsmith.example.com"
# dns_create_zone      = false                    # write records into a zone that already resolves
# dns_existing_zone_id = "<hosted-zone-id>"
# acm_certificate_arn  = "arn:aws:acm:us-west-2:<account-id>:certificate/<cert-id>"  # optional with a domain
```

<Note>
  如果有域但没有 `acm_certificate_arn`，Terraform 会请求 ACM 证书，并且 `make apply` 会等待，直到 DNS 验证成功。使用 `dns_create_zone = true`（默认值），Terraform 会为 `langsmith_domain` 创建一个新的托管区域，并且只有在您从父域委派该区域的 NS 记录后验证才会成功。要在已解析的区域中进行验证，请设置 `dns_create_zone = false` 和 `dns_existing_zone_id`。要在委派到位之前进行部署，请遵循[Auto-provisioned DNS](/langsmith/self-host-terraform-aws-architecture#auto-provisioned-dns)中的分阶段部署模式。
</Note>

请参阅 [AWS variables reference](/langsmith/self-host-terraform-aws-variables) 了解每个输入变量。<Tip>
  在应用之前配置远程状态后端。将 `infra/backend.tf.example` 复制到 `infra/backend.tf` 并设置 S3 存储桶、密钥、区域和 DynamoDB 锁表。如果没有它，Terraform 会在本地保存状态。
</Tip>

### 将机密加载到 SSM 参数存储中

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
source infra/scripts/setup-env.sh
```

该脚本读取 `terraform.tfvars`，派生 SSM 路径 `/langsmith/{name_prefix}-{environment}/`，然后对于每个机密，要么重复使用导出的值，要么读取现有的 SSM 参数，自动生成一个，或者提示您。您以交互方式提供三个值：许可证密钥、管理员密码和管理员电子邮件。必须获取脚本（而不是执行），因为 `make` 无法将环境变量导出回父 shell。

该脚本管理以下 SSM 参数：| SSM 密钥 |如何设置 |笔记|
| - | - | - |
| `postgres-password` |自动生成（`openssl rand -hex 32`）| RDS主密码|
| `redis-auth-token` |自动生成（十六进制）| ElastiCache 身份验证令牌 |
| `sandbox-juicefs-redis-auth-token` |自动生成（十六进制）|仅当`enable_sandboxes = true` |
| `langsmith-api-key-salt` |自动生成（`openssl rand -base64 32`）|永不旋转，会破坏所有 API 密钥 |
| `langsmith-jwt-secret` |自动生成（`openssl rand -base64 32`）|永不轮换，使所有会话无效 |
| `sandbox-callback-signing-jwk` |自动生成的 Ed25519 密钥 |仅当`enable_sandboxes = true` |
| `langsmith-license-key` |提示|来自 [the LangChain sales team](https://www.langchain.com/contact-sales) |
| `langsmith-admin-password` |提示|至少 12 个字符，包含小写字母、大写字母和符号 |
| `langsmith-admin-email` |提示|初始组织管理员 |
| `deployments-encryption-key` |自动生成 Fernet 密钥 | LangSmith 部署插件 |
| `agent-builder-encryption-key` |自动生成 Fernet 密钥 |由舰队使用；该名称早于重命名 |
| `insights-encryption-key` |自动生成 Fernet 密钥 |见解附加组件 |
| `polly-encryption-key` |自动生成 Fernet 密钥 | LangSmith 聊天（以前称为 Polly）附加组件 |

如果您稍后打开 `enable_sandboxes`，请在 `make apply` 之前再次获取 `setup-env.sh`，以便创建沙箱机密。

验证机密是否存在并且`TF_VAR_*`环境变量已导出：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make secrets
```

### 申请

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init
make plan
make apply
````make plan` 显示了建议的差异。在应用之前检查输出。 `make apply` 在所有模块上运行单个`terraform apply`； Terraform 按依赖关系对资源进行排序。通过`ARGS="-auto-approve"`跳过确认提示。

### 配置 kubectl

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
source infra/scripts/set-kubeconfig.sh
kubectl get nodes
kubectl get pods -A
```

`set-kubeconfig.sh` 写入专用的 `~/.kube/langsmith-<cluster>` 文件并导出 `KUBECONFIG`，因此它使 `~/.kube/config` 保持不变。 `make kubeconfig` 只打印该命令。

所有节点都应报告`Ready`。核心附加组件应该是`Running`：CoreDNS、kube-proxy 和`kube-system` 中的 VPC CNI、`keda` 中的 KEDA、`external-secrets` 中的外部 Secrets Operator 以及`envoy-gateway-system` 中的 Envoy Gateway。 cert-manager 仅在 `tls_certificate_source = "letsencrypt"` 或 `create_cert_manager_irsa = true` 时运行。

## 部署LangSmith

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make init-values
make deploy
```

`make init-values` 从 `terraform.tfvars` 读取 `sizing_profile` 和 `enable_*` 标志，从 Terraform 输出写入 `helm/values/langsmith-values-overrides.yaml`，并将匹配值文件从 `helm/values/examples/` 复制到 `helm/values/`。它重用现有覆盖文件中的管理员电子邮件，或从`LANGSMITH_ADMIN_EMAIL`（由`setup-env.sh`设置）中获取，或提示输入。重新运行时，它会刷新 Terraform 输出，并仅在附加值文件丢失时才复制该文件，因此您对现有文件的编辑会保留下来。

`make deploy` 运行 `helm/scripts/deploy.sh`，其中：1.解决图表版本，确认在v17线上。
2. 使用 `aws eks update-kubeconfig` 刷新 kubeconfig。
3. 运行预检检查（AWS 凭证、集群可达性、`langchain` Helm 存储库）。
4. 应用外部 Secrets Operator `ClusterSecretStore` 和 `ExternalSecret`，以便集群直接从 SSM 读取机密。
5. 使用分层值文件运行 `helm upgrade --install` 并等待核心 pod。
6. 当未设置`langsmith_domain`且负载均衡器主机名发生更改时再次升级，然后打印LangSmith URL。

### 固定图表版本

`deploy.sh` 默认安装 LangSmith Helm Chart v17 系列 (`~0.17.0`) 上的最新补丁。要固定精确的补丁，请在 `terraform.tfvars` 中设置 `langsmith_helm_chart_version = "0.17.x"`，或运行 `CHART_VERSION=0.17.x make deploy`。环境变量胜过`tfvars`设置。 `deploy.sh` 拒绝 v17 行之外的版本，Terraform 验证在计划时拒绝该行之外的 `langsmith_helm_chart_version`。 `deploy.sh` 还拒绝仍使用图表 v15 键的值文件（`config.insights`、`config.polly`、`backend.agentBootstrap`）。

<Note>
  在 Chart v16 上，使用 `v0.16.*` 模块版本或 `release/0.16` 分支。这些版本固定 `~0.16.0` 并仅接受 `0.16.x` 版本。要将现有图表 v16 部署移至 v17，请按照 [Upgrade from chart v16 to v17](#upgrade-from-chart-v16-to-v17) 操作。
</Note>

### 验证

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n langsmith
kubectl get httproute -n langsmith
```当所有 pod 都是`Running` 时，打开`make deploy` 打印的 URL。设置时它使用 `langsmith_domain` 或 ALB 主机名。随时运行`make status`以获取每一层的摘要以及下一步要运行的信息。

### 从图表 v16 升级到 v17

<Warning>
  不支持从图表 v17 降级到 v16。升级前备份数据库。
</Warning>

使用 `enable_sandboxes = false` 和 `enable_smithdb = false` 的部署仅移动图表图钉。沙箱和 SmithDB 需要以下额外步骤。该模块没有设置引擎值，因此如果您在自己的值覆盖中启用了引擎，也可以应用[Upgrade from v16 to v17](/langsmith/self-host-upgrades#upgrade-from-v16-to-v17)中的引擎更改。1. 查看`v0.17.*`标签，或拉动`main`。
2. 如果 `terraform.tfvars` 将 `langsmith_helm_chart_version` 固定到 `0.16.x` 补丁，请清除它或设置 `0.17.x` 补丁，并运行 `unset CHART_VERSION`（如果您的 shell 设置了它）。 Terraform 验证在计划时拒绝 `0.16.x` 引脚，并且 `deploy.sh` 拒绝 `CHART_VERSION` 中的 `0.16.x` 值。
3. 运行`make apply`。从模块版本 `v0.16.83` 或更高版本开始，v17 模块不会更改任何 AWS 资源，因此 Terraform 不会报告基础设施更改。从早期的 `v0.16.*` 版本开始，请在申请之前查看 `make plan`。
4. 运行`make init-values`。它重写了 Chart v17 沙盒架构中的`langsmith-values-overrides.yaml`。
5. 使用 `enable_smithdb = true`，更新值文件中 `make init-values` 不会覆盖的 SmithDB 键。 Chart v17 无法渲染旧密钥：

   * 在`helm/values/langsmith-values-smithdb.yaml`中，将`smithdb.migration.deployment`重命名为`smithdb.migration.job`。
   * 在`helm/values/langsmith-values-sizing-*.yaml`中，将`smithdb.query.autoscaling.*`、`smithdb.ingestion.autoscaling.*`、`smithdb.compactionWorker.autoscaling.*`移至`autoscaling.hpa.*`下。在`langsmith-values-sizing-production-large.yaml`中，将`local-ssd-storage`卷重命名为`cache`。

   如果您尚未自定义这些文件，请删除它们并重新运行 `make init-values` 以复制 v17 版本。对于这些键后面的图表变化，请参阅[Cache storage](/langsmith/self-host-smithdb-infrastructure#cache-storage)。只有 `production-large` 大小调整文件定义 `cache` 卷。使用 `dev`、`minimum` 或 `production` 配置文件，chart v17 为每个 SmithDB 缓存提供来自 `smithdb.cache.storageClassName` 的每个 Pod PVC，或者在未设置时来自集群默认 StorageClass。在 Chart v16 上，每个缓存都是一个 `emptyDir`。要选择缓存所在的位置，请设置 `smithdb.cache.storageClassName`，或为每个使用磁盘的 SmithDB 组件定义一个名为 `cache` 的卷。
6. 运行`make deploy`。当沙箱在 Chart v16 上运行时，第一次运行会以 `namespace langsmith still mounts sandbox volumes through the chart 0.16 JuiceFS CSI driver` 停止，并打印耗尽旧卷的命令。运行它们，等到只剩下 `juicefs-csi-*` Pod，然后再次运行 `make deploy`。正在运行的沙箱在排水期间停止。他们的数据保留在 S3 和 Redis 中，chart v17 挂载相同的 JuiceFS 卷。
7. 验证沙箱割接：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   kubectl get jobs -n langsmith -l app.kubernetes.io/component=juicefs-format
   kubectl rollout status deployment -n langsmith -l app=sandbox-host --timeout=10m
   kubectl get daemonset,statefulset -n langsmith | grep juicefs-csi   # expect no output
   ```

对于 v17 中的每个图表更改，请参阅 Terraform 存储库中的 [Upgrade from v16 to v17](/langsmith/self-host-upgrades#upgrade-from-v16-to-v17) 和 [⟦T224⟧](https://github.com/langchain-ai/terraform/blob/main/MIGRATION-0.16-to-0.17.md) 指南。

## 启用附加组件每个附加组件都由 `infra/terraform.tfvars` 中的标志控制。设置标志，运行`make apply`，重新运行`make init-values`以复制匹配值文件，然后重新运行`make deploy`。 Terraform 提供的附加组件需要`make apply`：具有外部存储的舰队（默认）、LangSmith 具有外部存储、沙箱和 SmithDB 的聊天或见解。沙箱和 SmithDB 创建 AWS 资源。外部存储在现有 RDS 实例和匹配的 Kubernetes 密钥上创建数据库。对于其余部分，`make apply` 不做任何更改。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
enable_deployments     = true            # LangSmith Deployment (listener, operator, host-backend)
enable_fleet           = true            # Fleet (formerly Agent Builder)
fleet_storage          = "external"      # default; "in-cluster" uses chart StatefulSets
enable_polly           = true            # LangSmith Chat (formerly Polly)
polly_storage          = "in-cluster"    # default; "external" uses RDS and ElastiCache
enable_insights        = true            # AI-powered trace analysis
insights_storage       = "in-cluster"    # default; "external" uses RDS and ElastiCache
enable_sandboxes       = false           # LangSmith Sandboxes
enable_smithdb         = false           # SmithDB
enable_usage_telemetry = false           # Extended usage telemetry
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make apply
make init-values
make deploy
```

`enable_agent_builder` 在图表 v16 中被删除。将其设置为 `true` 无法在 `terraform plan` 进行验证，因此从现有 `tfvars` 文件中删除它并使用 `enable_fleet`。 `enable_standalone_polly` 和 `enable_standalone_insights` 保留为传统速记形式，支持使用外部存储进行附加（`enable_polly = true` 与 `polly_storage = "external"`，对于 Insights 也是如此）。

Agent部署详情请参见[LangSmith Deployment](/langsmith/enable-self-hosted-deployment)。

### 舰队

<Note>
  Fleet 是以前称为 Agent Builder 的功能的当前形式。它需要 LangSmith Helm Chart v15 或更高版本以及许可证中的 Fleet 权利。
</Note>

使用 `enable_fleet = true` 启用舰队。 Fleet 安装所需的主机后端，因此 `enable_deployments` 是可选的。对于`fleet_storage = "external"`（默认），Fleet 需要外部 Postgres 和 Redis（`postgres_source = "external"` 和 `redis_source = "external"`）。 Terraform 在 RDS 上创建专用的 `langsmith_fleet` 数据库，并将 `langsmith-fleet-postgres` 和 `langsmith-fleet-redis` 密钥连接到现有 RDS 和 ElastiCache 实例。设置 `fleet_storage = "in-cluster"` 以使用图表中的 PostgreSQL 和 Redis StatefulSet。

队列重复使用 `agent-builder-encryption-key` SSM 参数，因此从 Agent Builder 迁移的部署保留相同的密钥和数据。

### LangSmith 聊天和见解

`enable_polly` 打开 LangSmith Chat（以前称为 Polly），`enable_insights` 打开 Insights。两者都不需要`enable_deployments`。两者都默认为集群内存储。设置`polly_storage = "external"`或`insights_storage = "external"`以在共享RDS和ElastiCache实例上使用专用数据库；这需要`postgres_source = "external"`和`redis_source = "external"`。每个附加组件都需要您的许可证中的权利。

### 沙箱

`enable_sandboxes = true` 在带有 KVM 的裸机 x86\_64 实例上添加了一个沙箱主机节点组（默认为`m5d.metal`）以及一个用于 JuiceFS 元数据的专用 ElastiCache 实例。沙盒需要 LangSmith Helm Chart v16 或更高版本。`sandbox-host` 安装 JuiceFS 本身，`juicefs-format` 作业格式化卷。 `make init-values`写入`sandboxes.juicefs.existingSecretName`指向`juicefs-csi-config`Secret，将`sandboxes.juicefs.hostMount.cacheDirs`设置为沙箱主机节点上的本地NVMe缓存路径（如果有的话），并将IRSA角色注释放在`sandboxes.sandboxHost.serviceAccount`上。

<Note>
  在 Chart v16 上，Chart 捆绑了 JuiceFS CSI 驱动程序。 `v0.16.*`模块版本中的`make init-values`写入`sandboxes.juicefs.csi.existingSecretName`并将IRSA角色注释放在`sandboxes.juicefs.csi.node.serviceAccount`上。两条线上的`juicefs-csi-config` Secret 是相同的。
</Note>

要在现有部署上启用沙箱：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# After setting enable_sandboxes = true in infra/terraform.tfvars
source infra/scripts/setup-env.sh
make apply
make init-values
make deploy
```

Sourcing `setup-env.sh` 再次创建 JuiceFS Redis 身份验证令牌和沙箱回调签名密钥。 `sandbox_*` 变量控制节点数量、实例类型和 JuiceFS 设置；请参阅[variables reference](/langsmith/self-host-terraform-aws-variables#sandboxes)。

### 史密斯数据库

`enable_smithdb = true` 配置 SmithDB 依赖项：本地 NVMe 实例上的元存储 PostgreSQL 实例、S3 存储桶、IRSA 角色和 Karpenter 节点池。 `make init-values` 然后写入 `langsmith-values-smithdb.yaml` 和 `langsmith-values-smithdb-overrides.yaml`，如果其中一个文件丢失，`make deploy` 就会停止。

服务正常后，三个网关将流量转移到 SmithDB：* `smithdb_ingestion_enabled` 将新写入路由到 SmithDB。
* `smithdb_migration_enabled`迁移历史ClickHouse数据。它需要摄入。
* `smithdb_query_enabled` 服务于 SmithDB 的查询。它需要摄入。

这三个都需要`enable_smithdb = true`。根据 [Karpenter compatibility matrix](https://karpenter.sh/docs/upgrading/compatibility/) 保持 `smithdb_karpenter_chart_version`（默认 `1.6.3`）与 `eks_cluster_version` 兼容。完整列表请参见[variables reference](/langsmith/self-host-terraform-aws-variables#smithdb)。

## 可选：带有堡垒的私有 EKS 集群

对于必须运行完全私有 EKS API 端点的部署，模块提供堡垒主机模式：

1. 首先，从工作站运行`create_bastion = true`和`enable_public_eks_cluster = true`，以便创建堡垒。
2. 初次部署后，设置`enable_public_eks_cluster = false`并重新申请。 EKS API 端点仅变为私有端点。
3. 所有后续 Terraform 工作都在堡垒上进行。将 SSM 放入其中，克隆存储库，复制您的 `terraform.tfvars` 和 SSM 密钥，然后从那里运行部署。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
enable_public_eks_cluster = false
create_bastion            = true

# Optional SSH access (SSM is the default and requires no key):
# bastion_key_name          = "my-keypair"
# bastion_enable_ssh        = true
# bastion_ssh_allowed_cidrs = ["203.0.113.0/24"]
```

通过 SSM 会话管理器连接：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make tf ARGS="output bastion_ssm_command"
aws ssm start-session --target <instance-id> --region us-west-2
```<Note>
  堡垒运行在没有公共 IP 的私有子网中，并通过 NAT 网关到达 SSM。设置 `bastion_enable_ssh = true` 将其移动到具有公共 IP 的公共子网。设置 `bastion_existing_security_group_id` 附加您自己的安全组。该堡垒预装了 `kubectl`、`helm`、`terraform`、`git` 和 `jq`，并且已为 EKS 集群配置了 kubeconfig。在您的工作站上安装 AWS CLI 的 [Session Manager plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html)。
</Note>

## 入口、DNS 和 TLS

ALB 始终是入口点。使用`acm`，它终止 TLS。在其后面，[Envoy Gateway](https://gateway.envoyproxy.io/) 是默认入口：ALB 通过 TargetGroupBinding 转发到 Envoy Pod，LangSmith 图表创建 `HTTPRoute` 资源而不是 `Ingress`。

| `terraform.tfvars` | 设置入口 |
| - | - |
|没有设置任何标志 | ALB 后面的 Envoy 网关（默认）|
| `enable_envoy_gateway = false` | AWS 负载均衡器控制器创建的 ALB Ingress |
| `enable_istio_gateway = true` | ALB 背后的 Istio 网关 |
| `enable_nginx_ingress = true` | ALB 背后的 NGINX 入口控制器（旧版）|

Terraform 拒绝打开其中多个选项的配置。在 ALB 入口模式下，AWS 负载均衡器控制器创建自己的 ALB，并且 Terraform ALB 不被使用。 Terraform 为 `langsmith_domain` 创建的 Route 53 别名记录仍然指向 Terraform ALB，因此请将域指向 Ingress 主机名 (`kubectl get ingress -n langsmith`)。

<Warning>
  在 Envoy Gateway 成为默认网关之前创建的部署，没有设置网关标志，在下一个 `make apply` 上切换到 Envoy Gateway。要保留 ALB Ingress，请在应用前设置`enable_envoy_gateway = false`。
</Warning>

`tls_certificate_source`选择证书：

* `acm`（默认）：ALB 上的 ACM 证书，由 Terraform 为 `langsmith_domain` 创建或随 `acm_certificate_arn` 提供。适用于每个入口选项。
* `letsencrypt`：Let's Encrypt 的证书管理器，通过 ALB Ingress 类解决 HTTP-01 挑战。仅适用于 ALB 入口模式 (`enable_envoy_gateway = false`)。需要`letsencrypt_email`。
* `none`：没有证书的纯 HTTP。

对于 Istio 需要的通过 Route 53 加密 DNS-01，请设置 `create_cert_manager_irsa = true`、`cert_manager_hosted_zone_id` 和 `letsencrypt_email`。当设置 `langsmith_domain` 时，Terraform 创建 DNS-01 颁发者。 `create_cert_manager_irsa` 和 `tls_certificate_source = "letsencrypt"` 是互斥的。设置 `langsmith_domain` 且 `acm_certificate_arn` 为空后，`make apply` 将创建 ACM 证书和 Route 53 别名记录。 `make tls` 在 Terraform 外部执行相同的操作：它请求证书并进行 DNS 验证，写入别名记录，并将证书 ARN 写入`terraform.tfvars`。

<Warning>
  在`make apply`为`langsmith_domain`创建证书和别名后，请勿运行`make tls`。 `make tls` 写入的 ARN 会关闭 Terraform DNS 模块，因此下一个 `make apply` 会销毁 Terraform 证书、别名记录和托管区域（如果 Terraform 创建了它） (`dns_create_zone = true`)。
</Warning>

### 分割数据平面命名空间

Envoy Gateway 支持路由到在其自己的命名空间中运行的 `langgraph-dataplane` 图表。每个数据平面命名空间应用一次 RBAC 清单：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl apply -f helm/values/examples/dataplane-rbac.yaml
```

该清单针对 `langsmith-agents` 命名空间；为不同的命名空间编辑它。它授予 `langsmith-host-backend` ServiceAccount 对数据平面命名空间中的 pod、pod 日志、部署和 ReplicaSet 的读取访问权限。如果没有它，代理运行日志不会在LangSmith UI 中传输。

## 后续步骤

* 参考[AWS variables](/langsmith/self-host-terraform-aws-variables)和[quick reference](/langsmith/self-host-terraform-aws-quick-reference)。
* 查看 [AWS architecture](/langsmith/self-host-terraform-aws-architecture) 的平台层、IRSA 和模块依赖性。
* 当出现故障时，请检查[AWS troubleshooting guide](/langsmith/self-host-terraform-aws-troubleshooting)。
* 使用 [LangSmith Deployment](/langsmith/enable-self-hosted-deployment) 在 UI 中启用代理部署。***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-aws-deploy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>