<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Validate fixes automatically | https://docs.langchain.com/langsmith/engine-fix-validation -->

# 自动验证修复

通过重播问题的跟踪，确认 LangSmith 引擎问题在您的部署中重现，并且引擎的修复解决了该问题。

> [!注意]
>
> 修复验证是私人的[beta](/langsmith/release-stages#beta)。它仅适用于已启用它的组织的LangSmith 云。它仅支持在 [LangSmith Cloud deployments](/langsmith/deploy-to-cloud) 上运行的代理，而不支持外部托管的代理。要请求访问，[join the waitlist](https://www.langchain.com/langsmith-engine-v2-new-feature-access)。

引擎通过运行代理来验证问题和修复：

* 为了验证问题，引擎会根据配置的基线部署重播其链接跟踪，以确认问题是否重现。
* 为了验证修复，引擎会根据引擎建议的修复构建的预览部署重放相同的跟踪。

引擎将每个验证记录为从问题跟踪构建的数据集上的[experiment](/langsmith/evaluation-concepts#experiment)，因此您可以逐个跟踪比较基线和修复跟踪。

## 设置基线部署

基线部署是部署引擎重放问题跟踪的依据。 [Red Teaming](/langsmith/engine-red-teaming) 将其探测器发送到同一部署。它必须是同一工作区中代理的现成非预览版[LangSmith Cloud deployment](/langsmith/deploy-to-cloud)，选择它需要在该部署上使用`deployments:update`。

设置基线部署：1. 在**引擎**页面，选择追踪项目，然后单击**配置引擎**。
2. 在 **部署** 部分中，找到 **基准部署** 字段。
3. 搜索部署，或粘贴其 LangSmith URL 或部署 ID。无法从列表中选择预览部署和未准备就绪的部署。基线可以是生产或暂存部署，但应尽可能使用暂存，以便验证不会执行生产凭证和服务。
4. 单击“**保存**”。

### 使用您的部署进行身份验证

默认情况下，引擎使用 LangSmith 凭证调用您的部署，并且部署将调用者视为 Studio 用户。接受 LangSmith 平台身份验证的部署无需进一步设置。

如果您的部署对调用者本身进行身份验证，请为引擎提供它期望的标头：

1. 在 **部署** 部分的 **部署身份验证** 下，单击 **添加自定义标头**。
2. 输入部署所需的每个标头，然后单击 **保存**。
3. 在部署的身份验证处理程序中，将这些标头映射到访问验证需求最少的身份。标头值已加密且只写：LangSmith 仅显示它们的名称，因此替换它们意味着再次输入每个值。 LangSmith 自行管理的标头无法被覆盖。要恢复默认设置，请单击“**使用平台身份验证**”。

> [!注意]
>
> 自定义标头仅决定您的部署是否接受请求。他们不会告诉您的代理运行是一次验证重播，这是[Make replayed runs side-effect free](#make-replayed-runs-side-effect-free)中描述的单独信号。

## 设置修复验证

要让引擎针对预览部署验证其自身的修复：1. [Set the baseline deployment](#set-the-baseline-deployment)。
2. [Connect the GitHub repository](/langsmith/engine-repositories) 发动机应修改。引擎在那里以拉取请求的形式打开其修复。在存储库设置中，选择引擎修复的基本分支，或将其留空以使用存储库的默认分支。
3. 基线部署上的[Enable preview builds](/langsmith/preview-builds#enable-preview-builds)，由标签触发。使用以下启动配置：
   * 将 **预览基础分支** 设置为为引擎配置的相同分支。
   * 选择**仅标签**并将**触发标签**设置为`preview`。引擎将此标签应用于其修复拉取请求。
   * 将**空闲 TTL** 设置为 6 小时。
   * 将 **最大并发预览** 设置为 20。
4. 在 **配置引擎** 的 **部署** 部分中，选择 **使用预览部署验证修复**。
5. 单击**保存**。

通过此设置，引擎应用预览标签，等待 LangSmith 根据建议的修复构建临时部署，重播针对它的验证，并显示问题的结论和重播跟踪。> [!警告]
>
> 验证将问题跟踪的输入发送到基线部署，并在验证修复时发送到预览部署。每次重播都会在该部署上创建一个线程和运行，并且您的代理可以在响应时调用其工具。
>
> [Preview deployments inherit the baseline deployment's secrets](/langsmith/preview-builds#manage-secrets) 当 LangSmith 创建它们时。在启用修复验证之前，请确认每个继承的机密都适合临时部署。对基线机密的更改不会传播到已存在的预览。

## 准备一个部署来测试

引擎通过运行代理来确认问题，因此您选择的部署必须是可以重复执行而不会产生任何后果的部署。

### 使用可以安全执行的部署

选择一种部署来镜像您要测试的代理的配置，但该部署不是为您的用户提供服务的部署。将其指向代理写入的任何服务的测试凭据、测试帐户和非生产数据存储。

### 使重播运行没有副作用引擎在每次重放时都会设置`config.configurable.__engine_validation_replay__ = true`，以便您的代理可以识别重放并做出更保守的响应。在HTTP边界，验证请求还包括`X-LangSmith-Source: engine`。在图形代码中使用可配置标记，在请求中间件中使用标头。

使用标记可以跳过或阻止对代理产生影响的工具，例如发送电子邮件或消息、向客户收费、提交票据、写入生产数据存储、安排工作以及调用合作伙伴 API。

> **复制粘贴白名单中间件**
>
> 将以下中间件添加到您的代理项目中：
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from __future__ import annotations
>
> from collections.abc import Awaitable, Callable, Collection, Mapping
> from typing import Any, cast
>
> from langchain.agents.middleware import AgentMiddleware
> from langchain.messages import ToolMessage
> from langchain.tools.tool_node import ToolCallRequest
> from langchain_core.runnables import RunnableConfig
> from langgraph.types import Command
>
> ENGINE_VALIDATION_CONFIG_KEY = "__engine_validation_replay__"
> LANGGRAPH_AUTH_USER_ID_CONFIG_KEY = "langgraph_auth_user_id"
>
>
> def _configurable(config: RunnableConfig | None) -> Mapping[str, object]:
>     configurable = (config or {}).get("configurable")
>     return configurable if isinstance(configurable, Mapping) else {}
>
>
> def is_engine_validation(config: RunnableConfig | None) -> bool:
>     """Return whether the caller requested reduced-privilege validation mode."""
>     return _configurable(config).get(ENGINE_VALIDATION_CONFIG_KEY) is True
>
>
> def is_trusted_engine_validation(
>     config: RunnableConfig | None,
>     *,
>     expected_user_id: str,
> ) -> bool:
>     """Verify the validation marker and authenticated Engine identity."""
>     configurable = _configurable(config)
>     return (
>         bool(expected_user_id)
>         and configurable.get(ENGINE_VALIDATION_CONFIG_KEY) is True
>         and configurable.get(LANGGRAPH_AUTH_USER_ID_CONFIG_KEY) == expected_user_id
>     )
>
>
> def _request_config(request: ToolCallRequest) -> RunnableConfig | None:
>     runtime = getattr(request, "runtime", None)
>     config = getattr(runtime, "config", None)
>     return cast(RunnableConfig, config) if isinstance(config, dict) else None
>
>
> class EngineValidationSafetyMiddleware(AgentMiddleware):
>     """Allow only explicitly safe tools during Engine validation."""
>
>     def __init__(self, *, safe_tools: Collection[str]) -> None:
>         self._safe_tools = frozenset(safe_tools)
>
>     def _rejection(self, request: ToolCallRequest) -> ToolMessage | None:
>         if not is_engine_validation(_request_config(request)):
>             return None
>         call = request.tool_call
>         name = call.get("name") or "tool"
>         if name in self._safe_tools:
>             return None
>         return ToolMessage(
>             content=f"{name} is blocked during Engine validation.",
>             tool_call_id=call["id"],
>             name=name,
>             status="error",
>         )
>
>     def wrap_tool_call(
>         self,
>         request: ToolCallRequest,
>         handler: Callable[[ToolCallRequest], ToolMessage | Command[Any]],
>     ) -> ToolMessage | Command[Any]:
>         rejection = self._rejection(request)
>         return rejection if rejection is not None else handler(request)
>
>     async def awrap_tool_call(
>         self,
>         request: ToolCallRequest,
>         handler: Callable[
>             [ToolCallRequest],
>             Awaitable[ToolMessage | Command[Any]],
>         ],
>     ) -> ToolMessage | Command[Any]:
>         rejection = self._rejection(request)
>         return rejection if rejection is not None else await handler(request)
> ```
>
> 在每次运行时注册它并仅允许只读和隔离的工具：
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain.agents import create_agent
>
> from engine_validation import EngineValidationSafetyMiddleware
>
> agent = create_agent(
>     model=model,
>     tools=[search_catalog, lookup_order, send_message],
>     middleware=[
>         EngineValidationSafetyMiddleware(
>             safe_tools={"search_catalog", "lookup_order"},
>         )
>     ],
> )
> ```
>
> 如果没有重播标记，中间件将不加修改地传递工具调用。在验证期间，它仅调用 `safe_tools` 中的工具，并为所有其他工具返回错误 `ToolMessage`。空的允许列表会阻止所有工具。

仅允许只读和隔离的工具。不允许使用工具发送消息、传递通知、安排或排队工作、保留数据或写入外部系统。> [!警告]
>
> 将标记和源标头视为不可信提示，这只会减少运行可能执行的操作。任何可以到达您的部署的内容都可以设置它们，因此切勿使用它们来授予访问权限、跳过身份验证或扩大权限。

#### 验证可信引擎上下文

重播标记不是身份证明，因为任何调用者都可以设置可配置值。如果您的部署在验证期间重建用户上下文或访问受保护的数据，请首先验证经过身份验证的引擎身份：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
if is_trusted_engine_validation(
    config,
    expected_user_id=settings.engine_user_id,
):
    context = load_context_from_checkpoint()
```

从经过身份验证的运行时配置和复制的检查点读取身份和应用程序上下文。不要从重播输入或元数据中读取它们。

对于使用 [custom authentication](/langsmith/custom-auth) 的部署，在应用相同的检查之前，将经过身份验证的引擎服务主体映射到身份验证处理程序中的 `langgraph_auth_user_id`。身份验证标头建立调用者身份，而重播标记则激活降低权限的工具策略。

### 预计流量激增引擎会同时重播问题的跟踪，因此验证一次最多可以启动五次运行，并且每一次运行直至完成。修复验证针对预览部署重复相同的设置。确认部署的速率限制、配额及其调用的任何下游服务能够容忍该突发。

### 保持部署可用

引擎只能针对准备好的非预览部署进行重放，并记录生成每个结果的部署和修订。在验证过程中保持部署运行，并期望结果描述引擎测试时处于活动状态的修订版。

## 测试一个问题

设置基线部署后，引擎会在创建问题时自动验证每个新问题。要再次验证问题，请打开它并单击“**测试问题**”。

当未设置基线部署、问题没有链接跟踪或达到每月 LSU 支出限制时，**测试问题**不可用。

对于每个验证，引擎：1. 按照链接顺序选择最多五个与问题链接的不同跟踪。
2. 根据基线部署重放每个跟踪的输入。对于来自多轮线程的跟踪，引擎包含对话的较早轮次，因此在相同的上下文中判断后续失败。
3. 判断每次重播是否再次显示该问题所报告的行为。每个跟踪都是**已再现**、**未再现**或**不确定**。

当至少一条痕迹重现时，整个问题就会重现。仅当每次重播完成而没有报告的行为时，才不会再现它。否则，结果是不确定的。当验证未重现未解决的问题时，引擎会关闭该问题。

## 验证修复

当选择**使用预览部署验证修复**时，引擎会验证它生成的每个修复：1. 修复运行完成后，引擎会打开修复的拉取请求（如果尚未打开），然后向其中添加预览构建标签。
2. LangSmith 根据拉取请求构建预览部署。
3. 当预览版本上线时，引擎会根据预览部署重播问题验证的跟踪。
4. 如果预览中仍然出现问题，引擎会修改同一拉取请求的修复并再次验证，总共最多尝试三次。

## 读取验证结果

每个问题都会报告一个基线结果，一旦存在修复，就会报告一个验证结果。

基准结果回答了您的部署中是否仍然出现问题：

|状态 |意义|
| - | - |
| **等待测试** |引擎尚未记录基线结果。 |
| **转载** |至少一次重播再次显示了所报道的行为。 |
| **未转载** |每次重播结束时都没有报告的行为，因此引擎解决了一个未解决的问题。 |
| **不确定** |引擎无法自信地判断重播。 |
| **错误** |验证无法完成。 |

验证结果回答引擎的修复是否解决了该问题：|状态 |意义|
| - | - |
| **未运行** |该问题没有重现，因此无法验证。 |
| **正在生成修复**或**等待修复** |引擎仍在生成修复程序以进行验证。 |
| **等待预览**或**运行** |正在构建预览部署，或正在进行重播。 |
| **已验证** |该问题在修复的预览部署中不再出现。 |
| **未修复** |问题仍然存在，因此引擎修改了修复并重试。 |
| **不确定**、**超时**或**错误** | Engine 无法对此尝试做出判断。 |

> [!警告]
>
> **不确定**意味着引擎无法收集可靠的证据，而不是问题不存在或已修复。将其视为重新测试的信号，而不是作为通过的结果。

## 回顾验证实验

引擎将每个问题的验证证据存储在您的工作区中：

* **数据集**：每个问题一个，描述为 `Engine validation evidence`，每个重播跟踪有一个示例。
* **基线实验**：针对基线部署的重播。
* **修复实验**：针对修复的预览部署进行重播，每次验证尝试进行一个实验。引擎将其对每个结论性重播的判决记录为密钥`engine_issue_validation`的反馈。值为`reproduced`或`not_reproduced`，反馈评论解释了判决结果。

当引擎根据预览部署验证修复时，问题的 **证据** 部分显示总体结论和每条跟踪一行：

* **标记的跟踪**：引擎在原始跟踪中看到的内容。单击“**原始轨迹**”将其打开。
* **在产品上复制**：基线结果，**复制**，**未复制**，或**不确定**。单击 **Repro Trace** 打开重播。
* **PR #\<number>** 之后：修复预览的结果，**修复已验证**、**重复发生**或 **不确定**。单击跟踪链接可打开重播。

每个列标题都会计算在基线上重现的跟踪数或通过修复解决的跟踪数。单击 **查看实验** 以打开基线并在数据集的比较视图中并排修复实验。欲了解更多信息，请参阅[Compare experiment results](/langsmith/compare-experiment-results)。

在修复验证运行之前，问题会显示验证摘要：基线结果、修复的验证状态以及每个重播示例的链接。

## 验证疑难解答如果问题仍处于“等待测试”状态，或者返回的结果不确定，请在再次测试之前检查以下内容：

* **基线部署**：确认它仍然准备就绪，不是预览版，并且与跟踪项目位于同一工作区。
* **身份验证**：如果您的部署对调用者本身进行身份验证，请确认保存的标头是最新的。替换凭证需要重新输入每个标头值。
* **重播本身**：从问题的 **证据** 部分或验证摘要中打开重播的运行，并阅读您的代理返回的内容。
* **部署限制**：查找并发重放导致的速率限制、配额耗尽或超时，以及引擎可能无法判断的非常大的响应。
* **受限工具**：如果您的代理在重放期间阻止工具，请确认存根工具仍返回可用的结果，而不是结束运行的错误。

更正部署或其设置后，打开问题并单击“**测试问题**”以再次运行验证。

## 另请参阅* [Find and fix issues](/langsmith/engine-issues)：查看引擎验证的问题。
* [Red Teaming](/langsmith/engine-red-teaming)：使用合成请求探测相同的基线部署。
* [Preview builds](/langsmith/preview-builds)：创建预览部署引擎验证修复。
* [Compare experiment results](/langsmith/compare-experiment-results)：比较基线并并排修复实验。
* [Engine security](/langsmith/engine-security)：查看引擎如何访问您的跟踪、部署和存储库。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-fix-validation.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。