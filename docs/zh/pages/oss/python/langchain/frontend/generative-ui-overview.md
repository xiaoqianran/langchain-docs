<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Generative UI overview | https://docs.langchain.com/oss/python/langchain/frontend/generative-ui-overview -->

# 生成式 UI 概述

了解从受控界面到声明式界面再到开放式界面的生成式 UI 范围

生成式 UI 是代理的输出呈现用户界面的任何模式
超越文字。代理不会将段落流式传输到聊天气泡中，而是驱动
表单、卡片、仪表板和交互式控件。这可以让你的 UI 进行通信
结果与应用程序的方式相同，而代理决定显示内容和时间。

生成式 UI 不是单一技术。它跨越了由一个定义的频谱
问题：**谁编写了界面？** 最后，您编写每个组件并
代理仅在其中进行选择。在另一端，创建接口
完全在您的应用程序之外。沿着频谱交易取得进展
表达范围的可预测性。

## 生成 UI 谱

范围从对每个像素的完全控制到完全代理自主，使用
三种主要方法：

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{
  init: {
    "fontFamily": "monospace",
    "flowchart": {
      "curve": "curve"
    }
  }
}%%
graph LR
  C["Controlled<br/>you author components"]
  D["Declarative<br/>agent emits a UI spec"]
  O["Open-ended<br/>UI created externally"]

  C ~~~ D ~~~ O

  classDef light fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710;
  classDef mid fill:#CDE9FF,stroke:#006DDD,stroke-width:2px,color:#030710;
  classDef deep fill:#B8DFFF,stroke:#006DDD,stroke-width:2px,color:#030710;
  class C light;
  class D mid;
  class O deep;
```

<div>
  <span>更多控制</span>

  <div />

  <span>更多自主权</span>
</div>从左到右，可预测性和每项能力的工程成本均下降，
同时代理的表达范围也在扩大。可访问性和视觉一致性
左边最容易保证，右边最难保证。

### 受控

您创作组件，代理选择要渲染的组件以及数据
通过。这提供了最高的可预测性和最严格的控制
品牌和可访问性，代价是为每种功能编写组件
你想暴露。它是生成式 UI 的主力，非常适合
布局必须精确的高流量、品牌关键的表面，例如航班
门票和预订确认。您的组件库是边界：代理
只能渲染您运送的内容。受控生成 UI 涵盖的组件如下
工具、工具调用渲染、状态渲染和推理。

详情请参见[Controlled generative UI](/oss/python/langchain/frontend/controlled-generative-ui)。

### 声明式代理发出结构化规范，前端组成界面
从您提前注册的组件目录中。该目录充当
护栏和边界：代理可以自由地安排和组合你的组件，但是
不能超出您批准的范围。这就是长尾存在的地方。它
以像素完美换取宽度，适合二次交互、内部交互
工具和仪表板，其中显示有用的内容比精确更重要
控制。 [Declarative generative UI](/oss/python/langchain/frontend/declarative-generative-ui)
用 [json-render](https://json-render.dev) 涵盖这一点； Google 的 A2UI，通过集成
CopilotKit 提供相同的形状以及动态和固定模式变体。

### 开放式代理人拥有画布。该接口是在您的应用程序外部创建的，用于
由 MCP 服务器提供的示例，并在沙箱中呈现。这给出了最宽的
表现力范围广泛，无需前端代码即可添加新的界面功能
您的一侧，适合一次性可视化和定制答案，其中结果
这是令人惊讶的，而且比可预测的还要好。这也是最
实验方法：最不具有确定性，也是最难的
保证可访问性、一致性和安全性，因此UI必须隔离。的
沙箱和你的提示符是边界。

详情请参见[Open-ended generative UI](/oss/python/langchain/frontend/open-ended-generative-ui)。

## 选择一种方法

从您需要约束接口的程度开始：|如果您需要... |选择|
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
|保证一组已知输出的品牌、布局和可访问性 | [Controlled](/oss/python/langchain/frontend/controlled-generative-ui) |
|让代理仅使用经过批准的组件来构建新颖的布局 | [Declarative](/oss/python/langchain/frontend/declarative-generative-ui) |
|由第三方编写的 Surface 界面，无需您自行构建 | [Open-ended](/oss/python/langchain/frontend/open-ended-generative-ui) |

为整个产品选择单一方法是最常见的错误。真实
应用程序混合方法并将每个表面与其目的相匹配：受控
组件用于高流量、品牌关键的核心，声明性组合用于
二次交互的长尾以及第三方的开放式嵌入
能力。单个会话可以跨越所有三个会话。

该范围还适用于聊天之外的领域。相同的三种方法描述了生成
移动设备以及 Slack 或电子邮件等表面上的界面，而不仅仅是聊天中
成绩单。

## 探索频谱<CardGroup>
  <Card title="Controlled" icon="components" href="/oss/python/langchain/frontend/controlled-generative-ui">
    编写组件；代理选择要渲染的内容以及要传递的数据。
  </Card>

  <Card title="Declarative" icon="schema" href="/oss/python/langchain/frontend/declarative-generative-ui">
    代理发出一个规范；前端由注册目录组成。
  </Card>

  <Card title="Open-ended" icon="world" href="/oss/python/langchain/frontend/open-ended-generative-ui">
    在其他地方创建的渲染 UI，例如沙盒 MCP 应用程序。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/generative-ui-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>