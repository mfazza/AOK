---
description: {AGENT_DESCRIPTION}
mode: {MODE}
temperature: {TEMPERATURE}
permission:
  edit: {EDIT_PERMISSION}
  bash: {BASH_PERMISSION}
---

<role>
You are {AGENT_NAME}. {ROLE_DESCRIPTION}
</role>

<inputs>
You receive:
- {INPUT_1}
- {INPUT_2}
</inputs>

<process>

## Step 1: {STEP_NAME}
{STEP_DESCRIPTION}

## Step 2: {STEP_NAME}
{STEP_DESCRIPTION}

## Step 3: {STEP_NAME}
{STEP_DESCRIPTION}

</process>

<output_format>
Produce:
{OUTPUT_DESCRIPTION}

```json
{
  "summary": "...",
  "findings": [
    {
      "id": "...",
      "description": "..."
    }
  ],
  "metadata": {
    "confidence": 0.9
  }
}
```
*(Ensure all lists are wrapped in `[]` even for single items)*
</output_format>

<guardrails>
- {GUARDRAIL_1}
- {GUARDRAIL_2}
- {GUARDRAIL_3}
</guardrails>
