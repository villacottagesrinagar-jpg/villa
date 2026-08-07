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

  // Send welcome email (best-effort)
  try {
    await resend.emails.send({
      from: "Villa Cottages <bookings@villacottages.in>",
      to: email,
      subject: "You're on the list — Villa Cottages",
      react: WelcomeEmail({ firstName }),
    });
  } catch (err) {
    console.error("[subscribe] welcome email failed", err);
  }

  return NextResponse.json({ ok: true });
}
