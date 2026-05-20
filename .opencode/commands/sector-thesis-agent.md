---
description: Generate five investment theses for a user-provided sector or investment brief.
agent: sector-thesis-agent
subtask: false
---

{query}

Flags (optional): --region=US --market_cap_min=100M --market_cap_max=50B --risk=medium --horizon=3y --long_only=true --exclude=TSLA,AMZN --output=cli|html|json

Examples:
- /sector-thesis-agent photonics --region=global --output=html
- /sector-thesis-agent "American Energy, dividend focused" --horizon=2y --output=cli
