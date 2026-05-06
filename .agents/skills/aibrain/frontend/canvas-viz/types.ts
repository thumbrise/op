export interface VizNode {
  id: string
  label: string
  community: number
  community_name?: string
  x?: number
  y?: number
}

export interface VizLink {
  source: string
  target: string
}

export interface VizConfig {
  width: number
  height: number
  nodeSize: number
  nodeSpacing: number
  colors: string[]
  animationFrames: number
  animationDelay: number
}

export interface CanvasVizEvents {
  click: (node: VizNode) => void
  hover: (node: VizNode | null) => void
}