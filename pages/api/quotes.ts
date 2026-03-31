import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';
import { Op } from 'sequelize';
import { requireAuth } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true only when at least one value in an object is non-empty. */
function hasData(obj: Record<string, any>): boolean {
  return Object.values(obj).some(v => v !== undefined && v !== null && v !== '');
}

/** Eagerly load every association for a full quote. */
function buildIncludes() {
  return [
    {
      model: db.Cliente,
      as: 'clientes',
      required: false,
      include: [
        { model: db.Persona, as: 'personas', required: false },
      ],
    },
    { model: db.Moneda,   as: 'moneda',   required: false },
    { model: db.Viaje,    as: 'viaje',    required: false },
    { model: db.Vuelo,    as: 'vuelo',    required: false },
    { model: db.Crucero,  as: 'crucero',  required: false },
    {
      model: db.Hotel,
      as: 'hoteles',
      required: false,
      include: [
        {
          model: db.Distribucion,
          as: 'distribuciones',
          required: false,
          include: [
            { model: db.Habitacion, as: 'habitaciones', required: false },
          ],
        },
      ],
    },
    { model: db.Traslado, as: 'traslado', required: false },
    { model: db.Entradas, as: 'entradas', required: false },
    { model: db.Ferry,    as: 'ferry',    required: false },
    { model: db.Seguro,   as: 'seguro',   required: false },
    { model: db.Datos,    as: 'datos',    required: false },
    { model: db.Visa,     as: 'visa',     required: false },
  ];
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAuth(req, res);
  if (!actor) return;

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { id } = req.query;

      if (id) {
        const cotizacion = await db.Cotizacion.findByPk(id as string, {
          include: buildIncludes(),
        });

        if (!cotizacion) {
          return res.status(404).json({ ok: false, error: 'Cotización no encontrada' });
        }

        return res.status(200).json({ ok: true, data: cotizacion });
      }

      // List – last 50, newest first
      const cotizaciones = await db.Cotizacion.findAll({
        include: [{ model: db.Cliente, as: 'clientes' }],
        order: [['creation_date', 'DESC']],
        limit: 50,
      });

      return res.status(200).json({ ok: true, data: cotizaciones });

    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body = req.body || {};

    // Load an existing quote (used by the wizard on re-open)
    if (body.load_quote_id) {
      try {
        const cotizacion = await db.Cotizacion.findByPk(body.load_quote_id, {
          include: buildIncludes(),
        });

        if (!cotizacion) {
          return res.status(404).json({ ok: false, error: 'Cotización no encontrada' });
        }

        return res.status(200).json({ ok: true, data: cotizacion });

      } catch (error) {
        return res.status(500).json({
          ok: false,
          error: error instanceof Error ? error.message : 'Error interno del servidor',
        });
      }
    }

    // ── Create / Update ──────────────────────────────────────────────────
    const isUpdate = !!body.cotizacion_id;
    const transaction = await db.sequelize.transaction();

    try {

      // Validate required fields when finishing
      if (body.cotizacion?.finished) {
        const name    = body.clientes?.[0]?.customer_name;
        const contact = body.clientes?.[0]?.customer_contact;
        if (!name || !contact) {
          await transaction.rollback();
          return res.status(400).json({
            ok: false,
            error: 'Nombre y contacto del cliente son requeridos para finalizar la cotización',
          });
        }
      }

      // ── cotizacion ─────────────────────────────────────────────────────
      const cotizacionFields = {
        employee_id:          String(actor.id),
        pre_travel_itinerary: body.cotizacion?.pre_travel_itinerary ?? '',
        jacket:               body.cotizacion?.jacket               ?? 0,
        tickets:              body.cotizacion?.tickets              ?? 0,
        snacks:               body.cotizacion?.snacks               ?? 0,
        guide:                body.cotizacion?.guide                ?? 0,
        ticketholder:         body.cotizacion?.ticketholder         ?? 0,
        commission:           body.cotizacion?.commission           ?? 0,
        greeting_message:     body.cotizacion?.greeting_message     ?? '',
        goodbye_message:      body.cotizacion?.goodbye_message      ?? '',
        notes:                body.cotizacion?.notes                ?? null,
        valid_until:          body.cotizacion?.valid_until          ?? null,
        finished:             body.cotizacion?.finished             ?? false,
      };

      let cotizacion: any;

      if (isUpdate) {
        cotizacion = await db.Cotizacion.findByPk(body.cotizacion_id, { transaction });
        if (!cotizacion) {
          await transaction.rollback();
          return res.status(404).json({
            ok: false,
            error: `Cotización ${body.cotizacion_id} no encontrada`,
          });
        }
        await cotizacion.update(cotizacionFields, { transaction });
      } else {
        cotizacion = await db.Cotizacion.create(
          { ...cotizacionFields, creation_date: new Date() },
          { transaction },
        );
      }

      const cotizacionId: number = cotizacion.id;

      // ── clientes + personas ────────────────────────────────────────────
      if (body.clientes && Array.isArray(body.clientes)) {
        if (isUpdate) {
          const existingClientes = await db.Cliente.findAll({
            where: { cotizacion_id: cotizacionId },
            attributes: ['id'],
            transaction,
          });
          const clienteIds = existingClientes.map((c: any) => c.id);

          if (clienteIds.length > 0) {
            await db.Habitacion.destroy({ where: { client_id: { [Op.in]: clienteIds } }, transaction });
            await db.Persona.destroy({ where: { cliente_id: { [Op.in]: clienteIds } }, transaction });
          }
          await db.Cliente.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        }

        for (const clienteData of body.clientes) {
          const cliente = await db.Cliente.create({
            cotizacion_id:     cotizacionId,
            customer_name:     clienteData.customer_name     ?? 'Cliente',
            customer_contact:  clienteData.customer_contact  ?? '',
            customer_contact2: clienteData.customer_contact2 ?? '',
          }, { transaction });

          for (const personaData of clienteData.personas || []) {
            await db.Persona.create({
              cliente_id: (cliente as any).id,
              age_range:  personaData.age_range ?? 0,
            }, { transaction });
          }
        }
      }

      // ── moneda ─────────────────────────────────────────────────────────
      if (body.moneda) {
        await db.Moneda.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        if (hasData(body.moneda)) {
          await db.Moneda.create({
            cotizacion_id: cotizacionId,
            dollar:        body.moneda.dollar        ?? false,
            exchange_rate: body.moneda.exchange_rate ?? 0,
          }, { transaction });
        }
      }

      // ── viaje (paquete) ────────────────────────────────────────────────
      if (body.viaje) {
        await db.Viaje.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        if (hasData(body.viaje)) {
          await db.Viaje.create({
            cotizacion_id:       cotizacionId,
            travel_destiny:      body.viaje.travel_destiny      ?? '',
            travel_begin:        body.viaje.travel_begin        ?? null,
            travel_end:          body.viaje.travel_end          ?? null,
            package_name:        body.viaje.package_name        ?? '',
            package_description: body.viaje.package_description ?? '',
            package_price:       body.viaje.package_price       ?? 0,
            num_personas:        body.viaje.num_personas         ?? null,
          }, { transaction });
        }
      }

      // ── vuelo ──────────────────────────────────────────────────────────
      if (body.vuelo) {
        await db.Vuelo.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        if (hasData(body.vuelo)) {
          await db.Vuelo.create({
            cotizacion_id:        cotizacionId,
            airline:              body.vuelo.airline              ?? '',
            other_airline:        body.vuelo.other_airline        ?? '',
            base_fee:             body.vuelo.base_fee             ?? 0,
            iva:                  body.vuelo.iva                  ?? 0,
            luggage_check:        body.vuelo.luggage_check        ?? 0,
            airport_right_of_use: body.vuelo.airport_right_of_use ?? 0,
            suitcases_tax:        body.vuelo.suitcases_tax        ?? 0,
            num_personas:         body.vuelo.num_personas          ?? null,
          }, { transaction });
        }
      }

      // ── crucero ────────────────────────────────────────────────────────
      if (body.crucero) {
        await db.Crucero.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        if (hasData(body.crucero)) {
          await db.Crucero.create({
            cotizacion_id:     cotizacionId,
            cruise_line:       body.crucero.cruise_line       ?? '',
            other_cruise_line: body.crucero.other_cruise_line ?? '',
            nombre:            body.crucero.nombre            ?? '',
            precio:            body.crucero.precio            ?? 0,
            duracion:          body.crucero.duracion          ?? 0,
            num_personas:      body.crucero.num_personas       ?? null,
          }, { transaction });
        }
      }

      // ── hoteles + distribuciones + habitaciones ────────────────────────
      if (body.hoteles && Array.isArray(body.hoteles)) {
        if (isUpdate) {
          const existingHoteles = await db.Hotel.findAll({
            where: { cotizacion_id: cotizacionId },
            attributes: ['id'],
            transaction,
          });
          const hotelIds = existingHoteles.map((h: any) => h.id);

          if (hotelIds.length > 0) {
            const existingDistribuciones = await db.Distribucion.findAll({
              where: { hotel_id: { [Op.in]: hotelIds } },
              attributes: ['id'],
              transaction,
            });
            const distribucionIds = existingDistribuciones.map((d: any) => d.id);

            if (distribucionIds.length > 0) {
              await db.Habitacion.destroy({
                where: { distribution_id: { [Op.in]: distribucionIds } },
                transaction,
              });
            }
            await db.Distribucion.destroy({ where: { hotel_id: { [Op.in]: hotelIds } }, transaction });
          }
          await db.Hotel.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        }

        const firstCliente = await db.Cliente.findOne({
          where: { cotizacion_id: cotizacionId },
          attributes: ['id'],
          transaction,
        });
        const firstClienteId: number | null = firstCliente ? (firstCliente as any).id : null;

        for (const hotelData of body.hoteles) {
          const hotel = await db.Hotel.create({
            cotizacion_id: cotizacionId,
            name:          hotelData.name         ?? '',
            nights:        hotelData.nights        ?? 0,
            num_personas:  hotelData.num_personas   ?? null,
          }, { transaction });

          for (const distribucionData of hotelData.distribuciones || []) {
            const distribucion = await db.Distribucion.create(
              { hotel_id: (hotel as any).id },
              { transaction },
            );

            if (!firstClienteId) continue;

            for (const habitacionData of distribucionData.habitaciones || []) {
              await db.Habitacion.create({
                distribution_id:  (distribucion as any).id,
                client_id:        firstClienteId,
                type:             habitacionData.type             ?? '',
                number_of_people: habitacionData.number_of_people ?? 1,
                price:            habitacionData.price            ?? 0,
                iva:              habitacionData.iva              ?? 0,
              }, { transaction });
            }
          }
        }
      }

      // ── traslado ───────────────────────────────────────────────────────
      if (body.traslado) {
        await db.Traslado.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        if (hasData(body.traslado)) {
          await db.Traslado.create({
            cotizacion_id: cotizacionId,
            tipo:          body.traslado.tipo         ?? '',
            amount:        body.traslado.amount        ?? 0,
            num_personas:  body.traslado.num_personas   ?? null,
          }, { transaction });
        }
      }

      // ── entradas ───────────────────────────────────────────────────────
      if (body.entradas) {
        await db.Entradas.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        if (hasData(body.entradas)) {
          await db.Entradas.create({
            cotizacion_id: cotizacionId,
            atraccion:     body.entradas.atraccion    ?? '',
            precio:        body.entradas.precio       ?? 0,
            cantidad:      body.entradas.cantidad     ?? 0,
            num_personas:  body.entradas.num_personas  ?? null,
          }, { transaction });
        }
      }

      // ── ferry ──────────────────────────────────────────────────────────
      if (body.ferry) {
        await db.Ferry.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        if (hasData(body.ferry)) {
          await db.Ferry.create({
            cotizacion_id: cotizacionId,
            ruta:          body.ferry.ruta           ?? '',
            precio:        body.ferry.precio         ?? 0,
            horario:       body.ferry.horario        ?? '',
            num_personas:  body.ferry.num_personas    ?? null,
          }, { transaction });
        }
      }

      // ── seguro ─────────────────────────────────────────────────────────
      if (body.seguro) {
        await db.Seguro.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        if (hasData(body.seguro)) {
          await db.Seguro.create({
            cotizacion_id:           cotizacionId,
            insurance_company:       body.seguro.insurance_company       ?? '',
            other_insurance_company: body.seguro.other_insurance_company ?? '',
            tipo:                    body.seguro.tipo                    ?? '',
            costo:                   body.seguro.costo                   ?? 0,
            num_personas:            body.seguro.num_personas             ?? null,
          }, { transaction });
        }
      }

      // ── datos ──────────────────────────────────────────────────────────
      if (body.datos) {
        await db.Datos.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        if (hasData(body.datos)) {
          await db.Datos.create({
            cotizacion_id:  cotizacionId,
            proveedor_plan: body.datos.proveedor_plan ?? '',
            inicio:         body.datos.inicio         ?? null,
            costo:          body.datos.costo          ?? 0,
            num_personas:   body.datos.num_personas    ?? null,
          }, { transaction });
        }
      }

      // ── visa ───────────────────────────────────────────────────────────
      if (body.visa) {
        await db.Visa.destroy({ where: { cotizacion_id: cotizacionId }, transaction });
        if (hasData(body.visa)) {
          await db.Visa.create({
            cotizacion_id: cotizacionId,
            pais:          body.visa.pais          ?? '',
            costo:         body.visa.costo         ?? 0,
            tiempo:        body.visa.tiempo        ?? '',
            num_personas:  body.visa.num_personas   ?? null,
          }, { transaction });
        }
      }

      await transaction.commit();

      return res.status(isUpdate ? 200 : 201).json({
        ok: true,
        message: isUpdate ? 'Cotización actualizada exitosamente' : 'Cotización creada exitosamente',
        data: { id: cotizacionId, isUpdate },
      });

    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
