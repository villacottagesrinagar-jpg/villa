import Image from "next/image";
import { Nav } from "@/components/Nav";
import { BookingWidget } from "@/components/BookingWidget";
import { GalleryGrid } from "@/components/GalleryGrid";
import { EventsGallery } from "@/components/EventsGallery";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { HUTS, SITE, PULL_QUOTES } from "@/lib/huts";
import { getAllPrices } from "@/lib/price-store";

const AMENITIES = [
  { title: "Two A-Frame Cottages", body: "Two glass A-frame cottages spread across a working apple orchard." },
  { title: "Private Mosaic Pool", body: "A small splash pool perfect for kids, open May–October. Surrounded by apple trees, with loungers and a stone deck." },
  { title: "Fire Circle", body: "Stone fire pit with seating. Available on request." },
  { title: "Kitchenette", body: "Each cottage has its own kitchenette. We accept pre-orders for meals — just let us know in advance." },
  { title: "WiFi", body: "Available at the property." },
  { title: "Concierge", body: "24/7 host support. Staff on property to assist with anything you need." },
  { title: "Orchard Access", body: "Full run of a working apple orchard. A rare setting you can stroll, breathe in, and call your own." },
  { title: "Fresh Linens & Towels", body: "Soft towels and quality bedding provided for your stay." },
];


const GALLERY: { src: string; category: "exterior" | "interior"; width: number; height: number }[] = [
  { src: "/photos/lavender-night.jpg",   category: "exterior", width: 3793, height: 2844 },
  { src: "/photos/gallery-new-7.jpg",    category: "exterior", width: 960,  height: 1280 },
  { src: "/photos/gallery-new-1.avif",   category: "exterior", width: 720,  height: 960  },
  { src: "/photos/gallery-new-2.avif",   category: "exterior", width: 2560, height: 4551 },
  { src: "/photos/gallery-new-3.avif",   category: "exterior", width: 2560, height: 3506 },
  { src: "/photos/gallery-new-4.webp",   category: "exterior", width: 574,  height: 1020 },
  { src: "/photos/gallery-new-5.webp",   category: "exterior", width: 1360, height: 907  },
  { src: "/photos/gallery-new-6.webp",   category: "exterior", width: 765,  height: 1020 },
  { src: "/photos/exterior-night.jpg",   category: "exterior", width: 2363, height: 3236 },
  { src: "/photos/orchard.jpg",          category: "exterior", width: 2395, height: 3192 },
  { src: "/photos/interior-living.jpg",  category: "interior", width: 2560, height: 1920 },
  { src: "/photos/loft.jpg",             category: "interior", width: 2560, height: 1920 },
  { src: "/photos/kitchen.jpg",          category: "interior", width: 2560, height: 1920 },
  { src: "/photos/garden.jpg",           category: "exterior", width: 2364, height: 3233 },
  { src: "/photos/pool.jpg",             category: "exterior", width: 2074, height: 3686 },
  { src: "/photos/interior-bedroom.jpg", category: "interior", width: 2395, height: 3192 },
  { src: "/photos/bathroom-1.avif",      category: "interior", width: 720,  height: 960  },
  { src: "/photos/bathroom-2.avif",      category: "interior", width: 720,  height: 960  },
];

export default function HomePage() {
  const prices = getAllPrices();
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden flex items-end">
        <Image
          src="/photos/hero-aerial.png"
          alt="Villa Cottages — aerial view of the orchard and cottages"
          fill priority className="object-cover object-bottom" sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 via-40% to-black/90" />

        {/* Centered quote */}
        <div className="absolute inset-x-0 top-[10%] flex justify-center pointer-events-none sm:top-0 sm:bottom-0 sm:items-center sm:-translate-y-32">
          <div className="text-center px-6 max-w-2xl">
            <p className="font-serif italic text-base sm:text-xl md:text-2xl text-[var(--amber)]/90 leading-snug">
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
          <div className="hero__h1-row">
            <h1 className="font-serif font-light text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-3xl">
              Stepping into a
              <br />
              peaceful little <em className="text-[var(--amber)]">dream.</em>
            </h1>
            <div className="hero__review-attr eyebrow">— Zainab Shafat · Google review</div>
          </div>
          <p className="hero__tagline">
            Villa Cottages sits in Srinagar surrounded by apple trees and the Kashmir mountain ranges.
            Every window frames a painting. Every morning begins with birdsong.
          </p>
        </div>
      </section>

      {/* BOOKING WIDGET */}
      <section id="book" className="relative -mt-16 z-10 px-6 lg:px-10 pb-20">
        <BookingWidget />
      </section>


      {/* GALLERY */}
      <section id="gallery" className="py-24">
        <div className="text-center mb-12 px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="eyebrow mb-3">Gallery</div>
          <h2 className="font-serif text-4xl md:text-5xl font-light">Inside the property.</h2>
          <p className="mt-4 font-serif italic text-lg text-cream/55 max-w-2xl mx-auto">
            &ldquo;{PULL_QUOTES.appleTrees.quote}&rdquo;
            <span className="block mt-1 text-cream/30 text-[0.65rem] not-italic tracking-wider">— {PULL_QUOTES.appleTrees.author} · Google review</span>
          </p>
        </div>
        <GalleryGrid photos={GALLERY} />
      </section>

      {/* EVENTS */}
      <div id="events" className="events-section-wrap">
      <section className="events-section">
        <div className="events-section__layout">
          <div>
            <div className="eyebrow events-section__eyebrow">Private Events</div>
            <h2 className="font-serif events-section__heading">
              Make it a<br />
              <em>moment to remember.</em>
            </h2>
            <p className="events-section__body">
              The orchard transforms for your occasion. Low tables, lanterns, flowers, and candlelight — all set up before you arrive. We handle everything so you just show up and celebrate.
            </p>
            <div className="events-section__types">
              {[
                "Birthday Parties",
                "Anniversaries",
                "Retirement Celebrations",
                "Bridal Showers",
                "Bachelorette Parties",
                "Family Gatherings",
              ].map((e) => (
                <div key={e} className="events-section__type">
                  <span className="events-section__dot" />
                  {e}
                </div>
              ))}
            </div>
            <div className="events-section__ctas">
              <a
                href={`https://wa.me/917006923317?text=${encodeURIComponent("Hi, I'd like to enquire about hosting a private event at Villa Cottages. Please share details on packages and availability.")}`}
                target="_blank"
                rel="noreferrer"
                className="events-section__cta-primary"
              >
                Enquire on WhatsApp
              </a>
              <a
                href="https://www.instagram.com/moodboardbyhsm/"
                target="_blank"
                rel="noreferrer"
                className="events-section__cta-secondary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="events-section__cta-icon">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
                @moodboardbyhsm
              </a>
            </div>
          </div>
          <EventsGallery />
        </div>
      </section>
      </div>

      {/* AMENITIES */}
      <section id="amenities" className="amenities-section">
        <div className="amenities-section__inner">
          <div className="text-center mb-8 md:mb-16">
            <div className="eyebrow mb-3">What&apos;s Included</div>
            <h2 className="font-serif text-3xl md:text-5xl font-light">Every detail, considered.</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {AMENITIES.map((a) => (
              <div key={a.title} className="p-4 md:p-6 border border-[rgba(212,175,55,0.18)] bg-[#080705]/55 backdrop-blur-sm hover:border-[rgba(212,175,55,0.4)] hover:bg-[#080705]/75 transition-colors">
                <h3 className="font-serif text-base md:text-lg mb-1.5 md:mb-2">{a.title}</h3>
                <p className="text-[0.65rem] md:text-[0.7rem] leading-relaxed text-cream/60">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 stats">
          {[["2", "private cottages"], ["4.9", "on Google"], ["4.8", "on Airbnb"], ["∞", "stars on clear nights"]].map(([n, l]) => (
            <div key={l} className="stats__item">
              <div className="stats__number">{n}</div>
              <div className="stats__label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsCarousel />

      {/* QUOTE BAND */}
      <section className="quote-band">
        <div className="quote-band__inner">
          <p className="quote">&ldquo;{PULL_QUOTES.warmthIntention.quote}&rdquo;</p>
          <p className="author">— {PULL_QUOTES.warmthIntention.author} · Google</p>
        </div>
      </section>

      {/* FINAL BOOKING */}
      <section className="final-booking">
        <Image src="/photos/quote-bg.avif" alt="" fill className="object-cover object-center" sizes="100vw" />
        <div className="final-booking__overlay" />
        <div className="final-booking__inner">
          <p className="final-booking__pull-quote">
            &ldquo;{PULL_QUOTES.fallInLove.quote}&rdquo;
            <span className="final-booking__pull-author">— {PULL_QUOTES.fallInLove.author} · Google</span>
          </p>
          <h2 className="final-booking__heading">
            Your stay with us
            <br />
            <em className="text-[var(--amber)]">awaits.</em>
          </h2>
          <p className="final-booking__sub-quote">
            &ldquo;{PULL_QUOTES.theEscape.quote}&rdquo;
            <span className="final-booking__sub-author">— {PULL_QUOTES.theEscape.author}</span>
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
            <span className="block mt-1">
              Built by{" "}
              <a href="https://zamanishtiyaq.work/" target="_blank" rel="noreferrer" className="hover:text-[var(--amber)] transition-colors">
                Zaman Ishtiyaq
              </a>
            </span>
          </div>
          <div className="flex justify-center md:justify-end gap-6 order-2 md:order-3">
            <a href={SITE.instagramUrl} target="_blank" rel="noreferrer" className="text-[0.6rem] tracking-[0.15em] uppercase text-cream/35 hover:text-[var(--amber)] transition-colors">Instagram</a>
            <a href={SITE.airbnbListingUrl} target="_blank" rel="noreferrer" className="text-[0.6rem] tracking-[0.15em] uppercase text-cream/35 hover:text-[var(--amber)] transition-colors">Airbnb</a>
            <a href="https://maps.app.goo.gl/WQvVw4ihEs6QEVre9" target="_blank" rel="noreferrer" className="text-[0.6rem] tracking-[0.15em] uppercase text-cream/35 hover:text-[var(--amber)] transition-colors">Directions</a>
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
