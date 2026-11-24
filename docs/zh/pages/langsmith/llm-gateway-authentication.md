<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Authenticate to the LLM Gateway | https://docs.langchain.com/langsmith/llm-gateway-authentication -->

# 向 LLM 网关进行身份验证

为 LLM 网关请求选择一个 LangSmith API 密钥，授予其调用网关的权限，从客户端发送它，并修复身份验证错误。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

对 [LLM Gateway](/langsmith/llm-gateway) 的每个请求都使用 LangSmith API 密钥进行身份验证，而不是使用模型提供者的密钥进行身份验证。本页介绍了使用哪个密钥、它需要的权限以及每个客户端如何发送它。

## 理解两层

网关请求通过两个单独的身份验证检查：

* **您的客户端到网关**：您的代码发送一个以 `lsv2_` 开头的 LangSmith API 密钥。网关检查密钥的权限，然后应用您组织的策略。
* **提供者的网关**：网关使用存储在 LangSmith 中的凭证调用模型提供者，通常是保存为工作区机密的提供者 API 密钥。您的代码永远不会持有此凭据。有关每个提供商接受的凭证类型，请参阅[Provider authentication](/langsmith/llm-gateway-provider-authentication)。

## 选择密钥类型

两种[LangSmith API key](/langsmith/create-account-api-key)可以调用网关：* **[Personal access token (PAT)](/langsmith/administration-overview#personal-access-tokens-pats)**：前缀`lsv2_pt_`。 PAT 携带创建它的用户的权限。模拟器的 **创建网关密钥** 按钮创建 PAT。
* **[Service key](/langsmith/administration-overview#service-keys)**：前缀`lsv2_sk_`。服务密钥属于组织而不是用户。在 [Enterprise plan](/langsmith/pricing-plans) 上，您可以为服务密钥分配其自己的工作区角色。

> [!提示]
>
> 密钥类型改变[spend limits](/langsmith/llm-gateway-spend-policies)的应用方式。用户范围的支出限制适用于使用该用户的 PAT 发出的请求。它不适用于使用服务密钥发出的请求，即使是同一用户创建的请求。要限制服务密钥，请创建仅限于该 API 密钥的支出限制。

## 授予调用网关的权限

要调用网关，API 密钥需要其所属工作区中的 `gateway:invoke` 和 `workspaces:read`。当 PAT 的用户角色拥有这些权限时，PAT 就拥有这些权限。

哪些角色包括它们取决于您的计划：* **没有 [workspace roles](/langsmith/rbac#workspace-roles)** 的计划：每个用户都具有工作区管理员角色，其中包括这两种权限。无需设置。
* **企业计划**：工作区管理员角色包括这两种权限。内置工作区编辑者和工作区查看者角色两者都不包含，并且内置角色无法编辑。要在没有完全管理权限的情况下授予网关访问权限，请使用 `gateway:invoke` 和 `workspaces:read` 创建[custom role](/langsmith/rbac#custom-roles)，并将其分配给调用网关的用户。

对于具有自己角色的服务密钥，请分配内置 [Gateway Invoker](/langsmith/rbac#roles-for-keys-that-langsmith-creates) 角色（该角色恰好具有这两个权限），或者分配包含这两个权限的自定义角色。角色缺少 `gateway:invoke` 的服务密钥将获得带有 `missing permission gateway:invoke` 的 `403`。

## 使用工作区范围的键

使用范围仅限于一个工作区的 LangSmith API 密钥。该工作区确定网关读取哪些提供商机密、应用哪些策略以及跟踪的位置。对于 PAT，这是密钥的默认工作区。在模拟器中创建的密钥属于您创建它时打开的工作区。网关请求不支持组织范围的密钥。

## 发送密钥

网关接受以下任何标头中的密钥：

* `Authorization: Bearer <key>`
* `X-Api-Key: <key>`
* `X-Goog-Api-Key: <key>`每个客户端都会在这些标头之一中发送其 API 密钥，因此您可以在客户端期望其提供者密钥的位置设置该密钥：

|客户|在哪里设置 LangSmith API 密钥 |客户端发送的标头 |
| - | - | - |
| cURL 或任何 HTTP 客户端 |标题本身 | `Authorization: Bearer` |
| OpenAI SDK、代码 | `api_key` 或 `OPENAI_API_KEY` | `Authorization: Bearer` |
| Anthropic SDK，克劳德代码 | `api_key` 或 `ANTHROPIC_API_KEY` | `X-Api-Key` |
| Google Gen AI SDK、Gemini CLI | `api_key` 或 `GEMINI_API_KEY` | `X-Goog-Api-Key` |

具有 [Claude subscription](/langsmith/llm-gateway-coding-agents#use-claude-subscription-oauth) 的 Claude Code 是例外：其 `Authorization` 标头携带 Anthropic OAuth 令牌，因此它通过 `ANTHROPIC_CUSTOM_HEADERS` 发送 `X-Api-Key` 中的 LangSmith API 密钥。

有关基本 URL 和请求示例，请参阅 [API formats](/langsmith/llm-gateway-api-formats) 和 [Direct model access](/langsmith/llm-gateway-direct-model-access)。

## 设置环境变量

[LangChain](/oss/python/langchain/overview)聊天模型和[Deep Agents](/oss/python/deepagents/overview)从环境中读取密钥：

* `LANGSMITH_API_KEY`：LangSmith API 密钥，也用于跟踪。
* `LANGSMITH_GATEWAY`：设置为`true`，通过网关发送支持的聊天模型。详情请参见[Direct model access](/langsmith/llm-gateway-direct-model-access#configure-langchain-and-deep-agents)。
* `LANGSMITH_GATEWAY_API_KEY`：当网关请求需要与 `LANGSMITH_API_KEY` 不同的密钥时，可以覆盖网关请求。它必须满足相同的要求：工作空间范围，具有 `gateway:invoke`。

[Deep Agents Code](/oss/deepagents/code/overview) 需要 `LANGSMITH_GATEWAY_API_KEY`，即使它拥有与 `LANGSMITH_API_KEY` 相同的密钥。仅设置 `LANGSMITH_API_KEY` 时，它会在启动时以 `No credentials found for provider` 停止。

## 修复身份验证错误|现状和回应|原因 |修复|
| - | - | - |
| `401` 与 `{"error":"Unauthorized"}` |请求到达网关时没有 LangSmith API 密钥，例如使用提供商密钥 (`sk-...`) 代替。 |发送您的 LangSmith API 密钥来代替提供商密钥。 |
|来自提供商的`401`，例如OpenAI的`Incorrect API key provided: lsv2_pt_***`或Anthropic的`invalid x-api-key` |客户端将您的 LangSmith API 密钥直接发送给提供商，因为它没有使用网关基本 URL。 |将客户端的基本 URL 设置为网关。 |
| `403` 与 `{"error":"Forbidden"}` | LangSmith API 密钥无效。 |检查您是否复制了整个密钥，或创建一个新密钥。 |
| `403` 与 `{"error":"API key has expired"}` | LangSmith API 密钥已过期。 |创建一个新密钥。 |
| `403` 与 `missing permission gateway:invoke` |钥匙的角色缺少`gateway:invoke`。 |向管理员询问[grant the permission](#grant-permission-to-call-the-gateway)。 |

对于 `424`（显示屏蔽的提供程序密钥的错误），或当您的基本 URL 已指向网关时的 Anthropic `invalid x-api-key`，问题在于存储在 LangSmith 中的提供程序密钥，而不是您的 API 密钥。参见[Fix provider credential errors](/langsmith/llm-gateway-provider-authentication#fix-provider-credential-errors)。

请求策略阻止针对 [spend limit](/langsmith/llm-gateway-spend-policies) 返回 `402`，针对 [rate limit](/langsmith/llm-gateway-rate-limit-policies) 返回 `429`。响应正文为策略命名，例如 `{"type":"error","error":{"message":"request blocked by gateway policies: <POLICY_NAME>"}}`。

## 另请参阅* [Provider authentication](/langsmith/llm-gateway-provider-authentication)：存储网关用于调用每个提供商的凭据。
* [Set up the LLM Gateway](/langsmith/llm-gateway-admin-setup)：为您的组织设置提供商密钥、权限和策略。
* [Create a LangSmith API key](/langsmith/create-account-api-key)：创建 PAT 或服务密钥。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-authentication.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。