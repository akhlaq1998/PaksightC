"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

const COUNTRY_NAMES: Record<string, string> = { PK: "Pakistan", GB: "UK", US: "USA", IN: "India", AF: "Afghanistan", HU: "Hungary" };

type GlobalRow = { country_iso: string; count: number };
type CountryRow = { date: string; count: number; pos: number; neg: number; neu: number };

type HeatmapData = Array<GlobalRow | CountryRow>;

export function HeatmapGrid({ from, to, focus }: { from: string; to: string; focus: "PK" | "GLOBAL" }) {
  const { data } = useSWR<HeatmapData>( `/api/analytics/heatmap?from=${from}&to=${to}&focus=${focus}`, fetcher );
  const items = data || [];
  let max = 1;
  if (focus === "GLOBAL") {
    for (const r of items as GlobalRow[]) max = Math.max(max, (r as GlobalRow).count || 0);
  } else {
    for (const r of items as CountryRow[]) max = Math.max(max, (r as CountryRow).count || 0);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {focus === "GLOBAL"
        ? ["PK","GB","US","IN","AF","HU"].map(c => {
            const row = (items as GlobalRow[]).find((r) => (r as GlobalRow).country_iso === c) as GlobalRow | undefined;
            const v = row ? row.count : 0;
            const intensity = v / max;
            return (
              <div key={c} className="p-3 rounded-md border" style={{ backgroundColor: `rgba(17, 87, 64, ${0.1 + 0.5*intensity})`, color: "#1C1C1E" }}>
                <div className="text-xs">{COUNTRY_NAMES[c] || c}</div>
                <div className="text-lg font-semibold">{v}</div>
              </div>
            );
          })
        : (items as CountryRow[]).map((r, idx) => (
            <div key={idx} className="p-3 rounded-md border" style={{ backgroundColor: `rgba(17, 87, 64, ${0.1 + 0.5*(r.count/max)})`, color: "#1C1C1E" }}>
              <div className="text-xs">{r.date}</div>
              <div className="text-lg font-semibold">{r.count}</div>
            </div>
          ))}
    </div>
  );
}