<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Enable Sandboxes on self-hosted LangSmith | https://docs.langchain.com/langsmith/enable-self-hosted-sandboxes -->

# 在自托管 LangSmith 上启用沙箱

为自托管 LangSmith 沙盒配置 Kubernetes 节点、存储和 Helm 值。

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

<Note>
  Azure 上的自托管沙盒需要 LangSmith Helm Chart v17 (`0.17.x`)。
</Note>

## 组件

启用沙箱可提供以下资源：

* 沙箱运行时 Pod，在支持 KVM 的节点上运行沙箱工作负载。
* 由 Redis 支持的 JuiceFS 元数据存储以及由 S3、GCS 或 Azure Blob 存储支持的对象存储。
* 可选通配符入口用于从沙箱内部公开的服务。

## 先决条件<Steps>
  <Step title="Install the base LangSmith platform">
    在启用沙箱之前，在 Kubernetes 上安装LangSmith。参见[Self-host LangSmith on Kubernetes](/langsmith/kubernetes)。

    沙盒在与 LangSmith 版本相同的 Kubernetes 集群和命名空间中运行。

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
    </Warning>

    默认的 Helm 调度值期望这些节点具有以下标签和污点：

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
    沙盒需要 JuiceFS 支持的共享存储。您必须提供：* 与 Redis 兼容的元数据存储。
    * 对象存储桶或桶根。
    * JuiceFS 配置 Secret，或足够的 Helm 值供图表创建。

    将这些对象存储后端用于 `sandboxes.juicefs.storage` 和 `sandboxes.juicefs.bucket`：

    | **平台** | **存储价值** | **桶格式** |
    | - | - | - |
    |亚马逊AWS | `s3` |区域显式 HTTPS S3 端点，例如 `https://bucket-name.s3.us-west-2.amazonaws.com` |
    | GCP | `gs` | GCS URL，例如`gs://bucket-name`|
    |天蓝色| `wasb` | Azure Blob 存储 URL，例如 `https://container-name.core.windows.net` |

    不要在 `sandboxes.juicefs.name` 中使用对象存储子路径。使用简单的名称，例如 `sandbox-juicefs`。 JuiceFS 在配置的存储桶中以该名称存储对象。

    <Tip>
      对于 Redis 元数据存储，我们建议将 `maxmemory-policy` 设置为 `noeviction`。这可以避免在内存压力下驱逐 JuiceFS 元数据。监控 Redis 容量并在达到内存限制之前对其进行扩展。

      使用`noeviction`，当实例达到最大内存时，Redis 写入可能会失败，因此请为沙箱元数据增长保留足够的内存空间。
    </Tip>
  </Step>

  <Step title="Configure sandbox secrets">
    沙箱需要额外的秘密材料来进行服务间身份验证和回调签名。<Tabs>
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

    该图表支持两种代理 CA 模式：

    |模式|使用时 |
    | - | - |
    | `generatedSecret` |您希望 Helm 创建一个自签名的 CA Secret。这是默认设置。 |
    | `existingSecret` |您在 LangSmith 图表之外管理 CA 秘密。秘密可以由证书管理器或其他外部进程手动创建。 |在无需实时集群访问即可渲染清单的 GitOps 工作流程中，首选 `existingSecret`。 `generatedSecret` 模式使用 Helm 的实时 `lookup` 行为在升级时重用生成的 Secret；纯渲染工作流程无法读取实时 Secret，并且可能会在每次渲染上生成新的证书材料。
  </Step>
</Steps>

## 使用 Helm 启用

通过直接设置 Helm 值来启用沙箱，如本节所示。在 AWS 和 GCP 上，您可以改为使用 [enable Sandboxes with Terraform](#enable-with-terraform)，它会配置基础设施并生成 Helm 值。

将以下值以及 [Prerequisites](#prerequisites) 中描述的沙箱秘密值添加到您的 `langsmith_config.yaml` 中。将占位符替换为特定于部署的值。

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

      AWS 沙箱需要 `redis_source = "external"`。 Terraform 模块：* 为 JuiceFS 沙箱元数据创建专用的 ElastiCache Redis 实例。
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

这需要 `*.sandbox-services.example.com` 的通配符 DNS 和 TLS。当`ingress.enabled`为`true`时，图表还添加通配符入口规则，将这些服务URL路由到LangSmith平台后端。服务 URL 还需要 Ed25519 私有 JWKS，其第一个密钥上具有非空 `kid`。设置`config.signingJwks`，或将`langsmith_signing_jwks`添加到您的[existing LangSmith app Secret](/langsmith/self-host-using-an-existing-secret)。这与 `sandboxes.callbackSigningJwk` 是分开的。密钥生成说明请参见[Configure a signing JWKS](/langsmith/langsmith-remote-mcp#enabling-remote-mcp)。

服务 URL 是 [build and edit custom apps with chat](/langsmith/custom-apps#configure-self-hosted-chat) 所必需的，尽管它们对于其他沙箱工作流程是可选的。

## 验证安装

升级完成后，验证沙箱运行时 Pod 和 JuiceFS 卷是否已准备就绪：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl rollout status deployment/sandbox-host -n <namespace>
kubectl get pods,pvc -n <namespace>
```

然后运行沙箱冒烟测试：

1. 从公共镜像（例如Python镜像）创建沙箱。
2. 在沙箱内启动Python HTTP 服务器。
3. 在启用内存的情况下对沙箱进行快照。
4. 从快照创建一个新的沙箱。
5. 验证 HTTP 服务器是否仍在恢复的沙箱中运行。

## 升级注意事项

沙盒运行时映像更改通过 `sandbox-host` Kubernetes 部署推出。该图表默认使用无浪涌滚动更新策略，因此一次更换一台主机。在正常的 Helm 升级期间，终止主机停止接受新的 Sandbox，尝试将每个正在运行的 Sandbox 的 VM 内存保存到 JuiceFS，然后在 pod 退出之前停止这些 VM。此关闭受 `sandbox-host` Pod 终止宽限期限制，默认为 300 秒。这不是实时迁移：该主机上的沙箱在重新启动期间会中断。

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