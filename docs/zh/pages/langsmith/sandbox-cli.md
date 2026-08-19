<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox CLI | https://docs.langchain.com/langsmith/sandbox-cli -->

# 沙箱 CLI

[LangSmith CLI](/langsmith/langsmith-cli) 包括用于创建快照、启动沙箱、运行命令、打开交互式 shell 以及将 TCP 连接隧道传输到沙箱的沙箱命令。

沙箱 CLI 命令需要 LangSmith CLI `v0.2.26` 或更高版本。

## 安装并验证

安装或升级LangSmith CLI：

```bash
curl -fsSL https://cli.langsmith.com/install.sh | sh
langsmith self-update
```

使用您的 LangSmith API 密钥对 CLI 进行身份验证，并将其指向该密钥所属的环境：

```bash
export LANGSMITH_API_KEY="<LANGSMITH_API_KEY>"
export LANGSMITH_ENDPOINT="<LANGSMITH_ENDPOINT>"
```

`LANGSMITH_ENDPOINT` 默认为 `https://api.smith.langchain.com` (GCP US)。将其设置为 [BYOC](/langsmith/byoc) 上的数据平面 URL、[self-hosted](/langsmith/self-hosted) 上的实例 URL 或其他云区域上的 [API URL for your region](/langsmith/create-account-api-key#configure-the-sdk)。

默认情况下，CLI 输出是人类可读的表格。添加 `--format json` 以实现可编写脚本的输出：

```bash
langsmith --format json sandbox list
```

## 端到端工作流程

创建一个沙箱，然后在其中运行命令：

```bash
langsmith sandbox create my-vm

langsmith sandbox exec my-vm -- python --version
```

`create` 启动沙箱并在报告 `ready` 后返回，因此下一个命令可以立即运行。没有单独的等待步骤。一旦沙箱出现，就通过 `--console` 进入交互式 shell。

使用完沙箱后，将其删除：

```bash
langsmith sandbox delete my-vm
```

## 管理快照

从 Docker 镜像构建快照：

```bash
langsmith sandbox snapshot build my-snapshot \
  --docker-image ubuntu:24.04 \
  --capacity 8gb
````build` 将构建排队并立即返回快照的 `status`。轮询`langsmith sandbox snapshot get <SNAPSHOT_ID>`，直到报告`ready`。 `--capacity` 默认为 `4gb`，上限为 `64gb`。

对于私有镜像，首先创建一个registry（参见[Private registries](/langsmith/sandbox-snapshots#private-registries)），然后用`--registry-id`传递它的id：

```bash
langsmith sandbox snapshot build internal-python \
  --docker-image registry.example.com/internal/python:3.12 \
  --registry-id "$REGISTRY_ID"
```

从正在运行的沙箱捕获文件系统：

```bash
langsmith sandbox snapshot capture ml-ready --box my-vm
```

列出、检查和删除快照：

```bash
langsmith sandbox snapshot list
langsmith sandbox snapshot get <SNAPSHOT_ID>
langsmith sandbox snapshot delete <SNAPSHOT_ID>
```

## 管理沙箱

使用默认运行时创建沙箱。仅当您想从可重用的自定义快照启动时添加 `--snapshot-id`：

```bash
langsmith sandbox create my-vm --rootfs-capacity 8gb
```

使用 `--vcpus` 和 `--memory` 调整沙箱大小。内存以每个 vCPU 4 GiB 与 CPU 绑定，并且必须保持在该目标的 50% 以内，因此 2-vCPU 沙箱可接受 4 到 12 GiB。省略`--memory`，则遵循比例。

```bash
langsmith sandbox create my-vm --vcpus 2 --memory 8gb
```

列出并检查沙箱：

```bash
langsmith sandbox list
langsmith sandbox get my-vm
```

停止沙箱以尽早释放资源。它的文件系统被保留，下一个`exec`、`console`或服务请求会自动唤醒它，因此不需要运行启动步骤：

```bash
langsmith sandbox stop my-vm
langsmith sandbox exec my-vm -- echo awake
```

更新资源或代理配置：

```bash
langsmith sandbox update my-vm --rootfs-capacity 16gb
langsmith sandbox update my-vm --proxy-config @proxy.json
```

资源更改将在沙箱下次启动时生效。代理配置更改立即生效。

### 代理配置在 `create` 或 `update` 上使用 `--proxy-config @proxy.json` 配置沙盒身份验证代理。更喜欢使用工作区机密进行凭据注入，而不是将原始机密放置在本地文件中。

```json
{
  "rules": [
    {
      "name": "openai",
      "match_hosts": ["api.openai.com"],
      "match_paths": [],
      "headers": [
        {
          "name": "Authorization",
          "type": "workspace_secret",
          "value": "Bearer {OPENAI_API_KEY}"
        }
      ],
      "enabled": true
    }
  ],
  "access_control": {
    "allow_list": ["api.openai.com"],
    "deny_list": []
  }
}
```

有关代理规则的更多信息，请参阅[Sandbox auth proxy](/langsmith/sandbox-auth-proxy)。

## 运行命令

使用 `sandbox exec` 来执行一次性命令：

```bash
langsmith sandbox exec my-vm -- uname -a
langsmith sandbox exec my-vm -- ls -la /
langsmith sandbox exec my-vm -- cat /etc/os-release
```

`--`之后的所有内容都会作为命令发送到沙箱。 CLI 将 stdout 打印到 stdout，将 stderr 打印到 stderr，并以沙箱命令的退出代码退出。

## 打开交互式控制台

使用 `sandbox console` 作为 PTY 支持的交互式 shell：

```bash
langsmith sandbox console my-vm
langsmith sandbox console my-vm --shell /bin/sh
```

您可以将本地 SSH 代理转发到控制台会话：

```bash
langsmith sandbox console my-vm --forward-ssh-agent
```

`--forward-ssh-agent` 需要在本地设置`SSH_AUTH_SOCK`。 Windows 不支持交互式控制台会话；请改用 SSH 访问。

## 隧道 TCP 端口

当您需要转发到沙箱内侦听的服务的本地 TCP 端口时，请使用`sandbox tunnel`。这对于需要 `localhost` 的数据库、语言服务器、自定义协议或本地工具非常有用。

在沙箱中启动一个服务，然后通过隧道连接到它：

```bash
langsmith sandbox exec my-vm -- sh -c 'cd /tmp && nohup python -m http.server 8000 > /tmp/http.log 2>&1 &'
langsmith sandbox tunnel my-vm --remote-port 8000 --local-port 18000
```

然后本地连接：

```bash
curl http://127.0.0.1:18000
```

如果省略 `--local-port`，CLI 将使用与 `--remote-port` 相同的值：

```bash
langsmith sandbox tunnel my-vm --remote-port 5432
```

隧道进程位于前台。用`Ctrl+C`阻止它。

您还可以通过沙箱 URL 而不是名称进行隧道：```bash
langsmith sandbox tunnel \
  --url <SANDBOX_URL> \
  --remote-port 5432
```

<Tip>
对于您想要在浏览器中打开或与团队成员共享的 HTTP 应用程序，请使用 [Sandbox service URLs](/langsmith/sandbox-service-urls)。使用原始 TCP 协议或本地开发工具的隧道。
</Tip>

## 设置 SSH 访问

使用`sandbox ssh-setup`通过沙箱隧道配置`ssh`、`scp`、`rsync`、`sftp`等标准SSH工具。

```bash
langsmith sandbox ssh-setup my-vm
langsmith sandbox ssh-setup my-vm --identity ~/.ssh/id_ed25519.pub
```

该命令将您的 SSH 公钥上传到沙箱，获取沙箱主机密钥（如果可用），将 `Host sandbox-<name>` 块写入 `~/.ssh/config`，并将沙箱主机密钥写入 `~/.ssh/known_hosts_sandboxes`。

设置完成后，连接：

```bash
ssh sandbox-my-vm
```

沙盒映像必须在端口 `22` 上运行 `sshd`。如果 `sshd` 未运行，`ssh-setup` 会发出警告，并且 SSH 连接将无法工作，直到您在沙箱内启动它。

<Warning>
`ssh-setup`修改本地SSH配置并编写调用`langsmith sandbox tunnel`的`ProxyCommand`。根据 CLI 的身份验证方式，生成的块可能包含凭据或对凭据的引用。仅在受信任的计算机上运行它，并且不要提交或共享生成的 SSH 配置块。
</Warning>

## 命令参考|命令 |描述 |
| --- | --- |
| `langsmith sandbox snapshot list` |列出快照。 |
| `langsmith sandbox snapshot build <name> --docker-image <image>` |从 Docker 镜像构建快照。 |
| `langsmith sandbox snapshot capture <name> --box <sandbox>` |从正在运行的沙箱捕获快照。 |
| `langsmith sandbox snapshot get <snapshot-id>` |检查快照。 |
| `langsmith sandbox snapshot delete <snapshot-id>` |删除快照。 |
| `langsmith sandbox create <name>` |使用默认运行时创建沙箱。 |
| `langsmith sandbox list` |列出沙箱。 |
| `langsmith sandbox get <name>` |检查沙箱。 |
| `langsmith sandbox update <name>` |更新沙箱资源或代理配置。 |
| `langsmith sandbox stop <name>` |停止正在运行的沙箱，同时保留文件系统状态。稍后的 `exec`、`console` 或服务请求会再次唤醒它。 |
| `langsmith sandbox delete <name>` |删除沙箱。 |
| `langsmith sandbox exec <name> -- <command>` |在沙箱内运行一次性命令。 |
| `langsmith sandbox console <name>` |在沙箱内打开交互式 shell。 |
| `langsmith sandbox tunnel <name> --remote-port <port>` |将本地 TCP 端口转发到沙箱端口。 |
| `langsmith sandbox ssh-setup <name>` |通过`sandbox tunnel --stdio`配置本地SSH访问。 |

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-cli.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>