import Link from "next/link";
import { fetchOrder, hasCashfree } from "@/lib/cashfree";

export default async function ReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const sp = await searchParams;
  const orderId = sp.order_id;
  let status = "UNKNOWN";
  if (orderId && hasCashfree()) {
    try {
      const o = await fetchOrder(orderId);
      status = o.status as string;
    } catch { /* show pending state */ }
  }

  const paid = status === "PAID";
  return (
    <div className="min-h-[100svh] flex items-center justify-center px-6 py-20">
      <div className="max-w-xl text-center">
        <div className="eyebrow mb-4">{paid ? "Confirmed" : "Processing"}</div>
        <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
          {paid ? "Your stay is booked." : "Hold on a moment…"}
        </h1>
        <p className="text-sm text-cream/55 leading-relaxed mb-10">
          {paid
            ? "You'll receive an email confirmation shortly. The dates are blocked on our calendar and synced to Airbnb."
            : "Cashfree is confirming the payment. You'll get a confirmation email once it's through. You can safely close this tab."}
        </p>
        <p className="text-[0.65rem] text-cream/35 mb-10">Order: {orderId}</p>
        <Link href="/" className="text-[0.65rem] tracking-[0.22em] uppercase text-[var(--amber)] hover:underline">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
