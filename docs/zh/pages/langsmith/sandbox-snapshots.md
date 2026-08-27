<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox snapshots | https://docs.langchain.com/langsmith/sandbox-snapshots -->

# 沙盒快照

**快照**是可重用的沙箱文件系统。当您想要从自定义文件系统映像启动沙箱时，可以从容器映像构建自定义快照。

您还可以从正在运行的沙箱捕获快照 - 安装包、写入数据文件或配置状态，然后对结果进行快照并将其重新用作新的起点。

![Sandboxes snapshots page](/images/langsmith/sandboxes/sb-snapshots.png)

## 了解默认快照

当您创建沙箱而不选择快照时，LangSmith 使用内置的默认快照。默认提供带有通用开发工具的 Ubuntu 24.04 文件系统。 LangSmith 可能会随着时间的推移更新默认快照中包含的软件包和工具。

### 检查自托管部署中的默认快照文件系统

在自托管部署中，LangSmith从嵌入沙箱运行时容器映像中的文件系统创建默认快照，`sandbox-host`：

1. 在`sandbox-host`镜像构建过程中，LangSmith从Ubuntu 24.04启动并安装默认开发工具。
2. LangSmith 将该文件系统打包为`/opt/sandbox-host/bin/builder-base.ext4.gz` 处的压缩 16 GiB ext4 文件。
3. 当`sandbox-host`启动时，LangSmith使用嵌入式文件系统创建默认快照。压缩的 ext4 文件，而不是单独拉取的容器映像，是默认快照文件系统的源。

单独扫描 `sandbox-host` 容器映像不会检查此压缩工件内的文件。要验证默认快照，请单独提取并扫描嵌入式文件系统。

<Note>
此过程验证默认快照文件系统。 LangSmith 在沙箱启动时单独提供其他所需的运行时组件；它们不是快照的一部分。
</Note>

要独立检查默认快照，请使用 Helm 版本配置的确切 `sandbox-host` 容器映像。如果您镜像镜像，请使用您的私人注册表中的`images.sandboxHostImage`中的参考。

您需要：

- 访问已部署的 `sandbox-host` 映像。
- Linux 系统上 `e2fsprogs` 软件包中的 Docker、`gzip`、GNU `dd` 和 `debugfs`。
- 支持稀疏文件的本地文件系统，以及足够的空间用于压缩工件和提取的文件。 ext4 映像的逻辑大小为 16 GiB，但稀疏解压缩避免分配其零填充的可用空间。将文件提取到临时目录中，然后使用您首选的文件系统或软件物料清单 (SBOM) 扫描仪扫描生成的目录。

设置部署使用的确切图像引用并创建临时工作目录：

```bash
export SANDBOX_HOST_IMAGE="<sandbox-host-image-reference>"
export SNAPSHOT_WORKDIR="$(mktemp -d)"

docker pull "$SANDBOX_HOST_IMAGE"
```

解压压缩的 ext4 文件而不启动 `sandbox-host` 进程：

```bash
SANDBOX_HOST_CONTAINER="$(docker create "$SANDBOX_HOST_IMAGE")"
docker cp \
  "${SANDBOX_HOST_CONTAINER}:/opt/sandbox-host/bin/builder-base.ext4.gz" \
  "$SNAPSHOT_WORKDIR/"
docker rm "$SANDBOX_HOST_CONTAINER"
```

将文件系统解压缩为稀疏文件：

```bash
gzip -dc "$SNAPSHOT_WORKDIR/builder-base.ext4.gz" | \
  dd of="$SNAPSHOT_WORKDIR/builder-base.ext4" \
    bs=1M conv=sparse status=progress
```

使用`debugfs`提取ext4内容。 `debugfs` 以只读方式打开文件系统，除非您通过 `-w`：

```bash
mkdir -p "$SNAPSHOT_WORKDIR/rootfs"
debugfs \
  -R "rdump / $SNAPSHOT_WORKDIR/rootfs" \
  "$SNAPSHOT_WORKDIR/builder-base.ext4"
```

将文件系统或 SBOM 扫描仪指向 `$SNAPSHOT_WORKDIR/rootfs`。扫描器从 LangSmith 用于默认快照的同一根文件系统读取包数据库和文件。

## 从容器镜像构建快照

通过指向任何容器映像来构建快照。该调用会阻塞，直到快照准备好为止（默认超时为 60 秒；对于大图像，请提高超时时间）。

<CodeGroup>

```python Python
from langsmith.sandbox import SandboxClient

client = SandboxClient()

snapshot = client.create_snapshot(
    "python",
    docker_image="python:3.12-slim",
    fs_capacity_bytes=1 * 1024**3,  # 1 GiB
)

print(snapshot.id)
```

```ts TypeScript
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

### 验证从容器镜像构建的快照

LangSmith 从您提供的容器映像中的文件系统构建自定义快照。要独立验证这些内容：1. 将源容器镜像解析为不可变引用，例如`registry.example.com/example/image@sha256:<digest>`。
2. 检查并扫描该精确图像。
3. 创建快照时，使用与 `docker_image` 相同的摘要限定引用。

LangSmith 在沙箱启动时单独提供其所需的运行时工具。它们不会添加到您提供的容器映像中或包含在自定义快照中。

### 私有注册表

要从私有注册表中提取数据，请使用其凭据创建一次注册表，然后在构建快照时通过 id 引用它。注册表会持续存在，因此可以跨快照重复使用注册表。

<CodeGroup>

```python Python
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

```ts TypeScript
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

## 从 Dockerfile 构建快照

当您有本地 `Dockerfile` 但不想先将映像发布到注册表时，请直接从 `Dockerfile` 及其构建上下文构建快照。 LangSmith 启动一个临时构建器沙箱，上传上下文，使用 [BuildKit](https://docs.docker.com/build/buildkit/) 在其中运行构建，并将生成的图像捕获为快照。构建完成后，构建器沙箱将自动拆除。该调用会阻塞，直到快照准备好为止（默认超时为 60 秒；对于大型或缓慢的构建，请提高该超时值）。 `fs_capacity_bytes` 必须足够大以容纳构建上下文、中间层和最终图像。

<CodeGroup>

```python Python
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

```ts TypeScript
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

```python Python
snapshot = client.create_snapshot_from_dockerfile(
    "my-app",
    dockerfile="Dockerfile",
    fs_capacity_bytes=2 * 1024**3,
    build_args={"PYTHON_VERSION": "3.12", "ENV": "prod"},
    target="runtime",
)
```

```ts TypeScript
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

```python Python
snapshot = client.create_snapshot_from_dockerfile(
    "my-app",
    dockerfile="Dockerfile",
    fs_capacity_bytes=2 * 1024**3,
    on_build_log=lambda line: print(line, end=""),
)
```

```ts TypeScript
const snapshot = await client.createSnapshotFromDockerfile(
  "my-app",
  "Dockerfile",
  2_147_483_648,
  { onBuildLog: (line) => process.stdout.write(line) },
);
```

</CodeGroup>

### 加速冷构建`vcpus` / `vCpus` 和 `mem_bytes` / `memBytes` 调整临时构建器沙箱的大小。该构建运行 BuildKit 以及其中的本机快照程序的层副本，这些副本会争夺构建器的默认 0.5 vCPU，因此为构建器提供更多 CPU 可以大幅缩短冷构建的挂起时间。内存以每个 vCPU 4 GiB 与 CPU 绑定，并且必须保持在该目标的 50% 以内，因此 2-vCPU 构建器接受 4 到 12 GiB。省略记忆，它遵循比例。

<CodeGroup>

```python Python
snapshot = client.create_snapshot_from_dockerfile(
    "my-app",
    dockerfile="Dockerfile",
    fs_capacity_bytes=2 * 1024**3,
    vcpus=2,
    mem_bytes=8 * 1024**3,  # 8 GiB
    timeout=600,
)
```

```ts TypeScript
const snapshot = await client.createSnapshotFromDockerfile(
  "my-app",
  "Dockerfile",
  2_147_483_648,
  {
    vCpus: 2,
    memBytes: 8_589_934_592, // 8 GiB
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

```python Python
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

```ts TypeScript
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

</CodeGroup><Note>
默认情况下，捕获仅保留**文件系统**。已安装的软件包（在`/usr/local`、`/root`、`/opt`、主目录等下）和写入这些位置的文件将被保留，就像`/tmp`一样。只有 `/dev/shm` 是 tmpfs，因此其他所有内容都位于沙箱的磁盘上。正在运行的进程、打开的套接字和内存中的状态都不会被保留：启动新的沙箱并再次启动您需要的进程，或者[capture memory too](#resume-from-memory)。
</Note>

<Tip>
您可以通过**名称**而不是 ID 从快照启动沙箱 - 当您知道捕获的人类可读标签时会很方便：

<CodeGroup>

```python Python
sb = client.create_sandbox(snapshot_name="ml-ready")
```

```ts TypeScript
const sb = await client.createSandbox({ snapshotName: "ml-ready" });
```

</CodeGroup>

最多传递 `snapshot_id` / `snapshot_name` 之一（或 TypeScript 中的 `snapshotId` / `snapshotName`）。省略两者以使用默认运行时。
</Tip>

### 调整捕捉时间

`capture_snapshot` 会阻塞，直到新快照准备就绪。如果您的文件系统很大或者存储后端很慢，请提高 `timeout` kwarg （默认 60 秒）。

<CodeGroup>

```python Python
snapshot = sb.capture_snapshot("ml-ready-v2", timeout=600)
```

```ts TypeScript
const snapshot = await sb.captureSnapshot("ml-ready-v2", { timeout: 600 });
```

</CodeGroup>

### 从内存中恢复快照可以携带沙箱的 RAM 及其文件系统。从其中之一启动，沙箱将从中断处恢复，其进程仍在运行，而不是冷启动。将此用于预热缓慢的环境，例如加载的模型或启动的数据库。

<Note>
内存快照仅可通过 REST API 获取。 `langsmith.sandbox` Python 和 TypeScript 客户端尚未公开这些字段。
</Note>

通过在捕获上设置 `include_memory` 来捕获内存：

```bash
curl -X POST \
  "$LANGSMITH_ENDPOINT/api/v2/sandboxes/boxes/my-vm/snapshot" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "warm-model", "include_memory": true}'
```

当内存被捕获时，响应报告`memory_snapshot_size_bytes`。 `include_memory` 需要一个正在运行或停止的沙箱，并且它不能与 `checkpoint` 或 `docker_image` 结合使用。

一些沙箱在无法携带内存映像的覆盖文件系统运行时上运行。捕获一个会返回`include_memory is not supported for overlay-rootfs sandboxes`。 LangSmith 分配该运行时，因此它不是您为每个沙箱选择的东西。

create 上的两个字段控制另一半：|领域 |它有什么作用 |
|--------|--------------|
| `restore_memory` |当快照有它时忽略它以从内存中恢复，而在没有它时冷启动。 `true` 需要内存，如果快照没有内存，则请求失败。 `false` 始终冷启动。 |
| `preserve_memory_on_stop` | `true` 在自愿停止（空闲超时或显式停止）时暂停 RAM，以便沙箱在下次唤醒时从中断处恢复，而不是冷启动。默认为`false`，仅保留文件系统。无论哪种方式，由基础设施维护触发的重新启动都会保留内存。 |

```bash
curl -X POST "$LANGSMITH_ENDPOINT/api/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "warm-vm",
    "snapshot": "warm-model",
    "restore_memory": true,
    "preserve_memory_on_stop": true
  }'
```

仅当使用 `preserve_memory_on_stop` 创建沙箱时，才能从 **已停止的** 沙箱捕获内存。如果没有它，停止会丢弃 RAM，并且没有任何内容可捕获。

## 列出、获取和删除快照

<CodeGroup>

```python Python
# List all snapshots in the workspace
snapshots = client.list_snapshots()
for s in snapshots:
    print(s.id, s.name, s.status)

# Fetch a single snapshot by ID
snapshot = client.get_snapshot("550e8400-e29b-41d4-a716-446655440000")

# Delete a snapshot (fails if any sandbox still references it)
client.delete_snapshot(snapshot.id)
```

```ts TypeScript
const snapshots = await client.listSnapshots();
for (const s of snapshots) {
  console.log(s.id, s.name, s.status);
}

const snapshot = await client.getSnapshot("550e8400-e29b-41d4-a716-446655440000");

await client.deleteSnapshot(snapshot.id);
```

</CodeGroup>

<Note>
`list_snapshots` / `listSnapshots` 在服务器端分页（默认页面大小 50，最大 500）并接受可选过滤器：`name_contains` / `nameContains`（名称中不区分大小写的子字符串）、`limit` (1–500) 和 `offset` (≥ 0）。通过前进 `offset` 翻页结果。

<CodeGroup>

```python Python
page = client.list_snapshots(name_contains="ml", limit=100)
```

```ts TypeScript
const page = await client.listSnapshots({ nameContains: "ml", limit: 100 });
```

</CodeGroup>

</Note>

## 停止沙箱停止的沙箱会保留其文件系统，下一个请求会自动唤醒它。您不需要自己启动它：发送您想要运行的命令，沙箱就会回来为其提供服务。

<CodeGroup>

```python Python
sb = client.create_sandbox(snapshot_id=snapshot.id, name="my-vm")
sb.run("echo 'hello' > /tmp/state.txt")

# Stop early to release resources. The idle timeout does this for you.
sb.stop()

# No start call: this wakes the sandbox and runs once it is up.
result = sb.run("cat /tmp/state.txt")
assert result.stdout.strip() == "hello"
```

```ts TypeScript
const sb = await client.createSandbox(snapshot.id, { name: "my-vm" });
await sb.run("echo 'hello' > /tmp/state.txt");

await sb.stop();

const result = await sb.run("cat /tmp/state.txt");
console.log(result.stdout.trim()); // "hello"
```

</CodeGroup>

停止后的第一个请求会支付启动成本，因此它比后面的请求慢。使用 `preserve_memory_on_stop` 到 [resume from memory](#resume-from-memory) 创建沙箱，而不是冷启动。

## 后续步骤

- [Create sandboxes from snapshots with the SDK](/langsmith/sandbox-sdk)
- [Expose HTTP services with Service URLs](/langsmith/sandbox-service-urls)
- [Inject credentials via the Auth proxy](/langsmith/sandbox-auth-proxy)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-snapshots.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>