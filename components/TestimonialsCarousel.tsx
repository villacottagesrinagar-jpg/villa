"use client";

import { useRef, useState } from "react";

const ITEMS = [
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

export function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);
  const count = ITEMS.length;
  const t = ITEMS[idx];
  const touchX = useRef(0);

  const prev = () => setIdx((i) => (i - 1 + count) % count);
  const next = () => setIdx((i) => (i + 1) % count);

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="testimonials-section__inner">

        <div className="testimonials__header">
          <div className="eyebrow mb-3">Testimonials</div>
          <h2 className="testimonials__title">What guests say.</h2>
          <div className="testimonials__rating">
            <span className="testimonials__stars-row">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" className="star-icon">
                  <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" />
                </svg>
              ))}
            </span>
            <span className="testimonials__rating-text">
              <strong>4.9</strong> ·{" "}
              <a
                href="https://www.google.com/travel/search?g2lb=4965990,72471280,72560029,72573224,72647020,72686036,72803964,72882230,73064764,121529349,121762712&hl=en-IN&gl=in&cs=1&ssta=1&q=villa+cottages&ts=CAEaRwopEicyJTB4MzhlMTgzMDAyZWQ1MzA5NToweDlkMTIyOWYyNTNjZjllOGISGhIUCgcI6g8QBhgUEgcI6g8QBhgVGAEyAhAA&qs=CAEyFENnc0lpNzItbnFXLWlvbWRBUkFCOAJCCQmLns9T8ikSnQ&ap=ugEHcmV2aWV3cw&ictx=111&ved=1t:73921"
                target="_blank"
                rel="noreferrer"
                className="testimonials__rating-link"
              >
                124 reviews on Google
              </a>
            </span>
          </div>
        </div>

        <div
          className="testimonial"
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const dx = touchX.current - e.changedTouches[0].clientX;
            if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
          }}
        >
          <div className="testimonial__stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} viewBox="0 0 24 24" className="star-icon">
                <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" />
              </svg>
            ))}
          </div>
          <p className="testimonial__quote">&ldquo;{t.quote}&rdquo;</p>
          <div>
            <strong className="testimonial__author">{t.author}</strong>
            <span className="testimonial__meta">{t.meta}</span>
          </div>
        </div>

        <div className="testimonials__nav-row">
          <button onClick={prev} aria-label="Previous" className="testimonials__nav">‹</button>
          <div className="testimonials__dots">
            {ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`testimonials__dot${i === idx ? " testimonials__dot--active" : ""}`}
              />
            ))}
          </div>
          <button onClick={next} aria-label="Next" className="testimonials__nav">›</button>
        </div>

      </div>
    </section>
  );
}
