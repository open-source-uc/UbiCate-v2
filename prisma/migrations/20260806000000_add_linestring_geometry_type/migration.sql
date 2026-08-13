-- AlterEnum
-- Va en su propia migración: Postgres no permite USAR un valor de enum agregado con ALTER TYPE
-- dentro de la misma transacción en que se creó, y Prisma envuelve cada migración en una transacción.
ALTER TYPE "GeoGeometryType" ADD VALUE IF NOT EXISTS 'LineString';
