import { Resend } from "resend";
import { SITE } from "./huts";

const fromAddress = `Villa Cottages <bookings@villacottages.in>`;

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendBookingConfirmation(args: {
  to: string;
  guestName: string;
  hutName: string;
  paidInr: number;
  orderId: string;
}) {
  const resend = client();
  if (!resend) {
    console.log("[email stub] booking confirmation →", args);
    return;
  }
  const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(args.paidInr);

  // Guest email (CC the host so they always get a copy)
  await resend.emails.send({
    from: fromAddress,
    to: args.to,
    cc: "villa.cottages.srinagar@gmail.com",
    subject: `Booking confirmed · ${args.hutName} · ${SITE.brandName}`,
    html: guestHtml(args, inr),
  });

  // Host notification
  if (SITE.hostNotificationEmail) {
    await resend.emails.send({
      from: fromAddress,
      to: SITE.hostNotificationEmail,
      subject: `New booking · ${args.hutName} · ${args.guestName}`,
      html: hostHtml(args, inr),
    });
  }
}

function guestHtml(a: { guestName: string; hutName: string; orderId: string }, inr: string) {
  return `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#1a1a1a">
      <h1 style="font-family:Georgia,serif;font-weight:300;font-size:28px;margin:0 0 8px">You're booked.</h1>
      <p style="color:#666;margin:0 0 24px">${a.hutName} · ${SITE.location}</p>
      <p>Hi ${a.guestName},</p>
      <p>Thanks for booking with ${SITE.brandName}. Your stay is confirmed and your dates are locked in our calendar.</p>
      <table style="width:100%;border-top:1px solid #eee;margin:24px 0;padding-top:16px;font-size:14px">
        <tr><td style="padding:6px 0;color:#666">Stay</td><td align="right">${a.hutName}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Paid</td><td align="right">${inr}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Order</td><td align="right" style="font-family:monospace;font-size:12px">${a.orderId}</td></tr>
      </table>
      <p>We'll be in touch a few days before with directions and check-in details. Reply to this email anytime.</p>
      <p style="color:#999;font-size:12px;margin-top:32px">${SITE.brandName} · ${SITE.location}</p>
    </div>
  `;
}

function hostHtml(a: { guestName: string; hutName: string; orderId: string }, inr: string) {
  return `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h2 style="margin:0 0 16px">New booking · ${a.hutName}</h2>
      <p>${a.guestName} · ${inr} · Order ${a.orderId}</p>
      <p style="color:#666;font-size:13px">Calendar event is already confirmed. Airbnb will pick this up in 2-4 hours via iCal sync.</p>
    </div>
  `;
}
