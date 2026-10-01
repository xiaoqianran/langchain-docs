<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Move from Deep Agents to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-migrate -->

# 从Deep Agents移动到托管Deep Agents

将使用 create_deep_agent 构建的代理转换为托管 Deep Agents 项目。

托管 Deep Agents 运行与您已经构建的相同的 [Deep Agents](/oss/python/deepagents/overview) 工具，因此移动现有代理是一项重新打包工作，而不是重写。您的工具、中间件和子代理将按原样保留。代理条目发生变化，系统提示、技能和内存移至项目文件中。

<Note>
  托管 Deep Agents 位于 **公共 [beta](/langsmith/release-stages)** 中，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 决定是否移动

托管 Deep Agents 运行相同的工具，因此代理本身的行为相同。工具、中间件和子代理的工作方式与今天一样。移动增加了代理周围的层：Slack 和其他聊天界面、最终用户的 OAuth、计划运行、托管沙箱和持久内存成为项目文件中的声明，而不是您构建和操作的服务。

当您需要该层时移动代理而不运行它。当您需要拥有它时，请留在Deep Agents。| | Deep Agents |托管Deep Agents |
| - | - | - |
| **托管** |您可以在自己的进程或容器中运行代理，或将其部署为[LangSmith deployment](/langsmith/deployment)。 | LangSmith 在 [Agent Server](/langsmith/agent-server-overview) 上托管代理。 `mda deploy` 是整个部署步骤。 |
| **文件系统和外壳** |任何[backend](/oss/python/deepagents/backends)：代理状态、本地磁盘、存储或您向提供商提供的[sandbox](/oss/python/deepagents/sandboxes)。 |一个托管的[sandbox](/langsmith/python/managed-deep-agents-sandboxes)，在文件中声明。 LangSmith 创建它，对其进行快照，并在空闲时停止它。 |
| **对话记忆** |您自己运行存储并连接它。 |一棵共享的[memory](/langsmith/python/managed-deep-agents-memory)树，通过添加文件启用。 |
| **最终用户的第三方访问** |您为每个用户配置并存储凭据。 | [Connections](/langsmith/python/managed-deep-agents-connections) 保存工作区机密并运行 OAuth，以便最终用户自行授权服务。 |
| **聊天界面** |您编写集成。 | [Channels](/langsmith/python/managed-deep-agents-channels) 连接 Slack 和其他消息服务。 |
| **预定运行** |您运行调度程序。 | [Schedules](/langsmith/python/managed-deep-agents-schedules) 运行托管 cron 作业。 |
| **围绕代理的代码** |您可以编写，包括自定义路由和应用程序代码。 |仅限代理。对于自定义路由或应用程序代码，请使用[LangSmith deployment](/langsmith/deployment)。 |无论哪种方式，线束都是相同的，因此首先在 Deep Agents 上构建，并在代理准备好生产时移动是正常路径。参见[Going to production](/oss/python/deepagents/going-to-production)。

## 了解发生了什么变化

[create\_deep\_agent](https://reference.langchain.com/python/deepagents/graph/create_deep_agent) 在您的进程中编译一个代理，因此它将后端、存储和检查指针作为参数。 `define_deep_agent` 返回一个定义，托管运行时对其进行编译。定义是配置而不是可运行的代理：`mda` CLI 在`mda dev` 和 `mda deploy` 上使用它，并且运行时在此时提供托管片段。完整图片请参见[Relationship to Deep Agents](/langsmith/python/managed-deep-agents-overview#relationship-to-deep-agents)。

## 检查哪些内容没有保留

大多数代理移动时不会对条目文件进行任何更改。有四种情况需要首先做出决定：* **自定义后端**：手写的 `BackendProtocol` 实现没有等效项。运行时拥有后端，[managed sandbox](/langsmith/python/managed-deep-agents-sandboxes)是为代理提供文件系统和 shell 的唯一选择。
* **您自己的存储或检查点**：线程、运行和持久性来自[Agent Server](/langsmith/agent-server-overview)。依赖于特定商店实现的代理需要将逻辑移至工具或中间件中。
* **自定义应用程序代码和路由**：托管 Deep Agents 托管代理，而不是任意 Web 应用程序。对于代理周围的自定义路由、高级身份验证或应用程序代码，请改用 [LangSmith deployment](/langsmith/deployment)。
* **Python 中的自定义状态模式**：`define_deep_agent` 不接受 `state_schema`，因此扩展 `DeepAgentState` 的代理无法按原样移动。 TypeScript `defineDeepAgent` 接受 `stateSchema`。

如果这些都不适用，则代理逻辑将按写入方式进行传输。

<Prompt description="Convert a Deep Agents project into a Managed Deep Agents project." icon="arrow-right">
  将此代码库从自托管 Deep Agents 代理转换为托管 Deep Agents (MDA) 项目。

  ## 第 1 步：阅读指南

  获取并遵循 [https://docs.langchain.com/langsmith/python/managed-deep-agents-migrate.md](https://docs.langchain.com/langsmith/python/managed-deep-agents-migrate.md) 作为参数映射和项目布局的真实来源。

  ## 第二步：添加SDK就地转换项目；不要运行 `mda init`，它只会创建一个新目录。将 `managed-deepagents` 添加到现有项目清单，固定到版本 `mda --version` 报告，并保留每个现有依赖项。

  在 Python 中，如果清单设置了 `build-backend = "hatchling.build"`，则还要添加 `[tool.hatch.metadata] allow-direct-references = true`。 `mda build` 将要求重写为路径引用，否则 Hatchling 在安装时会拒绝该路径引用。

  ## 第三步：移动配置

  找到`create_deep_agent`（或`createDeepAgent`）调用站点，然后：

  * 将项目根目录下`agent.py`（或`agent.ts`）中的`define_deep_agent`（或`defineDeepAgent`）替换为`define_deep_agent`（或`defineDeepAgent`），导出名为`agent`的变量。定义调用必须存在于该文件中，而不是重新导出到其中。
  * 添加静态`name`，这是必需的。使用匹配 `[a-zA-Z][a-zA-Z0-9_-]*` 的字符串。
  * 将`system_prompt`文本移至代理条目旁边的`instructions.md`，并删除参数。
  * 将`skills`引用的文件移至`skills/<name>/SKILL.md`，并去掉参数。
  * 将`memory`替换为根`memory.py`（或`memory.ts`），导出名为`memory`的变量并设置为`define_memory(scope="agent")`，并删除该参数。如果代理不需要持久内存，请保留该文件。警告用户这会挂载一棵空树，并且任何现有的内存内容都必须移至 `instructions.md` 或技能中。* 删除`backend`、`store`、`checkpointer`。运行时拥有这三个。如果代理使用沙箱后端，请添加导出 `define_sandbox(...)` 的 `sandbox/` 声明。托管沙箱是托管 Deep Agents 提供的唯一后端。
  * 保持 `model`、`tools`、`middleware`、`subagents`、`permissions`、`cache` 和 `debug` 原样，以及中断、响应格式和上下文架构参数在其现有名称下。警告用户声明 `sandbox/` 的项目在清除 `permissions` 的情况下运行，因为文件系统权限规则禁用了沙箱 `execute` 工具。
  * 将工具和中间件模块保留在它们已经存在的地方，并继续从代理条目中导入它们。不要重组项目。

  ## 步骤 4：明确处理差距

  如果代码库在 Python 中传递 `state_schema`，构建自定义 `BackendProtocol`，或将代理包装在其自己的服务器路由或应用程序代码中，请停止并询问用户如何继续。托管Deep Agents不接受这些。不要发明替代品。

  ## 步骤 5：验证

  运行`mda build`，然后运行`mda dev`，并确认代理启动并应答测试消息。 `mda build` 不验证定义调用，因此剩余的托管参数仅出现在图形加载时。报告任何无法迁移的内容。
</Prompt>## 映射参数

大部分表面转移到`define_deep_agent`不变，名称相同：`model`、`tools`、`middleware`、`subagents`、`interrupt_on`、`response_format`、`context_schema`、`cache`和`debug`。将工具和中间件模块保留在它们已经存在的地方，并继续从代理条目导入它们。

`define_deep_agent` 添加一个必需参数。传递 `name` 一个以字母开头且仅包含字母、数字、下划线或连字符的静态字符串。 Managed Deep Agents 使用它作为代理的图形 ID 和默认部署名称。

其余的移动到项目文件或成为运行时的工作：

| `create_deep_agent` |它去哪儿了|笔记|
| - | - | - |
| `system_prompt` | `instructions.md` |将文本移至文件中，然后删除参数。参见[Instructions](/langsmith/python/managed-deep-agents-instructions)。 |
| `skills` | `skills/` |每个技能一个目录，每个目录都有一个`SKILL.md`。参见[Skills](/langsmith/python/managed-deep-agents-skills)。 |
| `memory` | `memory.py` |导出`define_memory(scope="agent")`。如果没有持久内存，则省略该文件。参见[Memory](/langsmith/python/managed-deep-agents-memory)。 |
| `backend` | `sandbox/` |声明一个托管沙箱而不是构建后端。参见[Sandboxes](/langsmith/python/managed-deep-agents-sandboxes)。 |
| `permissions` |保留参数|已接受，并在项目声明沙箱时清除。参见[Permissions](/oss/python/deepagents/permissions)。 |
| `store`、`checkpointer` |托管运行时 |删除两者。 |
| `state_schema` |没有同等的 | `define_deep_agent`不接受。 |Deep Agents 后端是可插拔的，托管运行时提供自己的后端。声明 `sandbox/` 的项目会获得一个用于代理文件系统和 shell 的托管沙箱。没有代理的项目会获得线程范围的代理状态，以及用于指令、技能和内存的只读 [Context Hub](/langsmith/python/managed-deep-agents-context-hub) 安装。没有其他后端选择，因此依赖于特定后端的代理保留在 Deep Agents 上。

## 移动代理

就地转换项目。现有的布局、模块结构和依赖项保持原样：`mda build`将其所需的依赖项合并到项目清单中，而不是替换它。

要先安装`mda` CLI，请参阅[quickstart](/langsmith/python/managed-deep-agents-quickstart)。

<Steps>
  <Step title="Add the SDK to the project">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    uv add managed-deepagents
    ```

    固定版本以匹配 `mda --version` 报告的 CLI。

    如果项目使用 Hatchling 构建，则允许在 `pyproject.toml` 中直接引用：

    ```toml pyproject.toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    [tool.hatch.metadata]
    allow-direct-references = true
    ```

    `mda build` 将 `managed-deepagents` 要求重写为对其所暂存的运行时的路径引用，并且 Hatchling 默认情况下会拒绝该操作。如果没有设置，安装项目时`mda build`仍然成功，`mda dev`失败，`Dependency #N of field project.dependencies cannot be a direct reference`。由`mda init`搭建的项目声明没有构建后端，因此该设置仅在转换现有项目时出现。保留项目已声明的每个依赖项。工具和中间件不断导入它们一贯所做的事情。
  </Step>

  <Step title="Rewrite the agent entry">
    使用上表在项目根目录下名为 `agent.py` 的文件中转换调用站点：

    ```python agent.py (before) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from deepagents import create_deep_agent

    from tools.search import internet_search

    agent = create_deep_agent(
        model="openai:gpt-5.5",
        tools=[internet_search],
        system_prompt=SYSTEM_PROMPT,
        skills=["/skills/research/"],
        checkpointer=checkpointer,  # yours to construct and wire
    )
    ```

    ```python agent.py (after) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from managed_deepagents import define_deep_agent

    from tools.search import internet_search

    agent = define_deep_agent(
        name="research-assistant",
        model="openai:gpt-5.5",
        tools=[internet_search],
    )
    ```

    该条目必须导出一个名为 `agent` 的变量，并且定义调用本身必须位于该文件中。从另一个模块重新导出定义的根条目失败，错误名称为 `name` 而不是真正的问题。

    `src/` 布局就可以了。将包保留在原处并从根条目导入它们。
  </Step>

  <Step title="Move the prompt, skills, and memory into files">
    将系统提示符放在项目根目录下的`instructions.md`中。在 `skills/` 下为每个技能指定一个自己的目录，并带有 `SKILL.md`。

    如果代理需要跨线程保留的内存，请在导出名为 `memory` 的变量的根文件中声明它：

    ```python memory.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from managed_deepagents import define_memory

    memory = define_memory(scope="agent")
    ```

    持久内存是可选的，没有该文件的项目不会挂载任何内容。作用域是唯一的旋钮：`"agent"` 安装部署的每个调用者共享的一棵树。要控制代理保留的内容，请将内存策略写入`instructions.md`。参见[Guide what to remember](/langsmith/python/managed-deep-agents-memory#guide-what-to-remember)。<Warning>
      `define_memory` 安装一个空的内存树。旧的 `memory` 参数指向的文件中的内容不会传输，因此在删除这些文件之前，请将代理仍需要的任何内容移至 `instructions.md` 或技能中。
    </Warning>
  </Step>

  <Step title="Declare a sandbox">
    通过沙箱`backend`的代理需要托管沙箱声明。创建目录并声明它：

    ```python sandbox/__init__.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from managed_deepagents import define_sandbox

    sandbox = define_sandbox(
        idle_ttl_seconds=600,
        default_timeout=600,
    )
    ```

    <Warning>
      声明沙箱可以清除`permissions`。文件系统权限规则会禁用沙箱 `execute` 工具，因此运行时会删除规则而不是 shell。通过您提供的工具来限制沙盒代理。
    </Warning>

    要配置快照，请添加 `sandbox/setup.sh`。对于没有沙箱后端的代理，请跳过此步骤。参见[Sandboxes](/langsmith/python/managed-deep-agents-sandboxes)。
  </Step>

  <Step title="Declare identity">
    （可选）要为每个调用者提供私有线程和下游凭据，请添加根身份声明：

    ```python identity.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from managed_deepagents import auth, define_identity

    identity = define_identity(auth=auth.langsmith_api_key())
    ```

    如果没有该文件，部署将在没有托管身份验证的情况下运行，`mda dev` 报告为 `Identity none`。参见[Identity](/langsmith/python/managed-deep-agents-identity)。
  </Step>

  <Step title="Set credentials and ignore the build output">
    将模型和工具 API 密钥放入项目根目录下的 `.env` 文件中。不会读取 shell 中导出的值。对于共享工作区机密和 OAuth，请改用 [connections](/langsmith/python/managed-deep-agents-connections)。将构建目录添加到`.gitignore`：

    ```text .gitignore theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    .env
    .env.*
    .mda/
    ```

    `mda build` 将整个项目根目录复制到`.mda/build`，然后`mda deploy` 上传。代理条目旁边的任何内容都随代理一起提供，因此请将部署不需要的内容移出项目根目录。
  </Step>

  <Step title="Compile, then run">
    编译而不部署：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mda build
    ```

    然后本地启动：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mda dev
    ```

    <Note>
      `mda build` 不检查定义调用，因此即使托管参数仍然存在，它也会退出 0。当图形在 `mda dev` 下加载时，剩余参数就会出现。
    </Note>

    参见[Local development](/langsmith/python/managed-deep-agents-local-development)。
  </Step>

  <Step title="Deploy">
    上传项目并让LangSmith构建并托管它：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mda deploy
    ```

    参见[Deploy](/langsmith/python/managed-deep-agents-deploy)。
  </Step>
</Steps>

<Tip>
  开始一名新代理人而不是更换代理人？搭建整个项目，包括上面的identity、sandbox、`.env`、`.gitignore`文件：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  mda init research-assistant
  ```

  安装通道选择创作语言：npm 包脚手架 TypeScript，PyPI 包脚手架 Python。该命令创建一个新目录并且不会就地运行，因此它适合绿地项目而不是迁移。请参阅[quickstart](/langsmith/python/managed-deep-agents-quickstart)。
</Tip>

## 另请参阅* [Relationship to Deep Agents](/langsmith/python/managed-deep-agents-overview#relationship-to-deep-agents)：为什么两个入口点不同。
* [Agent definition](/langsmith/python/managed-deep-agents-agent-definition)：完整参数参考。
* [Project structure](/langsmith/python/managed-deep-agents-project-structure)：每个文件所在的位置。
* [Going to production](/oss/python/deepagents/going-to-production)：Deep Agents 的部署选项。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-migrate.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>