<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a data analysis agent from scratch | https://docs.langchain.com/oss/javascript/langchain/deep-agent-from-scratch -->

# 从头开始构建一个数据分析代理

使用create_agent和Deep Agents中间件逐步构建数据分析代理。

本指南使用 `create_agent` 和 Deep Agents 中间件从第一原则构建数据分析代理。

`create_agent`和`create_deep_agent`都为您提供对工具、内存等的细粒度控制。
两者之间的主要区别在于 Deep Agents 附带了一系列内置的常用功能，例如规划、文件系统工具和子代理。
如果 Deep Agents 默认线束不能满足您的需求，本指南将向您展示如何从 `create_agent` 开始并一次组装一件线束，以便您可以准确地看到每个组件添加的内容，并仅交换您的用例所需的内容。

按照本指南构建一个代理：

1. 接受 CSV 文件进行分析
2. 在隔离的沙箱中编写并执行Python代码
3. 将可视化工作委托给专门的子代理
4. 从技能文件加载数据分析模式

最终的堆栈反映了 `create_deep_agent` 默认组装的内容。

## 你将学到什么

每个步骤都会为同一数据分析代理添加一项功能：|步骤|没有它的问题 |您添加的内容 |
| - | - | - |
|最小代理 | — |基线循环：模型+工具，无线束|
|沙箱+文件系统|代理无法读取 CSV 或运行 Python |隔离[backend](/oss/javascript/deepagents/backends) + 文件和执行工具 |
|总结|长时间会话达到上下文限制 |自动历史压缩 |
|技能 |域规则使系统提示变得臃肿|通过 [progressive disclosure](/oss/javascript/langchain/multi-agent/skills-sql-assistant) 按需获取专业知识 |
|子代理 |图表迭代挤满主线程 |隔离工作者+并行委托|

## 设置

**1.安装软件包**

安装本教程的软件包：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install deepagents langsmith
```

**2.设置 LangSmith API 密钥**

本教程使用[⟦T55⟧](https://reference.langchain.com/javascript/deepagents/backends/LangSmithSandbox)，它通过`SandboxClient`配置沙箱。该客户端使用您环境中的 `LANGSMITH_API_KEY` 对 LangSmith 进行身份验证，因此需要 API 密钥才能运行本教程。设置 LangSmith 还可以让您查看代理运行时发生的情况的痕迹。

1. [Sign up for a free account](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-deep-agent-from-scratch)。您可以使用 Google、GitHub 或电子邮件。
2. **设置 > API 密钥**中的[Create an API key](/langsmith/create-account-api-key)。
3. 导出LangSmith API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY=...
```

4. 在添加每个部分时启用跟踪以检查工具调用、中间件步骤和子代理委派：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
```

**3.添加模型提供商 API 密钥**导出您在代码示例中使用的模型提供程序的 API 密钥：

```bash Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_API_KEY=...
```

```bash OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export OPENAI_API_KEY=...
```

```bash Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export ANTHROPIC_API_KEY=...
```

```bash OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export OPENROUTER_API_KEY=...
```

```bash Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export FIREWORKS_API_KEY=...
```

```bash Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export BASETEN_API_KEY=...
```

```bash Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Local: Ollama must be running on your machine
# Cloud: Set your Ollama API key for hosted inference
export OLLAMA_API_KEY=...
```

## 构建代理

## 创建最小代理

数据分析代理需要的不仅仅是聊天循环，但首先要从基线开始：只有一个模型和一个循环。

使用 [⟦T58⟧](https://reference.langchain.com/javascript/langchain/index/createAgent) 并指定您要使用的型号：

```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";

let agent = createAgent({
  model: "google:gemini-4-hydrogen",
  tools: [],
});
```

```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";

let agent = createAgent({
  model: "openai:gpt-6.1-sol",
  tools: [],
});
```

```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";

let agent = createAgent({
  model: "anthropic:claude-sonnet-5",
  tools: [],
});
```

```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";

let agent = createAgent({
  model: "openrouter:z-ai/glm-5.2",
  tools: [],
});
```

```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";

let agent = createAgent({
  model: "fireworks:accounts/fireworks/models/glm-5p2",
  tools: [],
});
```

```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";

let agent = createAgent({
  model: "baseten:zai-org/GLM-5.2",
  tools: [],
});
```

```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";

let agent = createAgent({
  model: "ollama:north-mini-code-1.0",
  tools: [],
});
```

它会运行，但代理没有文件系统，也无法执行代码。如果你要求它分析 CSV，它只能根据提示进行猜测。接下来的步骤添加真正的文件访问和代码执行。

## 添加沙箱后端

为了有效地分析数据，代理需要在文件上运行代码。这需要两件事：

* 一个隔离的[sandbox](/oss/javascript/deepagents/sandboxes)，代理可以在其中放置文件并在文件上运行代码，而无需授予代理访问主机的权限。

* [backend](/oss/javascript/deepagents/backends)，它提供使用 [⟦T64⟧](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware):\*\* 与沙箱（`read_file`、`write_file`、`edit_file`、`glob`、`grep`）配合使用的文件系统工具。由于`LangSmithSandbox`后端实现了沙箱协议，[⟦T66⟧](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware)还添加了`execute`工具，该工具允许代理运行shell命令。[⟦T68⟧](https://reference.langchain.com/javascript/deepagents/backends/LangSmithSandbox) 是文件存活和命令运行的地方。 [⟦T69⟧](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware) 是将环境作为工具暴露给模型的。如果您稍后交换后端，相同的中间件可以与其他后端一起使用。

[⟦T70⟧](https://reference.langchain.com/javascript/deepagents/backends/LangSmithSandbox) 为代理提供了一个隔离环境，其中包含文件系统和用于运行 shell 命令的 `execute` 工具。有了它，代理可以安装包、编写脚本并运行它们，而无需接触主机。要从自定义映像而不是默认运行时启动，请将 `snapshotId` 传递给 `LangSmithSandbox.create()`；参见[Sandbox snapshots](/langsmith/sandbox-snapshots)。

将上一步中的代理替换为包含 [⟦T74⟧](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware) 的代理：

```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createFilesystemMiddleware, LangSmithSandbox } from "deepagents";
import { SandboxClient } from "langsmith/sandbox";

const client = new SandboxClient();
const sandbox = await client.createSandbox({
  name: "langchain-docs",
  snapshotName: "docs-test-ci",
});
const backend = new LangSmithSandbox({ sandbox });

agent = createAgent({
  model: "google:gemini-4-hydrogen",
  tools: [],
  middleware: [createFilesystemMiddleware({ backend })],
});
```

```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createFilesystemMiddleware, LangSmithSandbox } from "deepagents";
import { SandboxClient } from "langsmith/sandbox";

const client = new SandboxClient();
const sandbox = await client.createSandbox({
  name: "langchain-docs",
  snapshotName: "docs-test-ci",
});
const backend = new LangSmithSandbox({ sandbox });

agent = createAgent({
  model: "openai:gpt-6.1-sol",
  tools: [],
  middleware: [createFilesystemMiddleware({ backend })],
});
```

```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createFilesystemMiddleware, LangSmithSandbox } from "deepagents";
import { SandboxClient } from "langsmith/sandbox";

const client = new SandboxClient();
const sandbox = await client.createSandbox({
  name: "langchain-docs",
  snapshotName: "docs-test-ci",
});
const backend = new LangSmithSandbox({ sandbox });

agent = createAgent({
  model: "anthropic:claude-sonnet-5",
  tools: [],
  middleware: [createFilesystemMiddleware({ backend })],
});
```

```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createFilesystemMiddleware, LangSmithSandbox } from "deepagents";
import { SandboxClient } from "langsmith/sandbox";

const client = new SandboxClient();
const sandbox = await client.createSandbox({
  name: "langchain-docs",
  snapshotName: "docs-test-ci",
});
const backend = new LangSmithSandbox({ sandbox });

agent = createAgent({
  model: "openrouter:z-ai/glm-5.2",
  tools: [],
  middleware: [createFilesystemMiddleware({ backend })],
});
```

```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createFilesystemMiddleware, LangSmithSandbox } from "deepagents";
import { SandboxClient } from "langsmith/sandbox";

const client = new SandboxClient();
const sandbox = await client.createSandbox({
  name: "langchain-docs",
  snapshotName: "docs-test-ci",
});
const backend = new LangSmithSandbox({ sandbox });

agent = createAgent({
  model: "fireworks:accounts/fireworks/models/glm-5p2",
  tools: [],
  middleware: [createFilesystemMiddleware({ backend })],
});
```

```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createFilesystemMiddleware, LangSmithSandbox } from "deepagents";
import { SandboxClient } from "langsmith/sandbox";

const client = new SandboxClient();
const sandbox = await client.createSandbox({
  name: "langchain-docs",
  snapshotName: "docs-test-ci",
});
const backend = new LangSmithSandbox({ sandbox });

agent = createAgent({
  model: "baseten:zai-org/GLM-5.2",
  tools: [],
  middleware: [createFilesystemMiddleware({ backend })],
});
```

```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createFilesystemMiddleware, LangSmithSandbox } from "deepagents";
import { SandboxClient } from "langsmith/sandbox";

const client = new SandboxClient();
const sandbox = await client.createSandbox({
  name: "langchain-docs",
  snapshotName: "docs-test-ci",
});
const backend = new LangSmithSandbox({ sandbox });

agent = createAgent({
  model: "ollama:north-mini-code-1.0",
  tools: [],
  middleware: [createFilesystemMiddleware({ backend })],
});
```

沙箱文件系统与您的笔记本电脑是分开的。在调用代理之前，您必须将所需的文件上传到其中：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const rows = [
  ["Date", "Product", "Units", "Revenue"],
  ["2025-08-01", "Widget A", "10", "250"],
  ["2025-08-02", "Widget B", "5", "125"],
  ["2025-08-03", "Widget A", "7", "175"],
  ["2025-08-04", "Widget C", "3", "90"],
];

const csv = rows.map((row) => row.join(",")).join("\n");
const encoder = new TextEncoder();
await backend.uploadFiles([["/sales.csv", encoder.encode(csv)]]);

const uploadStream = await agent.streamEvents(
  {
    messages: [
      {
        role: "user",
        content:
          "Read /sales.csv and summarize total revenue by product in one sentence. Do not run shell commands.",
      },
    ],
  },
  { version: "v3", recursionLimit: 8 },
);

await Promise.all([
  (async () => {
    for await (const message of uploadStream.messages) {
      console.log(await message.text);
    }
  })(),
  uploadStream.output,
]);
```

> [!注意]
>
> 对于 [⟦T75⟧](https://reference.langchain.com/javascript/deepagents/backends/LangSmithSandbox)，上传路径必须是绝对 POSIX 路径（例如，`/sales.csv`）。诸如 `sales.csv` 之类的相对路径会被 `invalid_path` 拒绝，并且文件不会写入沙箱。

将前面步骤中的代码合并到一个脚本中并运行它：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx tsx analyze-sales.ts
```第一次运行时，LangSmith 会配置一个沙箱（这可能需要几秒钟）。该脚本上传 `sales.csv`，流式传输代理运行，并在助理消息到达时打印它们。您应该看到示例销售数据的分析：产品级收入、哪些小部件销量最高，以及简要趋势说明。确切的措辞因模型运行而异。

在 [LangSmith](https://smith.langchain.com/?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-deep-agent-from-scratch) 中打开运行，并观察代理在回复之前使用文件系统工具（`read_file` 和 `execute`，如果它在沙箱中运行 Python）。

## 添加上下文管理

步骤 2 之后，每个工具结果都会保留在消息历史记录中。真正的分析会话（多个绘图、失败的脚本、大的`read_file`输出）会快速填充上下文窗口。

当历史记录变得太大时，[⟦T83⟧](https://reference.langchain.com/javascript/langchain/index/summarizationMiddleware) 会压缩较旧的回合，因此代理可以继续工作，而无需您手动修剪消息。这对于第一个 `sales.csv` 问题不太重要，而对于后续问题（例如“现在按产品细分并绘制每月趋势”）更重要。

通过将 [⟦T85⟧](https://reference.langchain.com/javascript/langchain/index/summarizationMiddleware) 添加到中间件列表来更新步骤 2 中的代理：

```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSummarizationMiddleware } from "deepagents";

let model = "google:gemini-4-hydrogen";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({
      model,
      backend,
    }),
  ],
});
```

```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSummarizationMiddleware } from "deepagents";

let model = "openai:gpt-6.1-sol";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({
      model,
      backend,
    }),
  ],
});
```

```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSummarizationMiddleware } from "deepagents";

let model = "anthropic:claude-sonnet-5";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({
      model,
      backend,
    }),
  ],
});
```

```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSummarizationMiddleware } from "deepagents";

let model = "openrouter:z-ai/glm-5.2";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({
      model,
      backend,
    }),
  ],
});
```

```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSummarizationMiddleware } from "deepagents";

let model = "fireworks:accounts/fireworks/models/glm-5p2";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({
      model,
      backend,
    }),
  ],
});
```

```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSummarizationMiddleware } from "deepagents";

let model = "baseten:zai-org/GLM-5.2";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({
      model,
      backend,
    }),
  ],
});
```

```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSummarizationMiddleware } from "deepagents";

let model = "ollama:north-mini-code-1.0";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({
      model,
      backend,
    }),
  ],
});
```运行多轮会话以查看摘要的实际效果。初步分析后，提出引发更多文件读取或脚本运行的后续问题。在LangSmith中，在后续模型调用之前查找汇总步骤。欲了解更多信息，[Context engineering](/oss/javascript/langchain/context-engineering)。

## 添加技能

[Skills](/oss/javascript/langchain/multi-agent/skills-sql-assistant) 提供了一种在需要时使用渐进式披露为代理提供按需领域知识的方法。技能可以包括多步骤工作流程、规则和约定。通过将此信息放入技能中，默认情况下不会将其添加到系统提示中，从而确保仅在任务需要技能信息时才使用令牌。

当代理启动时，它只能看到有关每个技能的轻量级元数据。当任务需要技能时，代理会按需加载完整的技能文件。

在技能目录中创建技能文件：

```
skills/
  pandas-patterns/
    SKILL.md
```

```markdown theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
---
name: pandas-patterns
description: Common pandas and matplotlib patterns for data analysis and visualization
---

## Data loading
Use `pd.read_csv()` for CSV files. Always check `df.info()` and `df.describe()` first.

## Visualization
Use `matplotlib` for bar charts, `seaborn` for statistical plots.
Save figures with `plt.savefig("output.png", dpi=150, bbox_inches="tight")`.

## Reporting
Write a markdown summary to `report.md` alongside any generated charts.
```

该技能包含有关如何进行可视化的信息。

使用 [⟦T86⟧](https://reference.langchain.com/javascript/deepagents/backends/LangSmithSandbox)，技能路径在沙箱文件系统上解析，而不是在本地计算机上解析。在配置[⟦T88⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSkillsMiddleware)之前上传本地`skills/`目录：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillsDir = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "skills",
);
const skillFiles: Array<[string, Uint8Array]> = [];

function collectSkillFiles(dir: string): void {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      collectSkillFiles(fullPath);
    } else {
      const rel = relative(skillsDir, fullPath).replace(/\\/g, "/");
      skillFiles.push([`/skills/${rel}`, readFileSync(fullPath)]);
    }
  }
}

collectSkillFiles(skillsDir);
await backend.uploadFiles(skillFiles);
```

然后通过添加 [⟦T89⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSkillsMiddleware) 来创建您的代理：

```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSkillsMiddleware } from "deepagents";

model = "google:gemini-4-hydrogen";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
  ],
});
```

```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSkillsMiddleware } from "deepagents";

model = "openai:gpt-6.1-sol";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
  ],
});
```

```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSkillsMiddleware } from "deepagents";

model = "anthropic:claude-sonnet-5";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
  ],
});
```

```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSkillsMiddleware } from "deepagents";

model = "openrouter:z-ai/glm-5.2";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
  ],
});
```

```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSkillsMiddleware } from "deepagents";

model = "fireworks:accounts/fireworks/models/glm-5p2";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
  ],
});
```

```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSkillsMiddleware } from "deepagents";

model = "baseten:zai-org/GLM-5.2";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
  ],
});
```

```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createSkillsMiddleware } from "deepagents";

model = "ollama:north-mini-code-1.0";

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
  ],
});
```您可以尝试诸如“使用我们的 pandas 模式分析 sales.csv”之类的提示。当需要绘制或报告指导时，代理将加载技能。如果您提出不需要该技能的不同问题，代理将不会加载它。

## 添加可视化子代理

某些任务会产生大量中间输出（脚本草稿、失败的运行、文件读取），如果将其保留在一个线程中，这些输出会占用主代理的上下文。 [subagent](/oss/javascript/deepagents/subagents) 在自己的上下文窗口中运行，因此主管只能看到最终结果，而不是一路上的每个工具调用。这样可以保持主要分析的重点，并为后续问题留出空间。

使用子代理有意义的一个例子是图表生成。绘图通常意味着在图形准备好之前迭代 Python 脚本、安装包以及读取错误输出。下面的`visualizer`子代理可以独立处理该工作，而主代理则继续规划和分析。通过[⟦T91⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware)，主代理还可以并行委托该图表工作，而不是在每个图上阻塞。

通过添加 [⟦T92⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware) 和 [⟦T93⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSubAgentMiddleware) 来更新步骤 4 中的代理：

```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { todoListMiddleware } from "langchain";
import { createSubAgentMiddleware, type SubAgent } from "deepagents";

model = "google:gemini-4-hydrogen";

const visualizer: SubAgent = {
  name: "visualizer",
  description:
    "Generates charts and visualizations from data files in the sandbox.",
  systemPrompt:
    "You are a data visualization specialist. Write Python scripts using matplotlib and seaborn. Save all figures as PNG files.",
  tools: [],
  model,
};

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
    todoListMiddleware(),
    createSubAgentMiddleware({
      defaultModel: model,
      defaultTools: [],
      subagents: [visualizer],
    }),
  ],
});
```

```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { todoListMiddleware } from "langchain";
import { createSubAgentMiddleware, type SubAgent } from "deepagents";

model = "openai:gpt-6.1-sol";

const visualizer: SubAgent = {
  name: "visualizer",
  description:
    "Generates charts and visualizations from data files in the sandbox.",
  systemPrompt:
    "You are a data visualization specialist. Write Python scripts using matplotlib and seaborn. Save all figures as PNG files.",
  tools: [],
  model,
};

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
    todoListMiddleware(),
    createSubAgentMiddleware({
      defaultModel: model,
      defaultTools: [],
      subagents: [visualizer],
    }),
  ],
});
```

```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { todoListMiddleware } from "langchain";
import { createSubAgentMiddleware, type SubAgent } from "deepagents";

model = "anthropic:claude-sonnet-5";

const visualizer: SubAgent = {
  name: "visualizer",
  description:
    "Generates charts and visualizations from data files in the sandbox.",
  systemPrompt:
    "You are a data visualization specialist. Write Python scripts using matplotlib and seaborn. Save all figures as PNG files.",
  tools: [],
  model,
};

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
    todoListMiddleware(),
    createSubAgentMiddleware({
      defaultModel: model,
      defaultTools: [],
      subagents: [visualizer],
    }),
  ],
});
```

```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { todoListMiddleware } from "langchain";
import { createSubAgentMiddleware, type SubAgent } from "deepagents";

model = "openrouter:z-ai/glm-5.2";

const visualizer: SubAgent = {
  name: "visualizer",
  description:
    "Generates charts and visualizations from data files in the sandbox.",
  systemPrompt:
    "You are a data visualization specialist. Write Python scripts using matplotlib and seaborn. Save all figures as PNG files.",
  tools: [],
  model,
};

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
    todoListMiddleware(),
    createSubAgentMiddleware({
      defaultModel: model,
      defaultTools: [],
      subagents: [visualizer],
    }),
  ],
});
```

```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { todoListMiddleware } from "langchain";
import { createSubAgentMiddleware, type SubAgent } from "deepagents";

model = "fireworks:accounts/fireworks/models/glm-5p2";

const visualizer: SubAgent = {
  name: "visualizer",
  description:
    "Generates charts and visualizations from data files in the sandbox.",
  systemPrompt:
    "You are a data visualization specialist. Write Python scripts using matplotlib and seaborn. Save all figures as PNG files.",
  tools: [],
  model,
};

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
    todoListMiddleware(),
    createSubAgentMiddleware({
      defaultModel: model,
      defaultTools: [],
      subagents: [visualizer],
    }),
  ],
});
```

```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { todoListMiddleware } from "langchain";
import { createSubAgentMiddleware, type SubAgent } from "deepagents";

model = "baseten:zai-org/GLM-5.2";

const visualizer: SubAgent = {
  name: "visualizer",
  description:
    "Generates charts and visualizations from data files in the sandbox.",
  systemPrompt:
    "You are a data visualization specialist. Write Python scripts using matplotlib and seaborn. Save all figures as PNG files.",
  tools: [],
  model,
};

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
    todoListMiddleware(),
    createSubAgentMiddleware({
      defaultModel: model,
      defaultTools: [],
      subagents: [visualizer],
    }),
  ],
});
```

```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { todoListMiddleware } from "langchain";
import { createSubAgentMiddleware, type SubAgent } from "deepagents";

model = "ollama:north-mini-code-1.0";

const visualizer: SubAgent = {
  name: "visualizer",
  description:
    "Generates charts and visualizations from data files in the sandbox.",
  systemPrompt:
    "You are a data visualization specialist. Write Python scripts using matplotlib and seaborn. Save all figures as PNG files.",
  tools: [],
  model,
};

agent = createAgent({
  model,
  tools: [],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["/skills/"] }),
    todoListMiddleware(),
    createSubAgentMiddleware({
      defaultModel: model,
      defaultTools: [],
      subagents: [visualizer],
    }),
  ],
});
```尝试使用诸如“分析 sales.csv，然后按产品创建收入条形图”之类的提示。主代理处理分析和规划，并通过`task`工具将图表生成委托给`visualizer`子代理。

如果您在[Setup](#setup)中启用了跟踪，请在[LangSmith](https://smith.langchain.com/?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-deep-agent-from-scratch)中打开运行。您应该看到对 `visualizer` 的 `task` 调用，一个具有自己的工具循环的单独子运行，以及返回给主管的简短结果。

## 你构建了什么

您已经使用以下中间件构建了自定义代理：

|中间件|添加了什么 |
| - | - |
| [⟦T98⟧](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware) + `LangSmithSandbox` |隔离文件系统 + `execute` 工具 |
| [⟦T101⟧](https://reference.langchain.com/javascript/langchain/index/summarizationMiddleware) |自动上下文压缩 |
| [⟦T102⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSkillsMiddleware) |领域知识按需加载 |
| [⟦T103⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware) + [⟦T104⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSubAgentMiddleware) |并行可视化子代理 |

这与 [⟦T105⟧](https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent) 具有相同的基础：手动组装，因此您可以准确控制所包含的内容。

可能性并不止于此：请参阅 [Prebuilt middleware](/oss/javascript/langchain/middleware/built-in) 了解可组合功能的完整列表，以及 [⟦T106⟧](https://reference.langchain.com/javascript/langchain/index/createAgent) 参考了解所有配置选项。

要使用预组装版本，请参阅[Customize Deep Agents](/oss/javascript/deepagents/customization)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/deep-agent-from-scratch.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。