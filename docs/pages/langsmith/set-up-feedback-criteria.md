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

In the [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-set-up-feedback-criteria), feedback criteria are called feedback tags. For human feedback, you can set up new feedback criteria as continuous, categorical, or freeform feedback.

> [!NOTE]
>
> You can also manage feedback tags programmatically with the SDK. Refer to [Manage feedback & annotation queues programmatically](/langsmith/annotation-queues-sdk).

An enforced feedback tag sets the rules for its key across the workspace, so the feedback forms in [annotation queues](/langsmith/annotation-queues) and on [traces](/langsmith/annotate-traces-inline) follow it. Creating, editing, and deleting enforced feedback tags requires the `feedback-configs:manage-enforced` permission. The built-in [Workspace Admin](/langsmith/rbac#workspace-admin) role includes it. To give a [custom role](/langsmith/rbac#custom-roles) this access, grant it the permission.

To set up new feedback criteria, go to **Settings** > **Workspace** > **Enforced Feedback Tags**, then click **+ Enforced feedback tag**. Changes to enforced feedback tags take a few minutes to apply.

## Continuous feedback

For continuous feedback, you can enter a feedback tag name, then select a minimum and maximum value. Every value, including floating-point numbers, within this range will be accepted as feedback scores.

![Enforced feedback tag form with the Continuous type selected, showing the Feedback Tag name and the Minimum and Maximum fields.](https://mintcdn.com/langchain-5e9cc07a/KvWGY4QGu9qRYJib/langsmith/images/feedback-continuous-light.png?fit=max\&auto=format\&n=KvWGY4QGu9qRYJib\&q=85\&s=d82d2ee5451f9b5949bef8a87917a3bf)

## Categorical feedback

For categorical feedback, you can enter a feedback tag name, then add a list of categories, each category mapping to a score. When you provide feedback, you can select one of these categories as the feedback score.
Both the category label and the score will be logged as feedback in `value` and `score` fields, respectively.

![Enforced feedback tag form with the Categorical type selected, showing the Allow multiple selections switch and a Categories list of labels and scores.](https://mintcdn.com/langchain-5e9cc07a/KvWGY4QGu9qRYJib/langsmith/images/feedback-categorical-light.png?fit=max\&auto=format\&n=KvWGY4QGu9qRYJib\&q=85\&s=97d7edde510f53832ba78caf331aebed)

### Allow multiple selections

By default, reviewers pick exactly one category. To let reviewers pick several categories for the same item, such as every topic a conversation covers, turn on **Allow multiple selections** when you create or edit a categorical tag. Tags with this setting show a **Multi-select** badge in the tags list.

LangSmith saves each pick as its own feedback entry under the tag's key. Clearing a pick deletes its entry. In an [annotation queue](/langsmith/annotation-queues), a required multi-select item needs at least one pick.

A [composite evaluator](/langsmith/composite-evaluators-ui) cannot include a multi-select tag, because a run can have several scores under that tag's key.

When you download an annotation queue's completed runs to CSV, each multi-select tag keeps one column. Each run's cell lists the distinct picks in the order reviewers made them, separated by semicolons. A pick that several reviewers made appears once. If you select **Include reviewer detail (name, comment per row)**, the cell lists each reviewer's feedback instead.

Tags with more than 10 categories show a search box in the review pane instead of a list of options, for both single-select and multi-select tags.

## Freeform feedback

For freeform feedback, enter a feedback tag name and select **Freeform** as the type. Reviewers enter text instead of a score or category. In an [annotation queue](/langsmith/annotation-queues), a freeform rubric item can also set a **Regex validator** that each entry must match before it saves. Use freeform tags for qualitative observations or explanations.

![Enforced feedback tag form with the Freeform type selected, showing only the Feedback Tag name and Type fields.](https://mintcdn.com/langchain-5e9cc07a/KvWGY4QGu9qRYJib/langsmith/images/feedback-freeform-light.png?fit=max\&auto=format\&n=KvWGY4QGu9qRYJib\&q=85\&s=e2cbba52bb46c50af581c72a3e7eea93)

## See also

* [Use assertions](/langsmith/assertions): Review free-form acceptance criteria that [LangSmith Engine](/langsmith/engine) proposes for a recurring issue.
* [Use annotation queues](/langsmith/annotation-queues): Use feedback tags in a review rubric.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/set-up-feedback-criteria.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).