import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export default async function AdminDocs() {
  const emailLogs = await prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  const openapi = {
    openapi: "3.0.0",
    info: { title: "PakSight API", version: "1.0.0" },
    paths: {
      "/api/ingest/article": { post: { summary: "Ingest article", security: [{ IngestKey: [] }] } },
      "/api/ingest/batch": { post: { summary: "Ingest batch", security: [{ IngestKey: [] }] } },
      "/api/analytics/heatmap": { get: { summary: "Heatmap" } },
      "/api/analytics/trending": { get: { summary: "Trending" } },
      "/api/analytics/recompute/heatmap": { post: { summary: "Recompute heatmap" } },
      "/api/analytics/recompute/trending": { post: { summary: "Recompute trending" } },
      "/api/articles/search": { get: { summary: "Article search" } },
      "/api/articles/{id}": { get: { summary: "Article detail" } },
      "/api/admin/bootstrap": { post: { summary: "Bootstrap demo users" } },
    },
    components: { securitySchemes: { IngestKey: { type: "apiKey", in: "header", name: "X-INGEST-KEY" } } },
  };

  const openapiJson = JSON.stringify(openapi, null, 2);

  const curls = `
# Bootstrap preset users
curl -X POST "$APP_BASE_URL/api/admin/bootstrap" \
  -H "Content-Type: application/json" \
  -H "X-Bootstrap-Token: $BOOTSTRAP_TOKEN" \
  -d '{ "admin_email":"admin@paksight.app","admin_password":"StrongPass!234",
        "admin_name":"PakSight Admin","admin_org":"PakSight",
        "member_email":"member@paksight.app","member_password":"MemberPass!234",
        "member_name":"Demo Member","member_org":"Demo Org" }'

# Ingest one demo article
curl -X POST "$APP_BASE_URL/api/ingest/article" \
  -H "Content-Type: application/json" -H "X-INGEST-KEY: REPLACE_ME" \
  -d '{ "external_id":"demo:1","url":"https://example.com","title":"Pakistan coverage",
        "published_at":"2025-08-31T12:00:00Z","outlet_name":"Reuters",
        "outlet_domain":"reuters.com","country_iso":"US","language":"en",
        "topics":["Politics"],"entities":["Pakistan"],"sentiment":{"label":"neutral","score":0.0} }'

# Recompute analytics
curl -X POST "$APP_BASE_URL/api/analytics/recompute/heatmap?days=30"
curl -X POST "$APP_BASE_URL/api/analytics/recompute/trending?hours=72"
`;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>API Docs</h1>
      <h2 className="mt-4 font-semibold">OpenAPI JSON</h2>
      <pre className="mt-2 p-3 rounded-md border bg-white overflow-auto text-xs">{openapiJson}</pre>
      <h2 className="mt-6 font-semibold">cURL examples</h2>
      <pre className="mt-2 p-3 rounded-md border bg-white overflow-auto text-xs">{curls}</pre>
      <div className="mt-6 text-sm text-[#1C1C1E]/70">Email provider: {env.smtp.host || env.resendApiKey || env.sendgridApiKey ? 'configured' : 'not configured; emails are logged below'}</div>
      {! (env.smtp.host || env.resendApiKey || env.sendgridApiKey) && (
        <div className="mt-3">
          <h2 className="font-semibold">Email Log (latest 50)</h2>
          <div className="mt-2 divide-y rounded-md border bg-white">
            {emailLogs.map((e) => (
              <div key={e.id} className="p-3">
                <div className="text-xs text-[#1C1C1E]/60">{new Date(e.createdAt).toLocaleString()}</div>
                <div className="font-medium">To: {e.to}</div>
                <div className="text-sm">{e.subject}</div>
              </div>
            ))}
            {emailLogs.length === 0 && <div className="p-3 text-sm text-[#1C1C1E]/70">No email logs.</div>}
          </div>
        </div>
      )}
    </div>
  );
}