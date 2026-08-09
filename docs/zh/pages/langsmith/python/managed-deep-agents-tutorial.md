<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a scheduled research agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-tutorial -->

# 构建一个预定的研究代理

使用工具、持久内存和每日计划构建托管深度代理，然后进行部署。

本教程一次培养研究助理的一项能力。首先完成[quickstart](/langsmith/python/managed-deep-agents-quickstart)来搭建项目，添加API密钥，然后在本地运行`mda dev`。然后添加搜索工具，使用持久内存，按每日计划运行代理，并将其部署到 LangSmith。

<Note>
  托管深度代理在 **公共 [beta](/langsmith/release-stages)** 中提供，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 构建代理

<Steps>
  <Step title="Write the instructions">
    将 `instructions.md` 替换为研究助理的行为。这些说明引用了您接下来添加的工具以及您在本教程后面显式启用的共享持久内存：

    ```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Research assistant

    You are a careful research assistant. Find sources, keep notes, and return
    concise answers with citations.

    ## Behavior

    - Use the `web_search` tool to find sources instead of guessing.
    - Cite the sources you used.

    ## Memory

    - Record reusable research procedures and project knowledge that can improve future work.
    - For release research, check the project's official changelog before secondary sources.
    - Never store personal data or secrets in memory.
    ```
  </Step>

  <Step title="Add a search tool">
    使用搜索工具创建一个`tools/`模块，然后将其导入到代理条目中。此示例返回一个占位符结果，因此它无需外部 API 即可运行。将正文替换为对您的搜索提供商的调用。

    ```python tools/search.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.tools import tool


    @tool(parse_docstring=True)
    def web_search(query: str) -> str:
        """Search the web for a query and return result snippets.

        Args:
            query: The search query.
        """
        # Replace this stub with a call to your search provider.
        return f"Top results for '{query}': ..."
    ```

    将工具导入到代理条目中并将其传递给定义：

    ```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from managed_deepagents import define_deep_agent

    from tools.search import web_search

    agent = define_deep_agent(
        name="research-assistant",
        model="openai:gpt-5.5",
        tools=[web_search],
    )
    ```

    有关创作工具的更多信息，请参阅[Custom tools](/langsmith/python/managed-deep-agents-tools)。
  </Step>

  <Step title="Run the agent locally">
    安装依赖项并启动本地开发服务器：

    ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    uv sync
    mda dev .
    ````mda dev` 在 LangSmith Studio 中打开代理。发送问题并确认客服人员致电 `web_search` 并使用返回的片段进行回答。
  </Step>

  <Step title="Enable and use durable memory">
    持久内存是可选的。在要求代理记住任何内容之前，请在项目根目录添加内存声明：

    ```python memory.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from managed_deepagents import define_memory

    memory = define_memory(scope="agent")
    ```

    内存在整个部署中共享，并且对所有调用者可见，因此不要存储个人数据或机密。

    重新启动`mda dev`，以便它发现新文件。在一个线程中，要求代理研究版本并记录可重用的项目规则，例如“对于版本研究，请在二手源之前检查官方变更日志”。然后在 Studio 中创建一个 **新线程** 并询问它将如何研究下一个版本。即使新线程没有对话历史记录，也请确认它应用了共享规则。

    详情请参阅[Memory](/langsmith/python/managed-deep-agents-memory)。
  </Step>

  <Step title="Schedule a daily digest">
    添加 `schedules/` 模块，以便代理按 cron 节奏运行，无需用户消息。该时间表在太平洋时间每个工作日上午 8 点运行：

    ```python schedules/daily_digest.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from managed_deepagents import define_schedule

    schedule = define_schedule(
        cron="0 8 * * 1-5",
        timezone="America/Los_Angeles",
        prompt="Summarize what you learned yesterday and list open questions.",
    )
    ```

    部署上线后，`mda deploy` 将此计划协调到 LangSmith cron 作业中。有关线程行为和约束，请参阅[Schedules](/langsmith/python/managed-deep-agents-schedules)。
  </Step>

  <Step title="Deploy the agent">
    将项目部署到 LangSmith：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mda deploy .
    ```成功后，CLI 将打印部署仪表板 URL。部署将指令同步到 Context Hub、上传已编译的项目并协调每日计划。有关部署标志和故障排除，请参阅 [Deploy an agent](/langsmith/python/managed-deep-agents-deploy) 和 [CLI reference](/langsmith/python/managed-deep-agents-cli#deploy-projects)。
  </Step>

  <Step title="Inspect the run">
    在 LangSmith 中打开打印的 URL 以检查构建状态和修订。打开跟踪来检查代理的输入、模型调用、`web_search` 调用、内存读写以及最终响应。
  </Step>
</Steps>

## 后续步骤

<CardGroup>
  <Card title="Custom middleware" icon="code" href="/langsmith/python/managed-deep-agents-middleware">
    围绕模型和工具调用添加日志记录、重试、限制和护栏。
  </Card>

  <Card title="Identity" icon="fingerprint" href="/langsmith/python/managed-deep-agents-identity">
    对调用者进行身份验证并在工具和中间件中使用经过验证的身份。
  </Card>

  <Card title="Memory" icon="brain" href="/langsmith/python/managed-deep-agents-memory">
    跨线程保留共享的程序和项目知识。
  </Card>

  <Card title="Evals" icon="flask" href="/langsmith/python/managed-deep-agents-evals">
    编写 Harbor 任务并编译 Harbor 的托管代理。
  </Card>

  <Card title="Sandboxes" icon="box" href="/langsmith/python/managed-deep-agents-sandboxes">
    为代理工作配置隔离文件系统和 shell 访问。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-tutorial.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>