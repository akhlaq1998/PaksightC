"use client";
import { useEffect, useState } from "react";

export default function ResetPage() {
  const [token, setToken] = useState<string>("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = new URL(window.location.href);
    const t = u.searchParams.get("token");
    if (t) setToken(t);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    if (!res.ok) setError("Invalid or expired token"); else setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Password updated</h1>
        <p className="mt-2 text-sm text-[#1C1C1E]/70">You can now log in with your new password.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Reset Password</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium">New password</label>
          <input type="password" className="mt-1 w-full border rounded-md px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full px-4 py-2 rounded-md bg-[#115740] text-white" disabled={!token}>Reset</button>
      </form>
    </div>
  );
}