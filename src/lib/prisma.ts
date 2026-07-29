import { PrismaClient } from "@prisma/client";

// Singleton : en développement, le rechargement à chaud recrée le module à
// chaque modification et épuiserait le pool de connexions sans ce cache global.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
