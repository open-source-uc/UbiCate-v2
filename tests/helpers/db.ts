import { cache } from "@/lib/db/cache";
import { DATABASE_SCHEMA, prisma } from "@/lib/prisma";

const TABLES = [
  "place_category",
  "place_floor",
  "event_place",
  "route_place",
  "event",
  "route",
  "place",
  "category",
  "floor",
  "campus",
];

// Calificado con el schema: sin esto el TRUNCATE lo resuelve el search_path (o sea "public") y
// vaciaría un schema distinto del que consulta Prisma, que se califica con DATABASE_SCHEMA.
const TRUNCATE = `TRUNCATE TABLE ${TABLES.map((t) => `"${DATABASE_SCHEMA}"."${t}"`).join(",")} RESTART IDENTITY CASCADE`;

export async function resetDb(): Promise<void> {
  await prisma.$executeRawUnsafe(TRUNCATE);
}

// La Capa 1 es un singleton en globalThis y sobrevive entre tests: sin esto un test leería los datos
// que dejó cacheados el anterior.
export function resetCache(): void {
  cache.invalidate();
}

export async function resetAll(): Promise<void> {
  await resetDb();
  resetCache();
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
