import { SITE, PULL_QUOTES } from "@/lib/huts";

export function Footer() {
  return (
    <footer className="py-12 px-6 lg:px-10 border-t border-white/6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-center text-center md:text-left">
        <div className="font-serif text-xl">
          Villa <em className="text-[var(--amber)]">Cottages</em>
        </div>
        <div className="text-[0.6rem] tracking-[0.12em] text-cream/25 text-center order-3 md:order-2">
          © 2026 {SITE.brandName} · {SITE.location}
          <span className="block mt-0.5">Srinagar, Jammu & Kashmir 190006 · +91 87150 08939</span>
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
  );
}
