<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Browser use | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-browser-use -->

# 浏览器使用

为托管深度代理配置浏览器共享、网站登录和人工切换。

为托管深度代理提供一个浏览器，以便在没有公共 API 的情况下在网站上执行操作，例如预订餐厅、通过跟踪跨网站的链接来研究主题，或者在更改代码后通过其 UI 测试应用程序。代理可以导航、单击、填写表格并检查结果。托管 Deep Agents 管理浏览器及其工具。

当支持任务时使用直接 API。请参阅 [Connections](/langsmith/javascript/managed-deep-agents-connections) 以使用用户连接的帐户验证 API 调用。有关浏览器选择和开源设置，请参阅[Browser use with Deep Agents](/oss/javascript/deepagents/browser-use)。

> [!注意]
>
> Managed Deep Agents SDK 0.10 中添加了浏览器支持。您的工作区还需要访问 LangSmith 浏览器测试版。要确认您的工作区是否有权访问或请求访问，请联系 [LangChain support](https://support.langchain.com) 并提供您的工作区 ID。

## 声明一个浏览器

在 [project root](/langsmith/javascript/managed-deep-agents-project-structure) 导出名为 `browser`：

```ts browser.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineBrowser } from "managed-deepagents";

export const browser = defineBrowser({
  scope: "thread",
  idleTtlSeconds: 600,
});
```

CLI 发现此根文件。不要将声明放在 `browser/` 或 `sandbox/` 内：这些位置不启用浏览器支持。

|选项 |默认|描述 |
| - | - | - |
| `scope` | `"thread"` |在一个线程内或跨登录用户的线程共享浏览器 |\| `idleTtlSeconds` | `600` |浏览器停止前不活动的秒数；接受从 `60` 到 `86400` 的整数 |

## 选择范围

|范围 |浏览器状态 |用它来 |
| - | - | - |
| `"thread"`（默认）|每个对话使用一个浏览器；授权参与者轮流共享 |在一次对话中测试跨多个回合的 Web 应用程序更改 |
| `"user"` |每个经过身份验证的人一个浏览器，每个线程都有一个单独的窗口并共享 cookie 和登录名 |在对话中重复使用网站登录 |

线程范围开始每个新对话，无需另一个线程的 cookie 或登录。例如，使用测试帐户登录 Web 应用程序，然后在同一线程中迭代更改时重复使用选项卡和登录。单独的应用程序测试对话会获得隔离的浏览器。启动另一个线程并不会删除之前的浏览器。

对于用户范围，更改声明：

```ts browser.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineBrowser } from "managed-deepagents";

export const browser = defineBrowser({ scope: "user", idleTtlSeconds: 600 });
```例如，在一个对话中登录预订网站，然后在新线程中请求另一次预订。同一用户的新窗口可以重复登录。其他经过身份验证的人会使用不同的浏览器。用户范围遵循[verified caller identity](/langsmith/javascript/managed-deep-agents-identity)，而不是提示中的名称；非人员主体使用线程范围。

共享登录状态不是帐户隔离：注销或切换帐户可能会影响该人的其他线程。在对话中协调购买和预订。完成运行会释放客户端，而不是登录；空闲超时会停止浏览器而不是注销。网站过期或浏览器更换仍然会使保存的状态无效。

## 浏览器工具

定义浏览器时，托管Deep Agents自动包含这些工具：

|工具|它有什么作用 |
| - | - |
| `browser_snapshot` |读取活动页面的辅助功能树并为交互分配元素 ID |
| `browser_run` |通过 JavaScript 或针对快照 ID 的批量操作进行导航和交互 |
| `browser_screenshot` |捕获页面；可选的绝对`path`将图像保存到代理的沙箱 |
| `browser_handoff` |使人员能够控制登录、验证码或两步身份验证的窗口 |导航后或元素 ID 过时时拍摄新快照。浏览不需要代理[sandbox](/langsmith/javascript/managed-deep-agents-sandboxes)；保存屏幕截图文件即可。

## 关闭浏览器

人工切换可让您登录或处理代理无法自行完成的页面。代理调用 `browser_handoff(reason)` 来让您控制其线程的浏览器窗口。

自定义客户端必须呈现切换工件以提供嵌入式浏览器或浏览器链接。

完成登录并返回控制：

1. 要求代理执行网站任务。如果登录、验证码或两步身份验证需要您的输入，代理会请求移交并解释原因。
2. 使用嵌入式浏览器或打开客户提供的浏览器链接。 Studio 显示**代理需要您在浏览器中**卡，其中包含嵌入式浏览器以及在新选项卡中打开它的选项。直接在网站上（而不是在聊天中）输入凭据，并完成任何所需的身份验证步骤。
3. 完成后，单击浏览器窗口中的“**返还**”。
4. 代理会收到您已交回控制权的通知。它检查当前页面以检查登录是否成功，然后继续执行任务。

![Animated demo of an agent handing a travel website to a person for login and continuing after control is returned](https://mintcdn.com/langchain-5e9cc07a/oBWRTKyHBthUkwnX/images/managed-deep-agents-browser-handoff-demo.gif?s=2bd14a5bebbfee3087b53cef765b288c)动画浏览器交接演示：在网站上登录，然后将控制权交还给客服人员。

在 Studio 中，切换卡嵌入浏览器并在您拥有控制权时显示。使用 **Hand back** 将控制权返回给代理：

![Studio chat showing The agent needs you in the browser, an embedded Hacker News page, and the Hand back control](https://mintcdn.com/langchain-5e9cc07a/oBWRTKyHBthUkwnX/images/managed-deep-agents-studio-browser-handoff.png?fit=max\&auto=format\&n=oBWRTKyHBthUkwnX\&q=85\&s=9f4d9ef969bb00ba2a62c12e5ac4dcc5)

Studio 中的浏览器切换，Hacker News 打开且页面上方的 Hand back 控件。

当您控制窗口时，代理的浏览器工具无法对其进行操作。切换立即返回，以便代理可以执行其他工作。链接15分钟后失效；到期结束交接，但并不能证明网站任务已完成。

您交回控制权后，代理会收到继续的通知。如果对话正在等待单独的批准，请先完成该批准。如果代理没有恢复，请向其发送新消息。请求另一次切换会替换之前的链接。

> [!警告]
>
> 保持交接链接的私密性：任何拥有有效链接的人都可以控制浏览器。请勿将密码存储在提示、聊天消息或代理编写的文件中。在切换期间直接登录，并避免暴露页面内容中的秘密以供代理稍后检查。浏览器范围控制会话重用；它不是密码库。## 每次运行选择一个浏览器

在 [graph factory](/langsmith/javascript/managed-deep-agents-agent-definition#select-configuration-per-run) 中显式设置 `browser` 来选择运行的范围和空闲超时：

```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineBrowser, defineDeepAgent, type ManagedServerRuntime } from "managed-deepagents";

export function agent(runtime: ManagedServerRuntime) {
  return defineDeepAgent({
    name: "browsing",
    browser: defineBrowser({ scope: "user", idleTtlSeconds: 900 }),
  });
}
```

即使工厂选择了不同的配置，也要保留根浏览器声明。它启用浏览器支持并安装部署的浏览器依赖项。如果没有该文件，工厂就无法添加浏览器。

要禁用运行的浏览器工具，请在 Python 中传递 `browser=None` 或在 TypeScript 中传递 `browser: null`。传递浏览器定义，而不是中间件实例。静态代理定义改为在声明文件中配置浏览器支持。

## 另请参阅

* [Browser use](/oss/javascript/deepagents/browser-use)
* [Project structure](/langsmith/javascript/managed-deep-agents-project-structure)
* [Sandboxes](/langsmith/javascript/managed-deep-agents-sandboxes)
* [Identity](/langsmith/javascript/managed-deep-agents-identity)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-browser-use.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。