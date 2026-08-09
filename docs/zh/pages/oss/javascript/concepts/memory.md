<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Memory overview | https://docs.langchain.com/oss/javascript/concepts/memory -->

# 内存概览

[Memory](/oss/javascript/langgraph/add-memory)是一个记住之前交互信息的系统。对于人工智能代理来说，记忆至关重要，因为它可以让它们记住之前的交互、从反馈中学习并适应用户偏好。随着代理通过大量用户交互处理更复杂的任务，此功能对于效率和用户满意度变得至关重要。

本概念指南根据记忆范围涵盖两种类型的记忆：

* [Short-term memory](#short-term-memory) 或 [thread](/oss/javascript/langgraph/checkpointers#threads) 范围内存，通过维护会话中的消息历史记录来跟踪正在进行的对话。 LangGraph 将短期记忆作为代理[state](/oss/javascript/langgraph/graph-api#state)的一部分进行管理。状态使用 [checkpointer](/oss/javascript/langgraph/checkpointers#checkpoints) 保存到数据库中，因此可以随时恢复线程。当调用图或完成一个步骤时，短期内存会更新，并且在每个步骤开始时读取状态。
* [Long-term memory](#long-term-memory) 跨会话存储用户特定或应用程序级数据，并在*跨*会话线程之间共享。它可以在*任何时间*和*在任何线程*中被调用。内存的范围是任何自定义命名空间，而不仅仅是单个线程 ID 内。 LangGraph提供了[stores](/oss/javascript/langgraph/stores)（[reference doc](https://langchain-ai.github.io/langgraph/reference/store/#langgraph.store.base.BaseStore)）来让您保存和调用长期记忆。

<img alt="Short vs long" />## 短期记忆

[Short-term memory](/oss/javascript/langgraph/add-memory#add-short-term-memory) 让您的应用程序记住单个 [thread](/oss/javascript/langgraph/checkpointers#threads) 或对话中之前的交互。 [thread](/oss/javascript/langgraph/checkpointers#threads) 在一个会话中组织多个交互，类似于电子邮件在单个对话中对消息进行分组的方式。

LangGraph 将短期内存作为代理状态的一部分进行管理，并通过线程范围的检查点进行持久化。此状态通常可以包括对话历史记录以及其他状态数据，例如上传的文件、检索的文档或生成的工件。通过将这些存储在图表的状态中，机器人可以访问给定对话的完整上下文，同时保持不同线程之间的分离。

### 管理短期记忆

对话历史是短期记忆最常见的形式，而长时间对话对当今的法学硕士提出了挑战。完整的历史记录可能不适合法学硕士的上下文窗口，从而导致不可恢复的错误。即使您的法学硕士支持完整的上下文长度，大多数法学硕士在长上下文中仍然表现不佳。他们会被陈旧或偏离主题的内容“分散注意力”，同时还要承受响应时间较慢和成本较高的问题。聊天模型使用消息接受上下文，其中包括开发人员提供的指令（系统消息）和用户输入（人工消息）。在聊天应用程序中，消息在人工输入和模型响应之间交替，导致消息列表随着时间的推移而变长。由于上下文窗口有限，并且令牌丰富的消息列表可能成本高昂，因此许多应用程序可以从使用手动删除或忘记过时信息的技术中受益。

<img alt="Filter" />

有关管理消息的常用技术的更多信息，请参阅 [Add and manage memory](/oss/javascript/langgraph/add-memory#manage-short-term-memory) 指南。

## 长期记忆

LangGraph 中的[Long-term memory](/oss/javascript/langgraph/add-memory#add-long-term-memory) 允许系统在不同的对话或会话中保留信息。与**线程范围**的短期内存不同，长期内存保存在自定义“命名空间”中。

长期记忆是一项复杂的挑战，没有一刀切的解决方案。但是，以下问题提供了一个框架来帮助您驾驭不同的技术：* 内存的类型是什么？人类利用记忆来记住事实（[semantic memory](#semantic-memory)）、经验（[episodic memory](#episodic-memory)）和规则（[procedural memory](#procedural-memory)）。人工智能代理可以以相同的方式使用内存。例如，人工智能代理可以使用内存来记住有关用户的特定事实以完成任务。
* [When do you want to update memories?](#writing-memories) 内存可以作为代理应用程序逻辑的一部分进行更新（例如，“在热路径上”）。在这种情况下，代理通常决定在响应用户之前记住事实。或者，可以将内存更新为后台任务（在后台/异步运行并生成内​​存的逻辑）。我们在[section below](#writing-memories)中解释了这些方法之间的权衡。

不同的应用程序需要不同类型的内存。尽管这个类比并不完美，但检查 [human memory types](https://www.psychologytoday.com/us/basics/memory/types-of-memory?ref=blog.langchain.dev) 可能会很有洞察力。一些研究（例如，[CoALA paper](https://arxiv.org/pdf/2309.02427)）甚至将这些人类记忆类型映射到人工智能代理中使用的记忆类型。|内存类型 |存储了什么 |人类的例子|代理示例 |
| -------------------------------- | -------------- | -------------------------- | ------------------- |
| [Semantic](#semantic-memory) |事实|我在学校学到的东西|关于用户的事实 |
| [Episodic](#episodic-memory) |经验|我做过的事 |过去的代理行动|
| [Procedural](#procedural-memory) |说明 |本能或运动技能|代理系统提示|

### 语义记忆

[Semantic memory](https://en.wikipedia.org/wiki/Semantic_memory)，无论是在人类还是人工智能体中，都涉及到特定事实和概念的保留。对于人类来说，它可以包括在学校学到的信息以及对概念及其关系的理解。对于人工智能代理来说，语义记忆通常用于通过记住过去交互中的事实或概念来个性化应用程序。

<Note>
  语义记忆不同于“语义搜索”，“语义搜索”是一种使用“含义”（通常作为嵌入）查找相似内容的技术。语义记忆是心理学术语，指的是存储事实和知识，而语义搜索是一种基于含义而不是精确匹配来检索信息的方法。
</Note>语义记忆可以通过不同的方式进行管理：

#### 简介

记忆可以是关于用户、组织或其他实体（包括代理本身）的范围明确的特定信息的单个、持续更新的“配置文件”。配置文件通常只是一个 JSON 文档，其中包含您选择用来表示域的各种键值对。

记住个人资料时，您需要确保每次都**更新**该个人资料。因此，您需要传递以前的配置文件和[ask the model to generate a new profile](https://github.com/langchain-ai/memory-template)（或一些[JSON patch](https://github.com/hinthornw/trustcall)以应用于旧配置文件）。随着配置文件变大，这可能会变得容易出错，并且可能会受益于将配置文件拆分为多个文档或在生成文档时进行严格解码以确保内存模式保持有效。

<img alt="Update profile" />

####收藏或者，存储器可以是随时间不断更新和扩展的文档集合。每个单独的记忆范围可以更窄，更容易生成，这意味着随着时间的推移，您不太可能**丢失**信息。对于法学硕士来说，为新信息生成“新”对象比将新信息与现有配置文件协调起来更容易。因此，文档集合往往会导致[higher recall downstream](https://en.wikipedia.org/wiki/Precision_and_recall)。

然而，这改变了内存更新的一些复杂性。该模型现在必须“删除”或“更新”列表中的现有项目，这可能很棘手。此外，某些模型可能默认为过度插入，而另一些模型可能默认为过度更新。请参阅 [Trustcall](https://github.com/hinthornw/trustcall) 包，了解管理此问题的一种方法，并考虑评估（例如，使用 [LangSmith](/langsmith/evaluation) 等工具）来帮助您调整行为。

使用文档集合也会将复杂性转移到列表上的内存**搜索**。 `Store`目前支持[semantic search](https://langchain-ai.github.io/langgraph/reference/store/#langgraph.store.base.SearchOp.query)和[filtering by content](https://langchain-ai.github.io/langgraph/reference/store/#langgraph.store.base.SearchOp.filter)。最后，使用内存集合可能会导致为模型提供全面的上下文变得具有挑战性。虽然个体记忆可能遵循特定的模式，但这种结构可能无法捕捉记忆之间的完整背景或关系。因此，当使用这些记忆生成响应时，模型可能缺乏重要的上下文信息，而这些信息在统一的配置文件方法中更容易获得。

<img alt="Update list" />

无论采用哪种内存管理方法，中心点都是代理将使用语义记忆[ground its responses](/oss/javascript/deepagents/retrieval)，这通常会导致更加个性化和相关的交互。

### 情景记忆

[Episodic memory](https://en.wikipedia.org/wiki/Episodic_memory)，在人类和人工智能代理中，都涉及回忆过去的事件或行为。 [CoALA paper](https://arxiv.org/pdf/2309.02427)很好地描述了这一点：事实可以写入语义记忆，而*经验*可以写入情景记忆。对于人工智能代理来说，情景记忆通常用于帮助代理记住如何完成任务。在实践中，情景记忆通常是通过少量示例提示来实现的，其中代理从过去的序列中学习以正确执行任务。有时“展示”比“讲述”更容易，法学硕士可以从例子中学到很多东西。通过使用输入输出示例更新提示来说明预期行为，少量学习可以让您["program"](https://x.com/karpathy/status/1627366413840322562)获得法学硕士。虽然可以使用各种最佳实践来生成少量示例，但挑战通常在于根据用户输入选择最相关的示例。

请注意，内存[store](/oss/javascript/langgraph/stores)只是存储数据作为少数样本示例的一种方法。如果您希望有更多的开发人员参与，或者将少数镜头与您的评估工具更紧密地联系起来，您还可以使用 LangSmith 数据集来存储您的数据并实现您自己的检索逻辑，以根据用户输入选择最相关的示例。

请参阅此 [blog post](https://blog.langchain.dev/few-shot-prompting-to-improve-tool-calling-performance/) 展示了几次提示以提高工具调用性能，以及此 [blog post](https://blog.langchain.dev/aligning-llm-as-a-judge-with-human-preferences/) 使用少量示例来使 LLM 与人类偏好保持一致。

### 程序记忆[Procedural memory](https://en.wikipedia.org/wiki/Procedural_memory)，对于人类和人工智能代理来说，都涉及记住用于执行任务的规则。对于人类来说，程序记忆就像如何执行任务的内化知识，例如通过基本运动技能和平衡来骑自行车。另一方面，情景记忆涉及回忆特定的经历，例如您第一次成功地骑着没有辅助轮的自行车，或者一次难忘的自行车骑行穿过风景优美的路线。对于人工智能代理来说，程序记忆是模型权重、代理代码和代理提示的组合，它们共同决定代理的功能。

在实践中，代理修改模型权重或重写代码的情况相当罕见。然而，更常见的是代理修改自己的提示。完善代理指令的一种有效方法是通过 ["Reflection"](https://blog.langchain.dev/reflection-agents/) 或元提示。这涉及用当前指令（例如系统提示）以及最近的对话或明确的用户反馈来提示代理。然后，代理根据此输入完善自己的指令。这种方法对于那些难以预先指定指令的任务特别有用，因为它允许代理从其交互中学习和适应。

例如，我们使用外部反馈和提示重写构建了[Tweet generator](https://www.youtube.com/watch?v=Vn8A3BxfplE)，为 Twitter 生成高质量的论文摘要。在这种情况下，特定的摘要提示很难指定*先验*，但用户很容易批评生成的推文并提供有关如何改进摘要过程的反馈。下面的伪代码显示了如何使用 LangGraph 内存 [store](/oss/javascript/langgraph/stores) 实现此目的，使用存储保存提示，使用 `update_instructions` 节点获取当前提示（以及与 `state["messages"]` 中捕获的用户对话的反馈），更新提示，并将新提示保存回存储。然后，`call_model`从商店获取更新的提示并使用它来生成响应。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Node that *uses* the instructions
const callModel = async (state: State, store: BaseStore) => {
    const namespace = ["agent_instructions"];
    const instructions = await store.get(namespace, "agent_a");
    // Application logic
    const prompt = promptTemplate.format({
        instructions: instructions[0].value.instructions
    });
    // ...
};

// Node that updates instructions
const updateInstructions = async (state: State, store: BaseStore) => {
    const namespace = ["instructions"];
    const currentInstructions = await store.search(namespace);
    // Memory logic
    const prompt = promptTemplate.format({
        instructions: currentInstructions[0].value.instructions,
        conversation: state.messages
    });
    const output = await llm.invoke(prompt);
    const newInstructions = output.new_instructions;
    await store.put(["agent_instructions"], "agent_a", {
        instructions: newInstructions
    });
    // ...
};
```

<img alt="Update instructions" />

### 书写回忆

代理写入内存有两种主要方法：["in the hot path"](#in-the-hot-path)和["in the background"](#in-the-background)。

<img alt="Hot path vs background" />

#### 在热路径中

在运行时创建内存既有优点也有挑战。从积极的一面来看，这种方法允许实时更新，使新的记忆立即可用于后续的交互。它还实现了透明度，因为当创建和存储记忆时可以通知用户。然而，这种方法也面临着挑战。如果代理需要新工具来决定将哪些内容提交到内存中，则可能会增加复杂性。此外，推理将哪些内容保存到内存的过程可能会影响代理延迟。最后，代理必须在内存创建和其他职责之间执行多任务，这可能会影响创建的内存的数量和质量。

例如，ChatGPT 使用 [save\_memories](https://openai.com/index/memory-and-new-controls-for-chatgpt/) 工具将内存作为内容字符串更新插入，决定是否以及如何在每个用户消息中使用此工具。请参阅我们的 [memory-agent](https://github.com/langchain-ai/memory-agent) 模板作为参考实现。

#### 在后台

创建内存作为单独的后台任务有几个优点。它消除了主应用程序中的延迟，将应用程序逻辑与内存管理分开，并允许代理更集中地完成任务。这种方法还提供了定时内存创建的灵活性，以避免冗余工作。然而，这种方法也有其自身的挑战。确定内存写入的频率变得至关重要，因为不频繁的更新可能会使其他线程失去新的上下文。决定何时触发记忆形成也很重要。常见的策略包括在设定的时间段后进行调度（如果发生新事件则重新调度）、使用 cron 调度或允许用户或应用程序逻辑手动触发。

请参阅我们的 [memory-service](https://github.com/langchain-ai/memory-template) 模板作为参考实现。

### 内存存储

LangGraph 将长期记忆作为 JSON 文档存储在 [store](/oss/javascript/langgraph/stores) 中。每个内存都组织在自定义的 `namespace` （类似于文件夹）和独特的 `key` （类似于文件名）下。命名空间通常包含用户或组织 ID 或其他标签，以便更轻松地组织信息。这种结构可以实现存储器的分层组织。然后通过内容过滤器支持跨命名空间搜索。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { InMemoryStore } from "@langchain/langgraph";

const embed = (texts: string[]): number[][] => {
    // Replace with an actual embedding function or LangChain embeddings object
    return texts.map(() => [1.0, 2.0]);
};

// InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
const store = new InMemoryStore({ index: { embed, dims: 2 } });
const userId = "my-user";
const applicationContext = "chitchat";
const namespace = [userId, applicationContext];

await store.put(
    namespace,
    "a-memory",
    {
        rules: [
            "User likes short, direct language",
            "User only speaks English & TypeScript",
        ],
        "my-key": "my-value",
    }
);

// get the "memory" by ID
const item = await store.get(namespace, "a-memory");

// search for "memories" within this namespace, filtering on content equivalence, sorted by vector similarity
const items = await store.search(
    namespace,
    {
        filter: { "my-key": "my-value" },
        query: "language preferences"
    }
);
```

有关内存存储的更多信息，请参阅[Persistence](/oss/javascript/langgraph/stores)指南。

## 了解更多

* [Context conceptual overview](/oss/javascript/concepts/context)
* [Short-term memory in LangChain](/oss/javascript/langchain/short-term-memory)
* [Memory in LangGraph](/oss/javascript/langgraph/add-memory)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/concepts/memory.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>