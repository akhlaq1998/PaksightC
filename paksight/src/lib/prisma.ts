import { PrismaClient } from "@prisma/client";

let prismaInstance: PrismaClient | null = null;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaInstance) {
      prismaInstance = new PrismaClient({ log: ["warn", "error"] });
    }
    // @ts-ignore dynamic proxy
    return prismaInstance[prop];
  },
});