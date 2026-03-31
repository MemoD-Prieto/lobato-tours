import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import db from '@/models/index-simple';
import { signToken, setAuthCookie, ROLES, type Role } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  try {
    // Find user by user_name or email
    const user = await db.Empleado.findOne({
      where: {
        [Op.or]: [
          { user_name: username.trim() },
          { email:     username.trim() },
        ],
      },
    }) as any;

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Cuenta desactivada' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Normalize role: treat legacy 'employee' as 'user'
    const rawRole: string = user.role ?? 'user';
    const role: Role = rawRole === 'employee' ? ROLES.USER : rawRole as Role;

    const token = signToken({
      id:        user.id,
      user_name: user.user_name,
      real_name: user.real_name,
      email:     user.email,
      role,
    });

    setAuthCookie(res, token);

    return res.status(200).json({
      ok: true,
      user: {
        id:        user.id,
        user_name: user.user_name,
        real_name: user.real_name,
        email:     user.email,
        role,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[login]', msg);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
