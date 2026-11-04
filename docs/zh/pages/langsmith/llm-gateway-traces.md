<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: View LLM Gateway traces | https://docs.langchain.com/langsmith/llm-gateway-traces -->

# 查看LLM网关跟踪

查找 LLM 网关跟踪，读取其策略和成本元数据，在 LangSmith 引擎中对策略违规进行分类，并控制谁可以查看网关跟踪。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

每个 LLM 网关请求（包括那些被阻止或失败的请求）都会生成一个 LangSmith 跟踪。跟踪组织提供者尝试、策略检查和 LLM 在一次 `gateway.request` 根运行下运行。 [LangSmith Engine](/langsmith/engine) 中会出现政策违规情况以进行分类。

## 查找网关痕迹

每个网关请求都会跟踪到与调用方 API 密钥关联的 [workspace](/langsmith/administration-overview#workspaces) 中名为 `gateway` 的项目。要查看网关请求，请转至 **LLM Gateway** 并选择 **Traces** 选项卡。模拟器的 **查看跟踪** 按钮在此选项卡中打开其请求。要查看某个用户或 API 密钥支出背后的请求，请在 [**Usage** tab](/langsmith/llm-gateway-monitoring#analyze-the-chart-and-table) 中选择该用户或密钥，然后单击 **查看跟踪**。在开发人员计划中，请在工作区中打开 `gateway` 跟踪项目。默认情况下，所有组织的跟踪内容（请求和响应正文）都是关闭的，因此网关跟踪仅记录元数据，例如令牌计数、策略结果和调用者身份。这些迹线将 `ls_metadata_only` 设置为 `true`。没有内容的跟踪不会根据您的 LangSmith 跟踪配额进行计费。要存储内容，请在 [data policy](/langsmith/llm-gateway-data-policy#data-retention) 中打开 **跟踪内容**。内容记录的请求将计入​​您的计划的跟踪量一次，无论它进行了多少次提供商尝试。

> [!注意]
>
> 任何可以在工作区中查看运行的用户都可以查看其网关跟踪。要限制访问，请参阅[Restrict trace visibility](#restrict-trace-visibility)。

## 读取跟踪树

展开 `gateway.request` 检查每次尝试。每次尝试都有自己的策略检查和提供程序调用，因此回退的请求每次尝试都会重复以下结构一次：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gateway.request
├─ gateway.attempt #1
│  ├─ gateway.policy_check
│  │  └─ policy: <name>
│  ├─ gateway.data_policy
│  │  └─ policy: <name>
│  │     └─ rule: <rule_id>
│  └─ <provider LLM run>
└─ gateway.attempt #2
   └─ …
```

网关特定的键出现在每次运行的元数据中的`gateway.`下，记录为`langsmith.metadata.gateway.*`跨度属性。网关自行设置这些密钥，因此客户端无法通过请求标头覆盖它们。下面的每次运行都列出了最值得检查的键：* **`gateway.request`**：根运行，显示请求发生了什么。
  * `gateway.request.outcome` 为 `success`、`upstream_error`、`blocked`、`rejected` 或 `fallback_exhausted`。
  * `gateway.request.error_reason` 解释了阻止或拒绝的请求。受限制的请求具有结果 `blocked` 和错误原因 `rate_limit`，而不是单独的 `throttled` 结果。
  * `gateway.request.served_model` 命名回答的模型。
  * `gateway.request.id` 关联请求的根、尝试、策略和提供程序运行，包括批量导出。
* **`gateway.attempt #N`**：模型候选：主要、[fallback](/langsmith/llm-gateway-fallbacks)或`/routes`候选。尝试并不总是拨打提供商电话。
  * `gateway.attempt.outcome`记录其结果。跳过冷却时间的候选人的结果是`skipped`，并且没有提供者 LLM 运行。 `skipped` 是仅尝试结果，而不是请求结果。
  * `gateway.attempt.upstream_status_code` 记录调用失败时提供者的状态码。
* **`gateway.policy_check`**：针对[spend](/langsmith/llm-gateway-spend-policies)、[rate limit](/langsmith/llm-gateway-rate-limit-policies)、[model access](/langsmith/llm-gateway-model-access-policies)以及路由策略进行检查。此运行显示网关评估了该尝试的策略。为了保持跟踪整洁，只有拒绝或限制请求的策略才会显示为 `policy: <name>` 子运行。
  * `gateway.policy.action`，在每次 `policy: <name>` 运行时，记录策略是否拒绝或限制请求。* `gateway.policy.matched_names` 列出所有匹配的策略名称，包括未拒绝或限制请求的策略。
* **`gateway.data_policy`**：[data policy](/langsmith/llm-gateway-data-policy) 扫描 PII 和机密，与策略检查分开运行。编辑或阻止内容的数据策略显示为 `policy: <name>` 子运行，每个匹配的规则都有一个 `rule: <rule_id>` 运行。
  * `gateway.rule.matches`，在每次 `rule: <rule_id>` 运行时，计算规则匹配的次数。
* **Provider LLM run**：对提供商进行调用（当调用时）。选择它以了解令牌使用情况、成本以及（当跟踪内容打开时）请求和响应。
  * `ls_model_name` 和 `ls_provider` 标识型号和提供商。这些密钥在提供商 LLM 运行中运行，而不是在根运行中运行。
  * `gateway.credential_source` 记录为调用付费的凭证，例如 `byok` 代表工作区的提供商密钥，或 `credits` 代表 [Gateway Credits](/langsmith/llm-gateway-credits)。

> [!注意]
>
> 被阻止的尝试可以在不运行提供商 LLM 的情况下运行策略。在任何尝试之前被拒绝的请求仅会运行 root。

## 按调用者过滤跟踪

根运行和提供者 LLM 运行记录谁提出了请求。以下按键对于查找呼叫者的踪迹最有用：* **`gateway.api_key_id`**：发出请求的 API 密钥。
* **`gateway.user_id`**：发出请求的用户。仅针对个人访问令牌设置，因此服务密钥请求没有用户。
* **`gateway.<name>`**：每个`X-Gateway-*`请求头。有关名称如何规范化的信息，请参阅[Matchable headers](/langsmith/llm-gateway-header-policies#matchable-headers)。

## 限制跟踪可见性

网关跟踪在工作区项目中运行，因此与工作区中的其他运行相同的权限管理它们。工作区上具有 `runs:read`（和 `projects:read` 查看项目本身）的任何用户都可以查看该工作区的网关项目中的跟踪。内置的工作区管理员、工作区编辑器和工作区查看器[roles](/langsmith/rbac#workspace-roles) 默认情况下都包含这两种权限。

您有两个选项来限制对网关跟踪的访问：

* **单独的工作区**（适用于任何[plan](/langsmith/pricing-plans)）：创建一个具有受限成员资格的工作区，并为具有更广泛成员资格的开发人员编码代理创建另一个工作区。每个工作区都有自己的提供者机密和跟踪项目。
* **项目级访问策略**（需要[Enterprise plan](/langsmith/pricing-plans)）：编写[ABAC](/langsmith/abac)策略，将网关项目上的`projects:read`和`runs:read`限制为特定用户或角色。

## 分类政策违规行为当治理策略触发时（例如达到支出限制、编辑 PII 或捕获机密时），该事件将作为元数据记录在跟踪上。这些政策违规行为表现为 [issues in LangSmith Engine](/langsmith/engine-issues)。

对于引擎问题，您可以：

1. **查看违规行为：** 查找已触发的政策以及其阻止或编辑的内容。
2. **单击跟踪：** 准确查看策略触发时代理正在执行的操作。
3. **诊断根本原因：** 例如重试循环消耗预算、用户将凭据粘贴到提示中或超出其上限的合法工作负载。
4. **采取行动：** 更新代理配置、调整策略或升级。

## 另请参阅

* [Monitor LLM Gateway spend](/langsmith/llm-gateway-monitoring)：按用户、API 密钥、模型和提供商跟踪支出。
* [Spend policies](/langsmith/llm-gateway-spend-policies)：对 API 密钥和用户附加成本限制。
* [Data policies](/langsmith/llm-gateway-data-policy)：配置数据策略。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。