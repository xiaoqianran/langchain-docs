<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prompt & Context Hub | https://docs.langchain.com/langsmith/prompt-context-hub -->

# 提示和上下文中心

存储、版本化和更新代理在生产中使用的提示和上下文。

提示、检索上下文、技能和任务指令的变化比它们周围的应用程序代码更频繁，并且通常需要由非工程师的人员进行编辑。使用提示和上下文中心来存储、版本控制、审查和更新代理的非代码部分，以便您无需完全部署即可更改行为，并让领域专家拥有他们最了解的上下文。

[Prompts](#prompts) 是您发送给模型的单独消息模板。 [Contexts](#context-hub) 是版本化的指令和工具包，用于定义技能或完整的代理，通过环境进行提升，以便您的代理提取正确的版本。

## 提示

> **[Create and update prompts](/langsmith/create-a-prompt)**
>
> 通过 UI 或 SDK 构建提示、配置设置、使用工具、添加多模式输入并连接模型提供程序。

> **[Manage prompts](/langsmith/manage-prompts)**
>
> 使用标签进行组织、提交更改、触发 Webhook 并通过公共提示中心进行共享。

> **[Explore the prompt hub](/langsmith/manage-prompts#public-prompt-hub)**
>
> 浏览和管理提示标签并从LangChain Hub 发现社区提示。

> **[Open the Playground](/langsmith/prompt-engineering-concepts#playground)**
>
> 使用自定义端点和模型配置根据提示进行测试和实验。> **[Follow tutorials](/langsmith/optimize-classifier)**
>
> 学习分步技术，例如优化分类器和高级提示工程。

使用 Playground 中的 **[Chat](/langsmith/chat)** 来优化提示、生成工具并在 AI 支持的帮助下创建输出模式。

## 上下文中心

> **[Concepts](/langsmith/context-engineering-concepts)**
>
> 了解上下文工程的核心概念：技能、代理、版本控制和共享。

> **[Use the Context Hub](/langsmith/use-the-context-hub)**
>
> 创建上下文，查看其文件和历史记录，并将其提升为环境。

> **[Manage contexts with the SDK](/langsmith/manage-contexts-sdk)**
>
> 以编程方式在 Context Hub 中推送、拉取、列出和删除代理和技能存储库。

> **[Configure commit webhooks](/langsmith/context-hub-webhooks)**
>
> 将工作区中的每个代理和技能提交发送到外部 HTTPS 端点。

> [!注意]
>
> 要设置 LangSmith 实例，请访问 [Platform setup section](/langsmith/platform-setup) 在云、混合或自托管之间进行选择。所有选项都包括可观察性、评估、即时工程和部署。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/prompt-context-hub.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。