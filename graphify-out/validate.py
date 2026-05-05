#!/usr/bin/env python3
"""
Single validation script for graph.json
Checks: structure, dangling links, connectivity, communities format
"""

import json
import sys
from pathlib import Path
from collections import defaultdict


def fix_empty_labels(nodes):
    """Fix nodes with empty labels - use id as label."""
    fixed = 0
    for n in nodes:
        if not n.get('label') or n['label'] == '':
            n['label'] = n['id']
            fixed += 1
    return fixed


def validate_graph(graph_path='graphify-out/graph.json'):
    """Complete validation of graph.json"""
    data = json.loads(Path(graph_path).read_text())
    
    issues = []
    warnings = []
    
    # Fix empty labels
    nodes = data.get('nodes', [])
    fixed = fix_empty_labels(nodes)
    if fixed:
        Path(graph_path).write_text(json.dumps(data, indent=2))
        warnings.append(f"Fixed {fixed} empty labels")
    
    # 1. Required keys
    required = ['nodes', 'links']
    for key in required:
        if key not in data:
            issues.append(f"Missing required key: {key}")
            return issues, warnings  # Can't continue
    
    nodes = data['nodes']
    links = data['links']
    node_ids = {n['id'] for n in nodes}
    
    # 2. Check links reference existing nodes (dangling)
    dangling_sources = set()
    dangling_targets = set()
    for e in links:
        src, tgt = e.get('source'), e.get('target')
        if src not in node_ids:
            dangling_sources.add(src)
        if tgt not in node_ids:
            dangling_targets.add(tgt)
    
    if dangling_sources:
        issues.append(f"Dangling sources: {len(dangling_sources)} ({', '.join(sorted(dangling_sources)[:3])}...)")
    if dangling_targets:
        issues.append(f"Dangling targets: {len(dangling_targets)} ({', '.join(sorted(dangling_targets)[:3])}...)")
    
    # 3. Check communities format
    comms = data.get('communities')
    if comms is None:
        issues.append("Missing communities")
    elif isinstance(comms, dict):
        issues.append("communities is dict (should be array with id+label)")
    elif isinstance(comms, list):
        for c in comms:
            if not isinstance(c, dict):
                issues.append(f"community item not dict")
                break
            if 'id' not in c or 'label' not in c:
                issues.append(f"community missing id/label")
                break
    
    # 4. Check nodes have community
    nodes_without_community = [n['id'] for n in nodes if 'community' not in n]
    if nodes_without_community:
        warnings.append(f"Nodes without community: {len(nodes_without_community)}")
    
    # 5. Connectivity check - find most connected node as center
    # Count connections per node
    degree = defaultdict(int)
    for e in links:
        degree[e['source']] += 1
        degree[e['target']] += 1
    
    # Use most connected node as center
    center = max(degree, key=degree.get) if degree else None
    
    if center and center in node_ids:
        adj = defaultdict(set)
        for e in links:
            adj[e['source']].add(e['target'])
            adj[e['target']].add(e['source'])
        
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
            sample = ', '.join(sorted(unreachable)[:5])
            issues.append(f"Unreachable from '{center}' (most connected): {len(unreachable)} ({sample})")
    
    return issues, warnings


if __name__ == '__main__':
    issues, warnings = validate_graph()
    
    print(f"📊 Graph validation")
    print("=" * 40)
    
    if warnings:
        print("\n⚠️  Warnings:")
        for w in warnings:
            print(f"  - {w}")
    
    if issues:
        print("\n❌ Issues found:")
        for i in issues:
            print(f"  - {i}")
        sys.exit(1)
    elif warnings:
        print("\n⚠️  Warnings:")
        for w in warnings:
            print(f"  - {w}")
        sys.exit(0)
    else:
        print("\n✅ All checks passed!")
        sys.exit(0)
