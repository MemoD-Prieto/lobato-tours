/**
 * GET /api/cotizaciones/ml-export
 *
 * Exports ALL cotizaciones as a machine-learning–ready CSV.
 * Every categorical variable is one-hot encoded (dichotomous columns).
 * Every string is converted to a number or binary flag.
 * The target column is `sold` (0 = not sold, 1 = sold).
 *
 * Access: admin + manager only.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';
import { requireAuth, ROLES } from '@/lib/auth';

// ── Helpers ──────────────────────────────────────────────────────────────────

const n = (v: any): number => {
  const x = parseFloat(v);
  return isNaN(x) ? 0 : x;
};

const b = (v: any): 0 | 1 => (v ? 1 : 0);

/** Days between two date strings (returns 0 if either is null) */
function daysBetween(a: string | null, b_: string | null): number {
  if (!a || !b_) return 0;
  const diff = new Date(b_).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

// ── Known categorical values for one-hot encoding ────────────────────────────

const AIRLINES   = ['aeromexico', 'volaris', 'viva-aerobus'];
const CRUISES    = ['royal-caribbean', 'norwegian', 'princess'];
const INSURANCES = ['euroamerican-assistance', 'universal-assistance'];
// traslado.tipo is free text — we only flag the two most common patterns
const TRASLADO_TIPOS = ['privado', 'compartido'];

// ── CSV builder ───────────────────────────────────────────────────────────────

function buildRow(c: any): Record<string, number> {
  const persons: any[] = (c.clientes ?? []).flatMap((cl: any) => cl.personas ?? []);

  // ── Dates ──────────────────────────────────────────────────────────────────
  const createdAt  = new Date(c.creation_date);
  const month      = createdAt.getMonth() + 1;   // 1-12
  const quarter    = Math.ceil(month / 3);        // 1-4
  const dayOfWeek  = createdAt.getDay();          // 0=Sun … 6=Sat

  // ── Viaje (travel package) ─────────────────────────────────────────────────
  const viaje          = c.viaje ?? null;
  const paqueteDuration = daysBetween(viaje?.travel_begin, viaje?.travel_end);

  // ── Vuelo (flight) ─────────────────────────────────────────────────────────
  const vuelo     = c.vuelo ?? null;
  const vuelo_total = vuelo
    ? n(vuelo.base_fee) + n(vuelo.iva) + n(vuelo.luggage_check)
      + n(vuelo.airport_right_of_use) + n(vuelo.suitcases_tax)
    : 0;
  const rawAirline = (vuelo?.airline ?? '').toLowerCase();

  // ── Crucero ────────────────────────────────────────────────────────────────
  const crucero      = c.crucero ?? null;
  const crucero_np   = n(crucero?.num_personas) || persons.length || 1;
  const rawCruise    = (crucero?.cruise_line ?? '').toLowerCase();

  // ── Hotel ──────────────────────────────────────────────────────────────────
  const hoteles       = c.hoteles ?? [];
  let hotel_total     = 0;
  let hotel_nights    = 0;
  hoteles.forEach((h: any) => {
    hotel_nights += n(h.nights);
    (h.distribuciones ?? []).forEach((d: any) => {
      (d.habitaciones ?? []).forEach((hab: any) => {
        hotel_total += n(hab.price) + n(hab.iva);
      });
    });
  });

  // ── Seguro (insurance) ────────────────────────────────────────────────────
  const seguro    = c.seguro ?? null;
  const seguro_np = n(seguro?.num_personas) || persons.length || 1;
  const rawIns    = (seguro?.insurance_company ?? '').toLowerCase();
  const seguroTipo = (seguro?.tipo ?? '').toLowerCase();

  // ── Traslado ───────────────────────────────────────────────────────────────
  const traslado     = c.traslado ?? null;
  const rawTraslado  = (traslado?.tipo ?? '').toLowerCase();

  // ── Entradas ───────────────────────────────────────────────────────────────
  const entradas      = c.entradas ?? null;
  const entradas_total = entradas
    ? n(entradas.precio) * Math.max(1, n(entradas.cantidad))
    : 0;

  // ── Ferry ─────────────────────────────────────────────────────────────────
  const ferry    = c.ferry ?? null;
  const ferry_np = n(ferry?.num_personas) || persons.length || 1;

  // ── Datos ─────────────────────────────────────────────────────────────────
  const datos    = c.datos ?? null;
  const datos_np = n(datos?.num_personas) || persons.length || 1;

  // ── Visa ──────────────────────────────────────────────────────────────────
  const visa    = c.visa ?? null;
  const visa_np = n(visa?.num_personas) || persons.length || 1;

  // ── Cost totals ────────────────────────────────────────────────────────────
  const subtotal =
    n(viaje?.package_price) +
    vuelo_total +
    n(crucero?.precio) * crucero_np +
    hotel_total +
    n(traslado?.amount) +
    entradas_total +
    n(ferry?.precio) * ferry_np +
    n(seguro?.costo) * seguro_np +
    n(datos?.costo) * datos_np +
    n(visa?.costo) * visa_np +
    n(c.jacket) + n(c.tickets) + n(c.snacks) + n(c.guide) + n(c.ticketholder);

  const commission_amt = subtotal * (n(c.commission) / 100);
  const estimated_total = subtotal + commission_amt;

  const num_services = [
    viaje, vuelo, crucero, hoteles.length > 0 ? true : null,
    traslado, entradas, ferry, seguro, datos, visa,
  ].filter(Boolean).length;

  // ── Days until expiry (0 if none) ─────────────────────────────────────────
  const days_until_expiry = c.valid_until
    ? Math.max(0, daysBetween(new Date().toISOString().slice(0, 10), c.valid_until))
    : 0;

  // ── One-hot: airlines ─────────────────────────────────────────────────────
  const airlineFlags: Record<string, number> = {};
  AIRLINES.forEach(a => {
    airlineFlags[`airline_${a.replace(/-/g, '_')}`] = rawAirline === a ? 1 : 0;
  });
  airlineFlags['airline_other'] = (!rawAirline || rawAirline === 'other' || !AIRLINES.includes(rawAirline)) && !!vuelo ? 1 : 0;

  // ── One-hot: cruise lines ─────────────────────────────────────────────────
  const cruiseFlags: Record<string, number> = {};
  CRUISES.forEach(cr => {
    cruiseFlags[`cruise_${cr.replace(/-/g, '_')}`] = rawCruise === cr ? 1 : 0;
  });
  cruiseFlags['cruise_other'] = (!rawCruise || rawCruise === 'other' || !CRUISES.includes(rawCruise)) && !!crucero ? 1 : 0;

  // ── One-hot: insurance companies ─────────────────────────────────────────
  const insFlags: Record<string, number> = {};
  INSURANCES.forEach(ins => {
    insFlags[`insurance_${ins.replace(/-/g, '_')}`] = rawIns === ins ? 1 : 0;
  });
  insFlags['insurance_other'] = (!rawIns || rawIns === 'other' || !INSURANCES.includes(rawIns)) && !!seguro ? 1 : 0;

  // ── One-hot: insurance type (individual / familiar / other) ───────────────
  const seguroTipoFlags = {
    seguro_tipo_individual: /individual/i.test(seguroTipo) ? 1 : 0,
    seguro_tipo_familiar:   /familiar|familia/i.test(seguroTipo) ? 1 : 0,
  };

  // ── One-hot: traslado tipo ────────────────────────────────────────────────
  const trasladoFlags = {
    traslado_tipo_privado:    /privado/i.test(rawTraslado) ? 1 : 0,
    traslado_tipo_compartido: /compartido/i.test(rawTraslado) ? 1 : 0,
  };

  return {
    // ── Reference ────────────────────────────────────────────────────────────
    cotizacion_id: c.id,

    // ── TARGET variable ───────────────────────────────────────────────────────
    sold: b(c.sold),

    // ── Quote meta ────────────────────────────────────────────────────────────
    finished:            b(c.finished),
    commission_pct:      n(c.commission),
    has_notes:           b(c.notes?.trim()),
    has_valid_until:     b(c.valid_until),
    days_until_expiry,
    has_greeting:        b(c.greeting_message?.trim()),
    has_goodbye:         b(c.goodbye_message?.trim()),
    creation_month:      month,
    creation_quarter:    quarter,
    creation_dayofweek:  dayOfWeek,

    // ── Extra items (jacket, tickets, etc.) ───────────────────────────────────
    has_jacket:       n(c.jacket) > 0 ? 1 : 0,
    jacket_cost:      n(c.jacket),
    has_tickets:      n(c.tickets) > 0 ? 1 : 0,
    tickets_cost:     n(c.tickets),
    has_snacks:       n(c.snacks) > 0 ? 1 : 0,
    snacks_cost:      n(c.snacks),
    has_guide:        n(c.guide) > 0 ? 1 : 0,
    guide_cost:       n(c.guide),
    has_ticketholder: n(c.ticketholder) > 0 ? 1 : 0,
    ticketholder_cost:n(c.ticketholder),

    // ── Traveler breakdown ────────────────────────────────────────────────────
    num_clients:           (c.clientes ?? []).length,
    num_travelers:         persons.length,
    num_infants:           persons.filter((p: any) => p.age_range === 0).length,
    num_children_small:    persons.filter((p: any) => p.age_range === 1).length,
    num_children_teen:     persons.filter((p: any) => p.age_range === 2).length,
    num_adults:            persons.filter((p: any) => p.age_range === 3).length,

    // ── Currency ──────────────────────────────────────────────────────────────
    uses_dollar:   b(c.moneda?.dollar),
    exchange_rate: n(c.moneda?.exchange_rate),

    // ── Travel package ────────────────────────────────────────────────────────
    has_paquete:        viaje ? 1 : 0,
    paquete_price:      n(viaje?.package_price),
    paquete_duration_days: paqueteDuration,

    // ── Flight ────────────────────────────────────────────────────────────────
    has_vuelo:         vuelo ? 1 : 0,
    vuelo_total_cost:  vuelo_total,
    vuelo_num_personas:n(vuelo?.num_personas),
    ...airlineFlags,

    // ── Cruise ────────────────────────────────────────────────────────────────
    has_crucero:           crucero ? 1 : 0,
    crucero_precio_total:  n(crucero?.precio) * crucero_np,
    crucero_duracion:      n(crucero?.duracion),
    crucero_num_personas:  crucero_np,
    ...cruiseFlags,

    // ── Hotel ─────────────────────────────────────────────────────────────────
    has_hotel:         hoteles.length > 0 ? 1 : 0,
    hotel_count:       hoteles.length,
    hotel_total_nights:hotel_nights,
    hotel_total_cost:  hotel_total,

    // ── Transfer ──────────────────────────────────────────────────────────────
    has_traslado:    traslado ? 1 : 0,
    traslado_amount: n(traslado?.amount),
    ...trasladoFlags,

    // ── Attractions ───────────────────────────────────────────────────────────
    has_entradas:    entradas ? 1 : 0,
    entradas_total,

    // ── Ferry ─────────────────────────────────────────────────────────────────
    has_ferry:          ferry ? 1 : 0,
    ferry_precio_total: n(ferry?.precio) * ferry_np,

    // ── Insurance ─────────────────────────────────────────────────────────────
    has_seguro:         seguro ? 1 : 0,
    seguro_costo_total: n(seguro?.costo) * seguro_np,
    ...insFlags,
    ...seguroTipoFlags,

    // ── Data plan ─────────────────────────────────────────────────────────────
    has_datos:         datos ? 1 : 0,
    datos_costo_total: n(datos?.costo) * datos_np,

    // ── Visa ──────────────────────────────────────────────────────────────────
    has_visa:         visa ? 1 : 0,
    visa_costo_total: n(visa?.costo) * visa_np,

    // ── Aggregates ───────────────────────────────────────────────────────────
    num_services,
    estimated_total: Math.round(estimated_total * 100) / 100,
  };
}

function toCSV(rows: Record<string, number>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines   = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => String(row[h] ?? 0)).join(','));
  }
  return lines.join('\n');
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAuth(req, res);
  if (!actor) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  if (actor.role !== ROLES.ADMIN && actor.role !== ROLES.MANAGER) {
    return res.status(403).json({ error: 'Solo admin y gerente pueden exportar datos para ML' });
  }

  try {
    await db.sequelize.authenticate();

    const cotizaciones = await db.Cotizacion.findAll({
      include: [
        { model: db.Cliente,  as: 'clientes',
          include: [{ model: db.Persona, as: 'personas' }] },
        { model: db.Moneda,   as: 'moneda'   },
        { model: db.Viaje,    as: 'viaje'    },
        { model: db.Vuelo,    as: 'vuelo'    },
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
      order: [['creation_date', 'ASC']],
    });

    const rows = (cotizaciones as any[]).map(c =>
      buildRow(c.toJSON ? c.toJSON() : c)
    );

    const csv = toCSV(rows);
    const filename = `lobato-tours-ml-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send('\uFEFF' + csv); // BOM for Excel compatibility
  } catch (error) {
    console.error('[ml-export]', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Error interno',
    });
  }
}
