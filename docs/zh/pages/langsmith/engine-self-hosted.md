<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Engine on Self-hosted and BYOC | https://docs.langchain.com/langsmith/engine-self-hosted -->

# LangSmith 自托管和 BYOC 引擎

在自托管 LangSmith 实例或 BYOC 数据平面上设置 LangSmith 引擎，包括模型提供程序选项和外部网络要求。

> [!注意]
>
> 自承载引擎需要 LangSmith Helm 图表 `0.16.0` 或更高版本以及包含引擎权利的许可证。它在早期图表版本中不可用。 [Contact our sales team](https://www.langchain.com/contact-sales) 将权利添加到您的订单中。
>
> 在 [your own model providers](/langsmith/engine-self-hosted-model-providers) 和 [air-gapped installations](#air-gapped-installations) 上运行引擎需要 LangSmith Helm 图表 `0.17.0` 或更高版本。早期的图表版本仅在 [LangSmith Intelligence](#langsmith-intelligence) 上运行引擎。

在自托管 LangSmith 中，[LangSmith Engine](/langsmith/engine) 的分析和修复工作流程在您的环境中运行。引擎将其所需的跟踪内容和代码发送到其模型，这些模型可以在 LangSmith Intelligence (LSI) 或您自己的模型提供程序上运行。它会向 LSI 报告使用情况元数据以进行计费，除非您的安装是[air-gapped](#air-gapped-installations)。

本页介绍如何[choose how Engine runs its models](#choose-how-engine-runs-its-models)、引擎处理数据的位置以及如何[install Engine](#install-engine)。要配置您自己的模型提供程序，请参阅[Configure model providers for Engine on self-hosted](/langsmith/engine-self-hosted-model-providers)。要让引擎访问源代码，还需[configure a GitHub App](/langsmith/engine-self-hosted-github)。 GitHub 是可选的跟踪分析。

引擎还运行在 [BYOC](/langsmith/byoc) 数据平面上，LangChain 为您安装和操作它。请参阅[Engine on BYOC](#engine-on-byoc)了解不同之处。> [!注意]
>
> 红队和自动问题验证在自托管 LangSmith 和 BYOC 上不可用。您可以在没有这些功能的情况下调查问题、生成修复程序并打开 PR。

## BYOC 引擎

在 BYOC 数据平面上，LangChain 安装 Engine 并生成其密钥，您不需要编辑 Helm 值。要在数据平面上启用 Engine，请联系您的 LangChain 客户团队。

BYOC 上的引擎与自托管 LangSmith 的不同之处如下：

* **模型提供商**：引擎仅在[your own model providers](/langsmith/engine-self-hosted-model-providers)上运行。 LangSmith 情报不可用。 Amazon Bedrock 可以使用您的数据平面的云身份而不是保存的凭证。允许访问托管数据平面的 AWS 账户中所需的模型。
* **GitHub**：组织管理员注册 GitHub 应用程序并在 LangSmith UI 中的引擎项目中保存其凭据。参见[Connect Engine to GitHub on BYOC](/langsmith/engine-self-hosted-github#configure-the-app-on-byoc)。
* **Slack**：组织管理员在 **设置** > **常规设置** > **Slack** 下为组织配置 Slack 应用程序。参见[Create your Slack app on BYOC](/langsmith/self-host-slack#create-your-slack-app-on-byoc)。

要在 LangChain 在数据平面上启用引擎后设置引擎：1. 组织管理员转到 **设置** > **引擎**，选择数据平面，然后打开引擎。此设置适用于数据平面上的所有工作区。其他数据平面和LangSmith云不受影响。
2. **设置** > **引擎** > **模型提供程序**下的组织管理员 [chooses model providers](/langsmith/engine-self-hosted-model-providers#choose-model-providers)。保存凭据需要`organization:manage-model-secrets`权限。
3. [role](/langsmith/rbac)可以更新跟踪项目的用户打开跟踪项目的引擎。参见[Set up Engine](/langsmith/engine-setup#turn-on-engine-for-a-tracing-project)。
4.（可选）组织管理员[configures the GitHub App](/langsmith/engine-self-hosted-github#configure-the-app-on-byoc)和工作区用户连接存储库。
5.（可选）组织管理员 [configures the Slack app](/langsmith/self-host-slack#create-your-slack-app-on-byoc) 并添加 [notification destinations](/langsmith/engine-notifications)。

要将引擎问题从LangSmith云或自托管LangSmith转移到数据平面，请参阅[Migrate to BYOC](/langsmith/byoc-migration#complete-the-engine-manual-steps)。

## 选择引擎运行模型的方式

每个组织都可以在**设置 > 引擎 > 模型提供程序**下选择引擎运行其模型的方式。| | **LangSmith智能** | **您自己的模型提供商** |
| - | - | - |
| **谁运行模型** | LangChain，及其选择的提供商 |您的提供商帐户 |
| **凭证** |没有任何。引擎使用您的 LangSmith 许可证进行身份验证。 |您提供的 API 密钥或云身份 |
| **型号选择** |由LangChain管理和调整|由 LangChain 管理，在您的提供商提供的型号系列中 |
| **数据处理协议** | LangChain，每个提供商都有 ZDR |您的，与您使用的每个提供商一起|
| **计费** | LangChain 对 LSU 中引擎的使用情况进行计费。 |您的提供商会向您收取模型调用费用。 LangChain 对 LSU 中的 Engine 使用情况进行计费，费率低于LangSmith Intelligence。 |
| **可用性** | AWS 美国 |任何云，以及您的集群可以访问的受支持模型和端点 |

对于LangSmith其他云或区域中的智能，[contact our sales team](https://www.langchain.com/contact-sales)。

![Architecture diagram of self-hosted LangSmith in your VPC connected to LangSmith Intelligence and Bedrock in LangChain's AWS environment.](https://mintcdn.com/langchain-5e9cc07a/ry58UzmmALISsnzO/langsmith/images/engine-self-hosted-aws.png?fit=max\&auto=format\&n=ry58UzmmALISsnzO\&q=85\&s=ae209b16e4cf2ad7199e7ea6bb333f84)

![Architecture diagram of self-hosted LangSmith in your VPC sending model inference to your model providers and usage metadata to LangChain's cloud.](https://mintcdn.com/langchain-5e9cc07a/YV2_h1H0dQOJtIWY/langsmith/images/engine-self-hosted-byok.png?fit=max\&auto=format\&n=YV2_h1H0dQOJtIWY\&q=85\&s=772a34376f553f8a07ce36f96a4b0f81)

### LangSmith 情报

LSI 是运行 Engine 模型的LangChain 托管服务。引擎将其模型请求发送到 `https://beacon.aws.langchain.com/intelligence`，并使用您的 LangSmith 许可证进行身份验证，因此您无需提供模型提供者凭据。每个请求都携带引擎完成其工作所需的跟踪内容、代码和中间输出。引擎使用不同的模型，每个模型都针对其角色进行了调整，以集群问题、根据代码诊断根本原因、生成修复程序并编写验证它们的评估器。 LangChain 调整这些模型的质量和代币效率，并在更好的模型可用时更新它们。

您的集群必须允许到该网关的出站 HTTPS。连接可以使用公共出口或专用连接。要使引擎流量保持在专用网络上，请遵循[Connect with AWS PrivateLink](/langsmith/engine-self-hosted-model-providers#connect-with-aws-privatelink)。

如果与 LSI 的连接不可用，引擎将停止并返回错误。 LangSmith 部署的其余部分不受影响，并且引擎会再次尝试进行下一次计划扫描。

### 您自己的模型提供商

引擎使用您控制的凭证或云身份直接从您的集群调用 Anthropic、OpenAI、Amazon Bedrock、Google Vertex AI 或 Azure AI Foundry。提示和响应仅发送给您的提供商。要选择提供商并添加凭据，请参阅[Configure model providers for Engine on self-hosted](/langsmith/engine-self-hosted-model-providers)。

## 引擎处理和存储数据的位置

在自托管部署中，引擎将您的环境和 LangChain 之间的数据处理分开：* **您的环境：** 引擎编排和LangSmith存储的跟踪保留在您的自托管环境中。
* **LangChain的环境，具有LangSmith智能：** LSI和模型提供者处理Engine发送的内容。 LSI 仅保留[usage metadata](#what-langsmith-intelligence-retains)。
* **您的模型提供商以及您自己的提供商：** 您的提供商根据您与他们的协议处理引擎发送的内容。 LangChain 仅收到 [usage metadata](#what-langsmith-intelligence-retains)。

如果您启用外部通知，引擎还会将通知内容发送到您配置的 Slack 通道或 Webhook 端点。有关 Slack 应用程序设置和发送到 Slack 的内容，请参阅 [Connect self-hosted LangSmith to Slack](/langsmith/self-host-slack)。

### LangSmith 智力保留了什么

LSI 不会保留提示或模型响应的内容。它保留以下元数据用于使用归因和计费：

* 用于归因使用情况的帐户、工作区和项目标识符。
* 用于计费的模型和令牌使用元数据。

当 Engine 在您自己的模型提供程序上运行时，这些元数据都是 LSI 接收的。您的自托管 LangSmith 会记录引擎的使用情况，并每小时向 [⟦T14⟧](#allow-egress-to-langsmith-intelligence) 中的端点报告，并使用您的许可证进行身份验证。对于LangChain管理的推理，模型提供商保留和培训承诺在[Engine security](/langsmith/engine-security#model-subprocessors)中描述。当您使用自己的提供商时，他们的保留和培训政策取决于您与他们的协议。

## 安装引擎

本节适用于自托管 LangSmith。在 BYOC 上，LangChain 安装 Engine。参见[Engine on BYOC](#engine-on-byoc)。

默认情况下禁用引擎。它需要 [Sandboxes](/langsmith/enable-self-hosted-sandboxes)、与 [LangSmith Intelligence](#allow-egress-to-langsmith-intelligence) 的连接，除非您的安装是 [air-gapped](#air-gapped-installations)、外部可访问的 [⟦T15⟧](#verify-your-hostname-is-externally-reachable) 和 [Engine's keys](#generate-engines-keys)。在启用引擎之前完成先决条件。

引擎和 [Insights](/langsmith/self-host-insights-chat) 从同一映像运行并共享一个部署。 Engine 不需要 Insights。如果您的安装已运行 Insights，则启用 Engine 会添加配置而不是新 Pod。

### 组件

启用引擎配置或重用：

* `standalone-insights-api-server`：同时服务于`engine`和`insights`图表。
* `standalone-insights-queue`：Engine 和 Insights 的后台运行处理。
* 用于共享部署的专用 PostgreSQL 和 Redis 实例，每个实例都可以替换为外部实例。
* [Enable Sandboxes](/langsmith/enable-self-hosted-sandboxes) 下描述的沙箱组件。

引擎还向`platform-backend`和`ingest-queue`添加了配置，用于调度和安排其运行。

### 先决条件**1.启用沙箱**

首先完成[Enable Sandboxes](/langsmith/enable-self-hosted-sandboxes)，包括支持KVM的节点池和JuiceFS存储。

引擎的沙箱与一个工作区相关联。带有引擎的安装必须有[shared organization](/langsmith/administration-overview#organizations)。当安装有一个共享组织时，LangSmith 默认使用其最旧的活动工作区，即使该组织有多个工作区也是如此。要使用专用工作区，请创建工作区并将 `engine.sandboxTenantId` 设置为其 ID。如果安装有多个共享组织，则必须设置 `engine.sandboxTenantId`，因为 LangSmith 不会自动在组织之间进行选择。> [!警告]
>
> 使用为引擎保留的工作空间：
>
> * Engine 的沙箱不在 Sandboxes 产品中计费，因为 Engine 会计量自己在 LSU 中的使用情况。
> * 引擎的沙箱使用与工作区中其他沙箱相同的并发沙箱、CPU 和内存配额。如果工作区接近其限制，引擎运行可能会失败或为交互式沙箱留下的容量较少。
> * 引擎的沙箱列在该工作区中，任何有权访问它的人都可以停止。
> * 每个沙箱都运行代理生成的代码。
> * 存储库凭据保留在沙箱身份验证代理中，并且不可用于沙箱内运行的代码。

**2.确认许可证权利**

引擎是单独许可的，与沙盒相同。您的许可证必须包含引擎权利。 LangSmith 在启动时根据 `https://beacon.langchain.com` 验证您的许可证密钥，并在此后定期验证，因此，一旦将其添加到订单中，您无需更改任何配置，即可生效。

**3.允许出口到 LangSmith Intelligence 和您的模型提供商**

设置 `engine.intelligenceBaseUrl` 引擎如何运行其模型，并允许从集群到该 URL 的出站 HTTPS：| **引擎运行其模型** | **`engine.intelligenceBaseUrl`** |
| - | - |
| LangSmith 情报 | `https://beacon.aws.langchain.com/intelligence` |
|您自己的模型提供商 | `https://beacon.langchain.com/intelligence`（默认）|
|您自己的模型提供商，气隙 | `""`（参见[Air-gapped installations](#air-gapped-installations)）|

AWS URL 还记录使用情况，因此它适用于采用任一选项的组织。默认 URL 仅记录使用情况，在自托管 LangSmith 已用于许可证验证和计费遥测的同一主机上，因此它添加了一条路径而不是新的出口目的地。

在图0.16中，`engine.intelligenceBaseUrl`没有默认值，引擎仅在LangSmith智能上运行，因此将其设置为`https://beacon.aws.langchain.com/intelligence`。

如果引擎在您自己的模型提供程序上运行，还允许从 `standalone-insights` pod 到每个提供程序的 API 端点的出站 HTTPS。要将该流量保留在专用网络上，请参阅[Connect to your providers privately](/langsmith/engine-self-hosted-model-providers#connect-to-your-providers-privately)。

将每个目的地添加为特定的允许列表条目，而不是打开一般出口。将流量保持在LangSmith专用网络上的智能，[connect with AWS PrivateLink](/langsmith/engine-self-hosted-model-providers#connect-with-aws-privatelink)。对 LangSmith Intelligence 的请求使用在 LangSmith 许可证验证期间获得的短期许可证 JWT。引擎的流量与[Configure egress](/langsmith/self-host-egress)中描述的计费和操作遥测是分开的，即使它共享主机。

**4.验证您的主机名可从外部访问**引擎的沙箱使用 `langsmith` CLI 调用您的 LangSmith 安装，因此 `config.hostname` 必须可从沙箱网络访问。 Helm 验证拒绝 `localhost` 和集群内 `*.svc` 地址。

使用 TLS 通过您的入口提供该主机名，如 [Set up an ingress](/langsmith/self-host-ingress) 中所述。引擎的沙箱网络策略允许访问您的 LangSmith 主机名、配置的 GitHub 主机以及公共 PyPI 和 npm 注册表。沙箱外部的代理会注入每次运行的凭据，因此它们在沙箱内部不可读。

当引擎生成代码修复时，它会安装`pypi.org`、`files.pythonhosted.org`和`registry.npmjs.org`的依赖项。注册表主机不可配置，因此引擎无法使用内部 PyPI 或 npm 镜像，并且如果您的网络阻止公共注册表，依赖项安装将失败。沙箱无法到达 Go 模块代理，例如 `proxy.golang.org`，因此引擎使用连接的代码存储库的 `vendor/` 目录（当它存在时）。

对于 GitHub 连接，还允许您的 GitHub 环境所需的 [outbound requests and inbound webhooks](/langsmith/engine-self-hosted-github#allow-network-access)。仅通过浏览器访问 LangSmith 并不能与 GitHub 建立 Webhook 连接。

**5.生成引擎的密钥**

引擎需要自己的两个密钥：* **加密密钥** (`engine_encryption_key`)：一个 Fernet 密钥，用于加密传递给引擎的运行负载LangSmith，该引擎携带短期凭证。

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
  ```

* **使用签名秘密** (`engine_usage_signing_secret`)：对引擎发送到LangSmith的使用报告进行签名。使用至少 32 个随机字符。

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  openssl rand -hex 32
  ```

在图表 0.16 上，引擎仅使用加密密钥。使用签名密钥是图表 0.17 中的新增内容，如果没有它，0.17 图表将拒绝引擎安装。

在安装或升级图表之前，将两者存储在预定义的 Kubernetes Secret 中。参见[Use an existing secret](/langsmith/self-host-using-an-existing-secret#parameters)。当 Helm 可以从集群中读取现有 Secret 时，图表会检查这两个密钥并命名任何缺失的密钥。 `helm template` 和 GitOps 渲染会跳过该查找，因此请验证密钥是否单独存在。

要轮换加密密钥，请将当前值复制到 `engine_encryption_key_previous` 并将新密钥设置为 `engine_encryption_key`。之前的密钥仅用于解密，因此在交换完成之前以加密方式运行。引入或轮换使用签名密钥时，请暂停新的引擎工作并等待运行扫描完成。更新 `platform-backend`、`ingest-queue` 以及共享引擎和 Insights API 服务器和队列以使用相同的签名密钥。当所有四个组件都正常后，恢复引擎和[verify an analysis and Engine usage](#verify-the-installation)。以前的加密密钥不提供使用签名的后备。

### 使用 Helm 启用

将以下内容添加到您的 [⟦T49⟧](/langsmith/kubernetes#configure-your-helm-charts) 中，以及 [Enable Sandboxes](/langsmith/enable-self-hosted-sandboxes) 中的完整沙盒值。这些示例仅显示特定于引擎的值和 `sandboxes.enabled` 标志。

**使用 Kubernetes 机密（推荐）**

按名称引用您现有的 Secret。该图表从中读取 `engine_encryption_key` 和 `engine_usage_signing_secret`。

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

**使用内联值**

直接在配置文件中设置引擎的密钥。

> [!警告]
>
> 这会将实时凭据放入您的配置文件中。不要将其提交给版本控制。更喜欢 Kubernetes Secret。

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

> [!注意]
>
> 要使用最旧的活动工作区以外的工作区，或者如果您的安装有多个共享组织，请设置拥有引擎沙箱的工作区：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
engine:
  sandboxTenantId: "<workspace-id>"
```要使用 Engine pod 的云身份对 Amazon Bedrock、Google Vertex AI 或 Azure AI Foundry 进行身份验证，请添加 [Use cloud identity for your model providers](/langsmith/engine-self-hosted-model-providers#use-cloud-identity-for-your-model-providers) 中的值。

> [!警告]
>
> 从旧版 Insights 图像引脚升级需要一项额外检查：如果您的值引脚 `images.engineInsightsAgentImage.repository` 到已停用的 `langsmith-clio` 图像，请删除或更新该引脚。引擎和 Insights 现在在 `langsmith-insights-engine` 上运行，并且图表拒绝 `langsmith-clio`。欲了解更多信息，请参阅[Mirror images for your LangSmith installation](/langsmith/self-host-mirroring-images#additional-images-for-engine)。

在应用更新的图表之前验证它：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm template langsmith langchain/langsmith \
  --values langsmith_config.yaml \
  --version <version> \
  --namespace <namespace>
```

该图表在渲染时验证引擎值并命名缺失值。此命令不会检查现有 Kubernetes Secret 中的密钥，因此请在应用图表之前验证这些密钥。

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

API 服务器和队列 Pod 都应该是`Running`。然后，确认`platform-backend`是健康的，因为它调度引擎运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl rollout status deployment/langsmith-platform-backend -n <namespace>
```

如果在此之后引擎未出现在 LangSmith UI 中，最常见的原因是许可证没有引擎权利以及[Turn on Engine in LangSmith](#turn-on-engine-in-langsmith) 中所述的组织级别切换。在LangSmith UI 中的[enabling and configuring Engine](#turn-on-engine-in-langsmith)、[test each selected provider](/langsmith/engine-self-hosted-model-providers#test-a-provider) 之后，启动引擎分析并确认出现跟踪项目的结果。这将验证通过引擎、沙箱和模型提供程序或LangSmith智能的完整路径。单独运行 pod 不会验证该路径。

检查 **设置 > 引擎** 下的引擎使用情况，了解按工作区和项目划分的总支出。使用情况报告和计费更新是异步的，因此支出可能会晚于分析结果出现。对于气隙安装，请通过[Usage export](#air-gapped-installations)验证记录的使用情况。

如果分析未完成，请检查 Engine Pod 是否正在运行、沙盒工作区是否有可用配额，以及集群是否可以访问您的模型提供程序或在 `engine.intelligenceBaseUrl` 中配置的 LangSmith 智能网关 URL。

### 在LangSmith中打开引擎

在 Helm 中启用引擎可以使该功能可用，但不会启动任何扫描。启用图表值后，在LangSmith中完成设置：1. [Organization Admin](/langsmith/rbac#organization-admin) 在 **设置 > 引擎** 下为组织打开引擎。欲了解更多信息，请参阅[Enable Engine for your organization](/langsmith/engine-setup#enable-engine-for-your-organization)。
2. **设置 > 引擎 > 模型提供程序**下的组织管理员 [chooses how Engine runs its models](/langsmith/engine-self-hosted-model-providers#choose-model-providers)。在保存之前，引擎不会启动任何运行。
3. [role](/langsmith/rbac) 可以更新跟踪项目的用户从其**引擎**选项卡打开跟踪项目的引擎。有关更多信息，请参阅[Set up Engine](/langsmith/engine-setup#turn-on-engine-for-a-tracing-project)。

要读取源代码并打开拉取请求，Engine 还需要 GitHub 连接。操作员[configures the GitHub App](/langsmith/engine-self-hosted-github)，然后是工作区用户[connect repositories](/langsmith/engine-repositories#connect-repositories)。

### 禁用引擎

将 `engine.enabled` 设置为 `false` 并重新应用：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
engine:
  enabled: false
```

引擎停止调度运行。 Insights 共享相同的部署，因此当 `insights.enabled` 为 `true` 时，`standalone-insights` Pod 会继续运行。

## 气隙安装

具有离线许可证且未连接到 LangSmith Intelligence 的安装可以在其自己的模型提供商上运行引擎：

* 将`engine.intelligenceBaseUrl`设置为`""`。
* [Choose your own model providers](/langsmith/engine-self-hosted-model-providers#choose-model-providers) **设置 > 引擎 > 模型提供程序**。 LangSmith 情报不可用。
* 允许从 `standalone-insights` pod 到您的模型提供程序的出站 HTTPS，或通过您自己的网络路径将其路由到它们。引擎记录其在您的安装中的使用情况。组织管理员会从 **设置 > 使用情况导出** 将其与您的剩余使用情况一起下载，并按照您协议中的时间表将其发送给您的 LangChain 帐户团队。

气隙安装不显示引擎支出，并且不强制执行`0`以外的支出限制。设置 `0` 的限制来暂停组织或项目的引擎。

## 另请参阅

* [LangSmith Engine](/langsmith/engine)
* [Set up Engine](/langsmith/engine-setup)
* [Configure model providers for Engine on self-hosted](/langsmith/engine-self-hosted-model-providers)
* [Configure GitHub for Engine on self-hosted](/langsmith/engine-self-hosted-github)
* [Connect Engine to your repository](/langsmith/engine-repositories)
* [Engine security](/langsmith/engine-security)
* [Engine notifications](/langsmith/engine-notifications)
* [Connect self-hosted and BYOC LangSmith to Slack](/langsmith/self-host-slack)
* [BYOC](/langsmith/byoc)
* [Enable additional LangSmith features](/langsmith/self-host-additional-features)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。