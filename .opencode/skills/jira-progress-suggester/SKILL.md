---
name: jira-progress-suggester
description: "Guidelines to convert a Jira issue into a single, actionable next step with rationale and confidence."
license: MIT
compatibility: opencode
metadata:
  category: productivity

---

# Jira Progress Suggester Skill

## Overview
This skill encodes procedural rules for turning a Jira issue's structured fields into one concise, actionable next step the user can take to move the issue forward.

## When to Use
Load this skill when the agent has retrieved a set of issues via the `get_recent_open_issues` tool and needs to generate a standardized suggestion for each issue.

## Process
Follow these steps in order for each issue:

1. Prioritize: if the issue status or linked issues indicate it's blocked, prefer unblock-oriented actions.
2. Diagnose: examine description, labels, comments, and status for evidence of missing acceptance criteria, reproduction steps, assignment, or scope.
3. Choose a single action: pick one concrete step that most directly reduces friction. The action must:
   - start with an approved imperative verb (Ask, Add, Clarify, Request, Break, Create, Assign, Reassign, Update, Remove, Reproduce, Investigate, Triage, Estimate, Schedule)
   - be a single line, maximum 20 words
   - reference the actor when obvious (e.g., "Ask the Product Owner"), but do not assume contact details
4. Write a 1–2 sentence rationale explaining why this action helps. Cite evidence from issue fields (e.g., "description lacks acceptance criteria" or "blocked by PROJ-2").
5. Set Confidence:
   - High: explicit evidence (e.g., label "blocked", AC present/absent explicitly, clear assignee)
   - Medium: partial evidence or reasonable inference from description
   - Low: sparse or missing data
6. Missing Info: list any required information to complete the action (Acceptance criteria, Steps to reproduce, Priority, Estimate). Use "None" when nothing is missing.

## Examples
- Issue with no acceptance criteria:
  Action: "Ask the Product Owner for acceptance criteria."
  Rationale: "The description doesn't define expected behavior; AC will prevent rework."
  Confidence: Medium
  Missing: Acceptance criteria

- Blocked issue:
  Action: "Investigate blocking issue PROJ-23 and request unblock from owner."
  Rationale: "This issue is blocked and cannot progress until the blocker is resolved."
  Confidence: High
  Missing: None

## Notes
- Do not perform actions — this skill only suggests them.
- Prefer the simplest step that moves the issue forward (one immediate next action, not a plan).
- Keep language professional and concise.
