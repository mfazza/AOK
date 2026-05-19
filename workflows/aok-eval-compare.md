---
description: Run evals across multiple models — comparison table showing how each model performs
agent: build
---

<purpose>
Run the same eval suite for an agent across multiple LLM models and produce a side-by-side comparison table. This answers the "question": "Which model is best for this agent?" and reveals model-specific weaknesses.

Works with any agent — AOK-created or not.
</purpose>

<required_reading>
Locate and read the AOK reference files before proceeding. Check the following locations (in order):
1. `.opencode/skills/aok/references/` (Project-local install)
2. `~/.config/opencode/skills/aok/references/` (Global install)
3. `./references/` (AOK Dev mode)

Required files for this workflow:
- `eval-taxonomy.md` — Test types and selection
- `eval-driven-development.md` — Scoring methodology
</required_reading>

<user_interaction_rules>
**CRITICAL: You MUST use your native `ask_user` tool-calling capability for ALL user interactions.**
**NEVER output a markdown block with `question([...])`. NEVER output a numbered list of questions as plain text.**

UX Rules:
- ALWAYS use the native `ask_user` tool. Do NOT print JSON to the screen. Call the tool silently without conversational preambles.
- Ask **ONE question at a time** — fully resolve each before moving to the next.
- For multiple choice, use `type: "choice"`. You MUST provide an `options` array. Do NOT add a "Something else" or "Other" option to the array; the tool provides a freeform escape hatch automatically.
- For freeform text input, use `type: "text"`. You MUST NOT provide an `options` array. Do NOT add escape hatches to text questions.
</user_interaction_rules>


<process>

## Step 1: Identify Target Agent

Parse `$ARGUMENTS` for the agent name. If empty, prompt:

**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Target Agent"
- `question`: "Which agent do you want to compare across models?"
- `options`:
  - `label`: "{agent-1}", `description`: "{description}"
  - `label`: "{agent-2}", `description`: "{description}"


## Step 2: Verify Eval Suite Exists

Check for `.opencode/evals/{agent-name}/EVAL-SPEC.md`.

If none exists:
```
No eval suite found. Running /aok-eval first to generate one...
```
Then execute the aok-eval flow (Step 3 from that workflow) to scaffold evals before continuing.

## Step 3: Select Models to Compare

**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Model Selection"
- `question`: "Which models do you want to compare?"
- `multiSelect`: true
- `options`:
  - `label`: "anthropic/claude-3-5-sonnet-20241022 (Recommended)", `description`: "Anthropic: Best balance of quality and speed"
  - `label`: "openai/gpt-4o", `description`: "OpenAI: Flagship model, great at strict formatting"
  - `label`: "google/gemini-2.5-pro", `description`: "Google: Excellent reasoning and large context"
  - `label`: "anthropic/claude-3-5-haiku-20241022", `description`: "Anthropic: Fast and cost-effective"
  - `label`: "openai/gpt-4o-mini", `description`: "OpenAI: Budget model for simple tasks"


**Minimum:** 2 models must be selected. If the user picks only 1, ask again.

## Step 4: Load Eval Spec and Cases

Read:
- `.opencode/evals/{agent-name}/EVAL-SPEC.md` — dimensions, rubrics
- `.opencode/evals/{agent-name}/cases/*.md` — all test cases

## Step 5: Run Evals Per Model

For EACH selected model:

1. **Configure**: Set the model for this run (override the agent's default)
2. **Execute**: Run every test case using this model's behavior profile
3. **Evaluate**: Apply the same rubrics consistently across models
4. **Record**: Store per-model results

**Simulation approach:**
- Load the agent's system prompt
- For each test case, generate the response AS IF using that model
- Apply the model's known characteristics:
  - Claude models: follow instructions precisely, verbose reasoning
  - GPT models: concise, structured output strength, may deviate from exact format
  - Haiku/mini models: may miss nuance, shorter context handling

**Important**: Keep rubric application IDENTICAL across models — the rubrics don't change, only the model generating output does.

## Step 6: Build Comparison Table

**This is the primary deliverable.** Present as a clear comparison table.

### Overall Scores

```
## 📊 Model Comparison: {agent-name}

| Model | Cases Passed | Score | Avg Quality | Verdict |
|-------|-------------|-------|-------------|---------|
| claude-sonnet-4 | 11/12 | 92% | ⭐⭐⭐⭐ | ✅ Recommended |
| claude-opus-4 | 12/12 | 100% | ⭐⭐⭐⭐⭐ | ✅ Best quality |
| gpt-4.1 | 10/12 | 83% | ⭐⭐⭐ | ⚠️ Format issues |
| claude-haiku-3.5 | 8/12 | 67% | ⭐⭐ | ❌ Below threshold |
```

### Per-Dimension Breakdown

```
### Dimension Scores by Model

| Dimension | Priority | claude-sonnet-4 | claude-opus-4 | gpt-4.1 | claude-haiku-3.5 |
|-----------|----------|-----------------|---------------|---------|-----------------|
| Task Completion | Critical | 100% ✅ | 100% ✅ | 100% ✅ | 83% ❌ |
| Format Compliance | High | 92% ✅ | 100% ✅ | 75% ❌ | 67% ❌ |
| Tool Usage | High | 100% ✅ | 100% ✅ | 100% ✅ | 50% ❌ |
| Scope Adherence | Medium | 83% ⚠️ | 100% ✅ | 83% ⚠️ | 67% ⚠️ |
```

### Case-by-Case Heatmap

```
### Case Results Heatmap

| Case | Category | claude-sonnet-4 | claude-opus-4 | gpt-4.1 | claude-haiku-3.5 |
|------|----------|-----------------|---------------|---------|-----------------|
| 01-happy-basic | Happy | ✅ | ✅ | ✅ | ✅ |
| 02-happy-complex | Happy | ✅ | ✅ | ✅ | ❌ |
| 03-edge-missing | Edge | ✅ | ✅ | ❌ | ❌ |
| 04-adversarial | Adversarial | ❌ | ✅ | ❌ | ❌ |
```

### Model-Specific Findings

```
### 🔍 Model-Specific Findings

#### claude-sonnet-4
- **Strengths:** {what it does well for this agent}
- **Weaknesses:** {where it falls short}
- **Best for:** {when to use this model}

#### gpt-4.1
- **Strengths:** {what it does well}
- **Weaknesses:** {where it falls short}
- **Note:** {any model-specific quirks observed}
```

### Recommendation

```
### 💡 Recommendation

**Best value:** {model} — {score}% pass rate at {relative cost}
**Best quality:** {model} — {score}% pass rate (higher cost)
**Budget option:** {model} — {score}% pass rate (use if cost-sensitive)

{If the agent's current model setting is suboptimal:}
**⚠️ Consider switching:** The agent currently uses {current-model}, but {recommended-model} scores {X}% higher on this eval suite.
```

## Step 7: Save Comparison Results

Write to `.opencode/evals/{agent-name}/results/compare-{YYYY-MM-DD-HHmm}.md`

Include all tables and findings for historical reference.

## Step 8: Offer Next Steps

**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Next Steps"
- `question`: "What would you like to do with these results?"
- `options`:
  - `label`: "Switch agent to recommended model (Recommended)", `description`: "Update the agent's model setting to {best-model}"
  - `label`: "Iterate on failures", `description`: "Fix issues found across models with /aok-iterate"
  - `label`: "Run again with different models", `description`: "Try other models not included in this comparison"
  - `label`: "Done for now", `description`: "Save results and finish"


</process>

<comparison_principles>
- Same rubrics, same cases, different models — the ONLY variable is the model
- Always include at least one budget model to test minimum viability
- Report cost/speed tradeoffs alongside quality scores
- A model that passes 100% but costs 10x more isn't always "better" — context matters
- Highlight cases where models DISAGREE — these reveal prompt brittleness
- If ALL models fail a case, the issue is likely the prompt/rubric, not the model
</comparison_principles>

<guardrails>
- **FATAL ERROR:** You MUST use the native `ask_user` tool for questions. DO NOT output `question([{...}])` markdown blocks.
- **FATAL ERROR:** Outputting a numbered list of questions is strictly forbidden.
- ALWAYS ask ONE question at a time. Wait for the user to answer before asking the next one.
- Call the `ask_user` tool silently. Do not print conversational filler.
</guardrails>
