import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest, ROLES, type Role } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  // Normalize legacy 'employee' role
  const role: Role = (user.role as string) === 'employee' ? ROLES.USER : user.role;

  return res.status(200).json({
    id:        user.id,
    user_name: user.user_name,
    real_name: user.real_name,
    email:     user.email,
    role,
  });
}
