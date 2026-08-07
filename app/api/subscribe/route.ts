import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import WelcomeEmail from "@/emails/WelcomeEmail";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, firstName } = body ?? {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "valid email required" }, { status: 400 });
  }

  const resend = client();
  if (!resend) {
    console.log("[subscribe stub] would add:", email);
    return NextResponse.json({ ok: true });
  }

  try {
    await resend.contacts.create({
      email,
      firstName: firstName || undefined,
      unsubscribed: false,
    });
  } catch (err: unknown) {
    const e = err as { statusCode?: number };
    // 409 = contact already exists — treat as success
    if (e?.statusCode !== 409) {
      console.error("[subscribe] contacts.create failed", err);
      return NextResponse.json({ error: "could not subscribe" }, { status: 500 });
    }
  }

  // Send welcome email to subscriber and notify villa (both best-effort)
  await Promise.allSettled([
    resend.emails.send({
      from: "Villa Cottages <bookings@villacottages.in>",
      to: email,
      subject: "You're on the list — Villa Cottages",
      react: WelcomeEmail({ firstName }),
    }),
    process.env.EMAIL_VILLA
      ? resend.emails.send({
          from: "Villa Cottages <bookings@villacottages.in>",
          to: process.env.EMAIL_VILLA,
          subject: `New subscriber · ${email}`,
          html: `<p style="font-family:sans-serif"><strong>${firstName || "Someone"}</strong> just subscribed to the Villa Cottages email list.<br/><br/>Email: ${email}</p>`,
        })
      : Promise.resolve(),
  ]);

  return NextResponse.json({ ok: true });
}
