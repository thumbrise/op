import type { VizNode, VizLink } from './types'

export interface NodePosition {
  id: string
  x: number
  y: number
}

export interface LayoutBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  height: number
}

export interface ClusterInfo {
  id: number
  x: number
  y: number
  radius: number
  name: string
}

// Константы формул
const NODE_SIZE = 12 // размер узла в пикселях
const CLUSTER_SPREAD_FACTOR = 1.5 // коэффициент радиуса: R = D * sqrt(N) * factor
const CLUSTER_GAP = 8 // минимальный gap между кластерами (4 * D)
const CLUSTER_FIRST_RING_RADIUS = 500 // радиус первого кольца кластеров
const CLUSTERS_PER_RING = 6 // количество кластеров в кольце
const VIRTUAL_CENTER = 10 // центр виртуального пространства
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)) // 2.399 rad - угол для Fibonacci spiral

export interface LayoutResult {
  positions: NodePosition[]
  bounds: LayoutBounds
  clusters: ClusterInfo[]
}

export function computeLayout(nodes: VizNode[], links: VizLink[]): LayoutResult {
  const clusters = computeClusters(nodes)
  const positions = computeNodePositions(nodes, clusters)
  const bounds = computeBounds(positions)

  return { positions, bounds, clusters }
}

function computeClusters(nodes: VizNode[]): ClusterInfo[] {
  const communityGroups = groupByCommunity(nodes)
  const communityIds = Object.keys(communityGroups).map(Number).sort((a, b) => a - b)

  const clusters: ClusterInfo[] = communityIds.map((commId) => {
    const nodeCount = communityGroups[commId].length
    const clusterRadius = computeClusterRadius(nodeCount)

    return {
      id: commId,
      x: 0,
      y: 0,
      radius: clusterRadius,
      name: communityGroups[commId][0]?.community_name || `C${commId}`,
    }
  })

  placeClusters(clusters)

  return clusters
}

function computeClusterRadius(nodeCount: number): number {
  // R = D * sqrt(N) * SPREAD_FACTOR с ограничением max 200px
  const R = NODE_SIZE * Math.sqrt(nodeCount) * CLUSTER_SPREAD_FACTOR
  return Math.min(R, 200)
}

function placeClusters(clusters: ClusterInfo[]): void {
  if (clusters.length === 0) return

  const ringRadius = (clusters: ClusterInfo[]) => {
    let maxRadius = 0
    clusters.forEach(c => {
      const dist = Math.sqrt(c.x * c.x + c.y * c.y)
      if (dist + c.radius > maxRadius) maxRadius = dist + c.radius
    })
    return maxRadius
  }

  clusters.forEach((cluster, i) => {
    const ring = Math.floor(i / CLUSTERS_PER_RING)
    const posInRing = i % CLUSTERS_PER_RING
    const ringAngleOffset = ring * 0.5

    const baseRadius = ring === 0 ? CLUSTER_FIRST_RING_RADIUS : ringRadius(clusters.slice(0, i)) + CLUSTER_GAP
    const angle = (posInRing / CLUSTERS_PER_RING) * Math.PI * 2 + ringAngleOffset

    cluster.x = VIRTUAL_CENTER + Math.cos(angle) * baseRadius
    cluster.y = VIRTUAL_CENTER + Math.sin(angle) * baseRadius
  })
}

function computeNodePositions(nodes: VizNode[], clusters: ClusterInfo[]): NodePosition[] {
  const clusterMap = new Map(clusters.map(c => [c.id, c]))

  return nodes.map((node) => {
    const cluster = clusterMap.get(node.community)
    if (!cluster) {
      return { id: node.id, x: VIRTUAL_CENTER, y: VIRTUAL_CENTER }
    }

    const nodesInCluster = nodes.filter(n => n.community === node.community)
    const nodeIndex = nodesInCluster.findIndex(n => n.id === node.id)

    // Fibonacci spiral: r = sqrt(i/N) * R, theta = i * goldenAngle
    const r = Math.sqrt(nodeIndex / nodesInCluster.length) * (cluster.radius - NODE_SIZE / 2)
    const theta = nodeIndex * GOLDEN_ANGLE

    return {
      id: node.id,
      x: cluster.x + Math.cos(theta) * r,
      y: cluster.y + Math.sin(theta) * r,
    }
  })
}

function groupByCommunity(nodes: VizNode[]): Record<number, VizNode[]> {
  const groups: Record<number, VizNode[]> = {}
  nodes.forEach((n) => {
    const comm = n.community ?? 0
    if (!groups[comm]) groups[comm] = []
    groups[comm].push(n)
  })
  return groups
}

function computeBounds(positions: NodePosition[]): LayoutBounds {
  if (positions.length === 0) {
    return { minX: 800, maxX: 1200, minY: 800, maxY: 1200, width: 400, height: 400 }
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity

  positions.forEach((p) => {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  })

  const padding = 100
  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minY: minY - padding,
    maxY: maxY + padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  }
}

export function addJitter(
  positions: NodePosition[],
  frame: number,
  maxJitter: number
): NodePosition[] {
  if (frame === 0) return positions

  return positions.map((pos) => ({
    ...pos,
    x: pos.x + (Math.random() - 0.5) * maxJitter,
    y: pos.y + (Math.random() - 0.5) * maxJitter,
  }))
}