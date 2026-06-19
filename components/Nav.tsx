"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/huts";

const LINKS: [string, string][] = [
  ["Stays", "#stays"],
  ["Gallery", "#gallery"],
  ["Amenities", "#amenities"],
  ["Testimonials", "#testimonials"],
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="nav__inner">
        <Link href="/" className="nav__logo">
          Villa <em>Cottages</em>
        </Link>

        <ul className="nav__links">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>

        <div className="nav__right">
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="nav__icon"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
          </a>
          <a href="#book" className="nav__cta">Check Availability</a>
          <button
            className="nav__burger"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="nav__mobile">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMobileOpen(false)}>{label}</a>
          ))}
          <a href={SITE.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
          <a href="#book" onClick={() => setMobileOpen(false)} className="nav__mobile-cta">Check Availability</a>
        </div>
      )}
    </nav>
  );
}
