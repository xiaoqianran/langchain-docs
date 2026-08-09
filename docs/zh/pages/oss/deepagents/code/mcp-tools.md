<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: MCP tools | https://docs.langchain.com/oss/deepagents/code/mcp-tools -->

#MCP 工具

从 MCP（模型上下文协议）服务器加载其他工具

[MCP (Model Context Protocol)](https://modelcontextprotocol.io/) 允许您使用来自外部服务器的工具（文件系统、API、数据库等）扩展 Deep Agents 代码，而无需修改代理本身。 Deep Agents Code 在启动时连接到 MCP 服务器，发现其工具，并使它们与内置工具一起可供代理使用。

通过将 `.mcp.json` 配置文件添加到您的项目以在项目级别范围内添加 MCP 服务器，或在用户级别添加 MCP 服务器以应用于所有项目。

## 快速入门

本快速入门将 LangChain MCP 服务器添加到计算机上的每个 Deep Agents Code 会话中。我们建议添加 `docs-langchain` 作为概念指南和操作方法，并添加 `reference-langchain` 作为 API 参考。

|服务器|网址 |它涵盖什么 |
| -------------------- | -------------------------------------------------- | -------------------------------------------------------------------- |
| `docs-langchain` | `https://docs.langchain.com/mcp` |概念指南、操作方法和教程 |
| `reference-langchain` | `https://reference.langchain.com/mcp` |规范 API 参考：类、方法和参数 |<Steps>
  <Step title="Create the config file" icon="file">
    如果尚不存在，请在用户级别创建 `.mcp.json` 文件，以使服务器可用于计算机上的每个项目或项目级别。

    <Tabs>
      <Tab title="User">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        mkdir -p ~/.deepagents
        touch ~/.deepagents/.mcp.json
        ```

        此文件 (`~/.deepagents/.mcp.json`) 中的服务器在该计算机上的每个项目中都可用。
      </Tab>

      <Tab title="Project">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        touch .mcp.json
        ```

        此文件 (`<project>/.mcp.json`) 中的服务器可供该项目使用。
      </Tab>

      <Tab title="Project (hidden)">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        mkdir -p .deepagents
        touch .deepagents/.mcp.json
        ```

        此文件 (`<project>/.deepagents/.mcp.json`) 中的服务器可供该项目使用，但不位于存储库根目录中。
      </Tab>
    </Tabs>

    有关完整的优先级规则，请参阅[Discovery locations](#discovery-locations)。
  </Step>

  <Step title="Add the MCP servers" icon="plug">
    ```json title="~/.deepagents/.mcp.json" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
        "mcpServers": {
            "docs-langchain": {
                "type": "http",
                "url": "https://docs.langchain.com/mcp"
            },
            "reference-langchain": {
                "type": "http",
                "url": "https://reference.langchain.com/mcp"
            }
        }
    }
    ```

    要添加更多服务器，请向 `mcpServers` 添加更多条目。有关 OAuth、stdio、SSE 和 HTTP 服务器字段、环境变量和标头，请参阅 [Configuration format](#configuration-format)。
  </Step>

  <Step title="Launch Deep Agents Code" icon="terminal">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    dcode
    ```

    启动时，Deep Agents Code 会自动发现配置、连接到每个服务器、发现其工具并打印确认信息：

    ```
    ✓ Loaded 3 MCP tools
    ```

    在交互式会话中运行 `/mcp` 以查看每个服务器的状态、传输和加载的工具列表。代理现在可以在会话期间使用这些工具 — stdio 服务器在工具调用之间保持活动状态。
  </Step>
</Steps>## 自动发现

Deep Agents Code 自动在标准位置搜索 `.mcp.json` 文件。不需要任何标志——只需放置一个配置文件，它就会被拾取。

### 发现地点

按以下顺序检查配置（优先级从低到高）：

|优先|地点 |范围 |
| ----------- | --------------------------------- | ------------------------------------------- |
| 1（最低）| `~/.deepagents/.mcp.json` |用户级—适用于所有项目|
| 2 | `<project>/.deepagents/.mcp.json` |项目级—`.deepagents`子目录 |
| 3（最高）| `<project>/.mcp.json` |项目级—root（兼容 Claude 代码）|

项目根目录是包含 `.git` 文件夹的最近父目录，回退到当前工作目录。当存在多个配置文件时，它们的 `mcpServers` 条目将按服务器名称合并。保留不同名称的服务器。如果相同的服务器名称出现在多个文件中，则优先级较高的定义将替换整个较早的服务器对象；嵌套字段没有深度合并。这允许项目级配置覆盖用户级条目（例如，固定同一服务器的不同版本），而不会干扰您的其他项目。

### 旗帜

|旗帜|行为 |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `--mcp-config PATH` |添加显式配置作为最高优先级源（合并在自动发现的配置之上）|
| `--no-mcp` |完全禁用 MCP — 不加载任何服务器 |

<Note>
  `--mcp-config` 和 `--no-mcp` 是互斥的。
</Note>

### 克劳德代码兼容性

如果您的项目根目录中已经有 Claude Code 的 `.mcp.json`，Deep Agents Code 会自动选取它，无需额外设置。

## 配置格式`mcpServers`下的每个键都是一个服务器名称。服务器的字段决定 Deep Agents Code 如何连接到它。

### stdio 服务器（默认）

stdio 服务器作为子进程生成。深度代理代码通过标准输入/标准输出与它们进行通信。

```json title="mcp-config.json" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "your-token" }
    }
  }
}
```

### SSE 和 HTTP 服务器

对于远程 MCP 服务器，将 `type` 设置为 `"sse"` 或 `"http"` 并提供 `url`：

```json title="mcp-config.json" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "mcpServers": {
    "remote-api": {
      "type": "sse",
      "url": "https://api.example.com/mcp",
      "headers": { "Authorization": "Bearer your-token" }
    }
  }
}
```

### 字段参考

<AccordionGroup>
  <Accordion title="stdio (default)">
    **必需：** `command`。 **可选：** `args`、`env`，加上共享的[tool-filter fields](#tool-filtering)。

    <ResponseField name="command" type="string">
      要运行的可执行文件。
    </ResponseField>

    <ResponseField name="args" type="string[]">
      传递给命令的参数。
    </ResponseField>

    <ResponseField name="env" type="object">
      为子进程设置的环境变量。使用它来传递 API 密钥和其他凭据，而不会将它们暴露在 shell 历史记录中。
    </ResponseField>
  </Accordion>

  <Accordion title="sse">
    **必填：** `type: "sse"`、`url`。 **可选：** `headers`、`auth`，加上共享的[tool-filter fields](#tool-filtering)。

    <ResponseField name="type" type="&#x22;sse&#x22;">
      运输类型。使用 `"sse"` 来处理服务器发送的事件。
    </ResponseField>

    <ResponseField name="url" type="string">
      服务器端点 URL。
    </ResponseField>

    <ResponseField name="headers" type="object">
      随每个请求发送的 HTTP 标头。常用于身份验证。值支持对父 shell 环境变量的 `${VAR}` 引用（在服务器激活时解析）。
    </ResponseField><ResponseField name="auth" type="&#x22;oauth&#x22;">
      设置为 `"oauth"` 以使用 `dcode mcp login` 驱动 OAuth 登录流程，而不是提供 `Authorization` 标头。不能与 `Authorization` 标头组合。参见[OAuth login](#oauth-login)。
    </ResponseField>
  </Accordion>

  <Accordion title="http">
    **必填：** `type: "http"`、`url`。 **可选：** `headers`、`auth`，加上共享的[tool-filter fields](#tool-filtering)。

    <ResponseField name="type" type="&#x22;http&#x22;">
      运输类型。使用 `"http"` 进行流式 HTTP。 `streamable_http` 和 `streamable-http` 被接受为别名。
    </ResponseField>

    <ResponseField name="url" type="string">
      服务器端点 URL。
    </ResponseField>

    <ResponseField name="headers" type="object">
      随每个请求发送的 HTTP 标头。常用于身份验证。值支持 `${VAR}` 对父 shell 环境变量的引用（在服务器激活时解析）。
    </ResponseField>

    <ResponseField name="auth" type="&#x22;oauth&#x22;">
      设置为 `"oauth"` 以使用 `dcode mcp login` 驱动 OAuth 登录流程，而不是提供 `Authorization` 标头。不能与 `Authorization` 标头组合。参见[OAuth login](#oauth-login)。
    </ResponseField>
  </Accordion>
</AccordionGroup>

<Note>
  为了与其他 MCP 客户端兼容，`type` 字段也可以写为 `transport`。
</Note>

<Note>
  服务器名称必须匹配 `[A-Za-z0-9_-]+`。名称用作 OAuth 令牌文件的磁盘基本名称，因此路径分隔符和其他 shell 元字符在配置加载时被拒绝。
</Note>

### 标头环境变量标头值支持从父 shell 进行 `${VAR}` 替换，在服务器激活时解析，而不是在配置加载时解析。一个未设置的变量只会使需要它的服务器失败；其余的仍然出现。

```json title=".mcp.json" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
    "mcpServers": {
        "internal-api": {
            "type": "http",
            "url": "https://api.example.com/mcp",
            "headers": { "Authorization": "Bearer ${INTERNAL_API_TOKEN}" }
        }
    }
}
```

## 多个服务器

您可以根据需要配置任意数量的服务器。来自所有服务器的工具被合并并可供代理使用：

```json title="mcp-config.json" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "ghp_..." }
    },
    "database": {
      "type": "sse",
      "url": "https://db-mcp.internal:8080/mcp",
      "headers": { "Authorization": "Bearer ..." }
    }
  }
}
```

## 工具过滤

每个服务器可以通过两个可选字段之一缩小它向代理公开的工具：

* `allowedTools`：仅保留列出的工具；放下其他一切。
* `disabledTools`：删除列出的工具；保留其他一切。

过滤同样适用于 stdio、HTTP 和 SSE 服务器。以下两项在配置加载时都会被拒绝：

* 在同一服务器上设置`allowedTools`和`disabledTools`。
* 将任一字段设置为空列表（将默默地删除每个工具，或者成为无操作）。而是省略该字段。

```json title=".mcp.json" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      "allowedTools": ["read_file", "list_directory"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "disabledTools": ["delete_repository", "delete_*_branch"]
    }
  }
}
```

### 比赛规则

每个条目都是一个文字工具名称或一个 [⟦T83⟧](https://docs.python.org/3/library/fnmatch.html) 样式的 glob（任何包含 `*`、`?` 或 `[` 的条目都被视为模式）。条目与裸 MCP 工具名称和服务器前缀形式 (`{server}_{tool}`) 相匹配，因此任一形式都有效：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "allowedTools": ["read_file", "fs_list_*"]
}
```<Note>
  与未加载工具匹配的条目将被记录为警告，而不是错误 - 底层 MCP 服务器可以跨版本改进其工具列表，而不会破坏您的配置。
</Note>

<ResponseField name="allowedTools" type="string[]">
  要保留的工具名称或`fnmatch` glob 模式。该服务器上的所有其他工具都将被删除。与`disabledTools`互斥。
</ResponseField>

<ResponseField name="disabledTools" type="string[]">
  要删除的工具名称或`fnmatch` glob 模式。该服务器上的所有其他工具都将保留。与`allowedTools`互斥。
</ResponseField>

### 自动模式下只读工具注释

MCP 服务器在宣传工具时可以附加标准`ToolAnnotations`。仅当满足以下所有条件时，深度代理代码才允许工具绕过[Auto approval mode](/oss/deepagents/code/approval-modes)中的分类器审查：

* `readOnlyHint` 是字面布尔值 `true`。
* `destructiveHint` 缺失、`null` 或 `false`。
* 每个提供的标准提示（`readOnlyHint`、`destructiveHint`、`idempotentHint`、`openWorldHint`）都是布尔值或`null`，而不是字符串或其他类型。

未通过此检查的工具在“自动”中输入分类器批次，在“手动”中使用正常审批 UI，并在无头运行时中被拒绝，因为没有可用的审批 UI。该注释是服务器提供的断言，Deep Agents Code 不会独立验证。

## OAuth 登录对于需要 OAuth 的远程 MCP 服务器（Slack、GitHub、Notion、Linear 和其他托管 MCP 端点），请在服务器条目上设置 `"auth": "oauth"` 并运行一次登录子命令。令牌持久保存到磁盘并自动刷新。

### 配置服务器

```json title=".mcp.json" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
    "mcpServers": {
        "linear": {
            "type": "http",
            "url": "https://mcp.linear.app/mcp",
            "auth": "oauth"
        }
    }
}
```

`auth: "oauth"` 与同一条目上的 `Authorization` 标头互斥，并且不能在 stdio 服务器上设置。

要将 Deep Agents Code 连接到 LangSmith，请使用 [LangSmith Remote MCP](/langsmith/langsmith-remote-mcp)：

```json title=".mcp.json" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
    "mcpServers": {
        "langsmith": {
            "url": "https://api.smith.langchain.com/mcp",
            "transport": "http",
            "auth": "oauth"
        }
    }
}
```

### 运行登录流程

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode mcp login linear
```

发生的情况取决于服务器的主机：

* **符合规范的服务器**（默认）：Deep Agents Code 执行动态客户端注册，在浏览器中打开授权代码 + PKCE 流程，并要求您将重定向的 URL 粘贴回终端。
* **Slack** (`slack.com`、`*.slack.com`)：相同的回贴流程，但预置了 Slack 的公共客户端。系统会提示您输入可选的团队 ID（例如 `T01234567`），以便应用程序安装到正确的工作区中。
* **GitHub** (`api.githubcopilot.com`)：RFC 8628 设备授权。 Deep Agents Code 打印验证 URL 和用户代码；您在浏览器中输入代码，Deep Agents 代码会轮询是否完成。默认情况下，`dcode mcp login` 读取 Deep Agents Code 在运行时使用的相同自动发现配置（受项目级信任门控影响）。通过 `--mcp-config <path>` 使用特定文件：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode mcp login linear --mcp-config ./mcp-config.json
```

<Warning>
  在`mcp login`期间，将跳过不受信任的项目级配置（请参阅[Project-level trust](#project-level-trust)），以防止攻击者控制的`headers`条目通过`${VAR}`插值窃取本地机密。在项目中运行`dcode`并选择`Allow for this project — until changed`保存批准，或显式传递`--mcp-config <path>`。
</Warning>

### 令牌存储

令牌被写入：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
~/.deepagents/.state/mcp-tokens/<server>-<sha256-16(url)>.json
```

`<sha256-16(url)>` 段是服务器 URL 的 SHA-256 的前 16 个十六进制字符。该目录被锁定为模式`0700`，每个令牌文件都是模式`0600`。文件包括 OAuth 访问令牌、刷新令牌和动态注册的客户端信息，所有这些都位于以原子方式写入的模式版本控制负载中（写入临时 + `rename`）。

<Note>
  将 URL 散列到文件名中意味着指向不同 URL（例如，dev 与 prod）的相同服务器名称将获得独立的令牌文件，并且不能相互干扰。
</Note>

### 重新验证当刷新在运行时失败（刷新令牌已过期或被撤销）时，深度代理代码会将服务器标记为`unauthenticated`，而不是使代理崩溃。欢迎横幅显示未经身份验证的服务器的数量，`/mcp` 报告每台服务器的原因。重新运行 `dcode mcp login <server>` 以刷新凭据 — 您的对话将继续，无需重新启动。

## 服务器状态

每个配置的服务器在启动后都会处于三种状态之一：

|状态 |意义|
| ----------------- | ------------------------------------------------------------------------------------------ |
| `ok` |已连接；工具已加载并可供代理使用 |
| `unauthenticated` |需要 OAuth 登录或刷新失败 — 运行 `dcode mcp login <server>` |
| `error` |飞行前、发现或传输设置失败；附有错误消息 |单个失败的服务器不再中止启动。代理与任何正常运行的服务器一起运行，欢迎横幅会在工具计数旁边显示未经身份验证和错误服务器的计数。在交互式会话中打开`/mcp`，查看每个服务器的状态、传输、工具列表以及非`ok`条目的失败原因。服务器连接时查看器实时更新并支持`tab`/`shift+tab` 导航。

## 项目级信任

项目级配置可以包含执行本地命令的 stdio 服务器和远程服务器，其 `headers` 可以从您的环境中插入 `${VAR}`。为了防止不受信任的存储库在 CLI 启动时运行任意代码或窃取本地机密，Deep Agents Code 对项目级条目强制执行“默认拒绝”策略。

<Note>
  保存的项目 MCP 批准和每服务器允许和拒绝策略需要 `deepagents-code>=0.1.40`。
</Note>

### 它是如何工作的* **交互模式：** Deep Agents 代码在激活项目服务器之前提示批准，显示每个 stdio 命令和远程 URL。选择`Allow once`激活当前会话的每个提示服务器。选择 `Allow for this project — until changed` 激活会话的每个提示服务器，并选择为将来的会话保存哪些批准。
* **保存的批准：** Deep Agents Code 将选定的服务器批准写入用户级别`~/.deepagents/config.toml`。每个批准的范围仅限于已解析的项目根、服务器名称以及该服务器定义的 SHA-256 指纹。如果服务器命令、URL、标头或其他配置字段发生更改，Deep Agents Code 会再次提示。
* **非交互模式（`-n`）：** 没有匹配的已保存或环境批准的项目服务器将被静默跳过，除非通过`--trust-project-mcp`。明确否认仍然适用。
* **信任涵盖 stdio 和远程条目：** 远程服务器可以在飞行前探测期间通过 SSRF 进入本地主机或云元数据端点，并通过标头渗漏 `${VAR}` 值，因此 Deep Agents Code 以与 stdio 服务器相同的方式对它们进行门控。
* **用户级配置** (`~/.deepagents/.mcp.json`) 始终受信任，遵循与 `config.toml` 和 `hooks.json` 相同的信任模型。* **`dcode mcp login`** 还尊重项目信任：在登录发现期间会跳过不受信任的项目级配置，因此攻击者控制的远程条目无法将机密提取到 OAuth 握手中。

### 旗帜

|旗帜|行为 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `--trust-project-mcp` |信任项目级服务器，而不提示当前运行。被用户策略拒绝的服务器仍处于禁用状态。 |

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Skip the approval prompt
dcode --trust-project-mcp

# Non-interactive: explicitly trust project servers
dcode -n "run tests" --trust-project-mcp
```

### 已保存批准

保存的批准存储在`~/.deepagents/config.toml`中：

```toml title="~/.deepagents/config.toml" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[mcp]
enabled_project_server_approvals = [
  { project_root = "/Users/you/myproject", name = "docs-langchain", fingerprint = "sha256:abc123..." }
]
```

要撤销批准，请从`enabled_project_server_approvals` 中删除其条目。要强制重新批准而不编辑`config.toml`，请更改项目的`.mcp.json`中的服务器定义；保存的指纹不再匹配。

旧平面 `[mcp].enabled_project_servers` 列表在 `config.toml` 中被忽略。使用 `enabled_project_server_approvals` 保存批准。

### 高级允许和拒绝策略

在 `~/.deepagents/config.toml` 中使用 `[mcp].disabled_project_servers`，或在 shell 中使用 `DEEPAGENTS_CODE_DISABLED_PROJECT_MCP_SERVERS` 或全局 `~/.deepagents/.env`，始终按名称拒绝项目 MCP 服务器。拒绝赢得已保存的批准和`--trust-project-mcp`标志。对于必须按名称预先批准项目 MCP 服务器的自动化，请将 shell 中的 `DEEPAGENTS_CODE_DANGEROUSLY_ENABLE_PROJECT_MCP_SERVERS` 或全局 `~/.deepagents/.env` 设置为以逗号分隔的服务器名称列表。这是一个进程范围的逃生口：同一服务器名称下的不同项目、命令更改或 URL 更改仍然匹配。设置此变量后，Deep Agents Code 将忽略该流程的已保存批准。首选已保存的批准或`--trust-project-mcp`，除非您需要跨项目和服务器定义更改进行基于名称的批准。

`deepagents-code>=0.1.40` 忽略前一个 `DEEPAGENTS_CODE_ENABLED_PROJECT_MCP_SERVERS` 变量。如果您需要相同的基于名称的行为，请将其替换为 `DEEPAGENTS_CODE_DANGEROUSLY_ENABLE_PROJECT_MCP_SERVERS`。

<Warning>
  受信任的 stdio MCP 服务器以您的用户帐户的权限运行。批准远程服务器允许 Deep Agents Code 在飞行前联系其 URL 并发送其配置的标头。仅批准来自您信任的存储库的服务器，并查看批准提示中显示的命令和 URL。
</Warning>

## 系统提示感知

连接的 MCP 服务器及其工具会自动列在代理的系统提示符中，并按服务器名称和传输类型进行分组。这有助于模型推理工具来源和故障域，而无需手动上下文。## 故障排除

<AccordionGroup>
  <Accordion title="Server fails to start (stdio)">
    验证该命令在 Deep Agents 代码之外是否有效：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npx -y @modelcontextprotocol/server-filesystem /tmp
    ```

    常见原因：未安装软件包，`npx`不在`PATH`上，或者缺少所需的环境变量。
  </Accordion>

  <Accordion title="Connection refused (SSE/HTTP)">
    检查远程服务器是否正在运行并且 URL 是否正确。如果服务器需要身份验证，请确保 `headers` 包含正确的凭据。
  </Accordion>

  <Accordion title="Tools not appearing">
    Deep Agents Code 打印启动时加载的工具数量（例如，`✓ Loaded 3 MCP tools`）。如果您看到`0`，则服务器已成功启动，但没有公布任何工具 - 检查服务器自己的日志或文档。
  </Accordion>

  <Accordion title="Server shows ⟦T170⟧ in /mcp">
    您尚未运行 `dcode mcp login <server>`，或者持久刷新令牌已过期或在服务器端被撤销。再次运行登录命令 - 您的会话继续运行，一旦刷新令牌，服务器将重新连接。
  </Accordion><Accordion title="⟦T172⟧">
    飞行前验证被拒绝 `--mcp-config`（或自动发现的 `.mcp.json`）。常见原因：不支持的服务器名称（必须匹配 `[A-Za-z0-9_-]+`）、stdio 服务器上的 `auth: oauth`、在同一条目上设置的 `command` 和 `url`，或者不是字符串的标头值。修复突出显示的原因并重新启动 - Deep Agents Code 不再转储配置错误的多页子进程跟踪。
  </Accordion>

  <Accordion title="⟦T179⟧ header references fail">
    标头插值在激活时运行，因此未设置的变量只会使需要它的服务器失败。导出父 shell 中的变量或将其添加到 `~/.deepagents/.env`。要调试，请设置 `DEEPAGENTS_CODE_DEBUG=1` 并检查关闭时打印到 stderr 的每个会话日志路径。
  </Accordion>
</AccordionGroup>

## 进一步阅读

* [LangSmith Remote MCP](/langsmith/langsmith-remote-mcp)：通过 OAuth 将 Deep Agents 代码连接到 LangSmith 工具
* [LangChain MCP guide](/oss/python/langchain/mcp)：协议详细信息、构建自定义服务器以及以编程方式使用 `langchain-mcp-adapters`
* [MCP specification](https://modelcontextprotocol.io/)：官方协议规范和服务器注册表

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/mcp-tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>