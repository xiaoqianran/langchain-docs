<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model fallbacks | https://docs.langchain.com/langsmith/llm-gateway-fallbacks -->

# 模型回退

当主模型速率限制、错误或返回另一个配置的状态代码时，自动重试备份模型的请求。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

当主模型返回已配置的错误（例如速率限制或提供程序中断）时，LLM Gateway 中的模型回退允许您针对一个或多个备份模型重试请求。

在 LangSmith 中定义一次后备顺序，然后继续在应用程序中使用标准 LLM 网关端点和模型 ID。

## 它是如何工作的

后备链具有：* **主模型**：请求失败时触发链的提供者和模型。
* **一到五个后备**：提供者模型的有序列表或保存的[model configurations](/langsmith/model-configurations)。提供程序模型使用该提供程序的工作区密钥，或适用于符合条件的托管模型的网关积分。
* **触发器**：将请求移至下一个模型的 HTTP 状态代码。默认值涵盖常见超时、速率限制和服务器错误，例如 `408`、`429`、`500` 和 `503`。它们不包括 `424`，当模型在工作区中没有提供程序密钥时网关会返回该`424`。添加 `424` 让链条在没有密钥的情况下跳过回退。没有密钥的主模型会返回`424`，而无需尝试链。
* **首次输出超时**：每次尝试在网关移动到下一个模型之前可以等待多长时间。默认情况下，它会在 120 秒后打开，每次尝试都会获得一个新的计时器。 [unified API format](/langsmith/llm-gateway-api-formats) 中的流请求等待第一个输出。非流式请求和[direct model access](/langsmith/llm-gateway-direct-model-access)请求等待响应标头。

> [!提示]
>
> [rate limit policy](/langsmith/llm-gateway-rate-limit-policies) 在网关调用主模型之前阻塞请求，因此其`429` 不会触发该链。只有来自提供商的 `429` 才可以。

对于每个请求：1. 网关调用由请求的提供者前缀模型 ID 选择的主模型。
2. 如果请求因配置的触发状态而失败、超时或遇到传输错误，则网关将加载匹配的后备链。
3. 网关按顺序调用每个回退，直到一个成功、返回不会触发另一个回退的状态或链耗尽。
4. 网关以客户端使用的API格式返回最终响应。

一旦流响应开始发送输出，网关就会提交该模型并且不再回退，即使流稍后失败也是如此。

后备模型可以使用与主要模型不同的提供程序和 API 格式。网关在 [supported API formats](/langsmith/llm-gateway-api-formats) 之间转换请求和响应，因此 Anthropic 主节点可以回退到 OpenAI 模型，而无需客户端更改。

后备链适用于统一端点和直接模型访问路径上的聊天完成、响应和消息请求。其他端点（例如嵌入）无需回退即可调用所请求的模型。每次尝试都会根据 [spend policies](/langsmith/llm-gateway-spend-policies) 单独进行跟踪和计数。使用两个回退的请求会记录三个模型调用：主要尝试和两次回退尝试。

## 创建后备链

> [!警告]
>
> 创建和管理后备链需要 `organization:gateway:manage` 权限。组织管理员和组织操作员默认拥有它。有关每个组织角色可以执行的操作，请参阅[Organization roles](/langsmith/rbac#organization-roles)。

创建后备链：

1. 转到 **LLM Gateway**，然后选择 **模型回退** 选项卡。
2. 单击**创建后备链**。
3. 选择链适用的**工作区**。
4. 选择主要提供商和型号。当主要尝试失败时，对此提供者前缀的模型 ID 的请求将使用该链。
5. 在 **后备** 下，按照网关应尝试的顺序添加一到五个备份模型。直接选择提供商和模型、选择现有模型配置或创建自定义模型配置。
6. 在 **配置回退触发器（高级）** 下，查看触发下一个回退的 HTTP 状态代码。要添加状态代码，请在字段中键入它，然后从列表中选择它。7. （可选）在同一部分中，调整 **每个模型的首次输出超时（秒）**，或关闭 **首次输出时间** 以删除超时。
8. 单击**创建链**。

> [!提示]
>
> 提供者和模型可以在每个工作区中拥有一个后备链。要更改其行为，请编辑现有链。

## 在模拟器中测试一条链

模拟器通过回退链发送请求，同时模拟链中每个模型的行为方式，因此您可以在提供程序在生产中失败之前检查链的路由和增加的延迟。

测试链：

1. 转到 **LLM Gateway**，然后选择 **模型回退** 选项卡。
2. 在链的行上，单击**在模拟器中打开→**。
3. 在 **模拟提供商行为** 下，为链中的每个模型选择一种行为（正常、超时、速率限制或中断）。
4. 单击“**运行请求**”。

结果显示哪个模型服务了请求，然后列出每次尝试及其状态和持续时间。尝试下方是**回退跃点**的数量、失败尝试所增加的**延迟以及请求的总 **令牌**。 **查看跟踪** 打开为请求提供服务的尝试的跟踪。

测试时请记住以下几点：* **模拟故障不发送推理请求。** 为了估算网络延迟，网关调用不生成令牌的提供商端点。模拟故障没有痕迹。
* **模拟故障仅在触发状态下回退。** 仅当 `429` 和 `503` 位于链的触发器中时，速率限制和中断才会移至下一个模型。两者均采用默认设置。
* **模拟器仅发送非流请求。** 要检查链的流行为，请从代码发送流请求。
* **模拟之外的错误仍然存​​在。** 如果回退在工作区中没有提供程序密钥，则其尝试返回 `424`，就像在生产中一样。如果主节点没有密钥，模拟器会要求您在运行链之前添加一个密钥。

## 拨打电话

使用主模型的提供商前缀 ID 调用标准 LLM 网关端点。您不需要特定于路由的 URL 或其他请求字段。此示例使用[Send your first LLM Gateway request](/langsmith/llm-gateway-first-request#send-a-request-from-your-code)中设置的基本 URL 和 API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl "$LANGSMITH_GATEWAY_BASE_URL/chat/completions" \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"<PRIMARY_MODEL_ID>","messages":[{"role":"user","content":"Hello!"}]}'
```

网关应用在 API 密钥工作区中为 `<PRIMARY_MODEL_ID>` 配置的后备链。如果没有链匹配，网关将返回主要模型的响应，而不尝试回退。## 调查后备尝试

当链运行时，响应记录网关尝试的模型、每次尝试的状态代码以及服务请求的模型：

* **在您的跟踪中**：如果您的应用程序通过 Python 中的 LangChain 聊天模型（`langchain-openai>=1.6.7` 或 `langchain-anthropic>=1.7.5`）调用网关且[tracing](/langsmith/observability) 打开，则该模型的运行将有一个 **Gateway** 部分，其中列出了每次尝试。
* **在响应中**：其他客户端可以读取`X-LangSmith-Gateway-Metadata`[response header](/langsmith/llm-gateway-api-formats#read-response-metadata)。它的 `attempt_details` 字段列出了每次尝试的模型和状态代码，并且 `selected_model` 命名了服务该请求的模型。

## 设置提示的后备

保存在 LangSmith 中的 [prompt](/langsmith/prompt-engineering-concepts#prompts-in-langsmith) 存储模型选择及其模板，因此您的应用程序可以将两者一起拉取并运行。后备链适用于对其工作区中的主要模型的每个请求。

要为同一模型提供与其他流量不同的提示后备行为，请将提示指向其自己保存的[model configuration](/langsmith/llm-gateway-model-configurations)，并将该配置设为链的主要配置。提示符调用配置为`custom/<name>`，网关应用该配置的链。

要配置提示的后备：1. 在 **设置** > **模型配置** 中，[create a model configuration](/langsmith/model-configurations#create-a-configuration) 代表您希望提示使用的提供程序和模型。请注意接下来两个步骤将使用的配置名称 `<config_name>`。组织范围的配置从组织机密中读取提供程序密钥，因此如果密钥是工作区机密，请创建工作区配置。
2. [Create a fallback chain](#create-a-fallback-chain) 在同一工作空间中。对于主模型，从模型列表末尾的 **模型配置** 部分选择您的配置，而不是其底层提供程序和模型。该链的主要模型是`custom/<config_name>`，与底层模型上的任何链分开。
3. 操场上的[Create a prompt](/langsmith/create-a-prompt)。单击当前模型的名称打开**模型配置**，然后选择**LangSmith网关**作为**提供商**。在 **型号** 字段中输入 `custom/<config_name>`，然后单击 **应用**。单击“**开始**”以检查提示符是否运行。单击“**保存**”，并为提示命名。
4. 在您​​的申请中，[pull the prompt with its model](/langsmith/manage-prompts-programmatically#pull-a-prompt)。在Python中，调用`client.pull_prompt`时设置`include_model=True`。

调用拉取的提示会通过网关发送请求，该网关应用配置的后备链。仅拉取提示模板，不包含模型配置。> [!提示]
>
> 后备链属于模型配置，而不是提示本身。引用相同配置的提示共享其后备。

## 另请参阅

* [Add a provider key](/langsmith/llm-gateway-provider-authentication#add-a-provider-key)：为链中的每个模型提供一个提供者密钥。
* [Monitor LLM Gateway spend](/langsmith/llm-gateway-monitoring)：按模型查看主要尝试和后备尝试的成本。
* [Spend policies](/langsmith/llm-gateway-spend-policies)：在后备路由的同时应用成本限制。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-fallbacks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。