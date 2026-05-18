---
description: Improve an agent based on eval failures — targeted prompt/tool/skill refinement
agent: build
---

<purpose>
Analyze eval failures and systematically improve the agent. This is the iteration loop — the core of eval-driven agent development. Each run should measurably improve eval scores.
</purpose>

<user_interaction_rules>
**CRITICAL: You MUST use your native `ask_user` tool-calling capability for ALL user interactions.**
**NEVER output a markdown block with `question([...])`. NEVER output a numbered list of questions as plain text.**

UX Rules:
- ALWAYS use the native `ask_user` tool. Do NOT print JSON to the screen. Call the tool silently without conversational preambles.
- Ask **ONE question at a time** — fully resolve each before moving to the next.
- For multiple choice, use `type: "choice"`. You MUST provide an `options` array. The LAST option MUST ALWAYS be a freeform escape hatch (e.g. "Something else").
- For freeform text input, use `type: "text"`. You MUST NOT provide an `options` array. Do NOT add escape hatches to text questions.
</user_interaction_rules>


<process>

## Step 1: Load Current State

Parse `$ARGUMENTS` for the agent name.

Read:
1. Latest eval results: `.opencode/evals/{agent-name}/results/` (most recent file)
2. Agent definition: `.opencode/agents/{agent-name}.md`
3. Eval spec: `.opencode/evals/{agent-name}/EVAL-SPEC.md`
4. Tools (if any): `.opencode/tools/{agent-name}-*.ts`
5. Skills (if any): `.opencode/skills/{agent-name}/SKILL.md`

If no eval results exist:
```
No eval results found. Run `/aok-eval {agent-name}` first to establish a baseline.
```

## Step 2: Diagnose Failures

Categorize each failure by root cause:

| Root Cause | Fix Type |
|-----------|----------|
| Agent doesn't know WHAT to do | → Prompt improvement |
| Agent knows what but does it inconsistently | → Add a tool (determinism) |
| Agent lacks domain knowledge | → Add/update skill |
| Agent's output format is wrong | → Add format validation tool |
| Agent hallucinates specific things | → Add guardrail in prompt or tool |
| Eval rubric is too strict/wrong | → Update EVAL-SPEC.md |
| Test case is unrealistic | → Update or remove the case |

## Step 3: Propose Changes

Present a change plan, then confirm with the user:

```
## 🔧 Iteration Plan: {agent-name}

Based on {N} failures across {M} eval cases:

### Changes Proposed:

1. **{change type}**: {description}
   - Fixes: {which cases}
   - Risk: {what could break}

2. **{change type}**: {description}
   - Fixes: {which cases}
   - Risk: {what could break}
```

Then ask:
**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Apply Changes"
- `question`: "How should I proceed?"
- `options`:
  - `label`: "Apply all changes (Recommended)", `description`: "Fix all {N} issues in priority order"
  - `label`: "Apply one at a time", `description`: "Apply highest-priority fix, re-eval, then decide"
  - `label`: "Let me pick which ones", `description`: "I'll select which changes to apply"
  - `label`: "Something else (I'll describe)", `description`: "Tell me what you have in mind"


Wait for confirmation.

## Step 4: Apply Changes

Apply each change:

### Prompt Changes
- Edit `.opencode/agents/{agent-name}.md`
- Be surgical — change only what's needed
- Add specific instructions for failure cases
- Add examples if the agent needs them (few-shot)

### New Tools
- Create `.opencode/tools/{agent-name}-{tool-name}.ts`
- Tools should make the previously-failing behavior deterministic
- Test the tool in isolation before connecting

### Skill Updates
- Edit `.opencode/skills/{agent-name}/SKILL.md`
- Add new procedural knowledge
- Add references if needed

### Eval Adjustments
- Update EVAL-SPEC.md rubrics if they were wrong
- Add new cases discovered during debugging
- Remove cases that are invalid

## Step 5: Re-run Evals

After applying changes, immediately re-run the eval suite (same as /aok-eval):
- Run all cases, not just the ones that failed
- Compare results to previous run
- Report delta as a table

## Step 6: Report

Present results as a comparison table:

```
## 📈 Iteration Complete: {agent-name}

### Before → After

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Cases Passing | {X}/{total} | {Y}/{total} | +{N} |
| Score | {old}% | {new}% | +{diff}% |
| Critical Dimensions | {pass/total} | {pass/total} | — |

### Case Delta

| Case | Before | After | Change |
|------|--------|-------|--------|
| {case-1} | ❌ FAIL | ✅ PASS | 🔧 Fixed |
| {case-2} | ❌ FAIL | ✅ PASS | 🔧 Fixed |
| {case-3} | ✅ PASS | ✅ PASS | — |
| {case-4} | ✅ PASS | ❌ FAIL | ⚠️ Regression |

### Changes Applied

| Change | Type | Affects |
|--------|------|---------|
| {description} | Prompt edit | Cases 1, 2 |
| {description} | New tool | Case 5 |

### Status

{If all pass:} ✅ All evals passing! Agent is ready.
{If improved:} 📈 Progress — run `/aok-iterate {agent-name}` to address remaining {N} failures.
{If regression:} ⚠️ Regression — {N} previously passing cases now fail. Review changes.
{If no progress after 3 tries:} 🔄 Consider `/aok-eval-compare {agent-name}` to test if a different model helps.
```

</process>

<iteration_principles>
- Fix the ROOT CAUSE, not the symptom — if the agent consistently fails at X, the fix is often a tool, not more prompt words
- One change at a time when possible — makes it easy to attribute improvements
- Never remove an eval case just because the agent fails it (unless the case is genuinely wrong)
- Watch for regressions — fixing one failure shouldn't break passing cases
- 3 iterations without progress → step back and reconsider the agent's architecture
- Tools > Prompt words for reliability. Skills > Prompt words for knowledge.
</iteration_principles>

<anti_patterns>
- Adding more and more text to the prompt without testing → bloated, confused agents
- Making the eval rubric less strict to "pass" → false confidence
- Ignoring edge cases because happy path works → production surprises
- Over-engineering tools for things the LLM handles fine → wasted effort
</anti_patterns>

<guardrails>
- **FATAL ERROR:** You MUST use the native `ask_user` tool for questions. DO NOT output `question([{...}])` markdown blocks.
- **FATAL ERROR:** Outputting a numbered list of questions is strictly forbidden.
- ALWAYS ask ONE question at a time. Wait for the user to answer before asking the next one.
- Call the `ask_user` tool silently. Do not print conversational filler.
</guardrails>
