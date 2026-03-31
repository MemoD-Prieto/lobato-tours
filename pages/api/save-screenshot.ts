import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, data } = req.body as { name: string; data: string };
  if (!name || !data) return res.status(400).json({ error: 'missing name or data' });

  const base64 = data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  const dir = path.join(process.cwd(), 'public', 'doc-screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${name}.jpg`);
  fs.writeFileSync(filePath, buffer);

  res.status(200).json({ ok: true, path: `/doc-screenshots/${name}.jpg` });
}
