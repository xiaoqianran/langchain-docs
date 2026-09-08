<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate to SmithDB-backed SDK methods | https://docs.langchain.com/langsmith/smithdb-sdk-migration -->

## 上下文
2026 年 5 月，我们发布了[SmithDB](https://www.langchain.com/blog/introducing-smithdb?utm_source=docs)，这是一个为现代人工智能代理构建的新可观测性数据库。 SmithDB 在每个关键可观测性工作负载中提供业界领先的性能，使核心LangSmith 体验速度显着加快。

使用 SmithDB 查询跟踪记录需要新的 SDK 方法。本指南可帮助您迁移代码库。

## 弃用和删除

每个 SDK 方法及其底层端点共享相同的弃用日期。

|部署|弃用 |移除 |
|---|---|---|
|所有云区域 | 2026 年 7 月结束 | 2027 年 1 月 31 日 |
|自托管 | `v0.16` | `v0.18` |

有关LangSmith如何弃用和删除API端点和SDK方法的详细信息，请参阅[API and SDK deprecation policy](/langsmith/endpoint-deprecation)。

## 最低 SDK 版本

新的 SDK 方法从以下 SDK 版本开始可用：

|语言 |套餐 |最低版本 |
|---|---|---|
|蟒蛇 | `langsmith` | `>=0.10.15` |
|打字稿 | `langsmith` | `>=0.8.9` |
|爪哇 | `langsmith-java` | `0.1.0-beta.22` |
|去 | `langsmith-go` | `v0.25.4` |
|命令行| `langsmith-cli` | `v0.2.44` |

[LangSmith CLI](/langsmith/langsmith-cli) 查询相同的 SmithDB 支持的端点，并需要 `v0.2.44` 或更高版本。

## 关于自托管- 本指南中记录的新方法需要 `>=0.16` 自托管版本，独立于所使用的数据存储。
- 一旦 ClickHouse 被禁用，已弃用的方法就会停止工作。
- 在可能的情况下，SDK 会发出警告或错误，标识要升级到的版本，而不是在没有解释的情况下失败。

## 按区域划分的方法

每种方法的更改前后都记录在其区域的页面上。

<CardGroup cols={2}>
  <Card title="Query runs" icon="search" href="/langsmith/smithdb-sdk-migration-query-runs">
    搜索项目中的运行：过滤器、字段投影、排序和分页。迁移中表面积最大。
  </Card>
  <Card title="Retrieve runs" icon="file-description" href="/langsmith/smithdb-sdk-migration-runs">
    按 ID 获取一个运行，加载其子运行，并在 LangSmith UI 中构建运行的 URL。
  </Card>
  <Card title="Traces" icon="timeline" href="/langsmith/smithdb-sdk-migration-traces">
    查询项目中的跟踪，读取其令牌和成本聚合，并列出属于一个跟踪的运行。
  </Card>
  <Card title="Threads" icon="messages" href="/langsmith/smithdb-sdk-migration-threads">
    查询项目中的线程并列出属于一个线程的迹线（匝数）。
  </Card>
  <Card title="Dataset experiment runs" icon="flask" href="/langsmith/smithdb-sdk-migration-experiments">
    查询数据集上的实验记录的运行，包括分页和按反馈分数排序。
  </Card>
  <Card title="Feedback and sharing" icon="star" href="/langsmith/smithdb-sdk-migration-feedback">
    创建有关运行的反馈、将运行添加到注释队列以及共享、取消共享或读取公开共享的运行。
  </Card>
</CardGroup>## 使用 AI 代理进行迁移

本指南旨在由 AI 编码代理直接获取和应用。将以下提示复制到您的代理中，以将您的代码库迁移到 SmithDB 支持的方法。

<Prompt
    description="Migrate LangSmith SDK usage to SmithDB methods"
    icon="arrow-right"
    actions={["copy", "cursor"]}
>
将此代码库的 LangSmith SDK 使用迁移到新的 SmithDB 支持的方法。

首先获取 https://docs.langchain.com/langsmith/smithdb-sdk-migration.md。它
包含最低 SDK 版本、弃用日期、例外更改以及
适用于每个调用站点的已停止方法。

每种方法的之前/之后的更改位于每个区域的页面上。获取
涵盖了该代码库实际使用的功能：- 搜索项目中的运行（过滤器、字段投影、排序、
  分页）：
  https://docs.langchain.com/langsmith/smithdb-sdk-migration-query-runs.md
- 通过 ID 获取一个运行，加载其子运行，并构建一个运行的 URL
  在 LangSmith UI 中运行：
  https://docs.langchain.com/langsmith/smithdb-sdk-migration-runs.md
- 查询项目中的痕迹，读取其代币和成本汇总，
  并在一个跟踪中列出运行：
  https://docs.langchain.com/langsmith/smithdb-sdk-migration-traces.md
- 查询项目中的线程并在一个中列出痕迹（回合）
  线程：
  https://docs.langchain.com/langsmith/smithdb-sdk-migration-threads.md
- 查询数据集上的实验记录的运行：
  https://docs.langchain.com/langsmith/smithdb-sdk-migration-experiments.md
- 创建运行反馈，将运行添加到注释队列，以及
  共享、取消共享或阅读公开共享的运行：
  https://docs.langchain.com/langsmith/smithdb-sdk-migration-feedback.md

将这些页面一起视为发生变化的事实来源，包括
哪些方法和参数受到影响、用什么来替代它们以及部署
支持。1.检查已安装的LangSmith SDK版本与最低版本
   根据本指南，SmithDB 支持的方法需要，并升级
   如果不满足该最小值，则依赖。
2. 识别此代码库中使用指南中方法的每个调用站点
   标记为已迁移，无论该代码库使用哪种语言。
3. 对于每个调用站点，应用相应的之前/之后的更改
   该方法的区域页面，包括任何添加、删除或重命名的内容
   参数。

如果指南未涵盖某个调用站点或参数，请停下来询问
比猜测。
</Prompt>

## 例外情况

<Tabs>
  <Tab title="Python">
    SmithDB 支持的方法引发新的异常类，而不是旧的 `langsmith.utils` 异常类。|之前 (`langsmith.utils`) | (`langsmith`)之后|笔记|
    |---|---|---|
    | `LangSmithError` | `LangsmithError` | SDK的异常基类；外壳已更改 |
    | `LangSmithAPIError` | `InternalServerError` | 5xx |
    | `LangSmithRequestTimeout` | `APITimeoutError` |请求超时时引发 |
    | `LangSmithUserError` | *（已删除）* |没有直接等价物。 403 org-scoped-key 案例现在引发 `PermissionDeniedError`；客户端参数验证现在提出了标准 `ValueError` 或 `TypeError` |
    | `LangSmithRateLimitError` | `RateLimitError` | 429；不变的名字 |
    | `LangSmithAuthError` | `AuthenticationError` | 401 | 401
    | `LangSmithNotFoundError` | `NotFoundError` | 404;不变的名字 |
    | `LangSmithConflictError` | `ConflictError` | 409；不变的名字 |
    | `LangSmithConnectionError` | `APIConnectionError` |当客户端无法连接到 API 时引发 |
    | `LangSmithExceptionGroup` | *（已删除）* |没有同等的|
    | *（不可用）* | `APIError` |新增：所有与 API 相关的错误的基类，具有 `message`、`request` 和 `body` 属性 |
    | *（不可用）* | `APIStatusError` |新：所有 4xx/5xx 状态错误的基类 |
    | *（不可用）* | `BadRequestError` |新：400 |
    | *（不可用）* | `PermissionDeniedError` |新：403 |
    | *（不可用）* | `UnprocessableEntityError` |新：422 |
    | *（不可用）* | `APIResponseValidationError` |新：当响应与预期模式不匹配时引发 |
  </Tab>
  <Tab title="TypeScript">SmithDB 支持的方法引发新的异常类，而不是普通的 `Error`。

    |之前（普通`Error`）|之后(`langsmith`)|笔记|
    |---|---|---|
    | *（不可用）* | `LangsmithError` |所有 SDK 错误的基类 |
    | *（不可用）* | `InternalServerError` | 5xx |
    | *（不可用）* | `APIConnectionTimeoutError` |请求超时时引发 |
    | *（不可用）* | `RateLimitError` | 429 | 429
    | *（不可用）* | `AuthenticationError` | 401 | 401
    | *（不可用）* | `NotFoundError` | 404 | 404
    | *（不可用）* | `ConflictError` | 409 | 409
    | *（不可用）* | `APIConnectionError` |当客户端无法连接到 API 时引发 |
    | *（不可用）* | `APIError` |所有与 API 相关的错误的基类，具有 `status`、`headers` 和 `error` 属性 |
    | *（不可用）* | `BadRequestError` | 400 |
    | *（不可用）* | `PermissionDeniedError` | 403 | 403
    | *（不可用）* | `UnprocessableEntityError` | 422 | 422
    | *（不可用）* | `APIUserAbortError` |当请求通过 `AbortController` | 中止时引发
  </Tab>
  <Tab title="Java">
    没有变化。错误处理不受此迁移的影响。
  </Tab>
  <Tab title="Go">
    没有变化。错误处理不受此迁移的影响。
  </Tab>
  <Tab title="cURL">
    没有变化。错误处理不受此迁移的影响。
  </Tab>
</Tabs>

## 停产以下方法已停止使用。他们调用已退役的 `/feedback/formulas` 端点，这些端点在复合反馈 v2 上返回 `410 Gone`，并计划于 2026 年 8 月 20 日删除。综合分数现在作为[composite evaluators](/langsmith/composite-evaluators-ui)进行管理，它将综合分数实现为代码评估器加运行规则。没有 SDK 替代品。

###反馈公式方法

|蟒蛇 |打字稿 |
|---|---|
| [⟦T69⟧](https://reference.langchain.com/python/langsmith/client/Client/list_feedback_formulas) |不适用 |
| [⟦T70⟧](https://reference.langchain.com/python/langsmith/client/Client/get_feedback_formula_by_id) |不适用 |
| [⟦T71⟧](https://reference.langchain.com/python/langsmith/client/Client/create_feedback_formula) |不适用 |
| [⟦T72⟧](https://reference.langchain.com/python/langsmith/client/Client/update_feedback_formula) |不适用 |
| [⟦T73⟧](https://reference.langchain.com/python/langsmith/client/Client/delete_feedback_formula) |不适用 |

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>