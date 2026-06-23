import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runPoll } from "@/app/api/cron/poll-airbnb/route";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await runPoll());
}
