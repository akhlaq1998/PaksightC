import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const c = await cookies();
  const raw = c.get("paksight_session")?.value;
  if (!raw || JSON.parse(raw).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const r = await prisma.accessRequest.update({ where: { id }, data: { status: "approved" } });
  await sendEmail({ to: r.email, subject: "PakSight Access Approved", html: `<p>Your access request is approved. You will receive an invite soon.</p>` });
  return NextResponse.json({ ok: true });
}