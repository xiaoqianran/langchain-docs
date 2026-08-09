<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox CLI | https://docs.langchain.com/langsmith/sandbox-cli -->

# 沙箱 CLI

从命令行创建、检查、连接并通过隧道进入 LangSmith 沙箱。

[LangSmith CLI](/langsmith/langsmith-cli) 包括用于创建快照、启动沙箱、运行命令、打开交互式 shell 以及将 TCP 连接隧道传输到沙箱的沙箱命令。

沙盒 CLI 命令需要 LangSmith CLI `v0.2.26` 或更高版本。

## 安装并验证

安装或升级 LangSmith CLI：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -fsSL https://cli.langsmith.com/install.sh | sh
langsmith self-update
```

使用您的 LangSmith API 密钥验证 CLI：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="<LANGSMITH_API_KEY>"
```

CLI 输出默认为 JSON。添加 `--format pretty` 以列出人类可读表格的命令：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith --format pretty sandbox list
```

## 端到端工作流程

创建一个沙箱，然后在其中运行命令：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox create my-vm --wait

langsmith sandbox exec my-vm -- python --version
```

使用完沙箱后，将其删除：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox delete my-vm
```

## 管理快照

从 Docker 镜像构建快照：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox snapshot build my-snapshot \
  --docker-image ubuntu:24.04 \
  --capacity 8gb \
  --wait
```

对于私有镜像，首先创建一个registry（参见[Private registries](/langsmith/sandbox-snapshots#private-registries)），然后用`--registry-id`传递它的id：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox snapshot build internal-python \
  --docker-image registry.example.com/internal/python:3.12 \
  --registry-id "$REGISTRY_ID" \
  --wait
```

从正在运行的沙箱捕获文件系统：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox snapshot capture ml-ready \
  --box my-vm \
  --wait
```

列出、检查、等待和删除快照：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox snapshot list
langsmith sandbox snapshot get <SNAPSHOT_ID>
langsmith sandbox snapshot wait <SNAPSHOT_ID>
langsmith sandbox snapshot delete <SNAPSHOT_ID>
```

## 管理沙箱

使用默认运行时创建沙箱。仅当您想从可重用的自定义快照启动时添加 `--snapshot-id`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox create my-vm \
  --rootfs-capacity 8gb \
  --wait
```

列出并检查沙箱：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox list
langsmith sandbox get my-vm
langsmith sandbox wait my-vm
```

停止和启动沙箱，同时保留其文件系统：```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox stop my-vm
langsmith sandbox start my-vm --wait
```

更新资源或代理配置：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox update my-vm --rootfs-capacity 16gb
langsmith sandbox update my-vm --proxy-config @proxy.json
```

资源更改将在沙箱下次启动时生效。代理配置更改立即生效。

### 代理配置

在 `create` 或 `update` 上使用 `--proxy-config @proxy.json` 配置沙箱身份验证代理。更喜欢使用工作区机密进行凭据注入，而不是将原始机密放置在本地文件中。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox exec my-vm -- uname -a
langsmith sandbox exec my-vm -- ls -la /
langsmith sandbox exec my-vm -- cat /etc/os-release
```

`--` 之后的所有内容都会作为命令发送到沙箱。 CLI 将 stdout 打印到 stdout，将 stderr 打印到 stderr，并以沙箱命令的退出代码退出。

## 打开交互式控制台

使用 `sandbox console` 作为 PTY 支持的交互式 shell：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox console my-vm
langsmith sandbox console my-vm --shell /bin/sh
```

您可以将本地 SSH 代理转发到控制台会话：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox console my-vm --forward-ssh-agent
```

`--forward-ssh-agent` 需要在本地设置`SSH_AUTH_SOCK`。 Windows 不支持交互式控制台会话；请改用 SSH 访问。

## 隧道 TCP 端口

当您需要转发到沙箱内侦听的服务的本地 TCP 端口时，请使用`sandbox tunnel`。这对于需要 `localhost` 的数据库、语言服务器、自定义协议或本地工具非常有用。

在沙箱中启动一个服务，然后通过隧道连接到它：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox exec my-vm -- sh -c 'cd /tmp && nohup python -m http.server 8000 > /tmp/http.log 2>&1 &'
langsmith sandbox tunnel my-vm --remote-port 8000 --local-port 18000
```然后本地连接：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl http://127.0.0.1:18000
```

如果省略 `--local-port`，CLI 将使用与 `--remote-port` 相同的值：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox tunnel my-vm --remote-port 5432
```

隧道进程位于前台。用`Ctrl+C`阻止它。

您还可以通过沙箱 URL 而不是名称进行隧道：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox tunnel \
  --url <SANDBOX_URL> \
  --remote-port 5432
```

<Tip>
  对于您想要在浏览器中打开或与队友共享的 HTTP 应用程序，请使用 [Sandbox service URLs](/langsmith/sandbox-service-urls)。使用原始 TCP 协议或本地开发工具的隧道。
</Tip>

## 设置 SSH 访问

使用`sandbox ssh-setup`通过沙盒隧道配置`ssh`、`scp`、`rsync`、`sftp`等标准SSH工具。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandbox ssh-setup my-vm
langsmith sandbox ssh-setup my-vm --identity ~/.ssh/id_ed25519.pub
```

该命令将您的 SSH 公钥上传到沙箱，获取沙箱主机密钥（如果可用），将 `Host sandbox-<name>` 块写入 `~/.ssh/config`，并将沙箱主机密钥写入 `~/.ssh/known_hosts_sandboxes`。

设置完成后，连接：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ssh sandbox-my-vm
```

沙盒映像必须在端口 `22` 上运行 `sshd`。如果 `sshd` 未运行，`ssh-setup` 会发出警告，并且 SSH 连接将无法工作，直到您在沙箱内启动它。

<Warning>
  `ssh-setup`修改本地SSH配置并编写调用`langsmith sandbox tunnel`的`ProxyCommand`。根据 CLI 的身份验证方式，生成的块可能包含凭据或对凭据的引用。仅在受信任的计算机上运行它，并且不要提交或共享生成的 SSH 配置块。
</Warning>## 命令参考

|命令 |描述 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `langsmith sandbox snapshot list` |列出快照。                                              |
| `langsmith sandbox snapshot build <name> --docker-image <image>` |从 Docker 镜像构建快照。                        |
| `langsmith sandbox snapshot capture <name> --box <sandbox>` |从正在运行的沙箱捕获快照。                   |
| `langsmith sandbox snapshot get <snapshot-id>` |检查快照。                                          |
| `langsmith sandbox snapshot wait <snapshot-id>` |等待快照准备就绪。                         |
| `langsmith sandbox snapshot delete <snapshot-id>` |删除快照。                                           |
| `langsmith sandbox create <name>` |使用默认运行时创建沙箱。                   |
| `langsmith sandbox list` |列出沙箱。                                              |
| `langsmith sandbox get <name>` |检查沙箱。                                           || `langsmith sandbox update <name>` |更新沙箱资源或代理配置。                    |
| `langsmith sandbox wait <name>` |等待沙箱准备就绪。                          |
| `langsmith sandbox start <name>` |启动已停止的沙箱。                                     |
| `langsmith sandbox stop <name>` |停止正在运行的沙箱，同时保留文件系统状态。    |
| `langsmith sandbox delete <name>` |删除沙箱。                                            |
| `langsmith sandbox exec <name> -- <command>` |在沙箱内运行一次性命令。                      |
| `langsmith sandbox console <name>` |在沙箱内打开交互式 shell。                  |
| `langsmith sandbox tunnel <name> --remote-port <port>` |将本地 TCP 端口转发到沙箱端口。                  |
| `langsmith sandbox ssh-setup <name>` |通过`sandbox tunnel --stdio`配置本地SSH访问。 |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-cli.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>