<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Data policy | https://docs.langchain.com/langsmith/llm-gateway-data-policy -->

# 数据政策

<Note>
**测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

LLM 网关中的 **数据策略** 选项卡保存数据策略。单个数据策略涵盖两个区域，与创建表单的两个部分相匹配：

- **数据保留**：网关是否将请求和响应正文写入LangSmith跟踪。
- **数据保护**：在请求到达 LLM 提供商之前，网关扫描并编辑哪些敏感数据、扫描可以运行多长时间，以及超出限制时请求是否继续进行。

## 可用性

每个有权访问 LLM Gateway 的组织都可以使用数据策略。 **数据策略**选项卡提供的内容有两项权利：

- 默认情况下，**数据保护**处于启用状态。如果关闭权利，云企业组织会看到该选项卡呈灰色，并带有**请求访问**链接，而其他每个组织根本看不到该选项卡。
- **PII 检测** 默认关闭，并为选定的组织启用。如果没有它，PII 选项在创建和编辑表单中不可用，并且 API 会拒绝配置为检测 PII 的任何策略。

请联系您的客户团队以更改任一权利。

## 数据保留通过 LLM 网关的每个调用都会追溯到 LangSmith。 **跟踪内容** 切换控制请求和响应正文是否存储在这些跟踪中。它对所有组织都是关闭的，并且数据策略会针对策略匹配的请求将其打开。当跟踪内容被禁用时，网关仍然记录元数据，例如令牌使用情况、延迟、状态、模型信息和策略评估结果。

网关跟踪写入与调用者 API 密钥关联的 [workspace](/langsmith/administration-overview#workspaces) 中名为 `gateway` 的共享项目，以及隔离 UI 中流量的每个调用者项目。对于项目命名方案、元数据跟踪携带以及如何限制跟踪可见性，请参阅[Traces and access control](/langsmith/llm-gateway-access)。

## 数据保护

当数据策略启用检测时，网关会在出站请求到达 LLM 提供商之前对其进行扫描。在将请求转发到上游之前，检测到的值将替换为占位符，因此提供者只能看到经过编辑的有效负载。对于成功的响应，网关会在将响应返回给调用者之前将占位符恢复为原始值。编辑的内容也会在 LangSmith 跟踪中进行编辑，因此敏感数据也不会保留在您的可观察性数据中。

**PII** 和 **Secrets** 切换是独立的。在新策略中，PII 检测从选择的每条规则（对于具有权利的组织）开始，并且秘密检测开始。

### PII 检测

**个人身份信息 (PII)** 切换涵盖姓名、电子邮件、电话号码、地址和 SSN。它下面有六个规则，每个规则都可以单独选择，并根据网关检测它们的方式进行分组。

基于规则的类别与正则表达式匹配，检测速度更快：

|类别 |检测到的模式 |
| --- | --- |
| **电子邮件** |电子邮件地址模式 |
| **美国电话号码** |常见的美国格式，例如 `415-555-1234` 和 `+1 (415) 555-1234`。裸露的10位数字不匹配|
| **美国社会安全号码** |美国 SSN 模式，例如 `123-45-6789` |

基于模型的类别由 Presidio 匹配，检测速度较慢：|类别 |示例 |
| --- | --- |
| **名字** |自然语言中的人名 |
| **地点** |地址、城市、国家 |
| **国籍、宗教和政治团体** |国籍、宗教信仰、政治立场 |

### 秘密检测

**Secrets** 切换检测常见的 API 密钥、令牌和凭据，并从请求中编辑它们：

|类别 |检测到的模式 |
| --- | --- |
| **LangSmith** |个人访问令牌、服务密钥、旧 API 密钥 |
| **AWS** |访问令牌 |
| **GitHub** |个人访问令牌、细粒度 PAT、OAuth 令牌、应用程序令牌 |
| **GitLab** |个人访问令牌 |
| **人工智能提供商** | OpenAI API 密钥、Anthropic API 密钥 |
| **云平台** | GCP API 密钥、Azure AD 客户端密钥、Google OAuth 访问令牌 |
| **协作工具** | Slack 机器人、用户和应用程序令牌、Slack webhook URL、Datadog 访问令牌 |
| **包注册表** | PyPI 上传令牌、npm 访问令牌 |
| **加密** |私钥、JWT |
| **其他** | Stripe 访问令牌、SendGrid API 令牌 |检测故意缩小范围：仅应用锚定到可识别标记形状的规则，因此提示中的高熵散文不会触发编辑。

### 扫描时间和超时行为

每个数据策略都会限制扫描管道可以运行的时间，并决定达到该上限时会发生什么：

- **最大处理时间（秒）**：默认为 2，可配置范围为 0.1 到 30。
- **超时**：默认情况下**允许请求**。将其设置为 **阻止请求** 以拒绝扫描未及时完成的​​请求。

这两个字段仅对具有 PII 检测权利的组织显示。在其他地方，策略使用默认值。

## 创建数据策略

<Warning>
创建和管理策略需要 `organization:manage` 权限。
</Warning>1. 在LangSmith侧栏中，单击**LLM网关**。
1. 打开**数据策略**选项卡。
1. 单击**创建数据策略**。
1. 选择范围：**组织**、**工作空间**、**用户**或**API 密钥**。
1. 输入**策略名称**，或保留生成的策略名称。
1. 对于工作区、用户或 API 密钥范围，选择策略适用的特定主题。
1. （可选）在**数据保留**下，启用**跟踪内容**以将请求和响应正文存储在跟踪中。
1. 在**数据保护**下，启用**机密**、**PII** 或两者。对于 PII，选择要应用的规则。
1.（可选）设置**最大处理时间（秒）**和**超时**。
1. 单击**创建数据策略**。

数据策略适用于在其配置范围内通过网关的所有请求。它们立即生效。

## 编辑内容如何显示

当检测到 PII 或秘密时，发送到提供者的请求和 LangSmith 跟踪中的内容将被替换为占位符。例如：

**原始请求：**

```text
Please process the refund for John Smith, SSN 123-45-6789.
```

**上游编辑：**

```text
## disclaimer: Some values have been redacted by a reverse proxy and replaced with placeholders containing unique identifiers.

Please process the refund for [SAFE_TO_USE:PERSON_kbqdjxyz], SSN [SAFE_TO_USE:US_SSN_abqxlmwp].
```

网关会在前面添加免责声明，以便模型将占位符视为可以逐字重用的值。

占位符遵循格式 `[SAFE_TO_USE:<CATEGORY>_<suffix>]`：- **SAFE_TO_USE:** 固定前缀，将值标记为经过编辑的占位符。
- **\<CATEGORY\>:** 检测到的类型。例如：`PERSON`、`LOCATION`、`US_SSN`、`US_PHONE_NUMBER`、`OPENAI_API_KEY`、`GITHUB_PAT`、`LANGSMITH_PERSONAL_TOKEN`。
- **\<suffix\>:** 8 个字符的标签。在一个请求中出现两次的值两次都会获得相同的占位符，并且标签无法在请求之间关联。

LangSmith 中的跟踪显示了经过编辑的版本以及指示发生了编辑以及检测到哪些类别的元数据。

**下游取消编辑的响应：**

当上游提供者返回成功响应时，网关将用调用者的原始值替换占位符。流式响应会逐事件重写，因此取消编辑不会延迟流。例如，您的代理可能会看到以下响应：

```text
Confirming John Smith's SSN as 123-45-6789. I will process the full refund.
```

## 修订涵盖哪些内容

**它涵盖的内容：**

- 出站请求内容（发送到 LLM 提供商的消息）在离开网关之前经过扫描和编辑。
- 编辑后的版本出现在 LangSmith 痕迹中。
- 成功的提供商响应（无论是否流式传输）中的占位符都会在响应到达调用方之前恢复为原始值。

**它不包括什么：**- **LLM 提供商的响应：** 如果模型在其响应中生成敏感数据，则不会扫描或编辑该内容。仅扫描请求。
- **提供者错误：** 当提供者返回 400 或更高的状态时，网关会原封不动地传递正文，因此调用者看到的是占位符而不是原始值。
- **数据已在您的跟踪中：** 修订仅适用于流经网关的请求。不扫描直接写入LangSmith API（绕过网关）的跟踪。
- **平台级摄取：** 如果您的要求是防止 PII 进入LangSmith，无论其如何到达（例如，数据驻留合规性），仅网关编辑是不够的。这需要摄取级编辑，这是一项单独的功能。
- **系统和开发人员提示：** 这些都会被跳过，以及作为单个 JSON 字符串到达​​的辅助工具调用元数据和工具调用参数。扫描用户消息、工具结果和结构化工具调用参数。**扫描仪失败打开失败：**如果扫描仪无法访问或出现错误，则请求将继续向提供者发送该阶段生成的内容。只有扫描超时才能阻止请求，并且仅当策略的超时操作设置为 **阻止请求** 时。

覆盖范围很重要。如果您的安全模型要求敏感数据永远不会到达任何系统（而不仅仅是 LLM 提供商），请确保您了解网关覆盖哪些表面以及哪些表面需要额外的控制。

## 后续步骤

- [Traces and access control](/langsmith/llm-gateway-access)：查看网关追踪的位置以及谁可以读取它们。
- [Spend policies](/langsmith/llm-gateway-spend-policies)：在数据保护的同时添加成本控制。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-data-policy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>