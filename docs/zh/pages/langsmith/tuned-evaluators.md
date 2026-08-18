<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up LangChain Tuned Evaluators | https://docs.langchain.com/langsmith/tuned-evaluators -->

# 设置 LangChain 调整评估器

<Note>
LangChain 调整评估器位于 **[beta](/langsmith/release-stages)**。在全面上市之前，它们的界面和行为可能会发生变化。
</Note>

LangChain 调整的评估器将反馈附加到您的痕迹中。每个评估员都会使用一位针对特定评估任务接受过培训的专业法官。 LangChain 编写、测试、版本和维护提示和判断模型，以便您可以专注于使用反馈来查找和修复代理中的问题。

感知错误（已调整）检测对话，并有证据表明客服人员犯了错误、误解了请求或将交互引向了错误的方向。当用户似乎察觉到错误时，它返回`true`，否则返回`false`。证据可以包括用户更正、重复请求、被拒绝的操作、矛盾的响应、承认的错误、持续的误解或未解决的结果。

使用感知错误反馈来：- 查找未产生系统错误或明确用户评级的故障。
- 过滤需要调查的对话，并通过原始交互审查评估者的解释。
- 比较标记的线程以识别重复出现的故障模式。
- 将有用的线程添加到评估数据集或发送不明确的案例以供人工审核。
- 根据从跟踪的故障中提取的示例来测试代理更改。

## 了解 LangChain Tuned Evaluator 的工作原理

<Steps>
  <Step title="Add an evaluator">
    将 LangChain Tuned Evaluator 添加到兼容的跟踪项目。
  </Step>
  <Step title="Identify an eligible thread">
    LangSmith 标识满足评估者要求以及项目的过滤器和采样配置的线程。
  </Step>
  <Step title="Evaluate the thread">
    专门的LangChain管理的法官评估合格的线程。
  </Step>
  <Step title="Attach feedback">
    LangSmith 将结果及其解释附加到线程作为反馈。
  </Step>
</Steps>

## 开始之前

在添加感知错误（已调整）之前：- [organization admin](/langsmith/rbac#organization-admin) 必须为组织启用 LangChain 调整评估器。
- 来源必须是使用[threads](/langsmith/threads)的跟踪项目。感知错误（已调整）评估器无法在单独的运行中运行。
- 线程跟踪必须包含受支持的[message lists](/langsmith/online-evaluations-multi-turn#prerequisites)。至少一条非空用户消息必须后跟一条非空助理消息。
- 在评估器运行之前，每个线程必须至少包含两个跟踪。

## 启用 LangChain 调整评估器

启用 LangChain Tuned Evaluators 允许成员将其附加到整个组织中的跟踪项目。评估数据使用LangChain管理的API密钥进行处理。

要以组织管理员身份启用 LangChain Tuned Evaluators：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-tuned-evaluators)中，打开**设置**。
1. 选择**调整评估器**。
1. 打开 **启用 LangChain Tuned evaluators** 并接受条款。

当第一次从评估器库中保存评估器时，组织管理员还可以接受并启用 LangChain 调整的评估器。

## 将 LangChain Tuned Evaluator 添加到项目中

要将感知错误（已调整）添加到跟踪项目：1. 打开跟踪项目并选择 **Evaluators** 选项卡。
1. 选择 **+ 评估器**。
1. 在 **LangChain 已调整**下，选择 **感知错误（已调整）**。
1. （可选）配置滤波器和采样率。
1. 单击“**保存**”。

在创建评估器之前，LangSmith 检查项目中最近的线程以获取支持的消息列表，并进行完整的用户与助手交换。

当项目为空或最近的线程都不具有兼容的消息结构时，LangSmith 会阻止创建。

## 禁用 LangChain 调谐评估器

要为组织禁用 LangChain Tuned Evaluators：

1. 打开 **设置** 并选择 **调整评估器**。
1. 关闭 **启用 LangChain 调谐评估器**。

禁用该功能会暂停附加的 LangChain 调谐评估器。 LangSmith 保留其配置，并在组织管理员再次启用该功能时恢复。

## 查看使用费用

可用性和定价因 LangChain Tuned Evaluator 而异。 LangSmith 仅针对附加反馈的评估运行向 LCU 收费。未附加反馈的跳过和失败的评估尝试不会被计费。与其他在线评估器一样，LangChain Tuned Evaluators 将评估的跟踪升级为延长保留时间。这可能会增加跟踪存储费用。有关当前费率，请参阅[LangSmith pricing](/langsmith/pricing-plans)。有关保留升级和跟踪费用的详细信息，请参阅[data retention auto-upgrades](/langsmith/usage-and-billing#data-retention-auto-upgrades)。

## 对 LangChain 调整评估器进行故障排除

### 该项目是空的

将线程添加到跟踪项目，然后尝试再次保存评估器。该线程必须包含受支持的消息列表和至少一次完整的用户与助理交换。

### 该项目不包含有效的消息列表

检查项目最新线程的输入和输出。它们的顶级`messages`字段必须包含[supported format](/langsmith/online-evaluations-multi-turn#prerequisites)中的消息列表，并且至少一条用户消息必须后跟一条助理消息。

### 评估者不提供反馈

检查以下条件：

- 该组织仍然启用 LangChain Tuned Evaluators。
- 该线程至少包含两条踪迹。
- 项目的线程空闲时间已过。
- 线程与评估器的过滤器和采样配置相匹配。
- 该线程包含采用受支持的消息格式的完整用户与助理交换。要检查评估器活动，请打开跟踪项目的 **Evaluators** 选项卡，然后为评估器选择 **Logs**。

### 启用该功能不会立即生效

组织设置可能需要几秒钟的时间才能传播。如果 LangSmith 报告托管评估器设置仍在生效，请等待几秒钟，然后重试。

## 另请参阅

- [Manage evaluators](/langsmith/evaluators)
- [Set up multi-turn online evaluators](/langsmith/online-evaluations-multi-turn)
- [Trace with threads](/langsmith/threads)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tuned-evaluators.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>