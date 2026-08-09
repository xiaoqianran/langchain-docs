<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace OpenAI Realtime applications | https://docs.langchain.com/langsmith/trace-openai-realtime -->

# 跟踪 OpenAI 实时应用程序

使用 LangSmith SDK 跟踪 LangSmith 中的 OpenAI 实时语音代理。

<Note>
  此集成处于测试阶段，因此其 API 可能会发生变化。
</Note>

OpenAI Realtime 是一种语音到语音模型，可通过 WebSocket 流式传输键入的事件。无论您是使用原始连接还是 OpenAI Agents SDK 构建它，集成都会将每个对话捕获为单个 LangSmith 跟踪，并按顺序分组每个有意义的事件（脚本、模型响应和工具调用）的跨度。

追踪您的 [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime) 语音代理到 LangSmith。有关高级约定，请参阅[Voice tracing fundamentals](/langsmith/trace-voice-fundamentals)。

## 选择一种方法

有两种使用 OpenAI Realtime API 进行构建的方法，LangSmith 为每种方法提供了跟踪集成：

* 如果您直接与实时客户端连接，请使用`wrap_realtime`。
* 如果您使用 OpenAI Agents SDK 进行构建，请改用 `wrap_realtime_session`。

## 安装

`langsmith[openai-realtime]>=0.9.7` extra 提供了两个包装器：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install "langsmith[openai-realtime]"
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add "langsmith[openai-realtime]"
  ```
</CodeGroup>

## 设置环境变量

```bash .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_API_KEY=<your-langsmith-api-key>
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=<your-desired-langsmith-project>
OPENAI_API_KEY=<your-openai-api-key>
```

## 使用实时客户端

当您使用 `client.realtime.connect()` 自行打开 WebSocket 并驱动事件循环时，请使用此选项。

### 设置跟踪`wrap_realtime` 返回您连接的透明代理。您现有的 `async for event in connection` 循环、`session.update` 和工具处理保持不变：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.integrations.openai_realtime import wrap_realtime
from openai import AsyncOpenAI

client = AsyncOpenAI()

async with client.realtime.connect(model="gpt-realtime-2") as raw, wrap_realtime(
    raw,
    project_name="openai-realtime-voice",
) as connection:
    await connection.session.update(session={...})  # your existing config

    async for event in connection:
        ...  # your existing handling: play audio, run tools, update UI
```

<Note>
  每个对话都会被捕获为自己的踪迹。要将其与 LangSmith [thread](/langsmith/threads) 中的相关交互分组（例如，继续之前的会话或从文本聊天中接听），请传递 `thread_id`。跨跟踪重复使用相同的 ID 将它们的事件链接在一起。
</Note>

自动处理嵌套在该事件下的事件时运行的任何 [⟦T15⟧](/langsmith/annotate-code) 工具。

<Note>
  启用 `input_audio_transcription` 和 `session.update` 中的代理记录，以便将记录作为跟踪的一部分进行查看。
</Note>

### 录制对话音频

当您向代理提供麦克风并播放音频时，它会将单个立体声录音（用户左侧，代理右侧）附加到跟踪。要标记插入，请使用 `is_agent_speaking`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import base64

async with client.realtime.connect(model="gpt-realtime-2") as raw, wrap_realtime(
    raw,
    is_agent_speaking=lambda: speaker.buffered_bytes() > 0,
) as connection:
    # Record the agent's audio from the speaker, so the recording reflects only
    # what was played — audio a barge-in discards before playback is never recorded.
    speaker.set_played_callback(connection.record_agent_audio)

    # Record the user's mic where you send it to the model.
    async def send_mic(mic_chunk):
        await connection.input_audio_buffer.append(
            audio=base64.b64encode(mic_chunk).decode("ascii")
        )
        connection.record_user_audio(mic_chunk)          # user mic PCM16 as sent

    async for event in connection:
        if event.type == "response.output_audio.delta":
            speaker.play(base64.b64decode(event.delta))
```

<Note>
  您应该从扬声器中录制座席的音频，以便录音仅反映播放的内容。在插入期间，生成的音频在播放前被丢弃，并且不应被记录。这样做可以使跟踪与用户实际听到的内容保持一致。
</Note>

## 使用 OpenAI Agents SDK当您使用 [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/realtime/guide/) (`RealtimeAgent` / `RealtimeRunner`) 构建代理时，请使用此选项，该代理拥有转弯和工具调用循环。

<Note>
  Agents SDK 的内置实时跟踪上传到 OpenAI 自己的仪表板。调用 `agents.set_tracing_disabled(True)` 以避免第二个单独的上传路径。
</Note>

### 设置跟踪

`wrap_realtime_session` 包装`RealtimeSession` 并为您输入。像原始版本一样迭代它； SDK 运行工具并管理轮次：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from agents import set_tracing_disabled
from agents.realtime import RealtimeAgent, RealtimeRunner
from langsmith.integrations.openai_realtime import wrap_realtime_session

set_tracing_disabled(True)

runner = RealtimeRunner(
    starting_agent=RealtimeAgent(name="assistant", instructions="...", tools=[...]),
)
session = await runner.run()

async with wrap_realtime_session(
    session,
    project_name="openai-realtime-voice",
) as conn:
    async for event in conn:
        ...  # your handling: play audio, update UI
```

对话记录是根据会话的 `history` 快照重建的，因此即使 SDK 将消息作为部分流传输，消息也会出现。

<Note>
  每个对话都会被捕获为自己的踪迹。要将其与 LangSmith [thread](/langsmith/threads) 中的相关交互分组，例如继续之前的会话或从文本聊天中接听，请传递 `thread_id`。跨跟踪重复使用相同的 ID 将它们的事件链接在一起。
</Note>

### 录制对话音频

向代理提供麦克风并播放音频：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Record the agent's audio from the speaker, so the recording reflects only
# what was played — audio a barge-in discards before playback is never recorded.
speaker.set_played_callback(conn.record_agent_audio)

# Record the user's mic where you send it to the session.
async def send_mic(mic_chunk):
    await conn.send_audio(mic_chunk)
    conn.record_user_audio(mic_chunk)               # user mic PCM16 as sent

async for event in conn:
    if event.type == "audio":
        speaker.play(event.audio.data)
```

<Note>
  您应该从扬声器中录制座席的音频，以便录音仅反映播放的内容。在插入期间，生成的音频在播放前被丢弃，并且不应被记录。这样做可以使跟踪与用户实际听到的内容保持一致。
</Note>## 后续步骤

<CardGroup>
  <Card title="Voice fundamentals" icon="waveform" href="/langsmith/trace-voice-fundamentals">
    跟踪语音代理的核心约定。
  </Card>

  <Card title="Upload files with traces" icon="paperclip" href="/langsmith/upload-files-with-traces">
    将对话录音附加到您的轨迹中。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-openai-realtime.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>