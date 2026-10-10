<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Engine on Self-hosted | https://docs.langchain.com/langsmith/engine-self-hosted -->

# LangSmith 自托管引擎

在自托管 LangSmith 实例上设置 LangSmith 引擎，包括模型提供程序选项和外部网络要求。

<Info>
  自承载引擎需要 LangSmith Helm 图表 `0.16.0` 或更高版本以及包含引擎权利的许可证。它在早期图表版本中不可用。 [Contact our sales team](https://www.langchain.com/contact-sales) 将权利添加到您的订单中。

  在 [your own model providers](#your-own-model-providers) 和 [air-gapped installations](#air-gapped-installations) 上运行引擎需要 LangSmith Helm 图表 `0.17.0` 或更高版本。早期的图表版本仅在 [LangSmith Intelligence](#langsmith-intelligence) 上运行引擎。
</Info>

LangSmith引擎是LangSmith中的一个代理，它监视您的生产跟踪，将它们聚集成问题，根据源代码诊断每个问题，提出修复作为PR，并识别地面真实评估以添加到您的数据集。有关产品概述，请参阅[Engine](/langsmith/engine-overview)。

在自托管 LangSmith 中，引擎的分析和修复工作流程在您的环境中运行。组织管理员选择引擎模型调用的运行位置：* **LangSmith 智能 (LSI)：** LangChain 托管的零数据保留 (ZDR) 服务，可为您运行 Engine 模型。
* **您自己的模型提供商：** Anthropic、OpenAI、Amazon Bedrock、Google Vertex AI 或 Azure AI Foundry，以及您控制的凭证或云身份。

引擎将使用情况元数据报告给LangSmith智能进行计费，除非您的安装是[air-gapped](#air-gapped-installations)。

此页面涵盖模型提供程序、数据处理和安装。要让引擎访问源代码，还需[configure a GitHub App](/langsmith/engine-github#self-hosted-configuration)。 GitHub 是可选的跟踪分析。

<Note>
  红队和自动问题验证在自托管 LangSmith 上不可用。您可以在没有这些功能的情况下调查问题、生成修复程序并打开 PR。
</Note>

引擎使用两种数据：

* **代码**（可选）**：** 您的代理的来源，引擎读取该来源以诊断问题并提出修复建议。
* **跟踪：** 来自代理的运行时数据，其中可以包括用户消息、工具输出和 PII。

为了诊断问题、生成修复程序并编写评估器，引擎将所需的部分数据发送到其模型（在[LangSmith Intelligence or your own model providers](#choose-how-engine-runs-its-models)）。

## 选择引擎运行模型的方式每个组织都可以在**设置 > 引擎 > 模型提供程序**下选择引擎运行其模型的方式。

| | **LangSmith智能** | **您自己的模型提供商** |
| - | - | - |
| **谁运行模型** | LangChain，及其选择的提供商 |您的提供商帐户 |
| **凭证** |没有任何。引擎使用您的 LangSmith 许可证进行身份验证。 |您提供的 API 密钥或云身份 |
| **型号选择** |由LangChain管理和调整|由 LangChain 管理，在您的提供商提供的型号系列中 |
| **数据处理协议** | LangChain，每个提供商都有 ZDR |您的，与您使用的每个提供商一起|
| **计费** | LangChain 对 LSU 中引擎的使用情况进行计费。 |您的提供商会向您收取模型调用费用。 LangChain 对 LSU 中的 Engine 使用情况进行计费，费率低于LangSmith Intelligence。 |
| **可用性** | AWS 美国 |任何云，以及您的集群可以访问的受支持模型和端点 |

对于LangSmith其他云或区域的智能，[contact our sales team](https://www.langchain.com/contact-sales)。

<Columns>
  <Frame>
    <img alt="Architecture diagram of self-hosted LangSmith in your VPC connected to LangSmith Intelligence and Bedrock in LangChain's AWS environment." />
  </Frame>

  <Frame>
    <img alt="Architecture diagram of self-hosted LangSmith in your VPC sending model inference to your model providers and usage metadata to LangChain's cloud." />
  </Frame>
</Columns>

### LangSmith 情报LSI 是运行 Engine 模型的LangChain 托管服务。引擎将其模型请求发送到 `https://beacon.aws.langchain.com/intelligence`，并使用您的 LangSmith 许可证进行身份验证，因此您无需提供模型提供者凭据。每个请求都携带引擎完成其工作所需的跟踪内容、代码和中间输出。

引擎使用不同的模型，每个模型都针对其角色进行了调整，以集群问题、根据代码诊断根本原因、生成修复程序并编写验证它们的评估器。 LangChain 调整这些模型的质量和代币效率，并随着更好的模型可用而更新它们。

您的集群必须允许到该网关的出站 HTTPS。连接可以使用公共出口或专用连接。要使引擎流量保持在专用网络上，请遵循[Connect with AWS PrivateLink](#connect-with-aws-privatelink)。

如果与 LSI 的连接不可用，引擎将停止并返回错误。 LangSmith 部署的其余部分不受影响，并且引擎会再次尝试进行下一次计划扫描。

### 您自己的模型提供商

引擎直接从您的集群调用您的提供程序。根据您与提供商的协议，提示和响应仅发送给您的提供商。 LangChain 没有收到。Engine 的沙盒使用情况包含在 Engine 的 LSU 计费中。沙箱引擎用于诊断问题、生成修复程序和编写评估程序不会产生额外的沙箱产品费用。

引擎支持Anthropic、OpenAI、Amazon Bedrock、Google Vertex AI 和 Azure AI Foundry。它使用您选择的提供商的混合模型，因此为了获得最佳结果，请为您有权访问的每个提供商添加凭据。

在您的提供商帐户中允许访问 Anthropic 的 Claude 模型和 OpenAI 的 GPT 模型（您的提供商在其中提供这些模型）。在 Azure 上，使用 Azure AI Foundry 资源。要确认 Engine 可以访问它使用的模型，请运行 [**Test connection**](#test-a-provider)。

## 引擎处理和存储数据的位置

在自托管部署中，引擎将您的环境和 LangChain 之间的数据处理分开：* **您的环境：** 引擎编排和LangSmith存储的跟踪保留在您的自托管环境中。
* **LangChain的环境，具有LangSmith智能：** LSI和模型提供者处理Engine发送的内容。 LSI 仅保留[usage metadata](#what-langsmith-intelligence-retains)。
* **您的模型提供商以及您自己的提供商：** 您的提供商根据您与他们的协议处理引擎发送的内容。 LangChain 仅接收[usage metadata](#what-langsmith-intelligence-retains)。

如果您启用外部通知，引擎还会将通知内容发送到您配置的 Slack 通道或 Webhook 端点。有关 Slack 应用程序设置和发送到 Slack 的内容，请参阅 [Connect self-hosted LangSmith to Slack](/langsmith/self-host-slack)。

### LangSmith 情报保留了什么

LSI 不会保留提示或模型响应的内容。它保留以下元数据用于使用归因和计费：

* 用于归因使用情况的帐户、工作区和项目标识符。
* 用于计费的模型和令牌使用元数据。

当 Engine 在您自己的模型提供程序上运行时，这些元数据都是 LSI 接收的。您的自托管LangSmith记录引擎的使用情况，并每小时向[⟦T19⟧](#allow-egress-to-langsmith-intelligence)中的端点报告，并使用您的许可证进行身份验证。对于LangChain管理的推理，模型提供商保留和培训承诺在[Engine security](/langsmith/engine-security#model-subprocessors)中描述。当您使用自己的提供商时，他们的保留和培训政策取决于您与他们的协议。

## 安装引擎

默认情况下禁用引擎。它需要 [Sandboxes](/langsmith/enable-self-hosted-sandboxes)、与 [LangSmith Intelligence](#allow-egress-to-langsmith-intelligence) 的连接，除非您的安装是 [air-gapped](#air-gapped-installations)、外部可访问的 [⟦T20⟧](#verify-your-hostname-is-externally-reachable) 和 [Engine's keys](#generate-engines-keys)。在启用引擎之前完成先决条件。

引擎和 [Insights](/langsmith/self-host-insights-chat) 从同一映像运行并共享一个部署。 Engine 不需要 Insights。如果您的安装已运行 Insights，则启用 Engine 会添加配置而不是新 Pod。

### 组件

启用引擎配置或重用：

* `standalone-insights-api-server`：同时服务于`engine`和`insights`图表。
* `standalone-insights-queue`：Engine 和 Insights 的后台运行处理。
* 用于共享部署的专用 PostgreSQL 和 Redis 实例，每个实例都可以替换为外部实例。
* [Enable Sandboxes](/langsmith/enable-self-hosted-sandboxes) 下描述的沙箱组件。

引擎还向`platform-backend`和`ingest-queue`添加了配置，用于调度和安排其运行。

### 先决条件

<Steps>
  <Step title="Enable Sandboxes">
    首先完成[Enable Sandboxes](/langsmith/enable-self-hosted-sandboxes)，包括支持KVM的节点池和JuiceFS存储。引擎的沙箱与一个工作区相关联。带有引擎的安装必须有[shared organization](/langsmith/administration-overview#organizations)。如果共享组织只有一个工作区，则 LangSmith 使用该工作区。如果共享组织有多个工作区，LangSmith 不会自动选择一个。您必须将 `engine.sandboxTenantId` 设置为工作区 ID。

    <Warning>
      使用为引擎保留的工作区：

      * Engine 的沙箱不在 Sandboxes 产品中计费，因为 Engine 会计量自己在 LSU 中的使用情况。
      * 引擎的沙箱使用与工作区中其他沙箱相同的并发沙箱、CPU 和内存配额。如果工作区接近其限制，引擎运行可能会失败或为交互式沙箱留下的容量较少。
      * 引擎的沙箱列在该工作区中，任何有权访问它的人都可以停止。
      * 每个沙箱都运行代理生成的代码。
      * 存储库凭据保留在沙箱身份验证代理中，并且不可用于沙箱内运行的代码。
    </Warning>
  </Step><Step title="Confirm the license entitlement">
    引擎是单独许可的，与沙盒相同。您的许可证必须包含引擎权利。 LangSmith 在启动时根据 `https://beacon.langchain.com` 验证您的许可证密钥，并在此后定期验证，因此，一旦将其添加到订单中，您无需更改任何配置，即可生效。
  </Step>

  <Step title="Allow egress to LangSmith Intelligence and your model providers">
    设置 `engine.intelligenceBaseUrl` 引擎如何运行其模型，并允许从集群到该 URL 的出站 HTTPS：

    | **引擎运行其模型** | **`engine.intelligenceBaseUrl`** |
    | - | - |
    | LangSmith 智能 | `https://beacon.aws.langchain.com/intelligence` |
    |您自己的模型提供商 | `https://beacon.langchain.com/intelligence`（默认）|
    |您自己的模型提供商，气隙 | `""`（参见[Air-gapped installations](#air-gapped-installations)）|

    AWS URL 还记录使用情况，因此它适用于采用任一选项的组织。默认 URL 仅记录使用情况，在自托管 LangSmith 已用于许可证验证和计费遥测的同一主机上，因此它添加了一条路径而不是新的出口目的地。

    如果引擎将在您自己的模型提供程序上运行，还允许从 `standalone-insights` pod 到每个提供程序的 API 端点的出站 HTTPS。要将该流量保留在专用网络上，请参阅[Connect to your providers privately](#connect-to-your-providers-privately)。将每个目的地添加为特定的允许列表条目，而不是打开一般出口。为了将流量保持在LangSmith专用网络上的智能，[connect with AWS PrivateLink](#connect-with-aws-privatelink)。向 LangSmith Intelligence 发出的请求使用在 LangSmith 许可证验证期间获得的短期许可证 JWT。引擎的流量与[Configure egress](/langsmith/self-host-egress)中描述的计费和操作遥测是分开的，即使它共享主机。
  </Step>

  <Step title="Verify your hostname is externally reachable">
    引擎的沙箱使用 `langsmith` CLI 调用您的 LangSmith 安装，因此 `config.hostname` 必须可从沙箱网络访问。 Helm 验证拒绝 `localhost` 和集群内 `*.svc` 地址。

    使用 TLS 通过您的入口提供该主机名，如 [Set up an ingress](/langsmith/self-host-ingress) 中所述。引擎的沙箱网络策略允许访问您的 LangSmith 主机名、配置的 GitHub 主机和 Python 包注册表。每次运行的凭据由沙箱外部的代理注入，而不是在沙箱内部可读。

    对于 GitHub 连接，还允许您的 GitHub 环境所需的 [outbound requests and inbound webhooks](/langsmith/engine-github#allow-network-access)。仅通过浏览器访问 LangSmith 并不能与 GitHub 建立 Webhook 连接。
  </Step>

  <Step title="Generate Engine's keys">
    引擎需要自己的两个密钥：* **加密密钥** (`engine_encryption_key`)：对传递给引擎的运行负载LangSmith进行加密的 Fernet 密钥，该引擎携带短期凭证。

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
      ```

    * **使用签名秘密** (`engine_usage_signing_secret`)：对引擎发送到LangSmith的使用报告进行签名。使用至少 32 个随机字符。

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      openssl rand -hex 32
      ```

    在安装或升级图表之前，将两者存储在预定义的 Kubernetes Secret 中。参见[Use an existing secret](/langsmith/self-host-using-an-existing-secret#parameters)。当 Helm 可以从集群中读取现有 Secret 时，图表会检查这两个密钥并命名任何缺失的密钥。 `helm template` 和 GitOps 渲染会跳过该查找，因此请验证密钥是否单独存在。

    要轮换加密密钥，请将当前值复制到 `engine_encryption_key_previous` 并将新密钥设置为 `engine_encryption_key`。之前的密钥仅用于解密，因此在交换完成之前以加密方式运行。

    引入或轮换使用签名密钥时，请暂停新的引擎工作并等待运行扫描完成。更新 `platform-backend`、`ingest-queue` 以及共享引擎和 Insights API 服务器和队列以使用相同的签名密钥。当所有四个组件都正常后，恢复引擎和[verify an analysis and Engine usage](#verify-the-installation)。以前的加密密钥不提供使用签名的后备。
  </Step>
</Steps>### 使用 Helm 启用

将以下内容添加到您的 [⟦T46⟧](/langsmith/kubernetes#configure-your-helm-charts) 以及 [Enable Sandboxes](/langsmith/enable-self-hosted-sandboxes) 中的完整沙盒值。这些示例仅显示特定于引擎的值和 `sandboxes.enabled` 标志。

<Tabs>
  <Tab title="Using Kubernetes secrets (recommended)">
    按名称引用您现有的 Secret。图表从中读取 `engine_encryption_key` 和 `engine_usage_signing_secret`。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    config:
      existingSecretName: "<your-secret-name>"
      # Must be reachable from the sandbox network.
      hostname: "https://langsmith.example.com"

    engine:
      enabled: true
      intelligenceBaseUrl: "https://beacon.aws.langchain.com/intelligence"

    sandboxes:
      enabled: true
    ```
  </Tab>

  <Tab title="Using inline values">
    直接在配置文件中设置引擎的密钥。

    <Warning>
      这会将实时凭据放入您的配置文件中。不要将其提交给版本控制；更喜欢 Kubernetes Secret。
    </Warning>

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    config:
      hostname: "https://langsmith.example.com"

    engine:
      enabled: true
      intelligenceBaseUrl: "https://beacon.aws.langchain.com/intelligence"
      encryptionKey: "<engine-encryption-key>"
      usageSigningSecret: "<engine-usage-signing-secret>"

    sandboxes:
      enabled: true
    ```
  </Tab>
</Tabs>

<Note>
  如果您的安装具有包含多个工作区的共享组织，请设置拥有引擎沙箱的工作区：
</Note>

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
engine:
  sandboxTenantId: "<workspace-id>"
```

#### 对模型提供商使用云身份

Amazon Bedrock、Google Vertex AI 和 Azure AI Foundry 可以使用 Engine pod 的云身份进行身份验证，而不是使用 LangSmith 中保存的凭据进行身份验证。在 `engine.workloadIdentityProviders` 中列出这些提供商。为共享引擎和 Insights 部署的 API 服务器和队列配置身份：<Tabs>
  <Tab title="Amazon EKS">
    为服务账户 (IRSA) 配置 IAM 角色。信任两个引擎工作负载的命名空间和服务帐户，并授予角色访问引擎使用的 Bedrock 模型的权限。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    engine:
      workloadIdentityProviders:
        - bedrock

    engineInsightsAgent:
      apiServer:
        serviceAccount:
          annotations:
            eks.amazonaws.com/role-arn: "arn:aws:iam::<account-id>:role/<engine-model-access-role>"
      queue:
        serviceAccount:
          annotations:
            eks.amazonaws.com/role-arn: "arn:aws:iam::<account-id>:role/<engine-model-access-role>"
    ```
  </Tab>

  <Tab title="Google GKE">
    在集群和运行引擎的节点池上为 GKE 启用工作负载联合身份验证。在 Google 服务帐户上授予每个 Engine Kubernetes 服务帐户 `roles/iam.workloadIdentityUser`。将每个成员绑定为`serviceAccount:<cluster-project-id>.svc.id.goog[<namespace>/<kubernetes-service-account>]`。

    在托管模型的项目中授予 Google 服务帐户 Vertex AI 推理权限，例如 `roles/aiplatform.user`。在该项目中启用所需的模型。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    engine:
      workloadIdentityProviders:
        - vertex

    engineInsightsAgent:
      apiServer:
        serviceAccount:
          annotations:
            iam.gke.io/gcp-service-account: "<service-account>@<project-id>.iam.gserviceaccount.com"
        deployment:
          extraEnv:
            - name: GOOGLE_CLOUD_PROJECT
              value: "<vertex-project-id>"
      queue:
        serviceAccount:
          annotations:
            iam.gke.io/gcp-service-account: "<service-account>@<project-id>.iam.gserviceaccount.com"
        deployment:
          extraEnv:
            - name: GOOGLE_CLOUD_PROJECT
              value: "<vertex-project-id>"
    ```

    引擎使用应用程序默认凭据 (ADC) 来解析身份和项目。将两个工作负载上的 `GOOGLE_CLOUD_PROJECT` 设置为预期的 Vertex AI 项目。引擎目前使用`global` Vertex AI定位；那里必须有所需的模型。
  </Tab>

  <Tab title="Azure AKS">
    启用 AKS OIDC 颁发者和 Microsoft Entra 工作负载 ID。为托管身份上的每个引擎 Kubernetes 服务帐户创建联合身份凭证。为每个集群使用集群的 OIDC 发行者、受众 `api://AzureADTokenExchange` 和主题 `system:serviceaccount:<namespace>:<kubernetes-service-account>`。向身份授予认知服务用户角色，范围仅限于托管引擎模型的 Azure AI Foundry 资源。仅 Azure OpenAI 角色无法建立对 Claude 模型的访问权限。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    engine:
      workloadIdentityProviders:
        - azure

    engineInsightsAgent:
      apiServer:
        serviceAccount:
          annotations:
            azure.workload.identity/client-id: "<managed-identity-client-id>"
        deployment:
          labels:
            azure.workload.identity/use: "true"
      queue:
        serviceAccount:
          annotations:
            azure.workload.identity/client-id: "<managed-identity-client-id>"
        deployment:
          labels:
            azure.workload.identity/use: "true"
    ```

    两个工作负载都需要服务帐户注释和 Pod 标签。将 Foundry 资源名称保存在**设置 > 引擎 > 模型提供程序**下。
  </Tab>
</Tabs>

<Warning>
  `engine.workloadIdentityProviders` 中列出的提供程序视为在未保存凭据的情况下进行配置，因此任何组织管理员都可以选择它。将身份范围限定为引擎使用的模型。
</Warning>

保存的凭据优先于云身份。切换提供商时，请在删除其保存的凭据之前应用云身份配置。然后，在 **设置 > 引擎 > 模型提供程序** 下仅删除该提供程序保存的 API 密钥或服务帐户 JSON。对于 Bedrock，还要删除所有已保存的访问密钥、秘密访问密钥和会话令牌。保留 Azure AI Foundry 资源名称和任何 Bedrock 区域设置，然后再次 [test the provider](#test-a-provider)。<Warning>
  从较旧的 Insights 图像引脚升级需要一项额外检查：如果您的值引脚 `images.engineInsightsAgentImage.repository` 到已停用的 `langsmith-clio` 图像，请删除或更新该引脚。引擎和 Insights 现在在 `langsmith-insights-engine` 上运行，并且图表拒绝 `langsmith-clio`。欲了解更多信息，请参阅[Mirror images for your LangSmith installation](/langsmith/self-host-mirroring-images#additional-images-for-engine)。
</Warning>

在应用更新的图表之前验证它：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm template langsmith langchain/langsmith \
  --values langsmith_config.yaml \
  --version <version> \
  --namespace <namespace>
```

该图表在渲染时验证引擎值并命名缺失值。此命令不会检查现有 Kubernetes Secret 中的密钥；在应用图表之前验证这些。

应用更新后的图表：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade -i langsmith langchain/langsmith \
  --values langsmith_config.yaml \
  --version <version> \
  --namespace <namespace> \
  --wait
```

### 验证安装

确认共享 Engine 和 Insights 部署正在运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n <namespace> | grep standalone-insights
```

API 服务器和队列 Pod 都应该是 `Running`。然后，确认 `platform-backend` 是健康的，因为它调度引擎运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl rollout status deployment/langsmith-platform-backend -n <namespace>
```

如果此后引擎未出现在 LangSmith UI 中，最常见的原因是许可证没有引擎权利和[Turn on Engine in LangSmith](#turn-on-engine-in-langsmith) 中所述的组织级别切换。在LangSmith UI 中的[enabling and configuring Engine](#turn-on-engine-in-langsmith)、[test each selected provider](#test-a-provider) 之后，启动引擎分析并确认出现跟踪项目的结果。这将验证通过引擎、沙箱和模型提供程序或LangSmith智能的完整路径。单独运行 pod 不会验证该路径。

检查 **设置 > 引擎** 下的引擎使用情况，了解按工作区和项目划分的总支出。使用情况报告和计费更新是异步的，因此支出可能会晚于分析结果出现。对于气隙安装，请通过[Usage export](#air-gapped-installations)验证记录的使用情况。

如果分析未完成，请检查 Engine Pod 是否正在运行、沙盒工作区是否有可用配额，以及集群是否可以访问您的模型提供程序或在 `engine.intelligenceBaseUrl` 中配置的LangSmith Intelligence gateway URL。

### 在LangSmith中打开引擎

在 Helm 中启用 Engine 即可使用该功能；它不会启动任何扫描。启用图表值后，在LangSmith中完成设置：1. [Organization Admin](/langsmith/rbac#organization-admin) 在 **设置 > 引擎** 下为组织打开引擎。有关更多信息，请参阅[Find and fix issues](/langsmith/engine#enable-engine-for-your-organization)。
2. **设置 > 引擎 > 模型提供程序**下的组织管理员 [chooses how Engine runs its models](#choose-model-providers)。在保存之前，引擎不会启动任何运行。
3. [role](/langsmith/rbac) 可以更新跟踪项目的用户从其**引擎**选项卡打开跟踪项目的引擎。有关更多信息，请参阅[Set up Engine](/langsmith/engine#set-up-engine)。

要读取源代码并打开拉取请求，Engine 还需要 GitHub 连接。操作员[configures the GitHub App](/langsmith/engine-github#self-hosted-configuration)，然后是工作区用户[connect repositories](/langsmith/engine-github#connect-repositories)。

### 选择模型提供商

在 **设置 > 引擎 > 模型提供程序**下，组织管理员选择 LangSmith Intelligence、一个或多个您自己的提供程序，或两者都选择。凭据将保存为组织机密并适用于组织中的每个工作区。

仅当您安装的 `engine.intelligenceBaseUrl` 服务于引擎模型时，LangSmith 智能才会出现。

当 LangSmith 情报可用并被选择时，它的优先级高于您选择的提供商。不选择它以保留对您自己的提供商的推断。引擎从您启用的提供商中选择模型。在您的提供商帐户中启用对 Claude 5.5 级模型或 GPT 5.6 级模型的访问，具体取决于每个提供商提供的模型。模型要求遵循`images.engineInsightsAgentImage.tag`中的引擎图像标签，而不是Helm图表版本。运行[**Test connection**](#test-a-provider)来识别所需的型号并确认对已安装的引擎映像的访问。

要使用您自己的提供商：

<Steps>
  <Step title="Add credentials">
    单击提供商旁边的 **添加凭据** 并输入：

    <Tabs>
      <Tab title="Anthropic">
        Anthropic API 密钥。
      </Tab>

      <Tab title="Amazon Bedrock">
        AWS 访问密钥 ID 和秘密访问密钥，以及可选的会话令牌或 Bedrock API 密钥（不记名令牌）。 （可选）AWS 区域。

        引擎使用基岩地幔 API。允许访问所选 AWS 账户和区域中所需的模型。授予调用身份Mantle推理和模型订阅权限；请参阅[AmazonBedrockMantleInferenceAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonBedrockMantleInferenceAccess.html)了解所需的操作。

        如果未保存区域，引擎将使用`us-east-1`，包括工作负载标识。它不继承 EKS 集群的区域。

        要改用 Engine pod 的云身份，请参阅 [Use cloud identity for your model providers](#use-cloud-identity-for-your-model-providers)。
      </Tab><Tab title="Google Vertex AI">
        JSON 格式的服务帐户密钥。引擎使用JSON的`project_id`作为推理项目并调用`global`位置。

        通过该项目中的[Model Garden](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/partner-models/use-partner-models)启用所需的模型。在同一项目中授予服务帐户`roles/aiplatform.user`。

        要改用 Engine pod 的云身份，请参阅 [Use cloud identity for your model providers](#use-cloud-identity-for-your-model-providers)。
      </Tab>

      <Tab title="Azure AI Foundry">
        确认您的资源区域具有已安装的引擎映像所需模型的访问权限和配额。配置 Azure：

        1. 在同一 Azure AI Foundry 资源中创建所需的模型部署。部署名称必须与模型名称（模型 ID）完全匹配。 Engine 使用 Claude 作为其主要模型，并使用 GPT 作为后备模型。这两个模型系列都不支持自定义部署别名。遵循[Claude deployment instructions](https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry)并检查[Azure OpenAI model availability](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses)。创建第一个 Claude 部署时接受 Azure 市场条款。
        2. 输入 API 密钥和资源名称，而不是其完整 URL。要使用 Engine pod 的云身份而不是 API 密钥，请参阅[Use cloud identity for your model providers](#use-cloud-identity-for-your-model-providers)。
        3. 运行 [**Test connection**](#test-a-provider) 并确认 Claude 和 GPT 请求均成功，包括在选择其他提供商时。保存后，[start an Engine analysis](#verify-the-installation)验证完整设置。
      </Tab>

      <Tab title="OpenAI">
        OpenAI API 密钥，以及可选的 OpenAI 组织 ID。
      </Tab>
    </Tabs>

    具有完整凭据的提供程序显示为已配置。要稍后更改它们，请单击提供程序旁边的钥匙图标。
  </Step>

  <Step title="Test the provider">
    单击**测试连接**。引擎使用保存的凭据或配置的云身份向它在该提供商上使用的每个模型发送一个小请求。它显示每个请求是否成功，如果没有，则说明原因。
  </Step>

  <Step title="Select providers and save">
    选择引擎可能使用的提供商，然后保存。
  </Step>
</Steps>

如果保存后引擎运行失败：* **未选择任何提供程序：** 在选择并保存至少一个提供程序之前，引擎不会开始运行。
* **拒绝的凭据：** **测试连接** 报告哪个提供商拒绝了它们。更新凭据并再次测试。
* **模型不可用：** 在您的提供商帐户中启用模型，然后再次测试。

### 禁用引擎

将 `engine.enabled` 设置为 `false` 并重新应用：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
engine:
  enabled: false
```

引擎停止调度运行。 Insights 共享相同的部署，因此当 `insights.enabled` 为 `true` 时，`standalone-insights` Pod 会继续运行。

## 私密连接

引擎在公共出口处工作。要使其流量保持在专用网络上，请使用 AWS PrivateLink 连接到 LangSmith Intelligence，或通过云的专用终端节点连接到您自己的模型提供商。

### 连接 AWS PrivateLink

LangSmith 智能网关 `beacon.aws.langchain.com` 将请求路由到 LangChain 的 AWS 环境中的 Amazon Bedrock。

在配置 PrivateLink 之前，请完成[Install Engine](#install-engine)，包括其 Helm 和 egress 配置。

[AWS PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/) 将引擎流量从 VPC 路由到 LSI，而不将该流量暴露到公共互联网。 LSI端点服务托管在`us-east-2`，AWS支持其他区域的VPC访问。在开始之前，请收集您的 AWS 账户 ID、VPC ID、私有子网 ID 以及接口终端节点的安全组。配置该端点安全组，以允许端口 443 上的入站 TCP 流量仅来自附加到运行引擎的节点或工作负载的安全组，或者来自包含它们的最小私有 CIDR。不允许`0.0.0.0/0`。

要将您的 VPC 连接到 LSI：

<Steps>
  <Step title="Request access">
    请联系您的客户代表或[sales@langchain.dev](mailto:sales@langchain.dev)并提供您的 AWS 账户 ID。 LangChain 将您的帐户添加到端点服务的允许主体列表中。
  </Step>

  <Step title="Create the interface VPC endpoint">
    为包含您的 VPC 的区域配置 AWS 提供商。将 `service_region` 设置为 `us-east-2`，包括当您的 VPC 位于其他区域时。每个可用区选择一个私有子网。

    <Note>
      `service_region` 参数需要 HashiCorp AWS 提供商 `5.82.0` 或更高版本。
    </Note>

    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    resource "aws_vpc_endpoint" "langsmith_intelligence" {
      vpc_id              = var.vpc_id
      service_name        = "com.amazonaws.vpce.us-east-2.vpce-svc-054f37092752bff6b"
      service_region      = "us-east-2"
      vpc_endpoint_type   = "Interface"
      subnet_ids          = var.private_subnet_ids
      security_group_ids  = [var.security_group_id]
      private_dns_enabled = false
    }
    ```
  </Step>

  <Step title="Wait for LangChain to accept the connection">
    LangChain接受连接后，端点状态从`pendingAcceptance`变为`available`。在测试连接之前，请等待几分钟让更改传播。
  </Step><Step title="Route the LSI hostname to the endpoint">
    为您的 VPC 启用 DNS 解析和 DNS 主机名。然后，创建 Route 53 私有托管区域和别名记录，以便 `beacon.aws.langchain.com` 解析为 VPC 内的 VPC 终端节点。保持此主机名不变，以便 TLS 证书验证成功。当端点不可用时，私有托管区域还可以防止回退到公共 DNS。

    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    resource "aws_route53_zone" "langsmith_intelligence" {
      name = "beacon.aws.langchain.com"

      vpc {
        vpc_id = var.vpc_id
      }
    }

    resource "aws_route53_record" "langsmith_intelligence" {
      zone_id = aws_route53_zone.langsmith_intelligence.zone_id
      name    = "beacon.aws.langchain.com"
      type    = "A"

      alias {
        name                   = aws_vpc_endpoint.langsmith_intelligence.dns_entry[0].dns_name
        zone_id                = aws_vpc_endpoint.langsmith_intelligence.dns_entry[0].hosted_zone_id
        evaluate_target_health = true
      }
    }
    ```

    如果工作负载使用公司 DNS 解析器而不是 Amazon 提供的解析器，请配置条件转发到 Route 53 解析器，或为指向终端节点 DNS 名称的 `beacon.aws.langchain.com` 创建等效的私有 DNS 覆盖。
  </Step>

  <Step title="Verify private connectivity">
    从运行引擎的节点或容器中，解析网关主机名：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    getent ahostsv4 beacon.aws.langchain.com
    ```

    确认结果包含分配给端点网络接口的专用 IP 地址。然后开始分析并确认其成功完成。如果分析未完成，请检查引擎安装和出口配置。
  </Step>
</Steps>

### 私下连接到您的提供商引擎从 `standalone-insights` pod 调用每个提供商的标准 API 主机名。为了使该流量远离公共互联网，请设置云与提供商的专用连接，以便相同的主机名解析为网络内的专用地址：

| **提供商** | **主机名引擎调用** | **私人连接** |
| - | - | - |
|亚马逊基岩 | `bedrock-mantle.<region>.api.aws` | `com.amazonaws.<region>.bedrock-mantle` 的接口 VPC 终端节点，启用私有 DNS 或主机名的 Route 53 私有托管区域 |
|谷歌顶点人工智能 |全球区域为`<region>-aiplatform.googleapis.com`或`aiplatform.googleapis.com` |适用于 Google API 的专用服务连接，以及`googleapis.com` 的专用 DNS |
| Azure AI 铸造厂 | `<resource>.openai.azure.com` 和 `<resource>.services.ai.azure.com` | Foundry 资源的专用端点及其专用 DNS 区域 |
| Anthropic、OpenAI | `api.anthropic.com`、`api.openai.com` |无法使用。这些提供商需要公共出口。 |

引擎不接受自定义端点 URL，因此专用连接通过 DNS 工作：标准主机名必须从 Engine Pod 解析为您的专用端点。

如果 Engine 使用 [cloud identity](#use-cloud-identity-for-your-model-providers) 进行身份验证，则 Pod 还需要访问云的令牌服务，例如 AWS 上 AWS STS 的接口 VPC 终端节点。通过保存的 Vertex AI 服务帐户 JSON，还允许使用 HTTPS `oauth2.googleapis.com` 进行令牌交换，以及 `aiplatform.googleapis.com` 进行推理。

向 LangSmith Intelligence 报告使用情况是一个单独的连接。在 AWS 上，`https://beacon.aws.langchain.com/intelligence` 记录使用情况并支持 [AWS PrivateLink](#connect-with-aws-privatelink)，因此安装可以在 Bedrock 上运行 Engine 并报告使用情况，而无需公共出口。默认`https://beacon.langchain.com/intelligence`需要公共出口。

## 气隙安装

具有离线许可证且未连接到 LangSmith Intelligence 的安装可以在其自己的模型提供程序上运行引擎：

* 将`engine.intelligenceBaseUrl`设置为`""`。
* 在 **设置 > 引擎 > 模型提供程序** 下选择您自己的模型提供程序。 LangSmith 情报不可用。
* 允许从 `standalone-insights` pod 到您的模型提供程序的出站 HTTPS，或通过您自己的网络路径将其路由到它们。

引擎记录其在您的安装中的使用情况。组织管理员会从 **设置 > 使用情况导出** 将其与您的剩余使用情况一起下载，并按照您协议中的时间表将其发送给您的 LangChain 帐户团队。

气隙安装不显示引擎支出，并且不强制执行`0`以外的支出限制。设置 `0` 的限制来暂停组织或项目的引擎。

## 另请参阅* [Engine](/langsmith/engine-overview)
* [Configure Engine](/langsmith/engine)
* [Connect Engine to GitHub](/langsmith/engine-github)
* [Engine security](/langsmith/engine-security)
* [Engine notifications](/langsmith/engine-notifications)
* [Connect self-hosted LangSmith to Slack](/langsmith/self-host-slack)
* [Enable additional LangSmith features](/langsmith/self-host-additional-features)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>