import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';
import { Op } from 'sequelize';

/**
 * CSV Export endpoint for cotizaciones
 * Supports filtering by search and status query parameters
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await db.sequelize.authenticate();

    const {
      search = '',
      status = 'all' // all, finished, draft
    } = req.query;

    // Build where conditions for Cliente (search filter)
    const clienteWhereConditions: any = {};
    
    // Search filter
    if (search) {
      clienteWhereConditions[Op.or] = [
        { customer_name: { [Op.iLike]: `%${search}%` } },
        { customer_contact: { [Op.iLike]: `%${search}%` } },
        { customer_contact2: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build where conditions for Cotizacion (status filter)
    const cotizacionWhereConditions: any = {};
    
    // Status filter
    if (status === 'finished') {
      cotizacionWhereConditions.finished = true;
    } else if (status === 'draft') {
      cotizacionWhereConditions.finished = false;
    }

    // Get all cotizaciones (no pagination for export)
    const hasClienteFilters = Object.keys(clienteWhereConditions).length > 0;
    const hasCotizacionFilters = Object.keys(cotizacionWhereConditions).length > 0;
    
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
      order: [['creation_date', 'DESC']]
    });

    // Convert to CSV
    const csvRows: string[] = [];
    
    // CSV Headers
    const headers = [
      'ID',
      'Fecha Creación',
      'Estado',
      'Cliente',
      'Contacto',
      'Contacto 2',
      'Total Personas',
      'Rangos de Edad',
      'Destino',
      'Fecha Inicio Viaje',
      'Fecha Fin Viaje',
      'Aerolínea',
      'Otra Aerolínea',
      'Tarifa Base',
      'IVA',
      'Equipaje',
      'Derecho de Uso Aeropuerto',
      'Impuesto Maletas',
      'Moneda Dólar',
      'Tipo de Cambio',
      'Traslados',
      'Seguro',
      'Plan de Datos',
      'Visa',
      'Comisión',
      'Mensaje de Bienvenida',
      'Mensaje de Despedida',
      'Mensajes'
    ];
    
    csvRows.push(headers.join(','));

    // CSV Data Rows
    for (const cotizacion of cotizaciones) {
      const cliente = (cotizacion as any).clientes?.[0];
      const viaje = (cotizacion as any).viaje;
      const vuelo = (cotizacion as any).vuelo;
      const moneda = (cotizacion as any).moneda;
      
      const personas = cliente?.personas || [];
      const totalPersonas = personas.length;
      const ageRanges = personas.map((p: any) => p.age_range).join('; ');
      
      // Helper function to escape CSV values
      const escapeCsv = (value: any): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        // If contains comma, quote, or newline, wrap in quotes and escape quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Helper function to format dates
      const formatDate = (date: any): string => {
        if (!date) return '';
        try {
          return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        } catch {
          return '';
        }
      };

      const row = [
        escapeCsv(cotizacion.id),
        escapeCsv(formatDate((cotizacion as any).creation_date)),
        escapeCsv((cotizacion as any).finished ? 'Finalizada' : 'Borrador'),
        escapeCsv(cliente?.customer_name || ''),
        escapeCsv(cliente?.customer_contact || ''),
        escapeCsv(cliente?.customer_contact2 || ''),
        escapeCsv(totalPersonas),
        escapeCsv(ageRanges),
        escapeCsv(viaje?.travel_destiny || ''),
        escapeCsv(formatDate(viaje?.travel_begin)),
        escapeCsv(formatDate(viaje?.travel_end)),
        escapeCsv(vuelo?.airline || ''),
        escapeCsv(vuelo?.other_airline || ''),
        escapeCsv(vuelo?.base_fee || '0'),
        escapeCsv(vuelo?.iva || '0'),
        escapeCsv(vuelo?.luggage_check || '0'),
        escapeCsv(vuelo?.airport_right_of_use || '0'),
        escapeCsv(vuelo?.suitcases_tax || '0'),
        escapeCsv(moneda?.dollar ? 'Sí' : 'No'),
        escapeCsv(moneda?.exchange_rate || '0'),
        escapeCsv((cotizacion as any).transfers || '0'),
        escapeCsv((cotizacion as any).insurance || '0'),
        escapeCsv((cotizacion as any).data_plan || '0'),
        escapeCsv((cotizacion as any).visa || '0'),
        escapeCsv((cotizacion as any).commission || '0'),
        escapeCsv((cotizacion as any).greeting_message || ''),
        escapeCsv((cotizacion as any).goodbye_message || ''),
        escapeCsv((cotizacion as any).messages || '')
      ];

      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    // Set headers for CSV download
    const filename = `cotizaciones_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    return res.status(200).send('\ufeff' + csvContent); // BOM for Excel UTF-8 support

  } catch (error) {
    console.error('Error exporting cotizaciones:', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}

