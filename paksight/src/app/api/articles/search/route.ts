import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const country = searchParams.get("country") || undefined;
  const lang = searchParams.get("lang") || undefined;
  const sentiment = searchParams.get("sentiment") || undefined;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const size = Math.min(50, Math.max(1, Number(searchParams.get("size") || 10)));

  const where: Prisma.ArticleWhereInput = {};
  if (q) where.OR = [{ title: { contains: q } }, { summary: { contains: q } }];
  if (country) where.countryIso = country;
  if (lang) where.language = lang;
  if (sentiment) where.sentimentLabel = sentiment;

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * size,
      take: size,
      select: { id: true, title: true, countryIso: true, language: true, publishedAt: true, sentimentLabel: true, Outlet: { select: { name: true } } },
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, size });
}