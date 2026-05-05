#!/usr/bin/env python3
"""
Bulk memory addition - add multiple insights at once.
Cheaper than calling add_memory.py multiple times.

Usage:
  bulk_memory.py "node1: insight 1 | node2: insight 2 | node3: insight 3"
  bulk_memory.py --file insights.txt

Format:
  node_id: insight text --tags tag1,tag2
"""

import json
import sys
import random
from pathlib import Path
from datetime import datetime

GRAPH_DIR = Path(__file__).parent
MEMORY_DIR = GRAPH_DIR / "memory"
GRAPH_FILE = GRAPH_DIR / "graph.json"


def node_exists(node_id):
    if not GRAPH_FILE.exists():
        return False
    data = json.loads(GRAPH_FILE.read_text())
    return any(n["id"] == node_id for n in data.get("nodes", []))


def is_english(text):
    asciiLetters = sum(1 for c in text if c.isalpha() and ord(c) < 128)
    totalLetters = sum(1 for c in text if c.isalpha())
    if totalLetters == 0:
        return True
    return asciiLetters / totalLetters > 0.8


def add_bulk(entries):
    INDEX_FILE = MEMORY_DIR / "index.json"
    index = json.loads(INDEX_FILE.read_text()) if INDEX_FILE.exists() else {}
    
    added = 0
    errors = []
    
    for line in entries:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        
        node_id = None
        text = None
        tags = []
        supersedes = None
        
        if "--" in line:
            parts = line.split("--")
            node_text = parts[0].strip()
            node_id = node_text.split(":")[0].strip()
            text = ":".join(node_text.split(":")[1:]).strip() if ":" in node_text else node_text.strip()
            
            supersedes = None
            for part in parts[1:]:
                part = part.strip()
                if part.startswith("tags "):
                    tags = part[5:].split(",")
                elif part.startswith("supersedes "):
                    supersedes = part[11:].strip()
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
        
        if not node_exists(node_id):
            errors.append(f"Skip: node not found: {node_id}")
            continue
        
        if not is_english(text):
            errors.append(f"Skip: not English: {text[:30]}")
            continue
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S') + f"_{random.randint(0,99):02d}"
        item_id = f"ins_{timestamp}"
        item = {
            "id": item_id,
            "text": text,
            "tags": [t.strip() for t in tags],
            "scope": "work",
            "created": datetime.now().isoformat(),
            "linked_node": node_id
        }
        
        if supersedes:
            item["supersedes"] = supersedes
            old_file = MEMORY_DIR / "items" / f"{supersedes}.json"
            if old_file.exists():
                old_item = json.loads(old_file.read_text())
                old_item["superseded_by"] = item_id
                old_file.write_text(json.dumps(old_item, indent=2))
        
        item_file = MEMORY_DIR / "items" / f"{item_id}.json"
        item_file.write_text(json.dumps(item, indent=2))
        
        if node_id not in index:
            index[node_id] = []
        index[node_id].append(item_id)
        
        added += 1
    
    INDEX_FILE.write_text(json.dumps(index, indent=2))
    
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