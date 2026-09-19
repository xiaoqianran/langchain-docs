<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Claude Code applications | https://docs.langchain.com/langsmith/trace-claude-code -->

# 跟踪克劳德代码应用程序

本指南向您展示如何自动从[Claude Code CLI](https://code.claude.com/docs/en/overview)发送对话到LangSmith。

配置完成后，每个 Claude Code 项目都可以选择将跟踪发送到LangSmith。每个跟踪包括用户消息、工具调用、压缩、子代理运行和助理响应。系统提示不包括在内，因为 Claude Code 不会在对话记录中返回它们。

## 先决条件

在设置跟踪之前，请确保您拥有：

- [**Claude Code CLI**](https://code.claude.com/docs/en/overview)已安装。
- [**LangSmith API key**](/langsmith/create-account-api-key)。
- [**Node.js**](https://nodejs.org/)已安装。

## 开始使用

从 Claude Code 中运行：

```bash
/plugin marketplace add langchain-ai/langsmith-claude-code-plugins
/plugin install langsmith-tracing@langsmith-claude-code-plugins
/reload-plugins
```

要更新插件，请运行：

```bash
/plugin marketplace update langsmith-claude-code-plugins
/reload-plugins
```

<Note> 如果您要从之前推荐的使用手动创建的停止挂钩跟踪 Claude 代码的版本迁移，请参阅 [Migrating from the manual stop hook](#migrating-from-the-manual-stop-hook)。 </Note>

### 设置环境变量

**选项 1：项目级配置（推荐）**

该插件需要以下环境变量：- `TRACE_TO_LANGSMITH: "true"`：启用此项目的跟踪。删除或设置为 `false` 以禁用跟踪。
- `CC_LANGSMITH_API_KEY`：您的LangSmith API 密钥。
- `CC_LANGSMITH_PROJECT`：您的跟踪将发送到的 LangSmith 项目名称。
-（可选）`CC_LANGSMITH_METADATA`：附加到所有运行的自定义元数据的 JSON 对象（例如 PR URL、作者）。
-（可选）`CC_LANGSMITH_DEBUG: "true"`：启用详细的调试日志记录。删除或设置为 `false` 以禁用调试日志记录。

要进行设置，请创建或编辑 [Claude Code's project settings file](https://code.claude.com/docs/en/settings#:~:text=Project%20settings%20are%20saved%20in%20your%20project%20directory%3A)。在项目目录中创建一个 `.claude/settings.local.json` 并按如下方式填充它：

```json
{
  "env": {
    "TRACE_TO_LANGSMITH": "true",
    "CC_LANGSMITH_API_KEY": "<LangSmith API key>",
    "CC_LANGSMITH_PROJECT": "my-project"
  }
}
```

<Note> 或者，要为所有 Claude Code 会话启用对 LangSmith 的跟踪，您可以将之前的 JSON 添加到 [global Claude Code settings.json](https://code.claude.com/docs/en/settings#:~:text=User%20settings%20are%20defined%20in%20~/.claude/settings.json%20and%20apply%20to%20all%20projects.) 文件中。 </Note>

**选项 2：Shell 环境变量**

在 shell 中运行以下命令或将它们添加到 shell 配置文件中（`~/.zshrc`、`~/.bashrc` 或 `~/.bash_profile`）：

```bash
export TRACE_TO_LANGSMITH="true"
export CC_LANGSMITH_API_KEY="<LangSmith API key>"
export CC_LANGSMITH_PROJECT="my-project"
```

## 验证设置

Claude Code 响应后，跟踪将在您的 [LangSmith](https://smith.langsmith.com) 项目中显示完整。如果您在运行过程中中断运行，则插件只会在您发送下一条消息或结束会话时刷新该运行。

在LangSmith，你会发现：- 发送给 Claude Code 的每条消息都显示为一条痕迹。
- 来自同一 Claude Code 会话的所有回合都使用共享的 `thread_id` 进行分组，您可以在项目的 **Threads** 选项卡中查看。

## 自定义元数据

将 `CC_LANGSMITH_METADATA` 环境变量设置为 JSON 对象，以将自定义元数据附加到所有跟踪的运行。这对于使用 PR URL、作者或环境名称等上下文信息标记跟踪非常有用。

<Tabs>

<Tab title="Settings file (recommended)">

```json
{
  "env": {
    "TRACE_TO_LANGSMITH": "true",
    "CC_LANGSMITH_API_KEY": "<LangSmith API key>",
    "CC_LANGSMITH_PROJECT": "my-project",
    "CC_LANGSMITH_METADATA": "{\"author\":\"jane\",\"environment\":\"development\"}"
  }
}
```

</Tab>

<Tab title="Shell environment variable">

```bash
export CC_LANGSMITH_METADATA='{"author":"jane","environment":"development"}'
```

</Tab>

</Tabs>

元数据键和值将出现在 LangSmith 中的所有运行中，您可以使用它们来过滤和搜索跟踪。

## 使线程静音

静音会抑制跟踪中线程的输入和输出内容，而无需禁用跟踪。静音默认关闭，除非您[set a default](#set-a-default-mute-configuration)。

启用跟踪后，在 Claude Code 中运行这些插件命令。这两个命令都没有参数：

- `/langsmith-tracing:mute`：在后面的跟踪中省略该线程的输入和输出内容。
- `/langsmith-tracing:unmute`：恢复完整跟踪以供此线程中的后续回合使用。

这两个命令从下一回合开始应用，因此当前回合不变。当回合开始时，回合的模式是固定的，并且其子代理继承该模式。静音运行保持正常的嵌套、名称、时间、状态、模型和工具标识以及令牌使用。输入和输出被系统通知替换。静音模式还忽略原始错误、身份和存储库属性、自定义元数据、SDK 运行时元数据和副本元数据覆盖。静音独立于秘密编辑。

### 设置默认静音配置

要以仅元数据模式启动线程而不在每个线程中运行命令，请将 `CC_LANGSMITH_DEFAULT_MUTED` 设置为 `"true"`：

<Tabs>

<Tab title="Settings file (recommended)">

```json
{
  "env": {
    "TRACE_TO_LANGSMITH": "true",
    "CC_LANGSMITH_API_KEY": "<LangSmith API key>",
    "CC_LANGSMITH_PROJECT": "my-project",
    "CC_LANGSMITH_DEFAULT_MUTED": "true"
  }
}
```

</Tab>

<Tab title="Shell environment variable">

```bash
export CC_LANGSMITH_DEFAULT_MUTED="true"
```

</Tab>

</Tabs>

将变量设置为 `"false"` 以返回到未静音的默认值。比较不区分大小写，任何其他值都会静音，包括空字符串。

该插件还从其自己的配置文件中读取`defaultMuted`布尔值，按以下顺序：项目目录中的`.claude/langsmith.json`和`langsmith-plugins.json`，然后是`~/.claude/langsmith.json`和`~/.langsmith-plugins.json`。环境变量优先于所有四个变量。线程首选项是粘性的。该插件将每个显式静音或取消静音保存到隐私文件中，默认情况下为`~/.claude/state/langsmith_state.privacy.json`，并且保存的线程首选项在两个方向上都优于配置的默认值。删除隐私文件将删除每个线程覆盖并将每个线程返回到配置的默认值。

## 秘密编辑

该插件会编辑从运行输入、输出、错误和元数据中检测到的秘密，然后将其上传到LangSmith。默认情况下，密文处于启用状态。

上传前，编辑会在您的计算机上运行，​​因此未编辑的内容永远不会到达 LangSmith。副本目标接收相同的编辑有效负载。

检测涵盖提供商 API 密钥前缀、JSON Web 令牌和 PEM 私钥块。它还涵盖上下文形状，例如 `API_KEY=<value>`、`Authorization` 标头以及嵌入 URL 中的密码。每场比赛都替换为`[SECRET_DETECTED]`。规则列表参见[Redact secrets from traces](/langsmith/redact-secrets#rules-in-the-preset)。密文与已知的凭证形状相匹配，因此将其视为安全网而不是保证。无法识别格式的凭证仍然达到LangSmith，并且附件、运行名称和标签不会通过匿名器。编辑后的跟踪还保留了构建它所依据的提示、文件内容和工具结果，因此限制了谁可以读取跟踪项目。

修订的目标是凭证值，而不是身份。插件附加的 `anthropic_user_id` 和 `local_username` 元数据不受影响。省略内容和归属，而不是删除其中的凭据，[mute the thread](#mute-a-thread)。

### 关闭密文

将 `CC_LANGSMITH_REDACT` 设置为 `false`、`0`、`no` 或 `off`。比较不区分大小写，任何其他值都会保留密文。

```bash
export CC_LANGSMITH_REDACT="false"
```

### 编辑其他模式

将 `CC_LANGSMITH_REDACT_EXTRA` 设置为 `{ "pattern": ..., "replace": ... }` 规则的 JSON 数组。每个`pattern`都是一个正则表达式字符串，全局应用且区分大小写。 `replace` 是可选的，并回退到 `[redacted]`。

```json
{
  "env": {
    "CC_LANGSMITH_REDACT_EXTRA": "[{\"pattern\":\"ACME-[A-Z0-9]{16}\",\"replace\":\"[REDACTED_ACME_KEY]\"}]"
  }
}
```

额外规则在内置规则之后运行。该插件会跳过具有无效正则表达式的规则，记录错误，并上传应用了其余规则的回合。这两个设置也从 [Set a default mute configuration](#set-a-default-mute-configuration) 中描述的插件配置文件中读取，如 `redact` 和 `redact_extra_rules` 键：

```json
{
  "redact": true,
  "redact_extra_rules": [{ "pattern": "ACME-[A-Z0-9]{16}", "replace": "[REDACTED_ACME_KEY]" }]
}
```

环境变量优先于所有四个文件。文件的行为比环境变量更严格。具有无效正则表达式的规则会丢弃该文件中的所有设置，而不仅仅是该规则。

由于项目级别 `.claude/langsmith.json` 可以将 `redact` 设置为 `false`，因此请在不受您控制的存储库中启用跟踪之前查看该文件。

## 与 GitHub Actions 一起使用

您可以将此插件与 [⟦T65⟧](https://github.com/anthropics/claude-code-action) 一起使用来跟踪 Claude Code 在 CI 中的运行情况。将以下内容添加到您的工作流程中：

```yaml
- uses: anthropics/claude-code-action@v1
  env:
    TRACE_TO_LANGSMITH: "true"
    CC_LANGSMITH_API_KEY: ${{ secrets.LANGSMITH_API_KEY }}
    CC_LANGSMITH_PROJECT: "my-project"
    CC_LANGSMITH_METADATA: |
      {
        "pr_url": "${{ github.event.pull_request.html_url || '' }}",
        "pr_number": "${{ github.event.pull_request.number || '' }}",
        "pr_author": "${{ github.event.pull_request.user.login || '' }}",
        "repository": "${{ github.repository }}",
        "commit_sha": "${{ github.sha }}",
        "trigger": "${{ github.event_name }}"
      }
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    github_token: ${{ secrets.GITHUB_TOKEN }}
    plugin_marketplaces: |
      https://github.com/langchain-ai/langsmith-claude-code-plugins.git
    plugins: |
      langsmith-tracing@langsmith-claude-code-plugins
    prompt: |
      Your prompt here
```

确保将 `LANGSMITH_API_KEY` 和 `ANTHROPIC_API_KEY` 添加为 [repository secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)。

这使您可以将跟踪关联到 LangSmith 中的特定 PR、提交和作者。

## 在现有运行下嵌套跟踪

您还可以设置名为 `CC_LANGSMITH_PARENT_DOTTED_ORDER` 的环境变量，将所有 Claude 代码跟踪嵌套为现有 LangSmith 运行的子级。当 Claude Code 作为较大跟踪工作流程的一部分以编程方式调用时，这非常有用。

**Python**

```python
import subprocess
from langsmith import traceable, get_current_run_tree


os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = "<LangSmith API key>"
os.environ["LANGSMITH_PROJECT"] = "claude-code"

@traceable
def run_claude(prompt: str):
    run_tree = get_current_run_tree()
    subprocess.run(
        ["claude", "-p", prompt],
        env={
            **os.environ,
            "TRACE_TO_LANGSMITH": "true",
            "CC_LANGSMITH_API_KEY": "<LangSmith API key>",
            "CC_LANGSMITH_PROJECT": "claude-code",
            "CC_LANGSMITH_PARENT_DOTTED_ORDER": run_tree.dotted_order,
        },
    )
```

**打字稿**

```ts
import { traceable, getCurrentRunTree } from "langsmith/traceable";
import { execSync } from "node:child_process";

process.env.LANGSMITH_TRACING = "true";
process.env.LANGSMITH_API_KEY = "<LangSmith API key>";
process.env.LANGSMITH_PROJECT = "claude-code";

const runClaude = traceable(
  async (prompt: string) => {
    const runTree = getCurrentRunTree();
    const pluginDir = new URL(".", import.meta.url).pathname;
    const res = execSync(`claude -p "${prompt}" --plugin-dir '${pluginDir}'`, {
      env: {
        ...process.env,
        TRACE_TO_LANGSMITH: "true",
        CC_LANGSMITH_API_KEY: "<LangSmith API key>",
        CC_LANGSMITH_PROJECT: "claude-code",
        CC_LANGSMITH_PARENT_DOTTED_ORDER: runTree.dotted_order,
      },
    });
    return res.toString();
  },
  { name: "run_claude" },
);
```

生成的跟踪层次结构如下所示：

```
Your outer run (chain)
└── Claude Code Turn (chain)
    ├── Claude (llm)
    ├── Read (tool)
    └── Claude (llm)
```

## 跟踪到多个目的地（副本）您可以使用 `CC_LANGSMITH_RUNS_ENDPOINTS` 环境变量同时跟踪多个 LangSmith 项目或工作区。将 `CC_LANGSMITH_RUNS_ENDPOINTS` 设置为副本配置的 JSON 数组。这会覆盖其他客户端设置。

追踪多个 [replicas](/langsmith/log-traces-to-project) 对于以下用途很有用：

- 将跟踪发送到生产和暂存项目。
- 使用不同的 API 密钥跟踪多个工作区。
- 将额外的元数据添加到特定的副本目的地。

每个副本对象支持以下字段：

|领域|必填|描述 |
| --- | --- | --- |
| `apiUrl` |是的 | LangSmith API URL（通常为`https://api.smith.langchain.com`）|
| `apiKey` |是的 |目的地的 API 密钥 [workspace](/langsmith/administration-overview#workspaces) |
| `projectName` |是的 |目标工作区中的项目名称 |
| `updates` |没有 |用于覆盖复制运行的可选元数据/字段 |

设置`CC_LANGSMITH_RUNS_ENDPOINTS`环境变量有两种方法：

<Tabs>

<Tab title="Settings file (recommended)">

在您的本地 `.claude/settings.local.json` 或全球 `~/.claude/settings.json` 中：

```json
{
  "env": {
    "TRACE_TO_LANGSMITH": "true",
    "CC_LANGSMITH_RUNS_ENDPOINTS": "[{\"apiUrl\":\"https://api.smith.langchain.com\",\"apiKey\":\"ls__key_workspace_a\",\"projectName\":\"project-prod\"},{\"apiUrl\":\"https://api.smith.langchain.com\",\"apiKey\":\"ls__key_workspace_b\",\"projectName\":\"project-staging\",\"updates\":{\"metadata\":{\"environment\":\"staging\"}}}]"
  }
}
```

<Tip>
要生成转义的 JSON 字符串，请使用：

```bash
echo '[{"apiUrl":"...","apiKey":"...","projectName":"..."}]' | jq -cR .
```
</Tip>

</Tab>

<Tab title="Shell environment variable">

**选项 2：Shell 环境变量**

添加到您的 `~/.zshrc`、`~/.bashrc` 或 `~/.bash_profile`：

```bash
export CC_LANGSMITH_RUNS_ENDPOINTS='[{"apiUrl":"https://api.smith.langchain.com","apiKey":"ls__key_workspace_a","projectName":"project-prod"},{"apiUrl":"https://api.smith.langchain.com","apiKey":"ls__key_workspace_b","projectName":"project-staging","updates":{"metadata":{"environment":"staging"}}}]'
```

</Tab>

</Tabs>

## 故障排除

###LangSmith没有出现任何痕迹1. **检查钩子是否正在运行**：
   ```bash
   tail -f ~/.claude/state/hook.log
   ```
   您应该在每次 Claude 响应后看到日志条目。

2. **验证环境变量**：
   - 检查项目的 `.claude/settings.local.json` 中是否有 `TRACE_TO_LANGSMITH="true"`。
   - 验证您的个人访问令牌 (PAT) 是否正确（以 `lsv2_pt_` 开头）。
   - 确保LangSmith中存在项目名称。

3. **启用调试模式**以查看详细的 API 活动：
   ```json
   {
     "env": {
       "CC_LANGSMITH_DEBUG": "true"
     }
   }
   ```
   然后检查日志中的 API 调用和 HTTP 状态代码。

### 用户中断后不会出现子代理运行
仅在完成后才跟踪子代理。这意味着，如果您在子代理运行过程中中断对话轮次，则不会跟踪子代理的子运行。

### 管理日志文件大小

该钩子将所有活动记录到`~/.claude/state/hook.log`。启用调试模式后，该文件可能会变大：

```bash
# View log file size
ls -lh ~/.claude/state/hook.log

# Clear logs if needed
> ~/.claude/state/hook.log
```

## 从手动停止钩子迁移

如果您使用旧版本的 LangSmith 跟踪 Claude 代码，则需要删除 `~/.claude/hooks/stop_hook.sh` 并从之前添加的任何先前 `settings.local.json` 或 `settings.json` 文件中删除对钩子的引用，然后按照 [plugin installation instructions](#getting-started) 进行操作。

## 源代码

该插件是在 MIT 许可证下开源的，可在 [this GitHub repo](https://github.com/langchain-ai/langsmith-claude-code-plugins) 中使用。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-claude-code.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>