import "dotenv/config";

import { prisma } from "@/lib/prisma";

// La suite trunca las tablas en cada test. Si DATABASE_URL apuntara a un servidor compartido (las URLs
// de Azure que viven comentadas en .env), una corrida distraída borraría datos reales: se aborta antes
// de tocar nada.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function assertLocalDatabase(): void {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("Falta DATABASE_URL. Copia .env.template a .env antes de correr los tests.");
  }

  let host: string;
  try {
    host = new URL(raw).hostname.replace(/^\[|\]$/g, "");
  } catch {
    throw new Error("DATABASE_URL no es una URL válida.");
  }

  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(
      `Los tests truncan todas las tablas y DATABASE_URL apunta a "${host}", que no es local.\n` +
        "Apunta DATABASE_URL a tu Postgres local antes de correrlos.",
    );
  }
}

export default async function setup(): Promise<void> {
  assertLocalDatabase();

  const rows = await prisma.$queryRaw<{ table: string | null }[]>`SELECT to_regclass('public.place')::text AS table`;
  if (!rows[0]?.table) {
    throw new Error('No existe la tabla "place". Aplica las migraciones con `npm run db:deploy`.');
  }

  console.warn("\n⚠️  Los tests VACÍAN la base de datos local. Repuébla con `npm run db:reset` al terminar.\n");

  await prisma.$disconnect();
}
