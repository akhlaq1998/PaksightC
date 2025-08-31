import { NextRequest, NextResponse } from "next/server";
import { recomputeTrending } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hours = Number(searchParams.get("hours") || 72);
  await recomputeTrending(hours);
  return NextResponse.json({ ok: true });
}