import Image from "next/image";
import { Nav } from "@/components/Nav";
import { BookingWidget } from "@/components/BookingWidget";
import { GalleryGrid } from "@/components/GalleryGrid";
import { HUTS, SITE, PULL_QUOTES } from "@/lib/huts";
import { getAllPrices } from "@/lib/price-store";

const AMENITIES = [
  { title: "Two A-Frame Cottages", body: "Two glass A-frame cottages spread across a working apple orchard." },
  { title: "Private Mosaic Pool", body: "Open May–October, surrounded by apple trees. Loungers and stone deck included." },
  { title: "Fire Circle", body: "Stone fire pit with Adirondack seating for 6. Firewood provided year-round." },
  { title: "Full Kitchens", body: "Espresso machine and dining for 6. Optional Kashmiri chef on request." },
  { title: "Satellite WiFi", body: "50+ Mbps across the property. Work from paradise if you must." },
  { title: "Concierge", body: "24/7 host support, local guides, shikara bookings on Dal Lake." },
  { title: "Orchard Access", body: "Full run of 1.2 acres of working orchard. Pick fruit in season." },
  { title: "Luxury Linens", body: "Hand-loomed Kashmiri linens, towels, robes, and slippers provided." },
];

// Real reviews lifted from Google (124 reviews, 4.9 stars). Edited only for length —
// no embellishment. Each picked to hit a different audience: solo female, family,
// design lovers, escape-the-city locals, "I never want to leave" emotional close.
const TESTIMONIALS = [
  {
    quote: "Beautifully maintained and feels like a true hidden gem — so peaceful, surrounded by nature. One of the highlights was the apple trees right in the garden. The pool was great for kids and perfect for relaxing afternoons.",
    author: "Sabereen Huq",
    meta: "Family · Google review",
  },
  {
    quote: "I booked the cottage for my birthday. Flowers surrounded by the trees, calmness and warmth all around. I went solo and it was perfectly safe — they have a lot of female staff which I absolutely loved. Made my birthday memorable.",
    author: "Muskaan Ishaaq",
    meta: "Solo · Google review",
  },
  {
    quote: "It doesn't feel like it's made just for visitors — it truly feels like a home created with warmth and intention. From the beautiful flower buds with soft lights to the cute papier-mâché on the ceiling, everything is done with so much love and care.",
    author: "Mehreen Wani",
    meta: "Couple · Google review",
  },
  {
    quote: "My personal advice: don't visit this place... because you'll fall in love with it. Seriously, I don't want to go back home from here. If I had 100 stars to give, I would gladly rate this place with all of them.",
    author: "Shyam",
    meta: "Family · Google review",
  },
  {
    quote: "This is your own home in Srinagar, away from the hustle of the city. Beautifully calm, filled with apple trees, impeccable cleaning, food and other services makes your day. This is THE PLACE to stay in Srinagar.",
    author: "Sampurna Roy",
    meta: "Google review",
  },
  {
    quote: "This place feels like stepping into a peaceful little dream. Surrounded by nature, it is the perfect escape from the noise of everyday life. The solace this place provides can't be explained in words.",
    author: "Zainab Shafat",
    meta: "Google review",
  },
];

const GALLERY = [
  "/photos/exterior-night.jpg",
  "/photos/orchard.jpg",
  "/photos/interior-living.jpg",
  "/photos/loft.jpg",
  "/photos/kitchen.jpg",
  "/photos/garden.jpg",
  "/photos/firepit.png",
  "/photos/pool.jpg",
  "/photos/interior-bedroom.jpg",
];

export default function HomePage() {
  const prices = getAllPrices();
  return (
    <>
      <Nav />

      {/* HERO */}
      <section id="book" className="relative h-[100svh] min-h-[640px] overflow-hidden flex items-end">
        <Image
          src="/photos/hero-aerial.png"
          alt="Villa Cottages — aerial view of the orchard and cottages"
          fill priority className="object-cover object-bottom" sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 via-40% to-black/90" />

        {/* Centered quote */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-32">
          <div className="text-center px-6 max-w-2xl">
            <p className="font-serif italic text-xl md:text-2xl text-[var(--amber)]/90 leading-snug">
              &ldquo;{PULL_QUOTES.hundredStars.quote}&rdquo;
            </p>
            <span className="block mt-3 text-[0.55rem] not-italic tracking-[0.3em] uppercase text-cream/40">
              — {PULL_QUOTES.hundredStars.author} · Google
            </span>
          </div>
        </div>

        <div className="relative max-w-7xl w-full mx-auto px-6 lg:px-10 pb-24">
          <div className="eyebrow flex items-center gap-3 mb-5">
            <span className="block h-px w-8 bg-[var(--amber)]" />
            {SITE.location}
          </div>
          <h1 className="font-serif font-light text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-3xl">
            Stepping into a
            <br />
            peaceful little <em className="text-cream/70">dream.</em>
          </h1>
          <p className="mt-5 text-sm tracking-wider text-white/55">
            Private A-frame cottages on an apple orchard
          </p>
        </div>
      </section>

      {/* BOOKING WIDGET (sticky-ish floats over hero base) */}
      <section className="relative -mt-16 z-10 px-6 lg:px-10 pb-20">
        <BookingWidget />
      </section>

      {/* INTRO */}
      <section className="py-24 px-6 lg:px-10 max-w-3xl mx-auto text-center">
        <div className="eyebrow mb-4 justify-center inline-flex">— {PULL_QUOTES.peacefulDream.author} · Google review</div>
        <p className="font-serif text-3xl md:text-4xl font-light leading-snug text-cream italic">
          &ldquo;{PULL_QUOTES.peacefulDream.quote}&rdquo;
        </p>
        <p className="mt-10 text-sm leading-relaxed text-cream/55 max-w-xl mx-auto">
          Villa Cottages sits in Srinagar surrounded by apple trees and the Kashmir mountain ranges.
          Every window frames a painting. Every morning begins with birdsong.
        </p>
        <p className="mt-8 font-serif italic text-base text-cream/50">
          &ldquo;{PULL_QUOTES.warmthIntention.quote}&rdquo;
        </p>
        <span className="block mt-2 text-[0.55rem] tracking-[0.25em] uppercase text-cream/30">— {PULL_QUOTES.warmthIntention.author} · Google review</span>
      </section>

      {/* STAYS */}
      <section id="stays" className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="eyebrow mb-3">Two Stays</div>
          <h2 className="font-serif text-4xl md:text-5xl font-light">Choose your cottage.</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {HUTS.filter((h) => !h.hidden).map((hut) => (
            <a key={hut.id} href="#book" className="group block border border-white/6 hover:border-[var(--amber)]/30 transition-colors">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src={hut.heroPhoto} alt={hut.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 1024px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 eyebrow text-[0.5rem]">
                  {hut.tier === "luxury" ? "Luxury" : "Standard"}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl font-light mb-1.5">{hut.name}</h3>
                <p className="text-[0.75rem] text-cream/55 mb-4 leading-relaxed">{hut.tagline}</p>
                <div className="flex justify-between items-end pt-4 border-t border-white/6">
                  <span className="text-[0.65rem] tracking-[0.18em] uppercase text-cream/40">
                    Sleeps {hut.maxGuests} · {hut.bedrooms} bedrooms
                  </span>
                  <span className="font-serif text-xl">
                    ₹{(prices[hut.id] ?? hut.nightlyRateInr).toLocaleString("en-IN")}
                    <span className="text-[0.55rem] tracking-[0.2em] uppercase text-cream/40 ml-1">/ night</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* QUOTE BAND 1 */}
      <section className="quote-band">
        <div className="quote-band__inner">
          <p className="quote">&ldquo;{PULL_QUOTES.warmthIntention.quote}&rdquo;</p>
          <p className="author">— {PULL_QUOTES.warmthIntention.author} · Google</p>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="eyebrow mb-3">Gallery</div>
          <h2 className="font-serif text-4xl md:text-5xl font-light">Inside the property.</h2>
          <p className="mt-4 font-serif italic text-lg text-cream/55 max-w-xl mx-auto">
            &ldquo;{PULL_QUOTES.appleTrees.quote}&rdquo; <span className="text-cream/30 text-[0.65rem] not-italic tracking-wider">— {PULL_QUOTES.appleTrees.author}</span>
          </p>
        </div>
        <GalleryGrid photos={GALLERY} />
      </section>

      {/* AMENITIES */}
      <section id="amenities" className="relative overflow-hidden">
        <Image
          src="/photos/amenities-bg-new.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#080705]/55" />
        <div className="relative py-24 px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="eyebrow mb-3">What&apos;s Included</div>
            <h2 className="font-serif text-4xl md:text-5xl font-light">Every detail, considered.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AMENITIES.map((a) => (
              <div key={a.title} className="p-6 border border-[rgba(212,175,55,0.18)] bg-[#080705]/55 backdrop-blur-sm hover:border-[rgba(212,175,55,0.4)] hover:bg-[#080705]/75 transition-colors">
                <h3 className="font-serif text-lg mb-2">{a.title}</h3>
                <p className="text-[0.7rem] leading-relaxed text-cream/60">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/6 grid grid-cols-2 md:grid-cols-4 max-w-7xl mx-auto">
        {[["3", "private cottages"], ["3,200", "feet altitude"], ["1.2", "acre orchard"], ["∞", "stars on clear nights"]].map(([n, l]) => (
          <div key={l} className="p-10 text-center border-r border-white/6 last:border-r-0">
            <div className="font-serif text-5xl font-light text-[var(--amber)] leading-none mb-2">{n}</div>
            <div className="text-[0.6rem] tracking-[0.2em] uppercase text-cream/40">{l}</div>
          </div>
        ))}
      </section>

      {/* EVENTS */}
      <section id="events" className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          <div>
            <div className="eyebrow mb-4">Private Events</div>
            <h2 className="font-serif text-4xl md:text-5xl font-light leading-[1.1] mb-6">
              Make it a<br />
              <em className="text-[var(--amber)]">moment to remember.</em>
            </h2>
            <p className="text-sm leading-relaxed text-cream/55 mb-8 max-w-md">
              The orchard transforms for your occasion. Low tables, lanterns, flowers, and candlelight — all set up before you arrive. We handle everything so you just show up and celebrate.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-10">
              {[
                "Birthday Parties",
                "Anniversaries",
                "Retirement Celebrations",
                "Bridal Showers",
                "Bachelorette Parties",
                "Family Gatherings",
              ].map((e) => (
                <div key={e} className="flex items-center gap-2 text-[0.7rem] tracking-wider text-cream/60">
                  <span className="w-1 h-1 rounded-full bg-[var(--amber)] shrink-0" />
                  {e}
                </div>
              ))}
            </div>
            <a
              href={`https://wa.me/918715008939?text=${encodeURIComponent("Hi, I'd like to enquire about hosting a private event at Villa Cottages. Please share details on packages and availability.")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block py-3.5 px-8 border border-[var(--amber)]/35 text-[0.65rem] tracking-[0.22em] uppercase text-[var(--amber)] hover:bg-[var(--amber)] hover:text-[#080705] transition-colors"
            >
              Enquire on WhatsApp
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src="/photos/events-1.jpg" alt="Outdoor garden party setup" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="25vw" />
            </div>
            <div className="grid gap-2">
              <div className="relative aspect-square overflow-hidden">
                <Image src="/photos/events-4.jpg" alt="Candlelit dinner" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="25vw" />
              </div>
              <div className="relative aspect-square overflow-hidden">
                <Image src="/photos/events-6.jpg" alt="Purple orchard event" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="25vw" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom photo strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {["/photos/events-2.jpg", "/photos/events-3.jpg", "/photos/events-5.jpg", "/photos/events-7.jpg"].map((src, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden">
              <Image src={src} alt="" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="25vw" />
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-6 lg:px-10 max-w-7xl mx-auto text-center">
        <div className="mb-14">
          <div className="eyebrow mb-3">Testimonials</div>
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-5">What guests say.</h2>
          <div className="inline-flex items-center gap-2 text-[0.7rem] tracking-wider text-cream/50">
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" className="w-3 h-3 fill-[var(--amber)]">
                  <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" />
                </svg>
              ))}
            </span>
            <span className="text-cream"><strong className="font-medium">4.9</strong> · 124 reviews on Google</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <div key={t.author} className="p-8 border-t border-[rgba(212,175,55,0.2)] text-center">
              <div className="flex gap-1 mb-5 justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 24 24" className="w-3 h-3 fill-[var(--amber)]">
                    <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" />
                  </svg>
                ))}
              </div>
              <p className="font-serif italic text-lg leading-snug text-cream mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="text-[0.6rem] tracking-[0.18em] uppercase">
                <strong className="block font-medium text-cream/70 mb-0.5 text-[0.65rem]">{t.author}</strong>
                <span className="text-cream/40">{t.meta}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE BAND 2 */}
      <section className="quote-band">
        <div className="quote-band__inner">
          <p className="quote">&ldquo;{PULL_QUOTES.fallInLove.quote}&rdquo;</p>
          <p className="author">— {PULL_QUOTES.fallInLove.author} · Google</p>
        </div>
      </section>

      {/* FINAL BOOKING */}
      <section className="relative py-20 md:py-28 px-4 md:px-10 overflow-hidden">
        <Image src="/photos/evening.jpg" alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[#080705]/80" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-6xl font-light leading-[1.1] mb-6 md:mb-8">
            Your Kashmir
            <br />
            <em className="text-[var(--amber)]">awaits.</em>
          </h2>
          <p className="font-serif italic text-base md:text-lg text-cream/70 mb-10">
            &ldquo;{PULL_QUOTES.theEscape.quote}&rdquo;
            <span className="block mt-1 text-[0.55rem] not-italic tracking-[0.3em] uppercase text-cream/40">— {PULL_QUOTES.theEscape.author}</span>
          </p>
          <BookingWidget />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 lg:px-10 border-t border-white/6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-center text-center md:text-left">
          <div className="font-serif text-xl">
            Villa <em className="text-[var(--amber)]">Cottages</em>
          </div>
          <div className="text-[0.6rem] tracking-[0.12em] text-cream/25 text-center order-3 md:order-2">
            © 2025 {SITE.brandName} · {SITE.location}
          </div>
          <div className="flex justify-center md:justify-end gap-6 order-2 md:order-3">
            <a href={SITE.instagramUrl} target="_blank" rel="noreferrer" className="text-[0.6rem] tracking-[0.15em] uppercase text-cream/35 hover:text-[var(--amber)] transition-colors">Instagram</a>
            <a href={SITE.airbnbListingUrl} target="_blank" rel="noreferrer" className="text-[0.6rem] tracking-[0.15em] uppercase text-cream/35 hover:text-[var(--amber)] transition-colors">Airbnb</a>
            <a href={`mailto:${SITE.contactEmail}`} className="text-[0.6rem] tracking-[0.15em] uppercase text-cream/35 hover:text-[var(--amber)] transition-colors">Contact</a>
          </div>
        </div>
        <p className="mt-8 pt-8 border-t border-white/5 font-serif italic text-cream/35 text-center text-sm">
          &ldquo;{PULL_QUOTES.thePlace.quote}&rdquo;
          <span className="block mt-1 text-[0.55rem] not-italic tracking-[0.3em] uppercase text-cream/25">— {PULL_QUOTES.thePlace.author}</span>
        </p>
      </footer>
    </>
  );
}
