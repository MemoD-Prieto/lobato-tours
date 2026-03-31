import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAuth(req, res);
  if (!actor) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;
  const sourceId = parseInt(id as string);

  if (isNaN(sourceId)) {
    return res.status(400).json({ ok: false, error: 'ID de cotización inválido' });
  }

  await db.sequelize.authenticate();
  const transaction = await db.sequelize.transaction();

  try {
    // Load source cotizacion with all associations
    const source = await db.Cotizacion.findByPk(sourceId, {
      include: [
        { model: db.Cliente,  as: 'clientes',  include: [{ model: db.Persona, as: 'personas' }] },
        { model: db.Viaje,    as: 'viaje'   },
        { model: db.Vuelo,    as: 'vuelo'   },
        { model: db.Moneda,   as: 'moneda'  },
        { model: db.Crucero,  as: 'crucero' },
        {
          model: db.Hotel, as: 'hoteles',
          include: [{
            model: db.Distribucion, as: 'distribuciones',
            include: [{ model: db.Habitacion, as: 'habitaciones' }],
          }],
        },
        { model: db.Traslado, as: 'traslado' },
        { model: db.Entradas, as: 'entradas' },
        { model: db.Ferry,    as: 'ferry'    },
        { model: db.Seguro,   as: 'seguro'   },
        { model: db.Datos,    as: 'datos'    },
        { model: db.Visa,     as: 'visa'     },
      ],
      transaction,
    });

    if (!source) {
      await transaction.rollback();
      return res.status(404).json({ ok: false, error: 'Cotización no encontrada' });
    }

    const s = source.toJSON ? source.toJSON() : source;

    // ── Create new cotizacion ────────────────────────────────────────────────
    const newCot = await db.Cotizacion.create({
      employee_id:          s.employee_id,
      pre_travel_itinerary: s.pre_travel_itinerary,
      jacket:               s.jacket,
      tickets:              s.tickets,
      snacks:               s.snacks,
      guide:                s.guide,
      ticketholder:         s.ticketholder,
      commission:           s.commission,
      greeting_message:     s.greeting_message,
      goodbye_message:      s.goodbye_message,
      notes:                s.notes,
      valid_until:          s.valid_until,
      finished:             false, // duplicates start as draft
      creation_date:        new Date(),
    }, { transaction });

    const newId: number = (newCot as any).id;

    // ── Clientes + Personas ──────────────────────────────────────────────────
    for (const cliente of (s.clientes || [])) {
      const newCliente = await db.Cliente.create({
        cotizacion_id:     newId,
        customer_name:     cliente.customer_name,
        customer_contact:  cliente.customer_contact,
        customer_contact2: cliente.customer_contact2,
      }, { transaction });

      for (const persona of (cliente.personas || [])) {
        await db.Persona.create({
          cliente_id: (newCliente as any).id,
          age_range:  persona.age_range,
        }, { transaction });
      }
    }

    // ── Moneda ───────────────────────────────────────────────────────────────
    if (s.moneda) {
      await db.Moneda.create({
        cotizacion_id: newId,
        dollar:        s.moneda.dollar,
        exchange_rate: s.moneda.exchange_rate,
      }, { transaction });
    }

    // ── Viaje ────────────────────────────────────────────────────────────────
    if (s.viaje) {
      await db.Viaje.create({
        cotizacion_id:       newId,
        travel_destiny:      s.viaje.travel_destiny,
        travel_begin:        s.viaje.travel_begin,
        travel_end:          s.viaje.travel_end,
        package_name:        s.viaje.package_name,
        package_description: s.viaje.package_description,
        package_price:       s.viaje.package_price,
        num_personas:        s.viaje.num_personas,
      }, { transaction });
    }

    // ── Vuelo ────────────────────────────────────────────────────────────────
    if (s.vuelo) {
      await db.Vuelo.create({
        cotizacion_id:        newId,
        airline:              s.vuelo.airline,
        other_airline:        s.vuelo.other_airline,
        base_fee:             s.vuelo.base_fee,
        iva:                  s.vuelo.iva,
        luggage_check:        s.vuelo.luggage_check,
        airport_right_of_use: s.vuelo.airport_right_of_use,
        suitcases_tax:        s.vuelo.suitcases_tax,
        num_personas:         s.vuelo.num_personas,
      }, { transaction });
    }

    // ── Crucero ──────────────────────────────────────────────────────────────
    if (s.crucero) {
      await db.Crucero.create({
        cotizacion_id:     newId,
        cruise_line:       s.crucero.cruise_line,
        other_cruise_line: s.crucero.other_cruise_line,
        nombre:            s.crucero.nombre,
        precio:            s.crucero.precio,
        duracion:          s.crucero.duracion,
        num_personas:      s.crucero.num_personas,
      }, { transaction });
    }

    // ── Hoteles + Distribuciones + Habitaciones ───────────────────────────────
    const firstNewCliente = await db.Cliente.findOne({
      where: { cotizacion_id: newId },
      attributes: ['id'],
      transaction,
    });
    const firstClienteId: number | null = firstNewCliente ? (firstNewCliente as any).id : null;

    for (const hotel of (s.hoteles || [])) {
      const newHotel = await db.Hotel.create({
        cotizacion_id: newId,
        name:          hotel.name,
        nights:        hotel.nights,
        num_personas:  hotel.num_personas,
      }, { transaction });

      for (const dist of (hotel.distribuciones || [])) {
        const newDist = await db.Distribucion.create(
          { hotel_id: (newHotel as any).id },
          { transaction },
        );

        if (!firstClienteId) continue;
        for (const hab of (dist.habitaciones || [])) {
          await db.Habitacion.create({
            distribution_id:  (newDist as any).id,
            client_id:        firstClienteId,
            type:             hab.type,
            number_of_people: hab.number_of_people,
            price:            hab.price,
            iva:              hab.iva,
          }, { transaction });
        }
      }
    }

    // ── Traslado ─────────────────────────────────────────────────────────────
    if (s.traslado) {
      await db.Traslado.create({
        cotizacion_id: newId,
        tipo:          s.traslado.tipo,
        amount:        s.traslado.amount,
        num_personas:  s.traslado.num_personas,
      }, { transaction });
    }

    // ── Entradas ─────────────────────────────────────────────────────────────
    if (s.entradas) {
      await db.Entradas.create({
        cotizacion_id: newId,
        atraccion:     s.entradas.atraccion,
        precio:        s.entradas.precio,
        cantidad:      s.entradas.cantidad,
        num_personas:  s.entradas.num_personas,
      }, { transaction });
    }

    // ── Ferry ─────────────────────────────────────────────────────────────────
    if (s.ferry) {
      await db.Ferry.create({
        cotizacion_id: newId,
        ruta:          s.ferry.ruta,
        precio:        s.ferry.precio,
        horario:       s.ferry.horario,
        num_personas:  s.ferry.num_personas,
      }, { transaction });
    }

    // ── Seguro ────────────────────────────────────────────────────────────────
    if (s.seguro) {
      await db.Seguro.create({
        cotizacion_id:           newId,
        insurance_company:       s.seguro.insurance_company,
        other_insurance_company: s.seguro.other_insurance_company,
        tipo:                    s.seguro.tipo,
        costo:                   s.seguro.costo,
        num_personas:            s.seguro.num_personas,
      }, { transaction });
    }

    // ── Datos ─────────────────────────────────────────────────────────────────
    if (s.datos) {
      await db.Datos.create({
        cotizacion_id:  newId,
        proveedor_plan: s.datos.proveedor_plan,
        inicio:         s.datos.inicio,
        costo:          s.datos.costo,
        num_personas:   s.datos.num_personas,
      }, { transaction });
    }

    // ── Visa ──────────────────────────────────────────────────────────────────
    if (s.visa) {
      await db.Visa.create({
        cotizacion_id: newId,
        pais:          s.visa.pais,
        costo:         s.visa.costo,
        tiempo:        s.visa.tiempo,
        num_personas:  s.visa.num_personas,
      }, { transaction });
    }

    await transaction.commit();
    return res.status(201).json({
      ok: true,
      message: 'Cotización duplicada exitosamente',
      data: { id: newId, sourceId },
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error duplicating cotización:', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Error interno',
    });
  }
}
