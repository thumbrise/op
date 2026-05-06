import { GraphConfigInterface } from '@cosmos.gl/graph'
import { scaleSequential } from 'd3-scale'
import {
  interpolateCool,
  interpolateMagma,
  interpolateViridis,
  interpolateWarm,
} from 'd3-scale-chromatic'

const interpolateRandom = () => {
  const scales = [
    interpolateWarm,
    interpolateViridis,
    interpolateCool,
    interpolateMagma,
  ]
  return scales[Math.floor(Math.random() * scales.length)]
}
export const SPACE_SIZE = 8192
export const COSMOS_CONFIG: Partial<GraphConfigInterface> = {
  spaceSize: SPACE_SIZE,
  backgroundColor: '#2d313a',
  pointDefaultSize: 1,
  pointDefaultColor: '#4B5BBF',
  pointGreyoutOpacity: 0.1,
  scalePointsOnZoom: false,
  linkDefaultWidth: 0.3,
  linkDefaultColor: '#5F74C2',
  linkDefaultArrows: false,
  linkGreyoutOpacity: 0,
  curvedLinks: true,
  renderLinks: true,
  renderHoveredPointRing: true,
  fitViewOnInit: true,
  hoveredPointRingColor: '#4B5BBF',
  enableDrag: true,
  simulationLinkDistance: 1,
  simulationLinkSpring: 0.01,
  simulationRepulsion: 0.5,
  simulationGravity: 10,
  simulationFriction: 0.01,
  simulationDecay: 10000000,
  // rescalePositions: true,
  // initialZoomLevel: INITIAL_ZOOM,
  // simulationCenter: 1.5,
  // simulationCluster: 0.5,
}

export const LAYOUT_CONFIG = {
  communityBaseRadius: 3,
  communityRadiusStep: 20,
  nodeBaseRadius: 20,
  nodeRadiusStep: 50,
  chaosMultiplier: 1.555,
}

export const NODE_CONFIG = {
  baseSize: 1,
  sizeScale: 2,
  selectedSize: 12,
  minSize: 0.2,
  maxSize: 1,
}

export const LINK_STYLING = {
  baseWidth: 0.6,
  widthVariation: 0.2,
  opacity: 0.9,
}

export const SELECTED_COLOR = { r: 1, g: 1, b: 1, a: 1 }

export const createColorScale = (numCommunities: number) =>
  scaleSequential(interpolateWarm).domain([0, numCommunities])

export const createRandomColorScale = () =>
  scaleSequential(interpolateRandom()).domain([0, 16])
