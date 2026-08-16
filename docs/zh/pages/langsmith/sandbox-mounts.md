<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox mounts | https://docs.langchain.com/langsmith/sandbox-mounts -->

# 沙盒坐骑

创建沙箱时，沙箱挂载会将外部数据源附加到沙箱文件系统。当沙箱代码需要直接文件访问对象存储桶或公共 Git 存储库而不将数据复制到沙箱映像中时，请使用挂载。

挂载通过 Python 中的 `mount_config` 或 TypeScript 中的 `mountConfig` 进行配置。 SDK 将安装规范发送到 LangSmith 并为提供者凭证编写所需的 [auth proxy](/langsmith/sandbox-auth-proxy) 规则。

<Note>
沙盒安装需要 `langsmith[sandbox]>=0.8.16`（对于 Python）或 `langsmith>=0.7.10`（对于 TypeScript）。
</Note>

<Warning>
在创建装载 S3 或 GCS 的沙箱之前，将云凭据存储为 LangSmith 工作区机密。不要将真实的云凭据作为沙箱环境变量、命令参数或文件传递。
</Warning>

## 配置挂载路径

每个安装座都有一个 `id`、一个 `type` 和一个 `mount_path` / `mountPath`。挂载路径必须是`/mnt/mounts`下的绝对路径。

使用描述已安装源的稳定路径：

|来源 |示例路径 |
|--------|--------------|
| S3 存储桶前缀 | `/mnt/mounts/customer-data` |
| GCS 存储桶前缀 | `/mnt/mounts/eval-datasets` |
| Git 存储库 | `/mnt/mounts/repo` |

安装 ID 可以包含 ASCII 字母、数字、下划线和连字符。不要在同一沙箱内重复使用 ID 或安装路径。## 安装 S3 存储桶

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

GCS 安装需要 GCP 身份验证。读/写安装需要 `https://www.googleapis.com/auth/devstorage.read_write` 或 `https://www.googleapis.com/auth/cloud-platform` OAuth 范围。只读挂载可以使用`https://www.googleapis.com/auth/devstorage.read_only`。

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
            scopes=["https://www.googleapis.com/auth/devstorage.read_write"],
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
      scopes: ["https://www.googleapis.com/auth/devstorage.read_write"],
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

</CodeGroup>

当远程需要代理管理的身份验证时，私有 Git 存储库可以使用低级 `proxy_config` / `proxyConfig` 规则。目前还没有高级私有 Git 身份验证帮助程序。

## 组合坐骑

一个沙箱可以挂载多个源。构建一个具有所有安装规范的 `mount_config` / `mountConfig`，并为这些规范使用的每个存储桶提供程序提供提供程序身份验证。

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
            scopes=["https://www.googleapis.com/auth/devstorage.read_write"],
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
      scopes: ["https://www.googleapis.com/auth/devstorage.read_write"],
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

|领域|描述 |
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

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-mounts.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>