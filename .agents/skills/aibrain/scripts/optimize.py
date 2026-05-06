#!/usr/bin/env python3
"""
Optimize - Raw Graph Data Exporter

Portable - exports raw graph data for AI SEMANTIC analysis.
All data retrieved via storage.

Usage:
    python3 optimize.py              # Export full JSON
    python3 optimize.py --stats      # Quick stats only
"""

import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))
import storage as db


def load_graph():
    """Load graph from storage."""
    nodes = db.get_all_nodes()
    links = db.get_all_links()
    communities = db.get_communities()
    return {
        "nodes": nodes,
        "links": links,
        "communities": communities
    }


def load_memory():
    """Get memory items from storage."""
    conn = db.get_state_conn()
    cur = conn.execute("SELECT linked_node, COUNT(*) as count FROM memory_items GROUP BY linked_node")
    result = {}
    for row in cur.fetchall():
        if row[0]:
            result[row[0]] = row[1]
    conn.close()
    return result


def compute_centrality(nodes, edges):
    """Compute degree centrality for all nodes."""
    degree = {n.get("id"): 0 for n in nodes}
    for e in edges:
        src = e.get("source")
        tgt = e.get("target")
        if src in degree:
            degree[src] = degree.get(src, 0) + 1
        if tgt in degree:
            degree[tgt] = degree.get(tgt, 0) + 1
    return degree


def build_community_map(communities):
    """Build community ID -> label mapping."""
    return {c.get("id"): c.get("label", f"Community {c.get('id')}") for c in communities}


def export_full(graph):
    """Export complete graph data for AI analysis."""
    nodes = graph.get("nodes", [])
    edges = graph.get("links", [])
    communities = graph.get("communities", [])

    degree = compute_centrality(nodes, edges)
    comm_map = build_community_map(communities)
    memory_index = load_memory()

    # Find root node (most connected) - semantic center of the graph
    root_node = max(degree.items(), key=lambda x: x[1]) if degree else (None, 0)
    root_data = next((n for n in nodes if n.get("id") == root_node[0]), None)

    # AI decides semantic meaning - give all degree data, no hardcoded thresholds
    # But if AI previously marked hubs (hub: true), include those as cached understanding

    # Extract AI-marked hub nodes (cached semantic understanding)
    marked_hubs = [n for n in nodes if n.get("hub") == True]

    # Group nodes by community
    nodes_by_comm = {}
    for n in nodes:
        comm = n.get("community", -1)
        if comm not in nodes_by_comm:
            nodes_by_comm[comm] = []
        nodes_by_comm[comm].append(n.get("id"))

    # Build community data
    community_data = []
    for c in communities:
        comm_id = c.get("id")
        members = nodes_by_comm.get(comm_id, [])
        community_data.append({
            "id": comm_id,
            "label": c.get("label", f"Community {comm_id}"),
            "member_count": len(members),
            "members": members
        })

    # Edges by community
    edge_by_comm = {}
    for e in edges:
        src = e.get("source")
        tgt = e.get("target")
        src_node = next((n for n in nodes if n.get("id") == src), None)
        tgt_node = next((n for n in nodes if n.get("id") == tgt), None)
        if src_node and tgt_node:
            src_comm = src_node.get("community", -1)
            tgt_comm = tgt_node.get("community", -1)
            if src_comm not in edge_by_comm:
                edge_by_comm[src_comm] = []
            edge_by_comm[src_comm].append({
                "source": src,
                "target": tgt,
                "relation": e.get("relation", ""),
                "confidence": e.get("confidence", ""),
                "target_community": tgt_comm
            })

    # Cross-community edges
    cross_comm_edges = []
    for e in edges:
        src = e.get("source")
        tgt = e.get("target")
        src_node = next((n for n in nodes if n.get("id") == src), None)
        tgt_node = next((n for n in nodes if n.get("id") == tgt), None)
        if src_node and tgt_node:
            src_comm = src_node.get("community", -1)
            tgt_comm = tgt_node.get("community", -1)
            if src_comm != tgt_comm:
                cross_comm_edges.append({
                    "source": src,
                    "target": tgt,
                    "source_community": src_comm,
                    "target_community": tgt_comm,
                    "relation": e.get("relation", ""),
                    "confidence": e.get("confidence", "")
                })

    # Node metadata
    node_metadata = []
    for n in nodes:
        node_id = n.get("id")
        node_metadata.append({
            "id": node_id,
            "label": n.get("label", node_id),
            "file_type": n.get("file_type", ""),
            "source_file": n.get("source_file", ""),
            "community": n.get("community", -1),
            "degree": degree.get(node_id, 0),
            "has_memory": node_id in memory_index
        })

    # Edge data
    edge_data = []
    for e in edges:
        edge_data.append({
            "source": e.get("source"),
            "target": e.get("target"),
            "relation": e.get("relation", ""),
            "confidence": e.get("confidence", ""),
            "weight": e.get("weight", 1.0)
        })

    result = {
        "graph_stats": {
            "nodes": len(nodes),
            "edges": len(edges),
            "communities": len(communities),
            "memory_entries": len(memory_index)
        },
        "root_node": {
            "id": root_data.get("id") if root_data else None,
            "label": root_data.get("label") if root_data else None,
            "degree": root_node[1]
        } if root_data else None,
        "marked_hubs": [
            {"id": h.get("id"), "label": h.get("label", h.get("id"))}
            for h in marked_hubs
        ],  # AI's cached hub markers
        "communities": community_data,
        "edges": edge_data,
        "edges_by_community": edge_by_comm,
        "cross_community_edges": cross_comm_edges,
        "node_metadata": node_metadata,
        "degree_centrality": degree
    }

    return result


def export_stats(graph):
    """Quick stats only."""
    nodes = graph.get("nodes", [])
    edges = graph.get("links", [])
    communities = graph.get("communities", [])

    degree = compute_centrality(nodes, edges)
    root = max(degree.items(), key=lambda x: x[1]) if degree else (None, 0)

    return {
        "nodes": len(nodes),
        "edges": len(edges),
        "communities": len(communities),
        "root_node": root[0],
        "root_degree": root[1],
        "avg_degree": sum(degree.values()) / len(degree) if degree else 0,
        "degree_centrality": degree  # AI decides semantic meaning
    }


def main():
    """Main entry point."""
    args = sys.argv[1:] if len(sys.argv) > 1 else []

    if "--help" in args or "-h" in args:
        print("Optimize - Raw Graph Data Exporter")
        print()
        print("Portable - exports data for AI SEMANTIC analysis.")
        print("No hardcoded thresholds - AI decides what's 'hub', 'orphan', 'optimal'.")
        print()
        print("Usage:")
        print("  python3 optimize.py              # Full JSON export")
        print("  python3 optimize.py --stats      # Quick stats")
        print()
        print("Output: JSON data for AI to analyze semantically.")
        return

    graph = load_graph()

    if "--stats" in args:
        result = export_stats(graph)
    else:
        result = export_full(graph)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()