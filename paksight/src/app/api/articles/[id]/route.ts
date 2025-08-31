import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const numericId = Number(id);
  if (!numericId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const a = await prisma.article.findUnique({ where: { id: numericId }, include: { Outlet: true } });
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(a);
}