# Eval Specification: {AGENT_NAME}

## Overview

**Agent:** {AGENT_NAME}
**Purpose:** {AGENT_PURPOSE}
**Created:** {DATE}

## Dimensions

| Dimension | Priority | Measurement | Description |
|-----------|----------|-------------|-------------|
| {DIM_1} | Critical | {Code/LLM/Human} | {what it measures} |
| {DIM_2} | High | {Code/LLM/Human} | {what it measures} |
| {DIM_3} | Medium | {Code/LLM/Human} | {what it measures} |

## Rubrics

### {Dimension 1}
- **Priority:** Critical
- **PASS:** {specific observable behavior that indicates success}
- **FAIL:** {specific observable behavior that indicates failure}
- **Measurement:** {Code check | LLM judge | Human review}

### {Dimension 2}
- **Priority:** High
- **PASS:** {specific observable behavior}
- **FAIL:** {specific observable behavior}
- **Measurement:** {Code check | LLM judge | Human review}

## Test Case Summary

| # | Name | Category | Covers |
|---|------|----------|--------|
| 01 | {name} | happy-path | {dimension} |
| 02 | {name} | happy-path | {dimension} |
| 03 | {name} | edge-case | {dimension} |
| 04 | {name} | edge-case | {dimension} |
| 05 | {name} | failure-mode | {dimension} |
| 06 | {name} | adversarial | {dimension} |

## Passing Criteria

- **Ship-ready:** All Critical dimensions pass, all High dimensions >80%
- **Iteration needed:** Any Critical failure OR High dimensions <80%
- **Architecture review:** 3+ iterations without meaningful progress
