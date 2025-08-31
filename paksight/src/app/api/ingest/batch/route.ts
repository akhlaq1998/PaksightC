import { NextRequest, NextResponse } from "next/server";
import { verifyIngestKey } from "@/lib/ingest";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`ingest-batch:${ip}`, 20, 60_000)) return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  const ok = await verifyIngestKey(req.headers.get("X-INGEST-KEY"));
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const arr = await req.json();
  if (!Array.isArray(arr)) return NextResponse.json({ error: "Expected array" }, { status: 400 });

  const baseUrl = new URL(req.url);
  const singleUrl = `${baseUrl.origin}/api/ingest/article`;
  const results: Array<{ status: number; data: unknown }> = [];
  for (const item of arr) {
    const res = await fetch(singleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-INGEST-KEY": req.headers.get("X-INGEST-KEY") || "" },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    results.push({ status: res.status, data });
  }
  return NextResponse.json({ ok: true, results });
}