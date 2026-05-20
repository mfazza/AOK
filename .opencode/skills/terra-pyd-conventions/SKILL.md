---
name: terra-pyd-conventions
description: Best-practice conventions and anti-patterns for Terraform (IaC) and Pydantic models. Load this skill when reviewing PRs to ground recommendations in documented guidance.
license: MIT
compatibility: opencode
metadata:
  category: review-conventions
---

# TerraPyd Conventions

## Overview
This skill encodes concise, high-value best practices and anti-patterns for Terraform and Pydantic used by the TerraPyd-Reviewer agent. It is intended to be loaded by the agent when making claims so that each finding can include a citation to a concrete rule or source.

## Terraform Best Practices (high level)
- Pin providers and module versions: prefer explicit version ranges to avoid breaking changes.
- Avoid hard-coded credentials or secrets in code; prefer referencing secrets via secure storage (Vault, SSM, etc.).
- Limit open network access: avoid 0.0.0.0/0 where unnecessary; prefer least-privilege security group rules.
- Use resource tagging consistently for ownership and billing information.
- Use lifecycle blocks for stateful resources where deletion protection is needed.
- Prefer for_each over count when identifying resources by keys; avoid depending on index ordering.

## Terraform Anti-Patterns
- Using interpolation for simple values (use direct attributes instead).
- Using latest or unpinned provider versions.
- Committing backend state files to repo.

## Pydantic Best Practices
- Use explicit field types; avoid `Any` when possible.
- Use validators for complex field validation and prefer root validators only when necessary.
- Prefer `BaseModel` for validated data models; consider dataclasses for simple containers.
- Avoid mutable default arguments; use `Field(default_factory=...)` when needed.

## Pydantic Anti-Patterns
- Using `validate_assignment` incorrectly for performance-sensitive code.
- Storing secrets in models or serializing models with secrets without redaction.

## References
- Terraform: Official docs (https://www.terraform.io/docs), security best practices guides
- Pydantic: Official docs (https://pydantic-docs.helpmanual.io/)

## When to Load
- Load this skill when the agent is asked to analyze code for best practices, security, or maintainability issues involving Terraform or Pydantic.
