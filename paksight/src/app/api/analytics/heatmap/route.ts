import { NextRequest, NextResponse } from "next/server";
import { parseDateYYYYMMDD } from "@/lib/dates";
import { getHeatmap } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const focus = searchParams.get("focus") || "PK";
  const from = parseDateYYYYMMDD(fromStr) || new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const to = parseDateYYYYMMDD(toStr) || new Date();
  const data = await getHeatmap(from, to, focus);
  return NextResponse.json(data);
}