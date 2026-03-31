-- ============================================================
-- Migración: columnas faltantes en todas las tablas del cotizador
-- Ejecutar UNA SOLA VEZ. Todos los ALTER usan IF NOT EXISTS.
-- ============================================================

-- cotizacion: campos de extras/servicios adicionales
ALTER TABLE "Cotizaciones" ADD COLUMN IF NOT EXISTS "pre_travel_itinerary" TEXT;
ALTER TABLE "Cotizaciones" ADD COLUMN IF NOT EXISTS "jacket"               INTEGER DEFAULT 0;
ALTER TABLE "Cotizaciones" ADD COLUMN IF NOT EXISTS "tickets"              INTEGER DEFAULT 0;
ALTER TABLE "Cotizaciones" ADD COLUMN IF NOT EXISTS "snacks"               INTEGER DEFAULT 0;
ALTER TABLE "Cotizaciones" ADD COLUMN IF NOT EXISTS "guide"                INTEGER DEFAULT 0;
ALTER TABLE "Cotizaciones" ADD COLUMN IF NOT EXISTS "ticketholder"         INTEGER DEFAULT 0;

-- Tablas de servicio: num_personas (NULL = todas las personas)
ALTER TABLE "Viajes"  ADD COLUMN IF NOT EXISTS "num_personas" INTEGER DEFAULT NULL;
ALTER TABLE "vuelo"   ADD COLUMN IF NOT EXISTS "num_personas" INTEGER DEFAULT NULL;
ALTER TABLE "crucero" ADD COLUMN IF NOT EXISTS "num_personas" INTEGER DEFAULT NULL;
ALTER TABLE "hotel"   ADD COLUMN IF NOT EXISTS "num_personas" INTEGER DEFAULT NULL;
