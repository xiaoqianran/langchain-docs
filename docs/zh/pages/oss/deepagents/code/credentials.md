<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Provider credentials | https://docs.langchain.com/oss/deepagents/code/credentials -->

# 提供者凭据

添加和管理模型提供程序、Tavily Web 搜索和 LangSmith 跟踪的 API 密钥

Deep Agents Code 需要为您使用的每个模型提供程序提供一个 API 密钥。推荐的添加方法是[⟦T7⟧](#use-%2Fauth-recommended)凭证管理器。对于非交互式运行，请使用 [⟦T8⟧](#manage-credentials-from-the-shell-dcode-auth) 或设置 [environment variables](#environment-variables-ci-and-headless) 从 shell 管理相同的存储密钥。

如果同一键设置在多个位置，请参见[Key resolution order](#key-resolution-order)，哪一个​​获胜。

对于`.env`加载顺序和`DEEPAGENTS_CODE_`前缀，请参阅[Configuration](/oss/deepagents/code/configuration#environment-variables)。

## 使用`/auth`（推荐）

从任何会话打开凭证管理器：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
/auth
```

该管理器列出了已安装的 LLM 提供程序以及它们是否具有环境密钥集，显示您可以从应用程序内添加的已知提供程序，并包括非模型服务，例如 Tavily 网络搜索。选择一个提供程序以添加或替换其密钥、安装对已卸载提供程序的支持或删除已存储的提供程序。您添加的密钥在会话中持续存在。

<Accordion title="Provider row labels" icon="list-check">
  每行显示提供者名称，后跟其密钥的来源：|标签|意义|
  | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `[stored]` |通过 `/auth` 保存在此管理器中的密钥 |
  | `[env: VARNAME]` |密钥来自环境变量`VARNAME`（已解析的名称，例如`DEEPAGENTS_CODE_OPENAI_API_KEY`或`OPENAI_API_KEY`）|
  | `[missing]` |未存储密钥且未设置环境变量；选择要粘贴的行|
</Accordion>

`/auth` 提示还有一个可选的 **基本 URL** 字段。将其留空以使用提供程序的默认端点，或设置一个自定义端点以与此密钥一起使用。基本 URL 与密钥一起保存。请参阅[Endpoints, keys, and gateways](/oss/deepagents/code/config-file#endpoints-keys-and-gateways)了解端点如何解析，包括网关。

<Warning>
  存储的基本 URL 不是秘密，可以被记录；与之配对的密钥永远不会被记录。
</Warning><Note>
  密钥的范围仅限于您在本机上的用户帐户 - Deep Agents Code 绝不会将它们传输到除配置的提供商的 API 之外的任何地方。
</Note>

### 使用 ChatGPT 登录

在 `/auth` 中选择 `openai_codex` 提供商将启动浏览器登录，而不是提示输入 API 密钥，从而让您可以通过 ChatGPT 订阅使用 OpenAI 模型。要重新验证或注销，请再次选择`openai_codex`。完整流程请参见[Sign in with ChatGPT (Codex models)](/oss/deepagents/code/providers)。

`/auth` 管理 LLM 提供商凭证、Tavily 网络搜索密钥和 LangSmith 跟踪。在下次启动时输入 [activate web search](#enable-web-search-with-tavily) 的 Tavilly 密钥。输入 LangSmith 密钥以启用跟踪。密钥也从环境中读取。你可以[set them in ⟦T24⟧ or your shell](/oss/deepagents/code/configuration#environment-variables)。

## 从 shell 管理凭证 (`dcode auth`)

`dcode auth` 命令组是 `/auth` 管理器的可编写脚本的等效项：它管理相同的存储凭据，而无需启动 TUI，这使其可用于 dotfile 引导、CI/CD 以及通过 SSH 在远程设备上设置密钥。子命令反映了情态动词的动词：|命令 |描述 |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| `dcode auth list`（别名`ls`）|列出每个已知的提供商及其密钥解析的位置 |
| `dcode auth status <provider>` |打印一个提供商的解析源 |
| `dcode auth set <provider>` |存储 API 密钥，默认从 stdin 读取 |
| `dcode auth remove <provider>`（别名`rm`、`delete`）|删除存储的凭据 |
| `dcode auth path` |打印凭证存储的已解析路径 (`auth.json`) |

默认情况下，`set` 从 **stdin** 读取密钥，因此它永远不会出现在 shell 历史记录或 `argv` 中。通过管道输入密钥，或使用 `--from-env VAR` 从进程环境变量中复制它：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Pipe the key in (stdin)
echo "$ANTHROPIC_API_KEY" | dcode auth set anthropic

# Copy it from an existing environment variable
dcode auth set openai --from-env OPENAI_API_KEY
```<Note>
  `set` 拒绝在交互式终端中运行，因此意外调用不会挂起等待输入 — 通过 stdin 管道传输密钥或使用 `--from-env VAR`。存储的密钥与 `/auth` 通过相同的存储，因此警告（例如，有关 `auth.json` 上的文件权限）会打印到 stderr。
</Note>

删除存储的密钥或打印存储位置：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode auth remove anthropic
dcode auth path
```

<Note>
  `dcode auth set` 仅管理 API 密钥。 `openai_codex` 提供商使用 ChatGPT 浏览器登录而不是 API 密钥，因此请运行 [⟦T46⟧ and select ⟦T47⟧](#sign-in-with-chatgpt) 进行登录。 `dcode auth remove openai_codex` 确实将您注销。
</Note>

## 环境变量（CI 和 headless）

对于非交互式运行、CI/CD 管道或 TUI 不可用的任何地方，请在 shell 中导出提供程序的环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."

# Prefix with DEEPAGENTS_CODE_ to scope a key to Deep Agents Code only,
# leaving a shared key used by other CI steps untouched
export DEEPAGENTS_CODE_OPENAI_API_KEY="sk-..."
```

要将密钥保存在文件中，请在 [⟦T49⟧ file](/oss/deepagents/code/configuration#environment-variables) 中定义它们。

## 关键解析顺序

当在多个位置设置提供程序的密钥时，Deep Agents Code 将使用设置的第一个位置：

1. **`DEEPAGENTS_CODE_`-前缀环境变量** — 例如 `DEEPAGENTS_CODE_OPENAI_API_KEY` 作为内联 shell 导出。 [⟦T52⟧ prefix](/oss/deepagents/code/configuration#deepagents_code_-prefix) 是显式的“在深度代理代码中使用此密钥”覆盖。
2. **应用程序存储的密钥** — 在 `/auth` 凭证管理器中输入。
3. **普通提供程序环境变量** — 例如 `OPENAI_API_KEY`，来自您的 shell 或 `.env` 文件。应用程序存储的密钥胜过同一提供商的普通 env-var 密钥，但 `DEEPAGENTS_CODE_` 前缀的密钥胜过应用程序存储的密钥。前缀是在单次运行中覆盖已存储密钥而不清除它的方法：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# With a key already stored via /auth, a plain env var does not override it.
# dcode still uses the app-stored key for this run:
OPENAI_API_KEY=sk-xxxx dcode -n "..."

# The DEEPAGENTS_CODE_ prefix does override it, for this run only:
DEEPAGENTS_CODE_OPENAI_API_KEY=sk-xxxx dcode -n "..."
```

这种分层存在的常见情况是，您的机器已经出于其他目的导出了一个普通的提供程序变量（由其他工具、脚本或 CI 使用的共享 `OPENAI_API_KEY`），而您不希望 Deep Agents 代码重用该变量。应用程序存储的密钥或带有 `DEEPAGENTS_CODE_` 前缀的变量为 Deep Agents Code 提供了自己的值，同时使无前缀的密钥保持不变，因此两者永远不会混合。

每个提供商的 API 密钥及其端点 (`base_url`) 解析为来自同一源的一对。参见[Endpoints, keys, and gateways](/oss/deepagents/code/config-file#endpoints-keys-and-gateways)。

## 使用 Tavily 启用网络搜索

内置`web_search`工具使用[Tavily](https://tavily.com)。 Deep Agents Code 在启动时会显示“Web 搜索已禁用”通知，直到您提供密钥为止。您可以将密钥存储在 [⟦T61⟧](#use-%2Fauth-recommended) 凭证管理器中（Tavily 在其中显示为非模型服务），或者设置 `TAVILY_API_KEY` 环境变量。<Tabs>
  <Tab title="Use /auth (recommended)">
    从 [tavily.com](https://tavily.com) 获取密钥（以 `tvly-` 开头；免费套餐足以满足大多数深度代理代码的使用），然后将其存储在凭证管理器中：

    ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    /auth
    ```

    从列表中选择 **Tavily** 并粘贴密钥。您还可以通过选择“**输入 API 密钥**”直接从“Web 搜索已禁用”通知中到达此提示。
  </Tab>

  <Tab title="Set an environment variable">
    <Steps>
      <Step title="Get a key">
        在[tavily.com](https://tavily.com)注册并复制密钥（以`tvly-`开头）。免费套餐足以满足大多数 Deep Agents Code 的使用。
      </Step>

      <Step title="Add it to your environment">
        将密钥添加到 `~/.deepagents/.env`，以便每个会话都会拾取它：

        ```bash title="~/.deepagents/.env" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        TAVILY_API_KEY=tvly-...
        ```

        Shell 导出优先于 `.env` 值（请参阅[Loading order and precedence](/oss/deepagents/code/configuration#loading-order-and-precedence)）。要仅将密钥范围限定为深度代理代码而不影响读取 `TAVILY_API_KEY` 的其他工具，请使用 [⟦T68⟧ prefix](/oss/deepagents/code/configuration#deepagents_code_-prefix): `DEEPAGENTS_CODE_TAVILY_API_KEY=tvly-...`。
      </Step>

      <Step title="Reload or restart">
        在现有会话中，运行 `/reload` 重新读取 `.env` 文件。下次启动时，“Web 搜索已禁用”通知将消失，客服人员可以致电 `web_search`。
      </Step>
    </Steps>
  </Tab>
</Tabs>

## 另请参阅

* [Configuration](/oss/deepagents/code/configuration)
* [Config file](/oss/deepagents/code/config-file)
* [Providers](/oss/deepagents/code/providers)
* [Quickstart](/oss/deepagents/code/quickstart)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/credentials.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>