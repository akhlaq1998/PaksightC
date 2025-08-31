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

  const reuters = await prisma.outlet.findFirst({ where: { domain: "reuters.com" } });

  // Articles
  const now = new Date();
  const articles = [
    {
      externalId: "demo:1",
      outletId: reuters?.id,
      url: "https://example.com/pakistan-coverage",
      title: "Pakistan coverage",
      summary: "International focus on Pakistan's economy and politics.",
      publishedAt: new Date(now.getTime() - 6 * 3600 * 1000),
      language: "en",
      countryIso: "US",
      sentimentLabel: "neutral",
      sentimentScore: 0.02,
      topics: ["Politics"],
      entities: ["Pakistan", "IMF"],
    },
  ];
  for (const a of articles) {
    await prisma.article.create({
      data: {
        ...a,
        topics: a.topics as any,
        entities: a.entities as any,
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