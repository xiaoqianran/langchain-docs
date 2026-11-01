<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How the LLM Gateway works | https://docs.langchain.com/langsmith/llm-gateway-how-it-works -->

# LLM 网关如何工作

了解 LLM 网关对每个请求执行的操作、如何解析上游凭据以及网关在何处可用。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

LLM Gateway 位于您的应用程序和工作区已配置的模型提供程序之间。它对调用者进行身份验证、选择上游路由、应用治理策略、在 API 格式之间进行转换并跟踪结果。

## 通过网关跟踪请求

网关对发送到标准端点的每个请求执行这些步骤。它应用的提供者密钥、权限和策略来自[setting up the gateway](/langsmith/llm-gateway-admin-setup)。1. **通过LangSmith API密钥对调用者进行身份验证和授权**，包括`gateway:invoke`权限检查。详情请参见[Authenticate to the LLM Gateway](/langsmith/llm-gateway-authentication)。
2. **从端点和模型 ID 解析路由**，包括任何配置的 [fallback candidates](/langsmith/llm-gateway-fallbacks)。
3. **加载上游凭证**，例如工作区提供者密钥或[Gateway Credits](/langsmith/llm-gateway-credits)凭证。详情请参见[Provider authentication](/langsmith/llm-gateway-provider-authentication)。
4. **评估预请求策略。** [Spend](/langsmith/llm-gateway-spend-policies)、[rate](/langsmith/llm-gateway-rate-limit-policies) 和 [model access](/langsmith/llm-gateway-model-access-policies) 限制可能会阻止请求。 [Data protection policies](/langsmith/llm-gateway-data-policy) 针对请求正文运行并在配置时对其进行编辑。
5. **当所选提供商使用不同的 API 格式时，翻译请求**。详情请参见[Understand translation behavior](/langsmith/llm-gateway-api-formats#understand-translation-behavior)。
6. **向上游发送请求**并接收或传输提供商响应。
7. **将响应翻译回客户端请求的 API 格式，并在适用的情况下恢复密文占位符。
8. **向调用者返回响应**，记录使用情况、成本、路由和策略元数据以及 LangSmith 跟踪。详情请参见[View LLM Gateway traces](/langsmith/llm-gateway-traces)。

[Direct model access](/langsmith/llm-gateway-direct-model-access) 跳过步骤 5 和 7。网关仍然进行身份验证、解析凭据、评估策略并跟踪调用，但它以提供商的本机格式传递请求和响应。

## 选择凭证的管理方式网关为每个调用解析上游凭证。工作区可以使用自己的提供商密钥、网关积分或两者。对于每个凭证来源以及计费者，请参阅 [Provider authentication](/langsmith/llm-gateway-provider-authentication#choose-a-credential-source)。

## 了解工作区范围

请求使用其 API 密钥所属工作区的设置。网关设置的范围有所不同：

* **提供者密钥**：工作区秘密。每个调用提供程序的工作区都需要自己的密钥。
* **后备链**：在一个工作区中创建，它们适用于来自该工作区的 API 密钥的请求。参见[Model fallbacks](/langsmith/llm-gateway-fallbacks)。
* **痕迹**：记录在发出请求的 API 密钥的工作区中。
* **模型配置**：工作区或组织范围。组织范围的配置读取组织机密。参见[Custom model configurations](/langsmith/llm-gateway-model-configurations)。
* **策略**：每个 [spend limit](/langsmith/llm-gateway-spend-policies)、[rate limit](/langsmith/llm-gateway-rate-limit-policies)、[model access policy](/langsmith/llm-gateway-model-access-policies) 和 [data policy](/langsmith/llm-gateway-data-policy) 适用于整个组织、一个工作区、一名用户或一个 API 密钥。

## 检查可用性

网关运行于：

* 每个LangSmith区域都有LangSmith云
* [Bring your own cloud (BYOC)](/langsmith/byoc)，它在您的数据平面内运行，以便模型请求及其跟踪保留在您的 VPC 中
*[Self-hosted](/langsmith/self-hosted)LangSmith这三者都使用相同的 API 格式、模型 ID、策略和跟踪。仅主机名和路径前缀不同。在早于应用程序版本 0.18.9 的自托管 LangSmith（0.18.0-rc.22 之前的 Helm 图表版本）上，管理策略需要 `organization:manage` 而不是 `organization:gateway:manage`。

### 使用区域网关

将 `gateway.smith.langchain.com` 替换为您的 LangSmith 区域的主机名，并为您使用的 API 格式保留相同的路径：

|地区 |网关主机名 |
| - | - |
|基仕伯美国 | `gateway.smith.langchain.com` |
| GCP 欧盟 | `eu.gateway.smith.langchain.com` |
|基仕伯亚太区 | `apac.gateway.smith.langchain.com` |
| AWS 美国 | `aws.gateway.smith.langchain.com` |

### 使用 BYOC 数据平面

在 BYOC 上，将网关主机名替换为您的 [data plane endpoint](/langsmith/byoc-usage#find-your-data-plane-endpoint) 并使用 `/gateway` 作为路径前缀：

| API格式 |基本网址 |提示端点 |
| - | - | - |
| OpenAI 聊天完成 | `https://<data_plane_host>/gateway/v1` | `POST /chat/completions` |
| Anthropic 留言 | `https://<data_plane_host>/gateway` | `POST /v1/messages` |
| OpenAI 回应 | `https://<data_plane_host>/gateway/v1` | `POST /responses` |

使用作用域为该数据平面中工作区的 API 密钥进行身份验证，并在 [Send the key](/langsmith/llm-gateway-authentication#send-the-key) 中列出的任何标头中发送。提供者机密、模型 ID、策略和跟踪的行为与云上相同。

> [!警告]
>
> 默认情况下，数据平面配置有专用终端节点，因此您需要专用连接才能到达基本 URL，例如 Tailscale、AWS PrivateLink 或 VPC 对等互连。### 使用自托管安装

在自托管 LangSmith 上，首先是管理员 [enables the gateway in the Helm chart](/langsmith/llm-gateway-self-hosted)。然后将网关主机名替换为您的 LangSmith 主机名，并使用 `/gateway` 为路径添加前缀：

| API格式 |基本网址 |提示端点 |
| - | - | - |
| OpenAI 聊天完成 | `https://<your-hostname>/gateway/v1` | `POST /chat/completions` |
| Anthropic 留言 | `https://<your-hostname>/gateway` | `POST /v1/messages` |
| OpenAI 回应 | `https://<your-hostname>/gateway/v1` | `POST /responses` |

使用范围仅限于您安装中的工作区的 API 密钥进行身份验证，该密钥通过 [Send the key](/langsmith/llm-gateway-authentication#send-the-key) 中列出的任何标头发送。

## 另请参阅

* [Send your first LLM Gateway request](/langsmith/llm-gateway-first-request)：发出您的第一个请求并查看其跟踪。
* [Set up the LLM Gateway](/langsmith/llm-gateway-admin-setup)：添加提供商密钥、授予开发人员访问权限并设置策略。
* [API formats](/langsmith/llm-gateway-api-formats)：通过标准端点使用聊天完成、消息或响应。
* [View LLM Gateway traces](/langsmith/llm-gateway-traces)：查看网关痕迹出现的位置以及谁可以查看它们。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-how-it-works.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。