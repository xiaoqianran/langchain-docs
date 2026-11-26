<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect Managed Deep Agents to channels | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-channels -->

# 将托管Deep Agents连接到通道

将托管Deep Agents连接到可以启动运行并接收响应的外部消息传递服务。

通道使托管深度代理可在外部消息传递服务中使用。来自服务的消息可以启动代理运行，并且代理的最终响应通过同一服务返回。

> [!注意]
>
> 托管 Deep Agents 位于 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) 上的 [beta](/langsmith/release-stages)。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

## 项目结构

通道声明位于项目级 `channels/` 目录中：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.ts
  channels/
    slack.ts
```

## 了解渠道

通道结合了外部消息传递集成的三个部分：

* **入站事件**：验证并标准化提供程序事件，然后启动代理运行。
* **出站消息传送**：将代理的响应发送回原始对话。
* **配置**：创建并配置将服务连接到已部署代理的提供者资源。

在托管Deep Agents中，通道将已部署的代理连接到消息传递提供程序。

托管运行时处理通道生命周期：

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

### 向正在运行的代理发送消息

引导允许用户添加到已经在进行中的运行中。当代理在该线程上运行时，同一用户发送消息时，该消息会在下一次模型调用时加入活动运行。它不会开始新的运行。

> [!注意]
>
> 转向处于测试阶段，需要 `managed-deepagents` 0.10.2 或更高版本。

例如，用户要求代理比较供应商，然后在代理搜索时发送“仅包括 SOC 2 兼容供应商”。搜索完成，模型将读取新消息以及迄今为止的结果。对于更窄的请求，继续进行相同的运行。

![A user asks the agent to compare vendors, then sends Only include SOC 2 compliant vendors during the tool call. The message waits as a queued run, the queued run is cancelled as taken, and the message joins the next model call. After the final answer, the agent checks again for late messages.](https://mintcdn.com/langchain-5e9cc07a/EkGVG8izoFmMhuwL/langsmith/images/managed-deep-agents-steering-light.svg?fit=max\&auto=format\&n=EkGVG8izoFmMhuwL\&q=85\&s=08772aeebc34de34d8f7296c79021143)

#### 消息如何加入运行

运行期间发送的消息首先作为排队运行在线程上等待。在每次模型调用之前，代理会检查线程是否可以进行排队运行。对于每一条消息，代理按照消息发送的顺序：1. 取消排队运行，原因为 `taken`，因此该消息稍后不会启动自己的运行。
2. 将运行的消息添加到活动运行的对话中。

转向在步骤之间起作用。已在进行的工具调用或模型调用首先完成。

模型写出最终答案后，代理再次检查线程。如果在最后一次模型调用期间收到消息，则运行将返回到带有该消息的模型，而不是结束。

#### 独立运行的消息

仅当排队运行只包含来自同一用户的用户消息时，它才会加入活动运行。以下排队运行将在活动运行结束后等待并启动：

* 对中断的响应，例如批准。
* 来自不同用户的消息。
* 设置 webhook、从较早的检查点分叉或设置消息以外的输入的运行。

只有主代理接收消息。当子代理运行时，新消息会等待主代理的下一次模型调用。

如果代理无法读取或取消排队的运行，消息将按顺序保持排队状态。代理会在下一次模型调用时再次尝试，并且它未获取的任何消息都会在活动运行结束后自行运行。## 声明项目中的通道

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

> [卡][Slack](/langsmith/javascript/managed-deep-agents-channels-slack)
>
> 从 Slack 提及、直接消息和话题回复开始运行。

> [卡][Custom (HTTP)](/langsmith/javascript/managed-deep-agents-channels-http)
>
> 从任何可以发送 JSON Webhook 的服务开始运行。

HTTP 适配器也可以存在于社区维护的包中。请参阅 [Share a channel adapter as a package](/langsmith/javascript/managed-deep-agents-channels-http#share-a-channel-adapter-as-a-package) 发布用户导入到其通道声明中的可重用提供程序代码。

## 另请参阅* [Identity](/langsmith/javascript/managed-deep-agents-identity)：对调用者进行身份验证，范围通道运行到已解析的用户。
* [Schedules](/langsmith/javascript/managed-deep-agents-schedules)：通过配置的通道交付预定的结果。
* [Deploy an agent](/langsmith/javascript/managed-deep-agents-deploy)：部署项目更改并配置机密。
* [CLI reference](/langsmith/javascript/managed-deep-agents-cli)：查看频道项目文件约定。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-channels.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。