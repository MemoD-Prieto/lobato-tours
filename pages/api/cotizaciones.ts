import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await db.sequelize.authenticate();

      const {
        page = '1',
        limit = '10',
        search = '',
        status = 'all', // all, finished, draft
        sortBy = 'id',
        sortOrder = 'DESC'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      const whereConditions: any = {};
      
      // Search filter
      if (search) {
        whereConditions[db.Sequelize.Op.or] = [
          { customer_name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
          { customer_contact: { [db.Sequelize.Op.iLike]: `%${search}%` } },
          { customer_contact2: { [db.Sequelize.Op.iLike]: `%${search}%` } }
        ];
      }

      // Status filter
      if (status === 'finished') {
        whereConditions.finished = true;
      } else if (status === 'draft') {
        whereConditions.finished = false;
      }

      // Get total count
      const totalCount = await db.Cotizacion.count({
        include: [
          {
            model: db.Cliente,
            as: 'clientes',
            where: whereConditions,
            required: true
          }
        ],
        distinct: true
      });

      // Get cotizaciones with pagination
      const cotizaciones = await db.Cotizacion.findAll({
        include: [
          {
            model: db.Cliente,
            as: 'clientes',
            where: whereConditions,
            required: true,
            include: [
              {
                model: db.Persona,
                as: 'personas'
              }
            ]
          },
          {
            model: db.Viaje,
            as: 'viaje'
          },
          {
            model: db.Vuelo,
            as: 'vuelo'
          },
          {
            model: db.Moneda,
            as: 'moneda'
          }
        ],
        order: [[sortBy as string, sortOrder as string]],
        limit: limitNum,
        offset: offset
      });

      const totalPages = Math.ceil(totalCount / limitNum);

      return res.status(200).json({
        ok: true,
        data: {
          cotizaciones,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalCount,
            limit: limitNum,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        }
      });

    } catch (error) {
      console.error('Error fetching cotizaciones:', error);
      return res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
