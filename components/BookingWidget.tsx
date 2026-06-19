"use client";

import { useEffect, useMemo, useState } from "react";
import { HUTS, BOOKING_RULES } from "@/lib/huts";

const VISIBLE_HUTS = HUTS.filter((h) => !h.hidden);
const BOTH_ID = "both";
const BOTH_RATE = VISIBLE_HUTS.reduce((sum, h) => sum + h.nightlyRateInr, 0);
const BOTH_MAX_GUESTS = VISIBLE_HUTS.reduce((sum, h) => sum + h.maxGuests, 0);

type Availability = {
  available: boolean;
  blocked: { start: string; end: string; source: string }[];
  nights: number;
  totalInr?: number;
  nextAvailable?: { from: string; to: string } | null;
  breakdown?: { nightlyInr: number; subtotalInr: number; cleaningFeeInr: number; taxInr: number };
};

function fmtINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function BookingWidget({ defaultHutId }: { defaultHutId?: string }) {
  const [hutId, setHutId] = useState(defaultHutId ?? VISIBLE_HUTS[0].id);
  const [checkIn, setCheckIn] = useState(todayISO(7));
  const [checkOut, setCheckOut] = useState(todayISO(9));
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [bothTotal, setBothTotal] = useState<number | null>(null);
  const [nextAvailable, setNextAvailable] = useState<{ from: string; to: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isBoth = hutId === BOTH_ID;
  const hut = useMemo(() => VISIBLE_HUTS.find((h) => h.id === hutId), [hutId]);
  const maxGuests = isBoth ? BOTH_MAX_GUESTS / VISIBLE_HUTS.length : (hut?.maxGuests ?? 4);
  const nights = nightsBetween(checkIn, checkOut);

  async function check() {
    setLoading(true);
    setError(null);
    setAvailability(null);
    setBothTotal(null);
    setNextAvailable(null);
    try {
      if (isBoth) {
        const results = await Promise.all(
          VISIBLE_HUTS.map((h) =>
            fetch(`/api/availability?hut=${h.id}&from=${checkIn}&to=${checkOut}&guests=${guests}`).then((r) => r.json())
          )
        );
        const allAvailable = results.every((r) => r.available);
        const total = results.reduce((sum, r) => sum + (r.totalInr ?? 0), 0);
        setBothTotal(total);

        if (!allAvailable) {
          // Find the latest nextAvailable across both huts so both are free
          const suggestions = results.map((r) => r.nextAvailable).filter(Boolean);
          if (suggestions.length > 0) {
            const latest = suggestions.reduce((a: { from: string; to: string }, b: { from: string; to: string }) =>
              b.from > a.from ? b : a
            );
            setNextAvailable(latest);
          }
        }

        setAvailability({ available: allAvailable, blocked: [], nights: results[0]?.nights ?? nights });
      } else {
        const url = `/api/availability?hut=${hutId}&from=${checkIn}&to=${checkOut}&guests=${guests}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error("Couldn't check availability. Try again.");
        const data = await r.json();
        setAvailability(data);
        if (!data.available && data.nextAvailable) setNextAvailable(data.nextAvailable);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function applyNextAvailable() {
    if (!nextAvailable) return;
    setCheckIn(nextAvailable.from);
    setCheckOut(nextAvailable.to);
    setAvailability(null);
    setNextAvailable(null);
  }

  function startCheckout() {
    const cottageName = isBoth ? "Both Cottages" : (hut?.name ?? "a cottage");
    const total = isBoth ? (bothTotal ?? 0) : (availability?.totalInr ?? 0);
    const msg = encodeURIComponent(
      `Hi, I'd like to book ${cottageName} from ${fmtDate(checkIn)} to ${fmtDate(checkOut)} (${nights} night${nights === 1 ? "" : "s"}) for ${guests} guest${guests === 1 ? "" : "s"}. Total: ${fmtINR(total)}. Please confirm and share payment details.`
    );
    window.open(`https://wa.me/918715008939?text=${msg}`, "_blank");
  }

  useEffect(() => {
    setAvailability(null);
    setBothTotal(null);
    setNextAvailable(null);
    setError(null);
  }, [hutId, checkIn, checkOut, guests]);

  const displayTotal = isBoth ? (bothTotal ?? 0) : (availability?.totalInr ?? 0);

  return (
    <div className="bw">
      <div className="bw__grid">
        <div className="bw__cell">
          <label>Stay</label>
          <select value={hutId} onChange={(e) => setHutId(e.target.value)}>
            {VISIBLE_HUTS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} · ₹{h.nightlyRateInr.toLocaleString("en-IN")}
              </option>
            ))}
            <option value={BOTH_ID}>Both Cottages · ₹{BOTH_RATE.toLocaleString("en-IN")}</option>
          </select>
        </div>
        <div className="bw__cell">
          <label>Check In</label>
          <input type="date" value={checkIn} min={todayISO()} onChange={(e) => setCheckIn(e.target.value)} />
        </div>
        <div className="bw__cell">
          <label>Check Out</label>
          <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} />
        </div>
        <div className="bw__cell">
          <label>{isBoth ? "Guests / cottage" : "Guests"}</label>
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} guest{n === 1 ? "" : "s"}{isBoth ? " / cottage" : ""}</option>
            ))}
          </select>
        </div>
        <div className="bw__cell bw__cell--cta">
          {!availability ? (
            <button className="bw__cta w-full" onClick={check} disabled={loading || nights < BOOKING_RULES.minNights}>
              {loading ? "Checking…" : "Check Availability"}
            </button>
          ) : availability.available ? (
            <button className="bw__cta w-full" onClick={startCheckout}>
              {`Reserve · ${fmtINR(displayTotal)}`}
            </button>
          ) : (
            <span className="text-[0.7rem] text-red-400/80">Not available</span>
          )}
          {nights > 0 && nights < BOOKING_RULES.minNights && (
            <span className="text-[0.6rem] text-[var(--amber)] mt-1 block">Min {BOOKING_RULES.minNights} nights</span>
          )}
        </div>
      </div>

      {error && <p className="mt-4 text-[0.72rem] text-red-400/80">{error}</p>}

      {/* Not available — suggest next open window */}
      {availability && !availability.available && (
        <div className="bw__suggestion">
          {nextAvailable ? (
            <>
              <div className="bw__suggestion-text">
                <span className="bw__suggestion-label">Next available</span>
                <span className="bw__suggestion-dates">
                  {fmtDate(nextAvailable.from)} – {fmtDate(nextAvailable.to)}
                  <span className="bw__suggestion-nights"> · {nightsBetween(nextAvailable.from, nextAvailable.to)} nights</span>
                </span>
              </div>
              <button className="bw__suggestion-cta" onClick={applyNextAvailable}>
                Book these dates →
              </button>
            </>
          ) : (
            <p className="bw__suggestion-label">No availability in the next 4 months. Please contact us.</p>
          )}
        </div>
      )}

      {availability?.available && !isBoth && availability.breakdown && (
        <div className="bw__breakdown">
          <div className="bw__row"><span>{fmtINR(availability.breakdown.nightlyInr)} × {availability.nights} nights</span><span>{fmtINR(availability.breakdown.subtotalInr)}</span></div>
          <div className="bw__row"><span>Cleaning</span><span>{fmtINR(availability.breakdown.cleaningFeeInr)}</span></div>
          <div className="bw__row"><span>GST</span><span>{fmtINR(availability.breakdown.taxInr)}</span></div>
          <div className="bw__row bw__row--total"><span>Total</span><span>{fmtINR(displayTotal)}</span></div>
        </div>
      )}

      {availability?.available && isBoth && bothTotal !== null && (
        <div className="bw__breakdown">
          <div className="bw__row"><span>₹{BOTH_RATE.toLocaleString("en-IN")} × {nights} nights (both cottages)</span><span>{fmtINR(BOTH_RATE * nights)}</span></div>
          <div className="bw__row"><span>Cleaning (×2)</span><span>{fmtINR(BOOKING_RULES.cleaningFeeInr * 2)}</span></div>
          <div className="bw__row"><span>GST</span><span>{fmtINR(Math.round(bothTotal - BOTH_RATE * nights - BOOKING_RULES.cleaningFeeInr * 2))}</span></div>
          <div className="bw__row bw__row--total"><span>Total</span><span>{fmtINR(bothTotal)}</span></div>
        </div>
      )}


    </div>
  );
}
