"use client";
import { useState } from "react";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (!res.ok) setError("Failed to send reset email"); else setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Check your email</h1>
        <p className="mt-2 text-sm text-[#1C1C1E]/70">If an account exists, you will receive a reset link.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Forgot Password</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" className="mt-1 w-full border rounded-md px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full px-4 py-2 rounded-md bg-[#115740] text-white">Send reset link</button>
      </form>
    </div>
  );
}