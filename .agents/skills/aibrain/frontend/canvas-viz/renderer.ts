import type { VizNode, VizLink, VizConfig } from './types'
import { computeLayout, addJitter, type NodePosition, type ClusterInfo, type LayoutBounds } from './physics'

const DEFAULT_PALETTE = [
  '#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1',
  '#5f27cd', '#ff9ff3', '#54a0ff', '#00d2d3',
  '#ff9f43', '#ee5a24', '#009432', '#833471',
  '#1289A7', '#FDA7DF', '#D980FA', '#B53471',
]

const DEFAULT_CONFIG: VizConfig = {
  width: 800,
  height: 600,
  nodeSize: 12,
  nodeSpacing: 20,
  colors: DEFAULT_PALETTE,
  animationFrames: 2,
  animationDelay: 500,
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private nodes: VizNode[] = []
  private links: VizLink[] = []
  private positions: NodePosition[] = []
  private clusters: ClusterInfo[] = []
  private bounds: LayoutBounds = { minX: 800, maxX: 1200, minY: 800, maxY: 1200, width: 400, height: 400 }
  private config: VizConfig

  private scale = 1
  private offsetX = 0
  private offsetY = 0
  private selectedId: string | null = null
  private hoveredId: string | null = null
  private currentFrame = 0
  private animationTimer: number | null = null

  private isDragging = false
  private lastMouseX = 0
  private lastMouseY = 0

  private onClickCallback: ((node: VizNode) => void) | null = null
  private onHoverCallback: ((node: VizNode | null) => void) | null = null

  constructor(container: string | HTMLElement, config: Partial<VizConfig> = {}) {
    const element = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container

    if (!element) throw new Error('Container not found')

    this.config = { ...DEFAULT_CONFIG, ...config }

    const rect = element.getBoundingClientRect()
    const width = config.width || rect.width || 800
    const height = config.height || rect.height || 600

    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.canvas.style.background = '#1a1a2e'
    this.canvas.style.display = 'block'
    this.canvas.style.cursor = 'grab'
    element.appendChild(this.canvas)

    this.ctx = this.canvas.getContext('2d')!

    this.canvas.addEventListener('click', this.handleClick.bind(this))
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false })
  }

  setNodes(nodes: VizNode[], selectedId?: string | null): void {
    this.nodes = nodes
    this.selectedId = selectedId ?? null
    this.recomputeLayout()
    this.fitToView()
  }

  setLinks(links: VizLink[]): void {
    this.links = links
  }

  private recomputeLayout(): void {
    const result = computeLayout(this.nodes, this.links)
    this.positions = result.positions
    this.clusters = result.clusters
    this.bounds = result.bounds
  }

  private fitToView(): void {
    const padding = 50
    const scaleX = (this.canvas.width - padding * 2) / this.bounds.width
    const scaleY = (this.canvas.height - padding * 2) / this.bounds.height
    this.scale = Math.min(scaleX, scaleY)

    const centerX = (this.bounds.minX + this.bounds.maxX) / 2
    const centerY = (this.bounds.minY + this.bounds.maxY) / 2

    this.offsetX = this.canvas.width / 2 - centerX * this.scale
    this.offsetY = this.canvas.height / 2 - centerY * this.scale
  }

  render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawClusterLabels()
    this.drawLinks()
    this.drawNodes()
    this.drawSelectedLabel()
  }

  private toCanvas(x: number, y: number): { x: number; y: number } {
    return {
      x: x * this.scale + this.offsetX,
      y: y * this.scale + this.offsetY,
    }
  }

  private fromCanvas(x: number, y: number): { x: number; y: number } {
    return {
      x: (x - this.offsetX) / this.scale,
      y: (y - this.offsetY) / this.scale,
    }
  }

  private drawClusterLabels(): void {
    this.ctx.font = `${12 * this.scale}px monospace`
    this.ctx.textAlign = 'center'

    this.clusters.forEach((cluster) => {
      const canvasPos = this.toCanvas(cluster.x, cluster.y)
      const labelY = canvasPos.y - cluster.radius * this.scale - 10 * this.scale

      this.ctx.fillStyle = '#888888'
      this.ctx.fillText(cluster.name, canvasPos.x, labelY)
    })
  }

  private drawNodes(): void {
    const framePositions = addJitter(this.positions, this.currentFrame, 2)

    framePositions.forEach((pos, i) => {
      const node = this.nodes[i]
      if (!node) return

      const canvasPos = this.toCanvas(pos.x, pos.y)
      const isSelected = node.id === this.selectedId
      const isHovered = node.id === this.hoveredId
      const baseSize = this.config.nodeSize * this.scale
      const size = isSelected ? baseSize * 2 : isHovered ? baseSize * 1.5 : baseSize

      const color = isSelected ? '#ffffff' : this.config.colors[node.community % this.config.colors.length]

      this.ctx.fillStyle = color
      this.ctx.fillRect(canvasPos.x - size / 2, canvasPos.y - size / 2, size, size)
    })
  }

  private drawSelectedLabel(): void {
    if (!this.selectedId) return

    const idx = this.nodes.findIndex(n => n.id === this.selectedId)
    if (idx === -1) return

    const pos = this.positions[idx]
    const node = this.nodes[idx]
    if (!pos || !node) return

    const canvasPos = this.toCanvas(pos.x, pos.y)
    const size = this.config.nodeSize * 2 * this.scale
    const labelX = canvasPos.x + size / 2 + 8
    const labelY = canvasPos.y + 4

    this.ctx.font = `${14 * this.scale}px monospace`
    this.ctx.fillStyle = '#ffffff'
    this.ctx.textAlign = 'left'
    this.ctx.fillText(node.label || node.id, labelX, labelY)
  }

  private drawLinks(): void {
    const nodePosMap = new Map(this.positions.map((p) => [p.id, p]))

    this.links.forEach((link) => {
      const source = nodePosMap.get(link.source)
      const target = nodePosMap.get(link.target)
      if (!source || !target) return

      const sourceCanvas = this.toCanvas(source.x, source.y)
      const targetCanvas = this.toCanvas(target.x, target.y)

      const sourceNode = this.nodes.find((n) => n.id === link.source)
      const color = sourceNode
        ? this.config.colors[sourceNode.community % this.config.colors.length]
        : '#666666'

      this.ctx.strokeStyle = color
      this.ctx.globalAlpha = 0.5
      this.ctx.lineWidth = 1 * this.scale
      this.ctx.beginPath()
      this.ctx.moveTo(sourceCanvas.x, sourceCanvas.y)
      this.ctx.lineTo(targetCanvas.x, targetCanvas.y)
      this.ctx.stroke()
      this.ctx.globalAlpha = 1
    })
  }

  private handleClick(e: MouseEvent): void {
    if (this.isDragging) return

    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const canvasPos = this.fromCanvas(x, y)
    const clickedNode = this.findNodeAt(canvasPos.x, canvasPos.y)
    if (clickedNode && this.onClickCallback) {
      this.onClickCallback(clickedNode)
    }
  }

  private handleMouseDown(e: MouseEvent): void {
    this.isDragging = true
    this.lastMouseX = e.clientX
    this.lastMouseY = e.clientY
    this.canvas.style.cursor = 'grabbing'
  }

  private handleMouseUp(): void {
    this.isDragging = false
    this.canvas.style.cursor = 'grab'
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.isDragging) {
      const dx = e.clientX - this.lastMouseX
      const dy = e.clientY - this.lastMouseY
      this.offsetX += dx
      this.offsetY += dy
      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY
      this.render()
      return
    }

    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const canvasPos = this.fromCanvas(x, y)

    const hovered = this.findNodeAt(canvasPos.x, canvasPos.y)
    if (hovered?.id !== this.hoveredId) {
      this.hoveredId = hovered?.id ?? null
      if (this.onHoverCallback) {
        this.onHoverCallback(hovered ?? null)
      }
      this.render()
    }
  }

  private handleMouseLeave(): void {
    if (this.hoveredId) {
      this.hoveredId = null
      if (this.onHoverCallback) {
        this.onHoverCallback(null)
      }
      this.render()
    }
    this.isDragging = false
    this.canvas.style.cursor = 'grab'
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault()

    const rect = this.canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const worldX = (mouseX - this.offsetX) / this.scale
    const worldY = (mouseY - this.offsetY) / this.scale

    const factor = e.deltaY > 0 ? 0.95 : 1.05
    this.scale *= factor

    this.offsetX = mouseX - worldX * this.scale
    this.offsetY = mouseY - worldY * this.scale

    this.render()
  }

  private findNodeAt(x: number, y: number): VizNode | null {
    const halfSize = (this.config.nodeSize * 2) / this.scale
    for (let i = 0; i < this.positions.length; i++) {
      const pos = this.positions[i]
      const node = this.nodes[i]
      if (
        x >= pos.x - halfSize &&
        x <= pos.x + halfSize &&
        y >= pos.y - halfSize &&
        y <= pos.y + halfSize
      ) {
        return node
      }
    }
    return null
  }

  on(event: 'click' | 'hover', callback: (node: VizNode | null) => void): void {
    if (event === 'click') {
      this.onClickCallback = callback as (node: VizNode) => void
    } else {
      this.onHoverCallback = callback
    }
  }

  startAnimation(): void {
    this.animationTimer = window.setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % this.config.animationFrames
      this.render()
    }, this.config.animationDelay)
  }

  stopAnimation(): void {
    if (this.animationTimer) {
      clearInterval(this.animationTimer)
      this.animationTimer = null
    }
  }

  destroy(): void {
    this.stopAnimation()
    this.canvas.remove()
  }
}