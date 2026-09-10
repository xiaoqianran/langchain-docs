<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace LiveKit applications | https://docs.langchain.com/langsmith/trace-with-livekit -->

# 跟踪 LiveKit 应用程序

<Note>
此集成处于测试阶段，因此其 API 可能会发生变化。
</Note>

使用 LangSmith LiveKit 集成来跟踪您的 [LiveKit Agents](https://docs.livekit.io/agents/) 语音代理，包括他们的文字记录和录音。有关高级约定，请参阅[Voice tracing fundamentals](/langsmith/trace-voice-fundamentals)。

<Note>
此设置需要 `langsmith[livekit]>=0.11.2` 和 `livekit-agents>=1.6`。 LiveKit Agents 1.7 及更高版本需要 `langsmith[livekit]>=0.12.4`。
</Note>

每个对话都显示为一个 LangSmith 跟踪及其管道事件、延迟和令牌指标。

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

在创建 `AgentServer` 之前调用一次 `configure_livekit`。

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
    await session.start(
        room=ctx.room,
        agent=Agent(instructions="You are a helpful assistant."),
        record={"audio": True},
    )
```

`configure_livekit()` 默认使用 LiveKit 会话录音。 `record={"audio": True}` 选项告诉 LiveKit 创建录音。

此设置适用于 STT/LLM/TTS 级联和语音到语音（实时）模型。实时模型需要一次额外的调用来捕获用户的记录。欲了解更多信息，请参阅[Use a realtime model](#use-a-realtime-model)。

### 使用您自己的跟踪器提供程序如果您的应用程序已经管理 OpenTelemetry `TracerProvider`，请将 LangSmith 处理器添加到该提供程序并将其注册到 LiveKit：

```python
from langsmith.integrations.livekit import LiveKitLangSmithSpanProcessor
from livekit.agents import telemetry
from opentelemetry.sdk.trace import TracerProvider

provider = TracerProvider()  # your own provider
processor = LiveKitLangSmithSpanProcessor()
provider.add_span_processor(processor)
telemetry.set_tracer_provider(provider)
```

## 将对话分组为线程

要将对话的运行分组为 LangSmith [thread](/langsmith/threads)，请在会话处理程序内调用 `set_thread_id`。为每个活动会话使用唯一的 ID：

```python
from langsmith.integrations.livekit import configure_livekit, set_thread_id

configure_livekit()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    thread_id = ctx.job.id  # or any id that identifies the conversation
    set_thread_id(thread_id)
    ...
```

## 使用实时模型

对于语音到语音（实时）模型，请在创建 `AgentSession` 后调用 `instrument_session` 来捕获用户的转录内容。将相同的线程ID传递给`set_thread_id`和`instrument_session`：

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

    await session.start(
        room=ctx.room,
        agent=Agent(instructions="You are a helpful assistant."),
        record={"audio": True},
    )
```

仅针对实时模型调用`instrument_session`。 STT/LLM/TTS 级联已经捕获了用户的转录，因此在那里调用它会记录每个用户转动两次。

## 录制对话音频

默认情况下，集成使用 LiveKit 的会话记录。当您录制到外部存储时，请使用 Egress 模式。

### 使用 LiveKit 的会话录制进行录制

打开 LiveKit 的会话录制。

```python
from langsmith.integrations.livekit import configure_livekit
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession

configure_livekit()

server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    session = AgentSession(...)
    await session.start(
        room=ctx.room,
        agent=Agent(instructions="You are a helpful assistant."),
        record={"audio": True},
    )
```

默认情况下，LiveKit 集成将从 LiveKit 捕获录制内容（如果存在）。<Note>
在控制台模式下，还可以在命令行上传递 `--record` (`python agent.py console --record`)。如果没有它，LiveKit 会创建记录器但不会启动它，因此没有要附加的文件。录音反映了向客户端播放的内容，因此插入内容会被截断。
</Note>

### 记录出口

当您想要在自己的对象存储中录制或需要视频时，请使用[LiveKit Egress](https://docs.livekit.io/home/egress/overview/)。出口记录传送需要线程 ID。配置 Egress 的集成，然后在 Egress 文件可用后调用 `complete_recording`：

```python
import asyncio
import os
import time

from langsmith.integrations.livekit import configure_livekit, set_thread_id
from livekit import agents, api
from livekit.agents import Agent, AgentServer, AgentSession

RECORDING_BUCKET = os.environ["RECORDING_BUCKET"]

processor = configure_livekit(
    recording_mode="egress",
    recording_timeout_seconds=180,
)
server = AgentServer()

async def wait_for_egress(
    lkapi: api.LiveKitAPI,
    egress_id: str,
    timeout_seconds: float = 120,
) -> api.EgressInfo:
    deadline = time.monotonic() + timeout_seconds
    failed_statuses = {
        api.EgressStatus.EGRESS_FAILED,
        api.EgressStatus.EGRESS_ABORTED,
        api.EgressStatus.EGRESS_LIMIT_REACHED,
    }
    while time.monotonic() < deadline:
        response = await lkapi.egress.list_egress(
            api.ListEgressRequest(egress_id=egress_id)
        )
        if response.items:
            info = response.items[0]
            if info.status == api.EgressStatus.EGRESS_COMPLETE:
                return info
            if info.status in failed_statuses:
                raise RuntimeError(f"Egress failed with status {info.status}")
        await asyncio.sleep(1)
    raise TimeoutError(f"Egress {egress_id} did not complete in time")

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    thread_id = ctx.job.id  # unique per session; ctx.room.name is "console" in console mode
    set_thread_id(thread_id)  # routes the Egress recording to this trace
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

    async def attach_recording():
        try:
            info = await wait_for_egress(lkapi, egress.egress_id)  # poll until EGRESS_COMPLETE
            audio = download_from_storage(RECORDING_BUCKET, key)  # your storage client
            processor.complete_recording(
                thread_id,
                data=audio,
                # EgressInfo.started_at is a Unix timestamp in nanoseconds. This is
                # when the egress worker began recording, which is what aligns the
                # audio start with the trace.
                started_at=info.started_at / 1e9,
            )
        except Exception:
            processor.complete_recording(thread_id, data=None)

    ctx.add_shutdown_callback(attach_recording)

    session = AgentSession(...)
    await session.start(room=ctx.room, agent=Agent(instructions="..."))
```

`download_from_storage`代表您的存储客户端的下载操作。默认附件名称和 MIME 类型为 `recording.ogg` 和 `audio/ogg`。如果您的 Egress 输出使用其他格式，请在 `complete_recording` 中设置 `name` 或 `mime_type`。


<Note>
始终调用 `complete_recording`，包括失败时调用 `data=None`。否则，集成会等待`recording_timeout_seconds`（默认情况下为 30 秒），然后再导出不带音频的跟踪。使用`complete_recording`捕获Egress录音需要设置`thread_id`。
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