#!/usr/bin/env python3
"""
Memory query helper - efficient search across graph + memory.
Usage: query.py [--node ID] [--tag TAG] [--text TEXT] [--include-personal] [--json]

Examples:
  query.py --node tim_berners_lee
  query.py --tag web --include-personal
  query.py --text "WWW" --json
"""

import json
import sys
import os
import uuid
from pathlib import Path
from datetime import datetime

GRAPH_DIR = Path(__file__).parent
MEMORY_DIR = GRAPH_DIR / "memory"
INDEX_FILE = MEMORY_DIR / "index.json"
GRAPH_FILE = GRAPH_DIR / "graph.json"


def load_index():
    if not INDEX_FILE.exists():
        return {}
    return json.loads(INDEX_FILE.read_text())


def load_graph():
    if not GRAPH_FILE.exists():
        return {"nodes": [], "links": []}
    return json.loads(GRAPH_FILE.read_text())


def get_memory_items(ids):
    items = []
    for mid in ids:
        item_file = MEMORY_DIR / "items" / f"{mid}.json"
        if item_file.exists():
            items.append(json.loads(item_file.read_text()))
    return items


def query_node(node_id, include_personal=False, latest_only=False, history=False):
    index = load_index()
    graph = load_graph()
    
    result = {"node": None, "memory": [], "neighbors": []}
    
    for n in graph.get("nodes", []):
        if n["id"] == node_id:
            result["node"] = n
            break
    
    if not result["node"]:
        return result
    
    memory_ids = index.get(node_id, [])
    for mid in memory_ids:
        item_file = MEMORY_DIR / "items" / f"{mid}.json"
        if item_file.exists():
            item = json.loads(item_file.read_text())
            if include_personal or item.get("scope", "work") == "work":
                result["memory"].append(item)
    
    result["memory"] = sorted(result["memory"], key=lambda x: x.get("created", ""), reverse=True)
    
    if latest_only:
        latest_by_topic = {}
        for m in result["memory"]:
            if m.get("superseded"):
                continue
            key = tuple(sorted(m.get("tags", [])))
            if key not in latest_by_topic:
                latest_by_topic[key] = m
        result["memory"] = list(latest_by_topic.values())
    
    if history:
        for m in result["memory"]:
            if "supersedes" in m:
                for orig in result["memory"]:
                    if orig["id"] == m["supersedes"]:
                        orig["superseded"] = True
    
    for e in graph.get("links", []):
        if e.get("source") == node_id:
            result["neighbors"].append({"id": e["target"], "relation": e.get("relation", "")})
        elif e.get("target") == node_id:
            result["neighbors"].append({"id": e["source"], "relation": e.get("relation", "")})
    
    return result


def query_text(text, include_personal=False):
    graph = load_graph()
    index = load_index()
    results = {"nodes": [], "memory": []}
    
    # Split into words and search each (OR logic)
    words = text.lower().split()
    if not words:
        return results
    
    for n in graph.get("nodes", []):
        id_lower = n["id"].lower()
        label_lower = n.get("label", "").lower()
        # Match if ANY word is in id or label
        if any(w in id_lower or w in label_lower for w in words):
            results["nodes"].append(n)
    
    if MEMORY_DIR.exists():
        for item_file in (MEMORY_DIR / "items").glob("*.json"):
            item = json.loads(item_file.read_text())
            if include_personal or item.get("scope", "work") == "work":
                item_text = item.get("text", "").lower()
                item_tags = str(item.get("tags", [])).lower()
                if any(w in item_text or w in item_tags for w in words):
                    results["memory"].append(item)
    
    return results


CONFLICT_NEGATIVE = {"not", "never", "no", "useless", "dead", "wasteful"}
CONFLICT_POSITIVE = {"useful", "good", "yes", "better", "complements", "helps"}


def detect_conflicts(memory_items):
    """Detect potential conflicts by keywords."""
    conflicts = []
    
    for i, m1 in enumerate(memory_items):
        text1 = m1.get("text", "").lower()
        text2 = None
        
        for m2 in memory_items[i+1:]:
            text2 = m2.get("text", "").lower()
            
            neg1 = sum(1 for kw in CONFLICT_NEGATIVE if kw in text1)
            neg2 = sum(1 for kw in CONFLICT_NEGATIVE if kw in text2)
            pos1 = sum(1 for kw in CONFLICT_POSITIVE if kw in text1)
            pos2 = sum(1 for kw in CONFLICT_POSITIVE if kw in text2)
            
            if (neg1 > 0 and pos2 > 0) or (pos1 > 0 and neg2 > 0):
                conflicts.append({
                    "type": "conflict",
                    "insight1": m1["id"],
                    "insight2": m2["id"],
                    "suggestion": f"Consider using --supersedes to link these"
                })
    
    return conflicts


def query_tag(tag, include_personal=False):
    results = []
    
    if not MEMORY_DIR.exists():
        return results
    
    for item_file in (MEMORY_DIR / "items").glob("*.json"):
        item = json.loads(item_file.read_text())
        if include_personal or item.get("scope", "work") == "work":
            if tag.lower() in [t.lower() for t in item.get("tags", [])]:
                results.append(item)
    
    return results


def add_memory(text, tags, scope="work", linked_node=None):
    if scope == "personal":
        print("Refusing to save personal memory. Set --scope=work to save.")
        return None
    
    # Validate node exists in graph
    if linked_node:
        graph = load_graph()
        node_exists = any(n["id"] == linked_node for n in graph.get("nodes", []))
        if not node_exists:
            print(f"Error: node '{linked_node}' not found in graph. Use query.py --text to find valid nodes first.")
            return None
    
    index = load_index()
    
    item_id = f"ins_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    item = {
        "id": item_id,
        "text": text,
        "tags": tags,
        "scope": scope,
        "created": datetime.now().isoformat(),
        "linked_node": linked_node
    }
    
    item_file = MEMORY_DIR / "items" / f"{item_id}.json"
    item_file.write_text(json.dumps(item, indent=2))
    
    if linked_node:
        if linked_node not in index:
            index[linked_node] = []
        index[linked_node].append(item_id)
        INDEX_FILE.write_text(json.dumps(index, indent=2))
    
    return item_id


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Memory query helper")
    parser.add_argument("--node", help="Query by node ID OR link memory to node (with --add)")
    parser.add_argument("--tag", help="Query by tag")
    parser.add_argument("--text", help="Query by text (search)")
    parser.add_argument("--include-personal", action="store_true", help="Include personal memories")
    parser.add_argument("--json", action="store_true", help="JSON output")
    parser.add_argument("--add", help="Add new insight text")
    parser.add_argument("--tags", help="Tags for new insight (comma-separated)")
    parser.add_argument("--scope", default="work", choices=["work", "personal"], help="Scope for new insight")
    parser.add_argument("--latest", action="store_true", help="Show only latest insights (deduped by tags)")
    parser.add_argument("--history", action="store_true", help="Show history including superseded")
    parser.add_argument("--conflicts", action="store_true", help="Auto-detect conflicts in memories")
    
    args = parser.parse_args()
    
    if args.add:
        if args.scope == "personal":
            print("Refusing to save personal memory. Set --scope=work to save.")
            return
        if not args.node:
            print("Error: --node required when adding memory")
            return
        text = args.add
        tags = args.tags.split(",") if args.tags else []
        result_id = add_memory(text, tags, scope=args.scope, linked_node=args.node)
        if result_id:
            print(f"Added insight for node: {args.node}")
        return
    
    if args.node:
        result = query_node(args.node, args.include_personal, args.latest, args.history)
        if args.json:
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            if result["node"]:
                print(f"Node: {result['node']['id']}")
                print(f"  Label: {result['node'].get('label', '')}")
                print(f"  Community: {result['node'].get('community', 'N/A')}")
                if result["memory"]:
                    print(f"  Memory ({len(result['memory'])}):")
                    for m in result["memory"]:
                        superseded_mark = " [SUPERSEDED]" if m.get("superseded") else ""
                        supersedes_info = f" (supersedes: {m.get('supersedes')})" if m.get("supersedes") else ""
                        print(f"    - {m['text'][:60]}...{superseded_mark}{supersedes_info}")
                
                if args.conflicts and result["memory"]:
                    conflicts = detect_conflicts(result["memory"])
                    if conflicts:
                        print(f"\n  Potential conflicts ({len(conflicts)}):")
                        for c in conflicts:
                            print(f"    - {c['insight1']} vs {c['insight2']}")
                            print(f"      {c['suggestion']}")
                
                if result["neighbors"]:
                    print(f"  Neighbors ({len(result['neighbors'])}):")
                    for n in result["neighbors"][:5]:
                        print(f"    - {n['id']} [{n['relation']}]")
            else:
                print(f"Node not found: {args.node}")
    elif args.tag:
        results = query_tag(args.tag, args.include_personal)
        if args.json:
            print(json.dumps(results, indent=2, ensure_ascii=False))
        else:
            print(f"Found {len(results)} memories with tag '{args.tag}':")
            for r in results:
                print(f"  - {r['text'][:60]}...")
    elif args.text:
        results = query_text(args.text, args.include_personal)
        if args.json:
            print(json.dumps(results, indent=2, ensure_ascii=False))
        else:
            print(f"Nodes: {len(results['nodes'])}, Memory: {len(results['memory'])}")
            if results["nodes"]:
                for n in results["nodes"][:5]:
                    print(f"  - {n['id']}")
                for m in results["memory"][:5]:
                    print(f"  - {m['text'][:60]}...")
            else:
                # No results - show suggestions like Google "did you mean"
                print("\nNo exact matches. Trying fuzzy search...")
                graph = load_graph()
                words = args.text.lower().split()
                
                # Find nodes that have ANY of the words (even partial)
                partial_matches = []
                for n in graph.get("nodes", []):
                    label = n.get("label", "").lower()
                    for w in words:
                        if len(w) >= 3 and w in label:  # min 3 chars
                            partial_matches.append(n)
                            break
                
                if partial_matches:
                    print(f"Partial matches ({len(partial_matches)}):")
                    for n in partial_matches[:8]:
                        print(f"  - {n['id']}: {n.get('label', '')[:50]}")
                else:
                    # Show popular nodes as suggestions
                    print("No matches found. Try one of these popular terms:")
                    popular = ["ai", "llm", "model", "agent", "trait", "operation", "brain", "memory"]
                    for term in popular:
                        count = sum(1 for n in graph.get("nodes", []) if term in n.get("label", "").lower())
                        if count > 0:
                            print(f"  - {term} ({count} nodes)")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()