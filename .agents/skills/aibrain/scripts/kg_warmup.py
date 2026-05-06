#!/usr/bin/env python3
"""
Warmup embeddings for all nodes in SQLite.
Uses storage.py and embedding_service.py.

Usage: python3 warmup.py
"""

import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))

import storage
import embedding_service


def warmup():
    """Compute embeddings for all nodes without them."""
    print("WARMUP: Computing embeddings for all nodes...")
    
    all_nodes = storage.get_all_nodes()
    print(f"   Total nodes: {len(all_nodes)}")
    
    conn = storage.get_embed_conn()
    cur = conn.execute("SELECT node_id FROM embeddings")
    existing = {row[0] for row in cur.fetchall()}
    conn.close()
    print(f"   Already embedded: {len(existing)}")
    
    nodes_to_warm = [n for n in all_nodes if n["id"] not in existing]
    print(f"   To warm up: {len(nodes_to_warm)}")
    
    count = 0
    for idx, node in enumerate(nodes_to_warm):
        if idx > 0 and idx % 10 == 0:
            print(f"   Processing {idx}/{len(nodes_to_warm)}...")
        
        content = node.get("content") or node.get("label", "")
        if not content:
            content = node.get("label", "")
        
        emb = embedding_service.get_embedding(content[:1000])
        if emb:
            key = f"{node['label'].lower()}_{node.get('source_file', 'unknown')}"
            storage.add_embedding(key, node["id"], emb)
            count += 1
    
    print(f"Warmed up {count} embeddings")
    return count


if __name__ == "__main__":
    warmup()