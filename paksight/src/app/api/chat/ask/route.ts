import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { mapRegionToCountries } from "@/lib/regions";
import { rateLimit } from "@/lib/rateLimit";

type WindowRange = { from: string; to: string };
function isWindowRange(x: unknown): x is WindowRange {
  if (typeof x !== "object" || x === null) return false;
  return "from" in x && "to" in x;
}

function normalizeWindow(input?: unknown): { from: Date; to: Date; label: string } {
  const now = new Date();
  if (!input) return { from: new Date(now.getTime() - 7*24*3600*1000), to: now, label: "7d" };
  if (typeof input === "string") {
    const s = input.toLowerCase();
    if (s.includes("24h")) return { from: new Date(now.getTime() - 24*3600*1000), to: now, label: "24h" };
    if (s.includes("7d") || s.includes("week")) return { from: new Date(now.getTime() - 7*24*3600*1000), to: now, label: "7d" };
    if (s.includes("30d") || s.includes("month")) return { from: new Date(now.getTime() - 30*24*3600*1000), to: now, label: "30d" };
  }
  if (isWindowRange(input)) {
    const from = new Date(input.from);
    const to = new Date(input.to);
    if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
      return { from, to, label: `${from.toISOString().slice(0,10)}..${to.toISOString().slice(0,10)}` };
    }
  }
  return { from: new Date(now.getTime() - 7*24*3600*1000), to: now, label: "7d" };
}

function isPakistanQuery(question: string): boolean {
  const q = question.toLowerCase();
  return q.includes("pakistan") || q.includes("pakistani") || q.includes("pk ");
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`chat:${ip}`, 10, 60_000)) return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  const c = await cookies();
  const raw = c.get("paksight_session")?.value;
  let role: "ADMIN" | "MEMBER" | "VIEWER" = "VIEWER";
  try { if (raw) role = JSON.parse(raw).role; } catch {}
  if (!(role === "ADMIN" || role === "MEMBER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { question, filters } = await req.json();
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  }

  if (!isPakistanQuery(question)) {
    return NextResponse.json({
      title: "Out of scope",
      scope: "PakSight answers only strategic media-intelligence questions about Pakistan.",
      suggestion: "Try: What is sentiment on Pakistan in European media this week?",
    }, { status: 200 });
  }

  const { from, to, label } = normalizeWindow(filters?.window);
  const countries = await mapRegionToCountries(filters?.region);

  // Retrieve relevant articles: simple recency + textual filter on title/summary
  const arts = await prisma.article.findMany({
    where: {
      publishedAt: { gte: from, lte: to },
      countryIso: { in: countries },
      OR: [
        { title: { contains: "Pakistan" } },
        { summary: { contains: "Pakistan" } },
        { content: { contains: "Pakistan" } },
      ],
    },
    orderBy: [{ publishedAt: "desc" }],
    take: 200,
    include: { Outlet: true },
  });

  const N = arts.length;
  // Sentiment distribution and mean
  let pos = 0, neg = 0, neu = 0; let sum = 0; let countScore = 0;
  const entityCounts = new Map<string, number>();
  const topicCounts = new Map<string, number>();
  const outletStats = new Map<string, { n: number; sum: number }>();

  for (const a of arts) {
    if (a.sentimentLabel === "positive") pos++; else if (a.sentimentLabel === "negative") neg++; else neu++;
    if (typeof a.sentimentScore === 'number') { sum += a.sentimentScore; countScore++; }
    const ents: unknown = a.entities as unknown;
    const tops: unknown = a.topics as unknown;
    if (Array.isArray(ents)) for (const e of ents as string[]) entityCounts.set(e, (entityCounts.get(e) || 0) + 1);
    if (Array.isArray(tops)) for (const t of tops as string[]) topicCounts.set(t, (topicCounts.get(t) || 0) + 1);
    const outletName = a.Outlet?.name || "Unknown";
    const curr = outletStats.get(outletName) || { n: 0, sum: 0 };
    curr.n += 1;
    curr.sum += typeof a.sentimentScore === 'number' ? a.sentimentScore : 0;
    outletStats.set(outletName, curr);
  }

  // Volume WoW: prior window of same length
  const windowMs = to.getTime() - from.getTime();
  const prevFrom = new Date(from.getTime() - windowMs);
  const prevTo = new Date(to.getTime() - windowMs);
  const prevN = await prisma.article.count({ where: { publishedAt: { gte: prevFrom, lte: prevTo }, countryIso: { in: countries } } });
  const delta = prevN === 0 ? (N > 0 ? 1 : 0) : (N - prevN) / prevN;

  const mean = countScore ? (sum / countScore) : 0;
  const total = Math.max(1, N);
  const pct = (v: number) => Math.round((v / total) * 100);

  const topEntities = [...entityCounts.entries()].sort((a,b) => b[1]-a[1]).slice(0,5).map(([k]) => k);
  const topTopics = [...topicCounts.entries()].sort((a,b) => b[1]-a[1]).slice(0,5).map(([k]) => k);
  const notableOutlets = [...outletStats.entries()].sort((a,b) => b[1].n - a[1].n).slice(0,5).map(([name, s]) => ({ name, tilt: s.n ? s.sum / s.n : 0, n: s.n }));

  // Citations: 3-6 diverse by outlet and recency
  const seenOut = new Set<string>();
  const cites: Array<{ outlet: string; date: string }> = [];
  for (const a of arts) {
    const outlet = a.Outlet?.name || "Unknown";
    if (seenOut.has(outlet)) continue;
    if (!a.publishedAt) continue;
    cites.push({ outlet, date: (a.publishedAt as Date).toISOString().slice(0,10) });
    seenOut.add(outlet);
    if (cites.length >= 6) break;
  }
  if (cites.length < 3) {
    for (const a of arts) {
      if (!a.publishedAt) continue;
      cites.push({ outlet: a.Outlet?.name || "Unknown", date: (a.publishedAt as Date).toISOString().slice(0,10) });
      if (cites.length >= 3) break;
    }
  }

  const title = `Pakistan media sentiment — ${filters?.region || 'GLOBAL'} — ${label}`;
  const scope = `${(filters?.region || 'GLOBAL')} • ${from.toISOString().slice(0,10)}..${to.toISOString().slice(0,10)} • ${N} articles`;
  const sentimentLine = `Mean ${mean.toFixed(2)} • +${pct(pos)}% / ${pct(neu)}% / -${pct(neg)}%`;
  const volLine = `Volume ${N} • Δ ${(delta*100).toFixed(0)}% vs prior window`;
  const themes = topTopics.length ? topTopics.join(", ") : (topEntities.length ? topEntities.join(", ") : "—");
  const outletsLine = notableOutlets.map(o => `${o.name} (${o.tilt.toFixed(2)})`).join(", ");
  const confidence = N < 5 ? "Low" : N < 20 ? "Medium" : "High";
  const confidenceReason = N < 5 ? "Sparse data; consider widening window/region." : (N < 20 ? "Limited sample size." : "Good sample coverage.");

  const response = {
    title,
    scope,
    sentiment: sentimentLine,
    volume: volLine,
    top_themes_entities: themes,
    notable_outlets: outletsLine,
    citations: cites,
    confidence: `${confidence} — ${confidenceReason}`,
  };

  return NextResponse.json(response);
}