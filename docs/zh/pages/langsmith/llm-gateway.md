<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LLM Gateway | https://docs.langchain.com/langsmith/llm-gateway -->

# 法学硕士网关

通过一个 LangSmith 端点路由来自代理的模型调用，每个调用都在 LangSmith 中跟踪并受组织策略的管理。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

LLM Gateway 是您运行的代理和应用程序以及您的工作区已配置的模型提供程序之间的控制层。由于网关是 LangSmith 的一部分，因此每个将其称为路由的内容都会成为记录为其制定的路由和策略决策的 LangSmith 跟踪。您的应用程序使用 [LangSmith API key](/langsmith/create-account-api-key) 进行身份验证。网关将每个请求路由到其模型 ID 中指定的提供程序、跟踪调用并应用组织的治理策略。

如果没有网关，每个应用程序和部署都拥有自己的提供程序密钥。可靠性、支出和数据控制是为每个提供商帐户单独设置的。对于网关，提供商密钥保留在 LangSmith 中，而 [model fallbacks](/langsmith/llm-gateway-fallbacks)、[spend limits](/langsmith/llm-gateway-spend-policies)、[rate limits](/langsmith/llm-gateway-rate-limit-policies) 和 [data policies](/langsmith/llm-gateway-data-policy) 适用于其范围内的每个调用。当回退触发或策略阻止呼叫时，[trace](/langsmith/llm-gateway-traces) 显示每次尝试和策略检查。此外，违规行为会在[LangSmith Engine](/langsmith/engine)中出现以进行分类。

## 选择请求格式网关接受 OpenAI 聊天完成、Anthropic 消息和 OpenAI 响应请求。请求格式和提供者是独立的：聊天完成请求可以调用Anthropic模型，当提供者使用不同的本机格式时，网关会转换请求和响应。保留应用程序已使用的格式，并通过更改模型 ID 来切换提供程序。有关端点、模型 ID 语法和转换行为，请参阅 [API formats](/langsmith/llm-gateway-api-formats)。

LangChain 聊天模型和 Deep Agents 通过 `LANGSMITH_GATEWAY` 环境变量到达网关，该环境变量在每个提供商的本机格式中使用 [direct model access](/langsmith/llm-gateway-direct-model-access)，因此不适用翻译。

## 选择凭证的管理方式

网关使用 LangSmith 持有的凭证调用每个提供商：您自己的提供商密钥，存储为工作区秘密，或 [Gateway Credits](/langsmith/llm-gateway-credits)，LangChain 向您的 LangSmith 帐户计费。对于每个凭证来源以及计费者，请参阅 [Provider authentication](/langsmith/llm-gateway-provider-authentication#choose-a-credential-source)。

## 后续步骤

从适合您的角色的指南开始：

> [卡片][Set up the gateway for your organization](/langsmith/llm-gateway-admin-setup)
>
> 完成初始设置以通过网关路由请求。

> [卡][Send your first request](/langsmith/llm-gateway-first-request)
>
> 从模拟器发送请求，从代码调用网关，然后查看跟踪。

如有其他问题，请联系[LangChain support](https://support.langchain.com)。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。