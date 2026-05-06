import { MemoryItem } from '@/lib/python'
import styles from '@/styles/Sidebar.module.css'
import { useCallback, useEffect, useState } from 'react'

interface Link {
  source: string
  target: string
  relation: string
  confidence: string
}

interface Node {
  id: string
  label: string
  file_type: string
  source_file: string
  community: number
  community_name?: string
  display_name?: string
  source_location?: string
  refs?: string
}

interface Community {
  id: number
  label: string
  count: number
}

interface SidebarProps {
  nodes: Node[]
  links: Link[]
  communities: Community[]
  selectedNode: Node | null
  onNodeSelect: (node: Node | null) => void
  layoutName: string
  onLayoutChange: (name: string) => void
}

const COLORS = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#06b6d4',
  '#84cc16',
  '#d946ef',
  '#22c55e',
  '#eab308',
  '#0ea5e9',
  '#a855f7',
  '#10981a',
]

export default function Sidebar({
  nodes,
  links,
  communities,
  selectedNode,
  onNodeSelect,
  layoutName,
  onLayoutChange,
}: SidebarProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Node[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [nodeMemory, setNodeMemory] = useState<MemoryItem[]>([])
  const [memoryLoading, setMemoryLoading] = useState(false)

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([])
      setShowResults(false)
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.slice(0, 10))
      setShowResults(true)
    } catch (e) {
      console.error('Search error:', e)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search, handleSearch])

  useEffect(() => {
    async function loadMemory() {
      if (!selectedNode) {
        setNodeMemory([])
        return
      }
      setMemoryLoading(true)
      try {
        const res = await fetch(
          `/api/memory?nodeId=${encodeURIComponent(selectedNode.id)}`
        )
        const data = await res.json()
        setNodeMemory(data)
      } catch (e) {
        console.error('Memory load error:', e)
        setNodeMemory([])
      } finally {
        setMemoryLoading(false)
      }
    }
    loadMemory()
  }, [selectedNode])

  const communityLabel = (node: Node) => {
    return node.community_name || `C${node.community}`
  }

  const getNodeLabel = (node: Node) => {
    return node.display_name || node.label
  }

  const parseRefs = (refsJson: string | undefined): string[] => {
    if (!refsJson) return []
    try {
      return JSON.parse(refsJson)
    } catch {
      return []
    }
  }

  return (
    <aside className={styles.sidebar}>
      <input
        type="text"
        className={styles.search}
        placeholder="Search nodes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className={styles.search}
        value={layoutName}
        onChange={(e) => onLayoutChange(e.target.value)}
        style={{ marginTop: '8px' }}
      >
        <option value="grid">Grid</option>
        <option value="chain">Chain</option>
        <option value="radial">Radial</option>
      </select>

      {showResults && (
        <div className={styles.results}>
          {searchLoading && (
            <div className={styles.resultItem}>Searching...</div>
          )}
          {!searchLoading && results.length === 0 && (
            <div className={styles.resultItem}>No results found</div>
          )}
          {!searchLoading &&
            results.map((node) => (
              <div
                key={node.id}
                className={styles.resultItem}
                onClick={() => {
                  onNodeSelect(node)
                  setShowResults(false)
                  setSearch('')
                }}
              >
                <span className={styles.resultLabel}>{getNodeLabel(node)}</span>
                <span className={styles.resultCommunity}>
                  {communityLabel(node)}
                </span>
              </div>
            ))}
        </div>
      )}

      {selectedNode && (
        <div className={styles.info}>
          <h3>Selected Node</h3>
          <div className={styles.field}>
            <b>ID:</b> <span>{selectedNode.id}</span>
          </div>
          <div className={styles.field}>
            <b>Name:</b> <span>{getNodeLabel(selectedNode)}</span>
          </div>
          <div className={styles.field}>
            <b>Community:</b> <span>{communityLabel(selectedNode)}</span>
          </div>
          <div className={styles.field}>
            <b>Type:</b> <span>{selectedNode.file_type || '-'}</span>
          </div>
          <div className={styles.field}>
            <b>Source:</b> <span>{selectedNode.source_file || '-'}</span>
          </div>
          {selectedNode.source_location && (
            <div className={styles.field}>
              <b>Location:</b> <span>{selectedNode.source_location}</span>
            </div>
          )}

          {memoryLoading && (
            <div className={styles.field}>
              <b>Memory:</b> <span>Loading...</span>
            </div>
          )}

          {!memoryLoading && nodeMemory.length > 0 && (
            <div className={styles.memorySection}>
              <b>Memory ({nodeMemory.length})</b>
              {nodeMemory.map((m) => (
                <div key={m.id} className={styles.memoryItem}>
                  <div className={styles.memoryText}>{m.text}</div>
                  <div className={styles.memoryMeta}>
                    {m.tags?.map((t) => (
                      <span key={t} className={styles.memoryTag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedNode.refs && (
            <div className={styles.field}>
              <b>References:</b>
              <div className={styles.refsList}>
                {parseRefs(selectedNode.refs).map((ref, i) => (
                  <span key={i} className={styles.refItem}>
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            className={styles.clearBtn}
            onClick={() => onNodeSelect(null)}
          >
            Clear
          </button>
        </div>
      )}

      <div className={styles.legend}>
        <h3>Communities</h3>
        {communities.map((c) => (
          <div
            key={c.id}
            className={styles.legendItem}
            onClick={() => {
              const node = nodes.find((n) => n.community === c.id)
              if (node) onNodeSelect(node)
            }}
          >
            <span
              className={styles.legendDot}
              style={{ backgroundColor: COLORS[c.id % COLORS.length] }}
            />
            <span className={styles.legendLabel}>{c.label}</span>
            <span className={styles.legendCount}>{c.count}</span>
          </div>
        ))}
      </div>

      <div className={styles.stats}>
        {(nodes || []).length} nodes · {(links || []).length} links
      </div>
    </aside>
  )
}
