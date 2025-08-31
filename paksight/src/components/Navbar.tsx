"use client";
import Link from "next/link";
import { PakSightLogo } from "@/components/Logo";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="w-full border-b border-black/10 bg-white text-[#1C1C1E] sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <PakSightLogo size={28} />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold" style={{ fontFamily: "Roboto Slab, serif" }}>PakSight</span>
            <span className="text-[11px] text-[#115740]">Media Intelligence System</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-5">
          <Link href="/dashboard" className="hover:text-[#115740]">Dashboard</Link>
          <Link href="/search" className="hover:text-[#115740]">Search</Link>
          <Link href="/compare" className="hover:text-[#115740]">Compare</Link>
          <Link href="/chatbot" className="hover:text-[#115740]">Chatbot</Link>
          <Link href="/login" className="px-3 py-1.5 rounded-md bg-[#115740] text-white hover:opacity-90">Login</Link>
        </nav>
        <button aria-label="Open menu" className="md:hidden p-2" onClick={() => setOpen(true)}>
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/40" onClick={() => setOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Menu</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href="/search" onClick={() => setOpen(false)}>Search</Link>
              <Link href="/compare" onClick={() => setOpen(false)}>Compare</Link>
              <Link href="/chatbot" onClick={() => setOpen(false)}>Chatbot</Link>
              <Link href="/login" className="px-3 py-2 rounded-md bg-[#115740] text-white text-center" onClick={() => setOpen(false)}>Login</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}