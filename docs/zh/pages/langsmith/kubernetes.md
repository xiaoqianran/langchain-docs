<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-host LangSmith on Kubernetes | https://docs.langchain.com/langsmith/kubernetes -->

# 在 Kubernetes 上自托管 LangSmith

使用 Helm 在 Kubernetes 集群中安装自托管 LangSmith 及其依赖项，包括 Insights 和 Chat。

> [!注意]
>
> 自托管 LangSmith 是企业计划的附加组件，专为 LangChain 最大、最具安全意识的客户而设计。更多详情请参阅[Pricing](https://www.langchain.com/pricing)。 [Contact our sales team](https://www.langchain.com/contact-sales) 如果您想要许可证密钥在您的环境中试用LangSmith。

本指南介绍如何在 Kubernetes 集群中设置 LangSmith。您使用 Helm 安装 LangSmith 及其依赖项。

完成本指南后，您将拥有：

* **LangSmith UI 和 API**：可观察性、跟踪、评估、见解和聊天。
* **后端服务**：队列、游乐场和 ACE。
* **数据存储**：PostgreSQL、Redis、ClickHouse 和可选的 blob 存储。

LangSmith 可以在任何符合要求的 Kubernetes 集群上运行。它已经在以下发行版上进行了测试：

* 谷歌 Kubernetes 引擎 (GKE)
* 亚马逊弹性 Kubernetes 服务 (EKS)
* Azure Kubernetes 服务 (AKS)
* OpenShift 4.14 或更高版本
* Minikube 和 Kind（用于开发目的）> [!提示]
>
> **更喜欢基础设施即代码？** [Deploy with Terraform](/langsmith/self-host-terraform) 将 AWS、Azure 和 GCP 的集群配置、秘密布线和 Helm 版本捆绑到一个工作流程中。本指南涵盖了针对您已管理的任何一致性集群的仅 Helm 路径。

## 先决条件

要在 Kubernetes 上自行托管 LangSmith，请在安装之前收集以下信息。

### 工具

* **kubectl**：访问您的 Kubernetes 集群。
* **Helm**：安装 LangSmith 图表的包管理器。安装请参考[Helm documentation](https://helm.sh/docs/intro/install/)。
* **OpenSSL**：生成 API 密钥盐和 JWT 密钥。
* **带有 `cryptography` 包的 Python：生成 Insights 和 Chat 加密密钥。

### 密钥和秘密

* **LangSmith 许可证密钥**：从您的 LangChain 代表处获取。 [Contact our sales team](https://www.langchain.com/contact-sales) 了解更多信息。

* **API 密钥盐** 和 **JWT 秘密**：随机字符串。 LangSmith 使用盐来哈希静态 API 密钥，并使用 JWT 密钥来签署基本身份验证的令牌。为每个生成一个单独的值：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  openssl rand -base64 32
  ```* **Insights 和 Chat 加密密钥**：Insights 和 Chat（以前称为 Polly）在 Helm Chart 0.15.1 或更高版本中默认启用。每个在安装时都需要 Fernet 加密密钥。为每个功能生成单独的密钥：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
  ```

### Kubernetes 集群

您需要一个可以使用 `kubectl` 访问的工作 Kubernetes 集群。您的集群需要以下最低资源：

1. 建议：至少 16 个 vCPU 和 64GB 可用内存。

   * 您可能需要根据组织规模和使用情况调整每项服务的资源请求和限制。有关建议，请参阅[self-host scale guide](/langsmith/self-host-scale)。
   * 使用集群自动缩放器根据资源使用情况来缩放节点。
   * 设置指标服务器以便可以打开自动缩放。
   * 如果您在集群内运行 ClickHouse，则必须有一个至少具有 4 个 vCPU 和 16GB **可分配** 内存的节点，因为 ClickHouse 默认情况下会请求此数量的资源。

2. 集群上可用的有效动态 PV 配置程序或 PV（仅当您在集群内运行数据存储时才需要）。* 为了实现持久性，LangSmith 尝试为集群中运行的任何数据存储配置卷。
   * 如果您在集群中使用 PV，请在生产环境中设置备份。
   * **使用 SSD 支持的存储类别以获得更好的性能。 LangChain 建议 7000 IOPS 和 1000 MiB/s 吞吐量。**
   * 在 EKS 上，您可能需要安装和配置 `ebs-csi-driver` 进行动态配置。更多信息请参阅[EBS CSI Driver documentation](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html)。

   要验证，请运行：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   kubectl get storageclass
   ```

   输出应显示至少一种具有支持动态配置的配置程序的存储类。例如：

   ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   NAME            PROVISIONER                 RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
   gp2 (default)   ebs.csi.eks.amazonaws.com   Delete          WaitForFirstConsumer   true                   161d
   ```

   > [!注意]
   >
   > 使用支持卷扩展的存储类别。跟踪可能需要大量磁盘空间，并且您的卷可能需要随着时间的推移调整大小。

   有关存储类别的更多信息，请参阅[Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/storage-classes/)。

> [!注意]
>
> 从 0.14.0 开始，LangSmith 服务默认监听 IPv4 和 IPv6。对于仅 IPv4、仅 IPv6 或双堆栈集群，无需进行任何额外配置。

### 网络访问* **许可证验证**：除非您在离线（气隙）模式下运行，否则 LangSmith 需要出口到 `https://beacon.langchain.com` 进行许可证验证和使用情况报告。详情请参阅[Egress](/langsmith/self-host-egress)。
* **模型提供商访问**：见解和聊天需要 [provider credentials and model configurations](/langsmith/model-configurations)。如果您的集群无法访问 Internet，请在安装之前确认它可以访问哪些模型提供程序端点。
* **容器镜像和图表**：如果您的集群无法访问公共注册表，请[mirror the LangSmith images](/langsmith/self-host-mirroring-images) 访问您自己的注册表并从本地图表安装。

### 数据存储

LangSmith 使用 PostgreSQL 数据库、Redis 缓存和 ClickHouse 数据库来存储跟踪。默认情况下，这些服务安装在 Kubernetes 集群内。对于生产，请改用外部数据存储。对于 PostgreSQL 和 Redis，最好的选择是云提供商的托管服务。

有关更多信息，请参阅以下外部服务设置指南：

* [PostgreSQL](/langsmith/self-host-external-postgres)
* [Redis](/langsmith/self-host-external-redis)
* [ClickHouse](/langsmith/self-host-external-clickhouse)

有关每个数据存储支持的最低版本，请参阅[Minimum versions for self-hosting dependencies](/langsmith/self-host-dependency-versions)。 [SmithDB](/langsmith/self-host-smithdb) 是一个可选数据存储，您可以在基本安装后启用。本指南不需要它。

## 配置您的 Helm 图表1. 创建一个名为 `langsmith_config.yaml` 的新文件。仅设置您的安装需要的选项：

   * 如果您是 Kubernetes 或 Helm 新手，请从 [LangSmith Helm chart examples](https://github.com/langchain-ai/helm/tree/main/charts/langsmith/examples) 之一开始。
   * 有关配置选项的完整列表，请参阅[LangSmith Helm chart ⟦T23⟧](https://github.com/langchain-ai/helm/tree/main/charts/langsmith/values.yaml)。

   > [!警告]
   >
   > 仅覆盖 `langsmith_config.yaml` 中所需的设置。不要复制整个`values.yaml`。保持最小配置可确保您继续从 Helm 图表继承新的默认值和升级。

   > [!提示]
   >
   > 如果您的集群强制执行非根或只读容器策略，请从 [read-only Helm configuration example](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/read_only_config.yaml) 开始。 LangSmith 容器不需要 root 权限。该示例展示了如何为需要临时存储的服务设置 `runAsNonRoot`、服务 UID 和 GID、`fsGroup`、`RuntimeDefault` seccomp 配置文件、删除功能、禁用权限升级以及可写 `emptyDir` 挂载。

2. 使用 [prerequisites](#keys-and-secrets) 中的密钥和机密设置以下最低配置选项（使用基本身份验证）：

   > [!警告]
   >
   > 设置`apiKeySalt`一次，请勿更改。该值用于对所有静态 API 密钥进行哈希处理。轮换它会使组织中的每个现有 API 密钥永久失效，从而要求所有用户重新生成其密钥。

   ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   config:
     langsmithLicenseKey: "<your license key>"
     apiKeySalt: "<your api key salt>"
     authType: mixed
     basicAuth:
       enabled: true
       initialOrgAdminEmail: "admin@example.com" # Change this to your admin email address
       initialOrgAdminPassword: "secure-password" # Must be at least 12 characters long and have at least one lowercase, uppercase, and symbol
       jwtSecret: "<your jwt secret>" # A random string of characters used to sign JWT tokens for basic auth.

   insights:
     enabled: true # Enabled by default; key required
     encryptionKey: "<insights-encryption-key>"

   polly:
     enabled: true # Enabled by default; key required
     encryptionKey: "<chat-encryption-key>"
   ```要将密钥存储在现有 Secret 中，或者禁用 Insights 或 Chat，请参阅 [Configure Insights and Chat](/langsmith/self-host-insights-chat)。

3. 如果您使用外部数据存储，请添加其连接详细信息。

### 配置签名 JWKS

自托管 LangSmith 使用 Ed25519 JSON Web 密钥集 (JWKS) 为其 OAuth 授权服务器和 LLM 身份验证代理签署令牌。配置此密钥可启用自托管 OAuth 登录，包括 `langsmith auth login` 和远程 MCP 身份验证，并允许 LangSmith 签署通过 LLM 身份验证代理发送的请求。

JWKS 包含私钥。将其存储在 Kubernetes Secret 中并在升级过程中保持稳定。 LangSmith 派生公钥并从 `/.well-known/jwks.json` 提供公钥，因此 LLM 身份验证代理等客户端可以在不接收私钥的情况下验证令牌。

> [!注意]
>
> 本节中的 Helm 配置需要 LangSmith 图表版本 0.16.0 或更高版本。

使用 [step CLI](https://smallstep.com/docs/step-cli/installation/) 或您的内部密钥管理流程生成 Ed25519 密钥。 RSA 密钥被拒绝。

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
TMPDIR_KEYS="$(mktemp -d)"
step crypto jwk create "$TMPDIR_KEYS/pub.json" "$TMPDIR_KEYS/priv.json" \
  --kty OKP --crv Ed25519 --no-password --insecure
SIGNING_JWKS=$(jq -c '{keys: [.]}' "$TMPDIR_KEYS/priv.json")
```

`step crypto jwk create` 将 `use` 设置为 `sig`，将 `alg` 设置为 `EdDSA`，并将 `kid` 设置为密钥的指纹。如果您以其他方式生成密钥，请将第一个密钥指定为非空 `kid`。 [Sandbox service URLs](/langsmith/enable-self-hosted-sandboxes#optional-enable-service-urls)需要它。

选择以下存储选项之一：* **图表管理的秘密**：在您的 LangSmith `langsmith_config.yaml` 中设置 `config.signingJwks`。该图表将值存储在其托管的 Kubernetes Secret 中。

  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  config:
    signingJwks: |
      {"keys":[...]}
  ```

* **现有 Secret**：如果您的安装已使用 `config.existingSecretName`，请将生成的 JWKS 添加到该 Secret 的确切密钥 `langsmith_signing_jwks` 下：

  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Add this key to the existing chart-wide Kubernetes Secret.
  stringData:
    langsmith_signing_jwks: |
      {"keys":[...]}
  ```

  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  config:
    existingSecretName: "langsmith-secrets"
  ```

  `config.existingSecretName` 替换了整个 LangSmith 安装的图表管理 Secret。不要将其指向仅限 JWKS 的 Secret。保留所有现有密钥，包括 `langsmith_license_key` 和 `api_key_salt`。完整的 Secret 结构请参见[Use an existing Secret for your installation](/langsmith/self-host-using-an-existing-secret)。

> [!警告]
>
> 从图表版本 0.16.0 开始，图表拥有 `LANGSMITH_SIGNING_JWKS`。从早期图表版本升级时，请从 `commonEnv` 和 `platformBackend.deployment.extraEnv` 中删除此环境变量。将其设置在那里会导致重复的环境变量错误。如果您之前从单独的 Secret（例如 `langsmith-signing-jwks`）加载它，请将值移动到图表配置中并删除该引用。通过`config.signingJwks`或`config.existingSecretName`中的`langsmith_signing_jwks`键进行配置。

配置 JWKS 后应用 Helm 版本。如果您更新外部管理的 Secret 而不更改 Helm 值，请重新启动平台后端 pod，以便它们加载新的环境变量。从您的 LangSmith 安装请求公共 JWKS 以验证配置：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://<your-langsmith-host>/.well-known/jwks.json
```

响应包含公共验证密钥，不包含私有 `d` 字段。

## 部署到 Kubernetes

1. 验证您是否可以连接到 Kubernetes 集群。安装到空命名空间中。

   1.运行`kubectl get pods`

      输出应该类似于：

      ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        langsmith-eks-2vauP7wf 21:07:46 No resources found in default namespace.
      ```

   > [!注意]
   >
   > 如果您使用的命名空间不是默认命名空间，请使用 `-n <namespace>` 标志在 `helm` 和 `kubectl` 命令中指定命名空间。

2. 确保您已添加 LangChain Helm 存储库（如果您使用本地图表，请跳过此步骤）。

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   helm repo add langchain https://langchain-ai.github.io/helm
   ```

3. 找到最新版本的图表。您可以在[Helm Chart repository](https://github.com/langchain-ai/helm/releases)中找到可用的版本。

   * LangChain建议使用最新版本。
   * 您还可以运行`helm search repo langchain/langsmith --versions`来查看可用的版本。输出看起来像这样：

   ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langchain/langsmith              	0.13.0      	0.13.1    	Helm chart to deploy the langsmith application ...
    langchain/langsmith              	0.12.34      	0.12.73    	Helm chart to deploy the langsmith application ...
    langchain/langsmith              	0.12.33      	0.12.72    	Helm chart to deploy the langsmith application ...
    langchain/langsmith              	0.12.32      	0.12.70    	Helm chart to deploy the langsmith application ...
    langchain/langsmith              	0.12.31      	0.12.69    	Helm chart to deploy the langsmith application ...
   ```

4.运行`helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug`

   * 将 `<namespace>` 替换为您想要部署 LangSmith 的命名空间。
   * 将 `<version>` 替换为上一步中您要安装的 LangSmith 版本。大多数用户应该安装可用的最新版本。> [!注意]
   >
   > 最新稳定图表在v17线上（`0.17.x`）。为 v16 行写入的值可能无法在 v17 上呈现。如果您要升级现有的 v16 安装而不是安装新安装，请先按照 [Upgrade from v16 to v17](/langsmith/self-host-upgrades#upgrade-from-v16-to-v17) 操作。

   > [!注意]
   >
   > 在运行此命令之前，使用`-n <namespace>`指定的命名空间必须已经存在。如果不存在，请先使用 `kubectl create namespace <namespace>` 创建它，或者将 `--create-namespace` 标志添加到上面的 helm 命令中。

   当 `helm install` 命令成功完成时，您应该看到类似于以下内容的输出：

   ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   NAME: langsmith
   LAST DEPLOYED: Fri Sep 17 21:08:47 2021
   NAMESPACE: langsmith
   STATUS: deployed
   REVISION: 1
   TEST SUITE: None
   ```

   这可能需要几分钟才能完成，因为它会创建多个 Kubernetes 资源并运行多个作业来初始化数据库和其他服务。

5. 运行`kubectl get pods`。输出现在应如下所示（确切的 Pod 名称可能会根据您使用的版本和配置而有所不同）：

   ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langsmith-ace-backend-98fbd468c-x9gjl         1/1     Running   0
    langsmith-backend-84999bbcb7-dfhml            1/1     Running   0
    langsmith-clickhouse-0                        1/1     Running   0
    langsmith-frontend-79bdcbccc6-r7pt7           1/1     Running   0
    langsmith-ingest-queue-cbb67748-8rl8x         1/1     Running   0
    langsmith-platform-backend-586bd9d97c-2g5mv   1/1     Running   0
    langsmith-playground-859d44b46c-fjqjh         1/1     Running   0
    langsmith-postgres-0                          1/1     Running   0
    langsmith-queue-7bd6cb8b9b-bmvxm              1/1     Running   0
    langsmith-redis-0                             1/1     Running   0
   ```

## 验证您的部署

1.运行`kubectl get services`

   输出应该类似于：

   ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    NAME                         TYPE           CLUSTER-IP       EXTERNAL-IP                                                                   PORT(S)                      AGE
    langsmith-ace-backend        ClusterIP      172.20.92.210    <none>                                                                        1987/TCP                     1m
    langsmith-backend            ClusterIP      172.20.156.146   <none>                                                                        1984/TCP                     1m
    langsmith-clickhouse         ClusterIP      172.20.250.160   <none>                                                                        8123/TCP,9000/TCP,9363/TCP   1m
    langsmith-frontend           LoadBalancer   172.20.18.173    <external-ip>                                                                 80:30879/TCP,443:31364/TCP   1m
    langsmith-platform-backend   ClusterIP      172.20.95.187    <none>                                                                        1986/TCP                     1m
    langsmith-playground         ClusterIP      172.20.142.121   <none>                                                                        1988/TCP                     1m
    langsmith-postgres           ClusterIP      172.20.226.128   <none>                                                                        5432/TCP                     1m
    langsmith-redis              ClusterIP      172.20.57.248    <none>                                                                        6379/TCP                     1m
   ```

2、curl`langsmith-frontend`服务的外部IP：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   curl <external ip>/api/tenants
   ```

   预期输出：

   ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   [{"id":"00000000-0000-0000-0000-000000000000","has_waitlist_access":true,"created_at":"2023-09-13T18:25:10.488407","display_name":"Personal","config":{"is_personal":true,"max_identities":1},"tenant_handle":"default"}]
   ```

3. 在浏览器中访问`langsmith-frontend`服务的外部IP。

   LangSmith UI 应可见且可操作。

   ![Langsmith ui](https://mintcdn.com/langchain-5e9cc07a/4kN8yiLrZX_amfFn/langsmith/images/langsmith-ui.png?fit=max\&auto=format\&n=4kN8yiLrZX_amfFn\&q=85\&s=5310f686e7b9eebaaee4fe2a152a8675)

## 后续步骤完成本指南后，您的 LangSmith 实例应该正在运行，但可能尚未完全配置。

1. 使用您在`langsmith_config.yaml`中设置的管理员电子邮件地址和密码登录。

2. 配置 Insights 和 Chat 的模型访问权限。参见[Configure model access](/langsmith/self-host-insights-chat#configure-model-access)。

3. 将您的代理指向实例并开始跟踪。参见[Interact with your self-hosted instance](/langsmith/self-host-usage)。

4. 与您的基础设施管理员合作：

   * 为您的 LangSmith 实例设置 DNS 以方便访问。
   * 配置 SSL 以确保提交到LangSmith 的跟踪数据在传输过程中加密。
   * 使用 [Single Sign-On](/langsmith/self-host-sso) 配置 LangSmith 以保护您的 LangSmith 实例。
   * 设置[blob storage](/langsmith/self-host-blob-storage)来存储大文件。

5. 可选：添加沙箱、引擎、队列或LangSmith部署。仅遵循 [Configure additional self-hosted features](/langsmith/self-host-additional-features) 中您的用例所需的设置指南。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/kubernetes.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。