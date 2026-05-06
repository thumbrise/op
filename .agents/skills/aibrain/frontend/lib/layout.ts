import {
  createColorScale,
  createRandomColorScale,
  LAYOUT_CONFIG,
  LINK_STYLING,
  NODE_CONFIG,
  SELECTED_COLOR,
} from './constants'
import { Link, Node, NodeDegreeMap } from './types'
export type MeshData = {
  pointPositions: Float32Array
  pointColors: Float32Array
  pointSizes: Float32Array

  links: Float32Array
  linkColors: Float32Array
  linkWidths: Float32Array
  // linkStrength: Float32Array;

  pointClusters: number[]
  clusterPositions: number[]
  clusterStrength: Float32Array
}
function colorToRgba(color: string): [number, number, number, number] {
  if (color.startsWith('#')) {
    if (color.length === 4) {
      const r = parseInt(color[1] + color[1], 16) / 255
      const g = parseInt(color[2] + color[2], 16) / 255
      const b = parseInt(color[3] + color[3], 16) / 255
      return [r, g, b, 1]
    }
    if (color.length === 7) {
      const r = parseInt(color.slice(1, 3), 16) / 255
      const g = parseInt(color.slice(3, 5), 16) / 255
      const b = parseInt(color.slice(5, 7), 16) / 255
      return [r, g, b, 1]
    }
  }

  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]) / 255,
      parseInt(rgbMatch[2]) / 255,
      parseInt(rgbMatch[3]) / 255,
      1,
    ]
  }

  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
  if (rgbaMatch) {
    return [
      parseInt(rgbaMatch[1]) / 255,
      parseInt(rgbaMatch[2]) / 255,
      parseInt(rgbaMatch[3]) / 255,
      parseFloat(rgbaMatch[4]),
    ]
  }

  return [1, 1, 1, 1]
}

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function calculateDegree(nodes: Node[], links: Link[]): NodeDegreeMap {
  const degree: NodeDegreeMap = {}
  links.forEach((l) => {
    degree[l.source] = (degree[l.source] || 0) + 1
    degree[l.target] = (degree[l.target] || 0) + 1
  })
  return degree
}

export function calculateCommunityCenters(
  numCommunities: number,
  spaceSize: number
): Record<number, { x: number; y: number }> {
  const centers: Record<number, { x: number; y: number }> = {}

  const centerOffset = spaceSize / 2

  // MAXIMUM ENTROPY: Shuffle community IDs before placement
  const shuffledIds = shuffleArray(
    Array.from({ length: numCommunities }, (_, i) => i)
  )

  // Random global transformations for variety
  const globalRotation = Math.random() * Math.PI * 2
  const globalRadiusMult = 0.3 + Math.random() * 1.2
  const globalChaos = 100 + Math.random() * 3

  shuffledIds.forEach((originalId, shuffledIndex) => {
    const angle =
      (shuffledIndex / numCommunities) * Math.PI * 2 +
      globalRotation +
      (Math.random() - 0.5) * 1.2
    const baseRadius =
      LAYOUT_CONFIG.communityBaseRadius * globalRadiusMult +
      shuffledIndex * LAYOUT_CONFIG.communityRadiusStep
    const radius =
      baseRadius + (Math.random() - 0.5) * LAYOUT_CONFIG.communityRadiusStep * 2

    centers[originalId] = {
      x:
        Math.cos(angle) * radius +
        centerOffset +
        (Math.random() - 0.5) * globalChaos,
      y:
        Math.sin(angle) * radius +
        centerOffset +
        (Math.random() - 0.5) * globalChaos,
    }
  })
  return centers
}

export function groupNodesByCommunity(nodes: Node[]): Record<number, Node[]> {
  const grouped: Record<number, Node[]> = {}
  nodes.forEach((n) => {
    const comm = n.community ?? 0
    if (!grouped[comm]) grouped[comm] = []
    grouped[comm].push(n)
  })
  return grouped
}
function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min
}
export function calculateNodePositions(
  nodes: Node[],
  spaceSize: number
): Float32Array {
  const pointPositions = new Float32Array(nodes.length * 2)
  nodes.forEach((n, pointIndex) => {
    const x = spaceSize * getRandom(0.495, 0.505)
    const y = spaceSize * getRandom(0.495, 0.505)
    pointPositions[pointIndex * 2] = x
    pointPositions[pointIndex * 2 + 1] = y
  })

  return pointPositions
}

export function calculateNodeColors(
  nodes: Node[],
  selectedNodeId?: string | null,
  numCommunities: number = 16
): Float32Array {
  // RANDOM color scale on each load
  const useRandomScale = Math.random() > 0.3
  const colorScale = useRandomScale
    ? createRandomColorScale()
    : createColorScale(numCommunities)

  const colors = new Float32Array(nodes.length * 4)

  nodes.forEach((n, i) => {
    const comm = n.community ?? 0
    const colorStr = colorScale(comm) as string
    const color =
      n.id === selectedNodeId
        ? [
            SELECTED_COLOR.r,
            SELECTED_COLOR.g,
            SELECTED_COLOR.b,
            SELECTED_COLOR.a,
          ]
        : colorToRgba(colorStr)

    colors[i * 4] = color[0]
    colors[i * 4 + 1] = color[1]
    colors[i * 4 + 2] = color[2]
    colors[i * 4 + 3] = color[3]
  })

  return colors
}

export function calculateNodeSizes(
  nodes: Node[],
  degree: NodeDegreeMap,
  selectedNodeId?: string | null
): Float32Array {
  const sizes = new Float32Array(nodes.length)

  nodes.forEach((n, i) => {
    const d = degree[n.id] || 0
    if (n.id === selectedNodeId) {
      sizes[i] = NODE_CONFIG.selectedSize
    } else {
      // More chaotic size variation
      const baseSize =
        NODE_CONFIG.baseSize + Math.sqrt(d) * NODE_CONFIG.sizeScale
      const variance =
        Math.random() * (NODE_CONFIG.maxSize - NODE_CONFIG.minSize) +
        NODE_CONFIG.minSize
      sizes[i] = (baseSize + variance) / 2 + (Math.random() - 0.5) * 2
    }
  })

  return sizes
}

export function calculateNodeClusters(nodes: Node[]): (number | undefined)[] {
  return nodes.map((n) => n.community ?? 0)
}

export function calculateLinks(
  links: Link[],
  nodeMap: Map<string, number>
): Float32Array {
  const validLinks = links.filter(
    (l) => nodeMap.has(l.source) && nodeMap.has(l.target)
  )
  const linkArr = new Float32Array(validLinks.length * 2)

  validLinks.forEach((l, i) => {
    linkArr[i * 2] = nodeMap.get(l.source)!
    linkArr[i * 2 + 1] = nodeMap.get(l.target)!
  })

  return linkArr
}

export function calculateLinkColors(
  linkArray: Float32Array,
  nodeColors: Float32Array
): Float32Array {
  const linkCount = linkArray.length / 2
  const colors = new Float32Array(linkCount * 4)

  for (let i = 0; i < linkCount; i++) {
    const sourceIndex = linkArray[i * 2]
    const rgba = {
      r: nodeColors[sourceIndex * 4],
      g: nodeColors[sourceIndex * 4 + 1],
      b: nodeColors[sourceIndex * 4 + 2],
      a: LINK_STYLING.opacity,
    }

    colors[i * 4] = rgba.r
    colors[i * 4 + 1] = rgba.g
    colors[i * 4 + 2] = rgba.b
    colors[i * 4 + 3] = rgba.a
  }

  return colors
}

export function calculateLinkWidths(linkCount: number): Float32Array {
  const widths = new Float32Array(linkCount)

  for (let i = 0; i < linkCount; i++) {
    widths[i] =
      LINK_STYLING.baseWidth + Math.random() * LINK_STYLING.widthVariation
  }

  return widths
}

export function calculateClusterPositions(
  communityCenters: Record<number, { x: number; y: number }>,
  numCommunities: number
): (number | undefined)[] {
  const positions: (number | undefined)[] = []

  for (let c = 0; c < numCommunities; c++) {
    const center = communityCenters[c]
    positions[c * 2] = center?.x ?? (Math.random() - 0.5) * 400
    positions[c * 2 + 1] = center?.y ?? (Math.random() - 0.5) * 400
  }

  return positions
}

export function calculateClusterStrength(nodes: Node[]): Float32Array {
  return new Float32Array(nodes.length).fill(10)
}

export function createNodeMap(nodes: Node[]): Map<string, number> {
  const map = new Map<string, number>()
  nodes.forEach((n, i) => map.set(n.id, i))
  return map
}
