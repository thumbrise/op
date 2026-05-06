import { LAYOUT_CONFIG } from '@/lib/constants'
import { getRgbaColor } from '@cosmos.gl/graph'
import { scaleLinear, scaleSequential } from 'd3-scale'
import { interpolateWarm } from 'd3-scale-chromatic'

function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function getPositionOnCircle(
  radius: number,
  angle: number,
  center: number
): [number, number] {
  const x = center + radius * Math.cos(angle)
  const y = center + radius * Math.sin(angle)
  return [x, y]
}

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

export function calculateCommunityCenters(
  numCommunities: number,
  spaceSize: number
): Array<number> {
  const result: Array<number> = []
  const centerOffset = spaceSize / 2

  // Random global transformations for variety
  const globalRotation = Math.random() * Math.PI * 2
  const globalRadiusMult = 0.3 + Math.random() * 1.2
  const globalChaos = 100 + Math.random() * 3

  for (let index = 0; index < numCommunities; index++) {
    const angle =
      (index / numCommunities) * Math.PI * 2 +
      globalRotation +
      (Math.random() - 0.5) * 1.2
    const baseRadius =
      LAYOUT_CONFIG.communityBaseRadius * globalRadiusMult +
      index * LAYOUT_CONFIG.communityRadiusStep
    const radius =
      baseRadius + (Math.random() - 0.5) * LAYOUT_CONFIG.communityRadiusStep * 2

    const x =
      Math.cos(angle) * radius +
      centerOffset +
      (Math.random() - 0.5) * globalChaos

    const y =
      Math.sin(angle) * radius +
      centerOffset +
      (Math.random() - 0.5) * globalChaos
    result.push(x, y)
  }
  return result
}

export function generateMeshData(
  nNumbers: number,
  nClusters: number,
  wholeness: number,
  spaceSize: number
): MeshData {
  const radialness = [10, 1000]
  const pointColorScale = scaleSequential(interpolateWarm)
  pointColorScale.domain([0, nClusters])
  const radius = scaleLinear(radialness)
  radius.domain([0, nClusters])

  const pointPositions = new Float32Array(nNumbers * 2)
  const links: number[] = []
  const pointClusters = new Array(nNumbers)
  const clusterPositions = calculateCommunityCenters(nClusters, spaceSize)
  const clusterStrength = new Float32Array(nNumbers)
  const pointColors = new Float32Array(nNumbers * 4)
  const pointSizes = new Float32Array(nNumbers)

  for (let pointIndex = 0; pointIndex < nNumbers; pointIndex += 1) {
    const x = spaceSize * getRandom(0.495, 0.505)
    const y = spaceSize * getRandom(0.495, 0.505)
    pointPositions[pointIndex * 2] = x
    pointPositions[pointIndex * 2 + 1] = y

    clusterStrength[pointIndex] =
      (nClusters - (pointIndex % nClusters)) / nClusters
    const pointColor = pointColorScale(pointIndex % nClusters)
    const rgba = getRgbaColor(pointColor)
    pointColors[pointIndex * 4] = rgba[0]
    pointColors[pointIndex * 4 + 1] = rgba[1]
    pointColors[pointIndex * 4 + 2] = rgba[2]
    pointColors[pointIndex * 4 + 3] = rgba[3]

    pointSizes[pointIndex] = getRandom(1, 5)

    const nextPointIndex = pointIndex + 1
    const bottomPointIndex = pointIndex + nNumbers / 2
    const pointLine = Math.floor(pointIndex / nNumbers / 2)
    const nextPointLine = Math.floor(nextPointIndex / nNumbers / 2)
    const bottomPointLine = Math.floor(bottomPointIndex / nNumbers / 2)

    if (pointLine === nextPointLine && Math.random() < wholeness) {
      links.push(pointIndex)
      links.push(nextPointIndex)
    }

    if (bottomPointLine < nNumbers / 2 && Math.random() < wholeness) {
      links.push(pointIndex)
      links.push(bottomPointIndex)
    }
  }

  const linkColors = new Float32Array((links.length / 2) * 4)
  const linkWidths = new Float32Array(links.length / 2)
  // const linkStrength = new Float32Array(links.length / 2)
  for (let i = 0; i < links.length / 2; i++) {
    const sourcePointIndex = links[i * 2] as number
    const rgba = getRgbaColor(pointColorScale(sourcePointIndex % nClusters))
    linkColors[i * 4 + 0] = rgba[0]
    linkColors[i * 4 + 1] = rgba[1]
    linkColors[i * 4 + 2] = rgba[2]
    linkColors[i * 4 + 3] = 0.9

    linkWidths[i] = getRandom(0.4, 0.8)
    // linkStrength[i] = (n * m - sourcePointIndex) / (n * m)
  }

  return {
    pointPositions,
    pointColors,
    pointSizes,

    links: new Float32Array(links),
    linkColors,
    linkWidths,
    // linkStrength,

    pointClusters,
    clusterStrength,
    clusterPositions,
  }
}
