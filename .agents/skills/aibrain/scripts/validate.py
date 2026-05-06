#!/usr/bin/env python3
"""
Graph validation - structural AND semantic integrity checks.
ALL DATA comes from SQLite via storage.py - NOT from graph.json

Usage:
    python3 validate.py              # Full validation (structural + semantic)
    python3 validate.py --stats       # Quick stats only
    python3 validate.py --semantic   # Semantic checks only
    python3 validate.py --orphans    # Show orphan nodes
"""

import json
import sys
from pathlib import Path
from collections import defaultdict
from pathlib import Path
import sys

SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))
import storage as db


def load_graph():
    """Load graph from SQLite via storage."""
    nodes = db.get_all_nodes()
    links = db.get_all_links()
    communities = db.get_communities()
    return {
        "nodes": nodes,
        "links": links,
        "communities": communities
    }


def compute_degree(nodes, edges):
    """Compute degree for all nodes."""
    degree = {n.get("id"): 0 for n in nodes}
    for e in edges:
        src, tgt = e.get("source"), e.get("target")
        if src in degree:
            degree[src] += 1
        if tgt in degree:
            degree[tgt] += 1
    return degree


def find_root_node(nodes, degree):
    """Find most connected node as root."""
    if not degree:
        return None
    return max(degree.items(), key=lambda x: x[1])[0]


def check_structural(graph):
    """Structural validation - format, dangling links, connectivity."""
    nodes = graph.get("nodes", [])
    links = graph.get("links", [])
    node_ids = {n["id"] for n in nodes}

    issues = []
    warnings = []

    if "nodes" not in graph or "links" not in graph:
        issues.append("Missing required keys: nodes or links")
        return {"valid": False, "issues": issues, "warnings": warnings}

    dangling_sources = {e.get("source") for e in links if e.get("source") not in node_ids}
    dangling_targets = {e.get("target") for e in links if e.get("target") not in node_ids}
    if dangling_sources:
        issues.append(f"Dangling sources: {len(dangling_sources)}")
    if dangling_targets:
        issues.append(f"Dangling targets: {len(dangling_targets)}")

    communities = graph.get("communities", [])
    if not communities:
        warnings.append("No communities defined")
    elif isinstance(communities, list):
        for c in communities:
            if not isinstance(c, dict) or "id" not in c or "label" not in c:
                issues.append("Invalid community format")
                break

    orphan_nodes = [n["id"] for n in nodes if n.get("community") is None]
    if orphan_nodes:
        warnings.append(f"Nodes without community: {len(orphan_nodes)}")

    degree = compute_degree(nodes, links)
    if degree:
        center = max(degree.items(), key=lambda x: x[1])[0]
        adj = defaultdict(set)
        for e in links:
            adj[e["source"]].add(e["target"])
            adj[e["target"]].add(e["source"])

        reachable = set()
        queue = [center]
        while queue:
            node = queue.pop(0)
            if node in reachable:
                continue
            reachable.add(node)
            queue.extend(adj[node])

        unreachable = node_ids - reachable
        if unreachable:
            issues.append(f"Unreachable from center: {len(unreachable)}")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "warnings": warnings,
        "stats": {
            "nodes": len(nodes),
            "edges": len(links),
            "communities": len(communities)
        }
    }


def check_semantic(graph):
    """Semantic validation - topology quality, orphans, generic edges."""
    nodes = graph.get("nodes", [])
    links = graph.get("links", [])
    communities = graph.get("communities", [])

    degree = compute_degree(nodes, links)
    root_id = find_root_node(nodes, degree)

    results = {
        "orphans": [],
        "low_degree": [],
        "generic_edges": [],
        "direct_root_connections": [],
        "isolated_communities": [],
        "cross_community_ratio": 0.0,
        "warnings": []
    }

    ORPHAN_THRESHOLD = 2

    for n in nodes:
        nid = n.get("id")
        d = degree.get(nid, 0)
        if d == 0:
            results["orphans"].append({"id": nid, "label": n.get("label", nid), "degree": 0})
        elif d <= ORPHAN_THRESHOLD:
            results["low_degree"].append({"id": nid, "label": n.get("label", nid), "degree": d})

    generic_relations = {"target_framework", "references", "related_to", "depends_on", "has"}
    for e in links:
        rel = e.get("relation", "").lower()
        if rel in generic_relations:
            results["generic_edges"].append({
                "source": e.get("source"),
                "target": e.get("target"),
                "relation": e.get("relation"),
                "confidence": e.get("confidence")
            })

    if root_id:
        for e in links:
            if e.get("source") == root_id:
                tgt = e.get("target")
                results["direct_root_connections"].append({
                    "target": tgt,
                    "relation": e.get("relation")
                })

    nodes_by_comm = defaultdict(list)
    for n in nodes:
        comm = n.get("community", -1)
        nodes_by_comm[comm].append(n.get("id"))

    edges_by_comm = defaultdict(list)
    node_comm = {n["id"]: n.get("community", -1) for n in nodes}
    for e in links:
        src_comm = node_comm.get(e.get("source"), -1)
        tgt_comm = node_comm.get(e.get("target"), -1)
        if src_comm == tgt_comm:
            edges_by_comm[src_comm].append(e)

    for comm_id, members in nodes_by_comm.items():
        internal_edges = len(edges_by_comm.get(comm_id, []))
        if internal_edges == 0 and len(members) > 1:
            results["isolated_communities"].append({
                "community": comm_id,
                "member_count": len(members),
                "members": members[:5]
            })

    cross_comm = 0
    for e in links:
        src_comm = node_comm.get(e.get("source"), -1)
        tgt_comm = node_comm.get(e.get("target"), -1)
        if src_comm != tgt_comm:
            cross_comm += 1

    if links:
        results["cross_community_ratio"] = cross_comm / len(links)

    if len(results["orphans"]) > len(nodes) * 0.1:
        results["warnings"].append(f"High orphan count: {len(results['orphans'])} ({len(results['orphans'])/len(nodes)*100:.1f}%)")

    if len(results["generic_edges"]) > len(links) * 0.3:
        results["warnings"].append(f"Too many generic edges: {len(results['generic_edges'])} ({len(results['generic_edges'])/len(links)*100:.1f}%)")

    if results["cross_community_ratio"] > 0.5:
        results["warnings"].append(f"High cross-community ratio: {results['cross_community_ratio']*100:.1f}%")

    return results


def main():
    args = sys.argv[1:]

    graph = load_graph()

    if "--stats" in args:
        structural = check_structural(graph)
        print(json.dumps(structural["stats"], indent=2))
        return

    if "--semantic" in args:
        semantic = check_semantic(graph)
        print(json.dumps(semantic, indent=2))
        return

    if "--orphans" in args:
        semantic = check_semantic(graph)
        print(json.dumps({
            "orphans": semantic["orphans"],
            "low_degree": semantic["low_degree"]
        }, indent=2))
        return

    structural = check_structural(graph)
    semantic = check_semantic(graph)

    print(f"📊 Graph validation: aibraindata/state.db (SQLite)")
    print("=" * 50)

    print(f"\n📈 Structure: {structural['stats']['nodes']} nodes, {structural['stats']['edges']} edges, {structural['stats']['communities']} communities")

    if structural["issues"]:
        print("\n❌ Structural Issues:")
        for i in structural["issues"]:
            print(f"  - {i}")

    if structural["warnings"]:
        print("\n⚠️ Structural Warnings:")
        for w in structural["warnings"]:
            print(f"  - {w}")

    print(f"\n🧠 Semantic Analysis:")
    print(f"  Orphans (degree 0): {len(semantic['orphans'])}")
    print(f"  Low degree (≤2): {len(semantic['low_degree'])}")
    print(f"  Generic edges: {len(semantic['generic_edges'])}")
    print(f"  Direct root connections: {len(semantic['direct_root_connections'])}")
    print(f"  Isolated communities: {len(semantic['isolated_communities'])}")
    print(f"  Cross-community ratio: {semantic['cross_community_ratio']*100:.1f}%")

    if semantic["warnings"]:
        print("\n⚠️ Semantic Warnings:")
        for w in semantic["warnings"]:
            print(f"  - {w}")

    if semantic["orphans"]:
        print("\n  Top orphans:")
        for n in semantic["orphans"][:5]:
            print(f"    - {n['label']} (degree {n['degree']})")

    if semantic["low_degree"]:
        print("\n  Top low-degree nodes:")
        for n in sorted(semantic["low_degree"], key=lambda x: x["degree"])[:5]:
            print(f"    - {n['label']} (degree {n['degree']})")

    if semantic["generic_edges"]:
        print("\n  Sample generic edges:")
        for e in semantic["generic_edges"][:3]:
            print(f"    - {e['relation']}: {e['source']} → {e['target']}")

    if structural["issues"]:
        sys.exit(1)
    else:
        print("\n✅ Validation passed")
        sys.exit(0)


if __name__ == "__main__":
    main()