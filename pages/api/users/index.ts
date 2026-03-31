/**
 * GET  /api/users  – list all users (admin + manager)
 * POST /api/users  – create a user (admin only)
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import db from '@/models/index-simple';
import { requireAuth, ROLES } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAuth(req, res);
  if (!actor) return;

  // ── GET: list users ───────────────────────────────────────────────────────
  if (req.method === 'GET') {
    // Admin and manager can list users
    if (actor.role !== ROLES.ADMIN && actor.role !== ROLES.MANAGER) {
      return res.status(403).json({ error: 'Sin permisos suficientes' });
    }

    const users = await db.Empleado.findAll({
      attributes: ['id', 'user_name', 'real_name', 'email', 'phone_number', 'role', 'active', 'creation_date'],
      order: [['creation_date', 'DESC']],
    });

    return res.status(200).json({ users });
  }

  // ── POST: create user ─────────────────────────────────────────────────────
  if (req.method === 'POST') {
    if (actor.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Solo el administrador puede crear usuarios' });
    }

    const { user_name, real_name, email, password, phone_number, role, address } = req.body as {
      user_name?:    string;
      real_name?:    string;
      email?:        string;
      password?:     string;
      phone_number?: string;
      role?:         string;
      address?:      string;
    };

    if (!user_name || !real_name || !email || !password) {
      return res.status(400).json({ error: 'Campos obligatorios: user_name, real_name, email, password' });
    }

    const validRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER];
    const assignedRole = validRoles.includes(role as any) ? role : ROLES.USER;

    // Check uniqueness
    const existing = await db.Empleado.findOne({
      where: {
        [Op.or]: [{ user_name: user_name.trim() }, { email: email.trim() }],
      },
    });
    if (existing) {
      return res.status(409).json({ error: 'El nombre de usuario o email ya existe' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const created = await db.Empleado.create({
      user_name:    user_name.trim(),
      real_name:    real_name.trim(),
      email:        email.trim(),
      password:     hashed,
      phone_number: phone_number ?? null,
      address:      address ?? null,
      role:         assignedRole,
      active:       true,
    }) as any;

    return res.status(201).json({
      user: {
        id:        created.id,
        user_name: created.user_name,
        real_name: created.real_name,
        email:     created.email,
        role:      created.role,
        active:    created.active,
      },
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end();
}
