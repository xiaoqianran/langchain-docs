<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox mounts | https://docs.langchain.com/langsmith/sandbox-mounts -->

# 沙盒坐骑

创建沙箱时，沙箱挂载会将外部数据源附加到沙箱文件系统。当沙箱代码需要直接文件访问对象存储桶、公共 Git 存储库或[Context Hub](/langsmith/use-the-context-hub) 存储库而不将数据复制到沙箱映像中时，请使用挂载。

挂载通过 Python 中的 `mount_config` 或 TypeScript 中的 `mountConfig` 进行配置。 SDK 将安装规范发送到 LangSmith 并为提供者凭证编写所需的 [auth proxy](/langsmith/sandbox-auth-proxy) 规则。

<Note>
沙盒安装需要 `langsmith[sandbox]>=0.8.16`（对于 Python）或 `langsmith>=0.7.10`（对于 TypeScript）。 Context Hub 安装需要 `langsmith[sandbox]>=0.11.0`（对于 Python）或 `langsmith>=0.8.11`（对于 TypeScript）。
</Note>

<Warning>
使用静态 AWS 密钥或 GCP 服务帐户时，请在创建沙箱之前将云凭证存储为 LangSmith 工作区密钥。使用 IAM 角色进行身份验证的 S3 挂载不需要存储的 AWS 访问密钥。不要将真实的云凭据作为沙箱环境变量、命令参数或文件传递。
</Warning>

## 配置挂载路径每个安装座都有一个 `id`、一个 `type` 和一个 `mount_path` / `mountPath`。 Bucket 和 Git 挂载必须使用`/mnt/mounts`下的绝对路径。上下文中心安装路径可以是系统目录之外的任何绝对路径，因此代理可以从它已经期望的位置读取其上下文。

使用描述已安装源的稳定路径：

|来源 |示例路径 |
|--------|--------------|
| S3 存储桶前缀 | `/mnt/mounts/customer-data` |
| GCS 存储桶前缀 | `/mnt/mounts/eval-datasets` |
| Git 存储库 | `/mnt/mounts/repo` |
| Context Hub 存储库 | `/memories` |

安装 ID 可以包含 ASCII 字母、数字、下划线和连字符。不要在同一沙箱内重复使用 ID 或安装路径。

## 安装 S3 存储桶

S3 安装需要 AWS 身份验证。当您的部署和 SDK 支持角色身份验证时，请使用静态访问密钥或 IAM 角色。 LangSmith UI 还支持角色设置。这两种方法都将真实的 AWS 凭证保留在沙箱之外。

### 使用静态访问密钥进行身份验证

该开发工具包从 `aws_auth` / `awsAuth` 创建 AWS 身份验证代理规则，因此沙箱可以访问存储桶，而无需查看真正的访问密钥。

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

### 使用 IAM 角色进行身份验证IAM 角色身份验证让 [AWS auth proxy](/langsmith/sandbox-auth-proxy#authenticate-with-an-iam-role) 承担您的 AWS 账户中的角色。 S3 挂载使用与沙箱中其他受支持的 AWS 请求相同的身份验证。 LangSmith 获取并更新临时 AWS 凭证，因此您无需在工作区机密中存储或轮换访问密钥。

<Note>
此选项需要您的 LangSmith 部署才能启用 AWS 代理角色身份验证。为 ECR 注册表启用 IAM 角色不会为身份验证代理启用它们。如果 AWS 身份验证选项中缺少 **AWS IAM 角色**，请使用静态访问密钥或联系您的 LangSmith 管理员。基于角色的 SDK 示例需要在 Python 中使用 `aws_auth(role_arn=...)` 和 `mount_config(proxy_config=...)` 或在 TypeScript 中使用 `awsAuth({ roleArn })` 和 `mountConfig({ proxyConfig })` 的版本。本页顶部列出的安装版本不支持这些较新的选项。
</Note>

您需要拥有配置客户 IAM 角色的信任和访问策略的权限。一条 AWS 身份验证规则适用于沙箱的 AWS 请求，包括所有 S3 挂载。选择静态访问密钥或 IAM 角色；请勿同时配置两者。角色身份验证在创建时配置。创建新的沙箱以添加、删除、禁用或更改其角色。LangSmith 委托人还需要获得担任客户角色的权限。对于自托管部署，您的管理员会配置该权限和任何所需的角色标签。跨账户 S3 存储桶可能还需要允许客户角色的存储桶策略。

配置角色并创建沙箱：

1. 打开 **沙箱 > 创建沙箱**，在 **挂载** 部分添加 **S3 存储桶**，并配置其存储桶、区域、前缀、挂载路径和只读设置。
2. 转到 **网络** 部分，启用 AWS 身份验证，然后选择 **AWS IAM 角色**。要使用不带挂载的角色，请跳过步骤 1 中的挂载配置。
3. 在 IAM 角色的信任策略中使用 **AWS 角色 ARN** 下面显示的两个值：
   - **主体**：此 LangSmith 部署用于承担客户角色的确切 AWS 角色 ARN。使用显示的主体，而不是从其他环境或 ECR 注册表复制的 ARN。
   - **外部 ID**：您当前的 LangSmith 工作区 UUID。 LangSmith 在承担角色时提供该值；您不选择单独的外部 ID。4. 展开 **AWS 角色设置**，选择 **复制信任策略**，然后将该策略应用到 AWS IAM 中的客户角色。它仅允许 `sts:AssumeRole` 用于具有匹配 `sts:ExternalId` 的显示主体。
5. 为沙箱所需的 AWS 服务和资源附加最低权限策略。对于配置的 S3 挂载，**复制 S3 权限**提供启动策略。在附加之前先检查一下； LangSmith 不会自动应用它。
6. 在 **AWS 角色 ARN** 中输入客户角色的 ARN。这是您在帐户中配置的角色，而不是设置说明中显示的 LangSmith 主体。
7. 选择 **创建沙箱**，然后验证沙箱代码是否可以读取装载路径，并且对于可写装载，可以写入该路径。

生成的信任策略具有这种结构。将占位符替换为表单中显示的主体和外部 ID，或从表单中复制已完成的策略：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "<LANGSMITH_AWS_PROXY_PRINCIPAL_ARN>"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "<LANGSMITH_WORKSPACE_ID>"
        }
      }
    }
  ]
}
```

不要用 `*` 替换主体或删除外部 ID 条件。在 LangSmith 中输入客户角色 ARN 不会创建角色或更新其 AWS 策略。

#### 限制 S3 访问

可选的 S3 权限示例根据装载设置授予访问权限：- **所有 S3 挂载**：存储桶位置访问、前缀范围列表和对象读取。
- **可写挂载**：附加对象写入、删除和分段上传权限。
- **空前缀**：整个存储桶的对象访问。使用前缀来限制对子树的访问。

该角色的有效 AWS 权限控制所有支持的 AWS 代理请求。 LangSmith 不将常规 AWS 角色会话限制为已配置的挂载。将角色的 IAM 策略限制为所需的存储桶、前缀、操作和其他 AWS 资源。

<Warning>
只读挂载会拒绝文件系统写入，但不会阻止角色允许的直接 S3 API 写入。使用角色的 IAM 策略强制实施只读 AWS 访问。
</Warning>

使用商业 AWS 角色和支持的 AWS HTTPS 终端节点。 S3权限示例不包括KMS权限；查看存储桶的加密设置所需的权限。

#### 在 SDK 中使用共享角色

共享 AWS 代理角色对 S3 安装和支持的应用程序请求进行身份验证，就像上面的 UI 设置一样。首先配置信任和权限策略，然后将示例角色 ARN 和存储桶替换为您自己的值。将相同的代理配置传递给挂载助手和沙箱创建。挂载助手不会将其复制到挂载特定的身份验证中：

<CodeGroup>

```python Python
from langsmith.sandbox import (
    SandboxClient,
    aws_auth,
    mount_config,
    proxy_config,
    s3_mount,
)

proxy_cfg = proxy_config(
    rules=[aws_auth(role_arn="arn:aws:iam::123456789012:role/LangSmithSandbox")]
)
mount_cfg = mount_config(
    proxy_config=proxy_cfg,
    mounts=[
        s3_mount(
            id="customer_data",
            mount_path="/mnt/mounts/customer-data",
            bucket="example-bucket",
            prefix="datasets/customer-data",
            region="us-east-1",
            read_only=True,
        )
    ],
)

client = SandboxClient()
sandbox = client.create_sandbox(
    name="shared-role-mount-sandbox",
    mount_config=mount_cfg,
    proxy_config=proxy_cfg,
)
```

```ts TypeScript
import {
  SandboxClient,
  awsAuth,
  mountConfig,
  proxyConfig,
  s3Mount,
} from "langsmith/sandbox";

const proxyCfg = proxyConfig({
  rules: [
    awsAuth({ roleArn: "arn:aws:iam::123456789012:role/LangSmithSandbox" }),
  ],
});
const mountCfg = mountConfig({
  proxyConfig: proxyCfg,
  mounts: [
    s3Mount({
      id: "customer_data",
      mountPath: "/mnt/mounts/customer-data",
      bucket: "example-bucket",
      prefix: "datasets/customer-data",
      region: "us-east-1",
      readOnly: true,
    }),
  ],
});

const client = new SandboxClient();
const sandbox = await client.createSandbox({
  name: "shared-role-mount-sandbox",
  mountConfig: mountCfg,
  proxyConfig: proxyCfg,
});
```

</CodeGroup>

共享规则保留其有效的 IAM 权限。本示例中的只读挂载不会阻止角色允许的直接 S3 API 写入。 S3 安装支持共享代理身份验证，GCS 安装不支持； GCS 仍然需要显式安装身份验证。

#### 将角色限制为 S3 挂载范围

特定于装载的角色身份验证添加了一个会话策略，该策略限制 AWS 访问已配置的 S3 存储桶、前缀和只读设置。当沙箱 AWS 访问必须保持在这些挂载范围内时，请使用此 API 替代方案。客户角色仍然需要上述信任和权限策略。

传递`auth`中的角色，将其序列化为`mount_config.auth.aws.role_arn`。不要同时传递 AWS 代理规则：

<CodeGroup>

```python Python
from langsmith.sandbox import SandboxClient, aws_auth, mount_config, s3_mount

mount_cfg = mount_config(
    auth=[aws_auth(role_arn="arn:aws:iam::123456789012:role/LangSmithSandbox")],
    mounts=[
        s3_mount(
            id="customer_data",
            mount_path="/mnt/mounts/customer-data",
            bucket="example-bucket",
            prefix="datasets/customer-data",
            region="us-east-1",
            read_only=True,
        )
    ],
)

client = SandboxClient()
sandbox = client.create_sandbox(
    name="mount-scoped-role-sandbox",
    mount_config=mount_cfg,
)
```

```ts TypeScript
import { SandboxClient, awsAuth, mountConfig, s3Mount } from "langsmith/sandbox";

const mountCfg = mountConfig({
  auth: [
    awsAuth({ roleArn: "arn:aws:iam::123456789012:role/LangSmithSandbox" }),
  ],
  mounts: [
    s3Mount({
      id: "customer_data",
      mountPath: "/mnt/mounts/customer-data",
      bucket: "example-bucket",
      prefix: "datasets/customer-data",
      region: "us-east-1",
      readOnly: true,
    }),
  ],
});

const client = new SandboxClient();
const sandbox = await client.createSandbox({
  name: "mount-scoped-role-sandbox",
  mountConfig: mountCfg,
});
```

</CodeGroup>

特定于挂载的 `mount_config.auth.aws` API 接受 `role_arn` 或静态 `access_key_id` 和 `secret_access_key` 对，但不能同时接受两者。它不能与 AWS 代理规则结合使用。本页前面的静态键示例继续保持不变。

#### 更新凭证LangSmith 在 AWS 请求需要时更新临时凭证，包括在沙箱停止和恢复之后。您不提供已保存的 STS 令牌或手动更新它。保留角色的信任和访问权限以便持续访问。

如果续订暂时不可用，则装载只能使用缓存的凭据，直到它们过期。授权拒绝或过期凭证会导致经过身份验证的 S3 请求失败；安装不会回退到静态密钥。

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

LangSmith 重试失败的刷新并继续提供其发布的最后一次提交，因此暂时性错误不会清空正在工作的挂载。沙箱代码有两个条件：

- **被拒绝的请求**：读取失败并显示 `EIO`。在沙箱启动后撤销调用者对存储库的访问权限会拒绝以后的拉取，因为 LangSmith 会在每次拉取时重新检查访问权限。
- **超出同步限制的存储库**：挂载不服务于树。一次同步提交最多可容纳 2,500 个文件和 25 MiB 的文件内容（计算存储库链接的所有内容）。

## 组合坐骑

沙箱可以挂载多个源，包括 Context Hub 存储库以及存储桶和 Git 挂载。构建一个具有所有安装规范的 `mount_config` / `mountConfig`，并为这些规范使用的每个存储桶提供程序提供提供程序身份验证。

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

|领域|描述 |
|--------|-------------|
| `max_size_bytes` |本地安装缓存的可选最大大小（以字节为单位）。设置正值以添加显式上限；省略它以保留运行时默认值。 |
| `writeback_seconds` |在将缓存的写入写回存储桶之前，可选延迟（以秒为单位）。默认为`0`。值越低，写入操作越快对存储桶可见；较高的值可以减少重写相同文件的工作负载的写入流量。 |

对于只读数据集挂载，仅在需要时配置 `max_size_bytes`
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