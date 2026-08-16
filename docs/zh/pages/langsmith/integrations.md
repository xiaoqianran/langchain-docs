<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Integrations | https://docs.langchain.com/langsmith/integrations -->

# 集成

[LangSmith](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-integrations) 为越来越多的流行 [LLM providers](#llm-providers) 和 [agent frameworks](#agent-frameworks) 以及 [Deep Agents](/oss/python/deepagents/overview)、[LangChain](/oss/python/langchain/overview) 和 [LangGraph](/oss/python/langgraph/overview) 提供集成。有关设置和使用的信息，请参阅本页列出的指南。

## 法学硕士提供者

<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <a href="/langsmith/trace-bedrock" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/bedrock.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/bedrock.svg" alt="" noZoom />
        <span className="font-semibold">亚马逊基岩</span>
    </a>

    <a href="/langsmith/trace-anthropic" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/anthropic.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/anthropic.svg" alt="" noZoom />
        <span className="font-semibold">Anthropic</span>
    </a>

     <a href="/langsmith/trace-deepseek" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/deepseek.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/deepseek.svg" alt="" noZoom />
        <span className="font-semibold">DeepSeek</span>
    </a>

    <a href="/langsmith/trace-with-google-gemini" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/gemini.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/gemini.svg" alt="" noZoom />
        <span className="font-semibold">谷歌双子座</span>
    </a>

    <a href="/langsmith/trace-litellm" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/litellm.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/litellm.svg" alt="" noZoom />
        <span className="font-semibold">LiteLLM</span>
    </a>

    <a href="/langsmith/trace-with-mistral" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/mistral.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/mistral.svg" alt="" noZoom />
        <span className="font-semibold">米斯特拉尔</span>
    </a>

    <a href="/langsmith/trace-openai" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/openai.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/openai.svg" alt="" noZoom />
        <span className="font-semibold">OpenAI</span>
    </a>

    <a href="/langsmith/trace-with-openai-compatible" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/openai.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/openai.svg" alt="" noZoom />
        <span className="font-semibold">OpenAI兼容API</span>
    </a>
</div>

<Callout icon="arrows-transfer-down" color="#4F46E5" iconType="regular">
**使用LangChain？** LangChain为100+LLM提供者提供了统一的接口，允许您通过设置环境变量在模型之间切换。 [Initialize a model](/oss/python/langchain/models#initialize-a-model)和LangSmith将自动跟踪您的申请。
</Callout>

## 代理框架

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    <a href="/langsmith/trace-with-autogen" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/autogen.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/autogen.svg" alt="" noZoom />
        <span className="font-semibold">AutoGen</span>
    </a><a href="/langsmith/trace-claude-agent-sdk" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/claude.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/claude.svg" alt="" noZoom />
        <span className="font-semibold">克劳德代理SDK</span>
    </a>

    <a href="/langsmith/trace-with-claude-managed-agents" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/claude.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/claude.svg" alt="" noZoom />
        <span className="font-semibold">克劳德管理代理</span>
    </a>

    <a href="/langsmith/trace-with-crewai" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/crewai.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/crewai.svg" alt="" noZoom />
        <span className="font-semibold">CrewAI</span>
    </a>

    <a href="/langsmith/trace-deep-agents" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="w-5 h-5" src="/images/brand/docs-favicon.png" alt="" noZoom />
        <span className="font-semibold">Deep Agents</span>
    </a>

    <a href="/langsmith/trace-with-google-adk" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/googleadk.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/googleadk.svg" alt="" noZoom />
        <span className="font-semibold">谷歌ADK</span>
    </a>

    <a href="/langsmith/trace-with-langchain" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
    <img className="w-5 h-5" src="/images/brand/docs-favicon.png" alt="" noZoom />
    <span className="font-semibold">LangChain</span>
    </a>

    <a href="/langsmith/trace-with-langgraph" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="w-5 h-5" src="/images/brand/docs-favicon.png" alt="" noZoom />
        <span className="font-semibold">LangGraph</span>
    </a>

    <a href="/langsmith/trace-with-mastra" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/mastra.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/mastra.svg" alt="" noZoom />
        <span className="font-semibold">马斯特拉</span>
    </a>

    <a href="/langsmith/trace-with-microsoft-agent-framework" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/microsoft.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/microsoft.svg" alt="" noZoom />
        <span className="font-semibold">微软代理框架</span>
    </a>

    <a href="/langsmith/trace-with-openai-agents-sdk" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/openai.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/openai.svg" alt="" noZoom />
        <span className="font-semibold">OpenAI代理商</span>
    </a>

    <a href="/langsmith/trace-with-opentelemetry" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/opentelemetry.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/opentelemetry.svg" alt="" noZoom />
        <span className="font-semibold">开放遥测</span>
    </a>

    <a href="/langsmith/trace-with-pydantic-ai" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/pydanticai.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/pydanticai.svg" alt="" noZoom />
        <span className="font-semibold">PydanticAI</span>
    </a>

    <a href="/langsmith/trace-with-semantic-kernel" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/microsoft.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/microsoft.svg" alt="" noZoom />
        <span className="font-semibold">语义内核</span>
    </a>

    <a href="/langsmith/trace-with-strands-agents" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/bedrock.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/bedrock.svg" alt="" noZoom />
        <span className="font-semibold">股线代理</span>
    </a><a href="/langsmith/trace-with-vercel-ai-sdk" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/vercel.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/vercel.svg" alt="" noZoom />
        <span className="font-semibold">Vercel AI SDK</span>
    </a>
</div>

## 语音人工智能框架

<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <a href="/langsmith/trace-openai-realtime" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/openai.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/openai.svg" alt="" noZoom />
        <span className="font-semibold">OpenAI实时</span>
    </a>

    <a href="/langsmith/trace-gemini-live" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/gemini.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/gemini.svg" alt="" noZoom />
        <span className="font-semibold">双子座直播</span>
    </a>

    <a href="/langsmith/trace-with-livekit" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/livekit.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/livekit.svg" alt="" noZoom />
        <span className="font-semibold">Livekit</span>
    </a>

    <a href="/langsmith/trace-with-pipecat" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/pipecat.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/pipecat.svg" alt="" noZoom />
        <span className="font-semibold">管道猫</span>
    </a>
</div>


## 开发者工具

<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <a href="/langsmith/trace-claude-code" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/claude.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/claude.svg" alt="" noZoom />
        <span className="font-semibold">克劳德代码</span>
    </a>

    <a href="/langsmith/trace-with-codex" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/openai.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/openai.svg" alt="" noZoom />
        <span className="font-semibold">OpenAI法典</span>
    </a>

    <a href="/langsmith/trace-with-opencode" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/opencode.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/opencode.svg" alt="" noZoom />
        <span className="font-semibold">开放代码</span>
    </a>

    <a href="/langsmith/trace-with-cursor" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/cursor.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/cursor.svg" alt="" noZoom />
        <span className="font-semibold">光标</span>
    </a>

    <a href="/langsmith/trace-with-instructor" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/instructor.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/instructor.svg" alt="" noZoom />
        <span className="font-semibold">讲师</span>
    </a>

    <a href="/langsmith/trace-with-n8n" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/n8n.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/n8n.svg" alt="" noZoom />
        <span className="font-semibold">n8n</span>
    </a>

    <a href="/langsmith/trace-with-pi" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/pi.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/pi.svg" alt="" noZoom />
        <span className="font-semibold">Pi</span>
    </a>

    <a href="/langsmith/trace-with-temporal" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/temporal.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/temporal.svg" alt="" noZoom />
        <span className="font-semibold">颞叶</span>
    </a><a href="/langsmith/trace-with-vscode-copilot" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/vscode.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/vscode.svg" alt="" noZoom />
        <span className="font-semibold">VS 代码副驾驶</span>
    </a>
</div>

这些编码代理集成遵循共享的[metadata contract](/langsmith/coding-agent-metadata-contract)，该[metadata contract](/langsmith/coding-agent-metadata-contract)标准化了它们发出的跟踪字段。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/integrations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>