# Eval-Driven Agent Development

> Reference for AOK eval workflows. Based on industry best practices for testing AI agents and prompts.

---

## Why Evals for Agents?

Traditional testing asks: "Does the code produce the right output for this input?"
Agent evals ask: "Does the agent **behave correctly** across varied, realistic scenarios?"

Agents are non-deterministic. The same prompt can produce different outputs across runs. Evals are the continuous process of measuring whether behavior stays within acceptable bounds.

---

## The Three Layers of Agent Evaluation

### Layer 1: Structural Checks (Code-Based)
Fast, deterministic, cheap. Run on every eval.

- **Output format**: Does it match the expected schema?
- **Required sections**: Are all mandatory parts present?
- **Prohibited content**: Are there hallucinations, unsafe patterns, or policy violations?
- **Tool usage**: Did the agent call the right tools in the right order?
- **Length constraints**: Is the output within acceptable bounds?

### Layer 2: LLM-as-Judge
Slower, probabilistic, moderate cost. Run for subjective qualities.

- **Rubric adherence**: Does the output match the PASS criteria?
- **Reasoning quality**: Is the chain of thought sound?
- **Tone/style**: Does it match expectations?
- **Completeness**: Did it address all aspects of the input?
- **Accuracy**: Are factual claims correct?

### Layer 3: Human Review
Slowest, most expensive, highest signal. Use for calibration and edge cases.

- **Rubric calibration**: Do humans agree with LLM judge scores?
- **Edge cases**: Novel situations that neither code nor LLM can judge
- **Failure forensics**: Understanding WHY an agent failed
- **Rubric evolution**: Discovering new quality dimensions

---

## Eval Dimensions for Different Agent Types

### Task Execution Agents (code review, file operations, deployment)
| Dimension | Priority | Measurement |
|-----------|----------|-------------|
| Task completion | Critical | Code check (output exists, format correct) |
| Correctness | Critical | LLM judge + code validation |
| Tool use accuracy | High | Code check (right tools, right order) |
| Error handling | High | Adversarial test cases |
| Safety | Critical | Code check (no destructive ops without confirmation) |

### Knowledge/Advisory Agents (documentation, planning, research)
| Dimension | Priority | Measurement |
|-----------|----------|-------------|
| Factual accuracy | Critical | LLM judge against sources |
| Completeness | High | Checklist-based code check |
| Relevance | High | LLM judge |
| Clarity | Medium | LLM judge |
| Source attribution | Medium | Code check (references present) |

### Conversational Agents (user interviews, support, coaching)
| Dimension | Priority | Measurement |
|-----------|----------|-------------|
| Appropriate responses | Critical | LLM judge against rubric |
| Scope adherence | High | Code check (no off-topic) |
| Tone | High | LLM judge |
| Information extraction | High | Code check (key info captured) |
| Escalation accuracy | Medium | Test cases with edge triggers |

### Orchestration Agents (workflows, multi-step, routing)
| Dimension | Priority | Measurement |
|-----------|----------|-------------|
| Correct routing | Critical | Code check (right subagent called) |
| Step ordering | Critical | Code check (dependency order) |
| Error recovery | High | Adversarial cases (step failures) |
| Efficiency | Medium | Code check (minimal steps) |
| State management | High | Code check (context preserved) |

---

## Rubric Design

A rubric must be SPECIFIC and DOMAIN-RELEVANT.

### Bad Rubric
```
PASS: Good response
FAIL: Bad response
```

### Good Rubric
```
Dimension: Security finding accuracy
PASS: Identifies the actual vulnerability, names the CWE category,
      and provides a fix that addresses the root cause (not just the symptom).
      Does not flag false positives.
FAIL: Misses the vulnerability, names the wrong category, provides a fix
      that only addresses the symptom, or flags code that isn't actually vulnerable.
```

### Rubric Template
```
Dimension: {name}
Priority: {Critical | High | Medium}
PASS: {specific observable behavior that indicates success}
FAIL: {specific observable behavior that indicates failure}
Measurement: {Code check | LLM judge | Human review}
```

---

## Test Case Design

### Coverage Matrix
Every eval suite should cover:

| Category | Cases | Purpose |
|----------|-------|---------|
| Happy path | 2-3 | Prove the agent works for standard inputs |
| Edge cases | 2-3 | Boundary conditions, unusual but valid inputs |
| Failure modes | 2-3 | Invalid inputs, missing context, conflicting requirements |
| Adversarial | 1-2 | Prompt injection attempts, scope violations, manipulation |

### Test Case Structure
```markdown
## Case: {descriptive-name}

### Input
{Exact prompt/context that will be sent to the agent}

### Expected Behavior
{What the agent should do — NOT the exact output, but the behavior}

### Checks
- [ ] {Specific verifiable assertion 1}
- [ ] {Specific verifiable assertion 2}
- [ ] {Specific verifiable assertion 3}

### Category
{happy-path | edge-case | failure-mode | adversarial}
```

---

## The Eval-Iterate Loop

```
1. Run evals → identify failures
2. Diagnose root cause per failure:
   - Prompt gap → add/clarify instructions
   - Inconsistency → add a tool (determinism)
   - Knowledge gap → add/update skill
   - Format issue → add validation tool
   - Rubric issue → fix the rubric
3. Apply ONE change type at a time
4. Re-run ALL evals (check for regressions)
5. Repeat until all critical/high dimensions pass
```

### When to Stop Iterating
- All Critical dimensions pass
- All High dimensions pass (>80%)
- Medium dimensions are acceptable
- No regressions from previous iteration
- OR: 3 iterations without meaningful progress → rethink architecture

---

## Common Pitfalls

1. **Eval theater**: Writing evals that always pass → false confidence
2. **Overfitting to cases**: Agent passes evals but fails on real inputs → add variety
3. **Rubric drift**: Loosening rubrics to avoid failures → defeats the purpose
4. **Ignoring adversarial**: "Users won't do that" → they will
5. **Not evolving**: Evals frozen at creation → misses new failure modes
6. **All-or-nothing**: Waiting for perfect evals before shipping → ship when critical dims pass
