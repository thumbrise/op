import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SCRIPTS_DIR = path.join(__dirname, '../../scripts')

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
  content?: string
  norm_label?: string
}

export interface Link {
  source: string
  target: string
  relation: string
  confidence: string
  weight?: number
  confidence_score?: number
  source_file?: string
  source_location?: string
}

export interface GraphData {
  nodes: Node[]
  links: Link[]
}

export interface Community {
  id: number
  label: string
  count: number
}

export interface SearchResult {
  id: string
  label: string
  source_file: string
  community: number
  community_name?: string
  display_name?: string
}

export async function getGraph(): Promise<GraphData> {
  const result = execSync('python3 kg_db_cli.py graph', {
    cwd: SCRIPTS_DIR,
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
  })
  return JSON.parse(result)
}

export async function getStats() {
  const result = execSync('python3 kg_db_cli.py stats', {
    cwd: SCRIPTS_DIR,
    encoding: 'utf-8',
  })
  return JSON.parse(result)
}

export async function searchNodes(text: string): Promise<SearchResult[]> {
  const result = execSync(`python3 kg_db_cli.py search "${text}"`, {
    cwd: SCRIPTS_DIR,
    encoding: 'utf-8',
  })
  return JSON.parse(result)
}

export async function getNode(id: string) {
  const result = execSync(`python3 kg_db_cli.py node "${id}"`, {
    cwd: SCRIPTS_DIR,
    encoding: 'utf-8',
  })
  return JSON.parse(result)
}

export async function getCommunities(): Promise<Community[]> {
  const result = execSync('python3 kg_db_cli.py communities', {
    cwd: SCRIPTS_DIR,
    encoding: 'utf-8',
  })
  return JSON.parse(result)
}

export interface MemoryItem {
  id: string
  text: string
  tags: string[]
  scope: string
  created: string
  linked_node: string
}

export async function getNodeMemory(nodeId: string): Promise<MemoryItem[]> {
  const result = execSync(
    `python3 -c "import sys; sys.path.insert(0, '.'); import storage; import json; print(json.dumps(storage.get_memory_items_for_node('${nodeId}')))"`,
    {
      cwd: SCRIPTS_DIR,
      encoding: 'utf-8',
    }
  )
  return JSON.parse(result)
}
