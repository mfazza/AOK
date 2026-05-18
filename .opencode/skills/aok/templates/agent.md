---
description: {AGENT_DESCRIPTION}
mode: {MODE}
model: {MODEL}
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

```
{OUTPUT_TEMPLATE}
```
</output_format>

<guardrails>
- {GUARDRAIL_1}
- {GUARDRAIL_2}
- {GUARDRAIL_3}
</guardrails>
