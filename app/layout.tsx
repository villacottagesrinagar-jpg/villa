import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Lora } from "next/font/google";
import "./globals.css";
import { SmoothAnchor } from "@/components/SmoothAnchor";
import { Analytics } from "@vercel/analytics/next";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Villa Cottages, Srinagar — Private Orchard Stay in Kashmir",
  description:
    "Two private A-frame cottages on a working apple orchard in Srinagar, Kashmir. Mosaic pool, mountain views, fire circle, and 24/7 concierge. Rated 4.9 stars on Google. Book your Kashmir escape today.",
  metadataBase: new URL("https://www.villacottages.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Villa Cottages, Srinagar — Private Orchard Stay in Kashmir",
    description:
      "Two private A-frame cottages on a working apple orchard in Srinagar. Mosaic pool, mountain views, and total peace. Rated 4.9 stars on Google.",
    url: "https://www.villacottages.in",
    siteName: "Villa Cottages",
    images: [
      {
        url: "/photos/hero-aerial.png",
        width: 1200,
        height: 630,
        alt: "Villa Cottages — aerial view of A-frame cottages in apple orchard, Srinagar Kashmir",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Villa Cottages, Srinagar — Private Orchard Stay in Kashmir",
    description:
      "Two private A-frame cottages on a working apple orchard in Srinagar. Mosaic pool, mountain views. Rated 4.9 stars on Google.",
    images: ["/photos/hero-aerial.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${lora.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#080705] text-[#f2ead8] font-sans">
        <SmoothAnchor />
        {children}
        <a
          href="https://wa.me/918715008939?text=Hi%2C%20I%20saw%20Villa%20Cottages%20and%20would%20love%20to%20know%20more%20about%20availability%20and%20booking."
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110"
          style={{ background: "#25D366" }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
        <Analytics />
      </body>
    </html>
  );
}
