import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const t = await prisma.resetToken.findUnique({ where: { token } });
  if (!t || t.used || new Date(t.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
  const user = await prisma.localUser.findUnique({ where: { email: t.email } });
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  const hash = await bcrypt.hash(password, 10);
  await prisma.localUser.update({ where: { id: user.id }, data: { passwordHash: hash } });
  await prisma.resetToken.update({ where: { id: t.id }, data: { used: true } });
  return NextResponse.json({ ok: true });
}