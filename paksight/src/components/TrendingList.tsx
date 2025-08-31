"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function TrendingList({ window, country, interactive }: { window: "24h" | "7d" | "30d"; country: string; interactive: boolean }) {
  const { data } = useSWR<Array<{ topic_or_entity: string; score: number; sample_count: number }>>(
    `/api/analytics/trending?window=${window}&country=${country}`,
    fetcher
  );
  const items = data || [];

  return (
    <ul className="divide-y">
      {items.map((it, idx) => (
        <li key={idx} className="py-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-medium">{it.topic_or_entity}</div>
            <div className="text-xs text-[#1C1C1E]/70">Score {it.score.toFixed(2)} • {it.sample_count} mentions</div>
          </div>
          {interactive ? (
            <a href={`/search?q=${encodeURIComponent(it.topic_or_entity)}`} className="px-2 py-1 rounded-md border text-sm">Explore</a>
          ) : (
            <span className="text-xs text-[#1C1C1E]/60">Viewer</span>
          )}
        </li>
      ))}
    </ul>
  );
}