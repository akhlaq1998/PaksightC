export {};

export default function NotAuthorizedPage() {
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Not authorized</h1>
      <p className="mt-2 text-sm text-[#1C1C1E]/70">You do not have access to this area. If you think this is a mistake, please request access.</p>
      <div className="mt-4 flex gap-2 justify-center">
        <a href="/dashboard" className="px-4 py-2 rounded-md border">Go to Dashboard</a>
        <a href="/request-access" className="px-4 py-2 rounded-md bg-[#115740] text-white">Request Access</a>
      </div>
    </div>
  );
}