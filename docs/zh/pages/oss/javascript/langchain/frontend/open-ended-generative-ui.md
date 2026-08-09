<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Open-ended generative UI | https://docs.langchain.com/oss/javascript/langchain/frontend/open-ended-generative-ui -->

# 开放式生成 UI

在应用程序外部创建的渲染 UI，例如沙盒 MCP 应用程序，位于生成式 UI 范围的开放端

## 概述

开放式生成 UI 位于代理创建的一端
[generative UI spectrum](/oss/javascript/langchain/frontend/generative-ui-overview)。界面是
在您的应用程序外部编写，例如由 MCP 服务器和您的前端编写
将其渲染在沙箱内。您和代理都不会编写组件：
第三方运送它们，您的应用程序托管它们。

这种方法提供了最广泛的表达范围：代理拥有画布。一个
功能可以通过已经构建的自己的界面到达，因此您可以表面
您从未实现过的交互式工具，您身边没有前端代码。它
适合一次性可视化和定制答案，其结果令人惊讶
足够好胜过可预测的。这也是最具实验性的
方法，确定性最差，速度较慢，运行成本较高，并且不受信任
UI 是最难保持一致、可访问和安全的，因此必须隔离
从你的申请的其余部分。

## 何时使用此方法当您想要展示功能和功能时，可以使用开放式生成式 UI
存在于应用程序外部并独立于应用程序发展的接口，例如
作为 MCP 服务器生态系统发布的工具。当你需要保证时
品牌、可访问性或布局，沿着范围向后移动
[declarative](/oss/javascript/langchain/frontend/declarative-generative-ui) 或
[controlled](/oss/javascript/langchain/frontend/controlled-generative-ui) 生成式 UI，其中
您的应用程序拥有这些组件。

## MCP 应用程序

[Model Context Protocol](https://modelcontextprotocol.io) 让代理连接
到提供工具和资源的外部服务器。 MCP Apps 将这一想法扩展到
界面：MCP 服务器提供交互式 UI，前端通常呈现它
在 iframe 中，直接在对话中。服务器拥有组件，
数据和交互，而您的应用程序提供框架和
与代理的连接。

CopilotKit 将此模式记录为 [MCP Apps](https://docs.copilotkit.ai/generative-ui/mcp-apps)。

## 沙箱和安全由于该接口来自第三方，因此将其视为不可信。渲染它
隔离的上下文，例如沙盒 iframe，并限制它可以访问的内容
行为不当或恶意应用程序无法到达页面的其余部分或用户的页面
数据。沙盒使频谱的开放端可用于生产：
它包含而不是限制表达范围。

## 另请参阅

* [Generative UI overview](/oss/javascript/langchain/frontend/generative-ui-overview)
* [Controlled generative UI](/oss/javascript/langchain/frontend/controlled-generative-ui)
* [Declarative generative UI](/oss/javascript/langchain/frontend/declarative-generative-ui)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/open-ended-generative-ui.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>