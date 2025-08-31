import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "Roboto Slab, serif" }}>
              PakSight
            </h1>
            <p className="mt-2 text-[#115740] font-medium">Media Intelligence System</p>
            <p className="mt-6 text-lg text-[#1C1C1E]/80 max-w-xl">
              Track how Pakistan is covered across international media. Heatmaps, trends, sentiment, and a research chatbot with citations.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="px-5 py-3 rounded-md bg-[#115740] text-white text-center hover:opacity-90">
                Login
              </Link>
              <Link href="/request-access" className="px-5 py-3 rounded-md border border-[#115740] text-[#115740] text-center hover:bg-[#115740]/5">
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#F7FBF9] border-t border-[#115740]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold">Dashboards</h3>
            <p className="text-sm text-[#1C1C1E]/70 mt-2">Global heatmap, trending topics, and sentiment timelines.</p>
          </div>
          <div>
            <h3 className="font-semibold">Search & Articles</h3>
            <p className="text-sm text-[#1C1C1E]/70 mt-2">Full-text search with filters, and detailed article views.</p>
          </div>
          <div>
            <h3 className="font-semibold">Admin & Ingest</h3>
            <p className="text-sm text-[#1C1C1E]/70 mt-2">Invite-only access, n8n ingest APIs, and OpenAPI docs.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
