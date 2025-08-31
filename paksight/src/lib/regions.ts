import { prisma } from "@/lib/prisma";

const FALLBACK: Record<string, string[]> = {
  GLOBAL: ["PK","GB","US","IN","AF","HU"],
  EUROPE: ["GB","HU"],
  US: ["US"],
  SOUTH_ASIA: ["PK","IN","AF"],
};

export async function mapRegionToCountries(region: string | undefined): Promise<string[]> {
  if (!region) return FALLBACK.GLOBAL;
  const key = region.toUpperCase();
  if (FALLBACK[key]) return FALLBACK[key];
  // Try DB regions matching
  const rows = await prisma.country.findMany({ where: { region: { not: null } }, select: { iso: true, region: true } });
  const matched = rows.filter(r => r.region?.toUpperCase() === key).map(r => r.iso);
  if (matched.length) return matched;
  return FALLBACK.GLOBAL;
}