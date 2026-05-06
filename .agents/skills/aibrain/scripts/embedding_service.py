#!/usr/bin/env python3
"""
Embedding service - encapsulates Ollama API for embeddings.
"""

import json
import urllib.request
import urllib.error
from pathlib import Path

EMBEDDING_MODEL = "snowflake-arctic-embed2:568m-l-fp16"
OLLAMA_URL = "http://localhost:11434"


def get_embedding(text, retry=3):
    """
    Get embedding vector from Ollama API.
    
    Args:
        text: Input text to embed (truncated to 2000 chars)
        retry: Number of retry attempts on failure
    
    Returns:
        List of floats (embedding vector) or None on failure
    """
    for attempt in range(retry):
        try:
            data = json.dumps({
                "model": EMBEDDING_MODEL,
                "prompt": text[:2000]
            }).encode()
            
            req = urllib.request.Request(
                f"{OLLAMA_URL}/api/embeddings",
                data=data,
                headers={"Content-Type": "application/json"}
            )
            
            with urllib.request.urlopen(req, timeout=30) as r:
                result = json.loads(r.read())
                return result["embedding"]
                
        except urllib.error.URLError as e:
            if attempt < retry - 1:
                continue
            print(f"ERROR: Could not get embedding: {e}")
            return None
    
    return None


def is_english(text):
    """
    Check if text is primarily English (ASCII letters).
    
    Args:
        text: Input text to check
    
    Returns:
        True if text is primarily English
    """
    ascii_letters = sum(1 for c in text if c.isalpha() and ord(c) < 128)
    total_letters = sum(1 for c in text if c.isalpha())
    
    if total_letters == 0:
        return True
    
    return ascii_letters / total_letters > 0.8


def cosine_similarity(a, b):
    """
    Compute cosine similarity between two vectors.
    
    Args:
        a: First vector (list of floats)
        b: Second vector (list of floats)
    
    Returns:
        Cosine similarity score (0 to 1)
    """
    if not a or not b:
        return 0.0
    
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(x * x for x in b) ** 0.5
    
    return dot / (norm_a * norm_b + 1e-8)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: embedding_service.py \"text to embed\"")
        sys.exit(1)
    
    text = " ".join(sys.argv[1:])
    embedding = get_embedding(text)
    
    if embedding:
        print(f"Embedding dimension: {len(embedding)}")
        print(f"First 5 values: {embedding[:5]}")
    else:
        print("Failed to get embedding")
        sys.exit(1)