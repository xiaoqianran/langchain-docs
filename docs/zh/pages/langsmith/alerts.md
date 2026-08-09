<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Alerts in LangSmith | https://docs.langchain.com/langsmith/alerts -->

# LangSmith 警报

<Note>
  **自托管版本要求**：访问警报需要 Helm 图表版本 **0.10.3** 或更高版本。
</Note>

LLM 应用程序中的有效可观察性需要主动检测故障、性能下降和回归。 LangSmith 的警报功能有助于识别关键问题，例如：

* 模型提供商违反 API 速率限制。
* 您的应用程序的延迟会增加。
* 影响反映最终用户体验的反馈分数的应用程序更改。
* 法学硕士的使用导致成本意外飙升。

LangSmith 中的警报是项目范围的，需要为每个受监控的项目进行单独配置。

<Tip>
  警报可以通过 webhook [route](#step-4-configure-notification-channel) 发送到 Slack、PagerDuty、Dynatrace 或任何 HTTP 端点。 **Webhook** 选项卡包括用于 Microsoft Teams、电子邮件、自托管部署上的 Slack 和 Google Chat（需要中间件）的[example recipes](#example-recipes)。
</Tip>

请按照以下步骤配置警报。

## 第 1 步：导航以创建警报在 [UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-alerts) 中，导航到您要为其配置警报的跟踪项目。单击页面右上角的 **警报** 图标可查看该项目的现有警报并设置新警报。

## 步骤 2：选择指标类型

LangSmith 针对以下指标提供基于阈值的警报：

|公制类型 |描述 |使用案例|
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ || **运行计数** |跟踪一个时间窗口内[runs](/langsmith/observability-concepts#runs)的总数。                         |监控管道是否按预期产量运行，并在产量意外下降时发出警报。                                                            |
| **成本** |跟踪一个时间窗口内运行的总成本。                                                                     |监控 LLM 支出，以便在成本超过预期阈值时发出警报。需要配置[cost tracking](/langsmith/cost-tracking)。                            |
| **错误** |跟踪有错误状态的运行。关于总错误计数或错误百分比（所有运行中错误运行的比率）的警报。 |监视应用程序中的故障，或在错误率超过可接受的阈值时发出警报。                                                                |
| **反馈分数** |衡量平均反馈分数。                                                                                  |跟踪 [feedback from end users](/langsmith/attach-user-feedback) 或 [online evaluation results](/langsmith/online-evaluations-llm-as-judge) 以警告回归。 || **延迟** |测量平均运行执行时间。                                                                                  |跟踪应用程序的延迟，以针对峰值和性能瓶颈发出警报。                                                                               |

此外，对于 **错误** 和 **延迟**，您可以使用筛选器构建器来堆叠 **状态**、**运行类型**、**标签** 和 **错误** 等字段上的条件。例如，您可以将错误警报范围限定为 **Status** 为 `error`、**Run Type** 为 `llm`、**Tag** 为 `support_agent`、**Error** 与 `RateLimitExceeded` 匹配的运行。

## 步骤 3：定义警报条件

警报条件由几个部分组成：

* **聚合方法**：平均值、百分比或计数。
* **比较运算符**：`>=`、`<=`，或超过阈值。
* **阈值**：触发警报的数值。
* **聚合窗口**：指标计算的时间段（选择 5 或 15 分钟）。
* **反馈键**（仅限反馈分数警报）：要监控的特定反馈指标。

<div>
  <img alt="Alert Condition Configuration" />
</div>**示例：** 当过去 5 分钟内超过 5% 的运行导致错误时，屏幕截图中的配置将生成警报。

您可以预览历史时间窗口内的警报行为，以了解有多少数据点以及哪些数据点会在选定的阈值（以红色表示）下触发警报。例如，为项目设置 60 秒的平均延迟阈值可让您可视化潜在的警报，如以下屏幕截图所示。

<div>
  <img alt="Alert Metrics" />
</div>

## 步骤4：配置通知通道

<Tabs>
  <Tab title="Slack">
    使用 LangSmith 的本机 Slack 集成将警报通知直接发送到 Slack 通道。无需自定义 Webhook 或 Slack 应用程序配置。

    <Note>
      本机 Slack 通知类型仅在 LangSmith Cloud 上可用。对于自托管部署，请改用 **Webhook** 选项卡中的 [webhook Slack recipe](#example-recipes)。
    </Note>

    **先决条件**

    * 连接到您的 LangSmith 组织的 Slack 工作区。如果您尚未连接，LangSmith 将在您配置此通知类型时提示您内联连接。

    ### 1.配置Slack通知1. 在警报设置的 **通知设置** 部分中，选择 **Slack**。
    2. 单击通道选择器。如果尚未链接 Slack 工作区，请单击 **连接 Slack** 并完成 OAuth 流程以授权 LangSmith。
    3. 将 `@LangSmith` 应用程序添加到您想要接收通知的频道。该应用程序必须是该频道的成员 — 在频道中键入 `/invite @LangSmith` 进行添加。
    4. 从下拉列表中选择工作区和通道。如果频道没有立即出现，请单击刷新图标。
    5. 单击“**保存**”保存通知配置。

    ### 2. 测试集成

    单击 **发送测试通知** 以验证 LangSmith 是否可以访问该频道。检查测试消息的通道。

    ### 通知格式

    当警报触发时，LangSmith 会发布一条结构化的 Slack 消息，其中包括：* **标题**：警报名称和您的 LangSmith 工作区名称。
    * **详细行**：指标属性、触发值、比较运算符、配置的阈值、聚合方法和时间窗口 - 例如：`Total Cost: $12.50 ≥ $5.00 · avg · 30 min`。
    * **操作按钮**：**查看警报**（链接到 LangSmith 中的警报预览）和 **查看运行**（链接到触发警报的过滤运行）。
  </Tab>

  <Tab title="PagerDuty">
    使用 PagerDuty 的 [Events API v2](https://developer.pagerduty.com/docs/events-api-v2-overview) 将 PagerDuty 配置为通知通道。这种集成允许关键的 LLM 应用程序问题触发 PagerDuty 事件，从而通过您建立的事件管理工作流程实现快速响应。

    **先决条件**

    * 具有管理员访问权限的活跃 PagerDuty 帐户
    * PagerDuty 中适当的服务级别权限

    如果在 LangSmith 的自定义部署中，请确保没有防火墙设置阻止来自 LangSmith 服务的出口流量。

    ### 1. 在 PagerDuty 中创建服务1. 登录您的 PagerDuty 帐户
    2. 导航至 **服务 → 服务目录**
    3. 点击**+新服务**
    4. 填写以下字段：
       * **名称**：提供描述性名称（例如“LangSmith Monitoring”）
       * **描述**：添加有关受监控应用程序的详细信息
       * **升级策略**：选择适当的团队升级策略
       * **集成类型**：选择“Events API V2”
    5.点击**添加服务**创建服务

    ### 2. 获取集成密钥

    创建服务后，检索集成密钥：

    1. 在**服务目录**中，找到并单击您新创建的服务
    2. 选择 **集成** 选项卡
    3.找到“Events API V2”集成
    4. 复制 **集成密钥**（32 个字符的字母数字字符串）

       <img alt="PagerDuty Integration Key Location" />

    ### 3. 使用 PagerDuty 配置 LangSmith 警报

    <Info>
      要在触发后一小时内再次收到相同的警报，您必须解决由 PagerDuty 中的警报创建的活动事件。
    </Info>

    <img alt="PagerDuty Setup" />1. 在 LangSmith 警报设置的通知部分中，选择 **PagerDuty**
    2. 单击密钥图标将集成密钥保存为工作区密钥或选择现有的工作区密钥。作为最佳实践，我们建议将集成密钥保存为工作区机密，而不是直接添加。这将允许您在工作区的警报之间重复使用相同的密钥。
    3. 配置附加通知选项：
       * **严重性**：映射到 PagerDuty 事件优先级
    4. 单击 **发送测试警报** 发送测试警报
    5. 验证事件是否由 PagerDuty 触发并包含相关的 LangSmith 警报信息

    ### 故障排除

    如果未在 PagerDuty 中创建事件：* 验证 LangSmith 中输入的集成密钥是否正确
    * 确保 PagerDuty 服务处于活动状态且不处于维护模式
    * 检查您的 PagerDuty 帐户是否启用了 Events API v2
    * 如果 PagerDuty 中似乎缺少警报触发器，请检查预期的触发器是否在同一警报规则的上一个触发器的一小时内发生，以及上一个警报创建的事件是否仍然处于打开状态。
    * 如果您的 LangSmith 实例位于防火墙后面，请检查网络连接

    ### 其他资源

    * [PagerDuty Events API v2 Documentation](https://developer.pagerduty.com/docs/events-api-v2/overview/)
    * [PagerDuty Integration Guide](https://support.pagerduty.com/docs/services-and-integrations)
  </Tab>

  <Tab title="Dynatrace">
    使用 Dynatrace 的 [Events API v2](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/events-v2/post-event) 将 Dynatrace 配置为通知通道。此集成将 LangSmith 警报事件发送到您的 Dynatrace 环境，从而实现与更广泛的基础设施监控的关联。

    **先决条件**

    * 活跃的 Dynatrace 环境（SaaS 或托管）。
    * 具有 `events.ingest` 范围的 Dynatrace API 访问令牌。

    如果您使用 LangSmith 的自定义 [deployment](/langsmith/self-hosted) 进行工作，请确保没有防火墙设置阻止来自 LangSmith 服务的出口流量。

    ### 1. 在 Dynatrace 中创建 API 令牌1. 登录您的 Dynatrace 环境。
    2. 导航至**访问令牌**。
    3. 单击**生成新令牌**。
    4. 提供描述性名称（例如“LangSmith Alerts”）。
    5. 在 **范围** 下，搜索并启用 `events.ingest`（摄取事件）。
    6. 单击**生成令牌**。
    7. 复制生成的令牌并安全存储。令牌仅显示一次。

    ### 2. 获取您的 Dynatrace 环境 URL

    您的 Dynatrace 环境 URL 采用以下格式：

    ```
    https://{your-environment-id}.live.dynatrace.com
    ```

    登录 Dynatrace 后，您可以在浏览器 URL 栏中找到您的环境 ID。

    ### 3. 使用 Dynatrace 配置 LangSmith 警报1. 在 LangSmith 警报设置的 **通知设置** 中，选择 **Dynatrace**。
    2. 输入您的 Dynatrace 环境 URL。
    3. 单击钥匙图标将 API 令牌保存为工作区密钥或选择现有工作区密钥。最佳实践是将 API 令牌保存为工作区机密，而不是直接添加。这允许您在工作区的警报之间重复使用相同的令牌。
    4. 配置附加通知选项：
       * **事件类型**：选择 Dynatrace 事件类型（例如，`CUSTOM_ALERT`、`ERROR_EVENT`）
    5. 单击“**发送测试通知**”发送测试警报。
    6. 验证该事件是否出现在您的 Dynatrace 环境中。

    ### 故障排除

    如果事件未出现在 Dynatrace 中：

    * 验证 API 令牌具有 `events.ingest` 范围并且未过期。
    * 确保环境 URL 正确并包含您的环境 ID。
    * 确认`Authorization`标头格式使用`Api-Token`（而不是`Bearer`）。
    * 检查您的 Dynatrace 环境是否处于活动状态且可访问。
    * 如果您的 LangSmith 实例位于防火墙后面，请检查网络连接。

    ### 其他资源

    * [Dynatrace Events API v2 Documentation](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/events-v2/post-event)
    * [Dynatrace Access Tokens](https://docs.dynatrace.com/docs/manage/access-control/access-tokens)
  </Tab><Tab title="Webhook">
    Webhooks 通过在触发警报条件时发送 HTTP POST 请求来实现与自定义服务和第三方平台的集成。使用 Webhook 将警报数据转发到票务系统、聊天应用程序或自定义监控解决方案。

    **先决条件**

    * 可以接收HTTP POST请求的端点
    * 适用于您的接收服务的身份验证凭据（如果需要）

    ### 1. 准备您的接收端点

    在 LangSmith 中配置 Webhook 之前，请确保您的接收端点：

    * 接受HTTP POST请求
    * 可以处理JSON负载
    * 可从外部服务访问
    * 具有适当的身份验证机制（如果需要）

    如果在 LangSmith 的自定义部署中，请确保没有防火墙设置阻止来自 LangSmith 服务的出口流量。

    ### 2.配置webhook参数

    在 **Alerts** 选项卡下[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-alerts)的 **Monitoring** 部分中，单击 **+ Alert** 创建一个。新警报。

    在 **通知设置** 部分中，使用以下参数完成 Webhook 配置：

    **必填字段*** **URL**：接收端点的完整 URL
      * 示例：`https://api.example.com/incident-webhook`

    **可选字段**

    * **标头**：随 Webhook 请求发送的 JSON 键值对
      * 常见的标头包括：
        * `Authorization`：用于身份验证令牌
        * `Content-Type`：通常设置为`application/json`（默认）
        * `X-Source`：标识来源为 LangSmith
      * 如果没有标题，则使用`{}`

    * **请求正文模板**：自定义发送到端点的 JSON 有效负载
      * 默认：LangSmith 发送定义的有效负载以及附加到有效负载的以下附加键值对：
        * `project_name`：警报范围内的 LangSmith 项目的名称。
        * `workspace_name`：LangSmith 工作空间的名称。
        * `alert_rule_id`：用于识别 LangSmith 警报的 UUID。这可以用作 webhook 服务中的重复数据删除密钥。
        * `alert_rule_name`：报警规则名称。
        * `alert_rule_description`：警报规则的描述（如果没有设置则为空字符串）。
        * `alert_rule_type`：警报类型（截至 2025 年 4 月 1 日，所有警报均为 `threshold` 类型）。
        * `alert_rule_attribute`：与警报规则关联的属性 - `error_count`、`feedback_score`、`latency` 或 `cost`。* `alert_rule_url`：LangSmith 中警报规则的直接链接。
        * `runs_url`：指向在 LangSmith 中触发警报的运行的直接链接。
        * `triggered_metric_value`：触发阈值时的指标值。
        * `triggered_threshold`：触发警报的阈值。
        * `timestamp`：触发警报的时间戳。

    <Info>
      LangSmith 不会对请求正文执行模板替换。上面的自动填充字段将作为顶级键与您配置的正文一起合并到传出的 JSON 中。像 `{alert_rule_name}` 这样的占位符语法会逐字发送到接收服务。仅当接收器本身可以从传入的 JSON 中提取字段（例如，Power Automate Workflow、AWS Lambda 或自定义 HTTP 处理程序）时，它才会解析为实际值。
    </Info>

    ### 3. 测试 webhook

    单击 **发送测试警报** 以发送 Webhook 通知，以确保通知按预期工作。

    ### 故障排除

    如果未发送 Webhook 通知：* 验证 webhook URL 是否正确且可访问
    * 确保任何身份验证标头格式正确
    * 检查您的接收端点是否接受 POST 请求
    * 检查端点日志中是否已收到但被拒绝的请求
    * 验证您的自定义负载模板是否为有效的 JSON 格式

    <Warning>
      **发送测试警报不会验证下游响应。** UI 报告 **您的配置工作正常并且测试通知已发送**，即使接收端点返回错误（例如，400 或 422 拒绝）。始终在接收方验证收据，检查端点的日志或目标平台的消息历史记录，而不是仅仅依赖 LangSmith 成功消息。
    </Warning>

    ### 安全考虑

    * 对您的 webhook 端点使用 HTTPS
    * 为您的 webhook 端点实施身份验证
    * 考虑在标头中添加共享密钥以验证 Webhook 源
    * 在处理传入的 webhook 请求之前验证它们

    ### 食谱示例<Accordion title="Configure Slack notifications via webhook">
      以下是配置 LangSmith 警报以使用 [⟦T57⟧](https://api.slack.com/methods/chat.postMessage) API 向 Slack 通道发送通知的示例。

      **先决条件**

      * 访问 Slack 工作区。
      * 用于设置警报的 LangSmith 项目。
      * 创建 Slack 应用程序的权限。

      **第 1 步：创建 Slack 应用程序**

      1. 参观[Slack API Applications page](https://api.slack.com/apps)。
      2. 单击“**创建新应用程序**”。
      3. 选择**从头开始**。
      4. 提供**应用程序名称**（例如“LangSmith Alerts”）。
      5. 选择要安装应用程序的工作区。
      6. 单击**创建应用程序**。

      **步骤 2：配置机器人权限**

      1. 在 Slack 应用程序配置的左侧边栏中，单击 **OAuth 和权限**。
      2. 向下滚动到“范围”下的“机器人令牌范围”，然后单击“添加 OAuth 范围”。
      3. 添加以下范围：
         * `chat:write`（作为应用程序发送消息）。
         * `chat:write.public`（向应用程序不在的频道发送消息）。
         * `channels:read`（查看频道基本信息）。

      **第 3 步：将应用程序安装到您的工作区**1. 向上滚动到 **OAuth 和权限** 页面的顶部。
      2. 单击“**安装到工作区**”。
      3. 检查权限并单击“**允许**”。
      4. 复制出现的 **机器人用户 OAuth 令牌**（以 `xoxb-` 开头）。

      **第 4 步：将机器人添加到 Slack 频道**

      将机器人添加到您想要接收警报的特定频道。您可以通过在消息字段中提及机器人将机器人添加到 Slack 频道（例如，`@botname`）。

      您还需要通道 ID 才能在 LangSmith 中配置 Webhook 警报。您可以通过打开频道详细信息 > 关于来找到频道 ID。

      **第 5 步：在 LangSmith 中配置 Webhook 警报**

      1. 在 LangSmith 中，导航到您的项目。
      2. 选择**警报 → 创建警报**。
      3. 定义您的警报指标和条件。
      4. 在通知部分中，选择 **Webhook**。
      5. 使用以下设置配置 Webhook：

      **网络钩子 URL**

      ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      https://slack.com/api/chat.postMessage
      ```

      **标题**
      <Note>将 `xoxb-your-token-here` 替换为您的机器人的用户 OAuth 令牌</Note>

      ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      {
        "Content-Type": "application/json",
        "Authorization": "Bearer xoxb-your-token-here"
      }
      ```**请求正文模板**
      <Note>需要填写步骤 4 中找到的值中的`{channel_id}`。 <br /><br />剩余字段：`alert_name`、`project_name` 和 `project_url` 可以选择向警报消息添加其他上下文。您可以在浏览器的地址栏中找到您的`project_url`。复制该部分直至但不包括任何查询参数。</Note>

      ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      {
        "channel": "{channel_id}",
        "text": "{alert_name} triggered for {project_name}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "🚨{alert_name} has been triggered"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Please check the following link for more information:"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "<{project-url}|View in LangSmith>"
            }
          }
        ]
      }
      ```

      6. 单击 **保存** 以激活 Webhook 配置。

      **第 6 步：测试集成**

      1. 在 LangSmith 警报配置中，单击“**测试警报**”。
      2. 检查您指定的 Slack 通道是否有测试通知。
      3. 验证消息是否包含预期的警报信息。

      **（可选）步骤 7：链接到请求正文中的警报预览**

      创建警报后，您可以选择链接到 Webhook 请求正文中的预览。

      <img alt="Alert Preview Pane" />

      要配置此：

      1. 保存您的警报。
      2. 在警报表中找到您保存的警报并单击它。
      3. 复制显示的 URL。
      4. 单击“编辑警报”。
      5. 将现有项目 URL 替换为复制的警报预览 URL。
    </Accordion><Accordion title="Configure Microsoft Teams notifications via webhook">
      以下是配置 LangSmith 警报以使用 [Workflows app](https://support.microsoft.com/en-us/office/create-incoming-webhooks-with-workflows-for-microsoft-teams-8ae491c7-0394-4861-ba59-055e33f75498) (Power Automate) 向 Microsoft Teams 渠道发送通知的示例。建议使用此方法，因为它从流中传入的 JSON 中提取字段，以便自动填充的 LangSmith 警报字段在 Teams 消息中正确呈现。

      <Note>
        Microsoft 的旧版 Office 365 传入 Webhook 连接器即将停用。使用工作流程应用程序进行新集成。
      </Note>

      **先决条件**

      * 访问 Microsoft Teams 工作区并有权添加工作流程。
      * 用于设置警报的 LangSmith 项目。

      **第 1 步：在 Teams 中创建工作流程**1. 在 Microsoft Teams 中，导航到您想要接收警报的频道。
      2. 单击通道名称旁边的 **...**（更多选项）菜单。
      3. 选择**工作流程**。
      4. 搜索并选择 **收到 Webhook 请求时发布到频道** 模板。
      5. 登录以确认连接，然后单击 **下一步**。
      6. 确认应发布警报的团队和渠道，然后单击“**添加工作流程**”。
      7. 复制生成的 **HTTP POST URL** - 在 LangSmith 中使用它。

      **步骤 2：在 Power Automate 中自定义消息（可选）**

      默认工作流程将原始 JSON 正文作为卡片发布。要格式化警报详细信息，请在 Power Automate 中编辑流程：

      1. 打开[Power Automate portal](https://make.powerautomate.com)并编辑您创建的工作流程。
      2. 单击 **聊天或频道中的明信片** 操作。
      3. 在 **自适应卡** 字段中，使用 `triggerOutputs()?['body/alert_rule_name']`、`triggerOutputs()?['body/project_name']`、`triggerOutputs()?['body/triggered_metric_value']`、`triggerOutputs()?['body/triggered_threshold']`、`triggerOutputs()?['body/timestamp']` 和 `triggerOutputs()?['body/alert_rule_url']` 引用传入字段。
      4.保存流量。

      **步骤 3：在 LangSmith 中配置 Webhook 警报**1. 在 LangSmith 中，导航到您的项目。
      2. 选择**警报 → 创建警报**。
      3. 定义您的警报指标和条件。
      4. 在通知部分中，选择 **Webhook**。
      5. 使用以下设置配置 Webhook：

      **网络钩子 URL**

      粘贴 Teams 工作流中的 HTTP POST URL：

      ```
      https://prod-XX.westus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
      ```

      **标题**

      ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      {
        "Content-Type": "application/json"
      }
      ```

      **请求正文模板**

      LangSmith 会自动将自动填充的警报字段（`alert_rule_name`、`project_name`、`triggered_metric_value`、`triggered_threshold`、`timestamp`、`alert_rule_url` 等）合并到请求正文中作为顶级 JSON 键。 Power Automate 直接从传入的有效负载中读取这些字段，因此空正文就足够了：

      ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      {}
      ```

      6. 单击 **保存** 以激活 Webhook 配置。

      **第 4 步：测试集成**

      1. 在 LangSmith 警报配置中，单击 **发送测试警报**。
      2. 检查您指定的 Teams 频道中是否有测试通知。
      3. 验证该卡是否包含预期的警报信息。

      **参考实现**有关将 LangSmith Webhook 有效负载（阈值警报、运行规则和通用事件）转换为格式化 Teams 自适应卡的工作示例，请参阅 [langsmith-teams-webhook](https://github.com/langchain-samples/langsmith-teams-webhook) 示例存储库。该示例作为 Teams 工作流 URL 前面的小型 Python 服务运行，这避免了自定义 Power Automate 流本身。
    </Accordion>

    <Accordion title="Configure email notifications via webhook">
      以下是配置 LangSmith 警报以使用 [SendGrid's Mail Send API](https://docs.sendgrid.com/api-reference/mail-send/mail-send) 发送电子邮件通知的示例。您可以使用任何公开 HTTP API 的交易电子邮件提供商（例如 Mailgun、Amazon SES、Postmark）。

      **先决条件**

      * 具有经过验证的发件人身份的 SendGrid 帐户。
      * 具有 **邮件发送** 权限的 SendGrid API 密钥。
      * 用于设置警报的 LangSmith 项目。

      **步骤 1：创建 SendGrid API 密钥**

      1. 登录您的[SendGrid dashboard](https://app.sendgrid.com)。
      2. 导航至 **设置 → API 密钥**。
      3. 单击**创建 API 密钥**。
      4. 选择**受限访问**并启用**邮件发送 → 完全访问**。
      5. 单击“**创建并查看**”，复制密钥并安全存储。

      **第 2 步：验证您的发件人电子邮件**1. 在 SendGrid 中，导航至 **设置 → 发件人身份验证**。
      2. 针对您要发送的地址完成**域身份验证**（推荐）或**单一发件人验证**。

      **步骤 3：在 LangSmith 中配置 Webhook 警报**

      1. 在 LangSmith 中，导航到您的项目。
      2. 选择**警报 → 创建警报**。
      3. 定义您的警报指标和条件。
      4. 在通知部分中，选择 **Webhook**。
      5. 使用以下设置配置 Webhook：

      **网络钩子 URL**

      ```
      https://api.sendgrid.com/v3/mail/send
      ```

      **标题**

      <Note>将 `SG.your-api-key-here` 替换为您的 SendGrid API 密钥。</Note>

      ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      {
        "Content-Type": "application/json",
        "Authorization": "Bearer SG.your-api-key-here"
      }
      ```

      **请求正文模板**

      <Note>
        将 `alerts@your-company.com` 替换为您经过验证的发件人地址，将 `oncall@your-company.com` 替换为收件人地址。 SendGrid 不会从任意顶级 JSON 键中提取字段，因此本示例使用固定主题和正文。要在电子邮件中包含特定于警报的值，请通过读取传入负载并呈现 SendGrid 请求的中间件（例如 Power Automate 流、AWS Lambda 或 Zapier Webhook）路由 LangSmith Webhook。
      </Note>

      ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      {
        "personalizations": [
          {
            "to": [
              {
                "email": "oncall@your-company.com"
              }
            ],
            "subject": "LangSmith alert triggered"
          }
        ],
        "from": {
          "email": "alerts@your-company.com",
          "name": "LangSmith Alerts"
        },
        "content": [
          {
            "type": "text/plain",
            "value": "A LangSmith alert was triggered. Open your LangSmith workspace to view the alert details, including the project, metric value, threshold, and timestamp."
          }
        ]
      }
      ```6. 单击 **保存** 以激活 Webhook 配置。

      **第 4 步：测试集成**

      1. 在 LangSmith 警报配置中，单击 **发送测试警报**。
      2. 检查收件人收件箱中是否有测试通知。
      3. 验证电子邮件包含预期的警报信息。

      **使用其他电子邮件提供商**

      相同的模式适用于接受静态身份验证标头的其他事务电子邮件 API。更改 **Webhook URL** 和 **标头** 以匹配您的提供商：

      |供应商|网络钩子 URL | Auth 标头格式 |
      | -------- | --------------------------------------------------- | ------------------------------------------------------ |
      |邮枪 | `https://api.mailgun.net/v3/{your-domain}/messages` | `Authorization: Basic <base64(api:<key>)>` |
      |邮戳| `https://api.postmarkapp.com/email` | `X-Postmark-Server-Token: <token>` |

      调整 **请求正文模板** 以匹配每个提供商的预期负载格式。 Amazon SES 不直接兼容，因为 SES API 需要每个请求 AWS SigV4 签名，而该签名无法表示为静态标头。要使用 SES，请通过中间件（例如，具有 HTTP 触发器的 Lambda 函数）进行路由。
    </Accordion><Accordion title="Configure Google Chat notifications via webhook (requires middleware)">
      Google Chat 的传入 webhook API (`spaces.messages.create`) 仅接受顶层的 `text` 字段。由于 LangSmith 将所有 12 个警报元数据键合并到请求正文中作为顶级字段，因此 Google Chat 会拒绝每个请求，并显示 400 错误：

      ```
      Invalid JSON payload received. Unknown name "project_name" at 'message': Cannot find field.
      ```

      没有请求正文模板可以避免这种情况，即使是最小的正文（例如 `{"text": "hello", "project_name": "x"}`）也会失败。 **需要翻译层（中间件）**，类似于[email recipe](#configure-email-notifications-via-webhook)中的Amazon SES注释。

      **选项 A：Cloud Run 或 Cloud Functions 中间件（推荐）**

      此方法使用一个小型 HTTP 处理程序，该处理程序接收 LangSmith Webhook、提取相关字段，并将干净的 `{"text": "..."}` 有效负载转发到 Google Chat 空间 Webhook URL。

      **先决条件**

      * 配置了传入网络钩子的 Google 聊天空间。在 Google Chat 中，打开空间 → **应用程序和集成** → **添加 Webhooks**，创建 Webhook，然后复制 URL。
      * 启用 Cloud Run 或 Cloud Functions 或同等托管的 Google Cloud 项目。

      **第 1 步：部署处理程序**

      将以下 Python 函数部署为 Cloud Run 服务或 Cloud Function：

      ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import json
      import os
      import re
      import urllib.request
      from urllib.parse import urlparse

      ALLOWED_LINK_HOSTS = {"smith.langchain.com"}

      def build_text(payload):
          def safe(v):
              # Strip angle brackets to prevent <url|label> link injection
              return re.sub(r"[<>]", "", str(v if v is not None else ""))

          parsed = urlparse(str(payload.get("runs_url") or ""))
          trusted = parsed.scheme == "https" and parsed.hostname in ALLOWED_LINK_HOSTS
          return (
              f"*{safe(payload.get('alert_rule_name'))}* triggered for "
              f"`{safe(payload.get('project_name'))}`\n"
              f"{safe(payload.get('alert_rule_attribute'))}: "
              f"{safe(payload.get('triggered_metric_value'))} "
              f"(threshold {safe(payload.get('triggered_threshold'))})"
              + (f"\n<{parsed.geturl()}|View runs>" if trusted else "")
          )

      def handler(request):
          if request.headers.get("X-Webhook-Secret") != os.environ["LANGSMITH_SHARED_SECRET"]:
              return ("forbidden", 403)
          payload = request.get_json(silent=True) or {}
          urllib.request.urlopen(
              urllib.request.Request(
                  os.environ["GCHAT_WEBHOOK_URL"],
                  data=json.dumps({"text": build_text(payload)}).encode(),
                  headers={"Content-Type": "application/json"},
                  method="POST",
              ),
              timeout=10,
          )
          return ("ok", 200)
      ```为部署的函数设置以下环境变量：

      * `GCHAT_WEBHOOK_URL`：Google 聊天空间 webhook URL。
      * `LANGSMITH_SHARED_SECRET`：您选择的秘密字符串（用于验证来自 LangSmith 的传入请求）。

      **步骤 2：在 LangSmith 中配置 Webhook 警报**

      将 LangSmith Webhook 指向已部署处理程序的 URL。

      **网络钩子 URL**

      ```
      https://<your-cloud-run-service-url>/
      ```

      **标题**

      ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      {
        "Content-Type": "application/json",
        "X-Webhook-Secret": "<your-shared-secret>"
      }
      ```

      **请求正文模板**

      ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      {}
      ```

      无论您在此处放置什么内容，元数据字段（`alert_rule_name`、`project_name`、`runs_url` 等）都会由 LangSmith 合并到正文中，因此空正文就足够了。

      <Note>
        不要从处理程序中的警报字段值中删除 `*` 或 `_`。这些字符也用于 Google Chat 的基本文本格式，但它们出现在 LangSmith 标识符中（例如 `run_count`）。剥离它们会损坏消息中的字段名称。
      </Note>

      <Note>
        Google Chat 强制执行 **每个空间每秒 1 条消息** 的写入速率限制，在写入该空间的所有 Webhook 之间共享。如果您有多个 LangSmith 警报路由到同一空间并且它们同时触发，则某些消息可能会被丢弃。
      </Note>**选项 B：Google Apps 脚本（无需基础设施）**

      Google Apps 脚本可以充当轻量级中间件，无需部署任何云基础设施。

      在 [script.google.com](https://script.google.com) 创建一个新的 Apps 脚本项目，粘贴以下内容，并将其部署为 Web 应用程序（以您自己的身份执行，可以访问任何人）：

      ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      function doPost(e) {
        var payload = JSON.parse(e.postData.contents);
        var secret = e.parameter.secret; // shared secret passed as query param
        if (secret !== PropertiesService.getScriptProperties().getProperty("LANGSMITH_SHARED_SECRET")) {
          return ContentService.createTextOutput("forbidden").setMimeType(ContentService.MimeType.TEXT);
        }
        var text =
          "*" + (payload.alert_rule_name || "") + "* triggered for `" + (payload.project_name || "") + "`\n" +
          (payload.alert_rule_attribute || "") + ": " + (payload.triggered_metric_value || "") +
          " (threshold " + (payload.triggered_threshold || "") + ")";
        UrlFetchApp.fetch(PropertiesService.getScriptProperties().getProperty("GCHAT_WEBHOOK_URL"), {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify({ text: text }),
        });
        return ContentService.createTextOutput("ok").setMimeType(ContentService.MimeType.TEXT);
      }
      ```

      在**项目设置→脚本属性**中设置`GCHAT_WEBHOOK_URL`和`LANGSMITH_SHARED_SECRET`。

      <Warning>
        Apps 脚本 Web 应用程序无法读取自定义 HTTP 请求标头，因此共享密钥必须作为 **查询字符串参数** (`?secret=...`) 而不是标头传递。将其包含在 LangSmith Webhook URL 中而不是 headers 字段中。
      </Warning>
    </Accordion>

    ### 其他资源

    * [Slack chat.postMessage API Documentation](https://api.slack.com/methods/chat.postMessage)
    * [Slack Block Kit Builder](https://app.slack.com/block-kit-builder/)
    * [Create incoming webhooks with Workflows for Microsoft Teams](https://support.microsoft.com/en-us/office/create-incoming-webhooks-with-workflows-for-microsoft-teams-8ae491c7-0394-4861-ba59-055e33f75498)
    * [Power Automate documentation](https://learn.microsoft.com/en-us/power-automate/)
    * [langsmith-teams-webhook sample repo](https://github.com/langchain-samples/langsmith-teams-webhook)
    * [SendGrid Mail Send API Documentation](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
    * [Google Chat incoming webhooks](https://developers.google.com/chat/how-tos/webhooks)
  </Tab>
</Tabs>

## 最佳实践

* 根据应用的关键程度调整灵敏度
* 从更广泛的阈值开始，并根据观察到的模式进行细化
* 确保警报路由到达适当的待命人员

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/alerts.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>