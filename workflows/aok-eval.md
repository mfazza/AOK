---
description: Run eval suite against ANY agent — generates evals if none exist, outputs clear pass/fail table
agent: build
---

<purpose>
Execute evals for any opencode agent — whether created with AOK or not. If the agent has no eval suite, generate one first. Runs test cases, applies rubrics, and reports results in a clear pass/fail table.

This is the universal quality gate for agents.
</purpose>

<required_reading>
- `references/eval-taxonomy.md` — Eval type catalog and selection matrix
- `references/eval-driven-development.md` — Methodology and rubric design
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

## Step 1: Discover & Select Target Agent

**MANDATORY: You MUST discover agents and present a selector before doing anything else.**

First, run these commands to find all agents:

```bash
find .opencode/agents -name "*.md" 2>/dev/null
find .claude/agents -name "*.md" 2>/dev/null
find agents -name "*.md" 2>/dev/null
find . -maxdepth 1 -name "AGENT*.md" -o -name "agent*.md" 2>/dev/null
ls ~/.config/opencode/agents/*.md 2>/dev/null
```

If `$ARGUMENTS` specifies an agent name AND you can find it, you may skip the selector. Otherwise, **ALWAYS present this selector and STOP until the user responds:**

```
question(
  header: "Target Agent",
  question: "Which agent do you want to evaluate?",
  options: [
    "{agent-1} ({location})" — {description from frontmatter},
    "{agent-2} ({location})" — {description},
    "{agent-3} ({location})" — {description},
    "Something else (I'll point you to it)" — An agent file not in these locations
  ]
)
```

**STOP HERE.** Wait for the user to select before continuing.

If NO agents found anywhere:
```
No agents found. Create one with /aok-new first, or tell me the path to an agent file.
```

## Step 2: Check for Existing Eval Suite

Look for `.opencode/evals/{agent-name}/EVAL-SPEC.md`.

### If evals exist → proceed to Step 4

### If NO evals exist → generate them (Step 3)

Inform the user:
```
This agent has no eval suite yet. I'll generate one based on its definition.
```

## Step 3: Generate Evals for Existing Agent (auto-scaffold)

Read the agent definition at `.opencode/agents/{agent-name}.md`:
- Extract: purpose, tools used, model, permissions, output format
- Identify: what the agent does, what quality means for it

Consult `references/eval-taxonomy.md` to select eval types:

```
question([{
  header: "Eval Coverage",
  question: "Based on this agent, I recommend these eval dimensions. Approve?",
  multiSelect: false,
  options: [
    { label: "Use all recommended (Recommended)", description: "{list: Task Completion, Format Compliance, Tool Usage, Scope Adherence, etc.}" },
    { label: "Minimal — just core checks", description: "Task Completion + Format + one robustness test" },
    { label: "Comprehensive — maximum coverage", description: "All recommended + Quality + Adversarial + Integration" },
    { label: "Something else (I'll pick)", description: "Let me choose dimensions" }
  ]
}])
```

Then generate:
1. `EVAL-SPEC.md` with dimensions, rubrics, measurement approach
2. Test cases (minimum count based on complexity from taxonomy)
3. Distribute cases: 30% happy, 25% edge, 25% robustness, 10% adversarial, 10% integration

## Step 4: Load Eval Spec

Read `.opencode/evals/{agent-name}/EVAL-SPEC.md`:
- Dimensions and priority (Critical / High / Medium)
- Rubrics (concrete PASS/FAIL criteria)
- Measurement approach per dimension

## Step 5: Load Test Cases

Read all files from `.opencode/evals/{agent-name}/cases/`:
- Parse each: category, input, expected behavior, checks

## Step 6: Run Each Case

For each test case:

1. **Load agent prompt** from `.opencode/agents/{agent-name}.md`
2. **Prepare context**: Include any tools/skills the agent uses
3. **Apply input**: Feed the test case input to the agent's prompt
4. **Generate output**: Simulate the agent's response faithfully
5. **Record**: Capture full output for evaluation

**Important**: Role-play the target agent precisely — use its exact instructions, model behavior, and constraints. Don't inject external knowledge or capability.

## Step 7: Evaluate Outputs

For each case, apply rubrics:

### Code-Based Checks (fast, deterministic)
- Output format validation (JSON schema, required fields, sections)
- Required content presence (keywords, patterns, structure)
- Prohibited content absence (hallucinations, unsafe patterns)
- Length/structure constraints

### LLM-as-Judge (for subjective dimensions)
```
Given this rubric:
  PASS: {pass criteria}
  FAIL: {fail criteria}

Agent output:
  {output}

Score: PASS or FAIL
Reasoning: {one sentence}
```

### Aggregation Rules
- **Critical** dimension: ANY fail → overall FAIL
- **High** dimension: >50% fail → overall FAIL
- **Medium** dimension: reported but doesn't block

## Step 8: Report Results Table

**Results MUST be presented as a clear table.** This is the primary output format.

### Case Results Table

```
## 📊 Eval Results: {agent-name}

**Overall: {PASS ✅ | FAIL ❌}** — {passed}/{total} cases passed

| # | Case | Category | Result | Notes |
|---|------|----------|--------|-------|
| 1 | {case-name} | Happy Path | ✅ PASS | — |
| 2 | {case-name} | Happy Path | ✅ PASS | — |
| 3 | {case-name} | Edge Case | ❌ FAIL | {brief reason} |
| 4 | {case-name} | Robustness | ✅ PASS | — |
| 5 | {case-name} | Adversarial | ❌ FAIL | {brief reason} |
| ... | ... | ... | ... | ... |
```

### Dimension Scores Table

```
### Dimension Breakdown

| Dimension | Priority | Passed | Total | Score | Status |
|-----------|----------|--------|-------|-------|--------|
| Task Completion | Critical | 7 | 8 | 87% | ❌ FAIL |
| Format Compliance | High | 8 | 8 | 100% | ✅ PASS |
| Tool Usage | High | 6 | 6 | 100% | ✅ PASS |
| Scope Adherence | Medium | 4 | 5 | 80% | ⚠️ WARN |
```

### Failure Details (only for failed cases)

```
### ❌ Failed Cases

#### Case 3: {case-name}
- **Input:** {summarized}
- **Expected:** {what should have happened}
- **Actual:** {what the agent did}
- **Root Cause:** {prompt gap / missing tool / wrong rubric}
- **Fix Suggestion:** {actionable recommendation}
```

### Recommendations

```
### 💡 Recommendations

1. {highest-impact fix}
2. {second fix}
3. {etc.}

### ⚙️ Efficiency Observations (if any)

{During eval execution, note if the agent:}
- Uses LLM reasoning where a tool would be more reliable
- Produces excessively verbose output for simple tasks
- Ignores available tools and reasons from scratch
- Could have parts extracted into a skill or tool

{If observations found:}
**Consider:** `/aok-audit {agent-name}` for a full efficiency + security analysis.

**Next:** `/aok-iterate {agent-name}` to apply fixes, or `/aok-eval-compare {agent-name}` to test across models.
```

## Step 9: Save Results

Write results to `.opencode/evals/{agent-name}/results/{YYYY-MM-DD-HHmm}.md`

Include the full table output so results can be compared across runs.

</process>

<eval_principles>
- Start with code-based checks — fast, cheap, reliable
- Use LLM-as-judge only for subjective qualities (tone, reasoning)
- Every dimension needs a concrete rubric, not a vague label
- Failing evals must produce ACTIONABLE feedback — not just "wrong"
- Evals evolve — add cases for new failure modes found in production
- Tables are the primary output format — scannable, comparable, clear
- Watch for determinism opportunities during eval — if the agent's output is always the same structure, that's a tool candidate
- Watch for injection surfaces during eval — if user input can alter agent behavior unexpectedly, flag it
</eval_principles>
