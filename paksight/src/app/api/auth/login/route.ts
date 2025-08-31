import { NextRequest, NextResponse } from "next/server";
import { signInWithPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }
  const session = await signInWithPassword(email, password);
  if (!session) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const redirect = session.role === "ADMIN" ? "/admin" : "/dashboard";
  return NextResponse.json({ ok: true, redirect });
}