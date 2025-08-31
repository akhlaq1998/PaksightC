import { NextRequest, NextResponse } from "next/server";
import { recomputeHeatmap } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") || 30);
  await recomputeHeatmap(days);
  return NextResponse.json({ ok: true });
}