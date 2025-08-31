import Link from "next/link";

async function getArticle(id: string) {
  const res = await fetch(`${process.env.APP_BASE_URL || "http://localhost:3000"}/api/articles/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getArticle(id);
  if (!a) return <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">Not found</div>;
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-sm text-[#1C1C1E]/70"><Link href="/search" className="text-[#115740]">Back to search</Link></div>
      <h1 className="mt-2 text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>{a.title}</h1>
      <div className="mt-1 text-sm text-[#1C1C1E]/70">{a.Outlet?.name || ''} • {a.countryIso || ''} • {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ''}</div>
      {a.summary && <p className="mt-4">{a.summary}</p>}
      {a.entities && Array.isArray(a.entities) && (
        <div className="mt-4 text-sm text-[#1C1C1E]/80">Entities: {(a.entities as string[]).join(', ')}</div>
      )}
      <div className="mt-6">
        <a href={a.url} className="px-4 py-2 rounded-md bg-[#115740] text-white" target="_blank">Read source</a>
      </div>
    </div>
  );
}