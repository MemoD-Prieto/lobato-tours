import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';
import { Op } from 'sequelize';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAuth(req, res);
  if (!actor) return;

  if (req.method === 'GET') {
    try {
      // Test and establish connection
      try {
        await db.sequelize.authenticate();
      } catch (authError) {
        // If authentication fails, try to reconnect
        console.error('Initial auth failed, retrying...', authError);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        await db.sequelize.authenticate();
      }

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

      // Build where conditions for Cliente (search only)
      const clienteWhereConditions: any = {};

      if (search) {
        clienteWhereConditions[Op.or] = [
          { customer_name: { [Op.iLike]: `%${search}%` } },
          { customer_contact: { [Op.iLike]: `%${search}%` } },
          { customer_contact2: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Build where conditions for Cotizacion (status only)
      const cotizacionWhereConditions: any = {};

      if (status === 'finished') {
        cotizacionWhereConditions.finished = true;
      } else if (status === 'draft') {
        cotizacionWhereConditions.finished = false;
      }

      const hasClienteFilters = Object.keys(clienteWhereConditions).length > 0;
      const hasCotizacionFilters = Object.keys(cotizacionWhereConditions).length > 0;

      // Get total count
      const totalCount = await db.Cotizacion.count({
        where: hasCotizacionFilters ? cotizacionWhereConditions : undefined,
        include: [
          {
            model: db.Cliente,
            as: 'clientes',
            ...(hasClienteFilters && { where: clienteWhereConditions, required: true }),
          }
        ],
        distinct: true
      });

      // Get cotizaciones with pagination
      const cotizaciones = await db.Cotizacion.findAll({
        where: hasCotizacionFilters ? cotizacionWhereConditions : undefined,
        include: [
          {
            model: db.Cliente,
            as: 'clientes',
            ...(hasClienteFilters && { where: clienteWhereConditions, required: true }),
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
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : error?.toString() || JSON.stringify(error);
      return res.status(500).json({
        ok: false,
        error: errorMessage || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
