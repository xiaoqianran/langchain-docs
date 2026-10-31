<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build | https://docs.langchain.com/build-overview -->

# 构建

使用托管 Deep Agents、Deep Agents、LangChain、LangGraph 和舰队构建代理。

# 构建

LangChain 开源堆栈提供了设计、测试和发布代理所需的构建块。每一层都可以由您配置：模型、工具、代理工作的上下文和内存，以及围绕模型循环的线束。

## 选择你的起点

托管 Deep Agents、Deep Agents、LangChain 和 LangGraph 共享相同的开源堆栈，因此请根据您需要的控制程度进行选择。对于托管或无代码，请从 Managed Deep Agents 或 Fleet 开始：> [选项卡] Python
>
>>【卡牌】[Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)
>>
>> 使用托管部署基础架构构建深度代理，以执行复杂、长时间运行的任务。完整的代理线束
>> 规划、子代理、虚拟文件系统和内置的长期内存。
>> 撰写代理的最快方式； LangSmith 运行线束和运行时。
>
>>【卡牌】[Deep Agents](/oss/python/deepagents/overview)
>>
>> 相同的Deep Agents安全带，具有最大的灵活性。自己托管代理，或者当您需要对运行时进行更多控制时运行自定义 LangSmith 部署。
>
>>【卡牌】[LangChain](/oss/python/langchain/overview)
>>
>> 一个最小的、可配置的代理框架。从模型、工具、提示和中间件中准确组合您所需的内容。
>
>>【卡牌】[LangGraph](/oss/python/langgraph/overview)
>>
>> 用于有状态、长时间运行的代理的低级编排：持久执行、流式传输、内存和人机交互。
>
>>【卡牌】[Prefer no-code?](/langsmith/fleet)
>>
>> 使用 LangSmith Fleet 构建并运行代理，无需编写代码。> [选项卡] TypeScript
>
>>【卡牌】[Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview)
>>
>> 使用托管部署基础架构构建深度代理，以执行复杂、长时间运行的任务。完整的代理线束
>> 规划、子代理、虚拟文件系统和内置的长期内存。
>> 撰写代理的最快方式； LangSmith 运行线束和运行时。
>
>>【卡牌】[Deep Agents](/oss/javascript/deepagents/overview)
>>
>> 相同的Deep Agents安全带，具有最大的灵活性。自己托管代理，或者当您需要对运行时进行更多控制时运行自定义 LangSmith 部署。
>
>>【卡牌】[LangChain](/oss/javascript/langchain/overview)
>>
>> 一个最小的、可配置的代理框架。从模型、工具、提示和中间件中准确组合您所需的内容。
>
>>【卡牌】[LangGraph](/oss/javascript/langgraph/overview)
>>
>> 用于有状态、长时间运行的代理的低级编排：持久执行、流式传输、内存和人机交互。
>
>>【卡牌】[Prefer no-code?](/langsmith/fleet)
>>
>> 使用 LangSmith Fleet 构建并运行代理，无需编写代码。

## 使用现成的代理

> [卡][Deep Agents Code](/oss/deepagents/code/overview)
>
> 基于Deep Agents SDK 构建的开源终端编码代理 (`dcode`)。在会话中切换模型、自定义技能和内存，并批准从 CLI 执行 shell。

＃＃ 探索> [选项卡] Python
>
>>【卡牌】[Integrations](/oss/python/integrations/providers/overview)
>>
>> 连接到模型提供者、向量存储、检索器和其他组件。
>
>>【卡牌】[Learn](/oss/python/learn)
>>
>> 遵循常见代理模式和用例的教程和概念指南。
>
>>【卡牌】[Reference](/oss/python/reference/overview)
>>
>> API 参考、错误代码、发行说明和迁移指南。
>
>>【卡牌】[Contribute](/oss/python/contributing/overview)
>>
>> 为 LangChain 生态系统贡献文档、代码和集成。

> [选项卡] TypeScript
>
>>【卡牌】[Integrations](/oss/javascript/integrations/providers/overview)
>>
>> 连接到模型提供者、向量存储、检索器和其他组件。
>
>>【卡牌】[Learn](/oss/javascript/learn)
>>
>> 遵循常见代理模式和用例的教程和概念指南。
>
>>【卡牌】[Reference](/oss/javascript/reference/overview)
>>
>> API 参考、错误代码、发行说明和迁移指南。
>
>>【卡片】[Contribute](/oss/javascript/contributing/overview)
>>
>> 为 LangChain 生态系统贡献文档、代码和集成。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/build-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。


# 
来源：https://docs.langchain.com/index



# 开放代理工程生态系统LangChain 为构建代理提供开源、模型无关的工具。 LangSmith 是一个与框架无关的平台，用于在整个代理开发生命周期中测试、部署、监控和改进代理。您可以控制代理系统的每一层，并利用您在生产中学到的知识不断改进它。

## 代理开发生命周期

> [卡][Build](/build-overview)
>
> 使用托管 Deep Agents、Deep Agents、LangChain 和 LangGraph 构建代理。

> [卡][Test](/langsmith/evaluation)
>
> 使用数据集、评估和即时工程来评估代理。

> [卡][Deploy](/langsmith/deployment)
>
> 大规模部署和服务代理。

> [卡][Monitor](/langsmith/observability)
>
> 跟踪、调试和观察生产中的代理。

> [卡][Agent Registry](/langsmith/agent-registry)
>
>（仅限云）在一个地方注册、组织和管理每个代理，无论其托管在何处。

## 产品

> [卡][LLM Gateway](/langsmith/llm-gateway)
>
> 路由、控制和观察提供商之间的 LLM 流量。

> [卡][No-code agents](/langsmith/fleet)
>
> 使用 LangSmith Fleet 无需代码即可构建和运行代理。

> [卡片][Engine](/langsmith/engine)
>
> 使用 LangSmith 引擎自动查找并修复重复出现的代理问题。

> [卡][Deep Agents Code](/oss/deepagents/code/overview)
>
> 使用开源 `dcode` CLI 在终端中使用 AI 代理进行编码。

## 设置和治理> [卡][LangSmith setup](/langsmith/langsmith-setup-overview)
>
> 云托管、BYOC 或自托管、帐户设置和管理。

> [卡][Govern](/langsmith/govern-overview)
>
> 管理整个组织的用户、访问控制、策略和合规性。

## 资源

> [卡][LangChain Academy](https://academy.langchain.com/)
>
> 参加有关使用 LangSmith 和我们的开源框架构建和改进代理的免费课程。

> [卡][Community forum](https://forum.langchain.com/)
>
> 提出问题、分享解决方案并讨论最佳实践。

> [卡][Support portal](https://support.langchain.com/)
>
> 提交票证并跟踪支持请求。

> [卡][Sign up for LangSmith](https://smith.langchain.com/)
>
> 免费开始使用LangSmith。

> [卡][LangSmith status](https://status.smith.langchain.com/)
>
> LangSmith 服务和 API 的实时状态。

> [卡][Trust Center](https://trust.langchain.com/)
>
> HIPAA、SOC 2 Type 2 和 GDPR 合规性详细信息。