#!/usr/bin/env python3
"""
Memory query helper - efficient search across graph + memory.
Uses storage.py as single source of truth.

Usage: query.py [--node ID] [--tag TAG] [--text TEXT] [--include-personal] [--json]

Examples:
  query.py --node tim_berners_lee
  query.py --tag web --include-personal
  query.py --text "WWW" --json
"""

import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))

import storage


def query_node(node_id, include_personal=False, latest_only=False, history=False):
    """Query memories for a specific node."""
    node = storage.get_node_by_id(node_id)
    
    result = {"node": node, "memory": [], "neighbors": []}
    
    if not node:
        return result
    
    memory_items = storage.get_memory_items_for_node(node_id)
    for item in memory_items:
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
    
    neighbors = storage.get_neighbors(node_id)
    result["neighbors"] = [{"id": n["id"], "label": n.get("label", "")} for n in neighbors]
    
    return result


def query_text(text, include_personal=False):
    """Search nodes and memory by text."""
    node_results = storage.search_nodes(text)
    memory_results = storage.search_memory(text, include_personal)
    
    results = {"nodes": node_results, "memory": memory_results}
    return results


def query_tag(tag, include_personal=False):
    """Query by tag - search all memory items."""
    all_memory = storage.get_all_memory_items(include_personal)
    
    results = []
    for item in all_memory:
        if tag.lower() in [t.lower() for t in item.get("tags", [])]:
            results.append(item)
    
    return results


CONFLICT_NEGATIVE = {"not", "never", "no", "useless", "dead", "wasteful"}
CONFLICT_POSITIVE = {"useful", "good", "yes", "better", "complements", "helps"}


def detect_conflicts(memory_items):
    """Detect potential conflicts by keywords."""
    conflicts = []
    
    for i, m1 in enumerate(memory_items):
        text1 = m1.get("text", "").lower()
        
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
                    "suggestion": "Consider using --supersedes to link these"
                })
    
    return conflicts


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Memory query helper")
    parser.add_argument("--node", help="Query by node ID")
    parser.add_argument("--tag", help="Query by tag")
    parser.add_argument("--text", help="Query by text (search)")
    parser.add_argument("--include-personal", action="store_true", help="Include personal memories")
    parser.add_argument("--json", action="store_true", help="JSON output")
    parser.add_argument("--latest", action="store_true", help="Show only latest insights (deduped by tags)")
    parser.add_argument("--history", action="store_true", help="Show history including superseded")
    parser.add_argument("--conflicts", action="store_true", help="Auto-detect conflicts in memories")
    
    args = parser.parse_args()
    
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
                        print(f"    - {m['text'][:60]}...")
                
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
                        print(f"    - {n['id']} [{n.get('label', '')}]")
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
            if results["memory"]:
                for m in results["memory"][:5]:
                    print(f"  - {m['text'][:60]}...")
            if not results["nodes"] and not results["memory"]:
                all_nodes = storage.get_all_nodes()
                words = args.text.lower().split()
                partial_matches = []
                for n in all_nodes:
                    label = n.get("label", "").lower()
                    for w in words:
                        if len(w) >= 3 and w in label:
                            partial_matches.append(n)
                            break
                
                if partial_matches:
                    print(f"Partial matches ({len(partial_matches)}):")
                    for n in partial_matches[:8]:
                        print(f"  - {n['id']}: {n.get('label', '')[:50]}")
                else:
                    print("No matches found.")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()