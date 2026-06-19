// Google Calendar client. Service-account auth — the manager shares each hut's calendar
// with the service-account email and we get read/write without per-user OAuth.

import { google, calendar_v3 } from "googleapis";
import { getHut } from "./huts";

let cached: calendar_v3.Calendar | null = null;

export function googleCalendar(): calendar_v3.Calendar {
  if (cached) return cached;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON missing");
  const creds = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  cached = google.calendar({ version: "v3", auth });
  return cached;
}

export function calendarIdForHut(hutId: string): string {
  const hut = getHut(hutId);
  if (!hut) throw new Error(`Unknown hut ${hutId}`);
  const id = process.env[hut.googleCalendarIdEnv];
  if (!id) throw new Error(`Env var ${hut.googleCalendarIdEnv} not set`);
  return id;
}

export function hasGoogle(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
}
