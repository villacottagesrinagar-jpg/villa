import { NextRequest, NextResponse } from "next/server";
import { listBlocks, isRangeAvailable, priceBreakdown } from "@/lib/calendar";
import { BOOKING_RULES, getHut } from "@/lib/huts";

async function findNextAvailable(hutId: string, fromDate: string, nights: number): Promise<{ from: string; to: string } | null> {
  const scan = new Date(fromDate);
  scan.setDate(scan.getDate() + 1); // start scanning from tomorrow
  const limit = new Date(fromDate);
  limit.setDate(limit.getDate() + 120);
  const limitStr = limit.toISOString().slice(0, 10);

  const allBlocks = await listBlocks(hutId, scan.toISOString().slice(0, 10), limitStr);

  for (let i = 0; i < 120; i++) {
    const candidateFrom = scan.toISOString().slice(0, 10);
    const candidateTo = new Date(scan);
    candidateTo.setDate(candidateTo.getDate() + nights);
    const candidateToStr = candidateTo.toISOString().slice(0, 10);
    if (isRangeAvailable(allBlocks, candidateFrom, candidateToStr)) {
      return { from: candidateFrom, to: candidateToStr };
    }
    scan.setDate(scan.getDate() + 1);
  }
  return null;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const hutId = sp.get("hut") ?? "";
  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "";

  const hut = getHut(hutId);
  if (!hut) return NextResponse.json({ error: "unknown hut" }, { status: 400 });
  if (!from || !to || from >= to) return NextResponse.json({ error: "invalid date range" }, { status: 400 });

  const nights = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);
  if (nights < BOOKING_RULES.minNights) {
    return NextResponse.json({ available: false, nights, blocked: [], reason: `minimum ${BOOKING_RULES.minNights} nights` });
  }

  const blocks = await listBlocks(hutId, from, to);
  const available = isRangeAvailable(blocks, from, to);
  if (!available) {
    const nextAvailable = await findNextAvailable(hutId, from, nights);
    return NextResponse.json({
      available: false,
      nights,
      blocked: blocks.map(({ start, end, source }) => ({ start, end, source })),
      nextAvailable,
    });
  }

  const breakdown = priceBreakdown(hutId, nights);
  return NextResponse.json({
    available: true,
    nights,
    blocked: [],
    totalInr: breakdown.totalInr,
    breakdown: {
      nightlyInr: breakdown.nightlyInr,
      subtotalInr: breakdown.subtotalInr,
      cleaningFeeInr: breakdown.cleaningFeeInr,
      taxInr: breakdown.taxInr,
    },
  });
}
