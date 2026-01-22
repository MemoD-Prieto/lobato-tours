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

      // Include all models related to Cliente: Persona and Habitacion
      const clienteIncludes: any[] = [
        { 
          model: db.Persona, 
          as: 'personas',
          required: false
        }
      ];
      
      // Add Habitacion to Cliente includes if it exists
      if (db.Habitacion) {
        clienteIncludes.push({
          model: db.Habitacion,
          as: 'habitaciones',
          required: false
        });
      }
      
      // Ensure crucero table exists before querying
      if (db.Crucero) {
        try {
          await db.sequelize.query('SELECT 1 FROM "crucero" LIMIT 1');
        } catch (tableError: any) {
          if (tableError?.parent?.code === '42P01') {
            // Table doesn't exist - create it
            console.log('⚠️ Crucero table does not exist, creating it...');
            try {
              await db.sequelize.query(`
                CREATE TABLE IF NOT EXISTS "crucero" (
                  "id" SERIAL PRIMARY KEY,
                  "cotizacion_id" INTEGER NOT NULL,
                  "cruise_line" VARCHAR(255),
                  "other_cruise_line" VARCHAR(255),
                  "nombre" VARCHAR(255),
                  "precio" DECIMAL(10, 2) DEFAULT 0,
                  "duracion" INTEGER DEFAULT 0
                )
              `);
              // Try to add foreign key constraint - use Sequelize model's tableName
              try {
                // Get the actual table name from Sequelize model (it knows the correct name)
                const cotizacionTableName = db.Cotizacion.tableName || 'cotizacion';
                console.log(`🔧 Using Cotizacion table name from Sequelize model: "${cotizacionTableName}"`);
                
                // Drop existing constraint if it exists (might be wrong)
                await db.sequelize.query(`
                  DO $$
                  BEGIN
                    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_crucero_cotizacion') THEN
                      ALTER TABLE "crucero" DROP CONSTRAINT "fk_crucero_cotizacion";
                      RAISE NOTICE 'Dropped existing fk_crucero_cotizacion constraint';
                    END IF;
                  END $$;
                `);
                
                // Create constraint with correct table name
                await db.sequelize.query(`
                  ALTER TABLE "crucero" 
                  ADD CONSTRAINT "fk_crucero_cotizacion" 
                  FOREIGN KEY ("cotizacion_id") 
                  REFERENCES "${cotizacionTableName}"("id") 
                  ON DELETE CASCADE;
                `);
                console.log(`✅ Foreign key constraint added referencing "${cotizacionTableName}"`);
              } catch (fkError: any) {
                if (fkError?.parent?.code === '42710') {
                  console.log('ℹ️ Foreign key constraint already exists');
                } else {
                  console.warn('⚠️ Could not add foreign key (table still works):', fkError?.message);
                  console.warn('FK Error details:', {
                    code: fkError?.parent?.code,
                    message: fkError?.parent?.message,
                    detail: fkError?.parent?.detail
                  });
                }
              }
              console.log('✅ Crucero table created successfully');
            } catch (createError: any) {
              console.error('❌ Error creating crucero table:', createError?.message);
            }
          }
        }
      }
      
      // Ensure Viajes table has package columns before querying
      if (db.Viaje) {
        try {
          // Check if package columns exist in Viajes table
          const viajeTableName = db.Viaje.tableName || 'Viajes';
          const columnCheck = await db.sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '${viajeTableName}' 
            AND column_name IN ('package_name', 'package_price', 'package_description')
          `);
          
          const existingColumns = (columnCheck[0] as any[]).map((row: any) => row.column_name);
          const missingColumns = ['package_name', 'package_price', 'package_description'].filter(
            col => !existingColumns.includes(col)
          );
          
          if (missingColumns.length > 0) {
            console.log(`⚠️ Viajes table missing package columns: ${missingColumns.join(', ')}, adding them...`);
            
            for (const column of missingColumns) {
              try {
                if (column === 'package_name' || column === 'package_description') {
                  await db.sequelize.query(`
                    ALTER TABLE "${viajeTableName}" 
                    ADD COLUMN IF NOT EXISTS "${column}" TEXT;
                  `);
                } else if (column === 'package_price') {
                  await db.sequelize.query(`
                    ALTER TABLE "${viajeTableName}" 
                    ADD COLUMN IF NOT EXISTS "${column}" DECIMAL(10, 2);
                  `);
                }
                console.log(`✅ Added column "${column}" to "${viajeTableName}" table`);
              } catch (addColumnError: any) {
                if (addColumnError?.parent?.code === '42701') {
                  console.log(`ℹ️ Column "${column}" already exists`);
                } else {
                  console.warn(`⚠️ Could not add column "${column}":`, addColumnError?.message);
                }
              }
            }
          }
        } catch (checkError: any) {
          // If table doesn't exist, that's okay - it will be created by sync
          if (checkError?.parent?.code !== '42P01') {
            console.warn('⚠️ Could not check Viajes table columns:', checkError?.message);
          }
        }
      }

      const includes: any[] = [
        { 
          model: db.Cliente, 
          as: 'clientes', 
          include: clienteIncludes,
          required: false
        },
        { model: db.Viaje, as: 'viaje', required: false },
        { model: db.Vuelo, as: 'vuelo', required: false },
        { model: db.Moneda, as: 'moneda', required: false }
      ];
      
      // Always include Crucero if model exists (table should exist now)
      if (db.Crucero) {
        includes.push({ model: db.Crucero, as: 'crucero', required: false });
      }

      // Add hotel include if Hotel model exists
      if (db.Hotel && db.Distribucion && db.Habitacion) {
        includes.push({
          model: db.Hotel, 
          as: 'hoteles',
          required: false,
          include: [
            {
              model: db.Distribucion,
              as: 'distribuciones',
              required: false,
              include: [
                {
                  model: db.Habitacion,
                  as: 'habitaciones',
                  required: false
                }
              ]
            }
          ]
        });
      }

      const cotizacion = await db.Cotizacion.findByPk(cotizacionId, {
        include: includes
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
