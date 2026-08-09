<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Controlled generative UI | https://docs.langchain.com/oss/python/langchain/frontend/controlled-generative-ui -->

# 受控生成 UI

使用您使用组件作为工具编写的组件来渲染代理输出、工具调用渲染、状态渲染和推理

## 概述

受控生成 UI 位于作者控制端
[generative UI spectrum](/oss/python/langchain/frontend/generative-ui-overview)。你写的
组件，代理决定渲染哪个组件以及传递哪些数据
它。代理从不产生标记：它从一组固定的接口中进行选择
构建和测试。

此模式提供了所有生成式 UI 方法中最高的可预测性。
因为每个组件都来自您的代码库，所以您可以控制品牌、布局、
可访问性和行为准确，并且您可以保证无论代理
Surfaces 已通过您的审核。权衡是工程成本：每一个新的
能力需要您提前编写的组件。您的组件库是
边界：代理只能呈现您所运送的内容。

## 何时使用此方法在流量最高、品牌关键的表面上实现受控的生成 UI，
其中输出集是提前已知的，并且正确性比
新颖性：表格、确认流程以及任何具有严格品牌或
可访问性要求。当您需要代理来撰写布局时，您却没有
预测，跨越二次互动的长尾，更进一步
沿着光谱到[declarative generative UI](/oss/python/langchain/frontend/declarative-generative-ui)。

受控生成 UI 涵盖四种技术，首先是代理选择
整个界面并以前端对代理内部做出反应结束。

## 组件作为工具

您可以按照公开工具的方式向代理公开 UI 组件。每个组件都有一个
名称、描述和一组类型化的属性，然后代理选择一个组件
并提供数据作为响应的一部分。前端映射代理的选择
到你真正的实施。这使得代理的工作量很小，决定哪个
预先批准的界面适合当前情况，而您的代码拥有有关它如何使用的一切
外观和行为。

CopilotKit 将此模式记录为 [components as tools](https://docs.copilotkit.ai/generative-ui/tool-based)。

## 工具调用渲染当客服人员调用工具时，该调用会经历一个生命周期：待处理，然后
完成或失败。工具调用渲染将每个阶段转变为专门构建的 UI，例如
作为搜索运行时的加载卡、返回时的结果卡以及错误
说明如果失败，而不是显示原始 JSON。这使得代理的动作
清晰易读，让用户对正在发生的事情充满信心。

请参阅 [Tool calling](/oss/python/langchain/frontend/tool-calling) 模式。

## 状态渲染

代理公开消息列表之外的持久、类型化状态：待办事项、管道
输出、引文、沙箱文件、指标和自定义业务对象。状态
渲染将您的组件绑定到该状态，以便 UI 成为该状态的实时视图
代理人的工作而不是成绩单。当代理更新状态时，界面
用它更新。

请参阅前端概述中的[typed agent state](/oss/python/langchain/frontend/overview)。
要将单个类型的响应负载映射到自定义 UI，请参阅
[Structured output](/oss/python/langchain/frontend/structured-output)。

## 推理具有扩展思维的模型产生的推理与最终答案是分开的。
渲染推理向用户展示代理如何得出结果，从而构建
信任、帮助调试并支持审核。您可以控制推理的方式和时间
例如，出现在与响应不同的可折叠块中。

请参阅 [Reasoning tokens](/oss/python/langchain/frontend/reasoning-tokens) 图案。

## 另请参阅

* [Generative UI overview](/oss/python/langchain/frontend/generative-ui-overview)
* [Declarative generative UI](/oss/python/langchain/frontend/declarative-generative-ui)
* [Open-ended generative UI](/oss/python/langchain/frontend/open-ended-generative-ui)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/controlled-generative-ui.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>