<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Monitor LLM Gateway spend | https://docs.langchain.com/langsmith/llm-gateway-monitoring -->

# 监控 LLM 网关支出

按用户、API 密钥和模型查看和分析 LLM Gateway 成本。

LLM 网关 **支出监控** 仪表板显示 [workspace](/langsmith/administration-overview#workspaces) 通过网关累积的 LLM 成本。使用它来比较一段时间内的支出并确定用户、[API keys](/langsmith/create-account-api-key)以及导致该支出的模型。仪表板一次覆盖一个工作区；切换工作空间以进行比较。

查看仪表板需要 [Organization Admin](/langsmith/rbac#organization-admin) 角色和 Plus 或 Enterprise [plan](/langsmith/pricing-plans)。如果没有两者，**使用**选项卡就不会出现。

<Warning>
  该仪表板目前在欧盟、亚太地区或 AWS 环境中不可用。
</Warning>

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

选择**细分**以跨以下维度之一对支出进行分组：

* **用户**：与调用网关的个人访问令牌关联的用户的属性。使用工作区或组织范围的服务密钥发出的请求显示为**与任何用户无关**。
* **API 密钥**：调用网关的 LangSmith API 密钥的属性。
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

## 另请参阅

* [LLM Gateway overview](/langsmith/llm-gateway)
* [Configure spend policies](/langsmith/llm-gateway-spend-policies)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-monitoring.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>