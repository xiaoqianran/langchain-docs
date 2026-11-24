<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith skills | https://docs.langchain.com/langsmith/skills -->

#LangSmith技能

安装 LangChain 技能，以便您的编码代理可以跟踪、评估和监控 LangSmith 中的代理。

代理技能是可重用的按需功能，可为编码代理捆绑指令。 [⟦T9⟧](https://github.com/langchain-ai/langchain-skills) 插件包含使用 LangSmith 的技能：添加跟踪、构建数据集和评估器、运行实验以及监控生产中的代理。同一插件还涵盖具有 LangChain、LangGraph 和 Deep Agents 的构建代理。要直接从终端处理LangSmith数据，请使用[LangSmith CLI](/langsmith/langsmith-cli)。

技能集在版本之间会发生变化。对于当前列表，请浏览 [⟦T10⟧ directory](https://github.com/langchain-ai/langchain-skills/tree/main/skills) 或列出您代理中的技能。

> [!注意]
>
> LangSmith 技能已从已弃用的 `langsmith-skills` 存储库移至 `langchain-skills`，该存储库不再接收更新。要切换，请参阅[Migrate from ⟦T13⟧](#migrate-from-langsmith-skills)。

## 安装插件

该插件将 MCP 连接的技能与 LangChain 文档和 API 参考捆绑在一起。安装插件是推荐的路径。

```text Claude Code theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
/plugin marketplace add langchain-ai/langchain-skills
/plugin install langchain-skills@langchain-skills
```

```bash Codex theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
codex plugin marketplace add langchain-ai/langchain-skills
codex plugin add langchain-skills@langchain-skills
```

```bash Deep Agents Code theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode plugin marketplace add langchain-ai/langchain-skills
dcode plugin install langchain-skills@langchain-skills
```

在 Claude Code 会话中运行 Claude Code 命令。使用 Claude Code v2.1.292 或更高版本，您可以通过一个命令从 shell 进行安装：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
claude plugin install langchain-skills --marketplace langchain-ai/langchain-skills
```

## 开启自动更新技能经常变化。打开自动更新，以便您的代理加载当前指南而不是过时的副本：

* **Claude Code**：Claude Code 为第三方市场关闭了自动更新。运行`/plugin`，转到**市场**，选择`langchain-skills`，然后选择**启用自动更新**。要立即更新，请运行`/plugin marketplace update langchain-skills`。
* **Deep Agents代码**：插件选择后台更新。更新后，运行`/reload`或开始新会话。
* **Codex**：本地 Git 市场安装没有记录的自动更新设置。运行`codex plugin marketplace upgrade langchain-skills`进行更新。

更新后，启动新的代理会话以加载更新的技能。有关脚本化设置和托管工作区，请参阅存储库自述文件中的[Updates](https://github.com/langchain-ai/langchain-skills#updates)。

## 仅安装技能

要安装不带插件的技能，请使用`npx skills`。此路径不注册文档 MCP 服务器。

```bash Local (current project) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx skills add langchain-ai/langchain-skills --skill '*' --yes
```

```bash Global (all projects) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx skills add langchain-ai/langchain-skills --skill '*' --yes --global
```

```bash Link to a specific agent (for example, Claude Code) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx skills add langchain-ai/langchain-skills --agent claude-code --skill '*' --yes --global
```

> [!提示]
>
> `npx skills` 不会自动更新。要更新，请运行 `npx skills update`，然后启动新的代理会话。

对于其他代理以及从克隆签出安装，请参阅存储库自述文件中的[Installation](https://github.com/langchain-ai/langchain-skills#installation)。

## 连接到LangSmith安装插件或技能不需要 LangSmith API 密钥。要让您的编码代理查询或管理 LangSmith 工作区，请在同一台计算机上安装 [LangSmith CLI](/langsmith/langsmith-cli#install) 并进行身份验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith auth login
```

在身份验证期间选择所需的工作区。对于自托管实例和配置文件，请参阅[Authenticate](/langsmith/langsmith-cli#authenticate)。

要跟踪或评估您构建的应用程序，请使用 [LangSmith API key](/langsmith/create-account-api-key) 配置 LangSmith SDK。将密钥设置为 `LANGSMITH_API_KEY` 环境变量，并将其置于源代码控制之外。

## 从 `langsmith-skills` 迁移

在安装 `langchain-skills` 之前删除 `langsmith-skills` 技能，这样您的代理就不会加载两组重叠的指导：

* **Claude Code 插件**：运行 `claude plugin marketplace remove langsmith-skills`，这也会卸载该插件。

* **`npx skills`**：运行一次以下命令，然后在安装技能的每个项目中再次运行（不带`--global`）：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npx skills remove langsmith-trace langsmith-dataset langsmith-evaluator \
    langsmith-custom-apps langsmith-experiment-diagnosis \
    langsmith-graph-evaluator langsmith-online-eval-engineering --global --yes
  ```

* **`install.sh`或复制的文件夹**：从您安装的每个技能目录中删除`langsmith-*`文件夹，例如`~/.claude/skills/`、`.claude/skills/`、`~/.agents/skills/`或`.agents/skills/`。

有关每种安装方法的确切命令，请参阅存储库自述文件中的[Migrate from the standalone skills](https://github.com/langchain-ai/langchain-skills#migrate-from-the-standalone-skills)。然后是[install the plugin](#install-the-plugin)和[turn on auto-update](#turn-on-auto-update)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/skills.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。