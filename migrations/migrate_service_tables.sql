-- =============================================================================
-- Migration: Move service data out of cotizacion into dedicated tables
-- Run this script ONCE against your database.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. NEW TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS traslado (
  id             SERIAL PRIMARY KEY,
  cotizacion_id  INTEGER NOT NULL REFERENCES cotizacion(id) ON DELETE CASCADE,
  tipo           VARCHAR(255),
  amount         DECIMAL(10, 2) DEFAULT 0,
  num_personas   INTEGER
);

CREATE TABLE IF NOT EXISTS entradas (
  id             SERIAL PRIMARY KEY,
  cotizacion_id  INTEGER NOT NULL REFERENCES cotizacion(id) ON DELETE CASCADE,
  atraccion      VARCHAR(255),
  precio         DECIMAL(10, 2) DEFAULT 0,
  cantidad       INTEGER DEFAULT 0,
  num_personas   INTEGER
);

CREATE TABLE IF NOT EXISTS ferry (
  id             SERIAL PRIMARY KEY,
  cotizacion_id  INTEGER NOT NULL REFERENCES cotizacion(id) ON DELETE CASCADE,
  ruta           VARCHAR(255),
  precio         DECIMAL(10, 2) DEFAULT 0,
  horario        VARCHAR(255),
  num_personas   INTEGER
);

CREATE TABLE IF NOT EXISTS seguro (
  id                       SERIAL PRIMARY KEY,
  cotizacion_id            INTEGER NOT NULL REFERENCES cotizacion(id) ON DELETE CASCADE,
  insurance_company        VARCHAR(255),
  other_insurance_company  VARCHAR(255),
  tipo                     VARCHAR(255),
  costo                    DECIMAL(10, 2) DEFAULT 0,
  num_personas             INTEGER
);

CREATE TABLE IF NOT EXISTS datos (
  id             SERIAL PRIMARY KEY,
  cotizacion_id  INTEGER NOT NULL REFERENCES cotizacion(id) ON DELETE CASCADE,
  proveedor_plan VARCHAR(255),
  inicio         DATE,
  costo          DECIMAL(10, 2) DEFAULT 0,
  num_personas   INTEGER
);

CREATE TABLE IF NOT EXISTS visa (
  id             SERIAL PRIMARY KEY,
  cotizacion_id  INTEGER NOT NULL REFERENCES cotizacion(id) ON DELETE CASCADE,
  pais           VARCHAR(255),
  costo          DECIMAL(10, 2) DEFAULT 0,
  tiempo         VARCHAR(255),
  num_personas   INTEGER
);

-- -----------------------------------------------------------------------------
-- 2. EXISTING TABLE FIXES
--    The viaje and vuelo tables were using price_quote_id as the FK column name.
--    Standardise everything to cotizacion_id.
--    Skip these two ALTER statements if your columns are already named cotizacion_id.
-- -----------------------------------------------------------------------------

-- viaje: rename price_quote_id → cotizacion_id (only if it exists as price_quote_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'viaje' AND column_name = 'price_quote_id'
  ) THEN
    ALTER TABLE viaje RENAME COLUMN price_quote_id TO cotizacion_id;
  END IF;
END $$;

-- vuelo: rename price_quote_id → cotizacion_id (only if it exists as price_quote_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vuelo' AND column_name = 'price_quote_id'
  ) THEN
    ALTER TABLE vuelo RENAME COLUMN price_quote_id TO cotizacion_id;
  END IF;
END $$;

-- hotel: rename price_quote_id → cotizacion_id (only if it exists as price_quote_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hotel' AND column_name = 'price_quote_id'
  ) THEN
    ALTER TABLE hotel RENAME COLUMN price_quote_id TO cotizacion_id;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. REMOVE REDUNDANT COLUMNS FROM cotizacion
--    These costs now live in their respective service tables.
-- -----------------------------------------------------------------------------

ALTER TABLE cotizacion
  DROP COLUMN IF EXISTS transfers,
  DROP COLUMN IF EXISTS insurance,
  DROP COLUMN IF EXISTS data_plan,
  DROP COLUMN IF EXISTS visa,
  DROP COLUMN IF EXISTS messages;

-- =============================================================================
-- Done.
-- =============================================================================
