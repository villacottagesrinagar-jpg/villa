import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HUTS } from "@/lib/huts";
import { listBlocks } from "@/lib/calendar";
import { getAllPrices } from "@/lib/price-store";
import { AdminCalendar } from "./AdminCalendar";
import { PriceEditor } from "./PriceEditor";
import { AdminShell } from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const from = new Date().toISOString().slice(0, 10);
  const toDate = new Date(); toDate.setMonth(toDate.getMonth() + 6);
  const to = toDate.toISOString().slice(0, 10);

  const prices = getAllPrices();

  const hutsWithBlocks = await Promise.all(
    HUTS.map(async (h) => ({ hut: h, blocks: await listBlocks(h.id, from, to) }))
  );

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <AdminShell email={session.user?.email ?? ""} signOutAction={handleSignOut}>
      <PriceEditor initialPrices={prices} />

      <div className="mb-10 p-5 border border-[var(--amber)]/15 bg-[var(--amber)]/5 text-[0.72rem] text-cream/60 leading-relaxed admin-info-box">
        <strong className="text-cream block mb-1 admin-text">How this works</strong>
        Green dates are bookable. Amber = checkout hold (auto-clears in 15min). Red = booked or blocked.
        Click any date to manually block it. Bookings made on Airbnb appear here within 10 minutes;
        bookings made here appear on Airbnb within 2-4 hours (Airbnb's iCal refresh schedule).
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {hutsWithBlocks.map(({ hut, blocks }) => (
          <div key={hut.id}>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-serif text-xl admin-text">{hut.name}</h2>
              <span className="eyebrow text-[0.5rem]">{hut.tier}</span>
            </div>
            <AdminCalendar hutId={hut.id} initialBlocks={blocks} />
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
