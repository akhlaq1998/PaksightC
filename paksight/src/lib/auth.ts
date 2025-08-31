import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "paksight_session";

export type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
};

export async function signInWithPassword(email: string, password: string) {
  const user = await prisma.localUser.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  const profile = await prisma.profile.findUnique({ where: { id: user.profileId } });
  if (!profile) return null;
  const session: SessionUser = { id: profile.id, email: profile.email, role: profile.role as any };
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), { httpOnly: true, sameSite: "lax", path: "/" });
  return session;
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function requireRole(user: SessionUser | null, roles: Array<SessionUser["role"]>) {
  return Boolean(user && roles.includes(user.role));
}