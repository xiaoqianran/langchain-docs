<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace LiveKit applications | https://docs.langchain.com/langsmith/trace-with-livekit -->

# 跟踪 LiveKit 应用程序

<Note>
此集成处于测试阶段，因此其 API 可能会发生变化。
</Note>

通过 LangSmith LiveKit 集成将您的 [LiveKit Agents](https://docs.livekit.io/agents/) 语音代理追踪到 LangSmith。有关高级约定，请参阅[Voice tracing fundamentals](/langsmith/trace-voice-fundamentals)。

<Note>
LiveKit 集成需要 `langsmith[livekit]>=0.9.7`。
</Note>

集成挂钩到 LiveKit 已经发出的跨度，并将它们映射到 LangSmith 的跟踪格式，因此每个对话都成为单个 LangSmith 跟踪：每个管道事件的跨度，加上 LiveKit 的延迟和令牌指标。

## 安装

安装集成以及代理使用的 LiveKit 插件：

<CodeGroup>

```bash pip
pip install "langsmith[livekit]" "livekit-agents[openai,silero,turn-detector]"
```

```bash uv
uv add "langsmith[livekit]" "livekit-agents[openai,silero,turn-detector]"
```

</CodeGroup>

## 设置环境变量

该集成从环境中读取您的 LangSmith 凭证，并通过 OpenTelemetry 导出到 LangSmith：

```bash .env
LANGSMITH_API_KEY=<your-langsmith-api-key>
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=<your-desired-langsmith-project>
LIVEKIT_URL=<your-livekit-url>
LIVEKIT_API_KEY=<your-livekit-api-key>
LIVEKIT_API_SECRET=<your-livekit-api-secret>
OPENAI_API_KEY=<your-openai-api-key>
```

## 设置跟踪

导入`configure_livekit`并在创建`AgentServer`之前调用它一次。它构建跟踪器提供程序，注册 LangSmith span 处理器，并将其连接到 LiveKit：

```python
from langsmith.integrations.livekit import configure_livekit
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession

# Enable tracing before creating agents.
configure_livekit()

server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    session = AgentSession(
        stt="openai/gpt-4o-mini-transcribe",
        llm="openai/gpt-4o-mini",
        tts="openai/tts-1:alloy",
    )
    await session.start(room=ctx.room, agent=Agent(instructions="You are a helpful assistant."))
```

这适用于 STT/LLM/TTS 级联和语音到语音（实时）模型。实时模型（例如，`lk_openai.realtime.RealtimeModel(...)`）需要一次额外的调用来捕获用户的记录。参见[When using LiveKit with a realtime model](#when-using-livekit-with-a-realtime-model)。

### 使用您自己的跟踪器提供程序`configure_livekit()`构建一个`TracerProvider`，注册LangSmith跨度处理器，并将其连接到LiveKit。要使用您已经管理的 `TracerProvider`，请自行构建处理器，将其添加到您的提供程序，然后使用 LiveKit 的跟踪器挂钩注册该提供程序。 LiveKit 仅通过其跟踪器绑定到的提供者发出跨度：

```python
from livekit.agents import telemetry
from opentelemetry.sdk.trace import TracerProvider

from langsmith.integrations.livekit import LiveKitLangSmithSpanProcessor

provider = TracerProvider()  # your own provider
provider.add_span_processor(LiveKitLangSmithSpanProcessor())
telemetry.set_tracer_provider(provider)
```

## 将对话分组为线程

要将对话的运行分组为 LangSmith [thread](/langsmith/threads)，以进行线程级视图以及令牌和成本聚合，请在发出跨度之前在其 `@server.rtc_session()` 处理程序内调用 `set_thread_id` 一次：

```python
from langsmith.integrations.livekit import configure_livekit, set_thread_id

configure_livekit()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    thread_id = ctx.job.id  # or any id that identifies the conversation
    set_thread_id(thread_id)
    ...
```

## 将 LiveKit 与实时模型结合使用时

对于语音到语音（实时）模型，没有单独的语音到文本步骤，因此 LiveKit 异步转录用户的音频，并通过会话的 `user_input_transcribed` 事件而不是在它发出的 OTel 跟踪上传递转录。

<Note>
`instrument_session` 需要 `langsmith[livekit]>=0.10.4`。
</Note>

在创建 `AgentSession` 之后立即调用 `instrument_session` 一次，以便 SDK 为您订阅该事件并将每个记录与其轮次配对。它通过线程 id 关联，因此首先使用 `set_thread_id` 设置它，并传递相同的 id：

```python
from langsmith.integrations.livekit import configure_livekit, set_thread_id
from livekit.plugins import openai as lk_openai

processor = configure_livekit()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    thread_id = ctx.job.id  # or any id that identifies the conversation
    set_thread_id(thread_id)

    session = AgentSession(llm=lk_openai.realtime.RealtimeModel(voice="marin"))
    processor.instrument_session(session, thread_id)  # capture the user transcript

    await session.start(room=ctx.room, agent=Agent(instructions="You are a helpful assistant."))
```仅针对实时模型调用`instrument_session`。在 STT/LLM/TTS 级联中，转录本已被捕获（从语音到文本步骤），因此在那里调用它会再次记录用户的回合。

## 录制对话音频

集成将通话录音附加到对话根范围。本地开发和制作之间捕获录音的方式有所不同。

### 开发：嵌入本地文件

在控制台和本地开发中，启用LiveKit的会话录制并将`audio_path_provider`指向`audio.ogg`LiveKit在`ctx.session_directory`下的写入。集成读取该文件并将字节嵌入跟踪中。

```python
from pathlib import Path

_audio_path: Path | None = None
configure_livekit(audio_path_provider=lambda: _audio_path)

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    global _audio_path
    _audio_path = ctx.session_directory / "audio.ogg"
    await session.start(
        room=ctx.room,
        agent=Agent(instructions="You are a helpful assistant."),
        record={"audio": True},
    )
```

在控制台模式下，还可以在命令行上传递`--record`。录音反映了向客户端播放的内容，因此插入内容会被截断。

<Warning>
不要在生产中使用`audio_path_provider`。在已部署的工作线程中，`ctx.session_directory`是一个临时临时目录，LiveKit 在会话结束时会删除它，因此没有可嵌入的持久文件。
</Warning>

### 生产：用Egress记录并附加文件在制作中，使用 [LiveKit Egress](https://docs.livekit.io/home/egress/overview/) 将房间录制到您自己的对象存储中，然后将完成的录音作为真实的音频附件附加到跟踪中。出口在呼叫结束后完成上传，因此集成会保持对话的根跨度打开，直到您提供字节：

1. 开始外出时拨打`processor.expect_recording(thread_id)`。
2. 调用后，等待出口完成，从存储中下载文件，然后调用`processor.complete_recording(thread_id, audio_bytes)`。集成嵌入字节并导出跟踪。

您必须对expect_recording 和complete_recording 使用相同的`thread_id`，以便录音与正确的对话相匹配。

```python
import os

from livekit import agents, api
from livekit.agents import Agent, AgentServer, AgentSession
from langsmith.integrations.livekit import configure_livekit, set_thread_id

RECORDING_BUCKET = os.environ["RECORDING_BUCKET"]

processor = configure_livekit()
server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    thread_id = ctx.job.id  # unique per session; ctx.room.name is "console" in console mode
    set_thread_id(thread_id)  # groups this conversation's spans into a thread
    key = f"recordings/{thread_id}.ogg"

    # Start an audio-only room-composite egress to your storage.
    lkapi = api.LiveKitAPI()  # reads LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET
    egress = await lkapi.egress.start_room_composite_egress(
        api.RoomCompositeEgressRequest(
            room_name=ctx.room.name,
            audio_only=True,
            file_outputs=[
                api.EncodedFileOutput(
                    file_type=api.EncodedFileType.OGG,
                    filepath=key,
                    s3=api.S3Upload(
                        bucket=RECORDING_BUCKET,
                        region=os.environ["AWS_REGION"],
                        access_key=os.environ["AWS_ACCESS_KEY_ID"],
                        secret=os.environ["AWS_SECRET_ACCESS_KEY"],
                    ),
                )
            ],
        )
    )
    # Hold the trace open until the recording is ready.
    processor.expect_recording(thread_id)

    async def attach_recording():
        try:
            await wait_for_egress(lkapi, egress.egress_id)  # poll until EGRESS_COMPLETE
            audio = download_from_storage(RECORDING_BUCKET, key)  # your storage client
            processor.complete_recording(thread_id, audio, name="call.ogg")
        except Exception:
            processor.complete_recording(thread_id, None)  # release without audio

    ctx.add_shutdown_callback(attach_recording)

    session = AgentSession(...)
    await session.start(room=ctx.room, agent=Agent(instructions="..."))
```

`wait_for_egress` 轮询 [⟦T35⟧](https://docs.livekit.io/home/egress/api/) 直到状态为 `EGRESS_COMPLETE`（或订阅 `egress_ended` webhook），然后 `download_from_storage` 使用云提供商的客户端读取对象。 LiveKit Egress 还会写入 [Google Cloud Storage and Azure](https://docs.livekit.io/home/egress/overview/)：将 `s3=` 替换为 `gcp=api.GCPUpload(...)` 或 `azure=api.AzureBlobUpload(...)`。

<Note>
始终调用 `complete_recording`，因为跟踪的根跨度将一直保留到其运行为止，包括使用 `data=None` 失败时。如果工作线程先停止，集成将刷新跟踪，而不会发出音频。
</Note>

## 后续步骤

<CardGroup cols={2}>
  <Card title="Voice fundamentals" icon="waveform" href="/langsmith/trace-voice-fundamentals">
    跟踪语音代理的核心约定。
  </Card>
  <Card title="Upload files with traces" icon="paperclip" href="/langsmith/upload-files-with-traces">
    将对话录音附加到您的跟踪中。
  </Card>
</CardGroup>

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-livekit.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>