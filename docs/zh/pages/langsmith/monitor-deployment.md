<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Monitor an Agent Server | https://docs.langchain.com/langsmith/monitor-deployment -->

# 监控代理服务器

查看 LangSmith 云上代理服务器的构建日志、服务器日志和指标。

使用构建日志、代理服务器日志和运行时指标监控LangSmith云上的代理服务器。使用日志调查特定修订和指标以跟踪代理服务器随时间的性能。

## 查看代理服务器日志

每个修订版都包含构建日志和服务器日志。

> [选项卡] LangSmith 用户界面
>
> 从 **代理服务器** 视图：
>
> 1. 选择代理服务器。
> 2. 在 **修订版** 表中，选择一个修订版。详细信息面板打开，并选择 **Build** 选项卡。
> 3. 查看构建日志。
> 4. 选择**服务器**选项卡以查看服务器日志。服务器日志在 LangSmith 部署修订版后可用。
> 5. 根据需要调整日期和时间范围。默认范围是**过去 7 天**。

> [选项卡] LangGraph CLI
>
> 要查看服务器日志，请运行：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langgraph deploy logs
> ```
>
> 要查看构建日志，请运行：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langgraph deploy logs --type build
> ```
>
> 要流式传输新日志，请运行：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langgraph deploy logs --follow
> ```
>
> 按时间范围、日志级别或搜索字符串过滤日志：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langgraph deploy logs --start-time 2026-03-01T00:00:00Z --level ERROR
> ```
>
> 要选择代理服务器，请传递其名称或 ID：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langgraph deploy logs --name my-agent
> langgraph deploy logs --agent-server-id <AGENT_SERVER_ID>
> ```
>
> 对于所有选项，请参阅[⟦T5⟧ CLI reference](/langsmith/cli#deploy-logs)。

## 将服务器日志转发到 Datadog要将代理服务器日志转发到 Datadog，请在代理服务器上配置以下环境变量或密钥：

* **`DD_API_KEY`**：您的[Datadog API key](https://docs.datadoghq.com/account_management/api-app-keys/)。
* **`DD_LOGS_ENABLED=true`**：启用日志转发。

要将日志与跟踪关联起来，还需设置 `DD_LOGS_INJECTION=true`。有关所有支持的 Datadog 变量，请参阅[Supported Datadog environment variables](/langsmith/env-var#dd_api_key)。

## 查看代理服务器指标

要查看代理服务器指标：

1. 从[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-monitor-deployment)，选择**代理服务器**。
2. 选择代理服务器。
3. 选择**监控**选项卡。有关指标定义，请参阅[Control plane monitoring](/langsmith/control-plane#monitoring)。
4. 根据需要调整日期和时间范围。默认范围是**过去 15 分钟**。

## 另请参阅

* [Revisions](/langsmith/deployment-revisions)
* [Manage an Agent Server](/langsmith/manage-deployment)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/monitor-deployment.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。