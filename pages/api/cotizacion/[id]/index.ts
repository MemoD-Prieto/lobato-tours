import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAuth(req, res);
  if (!actor) return;

  const { id } = req.query;
  const cotizacionId = parseInt(id as string);

  if (isNaN(cotizacionId)) {
    return res.status(400).json({ ok: false, error: 'ID de cotización inválido' });
  }

  await db.sequelize.authenticate();

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const cotizacion = await db.Cotizacion.findByPk(cotizacionId, {
        include: [
          { model: db.Cliente,  as: 'clientes', include: [{ model: db.Persona, as: 'personas' }] },
          { model: db.Viaje,    as: 'viaje'    },
          { model: db.Vuelo,    as: 'vuelo'    },
          { model: db.Moneda,   as: 'moneda'   },
          { model: db.Crucero,  as: 'crucero'  },
          { model: db.Hotel,    as: 'hoteles',
            include: [{ model: db.Distribucion, as: 'distribuciones',
              include: [{ model: db.Habitacion, as: 'habitaciones' }] }] },
          { model: db.Traslado, as: 'traslado' },
          { model: db.Entradas, as: 'entradas' },
          { model: db.Ferry,    as: 'ferry'    },
          { model: db.Seguro,   as: 'seguro'   },
          { model: db.Datos,    as: 'datos'    },
          { model: db.Visa,     as: 'visa'     },
        ],
      });

      if (!cotizacion) return res.status(404).json({ ok: false, error: 'Cotización no encontrada' });
      return res.status(200).json({ ok: true, data: cotizacion });
    } catch (error) {
      console.error('Error fetching cotización:', error);
      return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'Error interno' });
    }
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const transaction = await db.sequelize.transaction();
    try {
      const cotizacion = await db.Cotizacion.findByPk(cotizacionId, { transaction });
      if (!cotizacion) {
        await transaction.rollback();
        return res.status(404).json({ ok: false, error: 'Cotización no encontrada' });
      }

      // Delete child records first (cascade order)
      await Promise.all([
        db.Viaje.destroy(    { where: { cotizacion_id: cotizacionId }, transaction }),
        db.Vuelo.destroy(    { where: { cotizacion_id: cotizacionId }, transaction }),
        db.Moneda.destroy(   { where: { cotizacion_id: cotizacionId }, transaction }),
        db.Crucero.destroy(  { where: { cotizacion_id: cotizacionId }, transaction }),
        db.Traslado.destroy( { where: { cotizacion_id: cotizacionId }, transaction }),
        db.Entradas.destroy( { where: { cotizacion_id: cotizacionId }, transaction }),
        db.Ferry.destroy(    { where: { cotizacion_id: cotizacionId }, transaction }),
        db.Seguro.destroy(   { where: { cotizacion_id: cotizacionId }, transaction }),
        db.Datos.destroy(    { where: { cotizacion_id: cotizacionId }, transaction }),
        db.Visa.destroy(     { where: { cotizacion_id: cotizacionId }, transaction }),
      ]);

      // Hotels need nested deletion: Habitacion → Distribucion → Hotel
      const hoteles = await db.Hotel.findAll({ where: { cotizacion_id: cotizacionId }, transaction });
      for (const hotel of hoteles) {
        const distribuciones = await db.Distribucion.findAll({ where: { hotel_id: (hotel as any).id }, transaction });
        for (const dist of distribuciones) {
          await db.Habitacion.destroy({ where: { distribution_id: (dist as any).id }, transaction });
        }
        await db.Distribucion.destroy({ where: { hotel_id: (hotel as any).id }, transaction });
      }
      await db.Hotel.destroy({ where: { cotizacion_id: cotizacionId }, transaction });

      // Delete clientes and their personas
      const clientes = await db.Cliente.findAll({ where: { cotizacion_id: cotizacionId }, transaction });
      for (const cliente of clientes) {
        await db.Persona.destroy({ where: { cliente_id: (cliente as any).id }, transaction });
      }
      await db.Cliente.destroy({ where: { cotizacion_id: cotizacionId }, transaction });

      await cotizacion.destroy({ transaction });
      await transaction.commit();

      return res.status(200).json({ ok: true, message: 'Cotización eliminada correctamente' });
    } catch (error) {
      await transaction.rollback();
      console.error('Error deleting cotización:', error);
      return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'Error interno' });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
