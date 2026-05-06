import Graph from '@/components/Graph'
import Sidebar from '@/components/Sidebar'
import { getRandomLayout } from '@/cosmos'
import styles from '@/styles/Home.module.css'
import Head from 'next/head'
import { useEffect, useState } from 'react'

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

interface Link {
  source: string
  target: string
  relation: string
  confidence: string
}

interface Community {
  id: number
  label: string
  count: number
}

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [layoutName, setLayoutName] = useState<string>(getRandomLayout())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [graphRes, statsRes] = await Promise.all([
          fetch('/api/graph'),
          fetch('/api/stats'),
        ])
        const graphData = await graphRes.json()
        const statsData = await statsRes.json()
        setNodes(graphData.nodes)
        setLinks(graphData.links)
        setCommunities(statsData.communities)
      } catch (e) {
        console.error('Failed to load data:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className={styles.loading}>
        <span>Loading knowledge graph...</span>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Knowledge Graph</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.graph}>
          <Graph
            nodes={nodes}
            links={links}
            communities={communities}
            onNodeClick={setSelectedNode}
            selectedNode={selectedNode}
            layoutName={layoutName}
          />
        </div>
        <Sidebar
          nodes={nodes}
          links={links}
          communities={communities}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
          layoutName={layoutName}
          onLayoutChange={setLayoutName}
        />
      </main>
    </>
  )
}
