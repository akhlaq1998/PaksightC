import { cookies } from "next/headers";
import DashboardClient from "./DashboardClient";

async function getSessionUser() {
  const c = await cookies();
  const raw = c.get("paksight_session")?.value;
  if (!raw) return null;
  try { return JSON.parse(raw) as { role: "ADMIN" | "MEMBER" | "VIEWER" }; } catch { return null; }
}

function todayStr() { return new Date().toISOString().slice(0,10); }
function daysAgoStr(n: number) { const d = new Date(Date.now() - n*24*3600*1000); return d.toISOString().slice(0,10); }

export default async function DashboardPage() {
  const user = await getSessionUser();
  const isViewer = user?.role === "VIEWER";
  const from = daysAgoStr(30);
  const to = todayStr();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Dashboard</h1>
      <DashboardClient isViewer={Boolean(isViewer)} from={from} to={to} />
    </div>
  );
}