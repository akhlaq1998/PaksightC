import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  if (env.disableBootstrap) return new NextResponse("Disabled", { status: 410 });
  const token = req.headers.get("X-Bootstrap-Token");
  if (!token || token !== env.bootstrapToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const {
    admin_email,
    admin_password,
    admin_name,
    admin_org,
    member_email,
    member_password,
    member_name,
    member_org,
  } = body || {};

  // If Supabase configured, here we would call Admin API to create users.
  // Dev fallback: create LocalUser and Profile directly
  const adminProfile = await prisma.profile.upsert({
    where: { email: admin_email },
    update: { role: "ADMIN", status: "active", name: admin_name, org: admin_org },
    create: { id: crypto.randomUUID(), email: admin_email, role: "ADMIN", status: "active", name: admin_name, org: admin_org },
  });
  const memberProfile = await prisma.profile.upsert({
    where: { email: member_email },
    update: { role: "MEMBER", status: "active", name: member_name, org: member_org },
    create: { id: crypto.randomUUID(), email: member_email, role: "MEMBER", status: "active", name: member_name, org: member_org },
  });

  const adminHash = await bcrypt.hash(admin_password, 10);
  const memberHash = await bcrypt.hash(member_password, 10);

  await prisma.localUser.upsert({
    where: { email: admin_email },
    update: { passwordHash: adminHash, profileId: adminProfile.id },
    create: { email: admin_email, passwordHash: adminHash, profileId: adminProfile.id },
  });
  await prisma.localUser.upsert({
    where: { email: member_email },
    update: { passwordHash: memberHash, profileId: memberProfile.id },
    create: { email: member_email, passwordHash: memberHash, profileId: memberProfile.id },
  });

  return NextResponse.json({ ok: true });
}