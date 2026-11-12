<!-- langchain-docs: Revisions | https://docs.langchain.com/langsmith/deployment-revisions -->

# Revisions

Create and manage revisions for an Agent Server on LangSmith Cloud.

A revision deploys a version of your application to an existing Agent Server on LangSmith Cloud. Create a revision to release code changes without creating another Agent Server.

## Create a revision

When you [create an Agent Server](/langsmith/deploy-to-cloud), LangSmith creates its first revision. Use the LangSmith UI or LangGraph CLI to create subsequent revisions.

> [tab] LangSmith UI
>
> From the [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deployment-revisions), select **Agent Servers**, then select an Agent Server.
>
> 1. In the top-right corner of the **Agent Server** view, select **+ New Revision**.
> 2. In the **New Revision** modal, specify the full path to the [API configuration file](/langsmith/cli#configuration-file), including the file name. For example, enter `langgraph.json` if the file is in the repository root.
> 3. Choose whether to make the Agent Server shareable through [Studio](/langsmith/studio).
> 4. Add, remove, or update environment variables and secrets. Existing values are prepopulated. For more information, see [Environment variables](/langsmith/env-var-cloud).
> 5. Select **Submit**. LangSmith queues the revision for deployment.

> [tab] LangGraph CLI
>
> Run `langgraph deploy` again from your project directory. The command finds the existing Agent Server by name and creates a revision with your latest code changes:
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langgraph deploy
> ```
>
> To target an Agent Server by ID, run:
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langgraph deploy --agent-server-id <AGENT_SERVER_ID>
> ```
>
> To view Agent Server IDs, run:
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langgraph deploy list
> ```
>
> > [!NOTE]
> >
> > CLI update support depends on the Agent Server's source and build mode, not only where it was created. Local builds pushed to the managed registry require an `internal_docker` source. For Agent Servers that use a registry you manage, use `--push-to` or `--image-uri`. See the [CLI reference](/langsmith/cli#deploy).

## Interrupt a revision

Interrupt a revision only when it is stuck and prevents you from deploying another revision.

> [!WARNING]
>
> Interrupted revisions have undefined behavior. LangChain might remove this feature in the future.

To interrupt a revision:

1. From the **Agent Servers** view, select an Agent Server.
2. In the **Revisions** table, select the menu icon for the revision.
3. Select **Interrupt**.
4. Review the confirmation message, then select **Interrupt revision**.

## See also

* [Monitor an Agent Server](/langsmith/monitor-deployment)
* [Manage an Agent Server](/langsmith/manage-deployment)

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deployment-revisions.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).