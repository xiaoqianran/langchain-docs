<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Implement a LangChain integration | https://docs.langchain.com/oss/python/contributing/implement-langchain -->

# 实现LangChain集成

集成包是用户可以安装以在其项目中使用的 Python 包。他们实现了一个或多个符合 LangChain 接口标准的组件。

LangChain组件是[⟦T2⟧](https://github.com/langchain-ai/langchain/tree/master/libs/core)中基类的子类。示例包括 [chat models](/oss/python/integrations/chat)、[tools](/oss/python/integrations/tools)、[retrievers](/oss/python/integrations/retrievers) 等。

您的集成包通常会实现至少其中一个组件的子类。展开下面的选项卡可查看每个选项卡的详细信息。

<Tabs>
  <Tab title="Chat Models">
    聊天模型是 [⟦T3⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel) 类的子类。它们实现了生成聊天完成、处理消息格式和管理模型参数的方法。

    <Warning>
      聊天模型集成指南目前正在开发中。同时，请阅读[chat model conceptual guide](/oss/python/langchain/models)了解LangChain聊天模型如何运作的详细信息。您还可以参考[LangChain repo](https://github.com/langchain-ai/langchain/tree/master/libs/partners)中的现有集成
    </Warning>
  </Tab>

  <Tab title="Embeddings">
    嵌入模型是 [⟦T4⟧](https://reference.langchain.com/python/langchain-core/embeddings/embeddings/Embeddings) 类的子类。

    <Warning>
      嵌入模型集成指南目前正在开发中。同时，请阅读[embedding model conceptual guide](/oss/python/integrations/embeddings)了解LangChain嵌入模型如何运作的详细信息。
    </Warning>
  </Tab>

  <Tab title="Tools">
    工具的使用主要有两种方式：1. 定义“输入模式”或“参数模式”以与文本请求一起传递到聊天模型的工具调用功能，以便聊天模型可以生成“工具调用”或用于调用工具的参数。
    2. 进行上面生成的“工具调用”，并采取一些操作并返回一个响应，该响应可以作为 ToolMessage 传递回聊天模型。

    Tools 类必须继承自 [⟦T5⟧](https://reference.langchain.com/python/langchain-core/tools/base/BaseTool) 基类。该接口有 3 个属性和 2 个方法，应在子类中实现。

    <Warning>
      工具集成指南目前正在开发中。同时，请阅读[tools conceptual guide](/oss/python/langchain/tools)详细了解LangChain工具的功能。
    </Warning>
  </Tab>

  <Tab title="Middleware">
    [Middleware](/oss/python/langchain/middleware/overview) 允许您通过挂钩模型调用、工具调用和代理生命周期事件来自定义代理行为。中间件类是 [⟦T6⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/AgentMiddleware) 基类的子类。

    在构建集成之前，请阅读 [custom middleware guide](/oss/python/langchain/middleware/custom) 了解挂钩、状态更新和中间件模式。

    中间件集成通常分为两类：|类型 |描述 |示例 |
    | -------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
    | **特定于提供商** |利用提供商的独特能力 |提示缓存、本机工具执行、内容审核 |
    | **跨提供商** |适用于任何模型或工具 |速率限制、PII 检测、日志记录、护栏 |

    特定于提供商的中间件位于提供商的集成包中（例如`langchain-anthropic`）。跨提供商中间件可以作为独立包发布。

    您还可以使用这些现有的中间件集成作为参考：

    <CardGroup>
      <Card title="OpenAI content moderation" icon="shield" href="/oss/python/integrations/middleware/openai">
        具有配置选项和退出行为的单一中间件。
      </Card>

      <Card title="Anthropic middleware" icon="robot" href="/oss/python/integrations/middleware/anthropic">
        用于提示缓存、工具、内存和文件搜索的多个中间件类。
      </Card>

      <Card title="AWS prompt caching" icon="cloud" href="/oss/python/integrations/middleware/aws">
        具有模型行为表的特定于提供者的提示缓存。
      </Card><Card title="Custom middleware guide" icon="code" href="/oss/python/langchain/middleware/custom">
        有关挂钩、状态更新和模式的完整参考。
      </Card>
    </CardGroup>
  </Tab>

  <Tab title="Checkpointers">
    检查点在 LangGraph 中启用[persistence](/oss/python/langgraph/persistence)，允许代理在交互中保存和恢复状态。

    请参阅 [LangGraph repo](https://github.com/langchain-ai/langgraph/tree/main/libs) 中现有的检查点集成以获取实施示例。
  </Tab>

  <Tab title="Sandboxes">
    沙盒集成使 [Deep Agents](/oss/python/deepagents/overview) 能够在隔离环境中运行代码。

    实施 Deep Agents 的[⟦T8⟧](https://reference.langchain.com/python/deepagents/backends/protocol/SandboxBackendProtocol)。该协议包括`execute()`、异步变体以及`ls`、`read`、`write`、`edit`、`glob`和`grep`等文件系统工具方法。

    实际上，如果您的沙箱环境可以运行 shell 命令并且有 `python3` 可用，则通常应该子类化 [⟦T17⟧](https://reference.langchain.com/python/deepagents/backends/sandbox/BaseSandbox)。 `BaseSandbox`通过`python3`提供文件系统操作，因此主要需要实现`execute()`、`upload_files()`、`download_files()`、`id`。

    ```python Example BaseSandbox scaffold expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from __future__ import annotations

    from deepagents.backends.protocol import (
        ExecuteResponse,
        FileDownloadResponse,
        FileUploadResponse,
    )
    from deepagents.backends.sandbox import BaseSandbox  # [!code highlight]


    class MySandbox(BaseSandbox):
        def __init__(self, client: MySandboxSdkClient) -> None:
            self._client = client

        @property
        def id(self) -> str:
            return self._client.sandbox_id

        def execute(
            self,
            command: str,
            *,
            timeout: int | None = None,
        ) -> ExecuteResponse:
            # Execute `command` in your sandbox and map the provider response
            # into ExecuteResponse.
            result = self._client.run(command=command, timeout=timeout)
            output = result.stdout or ""
            if result.stderr:
                output += f"\n<stderr>{result.stderr}</stderr>"
            return ExecuteResponse(
                output=output,
                exit_code=result.exit_code,
                truncated=False,
            )

        def upload_files(
            self,
            files: list[tuple[str, bytes]],
        ) -> list[FileUploadResponse]:
            # Validate paths, batch requests where possible, and map provider
            # results back into FileUploadResponse objects in input order.
            # Only catch and normalize errors that an LLM can plausibly retry
            # or fix, such as invalid_path or file_not_found.
            return self._client.upload_files(files)

        def download_files(self, paths: list[str]) -> list[FileDownloadResponse]:
            # Validate paths, batch requests where possible, and map provider
            # results back into FileDownloadResponse objects in input order.
            # Only catch and normalize errors that an LLM can plausibly retry
            # or fix, such as invalid_path or file_not_found.
            return self._client.download_files(paths)

        async def aexecute(
            self,
            command: str,
            *,
            timeout: int | None = None,
        ) -> ExecuteResponse:
            ...

        async def aupload_files(
            self,
            files: list[tuple[str, bytes]],
        ) -> list[FileUploadResponse]:
            ...

        async def adownload_files(
            self,
            paths: list[str],
        ) -> list[FileDownloadResponse]:
            ...
    ```

    ## 测试您的集成

    验证您与[sandbox standard test suite](/oss/python/contributing/standard-tests-langchain#sandbox-integrations)的集成。 Python套件使用`langchain_tests.integration_tests`中的`SandboxIntegrationTests`；对其进行子类化并提供一个 `sandbox` 固定装置，以生成一个干净的 `SandboxBackendProtocol` 实例。

    ```python Example sandbox standard test setup expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from __future__ import annotations

    from collections.abc import Iterator

    import pytest
    from deepagents.backends.protocol import SandboxBackendProtocol
    from langchain_tests.integration_tests import SandboxIntegrationTests

    from langchain_myprovider import MySandbox
    from myprovider_sdk import MySandboxSdkClient


    class TestMySandboxStandard(SandboxIntegrationTests):
        @pytest.fixture(scope="class")
        def sandbox(self) -> Iterator[SandboxBackendProtocol]:
            client = MySandboxSdkClient()
            backend = MySandbox(client=client)
            try:
                yield backend
            finally:
                # Replace this with your provider's cleanup logic.
                client.delete_sandbox(backend.id)
    ```

    将其放入诸如 `tests/integration_tests/test_sandbox.py` 之类的文件中。标准套件将为您处理实际的文件系统和命令执行断言。**参考实现：**参见[Daytona partner integration](https://github.com/langchain-ai/deepagents/tree/main/libs/partners/daytona)，它是`BaseSandbox`的子类并实现`execute()`、`upload_files()`、`download_files()`和`id`。
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/implement-langchain.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>