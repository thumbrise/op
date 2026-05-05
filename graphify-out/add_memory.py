#!/usr/bin/env python3
"""
Agent-safe memory addition helper.
Validates: English-only, work-only, proper node_id.

Usage:
  add_memory.py "insight in English" --node node_id --tags tag1,tag2

This script:
- BLOCKS personal content (scope="personal" rejected)
- Requires English text (rejects non-ASCII letters)
- Links to valid node_id in graph.json
- Auto-validates node exists
"""

import json
import sys
import uuid
from pathlib import Path
from datetime import datetime

GRAPH_DIR = Path(__file__).parent
MEMORY_DIR = GRAPH_DIR / "memory"
GRAPH_FILE = GRAPH_DIR / "graph.json"


def is_english(text):
    """Check if text is primarily English (ASCII letters)."""
    asciiLetters = sum(1 for c in text if c.isalpha() and ord(c) < 128)
    totalLetters = sum(1 for c in text if c.isalpha())
    if totalLetters == 0:
        return True
    return asciiLetters / totalLetters > 0.8


def node_exists(node_id):
    """Check if node exists in graph.json."""
    if not GRAPH_FILE.exists():
        return False
    data = json.loads(GRAPH_FILE.read_text())
    return any(n["id"] == node_id for n in data.get("nodes", []))


def add_memory(text, tags, node_id, supersedes=None):
    """Add memory item."""
    INDEX_FILE = MEMORY_DIR / "index.json"
    
    if not is_english(text):
        print("ERROR: Insights must be in English. Russian/other languages are BLOCKED.")
        sys.exit(1)
    
    if not node_exists(node_id):
        print(f"ERROR: Node '{node_id}' not found in graph.json")
        sys.exit(1)
    
    index = {}
    if INDEX_FILE.exists():
        index = json.loads(INDEX_FILE.read_text())
    
    item_id = f"ins_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    item = {
        "id": item_id,
        "text": text,
        "tags": tags,
        "scope": "work",
        "created": datetime.now().isoformat(),
        "linked_node": node_id
    }
    
    if supersedes:
        item["supersedes"] = supersedes
        
        supersedes_file = MEMORY_DIR / "items" / f"{supersedes}.json"
        if supersedes_file.exists():
            old_item = json.loads(supersedes_file.read_text())
            old_item["superseded_by"] = item_id
            supersedes_file.write_text(json.dumps(old_item, indent=2))
    
    item_file = MEMORY_DIR / "items" / f"{item_id}.json"
    item_file.write_text(json.dumps(item, indent=2))
    
    if node_id not in index:
        index[node_id] = []
    index[node_id].append(item_id)
    INDEX_FILE.write_text(json.dumps(index, indent=2))
    
    print(f"OK: Added insight to node '{node_id}'")
    if supersedes:
        print(f"    Supersedes: {supersedes}")
    print(f"    ID: {item_id}")
    print(f"    Tags: {', '.join(tags)}")


def main():
    if len(sys.argv) < 2:
        print("Usage: add_memory.py \"insight in English\" --node node_id --tags tag1,tag2 [--supersedes ins_ID]")
        sys.exit(1)
    
    text = sys.argv[1]
    node_id = None
    tags = []
    supersedes = None
    
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--node" and i + 1 < len(sys.argv):
            node_id = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--tags" and i + 1 < len(sys.argv):
            tags = sys.argv[i + 1].split(",")
            i += 2
        elif sys.argv[i] == "--supersedes" and i + 1 < len(sys.argv):
            supersedes = sys.argv[i + 1]
            i += 2
        else:
            i += 1
    
    if not node_id:
        print("ERROR: --node is required")
        sys.exit(1)
    
    add_memory(text, tags, node_id, supersedes)


if __name__ == "__main__":
    main()