"use client";

import { useState } from "react";
import { HUTS } from "@/lib/huts";

type PriceMap = Record<string, number>;

export function PriceEditor({ initialPrices }: { initialPrices: PriceMap }) {
  const [prices, setPrices] = useState<PriceMap>(initialPrices);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  function startEdit(hutId: string) {
    setEditing((e) => ({ ...e, [hutId]: String(prices[hutId]) }));
  }

  function cancelEdit(hutId: string) {
    setEditing((e) => { const n = { ...e }; delete n[hutId]; return n; });
  }

  async function save(hutId: string) {
    const price = Number(editing[hutId]);
    if (!Number.isFinite(price) || price < 0) return;
    setSaving(hutId);
    try {
      const r = await fetch("/api/admin/prices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hutId, price }),
      });
      if (r.ok) {
        setPrices((p) => ({ ...p, [hutId]: price }));
        cancelEdit(hutId);
        setSaved(hutId);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mb-12 p-6 border border-[var(--amber)]/15 bg-[var(--amber)]/4">
      <div className="eyebrow mb-4">Nightly Rates</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {HUTS.map((hut) => {
          return (
            <div key={hut.id} className="border border-white/8 p-4 bg-[#080705]/60">
              <div className="text-[0.6rem] tracking-[0.18em] uppercase text-cream/45 mb-1">{hut.name}</div>
              {editing[hut.id] !== undefined ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-cream/50 text-sm">₹</span>
                  <input
                    type="number"
                    value={editing[hut.id]}
                    onChange={(e) => setEditing((ed) => ({ ...ed, [hut.id]: e.target.value }))}
                    className="w-28 bg-transparent border-b border-[var(--amber)]/50 text-cream font-serif text-lg outline-none pb-0.5"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") save(hut.id); if (e.key === "Escape") cancelEdit(hut.id); }}
                  />
                  <button
                    onClick={() => save(hut.id)}
                    disabled={saving === hut.id}
                    className="text-[0.6rem] tracking-[0.18em] uppercase text-[var(--amber)] disabled:opacity-40"
                  >
                    {saving === hut.id ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => cancelEdit(hut.id)} className="text-[0.6rem] tracking-[0.18em] uppercase text-cream/30">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-end justify-between mt-2">
                  <div className="font-serif text-2xl text-cream">
                    ₹{(prices[hut.id] ?? 0).toLocaleString("en-IN")}
                    <span className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/40 ml-1">/ night</span>
                  </div>
                  <button
                    onClick={() => startEdit(hut.id)}
                    className="text-[0.6rem] tracking-[0.18em] uppercase text-cream/35 hover:text-[var(--amber)] transition-colors"
                  >
                    {saved === hut.id ? "✓ Saved" : "Edit"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
