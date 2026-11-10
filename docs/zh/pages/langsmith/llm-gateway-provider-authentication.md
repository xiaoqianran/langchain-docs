<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Provider authentication | https://docs.langchain.com/langsmith/llm-gateway-provider-authentication -->

# 提供者身份验证

选择 LLM 网关如何对每个模型提供程序进行身份验证、添加提供程序密钥作为工作区机密以及修复提供程序凭据错误。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

提供者身份验证是[LLM Gateway](/langsmith/llm-gateway)用来代表您调用模型提供者的凭证。由于 LangSmith 持有该凭证，因此开发人员和代理永远不需要提供者密钥的副本。

每个网关请求都会经过两层身份验证：

* 调用者 [authenticates to the gateway](/langsmith/llm-gateway-authentication) 具有 LangSmith API 密钥。
* 然后，网关使用本页讨论的凭证源之一向提供商进行身份验证。

## 选择凭证来源

每个请求都使用这些凭证源之一。每个来源都有不同的计费所有者：|来源 |谁持有该凭证|谁来计费 |设置|
| - | - | - | - |
|您的提供商密钥 | LangSmith，作为工作空间秘密 |提供商，在您的帐户上 | [Add a provider key](#add-a-provider-key) |
| [Model configuration](/langsmith/llm-gateway-model-configurations) (`custom/<name>`) | LangSmith，作为配置名称的秘密 |提供商，在您的帐户上 |创建配置 |
| [Gateway Credits](/langsmith/llm-gateway-credits) | LangChain | LangSmith，在您的 LangSmith 帐户上 |没有提供者凭证 |
| [Claude subscription](/langsmith/llm-gateway-coding-agents#use-claude-subscription-oauth) |用户的 Claude 代码登录信息，随每个请求一起发送 | Anthropic，关于用户的订阅 |仅克劳德代码 |

网关从请求中选择来源：

* **型号 ID**：`<provider>/<model>` ID，例如 `anthropic/claude-opus-5`，使用该提供商的提供商密钥。 `custom/<name>` ID 使用配置的秘密。 [Gateway Credits](/langsmith/llm-gateway-credits#available-models) 上列出的托管模型 ID（例如 `moonshotai/kimi-k3`）使用网关积分。
* **Claude 订阅**：当请求携带Anthropic OAuth 令牌时，网关会将其转发到Anthropic，并且不会加载工作区的`ANTHROPIC_API_KEY`。

## 添加提供商密钥网关从调用者的 API 密钥所属的工作区的机密中读取提供程序密钥。每个调用提供程序的工作区都需要该提供程序密钥的自己的副本。对于 `<provider>/<model>` 呼叫，网关不会回退到组织机密。组织机密仅适用于[organization-scoped model configurations](/langsmith/llm-gateway-model-configurations)。

添加提供者密钥需要该工作区中的[permission to manage secrets](/langsmith/rbac#workspace-roles)。如果没有它，**提供者机密**页面将隐藏添加按钮并要求您联系工作区管理员。

添加提供商密钥：

1. 在LangSmith中，选择调用提供者的工作区。
2. 转至 **设置 > 集成 > 提供商机密**。
3. 单击**+ 秘密**。在 **Provider** 下，选择提供者，其中填写机密名称。
4. 输入提供商密钥作为值，然后单击“**保存**”。

如果工作区没有提供者的密钥，模拟器会将该提供者的模型标记为 **需要密钥** 并在运行请求之前提示输入密钥。您在此处输入的密钥将作为机密保存在当前工作区中，与**提供者机密**页面上添加的密钥相同。

保存提供者密钥时，LangSmith 不会检查它。错误的密钥会在第一次请求时显示为提供商的错误。网关读取这些秘密名称：

|供应商|秘密名字|
| - | - |
| Anthropic | `ANTHROPIC_API_KEY` |
| AWS 基岩 | `AWS_IAM_ROLE_ARN`、访问键或`AWS_BEARER_TOKEN_BEDROCK`。参见[Configure Amazon Bedrock](#configure-amazon-bedrock)。 |
| Azure 铸造厂 | `AZURE_FOUNDRY_API_KEY` 和 `AZURE_FOUNDRY_RESOURCE_NAME`。对于 Entra ID，请参阅[Configure Azure Foundry](#configure-azure-foundry)。 |
|巴斯坦| `BASETEN_API_KEY` |
|烟花| `FIREWORKS_API_KEY` |
| Gemini企业代理平台 | `GOOGLE_VERTEX_AI_WEB_CREDENTIALS`。参见[Configure Gemini Enterprise Agent Platform](#configure-gemini-enterprise-agent-platform)。 |
|谷歌双子座 | `GOOGLE_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
|缩小| `SCALEDOWN_API_KEY` |
|类型安全 | `TYPESAFE_API_KEY` |
| xAI | `XAI_API_KEY` |

## 配置亚马逊基岩

Amazon Bedrock 支持三种凭证方法，您可以在提供商表单中设置：

|方法|秘密 |笔记|
| - | - | - |
| IAM 角色（推荐）| `AWS_IAM_ROLE_ARN` |网关承担该角色并使用短期凭证，因此 LangSmith 不存储长期 AWS 密钥。可在 LangSmith 云和 BYOC AWS 数据平面上使用。 |
| AWS 凭证 | `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`，加上 `AWS_SESSION_TOKEN` 用于临时凭证 |两把钥匙都是必需的。临时凭证过期后将停止工作。 |
|不记名令牌 | `AWS_BEARER_TOKEN_BEDROCK` | [Amazon Bedrock API key](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)。 |在自托管 LangSmith 上，当工作区没有 Bedrock 密钥时，网关还可以使用其自己 pod 的 AWS 凭证，例如 `agent-gateway` 服务账户的 IAM 角色。在 Helm 值的 `agentGateway.serviceAccount.annotations` 中设置角色注释。

如果工作区具有多个方法的机密，则网关将按以下顺序使用它找到的第一个：不记名令牌、IAM 角色、AWS 凭证，然后在自托管上使用 Pod 的凭证。

每个方法还读取可选的 `AWS_BEDROCK_REGION`，默认为 `us-east-1`。将其设置为纯区域名称，而不是 URL。当未设置且模型 ID 为 [cross-Region inference profile](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html)（例如以 `eu.` 开头）时，网关将使用该配置文件地理位置中的区域。

### 使用 IAM 角色

> [!注意]
>
> IAM 角色方法在 [self-hosted LangSmith](/langsmith/self-hosted) 或 BYOC GCP 和 Azure 数据平面上不可用。在自托管上，请为网关 Pod 提供自己的 AWS 凭证，如 [Configure Amazon Bedrock](#configure-amazon-bedrock) 中所述。在 BYOC GCP 和 Azure 数据平面上，使用 AWS 凭证或不记名令牌。在 [BYOC](/langsmith/byoc) AWS 数据平面上，角色需要 `LangSmithBedrock=true` 标签和不同的信任策略。参见[IAM trusted entity on BYOC](/langsmith/playground-model-providers#iam-trusted-entity-on-byoc)。在LangSmith云上，此处设置的`AWS_IAM_ROLE_ARN`秘密与[Playground and LLM-as-a-judge evaluators](/langsmith/playground-model-providers#iam-trusted-entity-recommended)共享。一个角色涵盖了所有这三个角色。以下权限还涵盖 Playground 和评估者。

要让网关承担 IAM 角色：

1. 在 AWS 中，创建一个 IAM 角色，该角色有权调用您使用的 Bedrock 模型。网关使用短期 API 密钥调用 Bedrock。因此，该角色还需要 `bedrock:CallWithBearerToken` 和 `bedrock-mantle:*`：

   ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "bedrock:InvokeModel",
           "bedrock:InvokeModelWithResponseStream",
           "bedrock:CallWithBearerToken",
           "bedrock-mantle:*"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

2. 在LangSmith中，选择调用基岩的工作区。转至 **设置 > 集成 > 提供商机密**，然后单击 **+ 机密**。

3. 在 **提供商** 下，选择 **Amazon Bedrock**，然后选择 **IAM 角色** 方法。输入角色 ARN 和 AWS 区域（可选）。

4. 复制表单显示的示例信任策略，并将其添加到 AWS 中的角色。在 LangSmith 云上，策略允许 LangSmith 的 AWS 账户承担该角色。在 BYOC AWS 数据平面上，它让您的数据平面角色代入该角色。在这两种情况下，策略都需要您的工作区 ID 作为外部 ID。

5. 单击**保存**。网关将每个会话限制为基岩操作，即使角色允许更多操作。会话持续一小时，网关会自动续订。在 AWS CloudTrail 中，会话名称为 `langsmith-gw-`，后跟工作区 ID。

### 验证基岩设置

使用 Bedrock 控制台中的模型 ID 发送带有 `bedrock/<model-id>` 模型 ID 的测试请求。这些错误指向凭据：

* **`400` 与 `bedrock credentials not found`**：工作区没有基岩秘密。 Bedrock 在此返回 `400`，而不是其他提供商因丢失密钥而返回的 `424`。
* **`400` 与 `incomplete AWS access-key credentials`**：缺少 `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY` 之一。
* **`403` 与 `STS denied AssumeRole for the configured Bedrock role`**：角色的信任策略不允许 LangSmith，或其外部 ID 不是工作区 ID。在自托管 LangSmith 上，信任策略必须允许 pod 自己的身份。

## 配置 Azure Foundry

Azure Foundry 支持 API 密钥或 Microsoft Entra ID 服务主体。服务主体身份验证允许您使用[disable local authentication](https://learn.microsoft.com/en-us/azure/ai-services/disable-local-auth) 的资源。

两种方法都需要`AZURE_FOUNDRY_RESOURCE_NAME`。将其设置为 Azure 资源名称，而不是 URL 或部署名称。网关向 Azure 公有云中的`<resource-name>.openai.azure.com`发送请求。对于 API 密钥身份验证，请通过 Azure Foundry 提供程序表单添加 `AZURE_FOUNDRY_API_KEY` 和 `AZURE_FOUNDRY_RESOURCE_NAME`，如 [Add a provider key](#add-a-provider-key) 中所述。

### 使用 Entra ID 服务主体

要使用 Entra ID 服务主体而不是 API 密钥：

1. 在 Foundry 资源上部署模型，或使用现有部署。记录资源名称和部署名称。使用部署名称作为请求中的 `model` 值。

2. Microsoft Entra ID 中的[Register an application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)，或使用现有的应用程序注册。记录其目录（租户）ID 和应用程序（客户端）ID。

3. [Add a client secret](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials) 到应用程序注册。记录秘密的值，而不是其 ID。

4. 在 Foundry 资源上，而不是其中的项目，[assign the app's service principal](https://learn.microsoft.com/en-us/azure/foundry/concepts/rbac-foundry) `Foundry User` 角色（以前的 `Azure AI User`）。通用 `Owner`、`Contributor` 和 `Reader` 角色不具有 [grant permission to call models](https://learn.microsoft.com/en-us/azure/foundry/concepts/rbac-foundry#permissions-for-each-built-in-role)。

5. 在 LangSmith 中，选择路由 Azure 请求的工作区。转到 **设置 > 集成 > 提供商机密** 并将以下各项添加为自定义机密：

   |秘密名字|价值|
   | - | - |
   | `AZURE_FOUNDRY_RESOURCE_NAME` | Azure 资源名称。 |
   | `AZURE_TENANT_ID` |目录（租户）ID。 |
   | `AZURE_CLIENT_ID` |应用程序（客户端）ID。 |
   | `AZURE_CLIENT_SECRET` |客户端秘密值。 |在提供程序选择器中选择 **自定义** 以输入每个密钥的名称和值。 Azure Foundry 提供程序表单仅公开 API 密钥身份验证。

6. 如果设置了`AZURE_FOUNDRY_API_KEY`，请将其从工作区中删除。即使资源禁用 API 密钥身份验证，API 密钥也优先于服务主体凭据。

所有三个 Entra ID 密码都是必需的。网关自动获取并刷新 Azure 访问令牌。用户继续使用其 LangSmith API 密钥（而不是 Azure 凭据）对网关进行身份验证。

此方法使用客户端机密。它不使用托管身份或工作负载身份联合。客户端密钥会过期，因此当您在 Entra ID 中轮换密钥时请更新 `AZURE_CLIENT_SECRET`。

### 验证设置

在[grant gateway access](/langsmith/llm-gateway-authentication#grant-permission-to-call-the-gateway)之后，使用您的LangSmith API密钥通过网关发送测试请求：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/azure/v1/chat/completions \
  --header "Authorization: Bearer $LANGSMITH_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "model": "<deployment-name>",
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

`chat.completion` 响应确认设置。对于其他云区域，请将主机名替换为您的 [regional gateway](/langsmith/llm-gateway-how-it-works#use-a-regional-gateway)。

如果 Azure 返回 `PermissionDenied`，请确认 `Foundry User` 角色是在 Foundry 资源上分配的，而不是在项目上分配的。新的角色分配需要[up to 10 minutes](https://learn.microsoft.com/en-us/azure/role-based-access-control/troubleshooting#symptom---role-assignment-changes-are-not-being-detected)才能生效。

## 配置Gemini企业代理平台Gemini Enterprise Agent Platform 在提供商表单中列为 **Google Vertex AI**，使用 JSON 格式的 Google Cloud 服务帐户密钥进行身份验证。网关将密钥交换为短期访问令牌。它不支持工作负载身份联合、应用程序默认凭据或其他外部帐户凭据。 `type` 不是 `service_account` 的凭证文件返回 `400`。

添加服务帐户密钥：

1. 在 Google Cloud 中，[create a service account key](https://cloud.google.com/iam/docs/keys-create-delete) 表示可以调用您使用的模型的服务帐号。
2. 在LangSmith中，选择调用提供程序的工作区。转至 **设置 > 集成 > 提供商机密**，然后单击 **+ 机密**。
3. 在 **提供商** 下，选择 **Google Vertex AI**。将密钥的 JSON 内容粘贴为值，然后单击 **保存**。

该表单将密钥保存为 `GOOGLE_VERTEX_AI_WEB_CREDENTIALS`，与 [Playground](/langsmith/managing-model-configurations) 使用的密钥相同。网关还读取`VERTEX_SERVICE_ACCOUNT_JSON`，并在两者都设置时首先使用它。

网关读取两个可选的自定义机密：

* **`VERTEX_PROJECT`**：要调用的 Google Cloud 项目。默认为密钥中的`project_id`。
* **`VERTEX_LOCATION`**：`global` 或 Google Cloud 区域，例如 `us-central1`。默认为`global`。在自托管 LangSmith 上，[GKE workload identity](/langsmith/self-host-gke-vertex-ai-workload-identity) 涵盖 Playground、Chat 和 Insights，而不是网关。网关仍然需要服务帐户密钥。

## 修复提供商凭证错误

网关将提供者错误传递给调用者，因此大多数凭据问题显示为提供者自己的状态代码和错误正文。 [⟦T78⟧](/langsmith/llm-gateway-api-formats#read-response-metadata) 响应标头区分了两者：对于提供者错误，它包括 `"outcome":"upstream_error"` 和 `"upstream_error_source":"provider_response"`，提供者的状态为 `upstream_status_code`。

要查看调用者的工作区可以访问哪些提供者，请调用 [⟦T82⟧](/langsmith/llm-gateway-api-formats#list-models)。它仅列出在该工作区中拥有密钥的提供者的 `<provider>/<model>` ID。

|现状和回应|原因 |修复 |
| - | - | - |
| `424` 与 `Required workspace secret "<SECRET_NAME>" is missing.` |调用者的 API 密钥所属的工作区在模型 ID 中没有提供者的密钥。 | [Add the provider key](#add-a-provider-key) 到该工作区，或使用具有 API 密钥的工作区中的 API 密钥。 |
|来自提供商的 API 密钥错误，例如 OpenAI 的 `Incorrect API key provided: sk-...`，或来自 xAI 的 `400` 和 `Incorrect API key provided.` | LangSmith 中存储的提供商密钥无效或已撤销。 |替换存储的提供商密钥。 |
| Anthropic 的 `invalid x-api-key`，客户端的基本 URL 设置为网关 |存储的Anthropic密钥无效或已撤销。 |更换存储的`ANTHROPIC_API_KEY`。 |Amazon Bedrock 和 Gemini Enterprise Agent Platform 返回 `400` 命名缺失的凭证，而不是 `424`。参见[Verify the Bedrock setup](#verify-the-bedrock-setup)。

对于来自调用者的 LangSmith API 密钥的错误，例如 `401` 和 `403`，或来自绕过网关的客户端的 `invalid x-api-key`，请参阅 [Fix authentication errors](/langsmith/llm-gateway-authentication#fix-authentication-errors)。

## 另请参阅

* [Authenticate to the LLM Gateway](/langsmith/llm-gateway-authentication)：选择并发送调用者使用的LangSmith API 密钥。
* [Set up the LLM Gateway](/langsmith/llm-gateway-admin-setup)：为您的组织设置提供商密钥、权限和策略。
* [Direct model access](/langsmith/llm-gateway-direct-model-access)：通过提供商特定的网关路径调用提供商 API。
* [Self-hosted LLM Gateway](/langsmith/llm-gateway-self-hosted)：在自托管LangSmith上启用网关。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-provider-authentication.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。