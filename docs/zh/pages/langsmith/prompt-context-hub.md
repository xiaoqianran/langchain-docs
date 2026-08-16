<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prompt & Context Hub | https://docs.langchain.com/langsmith/prompt-context-hub -->

# 提示和上下文中心

提示、检索上下文、技能和任务指令的变化比它们周围的应用程序代码更频繁，并且通常需要由非工程师的人员进行编辑。使用提示和上下文中心来存储、版本控制、审查和更新代理的非代码部分，以便您无需完全部署即可更改行为，并让领域专家拥有他们最了解的上下文。

[Prompts](#prompts) 是您发送给模型的单独消息模板。 [Contexts](#context-hub) 是版本化的指令和工具包，用于定义技能或完整的代理，通过环境进行提升，以便您的代理提取正确的版本。

## 提示<Columns cols={3}>
  <Card title="Create and update prompts" icon="edit" href="/langsmith/create-a-prompt" arrow="true">
    通过 UI 或 SDK 构建提示、配置设置、使用工具、添加多模式输入以及连接模型提供程序。
  </Card>
  <Card title="Manage prompts" icon="tags" href="/langsmith/manage-prompts" arrow="true">
    使用标签进行组织、提交更改、触发 Webhook 并通过公共提示中心进行共享。
  </Card>
  <Card title="Explore the prompt hub" icon="folders" href="/langsmith/manage-prompts#public-prompt-hub" arrow="true">
    浏览和管理提示标签，并从 LangChain 中心发现社区提示。
  </Card>
  <Card title="Open the Playground" icon="test-pipe" href="/langsmith/prompt-engineering-concepts#playground" arrow="true">
    使用自定义端点和模型配置对提示进行测试和实验。
  </Card>
  <Card title="Follow tutorials" icon="notebook" href="/langsmith/optimize-classifier" arrow="true">
    学习分步技术，例如优化分类器和高级提示工程。
  </Card>
</Columns>

<Callout type="info" icon="feather">
使用 Playground 中的 **[Chat](/langsmith/chat)** 来优化提示、生成工具并在 AI 支持的帮助下创建输出模式。
</Callout>

## 上下文中心

<Columns cols={3}>
  <Card title="Concepts" icon="bulb" href="/langsmith/context-engineering-concepts" arrow="true">
    了解上下文工程的核心概念：技能、代理、版本控制和共享。
  </Card>
  <Card title="Use the Context Hub" icon="pointer" href="/langsmith/use-the-context-hub" arrow="true">
    创建上下文，查看其文件和历史记录，并将其提升到环境。
  </Card>
  <Card title="Manage contexts with the SDK" icon="code" href="/langsmith/manage-contexts-sdk" arrow="true">
    以编程方式在 Context Hub 中推送、拉取、列出和删除代理和技能存储库。
  </Card>
  <Card title="Configure commit webhooks" icon="webhook" href="/langsmith/context-hub-webhooks" arrow="true">
    将工作区中的每个代理和技能提交发送到外部 HTTPS 端点。
  </Card>
</Columns><Note>
要设置 LangSmith 实例，请访问 [Platform setup section](/langsmith/platform-setup) 在云、混合或自托管之间进行选择。所有选项都包括可观察性、评估、即时工程和部署。
</Note>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/prompt-context-hub.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>