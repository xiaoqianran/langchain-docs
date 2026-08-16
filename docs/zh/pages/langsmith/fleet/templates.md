<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Templates | https://docs.langchain.com/langsmith/fleet/templates -->

# 模板

LangSmith Fleet 包含[starter templates](https://www.langchain.com/templates)，可帮助您快速创建代理。模板包括针对常见用例的预定义指令、[tools](/langsmith/fleet/tools)和[channels](/langsmith/fleet/essentials#channels)（如果适用）。您可以按原样使用模板，也可以作为自定义的基准。

<Tip>
如果您是 Fleet 新手，请从分步 [quickstart](/langsmith/fleet/quickstart) 开始，使用模板构建您的第一个代理。
</Tip>

## 特点

模板是为特定用例设计的预配置代理。每个模板包含以下组件：

### 预配置工具

模板附带一组精选的[tools](/langsmith/fleet/essentials#tools)，使代理能够执行特定操作。例如，电子邮件助理模板包括用于阅读、发送和组织电子邮件的工具。工具通过 OAuth 身份验证连接到外部服务，允许您的代理与 Gmail、Slack 或 Linear 等应用程序进行交互。完整列表请参阅[Supported tools](/langsmith/fleet/tools)。

###系统说明

每个模板都包含一个_系统提示_（也称为_指令_），用于定义代理的行为、个性和能力。系统提示指导代理如何解释用户请求并使用其可用工具。您可以自定义这些说明以满足您的特定需求。### 频道（可选）

一些模板包括[channels](/langsmith/fleet/essentials#channels)，允许代理自动响应外部事件。例如，Slack 机器人模板可能包含一个通道，当有人在 Slack 对话中提及代理时，该通道就会激活。渠道支持基于聊天的交互之外的主动代理行为。

### 克隆和定制

模板可作为您克隆以创建您自己的代理的起点。克隆模板时，您将创建一个独立的副本，您可以对其进行自定义，而不会影响原始模板。您可以修改提示、添加或删除工具、附加不同的渠道以及切换模型，以根据您的要求定制代理。

## 可用模板

<CardGroup cols={2}>
  <Card title="Executive Assistant" icon="mail">
    管理您的收件箱、日历和每日简报。
  </Card>
  <Card title="Software Engineer" icon="code">
    在沙箱中从 Slack、Linear 和 GitHub 发送代码。
  </Card>
</CardGroup>

<Info>
可用的模板可能会随着时间的推移而改变。要获取最新的集合，请打开 Fleet 或 [templates gallery](https://www.langchain.com/templates) 中的 **模板**。
</Info>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/templates.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>