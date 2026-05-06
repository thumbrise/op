export interface Node {
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

export interface Link {
  source: string
  target: string
  relation: string
  confidence: string
}

export interface Community {
  id: number
  label: string
  count: number
}

export interface GraphProps {
  nodes: Node[]
  links: Link[]
  communities: Community[]
  onNodeClick: (node: Node | null) => void
  selectedNode: Node | null
}

export interface NodeDegreeMap {
  [nodeId: string]: number
}
