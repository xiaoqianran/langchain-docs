<!-- langchain-docs: AWS marketplace fulfillment URL registration | https://docs.langchain.com/langsmith/smith-api/aws_marketplace/aws-marketplace-fulfillment-url-registration -->

# AWS marketplace fulfillment URL registration

/langsmith/langsmith-platform-openapi.json post /aws-marketplace/register
Receives the x-amzn-marketplace-token posted by AWS Marketplace when a customer clicks "Set Up Account", resolves the customer identity, stores it in the DB, and redirects to the thank-you page.