"use client";
import useSWR from "swr";
import { useState } from "react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then(r => r.json());

type SearchItem = {
  id: number;
  title: string;
  countryIso: string | null;
  language: string | null;
  publishedAt: string | null;
  sentimentLabel: string | null;
  Outlet?: { name: string } | null;
};

type SearchResponse = { items: SearchItem[]; total: number };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const url = `/api/articles/search?q=${encodeURIComponent(q)}&country=${country}`;
  const { data } = useSWR<SearchResponse>(url, fetcher);
  const items = data?.items || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Search</h1>
      <div className="mt-4 flex gap-2">
        <input placeholder="Query" className="border rounded-md px-3 py-2 w-full" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="border rounded-md px-3 py-2" value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">All</option>
          <option value="PK">PK</option>
          <option value="GB">GB</option>
          <option value="US">US</option>
          <option value="IN">IN</option>
          <option value="AF">AF</option>
          <option value="HU">HU</option>
        </select>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((a) => (
          <Link key={a.id} href={`/article/${a.id}`} className="block p-3 rounded-md border bg-white">
            <div className="font-medium truncate">{a.title}</div>
            <div className="text-xs text-[#1C1C1E]/70 mt-1">{a.Outlet?.name || ""} • {a.countryIso || ""} • {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}