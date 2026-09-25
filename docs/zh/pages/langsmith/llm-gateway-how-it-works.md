<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How the gateway works | https://docs.langchain.com/langsmith/llm-gateway-how-it-works -->

# 网关如何工作

<Note>
LLM 网关位于[beta](/langsmith/release-stages)。
</Note>

LLM Gateway 位于您的应用程序和工作区已配置的模型提供程序之间。它对调用者进行身份验证、选择上游路由、应用治理策略、在 API 格式之间进行转换并跟踪结果。

## 网关提供什么

- **一键，多个提供商：** 开发人员使用 LangSmith API 密钥进行身份验证，而不是在本地存储提供商密钥。
- **一种请求格式，多个模型：** 将聊天完成、消息或响应与跨配置的提供程序的模型一起使用。
- **内置可观察性：** 每个网关调用都出现在网关跟踪项目中，可见性由[Traces and access control](/langsmith/llm-gateway-access)控制。
- **中央治理：**应用[spend limits](/langsmith/llm-gateway-spend-policies)、[rate limits](/langsmith/llm-gateway-rate-limit-policies)和[data policies](/langsmith/llm-gateway-data-policy)。

## 通过网关跟踪请求

网关对标准端点的每个请求执行以下步骤：1. **通过LangSmith API密钥对调用者进行身份验证和授权**，包括`gateway:invoke`权限检查。
2. **从端点和模型 ID 解析路由**，包括任何配置的 [fallback candidates](/langsmith/llm-gateway-fallbacks)。
3. **加载上游凭证**，工作区[Provider Secret](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets)或[Gateway Credits](/langsmith/llm-gateway-credits)凭证。
4. **评估预请求策略。** [Spend](/langsmith/llm-gateway-spend-policies)、[rate](/langsmith/llm-gateway-rate-limit-policies) 和 [model-access](/langsmith/llm-gateway-model-access-policies) 限制可能会阻止请求。 [Data-protection policies](/langsmith/llm-gateway-data-policy) 针对请求正文运行并在配置时对其进行编辑。
5. **当所选提供商使用不同的 API 格式时，翻译请求**。详情请参见[Understand translation behavior](/langsmith/llm-gateway-api-formats#understand-translation-behavior)。
6. **向上游发送请求**并接收或传输提供商响应。
7. **将响应翻译回客户端请求的 API 格式，并在适用的情况下恢复密文占位符。
8. **向调用者返回响应**，记录使用情况、成本、路由和策略元数据以及 LangSmith 跟踪。

[Direct model access](/langsmith/llm-gateway-direct-model-access) 跳过步骤 5 和 7。网关仍然进行身份验证、解析凭据、评估策略并跟踪调用，但它以提供商的本机格式传递请求和响应。

## 选择凭证的管理方式网关为每个调用解析上游凭证。工作区可以使用自己的提供商帐户、网关积分或两者：

|选项 |上游凭证|设置和计费|
| ---| ---| ---|
|带上您自己的提供商帐户 |管理员将提供者密钥存储在工作区[Provider Secrets](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets)中。 |提供商将使用费用记入您的提供商帐户。 |
| [Gateway Credits](/langsmith/llm-gateway-credits) | LangChain 拥有上游凭证。 |不需要提供商秘密。调用费用将计入您的 LangSmith 帐户。 |

## 检查可用性

该网关在每个 LangSmith 区域的 LangSmith 云上运行，并在 [BYOC](/langsmith/byoc) 上运行，它在您的数据平面内运行，以便模型请求及其跟踪保留在您的 VPC 中。两者都使用相同的 API 格式、模型 ID、策略和跟踪；仅主机名和路径前缀不同。

### 使用区域网关

将 `gateway.smith.langchain.com` 替换为您的 LangSmith 区域的主机名，并为您使用的 API 格式保留相同的路径：

|地区 |网关主机名 |
| ---| ---|
|基仕伯美国 | `gateway.smith.langchain.com` |
| GCP 欧盟 | `eu.gateway.smith.langchain.com` |
|基仕伯亚太区 | `apac.gateway.smith.langchain.com` |
| AWS 美国 | `aws.gateway.smith.langchain.com` |

### 使用 BYOC 数据平面

在 BYOC 上，将网关主机名替换为您的 [data plane endpoint](/langsmith/byoc-usage#find-your-data-plane-endpoint) 并使用 `/gateway` 作为路径前缀：| API格式 |基本网址 |提示端点 |
| ---| ---| ---|
| OpenAI 聊天完成 | `https://<data_plane_host>/gateway/v1` | `POST /chat/completions` |
| Anthropic 留言 | `https://<data_plane_host>/gateway` | `POST /v1/messages` |
| OpenAI 回应 | `https://<data_plane_host>/gateway/v1` | `POST /responses` |

使用作用范围为该数据平面中工作区的 API 密钥进行身份验证，以 `Authorization: Bearer` 令牌或提供者 API 密钥的形式传递。提供者机密、模型 ID、策略和跟踪的行为与云上相同。

<Warning>
默认情况下，数据平面配置有专用终端节点，因此您需要专用连接才能到达基本 URL，例如 Tailscale、AWS PrivateLink 或 VPC 对等互连。
</Warning>

<Note>
**自托管可用性：** LLM Gateway 不包含在 LangSmith v0.16.0 自托管稳定版本中。它在未来的稳定版本中可用。要表达兴趣，请提交[LLM Gateway self-hosted access request](https://www.langchain.com/langsmith-llm-gateway-self-hosted-access-request)。您还可以在 v17 RC 版本上尝试 LLM Gateway 或在稳定版本发布之前使用 BYOC。
</Note>

## 另请参阅

- [Quickstart](/langsmith/llm-gateway-quickstart)：发出您的第一个请求，查看其跟踪并设置支出限额。
- [Admin setup](/langsmith/llm-gateway-admin-setup)：启用网关、添加提供商凭据并授予开发人员访问权限。
- [API formats](/langsmith/llm-gateway-api-formats)：通过标准端点使用聊天完成、消息或响应。
- [Traces, Engine, and access control](/langsmith/llm-gateway-access)：查看网关痕迹出现的位置以及谁可以查看它们。

---<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-how-it-works.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>