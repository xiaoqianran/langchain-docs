<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add memory and a schedule to your research assistant | https://docs.langchain.com/langsmith/python/managed-deep-agents-tutorial -->

# 为你的研究助理添加记忆和日程表

从快速入门中向研究助理添加持久内存和每日日程安排，然后进行部署。

本教程从[quickstart](/langsmith/python/managed-deep-agents-quickstart)继续。使用您在此处创建的 `research-assistant` 项目，以及您的模型、说明、搜索工具和有效的 `mda dev` 设置。

`mda init` 还可以搭建`identity` 和 `sandbox/` 等文件。保持原样；本教程不会改变它们。

本指南向您展示如何启用持久内存和每日计划，然后进行部署。您还可以选择添加自定义工具。

<Note>
  托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 扩展代理

<Steps>
  <Step title="Update the instructions for memory">
    扩展`instructions.md`，以便代理知道要保留哪些共享知识。保留快速入门中的研究行为并添加内存策略：

    ```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Research assistant

    You are a careful research assistant. Use internet search to find sources,
    keep notes, and return concise answers with citations.

    ## Memory

    - Record reusable research procedures and project knowledge that can improve future work.
    - For release research, check the project's official changelog before secondary sources.
    - Never store personal data or secrets in memory.
    ```
  </Step>

  <Step title="Enable and use durable memory">
    持久内存是可选的。在要求代理记住任何内容之前，请在项目根目录添加内存声明：

    ```python memory.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from managed_deepagents import define_memory

    memory = define_memory(scope="agent")
    ```

    内存在整个部署中共享，并且对所有调用者可见，因此不要存储个人数据或机密。重新启动`mda dev`，以便它发现新文件。在一个线程中，要求代理研究版本并记录可重用的项目规则，例如“对于版本研究，请在二手源之前检查官方变更日志”。然后在 Studio 中创建一个 **新线程** 并询问它将如何研究下一个版本。即使新线程没有对话历史记录，也请确认它应用了共享规则。

    详情请参阅[Memory](/langsmith/python/managed-deep-agents-memory)。
  </Step>

  <Step title="(Optional) Add a custom tool">
    提供商搜索涵盖开放网络。编写的工具涵盖您的应用程序逻辑：私有 API、数据库和内部数据。在`tools/`下创建一个模块，将其导入代理条目，并将其添加到现有搜索工具旁边的`tools`列表中。

    此示例返回占位符项目记录，因此它无需外部 API 即可运行。将正文替换为对系统的调用。

    ```python tools/projects.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.tools import tool


    @tool(parse_docstring=True)
    def lookup_tracked_project(project: str) -> str:
        """Look up an internally tracked project by name.

        Args:
            project: Project or product name to look up.
        """
        # Replace this stub with a call to your project catalog or database.
        return (
            f"Project '{project}': status=active, owners=docs, "
            f"changelog=https://example.com/{project}/changelog"
        )
    ```

    将自定义工具附加到现有搜索工具旁边，保留快速入门`model`，然后选择与您的搜索设置匹配的选项卡：

    <Tabs>
      <Tab title="Provider search">
        开放`agent.py`：

        <CodeGroup>
          ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          from managed_deepagents import define_deep_agent

          from tools.projects import lookup_tracked_project

          agent = define_deep_agent(
              name="research-assistant",
              model="openai:gpt-5.5",
              tools=[
                  {"type": "web_search"},
                  lookup_tracked_project,
              ],
          )
          ```

          ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          from managed_deepagents import define_deep_agent

          from tools.projects import lookup_tracked_project

          agent = define_deep_agent(
              name="research-assistant",
              model="google_genai:gemini-3.6-flash",
              tools=[
                  {"google_search": {}},
                  lookup_tracked_project,
              ],
          )
          ```

          ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          from managed_deepagents import define_deep_agent

          from tools.projects import lookup_tracked_project

          agent = define_deep_agent(
              name="research-assistant",
              model="anthropic:claude-sonnet-4-6",
              tools=[
                  {"type": "web_search_20260209", "name": "web_search"},
                  lookup_tracked_project,
              ],
          )
          ```
        </CodeGroup>
      </Tab>

      <Tab title="Tavily">
        打开`agent.py`。保持您的快速入门`model`值：<CodeGroup>
          ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          from managed_deepagents import define_deep_agent

          from tools.projects import lookup_tracked_project
          from tools.search import internet_search

          agent = define_deep_agent(
              name="research-assistant",
              model="provider:model",
              tools=[internet_search, lookup_tracked_project],
          )
          ```
        </CodeGroup>
      </Tab>
    </Tabs>

    如果`mda dev`已经在运行，请重新启动它。在 Studio 中，询问所跟踪项目的状态并确认代理呼叫 `lookup_tracked_project`。
  </Step>

  <Step title="Schedule a daily digest">
    添加 `schedules/` 模块，以便代理按 cron 节奏运行，无需用户消息。该时间表在太平洋时间每个工作日上午 8 点运行：

    ```python schedules/daily_digest.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from managed_deepagents import define_schedule

    schedule = define_schedule(
        cron="0 8 * * 1-5",
        timezone="America/Los_Angeles",
        prompt=(
            "Review durable memory for reusable research rules. "
            "Summarize anything useful, then list open questions for today."
        ),
    )
    ```

    如果第一次触发时内存为空，代理仍会返回未解决的问题。

    部署上线后，`mda deploy` 将此计划协调为 LangSmith cron 作业。在下一步中部署后，您应该会看到：

    * `mda deploy` 在没有进度错误的情况下完成（不要通过`--no-wait`，否则进度不协调）。
    * 部署中此文件的托管 cron。计划名称与模块主干匹配：`daily_digest` (Python) 或 `daily-digest` (TypeScript)。
    * 此 cron 没有立即运行摘要。第一场火灾要等到工作日美国/洛杉矶 8:00 才会发生。

    有关线程行为和约束，请参阅[Schedules](/langsmith/python/managed-deep-agents-schedules)。
  </Step>

  <Step title="Deploy and inspect">
    将项目部署到LangSmith：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mda deploy .
    ```成功后，CLI 将打印部署仪表板 URL。部署将指令同步到 Context Hub、上传已编译的项目并协调每日计划。

    打开该 URL 并确认：

    * 部署已准备就绪。
    * `daily_digest` 或 `daily-digest` cron 存在。
    * 测试聊天运行显示模型调用、搜索或自定义工具调用以及跟踪中的内存读取或写入。

    有关部署标志和故障排除，请参阅 [Deploy an agent](/langsmith/python/managed-deep-agents-deploy) 和 [CLI reference](/langsmith/python/managed-deep-agents-cli#deploy-projects)。
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

  <Card title="Evals" icon="flask" href="/langsmith/python/managed-deep-agents-evals">
    编写 Harbor 任务并编译 Harbor 的托管代理。
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