<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Managed Deep Agents CLI reference | https://docs.langchain.com/langsmith/python/managed-deep-agents-cli -->

# 托管 Deep Agents CLI 参考

`mda` CLI 首先编译和部署代码[Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)。

它包含在 `managed-deepagents` Python 包中。




<Note>
托管 Deep Agents 在 **公共 [beta](/langsmith/release-stages)** 中可用，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

要了解最快的端到端路径，请参阅[quickstart](/langsmith/python/managed-deep-agents-quickstart)。有关工作流程指南，请参阅 [Identity](/langsmith/python/managed-deep-agents-identity)、[Memory](/langsmith/python/managed-deep-agents-memory)、[Evals](/langsmith/python/managed-deep-agents-evals)、[Custom tools](/langsmith/python/managed-deep-agents-tools)、[Custom middleware](/langsmith/python/managed-deep-agents-middleware)、[Sandboxes](/langsmith/python/managed-deep-agents-sandboxes)、[Channels](/langsmith/python/managed-deep-agents-channels)、[Schedules](/langsmith/python/managed-deep-agents-schedules) 和 [Deploy an agent](/langsmith/python/managed-deep-agents-deploy)。

## 安装

安装用于编写代理的语言的包。该软件包公开了 `mda` 二进制文件。

```bash uv
uv tool install managed-deepagents
```

`uv tool install managed-deepagents` 安装 `mda` CLI。 `mda init`生成的项目有自己的`pyproject.toml`；在该项目内运行 `uv sync` 以在本地开发或部署之前安装项目依赖项。

该软件包提供代理、身份、计划和具有蛇形命名的沙箱创作 API，以及 `mda` 控制台脚本。




## 身份验证

`mda deploy` 按以下顺序读取 API 密钥：

1.`LANGGRAPH_HOST_API_KEY`
2.`LANGSMITH_API_KEY`
3.`LANGCHAIN_API_KEY`

CLI 首先从项目 `.env` 文件中读取这些值，然后从流程环境中读取这些值。如果在交互式终端中找不到密钥，`mda deploy` 会提示输入 LangSmith API 密钥并将其保存到项目 `.env` 文件中。

```text .env
LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
OPENAI_API_KEY=<OPENAI_API_KEY>
```要使用组织范围的密钥进行部署，请设置 `LANGSMITH_WORKSPACE_ID` 或将 `--workspace-id` 传递给 `mda deploy`。

LangSmith API 密钥对部署进行身份验证。代理的模型提供者在运行时也需要凭据。在 `.env` 中设置提供程序密钥，将其导出到 shell 中，或将其配置为 LangSmith 工作区密钥。例如，`openai:gpt-5.5`需要`OPENAI_API_KEY`。

`mda deploy` 将非保留的 `.env` 条目（例如 `OPENAI_API_KEY`、MCP 令牌和自定义工具凭证）作为托管部署机密转发。保留的平台变量（包括 `LANGSMITH_API_KEY`、`LANGGRAPH_HOST_API_KEY`、`LANGCHAIN_API_KEY` 和 `LANGSMITH_WORKSPACE_ID`）用于 CLI 身份验证和部署路由，但不会作为用户管理的部署机密上传。

## 命令概述|命令 |使用|
| ---| ---|
| `mda --help` |显示 CLI 帮助。 |
| `mda --version` |显示已安装的 CLI 版本。 |
| `mda init <name>` |搭建一个 Python 管理的 Deep Agents 项目。 |
| `mda build [path]` |将项目编译为托管 LangGraph 应用程序，无需部署。 |
| `mda eval …` / `mda evals …` |搭建可选的 Harbor 任务并将代理编译为 Harbor 切换。 |
| `mda dev [path]` |编译一个项目并在本地LangGraph开发服务器上运行。 |
| `mda deploy [path]` |编译、同步 Context Hub 上下文、上传并部署到 LangSmith。 |
| `mda channel add slack [path]` |为已部署的代理配置 Slack。 |
| `mda logs [path]` |已部署代理的尾部代理服务器日志。 |
| `mda delete [path]` / `mda destroy [path]` |删除已部署的代理及其创建的LangSmith资源。 |




## 初始化项目

使用`mda init`创建一个新的项目目录：

```bash
mda init my-agent
```|参数或标志 |使用|
| ---| ---|
| `name` |所需的项目目录名称。如果目标已存在，则该命令失败。 |
| `--instructions TEXT` |系统提示写入`instructions.md`。 |
| `--instructions-file PATH` |从文件中读取 `instructions.md` 的系统提示，或者当设置为 `-` 时从标准输入中读取。 |
| `--identity` |使用用户拥有的线程添加托管身份验证。 |
| `--memory agent\|none` |可以选择编写根内存声明。如果省略，则不会创建内存文件并且持久内存将关闭。 |
| `--model SPEC` |对代理运行的模型进行建模，如`provider:model`。 |
| `--no-sandbox` |省略托管沙箱声明。 |

该命令从当前目录检测语言：

|当前目录包含 |结果 |
| ---| ---|
|仅`pyproject.toml` | Python 脚手架。 |
|两者或都不 |交互式语言提示。 |




脚手架创建：

|文件 |描述 |
| ---| ---|
| `agent.py` |命名为 `agent` 从 `define_deep_agent(...)` 导出。 |
| `instructions.md` |托管系统提示。 |
| `pyproject.toml` |最小的特定于语言的清单。 |
| `README.md` |本地项目说明。 |
| `.env` |部署身份验证和运行时机密。不要泄露真正的秘密。 |
| `.gitignore` |忽略 `.env`、`.env.*`、`.mda/` 和依赖项缓存。 |评估任务是选择性加入的，不是由 `mda init` 创建的。托管 Deep Agents 评估是 `evals/tasks/` 下的 Harbor 任务。仅当您需要 `evals/scaffold/` 下的可选启动任务时才运行 `mda evals init <name>`。

## 构建项目

使用 `mda build` 将项目编译为托管 LangGraph 应用程序，而无需部署它：

```bash
mda build .
```

|参数或标志 |使用|
| ---| ---|
| `path` |项目目录。默认为当前目录。 |
| `--out OUT` |已编译应用程序的输出目录。默认为`<path>/.mda/build`。该目录在构建之前被清空，因此它必须丢失、为空或者是先前构建写入的目录。 |

## 评估项目

`evals/tasks/` 是规范的 Harbor 数据集。作者直接在那里完成Harbor任务。 `mda eval` 命令（也可用作 `mda evals`）可以构建启动任务并打包 Harbor 的托管代理。托管 Deep Agents 打印 `harbor run` 命令，但不运行试验。

```bash
mda evals init smoke
mda evals compile .
# then run the printed `harbor run` command
```

|子命令 |使用|
| ---| ---|
| `mda evals init <name>` |使用指令和语言本机测试创建`evals/scaffold/<name>/`。从项目根运行此命令。 |
| `mda evals compile [path]` |编译托管代理，将选定的脚手架复制到`evals/tasks/`，并在`evals/`下编写Harbor handoff。 |传递给`mda evals init`的任务名称可以包含ASCII字母、数字、`_`和`-`。

`mda evals compile` 标志：

|旗帜|使用|
| ---| ---|
| `--task <name>` |选择一项任务。重复选择多个任务。选定的脚手架会刷新`evals/tasks/`下的匹配任务。如果省略，则选择所有任务并刷新每个脚手架。除非选定的脚手架具有相同的名称，否则现有的规范任务将被保留。 |
| `--model <provider:model>` |在工件清单中记录模型。重复记录多个模型；生成的作业配置使用第一个值。 |

有关 Harbor 任务创作、可选脚手架、凭据和运行试验的信息，请参阅 [Evals](/langsmith/python/managed-deep-agents-evals)。

## 本地开发

使用`mda dev`编译项目并运行本地LangGraph开发服务器：

```bash
mda dev .
```

|参数或标志 |使用|
| ---| ---|
| `path` |项目目录。默认为当前目录。 |
| `--port PORT` |将端口转发到 LangGraph 开发服务器。 |
| `--hostname HOSTNAME` |将主机转发到LangGraph开发服务器。 |
| `--no-browser` |防止开发服务器启动时在浏览器中打开 Studio。 |
| `--no-reload` |禁用开发服务器的热重载。 |

`mda dev` 编译为 `.mda/build`，然后从该目录启动特定于语言的 LangGraph 开发服务器：|项目语言|开发服务器命令 |
| ---| ---|
|蟒蛇 | `uv run --with langgraph-cli[inmem]>=0.4.30 langgraph dev` |

在运行`mda dev`之前安装`uv`。 CLI 会自动解析本地LangGraph 开发服务器，因此您无需自行安装`langgraph-cli[inmem]`。




配置沙箱后，`mda dev` 会尝试配置的提供程序。如果提供程序凭据不可用或提供程序创建失败，它将回退到本地临时目录沙箱并打印所选路径。

对于本地开发，`mda dev`将项目`.env`文件暂存在`.mda/build/.env`中，以便LangGraph可以加载模型提供程序密钥和其他运行时凭证。

## 部署项目

使用`mda deploy`编译并部署项目到LangSmith：

```bash
mda deploy .
```

|参数或标志 |使用|
| ---| ---|
| `path` |项目目录。默认为当前目录。 |
| `--name NAME` |部署名称。默认为`define_deep_agent`的代理`name`。 |
| `--deployment-type dev\|prod` |创建部署时的部署类型。默认为 `dev`。 |
| `--workspace-id WORKSPACE_ID` |要部署到的工作区 ID。覆盖`LANGSMITH_WORKSPACE_ID`。 |
| `--no-wait` |触发远程构建并退出，无需轮询部署完成情况。 |




部署运行以下步骤：1. 验证项目目录并加载代理条目文件。
2. 解析LangSmith API 密钥和可选工作区 ID。
3. 收集非保留的 `.env` 值作为托管部署机密。
4. 验证模型提供程序 API 密钥可从 `.env`、shell 环境或 LangSmith 工作区机密获取。
5. 将部署拥有的上下文同步到 Context Hub。
6. 将项目编译为`.mda/build`并提取可选的`schedules/`声明。
7. 按名称创建或查找 LangSmith 托管部署。
8. 归档构建、上传并触发远程构建。
9. 轮询修订版，直到达到`DEPLOYED`，除非设置了`--no-wait`。
10. 协调计划的托管 LangSmith cron 作业，除非设置了 `--no-wait`。

Deploy 不配置 Slack。部署完成后运行`mda channel add slack .`。有关完整的工作流程，请参阅[Slack channels](/langsmith/python/managed-deep-agents-channels-slack#create-and-deploy-the-slack-app)。

成功后，CLI 将打印 LangSmith 部署仪表板 URL。有关秘密路由和部署技巧，请参阅[Deploy an agent](/langsmith/python/managed-deep-agents-deploy)。

## 读取部署日志

使用 `mda logs` 跟踪已部署代理的代理服务器日志：

```bash
mda logs .
```|参数或标志 |使用|
| ---| ---|
| `path` |项目目录。默认为当前目录。 |
| `--name NAME` |部署名称。默认为项目中的代理`name`。 |
| `--lines LINES` |要获取的最近日志行数。默认为`1000`。 |
| `--level LEVEL` |仅显示等于或高于给定严重性的条目：`debug`、`info`、`warning`、`error` 或 `critical`。 |
| `--follow` |继续传输新日志。这是交互式终端中的默认设置。 |
| `--no-follow` |打印最近的日志并退出。这是通过管道输出时的默认设置。 |
| `--workspace-id WORKSPACE_ID` |要读取的工作区 ID。覆盖`LANGSMITH_WORKSPACE_ID`。 |

## 删除部署

使用 `mda delete` 删除已部署的托管深度代理及其创建的 LangSmith 资源。 `mda destroy` 是别名。

```bash
mda delete .
```

|参数或标志 |使用|
| ---| ---|
| `path` |项目目录。默认为当前目录。 |
| `--name NAME` |部署名称。默认为`define_deep_agent`的代理`name`。 |
| `--workspace-id WORKSPACE_ID` |部署所在的工作区 ID。覆盖 `LANGSMITH_WORKSPACE_ID`。 |
| `--yes` |删除时无需询问确认。 |




## 故障排除|症状|原因及解决办法 |
| ---| ---|
| `project root ... is not a directory` |将目录路径传递给`mda dev`或`mda deploy`。 |
| `no agent entry file found` |在项目根目录添加`agent.py`。 |
| `mda dev` 找不到 `uv` |安装`uv`，以便`mda dev`可以解析本地LangGraph开发服务器。 |
| `No LangSmith API key found` |设置`LANGSMITH_API_KEY`或将其添加到项目`.env`。 |
|部署失败并显示 401 或 403 |确认 API 密钥属于具有测试访问权限的工作区。 |
|部署报告缺少模型提供程序 API 密钥 |将提供程序密钥（例如 `OPENAI_API_KEY`）添加到 `.env`，将其导出到 shell 中，或将其配置为 LangSmith 工作区密钥。 |
|部署报告 Context Hub 冲突 | Context Hub 存储库在部署期间发生了更改。重新运行`mda deploy`。 |
|构建超过 200 MB |在部署之前从项目中删除生成的工件或大文件。 |
|部署达到`BUILD_FAILED`或`DEPLOY_FAILED` |在 LangSmith 中打开打印的部署 URL 并检查修订日志。 |

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-cli.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>