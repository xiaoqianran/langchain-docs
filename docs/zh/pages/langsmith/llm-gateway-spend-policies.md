<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Spend policies | https://docs.langchain.com/langsmith/llm-gateway-spend-policies -->

# 支出政策

<Note>
**测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

支出策略定义特定范围（组织、工作区、API 密钥或用户）在时间窗口（每月、每周、每天或每小时）内的成本上限。 [LLM Gateway](/langsmith/llm-gateway) 实时跟踪支出并阻止任何会使支出超过上限的请求，返回 `402` 响应：

```
API Error: 402 request blocked by gateway policies: R&D Spend Cap
```

被阻止的请求可追溯到 LangSmith，并将策略违规记录为元数据，因此您可以准确地看到被阻止的内容和原因。

## 政策维度

支出政策的评估从最广泛到最具体。检查所有匹配的策略，如果任何一个返回块，则请求被拒绝。您可以将策略设置为默认策略（对所有工作区、用户或 API 密钥应用一揽子支出上限）或细化策略（单独限制或对一组实体的限制）。|范围 |它的上限是什么？示例|
| ---| ---| ---|
| **组织** |组织中所有工作区的总支出| “整个组织每月在 LLM 电话上的花费不能超过 10,000 美元” |
| **工作区** |单个工作区或工作区组内的总支出| “与研发相关的工作空间每月支出不能超过 2,000 美元”|
| **API 密钥** |通过单个 API 密钥或一组 API 密钥（映射到服务或代理）进行支出 | “客户支持代理密钥每月累计花费不能超过 500 美元”|
| **用户** |单个用户或一组用户的支出（根据 API 密钥的身份解析）| “个人开发者每天的支出不得超过 50 美元”|

### 冲突解决

默认情况下，LLM Gateway 首先评估最广泛的范围。如果适用细粒度策略，则限制性最强的策略会获胜。缩小范围只能收紧限制，而绝不会放松限制。如果组织级政策的支出上限为 10,000 美元/月，工作区级政策的支出上限为 15,000 美元/月，则 10,000 美元的组织上限仍然适用。

### 默认值与细化策略

支出政策有两个方面：1. **跨维度求和：** 该范围的总上限。示例：“此工作区的总支出不能超过每月 5,000 美元。”
2. **维度每个成员的默认值：** 适用于某个范围内的每个 API 密钥或用户的基本限制，除非被覆盖。示例：“此工作区中的每个 API 密钥的默认上限为每月 200 美元。”单个 API 密钥可以接收提高其特定限制的额外策略，但没有任何策略可以在更广泛的范围内放宽上限设置。

## 时间窗口

|窗口|重置 |使用案例|
| ---| ---| ---|
| **每月** |每个月的第一天 |预算调整，总体成本控制|
| **每周** |每周一午夜 UTC |每周预算|
| **每日** | UTC 午夜 |防止单日成本飙升（例如，编码代理在重试循环中过夜）|
| **每小时** |每小时顶部 |快速抓获逃跑特工 |

您可以将多个时间窗口应用到同一范围。例如，工作区可以同时具有 5,000 美元/月的上限和 500 美元/天的上限。两者都是独立执行的。

## 创建支出政策

<Warning>
创建和管理策略需要 `organization:manage` 权限。有关完整权限细分，请参阅[Traces, Engine, and access control](/langsmith/llm-gateway-access)。
</Warning>1. 进入**设置 → 网关 → LLM 网关**。
1. 单击**创建策略**。
1. 选择范围（组织、工作区、API 密钥或用户）。
1. 设置时间窗口（每月、每周、每天或每小时）。
1. 设置美元支出上限。
1. 保存。

政策立即生效。网关以亚秒级执行延迟对每个传入请求进行评估。

支出策略还可以在自定义请求标头上携带条件，因此来自单个主题的流量会按标头值分成单独的上限。使用此功能可以将您自己的每个最终客户限制在一个 API 密钥下。欲了解更多信息，请参阅[Per-customer policies](/langsmith/llm-gateway-header-policies)。

## 查看支出

支出可见性仪表板显示实时成本汇总，以便您可以在达到限额之前了解您的 LLM 预算的去向。

从网关设置页面，您可以查看每个策略在其上限中花费的金额。

## 与LangSmith引擎集成

当支出策略阻止请求时，违规行为将作为元数据记录在跟踪中。这些违规行为在 [LangSmith Engine](/langsmith/engine) 中以问题的形式出现，您可以在其中从问题单击到跟踪，以了解代理在达到限制时正在执行的操作。这对于诊断被阻止的请求是否代表真正的成本问题（重试循环中的编码代理）或需要调整的策略（超出其上限的合法工作负载）非常有用。

## 后续步骤

- [Per-customer policies](/langsmith/llm-gateway-header-policies)：通过自定义请求标头分割上限，以便每个最终客户获得自己的限制。
- [Data protection](/langsmith/llm-gateway-data-protection)：在成本控制的同时添加数据保护策略。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-spend-policies.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>