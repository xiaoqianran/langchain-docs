<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Security policy | https://docs.langchain.com/oss/python/security-policy -->

# 安全策略

LangChain 拥有一个与各种外部资源（如本地和远程文件系统、API 和数据库）集成的庞大生态系统。这些集成使开发人员能够创建多功能应用程序，将法学硕士的强大功能与访问、交互和操作外部资源的能力结合起来。

## 最佳实践

在构建此类应用程序时，开发人员应记住遵循良好的安全实践：

* [**Limit permissions**](https://en.wikipedia.org/wiki/Principle_of_least_privilege)：专门针对应用程序需求的权限范围。授予广泛或过多的权限可能会带来严重的安全漏洞。为了避免此类漏洞，请考虑使用只读凭据、禁止访问敏感资源、使用沙箱技术（例如在容器内运行）、指定代理配置来控制外部请求等（根据您的应用程序的情况）。* **预期潜在的滥用**：正如人类可能会犯错一样，大型语言模型 (LLM) 也会犯错。始终假设任何系统访问或凭据都可以以分配的权限允许的任何方式使用。例如，如果一对数据库凭据允许删除数据，则最安全的假设是任何能够使用这些凭据的法学硕士实际上都可以删除数据。
* [**Defense in depth**](https://en.wikipedia.org/wiki/Defense_in_depth_\(computing\))：没有完美的安全技术。微调和良好的链设计可以减少但不能消除大型语言模型（LLM）出错的可能性。最好结合多层安全方法，而不是依赖任何单层防御来确保安全。例如：使用只读权限和沙箱来确保法学硕士只能访问明确供他们使用的数据。

不这样做的风险包括但不限于：

* 数据损坏或丢失。
* 未经授权访问机密信息。
* 关键资源的性能或可用性受到影响。

具有缓解策略的示例场景：* 用户可以要求有权访问文件系统的代理删除不应删除的文件或读取包含敏感信息的文件内容。为了缓解这种情况，请将代理限制为仅使用特定目录，并仅允许其读取或写入可以安全读取或写入的文件。考虑通过在容器中运行代理来进一步沙箱化代理。
* 用户可能会要求对外部 API 具有写入权限的代理将恶意数据写入 API，或从该 API 中删除数据。为了缓解这种情况，请为代理提供只读 API 密钥，或限制其仅使用已经能够防止此类滥用的端点。
* 用户可以要求有权访问数据库的代理删除表或更改架构。为了缓解这种情况，请将凭据范围限制为仅代理需要访问的表，并考虑颁发只读凭据。

如果您正在构建访问文件系统、API 等外部资源的应用程序
或数据库，请考虑与您公司的安全团队交谈以确定如何最好地
设计并保护您的应用程序。

## 报告OSS漏洞请通过以下流程报告与LangChain开源项目相关的安全漏洞：

1. **在存在漏洞的 GitHub 存储库的安全选项卡上提交安全公告**。
2. **发送电子邮件**至`security@langchain.dev`，通知我们您已提交安全问题以及该问题提交到哪个存储库。

在报告漏洞之前，请查看上面的[Best Practices](#best-practices)，了解我们认为的安全漏洞与开发人员责任。

### 错误赏金资格

我们欢迎所有 LangChain 库的安全漏洞报告。但是，我们可能仅针对以下软件包中的漏洞提供临时错误赏金：

* LangChain团队拥有和维护的核心库：`langchain-core`、`langchain`（v1）、`langgraph`以及相关的检查点包（或其JavaScript等效项）
* LangChain团队维护的流行集成（例如`langchain-openai`、`langchain-anthropic`等，或其JavaScript等效项）

该漏洞必须存在于库代码本身中，而不是存在于示例代码或示例应用程序中。我们欢迎所有其他 LangChain 软件包的报告，并将解决有效的安全问题，但对于此范围之外的软件包，不会授予错误赏金。这包括存档的`langchain-community`，由于其社区驱动的性质，它没有资格获得错误赏金，尽管我们将接受并解决报告。

### 超出范围的目标

以下内容超出了安全漏洞报告的范围：

* **langchain-experimental**：此存档存储库用于实验代码，不在安全报告范围内（请参阅[package warning](https://pypi.org/project/langchain-experimental/)）。
* **示例和示例应用程序**：示例代码和演示应用程序不在安全报告的范围内。
* **记录有安全声明的代码**：这将根据具体情况决定，但可能不在范围内，因为代码已经记录了开发人员应遵循的指南，以确保其应用程序安全。
* **LangSmith 相关存储库或 API**：请参阅下面的[Reporting LangSmith Vulnerabilities](#reporting-langsmith-vulnerabilities)。

## 报告 LangSmith 漏洞

请通过电子邮件向 `security@langchain.dev` 报告与 LangSmith 相关的安全漏洞。

* LangSmith 网站：[https://smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-security-policy)
* SDK客户端：[https://github.com/langchain-ai/langsmith-sdk](https://github.com/langchain-ai/langsmith-sdk)

### 其他安全问题如有任何其他安全问题，请通过`security@langchain.dev`联系我们。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/security-policy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>