<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Coding-agent integrations | https://docs.langchain.com/oss/openwiki/integrations -->

# 编码代理集成

使用主机模型和工具在 Codex、Claude Code、GitHub Copilot、OpenCode、Cursor、IBM Bob、Kiro、Oh My Pi 或 Antigravity 中运行 OpenWiki

OpenWiki 可以在现有的编码代理内运行，而不是启动自己的模型。编码代理调查存储库，规划 wiki，并使用其本机存储库工具编写每个分配的页面。 OpenWiki 拥有持久的页面作业生命周期、声明验证和持久性、源漂移处理和确定性最终确定。

主机驱动的运行仅支持存储库[code mode](/oss/openwiki/code-mode) wiki，而不支持[personal mode](/oss/openwiki/personal-mode)。它们使用编码代理的经过身份验证的模型会话，因此不需要 OpenWiki 提供者凭据。此路径尚不支持来自连接器的上下文，包括 LangSmith。主机驱动的页面创作是连续的； [parallel page workers](/oss/openwiki/code-mode#parallel-page-workers) 仅适用于本机 CLI。

## 安装集成

支持的主机包括 **Codex**、**Claude Code**、**GitHub Copilot**、**OpenCode**、**Cursor**、**IBM Bob** (Bob Shell)、**Kiro**、**Oh My Pi** (`omp`) 和 **Antigravity CLI**。安装默认为用户级别，因此可以从任何 Git 存储库进行一次安装：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openwiki integrations install codex
openwiki integrations install claude
openwiki integrations install copilot
openwiki integrations install opencode
openwiki integrations install cursor
openwiki integrations install bob
openwiki integrations install kiro
openwiki integrations install omp
openwiki integrations install antigravity
```安装后重新启动编码代理。然后打开存储库并询问：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Initialize this repository's OpenWiki from the current source and tests.
```

对于现有的 wiki，请询问：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Update this repository's OpenWiki for changes since its last successful run.
```

安装的集成还公开了 [search and read tools](/oss/openwiki/search-and-link)，因此主机可以查询现有的 wiki，而无需启动生成运行。

### 检查或卸载

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openwiki integrations list
openwiki integrations uninstall <codex|claude|copilot|opencode|cursor|bob|kiro|omp|antigravity>
```

将 `--project [path]` 添加到 `list`、`install` 或 `uninstall` 以获取存储库范围内的状态。项目路径解析为 Git 存储库根目录。

主机特定的用户级别位置：

* **开放代码**：`~/.config/opencode`
* **IBM Bob / Bob Shell**：`~/.agents/skills` 和 `~/.bob/settings/mcp.json`（项目范围使用 `.agents/skills` 和 `.bob/mcp.json`）
* **Kiro**：`~/.kiro/skills` 和 `~/.kiro/settings/mcp.json`
* **Oh My Pi**：`~/.omp/agent` 用于默认配置文件。将 `--project` 用于命名配置文件或重新定位的 `PI_CODING_AGENT_DIR`
* **反重力 CLI**：`~/.gemini/antigravity-cli/skills` 和 `~/.gemini/config/mcp_config.json`

## Pi 包

Pi 从 npm 包加载 OpenWiki 的技能、检索和生命周期工具：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pi install npm:openwiki
```

使用 `pi install --local npm:openwiki` 进行项目本地安装。 Pi 扩展通过 Node 启动 OpenWiki 的 CLI，因此 `openwiki` 不需要位于 `PATH` 上。 Pi 不是`openwiki integrations install` 的目标。

## 主机驱动的运行如何工作主机驱动的运行遵循与本机`openwiki --init`和`openwiki --update`相同的可恢复页面作业生命周期。编码代理驱动存储库研究和页面创作； OpenWiki 验证每个完成情况，持久化[Grounded Claims](/oss/openwiki/code-mode#grounded-claims)，并通过 MCP 最终确定元数据。

在每个页面上，主持人提交稀疏的索赔决策（确认、修改、添加或撤回）。 OpenWiki 保留未受影响的声明，应用明确的决策，并在最终声明状态持久之前拒绝完成。当主机需要当前页面的完整声明集时，可以调用`openwiki_inspect_page_claims`。

### openwiki_begin 中的结果上限

> [!注意]
>
> 结果上限需要 OpenWiki v0.8.0 或更高版本。

具有许多已更改文件或声明问题的存储库可能会产生大量 `openwiki_begin` 响应。为了将响应保持在传输限制内，OpenWiki 限制返回的列表并包含准确的总数，以便主机可以恢复遗漏的数据。

响应包括以下上限字段：* **`changedPathCount`** (`number`)：自上次运行以来更改的存储库路径的确切数量。
* **`changedPathsTruncated`** (`boolean`): `changedPaths`是否忽略超过200条路径限制的条目。每个`pageUpdateWindows`条目还带有自己的`changedPathCount`和`changedPathsTruncated`。每个窗口的路径列表在窗口之间均匀地共享该预算。
* **`claimIssueCount`** (`number`)：索赔预检问题的确切数量。
* **`claimIssuesTruncated`** (`boolean`)：`claimIssues`是否省略超过 50 期限制的条目。
* **`claimIssuePages`** (`string[]`)：有索赔问题的每个页面，包括在 `claimIssues` 中省略了个别问题的页面。

当 `changedPathsTruncated` 标志为 `true` 时，从 Git 恢复完整列表。每个`pageUpdateWindows`条目都带有自己的基线`baseGitHead`。对于每个具有 `baseGitHead` 的窗口（不是 `fullReview` 窗口），列出自该基线以来提交的更改：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git diff --name-only <baseGitHead>..HEAD
```

对于每个窗口，添加对跟踪文件和未跟踪文件的未提交更改：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git diff --name-only HEAD
git ls-files --others --exclude-standard
```

从结果中排除 `openwiki/` 和 `.openwikiignore` 路径。

规划和页面作业在内部读取完整的运行状态，因此上限不会影响正确性。仅当主机需要向用户呈现完整列表或在调用`openwiki_submit_plan`之前做出自己的路由决策时，才会使用截断字段。

### 推迟计划外的索赔问题> [!注意]
>
> `deferUnplannedClaimIssues` 需要 OpenWiki v0.9.0 或更高版本。

默认情况下，`update` 运行上的 `openwiki_submit_plan` 会自动为具有陈旧或未解决声明的每个现有页面添加页面作业，即使主机未将这些页面包含在其计划中也是如此。要运行仅涉及主机明确计划的页面的集中更新，请在 `openwiki_submit_plan` 输入中将 `deferUnplannedClaimIssues` 设置为 `true`：

* **`deferUnplannedClaimIssues`**（可选`boolean`，默认`false`）：当`true`时，OpenWiki 会跳过为存在声明问题的计划外页面插入自动作业。这些页面被记录为延迟页面，并且运行以中断状态完成，直到将来的完整更新使它们协调一致。
  当`true`时，OpenWiki 会跳过为存在声明问题的计划外页面插入自动作业。这些页面保持不变，运行完成，但将其更新元数据记录为中断，直到将来的完整更新协调它们。
  此选项仅在 `update` 运行中有效。在 `init` 运行中设置它会返回 `invalid_input` 错误。

## 另请参阅

* [Search and link wikis](/oss/openwiki/search-and-link)
* [Code mode](/oss/openwiki/code-mode)
* [CLI reference](/oss/openwiki/cli-reference)
* [Quickstart](/oss/openwiki/quickstart)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/integrations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。