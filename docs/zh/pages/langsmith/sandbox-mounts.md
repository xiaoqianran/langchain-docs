<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox mounts | https://docs.langchain.com/langsmith/sandbox-mounts -->

# 沙盒坐骑

创建沙箱时，沙箱挂载会将外部数据源附加到沙箱文件系统。当沙箱代码需要直接文件访问对象存储桶、公共 Git 存储库或[Context Hub](/langsmith/use-the-context-hub) 存储库而不将数据复制到沙箱映像中时，请使用挂载。

挂载通过 Python 中的 `mount_config` 或 TypeScript 中的 `mountConfig` 进行配置。 SDK 将安装规范发送到 LangSmith 并为提供者凭证编写所需的 [auth proxy](/langsmith/sandbox-auth-proxy) 规则。

<Note>
沙盒安装需要 `langsmith[sandbox]>=0.8.16`（对于 Python）或 `langsmith>=0.7.10`（对于 TypeScript）。 Context Hub 安装需要 `langsmith[sandbox]>=0.11.0`（对于 Python）或 `langsmith>=0.8.11`（对于 TypeScript）。
</Note>

<Warning>
在创建装载 S3 或 GCS 的沙箱之前，将云凭据存储为 LangSmith 工作区机密。不要将真实的云凭据作为沙箱环境变量、命令参数或文件传递。
</Warning>

## 配置挂载路径

每个安装座都有一个 `id`、一个 `type` 和一个 `mount_path` / `mountPath`。 Bucket 和 Git 挂载必须使用 `/mnt/mounts` 下的绝对路径。上下文中心安装路径可以是系统目录之外的任何绝对路径，因此代理可以从它已经期望的位置读取其上下文。

使用描述已安装源的稳定路径：|来源 |示例路径 |
|--------|--------------|
| S3 存储桶前缀 | `/mnt/mounts/customer-data` |
| GCS 存储桶前缀 | `/mnt/mounts/eval-datasets` |
| Git 存储库 | `/mnt/mounts/repo` |
| Context Hub 存储库 | `/memories` |

安装 ID 可以包含 ASCII 字母、数字、下划线和连字符。不要在同一沙箱内重复使用 ID 或安装路径。

## 安装 S3 存储桶

S3 安装需要 AWS 身份验证。该开发工具包从 `aws_auth` / `awsAuth` 创建 AWS 身份验证代理规则，因此沙箱可以访问存储桶，而无需查看真正的访问密钥。

<CodeGroup>

```python Python
from langsmith.sandbox import (
    SandboxClient,
    aws_auth,
    mount_config,
    s3_mount,
    workspace_secret,
)

client = SandboxClient()

mount_cfg = mount_config(
    auth=[
        aws_auth(
            access_key_id=workspace_secret("SANDBOX_AWS_ACCESS_KEY_ID"),
            secret_access_key=workspace_secret("SANDBOX_AWS_SECRET_ACCESS_KEY"),
        )
    ],
    mounts=[
        s3_mount(
            id="customer_data",
            mount_path="/mnt/mounts/customer-data",
            bucket="example-bucket",
            prefix="datasets/customer-data",
            region="us-east-1",
            path_style=False,
            read_only=True,
        )
    ],
)

with client.sandbox(name="s3-mount-sandbox", mount_config=mount_cfg) as sb:
    result = sb.run("ls /mnt/mounts/customer-data")
    print(result.stdout)
```

```ts TypeScript
import {
  SandboxClient,
  awsAuth,
  mountConfig,
  s3Mount,
  workspaceSecret,
} from "langsmith/sandbox";

const client = new SandboxClient();

const mountCfg = mountConfig({
  auth: [
    awsAuth({
      accessKeyId: workspaceSecret("SANDBOX_AWS_ACCESS_KEY_ID"),
      secretAccessKey: workspaceSecret("SANDBOX_AWS_SECRET_ACCESS_KEY"),
    }),
  ],
  mounts: [
    s3Mount({
      id: "customer_data",
      mountPath: "/mnt/mounts/customer-data",
      bucket: "example-bucket",
      prefix: "datasets/customer-data",
      region: "us-east-1",
      pathStyle: false,
      readOnly: true,
    }),
  ],
});

const sandbox = await client.createSandbox({
  name: "s3-mount-sandbox",
  mountConfig: mountCfg,
});

try {
  const result = await sandbox.run("ls /mnt/mounts/customer-data");
  console.log(result.stdout);
} finally {
  await sandbox.delete();
}
```

</CodeGroup>

##挂载GCS存储桶

GCS 安装需要 GCP 身份验证。 OAuth 范围由后端提供，源自挂载本身：只读挂载获取`devstorage.read_only`，可写挂载获取`devstorage.read_write`。

由于单个 `mount_config` 解析为一个作用域，因此其所有 GCS 挂载必须一致：在一个配置中混合只读和可写 GCS 挂载将被拒绝。始终使用可写挂载，或创建单独的沙箱。

<CodeGroup>

```python Python
from langsmith.sandbox import (
    SandboxClient,
    gcp_auth,
    gcs_mount,
    mount_config,
    workspace_secret,
)

client = SandboxClient()

mount_cfg = mount_config(
    auth=[
        gcp_auth(
            service_account_json=workspace_secret(
                "SANDBOX_GCP_SERVICE_ACCOUNT_JSON"
            ),
        )
    ],
    mounts=[
        gcs_mount(
            id="eval_datasets",
            mount_path="/mnt/mounts/eval-datasets",
            bucket="example-bucket",
            prefix="datasets/evals",
            read_only=False,
        )
    ],
)

with client.sandbox(name="gcs-mount-sandbox", mount_config=mount_cfg) as sb:
    result = sb.run("ls /mnt/mounts/eval-datasets")
    print(result.stdout)
```

```ts TypeScript
import {
  SandboxClient,
  gcpAuth,
  gcsMount,
  mountConfig,
  workspaceSecret,
} from "langsmith/sandbox";

const client = new SandboxClient();

const mountCfg = mountConfig({
  auth: [
    gcpAuth({
      serviceAccountJson: workspaceSecret("SANDBOX_GCP_SERVICE_ACCOUNT_JSON"),
    }),
  ],
  mounts: [
    gcsMount({
      id: "eval_datasets",
      mountPath: "/mnt/mounts/eval-datasets",
      bucket: "example-bucket",
      prefix: "datasets/evals",
      readOnly: false,
    }),
  ],
});

const sandbox = await client.createSandbox({
  name: "gcs-mount-sandbox",
  mountConfig: mountCfg,
});

try {
  const result = await sandbox.run("ls /mnt/mounts/eval-datasets");
  console.log(result.stdout);
} finally {
  await sandbox.delete();
}
```

</CodeGroup>

## 挂载公共 Git 存储库

公共 Git 挂载不需要 AWS 或 GCP 身份验证。使用 HTTPS 远程 URL 并可选择固定分支或标签。

<CodeGroup>

```python Python
from langsmith.sandbox import SandboxClient, git_mount, mount_config

client = SandboxClient()

mount_cfg = mount_config(
    mounts=[
        git_mount(
            id="repo",
            mount_path="/mnt/mounts/repo",
            remote_url="https://github.com/langchain-ai/langsmith-sdk.git",
            ref={"type": "branch", "name": "main"},
            refresh_interval_seconds=60,
        )
    ],
)

with client.sandbox(name="git-mount-sandbox", mount_config=mount_cfg) as sb:
    result = sb.run("ls /mnt/mounts/repo")
    print(result.stdout)
```

```ts TypeScript
import { SandboxClient, gitMount, mountConfig } from "langsmith/sandbox";

const client = new SandboxClient();

const mountCfg = mountConfig({
  mounts: [
    gitMount({
      id: "repo",
      mountPath: "/mnt/mounts/repo",
      remoteUrl: "https://github.com/langchain-ai/langsmith-sdk.git",
      ref: { type: "branch", name: "main" },
      refreshIntervalSeconds: 60,
    }),
  ],
});

const sandbox = await client.createSandbox({
  name: "git-mount-sandbox",
  mountConfig: mountCfg,
});

try {
  const result = await sandbox.run("ls /mnt/mounts/repo");
  console.log(result.stdout);
} finally {
  await sandbox.delete();
}
```

</CodeGroup>当远程需要代理管理的身份验证时，私有 Git 存储库可以使用低级 `proxy_config` / `proxyConfig` 规则。目前还没有高级私有 Git 身份验证帮助程序。

## 安装 Context Hub 存储库

Context Hub 装载将代理或技能存储库的最新提交镜像到沙箱文件系统中。使用它为沙箱代码提供与生产代理相同的指令、技能和工具，而无需将它们打包到沙箱映像中或在启动时复制它们。

将存储库标识为`owner/repo`。使用 `-` 作为当前工作区中存储库的所有者，例如 `-/my-agent`。调用者的 API 密钥必须具有存储库的读取权限。 LangSmith 拒绝为另一个工作区私有的存储库创建沙箱，并且不区分丢失的存储库和无法访问的存储库。 Context Hub 安装不需要 AWS 或 GCP 身份验证。

<CodeGroup>

```python Python
from langsmith.sandbox import SandboxClient, context_hub_mount, mount_config

client = SandboxClient()

mount_cfg = mount_config(
    mounts=[
        context_hub_mount(
            id="memories",
            mount_path="/memories",
            repo="-/my-agent",
        )
    ],
)

with client.sandbox(
    name="context-hub-mount-sandbox", mount_config=mount_cfg
) as sb:
    result = sb.run("ls /memories")
    print(result.stdout)
```

```ts TypeScript
import { SandboxClient, contextHubMount, mountConfig } from "langsmith/sandbox";

const client = new SandboxClient();

const mountCfg = mountConfig({
  mounts: [
    contextHubMount({
      id: "memories",
      mountPath: "/memories",
      repo: "-/my-agent",
    }),
  ],
});

const sandbox = await client.createSandbox({
  name: "context-hub-mount-sandbox",
  mountConfig: mountCfg,
});

try {
  const result = await sandbox.run("ls /memories");
  console.log(result.stdout);
} finally {
  await sandbox.delete();
}
```

</CodeGroup>

挂载包含存储库最新提交的扁平化文件树。从另一个代理或技能存储库链接的文件出现在父存储库引用它的路径中，因此安装的代理也携带其组成的技能。有关编写存储库的更多信息，请参阅[Manage contexts with the SDK](/langsmith/manage-contexts-sdk)。

### 阅读存储库的变化Context Hub 安装是只读的，并且同步是单向的。在沙箱内的挂载路径下写入的文件永远不会被推回存储库，并且下次刷新会覆盖它们。将沙箱输出写入挂载外部的路径，并在其属于存储库时使用 Context Hub SDK 推送它。

LangSmith 在沙盒的生命周期内保持安装同步。新提交会在大约 30 秒内到达正在运行的沙箱。将这种节奏视为尽力而为，而不是新鲜度保证。刷新会立即替换整个树，因此读者会看到之前的提交或新的提交，而不会看到混合。

挂载始终跟踪最新的提交。要读取固定版本，请使用 Context Hub SDK 拉取所需的提交或环境标签，而不是安装存储库。

启动时通过 `initial_pull_only` / `initialPullOnly` 同步一次，然后停止轮询：

<CodeGroup>

```python Python
context_hub_mount(
    id="memories",
    mount_path="/memories",
    repo="-/my-agent",
    initial_pull_only=True,
)
```

```ts TypeScript
contextHubMount({
  id: "memories",
  mountPath: "/memories",
  repo: "-/my-agent",
  initialPullOnly: true,
});
```

</CodeGroup>

对必须从头到尾读取一次提交的运行使用单次拉取，例如将其结果与代理的特定版本进行比较的评估。

### 处理启动和失败一旦沙箱准备好，挂载目录就存在，但在其下读取会阻塞，直到第一个提交树到达。在启动时立即读取挂载的代码会等待初始同步，而不是看到一个空目录。

LangSmith 重试失败的刷新并继续提供其发布的最后一次提交，因此瞬态错误不会清空正在工作的挂载。沙箱代码有两个条件：

- **请求被拒绝**：读取失败并显示 `EIO`。在沙箱启动后撤销调用者对存储库的访问权限会拒绝以后的拉取，因为 LangSmith 会在每次拉取时重新检查访问权限。
- **超出同步限制的存储库**：挂载不服务于树。一次同步提交最多可容纳 2,500 个文件和 25 MiB 的文件内容（计算存储库链接的所有内容）。

## 组合坐骑

沙箱可以挂载多个源，包括 Context Hub 存储库以及存储桶和 Git 挂载。构建一个具有所有安装规范的 `mount_config` / `mountConfig`，并为这些规范使用的每个存储桶提供程序包含提供程序身份验证。

<CodeGroup>

```python Python
from langsmith.sandbox import (
    aws_auth,
    git_mount,
    gcp_auth,
    gcs_mount,
    mount_config,
    s3_mount,
    workspace_secret,
)

mount_cfg = mount_config(
    auth=[
        aws_auth(
            access_key_id=workspace_secret("SANDBOX_AWS_ACCESS_KEY_ID"),
            secret_access_key=workspace_secret("SANDBOX_AWS_SECRET_ACCESS_KEY"),
        ),
        gcp_auth(
            service_account_json=workspace_secret(
                "SANDBOX_GCP_SERVICE_ACCOUNT_JSON"
            ),
        ),
    ],
    mounts=[
        s3_mount(
            id="s3_data",
            mount_path="/mnt/mounts/s3-data",
            bucket="example-s3-bucket",
        ),
        gcs_mount(
            id="gcs_data",
            mount_path="/mnt/mounts/gcs-data",
            bucket="example-gcs-bucket",
        ),
        git_mount(
            id="repo",
            mount_path="/mnt/mounts/repo",
            remote_url="https://github.com/langchain-ai/langsmith-sdk.git",
        ),
    ],
)
```

```ts TypeScript
import {
  awsAuth,
  gitMount,
  gcpAuth,
  gcsMount,
  mountConfig,
  s3Mount,
  workspaceSecret,
} from "langsmith/sandbox";

const mountCfg = mountConfig({
  auth: [
    awsAuth({
      accessKeyId: workspaceSecret("SANDBOX_AWS_ACCESS_KEY_ID"),
      secretAccessKey: workspaceSecret("SANDBOX_AWS_SECRET_ACCESS_KEY"),
    }),
    gcpAuth({
      serviceAccountJson: workspaceSecret("SANDBOX_GCP_SERVICE_ACCOUNT_JSON"),
    }),
  ],
  mounts: [
    s3Mount({
      id: "s3_data",
      mountPath: "/mnt/mounts/s3-data",
      bucket: "example-s3-bucket",
    }),
    gcsMount({
      id: "gcs_data",
      mountPath: "/mnt/mounts/gcs-data",
      bucket: "example-gcs-bucket",
    }),
    gitMount({
      id: "repo",
      mountPath: "/mnt/mounts/repo",
      remoteUrl: "https://github.com/langchain-ai/langsmith-sdk.git",
    }),
  ],
});
```

</CodeGroup>

## 缓存桶挂载S3 和 GCS 安装支持可选的缓存设置。缓存设置调整本地
Bucket挂载使用的VFS缓存；水桶仍然是真相的来源。使用
缓存设置来控制本地磁盘使用和写回时间，而不是作为
单独的持久层。缓存设置不适用于 Git 挂载。

|领域 |描述 |
|--------|-------------|
| `max_size_bytes` |本地安装缓存的可选最大大小（以字节为单位）。设置正值以添加显式上限；省略它以保留运行时默认值。 |
| `writeback_seconds` |在将缓存的写入写回存储桶之前，可选延迟（以秒为单位）。默认为`0`。值越低，写入操作越快对存储桶可见；较高的值可以减少重写相同文件的工作负载的写入流量。 |

对于只读数据集挂载，仅在需要时配置`max_size_bytes`
特定的本地缓存上限。对于可写安装，当
另一个进程需要在沙箱之后立即从 S3 或 GCS 读取对象
他们写道。

<CodeGroup>

```python Python
s3_mount(
    id="customer_data",
    mount_path="/mnt/mounts/customer-data",
    bucket="example-bucket",
    cache={
        "max_size_bytes": 2 * 1024**3,
        "writeback_seconds": 5,
    },
)
```

```ts TypeScript
s3Mount({
  id: "customer_data",
  mountPath: "/mnt/mounts/customer-data",
  bucket: "example-bucket",
  cache: {
    max_size_bytes: 2 * 1024 ** 3,
    writeback_seconds: 5,
  },
});
```

</CodeGroup>

相同的缓存设置可用于 GCS 挂载：

<CodeGroup>

```python Python
gcs_mount(
    id="eval_datasets",
    mount_path="/mnt/mounts/eval-datasets",
    bucket="example-bucket",
    cache={
        "max_size_bytes": 2 * 1024**3,
        "writeback_seconds": 5,
    },
)
```

```ts TypeScript
gcsMount({
  id: "eval_datasets",
  mountPath: "/mnt/mounts/eval-datasets",
  bucket: "example-bucket",
  cache: {
    max_size_bytes: 2 * 1024 ** 3,
    writeback_seconds: 5,
  },
});
```

</CodeGroup>

## 限制- 创建沙箱时会附加安装座。创建一个新的沙箱来更改坐骑。
- 在每个沙箱的一个身份验证表面中配置每个云提供商的凭据。如果 mount auth 提供 AWS 或 GCP 凭证，请勿同时为同一提供商添加身份验证代理规则。
- Git refs 可以省略或设置为分支或标签。不支持提交引用。
- Git 挂载不支持 `read_only` / `readOnly` 或缓存设置。
- Context Hub 安装始终是只读的，并且不支持缓存设置。
- Context Hub 安装接受特工和技能库。 LangSmith 拒绝其他存储库类型和没有提交的存储库。
- Context Hub 装载路径不能是文件系统根目录，也不能位于系统目录（例如 `/etc`、`/usr` 或 `/var`）下。
- 恢复沙箱会在其配置的路径上重新连接每个 Context Hub 安装。在挂载内保存打开文件或工作目录的已恢复进程必须重新打开它。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-mounts.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>