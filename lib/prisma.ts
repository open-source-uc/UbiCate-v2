import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const POOL_MAX = Number(process.env.DATABASE_POOL_MAX) || 20;
const POOL_CONNECTION_TIMEOUT_MS = Number(process.env.DATABASE_POOL_TIMEOUT_MS) || 10_000;

const GLOBAL_PRISMA_KEY = "__ubicatePrisma";

function getGlobalPrisma(): PrismaClient {
  if (!(globalThis as any)[GLOBAL_PRISMA_KEY]) {
    const adapter = new PrismaPg({
      connectionString,
      max: POOL_MAX,
      connectionTimeoutMillis: POOL_CONNECTION_TIMEOUT_MS,
      idleTimeoutMillis: 30_000,
    });
    (globalThis as any)[GLOBAL_PRISMA_KEY] = new PrismaClient({ adapter });
  }
  return (globalThis as any)[GLOBAL_PRISMA_KEY] as PrismaClient;
}

const prisma = getGlobalPrisma();

export { prisma };
