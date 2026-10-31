<!-- langchain-docs: LangSmith Sandboxes | https://docs.langchain.com/langsmith/sandboxes -->

# LangSmith Sandboxes

Use LangSmith managed sandboxes to safely execute code and interact with the filesystem in isolated environments.

Sandboxes are isolated environments that allow agents to safely execute potentially risky operations, like running arbitrary code or interacting with the filesystem, without affecting your main infrastructure.

From the [LangSmith homepage](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-sandboxes), select **Sandboxes** to manage all your sandbox resources.

![Sandboxes overview page](https://mintcdn.com/langchain-5e9cc07a/5nd3ca6haxRbnJZj/images/langsmith/sandboxes/sb-overview.png?fit=max\&auto=format\&n=5nd3ca6haxRbnJZj\&q=85\&s=6c2848ea69c0a99cbdd0930ceb91daa5)

## Environment availability

| Environment | Status |
| - | - |
| GCP US (`smith.langchain.com`) | Generally available |
| GCP EU (`eu.smith.langchain.com`) | Generally available |
| GCP APAC (`apac.smith.langchain.com`) | Generally available |
| AWS US (`aws.smith.langchain.com`) | Generally available |
| [BYOC](/langsmith/byoc) (your data plane URL) | Generally available |

> [!WARNING]
>
> On BYOC, use an API key that belongs to a BYOC workspace.

For self-hosted LangSmith deployments, see [Enable Sandboxes on self-hosted deployments](/langsmith/enable-self-hosted-sandboxes). For the infrastructure model, scaling, and upgrades, see [Self-hosted Sandbox architecture](/langsmith/self-host-sandbox-architecture).

## Network access

Restricted egress applies to non-Enterprise organizations by default and to organizations that request it. Organizations with an approved exemption can use unrestricted egress. Restricted sandboxes use a managed allowlist for common package registries, source repositories, and model APIs. LangSmith blocks destinations outside the allowlist, even if you add them to a sandbox's proxy configuration.

If you need unrestricted egress, [file a support ticket](https://support.langchain.com) with your organization or workspace ID, region, required destinations and ports, and use case. For more information, see [restricted egress and access requests](/langsmith/sandbox-auth-proxy#organization-level-restricted-egress).

## Get started

### 1. Install the SDK

```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# uv
uv add langsmith

# pip
pip install langsmith
```

```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install langsmith
```

### 2. Set your API key

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="<your-api-key>"
```

### 3. Create and run a sandbox

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.sandbox import SandboxClient

client = SandboxClient()

with client.sandbox() as sb:
    result = sb.run("python3 -c 'print(2 + 2)'")
    print(result.stdout)  # "4\n"
```

```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { SandboxClient } from "langsmith/sandbox";

const client = new SandboxClient();
const sandbox = await client.createSandbox();
const result = await sandbox.run("node -e 'console.log(2 + 2)'");
console.log(result.stdout); // "4\n"
await sandbox.delete();
```

> [!TIP]
>
> Prefer the command line? The [Sandbox CLI](/langsmith/sandbox-cli) lets you create sandboxes, run commands, and open interactive shells without writing any code.

### 4. Use sandboxes with your agents

To wire sandboxes into agent code, see the Open Source docs:

* **Deep Agents**: [Use `LangSmithSandbox` as a backend](/oss/python/integrations/sandboxes/langsmith), covering installation, backend creation, and cleanup.
* **Sandboxes as agent backends**: [Configure any sandbox as the execution backend](/oss/python/deepagents/sandboxes) to give your agent `execute` and filesystem tools automatically.
* **LangChain / LangGraph integrations**: Use LangSmith sandboxes as a first-party option, or [connect third-party providers](/oss/python/integrations/sandboxes) such as AgentCore, Daytona, E2B, Modal, Runloop, and Vercel.

## Resources

> [card] [Snapshots](/langsmith/sandbox-snapshots)
>
> Build filesystem images from Docker images or capture a running sandbox, then boot sandboxes from them.

> [card] [Service URLs](/langsmith/sandbox-service-urls)
>
> Access HTTP services running inside sandboxes via authenticated URLs.

> [card] [Auth proxy](/langsmith/sandbox-auth-proxy)
>
> Inject credentials into outbound API requests without hardcoding secrets.

> [card] [Mounts](/langsmith/sandbox-mounts)
>
> Attach S3 buckets, GCS buckets, and public Git repositories to a sandbox filesystem.

> [card] [Permissions](/langsmith/sandbox-permissions)
>
> Control which workspace members can interact with a sandbox after it is created.

> [card] [CLI](/langsmith/sandbox-cli)
>
> Build snapshots, manage sandboxes, open consoles, and tunnel TCP ports from the command line.

> [card] [SDK usage](/langsmith/sandbox-sdk)
>
> Create and manage sandboxes programmatically with the Python or TypeScript SDK.

> [card] [Self-hosted setup](/langsmith/enable-self-hosted-sandboxes)
>
> Enable Sandboxes on self-hosted LangSmith deployments with Helm or Terraform.

> [card] [Harbor](/langsmith/harbor-integrations#sandboxes)
>
> Run Harbor evaluations and rollouts on LangSmith sandboxes.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandboxes.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).