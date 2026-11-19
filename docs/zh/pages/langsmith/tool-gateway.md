<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tool Gateway | https://docs.langchain.com/langsmith/tool-gateway -->

# 工具网关

为代理和 MCP 客户端提供一个用于工具调用的托管层，凭证存储在LangSmith中，应用于每个调用的策略以及每个调用的可选跟踪。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

工具网关是 LangSmith 中的一个管理层，位于您的代理和它们调用的 MCP 服务器之间。它处理代理进行的工具调用的访问、身份和策略，就像 [LLM Gateway](/langsmith/llm-gateway) 处理模型调用一样。

如果没有网关，每个团队都会在每个代理中构建工具身份验证。令牌最终被硬编码在代理代码中。每个代理都可以访问服务器上的每个工具。没有记录显示哪个工具代表谁运行。工具网关用一个共享设置取代了每个代理的工作：

* **访问**：注册每个 MCP 服务器一次，并连接每个用户或代理的帐户一次。每个代理通过一个 MCP URL 调用一组选定的工具。
* **控制**：设置阻止工具调用或在运行之前需要批准的策略。
* **可见性**：记录每个工具调用的跟踪，显示哪个工具运行以及由谁运行。> [!注意]
>
> 工具网关已在 LangSmith [Plus and Enterprise plans](https://www.langchain.com/pricing) 上可用。它在 GCP 美国、GCP 欧盟、GCP 亚太地区和 AWS 美国区域的LangSmith 云上运行。它在 Azure 美国区域不可用。

## 工具调用的流程

在每次工具调用时，工具网关：

1. 识别呼叫者：用户、代理或配置文件。
2. 如果拒绝策略匹配，则阻止呼叫。
3. 附加调用者存储的服务器凭据，或要求调用者连接。
4. 如果批准策略匹配，则请求呼叫者批准呼叫。
5. 将呼叫转发到 MCP 服务器，并在[tracing](/langsmith/tool-gateway-traces) 打开时记录跟踪。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart LR
    A[Agents and MCP clients] --> I

    subgraph TG[Tool Gateway]
        direction LR
        I[Identify the caller:<br/>user, agent, or profile] --> P{Deny policies}
        P --> T[Attach the stored credential]
        T --> R{Approval policies}
        R --> F[Forward the call]
    end

    C[(Connected accounts)] -.-> T
    F --> S[MCP servers:<br/>built-in, remote, or private]
    F -.-> L[Tool call traces,<br/>when tracing is on]

    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68

    class A trigger
    class I,T,F process
    class P,R decision
    class S,L output
    class C neutral
```

每个设置都有四个概念：* **MCP 服务器**：管理员或用户注册一次的远程 MCP 服务器及其所需的凭据类型。 LangSmith还提供内置服务器来提供常用服务。要访问您自己网络内的服务器，请使用 [tunnel](/langsmith/tunnels)。
* **连接帐户**：工具网关调用服务器时使用的凭据。凭证可以属于您、代理、个人资料或整个工作区。配置文件保存在无人登录的情况下运行的代理的共享凭据。
* **工具包**：来自任意数量服务器的一组精选工具，在一个 MCP URL 上提供服务。工具包决定代理看到哪些工具。要控制调用者可以调用哪些工具，请使用权限和策略。
* **策略**：阻止匹配工具调用或在运行之前需要批准的规则。

有关这些部分如何组合在一起的信息，请参阅[How Tool Gateway works](/langsmith/tool-gateway-how-it-works)。

## 选择您的设置

工具网关支持一些常见的设置。从离你最近的一个开始：* **代表每个用户的代理**：每个最终用户都连接自己的帐户，代理以该用户的身份调用工具。参见[Act as users and agents](/langsmith/tool-gateway-identity)。
* **在无人登录的情况下运行的代理**：管理员通过配置文件或代理自己的凭据连接共享凭据一次，然后代理使用它们调用工具。参见[Connect accounts](/langsmith/tool-gateway-connect-accounts)。
* **平台或安全团队的中央工具治理**：为整个工作区注册服务器，为每个代理提供一个工具包，并为每个工具调用设置[policies](/langsmith/tool-gateway-policies)和[traces](/langsmith/tool-gateway-traces)。
* **适用于您自己的编码代理的工具**：将工具包添加到 Claude Code、Cursor 或具有一个 URL 的另一 MCP 客户端。参见[Connect an MCP client](/langsmith/tool-gateway-clients)。

## 后续步骤

> [卡][Run the quickstart](/langsmith/tool-gateway-quickstart)
>
> 添加两个 MCP 服务器、连接您的帐户、创建工具包并从 MCP 客户端调用其工具。

> [卡片][Learn how it works](/langsmith/tool-gateway-how-it-works)
>
> 了解工具网关如何对调用者进行身份验证、选择凭据、应用策略以及适用的限制。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。