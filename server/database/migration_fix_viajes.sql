-- Migration to fix 'viajes' table
-- 1. Rename 'fecha' to 'fecha_salida' (if exists)
-- 2. Add 'asientos_ocupados'
-- 3. Ensure 'asientos_disponibles' exists (it does in DB, but good to be safe if we were idempotent, but simple ALTER is fine here)

-- We use specific ALTERs based on what we saw in the DB schema.
-- DB has: fecha, asientos_disponibles.
-- DB missing: fecha_salida, asientos_ocupados.

-- Check if 'fecha' exists and rename it. If 'fecha_salida' already exists, this might fail, so we should be careful.
-- However, given the error "Unknown column 'fecha_salida'", we know it's missing.

-- Safely try to rename fecha to fecha_salida.
-- We can't easily do "IF EXISTS" in pure SQL for column rename without procedure, so we'll just run it.
-- If 'fecha' doesn't exist, it might error, but the runner can handle it or we can ignore if previously run.

ALTER TABLE viajes CHANGE COLUMN fecha fecha_salida DATE NOT NULL;

-- Add incase it is missing
ALTER TABLE viajes ADD COLUMN asientos_ocupados INT DEFAULT 0;

-- Optional: If the DB has 'origen' and 'destino' in 'viajes' which are not in schema.sql, we could drop them to be clean, 
-- but they might be used by legacy code or just harmless. The error didn't mention them. 
-- We'll leave them for now to avoid breaking anything else.
