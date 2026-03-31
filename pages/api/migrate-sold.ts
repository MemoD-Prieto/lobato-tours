import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await db.sequelize.query(`ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS sold BOOLEAN NOT NULL DEFAULT FALSE`);
    res.json({ ok: true, message: 'Column sold added successfully' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
