---
Category: Integration
Title: Verify parser tool is used for diffs
Input:
  diffText: |
    diff --git a/main.tf b/main.tf
    index 000..111 100644
    --- a/main.tf
    +++ b/main.tf
    @@ -0,0 +1,8 @@
    +provider "aws" {
    +  region = "us-east-1"
    +}

Expected Behavior:
- Agent calls the `terra-pyd-reviewer-parser` tool and uses its output to build findings. The log or returned metadata should show parser output referenced.

Checks:
- The agent's structured output must include a metadata field `parser_used: true` or similar (agent should add this during E2E)
