<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure model providers for Engine on self-hosted and BYOC | https://docs.langchain.com/langsmith/engine-self-hosted-model-providers -->

# 在自托管和 BYOC 上为 Engine 配置模型提供程序

选择模型提供商 LangSmith 引擎在自托管 LangSmith 实例上使用，使用凭据或云身份进行身份验证，并将模型流量保留在专用网络上。

> [!注意]
>
> 在您自己的模型提供程序上运行引擎需要 LangSmith Helm 图表 `0.17.0` 或更高版本。早期的图表版本仅在 [LangSmith Intelligence](/langsmith/engine-self-hosted#langsmith-intelligence) 上运行引擎。

在自托管 LangSmith 上，组织管理员选择 [LangSmith Engine](/langsmith/engine) 运行其模型调用的位置：在 LangSmith Intelligence (LSI) 上、在您自己的模型提供程序上或两者上。在您自己的提供商上运行引擎会根据您与这些提供商的协议保留提示和响应。本页介绍如何选择提供商、向他们进行身份验证以及通过专用网络连接到他们或 LSI。有关两个选项的比较，请参阅[Choose how Engine runs its models](/langsmith/engine-self-hosted#choose-how-engine-runs-its-models)。首先完成[Install Engine](/langsmith/engine-self-hosted#install-engine)。

> [!注意]
>
> 在[BYOC](/langsmith/engine-self-hosted#engine-on-byoc)、LangSmith 上，智能不可用，引擎仅在您自己的模型提供程序上运行。 Amazon Bedrock 可以使用 LangChain 配置的数据平面的云身份。 [cloud identity](#use-cloud-identity-for-your-model-providers) 和 [private connection](#connect-privately) 部分仅适用于自托管 LangSmith。

## 使用您自己的模型提供者引擎直接从您的集群调用您的提供程序。根据您与提供商的协议，提示和响应仅发送给您的提供商。 LangChain 没有收到。

Engine 的沙盒使用情况包含在 Engine 的 LSU 计费中。沙箱引擎用于诊断问题、生成修复程序和编写评估程序不会产生额外的沙箱产品费用。

Engine 支持Anthropic、OpenAI、Amazon Bedrock、Google Vertex AI 和 Azure AI Foundry，还可以通过[your own model gateway](#use-a-model-gateway) 调用 Claude 和 GPT。它使用您选择的提供商的混合模型，因此为了获得最佳结果，请为您有权访问的每个提供商添加凭据。

在您的提供商帐户中允许访问 Anthropic 的 Claude 模型和 OpenAI 的 GPT 模型（您的提供商在其中提供这些模型）。在 Azure 上，使用 Azure AI Foundry 资源。要确认 Engine 可以访问它使用的模型，请运行 [**Test connection**](#test-a-provider)。

## 选择模型提供商

在 **设置 > 引擎 > 模型提供程序**下，组织管理员选择 LangSmith Intelligence、一个或多个您自己的提供程序，或两者都选择。凭据将保存为组织机密并适用于组织中的每个工作区。仅当您安装的 `engine.intelligenceBaseUrl` 服务于引擎模型时，LangSmith 智能才会出现。

当 LangSmith 情报可用并被选择时，它的优先级高于您选择的提供商。不选择它以保留对您自己的提供商的推断。

引擎从您启用的提供商中选择模型。在您的提供商帐户中启用对 Claude 5.5 级模型或 GPT 5.6 级模型的访问，具体取决于每个提供商提供的模型。模型要求遵循 `images.engineInsightsAgentImage.tag` 中的 Engine 镜像标签，而不是 Helm 图表版本。运行[**Test connection**](#test-a-provider)来识别所需的型号并确认对已安装的引擎映像的访问。

要使用您自己的提供商：

**1.添加凭据**

单击提供商旁边的 **添加凭据** 并输入：

> [标签] Anthropic
>
> Anthropic API 密钥。> [标签] 亚马逊基岩
>
> AWS 访问密钥 ID 和秘密访问密钥，以及可选的会话令牌或 Bedrock API 密钥（不记名令牌）。 （可选）AWS 区域。
>
> 引擎使用基岩地幔 API。要改用 Bedrock Runtime，请参阅 [Use Bedrock Runtime](#use-bedrock-runtime)。
>
> 允许访问所选 AWS 账户和区域中所需的模型。授予调用身份 Mantle 推理和模型订阅权限。请参阅[AmazonBedrockMantleInferenceAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonBedrockMantleInferenceAccess.html)了解所需的操作。
>
> 如果未保存任何区域，引擎将使用`us-east-1`，包括工作负载标识。它不继承 EKS 集群的区域。
>
> 要改用 Engine pod 的云身份，请参阅 [Use cloud identity for your model providers](#use-cloud-identity-for-your-model-providers)。

> [选项卡] Google Vertex AI
>
> JSON 格式的服务帐户密钥。引擎使用JSON的`project_id`作为推理项目并调用`global`位置。
>
> 在该项目中通过[Model Garden](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/partner-models/use-partner-models)启用所需的模型。在同一项目中授予服务帐户`roles/aiplatform.user`。
>
> 要改用 Engine pod 的云身份，请参阅 [Use cloud identity for your model providers](#use-cloud-identity-for-your-model-providers)。> [选项卡] Azure AI Foundry
>
> 确认您的资源区域具有已安装的引擎映像所需模型的访问权限和配额。配置 Azure：
>
> 1. 在同一 Azure AI Foundry 资源中创建所需的模型部署。部署名称必须与模型名称（模型 ID）完全匹配。 Engine 使用 Claude 作为其主要模型，并使用 GPT 作为后备模型。这两个模型系列都不支持自定义部署别名。
>
> 按照[Claude deployment instructions](https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry) 并检查[Azure OpenAI model availability](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses)。创建第一个 Claude 部署时接受 Azure 市场条款。
> 2. 输入 API 密钥和资源名称，而不是其完整 URL。要使用 Engine pod 的云身份而不是 API 密钥，请参阅[Use cloud identity for your model providers](#use-cloud-identity-for-your-model-providers)。
> 3. 运行 [**Test connection**](#test-a-provider) 并确认 Claude 和 GPT 请求均成功，包括在选择其他提供商时。保存后，[start an Engine analysis](/langsmith/engine-self-hosted#verify-the-installation)验证完整设置。

> [标签] OpenAI
>
> OpenAI API 密钥，以及可选的 OpenAI 组织 ID。

具有完整凭据的提供程序显示为已配置。要稍后更改它们，请单击提供程序旁边的钥匙图标。

**2.测试提供商**单击**测试连接**。引擎使用保存的凭据或配置的云身份向它在该提供商上使用的每个模型发送一个小请求。它显示每个请求是否成功，如果没有，则说明原因。

**3.选择提供商并保存**

选择引擎可能使用的提供商，然后保存。

如果保存后引擎运行失败：

* **未选择提供程序：** 在选择并保存至少一个提供程序之前，引擎不会开始运行。
* **拒绝的凭据：** **测试连接** 报告哪个提供商拒绝了它们。更新凭据并再次测试。
* **模型不可用：** 在您的提供商帐户中启用模型，然后再次测试。

## 使用基岩运行时

要让引擎调用 Amazon Bedrock Runtime 而不是 Mantle，请在两个引擎工作负载上设置两个环境变量：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
engineInsightsAgent:
  apiServer:
    deployment:
      extraEnv:
        - name: ENGINE_BEDROCK_API
          value: "runtime"
        - name: ENGINE_BEDROCK_INFERENCE_PROFILE
          value: "<system-inference-profile-id>"
  queue:
    deployment:
      extraEnv:
        - name: ENGINE_BEDROCK_API
          value: "runtime"
        - name: ENGINE_BEDROCK_INFERENCE_PROFILE
          value: "<system-inference-profile-id>"
```

将`ENGINE_BEDROCK_INFERENCE_PROFILE`设置为Engine的Claude模型的系统推理配置文件ID，例如`us.anthropic.<model-id>`。支持的前缀为 `us.`、`eu.`、`apac.` 和 `global.`。不支持配置文件 ARN 和应用程序推理配置文件。授予呼叫身份 Bedrock Runtime 访问该配置文件的权限。然后应用 Helm 值，重新启动两个部署，并运行 [**Test connection**](#test-a-provider)。如果引擎升级更改了其 Claude 模型，请更新配置文件 ID。

在 BYOC 上，请联系 LangChain 进行此更改。

## 对您的模型提供商使用云身份

Amazon Bedrock、Google Vertex AI 和 Azure AI Foundry 可以使用 Engine pod 的云身份（而不是保存在 LangSmith 中的凭证）进行身份验证，而不是保存凭证。在 `engine.workloadIdentityProviders` 中列出这些提供商。为共享引擎和 Insights 部署的 API 服务器和队列配置身份：

> [选项卡] Amazon EKS
>
> 为服务账户 (IRSA) 配置 IAM 角色。信任两个引擎工作负载的命名空间和服务帐户，并授予角色对引擎使用的 Bedrock 模型的访问权限。
>
> ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> engine:
>   workloadIdentityProviders:
>     - bedrock
>
> engineInsightsAgent:
>   apiServer:
>     serviceAccount:
>       annotations:
>         eks.amazonaws.com/role-arn: "arn:aws:iam::<account-id>:role/<engine-model-access-role>"
>   queue:
>     serviceAccount:
>       annotations:
>         eks.amazonaws.com/role-arn: "arn:aws:iam::<account-id>:role/<engine-model-access-role>"
> ```> [标签] 谷歌 GKE
>
> 在集群和运行引擎的节点池上为 GKE 启用工作负载联合身份验证。在 Google 服务帐户上授予每个 Engine Kubernetes 服务帐户 `roles/iam.workloadIdentityUser`。将每个成员绑定为`serviceAccount:<cluster-project-id>.svc.id.goog[<namespace>/<kubernetes-service-account>]`。
>
> 在托管模型的项目中授予 Google 服务帐户 Vertex AI 推理权限，例如 `roles/aiplatform.user`。在该项目中启用所需的模型。
>
> ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> engine:
>   workloadIdentityProviders:
>     - vertex
>
> engineInsightsAgent:
>   apiServer:
>     serviceAccount:
>       annotations:
>         iam.gke.io/gcp-service-account: "<service-account>@<project-id>.iam.gserviceaccount.com"
>     deployment:
>       extraEnv:
>         - name: GOOGLE_CLOUD_PROJECT
>           value: "<vertex-project-id>"
>   queue:
>     serviceAccount:
>       annotations:
>         iam.gke.io/gcp-service-account: "<service-account>@<project-id>.iam.gserviceaccount.com"
>     deployment:
>       extraEnv:
>         - name: GOOGLE_CLOUD_PROJECT
>           value: "<vertex-project-id>"
> ```
>
> 引擎使用应用程序默认凭据 (ADC) 来解析身份和项目。将两个工作负载上的 `GOOGLE_CLOUD_PROJECT` 设置为预期的 Vertex AI 项目。引擎当前使用 `global` Vertex AI 位置，因此所需的模型必须在那里可用。> [选项卡] Azure AKS
>
> 启用 AKS OIDC 颁发者和 Microsoft Entra 工作负载 ID。为托管身份上的每个引擎 Kubernetes 服务帐户创建联合身份凭证。为每个集群使用集群的 OIDC 发行者、受众 `api://AzureADTokenExchange` 和主题 `system:serviceaccount:<namespace>:<kubernetes-service-account>`。
>
> 向身份授予认知服务用户角色，范围仅限于托管引擎模型的 Azure AI Foundry 资源。仅 Azure OpenAI 角色无法建立对 Claude 模型的访问权限。
>
> ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> engine:
>   workloadIdentityProviders:
>     - azure
>
> engineInsightsAgent:
>   apiServer:
>     serviceAccount:
>       annotations:
>         azure.workload.identity/client-id: "<managed-identity-client-id>"
>     deployment:
>       labels:
>         azure.workload.identity/use: "true"
>   queue:
>     serviceAccount:
>       annotations:
>         azure.workload.identity/client-id: "<managed-identity-client-id>"
>     deployment:
>       labels:
>         azure.workload.identity/use: "true"
> ```
>
> 两个工作负载都需要服务帐户注释和 Pod 标签。将 Foundry 资源名称保存在**设置 > 引擎 > 模型提供程序**下。

> [!警告]
>
> `engine.workloadIdentityProviders` 中列出的提供程序视为在未保存凭据的情况下进行配置，因此任何组织管理员都可以选择它。将身份范围限定为引擎使用的模型。保存的凭据优先于云身份。切换提供商时，请在删除其保存的凭据之前应用云身份配置。然后，在 **设置 > 引擎 > 模型提供程序** 下仅删除该提供程序保存的 API 密钥或服务帐户 JSON。对于 Bedrock，还要删除所有已保存的访问密钥、秘密访问密钥和会话令牌。保留 Azure AI Foundry 资源名称和任何 Bedrock 区域设置，然后再次 [test the provider](#test-a-provider)。

## 使用模型网关

如果您的组织通过自己的 LLM 网关路由模型流量，Engine 可以通过它发送其 Claude 和 GPT 调用，而不是直接调用提供商。该网关在 **设置 > 引擎 > 模型提供程序** 下显示为 **模型网关**。

> [!注意]
>
> 模型网关支持需要 LangSmith Helm 图表 `0.17.31` 或更高版本。

安装 LangSmith 的人都会在 Helm 值中配置网关，而不是在 UI 中。网关 URL 通常是私有地址，因此组织设置将允许任何组织管理员将引擎指向内部服务。 [BYOC](/langsmith/engine-self-hosted#engine-on-byoc) 尚不提供模型网关。

### 网关要求

您的网关必须：* **为 Claude 提供 Anthropic 消息 API，为 GPT 提供 OpenAI 响应 API，或两者。** 引擎在任一型号系列上运行。为了获得最佳效果，请同时服务。
* **转发`anthropic-beta`标头和请求正文不变。**引擎的Claude请求使用测试版功能，Anthropic可以在没有它的情况下拒绝它们。
* **返回每个响应的令牌使用情况。** 引擎使响应没有使用情况的调用失败。
* **接受提供程序模型 ID 引擎请求。** 如果您的网关将它们映射到其自己的部署，请保持响应的模型相同的模型系列。
* **将基本 URL 设置为网关的最终地址。** 引擎不遵循重定向，因此重定向的基本 URL（例如从 `http` 到 `https`）每次调用都会失败。

引擎仅发送模型请求。通过 API 密钥身份验证，它不会将组织、工作区或项目标识符发送到网关。

### 配置网关

**1.声明您的网关服务的 API**

告诉LangSmith网关服务哪些API。 LangSmith 仅在设置时显示**模型网关**：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
commonEnv:
  - name: ENGINE_GATEWAY_APIS
    value: '["anthropic","openai"]'
```

仅列出您的网关服务的 API：`anthropic`、`openai` 或两者。

**2.网关处的点引擎**在两个引擎工作负载上设置网关的基本 URL。引擎将 API 路径附加到每个 URL：

* `ENGINE_GATEWAY_ANTHROPIC_BASE_URL`：Anthropic SDK 客户端将用作其基本 URL 的 URL。引擎调用`<base URL>/v1/messages`。
* `ENGINE_GATEWAY_OPENAI_BASE_URL`：OpenAI SDK 客户端将使用的 URL，通常以 `/v1` 结尾。引擎调用`<base URL>/responses`。

仅设置您在 `ENGINE_GATEWAY_APIS` 中列出的 API 的 URL。 URL 必须使用 HTTPS。要信任私有证书颁发机构，请参阅[Mount internal CAs for TLS](/langsmith/self-host-custom-tls-certificates#mount-internal-cas-for-tls)。对于集群内的纯 HTTP 地址，还将 `ENGINE_GATEWAY_ALLOW_INSECURE_HTTP` 设置为 `"true"`。

**3.配置身份验证**

选择引擎如何向网关进行身份验证：> [选项卡] API 密钥
>
> 将网关密钥存储在 Kubernetes 密钥中并将其安装到两个引擎工作负载中。将 `ENGINE_GATEWAY_API_KEY_FILE` 设置为已安装文件的路径。
>
> ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> engineInsightsAgent:
>   apiServer:
>     deployment:
>       extraEnv:
>         - name: ENGINE_GATEWAY_ANTHROPIC_BASE_URL
>           value: "https://<gateway-host>/anthropic"
>         - name: ENGINE_GATEWAY_OPENAI_BASE_URL
>           value: "https://<gateway-host>/openai/v1"
>         - name: ENGINE_GATEWAY_API_KEY_FILE
>           value: "/etc/engine-gateway/api-key"
>       volumes:
>         - name: engine-gateway
>           secret:
>             secretName: engine-model-gateway
>       volumeMounts:
>         - name: engine-gateway
>           mountPath: /etc/engine-gateway
>           readOnly: true
>   queue:
>     deployment:
>       # The same extraEnv, volumes, and volumeMounts as apiServer.
> ```
>
> 默认情况下，引擎发送密钥为`Authorization: Bearer <key>`。如果您的网关需要另一个标头中的密钥，请将 `ENGINE_GATEWAY_AUTH_HEADER` 设置为该标头的名称，例如 `x-api-key`。然后引擎将密钥作为标头的值发送。
>
> 要发送其他标头，请挂载每个标头一个文件的目录，并将 `ENGINE_GATEWAY_HEADERS_DIR` 设置为其路径。每个文件的名称是标头名称，其内容是值。引擎保留`host`、`content-length`、`content-type`、`transfer-encoding`、`connection`以及以`x-langsmith-`开头的标头。
>
> 引擎在每次运行开始时读取密钥和头文件，因此您可以轮换它们而无需重新启动引擎。

> [选项卡] LLM 身份验证代理
>
> 如果您的网关位于 [LLM auth proxy](/langsmith/llm-auth-proxy-self-hosted) 后面，引擎可以使用短期 LangSmith 令牌而不是静态密钥进行身份验证。参见[Use the LLM auth proxy](#use-the-llm-auth-proxy)。

应用 Helm 值并重新启动两个引擎工作负载，以便它们获取新的环境变量。

**4.测试并选择网关**在“**设置 > 引擎 > 模型提供程序**”下，单击“**模型网关**”旁边的“测试连接**”。引擎通过网关为您配置的每个 API 发送一个小请求，并显示每个请求是否成功。如果网关拒绝请求，结果将包括网关的错误消息。然后选择**模型网关**并保存。

### 使用 LLM 身份验证代理

使用 LLM 身份验证代理，引擎永远不会持有网关密钥。代理验证 LangSmith 签名的令牌，并且您的代理配置添加网关的凭据。

对于每次运行，引擎都会从您的 LangSmith 安装请求一个令牌，并在每次模型调用时将其发送到 `X-LangSmith-LLM-Auth` 标头中。令牌的有效期为五分钟，引擎会在当前令牌过期之前请求新的令牌。 **测试连接**使用相同的流程。

设置方法：1. 完成[Set up the LLM auth proxy](/langsmith/llm-auth-proxy-self-hosted)的步骤 1 到 4：配置 JWT 签名和颁发者，为您的组织启用代理，设置 JWT 受众，并安装身份验证代理图表，并将您的网关作为其上游。
2. 在两个引擎工作负载上，将 `ENGINE_GATEWAY_AUTH` 设置为 `llm_auth_proxy`，并将基本 URL 指向身份验证代理服务而不是网关。不要设置`ENGINE_GATEWAY_API_KEY_FILE`：当两者都设置时，引擎将无法运行。

   代理将每个请求的路径附加到图表的 `authProxy.upstream` URL，因此请保留每个 API 在网关上的路径。例如，将 `authProxy.upstream` 设置为 `https://gateway.example.com` 并且网关在 `https://gateway.example.com/anthropic` 处为 Anthropic API 提供服务，请将 `ENGINE_GATEWAY_ANTHROPIC_BASE_URL` 设置为代理地址，后跟 `/anthropic`。该图表将服务命名为 `<release>-auth-proxy` 并默认侦听端口 `10000` (`authProxy.service.port`)。

   ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   engineInsightsAgent:
     apiServer:
       deployment:
         extraEnv:
           - name: ENGINE_GATEWAY_AUTH
             value: "llm_auth_proxy"
           - name: ENGINE_GATEWAY_ANTHROPIC_BASE_URL
             value: "http://<auth-proxy-service>.<namespace>.svc.cluster.local:10000/anthropic"
           - name: ENGINE_GATEWAY_OPENAI_BASE_URL
             value: "http://<auth-proxy-service>.<namespace>.svc.cluster.local:10000/openai/v1"
           - name: ENGINE_GATEWAY_ALLOW_INSECURE_HTTP
             value: "true"
     queue:
       deployment:
         # The same extraEnv as apiServer.
   ```

   仅当引擎通过集群内的纯 HTTP 到达身份验证代理时才需要 `ENGINE_GATEWAY_ALLOW_INSECURE_HTTP`。
3. 如果您组织的 **允许的 URL** 设置为 **自定义**，请将身份验证代理的主机名添加到列表中。引擎按计划运行，而不是以登录用户的身份运行。其令牌标识组织和工作区，`actor_type` 设置为 `api_key:service`，并且它们不包含 IdP 令牌。如果您的 `ext_authz` 或 `ext_proc` 服务将用户的 IdP 令牌交换为网关凭据，请单独处理引擎的请求，例如通过将工作区映射到网关凭据。

如果引擎报告未为组织启用 LLM 身份验证代理，或者组织没有 JWT 受众，请填写 [Configure organization settings in LangSmith](/langsmith/llm-auth-proxy-self-hosted#3-configure-organization-settings-in-langsmith)。

## 私密连接

引擎在公共出口处工作。要使其流量保持在专用网络上，请使用 AWS PrivateLink 连接到 LangSmith Intelligence，或通过云的专用终端节点连接到您自己的模型提供商。

### 连接 AWS PrivateLink

LangSmith 智能网关 `beacon.aws.langchain.com` 将请求路由到 LangChain 的 AWS 环境中的 Amazon Bedrock。

在配置 PrivateLink 之前，请完成[Install Engine](/langsmith/engine-self-hosted#install-engine)，包括其 Helm 和 egress 配置。

[AWS PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/) 将引擎流量从 VPC 路由到 LSI，而不将该流量暴露到公共互联网。 LSI端点服务托管在`us-east-2`，AWS支持其他区域的VPC访问。在开始之前，请收集您的 AWS 账户 ID、VPC ID、私有子网 ID 以及接口终端节点的安全组。配置该端点安全组，以允许端口 443 上的入站 TCP 流量仅来自附加到运行引擎的节点或工作负载的安全组，或者来自包含它们的最小私有 CIDR。不允许`0.0.0.0/0`。

要将您的 VPC 连接到 LSI：

**1.请求访问**

请联系您的客户代表或[sales@langchain.dev](mailto:sales@langchain.dev)并提供您的 AWS 账户 ID。 LangChain 将您的帐户添加到端点服务的允许主体列表中。

**2.创建接口 VPC 终端节点**

为包含您的 VPC 的区域配置 AWS 提供商。将 `service_region` 设置为 `us-east-2`，包括当您的 VPC 位于其他区域时。每个可用区选择一个私有子网。

> [!注意]
>
> `service_region` 参数需要 HashiCorp AWS 提供商 `5.82.0` 或更高版本。

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

**3.等待LangChain接受连接**

LangChain接受连接后，端点状态从`pendingAcceptance`更改为`available`。在测试连接之前，请等待几分钟让更改传播。

**4.将 LSI 主机名路由到端点**为您的 VPC 启用 DNS 解析和 DNS 主机名。然后，创建 Route 53 私有托管区域和别名记录，以便 `beacon.aws.langchain.com` 解析为 VPC 内的 VPC 终端节点。保持此主机名不变，以便 TLS 证书验证成功。当端点不可用时，私有托管区域还可以防止回退到公共 DNS。

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

**5.验证专用连接**

从运行引擎的节点或容器中，解析网关主机名：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
getent ahostsv4 beacon.aws.langchain.com
```

确认结果包含分配给端点网络接口的专用 IP 地址。然后开始分析并确认其成功完成。如果分析未完成，请检查引擎安装和出口配置。

### 私下连接到您的提供商引擎从 `standalone-insights` pod 调用每个提供商的标准 API 主机名。为了使该流量远离公共互联网，请设置云与提供商的专用连接，以便相同的主机名解析为网络内的专用地址：

| **提供商** | **主机名引擎调用** | **私人连接** |
| - | - | - |
|亚马逊基岩（地幔）| `bedrock-mantle.<region>.api.aws` | `com.amazonaws.<region>.bedrock-mantle` 的接口 VPC 终端节点，启用私有 DNS 或主机名的 Route 53 私有托管区域 |
|亚马逊基岩（运行时）| `bedrock-runtime.<region>.amazonaws.com` | `com.amazonaws.<region>.bedrock-runtime` 的接口 VPC 终端节点，启用私有 DNS |
|谷歌顶点人工智能 |全球区域为`<region>-aiplatform.googleapis.com`或`aiplatform.googleapis.com` |适用于 Google API 的专用服务连接，以及`googleapis.com` 的专用 DNS |
| Azure AI 铸造厂 | `<resource>.openai.azure.com` 和 `<resource>.services.ai.azure.com` | Foundry 资源的专用端点及其专用 DNS 区域 |
| Anthropic、OpenAI | `api.anthropic.com`、`api.openai.com` |无法使用。这些提供商需要公共出口，除非您通过 [model gateway](#use-a-model-gateway) 路由它们。 |Engine 不接受这些提供商的自定义端点 URL，因此专用连接通过 DNS 工作：标准主机名必须从 Engine Pod 解析为您的专用端点。要将模型流量发送到您选择的地址，请使用 [model gateway](#use-a-model-gateway)。

如果 Engine 使用 [cloud identity](#use-cloud-identity-for-your-model-providers) 进行身份验证，Pod 还需要访问云的令牌服务，例如 AWS 上 AWS STS 的接口 VPC 终端节点。

通过保存的 Vertex AI 服务帐户 JSON，还允许使用 HTTPS `oauth2.googleapis.com` 进行令牌交换，以及 `aiplatform.googleapis.com` 进行推理。

向 LangSmith Intelligence 报告使用情况是一个单独的连接。在 AWS 上，`https://beacon.aws.langchain.com/intelligence` 记录使用情况并支持 [AWS PrivateLink](#connect-with-aws-privatelink)，因此安装可以在 Bedrock 上运行引擎并报告使用情况，而无需公共出口。默认`https://beacon.langchain.com/intelligence`需要公共出口。

## 另请参阅

* [Engine on self-hosted](/langsmith/engine-self-hosted)：安装引擎并选择其运行模型的方式。
* [Engine security](/langsmith/engine-security#model-subprocessors)：模型子处理器控制。
* [Configure egress](/langsmith/self-host-egress)：来自自托管LangSmith的其他出站流量。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-self-hosted-model-providers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。