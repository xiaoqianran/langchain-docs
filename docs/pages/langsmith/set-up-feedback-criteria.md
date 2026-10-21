<!-- langchain-docs: Set up feedback criteria | https://docs.langchain.com/langsmith/set-up-feedback-criteria -->

# Set up feedback criteria

> [!TIP]
>
> **Recommended Reading**
>
> Before diving into this content, it might be helpful to read the following:
>
> * [Conceptual guide on tracing and feedback](/langsmith/observability-concepts)
> * [Reference guide on feedback data format](/langsmith/feedback-data-format)

Feedback criteria are represented in the application as feedback tags. For human feedback, you can set up new feedback criteria as continuous feedback or categorical feedback.

> [!NOTE]
>
> You can also manage feedback configs programmatically with the SDK. Refer to [Manage feedback & annotation queues programmatically](/langsmith/annotation-queues-sdk).

> [!TIP]
>
> For free-form acceptance criteria a reviewer writes per-run (rather than a fixed set of rubric scores), refer to [Use assertions](/langsmith/assertions).

To set up a new feedback criteria, follow [this link](https://smith.langchain.com/settings/workspaces/feedbacks) to view all existing tags for your workspace, then click **New Tag**.

## Continuous feedback

For continuous feedback, you can enter a feedback tag name, then select a minimum and maximum value. Every value, including floating-point numbers, within this range will be accepted as feedback scores.

![Cont feedback](https://mintcdn.com/langchain-5e9cc07a/aKRoUGXX6ygp4DlC/langsmith/images/cont-feedback.png?fit=max\&auto=format\&n=aKRoUGXX6ygp4DlC\&q=85\&s=44798176648f0a65e873fddecc90d43d)

## Categorical feedback

For categorical feedback, you can enter a feedback tag name, then add a list of categories, each category mapping to a score. When you provide feedback, you can select one of these categories as the feedback score.
Both the category label and the score will be logged as feedback in `value` and `score` fields, respectively.

![Cat feedback](https://mintcdn.com/langchain-5e9cc07a/E8FdemkcQxROovD9/langsmith/images/cat-feedback.png?fit=max\&auto=format\&n=E8FdemkcQxROovD9\&q=85\&s=6ec5030c3ba55b1fb12d60bca91719f7)

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/set-up-feedback-criteria.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).