<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect Managed Deep Agents to channels | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-channels -->

# 将托管Deep Agents连接到通道

Connect Managed Deep Agents to external messaging services that can start runs and receive responses.

A channel makes a managed deep agent available in an external messaging service. Messages from the service can start agent runs, and the agent's final responses return through the same service.

> [!注意]
>
> Managed Deep Agents is in **public [beta](/langsmith/release-stages)** on [LangSmith Cloud](/langsmith/cloud).

## 项目结构

Channel declarations live in the project-level `channels/` directory:

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.ts
  channels/
    slack.ts
```

## Understand channels

A channel combines three parts of an external messaging integration:

* **Inbound events**: Verify and normalize provider events, then start an agent run.
* **Outbound messaging**: Send the agent's response back to the originating conversation.
* **Provisioning**: Create and configure the provider resources that connect the service to the deployed agent.

In Managed Deep Agents, a channel connects a deployed agent to a messaging provider.

The managed runtime handles the channel lifecycle:

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

文件名成为配置的通道名称并标识部署中的通道。

不要将声明命名为 `channels/channel.ts`。

通道名称在项目中必须是唯一的。

提供者工厂创建声明。

例如，`channels.slack()` 创建一个 Slack 通道。

请参阅提供程序指南以了解其声明、应用程序配置和部署过程。

## 区分通道和连接器

通道接收启动代理运行并传递响应的消息。 [MCP connector](/langsmith/javascript/managed-deep-agents-mcp-connectors) 为远程 MCP 服务器提供代理工具。项目可以使用其中之一或两者。

## 支持的频道

> **[Slack](/langsmith/javascript/managed-deep-agents-channels-slack)**
>
> 从 Slack 提及、直接消息和话题回复开始运行。

> **[HTTP](/langsmith/javascript/managed-deep-agents-channels-http)**
>
> 从任何可以发送 JSON Webhook 的服务开始运行。

## 另请参阅* [Identity](/langsmith/javascript/managed-deep-agents-identity)：对调用者进行身份验证，范围通道运行到已解析的用户。
* [Schedules](/langsmith/javascript/managed-deep-agents-schedules): deliver scheduled results through a configured channel.
* [Deploy an agent](/langsmith/javascript/managed-deep-agents-deploy)：部署项目更改并配置机密。
* [CLI reference](/langsmith/javascript/managed-deep-agents-cli)：查看频道项目文件约定。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-channels.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。