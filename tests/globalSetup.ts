import "dotenv/config";

import { prisma } from "@/lib/prisma";

export default async function setup(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("Falta DATABASE_URL. Copia .env.template a .env antes de correr los tests.");
  }

  const rows = await prisma.$queryRaw<{ table: string | null }[]>`SELECT to_regclass('place')::text AS table`;
  if (!rows[0]?.table) {
    throw new Error('No existe la tabla "place". Aplica las migraciones con `npm run db:deploy`.');
  }

  console.warn("\n⚠️  Los tests VACÍAN el schema al que apunta DATABASE_URL. Repuébla con `npm run db:reset` al terminar.\n");

  await prisma.$disconnect();
}
