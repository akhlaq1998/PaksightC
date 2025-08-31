import { HeatmapGrid } from "@/components/HeatmapGrid";
import { TrendingList } from "@/components/TrendingList";
import { SentimentChart } from "@/components/SentimentChart";
import { UpgradeModal } from "@/components/UpgradeModal";
import { getSessionUser } from "@/lib/auth";

function todayStr() { return new Date().toISOString().slice(0,10); }
function daysAgoStr(n: number) { const d = new Date(Date.now() - n*24*3600*1000); return d.toISOString().slice(0,10); }

export default async function DashboardPage() {
  const user = await getSessionUser();
  const isViewer = user?.role === "VIEWER";
  const from = daysAgoStr(30);
  const to = todayStr();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        <section className="col-span-1 md:col-span-2 xl:col-span-2 p-4 rounded-md border bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Global Heatmap</h2>
            {isViewer ? <UpgradeModal triggerLabel="Filters" /> : <a className="text-sm text-[#115740]" href="#">Filters</a>}
          </div>
          <HeatmapGrid from={from} to={to} focus="GLOBAL" />
        </section>

        <section className="p-4 rounded-md border bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Trending (7d, GLOBAL)</h2>
            {isViewer ? <UpgradeModal triggerLabel="Explore" /> : <a className="text-sm text-[#115740]" href="/search">Explore</a>}
          </div>
          <TrendingList window="7d" country="GLOBAL" interactive={!isViewer} />
        </section>

        <section className="p-4 rounded-md border bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Sentiment (PK)</h2>
            {isViewer ? <UpgradeModal triggerLabel="Details" /> : <span className="text-sm text-[#115740]">Details</span>}
          </div>
          <SentimentChart from={from} to={to} country="PK" />
        </section>

        <section className="p-4 rounded-md border bg-white md:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Latest Headlines</h2>
            {isViewer ? <UpgradeModal triggerLabel="View all" /> : <a className="text-sm text-[#115740]" href="/search">View all</a>}
          </div>
          <div className="text-sm text-[#1C1C1E]/70">Hook to articles list will be added next.</div>
        </section>
      </div>
    </div>
  );
}