"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

type IngestKeyItem = { id: string; name: string; active: boolean };

type IngestKeysResponse = { items: IngestKeyItem[] };

export default function AdminIngestKeys() {
  const { data, mutate } = useSWR<IngestKeysResponse>("/api/admin/ingest-keys", fetcher);
  const items = data?.items || [];
  async function create() {
    const name = prompt("Key name");
    if (!name) return;
    await fetch("/api/admin/ingest-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    mutate();
  }
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Ingest Keys</h1>
      <button className="mt-4 px-3 py-2 rounded-md border" onClick={create}>Create Key</button>
      <div className="mt-4 divide-y rounded-md border bg-white">
        {items.map((k) => (
          <div key={k.id} className="p-3 flex items-center justify-between">
            <div>{k.name}</div>
            <div className="text-xs text-[#1C1C1E]/60">Active: {String(k.active)}</div>
          </div>
        ))}
        {items.length === 0 && <div className="p-3 text-sm text-[#1C1C1E]/70">No keys.</div>}
      </div>
    </div>
  );
}