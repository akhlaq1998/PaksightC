"use client";
import { useState } from "react";

export function UpgradeModal({ triggerLabel = "View details" }: { triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="px-3 py-2 rounded-md border text-sm" onClick={() => setOpen(true)}>{triggerLabel}</button>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setOpen(false)}>
          <div className="mx-auto mt-24 max-w-md bg-white rounded-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Requires full access</h3>
            <p className="mt-2 text-sm text-[#1C1C1E]/75">This action is available to Members and Admins. Viewers can request an upgrade.</p>
            <div className="mt-4 flex gap-2 justify-end">
              <a className="px-3 py-2 rounded-md border" href="/request-access">Request upgrade</a>
              <button className="px-3 py-2 rounded-md bg-[#115740] text-white" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}