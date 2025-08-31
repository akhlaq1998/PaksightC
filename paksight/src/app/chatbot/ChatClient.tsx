"use client";
import { useState } from "react";
import { UpgradeModal } from "@/components/UpgradeModal";

type Brief = {
  title?: string;
  scope?: string;
  sentiment?: string;
  volume?: string;
  top_themes_entities?: string;
  notable_outlets?: string;
  citations?: Array<{ outlet: string; date: string }>;
  confidence?: string;
};

export default function ChatClient({ role }: { role: "ADMIN" | "MEMBER" | "VIEWER" }) {
  const [answer, setAnswer] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isViewer = role === "VIEWER";

  async function onAsk(e: React.FormEvent) {
    e.preventDefault();
    if (isViewer) {
      setShowUpgrade(true);
      return;
    }
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, filters: { window: "7d", region: "GLOBAL" } }),
      });
      if (res.status === 403) {
        setShowUpgrade(true);
        return;
      }
      const data = (await res.json()) as Brief;
      setAnswer(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Roboto Slab, serif" }}>Strategic Insights Chatbot</h1>
      <p className="text-sm text-[#1C1C1E]/70">Premium-only. Answers must include citations and confidence.</p>
      <form onSubmit={onAsk} className="mt-4 flex gap-2">
        <input className="flex-1 border rounded-md px-3 py-2" placeholder="Ask about Pakistan media intelligence (e.g., sentiment this week in Europe)" value={question} onChange={(e) => setQuestion(e.target.value)} onFocus={() => { if (isViewer) setShowUpgrade(true); }} disabled={loading} />
        <button className="px-4 py-2 rounded-md bg-[#115740] text-white disabled:opacity-60" disabled={loading || !question || isViewer}>Ask</button>
      </form>
      {isViewer && <div className="mt-2 text-xs text-[#1C1C1E]/60">Upgrade required to use the Strategic Insights Chatbot.</div>}

      {answer && (
        <div className="mt-6 p-4 rounded-md border bg-white">
          {answer.title && <h2 className="font-semibold">{answer.title}</h2>}
          {answer.scope && <div className="text-sm text-[#1C1C1E]/70 mt-1">{answer.scope}</div>}
          {answer.sentiment && <div className="mt-3"><span className="font-medium">Sentiment:</span> {answer.sentiment}</div>}
          {answer.volume && <div className="mt-1"><span className="font-medium">Volume:</span> {answer.volume}</div>}
          {answer.top_themes_entities && <div className="mt-1"><span className="font-medium">Top themes:</span> {answer.top_themes_entities}</div>}
          {answer.notable_outlets && <div className="mt-1"><span className="font-medium">Notable outlets:</span> {answer.notable_outlets}</div>}
          {Array.isArray(answer.citations) && answer.citations.length > 0 && (
            <div className="mt-3">
              <div className="font-medium">Citations</div>
              <ul className="list-disc pl-5 text-sm mt-1">
                {answer.citations!.map((c, idx) => (
                  <li key={idx}>{c.outlet} – {c.date}</li>
                ))}
              </ul>
            </div>
          )}
          {answer.confidence && <div className="mt-3 text-sm text-[#1C1C1E]/80">Confidence: {answer.confidence}</div>}
        </div>
      )}

      {showUpgrade && (
        <div className="mt-6">
          <UpgradeModal triggerLabel="Upgrade required" />
        </div>
      )}
    </div>
  );
}