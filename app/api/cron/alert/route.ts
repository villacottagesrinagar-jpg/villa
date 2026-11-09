// Sends an ops email (via Resend) when the calendar-sync workflow changes state
// (first failure / recovery). Called by .github/workflows/poll-airbnb.yml with
// Authorization: Bearer ${CRON_SECRET}; the workflow decides *when* to call, so a long
// outage sends one email, not one every 15 minutes.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { SITE } from "@/lib/huts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { subject, text } = (await req.json().catch(() => ({}))) as { subject?: string; text?: string };
  if (!subject || !text) return NextResponse.json({ error: "subject and text required" }, { status: 400 });

  const to = process.env.EMAIL_VILLA || SITE.contactEmail;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[alert stub]", subject, text);
    return NextResponse.json({ ok: true, stub: true });
  }

  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
  await new Resend(key).emails.send({
    from: `Villa Cottages Ops <bookings@villacottages.in>`,
    to,
    subject: `[Calendar sync] ${subject}`.slice(0, 200),
    html: `<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;padding:24px">
      <h2 style="margin:0 0 12px">${esc(subject)}</h2>
      <pre style="white-space:pre-wrap;font-size:13px;background:#f6f6f6;padding:12px;border-radius:6px">${esc(text).slice(0, 4000)}</pre>
      <p style="color:#888;font-size:12px">Sent by the Villa Cottages calendar-sync monitor.</p></div>`,
  });
  return NextResponse.json({ ok: true });
}
