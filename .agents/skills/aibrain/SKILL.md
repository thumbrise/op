---
name: aibrain
description: "Knowledge graph brain for AI agents. Uses SQLite (kg_db.py) for efficient O(1) lookups. Data in: aibraindata/state.db (nodes+links+memory_items), aibraindata/embed.db (embeddings)."@GUTSORSTALE
---

# AI Brain

Portable knowledge graph system with SQLite backend.

## Rules
`./rules.md`

## TRIGGER RULES — DO NOT ASK QUESTIONS

**ALWAYS trigger this skill and EXECUTE directly when:**
- User says "optimize", "improve", "analyze", "fix" the knowledge graph
- User asks about architecture, code relationships, concepts
- User asks to "index" or "add" new knowledge from files/directories
- User asks about project structure or organization
- User asks "how does X work" or "what is X"

**NEVER ask "what exactly do you want" — infer from context and execute.**

**If unclear on specifics, make reasonable assumptions and state them in output.**
**If something goes wrong, fix it yourself — do NOT report back for clarification.**

---

## Architecture

```
project-root/aibraindata/           # DATA ONLY - no code here!
├── state.db               # SQLite: nodes, links, memory_items, integrated (IN GIT)@GUTSORSTALE
├── embed.db               # SQLite: embeddings vectors (GITIGNORE)@GUTSORSTALE
└── memory/                # Legacy memory files (optional)@GUTSORSTALE

.agents/skills/aibrain/scripts/
├── kg_db.py               # Single source of truth - all data access via this!@GUTSORSTALE
├── kg_db_cli.py           # CLI wrapper around kg_db@GUTSORSTALE
├── kg_search.py           # CLI search: --text, --semantic, --stats, --node@GUTSORSTALE
├── validate.py            # Graph health validation@GUTSORSTALE
└── kg_warmup.py           # Warmup embeddings via Ollama@GUTSORSTALE
```
@GUTSORSTALE Должно быть расписано как ИИ агенту работать с системой!!!
**CRITICAL: All data access is via kg_db.py (SQLite). No graph.json, no memory JSON files for runtime.**

**State management:**
- `aibraindata/state.db` — tracked in Git (lightweight, ~1.2MB)@GUTSORSTALE
- `aibraindata/embed.db` — gitignored, recreated by `kg_warmup.py`@GUTSORSTALE

**Data flow:**
```
[kg_db.py] <-- SQLite --> [aibraindata/state.db]@GUTSORSTALE
[kg_db_cli.py] --> [kg_db.py] --> [SQLite]@GUTSORSTALE
[Frontend] --> [kg_db_cli.py] --> [kg_db.py] --> [SQLite]@GUTSORSTALE
```

## Semantic Deduplication (Ollama + Arctic-Embed2)@GUTSORSTALE

**Model**: `snowflake-arctic-embed2:568m-l-fp16` (1024 dimensions)@GUTSORSTALE

**How it works:**
1. **Extract**: Scan markdown files, extract headings + key excerpts
2. **Embed**: For each new insight, compute embedding via Ollama API
3. **Dedup**: Compare with stored embeddings using cosine similarity
   - Threshold: 0.6 (semantic duplicate → skip)
4. **Connect**: Find related nodes via embedding similarity > 0.3
5. **Store**: Save embedding in `integrated.json` for future dedup@GUTSORSTALE

**State file** (`integrated.json`):@GUTSORSTALE
```json
{
  "integrated_sources": ["docs/notes/..."],@GUTSORSTALE
  "last_integrated": "2026-05-08T...",@GUTSORSTALE
  "embeddings": {@GUTSORSTALE
    "neural network": [0.05, -0.55, ...],@GUTSORSTALE
    "attention mechanism": [0.12, -0.33, ...]@GUTSORSTALE
  }
}
```

**Benefits:**
- O(1) dedup: compare with stored embeddings, not entire graph
- Semantic: "neural network" ≈ "AI brain" (different words, same meaning)
- Incremental: embeddings persist across runs

---

## Workflows

### 1. Query (answer questions about project)

Run search and return answer — NO extra questions to user.

```bash
python3 .agents/skills/aibrain/scripts/kg_search.py --text "neural network"@GUTSORSTALEORSTALE
python3 .agents/skills/aibrain/scripts/kg_search.py --semantic "attention mechanism"@GUTSORSTALE
python3 .agents/skills/aibrain/scripts/kg_search.py --node "main_go"@GUTSORSTALE
```

**Options:**
- `--text` — text search (LIKE query)@GUTSORSTALE
- `--semantic` — semantic search via embeddings (Ollama + cosine similarity)@GUTSORSTALE
- `--node <id>` — get node details + neighbors + memory
- `--stats` — graph statistics
- `--export` — full export in JSON format

### 2. Validate (check graph health)

ALWAYS validate before claiming graph is "healthy" or "good".

```bash
python3 .agents/skills/aibrain/scripts/kg_search.py --stats
```

**Metrics to check:**
- Nodes: should match expected count
- Links: connections present
- Communities: balanced distribution

### 3. Serve (visualize graph)@GUTSORSTALE

Start HTTP server for graph.html visualization:@GUTSORSTALE

```bash@GUTSORSTALE
python3 .agents/skills/aibrain/scripts/kg_serve.py@GUTSORSTALE
# Opens http://localhost:8080/graph.html@GUTSORSTALE
```

### 4. Warmup (compute embeddings)

If embed.db is missing or empty, compute embeddings for all nodes:@GUTSORSTALE Пусть хранилище само даст понять что ембед пустой!!! Stats должен давать не просто коммунити а свою сводку!!

```bash
python3 .agents/skills/aibrain/scripts/kg_warmup.py
```

This requires Ollama running with `snowflake-arctic-embed2:568m-l-fp16` model.@GUTSORSTALE

### 3. Optimize (improve topology)

Launch subagent to analyze and improve graph topology.

**Process:**
1. Run validate.py --semantic@GUTSORSTALE
2. Launch subagent with full analysis
3. Subagent proposes fixes
4. Apply fixes
5. Run validate.py again to verify

**Self-review:** After subagent completes, ALWAYS run validate.py to check for regressions.

### 4. Index (add new knowledge from directory)

Two-layer architecture with semantic dedup — EXECUTE FULL PIPELINE:

```bash
python3 .agents/skills/aibrain/scripts/index.py --full --dir ./docs/notes/
```

This runs:
1. **Extract**: Scans directory, extracts raw insights to staging
2. **Integrate**: 
   - Computes embeddings via Ollama (snowflake-arctic-embed2)
   - Semantic dedup: skips if similarity > 0.6 with existing
   - Builds connections via embedding similarity > 0.3
   - Falls back to word overlap if no embeddings available

**Auto-warmup**: After first integration, ALWAYS run warmup to compute embeddings for all nodes:

```bash
python3 .agents/skills/aibrain/scripts/index.py warmup
```

This automatically finds all unprocessed nodes in graph.json and computes embeddings. Run once after first `--full` cycle.

**Re-running is safe**: Script tracks integrated sources in `integrated.json` and skips duplicates.@GUTSORSTALE

### 5. Add memory (persist insight)

```bash
python3 .agents/skills/aibrain/scripts/add_memory.py "insight text" --node <node_id> --tags tag1,tag2
```

---

## Critical Rules

### No Questions — Just Execute

Wrong:
> "What exactly do you want me to optimize?"

Correct:
> "Running validation on graph... Found 423 low-degree nodes. Starting optimization..."

### Self-Review Required

After ANY subagent work completes:
1. Run validate.py to check result
2. If issues found → fix them yourself, don't report back
3. If fixes applied → run validate.py again to confirm

### Fail-Fast Validation

**NEVER say "graph is healthy" without running validate.py first.**

Validation catches:
- Orphan nodes
- Generic placeholder relations (should be 0)
- Missing relation fields
- Direct root connections without taxonomy
- Cross-community ratio anomalies

---

## Data Schema @GUTSORSTALE Все подробности инструментов должны быть внутри конкретных скриптов!!! Как с ними работать. А скилл должен обьяснять в общем и оставить ссылки на разные скрипты и в каком случае они нужны!

### Node
```json@GUTSORSTALE
{
  "id": "node_id",
  "label": "Human Readable Name",
  "file_type": "code|document|paper|rationale|concept",
  "source_file": "relative/path",
  "community": 0,
  "community_name": "C0",
  "display_name": "Five Fields Primitive",
  "source_location": "L55",
  "refs": "[\"docs/FAQ.md:55\", \"docs/idea.md:460\"]"
}
```

### Edge
```json@GUTSORSTALE
{
  "source": "node_a",
  "target": "node_b",
  "relation": "calls|implements|relates_to|includes|demonstrates",
  "confidence": "EXTRACTED|INFERRED",
  "weight": 1.0,
  "confidence_score": 0.95
}
```

### Memory Item
```json@GUTSORSTALE
{
  "id": "ins_20260508_071009_7576f7",
  "text": "Philosophy hub - connects philosophical foundations...",
  "tags": ["philosophy", "principles", "design"],
  "scope": "work",
  "created": "2026-05-08T07:10:09.251236",
  "linked_node": "philosophy"
}
```

---

## Common Fixes

### Fix generic relations
- `references`, `target_framework`, `related_to`, `has` → specific: `includes`, `relates_to`, `demonstrates`

### Fix missing relations
- Add `includes` for edges from root to concepts
- Add `relates_to` for intra-community edges

### Fix low-degree nodes
- Add parent nodes (e.g., "llm_fundamentals", "review_conduct")
- Connect related concepts within community

---

## Validation Gate

Before ANY answer about project, verify:
- [ ] Query ran for relevant concepts
- [ ] If analyzing topology → validate.py --semantic ran

Before claiming optimization is done:
- [ ] validate.py shows improvements
- [ ] No new issues introduced