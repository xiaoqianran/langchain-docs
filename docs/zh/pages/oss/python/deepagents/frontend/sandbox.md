<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox | https://docs.langchain.com/oss/python/deepagents/frontend/sandbox -->

# 沙盒

为沙箱环境支持的编码代理构建类似 IDE 的 UI

编码代理需要的不仅仅是聊天窗口。他们需要一个文件浏览器、一个代码
查看器、差异面板、IDE 体验。这种模式连接了很深的
代理到[sandbox](/oss/python/deepagents/sandboxes)，以便它可以读取，
在隔离环境中编写和执行代码，然后公开沙箱
文件系统通过自定义 API 服务器，以便前端可以显示文件
代理工作时实时进行。

此页面涵盖 **三面板 UI**（文件树、代码查看器和聊天）和
**自定义 API 路由**，将沙箱文件系统暴露给它。对于沙箱
提供商、生命周期范围、种子文件、机密、部署和生产
`useStream`配置参见[Going to production](/oss/python/deepagents/going-to-production)。

<PatternEmbed />

## 架构

此设置分为三个部分：

1. **具有沙箱后端的深度代理：** 代理获取文件系统工具
   (`read_file`、`write_file`、`edit_file`、`delete`、`execute`)
   来自沙箱

2. **自定义 API 服务器** — 通过 `langgraph.json` 的 `http.app` 公开的 FastAPI 应用程序
   字段，提供前端可以调用的文件浏览端点3. **三面板前端：** 文件树、代码/差异查看器和聊天面板
   当代理进行更改时实时同步文件

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{
  init: {
    "fontFamily": "monospace",
    "flowchart": {
      "curve": "curve"
    }
  }
}%%
graph LR
  UI["IDE Frontend"]
  API["API Server"]
  AGENT["createDeepAgent()"]
  SANDBOX["Sandbox"]

  UI --"useStream()"--> AGENT
  UI --"/sandbox/:threadId/*"--> API
  AGENT --"read/write/execute"--> SANDBOX
  API --"ls / read"--> SANDBOX

  classDef blueHighlight fill:#E5F4FF,stroke:#006DDD,color:#030710;
  classDef greenHighlight fill:#F6FFDB,stroke:#6E8900,color:#2E3900;
  classDef purpleHighlight fill:#EBD0F0,stroke:#885270,color:#441E33;
  classDef orangeHighlight fill:#FDF3FF,stroke:#7E65AE,color:#504B5F;
  class UI blueHighlight;
  class AGENT greenHighlight;
  class SANDBOX purpleHighlight;
  class API orangeHighlight;
```

## 沙箱生命周期

在连接前端之前选择沙箱的生存时间以及共享沙箱的人员。
请参阅 [Sandbox lifecycle](/oss/python/deepagents/going-to-production#lifecycle) 了解线程范围
与助手范围的沙箱，异步 [graph factory](/langsmith/graph-rebuild)
设置、TTL 行为和 SDK 调用示例。

本指南默认使用**线程范围的沙箱**。前端和
自定义 API 服务器都解析来自 LangGraph 的沙箱
[thread](/langsmith/use-threads) ID。这使得对话保持隔离并且
当您 [persist the thread ID](#thread-creation) 时，让页面重新加载重新连接到相同的环境。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    participant FE as Frontend
    participant LG as LangGraph API
    participant HTTP as API Server
    participant SB as Sandbox

    Note over FE: Page loads
    FE->>LG: POST /threads
    LG-->>FE: threadId

    FE->>HTTP: GET /sandbox/:threadId/tree
    HTTP->>LG: threads.get(threadId) → metadata.sandbox_id
    alt No sandbox yet
        HTTP->>SB: LangSmithSandbox.create()
        HTTP->>LG: threads.update(threadId, metadata.sandbox_id)
    else Existing sandbox
        HTTP->>SB: connect(sandbox_id)
    end
    HTTP-->>FE: file tree

    Note over FE: User sends message
    FE->>LG: POST /threads/:threadId/runs/stream
    LG->>LG: backend reads thread_id from config
    LG->>SB: connect to same sandbox
```

对于 [multi-tenant](/oss/python/deepagents/going-to-production#multi-tenancy) 应用程序，
而是由后端工厂中的用户或助理来范围沙箱。对于
没有 LangGraph 线程的演示，在
API 网址。会话 ID 不会在浏览器会话中持续存在。

## 连接代理和API服务器

使用 [sandbox backend](/oss/python/deepagents/sandboxes) 配置深度代理
如[Execution environment](/oss/python/deepagents/going-to-production#execution-environment)中所述。
代理自动获取文件系统工具和`execute`工具；没有额外的
需要工具配置。构建此 UI 在生产设置之上添加了一项要求：
**自定义 API 服务器** 在代理图之外运行，因此代理
后端和您的文件浏览路由必须解析**相同的沙箱**
每个线程。将沙箱 ID 存储在线程元数据上并共享一个
它们之间的查找功能。

### 从线程元数据解析沙箱

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from deepagents.backends.langsmith import LangSmithSandbox
  from langgraph.config import get_config


  def get_or_create_sandbox_for_thread(thread_id: str) -> LangSmithSandbox:
      if not thread_id:
          raise ValueError("thread_id is required")
      # Look up sandbox_id from thread metadata, create if missing, and seed files.
      raise NotImplementedError(
          "Implement sandbox lookup and creation for your deployment environment."
      )


  def get_thread_id_from_config() -> str:
      configurable = get_config().get("configurable", {})
      thread_id = configurable.get("thread_id")
      if not thread_id:
          raise ValueError("No thread_id, agent must run on a thread")
      return thread_id


  def agent():
      return create_deep_agent(
          model="google_genai:gemini-3.6-flash",
          backend=lambda _runtime: get_or_create_sandbox_for_thread(
              get_thread_id_from_config()
          ),
      )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from deepagents.backends.langsmith import LangSmithSandbox
  from langgraph.config import get_config


  def get_or_create_sandbox_for_thread(thread_id: str) -> LangSmithSandbox:
      if not thread_id:
          raise ValueError("thread_id is required")
      # Look up sandbox_id from thread metadata, create if missing, and seed files.
      raise NotImplementedError(
          "Implement sandbox lookup and creation for your deployment environment."
      )


  def get_thread_id_from_config() -> str:
      configurable = get_config().get("configurable", {})
      thread_id = configurable.get("thread_id")
      if not thread_id:
          raise ValueError("No thread_id, agent must run on a thread")
      return thread_id


  def agent():
      return create_deep_agent(
          model="openai:gpt-5.5",
          backend=lambda _runtime: get_or_create_sandbox_for_thread(
              get_thread_id_from_config()
          ),
      )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from deepagents.backends.langsmith import LangSmithSandbox
  from langgraph.config import get_config


  def get_or_create_sandbox_for_thread(thread_id: str) -> LangSmithSandbox:
      if not thread_id:
          raise ValueError("thread_id is required")
      # Look up sandbox_id from thread metadata, create if missing, and seed files.
      raise NotImplementedError(
          "Implement sandbox lookup and creation for your deployment environment."
      )


  def get_thread_id_from_config() -> str:
      configurable = get_config().get("configurable", {})
      thread_id = configurable.get("thread_id")
      if not thread_id:
          raise ValueError("No thread_id, agent must run on a thread")
      return thread_id


  def agent():
      return create_deep_agent(
          model="anthropic:claude-sonnet-4-6",
          backend=lambda _runtime: get_or_create_sandbox_for_thread(
              get_thread_id_from_config()
          ),
      )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from deepagents.backends.langsmith import LangSmithSandbox
  from langgraph.config import get_config


  def get_or_create_sandbox_for_thread(thread_id: str) -> LangSmithSandbox:
      if not thread_id:
          raise ValueError("thread_id is required")
      # Look up sandbox_id from thread metadata, create if missing, and seed files.
      raise NotImplementedError(
          "Implement sandbox lookup and creation for your deployment environment."
      )


  def get_thread_id_from_config() -> str:
      configurable = get_config().get("configurable", {})
      thread_id = configurable.get("thread_id")
      if not thread_id:
          raise ValueError("No thread_id, agent must run on a thread")
      return thread_id


  def agent():
      return create_deep_agent(
          model="openrouter:z-ai/glm-5.2",
          backend=lambda _runtime: get_or_create_sandbox_for_thread(
              get_thread_id_from_config()
          ),
      )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from deepagents.backends.langsmith import LangSmithSandbox
  from langgraph.config import get_config


  def get_or_create_sandbox_for_thread(thread_id: str) -> LangSmithSandbox:
      if not thread_id:
          raise ValueError("thread_id is required")
      # Look up sandbox_id from thread metadata, create if missing, and seed files.
      raise NotImplementedError(
          "Implement sandbox lookup and creation for your deployment environment."
      )


  def get_thread_id_from_config() -> str:
      configurable = get_config().get("configurable", {})
      thread_id = configurable.get("thread_id")
      if not thread_id:
          raise ValueError("No thread_id, agent must run on a thread")
      return thread_id


  def agent():
      return create_deep_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          backend=lambda _runtime: get_or_create_sandbox_for_thread(
              get_thread_id_from_config()
          ),
      )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from deepagents.backends.langsmith import LangSmithSandbox
  from langgraph.config import get_config


  def get_or_create_sandbox_for_thread(thread_id: str) -> LangSmithSandbox:
      if not thread_id:
          raise ValueError("thread_id is required")
      # Look up sandbox_id from thread metadata, create if missing, and seed files.
      raise NotImplementedError(
          "Implement sandbox lookup and creation for your deployment environment."
      )


  def get_thread_id_from_config() -> str:
      configurable = get_config().get("configurable", {})
      thread_id = configurable.get("thread_id")
      if not thread_id:
          raise ValueError("No thread_id, agent must run on a thread")
      return thread_id


  def agent():
      return create_deep_agent(
          model="baseten:zai-org/GLM-5.2",
          backend=lambda _runtime: get_or_create_sandbox_for_thread(
              get_thread_id_from_config()
          ),
      )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from deepagents.backends.langsmith import LangSmithSandbox
  from langgraph.config import get_config


  def get_or_create_sandbox_for_thread(thread_id: str) -> LangSmithSandbox:
      if not thread_id:
          raise ValueError("thread_id is required")
      # Look up sandbox_id from thread metadata, create if missing, and seed files.
      raise NotImplementedError(
          "Implement sandbox lookup and creation for your deployment environment."
      )


  def get_thread_id_from_config() -> str:
      configurable = get_config().get("configurable", {})
      thread_id = configurable.get("thread_id")
      if not thread_id:
          raise ValueError("No thread_id, agent must run on a thread")
      return thread_id


  def agent():
      return create_deep_agent(
          model="ollama:north-mini-code-1.0",
          backend=lambda _runtime: get_or_create_sandbox_for_thread(
              get_thread_id_from_config()
          ),
      )
  ```
</CodeGroup>

<Note>
  与[Going to production](/oss/python/deepagents/going-to-production#lifecycle)中的例子类似，
  代理是每次运行时调用的异步图工厂。将沙箱 ID 存储在
  线程元数据，因此自定义`http.app`路由可以调用相同的
  `getOrCreateSandboxForThread` 帮手。进入生产使用提供商标签
  当 LangGraph SDK 是唯一入口点时，改为查找。
</Note>

### 种子项目文件

在代理运行之前，使用 `uploadFiles` / 上传启动文件
`upload_files`。参见[File transfers](/oss/python/deepagents/going-to-production#file-transfers)
用于播种模式、提供程序示例和同步
[memories](/oss/python/deepagents/memory) 或 [skills](/oss/python/deepagents/skills) 进入
沙箱。对于 LangSmith 沙箱，从 a 传递 `templateName`
[sandbox snapshot](/langsmith/sandbox-snapshots) 创建容器时。

<Tip>
  上传后运行`sandbox.execute("cd /app && npm install")`
  `package.json` 因此依赖关系在第一个代理轮流之前就已准备就绪。
</Tip>

## 添加文件浏览API代理可以读写文件，但前端也需要直接访问
浏览沙箱文件系统。添加自定义 [FastAPI](https://fastapi.tiangolo.com) API 服务器
并通过`langgraph.json`中的`http.app`字段公开它。

### 创建API服务器

沙箱 API 端点使用线程 ID 作为 URL 路径参数。这个
确保前端始终访问当前的正确沙箱
对话，使用与 `get_or_create_sandbox_for_thread` 相同的功能
代理后台：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# src/api/server.py
from fastapi import FastAPI, Query, Path
from utils import get_or_create_sandbox_for_thread

app = FastAPI()

@app.get("/sandbox/{thread_id}/tree")
async def list_tree(
    thread_id: str = Path(...),
    filePath: str = Query("/app"),
):
    sandbox = await get_or_create_sandbox_for_thread(thread_id)
    result = await sandbox.aexecute(
        f"find {filePath} -printf '%y\\t%s\\t%p\\n' 2>/dev/null | sort"
    )
    entries = []
    for line in result.output.strip().split("\n"):
        if not line:
            continue
        type_char, size_str, full_path = line.split("\t")
        entries.append({
            "name": full_path.split("/")[-1],
            "type": "directory" if type_char == "d" else "file",
            "path": full_path,
            "size": int(size_str),
        })
    return {"path": filePath, "entries": entries, "sandboxId": sandbox.id}

@app.get("/sandbox/{thread_id}/file")
async def read_file(
    thread_id: str = Path(...),
    filePath: str = Query(...),
):
    sandbox = await get_or_create_sandbox_for_thread(thread_id)
    results = await sandbox.adownload_files([filePath])
    return {"path": filePath, "content": results[0].content.decode()}
```

<Note>
  代理后端和API服务器都调用相同的
  `get_or_create_sandbox_for_thread`功能。这确保他们始终能够解决

  到给定线程的同一沙箱。线程元数据中的沙箱 ID
  是唯一的事实来源——不需要内存缓存。
</Note>

### 配置`langgraph.json`

注册代理图和 API 服务器。 `http.app`字段告诉我们
LangGraph 平台可与默认路线一起为您的自定义路线提供服务。
参见 [application structure](/oss/python/langgraph/application-structure) 和
[LangSmith Deployments](/oss/python/deepagents/going-to-production#langsmith-deployments)
了解全套 `langgraph.json` 选项。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "graphs": {
    "deep_agent_ide": "./src/agents/my_agent.py:agent"
  },
  "env": ".env",
  "http": {
    "app": "./src/api/server.py:app"
  }
}
```

您的自定义路由可在与 LangGraph API 相同的主机上使用。对于
使用`langgraph dev`进行本地开发，即`http://localhost:2024`。<Note>
  `http.app` 中定义的自定义路由优先于默认 LangGraph 路由。这意味着你
  如果需要，可以隐藏内置端点，但要小心不要意外覆盖路由，例如
  `/threads` 或 `/runs`。
</Note>

## 构建前端

前端具有三个面板：文件树侧边栏、代码/差异查看器和
聊天面板。它使用 [⟦T49⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 进行代理对话和自定义 API
文件浏览的端点。

对于生产部署，请将 `apiUrl` 指向您的
[LangSmith Deployment](/langsmith/deployment)，并通过稳定
每次运行时`thread_id`。参见
[Frontend](/oss/python/deepagents/going-to-production#frontend) 在
[Going to production](/oss/python/deepagents/going-to-production) 对于这些设置
对于[invoking the agent](/oss/python/deepagents/going-to-production#invoking-the-agent)
与 `thread_id` 和运行时 `context`。

### 线程创建

页面加载时创建一个 LangGraph 线程并将其 ID 保存在
`sessionStorage` 因此页面重新加载重新连接到同一个沙箱：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const THREAD_KEY = "sandbox-thread-id";

function IDEPreview() {
  const [threadId, setThreadId] = useState<string | null>(
    () => sessionStorage.getItem(THREAD_KEY),
  );

  const updateThreadId = useCallback((id: string | null) => {
    setThreadId(id);
    if (id) sessionStorage.setItem(THREAD_KEY, id);
    else sessionStorage.removeItem(THREAD_KEY);
  }, []);

  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "deep_agent_ide",
    threadId,
    onThreadId: updateThreadId,
  });

  // Create thread on first mount
  useEffect(() => {
    if (threadId) return;
    stream.client.threads.create().then((t) => updateThreadId(t.thread_id));
  }, [stream.client, threadId, updateThreadId]);

  // Pass threadId to sandbox file hooks
  const { tree, files } = useSandboxFiles(threadId);
  // ...
}
```

“新线程”按钮会清除存储的 ID，以便下一次安装创建一个
新线程（和沙箱）：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function handleNewThread() {
  updateThreadId(null);
}
```

### 文件状态管理

跟踪沙箱文件系统的两个快照：原始状态（在
代理运行）和当前状态（实时更新）。线程ID是
包含在 API URL 中，以便请求始终到达正确的沙箱：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const AGENT_URL = "http://localhost:2024";

async function fetchTree(threadId: string): Promise<FileEntry[]> {
  const res = await fetch(
    `${AGENT_URL}/sandbox/${encodeURIComponent(threadId)}/tree?filePath=/app`,
  );
  const data = await res.json();
  return data.entries.filter((e: FileEntry) => !e.path.includes("node_modules"));
}

async function fetchFile(threadId: string, path: string): Promise<string | null> {
  const res = await fetch(
    `${AGENT_URL}/sandbox/${encodeURIComponent(threadId)}/file?filePath=${encodeURIComponent(path)}`,
  );
  const data = await res.json();
  return data.content ?? null;
}
```

### 实时文件同步IDE 体验的关键是在代理工作时更新文件，而不是
完成后。观看 `ToolMessage` 实例的流消息
来自文件变异工具。当`write_file`或`edit_file`工具调用时
完成后，刷新该特定文件。当`execute`完成后，刷新
一切（因为 shell 命令可以修改任何文件）：

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";
  import { ToolMessage, AIMessage } from "langchain";

  const FILE_MUTATING_TOOLS = new Set(["write_file", "edit_file", "execute"]);

  export function IDEPreview() {
    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "deep_agent_ide",
    });

    const processedIds = useRef(new Set<string>());

    useEffect(() => {
      // Build a map of file-mutating tool calls from AI messages
      const toolCallMap = new Map();
      for (const msg of stream.messages) {
        if (!AIMessage.isInstance(msg)) continue;
        for (const tc of msg.tool_calls ?? []) {
          if (tc.id && FILE_MUTATING_TOOLS.has(tc.name)) {
            toolCallMap.set(tc.id, { name: tc.name, args: tc.args });
          }
        }
      }

      // When a ToolMessage appears for a file-mutating tool, refresh
      for (const msg of stream.messages) {
        if (!ToolMessage.isInstance(msg)) continue;
        const id = msg.id ?? msg.tool_call_id;
        if (!id || processedIds.current.has(id)) continue;

        const call = toolCallMap.get(msg.tool_call_id);
        if (!call) continue;
        processedIds.current.add(id);

        if (call.name === "write_file" || call.name === "edit_file") {
          refreshSingleFile(call.args.path ?? call.args.file_path);
        } else if (call.name === "execute") {
          refreshTreeAndFiles();
        }
      }
    }, [stream.messages]);
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";
  import { ToolMessage, AIMessage } from "langchain";
  import { watch } from "vue";

  const FILE_MUTATING_TOOLS = new Set(["write_file", "edit_file", "execute"]);
  const processedIds = new Set<string>();

  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "deep_agent_ide",
  });

  watch(
    () => stream.messages.value,
    (messages) => {
      const toolCallMap = new Map();
      for (const msg of messages) {
        if (AIMessage.isInstance(msg)) {
          for (const tc of msg.tool_calls ?? []) {
            if (tc.id && FILE_MUTATING_TOOLS.has(tc.name)) {
              toolCallMap.set(tc.id, { name: tc.name, args: tc.args });
            }
          }
        }
      }

      for (const msg of messages) {
        if (!ToolMessage.isInstance(msg)) continue;
        const id = msg.id ?? msg.tool_call_id;
        if (!id || processedIds.has(id)) continue;

        const call = toolCallMap.get(msg.tool_call_id);
        if (!call) continue;
        processedIds.add(id);

        if (call.name === "write_file" || call.name === "edit_file") {
          refreshSingleFile(call.args.path ?? call.args.file_path);
        } else if (call.name === "execute") {
          refreshTreeAndFiles();
        }
      }
    },
    { deep: true },
  );
  </script>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream } from "@langchain/svelte";
    import { ToolMessage, AIMessage } from "langchain";

    const FILE_MUTATING_TOOLS = new Set(["write_file", "edit_file", "execute"]);
    const processedIds = new Set<string>();

    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "deep_agent_ide",
    });

    $effect(() => {
      const msgs = stream.messages;
      const toolCallMap = new Map();
      for (const msg of msgs) {
        if (AIMessage.isInstance(msg)) {
          for (const tc of msg.tool_calls ?? []) {
            if (tc.id && FILE_MUTATING_TOOLS.has(tc.name)) {
              toolCallMap.set(tc.id, { name: tc.name, args: tc.args });
            }
          }
        }
      }

      for (const msg of msgs) {
        if (!ToolMessage.isInstance(msg)) continue;
        const id = msg.id ?? msg.tool_call_id;
        if (!id || processedIds.has(id)) continue;

        const call = toolCallMap.get(msg.tool_call_id);
        if (!call) continue;
        processedIds.add(id);

        if (call.name === "write_file" || call.name === "edit_file") {
          refreshSingleFile(call.args.path ?? call.args.file_path);
        } else if (call.name === "execute") {
          refreshTreeAndFiles();
        }
      }
    });
  </script>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component, effect } from "@angular/core";
  import { injectStream } from "@langchain/angular";
  import { ToolMessage, AIMessage } from "langchain";

  const FILE_MUTATING_TOOLS = new Set(["write_file", "edit_file", "execute"]);

  @Component({
    selector: "app-ide-preview",
    template: `<!-- ... -->`,
  })
  export class IdePreviewComponent {
    stream = injectStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "deep_agent_ide",
    });

    private processedIds = new Set<string>();

    constructor() {
      effect(() => {
        const messages = this.stream.messages();
        const toolCallMap = new Map();
        for (const msg of messages) {
          if (AIMessage.isInstance(msg)) {
            for (const tc of (msg as AIMessage).tool_calls ?? []) {
              if (tc.id && FILE_MUTATING_TOOLS.has(tc.name)) {
                toolCallMap.set(tc.id, { name: tc.name, args: tc.args });
              }
            }
          }
        }

        for (const msg of messages) {
          if (!ToolMessage.isInstance(msg)) continue;
          const id = (msg as ToolMessage).id ?? (msg as ToolMessage).tool_call_id;
          if (!id || this.processedIds.has(id)) continue;

          const call = toolCallMap.get((msg as ToolMessage).tool_call_id);
          if (!call) continue;
          this.processedIds.add(id);

          if (call.name === "write_file" || call.name === "edit_file") {
            this.refreshSingleFile(call.args.path ?? call.args.file_path);
          } else if (call.name === "execute") {
            this.refreshTreeAndFiles();
          }
        }
      });
    }
  }
  ```
</CodeGroup>

### 检测已更改的文件

在每个代理运行之前，对当前文件内容进行快照。文件刷新后，
与快照进行比较以确定哪些文件发生了更改：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function detectChanges(
  current: FileSnapshot,
  original: FileSnapshot,
): Set<string> {
  const changed = new Set<string>();
  for (const [path, content] of Object.entries(current)) {
    if (original[path] !== content) changed.add(path);
  }
  for (const path of Object.keys(original)) {
    if (!(path in current)) changed.add(path);
  }
  return changed;
}
```

当用户选择更改的文件时，默认为差异视图，以便他们
立即查看代理修改了什么。

### 显示差异

使用适合框架的 diff 库来呈现统一的 diff：|框架|图书馆 |组件|
| ---------| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
|反应 | [⟦T59⟧](https://diffs.com) | `<FileDiff>` 与 `parseDiffFromFile` |
|视图 | [⟦T62⟧](https://github.com/MrWangJustToDo/git-diff-view) | `<DiffView>` 与 `generateDiffFile` 来自 `@git-diff-view/file` |
|苗条| [⟦T66⟧](https://github.com/MrWangJustToDo/git-diff-view) | `<DiffView>` 与 `generateDiffFile` 来自 `@git-diff-view/file` |
|角度| [⟦T70⟧](https://github.com/rars/ngx-diff) | `<ngx-unified-diff>` 与 `[before]` 和 `[after]` |

`@pierre/diffs` 示例（React）：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { FileDiff } from "@pierre/diffs/react";
import { parseDiffFromFile } from "@pierre/diffs";

function DiffPanel({ original, current, fileName }) {
  const diff = parseDiffFromFile(
    { name: fileName, contents: original },
    { name: fileName, contents: current },
  );

  return (
    <FileDiff
      fileDiff={diff}
      options={{ theme: "github-dark", diffStyle: "unified", diffIndicators: "bars" }}
    />
  );
}
```

### 更改文件摘要

显示所有修改文件的摘要以及行级添加/删除计数。
这使用户可以快速了解代理的影响 - 类似于“git”
状态`：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function ChangedFilesSummary({ changedFiles, files, originalFiles, onSelect }) {
  const stats = [...changedFiles].map((path) => {
    const oldLines = (originalFiles[path] ?? "").split("\n");
    const newLines = (files[path] ?? "").split("\n");
    // Compute additions/deletions by comparing lines
    return { path, additions, deletions };
  });

  return (
    <div>
      <h3>{stats.length} Files Changed</h3>
      {stats.map((file) => (
        <button key={file.path} onClick={() => onSelect(file.path)}>
          {file.path}
          <span className="text-green-400">+{file.additions}</span>
          <span className="text-red-400">-{file.deletions}</span>
        </button>
      ))}
    </div>
  );
}
```

## 用例

在以下情况下，沙箱是正确的选择：* **创建、修改和运行代码的编码代理**需要一个可视化界面
  超越聊天
* **代码审查工作流程**，其中代理建议更改并由用户提出建议
  在接受之前审查差异
* **教程或学习应用程序**，人工智能助手可帮助用户构建
  项目逐步进行，显示上下文的变化
* **原型设计工具**，用户可以用自然语言描述功能并
  观看代理实时实施它们

## 最佳实践

前端特定：

* **将 `threadId` 保留在 `sessionStorage`** 中，以便页面重新加载并重新连接到
  相同的线程和沙箱，而不是创建新的。

* **在每个相关工具调用时同步文件**，而不仅仅是在运行完成时同步。留意 `write_file`、`edit_file`、`delete` 和 `execute`
  工具消息并立即刷新。

* **默认为已更改文件的差异视图**。当用户单击一个文件时
  被代理修改了，首先显示差异 - 这就是他们关心的。

* **显示只读操作的紧凑工具结果**。而不是倾销
  `read_file`在聊天中的完整输出，显示一行字
  `Read router.js L1-42`。为变异工具保留完整的输出显示。* **从文件树中过滤`node_modules`**。没有人愿意浏览
  数千个依赖文件。获取树时将它们过滤掉。

对于后端和沙箱：

* **对生产应用程序使用线程范围的沙箱**。参见
  [Sandbox lifecycle](/oss/python/deepagents/going-to-production#lifecycle)。
* **通过代理后端和 API 服务器之间共享沙箱解析**
  线程元数据，因此两者都解析相同的环境，没有内存缓存。
* **用真实的项目为沙箱播种**。参见
  [File transfers](/oss/python/deepagents/going-to-production#file-transfers)。
* **将秘密保密在沙箱之外**。使用
  [sandbox auth proxy](/oss/python/deepagents/going-to-production#managing-secrets)
  而不是 API 密钥的环境变量或文件上传。
* **发射前添加护栏**。配置
  [rate limits](/oss/python/deepagents/fault-tolerance#rate-limiting),
  [error handling](/oss/python/deepagents/fault-tolerance#error-handling)，以及
  [data privacy](/oss/python/deepagents/going-to-production#data-privacy)中间件
  用于自主编码代理。

## 相关

<CardGroup>
  <Card title="Going to production" icon="rocket" href="/oss/python/deepagents/going-to-production">
    使用持久沙箱、身份验证、护栏和生产 `useStream` 设置来部署代理。
  </Card>

  <Card title="Sandboxes" icon="box" href="/oss/python/deepagents/sandboxes">
    沙箱提供程序、安全模型和文件传输 API。
  </Card>

  <Card title="Frontend overview" icon="layout" href="/oss/python/deepagents/frontend/overview">
    其他深层代理 UI 模式：子代理流、待办事项列表和自定义状态。
  </Card>

  <Card title="Application structure" icon="file-code" href="/oss/python/langgraph/application-structure">
    完整的 `langgraph.json` 参考，包括自定义 `http.app` 路线。
  </Card>
</CardGroup>

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/frontend/sandbox.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>