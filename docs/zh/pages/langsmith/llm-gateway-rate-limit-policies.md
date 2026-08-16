<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Rate limit policies | https://docs.langchain.com/langsmith/llm-gateway-rate-limit-policies -->

# 限速策略

<Note>
**测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

速率限制策略限制主体在短滚动时间窗口内可以通过[LLM Gateway](/langsmith/llm-gateway)消耗多少**请求**或**令牌**。网关实时强制执行限制，并阻止任何将主题推过它的请求，返回带有 `Retry-After` 标头的 `429` 响应：

```
API Error: 429 request blocked by gateway policies: Dev Team Rate Limit
Retry-After: 42
```

`Retry-After` 值是当前窗口重置之前的秒数。客户端应尊重此标头并在重试之前退出。

速率限制策略和[spend cap policies](/langsmith/llm-gateway-spend-policies)是互补的，可以一起应用——成本控制的支出上限、吞吐量和流量控制的速率限制。

## 政策维度

针对每个传入请求评估速率限制策略。您可以将策略设置为默认值（对所有用户应用一揽子速率限制、[workspaces](/langsmith/administration-overview#workspaces) 或 [API keys](/langsmith/create-account-api-key)）或将其设置为细粒度策略（单个限制或对一组主题的限制）。|主题 |它限制了什么 |示例|
| ---| ---| ---|
| **用户** |来自单个用户或用户组的请求或令牌（从 API 密钥的身份解析）| “单个开发者每分钟发送的请求数不能超过 100 个”|
| **工作区** |单个工作区或工作区组中的请求或令牌 | “研发工作区每小时不能超过 1,000,000 代币”|
| **API 密钥** |来自单个 API 密钥或一组 API 密钥的请求或令牌 | “客户支持代理密钥每分钟共享 200 个请求的限制” |

### 默认值与细化策略

限速策略有两种模式：

1. **默认策略** 自动应用于主题维度的每个成员。示例：“此工作区中的每个用户的默认上限为每分钟 100 个请求。”无需为每个人制定政策。
2. **粒度策略** 针对指定主题并仅覆盖该主题的默认设置。示例：“待命工程师每分钟收到 500 个请求。”编辑默认更新仍然使用它的每个人。

### 独立执行

每个主题都单独跟踪和执行。一名用户达到其限制不会影响其他用户。

## 限制单个速率限制策略可以**同时实施多个限制**。例如，一项策略可以同时强制执行“每分钟 100 个请求”和“每小时 1,000,000 个令牌”。

每个限制包含三个字段：

|领域|允许值 |
| ---| ---|
| **公制** | `requests` 或 `tokens`（提供商报告的代币总数）|
| **窗口** | `minute` 或 `hour` |
| **价值** |正整数（上限）|

规则：

- 每项保单至少需要一个限额。
- 一项政策中不能有两个具有相同指标和窗口组合的限制。

## 创建速率限制策略

<Warning>
创建和管理策略需要`organization:manage`权限。有关完整权限细分，请参阅[Traces, Engine, and access control](/langsmith/llm-gateway-access)。
</Warning>

1. 进入**设置 → 网关 → LLM 网关**。
1. 单击**创建策略**。
1. 选择“**速率限制**”作为策略类型。
1. 选择主题范围（用户、工作区或 API 密钥）。
1. 添加一个或多个限制，每个限制都有一个指标、窗口和值。
1. 保存。

政策立即生效。速率限制策略还可以在自定义请求标头上携带条件，因此来自单个主题的流量将按标头值拆分为单独的限制。使用此功能可以在一个 API 密钥下为您的每个最终客户提供自己的吞吐量限额。欲了解更多信息，请参阅[Per-customer policies](/langsmith/llm-gateway-header-policies)。

## 后续步骤

- [Spend policies](/langsmith/llm-gateway-spend-policies)：设置成本上限和速率限制。
- [Per-customer policies](/langsmith/llm-gateway-header-policies)：通过自定义请求标头分割限制，以便每个最终客户获得自己的限额。
- [Data protection](/langsmith/llm-gateway-data-protection)：添加数据保护策略。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-rate-limit-policies.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>