import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }
  const user = await prisma.localUser.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const profile = await prisma.profile.findUnique({ where: { id: user.profileId } });
  if (!profile) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const session = { id: profile.id, email: profile.email, role: profile.role };
  const cookieStore = await cookies();
  cookieStore.set("paksight_session", JSON.stringify(session), { httpOnly: true, sameSite: "lax", path: "/" });
  const redirect = profile.role === "ADMIN" ? "/admin" : "/dashboard";
  return NextResponse.json({ ok: true, redirect });
}