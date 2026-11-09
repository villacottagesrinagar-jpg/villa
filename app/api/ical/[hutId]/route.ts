// iCal feed that each channel imports to mirror our bookings.
//   Airbnb:   https://www.villacottages.in/api/ical/luxury-1               (no param — existing URL)
//   StayEasy: https://www.villacottages.in/api/ical/luxury-1?for=stayeasy
// Each channel gets everything EXCEPT blocks that originated from itself (avoids reflection loops),
// so Airbnb sees site + manual + hold + StayEasy blocks, and StayEasy sees site + manual + hold + Airbnb blocks.

import { NextRequest, NextResponse } from "next/server";
import ical, { ICalCalendarMethod } from "ical-generator";
import { listBlocks } from "@/lib/calendar";
import { getHut, BOOKING_RULES, SITE } from "@/lib/huts";

export async function GET(req: NextRequest, ctx: { params: Promise<{ hutId: string }> }) {
  const { hutId } = await ctx.params;
  const hut = getHut(hutId);
  if (!hut) return new NextResponse("Unknown hut", { status: 404 });

  // Which channel is consuming this feed. Default "airbnb" keeps the original URL working.
  const forParam = req.nextUrl.searchParams.get("for") ?? "airbnb";
  if (forParam !== "airbnb" && forParam !== "stayeasy") {
    return new NextResponse("Unknown channel", { status: 400 });
  }

  // Look 18 months ahead — Airbnb cares about future availability
  const from = new Date().toISOString().slice(0, 10);
  const toDate = new Date();
  toDate.setMonth(toDate.getMonth() + 18);
  const to = toDate.toISOString().slice(0, 10);

  const blocks = await listBlocks(hutId, from, to);

  const cal = ical({
    name: `${SITE.brandName} · ${hut.name}`,
    prodId: { company: SITE.brandName, product: "CottagesICal" },
    method: ICalCalendarMethod.PUBLISH,
    timezone: "Asia/Kolkata",
  });

  for (const b of blocks) {
    // Don't echo a channel's own blocks back to it (avoids reflection loop)
    if (b.source === forParam) continue;

    // Apply buffer day on either side of site bookings to soften iCal lag
    const buf = BOOKING_RULES.airbnbBufferDays;
    const start = addDays(b.start, -buf);
    const end = addDays(b.end, buf);

    cal.createEvent({
      id: `${b.eventId ?? `${b.start}_${b.end}`}@villacottages.in`,
      start: parseDate(start),
      end: parseDate(end),
      allDay: true,
      summary:
        b.source === "site"   ? `Reserved (${SITE.brandName})` :
        b.source === "manual" ? `Blocked (${SITE.brandName})` :
        b.source === "airbnb" ? "Reserved (Airbnb)" :
        b.source === "stayeasy" ? "Reserved (StayEasy)" :
        b.source === "hold"   ? `Held (${SITE.brandName})` :
        `Blocked`,
      description: `Imported from ${SITE.brandName}`,
    });
  }

  return new NextResponse(cal.toString(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
