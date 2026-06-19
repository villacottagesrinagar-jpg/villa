// Cashfree Payment Gateway — Orders API v2025-01-01
// Docs: https://docs.cashfree.com/reference/pg-new-apis-endpoint
// Two surfaces we use:
//   1) createOrder() — server-to-server, returns a hosted payment_session_id we redirect the user to
//   2) verifyWebhook() — Cashfree calls back on payment success/failure; we verify HMAC

import crypto from "node:crypto";

const baseUrl = () =>
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export type CashfreeOrder = {
  orderId: string;
  paymentSessionId: string;
  hostedCheckoutUrl: string;
};

export function hasCashfree(): boolean {
  return Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
}

export async function createOrder(args: {
  orderId: string;
  amountInr: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notifyUrl: string;
  noteHutId: string;
  noteHoldId: string;
}): Promise<CashfreeOrder> {
  const body = {
    order_id: args.orderId,
    order_amount: args.amountInr,
    order_currency: "INR",
    customer_details: {
      customer_id: hash(args.customerEmail),
      customer_name: args.customerName,
      customer_email: args.customerEmail,
      customer_phone: args.customerPhone,
    },
    order_meta: {
      return_url: `${args.returnUrl}?order_id={order_id}`,
      notify_url: args.notifyUrl,
    },
    order_tags: {
      hut: args.noteHutId,
      hold: args.noteHoldId,
    },
  };

  const r = await fetch(`${baseUrl()}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": "2025-01-01",
      "x-client-id": process.env.CASHFREE_APP_ID!,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Cashfree createOrder failed: ${r.status} ${txt}`);
  }
  const data = await r.json();
  const sessionId: string = data.payment_session_id;
  return {
    orderId: data.order_id,
    paymentSessionId: sessionId,
    // The hosted payments page accepts the session ID directly.
    hostedCheckoutUrl: hostedUrl(sessionId),
  };
}

export async function fetchOrder(orderId: string): Promise<{ status: string; paidAmount: number }> {
  const r = await fetch(`${baseUrl()}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      "x-api-version": "2025-01-01",
      "x-client-id": process.env.CASHFREE_APP_ID!,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
    },
  });
  if (!r.ok) throw new Error(`Cashfree fetchOrder failed: ${r.status}`);
  const data = await r.json();
  return { status: data.order_status, paidAmount: data.order_amount };
}

function hostedUrl(sessionId: string): string {
  const env = process.env.CASHFREE_ENV === "PROD" ? "payments" : "sandbox-payments";
  return `https://${env}.cashfree.com/checkout/post/submit?payment_session_id=${encodeURIComponent(sessionId)}`;
}

export function verifyWebhook(rawBody: string, signature: string, timestamp: string): boolean {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret) return false;
  // Cashfree v3+ signature = base64(HMAC_SHA256(timestamp + rawBody, secret))
  const expected = crypto.createHmac("sha256", secret).update(timestamp + rawBody).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function hash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 24);
}
