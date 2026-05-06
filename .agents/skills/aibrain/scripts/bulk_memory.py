#!/usr/bin/env python3
"""
Bulk memory addition - add multiple insights at once.
Uses storage.py as single source of truth.

Usage:
  bulk_memory.py "node1: insight 1 | node2: insight 2 | node3: insight 3"
  bulk_memory.py --file insights.txt

Format:
  node_id: insight text --tags tag1,tag2
"""

import sys
import random
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))

import storage
import embedding_service


def add_bulk(entries):
    """Add multiple memory items."""
    added = 0
    errors = []
    
    for line in entries:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        
        node_id = None
        text = None
        tags = []
        
        if "--" in line:
            parts = line.split("--")
            node_text = parts[0].strip()
            node_id = node_text.split(":")[0].strip()
            text = ":".join(node_text.split(":")[1:]).strip() if ":" in node_text else node_text.strip()
            
            for part in parts[1:]:
                part = part.strip()
                if part.startswith("tags "):
                    tags = part[5:].split(",")
        else:
            if ":" not in line:
                errors.append(f"Skip: no node_id: {line}")
                continue
            node_id, text = line.split(":", 1)
            node_id = node_id.strip()
            text = text.strip()
        
        if not node_id or not text:
            errors.append(f"Skip: empty node or text: {line}")
            continue
        
        if not storage.node_exists(node_id):
            errors.append(f"Skip: node not found: {node_id}")
            continue
        
        if not embedding_service.is_english(text):
            errors.append(f"Skip: not English: {text[:30]}")
            continue
        
        storage.add_memory_item(
            text=text,
            tags=[t.strip() for t in tags],
            scope="work",
            linked_node=node_id
        )
        
        added += 1
    
    print(f"Added: {added}")
    if errors:
        print(f"Errors: {len(errors)}")
        for e in errors[:5]:
            print(f"  - {e}")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  bulk_memory.py 'grpc: OP does not generalize gRPC --tags rpc,bound'")
        print("  bulk_memory.py --file insights.txt")
        sys.exit(1)
    
    if sys.argv[1] == "--file":
        if len(sys.argv) < 3:
            print("ERROR: --file requires filename")
            sys.exit(1)
        content = Path(sys.argv[2]).read_text()
        entries = [e for e in content.split("|") if e.strip()]
        add_bulk(entries)
    else:
        entries = [e for e in sys.argv[1].split("|") if e.strip()]
        add_bulk(entries)


if __name__ == "__main__":
    main()