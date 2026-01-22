-- Script to create the crucero table
-- Run this if the table doesn't exist

-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS "crucero" (
  "id" SERIAL PRIMARY KEY,
  "cotizacion_id" INTEGER NOT NULL,
  "cruise_line" VARCHAR(255),
  "other_cruise_line" VARCHAR(255),
  "nombre" VARCHAR(255),
  "precio" DECIMAL(10, 2) DEFAULT 0,
  "duracion" INTEGER DEFAULT 0
);

-- Add foreign key constraint (try both table name variants)
DO $$
BEGIN
  -- Use the correct table name: cotizacion (singular, lowercase)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_crucero_cotizacion'
  ) THEN
    BEGIN
      ALTER TABLE "crucero" 
      ADD CONSTRAINT "fk_crucero_cotizacion" 
      FOREIGN KEY ("cotizacion_id") 
      REFERENCES "cotizacion"("id") 
      ON DELETE CASCADE;
      RAISE NOTICE 'Foreign key added with cotizacion table';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add foreign key: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists';
  END IF;
END $$;

-- Verify table structure
\d crucero


