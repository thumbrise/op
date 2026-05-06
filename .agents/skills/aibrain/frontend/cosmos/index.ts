import type { Link, Node } from '@/lib/types'
import { getRgbaColor } from '@cosmos.gl/graph'
import { scaleSequential } from 'd3-scale'
import { interpolateWarm } from 'd3-scale-chromatic'
import { layout as grid } from './meshes/grid'
import { layout as chain } from './meshes/chain'
import { layout as radial } from './meshes/radial'
import type { LayoutFn } from './types'

export const layouts: Record<string, LayoutFn> = {
  grid,
  chain,
  radial,
}

export const layoutNames = Object.keys(layouts)

export function getRandomLayout(): string {
  return layoutNames[Math.floor(Math.random() * layoutNames.length)]
}

export interface CosmosData {
  pointPositions: Float32Array
  pointColors: Float32Array
  pointSizes: Float32Array
  links: Float32Array
  linkColors: Float32Array
  linkWidths: Float32Array
  pointClusters: number[]
  clusterPositions: number[]
  clusterStrength: Float32Array
}

export function prepareData(
  nodes: Node[],
  links: Link[],
  layout: LayoutFn,
  spaceSize: number,
  selectedNodeId: string | null
): CosmosData {
  const { pointPositions, pointClusters, clusterPositions } = layout(nodes, links, spaceSize)
  const nodeCount = nodes.length

  const colorScale = scaleSequential(interpolateWarm).domain([0, 16])
  const pointColors = new Float32Array(nodeCount * 4)
  const pointSizes = new Float32Array(nodeCount)

  const degree = calcDegree(nodes, links)

  nodes.forEach((node, i) => {
    const isSelected = node.id === selectedNodeId
    const comm = node.community ?? 0
    const color = isSelected ? [1, 1, 1, 1] : toRgba(colorScale(comm as number))

    pointColors[i * 4] = color[0]
    pointColors[i * 4 + 1] = color[1]
    pointColors[i * 4 + 2] = color[2]
    pointColors[i * 4 + 3] = color[3]

    pointSizes[i] = isSelected
      ? 8
      : Math.min(1 + Math.sqrt(degree[node.id] || 0), 4)
  })

  const linkArr = buildLinkArray(links, nodes)
  const linkColors = new Float32Array((linkArr.length / 2) * 4)
  const linkWidths = new Float32Array(linkArr.length / 2)

  for (let i = 0; i < linkArr.length / 2; i++) {
    const sourceIdx = linkArr[i * 2]
    linkColors[i * 4] = pointColors[sourceIdx * 4]
    linkColors[i * 4 + 1] = pointColors[sourceIdx * 4 + 1]
    linkColors[i * 4 + 2] = pointColors[sourceIdx * 4 + 2]
    linkColors[i * 4 + 3] = 0.7
    linkWidths[i] = 0.3
  }

  const clusterPositionsFinal = clusterPositions || calcClusterPositionsFallback(nodes, spaceSize)
  const clusterStrength = new Float32Array(nodeCount).fill(10)

  return {
    pointPositions,
    pointColors,
    pointSizes,
    links: linkArr,
    linkColors,
    linkWidths,
    pointClusters,
    clusterPositions: clusterPositionsFinal,
    clusterStrength,
  }
}

function calcDegree(nodes: Node[], links: Link[]) {
  const degree: Record<string, number> = {}
  links.forEach((l) => {
    degree[l.source] = (degree[l.source] || 0) + 1
    degree[l.target] = (degree[l.target] || 0) + 1
  })
  return degree
}

function buildLinkArray(links: Link[], nodes: Node[]) {
  const nodeIndex = new Map(nodes.map((n, i) => [n.id, i]))
  const valid = links.filter(
    (l) => nodeIndex.has(l.source) && nodeIndex.has(l.target)
  )
  const arr = new Float32Array(valid.length * 2)
  valid.forEach((l, i) => {
    arr[i * 2] = nodeIndex.get(l.source)!
    arr[i * 2 + 1] = nodeIndex.get(l.target)!
  })
  return arr
}

function calcClusterPositionsFallback(nodes: Node[], spaceSize: number) {
  const communities = new Set(nodes.map((n) => n.community ?? 0))
  const positions: number[] = []
  const center = spaceSize / 2

  Array.from(communities)
    .sort((a, b) => a - b)
    .forEach((comm, i) => {
      const angle = (i / communities.size) * Math.PI * 2
      const radius = 150 + comm * 30
      positions.push(Math.cos(angle) * radius + center)
      positions.push(Math.sin(angle) * radius + center)
    })

  return positions
}

function toRgba(color: string): [number, number, number, number] {
  const rgba = getRgbaColor(color)
  return [rgba[0], rgba[1], rgba[2], rgba[3]]
}
