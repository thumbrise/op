#!/usr/bin/env python3
"""
CLI interface for knowledge graph operations.
Usage: python3 kg_db_cli.py [command] [args]
"""

import argparse
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))
import storage as db


def cmd_graph(args):
    """Get all nodes and links."""
    nodes = db.get_all_nodes()
    links = db.get_all_links()
    print(json.dumps({"nodes": nodes, "links": links}))


def cmd_stats(args):
    """Get node/link/community counts."""
    nodes = db.get_node_count()
    links = db.get_all_links()
    communities = db.get_communities()
    print(json.dumps({
        "nodes": nodes,
        "links": len(links),
        "communities": communities
    }))


def cmd_search(args):
    """Search nodes - uses semantic (embedding) search by default."""
    # Semantic search is the primary method for aibrain
    if not args.text_only:
        import embedding_service
        vec = embedding_service.get_embedding(args.text)
        if vec:
            matches = db.search_similar_embeddings(vec, limit=20)
            results = []
            for m in matches:
                node = db.get_node_by_id(m["node_id"])
                if node:
                    node["score"] = m.get("distance")
                    results.append(node)
            print(json.dumps(results))
            return
        else:
            print("Semantic search failed: could not get embedding", file=sys.stderr)
    
    # Fallback to text search
    results = db.search_nodes(args.text)
    print(json.dumps(results))


def cmd_node(args):
    """Get single node with neighbors."""
    node = db.get_node_by_id(args.id)
    if not node:
        print(json.dumps({"error": "not found"}))
        return
    neighbors = db.get_neighbors(args.id)
    node["neighbors"] = neighbors
    print(json.dumps(node))


def cmd_communities(args):
    """Get community labels and counts."""
    communities = db.get_communities()
    print(json.dumps(communities))


def main():
    parser = argparse.ArgumentParser(description="Knowledge Graph CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("graph", help="Get all nodes and links")
    sub.add_parser("stats", help="Get stats (nodes, links, communities)")
    
    p_search = sub.add_parser("search", help="Search nodes (semantic by default)")
    p_search.add_argument("text", help="Search term")
    p_search.add_argument("--text-only", action="store_true", help="Use text search instead of semantic")
    
    p_node = sub.add_parser("node", help="Get single node with neighbors")
    p_node.add_argument("id", help="Node ID")
    
    sub.add_parser("communities", help="Get community labels and counts")

    args = parser.parse_args()

    if args.cmd == "graph":
        cmd_graph(args)
    elif args.cmd == "stats":
        cmd_stats(args)
    elif args.cmd == "search":
        cmd_search(args)
    elif args.cmd == "node":
        cmd_node(args)
    elif args.cmd == "communities":
        cmd_communities(args)


if __name__ == "__main__":
    main()