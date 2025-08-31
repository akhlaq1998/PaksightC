"use client";
import dynamic from "next/dynamic";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useState } from "react";

const HeatmapGrid = dynamic(() => import("@/components/HeatmapGrid").then(m => m.HeatmapGrid), { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-md border" /> });
const TrendingList = dynamic(() => import("@/components/TrendingList").then(m => m.TrendingList), { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-md border" /> });
const SentimentChart = dynamic(() => import("@/components/SentimentChart").then(m => m.SentimentChart), { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-md border" /> });

export default function DashboardClient({ isViewer, from, to }: { isViewer: boolean; from: string; to: string }) {
  const [windowSel, setWindowSel] = useState<"24h" | "7d" | "30d">("7d");
  const [country, setCountry] = useState<string>("GLOBAL");

  return (
    <>
      <div className="mt-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm">Window</label>
          <select className="border rounded-md px-2 py-1" value={windowSel} onChange={(e) => setWindowSel(e.target.value as "24h" | "7d" | "30d")} disabled={isViewer} aria-disabled={isViewer}>
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Country</label>
          <select className="border rounded-md px-2 py-1" value={country} onChange={(e) => setCountry(e.target.value)} disabled={isViewer} aria-disabled={isViewer}>
            <option value="GLOBAL">GLOBAL</option>
            <option value="PK">PK</option>
            <option value="GB">GB</option>
            <option value="US">US</option>
            <option value="IN">IN</option>
            <option value="AF">AF</option>
            <option value="HU">HU</option>
          </select>
        </div>
        {isViewer && <div className="text-xs text-[#1C1C1E]/60">Viewer: filters disabled <UpgradeModal triggerLabel="Upgrade" /></div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        <section className="col-span-1 md:col-span-2 xl:col-span-2 p-4 rounded-md border bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Global Heatmap</h2>
            {isViewer ? <UpgradeModal triggerLabel="Filters" /> : <span className="text-sm text-[#115740]">Filters</span>}
          </div>
          <HeatmapGrid from={from} to={to} focus={country === "GLOBAL" ? "GLOBAL" : "PK"} />
        </section>

        <section className="p-4 rounded-md border bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Trending ({windowSel}, {country})</h2>
            {isViewer ? <UpgradeModal triggerLabel="Explore" /> : <a className="text-sm text-[#115740]" href="/search">Explore</a>}
          </div>
          <TrendingList window={windowSel} country={country} interactive={!isViewer} />
        </section>

        <section className="p-4 rounded-md border bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Sentiment (PK)</h2>
            {isViewer ? <UpgradeModal triggerLabel="Details" /> : <span className="text-sm text-[#115740]">Details</span>}
          </div>
          <SentimentChart from={from} to={to} country={country === "GLOBAL" ? "PK" : country} />
        </section>

        <section className="p-4 rounded-md border bg-white md:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Latest Headlines</h2>
            {isViewer ? <UpgradeModal triggerLabel="View all" /> : <a className="text-sm text-[#115740]" href="/search">View all</a>}
          </div>
          <div className="text-sm text-[#1C1C1E]/70">Hook to articles list will be added next.</div>
        </section>
      </div>
    </>
  );
}