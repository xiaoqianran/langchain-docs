<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agent Client Protocol (ACP) | https://docs.langchain.com/oss/javascript/deepagents/acp -->

# 代理客户端协议 (ACP)

通过代理客户端协议 (ACP) 公开深度代理，以与代码编辑器和 IDE 集成。

[Agent Client Protocol (ACP)](https://agentclientprotocol.com/get-started/introduction) 标准化编码代理和代码编辑器或 IDE 之间的通信。
通过 ACP 协议，您可以将自定义深度代理与任何 ACP 兼容的客户端结合使用，从而允许您的代码编辑器提供项目上下文并接收丰富的更新。

<Note>
  ACP 专为代理编辑器集成而设计。如果您希望代理调用外部服务器托管的工具，请参阅[Model Context Protocol (MCP)](/oss/javascript/langchain/mcp/)。
</Note>

## 快速入门

安装ACP集成包：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install deepagents-acp
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add deepagents-acp
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add deepagents-acp
  ```
</CodeGroup>

然后通过 ACP 暴露深层代理。

这会在 stdio 模式下启动 ACP 服务器（它从 stdin 读取请求并将响应写入 stdout）。在实践中，您通常将其作为 ACP 客户端（例如您的编辑器）启动的命令运行，然后通过 stdio 与服务器进行通信。

```ts icon="server" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { startServer } from "deepagents-acp";

await startServer({
  agents: {
    name: "coding-assistant",
    description: "AI coding assistant with filesystem access",
  },
  workspaceRoot: process.cwd(),
});
```

您还可以使用 CLI，而无需编写任何代码：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx deepagents-acp
```

<Card title="Deep Agents ACP on npm" icon="brand-npm" href="https://www.npmjs.com/package/deepagents-acp">
  `deepagents-acp` 包提供 CLI 和编程 API，用于通过 ACP 公开深度代理。
</Card>

## 客户深度代理可以在任何可以运行 ACP 代理服务器的地方工作。一些著名的 ACP 客户包括：

* [Zed](https://zed.dev/docs/ai/external-agents)
* [JetBrains IDEs](https://www.jetbrains.com/help/ai-assistant/acp.html)
* Visual Studio Code（通过[vscode-acp](https://github.com/formulahendry/vscode-acp)）
* Neovim（通过 ACP 兼容插件）

### 泽德

通过将深度代理添加到 Zed 设置中，向 [Zed](https://zed.dev/docs/ai/external-agents) 注册您的深度代理（Linux 上为 `~/.config/zed/settings.json`，macOS 上为 `~/Library/Application Support/Zed/settings.json`）：

**设置简单（无需代码）：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "agent": {
    "profiles": {
      "deepagents": {
        "name": "DeepAgents",
        "command": "npx",
        "args": ["deepagents-acp"],
        "env": {
          "ANTHROPIC_API_KEY": "sk-ant-..."
        }
      }
    }
  }
}
```

**使用 CLI 选项：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "agent": {
    "profiles": {
      "deepagents": {
        "name": "DeepAgents",
        "command": "npx",
        "args": [
          "deepagents-acp",
          "--name", "my-assistant",
          "--skills", "./skills",
          "--debug"
        ],
        "env": {
          "ANTHROPIC_API_KEY": "sk-ant-..."
        }
      }
    }
  }
}
```

**自定义服务器脚本：**

为了获得更多控制，请创建一个 TypeScript 服务器脚本：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// server.ts
import { startServer } from "deepagents-acp";

await startServer({
  agents: {
    name: "my-agent",
    description: "My custom coding agent",
    skills: ["./skills/"],
  },
});
```

然后将 Zed 指向它：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "agent": {
    "profiles": {
      "my-agent": {
        "name": "My Agent",
        "command": "npx",
        "args": ["tsx", "./server.ts"]
      }
    }
  }
}
```

打开 Zed 的 Agents 面板并启动 Deep Agents 线程。

### ACP 注册表

Deep Agents 在 [ACP Agent Registry](https://agentclientprotocol.com/registry/index) 中提供，可在 Zed 和 JetBrains IDE 中一键安装。当 ACP 客户端支持注册表时，用户无需任何手动配置即可发现并安装 Deep Agent。

## CLI 参考

CLI 是启动 ACP 服务器的最快方法。它不需要任何代码 - 只需运行 `npx deepagents-acp` 并连接您的编辑器。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx deepagents-acp [options]
```|选项|短|描述 |
| ---------------------- | -----| --------------------------------------------------- |
| `--name <name>` | `-n` |代理名称（默认：`"deepagents"`）|
| `--description <desc>` | `-d` |代理说明 |
| `--model <model>` | `-m` | LLM模型（默认：`"claude-sonnet-4-5-20250929"`）|
| `--workspace <path>` | `-w` |工作区根目录（默认：cwd）|
| `--skills <paths>` | `-s` |以逗号分隔的技能路径 |
| `--memory <paths>` |       |逗号分隔的 AGENTS.md 路径 |
| `--debug` |       |启用调试日志记录到 stderr |
| `--help` | `-h` |显示帮助消息 |
| `--version` | `-v` |显示版本 |

### 环境变量|变量|描述 |
| ------------------- | ---------------------------------------------------------- |
| `ANTHROPIC_API_KEY` | Anthropic/Claude 模型的 API 密钥（必需）|
| `OPENAI_API_KEY` | OpenAI 模型的 API 密钥 |
| `DEBUG` |设置为 `"true"` 以启用调试日志记录 |
| `WORKSPACE_ROOT` | `--workspace` 标志的替代品 |

## 编程 API

### `startServer`

在一次调用中创建和启动服务器的便捷函数：

```ts icon="server" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { startServer } from "deepagents-acp";

await startServer({
  agents: {
    name: "coding-assistant",
    description: "AI coding assistant with filesystem access",
  },
  workspaceRoot: process.cwd(),
});
```

### `DeepAgentsServer`

要完全控制，请直接使用 `DeepAgentsServer` 类：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { DeepAgentsServer } from "deepagents-acp";

  const server = new DeepAgentsServer({
    agents: [
      {
        name: "code-agent",
        description: "Full-featured coding assistant",
        model: "google-genai:gemini-3.6-flash",
        skills: ["./skills/"],
        memory: ["./.deepagents/AGENTS.md"],
      },
      {
        name: "reviewer",
        description: "Code review specialist",
        systemPrompt: "You are a code review expert...",
      },
    ],
    serverName: "my-deepagents-acp",
    serverVersion: "1.0.0",
    workspaceRoot: process.cwd(),
    debug: true,
  });

  await server.start();
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { DeepAgentsServer } from "deepagents-acp";

  const server = new DeepAgentsServer({
    agents: [
      {
        name: "code-agent",
        description: "Full-featured coding assistant",
        model: "openai:gpt-5.5",
        skills: ["./skills/"],
        memory: ["./.deepagents/AGENTS.md"],
      },
      {
        name: "reviewer",
        description: "Code review specialist",
        systemPrompt: "You are a code review expert...",
      },
    ],
    serverName: "my-deepagents-acp",
    serverVersion: "1.0.0",
    workspaceRoot: process.cwd(),
    debug: true,
  });

  await server.start();
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { DeepAgentsServer } from "deepagents-acp";

  const server = new DeepAgentsServer({
    agents: [
      {
        name: "code-agent",
        description: "Full-featured coding assistant",
        model: "anthropic:claude-sonnet-4-6",
        skills: ["./skills/"],
        memory: ["./.deepagents/AGENTS.md"],
      },
      {
        name: "reviewer",
        description: "Code review specialist",
        systemPrompt: "You are a code review expert...",
      },
    ],
    serverName: "my-deepagents-acp",
    serverVersion: "1.0.0",
    workspaceRoot: process.cwd(),
    debug: true,
  });

  await server.start();
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { DeepAgentsServer } from "deepagents-acp";

  const server = new DeepAgentsServer({
    agents: [
      {
        name: "code-agent",
        description: "Full-featured coding assistant",
        model: "openrouter:openrouter:z-ai/glm-5.2",
        skills: ["./skills/"],
        memory: ["./.deepagents/AGENTS.md"],
      },
      {
        name: "reviewer",
        description: "Code review specialist",
        systemPrompt: "You are a code review expert...",
      },
    ],
    serverName: "my-deepagents-acp",
    serverVersion: "1.0.0",
    workspaceRoot: process.cwd(),
    debug: true,
  });

  await server.start();
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { DeepAgentsServer } from "deepagents-acp";

  const server = new DeepAgentsServer({
    agents: [
      {
        name: "code-agent",
        description: "Full-featured coding assistant",
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        skills: ["./skills/"],
        memory: ["./.deepagents/AGENTS.md"],
      },
      {
        name: "reviewer",
        description: "Code review specialist",
        systemPrompt: "You are a code review expert...",
      },
    ],
    serverName: "my-deepagents-acp",
    serverVersion: "1.0.0",
    workspaceRoot: process.cwd(),
    debug: true,
  });

  await server.start();
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { DeepAgentsServer } from "deepagents-acp";

  const server = new DeepAgentsServer({
    agents: [
      {
        name: "code-agent",
        description: "Full-featured coding assistant",
        model: "baseten:zai-org/GLM-5.2",
        skills: ["./skills/"],
        memory: ["./.deepagents/AGENTS.md"],
      },
      {
        name: "reviewer",
        description: "Code review specialist",
        systemPrompt: "You are a code review expert...",
      },
    ],
    serverName: "my-deepagents-acp",
    serverVersion: "1.0.0",
    workspaceRoot: process.cwd(),
    debug: true,
  });

  await server.start();
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { DeepAgentsServer } from "deepagents-acp";

  const server = new DeepAgentsServer({
    agents: [
      {
        name: "code-agent",
        description: "Full-featured coding assistant",
        model: "ollama:north-mini-code-1.0",
        skills: ["./skills/"],
        memory: ["./.deepagents/AGENTS.md"],
      },
      {
        name: "reviewer",
        description: "Code review specialist",
        systemPrompt: "You are a code review expert...",
      },
    ],
    serverName: "my-deepagents-acp",
    serverVersion: "1.0.0",
    workspaceRoot: process.cwd(),
    debug: true,
  });

  await server.start();
  ```
</CodeGroup>

#### 服务器选项|选项 |类型 |默认|描述 |
| ---------------- | -------------------------------------- | ------------------ | ------------------------ |
| `agents` | `DeepAgentConfig \| DeepAgentConfig[]` |必填|代理配置 |
| `serverName` | `string` | `"deepagents-acp"` | ACP | 的服务器名称
| `serverVersion` | `string` | `"0.0.1"` |服务器版 |
| `workspaceRoot` | `string` | `process.cwd()` |工作区根目录 |
| `debug` | `boolean` | `false` |启用调试日志记录 |

#### 代理配置|选项 |类型 |描述 |
| -------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `name` | `string` |唯一的代理名称（必填）|
| `description` | `string` |代理说明 |
| `model` | `string` | LLM模型（默认：`"claude-sonnet-4-5-20250929"`）|
| `tools` | `StructuredTool[]` |定制LangChain工具|| `systemPrompt` | `string` |自定义系统提示|
| `middleware` | `AgentMiddleware[]` |自定义中间件附加到 [Deep Agents stack](/oss/javascript/deepagents/customization#deep-agents-stack) |
| `backend` | `AnyBackendProtocol` |文件系统后端 |
| `skills` | `string[]` |技能来源路径|
| `memory` | `string[]` |内存源路径(AGENTS.md) |
| `interruptOn` | `Record<string, boolean \| InterruptOnConfig>` |需要用户批准的工具 (HITL) |
| `commands` | `Array<{ name, description, input? }>` |自定义斜杠命令|

## 定制

### 多个代理您可以从单个服务器公开多个代理。 ACP 客户端在创建会话时选择要使用的代理：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { DeepAgentsServer } from "deepagents-acp";

const server = new DeepAgentsServer({
  agents: [
    { name: "code-agent", description: "General coding" },
    { name: "reviewer", description: "Code reviews" },
  ],
});
```

<Note>
  某些 ACP 客户端（例如 Zed）当前不公开用于在代理之间进行选择的 UI。在这种情况下，请考虑运行单独的服务器实例，每个实例使用一个代理。
</Note>

### 斜线命令

服务器向 IDE 注册内置斜线命令：`/plan`、`/agent`、`/ask`、`/clear` 和 `/status`。您还可以为每个代理定义自定义命令：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { DeepAgentsServer } from "deepagents-acp";

const server = new DeepAgentsServer({
  agents: {
    name: "my-agent",
    commands: [
      { name: "test", description: "Run the project's test suite" },
      { name: "lint", description: "Run linter and fix issues" },
      {
        name: "deploy",
        description: "Deploy to staging",
        input: { hint: "environment (staging or production)" },
      },
    ],
  },
});
```

### 人机交互

在代理运行敏感工具之前，使用 `interruptOn` 要求 IDE 中的用户批准：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { DeepAgentsServer } from "deepagents-acp";

const server = new DeepAgentsServer({
  agents: {
    name: "careful-agent",
    interruptOn: {
      execute: { allowedDecisions: ["approve", "edit", "reject"] },
      write_file: true,
    },
  },
});
```

当代理调用受保护的工具时，IDE 会提示用户允许或拒绝该操作，并提供记住会话决定的选项。

### 自定义工具

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { DeepAgentsServer } from "deepagents-acp";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const searchTool = tool(
  async ({ query }) => {
    return `Results for: ${query}`;
  },
  {
    name: "search",
    description: "Search the codebase",
    schema: z.object({ query: z.string() }),
  },
);

const server = new DeepAgentsServer({
  agents: {
    name: "search-agent",
    tools: [searchTool],
  },
});


await server.start();
```

### 自定义后端

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { DeepAgentsServer } from "deepagents-acp";
import { CompositeBackend, FilesystemBackend, StateBackend } from "deepagents";

const server = new DeepAgentsServer({
  agents: {
    name: "custom-agent",
    backend: new CompositeBackend(new StateBackend(), {
      "/workspace/": new FilesystemBackend({ rootDir: "./workspace" }),
    }),
  },
});
```

### 技能和记忆

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { startServer } from "deepagents-acp";

await startServer({
  agents: {
    name: "project-agent",
    description: "Agent with project-specific knowledge",
    skills: ["./skills/", "~/.deepagents/skills/"],
    memory: ["./.deepagents/AGENTS.md"],
  },
  workspaceRoot: process.cwd(),
});
```

<Info>
  有关协议详细信息和编辑器支持，请参阅上游 ACP 文档：

  * 简介：[https://agentclientprotocol.com/get-started/introduction](https://agentclientprotocol.com/get-started/introduction)
  * 客户/编辑：[https://agentclientprotocol.com/get-started/clients](https://agentclientprotocol.com/get-started/clients)
</Info>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/acp.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>