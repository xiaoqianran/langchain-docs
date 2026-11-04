<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Spend policies | https://docs.langchain.com/langsmith/llm-gateway-spend-policies -->

# 支出政策

对整个组织的 LLM 使用设置成本限制，并防止在费用到达提供商之前失控。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

支出策略定义特定范围（组织、工作区、用户或 API 密钥）在时间窗口（每月、每周、每天或每小时）内的成本上限。一旦窗口记录的支出达到上限，[LLM Gateway](/langsmith/llm-gateway)就会通过指定阻止策略的`402`响应来阻止进一步的请求：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{"type":"error","error":{"message":"request blocked by gateway policies: <POLICY_NAME>"}}
```

请求完成后，网关会记录请求的成本。超过上限的请求仍然会成功，并且只有后面的请求才会被阻止，因此窗口的支出可能会超过上限。靠近发送的请求可以在第一个请求被记录之前全部通过，因此超调可能大于一个请求。

被阻止的请求可追溯到 LangSmith，并将策略违规记录为元数据，因此您可以准确地看到被阻止的内容和原因。该违规行为也在 [LangSmith Engine](/langsmith/llm-gateway-traces#triage-policy-violations) 中作为一个问题出现。

> [!注意]
>
> 支出政策不适用于按 [Claude subscription](/langsmith/llm-gateway-coding-agents#use-claude-subscription-oauth) 计费的通话，并且这些通话不计入支出总额。

## 政策维度支出政策的评估从最广泛到最具体。检查所有匹配的策略，如果任何一个返回块，则请求被拒绝。您可以将策略设置为默认策略（对所有工作区、用户或 API 密钥应用一揽子支出上限）或细化策略（单独限制或对一组实体的限制）。

|范围 |它的上限是什么？示例|
| - | - | - |
| **组织** |组织中所有工作区的总支出| “整个组织每月在 LLM 通话上的花费不能超过 10,000 美元” |
| **工作区** |单个工作区或工作区组内的总支出| “与研发相关的工作空间每月的支出不能超过 2,000 美元”|
| **用户** |单个用户或一组用户的支出（根据 API 密钥的身份解析）| “个人开发者每天的支出不得超过 50 美元”|
| **API 密钥** |通过单个 API 密钥或一组 API 密钥（映射到服务或代理）进行支出 | “客户支持代理密钥累计花费不能超过 500 美元/月”|

### 冲突解决默认情况下，网关首先评估最广泛的范围。缩小范围只能收紧限制，而绝不能放松限制。例如，如果组织级政策的支出上限为 10,000 美元/月，工作区级政策的支出上限为 15,000 美元/月，则 10,000 美元的组织上限仍然适用。

### 默认值与细化策略

支出政策有两个方面：

1. **跨维度求和：** 该范围的总上限。示例：“此工作区的总支出不能超过 5,000 美元/月。”
2. **维度每个成员的默认值：** 适用于某个范围内的每个 API 密钥或用户的基本限制，除非被覆盖。示例：“此工作区中的每个 API 密钥的默认上限为 200 美元/月。”单个 API 密钥可以接收提高其特定限制的额外策略，但没有任何策略可以在更广泛的范围内放宽上限设置。

## 时间窗口期

时间窗口设置支出累计上限的时间段。在每个窗口结束时，记录的支出重置为零：|期间 |重置 |使用案例|
| - | - | - |
| **每月** |每个月的第一天 |预算调整，总体成本控制|
| **每周** |每周一午夜 UTC |每周预算|
| **每日** | UTC 午夜 |防止单日成本飙升（例如，编码代理在重试循环中过夜）|
| **每小时** |每小时顶部 |快速抓获逃跑特工 |

> [!提示]
>
> 您可以将多个时间窗口应用到同一范围。例如，工作区可以同时具有 5,000 美元/月的上限和 500 美元/天的上限。两者都是独立执行的。

## 创建支出政策

> [!警告]
>
> 创建和管理策略需要 `organization:gateway:manage` 权限。组织管理员和组织操作员默认拥有它。有关每个组织角色可以执行的操作，请参阅[Organization roles](/langsmith/rbac#organization-roles)。1. 转至 **LLM Gateway** 并选择 **成本控制**。
2. 单击**创建支出限额**。
3. 选择**范围**（组织、工作区、用户或 API 密钥）。
4. （可选）要按标头分隔默认限制，请选择 **工作空间**、**用户** 或 **API 密钥**，然后默认将该限制应用于该类型的每个主题。选择**通过自定义标头分隔限制**并输入不带`X-Gateway-`的标头名称，例如`Customer-Id`。根据请求发送完整的 `X-Gateway-Customer-Id` 标头。每个主题和标头值对都会收到独立的限制。
5. 设置美元支出上限和时间窗口期（每月、每周、每天或每小时）。
6. 单击**创建支出限额**。

政策立即生效。网关以亚秒级执行延迟对每个传入请求进行评估。

> [!提示]
>
> 支出策略还可以使用自定义请求标头为每个最终客户、租户或团队提供独立的上限，而无需为每个最终客户、租户或团队颁发单独的 API 密钥。欲了解更多信息，请参阅[Header-based policies](/langsmith/llm-gateway-header-policies)。

## 查看支出

在 **LLM Gateway** > **成本控制** 中，**使用情况** 列显示每个保单的支出金额（以美元为单位）及其上限的百分比。要按用户、API 密钥、模型或请求标头分析一段时间内的支出，请使用 **使用情况** 选项卡。有关更多信息，请参阅[Monitor LLM Gateway spend](/langsmith/llm-gateway-monitoring)。

## 另请参阅

* [Header-based policies](/langsmith/llm-gateway-header-policies)：通过自定义请求标头分割上限，以便每个标头值都有自己的限制。
* [Data policies](/langsmith/llm-gateway-data-policy)：在成本控制的同时添加数据策略。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-spend-policies.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。