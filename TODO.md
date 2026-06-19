# Post-Deploy TODO

## Airbnb — Step 2 (push site bookings → Airbnb)

After deploying to the live domain, go back into each Airbnb listing and complete Step 2 of the calendar sync:

**Hut 1 (Luxury Hut One)**
- Airbnb → Listing → Calendar → Availability → Connect to another website → Step 2
- Paste: `https://yourdomain.com/api/ical/luxury-1`
- Calendar name: `Villa Cottages – Hut 1`

**Hut 2 (Luxury Hut Two)**
- Airbnb → Listing → Calendar → Availability → Connect to another website → Step 2
- Paste: `https://yourdomain.com/api/ical/luxury-2`
- Calendar name: `Villa Cottages – Hut 2`

This makes bookings made on your site block dates on Airbnb within 2–4 hours (Airbnb's iCal refresh schedule).

---

## Other post-deploy steps

- [ ] Add production redirect URI to Google OAuth: `https://yourdomain.com/api/auth/callback/google`
- [ ] Set `NEXTAUTH_URL=https://yourdomain.com` in Vercel env vars
- [ ] Set all `.env.local` vars in Vercel → Project → Settings → Environment Variables
- [ ] Verify sending domain `villacottages.in` on resend.com → Domains
- [ ] Switch `CASHFREE_ENV=PROD` when ready to go live with real payments
- [ ] Add Cashfree webhook URL in Cashfree dashboard: `https://yourdomain.com/api/webhook/cashfree`
