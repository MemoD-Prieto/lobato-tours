import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      await db.sequelize.authenticate();

      const cotizacionId = parseInt(id as string);
      if (isNaN(cotizacionId)) {
        return res.status(400).json({
          ok: false,
          error: 'ID de cotización inválido'
        });
      }

      const cotizacion = await db.Cotizacion.findByPk(cotizacionId, {
        include: [
          { 
            model: db.Cliente, 
            as: 'clientes', 
            include: [{ 
              model: db.Persona, 
              as: 'personas' 
            }] 
          },
          { model: db.Viaje, as: 'viaje' },
          { model: db.Vuelo, as: 'vuelo' },
          { model: db.Moneda, as: 'moneda' }
        ]
      });

      if (!cotizacion) {
        return res.status(404).json({
          ok: false,
          error: 'Cotización no encontrada'
        });
      }

      return res.status(200).json({
        ok: true,
        data: cotizacion
      });

    } catch (error) {
      console.error('Error fetching cotización details:', error);
      return res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
