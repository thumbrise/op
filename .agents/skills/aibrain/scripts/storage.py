#!/usr/bin/env python3
"""
SQLite database module for knowledge graph.
- state.db: nodes, links, integrated sources (in Git)
- embed.db: embeddings vectors (gitignore, warmup)
"""

import sqlite3
import json
import struct
import os
from pathlib import Path
from datetime import datetime
import hashlib

SCRIPT_DIR = Path(__file__).parent.resolve()
# scripts/ -> aibraindata/ -> skills/ -> .agents/ -> op/ -> aibraindata/
PROJECT_ROOT = SCRIPT_DIR.parent.parent.parent.parent
AIBRAIN_DIR = PROJECT_ROOT / "aibraindata"
STATE_DB = AIBRAIN_DIR / "state.db"
EMBED_DB = AIBRAIN_DIR / "embed.db"

VECTOR_DIM = 1024


def get_state_conn():
    """Get connection to state.db."""
    conn = sqlite3.connect(str(STATE_DB))
    conn.row_factory = sqlite3.Row
    return conn


def get_embed_conn():
    """Get connection to embed.db with vector extension."""
    conn = sqlite3.connect(str(EMBED_DB))
    conn.row_factory = sqlite3.Row
    try:
        conn.enable_load_extension(True)
        import sqlite_vec
        sqlite_vec.load(conn)
    except ImportError:
        pass
    return conn


def init_state_db():
    """Initialize state.db schema."""
    conn = get_state_conn()
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS nodes (
            id TEXT PRIMARY KEY,
            label TEXT NOT NULL,
            file_type TEXT,
            source_file TEXT,
            community INTEGER,
            norm_label TEXT,
            content TEXT,
            display_name TEXT,
            source_location TEXT,
            refs TEXT,
            community_name TEXT
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS links (
            source TEXT,
            target TEXT,
            relation TEXT,
            confidence TEXT,
            weight REAL,
            confidence_score REAL,
            source_file TEXT,
            source_location TEXT,
            PRIMARY KEY (source, target)
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS integrated (
            source TEXT PRIMARY KEY,
            integrated_at TEXT
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS communities (
            id INTEGER PRIMARY KEY,
            label TEXT
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS memory (
            node_id TEXT,
            memory_id TEXT,
            PRIMARY KEY (node_id, memory_id)
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS memory_items (
            id TEXT PRIMARY KEY,
            text TEXT,
            tags TEXT,
            scope TEXT,
            created TEXT,
            linked_node TEXT
        )
    ''')
    
    conn.execute('CREATE INDEX IF NOT EXISTS idx_nodes_label ON nodes(label)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_nodes_community ON nodes(community)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_nodes_source ON nodes(source_file)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_links_source ON links(source)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_links_target ON links(target)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_memory_items_node ON memory_items(linked_node)')
    
    conn.commit()
    conn.close()


def init_embed_db():
    """Initialize embed.db schema with vector support."""
    conn = get_embed_conn()
    
    try:
        conn.execute('''
            CREATE VIRTUAL TABLE IF NOT EXISTS embeddings USING vec0(
                key TEXT PRIMARY KEY,
                node_id TEXT,
                vector FLOAT[1024] distance_metric=cosine
            )
        ''')
    except sqlite3.OperationalError:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS embeddings (
                key TEXT PRIMARY KEY,
                node_id TEXT,
                vector BLOB,
                created_at TEXT
            )
        ''')
        
        conn.execute('CREATE INDEX IF NOT EXISTS idx_emb_node ON embeddings(node_id)')
    
    conn.commit()
    conn.close()


def import_from_json(graph_json_path, integrated_json_path=None):
    """Import from existing JSON files to SQLite."""
    if not Path(graph_json_path).exists():
        print(f"ERROR: {graph_json_path} not found")
        return False
    
    graph = json.loads(Path(graph_json_path).read_text())
    
    conn = get_state_conn()
    
    nodes = graph.get("nodes", [])
    for node in nodes:
        conn.execute('''
            INSERT OR REPLACE INTO nodes (id, label, file_type, source_file, community, norm_label, content, display_name, source_location, refs, community_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            node.get("id"),
            node.get("label"),
            node.get("file_type"),
            node.get("source_file"),
            node.get("community"),
            node.get("norm_label"),
            node.get("content"),
            node.get("display_name"),
            node.get("source_location"),
            json.dumps(node.get("references")) if node.get("references") else None,
            node.get("community_name") or f'C{node.get("community", 0)}'
        ))
    
    links = graph.get("links", [])
    for link in links:
        conn.execute('''
            INSERT OR REPLACE INTO links (source, target, relation, confidence, weight, confidence_score, source_file, source_location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            link.get("source"),
            link.get("target"),
            link.get("relation"),
            link.get("confidence"),
            link.get("weight"),
            link.get("confidence_score"),
            link.get("source_file"),
            link.get("source_location")
        ))
    
    if integrated_json_path and Path(integrated_json_path).exists():
        integrated = json.loads(Path(integrated_json_path).read_text())
        for source in integrated.get("integrated_sources", []):
            conn.execute('''
                INSERT OR REPLACE INTO integrated (source, integrated_at)
                VALUES (?, ?)
            ''', (source, integrated.get("last_integrated", datetime.now().isoformat())))
    
    conn.commit()
    
    stats = {
        "nodes": len(nodes),
        "links": len(links)
    }
    conn.close()
    
    return stats


def import_embeddings(embeddings_json_path, emb_dir_path):
    """Import embeddings from JSON + binary files."""
    init_embed_db()
    
    emb_index = json.loads(Path(embeddings_json_path).read_text())
    emb_dir = Path(emb_dir_path)
    
    conn = get_embed_conn()
    
    has_vec = True
    try:
        conn.execute("SELECT vector FROM embeddings WHERE key = 'test'")
    except:
        has_vec = False
    
    count = 0
    for key, path in emb_index.items():
        emb_path = emb_dir / path.replace("emb/", "")
        if not emb_path.exists():
            continue
            
        with open(emb_path, "rb") as f:
            data = f.read()
        
        vector = list(struct.unpack(f"{len(data)//4}f", data))
        
        node_id = key.rsplit("_", 1)[0] if "_" in key else key
        
        if has_vec:
            conn.execute('''
                INSERT OR REPLACE INTO embeddings (key, node_id, vector)
                VALUES (?, ?, ?)
            ''', (key, node_id, json.dumps(vector)))
        else:
            conn.execute('''
                INSERT OR REPLACE INTO embeddings (key, node_id, vector, created_at)
                VALUES (?, ?, ?, ?)
            ''', (key, node_id, json.dumps(vector), datetime.now().isoformat()))
        
        count += 1
    
    conn.commit()
    conn.close()
    return count


def import_memory(memory_index_path):
    """Import memory index into state.db."""
    if not Path(memory_index_path).exists():
        return 0
    
    memory_index = json.loads(Path(memory_index_path).read_text())
    
    conn = get_state_conn()
    count = 0
    
    for node_id, memory_ids in memory_index.items():
        if isinstance(memory_ids, list):
            for mem_id in memory_ids:
                conn.execute('''
                    INSERT OR IGNORE INTO memory (node_id, memory_id)
                    VALUES (?, ?)
                ''', (node_id, mem_id))
                count += 1
    
    conn.commit()
    conn.close()
    return count


def get_node_count():
    """Get total node count."""
    conn = get_state_conn()
    cur = conn.execute("SELECT COUNT(*) FROM nodes")
    count = cur.fetchone()[0]
    conn.close()
    return count


def get_all_nodes():
    """Get all nodes."""
    conn = get_state_conn()
    cur = conn.execute("SELECT * FROM nodes")
    nodes = [dict(row) for row in cur.fetchall()]
    conn.close()
    return nodes


def get_all_links():
    """Get all links."""
    conn = get_state_conn()
    cur = conn.execute("SELECT * FROM links")
    links = [dict(row) for row in cur.fetchall()]
    conn.close()
    return links


def get_node_by_id(node_id):
    """Get single node."""
    conn = get_state_conn()
    cur = conn.execute("SELECT * FROM nodes WHERE id = ?", (node_id,))
    row = cur.fetchone()
    node = dict(row) if row else None
    conn.close()
    return node


def search_nodes(term):
    """Search nodes by label and memory items."""
    conn = get_state_conn()
    results = []
    
    # Search in nodes
    cur = conn.execute('''
        SELECT * FROM nodes 
        WHERE label LIKE ? OR norm_label LIKE ? OR display_name LIKE ?
        LIMIT 20
    ''', (f"%{term}%", f"%{term}%", f"%{term}%"))
    results.extend([dict(row) for row in cur.fetchall()])
    
    # Search in memory items (by text and linked_node)
    cur = conn.execute('''
        SELECT DISTINCT n.* FROM nodes n
        JOIN memory_items m ON n.id = m.linked_node
        WHERE m.text LIKE ? OR m.linked_node LIKE ? OR m.tags LIKE ?
        LIMIT 10
    ''', (f"%{term}%", f"%{term}%", f"%{term}%"))
    for row in cur.fetchall():
        node = dict(row)
        if node not in results:
            results.append(node)
    
    conn.close()
    return results[:20]


def get_neighbors(node_id):
    """Get neighboring nodes."""
    conn = get_state_conn()
    
    cur = conn.execute('''
        SELECT n.* FROM nodes n
        JOIN links l ON (l.target = n.id OR l.source = n.id)
        WHERE l.source = ? OR l.target = ?
    ''', (node_id, node_id))
    
    neighbors = [dict(row) for row in cur.fetchall()]
    conn.close()
    return neighbors


def get_memory_for_node(node_id):
    """Get memory IDs for a node."""
    conn = get_state_conn()
    cur = conn.execute("SELECT memory_id FROM memory WHERE node_id = ?", (node_id,))
    memory_ids = [row[0] for row in cur.fetchall()]
    conn.close()
    return memory_ids


def get_memory_items_for_node(node_id):
    """Get full memory items for a node."""
    conn = get_state_conn()
    cur = conn.execute('''
        SELECT id, text, tags, scope, created, linked_node 
        FROM memory_items 
        WHERE linked_node = ?
    ''', (node_id,))
    items = []
    for row in cur.fetchall():
        items.append({
            "id": row[0],
            "text": row[1],
            "tags": json.loads(row[2]) if row[2] else [],
            "scope": row[3],
            "created": row[4],
            "linked_node": row[5]
        })
    conn.close()
    return items


def get_communities():
    """Get community stats with labels."""
    conn = get_state_conn()
    cur = conn.execute('''
        SELECT community, community_name, COUNT(*) as count
        FROM nodes
        GROUP BY community
        ORDER BY count DESC
    ''')
    communities = [{"id": row[0], "label": row[1] or f'C{row[0]}', "count": row[2]} for row in cur.fetchall()]
    conn.close()
    return communities


def node_exists(node_id):
    """Check if node exists in database."""
    conn = get_state_conn()
    cur = conn.execute("SELECT 1 FROM nodes WHERE id = ? LIMIT 1", (node_id,))
    exists = cur.fetchone() is not None
    conn.close()
    return exists


def get_all_memory_items(include_personal=False):
    """Get all memory items, optionally filtered by scope."""
    conn = get_state_conn()
    if include_personal:
        cur = conn.execute('''
            SELECT id, text, tags, scope, created, linked_node
            FROM memory_items
            ORDER BY created DESC
        ''')
    else:
        cur = conn.execute('''
            SELECT id, text, tags, scope, created, linked_node
            FROM memory_items
            WHERE scope = 'work' OR scope IS NULL
            ORDER BY created DESC
        ''')
    items = []
    for row in cur.fetchall():
        items.append({
            "id": row[0],
            "text": row[1],
            "tags": json.loads(row[2]) if row[2] else [],
            "scope": row[3],
            "created": row[4],
            "linked_node": row[5]
        })
    conn.close()
    return items


def search_memory(term, include_personal=False):
    """Search memory items by text, tags, or linked_node."""
    conn = get_state_conn()
    query = '''
        SELECT id, text, tags, scope, created, linked_node
        FROM memory_items
        WHERE (text LIKE ? OR tags LIKE ? OR linked_node LIKE ?)
    '''
    params = (f"%{term}%", f"%{term}%", f"%{term}%")
    
    if not include_personal:
        query += " AND (scope = 'work' OR scope IS NULL)"
    
    cur = conn.execute(query, params)
    items = []
    for row in cur.fetchall():
        items.append({
            "id": row[0],
            "text": row[1],
            "tags": json.loads(row[2]) if row[2] else [],
            "scope": row[3],
            "created": row[4],
            "linked_node": row[5]
        })
    conn.close()
    return items


def add_memory_item(text, tags, scope, linked_node, supersedes=None):
    """Add a memory item to the database."""
    import uuid
    from datetime import datetime
    
    conn = get_state_conn()
    
    item_id = f"ins_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    
    cur = conn.execute('''
        INSERT INTO memory_items (id, text, tags, scope, created, linked_node)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        item_id,
        text,
        json.dumps(tags),
        scope,
        datetime.now().isoformat(),
        linked_node
    ))
    
    conn.execute('''
        INSERT OR IGNORE INTO memory (node_id, memory_id)
        VALUES (?, ?)
    ''', (linked_node, item_id))
    
    conn.commit()
    conn.close()
    
    return item_id


def get_integrated_sources():
    """Get list of integrated sources."""
    conn = get_state_conn()
    cur = conn.execute("SELECT source FROM integrated")
    sources = [row[0] for row in cur.fetchall()]
    conn.close()
    return sources


def add_node(node_data):
    """Add a node."""
    conn = get_state_conn()
    conn.execute('''
        INSERT INTO nodes (id, label, file_type, source_file, community, norm_label, content, display_name, source_location, refs, community_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        node_data.get("id"),
        node_data.get("label"),
        node_data.get("file_type"),
        node_data.get("source_file"),
        node_data.get("community"),
        node_data.get("norm_label"),
        node_data.get("content"),
        node_data.get("display_name"),
        node_data.get("source_location"),
        node_data.get("refs"),
        node_data.get("community_name") or f'C{node_data.get("community", 0)}'
    ))
    conn.commit()
    conn.close()


def add_link(source, target, relation="relates_to", confidence="INFERRED"):
    """Add a link."""
    conn = get_state_conn()
    conn.execute('''
        INSERT OR IGNORE INTO links (source, target, relation, confidence)
        VALUES (?, ?, ?, ?)
    ''', (source, target, relation, confidence))
    conn.commit()
    conn.close()


def add_integrated_source(source):
    """Mark source as integrated."""
    conn = get_state_conn()
    conn.execute('''
        INSERT OR REPLACE INTO integrated (source, integrated_at)
        VALUES (?, ?)
    ''', (source, datetime.now().isoformat()))
    conn.commit()
    conn.close()


def add_embedding(key, node_id, vector):
    """Add embedding to embed.db."""
    conn = get_embed_conn()
    
    has_vec = True
    try:
        conn.execute("SELECT vector FROM embeddings WHERE key = 'test'")
    except:
        has_vec = False
    
    if has_vec:
        conn.execute('''
            INSERT OR REPLACE INTO embeddings (key, node_id, vector)
            VALUES (?, ?, ?)
        ''', (key, node_id, json.dumps(vector)))
    else:
        conn.execute('''
            INSERT OR REPLACE INTO embeddings (key, node_id, vector, created_at)
            VALUES (?, ?, ?, ?)
        ''', (key, node_id, json.dumps(vector), datetime.now().isoformat()))
    
    conn.commit()
    conn.close()


def search_similar_embeddings(query_vector, limit=10):
    """Search similar embeddings using sqlite-vec."""
    conn = get_embed_conn()
    
    has_vec = True
    try:
        conn.execute("SELECT vector FROM embeddings WHERE key = 'test'")
    except:
        has_vec = False
    
    results = []
    
    if has_vec:
        try:
            cur = conn.execute('''
                SELECT e.key, e.node_id, v.distance
                FROM embeddings e
                JOIN vec_top_k('embeddings', 'vector', ?, ?) v ON e.key = v.key
            ''', (json.dumps(query_vector), limit))
            results = [{"key": row[0], "node_id": row[1], "distance": row[2]} for row in cur.fetchall()]
        except Exception as e:
            has_vec = False
    
    if not has_vec:
        cur = conn.execute("SELECT key, node_id, vector FROM embeddings")
        all_emb = []
        for row in cur.fetchall():
            vector = json.loads(row[2])
            all_emb.append((row[0], row[1], vector))
        
        def cosine(a, b):
            dot = sum(x*y for x,y in zip(a,b))
            na = sum(x*x for x in a) ** 0.5
            nb = sum(x*x for x in b) ** 0.5
            return dot / (na * nb + 1e-8)
        
        scored = [(key, node_id, cosine(query_vector, vec)) for key, node_id, vec in all_emb]
        scored.sort(key=lambda x: x[2], reverse=True)
        results = [{"key": k, "node_id": n, "distance": d} for k, n, d in scored[:limit]]
    
    conn.close()
    return results


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "init":
        init_state_db()
        init_embed_db()
        print("✅ Databases initialized")
    elif len(sys.argv) > 1 and sys.argv[1] == "stats":
        nodes = get_node_count()
        print(f"Nodes: {nodes}")
    else:
        print("Usage: db.py init | stats")