<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Gemini Live applications | https://docs.langchain.com/langsmith/trace-gemini-live -->

# 跟踪 Gemini Live 应用程序

使用 LangSmith SDK 跟踪 LangSmith 中的 Gemini Live 语音代理。

<Note>
  此集成处于测试阶段，因此其 API 可能会发生变化。
</Note>

Gemini Live 是一种语音到语音模型，可通过 WebSocket 流式传输键入的事件。无论您是使用原始 `google-genai` 连接还是 Google 代理开发套件 (ADK) 进行构建，集成都会将每个对话捕获为单个 LangSmith 跟踪，其中包含转录本、模型响应、工具调用、转弯边界和中断的范围。

追踪您的 [Gemini Live](https://ai.google.dev/gemini-api/docs/live-api) 语音代理到 LangSmith。有关高级约定，请参阅[Voice tracing fundamentals](/langsmith/trace-voice-fundamentals)。

要跟踪使用 ADK 构建的非实时文本代理、工具和多代理工作流程，请参阅 [Trace Google ADK applications](/langsmith/trace-with-google-adk)。

## 选择一种方法

LangSmith 为连接 Gemini Live 的每种方式提供了跟踪集成：

* 如果直接连接`client.aio.live.connect(...)`，请使用`wrap_gemini_live`。
* 如果您使用 [Google ADK](https://google.github.io/adk-docs/streaming/) 构建，请使用 `LangSmithGoogleADKLivePlugin`。

## 安装

### 使用 Gemini Live 客户端

为原始 `google-genai` 连接安装额外的 `gemini-live`：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install "langsmith[gemini-live]"
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add "langsmith[gemini-live]"
  ```
</CodeGroup>

### 使用 Google ADK

为 ADK 应用程序安装 `google-adk-live` 额外组件：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install "langsmith[google-adk-live]"
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add "langsmith[google-adk-live]"
  ```
</CodeGroup><Note>
  ADK Live 集成需要 `langsmith[google-adk-live]>=0.9.7`。此额外功能与 `langsmith[google-adk]` 批量集成分开。
</Note>

## 设置环境变量

```bash .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_API_KEY=<your-langsmith-api-key>
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=<your-desired-langsmith-project>
GOOGLE_API_KEY=<your-google-api-key>
GEMINI_LIVE_MODEL=<your-gemini-live-model>
```

## 使用 Gemini Live 客户端

当您的应用程序使用 `client.aio.live.connect(...)` 打开 WebSocket 并拥有音频和工具循环时，请使用此方法。

### 设置跟踪

在实时配置中启用输入和输出转录。 `wrap_gemini_live` 返回连接会话的透明代理，因此您现有的接收循环、音频处理和工具调度保持不变：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

from google import genai
from google.genai import types
from langsmith.integrations.gemini_live import wrap_gemini_live

model = os.environ["GEMINI_LIVE_MODEL"]
client = genai.Client()
config = types.LiveConnectConfig(
    response_modalities=[types.Modality.AUDIO],
    input_audio_transcription=types.AudioTranscriptionConfig(),
    output_audio_transcription=types.AudioTranscriptionConfig(),
)

async with (
    client.aio.live.connect(model=model, config=config) as raw,
    wrap_gemini_live(
        raw,
        model=model,
        project_name="gemini-live-voice",
    ) as session,
):
    async for message in session.receive():
        ...  # play audio, run tools, handle barge-ins, and update the UI
```

<Note>
  转录是选择性加入的。要在跟踪中显示转录本，请在 `LiveConnectConfig` 上设置 `input_audio_transcription` 和 `output_audio_transcription`。
</Note>

### 将对话分组为线程

每个包装的会话都被捕获为其自己的跟踪，并具有自己的线程 ID。要提供 ID，例如将对话与 LangSmith [thread](/langsmith/threads) 中的相关交互进行分组，请传递 `thread_id`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
wrap_gemini_live(
    raw,
    model=model,
    thread_id=thread_id,
    project_name="gemini-live-voice",
)
```

为每个连接的 Gemini Live 会话创建一个包装器。每个包装器都拥有独立的跟踪和转录状态，因此并发对话保持独立。

### 录制对话音频将麦克风和回放音频馈送到打包的会话以附加单个立体声录音，用户位于左通道，代理位于右通道：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RECORDING_SAMPLE_RATE = 24_000

async with (
    client.aio.live.connect(model=model, config=config) as raw,
    wrap_gemini_live(
        raw,
        model=model,
        sample_rate=RECORDING_SAMPLE_RATE,
        is_agent_speaking=lambda: speaker.buffered_bytes() > 0,
    ) as session,
):
    # Record audio after playback so discarded audio from a barge-in is omitted.
    speaker.set_played_callback(session.record_agent_audio)

    async def send_mic(mic_chunk):
        await session.send_realtime_input(
            audio=types.Blob(
                data=mic_chunk,
                mime_type=f"audio/pcm;rate={microphone.sample_rate}",
            )
        )
        session.record_user_audio(
            resample_pcm16(
                mic_chunk,
                microphone.sample_rate,
                RECORDING_SAMPLE_RATE,
            )
        )
```

在包装器的`sample_rate`处将两个通道录制为PCM16。录制扬声器中的座席音频，以便附件仅反映用户听到的内容。底层附件API请参见[Upload files with traces](/langsmith/upload-files-with-traces)。

## 使用谷歌ADK

当 ADK 拥有 Gemini Live 会话和工具循环时，请使用此方法。

### 设置跟踪

导入`LangSmithGoogleADKLivePlugin`并将其注册到您的`Runner`上。它与您的 `run_live` 循环一起运行，因此您的循环仅处理音频播放、插入和 UI 更新：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from google.adk.agents.run_config import RunConfig, StreamingMode
from google.adk.runners import Runner
from google.genai import types as genai_types
from langsmith.integrations.google_adk_live import LangSmithGoogleADKLivePlugin

plugin = LangSmithGoogleADKLivePlugin(project_name="gemini-live-voice")

runner = Runner(
    app_name="voice-app",
    agent=root_agent,
    session_service=session_service,
    plugins=[plugin],
)

run_config = RunConfig(
    response_modalities=["AUDIO"],
    streaming_mode=StreamingMode.BIDI,
    input_audio_transcription=genai_types.AudioTranscriptionConfig(),
    output_audio_transcription=genai_types.AudioTranscriptionConfig(),
)

async for event in runner.run_live(
    user_id=user_id,
    session_id=adk_session.id,
    live_request_queue=queue,
    run_config=run_config,
):
    ...  # play audio, handle barge-ins, and update the UI
```

<Note>
  转录是选择性加入的。要显示成绩单，请在 `RunConfig` 上同时设置 `input_audio_transcription` 和 `output_audio_transcription`。
</Note>

<Note>
  优雅地结束时，当实时请求队列关闭时，ADK 发送其 `after_run` 回调，并且插件完成跟踪。

  在取消的运行中，例如按 Ctrl-C 停止 `run_live` 的控制台应用程序，ADK 可能不会发送该回调。在拆卸过程中调用`plugin.finalize(session_id=adk_session.id)`，以便完成跟踪和音频附件。该调用是幂等的，因此如果 ADK 的回调已经运行，它不会执行任何操作。
</Note>

### 将对话分组为线程每个对话都被捕获为其自己的跟踪，并具有自己的线程 ID。要提供 ID，例如将对话与 LangSmith [thread](/langsmith/threads) 中的相关交互进行分组，请将 `thread_id_provider` 传递给插件：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
plugin = LangSmithGoogleADKLivePlugin(
    project_name="gemini-live-voice",
    thread_id_provider=lambda: thread_id,
)
```

每个 `run_live` 调用都共享一个插件实例，并在每个对话开始时解析一次线程 ID。默认情况下，并发对话是分开的。如果您在处理并发对话的服务器上传递 `thread_id_provider`，则返回当前对话的 ID，例如通过读取每次运行开始时设置的 `ContextVar`。

### 录制对话音频

将麦克风和播放音频馈送到插件以附加单个立体声录音，用户在左声道，代理在右声道：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
plugin.record_user_audio(mic_chunk)      # user mic PCM16
plugin.record_agent_audio(played_chunk)  # agent PCM16 as played
```

在为 ADK 重新采样之前记录用户的麦克风捕获，并记录来自扬声器的座席音频。以相同的采样率馈送两个通道。该插件的 `sample_rate` 默认为 24​​ kHz。底层附件API请参见[Upload files with traces](/langsmith/upload-files-with-traces)。

## 后续步骤

<CardGroup>
  <Card title="Voice fundamentals" icon="waveform" href="/langsmith/trace-voice-fundamentals">
    跟踪语音代理的核心约定。
  </Card>

  <Card title="Upload files with traces" icon="paperclip" href="/langsmith/upload-files-with-traces">
    将对话录音附加到您的轨迹中。
  </Card>
</CardGroup>

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-gemini-live.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>