import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kashmir Travel Guides — Villa Cottages Blog",
  description: "Travel guides, itineraries, and tips for visiting Kashmir — written from a private apple orchard cottage in Srinagar.",
  alternates: { canonical: "/blog" },
};

const posts = [
  {
    slug: "kashmir-itinerary",
    title: "The Perfect 5-Day Kashmir Itinerary (Using Srinagar as Your Base)",
    excerpt: "How to see Gulmarg, Pahalgam, Dal Lake, and the Mughal Gardens without rushing — using a quiet apple orchard cottage as your home base.",
    date: "2026-07-16",
  },
  {
    slug: "best-places-to-stay-srinagar",
    title: "Where to Stay in Srinagar: Hotels vs Houseboats vs Private Cottages",
    excerpt: "An honest comparison of the three main ways to stay in Srinagar — and why the answer depends entirely on what kind of trip you want.",
    date: "2026-07-16",
  },
];

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-[#080705] text-[#f2ead8] px-6 py-20 max-w-3xl mx-auto">
      <div className="mb-12">
        <p className="text-[0.6rem] tracking-[0.18em] uppercase text-cream/45 mb-3">From the orchard</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light">Kashmir Travel Guides</h1>
      </div>
      <div className="space-y-10">
        {posts.map((post) => (
          <article key={post.slug} className="border-t border-[var(--amber)]/15 pt-8">
            <time className="text-[0.6rem] tracking-[0.18em] uppercase text-cream/40">{post.date}</time>
            <h2 className="font-serif text-2xl md:text-3xl font-light mt-2 mb-3">
              <Link href={`/blog/${post.slug}`} className="hover:text-[var(--amber)] transition-colors">
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-cream/60 leading-relaxed mb-4">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="text-[0.65rem] tracking-[0.18em] uppercase text-[var(--amber)] hover:opacity-70 transition-opacity">
              Read →
            </Link>
          </article>
        ))}
      </div>
      <div className="mt-16 pt-10 border-t border-[var(--amber)]/15">
        <Link href="/#book" className="text-[0.6rem] tracking-[0.18em] uppercase text-cream/45 hover:text-cream/70 transition-colors">
          ← Back to Villa Cottages
        </Link>
      </div>
    </main>
  );
}
