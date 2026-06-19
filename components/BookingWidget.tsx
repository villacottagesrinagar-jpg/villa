"use client";

import { useEffect, useMemo, useState } from "react";
import { HUTS, BOOKING_RULES } from "@/lib/huts";

const VISIBLE_HUTS = HUTS.filter((h) => !h.hidden);

type Availability = {
  available: boolean;
  blocked: { start: string; end: string; source: string }[];
  nights: number;
  totalInr?: number;
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

export function BookingWidget({ defaultHutId }: { defaultHutId?: string }) {
  const [hutId, setHutId] = useState(defaultHutId ?? VISIBLE_HUTS[0].id);
  const [checkIn, setCheckIn] = useState(todayISO(7));
  const [checkOut, setCheckOut] = useState(todayISO(9));
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const hut = useMemo(() => VISIBLE_HUTS.find((h) => h.id === hutId)!, [hutId]);
  const nights = nightsBetween(checkIn, checkOut);

  async function check() {
    setLoading(true);
    setError(null);
    setAvailability(null);
    try {
      const url = `/api/availability?hut=${hutId}&from=${checkIn}&to=${checkOut}&guests=${guests}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error("Couldn't check availability. Try again.");
      const data = await r.json();
      setAvailability(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout() {
    setLoading(true);
    try {
      const r = await fetch("/api/booking/init", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hutId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone }),
      });
      const data = await r.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || "Couldn't start checkout.");
      }
    } catch {
      setError("Couldn't start checkout.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setAvailability(null);
    setError(null);
  }, [hutId, checkIn, checkOut, guests]);

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
          <label>Guests</label>
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {Array.from({ length: hut.maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} guest{n === 1 ? "" : "s"}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bw__footer">
        <div className="bw__footer-text">
          {nights > 0 ? (
            <>
              <span className="text-cream">{nights} night{nights === 1 ? "" : "s"}</span> · {fmtINR(hut.nightlyRateInr)}/night
              {nights < BOOKING_RULES.minNights && (
                <span className="text-[var(--amber)] ml-2">Minimum {BOOKING_RULES.minNights} nights</span>
              )}
            </>
          ) : (
            <>Choose your dates</>
          )}
        </div>

        {!availability ? (
          <button className="bw__cta" onClick={check} disabled={loading || nights < BOOKING_RULES.minNights}>
            {loading ? "Checking…" : "Check Availability"}
          </button>
        ) : availability.available ? (
          <button className="bw__cta" onClick={() => setShowGuestForm(true)} disabled={loading}>
            {`Reserve · ${fmtINR(availability.totalInr ?? 0)}`}
          </button>
        ) : (
          <span className="text-[0.75rem] text-red-400/80">Not available — try other dates</span>
        )}
      </div>

      {error && <p className="mt-4 text-[0.72rem] text-red-400/80">{error}</p>}

      {availability?.available && availability.breakdown && (
        <div className="bw__breakdown">
          <div className="bw__row"><span>{fmtINR(availability.breakdown.nightlyInr)} × {availability.nights} nights</span><span>{fmtINR(availability.breakdown.subtotalInr)}</span></div>
          <div className="bw__row"><span>Cleaning</span><span>{fmtINR(availability.breakdown.cleaningFeeInr)}</span></div>
          <div className="bw__row"><span>GST</span><span>{fmtINR(availability.breakdown.taxInr)}</span></div>
          <div className="bw__row bw__row--total"><span>Total</span><span>{fmtINR(availability.totalInr ?? 0)}</span></div>
        </div>
      )}

      {showGuestForm && (
        <div className="modal" onClick={() => setShowGuestForm(false)}>
          <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="eyebrow mb-3">Guest Details</div>
            <h3 className="font-serif text-2xl font-light mb-6">Almost there.</h3>
            <input className="modal__field" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full name" />
            <input className="modal__field" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} type="email" placeholder="Email" />
            <input className="modal__field" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} type="tel" placeholder="Phone (with country code)" />
            <button
              disabled={loading || !guestName || !guestEmail || !guestPhone}
              onClick={startCheckout}
              className="bw__cta w-full mt-3"
            >
              {loading ? "Redirecting…" : `Pay ${fmtINR(availability?.totalInr ?? 0)}`}
            </button>
            <p className="text-[0.62rem] text-cream/35 text-center mt-4">Secured by Cashfree. No payment taken until confirmed.</p>
          </div>
        </div>
      )}
    </div>
  );
}
