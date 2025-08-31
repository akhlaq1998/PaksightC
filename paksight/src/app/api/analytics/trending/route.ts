import { NextRequest, NextResponse } from "next/server";
import { getTrending } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const window = searchParams.get("window") || "24h";
  const country = searchParams.get("country") || "GLOBAL";
  const data = await getTrending(window, country);
  return NextResponse.json(data);
}