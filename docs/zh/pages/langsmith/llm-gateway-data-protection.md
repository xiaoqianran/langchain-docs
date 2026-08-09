<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Data protection | https://docs.langchain.com/langsmith/llm-gateway-data-protection -->

# 数据保护

在 LLM 请求到达提供商之前扫描并编辑 PII 和机密。

<Note>
  **测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

当 PII 或机密编辑策略处于活动状态时，网关会在出站请求到达 LLM 提供商之前对其进行扫描。如果检测到敏感数据，则会从请求中对其进行编辑。代理继续收到响应。

编辑的内容也会在 LangSmith 跟踪中进行编辑，因此敏感数据也不会保留在您的可观察性数据中。

## PII 检测

网关检测并编辑以下类别的个人身份信息：

|类别 |示例 |
| --------------------------------------------------- | -------------------------------- |
| **名字** |自然语言中的人名 |
| **国籍、宗教或政治立场** |国籍 |
| **地点** |地址、城市、国家 |检测使用 Presidio 进行命名实体（名称、位置和 NRP），并使用基于模式的规则进行结构化标识符。

结构化标识符使用正则表达式进行检测，并且不使用模型：

|类别 |检测到的模式 |
| ------------------------ | | ------------------------------------------------------ |
| **社会安全号码** |美国 SSN 模式（例如 123-45-6789）|
| **电话号码** |美国电话号码模式|

## 秘密检测

网关检测并编辑各种提供商和格式的 API 密钥、令牌和凭证：|类别 |检测到的模式 |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **朗史密斯**​​ |个人令牌、服务密钥 |
| **AWS** |访问令牌 |
| **GitHub** |个人访问令牌、细粒度 PAT、OAuth 令牌、应用程序令牌 |
| **GitLab**              |个人访问令牌 |
| **人工智能提供商** | OpenAI API 密钥、Anthropic API 密钥 |
| **云平台** | GCP API 密钥、Azure AD 客户端机密 |
| **协作工具** | Slack 机器人/用户/应用程序令牌、Datadog 访问令牌 |
| **包注册表** | PyPI 上传令牌、npm 访问令牌 |
| **加密** |私钥|
| **条纹** |访问令牌 |## 启用密文策略

<Warning>
  创建和管理策略需要`organization:manage`权限。
</Warning>

1. 转到**设置 → 网关 → LLM 网关**。
2. 单击**创建策略**。
3. 选择 **PII 编辑** 或 **Secrets 编辑** 作为策略类型。
4. 配置要检测的类别（或启用所有类别）。
5. 保存。

密文策略适用于在其配置范围内通过网关的所有请求。它们立即生效。

## 编辑内容如何显示

当检测到 PII 或机密时，发送到提供程序的请求和 LangSmith 跟踪中的内容都会替换为占位符。例如：

**原始请求：**

```
Please process the refund for John Smith, SSN 123-45-6789.
```

**上游编辑：**

```
Please process the refund for [SAFE_TO_USE:PERSON_kbqdjxyz], SSN [SAFE_TO_USE:US_SSN_abqxlmwp]
```

占位符遵循格式 `[SAFE_TO_USE:<CATEGORY>_<suffix>]`：

* **SAFE\_TO\_USE:** 固定前缀，将值标记为经过编辑的占位符。
* **\<CATEGORY>:** 检测到的类型。例如：`PERSON`、`LOCATION`、`US_SSN`、`US_PHONE_NUMBER`、`OPENAI_API_KEY`、`GITHUB_PAT`、`LANGSMITH_PERSONAL_TOKEN`。
* **\<suffix>:** 8 个字符的随机标签。

LangSmith 中的跟踪显示了经过编辑的版本以及指示发生了编辑以及检测到哪些类别的元数据。

**下游取消编辑的响应：**当上游提供者返回响应时，网关将用调用者的原始值替换编辑占位符。例如，您的代理可能会看到以下响应：

```
Checking Confirming John Smith's SSN to be 123-45-6789.... Okay! I will process the full refund.
```

## 修订涵盖哪些内容

**它涵盖的内容：**

* 出站请求内容（发送到 LLM 提供商的消息）在离开网关之前会被扫描和编辑。
* 编辑后的版本出现在 LangSmith 痕迹中。

**它不包括什么：**

* **来自 LLM 提供商的响应：** 如果模型在其响应中生成敏感数据，则该内容不会被编辑。流式响应编辑正在进行中。
* **数据已在您的跟踪中：** 修订仅适用于流经网关的请求。不扫描直接写入 LangSmith API（绕过网关）的跟踪。
* **平台级摄取：** 如果您的要求是防止 PII 进入 LangSmith，无论其如何到达（例如，数据驻留合规性），仅网关编辑是不够的。这需要摄取级编辑，这是一项单独的功能。
* **提示扫描：** 不扫描系统提示、开发人员提示和工具调用参数。**扫描器故障是失败关闭**：如果 PII 或机密扫描器无法访问、速度缓慢或出现错误，则该阶段会阻止请求继续进行。

这种区别很重要。如果您的安全模型要求敏感数据永远不会到达任何系统（而不仅仅是LLM提供商），请确保您了解网关覆盖哪些表面以及哪些表面需要额外的控制。

## 后续步骤

* [Spend policies](/langsmith/llm-gateway-spend-policies)：在数据保护的同时添加成本控制。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-data-protection.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>