import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function GET() {
  const c = await cookies();
  const raw = c.get("paksight_session")?.value;
  if (!raw || JSON.parse(raw).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const items = await prisma.ingestKey.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const c = await cookies();
  const raw = c.get("paksight_session")?.value;
  if (!raw || JSON.parse(raw).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name } = await req.json();
  const plaintext = randomUUID().replace(/-/g, "");
  const keyHash = await bcrypt.hash(plaintext, 10);
  const created = await prisma.ingestKey.create({ data: { name, keyHash } });
  return NextResponse.json({ id: created.id, name: created.name, plaintext });
}