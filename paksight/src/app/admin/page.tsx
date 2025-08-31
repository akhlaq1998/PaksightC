export {};

export default function AdminHome() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Admin</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/admin/requests" className="p-4 rounded-md border bg-white">Access Requests</a>
        <a href="/admin/ingest-keys" className="p-4 rounded-md border bg-white">Ingest Keys</a>
        <a href="/admin/health" className="p-4 rounded-md border bg-white">Health</a>
        <a href="/admin/docs" className="p-4 rounded-md border bg-white">Docs (OpenAPI + cURL)</a>
      </div>
    </div>
  );
}