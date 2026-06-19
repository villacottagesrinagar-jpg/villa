import { NextRequest, NextResponse } from "next/server";
import { createBlock, listBlocks, isRangeAvailable, priceBreakdown } from "@/lib/calendar";
import { BOOKING_RULES, getHut } from "@/lib/huts";
import { createOrder, hasCashfree } from "@/lib/cashfree";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hutId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone } = body ?? {};

  const hut = getHut(hutId);
  if (!hut) return NextResponse.json({ error: "unknown hut" }, { status: 400 });
  if (!checkIn || !checkOut || checkIn >= checkOut) return NextResponse.json({ error: "invalid dates" }, { status: 400 });

  const nights = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000);
  if (nights < BOOKING_RULES.minNights) return NextResponse.json({ error: `min ${BOOKING_RULES.minNights} nights` }, { status: 400 });

  const blocks = await listBlocks(hutId, checkIn, checkOut);
  if (!isRangeAvailable(blocks, checkIn, checkOut)) {
    return NextResponse.json({ error: "dates no longer available" }, { status: 409 });
  }

  const { totalInr } = priceBreakdown(hutId, nights);

  // Place a HOLD on the calendar — confirmed by the Cashfree webhook, swept if it expires.
  const held = await createBlock(hutId, {
    start: checkIn,
    end: checkOut,
    source: "hold",
    guestName: guestName ?? "Pending checkout",
    guestEmail: guestEmail,
    notes: `Held until ${new Date(Date.now() + BOOKING_RULES.checkoutHoldMinutes * 60_000).toISOString()}`,
  });

  if (!hasCashfree()) {
    // Dev path: stub checkout page so the UI flow is testable without keys.
    const checkoutUrl = `/booking/pending?hut=${hutId}&hold=${held.eventId}&total=${totalInr}&nights=${nights}&guests=${guests ?? 2}`;
    return NextResponse.json({ checkoutUrl, holdId: held.eventId, totalInr, nights, stub: true });
  }

  // Production path: real Cashfree order
  const origin = req.nextUrl.origin;
  const orderId = `medan_${hutId}_${Date.now()}`;
  try {
    const order = await createOrder({
      orderId,
      amountInr: totalInr,
      customerName: guestName ?? "Guest",
      customerEmail: guestEmail ?? "noreply@villacottages.in",
      customerPhone: guestPhone ?? "9999999999",
      returnUrl: `${origin}/booking/return`,
      notifyUrl: `${origin}/api/webhook/cashfree`,
      noteHutId: hutId,
      noteHoldId: held.eventId ?? "",
    });
    return NextResponse.json({ checkoutUrl: order.hostedCheckoutUrl, holdId: held.eventId, totalInr, nights });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "checkout failed" }, { status: 500 });
  }
}
