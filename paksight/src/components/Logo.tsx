import React from "react";

export function PakSightLogo({ size = 28 }: { size?: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" aria-label="PakSight logo" role="img">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#115740" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#g)" />
      <path d="M40 32c0 6.627-4.925 12-11 12-3.2 0-6.075-1.383-8.04-3.6C23.5 43 26.6 44 30 44c7.18 0 13-5.373 13-12s-5.82-12-13-12c-3.4 0-6.5 1-9.04 3.6C22.925 21.383 25.8 20 29 20c6.075 0 11 5.373 11 12z" fill="#fff" opacity="0.9" />
      <circle cx="36" cy="28" r="6" fill="#115740" />
      <polygon points="46,16 48,22 54,22 49,26 51,32 46,28 41,32 43,26 38,22 44,22" fill="#F1C40F" />
    </svg>
  );
}