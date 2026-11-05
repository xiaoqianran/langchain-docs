<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Rate limit policies | https://docs.langchain.com/langsmith/llm-gateway-rate-limit-policies -->

# 限速策略

限制组织、工作区、用户或 API 密钥可以在滚动时间窗口内通过 LLM 网关发送的请求或令牌的数量。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

速率限制策略限制主体在短滚动时间窗口内可以通过[LLM Gateway](/langsmith/llm-gateway)消耗多少**请求**或**令牌**。网关实时强制执行限制，并阻止任何将主题推过它的请求，返回带有 `Retry-After` 标头和命名阻止策略的正文的 `429` 响应：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{"type":"error","error":{"message":"request blocked by gateway policies: <POLICY_NAME>"}}
```

`Retry-After` 值是当前窗口重置之前的秒数。客户端应尊重此标头并在重试之前退出。

被阻止的请求永远不会到达提供者，因此它不会触发 [fallback chain](/langsmith/llm-gateway-fallbacks)，即使 `429` 是默认的后备触发器。

> [!提示]
>
> 速率限制策略和[spend cap policies](/langsmith/llm-gateway-spend-policies)是互补的，可以一起应用：成本控制的支出上限、吞吐量和流量控制的速率限制。

## 政策维度

针对每个传入请求评估速率限制策略。|主题 |它限制了什么 |示例|
| - | - | - |
| **组织** |组织中所有工作区的请求或令牌 | “整个组织每分钟发送的请求数不能超过 5,000 个”|
| **工作区** |单个 [workspace](/langsmith/administration-overview#workspaces) 或一组工作区中的请求或令牌 | “研发工作空间每小时不能超过 1,000,000 个代币” |
| **用户** |来自单个用户或用户组的请求或令牌（从 API 密钥的身份解析）| “单个开发者每分钟发送的请求数不能超过 100 个”|
| **API 密钥** |来自单个 [API key](/langsmith/create-account-api-key) 或一组 API 密钥的请求或令牌 | “客户支持代理密钥每分钟共享 200 个请求的限制”|

### 默认值与细化策略

限速策略有两种模式：

1. **默认策略** 自动应用于主题维度的每个成员。示例：“此工作区中的每个用户的默认上限为每分钟 100 个请求。”无需为每个人制定政策。
2. **粒度策略** 针对指定主题并仅覆盖该主题的默认设置。示例：“待命工程师每分钟收到 500 个请求。”编辑默认更新仍然使用它的每个人。### 独立执行

每个主题都单独跟踪和执行。一名用户达到其限制不会影响其他用户。

## 限制

单个速率限制策略可以**同时实施多个限制**。例如，一项策略可以同时强制执行每分钟 100 个请求和每小时 1,000,000 个令牌。

每个限制包含三个字段：

|领域 |允许值 |
| - | - |
| **价值** |正整数（上限）|
| **公制** | `requests` 或 `tokens`（提供商报告的代币总数）|
| **窗口** | `minute` 或 `hour` |

规则：

* 每份保单至少需要一个限额。
* 一项政策中不能有两个具有相同指标和窗口组合的限制。

## 创建速率限制策略

> [!警告]
>
> 创建和管理策略需要 `organization:gateway:manage` 权限。组织管理员和组织操作员默认拥有它。有关每个组织角色可以执行的操作，请参阅[Organization roles](/langsmith/rbac#organization-roles)。

1. 转至 **LLM Gateway** 并选择 **速率限制**。
2. 单击**创建速率限制**。
3. 选择范围（组织、工作区、用户或 API 密钥）。
4. 添加一个或多个限制，每个限制都有一个值、指标和窗口。
5. 单击**创建速率限制**。

政策立即生效。速率限制策略还可以在自定义请求标头上携带条件，因此来自单个主题的流量会按标头值拆分为单独的限制。使用它可以为每个最终客户、租户或成本中心提供自己的吞吐量限额，而无需为每个最终客户、租户或成本中心颁发单独的 API 密钥。欲了解更多信息，请参阅[Header-based policies](/langsmith/llm-gateway-header-policies)。

## 另请参阅

* [Spend policies](/langsmith/llm-gateway-spend-policies)：设置成本上限和速率限制。
* [Header-based policies](/langsmith/llm-gateway-header-policies)：通过自定义请求标头分割限制，以便每个标头值都有自己的限额。
* [Data policies](/langsmith/llm-gateway-data-policy)：添加数据策略。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-rate-limit-policies.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。