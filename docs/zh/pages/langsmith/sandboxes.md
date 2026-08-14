<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Sandboxes | https://docs.langchain.com/langsmith/sandboxes -->

# LangSmith 沙箱

使用 LangSmith 托管沙箱在隔离环境中安全地执行代码并与文件系统交互。

沙箱是隔离的环境，允许代理安全地执行潜在风险的操作，例如运行任意代码或与文件系统交互，而不会影响您的主要基础设施。

从[LangSmith homepage](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-sandboxes)，选择**沙箱**来管理所有沙箱资源。

<img alt="Sandboxes overview page" />

## 环境可用性

|环境 |状态 |
| -------------------------------------------------------- | ------------------- |
| GCP 美国 (`smith.langchain.com`) |一般可用 |
| GCP 欧盟 (`eu.smith.langchain.com`) |一般可用 |
| GCP 亚太地区 (`apac.smith.langchain.com`) |一般可用 |
| AWS 美国 (`aws.smith.langchain.com`) |一般可用 |
| [BYOC](/langsmith/byoc)（您的数据平面 URL）|一般可用 |

<Warning>
  在 BYOC 上，使用属于 BYOC 工作区的 API 密钥。
</Warning>

对于自托管 LangSmith 部署，请参阅 [Enable Sandboxes on self-hosted deployments](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes)。

## 开始吧

### 1.安装SDK

<CodeGroup>
  ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # uv
  uv add "langsmith[sandbox]"

  # pip
  pip install "langsmith[sandbox]"
  ```

  ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langsmith
  ```
</CodeGroup>

### 2.设置您的API密钥

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="<your-api-key>"
```

### 3. 创建并运行沙箱

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.sandbox import SandboxClient

  client = SandboxClient()

  with client.sandbox() as sb:
      result = sb.run("python -c 'print(2 + 2)'")
      print(result.stdout)  # "4\n"
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { SandboxClient } from "langsmith/sandbox";

  const client = new SandboxClient();
  const sandbox = await client.createSandbox();
  const result = await sandbox.run("node -e 'console.log(2 + 2)'");
  console.log(result.stdout); // "4\n"
  await sandbox.delete();
  ```
</CodeGroup><Tip>
  更喜欢命令行？ [Sandbox CLI](/langsmith/sandbox-cli) 允许您创建沙箱、运行命令以及打开交互式 shell，而无需编写任何代码。
</Tip>

### 4. 与代理一起使用沙箱

要将沙箱连接到代理代码中，请参阅开源文档：

* **Deep Agents**：[Use ⟦T9⟧ as a backend](/oss/python/integrations/sandboxes/langsmith)，涵盖安装、后端创建和清理。
* **沙箱作为代理后端**：[Configure any sandbox as the execution backend](/oss/python/deepagents/sandboxes)自动为您的代理提供`execute`和文件系统工具。
* **LangChain / LangGraph 集成**：使用 LangSmith 沙箱作为第一方选项，或 [connect third-party providers](/oss/python/integrations/sandboxes)，例如 AgentCore、Daytona、E2B、Modal、Runloop 和 Vercel。

## 资源

<CardGroup>
  <Card title="Snapshots" icon="camera" href="/langsmith/sandbox-snapshots">
    从 Docker 映像构建文件系统映像或捕获正在运行的沙箱，然后从中启动沙箱。
  </Card>

  <Card title="Service URLs" icon="globe" href="/langsmith/sandbox-service-urls">
    通过经过身份验证的 URL 访问在沙箱内运行的 HTTP 服务。
  </Card>

  <Card title="Auth proxy" icon="shield-lock" href="/langsmith/sandbox-auth-proxy">
    将凭证注入出站 API 请求，无需硬编码机密。
  </Card>

  <Card title="Mounts" icon="folder" href="/langsmith/sandbox-mounts">
    将 S3 存储桶、GCS 存储桶和公共 Git 存储库附加到沙箱文件系统。
  </Card>

  <Card title="Permissions" icon="user-key" href="/langsmith/sandbox-permissions">
    控制哪些工作区成员可以在创建沙箱后与其进行交互。
  </Card><Card title="CLI" icon="terminal-2" href="/langsmith/sandbox-cli">
    从命令行构建快照、管理沙箱、打开控制台和隧道 TCP 端口。
  </Card>

  <Card title="SDK usage" icon="code" href="/langsmith/sandbox-sdk">
    使用 Python 或 TypeScript SDK 以编程方式创建和管理沙箱。
  </Card>

  <Card title="Self-hosted setup" icon="server" href="/langsmith/deploy-self-hosted-full-platform#enable-sandboxes">
    使用 Helm 或 Terraform 在自托管 LangSmith 部署上启用沙箱。
  </Card>

  <Card title="Harbor" icon="flask" href="/langsmith/harbor-integrations#sandboxes">
    在 LangSmith 沙箱上运行 Harbor 评估和部署。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandboxes.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>