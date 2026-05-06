import { getGraph } from '@/lib/python'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await getGraph()
    res.status(200).json(data)
  } catch (error) {
    const err = { error: 'Failed to fetch graph', original: error }
    console.error('ERROR getGraph:', err)
    res.status(500).json(err)
  }
}
