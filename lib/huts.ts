// Hut catalog. Single source of truth for the 3 properties.
// Rename labels freely. IDs are used in URLs and Google Calendar event metadata — don't change.

export type Hut = {
  id: string;
  name: string;
  hidden?: boolean;
  // Short tag prefixed onto every Google Calendar event for this hut.
  // Lets the manager tell huts apart when 3 calendars are stacked in one view.
  calendarPrefix: string;
  tagline: string;
  tier: "standard" | "luxury";
  nightlyRateInr: number;
  maxGuests: number;
  bedrooms: number;
  description: string;
  heroPhoto: string;
  gallery: string[];

  // Filled in via env vars at runtime. See .env.local.example.
  googleCalendarIdEnv: string;
  airbnbIcalUrlEnv: string;
};

export const HUTS: Hut[] = [
  {
    id: "luxury-1",
    name: "Luxury Hut One",
    calendarPrefix: "Hut-1",
    tagline: "Premium A-frame with private pool access.",
    tier: "luxury",
    nightlyRateInr: 12000,
    maxGuests: 4,
    bedrooms: 2,
    description:
      "Larger luxury A-frame with direct access to the private pool and fire circle. Premium Kashmiri linens, upgraded amenities.",
    heroPhoto: "/photos/luxury-1-hero.jpg",
    gallery: [
      "/photos/luxury-1-hero.jpg",
      "/photos/pool.jpg",
      "/photos/interior-living.jpg",
      "/photos/firepit.png",
      "/photos/garden.jpg",
    ],
    googleCalendarIdEnv: "GCAL_ID_LUXURY_1",
    airbnbIcalUrlEnv: "AIRBNB_ICAL_LUXURY_1",
  },
  {
    id: "luxury-2",
    name: "Luxury Hut Two",
    calendarPrefix: "Hut-2",
    tagline: "Premium A-frame with garden seating.",
    tier: "luxury",
    nightlyRateInr: 12000,
    maxGuests: 4,
    bedrooms: 2,
    description:
      "Second luxury A-frame with dedicated garden and picnic area. Same premium fit-out as Luxury Hut One.",
    heroPhoto: "/photos/luxury-2-hero.jpg",
    gallery: [
      "/photos/luxury-2-hero.jpg",
      "/photos/orchard.jpg",
      "/photos/interior-bedroom.jpg",
      "/photos/loft.jpg",
      "/photos/firepit.png",
    ],
    googleCalendarIdEnv: "GCAL_ID_LUXURY_2",
    airbnbIcalUrlEnv: "AIRBNB_ICAL_LUXURY_2",
  },
  {
    id: "standard",
    name: "Standard Hut",
    calendarPrefix: "Hut-3",
    tagline: "Glass-walled A-frame cottage in the orchard.",
    tier: "standard",
    nightlyRateInr: 9000,
    maxGuests: 4,
    bedrooms: 2,
    description:
      "Our standard A-frame cottage. Floor-to-roof glass facing the orchard, cathedral ceilings, two bedrooms including an upper loft. Sleeps 4.",
    hidden: true,
    heroPhoto: "/photos/exterior-night.jpg",
    gallery: [
      "/photos/exterior-night.jpg",
      "/photos/interior-living.jpg",
      "/photos/interior-bedroom.jpg",
      "/photos/loft.jpg",
      "/photos/kitchen.jpg",
    ],
    googleCalendarIdEnv: "GCAL_ID_STANDARD",
    airbnbIcalUrlEnv: "AIRBNB_ICAL_STANDARD",
  },
];

export const BOOKING_RULES = {
  minNights: 2,
  // 1-day buffer either side of any Airbnb-imported block, to soften iCal's 2-4hr sync lag.
  airbnbBufferDays: 1,
  // How long the booking dates are tentatively held during checkout.
  checkoutHoldMinutes: 15,
  currency: "INR" as const,
  taxRatePercent: 12, // GST on accommodation under ₹7500/night is 12%, above 18%. Adjust per CA advice.
  cleaningFeeInr: 500,
};

export const SITE = {
  brandName: "Villa Cottages",
  // Split for typography — first word in regular, second in italic amber
  brandNameWord1: "Villa",
  brandNameWord2: "Cottages",
  location: "Srinagar, Kashmir",
  contactEmail: "villa.cottages.srinagar@gmail.com",
  hostNotificationEmail: "host@villacottages.in",
  airbnbListingUrl: "https://www.airbnb.co.in/rooms/1196823291856037309",
  instagramUrl: "https://www.instagram.com/villa.cottages/",
  googleReviewsCount: 124,
  googleRating: 4.9,
};

// Pull-quotes from real Google reviews — short, punchy, drop-in anywhere on the site.
// Each tagged with the reviewer so we can credit when shown standalone.
export const PULL_QUOTES = {
  serene: { quote: "Serene and tranquil — 10 out of 5 stars.", author: "Aafiyat Hussain" },
  homeAway: { quote: "Your own home in Srinagar, away from the hustle of the city.", author: "Sampurna Roy" },
  hiddenGem: { quote: "Beautifully maintained and feels like a true hidden gem.", author: "Sabereen Huq" },
  hundredStars: { quote: "If I had 100 stars to give, I would gladly rate this place with all of them.", author: "Shyam" },
  fallInLove: { quote: "Don't visit this place… because you'll fall in love with it.", author: "Shyam" },
  timeJustFlows: { quote: "You don't feel rushed. Time just flows.", author: "Mehreen Wani" },
  warmthIntention: { quote: "A home created with warmth and intention.", author: "Mehreen Wani" },
  peacefulDream: { quote: "Stepping into a peaceful little dream.", author: "Zainab Shafat" },
  feltLikeHome: { quote: "Felt like HOME.", author: "Shalini Srivastava" },
  theEscape: { quote: "If you want to escape the regular buzz — this is your escape.", author: "Aafiyat Hussain" },
  appleTrees: { quote: "Apple trees right in the garden gave it such a charming, homely feel.", author: "Sabereen Huq" },
  thePlace: { quote: "This is THE PLACE to stay in Srinagar.", author: "Sampurna Roy" },
} as const;

export function getHut(id: string): Hut | undefined {
  return HUTS.find((h) => h.id === id);
}
