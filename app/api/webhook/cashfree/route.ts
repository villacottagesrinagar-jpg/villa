import { NextRequest, NextResponse } from "next/server";
import { fetchOrder, verifyWebhook } from "@/lib/cashfree";
import { updateBlock, deleteBlock } from "@/lib/calendar";
import { sendBookingConfirmation } from "@/lib/email";
import { getHut } from "@/lib/huts";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-webhook-signature") ?? "";
  const ts = req.headers.get("x-webhook-timestamp") ?? "";

  if (!verifyWebhook(rawBody, sig, ts)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const event: string = payload.type ?? payload.event ?? "";
  const data = payload.data ?? {};
  const order = data.order ?? {};
  const orderId: string = order.order_id;
  const tags = order.order_tags ?? {};
  const hutId: string = tags.hut;
  const holdId: string = tags.hold;

  if (!hutId || !holdId) {
    return NextResponse.json({ error: "missing hut/hold tags" }, { status: 400 });
  }

  if (event === "PAYMENT_SUCCESS_WEBHOOK" || event.includes("SUCCESS")) {
    // Confirm: flip hold → confirmed booking
    const o = await fetchOrder(orderId);
    if (o.status !== "PAID") {
      return NextResponse.json({ ok: false, reason: "order not paid yet" }, { status: 200 });
    }
    const customer = data.customer_details ?? {};
    await updateBlock(hutId, holdId, {
      source: "site",
      guestName: customer.customer_name,
      guestEmail: customer.customer_email,
      paymentId: data.payment?.cf_payment_id?.toString() ?? orderId,
    });

    // Email confirmations — best-effort
    try {
      const hut = getHut(hutId);
      if (hut && customer.customer_email) {
        await sendBookingConfirmation({
          to: customer.customer_email,
          guestName: customer.customer_name,
          hutName: hut.name,
          paidInr: o.paidAmount,
          orderId,
        });
      }
    } catch (e) {
      console.error("email failed", e);
    }

    return NextResponse.json({ ok: true });
  }

  if (event === "PAYMENT_FAILED_WEBHOOK" || event.includes("FAILED")) {
    // Release the hold
    try { await deleteBlock(hutId, holdId); } catch { /* may already be gone */ }
    return NextResponse.json({ ok: true, released: true });
  }

  return NextResponse.json({ ok: true, ignored: event });
}
