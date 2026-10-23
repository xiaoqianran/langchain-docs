<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Mirror images for your LangSmith installation | https://docs.langchain.com/langsmith/self-host-mirroring-images -->

# LangSmith 安装的镜像

默认情况下，LangSmith将从我们的公共 Docker 注册表中提取镜像。但是，如果您在无法访问 Internet 的环境中运行 LangSmith，或者您想使用私有 Docker 注册表，则可以将映像镜像到您自己的注册表，然后配置您的 LangSmith 安装以使用这些映像。

> [!提示]
>
> 要在同一网络上构建代理服务器映像，请参阅[Set up a build machine on a restricted network](/langsmith/self-host-restricted-network-build)。

## 要求

* 对 Kubernetes 集群/计算机有权访问的 Docker 注册表进行身份验证的访问。
* Docker 安装在本地计算机或有权访问 Docker 注册表的计算机上。
* 一个 Kubernetes 集群，您可以在其中运行 LangSmith。

## 镜像图像> [!注意]
>
> **从 LangSmith 0.16.21（图表 `0.16.0-rc.17`）开始，镜像数量减少。** 平台后端、playground、主机后端以及 Fleet 工具和触发器服务器现在都从单个 `langsmith-backend` 镜像运行，因此您不再需要镜像 `langsmith-go-backend`、`langsmith-playground`， `hosted-langserve-backend`、`agent-builder-tool-server` 或 `agent-builder-trigger-server`（或其 `-fips` 变体）。对应的`values.yaml`键：`platformBackendImage`、`playgroundImage`、`hostBackendImage`、`fleetToolServerImage`和`fleetTriggerServerImage`已从图表中删除；您仍然为它们设置的任何值都将被忽略。
>
> 如果您要安装 **早期** 版本，请继续镜像这些映像并像以前一样设置这些密钥。

[LangSmith Helm chart repository](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/scripts/mirror_langsmith_images.sh) 包含一个镜像图像的脚本。

> [!警告]
>
> 该脚本尚未反映 LangSmith 0.16.21 中的图像合并。它仍然会拉取 `langsmith-go-backend`、`langsmith-playground`、`hosted-langserve-backend`、`agent-builder-tool-server` 和 `agent-builder-trigger-server`，这些图像未在 0.16.21 及更高版本中发布，因此它会在第一个丢失的图像处退出。它还默认操作员图像为`0.1.37`，而图表0.17.0使用`0.1.60`。对于 0.16.21 及更高版本，请按照如下所述手动镜像图像。

要使用该脚本，您需要使用以下命令运行该脚本并指定您的注册表和平台：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bash mirror_langsmith_images.sh <your-registry> [<platform>]
```其中 `<your-registry>` 是 Docker 注册表的 URL（例如 `myregistry.com`），`<platform>` 是您正在使用的平台（例如 `linux/amd64`、`linux/arm64` 等）。如果不指定平台，则默认为`linux/amd64`。

例如，如果您的注册表是 `myregistry.com`，您的平台是 `linux/arm64`，并且您的 LangSmith 应用程序版本是 `0.17.29`，请运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bash mirror_langsmith_images.sh --registry myregistry --platform linux/arm64 --version 0.17.29
```

请注意，此脚本将假定您已安装 Docker 并且您已通过注册表的身份验证。它还会将图像推送到具有与原始图像相同的存储库/标签的指定注册表。

对于 LangSmith 图像，请使用 Helm 图表版本中的 `appVersion` 作为图像标签。不要使用 `latest`：它是可变的，在发布版本时拉取映像可能会导致服务版本不匹配。

或者，您可以手动拉取、镜像和推送图像。您需要镜像的图像可以在 LangSmith Helm Chart 的 `values.yaml` 文件中找到。这些可以在这里找到：[LangSmith Helm Chart values.yaml](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml#L14)

以下是如何使用 Docker 镜像镜像的示例：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Pull the images from the public registry
docker pull langchain/langsmith-backend:0.17.29
docker tag langchain/langsmith-backend:0.17.29 <your-registry>/langsmith-backend:0.17.29
docker push <your-registry>/langsmith-backend:0.17.29
```

您需要对要镜像的每个图像重复此操作。

＃＃ 配置镜像镜像后，您将需要配置 LangSmith 安装以使用镜像镜像。您可以通过修改 LangSmith Helm Chart 安装的 `values.yaml` 文件来完成此操作。将标签替换为您要部署的[LangSmith version](/langsmith/self-hosted-changelog)。以下示例使用 `0.17.29`，图表 0.17.0 的应用程序版本。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
images:
  imagePullSecrets: [] # Add your image pull secrets here if needed
  registry: "" # Set this to your registry URL if you mirrored all images to the same registry using our script. Then you can remove the repository prefix from the images below.
  aceBackendImage:
    repository: "(your-registry)/langchain/langsmith-ace-backend"
    pullPolicy: IfNotPresent
    tag: "0.17.29"
  backendImage:
    repository: "(your-registry)/langchain/langsmith-backend"
    pullPolicy: IfNotPresent
    tag: "0.17.29"
  frontendImage:
    repository: "(your-registry)/langchain/langsmith-frontend"
    pullPolicy: IfNotPresent
    tag: "0.17.29"
  operatorImage:
    repository: "(your-registry)/langchain/langgraph-operator"
    pullPolicy: IfNotPresent
    tag: "0.1.60"
  postgresImage:
    repository: "(your-registry)/postgres"
    pullPolicy: IfNotPresent
    tag: "14.7"
  redisImage:
    repository: "(your-registry)/redis"
    pullPolicy: IfNotPresent
    tag: "7"
  clickhouseImage:
    repository: "(your-registry)/clickhouse/clickhouse-server"
    pullPolicy: Always
    tag: "25.12"
  agentBuilderImage: # Fleet
    repository: "(your-registry)/langchain/agent-builder-deep-agent"
    pullPolicy: IfNotPresent
    tag: "0.17.29"
  pollyAgentImage: # Polly, on by default
    repository: "(your-registry)/langchain/langsmith-polly"
    pullPolicy: IfNotPresent
    tag: "0.17.29"
  engineInsightsAgentImage: # Insights (on by default) and Engine
    repository: "(your-registry)/langchain/langsmith-insights-engine"
    pullPolicy: IfNotPresent
    tag: "0.17.29"
  smithdbImage: # SmithDB
    repository: "(your-registry)/langchain/smithdb"
    pullPolicy: IfNotPresent
    tag: "0.17.29"
  presidioAnalyzerImage: # Only when presidioAnalyzer.enabled is true
    repository: "(your-registry)/presidio-analyzer"
    pullPolicy: IfNotPresent
    tag: "2.2.354"
```

图 0.17 默认情况下打开 Polly (`polly.enabled`) 和 Insights (`insights.enabled`)，因此默认安装还会拉动 `langsmith-polly` 和 `langsmith-insights-engine`。镜像两者，除非您关闭这些功能。仅当您启用这些功能时才镜像 Fleet 和 SmithDB 映像。 Presidio 分析器图像来自`mcr.microsoft.com/presidio-analyzer`。

## 沙箱的附加图像

如果启用 [Sandboxes](/langsmith/enable-self-hosted-sandboxes)，也会镜像沙箱运行时映像。沙箱运行时镜像已发布为`linux/amd64`。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bash mirror_langsmith_images.sh --registry myregistry --platform linux/amd64 --version 0.17.29 --include-sandboxes
```

然后，在 `values.yaml` 中配置沙箱运行时镜像：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
images:
  sandboxHostImage:
    repository: "(your-registry)/langchain/sandbox-host"
    pullPolicy: IfNotPresent
    tag: "0.17.29"
```

`sandbox-host` 镜像包含用于生成默认沙箱快照的压缩 ext4 文件系统。请参见[Inspect the default snapshot filesystem](/langsmith/sandbox-snapshots#inspect-the-default-snapshot-filesystem-in-self-hosted-deployments)独立提取和扫描。

如果您的镜像注册表需要身份验证，请配置 `images.imagePullSecrets`。沙箱运行时使用与其他 LangSmith 图像相同的图像拉取机密。`--include-sandboxes` 标志镜像 LangSmith 拥有的沙箱运行时映像。在图表 0.17 上，这是唯一要镜像的沙箱映像：`sandbox-host` 挂载 JuiceFS 本身，JuiceFS 格式作业运行相同的映像。

### JuiceFS CSI 图像在图表 0.16 上

在图 0.16 上，沙箱使用 JuiceFS CSI 驱动程序。如果您的集群根本无法提取公共映像，还可以镜像驱动程序使用的 JuiceFS 映像：

* `docker.io/juicedata/juicefs-csi-driver:v0.31.4`
* `registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.9.0`
* `docker.io/juicedata/mount:ce-v1.3.0` 适用于 JuiceFS 安装盒

然后，配置相应的图像覆盖：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
images:
  juicefsCSIImage:
    repository: "(your-registry)/juicedata/juicefs-csi-driver"
    tag: "v0.31.4"
  juicefsCSINodeDriverRegistrarImage:
    repository: "(your-registry)/sig-storage/csi-node-driver-registrar"
    tag: "v2.9.0"
  juicefsMountImage:
    repository: "(your-registry)/juicedata/mount"
    tag: "ce-v1.3.0"
```

图 0.16 默认 `images.juicefsMountImage` 为 `docker.io/juicedata/mount:ce-v1.3.0` 并将其作为 `JUICEFS_CE_MOUNT_IMAGE` 传递给 CSI 驱动程序。在私有注册表或气隙环境中，设置 `images.juicefsMountImage.repository` 和 `images.juicefsMountImage.tag`，以便挂载 Pod 从镜像注册表中提取，而不是公共默认值。

## 引擎的附加图像

如果将映像镜像到私有注册表，[Engine](/langsmith/engine-self-hosted) 使用单个组合映像：`langsmith-insights-engine`。引擎还需要沙箱，它使用[Additional images for sandboxes](#additional-images-for-sandboxes)中描述的单独图像。

要镜像所需的图像：

1. 使用 [manual mirroring process](#mirroring-the-images) 将 `langsmith-insights-engine` 镜像到您的私有注册表。
2. 使用`--include-sandboxes`镜像沙箱运行时镜像，并按照[Additional images for sandboxes](#additional-images-for-sandboxes)中的说明进行配置。

覆盖 `images.engineInsightsAgentImage.repository` 以使用镜像引擎和 Insights 映像：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
images:
  engineInsightsAgentImage:
    repository: "(your-registry)/langchain/langsmith-insights-engine"
    pullPolicy: IfNotPresent
    tag: "0.17.29"
```> [!注意]
>
> 请勿使用`langsmith-clio`。如果您要升级指向此已停用的仅 Insights 映像的现有安装，请替换映像存储库。仓库名称必须以`langsmith-insights-engine`结尾；该图表验证了这一要求。

镜像镜像不会消除 Engine 的 LangSmith 智能出口要求，因此完全气隙安装无法运行 Engine。参见[LangSmith Intelligence for Engine](/langsmith/self-host-egress#langsmith-intelligence-for-engine)。

## 舰队的附加图片

如果您使用的是 Fleet，LangGraph 运算符会为每个部署动态创建 Redis 和 PostgreSQL (pgvector) Pod。这些 Pod 使用在需要单独配置的操作员模板中定义的映像。

您必须镜像这些附加图像：

* `docker.io/redis:7`
* `docker.io/pgvector/pgvector:pg15`

然后覆盖 `values.yaml` 中的操作员模板以使用镜像：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
operator:
  templates:
    redis: |
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: ${service_name}
        namespace: ${namespace}
      spec:
        replicas: 1
        selector:
          matchLabels:
            app: ${service_name}
        template:
          metadata:
            labels:
              app: ${service_name}
          spec:
            enableServiceLinks: false
            containers:
            - name: redis
              image: (your-registry)/redis:7
              ports:
              - containerPort: 6379
                name: redis
              livenessProbe:
                exec:
                  command:
                  - redis-cli
                  - ping
                initialDelaySeconds: 30
                periodSeconds: 10
              readinessProbe:
                tcpSocket:
                  port: 6379
                initialDelaySeconds: 10
                periodSeconds: 5
    db: |
      apiVersion: apps/v1
      kind: StatefulSet
      metadata:
        name: ${service_name}
      spec:
        serviceName: ${service_name}
        selector:
          matchLabels:
            app: ${service_name}
        persistentVolumeClaimRetentionPolicy:
          whenDeleted: Delete
          whenScaled: Retain
        template:
          metadata:
            labels:
              app: ${service_name}
          spec:
            containers:
            - name: postgres
              image: (your-registry)/pgvector/pgvector:pg15
              ports:
              - containerPort: 5432
              command: ["docker-entrypoint.sh"]
              args:
                - postgres
                - -c
                - max_connections=${max_connections}
              env:
              - name: PGDATA
                value: /var/lib/postgresql/data/pgdata
              volumeMounts:
              - name: postgres-data
                mountPath: /var/lib/postgresql/data
            enableServiceLinks: false
        volumeClaimTemplates:
        - metadata:
            name: postgres-data
          spec:
            accessModes: ["ReadWriteOnce"]
            resources:
              requests:
                storage: "${storage_gi}Gi"
```

将 `(your-registry)` 替换为您的注册表 URL。模板变量（`${service_name}`、`${namespace}`、`${max_connections}`、`${storage_gi}`）在运行时由运算符替换，必须保持原样。

配置完成后，您将需要更新 LangSmith 安装。您可以在这里关注我们的升级指南：[Upgrading LangSmith](/langsmith/self-host-upgrades)。如果升级成功，您的 LangSmith 实例现在应该使用 Docker 注册表中的镜像。## 用于代理服务器构建的附加映像

[LangGraph CLI](/langsmith/cli) 在公共基础映像之上构建每个代理服务器映像。当您的构建机器无法到达 Docker Hub 时，镜像基础镜像并将 `langgraph.json` 指向镜像。有关构建设置的其余部分，请参阅[Build Agent Server images on a restricted network](/langsmith/self-host-restricted-network-build)。

基础镜像存储库取决于项目语言：

* **Python**：`langchain/langgraph-api`
* **JavaScript**: `langchain/langgraphjs-api`

CLI 从 `langgraph.json` 选择标签，因此镜像与您的配置匹配的标签：

| `langgraph.json`设置| Python 标签 | JavaScript 标签 |
| - | - | - |
|仅`python_version` 或`node_version` | `3.12` | `20` |
|与`api_version` | `0.8.1-py3.12` | `0.8.1-node20` |
|与`image_distro` |追加 `-wolfi` 或 `-bookworm`，例如 `3.12-wolfi` |追加 `-wolfi` 或 `-bookworm`，例如 `20-wolfi` |

要镜像基础镜像：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docker pull langchain/langgraph-api:3.12
docker tag langchain/langgraph-api:3.12 <your-registry>/langchain/langgraph-api:3.12
docker push <your-registry>/langchain/langgraph-api:3.12
```

然后将`base_image`设置为不带标签的镜像存储库：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "base_image": "<your-registry>/langchain/langgraph-api"
}
```

* CLI 附加标签本身，因此包含标签的 `base_image` 值会产生无效的图像引用。
* 将 `api_version` 设置为精确版本，例如 `0.8.1`。版本范围使 CLI 在构建时查询 pypi.org 来解决它。

## 验证图像签名> [!注意]
>
> 图像签名可用 **从 v15** 开始（LangSmith 应用程序版本 `0.15.x` 及更高版本）。 `v14-stable` 和旧频道上的早期版本未签名，无法通过以下步骤进行验证。

`docker.io/langchain/*` 上的稳定通道LangSmith 图像在发布时使用发布工作流程中的无密钥 [Sigstore/Cosign](https://docs.sigstore.dev/cosign/overview/) 进行签名。签名身份绑定到特定的 GitHub Actions 工作流程、运行和提交，因此签名证明图像是真实的，并且稳定分支发布管道使其在 `langchain-ai/langchainplus` 中运行。您可以在拉取或镜像镜像之前验证签名，并在镜像之后再次验证签名，以确认镜像的摘要与签名的摘要匹配。

安装`cosign` ([installation guide](https://docs.sigstore.dev/cosign/system_config/installation/))，然后验证任何标签：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cosign verify \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/langchain-ai/langchainplus/\.github/workflows/release_self_hosted_on_version_bump\.yaml@refs/heads/v[0-9]+-stable' \
  docker.io/langchain/langsmith-backend:<tag>
```

成功的验证确认：

* 签名上的联署声明有效。
* 证书链接到 Sigstore 根并记录在 [Rekor](https://docs.sigstore.dev/rekor/overview/) 透明度日志中。
* 签名证书通过 GitHub Actions OIDC 颁发给稳定分支发布工作流程。相同的命令通过替换存储库（`langsmith-frontend`、`langsmith-go-backend`、`agent-builder-deep-agent`、`langsmith-insights-engine`、`langsmith-polly`、`agent-builder-tool-server`、`agent-builder-trigger-server`、`hosted-langserve-backend`）来对任何已发布的映像起作用。 `langsmith-playground`、`langsmith-ace-backend`，以及它们的 `*-fips` 变体）。

### 固定到特定版本

对于更严格的验证，例如固定到单个稳定分支或特定提交，请删除正则表达式并提供准确的证书标识。每个签名的证书还带有工作流运行 ID 和提交 SHA 作为主题备用名称扩展，因此您可以限制到特定版本：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cosign verify \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity 'https://github.com/langchain-ai/langchainplus/.github/workflows/release_self_hosted_on_version_bump.yaml@refs/heads/v15-stable' \
  docker.io/langchain/langsmith-backend:0.15.9
```

要检查证书的声明（工作流运行、提交、运行程序），请下载证明并解码嵌入的证书：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cosign download attestation docker.io/langchain/langsmith-backend:<tag>
```

### 验证 SBOM 证明

发布的映像还带有签名的 CycloneDX 软件物料清单 (SBOM) 证明，映像索引中的每个架构都有一个证明。

每个架构的 SBOM 也附加到多架构索引摘要中，因此您可以直接针对裸标签进行验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cosign verify-attestation \
  --type cyclonedx \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/langchain-ai/langchainplus/\.github/workflows/release_self_hosted_on_version_bump\.yaml@refs/heads/v[0-9]+-stable' \
  docker.io/langchain/langsmith-backend:<tag>
```该命令为每个架构返回一个经过验证的语句。成功的验证提供了与图像签名相同的保证：证明是由稳定分支发布工作流程生成的，其声明记录在[Rekor](https://docs.sigstore.dev/rekor/overview/)透明度日志中。

### 获取 SBOM

要将 SBOM 馈送到漏洞扫描程序或 SBOM 管理工具中，请将经过验证的 CycloneDX 文档提取到文件中。因为索引为每个架构携带一个语句，所以首先解析单个架构的子摘要，这样您就可以获得一个 CycloneDX 文档，而不是每个架构一个。

列出标签的每个架构摘要：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docker buildx imagetools inspect --raw docker.io/langchain/langsmith-backend:<tag> \
  | jq -r '.manifests[] | select(.platform.os == "linux") | .digest + "  " + .platform.architecture'
```

然后验证该摘要并将解码后的谓词保存到文件中。谓词是一个标准的 CycloneDX 文档，其中列出了映像中的每个包：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cosign verify-attestation \
  --type cyclonedx \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/langchain-ai/langchainplus/\.github/workflows/release_self_hosted_on_version_bump\.yaml@refs/heads/v[0-9]+-stable' \
  docker.io/langchain/langsmith-backend@<digest> \
  | jq -r '.payload' | base64 -d | jq '.predicate' > langsmith-backend.cdx.json
```

您可以将生成的`langsmith-backend.cdx.json`直接传递给扫描仪，例如[Grype](https://github.com/anchore/grype)（`grype sbom:langsmith-backend.cdx.json`）或[Trivy](https://trivy.dev/)（`trivy sbom langsmith-backend.cdx.json`）。

> [!注意]
>
> 通过`cosign verify-attestation`而不是`cosign download attestation`提取SBOM，可确保您仅使用签名和签名身份已验证的SBOM。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-mirroring-images.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。