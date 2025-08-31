import { NextRequest, NextResponse } from "next/server";
import { verifyIngestKey } from "@/lib/ingest";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const ok = await verifyIngestKey(req.headers.get("X-INGEST-KEY"));
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { service, status, note } = await req.json();
  if (!service || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const hb = await prisma.healthbeat.create({ data: { service, status, note } });
  return NextResponse.json({ ok: true, id: hb.id });
}