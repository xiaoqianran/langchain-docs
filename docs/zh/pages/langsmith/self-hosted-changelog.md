<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-hosted LangSmith changelog | https://docs.langchain.com/langsmith/self-hosted-changelog -->

# 自托管 LangSmith 变更日志

<Callout icon="rss">
  **订阅**：我们的变更日志包括一个 [RSS feed](https://docs.langchain.com/langsmith/self-hosted-changelog/rss.xml)，可以与 [Slack](https://slack.com/help/articles/218688467-Add-RSS-feeds-to-Slack)、[email](https://zapier.com/apps/email/integrations/rss/1441/send-new-rss-feed-entries-via-email)、Discord 机器人（如 [Readybot](https://readybot.io/) 或 [RSS Feeds to Discord Bot](https://rss.app/en/bots/rssfeeds-discord-bot)）以及其他订阅工具集成。
</Callout>

[Self-hosted LangSmith](/langsmith/self-hosted) 是企业计划的附加项目，专为我们最大、最注重安全的客户而设计。欲了解更多详情，请参阅[Pricing](https://www.langchain.com/pricing)。 [Contact our sales team](https://www.langchain.com/contact-sales) 如果您想获得许可证密钥以在您的环境中试用LangSmith。

<Update label="2026-10-02">
  ## langsmith-0.17.0

  **LangSmith版本：** `0.17.29`

  LangSmith v0.17 是自托管部署的推荐版本。升级以获得最新的安全更新、产品改进和错误修复。

  ### 重大变更* 对于沙盒和快照列表，不推荐使用 `limit` 和 `offset` 进行分页。
  * 自托管批量导出现在默认为 `zstd` 压缩。
  * 通过跟踪操作创建跟踪项目现在需要`projects:create`和`runs:create`。以前，只需要`runs:create`。
  * 对于启用 SmithDB 的安装：
    * 默认缓存现在为每个 Pod 使用 PersistentVolumeClaim，而不是本地 SSD `emptyDir`。要保留本地 SSD 存储，请在升级之前应用 v0.17 本地 SSD 值。参见[Cache storage](/langsmith/self-host-smithdb-infrastructure#cache-storage)。
    * 查询、摄取和压缩工作线程的 HPA 设置现在位于 `autoscaling.hpa.*` 下。
    * 迁移作业设置从 `smithdb.migration.deployment` 移至 `smithdb.migration.job`，使用相同的键。参见[Migrate ClickHouse history to SmithDB](/langsmith/self-host-smithdb-migrate)。
    * 指标现在默认为 `critical` 配置文件。在 `smithdb.commonEnv` 中设置 `SMITHDB_<SERVICE>__METRICS__MODE=all` 以导出每个指标系列。
  * JuiceFS 进入`sandbox-host` 部署。将任何关联的权限和工作负载身份配置移至该部署。
  * 从 v0.18 开始需要 Blob 存储。在升级到该版本之前设置 Blob 存储。

  ### LangSmith 发动机* [Engine](/langsmith/engine-overview) 支持自带密钥 (BYOK)。查找并修复代理问题，同时将数据保留在您的环境中并使用您自己的提供程序密钥进行模型调用。
  * 引擎检测低效的代理工作，以帮助减少延迟和 LLM 成本。

  ### 法学硕士网关

  * 管理[spend limits](/langsmith/llm-gateway-spend-policies)、[rate limits](/langsmith/llm-gateway-rate-limit-policies)、[model access policies](/langsmith/llm-gateway-model-access-policies)和[sensitive data handling](/langsmith/llm-gateway-data-policy)。
  * 配置跨提供商[model fallbacks](/langsmith/llm-gateway-fallbacks)，包括OpenAI和Anthropic API格式之间的转换。
  * 通过自定义 `X-Gateway-*` 标头确定范围支出上限和速率限制，例如 [per customer or team](/langsmith/llm-gateway-header-policies)。

  ### 访问控制和安全

  * 配置 [organization-scoped model configurations](/langsmith/model-configurations#organization-wide-provider-control) 和模型提供者机密。
  * 使用 [Organization Restricted role](/langsmith/rbac#restrict-roles) 为承包商和合作伙伴提供工作空间访问权限，而无需公开账单、设置或使用情况。
  * 组织管理员和操作员可以[deactivate and reactivate members' personal access tokens](/langsmith/create-account-api-key#deactivate-or-delete-a-personal-access-token)。

  ### 沙箱

  * 沙箱通常在所有云中可用。
  * 沙箱不再需要显式的 JuiceFS 依赖性。

  ### 可观察性和评估* 在对话轨迹视图中分析轨迹，使用在线评估器对其进行评分，并将其添加到注释队列和数据集中。
  * 使用 LangSmith 聊天、模板或编码代理构建和发布 [custom apps](/langsmith/custom-apps) 用于注释、实验、跟踪和其他 LangSmith 数据。通过聊天进行构建和编辑需要 [self-hosted chat setup](/langsmith/custom-apps#configure-self-hosted-chat)，包括沙箱服务 URL 和签名密钥。
  * 使用 Jev 和 SemIf 决策模型进行在线和离线评估。
  * 使用新的、富有表现力的查询语法和过滤界面构建过滤查询。
  * 自定义图表包括内置模板、更多支持的指标和布局改进。

  ### 史密斯数据库

  * [SmithDB](/langsmith/self-host-smithdb) 在 GCP、AWS 和 Azure 上普遍可用。
  * 压实工人支持[KEDA scaling](/langsmith/self-host-smithdb-scale#scale-with-keda-instead)。
  * ClickHouse 支持在 v0.19 结束。在升级到该版本之前启动 [migrating to SmithDB-backed SDK methods](/langsmith/smithdb-sdk-migration)。

  升级前查看[upgrade guide](/langsmith/self-host-upgrades)。

  **下载 Helm 图表：** [⟦T16⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0/langsmith-0.17.0.tgz)
</Update>

<Update label="2026-10-02">
  ## langsmith-0.16.39

  **LangSmith版本：** `0.16.69`

  * LangSmith 通过更有效地重用模型定价数据，同时保留自定义定价和计算成本，减少了跟踪摄取期间的 Redis 负载。

  **下载 Helm 图表：** [⟦T18⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.39/langsmith-0.16.39.tgz)
</Update><Update label="2026-10-02">
  ## langsmith-0.18.0-rc.5

  **LangSmith版本：** `0.18.2rc1`

  * 此版本打包了与 langsmith-0.18.0-rc.1 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.18.0-rc.1](#langsmith-0-18-0-rc-1)发行说明。

  **下载 Helm 图表：** [⟦T20⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.18.0-rc.5/langsmith-0.18.0-rc.5.tgz)
</Update>

<Update label="2026-10-02">
  ## langsmith-0.17.0-rc.61

  **LangSmith版本：** `0.17.29rc7`

  * LLM 法官评估者的提示包含旧的和当前的输出模式，现在根据法官实际使用的模式检查分数，因此他们的分数被保存，错误被记录在正确的反馈键下。
  * 在更新现有示例时，使用`PUT /v1/platform/datasets/{dataset_id}/examples`替换一次请求中的数据集示例再次成功；之前，它在使用较新的示例存储进行安装时返回 500 错误，包括全新的自托管安装。

  **下载 Helm 图表：** [⟦T23⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.61/langsmith-0.17.0-rc.61.tgz)
</Update>

<Update label="2026-10-02">
  ## langsmith-0.17.0-rc.60

  **LangSmith版本：** `0.17.29rc6`* 在 AWS Bedrock 上使用 Claude Opus 5.5 或 Sonnet 5.5 的 LLM 法官评估者不再因不受支持的强制工具选择而失败。
  * 气隙自托管安装无法访问引擎的费率，因此引擎设置、项目设置和引擎概述现在指示支出不可用，而不是显示本地估算；尽管项目或组织限制为 0 仍会暂停引擎，但未对这些安装强制实施支出限制。
  * 将模型清除按钮移至模型配置组合框中。
  * 引擎接受操作员配置的 GitHub 应用程序页面 URL，而不限制其路径布局，包括企业范围的 GitHub Enterprise Cloud 应用程序。

  **下载 Helm 图表：** [⟦T25⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.60/langsmith-0.17.0-rc.60.tgz)
</Update>

<Update label="2026-10-01">
  ## langsmith-0.17.0-rc.59

  **LangSmith版本：** `0.17.29rc5`

  * V1 仪表板图例在 ClickHouse 部署中保留在图表卡中，当图例空间不足时，菜单中会提供额外的系列。
  * 跟踪和运行列表显示一个垂直滚动条，可滚动表行并反映其位置，无需额外的外部滚动条。

  **下载 Helm 图表：** [⟦T27⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.59/langsmith-0.17.0-rc.59.tgz)
</Update>

<Update label="2026-10-01">
  ## langsmith-0.18.0-rc.4**LangSmith版本：** `0.18.2rc1`

  * 此版本打包了与 langsmith-0.18.0-rc.1 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.18.0-rc.1](#langsmith-0-18-0-rc-1)发行说明。

  **下载 Helm 图表：** [⟦T29⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.18.0-rc.4/langsmith-0.18.0-rc.4.tgz)
</Update>

<Update label="2026-10-01">
  ## langsmith-0.16.38

  **LangSmith版本：** `0.16.68`

  * 此版本包含与 langsmith-0.16.37 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.37](#langsmith-0-16-37)发行说明。

  **下载 Helm 图表：** [⟦T31⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.38/langsmith-0.16.38.tgz)
</Update>

<Update label="2026-10-01">
  ## langsmith-0.17.0-rc.58

  **LangSmith版本：** `0.17.29rc4`

  * 此版本打包了与 langsmith-0.17.0-rc.56 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.56](#langsmith-0-17-0-rc-56)发行说明。

  **下载 Helm 图表：** [⟦T33⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.58/langsmith-0.17.0-rc.58.tgz)
</Update>

<Update label="2026-10-01">
  ## langsmith-0.18.0-rc.3

  **LangSmith版本：** `0.18.2rc1`

  * 此版本打包了与 langsmith-0.18.0-rc.1 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.18.0-rc.1](#langsmith-0-18-0-rc-1)发行说明。

  **下载 Helm 图表：** [⟦T35⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.18.0-rc.3/langsmith-0.18.0-rc.3.tgz)
</Update>

<Update label="2026-10-01">
  ## langsmith-0.17.0-rc.57

  **LangSmith版本：** `0.17.29rc4`

  * 此版本打包了与 langsmith-0.17.0-rc.56 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.56](#langsmith-0-17-0-rc-56)发行说明。

  **下载 Helm 图表：** [⟦T37⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.57/langsmith-0.17.0-rc.57.tgz)
</Update><Update label="2026-10-01">
  ## langsmith-0.17.0-rc.56

  **LangSmith版本：** `0.17.29rc4`

  * 可选择在 Smith-go 中嵌入轨迹 gRPC 服务器。
  * 自托管 LangSmith 操作员可以将精确的 OpenAI 兼容端点和 Azure 范围列入白名单，以便 Playground 和评估器调用使用可刷新的 Azure 工作负载身份令牌进行身份验证。
  * 消息视图显示了 OpenAI 响应 API 调用上的用户消息，该调用将其作为纯字符串发送，这就是与先前\_response\_id 链接的调用或每个新回合发送的对话的方式；此前，这些用户消息已被删除。
  * 模型配置编辑器和网关主页代码示例解释了网关应用模型和连接设置，而必须在 API 请求中设置最大令牌和温度等生成参数。
  * 在自托管和 BYOC 部署中，组织管理员可以选择引擎运行的模型提供程序，查看每个提供程序的密钥是否已准备好，并从“设置”>“引擎”>“模型提供程序”添加缺少的密钥。

  **下载 Helm 图表：** [⟦T39⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.56/langsmith-0.17.0-rc.56.tgz)
</Update>

<Update label="2026-10-01">
  ## langsmith-0.16.37

  **LangSmith 版本：** `0.16.68`

  * 内部改进和维护更新**下载 Helm 图表：** [⟦T41⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.37/langsmith-0.16.37.tgz)
</Update>

<Update label="2026-09-30">
  ## langsmith-0.17.0-rc.55

  **LangSmith版本：** `0.17.29rc3`

  * 此版本打包了与 langsmith-0.17.0-rc.54 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.54](#langsmith-0-17-0-rc-54)发行说明。

  **下载 Helm 图表：** [⟦T43⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.55/langsmith-0.17.0-rc.55.tgz)
</Update>

<Update label="2026-09-30">
  ## langsmith-0.17.0-rc.54

  **LangSmith版本：** `0.17.29rc3`

  * 编辑了 Context Hub Webhook 以加载其保存的自定义标头而不是不相关的响应标头，从而防止保存时覆盖。
  * 允许自托管 Insights 部署明确选择 Vertex AI 模型的 Google 应用程序默认凭据，而不是存储服务帐户 JSON。
  * 在没有可用的存储服务帐户凭据或 LLM 身份验证代理凭据时，启用自托管 LangSmith 聊天，以使用 Google 应用程序默认凭据对 Vertex AI 工作区模型进行身份验证。
  * 仅在配置沙箱服务 URL 和签名密钥时才提供自定义应用程序浏览器创建和编辑，从而防止在配置不完整的部署中出现配置失败。有关设置要求，请参阅[Configure self-hosted chat](/langsmith/custom-apps#configure-self-hosted-chat)。

  **下载 Helm 图表：** [⟦T45⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.54/langsmith-0.17.0-rc.54.tgz)
</Update>

<Update label="2026-09-30">
  ## langsmith-0.18.0-rc.2**LangSmith版本：** `0.18.2rc1`

  * 此版本打包了与 langsmith-0.18.0-rc.1 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.18.0-rc.1](#langsmith-0-18-0-rc-1)发行说明。

  **下载 Helm 图表：** [⟦T47⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.18.0-rc.2/langsmith-0.18.0-rc.2.tgz)
</Update>

<Update label="2026-09-30">
  ## langsmith-0.17.0-rc.53

  **LangSmith版本：** `0.17.29rc2`

  * 此版本打包了与 langsmith-0.17.0-rc.52 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.52](#langsmith-0-17-0-rc-52)发行说明。

  **下载 Helm 图表：** [⟦T49⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.53/langsmith-0.17.0-rc.53.tgz)
</Update>

<Update label="2026-09-30">
  ## langsmith-0.16.36

  **LangSmith版本：** `0.16.67`

  * 此版本包含与 langsmith-0.16.34 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.34](#langsmith-0-16-34)发行说明。

  **下载 Helm 图表：** [⟦T51⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.36/langsmith-0.16.36.tgz)
</Update>

<Update label="2026-09-30">
  ## langsmith-0.18.0-rc.1

  **LangSmith版本：** `0.18.2rc1`* 当流式传输较长的响应时，Playground 不再遇到 React 嵌套更新崩溃。
  * 模型配置编辑器和网关主页代码示例现在解释了网关应用模型和连接设置，而必须在 API 请求中设置最大令牌和温度等生成参数。
  * 使托管模型请求上限可配置。
  * 选择下拉菜单支持键盘选择并在关闭时返回焦点。搜索字段在更新时保留查询，文本区域尊重受控值，滑块将其标签暴露给屏幕阅读器。
  * LLM Gateway 在 Anthropic 消息和 OpenAI 响应之间保留了延迟工具声明和有序工具添加，在搜索算法不同时映射托管工具搜索声明并发出警告，并拒绝聊天完成路由上不支持的搜索历史记录和延迟工具，而不是默默地更改其行为。
  * 允许较慢的 ThinkingState 动画。
  * 在 Studio 线程面板中折叠长中断负载的一部分，使该部分保持在指针下方，而不是跳回到线程的开头。* 解决了使用限制独特违规错误。
  * 当助手、线程、cron 或连接请求失败时，部署页面显示访问和自定义身份验证指南，而不是显示空状态。
  * 现在，更改工作区范围的服务密钥的角色需要拥有管理该密钥所覆盖的每个工作区中的密钥的权限，这与删除它的规则相匹配。
  * 在OpenAI响应和Anthropic消息之间转换时，LLM网关保留了匹配延迟工具的有序和重复激活，而不重复工具定义。冲突的定义、不明确的名称以及与最初可用工具的冲突仍然被拒绝。
  * 删除代码评估器不再等待沙箱快照清理，因此删除成功而不是超时。快照 ID 已排队，因此即使 API 关闭，清理操作仍会运行。
  * 新的 SankeyChart 设计系统组件可视化各个阶段的数量 — 从模型到结果的来源、跨环境和工作负载的支出或任何加权流程。节点大小按流量、图例行过滤阶段，悬停阶段强调其链接。* 自定义模型价格条目现在具有克隆操作，就像内置条目一样。当您在模型定价面板外部单击、按 Esc 键或关闭模型定价面板时，模型定价面板会询问是否放弃未保存的更改。
  * 统一的 LLM 网关在翻译已完成的流式响应输出（包括模型回退）时强制执行消息停止序列。匹配截断的交付文本和后续内容，同时保留完整的上游使用；它没有取消上游发电。合成仿真最多接受四个停止序列，每个序列最多 1024 个 UTF-8 字节；在发送响应请求之前，过大的输入被拒绝。
  * 短暂的存储后端错误不再导致沙箱的文件系统在重新启动之前返回 I/O 错误。后端恢复后，读取再次成功。
  * 当工作区模型配置指向 Vertex AI 上的 Gemini 时，聊天现在可以在第一次工具调用之后继续工作，并且不再拒绝工具调用打开已保存的 Gemini API 配置。
  * 注释队列标题项现在按添加顺序而不是按字母顺序显示在队列编辑器、审阅侧边栏和 CSV 导出中。现有的标题保持当前的顺序。* 对批量运行删除实施每周每租户限制。
  * 以页为单位读取元数据删除队列。
  * 部署后自动运行 BYOC 预览 E2E 并报告 PR。
  * Gemini OpenAI 兼容请求现在使用 Google 记录的skip\_thought\_signature\_validator 哨兵填充缺少的工具调用思想签名，包括配置的 Gemini 路由。所提供的签名被保留。此解决方法允许无法往返签名的客户端继续工具对话，但不会恢复推理状态，并且可能会降低模型质量。
  * 需要附件的在线和预览测试沙箱评估器现在在评分之前通过元数据 HEAD 解析每个附件的 MIME 类型。因此，即使附件密钥没有音频扩展，只要存储报告音频内容类型，内置语音指标就可以选择通话录音。
  * 示例时间戳解析接受紧凑的日历时间戳、不带秒的时间以及其他 UTC 偏移格式。历史示例查询保留了微秒精度和数据集标签处理。元数据过滤器在双引号键内保留撇号。* 定价页面“所有型号”下列出的 OpenAI 型号现已解决成本问题，例如 GPT-5.6 Luna 和 Terra。每日价格同步仅读取页面默认显示的三个型号，因此其余型号保留最初创建的价格。报告没有提供者的运行也得到了纠正：GPT-5.6 Luna 和 Terra 的定价仍然是其发布费率，是 OpenAI 今天收费的 5 倍和 1.25 倍。
  * 监控图表描述现在换行为多行，因此全文仍然可见。
  * 加载已保存的 Bedrock Converse 配置（其模型 ID 是应用程序推理配置文件 ARN）现在将提供程序设置保留在额外参数中，因此预设运行时无需重新输入。
  * 通过 Vertex AI 在 Gemini 3.x 模型上聊天现在完成了连续调用多个工具的回合，而不是一旦模型在调用之间讲述其工作就失败。
  * Playground 中选定的 Claude Sonnet 5.5 以及Anthropic、Bedrock 和 Vertex AI 的模型配置。
  * 在 AWS 前端预览版上安装了 main-fe Nginx 配置。* Google Vertex AI 模型配置现在将 Anthropic Claude 模型路由到 Vertex 的本机 Anthropic 消息 API，而 Gemini 和开放模型继续使用 OpenAI 兼容端点。现有的裸 Claude ID 继续有效，并且符合发布商资格的 ID 已自动标准化。
  * 在达到运行限制之前，跟踪现在最多可以包含 100,000 次运行。
  * 向摄取后端提供沙箱回调签名密钥。
  * 修复了没有代理的工作区的路由。
  * LangSmith Chat 现在在修改后的跟踪表上读取和写入 `field:value` 过滤器语法，并根据您的要求选择正确的范围 - 单次运行、根运行、任何运行或线程。它无法在您所在的范围内表达的过滤器被拒绝，而不是默默地清空表。

  **下载 Helm 图表：** [⟦T54⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.18.0-rc.1/langsmith-0.18.0-rc.1.tgz)
</Update>

<Update label="2026-09-30">
  ## langsmith-0.17.0-rc.52

  **LangSmith版本：** `0.17.29rc2`

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T56⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.52/langsmith-0.17.0-rc.52.tgz)
</Update>

<Update label="2026-09-30">
  ## langsmith-0.17.0-rc.51

  **LangSmith版本：** `0.17.28rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.42 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.42](#langsmith-0-17-0-rc-42)发行说明。**下载 Helm 图表：** [⟦T58⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.51/langsmith-0.17.0-rc.51.tgz)
</Update>

<Update label="2026-09-29">
  ## langsmith-0.17.0-rc.50

  **LangSmith 版本：** `0.17.28rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.42 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.42](#langsmith-0-17-0-rc-42)发行说明。

  **下载 Helm 图表：** [⟦T60⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.50/langsmith-0.17.0-rc.50.tgz)
</Update>

<Update label="2026-09-29">
  ## langsmith-0.17.0-rc.49

  **LangSmith版本：** `0.17.28rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.42 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.42](#langsmith-0-17-0-rc-42)发行说明。

  **下载 Helm 图表：** [⟦T62⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.49/langsmith-0.17.0-rc.49.tgz)
</Update>

<Update label="2026-09-29">
  ## langsmith-0.17.0-rc.48

  **LangSmith版本：** `0.17.29rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.44 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.44](#langsmith-0-17-0-rc-44)发行说明。

  **下载 Helm 图表：** [⟦T64⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.48/langsmith-0.17.0-rc.48.tgz)
</Update>

<Update label="2026-09-29">
  ## langsmith-0.17.0-rc.46

  **LangSmith版本：** `0.17.28rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.42 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.42](#langsmith-0-17-0-rc-42)发行说明。

  **下载 Helm 图表：** [⟦T66⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.46/langsmith-0.17.0-rc.46.tgz)
</Update>

<Update label="2026-09-29">
  ## langsmith-0.17.0-rc.47

  **LangSmith版本：** `0.17.29rc1`* 此版本打包了与 langsmith-0.17.0-rc.44 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.44](#langsmith-0-17-0-rc-44)发行说明。

  **下载 Helm 图表：** [⟦T68⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.47/langsmith-0.17.0-rc.47.tgz)
</Update>

<Update label="2026-09-29">
  ## langsmith-0.16.35

  **LangSmith 版本：** `0.16.67`

  * 此版本包含与 langsmith-0.16.34 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.34](#langsmith-0-16-34)发行说明。

  **下载 Helm 图表：** [⟦T70⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.35/langsmith-0.16.35.tgz)
</Update>

<Update label="2026-09-29">
  ## langsmith-0.17.0-rc.45

  **LangSmith版本：** `0.17.28rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.42 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.42](#langsmith-0-17-0-rc-42)发行说明。

  **下载 Helm 图表：** [⟦T72⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.45/langsmith-0.17.0-rc.45.tgz)
</Update>

<Update label="2026-09-28">
  ## langsmith-0.17.0-rc.44

  **LangSmith版本：** `0.17.29rc1`

  *“跟踪工具”选项卡显示功能工具以及提供者服务器工具，例如 OpenAI tool\_search，并且无法识别的条目不再隐藏运行中的其他工具。

  **下载 Helm 图表：** [⟦T74⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.44/langsmith-0.17.0-rc.44.tgz)
</Update>

<Update label="2026-09-26">
  ## langsmith-0.17.0-rc.43

  **LangSmith版本：** `0.17.28rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.42 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.42](#langsmith-0-17-0-rc-42)发行说明。

  **下载 Helm 图表：** [⟦T76⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.43/langsmith-0.17.0-rc.43.tgz)
</Update><Update label="2026-09-24">
  ## langsmith-0.17.0-rc.42

  **LangSmith版本：** `0.17.28rc1`

  * 评估器列表 API 接受 agent\_id 过滤器以返回附加到代理环境或标记数据集的评估器。
  * 在未配置 API 密钥时，自托管 Playground 和 LLM 评估器可以使用 Azure Kubernetes 服务工作负载身份向 Azure OpenAI 进行身份验证。
  * 为帐单页面结帐发出结帐步骤视图。
  * 图表显示形状感知加载骨架，而不是加载数据时的临时零值，评估器支出图表使用保留最终布局的条形和公制占位符。
  * 引擎问题描述保留了简洁的散文，同时将提到的文件路径、函数、类、工具和代码标识符呈现为内联代码。
  * 回答 204，而不是脱身 200。
  * 自托管升级可以重新运行使用计量迁移，而不会重复触发错误或用默认费率替换现有模型定价。
  * LLM Gateway 支持使用工作区凭据对 TypeSafe 的 System One API 进行直接直通请求。* 评估器变量映射清楚地解释了轨迹和非轨迹变量不能一起使用。
  * 代理身份验证自动注册需要客户端秘密身份验证的 MCP OAuth 客户端，将其凭据与现有公共客户端支持一起安全存储。
  * 图表显示加载与其最终可视化相匹配的占位符，包括条形图、折线图、圆环图、指标图和迷你图。
  * 使用编辑器窗格调整分类评估器字段的大小，将描述和删除类别按钮保留在反馈配置卡内。
  * 当 Polly 开始编写文件时，新的自定义应用程序会打开预览面板，未完成的初稿会一直被覆盖，直到生成完成且预览准备就绪。
  * 自定义应用程序预览在启动时显示动画加载插图，并提供静态版本以减少动作，并且发布的预览在准备好时淡入。
  *代理更新拒绝对后端类型或沙箱范围的更改，匹配现有的UI行为，新代理需要使用不同的后端；其他沙箱设置仍然可编辑。
  * 保持分割视图窗格调整大小手柄可抓取。* 轨迹评估器的保留升级不再通过近似开始时间来限制跟踪，升级根运行及其最早的子级以及其余部分，并且轨迹评估器跟踪上的评估运行链接将被保留，直到它可以指向正确的运行。
  * 网关提供商搜索字段使用了更舒适的高度，同时与标准组件尺寸保持一致。
  * 上次重试失败的线程或轨迹自动化批处理不再留下部分页面光标，因此下一个计划窗口从窗口开头而不是页面中间开始，并且未配置轨迹服务 URL 的自动化现在记录一个失败的规则日志条目，而不是重试直到尝试限制。
  * LangSmith Go 和 Java SDK 可以列出、更新和删除已保存的 Insights 报告配置，包括其重复计划。
  * 保留代理选择器页面的顶部栏。
  * 线程跟踪 API 接受 `trace_filter` 和 `tree_filter` 查询参数，用于过滤根运行并匹配跟踪树中任何位置的运行。
  * 按创建者过滤自定义应用程序列表，并将选择保留在页面 URL 中。* 保留红队探测声明\_no\_terminal\_answer。
  * 隐藏没有匹配键的反馈快捷键。
  * 当配置无效时，评估器侧面板禁用“保存”并显示原因；更正配置后可以再次保存。
  * 浏览器返回在返回最初加载的页面时保留了导航防护，包括清理空的、未部署的自定义应用程序。
  * 现在，使用“包括注释者姓名和每行注释”下载实验结果时，每个反馈列中都会保留自动评估者分数以及人工注释。
  * 评估者表格在保存工具提示中而不是横幅中解释了验证错误；在配置生效之前，保存保持禁用状态。
  * 沙箱可以代表您调用LangSmith API，而无需沙箱内的 API 密钥；在创建时传递 `access_delegation` 授予您完全访问权限或特定的权限列表；沙箱从来不保存凭证，并且拨款的上限取决于您在每次请求时可以执行的操作。* 从系统快照的共享、只读目录创建沙箱：system/default:latest、system/custom-apps:latest 使用 Smith Apps 工具，以及 system/code-evaluators:latest 使用预安装的 NumPy，从相同的沙箱和队列选择器中选择系统或工作区快照。
  * 使用通过 API 密钥进行身份验证的组织范围模型配置的评估者不再尝试按模型进行 OAuth 令牌交换，并且以这种方式配置的 Amazon Bedrock 模型不再因不受支持而被拒绝。
  * 网关仅请求共享网关项目记录的跟踪，而不是在 API 密钥或特定于用户的项目中创建重复项；现有的特定于调用者的项目及其历史痕迹保持不变。
  * 在访问委托授权下调用 API 的沙箱仍然可以创建沙箱，但不能再授予自己的授权，并且委托调用的审计条目现在命名为创建它的沙箱。* 引擎读取成功工具结果的内容，而不仅仅是其状态，归档问题，其中调用返回的数据少于其自己的结果声明的数据，或者到达的值被截断，并且由于错误不再被忽略而从未出现过缺陷。
  * 当运行评估器使用线程或轨迹源，或者线程和轨迹评估器使用运行源时，评估器侧面板显示映射错误并阻止保存，并在评估器目标更改时更新验证。
  * 为红队高严重性提供了自己的图表颜色。
  * 跟踪项目的跟踪和运行表上的“列”菜单允许您取消选择“状态”和“名称”，并将它们与其他列一起拖动到任意顺序。
  * LangSmith 在模型访问策略中支持 TypeSafe，并为直接网关请求提供系统一示例。
  * TypeSafe Jev 调用的 LLM 网关跟踪包括令牌使用情况以及按 TypeSafe 公布的费率计算的成本。
  * 使用 30 分钟的分段 ABAC 延迟窗口。
  * 系统/代码评估器：最新快照包括 pandas、jsonschema、SciPy 和 scikit-learn 以及 NumPy，因此评估器可以使用 ACE 支持的 Python 包，而无需安装它们。* 通过轨迹处理传播可用工具 (2/7)。
  * 从 OpenAI 痕迹中提取可用工具 (3/7)。
  * LangChain 轨迹使用根运行中的消息 ID 来识别主要对话，当没有唯一匹配可用或可选根丰富失败时，回退到现有选择，其他格式不会获取此丰富，并且处理运行和可选根共享一个字节预算，默认消息视图和轨迹贡献限制为 200 MB。
  * 项目统计侧边栏显示缓存命中率高于流速率，帮助您查看提示缓存提供的输入令牌的份额。
  * 侧边栏打开通知，查看平台公告和账户通知，不打扰您的工作；事件警报仍然位于页面顶部。
  * 引擎红队在引擎已扫描的项目上运行，从该项目的代理概述开始，并运行较短的确认扫描，而不是每次都重新派生应用程序映射。* 轨迹评估根据其根运行的开始时间而不是子LLM运行的开始时间选择最新的轨迹；轨迹元数据报告每个跟踪的实际根开始时间，并将缺少根时间戳的范围标记为不完整。
  * 可以列出沙箱的服务 URL，显示哪些端口被共享以及如何共享，并且可以关闭一个或全部端口的共享；以前，可以创建服务 URL，但从未检查或撤回。
  * 将目标的答案保留在法官的阅读窗口内。
  * 评估器配置表单显示每个支持的输入大小的完整采样率百分比。
  * 保存问题板的 GitHub 设置会清除项目中每个问题的修复分支和拉取请求链接，即使存储库本身没有更改，因此仅编辑基本分支或自动打开 PR 切换会默默地将问题与已打开或合并的拉取请求分离；面板设置不再触及这些链接。* 当跟踪批次的上传时间比服务器等待的时间长时，/runs/multipart 和 /runs/batch 停止读取并返回 408 请求超时而不是 503；由服务器而不是上传导致的超时返回 504。
  * 组织可以从常规设置中禁用 API 密钥验证的密钥创建；具有组织管理权限的登录用户可以更新设置，并且现有密钥继续有效。
  * 当调用带有response\_schema的interrupt()的图表时，Studio会呈现简历值的键入字段，而不是自由格式的JSON编辑器；没有模式的中断保留了 JSON 编辑器。
  * 部署表单在提交前修剪环境变量名称周围的空格，防止意外空格导致部署失败；环境变量值保持不变。
  * API 密钥页面上的工作区工具提示保持紧凑，让您滚动浏览完整列表，同时保持标题可见。* LLM 网关从统一 API 请求和回退中省略了温度，除非明确支持目标 OpenAI 模型和推理设置，从而防止较新模型上出现不支持的温度错误；自定义OpenAI兼容提供程序和本机直通请求保持不变。

  **下载 Helm 图表：** [⟦T81⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.42/langsmith-0.17.0-rc.42.tgz)
</Update>

<Update label="2026-09-24">
  ## langsmith-0.16.34

  **LangSmith版本：** `0.16.67`

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T83⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.34/langsmith-0.16.34.tgz)
</Update>

<Update label="2026-09-23">
  ## langsmith-0.16.33

  **LangSmith版本：** `0.16.66`

  * 将沙箱来宾 Linux 内核更新至 6.1.186，以包含自托管沙箱映像中的安全修复程序。

  **下载 Helm 图表：** [⟦T85⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.33/langsmith-0.16.33.tgz)
</Update>

<Update label="2026-09-23">
  ## langsmith-0.17.0-rc.41

  **LangSmith版本：** `0.17.25rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.33 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.33](#langsmith-0-17-0-rc-33)发行说明。

  **下载 Helm 图表：** [⟦T87⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.41/langsmith-0.17.0-rc.41.tgz)
</Update>

<Update label="2026-09-23">
  ## langsmith-0.17.0-rc.40

  **LangSmith版本：** `0.17.25rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.33 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.33](#langsmith-0-17-0-rc-33)发行说明。**下载 Helm 图表：** [⟦T89⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.40/langsmith-0.17.0-rc.40.tgz)
</Update>

<Update label="2026-09-23">
  ## langsmith-0.16.32

  **LangSmith版本：** `0.16.65`

  * 实验表中的评估器列标题不再以固定宽度截断 - 加宽列可显示完整的评估器名称，并且拖动列现在会立即更改其宽度，而不是看起来不执行任何操作。

  **下载 Helm 图表：** [⟦T91⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.32/langsmith-0.16.32.tgz)
</Update>

<Update label="2026-09-23">
  ## langsmith-0.17.0-rc.39

  **LangSmith版本：** `0.17.25rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.33 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.33](#langsmith-0-17-0-rc-33)发行说明。

  **下载 Helm 图表：** [⟦T93⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.39/langsmith-0.17.0-rc.39.tgz)
</Update>

<Update label="2026-09-22">
  ## langsmith-0.17.0-rc.38

  **LangSmith版本：** `0.17.25rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.33 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.33](#langsmith-0-17-0-rc-33)发行说明。

  **下载 Helm 图表：** [⟦T95⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.38/langsmith-0.17.0-rc.38.tgz)
</Update>

<Update label="2026-09-22">
  ## langsmith-0.16.31

  **LangSmith版本：** `0.16.63`

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T97⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.31/langsmith-0.16.31.tgz)
</Update>

<Update label="2026-09-22">
  ## langsmith-0.16.30

  **LangSmith版本：** `0.16.62`

  * 内部改进和维护更新**下载 Helm 图表：** [⟦T99⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.30/langsmith-0.16.30.tgz)
</Update>

<Update label="2026-09-22">
  ## langsmith-0.17.0-rc.37

  **LangSmith 版本：** `0.17.25rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.33 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.33](#langsmith-0-17-0-rc-33)发行说明。

  **下载 Helm 图表：** [⟦T101⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.37/langsmith-0.17.0-rc.37.tgz)
</Update>

<Update label="2026-09-21">
  ## langsmith-0.16.29

  **LangSmith版本：** `0.16.61`

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T103⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.29/langsmith-0.16.29.tgz)
</Update>

<Update label="2026-09-19">
  ## langsmith-0.16.28

  **LangSmith 版本：** `0.16.60`

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T105⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.28/langsmith-0.16.28.tgz)
</Update>

<Update label="2026-09-19">
  ## langsmith-0.17.0-rc.36

  **LangSmith版本：** `0.17.25rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.33 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.33](#langsmith-0-17-0-rc-33)发行说明。

  **下载 Helm 图表：** [⟦T107⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.36/langsmith-0.17.0-rc.36.tgz)
</Update>

<Update label="2026-09-18">
  ## langsmith-0.16.27

  **LangSmith 版本：** `0.16.59`

  * 此版本包含与 langsmith-0.16.26 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.26](#langsmith-0-16-26)发行说明。

  **下载 Helm 图表：** [⟦T109⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.27/langsmith-0.16.27.tgz)
</Update>

<Update label="2026-09-18">
  ## langsmith-0.17.0-rc.35

  **LangSmith 版本：** `0.17.25rc1`* 此版本打包了与 langsmith-0.17.0-rc.33 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.33](#langsmith-0-17-0-rc-33)发行说明。

  **下载 Helm 图表：** [⟦T111⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.35/langsmith-0.17.0-rc.35.tgz)
</Update>

<Update label="2026-09-18">
  ## langsmith-0.16.26

  **LangSmith 版本：** `0.16.59`

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T113⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.26/langsmith-0.16.26.tgz)
</Update>

<Update label="2026-09-17">
  ## langsmith-0.16.25

  **LangSmith 版本：** `0.16.58`

  * 此版本包含与 langsmith-0.16.24 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.24](#langsmith-0-16-24)发行说明。

  **下载 Helm 图表：** [⟦T115⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.25/langsmith-0.16.25.tgz)
</Update>

<Update label="2026-09-17">
  ## langsmith-0.17.0-rc.34

  **LangSmith 版本：** `0.17.25rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.33 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.33](#langsmith-0-17-0-rc-33)发行说明。

  **下载 Helm 图表：** [⟦T117⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.34/langsmith-0.17.0-rc.34.tgz)
</Update>

<Update label="2026-09-17">
  ## langsmith-0.16.24

  **LangSmith版本：** `0.16.58`* 在未配置 API 密钥时，自托管 Playground 和 LLM 评估器可以使用 Azure Kubernetes 服务工作负载身份向 Azure OpenAI 进行身份验证。
  * 自托管升级可以重新运行使用计量迁移，而不会重复触发错误或用默认费率替换现有模型定价。

  **下载 Helm 图表：** [⟦T119⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.24/langsmith-0.16.24.tgz)
</Update>

<Update label="2026-09-17">
  ## langsmith-0.17.0-rc.33

  **LangSmith版本：** `0.17.25rc1`

  * 平滑的选项卡指示器转换/动画。
  * 删除了额外的过滤器错误工具提示边框。
  * 使用仪表板的“分组依据”控件现在自动检测默认 API 密钥支出上限策略上配置的标题，允许直接按标题分组，而不是从成本控制策略行打开它；如果未配置标头，该选项会解释要添加的内容和位置。
  * 分组保存的视图控件。
  * 记录沙箱成本细分的每小时存储归因，同时保留现有的聚合计费，重复样本自动替换实体详细信息和工作区聚合。
  * 使用与“跟踪”页面相同的预设范围，按每个跟踪运行的时间过滤注释队列“查看所有项目”页面。* 注释队列“查看所有项目”页面现在显示每个项目的运行开始时间，允许在不打开跟踪的情况下查看触发跟踪的时间。
  * 按模型提供商在 API 密钥或用户中对 LLM 网关的使用情况进行分组，以比较提供商之间的支出并筛选特定提供商。
  * 现在，在注释队列中的线程项之间切换会替换前一个线程的消息，而不是将新线程覆盖在它们之上。
  * Context Hub 的 Markdown 预览窗格现在无需编辑即可渲染文件，从而防止富文本编辑器无意中重写存储的字节；编辑发生在“编辑”选项卡中，影响存储库中的确切字节，并且当您在文件之间移动时，您的预览/编辑选择仍然存在。
  * 将每个 OpenAI 客户端固定到部署区域。* 经过身份验证的网关请求可以选择在 X-LangSmith-Anthropic-Passthrough 中发送不透明的原始提供商令牌。 LangSmith OAuth 使用标准授权承载身份验证；只有内置 Anthropic 请求将令牌作为承载者转发，而不访问工作区提供者机密，将令牌有效性留给 Anthropic。其他提供商和自定义Anthropic兼容端点使用典型的获取密钥。保存的模型/路线、目录和混合后备链保留了现有权限、策略、权利和特定于提供商的会计。
  * 恢复了对组合部署的 EU Vertex 推断。
  * 更正了 Jira 目的地品牌。
  * 公开共享的线程页面不再显示无法成功的共享操作。
  * 停止对用户组进行片状测试。
  * 对齐的红队测试徽章。
  * 对齐的环境选择器。
  * 修复了环境 ID 工具提示上的名称。
  * 跟踪主动红队报道。* 模型的安全拒绝现在提供解释而不是空回复，失败的工具调用指示失败而不是完成，并且评估器搜索澄清运行每个评估器评分的内容。从聊天面板中删除了不起作用的语音按钮。
  * 当两个选定的模型都使用另一个提供商时，Insights 不再警告仅针对 OpenAI 或 Anthropic 的优化。
  * 当跟踪项目在默认时间范围内缺少跟踪时，范围现已扩大到包括最多 30 天前的最新跟踪。如果设置了明确的范围，则空表旁边会出现扩展该范围的选项。
  * 为非门控操作启用可流传输的 HTTP MCP。
  * 保留 langgraph-api 的 Trivy 操作权限。
  * 实验表中的编辑和删除现在检查项目权限以匹配 BE。
  * 当导航标志打开时，将消息重命名为轨迹。* 问题详细信息标头现在从问题的上次修改时间读取时间戳，从而防止例行更新（例如链接新证据的引擎）和刷新描述，从而使已关闭的问题看起来刚刚标记为已完成；它现在显示为“已更新\<when>”，其中包含有关谁关闭问题以及何时在下面的历史记录中显示的详细信息。
  * 避免了昂贵的错误补水。
  * 跟踪项目的跟踪和运行表上的“列”菜单现在允许取消选择“状态”和“名称”，并将它们与其他列一起拖动到任意顺序。
  * 禁用亚太地区影子版本。
  * 按线程分组的自动化现在可以发送带有匹配对话及其运行的 Webhook 有效负载。
  * 当导航视图打开时，将导出按钮标记为轨迹。
  * 引入了一个新的公共端点，通过沙箱和快照细分记录的每小时使用成本，并具有资源过滤器和光标分页。检查点存储仍保留在沙箱中，完整的存储细分与记录的工作空间总数一致。* 当项目统计请求未返回时，引擎扫描不再彻底失败；它继续使用它可以选择的错误和基线跟踪，通知代理有关丢失的选择，并记录统计调用失败的原因。
  * 保持跟踪窗格打开以进行悬停卡交互。
  * 优先考虑现实的红队调查。
  * 引擎现在可以扫描名称包含标点符号、Unicode 或特殊字符的项目，以防止其板在分析开始时停滞。
  * 缓解 SSRF 时返回错误而不是 500。
  * 更新了 Python 3.14 的代码评估器默认值。
  * 在截断的工具调用或仅包含想法的响应保存到对话中后，Amazon Bedrock 上的舰队代理不再每次都失败，而是使用下一条消息继续。
  * Insights 现在推荐了一个强大的思维模型和一个具有大上下文窗口的快速总结模型，并且没有针对混合提供者的警告。
  * LangSmith Go 和 Java SDK 现在可以保存 Insights 报告配置，使客户能够以编程方式创建 UI 可见的 Insights 报告。* 现在关闭自动化会停止其回填和实时评估，而不是在重新激活时恢复它们；禁用的自动化在关闭时继续推进其位置，这意味着重新激活大致从其暂停点恢复，避免了对关闭时提交的每个跟踪进行冗余评估。
  * 注释队列“查看所有项目”页面上的标头计数和删除确认现在反映了活动时间范围而不是整个队列，项目计数端点接受 min\_start\_time 和 max\_start\_time。
  * 当规则、游乐场实验或 UI 代码评估器的评估器分数违反工作区反馈键配置（例如，5 分对应 0-1 范围）时，LangSmith 现在会记录运行的错误反馈，并在注释中注明拒绝原因，而不是默默地删除它。
  * 添加了空状态提示。
  * 安装了 pnpm 并在非冲突失败时使构建作业失败。
  * 将沙盒服务 URL 握手路由到 smith-go。
  * 隐藏单圈轨迹导航。
  * 将继承的螺纹过滤器限制为十圈。* 尽管保存了分数，但更改先前已完成的队列项目的反馈分数仍会引发“无法更新审阅时间”错误；吐司被拿掉了，但分数仍然像以前一样保存。
  * 详细信息窗格现在可以填充狭窄的屏幕，而不会浪费左侧边缘的空间，调整大小手柄支持使用箭头键、Home 和 End 进行键盘导航，并显示可见的焦点指示器。
  * 发现页面上的每次运行都已处理的回填现在继续到下一页，而不是提前结束窗口，从而允许评估该页面后面的运行。
  * 切换到摄取队列等待页面而不是挂起计数。
  * 公开公开的 OIDC 集成。
  * 修复了在项目之间切换时过时的运行详细信息内容。
  * 撤销个人访问令牌会保留其原始有效期，而恢复令牌仅在该有效期仍然有效时才能恢复访问权限。
  * 提供了已撤销的个人访问令牌 (PAT) 的恢复。
  * 选择用于警报通知的 Slack 频道现在可以在足够大的工作区中运行，以便频道列表停止加载。
  * 避免了 Terraform 更改作业中的 Dorny API 速率限制。* 统一跟踪过滤并显示匹配的运行摘要。
  * 在共享跟踪面板中强制执行瀑布最小宽度。
  * 汇总 RUN\_RULES\_TWO\_POINTER\_BACKFILL\_TENANTS 进行状态检查，弃用\_dual\_reads。
  * 仪表板图表反馈关键建议现在包括来自运行级和线程级反馈的关键。
  * 直接从“设置”中的 API 密钥表撤销和恢复个人访问令牌，恢复保留令牌的到期日期，过期的令牌显示禁用的恢复密钥操作并附有说明。
  * 队列线程更新现在跨类型、批量和 LangGraph 代理请求保留系统管理的所有权元数据。
  * Studio 内存编辑器在滚动长内存项目时保持其关闭按钮可见。
  * 使用输入、输出或错误文本过滤器的警报现在匹配运行，无论 blob 存储和 ClickHouse 搜索设置如何，仅当启用 blob 存储和 ClickHouse 搜索时，搜索令牌仍写入 ClickHouse。
  * 代理概述卡和网关连接面板中的部分分隔符现在在明暗模式下具有更强的对比度。* 在列出线程跟踪时选择 TURN\_NUMBER 以返回每个跟踪在页面上的时间顺序位置。轮数也可用于公共共享线程。

  **下载 Helm 图表：** [⟦T121⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.33/langsmith-0.17.0-rc.33.tgz)
</Update>

<Update label="2026-09-17">
  ## langsmith-0.16.23

  **LangSmith 版本：** `0.16.57`

  * 修复角色无权限时列出组织角色失败的问题；现在，这样的角色会返回一个空的权限列表，而不是使整个角色列表不可用。

  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-7210。

  **下载 Helm 图表：** [⟦T123⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.23/langsmith-0.16.23.tgz)
</Update>

<Update label="2026-09-17">
  ## langsmith-0.17.0-rc.32

  **LangSmith 版本：** `0.17.24rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.26 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.26](#langsmith-0-17-0-rc-26)发行说明。

  **下载 Helm 图表：** [⟦T125⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.32/langsmith-0.17.0-rc.32.tgz)
</Update>

<Update label="2026-09-17">
  ## langsmith-0.17.0-rc.31

  **LangSmith 版本：** `0.17.24rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.26 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.26](#langsmith-0-17-0-rc-26)发行说明。

  **下载 Helm 图表：** [⟦T127⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.31/langsmith-0.17.0-rc.31.tgz)
</Update>

<Update label="2026-09-15">
  ## langsmith-0.17.0-rc.30

  **LangSmith版本：** `0.17.24rc1`* 此版本打包了与 langsmith-0.17.0-rc.26 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.26](#langsmith-0-17-0-rc-26)发行说明。

  **下载 Helm 图表：** [⟦T129⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.30/langsmith-0.17.0-rc.30.tgz)
</Update>

<Update label="2026-09-14">
  ## langsmith-0.17.0-rc.29

  **LangSmith版本：** `0.17.24rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.26 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.26](#langsmith-0-17-0-rc-26)发行说明。

  **下载 Helm 图表：** [⟦T131⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.29/langsmith-0.17.0-rc.29.tgz)
</Update>

<Update label="2026-09-14">
  ## langsmith-0.17.0-rc.28

  **LangSmith版本：** `0.17.24rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.26 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.26](#langsmith-0-17-0-rc-26)发行说明。

  **下载 Helm 图表：** [⟦T133⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.28/langsmith-0.17.0-rc.28.tgz)
</Update>

<Update label="2026-09-14">
  ## langsmith-0.17.0-rc.27

  **LangSmith 版本：** `0.17.24rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.26 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.26](#langsmith-0-17-0-rc-26)发行说明。

  **下载 Helm 图表：** [⟦T135⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.27/langsmith-0.17.0-rc.27.tgz)
</Update>

<Update label="2026-09-14">
  ## langsmith-0.16.22

  **LangSmith版本：** `0.16.55`

  * 当启用端点身份验证时，LangSmith 为部署信息端点提供经过身份验证的启动请求。

  **下载 Helm 图表：** [⟦T137⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.22/langsmith-0.16.22.tgz)
</Update>

<Update label="2026-09-14">
  ## langsmith-0.17.0-rc.26**LangSmith版本：** `0.17.24rc1`

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T139⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.26/langsmith-0.17.0-rc.26.tgz)
</Update>

<Update label="2026-09-14">
  ## langsmith-0.16.21

  **LangSmith版本：** `0.16.54`

  * 此版本包含与 langsmith-0.16.20 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.20](#langsmith-0-16-20)发行说明。

  **下载 Helm 图表：** [⟦T141⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.21/langsmith-0.16.21.tgz)
</Update>

<Update label="2026-09-14">
  ## langsmith-0.16.20

  **LangSmith版本：** `0.16.54`

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T143⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.20/langsmith-0.16.20.tgz)
</Update>

<Update label="2026-09-11">
  ## langsmith-0.16.19

  **LangSmith版本：** `0.16.52`

  * 此版本包含与 langsmith-0.16.18 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.18](#langsmith-0-16-18)发行说明。

  **下载 Helm 图表：** [⟦T145⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.19/langsmith-0.16.19.tgz)
</Update>

<Update label="2026-09-10">
  ## langsmith-0.16.18

  **LangSmith版本：** `0.16.52`

  * 避免在 v16 版本中进行完全安装。

  **下载 Helm 图表：** [⟦T147⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.18/langsmith-0.16.18.tgz)
</Update>

<Update label="2026-09-09">
  ## langsmith-0.17.0-rc.25

  **LangSmith版本：** `0.17.20rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.23 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.23](#langsmith-0-17-0-rc-23)发行说明。

  **下载 Helm 图表：** [⟦T149⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.25/langsmith-0.17.0-rc.25.tgz)
</Update><Update label="2026-09-09">
  ## langsmith-0.16.17

  **LangSmith版本：** `0.16.50`

  * 此版本打包了与 langsmith-0.16.16 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.16](#langsmith-0-16-16)发行说明。

  **下载 Helm 图表：** [⟦T151⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.17/langsmith-0.16.17.tgz)
</Update>

<Update label="2026-09-09">
  ## langsmith-0.17.0-rc.24

  **LangSmith版本：** `0.17.20rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.23 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.23](#langsmith-0-17-0-rc-23)发行说明。

  **下载 Helm 图表：** [⟦T153⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.24/langsmith-0.17.0-rc.24.tgz)
</Update>

<Update label="2026-09-09">
  ## langsmith-0.17.0-rc.23

  **LangSmith版本：** `0.17.20rc1`* 修复了前端部署和警报故障。
  * 无需面向用户的发行说明；仅依赖项维护更新。
  * 允许部署离开托管模式。
  * 按缓存读取速率定价顶点引擎输入令牌。
  * 修复了打开的 Dependabot 警报。
  * 当 Slack 通道事件由于交付失败、机器人令牌丢失、无法显示的中断或不明确的路线而在到达托管深度代理之前失败时，它会出现在 `mda logs` 和部署日志 UI 中，而不是静默失败。
  * 路由 Bedrock xAI 推理配置文件。
  * 将计费警报路由至专用计费渠道。
  * 配置代理身份验证 OAuth 回调。
  * 忽略没有名字的代理。
  * 路由欧盟修复通过区域OpenAI运行。
  * 已发送的代理身份验证路由上的轮询凭证会话。
  * Led Slack 发出带有标题的警报。
  * 共享线程创建了一个任何人都可以在没有LangSmith帐户的情况下打开的链接，显示线程中的每个回合及其运行轨迹和反馈分数。该链接始终反映线程的当前内容，包括共享后添加的回合，取消共享会立即撤销它。* 在顶点路径上设置所有三个提示缓存断点。
  * 增加了最近的过滤器去抖。
  * 在粘性标题下方保留代理概述编辑。
  * 监控 Asynq 速率限制重试，无需日志。
  * 协调沙箱配置。
  * 删除了消息视图的额外填充。
  * 在加载预览中显示的示例运行时，使用跟踪或树过滤器配置评估器不再超时。
  * 使代理挂钩与代理 API 合约保持一致。
  * 孤立的评估者快照。
  * 当代理或 OAuth 提供凭据时接受空白 API 密钥。
  * 允许 exec 关闭命令的标准输入。
  * 当请求上下文完成时退出后备链。
  * 将 BYOC M​​anager 移至基础设施。
  * 将验证错误记录为字符串。
  * 隐藏跟踪过滤器，无闪烁。
  * 当代理因连接的集成仍需要 OAuth 而暂停时，Slack 现在会显示一个可直接打开授权链接的连接按钮。以前，运行会因一般通知而暂停，并且无法完成从 Slack 的连接。
  * LangSmith MCP 连接器在支持时使用客户端 ID 元数据文档，并保留动态客户端注册作为兼容性回退。* 工作区编辑者现在可以通过“设置”>“资源标签”将资源分配给应用程序标签值。尽管允许编辑者应用应用程序标签，但该页面之前仍因权限错误而失败。
  * 解码轨迹端点上的@openai/agents JS SDK的`function_call_result`项和camelCase`callId`字段，解锁管理工具状态客户端的JS代理的消息视图。
  * Alembic git-revisions（删除了 ALEMBIC\_HEAD 合并冲突）。
  * 减少嘈杂的 BYOC Kubernetes 警报。
  * 清理失败的线程沙箱。
  * 在提交查找中显示当前 SHA。
  * 注册后恢复组织邀请。
  * 当候选者未在配置的超时内返回响应标头时，LLM 网关后备链现在可以前进到下一个模型。标头到达后，活动响应流继续。
  * 同时启动本地堆栈和工作区。
  * 为 BYOC 数据平面引脚烘焙 Alembic 链。
  * 与本地同时运行后端启动堆栈。
  * 规范化的亚太地区负载均衡器环境。* OAuth 授权会话现在接受规范的 `owner_type` 和 `owner_id` 字段，允许人员为用户或代理授权托管凭据。旧版请求和响应形状仍然支持已弃用的 `principal_id` 和 `agent_id` 字段。
  * 自托管部署现在可以将 REST 调用者的 `X-Fleet-Forward-*` 标头转发到代理调用的自定义 MCP 服务器，因此这些服务器前面的策略网关可以查看每次调用的上下文，例如最终用户身份。默认关闭；通过`FLEET_MCP_FORWARD_CALLER_HEADERS=true`启用。值由调用者断言，未经 LangSmith 验证。
  * 默认跟踪过滤器为根运行。
  * GitHub Actions 配额页面。
  * 将 Studio 消息操作向右对齐。
  * 部署的自定义安装和构建命令现在显示在“详细信息”面板中，并且“新修订”对话框会根据当前有效的值预先填充它们。以前，这些命令会持续存在并应用于每个构建，但不会在任何地方显示，因此任何必须调试构建的人都看不到继承的命令。
  * 更新了组织计划徽章颜色。* 商业私有 ECR 注册表现在可以按需承担 AWS IAM 角色，启用存储库和标签搜索，同时避免保存的授权令牌过期。
  * OAuth 授权会话现在接受工作区所有者，允许在工作区中共享一个托管 OAuth 凭据。
  * 线程查询客户端可以请求服务器发送的事件以逐步接收结果，同时保留光标分页。
  * 工作区切换器现在除了工作区名称之外还接受工作区 ID，这样在仅知道工作区 ID 的情况下可以更轻松地找到工作区。
  * 使用新的`/v2/threads/stats`端点来检索跟踪项目的线程和跟踪计数、延迟、令牌、成本和反馈统计信息。
  * 队列代理现在支持使用您配置的工作区 URL、服务端点和工作区凭据保存的 Databricks 模型配置。您可以通过 Databricks Model Serving 或 AI Gateway 路由进行连接。

  **Download the Helm chart:** [⟦T165⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.23/langsmith-0.17.0-rc.23.tgz)
</Update>

<Update label="2026-09-05">
  ## langsmith-0.16.16

  **LangSmith version:** `0.16.50`

  * 内部改进和维护更新

  **Download the Helm chart:** [⟦T167⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.16/langsmith-0.16.16.tgz)
</Update>

<Update label="2026-09-03">
  ## langsmith-0.17.0-rc.22**LangSmith版本：** `0.17.18rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.20 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.20](#langsmith-0-17-0-rc-20)发行说明。

  **下载 Helm 图表：** [⟦T169⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.22/langsmith-0.17.0-rc.22.tgz)
</Update>

<Update label="2026-09-02">
  ## langsmith-0.17.0-rc.21

  **LangSmith版本：** `0.17.18rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.20 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.20](#langsmith-0-17-0-rc-20)发行说明。

  **下载 Helm 图表：** [⟦T171⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.21/langsmith-0.17.0-rc.21.tgz)
</Update>

<Update label="2026-09-02">
  ## langsmith-0.17.0-rc.20

  **LangSmith版本：** `0.17.18rc1`* 隐藏运行树展开/折叠控制平面树。
  * 创建了一个跟踪项目，现在等待该项目变得可用后再打开它，从而防止错误的创建错误和未找到页面。
  * 在主机耗尽期间首先暂停最小的沙箱。
  * 高级过去选定的过滤器值。
  * 将代币和成本表值四舍五入为四位有效数字（已修复 LSO-3999）。
  * 添加了批量导出监控的调查链接。
  * 防止 BYOC 指标上的主机丰富。
  * 当空间紧张时，保持问题标题操作可访问。
  * 退回到未知的消息图标角色。
  * 将 Playground 排除在 BYOC 延迟监控之外。
  * 需要持续的最大副本数。
  * 防止浏览器翻译 DOM 突变。
  * 在 OpenAI 兼容模型配置上设置提供商名称，以填充 `ls_provider` 跟踪元数据，并通过 LLM 网关将自定义模型与提供商特定的定价进行匹配。
  * 使用真正的 15m p95 进行 V2 运行延迟监控。
  * 当成本策略按自定义标头拆分 API 密钥的支出限制时，允许用户查看按每个标头值细分 API 密钥支出的图表和表格。
  * 按组织修改了目标过滤器。* 关于自托管和 BYOC 故障的通知。
  * 隔离不定时批处理测试。
  * 允许自托管 LangSmith 运营商配置许可证到期前多少天会出现带有 `LICENSE_EXPIRATION_WARNING_DAYS` 的警告横幅；默认保留 7 天。
  * 问题现在有一个“克劳德代码修复”操作，可以打开本地编码代理，其中包含诊断、链接的跟踪以及已填写的获取它们的命令，并带有一个下拉菜单以切换到 Codex 或复制任何其他代理的提示。
  * 防止仪表板行因重叠卡片而悬停。
  * 解析嵌套Notion审计事件元数据。
  * 通过 SDK 指标绘制 Smith-agents LLM 调用图。
  * 禁用 LSM 回填。
  * 在源更改时部署云功能。
  * 具有不受支持的完成输出的验证示例现在报告架构验证错误，而不是因内部错误而失败。
  * 使侧面导航悬停状态立即生效。
  * 对齐 API 前缀平台路线。
  * 添加了组织限制，这是一个新的组织范围、系统定义的角色，可以访问分配的工作区，同时组织级别的设置、计费和使用表面保持隐藏。* 减少预览 PR 评论更新插入中 GitHub API 的使用。
  * 将基岩Anthropic配置文件路由到运行时。
  * 消息视图上的门控转向迁移​​指南。
  * 延迟内部 HPA 饱和警报。
  * 保留用户添加的过滤器范围。
  * 保留概念审计外部表。
  * 保留有效的策略范围选择。
  * 在分配之前解析了 Eppo 组织实体。
  * 在截止日期取消后保留部分光标。
  * 按推出状态进行门控线程回填。
  * 当引擎将问题标记为重复时，问题标题现在显示原始问题的重复链接，而不是包含其他问题 ID 的历史记录。

  **下载 Helm 图表：** [⟦T175⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.20/langsmith-0.17.0-rc.20.tgz)
</Update>

<Update label="2026-09-02">
  ## langsmith-0.16.15

  **LangSmith版本：** `0.16.48`

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T177⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.15/langsmith-0.16.15.tgz)
</Update>

<Update label="2026-09-01">
  ## langsmith-0.17.0-rc.19

  **LangSmith版本：** `0.17.17rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.17 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.17](#langsmith-0-17-0-rc-17)发行说明。

  **下载 Helm 图表：** [⟦T179⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.19/langsmith-0.17.0-rc.19.tgz)
</Update>

<Update label="2026-09-01">
  ## langsmith-0.17.0-rc.17

  **LangSmith版本：** `0.17.17rc1`* 禁用 Redis RDB 快照。
  * 保留控制器运行时配置。
  * 重新生成的提示快照针对功能\_gap 更改而过时。
  * 修复了组织行席位门控后的身份验证引导程序。
  * Azure AI Foundry 已添加为第一方 LLM 网关提供商。
  * 源自LangChainPlus的开发平台应用程序。
  * 合并后恢复了重新设计的通知编辑器。
  * 使用 OR 对过滤器快捷方式值进行分组。
  * 在 API 服务器上设置 EKS 身份验证的 AWS 区域。
  * 显示支出限额货币。
  * 提供LangGraph平面图像存储库。
  * Context Hub 目录写入现在支持链接代理和技能的显式最新和提交选择器；省略最新的选择器；要固定链接，请将旧版 `{"commit_id":"<uuid>"}` 替换为 `{"selector":{"type":"COMMIT","commit_id":"<uuid>"}}`。
  * 按大小缩放复选框半径。
  * 保留用于产品切换的 v2 过滤器。
  * 使用设计系统链接颜色作为共享面板 URL。
  * 允许 LangSmith 预览 CORS 预检。
  * 稳定的在线过滤器控制。
  * 简化的使用配置标题。
  * 对齐修改后的过滤器范围默认值。
  * Ran FE 预览建立在有冲突的 PR 之上。
  * 减少了图表 v2 阴影比较中的误报。* 停止删除长问题验证原因。
  * 删除了重播能力门。
  * 更新了空闲选项卡中的凭据。
  * 添加了 NLB 目标。
  * 迁移部署中的标准化沙箱 CORS 起源。
  * 增加了滞后并固定了反馈值比较。
  * 限制嘈杂租户的欧盟反馈流量。
  * 增加了欧盟产品中的反馈摄取队列最大副本数。
  * 增加了欧盟产品反馈突变 RPS 对产品水平的限制。
  * 使用 LangSmith 密钥进行身份验证验证重播。
  * 允许创建审核 Webhook 警报。

  **下载 Helm 图表：** [⟦T183⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.17/langsmith-0.17.0-rc.17.tgz)
</Update>

<Update label="2026-08-31">
  ## langsmith-0.17.0-rc.16

  **LangSmith版本：** `0.17.14rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.13 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.13](#langsmith-0-17-0-rc-13)发行说明。

  **下载 Helm 图表：** [⟦T185⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.16/langsmith-0.17.0-rc.16.tgz)
</Update>

<Update label="2026-08-28">
  ## langsmith-0.17.0-rc.15

  **LangSmith版本：** `0.17.14rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.13 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.13](#langsmith-0-17-0-rc-13)发行说明。

  **下载 Helm 图表：** [⟦T187⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.15/langsmith-0.17.0-rc.15.tgz)
</Update>

<Update label="2026-08-28">
  ## langsmith-0.16.14

  **LangSmith版本：** `0.16.47`* 此版本包含与 langsmith-0.16.13 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.13](#langsmith-0-16-13)发行说明。

  **下载 Helm 图表：** [⟦T189⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.14/langsmith-0.16.14.tgz)
</Update>

<Update label="2026-08-28">
  ## langsmith-0.17.0-rc.14

  **LangSmith版本：** `0.17.14rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.13 相同的LangSmith应用程序版本。请参阅下面的[langsmith-0.17.0-rc.13](#langsmith-0-17-0-rc-13)发行说明。

  **下载 Helm 图表：** [⟦T191⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.14/langsmith-0.17.0-rc.14.tgz)
</Update>

<Update label="2026-08-27">
  ## langsmith-0.16.13

  **LangSmith版本：** `0.16.47`

  * 通过 ABAC 策略授予 `runs:read` 的用户能够在标签与策略匹配的项目中打开跟踪，而对于策略范围之外的项目，跟踪访问仍然被拒绝。
  * 启用 Redis 集群安全模式时，运行规则和自动化避免了跨槽事务失败。

  **下载 Helm 图表：** [⟦T194⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.13/langsmith-0.16.13.tgz)
</Update>

<Update label="2026-08-24">
  ## langsmith-0.16.12

  **LangSmith版本：** `0.16.46`

  * 自托管队列附加访问配置文件，当部署启用内部 Kubernetes 目标时，其回调 URL 使用 Kubernetes 内部服务名称。

  **下载 Helm 图表：** [⟦T196⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.12/langsmith-0.16.12.tgz)
</Update>

<Update label="2026-08-24">
  ## langsmith-0.17.0-rc.13

  **LangSmith版本：** `0.17.14rc1`* POST /v1/fleet/sandboxes 从快照创建一个沙箱并将其返回以供使用，允许外部 OIDC 上的无头客户端在不访问平台沙箱 API 的情况下配置沙箱；您可以选择带有 snapshot\_id 或 name:tag 引用的启动映像，或者在工作区默认值中忽略这两者。
  * 向兰斯特添加了 Homebase 面包屑。
  * DELETE /v1/fleet/sandboxes/ 删除了一个沙箱，允许外部 OIDC 上的无头客户端清理沙箱，而无需访问平台沙箱 API；它是幂等的——删除已经消失的沙箱仍然返回 204——并且沙箱在后台被拆除，因此立即读取显示它处于删除状态而不是不存在。
  * POST /v1/fleet/sandboxes//files 将文件从 multipart/form-data 主体写入沙箱，在现有列表和读取端点旁边完成 Fleet 文件 API，路径查询参数自行命名目的地，因此上传不再依赖于直接访问沙箱的数据平面 URL；文件被流式传输而不是缓冲，超过 100MB 的文件会被拒绝，返回值 413。* 当部署启用内部 Kubernetes 目标时，自托管队列可以附加其回调 URL 使用 Kubernetes 内部服务名称的访问配置文件。
  * Tuned Evaluator 现在隐藏在 BYOC 工作区和自托管部署中，其中 LangChain 托管推理不可用。
  * 车队使用图表现在显示支出、工具和模型数据，而不是显示为空白。
  * 部署现在可以让通用代理直接在聊天中构建新代理，写入其名称、描述、工具、触发器和说明，而不是显示将设置交给新代理的创建代理按钮，需要在 Fleet API 服务器、Fleet 队列和平台后端上设置 FLEET\_INLINE\_AGENT\_GENERATION 才能将其打开；默认情况下它是关闭的。
  * 受控输入不再创建冗余的本地状态更新，从而防止在跟踪过滤器中输入时罕见的页面崩溃。
  * 在创建或捕获快照时附加自由格式的描述，并附加到代理规则和代理配置，并在读取时存储和返回描述，允许代理对其沙箱映像和网络访问可以执行的操作有一个简单的语言摘要。**下载 Helm 图表：** [⟦T198⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.13/langsmith-0.17.0-rc.13.tgz)
</Update>

<Update label="2026-08-22">
  ## langsmith-0.17.0-rc.12

  **LangSmith版本：** `0.17.12rc1`

  * 更新了沙箱的代理配置，使其不再需要沙箱运行；停止的沙箱存储新配置并在下次启动时应用它，而不是拒绝请求。
  * GET /v1/fleet/users 通过电子邮件或姓名列出并搜索您工作区的成员，返回代理共享所占用的用户 ID；仅 API 队列客户端在共享代理之前不再需要来自其他地方的用户 ID。
  * 将周期性循环移至 SAQ。
  * LLM Gateway 现在通过本机统一的响应和聊天完成端点支持 xAI API 密钥和 Grok 模型，并具有跟踪和支出归因功能。
  * LangSmith 聊天现在读取为它所做的事情的记录；它运行的每个工具都有一行命名操作及其作用，只需单击一下即可获得结果；当它接受一个计划时，就会出现一个计划，并且一个子代理会显示它正在执行的步骤；长结果折叠到可读高度，文件和差异呈现为文件和差异，并且面板可以调整大小或停靠到侧边栏。* 修复了 BarChart 故事书侧边栏错误。
  * Gateway Credits 余额卡现在解释了由LangChain 托管的信用访问模型，并且 Gateway 主页快速入门指出运行请求会产生跟踪费用，但不会产生额外的 LangChain 费用。
  * LLM Gateway 中的模型回退选项卡现在支持按工作区和回退触发器状态代码过滤路由配置，从而更轻松地查找适用于给定工作区或错误条件的路由。
  * 沙箱现在通过只读、主机服务的文件系统安装 Context Hub 存储库，因此可以直接访问文件，而无需轮询异步来宾实现；存储库更新以原子方式出现，并通过内存支持的停止和启动恢复安装。
  * LLM Gateway 后备策略现在可以通过原生提供者模型和保存的模型配置的有序链路由失败的提供者模型请求；配置哪些 HTTP 状态代码前进到下一个候选，而成功的请求直接继续到原始模型。* GET /v2/sandboxes/snapshots 现在使用 page\_size 和不透明光标进行分页，返回项目和下一个\_cursor；限制和偏移参数以及快照和偏移响应字段仍然有效，但已弃用。
  * 工作区 API 密钥的创建和删除现在由新的工作区：管理密钥权限控制，与工作区：管理分开；组织管理员可以授予自定义工作区角色管理 API 密钥的能力，而无需授予完整的工作区管理权限。
  * 范围到线程的自动化规则现在显示项目的线程空闲时间，并提供在项目设置中更改它的链接。
  * 默认网关支出和速率限制现在可以跟踪并为配置的 X-Gateway 请求标头的每个值强制实施单独的存储桶。
  * 注释队列中的自由格式标题项现在支持可选的正则表达式验证器；与配置模式不匹配的审阅者评论被阻止保存，并出现内联错误，而不是默默地保留。* 自定义角色现在可以独立于反馈提交授予feedback-configs:create、feedback-configs:update 和feedback-configs:delete，因此角色的范围可以限定为提交反馈，而无法创建、编辑或删除反馈配置（标题）定义。
  * 现在可以读取、具体化、克隆和编辑包含链接目录下旧文件的 Context Hub 存储库；读取使用了链接目录内容，下一次成功的编辑删除了冲突的遗留条目，而无需更改链接存储库。
  * Webhook 测试通知现在显示目标的 HTTP 状态和原因短语，帮助您诊断 URL、可用性和身份验证失败。
  * GET /v2/sandboxes/boxes 现在使用 page\_size 和不透明光标进行分页，返回项目和下一个\_cursor；限制和偏移参数以及沙箱和偏移响应字段仍然有效，但已弃用。
  * 网关支出限制表单可以配置自定义标头存储桶，成本策略表显示哪个标头分隔每个默认限制。* 创建和编辑的警报操作现在保留在粘性页脚中，因此您可以提交更改而无需滚动到表单底部。
  * 注释队列现在支持数据格式设置，该设置可在审阅时隐藏运行输入和输出中选定的 JSON 路径 - 通过示例运行生成的复选框选择字段，或手动键入路径；仅适用于运行项目，不适用于线程。
  * LLM Gateway 现在为每个组织转发 Claude Code Max OAuth 凭据，无需工作区 Anthropic API 密钥。
  * 使用裸“gpt-5.6”模型 ID 运行，现在可以正确计算成本；定价规则以前仅匹配“gpt-5.6-sol”ID 变体。
  * 允许代理生成器弹出窗口消失。
  *“模型回退”选项卡现在允许您创建和管理提供者模型的自动回退链，选择有序的备份模型或保存的模型配置，选择触发回退的 HTTP 错误，以及复制现成的网关请求示例。
  * 启用阴影 v1 -> v2 图表来比较数据。* GET /v1/fleet/users 现在适用于通过外部 OIDC 提供商进行身份验证的舰队部署，而不仅仅是 API 密钥调用者； OIDC 上的无头客户端可以解析同事的用户 ID 以进行代理共享。
  * GET /v1/fleet/sandboxes//files 返回沙箱中某个路径下的文件，通过 glob 模式进行匹配，并使用 page\_size 和不透明光标进行分页；分页取代了沙箱 glob 所应用的静默结果上限，因此可以完整读取大目录，而不是中途停止。
  * GET /v1/fleet/sandboxes//files/content 返回沙箱中文件的原始字节；字节范围通过 Range 标头支持，HEAD 报告文件的大小而不传输它。
  * 从阴影中排除第一个存储桶。
  * GET /v1/fleet/sandbox-snapshots/ 返回一个沙箱快照，因此客户端可以查看快照的构建状态，而无需重新读取整个列表；路径参数接受快照 ID 或 Docker 风格的引用，其中裸名称意味着 name:latest。* 工作区角色可以授予 API 密钥创建和删除权限，而无需授予完整的工作区管理权限；密钥管理人员可以将服务密钥范围限定到允许的工作空间并分配不受限制的角色。
  * LLM 网关模型后备策略现在可以在使用OpenAI聊天完成、OpenAI响应或Anthropic消息格式的提供商之间路由；统一和直接提供商端点的网关转换请求、非流式响应和流式响应。
  * DELETE /v1/fleet/sandbox-snapshots/ 删除了沙箱快照，该快照与快照创建配对，以便在构建失败后重试删除然后重新创建；它是幂等的并返回 409，同时任何沙箱仍从快照启动，包括停止的沙箱。

  **下载 Helm 图表：** [⟦T200⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.12/langsmith-0.17.0-rc.12.tgz)
</Update>

<Update label="2026-08-22">
  ## langsmith-0.16.11

  **LangSmith版本：** `0.16.45`* 干净地删除代理并删除代理的文件，因为以前在代理已经从代理列表中消失后，删除操作可能会返回权限错误。
  * 更新了 GET /v1/fleet/users 端点，以通过电子邮件或姓名列出和搜索工作区成员，返回代理共享所需的用户 ID；仅 API 队列客户端在共享代理之前不再需要来自其他地方的用户 ID。

  **下载 Helm 图表：** [⟦T202⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.11/langsmith-0.16.11.tgz)
</Update>

<Update label="2026-08-21">
  ## langsmith-0.17.0-rc.11

  **LangSmith 版本：** `0.17.10rc1`

  * 此版本打包了与 langsmith-0.17.0-rc.7 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.7](#langsmith-0-17-0-rc-7)发行说明。

  **下载 Helm 图表：** [⟦T204⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.11/langsmith-0.17.0-rc.11.tgz)
</Update>

<Update label="2026-08-20">
  ## langsmith-0.16.10

  * 此版本打包了与 langsmith-0.16.9 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.9](#langsmith-0-16-9)发行说明。

  **下载 Helm 图表：** [⟦T205⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.10/langsmith-0.16.10.tgz)
</Update>

<Update label="2026-08-20">
  ## langsmith-0.17.0-rc.10

  * 此版本打包了与 langsmith-0.17.0-rc.7 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.7](#langsmith-0-17-0-rc-7)发行说明。

  **下载 Helm 图表：** [⟦T206⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.10/langsmith-0.17.0-rc.10.tgz)
</Update>

<Update label="2026-08-19">
  ## langsmith-0.17.0-rc.9* 此版本打包了与 langsmith-0.17.0-rc.7 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.7](#langsmith-0-17-0-rc-7)发行说明。

  **下载 Helm 图表：** [⟦T207⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.9/langsmith-0.17.0-rc.9.tgz)
</Update>

<Update label="2026-08-19">
  ## langsmith-0.17.0-rc.8

  * 此版本打包了与 langsmith-0.17.0-rc.7 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.7](#langsmith-0-17-0-rc-7)发行说明。

  **下载 Helm 图表：** [⟦T208⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.8/langsmith-0.17.0-rc.8.tgz)
</Update>

<Update label="2026-08-19">
  ## langsmith-0.17.0-rc.7

  * 固定完整 UV 工作空间，用于 BYOC FE skew e2e。
  * 自托管使用的模型别名。
  * 引擎在支持的自托管部署中工作，无需 Eppo 部署配置，同时组织启用和现有权限仍然强制执行。
  * LangSmith 聊天跟踪现在显示您配置的模型，而不是在使用自定义模型端点时将其错误标记为 GPT-3.5-Turbo。
  * 引擎不再在自托管部署中发出自己的 LangSmith 跟踪，因此没有运行内容离开部署；云部署保持不变。
  * 除了现有的平均值、最小值和最大值之外，自定义仪表板图表现在还可以按总和、P50、P90、P95 和 P99 汇总反馈分数。* 在线评估器定义现在包括一个高级设置，用于打开或关闭评估器执行跟踪，并在禁用跟踪时继续运行反馈生成。
  * 停止重试跟踪查询超时，限制为 5 次尝试。
  * 接受以前的 Fernet 密钥，以便密钥可以轮换。
  * 现在，删除 LangGraph 部署会在一小时宽限期后删除其运行资源，并在一周后永久删除其数据库和元数据，从而留下一个从意外删除中恢复的窗口。
  * 无论浏览器报告的内容类型如何，现在都可以上传 .csv 或 .jsonl 数据集； Windows 浏览器将 .csv 文件标记为 Excel 类型，这此前会导致有效上传失败，并且也接受 DATASET.CSV 等大写文件名。
  * 附加到 Slack 消息的文件现在可在 /workspace/uploads 下用于沙箱支持的代理，匹配从 Fleet 上传的文件。
  * LangSmith 公开注释队列项端点，用于通过公共 API 和 SDK 生成流程添加、列出、更新、删除、计数、定位和查看运行或线程队列项。* 自托管舰队代理可以使用沙箱支持的计算机访问，而不需要云计费计划层。
  * 实验比较网格中的元数据列（包括 `example.metadata.<key>`）现在呈现其值而不是保持为空。
  * 粒度使用页面现在显示一条通知，即在自托管部署中未跟踪长期跟踪使用情况，因此“仅长期”过滤器预计会显示零结果。
  * API 密钥范围的 LLM Gateway 支出上限和速率限制策略现在可以添加自定义 X-Gateway-\* 标头条件，因此单个 API 密钥可以匹配每个标头值的不同限制，例如，经销商可以为每个下游客户设置单独的上限，而无需分发多个密钥。
  * 清理代理上下文以减少初始令牌成本。
  * 跟踪详细信息窗格再次使用与其部分标题相匹配的升高背景。
  * LLM 网关支出上限和速率限制策略上的自定义 X-Gateway-\* 标头条件现在也适用于组织、工作区和用户范围的策略，而不仅仅是 API 密钥范围的策略，允许将单个主题的流量按标头值拆分为单独的上限，而不管策略范围如何。* 在LangSmith设计系统中添加了可重复使用的ChartCard组件，标准化图表标题、移动、展开和溢出操作、响应式全角布局以及图表和图例间距。
  * 使用三点差异进行 CI 路径门控。
  * 使 /langchain 模型目录配置驱动并使用 Kimi 模型。
  * 停止匹配不相关 PR 的前端单元路径过滤器。
  * 自托管 LangSmith 批量导出现在默认使用 zstandard (zstd) 压缩而不是 gzip 以提高性能。
  * 当代理详细信息仍在加载时，导航到与选定代理的代理聊天不再崩溃；聊天显示加载状态，直到代理准备好，然后正常渲染。
  * 禁用 ace 请求上的 keepalive。
  * 在 Python 和 TypeScript SDK 中启用注释队列。
  * 一旦引擎链接到新的匹配跟踪，引擎问题板上已解决的问题现在就会返回“打开”；此前，该跟踪已作为证据提交，但该问题一直处于关闭状态，因此反复出现的问题从未在董事会上重新出现。被驳回的问题仍然被驳回。* 在使用 OAuth/SSO 进行身份验证的自托管安装中，远程 MCP 授权端点返回 400，因为 SSO 登录路由对其进行了隐藏； OAuth 客户端现在可以完成授权步骤并连接到远程 MCP 服务器。
  * 具有空白或仅空白名称的网关策略现在回退到显示策略 ID，而不是呈现空名称单元格，并且策略更新端点现在以与创建相同的方式拒绝空白名称。
  * 解决了重复的 Z 导入错误。
  * LangSmith 主页现在提供快速访问以复制当前组织和工作区 ID。
  * 使用服务密钥而不是常规 API 密钥并命名快照。
  * LLM Gateway 现在位于专用的顶级侧边栏部分，而不是在“设置”下，新的“主页”选项卡列出了您的自定义模型配置和网关的可立即运行的代码片段；旧设置网关链接自动重定向。* 具有在线许可证密钥（信标访问）的自托管部署现在可以自动查看每月组织使用情况图表，无需启用\_monthly\_usage\_charts 组织配置，而脱机部署现在指向“细粒度使用”选项卡以获取本地记录的计费使用情况。
  * 沙箱现在随 PATH 上的 `langsmith` CLI 一起提供，因此代理可以查询跟踪、运行和数据集，而无需先安装它。
  * 现在，当 Google 文档、表格、云端硬盘或幻灯片工具遇到 403 或 404 错误时，Fleet 会在聊天中内嵌于失败的工具调用上方并作为 Slack 中的消息显示警告，解释代理只能访问其通过连接的 Google 帐户自行创建的文件。
  * 当路由没有特定于工作区的资源 ID 且引用特定资源的路由继续打开目标工作区主页时，切换工作区或组织会使您保持在同一页面上。
  * 数据集或跟踪项目上的评估者列表现在显示评估者的当前名称，而不是附加时的名称；重命名后反馈键未发生变化。
  * 下一个自托管版本预览和提交定位器。* 数据集示例视图恢复了示例详细信息和选项卡导航之间的清晰间距。
  * 连接卡现在出现在 LLM Gateway 主页上的 Gateway Credits 余额上方，并且生成的代码片段在基本 URL 之前列出了 API 密钥，以匹配常见约定。
  * 注释队列项API使用project\_id作为跟踪项目，请求体也接受session\_id作为别名。
  * 沙箱支持的 Fleet 代理可以创建或修改可下载的 DOCX 文件，而无需在任务期间安装创作包；内置的技能指导文档创作和结构验证。
  * 指向 /langchain/v1 的网关积分片段。
  * 成对注释队列运行再次包含禁用 ClickHouse 查询支持时创建反馈所需的跟踪项目 ID。
  * 舰队代理可以使用 slack\_send\_file 和 slack\_send\_file\_to\_user 将工作区文件发送到 Slack 通道、线程和直接消息。* Gateway Credits 购买对话框现在会显示您购买时可获得的积分余额，并在单次购买按钮上方直接注明含费用总额；大金额不再将学分读数和总数推到对话框之外。
  * 当 ClickHouse 使用优化的运行表时，负反馈键过滤器现在可以正确返回匹配跟踪。
  * 注释队列项端点现在记录在 /api/v1/platform 下的服务路径中，因此生成的用于列出、添加、更新、计数、删除和放置队列项的 SDK 方法到达了 API，而不是返回 404。
  * `stream_options.include_usage` 的融合响应产生有损。
  * 在计划矩阵中添加了网关策略和网关积分行。
  * 记录已完成的 langchain 提供商信用购买。
  * 沙箱中的 `langsmith` CLI 已更新至 v0.2.44，其请求现已在为 `/api` 下的 API 提供服务的自托管部署上得到解决，其中 `trace messages` 等命令和项目问题命令之前失败。* 当模型提供者拒绝 Playground 运行时，例如错误的 API 密钥或配额耗尽，Playground 现在会显示提供者自己的错误消息，而不是通用服务器错误，从而从错误本身澄清原因。
  * 删除其 LangGraph 部署仍在删除后保留窗口内的跟踪项目现在会安排该项目与部署一起删除，并在错误消息中进行解释，而不是要求您删除已删除的部署。
  * 现在，每个人都可以使用新的代理创建体验，助手会显示“创建代理”按钮，新代理将运行自己的设置对话，而不是内联构建。
  * 分叉评估者将副本附加到分叉对话框中指定的项目或数据集；以前，可以创建不附加任何内容的副本，让原始评估器运行您刚刚编辑过的版本。
  * LangGraph 部署的删除确认现在表明，在您确认后会运行底层数据库的清理，并且已删除的部署的名称将保持保留状态，直到清理完成。* 当您在入职期间选择 Gateway Credits 时，复制到编码代理中的提示现在包含适合您的部署的正确网关 URL。
  * 恢复了 #30448 中删除的重复数据删除/生命周期块。
  * LLM Gateway Home 现在突出显示所选模型，并允许在聊天完成、消息和响应格式之间切换连接示例。
  * 附加到消息的 PDF 和其他文档现在呈现在全角预览框架中，并带有标题控件，可以几乎全屏打开它们，而不是折叠到缩略图大小的框。
  * 对于使用 6.2 之前的 Redis 版本的自托管部署，跟踪项目活动和排序保持最新。
  * 自托管部署中的引擎沙箱命令现在使用部署服务密钥通过 WebSocket 进行身份验证，从而防止成功创建沙箱后出现 401 失败。
  * 运行过滤器现在支持跨路由查询后端一致的总、提示和完成令牌计数和成本。* 当请求的跟踪项目在您的工作区中不存在时，`POST /api/v1/runs/stats` 现在返回 404，并报告其他客户端错误，例如早于支持的回溯窗口的 `start_time`，以及它们的真实状态和消息，而不是通用的 500 内部服务器错误。
  * LangGraph 采用并置 UI 和操作。
  * 存储状态超过 API 通常的单一响应大小限制的对话现在已完全加载，最多 32 MiB，而不是失败；响应将对话标记为过大，并且对其更新仍然失败，直到其状态缩小。
  * 沙箱接受一个新的流执行请求，为无法持有 WebSocket 的客户端返回 stdout 和 stderr 作为服务器发送的事件；传递命令 ID 重用正在运行的命令，并且单独的恢复请求继续中断的流，而不是再次运行该命令。
  * 对于无法管理组织的成员，LLM Gateway Home 上的成本控制和模型后备快捷方式现在为“查看成本控制”/“查看模型后备”，而不是“管理”/“配置”。* 网关使用支出图表现在显示每个桶中排名前 12 的个人支出，将其余的滚动到“其他”系列中，其悬停工具提示会同时列出每个贡献者以及固定在其下方的桶总数。
  * 为 langster-skills 使用了非冲突的发布分支名称。
  *“网关使用”选项卡不再显示页内工作区下拉列表，因为该页面的范围已经限定到您当前的工作区；它的副标题现在直接命名该工作区。
  * 在 OIDC OAuth 同意下隐藏工作区选择器。
  * 修补程序页面（堆叠）。
  * 配置评估器窗格的标题和模板导航再次在深色模式下绘制了与窗格本身相同的背景。
  * 确认破坏性操作后，从运行详细信息操作菜单中删除了整个跟踪。
  * 在跟踪项目中，重置视图现在会将线程/跟踪/运行切换器与显示的行同步移动；以前，当表已经返回到跟踪状态时，切换器可以保持在运行状态。
  * 自托管部署现在可以捕获丢失的跟踪项目上次运行时间戳，因此项目排序反映了最近的历史活动。* 主页间距和表面着色现在与设计审查反馈相匹配，并且几个小副本修复了澄清的信用限额、提供商状态和组织级购买限额。
  * 当项目配置自定义输出渲染器时，跟踪输出部分现在将其作为自定义选项与 Markdown、Plain、JSON 和 YAML 一起提供，而不是替换它们；自定义仍为默认值，您的选择将被记住。
  * 跳过新安装的回填发布列车检查。
  * 当LLM网关将OpenAI聊天完成或响应请求转换为Claude模型时，设置prompt\_cache\_options（或已弃用的prompt\_cache\_retention）的请求现在启用Anthropic提示缓存，而不是忽略该字段；在聊天完成和响应格式之间进行转换时，应用了Anthropic的默认缓存生命周期，并保留了prompt\_cache\_key、prompt\_cache\_retention和prompt\_cache\_options。* 舰队代理现在可以正确地将沙箱创建和组织配置请求路由到自托管部署上的 Go 平台后端服务，其中 Go 和 Python 服务在不同的地址上运行，从而无需反向代理解决方法。
  * 现在，从实验结果网格中更正评估者分数会立即更新单元格及其弹出窗口，而无需刷新页面。
  * 提示列表不再在页面底部显示持久的 LangChain Hub 横幅。
  * 使用live smith-前端设计系统。
  * 引擎运行的 webhook 和沙箱链接现在解析了 LANGSMITH\_PUBLIC\_API\_ENDPOINT 的外部可访问 API 库，回退到 LANGCHAIN\_PLATFORM\_ENDPOINT，然后是 LANGCHAIN\_ENDPOINT；安装其图表集仅 LANGSMITH\_PUBLIC\_API\_ENDPOINT 正在构建相对 URL，这使得每个非影子引擎运行失败，因为运行 Webhook 作为环回地址被拒绝。
  * llm-gateway：从网关进程初始化节拍器客户端。
  * 数据集 JSON 架构描述现在可以在编辑器工具提示中安全呈现。* 除了自托管和非数据平面工作区之外，在所有情况下都在侧边栏中显示网关和积分小部件。
  * 数据集和运行附件现在可以在自托管部署中预览、打开或下载之前解析相对签名的下载 URL。
  * 现在，从“数据集”或“主页”空状态创建数据集会打开新数据集，而不是短暂显示“未找到页面”屏幕。
  * Playground 批处理和调用端点现在在响应之前将缓冲的运行树清理为 JSON 安全的有效负载，因此当运行图无法序列化时，在线评估不再因不透明 500 而失败。
  * 列出或计数具有不受支持的 `filter` 表达式的示例，例如不可过滤的属性或值不是有效 JSON 的 `has(...)` 比较，现在返回 422，命名 `filter` 参数，而不是 500。
  * 反馈修正现在可以将分数重置为其原始值，包括零。* 当客户端请求机密身份验证方法时，与托管LangSmith MCP 服务器的新连接无法注册；在这种情况下，动态客户端注册现在发出一个公共客户端，而不是返回错误，因此从 Claude 和其他 MCP 客户端进行的连接再次正常工作。
  * 现在，当以用户跟踪代码发送时，通过 LLM 网关中的网关信用模型向 Moonshotai/kimi-k3 和 Moonshotai/kimi-k2.6 发出的请求会与价格图进行匹配。
  * 自托管部署形式现在支持 Redis CPU 和内存请求和限制，并且配置的值将应用于 Kubernetes 操作员管理的 Redis 工作负载。
  * 现在，当未配置凭证密钥时，Gemini Enterprise Agent Platform 上的 Claude 模型可以在 Playground 中成功加载，与 GCP Workload Identity 或 AWS IRSA 下的现有 Gemini 行为相匹配。
  * 设置资源标签键或值描述为`null`，可通过PATCH API清除。
  * 见解报告仅分析跟踪，因此报告过滤器中的“Is Trace”条件现已修复；将其设置为 false 之前会生成一份成功运行但从未发现任何见解的报告。* 现在呈现消息上的大型 PDF、JSON 和 CSV 预览，而不是显示空框架，并且 PDF 和 JSON 预览在扩展控件旁边获得了在新选项卡中打开控件。
  * 沙箱支持的 Fleet 代理可以构建新的牌组、修改现有的牌组并回答有关 .pptx 文件内容的问题，而无需先安装演示工具；内置技能指导创作并在交付前验证文件。
  * 当客服人员进行转弯时，聊天现在会显示实时经过时间计数，该计数会在几秒钟后出现，并在等待时间较长时拾取旋转状态标签，因此缓慢的转弯会被视为正在进行中而不是停止；一旦答案到来，流式推理的模型仍然会崩溃到它们思考的时间。
  * 恢复暂停的沙箱现在会检查您组织的真实沙箱配额，包括特定于计划的限制，而不是默认上限；真正超出配额的请求返回 429 并带有配额消息，而不是 502 Bad Gateway。* 当标题或描述很长时，仪表板上的图表标题不再溢出或换行：描述现在被截断，悬停工具提示显示全文。展开图表操作还采用了标准的图标按钮悬停处理。
  * 当提交的值验证失败（例如无效的图像路径）时，“创建新部署”表单现在会显示清晰的每个字段消息，而不是原始后端错误负载。
  * 在引擎打开之前，引擎选项卡在跟踪项目中再次可见，因此管理员可以启用它，成员可以请求访问权限，个人组织可以升级，所有这些都可以通过选项卡本身进行。
  * 在线自托管 LangSmith 安装现在可在启用回拨使用情况报告时报告最终的沙箱正常运行时间和计费资源使用情况；离线和选择退出安装不会发送沙箱使用情况。
  * 自托管 LangSmith 现在仅当部署许可证包含沙箱访问时才启用沙箱 API 和 UI 访问。
  * 线程细节中的瀑布过滤器现在保持深度嵌套的匹配可见，并保留过滤器控件，同时仍然出现新摄取的痕迹。* 根据反馈更新了 FE 代理技能和 lint。
  * 使用 `dataset_id` 创建或验证示例时，该示例不是格式良好的 UUID，现在会返回 422 命名该字段，而不是 500。
  * 添加提供商 API 密钥现在从提供商选择器开始，该选择器为您填写正确的密钥名称，并提供其他任何内容的自定义选项；在 LLM 网关中，您可以添加提供商所需的机密，而无需离开连接屏幕。
  * 允许通过 FF 禁用特定仪表板。
  * 重命名了轨迹图块并命名了其估计窗口。
  * 沙箱支持的 Fleet 代理可以创建电子表格、修改现有工作簿以及回答有关 .xlsx 和 .xlsm 文件的问题，而无需先安装电子表格工具；内置技能指导安全使用 openpyxl，并在交付前验证每个工作簿。
  * 通过 LLM 网关的 Bedrock 请求现在使用 Amazon Bedrock 价格图，因此可以正确计算其成本。
  * 对过时问题的自动解决判决（仅记录）。
  * 创建实验不再转换现有的同名跟踪项目；当存在冲突时，您可以重命名实验或选择新的项目名称。* 当面板内容较宽（例如“常规”选项卡上的长模型 ID）时，手动 Insights 配置中的部分侧边栏不再折叠。
  * 现在默认情况下为采用自助服务计划的组织启用引擎，允许您在任何项目上打开“引擎”选项卡并开始分析跟踪，而无需管理员先将其打开；明确禁用引擎的组织仍然处于禁用状态，管理员仍然可以在“设置”→“引擎”下将其关闭。
  * 访问策略端点现在将错误报告为 RFC 7807 问题详细信息；错误消息从 `error` 字段移至 `detail`，语义无效的请求正文返回 HTTP 422。
  * LangSmith 现在在呈现评估提交链接时拒绝带有凭据的和非 GitHub 远程 URL。
  * 当代理读取其模型无法接受的文件作为附件时，Fleet 现在会替换为简短的解释，而不是使请求失败。之前陷入困境的对话在下一条消息时恢复了。
  * 澄清了用于创建新舰队代理的字段。
  * 在实验比较视图中可以再次选择按元数据分组和元数据列。* 更新了 ABAC 访问策略并通过公共 API 将策略与角色分离。
  * 提示页面现在支持按提示类型、提示标签和提交标签进行过滤，使您可以快速缩小列表范围，找到您要查找的提示。
  * 当您在注释队列（包括成对队列）中查看运行时存储的附件现在会出现；以前，仅显示运行输入或输出中内联的媒体。
  * 滚动浏览大型实验比较结果不再在每次延迟加载时重新获取示例的第一页，从而减少了冗余网络流量并减少了加载时间。
  * 通过网关的统一端点发送的聊天模型运行与提供商/模型段现在匹配模型定价规则，产生准确的跟踪成本。
  * 引擎 GitHub 设置现在链接到 LangSmith 云和自托管部署的设置说明，在连接失败时提供更清晰的指导。
  * 解决了 TracingToolbarSlot 中的 PortalSlot 导入问题。
  * PDF 附件图标现在与附件列表中的其他文件类型保持一致。* 回滚从上传的源存档创建的部署现在会重新部署该修订版的存档，而不是最新的存档。
  * 添加了环境变量页面。
  * 引擎支出控制现在解释说，新的运行会在每月限制处暂停，而已经进行的运行可能会完成并增加超出该限制的计费支出。
  * LangSmith MCP 的 `fetch_runs` 工具现在可以包含调用参数，包括发送到 LLM 的工具和函数模式，以便更轻松地进行工具调用诊断。
  * TooltipProvider 中的包装外壳。
  * 自托管部署每 5 分钟而不是每 24 小时刷新一次许可证，因此权利更改在更改后不久就会生效；刷新失败不再重新启动服务；它继续使用最后一个经过验证的许可证，直到该许可证到期。调谐旋钮现在为 LICENSE\_REFRESH\_INTERVAL\_SECONDS（默认 300），取代了 LICENSE\_REFRESH\_INTERVAL\_HOURS。
  * 信用余额现在显示在连接卡上方，并且成本控制、模型回退和支出监控的快捷方式卡保持可见（锁定，并带有“升级计划”提示），而不是对于开发人员计划组织消失。* 角色权限和访问策略更改现在可以可靠地使缓存的授权结果失效，包括在较新的更新后提交较旧的事务时。
  * 当评估者没有筛选器时，评估者支出表会使“所有运行”筛选器标志保持非活动状态。
  * 附件和对象下载现在总是声明浏览器应如何处理响应；类型无法识别的文件或存储时没有类型的文件将作为下载提供，而不是在页面中呈现。
  * 非编码代理板上的引擎扫描应用了配置的优先级芯片、用户指令和跟踪范围过滤器，而不是检查整个项目。

  **下载 Helm 图表：** [⟦T225⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.7/langsmith-0.17.0-rc.7.tgz)
</Update>

<Update label="2026-08-19">
  ## langsmith-0.16.9

  * 当启用 Redis 集群 TLS 时，GCP Redis IAM 集群发现现在使用 TLS，允许自托管部署将 IAM 身份验证与需要 TLS 的 Memorystore 集群结合起来。

  **下载 Helm 图表：** [⟦T226⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.9/langsmith-0.16.9.tgz)
</Update>

<Update label="2026-08-18">
  ## langsmith-0.16.8* 自托管 v16 部署可以通过规范的组织 API 将 ABAC 访问策略与角色附加和分离。
  * Microsoft Teams 回复频道工具现在默认请求批准，与其他 Teams 写入工具相匹配；已将该工具设置为自动运行的代理将保留其当前行为，并且您可以将其切换回“每个代理自动”。

  **下载 Helm 图表：** [⟦T227⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.8/langsmith-0.16.8.tgz)
</Update>

<Update label="2026-08-16">
  ## langsmith-0.16.7

  * LangSmith 使用 Microsoft Entra ID 身份验证进行独立 Redis 的工作人员已成功启动，并在事件循环启动后继续刷新凭据。

  **下载 Helm 图表：** [⟦T228⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.7/langsmith-0.16.7.tgz)
</Update>

<Update label="2026-08-14">
  ## langsmith-0.16.6

  * 此版本打包了与 langsmith-0.16.5 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.5](#langsmith-0-16-5)发行说明。

  **下载 Helm 图表：** [⟦T229⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.6/langsmith-0.16.6.tgz)
</Update>

<Update label="2026-08-13">
  ## langsmith-0.16.5

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T230⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.5/langsmith-0.16.5.tgz)
</Update>

<Update label="2026-08-12">
  ## langsmith-0.16.4

  * 此版本打包了与 langsmith-0.16.2 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.2](#langsmith-0-16-2)发行说明。**下载 Helm 图表：** [⟦T231⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.4/langsmith-0.16.4.tgz)
</Update>

<Update label="2026-08-12">
  ## langsmith-0.17.0-rc.6

  * 此版本打包了与 langsmith-0.17.0-rc.1 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.1](#langsmith-0-17-0-rc-1)发行说明。

  **下载 Helm 图表：** [⟦T232⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.6/langsmith-0.17.0-rc.6.tgz)
</Update>

<Update label="2026-08-11">
  ## langsmith-0.16.3

  * 此版本包含与 langsmith-0.16.2 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.2](#langsmith-0-16-2)发行说明。

  **下载 Helm 图表：** [⟦T233⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.3/langsmith-0.16.3.tgz)
</Update>

<Update label="2026-08-11">
  ## langsmith-0.17.0-rc.5

  * 此版本打包了与 langsmith-0.17.0-rc.1 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.1](#langsmith-0-17-0-rc-1)发行说明。

  **下载 Helm 图表：** [⟦T234⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.5/langsmith-0.17.0-rc.5.tgz)
</Update>

<Update label="2026-08-11">
  ## langsmith-0.16.2

  * 自托管舰队代理可以使用沙箱支持的计算机访问，无需云计费计划层。

  **下载 Helm 图表：** [⟦T235⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.2/langsmith-0.16.2.tgz)
</Update>

<Update label="2026-08-07">
  ## langsmith-0.17.0-rc.4

  * 此版本打包了与 langsmith-0.17.0-rc.1 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.1](#langsmith-0-17-0-rc-1)发行说明。

  **下载 Helm 图表：** [⟦T236⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.4/langsmith-0.17.0-rc.4.tgz)
</Update>

<Update label="2026-08-07">
  ## langsmith-0.16.1

  * 修复了沙箱支持的舰队代理上初始文件上传的问题。**下载 Helm 图表：** [⟦T237⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.1/langsmith-0.16.1.tgz)
</Update>

<Update label="2026-08-05">
  ## langsmith-0.16.0

  LangSmith 自托管 v0.16 是我们为所有自托管部署推荐的版本。它为自托管带来了三大功能：**SmithDB**、**引擎**和**沙箱**，以及我们平台其余部分的广泛改进。

  按照升级说明操作即可访问所有内容：[https://docs.langchain.com/langsmith/self-host-upgrades](https://docs.langchain.com/langsmith/self-host-upgrades)。

  如果您想预订升级时间，请随时联系LangChain支持人员`support@langchain.dev`。

  ### 重大变更

  * 当创建时省略 `compression` 参数时，批量导出现在默认为 `zstandard` 压缩。有关在 Helm 图表中覆盖此默认值的说明，请参阅 [Compression](/langsmith/data-export#compression)。每次批量导出显式设置 `compression` 的工作方式与以前一样。
  * `agent-bootstrap` 脚本已完全弃用并删除。如果您使用 `agent-bootstrap` 部署 Fleet（以前称为 Agent Builder），请迁移到独立部署。欲了解更多信息，请参阅[Migrating LangSmith Deployments control plane Fleet to standalone Fleet](https://support.langchain.com/articles/8306585004-migrating-langsmith-deployments-control-plane-fleet-to-standalone-fleet)。
  * 新的`backfillCheck`作业可防止在所需检查完成之前升级版本。如果您依赖其他服务中的基于 IAM 的身份验证等功能，则可能需要添加匹配的注释和标签。

  ### 基础设施变化* 多个图像被合并到`smith-backend`图像中。您不再需要镜像 `go-backend`、`playground` 和 `host-backend` 等图像。如果您之前覆盖了这些，请将它们从您的 `values.yaml` 中删除。
  * `polly`、`fleet` 和 `insightsEngine` 等代理图像现在与核心可观测性图像相当。它们支持依赖项的 IAM 身份验证以及 FIPS 兼容性。
  * 自托管映像附带 Cosign 签名和签名的 SBOM 证明，因此您可以立即验证来源并满足供应链要求。

  ### 新功能* **SmithDB** 已推出公开测试版。 LangChain 不支持也不建议您自行设置。通过 [SmithDB early access waitlist](https://www.langchain.com/smithdb-early-access-waitlist) 表达兴趣，团队将与您联系，帮助您在 SmithDB 上取得成功。
    * 专为LangSmith运行和跟踪数据构建的列式数据库，取代 ClickHouse 作为运行的查询引擎。
    * 更快地跟踪和运行大型项目的查询，以及此版本中扩展的自定义仪表板指标的后备存储。
    * 可以在禁用 ClickHouse 的情况下作为唯一的查询路径运行，或者在迁移期间与 ClickHouse 一起运行。运行、线程和统计数据由 `/v2/*` 端点提供。
  * **自托管引擎** 在 AWS/GCP US 中可用。有关安装说明，请参阅[LangSmith Engine on self-hosted](/langsmith/engine-self-hosted)。您可能需要联系您的客户代表才能在您的许可证上启用此功能。
    * 代理工程的代理：引擎根据您的生产痕迹工作，找出重复出现的问题，诊断其根本原因，并推动修复。
    * 持续扫描启用的跟踪项目，识别故障和潜在的改进，并将它们转化为按严重程度排名的可操作问题。* 提出修复建议，在连接源代码的情况下打开 PR，创建评估器和真实示例以捕获回归，并自动监控问题是否再次出现。
    * 使用费按 [LangChain Compute Units (LCUs)](/langsmith/pricing-plans) 收费，并在组织和项目级别可选择每月支出限额。在自托管上，引擎不会发出 LangSmith 痕迹。
    * 将跟踪内容发送到 LangSmith Intelligence，这是 LangChain 管理的零数据保留服务。需要出口至 GCP 上的 `beacon.langchain.com` 或 AWS 上的 `beacon.aws.langchain.com`。气隙安装无法运行引擎。
  * **自托管沙箱**可在 AWS 和 GCP 中使用。有关安装说明，请参阅[Enable sandboxes](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes)和[LangSmith Sandboxes](/langsmith/sandboxes)。您可能需要联系您的客户代表才能在您的许可证上启用此功能。
    * 隔离环境，代理可以安全地执行任意代码并与文件系统交互，而无需接触您的主要基础设施。
    * 从基于 Docker 映像、本地`Dockerfile`或捕获的运行沙箱构建的快照启动，并挂载 S3、GCS 和 Git 存储库，而无需向代理公开凭据。
    * 身份验证代理将凭据保留在运行时之外。
  * **平台和工具*** **LangSmith MCP**：将任何支持 MCP 的客户端指向您的实例以读取跟踪、项目、数据集和提示。欲了解更多信息，请参阅[LangSmith Remote MCP](/langsmith/langsmith-remote-mcp)。远程 MCP OAuth 授权现在适用于使用 SSO 的自托管。
    * **LangSmith OAuth 令牌**：通过 `langsmith auth login` 基于浏览器的登录，发出短期访问令牌和刷新令牌，以及用于跨 CLI 和 SDK 共享端点、工作区和身份验证配置的配置文件。欲了解更多信息，请参阅[LangSmith CLI](/langsmith/langsmith-cli)。
      * **Terraform 提供程序**：以代码形式管理工作区、自定义角色、组织和工作区成员、评估者、运行规则和警报规则。欲了解更多信息，请参阅[Manage LangSmith with Terraform](/langsmith/manage-with-terraform)。
    * **部署**：从“设置”中重命名部署，在一个代理上使用相同的表达式创建多个 cron 计划，并查看本地时区的 cron 计划。
  * **可观察性和评估**
    * **运行详细信息面板**：重新设计，直接在面板中提交反馈。
    * **线程视图**：显示实际的最后输出以及新的“最后错误”列。
    * **范围跟踪限制**：管理每个项目和每个用户的每月跟踪限制，并在“使用限制”页面上显示横幅和可见性。* **监控挂钩**：运行规则 Webhook 有效负载包括 `trace_url` 深层链接，队列工作人员发出 Prometheus 指标。
    * **OpenTelemetry**：来自 OTel 资源属性的自定义跟踪元数据以及在其父级之前到达的子级现在已正确缓冲和嵌套，而不是被删除。
    * **可重复使用的评估器**：LLM-as-judge评估器可以包含扩展统计数据。
    * **注释队列权限**：ABAC 支持。
    * **实验进度跟踪**：进度条显示运行和评估器执行进度。
    * **数据集分割**：显示为芯片，可从实验和比较表中进行编辑。
    * **批量实验导出**：新的 `all_experiments` 参数导出工作区中的每个实验（每个导出 250 个，可根据请求提出）。
    * **Context Hub Webhooks**：配置在每个代理或技能提交上触发的工作区范围的 HTTPS Webhook，具有 HMAC-SHA256 签名的有效负载、自定义请求标头和就地秘密轮换。欲了解更多信息，请参阅[Configure Context Hub commit webhooks](/langsmith/context-hub-webhooks)。* **模型支持**：Claude Sonnet 5、Claude Fable 5、Claude Opus 4.8、Gemini 3.6 Flash、Gemini 3.5 Flash Lite 和 Databricks 模型。新的 Anthropic 游乐场会话默认为 Claude Sonnet 5。模型配置支持 OAuth 客户端凭据。
  * 许多错误修复和较小的改进。

  ### 管理员变更

  * 组织管理员可以更新现有的 [service key's](/langsmith/administration-overview#service-keys) 角色，而无需轮换。
  * 从组织设置中重命名您的 [organization](/langsmith/set-up-hierarchy#set-up-an-organization) 并管理 [SCIM tokens](/langsmith/user-management#set-up-scim-for-your-organization)。
  * [Disable model providers](/langsmith/model-configurations#disable-a-provider-for-the-organization) 适用于整个组织。
  * 来自用户界面的[Edit pending member invite roles](/langsmith/user-management#assign-a-role-to-a-user)。
  * 来自组织选项卡的[Restrict roles](/langsmith/rbac#restrict-roles)。
  * 工作区批量邀请处理现有组织成员而不是返回 409，并尊重[disabled organization invites](/langsmith/jit-invite-sso)。
  * 组织和工作区 ID 显示在主页上，[workspace switching](/langsmith/set-up-hierarchy#manage-and-navigate-workspaces) 保留您当前的页面。
  * 每月的 [usage graph](/langsmith/view-usage#aggregate-usage-on-self-hosted) 在在线自托管部署上自动显示。

  **下载 Helm 图表：** [⟦T260⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0/langsmith-0.16.0.tgz)
</Update>

<Update label="2026-08-04">
  ## langsmith-0.16.0-rc.29* 数据集和运行附件在自托管部署中预览、打开或下载之前解析了相对签名的下载 URL。
  * 修复了LangSmith MCP 服务器的动态客户端注册，以便向请求机密身份验证方法的客户端发出公共客户端而不是错误。
  * 启用回拨使用情况报告时，在线自托管安装会报告最终的沙箱正常运行时间和计费资源使用情况。离线安装和选择退出安装不会发送沙箱使用情况。
  * 仅当部署许可证包含沙箱访问时，自托管LangSmith才启用沙箱 API 和 UI 访问。
  * 在自托管部署表单中添加了 Redis CPU 和内存请求和限制，应用于 Kubernetes 操作员管理的 Redis 工作负载。

  **下载 Helm 图表：** [⟦T261⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.29/langsmith-0.16.0-rc.29.tgz)
</Update>

<Update label="2026-08-04">
  ## langsmith-0.16.0-rc.28* 从实验结果网格中更正评估者分数会立即更新单元格及其弹出窗口，无需刷新页面。
  * 引擎运行的 webhook 和沙箱链接从 `LANGSMITH_PUBLIC_API_ENDPOINT` 解析了外部可访问的 API 库，回退到 `LANGCHAIN_PLATFORM_ENDPOINT`，然后是 `LANGCHAIN_ENDPOINT`。仅设置 `LANGSMITH_PUBLIC_API_ENDPOINT` 的安装先前构建了相对 URL，这导致每个非影子引擎运行失败。
  * 添加了一个流沙箱执行请求，为无法持有 WebSocket 的客户端返回 stdout 和 stderr 作为服务器发送的事件。传递命令 ID 重用正在运行的命令，单独的恢复请求将继续中断的流。
  * 具有在线许可证密钥的自托管部署会自动显示每月组织使用情况图表，无需 `enable_monthly_usage_charts` 组织配置。离线部署现在指向“粒度使用”选项卡，以获取本地记录的计费使用情况。

  **下载 Helm 图表：** [⟦T267⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.28/langsmith-0.16.0-rc.28.tgz)
</Update>

<Update label="2026-08-01">
  ## langsmith-0.16.0-rc.27* 配置评估器窗格标题和模板导航在深色模式下绘制了与窗格本身相同的背景。
  * 自托管部署捕获了丢失的跟踪项目上次运行时间戳，因此项目排序反映了最近的历史活动。

  **下载 Helm 图表：** [⟦T268⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.27/langsmith-0.16.0-rc.27.tgz)
</Update>

<Update label="2026-07-31">
  ## langsmith-0.16.0-rc.26

  * 此版本打包了与 langsmith-0.16.0-rc.25 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.0-rc.25](#langsmith-0-16-0-rc-25)发行说明。

  **下载 Helm 图表：** [⟦T269⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.26/langsmith-0.16.0-rc.26.tgz)
</Update>

<Update label="2026-07-31">
  ## langsmith-0.16.0-rc.25

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T270⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.25/langsmith-0.16.0-rc.25.tgz)
</Update>

<Update label="2026-07-31">
  ## langsmith-0.16.0-rc.24* 对于使用 6.2 之前的 Redis 版本的自托管部署，跟踪项目活动和排序保持最新。
  * 数据集示例视图恢复了示例详细信息和选项卡导航之间的清晰间距。
  * 评估者入门导航与周围窗格的背景相匹配。
  * 评估者支出视图仅列出了所跟踪的网关路由提供商。
  * 实验比较网格中的元数据列（包括`example.metadata.<key>`）呈现其值而不是保持为空。
  * 无论浏览器报告的内容类型如何，上传`.csv`或`.jsonl`数据集都有效。 Windows 浏览器将 `.csv` 文件标记为 Excel 类型，此前这会导致有效上传失败。也接受大写文件名，例如 `DATASET.CSV`。

  **下载 Helm 图表：** [⟦T276⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.24/langsmith-0.16.0-rc.24.tgz)
</Update>

<Update label="2026-07-31">
  ## langsmith-0.16.0-rc.23

  * 将沙盒中的`langsmith` CLI 更新至 v0.2.44。它的请求现在在为 `/api` 下的 API 提供服务的自托管部署上解析，其中 `trace messages` 等命令和项目问题命令之前失败。
  * 当 ClickHouse 使用优化的运行表时，负反馈键过滤器正确返回匹配跟踪。**下载 Helm 图表：** [⟦T280⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.23/langsmith-0.16.0-rc.23.tgz)
</Update>

<Update label="2026-07-29">
  ## langsmith-0.16.0-rc.22

  * 粒度使用页面显示一条通知，即在自托管部署中不会跟踪长期跟踪使用情况，因此仅长期过滤器预计将返回零结果。

  **下载 Helm 图表：** [⟦T281⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.22/langsmith-0.16.0-rc.22.tgz)
</Update>

<Update label="2026-07-28">
  ## langsmith-0.17.0-rc.3

  * 此版本打包了与 langsmith-0.17.0-rc.1 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.1](#langsmith-0-17-0-rc-1)发行说明。

  **下载 Helm 图表：** [⟦T282⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.3/langsmith-0.17.0-rc.3.tgz)
</Update>

<Update label="2026-07-28">
  ## langsmith-0.16.0-rc.21

  * 此版本打包了与 langsmith-0.16.0-rc.20 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.0-rc.20](#langsmith-0-16-0-rc-20)发行说明。

  **下载 Helm 图表：** [⟦T283⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.21/langsmith-0.16.0-rc.21.tgz)
</Update>

<Update label="2026-07-28">
  ## langsmith-0.16.0-rc.20

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T284⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.20/langsmith-0.16.0-rc.20.tgz)
</Update>

<Update label="2026-07-27">
  ## langsmith-0.17.0-rc.2

  * 此版本打包了与 langsmith-0.17.0-rc.1 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.17.0-rc.1](#langsmith-0-17-0-rc-1)发行说明。

  **下载 Helm 图表：** [⟦T285⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.2/langsmith-0.17.0-rc.2.tgz)
</Update>

<Update label="2026-07-27">
  ## langsmith-0.17.0-rc.1* 引擎在支持的自托管部署中工作，无需 Eppo 部署配置，同时组织启用和现有权限仍然强制执行。

  **下载 Helm 图表：** [⟦T286⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.17.0-rc.1/langsmith-0.17.0-rc.1.tgz)
</Update>

<Update label="2026-07-27">
  ## langsmith-0.16.0-rc.19

  * 此版本打包了与 langsmith-0.16.0-rc.18 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.0-rc.18](#langsmith-0-16-0-rc-18)发行说明。

  **下载 Helm 图表：** [⟦T287⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.19/langsmith-0.16.0-rc.19.tgz)
</Update>

<Update label="2026-07-27">
  ## langsmith-0.16.0-rc.18

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T288⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.18/langsmith-0.16.0-rc.18.tgz)
</Update>

<Update label="2026-07-27">
  ## langsmith-0.15.17

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T289⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.17/langsmith-0.15.17.tgz)
</Update>

<Update label="2026-07-26">
  ## langsmith-0.16.0-rc.17

  * 此版本打包了与 langsmith-0.16.0-rc.16 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.0-rc.16](#langsmith-0-16-0-rc-16)发行说明。

  **下载 Helm 图表：** [⟦T290⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.17/langsmith-0.16.0-rc.17.tgz)
</Update>

<Update label="2026-07-25">
  ## langsmith-0.16.0-rc.16* 使用队列成员身份 ID 对记录上次审核时间的线程注释队列项提供反馈，因此会保存运行和线程的审核进度。
  * LLM Gateway 支出图表和表格将服务密钥的支出标记为“与任何用户无关”，而不是显示空白名称，并带有工具提示说明支出来自工作区范围或组织范围的密钥。
  * 在控制平面升级期间，混合部署仍与旧侦听器兼容，从而防止新部署排队。
  * LLM Gateway 监控支出仪表板上的支出份额列不再截断其标题文本。
  * LLM Gateway 监控页面“支出”选项卡中的统计卡和表标题的每个单词均大写，与其他地方使用的标题样式相匹配。
  * 在 LLM Gateway 监控日期范围选择器中选择特定的开始和结束日期会显示 UTC 格式的日期，并在按钮上附加“(UTC)”。相对范围（例如最近 7 天）不受影响。
  * 全新部署可以容忍未迁移的计费配置。
  * 自定义输出渲染器 URL 仅限于 HTTPS。* 修复了单源部署中`/api/v1/info` 的路由。
  * 来自跟踪项目的批量添加运行首先在数据集选择器中列出该项目的默认数据集。

  **下载 Helm 图表：** [⟦T292⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.16/langsmith-0.16.0-rc.16.tgz)
</Update>

<Update label="2026-07-24">
  ## langsmith-0.15.16

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T293⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.16/langsmith-0.15.16.tgz)
</Update>

<Update label="2026-07-24">
  ## langsmith-0.16.0-rc.15

  * 无（内部引擎分类行为，位于 `ISSUES_AGENT_MAIN_AGENT_SEMANTIC` 标志后面）。

  **下载 Helm 图表：** [⟦T295⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.15/langsmith-0.16.0-rc.15.tgz)
</Update>

<Update label="2026-07-21">
  ## langsmith-0.16.0-rc.14

  * 修复了当第一个聚合存储桶不完整时仪表板工具提示时间范围不正确的问题。
  * 通过将发送到评估器沙箱的运行负载修剪为仅评估器实际读取的内容，修复了在大型代理跟踪上失败的引擎问题检测评估器。

  **下载 Helm 图表：** [⟦T296⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.14/langsmith-0.16.0-rc.14.tgz)
</Update>

<Update label="2026-07-16">
  ## langsmith-0.16.0-rc.13

  * 此版本打包了与 langsmith-0.16.0-rc.12 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.0-rc.12](#langsmith-0-16-0-rc-12)发行说明。

  **下载 Helm 图表：** [⟦T297⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.13/langsmith-0.16.0-rc.13.tgz)
</Update>

<Update label="2026-07-09">
  ## langsmith-0.16.0-rc.12* 评估器分离确认对话框显示“分离”按钮而不是“删除”。

  * 包括向所有组织的代码评估人员提供的扩展统计信息。

  * 添加了两个专用权限 `bulk-exports:read` 和 `bulk-exports:manage` 用于获取和创建/更新批量导出。

  * 修复了当 GitHub 应用程序已通过同一组织中的另一个工作区安装时引擎“连接 GitHub”流程。

  * 在 `smith-frontend` 中将 `@langchain/langgraph-sdk` 提升至 1.9.4。

  * 在 `SMITH_ACE_SANDBOX_IMPLEMENTATION=v2` 后面添加了一个可选的 Smith-ACE v2 沙箱实现。

  * 线程表在“最后输出”列中显示实际的最后输出，并在新的“最后错误”列中显示线程级错误。

  * 在跟踪树视图中隐藏工具调用的 \$0.00 成本徽章。

  * 用户现在可以在同一代理上使用相同的表达式创建多个 cron 计划。

  * 代理生成器“查看代理跟踪”和“查看跟踪”链接始终在车队跟踪项目中打开。

  * 添加了`gemini-3.1-flash-lite`的LangSmith型号定价条目。

  * LLM 作为法官评估者现在可以选择包含扩展统计数据并映射来自 `run.*` 字段的提示变量。* 默认沙箱 rootfs 镜像包含 Docker Compose 并自动启动 Docker 守护进程。

  * 添加了`gemini-3.6-flash`的成本跟踪。

  * 网关支出上限策略现在可以配置为每周一次。

  * 添加 Centralize 作为 MCP 市场集成。

  *启用沙箱的代理在其系统提示符中看到配置的代理配置文件（主机、注入的标头密钥、网络规则、OAuth 提供程序），替换了旧的仅主机身份验证代理部分。

  * 在 `SANDBOX_FEATURE_ENABLED` 关闭的区域隐藏了沙箱导航条目和 `/sandboxes` 页面。

  * 自托管 DockerHub 镜像包含 Cosign 签名和签名的 SPDX SBOM 证明。

  * 修复了线程 id 中的特殊字符导致 UI 无法查询这些线程的错误。

  * 修复了打开大型跟踪时出现的“超出查询超时”错误。

  * 自托管 OIDC 修复了 SSO 组同步在登录期间静默无操作的问题。

  * 托管 Deep Agents 私有预览支持 MCP 服务器注册以及基于标头的身份验证。

  * 从 `queue` 工作人员发出 Prometheus 指标。

  * 澄清了应用文本过滤器时统计数据不可用的消息。* 上下文存储库支持元数据更新和从集线器溢出菜单中删除。

  * 舰队`/v1/fleet/agents/{agent_id}/connections`（列表/创建/删除）的键入响应和标准错误信封。

  * 沙箱快照现在可以导出沙箱内构建的 Docker 映像。

  * 修复了 ACE 子进程处理，以便早期子进程退出返回请求失败，而不是导致服务崩溃。

  * 修复了本机运行摄取有效负载中大整数的保留。

  * 瀑布转弯视图现在采用全高度（如果可用）。

  * 组织管理员现在可以禁用引擎，即使他们的计划自动启用它；他们的明确选择在用户界面和后端门中持续存在。

  * 工作区管理员现在可以从评估者侧面板基于每个评估者规则覆盖工作区默认的每周支出上限；非管理员将已解决的上限视为只读文本。

  * 修复了不正确的元数据方面建议，并改进了具有丰富运行元数据的项目的组统计延迟。

  * 运行计数、错误、延迟和成本的警报规则现在支持 `<`、`<=`、`>` 和 `>=` 比较运算符（之前 UI 只允许`>=`）。* 队列 `/v1/fleet/auth-agents/{agent_id}/connections` 端点已移至 `/v1/fleet/agents/{agent_id}/connections`，并具有键入响应、请求验证和标准队列错误包络。旧的 URL 返回 404。

  * 修复了删除活动代理后舰队重定向的问题。

  * 从 LangSmith 数据集表中删除了类型列。

  * 加密/编辑的“推理”内容块不再在跟踪消息视图中显示为空卡或乱码卡。有意义的扩展思维内容继续正常呈现。

  * 对于沙箱支持的代理，需要 `thread_scoped_sandbox` 或 `agent_scoped_sandbox` 队列代理 API。

  * 允许通过批量导出的新 `all_experiments` 参数导出工作区中的所有实验。每次导出仅限 250 个实验，可根据要求增加。

  * 没有面向用户的更改 - 仅内部 OpenAPI 规范更新。

  * Fleet 使用 langchain-fireworks 1.4.2 进行 Fireworks 模型调用。

  * 这使得运行详细信息面板得以重新设计，具有更高的可读性和更强大的消息解析。

  * Fleet/Agent Builder 包括 Gemini 3.5 Flash 作为可选的内置型号。

  * 计算机使用对符合资格的一般聊天用户有一个聊天内标注。

  * 修复了 Blob 存储横幅在页面加载时错误闪烁的错误。* 这启用了一种直接在运行详细信息面板中留下运行反馈的新方法。

  * 添加了对 Claude Opus 4.8 的代币定价支持。

  * Agent Builder 提供了 Claude Opus 4.8 作为内置 Anthropic 模型。

  * 组织管理员现在可以通过服务密钥 API 更新现有 API 密钥的角色，而无需轮换密钥。

  * 托管 Deep Agents MCP 服务器设置支持 `/v1/deepagents` API 命名空间下的 OAuth。

  * 当模型配置保存并在 Playground 中重新加载时，为 Bedrock Nova 2（以及任何其他需要驼峰命名法 API 字段的提供者）输入的额外参数现在保留其原始密钥大小写。

  * 自托管 OIDC 用户现在可以从 `name` / `given_name`+`family_name` id\_token 声明中解析出显示名称。

  * 修复了 LLM 网关数据保护错误，该错误在启用 PII 编辑时可能会损坏Anthropic 图像或文档。

  * 隐藏沙箱文件资源管理器控件，同时允许显式沙箱摘要下载。

  * 引擎支持可选的每月 LCU 支出限额（由财务、计划或组织管理员设置），一旦达到该限额，就会暂停新引擎的运行。* 当启用沙箱时，代理构建器/队列中的聊天输入文件上传在`/tmp/uploads/`到达沙箱文件系统。

  * 舰队默认值首先出现在符合条件的计划的模型选择器中。

  * 修复了项目统计侧边栏跟踪计数标签和标题布局。

  * 运行规则 Webhook 有效负载现在包含每次运行的 `trace_url` 深层链接。

  * 实验加载进度条显示实验表中完成和评估的运行次数。

  * 沙箱允许非 root 用户使用基于密码的 SSH，同时仅保留 root SSH 登录密钥。

  * 数据平面无访问屏幕上的工作区切换器仅列出当前组织工作区。

  * 恢复了自 2026 年 3 月上旬以来一直未能触发的企业舰队代理的 cron 执行。

  * 运行规则 Webhook 有效负载现在包含每次运行的 `trace_url` 深层链接。

  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-45736、CVE-2026-44664、CVE-2025-71176。

  **下载 Helm 图表：** [⟦T327⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.12/langsmith-0.16.0-rc.12.tgz)
</Update>

<Update label="2026-07-09">
  ## langsmith-0.16.0-rc.11

  * 评估器分离确认对话框显示“分离”按钮而不是“删除”。* 包含的扩展统计数据可供所有组织的代码评估人员使用。

  * 添加了两个专用权限，`bulk-exports:read` 和 `bulk-exports:manage`，用于获取和创建/更新批量导出。

  * 修复了当 GitHub 应用程序已通过同一组织中的另一个工作区安装时引擎“连接 GitHub”流程。

  * 在 `smith-frontend` 中将 `@langchain/langgraph-sdk` 提升至 1.9.4。

  * 在 `SMITH_ACE_SANDBOX_IMPLEMENTATION=v2` 后面添加了一个可选的 Smith-ACE v2 沙箱实现。

  * 线程表现在在 *Last Output* 列中显示实际的最后输出，并在新的 *Last Error* 列中显示线程级错误。

  * 在跟踪树视图中隐藏工具调用的 \$0.00 成本徽章。

  * 用户现在可以在同一代理上使用相同的表达式创建多个 cron 计划。

  * 代理生成器“查看代理跟踪”和“查看跟踪”链接始终在车队跟踪项目中打开。

  * 添加了`gemini-3.1-flash-lite`的LangSmith型号定价条目。

  * LLM 作为法官评估者现在可以选择包括来自 `run.*` 字段的扩展统计数据和地图提示变量。

  * 默认沙箱 rootfs 映像现在包含 Docker Compose 并自动启动 Docker 守护进程。

  * 添加了 `gemini-3.6-flash` 的成本跟踪。* 网关支出上限策略现在可以配置为每周一次。

  * 添加 Centralize 作为 MCP 市场集成。

  * 支持沙箱的代理现在可以在系统提示符中看到配置的代理配置文件（主机、注入的标头密钥、网络规则、OAuth 提供程序），从而替换旧的仅限主机的身份验证代理部分。

  * 在 `SANDBOX_FEATURE_ENABLED` 关闭的区域隐藏了沙箱导航条目和 `/sandboxes` 页面。

  * 自托管 DockerHub 映像现在包含 Cosign 签名和签名的 SPDX SBOM 证明。

  * 修复了线程 ID 中的特殊字符未编码，导致 UI 无法查询这些线程的错误。

  * 修复了打开大型跟踪时出现的“超出查询超时”错误。

  * 自托管 OIDC 修复了 SSO 组同步在登录期间静默无操作的问题。

  * 托管 Deep Agents 私人预览现在支持使用基于标头的身份验证进行 MCP 服务器注册。

  * 从 `queue` 工作人员发出 Prometheus 指标。

  * 澄清了应用文本过滤器时统计数据不可用的消息。

  * 上下文存储库现在支持元数据更新以及从 Hub 溢出菜单中删除。

  * 舰队`/v1/fleet/agents/{agent_id}/connections`（列表/创建/删除）的键入响应和标准错误信封。* 沙箱快照现在可以导出沙箱内构建的 Docker 映像。

  * 修复了 ACE 子进程处理，以便早期子进程退出返回请求失败，而不是导致服务崩溃。

  * 修复了本机运行摄取有效负载中大整数的保留。

  * 瀑布转弯视图现在采用全高度（如果可用）。

  * 组织管理员现在可以禁用引擎，即使他们的计划自动启用它；他们的明确选择在用户界面和后端门中持续存在。

  * 工作区管理员现在可以从评估者侧面板基于每个评估者规则覆盖工作区默认的每周支出上限；非管理员将已解决的上限视为只读文本。

  * 修复了不正确的元数据方面建议，并改进了具有丰富运行元数据的项目的组统计延迟。

  * 运行计数、错误、延迟和成本的警报规则现在支持 `<`、`<=`、`>` 和 `>=` 比较运算符（之前 UI 只允许`>=`）。

  * 队列 `/v1/fleet/auth-agents/{agent_id}/connections` 端点已移至 `/v1/fleet/agents/{agent_id}/connections`，并具有键入响应、请求验证和标准队列错误包络。旧的 URL 返回 404。

  * 修复了删除活动代理后舰队重定向的问题。* 从 LangSmith 数据集表中删除了类型列。

  * 加密/编辑的“推理”内容块不再在跟踪消息视图中显示为空卡或乱码卡。有意义的扩展思维内容继续正常呈现。

  * 对于沙箱支持的代理，队列代理 API 现在需要 `thread_scoped_sandbox` 或 `agent_scoped_sandbox`。

  * 允许通过批量导出的新 `all_experiments` 参数导出工作区中的所有实验，每次导出仅限 250 个实验，可以根据要求增加。

  * Fleet 使用 langchain-fireworks 1.4.2 进行 Fireworks 模型调用。

  * 这使得运行详细信息面板得以重新设计，具有更高的可读性和更强大的消息解析。

  * Fleet/Agent Builder 现在包含 Gemini 3.5 Flash 作为可选的内置模型。

  * 计算机使用现在针对符合资格的一般聊天用户提供了聊天内标注。

  * 修复了 Blob 存储横幅在页面加载时错误闪烁的错误。

  * 启用了一种直接在运行详细信息面板中留下运行反馈的新方法。

  * 添加了对 Claude Opus 4.8 的代币定价支持。

  * Agent Builder 现在提供 Claude Opus 4.8 作为内置 Anthropic 模型。* 组织管理员现在可以通过服务密钥 API 更新现有 API 密钥的角色，而无需轮换密钥。

  * 托管 Deep Agents MCP 服务器设置现在支持 `/v1/deepagents` API 命名空间下的 OAuth。

  * 当模型配置保存并在 Playground 中重新加载时，为 Bedrock Nova 2（以及任何其他需要驼峰命名法 API 字段的提供者）输入的额外参数现在保留其原始密钥大小写。

  * 自托管 OIDC 用户现在可以从 `name` / `given_name` + `family_name` id\_token 声明中解析出显示名称。

  * 修复了 `playground` 服务的 SSRF 策略，使其尊重 `SSRF_ALLOW_K8S_INTERNAL`。

  * 修复了 LLM 网关数据保护错误，当启用 PII 编辑时，该错误可能会损坏Anthropic 图像或文档。

  * 隐藏沙箱文件资源管理器控件，同时允许显式沙箱摘要下载。

  * 引擎现在支持可选的每月 LCU 支出限额（由财务、计划或组织管理员设置），一旦达到该限额，就会暂停新引擎的运行。

  * 当启用沙箱时，代理构建器/队列中的聊天输入文件上传现在在`/tmp/uploads/`到达沙箱文件系统。

  * 舰队默认现在首先出现在符合条件的计划的模型选择器中。* 修复了项目统计侧边栏跟踪计数标签和标题布局。

  * 恢复了一直无法触发的企业舰队代理的 cron 执行。

  * 运行规则 Webhook 有效负载现在包含每次运行的 `trace_url` 深层链接。

  * 实验加载进度条显示实验表中完成和评估的运行次数。

  * 沙箱现在允许非 root 用户使用基于密码的 SSH，同时仅保留 root SSH 登录密钥。

  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-45736、CVE-2026-44664、CVE-2025-71176。

  **下载 Helm 图表：** [⟦T358⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.11/langsmith-0.16.0-rc.11.tgz)
</Update>

<Update label="2026-07-09">
  ## langsmith-0.15.13* 添加了对新模型集成的支持，以增强自托管环境中的 AI 部署。
  * 通过简化的跟踪工具功能改进了 UI 体验，从而更好地洞察模型性能。
  * 修复了多个影响用户体验和 UI 响应能力的错误，从而使操作更加流畅。
  * 通过优化增强性能，以加快各种界面的加载速度。
  * 实施了新的 API 功能，以支持开发人员的扩展功能和集成选项。
  * 将安全改进与更新的身份验证和授权功能结合起来，以更好地保护自托管实例。

  **下载 Helm 图表：** [⟦T359⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.13/langsmith-0.15.13.tgz)
</Update>

<Update label="2026-07-08">
  ## langsmith-0.16.0-rc.10

  * 评估器分离确认对话框显示“分离”按钮而不是“删除”。

  * 包含的扩展统计数据可供所有组织的代码评估人员使用。

  * 添加了两个专用权限 `bulk-exports:read` 和 `bulk-exports:manage` 用于获取和创建/更新批量导出。

  * 修复了当 GitHub 应用程序已通过同一组织中的另一个工作区安装时引擎“连接 GitHub”流程。* 在 `smith-frontend` 中将 `@langchain/langgraph-sdk` 提升至 1.9.4。

  * 在 `SMITH_ACE_SANDBOX_IMPLEMENTATION=v2` 后面添加了一个可选的 Smith-ACE v2 沙箱实现。

  * 线程表现在在 *Last Output* 列中显示实际的最后输出，并在新的 *Last Error* 列中显示线程级错误。

  * 在跟踪树视图中隐藏工具调用的 \$0.00 成本徽章。

  * 用户可以在同一代理上使用相同的表达式创建多个 cron 计划。

  * 代理生成器“查看代理跟踪”和“查看跟踪”链接始终在车队跟踪项目中打开。

  * 添加了`gemini-3.1-flash-lite`的LangSmith型号定价条目。

  * LLM 作为法官评估者可以选择包括来自 `run.*` 字段的扩展统计数据和地图提示变量。

  * 默认沙箱 rootfs 镜像包含 Docker Compose 并自动启动 Docker 守护进程。

  * 添加了`gemini-3.6-flash`的成本跟踪。

  * 网关支出上限策略可以配置为每周一次。

  * 添加 Centralize 作为 MCP 市场集成。

  * 支持沙箱的代理现在可以在系统提示符中看到配置的代理配置文件（主机、注入的标头密钥、网络规则、OAuth 提供程序），从而替换旧的仅限主机的身份验证代理部分。* 在 `SANDBOX_FEATURE_ENABLED` 关闭的区域隐藏了沙箱导航条目和 `/sandboxes` 页面。

  * 自托管 DockerHub 镜像包含 Cosign 签名和签名的 SPDX SBOM 证明。

  * 修复了线程ID中的特殊字符未编码，导致UI无法查询这些线程的错误。

  * 修复了打开大型跟踪时出现的“超出查询超时”错误。

  * 自托管 OIDC 修复了 SSO 组同步在登录期间静默无操作的问题。

  * 托管 Deep Agents 私有预览支持 MCP 服务器注册以及基于标头的身份验证。

  * 从 `queue` 工作人员发出 Prometheus 指标。

  * 澄清了应用文本过滤器时统计数据不可用的消息。

  * 上下文存储库支持元数据更新和从集线器溢出菜单中删除。

  * 为舰队`/v1/fleet/agents/{agent_id}/connections`（列表/创建/删除）添加了键入的响应和标准错误信封。

  * 沙箱快照现在可以导出沙箱内构建的 Docker 映像。

  * 修复了 ACE 子进程处理，以便早期子进程退出返回请求失败，而不是导致服务崩溃。

  * 修复了本机运行摄取有效负载中大整数的保留。

  * 瀑布转弯视图采用全高度（如果有）。* 组织管理员可以禁用引擎，即使他们的计划自动启用它；他们的明确选择在用户界面和后端门中持续存在。

  * 工作区管理员可以从评估者侧面板以每个评估者规则为基础覆盖工作区默认的每周支出上限；非管理员将已解决的上限视为只读文本。

  * 修复了不正确的元数据方面建议，并改进了具有丰富运行元数据的项目的组统计延迟。

  * 支持运行计数、错误、延迟和成本的警报规则 `<`、`<=`、`>` 和 `>=` 比较运算符（之前 UI 只允许`>=`）。

  * 队列 `/v1/fleet/auth-agents/{agent_id}/connections` 端点已移至 `/v1/fleet/agents/{agent_id}/connections`，并具有键入响应、请求验证和标准队列错误包络。旧的 URL 返回 404。

  * 修复了删除活动代理后舰队重定向的问题。

  * 从 LangSmith 数据集表中删除了类型列。

  * 加密/编辑的“推理”内容块不再在跟踪消息视图中显示为空卡或乱码卡。有意义的扩展思维内容继续正常呈现。

  * 对于沙箱支持的代理，需要 `thread_scoped_sandbox` 或 `agent_scoped_sandbox` 队列代理 API。* 允许通过批量导出的新 `all_experiments` 参数导出工作区中的所有实验。每次导出仅限 250 个实验，可根据要求增加。

  * Fleet 使用 langchain-fireworks 1.4.2 进行 Fireworks 模型调用。

  * 这使得运行详细信息面板得以重新设计，具有更高的可读性和更强大的消息解析。

  * Fleet/Agent Builder 包括 Gemini 3.5 Flash 作为可选的内置型号。

  * 计算机使用对符合资格的一般聊天用户有一个聊天内标注。

  * 修复了 Blob 存储横幅在页面加载时错误闪烁的错误。

  * 启用了一种直接在运行详细信息面板中留下运行反馈的新方法。

  * 添加了对 Claude Opus 4.8 的代币定价支持。

  * Agent Builder 提供了 Claude Opus 4.8 作为内置 Anthropic 模型。

  * 组织管理员可以通过服务密钥 API 更新现有 API 密钥的角色，而无需轮换密钥。

  * 托管 Deep Agents MCP 服务器设置支持 `/v1/deepagents` API 命名空间下的 OAuth。* 当模型配置保存并在 Playground 中重新加载时，为 Bedrock Nova 2（以及任何其他需要驼峰式 API 字段的提供者）输入的额外参数保留了其原始密钥大小写。

  * 自托管 OIDC 用户从 `name` / `given_name`+`family_name` id\_token 声明中解析出显示名称。

  * 修复了 `playground` 服务的 SSRF 策略，使其尊重 `SSRF_ALLOW_K8S_INTERNAL`。

  * 修复了 LLM 网关数据保护错误，该错误在启用 PII 编辑时可能会损坏Anthropic 图像或文档。

  * 隐藏沙箱文件资源管理器控件，同时允许显式沙箱摘要下载。

  * 引擎支持可选的每月 LCU 支出限额（由财务、计划或组织管理员设置），一旦达到该限额，就会暂停新引擎的运行。

  * 当启用沙箱时，代理构建器/队列中的聊天输入文件上传在`/tmp/uploads/`到达沙箱文件系统。

  * 舰队默认值首先出现在符合条件的计划的模型选择器中。

  * 修复了项目统计侧边栏跟踪计数标签和标题布局。

  * 运行规则 Webhook 有效负载包含每次运行的 `trace_url` 深层链接。* 实验加载进度条显示实验表中完成和评估的运行次数。

  * 沙箱允许非 root 用户使用基于密码的 SSH，同时仅保留 root SSH 登录密钥。

  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-45736、CVE-2026-44664、CVE-2025-71176。

  **下载 Helm 图表：** [⟦T390⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.10/langsmith-0.16.0-rc.10.tgz)
</Update>

<Update label="2026-07-07">
  ## langsmith-0.16.0-rc.9

  * 此版本打包了与 langsmith-0.16.0-rc.8 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.0-rc.8](#langsmith-0-16-0-rc-8)发行说明。

  **下载 Helm 图表：** [⟦T391⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.9/langsmith-0.16.0-rc.9.tgz)
</Update>

<Update label="2026-07-02">
  ## langsmith-0.16.0-rc.8

  * 评估器分离确认对话框显示“分离”按钮而不是“删除”。

  * 包含的扩展统计数据可供所有组织的代码评估人员使用。

  * 添加了两个专用权限 `bulk-exports:read` 和 `bulk-exports:manage` 用于获取和创建/更新批量导出。

  * 修复了当 GitHub 应用程序已通过同一组织中的另一个工作区安装时引擎“连接 GitHub”流程。

  * 在 `smith-frontend` 中将 `@langchain/langgraph-sdk` 提升至 1.9.4。

  * 在 `SMITH_ACE_SANDBOX_IMPLEMENTATION=v2` 后面添加了一个可选的 Smith-ACE v2 沙箱实现。* 线程表现在在 *Last Output* 列中显示实际的最后输出，并在新的 *Last Error* 列中显示线程级错误。

  * 在跟踪树视图中隐藏工具调用的 \$0.00 成本徽章。

  * 用户现在可以在同一代理上使用相同的表达式创建多个 cron 计划。

  * 代理生成器“查看代理跟踪”和“查看跟踪”链接始终在车队跟踪项目中打开。

  * 添加了`gemini-3.1-flash-lite`的LangSmith型号定价条目。

  * LLM 作为法官评估者现在可以选择包括来自 `run.*` 字段的扩展统计数据和地图提示变量。

  * 默认沙箱 rootfs 映像现在包含 Docker Compose 并自动启动 Docker 守护进程。

  * 添加了 `gemini-3.6-flash` 的成本跟踪。

  * 网关支出上限策略现在可以配置为每周一次。

  * 添加 Centralize 作为 MCP 市场集成。

  * 支持沙箱的代理现在可以在系统提示符中看到配置的代理配置文件（主机、注入的标头密钥、网络规则、OAuth 提供程序），从而替换旧的仅限主机的身份验证代理部分。

  * 在 `SANDBOX_FEATURE_ENABLED` 关闭的区域隐藏沙箱导航条目和 `/sandboxes`​​ 页面。* 自托管 DockerHub 映像现在包含 Cosign 签名和签名的 SPDX SBOM 证明。

  * 修复了线程 ID 中的特殊字符未编码，导致 UI 无法查询这些线程的错误。

  * 修复了打开大型跟踪时出现的“超出查询超时”错误。

  * 自托管 OIDC：修复了登录期间静默无操作的 SSO 组同步。

  * 托管 Deep Agents 私人预览现在支持使用基于标头的身份验证进行 MCP 服务器注册。

  * 从 `queue` 工作人员发出 Prometheus 指标。

  * 澄清了应用文本过滤器时统计数据不可用的消息。

  * 上下文存储库现在支持元数据更新以及从 Hub 溢出菜单中删除。

  * 沙箱快照现在可以导出沙箱内构建的 Docker 映像。

  * 修复了 ACE 子进程处理，以便早期子进程退出返回请求失败，而不是导致服务崩溃。

  * 修复了本机运行摄取有效负载中大整数的保留。

  * 瀑布转弯视图现在采用全高度（如果可用）。

  * 组织管理员现在可以禁用引擎，即使他们的计划自动启用它；他们的明确选择在用户界面和后端门中持续存在。* 工作区管理员现在可以从评估者侧面板基于每个评估者规则覆盖工作区默认的每周支出上限；非管理员将已解决的上限视为只读文本。

  * 修复了不正确的元数据方面建议，并改进了具有丰富运行元数据的项目的组统计延迟。

  * 运行计数、错误、延迟和成本的警报规则现在支持 `<`、`<=`、`>` 和 `>=` 比较运算符（之前 UI 只允许`>=`）。

  * 队列 `/v1/fleet/auth-agents/{agent_id}/connections` 端点已移至 `/v1/fleet/agents/{agent_id}/connections`，并具有键入响应、请求验证和标准队列错误包络。旧的 URL 返回 404。

  * 修复了删除活动代理后舰队重定向的问题。

  * 从 LangSmith 数据集表中删除了类型列。

  * 加密/编辑的“推理”内容块不再在跟踪消息视图中显示为空卡或乱码卡。有意义的扩展思维内容继续正常呈现。

  * 对于沙盒支持的代理，队列代理 API 现在需要 `thread_scoped_sandbox` 或 `agent_scoped_sandbox`。

  * 允许通过批量导出的新 `all_experiments` 参数导出工作区中的所有实验。每次导出仅限 250 个实验，可根据要求增加。* 没有面向用户的更改 - 仅内部 OpenAPI 规范更新。

  * Fleet 使用 langchain-fireworks 1.4.2 进行 Fireworks 模型调用。

  * 这使得运行详细信息面板得以重新设计，具有更高的可读性和更强大的消息解析。

  * Fleet/Agent Builder 现在包含 Gemini 3.5 Flash 作为可选的内置模型。

  * 计算机使用现在针对符合资格的一般聊天用户提供了聊天内标注。

  * 修复了 Blob 存储横幅在页面加载时错误闪烁的错误。

  * 这启用了一种直接在运行详细信息面板中留下运行反馈的新方法。

  * 添加了对 Claude Opus 4.8 的代币定价支持。

  * Agent Builder 现在提供 Claude Opus 4.8 作为内置 Anthropic 模型。

  * 组织管理员现在可以通过服务密钥 API 更新现有 API 密钥的角色，而无需轮换密钥。

  * 托管 Deep Agents MCP 服务器设置现在支持 `/v1/deepagents` API 命名空间下的 OAuth。

  * 当模型配置保存并在 Playground 中重新加载时，为 Bedrock Nova 2（以及任何其他需要驼峰命名法 API 字段的提供者）输入的额外参数现在保留其原始密钥大小写。* 自托管 OIDC 用户现在可以从 `name` / `given_name`+`family_name` id\_token 声明中解析出显示名称。

  * 修复了 `playground` 服务的 SSRF 策略，使其尊重 `SSRF_ALLOW_K8S_INTERNAL`。

  * 修复了 LLM 网关数据保护错误，该错误在启用 PII 编辑时可能会损坏Anthropic 图像或文档。

  * 隐藏沙箱文件资源管理器控件，同时允许显式沙箱摘要下载。

  * 引擎现在支持可选的每月 LCU 支出限额（由财务、计划或组织管理员设置），一旦达到该限额，就会暂停新引擎的运行。

  * 当启用沙箱时，代理构建器/队列中的聊天输入文件上传现在在`/tmp/uploads/`到达沙箱文件系统。

  * 舰队默认现在首先出现在符合条件的计划的模型选择器中。

  * 修复了项目统计侧边栏跟踪计数标签和标题布局。

  * 数据平面无访问屏幕上的工作区切换器仅列出当前组织工作区。

  * 恢复了企业舰队代理的 cron 执行，这些代理自 2026 年 3 月上旬以来一直默默地未能启动。

  * 运行规则 Webhook 有效负载现在包含每次运行的 `trace_url` 深层链接。* 实验加载进度条显示实验表中完成和评估的运行次数。

  * 沙箱现在允许非 root 用户使用基于密码的 SSH，同时仅保留 root SSH 登录密钥。

  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-45736、CVE-2026-44664、CVE-2025-71176。

  **下载 Helm 图表：** [⟦T421⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.8/langsmith-0.16.0-rc.8.tgz)
</Update>

<Update label="2026-07-01">
  ## langsmith-0.16.0-rc.7

  * 修补了依赖项。

  * 确认 CI 绿色：祈祷：。

  * 评估器分离确认对话框显示“分离”按钮而不是“删除”。

  * 包含的扩展统计数据可供所有组织的代码评估人员使用。

  * 添加了两个专用权限 `bulk-exports:read` 和 `bulk-exports:manage` 用于获取和创建/更新批量导出。

  * 修复了当 GitHub 应用程序已通过同一组织中的另一个工作区安装时引擎“连接 GitHub”流程。

  * 将 `smith-frontend` 中的 `@langchain/langgraph-sdk` 提升至 1.9.4。

  * 在 `SMITH_ACE_SANDBOX_IMPLEMENTATION=v2` 后面添加了一个可选的 Smith-ACE v2 沙箱实现。

  * 线程表在“最后输出”列中显示实际的最后输出，并在新的“最后错误”列中显示线程级错误。* 在跟踪树视图中隐藏工具调用的 \$0.00 成本徽章。

  * 用户现在可以在同一代理上使用相同的表达式创建多个 cron 计划。

  * 代理生成器“查看代理跟踪”和“查看跟踪”链接始终在车队跟踪项目中打开。

  * 添加了`gemini-3.1-flash-lite`的LangSmith型号定价条目。

  * LLM 作为法官评估者现在可以选择包括来自 `run.*` 字段的扩展统计数据和地图提示变量。

  * 默认沙箱 rootfs 镜像包含 Docker Compose 并自动启动 Docker 守护进程。

  * 添加了 `gemini-3.6-flash` 的成本跟踪。

  * 网关支出上限策略现在可以配置为每周一次。

  * 添加 Centralize 作为 MCP 市场集成。

  * 支持沙箱的代理现在可以在系统提示符中看到配置的代理配置文件（主机、注入的标头密钥、网络规则、OAuth 提供程序），从而替换旧的仅限主机的身份验证代理部分。

  * 在 `SANDBOX_FEATURE_ENABLED` 关闭的区域隐藏了沙箱导航条目和 `/sandboxes` 页面。

  * 自托管 DockerHub 镜像包含 Cosign 签名和签名的 SPDX SBOM 证明。* 修复了线程 ID 中未编码特殊字符，导致 UI 无法查询这些线程的错误。

  * 修复了打开大型跟踪时出现的“超出查询超时”错误。

  * 自托管 OIDC：修复了登录期间静默无操作的 SSO 组同步。

  * 托管 Deep Agents 私有预览支持 MCP 服务器注册以及基于标头的身份验证。

  * 从 `queue` 工作人员发出 Prometheus 指标。

  * 澄清了应用文本过滤器时统计数据不可用的消息。

  * 上下文存储库现在支持元数据更新以及从 Hub 溢出菜单中删除。

  * 舰队`/v1/fleet/agents/{agent_id}/connections`（列表/创建/删除）的键入响应和标准错误包络。

  * 沙箱快照现在可以导出沙箱内构建的 Docker 映像。

  * 修复了 ACE 子进程处理，以便早期子进程退出返回请求失败，而不是导致服务崩溃。

  * 修复了本机运行摄取有效负载中大整数的保留。

  * 瀑布转弯视图采用全高度（如果有）。

  * 组织管理员现在可以禁用引擎，即使他们的计划自动启用它；他们的明确选择在用户界面和后端门中持续存在。* 工作区管理员现在可以从评估者侧面板基于每个评估者规则覆盖工作区默认的每周支出上限；非管理员将已解决的上限视为只读文本。

  * 修复了不正确的元数据方面建议，并改进了具有丰富运行元数据的项目的组统计延迟。

  * 运行计数、错误、延迟和成本的警报规则现在支持 `<`、`<=`、`>` 和 `>=` 比较运算符（之前 UI 只允许`>=`）。

  * 对于沙盒支持的代理，需要 `thread_scoped_sandbox` 或 `agent_scoped_sandbox` 队列代理 API。

  * 允许通过批量导出的新`all_experiments`参数导出工作区中的所有实验；每次导出仅限 250 个实验，可根据要求增加。

  * Fleet 使用 `langchain-fireworks 1.4.2` 进行 Fireworks 模型调用。

  * 重新设计了运行详细信息面板，提高了可读性和更强大的消息解析。

  * Fleet/Agent Builder 包括 Gemini 3.5 Flash 作为可选的内置型号。

  * 计算机使用对符合资格的一般聊天用户有一个聊天内标注。

  * 修复了 Blob 存储横幅在页面加载时错误闪烁的错误。* 启用了一种直接在运行详细信息面板中留下运行反馈的新方法。

  * 添加了对 Claude Opus 4.8 的代币定价支持。

  * Agent Builder 提供了 Claude Opus 4.8 作为内置 Anthropic 模型。

  * 组织管理员现在可以通过服务密钥 API 更新现有 API 密钥的角色，而无需轮换密钥。

  * 托管 Deep Agents MCP 服务器设置支持 `/v1/deepagents` API 命名空间下的 OAuth。

  * 当模型配置保存并在 Playground 中重新加载时，为 Bedrock Nova 2 和其他需要驼峰式 API 字段的提供者输入的额外参数保留了其原始的大写字母大小写。

  * 自托管 OIDC 用户收到从 `name` / `given_name`+`family_name` id\_token 声明解析的显示名称。

  * 修复了 `playground` 服务的 SSRF 政策以尊重 `SSRF_ALLOW_K8S_INTERNAL`。

  * 修复了 LLM 网关数据保护错误，该错误在启用 PII 编辑时可能会损坏Anthropic 图像或文档。

  * 隐藏沙箱文件资源管理器控件，同时允许显式沙箱摘要下载。

  * 引擎支持可选的每月 LCU 支出限额（由财务、计划或组织管理员设置），一旦达到该限额，就会暂停新引擎的运行。* 当启用沙箱时，代理构建器/队列中的聊天输入文件上传在`/tmp/uploads/`到达沙箱文件系统。

  * 舰队默认值首先出现在符合条件的计划的模型选择器中。

  * 修复了项目统计侧边栏跟踪计数标签和标题布局。

  * 数据平面无访问屏幕上的工作区切换器仅列出当前组织工作区。

  * 恢复了企业舰队代理的 cron 执行，这些代理自 2026 年 3 月上旬以来一直默默地未能启动。

  * 运行规则 Webhook 有效负载包含每次运行的 `trace_url` 深层链接。

  * 实验加载进度条显示实验表中完成和评估的运行次数。

  * 沙箱允许非 root 用户使用基于密码的 SSH，同时仅保留 root SSH 登录密钥。

  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-45736、CVE-2026-44664、CVE-2025-71176。

  **下载 Helm 图表：** [⟦T451⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.7/langsmith-0.16.0-rc.7.tgz)
</Update>

<Update label="2026-06-26">
  ## langsmith-0.16.0-rc.6

  * 评估器分离确认对话框显示“分离”按钮而不是“删除”。

  *“包括扩展统计信息”可供所有组织的代码评估人员使用。* 添加了两个专用权限，`bulk-exports:read` 和 `bulk-exports:manage`，用于获取和创建/更新批量导出。

  * 修复了当 GitHub 应用程序已通过同一组织中的另一个工作区安装时引擎“连接 GitHub”流程。

  * 在 `SMITH_ACE_SANDBOX_IMPLEMENTATION=v2` 后面添加了一个可选的 Smith-ACE v2 沙箱实现。

  * 线程表现在在 *Last Output* 列中显示实际的最后输出，并在新的 *Last Error* 列中显示线程级错误。

  * 在跟踪树视图中隐藏工具调用的 \$0.00 成本徽章。

  * 用户现在可以在同一代理上使用相同的表达式创建多个 cron 计划。

  * Agent Builder 的“查看代理跟踪”和“查看跟踪”链接始终在车队跟踪项目中打开。

  * 添加了`gemini-3.1-flash-lite`的LangSmith型号定价条目。

  * LLM 作为法官评估者现在可以选择“包括扩展统计数据”并从 `run.*` 字段映射提示变量。

  * 默认沙箱 rootfs 映像现在包含 Docker Compose 并自动启动 Docker 守护进程。

  * 添加了 `gemini-3.6-flash` 的成本跟踪。

  * 网关支出上限策略现在可以配置为每周一次。

  * 添加 Centralize 作为 MCP 市场集成。* 支持沙箱的代理现在可以在系统提示符中看到配置的代理配置文件（主机、注入的标头密钥、网络规则、OAuth 提供程序），从而替换旧的仅限主机的身份验证代理部分。

  * 在 `SANDBOX_FEATURE_ENABLED` 关闭的区域隐藏了沙盒导航条目和 `/sandboxes` 页面。

  * 自托管 DockerHub 映像现在包含 Cosign 签名和签名的 SPDX SBOM 证明。

  * 修复了线程ID中的特殊字符未编码，导致UI无法查询这些线程的错误。

  * 修复了打开大型跟踪时出现的“超出查询超时”错误。

  * 自托管 OIDC：修复了登录期间静默无操作的 SSO 组同步。

  * 托管 Deep Agents 私人预览现在支持使用基于标头的身份验证进行 MCP 服务器注册。

  * 从 `queue` 工作人员发出 Prometheus 指标。

  * 澄清了应用文本过滤器时统计数据不可用的消息。

  * 为舰队`/v1/fleet/agents/{agent_id}/connections`（列表/创建/删除）添加了键入的响应和标准错误信封。

  * 沙箱快照现在可以导出沙箱内构建的 Docker 映像。

  * 修复了 ACE 子进程处理，以便早期子进程退出返回请求失败，而不是导致服务崩溃。* 修复了本机运行摄取有效负载中大整数的保留。

  * 瀑布转弯视图现在采用全高度（如果可用）。

  * 组织管理员现在可以禁用引擎，即使他们的计划自动启用它；他们的明确选择在用户界面和后端门中持续存在。

  * 工作区管理员现在可以从评估者侧面板基于每个评估者规则覆盖工作区默认的每周支出上限；非管理员将已解决的上限视为只读文本。

  * 修复了不正确的元数据方面建议，并改进了具有丰富运行元数据的项目的组统计延迟。

  * 运行计数、错误、延迟和成本的警报规则现在支持 `<`、`<=`、`>` 和 `>=` 比较运算符（之前 UI 只允许`>=`）。

  * 对于沙箱支持的代理，队列代理 API 现在需要 `thread_scoped_sandbox` 或 `agent_scoped_sandbox`。

  * 允许通过批量导出的新 `all_experiments` 参数导出工作区中的所有实验（每次导出仅限 250 个实验，可以根据请求增加选项）。

  * 重新设计了运行详细信息面板，提高了可读性和更强大的消息解析。* Fleet/Agent Builder 现在包含 Gemini 3.5 Flash 作为可选的内置模型。

  * 计算机使用现在针对符合资格的一般聊天用户提供了聊天内标注。

  * 修复了 Blob 存储横幅在页面加载时错误闪烁的错误。

  * 添加了一种直接在运行详细信息面板中留下运行反馈的方法。

  * 添加了对 Claude Opus 4.8 的代币定价支持。

  * Agent Builder 现在提供 Claude Opus 4.8 作为内置 Anthropic 模型。

  * 组织管理员现在可以通过服务密钥 API 更新现有 API 密钥的角色，而无需轮换密钥。

  * 托管 Deep Agents MCP 服务器设置现在支持`/v1/deepagents` API 命名空间下的 OAuth。

  * 当模型配置保存并在 Playground 中重新加载时，为 Bedrock Nova 2（以及任何其他需要驼峰式 API 字段的提供者）输入的额外参数现在保留了其原始密钥大小写。

  * 自托管 OIDC 用户现在可以从 `name` / `given_name` + `family_name` id\_token 声明中解析出显示名称。

  * 修复了 `playground` 服务的 SSRF 策略，使其尊重 `SSRF_ALLOW_K8S_INTERNAL`。

  * 修复了 LLM 网关数据保护错误，该错误在启用 PII 修订时可能会损坏 Anthropic 图像或文档。* 隐藏沙箱文件资源管理器控件，同时允许显式沙箱摘要下载。

  * 引擎现在支持可选的每月 LCU 支出限额（由财务、计划或组织管理员设置），一旦达到该限额，就会暂停新引擎的运行。

  * 当启用沙箱时，代理构建器/队列中的聊天输入文件上传现在在`/tmp/uploads/`到达沙箱文件系统。

  * 舰队默认现在首先出现在符合条件的计划的模型选择器中。

  * 修复了项目统计侧边栏跟踪计数标签和标题布局。

  * 运行规则 Webhook 有效负载现在包含每次运行的 `trace_url` 深层链接。

  * 实验加载进度条显示实验表中完成和评估的运行次数。

  * 沙箱现在允许非 root 用户使用基于密码的 SSH，同时仅保留 root SSH 登录密钥。

  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-45736、CVE-2026-44664、CVE-2025-71176。

  **下载 Helm 图表：** [⟦T478⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.6/langsmith-0.16.0-rc.6.tgz)
</Update>

<Update label="2026-06-24">
  ## langsmith-0.15.12

  * 修补了依赖项。

  **下载 Helm 图表：** [⟦T479⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.12/langsmith-0.15.12.tgz)
</Update>

<Update label="2026-06-24">
  ## langsmith-0.16.0-rc.5* 此版本打包了与 langsmith-0.16.0-rc.4 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.16.0-rc.4](#langsmith-0-16-0-rc-4)发行说明。

  **下载 Helm 图表：** [⟦T480⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.5/langsmith-0.16.0-rc.5.tgz)
</Update>

<Update label="2026-06-18">
  ## langsmith-0.16.0-rc.4

  * 评估器分离确认对话框显示“分离”按钮而不是“删除”。

  *“包括扩展统计信息”可供所有组织的代码评估人员使用。

  * 添加了两个专用权限 `bulk-exports:read` 和 `bulk-exports:manage` 用于获取和创建/更新批量导出。

  * 修复了当 GitHub 应用程序已通过同一组织中的另一个工作区安装时引擎“连接 GitHub”流程。

  * 在 `smith-frontend` 中将 `@langchain/langgraph-sdk` 提升至 1.9.4。

  * 在 `SMITH_ACE_SANDBOX_IMPLEMENTATION=v2` 后面添加了一个可选的 Smith-ACE v2 沙箱实现。

  * 线程表现在在 *Last Output* 列中显示实际的最后输出，并在新的 *Last Error* 列中显示线程级错误。

  * 在跟踪树视图中隐藏工具调用的 \$0.00 成本徽章。

  * 用户现在可以在同一代理上使用相同的表达式创建多个 cron 计划。

  * Agent Builder 的“查看代理跟踪”和“查看跟踪”链接始终在车队跟踪项目中打开。* 添加了`gemini-3.1-flash-lite`的LangSmith型号定价条目。

  * LLM 作为法官评估者现在可以选择“包括扩展统计数据”并从 `run.*` 字段映射提示变量。

  * 默认沙箱 rootfs 映像现在包含 Docker Compose 并自动启动 Docker 守护进程。

  * 添加了`gemini-3.6-flash`的成本跟踪。

  * 网关支出上限策略现在可以配置为每周一次。

  * 添加 Centralize 作为 MCP 市场集成。

  * 支持沙箱的代理现在可以在系统提示符中看到配置的代理配置文件（主机、注入的标头密钥、网络规则、OAuth 提供程序），从而替换旧的仅限主机的身份验证代理部分。

  * 在 `SANDBOX_FEATURE_ENABLED` 关闭的区域隐藏沙箱导航条目和 `/sandboxes` 页面。

  * 自托管 DockerHub 映像现在包含 Cosign 签名和签名的 SPDX SBOM 证明。

  * 修复了线程ID中的特殊字符未编码，导致UI无法查询这些线程的错误。

  * 修复了打开大型跟踪时出现的“超出查询超时”错误。

  * 自托管 OIDC：修复了登录期间静默无操作的 SSO 组同步。* 托管 Deep Agents 私人预览现在支持使用基于标头的身份验证进行 MCP 服务器注册。

  * 从 `queue` 工作人员发出 Prometheus 指标。

  * 澄清了应用文本过滤器时统计数据不可用的消息。

  * 上下文存储库现在支持元数据更新以及从 Hub 溢出菜单中删除。

  * 添加了对 Claude Opus 4.8 的代币定价支持。

  * Agent Builder 现在提供 Claude Opus 4.8 作为内置 Anthropic 模型。

  * 组织管理员现在可以通过服务密钥 API 更新现有 API 密钥的角色，而无需轮换密钥。

  * 托管 Deep Agents MCP 服务器设置现在支持 `/v1/deepagents` API 命名空间下的 OAuth。

  * 当模型配置保存并在 Playground 中重新加载时，为 Bedrock Nova 2（以及任何其他需要驼峰命名法 API 字段的提供者）输入的额外参数现在保留其原始密钥大小写。

  * 自托管 OIDC 用户现在可以从 `name` / `given_name`+`family_name` id\_token 声明中解析出显示名称。

  * 修复了 `playground` 服务的 SSRF 策略，使其尊重 `SSRF_ALLOW_K8S_INTERNAL`。

  * 修复了 LLM 网关数据保护错误，该错误在启用 PII 编辑时可能会损坏Anthropic 图像或文档。* 隐藏沙箱文件资源管理器控件，同时允许显式沙箱摘要下载。

  * 引擎现在支持可选的每月 LCU 支出限额（由财务、计划或组织管理员设置），一旦达到该限额，就会暂停新引擎的运行。

  * 当启用沙箱时，代理构建器/队列中的聊天输入文件上传现在在`/tmp/uploads/`到达沙箱文件系统。

  * 舰队默认现在首先出现在符合条件的计划的模型选择器中。

  * 修复了项目统计侧边栏跟踪计数标签和标题布局。

  * 数据平面无访问屏幕上的工作区切换器仅列出当前组织工作区。

  * 恢复了企业舰队代理的 cron 执行，这些代理自 2026 年 3 月上旬以来一直默默地未能启动。

  * 运行规则 Webhook 有效负载现在包含每次运行的 `trace_url` 深层链接。

  * 实验加载进度条显示实验表中完成和评估的运行次数。

  * 沙箱现在允许非 root 用户使用基于密码的 SSH，同时仅保留 root SSH 登录密钥。

  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-45736、CVE-2026-44664、CVE-2025-71176。

  **下载 Helm 图表：** [⟦T500⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.4/langsmith-0.16.0-rc.4.tgz)
</Update><Update label="2026-06-18">
  ## langsmith-0.15.11

  * 改进了追踪UI，提升用户体验。
  * 修复了影响游乐场性能的错误。
  * 在自托管基础设施中添加了对 mTLS 的支持。
  * 添加了 Redis 集群兼容性，以实现更好的可扩展性。
  * 实施 PostgreSQL IAM 支持以增强数据库安全性。
  * 增强的流性能以减少加载时间。
  * 添加了新的 API 端点以扩展开发人员的能力。
  * 改进了 Agent Builder 界面，使用更加直观。
  * 更新了身份验证功能以提高自托管部署的安全性。

  **下载 Helm 图表：** [⟦T501⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.11/langsmith-0.15.11.tgz)
</Update>

<Update label="2026-06-15">
  ## langsmith-0.16.0-rc.3

  * 评估器分离确认对话框显示“分离”按钮而不是“删除”。

  * 包含的扩展统计数据可供所有组织的代码评估人员使用。

  * 添加了两个专用权限 `bulk-exports:read` 和 `bulk-exports:manage` 用于获取和创建/更新批量导出。

  * 修复了当 GitHub 应用程序已通过同一组织中的另一个工作区安装时引擎“连接 GitHub”流程。

  * 在 `smith-frontend` 中将 `@langchain/langgraph-sdk` 提升至 1.9.4。* 在 `SMITH_ACE_SANDBOX_IMPLEMENTATION=v2` 后面添加了一个可选的 Smith-ACE v2 沙箱实现。

  * 线程表现在在 *Last Output* 列中显示实际的最后输出，并在新的 *Last Error* 列中显示线程级错误。

  * 在跟踪树视图中隐藏工具调用的 \$0.00 成本徽章。

  * 用户现在可以在同一代理上使用相同的表达式创建多个 cron 计划。

  * Agent Builder“查看代理跟踪”和“查看跟踪”链接现在始终在车队跟踪项目中打开。

  * 添加了`gemini-3.1-flash-lite`的LangSmith型号定价条目。

  * LLM 作为法官评估者现在可以选择包括来自 `run.*` 字段的扩展统计数据和地图提示变量。

  * 默认沙箱 rootfs 映像现在包含 Docker Compose 并自动启动 Docker 守护进程。

  * 添加了`gemini-3.6-flash`的成本跟踪。

  * 网关支出上限策略现在可以配置为每周一次。

  * 添加 Centralize 作为 MCP 市场集成。

  * 支持沙箱的代理现在可以在其系统提示符中看到配置的代理配置文件（主机、注入的标头密钥、网络规则、OAuth 提供程序），替换旧的仅主机身份验证代理部分。* 在 `SANDBOX_FEATURE_ENABLED` 关闭的区域隐藏沙箱导航条目和 `/sandboxes` 页面。

  * 自托管 DockerHub 映像现在包含 Cosign 签名和签名的 SPDX SBOM 证明。

  * 修复了线程 ID 中的特殊字符未编码，导致 UI 无法查询这些线程的错误。

  * 修复了打开大型跟踪时出现的“超出查询超时”错误。

  * 自托管 OIDC：修复了登录期间静默无操作的 SSO 组同步。

  * 托管 Deep Agents 私人预览现在支持使用基于标头的身份验证进行 MCP 服务器注册。

  * 从 `queue` 工作人员发出 Prometheus 指标。

  * 澄清了应用文本过滤器时统计数据不可用的消息。

  * 上下文存储库现在支持元数据更新以及从 Hub 溢出菜单中删除。

  * 队列 `/v1/fleet/agents/{agent_id}/connections`（列出/创建/删除）端点的键入响应和标准错误包络。

  * 沙箱快照现在可以导出沙箱内构建的 Docker 映像。

  * 修复了 ACE 子进程处理，以便早期子进程退出返回请求失败，而不是导致服务崩溃。

  * 修复了本机运行摄取有效负载中大整数的保留。* 瀑布转弯视图现在采用全高度（如果有）。

  * 组织管理员现在可以禁用引擎，即使他们的计划自动启用它；他们的明确选择在用户界面和后端门中持续存在。

  * 工作区管理员可以从评估者侧面板按每个评估者规则覆盖工作区默认的每周支出上限，而非管理员则将已解决的上限视为只读文本。

  * 修复了不正确的元数据方面建议，并改进了具有丰富运行元数据的项目的组统计延迟。

  * 运行计数、错误、延迟和成本的警报规则现在支持 `<`、`<=`、`>` 和 `>=` 比较运算符（之前 UI 只允许`>=`）。

  * 队列`/v1/fleet/auth-agents/{agent_id}/connections`端点已移至`/v1/fleet/agents/{agent_id}/connections`，并具有键入响应、请求验证和标准队列错误信封；旧的 URL 返回 404。

  * 修复了删除活动代理后舰队重定向的问题。

  * 从 LangSmith 数据集表中删除了类型列。

  * 加密/编辑的“推理”内容块不再在跟踪消息视图中显示为空卡或乱码卡；有意义的扩展思维内容继续正常呈现。* 对于沙箱支持的代理，队列代理 API 现在需要 `thread_scoped_sandbox` 或 `agent_scoped_sandbox`。

  * 允许通过批量导出的新 `all_experiments` 参数导出工作区中的所有实验，每次导出仅限 250 个实验，并可根据要求增加。

  * Fleet 使用 langchain-fireworks 1.4.2 进行 Fireworks 模型调用。

  * 这使得运行详细信息面板得以重新设计，具有更高的可读性和更强大的消息解析。

  * Fleet/Agent Builder 现在包含 Gemini 3.5 Flash 作为可选的内置模型。

  * 计算机使用现在针对符合资格的一般聊天用户提供了聊天内标注。

  * 修复了 Blob 存储横幅在页面加载时错误闪烁的错误。

  * 这启用了一种直接在运行详细信息面板中留下运行反馈的新方法。

  * 添加了对 Claude Opus 4.8 的代币定价支持。

  * Agent Builder 现在提供 Claude Opus 4.8 作为内置 Anthropic 模型。

  * 组织管理员现在可以通过服务密钥 API 更新现有 API 密钥的角色，而无需轮换密钥。

  * 托管 Deep Agents MCP 服务器设置现在支持 `/v1/deepagents` API 命名空间下的 OAuth。* 当模型配置保存并在 Playground 中重新加载时，为 Bedrock Nova 2（以及任何其他需要驼峰命名法 API 字段的提供者）输入的额外参数现在保留其原始密钥大小写。

  * 自托管 OIDC 用户现在可以从 `name` / `given_name`+`family_name` id\_token 声明中解析出显示名称。

  * 修复了`playground`服务的SSRF策略，使其尊重`SSRF_ALLOW_K8S_INTERNAL`。

  * 修复了 LLM 网关数据保护错误，该错误在启用 PII 编辑时可能会损坏Anthropic 图像或文档。

  * 隐藏沙箱文件资源管理器控件，同时允许显式沙箱摘要下载。

  * 引擎现在支持可选的每月 LCU 支出限额（由财务、计划或组织管理员设置），一旦达到该限额，就会暂停新引擎的运行。

  * 当启用沙箱时，代理构建器/队列中的聊天输入文件上传现在在`/tmp/uploads/`到达沙箱文件系统。

  * 舰队默认现在首先出现在符合条件的计划的模型选择器中。

  * 修复了项目统计侧边栏跟踪计数标签和标题布局。

  * 数据平面无访问屏幕上的工作区切换器仅列出当前组织工作区。* 恢复了企业舰队代理的 cron 执行，这些代理自 2026 年 3 月上旬以来一直默默地未能启动。

  * 运行规则 Webhook 有效负载现在包含每次运行的 `trace_url` 深层链接。

  * 实验加载进度条现在显示实验表中已完成和评估的运行次数。

  * 沙箱现在允许非 root 用户使用基于密码的 SSH，同时仅保留 root SSH 登录密钥。

  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-45736、CVE-2026-44664、CVE-2025-71176。

  **下载 Helm 图表：** [⟦T532⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.3/langsmith-0.16.0-rc.3.tgz)
</Update>

<Update label="2026-06-11">
  ## langsmith-0.16.0-rc.2

  * 有关 0.16.0 候选版本的完整更改列表，请参阅下面的 [langsmith-0.16.0-rc.1](#langsmith-0-16-0-rc-1) 发行说明。

  **下载 Helm 图表：** [⟦T533⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.2/langsmith-0.16.0-rc.2.tgz)
</Update>

<Update label="2026-06-11">
  ## langsmith-0.15.10

  * 修补了依赖项。

  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-25087、CVE-2026-45134、CVE-2026-9256。

  **下载 Helm 图表：** [⟦T534⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.10/langsmith-0.15.10.tgz)
</Update>

<Update label="2026-06-09">
  ## langsmith-0.16.0-rc.1

  * 评估器分离确认对话框显示“分离”按钮而不是“删除”。

  * 包含的扩展统计数据可供所有组织的代码评估人员使用。* 添加了两个专用权限 `bulk-exports:read` 和 `bulk-exports:manage` 用于获取和创建/更新批量导出。

  * 修复了当 GitHub 应用程序已通过同一组织中的另一个工作区安装时引擎“连接 GitHub”流程。

  * 在 `smith-frontend` 中将 `@langchain/langgraph-sdk` 提升至 1.9.4。

  * 在 `SMITH_ACE_SANDBOX_IMPLEMENTATION=v2` 后面添加了一个可选的 Smith-ACE v2 沙箱实现。

  * 线程表现在在 *Last Output* 列中显示实际的最后输出，并在新的 *Last Error* 列中显示线程级错误。

  * 在跟踪树视图中隐藏工具调用的 \$0.00 成本徽章。

  * 现在可以使用相同的表达式多次创建同一代理上的类似 cron 计划。

  * 代理生成器“查看代理跟踪”和“查看跟踪”链接始终在车队跟踪项目中打开。

  * 添加了`gemini-3.1-flash-lite`的LangSmith型号定价条目。

  * LLM 作为法官评估者现在可以选择包含来自 `run.*` 字段的扩展统计数据和地图提示变量。

  * 默认沙箱 rootfs 映像现在包含 Docker Compose 并自动启动 Docker 守护进程。

  * 添加了`gemini-3.6-flash`的成本跟踪。

  * 网关支出上限策略现在可以配置为每周一次。* 添加 Centralize 作为 MCP 市场集成。

  * 支持沙箱的代理现在可以在系统提示符中看到配置的代理配置文件（主机、注入的标头密钥、网络规则、OAuth 提供程序），从而替换旧的仅限主机的身份验证代理部分。

  * 在 `SANDBOX_FEATURE_ENABLED` 关闭的区域隐藏了沙箱导航条目和 `/sandboxes` 页面。

  * 自托管 DockerHub 映像现在包含 Cosign 签名和签名的 SPDX SBOM 证明。

  * 修复了线程 ID 中的特殊字符未编码，导致 UI 无法查询这些线程的错误。

  * 修复了打开大型跟踪时出现的“超出查询超时”错误。

  * 自托管 OIDC：修复了 SSO 组在登录期间静默同步、无操作的问题。

  * 托管 Deep Agents 私人预览现在支持使用基于标头的身份验证进行 MCP 服务器注册。

  * 从 `queue` 工作人员发出 Prometheus 指标。

  * 澄清了应用文本过滤器时出现的“统计数据不可用”消息。

  * 上下文存储库现在支持元数据更新以及从 Hub 溢出菜单中删除。

  * 舰队 `/v1/fleet/agents/{agent_id}/connections` 的键入响应和标准错误信封（列表/创建/删除）。* 沙箱快照现在可以导出沙箱内构建的 Docker 映像。

  * 修复了 ACE 子进程处理，以便早期子进程退出返回请求失败，而不是导致服务崩溃。

  * 修复了本机运行摄取有效负载中大整数的保留。

  * 瀑布转弯视图现在采用全高度（如果可用）。

  * 组织管理员现在可以禁用引擎，即使他们的计划自动启用它；他们的明确选择在用户界面和后端门中持续存在。

  * 工作区管理员现在可以从评估者侧面板基于每个评估者规则覆盖工作区默认的每周支出上限；非管理员将已解决的上限视为只读文本。

  * 修复了不正确的元数据方面建议，并改进了具有丰富运行元数据的项目的组统计延迟。

  * 运行计数、错误、延迟和成本的警报规则现在支持 `<`、`<=`、`>` 和 `>=` 比较运算符（之前 UI 只允许`>=`）。

  * 队列 `/v1/fleet/auth-agents/{agent_id}/connections` 端点已移至 `/v1/fleet/agents/{agent_id}/connections`，并具有键入响应、请求验证和标准队列错误包络。旧的 URL 返回 404。

  * 修复了删除活动代理后舰队重定向的问题。* 从 LangSmith 数据集表中删除了类型列。

  * 加密/编辑的“推理”内容块不再在跟踪消息视图中显示为空卡或乱码卡。有意义的扩展思维内容继续正常呈现。

  * 对于沙箱支持的代理，队列代理 API 现在需要 `thread_scoped_sandbox` 或 `agent_scoped_sandbox`。

  * 允许通过批量导出的新 `all_experiments` 参数导出工作区中的所有实验。每次导出仅限 250 个实验，可根据要求增加。

  * Fleet 使用 langchain-fireworks 1.4.2 进行 Fireworks 模型调用。

  * 这使得运行详细信息面板得以重新设计，具有更高的可读性和更强大的消息解析。

  * Fleet/Agent Builder 现在包含 Gemini 3.5 Flash 作为可选的内置模型。

  * 计算机使用现在针对符合资格的一般聊天用户提供了聊天内标注。

  * 修复了 Blob 存储横幅在页面加载时错误闪烁的错误。

  * 这启用了一种直接在运行详细信息面板中留下运行反馈的新方法。

  * 添加了对 Claude Opus 4.8 的代币定价支持。

  * Agent Builder 现在提供 Claude Opus 4.8 作为内置 Anthropic 模型。* 组织管理员现在可以通过服务密钥 API 更新现有 API 密钥的角色，而无需轮换密钥。

  * 托管 Deep Agents MCP 服务器设置现在支持 `/v1/deepagents` API 命名空间下的 OAuth。

  * 当模型配置保存并在 Playground 中重新加载时，为 Bedrock Nova 2（以及任何其他需要驼峰命名法 API 字段的提供者）输入的额外参数现在保留其原始密钥大小写。

  * 自托管 OIDC 用户现在可以从 `name` / `given_name`+`family_name` id\_token 声明中解析出显示名称。

  * 修复了 `playground` 服务的 SSRF 策略，使其尊重 `SSRF_ALLOW_K8S_INTERNAL`。

  * 修复了 LLM 网关数据保护错误，当启用 PII 修订时，该错误可能会损坏Anthropic 图像或文档。

  * 隐藏沙箱文件资源管理器控件，同时允许显式沙箱摘要下载。

  * 引擎现在支持可选的每月 LCU 支出限额（由财务、计划或组织管理员设置），一旦达到该限额，就会暂停新引擎的运行。

  * 当启用沙箱时，代理构建器/队列中的聊天输入文件上传现在在`/tmp/uploads/`到达沙箱文件系统。

  * 舰队默认现在首先出现在符合条件的计划的模型选择器中。* 修复了项目统计侧边栏跟踪计数标签和标题布局。

  * 运行规则 Webhook 有效负载现在包含每次运行的 `trace_url` 深层链接。

  * 实验加载进度条显示实验表中完成和评估的运行次数。

  * 沙箱现在允许非 root 用户使用基于密码的 SSH，同时仅保留 root SSH 登录密钥。

  * 数据平面无访问屏幕上的工作区切换器仅列出当前组织工作区。

  * 恢复了企业舰队代理的 cron 执行，这些代理自 2026 年 3 月上旬以来一直默默地未能启动。

  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-45736、CVE-2026-44664、CVE-2025-71176。

  **下载 Helm 图表：** [⟦T565⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.16.0-rc.1/langsmith-0.16.0-rc.1.tgz)
</Update>

<Update label="2026-06-09">
  ## langsmith-0.15.9

  * 此版本包含与 langsmith-0.15.7 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.7](#langsmith-0-15-7)发行说明。

  **下载 Helm 图表：** [⟦T566⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.9/langsmith-0.15.9.tgz)
</Update>

<Update label="2026-06-08">
  ## langsmith-0.15.8

  * 此版本打包了与 langsmith-0.15.7 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.7](#langsmith-0-15-7)发行说明。

  **下载 Helm 图表：** [⟦T567⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.8/langsmith-0.15.8.tgz)
</Update>

<Update label="2026-06-06">
  ## langsmith-0.15.7* 添加了对 Playground 中 Amazon Bedrock 的 API 密钥身份验证的支持。 Bedrock API 密钥可让您使用不记名令牌（而不是 AWS 凭证）对请求进行身份验证。
  * 修复了以下两种情况的 LLM 身份验证代理：评估器批量请求和基岩模型配置。

  **下载 Helm 图表：** [⟦T568⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.7/langsmith-0.15.7.tgz)
</Update>

<Update label="2026-06-03">
  ## langsmith-0.15.6

  * 修复了 SSO 组同步中的一个错误，其中组名称分隔符被忽略并且行为不像 SCIM 同步。
  * 添加了结构化服务器日志，用于识别哪些工作区组声明已解决，哪些未解决，从而简化了 SSO 组同步诊断。
  * 修补了依赖项。

  **下载 Helm 图表：** [⟦T569⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.6/langsmith-0.15.6.tgz)
</Update>

<Update label="2026-06-02">
  ## langsmith-0.15.5

  * 修复了`playground`服务的SSRF策略，使其尊重`SSRF_ALLOW_K8S_INTERNAL`。
  * 修补了依赖项。
  * 修复了安全漏洞。有关详细信息，请参阅 CVE-2026-45736、CVE-2026-44664。

  **下载 Helm 图表：** [⟦T572⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.5/langsmith-0.15.5.tgz)
</Update>

<Update label="2026-06-01">
  ## langsmith-0.15.4

  * 此版本打包了与 langsmith-0.15.2 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.2](#langsmith-0-15-2)发行说明。

  **下载 Helm 图表：** [⟦T573⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.4/langsmith-0.15.4.tgz)
</Update>

<Update label="2026-05-29">
  ## langsmith-0.15.3* 此版本打包了与 langsmith-0.15.2 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.2](#langsmith-0-15-2)发行说明。

  **下载 Helm 图表：** [⟦T574⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.3/langsmith-0.15.3.tgz)
</Update>

<Update label="2026-05-29">
  ## langsmith-0.15.2

  * 修复了使用带有 `form_post` 回调的混合流的身份提供商的 OIDC 登录重定向循环 (`ERR_TOO_MANY_REDIRECTS`)。

  **下载 Helm 图表：** [⟦T577⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.2/langsmith-0.15.2.tgz)
</Update>

<Update label="2026-05-29">
  ## langsmith-0.15.1

  * 修复了 Blob 存储横幅在页面加载时错误闪烁的错误。
  * 修复了自托管 OIDC (v15) 中的问题，其中 SSO 组同步在登录期间静默无操作。

  **下载 Helm 图表：** [⟦T578⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.1/langsmith-0.15.1.tgz)
</Update>

<Update label="2026-05-26">
  ## langsmith-0.15.0LangSmith 自托管 v0.15 带来了**可重用的评估器和包含 30 多个评估器模板的库**，可在整个工作区集中评估，在注释队列中随参考输出提供**每个示例断言**，允许您下载 **Insights 报告** 作为 PDF 进行离线分析，并引入 **Context Hub** 用于对代理指令和工具进行版本控制、环境感知管理。升级前值得检查几个重大更改：`agent-bootstrap` 脚本已弃用，Agent Builder 重命名为 [Fleet](/langsmith/fleet) 可能需要工作负载身份服务帐户更新，以及 `projects:update-retention` 权限分为 `projects:increase-trace-tier` 和 `projects:decrease-trace-tier`。

  按照 [upgrade instructions](/langsmith/self-host-upgrades) 即可访问所有内容。要预订 LangChain 支持升级的时间，请通过 [Support Portal](https://support.langchain.com) 联系团队。

  ### 重大变更* 弃用了 `agent-bootstrap` 脚本。 LangSmith 代理现在是独立服务，使用 Helm 图表部署，而不是通过 LangSmith 部署控制平面。如果您之前通过此脚本使用[Fleet](/langsmith/fleet)，则可能需要迁移。请参阅 [Fleet rename and migration guide](https://kb.langchain.com/articles/9482666900-upgrading-self-hosted-langsmith-to-v0-15-fleet-rename-and-migration-guide) 或联系支持人员以逐步完成迁移。
  * 将 Agent Builder 重命名为 [Fleet](/langsmith/fleet)。如果您使用工作负载身份，则可能需要更新任何服务帐户。
  * 对于启用 [RBAC](/langsmith/rbac) 的组织，`POST /workspaces/current/members` 现在需要 `role_id`。没有它的请求返回`400`，而不是默认为`WORKSPACE_ADMIN`。
  * 弃用了 `USAGE_EXPORT_ADMIN_EMAILS` 环境变量。请使用 `INSTANCE_ADMIN_EMAILS` 代替。
  * 将 `projects:update-retention` 权限替换为 `projects:increase-trace-tier` 和 `projects:decrease-trace-tier`，以单独控制升高和降低跟踪保留。权限已回填到现有角色，因此无需对现有角色进行任何更改。新角色应使用新权限。参见[RBAC permissions](/langsmith/rbac)。
  * 添加了 `fleet-admin:read` 权限，用于控制新的舰队管理部分。现有租户的管理员需要授予它。权限已回填到现有角色，因此无需对现有角色进行任何更改。新角色应使用新权限。参见[RBAC permissions](/langsmith/rbac)。

  ### 基础设施变化* **来自舰队重命名的部分重命名** - 作为 Agent Builder 的一部分，多个部分被重命名为 [Fleet](/langsmith/fleet) 重命名（请参阅 [Breaking changes](#breaking-changes)）。您可能需要更新服务帐户或更改配置中的值。
  * **没有公共入口的 LLM 身份验证代理** - 如果部署的 LLM 身份验证代理没有公共入口，并且只能通过内部 Kubernetes 网络访问，则必须将 `SSRF_ALLOW_K8S_INTERNAL` 添加到进行 LLM 调用的所有服务，并将 `SSRF_ALLOW_PRIVATE_IPS_PLAYGROUND` 添加到 `playground` 服务。如果没有这些设置，内置 SSRF 保护将阻止对私有 IP 的请求。有关完整配置详细信息，请参阅[Deploy without a public ingress](/langsmith/llm-auth-proxy-self-hosted#deploy-without-a-public-ingress)。

  ### 新功能* **Context Hub** - 代理指令和工具的版本控制、环境感知管理。创建和管理版本化的[skill and agent repos](/langsmith/context-engineering-concepts)，促进对`staging`或`production`环境的提交，并在运行时通过环境标签解析上下文。请参阅 [Use the Context Hub](/langsmith/use-the-context-hub) 和 [Manage contexts with the SDK](/langsmith/manage-contexts-sdk) 开始使用。
  * **可重复使用的评估器和评估器模板** - 新的 [Evaluators](/langsmith/evaluators) 选项卡集中了工作区中的每个评估器，其中包含 30 多个模板，涵盖安全性、响应质量、轨迹、用户行为和多模式评估。在几秒钟内将现有评估器附加到新的跟踪项目，无需维护重复副本。
  * **按示例断言** - 在 [annotation queue](/langsmith/annotation-queues) 中编辑示例时，写入 [assertions](/langsmith/assertions) 代替参考输出或与参考输出一起编写。
  * **可下载的见解报告** — 从报告详细信息页面下载 PDF 格式的 [Insights](/langsmith/insights) 报告以进行离线分析。

  ### 管理员变更

  * **扩大了 ABAC 覆盖范围**—[ABAC](/langsmith/abac) 现在适用于 `POST /runs` 和 `POST /runs/batch` 上的 `runs:create`，以及其余的 `/sessions/{session_id}/` 端点。
  * **SCIM 电子邮件大小写不匹配修复** - 发送不同电子邮件大小写的身份提供商不再因电子邮件更改尝试而被拒绝。

  **下载 Helm 图表：** [⟦T603⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0/langsmith-0.15.0.tgz)
</Update><Update label="2026-05-26">
  ## langsmith-0.15.0-rc.17

  * 此版本打包了与 langsmith-0.15.0-rc.14 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.14](#langsmith-0-15-0-rc-14)发行说明。

  **下载 Helm 图表：** [⟦T604⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.17/langsmith-0.15.0-rc.17.tgz)
</Update>

<Update label="2026-05-21">
  ## langsmith-0.15.0-rc.16

  * 此版本打包了与 langsmith-0.15.0-rc.14 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.14](#langsmith-0-15-0-rc-14)发行说明。

  **下载 Helm 图表：** [⟦T605⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.16/langsmith-0.15.0-rc.16.tgz)
</Update>

<Update label="2026-05-20">
  ## langsmith-0.15.0-rc.15

  * 此版本打包了与 langsmith-0.15.0-rc.14 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.14](#langsmith-0-15-0-rc-14)发行说明。

  **下载 Helm 图表：** [⟦T606⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.15/langsmith-0.15.0-rc.15.tgz)
</Update>

<Update label="2026-05-20">
  ## langsmith-0.8.31

  * 此版本打包了与 langsmith-0.8.30 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.8.30](#langsmith-0-8-30)发行说明。

  **下载 Helm 图表：** [⟦T607⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.8.31/langsmith-0.8.31.tgz)
</Update>

<Update label="2026-05-18">
  ## langsmith-0.15.0-rc.14* 修复了自动化表中“启用”列的截断问题。
  * 通过修复 polly 按钮图标改进了 UI 中点击事件的处理。
  * 实现了多项 UI 增强功能，例如添加实心图标、图标 xs 变体和更新的详细信息视图标题。
  * 通过从会话统计信息中删除未使用的连接操作并优化查询处理来提高性能。
  * 添加了用于模型调用的新事件挂钩，并更新了舰队管理权限以包括读取访问权限。
  * 通过 GLM5 和 Minimax 2.5 的新工具扩展了模型支持。
  * 向评估器 UI 添加了新功能，包括按创建\_by、反馈键和资源进行筛选。
  * 评估器中可识别的外部类型定义，支持更复杂的反馈和排序选项。
  * 引入了加载改进，以便在各种 Fleet UI 组件中更好地处理数据。
  * 通过工具使用细分、支出限制执行和改进的使用仪表板来增强车队管理。
  * 添加了对跨 Go 写入端点的审核日志和敏感数据访问审核日志的支持。* 实施了新的安全功能，例如 SSRF 保护、透明 HTTP/HTTPS 代理以及自托管环境的增强授权。
  * 支持通过 GitHub OAuth 安装同步和 CRUD 操作进行服务识别。
  * 引入了适合移动设备的登录和渐进式 Web 应用程序 (PWA) 功能。
  * 添加了通过新端点邀请用户加入组织的功能。
  * 使用 SubAgentDetails 增强消息处理，促进更好的上下文捕获和管理。

  **下载 Helm 图表：** [⟦T608⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.14/langsmith-0.15.0-rc.14.tgz)
</Update>

<Update label="2026-05-14">
  ## langsmith-0.15.0-rc.13

  * 此版本打包了与 langsmith-0.15.0-rc.12 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.12](#langsmith-0-15-0-rc-12)发行说明。

  **下载 Helm 图表：** [⟦T609⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.13/langsmith-0.15.0-rc.13.tgz)
</Update>

<Update label="2026-05-14">
  ## langsmith-0.14.6

  * 通过将 S3 CopyObject KMS 标头向后移植到 v14 修复了存储问题，提高了 S3 集成的数据传输安全性。
  * 修复安全漏洞：CVE-2026-40192、CVE-2026-40347、CVE-2026-41205、CVE-2026-42561

  **下载 Helm 图表：** [⟦T610⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.14.6/langsmith-0.14.6.tgz)
</Update>

<Update label="2026-05-13">
  ## langsmith-0.15.0-rc.12* 修复了自动化表“启用”列中的截断问题，以提高 UI 可用性。
  * 改进了评估者详细信息页面，并添加了对创建和更新时间戳的排序功能。
  * 通过为类型、反馈键和资源单元添加类型过滤器和点击过滤功能来增强评估器表。
  * 添加了新的评估器重用功能，以简化现有评估器的使用。
  * 改进了前端评估器，包括反馈键和资源过滤器，增强了可用性。
  * 添加了对跟踪工具使用情况以及在使用情况仪表板中显示代理名称的支持，从而增强了性能洞察力。
  * 增强了登录界面的移动友好性和 PWA 支持。
  * 通过优化会话同步和索引策略提高性能。
  * 添加了对 ClickHouse 迁移的 mTLS 支持。
  * 在消息视图中添加了并行工具调用渲染，以便更好地直观地表示并发进程。
  * 引入了一个新端点，用于通过 JWT 更新自托管实例的许可证。
  * 添加了一个新的 UI 部分，用于显示创建问题板时所需的评估者操作。* 实施了适合移动设备的登录和可安装的 PWA，以增强移动用户的可访问性。
  * 增强的 DataGrid 组件可在跟踪视图中提供更好的 UI 性能。

  这些更新侧重于改进自托管部署的用户体验、性能、安全性和功能集。

  **下载 Helm 图表：** [⟦T611⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.12/langsmith-0.15.0-rc.12.tgz)
</Update>

<Update label="2026-05-11">
  ## langsmith-0.15.0-rc.10

  * 此版本打包了与 langsmith-0.15.0-rc.4 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.4](#langsmith-0-15-0-rc-4)发行说明。

  **下载 Helm 图表：** [⟦T612⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.10/langsmith-0.15.0-rc.10.tgz)
</Update>

<Update label="2026-05-09">
  ## langsmith-0.15.0-rc.9

  * 此版本打包了与 langsmith-0.15.0-rc.4 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.4](#langsmith-0-15-0-rc-4)发行说明。

  **下载 Helm 图表：** [⟦T613⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.9/langsmith-0.15.0-rc.9.tgz)
</Update>

<Update label="2026-05-08">
  ## langsmith-0.15.0-rc.8

  * 此版本打包了与 langsmith-0.15.0-rc.4 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.4](#langsmith-0-15-0-rc-4)发行说明。

  **下载 Helm 图表：** [⟦T614⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.8/langsmith-0.15.0-rc.8.tgz)
</Update>

<Update label="2026-05-08">
  ## langsmith-0.15.0-rc.7

  * 此版本打包了与 langsmith-0.15.0-rc.4 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.4](#langsmith-0-15-0-rc-4)发行说明。**下载 Helm 图表：** [⟦T615⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.7/langsmith-0.15.0-rc.7.tgz)
</Update>

<Update label="2026-05-06">
  ## langsmith-0.15.0-rc.6

  * 此版本打包了与 langsmith-0.15.0-rc.4 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.4](#langsmith-0-15-0-rc-4)发行说明。

  **下载 Helm 图表：** [⟦T616⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.6/langsmith-0.15.0-rc.6.tgz)
</Update>

<Update label="2026-05-05">
  ## langsmith-0.15.0-rc.5

  * 此版本打包了与 langsmith-0.15.0-rc.4 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.4](#langsmith-0-15-0-rc-4)发行说明。

  **下载 Helm 图表：** [⟦T617⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.5/langsmith-0.15.0-rc.5.tgz)
</Update>

<Update label="2026-05-04">
  ## langsmith-0.15.0-rc.4* 通过自动滚动导航、并行工具调用渲染和改进的样式增强了消息视图
  * 改进消息视图性能，提高内存利用率和处理时间
  * 通过复制到剪贴板功能在运行详细信息中添加了线程 ID 显示
  * 添加了在新选项卡中打开线程的功能
  * 修复深色模式渐变样式
  * 修复了 Fleet 中的 OAuth 刷新竞争条件
  * 修复了运行规则未将匹配的运行标记为在 Redis 中以最大尝试次数完成的情况
  * 修复了使用 group\_by thread\_id 错误创建的数据集评估器
  * 为没有现有规则的工作区添加了新的运行规则逻辑
  * 删除了舰队使用页面的自托管门
  * 游乐场中 GPT-5.x 模型的隐藏最小推理工作选项

  **下载 Helm 图表：** [⟦T618⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.4/langsmith-0.15.0-rc.4.tgz)
</Update>

<Update label="2026-05-01">
  ## langsmith-0.14.5

  * 修复了由于 `langgraph-api 0.8.3` 基础映像捆绑 `LangSmith 0.7.37`（通过固定 `LangSmith<0.7.34` 降级到兼容版本而删除了 `SandboxTemplate`）导致代理构建器无法在 v14 自托管 0.14.6 上启动的问题。

  **下载 Helm 图表：** [⟦T623⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.14.5/langsmith-0.14.5.tgz)
</Update>

<Update label="2026-04-30">
  ## langsmith-0.15.0-rc.3* 此版本打包了与 langsmith-0.15.0-rc.1 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.1](#langsmith-0-15-0-rc-1)发行说明。

  **下载 Helm 图表：** [⟦T624⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.3/langsmith-0.15.0-rc.3.tgz)
</Update>

<Update label="2026-04-29">
  ## langsmith-0.14.3

  * 修复了 OTLP/JSON (`Content-Type: application/json`) 跟踪摄取的 `traceId`、`spanId` 和 `parentSpanId` 静默损坏。
  * 降低了 Microsoft 365 文档和 Teams 私人消息工具的 Microsoft Graph 权限要求。

  **下载 Helm 图表：** [⟦T629⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.14.3/langsmith-0.14.3.tgz)
</Update>

<Update label="2026-04-24">
  ## langsmith-0.15.0-rc.2

  * 此版本打包了与 langsmith-0.15.0-rc.1 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.15.0-rc.1](#langsmith-0-15-0-rc-1)发行说明。

  **下载 Helm 图表：** [⟦T630⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.2/langsmith-0.15.0-rc.2.tgz)
</Update>

<Update label="2026-04-24">
  ## langsmith-0.15.0-rc.1* 通过扩大自动化表中的“启用”列以提高标题可见性，修复了截断问题。
  * 更新了详细信息视图标题以改善用户体验。
  * 通过从会话统计查询中删除 dead run\_stats\_facets 连接来提高性能。
  * 修复了 MCP 服务器过滤器下拉列表，使其可滚动。
  * 添加了“用户成本”表以及车队中代理/用户视图的切换。
  * 通过添加 JWT 注入的 URL 白名单强制来增强安全性。
  * 添加了在后端按创建和更新时间对评估器进行排序的功能。
  * 在评估者表中添加了“反馈键”过滤，以实现更精确的搜索。
  * 在全页跟踪视图上显示后退按钮以增强导航。
  * 修复了审核日志并进行了各种性能改进以降低延迟。
  * 通过在评估器列下拉列表中显示“反馈键”来增强用户界面。
  * 添加了会话见解、视图、元数据和仪表板端点，以提高数据可访问性。
  * 修复了文件创建问题以防止主动中断状态清除。
  * 为车队中的座席提供异步支持，以提高可靠性。
  * 修复了之前导致流程问题的代理克隆问题。* 增加了支出限制执行和跟踪使用情况的能力，增强了成本管理功能。
  * 通过舰队中的新技能记忆存储镜像更新，更有效地利用资源。
  * 改进了评估者重用用户体验，更好地管理评估者在问题生成时的操作。
  * 通过防止子代理触发未经授权的操作来增强安全功能。
  * 优化代理生成器聊天中的内存和资源管理。
  * 通过在 URL 中保留搜索模型来改进评估器跟踪详细信息导航。
  * 升级了每个环境的图标颜色，以确保登台和开发环境中的清晰度。
  * 会话同步性能改进，减少资源使用。
  * 在使用仪表板中添加了默认代理名称支持，以便报告生成更加清晰。
  * 对评估器详细信息进行了 UI 改进，以获得更流畅的体验。
  * 为沙箱环境启用自动唤醒和自动停止以节省资源。
  * 在问题创建中集成跟踪工具功能，以获得更好的上下文和可靠性。
  * 在导航中添加了“手动创建代理”按钮，以方便代理管理。* 增强的内存管理工具用户界面，以实现更好的审批流程可视化。
  * 修复了工具使用表并改进了其性能以获得更好的用户体验。
  * 启用对敏感数据访问端点的审核，以增强安全合规性。
  * 改进了使用情况仪表板中的跟踪项目名称显示，以提高项目清晰度。
  * 在编辑器页面中引入键盘快捷键以实现快速交互。
  * 将默认 MSP cron 计划设置为标准，以减少手动设置工作。
  * 添加集成用户流程和提示信息，以便顺利操作和理解。
  * 修复了对 Fleet 的默认跟踪项目选择，以防止不一致。

  **下载 Helm 图表：** [⟦T631⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.15.0-rc.1/langsmith-0.15.0-rc.1.tgz)
</Update>

<Update label="2026-04-20">
  ## langsmith-0.14.2

  * 此版本打包了与 langsmith-0.14.0 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.14.0](#langsmith-0-14-0)发行说明。

  **下载 Helm 图表：** [⟦T632⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.14.2/langsmith-0.14.2.tgz)
</Update>

<Update label="2026-04-20">
  ## langsmith-0.14.1

  * 此版本打包了与 langsmith-0.14.0 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.14.0](#langsmith-0-14-0)发行说明。

  **下载 Helm 图表：** [⟦T633⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.14.1/langsmith-0.14.1.tgz)
</Update>

<Update label="2026-04-20">
  ## langsmith-0.14.0LangSmith 自托管 v0.14 将 **Chat**（用于跟踪和运行的产品内聊天）引入自托管，采用 **ABAC 和审核日志** GA（默认情况下启用），并默认启用 **LLM Auth 代理**，并提供 URL 白名单和更丰富的 JWT 声明。管理员可以获得在 Agent Builder、Chat、Insights、Playground 和 Evaluators 之间共享的**统一模型配置**，以及细粒度的**提示所有者**，用于锁定谁可以升级或删除单个提示。评估人员获得**多模式支持**，工作区现在可以在跟踪项目上设置**成本警报**。 Playground 模型支持扩展（Anthropic，通过 Gemini Enterprise Agent Platform、自定义 Azure 模型、Bedrock 推理配置文件、Gemini 3.1 Pro、GPT-5.3 / 5.4、Baseten + GLM-5），以及适用于 Google Sheets & Docs、Outlook、Teams 和 Salesforce SOQL 的新代理工具和触发器。在基础设施方面，v0.14 增加了对 blob 存储的 **GCS Workload Identity** 支持、**Valkey** 作为直接的 Redis 替代品，以及用于更安全部署的预升级迁移挂钩。

  按照 [upgrade instructions](/langsmith/self-host-upgrades) 即可访问所有内容。要预订 LangChain 支持升级的时间，请通过 [Support Portal](https://support.langchain.com) 联系团队。

  ### 重大变更* 修复了`host-backend`无法接听`commonEnv`的问题。这可能会导致需要删除重复的环境变量。

  ### 基础设施变化

  * 现在，在映像版本推出之前，迁移作为 `Pre-upgrade` 挂钩运行。这将防止迁移失败时出现问题。
  * **GCS 工作负载身份支持** - 使用云本机工作负载身份而不是长期凭据对 GCS Blob 存储进行身份验证。
  * **Valkey 支持** - Valkey 现在可以用作 Redis 的直接替代品。

  ### 新功能* **自托管聊天** - 用于了解跟踪、运行和评估者反馈的产品内聊天现在可在自托管中使用。
  * **ABAC 和审核日志 GA** - 默认情况下为自托管部署启用基于属性的访问控制和审核日志。
  * **默认情况下启用 LLM 身份验证代理** - URL 白名单可防止将凭证转发到非预期主机，并且 JWT 现在携带 `organization_name` 和 `workspace_name` 声明。
  * **统一模型配置** - Agent Builder、Chat、Insights、Playground 和 Evaluators 现在共享一组模型配置，并通过工作区管理员控制跨所有 AI 功能的模型访问。
  * **提示所有者** - 指定一组具有细粒度权限的特定用户，以提升或删除单个提示，而无需授予更广泛的组织访问权限。
  * **多模式评估器** - 将附件和 Base64 内容（图像、音频、PDF）直接传递给评估器。
  * **跟踪项目的成本警报** — 设置跟踪项目级成本的警报以及现有的 LangSmith 警报。* **扩展的 Playground 模型支持** —Anthropic 通过 Gemini Enterprise Agent Platform、自定义 Azure 模型、Bedrock 推理配置文件和可配置的基本 URL、Gemini 3.1 Pro、GPT-5.3 / 5.4（现在默认）和 Baseten + GLM-5。
  * **新的代理工具和触发器** - Google 表格和文档、Outlook 邮件和日历、Microsoft Teams、Salesforce SOQL、带有刷新令牌的 Gmail OAuth v2 以及 Outlook 触发器。
  * **洞察增强** - 预定的洞察报告、随时间变化的类别趋势、分析中的完整反馈意见以及较低的最小工作间隔（6 小时 → 1 小时）。
  * **注释和审阅升级** - 每个队列所需的审阅者、遵守 `reviewer_access_mode` 的成对队列、“分配给我”过滤器、每个注释器 CSV 导出和批量表操作。
  * **提示中心和工具注册表** - 提交标签搜索、模板创建中的模型选择、工作区范围的工具注册表 API 和私有注册表 UI。
  * **评估器工作流程改进** - 预构建的 LLM 评估器默认使用严格的结构化输出，评估器支持标记和重用，重试不再丢失分数，并且新的 API 以编程方式运行游乐场实验。* **自定义 iframe 输出渲染器** - 在实验和跟踪视图中拖动以调整 HTML 图表输出的大小。
  * **线程和收件箱用户体验** - 自动生成的线程标题、重新设计的线程中的运行详细信息、会话级反馈统计信息、键盘快捷键以及过滤内部帮助线程。

  ### 管理员变更

  * **精细的使用情况报告** - 精细的计费使用 API，允许您检索按工作区、项目、用户或 API 密钥细分的详细跟踪使用数据。

  **下载 Helm 图表：** [⟦T640⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.14.0/langsmith-0.14.0.tgz)
</Update>

<Update label="2026-04-17">
  ## langsmith-0.13.43

  * 此版本打包了与 langsmith-0.13.42 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.42](#langsmith-0-13-42)发行说明。

  **下载 Helm 图表：** [⟦T641⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.43/langsmith-0.13.43.tgz)
</Update>

<Update label="2026-04-14">
  ## langsmith-0.13.42

  * 修复了元数据过滤中的问题，以将 json.Number 识别为原始类型，从而提高数据摄取的准确性。

  **下载 Helm 图表：** [⟦T642⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.42/langsmith-0.13.42.tgz)
</Update>

<Update label="2026-04-14">
  ## langsmith-0.13.41

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T643⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.41/langsmith-0.13.41.tgz)
</Update>

<Update label="2026-04-09">
  ## langsmith-0.13.40* 添加了对 mTLS 配置的支持，以增强自托管安全性。
  * 提高了舰队界面的加载速度。
  * 修复了跟踪 UI 中导致间歇性显示问题的错误。
  * 添加了对 Redis 集群的支持，提高了自托管部署的可扩展性。
  * 改进了 PostgreSQL IAM 集成，以便在自托管实例中实现更好的数据库管理。

  **下载 Helm 图表：** [⟦T644⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.40/langsmith-0.13.40.tgz)
</Update>

<Update label="2026-04-07">
  ## langsmith-0.13.39

  * 用户现在可以在没有`projects:create`的情况下运行实验，从而将实验执行与项目治理控制分离。
  * 在代理聊天线程之间切换时添加骨架加载状态，而不是空白聊天输入。
  * 改进了 Fleet Arcade 集成页面，以显示正确的操作和更清晰的后端状态。
  * Arcade 网关安装现在会在将无效的 MCP 服务器名称添加到工作区之前自动对其进行清理。
  * 用户现在可以在注释队列列表中看到分配的审阅者作为姓名芯片，并通过“分配给我”按钮过滤到他们分配到的队列。
  * 改进的运行详细信息悬停在跟踪树上，以减少在行之间单击或快速移动时的闪烁。* 修复了在大容量工作区启用反馈的情况下生成见解报告时的超时问题。
  * 当连接的用户无法访问已配置的 Arcade 项目时，Arcade 集成现在会显示权限错误，而不是一般的上游故障。
  * 在实验详细信息页面标题中添加了可点击的 ID 徽章，以便于复制实验 ID。
  * LLM 身份验证代理 JWT 现在包括 `organization_name` 和 `workspace_name` 声明。
  * 在评估器游乐场中添加了数据集拆分选择，允许用户对特定数据集拆分运行评估器实验。
  * 修复了实验比较视图，显示综合分数的矛盾改进箭头和回归单元格颜色。
  * 修复了从预压缩多部分 blob 存储对象中删除跟踪可能会破坏同一对象中其他跟踪的字节范围，从而在读取其有效负载时导致 416 错误的错误。
  * 修复了查看正在进行的跟踪中运行的工具时发生的崩溃。
  * 将 Insights 作业计划最小间隔从 6 小时降低到 1 小时，可通过 `CLIO_SCHEDULE_MIN_INTERVAL_SECONDS` 环境变量进行配置。
  * LLM 身份验证代理现在支持基于 JWT 的 LLM 身份验证的 Insights (CLIO) 服务身份。* 修复了在代理编辑器中删除子代理时，子代理文件不会从集线器存储库内存中删除的问题。
  * 简化了 Arcade 工作区连接状态，显示“工作区已配置”，而不是带有冗余徽章的令人困惑的“已连接帐户”标签。
  * 修复了在运行详细信息视图中展开工具调用并滚动离开导致其在再次滚动到视图中时折叠回来的错误。
  * 当启用集线器内存时，代理文件读取（克隆、检查、启动）现在可以正确使用集线器作为事实来源。
  * 修复了自定义输出渲染（通过 iframe 的 HTML 图表）在重新设计的实验详细信息窗格中不起作用的问题。
  * 默认情况下允许在自托管中使用 LLM Auth 代理。
  * 当启用 `RUNS_LITE_STATS_TENANTS` 时，会话分面原始路径现在返回输入/输出 KV 分面，与 Python 后端行为匹配。
  * 点击复制工具提示（例如项目 ID）现在响应工具提示内容本身的点击，而不仅仅是触发徽章。
  * 改进了平台后端的 MCP 服务器授权执行。
  * 添加 Baseten 作为模型提供者并支持 GLM-5。* 通过将系统提示中的日期精度从分钟级别降低到仅日期级别，提高了 LLM 推理效率。
  * 修复了当跟踪页面扩展到完整页面视图时 Polly 丢失跟踪上下文的问题。
  * 在舰队聊天中添加了一个统一的文件侧边栏，可通过标题中的“文件”按钮访问，以便在一个面板中浏览、搜索、创建、重命名、移动和预览所有代理生成的文件。
  * 添加了 `SSRF_ALLOW_PRIVATE_IPS_WEBHOOKS`、`SSRF_ALLOW_PRIVATE_IPS_MCP_SERVERS` 和 `SSRF_ALLOW_PRIVATE_IPS_TOOLS` 环境变量，以允许自托管部署连接到私有 IP 范围上的服务。
  * 向 Polly 添加了 `get_current_time` 工具，以便正确解析过滤器查询中的相对时间表达式。
  * 现在，参考输出在实验跟踪详细信息视图中始终可见，解决了某些组织隐藏参考输出的问题。
  * 修复了非个人代理的代理 OAuth 连接失败并出现“未知提供商”错误的问题。
  * 在游乐场和模型配置中添加了对基岩模型的基本 URL 配置支持，从而为代理或网关部署启用自定义端点 URL。
  * 在设置页面侧边栏添加退出按钮。
  * 当请求回填进度时，运行规则列表端点现在返回`backfill_id`。* SSO 用户无法再查看或接受对其自己的 SSO 组织以外的组织的待处理邀请。
  * 队列 Webhook 执行现在使用专用端点而不是 MCP 代理。
  * 在会话 API 中添加了会话级反馈统计信息，以与 Python 后端保持一致。
  * 改进了代理运行时请求的 MCP 代理授权和 URL 安全检查。

  **下载 Helm 图表：** [⟦T655⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.39/langsmith-0.13.39.tgz)
</Update>

<Update label="2026-04-03">
  ## langsmith-0.13.38

  * 修复了当 `HOST_BACKEND_ENDPOINT_PUBLIC` 缺少 `https://` 方案时 MCP OAuth 工具（例如 Hex、Notion）在自托管部署上失败的问题。
  * Insights 代理现在在分析跟踪时包含完整的反馈注释。
  * 删除了Fleet中原有的Feed页面；收件箱现在是所有租户的默认线程视图。
  * 修复了使用评估器重用功能时阻止用户创建评估器的权限错误。
  * 组织管理员现在可以通过“设置”>“角色”向工作区编辑者和自定义角色授予模型配置管理权限。
  * 成对注释队列现在遵循 `reviewer_access_mode`：仅指定审阅者的完成/存档逻辑门，并且 GET 响应包括 `assigned_reviewers`。* 代理聊天消息不再分组到可折叠的“已完成 N 个步骤”容器中。每回合最后一条 AI 消息上的单个副本下拉菜单可让您仅复制响应或包括工具输出在内的所有步骤。
  * 修复了瀑布视图中线程跟踪的分页问题，​​其中超过 20 圈的线程现在在滚动时加载额外的跟踪。
  * 修复了当 AI 调用没有附带文本的工具时，代理编辑器聊天中出现的“空消息”文本。
  * 在 Fleet 中添加了 Salesforce SOQL 查询工具，使代理能够通过 OAuth 查询 Salesforce 数据。
  * 当鼠标悬停在审阅统计徽章上时，注释队列运行列表项目现在会显示审阅者姓名和头像。
  * Go 会话统计信息现在返回 `run_facets` 中的 `feedback_key`、`feedback_key_score`、`feedback_value` 和 `feedback_source` 方面，与 Python 后端匹配。
  * 修复了当 `infoEndpointAuthRequired` 启用 SSO 身份验证时，`/info` 端点返回 401。
  * 在保存提示对话框的“触发 Webhook”部分添加了文档链接按钮，以便更轻松地访问 webhook 文档。
  * 修复了在流媒体期间卸载复制按钮导致的代理聊天布局变化。

  **下载 Helm 图表：** [⟦T667⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.38/langsmith-0.13.38.tgz)
</Update><Update label="2026-04-01">
  ## langsmith-0.13.37

  * 添加了 LLM 身份验证代理的 URL 允许列表，以防止将凭证转发到非预期主机。
  * 默认情况下为自托管部署启用审核日志。
  * MCP 服务器现在尊重 UI 中的精细 RBAC 权限；用户只能看到其角色允许的操作。
  * 默认情况下为自托管部署启用 ABAC。
  * 修复了OpenAI工具渲染的错误。

  **下载 Helm 图表：** [⟦T668⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.37/langsmith-0.13.37.tgz)
</Update>

<Update label="2026-03-30">
  ## langsmith-0.13.36

  * 此版本打包了与 langsmith-0.13.32 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.32](#langsmith-0-13-32)发行说明。

  **下载 Helm 图表：** [⟦T669⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.36/langsmith-0.13.36.tgz)
</Update>

<Update label="2026-03-27">
  ## langsmith-0.13.35

  * 此版本打包了与 langsmith-0.13.32 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.32](#langsmith-0-13-32)发行说明。

  **下载 Helm 图表：** [⟦T670⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.35/langsmith-0.13.35.tgz)
</Update>

<Update label="2026-03-27">
  ## langsmith-0.13.34

  * 此版本打包了与 langsmith-0.13.32 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.32](#langsmith-0-13-32)发行说明。

  **下载 Helm 图表：** [⟦T671⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.34/langsmith-0.13.34.tgz)
</Update>

<Update label="2026-03-27">
  ## langsmith-0.13.33* 此版本打包了与 langsmith-0.13.32 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.32](#langsmith-0-13-32)发行说明。

  **下载 Helm 图表：** [⟦T672⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.33/langsmith-0.13.33.tgz)
</Update>

<Update label="2026-03-27">
  ## langsmith-0.13.32

  * 增加了用户查找一流提供商帐户标签的能力。
  * 修复了切换警报没有相应切换图表的问题。
  * 修复了附件实验的关键错误。
  * 在代理横幅中添加了关闭按钮功能。
  * 改进了运行详细信息标题和比较跟踪的响应能力。
  * 在反馈芯片列表中添加截断属性以响应容器宽度。
  * 修复了重复汇总表中正文行的子像素出血问题。
  * 修复了 AQ 运行存档检查中的竞争条件。
  * 修补了 9 个中级安全警报和 4 个高安全警报。
  * 在比较详细信息窗格中将元数据重命名为属性。
  * 在 RepetitionDetailPane 中启用切换面板大小按钮。
  * 更新了前端的模型卡。
  * 修复了从实验表打开游乐场时加载提示选择器的问题。
  * 为没有标签权限的用户正确禁用环境升级按钮。* 为自托管实例启用粒度使用汇总 cron。
  * 为审计日志引入更多 CUD 操作。
  * 添加了 Ashby 集成迁移到 Agent Builder。
  * 通过并行化图形加载并消除 Agent Builder 中的冗余 MCP 获取来提高性能。
  * 自动展开/折叠按键以改进用户界面。
  * 修复了轨迹比较分隔符的蓝色悬停状态。
  * 使用 Smithbox 代理在沙箱启动期间避免了 MITM 竞争。
  * 修复了细粒度使用图表中的条形高度计算。
  * 添加了 Dynatrace Webhook 警报集成。
  * 在 Forge 中单击“立即运行”按钮时显示 toast 通知。
  * 处理 MCP OAuth 发现中的非字符串资源字段。
  * 添加了实验侧边栏重新设计的反馈横幅。
  * 在实验详细信息窗格中添加了示例附件。
  * 有线 Arcade 与 Agent Builder 中的真实 OAuth 流程集成。
  * 修复了重新验证期间在主机修订表中加载闪存的问题。
  * 修复了信任库主机后端的导入。
  * 在 Agent Builder 中向身份验证中间件错误日志添加了请求上下文。
  * 修复了评估器中的编辑提示功能。* 在新的实验详细信息窗格中获取完整的运行数据。

  **下载 Helm 图表：** [⟦T673⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.32/langsmith-0.13.32.tgz)
</Update>

<Update label="2026-03-23">
  ## langsmith-0.13.31

  * 此版本打包了与 langsmith-0.13.28 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.28](#langsmith-0-13-28)发行说明。

  **下载 Helm 图表：** [⟦T674⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.31/langsmith-0.13.31.tgz)
</Update>

<Update label="2026-03-23">
  ## langsmith-0.13.30

  * 此版本打包了与 langsmith-0.13.28 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.28](#langsmith-0-13-28)发行说明。

  **下载 Helm 图表：** [⟦T675⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.30/langsmith-0.13.30.tgz)
</Update>

<Update label="2026-03-21">
  ## langsmith-0.13.29

  * 此版本打包了与 langsmith-0.13.28 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.28](#langsmith-0-13-28)发行说明。

  **下载 Helm 图表：** [⟦T676⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.29/langsmith-0.13.29.tgz)
</Update>

<Update label="2026-03-21">
  ## langsmith-0.13.28* 修复了ABAC 权限检查以改进自托管实例功能。
  * 通过在解密直通标头时处理 DotDict 来增强代理构建器。
  * 改进了车队徽标，以提供更好的暗模式支持。
  * 更新了 Slack 重新授权所需消息，其中包含 Agent Builder 中集成页面的链接。
  * 添加了网络允许/拒绝列表功能。
  * 为沙盒代理引入了新的访问控制 UI。
  * 修复了存储中的 GCS 工作负载身份并添加了副本运行状况检查。
  * 减少了并发度并增加了计划洞察作业的超时时间。
  * 通过减少初始加载期间预加载块的数量来增强前端性能。
  * 在 localStorage 中添加了对 `/info` 和 `/auth/v1/user` 响应的缓存，以提高前端性能。
  * 在 Playground 服务中为身份验证代理启用 JWT 生成，以增强安全性。
  * 在后端重新创建反馈索引以优化存储。
  * 通过 Agent Builder 中的存储库所有权实现了工作区技能编辑的门控。
  * 为沙盒声明添加了静态 TTL 过期，以改进管理。
  * 在 Agent Builder 中为个人代理启用 Slack 通道。* 调整了浅色模式下运行状态图标的前端对比度，以获得更好的可视性。
  * 为法学硕士法官评估实施 JWT 生成，以增强评估安全性。
  * 始终在代理工作区卡片上显示创建者姓名，以提高透明度。
  * 重新排序收件箱选项卡以改进导航。
  * 支持自托管环境中的 Google IAP 会话刷新。
  * 替换了各个部分中的 MUI 复选框，以提高 UI 一致性。
  * 改进了实验评估器 SAQ 超时，与在线评估路径相匹配，以获得更好的性能。
  * 支持 k8s 平台上的 RDS 数据库实例，以增强基础设施灵活性。
  * 从 `LANGSMITH_SIGNING_JWKS` 加载了 LLM 身份验证代理 JWT 签名密钥，以符合安全标准。
  * 改进运行详情下拉设计，提供更好的用户体验。
  * 添加了对运行、会话和沙箱端点的服务密钥身份验证，以增强安全性。
  * 新增LangChain供应商提取器，增强消息处理能力。
  * 修复了与缓存读取相关的解析错误，该错误会影响更好的性能指标的成本。
  * 引入了对从秘密引用指定环境变量的支持，以改进配置管理。**下载 Helm 图表：** [⟦T680⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.28/langsmith-0.13.28.tgz)
</Update>

<Update label="2026-03-18">
  ## langsmith-0.13.27

  * 组织管理员现在可以从“设置”中的成员表内嵌编辑成员显示名称。
  * 多部分摄取请求不再接受输入、输出或事件作为内联字段。这些必须作为专用的带外部分发送。
  * 主页错误横幅上的跟踪支持电子邮件现在是可单击的 mailto 链接。
  * 改进了运行详细信息选项卡的突出显示，以便所选部分在滚动边界附近保持正确突出显示。
  * 改进了聊天助手工具提示中的键盘快捷键呈现。
  * 修复了 Slack 集成上的连接/断开按钮。
  * 添加提示环境支持。

  **下载 Helm 图表：** [⟦T681⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.27/langsmith-0.13.27.tgz)
</Update>

<Update label="2026-03-13">
  ## langsmith-0.13.26* 在舰队对话期间生成的子代理现在会在聊天中内嵌显示实时状态卡，并通过详细侧边栏显示子代理的实时时间线、工具调用和结果。
  * 预构建的 LLM 评估器现在默认使用严格的结构化输出模式。在 OpenAI 和非 OpenAI 模型提供者之间切换时，严格模式会自动切换。
  * 修复了当重试评估成功但总作业时间超过队列超时时在线评估器分数丢失的错误。
  * 现在，从注释队列中删除运行会完全删除它，而不是错误地将其标记为已完成。
  * 在实验 CSV 导出中包含每个注释者的反馈。
  * 上传输入或输出中包含无效 UTF-8 的数据集示例现在会返回 422 错误，而不是 500。
  * 减少了 dev 和 dev\_free 自托管部署的 CPU 和内存要求。
  * 在启动时拒绝不安全的默认 JWT 密钥以提高安全性。
  * 更新了中性背景和表面的品牌颜色。
  * 将提示使用示例标签从“在LangChain中使用对象”重命名为“以编程方式使用”。* 修复了代理 zip 上传，以将 cron 计划正确放置在“计划”部分中。
  * 收件箱现在按新近度对“全部”选项卡进行排序，并在预览中正确包装长消息。
  * 修复了聊天助手工具提示在聊天框后面的渲染。
  * 添加ABAC授权中间件。

  **下载 Helm 图表：** [⟦T682⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.26/langsmith-0.13.26.tgz)
</Update>

<Update label="2026-03-12">
  ## langsmith-0.13.25

  * 此版本打包了与 langsmith-0.13.24 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.24](#langsmith-0-13-24)发行说明。

  **下载 Helm 图表：** [⟦T683⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.25/langsmith-0.13.25.tgz)
</Update>

<Update label="2026-03-10">
  ## langsmith-0.13.24* 在 Fleet 中添加了带有工具栏和斜线命令的丰富 Markdown 编辑器。
  * 添加了技能创建流程，包括舰队中的页面输入和导航。
  * 注释队列 CSV 导出现在包括每个注释者的反馈分数和审阅者注释列。
  * 修复了数据集元数据过滤器不匹配跨页面的数字字段的问题。
  * 修复了数据集表仅在高屏幕上显示第一页结果的问题。
  * 针对错误、输入和输出的类似/不类似过滤器警报现在可以正确匹配单个标记而不是完整短语。
  * 修复了当 LangSmith API 返回错误时`list_runs` 工具崩溃的问题。
  * 修复了 Gemini 型号系统提示中的杂散伪影。
  * 现在接受组织邀请会导航到新加入的组织。
  * 改进了流输出期间的 Playground 自动滚动。
  * 添加了个人 API 密钥的工作区范围显示。
  * 将 Python 升级到 3.13 并固定 OpenSSL 以解决安全漏洞。
  * 阻止构建/安装命令中的 shell 注入字符。
  * 改进了 Polly 助手对轨迹和运行的理解。
  * 修复了初始页面加载时未显示的基线实验统计数据。* 修复了见解时间序列图表上重复的 x 轴日期标签。
  * 重新启用 ABAC 以列出数据集。
  * 添加了ABAC 运行删除端点。

  **下载 Helm 图表：** [⟦T685⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.24/langsmith-0.13.24.tgz)
</Update>

<Update label="2026-03-07">
  ## langsmith-0.13.23

  * 修复了 smith-frontend 中的安全漏洞。
  * 修复了 smith-polly 中的安全漏洞。
  * 修复了代码注入漏洞。
  * 限制 `--allow-run` 仅适用于 smith-ace 中的 deno 二进制文件。
  * 通过在 RichTextEditor 中转义 URL 修复了 XSS 漏洞。
  * 修复了自托管环境中的 Playground 功能。

  **下载 Helm 图表：** [⟦T687⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.23/langsmith-0.13.23.tgz)
</Update>

<Update label="2026-03-06">
  ## langsmith-0.13.21

  * 此版本打包了与 langsmith-0.13.20 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.20](#langsmith-0-13-20)发行说明。

  **下载 Helm 图表：** [⟦T688⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.21/langsmith-0.13.21.tgz)
</Update>

<Update label="2026-03-06">
  ## langsmith-0.13.20* 添加了 JSON/YAML 语法突出显示以进行实验比较，以获得更好的可读性。
  * 改进了前端的线程跟踪打开行为，不再需要扩展按钮。
  * 消除了后端列出个人访问令牌的 n+1 查询问题，提高了性能。
  * 修复了对带有 smith-polly 集成的 OpenAI 兼容端点的支持。
  * 超时批量导出卡在`CREATED`状态以避免无限期处理。
  * 解决了创建存储库端点时阻止服务身份访问的问题。
  * 在实验会话元数据中记录集线器提示提交，以实现更好的会话跟踪。
  * 改进了 /sessions 影子查询的身份验证。
  * 使用ABAC（基于属性的访问控制）更新了后端部署。
  * 增强了 UI，包含项目和运行写入权限支持。
  * 添加了对新型号的支持：GPT-5.4 和 GPT-5.4 pro。
  * 修复大附件图片预览问题，以获得更好的 UI 体验。
  * 将 GPT-5.4 设为默认的OpenAI游乐场模型，简化模型选择。
  * 增加了`RunTags`组件中显示的最大标签数，以获得更好的可见性。* 在实验表中添加模型和提示列，增强数据洞察力。
  * 解决了限制设置更改时代理生成器运行拒绝的问题。
  * 修复了 /sessions go 端点中的浮动错误，以改进数据处理。
  * Redis缓存`SET`故障时返回取值，提高可靠性。
  * 为代理构建器、Polly 和 Insights 功能启用了 AWS IAM 角色支持。
  * 重新设计前端自定义图表CRUD，提高用户满意度。
  * 在实验表中引入提示过滤，以进行有针对性的数据分析。
  * 更新了 Agent Builder 中的收件箱计数和线程获取逻辑以获取实时信息。
  * 添加了通过提示对实验进行分组的功能，以简化数据管理。

  **下载 Helm 图表：** [⟦T692⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.20/langsmith-0.13.20.tgz)
</Update>

<Update label="2026-03-06">
  ## langsmith-0.13.19

  * 此版本打包了与 langsmith-0.13.18 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.18](#langsmith-0-13-18)发行说明。

  **下载 Helm 图表：** [⟦T693⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.19/langsmith-0.13.19.tgz)
</Update>

<Update label="2026-03-05">
  ## langsmith-0.13.18* 在线程中引入了重新设计的运行详细信息视图，以改善用户体验。
  * 修复了弹出窗口覆盖 UI 中其他内容的问题。
  * 将 Microsoft Outlook 日历工具添加到 Agent Builder 中以进行集成。
  * 解决了与 Agent Builder 中的代理聊天弹出窗口和占位符相关的错误。
  * 改进了对在自托管实例中禁用反馈评论过滤的支持。
  * 通过改进前端的代码分割来增强性能。
  * 添加了对 GPT 5.3 instant 和 GPT-5.3-chat-latest 的模型支持。
  * 引入了新的 single\_run 过滤器类型，以实现更精细的查询。
  * 增加了阅读见解报告并显示随时间变化的见解类别的功能。
  * 添加了拖动调整大小功能，并在自定义 iframe 输出渲染器中保持持久性。
  * 通过更强大的用户迁移流程增强安全性。
  * 为评估者启用标签支持并增强其重用功能。
  * 修复了注销后会话过期警告的问题。
  * 增强的 UI 组件，可在 Playground 中实现更好的用户交互和反馈标记。
  * 改进了数据集中的元数据处理并修复了溢出问题。* 在 Agent Builder 中引入了对 Microsoft Teams 工具的支持。
  * 更好地处理 OAuth 提供程序更新。
  * 在平台后端添加了新的 /orgs/current/info 端点，以实现更强大的组织信息检索。
  * 引入了会话 API 的兼容性测试，并增加了 PostgreSQL 和 Redis 连接的安全检查。
  * 新增动态绑定Slack代理的功能，增强集成体验。

  **下载 Helm 图表：** [⟦T694⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.18/langsmith-0.13.18.tgz)
</Update>

<Update label="2026-03-03">
  ## langsmith-0.13.17* 修复了新操作员版本的执行程序部署处理中的错误。
  * 添加了一个设置来过滤收件箱中的内部帮助线程。
  * 通过提供 Polly 反馈的上下文来改进评估者页面。
  * 对数据集代码评估器进行强制跟踪过滤以增强稳定性。
  * 更新了OAuth模式管理，限制更新期间的更改。
  * 修复了实验单元颜色的问题，以提高用户清晰度。
  * 改进了使用配置模式，以利用新的 TTL 端点进行跟踪保留。
  * 解决了工作区邀请未在 UI 中正确显示的错误。
  * 应用深色模式下的品牌颜色调整和各种 UI 元素。
  * 通过防止潜在的反射 XSS 漏洞来增强 OAuth 回调安全性。
  * 添加了用于用户管理的动态 OAuth 功能。
  * 修复了满足某些条件时阻止过滤器更新的错误。
  * 实施了身份验证屏幕的品牌重塑更新。
  * 添加了在小视口上自动折叠侧边栏的功能。
  * 修复了 Playground 评估模式中变量处理的问题。* 通过无限滚动和改进的收件箱获取增强了代理生成器。
  * 在 Agent Builder 中添加了新的 Outlook 触发器功能。
  * 升级代理构建器以使用 websockets 和新的 OpenAI 模型 API (gpt-5.3-codex)。
  * 修复了入职过程中 API 密钥自动保存的问题。
  * 解决了由于空占位符而导致 Playground 出现错误的问题。
  * 使用新的图标图标更新了前端。
  * 修复了 Gmail/Outlook 的 cron 部署中的授权错误。
  * 更新了各种 UI 组件中的样式，包括工作室按钮和索引列行为。
  * 增强了入门片段，以便更好地与 Langchain Python 集成。
  * 添加了对[custom separators in SCIM group names](/langsmith/user-management#configure-custom-separator)的支持。

  **下载 Helm 图表：** [⟦T695⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.17/langsmith-0.13.17.tgz)
</Update>

<Update label="2026-02-26">
  ## langsmith-0.13.16

  * 此版本打包了与 langsmith-0.13.15 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.15](#langsmith-0-13-15)发行说明。

  **下载 Helm 图表：** [⟦T696⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.16/langsmith-0.13.16.tgz)
</Update>

<Update label="2026-02-26">
  ## langsmith-0.13.15* Added rebranded primary colors to button under feature flag in the frontend UI.
  * 将数据集自动完成替换为标签输入，以改善用户体验。
  * Auto-hide and position Models column in the frontend based on data.
  * Fixed revalidation conflict in the Smith frontend.
  * Improved workspace model configurations to prevent text overflow with tooltips.
  * Surfaced Models option in Group By popover under a feature flag.
  * Supported loading ChatAnthropicVertex model configs in Smith-Polly.
  * Added "No matching filters" message for empty search results in Filter Component Select V2.
  * Enabled navigating automatically to insights with global scroll support.
  * Resolved issues with playground and evaluators provider selector not filtering out disabled providers.
  * 改进了消息模式的用户体验和样式。
  * 为内联过滤器实现了原始查询模式。
  * 允许`K8sEnvVarSource`中的`secret_key_ref`变为`None`以实现后端改进。
  * 修复了代理构建器 UI，以将问题文本包装在狭窄的视口上并关闭“添加 API 密钥以开始”对话框。
  * 更新了用户体验，使评估器按钮高度与工具按钮图案相匹配。* Persisted selected model in local storage for a consistent UI experience.
  * Auto-generated thread titles for improved thread management.
  * Enhanced backend by gating secrets access with granular RBAC permissions.
  * Implemented Outlook Email Tools in the Agent Builder.
  * Improved keyboard shortcuts in the inbox feature of the Agent Builder UI.

  **下载 Helm 图表：** [⟦T700⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.15/langsmith-0.13.15.tgz)
</Update>

<Update label="2026-02-24">
  ## langsmith-0.13.14

  * Fixed agent generation interruptions and handling, improving stability in the user experience.
  * Fixed long feedback header text overflow when dragged to the last column.
  * Added OAuth connections for built-in tools and providers on the tool page.
  * 修复了运行详细信息页面上发生的崩溃。
  * Fixed onboarding dialog not fetching tools unnecessarily.
  * Updated agent builder frontend to show real-time run count.
  * 在前端添加了私有注册表 UI。
  * Enhanced support for SerializedConstructor model configs in playground and insights.
  * Added Gemini 3.1 Pro model to playground and backend model lists.
  * 修复了游乐场中工具注册表崩溃的问题。* Added support for Gmail authentication improvements, including refresh token capability.
  * Added new API endpoints for running playground experiments using a new service.
  * Improved UI for trace filters with version 2 UX using Filterbar.
  * Enhanced syntax highlighting to match Figma design for standardization.
  * Supported Gmail OAuth v2 with cron logic for higher reliability.
  * Added new models column in the experiment view with updated filtering options.
  * Supported multiple paths for query shadowing log improvements.
  * Added UIs for managing and editing model API key names in the playground.

  **下载 Helm 图表：** [⟦T701⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.14/langsmith-0.13.14.tgz)
</Update>

<Update label="2026-02-14">
  ## langsmith-0.13.13* 将 PostgreSQL 版本恢复为 v14.7，Redis 版本恢复为 v7。这修复了 langsmith-0.13.10 中引入的重大更改。
  * 修复了 5xx 响应中泄露的内部错误详细信息，以增强安全性。
  * 通过将 SaveViewButton 从 ViewDropdown 移出并将 SaveForm 更改为模式来改进视图 UI，以获得更好的可用性。
  * 在模板创建流程中添加了模型选择下拉列表，以增强用户体验。
  * 添加了创建 MCP 服务器时重复 URL 的警告，以防止配置错误。
  * 向代理和子代理添加了用户上下文，以获得更好的功能。
  * 在 Playground 中添加了对 SerializedConstructor 模型配置的支持，以提高灵活性。
  * 通过在实验视图配置中显示分类反馈并隐藏排序图标来增强 UI。
  * 通过修复单元格对齐来改进操场和实验视图。
  * 新增图片上传支持，方便更好的资产管理。
  * 向通用代理添加了入门对话框，以改进用户指导。
  * 在加载触发器骨架中添加了微调器，以获得更好的加载指示。

  **下载 Helm 图表：** [⟦T702⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.13/langsmith-0.13.13.tgz)
</Update>

<Update label="2026-02-12">
  ## langsmith-0.13.12* Improved button sizes and filter chip alignment in the InlineFilters UX.
  * 添加提交标签搜索并显示到提示中心。
  * Fixed issue with viewing experiments having objects for feedback scores.
  * 增强了对部署\_image 任务的跟踪。
  * Added a search bar for the new consolidated filter dropdown.
  * 添加了环境变量，用于全局禁用个人访问令牌创建。
  * 增加了成本图表功能。
  * 改进了主页样式并修复了相关设计问题。
  * Fixed issues with rerendering in General Purpose API (GPA).
  * Improved system to count PENDING, RETRY, and FAILED transactions in self-hosted offline usage reporting.
  * Enhanced the agent builder to localize the current date to the user's timezone.
  * Added Bedrock inference profile dropdown to the playground.
  * Improved error detection and messaging for server issues in agent-chat.
  * Fixed styling issues including email count in invite modal and load state display in the agent editor.
  * Implemented initial design for a tools page with feature flags.
  * Added icon-only filter popover mode to the frontend filter UI.* Added beacon endpoint for Self Hosted Agent Builder Runs Limiting.
  * 启用新的“粒度使用”选项卡，用于按工作区、项目、用户和 API 密钥报告计费使用情况（使用 `DEFAULT_ORG_FEATURE_ENABLE_GRANULAR_USAGE_REPORTING=true` 和 `GRANULAR_USAGE_TABLE_ENABLED=true` 环境变量在 `commonEnv` 中启用）

  **下载 Helm 图表：** [⟦T706⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.12/langsmith-0.13.12.tgz)
</Update>

<Update label="2026-02-12">
  ## langsmith-0.13.11

  * Improved Agent Builder by using persisted simple model config.
  * 修复了 Playground 的 UI，具有更好的消息块和工具按钮一致性。
  * Added a search bar for the new consolidated filter dropdown.
  * Fixed agent builder model selector for users without 'workspaces:manage' permission.
  * Added file upload feature for General Purpose Agent.
  * 添加了创建通用代理的按钮。
  * Enhanced the Playground by preserving baseline setting in URL on page reload.
  * Improved Playground experiment table UI and alignment.
  * Fixed bulk deletion of datasets to update the table correctly.
  * Added new API: workspace-scoped tool registry API.
  * 改进了对多场 runField 的支持。
  * Enhanced insights scheduler with backend changes.
  * Added ability to navigate pages in Polly and an initial set of base evaluations.* 为 Agent Builder 添加了跟踪增强功能，包括工具调用跟踪。
  * 集成更改以暂时支持自定义模型配置。

  **下载 Helm 图表：** [⟦T707⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.11/langsmith-0.13.11.tgz)
</Update>

<Update label="2026-02-10">
  ## langsmith-0.13.10

  * 此版本打包了与 langsmith-0.13.9 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.9](#langsmith-0-13-9)发行说明。

  **下载 Helm 图表：** [⟦T708⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.10/langsmith-0.13.10.tgz)
</Update>

<Update label="2026-02-09">
  ## langsmith-0.13.9

  * 修复了新切换器中工作区按字母顺序排序的问题，以改善用户体验。
  * 通过新的工具模式设计和模型配置弹出窗口改进了游乐场，以增强可用性。
  * 修复了创建幂等标签的问题。
  * 修改了代理生成器以缓存 MCP 工具列表、会话 ID 和 OAuth 令牌，以获得更好的性能。
  * 修复了代理生成器运行耗尽的更新错误消息。
  * 修复了代理构建器/allow-run API 端点的路由配置。
  * 修复了主页表格的间距以改进用户界面。
  * 修复了数据集为空时重复获取的问题。
  * 修复了非管理员用户对 API 密钥的编辑访问权限。
  * 在实验视图中添加了成本和代币列，以获得更好的数据洞察力。* 修复了 Slack 触发器由于身份验证错误而丢弃消息的问题。
  * 修复了比较表单元格中布尔反馈值的处理。
  * 将 API 调用的服务密钥主题更新为 /allow-run 以进行准确的身份验证。
  * 改进了代理构建器以使用持久的简单模型配置。
  * 修复了 OAuth 登录失败的错误状态处理。
  * 通过确保线程在代理聊天中重新连接时显示错误来增强代理构建器。
  * 修复了 UI，以确保页脚菜单在组织切换时关闭。
  * 通过使用特定资源身份验证改进了标记身份验证。
  * 增强的 UI 可防止从应用程序选择器下拉列表中关闭窗格。
  * 修复了反馈和注释队列列表中潜在的 SQL 注入风险。
  * 为 OAuth HTTP 客户端添加了 15 秒超时，以提高连接可靠性。

  **下载 Helm 图表：** [⟦T709⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.9/langsmith-0.13.9.tgz)
</Update>

<Update label="2026-02-06">
  ## langsmith-0.13.7

  * 此版本打包了与 langsmith-0.13.6 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.6](#langsmith-0-13-6)发行说明。

  **下载 Helm 图表：** [⟦T710⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.7/langsmith-0.13.7.tgz)
</Update>

<Update label="2026-02-05">
  ## langsmith-0.13.6* 修复了影响用户界面的大数字截断问题。
  * 改进了 S3 的错误字符串转换，以增强错误处理。
  * 更新了 Filters UX 以保存 DateTimeRange，改善用户体验。
  * 修复了 UUID 转换，以确保总代理标识一致。
  * 修复了代理 ID 转换，始终使用字符串而不是 UUID 以确保稳定性。
  * 通过显示自定义计算列增强了实验比较视图。
  * 修复了 langchain 形状输出的聊天预览，以获得更好的用户体验。
  * 改进了缓存机制和身份验证控制平面的 RetryableHTTP。
  * 修复了引导代理时租户使用不正确的问题。
  * 通过调整页面填充来消除视觉障碍，改进了用户界面。
  * 更新了跟踪相关查询的措辞以提高清晰度。
  * 增强了向 S3 的单次运行 POST/PATCH 端点的大字段上传。

  **下载 Helm 图表：** [⟦T711⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.6/langsmith-0.13.6.tgz)
</Update>

<Update label="2026-02-05">
  ## langsmith-0.13.5* 修复了克隆预建仪表板的回归问题，以增强用户体验。
  * 更新了过滤器用户体验以匹配新的模拟并改进了视图下拉列表。
  * 通过在 JSON 编码之前将 `UUID` 转换为 `str` 来修复 Agent Builder，以防止错误。
  * 添加了更新的见解侧边栏，以获得信息更丰富的用户界面。
  * 对表实施批量操作，提高数据管理效率。
  * 在前端添加了重新设计的注释队列反馈横幅。
  * 提供了在 Smith 前端要求反馈的选项，以增强用户沟通。
  * 将 Agent Builder 模板列表限制为 2 行，以提高可用性。
  * 修复了编辑代理生成器技能名称和描述时的光标跳跃问题。
  * 解决了 SSO+SCIM 问题，始终将用户配置到工作区。
  * 修复了工作区用户的 Slack Auth 断开连接问题。
  * 通过调整提示增强了 Agent Builder 中缺失工具的体验。
  * 防止自托管 OAuth 中的会话固定，以增强安全性。
  * 修复了 Smith 前端注释队列重新设计中的“视图运行”回归。
  * 将 gRPC 流块大小从 1MB 减少到 64KB，以提高性能。* 在 Agent Builder Explorer 中添加了下载 zip 按钮。
  * 通过将 URL 添加到 Datadog RUM 配置中，可以增强跟踪 URL。

  **下载 Helm 图表：** [⟦T714⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.5/langsmith-0.13.5.tgz)
</Update>

<Update label="2026-02-04">
  ## langsmith-0.13.4

  * 修复了单击列标题时所有列部分的切换功能。
  * 修复了编辑 SSO 设置失败的问题
  * 通过使用 BarSeries 而不是 AnimatedBarSeries 来实现精细使用选项卡，从而提高了前端性能。
  * 在新注释队列中添加了 Cmd + Enter 热键，以增强用户交互。
  * 在 Playground UI 中添加了一个选项，以通过默认为 `use_responses_api=true` 来缓解加载错误。
  * 添加了对自定义 Azure 模型的支持。
  * 更新了 Playground UI 以改善用户体验。
  * 通过自动调整文本区域大小和键盘快捷键改进了工作室聊天用户体验。
  * 修复了命名不正确的提示保存问题。
  * 通过增大搜索图标并跟踪 AQ、提示和部署的导航，提高可见性和用户体验。
  * 通过引入带有上下文行的新 Diff UI，增强了 Agent Builder 的 UI。
  * 使用 d3 Nice 刻度启用精确的 Y 轴边距，以实现更好的前端可视化。* 允许“最近添加到”部分在“添加到数据集”UI 中弹出。
  * 在仪表板选择视图中添加了分页，以提高可用性。
  * 添加了对限制长期 TTL 选项并在组织 TTL 设置端点中公开它们的支持。
  * 修复了在 Playground 中使用响应 API 时流媒体闪烁的错误。
  * 通过新队列中的自定义输出渲染增强了注释队列用户体验。
  * 使用 example\_ids 过滤优化数据集会话比较，以获得更好的性能。
  * 在 Agent Builder 中提供了下载 ZIP 文件按钮以方便用户。
  * 为 Agent Builder 的代理生成器图表添加了简化的加载状态。
  * 允许专门在自托管环境中更新和创建 SSO 设置。
  * 添加了对显示 SCIM 用户的`displayName`属性的支持。

  这些变化改善了用户交互，增强了系统性能，并扩展了对自定义模型和基础设施的支持，从而有利于自托管部署。

  **下载 Helm 图表：** [⟦T717⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.4/langsmith-0.13.4.tgz)
</Update>

<Update label="2026-01-26">
  ## langsmith-0.13.3* 改进了流式传输，以无丢失地累积流式增量数据。
  * 添加了 Google Sheets/Docs 工具集成。
  * 在设置中增强了 OAuth 服务器的用户体验。
  * 使视图跟踪链接在 UI 中更加明显。
  * 解决了 Agent Builder 中的多个错误和性能问题，包括将自托管 Agent Builder 运行写入单个项目以及默认折叠子代理工具卡。
  * 改进了实验 UI，现在在单个实验页面上显示实验描述，并修复了通过公共 URL 访问实验时的空白页面问题。
  * 通过解决批量导出不稳定问题并允许更新批量导出目标凭据来增强用户体验。
  * 改进了内联过滤器用户体验，修复了多个错误并添加了编辑功能。
  * 添加了对后端可配置运行输入/输出预览路径的支持。
  * 引入了新的工作区管理权限来管理成员的访问。
  * 优化Agent Builder以减少网络调用。
  * 在 Agent Builder 中的 MyAgents Navlink 中添加了操作菜单。
  * 改进了前端性能，包括解决加载身份验证状态时的缓慢问题。* 增强的代理生成器，具有 API 密钥所需标签/按钮和折叠操作集群功能。
  * 解决了游乐场工具模态溢出问题。
  * 通过修复 remix 运行路由器中的前端漏洞并清除注销时的 URL 以防止工作区误导，提高了安全性。
  * 更新了 API 以使用发票进行每月燃尽跟踪，并添加了对 V2 API 的支持。
  * 改进了前端以优雅地处理格式错误的 LLM 输出。
  * 通过允许 DateTimeRangePicker 组件使用粗体“上次”值，改进了日期/时间选择 UI。

  **下载 Helm 图表：** [⟦T718⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.3/langsmith-0.13.3.tgz)
</Update>

<Update label="2026-01-21">
  ## langsmith-0.13.2* 修复了数据集上传的内容类型验证，以改进数据处理。
  * 使用漂亮的 JSON 编辑器和消息列表编辑器改进了新的注释队列页面。
  * 更好地处理 QueueRunPayloads 上的可重试摄取错误。
  * 修复了 Agent Builder UI 中的 Cron 触发器更新。
  * 添加了对 Redis 集群的支持，增强了自托管设置的可扩展性。
  * 修复OAuth帐户接管漏洞以增强安全性。
  * 改进了游乐场中原始输出的渲染。
  * 添加了新的内联 UX 过滤器和视图下拉组件以增强用户交互。
  * 增加了 XS 文本变体的行高，以防止前端出现剪切问题。

  **下载 Helm 图表：** [⟦T719⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.2/langsmith-0.13.2.tgz)
</Update>

<Update label="2026-01-16">
  ## langsmith-0.13.1

  * 此版本打包了与 langsmith-0.13.0 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.13.0](#langsmith-0-13-0)发行说明。

  **下载 Helm 图表：** [⟦T720⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.1/langsmith-0.13.1.tgz)
</Update>

<Update label="2026-01-16">
  ## langsmith-0.13.0* 在自托管部署中添加了对[Agent Builder](/langsmith/fleet/index)的支持
  * 添加了可配置的跟踪 TTL，以实现长期跟踪
  * 添加了有条件地启用 OAuth 工具和触发器的功能
  * 添加了入职期间创建示例应用程序
  * 修复反馈分页和自动分页的错误
  * 修复了跟踪抽屉骨架没有立即出现的问题

  **下载 Helm 图表：** [⟦T721⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.13.0/langsmith-0.13.0.tgz)
</Update>

<Update label="2026-01-12">
  ## langsmith-0.12.37

  * 此版本打包了与 langsmith-0.12.36 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.12.36](#langsmith-0-12-36)发行说明。

  **下载 Helm 图表：** [⟦T722⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.37/langsmith-0.12.37.tgz)
</Update>

<Update label="2026-01-09">
  ## langsmith-0.12.36

  * 在 Agent Builder 中添加了对具有 OAuth 的自定义 MCP 服务器的支持
  * 添加了在 Agent Builder 中查看和编辑内存文件的功能
  * 增加了对前端附件的支持
  * 改进了跟踪查看器中的流树性能
  * 修复了跟踪树中的滚动行为
  * 修复了跟踪显示中的 unicode 截断问题
  * 修复了运行存在时登录屏幕显示不正确的问题
  * 将每个工作区的最大自动化规则增加到 200 个

  **下载 Helm 图表：** [⟦T723⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.36/langsmith-0.12.36.tgz)
</Update>

<Update label="2026-01-08">
  ## langsmith-0.12.35* 为实验中的反馈图表添加了每栏突出显示
  * 添加了 Agent Builder 活动源
  * 将实验芯片更改为悬浮卡以获得更好的可用性
  * 修复了代理出现在随机侧边栏位置的问题
  * 修复了 Playground 中的工具模态嵌套问题
  * 修复了比较页面上的差异模式回退
  * 修复了 OAuth 身份验证请求中的竞争条件

  **下载 Helm 图表：** [⟦T724⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.35/langsmith-0.12.35.tgz)
</Update>

<Update label="2025-12-26">
  ## langsmith-0.12.34

  * 添加了对 GCP 和 Azure 的 Redis IAM 身份验证支持
  * 添加了 OCSF 格式的自助审计日志
  * 添加隐藏列选项到实验输出标题
  * 工具服务器添加message\_user工具
  * 提高跟踪树加载速度
  * 允许基本身份验证安装以禁用通过 API 的邀请
  * 修复了导航中的租户 ID 处理
  * 修复了 Agent Builder 模板视图中的滚动问题
  * 修复 Gmail 帐户连接限制工具提示
  * 修复了页面加载时用户视图首选项的持久性
  * 修复了 UI 中的选项卡换行问题
  * 反馈图表默认可见
  * 使 SCIM 组名称匹配不区分大小写

  **下载 Helm 图表：** [⟦T725⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.34/langsmith-0.12.34.tgz)
</Update>

<Update label="2025-12-20">
  ## langsmith-0.12.33* 安全修复：通过要求用户定义允许的来源来修复 Studio 对恶意 `baseUrl` 参数的漏洞
  * 允许启用邀请以及 SSO 的 JIT 配置（仅限具有客户端密钥模式的 OAuth）
  * 添加了管理操作的自助审核日志（私人预览）

  **下载 Helm 图表：** [⟦T727⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.33/langsmith-0.12.33.tgz)
</Update>

<Update label="2025-12-12">
  ## langsmith-0.12.32

  * 添加了对 PostgreSQL 的 IAM 连接支持（仅限 AWS）。
  * 为 Playground 添​​加了 GPT-5.2 模型支持。
  * 添加了对执行程序 Pod 上设置内存限制的支持。

  **下载 Helm 图表：** [⟦T728⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.32/langsmith-0.12.32.tgz)
</Update>

<Update label="2025-12-11">
  ## langsmith-0.12.31

  * 改进了基本身份验证配置错误的错误消息。
  * 添加了组织操作员角色支持。
  * 修复了流数据集端点的问题。

  **下载 Helm 图表：** [⟦T729⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.31/langsmith-0.12.31.tgz)
</Update>

<Update label="2025-12-09">
  ## langsmith-0.12.30

  * 此版本打包了与 langsmith-0.12.29 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.12.29](#langsmith-0-12-29)发行说明。

  **下载 Helm 图表：** [⟦T730⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.30/langsmith-0.12.30.tgz)
</Update>

<Update label="2025-12-08">
  ## langsmith-0.12.29

  * 为 ClickHouse 连接添加了 mTLS（相互 TLS）支持，以增强数据库通信的安全性。**下载 Helm 图表：** [⟦T731⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.29/langsmith-0.12.29.tgz)
</Update>

<Update label="2025-12-05">
  ## langsmith-0.12.28

  * 添加了对 PostgreSQL 连接的 mTLS（相互 TLS）支持，以增强数据库通信的安全性。
  * 添加了对 ClickHouse 客户端的 mTLS 支持。
  * 修复了在自托管部署中禁用时的 Agent Builder 入门和侧面导航可见性。

  **下载 Helm 图表：** [⟦T732⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.28/langsmith-0.12.28.tgz)
</Update>

<Update label="2025-12-04">
  ## langsmith-0.12.27

  * 添加了对 Redis 连接的 mTLS（相互 TLS）支持以增强安全性。
  * 添加了对自托管部署中的空触发服务器配置的支持。
  * 改进了事件横幅样式和内容。

  **下载 Helm 图表：** [⟦T733⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.27/langsmith-0.12.27.tgz)
</Update>

<Update label="2025-12-02">
  ## langsmith-0.8.30

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T734⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.8.30/langsmith-0.8.30.tgz)
</Update>

<Update label="2025-12-01">
  ## langsmith-0.12.25

  * 为自托管部署启用了 Agent Builder UI 功能标志。
  * 添加了 Redis 集群支持，以提高可扩展性和高可用性。

  **下载 Helm 图表：** [⟦T735⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.25/langsmith-0.12.25.tgz)
</Update>

<Update label="2025-11-27">
  ## langsmith-0.12.24* 为所有 SAQ（简单异步队列）队列添加了出队超时，以提高可靠性。
  * 性能改进和错误修复。

  **下载 Helm 图表：** [⟦T736⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.24/langsmith-0.12.24.tgz)
</Update>

<Update label="2025-11-26">
  ## langsmith-0.12.23

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T737⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.23/langsmith-0.12.23.tgz)
</Update>

<Update label="2025-11-26">
  ## langsmith-0.12.22

  * 此版本打包了与 langsmith-0.12.21 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.12.21](#langsmith-0-12-21)发行说明。

  **下载 Helm 图表：** [⟦T738⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.22/langsmith-0.12.22.tgz)
</Update>

<Update label="2025-11-26">
  ## langsmith-0.12.21

  * 为算子部署模板添加了显式的`revisionHistoryLimit`配置。

  **下载 Helm 图表：** [⟦T740⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.21/langsmith-0.12.21.tgz)
</Update>

<Update label="2025-11-24">
  ## langsmith-0.12.20

  * 此版本打包了与 langsmith-0.12.18 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.12.18](#langsmith-0-12-18)发行说明。

  **下载 Helm 图表：** [⟦T741⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.20/langsmith-0.12.20.tgz)
</Update>

<Update label="2025-11-24">
  ## langsmith-0.12.19

  * 此版本打包了与 langsmith-0.12.18 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.12.18](#langsmith-0-12-18)发行说明。

  **下载 Helm 图表：** [⟦T742⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.19/langsmith-0.12.19.tgz)
</Update>

<Update label="2025-11-20">
  ## langsmith-0.12.18

  * 内部改进和维护更新**下载 Helm 图表：** [⟦T743⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.18/langsmith-0.12.18.tgz)
</Update>

<Update label="2025-11-19">
  ## langsmith-0.12.17

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T744⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.17/langsmith-0.12.17.tgz)
</Update>

<Update label="2025-11-19">
  ## langsmith-0.12.16

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T745⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.16/langsmith-0.12.16.tgz)
</Update>

<Update label="2025-11-17">
  ## langsmith-0.12.15

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T746⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.15/langsmith-0.12.15.tgz)
</Update>

<Update label="2025-11-17">
  ## langsmith-0.12.14

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T747⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.14/langsmith-0.12.14.tgz)
</Update>

<Update label="2025-11-13">
  ## langsmith-0.12.13

  * 此版本打包了与 langsmith-0.12.12 相同的 LangSmith 应用程序版本。请参阅下面的[langsmith-0.12.12](#langsmith-0-12-12)发行说明。

  **下载 Helm 图表：** [⟦T748⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.13/langsmith-0.12.13.tgz)
</Update>

<Update label="2025-11-13">
  ## langsmith-0.12.12

  * 内部改进和维护更新

  **下载 Helm 图表：** [⟦T749⟧](https://github.com/langchain-ai/helm/releases/download/langsmith-0.12.12/langsmith-0.12.12.tgz)
</Update>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-hosted-changelog.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>