<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect Managed Deep Agents to channels | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-channels -->

# 将托管Deep Agents连接到通道

通道将托管深度代理连接到外部消息服务。来自服务的消息可以启动代理运行，并且代理可以通过同一服务进行响应，而无需单独的应用程序服务器。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

通道声明位于项目级 `channels/` 目录中，每个文件一个通道：



```text
my-agent/
  agent.ts
  channels/
    support.ts
```


## 了解渠道

通道结合了外部消息传递集成的三个部分：

- **入站事件**：验证并标准化提供程序事件，然后启动代理运行。
- **出站消息传送**：将代理的响应发送回原始对话。
- **部署要求**：声明部署所需的机密和提供程序配置。

在托管Deep Agents中，通道将已部署的代理连接到消息传递提供程序。

托管运行时处理通道生命周期：

```mermaid
flowchart LR
    Provider["Messaging provider"] --> Verify["Verify and normalize event"]
    Verify --> Thread["Resolve identity and thread"]
    Thread --> Run["Run agent"]
    Run --> Reply["Post response"]
    Reply --> Provider

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900;
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710;
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33;
    class Provider trigger;
    class Verify,Thread,Run process;
    class Reply output;
```提供程序适配器确定接受哪些事件、提供程序对话如何映射到托管Deep Agents线程以及如何传递响应。通道声明公开了该提供程序支持的配置。

## 声明项目中的通道

将每个通道放在`channels/`下的单独模块中。



从每个文件中导出一个名为 `channel` 的文件。


文件名成为配置的通道名称。它在运行时识别通道并构成其入站路由的一部分。



例如，`channels/support.ts`中的声明接收以下位置的事件：


```text
POST /channels/support/events
```



不要将声明命名为 `channels/channel.ts`。


通道名称在项目中必须是唯一的。

提供者工厂创建声明。



例如，`channels.slack()` 创建一个 Slack 通道。


有关完整的声明和设置程序，请参阅提供商指南。

## 在运行时访问原始通道



通道发起的运行将 `runtime.channel` 暴露给工具和中间件。


它包含规范化的事件和对话地址，以及发布和更新消息的方法。



普通 HTTP 运行和计划运行没有原始通道，因此这些运行不存在 `runtime.channel`。默认情况下，托管运行器将代理对原始对话的最终响应发布。提供程序指南描述了如何自定义该行为并发送中间消息。

计划运行可以通过指定通道提供结果，即使它们并非源自某个通道。参见[Schedules](/langsmith/javascript/managed-deep-agents-schedules#deliver-results-to-slack)。

## 区分通道和连接器

通道接收启动代理运行并传递响应的消息。 [MCP connector](/langsmith/javascript/managed-deep-agents-mcp-connectors) 为远程 MCP 服务器提供代理工具。项目可以使用其中之一或两者。

## 支持的频道

<CardGroup cols={2}>
  <Card title="Slack" icon="brand-slack" href="/langsmith/javascript/managed-deep-agents-channels-slack">
    从 Slack 提及、直接消息和线程回复开始运行。
  </Card>
</CardGroup>

## 另请参阅

- [Identity](/langsmith/javascript/managed-deep-agents-identity)：对调用者进行身份验证，范围通道运行到已解析的用户。
- [Schedules](/langsmith/javascript/managed-deep-agents-schedules)：通过配置的通道交付预定的结果。
- [Deploy an agent](/langsmith/javascript/managed-deep-agents-deploy)：部署项目更改并配置机密。
- [CLI reference](/langsmith/javascript/managed-deep-agents-cli)：查看频道项目文件约定。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-channels.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>