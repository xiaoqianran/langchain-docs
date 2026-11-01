<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Run self-hosted Sandboxes in a separate cluster | https://docs.langchain.com/langsmith/self-host-sandbox-separate-cluster -->

# 在单独的集群中运行自托管沙箱

使用 langsmith-sandbox Helm 图表在专用 Kubernetes 集群中运行自托管 LangSmith Sandbox 运行时，连接到另一个集群中的 LangSmith 控制平面。

默认情况下，`langsmith` Helm 版本在与 LangSmith 相同的 Kubernetes 集群中运行 [Sandbox](/langsmith/sandboxes) 运行时。对于 `sandboxes.external.enabled: true`，运行时是外部的：第二个图表 `langsmith-sandbox` 将其安装在专用集群中。本指南涵盖了该拓扑的要求、网络规则、机密和 Helm 步骤。

有关默认拓扑和两个拓扑共享的设置，请参阅[Enable Sandboxes](/langsmith/enable-self-hosted-sandboxes)。如需升级，请参阅[Upgrade separate sandbox clusters](/langsmith/self-host-upgrades#upgrade-separate-sandbox-clusters)。

> [!注意]
>
> 单独的沙盒集群需要 v0.18 预览版中的 LangSmith Helm 图表版本 0.18.0-rc.51 或更高版本，以及 appVersion 与您的 `langsmith` 图表匹配的 `langsmith-sandbox` 图表。早期的图表忽略`sandboxes.external.enabled`并部署嵌入式运行时。要列出运行时图表版本及其应用程序版本，请运行 `helm search repo langchain/langsmith-sandbox --versions --devel`。

## 决定何时使用单独的集群

在以下情况下使用单独的集群：* **您的 LangSmith 集群无法托管沙箱节点**：沙箱运行时需要支持 KVM 的节点和特权 Pod。例如，GKE Autopilot 集群无法运行运行时，因此 Autopilot 上的 LangSmith 安装需要一个单独的 GKE Standard 集群用于沙箱。
* **您想要隔离沙箱工作负载**：沙箱在特权主机上运行用户代码。单独的集群使这些节点远离运行LangSmith的集群并保存其应用程序机密。运行时仅接收它需要的两个秘密值。

否则，保留默认的嵌入式运行时。然后，Helm 版本会一起安装和升级控制平面和运行时，无需维护集群之间的网络路径。

## 理解拓扑

LangSmith 集群保留沙箱 API 和控制平面：PostgreSQL 中的身份验证、放置、沙箱记录，以及 exec、文件和 [service URL](/langsmith/sandbox-service-urls) 流量的代理。沙箱集群运行主机及其 microVM。

**独立集群**

LangSmith集群保存API、放置和沙箱记录。沙箱集群运行主机，保存两个秘密的副本，并到达沙箱存储。将其与 [default architecture](/langsmith/self-host-sandbox-architecture#understand-the-deployment-model) 进行比较，其中 `sandbox-host` 在 LangSmith 集群中运行。

| | LangSmith集群|沙盒集群|
| - | - | - |
|头盔释放 | `langsmith`，与 `sandboxes.external.enabled: true` | `langsmith-sandbox`，与 `sandboxHost.enabled: true` |
|运行| `platform-backend`、`ingest-queue` 以及 LangSmith 的其余部分 | `sandbox-host` 在支持 KVM 的节点上、JuiceFS 格式化程序作业和可选的主机入口 |
|持有|沙箱记录、回调签名 JWK 和沙箱服务身份验证密钥 |包含这两个值的副本的最小 Secret 以及出口代理 CA |

对于外部运行时，`langsmith` 版本不会渲染 `sandbox-host`、JuiceFS 格式化程序、JuiceFS 配置 Secret 或代理 CA。沙箱集群到达JuiceFS Redis元数据存储和对象存储； LangSmith集群不需要它们。

运行时图表使用与嵌入式运行时相同的设置，没有 `sandboxes.` 前缀：

| `langsmith` 图表，嵌入式运行时 | `langsmith-sandbox`图表|
| - | - |
| `sandboxes.sandboxHost.*` | `sandboxHost.*` |
| `sandboxes.juicefs.*` | `juicefs.*` |
| `sandboxes.juicefsFormatJob.*` | `juicefsFormatJob.*` |
| `sandboxes.proxyCa.*` | `proxyCa.*` |
| `sandboxes.authProxy.httpProxy.noProxy` | `authProxy.httpProxy.noProxy` |
| `sandboxes.authProxy.httpProxy.url` |运行时 Secret 中的密钥 `sandbox_egress_proxy_url` |
| `images.sandboxHostImage.*` | `images.sandboxHostImage.*` |
| `config.customCa` | `config.customCa` |
| `sandboxes.sandboxHost.serviceAccount.annotations` 上的工作负载身份注释 | `workloadIdentity` |[scaling](/langsmith/self-host-sandbox-scaling) 和 [operations](/langsmith/self-host-sandbox-operations) 指南使用嵌入式运行时的名称。在运行时间图表中应用相同的设置。

## 检查要求

### 每朵云

* **节点**：支持 KVM 的 `linux/amd64` 节点，受污染 `sandbox.langsmith.com/host=true:NoSchedule` 并标记为匹配 `sandboxHost.deployment.nodeSelector`。节点选择器没有默认值，如果没有它，图表将无法渲染。默认的容忍度与上面的污点相匹配；对于其他污点，覆盖`sandboxHost.deployment.tolerations`。节点级要求请参见[Enable Sandboxes prerequisites](/langsmith/enable-self-hosted-sandboxes#prerequisites)和[Node requirements for bare-metal and on-premises clusters](/langsmith/enable-self-hosted-sandboxes#node-requirements-for-bare-metal-and-on-premises-clusters)。
* **JuiceFS 元数据 Redis**：使用 `maxmemory-policy noeviction`。只要其他集群可以访问它，就需要 AUTH、TLS 或 IAM 身份验证。启用沙箱先决条件中的存储后端和存储桶格式适用于 `juicefs.storage` 和 `juicefs.bucket`。
* **LangSmith主机名**：将`langsmith`版本中的`config.hostname`设置为沙盒集群可以到达的地址。对于外部运行时，图表无法在没有外部运行时、环回或集群内服务地址的情况下呈现。
* **`config.endpoint`**：将运行时图表的`config.endpoint`设置为`https://<LangSmith hostname>[/<base path>]/api`，外部可访问的LangSmith API，包括`/api`前缀。
* **私有 CA**：如果私有 CA 签署了 LangSmith API 证书、主机入口证书或 HTTPS 出口代理证书，请将该 CA 添加到运行时图表的 `config.customCa`。* **网络**：打开[Configure the network](#configure-the-network)中的路径。
* **Secrets**：在[Create the runtime Secret](#create-the-runtime-secret)中创建Secret。

如果沙盒集群无法从公共注册表中拉取，请按照[Additional images for Sandboxes](/langsmith/self-host-mirroring-images#additional-images-for-sandboxes)中的说明镜像`sandbox-host`镜像，并将运行时图表中的`images.sandboxHostImage.repository`设置为镜像存储库。将镜像的发布标签保留在镜像中并将 `images.sandboxHostImage.tag` 留空，以便镜像遵循图表的 appVersion。升级图表时，固定标签不会更改。

### 亚马逊 EKS

* **身份**：沙箱集群的 IAM OIDC 提供商，以及信任 `system:serviceaccount:<namespace>:<service-account-name>` 的 IAM 角色。设置`sandboxHost.serviceAccount.name`，使拍摄对象保持稳定。设置`workloadIdentity.provider: aws`和`workloadIdentity.aws.roleArn`。
* **存储补助**：`arn:aws:s3:::<bucket>/<juicefs.name>/*` 上的 `s3:GetObject`、`s3:PutObject`、`s3:DeleteObject` 和 `s3:AbortMultipartUpload`，以及 `arn:aws:s3:::<bucket>` 上的 `s3:ListBucket`，条件为 `s3:prefix`，与 `<juicefs.name>/*` 类似。仅 JuiceFS 使用的存储桶不需要任何条件。
* **节点**：暴露KVM的实例类型，例如裸机实例。
* **缓存**：JuiceFS 缓存默认为根卷上的`/var/cache/juicefs`。在具有本地 NVMe 的实例类型（例如 `m5d.metal`）上，安装驱动器并将 `juicefs.hostMount.cacheDirs` 指向它们。

### 谷歌 Kubernetes 引擎* **集群**：标准集群，非 Autopilot，在 `UBUNTU_CONTAINERD` 上具有节点池和嵌套虚拟化（N2、N1、C3 或 C4）。将节点池的 OAuth 范围设置为`cloud-platform`，以便 IAM 授予决定访问权限。
* **身份**：设置`workloadIdentity.provider: gcp`。 `sandbox-host` 使用主机网络，图表也在那里运行 JuiceFS 格式化程序，因此两者都以节点池的服务帐户身份进行身份验证，并且不需要 Workload Identity 绑定。将 `juicefsFormatJob.nodeSelector` 留空，以便格式化程序在沙箱节点池上运行。
* **存储授权**：使用仅 JuiceFS 使用的存储桶，具有统一的存储桶级别访问权限，并在其上授予节点池的服务帐户`roles/storage.objectAdmin`。如果 JuiceFS 必须共享一个存储桶，请开启统一存储桶级别的访问并使用条件`resource.name.startsWith("projects/_/buckets/<bucket>/objects/<juicefs.name>/") || resource.type == "storage.googleapis.com/Bucket"`。仅前缀条件会阻止 JuiceFS 进行的列表调用。第二个子句让沙箱节点列出存储桶中每个对象的名称和元数据。
* **Redis**：使用`juicefs.redis.iamAuthProvider: gcp`，使用Memorystore for Redis Cluster，并授予节点池的服务帐户`roles/redis.dbConnectionUser`。
* **缓存**：将`juicefs.hostMount.cacheDirs`指向节点本地SSD。* **命名空间**：如果沙箱集群与 LangSmith 集群共享 Google Cloud 项目并启用了 Workload Identity，请将运行时安装在LangSmith 以外的命名空间中。 Workload Identity 信任项目中每个集群的命名空间和 ServiceAccount 名称。

### Azure Kubernetes 服务

* **节点**：支持嵌套虚拟化的 VM 大小。
* **身份**：启用 OIDC 颁发者和工作负载身份，以及主题为 `system:serviceaccount:<namespace>:<service-account-name>` 的联合凭证。设置`sandboxHost.serviceAccount.name`，使拍摄对象保持稳定。设置 `workloadIdentity.provider: azure` 和 `workloadIdentity.azure.clientId`，如果与集群的租户不同，则加上 `tenantId`。该图表将 `azure.workload.identity/use` 标签添加到 `sandbox-host` 和格式化程序。
* **存储补助**：容器上的`Storage Blob Data Contributor`。设置`juicefs.storage: wasb`和`juicefs.storageAccountName`。
* **Redis**：通过 `rediss://` 数据库 0 上的 Azure 托管 Redis，并在数据库上设置 `NoEviction` 逐出策略。 JuiceFS 无法更改它。
* **缓存**：将`juicefs.hostMount.cacheDirs`指向`/mnt`下的临时磁盘。

## 配置网络

默认情况下，LangSmith 控制平面在 TCP 端口 `19190` 上直接连接到 `sandbox-host` 通告的节点 IP。允许这些路径：|来源 |目的地 |港口|目的|
| - | - | - | - |
| LangSmith `platform-backend` 和 `ingest-queue` 吊舱 |沙盒节点 | TCP `19190` |沙箱放置、生命周期调用、执行、文件和其他沙箱流量 |
|其他沙盒节点 |沙盒节点 | TCP `19190` |转发的入口请求、沙箱链接和实时迁移流 |
|主机入口控制器或负载均衡器（启用后） |沙盒节点 | TCP `19190` |通过 [host ingress](#use-the-host-ingress) 到达的请求 |
|沙盒节点 | `config.endpoint` |端点的端口，通常为 `443` |主机报告、生命周期回调以及从沙箱内部调用LangSmith API |
|沙盒节点 | JuiceFS Redis 和对象存储 |商店的端口 |沙箱存储|

对于第一行，允许 LangSmith Pod 在网络上出现的地址：节点安全组、Pod CIDR 或 SNAT 地址，具体取决于 CNI。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {'theme': 'base', 'themeVariables': {'fontFamily': 'TWK Lausanne, Inter', 'fontSize': '15px', 'lineColor': '#40668D', 'primaryTextColor': '#030710', 'textColor': '#030710', 'edgeLabelBackground': '#F2FAFF'}, 'flowchart': {'nodeSpacing': 50, 'rankSpacing': 60, 'curve': 'linear'}}}%%
flowchart TB
    accTitle: Separate sandbox cluster topology
    accDescr: The LangSmith cluster reaches sandbox-host in the sandbox cluster on TCP port 19190, directly or through an optional host ingress. sandbox-host calls the LangSmith API at config.endpoint and stores sandbox data in JuiceFS.
    subgraph LS["LangSmith cluster"]
        CP["LangSmith API,<br/>platform-backend,<br/>and ingest-queue"]
    end
    subgraph SC["Sandbox cluster"]
        ING["Host ingress<br/>(optional)"]
        SH["sandbox-host<br/>on KVM nodes"]
    end
    ST[("JuiceFS Redis and<br/>object storage")]
    CP -->|"TCP 19190"| SH
    CP -.->|"HTTPS"| ING
    ING -->|"TCP 19190"| SH
    SH -->|"config.endpoint"| CP
    SH --> ST
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33
    class CP,SH process
    class ING neutral
    class ST output
```

> [!警告]
>
> 端口 `19190` 上的流量是纯 HTTP，并携带沙箱命令、文件和凭据。将其保存在您信任的专用网络上。如果集群没有路由专用网络，或者流量将离开您信任的网络，请使用带有 TLS 的 [host ingress](#use-the-host-ingress)。从沙箱节点到`config.endpoint`的路径是此拓扑中的新路径。使用嵌入式运行时，`sandbox-host`通过集群内服务DNS达到LangSmith。使用外部运行时，它通过网络调用`config.endpoint`，因此调用必须传递该地址前面的每个控件：

* **负载均衡器白名单**：如果LangSmith负载均衡器限制源地址，则允许沙箱节点流量来自的地址。对于内部负载均衡器，这通常是沙箱节点的私有地址。对于面向互联网的，通常是沙箱节点使用的 NAT 网关的公共地址。
* **出口过滤**：如果防火墙过滤沙箱集群的出口，则允许 LangSmith 主机名。
* **DNS**：沙箱节点必须解析 LangSmith 主机名。仅在 LangSmith 集群的私有 DNS 中解析的地址不起作用。对于内部负载均衡器，请在安装运行时之前将记录添加到沙盒网络使用的私有 DNS 区域：启动时失败的查找可能会缓存几分钟。

### 使用主机入口运行时图表可以在`sandbox-host`前面创建一个Ingress。当 LangSmith 集群无法到达沙箱节点 IP 时，或者当纯 HTTP 流量将离开您信任的专用网络时，请使用它。

要通过主机入口路由控制平面流量：

1. 在运行时值中，使用主机名和 TLS 启用 `sandboxHost.ingress`：

   ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   sandboxHost:
     ingress:
       enabled: true
       ingressClassName: "<ingress-class>"
       hostname: "sandbox-hosts.example.com"
       tls:
         - secretName: "sandbox-hosts-tls"
           hosts:
             - "sandbox-hosts.example.com"
   ```

2. 在 `langsmith` 值中，设置入口原点，不带路径或尾部斜杠：

   ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   sandboxes:
     external:
       hostIngressEndpoint: "https://sandbox-hosts.example.com"
   ```

TLS 在入口处结束。在沙盒集群内部，从入口到主机以及主机之间的流量在端口 `19190` 上保持纯 HTTP，因此请保持该网络的私有性。

Ingress 仅路由`/internal/SandboxHost/`（主机调用）和`/guest-operation/`（执行、文件、隧道、沙箱链接以及浏览器和服务 URL）。它不路由`/metrics`或`/readyz`；在端口 `19190` 的每个 `sandbox-host` pod 上刮擦并探测它们。在依赖 ingress 之前，请检查：* **客户端**：LangSmith `platform-backend` 和 `ingest-queue` Pod 连接到入口，沙箱主机也连接到入口，沙箱主机拨入沙箱链接。如果入口限制源地址，则允许两者。沙箱主机还必须解析入口主机名并信任其证书。如果私有 CA 对其进行签名，请将 CA 添加到运行时图表的 `customCa` 和`langsmith` 图表的 `config.customCa`。
* **运行状况检查**：负载均衡器直接检查 `sandbox-host` Pod，许多负载均衡器默认检查 `/` 或 Ingress 路径，返回 `404`。设置健康检查路径为`/readyz`。使用 AWS 负载均衡器控制器，将 `alb.ingress.kubernetes.io/healthcheck-path: /readyz` 和 `alb.ingress.kubernetes.io/target-type: ip` 添加到 `sandboxHost.ingress.annotations`，因为服务是 `ClusterIP`。在 GKE 上，将 `ingressClassName` 留空，设置 `kubernetes.io/ingress.class: gce` 注释，并附加 `BackendConfig` 以及 `healthCheck.requestPath: /readyz` 和 `healthCheck.port: 19190` 到 `sandboxHost.ingress.service.annotations` (`cloud.google.com/backend-config`)。
* **超时**：LangSmith 等待执行请求最多 310 秒。 Exec 流、隧道、沙箱链接和浏览器会话是长期存在的 WebSocket 或服务器发送的事件连接。将控制器的读取、空闲和后端超时设置为 310 秒以上，如果长时间会话必须保持打开状态，则设置更高。默认值 30 到 60 秒会切断它们。在 GKE 上，将 `timeoutSec` 设置为相同的 `BackendConfig`。* **请求大小**：文件上传通过入口。将控制器的主体大小限制提高到至少您最大的上传速度。在 ingress-nginx 上，设置`nginx.ingress.kubernetes.io/proxy-body-size`，默认为`1m`。
* **WebSockets**：控制器必须允许 Ingress 路由上的 WebSocket 升级。 Azure 应用程序网关容器仅通过网关 API 支持 WebSocket，因此它无法为此入口提供服务。使用另一个控制器，或禁用 `sandboxHost.ingress` 并使用您自己的服务和网关 API `HTTPRoute` 将两条路径路由到 `sandbox-host` Pod 的端口 `19190`。

## 创建运行时 Secret

运行时从您在沙箱命名空间中创建的 Secret 中读取其凭据。在`config.existingSecretName`中设置其名称。 Secret 包含两个值，从 LangSmith 端复制：

* **沙箱服务身份验证秘密**：对控制平面和沙箱主机之间的调用进行签名。将其存储在`sandbox_service_auth_secret`下，或`serviceAuth.secretKey`命名的密钥下。
* **回调签名 JWK**：签署沙箱回调的 Ed25519 私有 JWK。将其存储在`sandbox_callback_signing_jwk`下，或`config.callbackSigningJwkSecretKey`命名的密钥下。

两个值必须等于控制平面的值。在LangSmith应用程序Secret中找到它们：|价值|与图表管理的秘密|与 `config.existingSecretName` |
| - | - | - |
|服务授权秘密 |钥匙`sandbox_service_auth_secret`，从`sandboxes.serviceAuth.secret`设置 | `sandboxes.serviceAuth.secretKey`命名的钥匙 |
|回调签名JWK |钥匙`sandbox_callback_signing_jwk`，从`sandboxes.callbackSigningJwk`开始设置 |钥匙`sandbox_callback_signing_jwk`|

使用外部运行时，`langsmith` 版本的 Helm 安装说明会打印您的配置的键名称。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
apiVersion: v1
kind: Secret
metadata:
  name: langsmith-sandbox-runtime
  namespace: langsmith-sandbox
type: Opaque
stringData:
  sandbox_service_auth_secret: '<same-value-as-the-control-plane>'
  sandbox_callback_signing_jwk: '<same-ed25519-private-jwk-as-the-control-plane>'
```

避免将此文件提交给版本控制。如果外部机密管理器提供您的机密，请将相同的两个值同步到此值中。

> [!警告]
>
> 仅复制这两个值。切勿将整个LangSmith应用程序 Secret 复制到沙箱集群中。

服务验证秘密必须是它自己的随机值。不要重用 `api_key_salt`：该值还会加盐 LangSmith API 密钥并签署其他 LangSmith 服务调用，因此它不得离开 LangSmith 集群。使用外部运行时，如果没有专用值，`langsmith` 图表将拒绝渲染。生成一个，例如使用`openssl rand -hex 32`，并将其设置在控制平面上：

* **图表管理的秘密**：设置`sandboxes.serviceAuth.secret`。它必须与`config.apiKeySalt`不同。
* **`config.existingSecretName`**：将具有新值的密钥添加到您的 Secret 中，并将其命名为 `sandboxes.serviceAuth.secretKey`。不要更改 `api_key_salt` 本身的值：这会使每个现有的 API 密钥失效。要更改正在运行的安装的 service-auth 值，请按照 [Rotate the service-auth secret](#rotate-the-service-auth-secret) 操作。

### 生成回调签名 JWK

如果 `langsmith` 版本还没有回调签名 JWK，请生成一个。在控制平面上将其设置为`sandboxes.callbackSigningJwk`，或者设置为`config.existingSecretName`中的`sandbox_callback_signing_jwk`密钥，并将相同的值复制到运行时Secret中。

要使用 OpenSSL 1.1.1 或更高版本生成 Ed25519 私有 JWK，请运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openssl genpkey -algorithm ED25519 -out callback-signing.pem
d=$(openssl pkey -in callback-signing.pem -outform DER | tail -c 32 | base64 | tr '+/' '-_' | tr -d '=\n')
x=$(openssl pkey -in callback-signing.pem -pubout -outform DER | tail -c 32 | base64 | tr '+/' '-_' | tr -d '=\n')
printf '{"kty":"OKP","crv":"Ed25519","alg":"EdDSA","use":"sig","kid":"sandbox-callback-%s","x":"%s","d":"%s"}\n' "$(openssl rand -hex 8)" "$x" "$d"
rm callback-signing.pem
```

该命令将 JWK 作为一行 JSON 打印。如果 `openssl genpkey` 报告 `Algorithm ED25519 not found`，则您的 `openssl` 是较旧的 LibreSSL 版本。安装 OpenSSL 并使用它运行命令。

## 使用 Helm 安装

首先安装 `langsmith` 版本，然后安装 `langsmith-sandbox` 版本。这些示例使用命名空间 `langsmith-sandbox` 和版本名称 `langsmith-sandbox`。

**1.配置LangSmith版本**

在LangSmith集群中，将沙箱设置添加到`langsmith_config.yaml`，以及[Create the runtime Secret](#create-the-runtime-secret)中描述的回调签名JWK：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  hostname: "langsmith.example.com"

sandboxes:
  enabled: true
  external:
    enabled: true
    # Only when you use the host ingress:
    # hostIngressEndpoint: "https://sandbox-hosts.example.com"
  # Required: a dedicated service-auth value, never api_key_salt. With
  # config.existingSecretName, set serviceAuth.secretKey to its key instead.
  serviceAuth:
    secret: "<random-secret>"
```

对于外部运行时，图表会忽略 `sandboxes.juicefs`、`sandboxes.sandboxHost` 和 `sandboxes.proxyCa`。设置`sandboxes.authProxy.httpProxy`或`sandboxes.juicefs.redis.iamAuthProvider`时渲染失败；在运行时图表中配置这些。

应用图表：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade -i langsmith langchain/langsmith \
  --kube-context <langsmith-context> \
  --namespace <langsmith-namespace> \
  --version <langsmith-chart-version> \
  --values langsmith_config.yaml \
  --wait
```

**2.准备沙箱集群**标记并污染沙箱节点，打开[network paths](#configure-the-network)，然后创建命名空间和[runtime Secret](#create-the-runtime-secret)：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl --context <sandbox-context> create namespace langsmith-sandbox
kubectl --context <sandbox-context> apply -f langsmith-sandbox-runtime-secret.yaml
```

要将 JuiceFS Redis URL 及其密码保留在值文件之外，还可以使用键 `name`、`metaurl`、`storage` 和 `bucket` 创建一个 JuiceFS 配置 Secret，并设置 `juicefs.existingSecretName` 而不是内联 `juicefs` 值。在 Azure 上，`access-key` 保存存储帐户名称。

**3.写入运行时值**

创建`langsmith_sandbox_config.yaml`。将占位符替换为您的值。

> [选项卡] EKS
>
> ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> config:
>   endpoint: "https://langsmith.example.com/api"
>   existingSecretName: "langsmith-sandbox-runtime"
>
> workloadIdentity:
>   provider: aws
>   aws:
>     roleArn: "<role_arn>"
>
> juicefs:
>   name: "sandbox-juicefs"
>   storage: "s3"
>   bucket: "https://bucket-name.s3.us-west-2.amazonaws.com"
>   redis:
>     metaURL: "rediss://<redis-host>:6379/0"
>
> sandboxHost:
>   enabled: true
>   serviceAccount:
>     name: "langsmith-sandbox-host"
>   deployment:
>     nodeSelector:
>       kubernetes.io/arch: "amd64"
>       sandbox.langsmith.com/host: "true"
> ```

> [选项卡] GKE
>
> ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> config:
>   endpoint: "https://langsmith.example.com/api"
>   existingSecretName: "langsmith-sandbox-runtime"
>
> workloadIdentity:
>   provider: gcp
>
> juicefs:
>   name: "sandbox-juicefs"
>   storage: "gs"
>   bucket: "gs://bucket-name"
>   redis:
>     # Memorystore with AUTH. With in-transit encryption, use rediss:// on port 6378.
>     metaURL: "redis://:<auth-string>@<redis-host>:6379/0"
>   # Without local SSD on the node pool, omit hostMount to keep the cache on the
>   # boot disk (/var/cache/juicefs).
>   hostMount:
>     cacheDirs:
>       - "<node-local-ssd-path>/juicefs"
>
> sandboxHost:
>   enabled: true
>   deployment:
>     nodeSelector:
>       kubernetes.io/arch: "amd64"
>       sandbox.langsmith.com/host: "true"
> ```

> [选项卡] AKS
>
> ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> config:
>   endpoint: "https://langsmith.example.com/api"
>   existingSecretName: "langsmith-sandbox-runtime"
>
> workloadIdentity:
>   provider: azure
>   azure:
>     clientId: "<client_id>"
>
> juicefs:
>   name: "sandbox-juicefs"
>   storage: "wasb"
>   bucket: "https://<container>.blob.core.windows.net"
>   storageAccountName: "<storage-account-name>"
>   redis:
>     # Azure Managed Redis with an access key. With Microsoft Entra authentication,
>     # drop the key and set iamAuthProvider: azure.
>     metaURL: "rediss://:<url-encoded-access-key>@<redis-host>:10000/0"
>   hostMount:
>     cacheDirs:
>       - "/mnt/juicefs-cache"
>
> sandboxHost:
>   enabled: true
>   serviceAccount:
>     # Must match the subject of the managed identity's federated credential.
>     name: "langsmith-sandbox-host"
>   deployment:
>     nodeSelector:
>       kubernetes.io/arch: "amd64"
>       sandbox.langsmith.com/host: "true"
> ```

将 `images.sandboxHostImage.tag` 留空。然后，图表运行其 appVersion 的 `sandbox-host` 映像，即与其配对的 LangSmith 版本。

**4.安装运行时图表**

找到最新的 `langsmith-sandbox` 图表，其 appVersion 等于您安装的 `langsmith` 图表的 appVersion：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm repo update
helm search repo langchain/langsmith-sandbox --versions --devel
```

安装确切的版本：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade -i langsmith-sandbox langchain/langsmith-sandbox \
  --kube-context <sandbox-context> \
  --namespace langsmith-sandbox \
  --version <matching-sandbox-chart-version> \
  --values langsmith_sandbox_config.yaml \
  --wait
```

### 使用 Argo CD 或 Flux 安装

将两个版本作为两个应用程序进行管理，每个集群一个：* **顺序**：首先部署 `langsmith` 版本。在 `langsmith` 应用程序同步且运行正常后添加运行时（Flux：HelmRelease 为 `Ready`）。
* **版本**：将 `langsmith-sandbox` 固定到 appVersion 匹配的确切图表版本。切勿在 Flux HelmRelease 中使用范围、`*` 或 `*-0`，也切勿省略 `version`。
* **使用 Argo CD 进行代理 CA**：设置 `proxyCa.mode: existingSecret` 并将 `proxyCa.existingSecretName` 指向您在运行时命名空间中创建的 TLS Secret，使用密钥 `tls.crt` 和 `tls.key`，例如使用您生成的 CA 证书的 `kubectl create secret tls <name> --cert=ca.crt --key=ca.key`。默认的`generatedSecret`模式通过Helm`lookup`重用其CA，Argo CD和其他无需集群访问的渲染工具无法运行，因此每次渲染都会生成一个新的CA。 Flux 在集群中运行 Helm，因此默认模式在那里工作。
* **安装说明**：Argo CD 和 Flux 不显示 Helm 安装说明。注释打印的规则在此页上。
* **返回 Helm CLI**：要停止使用 Flux 管理运行时，请在删除它之前在其 HelmRelease 上设置 `spec.suspend: true`；删除活动的 HelmRelease 会卸载该版本。 Helm 4 在服务器端应用更改，因此第一个 `helm upgrade` 随后失败，并与 Flux 的 `helm-controller` 拥有的字段发生冲突。使用 `--force-conflicts` 运行一次升级。## 验证安装

检查两个版本是否运行相同的 LangSmith 版本。 `APP VERSION` 列必须匹配：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm list --kube-context <langsmith-context> -n <langsmith-namespace> --filter '^langsmith$'
helm list --kube-context <sandbox-context> -n langsmith-sandbox --filter '^langsmith-sandbox$'
```

Argo CD 在不创建 Helm 版本的情况下呈现图表，因此 `helm list` 没有显示 Argo CD 安装的任何内容，或者在 Argo CD 接管之前 Helm 安装的版本的陈旧记录。相反，比较图像标签。两者必须以同一版本结束：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl --context <langsmith-context> -n <langsmith-namespace> get deployment langsmith-platform-backend \
  -o jsonpath='{.spec.template.spec.containers[?(@.name=="platform-backend")].image}{"\n"}'
kubectl --context <sandbox-context> -n langsmith-sandbox get deployment langsmith-sandbox-sandbox-host \
  -o jsonpath='{.spec.template.spec.containers[?(@.name=="sandbox-host")].image}{"\n"}'
```

检查主机是否准备就绪：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl --context <sandbox-context> -n langsmith-sandbox rollout status deployment/langsmith-sandbox-sandbox-host
kubectl --context <sandbox-context> -n langsmith-sandbox get pods
```

然后在[Verify the installation](/langsmith/enable-self-hosted-sandboxes#verify-the-installation)中运行沙箱冒烟测试。如果创建沙箱失败并显示`NoSandboxHostsAvailable`，则控制平面没有就绪的主机。检查沙箱节点是否到达主机用来注册的`config.endpoint`，以及[Configure the network](#configure-the-network)中的其他路径。

当两个版本持有不同的服务身份验证密钥时，会出现相同的错误：LangSmith，并且沙箱主机会拒绝彼此的调用。通过校验和比较两个值，而不打印它们：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl --context <langsmith-context> -n <langsmith-namespace> get secret <langsmith-app-secret> \
  -o jsonpath='{.data.<service-auth-key>}' | base64 -d | openssl dgst -sha256
kubectl --context <sandbox-context> -n langsmith-sandbox get secret langsmith-sandbox-runtime \
  -o jsonpath='{.data.sandbox_service_auth_secret}' | base64 -d | openssl dgst -sha256
````<langsmith-app-secret>` 是图表管理的 Secret（`langsmith-secrets` 对于名为 `langsmith` 的版本）或您的 `config.existingSecretName`，`<service-auth-key>` 是 `sandbox_service_auth_secret` 或 `sandboxes.serviceAuth.secretKey` 命名的密钥。两个校验和必须匹配。更正某个值后，请重新启动在该侧读取该值的 Deployments（如[Rotate the service-auth secret](#rotate-the-service-auth-secret) 中列出），因为当 Secret 数据更改时 Kubernetes 不会重新启动 Pod。之前的秘密设置仅涵盖计划的[rotation](#rotate-the-service-auth-secret)，而不是偏离的值。

## 每次安装运行一个运行时

对于每个 LangSmith 安装，仅运行一个 `langsmith-sandbox` 版本，并且仅当 `langsmith` 版本设置 `sandboxes.external.enabled: true` 时。不支持在同一安装的多个集群中运行沙箱。

LangSmith 一次接受来自一个沙箱运行时的主机报告，将 `langsmith` 版本的嵌入式运行时计为 1。当一个运行时报告时，LangSmith拒绝任何其他运行时：被拒绝的运行时的主机永远不会加入主机池，并且接受的运行时的沙箱继续运行。被拒绝的运行时出现在三个地方：* 它选出的`sandbox-host` Pod 在第一次拒绝报告后约 30 秒变为未就绪，并保持未就绪状态。在第一秒内完成的 `helm install --wait` 或 `kubectl rollout status` 仍然可以报告成功，因此请在一分钟后再次检查 pod。
* 其`sandbox-host`日志重复`the platform refused this sandbox runtime because another runtime already reports to the same LangSmith install`，错误代码为`sandbox_runtime_conflict`，每15秒一次。
* LangSmith 记录 `refused host report from a second sandbox runtime`，包含接受和拒绝运行时的实例 ID。

删除额外的运行时间。一旦接受的运行时在 6 分钟内没有发送报告，LangSmith 就会接受不同的运行时，因此在重新安装或移动到另一个集群后，新的运行时在其主机加入之前最多可以等待 6 分钟。它自行继续。

仅在首次安装沙箱时设置`sandboxes.clusterName`。稍后重命名会隐藏现有沙箱、[private registries](/langsmith/sandbox-snapshots#private-registries) 和主机记录。

## 注意版本不匹配

LangSmith 将其自己的版本与其沙箱托管报告的版本进行比较。当它们分开时，它会在 LangSmith UI 侧边栏中的 **通知** 下警告 [Organization Admins](/langsmith/rbac#organization-admin) 和 [Organization Operators](/langsmith/rbac#organization-operator)：|警告|当它出现时 |
| - | - |
|沙盒运行时落后于LangSmith |在 LangSmith 首次运行新版本 72 小时后，主机仍在运行旧版本。当主机落后两个或多个次要版本时，它会立即显示为错误。未报告发布计数落后的主机。 |
|沙箱运行时比LangSmith更新 |主机已运行比 LangSmith 更新的版本超过 30 分钟。当该版本是较新的次要版本时，它会显示为错误。 |
|沙箱主机推出不完整 |一些主机运行 LangSmith 的版本，但其他主机在 LangSmith 第一次运行较新版本 72 小时后仍然运行旧版本，或者当它们落后两个或更多次要版本时立即运行。如果部署没有进展，请参阅[Diagnose a stalled rollout](/langsmith/self-host-sandbox-operations#diagnose-a-stalled-rollout)。 |
|沙盒主机停止报告 |以前有主机报告过，但现在没有报告。 |除了 **沙盒主机停止报告** 之外，在 LangSmith 转移到新版本后的前 15 分钟内不会出现任何警告，而其自身的推出也已完成。每个警告都会指定要安装的版本。要采取行动，请将 [upgrade](/langsmith/self-host-upgrades#upgrade-separate-sandbox-clusters) `langsmith-sandbox` 版本发布到与您的 `langsmith` 版本配对的图表，或者在主机较新时发布 `langsmith` 版本。忽略警告会将其隐藏 24 小时，或直到版本发生更改。

## 将现有安装移动到单独的集群

要将安装从嵌入式运行时移动到单独的集群，请先切换 `langsmith` 版本，然后针对相同的 JuiceFS 元数据存储和存储桶安装运行时。按照相反的顺序，LangSmith​​[refuses the new runtime](#run-one-runtime-per-installation)，而嵌入式仍然报告。两个步骤之间沙箱不可用。此后，现有的沙箱和快照将继续工作。

**1.准备沙箱集群**遇见[requirements](#check-the-requirements)并打开[network paths](#configure-the-network)。沙箱集群必须到达现有的 JuiceFS Redis 和存储桶，并拥有它们的存储授权。使用专用的服务身份验证密钥和控制平面当前使用的回调签名 JWK 创建 [runtime Secret](#create-the-runtime-secret)。如果控制平面仍然使用`api_key_salt`作为其服务身份验证密钥，则生成一个新值。如果它已经使用了专用值，请保留该值。

**2.复制代理 CA**

从保存的内存恢复的沙箱继续信任它们开始时使用的出口代理 CA。为了让身份验证代理凭据注入继续为它们工作，请使用相同的 CA 运行新的运行时。将代理 CA Secret（默认为`smithbox-proxy-ca`，密钥为`tls.crt`和`tls.key`）复制到沙箱命名空间中，并在运行时值中设置`proxyCa.mode: existingSecret`和`proxyCa.existingSecretName`。在下一步之前复制它，这将删除 `langsmith` 图表生成的 CA Secret：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl --context <langsmith-context> -n <langsmith-namespace> get secret smithbox-proxy-ca -o json \
  | jq '{apiVersion, kind, type, metadata: {name: .metadata.name, namespace: "langsmith-sandbox"}, data: {"tls.crt": .data["tls.crt"], "tls.key": .data["tls.key"]}}' \
  | kubectl --context <sandbox-context> apply -f -
```

**3.切换LangSmith版本**设置 `sandboxes.external.enabled: true`，设置与运行时 Secret 中相同的专用服务身份验证密钥（`sandboxes.serviceAuth.secret`，或在 `sandboxes.serviceAuth.secretKey` 中命名的密钥），然后升级 `langsmith` 版本。保持`sandboxes.clusterName`不变。该版本删除了嵌入式 `sandbox-host` 部署，并且每个主机在关闭时都会挂起其沙箱。耗尽主机首先尝试将每个正在运行的 Sandbox 实时迁移到另一个准备就绪的主机，但在此步骤中没有其他主机准备就绪，因此每个正在运行的 Sandbox 都会暂停。等到旧主机 Pod 消失：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl --context <langsmith-context> -n <langsmith-namespace> wait --for=delete pod \
  -l app.kubernetes.io/component=langsmith-sandbox-host --timeout=15m
```

该标签采用版本名称`langsmith`。使用比主机的 `terminationGracePeriodSeconds` 更长的超时。

**4.安装运行时**

按照 [Install with Helm](#install-with-helm) 的方式安装 `langsmith-sandbox`，其中 `juicefs` 设置指向与之前相同的元数据 Redis URL、存储桶和 `juicefs.name`。 LangSmith 在嵌入式主机停止报告后约 6 分钟接受新的运行时。在此之前，它拒绝新的运行时，并且新主机在启动后不久就变得未准备好，即使 `helm --wait` 已经返回。等到主机准备好，然后[verify the installation](#verify-the-installation)。当用户或 API 操作启动或唤醒已停止的沙箱时，它们会在新主机上重新启动。之后LangSmith集群的KVM节点池不再运行`sandbox-host`。当您不再需要它时，请将其连同 `sandboxes.juicefs.existingSecretName` 中命名的 JuiceFS 配置 Secret（如果您已创建）一起删除。

## 轮换 service-auth 密钥

分三步轮换沙盒服务身份验证密钥。每完成一个步骤后，应用两个版本并等待两个版本完成部署，然后再开始下一个步骤：

1. 在两侧添加新值作为之前的秘密。在`langsmith`图表中，设置`sandboxes.serviceAuth.previousSecret`，或者使用`config.existingSecretName`，添加一个键并将其命名为`sandboxes.serviceAuth.previousSecretKey`。在运行时图表中，为运行时 Secret 添加一个密钥，并将其命名为 `serviceAuth.previousSecretKey`。
2. 在双方上，将新值设置为当前值，将旧值设置为以前的秘密。如果您就地编辑现有 Secret，此步骤不会更改图表值，因此请重新启动读取 Secret 的部署，而不是应用版本。
3. 两边去掉之前的秘密。对于现有 Secret，首先取消设置先前的密钥设置并应用版本，然后从 Secret 中删除该密钥：引用已删除密钥的 Pod 无法启动。

对于嵌入式运行时，每个步骤仅适用于 `langsmith` 版本。当现有 Secret 中的数据发生变化时，Kubernetes 不会重新启动 Pod。就地编辑 Secret 后，重新启动读取它的 Deployment，例如使用 `kubectl rollout restart`。在LangSmith集群中，`<release>-backend`、`<release>-platform-backend`、`<release>-queue`和`<release>-ingest-queue`读取service-auth密钥；在沙盒集群中，`<runtime release>-sandbox-host` 可以。重新启动 `sandbox-host` 会暂停其沙箱，就像滚动升级一样。推出完成后，创建沙盒可能会失败并出现 `No sandbox hosts are available. Retry shortly.` 几秒钟，直到新主机向 LangSmith 报告。

回调签名 JWK 没有 previous-key 设置。保持稳定：在正在运行的安装上更改它会使回调失败，直到双方都使用新值。

## 通过转发代理路由出口

要通过公司转发代理发送沙箱出口，请配置运行时图表而不是 `langsmith` 图表：

* **代理 URL**：将 URL 添加到密钥 `sandbox_egress_proxy_url` 或`authProxy.httpProxy.urlSecretKey` 命名的密钥下的运行时 Secret。 URL 可以携带凭据，因此图表仅从 Secret 中读取它。没有钥匙，沙箱可以直接到达目的地。
* **绕过列表**：设置`authProxy.httpProxy.noProxy`。
* **私有 CA**：对于具有私有 CA 的 HTTPS 代理，请将 CA 添加到`config.customCa`。有关代理要求和行为，请参阅[Route Sandbox egress through a forward proxy](/langsmith/self-host-sandbox-egress-proxy)。

## 卸载

首先卸载运行时版本，然后卸载或重新配置 `langsmith` 版本。主机在关闭时向控制平面报告，因此在控制平面仍在运行时将其删除：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm uninstall langsmith-sandbox --kube-context <sandbox-context> -n langsmith-sandbox --wait
```

这两个图表都不会删除 JuiceFS Redis 或存储桶。它们保存沙箱的持久数据；如果不再需要，请单独删除它们。

## 另请参阅

* [Enable Sandboxes](/langsmith/enable-self-hosted-sandboxes)
* [Sandbox architecture and lifecycle](/langsmith/self-host-sandbox-architecture)
* [Operate self-hosted Sandboxes](/langsmith/self-host-sandbox-operations)
* [Upgrade an installation](/langsmith/self-host-upgrades#upgrade-separate-sandbox-clusters)
* [Release policy](/langsmith/release-versions#pair-the-sandbox-runtime-chart)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-sandbox-separate-cluster.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。