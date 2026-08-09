<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Going to production | https://docs.langchain.com/oss/javascript/deepagents/going-to-production -->

# 进入生产阶段

使用持久内存、沙箱、弹性中间件和部署选项将深度代理投入生产

本指南涵盖了将深度代理从本地原型转移到生产部署的注意事项。它逐步介绍了内存范围、配置执行环境、添加护栏以及连接前端。

## 概述

代理使用内存及其执行环境中的信息来完成任务。
在生产中，有一些原语决定如何共享和访问信息：

* **线程**：单个对话。默认情况下，消息历史记录和临时文件的范围仅限于线程，并且不会保留。
* **用户**：与您的代理交互的人。内存和文件可以是用户私有的，也可以在用户之间共享。身份和授权来自您的[auth layer](/langsmith/auth)。
* **Assistant**：配置好的代理实例。内存和文件可以与一名助手绑定，也可以在所有助手之间共享。

此页面涵盖：* **[LangSmith Deployments](#langsmith-deployments)**：具有 auth、webhooks 和 cron 的托管基础设施
* **[Production considerations](#production-considerations)**：调用、多租户、身份验证、凭证、异步和持久性
* **[Memory](#memory)**：跨对话保留信息
* **[Execution environment](#execution-environment)**：文件存储和代码执行
* **[Guardrails](#guardrails)**：权限和数据隐私
* **[Frontend](#frontend)**：将您的 UI 连接到已部署的代理

## LangSmith 部署

<img alt="Managed Deep Agents packages your agent configuration, tools, and runtime settings for LangSmith" />

将深度代理投入生产的推荐路径是[Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview)，这是一个 CLI 优先的托管运行时，用于在 LangSmith 中创建、运行和操作深度代理。 Managed Deep Agents 目前处于私人预览版 ([join the waitlist](https://www.langchain.com/langsmith-managed-deep-agents-waitlist))。对于需要自定义应用程序代码、自定义路由、高级身份验证的团队，您可以直接配置[LangSmith Deployment](/langsmith/deployment)。任一路径都会提供您的代理所需的基础设施：[threads](/langsmith/use-threads)、[runs](/langsmith/runs)、存储和检查点，因此您不必自己设置这些。传统的 LangSmith 部署还为您提供开箱即用的 [authentication](/langsmith/auth)、[webhooks](/langsmith/use-webhooks)、[cron jobs](/langsmith/cron-jobs) 和 [observability](/langsmith/observability)，并且可以通过 [MCP](/langsmith/server-mcp) 或 [A2A](/langsmith/server-a2a) 公开您的代理。

您还可以在没有 LangSmith Cloud 的情况下部署在 JavaScript 框架和托管平台上。

<div>
  <div>
    <p>框架和平台</p><a href="/langsmith/deploy-frameworks-and-platforms">
      查看所有指南
    </a>
  </div>

  <div>
    <a href="/langsmith/deploy-vite-langsmith">
      <img alt="" />

      <img alt="" />

      <span>朗史密斯</span>
    </a>

    <a href="/langsmith/deploy-nextjs">
      <img alt="" />

      <img alt="" />

      <span>Next.js</span>
    </a>

    <a href="/langsmith/deploy-sveltekit">
      <img alt="" />

      <img alt="" />

      <span>SvelteKit</span>
    </a>

    <a href="/langsmith/deploy-nuxt">
      <img alt="" />

      <img alt="" />

      <span>Nuxt</span>
    </a>

    <a href="/langsmith/deploy-cloudflare-workers">
      <img alt="" />

      <img alt="" />

      <span>Cloudflare</span>
    </a>

    <a href="/langsmith/deploy-deno">
      <img alt="" />

      <img alt="" />

      <span>德诺</span>
    </a>
  </div>
</div>

<Tip>
  LangSmith 云部署会自动将跟踪发送到以您的部署命名的项目。打开 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-going-to-production) 调试运行并监控使用情况。对于混合或自托管设置，请参阅[LangSmith tracing](/langsmith/data-plane#langsmith-tracing)。我们建议您还设置 [LangSmith Engine](/langsmith/engine)，它可以监视您的痕迹、检测问题并提出修复建议。
</Tip>

除非另有说明，本页面上的所有代码片段均使用以下`langgraph.json`：

```json langgraph.json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./src/agent.ts:agent"
  },
  "env": ".env"
}
```

`langgraph.json` 是告诉 LangGraph 平台如何构建和运行应用程序的配置文件。它位于项目的根部，是本地开发（使用`langgraph dev`）和生产部署所必需的。关键字段是：|领域 |描述 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dependencies` |要安装的软件包。 `["."]` 将当前目录安装为包（从 `requirements.txt`、`pyproject.toml` 或 `package.json` 读取）。                                                                                                  |
| `graphs` |将图形 ID 映射到其代码位置。每个条目都是 `"<id>": "./<file>:<variable>"`，其中 `<id>` 是用于通过 API 调用图形的名称，`<variable>` 是从 `<file>` 导出的已编译图形或构造函数。 || `env` |带有环境变量（API 密钥、秘密）的 `.env` 文件的路径。这些在构建时设置并在运行时可用。                                                                                                                     |

有关完整的配置选项集（自定义 Docker 步骤、存储索引、身份验证处理程序等），请参阅 [application structure](/oss/javascript/langgraph/application-structure)。

## 生产注意事项

### 调用代理

在生产中，每次调用都应携带两个运行级别参数：

* **`thread_id`**（通过`config={"configurable": {"thread_id": ...}}`传递）：对话的稳定标识符。 [checkpointer](#durability) 使用它来保存和恢复消息历史记录，因此后续轮流继续相同的对话。生成新的`thread_id`以开始新的对话。
* **`context`**：工具和中间件在调用时读取的每次运行数据，例如 `user_id`、API 密钥、功能标志或会话元数据。使用`context_schema`定义形状并通过`runtime.context`访问它。参见[Runtime context](/oss/javascript/deepagents/context-engineering#runtime-context)。

两者是独立的并且几乎总是一起通过：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const contextSchema = z.object({ userId: z.string() });

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    contextSchema,
  });

  // Start a conversation
  const config = { configurable: { thread_id: crypto.randomUUID() } };
  await agent.invoke(
    { messages: [{ role: "user", content: "Plan a 3-day trip to Tokyo" }] },
    { ...config, context: { userId: "user-123" } },
  );

  // Follow-up on the same conversation: reuse the same thread_id
  await agent.invoke(
    { messages: [{ role: "user", content: "Make it 5 days instead" }] },
    { ...config, context: { userId: "user-123" } },
  );
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const contextSchema = z.object({ userId: z.string() });

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    contextSchema,
  });

  // Start a conversation
  const config = { configurable: { thread_id: crypto.randomUUID() } };
  await agent.invoke(
    { messages: [{ role: "user", content: "Plan a 3-day trip to Tokyo" }] },
    { ...config, context: { userId: "user-123" } },
  );

  // Follow-up on the same conversation: reuse the same thread_id
  await agent.invoke(
    { messages: [{ role: "user", content: "Make it 5 days instead" }] },
    { ...config, context: { userId: "user-123" } },
  );
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const contextSchema = z.object({ userId: z.string() });

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    contextSchema,
  });

  // Start a conversation
  const config = { configurable: { thread_id: crypto.randomUUID() } };
  await agent.invoke(
    { messages: [{ role: "user", content: "Plan a 3-day trip to Tokyo" }] },
    { ...config, context: { userId: "user-123" } },
  );

  // Follow-up on the same conversation: reuse the same thread_id
  await agent.invoke(
    { messages: [{ role: "user", content: "Make it 5 days instead" }] },
    { ...config, context: { userId: "user-123" } },
  );
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const contextSchema = z.object({ userId: z.string() });

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    contextSchema,
  });

  // Start a conversation
  const config = { configurable: { thread_id: crypto.randomUUID() } };
  await agent.invoke(
    { messages: [{ role: "user", content: "Plan a 3-day trip to Tokyo" }] },
    { ...config, context: { userId: "user-123" } },
  );

  // Follow-up on the same conversation: reuse the same thread_id
  await agent.invoke(
    { messages: [{ role: "user", content: "Make it 5 days instead" }] },
    { ...config, context: { userId: "user-123" } },
  );
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const contextSchema = z.object({ userId: z.string() });

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    contextSchema,
  });

  // Start a conversation
  const config = { configurable: { thread_id: crypto.randomUUID() } };
  await agent.invoke(
    { messages: [{ role: "user", content: "Plan a 3-day trip to Tokyo" }] },
    { ...config, context: { userId: "user-123" } },
  );

  // Follow-up on the same conversation: reuse the same thread_id
  await agent.invoke(
    { messages: [{ role: "user", content: "Make it 5 days instead" }] },
    { ...config, context: { userId: "user-123" } },
  );
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const contextSchema = z.object({ userId: z.string() });

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    contextSchema,
  });

  // Start a conversation
  const config = { configurable: { thread_id: crypto.randomUUID() } };
  await agent.invoke(
    { messages: [{ role: "user", content: "Plan a 3-day trip to Tokyo" }] },
    { ...config, context: { userId: "user-123" } },
  );

  // Follow-up on the same conversation: reuse the same thread_id
  await agent.invoke(
    { messages: [{ role: "user", content: "Make it 5 days instead" }] },
    { ...config, context: { userId: "user-123" } },
  );
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const contextSchema = z.object({ userId: z.string() });

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    contextSchema,
  });

  // Start a conversation
  const config = { configurable: { thread_id: crypto.randomUUID() } };
  await agent.invoke(
    { messages: [{ role: "user", content: "Plan a 3-day trip to Tokyo" }] },
    { ...config, context: { userId: "user-123" } },
  );

  // Follow-up on the same conversation: reuse the same thread_id
  await agent.invoke(
    { messages: [{ role: "user", content: "Make it 5 days instead" }] },
    { ...config, context: { userId: "user-123" } },
  );
  ```
</CodeGroup>

使用 LangGraph SDK 进行部署时，SDK 会为您管理线程，并将返回的 `thread_id` 传递给每次运行：```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "@langchain/langgraph-sdk";

const client = new Client({ apiUrl: "<DEPLOYMENT_URL>", apiKey: "<LANGSMITH_API_KEY>" });

const thread = await client.threads.create();
for await (const chunk of client.runs.stream(
  thread.thread_id,  // [!code highlight]
  "agent",
  {
    input: { messages: [{ role: "user", content: "Plan a 3-day trip to Tokyo" }] },
    context: { userId: "user-123" },  // [!code highlight]
    streamMode: "updates",
  },
)) {
  console.log(chunk.data);
}
```

<Tip>
  `thread_id` 限定*对话*（消息历史记录、检查点）。 `context` 携带您的工具和中间件读取的*每次运行*数据。它们是独立的：更改一个不会影响另一个，您可以通过其中一个或两个。
</Tip>

### 多租户

当您的代理为多个用户提供服务时，您需要处理三个问题：验证每个用户的身份、控制他们可以访问的内容以及管理代理用于代表他们执行操作的凭据。

<img alt="Three authentication layers compose: end-user auth, agent-acting-as-user auth, and team RBAC" />

#### 用户身份和访问控制

[LangSmith Deployments](/langsmith/deployment) 支持[custom authentication](/langsmith/custom-auth) 建立用户身份，并支持[authorization handlers](/langsmith/auth) 控制对线程、助手和存储命名空间等资源的访问。授权处理程序在身份验证成功后运行，并且可以：

* 使用所有权元数据标记资源（例如，`owner: user_id`）
* 返回过滤器，以便用户只能看到自己的资源
* 使用 HTTP 403 拒绝未经授权的操作

有关分步教程，请参阅[Make conversations private](/langsmith/resource-auth)。如需演练，请观看 [custom auth video](https://www.youtube.com/watch?v=DkNqgCz8cjE)。

您如何 [scope memory](#scoping) 和 [execution environments](#execution-environment) 确定用户之间共享哪些数据。有关详细信息，请参阅以下部分。

#### 团队访问控制 (RBAC)LangSmith 的 [role-based access control](/langsmith/rbac) 管理团队中的哪些人可以部署、配置和监控代理。这与上面的最终用户授权是分开的。

|角色 |访问 |
| ---------------- | ---------------------------------------------------------------------------------- |
|工作区管理员 |设置、会员管理等全部权限 |
|工作区编辑器 |创建和修改资源，但无法删除运行或管理成员 |
|工作区查看器 |只读访问 |

企业计划提供具有精细权限的自定义角色。完整的权限模型请参见[RBAC reference](/langsmith/rbac)。

#### 最终用户凭证

当您的代理需要代表用户调用外部 API（例如，读取其 GitHub 存储库、发送 Slack 消息、查询其数据仓库）时，您需要一种方法将用户的凭据传递给代理，而无需对其进行硬编码。**通过代理身份验证进行 OAuth。** [Agent Auth](/langsmith/agent-auth) 提供托管 OAuth 2.0 流程。配置 OAuth 提供程序，代理可以请求范围为每个用户的令牌。首次使用时，代理[interrupts](/oss/javascript/langgraph/interrupts)执行并显示 OAuth 同意 URL。用户进行身份验证后，代理将使用有效令牌恢复。令牌会自动存储和刷新。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "@langchain/auth";

const authClient = new Client();

// Inside your agent's tool:
// Access the authenticated user via runtime.serverInfo
const authResult = await authClient.authenticate({
  provider: "github",
  scopes: ["repo", "read:org"],
  userId: runtime.serverInfo.user.identity,  // [!code highlight]
});
// Use authResult.token for GitHub API calls on the user's behalf
```

**沙箱的凭据注入。** 如果您的代理在调用外部 API 的 [sandbox](#sandboxes) 内运行代码，则 [sandbox auth proxy](/langsmith/sandbox-auth-proxy) 可以自动将凭据注入出站请求中，因此沙箱代码永远不会接收原始 API 密钥。有关设置详细信息，请参阅[Managing secrets](#managing-secrets)。

**工作区机密。** 对于所有用户共享的 API 密钥（例如您组织的 LLM 提供商密钥、搜索 API 密钥），请将它们存储为 LangSmith 中的 [workspace secrets](/langsmith/set-up-hierarchy#configure-workspace-settings)。详情请参阅[Managing secrets](#managing-secrets)。

### 异步

基于 LLM 的应用程序严重依赖 I/O：调用语言模型、数据库和外部服务。异步编程允许这些操作并发运行而不是阻塞，从而提高吞吐量和响应能力。<Note>
  LangChain 遵循在异步方法名称前添加 `a` 的约定（例如，`ainvoke`、`abefore_agent`、`astream`）。同步和异步变体位于同一类或命名空间中。
</Note>

为生产而构建时：

* **创建异步工具。** LangChain 在单独的线程中运行同步工具以避免阻塞，但本机异步完全避免了线程开销。
* **使用异步中间件方法。** 自定义 [middleware](/oss/javascript/langchain/middleware/custom) 应实现异步挂钩（例如，`abefore_agent` 而不是 `before_agent`）。
* **对外部资源生命周期使用异步。** 创建 [sandboxes](#sandboxes) 或连接到 [MCP servers](/oss/javascript/langchain/mcp) 涉及网络调用，应等待。这就是为什么[graph factories](/langsmith/graph-rebuild)提供这些资源是异步的。

### 耐用性

Deep Agents 在 LangGraph 上运行，提供开箱即用的持久执行。 [persistence](/oss/javascript/langgraph/persistence) 层检查每个步骤的状态，因此因故障、超时或 [human-in-the-loop](/oss/javascript/langgraph/interrupts) 暂停而中断的运行会从上次记录的状态恢复，而无需重新处理之前的步骤。对于产生许多子代理的长时间运行的深度代理来说，这意味着中期运行失败不会丢失已完成的工作。

<img alt="Durable execution: when a worker crashes mid-run, another worker picks the run up from the latest checkpoint" />

检查点还可以：* **无限期 [interrupts](/oss/javascript/langgraph/interrupts)。** 人机循环工作流程可以暂停几分钟或几天，然后准确地从中断的地方恢复。
* **[Time travel](/oss/javascript/langgraph/use-time-travel).** 每个检查点步骤都是一个可以倒回的快照，以便在出现问题时从较早的状态重播。
* **安全处理敏感操作。** 对于涉及付款或其他不可逆转操作的工作流程，检查点提供审计跟踪和恢复点来检查导致操作的确切状态。

<Tip>
  [LangSmith Deployments](/langsmith/deployment) 自动配置持久检查点。如果您是自托管，请参阅 [persistence](/oss/javascript/langgraph/persistence) 了解设置说明。
</Tip>

## 内存

没有记忆，每一次对话都从头开始。记忆可以让您的代理保留对话中的信息（用户偏好、学到的指令、过去的经验），以便随着时间的推移，它可以个性化其行为。有关内存类型的概述，请参阅[memory concepts guide](/oss/javascript/concepts/memory)。

<img alt="Short-term memory is scoped to a single thread via checkpoints; long-term memory persists across threads via the store" />

### 范围界定

记忆在对话中总是持久的。主要问题是它如何跨越用户和助手的界限。正确的范围取决于谁应该查看和修改数据：|范围 |命名空间 |使用案例|示例|
| ------------------------------------------ | ---------------- | ----------------------------------------------------------- | --------------------------------- |
| **用户**（推荐默认）| `(user_id)` |每个用户的偏好和上下文| “我更喜欢简洁的回答”|
| **助理** | `(assistant_id)` |一名助理的共享说明 | “帖子上限为 280 个字符”|
| **全球** | `(org_id)` |所有用户和助理的只读策略 | “永远不要透露内部定价”|

<Warning>
  共享内存（助理、用户或组织范围）是提示注入的向量。如果一个用户可以写入另一用户的对话读取的内存，则恶意用户可以将指令注入该共享状态。在适当的情况下强制执行只读访问。例如，使组织范围的策略只能通过应用程序代码写入，而不能由代理本身写入。使用 [permissions](/oss/javascript/deepagents/permissions) 以声明方式拒绝写入共享路径，或使用 [backend policy hooks](/oss/javascript/deepagents/backends#add-policy-hooks) 进行自定义验证逻辑。
</Warning>

### 配置在 Deep Agents 中，内存作为文件存储在虚拟文件系统中。默认情况下，文件的范围仅限于单个线程（对话），并且不会跨线程共享。
否则，要跨线程共享内存，请将`/memories/`之类的路径路由到写入LangGraph[Store](/langsmith/custom-store)的[StoreBackend](https://reference.langchain.com/javascript/deepagents/backends/StoreBackend)。使用 [CompositeBackend](https://reference.langchain.com/javascript/deepagents/backends/CompositeBackend) 为代理提供线程范围的暂存空间和跨线程 [long-term memory](/oss/javascript/deepagents/memory)。

<Note>
  下面显示的 `rt.serverInfo` 和 `rt.executionInfo` 命名空间模式需要 `deepagents>=1.9.0`。
</Note>

<Tabs>
  <Tab title="User (recommended)">
    `user_id` 的命名空间。每个用户都有自己的私人内存。这是推荐的默认设置，因为大多数应用程序都部署单个助手。

    ```typescript src/agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, CompositeBackend, StateBackend, StoreBackend } from "deepagents";

    export const agent = createDeepAgent({
      backend: new CompositeBackend(
        new StateBackend(),
        {
          "/memories/": new StoreBackend({
            namespace: (rt) => [
              rt.serverInfo.assistantId,  // [!code highlight]
              rt.serverInfo.user.identity,  // [!code highlight]
            ],
          }),
        },
      ),
      systemPrompt: `You have persistent memory at /memories/.

      Read /memories/instructions.txt at the start of each conversation for
      accumulated knowledge and preferences. When you learn something that
      should persist, update that file.`,
    });
    ```
  </Tab>

  <Tab title="Assistant">
    `assistant_id` 的命名空间。内存在同一助手的所有用户之间共享，因此任何用户都可以读取或更新它。将此用于共享指示或知识，适用于使用给定助手的每个人（例如，“始终以正式语气回复”）。

    ```typescript src/agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, CompositeBackend, StateBackend, StoreBackend } from "deepagents";

    export const agent = createDeepAgent({
      backend: new CompositeBackend(
        new StateBackend(),
        {
          "/memories/": new StoreBackend({
            namespace: (rt) => [rt.serverInfo.assistantId],  // [!code highlight]
          }),
        },
      ),
    });
    ```
  </Tab>

  <Tab title="User">
    命名空间仅由`user_id`组成。记忆在所有助手中都跟随用户。将此用于全局用户配置文件（名称、时区、通信首选项），无论用户与哪个助手交谈，该配置文件都应适用。

    ```typescript src/agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, CompositeBackend, StateBackend, StoreBackend } from "deepagents";

    export const agent = createDeepAgent({
      backend: new CompositeBackend(
        new StateBackend(),
        {
          "/memories/": new StoreBackend({
            namespace: (rt) => [rt.serverInfo.user.identity],  // [!code highlight]
          }),
        },
      ),
    });
    ```
  </Tab><Tab title="Organization">
    `org_id` 的命名空间。内存在所有用户和所有助手之间共享。通常用于组织范围内的策略（合规性规则、品牌指南），这些策略对于代理来说应该是只读的。写访问权限应仅限于应用程序代码，以防止提示注入。

    ```typescript src/agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, CompositeBackend, StateBackend, StoreBackend } from "deepagents";

    export const agent = createDeepAgent({
      backend: new CompositeBackend(
        new StateBackend(),
        {
          "/memories/": new StoreBackend({
            namespace: (rt) => [rt.context.orgId],
          }),
        },
      ),
    });
    ```
  </Tab>
</Tabs>

您还可以使用 [Store API](/langsmith/custom-store) 从应用程序代码中读取和写入商店。示例请参见[Advanced usage](/oss/javascript/deepagents/memory#advanced-usage)。

有关完整的命名空间工厂 API，请参阅[namespace factories](/oss/javascript/deepagents/backends#namespace-factories)。对于自我改进指令和知识库等记忆模式，请参阅[long-term memory](/oss/javascript/deepagents/memory)。

## 执行环境

在本地，代理可以在磁盘上读写文件并直接运行 shell 命令。在生产中，您需要考虑隔离和持久性。正确的设置取决于您的代理是否需要执行代码：* **如果您的代理仅读取和写入文件，文件系统后端就足够了。选择符合您的持久性需求的后端：线程范围的暂存空间、跨线程存储或两者的组合。
* **沙箱** 添加一个隔离容器，其中包含用于运行 shell 命令的 `execute` 工具。如果您的代理需要运行代码、安装软件包或执行文件 I/O 之外的任何操作，请使用沙箱。

### 文件系统

根据需要保留的内容选择后端：

* [StateBackend](https://reference.langchain.com/javascript/deepagents/backends/StateBackend)（默认）：线程范围的暂存空间。文件通过检查指针在线程内持续存在，但不会跨线程共享。每一步都有检查点，因此避免写入大文件。
* [StoreBackend](https://reference.langchain.com/javascript/deepagents/backends/StoreBackend)：跨会话的跨线程存储。使用 [namespace factory](/oss/javascript/deepagents/backends#namespace-factories) 瞄准镜。
* [CompositeBackend](https://reference.langchain.com/javascript/deepagents/backends/CompositeBackend)：将两者混合。默认情况下，线程范围的暂存空间具有针对特定路径（如`/memories/`）的跨线程路由。

有关后端的完整列表以及如何构建自定义后端，请参阅[backends](/oss/javascript/deepagents/backends)。

<Warning>
  `FilesystemBackend`和`LocalShellBackend`直接访问主机。不要在已部署的代理中使用它们。
</Warning>

### 沙箱如果您的代理需要运行代码（而不仅仅是读写文件），请使用[sandbox](/oss/javascript/deepagents/sandboxes)。沙箱提供文件系统和用于运行 shell 命令的`execute`工具，所有这些都在一个隔离的容器内。这种隔离还可以保护您的主机：如果代理的代码耗尽内存或崩溃，则只有沙箱受到影响。您的服务器继续运行。

#### 生命周期

关键的决定是沙箱的寿命有多长。每次对话都是新的，还是对话共享一个持久的环境？

|范围 |沙箱 ID 存储于 |生命周期 |示例用例 |
| -------------------- | ---------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| **线程范围** | [Thread](/langsmith/use-threads) 元数据 |每次对话都是新鲜的，在 TTL 上进行了清理 |每个对话都以干净的方式开始的数据分析机器人 |
| **助理范围** | [Assistant](/langsmith/assistants)配置|在所有对话中共享 |跨对话维护克隆存储库的编码助手 |<Note>
  下面的示例使用异步 [graph factory](/langsmith/graph-rebuild) 而不是静态图，因为沙箱需要 `thread_id` 或 `assistant_id` 来查找或创建正确的沙箱。图工厂没有收到完整的`Runtime`（没有`server_info`或`execution_info`）；相反，接受 `RunnableConfig` 并从 `config["configurable"]` 读取 `thread_id` 和 `assistant_id`。该工厂是异步的，因为沙箱创建是一项 I/O 绑定操作，需要仅在调用时可用的每次运行信息。
</Note>

<Tabs>
  <Tab title="Thread-scoped (most common)">
    每个对话都有自己的沙箱。 [graph factory](/langsmith/graph-rebuild) 从运行配置中读取`thread_id`，因此每个[thread](/langsmith/use-threads) 自动获得自己的隔离环境。命名沙箱查找处理跨运行的重复数据删除。沙箱[TTL](/langsmith/configure-ttl)过期时清理。

    ```typescript src/agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, LangSmithSandbox } from "deepagents";
    import { SandboxClient } from "langsmith/sandbox";
    import type { LangGraphRunnableConfig } from "@langchain/langgraph";

    const client = new SandboxClient();

    export async function agent(config: LangGraphRunnableConfig) {
      const threadId = config.configurable?.thread_id as string;  // [!code highlight]
      const sandboxName = `thread-${threadId}`;
      const existing = (await client.listSandboxes()).filter(
        (sb) => sb.name === sandboxName,
      );
      const lsSandbox =
        existing[0] ??
        (await client.createSandbox({
          name: sandboxName,
          idleTtlSeconds: 3600, // TTL: clean up when idle
        }));
      return createDeepAgent({
        model: "google_genai:gemini-3.6-flash",
        backend: new LangSmithSandbox({ sandbox: lsSandbox }),
      });
    }
    ```
  </Tab>

  <Tab title="Assistant-scoped">
    所有对话共享一个沙箱。 [graph factory](/langsmith/graph-rebuild)从`config["configurable"]`读取[assistant](/langsmith/assistants) ID，因此同一助手上的每个线程都返回到相同的环境。文件、已安装的包和克隆的存储库在对话中保留。

    ```typescript src/agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, LangSmithSandbox } from "deepagents";
    import { SandboxClient } from "langsmith/sandbox";
    import type { LangGraphRunnableConfig } from "@langchain/langgraph";

    const client = new SandboxClient();

    export async function agent(config: LangGraphRunnableConfig) {
      const assistantId = config.configurable?.assistant_id as string;  // [!code highlight]
      const sandboxName = `assistant-${assistantId}`;
      const existing = (await client.listSandboxes()).filter(
        (sb) => sb.name === sandboxName,
      );
      const lsSandbox =
        existing[0] ??
        (await client.createSandbox({
          name: sandboxName,
        }));
      return createDeepAgent({
        model: "google_genai:gemini-3.6-flash",
        backend: new LangSmithSandbox({ sandbox: lsSandbox }),
      });
    }
    ```<Warning>
      随着时间的推移，助理范围的沙箱会积累文件、已安装的软件包和其他沙箱内状态。与沙箱提供程序配置 TTL，使用快照定期重置，或实施清理逻辑以防止沙箱的磁盘和内存无限制增长。
    </Warning>
  </Tab>
</Tabs>

因为 `agent` 变量是一个异步函数（不是编译图），所以服务器将其视为 [graph factory](/langsmith/graph-rebuild) 并在每次运行时调用它，注入配置。工厂按名称查找或创建沙箱，并返回连接到该沙箱的新代理图。

使用 `langgraph deploy` 部署后，使用 SDK 从应用程序代码中调用代理。无论范围如何，客户端代码都是相同的。作用域完全在上面的代理工厂中处理，但行为有所不同：

<Tabs>
  <Tab title="Thread-scoped">
    每个线程都有自己的沙箱。同一线程中的后续消息会重用相同的沙箱，但新线程始终会重新启动，不会出现先前对话中的剩余文件或已安装的包。

    ```typescript client.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { Client } from "@langchain/langgraph-sdk";

    const client = new Client({ apiUrl: "<DEPLOYMENT_URL>", apiKey: "<LANGSMITH_API_KEY>" });

    // Conversation 1: install pandas and analyze data
    const thread1 = await client.threads.create();
    for await (const chunk of client.runs.stream(
      thread1.thread_id,
      "agent",
      { input: { messages: [{ role: "human", content: "Install pandas and analyze sales_data.csv" }] } },
    )) {
      console.log(chunk.data);
    }

    // Follow-up in the same conversation — pandas is still installed
    for await (const chunk of client.runs.stream(
      thread1.thread_id,
      "agent",
      { input: { messages: [{ role: "human", content: "Now plot the results" }] } },
    )) {
      console.log(chunk.data);
    }

    // Conversation 2: fresh sandbox — pandas is NOT installed, no files from conversation 1
    const thread2 = await client.threads.create();
    for await (const chunk of client.runs.stream(
      thread2.thread_id,
      "agent",
      { input: { messages: [{ role: "human", content: "What packages are installed?" }] } },
    )) {
      console.log(chunk.data);
    }
    ```
  </Tab><Tab title="Assistant-scoped">
    所有线程共享一个沙箱。当沙箱具有重新创建成本高昂的状态（例如克隆的存储库、安装的依赖项或构建工件）时，这非常有用。同一个助手上的任何对话都会从上一个对话结束的地方继续，无需重复设置。

    ```typescript client.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { Client } from "@langchain/langgraph-sdk";

    const client = new Client({ apiUrl: "<DEPLOYMENT_URL>", apiKey: "<LANGSMITH_API_KEY>" });

    // Conversation 1: clone and set up the project
    const thread1 = await client.threads.create();
    for await (const chunk of client.runs.stream(
      thread1.thread_id,
      "agent",
      { input: { messages: [{ role: "human", content: "Clone https://github.com/org/repo and install dependencies" }] } },
    )) {
      console.log(chunk.data);
    }

    // Conversation 2: repo and dependencies are still there
    const thread2 = await client.threads.create();
    for await (const chunk of client.runs.stream(
      thread2.thread_id,
      "agent",
      { input: { messages: [{ role: "human", content: "Run the test suite and fix any failures" }] } },
    )) {
      console.log(chunk.data);
    }
    ```
  </Tab>
</Tabs>

#### 文件传输

沙箱是隔离的容器，因此您的应用程序代码无法直接访问其中的文件。使用 `upload_files()` 和 `download_files()` 跨沙箱边界移动数据：

* **在代理运行之前为沙箱播种**：上传用户文件、[skill](/oss/javascript/deepagents/skills) 脚本、配置或 [persistent memories](/oss/javascript/deepagents/memory)，以便代理从一开始就拥有所需的内容
* **在代理完成后检索结果**：下载生成的工件（报告、绘图、导出）并同步更新的记忆以供将来的对话使用

有关特定于提供商的文件传输示例，请参阅[working with files](/oss/javascript/deepagents/sandboxes#working-with-files)。有关提供程序设置、安全性和生命周期模式，请参阅完整的 [sandboxes guide](/oss/javascript/deepagents/sandboxes)。<Accordion title="Example: syncing skills and memories with custom middleware">
  [Skill](/oss/javascript/deepagents/skills) 代理需要执行的脚本必须在代理运行之前上传到沙箱中。您可能还想同步 [memories](/oss/javascript/deepagents/memory)，以便代理可以在容器内读取和更新它们。使用 [custom middleware](/oss/javascript/langchain/middleware/custom) 与 `before_agent` 和 `after_agent` 钩子跨沙箱边界移动文件：

  ```typescript src/agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createMiddleware } from "langchain";
  import {
    createDeepAgent,
    CompositeBackend,
    LangSmithSandbox,
    StoreBackend,
  } from "deepagents";
  import { SandboxClient } from "langsmith/sandbox";

  function safeFilename(key: string): string {
    const name = key.split("/").pop()!;
    if (name.includes("..") || /[*?]/.test(name)) {
      throw new Error(`Invalid key: ${key}`);
    }
    return name;
  }

  const createSandboxSyncMiddleware = (backend: CompositeBackend) => {
    return createMiddleware({
      name: "SandboxSyncMiddleware",
      beforeAgent: async (state, runtime) => {
        // Upload skill scripts and memories into the sandbox
        const userId = runtime.serverInfo.user.identity;  // [!code highlight]
        const store = runtime.store;
        const encoder = new TextEncoder();
        const files: [string, Uint8Array][] = [];
        for (const item of await store.search(["skills", userId])) {
          const name = safeFilename(item.key);
          files.push([`/skills/${name}`, encoder.encode(item.value.content)]);
        }
        for (const item of await store.search(["memories", userId])) {
          const name = safeFilename(item.key);
          files.push([`/memories/${name}`, encoder.encode(item.value.content)]);
        }
        if (files.length > 0) {
          await backend.uploadFiles(files);
        }
      },
      afterAgent: async (state, runtime) => {
        // Sync updated memories back to the store
        const userId = runtime.serverInfo.user.identity;  // [!code highlight]
        const store = runtime.store;
        const items = await store.search(["memories", userId]);
        const results = await backend.downloadFiles(
          items.map((item) => `/memories/${item.key}`),
        );
        const decoder = new TextDecoder();
        for (const result of results) {
          if (result.content) {
            await store.put(
              ["memories", userId],
              result.path.split("/").pop()!,
              { content: decoder.decode(result.content) },
            );
          }
        }
      },
    });
  };

  const client = new SandboxClient();
  const lsSandbox = await client.createSandbox();

  const backend = new CompositeBackend(
    new LangSmithSandbox({ sandbox: lsSandbox }),
    {
      "/skills/": new StoreBackend({
        namespace: (rt) => ["skills", rt.serverInfo.user.identity],  // [!code highlight]
      }),
      "/memories/": new StoreBackend({
        namespace: (rt) => ["memories", rt.serverInfo.user.identity],  // [!code highlight]
      }),
    },
  );

  export const agent = createDeepAgent({
    backend,
    middleware: [createSandboxSyncMiddleware(backend)],
  });
  ```
</Accordion>

#### 管理秘密

沙箱是隔离的容器，因此主机中的环境变量在其中不可用。有两种方法可以向沙箱代码提供 API 密钥和其他秘密：

**身份验证代理（推荐）。** [sandbox auth proxy](/langsmith/sandbox-auth-proxy) 拦截来自沙箱的出站请求并自动注入身份验证标头。沙箱代码正常调用外部API，代理根据目标主机添加正确的凭据。这意味着 API 密钥永远不会出现在沙箱代码、环境变量或日志中。

<img alt="The sandbox auth proxy injects credentials into outbound requests so secrets never enter the sandbox" />

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "proxy_config": {
    "rules": [
      {
        "name": "openai-api",
        "match_hosts": ["api.openai.com"],
        "inject_headers": {
          "Authorization": "Bearer ${OPENAI_API_KEY}"
        }
      },
      {
        "name": "anthropic-api",
        "match_hosts": ["api.anthropic.com"],
        "inject_headers": {
          "x-api-key": "${ANTHROPIC_API_KEY}"
        }
      }
    ]
  }
}
```

`${SECRET_KEY}` 引用解析存储在 LangSmith [workspace settings](/langsmith/set-up-hierarchy#configure-workspace-settings) 中的秘密。在创建引用秘密的模板之前，先在那里配置秘密。**工作区秘密。** 对于不需要基于代理的注入的 API 密钥（例如，代理服务器本身使用的密钥，而不是沙箱代码），将它们存储为 LangSmith 中的 [workspace secrets](/langsmith/set-up-hierarchy#configure-workspace-settings)。这些在运行时可用作工作区中所有代理的环境变量。

<Warning>
  避免通过环境变量或文件上传将机密传递到沙箱中。代理可以读取沙箱内任何可访问的文件或环境变量，包括凭据。身份验证代理将秘密完全排除在沙箱之外。
</Warning>

## 护栏

生产中的代理自主运行，这意味着它们可以无限循环、达到速率限制或处理包含敏感信息的用户数据。深度代理提供两层保护：

* **[Permissions](#permissions)**：声明性允许/拒绝规则，控制代理可以读取或写入哪些文件和目录。
* **[Fault tolerance](#fault-tolerance)**：速率限制、重试、回退和错误处理。
* **[Data privacy](#data-privacy)**：在 PII 到达模型或存储在日志中之前检测和处理 PII 的中间件。

### 权限[Permissions](/oss/javascript/deepagents/permissions) 是声明性允许/拒绝规则，用于控制代理可以读取或写入哪些文件和目录。使用权限将代理隔离到工作目录、保护敏感文件或强制使用只读内存。规则按声明顺序进行评估，第一个匹配的规则获胜。

### 容错

有关速率限制、重试、回退和错误处理的信息，请参阅[Fault tolerance](/oss/javascript/deepagents/fault-tolerance)。

### 数据隐私

如果您的代理处理可能包含电子邮件、信用卡号或其他 PII 的用户输入，您可以在其到达模型或存储在日志中之前检测并处理它：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, piiMiddleware } from "langchain";

const agent = createAgent({
  model: "google_genai:gemini-3.6-flash",
  middleware: [
    piiMiddleware("email", { strategy: "redact", applyToInput: true }),
    piiMiddleware("credit_card", { strategy: "mask", applyToInput: true }),
  ],
});
```

策略包括`redact`（替换为`[REDACTED_EMAIL]`）、`mask`（部分屏蔽，如`****-****-****-1234`）、`hash`（确定性哈希）和`block`（引发错误）。您还可以为特定于域的模式编写自定义检测器。

完整配置请参见[piiMiddleware](https://reference.langchain.com/javascript/langchain/index/piiMiddleware)。

对于默认的 Deep Agents 中间件堆栈，请参阅 [Customization](/oss/javascript/deepagents/customization#middleware)。有关其他 LangChain 预构建中间件（重试、回退、PII 检测等），请参阅[Prebuilt middleware](/oss/javascript/langchain/middleware/built-in)。

＃＃ 前端深度代理使用 [⟦T95⟧](/oss/javascript/langchain/frontend/overview) 将您的 UI 连接到代理后端。 [⟦T96⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 是一个前端钩子（适用于 React、Vue、Svelte 和 Angular），可实时传输来自代理的消息、子代理进度和自定义状态。

在本地，`useStream` 指向`http://localhost:2024`。在生产中，将其指向您的 [LangSmith Deployment](/langsmith/deployment) 并配置重新连接，以便用户在连接断开时不会丢失进度。

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useStream } from "@langchain/react";

function App() {
  const stream = useStream<typeof agent>({
    apiUrl: "https://your-deployment.langsmith.dev",
    assistantId: "agent",
  });
}
```

对于产生许多子代理的深度代理工作流程，请在提交时设置较高的 `recursionLimit` 以避免切断长时间运行的执行：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream.submit(
  { messages: [{ type: "human", content: text }] },
  {
    streamSubgraphs: true,
    config: { recursionLimit: 10000 },
  },
);
```

对于特定于深度代理的 UI 模式，例如子代理卡、待办事项列表和自定义状态渲染，请参阅 [frontend guide](/oss/javascript/deepagents/frontend/overview)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/going-to-production.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>