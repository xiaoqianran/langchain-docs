<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Monitor LLM Gateway spend | https://docs.langchain.com/langsmith/llm-gateway-monitoring -->

# 监控 LLM 网关支出

按用户、API 密钥、模型、提供商和请求标头查看和分析 LLM 网关成本。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

LLM 网关 **使用** 选项卡显示 [workspace](/langsmith/administration-overview#workspaces) 通过网关累积的 LLM 成本。用它来：

* 比较一段时间内的支出。
* 确定导致该支出的用户、API 密钥、模型、提供商和请求标头值。
* 花费[chargebacks](#attribute-spend-for-chargebacks)的属性。

查看 **使用情况** 选项卡需要工作区中的 `runs:read-stats` 和 `projects:read` [permissions](/langsmith/rbac)，以及 Plus 或 Enterprise [plan](/langsmith/pricing-plans)。

## 分组和过滤 LLM 支出

在“使用情况”选项卡中，选择“**细分依据**”以按以下维度之一对支出进行分组：* **用户**：与调用网关的个人访问令牌关联的用户的属性。使用工作区或组织范围的服务密钥发出的请求显示为 **与任何用户无关**。
* **API key**：调用网关的LangSmith API key 的属性。
* **模型**：用于请求的模型的属性。
* **模型提供者**：属性花费给服务请求的提供者，例如OpenAI或Anthropic。
* **自定义维度**：属性用于应用程序发送的 `X-Gateway-*` 请求标头的值。

当您选择 **自定义维度** 时，请在显示的字段中输入标题名称。该字段默认为`X-Gateway-Service`，`X-Gateway-`前缀是可选的。没有标头的请求出现在**无值**下。有关如何发送这些标头，请参阅[Header-based policies](/langsmith/llm-gateway-header-policies)。

选择维度后，使用相邻的过滤器仅显示您选择的实体。

## 设置时间范围和粒度

使用图表右上角的控件来定义页面上每个摘要、图表和表格涵盖的时间段：* **时间范围**：选择从一天到一年的预设范围，或选择自定义日期。日期和时间段使用 UTC。
* **聚合粒度**：将支出分组为每小时、每天或每周的存储桶。可用选项取决于所选时间范围的长度。
* **上一个或下一个周期**：向后或向前移动一个相同长度的周期以比较相邻的时间范围。

## 解读支出摘要

图表上方的卡片总结了所选工作区、时间范围、维度和过滤器的支出和令牌：

* **总支出**：所选时间范围内网关支出的总和。
* **每小时、每日或每周平均**：总支出除以所选范围内的时间段数量。
* **每小时、每日或每周平均/维度**：每个时间段内每个选定实体的平均支出。当您尚未应用实体过滤器时，此指标将使用支出前 10 个实体。
* **总令牌数**：在选定的时间范围内通过网关路由的请求中的令牌数。

## 分析图表和表格堆叠条形图显示每个实体如何在每个时间段内贡献支出。将鼠标悬停在栏上可查看存储桶总数以及每个可见实体的贡献。

该表总结了相同的选择，每个可见实体一行。用它来比较：

* **每小时、每日或每周平均**：实体的总支出除以时间段数量。
* **支出份额**：实体支出的百分比。
* **总支出**：实体在选定时间范围内的总支出。

要向下钻取，请选择一行以打开该实体的详细视图。从**分组依据**中选择一个维度以进一步细分其支出，例如按用户或自定义标头划分的 API 密钥支出。详细视图有自己的过滤器、时间范围和粒度控件，这些控件不会更改主视图上的控件。

> [!提示]
>
> 在用户、API 密钥或自定义标头值的详细视图中，单击 **查看跟踪** 以打开 **跟踪** 选项卡，该选项卡在详细视图的时间范围内筛选到该实体的请求。对于每个跟踪记录的内容，请参阅[View LLM Gateway traces](/langsmith/llm-gateway-traces)。

## 退款支出属性退款将 LLM 成本返还给产生这些成本的客户、租户或成本中心。由于每个请求都通过网关路由，因此 **使用情况** 选项卡可以按照您计费的相同线路划分支出。选择与您的收费对象相匹配的维度：

* **成本中心，例如部门、内部组或产品**：为每个组提供自己的 [service key](/langsmith/llm-gateway-authentication#choose-a-key-type)，然后按 **API 密钥** 进行细分。或者，让每个组的应用程序发送一个标头，例如 `X-Gateway-Cost-Center`，然后按 **自定义维度** 进行细分。
* **应用程序的最终客户**：让您的后端在为客户发出的每个请求上发送一个标头，例如 `X-Gateway-Customer-Id`，然后按 **自定义维度** 进行细分。要限制每个客户的支出，请参阅[Cap spend per end customer](/langsmith/llm-gateway-header-policies#cap-spend-per-end-customer)。
* **个人用户**：让每个用户使用自己的个人访问令牌调用网关，然后按 **用户** 进行细分。
* **自定义维度**：要根据任何其他属性（例如环境）进行计费，请让您的应用程序在 `X-Gateway-*` 标头中发送其值，然后按 **自定义维度** 进行细分。

## 另请参阅* [Spend policies](/langsmith/llm-gateway-spend-policies)：组织、工作区、用户和 API 密钥的支出上限。
* [Header-based policies](/langsmith/llm-gateway-header-policies)：发送**自定义维度**分组所依据的请求标头，并限制每个标头值的支出。
* [View LLM Gateway traces](/langsmith/llm-gateway-traces)：检查支出背后的各个请求。
* [View usage](/langsmith/view-usage)：查看 LangSmith 跟踪使用情况和计费，与 LLM 网关支出分开。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-monitoring.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。