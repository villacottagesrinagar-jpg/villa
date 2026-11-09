// Pulls each hut's external-channel iCal feeds (Airbnb, StayEasy) and mirrors blocks
// into that hut's Google Calendar. Triggered every 15 min by .github/workflows/poll-airbnb.yml
// (GET with Authorization: Bearer ${CRON_SECRET}); Vercel's daily cron is the fallback.
// (Route path kept as poll-airbnb so existing cron/workflow URLs keep working.)
//
// Idempotent: mirrored events carry extendedProperties.medan_source = <channel> and
// the iCal UID in notes ("uid:<UID>"), so re-runs don't create duplicates.

import { NextRequest, NextResponse } from "next/server";
import * as nodeIcal from "node-ical";
import { HUTS, SITE, type Hut } from "@/lib/huts";
import { createBlock, listBlocks, deleteBlock, type BlockSource } from "@/lib/calendar";

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

type Channel = {
  source: Extract<BlockSource, "airbnb" | "stayeasy">;
  urlEnv: (h: Hut) => string;
  // How far ahead we trust the feed. Airbnb only exports ~4 months and silently drops
  // later bookings (so we must not treat "missing" as "cancelled" beyond that).
  // StayEasy exports everything it has.
  horizonMonths: number;
  // Drop feed events that are not real bookings, or that are our own blocks echoed back.
  keep: (summary: string) => boolean;
};

const OWN_MARKER = SITE.brandName.toLowerCase(); // "villa cottages" — our own feed's events

const CHANNELS: Channel[] = [
  {
    source: "airbnb",
    urlEnv: (h) => h.airbnbIcalUrlEnv,
    horizonMonths: 4,
    // "Not available" / "Airbnb (Not available)" are availability-window blocks, not bookings.
    keep: (s) => s !== "" && !s.includes("not available"),
  },
  {
    source: "stayeasy",
    urlEnv: (h) => h.stayeasyIcalUrlEnv,
    horizonMonths: 18,
    keep: (s) => !s.includes(OWN_MARKER),
  },
];

type HutReport = {
  added: number; removed: number; skipped: number; error?: string;
  addedEvents?: { start: string; end: string; summary: string; uid: string }[];
  removedEvents?: { start: string; end: string; guestName?: string; uid: string }[];
};

export async function runPoll() {
  const report: Record<string, HutReport> = {};

  for (const hut of HUTS) {
    const r: HutReport = { added: 0, removed: 0, skipped: 0, addedEvents: [], removedEvents: [] };
    const errors: string[] = [];
    let configured = 0;

    for (const ch of CHANNELS) {
      const url = process.env[ch.urlEnv(hut)];
      if (!url) continue;
      configured++;
      try {
        await syncChannel(hut, ch, url, r);
      } catch (e: unknown) {
        errors.push(`${ch.source}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    if (configured === 0) r.error = "no iCal url configured";
    else if (errors.length) r.error = errors.join("; ");
    report[hut.id] = r;
  }

  return { ok: true, ranAt: new Date().toISOString(), report };
}

async function syncChannel(hut: Hut, ch: Channel, url: string, r: HutReport) {
  const events = await nodeIcal.async.fromURL(url);
  const incoming = Object.values(events)
    .filter((e): e is nodeIcal.VEvent => (e as { type?: string }).type === "VEVENT")
    .filter((e) => ch.keep(String((e as { summary?: string }).summary ?? "").trim().toLowerCase()))
    .map((e) => ({
      uid: String(e.uid),
      start: toIso(e.start as Date),
      end: toIso(e.end as Date),
      summary: String(e.summary ?? ""),
    }));

  const fromDate = new Date(); fromDate.setDate(fromDate.getDate() - 30);
  const from = fromDate.toISOString().slice(0, 10);
  const toDate = new Date(); toDate.setMonth(toDate.getMonth() + ch.horizonMonths);
  const to = toDate.toISOString().slice(0, 10);

  const all = await listBlocks(hut.id, from, to);
  const existing = all.filter((b) => b.source === ch.source);
  // Ranges already held by any *other* source. A channel that echoes back a block we
  // fed it (e.g. StayEasy re-exporting an Airbnb-imported date) must not create a
  // duplicate that would then outlive the original after a cancellation.
  const otherRanges = new Set(all.filter((b) => b.source !== ch.source).map((b) => `${b.start}|${b.end}`));

  const existingByNote = new Map(existing.map((b) => [b.notes ?? "", b]));
  const incomingByUid = new Map(incoming.map((i) => [i.uid, i]));

  // Add new
  for (const inc of incoming) {
    if (existingByNote.has(`uid:${inc.uid}`)) continue;
    if (inc.start >= to) continue;
    if (otherRanges.has(`${inc.start}|${inc.end}`)) { r.skipped++; continue; }
    await createBlock(hut.id, {
      start: inc.start,
      end: inc.end,
      source: ch.source,
      notes: `uid:${inc.uid}`,
      guestName: inc.summary,
    });
    r.addedEvents!.push({ start: inc.start, end: inc.end, summary: `${inc.summary} (${ch.source})`, uid: inc.uid });
    r.added++;
  }

  // Remove cancelled
  for (const ex of existing) {
    const uid = (ex.notes ?? "").replace(/^uid:/, "");
    if (!uid || !incomingByUid.has(uid)) {
      if (ex.eventId) {
        await deleteBlock(hut.id, ex.eventId);
        r.removedEvents!.push({ start: ex.start, end: ex.end, guestName: ex.guestName, uid });
        r.removed++;
      }
    }
  }
}

function toIso(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}
