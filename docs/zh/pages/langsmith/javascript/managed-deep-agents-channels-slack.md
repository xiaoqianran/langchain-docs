<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect a Managed Deep Agent to Slack | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-channels-slack -->

# 将托管深度代理连接到 Slack

Slack 通道允许人们通过应用程序提及、直接消息和活动 Slack 线程中的回复来调用托管深度代理。托管 Deep Agents 验证 Slack 事件，将每个对话映射到一个线程，作为解析的调用者运行代理，并将响应发布回 Slack。

托管 Deep Agents 创建并配置将 Slack 连接到已部署代理的资源。向代理项目添加通道声明，然后部署。

<Note>
托管 Deep Agents 在 **公共 [beta](/langsmith/release-stages)** 中可用，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构



```text
my-agent/
  agent.ts
  channels/
    slack.ts
```


## 添加 Slack 频道

托管深度代理部署支持一个 Slack 通道。



通道声明位于`channels/slack.ts`。


要在创建项目时包含 Slack，请传递 `--channel slack`：



<CodeGroup>
    ```bash npm
    npx managed-deepagents init my-agent --channel slack
    ```

    ```bash pnpm
    pnpm dlx managed-deepagents init my-agent --channel slack
    ```

    ```bash bun
    bunx managed-deepagents init my-agent --channel slack
    ```
</CodeGroup>


要将 Slack 添加到现有项目，请从项目根运行通道初始化命令：



<CodeGroup>
    ```bash npm
    npx mda channels init slack
    ```

    ```bash pnpm
    pnpm exec mda channels init slack
    ```

    ```bash bun
    bunx mda channels init slack
    ```
</CodeGroup>




```ts channels/slack.ts
import { channels } from "managed-deepagents";

export const channel = channels.slack();
```


## 配置代理在 Slack 中的外观

编辑通道声明以控制代理在 Slack 中的显示方式。<ParamField path="name" type="string">
  Slack 中的代理名称。名称必须包含 1-35 个字符，并且可以包含字母、数字、空格、下划线、破折号和句点。它不能以空格或破折号开头或结尾。
</ParamField>

<ParamField path="description" type="string">
  对代理所做工作的描述。描述最多可包含 139 个字符。
</ParamField>

<ParamField path="icon" type="string">
  Slack 中显示的代理图标的路径，相对于 `channels/` 目录。图标必须是 512 x 512 像素的 PNG 文件，大小不超过 1 MB。如果省略此参数，Managed Deep Agents 将为您生成一个图标。
</ParamField>



<ParamField path="backgroundColor" type="string">
  代理图标后面的背景颜色为六位十六进制颜色，例如`#1d4ed8`。
</ParamField>


例如，在通道声明旁边放置一个图标：



```text
my-agent/
  agent.ts
  channels/
    slack.ts
    support-agent.png
```

```ts channels/slack.ts
import { channels } from "managed-deepagents";

export const channel = channels.slack({
  name: "Support Agent",
  description: "Answers customer questions about orders and returns",
  icon: "support-agent.png",
  backgroundColor: "#1d4ed8",
});
```


### 配置哪些消息开始运行



<ParamField path="triggerOnAllMessages" type="boolean" default="false">
  是否每个新的通道消息都可以启动代理运行。当`false`时，通道消息仅在提及代理时才开始运行；直接消息仍然开始运行。
</ParamField>

<ParamField path="allowBotTriggers" type="boolean" default="false">
  来自其他 Slack 机器人的消息是否可以启动代理运行。
</ParamField>


## 部署代理

在部署期间，托管 Deep Agents 通过通道声明在 Slack 中配置您的代理。

<Steps>
  <Step title="Deploy your agent">
    从项目根目录运行部署命令：<CodeGroup>
        ```bash npm
        npx mda deploy
        ```

        ```bash pnpm
        pnpm exec mda deploy
        ```

        ```bash bun
        bunx mda deploy
        ```
    </CodeGroup>


    Managed Deep Agents 部署代理并设置它需要出现在 Slack 中的资源。
  </Step>
  <Step title="Authorize Slack if prompted">
    如果您之前未授权 LangSmith，CLI 将显示 HTTPS 授权链接。打开链接，选择 Slack 工作区，然后批准请求的访问权限。

    返回终端并按 Enter。 CLI 再次检查授权并继续配置。如果 Slack 工作区需要管理员批准，请在继续之前完成该批准。
  </Step>
  <Step title="Use the agent in Slack">
    首次部署后，您的代理会在 Slack 中向您发送一条直接消息。回复消息以启动代理运行。最终响应出现在 Slack 对话中。
  </Step>
</Steps>

<Note>
Slack 中的人机交互请求仅支持 `approve` 和 `reject` [decision types](/langsmith/javascript/managed-deep-agents-tools#human-in-the-loop)。
</Note>

如果 Slack 已获得授权，部署将在没有授权提示的情况下完成。

在 Slack 通道声明中更改代理的名称、描述、图标或背景颜色后，重新部署代理以在 Slack 中应用更改。

## 与 Slack 交换文件Slack 通道可以双向移动文件。在`/workspace/attachments/`下的代理沙箱中上传土地，代理通过使用`/workspace`下的路径调用`attach_file`发回文件。声明一个 Slack 通道和一个 [sandbox](/langsmith/javascript/managed-deep-agents-sandboxes) 就是整个设置。

<Note>
Slack 文件传输需要 `managed-deepagents>=0.8.0` 和沙箱。如果没有沙箱，则不会保存传入文件，并且不会向模型提供 `attach_file`。
</Note>

托管 Deep Agents 在运行之前暂存传入消息上的文件，以及之前在同一 Slack 线程中共享的文件。代理读取路径的附件状态消息，然后使用其沙箱工具打开文件。该状态和文件内容被标记为数据，而不是指令。

附件永远不是自动的，因此当文件属于回复时，请在代理的 [instructions](/langsmith/javascript/managed-deep-agents-instructions) 中注明：

```markdown instructions.md
When someone asks for a report, write the report to a file under `/workspace`,
then call `attach_file` with that path so the file arrives in Slack.
```

文件的范围仅限于它们到达的 Slack 线程，因为每个线程都有自己的沙箱。直接消息和频道线程从不共享附件。在一个线程中，任何人都可以访问其他人上传的文件，因为传输使用机器人的 Slack 访问权限而不是调用者的访问权限。

### 查看转账限制- **文件大小**：每个方向 200 MiB。
- **路径**：`attach_file`仅接受`/workspace`下的路径。
- **线程历史记录**：扫描涵盖线程中的最新消息。如果达不到要求，附件状态会报告较早的文件可能丢失。
- **跳过的文件**：存储在 Slack 外部的文件以及从 Slack 中删除的文件。
- **Slack 范围**：由于缺少 `files:read`、`files:write` 或历史范围报告而阻止的传输，您需要重新连接 Slack。

## 另请参阅

- [Channels overview](/langsmith/javascript/managed-deep-agents-channels)：了解通道如何将消息服务连接到代理。
- [Agent-owned interrupts](/langsmith/javascript/managed-deep-agents-agent-owned-interrupts)：从工具发布 Slack 表单并在提交时恢复运行。
- [Sandboxes](/langsmith/javascript/managed-deep-agents-sandboxes)：为代理提供文件传输读写的文件系统。
- [Deploy an agent](/langsmith/javascript/managed-deep-agents-deploy)：配置和部署托管深度代理。
- [CLI reference](/langsmith/javascript/managed-deep-agents-cli)：查看托管 Deep Agents 命令和标志。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-channels-slack.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>