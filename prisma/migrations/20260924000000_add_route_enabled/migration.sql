-- Rutas deshabilitadas: solo se ven en modo debug. Default true para que las rutas existentes sigan visibles.
ALTER TABLE "route" ADD COLUMN "enabled" BOOLEAN NOT NULL DEFAULT true;
