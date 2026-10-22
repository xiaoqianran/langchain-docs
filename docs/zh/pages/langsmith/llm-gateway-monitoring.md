<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Monitor LLM Gateway spend | https://docs.langchain.com/langsmith/llm-gateway-monitoring -->

# 监控 LLM 网关支出

按用户、API 密钥和模型查看和分析 LLM Gateway 成本。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

LLM 网关 **支出监控** 仪表板显示 [workspace](/langsmith/administration-overview#workspaces) 通过网关累积的 LLM 成本。使用它来比较一段时间内的支出并确定用户、[API keys](/langsmith/create-account-api-key)以及导致该支出的模型。仪表板一次覆盖一个工作区；切换工作空间以进行比较。

查看仪表板需要 [Organization Admin](/langsmith/rbac#organization-admin) 角色和 Plus 或 Enterprise [plan](/langsmith/pricing-plans)。如果没有两者，**使用**选项卡就不会出现。

## 打开仪表板

查看网关支出：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-llm-gateway-monitoring)中，选择左侧导航栏中的**LLM Gateway**。
2. 选择**使用**。
3. 选择您要分析的工作区。

所选工作区通过 LLM 网关发送流量后，仪表板会显示数据。如果工作区没有网关流量，仪表板将显示空状态。

## 设置时间范围和粒度

使用时间控件定义页面上每个摘要、图表和表格涵盖的时间段：* **时间范围**：选择从一天到一年的预设范围，或选择自定义日期。日期和时间段使用 UTC。
* **粒度**：将支出分组为每小时、每天或每周。可用选项取决于所选时间范围的长度。
* **上一个或下一个周期**：向后或向前移动一个相同长度的周期以比较相邻的时间范围。

## 分解和过滤支出

选择“**细分依据**”对以下维度之一的支出进行分组：

* **用户**：与调用网关的个人访问令牌关联的用户的属性。使用工作区或组织范围的服务密钥发出的请求显示为**与任何用户无关**。
* **API key**：调用网关的LangSmith API key 的属性。
* **模型**：用于请求的模型的属性。

选择维度后，使用相邻的筛选器重点关注特定用户、API 密钥或模型。您一次最多可以选择六个实体。要删除过滤器，请选择列表底部的**全部**选项。

## 解读支出摘要摘要卡描述了所选工作区、时间范围、维度和过滤器的支出：

* **总支出**：所选时间范围内网关支出的总和。
* **每小时、每日或每周平均**：总支出除以所选范围内的时间段数量。
* **每小时、每日或每周平均/维度**：每个时间段的每个选定用户、API 密钥或模型的平均支出。当您尚未应用实体过滤器时，此指标将使用支出前 10 个实体。

## 分析图表和表格

堆叠条形图显示每个实体如何在每个时间段内贡献支出。将鼠标悬停在栏上可查看存储桶总数以及每个可见实体的贡献。当不应用过滤器时，图表将六个支出最高的实体显示为单独的系列，并将其余实体合并到**其他**中。

该表总结了相同的选择，每个可见实体一行。用它来比较：

* **每小时、每日或每周平均**：实体的总支出除以时间段数量。
* **支出份额**：实体支出的百分比。
* **总支出**：实体在选定时间范围内的总支出。选择列标题对表格进行排序。

## 深入了解用户或 API 密钥

选择用户或 API 密钥行以打开详细视图：

* 从用户处，查看按 API 密钥分组的支出。
* 通过 API 密钥，查看按用户分组的支出。

详细视图有自己的实体过滤器、时间范围和粒度控制。此视图中的更改不会更改主仪表板上的控件。

## 按自定义标题对支出进行分组

自定义标头分组按请求标头值细分 API 密钥的支出。使用它可以比较一个 API 密钥下的最终客户或团队的支出。

此选项需要启用默认 API 密钥支出策略，并配置 **自定义标头的单独限制**。具有 **自定义标头条件** 的组织级策略不会启用此选项。默认工作区或用户策略也没有。

> [!警告]
>
> 所需的策略对每个 API 密钥和标头值对强制实施支出上限。它不仅仅是分析设置。超过匹配上限的请求将被 HTTP `402` 阻止，并且现有的组织级别上限仍然适用。

要配置自定义标头分组：1. 转至 **LLM Gateway** > **成本控制**，然后单击 **创建支出限制**，或编辑现有的默认 API 密钥支出策略。
2. 选择 **API 密钥**，然后选择默认情况下将限制应用于每个 API 密钥的选项。
3. 选择**通过自定义标头单独限制**。
4. 输入**标头名称**，不带 `X-Gateway-` 前缀。例如，为 `X-Gateway-Customer-Id` 请求标头输入 `Customer-Id`。不要输入标头值：每个请求都提供自己的值。
5. 设置支出限额和期限，保存策略并确保其已启用。
6. 从后端发送网关请求的完整 `X-Gateway-Customer-Id` 标头。有关请求示例，请参阅[Send a customer header on every call](/langsmith/llm-gateway-header-policies#step-1-send-a-customer-header-on-every-call)。
7. 返回**使用**，刷新页面，在**细分**中选择**API Key**。
8. 选择 API 密钥行。在详细视图中，从 **分组依据** 中选择 **自定义标题**。

详细视图组按默认 API 密钥策略上配置的标头支出。自定义标头分组不是顶级**细分**选项。如果该选项被禁用，请检查默认 API 密钥策略是否已启用并包含标头名称。

有关不带标头的独立限制和请求的更多信息，请参阅[Separate a default spend limit by header](/langsmith/llm-gateway-header-policies#separate-a-default-spend-limit-by-header)。

## 另请参阅

* [LLM Gateway overview](/langsmith/llm-gateway)
* [Configure spend policies](/langsmith/llm-gateway-spend-policies)

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-monitoring.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。