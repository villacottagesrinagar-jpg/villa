import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBlock, deleteBlock, updateBlock } from "@/lib/calendar";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { hutId, start, end, notes } = await req.json();
  if (!hutId || !start || !end || start >= end) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const block = await createBlock(hutId, { start, end, source: "manual", notes });
  return NextResponse.json(block);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { hutId, block } = await req.json();
  if (!hutId || !block?.eventId) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const updated = await updateBlock(hutId, block.eventId, block);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const hutId = sp.get("hut");
  const eventId = sp.get("eventId");
  if (!hutId || !eventId) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await deleteBlock(hutId, eventId);
  return NextResponse.json({ ok: true });
}
