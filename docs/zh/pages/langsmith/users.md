<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Track users | https://docs.langchain.com/langsmith/users -->

# 追踪用户

使用 user_id 元数据键记录每个跟踪的最终用户，然后在 LangSmith 中查看、过滤、绘制图表并向用户添加特征。

LangSmith 中的用户是您的应用程序在跟踪中提供服务的人员。 LangSmith 从跟踪根运行的 [metadata](/langsmith/observability-concepts#metadata) 中的 `user_id` 键读取用户，其方式与将跟踪分组为 [threads](/langsmith/threads) 和 `thread_id` 的方式相同。通过记录用户，您可以找到报告问题的人员的每条踪迹，并查看每个用户的活动、成本和错误。

> [!注意]
>
> 此页面上的用户功能位于 [beta](/langsmith/release-stages) 中，并可在 [LangSmith Cloud](/langsmith/cloud) 中使用。它们在 [self-hosted](/langsmith/self-hosted) LangSmith 或 [BYOC](/langsmith/byoc) 部署中不可用，其中 `user_id` 作为普通元数据存储。

> [!注意]
>
> `user_id` 标识您的应用程序的最终用户。它与 `ls_user_id` 不同，`ls_user_id` 标识运行所属的 LangSmith 用户。

## 记录用户的踪迹

要记录用户，请将 `user_id` 键添加到每个跟踪的根运行的元数据中。该值可以是标识应用程序中用户的任何字符串。对跨跟踪的同一用户使用相同的值，因此按用户过滤会返回其所有跟踪。[LangSmith SDK](/langsmith/reference) 将运行的元数据复制到它创建的子运行。当您在根运行上设置 `user_id` 时，SDK 会在跟踪中的每次运行中记录它。子运行中设置的 `user_id` 会覆盖该运行的复制值。如果仅在子运行上设置 `user_id`，则跟踪顶部栏不会显示用户，并且搜索栏不会建议该用户 ID。

> [!注意]
>
> [Create an agent](/langsmith/create-an-agent) 在发送跟踪之前一次。使用[agent addressing](/langsmith/log-traces-to-agent)选择其标识符和环境。如果集成需要 `project_name`，请使用所选环境的 [⟦T15⟧](/langsmith/create-an-agent#use-an-environment-project)。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import traceable


@traceable
def retrieve_docs(question: str) -> list[str]:
    return ["Traces record each step of a request."]


@traceable
def answer_question(question: str) -> str:
    docs = retrieve_docs(question)
    return " ".join(docs)


# Pass the user at invocation time so each request records its own user.
answer_question(
    "What is a trace?",
    langsmith_extra={"metadata": {"user_id": "user_123"}},
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { traceable } from "langsmith/traceable";

const retrieveDocs = traceable(
  async (question: string) => {
    return ["Traces record each step of a request."];
  },
  { name: "retrieve_docs" }
);

async function handleRequest(question: string, userId: string) {
  // Create the root run with this request's user in its metadata.
  const answerQuestion = traceable(
    async (question: string) => {
      const docs = await retrieveDocs(question);
      return docs.join(" ");
    },
    { name: "answer_question", metadata: { user_id: userId } }
  );
  return answerQuestion(question);
}

await handleRequest("What is a trace?", "user_123");
```

有关设置元数据的其他方法，例如`tracing_context`或包装的客户端，请参阅[Add metadata and tags to traces](/langsmith/add-metadata-tags)。使用 LangChain 或 LangGraph，在调用代理时在运行配置的 `metadata` 字段中传递 `user_id`。参见[Trace LangChain agents](/langsmith/trace-with-langchain#add-metadata-and-tags-to-traces)。

## 查看用户的踪迹

LangSmith 在四个地方显示用户 ID：* **跟踪表**：打开**列**中的**用户**列以显示每次运行的用户 ID。 **LangSmith User** 列有所不同：它显示运行所属的 LangSmith 用户。
* **跟踪顶部栏**：当您打开不属于线程一部分的跟踪时，顶部栏会显示带有用户 ID 的 **用户** 芯片。
* **运行标题**：当跟踪属于线程时，所选运行的标题显示该运行中记录的用户 ID。这适用于线程的 **详细信息** 视图以及当您从跟踪表中打开跟踪时。
* **轨迹视图**：将鼠标悬停在线程的 **轨迹** 视图中的用户消息上，以显示其下方的用户 ID。 AI 消息和工具响应不会向用户显示。

单击用户 ID 以复制完整值。有关这些视图的更多信息，请参阅[View traces](/langsmith/view-traces)。

## 按用户过滤痕迹

> [!注意]
>
> 追踪项目有两种过滤体验。检查项目的顶部，看看哪一个适合您：
>
> * **左侧带有范围选择器的单个搜索栏**：请参阅[Filter traces](/langsmith/filter-traces)。
> * **构建滤波器芯片的添加滤波器按钮**：参考[Filter traces (ClickHouse)](/langsmith/filter-traces-in-application)。`user_id` 速记适用于搜索栏体验。在 **添加筛选器** 体验中，筛选 `user_id` 元数据键。

要查找某个用户的运行、跟踪或线程，请在跟踪搜索栏中输入 `user_id` 子句：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
user_id:user_123
```

默认情况下，**Traces** 表使用 **Root run** 范围，该范围与用户在其根运行上的每个跟踪相匹配。参见[Choose what a filter matches](/langsmith/filter-traces#choose-what-a-filter-matches)。

当您键入时，搜索栏会建议所选时间范围内最常见的用户 ID。您还可以输入列表中没有的用户 ID。

`user_id` 是`metadata.user_id` 的简写并支持相同的运算符：

* `-user_id:user_123` 匹配所有其他用户的运行，包括没有 `user_id` 的运行。
* `user_id:*` 匹配具有 `user_id` 键的运行。
* `-user_id:*` 匹配没有 `user_id` 键的运行，例如您尚未检测的跟踪。
* `metadata.user_id:user_123` 与 `user_id:user_123` 匹配相同的运行。

有关完整查询语法，请参阅[Filter traces](/langsmith/filter-traces)。

## 查看用户活动

代理的 **监控** 页面上的 **用户** 选项卡列出了一个环境的用户，按最近的活动排序。使用它可以查看谁在使用您的代理以及哪些用户的成本或错误率较高。

评论用户：1. 选择您的代理，然后在侧栏中选择 **监控**。
2. 选择**用户**选项卡。
3. 选择环境和时间范围。

每行显示所选时间范围内的用户 ID、上次活动、跟踪、令牌、总成本、错误率和 P50 延迟。该选项卡最多涵盖 31 天，因此 LangSmith 将较长的时间范围缩短到最后 31 天。

该选项卡仅列出 root 运行时记录的用户。如果该选项卡为空，请检查您的跟踪是否在根运行上设置了 `user_id`。参见[Record the user on a trace](#record-the-user-on-a-trace)。

要查找某个用户，请在搜索框中输入其确切的用户 ID。单击一行可打开筛选到该用户跟踪的 **跟踪** 页面。

## 按用户对图表进行分组

按用户分组将每个仪表板图表分成每个用户的一个系列。 LangSmith 组按其 `user_id` 元数据值运行，因此您无需输入元数据路径。

* **预建仪表板**：在仪表板的 [group by](/langsmith/dashboards#group-by) 设置中选择 **用户**。
* **自定义图表**：当您[configure a chart](/langsmith/dashboards#filter-and-group)时，选择**用户**作为分组依据属性。要从已按用户分组的图表开始，请使用 **用户跟踪** 或 **用户成本** 模板。与其他分组依据属性一样，图表显示最频繁的用户。在没有 `user_id` 的情况下运行，最常使用的用户之外的用户将计入图表显示的 **其他** 组。 **元数据**键列表不提供`user_id`，因为**用户**替换了它。

## 为用户添加特征

特征是您通过 [LangSmith REST API](/langsmith/smith-api-ref) 为用户存储的键值属性，例如姓名或电子邮件地址。使用特征将您的团队所需的每个用户的详细信息（例如他们是谁以及如何联系他们）保存在您的跟踪记录的相同`user_id`下。 LangSmith 将特征与轨迹分开存储，因此 [trace retention](/langsmith/observability-concepts#data-retention) 不适用于它们。特征会一直保留，直到您通过更新将其删除，或者直到 [agent environment](/langsmith/agent-environments) 或工作区被删除。

特征属于一个代理环境。两个环境中的相同`user_id`具有两组不同的特征。 `{session_id}` 路径参数是代理环境的 ID。要获取它，[resolve the agent environment](/langsmith/resolve-an-agent)，它返回的 ID 为 `session_id`。

### 设置权限

每个操作都需要权限。对于包含每个权限的角色，请参阅[Organization and workspace operations](/langsmith/organization-workspace-operations#runs)：* **创建用户**：`runs:create`，与发送跟踪所需的权限相同。
* **更新特征**：`runs:create`和`runs:read`。
* **获取或列出用户**：`runs:read`。

在 [access policy](/langsmith/abac#control-trace-access-with-root-run-metadata) 限制您可以通过根运行元数据读取哪些跟踪的环境中，特征 API 不可用。 LangSmith 针对这些请求返回 `403`。

### 创建和更新用户

API 提供以下操作：

* **[Create a user](/langsmith/smith-api/users/create-a-user)**：`POST /api/v1/platform/sessions/{session_id}/users`，带有 `user_id` 和可选的 `traits`。对于新用户返回 `201`，如果用户已存在则返回 `409`。要创建用户或更新现有用户，请发送创建请求，然后在创建请求返回`409`时发送更新请求。
* **[Update traits](/langsmith/smith-api/users/update-a-users-traits)**：`PATCH /api/v1/platform/sessions/{session_id}/users/{user_id}` 与 `traits` 对象。 LangSmith 将 `traits` 对象合并到存储的特征中：您发送的键会覆盖现有值，您省略的键将被保留，并且 `null` 值会删除键。返回 `200` 以及存储的用户，如果用户不存在则返回 `404`。
* **[Get a user](/langsmith/smith-api/users/get-a-user)**：`GET /api/v1/platform/sessions/{session_id}/users/{user_id}`。如果用户不存在，则返回 `404`。* **[List users](/langsmith/smith-api/users/list-users)**：`GET /api/v1/platform/sessions/{session_id}/users`，按最近更新顺序排列。可选的 `page_size` 参数默认为 20，最大为 100。将响应中的 `next_cursor` 值作为 `cursor` 传递以获取下一页。在最后一页，`next_cursor` 是`null`。使用 `user_id_prefix` 对用户 ID 进行区分大小写的前缀匹配。

例如，此请求正文创建一个具有名称和电子邮件的用户：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{"user_id": "user_123", "traits": {"name": "Alex Rivera", "email": "alex@example.com"}}
```

响应包含 `user_id`、`traits`、`created_at` 和 `updated_at`。

此更新请求正文更改名称并删除电子邮件，保留任何其他特征：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{"traits": {"name": "Alex R.", "email": null}}
```

### 保持在请求限制之内

每个请求必须保持在以下限制之内：* **用户 ID**：用户 ID 的长度为 1 到 512 个字符。在路径中，对用户 ID 进行 URL 编码，但保持每个 `/` 不变，因为 LangSmith 拒绝路径中的 `%2F`。您无法获取或更新其 ID 具有 `.` 或 `..` 段、`//` 或前导 `/` 的用户，因为该 ID 不能在路径中使用。
* **特征值**： `traits` 必须是最多 50 个键的 JSON 对象。 `name` 和 `email` 键必须是字符串，或者更新中的 `null`。创建请求不能包含 `null` 值。
* **大小**：用户存储的特征限制为 16,384 字节，请求正文限制为 65,536 字节。超出存储限制的更新将失败，并且存储的特征保持不变。
* **速率限制**：LangSmith 限制工作区每分钟可以创建的用户数量。超过限制的请求将返回带有 `Retry-After` 标头的 `429`。

LangSmith 也会返回这些错误：

* **`400`**: LangSmith 无法读取请求，例如无效的 JSON、未知字段或正文超出大小限制。
* **`422`**：用户 ID 或特征值打破了请求限制。响应命名该字段。
* **`501`**：您的工作区未启用用户功能。

## 另请参阅* [Configure threads](/langsmith/threads)：将用户的痕迹分组到与`thread_id`的对话中。
* [View traces](/langsmith/view-traces)：显示用户 ID 的轨迹和详细信息视图。
* [Add metadata and tags to traces](/langsmith/add-metadata-tags)：设置`user_id`和其他元数据键。
* [Filter traces](/langsmith/filter-traces)：将`user_id`与查询中的其他字段结合起来。
* [Dashboards](/langsmith/dashboards)：构建预构建和自定义图表，包括按用户分组的图表。
* [Log user feedback using the SDK](/langsmith/attach-user-feedback)：将用户的反馈附加到他们的运行中。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/users.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。