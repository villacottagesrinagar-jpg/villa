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
  // StayEasy re-exports every date it has blocked — including the ones it imported from OUR
  // feed — as generic "Blocked" events, merging adjacent dates into one range. Those are
  // echoes, not new information: for such events import only the nights no other source
  // already holds. Real bookings (any other summary) are always imported in full so a true
  // double booking stays visible.
  dedupeEchoSummary?: string;
  // Key mirrored blocks by UID + date range (StayEasy reuses a UID while the range changes).
  rangeKeyed?: boolean;
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
    dedupeEchoSummary: "blocked",
    rangeKeyed: true,
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

  // Nights already held by any *other* source.
  const covered = new Set<string>();
  for (const b of all.filter((b) => b.source !== ch.source)) {
    for (let d = b.start; d < b.end; d = addDays(d, 1)) covered.add(d);
  }

  // Turn feed events into the blocks we want to exist (key → block).
  type Piece = { key: string; start: string; end: string; summary: string };
  const wanted: Piece[] = [];
  for (const inc of incoming) {
    const isEcho = ch.dedupeEchoSummary && inc.summary.trim().toLowerCase() === ch.dedupeEchoSummary;
    const ranges: { start: string; end: string }[] = [];
    if (isEcho) {
      let runStart: string | null = null;
      for (let d = inc.start; d < inc.end; d = addDays(d, 1)) {
        if (!covered.has(d)) { runStart ??= d; }
        else if (runStart) { ranges.push({ start: runStart, end: d }); runStart = null; }
      }
      if (runStart) ranges.push({ start: runStart, end: inc.end });
      if (ranges.length === 0) { r.skipped++; continue; }
    } else {
      ranges.push({ start: inc.start, end: inc.end });
    }
    for (const rg of ranges) {
      wanted.push({
        key: ch.rangeKeyed ? `${inc.uid}@${rg.start}_${rg.end}` : inc.uid,
        start: rg.start, end: rg.end, summary: inc.summary,
      });
    }
  }

  const existingByNote = new Map(existing.map((b) => [b.notes ?? "", b]));
  const wantedByKey = new Map(wanted.map((w) => [w.key, w]));

  // Add new
  for (const w of wanted) {
    if (existingByNote.has(`uid:${w.key}`)) continue;
    if (w.start >= to) continue;
    await createBlock(hut.id, {
      start: w.start,
      end: w.end,
      source: ch.source,
      notes: `uid:${w.key}`,
      guestName: w.summary,
    });
    r.addedEvents!.push({ start: w.start, end: w.end, summary: `${w.summary} (${ch.source})`, uid: w.key });
    r.added++;
  }

  // Remove cancelled / superseded
  for (const ex of existing) {
    const key = (ex.notes ?? "").replace(/^uid:/, "");
    if (!key || !wantedByKey.has(key)) {
      if (ex.eventId) {
        await deleteBlock(hut.id, ex.eventId);
        r.removedEvents!.push({ start: ex.start, end: ex.end, guestName: ex.guestName, uid: key });
        r.removed++;
      }
    }
  }
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function toIso(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}
