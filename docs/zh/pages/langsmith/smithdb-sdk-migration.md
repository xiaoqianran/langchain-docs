<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate to SmithDB-backed SDK methods | https://docs.langchain.com/langsmith/smithdb-sdk-migration -->

# 迁移到 SmithDB 支持的 SDK 方法

将现有的 LangSmith SDK 方法迁移到 SmithDB 支持的等效方法，以实现更快的代理可观察性。

## 上下文

2026 年 5 月，我们发布了[SmithDB](https://www.langchain.com/blog/introducing-smithdb?utm_source=docs)，这是一个为现代人工智能代理构建的新可观测性数据库。 SmithDB 在每个关键可观测性工作负载中提供业界领先的性能，使核心LangSmith 体验速度显着加快。

使用 SmithDB 查询跟踪记录需要新的 SDK 方法。本指南可帮助您迁移代码库。

## 弃用和删除

每个 SDK 方法及其底层端点共享相同的弃用日期。

|部署|弃用 |移除 |
| ----------------- | ---------------- | ----------- |
|所有云区域 | 2026 年 7 月结束 | 2027 年 1 月 31 日 |
|自托管 | `v0.16` | `v0.18` |

有关LangSmith如何弃用和删除API端点和SDK方法的详细信息，请参阅[API and SDK deprecation policy](/langsmith/endpoint-deprecation)。

## 最低 SDK 版本

新的 SDK 方法从以下 SDK 版本开始可用：|语言 |套餐 |最低版本 |
| ---------- | ---------------- | ---------------- |
|蟒蛇 | `langsmith` | `>=0.10.15` |
|打字稿 | `langsmith` | `>=0.8.9` |
|爪哇 | `langsmith-java` | `0.1.0-beta.22` |
|去 | `langsmith-go` | `v0.25.4` |
|命令行 | `langsmith-cli` | `v0.2.44` |

[LangSmith CLI](/langsmith/langsmith-cli) 查询相同的 SmithDB 支持的端点，并需要 `v0.2.44` 或更高版本。

## 关于自托管

* 本指南中记录的新方法需要 `>=0.16` 自托管版本，独立于所使用的数据存储。
* 一旦 ClickHouse 被禁用，已弃用的方法将停止工作。
* 在可能的情况下，SDK 会发出警告或错误，标识要升级到的版本，而不是在没有任何解释的情况下失败。

## 按区域划分的方法

每种方法的更改前后都记录在其区域的页面上。

<CardGroup>
  <Card title="Query runs" icon="search" href="/langsmith/smithdb-sdk-migration-query-runs">
    `list_runs` 及其查询参数、响应字段和示例。
  </Card>

  <Card title="Retrieve runs" icon="file-description" href="/langsmith/smithdb-sdk-migration-runs">
    读取单个运行并构建运行 URL。
  </Card>

  <Card title="Traces" icon="timeline" href="/langsmith/smithdb-sdk-migration-traces">
    查询跟踪并列出跟踪内的运行。
  </Card>

  <Card title="Threads" icon="messages" href="/langsmith/smithdb-sdk-migration-threads">
    查询线程并列出线程内的跟踪。
  </Card>

  <Card title="Dataset experiment runs" icon="flask" href="/langsmith/smithdb-sdk-migration-experiments">
    查询附加到数据集实验的运行。
  </Card><Card title="Feedback and sharing" icon="star" href="/langsmith/smithdb-sdk-migration-feedback">
    注释队列、公共运行和反馈创建。
  </Card>
</CardGroup>

## 使用 AI 代理进行迁移

本指南旨在由 AI 编码代理直接获取和应用。将以下提示复制到您的代理中，以将您的代码库迁移到 SmithDB 支持的方法。

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Migrate this codebase's LangSmith SDK usage to the new SmithDB-backed methods.

Fetch https://docs.langchain.com/langsmith/smithdb-sdk-migration.md first. It
carries the minimum SDK versions, deprecation dates, exception changes, and
discontinued methods that apply to every call site.

The before/after change for each method lives on a per-area page. Fetch the
ones this codebase actually uses:

- https://docs.langchain.com/langsmith/smithdb-sdk-migration-query-runs.md
- https://docs.langchain.com/langsmith/smithdb-sdk-migration-runs.md
- https://docs.langchain.com/langsmith/smithdb-sdk-migration-traces.md
- https://docs.langchain.com/langsmith/smithdb-sdk-migration-threads.md
- https://docs.langchain.com/langsmith/smithdb-sdk-migration-experiments.md
- https://docs.langchain.com/langsmith/smithdb-sdk-migration-feedback.md

Treat those pages together as the source of truth for what changed, including
which methods and parameters are affected, what replaces them, and deployment
support.

1. Check the installed LangSmith SDK version against the minimum version
   required for the SmithDB-backed methods per this guide, and upgrade the
   dependency if it does not meet that minimum.
2. Identify every call site in this codebase that uses a method the guide
   marks as migrated, in whichever language(s) this codebase uses.
3. For each call site, apply the corresponding before/after change from the
   area page for that method, including any added, removed, or renamed
   parameters.

If a call site or parameter is not covered by the guide, stop and ask rather
than guessing.
```

## 例外情况

<Tabs>
  <Tab title="Python">
    SmithDB 支持的方法引发新的异常类，而不是旧的 `langsmith.utils` 异常类。

    |之前 (`langsmith.utils`) | (`langsmith`)之后|笔记|
    | -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
    | `LangSmithError` | `LangsmithError` | SDK的异常基类；外壳已更改 || `LangSmithAPIError` | `InternalServerError` | 5xx |
    | `LangSmithRequestTimeout` | `APITimeoutError` |请求超时时引发 |
    | `LangSmithUserError` | *（已删除）* |没有直接等价物。 403 org-scoped-key 案例现在引发 `PermissionDeniedError`；客户端参数验证现在提出了标准 `ValueError` 或 `TypeError` |
    | `LangSmithRateLimitError` | `RateLimitError` | 429；不变的名字 |
    | `LangSmithAuthError` | `AuthenticationError` | 401 | 401| `LangSmithNotFoundError` | `NotFoundError` | 404;不变的名字 |
    | `LangSmithConflictError` | `ConflictError` | 409；不变的名字 |
    | `LangSmithConnectionError` | `APIConnectionError` |当客户端无法连接到 API 时引发 |
    | `LangSmithExceptionGroup` | *（已删除）* |没有同等的 |
    | *（不可用）* | `APIError` |新增：所有 API 相关错误的基类，具有 `message`、`request` 和 `body` 属性 || *（不可用）* | `APIStatusError` |新：所有 4xx/5xx 状态错误的基类 |
    | *（不可用）* | `BadRequestError` |新：400 |
    | *（不可用）* | `PermissionDeniedError` |新：403 |
    | *（不可用）* | `UnprocessableEntityError` |新：422 |
    | *（不可用）* | `APIResponseValidationError` |新：当响应与预期模式不匹配时引发 |
  </Tab>

  <Tab title="TypeScript">
    SmithDB 支持的方法引发新的异常类，而不是普通的 `Error`。|之前（普通`Error`）|之后(`langsmith`) |笔记|
    | ---------------------- | ------------------------ | | ------------------------------------------------------------------------------------------- |
    | *（不可用）* | `LangsmithError` |所有 SDK 错误的基类 |
    | *（不可用）* | `InternalServerError` | 5xx |
    | *（不可用）* | `APIConnectionTimeoutError` |请求超时时引发 |
    | *（不可用）* | `RateLimitError` | 429 | 429
    | *（不可用）* | `AuthenticationError` | 401 | 401
    | *（不可用）* | `NotFoundError` | 404 | 404| *（不可用）* | `ConflictError` | 409 | 409
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
  </Tab><Tab title="cURL">
    没有变化。错误处理不受此迁移的影响。
  </Tab>
</Tabs>

## 停产

以下方法已停止使用。他们调用已退役的 `/feedback/formulas` 端点，这些端点在复合反馈 v2 上返回 `410 Gone`，并计划于 2026 年 8 月 20 日删除。综合分数现在以 [composite evaluators](/langsmith/composite-evaluators-ui) 的形式进行管理，它将综合分数实现为代码评估器加运行规则。没有 SDK 替代品。

###反馈公式方法

|蟒蛇 |打字稿 |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| [⟦T71⟧](https://reference.langchain.com/python/langsmith/client/Client/list_feedback_formulas) |不适用 |
| [⟦T72⟧](https://reference.langchain.com/python/langsmith/client/Client/get_feedback_formula_by_id) |不适用 |
| [⟦T73⟧](https://reference.langchain.com/python/langsmith/client/Client/create_feedback_formula) |不适用 |
| [⟦T74⟧](https://reference.langchain.com/python/langsmith/client/Client/update_feedback_formula) |不适用 |
| [⟦T75⟧](https://reference.langchain.com/python/langsmith/client/Client/delete_feedback_formula) |不适用 |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>