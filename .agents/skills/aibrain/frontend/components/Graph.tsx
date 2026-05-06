import styles from '@/styles/Graph.module.css'
import { useEffect, useRef } from 'react'
import { CanvasRenderer, type VizNode, type VizLink } from '@/canvas-viz'
import { GraphProps } from '@/lib/types'

interface GraphExtProps extends GraphProps {
  layoutName?: string
}

export default function Graph({
  nodes,
  links,
  communities,
  onNodeClick,
  selectedNode,
}: GraphExtProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const vizRef = useRef<CanvasRenderer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    vizRef.current = new CanvasRenderer(containerRef.current, {
      nodeSize: 12,
      animationFrames: 2,
      animationDelay: 500,
    })

    const vizNodes: VizNode[] = nodes.map((n) => ({
      id: n.id,
      label: n.display_name || n.label,
      community: n.community ?? 0,
      community_name: n.community_name || `C${n.community}`,
    }))

    const vizLinks: VizLink[] = links.map((l) => ({
      source: l.source,
      target: l.target,
    }))

    vizRef.current.setNodes(vizNodes, selectedNode?.id ?? null)
    vizRef.current.setLinks(vizLinks)
    vizRef.current.render()
    vizRef.current.startAnimation()

    vizRef.current.on('click', (node) => {
      if (!node) return
      const found = nodes.find((n) => n.id === node.id)
      if (found) onNodeClick(found)
    })

    return () => {
      vizRef.current?.destroy()
      vizRef.current = null
    }
  }, [nodes.length, links.length])

  useEffect(() => {
    if (vizRef.current) {
      vizRef.current.setNodes(nodes.map((n) => ({
        id: n.id,
        label: n.display_name || n.label,
        community: n.community ?? 0,
        community_name: n.community_name || `C${n.community}`,
      })), selectedNode?.id ?? null)
      vizRef.current.render()
    }
  }, [selectedNode?.id, nodes])

  return <div ref={containerRef} className={styles.container} />
}