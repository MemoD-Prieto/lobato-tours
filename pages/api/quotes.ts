import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/models/index-simple';
import { Transaction } from 'sequelize';

/**
 * This endpoint accepts a very flexible JSON with optional sections.
 * It creates a Cotizacion as the anchor and any related data you pass.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query;
    const cotizacionId = id as string;

    try {
    await db.sequelize.authenticate();

      if (cotizacionId) {
        // Get specific quote with all related data
        const cotizacion = await db.Cotizacion.findByPk(cotizacionId, {
          include: [
            { model: db.Cliente, as: 'clientes', include: [{ model: db.Persona, as: 'personas' }] },
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

        return res.status(200).json({ ok: true, data: cotizacion });
      } else {
        // Get all quotes (basic list)
        const cotizaciones = await db.Cotizacion.findAll({
          include: [{ model: db.Cliente, as: 'clientes' }],
          order: [['creation_date', 'DESC']],
          limit: 50
        });

        return res.status(200).json({ ok: true, data: cotizaciones });
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      await db.sequelize.authenticate();

      const body = req.body || {};
      console.log('Received body:', JSON.stringify(body, null, 2));

      // Check if this is a request to load existing quote by ID
      if (body.load_quote_id) {
        const existingQuote = await db.Cotizacion.findByPk(body.load_quote_id, {
          include: [
            { model: db.Cliente, as: 'clientes', include: [{ model: db.Persona, as: 'personas' }] },
            { model: db.Viaje, as: 'viaje' },
            { model: db.Vuelo, as: 'vuelo' },
            { model: db.Moneda, as: 'moneda' }
          ]
        });

        if (!existingQuote) {
          return res.status(404).json({
            ok: false,
            error: 'Cotización no encontrada'
          });
        }

        return res.status(200).json({
          ok: true,
          data: existingQuote,
          message: 'Cotización cargada exitosamente'
        });
      }

      // Only validate required fields if the quote is being marked as finished
      if (body.cotizacion?.finished) {
        const customerName = body.clientes?.[0]?.customer_name;
        const customerContact = body.clientes?.[0]?.customer_contact;
        
        if (!customerName || !customerContact) {
          return res.status(400).json({
            ok: false,
            error: 'customer_name and customer_contact are required when marking as finished'
          });
        }
      }

      // Use employee_id as placeholder for now
      const employeeId = '1';

      let transaction: Transaction;
      let cotizacion: any;
      let isUpdate = false;

      // Check if this is an update (has cotizacion_id)
      if (body.cotizacion_id) {
        isUpdate = true;
        transaction = await db.sequelize.transaction();
        
        try {
          // Update existing cotizacion
          cotizacion = await db.Cotizacion.findByPk(body.cotizacion_id, { transaction });
          if (!cotizacion) {
            await transaction.rollback();
            return res.status(404).json({
              ok: false,
              error: 'Cotización no encontrada'
            });
          }

          await cotizacion.update({
            employee_id: employeeId,
            transfers: body.cotizacion.transfers || 0,
            greeting_message: body.cotizacion.greeting_message || '',
            goodbye_message: body.cotizacion.goodbye_message || '',
            insurance: body.cotizacion.insurance || 0,
            data_plan: body.cotizacion.data_plan || 0,
            visa: body.cotizacion.visa || 0,
            commission: body.cotizacion.commission || 0,
            messages: body.cotizacion.messages || '',
            finished: body.cotizacion.finished || false
          }, { transaction });

        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      } else {
        // Create new cotizacion
        transaction = await db.sequelize.transaction();
        
        try {
          cotizacion = await db.Cotizacion.create({
            employee_id: employeeId,
            transfers: body.cotizacion?.transfers || 0,
            greeting_message: body.cotizacion?.greeting_message || '',
            goodbye_message: body.cotizacion?.goodbye_message || '',
            insurance: body.cotizacion?.insurance || 0,
            data_plan: body.cotizacion?.data_plan || 0,
            visa: body.cotizacion?.visa || 0,
            commission: body.cotizacion?.commission || 0,
            messages: body.cotizacion?.messages || '',
            finished: body.cotizacion?.finished || false,
            creation_date: new Date()
          }, { transaction });
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      }

      // Handle Cliente and Personas
      if (body.clientes && Array.isArray(body.clientes)) {
        // For updates, delete existing clientes and personas first
        if (isUpdate) {
          await db.Persona.destroy({
            where: { 
              cliente_id: {
                [db.Sequelize.Op.in]: await db.Cliente.findAll({
                  where: { cotizacion_id: cotizacion.id },
                  attributes: ['id'],
                  transaction
                }).then(clientes => clientes.map(c => c.id))
              }
            },
            transaction
          });
          await db.Cliente.destroy({
            where: { cotizacion_id: cotizacion.id },
            transaction
          });
        }

        for (const clienteData of body.clientes) {
          // Create new cliente
          const cliente = await db.Cliente.create({
            cotizacion_id: cotizacion.id,
            customer_name: clienteData.customer_name || 'Cliente',
            customer_contact: clienteData.customer_contact || 'Sin contacto',
            customer_contact2: clienteData.customer_contact2 || ''
          }, { transaction });

          // Handle Personas for this cliente
          if (clienteData.personas && Array.isArray(clienteData.personas)) {
            // Create new personas
            for (const personaData of clienteData.personas) {
              await db.Persona.create({
                cliente_id: cliente.id,
                age_range: personaData.age_range || 0
              }, { transaction });
            }
          }
        }
      }

      // Handle other services (simplified for now)
      if (body.viaje) {
        if (isUpdate) {
          await db.Viaje.destroy({ where: { cotizacion_id: cotizacion.id }, transaction });
        }
        await db.Viaje.create({
          cotizacion_id: cotizacion.id,
          travel_destiny: body.viaje.travel_destiny || '',
          travel_begin: body.viaje.travel_begin || null,
          travel_end: body.viaje.travel_end || null
        }, { transaction });
      }

      if (body.vuelo) {
        if (isUpdate) {
          await db.Vuelo.destroy({ where: { cotizacion_id: cotizacion.id }, transaction });
        }
        await db.Vuelo.create({
          cotizacion_id: cotizacion.id,
          airline: body.vuelo.airline || '',
          other_airline: body.vuelo.other_airline || '',
          base_fee: body.vuelo.base_fee || 0,
          iva: body.vuelo.iva || 0,
          luggage_check: body.vuelo.luggage_check || 0,
          airport_right_of_use: body.vuelo.airport_right_of_use || 0,
          suitcases_tax: body.vuelo.suitcases_tax || 0
        }, { transaction });
      }

      if (body.moneda) {
        if (isUpdate) {
          await db.Moneda.destroy({ where: { cotizacion_id: cotizacion.id }, transaction });
        }
        await db.Moneda.create({
          cotizacion_id: cotizacion.id,
          dollar: body.moneda.dollar || false,
          exchange_rate: body.moneda.exchange_rate || 0
        }, { transaction });
      }

      await transaction.commit();

      return res.status(isUpdate ? 200 : 201).json({
        ok: true,
        message: isUpdate ? 'Cotización actualizada exitosamente' : 'Cotización creada exitosamente',
        data: {
          id: cotizacion.id,
          isUpdate
        }
      });

    } catch (error) {
      console.error('Error processing quote:', error);
      return res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}