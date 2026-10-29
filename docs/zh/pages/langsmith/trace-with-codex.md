<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace OpenAI Codex sessions | https://docs.langchain.com/langsmith/trace-with-codex -->

# 跟踪 OpenAI Codex 会话

在 LangSmith 中捕获 OpenAI Codex 代理轮次、工具调用、模型元数据和子代理线程。

LangSmith 跟踪插件将您的 [OpenAI Codex](https://developers.openai.com/codex) 会话发送到 LangSmith，以便您可以看到代理做了什么。每个轮次都成为一个跟踪，并且会话的轮次被分组为一个线程。

## 先决条件

* [Codex CLI](https://developers.openai.com/codex/quickstart?setup=cli) v0.153.4 或更高版本。
* 一个LangSmith帐户。
* Windows 和 Linux 上的 [Node.js](https://nodejs.org/) 22.x 或更高版本。在 macOS 上，该插件运行自己的构建，不需要 Node.js。

## 安装插件

添加市场并安装插件：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
codex plugin marketplace add langchain-ai/langsmith-codex-plugins
codex plugin add tracing@langsmith-codex-plugins
```

然后信任 Codex 中的 `/hooks` 插件的钩子，因为在你这样做之前不会有任何跟踪。 Codex 仅在交互界面中询问，因此 `codex exec` 会跳过挂钩，直到您信任它们一次。信任 Codex 后重新启动它们。要为所有人安装插件，请参阅[Deploy to your organization](#deploy-to-your-organization)。有关安装插件的更多信息，请参阅 Codex 文档中的 [Plugins](https://developers.openai.com/codex/plugins)。

## 登录

使用 LangSmith CLI 登录一次。如果您还没有，请参阅[Install the LangSmith CLI](/langsmith/langsmith-cli#install)。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith auth login
```如果您使用 CLI 登录并拥有多个配置文件，请将配置文件中的 `profile` 设置为插件应使用的配置文件。您自己的 `api_key` 会忽略此设置，但在设置 `profile` 时，通用 `LANGSMITH_API_KEY` 不会用作后备。

要使用 API 密钥，请将其添加到 `~/.codex/langsmith.json`：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ "enabled": true, "api_key": "lsv2_pt_...", "agent_id": "shared-codex" }
```

如果设置了多个凭据，插件将使用它找到的第一个凭据：

1. 插件自带的密钥来自`api_key`或`LANGSMITH_CODEX_API_KEY`。
2.您的`langsmith auth login`登录。
3. 来自您环境的通用`LANGSMITH_API_KEY`。

当您的登录过期或您的密钥被拒绝时，跟踪就会停止，并且永远不会上传该间隙的轮次。 Codex 在聊天中显示一条通知，直到您修复它。管理员还可以对每个提示进行[require a working sign-in](#require-a-working-sign-in)。

## 开启追踪

跟踪将关闭，直到您在 `~/.codex/langsmith.json` 将其打开，除非您的管理员已使用 [managed file](#lock-settings) 将其打开。使用 `agent_id` 将跟踪发送到 [agent](/langsmith/log-traces-to-agent#send-traces-to-an-agent)：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ "enabled": true, "agent_id": "shared-codex" }
```

或者将它们发送到具有 `project` 的项目：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ "enabled": true, "project": "shared-codex" }
```

使用其中之一。如果两者都设置，则`agent_id`获胜。> [!警告]
>
> 项目可以使用 `<project>/.codex/langsmith.json` 或 `<project>/langsmith-plugins.json` 覆盖这些设置。克隆存储库可以使用它们来打开跟踪并将您的对话和文件发送到其他人的服务器。在信任存储库之前，请检查其 LangSmith 配置文件以及 `.codex/config.toml` 和 `.codex/hooks.json`。

完成一回合并在[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-codex)中打开您的代理或项目。

## 部署到您的组织

管理员可以为每个人安装该插件并控制它如何从一个地方进行跟踪。

### 为所有人安装

ChatGPT 工作区管理员可以将存储库导入为市场，以便每个人都可以安装该插件。每个用户仍然必须信任插件的钩子。设置请参见[Plugin management](https://developers.openai.com/codex/enterprise/plugin-management)。

### 锁定设置

管理员可以使用每个用户主文件夹中`~/.langsmith-plugins/managed.json` 的托管文件锁定每个用户的跟踪设置。 Claude Code、Cursor 和 Codex 插件都会读取此文件，其设置会覆盖用户自己的配置文件和环境变量。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "api_url": "https://langsmith.example.com",
  "project": "engineering",
  "strict_auth": true
}
```

托管文件适用于 macOS 和 Linux。该插件仅在以下情况下信任它：

* root 拥有该文件及其文件夹。
* 其他用户都不能写入其中任何一个。
* 两者都不是符号链接。如果文件存在但未通过这些检查，跟踪将停止，用户会看到一条联系管理员的消息。锁定设置也会锁定与其关联的设置，因此用户无法在锁周围路由跟踪。例如，锁定 `project` 还可以阻止用户添加自己的 [replicas](/langsmith/trace-replicas) 或使用 `agent_id` 向代理发送跟踪。

管理员通常使用 Jamf 或 Microsoft Intune 等移动设备管理 (MDM) 工具在每台计算机上安装该文件。对于每个可以锁定的设置，请参阅[plugin settings guide](https://github.com/langchain-ai/langsmith-plugin-binary/blob/main/docs/settings.md)。

> **设置脚本示例**
>
> 以 root 身份为每个用户运行此命令，并将 `USER_HOME` 设置为该用户的主文件夹：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> USER_HOME=/Users/developer
> mkdir -p "$USER_HOME/.langsmith-plugins"
> cp managed.json "$USER_HOME/.langsmith-plugins/managed.json"
> chown root:wheel "$USER_HOME/.langsmith-plugins" "$USER_HOME/.langsmith-plugins/managed.json"
> chmod 755 "$USER_HOME/.langsmith-plugins"
> chmod 644 "$USER_HOME/.langsmith-plugins/managed.json"
> ```
>
> 在 Linux 上，使用 `root:root` 而不是 `root:wheel`。完整脚本请参见[Set it up on macOS](https://github.com/langchain-ai/langsmith-plugin-binary/blob/main/docs/settings.md#set-it-up-on-macos)。

### 需要有效登录

严格身份验证会阻止每个提示，直到用户登录或密钥起作用，因此所有会话都不会被跟踪。它默认处于关闭状态，并且在跟踪关闭时没有任何作用。要为所有人打开它，请在托管文件中将 `strict_auth` 设置为 `true`。

> [!警告]
>
> 严格身份验证还会阻止 `codex exec` 运行。将其关闭以进行自动运行，除非登录失败会停止作业。

## 隐藏对话将 `langsmith-tracing:mute` 作为不带前导斜杠的普通消息发送，以将线程的内容排除在 LangSmith 之外，并发送 `langsmith-tracing:unmute` 将其重新打开。确认显示为被钩子阻止的提示，因为这就是 Codex 显示插件回复的方式。要默认将每个线程静音，请将 `defaultMuted` 设置为 `true`。

## 秘密编辑

该插件会在上传任何内容之前剥离您计算机上的秘密，因此它们永远不会到达 LangSmith 或副本。默认情况下，密文处于启用状态。

它捕获提供商 API 密钥、JSON Web 令牌和 PEM 私钥，以及常见模式，例如 `API_KEY=<value>` 或 URL 中的密码。每场比赛都替换为`[SECRET_DETECTED]`。有关完整规则列表，请参阅[Redact secrets from traces](/langsmith/redact-secrets#rules-in-the-preset)。

密文仅匹配已知的凭证形状，因此将其视为安全网而不是保证。运行名称、标签和附件会跳过它，并且经过编辑的跟踪仍然保留您的提示和文件内容。限制谁可以读取跟踪项目。

要关闭密文或添加您自己的模式，请参阅 [plugin settings](https://github.com/langchain-ai/langsmith-codex-plugins#settings)。

## 设置

每个设置都有一个配置文件密钥和一个环境变量。当两者都设置时，环境变量获胜。|配置键 |环境变量 |默认|描述 |
| - | - | - | - |
| `enabled` | `TRACE_TO_LANGSMITH` | `false` |打开追踪。 |
| `api_key` | `LANGSMITH_CODEX_API_KEY` |无 | LangSmith API 密钥。如果您使用 CLI 登录，则不需要。 |
| `project` | `LANGSMITH_CODEX_PROJECT` | `codex` |项目的痕迹去。使用这个或`agent_id`。 |
| `agent_id` | `LANGSMITH_AGENT_ID` |无 |代理痕迹去。如果两者都设置，则胜过`project`。 |
| `api_url` | `LANGSMITH_CODEX_ENDPOINT` | `https://api.smith.langchain.com` | LangSmith 要发送到的服务器。 |

对于每个设置，请参阅[plugin settings](https://github.com/langchain-ai/langsmith-codex-plugins#settings)。要将跟踪发送到多个位置，请参阅[Send a trace to more than one place](https://github.com/langchain-ai/langsmith-codex-plugins#send-a-trace-to-more-than-one-place)。

## 故障排除

* **无痕迹**：检查插件是否已安装，其挂钩是否受 `/hooks` 信任，并且跟踪已打开。
* **更新后停止**：只要版本更改了某个钩子，Codex 就会要求您再次信任该钩子。运行`/hooks`并批准它。
* **跟踪暂停**：再次运行 `langsmith auth login` 或替换被拒绝的 API 密钥。

有关更多修复，请参阅[When nothing shows up](https://github.com/langchain-ai/langsmith-codex-plugins#when-nothing-shows-up)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-codex.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。