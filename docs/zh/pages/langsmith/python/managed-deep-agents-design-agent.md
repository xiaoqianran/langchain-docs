<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy the open-source design agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-design-agent -->

# 部署开源设计代理

将开源设计代理 Content Studio 作为托管 Deep Agents 项目部署到 Slack。

[Content Studio](https://github.com/langchain-ai/design-agent) 是一个基于 Managed Deep Agents 构建的开源设计代理。您的团队在 Slack 中请求工作，代理在线程中返回完成的文件。

> [!注意]
>
> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

## 部署代理

在开始之前，请确保您拥有：

* 一个[LangSmith Cloud](/langsmith/cloud)账户和一个可以部署的[API key](/langsmith/create-account-api-key)。
* 您的模型提供商的密钥。在 [LLM Gateway](/langsmith/llm-gateway) 上，代理会使用您的 LangSmith 密钥。
* 在 Slack 工作区中安装应用程序的权限，或可以批准代理的 Slack 应用程序的工作区管理员。

要使用编码代理（例如 Claude Code、Codex 或 Cursor）进行部署，请粘贴此提示。它会安装代理、检查设置并在计费或部署任何内容之前进行询问。

使用编码代理部署设计代理

使用 Managed Deep Agents 将开源设计代理部署到我的 Slack 工作区。1. 使用 `curl -fsSL https://raw.githubusercontent.com/langchain-ai/design-agent/main/install.sh | bash` 安装它，然后在它创建的 `design-agent` 文件夹中工作。
2. 阅读`AGENTS.md`并遵循`design-agent-deploy`技巧。
3. 告诉我您需要哪些钥匙。我会自己在终端中使用 `uv run design-agent config set <KEY>` 输入它们；永远不要让我在聊天中粘贴密钥。
4. 运行 `uv run design-agent doctor` 并修复它标记的内容。它的 `mda-deploy` 行列出了部署仍然需要的内容。
5. `uv run design-agent sandbox publish`之前问我，哪个账单。然后让我在自己的终端中运行第一个部署 `uv run mda deploy`，因为它设置了 Slack 应用程序。
6. 上线后，指导我在 Slack 中向代理发送消息并发送第一个请求。

自行部署：

**1.安装项目**

如果需要，安装程序会安装 uv，然后克隆存储库并进行设置。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -fsSL https://raw.githubusercontent.com/langchain-ai/design-agent/main/install.sh | bash
cd design-agent
```

**2.添加您的密钥**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv run design-agent config set LANGSMITH_API_KEY ANTHROPIC_API_KEY
```

该命令要求提供每个密钥并将其隐藏。在 [LLM Gateway](/langsmith/llm-gateway) 上，跳过提供程序密钥并运行 `uv run design-agent config set DESIGN_AGENT_MODEL=langsmith:anthropic/claude-opus-5-5`。

`mda deploy` 将 `.env` 中的每个密钥作为部署密钥转发，除了 `LANGSMITH_API_KEY`，它对部署进行签名。

**3.发布沙箱**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv run design-agent sandbox publish
````mda deploy` 将 `sandbox/setup.sh` 构建为自己的快照。该构建使用 Docker 映像库，该映像库具有 1 GiB 文件系统。设计代理的机器配备 Chrome、FFmpeg 和 HyperFrames，大小约为 1.3 GiB。此命令会在您的 [workspace](/langsmith/administration-overview#workspaces) 中构建一个更大的快照，并将 `sandbox/__init__.py` 指向它。

它需要 10 到 15 分钟，并且每个工作区运行一次。仅当`sandbox/setup.sh`发生变化时才重新发布。

**4.部署**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv run mda deploy
```

第一个部署配置代理的 Slack 应用程序。如果该命令打印 Slack 链接，请打开它，批准该应用程序用于您的工作区，然后按 Enter。工作区管理员可能需要首先批准该应用程序。

**5.发送第一个请求**

首次部署后，代理会向您发送一条直接消息。在那里回复，或者邀请它加入频道并在请求中提及它，例如产品的启动图形。进度更新和完成的文件出现在同一个线程中。

![A Slack thread. A person asks Content Studio for a product launch graphic for Managed Deep Agents. The agent marks its steps done, attaches four versions of the graphic in landscape and square, light and dark, and explains the idea behind the design.](https://mintcdn.com/langchain-5e9cc07a/iUeSEP3j6ExFou6p/langsmith/images/design-agent-slack-thread.png?fit=max\&auto=format\&n=iUeSEP3j6ExFou6p\&q=85\&s=871ad43952fcb1cbadfd9c960ca4c516)

Slack 线程示例：进度更新，然后完成文件。

## 定制设计代理

大多数更改都是对存储库中的文件进行编辑。常见的：* **品牌包**：您的颜色、字体、徽标和声音都存在于 `workspace/brand/` 中。请您的编码代理根据您的网站和品牌指南构建包。
* **技能**：每个工作流程都是`skills/`中的一个文件夹。为您的团队经常提出的请求添加一项，例如每周简讯标题。
* **说明**：常亮提示符为`instructions.md`。保持简短，并将工作流程纳入技能中。
* **MCP 服务器**：将 `config/mcp.example.toml` 复制到 `config/mcp.toml` 并开启 Notion 或 GitHub 等服务器。每个人都通过 [workspace connection](/langsmith/python/managed-deep-agents-connections) 以自己的身份登录。
* **型号**：设置`DESIGN_AGENT_MODEL`与`uv run design-agent config set`。任何具有工具调用和视觉功能的聊天模型都可以。

要尝试更改并发货，请使用这些 [⟦T28⟧ commands](/langsmith/python/managed-deep-agents-cli)：

|命令 |它有什么作用 |
| - | - |
| `uv run mda dev` |在本地运行代理并在[LangSmith Studio](/langsmith/studio)中打开它 |
| `uv run mda deploy --name design-agent-test` |部署一个单独的副本来测试更改，而无需触及您的团队使用的副本 |
| `uv run mda deploy` |将您的更改发送到您的团队使用的部署 |
| `uv run mda logs` |追踪已部署代理的日志 |
| `uv run mda build` |编译无需部署即可发送到 `.mda/build/` 的内容 |

有关更多信息，请参阅存储库中的[Customization](https://github.com/langchain-ai/design-agent/blob/main/docs/customization.md)。

## 探索项目

每个托管功能都是存储库根目录下的一个文件或文件夹：|路径|在此代理|了解更多 |
| - | - | - |
| `agent.py` |使用 `define_deep_agent` 从模型、工具、中间件和子代理的一个共享组件构建代理 | [Agent definition](/langsmith/python/managed-deep-agents-agent-definition) |
| `instructions.md` |简短的始终在线提示，工作流程保留在技能中 | [Instructions](/langsmith/python/managed-deep-agents-instructions) |
| `skills/` | 35 项技能和一个设计 wiki，同步到 Context Hub 并仅在工作需要时加载 | [Skills](/langsmith/python/managed-deep-agents-skills) |
| `sandbox/` |每个线程克隆的 Linux 机器的固定配方，包括 Chrome、FFmpeg、HyperFrames、D2 和您的字体 | [Sandboxes](/langsmith/python/managed-deep-agents-sandboxes) |
| `channels/slack.py` |用于提及、私信、话题回复、文件和审批卡的托管 Slack 应用程序 | [Slack channel](/langsmith/python/managed-deep-agents-channels-slack) |
| `memory.py` |每个人共享的团队记忆和每个人的个人记忆| [Memory](/langsmith/python/managed-deep-agents-memory) |
| `tools/mcp.py` |来自 `config/mcp.toml` 的 MCP 服务器，每个人都以自己的身份登录 | [MCP connectors](/langsmith/python/managed-deep-agents-mcp-connectors) |
| `schedules/housekeeping.py` |每 15 分钟运行一次，清扫工作重启停止，无模型调用 | [Schedules](/langsmith/python/managed-deep-agents-schedules) |
| `identity.py` |使用 LangSmith API 密钥对 API 调用者进行身份验证 | [Identity](/langsmith/python/managed-deep-agents-identity) |
| `src/design_agent/` |代理入口导入的应用代码，如主机工具和中间件 | [Tools](/langsmith/python/managed-deep-agents-tools) |

## 架构

托管 Deep Agents 提供 Slack 应用程序、身份、计划和每个线程的沙箱。该存储库添加了设计工作流程、品牌包和渲染工具。

![A Slack thread goes to the main agent on Managed Deep Agents, which reads skills and a wiki, keeps team and personal memory, uses managed tools and MCP servers, and works in a sandbox per thread with async subagents, then posts the film back to the same thread.](https://mintcdn.com/langchain-5e9cc07a/iUeSEP3j6ExFou6p/langsmith/images/design-agent-architecture-light.png?fit=max\&auto=format\&n=iUeSEP3j6ExFou6p\&q=85\&s=bb8dc7cf8ad2027a6f82c379c725550b)从 Slack 通过代理和沙箱返回线程的请求路径。

视频生成等长时间工作在后台运行。主代理将零件交给同一沙箱上的[subagents](/langsmith/python/managed-deep-agents-subagents)，并保持自由交谈。当后台作业完成或停止时，一次性[schedule](/langsmith/python/managed-deep-agents-schedules)唤醒主代理。

`workspace/brand/`中的品牌包是颜色、字体、标志和声音的来源。代理在发布之前会根据该包检查每个渲染。

## 另请参阅

* [Design agent repository](https://github.com/langchain-ai/design-agent)
* [Run the demo locally, with no API keys](https://github.com/langchain-ai/design-agent#try-it-locally)
* [Paid media agent template](/langsmith/python/managed-deep-agents-paid-media-agent)
* [Deploy with Managed Deep Agents, in the repository](https://github.com/langchain-ai/design-agent/blob/main/docs/deploy-mda.md)
* [Managed Deep Agents project structure](/langsmith/python/managed-deep-agents-project-structure)
* [Deploy a Managed Deep Agents project](/langsmith/python/managed-deep-agents-deploy)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-design-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。