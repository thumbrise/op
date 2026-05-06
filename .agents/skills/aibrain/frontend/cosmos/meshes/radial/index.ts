import type { Node, Link } from '@/lib/types'
import type { MeshData } from '../../types'
import { getRgbaColor } from '@cosmos.gl/graph'
import { scaleSequential } from 'd3-scale'
import { interpolateWarm } from 'd3-scale-chromatic'

export function layout(nodes: Node[], links: Link[], spaceSize: number): MeshData {
  const nClusters = Math.max(...nodes.map((n) => n.community ?? 0)) + 1

  // Оригинальный стиль: random cloud позиции
  const pointPositions = new Float32Array(nodes.length * 2)
  for (let i = 0; i < nodes.length; i++) {
    pointPositions[i * 2] = spaceSize * (0.495 + Math.random() * 0.01)
    pointPositions[i * 2 + 1] = spaceSize * (0.495 + Math.random() * 0.01)
  }

  // Цвета по community
  const colorScale = scaleSequential(interpolateWarm).domain([0, nClusters])
  const pointColors = new Float32Array(nodes.length * 4)
  for (let i = 0; i < nodes.length; i++) {
    const comm = nodes[i].community ?? 0
    const rgba = getRgbaColor(colorScale(comm))
    pointColors[i * 4] = rgba[0]
    pointColors[i * 4 + 1] = rgba[1]
    pointColors[i * 4 + 2] = rgba[2]
    pointColors[i * 4 + 3] = rgba[3]
  }

  // Cluster positions — circle паттерн
  const clusterPositions: number[] = []
  for (let c = 0; c < nClusters; c++) {
    const angle = 15 * Math.PI * (c / nClusters)
    const radius = 10 + c * (1000 / nClusters)
    clusterPositions.push(spaceSize / 2 + Math.cos(angle) * radius)
    clusterPositions.push(spaceSize / 2 + Math.sin(angle) * radius)
  }

  const pointClusters = nodes.map((n) => n.community ?? 0)
  const clusterStrength = new Float32Array(nodes.length).fill(1)

  // Links из базы
  const nodeIndex = new Map(nodes.map((n, i) => [n.id, i]))
  const validLinks = links.filter((l) => nodeIndex.has(l.source) && nodeIndex.has(l.target))
  const linkArr = new Float32Array(validLinks.length * 2)
  validLinks.forEach((l, i) => {
    linkArr[i * 2] = nodeIndex.get(l.source)!
    linkArr[i * 2 + 1] = nodeIndex.get(l.target)!
  })

  // Link colors
  const linkColors = new Float32Array((validLinks.length) * 4)
  const linkWidths = new Float32Array(validLinks.length)
  for (let i = 0; i < validLinks.length; i++) {
    const sourceIdx = linkArr[i * 2]
    linkColors[i * 4] = pointColors[sourceIdx * 4]
    linkColors[i * 4 + 1] = pointColors[sourceIdx * 4 + 1]
    linkColors[i * 4 + 2] = pointColors[sourceIdx * 4 + 2]
    linkColors[i * 4 + 3] = 0.9
    linkWidths[i] = 0.4 + Math.random() * 0.4
  }

  return {
    pointPositions,
    pointColors,
    pointClusters,
    clusterPositions,
    clusterStrength,
    links: linkArr,
    linkColors,
    linkWidths,
  }
}