<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect a Managed Deep Agent to Slack | https://docs.langchain.com/langsmith/python/managed-deep-agents-channels-slack -->

# 将托管深度代理连接到 Slack

Slack 通道允许人们通过应用程序提及、直接消息和活动 Slack 线程中的回复来调用托管深度代理。托管 Deep Agents 验证 Slack 事件，将每个对话映射到一个线程，作为解析的调用者运行代理，并将响应发布回 Slack。

Slack 是一种自带应用程序集成。您在代理项目中定义 Slack 应用程序清单。

<Note>
托管 Deep Agents 在 **公共 [beta](/langsmith/release-stages)** 中可用，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

Slack 设置使用通道声明、可编辑清单模板和生成的清单：

```text
my-agent/
  agent.py
  channels/
    slack.py
  slack-app-manifest.json
  .mda/
    slack/
      app-manifest.json
```




## 添加 Slack 频道

导出使用`channels.slack()`创建的通道：

```python channels/slack.py
from managed_deepagents import channels

channel = channels.slack()
```




文件名将通道名称设置为`slack`，并将其事件 API 路由挂载到`/channels/slack/events`。当您需要不同的配置名称时，可以使用其他文件名。

## 创建并部署 Slack 应用程序

设置 Slack 通道后，您需要创建并部署 Slack 应用程序。<Steps>
  <Step title="Deploy your Managed Deep Agent">
  首先，[deploy your Managed Deep Agent](/langsmith/python/managed-deep-agents-deploy)。
  
  ```
  mda deploy .
  ```
  
  等待部署完成。即使 Slack 已部署，也会部署代理
尚未活跃。
  </Step>
  <Step title="Generate the app manifest template">
    运行命令以生成 Slack 应用清单模板。
    
    ```bash
    mda channel add slack .
    ```
    MDA 找到现有部署并写入两个文件：
    - `slack-app-manifest.json` 的“模板”清单
    - `.mda/slack/app-manifest.json` 的完整清单
    
    模板清单是您应该直接编辑以更改范围等的内容。完整的清单是从此模板清单生成的，并包含有关部署的信息。
    如果您对模板清单进行更改，则需要重新运行 `mda channel add slack .` 来重新生成完整模板。 
    不要直接编辑`.mda/slack/app-manifest.json`生成的文件
    
  </Step>
  <Step title="Create and install the Slack app once">
    1. 打开 https://api.slack.com/apps。
    2. 选择**创建新应用程序**。
    3. 选择**从应用程序清单**。
    4. 选择目标 Slack 工作区。
    5. 导入`.mda/slack/app-manifest.json`并创建应用程序。
    6. 打开 **OAuth 和权限** 并选择 **安装到工作区**。
    7. 批准请求的权限。
    8. 从 **OAuth 和权限** 复制 **机器人用户 OAuth 令牌**。9. 从**基本信息→应用程序凭证**复制**签名密钥**。
    
    事件请求 URL 已在生成的清单中，因此没有
    引导清单并且没有第二个清单导入。  
  </Step>
  <Step title="Add the Slack credentials">
    将这两个值添加到项目 .env 中：
    
    ```
    SLACK_SIGNING_SECRET=...
    SLACK_BOT_TOKEN=xoxb-...
    ```
    
    不要提交 .env 也不要将这些值复制到任一清单中。
  </Step>
  <Step title="Redeploy to activate Slack">
  
  ```
  mda deploy .
  ```
  
  此部署将 Slack 凭证转发到托管运行时并
启用经过身份验证的事件处理。
    
  </Step>
  <Step title="Updating Slack Bot Configurations">
    前面的步骤将指导您将 Managed Deepagent 的第一个迭代部署为 Slack 机器人。如果您想对代理进行任何更新，只需重新运行 `mda deploy .` 即可更新已部署的应用程序。如果您想对 Slack 应用程序本身进行任何配置更改，建议的步骤是：
    
    1.本地更新`slack-app-manifest.json`文件
    2. 运行 `mda channel add slack .` — 这将重新生成包含最新更改的清单。这些更改写入`.mda/slack/app-manifest.json`文件
    3. 在 https://api.slack.com/apps → 找到您的应用程序 → 应用程序清单 
    4. 将清单内容替换为新的 `.mda/slack/app-manifest.json` 文件 → 单击 **Save Changes**
    5. 导航到 **OAuth 和权限** 选项卡。单击“**重新安装到工作区**”
    
    这可确保 mda 文件系统中的清单仍然是 Slack 应用程序的真实来源。
  </Step>
</Steps>

将`slack-app-manifest.json`视为事实来源。当您更改其范围、机器人事件、品牌或其他设置时，重新运行 `mda channel add slack .`，应用重新生成的 `.mda/slack/app-manifest.json`，并在 Slack 请求时重新安装应用程序。 `.mda/`下生成的文件是构建工件；不要犯他们。

## 配置 Slack 行为

将选项传递给 `channels.slack(...)` 以控制托管 Deep Agents 运行时行为。在 Slack 应用程序中配置 OAuth 范围和传递的事件类型，而不是在通道声明中。

```python channels/slack.py
from managed_deepagents import channels

channel = channels.slack(
    auto_reply=True,
    mention_behavior="strip",
    filters={
        "include_conversations": ["C0123456789"],
        "exclude_users": ["slack:T0123456789:U0123456789"],
    },
    conversation={
        "app_mention": "thread",
        "direct_message": "conversation",
    },
)
```|选项 |默认 |描述 |
| ---| ---| ---|
| `auto_reply` | `True` |将客服人员的最终回复发布到原始 Slack 线程或对话。 |
| `mention_behavior` | `"strip"` |在将文本传递给代理之前删除 Slack 提及标记。将其设置为`"preserve"`以保留它们。 |
| `filters.include_conversations` |全部 |仅接受来自列出的 Slack 对话 ID 的事件。 |
| `filters.exclude_conversations` |没有例外 |忽略列出的 Slack 对话 ID 中的事件。 |
| `filters.include_users` |全部 |仅接受来自列出的完全合格用户的事件，例如`slack:T123:U456`。 |
| `filters.exclude_users` |没有例外 |忽略来自列出的完全合格用户的事件。 |
| `filters.allow_shared_conversations` | `False` |控制 Slack Connect 共享对话。目前不支持将其设置为 `True`。 |
| `conversation.app_mention` | `"thread"` |选择应用提及及其后续回复如何映射到托管 Deep Agents 线程。 |
| `conversation.direct_message` | `"conversation"` |选择直接消息如何映射到托管 Deep Agents 线程。 |




对话映射接受：

- **`"thread"`**：将一个托管 Deep Agents 线程重用为 Slack 线程。
- **`"conversation"`**：为 Slack 对话重用一个托管 Deep Agents 线程。
- **`"message"`**：为每条消息启动一个单独的托管Deep Agents线程。

## 了解事件和线程行为Slack 应用程序控制哪些事件到达部署。 Slack 通道规范支持的事件并应用配置的过滤器和对话映射。

|松弛交互 |活动订阅 |默认托管 Deep Agents 行为 |
| ---| ---| ---|
|应用提及 | `app_mention` |启动或继续与 Slack 线程关联的线程。 |
|直接留言 | `message.im` |重用与私信对话关联的线程。 |
|公共频道不提及回复 | `message.channels` |仅当代理已具有相应的托管Deep Agents线程时才继续线程。 |
|私人频道中未提及的回复 | `message.groups` |仅当代理已具有相应的托管Deep Agents线程时才继续线程。 |

未提及机器人的顶级频道消息将被忽略。机器人消息、应用程序自己的消息、不受支持的消息子类型以及通道过滤器拒绝的事件不会开始运行。

当 Slack 通过 `app_mention` 和 `message.*` 传递相同的提及时，托管 Deep Agents 会删除重复消息事件。订阅 `app_mention` 以获得提及，并使用 `message.channels` 或 `message.groups` 获得未提及的后续回复。

## 发送回复到 Slack启用 `auto_reply` 后，托管 Deep Agents 会提取最终的助理响应，并在运行完成后将其发布到原始 Slack 对话。




源自通道的运行还会在工具和中间件中公开`runtime.channel`。使用它来检查规范化事件，发布中间或最终消息，或更新以前发布的消息。对于普通 HTTP 和计划运行来说，它是不存在的。

以下工具明确发布最终响应：

```python tools/send_channel_reply.py
from langchain.tools import tool
from managed_deepagents import ManagedDeepAgentRuntime


@tool
async def send_channel_reply(
    text: str,
    runtime: ManagedDeepAgentRuntime,
) -> str:
    """Send the final response to the originating messaging channel."""
    if runtime.channel is None:
        return "This run did not originate from a messaging channel."
    posted = await runtime.channel.post({"text": text}, {"final": True})
    return posted["id"]
```




仅当发布的消息是最终响应时才传递`{"final": True}`。它会抑制自动回复，因此用户不会两次收到最终回复。没有该选项的帖子是中间消息，不会禁止自动回复。




`runtime.channel.post(...)` 只能发布到原始 Slack 线程。通道发起的运行不支持显式目标。要将计划结果发送到特定的 Slack 对话，请使用 [⟦T59⟧](/langsmith/python/managed-deep-agents-schedules#deliver-results-to-slack)。




## 了解 Slack 呼叫者身份

Slack 事件作为从 Slack 工作区和用户派生的身份运行，例如 `slack:T123:U456`。此身份与用于 HTTP 请求的调用者身份是分开的。不支持 Slack 帐户链接。

## 部署更改更改通道声明、机密或身份配置后重新部署。当您更改 `slack-app-manifest.json`、通道名称或部署时，重新运行 `mda channel add slack .`，以便 MDA 可以使用当前事件 URL 重新生成最终清单。部署完成后，将生成的清单应用到现有的 Slack 应用程序。

避免仅在 Slack 仪表板中进行持久配置更改。稍后的清单更新可以替换签入模板中不存在的设置。

## 查看安全性和当前限制

- 托管 Deep Agents 对照其原始正文验证每个 Slack 请求，并拒绝 Slack 的五分钟重播窗口之外的签名。
- 不支持 Slack Connect 共享对话。
- `runtime.channel` 不会公开 `SLACK_BOT_TOKEN` 或其他提供商凭据。
- 事件重复数据删除当前是进程本地的。当 Slack 重试事件时，多副本部署可以多次调用代理。

<Warning>
当通道触发工具执行外部副作用时，将其设计为幂等的。 Slack 重试和多副本处理可以为同一逻辑事件生成多次运行。
</Warning>

## Slack 通道故障排除- **`mda channel add slack` 报告它只需要一个通道**：使用清单工作流程时，在项目中仅保留一个 `channels.slack(...)` 声明。
- **MDA 无法读取模板**：确认 `slack-app-manifest.json` 是项目根目录下的常规 JSON 文件。删除凭据和任何 `settings.event_subscriptions.request_url`，并保持套接字模式禁用。
- **第一个部署写入引导清单并退出**：当 Slack 凭证尚不存在时，这是预期的。创建并安装应用程序，添加两个凭据，然后重新运行相同的命令。
- **MDA 不会编写最终清单**：在没有 `--no-wait` 的情况下运行 `mda deploy .`，然后重新运行 `mda channel add slack .`。 CLI 需要部署的代理服务器 URL。
- **Slack 无法验证请求 URL**：确认部署正常，应用程序的 **事件订阅** 页面上的 URL 与 `https://<agent-server>/channels/<name>/events` 匹配，并且 `SLACK_SIGNING_SECRET` 属于该应用程序。添加 Slack 凭据后重新部署，然后应用重新生成的最终清单。
- **提及不会开始运行**：订阅`app_mention`，添加`app_mentions:read`，邀请机器人加入对话，并在更改范围后重新安装应用程序。
- **直接消息不会开始运行**：订阅`message.im`并添加`im:history`。- **线程回复不开始运行**：在代理先前参与的线程内回复。订阅`message.channels`或`message.groups`，添加匹配的历史范围，并确认机器人仍在对话中。
- **代理运行但不回复**：确认`auto_reply`已启用并且`SLACK_BOT_TOKEN`有`chat:write`。




## 另请参阅

- [Channels overview](/langsmith/python/managed-deep-agents-channels)：了解提供商中立的渠道模型。
- [Identity](/langsmith/python/managed-deep-agents-identity)：配置身份验证和调用者所有权。
- [Schedules](/langsmith/python/managed-deep-agents-schedules)：将预定结果交付给 Slack。
- [Custom tools](/langsmith/python/managed-deep-agents-tools)：附加使用`runtime.channel`的工具。
- [Deploy an agent](/langsmith/python/managed-deep-agents-deploy)：配置部署机密并检查构建。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-channels-slack.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>