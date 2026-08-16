<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Pipecat applications | https://docs.langchain.com/langsmith/trace-with-pipecat -->

# 跟踪 Pipecat 应用程序

<Note>
此集成处于测试阶段，因此其 API 可能会发生变化。
</Note>

通过 LangSmith Pipecat 集成将您的 [Pipecat](https://pipecat.ai/) 语音代理追踪到 LangSmith。有关高级约定，请参阅[Voice tracing fundamentals](/langsmith/trace-voice-fundamentals)。

<Note>
Pipecat 集成需要 `langsmith[pipecat]>=0.9.7`。
</Note>

集成挂钩 Pipecat 已经发出的跨度，并将它们映射到 LangSmith 的跟踪格式，因此每个对话都成为单个 LangSmith 跟踪，每个管道阶段都有一个跨度（STT、LLM、TTS）。这涵盖了 STT/LLM/TTS 级联和语音到语音（实时）模型。实时模型（例如，`OpenAIRealtimeLLMService`）需要一次额外的调用来捕获用户的记录。参见[When using Pipecat with a realtime model](#when-using-pipecat-with-a-realtime-model)。

## 安装

安装集成以及管道使用的 Pipecat 服务附加功能：

<CodeGroup>

```bash pip
pip install "langsmith[pipecat]" "pipecat-ai[openai,local,tracing]"
```

```bash uv
uv add "langsmith[pipecat]" "pipecat-ai[openai,local,tracing]"
```

</CodeGroup>

## 设置环境变量

该集成从环境中读取您的 LangSmith 凭证，并通过 OpenTelemetry 导出到 LangSmith：

```bash .env
LANGSMITH_API_KEY=<your-langsmith-api-key>
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=pipecat-voice
OPENAI_API_KEY=<your-openai-api-key>
```

## 设置跟踪

导入 `configure_pipecat` 并在构建管道之前调用它一次。在 `PipelineTask` 上启用跟踪：

```python
from langsmith.integrations.pipecat import configure_pipecat
from pipecat.pipeline.task import PipelineParams, PipelineTask

# Install the tracer and the LangSmith span processor.
configure_pipecat()

task = PipelineTask(
    pipeline,
    params=PipelineParams(enable_metrics=True),
    enable_tracing=True,
    enable_turn_tracking=True,
    conversation_id=conversation_id,
)
```

<Note>
设置 `enable_tracing=True`、`enable_turn_tracking=True` 和 `enable_metrics=True`。跟踪需要轮次跟踪，指标驱动每个跨度上的延迟和令牌数据。
</Note>### 使用LangGraph或LangChain代理作为LLM

如果您的 LLM 阶段是进程内 [LangGraph or LangChain](/oss/python/langgraph/overview) 代理，则其模型和工具运行应嵌套在 Pipecat 的 `llm` 范围内，而不是形成单独的跟踪。为了实现这一点：

- 通过`configure_pipecat(llm_span_kind="chain")`。这避免了实际不代表推理请求的嵌套 `llm` 跨度。
- 在环境中设置`LANGSMITH_TRACING_MODE=otel`。如果没有它，这些运行将直接发布到 LangSmith 并形成单独的跟踪而不是嵌套。

### 使用您自己的跟踪器提供程序

`configure_pipecat()` 构建一个 `TracerProvider`，注册 LangSmith span 处理器，并将其连接到 Pipecat。要通过您已管理的 `TracerProvider` 发送跨度（例如，也导出到另一个 OpenTelemetry 后端的跨度），请跳过 `configure_pipecat` 并将处理器直接添加到您的提供程序：

```python
from langsmith.integrations.pipecat import PipecatLangSmithSpanProcessor

provider.add_span_processor(PipecatLangSmithSpanProcessor())
```

## 将对话分组为线程

要将对话的运行分组为 LangSmith [thread](/langsmith/threads) 以进行线程级视图以及令牌和成本聚合，请在发出其跨度之前为每个对话调用一次 `set_thread_id`：

```python
from langsmith.integrations.pipecat import configure_pipecat, set_thread_id

configure_pipecat()
set_thread_id(conversation_id)
```

## 将 Pipecat 与实时模型结合使用时对于语音到语音（实时）模型，没有单独的语音到文本阶段，因此用户的转录内容永远不会作为 OTel 范围发出。相反，它通过用户上下文聚合器的 `on_user_turn_message_added` 回调到达，Pipecat 在获得最终用户文本后会触发该回调。在未接线的情况下，迹线仅显示助手侧。

在构建上下文聚合器后立即调用 `instrument_user_aggregator` 一次，以便 SDK 为您订阅该回调并将每个记录与其轮次配对。它与您传递给 `set_thread_id` 的 id 相关，因此首先设置它并传递相同的 id：

<Note>
`instrument_user_aggregator` 需要 `langsmith[pipecat]>=0.10.6`。
</Note>

```python
from langsmith.integrations.pipecat import configure_pipecat, set_thread_id
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.services.openai.realtime.events import (
    AudioConfiguration,
    AudioInput,
    AudioOutput,
    InputAudioTranscription,
    SessionProperties,
)
from pipecat.services.openai.realtime.llm import OpenAIRealtimeLLMService

conversation_id = "..."  # any id that identifies the conversation
span_processor = configure_pipecat()
set_thread_id(conversation_id)

llm = OpenAIRealtimeLLMService(
    api_key=openai_api_key,
    settings=OpenAIRealtimeLLMService.Settings(
        model="gpt-realtime",
        session_properties=SessionProperties(
            # Enable input-audio transcription: OpenAI Realtime sends the model
            # raw audio and, by default, produces no user-side text. Without this
            # the context aggregator never fires, so the user's turns never reach
            # the trace.
            audio=AudioConfiguration(
                input=AudioInput(transcription=InputAudioTranscription()),
                output=AudioOutput(voice="marin"),
            ),
        ),
    ),
)

context = LLMContext(messages=[{"role": "system", "content": "..."}])
context_aggregator = LLMContextAggregatorPair(context, realtime_service_mode=True)
span_processor.instrument_user_aggregator(context_aggregator, conversation_id)  # capture the user transcript
```

对于OpenAI实时，还可以在会话上启用输入音频转录（`InputAudioTranscription`）；否则，模型会接收原始音频并且不会生成用户端文本，因此聚合器永远不会触发。通过聚合器本身显示用户文本的其他实时服务（例如 Gemini Live）仅需要 `instrument_user_aggregator` 调用，无需额外的会话配置。

仅针对实时模型调用`instrument_user_aggregator`。在 STT/LLM/TTS 级联中，转录本已被捕获（从语音到文本阶段），因此在那里调用它会再次记录用户的回合。## 录制对话音频

使用 Pipecat 的 [⟦T32⟧](https://docs.pipecat.ai/server/utilities/audio/audio-recording) 将对话音频附加到跟踪。将其放在 `transport.output()` 之后，以便它捕获实际播放的内容（在任何插入截断之后），将其交给集成，并在会话运行后启动它：

```python
from pipecat.processors.audio.audio_buffer_processor import AudioBufferProcessor

span_processor = configure_pipecat()

# Stereo: user on the left channel, agent on the right.
audiobuffer = AudioBufferProcessor(num_channels=2, buffer_size=32_000)
span_processor.attach_audio_buffer(audiobuffer, conversation_id=conversation_id)

pipeline = Pipeline([
    transport.input(),
    stt,
    context_aggregator.user(),
    llm,
    tts,
    transport.output(),
    audiobuffer,                     # after output(): records what was heard
    context_aggregator.assistant(),
])

await audiobuffer.start_recording()
```

集成结束时会将录音附加到对话根。底层附件API请参见[Upload files with traces](/langsmith/upload-files-with-traces)。

## 后续步骤

<CardGroup cols={2}>
  <Card title="Voice fundamentals" icon="waveform" href="/langsmith/trace-voice-fundamentals">
    跟踪语音代理的核心约定。
  </Card>
  <Card title="Upload files with traces" icon="paperclip" href="/langsmith/upload-files-with-traces">
    将对话录音附加到您的跟踪中。
  </Card>
</CardGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-pipecat.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>