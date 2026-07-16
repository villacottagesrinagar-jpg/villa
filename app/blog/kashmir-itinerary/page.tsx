import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Perfect 5-Day Kashmir Itinerary (2025) — Villa Cottages",
  description: "A practical 5-day Kashmir trip itinerary covering Gulmarg, Pahalgam, Dal Lake, and the Mughal Gardens — written by a Srinagar apple orchard host.",
  alternates: { canonical: "/blog/kashmir-itinerary" },
  openGraph: {
    title: "The Perfect 5-Day Kashmir Itinerary (2025)",
    description: "A practical 5-day Kashmir trip itinerary covering Gulmarg, Pahalgam, Dal Lake, and the Mughal Gardens.",
    url: "https://www.villacottages.in/blog/kashmir-itinerary",
  },
};

export default function KashmirItinerary() {
  return (
    <main className="min-h-screen bg-[#080705] text-[#f2ead8] px-6 py-20 max-w-2xl mx-auto">
      <Link href="/blog" className="text-[0.6rem] tracking-[0.18em] uppercase text-cream/40 hover:text-cream/60 transition-colors">
        ← All guides
      </Link>

      <header className="mt-8 mb-12">
        <p className="text-[0.6rem] tracking-[0.18em] uppercase text-cream/45 mb-3">Kashmir Itinerary</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light leading-tight">
          The Perfect 5-Day Kashmir Itinerary
        </h1>
        <p className="mt-4 text-sm text-cream/50">Using Srinagar as your base · Updated 2025</p>
      </header>

      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-cream/80 leading-relaxed">

        <p>
          Most Kashmir trip itineraries try to pack too much in. They move you between Srinagar, Gulmarg, Pahalgam, and Sonamarg on consecutive nights — four different hotels, four check-ins, and none of the unhurried feeling that actually makes Kashmir worth visiting.
        </p>
        <p>
          This itinerary uses Srinagar as a fixed base. You stay in one place — ideally somewhere quiet, like a private orchard cottage outside the city — and take day trips to each destination. You arrive back each evening to familiar surroundings, and the journey itself becomes part of the experience rather than a logistical obstacle.
        </p>

        <h2 className="font-serif text-2xl font-light text-cream pt-4">Day 1 — Arrival & Srinagar</h2>
        <p>
          Arrive at Sheikh ul-Alam International Airport (SXR). If you&apos;re staying at Villa Cottages, the transfer is about 50 minutes. Spend the first afternoon settling in and doing nothing particularly ambitious — the jet lag from most Indian cities is mild, but the orchard needs time to sink in.
        </p>
        <p>
          In the early evening, drive into old Srinagar for a walk through the bazaars near Lal Chowk and along the Jhelum river. The wooden mosques and crumbling merchant houses in this part of the city are unlike anything else in India. Dinner at a local wazwan restaurant — Ahdoos on Residency Road is reliable and has been serving Kashmiri food since 1950.
        </p>

        <h2 className="font-serif text-2xl font-light text-cream pt-4">Day 2 — Dal Lake & Mughal Gardens</h2>
        <p>
          An early morning shikara ride on Dal Lake is one of the few genuinely unmissable experiences in Kashmir — go before 8am when the lake is still and the vendors are just starting their floating market runs. The ride from Nehru Park takes 45 minutes to an hour.
        </p>
        <p>
          After the lake, drive to Nishat Bagh and Shalimar Bagh, the two principal Mughal Gardens on the eastern shore. Both are about 30–40 minutes from the city. Nishat has more elevation and better views across the lake toward Hari Parbat fort. Shalimar is more formal in its layout and tends to be less crowded mid-week.
        </p>

        <h2 className="font-serif text-2xl font-light text-cream pt-4">Day 3 — Gulmarg</h2>
        <p>
          Gulmarg is 1.5 hours from Srinagar by road. In summer (May–September), the meadows are green and the Gondola cable car runs to Apharwat Peak at 4,200m — the views of Nanga Parbat on a clear morning are worth the ride. In winter, Gulmarg becomes one of Asia&apos;s highest ski resorts.
        </p>
        <p>
          The town itself is small and walkable. Avoid the main market area during peak season — it gets congested. The meadow east of the Gondola base is quiet and the mountain backdrop is better from there anyway. Return to Srinagar by late afternoon; the drive back through the pine forests is pleasant at that hour.
        </p>

        <h2 className="font-serif text-2xl font-light text-cream pt-4">Day 4 — Pahalgam</h2>
        <p>
          Pahalgam is 2.5 hours southeast of Srinagar along the Lidder River. The town is a base for the annual Amarnath Yatra pilgrimage, so it can be very busy in July and August — if you&apos;re visiting during that period, go early and return before 3pm.
        </p>
        <p>
          Aru Valley, about 12km beyond Pahalgam, is quieter and more scenic — a flat alpine meadow ringed by forest and snow peaks. Betaab Valley (named after a 1983 Bollywood film shot there) is popular but tends to be crowded. Chandanwari, the pilgrimage starting point, is worth visiting for the scale of the river gorge alone.
        </p>

        <h2 className="font-serif text-2xl font-light text-cream pt-4">Day 5 — Slow morning, departure</h2>
        <p>
          Leave the last morning entirely unplanned. Walk through the orchard if you&apos;re staying somewhere with one. The apple trees in Srinagar orchards produce fruit from August through October — if your trip falls in that window, you&apos;ll likely eat apples that were still on the branch that morning.
        </p>
        <p>
          The airport is 50 minutes from most Srinagar accommodation. Last departures typically leave in the evening, so there&apos;s time for one more wazwan lunch before heading out.
        </p>

        <h2 className="font-serif text-2xl font-light text-cream pt-4">Practical notes</h2>
        <ul className="list-disc list-inside space-y-2 text-cream/70">
          <li>Best months: May, June, September. July–August is peak season and prices are higher.</li>
          <li>Hiring a local driver for the full trip (₹3,000–4,500/day) is more comfortable than tourist taxis for day trips.</li>
          <li>Mobile data is available; most Indian SIMs work in the valley.</li>
          <li>Altitude at Gulmarg (2,600m) and Pahalgam (2,130m) is noticeable if you&apos;re coming from sea level — take it slowly on arrival.</li>
        </ul>

      </div>

      <div className="mt-16 pt-10 border-t border-[var(--amber)]/15 text-center">
        <p className="font-serif text-2xl font-light mb-4">Stay in the orchard while you explore</p>
        <p className="text-sm text-cream/55 mb-6">Villa Cottages — two private A-frame cottages on a Srinagar apple orchard. Rated 4.9 on Google.</p>
        <Link
          href="/#book"
          className="inline-block px-8 py-3 border border-[var(--amber)]/50 text-[var(--amber)] text-[0.65rem] tracking-[0.18em] uppercase hover:bg-[var(--amber)]/10 transition-colors"
        >
          Check availability
        </Link>
      </div>
    </main>
  );
}
