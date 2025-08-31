"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

type AccessRequestItem = { id: string; name: string; email: string; org?: string | null; role?: string | null; status: string };

type AccessRequestsResponse = { items: AccessRequestItem[] };

export default function AdminRequests() {
  const { data, mutate } = useSWR<AccessRequestsResponse>("/api/admin/access-requests/list", fetcher);
  const items = data?.items || [];
  async function act(id: string, action: "approve" | "reject") {
    await fetch(`/api/admin/access-requests/${id}/${action}`, { method: "POST" });
    mutate();
  }
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Access Requests</h1>
      <div className="mt-4 divide-y rounded-md border bg-white">
        {items.map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">{r.name} — {r.email}</div>
              <div className="text-xs text-[#1C1C1E]/70">{r.org || ''} • {r.role || ''} • {r.status}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-md border" onClick={() => act(r.id, "approve")}>Approve</button>
              <button className="px-3 py-1.5 rounded-md border" onClick={() => act(r.id, "reject")}>Reject</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="p-4 text-sm text-[#1C1C1E]/70">No requests.</div>}
      </div>
    </div>
  );
}