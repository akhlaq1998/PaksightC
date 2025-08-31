"use client";
import { useState } from "react";

export default function RequestAccessPage() {
  const [form, setForm] = useState({ name: "", org: "", role: "", email: "", reason: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/access-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Failed to submit");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Request received</h1>
        <p className="mt-2 text-sm text-[#1C1C1E]/75">We'll email you after review.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Request Access</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Organization</label>
          <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Role</label>
          <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Work Email</label>
          <input type="email" className="mt-1 w-full border rounded-md px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Reason</label>
          <textarea className="mt-1 w-full border rounded-md px-3 py-2" rows={4} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
        <div className="text-xs text-[#1C1C1E]/60">Captcha placeholder</div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full px-4 py-2 rounded-md bg-[#115740] text-white">Submit</button>
      </form>
    </div>
  );
}