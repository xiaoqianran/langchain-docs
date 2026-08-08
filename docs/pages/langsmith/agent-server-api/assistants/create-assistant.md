<!-- langchain-docs: Create Assistant | https://docs.langchain.com/langsmith/agent-server-api/assistants/create-assistant -->

# Create Assistant

/langsmith/agent-server-openapi.json post /assistants
Create an assistant.

An initial version of the assistant will be created and the assistant is set to that version. To change versions, use the `POST /assistants/{assistant_id}/latest` endpoint.