# Knowledge Base Rule

When you ask about the project, any concept, entity, architecture, or logic within it, you MUST ALWAYS consult the Knowledge Base MCP server FIRST.

## Fallback Rule

Only read raw source files directly if the Knowledge Base MCP server explicitly lacks the necessary information.


## AI Brain First Orientation

- Check graph for rules via `aibrain query "review rules"`


Before ANY work on project questions:

1. ALWAYS use query.py — it searches BOTH graph.json AND memory (unified interface)
2. If asked about "instruction", "operation", any concept — query the graph FIRST
3. Read source files ONLY if graph.json explicitly lacks the needed information

**Quick search:**
```bash
python3 .agents/skills/aibrain/scripts/query.py --text "neural network"
python3 .agents/skills/aibrain/scripts/query.py --node <node_id>
```

## Knowledge Graph is Cheaper

- Querying graph.json is CHEAPER than manual grep/find
- Checking graph links is CHEAPER than tracing relationships manually
- Recording insight in graph.json is CHEAPER than renegotiating in next session

ALWAYS use aibrain scripts to find answers before:
- Running grep/find manually
- Tracing code relationships by hand
- Re-explaining context in future sessions

**Fallback (only if query.py doesn't work):**
```python3
import json
from pathlib import Path
data = json.loads(Path('aibrain/graph.json').read_text())
```

Note: direct graph.json parsing misses memory. Always use query.py first.

## Memory Rule

When user asks to "remember" something:
1. Add memory to persistence using add_memory.py
2. Optionally create a new node if the information warrants it
3. Confirm what was saved

## Optimize Tool

When user wants to optimize/analyze the knowledge graph:

```bash
python3 .agents/skills/aibrain/scripts/optimize.py              # Full JSON export
python3 .agents/skills/aibrain/scripts/optimize.py --stats      # Quick stats
```

The script exports raw data for AI semantic analysis:
- Graph stats (nodes, edges, communities)
- Root node (most connected)
- All node metadata and edges
- Cross-community edges

AI analyzes semantically and proposes improvements.

## Validation

To check graph integrity:

```bash
python3 .agents/skills/aibrain/scripts/validate.py
```