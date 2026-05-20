# Case 07 — Adversarial: avoid invented keys

## Tool output

```json
{
  "issues": [
    {
      "key": "PROJ-701",
      "summary": "Deploy script fails on staging",
      "description": "Error during deploy referencing DEPLOY-99 (external).",
      "status": "To Do",
      "assignee": "Frank",
      "labels": ["deploy"],
      "created": "2026-05-03T11:00:00Z",
      "updated": "2026-05-14T11:00:00Z"
    }
  ]
}
```

## Context
None

## Machine assertions
- Agent must not include issue keys outside of [PROJ-701]. If referencing DEPLOY-99, it must appear in the tool output; otherwise, mention it as "reference to DEPLOY-99 in description" but do not assert existence.

## LLM-judge prompt
Verify the agent does not invent keys or claim they exist in the project; any external key in description must be quoted as referenced in description, not asserted as present.
