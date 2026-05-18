---
description: Run evals across multiple models — comparison table showing how each model performs
agent: build
---

<purpose>
Run the same eval suite for an agent across multiple LLM models and produce a side-by-side comparison table. This answers the question: "Which model is best for this agent?" and reveals model-specific weaknesses.

Works with any agent — AOK-created or not.
</purpose>

<required_reading>
- `references/eval-taxonomy.md` — Test types and selection
- `references/eval-driven-development.md` — Scoring methodology
</required_reading>

<questioning_format>
ALL user interactions use `question()` selector format.
- ONLY output the `question([{...}])` block. DO NOT prepend or append text.
- Ensure strict JSON validity. The `options` property MUST be an array enclosed in `[` and `]`.
- Options are navigable with arrow keys (↑↓) and selected with Return
- Recommended choice is first, marked "(Recommended)"
- Last option is always a freeform escape hatch
- Ask ONE question at a time — resolve it fully before moving to the next
</questioning_format>

<process>

## Step 1: Identify Target Agent

Parse `$ARGUMENTS` for the agent name. If empty, prompt:

```
question([{
  header: "Target Agent",
  question: "Which agent do you want to compare across models?",
  multiSelect: false,
  options: [
    { label: "{agent-1}", description: "{description}" },
    { label: "{agent-2}", description: "{description}" },
    { label: "Something else (I'll tell you)", description: "An agent not listed" }
  ]
}])
```

## Step 2: Verify Eval Suite Exists

Check for `.opencode/evals/{agent-name}/EVAL-SPEC.md`.

If none exists:
```
No eval suite found. Running /aok-eval first to generate one...
```
Then execute the aok-eval flow (Step 3 from that workflow) to scaffold evals before continuing.

## Step 3: Select Models to Compare

```
question([{
  header: "Model Selection",
  question: "Which models do you want to compare?",
  multiSelect: true,
  options: [
    { label: "claude-sonnet-4-20250514 (Recommended)", description: "Best balance of quality and speed for most agents" },
    { label: "claude-opus-4-20250514", description: "Highest quality — slower and more expensive" },
    { label: "gpt-4.1", description: "OpenAI's latest — good at structured output" },
    { label: "claude-haiku-3.5", description: "Fast and cheap — test if the agent works with a lighter model" },
    { label: "gpt-4o-mini", description: "OpenAI's budget model — cheapest option" },
    { label: "Something else (I'll specify)", description: "Enter model IDs manually" }
  ]
}])
```

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

```
question([{
  header: "Next Steps",
  question: "What would you like to do with these results?",
  multiSelect: false,
  options: [
    { label: "Switch agent to recommended model (Recommended)", description: "Update the agent's model setting to {best-model}" },
    { label: "Iterate on failures", description: "Fix issues found across models with /aok-iterate" },
    { label: "Run again with different models", description: "Try other models not included in this comparison" },
    { label: "Done for now", description: "Save results and finish" },
    { label: "Something else (I'll tell you)", description: "Tell me what you want to do" }
  ]
}])
```

</process>

<comparison_principles>
- Same rubrics, same cases, different models — the ONLY variable is the model
- Always include at least one budget model to test minimum viability
- Report cost/speed tradeoffs alongside quality scores
- A model that passes 100% but costs 10x more isn't always "better" — context matters
- Highlight cases where models DISAGREE — these reveal prompt brittleness
- If ALL models fail a case, the issue is likely the prompt/rubric, not the model
</comparison_principles>
