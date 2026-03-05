-- Migration to drop obsolete column 'precio_base'
-- This column is not in schema.sql and causes errors on INSERT because it has no default value.

ALTER TABLE rutas DROP COLUMN precio_base;
