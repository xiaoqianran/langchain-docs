<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Join & rejoin streams | https://docs.langchain.com/oss/python/langchain/frontend/join-rejoin -->

# 加入和重新加入流

与正在运行的代理流断开连接并重新连接

通过加入和重新加入，您可以在不停止代理的情况下断开与正在运行的代理流的连接，然后稍后重新连接到它。当客户端离开时，代理继续在服务器端执行，并且您可以准确地从上次中断的位置继续执行流。

<PatternEmbed />

<Note>
  此功能需要[LangGraph Agent Server](/oss/python/langgraph/local-server)。使用 `langgraph dev` 或 [deploy it to LangSmith](/langsmith/deployment) 在本地运行代理以使用此模式。
</Note>

## 为什么加入和重新加入？

传统的流 API 将客户端和服务器紧密耦合：如果客户端断开连接，流就会丢失。加入和重新加入打破了这种耦合，从而实现了几种重要的模式：* **网络中断**：在手机信号塔或 Wi-Fi 网络之间移动的移动用户可以无缝恢复
* **页面导航**：用户离开聊天页面并稍后返回而不会丢失进度
* **移动后台**：被操作系统暂停的应用程序可以在前台时重新加入流
* **长时间运行的任务**：代理执行多分钟的操作（研究、代码生成、数据分析），用户无需保持页面打开
* **多设备切换**：在手机上开始对话，在桌面上重新加入

## 核心概念

加入/重新加入模式涉及三个关键机制：|方法/选项|目的|
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `threadId` |将流绑定到您想要观察的 LangGraph 线程 |
| `onThreadId` |保留新创建的线程 ID，以便重新挂载可以重新连接 |
| `stream.disconnect()` |保留流客户端，而代理继续在服务器端运行 |
|使用相同的`threadId`重新安装 |重新附加到该线程的正在进行的工作 |

<Note>
  **加入/重新加入使用 `stream.disconnect()`，而不是 `stream.stop()`。** 默认情况下，`stream.stop()` **取消活动运行**：它断开客户端连接*并*取消服务器上的运行。对于加入/重新加入，请致电 `stream.disconnect()`（`stop({ cancel: false })` 的别名），以便客服人员在您离开时继续处理。

  要从应用程序代码中显式取消执行，请使用 `stream.stop()` 或 [⟦T18⟧](https://reference.langchain.com/javascript/langchain-langgraph-sdk/client/RunsClient/cancel)。
</Note>

## 设置`useStream`

关键的设置步骤是坚持`threadId`。当组件重新安装时
相同的线程 ID，流附加到线程的当前状态和任何
飞行中运行。<Info>
  代码示例使用 `useStream<typeof myAgent>` 来实现类型安全的流状态。请参阅 [Python](/oss/python/langchain/frontend/overview#type-inference) 或 [JavaScript](/oss/javascript/langchain/frontend/overview#type-inference) 后端的类型推断。
</Info>

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";
  import { useCallback, useState } from "react";

  function Chat() {
    const [connected, setConnected] = useState(true);
    const [mountKey, setMountKey] = useState(0);
    const [threadId, setThreadId] = useState<string | null>(
      () => sessionStorage.getItem("activeThreadId"),
    );

    const stream = useStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "join_rejoin",
      threadId,
      onThreadId(id) {
        setThreadId(id);
        if (id) sessionStorage.setItem("activeThreadId", id);
      },
    });

    const disconnect = useCallback(() => {
      void stream.disconnect();
      setConnected(false);
    }, [stream]);

    const rejoin = useCallback(() => {
      setMountKey((key) => key + 1);
      setConnected(true);
    }, []);

    return (
      <div key={mountKey}>
        <ConnectionStatus connected={connected} />
        <MessageList messages={stream.messages} />
        <ChatControls
          stream={stream}
          threadId={threadId}
          connected={connected}
          onDisconnect={disconnect}
          onRejoin={rejoin}
        />
      </div>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";
  import { ref } from "vue";

  const connected = ref(true);
  const mountKey = ref(0);
  const threadId = ref<string | null>(sessionStorage.getItem("activeThreadId"));

  const stream = useStream<typeof myAgent>({
    apiUrl: "http://localhost:2024",
    assistantId: "join_rejoin",
    threadId,
    onThreadId(id) {
      threadId.value = id;
      if (id) sessionStorage.setItem("activeThreadId", id);
    },
  });

  function disconnect() {
    void stream.disconnect();
    connected.value = false;
  }

  function rejoin() {
    mountKey.value += 1;
    connected.value = true;
  }
  </script>

  <template>
    <div :key="mountKey">
      <ConnectionStatus :connected="connected" />
      <MessageList :messages="stream.messages" />
      <ChatControls
        :stream="stream"
        :threadId="threadId"
        :connected="connected"
        @disconnect="disconnect"
        @rejoin="rejoin"
      />
    </div>
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream } from "@langchain/svelte";

    let connected = $state(true);
    let mountKey = $state(0);
    let threadId = $state<string | null>(sessionStorage.getItem("activeThreadId"));

    const stream = useStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "join_rejoin",
      threadId: () => threadId,
      onThreadId(id) {
        threadId = id;
        if (id) sessionStorage.setItem("activeThreadId", id);
      },
    });

    function disconnect() {
      void stream.disconnect();
      connected = false;
    }

    function rejoin() {
      mountKey += 1;
      connected = true;
    }
  </script>

  <div key={mountKey}>
    <ConnectionStatus {connected} />
    <MessageList messages={stream.messages} />
    <ChatControls
      {threadId}
      {connected}
      onDisconnect={disconnect}
      onRejoin={rejoin}
    />
  </div>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component, signal } from "@angular/core";
  import { injectStream } from "@langchain/angular";

  @Component({
    selector: "app-chat",
    template: `
      <connection-status [connected]="connected()" />
      <message-list [messages]="stream.messages()" />
      <chat-controls
        [stream]="stream"
        [threadId]="threadId()"
        [connected]="connected()"
        (disconnect)="disconnect()"
        (rejoin)="rejoin()"
      />
    `,
  })
  export class ChatComponent {
    threadId = signal<string | null>(sessionStorage.getItem("activeThreadId"));
    connected = signal(true);
    mountKey = signal(0);

    stream = injectStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "join_rejoin",
      threadId: this.threadId,
      onThreadId: (id) => {
        this.threadId.set(id);
        if (id) sessionStorage.setItem("activeThreadId", id);
      },
    });

    disconnect() {
      void this.stream.disconnect();
      this.connected.set(false);
    }

    rejoin() {
      this.mountKey.update((key) => key + 1);
      this.connected.set(true);
    }
  }
  ```
</CodeGroup>

## 提交消息

正常提交消息。线程 ID 绑定允许稍后重新挂载
重新连接到同一对话：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream.submit({ messages: [{ type: "human", content: text }] });
```

## 断开与流的连接

调用 `stream.disconnect()` 离开流而不取消运行。代理继续在服务器端进行处理。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await stream.disconnect();
// equivalent to: await stream.stop({ cancel: false })
```

不要在这里使用`stream.stop()`——默认情况下它会取消服务器上的运行。

拨打`disconnect()`后：

* `stream.isLoading` 变为 `false`
* 你自己的`connected`标志也应该变成`false`
* 消息列表保留直到断开连接点为止收到的所有消息
* 代理继续在服务器上运行
* 在您重新加入之前不会收到新消息

## 重新加入流

使用保存的线程 ID 重新挂载流使用者以重新连接。在 React 中，
演示碰撞了 `mountKey`；在其他框架中，使用等效的 remount 或
条件渲染模式：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
setMountKey((key) => key + 1);
setConnected(true);
```

重新加入后：* `connected` 变为 `true`
* 断开连接时生成的任何消息都会被传递
* 新的流媒体消息实时恢复
* 如果代理仍在运行，则`stream.isLoading`变为`true`；如果有
  已经完成，您立即收到最终状态

## 最佳实践

* **使用 `disconnect()` 加入/重新加入，`stop()` 取消**：导航离开或后台应用程序应调用 `stream.disconnect()`。面向用户的“停止”或“取消”按钮应调用`stream.stop()`（或[⟦T38⟧](https://reference.langchain.com/javascript/langchain-langgraph-sdk/client/RunsClient/cancel)）。
* **始终保存线程ID**：没有它，重新加入是不可能的。使用组件状态和持久存储来实现弹性。
* **显示清晰的连接状态**：用户应该始终知道他们是否正在接收实时更新或查看快照。
* **可见性更改时自动重新加入**：使用页面可见性 API 在用户返回选项卡时自动重新加入。
* **设置合理的超时**：如果重新加入尝试花费的时间太长，则回退到获取线程历史记录。
* **清理陈旧线程**：当用户重新启动或后端报告线程不可用时，删除持久的线程ID。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/join-rejoin.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>