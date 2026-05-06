#!/usr/bin/env python3
"""
CLI для поиска по базе знаний.
Usage:
  python3 search.py --text "neural network"
  python3 search.py --semantic "attention mechanism"
  python3 search.py --node <node_id>
"""

import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))

import storage
import embedding_service


def search_text(term, limit=10):
    """Text search in nodes."""
    nodes = storage.search_nodes(term)
    results = []
    for n in nodes[:limit]:
        results.append({
            "id": n["id"],
            "label": n["label"],
            "source": n.get("source_file", ""),
            "community": n.get("community")
        })
    return results


def search_semantic(term, limit=10):
    """Semantic search using embeddings."""
    vec = embedding_service.get_embedding(term)
    if not vec:
        print("ERROR: Could not get embedding", file=sys.stderr)
        return []
    
    matches = storage.search_similar_embeddings(vec, limit)
    
    results = []
    for m in matches:
        node = storage.get_node_by_id(m["node_id"])
        if node:
            results.append({
                "id": node["id"],
                "label": node["label"],
                "source": node.get("source_file", ""),
                "community": node.get("community"),
                "similarity": round(m["distance"], 3)
            })
    return results


def get_node_info(node_id):
    """Get node details."""
    node = storage.get_node_by_id(node_id)
    if not node:
        return None
    
    neighbors = storage.get_neighbors(node_id)
    memory = storage.get_memory_for_node(node_id)
    
    return {
        "node": node,
        "neighbors": [{"id": n["id"], "label": n["label"]} for n in neighbors[:10]],
        "memory": memory
    }


def main():
    args = sys.argv[1:]
    
    if "--text" in args:
        idx = args.index("--text")
        term = args[idx + 1] if idx + 1 < len(args) else ""
        results = search_text(term)
        print(json.dumps(results, indent=2))
        
    elif "--semantic" in args:
        idx = args.index("--semantic")
        term = args[idx + 1] if idx + 1 < len(args) else ""
        results = search_semantic(term)
        print(json.dumps(results, indent=2))
        
    elif "--node" in args:
        idx = args.index("--node")
        node_id = args[idx + 1] if idx + 1 < len(args) else ""
        info = get_node_info(node_id)
        print(json.dumps(info, indent=2, default=str))
        
    elif "--stats" in args:
        nodes = storage.get_node_count()
        links = len(storage.get_all_links())
        communities = storage.get_communities()
        integrated = len(storage.get_integrated_sources())
        print(json.dumps({
            "nodes": nodes,
            "links": links,
            "communities": len(communities),
            "integrated_sources": integrated
        }, indent=2))
        
    elif "--export" in args:
        nodes = storage.get_all_nodes()
        links = storage.get_all_links()
        export = {
            "nodes": nodes,
            "links": links,
            "communities": []
        }
        print(json.dumps(export))
        
    else:
        print(__doc__)


if __name__ == "__main__":
    main()