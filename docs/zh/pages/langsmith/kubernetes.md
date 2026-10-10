<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-host LangSmith on Kubernetes | https://docs.langchain.com/langsmith/kubernetes -->

# 在 Kubernetes 上自托管 LangSmith

使用 Helm 在 Kubernetes 集群中安装自托管 LangSmith 及其依赖项，包括 Insights 和 Chat。

<Info>
  自托管 LangSmith 是企业计划的附加组件，专为 LangChain 最大、最具安全意识的客户而设计。更多详情请参阅[Pricing](https://www.langchain.com/pricing)。 [Contact our sales team](https://www.langchain.com/contact-sales) 如果您想要许可证密钥在您的环境中试用LangSmith。
</Info>

本指南介绍如何在 Kubernetes 集群中设置LangSmith。您使用 Helm 安装 LangSmith 及其依赖项。

完成本指南后，您将拥有：

* **LangSmith UI 和 API**：可观察性、跟踪、评估、见解和聊天。
* **后端服务**：队列、游乐场和 ACE。
* **数据存储**：PostgreSQL、Redis、ClickHouse 和可选的 blob 存储。

LangSmith 可在任何符合要求的 Kubernetes 集群上运行。它已经在以下发行版上进行了测试：

* 谷歌 Kubernetes 引擎 (GKE)
* 亚马逊弹性 Kubernetes 服务 (EKS)
* Azure Kubernetes 服务 (AKS)
* OpenShift 4.14 或更高版本
* Minikube 和 Kind（用于开发目的）<Tip>
  **更喜欢基础设施即代码？** [Deploy with Terraform](/langsmith/self-host-terraform) 将 AWS、Azure 和 GCP 的集群配置、秘密连接和 Helm 版本捆绑到一个工作流程中。本指南涵盖了针对您已管理的任何一致性集群的仅 Helm 路径。
</Tip>

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

   <Note>
     使用支持卷扩展的存储类别。跟踪可能需要大量磁盘空间，并且您的卷可能需要随着时间的推移调整大小。
   </Note>

   有关存储类别的更多信息，请参阅[Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/storage-classes/)。

<Note>
  从 0.14.0 开始，LangSmith 服务默认监听 IPv4 和 IPv6。对于仅 IPv4、仅 IPv6 或双堆栈集群，无需进行任何额外配置。
</Note>

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
   * 有关配置选项的完整列表，请参阅[LangSmith Helm chart ⟦T18⟧](https://github.com/langchain-ai/helm/tree/main/charts/langsmith/values.yaml)。

   <Warning>
     仅覆盖 `langsmith_config.yaml` 中所需的设置。不要复制整个`values.yaml`。保持最小配置可确保您继续从 Helm 图表继承新的默认值和升级。
   </Warning>

   <Tip>
     如果您的集群强制执行非根或只读容器策略，请从 [read-only Helm configuration example](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/read_only_config.yaml) 开始。 LangSmith 容器不需要 root 权限。该示例展示了如何为需要临时存储的服务设置 `runAsNonRoot`、服务 UID 和 GID、`fsGroup`、`RuntimeDefault` seccomp 配置文件、删除功能、禁用权限升级以及可写 `emptyDir` 挂载。
   </Tip>

2. 使用 [prerequisites](#keys-and-secrets) 中的密钥和机密设置以下最低配置选项（使用基本身份验证）：

   <Warning>
     设置`apiKeySalt`一次，不要更改。该值用于对所有静态 API 密钥进行哈希处理。轮换它会使组织中的每个现有 API 密钥永久失效，从而要求所有用户重新生成其密钥。
   </Warning>

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

## 部署到 Kubernetes

1. 验证您是否可以连接到 Kubernetes 集群。安装到空命名空间中。

   1.运行`kubectl get pods`

      输出应该类似于：

      ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        langsmith-eks-2vauP7wf 21:07:46 No resources found in default namespace.
      ```

   <Note>
     如果您使用的命名空间不是默认命名空间，请使用 `-n <namespace>` 标志在 `helm` 和 `kubectl` 命令中指定命名空间。
   </Note>

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
   * 将 `<version>` 替换为上一步中您要安装的 LangSmith 版本。大多数用户应该安装可用的最新版本。<Note>
     在运行此命令之前，使用 `-n <namespace>` 指定的命名空间必须已经存在。如果不存在，请先使用 `kubectl create namespace <namespace>` 创建它，或者将 `--create-namespace` 标志添加到上面的 helm 命令中。
   </Note>

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

   <img alt="Langsmith ui" />

## 后续步骤

完成本指南后，您的 LangSmith 实例应该正在运行，但可能尚未完全配置。

1. 使用您在`langsmith_config.yaml`中设置的管理员电子邮件地址和密码登录。

2. 配置 Insights 和 Chat 的模型访问权限。参见[Configure model access](/langsmith/self-host-insights-chat#configure-model-access)。3. 将您的代理指向实例并开始跟踪。参见[Interact with your self-hosted instance](/langsmith/self-host-usage)。

4. 与基础设施管理员合作：

   * 为您的 LangSmith 实例设置 DNS，以便更轻松地访问。
   * 配置 SSL 以确保提交到LangSmith 的跟踪数据在传输过程中加密。
   * 使用 [Single Sign-On](/langsmith/self-host-sso) 配置 LangSmith 以保护您的 LangSmith 实例。
   * 设置[blob storage](/langsmith/self-host-blob-storage)来存储大文件。

5. 可选：添加沙箱、引擎、队列或LangSmith部署。仅遵循 [Configure additional self-hosted features](/langsmith/self-host-additional-features) 中您的用例所需的设置指南。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/kubernetes.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>