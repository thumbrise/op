import { searchNodes } from '@/lib/python'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q } = req.query

  if (!q || typeof q !== 'string') {
    res.status(400).json({ error: 'Missing query parameter "q"' })
    return
  }

  try {
    const results = await searchNodes(q)
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ error: 'Failed to search', original: error })
  }
}
