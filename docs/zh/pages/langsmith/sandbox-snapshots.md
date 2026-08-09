<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox snapshots | https://docs.langchain.com/langsmith/sandbox-snapshots -->

# 沙盒快照

为沙箱构建和捕获可重用的文件系统映像。

**快照**是由 Docker 映像支持的可重用文件系统包。当您想要从自定义文件系统映像启动沙箱时，构建或捕获快照。

您还可以从正在运行的沙箱捕获快照 - 安装包、写入数据文件或配置状态，然后对结果进行快照并将其重新用作新的起点。

<img alt="Sandboxes snapshots page" />

## 从 Docker 镜像构建快照

通过指向任何 Docker 映像来构建快照。该调用会阻塞，直到快照准备好为止（默认超时为 60 秒；对于大图像，请提高超时时间）。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.sandbox import SandboxClient

  client = SandboxClient()

  snapshot = client.create_snapshot(
      "python",
      docker_image="python:3.12-slim",
      fs_capacity_bytes=1 * 1024**3,  # 1 GiB
  )

  print(snapshot.id)
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { SandboxClient } from "langsmith/sandbox";

  const client = new SandboxClient();

  const snapshot = await client.createSnapshot(
    "python",
    "python:3.12-slim",
    1_073_741_824, // 1 GiB
  );

  console.log(snapshot.id);
  ```
</CodeGroup>

### 私有注册表

要从私有注册表中提取数据，请使用其凭据创建一次注册表，然后在构建快照时通过 id 引用它。注册表会持续存在，因此可以跨快照重复使用注册表。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  registry = client.registries.create(
      name="internal",
      url="registry.example.com",
      username="me",
      password=os.environ["REGISTRY_PASSWORD"],
  )

  snapshot = client.create_snapshot(
      "internal-python",
      docker_image="registry.example.com/internal/python:3.12",
      fs_capacity_bytes=2 * 1024**3,
      registry_id=registry.id,
      timeout=600,
  )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const registry = await client.registries.create({
    name: "internal",
    url: "registry.example.com",
    username: "me",
    password: process.env.REGISTRY_PASSWORD,
  });

  const snapshot = await client.createSnapshot(
    "internal-python",
    "registry.example.com/internal/python:3.12",
    2_147_483_648,
    {
      registryId: registry.id,
      timeout: 600,
    },
  );
  ```
</CodeGroup>

使用 `client.registries.list()`、`client.registries.retrieve(name)`、`client.registries.update(name, ...)` 和 `client.registries.delete(name)` 列出、检查、更新和删除注册表。

## 从 Dockerfile 构建快照当您有本地 `Dockerfile` 但不想先将映像发布到注册表时，请直接从 `Dockerfile` 及其构建上下文构建快照。 LangSmith 启动一个临时构建器沙箱，上传上下文，使用 [BuildKit](https://docs.docker.com/build/buildkit/) 在其中运行构建，并将生成的图像捕获为快照。构建完成后，构建器沙箱将自动拆除。

该调用会阻塞，直到快照准备好为止（默认超时为 60 秒；对于大型或缓慢的构建，请提高该超时值）。 `fs_capacity_bytes` 必须足够大以容纳构建上下文、中间层和最终图像。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.sandbox import SandboxClient

  client = SandboxClient()

  snapshot = client.create_snapshot_from_dockerfile(
      "my-app",
      dockerfile="Dockerfile",
      fs_capacity_bytes=2 * 1024**3,  # 2 GiB
      context=".",  # build context directory (default: current directory)
  )

  print(snapshot.id)
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { SandboxClient } from "langsmith/sandbox";

  const client = new SandboxClient();

  const snapshot = await client.createSnapshotFromDockerfile(
    "my-app",
    "Dockerfile",
    2_147_483_648, // 2 GiB
    { context: "." },
  );

  console.log(snapshot.id);
  ```
</CodeGroup>

<Note>
  `dockerfile` 相对于 `context` 进行解析，除非您传递绝对路径，并且它必须位于上下文目录内。 `.git` 目录会自动从上传的上下文中排除。
</Note>

### 构建参数和目标阶段

通过 `build_args` / `buildArgs` 设置 Docker `ARG` 值，并通过 `target` 在多阶段构建的特定阶段停止。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  snapshot = client.create_snapshot_from_dockerfile(
      "my-app",
      dockerfile="Dockerfile",
      fs_capacity_bytes=2 * 1024**3,
      build_args={"PYTHON_VERSION": "3.12", "ENV": "prod"},
      target="runtime",
  )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const snapshot = await client.createSnapshotFromDockerfile(
    "my-app",
    "Dockerfile",
    2_147_483_648,
    {
      buildArgs: { PYTHON_VERSION: "3.12", ENV: "prod" },
      target: "runtime",
    },
  );
  ```
</CodeGroup>

### 流式传输构建日志

将回调传递给 `on_build_log` / `onBuildLog` 以在构建运行时接收其 stdout 和 stderr，这对于显示进度或调试失败的构建很有用。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  snapshot = client.create_snapshot_from_dockerfile(
      "my-app",
      dockerfile="Dockerfile",
      fs_capacity_bytes=2 * 1024**3,
      on_build_log=lambda line: print(line, end=""),
  )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const snapshot = await client.createSnapshotFromDockerfile(
    "my-app",
    "Dockerfile",
    2_147_483_648,
    { onBuildLog: (line) => process.stdout.write(line) },
  );
  ```
</CodeGroup>### 加速冷构建

`vcpus` / `vCpus` 和 `mem_bytes` / `memBytes` 调整临时构建器沙箱的大小。该构建运行 BuildKit 以及其中的本机快照程序的层副本，默认情况下争夺单个核心，因此为构建器提供额外的 vCPU 可以大大缩短冷构建的挂壁时间。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  snapshot = client.create_snapshot_from_dockerfile(
      "my-app",
      dockerfile="Dockerfile",
      fs_capacity_bytes=2 * 1024**3,
      vcpus=2,
      mem_bytes=4 * 1024**3,  # 4 GiB
      timeout=600,
  )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const snapshot = await client.createSnapshotFromDockerfile(
    "my-app",
    "Dockerfile",
    2_147_483_648,
    {
      vCpus: 2,
      memBytes: 4_294_967_296, // 4 GiB
      timeout: 600,
    },
  );
  ```
</CodeGroup>

<Tip>
  同步 `SandboxClient` 和 `AsyncSandboxClient` 都在异步客户端上使用相同的参数 — `await client.create_snapshot_from_dockerfile(...)` 公开此方法。
</Tip>

## 从正在运行的沙箱捕获快照

从现有快照启动沙箱，安装软件包或准备数据，然后捕获结果作为新快照。返回的快照将其 `source_sandbox_id` 设置为从中捕获它的沙箱，并且可以用作任何后续 `create_sandbox` 调用的 `snapshot_id`。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  sb = client.create_sandbox(snapshot_id=base_snapshot_id, name="setup-box")
  sb.run("pip install numpy pandas scikit-learn", timeout=180)
  sb.write("/opt/config.yaml", "model: gpt-5\n")

  # Capture the current filesystem as a new snapshot
  snapshot = sb.capture_snapshot("ml-ready")
  print(snapshot.id, snapshot.source_sandbox_id)

  sb.delete()

  # Boot fresh sandboxes pre-loaded with those dependencies
  with client.sandbox(snapshot_id=snapshot.id) as sb:
      sb.run("python -c 'import numpy; print(numpy.__version__)'")
      assert sb.read("/opt/config.yaml") == b"model: gpt-5\n"
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const running = await client.createSandbox(baseSnapshotId, { name: "setup-box" });
  await running.run("pip install numpy pandas scikit-learn", { timeout: 180 });
  await running.write("/opt/config.yaml", "model: gpt-5\n");

  const snapshot = await running.captureSnapshot("ml-ready");
  console.log(snapshot.id, snapshot.source_sandbox_id);

  await running.delete();

  const sandbox = await client.createSandbox(snapshot.id);
  try {
    await sandbox.run("python -c 'import numpy; print(numpy.__version__)'");
    const cfg = await sandbox.read("/opt/config.yaml");
    console.log(new TextDecoder().decode(cfg));
  } finally {
    await sandbox.delete();
  }
  ```
</CodeGroup>

<Note>
  捕获仅保留**持久文件系统**。已安装的软件包（在`/usr/local`、`/root`、`/opt`、主目录等下）以及写入这些位置的文件将被保留。正在运行的进程、打开的套接字、内存中的状态以及`/tmp`（这是一个 tmpfs）下的任何内容都不会被保留——启动新的沙箱并再次启动您需要的进程。
</Note><Tip>
  您可以通过**名称**而不是 ID 从快照启动沙箱 - 当您知道捕获的人类可读标签时会很方便：

  <CodeGroup>
    ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    sb = client.create_sandbox(snapshot_name="ml-ready")
    ```

    ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const sb = await client.createSandbox({ snapshotName: "ml-ready" });
    ```
  </CodeGroup>

  最多传递 `snapshot_id` / `snapshot_name` 之一（或 TypeScript 中的 `snapshotId` / `snapshotName`）。省略两者以使用默认运行时。
</Tip>

### 调整捕捉时间

`capture_snapshot` 会阻塞，直到新快照准备就绪。如果您的文件系统很大或者存储后端很慢，请提高 `timeout` kwarg （默认 60 秒）。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  snapshot = sb.capture_snapshot("ml-ready-v2", timeout=600)
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const snapshot = await sb.captureSnapshot("ml-ready-v2", { timeout: 600 });
  ```
</CodeGroup>

## 列出、获取和删除快照

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # List all snapshots in the workspace
  snapshots = client.list_snapshots()
  for s in snapshots:
      print(s.id, s.name, s.status)

  # Fetch a single snapshot by ID
  snapshot = client.get_snapshot("550e8400-e29b-41d4-a716-446655440000")

  # Delete a snapshot (fails if any sandbox still references it)
  client.delete_snapshot(snapshot.id)
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const snapshots = await client.listSnapshots();
  for (const s of snapshots) {
    console.log(s.id, s.name, s.status);
  }

  const snapshot = await client.getSnapshot("550e8400-e29b-41d4-a716-446655440000");

  await client.deleteSnapshot(snapshot.id);
  ```
</CodeGroup>

<Note>
  `list_snapshots` / `listSnapshots` 在服务器端分页（默认页面大小 50，最大 500）并接受可选过滤器：`name_contains` / `nameContains`（名称中不区分大小写的子字符串）、`limit` (1–500) 和 `offset` (≥ 0)。通过前进 `offset` 翻页结果。

  <CodeGroup>
    ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    page = client.list_snapshots(name_contains="ml", limit=100)
    ```

    ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const page = await client.listSnapshots({ nameContains: "ml", limit: 100 });
    ```
  </CodeGroup>
</Note>

## 停止和启动沙箱

沙箱可以停止和重新启动，而不会丢失文件系统状态。当沙箱恢复时，您在上次运行期间编写的文件仍然存在。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  sb = client.create_sandbox(snapshot_id=snapshot.id, name="my-vm")
  sb.run("echo 'hello' > /tmp/state.txt")

  # Stop the sandbox — preserves files on disk
  sb.stop()

  # Later: start it again (blocks until ready, default timeout=120s)
  sb.start()

  result = sb.run("cat /tmp/state.txt")
  assert result.stdout.strip() == "hello"
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const sb = await client.createSandbox(snapshot.id, { name: "my-vm" });
  await sb.run("echo 'hello' > /tmp/state.txt");

  await sb.stop();

  await sb.start();

  const result = await sb.run("cat /tmp/state.txt");
  console.log(result.stdout.trim()); // "hello"
  ```
</CodeGroup>

您还可以直接通过客户端按名称停止和启动（Python 中的`client.stop_sandbox(name)` / `client.start_sandbox(name)`，TypeScript 中的`client.stopSandbox(name)` / `client.startSandbox(name)`）。## 后续步骤

* [Create sandboxes from snapshots with the SDK](/langsmith/sandbox-sdk)
* [Expose HTTP services with Service URLs](/langsmith/sandbox-service-urls)
* [Inject credentials via the Auth proxy](/langsmith/sandbox-auth-proxy)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-snapshots.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>