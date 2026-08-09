<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage a trace | https://docs.langchain.com/langsmith/manage-trace -->

# 管理跟踪

公开共享跟踪，并从 LangSmith 的详细信息视图中查看服务器日志。

您可以将 [share a trace publicly](#share-a-trace) 和 [view the server logs](#view-server-logs) 与跟踪执行相关联。

## 分享痕迹

<Warning>
  **公开共享跟踪将使任何知道该链接的人都可以访问它。确保您没有共享敏感信息。**

  如果您的 [self-hosted](/langsmith/self-hosted) LangSmith 部署位于 VPC 内，则只有在您的 VPC 内经过身份验证的成员才能访问公共链接。为了增强安全性，我们建议使用只有有权访问您的网络的用户才能访问的私有 URL 配置您的实例。
</Warning>

公开共享跟踪：

1. 打开[UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-manage-trace) 中的任意迹线。
2. 单击“详细信息”视图顶部的“更多<Icon icon="dots-vertical" />”菜单中的“**共享**”按钮。
3. 在出现的对话框中，复制公共链接。

任何有链接的人都可以访问共享跟踪，即使没有 LangSmith 帐户也是如此。他们可以查看跟踪但不能编辑它。

要取消共享跟踪，请使用以下方法之一：1. 打开共享跟踪，单击“详细信息”视图顶部工具栏中的“**公共**”，然后单击对话框中的“**取消共享**”。
2. 转到 **设置** → **共享 URL** 以查看所选工作区中所有公开共享的跟踪。单击要取消共享的跟踪旁边的 **取消共享**。

## 查看服务器日志

<Note>
  查看服务器日志以进行跟踪仅适用于 [Cloud SaaS](/langsmith/cloud) 和 [fully self-hosted](/langsmith/self-hosted) 部署选项。
</Note>

查看由 LangSmith 中的运行生成的跟踪时，您可以直接从“详细信息”视图访问关联的服务器日志。

在“详细信息”视图中，使用右上角“**在 Studio 中运行**”按钮旁边的“**查看日志**”按钮。

单击此按钮将带您进入 LangSmith 中关联部署的服务器日志视图。

服务器日志视图显示来自以下两者的日志：

* **Agent Server自身的操作日志**：内部服务器操作、API调用和系统事件
* **用户应用程序日志**：在图表中写入的日志包括：
  * Python：使用`logging`或`structlog`库。
  * JavaScript：使用从`@langchain/langgraph-sdk/logging`重新导出的Winston记录器：

    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { getLogger } from "@langchain/langgraph-sdk/logging";

    const logger = getLogger();
    logger.info("Your log message");
    ```当您从“详细信息”视图导航时，**过滤器**框将自动预填充您刚刚查看的跟踪中的跟踪 ID，因此您可以快速过滤日志以仅查看与特定跟踪执行相关的日志。

<img alt="Deployment server logs filters" />

## 删除痕迹

如果您需要在过期日期之前从 LangSmith 中删除跟踪，您可以删除整个项目或删除特定跟踪。

### 删除整个项目

* 在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-manage-trace) 中，选择项目溢出菜单上的 **删除** 选项。
* 使用 [⟦T4⟧](/langsmith/smith-api/tracer-sessions/delete-tracer-session) API 端点。
* 使用 LangSmith SDK 中的 `delete_project()` ([Python](https://reference.langchain.com/python/langsmith/observability/sdk/)) 或 `deleteProject()` ([JS/TS](https://reference.langchain.com/javascript/modules/langsmith.html))。

### 删除特定痕迹：

使用 [⟦T7⟧](/langsmith/smith-api/run/delete-runs) API 端点可按跟踪 ID 或元数据键值对删除运行。请求正文接受：

* `session_id`：范围删除到特定项目。
* `trace_ids`：要删除的跟踪 ID 列表。
* `metadata`：删除与给定元数据键值对匹配的所有运行。

有关完整的 API 使用情况，包括代码示例、每个请求 1000 条跟踪限制、删除时间线和元数据匹配行为，请参阅[Data purging for compliance](/langsmith/data-purging-compliance#trace-deletes)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/manage-trace.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>