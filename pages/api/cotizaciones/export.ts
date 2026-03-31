import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';
import { Op, WhereOptions } from 'sequelize';
import { requireAuth } from '@/lib/auth';

/**
 * CSV Export endpoint for cotizaciones
 * Supports filtering by search and status query parameters
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAuth(req, res);
  if (!actor) return;

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
    const clienteWhereConditions: WhereOptions = {};

    // Search filter
    if (search) {
      (clienteWhereConditions as Record<symbol, unknown>)[Op.or] = [
        { customer_name: { [Op.iLike]: `%${search}%` } },
        { customer_contact: { [Op.iLike]: `%${search}%` } },
        { customer_contact2: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build where conditions for Cotizacion (status filter)
    const cotizacionWhereConditions: WhereOptions = {};

    // Status filter
    if (status === 'finished') {
      (cotizacionWhereConditions as Record<string, unknown>).finished = true;
    } else if (status === 'draft') {
      (cotizacionWhereConditions as Record<string, unknown>).finished = false;
    }

    const hasClienteFilters = Object.keys(clienteWhereConditions).length > 0;
    const hasCotizacionFilters = Object.keys(cotizacionWhereConditions).length > 0;

    // Get all cotizaciones (no pagination for export)
    const cotizaciones = await db.Cotizacion.findAll({
      where: hasCotizacionFilters ? cotizacionWhereConditions : undefined,
      include: [
        {
          model: db.Cliente,
          as: 'clientes',
          ...(hasClienteFilters && { where: clienteWhereConditions, required: true }),
          include: [
            { model: db.Persona, as: 'personas' }
          ]
        },
        { model: db.Viaje,    as: 'viaje'    },
        { model: db.Vuelo,    as: 'vuelo'    },
        { model: db.Moneda,   as: 'moneda'   },
        { model: db.Traslado, as: 'traslado' },
        { model: db.Seguro,   as: 'seguro'   },
        { model: db.Datos,    as: 'datos'    },
        { model: db.Visa,     as: 'visa'     },
        { model: db.Entradas, as: 'entradas' },
        { model: db.Ferry,    as: 'ferry'    },
        { model: db.Crucero,  as: 'crucero'  },
      ],
      order: [['creation_date', 'DESC']]
    });

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
      'Tarifa Base Vuelo',
      'IVA Vuelo',
      'Equipaje',
      'Derecho de Uso Aeropuerto',
      'Impuesto Maletas',
      'Moneda Dólar',
      'Tipo de Cambio',
      'Traslado Tipo',
      'Traslado Monto',
      'Seguro Compañía',
      'Seguro Costo',
      'Plan de Datos Proveedor',
      'Plan de Datos Costo',
      'Visa País',
      'Visa Costo',
      'Comisión',
      'Mensaje de Bienvenida',
      'Mensaje de Despedida'
    ];

    const csvRows: string[] = [headers.join(',')];

    /** Escape a value for CSV output */
    const escapeCsv = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    /** Format a date value to es-ES locale string */
    const formatDate = (date: unknown): string => {
      if (!date) return '';
      try {
        return new Date(date as string).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } catch {
        return '';
      }
    };

    // CSV Data Rows
    for (const cotizacion of cotizaciones) {
      const c = cotizacion as unknown as {
        id: number;
        finished: boolean;
        creation_date: string;
        commission: number;
        greeting_message: string;
        goodbye_message: string;
        clientes?: Array<{
          customer_name?: string;
          customer_contact?: string;
          customer_contact2?: string;
          personas?: Array<{ age_range: number }>;
        }>;
        viaje?: { travel_destiny?: string; travel_begin?: string; travel_end?: string };
        vuelo?: {
          airline?: string;
          other_airline?: string;
          base_fee?: number;
          iva?: number;
          luggage_check?: number;
          airport_right_of_use?: number;
          suitcases_tax?: number;
        };
        moneda?: { dollar?: boolean; exchange_rate?: number };
        traslado?: { tipo?: string; amount?: number };
        seguro?: { insurance_company?: string; other_insurance_company?: string; costo?: number };
        datos?: { proveedor_plan?: string; costo?: number };
        visa?: { pais?: string; costo?: number };
      };

      const cliente = c.clientes?.[0];
      const personas = cliente?.personas ?? [];
      const ageRanges = personas.map(p => p.age_range).join('; ');

      const seguroCompany = c.seguro?.insurance_company === 'Otra'
        ? (c.seguro?.other_insurance_company ?? '')
        : (c.seguro?.insurance_company ?? '');

      const row = [
        escapeCsv(c.id),
        escapeCsv(formatDate(c.creation_date)),
        escapeCsv(c.finished ? 'Finalizada' : 'Borrador'),
        escapeCsv(cliente?.customer_name ?? ''),
        escapeCsv(cliente?.customer_contact ?? ''),
        escapeCsv(cliente?.customer_contact2 ?? ''),
        escapeCsv(personas.length),
        escapeCsv(ageRanges),
        escapeCsv(c.viaje?.travel_destiny ?? ''),
        escapeCsv(formatDate(c.viaje?.travel_begin)),
        escapeCsv(formatDate(c.viaje?.travel_end)),
        escapeCsv(c.vuelo?.airline ?? ''),
        escapeCsv(c.vuelo?.other_airline ?? ''),
        escapeCsv(c.vuelo?.base_fee ?? 0),
        escapeCsv(c.vuelo?.iva ?? 0),
        escapeCsv(c.vuelo?.luggage_check ?? 0),
        escapeCsv(c.vuelo?.airport_right_of_use ?? 0),
        escapeCsv(c.vuelo?.suitcases_tax ?? 0),
        escapeCsv(c.moneda?.dollar ? 'Sí' : 'No'),
        escapeCsv(c.moneda?.exchange_rate ?? 0),
        escapeCsv(c.traslado?.tipo ?? ''),
        escapeCsv(c.traslado?.amount ?? 0),
        escapeCsv(seguroCompany),
        escapeCsv(c.seguro?.costo ?? 0),
        escapeCsv(c.datos?.proveedor_plan ?? ''),
        escapeCsv(c.datos?.costo ?? 0),
        escapeCsv(c.visa?.pais ?? ''),
        escapeCsv(c.visa?.costo ?? 0),
        escapeCsv(c.commission ?? 0),
        escapeCsv(c.greeting_message ?? ''),
        escapeCsv(c.goodbye_message ?? '')
      ];

      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    const filename = `cotizaciones_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    return res.status(200).send('\ufeff' + csvContent); // BOM for Excel UTF-8

  } catch (error) {
    console.error('Error exporting cotizaciones:', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
