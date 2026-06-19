// Releases stale checkout holds (HOLD events whose timeout has passed without the Cashfree webhook confirming).

import { NextRequest, NextResponse } from "next/server";
import { HUTS, BOOKING_RULES } from "@/lib/huts";
import { listBlocks, deleteBlock } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await sweep());
}
export async function GET(req: NextRequest) { return POST(req); }

async function sweep() {
  const now = Date.now();
  const expiry = BOOKING_RULES.checkoutHoldMinutes * 60_000;
  const released: { hut: string; eventId: string }[] = [];

  for (const hut of HUTS) {
    const from = new Date().toISOString().slice(0, 10);
    const toDate = new Date(); toDate.setMonth(toDate.getMonth() + 18);
    const to = toDate.toISOString().slice(0, 10);
    const blocks = await listBlocks(hut.id, from, to);
    for (const b of blocks) {
      if (b.source !== "hold") continue;
      const m = b.notes?.match(/Held until (.+)/);
      if (!m) continue;
      const held = Date.parse(m[1]);
      if (Number.isNaN(held)) continue;
      if (now - held > 0 + expiry) {
        if (b.eventId) {
          await deleteBlock(hut.id, b.eventId);
          released.push({ hut: hut.id, eventId: b.eventId });
        }
      }
    }
  }
  return { ok: true, released };
}
