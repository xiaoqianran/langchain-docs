<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: No-code agents with LangSmith Fleet | https://docs.langchain.com/langsmith/fleet/index -->

# LangSmith 舰队的无代码代理

<Callout icon="speakerphone" color="#4F46E5" iconType="regular">
**Agent Builder 现在是 LangSmith Fleet。** 所有现有代理、配置和集成都将继续工作。无需采取任何行动。
</Callout>

LangSmith Fleet 是一个用于创建和管理 AI 代理的无代码平台。它允许您从模板创建代理，连接您的帐户，并让代理处理日常工作，同时您保持控制。

使用舰队可以：

- 自动执行日常任务，例如起草电子邮件、总结更新和组织信息。
- 连接您最喜爱的应用程序，将上下文带入代理的工作中。
- 在聊天或工作场所（例如 Slack）中使用以获取流程帮助。
- 通过对重要行动的简单批准来保持控制。

## 开始构建

<CardGroup cols={2}>
  <Card title="Build with AI" icon="wand">
    描述您想要创建的代理并让 Fleet 构建它，并在关键点暂停以等待您的输入。
  </Card>
  <Card title="Build from a template" icon="layout-grid" href="/langsmith/fleet/quickstart">
    从预先配置的代理开始并对其进行自定义。
  </Card>
</CardGroup>

## 开始吧<Steps>
  <Step title="Sign up" icon="login">
    报名参加[LangSmith account](https://smith.langchain.com/agents?skipOnboarding=true&utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-index)。
  </Step>
  <Step title="Create an agent" icon="circle-plus">
    通过描述您想要的代理来使用 AI 进行构建，或者从模板开始。当您使用人工智能进行构建时，代理会自行配置并在关键点暂停以等待您的输入。 [Browse templates](https://www.langchain.com/templates)。
  </Step>
  <Step title="Connect your accounts" icon="link">
    安全登录您希望代理使用的服务。
  </Step>
  <Step title="Try it out" icon="rocket">
    单击几下即可运行代理并迭代其指令。
  </Step>
</Steps>

## 隐私政策和免责声明

Slack 的 LangSmith 车队应用程序根据我们的隐私政策收集、管理和存储第三方数据。有关如何处理您的数据的完整详细信息，请参阅[our privacy policy](https://www.langchain.com/privacy-policy)。

Fleet 使用以下 AI 方法：

- **模型**：使用通过LangSmith平台提供的法学硕士
- **数据保留**：根据LangSmith的数据保留政策保留用户数据
- **数据租赁**：数据根据您的LangSmith组织设置进行处理
- **数据驻留**：数据驻留遵循您的 LangSmith 配置<Warning>
免责声明：
- **人工智能生成的内容**：代理的所有响应均由人工智能生成，可能包含错误或不准确之处。始终验证重要信息。
- **数据使用**：Slack 数据不用于训练 LLM。您的工作区数据保持私密，仅用于提供代理功能。
- **透明度**：Fleet 对于添加到您的工作区后将采取的操作是透明的，如上面的权限部分所述。
</Warning>

## 了解更多

- [Essentials: connections, automation, memory, approvals](/langsmith/fleet/essentials)
- [Create from a template](/langsmith/fleet/templates)
- [Set up your workspace](/langsmith/fleet/workspace-admin)
- [Connect apps and services](/langsmith/fleet/tools) 和 [use remote connections](/langsmith/fleet/mcp-framework)
- [Choose between workspace and private agents](/langsmith/fleet/manage-agent-settings)
- [Authorize accounts when prompted](/langsmith/fleet/auth-format)
- [Call agents from your app](/langsmith/fleet/code)

<Note>
**Fleet 的自托管功能可在 [beta](/langsmith/release-stages) 中使用。** 有关更多信息，请参阅 [Enable Fleet](/langsmith/deploy-self-hosted-full-platform#enable-fleet-insights-and-chat)。
</Note>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>