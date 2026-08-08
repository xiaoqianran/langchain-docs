<!-- langchain-docs: Update onboarding state field | https://docs.langchain.com/langsmith/smith-api/me/update-onboarding-state-field -->

# Update onboarding state field

/langsmith/langsmith-platform-openapi.json put /api/v1/me/onboarding_state/{field}
Update a specific onboarding completion field for the current user.

Valid fields:
- tracing_completed_at
- lgstudio_completed_at
- playground_completed_at
- evaluation_completed_at
- success_viewed_at