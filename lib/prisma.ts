import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const POOL_MAX = Number(process.env.DATABASE_POOL_MAX) || 20;
const POOL_CONNECTION_TIMEOUT_MS = Number(process.env.DATABASE_POOL_TIMEOUT_MS) || 10_000;

const GLOBAL_PRISMA_KEY = "__ubicatePrisma";

// El `?schema=` de la URL lo honra el CLI de Prisma (migrate/seed), pero NO el runtime: con driver
// adapters el schema sale de este segundo argumento de PrismaPg, y sin él Prisma califica todo contra
// "public" ignorando también el search_path. Sin esto, apuntar los tests a un schema propio es un
// espejismo: el CLI migra "test" y las queries siguen leyendo y escribiendo "public".
function resolveSchema(url: string): string {
  try {
    return new URL(url).searchParams.get("schema") || "public";
  } catch {
    return "public";
  }
}

const DATABASE_SCHEMA = resolveSchema(connectionString);

function getGlobalPrisma(): PrismaClient {
  if (!(globalThis as any)[GLOBAL_PRISMA_KEY]) {
    const adapter = new PrismaPg(
      {
        connectionString,
        max: POOL_MAX,
        connectionTimeoutMillis: POOL_CONNECTION_TIMEOUT_MS,
        idleTimeoutMillis: 30_000,
      },
      { schema: DATABASE_SCHEMA },
    );
    (globalThis as any)[GLOBAL_PRISMA_KEY] = new PrismaClient({ adapter });
  }
  return (globalThis as any)[GLOBAL_PRISMA_KEY] as PrismaClient;
}

const prisma = getGlobalPrisma();

export { prisma, DATABASE_SCHEMA };
