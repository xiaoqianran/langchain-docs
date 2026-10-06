<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agent environments | https://docs.langchain.com/langsmith/agent-environments -->

# 代理环境

代理的环境如何划分其踪迹、如何选择一个踪迹以及该组的哪些部分是固定的。

*环境*记录代理在生成跟踪时运行的位置。 [agent](/langsmith/agents) 记录的每条踪迹都准确地落在其一个环境中，该环境是从固定的四个环境中提取的。

由于环境随跟踪一起移动，因此代理运行的位置是跟踪本身的属性。

<Note>
  **测试版。** 基于代理的工作区位于 [beta](/langsmith/release-stages)。 LangChain 为组织启用基于代理的工作区，并且更改适用于之后创建的工作区。现有的 [project-based](/langsmith/observability-concepts#tracing-projects) 工作区不会自动转换，但 LangChain 可以对其进行转换。要询问访问权限，[contact our sales team](https://www.langchain.com/contact-sales)。
</Note>

## 环境名称

四种环境是固定的，不支持自定义名称。环境切换器首先列出它们最像生产的：

* **生产**
* **分期**
* **发展**
* **本地**

代理拥有四个中的多少个取决于[how it was created](/langsmith/create-an-agent)。通过 [Build](/langsmith/build-an-agent) 在 UI 中创建的代理仅从 **Production** 开始，其他每个代理都会在第一次向其发送跟踪时出现。以任何其他方式创建的代理都从所有四个开始。除了保持每个环境的痕迹分开之外，LangSmith 不为选择附加任何行为。环境不会改变代理的检测方式，并且相同的构建可以通过更改其[agent addressing](/langsmith/log-traces-to-agent)来报告到不同的环境。

## 选择环境

无论 LangSmith 需要一个环境而不是所有环境，它都会使用相同的控件：一个显示当前环境的按钮，该按钮可打开列表。它按上面的顺序列出代理的环境。

您到达时选择的环境取决于部分：

* **工作室和警报**：**制作**。
* **监控和部署**：您上次用于代理的环境，或**生产**（如果没有）。
* **跟踪**：您上次用于代理的环境，然后是**本地**，然后是代理拥有的第一个环境。

在部署上，**本地**不会显示，并且当预览版本打开且代理具有预览时，列表会添加 **预览** 条目。

该列表仅包含代理存在的环境。此控制驱动跟踪、监控、警报、[Engine](/langsmith/engine-overview)、Studio 和部署的环境选择。 [Evaluators](/langsmith/evaluators) 和 [Insights](/langsmith/insights) 也适用于单个环境，但它们没有此下拉菜单。

## 另请参阅

* [Agents](/langsmith/agents)
* [Log traces to an agent](/langsmith/log-traces-to-agent)
* [Log traces to a specific project](/langsmith/log-traces-to-project)
* [Observability concepts](/langsmith/observability-concepts)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/agent-environments.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>