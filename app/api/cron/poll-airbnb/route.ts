// Pulls each hut's Airbnb iCal feed and mirrors blocks back to Google Calendar.
// Schedule from Vercel cron: every 10 min → POST /api/cron/poll-airbnb with Authorization: Bearer ${CRON_SECRET}
//
// Idempotent: we tag mirrored events with extendedProperties.medan_source = "airbnb"
// and the iCal UID so re-runs don't create duplicates.

import { NextRequest, NextResponse } from "next/server";
import * as nodeIcal from "node-ical";
import { HUTS } from "@/lib/huts";
import { createBlock, listBlocks, deleteBlock } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runPoll());
}

// Also support GET for manual triggers in dev/inspection (still requires auth)
export async function GET(req: NextRequest) { return POST(req); }

export async function runPoll() {
  type HutReport = {
    added: number; removed: number; skipped: number; error?: string;
    addedEvents?: { start: string; end: string; summary: string; uid: string }[];
    removedEvents?: { start: string; end: string; guestName?: string; uid: string }[];
  };
  const report: Record<string, HutReport> = {};

  for (const hut of HUTS) {
    const url = process.env[hut.airbnbIcalUrlEnv];
    if (!url) { report[hut.id] = { added: 0, removed: 0, skipped: 0, error: "no iCal url configured" }; continue; }

    try {
      const events = await nodeIcal.async.fromURL(url);
      const incoming = Object.values(events)
        .filter((e): e is nodeIcal.VEvent => (e as { type?: string }).type === "VEVENT")
        .filter((e) => {
          // Skip Airbnb availability-window blocks — summaries include
          // "Not available" and "Airbnb (Not available)". These are not real
          // bookings; importing them falsely blocks our calendar.
          const s = String((e as { summary?: string }).summary ?? "").trim().toLowerCase();
          return s !== "" && !s.includes("not available");
        })
        .map((e) => ({
          uid: String(e.uid),
          start: toIso(e.start as Date),
          end: toIso(e.end as Date),
          summary: String(e.summary ?? ""),
        }));

      const from = new Date().toISOString().slice(0, 10);
      // Only reconcile within the window Airbnb reliably exports (~4 months).
      // Beyond that, Airbnb drops bookings from the feed but they're not cancelled —
      // deleting them would falsely re-open real bookings.
      const toDate = new Date(); toDate.setMonth(toDate.getMonth() + 4);
      const to = toDate.toISOString().slice(0, 10);
      const existing = (await listBlocks(hut.id, from, to)).filter((b) => b.source === "airbnb");

      const existingByNote = new Map(existing.map((b) => [b.notes ?? "", b]));
      const incomingByUid = new Map(incoming.map((i) => [i.uid, i]));

      let added = 0, removed = 0;
      const addedEvents: HutReport["addedEvents"] = [];
      const removedEvents: HutReport["removedEvents"] = [];

      // Add new
      for (const inc of incoming) {
        if (existingByNote.has(`uid:${inc.uid}`)) continue;
        if (inc.start >= to) continue;
        await createBlock(hut.id, {
          start: inc.start,
          end: inc.end,
          source: "airbnb",
          notes: `uid:${inc.uid}`,
          guestName: inc.summary,
        });
        addedEvents!.push({ start: inc.start, end: inc.end, summary: inc.summary, uid: inc.uid });
        added++;
      }

      // Remove cancelled
      for (const ex of existing) {
        const uid = (ex.notes ?? "").replace(/^uid:/, "");
        if (!uid || !incomingByUid.has(uid)) {
          if (ex.eventId) {
            await deleteBlock(hut.id, ex.eventId);
            removedEvents!.push({ start: ex.start, end: ex.end, guestName: ex.guestName, uid });
            removed++;
          }
        }
      }

      report[hut.id] = { added, removed, skipped: incoming.length - added, addedEvents, removedEvents };
    } catch (e: unknown) {
      report[hut.id] = { added: 0, removed: 0, skipped: 0, error: e instanceof Error ? e.message : String(e) };
    }
  }

  return { ok: true, ranAt: new Date().toISOString(), report };
}

function toIso(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}
