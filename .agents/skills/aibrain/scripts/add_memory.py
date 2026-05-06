#!/usr/bin/env python3
"""
Agent-safe memory addition helper.
Validates: English-only, work-only, proper node_id.

Usage:
  add_memory.py "insight in English" --node node_id --tags tag1,tag2

This script:
- BLOCKS personal content (scope="personal" rejected)
- Requires English text (rejects non-ASCII letters)
- Links to valid node in database via storage
- Auto-validates node exists
"""

import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))

import storage
import embedding_service


def add_memory(text, tags, node_id, supersedes=None):
    """Add memory item via storage."""
    if not embedding_service.is_english(text):
        print("ERROR: Insights must be in English. Russian/other languages are BLOCKED.")
        sys.exit(1)
    
    if not storage.node_exists(node_id):
        print(f"ERROR: Node '{node_id}' not found in database")
        sys.exit(1)
    
    item_id = storage.add_memory_item(
        text=text,
        tags=tags,
        scope="work",
        linked_node=node_id
    )
    
    print(f"OK: Added insight to node '{node_id}'")
    print(f"    ID: {item_id}")
    print(f"    Tags: {', '.join(tags)}")


def main():
    if len(sys.argv) < 2:
        print("Usage: add_memory.py \"insight in English\" --node node_id --tags tag1,tag2")
        sys.exit(1)
    
    text = sys.argv[1]
    node_id = None
    tags = []
    
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--node" and i + 1 < len(sys.argv):
            node_id = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--tags" and i + 1 < len(sys.argv):
            tags = sys.argv[i + 1].split(",")
            i += 2
        else:
            i += 1
    
    if not node_id:
        print("ERROR: --node is required")
        sys.exit(1)
    
    add_memory(text, tags, node_id)


if __name__ == "__main__":
    main()