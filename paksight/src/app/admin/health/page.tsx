"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminHealth() {
  const { data } = useSWR<{ items: Array<{ service: string; status: string; note?: string; createdAt: string }> }>("/api/admin/health", fetcher);
  const items = data?.items || [];
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Health</h1>
      <div className="mt-4 divide-y rounded-md border bg-white">
        {items.map((h, idx) => (
          <div key={idx} className="p-3 flex items-center justify-between">
            <div className="font-medium">{h.service}</div>
            <div className="text-xs text-[#1C1C1E]/70">{h.status} • {h.note || ''} • {new Date(h.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {items.length === 0 && <div className="p-3 text-sm text-[#1C1C1E]/70">No healthbeats.</div>}
      </div>
    </div>
  );
}