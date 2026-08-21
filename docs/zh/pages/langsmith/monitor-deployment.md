<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Monitor a deployment | https://docs.langchain.com/langsmith/monitor-deployment -->

# 监控部署

使用构建日志、代理服务器日志和运行时指标监控云部署。使用日志调查特定修订和指标以跟踪一段时间内的部署性能。

## 查看部署日志

每个修订版都包含构建日志和服务器日志。

<Tabs>
  <Tab title="LangSmith UI">
    从**部署**视图：

    1. 选择部署。
    1. 在 **修订版** 表中，选择一个修订版。详细信息面板打开，并选择 **Build** 选项卡。
    1. 查看构建日志。
    1. 选择“**服务器**”选项卡以查看服务器日志。服务器日志在 LangSmith 部署修订版后可用。
    1. 根据需要调整日期和时间范围。默认范围是**过去 7 天**。
  </Tab>
  <Tab title="LangGraph CLI">
    要查看服务器日志，请运行：

    ```shell
    langgraph deploy logs
    ```

    要查看构建日志，请运行：

    ```shell
    langgraph deploy logs --type build
    ```

    要流式传输新日志，请运行：

    ```shell
    langgraph deploy logs --follow
    ```

    按时间范围、日志级别或搜索字符串过滤日志：

    ```shell
    langgraph deploy logs --start-time 2026-03-01T00:00:00Z --level ERROR
    ```

    要选择部署，请传递其名称或 ID：

    ```shell
    langgraph deploy logs --name my-agent
    langgraph deploy logs --deployment-id <DEPLOYMENT_ID>
    ```

    对于所有选项，请参阅[⟦T5⟧ CLI reference](/langsmith/cli#deploy-logs)。
  </Tab>
</Tabs>

## 将服务器日志转发到 Datadog

要将代理服务器日志转发到 Datadog，请在部署上配置以下环境变量或密钥：- **`DD_API_KEY`**：你的[Datadog API key](https://docs.datadoghq.com/account_management/api-app-keys/)。
- **`DD_LOGS_ENABLED=true`**：启用日志转发。

要将日志与跟踪关联起来，还需设置 `DD_LOGS_INJECTION=true`。有关所有支持的 Datadog 变量，请参阅[Supported Datadog environment variables](/langsmith/env-var#dd_api_key)。

## 查看部署指标

查看部署指标：

1. 从[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-monitor-deployment)，选择**部署**。
1. 选择部署。
1. 选择**监控**选项卡。有关指标定义，请参阅[Control plane monitoring](/langsmith/control-plane#monitoring)。
1. 根据需要调整日期和时间范围。默认范围是**过去 15 分钟**。

## 另请参阅

- [Revisions](/langsmith/deployment-revisions)
- [Manage a deployment](/langsmith/manage-deployment)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/monitor-deployment.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>