<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Chat | https://docs.langchain.com/langsmith/chat -->

# LangSmith 聊天

**LangSmith Chat**（以前称为 Polly）直接内置于您的 LangSmith [workspace](/langsmith/administration-overview#workspaces) 中，以帮助您分析和理解您的应用程序数据。

聊天可帮助您从跟踪、对话线程和提示中获得洞察，而无需手动挖掘数据。通过提出自然语言问题，您可以快速了解代理性能、调试问题并分析用户情绪。

<img src="/images/brand/polly-icon.png" alt="LangSmith Chat icon" style={{float: 'left', marginRight: '20px', marginTop: '-1px', marginBottom: '20px', maxWidth: '100px'}} /> 聊天出现在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-chat) 内以下位置的右下角：

<br></br><br></br>**可观察性和调试：**
- [Projects](#projects)：浏览和过滤项目中的运行。
- [Trace pages](#trace-pages)：分析各个运行和执行跟踪。
- [Thread views](#thread-views)：了解对话线程和用户交互。

**及时工程：**
- [Playground](#playground)：编辑和优化提示。
- [Prompt Hub pages](#prompt-hub-pages)：探索并理解共享提示。

**评估与测试：**
- [Dataset Experiments](#dataset-experiments)：分析实验结果并比较运行。
- [Dataset Examples](#dataset-examples)：浏览并理解数据集结构。
- [Annotation Queues](#annotation-queues)：审查运行并做出明智的注释决策。
- [Evaluators](#evaluators)：在人工智能协助下构建和完善评估器。

<img
className="block dark:hidden"
src="/langsmith/images/polly-datasets-light.png"
alt="Chat in the sidebar on a dataset view."
/>

<img
className="hidden dark:block"
src="/langsmith/images/polly-datasets-dark.png"
alt="Chat in the sidebar on a dataset view."
/>

## 开始吧

在开始使用 Chat 之前，您需要为您使用的模型添加 API 密钥：在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=snippets-langsmith-set-workspace-secrets) 中，确保您的 API 密钥设置为 [workspace secret](/langsmith/set-up-hierarchy#configure-workspace-settings)。

1. 导航至 <Icon icon="settings" /> **设置**，然后移至 **秘密** 选项卡。
1. 选择 **添加密钥** 并输入密钥环境变量（例如`OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY`）以及您的 API 密钥作为 **值**。
1. 选择**保存机密**。

<Note> 在 LangSmith UI 中添加工作区密钥时，请确保密钥与模型提供程序期望的环境变量名称匹配。</Note>

<Note>如果您的提供商使用 OAuth2 `client_credentials` 进行身份验证，请改为在模型配置上配置凭据。在这种情况下，不需要工作空间机密。参见[OAuth client credentials](/langsmith/model-configurations#oauth-client-credentials)。</Note>

<Note>
聊天从 LangSmith 的出口 IP 地址调用模型提供者。如果您的模型提供商（或其前面的代理）通过 IP 限制流量，请将 [Allowlist IP addresses](/langsmith/deploy-to-cloud#allowlist-ip-addresses) 中列出的 LangSmith 出口 IP 列入白名单。
</Note>

### 支持的型号

Chat 支持以下开箱即用的模型提供程序：

- Anthropic（克劳德）
- OpenAI
- 谷歌双子座
- AWS 基岩
- 格罗克
- 米斯特拉尔
- xAI
- 深寻
- 烟花人工智能

您还可以通过启用该配置上的 **在聊天中可用** 切换来使用您在 [Playground Settings](/langsmith/prompt-engineering-concepts#playground) 中配置的任何自定义模型。工作区管理员管理可用的自定义模型。### 键盘快捷键

|行动|苹果电脑| Windows/Linux |
|---|---|---|
|切换聊天打开/关闭 | `Cmd+I` | `Ctrl+I` |
|清除当前线程 | `Cmd+Shift+O` | `Ctrl+Shift+O` |

## 可观察性

### 项目

在项目的运行列表上，Chat 可以浏览和筛选整个项目的运行、创建数据集并添加示例。使用聊天功能可以快速探索跟踪中发生的情况，而无需手动翻阅结果。

**问题示例：**
- “显示过去 24 小时内所有失败的运行”
- “哪次跑步花费的时间最长？”
- “将失败的运行添加到我的测试数据集中”
- “本周有多少次运行出错？”

### 跟踪页面

在单个[trace](/langsmith/observability-concepts#traces)上，Chat分析[run](/langsmith/observability-concepts#runs)数据和执行轨迹。 Chat 检查完整的跟踪上下文，包括 [run metadata](/langsmith/observability-concepts#metadata)、输入、输出、中间步骤和配置，以帮助您了解发生的情况并确定需要改进的领域。

**问题示例：**
- “特工有什么可以做得更好的地方吗？”
- “为什么这次运行失败了？”
- “在这条追踪中什么花费了最多的时间？”
- “总结一下这段痕迹中发生了什么”

### 线程视图在 **Threads** 选项卡下，Chat 会分析对话 [threads](/langsmith/observability-concepts#threads)，以帮助您了解用户情绪、对话结果和交互模式。使用聊天来识别用户痛点并了解问题是否得到解决。

**问题示例：**
- “用户看起来是否感到沮丧？”
- “用户遇到什么问题？”
- “用户的问题解决了吗？”
- “这个帖子的主题是什么？”

## 快速工程

### 游乐场

在[Playground](/langsmith/prompt-engineering-concepts#playground)中，Chat可以帮助您编辑和优化您的[prompts](/langsmith/prompt-engineering-concepts#prompts-in-langsmith)。使用自动化选项，如**优化提示**、**生成工具**或**生成输出架构**，或为 Chat 提供编辑提示的自定义说明。聊天可以直接修改 Playground 状态（更新消息、工具、输出模式和示例），以便您可以通过对话方式迭代提示。

**问题示例：**
- “让它用意大利语回应”
- “添加有关用户角色的更多上下文”
- “让语气更专业”
- “简化说明”

### 提示中心页面

在[LangSmith Hub](/langsmith/prompt-engineering-concepts#prompts-in-langsmith)中查看提示时，聊天可帮助您了解提示的结构、消息、工具和配置。这对于探索和学习共享提示非常有用。**问题示例：**
- “这个提示有什么作用？”
- “这个提示使用什么工具？”
- “解释一下这个提示的结构”
- “此提示中的关键说明是什么？”

## 评价

### 数据集实验

在 **实验** 选项卡下的 **数据集** 页面上，Chat 分析实验结果并帮助您比较不同实验的运行情况。聊天可以识别模式、总结性能并帮助您了解哪些方法最有效。

**问题示例：**
- “哪个实验表现最好？”
- “这些运行之间的主要区别是什么？”
- “总结本次实验的结果”
- “你在失败中看到了什么模式？”

### 数据集示例

在**示例**选项卡下的**数据集**页面上，Chat 可帮助您了解数据集结构、浏览示例并识别数据模式。这对于了解您正在使用哪些数据以及准备实验数据集非常有用。

**问题示例：**
- “这个数据集中的数据是什么类型？”
- “显示有错误的示例”
- “您在输入中看到什么模式？”
- “这个数据集中有多少个例子？”

### 注释队列在**注释队列**中，聊天可以帮助您在做出注释决策之前分析运行。无论您是单独查看运行还是成对比较，Chat 都可以提供有关运行行为、错误和执行模式的见解，以便为您的评分提供信息。

**问题示例：**
- “这次跑步出了什么问题？”
- “总结一下这次运行中发生的事情”
- “比较这两次运行”
- “评分时我应该考虑什么？”

### 评估者

在**评估器**构建器中，Chat 可帮助您编写和完善评估器逻辑。聊天可以生成评估器代码，提出改进建议，并帮助您根据示例测试评估器。

**问题示例：**
- “编写一个检查幻觉的评估器”
- “提高该评估器的准确性”
- “这个评估员检查什么？”
-“添加边缘情况的处理”

## 接下来是什么

详细了解 Chat 可帮助您探索的功能：

<CardGroup cols={2}>
  <Card
    title="Observability"
    icon="search"
    href="/langsmith/observability"
  >
    了解有关跟踪和监控您的 LLM 申请的更多信息
  </Card>

  <Card
    title="Threads"
    icon="messages"
    href="/langsmith/threads"
  >
    了解线程在 LangSmith 中的工作原理
  </Card>

  <Card
    title="Prompt Engineering"
    icon="wand"
    href="/langsmith/prompt-context-hub#prompts"
  >
    在 Playground 中创建并迭代提示
  </Card>

  <Card
    title="Evaluation"
    icon="clipboard-check"
    href="/langsmith/evaluation"
  >
    系统地评估和测试您的应用程序
  </Card>
</CardGroup>---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/chat.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>