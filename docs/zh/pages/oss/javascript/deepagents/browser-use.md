<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Browser use | https://docs.langchain.com/oss/javascript/deepagents/browser-use -->

# 浏览器使用

为深度代理提供一个浏览器，以便它可以在网站上执行操作并端到端测试 Web 应用程序。

浏览器的使用为深度代理提供了一个可以通过工具控制的浏览器。代理打开页面、读取呈现的内容、单击、键入并截取屏幕截图。将其用于网络上发生的工作：

* **没有公共 API 的操作**：预订餐厅、完成结账或通过跨网站的链接研究主题。
* **端到端测试**：通过 UI 对 Web 应用程序进行质量检查。 [Open SWE](https://github.com/langchain-ai/open-swe)，LangChain 的开源编码代理，在每个线程中获取一个浏览器，以便它可以打开更改的应用程序并检查 UI 中的更改。

要将浏览器添加到托管代理，请参阅[Browser use in Managed Deep Agents](/langsmith/javascript/managed-deep-agents-browser-use)。

## 了解基础知识

代理需要两个组件才能使用网络：|组件|选项|
| - | - |
|浏览器| <ul><li>**本地**：您的计算机上或 [sandbox](/oss/javascript/deepagents/sandboxes) 中的 Chrome 或 Chromium。自行访问应用程序 `localhost`，无需提供商帐户。您自行安装和更新 Chrome。</li><li>**远程**：来自 [Browserbase](https://www.browserbase.com) 等提供商的云浏览器。与您的机器隔离，需要 API 密钥，并且无法在您的机器或沙箱中访问 `localhost`。</li></ul> |
|浏览器工具| [Stagehand v4](https://docs.stagehand.dev/v4/integrations/agent-frameworks/deep-agents)（推荐）、[Playwright MCP](https://github.com/microsoft/playwright-mcp) 或 [agent-browser](https://github.com/vercel-labs/agent-browser) CLI。 |

### 通过本地或远程浏览器使用 Stagehand

[Stagehand](https://docs.stagehand.dev/v4/first-steps/introduction) 提供可与本地 Chrome 和远程 Browserbase 会话配合使用的浏览器工具。选择浏览器的运行位置，而无需更改代理使用的工具。 Stagehand 在一个持久浏览器上公开了三种工具：

|工具|描述 |
| - | - |
| `snapshot` |读取活动页面的辅助功能树并使用 ID 标记交互元素。 |
| `run` |使用一批快照操作（`click`、`hover`、`fill`、`type`、`press`、`select`）或使用 Playwright 风格的 JavaScript `page`、`context` 和`browser` 物体。 |
| `screenshot` |将渲染的页面捕获为 PNG 或 JPEG 格式。 |元素 ID 仅对活动页面的最新快照有效，因此代理在导航后会拍摄新快照。

通过 JavaScript MCP 适配器使用 Stagehand 的 Python MCP 服务器。本机 `langchain-stagehand` 中间件仅支持 Python。

### 其他浏览器工具

* **[Playwright MCP](https://github.com/microsoft/playwright-mcp)**：来自 Microsoft 的 MCP 服务器，可公开 Playwright 浏览器操作。通过MCP适配器连接，命令为`npx @playwright/mcp@latest`。参见[Model Context Protocol](/oss/javascript/langchain/mcp)。
* **[agent-browser](https://github.com/vercel-labs/agent-browser)**：来自 Vercel Labs 的浏览器 CLI。将其安装在[sandbox](/oss/javascript/deepagents/sandboxes)中，代理通过`execute`工具运行`agent-browser open`和`agent-browser snapshot`等命令。

## 将 Stagehand 与 Browserbase 结合使用

此示例提供了驱动 Browserbase 浏览器的深层代理 Stagehand 工具。该代理在您的计算机上运行。浏览器在 Browserbase 上运行。

Stagehand 的 MCP 服务器在其自己的 Python 环境中运行。即使代理是用 JavaScript 编写的，此设置也需要 [uv](https://docs.astral.sh/uv/)。

安装服务器和代理包：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git clone https://github.com/browserbase/stagehand.git
cd stagehand/packages/integrations/deepagents
uv sync --locked
npm install deepagents @langchain/mcp-adapters@^2.0.1 @langchain/openai
```

设置您的 API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export OPENAI_API_KEY="your-openai-api-key"
export BROWSERBASE_API_KEY="your-browserbase-api-key"
```

将`STAGEHAND_DIR`设置为`packages/integrations/deepagents`的绝对路径，然后创建代理：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";
import { createDeepAgent } from "deepagents";

const STAGEHAND_DIR = "/path/to/stagehand/packages/integrations/deepagents";

const serverEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    ([name, value]) =>
      value && (name.startsWith("STAGEHAND_") || name.startsWith("BROWSERBASE_")),
  ),
) as Record<string, string>;
serverEnv.STAGEHAND_BROWSER = "browserbase";

const SYSTEM_PROMPT = `You control one persistent browser through three tools:
- browser_snapshot: read the active page and get bracketed element IDs.
- browser_run: send snapshot actions, or JavaScript that uses the Playwright-shaped page API.
- browser_screenshot: look at the rendered page.

Snapshot IDs are valid only for the latest snapshot of the active page.
Snapshot again after navigation or stale IDs. Do not launch another browser.`;

const adapter = new MCPAdapter({
  servers: {
    browser: {
      mode: "legacy",
      command: "uv",
      args: ["run", "--project", STAGEHAND_DIR, "--locked", "stagehand-deepagents-mcp"],
      env: serverEnv,
    },
  },
});

try {
  const tools = await adapter.listTools();
  const agent = createDeepAgent({
    model: "openai:gpt-6.1-sol",
    tools,
    systemPrompt: SYSTEM_PROMPT,
  });
  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content:
          "On opentable.com, find a table for two in San Francisco this Friday " +
          "at 7 PM. Stop before confirming, and report the restaurant, time, and booking link.",
      },
    ],
  });
  console.log(result.messages.at(-1)?.contentBlocks);
} finally {
  await adapter.close();
}
```默认情况下，适配器会在每个工具名称前加上服务器名称前缀，因此代理会看到 `browser_run`、`browser_snapshot` 和 `browser_screenshot`。如果您想要使用无前缀名称 `run`、`snapshot` 和 `screenshot`，请设置 `prefixToolNameWithServerName: false`。更新系统提示符以匹配您的工具名称。

服务器接收转发的`STAGEHAND_*`和`BROWSERBASE_*`变量，以及MCP客户端的安全默认值，例如`PATH`和`HOME`。您的模型 API 密钥保留在代理进程中。

> [!警告]
>
> 在整个代理运行期间保持适配器打开。浏览器位于服务器进程中。开放适配器保留与该进程的一个连接，因此运行中的每个工具调用都使用相同的浏览器。

> [!提示]
>
> 快照可能很长。为了使它们脱离主代理的上下文，请将浏览器工具交给[subagent](/oss/javascript/deepagents/subagents)，并让主代理将浏览器任务委托给它。

## 选择浏览器范围

重复使用浏览器会保留 cookie 和网站登录信息，因此客服人员无需每次都登录。选择哪些对话共享该状态：* **线程范围**：每个对话保留一个浏览器。例如，使用测试帐户测试 Web 应用程序更改。当您在同一对话中迭代时，重复使用选项卡并登录。另一个对话将获得一个单独的浏览器，而无需这些 cookie 或登录信息。共享线程中的参与者可以使用其登录帐户。
* **用户范围**：在同一经过身份验证的用户对话中重复使用浏览器登录状态。例如，某人登录预订网站一次，然后在新线程中请求另一次预订。

不要在不相关的用户之间重复使用个人浏览器会话。其代理可以访问该浏览器的任何人都可以充当其登录帐户。使用应用程序身份验证层中经过验证的身份，而不是提示中提供的用户 ID。

MCP 示例在开放适配器的生命周期内保留一个浏览器。您的应用程序拥有适配器重用和清理；适配器关闭后，单独的 LangGraph 线程 ID 不会保留浏览器。

[Managed Deep Agents](/langsmith/javascript/managed-deep-agents-browser-use#choose-a-scope) 为您管理线程和用户范围，包括具有用户范围共享登录状态的单独的每线程窗口。

## 在 LangSmith 沙箱中使用 Chrome 测试应用程序此示例涵盖端到端测试：编码代理更改应用程序后，代理在浏览器中打开应用程序并检查更改。 Open SWE 从 [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-browser-use) 获取其浏览器。以下步骤使用 LangSmith 沙箱构建相同的检查。

[LangSmith sandbox](/langsmith/sandboxes) 一起运行您的应用程序和 Chrome，因此浏览器可以在 `localhost` 打开应用程序。该代理在您的计算机上运行，​​并使用 `LangSmithSandbox` 后端进行文件系统访问和 `execute` 工具。

此示例通过 `execute` 使用代理浏览器，而不是 MCP。每个 CLI 调用都会重用沙箱内命名的 `qa` 浏览器会话。您的计算机上不需要 Browserbase 帐户或 Docker 守护程序。

### 准备沙箱快照

[snapshot](/langsmith/sandbox-snapshots) 包含新沙箱的文件系统和依赖项。创建一个包含您的应用程序、其依赖项、Node.js 和curl 的应用程序。在快照设置过程中，安装代理浏览器和 Chrome 进行测试：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install -g agent-browser@latest
agent-browser install --with-deps
```

以运行浏览器的同一用户身份运行安装。 Linux 依赖项安装程序需要安装系统软件包的权限。将准备好的文件系统捕获为快照并保留其 ID。有关快照创建和捕获，请参阅[Create a snapshot from a running sandbox](/langsmith/sandbox-snapshots#capture-a-snapshot-from-a-running-sandbox)。

在运行代理的计算机上设置这些变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="your-langsmith-api-key"
export OPENAI_API_KEY="your-openai-api-key"
export QA_SNAPSHOT_ID="your-prepared-snapshot-id"
export QA_START_COMMAND="cd /app && npm run dev -- --host 0.0.0.0 --port 3000"
```将 `QA_START_COMMAND` 替换为应用程序的启动命令。这些示例期望它为沙箱内的端口 `3000` 提供服务。

### 创建 QA 代理

该代码启动应用程序，等待其响应，然后打开浏览器。然后代理通过`execute`与UI交互。清理前下载屏幕截图：删除沙箱会删除其文件。

安装主机端软件包。 LangSmith版本范围与此Deep Agents后端匹配； `ws` 支持非阻塞应用程序启动：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install deepagents@^1.15.1 langsmith@^0.9.0 @langchain/openai ws
```

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { writeFile } from "node:fs/promises";

import { createDeepAgent, LangSmithSandbox } from "deepagents";
import { SandboxClient } from "langsmith/sandbox";

const client = new SandboxClient();
const sandbox = await client.createSandbox(process.env.QA_SNAPSHOT_ID!);
const backend = new LangSmithSandbox({ sandbox });

try {
  const app = await sandbox.run(process.env.QA_START_COMMAND!, {
    wait: false,
    timeout: 0,
    idleTimeout: -1,
  });
  for (const command of [
    "curl --fail --retry 20 --retry-connrefused --retry-delay 1 " +
      "--retry-max-time 30 http://127.0.0.1:3000",
    'agent-browser --session qa --args "--no-sandbox" open http://127.0.0.1:3000',
  ]) {
    const response = await backend.execute(command);
    if (response.exitCode !== 0) throw new Error(response.output);
  }

  const agent = createDeepAgent({
    model: "openai:gpt-6.1-sol",
    backend,
    systemPrompt:
      "Test the app through its UI using execute and agent-browser. " +
      "Use agent-browser --session qa for every browser command. " +
      "Use snapshot -i to inspect controls, then click or fill them. " +
      "Take a new snapshot after page changes. Do not edit the app " +
      "or alter its state by executing JavaScript. Save a screenshot " +
      "to /tmp/qa.png before reporting observed results and failures.",
  });
  const result = await agent.invoke({
    messages: [{
      role: "user",
      content: "Sign up as qa@example.com and confirm that the dashboard loads.",
    }],
  });
  console.log(result.messages.at(-1)?.contentBlocks);
  const [image] = await backend.downloadFiles(["/tmp/qa.png"]);
  if (image.error || !image.content) throw new Error(image.error ?? "No screenshot");
  await writeFile("qa.png", image.content);
} finally {
  await backend.close();
}
```

`backend.close()` 删除包装的 JavaScript 沙箱，因此不需要额外的 `client.deleteSandbox()` 调用。

这些示例使用 `--no-sandbox` 禁用 Chrome 的内部沙箱，以用于 root 运行的沙箱映像。一次性LangSmith沙箱提供外部隔离边界。对于支持 Chrome 内部沙箱的图像，请忽略该标志。

屏幕截图是下载到您的计算机上的工件，而不是自动显示给模型的图像。对于模型可见图像，请参阅[Multimodal inputs](/oss/javascript/deepagents/multimodal)。使用独立断言来获得确定性测试结果：代理的报告及其指令不是安全边界。

## 保护浏览器会话在浏览器中运行的代码可以使用会话登录的任何帐户以及浏览器可以访问的任何站点。在为代理提供浏览器之前：

* 对于Stagehand，使用Browserbase 作为不受信任任务的隔离边界。 `run` 在浏览器内执行模型编写的 JavaScript。请参阅 Stagehand 的 [security boundary](https://docs.stagehand.dev/v4/integrations/agent-frameworks/overview#security-boundary)。
* 对于[sandbox QA path](#test-an-app-with-chrome-in-a-langsmith-sandbox)，LangSmith沙箱是隔离边界。一次性沙箱将 Chrome 和应用程序与您的计算机隔离。
* 使用测试帐户并测试付款方式进行结帐和表单流程，并在进行任何购买操作之前使用[require approval](/oss/javascript/deepagents/human-in-the-loop)。
* 将页面内容视为不受信任的输入。页面可以包含用于重定向代理的文本。
* 将凭据保存在您的应用程序环境中，而不是提示或浏览器工具输入中。使用 MCP 时，仅向服务器传递其所需的凭据。

## 另请参阅

* [Browser use in Managed Deep Agents](/langsmith/javascript/managed-deep-agents-browser-use)
* [Sandboxes](/oss/javascript/deepagents/sandboxes)
* [Human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop)
* [Model Context Protocol (MCP)](/oss/javascript/langchain/mcp)
* [Stagehand Deep Agents documentation](https://docs.stagehand.dev/v4/integrations/agent-frameworks/deep-agents)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/browser-use.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。