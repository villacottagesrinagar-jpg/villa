"use client";

import { useRef, useState } from "react";
import { AdminCalendar, type AdminCalendarHandle } from "./AdminCalendar";
import type { Block } from "@/lib/calendar";

type HutInfo = { id: string; name: string; tier: string };

function todayISO() { return new Date().toISOString().slice(0, 10); }

export function AdminCalendarsSection({
  huts,
  initialBlocksMap,
}: {
  huts: HutInfo[];
  initialBlocksMap: Record<string, Block[]>;
}) {
  const calRefs = useRef<Record<string, AdminCalendarHandle | null>>({});

  const [selectedHuts, setSelectedHuts] = useState<Set<string>>(new Set());
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeGuest, setRangeGuest] = useState("");
  const [rangePhone, setRangePhone] = useState("");
  const [rangeEmail, setRangeEmail] = useState("");
  const [rangeGuests, setRangeGuests] = useState("");
  const [rangeTotal, setRangeTotal] = useState("");
  const [rangeAdvance, setRangeAdvance] = useState("");
  const [rangeNote, setRangeNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const today = todayISO();

  function toggleHut(id: string) {
    setSelectedHuts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function resetForm() {
    setSelectedHuts(new Set());
    setRangeStart(""); setRangeEnd("");
    setRangeGuest(""); setRangePhone(""); setRangeEmail(""); setRangeGuests("");
    setRangeTotal(""); setRangeAdvance(""); setRangeNote("");
  }

  async function handleSave() {
    if (!rangeStart || !rangeEnd || rangeStart >= rangeEnd || selectedHuts.size === 0) return;
    setBusy(true);
    setMsg(null);
    const results = await Promise.allSettled(
      [...selectedHuts].map(async (hutId) => {
        const r = await fetch("/api/admin/block", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            hutId,
            start: rangeStart,
            end: rangeEnd,
            source: rangeGuest ? "site" : "manual",
            guestName: rangeGuest || undefined,
            guestPhone: rangePhone || undefined,
            guestEmail: rangeEmail || undefined,
            guests: rangeGuests || undefined,
            totalAmountInr: rangeTotal ? Number(rangeTotal) : undefined,
            advancePaidInr: rangeAdvance ? Number(rangeAdvance) : undefined,
            notes: rangeNote || (rangeGuest ? undefined : "Blocked by manager"),
          }),
        });
        if (!r.ok) throw new Error(hutId);
        const block: Block = await r.json();
        calRefs.current[hutId]?.addBlock(block);
      })
    );
    setBusy(false);
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 0) {
      setMsg("✓ Saved");
      resetForm();
    } else {
      setMsg(`${results.length - failed} saved, ${failed} failed`);
    }
    setTimeout(() => setMsg(null), 3000);
  }

  const canSave = !!rangeStart && !!rangeEnd && rangeStart < rangeEnd && selectedHuts.size > 0 && !busy;

  return (
    <>
      {/* Unified block form */}
      <div className="mb-10 p-4 border border-[var(--amber)]/15 bg-[var(--amber)]/4 space-y-3">
        <div className="text-[0.6rem] tracking-[0.18em] uppercase text-cream/45">Block a date range</div>

        {/* Hut selection */}
        <div className="flex flex-wrap gap-4">
          {huts.map((h) => {
            const checked = selectedHuts.has(h.id);
            return (
              <label key={h.id} className="flex items-center gap-2 cursor-pointer select-none group">
                <span
                  onClick={() => toggleHut(h.id)}
                  className={[
                    "w-3.5 h-3.5 flex-shrink-0 border transition-colors",
                    checked
                      ? "bg-amber-400/80 border-amber-400"
                      : "bg-transparent border-white/25 group-hover:border-amber-400/50",
                  ].join(" ")}
                >
                  {checked && (
                    <svg viewBox="0 0 10 10" className="w-full h-full text-[#0e0d0b]" fill="none">
                      <polyline points="2,5 4.2,7.5 8,2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span
                  onClick={() => toggleHut(h.id)}
                  className={[
                    "text-[0.72rem] transition-colors",
                    checked ? "text-cream/80" : "text-cream/40 group-hover:text-cream/60",
                  ].join(" ")}
                >
                  {h.name}
                </span>
              </label>
            );
          })}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[0.55rem] tracking-widest uppercase text-amber-400 mb-1">From</label>
            <input type="date" min={today} value={rangeStart} onChange={(e) => setRangeStart(e.target.value)}
              className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50 cursor-pointer [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
          <div>
            <label className="block text-[0.55rem] tracking-widest uppercase text-amber-400 mb-1">To</label>
            <input type="date" min={rangeStart || today} value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)}
              className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50 cursor-pointer [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
        </div>

        {/* Guest details */}
        <div className="text-[0.5rem] tracking-[0.18em] uppercase text-cream/30 pt-1">Guest details (optional)</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Guest name",  value: rangeGuest,   set: setRangeGuest,   type: "text"   },
            { label: "Phone",       value: rangePhone,   set: setRangePhone,   type: "tel"    },
            { label: "Email",       value: rangeEmail,   set: setRangeEmail,   type: "email"  },
            { label: "Guests",      value: rangeGuests,  set: setRangeGuests,  type: "text",  placeholder: "e.g. 2 adults, 1 child" },
            { label: "Total (₹)",   value: rangeTotal,   set: setRangeTotal,   type: "number" },
            { label: "Advance (₹)", value: rangeAdvance, set: setRangeAdvance, type: "number" },
          ].map(({ label, value, set, type, placeholder }) => (
            <div key={label}>
              <label className="block text-[0.5rem] tracking-widest uppercase text-amber-400 mb-1">{label}</label>
              <input type={type} placeholder={placeholder} value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50 placeholder:text-cream/20" />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-[0.5rem] tracking-widest uppercase text-amber-400 mb-1">Notes</label>
          <textarea placeholder="Owner stay, Maintenance, etc." value={rangeNote} onChange={(e) => setRangeNote(e.target.value)}
            rows={2}
            className="w-full bg-transparent border border-white/10 px-2 py-1.5 text-[0.75rem] text-cream outline-none focus:border-[var(--amber)]/50 placeholder:text-cream/25 resize-y" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-1.5 bg-red-500/30 border border-red-500/40 text-[0.6rem] tracking-[0.18em] uppercase text-cream hover:bg-red-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? "Saving…" : `Save${selectedHuts.size > 1 ? ` (${selectedHuts.size} huts)` : ""}`}
          </button>
          {msg && <span className="text-[0.65rem] text-cream/50">{msg}</span>}
        </div>
      </div>

      {/* Per-hut calendars */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {huts.map((h) => (
          <div key={h.id}>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-serif text-xl admin-text">{h.name}</h2>
              <span className="eyebrow text-[0.5rem]">{h.tier}</span>
            </div>
            <AdminCalendar
              ref={(el) => { calRefs.current[h.id] = el; }}
              hutId={h.id}
              initialBlocks={initialBlocksMap[h.id] ?? []}
            />
          </div>
        ))}
      </div>
    </>
  );
}
