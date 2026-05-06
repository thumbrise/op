#!/usr/bin/env python3
"""
Index — Incremental knowledge extraction and integration.

Two-layer architecture:
  1. extract: Scan directory, extract raw insights (staging area)
  2. integrate: Semantic embedding-based deduplication via Ollama

Features:
  - Semantic deduplication using snowflake-arctic-embed2:568m-l-fp16
  - Cosine similarity threshold: 0.6
  - Uses storage.py as single source of truth

Usage:
    python3 index.py extract --dir ./docs/notes/     # Extract to staging
    python3 index.py integrate                       # Agent merges to graph
    python3 index.py --full --dir ./docs/             # Both layers
"""

import sys
import os
import json
from pathlib import Path
from datetime import datetime
import hashlib

SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))

import storage
import embedding_service

SIMILARITY_THRESHOLD = 0.6


def extract_files(directory):
    """Extract raw insights from files - structural extraction only."""
    tracking = {}
    all_insights = []

    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'vendor', 'dist', '_site']]

        for file in files:
            file_path = Path(root) / file

            if file_path.suffix == '.md':
                content = file_path.read_text()
                lines = content.split('\n')

                in_section = ""
                for line in lines:
                    if line.startswith('## '):
                        in_section = line[3:].strip()
                        if len(in_section) > 2 and len(in_section) < 80:
                            all_insights.append({
                                "id": hashlib.md5(f"{file_path}:{in_section}".encode()).hexdigest()[:12],
                                "type": "heading",
                                "label": in_section,
                                "source": str(file_path),
                                "extracted_at": datetime.now().isoformat()
                            })
                    elif line.startswith('# '):
                        in_section = line[2:].strip()

                important = ["insight", "conclusion", "important", "key", "problem", "solution"]
                for i, line in enumerate(lines):
                    if any(kw in line.lower() for kw in important) and len(line) > 50:
                        excerpt = line[:100].strip()
                        all_insights.append({
                            "id": hashlib.md5(f"{file_path}:excerpt{i}".encode()).hexdigest()[:12],
                            "type": "excerpt",
                            "label": excerpt,
                            "content": line.strip(),
                            "source": str(file_path),
                            "extracted_at": datetime.now().isoformat()
                        })

    return all_insights


def extract_command(args):
    """Execute extract layer - save raw to staging."""
    dir_path = None
    for i, arg in enumerate(args):
        if arg == '--dir' and i + 1 < len(args):
            dir_path = args[i + 1]
        elif arg.startswith('--dir='):
            dir_path = arg.split('=')[1]

    if not dir_path:
        print("ERROR: --dir required", file=sys.stderr)
        sys.exit(1)

    dir_path = Path(dir_path)
    if not dir_path.exists():
        print(f"ERROR: Directory not found: {dir_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Scanning {dir_path}...")

    insights = extract_files(dir_path)

    staging = SCRIPT_DIR.parent / "aibraindata" / "staging.json"
    staging.parent.mkdir(parents=True, exist_ok=True)
    staging.write_text(json.dumps(insights, indent=2))

    print(f"Extracted {len(insights)} raw insights")
    print(f"   Saved to: {staging}")

    if insights:
        print("\nSample insights:")
        for i in insights[:3]:
            print(f"  - [{i['type']}] {i['label'][:50]}")


def integrate_command(args):
    """Execute integrate layer - Semantic embedding-based deduplication."""
    staging = SCRIPT_DIR.parent / "aibraindata" / "staging.json"

    if not staging.exists():
        print("ERROR: No staging found. Run extract first.", file=sys.stderr)
        sys.exit(1)

    raw_insights = json.loads(staging.read_text())
    
    all_nodes = storage.get_all_nodes()
    integrated_sources = storage.get_integrated_sources()
    
    integrated_set = set(integrated_sources)
    new_insights = [i for i in raw_insights if i.get("source", "") not in integrated_set]

    if new_insights:
        print(f"New insights: {len(new_insights)}, Already integrated: {len(raw_insights) - len(new_insights)}")
    else:
        print("No new sources to integrate.")
        return

    existing_ids = {n["id"] for n in all_nodes}
    existing_labels = {n["label"].lower() for n in all_nodes}
    label_to_id = {n["label"].lower(): n["id"] for n in all_nodes}

    print(f"Loaded {len(all_nodes)} existing nodes")

    def get_community(source):
        if "form-of-operation" in source:
            return 8
        elif "form-of-rail" in source:
            return 8
        elif "universal" in source:
            return 10
        elif "notes" in source:
            return 4
        return 2

    added_nodes = 0
    added_edges = 0
    newly_integrated_sources = set()

    for idx, insight in enumerate(new_insights):
        if idx > 0 and idx % 10 == 0:
            print(f"   Processing {idx}/{len(new_insights)}...")

        label = insight["label"]
        label_lower = label.lower()

        if label_lower in existing_labels:
            continue

        content_for_embedding = insight.get("content", label)
        new_embedding = embedding_service.get_embedding(content_for_embedding)

        if new_embedding:
            conn = storage.get_embed_conn()
            cur = conn.execute("SELECT vector FROM embeddings")
            existing_embeddings = {}
            for row in cur.fetchall():
                if row[0]:
                    vec = json.loads(row[0])
                    for node in all_nodes:
                        key = f"{node['label'].lower()}_{node.get('source_file', '')}"
                        existing_embeddings[node['label'].lower()] = vec
            conn.close()
            
            is_duplicate = False
            for existing_label, existing_emb in existing_embeddings.items():
                sim = embedding_service.cosine_similarity(new_embedding, existing_emb)
                if sim > SIMILARITY_THRESHOLD:
                    is_duplicate = True
                    break

            if is_duplicate:
                continue

        connections = []
        if new_embedding:
            for existing_label, existing_emb in existing_embeddings.items():
                sim = embedding_service.cosine_similarity(new_embedding, existing_emb)
                if sim > 0.3:
                    connections.append(label_to_id[existing_label])

        if not connections:
            words = set(label_lower.split())
            for existing_label, existing_id in label_to_id.items():
                existing_words = set(existing_label.split())
                shared = words & existing_words
                if len(shared) >= 2:
                    connections.append(existing_id)

        if not connections:
            continue

        node_id = label_lower.replace(" ", "_").replace("-", "_")[:50]
        if node_id in existing_ids:
            continue

        node = {
            "id": node_id,
            "label": label,
            "file_type": "concept" if insight["type"] == "heading" else "rationale",
            "source_file": insight.get("source", ""),
            "community": get_community(insight.get("source", "")),
            "norm_label": label_lower
        }

        storage.add_node(node)
        existing_ids.add(node_id)
        existing_labels.add(label_lower)
        label_to_id[label_lower] = node_id

        if new_embedding:
            key = f"{label_lower}_{insight.get('source', '')}"
            storage.add_embedding(key, node_id, new_embedding)

        added_nodes += 1
        newly_integrated_sources.add(insight.get("source", ""))

        for target_id in connections[:5]:
            storage.add_link(node_id, target_id, "relates_to", "INFERRED")
            added_edges += 1

    if newly_integrated_sources:
        for source in newly_integrated_sources:
            storage.add_integrated_source(source)

    print(f"Integrated (semantic dedup)")
    print(f"   Nodes added: {added_nodes}")
    print(f"   Edges added: {added_edges}")
    print(f"   Sources integrated: {len(newly_integrated_sources)}")

    if added_nodes == 0:
        print("   No new insights connected to existing graph.")


def full_command(args):
    """Run both layers."""
    dir_path = None
    for i, arg in enumerate(args):
        if arg == '--dir' and i + 1 < len(args):
            dir_path = args[i + 1]
        elif arg.startswith('--dir='):
            dir_path = arg.split('=')[1]

    if not dir_path:
        print("ERROR: --dir required for full mode", file=sys.stderr)
        sys.exit(1)

    print("=" * 50)
    print("LAYER 1: EXTRACT")
    print("=" * 50)
    extract_files(dir_path)
    extract_command(args)

    print("\n" + "=" * 50)
    print("LAYER 2: INTEGRATE")
    print("=" * 50)
    integrate_command([])


def warmup_command(args):
    """Warmup embeddings for all nodes without them."""
    print("WARMUP: Computing embeddings for unprocessed nodes...")

    all_nodes = storage.get_all_nodes()
    integrated_sources = storage.get_integrated_sources()
    integrated_set = set(integrated_sources)
    existing_labels = {n["label"].lower() for n in all_nodes}

    conn = storage.get_embed_conn()
    cur = conn.execute("SELECT node_id FROM embeddings")
    already_warmed = {row[0] for row in cur.fetchall()}
    conn.close()

    nodes_to_warm = []
    for node in all_nodes:
        label = node.get("label", "")
        source = node.get("source_file", "")

        if node["id"] in already_warmed:
            continue

        if source in integrated_set:
            continue

        nodes_to_warm.append(node)

    print(f"   Found {len(nodes_to_warm)} nodes to warm up")

    count = 0
    for idx, node in enumerate(nodes_to_warm):
        if idx > 0 and idx % 10 == 0:
            print(f"   Processing {idx}/{len(nodes_to_warm)}...")

        label = node.get("label", "")
        content = node.get("content", label)
        if not content:
            content = label

        embedding = embedding_service.get_embedding(content[:1000])
        if embedding:
            key = f"{label.lower()}_{node.get('source_file', 'unknown')}"
            storage.add_embedding(key, node["id"], embedding)
            count += 1

    if count > 0:
        print(f"Warmed up {count} embeddings")
    else:
        print("No new embeddings needed (all warm)")


def main():
    args = sys.argv[1:]

    if not args:
        print(__doc__)
        sys.exit(1)

    command = args[0]

    if command == "extract":
        extract_command(args[1:])
    elif command == "integrate":
        integrate_command(args[1:])
    elif command == "--full":
        full_command(args[1:])
    elif command == "warmup":
        warmup_command(args[1:])
    elif command in ["--help", "-h"]:
        print(__doc__)
    else:
        print(f"Unknown: {command}", file=sys.stderr)
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()