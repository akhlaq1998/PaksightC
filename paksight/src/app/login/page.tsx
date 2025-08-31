"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data?.error || "Login failed");
      }
      const data = (await res.json()) as { redirect?: string };
      window.location.href = data.redirect || "/dashboard";
    } catch (err: unknown) {
      const maybe = err as { message?: string };
      const message = maybe && maybe.message ? maybe.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Login</h1>
      <p className="text-sm text-[#1C1C1E]/70 mt-1">Invite-only. Use your credentials or the demo accounts.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" className="mt-1 w-full border rounded-md px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" className="mt-1 w-full border rounded-md px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full px-4 py-2 rounded-md bg-[#115740] text-white">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <div className="mt-4 flex gap-2">
        <button className="px-3 py-2 rounded-md border" onClick={() => { setEmail("admin@paksight.app"); setPassword("StrongPass!234"); }}>Use demo Admin</button>
        <button className="px-3 py-2 rounded-md border" onClick={() => { setEmail("member@paksight.app"); setPassword("MemberPass!234"); }}>Use demo Member</button>
      </div>
      <div className="mt-4 text-sm flex justify-between">
        <a href="/forgot" className="text-[#115740] hover:underline">Forgot password?</a>
        <a href="/request-access" className="text-[#115740] hover:underline">Request access</a>
      </div>
    </div>
  );
}