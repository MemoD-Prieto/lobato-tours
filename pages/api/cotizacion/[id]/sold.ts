/**
 * PUT /api/cotizacion/[id]/sold
 * Toggle or set the `sold` status of a cotizacion.
 * Body: { sold: boolean }
 * Access: admin + manager only (regular users cannot mark quotes as sold)
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';
import { requireAuth, ROLES } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAuth(req, res);
  if (!actor) return;

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Only admin and manager can mark quotes as sold
  if (actor.role !== ROLES.ADMIN && actor.role !== ROLES.MANAGER) {
    return res.status(403).json({ error: 'Solo admin y gerente pueden marcar cotizaciones como vendidas' });
  }

  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const { sold } = req.body as { sold?: boolean };
  if (typeof sold !== 'boolean') {
    return res.status(400).json({ error: 'El campo sold debe ser un booleano' });
  }

  try {
    const cotizacion = await db.Cotizacion.findByPk(id) as any;
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });

    await cotizacion.update({ sold });

    return res.status(200).json({ ok: true, id, sold });
  } catch (error) {
    console.error('[sold]', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
