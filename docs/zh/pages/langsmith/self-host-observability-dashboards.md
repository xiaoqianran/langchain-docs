<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Monitor self-hosted LangSmith with Datadog or Grafana | https://docs.langchain.com/langsmith/self-host-observability-dashboards -->

# 使用 Datadog 或 Grafana 监控自托管 LangSmith

将选项卡式 SmithDB 和 Sandbox 仪表板导入您自己的监控实例并配置组件遥测收集。

LangSmith 自托管仪表板将运营指标分组到 SmithDB 和 Sandboxes 选项卡中。使用它们从每个监控平台的一个仪表板监控基础设施中运行的组件。

从[LangSmith observability bundle](https://github.com/langchain-ai/helm/tree/main/charts/langsmith/examples/langsmith-observability)下载定义和集合示例。将它们导入您自己的 Datadog 组织或 Grafana 实例中。从存储库下载这些文件，而不是 Helm 图表存档。下载内容包含查询，而不是遥测或对 LangChain 托管监控的访问。

## 选择一个平台

这两个仪表板共享组件组织，但它们的数据源和覆盖范围不同。|覆盖范围|数据狗 | Grafana 与 Prometheus |
| - | - | - |
| SmithDB 指标和 LangSmith 摄取路径 |包含 |包含 |
|沙盒主机容量、生命周期、执行、资源、网络和运行状况 |包含 |包含 |
| JuiceFS 挂载指标 |可选单独刮|可选单独刮|
|沙箱 API/APM 视图 |可选的 Datadog APM |不包括在内|
| AWS/GCP 存储桶指标 |可选的云集成 |不包括在内|

Grafana 的 Sandbox 选项卡不假设 Prometheus 中存在 Datadog 派生的指标。主机端命令计数和持续时间在没有 APM 的情况下仍然可用。抓取时间、汇总和计数器外推的差异也意味着平台可以显示不同的数值。

## 检查先决条件

使用现有的[self-hosted LangSmith deployment](/langsmith/deploy-self-hosted-full-platform)和监控装置。仅对您操作的组件启用收集。这些示例不安装监控软件或启用 SmithDB 或沙箱。* **Datadog**：使用具有 Kubernetes 自动发现和 [OpenMetrics integration](https://docs.datadoghq.com/integrations/openmetrics/) 的代理。沙箱注释需要 Agent 7.36 或更高版本。
* **Grafana**：将 Grafana 13 或更高版本用于本机选项卡和 V2 仪表板资源格式。配置现有的 Prometheus 数据源。
* **专用连接**：收集器需要访问组件指标端点。不要通过公众进入暴露它们。沙箱主机使用节点网络，因此通过节点防火墙配置来限制访问。
* **权限**：您需要导入仪表板和更新集合配置的权限。 Prometheus Pod 发现需要访问所选的 Kubernetes 命名空间。

通过现有的监控安装（而不是示例）配置凭据。保留收集器的容忍度，以便收集也在专用的沙箱节点上运行。

对于Sandbox收集，图表必须支持`sandboxes.sandboxHost.deployment.podAnnotations`，并且部署必须使用`sandbox-host` Firecracker运行时。检查已安装图表的值架构。较旧的运行时版本可能不会发出每个指标。

## 收集组件指标

每个组件在捆绑包的 `components/` 目录下都有自己的配置。

### 史密斯数据库遵循 [Configure SmithDB observability](/langsmith/self-host-smithdb-observability) 并使用 `components/smithdb/` 中适当的集合示例。这些示例还从摄取队列和平台后端收集摄取路径指标。

Datadog 下载默认使用 SmithDB 指标的 `smithdb.` 前缀； Grafana 使用原始的 Prometheus 名称。公制含义请参见[SmithDB metrics reference](/langsmith/self-host-smithdb-metrics)。 Datadog 的 SmithDB 错误日志面板还需要匹配`service:smithdb*` 的日志。

如果您的收集器使用其他命名空间，请从 Helm 存储库的本地副本重新生成仪表板：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
python3 charts/langsmith/examples/langsmith-observability/generate_dashboards.py \
  --smithdb-metrics-prefix custom_smithdb.
```

包含尾随点，或传递 `--smithdb-metrics-prefix ''` 以获取无前缀的 SmithDB 指标。该选项仅更改 Datadog 导出中的 SmithDB 指标名称及其前缀注释。 Grafana、沙盒查询、无前缀 `langsmith_*` 指标和日志过滤器保持不变。

生成器不会修改收集设置。将 SmithDB OpenMetrics 命名空间与前缀相匹配：使用 `namespace: custom_smithdb` 作为示例，或者使用空命名空间来表示无前缀的指标。

### 带有 Datadog 的沙箱

沙盒主机在端口 `19190` 上导出指标。收集并导入它们：1. 下载根`datadog-dashboard.json`和`components/sandboxes/datadog-values.yaml`中的值。
2. 将 OpenMetrics 注释合并到现有的版本值中。 Helm 字符串替换整个注释，而不是单个 JSON 实例。协调现有检查以避免重复抓取。
3. 使用您当前运行的相同图表版本通过发布管理器应用这些值。 Pod 注释更改会滚动沙箱主机 Pod 并暂停其正在运行的沙箱。在维护时段安排此更新。
4. 检查Agent的抓取状态，确认`langsmith_sandbox_host_live_sandboxes`和`langsmith_sandbox_host_juicefs_mount_ready`到达Datadog。
5. 导入仪表板 JSON 并打开 Sandboxes 选项卡。

主机示例未添加指标命名空间前缀。 Datadog 计数器使用 `.count` 而不是 `_total`。该集合保留了直方图`.sum`和`.count`系列以及分布；主机持续时间图表使用这些来计算平均值。查看 Datadog 计划中的自定义指标使用情况和标签基数。

### Grafana 沙盒

Grafana 选项卡使用来自主机和可选 JuiceFS 安装的 Prometheus 指标。配置集合：1. 将 `components/sandboxes/prometheus/host-scrape.yaml` 中的 `scrape_configs` 条目合并到现有的 Prometheus 配置中。该文件不是 Helm 值。
2. 替换命名空间和集群占位符。每个主机侦听器保留一项抓取作业。该示例选择 `sandbox-host` 容器及其声明的 `19190` 端口，并附加命名空间、集群、pod 和实例标签。
3. 在验证对端口 `9567` 上挂载指标侦听器的私有访问后，可以选择合并 `juicefs-scrape.yaml`。
4. 检查目标运行状况并确认主机指标到达 Prometheus。
5. 导入根`grafana-dashboard.json`。选择共享数据源和命名空间，然后选择沙盒集群。如果组件占用不同的命名空间，请选择两个命名空间。

这些示例使用 `scrape_protocols` 请求 Prometheus 文本格式，保留 JuiceFS 计数器命名。它们经过 Prometheus 3.5.0 验证；如果您运行旧版本，请检查配置兼容性。这些文件不会创建额外的 Kubernetes 权限或公共网络资源。

## 选择您的部署共享选择器适用于遥测具有相同含义的组件选项卡。在解释就绪主机或所需副本计数之前，仅选择一个沙盒池。您可以包含单独的 SmithDB 命名空间，而无需选择其他沙盒池。

|数据狗过滤器|标签 |范围 |
| - | - | - |
| `env` | `env` | SmithDB、Sandbox 主机、JuiceFS 和 APM |
| `cluster` | `cluster_name` 用于 SmithDB； `kube_cluster_name` 用于 Sandbox 主机和 JuiceFS |共享集群选择 |
| `namespace` | `kube_namespace` | SmithDB、Sandbox 主机和 JuiceFS |
| `api_service` | `service` |仅限沙箱 APM |
| `gcs_bucket` | `bucket_name` |仅限 GCS 存储 |
| `s3_bucket` | `bucketname` |仅限 S3 存储 |

默认情况下，Datadog 集群选择器会发现`cluster_name` 中的值。如果您的帐户仅公开 `kube_cluster_name`，请将其用作选择器的标签键。查询将 `$cluster.value` 与每个组件的显式标记键一起使用，因此更改选择器不会重新标记指标。标签键必须使用匹配的集群名称值。如果您的指标使用其他标签键，还需更新相关的查询过滤器和 group-by 子句。APM仅使用`env`和`api_service`；云指标使用其存储桶选择器。 API 服务和存储桶选择器遵循共享过滤器。 Datadog 将溢出控件放置在其附加变量菜单中。

Grafana 显示了三个控件：数据源、命名空间和沙盒集群。数据源和命名空间适用于这两个选项卡。命名空间列表包括SmithDB和Sandbox指标命名空间，并支持多种选择。沙箱集群仅适用于沙箱，因为 SmithDB 集合示例不保证 `cluster` 标签。

Grafana `sandbox_job` 和 `juicefs_job` 变量默认为 All，并且在普通标头中隐藏。编辑其保存的值或在变量设置中取消隐藏它们以区分收集作业。即使这些过滤器选择“全部”，也可以避免重复抓取。具有单独 Prometheus 后端的安装必须自定义组件面板和可变数据源引用；默认捆绑包使用一个后端。

仪表板过滤器不是访问控制；使用监控实例的权限来控制对遥测的访问。

## 阅读沙盒面板仪表板将最近的车队快照与历史趋势区分开来。他们精心设计的网格混合了面板宽度，而不是强制使用两列。紧凑趋势共享三面板行。密集图表和存储比较使用半宽面板，长标签排名有更多空间。标题卡在一个部分有两张时保持配对。

* **舰队快照**：计数和主机排名使用五分钟面板窗口。 Datadog 每个主机样本最多对齐 60 秒。 Grafana 在范围末端评估快照仪表，并要求在 60 秒内提供样本。
* **池计数**：就绪和所需计数使用`max`，而不是添加连续的领导者报告。它们描述的是一个选定的池，而不是跨池的总数。所需副本目标仅在自动缩放处于活动状态时更新。
* **计数**：排名和错误总数遵循所选范围。 Grafana 在聚合之前使用 `increase` 来处理计数器重置。它的计数可能是小数，因为 Prometheus 推断了刮擦边界。
* **持续时间**：主机图表显示平均值，而不是百分位数。 Datadog 公共 HTTP 端点排名使用整个窗口 p95，而不是间隔百分位数的平均值。Grafana 时间序列计数面板显示超过 `$__rate_interval` 的滚动增长，而不是不相交的 Datadog 存储桶。图例统计总结了标绘点，而不是整个范围的事件加权统计。故障摘要包括没有记录阶段的错误。缺失数据意味着未知，而不是零。

## 配置可选遥测

JuiceFS 与主机分开导出`juicefs_*` 指标。对于 Datadog，`datadog-juicefs-values.yaml` 替换仅主机值文件并收集两个侦听器。对于 Prometheus，添加单独的 JuiceFS 作业。

JuiceFS 默认为环回。这些示例不会更改其侦听器。如果更改绑定地址，请将其限制为预期的专用网络并保留现有的挂载选项。挂载配置更改还需要主机转出。单独配置外部管理的安装并避免重复抓取。由于稀疏图像和写时复制克隆，逻辑文件系统大小与物理存储桶使用情况不同。Datadog 的可选 API 小部件使用 `trace.http.request`、`trace.http.request.hits` 和 `trace.http.request.errors`。按照[Export LangSmith telemetry](/langsmith/export-backend#traces)并选择一个`api_service`以避免重复计算。验证您帐户中的名称，因为 OpenTelemetry 检测可能有所不同。公共 API 面板不包括内部报告，内部报告有自己的部分。 HTTP 延迟不包括流媒体和服务代理流量；单独的面板显示连接持续时间。 APM 错误标志和 HTTP 5xx 响应是单独的信号。

对于 Datadog 存储桶面板，启用适当的 AWS 或 GCP 集成并选择确切的 JuiceFS 存储桶。占位符默认选择不存储桶。 Grafana 提供的 Sandbox 选项卡不包括这些 API/APM 或提供程序存储集成。

## 预览 Datadog Sandbox 选项卡

Datadog 预览显示共享过滤器、组件选项卡和彩色沙盒部分。其图表显示匿名开发遥测，而不是性能基准。

<img alt="Datadog dashboard with shared deployment filters, SmithDB and Sandboxes tabs, colored sections, and boot-path charts" />

<Accordion title="Public API traffic and latency">
  <img alt="Sandbox API requests by status, latency percentiles, and endpoint rankings" />
</Accordion>

<Accordion title="Lifecycle operations and failures">
  <img alt="Sandbox operation errors, operation rates, and creation duration by outcome and stage" />
</Accordion>

## 预览 Grafana Sandbox 选项卡

Grafana 预览显示共享过滤器和混合宽度沙盒面板。它的图表使用合成示例数据，而不是实时遥测或性能基准。

<img alt="Grafana dashboard with shared data source and namespace selectors, component tabs, and mixed-width Sandbox charts" />

## 更新现有仪表板在导入替换仪表板之前备份自定义仪表板。 Datadog JSON 导入会覆盖现有的仪表板内容。统一的 Grafana 导出使用与旧版 SmithDB 仪表板不同的 UID；保存前检查导入目的地。

之前的`smithdb-observability/`目录已被删除。更新书签和自动化以使用统一捆绑包的下载路径；已导入的仪表板不受影响。

对于没有本机选项卡的 Grafana 安装，请下载 [standalone SmithDB dashboard in Classic format](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/langsmith-observability/components/smithdb/grafana.json)。它仅包含 SmithDB 面板。这些仪表板示例不需要已弃用的 LangSmith Observability Helm 图表。

## 解决丢失数据的问题

在解释空故障图之前检查收集器的运行状况和连续导出的仪表。在事件发生之前，计数器可能没有序列。在抓取之前退出的进程可能会丢失其最终的计数器增量；调查出口时检查日志。

对于空的可选部分，请在更改运行时之前检查集成可用性、指标名称和选择器值。

## 另请参阅

* [Export LangSmith telemetry](/langsmith/export-backend)
* [Configure SmithDB observability](/langsmith/self-host-smithdb-observability)
* [Configure an observability collector](/langsmith/langsmith-collector)
* [LangSmith sandboxes](/langsmith/sandboxes)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-observability-dashboards.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>