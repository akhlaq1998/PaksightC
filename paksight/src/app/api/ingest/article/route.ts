import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyIngestKey } from "@/lib/ingest";
import type { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const ok = await verifyIngestKey(req.headers.get("X-INGEST-KEY"));
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const externalId = body.external_id || null;
  const hash = body.hash || null;

  let outletId: number | null = body.outlet_id || null;
  if (!outletId && (body.outlet_name || body.outlet_domain)) {
    // try find or create outlet
    const outlet = await prisma.outlet.upsert({
      where: body.outlet_domain ? { domain: body.outlet_domain } : { id: -1 },
      update: {},
      create: { name: body.outlet_name || body.outlet_domain || "Unknown", domain: body.outlet_domain || `unknown-${Date.now()}` , countryIso: body.country_iso || "PK" },
    }).catch(async () => {
      // If domain missing, just create a generic record
      return prisma.outlet.create({ data: { name: body.outlet_name || "Unknown", domain: `unknown-${Date.now()}` , countryIso: body.country_iso || "PK" } });
    });
    outletId = outlet.id;
  }

  const data: Prisma.ArticleUncheckedCreateInput = {
    externalId: externalId ?? undefined,
    url: body.url,
    canonicalUrl: body.canonical_url ?? undefined,
    title: body.title,
    summary: body.summary ?? undefined,
    content: body.content ?? undefined,
    publishedAt: body.published_at ? new Date(body.published_at) : undefined,
    outletId: outletId ?? undefined,
    countryIso: body.country_iso ?? undefined,
    language: body.language ?? undefined,
    topics: body.topics ?? undefined,
    entities: body.entities ?? undefined,
    sentimentLabel: body.sentiment?.label ?? undefined,
    sentimentScore: typeof body.sentiment?.score === 'number' ? body.sentiment.score : undefined,
    paywalled: Boolean(body.paywalled) || false,
    hash: hash ?? undefined,
  };

  // Upsert by externalId or hash if provided, else create
  if (externalId) {
    const existing = await prisma.article.findFirst({ where: { externalId } });
    if (existing) {
      const updated = await prisma.article.update({ where: { id: existing.id }, data });
      return NextResponse.json({ ok: true, id: updated.id });
    }
  }
  if (!externalId && hash) {
    const existing = await prisma.article.findFirst({ where: { hash } });
    if (existing) {
      const updated = await prisma.article.update({ where: { id: existing.id }, data });
      return NextResponse.json({ ok: true, id: updated.id });
    }
  }

  const created = await prisma.article.create({ data });
  return NextResponse.json({ ok: true, id: created.id });
}