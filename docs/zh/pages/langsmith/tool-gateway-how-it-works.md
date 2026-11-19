<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How Tool Gateway works | https://docs.langchain.com/langsmith/tool-gateway-how-it-works -->

# 工具网关如何工作

了解工具网关如何对调用者进行身份验证、为每个调用选择凭据、在工具包和策略之间划分工作以及适用的限制。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

本页解释了[Tool Gateway](/langsmith/tool-gateway)背后的模型。它涵盖了每个调用如何进行身份验证、使用哪些存储凭据、控制哪些工具包和策略以及适用的限制。在为多个用户或代理计划设置之前，请先阅读本指南。每个部分都链接到包含该过程的页面。

## 三层身份验证

通过工具网关的工具调用涉及三个单独的身份验证步骤。调用者仅向LangSmith进行身份验证。然后，工具网关选择存储的凭证并使用它向 MCP 服务器进行身份验证。因此，调用者永远不会持有服务器的令牌或 API 密钥。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart LR
    C[Agent or MCP client] -->|"1. Caller to gateway:<br/>LangSmith key, session,<br/>or identity provider token"| G[Tool Gateway]
    O[(Connected accounts)] -->|"2. Credential owner:<br/>user, agent, profile,<br/>or workspace"| G
    G -->|"3. Gateway to server:<br/>OAuth token or API key"| S[MCP server]

    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68

    class C trigger
    class G process
    class S output
    class O neutral
```* **呼叫者到网关**：呼叫者向LangSmith证明其身份。它可以使用个人访问令牌、服务密钥、UI 中的 LangSmith 会话或来自身份提供商的令牌。呼叫者还可以说出要使用谁的凭据。参见[Act as users and agents](/langsmith/tool-gateway-identity)。
* **凭证所有者**：工具网关根据调用者的身份来解析调用使用的存储凭证。参见[Credential owners](#credential-owners)和[Connect accounts](/langsmith/tool-gateway-connect-accounts)。
* **服务器网关**：MCP 服务器接收其期望的内容：OAuth 令牌、命名标头中的 API 密钥或公共服务器的任何内容。您可以在添加服务器时声明这一点。参见[Add MCP servers](/langsmith/tool-gateway-servers)。

添加服务器和连接帐户是单独的工作。管理员添加工作区服务器一次并声明其所需的凭据类型，但尚不存在凭据。然后，每个用户、代理或配置文件将其自己的凭据连接到该服务器。

## 凭证所有者

每个存储的凭证都属于一个所有者。所有者决定工具调用在上游服务上运行的帐户。|业主|谁连接它 |当呼叫使用它时 |
| - | - | - |
|用户 |每个用户都有自己的帐户|呼叫充当该用户 |
|代理|管理员，通过[agent auth](/langsmith/agent-auth)获取代理自身身份 |呼叫充当该代理 |
|简介 |管理员一次，作为一组共享凭据 |该调用为在无人登录的情况下运行的代理命名配置文件 |
|工作空间 |工作区管理员，作为工作区服务器的一个 API 密钥 |每次调用该服务器，无论调用者是谁 |

实际上，调用以两种方式之一进行。它充当用户，具有该用户自己的访问权限，或者充当代理，具有代理的凭据或配置文件。一次呼叫使用一个身份。它不能同时充当用户和配置文件。

工作区凭据会覆盖其他凭据。在服务器上设置它会删除该服务器的所有其他所有者的凭据，并且在存储该服务器时，其他所有者都无法连接该服务器。流程请参见[Connect accounts](/langsmith/tool-gateway-connect-accounts)。

### 当凭证丢失时

当所有者未连接时会发生什么取决于是否有人在场登录：* **用户**：调用返回登录链接。支持 MCP URL 诱导的客户端会向用户显示链接。否则，调用将返回 `428` 以及链接。用户连接后，后续调用将使用存储的凭据。
* **代理或个人资料**：调用返回 `409`，因为没有人在场登录。管理员必须先连接凭据，然后代理才能调用该工具。

有关响应以及如何处理它们，请参阅[Call tools](/langsmith/tool-gateway-call-tools)。

## 服务器、工具包和范围

服务器和工具包都有一个范围：

* **工作区**：工作区中的每个人都可以使用它。每个人仍然连接自己的帐户，除非服务器有工作区凭据。
* **个人**：只有创建它的人才能使用它。工作区套件不能包含个人服务器。

工具网关在三种 MCP 端点上提供工具，全部位于 `/v1/managed-tools/` 下：

|端点 |服务 |
| - | - |
| `kits/<kit-id>/mcp` |一套工具集所有工具 |
| `kits/me/mcp` |调用者可以使用的每个工具都基于每个请求 |
| `servers/<server-id>/mcp` |一台服务器上的工具 |

代理通常连接到一个套件。有关如何创建的信息，请参阅[Create tool kits](/langsmith/tool-gateway-tool-kits)。

## 工具包策划，政策执行

工具包和政策回答不同的问题：* **工具包**决定代理看到哪些工具。为每个代理提供一个小工具包，可以保持其工具列表的相关性和工具选择的准确性。套件不是访问控制：同一调用者可以使用`kits/me/mcp`，它为调用者可以使用的所有工具提供服务。
* **策略**决定调用者可以调用什么。工具网关评估每个调用的策略，无论调用使用哪个端点。策略要么拒绝调用，要么需要批准才能运行。

默认情况下允许使用工具。当多个策略与一个呼叫匹配时，拒绝策略优先。批准策略要求使用 MCP 客户端的人员确认呼叫。无法获得单独审阅者的批准。要限制呼叫者可以执行的操作，请使用策略，而不是工具包。参见[Set policies](/langsmith/tool-gateway-policies)。

## 痕迹

工具网关可以记录每个工具调用的跟踪。跟踪记录有关调用的元数据，例如工具、服务器及其运行的身份。它不记录发送到工具或由工具返回的数据。参见[Traces and audit log](/langsmith/tool-gateway-traces)。

## 限制

这些限制适用于每个工具调用：* **请求大小**：1 MB。
* **响应大小**：8 MB。
* **上行超时**：MCP 服务器开始响应的时间为 60 秒。
* **每个套件的工具**：10,000。
* **速率限制**：每秒 100 个请求，突发最多 1,000 个。

## 已知限制

在测试版中，工具网关有以下限制：

* **仅通过 HTTPS 的远程服务器**：工具网关连接到使用通过 HTTPS 的 Streamable HTTP 的 MCP 服务器。要访问您自己网络内的服务器，请使用 [tunnel](/langsmith/tunnels)。
* **工具输出不受信任**：工具网关将每个服务器的响应不变地传递给调用者。将工具输出视为代理的不可信输入。
* **每个呼叫一个身份**：一次呼叫充当一个用户、代理或配置文件。
* **身份提供者令牌到达整个工作区**：仅通过身份提供者令牌进行身份验证的调用者可以到达工作区中的任何服务器或套件。使用策略来限制这些调用者可以调用的内容。
* **无使用情况仪表板**：要查看工具使用情况，请使用 [traces and the audit log](/langsmith/tool-gateway-traces)。

## 另请参阅

* [Tool Gateway quickstart](/langsmith/tool-gateway-quickstart)
* [Act as users and agents](/langsmith/tool-gateway-identity)
* [Connect accounts](/langsmith/tool-gateway-connect-accounts)
* [Set policies](/langsmith/tool-gateway-policies)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-how-it-works.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。