import type { Link, Node } from '@/lib/types'

export type MeshData = {
  pointPositions: Float32Array
  pointColors: Float32Array
  pointClusters: number[]
  clusterPositions: number[]
  clusterStrength: Float32Array
  links: Float32Array
  linkColors: Float32Array
  linkWidths: Float32Array
}

export type LayoutFn = (
  nodes: Node[],
  links: Link[],
  spaceSize: number
) => MeshData