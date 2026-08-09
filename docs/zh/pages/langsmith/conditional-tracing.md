<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Conditional tracing | https://docs.langchain.com/langsmith/conditional-tracing -->

# 条件追踪

当您全局设置环境变量 `LANGSMITH_TRACING=true` 时，跟踪会自动发送到 LangSmith。本指南向您展示如何有选择地禁用或自定义特定请求的跟踪。

当您需要执行以下操作时，请使用条件跟踪：

* **遵守数据保留政策**：出于合规或隐私原因，某些客户可能要求零数据保留。
* **处理敏感操作**：禁用对涉及 PII、凭据或机密数据的操作的跟踪。
* **实施每租户配置**：将跟踪路由到不同的项目或根据客户应用不同的设置。
* **控制成本**：禁用对低价值请求的跟踪，同时保持对关键操作的可见性。
* **支持功能标志**：仅当特定功能或实验代码路径处于活动状态时才启用跟踪。

<Tip>
  要通过仅记录所有运行的一部分来减少跟踪量，请参阅[Set a sampling rate for traces](/langsmith/sample-traces)。
</Tip>

[⟦T13⟧](https://reference.langchain.com/python/langsmith/run_helpers/tracing_context) 上下文管理器 (Python) 和 [⟦T14⟧](https://reference.langchain.com/javascript/classes/langsmith.run_trees.RunTree.html#tracingenabled) 选项 (TypeScript) 允许您在运行时覆盖全局跟踪设置，而无需重组代码或更改环境变量。<Note>
  以下部分提供了特定于语言的示例，您可以根据您的应用程序逻辑和业务需求进行调整。
</Note>

<Tabs>
  <Tab title="Python" icon="brand-python">
    ## 跟踪上下文如何工作

    当您使用 [⟦T15⟧](https://reference.langchain.com/python/langsmith/run_helpers/tracing_context) 上下文管理器时，它会覆盖在其范围内执行的代码的全局跟踪配置。这意味着您可以全局启用自动跟踪，同时有选择地控制特定函数调用的跟踪行为。

    控制优先级分为三个级别：

    1. **`tracing_context(enabled=...)`**：最高优先级（用于范围跟踪控制的上下文管理器）。
    2. **`ls.configure(enabled=...)`**：全局配置（设置全局跟踪行为）。
    3. **环境变量**：最低优先级（`LANGSMITH_TRACING`）。

    ## 禁用特定调用的跟踪

    要禁用对特定操作的跟踪，请将其包装在带有 `enabled=False` 的 `tracing_context` 中：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import langsmith as ls
    from langsmith import traceable

    # LANGSMITH_TRACING=true is set globally

    @traceable
    def my_function(input_text: str):
        return process(input_text)

    # Default invocation - is traced
    result = my_function("regular data")

    # Disable tracing for sensitive data
    with ls.tracing_context(enabled=False):
        result = my_function("sensitive data")  # not traced
    ```

    此模式对于您知道不应记录特定数据的一次性情况很有用。

    ## 启用基于业务逻辑的条件跟踪

    您可以根据运行时条件（例如客户端设置或请求属性）动态启用或禁用跟踪。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import langsmith as ls
    from langsmith import traceable

    @traceable
    def my_function(input_text: str):
        return process(input_text)

    def client_requires_zero_retention(client_id: str) -> bool:
        """
        Check if a client has a zero-retention policy.

        In production, this would query a database, configuration service,
        or feature flag system. Consider caching results for performance.
        """
        # Example: Query from database or config
        zero_retention_clients = get_zero_retention_clients()  # Your implementation
        return client_id in zero_retention_clients

    def handle_request(client_id: str, user_input: str):
        """
        Process a request with conditional tracing based on client requirements.
        """
        should_disable = client_requires_zero_retention(client_id)

        with ls.tracing_context(enabled=not should_disable):
            return my_function(user_input)

    # Example usage
    handle_request("client-a", "some input")  # Traced or not based on client settings
    ```## 根据请求自定义跟踪配置

    您还可以动态自定义跟踪设置，例如将跟踪路由到不同的项目或添加特定于请求的元数据。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import langsmith as ls
    from langsmith import traceable

    @traceable
    def my_function(input_text: str):
        return process(input_text)

    def handle_request(client_id: str, user_input: str, region: str):
        """
        Route traces to client-specific projects with custom metadata.
        """
        client_tier = get_client_tier(client_id)  # e.g., "enterprise", "standard"

        with ls.tracing_context(
            enabled=True,
            project_name=f"client-{client_id}",
            tags=["production", f"tier-{client_tier}", f"region-{region}"],
            metadata={
                "client_id": client_id,
                "region": region,
                "tier": client_tier
            }
        ):
            return my_function(user_input)

    # Traces go to "client-abc" project with custom tags and metadata
    handle_request("abc", "some input", "us-west")
    ```

    该模式适用于：

    * **多租户应用程序**：在单独的项目中隔离客户的跟踪
    * **区域部署**：按地理区域跟踪性能和行为
    * **功能分支**：将实验功能跟踪路由到专用项目
    * **用户细分**：按用户层、群组或 A/B 测试组分析行为

    ## 使用自动跟踪

    [⟦T21⟧](https://reference.langchain.com/python/langsmith/run_helpers/tracing_context) 上下文管理器支持自动跟踪。您可以保持 `LANGSMITH_TRACING=true` 全局设置，并使用 `tracing_context` 覆盖特定请求的设置：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import os
    import langsmith as ls

    # Global environment variable set
    os.environ["LANGSMITH_TRACING"] = "true"

    @ls.traceable
    def process_data(data: str):
        return data.upper()

    # Automatically traced (respects LANGSMITH_TRACING)
    process_data("hello")

    # Override global setting - disable for this call
    with ls.tracing_context(enabled=False):
        process_data("sensitive")  # not traced

    # Override global setting - enable with custom config
    with ls.tracing_context(
        enabled=True,
        project_name="special-project"
    ):
        process_data("important")  # Traced to "special-project"
    ```

    ## 嵌套跟踪上下文

    当您嵌套 `tracing_context` 块时，最里面的上下文优先。

    ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import langsmith as ls

    @ls.traceable
    def inner_function(data: str):
        return data

    @ls.traceable
    def outer_function(data: str):
        # This call respects the inner context
        return inner_function(data)

    # Outer context disables tracing
    with ls.tracing_context(enabled=False):
        # But inner context re-enables it
        with ls.tracing_context(enabled=True):
            outer_function("data")  # is traced
    ```

    当您想要暂时启用跟踪以在通常非跟踪的部分中进行调试时，这会很有用。

    ## 有条件地编辑输入和输出有时您希望记录跟踪，以便保留运行时间、结构、错误和元数据，但应针对特定请求隐藏输入和输出（例如，来自具有严格隐私要求的租户的跟踪）。这与 [disabling tracing](#disable-tracing-for-specific-invocations) 和 [⟦T25⟧](/langsmith/mask-inputs-outputs#hide-inputs-and-outputs) 完全不同，后者对客户端发送的每个跟踪应用相同的修订。

    要编辑每个请求，请将 [⟦T26⟧](https://reference.langchain.com/python/langsmith/run_helpers/tracing_context) 与 `replicas` 参数结合使用，并传递一个 `updates` 字典，该字典将覆盖记录运行中的 `inputs` 和 `outputs`。由于 `tracing_context` 的作用域为当前执行上下文，因此具有不同编辑策略的并发请求不会竞争。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import langsmith as ls
    from langsmith import traceable

    @traceable
    def my_agent(user_input: str) -> str:
        return process(user_input)

    def should_redact(tenant_id: str) -> bool:
        """Return True if traces for this tenant should have inputs/outputs masked."""
        return tenant_id in get_redacted_tenants()

    def handle_request(tenant_id: str, user_input: str) -> str:
        replica: dict = {"project_name": "my-project"}
        if should_redact(tenant_id):
            # Recorded run will have empty inputs/outputs but full structure,
            # timing, metadata, and any errors.
            replica["updates"] = {"inputs": {}, "outputs": {}}

        with ls.tracing_context(replicas=[replica]):
            return my_agent(user_input)
    ```

    您可以使用 `updates` 中运行字段的任何子集（例如，`{"inputs": {"redacted": True}}` 来保留标记，或 `{"outputs": {}}` 仅编辑输出）。相同的模式适用于将不同的编辑策略路由到不同的目的地——每个副本都可以指定自己的`project_name`、`api_key`和`updates`。有关完整副本参考，请参阅[Write traces to multiple destinations with replicas](/langsmith/log-traces-to-project#write-traces-to-multiple-destinations-with-replicas)。

    <Note>
      使用 `updates` 编辑输入或输出时，请始终在副本上设置 `project_name`。如果副本的 `project_name` 与活动会话的项目匹配，则可能会删除 `updates` 并发送未编辑的输入/输出。
    </Note>## 在已部署的代理中自定义跟踪

    LangSmith 部署的 [Agent Server](/langsmith/agent-server) 中默认启用跟踪。当使用[factory function](/langsmith/graph-rebuild)时，您可以用`tracing_context`包装生成的图来控制每次执行的跟踪。这对于添加自定义元数据、完全禁用跟踪或基于经过身份验证的用户自定义跟踪非常有用。

    ### 禁用图表跟踪

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import contextlib
    import langsmith as ls
    from langgraph_sdk.runtime import ServerRuntime


    @contextlib.asynccontextmanager
    async def make_graph(runtime: ServerRuntime):
        graph = build_my_graph()

        # You can use tracing_context to dynamically enable/disable tracing,
        # set metadata or tags, override the tracing project, etc.
        with ls.tracing_context(enabled=False, metadata={"foo": "bar"}):
            yield graph
    ```

    ### 每用户跟踪

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import contextlib
    import langsmith as ls
    from langgraph_sdk.runtime import ServerRuntime

    def get_project_for_user(user_id: str) -> str | None:
        ...
        return "my-project"

    graph = build_my_graph()

    @contextlib.asynccontextmanager
    async def make_graph(runtime: ServerRuntime):
        user = runtime.user
        # Route traces to a different project depending on user or disable tracing entirely
        project_name = get_project_for_user(user.identity)

        if project_name is None:
            with ls.tracing_context(enabled=False):
                yield graph
        else:
            with ls.tracing_context(
                enabled=True,
                project_name=project_name,
                metadata={"user_id": user.identity, "foo": "bar"},
            ):
                yield graph
    ```

    ## 可重复使用的跟踪包装器

    创建一个装饰器来自动应用条件跟踪逻辑。

    ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import functools
    import langsmith as ls
    from langsmith import traceable

    def conditional_trace(check_function):
        """
        Decorator that conditionally traces based on a check function.

        Args:
            check_function: Function that returns True if tracing should be enabled
        """
        def decorator(func):
            traced_func = traceable(func)

            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                should_trace = check_function(*args, **kwargs)
                with ls.tracing_context(enabled=should_trace):
                    return traced_func(*args, **kwargs)
            return wrapper
        return decorator

    # Usage
    def should_trace_client(client_id: str, *args, **kwargs) -> bool:
        return not client_requires_zero_retention(client_id)

    @conditional_trace(should_trace_client)
    def process_request(client_id: str, data: str):
        return data.upper()

    # Automatically applies conditional tracing based on client_id
    process_request("client-a", "some data")
    ```
  </Tab>

  <Tab title="TypeScript" icon="brand-typescript">
    ## 启用跟踪的工作原理

    在 TypeScript 中，您可以在调用 [⟦T44⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable) 时使用 [⟦T43⟧](https://reference.langchain.com/javascript/classes/langsmith.run_trees.RunTree.html#tracingenabled) 参数控制每个函数的跟踪。这允许您在功能级别有选择地启用或禁用跟踪。

    每个功能都控制跟踪的两级系统：

    1. **`tracingEnabled`参数**：最高优先级（传递给[⟦T46⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable)配置）。
    2. **环境变量**：最低优先级（`LANGSMITH_TRACING`）。

    ## 禁用特定调用的跟踪

    要禁用特定操作的跟踪，请使用 `tracingEnabled: false` 创建可跟踪函数的版本：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { traceable } from "langsmith/traceable";

    const myFunction = traceable(
        (inputText: string) => {
            return process(inputText);
        },
        { name: "my_function" }
    );

    // Default invocation - is traced
    await myFunction("regular data");

    // Disable tracing for sensitive data
    const myFunctionNoTrace = traceable(
        (inputText: string) => {
            return process(inputText);
        },
        { name: "my_function", tracingEnabled: false }
    );

    await myFunctionNoTrace("sensitive data");  // not traced
    ```此模式对于您知道不应记录特定数据的一次性情况很有用。

    ## 启用基于业务逻辑的条件跟踪

    在许多应用程序中，您需要根据运行时条件（例如客户端隐私要求、法规遵从性或功能标志）动态控制跟踪。

    在 TypeScript 中，最有效的方法是预先创建函数的跟踪和非跟踪变体，然后根据业务逻辑在运行时在它们之间进行选择。这避免了在每个请求上创建新的跟踪包装器的性能开销，同时仍然提供对跟踪发生时间的细粒度控制。例如：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { traceable } from "langsmith/traceable";

    // Define the core logic once
    function processText(inputText: string): string {
        // Your actual processing logic
        return inputText.toUpperCase();
    }

    // Create traced and non-traced variants upfront
    const myFunction = traceable(processText, { name: "my_function" });
    const myFunctionNoTrace = traceable(processText, {
        name: "my_function",
        tracingEnabled: false
    });

    function clientRequiresZeroRetention(clientId: string): boolean {
        /**
         * Check if a client has a zero-retention policy.
         *
         * In production, this would query a database, configuration service,
         * or feature flag system. Consider caching results for performance.
         */
        const zeroRetentionClients = getZeroRetentionClients();  // Your implementation
        return zeroRetentionClients.includes(clientId);
    }

    async function handleRequest(clientId: string, userInput: string) {
        /**
         * Process a request with conditional tracing based on client requirements.
         * Efficiently selects pre-created traced or non-traced variant.
         */
        const shouldDisable = clientRequiresZeroRetention(clientId);

        // Select the appropriate pre-created variant
        const fn = shouldDisable ? myFunctionNoTrace : myFunction;
        return await fn(userInput);
    }

    // Example usage
    await handleRequest("client-a", "some input");  // Traced or not based on client settings
    ```

    ## 使用自动跟踪

    [⟦T49⟧](https://reference.langchain.com/javascript/classes/langsmith.run_trees.RunTree.html#tracingenabled) 选项可与自动跟踪无缝配合。您可以保持 `LANGSMITH_TRACING=true` 全局设置，并使用 `tracingEnabled` 覆盖特定功能的设置。

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { traceable } from "langsmith/traceable";

    // Global tracing enabled via environment
    process.env.LANGSMITH_TRACING = "true";

    const processData = traceable(
        (data: string) => {
            return data.toUpperCase();
        },
        { name: "process_data" }
    );

    // Automatically traced (respects LANGSMITH_TRACING)
    await processData("hello");

    // Override global setting - disable for this call
    const processDataNoTrace = traceable(
        (data: string) => {
            return data.toUpperCase();
        },
        { name: "process_data", tracingEnabled: false }
    );

    await processDataNoTrace("sensitive");  // not traced

    // Override global setting - enable with custom config
    const processDataCustom = traceable(
        (data: string) => {
            return data.toUpperCase();
        },
        {
            name: "process_data",
            project_name: "special-project",
            tracingEnabled: true
        }
    );

    await processDataCustom("important");  // Traced to "special-project"
    ```
  </Tab>
</Tabs>

## 与抽样比较

条件跟踪和[sampling](/langsmith/sample-traces)有不同的用途：|特色 |条件追踪 |取样|
| ------------------ | ------------------------------------------------- | -------------------------------------------------------- |
| **控制** |确定性（显式启用/禁用）|概率（随机抽样）|
| **用例** |业务逻辑、合规性、每个请求的决策 |成本优化、大批量可观测性 |
| **可预测性** |针对特定请求的保证行为 |流量的统计表示 |
| **配置** |运行时代码逻辑 |环境变量或客户端配置 |

您可以结合使用这两种方法来进行细粒度控制。

## 相关

* [Trace without environment variables](/langsmith/trace-without-env-vars)：以编程方式配置跟踪，而不是使用环境变量。
* [Set a sampling rate for traces](/langsmith/sample-traces)：概率采样痕迹以减少体积
* [Mask inputs and outputs](/langsmith/mask-inputs-outputs)：隐藏跟踪中的敏感数据，而不是完全禁用跟踪。
* [Add metadata and tags to traces](/langsmith/add-metadata-tags)：使用自定义属性对跟踪进行分类和过滤。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/conditional-tracing.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>