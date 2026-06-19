"use client";

import { useMemo, useState } from "react";
import type { Block } from "@/lib/calendar";

function todayISO() { return new Date().toISOString().slice(0, 10); }

export function AdminCalendar({ hutId, initialBlocks }: { hutId: string; initialBlocks: Block[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [busy, setBusy] = useState<string | null>(null);
  const months = useMemo(() => nextMonths(3), []);

  // Range block form
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeNote, setRangeNote] = useState("");
  const [rangeBusy, setRangeBusy] = useState(false);
  const [rangeMsg, setRangeMsg] = useState<string | null>(null);

  async function blockRange() {
    if (!rangeStart || !rangeEnd || rangeStart >= rangeEnd) return;
    setRangeBusy(true);
    setRangeMsg(null);
    try {
      const r = await fetch("/api/admin/block", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hutId, start: rangeStart, end: rangeEnd, notes: rangeNote || "Blocked by manager" }),
      });
      if (r.ok) {
        const added = await r.json();
        setBlocks((bs) => [...bs, added]);
        setRangeMsg("✓ Blocked");
        setRangeStart(""); setRangeEnd(""); setRangeNote("");
        setTimeout(() => setRangeMsg(null), 3000);
      } else {
        setRangeMsg("Failed — dates may overlap");
      }
    } finally {
      setRangeBusy(false);
    }
  }

  function classify(iso: string): { state: "open" | "hold" | "booked" | "manual" | "airbnb"; block?: Block } {
    for (const b of blocks) {
      if (iso >= b.start && iso < b.end) {
        return { state: b.source === "site" ? "booked" : b.source, block: b };
      }
    }
    return { state: "open" };
  }

  async function toggleBlock(iso: string) {
    const existing = classify(iso);
    setBusy(iso);
    try {
      if (existing.state === "manual" && existing.block?.eventId) {
        const r = await fetch(`/api/admin/block?hut=${hutId}&eventId=${existing.block.eventId}`, { method: "DELETE" });
        if (r.ok) setBlocks((bs) => bs.filter((b) => b.eventId !== existing.block!.eventId));
      } else if (existing.state === "open") {
        const next = addDays(iso, 1);
        const r = await fetch("/api/admin/block", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ hutId, start: iso, end: next, notes: "Blocked by manager" }),
        });
        if (r.ok) {
          const added = await r.json();
          setBlocks((bs) => [...bs, added]);
        }
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* Range block panel */}
      <div className="p-4 border border-[var(--amber)]/15 bg-[var(--amber)]/4 space-y-3">
        <div className="text-[0.6rem] tracking-[0.18em] uppercase text-cream/45">Block a date range</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[0.55rem] tracking-widest uppercase text-amber-400/70 mb-1">From</label>
            <input
              type="date"
              min={todayISO()}
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50"
            />
          </div>
          <div>
            <label className="block text-[0.55rem] tracking-widest uppercase text-amber-400/70 mb-1">To</label>
            <input
              type="date"
              min={rangeStart || todayISO()}
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50"
            />
          </div>
        </div>
        <input
          type="text"
          placeholder="Note (e.g. Owner stay, Maintenance…)"
          value={rangeNote}
          onChange={(e) => setRangeNote(e.target.value)}
          className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50 placeholder:text-cream/25"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={blockRange}
            disabled={!rangeStart || !rangeEnd || rangeStart >= rangeEnd || rangeBusy}
            className="px-4 py-1.5 bg-red-500/30 border border-red-500/40 text-[0.6rem] tracking-[0.18em] uppercase text-cream hover:bg-red-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {rangeBusy ? "Blocking…" : "Block range"}
          </button>
          {rangeMsg && <span className="text-[0.65rem] text-cream/50">{rangeMsg}</span>}
        </div>
      </div>

      {/* Calendar grid */}
      {months.map((m) => (
        <div key={`${m.year}-${m.month}`}>
          <div className="text-[0.7rem] tracking-[0.18em] uppercase text-cream/45 mb-3">
            {monthName(m.month)} {m.year}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-[0.55rem] text-cream/30 py-1">{d}</div>
            ))}
            {Array.from({ length: m.firstDayOffset }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: m.daysInMonth }, (_, i) => i + 1).map((day) => {
              const iso = `${m.year}-${String(m.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const past = iso < new Date().toISOString().slice(0, 10);
              const c = classify(iso);
              const tone = past ? "bg-white/3 text-cream/20"
                : c.state === "open" ? "bg-green-500/10 hover:bg-green-500/20 text-cream"
                : c.state === "hold" ? "bg-amber-500/30 text-cream"
                : c.state === "manual" ? "bg-red-500/40 text-cream cursor-pointer"
                : c.state === "airbnb" ? "bg-red-500/30 text-cream/80"
                : "bg-red-500/40 text-cream";
              const clickable = !past && (c.state === "open" || c.state === "manual");
              return (
                <button
                  key={iso}
                  disabled={!clickable || busy === iso}
                  onClick={() => clickable && toggleBlock(iso)}
                  className={`aspect-square text-[0.7rem] font-light transition-colors ${tone} ${busy === iso ? "opacity-50" : ""}`}
                  title={c.block ? `${c.state}${c.block.guestName ? ` · ${c.block.guestName}` : ""}` : "Available — click to block"}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex gap-4 text-[0.6rem] text-cream/50 pt-2 border-t border-white/8">
        <span><span className="inline-block w-2.5 h-2.5 bg-green-500/30 mr-1.5 align-middle" />Open</span>
        <span><span className="inline-block w-2.5 h-2.5 bg-amber-500/40 mr-1.5 align-middle" />Hold</span>
        <span><span className="inline-block w-2.5 h-2.5 bg-red-500/40 mr-1.5 align-middle" />Blocked</span>
      </div>
    </div>
  );
}

function nextMonths(count: number) {
  const today = new Date();
  const out: { year: number; month: number; daysInMonth: number; firstDayOffset: number }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const firstDayOffset = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    out.push({ year: d.getFullYear(), month: d.getMonth(), daysInMonth, firstDayOffset });
  }
  return out;
}

function monthName(m: number) {
  return ["January","February","March","April","May","June","July","August","September","October","November","December"][m];
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
