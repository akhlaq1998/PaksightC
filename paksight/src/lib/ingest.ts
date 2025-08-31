import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function verifyIngestKey(headerKey?: string | null): Promise<boolean> {
  if (!headerKey) return false;
  // Allow env boot key directly
  if (env.ingestBootKey && headerKey === env.ingestBootKey) return true;
  const keys = await prisma.ingestKey.findMany({ where: { active: true } });
  for (const k of keys) {
    try {
      if (await bcrypt.compare(headerKey, k.keyHash)) return true;
    } catch {}
  }
  return false;
}