<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox SDK usage | https://docs.langchain.com/langsmith/sandbox-sdk -->

# 沙盒SDK使用

使用 Python 或 TypeScript SDK 以编程方式创建和管理沙箱。

[LangSmith SDK](/langsmith/reference) 提供了一个编程接口来创建沙箱并与沙箱交互。

## 安装

<CodeGroup>
  ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # uv
  uv add "langsmith[sandbox]"

  # pip
  pip install "langsmith[sandbox]"
  ```

  ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langsmith
  # or
  yarn add langsmith
  ```
</CodeGroup>

Python 的 `[sandbox]` 额外安装了 `websockets`，它支持实时流和 `timeout=0`。如果没有它，`run()`会自动回退到 HTTP。对于 TypeScript，安装用于 WebSocket 流的可选 `ws` 包：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install ws
```

## 创建并运行沙箱

当您想要从可重用的自定义文件系统映像启动时，传递快照 ID 或名称；有关该流程，请参阅[Snapshots](/langsmith/sandbox-snapshots)。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.sandbox import SandboxClient

  # Client uses LANGSMITH_ENDPOINT and LANGSMITH_API_KEY from environment
  client = SandboxClient()

  # Create a sandbox with the default runtime and run code
  with client.sandbox() as sb:
      result = sb.run("python -c 'print(2 + 2)'")
      print(result.stdout)  # "4\n"
      print(result.success)  # True
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { SandboxClient } from "langsmith/sandbox";

  // Client uses LANGSMITH_ENDPOINT and LANGSMITH_API_KEY from environment
  const client = new SandboxClient();

  // Create a sandbox with the default runtime and run code
  const sandbox = await client.createSandbox();
  const result = await sandbox.run("node -e 'console.log(2 + 2)'");
  console.log(result.stdout); // "4\n"

  // Don't forget to clean up
  await sandbox.delete();
  ```
</CodeGroup>

## 运行命令

每个 `run()` 调用都会返回一个 `ExecutionResult` 以及 `stdout`、`stderr`、`exit_code` 和 `success`。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  with client.sandbox() as sb:
      result = sb.run("echo 'Hello, World!'")

      print(result.stdout)     # "Hello, World!\n"
      print(result.stderr)     # ""
      print(result.exit_code)  # 0
      print(result.success)    # True

      # Commands that fail return non-zero exit codes
      result = sb.run("exit 1")
      print(result.success)    # False
      print(result.exit_code)  # 1
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const sandbox = await client.createSandbox();
  try {
    const result = await sandbox.run("echo 'Hello, World!'");

    console.log(result.stdout);     // "Hello, World!\n"
    console.log(result.stderr);     // ""
    console.log(result.exit_code);  // 0

    // Pass environment variables and working directory
    const envResult = await sandbox.run("echo $MY_VAR", {
      env: { MY_VAR: "test-value" },
      cwd: "/tmp",
    });
  } finally {
    await sandbox.delete();
  }
  ```
</CodeGroup>

## 流输出

对于长时间运行的命令，使用回调或`CommandHandle`实时流式输出。

### 带有回调的流

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import sys

  with client.sandbox() as sb:
      result = sb.run(
          "make build",
          timeout=600,
          on_stdout=lambda s: print(s, end=""),
          on_stderr=lambda s: print(s, end="", file=sys.stderr),
      )
      print(f"\nBuild {'succeeded' if result.success else 'failed'}")
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const result = await sandbox.run("make build", {
    timeout: 600,
    onStdout: (data) => process.stdout.write(data),
    onStderr: (data) => process.stderr.write(data),
  });
  console.log(`Exit code: ${result.exit_code}`);
  ```
</CodeGroup>

### 使用 CommandHandle 进行流式传输

设置 `wait=False` 以获得 `CommandHandle` 以完全控制输出流。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  with client.sandbox() as sb:
      handle = sb.run("make build", timeout=600, wait=False)

      print(f"Command ID: {handle.command_id}")

      for chunk in handle:
          prefix = "OUT" if chunk.stream == "stdout" else "ERR"
          print(f"[{prefix}] {chunk.data}", end="")

      result = handle.result
      print(f"\nExit code: {result.exit_code}")
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const handle = await sandbox.run("python train.py", {
    wait: false,
    timeout: 600,
  });

  console.log(`Command ID: ${handle.commandId}`);
  console.log(`PID: ${handle.pid}`);

  for await (const chunk of handle) {
    if (chunk.stream === "stdout") {
      process.stdout.write(chunk.data);
    } else {
      process.stderr.write(chunk.data);
    }
  }

  const result = await handle.result;
  console.log(`Exit code: ${result.exit_code}`);
  ```
</CodeGroup>

### 发送 stdin 和终止命令

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  with client.sandbox() as sb:
      handle = sb.run(
          "python -c 'name = input(\"Name: \"); print(f\"Hello {name}\")'",
          timeout=30,
          wait=False,
      )

      for chunk in handle:
          if "Name:" in chunk.data:
              handle.send_input("World\n")
          print(chunk.data, end="")

      result = handle.result
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const handle = await sandbox.run("python -i", { wait: false });

  // Send input to stdin
  handle.sendInput("print(2 + 2)\n");
  handle.sendInput("exit()\n");

  for await (const chunk of handle) {
    process.stdout.write(chunk.data);
  }
  ```
</CodeGroup>

终止正在运行的命令：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  with client.sandbox() as sb:
      handle = sb.run("python server.py", timeout=0, wait=False)

      for chunk in handle:
          print(chunk.data, end="")
          if "Ready" in chunk.data:
              break

      handle.kill()
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const handle = await sandbox.run("sleep 300", { wait: false });
  handle.kill();

  const result = await handle.result;
  console.log(result.exit_code); // non-zero
  ```
</CodeGroup>

### 重新连接到正在运行的命令如果客户端断开连接，请使用命令 ID 重新连接：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  with client.sandbox() as sb:
      handle = sb.run("make build", timeout=600, wait=False)
      command_id = handle.command_id

      # Later, possibly in a different process
      handle = sb.reconnect(command_id)
      for chunk in handle:
          print(chunk.data, end="")
      result = handle.result
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const handle = await sandbox.run("long-task", { wait: false });
  const commandId = handle.commandId;

  // Later, or from a different client
  const newHandle = await sandbox.reconnect(commandId);
  for await (const chunk of newHandle) {
    process.stdout.write(chunk.data);
  }
  ```
</CodeGroup>

## 文件操作

在沙箱中读写文件：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  with client.sandbox() as sb:
      # Write a file
      sb.write("/app/script.py", "print('Hello from file!')")

      # Run the script
      result = sb.run("python /app/script.py")
      print(result.stdout)  # "Hello from file!\n"

      # Read a file (returns bytes)
      content = sb.read("/app/script.py")
      print(content.decode())  # "print('Hello from file!')"

      # Write binary files
      sb.write("/app/data.bin", b"\x00\x01\x02\x03")
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const sandbox = await client.createSandbox();
  try {
    // Write a file (string content)
    await sandbox.write("/app/script.py", "print('Hello from file!')");

    // Run the script
    const result = await sandbox.run("python /app/script.py");
    console.log(result.stdout);  // "Hello from file!\n"

    // Read a file (returns Uint8Array)
    const content = await sandbox.read("/app/script.py");
    console.log(new TextDecoder().decode(content));

    // Write binary files
    await sandbox.write("/app/data.bin", new Uint8Array([0x00, 0x01, 0x02, 0x03]));
  } finally {
    await sandbox.delete();
  }
  ```
</CodeGroup>

## 沙盒寿命和保留

沙箱由固定于**空闲的两阶段保留模型控制
活动**和**`stopped`**状态。

|领域|它控制什么 |当它发生时 |
| ------------------------ | | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- || `idle_ttl_seconds` |在闲置这么多秒后，启动器会停止沙箱。任何命令执行或文件 I/O 都会重置计时器。 `0` 禁用怠速停止。                                                                               |省略时默认为 `600`（10 分钟）。                                |
| `delete_after_stop_seconds` |一旦沙箱进入`stopped`状态，该计时器就会启动。过了一段时间后，沙箱行+文件系统克隆将被服务器端扫描永久删除。 `0` 禁用停止锚定删除（需要手动清理）。 |如果省略，服务器将应用其配置的默认值（通常为 14 天）。 |

两个值都必须是 60（分钟分辨率）的倍数。完整的生命周期是：

```
running ──(idle for idle_ttl_seconds)──▶ stopped ──(delete_after_stop_seconds)──▶ deleted
```

您还可以显式调用 `stop_sandbox` / `stopSandbox` — 这也
填充`stopped_at`并启动删除计时器。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Default retention (server defaults: 10-min idle stop, 14-day delete)
  with client.sandbox() as sb:
      sb.run("echo hello")

  # Aggressive: stop after 5 min idle, delete 1 hour after stop
  sb = client.create_sandbox(
      idle_ttl_seconds=300,
      delete_after_stop_seconds=3600,
  )

  # Long-running: never auto-stop, delete 7 days after manual stop
  sb = client.create_sandbox(
      idle_ttl_seconds=0,
      delete_after_stop_seconds=604800,
  )

  # Update retention on an existing sandbox
  sb = client.update_sandbox(
      sb.name,
      idle_ttl_seconds=1800,
      delete_after_stop_seconds=2592000,  # 30 days
  )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // Default retention (server defaults applied)
  const sandbox = await client.createSandbox();

  // Aggressive: stop after 5 min idle, delete 1 hour after stop
  const sb = await client.createSandbox({
    idleTtlSeconds: 300,
    deleteAfterStopSeconds: 3600,
  });

  // Long-running: never auto-stop, delete 7 days after manual stop
  const longRunning = await client.createSandbox({
    idleTtlSeconds: 0,
    deleteAfterStopSeconds: 604800,
  });

  // Update retention on an existing sandbox
  await client.updateSandbox(sb.name, {
    idleTtlSeconds: 1800,
    deleteAfterStopSeconds: 2592000, // 30 days
  });
  ```
</CodeGroup>

## 命令生命周期和 TTL

沙箱守护进程使用两种超时机制来管理命令会话生命周期：* **会话 TTL（已完成的命令）**：命令完成后，其会话会在内存中保留一段 TTL 时间。在此窗口期间，您可以重新连接以检索输出。 TTL 过期后，会话将被清除。
* **空闲超时（运行命令）**：在空闲超时（默认值：5 分钟）后，没有连接客户端的运行命令将被终止。每次客户端连接时，空闲计时器都会重置。设置为 `-1` 无空闲超时。

### 组合生命周期选项

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  with client.sandbox() as sb:
      # Long-running task: 30-min idle timeout, 1-hour session TTL
      handle = sb.run(
          "python train.py",
          timeout=0,              # No command timeout
          idle_timeout=1800,      # Kill after 30min with no clients
          ttl_seconds=3600,       # Keep session for 1 hour after exit
          wait=False,
      )

      # Fire-and-forget: no idle timeout, infinite TTL
      handle = sb.run(
          "python background_job.py",
          timeout=0,
          idle_timeout=-1,        # Never kill due to idle
          ttl_seconds=-1,         # Keep session forever
          wait=False,
      )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const sandbox = await client.createSandbox();
  try {
    // Long-running task: 30-min idle timeout, 1-hour session TTL
    const handle = await sandbox.run("python train.py", {
      timeout: 0,              // No command timeout
      idleTimeout: 1800,       // Kill after 30min with no clients
      ttlSeconds: 3600,        // Keep session for 1 hour after exit
      wait: false,
    });

    // Fire-and-forget: no idle timeout, infinite TTL
    const bg = await sandbox.run("python background_job.py", {
      timeout: 0,
      idleTimeout: -1,         // Never kill due to idle
      ttlSeconds: -1,          // Keep session forever
      wait: false,
    });
  } finally {
    await sandbox.delete();
  }
  ```
</CodeGroup>

设置 `kill_on_disconnect=True` (Python) 或 `killOnDisconnect: true` (TypeScript) 以在最后一个客户端断开连接时立即终止该命令，而不是等待空闲超时。

## 服务 URL (Python)

通过经过身份验证的 URL 访问在沙箱内运行的 HTTP 服务。您可以在浏览器中打开它，从代码中调用它，或者与团队成员共享它。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
with client.sandbox() as sb:
    sb.run("python -m http.server 8000", timeout=0, wait=False)

    svc = sb.service(port=8000)

    # Open in a browser
    print(svc.browser_url)

    # Or make requests with built-in helpers (auth is injected automatically)
    resp = svc.get("/api/data")
    resp = svc.post("/api/data", json={"key": "value"})
```

有关更多详细信息，包括用例、REST API 访问和完整的 FastAPI 示例，请参阅 [Service URLs](/langsmith/sandbox-service-urls)。

## TCP 隧道 (Python)

访问沙箱内运行的任何 TCP 服务，就好像它是本地服务一样。隧道打开本地 TCP 端口，并通过 WebSocket 将连接转发到沙箱内的目标端口。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import psycopg2

# Snapshot built from the official postgres:16 image
sb = client.create_sandbox(snapshot_id=postgres_snapshot_id)
pg_handle = sb.run(
    "POSTGRES_HOST_AUTH_METHOD=trust docker-entrypoint.sh postgres",
    timeout=0,
    wait=False,
)
import time; time.sleep(6)  # Wait for Postgres to start

try:
    with sb.tunnel(remote_port=5432, local_port=25432) as t:
        conn = psycopg2.connect(
            host="127.0.0.1",
            port=t.local_port,
            user="postgres",
        )
        cursor = conn.cursor()
        cursor.execute("SELECT version()")
        print(cursor.fetchone())
        conn.close()
finally:
    pg_handle.kill()
    client.delete_sandbox(sb.name)
```隧道可与任何 TCP 服务（Redis、HTTP 服务器等）配合使用，并且您可以同时打开多个隧道：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
with sb.tunnel(remote_port=5432, local_port=25432) as t1, \
     sb.tunnel(remote_port=6379, local_port=26379) as t2:
    # Use both Postgres and Redis simultaneously
    pass
```

## 异步支持 (Python)

Python SDK 提供了完整的异步客户端：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.sandbox import AsyncSandboxClient

async def main():
    async with AsyncSandboxClient() as client:
        async with await client.sandbox() as sb:
            result = await sb.run("python -c 'print(1 + 1)'")
            print(result.stdout)  # "2\n"

            await sb.write("/app/test.txt", "async content")
            content = await sb.read("/app/test.txt")
            print(content.decode())

            # Async streaming
            handle = await sb.run("make build", timeout=600, wait=False)
            async for chunk in handle:
                print(chunk.data, end="")
            result = await handle.result

            # Async service URLs
            svc = await sb.service(port=8000)
            resp = await svc.get("/api/data")
            url = await svc.get_service_url()
            token = await svc.get_token()
```

## 跟踪沙箱活动

通过 `run()` 上的 `env` 参数传递 LangSmith 跟踪环境变量，以发送沙箱内运行的代码的跟踪。在进程退出之前调用`flush()`以确保所有跟踪都已传递。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.sandbox import SandboxClient

  client = SandboxClient()

  tracing_env = {
      "LANGSMITH_API_KEY": "lsv2_pt_...",
      "LANGSMITH_ENDPOINT": "https://api.smith.langchain.com",
      "LANGSMITH_TRACING": "true",
      "LANGSMITH_PROJECT": "my-sandbox-traces",
  }

  with client.sandbox() as sandbox:
      sandbox.run("pip install langsmith", timeout=120, env=tracing_env)
      result = sandbox.run("python3 my_agent.py", env=tracing_env)
      print(result.stdout)
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { SandboxClient } from "langsmith/sandbox";

  const client = new SandboxClient();

  const tracingEnv = {
    LANGSMITH_API_KEY: "lsv2_pt_...",
    LANGSMITH_ENDPOINT: "https://api.smith.langchain.com",
    LANGSMITH_TRACING: "true",
    LANGSMITH_PROJECT: "my-sandbox-traces",
  };

  const sandbox = await client.createSandbox();
  try {
    await sandbox.run("pip install langsmith", { timeout: 120, env: tracingEnv });
    const result = await sandbox.run("python3 my_agent.py", { env: tracingEnv });
    console.log(result.stdout);
  } finally {
    await sandbox.delete();
  }
  ```
</CodeGroup>

在沙箱内，任何 LangSmith 检测的代码（`@traceable`、LangChain、LangGraph）都会自动从注入的环境变量中获取跟踪配置。

<Warning>
  在沙箱进程退出之前始终调用 `flush()` — Python 中的 `langsmith.Client().flush()` 或 TypeScript 中的 `await new Client().flush()`。如果没有它，跟踪可能会丢失，因为命令完成时容器会被破坏。
</Warning>

## 错误处理

这两个 SDK 都提供了用于特定错误处理的类型化异常：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.sandbox import (
      SandboxClientError,       # Base exception
      ResourceCreationError,    # Provisioning failed
      ResourceNotFoundError,    # Resource doesn't exist
      ResourceTimeoutError,     # Operation timed out
      SandboxNotReadyError,     # Sandbox not ready yet
      SandboxConnectionError,   # Network/WebSocket error
      CommandTimeoutError,      # Command exceeded timeout
      QuotaExceededError,       # Quota limit reached
  )

  try:
      with client.sandbox() as sb:
          result = sb.run("sleep 999", timeout=10)
  except CommandTimeoutError as e:
      print(f"Command timed out: {e}")
  except ResourceNotFoundError as e:
      print(f"{e.resource_type} not found: {e}")
  except SandboxClientError as e:
      print(f"Error: {e}")
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    LangSmithSandboxError,
    LangSmithResourceNotFoundError,
    LangSmithResourceTimeoutError,
    LangSmithSandboxConnectionError,
    LangSmithCommandTimeoutError,
    LangSmithQuotaExceededError,
  } from "langsmith/sandbox";

  try {
    const sandbox = await client.createSandbox("not-a-real-snapshot");
    await sandbox.delete();
  } catch (e) {
    if (e instanceof LangSmithResourceNotFoundError) {
      console.log(`${e.resourceType} not found: ${e.message}`);
    } else if (e instanceof LangSmithResourceTimeoutError) {
      console.log(`Timeout waiting for ${e.resourceType}: ${e.message}`);
    } else if (e instanceof LangSmithSandboxError) {
      console.log(`Error: ${e.message}`);
    }
  }
  ```
</CodeGroup>

<Note>
  有关更多详细信息，请参阅 GitHub 上的 [Python](https://github.com/langchain-ai/langsmith-sdk/tree/main/python/langsmith/sandbox) 或 [TypeScript](https://github.com/langchain-ai/langsmith-sdk/tree/main/js/src/sandbox) 沙盒 SDK 参考。
</Note>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-sdk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>