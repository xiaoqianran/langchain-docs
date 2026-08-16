<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Mirror images for your LangSmith installation | https://docs.langchain.com/langsmith/self-host-mirroring-images -->

# LangSmith 安装的镜像

默认情况下，LangSmith将从我们的公共 Docker 注册表中提取镜像。但是，如果您在无法访问 Internet 的环境中运行 LangSmith，或者您想使用私有 Docker 注册表，则可以将映像镜像到您自己的注册表，然后配置您的 LangSmith 安装以使用这些映像。

## 要求

* 对 Kubernetes 集群/计算机有权访问的 Docker 注册表进行身份验证的访问。
* Docker 安装在本地计算机或有权访问 Docker 注册表的计算机上。
* 一个 Kubernetes 集群，您可以在其中运行 LangSmith。

## 镜像图像

<Note>
  **从 LangSmith 0.16.21（图表 `0.16.0-rc.17`）开始，镜像数量减少。** 平台后端、playground、主机后端以及 Fleet 工具和触发器服务器现在都从单个 `langsmith-backend` 镜像运行，因此您不再需要镜像 `langsmith-go-backend`、`langsmith-playground`， `hosted-langserve-backend`、`agent-builder-tool-server` 或 `agent-builder-trigger-server`（或其 `-fips` 变体）。对应的`values.yaml`键：`platformBackendImage`、`playgroundImage`、`hostBackendImage`、`fleetToolServerImage`和`fleetTriggerServerImage`已从图表中删除；您仍然为它们设置的任何值都将被忽略。如果您要安装 **早期** 版本，请继续镜像这些映像并像以前一样设置这些密钥。
</Note>

为了您的方便，我们提供了一个脚本来为您镜像图像。您可以在[LangSmith Helm Chart repository](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/scripts/mirror_langsmith_images.sh)找到脚本

要使用该脚本，您需要使用以下命令运行该脚本并指定您的注册表和平台：

```bash
bash mirror_langsmith_images.sh <your-registry> [<platform>]
```

其中 `<your-registry>` 是 Docker 注册表的 URL（例如 `myregistry.com`），`<platform>` 是您正在使用的平台（例如 `linux/amd64`、`linux/arm64` 等）。如果不指定平台，则默认为`linux/amd64`。

例如，如果您的注册表是`myregistry.com`，您的平台是`linux/arm64`，并且您想使用最新版本的映像，则可以运行：

```bash
bash mirror_langsmith_images.sh --registry myregistry --platform linux/arm64 --version 0.10.66
```

请注意，此脚本将假定您已安装 Docker 并且您已通过注册表的身份验证。它还会将图像推送到具有与原始图像相同的存储库/标签的指定注册表。

或者，您可以手动拉取、镜像和推送图像。您需要镜像的图像可以在 LangSmith Helm Chart 的 `values.yaml` 文件中找到。这些可以在这里找到：[LangSmith Helm Chart values.yaml](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml#L14)

以下是如何使用 Docker 镜像镜像的示例：

```bash
# Pull the images from the public registry
docker pull langchain/langsmith-backend:latest
docker tag langchain/langsmith-backend:latest <your-registry>/langsmith-backend:latest
docker push <your-registry>/langsmith-backend:latest
```您需要对要镜像的每个图像重复此操作。

## 配置

镜像镜像后，您将需要配置 LangSmith 安装以使用镜像镜像。您可以通过修改 LangSmith Helm Chart 安装的 `values.yaml` 文件来完成此操作。将标签替换为您要部署的[LangSmith version](/langsmith/self-hosted-changelog)。以下示例使用 `0.16.21`。

```yaml
images:
  imagePullSecrets: [] # Add your image pull secrets here if needed
  registry: "" # Set this to your registry URL if you mirrored all images to the same registry using our script. Then you can remove the repository prefix from the images below.
  aceBackendImage:
    repository: "(your-registry)/langchain/langsmith-ace-backend"
    pullPolicy: IfNotPresent
    tag: "0.16.21"
  backendImage:
    repository: "(your-registry)/langchain/langsmith-backend"
    pullPolicy: IfNotPresent
    tag: "0.16.21"
  frontendImage:
    repository: "(your-registry)/langchain/langsmith-frontend"
    pullPolicy: IfNotPresent
    tag: "0.16.21"
  operatorImage:
    repository: "(your-registry)/langchain/langgraph-operator"
    pullPolicy: IfNotPresent
    tag: "6cc83a8"
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
    tag: "24.8"
```

## 沙箱的附加图像

如果启用 [Sandboxes](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes)，也会镜像沙箱运行时映像。发布了`linux/amd64`的沙箱运行时镜像。

```bash
bash mirror_langsmith_images.sh --registry myregistry --platform linux/amd64 --version 0.16.0 --include-sandboxes
```

然后，在 `values.yaml` 中配置沙箱运行时镜像：

```yaml
images:
  sandboxHostImage:
    repository: "(your-registry)/langchain/sandbox-host"
    pullPolicy: IfNotPresent
    tag: "0.16.0"
```

如果您的镜像注册表需要身份验证，请配置`images.imagePullSecrets`。沙箱运行时使用与其他 LangSmith 图像相同的图像拉取机密。

`--include-sandboxes` 标志镜像 LangSmith 拥有的沙箱运行时映像。如果您的集群根本无法拉取公共镜像，还可以镜像沙箱存储驱动程序使用的 JuiceFS 镜像：

- `docker.io/juicedata/juicefs-csi-driver:v0.31.4`
- `registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.9.0`
- `docker.io/juicedata/mount:ce-v1.3.1` 适用于 JuiceFS 安装盒

然后，配置相应的图像覆盖：

```yaml
images:
  juicefsCSIImage:
    repository: "(your-registry)/juicedata/juicefs-csi-driver"
    tag: "v0.31.4"
  juicefsCSINodeDriverRegistrarImage:
    repository: "(your-registry)/sig-storage/csi-node-driver-registrar"
    tag: "v2.9.0"
  juicefsMountImage:
    repository: "(your-registry)/juicedata/mount"
    tag: "ce-v1.3.1"
```图表默认不设置`images.juicefsMountImage`。取消设置时，JuiceFS CSI 驱动程序使用 CSI 驱动程序映像中烘焙的 `JUICEFS_CE_MOUNT_IMAGE` 后备。对于图表当前的 `docker.io/juicedata/juicefs-csi-driver:v0.31.4` 默认值，后备为 `juicedata/mount:ce-v1.3.1`。在私有注册表或气隙环境中，设置 `images.juicefsMountImage.repository` 和 `images.juicefsMountImage.tag`，以便挂载 Pod 从镜像注册表中提取，而不是公共默认值。

## 引擎的附加图像

如果将映像镜像到私有注册表，[Engine](/langsmith/deploy-self-hosted-full-platform#enable-engine) 使用单个组合映像：`langsmith-insights-engine`。引擎还需要沙箱，它使用[Additional images for sandboxes](#additional-images-for-sandboxes)中描述的单独图像。

要镜像所需的图像：

1. 使用 [manual mirroring process](#mirroring-the-images) 将 `langsmith-insights-engine` 镜像到您的私有注册表。
1. 使用`--include-sandboxes`镜像沙箱运行时镜像，并按照[Additional images for sandboxes](#additional-images-for-sandboxes)中的说明进行配置。

覆盖 `images.engineInsightsAgentImage.repository` 以使用镜像引擎和 Insights 映像：

```yaml
images:
  engineInsightsAgentImage:
    repository: "(your-registry)/langchain/langsmith-insights-engine"
    pullPolicy: IfNotPresent
    tag: "0.16.0"
```

<Note>
不要使用`langsmith-clio`。如果您要升级指向此已停用的仅 Insights 映像的现有安装，请替换映像存储库。仓库名称必须以`langsmith-insights-engine`结尾；该图表验证了这一要求。
</Note>

镜像镜像不会消除 Engine 的 LangSmith 智能出口要求，因此完全气隙安装无法运行 Engine。参见[LangSmith Intelligence for Engine](/langsmith/self-host-egress#langsmith-intelligence-for-engine)。## 舰队的附加图片

如果您使用的是 Fleet，LangGraph 运算符会为每个部署动态创建 Redis 和 PostgreSQL (pgvector) Pod。这些 Pod 使用在需要单独配置的操作员模板中定义的映像。

您必须镜像这些附加图像：
- `docker.io/redis:7`
- `docker.io/pgvector/pgvector:pg15`

然后覆盖 `values.yaml` 中的操作员模板以使用镜像：

```yaml
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

配置完成后，您将需要更新 LangSmith 安装。您可以在这里关注我们的升级指南：[Upgrading LangSmith](/langsmith/self-host-upgrades)。如果升级成功，您的 LangSmith 实例现在应该使用 Docker 注册表中的镜像。

## 验证图像签名

<Note>
**从 v15 开始** 提供图像签名（LangSmith 应用程序版本 `0.15.x` 及更高版本）。 `v14-stable` 和旧频道上的早期版本未签名，无法通过以下步骤进行验证。
</Note>`docker.io/langchain/*` 上的稳定通道LangSmith 镜像在发布时使用发布工作流程中的无密钥[Sigstore/Cosign](https://docs.sigstore.dev/cosign/overview/) 进行签名。签名身份绑定到特定的 GitHub Actions 工作流程、运行和提交，因此签名不仅证明图像是真实的，而且证明它是由在 `langchain-ai/langchainplus` 中运行的稳定分支发布管道生成的。您可以在拉取或镜像映像之前验证签名，并在镜像之后再次验证签名，以确认您镜像的摘要与我们签名的内容匹配。

安装`cosign`（[installation guide](https://docs.sigstore.dev/cosign/system_config/installation/)），然后验证任何标签：

```bash
cosign verify \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/langchain-ai/langchainplus/\.github/workflows/release_self_hosted_on_version_bump\.yaml@refs/heads/v[0-9]+-stable' \
  docker.io/langchain/langsmith-backend:<tag>
```

成功的验证确认：

- 签名上的联署声明有效。
- 证书链接到 Sigstore 根并记录在 [Rekor](https://docs.sigstore.dev/rekor/overview/) 透明度日志中。
- 签名证书通过 GitHub Actions OIDC 颁发给稳定分支发布工作流程。

相同的命令通过替换存储库（`langsmith-frontend`，`langsmith-go-backend`，`agent-builder-deep-agent`，`langsmith-insights-engine`，`langsmith-polly`，`agent-builder-tool-server`，`agent-builder-trigger-server`，`hosted-langserve-backend`，`langsmith-playground`，对任何已发布的图像起作用） `langsmith-ace-backend`，以及它们的 `*-fips` 变体）。

### 固定到特定版本对于更严格的验证（例如，固定到单个稳定分支或特定提交），请删除正则表达式并提供准确的证书身份。每个签名的证书还带有工作流运行 ID 和提交 SHA 作为主题备用名称扩展，因此您可以限制到特定版本：

```bash
cosign verify \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity 'https://github.com/langchain-ai/langchainplus/.github/workflows/release_self_hosted_on_version_bump.yaml@refs/heads/v15-stable' \
  docker.io/langchain/langsmith-backend:0.15.9
```

要检查证书的声明（工作流运行、提交、运行程序），请下载证明并解码嵌入的证书：

```bash
cosign download attestation docker.io/langchain/langsmith-backend:<tag>
```

### 验证 SBOM 证明

发布的映像还带有签名的 CycloneDX 软件物料清单 (SBOM) 证明，映像索引中的每个架构都有一个证明。

每个架构的 SBOM 也附加到多架构索引摘要中，因此您可以直接针对裸标签进行验证：

```bash
cosign verify-attestation \
  --type cyclonedx \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/langchain-ai/langchainplus/\.github/workflows/release_self_hosted_on_version_bump\.yaml@refs/heads/v[0-9]+-stable' \
  docker.io/langchain/langsmith-backend:<tag>
```

该命令为每个架构返回一个经过验证的语句。成功的验证提供了与图像签名相同的保证：证明是由稳定分支发布工作流程生成的，其声明记录在[Rekor](https://docs.sigstore.dev/rekor/overview/)透明度日志中。

### 获取 SBOM要将 SBOM 送入漏洞扫描程序或 SBOM 管理工具，请将经过验证的 CycloneDX 文档提取到文件中。由于索引为每个架构携带一个语句，因此首先解析单个架构的子摘要，这样您就可以获得一个 CycloneDX 文档，而不是每个架构一个。

列出标签的每个架构摘要：

```bash
docker buildx imagetools inspect --raw docker.io/langchain/langsmith-backend:<tag> \
  | jq -r '.manifests[] | select(.platform.os == "linux") | .digest + "  " + .platform.architecture'
```

然后验证该摘要并将解码后的谓词（列出映像中每个包的标准 CycloneDX 文档）保存到文件中：

```bash
cosign verify-attestation \
  --type cyclonedx \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/langchain-ai/langchainplus/\.github/workflows/release_self_hosted_on_version_bump\.yaml@refs/heads/v[0-9]+-stable' \
  docker.io/langchain/langsmith-backend@<digest> \
  | jq -r '.payload' | base64 -d | jq '.predicate' > langsmith-backend.cdx.json
```

您可以将生成的`langsmith-backend.cdx.json`直接传递给扫描仪，例如[Grype](https://github.com/anchore/grype)（`grype sbom:langsmith-backend.cdx.json`）或[Trivy](https://trivy.dev/)（`trivy sbom langsmith-backend.cdx.json`）。

<Note>
通过 `cosign verify-attestation` 而不是 `cosign download attestation` 提取 SBOM，可确保您仅使用签名和签名身份已验证的 SBOM。
</Note>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-mirroring-images.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>