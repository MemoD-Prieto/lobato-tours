/**
 * GET    /api/users/[id]  – get single user (admin + manager)
 * PUT    /api/users/[id]  – update user (admin only; manager cannot demote/promote)
 * DELETE /api/users/[id]  – delete user (admin only; cannot delete self)
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import db from '@/models/index-simple';
import { requireAuth, ROLES } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAuth(req, res);
  if (!actor) return;

  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  // Find the target user
  const user = await db.Empleado.findByPk(id) as any;
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    if (actor.role !== ROLES.ADMIN && actor.role !== ROLES.MANAGER) {
      return res.status(403).json({ error: 'Sin permisos suficientes' });
    }
    return res.status(200).json({
      user: {
        id:           user.id,
        user_name:    user.user_name,
        real_name:    user.real_name,
        email:        user.email,
        phone_number: user.phone_number,
        address:      user.address,
        role:         user.role,
        active:       user.active,
        creation_date:user.creation_date,
      },
    });
  }

  // ── PUT (update) ──────────────────────────────────────────────────────────
  if (req.method === 'PUT') {
    if (actor.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Solo el administrador puede editar usuarios' });
    }

    const { real_name, email, phone_number, address, role, active, password } = req.body as {
      real_name?:    string;
      email?:        string;
      phone_number?: string;
      address?:      string;
      role?:         string;
      active?:       boolean;
      password?:     string;
    };

    const validRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER];
    const updates: Record<string, any> = {};

    if (real_name    !== undefined) updates.real_name    = real_name.trim();
    if (email        !== undefined) updates.email        = email.trim();
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (address      !== undefined) updates.address      = address;
    if (active       !== undefined) updates.active       = active;
    if (role !== undefined && validRoles.includes(role as any)) {
      // Prevent demoting the last admin
      if (user.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
        const adminCount = await db.Empleado.count({ where: { role: ROLES.ADMIN, active: true } });
        if (adminCount <= 1) {
          return res.status(400).json({ error: 'No puedes degradar al único administrador activo' });
        }
      }
      updates.role = role;
    }
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    await user.update(updates);

    return res.status(200).json({
      user: {
        id:        user.id,
        user_name: user.user_name,
        real_name: user.real_name,
        email:     user.email,
        role:      user.role,
        active:    user.active,
      },
    });
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (actor.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Solo el administrador puede eliminar usuarios' });
    }
    if (actor.id === id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    // Prevent deleting the last admin
    if (user.role === ROLES.ADMIN) {
      const adminCount = await db.Empleado.count({ where: { role: ROLES.ADMIN, active: true } });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'No puedes eliminar al único administrador activo' });
      }
    }

    await user.destroy();
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end();
}
