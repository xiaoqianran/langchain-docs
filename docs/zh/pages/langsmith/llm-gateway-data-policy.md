<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Data policies | https://docs.langchain.com/langsmith/llm-gateway-data-policy -->

# 数据政策

创建数据策略来编辑敏感数据并控制 LLM 网关中的跟踪内容。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

数据策略控制通过 [LLM Gateway](/langsmith/llm-gateway) 的请求内容会发生什么情况：

* 在请求到达 LLM 提供商之前，网关会对哪些敏感数据（例如个人信息或 API 密钥）进行编辑。
* LangSmith是否将请求和响应主体存储在跟踪中。

管理员使用数据策略来执行以下操作，而无需更改应用程序代码：

* 确保开发人员或代理在提示中输入的客户数据和凭据远离第三方提供商。
* 限制LangSmith存储的内容。

与其他网关策略一样，数据策略可以应用于组织、用户组、工作区、用户或 API 密钥。在 LLM Gateway **策略** 选项卡中，数据策略具有 **数据保护** 策略类型。每个策略结合了三个选项和一个超时设置：* **编辑个人信息 (PII)** 和 **编辑机密**：网关在请求到达 LLM 提供商之前扫描并编辑哪些敏感数据。参见[How redaction works](#how-redaction-works)。
* **存储跟踪内容**：网关是否将请求和响应正文写入LangSmith跟踪。参见[Store trace content](#store-trace-content)。
* **如果编辑时间太长**：扫描可能运行多长时间，以及超出该限制时请求是否继续。参见[Scan time and timeout behavior](#scan-time-and-timeout-behavior)。

## 可用性

每个有权访问 LLM Gateway 的组织都可以使用数据策略。每个这样的组织都可以创建编辑机密和存储跟踪内容的策略。

PII 编辑需要单独的权利，默认情况下该权利处于关闭状态，但为选定的组织启用。没有它：

* **编辑个人信息 (PII)** 选项在创建和编辑表单中显示为锁定，并带有 **请求访问** 链接。
* **如果编辑时间过长**设置被隐藏，并且策略使用默认超时行为。
* API 拒绝任何配置为检测 PII 的策略。

要启用 PII 编辑，请单击 **请求访问权限** 或联系您的客户团队。

## 密文如何运作当数据策略启用检测时，网关会在出站请求到达 LLM 提供商之前对其进行扫描。在将请求转发到上游之前，检测到的值将替换为占位符，因此提供者只能看到经过编辑的有效负载。对于成功的响应，网关会在将响应返回给调用者之前将占位符恢复为原始值。

**编辑个人信息 (PII)** 和 **编辑机密** 选项是独立的。在新策略中，PII 编辑从选择的每种类型开始（对于具有权利的组织），并开始秘密编辑和跟踪内容。

### 编辑个人信息

**编辑个人信息 (PII)** 选项涵盖姓名、电子邮件、美国电话号码、地址和美国 SSN。选择该选项后，其下方会出现六种类型，每种类型都可以单独选择，根据网关检测它们的方式分为两组。

**模式匹配（即时）**下的类型与正则表达式匹配：|类别 |检测到的模式 |
| - | - |
| **电子邮件** |电子邮件地址模式 |
| **美国电话号码** |常见的美国格式，例如 `415-555-1234` 和 `+1 (415) 555-1234`。裸露的10位数字不匹配|
| **美国社会安全号码** |美国 SSN 模式，例如 `123-45-6789` |

**模型检测（较慢）** 下的类型由 Presidio 匹配：

|类别 |示例 |
| - | - |
| **名字** |自然语言中的人名 |
| **地点** |地址、城市、国家 |
| **国籍、宗教和政治团体** |国籍、宗教信仰、政治立场 |

### 编辑秘密

**Redact Secrets** 选项检测常见的 API 密钥、令牌和凭据，并从请求中对它们进行编辑：|类别 |检测到的模式 |
| - | - |
| **LangSmith** |个人访问令牌、服务密钥、旧 API 密钥 |
| **AWS** |访问令牌|
| **GitHub** |个人访问令牌、细粒度 PAT、OAuth 令牌、应用程序令牌 |
| **GitLab** |个人访问令牌 |
| **人工智能提供商** | OpenAI API 密钥、Anthropic API 密钥 |
| **云平台** | GCP API 密钥、Azure AD 客户端密钥、Google OAuth 访问令牌 |
| **协作工具** | Slack 机器人、用户和应用程序令牌、Slack webhook URL、Datadog 访问令牌 |
| **包注册表** | PyPI 上传令牌、npm 访问令牌 |
| **加密** |私钥、JWT |
| **其他** | Stripe 访问令牌、SendGrid API 令牌 |

检测范围故意狭窄。仅应用锚定到可识别标记形状的规则，因此提示中的高熵散文不会触发编辑。

### 扫描时间和超时行为每个数据策略都会限制扫描管道可以运行的时间，并决定达到该上限时会发生什么。在 **如果编辑时间过长** 下，设置等待秒数，默认为 2 秒，可配置范围为 0.1 到 30。然后选择扫描未及时完成时发生的情况：**允许请求未编辑**（默认值）或 **阻止请求**。

此设置仅对具有 PII 编辑权利的组织显示。在其他地方，策略使用默认值。

## 存储跟踪内容

**存储跟踪内容**选项控制请求和响应正文是否存储在网关跟踪中。它对所有组织都是关闭的，并且数据策略会针对策略匹配的请求将其打开。要存储内容而不编辑任何内容，请创建一个仅选择 **存储跟踪内容** 的数据策略。当多个数据策略与一个请求匹配时，由最具体的范围决定。如果同一范围内的策略不一致，则不会存储内容。关闭内容后，跟踪仍会记录元数据，例如令牌使用情况、延迟、状态、模型信息和策略评估结果。有关网关跟踪出现的位置、它们携带哪些元数据以及跟踪内容如何影响计费，请参阅[View LLM Gateway traces](/langsmith/llm-gateway-traces)。

## 创建数据策略

> [!警告]
>
> 创建和管理策略需要 `organization:gateway:manage` 权限。选择用户组也需要`organization:user-groups:read`；有关可用性和设置，请参阅[User Groups](/langsmith/user-groups)。

1. 转至 **LLM Gateway** 并选择 **策略** 选项卡。
2. 单击**+ 策略**。
3. 在**策略类型**下，选择**数据保护**。
4. 输入**名称**，或保留生成的名称。
5. 定义**范围**以及政策适用的主体。
6. 在**此策略应执行什么操作**下，选择 **编辑个人信息 (PII)**、**编辑机密** 和 **存储跟踪内容** 的任意组合。对于 PII，选择要编辑的类型。
7. （可选）在**如果编辑时间太长**下，设置秒数以及扫描未及时完成时会发生的情况。
8. 单击**创建策略**。

数据策略适用于在其配置范围内通过网关的所有请求。它们立即生效。

## 编辑内容如何显示当检测到 PII 或秘密时，发送给提供者的请求和 LangSmith 跟踪中的内容将被替换为占位符。例如：

**原始请求：**

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Please process the refund for John Smith, SSN 123-45-6789.
```

**上游编辑：**

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
## disclaimer: Some values have been redacted by a reverse proxy and replaced with placeholders containing unique identifiers.

Please process the refund for [SAFE_TO_USE:PERSON_kbqdjxyz], SSN [SAFE_TO_USE:US_SSN_abqxlmwp].
```

网关会在前面添加免责声明，以便模型将占位符视为可以逐字重用的值。

占位符遵循格式 `[SAFE_TO_USE:<CATEGORY>_<suffix>]`：

* **SAFE_TO_USE:** 固定前缀，将值标记为经过编辑的占位符。
* **\<CATEGORY>:** 检测到的类型。例如：`PERSON`、`LOCATION`、`US_SSN`、`US_PHONE_NUMBER`、`OPENAI_API_KEY`、`GITHUB_PAT`、`LANGSMITH_PERSONAL_TOKEN`。
* **\<suffix>:** 8 个字符的标签。在一个请求中出现两次的值两次都会获得相同的占位符，并且标签无法在请求之间关联。

LangSmith 中的跟踪显示了编辑版本以及指示发生了编辑以及检测到哪些类别的元数据。

**下游取消编辑的响应：**

当上游提供者返回成功响应时，网关将用调用者的原始值替换占位符。流式响应会逐事件重写，因此取消编辑不会延迟流。例如，您的代理可能会看到以下响应：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Confirming John Smith's SSN as 123-45-6789. I will process the full refund.
```

## 修订涵盖哪些内容

**它涵盖的内容：*** 出站请求内容（发送给 LLM 提供商的消息）在离开网关之前会被扫描和编辑。
* 编辑后的版本出现在 LangSmith 痕迹中。
* 成功的提供者响应（无论是否流式传输）中的占位符都会在响应到达调用方之前恢复为原始值。

**它不包括什么：**

* **来自 LLM 提供商的响应：** 如果模型在其响应中生成敏感数据，则不会扫描或编辑该内容。仅扫描请求。
* **提供程序错误：** 当提供程序返回 400 或更高的状态时，网关将原封不动地传递正文，因此调用者看到的是占位符而不是原始值。
* **网关外部的应用程序跟踪：**您的应用程序接收恢复的值，因此它自己的跟踪可以捕获它们。
* **数据已在您的跟踪中：** 修订仅适用于流经网关的请求。不扫描直接写入LangSmith API（绕过网关）的跟踪。* **平台级摄取：** 如果您的要求是防止 PII 进入 LangSmith，无论其如何到达（例如，数据驻留合规性），仅网关编辑是不够的。这需要摄取级编辑，这是一项单独的功能。
* **系统和开发人员提示：** 这些都会被跳过，以及作为单个 JSON 字符串到达​​的辅助工具调用元数据和工具调用参数。扫描用户消息、工具结果和结构化工具调用参数。

**扫描仪失败打开失败：**如果扫描仪无法访问或出现错误，则请求将继续向提供者发送该阶段生成的内容。只有扫描超时才能阻止请求，并且仅当策略的超时操作设置为 **阻止请求** 时。

覆盖范围很重要。如果您的安全模型要求敏感数据永远不会到达任何系统（而不仅仅是 LLM 提供商），请确保您了解网关覆盖哪些表面以及哪些表面需要额外的控制。

## 后续步骤

* [View LLM Gateway traces](/langsmith/llm-gateway-traces)：查看网关追踪的位置以及谁可以读取它们。
* [Spend policies](/langsmith/llm-gateway-spend-policies)：在数据保护的同时添加成本控制。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-data-policy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。