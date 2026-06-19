// Calendar abstraction. Backed by Google Calendar in production; in-memory stub when env vars are missing.
// Same interface either way — callers don't care which backend is live.

import { BOOKING_RULES, getHut, type Hut } from "./huts";
import { getPrice } from "./price-store";
import { calendarIdForHut, googleCalendar, hasGoogle } from "./google";

export type BlockSource = "site" | "manual" | "airbnb" | "hold";

export type Block = {
  start: string; // ISO date (YYYY-MM-DD), inclusive
  end: string;   // ISO date, exclusive (matches Google's all-day event semantics)
  source: BlockSource;
  eventId?: string;
  guestName?: string;
  guestEmail?: string;
  paymentId?: string;
  notes?: string;
  calTitle?: string; // raw Google Calendar event title
};

// ─── In-memory dev fallback ───
const memoryBlocks = new Map<string, Block[]>();

// ─── Public API ───
export async function listBlocks(hutId: string, from: string, to: string): Promise<Block[]> {
  if (!hasGoogle()) {
    return (memoryBlocks.get(hutId) ?? []).filter((b) => b.end > from && b.start < to);
  }
  const cal = googleCalendar();
  const r = await cal.events.list({
    calendarId: calendarIdForHut(hutId),
    timeMin: `${from}T00:00:00Z`,
    timeMax: `${to}T23:59:59Z`,
    singleEvents: true,
    showDeleted: false,
    maxResults: 250,
    orderBy: "startTime",
  });
  return (r.data.items ?? []).map(gEventToBlock);
}

export async function createBlock(hutId: string, block: Block): Promise<Block> {
  if (!hasGoogle()) {
    const list = memoryBlocks.get(hutId) ?? [];
    const withId = { ...block, eventId: block.eventId ?? `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
    memoryBlocks.set(hutId, [...list, withId]);
    return withId;
  }
  const hut = getHut(hutId);
  if (!hut) throw new Error(`Unknown hut ${hutId}`);
  const cal = googleCalendar();
  const r = await cal.events.insert({
    calendarId: calendarIdForHut(hutId),
    requestBody: blockToGEvent(block, hut),
  });
  return gEventToBlock(r.data);
}

export async function updateBlock(hutId: string, eventId: string, patch: Partial<Block>): Promise<Block> {
  if (!hasGoogle()) {
    const list = memoryBlocks.get(hutId) ?? [];
    const idx = list.findIndex((b) => b.eventId === eventId);
    if (idx === -1) throw new Error("not found");
    const updated = { ...list[idx], ...patch, eventId };
    list[idx] = updated;
    memoryBlocks.set(hutId, list);
    return updated;
  }
  const hut = getHut(hutId);
  if (!hut) throw new Error(`Unknown hut ${hutId}`);
  const cal = googleCalendar();
  const merged: Block = { start: patch.start ?? "", end: patch.end ?? "", source: patch.source ?? "site", ...patch };
  const r = await cal.events.patch({
    calendarId: calendarIdForHut(hutId),
    eventId,
    requestBody: blockToGEvent(merged, hut),
  });
  return gEventToBlock(r.data);
}

export async function deleteBlock(hutId: string, eventId: string): Promise<void> {
  if (!hasGoogle()) {
    const list = memoryBlocks.get(hutId) ?? [];
    memoryBlocks.set(hutId, list.filter((b) => b.eventId !== eventId));
    return;
  }
  const cal = googleCalendar();
  await cal.events.delete({ calendarId: calendarIdForHut(hutId), eventId });
}

export function isRangeAvailable(blocks: Block[], from: string, to: string): boolean {
  return !blocks.some((b) => b.end > from && b.start < to);
}

export function priceBreakdown(hutId: string, nights: number) {
  const hut = getHut(hutId);
  if (!hut) throw new Error(`Unknown hut: ${hutId}`);
  const nightlyInr = getPrice(hutId);
  const subtotalInr = nightlyInr * nights;
  const cleaningFeeInr = BOOKING_RULES.cleaningFeeInr;
  const preTax = subtotalInr + cleaningFeeInr;
  const taxInr = Math.round((preTax * BOOKING_RULES.taxRatePercent) / 100);
  const totalInr = preTax + taxInr;
  return { nightlyInr, subtotalInr, cleaningFeeInr, taxInr, totalInr };
}

// ─── Mapping ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GEvent = any;

function blockToGEvent(b: Block, hut: Hut): GEvent {
  const prefix = `[${hut.calendarPrefix}]`;
  const summary = (() => {
    switch (b.source) {
      case "site":   return `${prefix} Booked · ${b.guestName ?? "Guest"}`;
      case "hold":   return `${prefix} HOLD · ${b.guestName ?? "Pending checkout"}`;
      case "manual": return b.notes ? `${prefix} BLOCKED · ${b.notes}` : `${prefix} BLOCKED`;
      case "airbnb": return `${prefix} Airbnb`;
    }
  })();
  const description = JSON.stringify({
    source: b.source,
    guestName: b.guestName ?? null,
    guestEmail: b.guestEmail ?? null,
    paymentId: b.paymentId ?? null,
    notes: b.notes ?? null,
  });
  return {
    summary,
    description,
    start: { date: b.start },
    end: { date: b.end },
    extendedProperties: {
      private: {
        medan_source: b.source,
        medan_payment: b.paymentId ?? "",
      },
    },
  };
}

function gEventToBlock(e: GEvent): Block {
  let parsed: Partial<Block> = {};
  try { if (e.description) parsed = JSON.parse(e.description); } catch { /* ignore non-JSON descriptions */ }
  const source = (e.extendedProperties?.private?.medan_source as BlockSource | undefined)
              ?? (parsed.source as BlockSource | undefined)
              ?? inferSource(e.summary ?? "");

  // Extract notes from summary as fallback (e.g. "[VC] BLOCKED · Owner stay" → "Owner stay")
  const summaryNotes = (() => {
    const s = e.summary ?? "";
    const idx = s.indexOf(" · ");
    return idx !== -1 ? s.slice(idx + 3).trim() : undefined;
  })();

  return {
    eventId: e.id ?? undefined,
    start: e.start?.date ?? (e.start?.dateTime ?? "").slice(0, 10),
    end:   e.end?.date   ?? (e.end?.dateTime ?? "").slice(0, 10),
    source,
    guestName: parsed.guestName ?? undefined,
    guestEmail: parsed.guestEmail ?? undefined,
    paymentId: parsed.paymentId ?? e.extendedProperties?.private?.medan_payment ?? undefined,
    notes: parsed.notes ?? summaryNotes ?? undefined,
    calTitle: e.summary ?? undefined,
  };
}

function inferSource(summary: string): BlockSource {
  const s = summary.toLowerCase();
  if (s.includes("airbnb")) return "airbnb";
  if (s.startsWith("hold")) return "hold";
  if (s.startsWith("booked")) return "site";
  return "manual";
}
