import { getStats } from '@/lib/python'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await getStats()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats', original: error })
  }
}
