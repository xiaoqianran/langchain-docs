<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: OpenAI integration | https://docs.langchain.com/oss/javascript/integrations/tools/openai -->

# OpenAI 集成

使用 LangChain JavaScript 与 OpenAI 工具集成。

`@langchain/openai`包为OpenAI的内置工具提供了LangChain兼容的包装器。这些工具可以使用`bindTools()`或[⟦T26⟧](https://reference.langchain.com/javascript/langchain/index/createAgent)绑定到`ChatOpenAI`。

### 网络搜索工具

网络搜索工具允许 OpenAI 模型在生成响应之前在网络上搜索最新信息。网络搜索支持三种主要类型：

1. **非推理网络搜索**：模型将查询直接传递到搜索工具的快速查找
2. **带有推理模型的代理搜索**：模型主动管理搜索过程，分析结果并决定是否继续搜索
3. **深入研究**：使用`o3-deep-research`或`gpt-5`等模型进行扩展调查，并进行大量推理

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI, tools } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "gpt-5.5",
});

// Basic usage
const response = await model.invoke(
  "What was a positive news story from today?",
  {
    tools: [tools.webSearch()],
  }
);
```

**域过滤** - 将搜索结果限制为特定域（最多 100 个）：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Latest AI research news", {
  tools: [
    tools.webSearch({
      filters: {
        allowedDomains: ["arxiv.org", "nature.com", "science.org"],
      },
    }),
  ],
});
```

**用户位置** - 根据地理位置优化搜索结果：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("What are the best restaurants near me?", {
  tools: [
    tools.webSearch({
      userLocation: {
        type: "approximate",
        country: "US",
        city: "San Francisco",
        region: "California",
        timezone: "America/Los_Angeles",
      },
    }),
  ],
});
```

**仅缓存模式** - 禁用实时互联网访问：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Find information about OpenAI", {
  tools: [
    tools.webSearch({
      externalWebAccess: false,
    }),
  ],
});
```

欲了解更多信息，请参阅[OpenAI's Web Search Documentation](https://platform.openai.com/docs/guides/tools-web-search)。

### MCP工具（模型上下文协议）MCP 工具允许 OpenAI 模型连接到远程 MCP 服务器和 OpenAI 维护的服务连接器，从而使模型能够访问外部工具和服务。

MCP 工具有两种使用方法：

1. **远程 MCP 服务器**：通过 URL 连接到任何公共 MCP 服务器
2. **连接器**：将 OpenAI 维护的包装器用于 Google Workspace 或 Dropbox 等流行服务

**远程 MCP 服务器** - 连接到任何 MCP 兼容服务器：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI, tools } from "@langchain/openai";

const model = new ChatOpenAI({ model: "gpt-5.5" });

const response = await model.invoke("Roll 2d4+1", {
  tools: [
    tools.mcp({
      serverLabel: "dmcp",
      serverDescription: "A D&D MCP server for dice rolling",
      serverUrl: "https://dmcp-server.deno.dev/sse",
      requireApproval: "never",
    }),
  ],
});
```

**服务连接器** - 使用 OpenAI 维护的连接器来实现流行服务：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("What's on my calendar today?", {
  tools: [
    tools.mcp({
      serverLabel: "google_calendar",
      connectorId: "connector_googlecalendar",
      authorization: "<oauth-access-token>",
      requireApproval: "never",
    }),
  ],
});
```

欲了解更多信息，请参阅[OpenAI's MCP Documentation](https://platform.openai.com/docs/guides/tools-remote-mcp)。

### 代码解释工具

代码解释器工具允许模型在沙盒环境中编写和运行Python代码以解决复杂问题。

使用代码解释器：

* **数据分析**：处理具有不同数据和格式的文件
* **文件生成**：使用数据和图形图像创建文件
* **迭代编码**：迭代地编写和运行代码来解决问题
* **视觉智能**：裁剪、缩放、旋转和变换图像

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI, tools } from "@langchain/openai";

const model = new ChatOpenAI({ model: "gpt-5.5" });

// Basic usage with auto container (default 1GB memory)
const response = await model.invoke("Solve the equation 3x + 11 = 14", {
  tools: [tools.codeInterpreter()],
});
```

**内存配置** - 选择 1GB（默认）、4GB、16GB 或 64GB：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke(
  "Analyze this large dataset and create visualizations",
  {
    tools: [
      tools.codeInterpreter({
        container: { memoryLimit: "4g" },
      }),
    ],
  }
);
```

**使用文件** - 使上传的文件可供代码使用：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Process the uploaded CSV file", {
  tools: [
    tools.codeInterpreter({
      container: {
        memoryLimit: "4g",
        fileIds: ["file-abc123", "file-def456"],
      },
    }),
  ],
});
```**显式容器** - 使用预先创建的容器 ID：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Continue working with the data", {
  tools: [
    tools.codeInterpreter({
      container: "cntr_abc123",
    }),
  ],
});
```

> **注意**：容器在 20 分钟不活动后过期。虽然称为“代码解释器”，但该模型将其称为“python 工具” - 对于显式提示，请在提示中询问“python 工具”。

有关更多信息，请参阅[OpenAI's Code Interpreter Documentation](https://platform.openai.com/docs/guides/tools-code-interpreter)。

### 文件搜索工具

文件搜索工具允许模型使用语义和关键字搜索来搜索文件中的相关信息。它可以从知识库中检索存储在矢量存储中的先前上传的文件。

**先决条件**：在使用文件搜索之前，您必须：

1.使用`purpose: "assistants"`将文件上传到File API
2. 创建矢量存储
3. 将文件添加到矢量存储

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI, tools } from "@langchain/openai";

const model = new ChatOpenAI({ model: "gpt-5.5" });

const response = await model.invoke("What is deep research by OpenAI?", {
  tools: [
    tools.fileSearch({
      vectorStoreIds: ["vs_abc123"],
      // maxNumResults: 5, // Limit results for lower latency
      // filters: { type: "eq", key: "category", value: "blog" }, // Metadata filtering
      // filters: { type: "and", filters: [                       // Compound filters (AND/OR)
      //   { type: "eq", key: "category", value: "technical" },
      //   { type: "gte", key: "year", value: 2024 },
      // ]},
      // rankingOptions: { scoreThreshold: 0.8, ranker: "auto" }, // Customize scoring
    }),
  ],
});
```

过滤运算符：`eq`（等于）、`ne`（不等于）、`gt`（大于）、`gte`（大于或等于）、`lt`（小于）、`lte`（小于或等于）。

欲了解更多信息，请参阅[OpenAI's File Search Documentation](https://platform.openai.com/docs/guides/tools-file-search)。

### 图像生成工具

图像生成工具允许模型使用文本提示和可选图像输入生成或编辑图像。它利用 GPT 图像模型并自动优化文本输入以提高性能。

使用图像生成用于：* **从文本创建图像**：从详细的文本描述生成图像
* **编辑现有图像**：根据文字说明修改图像
* **多轮图像编辑**：跨对话轮次迭代地细化图像
* **多种输出格式**：支持PNG、JPEG和WebP格式

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI, tools } from "@langchain/openai";

const model = new ChatOpenAI({ model: "gpt-5.5" });

// Basic usage - generate an image
const response = await model.invoke(
  "Generate an image of a gray tabby cat hugging an otter with an orange scarf",
  { tools: [tools.imageGeneration()] }
);

// Access the generated image (base64-encoded)
const imageOutput = response.additional_kwargs.tool_outputs?.find(
  (output) => output.type === "image_generation_call"
);
if (imageOutput?.result) {
  const fs = await import("fs");
  fs.writeFileSync("output.png", Buffer.from(imageOutput.result, "base64"));
}
```

**自定义尺寸和质量** - 配置输出尺寸和质量：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Draw a beautiful sunset over mountains", {
  tools: [
    tools.imageGeneration({
      size: "1536x1024", // Landscape format (also: "1024x1024", "1024x1536", "auto")
      quality: "high", // Quality level (also: "low", "medium", "auto")
    }),
  ],
});
```

**输出格式和压缩** - 选择格式和压缩级别：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Create a product photo", {
  tools: [
    tools.imageGeneration({
      outputFormat: "jpeg", // Format (also: "png", "webp")
      outputCompression: 90, // Compression 0-100 (for JPEG/WebP)
    }),
  ],
});
```

**透明背景** - 生成具有透明度的图像：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke(
  "Create a logo with transparent background",
  {
    tools: [
      tools.imageGeneration({
        background: "transparent", // Background type (also: "opaque", "auto")
        outputFormat: "png",
      }),
    ],
  }
);
```

**使用部分图像进行流式传输** - 在生成过程中获取视觉反馈：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Draw a detailed fantasy castle", {
  tools: [
    tools.imageGeneration({
      partialImages: 2, // Number of partial images (0-3)
    }),
  ],
});
```

**强制图像生成** - 确保模型使用图像生成工具：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("A serene lake at dawn", {
  tools: [tools.imageGeneration()],
  tool_choice: { type: "image_generation" },
});
```

**多轮编辑** - 跨对话轮优化图像：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// First turn: generate initial image
const response1 = await model.invoke("Draw a red car", {
  tools: [tools.imageGeneration()],
});

// Second turn: edit the image
const response2 = await model.invoke(
  [response1, new HumanMessage("Now change the car color to blue")],
  { tools: [tools.imageGeneration()] }
);
```

> **提示提示**：使用“绘制”或“编辑”等术语以获得最佳效果。对于组合图像，请说“通过添加此元素编辑第一张图像”，而不是“组合”或“合并”。

支持型号：`gpt-4o`、`gpt-4o-mini`、`gpt-5.5`、`gpt-5.4-mini`、`gpt-5.4-nano`、`o3`

有关更多信息，请参阅[OpenAI's Image Generation Documentation](https://platform.openai.com/docs/guides/tools-image-generation)。

### 电脑使用工具计算机使用工具允许模型通过模拟鼠标点击、键盘输入、滚动等来控制计算机界面。它使用 OpenAI 的计算机使用代理 (CUA) 模型来理解屏幕截图并建议操作。

> **测试版**：计算机使用处于测试阶段。仅在沙盒环境中使用，请勿用于高风险或经过身份验证的任务。始终对重要决策实施人机参与。

**工作原理**：该工具连续循环运行：

1.模型发送计算机动作（点击、打字、滚动等）
2. 您的代码在受控环境中执行这些操作
3. 截取结果的屏幕截图
4. 将屏幕截图发送回模型
5. 重复直到任务完成

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI, tools } from "@langchain/openai";

const model = new ChatOpenAI({ model: "computer-use-preview" });

// With execute callback for automatic action handling
const computer = tools.computerUse({
  displayWidth: 1024,
  displayHeight: 768,
  environment: "browser",
  execute: async (action) => {
    if (action.type === "screenshot") {
      return captureScreenshot();
    }
    if (action.type === "click") {
      await page.mouse.click(action.x, action.y, { button: action.button });
      return captureScreenshot();
    }
    if (action.type === "type") {
      await page.keyboard.type(action.text);
      return captureScreenshot();
    }
    if (action.type === "scroll") {
      await page.mouse.move(action.x, action.y);
      await page.evaluate(
        `window.scrollBy(${action.scroll_x}, ${action.scroll_y})`
      );
      return captureScreenshot();
    }
    // Handle other actions...
    return captureScreenshot();
  },
});

const llmWithComputer = model.bindTools([computer]);
const response = await llmWithComputer.invoke(
  "Check the latest news on bing.com"
);
```

欲了解更多信息，请参阅[OpenAI's Computer Use Documentation](https://platform.openai.com/docs/guides/tools-computer-use)。

### 本地 shell 工具

本地 Shell 工具允许模型在您提供的计算机上本地运行 shell 命令。命令在您自己的运行时内执行 - API 仅返回指令。> **安全警告**：运行任意 shell 命令可能很危险。在将命令转发到系统 shell 之前，始终执行沙箱执行或添加严格的允许/拒绝列表。
> **注意**：此工具设计用于 [Codex CLI](https://github.com/openai/codex) 和 `codex-mini-latest` 型号。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI, tools } from "@langchain/openai";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const model = new ChatOpenAI({ model: "codex-mini-latest" });

// With execute callback for automatic command handling
const shell = tools.localShell({
  execute: async (action) => {
    const { command, env, working_directory, timeout_ms } = action;
    const result = await execAsync(command.join(" "), {
      cwd: working_directory ?? process.cwd(),
      env: { ...process.env, ...env },
      timeout: timeout_ms ?? undefined,
    });
    return result.stdout + result.stderr;
  },
});

const llmWithShell = model.bindTools([shell]);
const response = await llmWithShell.invoke(
  "List files in the current directory"
);
```

**操作属性**：模型返回具有以下属性的操作：

* `command` - 要执行的 argv 标记数组
* `env` - 要设置的环境变量
* `working_directory` - 运行命令的目录
* `timeout_ms` - 建议超时（强制执行您自己的限制）
* `user` - 可选用户运行命令

欲了解更多信息，请参阅[OpenAI's Local Shell Documentation](https://platform.openai.com/docs/guides/tools-local-shell)。

### 外壳工具

Shell 工具允许模型通过集成运行 shell 命令。与 Local Shell 不同，该工具支持同时执行多个命令，并且是为`gpt-5.1` 设计的。

> **安全警告**：运行任意 shell 命令可能很危险。在将命令转发到系统 shell 之前，始终执行沙箱执行或添加严格的允许/拒绝列表。

**用例**：* **自动化文件系统或进程诊断** – 例如，“在 \~/Documents 下查找最大的 PDF”
* **扩展模型功能** – 使用内置 UNIX 实用程序、Python 运行时和其他 CLI
* **运行多步骤构建和测试流程** – 链接命令，如 `pip install` 和 `pytest`
* **复杂的代理编码工作流程** – 与`apply_patch`一起使用进行文件操作

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI, tools } from "@langchain/openai";
import { exec } from "node:child_process/promises";

const model = new ChatOpenAI({ model: "gpt-5.1" });

// With execute callback for automatic command handling
const shellTool = tools.shell({
  execute: async (action) => {
    const outputs = await Promise.all(
      action.commands.map(async (cmd) => {
        try {
          const { stdout, stderr } = await exec(cmd, {
            timeout: action.timeout_ms ?? undefined,
          });
          return {
            stdout,
            stderr,
            outcome: { type: "exit" as const, exit_code: 0 },
          };
        } catch (error) {
          const timedOut = error.killed && error.signal === "SIGTERM";
          return {
            stdout: error.stdout ?? "",
            stderr: error.stderr ?? String(error),
            outcome: timedOut
              ? { type: "timeout" as const }
              : { type: "exit" as const, exit_code: error.code ?? 1 },
          };
        }
      })
    );
    return {
      output: outputs,
      maxOutputLength: action.max_output_length,
    };
  },
});

const llmWithShell = model.bindTools([shellTool]);
const response = await llmWithShell.invoke(
  "Find the largest PDF file in ~/Documents"
);
```

**操作属性**：模型返回具有以下属性的操作：

* `commands` - 要执行的 shell 命令数组（可以同时运行）
* `timeout_ms` - 可选超时（以毫秒为单位）（强制执行您自己的限制）
* `max_output_length` - 每个命令返回的可选最大字符数

**返回格式**：您的执行函数应返回`ShellResult`：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
interface ShellResult {
  output: Array<{
    stdout: string;
    stderr: string;
    outcome: { type: "exit"; exit_code: number } | { type: "timeout" };
  }>;
  maxOutputLength?: number | null; // Pass back from action if provided
}
```

> **注意**：仅可通过带有 `gpt-5.1` 的响应 API 获得。模型中的`timeout_ms`只是一个提示——始终强制执行你自己的限制。

欲了解更多信息，请参阅[OpenAI's Shell Documentation](https://platform.openai.com/docs/guides/tools-shell)。

### 应用补丁工具

应用补丁工具允许模型提出集成应用的结构化差异。这支持迭代、多步骤的代码编辑工作流程，其中模型可以在代码库中创建、更新和删除文件。

**何时使用**：* **多文件重构** – 重命名符号、提取帮助程序或重新组织模块
* **错误修复** – 让模型诊断问题并发出精确的补丁
* **测试和文档生成** – 创建新的测试文件、装置和文档
* **迁移和机械编辑** – 应用重复的结构化更新

> **安全警告**：应用补丁可以修改代码库中的文件。始终验证路径、实施备份并考虑沙箱。
> **注意**：该工具设计用于 `gpt-5.1` 型号。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI, tools } from "@langchain/openai";
import { applyDiff } from "@openai/agents";
import * as fs from "fs/promises";

const model = new ChatOpenAI({ model: "gpt-5.1" });

// With execute callback for automatic patch handling
const patchTool = tools.applyPatch({
  execute: async (operation) => {
    if (operation.type === "create_file") {
      const content = applyDiff("", operation.diff, "create");
      await fs.writeFile(operation.path, content);
      return `Created ${operation.path}`;
    }
    if (operation.type === "update_file") {
      const current = await fs.readFile(operation.path, "utf-8");
      const newContent = applyDiff(current, operation.diff);
      await fs.writeFile(operation.path, newContent);
      return `Updated ${operation.path}`;
    }
    if (operation.type === "delete_file") {
      await fs.unlink(operation.path);
      return `Deleted ${operation.path}`;
    }
    return "Unknown operation type";
  },
});

const llmWithPatch = model.bindTools([patchTool]);
const response = await llmWithPatch.invoke(
  "Rename the fib() function to fibonacci() in lib/fib.py"
);
```

**操作类型**：模型返回具有以下属性的操作：

* `create_file` – 在 `path` 创建一个新文件，其中包含 `diff` 的内容
* `update_file` – 使用 `diff` 中的 V4A diff 格式修改 `path` 处的现有文件
* `delete_file` – 删除位于 `path` 的文件

**最佳实践**：

* **路径验证**：防止目录遍历并将编辑限制为允许的目录
* **备份**：在应用补丁之前考虑备份文件
* **错误处理**：返回描述性错误消息，以便模型可以恢复
* **原子性**：决定是否需要“全有或全无”语义（如果任何补丁失败则回滚）

欲了解更多信息，请参阅[OpenAI's Apply Patch Documentation](https://platform.openai.com/docs/guides/tools-apply-patch)。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/tools/openai.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>