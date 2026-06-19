"use client";

import { useMemo, useState } from "react";
import type { Block } from "@/lib/calendar";

function todayISO() { return new Date().toISOString().slice(0, 10); }

type CellState = "open" | "hold" | "booked" | "manual" | "airbnb";
type Position = "single" | "first" | "middle" | "last";

function classify(
  iso: string,
  blocks: Block[]
): { state: CellState; block?: Block; position?: Position } {
  for (const b of blocks) {
    if (iso >= b.start && iso < b.end) {
      const state: CellState = b.source === "site" ? "booked" : (b.source as CellState);
      const lastDay = addDays(b.end, -1);
      const position: Position =
        b.start === iso && lastDay === iso ? "single"
        : b.start === iso ? "first"
        : lastDay === iso ? "last"
        : "middle";
      return { state, block: b, position };
    }
  }
  return { state: "open" };
}

const STATE_COLOR: Record<CellState, string> = {
  open:   "bg-green-500/15 hover:bg-green-500/25 text-cream",
  hold:   "bg-amber-500/35 text-cream",
  manual: "bg-red-500/45 text-cream",
  airbnb: "bg-blue-500/35 text-cream/80",
  booked: "bg-red-500/45 text-cream",
};

const STATE_LABEL: Record<CellState, string> = {
  open:   "Available",
  hold:   "Hold (pending checkout)",
  manual: "Manually blocked",
  airbnb: "Airbnb booking",
  booked: "Site booking",
};

export function AdminCalendar({ hutId, initialBlocks }: { hutId: string; initialBlocks: Block[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Block | null>(null);
  const months = useMemo(() => nextMonths(3), []);

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

  async function deleteBlock(block: Block) {
    if (!block.eventId) return;
    setBusy(block.eventId);
    try {
      const r = await fetch(`/api/admin/block?hut=${hutId}&eventId=${block.eventId}`, { method: "DELETE" });
      if (r.ok) {
        setBlocks((bs) => bs.filter((b) => b.eventId !== block.eventId));
        setSelected(null);
      }
    } finally {
      setBusy(null);
    }
  }

  async function createBlock(iso: string) {
    setBusy(iso);
    try {
      const r = await fetch("/api/admin/block", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hutId, start: iso, end: addDays(iso, 1), notes: "Blocked by manager" }),
      });
      if (r.ok) {
        const added = await r.json();
        setBlocks((bs) => [...bs, added]);
      }
    } finally {
      setBusy(null);
    }
  }

  function handleDayClick(iso: string, c: ReturnType<typeof classify>) {
    if (c.state === "open") {
      createBlock(iso);
    } else if (c.block) {
      setSelected(c.block);
    }
  }

  const today = todayISO();

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
              min={today}
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50"
            />
          </div>
          <div>
            <label className="block text-[0.55rem] tracking-widest uppercase text-amber-400/70 mb-1">To</label>
            <input
              type="date"
              min={rangeStart || today}
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50"
            />
          </div>
        </div>
        <textarea
          placeholder="Note (e.g. Owner stay, Maintenance…)"
          value={rangeNote}
          onChange={(e) => setRangeNote(e.target.value)}
          rows={2}
          className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50 placeholder:text-cream/25 resize-y"
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
          <div className="grid grid-cols-7 gap-y-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-[0.55rem] text-cream/30 py-1">{d}</div>
            ))}
            {Array.from({ length: m.firstDayOffset }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: m.daysInMonth }, (_, i) => i + 1).map((day) => {
              const iso = `${m.year}-${String(m.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const past = iso < today;
              const c = classify(iso, blocks);
              const isOpen = c.state === "open";
              const pos = c.position;

              const roundingClass =
                isOpen || !pos ? "rounded-sm"
                : pos === "single" ? "rounded-sm"
                : pos === "first" ? "rounded-l-sm rounded-r-none"
                : pos === "last" ? "rounded-r-sm rounded-l-none"
                : "rounded-none";

              const xPadding =
                !isOpen && pos === "middle" ? "-mx-px"
                : !isOpen && pos === "last" ? "-ml-px"
                : !isOpen && pos === "first" ? "-mr-px"
                : "";

              const colorClass = past
                ? "bg-white/3 text-cream/20 cursor-default"
                : STATE_COLOR[c.state];

              const isBusy = busy === iso || busy === c.block?.eventId;

              return (
                <button
                  key={iso}
                  disabled={past || isBusy}
                  onClick={() => !past && handleDayClick(iso, c)}
                  className={`aspect-square flex flex-col items-center justify-center gap-0 text-[0.7rem] font-light transition-colors ${colorClass} ${roundingClass} ${xPadding} ${isBusy ? "opacity-40" : ""}`}
                  title={isOpen ? "Click to block" : STATE_LABEL[c.state]}
                >
                  <span>{day}</span>
                  {!isOpen && pos === "first" && <span className="text-[0.42rem] tracking-widest uppercase opacity-60 leading-none">in</span>}
                  {!isOpen && pos === "last"  && <span className="text-[0.42rem] tracking-widest uppercase opacity-60 leading-none">out</span>}
                  {!isOpen && pos === "single" && <span className="text-[0.42rem] tracking-widest uppercase opacity-60 leading-none">·</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[0.6rem] text-cream/50 pt-2 border-t border-white/8">
        <span><span className="inline-block w-2.5 h-2.5 bg-green-500/30 mr-1.5 align-middle rounded-sm" />Open — click to block</span>
        <span><span className="inline-block w-2.5 h-2.5 bg-amber-500/40 mr-1.5 align-middle rounded-sm" />Hold</span>
        <span><span className="inline-block w-2.5 h-2.5 bg-red-500/45 mr-1.5 align-middle rounded-sm" />Blocked — click to view</span>
        <span><span className="inline-block w-2.5 h-2.5 bg-blue-500/35 mr-1.5 align-middle rounded-sm" />Airbnb — click to view</span>
      </div>

      {/* Block detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-sm bg-[#0e0d0b] border border-white/10 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/35">
              {STATE_LABEL[selected.source === "site" ? "booked" : selected.source as CellState]}
            </div>

            <div className="space-y-1">
              {selected.guestName && (
                <div className="font-serif text-lg text-cream">{selected.guestName}</div>
              )}
              {selected.guestEmail && (
                <div className="text-xs text-cream/50">{selected.guestEmail}</div>
              )}
              <div className="text-sm text-cream/60">
                {formatDate(selected.start)} → {formatDate(addDays(selected.end, -1))}
              </div>
              {selected.notes && selected.notes !== "Blocked by manager" && (
                <div className="text-xs text-cream/40 italic pt-1">{selected.notes}</div>
              )}
              {selected.paymentId && (
                <div className="text-[0.6rem] text-cream/30 font-mono pt-1">Payment: {selected.paymentId}</div>
              )}
            </div>

            {selected.source === "manual" && (
              <button
                onClick={() => deleteBlock(selected)}
                disabled={busy === selected.eventId}
                className="w-full py-2 border border-red-500/40 text-red-400 text-[0.6rem] tracking-[0.15em] uppercase hover:bg-red-500/15 disabled:opacity-40 transition-colors"
              >
                {busy === selected.eventId ? "Unblocking…" : "Unblock these dates"}
              </button>
            )}

            <button
              onClick={() => setSelected(null)}
              className="w-full py-2 border border-white/10 text-cream/35 text-[0.6rem] tracking-[0.15em] uppercase hover:bg-white/5 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
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

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
