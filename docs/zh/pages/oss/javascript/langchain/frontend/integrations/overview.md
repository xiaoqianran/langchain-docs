<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Overview | https://docs.langchain.com/oss/javascript/langchain/frontend/integrations/overview -->

# 概述

将 useStream 连接到任何 React UI 组件库或生成式 UI 框架

[⟦T0⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 与 UI 无关。它返回简单的反应状态，其中包含消息、工具调用、加载标志、值和线程元数据，您可以将它们连接到您选择的任何可视层。这些页面展示了不同的库如何与 LangChain 前端集成，每个库都有不同的构建 AI 聊天和生成 UI 的理念。

## 集成

<CardGroup>
  <Card title="CopilotKit" icon="package" href="/oss/javascript/langchain/frontend/integrations/copilotkit">
    完整的人工智能聊天运行时，具有结构化生成 UI 支持。将自定义 CopilotKit 端点添加到 LangGraph 部署中，然后在 React 中渲染动态组件树。
  </Card>

  <Card title="AI Elements" icon="package" href="/oss/javascript/langchain/frontend/integrations/ai-elements">
    用于 AI 聊天的可组合的基于 shadcn/ui 的组件。放入 `Conversation`、`Message`、`Tool` 和 `Reasoning`，并将它们直接连接到 `stream.messages`。
  </Card>

  <Card title="assistant-ui" icon="package" href="/oss/javascript/langchain/frontend/integrations/assistant-ui">
    具有完整运行时层的 Headless React 框架。通过 `useExternalStoreRuntime` 适配器将 `useStream` 桥接到 `AssistantRuntimeProvider`。
  </Card>

  <Card title="OpenUI" icon="package" href="/oss/javascript/langchain/frontend/integrations/openui">
    生成式 UI 库，允许代理在声明性组件 DSL 中生成完整的交互式仪表板。专为数据丰富的报告式 UI 而构建。
  </Card>
</CardGroup>

## 选择一个库每个库都适合稍微不同的集成模型。选择取决于您要构建的 UI 类型：

|                   |副驾驶套件 |人工智能元素 |助理用户界面 |开放式用户界面 |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------- |
| **最适合** |完整的聊天运行时加上结构化的生成 UI |丰富的消息类型聊天 |只需最少的设置即可实现全功能聊天 |生成的仪表板和报告 |
| **用户界面风格** | CopilotKit 聊天 shell + 自定义消息呈现器 |可组合的 shadcn/ui 组件 |无头老虎机+默认主题|具有声明性 DSL 的预构建组件库 || **定制** |自定义后端端点、代理上下文和渲染器 |直接编辑源文件 |覆盖组件插槽 |通过 CSS 自定义属性的主题 |
| **流媒体用户体验** |具有结构化助理负载的运行时管理的聊天流 |组件级渐进式渲染 |内置线程管理|吊装——外壳立即出现，数据填写|
| **工具调用** |通过 CopilotKit 运行时和自定义渲染器 | `Tool` / `ToolHeader` / `ToolOutput` |通过消息槽自定义|内联在生成的 UI 中 |
| **代理格式** |结构化助理回复以及可选的 Markdown |任意 `stream.messages` |任意 `stream.messages` |代理输出 openui-lang 文本 |

这四个都与 LangChain 代理配合良好，后三个也直接连接到[⟦T14⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream)。当您需要更丰富的运行时层和可以与 [LangGraph](/oss/javascript/langgraph/overview) 部署并存的专用端点时，CopilotKit 特别有用。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/integrations/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>