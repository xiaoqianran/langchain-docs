<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Contributing | https://docs.langchain.com/oss/javascript/contributing/overview -->

# 贡献

**欢迎！感谢您有兴趣做出贡献。**

LangChain 帮助组建了生成人工智能领域最大的开发者社区，并且我们始终对新的贡献者持开放态度。无论您是修复错误、添加功能、改进文档还是分享反馈，您的参与都有助于让 LangChain 和 LangGraph 更好地为每个人服务 🦜❤️

## 贡献方式

<AccordionGroup>
  <Accordion title="Report bugs" icon="bug">
    发现错误？请按照以下步骤帮助我们修复该问题：

    <Steps>
      <Step title="Search">
        检查相应存储库的 GitHub 问题中是否已存在该问题：

        <Columns>
          <Card title="LangChain" icon="link" href="https://github.com/langchain-ai/langchainjs/issues">问题</Card>
          <Card title="LangGraph" icon="topology-ring" href="https://github.com/langchain-ai/langgraphjs/issues">问题</Card>
          <Card title="Deep Agents" icon="robot" href="https://github.com/langchain-ai/deepagentsjs/issues">问题</Card>
        </Columns>
      </Step>

      <Step title="Create issue">
        如果不存在问题，请创建一个新问题。写作时，请务必遵循提供的模板并包含[minimal, reproducible, example](https://stackoverflow.com/help/minimal-reproducible-example)。创建后，将所有相关标签附加到最终期刊上。如果项目维护人员无法重现问题，则不太可能及时得到解决。
      </Step><Step title="Wait">
        项目维护人员将对问题进行分类，并可能要求提供更多信息。请耐心等待，因为我们需要处理大量问题。除非您有新信息要提供，否则请勿提出问题。
      </Step>
    </Steps>

    如果您要添加问题，请尽量将其集中在一个主题上。如果两个问题相关或阻塞，请[link them](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword)而不是合并它们。例如：

    ```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    This issue is blocked by #123 and related to #456.
    ```
  </Accordion>

  <Accordion title="Suggest features" icon="wand">
    对新功能或增强功能有想法吗？

    <Steps>
      <Step title="Search">
        在相应存储库的问题中搜索现有功能请求：

        <Columns>
          <Card title="LangChain" icon="link" href="https://github.com/langchain-ai/langchainjs">问题</Card>
          <Card title="LangGraph" icon="topology-ring" href="https://github.com/langchain-ai/langgraphjs/labels?q=feature">问题</Card>
          <Card title="Deep Agents" icon="robot" href="https://github.com/langchain-ai/deepagentsjs/issues?q=is%3Aissue%20state%3Aopen%20label%3Aenhancement">问题</Card>
        </Columns>
      </Step>

      <Step title="Discuss">
        如果没有请求，则在[relevant category](https://forum.langchain.com/c/oss-product-help-lc-and-lg/16)下开始新的讨论，以便项目维护者和社区可以提供反馈。
      </Step>

      <Step title="Describe">
        请务必描述用例以及为什么它对其他人有价值。如果可能，请提供适用的示例或模型。概述应该通过的测试用例。
      </Step>
    </Steps>
  </Accordion><Accordion title="Improve documentation" icon="book">
    欢迎改进文档！我们努力保持我们的文档清晰和全面，您的观点可以产生很大的影响。

    <Card title="How to propose changes to the documentation" href="/oss/javascript/contributing/documentation">指南</Card>
  </Accordion>

  <Accordion title="Contribute code" icon="code">
    由于用户群庞大，我们的小团队可能很难跟上所有功能请求和错误修复。如果您有能力和时间，我们将非常乐意您的帮助！

    <Card title="How to make your first Pull Request" href="/oss/javascript/contributing/code">指南</Card>

    如果您开始解决某个问题，请将其分配给自己或要求维护人员这样做。这有助于避免重复工作。

    如果您正在寻找解决方案，请查看我们的存储库中标记为“需要帮助”的问题：

    <Columns>
      <Card title="LangChain" icon="link" href="https://github.com/langchain-ai/deepagents/labels?q=help+wanted">标签</Card>
      <Card title="LangGraph" icon="topology-ring" href="https://github.com/langchain-ai/langgraphjs/labels?q=help+wanted">标签</Card>
      <Card title="Deep Agents" icon="robot" href="https://github.com/langchain-ai/deepagentsjs/labels?q=help+wanted">标签</Card>
    </Columns>
  </Accordion>

  <Accordion title="Build a new integration" icon="plug-connected">
    任何人都可以构建并发布自己的LangChain集成包。新集成不被接受为 `langchain-ai` 存储库的 PR — 它们必须独立发布到 PyPI 或 npm。

    <Card title="LangChain" icon="link" href="/oss/javascript/contributing/integrations-langchain">构建LangChain集成指南</Card>
    <Card title="Deep Agents sandboxes" icon="cube" href="/oss/javascript/contributing/integrations-langchain">构建沙箱集成指南</Card>
  </Accordion>
</AccordionGroup>

## 拉取请求要求<Warning>
  **所有拉取请求必须链接到维护人员批准解决方案的问题或讨论。** 在维护人员批准您的方法并将链接的问题分配给您之前，请勿打开拉取请求。早期的 PR 可能会自动关闭，并且在分配之前不会进行审核。
</Warning>

所有拉取请求都应该表现出有意义的努力和上下文理解。 **如果创建拉取请求所需的工作量少于维护人员审查它所需的工作量，则不应提交该贡献。** 低强度的路过式贡献（无论它们是如何生成的）通常在上下文相关性、准确性和质量方面达不到标准。大规模自动贡献代表着对我们人类工作的拒绝服务攻击。

所有外部拉取请求必须满足以下要求：* 拉取请求必须链接到解决方案已得到维护者批准的问题或讨论，并且在打开 PR 之前必须将贡献者分配给该问题。
* 拉取请求必须填写存储库的拉取请求模板。
* 针对网络新功能或改变行为的错误修复的拉取请求应包含一个 `## Release note` 部分，以发布说明就绪语言说明用户可见的更改。

如果不满足这些要求，维护者保留关闭 PR 且不发表评论的权利。 **我们将关闭看似简单的垃圾邮件的拉取请求和问题。**

## 语言政策

所有贡献（问题、拉取请求、代码审查和讨论）都必须使用英语。这使得我们的全球贡献者群体的通信变得可访问和可搜索。

如果英语不是您的母语，请不要担心。我们重视清晰的沟通而不是完美的语法，欢迎使用翻译工具。

## 法学硕士的可接受用途当您**验证每项更改**时，您可以使用人工智能助手来帮助起草或修改贡献：运行和测试代码，根据代码库和官方提供商文档检查事实，并确保结果与存储库风格匹配。不要提交批量、未经审核的生成内容。我们会关闭那些被视为低效或垃圾邮件的拉取请求，无论它们是如何产生的。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>