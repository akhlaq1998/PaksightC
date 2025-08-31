import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { name, org, role, email, reason } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const record = await prisma.accessRequest.create({ data: { name, org, role, email, reason } });
  const subject = `PakSight access request: ${name} (${email})`;
  const html = `<p>Name: ${name}</p><p>Email: ${email}</p><p>Org: ${org || "-"}</p><p>Role: ${role || "-"}</p><p>Reason: ${reason || "-"}</p>`;
  await sendEmail({ to: "akhlaqahmadeu@gmail.com", subject, html });
  return NextResponse.json({ ok: true, id: record.id });
}