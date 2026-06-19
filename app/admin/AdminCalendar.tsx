"use client";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
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

const STATE_LABEL: Record<CellState, string> = {
  open:   "Available",
  hold:   "Hold (pending checkout)",
  manual: "Manually blocked",
  airbnb: "Airbnb booking",
  booked: "Site booking",
};

const BAR_COLOR: Record<CellState, string> = {
  open:   "",
  hold:   "bg-amber-400/80",
  manual: "bg-red-500/80",
  airbnb: "bg-blue-500/75",
  booked: "bg-red-500/80",
};

export type AdminCalendarHandle = {
  addBlock: (block: Block) => void;
};

export const AdminCalendar = forwardRef<
  AdminCalendarHandle,
  { hutId: string; initialBlocks: Block[] }
>(function AdminCalendar({ hutId, initialBlocks }, ref) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Block | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<Block | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const months = useMemo(() => nextMonths(6), []);
  const m = months[monthOffset];

  useImperativeHandle(ref, () => ({
    addBlock: (block: Block) => setBlocks((bs) => [...bs, block]),
  }));

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

  function openBlock(b: Block | null) {
    setSelected(b);
    setEditMode(false);
    setEditDraft(null);
  }

  function handleDayClick(iso: string, c: ReturnType<typeof classify>) {
    if (c.state === "open") {
      createBlock(iso);
    } else if (c.block) {
      openBlock(c.block);
    }
  }

  async function saveEdit() {
    if (!editDraft?.eventId) return;
    setSaveBusy(true);
    try {
      const r = await fetch("/api/admin/block", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hutId, block: editDraft }),
      });
      if (r.ok) {
        const updated: Block = await r.json();
        setBlocks((bs) => bs.map((b) => b.eventId === updated.eventId ? updated : b));
        openBlock(updated);
      }
    } finally {
      setSaveBusy(false);
    }
  }

  const today = todayISO();

  return (
    <div className="space-y-6">

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonthOffset((o) => o - 1)}
          disabled={monthOffset === 0}
          className="w-7 h-7 flex items-center justify-center text-cream/50 hover:text-cream disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-base"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="text-[0.7rem] tracking-[0.18em] uppercase text-cream/60 select-none">
          {monthName(m.month)} {m.year}
        </span>
        <button
          onClick={() => setMonthOffset((o) => o + 1)}
          disabled={monthOffset === months.length - 1}
          className="w-7 h-7 flex items-center justify-center text-cream/50 hover:text-cream disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-base"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[0.5rem] text-cream/30 pb-2">{d}</div>
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
          const isBusy = busy === iso || busy === c.block?.eventId;

          return (
            <button
              key={iso}
              disabled={past || isBusy}
              onClick={() => !past && handleDayClick(iso, c)}
              title={isOpen ? "Click to block" : STATE_LABEL[c.state]}
              className={[
                "relative aspect-square flex flex-col items-center justify-center text-[0.68rem] font-light transition-colors select-none",
                past ? "text-cream/20 cursor-default" : "text-cream",
                isOpen && !past ? "hover:bg-green-500/15 cursor-pointer" : "",
                !isOpen && !past ? "cursor-pointer hover:brightness-110" : "",
                isBusy ? "opacity-40" : "",
              ].join(" ")}
            >
              <span className="relative z-10 leading-none">{day}</span>

              {!isOpen && pos === "first" && (
                <span className="relative z-10 text-[0.37rem] tracking-[0.08em] uppercase text-cream/50 leading-none mt-[3px]">in</span>
              )}
              {!isOpen && pos === "last" && (
                <span className="relative z-10 text-[0.37rem] tracking-[0.08em] uppercase text-cream/50 leading-none mt-[3px]">out</span>
              )}

              {!isOpen && pos && (
                <div
                  className={[
                    "absolute bottom-1 h-[5px]",
                    BAR_COLOR[c.state],
                    pos === "first"  ? "left-1/2 right-0 rounded-l-sm" :
                    pos === "last"   ? "left-0 right-1/2 rounded-r-sm" :
                    pos === "middle" ? "left-0 right-0" :
                    "left-[18%] right-[18%] rounded-sm",
                  ].join(" ")}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[0.58rem] text-cream/45 pt-2 border-t border-white/8">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-[5px] bg-green-500/40 rounded-sm" />
          Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-[5px] bg-amber-400/80 rounded-sm" />
          Hold
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-[5px] bg-red-500/80 rounded-sm" />
          Blocked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-[5px] bg-blue-500/75 rounded-sm" />
          Airbnb
        </span>
      </div>

      {/* Block detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => { setSelected(null); setEditMode(false); setEditDraft(null); }}
        >
          <div
            className="w-full max-w-sm bg-[#0e0d0b] border border-white/10 p-6 space-y-4 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/35">
                {STATE_LABEL[selected.source === "site" ? "booked" : selected.source as CellState]}
              </div>
              {!editMode && (
                <button
                  onClick={() => { setEditMode(true); setEditDraft({ ...selected }); }}
                  className="text-[0.55rem] tracking-[0.15em] uppercase text-amber-400/70 hover:text-amber-400 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {editMode && editDraft ? (
              <div className="space-y-3">
                {[
                  { label: "Guest name",       key: "guestName",      type: "text" },
                  { label: "Email",             key: "guestEmail",     type: "email" },
                  { label: "Phone",             key: "guestPhone",     type: "tel" },
                  { label: "Guests",            key: "guests",         type: "text", placeholder: "e.g. 2 adults, 1 child" },
                  { label: "Check-in time",     key: "checkInTime",    type: "time" },
                  { label: "Check-out time",    key: "checkOutTime",   type: "time" },
                  { label: "Total (₹)",         key: "totalAmountInr", type: "number" },
                  { label: "Advance paid (₹)",  key: "advancePaidInr", type: "number" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[0.5rem] tracking-widest uppercase text-amber-400/60 mb-1">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={(editDraft as Record<string, string | number | undefined>)[key] ?? ""}
                      onChange={(e) => setEditDraft((d) => d ? {
                        ...d,
                        [key]: type === "number" ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value || undefined,
                      } : d)}
                      className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[0.5rem] tracking-widest uppercase text-amber-400/60 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={editDraft.notes ?? ""}
                    onChange={(e) => setEditDraft((d) => d ? { ...d, notes: e.target.value || undefined } : d)}
                    className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50 resize-y"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveEdit}
                    disabled={saveBusy}
                    className="flex-1 py-2 bg-amber-400/15 border border-amber-400/40 text-amber-400 text-[0.6rem] tracking-[0.15em] uppercase hover:bg-amber-400/25 disabled:opacity-40 transition-colors"
                  >
                    {saveBusy ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => { setEditMode(false); setEditDraft(null); }}
                    className="flex-1 py-2 border border-white/10 text-cream/35 text-[0.6rem] tracking-[0.15em] uppercase hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  {selected.guestName && (
                    <div className="font-serif text-lg text-cream">{selected.guestName}</div>
                  )}
                  {selected.guestEmail && (
                    <div className="text-xs text-cream/50">{selected.guestEmail}</div>
                  )}
                  {selected.guestPhone && (
                    <div className="text-xs text-cream/50">{selected.guestPhone}</div>
                  )}

                  <div className="text-sm text-cream/60 pt-0.5">
                    {formatDate(selected.start)} → {formatDate(addDays(selected.end, -1))}
                    {" · "}{nightsBetween(selected.start, selected.end)} night{nightsBetween(selected.start, selected.end) === 1 ? "" : "s"}
                  </div>

                  {(selected.checkInTime || selected.checkOutTime) && (
                    <div className="text-xs text-cream/45">
                      {selected.checkInTime && <>Check-in {selected.checkInTime}</>}
                      {selected.checkInTime && selected.checkOutTime && "  ·  "}
                      {selected.checkOutTime && <>Check-out {selected.checkOutTime}</>}
                    </div>
                  )}
                  {selected.guests && (
                    <div className="text-xs text-cream/45">{selected.guests}</div>
                  )}
                  {selected.totalAmountInr != null && (
                    <div className="text-xs text-cream/45">
                      Total ₹{selected.totalAmountInr.toLocaleString("en-IN")}
                      {selected.advancePaidInr != null && (
                        <span className="text-cream/30"> · Advance ₹{selected.advancePaidInr.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  )}
                  {selected.notes && (
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

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
  const [y, mo, d] = iso.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function nightsBetween(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);
}
