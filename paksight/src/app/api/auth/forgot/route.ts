import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const user = await prisma.localUser.findUnique({ where: { email } });
  // Always respond 200 to avoid account enumeration
  if (!user) return NextResponse.json({ ok: true });

  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.resetToken.create({ data: { email, token, expiresAt } });

  const link = `${env.appBaseUrl}/reset?token=${token}`;
  await sendEmail({ to: email, subject: "PakSight password reset", html: `<p>Use the link below to reset your password. It expires in 60 minutes.</p><p><a href="${link}">${link}</a></p>` });

  return NextResponse.json({ ok: true });
}