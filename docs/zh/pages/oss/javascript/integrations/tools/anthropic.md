<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Anthropic integration | https://docs.langchain.com/oss/javascript/integrations/tools/anthropic -->

# 人择整合

使用 LangChain JavaScript 与 Anthropic 工具集成。

`@langchain/anthropic`包为Anthropic的内置工具提供了与LangChain兼容的包装器。这些工具可以使用`bindTools()`或[⟦T22⟧](https://reference.langchain.com/javascript/langchain/index/createAgent)绑定到`ChatAnthropic`。

### 记忆工具

记忆工具（`memory_20250818`）使克劳德能够通过记忆文件目录存储和检索跨对话的信息。 Claude 可以创建、读取、更新和删除会话之间持续存在的文件，从而允许它随着时间的推移构建知识，而无需将所有内容保留在上下文窗口中。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic, tools } from "@langchain/anthropic";

// Create a simple in-memory file store (or use your own persistence layer)
const files = new Map<string, string>();

const memory = tools.memory_20250818({
  execute: async (command) => {
    switch (command.command) {
      case "view":
        if (!command.path || command.path === "/") {
          return Array.from(files.keys()).join("\n") || "Directory is empty.";
        }
        return (
          files.get(command.path) ?? `Error: File not found: ${command.path}`
        );
      case "create":
        files.set(command.path!, command.file_text ?? "");
        return `Successfully created file: ${command.path}`;
      case "str_replace":
        const content = files.get(command.path!);
        if (content && command.old_str) {
          files.set(
            command.path!,
            content.replace(command.old_str, command.new_str ?? "")
          );
        }
        return `Successfully replaced text in: ${command.path}`;
      case "delete":
        files.delete(command.path!);
        return `Successfully deleted: ${command.path}`;
      // Handle other commands: insert, rename
      default:
        return `Unknown command`;
    }
  },
});

const llm = new ChatAnthropic({
  model: "claude-sonnet-4-6",
});

const llmWithMemory = llm.bindTools([memory]);

const response = await llmWithMemory.invoke(
  "Remember that my favorite programming language is TypeScript"
);
```

欲了解更多信息，请参阅[Anthropic's Memory Tool documentation](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/memory-tool)。

### 网络搜索工具

网络搜索工具（`webSearch_20250305`）使克劳德能够直接访问实时网络内容，使其能够用超出其知识范围的最新信息来回答问题。克劳德自动引用搜索结果中的来源作为其答案的一部分。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic, tools } from "@langchain/anthropic";

const llm = new ChatAnthropic({
  model: "claude-sonnet-4-6",
});

// Basic usage
const response = await llm.invoke("What is the weather in NYC?", {
  tools: [tools.webSearch_20250305()],
});
```

Web 搜索工具支持多种配置选项：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await llm.invoke("Latest news about AI?", {
  tools: [
    tools.webSearch_20250305({
      // Maximum number of times the tool can be used in the API request
      maxUses: 5,
      // Only include results from these domains
      allowedDomains: ["reuters.com", "bbc.com"],
      // Or block specific domains (cannot be used with allowedDomains)
      // blockedDomains: ["example.com"],
      // Provide user location for more relevant results
      userLocation: {
        type: "approximate",
        city: "San Francisco",
        region: "California",
        country: "US",
        timezone: "America/Los_Angeles",
      },
    }),
  ],
});
```

欲了解更多信息，请参阅[Anthropic's Web Search Tool documentation](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/web-search-tool)。

### 网页获取工具Web fetch 工具 (`webFetch_20250910`) 允许 Claude 从指定网页和 PDF 文档中检索完整内容。 Claude 只能获取用户明确提供的 URL 或来自之前的 Web 搜索或 Web 获取结果的 URL。

> **⚠️ 安全警告：** 在 Claude 处理不受信任的输入和敏感数据的环境中启用 Web 获取工具会带来数据泄露风险。我们建议仅在受信任的环境中或处理非敏感数据时使用此工具。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic, tools } from "@langchain/anthropic";

const llm = new ChatAnthropic({
  model: "claude-sonnet-4-6",
});

// Basic usage - fetch content from a URL
const response = await llm.invoke(
  "Please analyze the content at https://example.com/article",
  { tools: [tools.webFetch_20250910()] }
);
```

Web fetch 工具支持多种配置选项：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await llm.invoke(
  "Summarize this research paper: https://arxiv.org/abs/2024.12345",
  {
    tools: [
      tools.webFetch_20250910({
        // Maximum number of times the tool can be used in the API request
        maxUses: 5,
        // Only fetch from these domains
        allowedDomains: ["arxiv.org", "example.com"],
        // Or block specific domains (cannot be used with allowedDomains)
        // blockedDomains: ["example.com"],
        // Enable citations for fetched content (optional, unlike web search)
        citations: { enabled: true },
        // Maximum content length in tokens (helps control token usage)
        maxContentTokens: 50000,
      }),
    ],
  }
);
```

您可以将网络获取与网络搜索结合起来以收集全面的信息：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tools } from "@langchain/anthropic";

const response = await llm.invoke(
  "Find recent articles about quantum computing and analyze the most relevant one",
  {
    tools: [
      tools.webSearch_20250305({ maxUses: 3 }),
      tools.webFetch_20250910({ maxUses: 5, citations: { enabled: true } }),
    ],
  }
);
```

有关更多信息，请参阅[Anthropic's Web Fetch Tool documentation](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/web-fetch-tool)。

### 工具搜索工具

工具搜索工具使 Claude 能够通过动态发现和按需加载数百或数千种工具来工作。当您有大量工具但不想将它们一次全部加载到上下文窗口中时，这非常有用。

有两种变体：

* **`toolSearchRegex_20251119`** - Claude 构造正则表达式模式（使用 Python 的 `re.search()` 语法）来搜索工具
* **`toolSearchBM25_20251119`** - Claude 使用自然语言查询来搜索使用 BM25 算法的工具```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic, tools } from "@langchain/anthropic";
import { tool } from "langchain";
import { z } from "zod";

const llm = new ChatAnthropic({
  model: "claude-sonnet-4-6",
});

// Create tools with defer_loading to make them discoverable via search
const getWeather = tool(
  async (input: { location: string }) => {
    return `Weather in ${input.location}: Sunny, 72°F`;
  },
  {
    name: "get_weather",
    description: "Get the weather at a specific location",
    schema: z.object({
      location: z.string(),
    }),
    extras: { defer_loading: true },
  }
);

const getNews = tool(
  async (input: { topic: string }) => {
    return `Latest news about ${input.topic}...`;
  },
  {
    name: "get_news",
    description: "Get the latest news about a topic",
    schema: z.object({
      topic: z.string(),
    }),
    extras: { defer_loading: true },
  }
);

// Claude will search and discover tools as needed
const response = await llm.invoke("What is the weather in San Francisco?", {
  tools: [tools.toolSearchRegex_20251119(), getWeather, getNews],
});
```

使用 BM25 变体进行自然语言搜索：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tools } from "@langchain/anthropic";

const response = await llm.invoke("What is the weather in San Francisco?", {
  tools: [tools.toolSearchBM25_20251119(), getWeather, getNews],
});
```

欲了解更多信息，请参阅[Anthropic's Tool Search documentation](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/tool-search-tool)。

### 文本编辑器工具

文本编辑器工具 (`textEditor_20250728`) 使 Claude 能够查看和修改文本文件，帮助调试、修复和改进代码或其他文本文档。 Claude 可以直接与文件交互，提供实际帮助，而不仅仅是建议更改。

可用命令：

* `view` - 检查文件内容或列出目录内容
* `str_replace` - 替换文件中的特定文本
* `create` - 创建一个指定内容的新文件
* `insert` - 在特定行号插入文本

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import fs from "node:fs";
import { ChatAnthropic, tools } from "@langchain/anthropic";

const llm = new ChatAnthropic({
  model: "claude-sonnet-4-6",
});

const textEditor = tools.textEditor_20250728({
  async execute(args) {
    switch (args.command) {
      case "view":
        const content = fs.readFileSync(args.path, "utf-8");
        // Return with line numbers for Claude to reference
        return content
          .split("\n")
          .map((line, i) => `${i + 1}: ${line}`)
          .join("\n");
      case "str_replace":
        let fileContent = fs.readFileSync(args.path, "utf-8");
        fileContent = fileContent.replace(args.old_str, args.new_str);
        fs.writeFileSync(args.path, fileContent);
        return "Successfully replaced text.";
      case "create":
        fs.writeFileSync(args.path, args.file_text);
        return `Successfully created file: ${args.path}`;
      case "insert":
        const lines = fs.readFileSync(args.path, "utf-8").split("\n");
        lines.splice(args.insert_line, 0, args.new_str);
        fs.writeFileSync(args.path, lines.join("\n"));
        return `Successfully inserted text at line ${args.insert_line}`;
      default:
        return "Unknown command";
    }
  },
  // Optional: limit file content length when viewing
  maxCharacters: 10000,
});

const llmWithEditor = llm.bindTools([textEditor]);

const response = await llmWithEditor.invoke(
  "There's a syntax error in my primes.py file. Can you help me fix it?"
);
```

有关更多信息，请参阅[Anthropic's Text Editor Tool documentation](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/text-editor-tool)。

### 电脑使用工具

计算机使用工具使克劳德能够通过屏幕截图、鼠标控制和键盘输入与桌面环境进行交互，以实现自主桌面交互。

> **⚠️ 安全警告：** 计算机使用是具有独特风险的测试版功能。使用具有最小权限的专用虚拟机或容器。避免授予敏感数据的访问权限。

有两种变体：

* **`computer_20251124`** - 适用于 Claude Opus 4.5（包括缩放功能）
* **`computer_20250124`** - 适用于 Claude 4 和 Claude 3.7 型号

可用的操作：* `screenshot` - 捕获当前屏幕
* `left_click`、`right_click`、`middle_click` - 鼠标在坐标处单击
* `double_click`、`triple_click` - 多次单击操作
* `left_click_drag` - 单击并拖动操作
* `left_mouse_down`、`left_mouse_up` - 粒度鼠标控制
* `scroll` - 滚动屏幕
* `type` - 输入文本
* `key` - 按键盘按键/快捷键
* `mouse_move` - 移动光标
* `hold_key` - 执行其他操作时按住某个键
* `wait` - 等待指定的时间
* `zoom` - 以全分辨率查看特定屏幕区域（仅限 Claude Opus 4.5）

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic, tools } from "@langchain/anthropic";

const llm = new ChatAnthropic({
  model: "claude-sonnet-4-6",
});

const computer = tools.computer_20250124({
  // Required: specify display dimensions
  displayWidthPx: 1024,
  displayHeightPx: 768,
  // Optional: X11 display number
  displayNumber: 1,
  execute: async (action) => {
    switch (action.action) {
      case "screenshot":
      // Capture and return base64-encoded screenshot
      // ...
      case "left_click":
      // Click at the specified coordinates
      // ...
      // ...
    }
  },
});

const llmWithComputer = llm.bindTools([computer]);

const response = await llmWithComputer.invoke(
  "Save a picture of a cat to my desktop."
);
```

对于支持缩放的 Claude Opus 4.5：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tools } from "@langchain/anthropic";

const computer = tools.computer_20251124({
  displayWidthPx: 1920,
  displayHeightPx: 1080,
  // Enable zoom for detailed screen region inspection
  enableZoom: true,
  execute: async (action) => {
    // Handle actions including "zoom" for Claude Opus 4.5
    // ...
  },
});
```

欲了解更多信息，请参阅[Anthropic's Computer Use documentation](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/computer-use)。

### 代码执行工具

代码执行工具 (`codeExecution_20250825`) 允许 Claude 在安全的沙盒环境中运行 Bash 命令并操作文件。克劳德可以分析数据、创建可视化、执行计算和处理文件。

提供此工具后，Claude 将自动获得以下权限：

* **Bash 命令** - 执行系统操作的 shell 命令
* **文件操作** - 直接创建、查看和编辑文件

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic, tools } from "@langchain/anthropic";

const llm = new ChatAnthropic({
  model: "claude-sonnet-4-6",
});

// Basic usage - calculations and data analysis
const response = await llm.invoke(
  "Calculate the mean and standard deviation of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
  { tools: [tools.codeExecution_20250825()] }
);

// File operations and visualization
const response2 = await llm.invoke(
  "Create a matplotlib visualization of sales data and save it as chart.png",
  { tools: [tools.codeExecution_20250825()] }
);
```

多步骤工作流程的容器重用：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// First request - creates a container
const response1 = await llm.invoke("Write a random number to /tmp/number.txt", {
  tools: [tools.codeExecution_20250825()],
});

// Extract container ID from response for reuse
const containerId = response1.response_metadata?.container?.id;

// Second request - reuse container to access the file
const response2 = await llm.invoke(
  "Read /tmp/number.txt and calculate its square",
  {
    tools: [tools.codeExecution_20250825()],
    container: containerId,
  }
);
```

有关更多信息，请参阅[Anthropic's Code Execution Tool documentation](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/code-execution-tool)。

### bash 工具bash 工具 (`bash_20250124`) 允许在持久 bash 会话中执行 shell 命令。与沙盒代码执行工具不同，该工具需要您提供自己的执行环境。

> **⚠️ 安全警告：** bash 工具提供直接系统访问。实施安全措施，例如在隔离环境（Docker/VM）中运行、命令过滤和资源限制。

bash 工具提供：

* **持久 bash 会话** - 维护命令之间的状态
* **Shell 命令执行** - 运行任何 shell 命令
* **环境访问** - 访问环境变量和工作目录
* **命令链** - 支持管道、重定向和脚本

可用命令：

* 执行命令：`{ command: "ls -la" }`
* 重新启动会话：`{ restart: true }`

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic, tools } from "@langchain/anthropic";
import { execSync } from "child_process";

const llm = new ChatAnthropic({
  model: "claude-sonnet-4-6",
});

const bash = tools.bash_20250124({
  execute: async (args) => {
    if (args.restart) {
      // Reset session state
      return "Bash session restarted";
    }
    try {
      const output = execSync(args.command, {
        encoding: "utf-8",
        timeout: 30000,
      });
      return output;
    } catch (error) {
      return `Error: ${(error as Error).message}`;
    }
  },
});

const llmWithBash = llm.bindTools([bash]);

const response = await llmWithBash.invoke(
  "List all Python files in the current directory"
);

// Process tool calls and execute commands
console.log(response.tool_calls?.[0].name); // "bash"
console.log(response.tool_calls?.[0].args.command); // "ls -la *.py"
```

欲了解更多信息，请参阅[Anthropic's Bash Tool documentation](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/bash-tool)。

### MCP 工具集

MCP 工具集 (`mcpToolset_20251120`) 使 Claude 能够直接从消息 API 连接到远程 MCP（模型上下文协议）服务器，而无需实现单独的 MCP 客户端。这使得 Claude 可以使用 MCP 服务器提供的工具。

主要特点：* **直接 API 集成** - 连接到 MCP 服务器，无需实施 MCP 客户端
* **工具调用支持** - 通过消息 API 访问 MCP 工具
* **灵活的工具配置** - 启用所有工具、允许特定工具或拒绝不需要的工具
* **每个工具配置** - 使用自定义设置配置单个工具
* **OAuth 身份验证** - 支持经过身份验证的服务器的 OAuth 承载令牌
* **多个服务器** - 在单个请求中连接到多个 MCP 服务器

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic, tools } from "@langchain/anthropic";

const llm = new ChatAnthropic({
  model: "claude-sonnet-4-6",
});

// Basic usage - enable all tools from an MCP server
const response = await llm.invoke("What tools do you have available?", {
  mcp_servers: [
    {
      type: "url",
      url: "https://example-server.modelcontextprotocol.io/sse",
      name: "example-mcp",
      authorization_token: "YOUR_TOKEN",
    },
  ],
  tools: [tools.mcpToolset_20251120({ serverName: "example-mcp" })],
});
```

**允许列表模式** - 仅启用特定工具：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await llm.invoke("Search for events", {
  mcp_servers: [
    {
      type: "url",
      url: "https://calendar.example.com/sse",
      name: "google-calendar-mcp",
      authorization_token: "YOUR_TOKEN",
    },
  ],
  tools: [
    tools.mcpToolset_20251120({
      serverName: "google-calendar-mcp",
      // Disable all tools by default
      defaultConfig: { enabled: false },
      // Explicitly enable only these tools
      configs: {
        search_events: { enabled: true },
        create_event: { enabled: true },
      },
    }),
  ],
});
```

**拒绝列表模式** - 禁用特定工具：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await llm.invoke("List my events", {
  mcp_servers: [
    {
      type: "url",
      url: "https://calendar.example.com/sse",
      name: "google-calendar-mcp",
      authorization_token: "YOUR_TOKEN",
    },
  ],
  tools: [
    tools.mcpToolset_20251120({
      serverName: "google-calendar-mcp",
      // All tools enabled by default, just disable dangerous ones
      configs: {
        delete_all_events: { enabled: false },
        share_calendar_publicly: { enabled: false },
      },
    }),
  ],
});
```

**多个 MCP 服务器**：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await llm.invoke("Use tools from both servers", {
  mcp_servers: [
    {
      type: "url",
      url: "https://mcp.example1.com/sse",
      name: "mcp-server-1",
      authorization_token: "TOKEN1",
    },
    {
      type: "url",
      url: "https://mcp.example2.com/sse",
      name: "mcp-server-2",
      authorization_token: "TOKEN2",
    },
  ],
  tools: [
    tools.mcpToolset_20251120({ serverName: "mcp-server-1" }),
    tools.mcpToolset_20251120({
      serverName: "mcp-server-2",
      defaultConfig: { deferLoading: true },
    }),
  ],
});
```

**使用工具搜索** - 使用延迟加载进行按需工具发现：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await llm.invoke("Find and use the right tool", {
  mcp_servers: [
    {
      type: "url",
      url: "https://example.com/sse",
      name: "example-mcp",
    },
  ],
  tools: [
    tools.toolSearchRegex_20251119(),
    tools.mcpToolset_20251120({
      serverName: "example-mcp",
      defaultConfig: { deferLoading: true },
    }),
  ],
});
```

有关更多信息，请参阅[Anthropic's MCP Connector documentation](https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/tools/anthropic.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>