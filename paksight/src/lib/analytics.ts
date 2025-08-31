import { prisma } from "@/lib/prisma";
import { toDateOnly, addDays } from "@/lib/dates";

export async function recomputeHeatmap(days: number = 30) {
  const now = new Date();
  const from = addDays(toDateOnly(now), -days);
  // Clear existing window
  await prisma.metricsCountryDaily.deleteMany({ where: { date: { gte: from } } });

  // Fetch relevant articles
  const arts = await prisma.article.findMany({
    where: { publishedAt: { not: null, gte: from } },
    select: { publishedAt: true, countryIso: true, sentimentLabel: true },
  });

  const map = new Map<string, { count: number; pos: number; neg: number; neu: number }>();
  for (const a of arts) {
    const day = toDateOnly(a.publishedAt as Date);
    const key = `${day.toISOString()}|${a.countryIso || "UNKNOWN"}`;
    const bucket = map.get(key) || { count: 0, pos: 0, neg: 0, neu: 0 };
    bucket.count += 1;
    if (a.sentimentLabel === "positive") bucket.pos += 1;
    else if (a.sentimentLabel === "negative") bucket.neg += 1;
    else bucket.neu += 1;
    map.set(key, bucket);
  }

  for (const [k, v] of map.entries()) {
    const [dateIso, countryIso] = k.split("|");
    await prisma.metricsCountryDaily.create({
      data: {
        date: new Date(dateIso),
        countryIso,
        count: v.count,
        pos: v.pos,
        neg: v.neg,
        neu: v.neu,
      },
    });
  }
}

export async function getHeatmap(from: Date, to: Date, focus: string) {
  if (focus === "GLOBAL") {
    const rows = await prisma.metricsCountryDaily.groupBy({
      by: ["countryIso"],
      where: { date: { gte: from, lte: to } },
      _sum: { count: true, pos: true, neg: true, neu: true },
    });
    return rows.map(r => ({
      country_iso: r.countryIso,
      count: r._sum.count || 0,
      pos: r._sum.pos || 0,
      neg: r._sum.neg || 0,
      neu: r._sum.neu || 0,
    }));
  }
  const rows = await prisma.metricsCountryDaily.findMany({
    where: { date: { gte: from, lte: to }, countryIso: focus },
    orderBy: { date: "asc" },
  });
  return rows.map(r => ({
    country_iso: r.countryIso,
    date: r.date.toISOString().slice(0, 10),
    count: r.count,
    pos: r.pos,
    neg: r.neg,
    neu: r.neu,
  }));
}

export async function recomputeTrending(hours: number = 72) {
  const now = new Date();
  const from = new Date(now.getTime() - hours * 3600 * 1000);
  await prisma.metricsTrending.deleteMany({ where: { windowStart: { gte: from } } });
  const arts = await prisma.article.findMany({
    where: { publishedAt: { not: null, gte: from } },
    select: { publishedAt: true, countryIso: true, topics: true, entities: true },
  });
  const buckets = new Map<string, { score: number; sampleCount: number }>();
  for (const a of arts) {
    const ageH = (now.getTime() - (a.publishedAt as Date).getTime()) / 3600000;
    let weight = 0.2;
    if (ageH <= 6) weight = 1.0;
    else if (ageH <= 24) weight = 0.5;
    const topicsRaw: unknown = a.topics as unknown;
    const entitiesRaw: unknown = a.entities as unknown;
    const topics: string[] = Array.isArray(topicsRaw) ? (topicsRaw as string[]) : [];
    const entities: string[] = Array.isArray(entitiesRaw) ? (entitiesRaw as string[]) : [];
    for (const keyItem of [...topics, ...entities]) {
      const key = `${a.countryIso || "GLOBAL"}|${keyItem}`;
      const bucket = buckets.get(key) || { score: 0, sampleCount: 0 };
      bucket.score += weight;
      bucket.sampleCount += 1;
      buckets.set(key, bucket);
      // Also GLOBAL
      const gKey = `GLOBAL|${keyItem}`;
      const gBucket = buckets.get(gKey) || { score: 0, sampleCount: 0 };
      gBucket.score += weight;
      gBucket.sampleCount += 1;
      buckets.set(gKey, gBucket);
    }
  }
  for (const [k, v] of buckets.entries()) {
    const [country, topic] = k.split("|");
    await prisma.metricsTrending.create({
      data: {
        windowStart: from,
        windowEnd: now,
        countryIso: country,
        topicOrEntity: topic,
        score: v.score,
        sampleCount: v.sampleCount,
      },
    });
  }
}

export async function getTrending(window: string, country: string) {
  const now = new Date();
  const hours = window === "24h" ? 24 : window === "7d" ? 24 * 7 : 24 * 30;
  const from = new Date(now.getTime() - hours * 3600000);
  const rows = await prisma.metricsTrending.findMany({
    where: { windowEnd: { gte: from }, countryIso: country },
    orderBy: [{ score: "desc" }],
    take: 20,
  });
  return rows.map(r => ({ topic_or_entity: r.topicOrEntity, score: r.score, sample_count: r.sampleCount }));
}