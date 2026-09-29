<!-- langchain-docs: translation failed; English fallback -->

<!-- langchain-docs: Download a sandbox file | https://docs.langchain.com/langsmith/smith-api/sandboxes/download-a-sandbox-file-1 -->

# Download a sandbox file

/langsmith/langsmith-platform-openapi.json head /api/v2/sandboxes/{sandbox_id}/download
Download file contents from a sandbox filesystem path. Supports HTTP range requests: send a Range header (for example `bytes=0-1023`) to receive a 206 with only that byte range. Every response carries an ETag; send it back as If-Range to resume safely (a changed file returns 200 with the whole file instead of mismatched bytes) or as If-None-Match to get a 304 when the file is unchanged. HEAD returns the same headers, including the file's size in Content-Length, without the body.