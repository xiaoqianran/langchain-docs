<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage model configurations | https://docs.langchain.com/langsmith/model-configurations -->

# 管理模型配置

管理模型配置并控制其跨 LangSmith 功能的可用性。

模型配置定义了 LangSmith 功能在调用 AI 提供商时使用的模型和参数。单个共享配置库跨越整个[workspace](/langsmith/administration-overview#workspaces)，因此您创建的任何配置都可以在以下功能中使用，而无需重复：

* [**Playground**](/langsmith/prompt-engineering-concepts)
* [**Evaluators**](/langsmith/evaluation)
* [**Fleet**](/langsmith/fleet/index)
* [**Chat**](/langsmith/chat)
* [**Insights**](/langsmith/insights)

[Workspace admins](/langsmith/rbac#workspace-admin) 可以创建、编辑和删除配置，并控制每个功能可用的提供程序和模型。非管理员成员可以查看配置，但不能修改它们。

配置还可以携带 [OAuth client credentials](#oauth-client-credentials)，因此 LangSmith 在请求时针对您的 IdP 铸造短期不记名令牌，而不是使用静态 API 密钥。

## 功能访问

**功能访问**表独立控制每个 LangSmith 功能的提供程序和模型可用性。| **功能** | **选型经验** |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|游乐场|完整的模型控制——查看和调整所有参数。无内置模型；依赖于工作区配置。                                                      |
|评估者|完整的模型控制——查看和调整所有参数。无内置模型；依赖于工作区配置。                                                      |
|舰队|默认情况下从精选列表中进行选择。您还可以添加自定义工作区配置。                                                                         |
|聊天 |默认情况下从精选列表中进行选择。您还可以添加自定义工作区配置。                                                                         ||见解（思考）|用于深度分析的模型。默认情况下，从包含提供商推荐的精选列表中进行选择。您还可以添加自定义工作区配置。             |
|见解（总结）|用于轻量级汇总的模型。默认情况下，从包含提供商推荐的精选列表中进行选择。您还可以添加自定义工作区配置。 |

所有功能都支持自定义工作区配置，因此您可以使用任何提供程序或模型，甚至对于默认显示精选列表的功能也是如此。

<Note>
  **见解** 使用两行，一行用于分析，一行用于总结。如果您为任一行选择不兼容的提供程序或不推荐的型号，UI 会显示警告。
</Note>

### 配置功能访问

要配置 [UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-model-configurations) 中的功能访问：

1. 导航到 **设置** > **模型配置**。
2. 在 **功能访问** 表中，找到您要配置的功能。
3. 单击“**启用的提供程序**”并打开或关闭该功能的提供程序。
4. 单击“**可用型号**”并选择用户可以选择的型号。
5. 使用**默认模型**下拉列表设置用户打开该功能时预选的模型。<Note>
  在 **设置** > **模型提供程序** 中为整个组织禁用的提供程序在此表中显示为锁定，并且无法按工作区重新启用。参见[Organization-wide provider control](#organization-wide-provider-control)。
</Note>

## 组织范围内的提供商控制

提供商的可用性在两个层面上进行控制：

* **组织**（组织管理员）：为**整个组织**打开或关闭提供程序 - 每个 [workspace](/langsmith/administration-overview#workspaces) 和每个功能。在 **设置** > **模型提供商** 中管理。
* **工作区**（工作区管理员）：上面的[Feature Access](#feature-access)表，它控制单个工作区中**每个功能**的提供者和模型可用性。

组织级别优先。为组织禁用的提供程序在每个工作区和每个功能中均不可用，并且在每个工作区的功能访问表中显示为**锁定** - 工作区管理员可以看到它，但无法重新启用它。工作空间仅在组织允许的提供商中进行选择。

管理组织范围内的提供商需要 [Organization Admin](/langsmith/rbac#organization-admin) 角色（`organization:manage` 权限），并且可在适用于组织（非个人帐户）的 LangSmith [Cloud](/langsmith/cloud) 和 [Self-hosted](/langsmith/self-hosted) 上使用。

### 禁用组织的提供程序1. 导航至**设置**下的[Model providers](https://smith.langchain.com/settings/model-providers)页面。
2. 关闭某个提供程序以在整个组织中禁用它，或打开以重新启用它。

## 配置

**配置**表是工作区的命名模型配置的共享库。您在 LangSmith 中创建的配置（包括来自 [Playground](/langsmith/managing-model-configurations)）将显示在此处，您可以在所有功能中重复使用它们。

### 创建配置

1. 导航到 **设置** > **模型配置**。
2. 在“**配置**”下，单击“**+ 创建**”。
3. 选择**提供商**和**型号**。
4. 输入 **API 密钥名称** - 工作区中存储提供程序 API 密钥的密钥的名称。
5. 根据需要调整参数。参数分为以下几个部分：

   * **标准采样设置**：温度、最高 P、最高 K、存在惩罚、频率惩罚、最大输出令牌
   * **推理**：推理工作量、服务等级
   * **提供商配置**：提供商 API、基本 URL
   * **选项**：停止序列、种子、JSON 模式、额外标头、每秒请求数、额外参数

   可用参数因提供商而异——有关详细信息，请参阅提供商的文档。
6. 单击“**保存**”。

### 编辑配置1. 在 **配置** 表中，单击配置旁边的溢出菜单 <Icon icon="dots-vertical" />。
2. 选择**编辑**。
3. 更新配置并单击**保存**。

### 删除配置

1. 在 **配置** 表中，单击配置旁边的溢出菜单 <Icon icon="dots-vertical" />。
2. 选择<Icon icon="trash" /> **删除**并确认。

## OAuth 客户端凭据

<Note>
  OAuth 客户端凭据可在运行版本 `0.16.0-rc.6` 或更高版本的 LangSmith [Cloud](/langsmith/cloud) 和 [Self-hosted](/langsmith/self-hosted) 部署上使用。
</Note>

当模型配置位于 OAuth2 网关后面时，您可以将 OAuth `client_credentials` 直接存储在配置上，而不是分发静态 API 密钥。 LangSmith 在请求时将这些凭证交换为短期持有者令牌，将其作为 `Authorization: Bearer <token>` 附加到出站 LLM 调用上，并在令牌过期之前刷新令牌。这是一种按配置的自助服务替代方案，可替代通过 [LLM auth proxy](/langsmith/llm-auth-proxy-self-hosted) 路由工作空间；每个配置两者都是互斥的。OAuth 客户端凭据可在每个支持自定义模型配置的 [plan](/langsmith/pricing-plans) 上使用。 **使用自定义 OAuth** 切换适用于不记名令牌提供商（OpenAI、Anthropic、OpenAI 兼容端点等），并且不支持使用本机云身份进行身份验证的 Bedrock、Google Vertex AI 或 Google GenAI。 **LangServe（已弃用）** 预设的切换也是隐藏的。

### 在模型配置上配置 OAuth

配置 OAuth 需要 [Workspace Admin](/langsmith/rbac#workspace-admin) 角色，或具有 `workspaces:manage-model-configs` 权限的 [custom role](/langsmith/rbac#custom-roles)。没有它的成员会看到 OAuth 字段被禁用，并带有隐藏的秘密提示。在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-model-configurations)中：1. 导航到 **设置** > **模型配置**，然后单击 **+ 创建** 或通过溢出菜单 <Icon icon="dots-vertical" /> > **编辑** 打开现有行。
2. 选择兼容的提供商并照常配置模型参数。
3. 打开**使用自定义 OAuth**。
4. 填写 OAuth 字段：
   * **令牌 URL**：IdP 令牌端点，例如 `https://login.example.com/oauth/token`。
   * **客户端 ID**：OAuth 客户端标识符。
   * **客户端密钥**：OAuth 客户端密钥。静态时加密。
   * **令牌端点身份验证方法**：`client_secret_basic` 或 `client_secret_post`。
   * **额外参数**：在令牌请求正文中发送的键/值行。将这些行用于 `scope`、`audience`、`resource` 或 IdP 期望的任何其他参数。发送多个范围时，每个值添加一行；重复的键作为多值对发送。
   * **额外标头**：随令牌请求一起发送的附加标头。诸如`Authorization`之类的保留标头在保存时会被拒绝。
5. 单击**保存**。

<img alt="Model configuration Create modal in LangSmith Settings with Use Custom OAuth toggled on, showing Token URL, Client ID, masked Client Secret, and Token Endpoint Auth Method set to HTTP Basic." />

<img alt="Model configuration Create modal in LangSmith Settings with Use Custom OAuth toggled on, showing Token URL, Client ID, masked Client Secret, and Token Endpoint Auth Method set to HTTP Basic." />

### 编辑语义

OAuth 字段遵循保护存储秘密的编辑行为：* **秘密往返**：服务器返回秘密为`********`。输入呈现为空，并带有“已设置秘密。键入要替换的内容。”* 提示。提交而不重新输入会使存储的秘密保持不变。
* **关闭保留凭据**：关闭**使用自定义 OAuth** 会停用 OAuth 流程，但保留存储的字段。使用相同的凭据切换回简历。
* **清除字段**：编辑配置并将字段清空以明确清除它。
* **通过另存为预设进行克隆**：当您将一次性配置另存为新预设时，非秘密 OAuth 字段会复制到新行中。该机密无法传输，因为它永远不会公开供读取，因此在克隆上强制禁用 OAuth，直到您重新输入该机密。

### 请求如何流动

当针对支持 OAuth 的配置运行请求时，LangSmith 通过内部代理创建一个承载，缓存结果，并在每个出站 LLM 调用上标记该承载，直到缓存的令牌过期。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    autonumber
    participant Caller as LangSmith service<br/>(Playground, Evals, Insights, Chat, Fleet)
    participant Broker as Token broker
    participant Cache as Redis cache
    participant IdP as Customer IdP
    participant LLM as Upstream LLM provider

    Caller->>Broker: Mint token for configuration X
    Broker->>Cache: Lookup cached token for X
    alt Cache hit
        Cache-->>Broker: Cached token
    else Cache miss or expired
        Broker->>IdP: client_credentials grant
        IdP-->>Broker: access_token + expires_in
        Broker->>Cache: Store until expiry
    end
    Broker-->>Caller: access_token
    Caller->>LLM: Request with Authorization: Bearer <token>
    LLM-->>Caller: Response
```OAuth 和 [LLM auth proxy](/langsmith/llm-auth-proxy-self-hosted) 之间的路由是按配置进行的，而不是按组织进行的。每个请求都会根据配置的 OAuth 状态解析为 OAuth 或 LLM 身份验证代理。单个多模型作业（例如，具有单独的思考模型和总结模型的[Insights](/langsmith/insights)）可以混合两个流程，因为每个模型都是独立解析的。

### 后备行为

如果代理无法创建令牌（IdP 无法访问、凭据无效、在请求准备和执行之间删除配置），则请求将回退到提供程序的静态工作区 API 密钥。如果未设置工作区密钥，则出站呼叫时会出现提供程序 401。

令牌轮换仅在缓存的承载过期后传播。围绕 IdP 上配置的访问令牌 TTL 规划轮换。

### 表面覆盖

无论何时使用模型配置，都会遵循启用 OAuth 的配置：* [**Playground**](/langsmith/prompt-engineering-concepts)：聊天运行和实验运行。
* [**Evaluators**](/langsmith/evaluation)：LLM-as-judge 配置、重用、预览测试和评估器详细信息 当每个提示解析为支持 OAuth 的配置时，测试全部跳过工作区秘密提示。
* [**Insights**](/langsmith/insights)：思考和总结配置独立解决。
* [**Chat**](/langsmith/chat)
* [**Fleet**](/langsmith/fleet/index)

在配置上启用 OAuth 时，LangSmith 不会提示输入该配置的工作区密码，因为代理在请求时提供凭据。

### 安全和审计

* **静态加密**：客户端密钥采用 Fernet 加密，其派生方式与 [workspace secrets](/langsmith/administration-overview#workspaces) 相同。
* **承载缓存**：访问令牌会被缓存直至过期，并且永远不会写入日志。

### 常见问题解答

<Accordion title="Can a single set of OAuth credentials be shared across workspaces?">
  不会。OAuth 凭据存储在模型配置中，该配置是工作区范围内的。每个工作区都会输入自己的凭据，即使这些凭据指向同一 IdP 客户端也是如此。
</Accordion><Accordion title="Why is my OAuth-enabled configuration suddenly using a static workspace key?">
  如果代理无法创建承载（IdP 无法访问、凭据无效、在请求准备和执行之间删除配置），则请求将回退到提供程序的静态工作区 API 密钥。重新打开模型配置并验证令牌 URL 是否可访问、客户端 ID 和密钥是否最新以及令牌端点身份验证方法与您的 IdP 期望的相匹配。
</Accordion>

<Accordion title="How do I rotate the client secret?">
  编辑模型配置并在 **Client Secret** 字段中重新输入密钥。保存时会覆盖以前的秘密。 Redis 缓存的承载会继续工作，直到其 TTL 过期，之后代理会使用轮换的密钥创建一个新的承载。
</Accordion>

<Accordion title="Can OAuth and the LLM auth proxy be used together?">
  是的。路由是按配置进行的。启用 OAuth 的配置使用 OAuth；当在组织级别启用代理时，没有它的配置将落入 LLM 身份验证代理。单个多模型作业可以混合两个流程。
</Accordion>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/model-configurations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>