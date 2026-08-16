<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Plugins and marketplaces | https://docs.langchain.com/oss/deepagents/code/plugins -->

# 插件和市场

插件使用可重用的 [skills](/oss/deepagents/code/memory-and-skills)、[MCP servers](/oss/deepagents/code/mcp-tools) 和 [hooks](/oss/deepagents/code/hooks) 扩展了 Deep Agents 代码。市场提供用于跨项目或团队发现和安装插件的目录。 Deep Agents Code 支持 Claude 和 Codex 风格的插件清单和市场目录，如 [Create a plugin](#create-a-plugin) 和 [Create a marketplace](#create-a-marketplace) 中所述。

<Warning>
    仅从您信任的来源安装插件和市场。启用的插件可以添加指令并使用您的用户权限运行 MCP 服务器或挂钩命令。
</Warning>

## 交互式管理插件

要在 `dcode` 会话中浏览市场并管理插件：

1.运行`/plugins`打开插件管理器。
2. 从 **Marketplaces** 选项卡添加市场。支持的来源包括：
    - `owner/repo` 格式的 GitHub 存储库，可选后跟 `@branch-or-tag`。
    - HTTPS Git 存储库 URL，可选地后跟 `#branch-or-tag`。
    - 提供市场 JSON 文件的 HTTPS URL。
    - 本地市场目录或 JSON 文件。
3. 从市场安装插件。
4. 运行 `/reload` 激活新安装的插件技能、MCP 服务器和挂钩，而无需重新启动会话。插件管理器还允许您启用、禁用和卸载已安装的插件。禁用插件会保留其安装状态，但会在运行 `/reload` 或启动新会话后排除其技能、MCP 服务器和挂钩。

删除市场会卸载其插件并删除托管缓存数据。当市场来自本地目录或文件时，Deep Agents 代码会保留原始来源。运行 `/reload` 或启动新会话以将删除应用到活动会话。

## 自动更新插件

Deep Agents 代码可以在第一次提示后在后台更新已安装的插件。更新仅适用于通过自己的清单选择加入的已启用插件。插件作者通过将此块添加到该插件的 `plugin.json` 来选择每个插件：

```json
{
  "extensions": {
    "com.langchain.deepagents.code": {
      "autoUpdate": true
    }
  }
}
```

正在运行的会话将继续使用其当前的插件版本，直到您运行`/reload`。要全局禁用自动插件更新，请在环境中的`config.toml`或`DEEPAGENTS_CODE_PLUGIN_AUTO_UPDATE=false`中设置`[plugins].auto_update = false`。

## 从命令行管理插件

使用 `dcode plugin` 进行脚本和基于终端的管理。插件 ID 使用格式 `plugin-name@marketplace-name`。

```bash
# Add and inspect a marketplace
dcode plugin marketplace add acme/plugins
dcode plugin marketplace list

# Browse and install plugins
dcode plugin list
dcode plugin install code-review@acme-tools

# Change plugin state
dcode plugin disable code-review@acme-tools
dcode plugin enable code-review@acme-tools

# Remove a plugin or marketplace
dcode plugin uninstall code-review@acme-tools
dcode plugin marketplace remove acme-tools
```

`plugin list` 和 `plugin marketplace list` 接受 `--json`。安装插件后，在活动的交互式会话中运行 `/reload` 或启动新会话。## 使用插件技能、MCP 服务器和挂钩

插件技能采用命名空间，以防止与项目、用户和其他插件技能发生冲突。使用插件 ID 和技能路径调用技能：

```text
/skill:plugin-name@marketplace-name:skill-name optional arguments
```

在交互模式下，自动完成还匹配较短的 `/plugin-name:skill-name` 形式，并将其扩展为规范的 `/skill:` 命令。嵌套技能目录将每个目录添加到命名空间。例如，`skills/review/security/SKILL.md`从`quality@acme-tools`变为`/skill:quality@acme-tools:review:security`。

启用的插件还可以贡献 MCP 服务器。 Deep Agents 当插件加载时，代码会将这些服务器与常规 MCP 配置合并。使用 `/mcp` 检查可用的服务器和工具。

插件挂钩使用与用户和项目挂钩相同的生命周期事件和处理程序格式。插件管理器列出了每个插件声明的事件。启用插件是其挂钩的唯一同意门：工作区信任适用于项目挂钩，而不是插件挂钩。

## 创建一个插件

Deep Agents 代码插件是包含任何受支持组件的目录：

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── review/
│       └── SKILL.md
├── hooks/
│   └── hooks.json
└── .mcp.json
```

Deep Agents 代码还可以识别`.codex-plugin/plugin.json`。当组件使用其默认位置时，清单是可选的。如果插件仅包含一项技能，您可以将`SKILL.md`放置在插件根目录中，而不是创建`skills/`。### 定义插件清单

如果存在，`.claude-plugin/plugin.json` 或`.codex-plugin/plugin.json` 必须包含`name`。您还可以声明版本和自定义组件路径：

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "skills": "./skills",
  "mcpServers": "./.mcp.json",
  "hooks": "./hooks/hooks.json"
}
```

`skills`、`mcpServers` 和 `hooks` 字段接受路径字符串或路径数组。 `mcpServers` 和 `hooks` 还可以包含内联配置对象。每个组件路径必须以`./`开头，保留在插件根目录内，并且不包含`..`。

当没有声明自定义路径时，Deep Agents代码发现：

- `skills/`下的技能，或当不存在`skills/`目录时根`SKILL.md`的技能。
- MCP 服务器位于根 `.mcp.json` 文件中。
- `hooks/hooks.json` 中的挂钩。

### 添加技能

将每个技能组织为包含`SKILL.md`的目录：

```text
skills/
└── review/
    ├── SKILL.md
    └── checklist.md
```

使用与独立Deep Agents代码技能相同的技能格式。安装的插件名称成为技能命名空间。欲了解更多信息，请参阅[Memory and skills](/oss/deepagents/code/memory-and-skills#skills)。

### 添加 MCP 服务器

将标准 MCP 服务器定义放在 `.mcp.json` 中，或在插件清单中将它们声明为与 `mcpServers` 内联。 MCP 服务器和挂钩命令支持这些路径变量：

- `${CLAUDE_PLUGIN_ROOT}`或`${PLUGIN_ROOT}`：安装的插件目录。
- `${CLAUDE_PLUGIN_DATA}` 或 `${PLUGIN_DATA}`：插件的可写数据目录。
- `${CLAUDE_PROJECT_DIR}`：活动项目目录。

例如：

```json
{
  "mcpServers": {
    "review-tools": {
      "command": "python",
      "args": ["${CLAUDE_PLUGIN_ROOT}/server.py"],
      "env": {
        "CACHE_DIR": "${CLAUDE_PLUGIN_DATA}"
      }
    }
  }
}
```有关支持的 MCP 传输和字段，请参阅[MCP tools](/oss/deepagents/code/mcp-tools)。

### 添加钩子

将钩子文档放置在 `hooks/hooks.json` 处，声明相对的 `hooks` 路径，或者在插件清单中内联定义钩子。 Hook 命令接收上面的路径变量。配置和事件参考参见[Hooks](/oss/deepagents/code/hooks)。

## 创建一个市场

市场是一个带有名称和 `plugins` 数组的 JSON 目录。将其存储在市场根目录中的以下路径之一：

- `.claude-plugin/marketplace.json`
- `.agents/plugins/marketplace.json`
- `.agents/plugins/api_marketplace.json`

以下市场包含一个存储在同一存储库中的插件：

```json
{
  "name": "acme-tools",
  "plugins": [
    {
      "name": "code-review",
      "source": "./plugins/code-review",
      "description": "Review code for correctness and maintainability"
    }
  ]
}
```

每个插件条目都需要一个`name`和`source`。它还可以包括 `description` 和 `author`。本地源路径必须以 `./` 开头，并位于市场根目录内。当所有本地插件共享不同的基目录时，设置`metadata.pluginRoot`。

市场条目还可以使用外部 Git 源：

```json
{
  "name": "acme-tools",
  "plugins": [
    {
      "name": "code-review",
      "source": {
        "source": "github",
        "repo": "acme/code-review-plugin",
        "ref": "v1.0.0"
      }
    },
    {
      "name": "release-tools",
      "source": {
        "source": "git-subdir",
        "url": "https://github.com/acme/developer-tools.git",
        "path": "./plugins/release-tools",
        "ref": "main"
      }
    }
  ]
}
```

支持的外部插件源类型为 `github`、`url` 和 `git-subdir`。远程 URL 必须使用 HTTPS。作为直接 JSON URL 添加的市场无法包含本地相关插件源，因为仅下载目录文件。当目录引用同一源树中的插件目录时，使用 Git 存储库或本地目录。通过添加目录、安装插件、启动新会话或运行 `/reload` 来测试本地市场：

```bash
dcode plugin marketplace add ./my-marketplace
dcode plugin install code-review@acme-tools
```

## 另请参阅

- [Memory and skills](/oss/deepagents/code/memory-and-skills)
- [MCP tools](/oss/deepagents/code/mcp-tools)
- [Hooks](/oss/deepagents/code/hooks)
- [Command reference](/oss/deepagents/code/cli-reference)
- [Configuration](/oss/deepagents/code/configuration)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/plugins.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>