<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model access policies | https://docs.langchain.com/langsmith/llm-gateway-model-access-policies -->

# 模型访问策略

控制您的组织、工作区、用户或 API 密钥可通过 LLM 网关访问哪些模型提供程序和模型。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

模型访问策略定义了通过[LLM Gateway](/langsmith/llm-gateway)允许哪些提供者和模型。网关会阻止对策略不包含的提供者或模型的请求，并返回 `403` 响应，其中包含指定阻止策略的正文：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{"error":{"code":null,"message":"request blocked by gateway policies: <POLICY_NAME>","param":null,"type":"permission_error"}}
```

如果没有适用的策略，则所有提供商和模型均可用。

## 政策维度

模型访问策略的范围仅限于一个主题层：

|范围 |适用于 |
| - | - |
| **组织** |组织中的所有用户和工作区 |
| **工作区** |工作区中的所有用户|
| **用户** |单个用户|
| **API 密钥** |单个 API 密钥 |

### 策略覆盖

策略覆盖允许您向更具体的主题授予与更广泛的默认权限不同的访问权限。一种常见的情况是向组织其他部门无法使用的高级模型提供一个 API 密钥访问权限。当请求与多个层的策略匹配时，只有最具体的层适用，按照 API 密钥、用户、工作区、组织的顺序。更具体的政策完全取代了更广泛的政策。例如，如果组织策略允许 OpenAI 和 Anthropic，并且 API 密钥策略仅允许 OpenAI 和 Gemini，则使用该密钥的请求只能访问 OpenAI 和 Gemini。

如果多个策略在同一层匹配，则模型必须获得所有策略的允许才能访问。该错误仅指定拒绝模型的策略。

## 允许的提供商和型号

模型访问策略列出一个或多个提供者，每个提供者都有一种访问模式：

* **所有型号**：允许提供商提供的每种型号。
* **选定的型号**：仅允许您指定的型号。至少需要一种型号。

在**选定型号**下，网关还会阻止无法读取型号的请求，例如没有 `model` 字段的请求、`model` 不是字符串或`model` 字段发送两次。

### 允许保存模型配置通过 `custom/<name>` 模型 ID 或后备链调用已保存 [model configuration](/langsmith/llm-gateway-model-configurations) 的请求将被阻止，除非策略列出 **模型配置** 提供程序。该提供程序使用相同的两种访问模式，但 **Selected** 采用完全匹配的配置名称，而不是模型 ID。名称在调用 API 密钥的工作区中解析，因此组织级策略上的一个条目适用于每个工作区自己的配置。

## 创建模型访问策略

> [!警告]
>
> 创建和管理策略需要 `organization:gateway:manage` 权限。组织管理员和组织操作员默认拥有它。有关每个组织角色可以执行的操作，请参阅[Organization roles](/langsmith/rbac#organization-roles)。

1. 转到 **LLM Gateway** 并选择 **模型访问** 选项卡。
2. 单击**创建模型访问**。
3. 在**适用于**下，选择范围（组织、工作区、用户或 API 密钥）。
4. 在**允许的提供商和模式**下，打开每个提供商以允许并选择其访问模式。默认情况下，提供商处于关闭状态，因此您离开的任何提供商都会被阻止。
5. 单击**创建模型访问**。

政策立即生效。

## 另请参阅* [Run a request in the Simulator](/langsmith/llm-gateway-first-request#run-a-request-in-the-simulator)：通过请求策略阻止的模型来测试策略。
* [Spend policies](/langsmith/llm-gateway-spend-policies)：设置 LLM 使用的成本上限。
* [Rate limit policies](/langsmith/llm-gateway-rate-limit-policies)：限制请求或令牌吞吐量。
* [Header-based policies](/langsmith/llm-gateway-header-policies)：将策略范围缩小到携带特定自定义请求标头值的请求。
* [Data policies](/langsmith/llm-gateway-data-policy)：添加数据保护策略。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-model-access-policies.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。