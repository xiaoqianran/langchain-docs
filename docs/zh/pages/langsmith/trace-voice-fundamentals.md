<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Voice tracing fundamentals | https://docs.langchain.com/langsmith/trace-voice-fundamentals -->

# 语音追踪基础知识

[Tracing](/langsmith/observability-concepts#traces) 语音代理与跟踪文本代理不同。对话是连续的、双向的且可中断的：用户通过代理进行交谈，在句子中间改变主题，并期望亚秒级响应。为了调试和评估这些系统，您的跟踪需要将对话捕获为单个音频感知单元，而不是一系列断开连接的文本交换。

本页介绍了 LangSmith 中跟踪语音应用程序的核心约定。无论您使用哪个框架或模型提供程序（[OpenAI Realtime](/langsmith/trace-openai-realtime)、[Gemini Live](/langsmith/trace-gemini-live)、[LiveKit](/langsmith/trace-with-livekit)、[Pipecat](/langsmith/trace-with-pipecat) 或您自己的），请遵循这些模式。

<Note>
这些约定假设您通过受支持的 [tracing setups](/langsmith/observability) 之一将跟踪导出到 LangSmith。关于UI中的音频渲染和播放，请参阅[Log multimodal traces](/langsmith/log-multimodal-traces)和[Upload files with traces](/langsmith/upload-files-with-traces)。
</Note>

## 两种架构，两种走线形状

构建语音代理的方式决定了跟踪的外观。有两种常见的架构，它们产生根本不同的痕迹。

### 级联级联将单独的单一用途模型链接在一起：语音到文本 (STT) 转录用户的音频，语言模型 (LLM) 对文本进行推理并决定做什么，文本到语音 (TTS) 合成回复。中间件、工具调用和检索步骤介于两者之间。

由于每个阶段都是具有清晰输入和输出的离散模型调用，因此级联跟踪就像任何其他代理管道一样。跟踪是`STT`、`LLM`、`TTS`、工具和中间件运行的树：各个阶段可以并行运行，并且对话的每一轮都会重复一个新的 STT → LLM → TTS 循环。这些运行具有有意义的输入/输出对（音频输入→转录输出，提示输入→完成输出）。

构建级联语音代理的两个最常见的框架是[LiveKit](/langsmith/trace-with-livekit)和[Pipecat](/langsmith/trace-with-pipecat)。

### 语音到语音 (S2S)

语音到语音模型（例如 [OpenAI Realtime API](/langsmith/trace-openai-realtime) 或 [Gemini Live](/langsmith/trace-gemini-live)）本地处理音频并通过单个持久连接（通常是 WebSocket）回复音频。没有可追踪的 STT/LLM/TTS 分解。相反，模型服务器和您的客户端通过线路交换**事件**流：音频块、转录片段、工具调用请求、转弯边界、中断和错误。跟踪的自然单位是**事件负载**，而不是请求/响应对。您记录的每个事件都会成为一个跨度，其内容是穿过线路的有效负载。

本页的其余部分描述了适用于这两种体系结构的约定。提供程序指南涵盖了 [OpenAI Realtime](/langsmith/trace-openai-realtime) 和 [Gemini Live](/langsmith/trace-gemini-live) 的事件流细节。

## 核心约定

这些是我们建议在 LangSmith 中充分利用语音轨迹的做法。您应该跟踪最适合您的基础设施和实现的语音应用程序，但遵循我们在此建议的结构将有助于使您的跟踪保持一致并易于调试和评估。

我们推荐三个高级别会议：

1. [**Trace each conversation as a single trace**](#trace-each-conversation-as-a-single-trace)，而不是将其分割成多个迹线。
2. [**Record a single combined audio file**](#record-a-single-combined-audio-file) 并将其附加到根运行。
3. [**Mark the trace as audio**](#mark-the-trace-as-audio) 与 `ls_modality` 一起渲染和过滤为语音轨迹。

### 将每个对话作为单个跟踪进行跟踪对话是一次交互，因此我们建议将其保留在单个跟踪中，并将各个模型调用或事件嵌套在代表整个对话的一个根运行下方。

不要将对话分成多个跟踪。如果您为每个交换启动新的跟踪，您将丢失**之间**交换中存在的信息：

- **中断**：当用户与座席交谈并且座席停止（打断）时。
- **时间和延迟**：发言者之间的间隙，以及客服人员响应所需的时间。
- **上下文**：引用对话的早期部分。
- **对话级结果**：用户的目标是否最终得到解决。

根运行下挂起的内容取决于您的 [architecture](#two-architectures-two-trace-shapes)。对于 [cascade](#cascade)，子级是模型调用和中间件：

```text
conversation                      ← root run (whole conversation; combined audio; ls_modality="audio")
│
├─ stt                            ← a transcription call
├─ llm                            ← a model call (may include middleware and tool runs)
├─ tts                            ← a synthesis call
└─ ...                            ← the pattern repeats as the conversation continues
```

对于 [speech-to-speech](#speech-to-speech-s2s) 代理，子级是穿过套接字的 **事件**：

```text
conversation                      ← root run (whole conversation; combined audio; ls_modality="audio")
│
├─ input_transcription            ← a fragment of the user's speech transcript
├─ output_transcription           ← a fragment of the agent's speech transcript
├─ function_call: get_weather     ← the model requested a tool
├─ function_response: get_weather ← the tool result heading back to the model
├─ turn_complete                  ← a turn boundary reported by the server
└─ interrupted                    ← the server detected user barge-in
```

<Note>
语音代理没有可靠的“转弯”概念。扬声器重叠、中断和减弱。不要将跑步分组为合成回合。相反，跟踪实际单元：级联中的模型调用，或语音到语音流中的事件负载。
</Note>有关分组相关运行的背景信息，请参阅[Nest traces](/langsmith/nest-traces)。要为一个用户分组多个单独的会话，请使用 [Threads](/langsmith/threads)。

### 录制单个组合音频文件

将**一个**音频文件附加到包含**用户和代理的根运行，记录自**实际播放给客户端的内容**，而不是模型生成的音频。

在客户端记录。一种常见的方法是立体声 WAV，其中一个通道上有用户麦克风，而另一个通道上有扬声器捕获的座席语音。这很重要，因为生成的音频和听到的音频不是一回事：网络延迟、丢弃或重新排序的数据包以及插入都会改变用户实际体验。打断特工说话的插话应该在录音中被截断，因为这就是发生的事情。记录播放的内容，而不是生成但可能从未听过的内容，使跟踪忠实于真实的交互。

使用 [attachments API](/langsmith/upload-files-with-traces) 附加文件：

```python Python
from langsmith import traceable
from langsmith.schemas import Attachment

@traceable(name="conversation", metadata={"ls_modality": "audio"})
def run_conversation(session_id: str, conversation_audio: bytes):
    # conversation_audio: a single recording of what was played to the client
    # (e.g. stereo WAV: user mic on L, agent speech at the speaker on R)
    ...
    return {"conversation": Attachment(mime_type="audio/wav", data=conversation_audio)}
```

<Tip>
音频文件可能很大。对于大批量生产工作负载，请考虑使用压缩格式（例如 MP3 或 Opus）进行下采样，或对完整录制的对话进行采样。
</Tip>### 将轨迹标记为音频

在根运行上将 `ls_modality` 元数据字段设置为 `"audio"`。这会将跟踪标记为语音跟踪，以便 LangSmith 可以适当地渲染它，这样您就可以在项目中使用 [filter](/langsmith/filter-traces-in-application) 来处理语音跟踪。

```python Python
from langsmith import traceable

@traceable(
    name="conversation",
    metadata={"ls_modality": "audio"},
)
def run_conversation(session_id: str):
    ...
```

<Note>
其他`ls_`元数据字段，请参阅[Metadata parameters reference](/langsmith/ls-metadata-parameters)。
</Note>


## 后续步骤

<CardGroup cols={2}>
  <Card title="Trace OpenAI Realtime" icon="microphone" href="/langsmith/trace-openai-realtime">
    跟踪基于 OpenAI 实时 API 构建的语音代理。
  </Card>
  <Card title="Trace Gemini Live" icon="microphone" href="/langsmith/trace-gemini-live">
    跟踪基于 Gemini Live API 构建的语音代理。
  </Card>
  <Card title="Trace LiveKit" icon="microphone" href="/langsmith/trace-with-livekit">
    跟踪使用 LiveKit Agents 构建的语音代理。
  </Card>
  <Card title="Trace Pipecat" icon="microphone" href="/langsmith/trace-with-pipecat">
    使用 Pipecat 构建的跟踪语音代理。
  </Card>
  <Card title="Upload files with traces" icon="paperclip" href="/langsmith/upload-files-with-traces">
    将对话录音附加到您的跟踪中。
  </Card>
  <Card title="Log multimodal traces" icon="photo" href="/langsmith/log-multimodal-traces">
    在 LangSmith UI 中渲染音频和其他媒体。
  </Card>
</CardGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-voice-fundamentals.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>