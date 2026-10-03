<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Comparison with Claude Agent SDK | https://docs.langchain.com/oss/python/deepagents/comparison -->

# 与Claude Agent SDK的比较

将 LangChain Deep Agents 与 Claude Agent SDK 进行比较，为您的用例选择正确的工具。

本页介绍了 [LangChain Deep Agents](/oss/python/deepagents/overview) 与 [Claude Agent SDK](https://platform.anthropic.com/docs/en/agent-sdk/overview) 的比较。两者都是用于构建自定义代理的工具，但它们在执行环境、部署和供应商耦合方面做出了不同的权衡。

<Info>
  Deep Agents 由 [OpenSWE](https://github.com/langchain-ai/open-swe) 和 [LangSmith Fleet](/langsmith/fleet/index) 用于生产。
</Info>

## 概览

| | **Deep Agents** | **克劳德代理SDK** |
| - | - | - |
| **代理运行的位置** |在沙箱内部或沙箱外部远程执行命令 |沙箱内部 |
| **执行后端** |可插拔：[local, virtual filesystem, remote sandbox, or custom](/oss/python/deepagents/backends) |它运行的沙箱的本地文件系统 |
| **模型提供商** |任何（Anthropic、OpenAI、Google、100 多个其他）|克劳德（Anthropic、基岩、顶点、天蓝色）|
| **按提供商/模型调整** | [Harness profiles](/oss/python/deepagents/profiles)（测试版）：系统提示、工具、中间件和子代理调整的声明性捆绑包，按提供商或特定模型注册 |在每个模型调用站点的代码中进行配置 |
| **部署** | LangSmith 中的 [Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)，或通过 [⟦T0⟧](/langsmith/cli#build) 自托管 [standalone image](/langsmith/deploy-standalone-server) | [Self-host](https://code.claude.com/docs/en/agent-sdk/hosting)。您构建服务器、身份验证和流层。 [Claude managed agents](https://platform.claude.com/docs/en/managed-agents/overview) 是一个单独的产品 || **多租户** | [Built-in](/oss/python/deepagents/going-to-production#multi-tenancy)：作用域线程、每用户沙箱、RBAC |自己构建 |
| **许可证** |麻省理工学院 |麻省理工学院（克劳德代码本身是专有的）|

## 主要区别

### 代理和执行环境

有[two patterns for connecting agents to sandboxes](https://www.langchain.com/blog/the-two-patterns-by-which-agents-connect-sandboxes)：在沙箱*内部*运行代理，或者在外部运行代理并**使用沙箱作为工具**。

Claude Agent SDK 仅支持第一种。您的代理在沙箱内运行，并针对沙箱的本地文件系统执行工具。 Anthropic的托管模型[Claude managed agents](https://platform.claude.com/docs/en/managed-agents/overview)使用解耦模型，这反映了生产代理架构的发展方向。

Deep Agents 支持两者，并让您选择 [backend](/oss/python/deepagents/backends#quickstart) 将它们连接在一起。实际上，这意味着您可以：

* 在沙箱内运行代理（与 Claude Agent SDK 模型相同）。
* 在长期容器和[use a remote sandbox as a tool](https://www.langchain.com/blog/the-two-patterns-by-which-agents-connect-sandboxes)中运行代理，通过网络执行命令。
* 交换用于测试的虚拟文件系统，或用于您自己的基础设施的自定义后端。

### 多租户

当您将应用程序投入生产时，通常会将其暴露给许多最终用户，并且必须隔离每个用户的环境。在 Claude Agent SDK 中，SDK 将代理绑定到其沙箱。为了给每个用户一个隔离的执行环境，您必须构建一个 API 包装器，为每个用户启动一个沙箱，跟踪哪个沙箱属于谁，然后将其拆除。

Deep Agents 直接处理此问题：在工具中配置沙箱 [per user or per assistant](/oss/python/deepagents/going-to-production#lifecycle)，其中包含范围线程、运行历史记录和 [RBAC](/oss/python/deepagents/going-to-production#team-access-control-rbac)。如果您使用 [LangSmith Sandbox](/langsmith/sandbox-auth-proxy)，您还可以获得一个开箱即用的身份验证代理，以便最终用户可以从沙箱调用第三方 API，而无需为每个用户配置凭据。

### 生产代理服务器

要向最终用户公开 [self-hosted Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/hosting) 应用程序，您需要编写自己的 HTTP/WebSocket 或 SSE 服务器来调用代理、传回令牌并管理对话线程。该服务器由您构建、操作和保护。

Deep Agents 部署包括开箱即用的 [agent server](/langsmith/agent-server)：流端点、线程管理、运行历史记录、Webhooks 和 [authentication](/langsmith/auth)。

### 托管云或自托管

Claude Agent SDK 部署为[self-hosted](https://code.claude.com/docs/en/agent-sdk/hosting)。 SDK 和 [Claude managed agents](https://platform.claude.com/docs/en/managed-agents/overview) 是独立的产品。针对 SDK 编写的代码不会直接部署到托管产品。Deep Agents 以两种模式运行，您的工具、中间件和子代理在它们之间保持不变：

* **托管：** 使用 LangSmith 中的 [Managed Deep Agents](/langsmith/python/managed-deep-agents-overview) 创建、运行和操作深度代理。托管运行时拥有后端、存储和检查点，因此您可以声明运行时的代理而不是自己编译它，并且系统提示、技能和内存会移至项目文件中。参见[Relationship to Deep Agents](/langsmith/python/managed-deep-agents-overview#relationship-to-deep-agents)。
* **自托管：** 运行 [⟦T1⟧](/langsmith/cli#build) 来生成 [standalone Docker image](/langsmith/deploy-standalone-server)，您可以将其部署到任何地方，而无需更改代理。

<Tip>
  对于跨任何模型提供商工作的托管代理平台，请使用 [LangSmith Fleet](/langsmith/fleet/index)。 [Claude managed agents](https://platform.claude.com/docs/en/managed-agents/overview)仅限于Anthropic生态系统。
</Tip>

### 法学硕士

Claude Agent SDK 执行捆绑了模型、后端和部署，并优化了这三者之间的支持。

使用Deep Agents，您可以独立选择模型提供者、执行后端和部署目标。通过选择此线束，您可以在选择模型和基础设施时保持最大的灵活性。

### 生态系统Claude Agent SDK 专为 Claude 和 Anthropic 的产品界面而构建。 Deep Agents 与更广泛的 LangChain 生态系统集成，包括用于可观察性、评估和部署的 LangSmith，并且适用于任何模型提供商。

## 总结

* **如果您想要模型和基础设施灵活性、内置多租户部署以及使用相同代理代码运行托管或自托管的选项，请选择Deep Agents**。
* **如果您已经投资了 Anthropic 生态系统并希望自行托管和构建 API、身份验证和多租户层，请选择 Claude Agent SDK**。

<Note>
  **注意到一个错误吗？**

  我们于 2026 年 4 月 16 日起草了此比较。如果产品有更改，请[file an issue](https://github.com/langchain-ai/docs/issues)。
</Note>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/comparison.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>