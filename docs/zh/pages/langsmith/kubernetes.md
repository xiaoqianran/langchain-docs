<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-host LangSmith on Kubernetes | https://docs.langchain.com/langsmith/kubernetes -->

# 在 Kubernetes 上自托管 LangSmith

<Info>
自托管 LangSmith 是企业计划的附加组件，专为我们最大、最注重安全的客户而设计。请参阅我们的 [pricing page](https://www.langchain.com/pricing) 了解更多详细信息，如果您想获得在您的环境中试用 LangSmith 的许可证密钥，请参阅 [contact our sales team](https://www.langchain.com/contact-sales)。
</Info>

本页面介绍如何在 Kubernetes 集群中设置**LangSmith**（可观察性、跟踪和评估）。您将使用 Helm 安装 LangSmith 及其依赖项。

完成此页面后，您将拥有：

- **LangSmith UI 和 API**：用于 [observability](/langsmith/observability)、跟踪和 [evaluation](/langsmith/evaluation)。
- **后端服务**：（队列、游乐场、ACE）。
- **数据存储**：（PostgreSQL、Redis、ClickHouse、可选的 blob 存储）。

对于[agent deployment](/langsmith/deployment)：要添加部署功能，请先完成本指南，然后按照[Enable LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform#enable-langsmith-deployment)操作。

LangChain 已在以下 Kubernetes 发行版上成功测试 LangSmith：

- 谷歌 Kubernetes 引擎 (GKE)
- Amazon Elastic Kubernetes Service (EKS)：有关架构模式和最佳实践，请参阅[self-hosting on AWS](/langsmith/aws-self-hosted)。
- Azure Kubernetes Service (AKS)：有关架构模式和最佳实践，请参阅[self-hosting on AKS](/langsmith/azure-self-hosted)。
- OpenShift（4.14+）
- Minikube 和 Kind（用于开发目的）<Tip>
**更喜欢基础设施即代码？** [Deploy with Terraform](/langsmith/self-host-terraform) 将 AWS、Azure 和 GCP 的集群配置、秘密连接和 Helm 版本捆绑到一个工作流程中。下面的页面介绍了针对您已管理的任何一致性集群的仅 Helm 路径。
</Tip>

## 先决条件

确保您准备好以下工具/物品。有些项目被标记为可选：

1. LangSmith 许可证密钥

   1. 您可以从您的LangChain 代表处获取此信息。 [Contact our sales team](https://www.langchain.com/contact-sales) 了解更多信息。

2.API密钥盐

   1. 这是您可以生成的密钥。它应该是一个随机字符串。
   2. 您可以使用以下命令生成它：

   ```bash
   openssl rand -base64 32
   ```

3. JWT Secret（可选，但用于基本身份验证）

   1. 这是您可以生成的密钥。它应该是一个随机字符串。
   2. 您可以使用以下命令生成它：

   ```bash
   openssl rand -base64 32
   ```

### 数据库

LangSmith 使用 PostgreSQL 数据库、Redis 缓存和 ClickHouse 数据库来存储跟踪。默认情况下，这些服务安装在 Kubernetes 集群内。但是，我们强烈建议使用外部数据库。对于 PostgreSQL 和 Redis，最好的选择是云提供商的托管服务。有关更多信息，请参阅以下外部服务设置指南：

- [PostgreSQL](/langsmith/self-host-external-postgres)
- [Redis](/langsmith/self-host-external-redis)
- [ClickHouse](/langsmith/self-host-external-clickhouse)

有关每个数据存储支持的最低版本，请参阅[Minimum versions for self-hosting dependencies](/langsmith/self-host-dependency-versions)。


### Kubernetes 集群要求

1. 您需要一个可以通过 `kubectl` 访问的工作 Kubernetes 集群。您的集群应满足以下最低要求：

   1.推荐：至少16个vCPU，64GB可用内存

      * 您可能需要根据组织规模/使用情况调整我们所有不同服务的资源请求/限制。您可以在[self-host scale guide](/langsmith/self-host-scale)找到我们的建议。
      * 我们建议使用集群自动缩放器来根据资源使用情况处理节点的扩展/缩减。
      * 我们建议设置指标服务器，以便可以打开自动缩放。
      * 如果您在集群内运行 Clickhouse，则必须有一个至少具有 4 个 vCPU 和 16GB **可分配** 内存的节点，因为 ClickHouse 默认情况下会请求此数量的资源。

   2. 集群上可用的有效动态 PV 配置程序或 PV（仅当您在集群内运行数据库时才需要）* 为了实现持久性，我们将尝试为集群中运行的任何数据库提供卷。
      * 如果在集群中使用 PV，我们强烈建议在生产环境中设置备份。
      * **我们强烈鼓励使用 SSD 支持的存储类别以获得更好的性能。我们建议 7000 IOPS 和 1000 MiB/s 吞吐量。**
      * 在 EKS 上，您可能需要确保已安装并配置`ebs-csi-driver`以进行动态配置。请参阅[EBS CSI Driver documentation](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html)了解更多信息。

      您可以通过运行以下命令来验证这一点：

      ```bash
      kubectl get storageclass
      ```

      输出应显示至少一种具有支持动态配置的配置程序的存储类。例如：

      ```bash
      NAME            PROVISIONER                 RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
      gp2 (default)   ebs.csi.eks.amazonaws.com   Delete          WaitForFirstConsumer   true                   161d
      ```

            <Note>
            我们强烈建议使用支持卷扩展的存储类。这是因为跟踪可能需要大量磁盘空间，并且您的卷可能需要随着时间的推移调整大小。
            </Note>

      有关存储类别的更多信息，请参阅[Kubernetes documentation](https://kubernetes.io/do/langsmith/observability-concepts/storage/storage-classes/)。

2. 头盔

   1.安装`helm`请参考[Helm documentation](https://helm.sh/docs/intro/install/)


3. 出口到`https://beacon.langchain.com`（如果不是在离线模式下运行）1. LangSmith 需要出口到`https://beacon.langchain.com` 进行许可证验证和使用报告。这是LangSmith正常运行所必需的。您可以在 [Egress](/langsmith/self-host-egress) 部分找到有关出口要求的更多信息。


## 配置您的 Helm 图表：

1. 使用上一步中的配置选项创建一个名为 `langsmith_config.yaml` 的新文件。
   1. `langsmith_config.yaml` 文件中有多个配置选项可以设置。您可以在 [Configuration](/langsmith/self-hosted) 部分找到有关特定配置选项的更多信息。
   2. 如果您是 Kubernetes 或 Helm 的新手，我们建议您从 Helm Chart 存储库的示例目录中的示例配置之一开始：[LangSmith helm chart examples](https://github.com/langchain-ai/helm/tree/main/charts/langsmith/examples)。
   3. 您可以在 Helm Chart 存储库的 `values.yaml` 文件中查看配置选项的完整列表：[LangSmith Helm Chart](https://github.com/langchain-ai/helm/tree/main/charts/langsmith/values.yaml)

<Warning>
  仅覆盖`langsmith_config.yaml`中您需要的设置；不要复制整个`values.yaml`。
  保持最小配置可确保您继续从 Helm 图表继承新的默认值和升级。
</Warning><Tip>
  如果您的集群强制执行非根或只读容器策略，请从 [read-only Helm configuration example](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/read_only_config.yaml) 开始。 LangSmith 容器不需要 root 权限。该示例展示了如何为需要临时存储的服务设置 `runAsNonRoot`、服务 UID 和 GID、`fsGroup`、`RuntimeDefault` seccomp 配置文件、删除功能、禁用权限升级以及可写 `emptyDir` 挂载。
</Tip>


2. 您至少需要设置以下配置选项（使用基本身份验证）：

   <Warning>
   设置`apiKeySalt`一次，不要更改。该值用于对所有静态 API 密钥进行哈希处理。轮换它将使您组织中的每个现有 API 密钥永久失效，从而要求所有用户重新生成其密钥。
   </Warning>

   ```yaml
   config:
     langsmithLicenseKey: "<your license key>"
     apiKeySalt: "<your api key salt>"
     authType: mixed
     basicAuth:
       enabled: true
       initialOrgAdminEmail: "admin@example.com" # Change this to your admin email address
       initialOrgAdminPassword: "secure-password" # Must be at least 12 characters long and have at least one lowercase, uppercase, and symbol
       jwtSecret: <your jwt salt> # A random string of characters used to sign JWT tokens for basic auth.

   insights:
     enabled: true
     encryptionKey: "<insights-encryption-key>"

   polly:
     enabled: true
     encryptionKey: "<chat-encryption-key>"
   ```

   Insights（人工智能驱动的跟踪分析）和 Polly（工作区内聊天）在最新的图表版本中默认启用，并且在安装时需要加密密钥。使用 `openssl rand -hex 32` 等命令生成每个密钥。

您还需要指定您正在使用的任何外部数据库的连接详细信息。

## 部署到 Kubernetes：

1. 验证您是否可以连接到 Kubernetes 集群（注意：我们强烈建议安装到空命名空间中）

   1.运行`kubectl get pods`输出应该类似于：

      ```bash
        langsmith-eks-2vauP7wf 21:07:46 No resources found in default namespace.
      ```

   <Note>
   如果您使用的命名空间不是默认命名空间，则需要使用 `-n <namespace>` 标志在 `helm` 和 `kubectl` 命令中指定命名空间。
   </Note>

2. 确保您已添加 LangChain Helm 存储库（如果您使用本地图表，请跳过此步骤）。

   ```bash
   helm repo add langchain https://langchain-ai.github.io/helm
   ```

3. 找到最新版本的图表。您可以在[Helm Chart repository](https://github.com/langchain-ai/helm/releases)中找到可用的版本。

   * 我们通常建议使用最新版本。
   * 您还可以运行`helm search repo langchain/langsmith --versions`来查看可用的版本。输出将如下所示：

   ```
    langchain/langsmith              	0.13.0      	0.13.1    	Helm chart to deploy the langsmith application ...
    langchain/langsmith              	0.12.34      	0.12.73    	Helm chart to deploy the langsmith application ...
    langchain/langsmith              	0.12.33      	0.12.72    	Helm chart to deploy the langsmith application ...
    langchain/langsmith              	0.12.32      	0.12.70    	Helm chart to deploy the langsmith application ...
    langchain/langsmith              	0.12.31      	0.12.69    	Helm chart to deploy the langsmith application ...
   ```

4.运行`helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug`

   * 将 `<namespace>` 替换为您想要部署 LangSmith 的命名空间。
   * 将 `<version>` 替换为上一步中您要安装的 LangSmith 版本。大多数用户应该安装可用的最新版本。

   一旦 `helm install` 命令运行并成功完成，您应该看到类似以下的输出：

   ```
   NAME: langsmith
   LAST DEPLOYED: Fri Sep 17 21:08:47 2021
   NAMESPACE: langsmith
   STATUS: deployed
   REVISION: 1
   TEST SUITE: None
   ```

   这可能需要几分钟才能完成，因为它将创建多个 Kubernetes 资源并运行多个作业来初始化数据库和其他服务。5. 运行 `kubectl get pods` 输出现在应该如下所示（请注意，确切的 Pod 名称可能会根据您使用的版本和配置而有所不同）：

   ```
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

## 验证您的部署：

1.运行`kubectl get services`

   输出应该类似于：

   ```
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

2、curl`langsmith-frontend`服务的外网ip：

   ```bash
   curl <external ip>/api/tenants
   ```

   预期输出：
   ```json
   [{"id":"00000000-0000-0000-0000-000000000000","has_waitlist_access":true,"created_at":"2023-09-13T18:25:10.488407","display_name":"Personal","config":{"is_personal":true,"max_identities":1},"tenant_handle":"default"}]
   ```

3. 在浏览器上访问`langsmith-frontend`服务的外网ip

   LangSmith UI 应该可见/可操作

   ![Langsmith ui](/langsmith/images/langsmith-ui.png)

## 使用LangSmith

现在LangSmith正在运行，您可以开始使用它来跟踪您的代码。您可以在[self-hosted usage guide](/langsmith/self-hosted)中找到有关如何使用自托管LangSmith的更多信息。

您的 LangSmith 实例正在运行，但可能尚未完全设置。

如果您使用了基本配置之一，则会为您创建一个默认的管理员用户帐户。您可以使用您在 `langsmith_config.yaml` 文件中指定的电子邮件地址和密码登录。

下一步，强烈建议您与基础设施管理员合作：* 为您的LangSmith实例设置DNS以方便访问
* 配置 SSL 以确保提交到 LangSmith 的跟踪数据在传输过程中加密
* 使用 [Single Sign-On](/langsmith/self-host-sso) 配置 LangSmith 以保护您的 LangSmith 实例
* 将LangSmith连接到外部Postgres和Redis实例
* 设置[Blob Storage](/langsmith/self-host-blob-storage)用于存储大文件

查看我们的[configuration section](/langsmith/self-hosted)，了解有关如何配置这些选项的更多信息。

## 启用 LangSmith 部署、队列、见解、聊天和沙箱

要超越可观察性、跟踪和评估，您可以在自托管实例上启用以下功能：

- **[LangSmith Deployment](/langsmith/deployment)**：通过 LangSmith UI 部署、扩展和管理代理。
- **[Fleet](/langsmith/fleet/index)**：无需编写代码即可创建和管理 AI 代理。
- **[Insights](/langsmith/insights)**：对您的痕迹和应用程序数据进行人工智能分析。
- **[Chat](/langsmith/chat)**：跨越 LangSmith 的工作区聊天体验，帮助您分析跟踪、线程、提示和实验结果。
- **[Sandboxes](/langsmith/sandboxes)**：运行代码，公开临时服务，并从LangSmith创建内存快照。

按照 [Enable additional features](/langsmith/deploy-self-hosted-full-platform) 指南​​设置这些组件。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/kubernetes.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>