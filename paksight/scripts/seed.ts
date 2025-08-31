import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Countries
  const countries = [
    { iso: "PK", name: "Pakistan", lat: 30.3753, lon: 69.3451, region: "South Asia" },
    { iso: "GB", name: "United Kingdom", lat: 55.3781, lon: -3.4360, region: "Europe" },
    { iso: "US", name: "United States", lat: 37.0902, lon: -95.7129, region: "Americas" },
    { iso: "IN", name: "India", lat: 20.5937, lon: 78.9629, region: "South Asia" },
    { iso: "AF", name: "Afghanistan", lat: 33.9391, lon: 67.7100, region: "South Asia" },
    { iso: "HU", name: "Hungary", lat: 47.1625, lon: 19.5033, region: "Europe" },
  ];
  for (const c of countries) {
    await prisma.country.upsert({ where: { iso: c.iso }, create: c, update: c });
  }

  // Outlets (subset for brevity)
  const outlets = [
    { name: "BBC", countryIso: "GB", domain: "bbc.co.uk" },
    { name: "Sky News", countryIso: "GB", domain: "news.sky.com" },
    { name: "Reuters", countryIso: "US", domain: "reuters.com" },
    { name: "AP News", countryIso: "US", domain: "apnews.com" },
    { name: "NDTV", countryIso: "IN", domain: "ndtv.com" },
    { name: "The Indian Express", countryIso: "IN", domain: "indianexpress.com" },
    { name: "TOLOnews", countryIso: "AF", domain: "tolonews.com" },
    { name: "Khaama Press", countryIso: "AF", domain: "khaama.com" },
    { name: "hvg.hu", countryIso: "HU", domain: "hvg.hu" },
    { name: "Index.hu", countryIso: "HU", domain: "index.hu" },
  ];
  for (const o of outlets) {
    await prisma.outlet.upsert({
      where: { domain: o.domain },
      update: o,
      create: { ...o },
    });
  }

  const outletByDomain: Record<string, number | undefined> = {};
  for (const o of outlets) {
    const found = await prisma.outlet.findFirst({ where: { domain: o.domain } });
    outletByDomain[o.domain] = found?.id;
  }

  const now = new Date();
  function hoursAgo(h: number) { return new Date(now.getTime() - h * 3600 * 1000); }

  const demoArticles = [
    { title: "Pakistan economy shows signs of stabilization", domain: "reuters.com", hours: 6, country: "US", label: "positive", score: 0.3, topics: ["Economy"], ents: ["Pakistan", "IMF"] },
    { title: "Debate over Pakistan's political reforms intensifies", domain: "bbc.co.uk", hours: 12, country: "GB", label: "neutral", score: 0.0, topics: ["Politics"], ents: ["Pakistan"] },
    { title: "Flood recovery in Pakistan continues", domain: "apnews.com", hours: 30, country: "US", label: "positive", score: 0.25, topics: ["Climate"], ents: ["Pakistan"] },
    { title: "India media on Pakistan cricket performance", domain: "ndtv.com", hours: 8, country: "IN", label: "neutral", score: 0.05, topics: ["Sports"], ents: ["Pakistan"] },
    { title: "UK outlets discuss Pakistan-UK trade ties", domain: "news.sky.com", hours: 48, country: "GB", label: "positive", score: 0.2, topics: ["Trade"], ents: ["Pakistan", "UK"] },
    { title: "Hungary commentary on Pakistan foreign policy", domain: "hvg.hu", hours: 60, country: "HU", label: "neutral", score: 0.0, topics: ["Foreign Policy"], ents: ["Pakistan"] },
    { title: "Security concerns near Pakistan border", domain: "tolonews.com", hours: 15, country: "AF", label: "negative", score: -0.3, topics: ["Security"], ents: ["Pakistan"] },
    { title: "Pakistani diaspora initiatives in US", domain: "reuters.com", hours: 20, country: "US", label: "positive", score: 0.35, topics: ["Society"], ents: ["Pakistan"] },
    { title: "Media focus on Pakistan education reforms", domain: "bbc.co.uk", hours: 70, country: "GB", label: "positive", score: 0.25, topics: ["Education"], ents: ["Pakistan"] },
    { title: "Pakistan inflation trends discussed", domain: "apnews.com", hours: 90, country: "US", label: "negative", score: -0.2, topics: ["Economy"], ents: ["Pakistan"] },
    { title: "India TV panel on Pakistan relations", domain: "indianexpress.com", hours: 44, country: "IN", label: "neutral", score: 0.0, topics: ["Foreign Policy"], ents: ["Pakistan"] },
    { title: "Afghan press covers Pakistan peace talks", domain: "khaama.com", hours: 36, country: "AF", label: "positive", score: 0.2, topics: ["Security"], ents: ["Pakistan"] },
    { title: "Hungary daily on Pakistan culture festival", domain: "index.hu", hours: 28, country: "HU", label: "positive", score: 0.3, topics: ["Culture"], ents: ["Pakistan"] },
    { title: "US coverage of Pakistan energy crisis", domain: "reuters.com", hours: 110, country: "US", label: "negative", score: -0.25, topics: ["Energy"], ents: ["Pakistan"] },
    { title: "UK op-ed: Pakistan and climate finance", domain: "bbc.co.uk", hours: 130, country: "GB", label: "positive", score: 0.28, topics: ["Climate"], ents: ["Pakistan", "IMF"] },
    { title: "Pakistan startup ecosystem news", domain: "apnews.com", hours: 10, country: "US", label: "positive", score: 0.32, topics: ["Technology"], ents: ["Pakistan"] },
    { title: "Regional view: Pakistan and Central Asia", domain: "index.hu", hours: 200, country: "HU", label: "neutral", score: 0.0, topics: ["Foreign Policy"], ents: ["Pakistan"] },
    { title: "Afghan outlet: Pakistan border trade", domain: "tolonews.com", hours: 180, country: "AF", label: "positive", score: 0.22, topics: ["Trade"], ents: ["Pakistan"] },
    { title: "India: Pakistan and SAARC dynamics", domain: "ndtv.com", hours: 160, country: "IN", label: "neutral", score: 0.0, topics: ["Regional"], ents: ["Pakistan"] },
    { title: "Hungary editorial: Pakistan tourism growth", domain: "hvg.hu", hours: 140, country: "HU", label: "positive", score: 0.27, topics: ["Tourism"], ents: ["Pakistan"] },
  ];

  for (let i = 0; i < demoArticles.length; i++) {
    const a = demoArticles[i];
    const outletId = outletByDomain[a.domain];
    await prisma.article.create({
      data: {
        externalId: `seed:${i}`,
        outletId: outletId,
        url: `https://example.com/${encodeURIComponent(a.title.toLowerCase().replace(/\s+/g, '-'))}`,
        title: a.title,
        summary: `${a.title} — summary about Pakistan context.`,
        publishedAt: hoursAgo(a.hours),
        language: "en",
        countryIso: a.country,
        sentimentLabel: a.label,
        sentimentScore: a.score,
        topics: a.topics as unknown as any,
        entities: a.ents as unknown as any,
      },
    });
  }

  // Demo users (dev auth)
  const adminEmail = "admin@paksight.app";
  const memberEmail = "member@paksight.app";

  const adminProfile = await prisma.profile.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", status: "active", name: "PakSight Admin", org: "PakSight" },
    create: { id: crypto.randomUUID(), email: adminEmail, role: "ADMIN", status: "active", name: "PakSight Admin", org: "PakSight" },
  });
  const memberProfile = await prisma.profile.upsert({
    where: { email: memberEmail },
    update: { role: "MEMBER", status: "active", name: "Demo Member", org: "Demo Org" },
    create: { id: crypto.randomUUID(), email: memberEmail, role: "MEMBER", status: "active", name: "Demo Member", org: "Demo Org" },
  });

  const adminHash = await bcrypt.hash("StrongPass!234", 10);
  const memberHash = await bcrypt.hash("MemberPass!234", 10);

  await prisma.localUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminHash, profileId: adminProfile.id },
    create: { email: adminEmail, passwordHash: adminHash, profileId: adminProfile.id },
  });
  await prisma.localUser.upsert({
    where: { email: memberEmail },
    update: { passwordHash: memberHash, profileId: memberProfile.id },
    create: { email: memberEmail, passwordHash: memberHash, profileId: memberProfile.id },
  });

  console.log("Seed completed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});