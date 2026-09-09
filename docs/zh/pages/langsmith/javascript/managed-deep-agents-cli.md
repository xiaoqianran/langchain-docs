<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Managed Deep Agents CLI reference | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-cli -->

# 托管 Deep Agents CLI 参考

`mda` CLI 编译并部署代码优先 [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview)。



它包含在 `managed-deepagents` npm 包中。


<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

要了解最快的端到端路径，请参阅[quickstart](/langsmith/javascript/managed-deep-agents-quickstart)。有关工作流程指南，请参阅 [Identity](/langsmith/javascript/managed-deep-agents-identity)、[Memory](/langsmith/javascript/managed-deep-agents-memory)、[Evals](/langsmith/javascript/managed-deep-agents-evals)、[Custom tools](/langsmith/javascript/managed-deep-agents-tools)、[Connections](/langsmith/javascript/managed-deep-agents-connections)、[Custom middleware](/langsmith/javascript/managed-deep-agents-middleware)、[Sandboxes](/langsmith/javascript/managed-deep-agents-sandboxes)、[Channels](/langsmith/javascript/managed-deep-agents-channels)、[Schedules](/langsmith/javascript/managed-deep-agents-schedules) 和[Deploy an agent](/langsmith/javascript/managed-deep-agents-deploy)。

## 安装

`mda init` 将 `managed-deepagents` 声明为项目依赖项，因此从项目中运行 `mda` 二进制文件。



<CodeGroup>
    ```bash npm
    npx managed-deepagents init my-agent
    cd my-agent
    npm install
    npx mda --version
    ```

    ```bash pnpm
    pnpm dlx managed-deepagents init my-agent
    cd my-agent
    pnpm install
    pnpm exec mda --version
    ```

    ```bash bun
    bunx managed-deepagents init my-agent
    cd my-agent
    bun install
    bunx mda --version
    ```
</CodeGroup>

该软件包提供代理、身份、计划和沙箱创作 API。


## 身份验证

`mda deploy` 按以下顺序读取 API 密钥：

1.`LANGGRAPH_HOST_API_KEY`
2.`LANGSMITH_API_KEY`
3.`LANGCHAIN_API_KEY`

CLI 首先从项目 `.env` 文件中读取这些值，然后从流程环境中读取这些值。如果在交互式终端中找不到密钥，`mda deploy` 会提示输入 LangSmith API 密钥并将其保存到项目 `.env` 文件中。

```text .env
LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
OPENAI_API_KEY=<OPENAI_API_KEY>
```

要使用组织范围的密钥进行部署，请设置 `LANGSMITH_WORKSPACE_ID` 或将 `--workspace-id` 传递给 `mda deploy`。LangSmith API 密钥对部署进行身份验证。代理的模型提供者在运行时也需要凭据。在 `.env` 中设置提供程序密钥，将其导出到 shell 中，或将其配置为 LangSmith 工作区密钥。例如，`openai:gpt-5.5`需要`OPENAI_API_KEY`。

`mda deploy` 转发非保留的 `.env` 条目，例如 `OPENAI_API_KEY`、MCP 令牌和自定义工具凭证，作为托管部署机密。保留的平台变量（包括 `LANGSMITH_API_KEY`、`LANGGRAPH_HOST_API_KEY`、`LANGCHAIN_API_KEY` 和 `LANGSMITH_WORKSPACE_ID`）用于 CLI 身份验证和部署路由，但不会作为用户管理的部署机密上传。

## 命令概述|命令 |使用 |
| --- | --- |
| `mda --help` |显示 CLI 帮助。 |
| `mda --version` |显示已安装的 CLI 版本。 |
| `mda init <name>` |搭建 TypeScript 托管的 Deep Agents 项目。 |
| `mda build [path]` |将项目编译为托管 LangGraph 应用程序，无需部署。 |
| `mda evals …` |初始化 Harbor 工作区并继续在编码代理中进行评估创作。 |
| `mda dev [path]` |编译一个项目并在本地LangGraph开发服务器上运行。 |
| `mda connections …` |管理工具和 MCP 连接器的身份验证。 |
| `mda deploy [path]` |编译、同步 Context Hub 上下文、上传并部署到 LangSmith。 |
| `mda channels init slack` |将 Slack 通道声明添加到当前项目。 |
| `mda logs [path]` |已部署代理的尾部代理服务器日志。 |
| `mda delete [path]` / `mda destroy [path]` |删除已部署的代理及其创建的LangSmith资源。 |


## 初始化项目

使用`mda init`创建一个新的项目目录：



<CodeGroup>
    ```bash npm
    npx managed-deepagents init my-agent
    ```

    ```bash pnpm
    pnpm dlx managed-deepagents init my-agent
    ```

    ```bash bun
    bunx managed-deepagents init my-agent
    ```
</CodeGroup>|参数或标志 |使用 |
| --- | --- |
| `name` |所需的项目目录名称。如果目标已存在，则该命令失败。 |
| `--instructions TEXT` |系统提示写入`instructions.md`。 |
| `--instructions-file PATH` |从文件中读取 `instructions.md` 的系统提示，或者当设置为 `-` 时从标准输入中读取。 |
| `--identity` |使用用户拥有的线程添加托管身份验证。 |
| `--memory agent\|none` |可以选择编写根内存声明。如果省略，则不会创建内存文件并且持久内存将关闭。 |
| `--model SPEC` |对代理运行的模型进行建模，如`provider:model`。 |
| `--no-sandbox` |省略托管沙箱声明。 |
| `--channel slack` |使用 Slack 通道声明初始化代理。可重复； `--channels` 是别名。 |

要将 Slack 包含在新项目中：



<CodeGroup>
    ```bash npm
    npx managed-deepagents init my-agent --channel slack
    ```

    ```bash pnpm
    pnpm dlx managed-deepagents init my-agent --channel slack
    ```

    ```bash bun
    bunx managed-deepagents init my-agent --channel slack
    ```
</CodeGroup>




脚手架语言来自您运行的包，而不是来自当前目录：npm 包始终编写 TypeScript 项目。从 npm 安装的 CLI 拒绝 Python 项目。


脚手架创建：|文件|描述 |
| --- | --- |
| `agent.ts` |命名为`agent`从`defineDeepAgent(...)`导出。 |
| `instructions.md` |托管系统提示。 |
| `package.json` |最小的特定于语言的清单。 |
| `README.md` |本地项目说明。 |
| `.env` |部署身份验证和运行时机密。不要泄露真正的秘密。 |
| `.gitignore` |忽略 `.env`、`.env.*`、`.mda/` 和依赖项缓存。 |


评估任务是选择性加入的，不是由 `mda init` 创建的。从项目根运行`mda evals init -i`来初始化Harbor工作区，并继续使用`eval-engineering`技能在编码代理中。

## 初始化 Slack 通道

从现有托管深度代理项目的根目录运行以下命令：



<CodeGroup>
    ```bash npm
    npx mda channels init slack
    ```

    ```bash pnpm
    pnpm exec mda channels init slack
    ```

    ```bash bun
    bunx mda channels init slack
    ```
</CodeGroup>


该命令在 `channels/` 目录中创建 Slack 通道声明。接下来`mda deploy` 设置代理需要出现在 Slack 中的资源。有关完整的工作流程，请参阅[Connect a Managed Deep Agent to Slack](/langsmith/javascript/managed-deep-agents-channels-slack)。

## 构建项目

使用 `mda build` 将项目编译为托管 LangGraph 应用程序，而无需部署它：



<CodeGroup>
    ```bash npm
    npx mda build
    ```

    ```bash pnpm
    pnpm exec mda build
    ```

    ```bash bun
    bunx mda build
    ```
</CodeGroup>|参数或标志 |使用 |
| --- | --- |
| `path` |项目目录。默认为当前目录。 |
| `--out OUT` |已编译应用程序的输出目录。默认为`<path>/.mda/build`。该目录在构建之前被清空，因此它必须丢失、为空或者是先前构建写入的目录。 |

## 评估项目

使用`mda evals init`初始化Harbor工作区。使用交互式切换，通过编码代理和 `eval-engineering` 技能来开发完整的任务。



<CodeGroup>
    ```bash npm
    npx mda evals init -i
    ```

    ```bash pnpm
    pnpm exec mda evals init -i
    ```

    ```bash bun
    bunx mda evals init -i
    ```
</CodeGroup>


|命令或标志 |使用 |
| --- | --- |
| `mda evals init` |缺失时创建`evals/harbor-job.json`，并在`.mda/evals/`下生成Harbor适配器和运行时设置。从项目根运行此命令。 |
| `-i`、`--interactive` |使用 eval-engineering 提示启动检测到的编码代理，或复制另一个代理的提示。 |

切换要求编码代理安装`eval-engineering`技能，检查托管代理，并在`evals/<task>/`下编写完整的Harbor任务。它还包括加载 MDA 作业插件和 LangSmith 插件的固定 Harbor 命令。`mda evals compile`是Harbor作业插件使用的内部命令。该插件在 Harbor 作业启动时运行它，因此您无需单独编译 eval 工件。

有关工作流程指南，请参阅[Evals](/langsmith/javascript/managed-deep-agents-evals)。

## 本地开发

使用`mda dev`编译项目并运行本地LangGraph开发服务器：



<CodeGroup>
    ```bash npm
    npx mda dev
    ```

    ```bash pnpm
    pnpm exec mda dev
    ```

    ```bash bun
    bunx mda dev
    ```
</CodeGroup>


|参数或标志 |使用 |
| --- | --- |
| `path` |项目目录。默认为当前目录。 |
| `--port PORT` |将端口转发到 LangGraph 开发服务器。 |
| `--hostname HOSTNAME` |将主机转发到LangGraph开发服务器。 |
| `--no-browser` |防止开发服务器启动时在浏览器中打开 Studio。 |
| `--no-reload` |禁用开发服务器的热重载。 |

`mda dev` 编译为 `.mda/build`，然后从该目录启动特定于语言的 LangGraph 开发服务器：



|项目语言|开发服务器命令 |
| --- | --- |
|打字稿 | `npx --yes @langchain/langgraph-cli dev` |


配置沙箱后，`mda dev` 会尝试配置的提供程序。如果提供程序凭据不可用或提供程序创建失败，它将回退到本地临时目录沙箱并打印所选路径。对于本地开发，`mda dev`将项目`.env`文件暂存在`.mda/build/.env`中，以便LangGraph可以加载模型提供程序密钥和其他运行时凭据。

## 管理连接

连接将托管深度代理链接到外部服务。该凭证位于 LangSmith 工作区中，因此无需重新部署即可轮换，并且用户拥有的连接可解析呼叫代理的人员的凭证。工具和 MCP 连接器在运行时使用 `connections.get(...)` 解析连接。

以三种模式之一创建连接：不透明机密（固定 API 密钥）、常规 OAuth（来自目录或自定义端点的 BYOT 应用程序）或 MCP OAuth（从 MCP 服务器 URL 发现并注册）。使用 `mda connections` 管理当前工作区中的这些凭据。

|命令 |使用 |
| --- | --- |
| `mda connections catalog` |列出具有预配置 OAuth 设置的服务。 |
| `mda connections create <slug>` |创建不透明机密、常规 OAuth 或 MCP OAuth 连接。 |
| `mda connections list` |列出工作区的连接元数据。 |
| `mda connections get <slug>` |显示一个连接的元数据。 |
| `mda connections delete <slug>` |删除连接及其存储的材料。 |`mda connections create` 的第一个参数是一个 slug，它是您的连接名称，名称代码传递给 `connections.get(...)`。提供商名称转到`--oauth`。

OAuth 目录使您无需查找提供商的 OAuth 设置。当您将列出的服务传递给 `--oauth` 时，CLI 会提供其授权 URL、令牌 URL、令牌端点身份验证方法、授权参数和默认范围，因此您只需提供客户端 ID 和客户端密钥。该目录不限制您可以使用哪些提供程序：对于其他任何内容，请传递 `--authorize-url` 和 `--token-url`。目录名称包括 `github`、`google`、`linear`、`slack`、`atlassian` 和 `notion-api`：



<CodeGroup>
    ```bash npm
    npx mda connections catalog
    ```

    ```bash pnpm
    pnpm exec mda connections catalog
    ```

    ```bash bun
    bunx mda connections catalog
    ```
</CodeGroup>


为自定义 Tavily 工具创建代理拥有的 API 密钥：



<CodeGroup>
    ```bash npm
    npx mda connections create organization-tavily --secret-from-env TAVILY_API_KEY
    ```

    ```bash pnpm
    pnpm exec mda connections create organization-tavily --secret-from-env TAVILY_API_KEY
    ```

    ```bash bun
    bunx mda connections create organization-tavily --secret-from-env TAVILY_API_KEY
    ```
</CodeGroup>


以下标志控制连接创建：|旗帜|使用 |
| --- | --- |
| `--project PATH` |设置项目目录。默认为当前目录。 |
| `--workspace-id WORKSPACE_ID` |覆盖`LANGSMITH_WORKSPACE_ID`。 |
| `--secret-from-env VAR` |从 shell 或项目 `.env` 读取固定值或 OAuth 客户端密钥。 |
| `--secret-from-file PATH` |从文件中读取固定值或 OAuth 客户端密钥。 |
| `--oauth SERVICE` |使用 `mda connections catalog` 中服务的预配置设置。 |
| `--client-id CLIENT_ID` |设置 OAuth 客户端 ID。 |
| `--auth-method METHOD` |将令牌端点方法设置为`client_secret_basic`、`client_secret_post`或`none`。 |
| `--scope SCOPE` |替换提供者的默认范围。对每个范围重复此操作。 |
| `--allowed-scope SCOPE` |设置授权流可以请求的最大范围。对每个范围重复此操作。 |
| `--authorization-param KEY=VALUE` |添加OAuth授权查询参数。对每个参数重复此操作。 |
| `--authorize-url URL` |设置自定义 OAuth 授权端点。需要`--token-url`。 |
| `--token-url URL` |设置自定义 OAuth 令牌端点。需要`--authorize-url`。 |
| `--mcp URL` |通过从 MCP 服务器 URL 发现 OAuth 来创建 MCP OAuth 连接。 |
| `--authorize` |登录到已部署代理使用的帐户，存储代理拥有的 OAuth 授权。需要 OAuth 标志和项目目录。 |由于没有值标志且没有 `--oauth` 端点，当该 slug 与项目中的一个用户拥有的 MCP 连接完全匹配时，`mda connections create <slug>` 会推断 MCP OAuth。

将 `--json` 与 `catalog`、`list` 或 `get` 一起使用以获得机器可读的输出。将 `--yes` 与 `delete` 一起使用可跳过确认提示。

有关凭证所有者、创建模式、调用者身份和运行时示例，请参阅 [Manage connections](/langsmith/javascript/managed-deep-agents-connections)。

## 部署项目

使用`mda deploy`编译并部署项目到LangSmith：



<CodeGroup>
    ```bash npm
    npx mda deploy
    ```

    ```bash pnpm
    pnpm exec mda deploy
    ```

    ```bash bun
    bunx mda deploy
    ```
</CodeGroup>




|参数或标志 |使用 |
| --- | --- |
| `path` |项目目录。默认为当前目录。 |
| `--name NAME` |部署名称。默认为`defineDeepAgent`的代理`name`。 |
| `--deployment-type dev\|prod` |创建部署时的部署类型。默认为`dev`。 |
| `--workspace-id WORKSPACE_ID` |要部署到的工作区 ID。覆盖`LANGSMITH_WORKSPACE_ID`。 |
| `--no-wait` |触发远程构建并退出，无需轮询部署完成情况。 |


部署运行以下步骤：1. 验证项目目录并加载代理条目文件。
2. 解析LangSmith API 密钥和可选工作区 ID。
3. 收集非保留的 `.env` 值作为托管部署机密。
4. 验证模型提供程序 API 密钥可从 `.env`、shell 环境或 LangSmith 工作区机密获取。
5. 将部署拥有的上下文同步到 Context Hub。
6. 将项目编译为`.mda/build`并提取可选的`schedules/`和`channels/`声明。
7. 按名称创建或查找 LangSmith 托管部署。
8. 归档构建、上传并触发远程构建。
9. 轮询修订版，直到达到`DEPLOYED`，除非设置了`--no-wait`。
10. 协调计划的托管 LangSmith cron 作业，除非设置了 `--no-wait`。
11. 配置已声明的 Slack 通道。如果需要 Slack 授权或工作区批准，请显示操作并在完成后继续。

具有 Slack 通道的项目无法使用 `--no-wait`，因为 Slack 配置需要部署的代理服务器 URL。有关完整的工作流程，请参阅[Connect a Managed Deep Agent to Slack](/langsmith/javascript/managed-deep-agents-channels-slack)。

成功后，CLI 将打印 LangSmith 部署仪表板 URL。有关秘密路由和部署技巧，请参阅[Deploy an agent](/langsmith/javascript/managed-deep-agents-deploy)。

## 读取部署日志使用 `mda logs` 跟踪已部署代理的代理服务器日志：



<CodeGroup>
    ```bash npm
    npx mda logs
    ```

    ```bash pnpm
    pnpm exec mda logs
    ```

    ```bash bun
    bunx mda logs
    ```
</CodeGroup>


|参数或标志 |使用 |
| --- | --- |
| `path` |项目目录。默认为当前目录。 |
| `--name NAME` |部署名称。默认为项目中的代理`name`。 |
| `--lines LINES` |要获取的最近日志行数。默认为`1000`。 |
| `--level LEVEL` |仅显示等于或高于给定严重性的条目：`debug`、`info`、`warning`、`error` 或 `critical`。 |
| `--follow` |继续传输新日志。这是交互式终端中的默认设置。 |
| `--no-follow` |打印最近的日志并退出。这是通过管道输出时的默认设置。 |
| `--workspace-id WORKSPACE_ID` |要读取的工作区 ID。覆盖`LANGSMITH_WORKSPACE_ID`。 |

## 删除部署

使用 `mda delete` 删除已部署的托管深度代理及其创建的 LangSmith 资源。 `mda destroy` 是别名。



<CodeGroup>
    ```bash npm
    npx mda delete
    ```

    ```bash pnpm
    pnpm exec mda delete
    ```

    ```bash bun
    bunx mda delete
    ```
</CodeGroup>




|参数或标志 |使用 |
| --- | --- |
| `path` |项目目录。默认为当前目录。 |
| `--name NAME` |部署名称。默认为 `defineDeepAgent` 的代理`name`。 |
| `--workspace-id WORKSPACE_ID` |部署所在的工作区 ID。覆盖 `LANGSMITH_WORKSPACE_ID`。 |
| `--yes` |删除时无需询问确认。 |## 故障排除



|症状|原因及解决办法 |
| --- | --- |
| `project root ... is not a directory` |将目录路径传递给`mda dev`或`mda deploy`。 |
| `no agent entry file found` |在项目根目录添加`agent.ts`或`agent.tsx`。 |
| `No LangSmith API key found` |设置`LANGSMITH_API_KEY`或将其添加到项目`.env`。 |
|部署失败并显示 401 或 403 |确认 API 密钥属于具有部署访问权限的工作区。参见[Pricing plans](/langsmith/pricing-plans)。 |
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