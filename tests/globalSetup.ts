import "dotenv/config";

import { DATABASE_SCHEMA, prisma } from "@/lib/prisma";

// La suite trunca las tablas en cada test, así que corre contra un schema dedicado. La guarda no mira
// el host —apuntar a un servidor remoto es legítimo— sino el schema: si quedó en "public" es que la URL
// no traía `?schema=`, y eso pasa justo cuando se corre `vitest` a secas sin `dotenv -e .env.test` y se
// cae al `.env` de desarrollo. Truncar ahí borra datos reales.
function assertDedicatedSchema(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error("Falta DATABASE_URL. Copia .env.template a .env antes de correr los tests.");
  }

  if (DATABASE_SCHEMA === "public") {
    throw new Error(
      'Los tests truncan todas las tablas y DATABASE_URL apunta al schema "public".\n' +
        "Usa `npm test` (que inyecta .env.test) o agrega `?schema=<otro>` a la URL.",
    );
  }
}

export default async function setup(): Promise<void> {
  assertDedicatedSchema();

  const rows = await prisma.$queryRawUnsafe<{ table: string | null }[]>(
    "SELECT to_regclass($1)::text AS table",
    `"${DATABASE_SCHEMA}"."place"`,
  );
  if (!rows[0]?.table) {
    throw new Error(
      `No existe la tabla "place" en el schema "${DATABASE_SCHEMA}". Aplica las migraciones con \`npm run test:setup\`.`,
    );
  }

  console.warn(`\n⚠️  Los tests VACÍAN el schema "${DATABASE_SCHEMA}".\n`);

  await prisma.$disconnect();
}
