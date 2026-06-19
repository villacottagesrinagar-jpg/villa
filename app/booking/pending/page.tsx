import Link from "next/link";
import { getHut } from "@/lib/huts";

export default async function PendingPage({
  searchParams,
}: {
  searchParams: Promise<{ hut?: string; total?: string; nights?: string; guests?: string; hold?: string }>;
}) {
  const sp = await searchParams;
  const hut = getHut(sp.hut ?? "");
  return (
    <div className="min-h-[100svh] flex items-center justify-center px-6 py-20">
      <div className="max-w-xl text-center">
        <div className="eyebrow mb-4">Checkout (stub)</div>
        <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
          Booking on hold for 15 minutes.
        </h1>
        <p className="text-sm text-cream/55 leading-relaxed mb-2">
          {hut?.name ?? "Stay"} · {sp.nights} nights · {sp.guests} guests
        </p>
        <p className="text-sm text-cream/55 leading-relaxed mb-10">
          Total: <span className="text-cream">₹{Number(sp.total ?? 0).toLocaleString("en-IN")}</span>
        </p>

        <div className="p-6 border border-[var(--amber)]/25 text-left text-[0.75rem] text-cream/60 leading-relaxed mb-8">
          <strong className="text-cream block mb-2 text-sm">Cashfree checkout will load here</strong>
          Once you wire up Cashfree (task #5), this page redirects directly to their hosted checkout.
          On payment success, the webhook confirms the calendar event and emails the guest.
          <br /><br />
          Hold ID: <code className="text-cream/40">{sp.hold}</code>
        </div>

        <Link href="/" className="text-[0.65rem] tracking-[0.22em] uppercase text-[var(--amber)] hover:underline">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
