import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const c = await cookies();
  const raw = c.get("paksight_session")?.value;
  if (!raw || JSON.parse(raw).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const items = await prisma.healthbeat.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ items });
}