<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Send your first LLM Gateway request | https://docs.langchain.com/langsmith/llm-gateway-first-request -->

# 发送您的第一个 LLM 网关请求

从模拟器通过 LLM 网关发送您的第一个请求，从您的代码调用网关，并查看请求的跟踪。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

[LLM Gateway](/langsmith/llm-gateway) 通过一个端点跨提供商调用模型，并通过一个[LangSmith API key](/langsmith/create-account-api-key) 进行身份验证。 Instead of copying each provider's key into every app, your code uses one key and switches providers by changing the model ID, while LangSmith traces every call and applies your organization's spend limits.

在此页面上，您可以从 LangSmith UI 中的模拟器和代码发送请求。然后，在LangSmith中查看其踪迹。

> [!提示]
>
> 此页面供开发者通过网关发送请求。如果您要为您的组织设置网关，请从 [Set up the LLM Gateway](/langsmith/llm-gateway-admin-setup) 开始。

## 开始之前

您需要：

* **Membership in a LangSmith organization on a paid plan.** On the Developer plan, the Simulator offers only LangChain-hosted models, which bill [Gateway Credits](/langsmith/llm-gateway-credits) instead of using a provider key.
* **模型提供者的 API 密钥**，除非您的工作区已经有一个。模拟器会显示哪些提供商已设置。

## 在模拟器中运行请求模拟器从您的浏览器通过网关发送示例请求，以便您可以在更改任何代码之前确认您的密钥和模型工作。

网关使用两个密钥：

* 您的提供商密钥作为 [workspace secret](/langsmith/llm-gateway-provider-authentication#add-a-provider-key) 保留在 LangSmith 中。网关使用它来呼叫提供商。
* 您的网关密钥是一个 LangSmith API 密钥，以 `lsv2_` 开头，您的代码将其发送到网关。

要运行请求：

1. 在 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-llm-gateway-first-request) 中，转到 **LLM Gateway** 并选择 **Simulator** 选项卡。
2. 在 **模型路由** 下，选择一个模型。 **模型图块上需要密钥**意味着您的工作区还没有该提供程序的密钥。
3. 单击**运行请求**。如果缺少密钥，模拟器会在发送请求之前提示您输入密钥。

响应显示在请求下方。如果请求失败，请记下错误，并参见[Troubleshoot](#troubleshoot)。

## 从您的代码发送请求

与直接调用提供商相比，网关请求改变了两件事：

* 基本 URL 指向网关而不是提供商的 API。
* API 密钥是您的 LangSmith API 密钥，而不是提供商的密钥。

发送请求：

1. 在您的环境中设置您的 LangSmith API 密钥和网关的基本 URL：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_API_KEY="lsv2_..."
   export LANGSMITH_GATEWAY_BASE_URL="https://gateway.smith.langchain.com/v1"
   ```这是美国的门户。对于其他区域，请将主机名替换为您的 [regional gateway](/langsmith/llm-gateway-how-it-works#use-a-regional-gateway)。在 [BYOC](/langsmith/llm-gateway-how-it-works#use-a-byoc-data-plane) 上，使用您的数据平面 URL，后跟 `/gateway/v1`。在 [self-hosted LangSmith](/langsmith/llm-gateway-self-hosted#make-your-first-call) 上，使用您的 LangSmith URL，后跟 `/gateway/v1`。

2. [List the models](/langsmith/llm-gateway-api-formats#list-models)您可以拨打：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   curl "$LANGSMITH_GATEWAY_BASE_URL/models" \
       -H "Authorization: Bearer $LANGSMITH_API_KEY"
   ```

   响应中的每个`id`都是一个模型ID。该列表反映了您的工作区的提供程序密钥和模型访问策略。

3. 发送请求。将 `<MODEL_ID>` 替换为列表中的聊天模型 ID，例如您在模拟器中测试的模型：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   curl "$LANGSMITH_GATEWAY_BASE_URL/chat/completions" \
       -H "Authorization: Bearer $LANGSMITH_API_KEY" \
       -H "Content-Type: application/json" \
       -d '{"model":"<MODEL_ID>","messages":[{"role":"user","content":"Explain what an LLM gateway does in one sentence."}]}'
   ```

   成功的请求会返回一个 JSON 响应，其中包含一句话答案。如果失败，请参阅[Fix authentication errors](/langsmith/llm-gateway-authentication#fix-authentication-errors)。

> [!提示]
>
> 此请求使用聊天完成[API format](/langsmith/llm-gateway-api-formats)。对于 Python 或 TypeScript 或 Anthropic 消息或响应格式的相同请求，请在模拟器中选择格式和语言，然后单击复制图标。复制的代码已使用您的部署的网关 URL。

[LangChain](/oss/python/langchain/overview)聊天模型和[Deep Agents](/oss/python/deepagents/overview)无需更改代码。将 `LANGSMITH_GATEWAY` 与 `LANGSMITH_API_KEY` 一起设置为 `true`，流程中每个受支持的聊天模型都会以其提供商的本机 API 格式调用网关。详情请参见[Direct model access](/langsmith/llm-gateway-direct-model-access#configure-langchain-and-deep-agents)。

## 查看轨迹在模拟器中，单击响应旁边的 **查看跟踪**。来自您的代码的请求出现在 **LLM Gateway** 的同一个 **Traces** 选项卡中。默认情况下，跟踪记录元数据，例如令牌计数和成本。有关更多信息，请参阅[View LLM Gateway traces](/langsmith/llm-gateway-traces)。

## 故障排除

对于 `401` 和 `403` 错误，请参阅 [Fix authentication errors](/langsmith/llm-gateway-authentication#fix-authentication-errors)。对于 `424` 错误，请参阅 [Fix provider credential errors](/langsmith/llm-gateway-provider-authentication#fix-provider-credential-errors)。

模拟器会发出缺少权限的信号，但不显示错误代码：

|症状|原因 |修复 |
| - | - | - |
|没有 **运行请求** 按钮 |您缺少 `gateway:invoke` 权限。 |请工作区管理员授予它。 |
|模拟器要求您联系管理员 |您缺乏添加提供商密钥的权限。 |要求工作区管理员添加提供程序密钥。 |

## 后续步骤

现在您可以通过网关发送请求，探索它的其他功能：

* [Set a spend limit](/langsmith/llm-gateway-spend-policies)：按组织、工作区、API 密钥或用户划分的支出上限。
* [Add model fallbacks](/langsmith/llm-gateway-fallbacks)：在备份模型上重试失败的请求，并在模拟器中测试链。
* [API formats](/langsmith/llm-gateway-api-formats)：发送聊天完成、消息或响应请求。
* [Set up coding agents](/langsmith/llm-gateway-coding-agents)：通过网关路由 Claude Code、Codex、Gemini CLI 或 Deep Agents Code。
* [Gateway Credits](/langsmith/llm-gateway-credits)：无需提供者密钥即可调用 LangChain 托管模型。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-first-request.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。