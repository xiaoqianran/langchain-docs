<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith MCP Server | https://docs.langchain.com/langsmith/langsmith-mcp-server -->

# LangSmith MCP 服务器

使用模型上下文协议 (MCP) 服务器让语言模型从 LangSmith 获取对话历史记录、提示、运行、数据集、实验和计费。

<Warning>
  **已弃用 - 请改用 [LangSmith Remote MCP](/langsmith/langsmith-remote-mcp)。**

  LangSmith 现在在 LangSmith Cloud 和 [self-hosted LangSmith](/langsmith/self-hosted) v0.15 或更高版本上托管经过 OAuth 身份验证的远程 MCP 服务器。云端点：

  <table>
    <thead>
      <tr>
        <th>地区</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>GCP 美国</td>
      </tr>

      <tr>
        <td>GCP 欧盟</td>
      </tr>

      <tr>
        <td>GCP 亚太地区</td>
      </tr>

      <tr>
        <td>AWS 美国</td>
      </tr>
    </tbody>
  </table>

  自托管端点：`https://<your-langsmith-host>/api/mcp`。

  它公开与本页上记录的独立服务器相同的工具界面，但通过动态客户端注册的 OAuth 2.1 进行身份验证 - 没有 API 密钥、没有单独的部署、没有标头配置。

  下面记录的独立服务器仍然是 v0.15 之前版本上的自托管部署以及喜欢自行运行服务器的用户的受支持路径。
</Warning>LangSmith MCP 服务器是与 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-langsmith-mcp-server) 集成的 [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) 服务器。它允许 MCP 兼容的客户端（例如 AI 编码助手）从 LangSmith 工作区读取 [conversation history](/langsmith/observability-concepts#threads)、[prompts](/langsmith/manage-prompts-programmatically)、[runs and traces](/langsmith/observability-concepts#runs)、[datasets](/langsmith/evaluation-concepts#datasets)、[experiments](/langsmith/evaluation-concepts#experiment) 和计费使用情况。

## 示例用例

* **对话历史记录**：“从项目‘my-chatbot’中的线程‘thread-123’获取我的对话历史记录”
* **提示管理**：“获取所有公共提示”或“拉取‘法律案例摘要’提示的模板”
* **跟踪和运行**：“从项目‘alpha’获取最新的 10 个根运行”或“按 UUID 获取跟踪的所有运行”
* **数据集**：“列出聊天类型的数据集”或“从数据集‘customer-support-qa’读取示例”
* **实验**：“列出数据集‘my-eval-set’的实验以及延迟和成本指标”
* **账单**：“获取 2025 年 9 月的账单使用情况”

<Tip>
  **在代码或舰队中使用服务器**

  * 要在 Python 应用程序中连接和使用远程 MCP 服务器（包括此服务器），请参阅 [MCP (Model Context Protocol)](/oss/python/langchain/mcp)。
  * 如需在 Fleet 中连接并使用此服务器，请参阅[Remote MCP servers](/langsmith/fleet/remote-mcp-servers)。
</Tip>

## 快速入门（托管）LangSmith MCP 服务器的托管版本可通过 HTTP 获得，因此您无需亲自运行服务器即可进行连接。

* **网址：** `https://langsmith-mcp-server.onrender.com/mcp`
* **身份验证：** 在 `LANGSMITH-API-KEY` 标头中发送您的 [LangSmith API key](/langsmith/create-account-api-key)。

<Note>
  托管实例适用于 [LangSmith Cloud](/langsmith/deploy-to-cloud)。对于 [self-hosted LangSmith](/langsmith/self-hosted) 实例，请自行运行服务器并将其指向您的端点（请参阅[Docker deployment](#docker-deployment-http-streamable)）。
</Note>

**示例（光标`mcp.json`）：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "mcpServers": {
    "LangSmith MCP (Hosted)": {
      "url": "https://langsmith-mcp-server.onrender.com/mcp",
      "headers": {
        "LANGSMITH-API-KEY": "lsv2_pt_your_api_key_here"
      }
    }
  }
}
```

可选标头：`LANGSMITH-WORKSPACE-ID`、`LANGSMITH-ENDPOINT`（与[Environment variables](#environment-variables)相同）。

## 可用工具

### 对话和话题

|工具|描述 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `get_thread_history` |获取对话线程的消息历史记录。使用基于字符的分页：传递`page_number`（从1开始）并使用返回的`total_pages`来请求更多页面。可选：`max_chars_per_page`、`preview_chars`。 |

### 及时管理|工具|描述 |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `list_prompts` |列出提示，并可按可见性（公共/私人）和限制进行可选过滤。 |
| `get_prompt_by_name` |按确切名称（详细信息和模板）获取单个提示。                      |
| `push_prompt` |仅文档：如何创建提示并将其推送到 LangSmith。               |

### 跟踪和运行|工具|描述 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetch_runs` |从一个或多个项目中获取运行（跟踪、工具、链等）。支持过滤器（`run_type`、`error`、`is_root`）、FQL（`filter`、`trace_filter`、`tree_filter`）和排序。设置`trace_id`时，结果按字符分页；否则一批最多`limit`。始终通过`limit`和`page_number`。 || `list_projects` |列出项目，并可按名称、数据集和详细级别进行可选过滤。                                                                                                                                                                                                                                                    |

### 数据集和示例

|工具|描述 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `list_datasets` |列出数据集，并按 ID、类型、名称或元数据进行过滤。                                                                     |
| `list_examples` |按数据集 ID/名称或示例 ID 列出数据集中的示例；支持过滤器、元数据、拆分和可选的`as_of`版本。 |
| `read_dataset` |按 ID 或名称读取一个数据集。                                                                                                  || `read_example` |通过 ID 阅读一个示例，可选 `as_of` 版本。                                                                           |
| `create_dataset` |仅文档：如何创建数据集。                                                                                      |
| `update_examples` |仅文档：如何更新数据集示例。                                                                              |

### 实验和评估

|工具|描述 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list_experiments` |列出数据集的实验（参考）项目。需要 `reference_dataset_id` 或 `reference_dataset_name`。返回指标（延迟、成本、反馈）。 |
| `run_experiment` |仅文档：如何进行实验和评估。                                                                                                 |

### 计费|工具|描述 |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `get_billing_usage` |获取某个日期范围内的组织计费使用情况（例如跟踪计数）。可选的工作区过滤器。 |

### 分页（基于字符）

返回大负载的工具使用**字符预算分页**，因此响应保持在大小限制内：

* **使用者：** `get_thread_history` 和 `fetch_runs`（当设置 `trace_id` 时）。
* **参数：** 在每个请求上发送 `page_number` （从 1 开始）。可选：`max_chars_per_page`（默认 25000，最大 30000）、`preview_chars`（用“...（+N 字符）”截断长字符串）。
* **响应：** 包括 `page_number`、`total_pages` 和页面负载。如需更多信息，请再次致电`page_number = 2`，然后拨打`3`，直至`total_pages`。
* **优点：** 页面是根据字符数而不是项目数构建的；没有光标或服务器端状态——只有页码。

## 安装（本地运行）

如果您希望在本地运行服务器（或使用自托管 LangSmith 端点），请安装它并配置您的 MCP 客户端。

### 先决条件

1.安装[uv](https://github.com/astral-sh/uv)（Python包安装程序）：
   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```2.安装包：
   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   uv run pip install --upgrade langsmith-mcp-server
   ```

### MCP 客户端配置

将服务器添加到您的 MCP 客户端配置中。使用 `which uvx` 的路径作为 `command` 值。

**PyPI / uvx：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "mcpServers": {
    "LangSmith API MCP Server": {
      "command": "/path/to/uvx",
      "args": ["langsmith-mcp-server"],
      "env": {
        "LANGSMITH_API_KEY": "your_langsmith_api_key",
        "LANGSMITH_WORKSPACE_ID": "your_workspace_id",
        "LANGSMITH_ENDPOINT": "https://api.smith.langchain.com"
      }
    }
  }
}
```

**来自来源**（首先克隆[langsmith-mcp-server](https://github.com/langchain-ai/langsmith-mcp-server)）：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "mcpServers": {
    "LangSmith API MCP Server": {
      "command": "/path/to/uv",
      "args": [
        "--directory",
        "/path/to/langsmith-mcp-server",
        "run",
        "langsmith_mcp_server/server.py"
      ],
      "env": {
        "LANGSMITH_API_KEY": "your_langsmith_api_key",
        "LANGSMITH_WORKSPACE_ID": "your_workspace_id",
        "LANGSMITH_ENDPOINT": "https://api.smith.langchain.com"
      }
    }
  }
}
```

将 `/path/to/uv`、`/path/to/uvx` 和 `/path/to/langsmith-mcp-server` 替换为您的实际路径。

## Docker 部署（HTTP-streamable）

您可以使用 Docker 将服务器作为 HTTP 服务运行，以便客户端通过 HTTP 流协议进行连接。

1. 构建并运行：
   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   docker build -t langsmith-mcp-server .
   docker run -p 8000:8000 langsmith-mcp-server
   ```
   使用 [langsmith-mcp-server](https://github.com/langchain-ai/langsmith-mcp-server) 存储库来存储 Dockerfile 和上下文。

2. 使用 `LANGSMITH-API-KEY` 标头（以及可选的 `LANGSMITH-WORKSPACE-ID`、`LANGSMITH-ENDPOINT`）将 MCP 客户端连接到 `http://localhost:8000/mcp`。

3.健康检查（无需授权）：
   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   curl http://localhost:8000/health
   ```

有关完整的 Docker 和 HTTP-streamable 详细信息，请参阅 [LangSmith MCP Server repository](https://github.com/langchain-ai/langsmith-mcp-server)。

## 部署概述

使用 **托管** MCP 服务器连接到 [LangSmith Cloud](/langsmith/cloud)（`smith.langchain.com`、`eu.smith.langchain.com`、`apac.smith.langchain.com` 或 `aws.smith.langchain.com`）。要连接到云或[self-hosted LangSmith](/langsmith/self-hosted)，请运行服务器[locally](#installation-run-locally)并设置`LANGSMITH_ENDPOINT`。对于自托管部署，您还可以通过 VPC 内的 [Docker image](#docker-deployment-http-streamable) 运行服务器。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart LR
  subgraph Client["MCP client"]
    C[Cursor / Claude Code / etc.]
  end

  subgraph CloudPath["Cloud"]
    H[Hosted MCP server]
    LSCloud[LangSmith Cloud]
  end

  subgraph LocalPath["Local"]
    LocalServer[Local MCP server]
  end

  subgraph SelfHostedPath["Self-hosted"]
    D[Docker MCP server]
    LSSelf[Self-hosted LangSmith]
  end

  C --> H
  H --> LSCloud
  C --> LocalServer
  LocalServer --> LSCloud
  LocalServer --> LSSelf
  C --> D
  D --> LSSelf
```

## 环境变量|变量|必填|描述 |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `LANGSMITH_API_KEY` |是的 |您的 [LangSmith API key](/langsmith/create-account-api-key) 用于身份验证。                                             |
| `LANGSMITH_WORKSPACE_ID` |没有 |当您的 API 密钥有权访问多个工作区时的工作区 ID。                                                           |
| `LANGSMITH_ENDPOINT` |没有 | API端点URL（对于[self-hosted](/langsmith/self-hosted)或自定义区域）。默认值：`https://api.smith.langchain.com`。 |

对于 **托管** 服务器，请使用与 **标头** 相同的名称：`LANGSMITH-API-KEY`、`LANGSMITH-WORKSPACE-ID`、`LANGSMITH-ENDPOINT`。

## TypeScript 实现

官方 Python 服务器的社区维护的 TypeScript/Node.js 端口可用。运行它：`LANGSMITH_API_KEY=your-key npx langsmith-mcp-server`。

源码及封装：[GitHub](https://github.com/amitrechavia/langsmith-mcp-server-js)·[npm](https://www.npmjs.com/package/langsmith-mcp-server)。由[amitrechavia](https://github.com/amitrechavia)维护。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/langsmith-mcp-server.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>