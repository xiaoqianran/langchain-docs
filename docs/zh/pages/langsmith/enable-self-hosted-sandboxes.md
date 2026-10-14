<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Enable Sandboxes on self-hosted LangSmith | https://docs.langchain.com/langsmith/enable-self-hosted-sandboxes -->

# 在自托管 LangSmith 上启用沙箱

为自托管 LangSmith 沙箱配置 Kubernetes 节点、存储和 Helm 值。

[Sandboxes](/langsmith/sandboxes) 为运行代码和公开服务提供隔离环境。当您需要沙箱工作负载或需要它们的功能时安装它们，例如[Engine](/langsmith/engine-self-hosted)。

<Info>
  沙盒需要 [Enterprise](https://langchain.com/pricing) 计划。
</Info>

默认情况下，沙箱处于禁用状态。安装后，请参阅 [LangSmith Sandboxes](/langsmith/sandboxes) 了解 LangSmith UI 和 API 中的用户工作流程。

基础设施模型和生产规划参见[Sandbox architecture](/langsmith/self-host-sandbox-architecture)、[scaling and capacity](/langsmith/self-host-sandbox-scaling)、[upgrades and operations](/langsmith/self-host-sandbox-operations)。

## 支持的平台

自托管沙箱受以下支持：

* 亚马逊弹性 Kubernetes 服务 (EKS)
* 谷歌 Kubernetes 引擎 (GKE)
* Azure Kubernetes 服务 (AKS)
* Red Hat OpenShift，附加步骤见[Configure OpenShift](#configure-openshift)
* 满足[node requirements for bare-metal and on-premises clusters](#node-requirements-for-bare-metal-and-on-premises-clusters)的裸机和本地 Kubernetes 集群

<Note>
  Azure 上的自托管沙盒需要 LangSmith Helm Chart v17 (`0.17.x`)。
</Note>

## 组件

启用沙箱可提供以下资源：* 沙箱运行时 Pod，在支持 KVM 的节点上运行沙箱工作负载。
* 由 Redis 支持的 JuiceFS 元数据存储以及由 S3、GCS 或 Azure Blob 存储支持的对象存储。
* 可选通配符入口用于从沙箱内部公开的服务。

## 先决条件

<Steps>
  <Step title="Install the base LangSmith platform">
    在启用沙箱之前，在 Kubernetes 上安装LangSmith。参见[Self-host LangSmith on Kubernetes](/langsmith/kubernetes)。

    沙箱在与 LangSmith 版本相同的 Kubernetes 集群和命名空间中运行。

    如果您的集群无法从公共注册表中提取，还可以镜像沙箱运行时映像。参见[Additional images for Sandboxes](/langsmith/self-host-mirroring-images#additional-images-for-sandboxes)。
  </Step>

  <Step title="Add KVM-capable nodes">
    您的集群必须包含专用节点，这些节点可以使用 `/dev/kvm` 上提供的 Linux KVM 运行嵌套工作负载。

    这些可以是裸机机器或启用了嵌套虚拟化的受支持的云实例。在 AWS 和 GCP 上，使用将 `/dev/kvm` 暴露给沙箱运行时的 x86\_64 Linux 实例。

    <Warning>
      在 EKS 上，VPC CNI 插件必须是 **v1.21 或更高版本**。 `v1.20.0` 第 8 代崩溃
      Intel实例（例如`m8i`）：`aws-node`进入`CrashLoopBackOff`，节点报告
      `cni plugin not initialized`，受管节点组最终失败并显示
      `NodeCreationFailure: Unhealthy nodes in the kubernetes cluster`。
    </Warning>默认的 Helm 调度值期望这些节点具有以下标签和污点：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    label:
      sandbox.langsmith.com/host: "true"
    taint:
      key: sandbox.langsmith.com/host
      value: "true"
      effect: NoSchedule
    ```

    如果您的节点使用不同的标签或污点，请覆盖 `sandboxes.sandboxHost.deployment.nodeSelector` 和 `sandboxes.sandboxHost.deployment.tolerations`。
  </Step>

  <Step title="Configure JuiceFS storage">
    沙盒需要 JuiceFS 支持的共享存储。您必须提供：

    * 与 Redis 兼容的元数据存储。
    * 对象存储桶或桶根。
    * JuiceFS 配置 Secret，或足够的 Helm 值供图表创建一个。

    将这些对象存储后端用于 `sandboxes.juicefs.storage` 和 `sandboxes.juicefs.bucket`：

    | **平台** | **存储价值** | **桶格式** |
    | - | - | - |
    |亚马逊AWS | `s3` |区域显式 HTTPS S3 端点，例如 `https://bucket-name.s3.us-west-2.amazonaws.com` |
    | GCP | `gs` | GCS URL，例如`gs://bucket-name` |
    |天蓝色| `wasb` | Azure Blob 存储 URL，例如 `https://container-name.core.windows.net` |
    | S3兼容，如MinIO | `s3` |以存储桶为路径的端点 URL，例如 `http://minio.example.com:9000/bucket-name`。需要静态密钥；参见[Use S3-compatible object storage](#use-s3-compatible-object-storage)。 |

    不要在 `sandboxes.juicefs.name` 中使用对象存储子路径。使用简单的名称，例如 `sandbox-juicefs`。 JuiceFS 在配置的存储桶中以该名称存储对象。<Tip>
      对于 Redis 元数据存储，我们建议将 `maxmemory-policy` 设置为 `noeviction`。这可以避免在内存压力下驱逐 JuiceFS 元数据。监控 Redis 容量并在达到内存限制之前对其进行扩展。

      使用`noeviction`，当实例达到最大内存时，Redis 写入可能会失败，因此请为沙箱元数据增长保留足够的内存空间。
    </Tip>
  </Step>

  <Step title="Configure sandbox secrets">
    沙箱需要额外的秘密材料来进行服务间身份验证和回调签名。

    <Tabs>
      <Tab title="Using Kubernetes secrets (recommended)">
        如果您使用 `config.existingSecretName`，请将沙箱密钥添加到相同的 LangSmith 应用程序 Secret。不要直接在 Helm 中设置秘密值。

        ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        stringData:
          sandbox_callback_signing_jwk: '<ed25519-private-jwk>'
          # Optional, only during service-auth secret rotation:
        ```
      </Tab>

      <Tab title="Using inline values">
        如果 Helm 图表管理您的 LangSmith 应用程序密钥，请直接在配置文件中设置沙箱密钥值。避免将此文件提交给版本控制。

        ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        sandboxes:
          callbackSigningJwk: '<ed25519-private-jwk>'
        ```
      </Tab>
    </Tabs>

    回调签名值必须是 Ed25519 私有 JWK。在升级过程中保持稳定。
  </Step>

  <Step title="Choose a proxy CA mode">
    沙箱出口身份验证代理使用此 CA 进行 TLS 拦截和凭证注入。

    该图表支持两种代理 CA 模式：|模式|使用时 |
    | - | - |
    | `generatedSecret` |您希望 Helm 创建一个自签名的 CA Secret。这是默认设置。 |
    | `existingSecret` |您可以在 LangSmith 图表之外管理 CA 秘密。秘密可以由证书管理器或其他外部进程手动创建。 |

    在无需实时集群访问即可渲染清单的 GitOps 工作流程中，首选 `existingSecret`。 `generatedSecret` 模式使用 Helm 的实时 `lookup` 行为在升级时重用生成的 Secret；纯渲染工作流程无法读取实时 Secret，并且可能会在每次渲染上生成新的证书材料。
  </Step>
</Steps>

## 配置 OpenShift

在 Red Hat OpenShift 上，沙箱运行时需要允许特权容器的安全上下文约束 (SCC)。沙盒运行时 Pod 具有主机网络的特权运行，因为它们管理微虚拟机、网络命名空间并在其节点上挂载。其他 LangSmith 组件，包括捆绑的 PostgreSQL、Redis 和 ClickHouse，在默认的 `restricted-v2` SCC 下运行。

要准备 OpenShift 集群，请在 [enable Sandboxes with Helm](#enable-with-helm) 之前完成以下步骤：<Steps>
  <Step title="Add KVM-capable worker nodes">
    使用裸机工作节点或启用了嵌套虚拟化的虚拟机工作节点。要确认节点公开 KVM，请运行：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    oc debug node/<node-name> -- chroot /host ls -l /dev/kvm
    ```

    应用图表期望的标签和污点：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    oc label node <node-name> sandbox.langsmith.com/host=true
    oc adm taint node <node-name> sandbox.langsmith.com/host=true:NoSchedule
    ```

    应用于节点的标签和污点不会转移到替换机器上。要保留它们，请将它们设置在创建沙箱节点的 MachineSet 中的 `spec.template.spec.metadata.labels` 和 `spec.template.spec.taints` 下。
  </Step>

  <Step title="Grant the privileged SCC to the sandbox runtime">
    仅将内置 `privileged` SCC 授予沙箱运行时服务帐户。该图表将此服务帐户命名为 `<release-fullname>-sandbox-host`，对于名为 `langsmith` 的发行版来说，它是 `langsmith-sandbox-host`：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    oc adm policy add-scc-to-user privileged -z langsmith-sandbox-host -n <namespace>
    ```

    JuiceFS 格式化程序作业作为相同的服务帐户运行，因此不需要单独的授权。如果您设置 `sandboxes.sandboxHost.serviceAccount.name`，请将 SCC 授予该名称。
  </Step>
</Steps>

## 裸机和本地集群的节点要求

在托管云集群上，支持 KVM 的节点池满足了这些要求。在裸机和本地 Kubernetes 集群上，请在[enable Sandboxes with Helm](#enable-with-helm)之前确认每个沙箱节点和集群都满足它们。

每个沙箱节点需要：* **CPU 架构**：x86-64 (`amd64`)。沙盒运行时不在 Arm 节点上运行。
* **硬件虚拟化**：在固件中启用虚拟化扩展，加载 KVM 内核模块，并且存在`/dev/kvm`。
* **cgroup v2**：统一的 cgroup 层次结构，具有可用的 `cpu` 控制器。沙箱运行时使用它来强制执行每个沙箱的 CPU 限制。
* **TUN/TAP 和 FUSE**：`/dev/net/tun` 用于沙盒网络接口，`/dev/fuse` 用于 JuiceFS 安装。
* **nftables**：nftables 后端对 `iptables` 的内核支持。沙箱运行时在每个沙箱的网络命名空间内应用其出口规则。
* **JuiceFS 缓存的本地磁盘**：`sandboxes.juicefs.hostMount.cacheDirs` 的节点本地路径，默认为 `/var/cache/juicefs`，缓存大小为 50 GiB。

集群需要：* **特权 Pod**：沙盒运行时 Pod 以特权运行，具有主机网络和 `hostPath` 卷。如果您的集群强制执行 Pod 安全准入，请标记 LangSmith 命名空间以允许特权 Pod，例如 `pod-security.kubernetes.io/enforce=privileged`。
* **节点端口可达性**：LangSmith平台后端通过TCP端口`19190`连接到每个沙箱节点。允许从 LangSmith Pod 到沙箱节点的流量，并将端口保留在专用网络上。
* **出站访问**：沙箱节点需要对 JuiceFS Redis 元数据存储、对象存储后端以及沙箱调用的目的地进行网络访问。要通过公司 HTTP 代理发送沙箱出口，请设置 `sandboxes.authProxy.httpProxy`。

如果您的集群无法从公共注册表中提取，请镜像沙箱运行时映像。欲了解更多信息，请参阅[Additional images for Sandboxes](/langsmith/self-host-mirroring-images#additional-images-for-sandboxes)。

### 使用 S3 兼容的对象存储

在没有云工作负载身份的集群上，JuiceFS 可以使用静态访问密钥将沙箱数据存储在 S3 兼容的对象存储中，例如 MinIO。

<Note>
  具有静态密钥的 S3 兼容对象存储需要 LangSmith 应用程序版本 0.17.35 或更高版本。
</Note>

创建一个包含访问密钥的 JuiceFS 配置 Secret，并将 `sandboxes.juicefs.existingSecretName` 设置为其名称：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
apiVersion: v1
kind: Secret
metadata:
  name: langsmith-sandbox-juicefs
  namespace: <namespace>
type: Opaque
stringData:
  name: sandbox-juicefs
  metaurl: redis://<redis-host>:6379/1
  storage: s3
  bucket: http://<s3-endpoint>:9000/<bucket-name>
  access-key: <access-key>
  secret-key: <secret-key>
```仅当 Secret 同时包含 `access-key` 和 `secret-key` 时，JuiceFS 格式化程序才使用密钥。 JuiceFS 将密钥存储在其 Redis 元数据存储中，因此限制对该 Redis 实例的访问。

对象存储必须维持沙箱运行时的写入吞吐量。当对象存储写入停止时，JuiceFS 挂载运行状况检查失败，并且沙箱运行时 Pod 重新启动，这会中断该节点上的沙箱。

## 使用 Helm 启用

通过直接设置 Helm 值来启用沙箱，如本节所示。在 AWS 和 GCP 上，您可以改为使用 [enable Sandboxes with Terraform](#enable-with-terraform)，它会配置基础设施并生成 Helm 值。

将以下值以及 [Prerequisites](#prerequisites) 中描述的沙箱秘密值添加到您的 `langsmith_config.yaml` 中。将占位符替换为特定于部署的值。

<Note>
  这些值的目标图表为 0.17。在图表 0.16 上，沙箱通过捆绑的 JuiceFS CSI 驱动程序挂载 JuiceFS，因此值有所不同：

  * 在`sandboxes.juicefs.csi.node.serviceAccount.annotations`而不是`sandboxes.sandboxHost.serviceAccount.annotations`上设置工作负载身份注释。
  * 使用 `sandboxes.juicefs.csi.existingSecretName` 而不是 `sandboxes.juicefs.existingSecretName` 设置现有的配置 Secret。
  * 省略`juicefsFormatJob`。图 0.16 不支持沙箱的 Azure Blob 存储。当您从图表 0.16 升级到 0.17 时，首先耗尽 JuiceFS 卷，然后从您的值中删除 `sandboxes.juicefs.csi` 块。步骤请参见[Upgrade an installation](/langsmith/self-host-upgrades)。
</Note>

<Tabs>
  <Tab title="AWS">
    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    images:
      sandboxHostImage:
        tag: "<same-release-tag-as-your-langsmith-images>"

    sandboxes:
      enabled: true
      juicefs:
        name: "sandbox-juicefs"
        storage: "s3"
        bucket: "https://bucket-name.s3.us-west-2.amazonaws.com"
        redis:
          metaURL: "redis://redis-host:6379/1"
      sandboxHost:
        deployment:
          nodeSelector:
            kubernetes.io/arch: "amd64"
            sandbox.langsmith.com/host: "true"
        serviceAccount:
          annotations:
            eks.amazonaws.com/role-arn: "<role_arn>"
    ```
  </Tab>

  <Tab title="GCP">
    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    images:
      sandboxHostImage:
        tag: "<same-release-tag-as-your-langsmith-images>"

    sandboxes:
      enabled: true
      juicefs:
        name: "sandbox-juicefs"
        storage: "gs"
        bucket: "gs://bucket-name"
        redis:
          metaURL: "redis://redis-host:6379/1"
      sandboxHost:
        deployment:
          nodeSelector:
            kubernetes.io/arch: "amd64"
            sandbox.langsmith.com/host: "true"
        serviceAccount:
          annotations:
            iam.gke.io/gcp-service-account: "<gsa_name>@<project_id>.iam.gserviceaccount.com"
    ```

    在 GKE 上，`sandbox-host` 在主机网络上运行，并且 GKE 不会向主机网络 Pod 提供工作负载身份，因此注释仅服务于 `juicefs-format` 作业。同时在存储桶上授予沙箱节点池的服务账户`roles/storage.objectAdmin`，IAM 条件仅限于 JuiceFS 前缀：`sandbox-juicefs/` 下的对象并列出具有该前缀的调用。如果没有该授权，JuiceFS 装载会从 Cloud Storage 获取 403。
  </Tab>

  <Tab title="Azure">
    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    images:
      sandboxHostImage:
        tag: "<same-release-tag-as-your-langsmith-images>"

    sandboxes:
      enabled: true
      juicefs:
        name: "sandbox-juicefs"
        storage: "wasb"
        bucket: "https://container-name.core.windows.net"
        storageAccountName: "<storage-account-name>"
        redis:
          metaURL: "redis://redis-host:6379/1"
      juicefsFormatJob:
        labels:
          azure.workload.identity/use: "true"
      sandboxHost:
        deployment:
          labels:
            azure.workload.identity/use: "true"
          nodeSelector:
            kubernetes.io/arch: "amd64"
            sandbox.langsmith.com/host: "true"
        serviceAccount:
          annotations:
            azure.workload.identity/client-id: "<client_id>"
    ```
  </Tab>
</Tabs>

应用更新后的图表：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade -i langsmith langchain/langsmith \
  --values langsmith_config.yaml \
  --version <version> \
  --namespace <namespace> \
  --wait
```

## 使用 Terraform 启用

<div>
  LangSmith Terraform 模块可以配置所需的 AWS 和 GCP 基础设施并生成相应的 Helm 值。

  <Tabs>
    <Tab title="AWS">
      在`modules/aws/infra/terraform.tfvars`中，启用沙箱并配置沙箱节点容量：

      ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      enable_sandboxes = true
      redis_source     = "external"

      sandbox_juicefs_redis_instance_type             = "cache.m6g.large"
      sandbox_juicefs_redis_snapshot_retention_limit  = 7

      sandbox_host_node_count               = 1
      sandbox_host_instance_types           = ["m5d.metal"]
      sandbox_host_configure_instance_store = true

      sandbox_host_image_tag = "<same-release-tag-as-your-langsmith-images>"
      ```

      AWS 沙盒需要 `redis_source = "external"`。 Terraform 模块：* 为 JuiceFS 沙箱元数据创建专用的 ElastiCache Redis 实例。
      * 使用推荐的 `noeviction` 策略配置该专用实例。
      * 重用LangSmith S3 存储桶进行沙箱对象存储。
      * 创建 JuiceFS 配置 Secret。
      * 添加预期的节点标签和污点。

      AWS 设置脚本通过正常的 SSM 支持的设置流程生成沙箱服务身份验证密钥、回调签名 JWK 和专用 JuiceFS Redis 身份验证令牌。如果这些值尚不存在，请在应用 Terraform 之前运行基础设施设置脚本。

      如果您使用 Terraform 应用程序模块部署 Helm 版本，还要在 `modules/aws/app/terraform.tfvars` 中设置沙箱应用程序值：

      ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      enable_sandboxes      = true
      chart_version          = "~0.17.0"
      sandbox_host_image_tag = "<same-release-tag-as-your-langsmith-images>"
      ```

      当`enable_sandboxes = true`时，Terraform应用程序模块需要显式的LangSmithHelm图表v17版本和沙箱运行时图像标签。

      运行正常的 AWS 流程：

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      make apply
      make init-values
      CHART_VERSION="~0.17.0" make deploy
      ```
    </Tab>

    <Tab title="GCP">
      在 `modules/gcp/infra/terraform.tfvars` 中，启用沙盒并配置标准 GKE 节点池：

      ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      enable_sandboxes = true
      redis_source     = "external"

      gke_use_autopilot     = false
      enable_gcp_iam_module = true

      sandbox_juicefs_redis_memory_size       = 5
      sandbox_juicefs_redis_high_availability = true

      sandbox_host_node_count     = 1
      sandbox_host_min_node_count = 1
      sandbox_host_max_node_count = 5
      sandbox_host_machine_type   = "n2-standard-8"

      sandbox_host_image_tag = "<same-release-tag-as-your-langsmith-images>"
      ```

      GCP 沙盒需要 `redis_source = "external"`。 Terraform 模块：* 为 JuiceFS 沙箱元数据创建专用的 Memorystore Redis 实例。
      * 使用推荐的 `noeviction` 策略配置该专用实例。
      * 重用LangSmith GCS 存储桶进行沙箱对象存储。
      * 创建 JuiceFS 配置 Secret。
      * 添加预期的节点标签和污点。

      GCP 设置脚本通过正常的 Secret Manager 设置流程生成沙箱服务身份验证密钥和回调签名 JWK。如果这些值尚不存在，请在应用 Terraform 之前运行基础设施设置脚本。

      如果您使用 Terraform 应用程序模块部署 Helm 版本，还要在 `modules/gcp/app/terraform.tfvars` 中设置沙箱应用程序值：

      ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      enable_sandboxes      = true
      chart_version          = "~0.17.0"
      sandbox_host_image_tag = "<same-release-tag-as-your-langsmith-images>"
      ```

      当`enable_sandboxes = true`时，Terraform应用程序模块需要显式的LangSmithHelm图表v17版本和沙箱运行时图像标签。

      运行正常的 GCP 流程：

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      make apply
      make init-values
      CHART_VERSION="~0.17.0" make deploy
      ```
    </Tab>
  </Tabs>
</div>

## 可选：启用服务 URL

当用户需要浏览器或编程访问沙箱内运行的 HTTP 服务时，请设置`sandboxes.serviceUrlBaseUrl`。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sandboxes:
  serviceUrlBaseUrl: "https://sandbox-services.example.com"
```

这需要 `*.sandbox-services.example.com` 的通配符 DNS 和 TLS。当 `ingress.enabled` 为 `true` 时，图表还添加通配符入口规则，将这些服务 URL 路由到 LangSmith 平台后端。服务 URL 还需要 Ed25519 私有 JWKS，其第一个密钥上具有非空 `kid`。设置`config.signingJwks`，或将`langsmith_signing_jwks`添加到您的[existing LangSmith app Secret](/langsmith/self-host-using-an-existing-secret)。这与 `sandboxes.callbackSigningJwk` 是分开的。密钥生成说明请参见[Configure a signing JWKS](/langsmith/langsmith-remote-mcp#enabling-remote-mcp)。

服务 URL 是 [build and edit custom apps with chat](/langsmith/custom-apps#configure-self-hosted-chat) 所必需的，尽管它们对于其他沙箱工作流程是可选的。

## 可选：通过转发代理路由出口

当沙箱必须通过企业 HTTP 或 HTTPS 转发代理访问互联网时，设置`sandboxes.authProxy.httpProxy`。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sandboxes:
  authProxy:
    httpProxy:
      url: http://proxy.corp.internal:3128
```

有关要求、绕过列表、代理身份验证、HTTPS 代理的 CA 信任以及安全注意事项，请参阅[Route Sandbox egress through a forward proxy](/langsmith/self-host-sandbox-egress-proxy)。

## 验证安装

升级完成后，验证沙盒运行时 Pod 和 JuiceFS 卷是否已准备就绪：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl rollout status deployment/sandbox-host -n <namespace>
kubectl get pods,pvc -n <namespace>
```

然后运行沙箱冒烟测试：

1. 从公共镜像（例如 Python 镜像）创建沙箱。
2. 在沙箱内启动Python HTTP 服务器。
3. 在启用内存的情况下对沙箱进行快照。
4. 从快照创建一个新的沙箱。
5. 验证 HTTP 服务器是否仍在恢复的沙箱中运行。

## 升级注意事项沙盒运行时映像更改通过 `sandbox-host` Kubernetes 部署推出。该图表默认使用无浪涌滚动更新策略，因此一次更换一台主机。

在正常的 Helm 升级期间，终止主机停止接受新的 Sandbox，尝试将每个正在运行的 Sandbox 的 VM 内存保存到 JuiceFS，然后在 pod 退出之前停止这些 VM。此关闭受 `sandbox-host` Pod 终止宽限期限制，默认为 300 秒。这不是实时迁移：该主机上的沙箱在重新启动期间会中断。

沙箱不会主动重新启动。当用户或 API 操作启动沙箱或请求路径唤醒沙箱时，它们会再次启动。然后，LangSmith 将沙盒放置在可用主机上，并在关闭捕获完成时从保存的内存映像中恢复。如果内存映像不存在或不完整，沙盒将从保存的根文件系统启动。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/enable-self-hosted-sandboxes.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>