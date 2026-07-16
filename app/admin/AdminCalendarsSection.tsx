"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const calRefs = useRef<Record<string, AdminCalendarHandle | null>>({});

  const [selectedHuts, setSelectedHuts] = useState<Set<string>>(new Set());
  const [syncBusy, setSyncBusy] = useState(false);
  type SyncEvent = { start: string; end: string; summary: string; uid: string };
  type SyncHutReport = { added: number; removed: number; skipped: number; error?: string; addedEvents?: SyncEvent[]; removedEvents?: { start: string; end: string; guestName?: string; uid: string }[] };
  const [syncReport, setSyncReport] = useState<Record<string, SyncHutReport> | null>(null);
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
  const [waMsg, setWaMsg] = useState<string | null>(null);

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

  function buildWhatsAppMsg(hutNames: string[]) {
    const fmt = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const nights = Math.round((new Date(rangeEnd).getTime() - new Date(rangeStart).getTime()) / 86400000);
    const lines = [
      `*New Booking — Villa Cottages*`,
      ``,
      `*Cottage:* ${hutNames.join(" + ")}`,
      `*Guest:* ${rangeGuest}`,
      rangePhone ? `*Phone:* ${rangePhone}` : null,
      rangeEmail ? `*Email:* ${rangeEmail}` : null,
      rangeGuests ? `*Guests:* ${rangeGuests}` : null,
      ``,
      `*Check-in:* ${fmt(rangeStart)}`,
      `*Check-out:* ${fmt(rangeEnd)} (${nights} night${nights !== 1 ? "s" : ""})`,
      ``,
      rangeTotal ? `*Total:* ₹${Number(rangeTotal).toLocaleString("en-IN")}` : null,
      rangeAdvance ? `*Advance paid:* ₹${Number(rangeAdvance).toLocaleString("en-IN")}` : null,
      rangeNote ? `*Note:* ${rangeNote}` : null,
    ].filter(Boolean).join("\n");
    return lines;
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
      if (rangeGuest) {
        const hutNames = [...selectedHuts].map((id) => huts.find((h) => h.id === id)?.name ?? id);
        setWaMsg(buildWhatsAppMsg(hutNames));
      }
      resetForm();
    } else {
      setMsg(`${results.length - failed} saved, ${failed} failed`);
    }
    setTimeout(() => setMsg(null), 3000);
  }

  const canSave = !!rangeStart && !!rangeEnd && rangeStart < rangeEnd && selectedHuts.size > 0 && !busy;

  async function handleSyncAirbnb() {
    setSyncBusy(true);
    setSyncReport(null);
    try {
      const r = await fetch("/api/admin/sync-airbnb", { method: "POST" });
      const data = await r.json();
      if (!r.ok) { setSyncReport({}); return; }
      const { report } = data as { report: Record<string, SyncHutReport> };
      setSyncReport(report);
      if (Object.values(report).some((v) => v.added > 0 || v.removed > 0)) {
        router.refresh();
      }
    } finally {
      setSyncBusy(false);
    }
  }

  function fmtDate(iso: string) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

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

      {/* Airbnb sync */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAirbnb}
            disabled={syncBusy}
            className="px-4 py-1.5 border border-blue-500/40 text-blue-400 text-[0.6rem] tracking-[0.18em] uppercase hover:bg-blue-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {syncBusy ? "Syncing…" : "↻ Sync Airbnb"}
          </button>
          {syncReport && <button onClick={() => setSyncReport(null)} className="text-[0.55rem] text-cream/30 hover:text-cream/60 transition-colors">✕ dismiss</button>}
        </div>

        {syncReport && (
          <div className="border border-white/8 bg-white/3 p-3 space-y-3 text-[0.68rem]">
            {Object.entries(syncReport).map(([hutId, r]) => {
              const hut = huts.find((h) => h.id === hutId);
              const label = hut?.name ?? hutId;
              if (r.error) return (
                <div key={hutId}>
                  <div className="text-[0.55rem] tracking-widest uppercase text-cream/35 mb-1">{label}</div>
                  <div className="text-red-400/70">{r.error}</div>
                </div>
              );
              const hasChanges = (r.addedEvents?.length ?? 0) + (r.removedEvents?.length ?? 0) > 0;
              return (
                <div key={hutId}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[0.55rem] tracking-widest uppercase text-cream/35">{label}</span>
                    <span className="text-cream/30">·</span>
                    {hasChanges ? (
                      <>
                        {(r.addedEvents?.length ?? 0) > 0 && <span className="text-green-400/80">+{r.added} added</span>}
                        {(r.removedEvents?.length ?? 0) > 0 && <span className="text-red-400/70 ml-1">−{r.removed} removed</span>}
                      </>
                    ) : (
                      <span className="text-cream/30">up to date</span>
                    )}
                  </div>
                  {r.addedEvents?.map((e) => (
                    <div key={e.uid} className="flex items-center gap-2 pl-2 py-0.5 border-l border-green-500/30 mb-1">
                      <span className="text-green-400/70">+</span>
                      <span className="text-cream/60">{fmtDate(e.start)} → {fmtDate(e.end)}</span>
                      <span className="text-cream/35">{e.summary}</span>
                    </div>
                  ))}
                  {r.removedEvents?.map((e) => (
                    <div key={e.uid} className="flex items-center gap-2 pl-2 py-0.5 border-l border-red-500/30 mb-1">
                      <span className="text-red-400/70">−</span>
                      <span className="text-cream/60">{fmtDate(e.start)} → {fmtDate(e.end)}</span>
                      {e.guestName && <span className="text-cream/35">{e.guestName}</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
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

      {/* WhatsApp share dialog */}
      {waMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div style={{ background: "#1e1c14", border: "1px solid rgba(212,175,55,0.25)" }} className="p-6 max-w-sm w-full space-y-4">
            <div style={{ color: "rgba(242,234,216,0.5)" }} className="text-[0.6rem] tracking-[0.18em] uppercase">Booking confirmed</div>
            <pre style={{ color: "#f2ead8", fontSize: "0.72rem", lineHeight: 1.7 }} className="whitespace-pre-wrap font-sans">{waMsg}</pre>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(waMsg)}`, "_blank"); setWaMsg(null); }}
                className="flex-1 py-2 bg-[#25D366] text-[#0e0d0b] text-[0.65rem] tracking-[0.15em] uppercase font-medium hover:opacity-90 transition-opacity"
              >
                Post to WhatsApp
              </button>
              <button
                onClick={() => setWaMsg(null)}
                className="px-4 py-2 border border-white/15 text-cream/40 text-[0.65rem] tracking-[0.15em] uppercase hover:text-cream/60 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
