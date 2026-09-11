<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model access policies | https://docs.langchain.com/langsmith/llm-gateway-model-access-policies -->

# 模型访问策略

<Note>
**测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

模型访问策略定义了通过[LLM Gateway](/langsmith/llm-gateway)允许哪些提供者和模型。网关会阻止对策略不包含的提供者或模型的请求，并返回 `403` 响应。如果没有适用的策略，则所有提供商和模型均可用。

## 策略配置

模型访问策略列出一个或多个提供者，每个提供者都有一种访问模式：

- **所有型号**：允许提供商提供的每种型号。
- **选定的型号**：仅允许您指定的型号。至少需要一种型号。

<Note>
模型访问策略尚不支持[custom model providers](/langsmith/llm-gateway-custom-providers)。当模型访问策略应用于请求时，网关会阻止 `/providers/{configName}` 和 `/models/{configName}` 路由。
</Note>

## 范围和覆盖

模型访问策略的范围仅限于一个主题层：

|等级 |适用于 |
| --- | --- |
|组织|组织中的所有用户和工作区 |
|工作空间 |工作区中的所有用户 |
|用户|单个用户|
| API 密钥 |单个 API 密钥 |

### 策略覆盖策略覆盖允许您向更具体的主题授予与更广泛的默认权限不同的访问权限。一种常见的情况是向组织其他部门无法使用的高级模型提供一个 API 密钥访问权限。

当请求与多个层的策略匹配时，只有最具体的层适用，按照 API 密钥、用户、工作区、组织的顺序。更具体的政策完全取代了更广泛的政策。例如，如果组织策略允许 OpenAI 和 Anthropic，并且 API 密钥策略仅允许 OpenAI 和 Gemini，则使用该密钥的请求只能访问 OpenAI 和 Gemini。如果多个策略在同一层匹配，则模型必须获得所有策略的允许才能访问。

## 创建模型访问策略

<Warning>
创建和管理策略需要 `organization:manage` 权限。有关完整权限细分，请参阅[Traces, Engine, and access control](/langsmith/llm-gateway-access)。
</Warning>

1. 转至 **LLM Gateway** 并选择 **模型访问**。
1. 单击**创建模型访问**。
1. 输入**策略名称**。
1. 在**适用于**下选择范围（组织、工作区、用户或 API 密钥）。
1. 配置**允许的提供商和模型**。
1. 保存。

政策立即生效。

## 后续步骤- [Spend policies](/langsmith/llm-gateway-spend-policies)：设置 LLM 使用的成本上限。
- [Rate limit policies](/langsmith/llm-gateway-rate-limit-policies)：限制请求或令牌吞吐量。
- [Per-customer policies](/langsmith/llm-gateway-header-policies)：通过自定义请求标头拆分策略，以便每个最终客户获得自己的津贴。
- [Data protection](/langsmith/llm-gateway-data-protection)：添加数据保护策略。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-model-access-policies.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>