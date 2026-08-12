<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Backends | https://docs.langchain.com/oss/javascript/deepagents/backends -->

# 后端

为 Deep Agents 选择并配置文件系统后端。您可以指定到不同后端的路由、实施虚拟文件系统并实施策略。

Deep Agents 通过`ls`、`read_file`、`write_file`、`edit_file`、`glob` 和 `grep` 等工具向代理公开文件系统表面。这些工具通过可插入后端运行。 `read_file` 工具本身支持跨所有后端的二进制文件（图像、PDF、音频、视频），返回带有类型 `content` 和 `mimeType` 的 `ReadResult`。

沙箱和 [⟦T52⟧](https://reference.langchain.com/javascript/deepagents/backends/LocalShellBackend) 还提供了 `execute` 工具。
本页说明如何：

* [Choose a backend](#specify-a-backend)

* [Route different paths to different backends](#route-to-different-backends)

* [Implement a custom backend](#custom-backends)

* [Set permissions](#permissions) 文件系统访问

* [Add policy hooks](#add-policy-hooks)

* [Work with binary and multimodal files](#multimodal-and-binary-files)

* [Comply with the backend protocol](#protocol-reference)

* [Update existing backends to v2](#update-existing-backends-to-v2)

<Tip>
  当您在 [LangSmith Deployment](/langsmith/deployment) 上部署时，会自动配置商店。使用 [LangSmith](/langsmith/observability) 跟踪来调试文件路径、权限拒绝和跨线程存储。按照[observability quickstart](/langsmith/observability-quickstart)进行设置。

  我们建议您还设置 [LangSmith Engine](/langsmith/engine)，它可以监视您的痕迹、检测问题并提出修复建议。
</Tip>

<Tip>
  要生成代理可以通过文件系统工具读取的持久存储库 wiki，请参阅[OpenWiki](/oss/openwiki/overview)。
</Tip>

## 快速入门

以下是一些预构建的文件系统后端，您可以将它们快速与深度代理一起使用：|内置后端|描述 |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| [Default](#statebackend) | `agent = create_deep_agent(model="google_genai:gemini-3.6-flash")` <br /> 线程范围。代理的默认文件系统后端存储在`langgraph`状态。文件在线程内持续存在（通过检查点），并且不会跨线程共享。                                                                                                                                                                                                                                          |
| [Local filesystem persistence](#filesystembackend-local-disk) | `agent = create_deep_agent(model="google_genai:gemini-3.6-flash", backend=FilesystemBackend(root_dir="/Users/nh/Desktop/"))` <br />这使深度代理可以访问本地计算机的文件系统。您可以指定代理有权访问的根目录。请注意，任何提供的 `root_dir` 必须是绝对路径。通常，包装在 [CompositeBackend](#compositebackend-router) 中，以将内部代理数据（卸载的工具结果、对话历史记录）与项目文件分开。 || [Durable store (LangGraph store)](#storebackend-langgraph-store) | `agent = create_deep_agent(model="google_genai:gemini-3.6-flash", backend=StoreBackend())` <br />这使代理可以访问*跨线程持久化*的长期存储。这对于存储适用于代理多次执行的长期记忆或指令非常有用。                                                                                                                                                                                                     |
| [Context Hub](#contexthubbackend) | `agent = create_deep_agent(model="google_genai:gemini-3.6-flash", backend=ContextHubBackend("my-agent"))` <br />将文件持久存储在 LangSmith Hub 存储库中，无需配置单独的 LangGraph 存储。                                                                                                                                                                                                                                                                                                      || [Sandbox](/oss/javascript/deepagents/sandboxes) | `agent = create_deep_agent(model="google_genai:gemini-3.6-flash", backend=sandbox)` <br />在隔离环境中执行代码。沙箱提供文件系统工具以及用于运行 shell 命令的`execute`工具。从 LangSmith、AgentCore、Daytona 或其他 [sandbox integrations](/oss/javascript/integrations/sandboxes) 中进行选择。                                                                                                                                                                         |
| [Local shell](#localshellbackend-local-shell) | `agent = create_deep_agent(model="google_genai:gemini-3.6-flash", backend=LocalShellBackend(root_dir=".", env={"PATH": "/usr/bin:/bin"}))` <br />文件系统和 shell 直接在主机上执行。无隔离——仅在受控开发环境中使用。请参阅下面的[security considerations](#localshellbackend-local-shell)。                                                                                                                                                                            || [Composite](#compositebackend-router) |默认情况下是线程范围的，`/memories/`跨线程持久化。复合后端具有最大程度的灵活性。您可以在文件系统中指定不同的路由以指向不同的后端。有关准备粘贴的示例，请参阅下面的复合路由。                                                                                                                                                                                                                                                     |

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph TB
    Tools[Filesystem Tools] --> Backend[Backend]

    Backend --> State[State]
    Backend --> Disk[Filesystem]
    Backend --> Store[Store]
    Backend --> ContextHub[Context Hub]
    Backend --> Sandbox[Sandbox]
    Backend --> LocalShell[Local Shell]
    Backend --> Composite[Composite]
    Backend --> Custom[Custom]

    Composite --> Router{Routes}
    Router --> State
    Router --> Disk
    Router --> Store
    Router --> ContextHub

    Sandbox --> Execute["#43; execute tool"]
    LocalShell --> Execute["#43; execute tool"]

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class Tools trigger
    class Backend,State,Disk,Store,ContextHub,Sandbox,LocalShell,Composite,Custom process
    class Router decision
    class Execute output
```

## 内置后端

### 状态后端

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent, StateBackend } from "deepagents";

// By default we provide a StateBackend
const agent = createDeepAgent();

// Under the hood, it looks like
const agent2 = createDeepAgent({
  backend: new StateBackend(),
});
```

**它是如何工作的：**

* 通过[⟦T64⟧](https://reference.langchain.com/javascript/deepagents/backends/StateBackend)将文件存储在当前线程的LangGraph代理状态中。
* 通过检查点在同一线程上的多个代理之间持续存在。文件不在线程之间共享。

<Warning>
  设计用于在图表内使用。在图形运行之外调用后端方法（例如，`state_backend.upload_files(...)`）在图形执行之前不会生效。
</Warning>

**最适合：**

* 供代理写入中间结果的便签本。
* 自动驱逐大型工具输出，然后代理可以逐段读回。请注意，此后端在主管代理和子代理之间共享，子代理写入的任何文件都将保留在LangGraph代理状态
即使该子代理执行完成后也是如此。这些文件将继续可供主管代理和其他子代理使用。

### FilesystemBackend（本地磁盘）

[⟦T66⟧](https://reference.langchain.com/javascript/deepagents/backends/FilesystemBackend) 在可配置的根目录下读取和写入真实文件。

<Warning>
  该后端授予代理直接文件系统读/写访问权限。
  请谨慎使用，并且仅在适当的环境中使用。

  **适当的用例：**

  * 本地开发 CLI（编码助手、开发工具）
  * CI/CD 管道（请参阅下面的安全注意事项）

  **不适当的用例：**

  * Web 服务器或 HTTP API - 使用 `StateBackend`、`StoreBackend` 或 [sandbox backend](/oss/javascript/deepagents/sandboxes) 代替

  **安全风险：**

  * 代理可以读取任何可访问的文件，包括机密（API 密钥、凭证、`.env` 文件）
  * 结合网络工具，可能通过SSRF攻击泄露机密
  * 文件修改是永久且不可逆的

  **建议的保障措施：**1. 启用[Human-in-the-Loop (HITL) middleware](/oss/javascript/deepagents/human-in-the-loop)审核敏感操作。
  2. 从可访问的文件系统路径中排除机密（尤其是在 CI/CD 中）。
  3. 对于需要文件系统交互的生产环境，使用[sandbox backend](/oss/javascript/deepagents/sandboxes)。
  4. **始终** 将 `virtual_mode=True` 与 `root_dir` 一起使用以启用基于路径的访问限制（阻止 `..`、`~` 和根目录之外的绝对路径）。

     请注意，即使设置了 `root_dir`，默认值 (`virtual_mode=False`) 也不提供安全性。
</Warning>

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, FilesystemBackend } from "deepagents";

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, FilesystemBackend } from "deepagents";

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, FilesystemBackend } from "deepagents";

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, FilesystemBackend } from "deepagents";

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, FilesystemBackend } from "deepagents";

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, FilesystemBackend } from "deepagents";

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, FilesystemBackend } from "deepagents";

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
  });
  ```
</CodeGroup>

**它是如何工作的：**

* 在可配置的`root_dir`下读取/写入真实文件。
* 您可以选择将`virtual_mode=True`设置为沙箱并标准化`root_dir`下的路径。
* 使用安全路径解析，尽可能防止不安全的符号链接遍历，可以使用 ripgrep 实现快速`grep`。

**最适合：**

* 您机器上的本地项目
* CI 沙箱
* 挂载的持久卷

对于代理可以使用这些文件系统工具（来自`openwiki/`）读取的持久存储库wiki，请参阅[OpenWiki](/oss/openwiki/overview)。<Tip>
  **对于大多数用例，将 `FilesystemBackend` 包裹在 `CompositeBackend`** 中。 Deep Agents自动将内部数据写入后端，包括卸载的大型工具结果（在`/large_tool_results/`下）和对话历史记录（在`/conversation_history/`下）。当您单独使用`FilesystemBackend`时，这些内部文件将写入`root_dir`下的真实磁盘，将代理工件与您的项目文件混合。

  使用 `CompositeBackend` 将项目目录路由到 `FilesystemBackend`，同时将内部路径保留在临时 `StateBackend` 存储中：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, CompositeBackend, FilesystemBackend, StateBackend } from "deepagents";

  const agent = createDeepAgent({
    backend: new CompositeBackend(
      new StateBackend(),
      {
        "/workspace/": new FilesystemBackend({ rootDir: "/path/to/project", virtualMode: true }),
      },
    ),
  });
  ```

  这样，代理在 `/workspace/` 下读取和写入到真实磁盘，而卸载工具结果和其他内部数据保持短暂状态。有关更多路由模式，请参阅[Route to different backends](#route-to-different-backends)。
</Tip>

### LocalShellBackend（本地 shell）

<Warning>
  该后端向代理授予直接文件系统读/写访问权限**和**在主机上不受限制的 shell 执行。
  请极其谨慎地使用，并且仅在适当的环境中使用。

  **适当的用例：**

  * 本地开发 CLI（编码助手、开发工具）
  * 您信任代理代码的个人开发环境
  * CI/CD 管道具有适当的秘密管理

  **不适当的用例：*** 生产环境（例如Web服务器、API、多租户系统）
  * 处理不受信任的用户输入或执行不受信任的代码

  **安全风险：**

  * 代理可以使用您的用户权限执行**任意 shell 命令**
  * 代理可以读取任何可访问的文件，包括机密（API 密钥、凭证、`.env` 文件）
  * 秘密可能会被泄露
  * 文件修改和命令执行是**永久且不可逆的**
  * 命令直接在您的主机系统上运行
  * 命令可以消耗无限的CPU、内存、磁盘

  **建议的保障措施：**

  1. 启用[Human-in-the-Loop (HITL) middleware](/oss/javascript/deepagents/human-in-the-loop)在执行前审核并批准操作。这是**强烈推荐**。
  2. 仅在专用开发环境中运行。切勿在共享或生产系统上使用。
  3. 对于需要 shell 执行的生产环境，使用[sandbox backend](/oss/javascript/deepagents/sandboxes)。

  **注意：** `virtual_mode=True` 在启用 shell 访问的情况下不提供安全性，因为命令可以访问系统上的任何路径。
</Warning>

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, LocalShellBackend } from "deepagents";

  const backend = new LocalShellBackend({ workingDirectory: "." });

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    backend,
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, LocalShellBackend } from "deepagents";

  const backend = new LocalShellBackend({ workingDirectory: "." });

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    backend,
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, LocalShellBackend } from "deepagents";

  const backend = new LocalShellBackend({ workingDirectory: "." });

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    backend,
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, LocalShellBackend } from "deepagents";

  const backend = new LocalShellBackend({ workingDirectory: "." });

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    backend,
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, LocalShellBackend } from "deepagents";

  const backend = new LocalShellBackend({ workingDirectory: "." });

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    backend,
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, LocalShellBackend } from "deepagents";

  const backend = new LocalShellBackend({ workingDirectory: "." });

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    backend,
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, LocalShellBackend } from "deepagents";

  const backend = new LocalShellBackend({ workingDirectory: "." });

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    backend,
  });
  ```
</CodeGroup>

**它是如何工作的：*** 使用 `execute` 工具扩展 `FilesystemBackend`，用于在主机上运行 shell 命令。
* 命令使用 `subprocess.run(shell=True)` 直接在您的计算机上运行，​​无需沙箱。
* 支持环境变量`timeout`（默认120秒）、`max_output_bytes`（默认100,000）、`env`和`inherit_env`。
* Shell 命令使用`root_dir` 作为工作目录，但可以访问系统上的任何路径。

**最适合：**

* 本地编码助手和开发工具
* 当您信任代理时，开发过程中可以快速迭代

### StoreBackend（LangGraph商店）

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, StoreBackend } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    backend: new StoreBackend({
      namespace: (rt) => [rt.serverInfo.user.identity],
    }),
    store,
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, StoreBackend } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    backend: new StoreBackend({
      namespace: (rt) => [rt.serverInfo.user.identity],
    }),
    store,
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, StoreBackend } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    backend: new StoreBackend({
      namespace: (rt) => [rt.serverInfo.user.identity],
    }),
    store,
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, StoreBackend } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    backend: new StoreBackend({
      namespace: (rt) => [rt.serverInfo.user.identity],
    }),
    store,
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, StoreBackend } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    backend: new StoreBackend({
      namespace: (rt) => [rt.serverInfo.user.identity],
    }),
    store,
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, StoreBackend } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    backend: new StoreBackend({
      namespace: (rt) => [rt.serverInfo.user.identity],
    }),
    store,
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent, StoreBackend } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    backend: new StoreBackend({
      namespace: (rt) => [rt.serverInfo.user.identity],
    }),
    store,
  });
  ```
</CodeGroup>

<Note>
  部署到[LangSmith Deployment](/langsmith/deployment)时，省略`store`参数。平台自动为您的代理商提供商店。
</Note>

<Tip>
  `namespace`参数控制数据隔离。对于多用户部署，请始终设置 [namespace factory](/oss/javascript/deepagents/backends#namespace-factories) 来隔离每个用户或租户的数据。
</Tip>

**它是如何工作的：**

* [⟦T103⟧](https://reference.langchain.com/javascript/deepagents/backends/StoreBackend) 将文件存储在运行时提供的LangGraph [⟦T104⟧](https://reference.langchain.com/javascript/langchain-core/stores/BaseStore) 中，从而实现跨线程持久存储。

**最适合：*** 当您已经使用配置的 LangGraph 存储运行时（例如，Redis、Postgres 或[⟦T105⟧](https://reference.langchain.com/javascript/langchain-core/stores/BaseStore) 背后的云实现）。
* 当您通过 [LangSmith Deployment](/langsmith/deployment) 部署代理时（会自动为您的代理配置商店）。

#### 命名空间工厂

命名空间工厂控制 `StoreBackend` 读取和写入数据的位置。它接收一个 LangGraph [⟦T107⟧](https://reference.langchain.com/javascript/langchain/index/Runtime) 并返回用作存储命名空间的字符串元组。使用命名空间工厂来隔离用户、租户或助理之间的数据。

构造 `StoreBackend` 时将命名空间工厂传递给 `namespace` 参数：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
NamespaceFactory = Callable[[Runtime], tuple[str, ...]]
```

`Runtime` 提供：

* `rt.context` — 通过 LangGraph 的 [context schema](https://langchain-ai.github.io/langgraph/concepts/runtime/) 传递的用户提供的上下文（例如，`user_id`）

* `rt.serverInfo` — 在 LangGraph 服务器上运行时特定于服务器的元数据（助理 ID、图形 ID、经过身份验证的用户）

* `rt.executionInfo` — 执行身份信息（线程ID、运行ID、检查点ID）

<Note>
  `Runtime` 参数在 `deepagents>=1.9.1` 中可用。早期的 1.9.x 版本通过了 `BackendContext` - 请参阅下面的 [migrating from ⟦T118⟧](#migrating-from-backendcontext)。 `rt.serverInfo` 和 `rt.executionInfo` 需要 `deepagents>=1.9.0`。
</Note>

**常见的命名空间模式：**

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { StoreBackend } from "deepagents";

// Per-user: each user gets their own isolated storage
const backend = new StoreBackend({
  namespace: (rt) => [rt.serverInfo.user.identity],  // [!code highlight]
});

// Per-assistant: all users of the same assistant share storage
const backend = new StoreBackend({
  namespace: (rt) => [rt.serverInfo.assistantId],  // [!code highlight]
});

// Per-thread: storage scoped to a single conversation
const backend = new StoreBackend({
  namespace: (rt) => [rt.executionInfo.threadId],  // [!code highlight]
});
```您可以组合多个组件来创建更具体的范围 - 例如，`(user_id, thread_id)` 用于每个用户每个会话隔离，或者附加一个后缀（如 `"filesystem"`）以在同一范围使用多个存储命名空间时消除歧义。

命名空间组件必须仅包含字母数字字符、连字符、下划线、点、`@`、`+`、冒号和波形符。拒绝通配符（`*`、`?`）以防止全局注入。

<Warning>
  在 v1.9.0 中，`namespace` 参数将是**必需**。始终为新代码显式设置它。
</Warning>

<Note>
  当未提供命名空间工厂时，旧版默认使用 LangGraph 配置元数据中的 `assistant_id`。这意味着同一[assistant](/langsmith/assistants)的所有用户共享相同的存储。对于多用户[going to production](/oss/javascript/deepagents/going-to-production)，始终提供命名空间工厂。
</Note>

### ContextHub后端

<Note>
  **开始之前：** `ContextHubBackend` 需要在 LangSmith 中设置 Context Hub 存储库。如果您不熟悉代理存储库和技能存储库，请先阅读[Context Hub concepts](/langsmith/context-engineering-concepts)页面。
</Note>

`ContextHubBackend` 将代理的文件系统存储在 LangSmith Context Hub 存储库中。它可以使用独立存储库或链接到技能存储库的代理存储库。**存储库结构：** 在 Context Hub 中，*代理存储库* 保存代理的顶级指令和配置（例如，`AGENTS.md`、`tools.json`）。它可以链接到一个或多个“技能库”，每个库都打包为可重用功能（例如，带有电子邮件格式或代码审查说明的`SKILL.md`）。当您通过`ContextHubBackend("my-agent")`时，后端将代理存储库挂载到文件系统根目录；链接的技能存储库显示为`/skills/`下的子目录。

这意味着您的代理的上下文有意分布在存储库中：每个代理一个存储库，每个技能单独的存储库。这种分离使得技能可以在多个代理之间独立地进行版本控制、共享和重用。如果感觉这很支离破碎，请参阅[Linked repos](/langsmith/context-engineering-concepts#linked-repos)了解其基本原理。

使用 `owner/name` 或 `name` 格式的存储库标识符构建它。

<Note>
  使用`ContextHubBackend`之前先设置`LANGSMITH_API_KEY`。
</Note>

**它是如何工作的：**

* 首次使用时延迟拉动 Hub 存储库树，然后从内存缓存中读取数据。
* 在 Hub 提交时保留写入和编辑，并在成功提交后更新缓存。
* 使用乐观的父提交写入（`parent_commit`）：每次推送都针对最新的已知提交哈希。

**行为和限制：*** 如果repo不存在，第一次pull会被视为空；第一次成功写入可以创建存储库。
* 如果另一个写入者首先推进存储库，则过时的父提交写入可能会失败。重新拉动并重试冲突。
* `upload_files()` 接受 UTF-8 文本。每个路径的非 UTF-8 文件都会被 `invalid_path` 拒绝。

**最适合：**

* LangSmith-本机持久文件系统持久性，无需单独连接LangGraph`BaseStore`。
* 受益于文件系统更改的集线器提交历史记录的工作流程。

### CompositeBackend（路由器）

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore();

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    store,
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore();

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    store,
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore();

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    store,
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore();

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    store,
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore();

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    store,
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore();

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    store,
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const store = new InMemoryStore();

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    store,
  });
  ```
</CodeGroup>

**它是如何工作的：**

* [⟦T145⟧](https://reference.langchain.com/javascript/deepagents/backends/CompositeBackend) 根据路径前缀将文件操作路由到不同的后端。
* 保留列表和搜索结果中的原始路径前缀。

**最适合：**

* 当您想要为代理提供线程范围和跨线程存储时，`CompositeBackend` 允许您同时提供 `StateBackend` 和 `StoreBackend`
* 当您有多个信息源想要作为单个文件系统的一部分提供给代理时。
  * 例如您在一个商店的`/memories/`下存储了长期记忆，并且您还有一个自定义后端，可以在/docs/访问文档。## 指定后端

* 将后端实例传递给`createDeepAgent({ backend: ... })`。文件系统中间件将其用于所有工具。
* 后端必须实现`AnyBackendProtocol`（`BackendProtocolV1`或`BackendProtocolV2`）——例如，`new StateBackend()`、`new FilesystemBackend({ rootDir: "." })`、`new StoreBackend()`。
* 如果省略，则默认为`new StateBackend()`。

<Note>
  在1.9.0版本之前，仅支持`BackendProtocol`，现在是`BackendProtocolV1`。 V1 后端在运行时通过 `adaptBackendProtocol()` 自动适应 V2。无需更改代码即可继续使用现有的 V1 后端。要更新到 v2，请参阅[update existing backends to v2](#update-existing-backends-to-v2)。
</Note>

## 路由到不同的后端

将命名空间的部分路由到不同的后端。通常用于跨线程持久化 `/memories/*` 并保持其他所有内容都在线程范围内。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent, CompositeBackend, FilesystemBackend, StateBackend } from "deepagents";

const agent = createDeepAgent({
  backend: new CompositeBackend(
    new StateBackend(),
    {
      "/memories/": new FilesystemBackend({ rootDir: "/deepagents/myagent", virtualMode: true }),
    },
  ),
});
```

行为：

* `/workspace/plan.md` → `StateBackend`（线程范围）
* `/memories/agent.md`→`FilesystemBackend`下`/deepagents/myagent`
* `ls`、`glob`、`grep`聚合结果并显示原始路径前缀。

笔记：* 较长的前缀获胜（例如，路由 `"/memories/projects/"` 可以覆盖 `"/memories/"`）。
* 对于 StoreBackend 路由，请确保商店是通过 `create_deep_agent(model=..., store=...)` 提供的或由平台配置的。
* Deep Agents 将内部数据（卸载工具结果、对话历史记录）写入默认后端。使用 `StateBackend` 作为默认值可以保持这些工件短暂并避免将它们写入磁盘或持久存储。有关完整示例，请参阅[FilesystemBackend tip](#filesystembackend-local-disk)。

## 自定义后端

实现自定义后端以将Deep Agents连接到存储系统，例如数据库、对象存储和远程文件系统。示例请参见[community-built backends](/oss/javascript/integrations/backends)。

### 实现后端协议

实现[⟦T174⟧](https://reference.langchain.com/javascript/deepagents/backends/BackendProtocol)（`BackendProtocolV2`）并提供以下方法：|方法|签名|它有什么作用 |
| ---------| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ls` | `(path: string) => Promise<LsResult>` |列出给定路径中的文件和目录。                                                           |
| `read` | `(filePath: string, offset?, limit?) => Promise<ReadResult>` |返回文件内容，可以选择分页。二进制文件返回 `Uint8Array` 内容以及 `mimeType`。 |
| `readRaw` | `(filePath: string) => Promise<ReadRawResult>` |返回原始`FileData`（由框架内部使用）。                                               |
| `write` | `(filePath: string, content: string) => Promise<WriteResult>` |创建或覆盖文件。                                                                             || `edit` | `(filePath: string, oldString: string, newString: string, replaceAll?: boolean) => Promise<EditResult>` |在现有文件中查找并替换。                                                               |
| `glob` | `(pattern: string, path?: string) => Promise<GlobResult>` |返回与全局模式匹配的路径。                                                                   |
| `grep` | `(pattern: string, path?, glob?) => Promise<GrepResult>` |在文件内容中搜索文字字符串。                                                              |

要还支持 `execute` 工具（运行 shell 命令），请改为实现 [⟦T194⟧](https://reference.langchain.com/javascript/deepagents/backends/SandboxBackendProtocol)，它使用 `execute` 方法扩展 `BackendProtocolV2`。

所有方法都必须返回带有可选 `error` 字段的结构化结果对象 - 不要抛出丢失文件或无效模式。

<Accordion title="Example: S3-style backend skeleton">
  该骨架将文件系统路径映射到对象键。使用存储客户端的列表、读取、搜索、上传和读取-修改-写入操作填写每个方法。

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    type BackendProtocolV2,
    type EditResult,
    type GlobResult,
    type GrepResult,
    type LsResult,
    type ReadRawResult,
    type ReadResult,
    type WriteResult,
  } from "deepagents";

  class S3Backend implements BackendProtocolV2 {
    constructor(private bucket: string, private prefix: string = "") {
      this.prefix = prefix.replace(/\/$/, "");
    }

    private key(path: string): string {
      return `${this.prefix}${path}`;
    }

    async ls(path: string): Promise<LsResult> {
      ...
    }

    async read(filePath: string, offset?: number, limit?: number): Promise<ReadResult> {
      ...
    }

    async readRaw(filePath: string): Promise<ReadRawResult> {
      ...
    }

    async grep(pattern: string, path?: string | null, glob?: string | null): Promise<GrepResult> {
      ...
    }

    async glob(pattern: string, path = "/"): Promise<GlobResult> {
      ...
    }

    async write(filePath: string, content: string): Promise<WriteResult> {
      ...
    }

    async edit(filePath: string, oldString: string, newString: string, replaceAll?: boolean): Promise<EditResult> {
      ...
    }
  }
  ```
</Accordion>

## 权限

使用 [permissions](/oss/javascript/deepagents/permissions) 以声明方式控制代理可以读取或写入哪些文件和目录。权限适用于内置文件系统工具，并在调用后端之前进行评估。有关包括规则排序、子代理权限和复合后端交互在内的完整选项集，请参阅[permissions guide](/oss/javascript/deepagents/permissions)。

## 添加策略挂钩

对于超出基于路径的允许/拒绝规则（速率限制、审核日志记录、内容检查）的自定义验证逻辑，通过子类化或包装后端来强制实施企业规则。

阻止在选定前缀（子类）下写入/编辑：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { FilesystemBackend, type WriteResult, type EditResult } from "deepagents";

class GuardedBackend extends FilesystemBackend {
  private denyPrefixes: string[];

  constructor({ denyPrefixes, ...options }: { denyPrefixes: string[]; rootDir?: string }) {
    super(options);
    this.denyPrefixes = denyPrefixes.map(p => p.endsWith("/") ? p : p + "/");
  }

  async write(filePath: string, content: string): Promise<WriteResult> {
    if (this.denyPrefixes.some(p => filePath.startsWith(p))) {
      return { error: `Writes are not allowed under ${filePath}` };
    }
    return super.write(filePath, content);
  }

  async edit(filePath: string, oldString: string, newString: string, replaceAll = false): Promise<EditResult> {
    if (this.denyPrefixes.some(p => filePath.startsWith(p))) {
      return { error: `Edits are not allowed under ${filePath}` };
    }
    return super.edit(filePath, oldString, newString, replaceAll);
  }
}
```

通用包装器（适用于任何后端）：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  type BackendProtocolV2,
  type LsResult,
  type ReadResult,
  type ReadRawResult,
  type GrepResult,
  type GlobResult,
  type WriteResult,
  type EditResult,
} from "deepagents";

class PolicyWrapper implements BackendProtocolV2 {
  private denyPrefixes: string[];

  constructor(private inner: BackendProtocolV2, denyPrefixes: string[] = []) {
    this.denyPrefixes = denyPrefixes.map(p => p.endsWith("/") ? p : p + "/");
  }

  private isDenied(path: string): boolean {
    return this.denyPrefixes.some(p => path.startsWith(p));
  }

  ls(path: string): Promise<LsResult> { return this.inner.ls(path); }
  read(filePath: string, offset?: number, limit?: number): Promise<ReadResult> { return this.inner.read(filePath, offset, limit); }
  readRaw(filePath: string): Promise<ReadRawResult> { return this.inner.readRaw(filePath); }
  grep(pattern: string, path?: string | null, glob?: string | null): Promise<GrepResult> { return this.inner.grep(pattern, path, glob); }
  glob(pattern: string, path?: string): Promise<GlobResult> { return this.inner.glob(pattern, path); }

  async write(filePath: string, content: string): Promise<WriteResult> {
    if (this.isDenied(filePath)) return { error: `Writes are not allowed under ${filePath}` };
    return this.inner.write(filePath, content);
  }

  async edit(filePath: string, oldString: string, newString: string, replaceAll = false): Promise<EditResult> {
    if (this.isDenied(filePath)) return { error: `Edits are not allowed under ${filePath}` };
    return this.inner.edit(filePath, oldString, newString, replaceAll);
  }
}
```

## 多模式和二进制文件

<Note>
  多模式文件支持（PDF、音频、视频）需要`deepagents>=1.9.0`。
</Note>

V2 后端原生支持二进制文件。当`read()`遇到二进制文件（由文件扩展名的MIME类型确定）时，它返回一个带有`Uint8Array`内容和相应的`mimeType`的`ReadResult`。文本文件返回`string`内容。

### 支持的 MIME 类型|类别 |扩展 | MIME 类型 |
| ---------| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
|图片 | `.png`、`.jpg`/`.jpeg`、`.gif`、`.webp`、`.svg`、`.heic`、`.heif` | `image/png`、`image/jpeg`、`image/gif`、`image/webp`、`image/svg+xml`、`image/heic`、`image/heif` |
|音频| `.mp3`、`.wav`、`.aiff`、`.aac`、`.ogg`、`.flac` | `audio/mpeg`、`audio/wav`、`audio/aiff`、`audio/aac`、`audio/ogg`、`audio/flac` |
|视频 | `.mp4`、`.webm`、`.mpeg`/`.mpg`、`.mov`、`.avi`、`.flv`、`.wmv`、`.3gpp` | `video/mp4`、`video/webm`、`video/mpeg`、`video/quicktime`、`video/x-msvideo`、`video/x-flv`、`video/x-ms-wmv`、`video/3gpp` |
|文件 | `.pdf`、`.ppt`、`.pptx` | `application/pdf`、`application/vnd.ms-powerpoint`、`application/vnd.openxmlformats-officedocument.presentationml.presentation` ||文字| `.txt`、`.html`、`.json`、`.js`、`.ts`、`.py`等 | `text/plain`、`text/html`、`application/json`等 |

### 读取二进制文件

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const result = await backend.read("/workspace/screenshot.png");

if (result.error) {
  console.error(result.error);
} else if (result.content instanceof Uint8Array) {
  // Binary file — content is Uint8Array, mimeType is set
  console.log(`Binary file: ${result.mimeType}`); // "image/png"
} else {
  // Text file — content is string
  console.log(`Text file: ${result.mimeType}`); // "text/plain"
}
```

### 文件数据格式

`FileData`是用于在状态中存储文件内容并存储后端的类型。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
type FileData =
  // Current format (v2)
  | {
      content: string | Uint8Array; // string for text, Uint8Array for binary
      mimeType: string;             // e.g. "text/plain", "image/png"
      created_at: string;           // ISO 8601 timestamp
      modified_at: string;          // ISO 8601 timestamp
    }
  // Legacy format (v1)
  | {
      content: string[];            // array of lines
      created_at: string;           // ISO 8601 timestamp
      modified_at: string;          // ISO 8601 timestamp
    };
```

从状态或存储读取时，后端可能会遇到任一格式。框架透明地处理这两者。新写入默认为 v2 格式。在旧读者需要旧格式的滚动部署期间，将 `fileFormat: "v1"` 传递给后端构造函数（例如，`new StoreBackend({ fileFormat: "v1" })`）。

## 从后端工厂迁移

<Warning>
  自 `deepagents` 1.9.0 起，后端工厂模式已被**弃用**。直接传递预先构造的后端实例而不是工厂函数。
</Warning>

以前，像`StateBackend`和`StoreBackend`这样的后端需要一个接收运行时对象的工厂函数，因为它们需要运行时上下文（状态、存储）来操作。后端现在通过 LangGraph 的 `get_config()`、`get_store()` 和 `get_runtime()` 帮助程序在内部解析此上下文，因此您可以直接传递实例。

### 发生了什么变化|之前（已弃用）|之后 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `backend=lambda rt: StateBackend(rt)` | `backend=StateBackend()` |
| `backend=lambda rt: StoreBackend(rt)` | `backend=StoreBackend()` |
| `backend=lambda rt: CompositeBackend(default=StateBackend(rt), ...)` | `backend=CompositeBackend(default=StateBackend(), ...)` |
| `backend: (config) => new StateBackend(config)` | `backend: new StateBackend()` |
| `backend: (config) => new StoreBackend(config)` | `backend: new StoreBackend()` |

### 已弃用的 API|已弃用 |更换|
| ------------------------------------------------------------------------ | ------------------------------------------------------ |
| `BackendFactory`型 |直接传递后端实例 |
| `BackendRuntime`接口|后端在内部解析上下文 |
| `StateBackend(runtime, options?)` 构造函数重载 | `new StateBackend(options?)` |
| `StoreBackend(stateAndStore, options?)` 构造函数重载 | `new StoreBackend(options?)` |
| `WriteResult` 和 `EditResult` 上的`filesUpdate` 字段 |状态写入现在由后端在内部处理 |

<Note>
  工厂模式在运行时仍然有效并发出弃用警告。在下一个主要版本之前更新您的代码以使用直接实例。
</Note>

### 迁移示例

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Before (deprecated)
import { createDeepAgent, CompositeBackend, StateBackend, StoreBackend } from "deepagents";

const agent = createDeepAgent({
  backend: (config) => new CompositeBackend(
    new StateBackend(config),
    { "/memories/": new StoreBackend(config, {
      namespace: (rt) => [rt.serverInfo.user.identity],
    }) },
  ),
});

// After
const agent = createDeepAgent({
  backend: new CompositeBackend(
    new StateBackend(),
    { "/memories/": new StoreBackend({
      namespace: (rt) => [rt.serverInfo.user.identity],
    }) },
  ),
});
```

### 从 `BackendContext` 迁移在 `deepagents>=0.5.2` (Python) 和 `deepagents>=1.9.1` (TypeScript) 中，命名空间工厂直接接收 LangGraph [⟦T294⟧](https://reference.langchain.com/javascript/langchain/index/Runtime)，而不是 `BackendContext` 包装器。旧的 `BackendContext` 形式仍然可以通过向后兼容的 `.runtime` 和 `.state` 访问器工作，但这些访问器会发出弃用警告，并将在 `deepagents>=0.7` 中删除。

**改变了什么：**

* 工厂参数现在是`Runtime`，而不是`BackendContext`。
* 删除 `.runtime` 访问器 — 例如，`ctx.runtime.context.user_id` 变为 `rt.server_info.user.identity`。
* `ctx.state` 没有直接替代品。命名空间信息应该是只读的并且在运行的生命周期内保持稳定，而状态是可变的并且会逐步更改 - 从它派生命名空间可能会导致数据最终处于不一致的键下。如果您有需要读取代理状态的用例，请[open an issue](https://github.com/langchain-ai/deepagents/issues)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Before (deprecated, removed in v0.7)
new StoreBackend({
  namespace: (ctx) => [ctx.runtime.context.userId],  // [!code --]
});

// After
new StoreBackend({
  namespace: (rt) => [rt.serverInfo.user.identity],  // [!code ++]
});
```

## 协议参考

后端必须实现[⟦T306⟧](https://reference.langchain.com/javascript/deepagents/backends/BackendProtocol)。

所需方法：* `ls(path: str) -> LsResult`
  * 返回至少包含 `path` 的条目。如果有，请包括 `is_dir`、`size`、`modified_at`。按 `path` 排序以获得确定性输出。
* `read(file_path: str, offset: int = 0, limit: int = 2000) -> ReadResult`
  * 成功时返回文件数据。如果文件丢失，则返回`ReadResult(error="Error: File '/x' not found")`。
* `grep(pattern: str, path: Optional[str] = None, glob: Optional[str] = None) -> GrepResult`
  * 返回结构化匹配。出错时，返回`GrepResult(error="...")`（不引发）。
* `glob(pattern: str, path: Optional[str] = None) -> GlobResult`
  * 将匹配的文件作为 `FileInfo` 条目返回（如果没有则为空列表）。
* `write(file_path: str, content: str) -> WriteResult`
  * 仅限创建。发生冲突时，返回`WriteResult(error=...)`。成功后，设置`path`，对于状态后端设置`files_update={...}`；外部后端应使用`files_update=None`。
* `edit(file_path: str, old_string: str, new_string: str, replace_all: bool = False) -> EditResult`
  * 强制`old_string`的唯一性，除非`replace_all=True`。如果没有找到，则返回错误。成功时包含`occurrences`。

配套类型：

* `LsResult(error, entries)` — `entries` 是成功时的 `list[FileInfo]`，失败时的 `None`。
* `ReadResult(error, file_data)` — `file_data` 是关于成功的 `FileData` 指令，`None` 关于失败的指令。
* `GrepResult(error, matches)` — `matches` 是成功时的 `list[GrepMatch]`，失败时的 `None`。
* `GlobResult(error, matches)` — `matches` 成功时为 `list[FileInfo]`，失败时为 `None`。
* `WriteResult(error, path, files_update)`
* `EditResult(error, path, files_update, occurrences)`
* `FileInfo` 包含字段：`path`（必填），可选 `is_dir`、`size`、`modified_at`。
* `GrepMatch` 包含字段：`path`、`line`、`text`。
* `FileData` 包含字段：`content` (str)、`encoding`（`"utf-8"` 或 `"base64"`）、`created_at`、`modified_at`。
  :::后端实现`BackendProtocolV2`。所有查询方法都返回带有`{ error?: string, ...data }`的结构化结果对象。

### 必需的方法

* **`ls(path: string) → LsResult`**
  * 列出指定目录中的文件和目录（非递归）。目录的路径中有一个尾随的 `/` 和 `is_dir=true`。包括 `is_dir`、`size`、`modified_at`（如果有）。

* **`read(filePath: string, offset?: number, limit?: number) → ReadResult`**
  * 读取文件内容。对于文本文件，内容按行偏移量/限制（默认偏移量 0，限制 500）分页。对于二进制文件，将返回完整的原始 `Uint8Array` 内容以及 `mimeType` 字段集。如果文件丢失，请返回`{ error: "File '/x' not found" }`。

* **`readRaw(filePath: string) → ReadRawResult`**
  * 将文件内容读取为原始`FileData`。返回包含时间戳的完整文件数据。

* **`grep(pattern: string, path?: string | null, glob?: string | null) → GrepResult`**
  * 搜索文件内容以查找文字文本模式。二进制文件（由 MIME 类型确定）将被跳过。失败时，返回`{ error: "..." }`。

* **`glob(pattern: string, path?: string) → GlobResult`**
  * 返回与 glob 模式匹配的文件作为 `FileInfo` 条目。

* **`write(filePath: string, content: string) → WriteResult`**
  * 仅创建语义。发生冲突时，返回`{ error: "..." }`。成功后，设置`path`，对于状态后端设置`filesUpdate={...}`；外部后端应使用`filesUpdate=null`。

* **`edit(filePath: string, oldString: string, newString: string, replaceAll?: boolean) → EditResult`**
  * 强制`oldString`的唯一性，除非`replaceAll=true`。如果没有找到，则返回错误。成功时包含`occurrences`。

### 可选方法* **`uploadFiles(files: Array<[string, Uint8Array]>) → FileUploadResponse[]`** — 上传多个文件（用于沙箱后端）。
* **`downloadFiles(paths: string[]) → FileDownloadResponse[]`** — 下载多个文件（用于沙箱后端）。

### 结果类型

|类型 |成功领域 |错误字段 |
| ---------------- | ---------------------------------------------------------------- | ----------- |
| `ReadResult` | `content?: string \| Uint8Array`、`mimeType?: string` | `error` |
| `ReadRawResult` | `data?: FileData` | `error` |
| `LsResult` | `files?: FileInfo[]` | `error`​​ |
| `GlobResult` | `files?: FileInfo[]` | `error` |
| `GrepResult` | `matches?: GrepMatch[]` | `error` |
| `WriteResult` | `path?: string` | `error` |
| `EditResult` | `path?: string`、`occurrences?: number` | `error` |

### 支持类型

* **`FileInfo`** — `path`（必填），可选 `is_dir`、`size`、`modified_at`。
* **`GrepMatch`** — `path`、`line`（1 索引）、`text`。
* **`FileData`** — 带时间戳的文件内容。参见[FileData format](#filedata-format)。

### 沙箱扩展

`SandboxBackendProtocolV2` 扩展 `BackendProtocolV2`：

* **`execute(command: string) → ExecuteResponse`** — 在沙箱中运行 shell 命令。
* **`readonly id: string`** — 沙箱实例的唯一标识符。

## 将现有后端更新到 V2<Accordion title="Migration guide">
  ### 方法重命名

  | V1方法| V2方法|返回类型更改 |
  | ------------------------------------------- | ------------------------------------------- | -------------------------------------- |
  | `lsInfo(path)` | `ls(path)` | `FileInfo[]` → `LsResult` |
  | `read(filePath, offset, limit)` | `read(filePath, offset, limit)` | `string` → `ReadResult` |
  | `readRaw(filePath)` | `readRaw(filePath)` | `FileData` → `ReadRawResult` |
  | `grepRaw(pattern, path, glob)` | `grep(pattern, path, glob)` | `GrepMatch[] \| string` → `GrepResult` |
  | `globInfo(pattern, path)` | `glob(pattern, path)` | `FileInfo[]` → `GlobResult` |
  | `write(...)` | `write(...)` |不变（`WriteResult`）|
  | `edit(...)` | `edit(...)` |不变 (`EditResult`) |

  ### 类型重命名

  | V1型| V2型|
  | ------------------------ | -------------------------- |
  | `BackendProtocol` | `BackendProtocolV2` |
  | `SandboxBackendProtocol` | `SandboxBackendProtocolV2` |

  ### 适应实用程序

  如果您有现有的 V1 后端需要与纯 V2 代码一起使用，请使用适配函数：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { adaptBackendProtocol, adaptSandboxProtocol } from "deepagents";

  // Adapt a V1 backend to V2
  const v2Backend = adaptBackendProtocol(v1Backend);

  // Adapt a V1 sandbox to V2
  const v2Sandbox = adaptSandboxProtocol(v1Sandbox);
  ```<Note>
    该框架自动适应传递到 `createDeepAgent()` 的 V1 后端。只有直接调用协议方法时才需要手动适配。
  </Note>
</Accordion>

## 另请参阅

* [OpenWiki](/oss/openwiki/overview)：生成持久存储库 Markdown，代理通过文件系统工具读取
* [Memory](/oss/javascript/deepagents/memory)：文件系统支持的长期存储器
* [Sandboxes](/oss/javascript/deepagents/sandboxes)：隔离文件系统和 shell 执行

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/backends.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>