<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Implement a CI/CD pipeline using LangSmith Deployment and Evaluation | https://docs.langchain.com/langsmith/cicd-pipeline-example -->

# 使用LangSmith部署和评估实现 CI/CD 管道

本指南演示了如何为LangSmith部署中部署的AI代理应用程序实现全面的CI/CD管道。在此示例中，您将使用 [LangGraph](/oss/python/langgraph/overview) 开源框架来编排和构建代理，使用 [LangSmith](/langsmith/observability) 来进行可观察性和评估。该管道基于[cicd-pipeline-example repository](https://github.com/langchain-ai/cicd-pipeline-example)。

## 概述

CI/CD 管道提供：

- <Icon icon="circle-check" /> **自动化测试**：单元、集成和端到端测试。
- <Icon icon="chart-line" /> **离线评估**：使用[AgentEvals](/oss/python/langchain/test/evals)、[OpenEvals](/langsmith/openevals#setup)和[LangSmith](/langsmith/observability)进行绩效评估。
- <Icon icon="rocket" /> **预览和生产部署**：使用控制平面 API 进行自动暂存和质量控制的生产版本。
- <Icon icon="eye" /> **监控**：持续评估和警报。

## 管道架构

CI/CD 管道由几个关键组件组成，这些组件协同工作以确保代码质量和可靠的部署：

```mermaid
graph TD
    A1[Code or Graph Change] --> B1[Trigger CI Pipeline]
    A2[Prompt Commit in PromptHub] --> B1
    A3[Online Evaluation Alert] --> B1
    A4[PR Opened] --> B1

    subgraph "Testing"
        B1 --> C1[Run Unit Tests]
        B1 --> C2[Run Integration Tests]
        B1 --> C3[Run End to End Tests]
        B1 --> C4[Run Offline Evaluations]

        C4 --> D1[Evaluate with OpenEvals or AgentEvals]
        C4 --> D2[Assertions: Hard and Soft]

        C1 --> E1[Run LangGraph Dev Server Test]
        C2 --> E1
        C3 --> E1
        D1 --> E1
        D2 --> E1
    end

    E1 --> F1[Push to Staging Deployment - Deploy to LangSmith as Development Type]

    F1 --> G1[Run Online Evaluations on Live Data]
    G1 --> H1[Attach Scores to Traces]

    H1 --> I1[If Quality Below Threshold]
    I1 --> J1[Send to Annotation Queue]
    I1 --> J2[Trigger Alert via Webhook]
    I1 --> J3[Push Trace to Golden Dataset]

    F1 --> K1[Promote to Production if All Pass - Deploy to LangSmith Production]

    J2 --> L1[Slack or PagerDuty Notification]

    subgraph Manual Review
        J1 --> M1[Human Labeling]
        M1 --> J3
    end

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33
    classDef alert fill:#F8E8E6,stroke:#B27D75,stroke-width:2px,color:#634643
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68

    class A1,A2,A3,A4 trigger
    class B1,C1,C2,C3,C4,D1,D2,E1 process
    class H1,I1 decision
    class F1,G1,K1 output
    class J2,L1 alert
    class J1,J3,M1 neutral
```

### 触发源

您可以通过多种方式触发此管道，无论是在开发过程中还是在您的应用程序已经上线时。管道可以通过以下方式触发：- <Icon icon="git-branch" /> **代码更改**：推送到主/开发分支，您可以在其中修改LangGraph架构、尝试不同的模型、更新代理逻辑或进行任何代码改进。
- <Icon icon="edit" /> **PromptHub 更新**：对存储在 LangSmith PromptHub 中的提示模板进行更改 - 每当有新的提示提交时，系统都会触发 Webhook 来运行管道。
- <Icon icon="alert-triangle" /> **在线评估警报**：来自实时部署的性能下降通知
- <Icon icon="webhook" /> **LangSmith 跟踪 Webhooks**：基于跟踪分析和性能指标的自动触发器。
- <Icon icon="player-play" /> **手动触发**：手动启动管道以进行测试或紧急部署。

### 测试层

与传统软件相比，测试人工智能代理应用程序还需要评估响应质量，因此测试工作流程的每个部分非常重要。该管道实现了多个测试层：1. <Icon icon="puzzle" /> **单元测试**：单个节点和实用功能测试。
2. <Icon icon="link" /> **集成测试**：组件交互测试。
3. <Icon icon="route" /> **端到端测试**：全图执行测试。
4. <Icon icon="brain" /> **离线评估**：基于真实场景的性能评估，包括端到端评估、单步评估、智能体轨迹分析和多轮模拟。
5. <Icon icon="server" /> **LangGraph 开发服务器测试**：使用 [langgraph-cli](/langsmith/cli) 工具启动（在 GitHub Action 内）本地服务器以运行 LangGraph 代理。这会轮询 `/ok` 服务器 API 端点，直到它可用并持续 30 秒，之后抛出错误。

## GitHub 操作工作流程

CI/CD 管道使用 GitHub Actions 以及 [Control Plane API](/langsmith/api-ref-control-plane) 和 [LangSmith API](/langsmith/smith-api-ref) 来自动化部署。帮助程序脚本管理 API 交互和部署：https://github.com/langchain-ai/cicd-pipeline-example/blob/main/.github/scripts/langgraph_api.py。

工作流程包括：

- **新代理部署**：当打开新 PR 并测试通过时，将使用 [Control Plane API](/langsmith/api-ref-control-plane) 在 LangSmith 部署中创建新的预览部署。这使您可以在升级到生产环境之前在暂存环境中测试代理。- **代理部署修订**：当找到具有相同 ID 的现有部署，或者 PR 合并到主部署时，就会发生修订。在合并到主部署的情况下，预览部署将被删除并创建生产部署。这可确保对代理的任何更新都正确部署并集成到生产基础设施中。

    ![Agent Deployment Revision Workflow](./images/cicd-new-lgp-revision.png)

- **测试和评估工作流程**：除了更传统的测试阶段（单元测试、集成测试、端到端测试等）之外，管道还包括[offline evaluations](/langsmith/evaluation-concepts#offline-evaluations)和[Agent dev server testing](/langsmith/local-dev-testing)，因为您想测试代理的质量。这些评估使用真实场景和数据对代理的性能进行全面评估。

    ![Test with Results Workflow](./images/cicd-test-with-results.png)

    <AccordionGroup>
    <Accordion title="Final Response Evaluation" icon="circle-check">
        根据预期结果评估代理的最终输出。这是最常见的评估类型，用于检查代理的最终响应是否符合质量标准并正确回答用户的问题。
    </Accordion><Accordion title="Single Step Evaluation" icon="player-skip-forward">
        测试 LangGraph 工作流程中的各个步骤或节点。这使您可以单独验证代理逻辑的特定组件，确保每个步骤在测试整个管道之前正确运行。
    </Accordion>

    <Accordion title="Agent Trajectory Evaluation" icon="route">
        分析代理在图表中所采取的完整路径，包括所有中间步骤和决策点。这有助于识别代理工作流程中的瓶颈、不必要的步骤或次优路由。它还评估您的代理是否以正确的顺序或在正确的时间调用了正确的工具。
    </Accordion>

    <Accordion title="Multi-Turn Evaluation" icon="messages">
        测试代理在多个交互中维护上下文的对话流。这对于处理后续问题、澄清或与用户进行扩展对话的代理至关重要。
    </Accordion>
    </AccordionGroup>

    具体测试方法请参见[LangGraph testing documentation](/oss/python/langgraph/test)，离线评估的全面概述请参见[evaluation approaches guide](/langsmith/evaluation-approaches)。

### 先决条件

在设置 CI/CD 管道之前，请确保您拥有：- <Icon icon="robot" /> 人工智能代理应用程序（在本例中使用[LangGraph](/oss/python/langgraph/overview)构建）
- <Icon icon="user" />A[LangSmith account](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-cicd-pipeline-example)
- 部署代理和检索实验结果需要<Icon icon="key" /> A [LangSmith API key](/langsmith/create-account-api-key)
- <Icon icon="settings" /> 在存储库机密中配置的项目特定环境变量（例如，LLM 模型 API 密钥、矢量存储凭证、数据库连接）

<Note>
虽然此示例使用 GitHub，但 CI/CD 管道可与其他 Git 托管平台配合使用，包括 GitLab、Bitbucket 等。
</Note>

## 部署选项

LangSmith支持多种部署方式，具体取决于您的[LangSmith instance is hosted](/langsmith/platform-setup)：

- <Icon icon="cloud" /> **云LangSmith**：直接 GitHub 集成。
- <Icon icon="server" /> **自托管/混合**：基于容器注册表的部署。

部署流程从修改代理实现开始。您的项目中至少必须有一个 [⟦T7⟧](/langsmith/application-structure) 和依赖文件（`requirements.txt` 或 `pyproject.toml`）。使用 `langgraph dev` CLI 工具检查错误 - 修复任何错误；否则，部署到LangSmith部署时就会部署成功。

```mermaid actions={false}
graph TD
    A[Agent Implementation] --> B[langgraph.json + dependencies]
    B --> C[Test Locally with langgraph dev]
    C --> D{Errors?}
    D -->|Yes| E[Fix Issues]
    E --> C
    D -->|No| F[Choose LangSmith Instance]

    F --> G[Cloud LangSmith]
    F --> H[Self-Hosted/Hybrid LangSmith]

    subgraph "Cloud LangSmith"
        G --> I[Method 1: Connect GitHub Repo in UI]
        G --> J[Method 2: Control Plane API with GitHub Repo]
        I --> K[Deploy via LangSmith UI]
        J --> L[Deploy via Control Plane API]
    end

    subgraph "Self-Hosted/Hybrid LangSmith"
        H --> S[Build Docker Image langgraph build]
        S --> T[Push to Container Registry]
        T --> U{Deploy via?}
        U -->|UI| V[Specify Image URI in UI]
        U -->|API| W[Use Control Plane API]
        V --> X[Deploy via LangSmith UI]
        W --> Y[Deploy via Control Plane API]
    end

    K --> AA[Agent Ready for Use]
    L --> AA
    X --> AA
    Y --> AA

    AA --> BB{Connect via?}
    BB -->|LangGraph SDK| CC[Use LangGraph SDK]
    BB -->|RemoteGraph| DD[Use RemoteGraph]
    BB -->|REST API| EE[Use REST API]
    BB -->|LangGraph Studio UI| FF[Use LangGraph Studio UI]

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class A trigger
    class B,C process
    class D,U,BB decision
    class E process
    class F decision
    class G,H process
    class I,J,S,T process
    class K,L,V,W process
    class X,Y,AA output
    class CC,DD,EE,FF output
```

### 手动部署的先决条件

在部署代理之前，请确保您拥有：1. <Icon icon="sitemap" /> **LangGraph 图**：您的代理实现（例如，`./agents/simple_text2sql.py:agent`）。
2. <Icon icon="box" /> **依赖项**：`requirements.txt` 或 `pyproject.toml` 以及所有必需的包。
3. <Icon icon="settings" /> **配置**：`langgraph.json` 文件指定：
   - 代理图的路径
   - 依赖项位置
   - 环境变量
   - Python版本

示例`langgraph.json`：
```json
{
    "graphs": {
        "simple_text2sql": "./agents/simple_text2sql.py:agent"
    },
    "env": ".env",
    "python_version": "3.11",
    "dependencies": ["."],
    "image_distro": "wolfi"
}
```

### 本地开发和测试

![Studio CLI Interface](./images/cicd-studio-cli.png)

首先，使用 [Studio](/langsmith/studio) 在本地测试您的代理：

```bash
# Start local development server with Studio
langgraph dev
```

这将：
- 使用 Studio 启动本地服务器。
- 允许您可视化图表并与之交互。
- 在部署之前验证您的代理是否正常工作。

<Note>
如果您的代理在本地运行没有任何错误，则意味着部署到 LangSmith 可能会成功。此本地测试有助于在尝试部署之前捕获配置问题、依赖性问题和代理逻辑错误。
</Note>

更多详情请参阅[LangGraph CLI documentation](/langsmith/cli#dev)。

### 方法一：LangSmith 部署界面

使用 LangSmith 部署界面部署代理：

1. 前往您的[LangSmith dashboard](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-cicd-pipeline-example)。
2. 导航到 **部署** 部分。
3. 单击右上角的 **+ 新建部署** 按钮。
4. 从下拉菜单中选择包含 LangGraph 代理的 GitHub 存储库。**支持的部署：**
- <Icon icon="cloud" /> **云LangSmith**：与下拉菜单直接集成 GitHub
- <Icon icon="server" /> **自托管/混合 LangSmith**：在图像路径字段中指定您的图像 URI（例如，`docker.io/username/my-agent:latest`）

<Info>
**好处：**
- 简单的基于UI的部署
- 与您的 GitHub 存储库（云）直接集成
- 无需手动 Docker 镜像管理（云）
</Info>

### 方法2：控制平面API

使用控制平面 API 进行部署，针对每种部署类型采用不同的方法：

**对于云LangSmith：**
- 使用控制平面 API 通过指向 GitHub 存储库来创建部署
- 云部署无需构建 Docker 镜像

**对于自托管/混合LangSmith：**
```bash
# Build Docker image
langgraph build -t my-agent:latest

# Push to your container registry
docker push my-agent:latest
```

您可以推送到部署环境有权访问的任何容器注册表（Docker Hub、AWS ECR、Azure ACR、Google GCR 等）。

**支持的部署：**
- <Icon icon="cloud" /> **云LangSmith**：使用控制平面 API 从 GitHub 存储库创建部署
- <Icon icon="server" /> **自托管/混合 LangSmith**：使用控制平面 API 从容器注册表创建部署

更多详情请参阅[LangGraph CLI build documentation](/langsmith/cli#build)。

### 连接到您部署的代理- <Icon icon="code" /> **[LangGraph SDK](https://langchain-ai.github.io/langgraph/cloud/reference/sdk/python_sdk_ref/#langgraph-sdk-python)**：使用LangGraph SDK 进行编程集成。
- <Icon icon="sitemap" /> **[RemoteGraph](/langsmith/use-remote-graph)**：使用 RemoteGraph 进行远程图连接（以在其他图中使用您的图）。
- <Icon icon="globe" /> **[REST API](/langsmith/server-api-ref)**：与部署的代理使用基于 HTTP 的交互。
- <Icon icon="device-desktop" /> **[Studio](/langsmith/studio)**：访问可视化界面进行测试和调试。

### 环境配置

#### 数据库和缓存配置

默认情况下，LangSmith部署会为您创建 PostgreSQL 和 Redis 实例。要使用外部服务，请在新部署或修订中设置以下环境变量：

```bash
# Set environment variables for external services
export POSTGRES_URI_CUSTOM="postgresql://user:pass@host:5432/db"
export REDIS_URI_CUSTOM="redis://host:6379/0"
```

更多详情请参阅[environment variables documentation](/langsmith/env-var-self-hosted)。

## 故障排除

### 错误的 API 端点

如果您遇到连接问题，请验证您是否为 LangSmith 实例使用正确的终端节点格式。有两种不同的 API 具有不同的端点：

#### LangSmith API（痕迹、摄取等）

对于 LangSmith API 操作（跟踪、评估、数据集）：

{/* 通过 `prefix` 更改“.langchain.com”之前的主机名（默认：“api.smith”）。
    传递 `suffix` 将路径（例如“/mcp”）附加到每个 URL。
    传递 `protocol={false}` 来渲染不带“https://”的主机名。 */}<table>
  <thead>
    <tr>
      <th>地区</th>
      <th>{协议===假？ “主机”：“URL”}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GCP 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 欧盟</td>
      <td><code>{`${protocol === false ? "" : "https://"}eu.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 亚太地区</td>
      <td><code>{`${protocol === false ? "" : "https://"}apac.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>AWS 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}aws.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
  </tbody>
</table>

对于自托管 LangSmith 实例，请使用 `http(s)://<langsmith-url>/api`，其中 `<langsmith-url>` 是您的自托管实例 URL。

<Note>
如果您在 `LANGSMITH_ENDPOINT` 环境变量中设置端点，请使用完整的 API URL，不带尾部斜杠（例如，`https://api.smith.langchain.com` 或 `http(s)://<langsmith-url>/api`，如果是自托管）。尾部斜杠可能会导致某些端点出现身份验证错误。
</Note>

#### LangSmith 部署 API（部署）

对于 LangSmith 部署操作（部署、修订）：

{/* 通过 `prefix` 更改“.langchain.com”之前的主机名（默认：“api.smith”）。
    传递 `suffix` 将路径（例如“/mcp”）附加到每个 URL。
    传递 `protocol={false}` 来渲染不带“https://”的主机名。 */}<table>
  <thead>
    <tr>
      <th>地区</th>
      <th>{协议===假？ “主机”：“URL”}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GCP 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 欧盟</td>
      <td><code>{`${protocol === false ? "" : "https://"}eu.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 亚太地区</td>
      <td><code>{`${protocol === false ? "" : "https://"}apac.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>AWS 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}aws.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
  </tbody>
</table>

对于自托管 LangSmith 实例，请使用 `http(s)://<langsmith-url>/api-host`，其中 `<langsmith-url>` 是您的自托管实例 URL。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/cicd-pipeline-example.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>