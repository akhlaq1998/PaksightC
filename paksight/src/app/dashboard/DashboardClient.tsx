"use client";
import dynamic from "next/dynamic";
import { UpgradeModal } from "@/components/UpgradeModal";

const HeatmapGrid = dynamic(() => import("@/components/HeatmapGrid").then(m => m.HeatmapGrid), { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-md border" /> });
const TrendingList = dynamic(() => import("@/components/TrendingList").then(m => m.TrendingList), { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-md border" /> });
const SentimentChart = dynamic(() => import("@/components/SentimentChart").then(m => m.SentimentChart), { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-md border" /> });

export default function DashboardClient({ isViewer, from, to }: { isViewer: boolean; from: string; to: string }) {
  return (
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
  );
}