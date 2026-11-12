<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model fallbacks | https://docs.langchain.com/langsmith/llm-gateway-fallbacks -->

# 模型回退

当主模型速率限制、错误或返回另一个配置的状态代码时，自动重试备份模型的请求。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

当主模型返回已配置的错误（例如速率限制或提供程序中断）时，LLM Gateway 中的模型回退允许您针对一个或多个备份模型重试请求。

在 LangSmith 中定义一次后备顺序，然后继续在应用程序中使用标准 LLM 网关端点和模型 ID。

## 了解后备行为

### 链条组件

模型后备链具有：* **主模型**：请求失败时触发链的提供者和模型。
* **一到五个后备**：提供者模型的有序列表或保存的[model configurations](/langsmith/model-configurations)。提供程序模型使用该提供程序的工作区密钥，或适用于符合条件的托管模型的网关积分。
* **回退触发器**：将请求移至下一个模型的 HTTP 状态代码。默认值涵盖速率限制、过载、服务器和请求超时错误，例如 `408`、`429`、`500` 和 `503`。
* **第一次输出的时间**：每次尝试在网关移动到下一个模型之前可以等待多长时间。默认情况下，它会在 120 秒后打开，每次尝试都会获得一个新的计时器。 [unified API format](/langsmith/llm-gateway-api-formats) 中的流请求等待第一个输出。非流式请求和[direct model access](/langsmith/llm-gateway-direct-model-access)请求等待响应标头。
* **模型冷却**（可选）：有多少次失败使网关跳过模型，以及持续多长时间。默认情况下它是关闭的。请参阅[Model cooldowns](#model-cooldowns)了解更多信息。> [!提示]
>
> 两种状态在回退方面表现不同：
>
> * **`429`来自速率限制策略**：[rate limit policy](/langsmith/llm-gateway-rate-limit-policies)在网关调用主模型之前阻塞请求，因此其`429`不会触发链。只有来自提供商的 `429` 才可以。
> * **`424` 对于缺少的提供者密钥**：默认触发器不包括 `424`。添加它可以让链跳过工作区中没有 [provider key](/langsmith/llm-gateway-provider-authentication#fix-provider-credential-errors) 的回退。没有密钥的主模型会返回`424`，而无需尝试链。

### 模型冷却时间

冷却时间是指网关跳过后备链中的模型而不调用它的时间段。跳过可能失败的模型可以节省每个请求失败尝试的延迟。模型通过两种方式进入冷却时间：* **提供商速率限制**：当提供商返回 `429` 时，网关会跳过该模型以应对提供商响应中的重试延迟。如果响应没有设置延迟，则冷却时间持续 5 秒。冷却时间不会超过 300 秒。工作区中触发器包括 `429` 的每个链都会跳过该模型。
* **模型冷却**：当您为链打开**模型冷却**时，在冷却期内未能触发链指定次数的模型将在冷却期内被该链跳过。触发器状态、超时和提供程序传输错误均视为失败。其他状态和取消的请求不会，并且成功不会重置计数。每个链中的每个模型都会对失败进行计数，因此其他链会继续调用该模型。启用后，默认情况下模型在 3 次失败后会跳过 60 秒。当该周期结束时，网关再次调用该模型，并且其故障计数重新开始。

链中的最后一个模型总是被调用，即使它正在冷却。

### 请求流程

对于每个请求：1. 网关将请求的提供者前缀模型 ID 与后备链进行匹配，并调用主模型。
2. 如果尝试因触发状态而失败、超时或遇到传输错误，则网关将按顺序调用下一个回退。
3. 网关重复上一步，直到出现以下情况之一：
   * 一个模型成功了。
   * 模型返回的状态不是触发器。
   * 没有后备措施。
4. 网关以客户端使用的API 格式返回最后一次响应。

每次尝试都会收到原始请求，并在需要时转换为模型的 API 格式。网关不会缩短对话以适应后备模型的上下文窗口。因此，具有较小上下文窗口的模型可以返回`400`，这会结束链，除非`400`是触发状态。

网关会跳过除最后一个之外的任何 [cooling down](#model-cooldowns) 模型，而不调用它。跳过的模型不会出现在响应正文中。要查看跳过的模型，[investigate the chain's attempts](#investigate-fallback-attempts)。

一旦流响应开始发送输出，网关就会提交该模型并且不再回退，即使流稍后失败也是如此。> [!提示]
>
> 所有尝试都出现在一次 [gateway trace](/langsmith/llm-gateway-traces#read-the-trace-tree) 中，在 `gateway.request` 根运行下。使用两个回退的请求具有三个 `gateway.attempt #N` 子运行：主要尝试和两个回退尝试。
>
> 每个提供商调用都单独贡献给[spend policies](/langsmith/llm-gateway-spend-policies)，但内容记录的请求在跟踪计费中计数一次，无论尝试次数如何。跳过冷却的模型仍显示为 `gateway.attempt #N` 运行，且 `gateway.attempt.outcome` 设置为 `skipped`，但它没有提供商 LLM 运行。

### 支持的格式和端点

后备模型可以使用与主要模型不同的提供程序和 API 格式。网关在[supported API formats](/langsmith/llm-gateway-api-formats)之间转换请求和响应。例如，Anthropic 主模型可以回退到 OpenAI 模型，而无需客户端更改。

后备链适用于统一端点和直接模型访问路径上的聊天完成、响应和消息请求。其他端点（例如嵌入和通过直接模型访问的 Gemini `generateContent` 请求）无需回退即可调用所请求的模型。

## 创建后备链> [!警告]
>
> 创建和管理后备链需要 `organization:gateway:manage` 权限。组织管理员和组织操作员默认拥有它。有关每个组织角色可以执行的操作，请参阅[Organization roles](/langsmith/rbac#organization-roles)。

创建后备链：

1. 转到 **LLM Gateway**，然后选择 **模型回退** 选项卡。
2. 单击**创建后备链**。
3. 选择链适用的**工作区**。
4. 选择主要提供商和型号。当主要尝试失败时，对此提供者前缀的模型 ID 的请求将使用该链。
5. 在 **后备** 下，按照网关应尝试的顺序添加一到五个备份模型。直接选择提供商和模型、选择现有模型配置或创建自定义模型配置。
6. 在 **回退触发器** 下，查看将请求发送到下一个模型的状态代码。根据需要调整它们。
7. （可选）调整[**Time to first output**](#chain-components)，以秒为单位。将该字段留空以删除超时。
8.（可选）开启[**Model cooldown**](#model-cooldowns)，并设置跳过模型的时间以及失败次数开始冷却。
9. 单击**创建链**。> [!提示]
>
> 提供者和模型在每个工作区中最多可以有一个后备链。要更改其行为，请编辑现有链。

## 测试后备链

模拟器通过回退链发送请求，其中包含您为每个模型选择的行为，例如速率限制或中断。这样，您可以在提供商在生产中出现故障之前检查链的路由和增加的延迟。

测试链：

1. 转到 **LLM Gateway**，然后选择 **模型回退** 选项卡。
2. 在链的行上，单击**在模拟器中打开→**。
3. 在 **模拟提供商行为** 下，为链中的每个模型选择一种行为（正常、超时、速率限制或中断）。
4. 单击“**运行请求**”。

结果显示哪个模型服务了请求，然后列出每次尝试及其状态和持续时间。尝试下方是**回退跃点**的数量、失败尝试所增加的**延迟以及请求的总 **令牌**。 **查看跟踪** 打开请求的网关跟踪，其中包括失败的尝试和为请求提供服务的尝试。

测试时请记住以下几点：* **模拟故障不发送推理请求。** 为了估算网络延迟，网关调用不生成令牌的提供商端点。模拟失败显示为请求跟踪中的尝试运行，而没有提供程序 LLM 运行。
* **模拟故障仅在触发状态下回退。** 仅当 `429` 和 `503` 位于链的触发器中时，速率限制和中断才会移至下一个模型。两者均采用默认设置。
* **模拟器仅发送非流请求。** 要检查链的流行为，请从代码发送流请求。
* **模拟器忽略冷却。** 即使模型正在冷却，它也会调用每个模型，并且其故障不计入 **模型冷却**，因此测试运行无法冷却生产流量的模型。要检查冷却时间行为，请从代码中通过链发送请求。
* **模拟之外的错误仍然存​​在。** 如果回退在工作区中没有提供程序密钥，则其尝试返回 `424`，就像在生产中一样。如果主节点没有密钥，模拟器会要求您在运行链之前添加一个密钥。

## 拨打电话使用主模型的提供商前缀 ID 调用标准 LLM 网关端点。您不需要特定于路由的 URL 或其他请求字段。此示例使用[Send your first LLM Gateway request](/langsmith/llm-gateway-first-request#send-a-request-from-your-code)中设置的基本 URL 和 API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl "$LANGSMITH_GATEWAY_BASE_URL/chat/completions" \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"<PRIMARY_MODEL_ID>","messages":[{"role":"user","content":"Hello!"}]}'
```

网关应用在 API 密钥工作区中为 `<PRIMARY_MODEL_ID>` 配置的后备链。如果没有链匹配，网关将返回主要模型的响应，而不尝试回退。

## 调查后备尝试

当链运行时，响应记录网关尝试的模型、每次尝试的状态代码以及服务请求的模型：* **在网关跟踪中**：在[gateway tracing project](/langsmith/llm-gateway-traces#find-gateway-traces)中打开请求，并展开`gateway.request`。每个`gateway.attempt #N`都包含其策略检查，并且在进行后，其提供商LLM将运行。选择检查其结果和上游错误元数据的尝试。
* **在应用程序跟踪中**：如果您的应用程序在启用 [tracing](/langsmith/observability) 的情况下通过 Python 中的 LangChain 聊天模型（`langchain-openai>=1.6.7` 或 `langchain-anthropic>=1.7.5`）调用网关，则该模型的运行将有一个 **Gateway** 部分，其中列出了每次尝试。聊天模型从下一项中描述的响应标头中读取此内容。
* **在响应中**：其他客户端可以读取`X-LangSmith-Gateway-Metadata` [response header](/langsmith/llm-gateway-api-formats#read-response-metadata)。它的 `attempt_details` 字段列出了每次尝试的模型和状态代码，并且 `selected_model` 命名了服务请求的模型。模型被跳过，因为它是 [cooling down](#model-cooldowns)，其 `fallback_trigger` 设置为 `cooldown` 并且没有状态代码。

## 设置提示的后备

保存在 LangSmith 中的 [prompt](/langsmith/prompt-engineering-concepts#prompts-in-langsmith) 存储模型选择及其模板，因此您的应用程序可以将两者一起拉取并运行。后备链适用于对其工作区中的主要模型的每个请求。要为同一模型提供与其他流量不同的提示回退行为，请将提示指向其自己保存的[model configuration](/langsmith/llm-gateway-model-configurations)，并将该配置设为链的主要配置。提示符将配置调用为`custom/<name>`，网关应用该配置的链。

要配置提示的后备：

1. 在 **设置** > **模型配置** 中，[create a model configuration](/langsmith/model-configurations#create-a-configuration) 代表您希望提示使用的提供程序和模型。请注意接下来两个步骤将使用的配置名称 `<config_name>`。组织范围的配置从组织机密中读取提供程序密钥，因此如果密钥是工作区机密，请创建工作区配置。
2. [Create a fallback chain](#create-a-fallback-chain) 在同一工作空间中。对于主模型，从模型列表末尾的 **模型配置** 部分选择您的配置，而不是其底层提供程序和模型。该链的主要模型是`custom/<config_name>`，与底层模型上的任何链分开。3. 操场上的[Create a prompt](/langsmith/create-a-prompt)。单击当前模型的名称打开**模型配置**，然后选择**LangSmith网关**作为**提供商**。在 **型号** 字段中输入 `custom/<config_name>`，然后单击 **应用**。单击“**开始**”以检查提示符是否运行。单击“**保存**”，并为提示命名。
4. 在您​​的申请中，[pull the prompt with its model](/langsmith/manage-prompts-programmatically#pull-a-prompt)。在Python中，调用`client.pull_prompt`时设置`include_model=True`。

调用拉取的提示会通过网关发送请求，该网关应用配置的后备链。仅拉取提示模板，不包含模型配置。

> [!提示]
>
> 后备链属于模型配置，而不是提示本身。引用相同配置的提示共享其后备。

## 另请参阅

* [Add a provider key](/langsmith/llm-gateway-provider-authentication#add-a-provider-key)：为链中的每个模型提供一个提供者密钥。
* [Monitor LLM Gateway spend](/langsmith/llm-gateway-monitoring)：按模型查看主要尝试和后备尝试的成本。
* [Spend policies](/langsmith/llm-gateway-spend-policies)：在后备路由的同时应用成本限制。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-fallbacks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。