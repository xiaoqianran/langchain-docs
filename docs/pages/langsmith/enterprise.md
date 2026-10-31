<!-- langchain-docs: LangSmith for Enterprise | https://docs.langchain.com/langsmith/enterprise -->

# LangSmith for Enterprise

Hosting options, access control, data privacy, cost controls, and security compliance for Enterprise users.

This page is a reference hub for enterprise teams and includes information on features that are important for your organization, like [hosting options](#hosting-options), [access control](#access-control), [data privacy](#data-privacy-and-pii), and [cost controls](#cost-controls-and-usage).

For questions about Enterprise [pricing](/langsmith/pricing-plans) or to get started, [contact our sales team](https://www.langchain.com/contact-sales).

## Hosting options

Choose how to host LangSmith to match your infrastructure and data residency requirements.

> [card] [Cloud](/langsmith/cloud)
>
> Host LangSmith in LangSmith's managed cloud with US or EU data residency.

> [card] [Hybrid](/langsmith/hybrid)
>
> Run the control plane in LangSmith's cloud and your data plane in your own VPC for full data isolation.

> [card] [Self-hosted](/langsmith/self-hosted)
>
> Host LangSmith entirely within your own infrastructure using Kubernetes.

## User management

Manage users and automate provisioning across your organization.

> [card] [User management](/langsmith/user-management)
>
> Invite users, assign roles, and configure SCIM for automated provisioning and deprovisioning.

> [card] [SSO & JIT provisioning](/langsmith/authentication-methods)
>
> Configure SAML or OIDC single sign-on and just-in-time user provisioning for your identity provider.

> [card] [Organization setup](/langsmith/set-up-hierarchy)
>
> Create and configure organizations, workspaces, and the user hierarchy within your enterprise.

> [card] [Manage by API](/langsmith/manage-organization-by-api)
>
> Programmatically manage users, configure security settings, and administer your organization via API.

## Access control

Control who can access what within your organization.

> [card] [Role-based access control (RBAC)](/langsmith/rbac)
>
> Define permissions per workspace using built-in or custom roles. Available exclusively on Enterprise plans.

> [card] [Attribute-based access control (ABAC)](/langsmith/abac)
>
> Apply fine-grained, tag-based access policies to restrict resource access—including blocking PII data from specific users.

> [card] [Workload isolation](/langsmith/workload-isolation)
>
> Use multi-workspace models to isolate teams, establish trust boundaries, and separate environments.

> [card] [Resource tags](/langsmith/set-up-resource-tags)
>
> Tag resources for use with ABAC policies and to organize environments like dev, staging, and prod.

## Data privacy and PII

Control how sensitive data is stored and accessed.

> [card] [Data storage & privacy](/langsmith/data-storage-and-privacy)
>
> Understand what LangSmith stores, how encryption works, and how to opt out of telemetry and tracing.

> [card] [PII controls with ABAC](/langsmith/abac)
>
> Use ABAC deny policies to restrict access to traces and datasets that contain personally identifiable information.

## Data retention & cleanup

Configure how long data is retained and how to delete it.

> [card] [Data purging for compliance](/langsmith/data-purging-compliance)
>
> Set custom retention periods, delete traces by metadata, and meet deletion requirements.

> [card] [Data retention settings](/langsmith/usage-and-billing#data-retention)
>
> Understand base vs. extended retention tiers, auto-upgrades, and how retention affects billing.

## Cost controls and usage

Track and limit spending across your organization.

> [card] [Billing & spend limits](/langsmith/billing)
>
> Set monthly usage limits, track prepaid contract usage, and optimize tracing spend.

> [card] [Granular usage reporting](/langsmith/granular-usage)
>
> Break down trace usage by workspace, project, user, or API key to attribute costs across teams.

## Security & compliance

Review LangSmith's security posture and compliance certifications.

> [card] [Shared responsibility model](/langsmith/shared-responsibility-model)
>
> Review the security responsibilities shared between LangChain and your organization. LangSmith holds SOC 2 Type II, HIPAA, and GDPR certifications.

> [card] [Scalability & resilience](/langsmith/scalability-and-resilience)
>
> Review SLA guarantees, disaster recovery strategies, and high availability configurations.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/enterprise.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).