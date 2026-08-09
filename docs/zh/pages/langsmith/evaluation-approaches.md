<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Application-specific evaluation approaches | https://docs.langchain.com/langsmith/evaluation-approaches -->

# 针对具体应用的评估方法

下面，我们将讨论几种流行的法学硕士申请类型的评估。

## 代理

[LLM-powered autonomous agents](https://lilianweng.github.io/posts/2023-06-23-agent/) 结合了三个组件（1）工具调用，（2）内存，以及（3）规划。代理[use tool calling](https://docs.langchain.com/oss/python/langchain/tools)具有计划（例如，通常通过提示）和记忆（例如，通常是短期消息历史记录）来生成响应。 [Tool calling](https://docs.langchain.com/oss/python/langchain/tools) 允许模型通过生成两件事来响应给定的提示：(1) 要调用的工具和 (2) 所需的输入参数。

<img alt="Tool use" />

下面是[LangGraph](https://langchain-ai.github.io/langgraph/tutorials/introduction/)中的工具调用代理。 `assistant node` 是一个 LLM，它根据输入确定是否调用工具。 `tool condition` 查看`assistant node` 是否选择了工具，如果是，则路由至 `tool node`。 `tool node` 执行该工具并将输出作为工具消息返回到`assistant node`。只要`assistant node`选择了一个工具，这个循环就会继续。如果未选择任何工具，则代理直接返回 LLM 响应。

<img alt="Agent" />

这设置了用户经常感兴趣的三种一般类型的代理评估：* `Final Response`：评估代理的最终响应。
* `Single step`：单独评估任何代理步骤（例如，它是否选择了适当的工具）。
* `Trajectory`：评估智能体是否采取了预期的路径（例如，工具调用）来得出最终答案。

<img alt="Agent-eval" />

以下部分介绍了这些是什么、每个组件所需的组件（输入、输出、评估器）以及何时应考虑这一点。常见用例通常使用多种或所有这些类型的评估；它们并不相互排斥。

### 评估代理的最终响应

评估代理的一种方法是评估其在任务上的整体表现。这基本上涉及将代理视为黑匣子并简单地评估它是否完成工作。

输入应该是用户输入和（可选）工具列表。在某些情况下，工具被硬编码为代理的一部分，不需要传入。在其他情况下，代理更通用，这意味着它没有一组固定的工具，并且需要在运行时传入工具。

输出应该是代理的最终响应。评估员根据您要求代理执行的任务而有所不同。许多代理执行一组相对复杂的步骤，然后输出最终的文本响应。与 RAG 类似，LLM 法官评估员在这些情况下通常可以有效地进行评估，因为他们可以直接从文本响应中评估代理是否完成了工作。

然而，这种类型的评估有几个缺点。首先，通常需要一段时间才能运行。其次，您不会评估代理内部发生的任何事情，因此发生故障时可能很难进行调试。第三，有时很难定义适当的评估指标。

### 评估代理的单个步骤

代理通常执行多个操作。虽然端到端评估它们很有用，但评估这些单独的操作也很有用。这通常涉及评估代理的单个步骤 - LLM 调用，决定要做什么。

输入应该是单个步骤的输入。根据您正在测试的内容，这可能只是原始用户输入（例如提示和/或一组工具），也可能包括之前完成的步骤。输出只是该步骤的输出，通常是 LLM 响应。 LLM 响应通常包含工具调用，指示代理下一步应采取的操作。

对此的评估器通常是一些二进制分数，用于判断是否选择了正确的工具调用，以及一些启发式工具，用于判断工具的输入是否正确。参考工具可以简单地指定为字符串。

这种类型的评估有几个好处。它允许您评估各个操作，从而让您可以找出应用程序可能失败的地方。它们的运行速度也相对较快（因为它们只涉及单个 LLM 调用），并且评估通常使用所选工具相对于参考工具的简单启发式评估。一个缺点是它们无法捕获完整的代理 - 仅捕获一个特定步骤。另一个缺点是数据集创建可能具有挑战性，特别是如果您想在代理输入中包含过去的历史记录。为代理轨迹中早期的步骤生成数​​据集非常容易（例如，这可能仅包括输入提示），但为轨迹中稍后的步骤生成数​​据集可能很困难（例如，包括uding 大量先前的代理操作和响应）。

### 评估智能体的轨迹

评估智能体的轨迹涉及评估智能体采取的所有步骤。

输入再次是整个代理的输入（用户输入，以及可选的工具列表）。

输出是工具调用的列表，可以将其表示为“精确”轨迹（例如，预期的工具调用序列）或简单的一组预期的工具调用（以任何顺序）。

这里的评估器是对所采取的步骤的某种函数。评估“精确”轨迹可以使用单个二进制分数来确认序列中每个工具名称的精确匹配。这很简单，但有一些缺陷。有时可能有多个正确路径。该评估也没有捕捉到偏离一步的轨迹与完全错误的轨迹之间的区别。

为了解决这些缺陷，评估指标可以集中于所采取的“不正确”步骤的数量，这可以更好地解释接近的轨迹与明显偏离的轨迹。评估指标还可以关注是否以任何顺序调用所有预期工具。然而，这些方法都没有评估工具的输入；他们只关注所选的工具。为了解决这个问题，另一种评估技术是将完整代理的轨迹（以及参考轨迹）作为一组消息（例如，所有 LLM 响应和工具调用）传递给作为法官的 LLM。这可以评估代理的完整行为，但它是编译时最具挑战性的参考。这就是使用 LangGraph 这样的框架可以提供帮助的地方。另一个缺点是评估指标可能有点难以提出。

## 评估 RAG 应用程序

[Retrieval-augmented generation (RAG)](https://github.com/langchain-ai/rag-from-scratch) 检索用户输入的文档并将其传递给模型，以便响应可以使用外部知识。有关分步演练，请参阅 [Evaluate a RAG application](/langsmith/evaluate-rag-tutorial)。

### 选择一个数据集

当您评估 RAG 应用程序时，首先要确定每个示例是否有参考答案：

* **带有参考答案**：使用它们作为基本事实来对答案的正确性进行评分。
* **没有参考答案**：使用无参考提示来检查文档相关性、答案的真实性和有用性（请参阅[RAG evaluation summary](#rag-evaluation-summary)）。

### 选择评估者法学硕士作为法官评估员非常适合 RAG，因为他们可以对文本之间的事实准确性和一致性进行评分。

<img alt="rag-types.png" />

您可以使用两种评估器：

* **基于参考**：将生成的答案或检索到的文档与参考答案或参考检索进行比较。
* **无参考**：运行不需要参考答案的自我一致性检查（上图中的橙色、绿色和红色）。

### 选择评估模式

* **离线**：当提示需要参考答案时使用，最常见的是为了答案的正确性。
* **在线**：用于无参考提示，以便您可以获得实时流量。
* **成对**：根据格式或风格等标准比较不同 RAG 链的答案。请使用自我一致性或参考答案来确保正确性。

### RAG评测总结|评估者|详情 |需要参考输出 | LLM作为法官？                                                                         |成对相关 |
| ------------------- | ------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- | ----------------- |
|文档相关性 |文件与问题相关吗？           |没有 |是的 - [prompt](https://smith.langchain.com/hub/langchain-ai/rag-document-relevance) |没有 |
|回答忠实 |答案是否以文件为依据？          |没有 |是的 - [prompt](https://smith.langchain.com/hub/langchain-ai/rag-answer-hallucination) |没有 |
|回答有用 |答案有助于解决问题吗？        |没有 |是的 - [prompt](https://smith.langchain.com/hub/langchain-ai/rag-answer-helpfulness) |没有 |
|答案正确性 |答案与参考答案一致吗？ |是的 |是的 - [prompt](https://smith.langchain.com/hub/langchain-ai/rag-answer-vs-reference) |没有 |
|成对比较|多个答案版本如何比较？          |没有 |是的 - [prompt](https://smith.langchain.com/hub/langchain-ai/pairwise-evaluation-rag) |是的 |

## 总结摘要是自由形式写作的一种特殊类型。评估的目的通常是根据一组标准检查写作（摘要）。

要总结的文本的`Developer curated examples`通常用于评估（参见[summarization dataset example](https://smith.langchain.com/public/659b07af-1cab-4e18-b21a-91a69a4c3990/d)）。但是，生产（摘要）应用程序中的 `user logs` 可用于通过以下任何 `Reference-free` 评估提示进行在线评估。

`LLM-as-judge` 通常用于评估摘要（以及其他类型的写作），使用 `Reference-free` 提示，遵循提供的标准对摘要进行评分。提供特定的`Reference`摘要不太常见，因为摘要是一项创造性任务，并且有很多可能的正确答案。

由于使用了 `Reference-free` 提示，`Online` 或 `Offline` 评估是可行的。 `Pairwise` 评估也是在不同摘要链之间进行比较的有效方法（例如，不同的摘要提示或 LLM）：|使用案例|详情 |需要参考输出 | LLM作为法官？                                                                                |成对相关 |
| ---------------- | -------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------- | ----------------- |
|事实准确性 |摘要相对于源文件是否准确？                  |没有 |是的 - [prompt](https://smith.langchain.com/hub/langchain-ai/summary-accurancy-evaluator) |是的 |
|诚信|摘要是否以源文件为基础（例如，没有幻觉）？ |没有 |是的 - [prompt](https://smith.langchain.com/hub/langchain-ai/summary-hallucination-evaluator) |是的 |
|乐于助人 |摘要相对于用户需求是否有帮助？                                  |没有 |是的 - [prompt](https://smith.langchain.com/hub/langchain-ai/summary-helpfulness-evaluator) |是的 |

## 分类和标记分类和标记将标签应用于给定的输入（例如，用于毒性检测、情感分析等）。分类/标签评估通常采用以下组成部分，我们将在下面详细讨论：

分类/标记评估的一个核心考虑因素是您是否拥有带有 `reference` 标签的数据集。如果没有，用户经常希望定义一个评估器，使用标准将标签（例如毒性等）应用于输入（例如文本、用户问题等）。然而，如果提供了真实类别标签，则评估目标集中于对相对于真实类别标签的分类/标记链进行评分（例如，使用诸如精度、召回率等指标）。

如果提供了真实参考标签，那么通常只需定义一个[custom heuristic evaluator](/langsmith/code-evaluator-ui)来将真实标签与链输出进行比较。然而，鉴于法学硕士的出现，这种情况越来越普遍，只是使用 `LLM-as-judge` 根据指定标准（没有真实参考）对输入进行分类/标记。当使用 `LLM-as-judge` 并使用 `Reference-free` 提示时，`Online` 或 `Offline` 评估是可行的。特别是，当用户想要对应用程序输入进行标记/分类（例如，毒性等）时，这非常适合`Online`评估。

|使用案例|详情 |需要参考输出 | LLM作为法官？ |成对相关 |
| ---------| ------------------- | ---------------------- | ------------- | ----------------- |
|准确度|标准清晰度 |是的 |没有 |没有 |
|精密|标准清晰度 |是的 |没有 |没有 |
|回忆|标准清晰度 |是的 |没有 |没有 |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluation-approaches.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>