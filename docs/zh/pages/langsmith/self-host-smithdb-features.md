<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: SmithDB feature availability | https://docs.langchain.com/langsmith/self-host-smithdb-features -->

# SmithDB 功能可用性

LangSmith 在查询 ClickHouse 的自托管安装上不可用的功能，以及在没有 SmithDB 的情况下仍然可以使用的功能。

某些 LangSmith 功能仅从 [SmithDB](/langsmith/self-host-smithdb) 读取跟踪数据。在仍查询 ClickHouse 的自托管安装中，这些功能将被隐藏、禁用或回退到较旧的体验。使用此页面查看通过将查询移至 SmithDB 可以获得哪些好处，以及如果未将查询移至 SmithDB，哪些内容仍然有效。

<Note>
  ClickHouse 支持于 LangSmith v0.19 结束。升级时间请参见[self-hosted changelog](/langsmith/self-hosted-changelog)。
</Note>

## 检查查询是否使用SmithDB

此页面上的功能会在 LangSmith [queries SmithDB](/langsmith/self-host-smithdb-install#step-6-switch-queries-to-smithdb) 时开启。 [Dual ingestion](/langsmith/self-host-smithdb-install#step-4-enable-dual-ingestion) 单独无法启用它们。要检查当前设置，请读取 `sdb_query_enabled` 实例标志：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -s https://LANGSMITH_HOST/api/v1/info | jq '.instance_flags | {sdb_ingestion_enabled, sdb_query_enabled}'
```

SmithDB 是必要的，但并不总是足够的。功能还可能取决于您的 LangSmith 版本，并且某些功能在到达 LangSmith 云后会推出到自托管安装。每个功能的页面都会说明其自己的版本和区域可用性。

## 需要 SmithDB 的功能

几行涵盖了新版本的功能，该功能在没有 SmithDB 的情况下也可以使用。最后一列列出了在查询 ClickHouse 的安装中仍然可以使用的内容。|特色 |需要什么 SmithDB |没有SmithDB，什么可以工作？
| - | - | - |
| [Filter query syntax](/langsmith/filter-traces#query-syntax) |过滤器搜索栏和`field:value`查询语法，具有线程、根运行、单次运行和任何运行范围。 |使用旧函数式过滤器进行过滤。 |
| [Custom dashboard chart editor](/langsmith/dashboards#custom-dashboards) |当前的图表编辑器，具有模板、比率、每系列过滤器、分组、细分和图表钻取。 |使用 [custom dashboards (legacy)](/langsmith/dashboards#custom-dashboards-legacy) 创建自定义仪表板和图表以及预构建的仪表板。 |
| [Trajectory view](/langsmith/view-traces#trajectory-view) |跨回合、模型调用、工具和子代理的重复数据删除对话。还支持实验运行详细信息中线程和解析消息的 Markdown 导出。 |单次运行的跟踪检查和消息呈现。 |
| [Trajectory evaluators](/langsmith/online-evaluations-multi-turn#evaluate-trajectories) |使用 `trajectory` 变量对完整代理路径（包括子模型和工具调用）进行评分的在线评估器。 |读取根运行消息的运行评估器和线程评估器。 |
| [Threads in annotation queues](/langsmith/annotation-queues#assign-runs-and-threads-to-a-single-run-queue) |从线程视图将线程添加到注释队列，并查看线程项，显示其轨迹。 |运行级注释队列。 |
| [Threads in datasets](/langsmith/manage-datasets-in-application#manually-from-a-tracing-project) |将选定的线程（包括注释队列中的线程项）添加到数据集作为对话示例。 |将运行添加到数据集。 || [Thread automation rules](/langsmith/rules#set-the-item-type-to-runs-or-threads) |创建线程规则，将线程添加到注释队列或数据集，或发送[webhooks](/langsmith/webhooks#read-a-thread-rule-payload)。回填历史数据的线程规则。 |运行自动化规则。 |
|公共线程共享 |通过公共链接共享整个线程。 |与公共链接共享单个跟踪。 |
|大痕迹行动 |用于大型跟踪的分页跟踪树，将整个跟踪下载为 JSON，并从跟踪详细信息页面删除整个跟踪。 |查看跟踪、下载各个运行以及现有的删除工作流程。 |
| [LLM Gateway usage](/langsmith/llm-gateway-monitoring) | **使用情况**仪表板：支出摘要、图表、细分、过滤器和深入分析。 |网关路由和[policies](/langsmith/llm-gateway-spend-policies)。 |
|代理微量 |业务代表概览卡上的跟踪计数迷你图和业务代表概览上的跟踪量图表。 |代理部署、管理和其他代理统计。 |
| [Feedback in bulk exports](/langsmith/data-export#limit-exported-fields) |导出`feedbacks`字段，其中包含反馈键和评论。 |其他各个领域的批量出口。 |

跟踪、线程列表、数据集和实验可在任一数据存储上运行。

## 另请参阅

* [Enable SmithDB on self-hosted LangSmith](/langsmith/self-host-smithdb)
* [Install SmithDB](/langsmith/self-host-smithdb-install)
* [Migrate ClickHouse history to SmithDB](/langsmith/self-host-smithdb-migrate)
* [Migrate to SmithDB-backed SDK methods](/langsmith/smithdb-sdk-migration)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-features.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>