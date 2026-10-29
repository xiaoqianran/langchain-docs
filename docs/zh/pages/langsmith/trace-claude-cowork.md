<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Claude Cowork sessions | https://docs.langchain.com/langsmith/trace-claude-cowork -->

# 跟踪 Claude Cowork 会话

使用 Claude 的 LangSmith 跟踪插件将 Claude Cowork 任务、工具调用和技能使用情况发送到 LangSmith。

[Claude Cowork](https://claude.com/docs/cowork/guide/plugins) 运行与 Claude Code 相同的插件，因此 [LangSmith tracing plugin for Claude Code](/langsmith/trace-claude-code) 也跟踪 Cowork 任务。每个轮次都成为一个跟踪，任务的轮次被分组为一个线程。

## 先决条件

* 在 Claude 桌面应用程序中访问 Claude Cowork。
* 一个LangSmith帐户。

## 安装插件

Cowork 从您的 claude.ai 帐户安装插件。要自己安装插件：

1. 转到 claude.ai 上的 **自定义** > **插件**。
2. 添加`langchain-ai/langsmith-claude-code-plugins`或`https://github.com/langchain-ai/langsmith-claude-code-plugins`作为市场。
3. 从该市场安装 `langsmith-tracing` 插件。

该插件会加载到您启动的下一个 Cowork 任务中。为大家安装请参见[Deploy to your organization](#deploy-to-your-organization)。有关安装插件的更多信息，请参阅 Claude 文档中的 [Cowork plugins](https://claude.com/docs/cowork/guide/plugins)。

## 登录

使用 LangSmith CLI 登录一次。如果您还没有，请参阅[Install the LangSmith CLI](/langsmith/langsmith-cli#install)。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith auth login
```

如果您使用 CLI 登录并拥有多个配置文件，请将配置文件中的 `profile` 设置为插件应使用的配置文件。您自己的 `api_key` 会忽略此设置，但在设置 `profile` 时，通用 `LANGSMITH_API_KEY` 不会用作后备。

要使用 API 密钥，请将其添加到 `~/.claude/langsmith.json`，同一文件 Claude Code 读取：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ "enabled": true, "api_key": "lsv2_pt_...", "agent_id": "shared-claude" }
```如果设置了多个凭据，插件将使用它找到的第一个凭据：

1. 插件自带的密钥来自`api_key`或`CC_LANGSMITH_API_KEY`。
2.您的`langsmith auth login`登录。
3. 来自您环境的通用`LANGSMITH_API_KEY`。

当您的登录过期或您的密钥被拒绝时，跟踪就会停止，并且永远不会上传该间隙的轮次。管理员还可以对每个提示进行[require a working sign-in](#require-a-working-sign-in)。

## 开启追踪

跟踪将关闭，直到您在 `~/.claude/langsmith.json` 将其打开，除非您的管理员已使用 [managed file](#lock-settings) 将其打开。使用 `agent_id` 将跟踪发送到 [agent](/langsmith/log-traces-to-agent#send-traces-to-an-agent)：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ "enabled": true, "agent_id": "shared-claude" }
```

或者将它们发送到具有 `project` 的项目：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ "enabled": true, "project": "shared-claude" }
```

使用其中之一。如果两者都设置，则`agent_id`获胜。

启动 Cowork 任务并在 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-claude-cowork) 中打开您的代理或项目。技能调用会记录运行的技能，以便您可以按技能过滤跟踪。

## 部署到您的组织

管理员可以为每个人安装该插件并控制它如何从一个地方进行跟踪。

### 为所有人安装

组织所有者可以将该插件添加到每个成员的 claude.ai 帐户中，这样它就可以同时到达 Cowork 和 Claude Code。设置请参见[Choose a rollout route](https://claude.com/docs/plugins/org-rollout)。

### 锁定设置管理员可以使用每个用户主文件夹中`~/.langsmith-plugins/managed.json` 的托管文件锁定每个用户的跟踪设置。 Claude Code、Cursor 和 Codex 插件都会读取此文件，并且其设置会覆盖用户自己的配置文件和环境变量。

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
* 两者都不是符号链接。

如果文件存在但未通过这些检查，跟踪将停止，并且用户会看到一条消息以联系其管理员。锁定设置也会锁定与其关联的设置，因此用户无法在锁周围路由跟踪。例如，锁定 `project` 还可以阻止用户添加自己的 [replicas](/langsmith/trace-replicas) 或使用 `agent_id` 向代理发送跟踪。

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

### 需要有效登录严格身份验证会阻止每个提示，直到用户登录或密钥起作用，因此所有会话都不会被跟踪。它默认处于关闭状态，并且在跟踪关闭时没有任何作用。要为所有人打开它，请在托管文件中将 `strict_auth` 设置为 `true`。

## 隐藏对话

在 Cowork 任务中运行 `/langsmith-tracing:mute` 以将其内容排除在 LangSmith 之外，并运行 `/langsmith-tracing:unmute` 将其重新打开。要默认静音每个任务，请将 `defaultMuted` 设置为 `true`。

## 秘密编辑

该插件会在上传任何内容之前剥离您计算机上的秘密，因此它们永远不会到达 LangSmith 或副本。默认情况下，密文处于启用状态。

它捕获提供商 API 密钥、JSON Web 令牌和 PEM 私钥，以及常见模式，例如 `API_KEY=<value>` 或 URL 中的密码。每场比赛都替换为`[SECRET_DETECTED]`。完整规则列表请参见[Redact secrets from traces](/langsmith/redact-secrets#rules-in-the-preset)。

密文仅匹配已知的凭证形状，因此将其视为安全网而不是保证。运行名称、标签和附件会跳过它，并且经过编辑的跟踪仍然保留您的提示和文件内容。限制谁可以读取跟踪项目。

## 设置

Cowork 使用与 Claude Code 相同的设置。主要的参见[Settings](/langsmith/trace-claude-code#settings)。对于每个设置，请参阅[plugin settings](https://github.com/langchain-ai/langsmith-claude-code-plugins#settings)。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-claude-cowork.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。