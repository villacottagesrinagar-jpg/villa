# Villa Cottages — Setup Guide

End-to-end booking site for 3 huts with Google Calendar sync, Airbnb iCal in/out, Cashfree payments, and a manager admin portal.

## Run locally

```bash
npm install
cp .env.local.example .env.local
npm run dev
# → http://localhost:3000
```

Without any env vars set, the site runs in **dev stub mode**:
- Calendar = in-memory (resets on restart)
- Cashfree = stub checkout page
- Email = console log
- Admin = no auth required (everything Google OAuth-gated otherwise)

This is fine for poking at the UI. To go real, wire credentials below.

## Credentials checklist

### 1. Google Calendar (real-time, source of truth)

1. Create a project at <https://console.cloud.google.com/>
2. Enable **Google Calendar API**
3. Create a **Service Account** → JSON key → download
4. Create 3 Google Calendars (one per hut) at <https://calendar.google.com>
5. In each calendar's settings → **Share with specific people** → add the service-account email (`xxx@xxx.iam.gserviceaccount.com`) with **Make changes to events** permission
6. Copy each calendar's **Calendar ID** from settings → Integrate calendar
7. Add to `.env.local`:
   ```
   GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'  # single-line JSON
   GCAL_ID_A_FRAME=xxx@group.calendar.google.com
   GCAL_ID_LUXURY_1=xxx@group.calendar.google.com
   GCAL_ID_LUXURY_2=xxx@group.calendar.google.com
   ```

### 2. Airbnb iCal (one direction, 2-4hr lag)

For **each** of the 3 listings:

**Pull from Airbnb → us:**
1. Airbnb → Calendar → Availability settings → Sync calendars → **Export Calendar**
2. Copy URL into `.env.local`:
   ```
   AIRBNB_ICAL_A_FRAME=https://www.airbnb.co.in/calendar/ical/xxx
   AIRBNB_ICAL_LUXURY_1=...
   AIRBNB_ICAL_LUXURY_2=...
   ```

**Push from us → Airbnb:**
1. After deploying, get each hut's iCal URL: `https://yourdomain.com/api/ical/a-frame`, etc.
2. Airbnb → Calendar → Availability settings → Sync calendars → **Import Calendar** → paste

### 3. Cashfree

1. Sign up at <https://www.cashfree.com/> → Payment Gateway product
2. Test mode works without KYC. Live mode requires business PAN + GST
3. Dashboard → Developers → API Keys → copy App ID + Secret Key
4. Dashboard → Developers → Webhooks → add `https://yourdomain.com/api/webhook/cashfree` → subscribe to `PAYMENT_SUCCESS_WEBHOOK` and `PAYMENT_FAILED_WEBHOOK`
5. Add to `.env.local`:
   ```
   CASHFREE_APP_ID=...
   CASHFREE_SECRET_KEY=...
   CASHFREE_ENV=TEST     # or PROD
   ```

### 4. Manager portal (Google OAuth)

1. Same Google Cloud project from step 1
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID → Web application
3. Authorized redirect URI: `https://yourdomain.com/api/auth/callback/google` (and `http://localhost:3000/api/auth/callback/google` for dev)
4. Add to `.env.local`:
   ```
   GOOGLE_OAUTH_CLIENT_ID=...
   GOOGLE_OAUTH_CLIENT_SECRET=...
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   NEXTAUTH_URL=https://yourdomain.com
   ADMIN_EMAILS=manager@example.com,you@example.com
   ```

### 5. Resend (email confirmations)

1. Sign up at <https://resend.com> → verify your domain (or use their sandbox)
2. Copy API key → `RESEND_API_KEY` in `.env.local`

### 6. Cron secret (Airbnb poller + hold sweeper)

```
CRON_SECRET=$(openssl rand -base64 32)
```

Vercel will call these automatically (see `vercel.json`):
- `/api/cron/poll-airbnb` every 10 min — mirrors Airbnb bookings into Google Calendar
- `/api/cron/sweep-holds` every 5 min — releases expired checkout holds

## Deploy

```bash
vercel
# or push to GitHub and connect to vercel.com
```

After deploy, paste each `.env.local` var into Vercel → Project → Settings → Environment Variables.

## Edit hut details

All hut info is in `lib/huts.ts`. Change names, prices, photos, descriptions there — restart the dev server to see changes. No DB migrations, no admin UI for this.

## How the calendar sync flows

| Action | Latency | Mechanism |
|---|---|---|
| Guest books on site → Google Calendar | ~instant | Cashfree webhook fires `updateBlock` |
| Guest books on site → Airbnb | 2-4 hrs | Airbnb polls our iCal feed |
| Guest books on Airbnb → Google Calendar | 5-15 min | Our cron polls Airbnb iCal every 10 min |
| Guest books on Airbnb → site availability | 5-15 min | Same |
| Manager blocks date in admin → Google Calendar | ~instant | Direct write |
| Manager blocks date in admin → Airbnb | 2-4 hrs | Via our iCal feed → Airbnb polls |
| Manager edits Google Calendar directly | ~instant | Site reads Google Calendar live |

**Double-booking buffer:** when our iCal feed is rendered for Airbnb, we add a 1-day buffer on either side of any booking (configurable in `lib/huts.ts` → `BOOKING_RULES.airbnbBufferDays`). This protects against the 2-4hr lag.
