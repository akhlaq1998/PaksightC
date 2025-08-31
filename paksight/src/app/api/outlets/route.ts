import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || undefined;
  const items = await prisma.outlet.findMany({
    where: country ? { countryIso: country } : undefined,
    orderBy: [{ countryIso: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(items);
}