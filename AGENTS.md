## Knowledge base rule
When you ask about the project, any concept, entity, architecture, or logic within it, you MUST ALWAYS consult the Knowledge Base MCP server FIRST.

## Fallback rule
Only read raw source files directly if the Knowledge Base MCP server explicitly lacks the necessary information.

## Other rules
- ALWAYS READ REVIEW.md first
- Check graph for rules via `graphify query "review rules"`

## Graphify-first orientation (critical)
Before ANY work on project questions:
1. ALWAYS use query.py — it searches BOTH graph.json AND memory (unified interface)
2. If asked about "instruction", "operation", any concept — query the graph FIRST
3. Read source files ONLY if graph.json explicitly lacks the needed information

**Quick search (replaces direct graph.json parsing):**
```bash
python3 graphify-out/query.py --text "neural network"  # searches graph + memory
python3 graphify-out/query.py --node <node_id>          # finds node + its memory
```

## Graphify is cheaper (mandatory)
- Querying graph.json (python3) is CHEAPER than manual grep/find
- Checking graph links is CHEAPER than tracing relationships manually
- Recording insight in graph.json is CHEAPER than renegotiating in next session

ALWAYS use graphify to find answers before:
- Running grep/find manually
- Tracing code relationships by hand
- Re-explaining context in future sessions

**Fallback (only if query.py doesn't work):**
```python3 -c "
import json
from pathlib import Path
data = json.loads(Path('graphify-out/graph.json').read_text())
# search nodes, edges, communities
"
```

> Note: direct graph.json parsing misses memory. Always use query.py first.