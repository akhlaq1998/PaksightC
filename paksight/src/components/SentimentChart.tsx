"use client";
import useSWR from "swr";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fetcher = (url: string) => fetch(url).then(r => r.json());

type Row = { date: string; pos: number; neg: number; neu: number };

export function SentimentChart({ from, to, country }: { from: string; to: string; country: string }) {
  const { data } = useSWR<Row[]>(
    `/api/analytics/heatmap?from=${from}&to=${to}&focus=${country}`,
    fetcher
  );
  const rows = (data || []).map((r) => ({ date: r.date, pos: r.pos, neg: r.neg, neu: r.neu }));
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
          <XAxis dataKey="date" hide={rows.length > 20} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pos" stroke="#16a34a" dot={false} />
          <Line type="monotone" dataKey="neu" stroke="#64748b" dot={false} />
          <Line type="monotone" dataKey="neg" stroke="#dc2626" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}