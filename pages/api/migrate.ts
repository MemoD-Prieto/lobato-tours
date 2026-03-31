/**
 * One-shot migration endpoint.
 * GET /api/migrate  → adds any missing columns and seeds default admin.
 * Safe to call multiple times – uses describeTable checks before altering.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import db from '@/models/index-simple';
import { DataTypes, type ModelAttributeColumnOptions } from 'sequelize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end();
  }

  try {
    await db.sequelize.authenticate();
    const qi = db.sequelize.getQueryInterface();
    const results: string[] = [];

    // Helper – add a column only if it doesn't already exist
    const addIfMissing = async (
      table: string,
      column: string,
      definition: ModelAttributeColumnOptions,
    ) => {
      try {
        const cols = await qi.describeTable(table);
        if (!cols[column]) {
          await qi.addColumn(table, column, definition);
          results.push(`✅ Added ${table}.${column}`);
        } else {
          results.push(`⏭  ${table}.${column} already exists`);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push(`❌ ${table}.${column}: ${msg}`);
      }
    };

    // ── cotizacion columns ─────────────────────────────────────────────────
    await addIfMissing('cotizacion', 'notes',       { type: DataTypes.TEXT,    allowNull: true });
    await addIfMissing('cotizacion', 'valid_until', { type: DataTypes.DATEONLY, allowNull: true });

    // ── empleado columns (ensure index-simple.js schema is present) ────────
    await addIfMissing('empleado', 'email',        { type: DataTypes.STRING,  allowNull: true, unique: false });
    await addIfMissing('empleado', 'password',     { type: DataTypes.STRING,  allowNull: true });
    await addIfMissing('empleado', 'phone_number', { type: DataTypes.STRING,  allowNull: true });
    await addIfMissing('empleado', 'address',      { type: DataTypes.TEXT,    allowNull: true });
    await addIfMissing('empleado', 'role',         { type: DataTypes.STRING,  allowNull: true, defaultValue: 'user' });
    await addIfMissing('empleado', 'active',       { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true });
    await addIfMissing('empleado', 'creation_date',{ type: DataTypes.DATE,    allowNull: true });

    // ── Seed default admin if no empleado rows exist at all ────────────────
    try {
      const count = await db.Empleado.count();
      if (count === 0) {
        const hashed = await bcrypt.hash('admin123', 10);
        await db.Empleado.create({
          user_name:    'admin',
          real_name:    'Administrador',
          email:        'admin@lobatotours.com',
          password:     hashed,
          role:         'admin',
          active:       true,
          creation_date: new Date(),
        });
        results.push('✅ Seeded default admin (user: admin / pass: admin123)');
      } else {
        // Ensure at least one user has role='admin'
        const adminCount = await db.Empleado.count({ where: { role: 'admin' } });
        if (adminCount === 0) {
          // Promote first user to admin
          const first = await db.Empleado.findOne({ order: [['id', 'ASC']] }) as any;
          if (first) {
            await first.update({ role: 'admin' });
            results.push(`✅ Promoted user '${first.user_name}' to admin (no admin existed)`);
          }
        } else {
          results.push(`⏭  ${adminCount} admin(s) already exist`);
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push(`❌ Admin seed: ${msg}`);
    }

    // ── Fix admins whose password field is null (legacy password_hash users) ─
    try {
      const { Op } = await import('sequelize');
      const adminsWithNoPassword = await db.Empleado.findAll({
        where: {
          role: 'admin',
          [Op.or]: [
            { password: null },
            { password: '' },
          ],
        },
      }) as any[];

      if (adminsWithNoPassword.length > 0) {
        const hashed = await bcrypt.hash('admin123', 10);
        for (const admin of adminsWithNoPassword) {
          await admin.update({ password: hashed, active: true });
          results.push(`✅ Reset password for admin '${admin.user_name}' → admin123`);
        }
      } else {
        results.push('⏭  All admins already have a password set');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push(`❌ Password fix: ${msg}`);
    }

    return res.status(200).json({ ok: true, results });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ ok: false, error: msg });
  }
}
