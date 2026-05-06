import { getNodeMemory, MemoryItem } from '@/lib/python'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MemoryItem[] | { error: string; original: unknown }>
) {
  const { nodeId } = req.query

  if (!nodeId || typeof nodeId !== 'string') {
    res.status(400).json({ error: 'Missing nodeId parameter', original: null })
    return
  }

  try {
    const memory = await getNodeMemory(nodeId)
    res.status(200).json(memory)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memory', original: error })
  }
}
