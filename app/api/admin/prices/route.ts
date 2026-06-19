import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllPrices, setPrice } from "@/lib/price-store";
import { getHut } from "@/lib/huts";

async function requireAdmin() {
  const session = await auth();
  if (!session) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(getAllPrices());
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { hutId, price } = await req.json();
  if (!getHut(hutId)) return NextResponse.json({ error: "unknown hut" }, { status: 400 });
  const n = Number(price);
  if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: "invalid price" }, { status: 400 });
  setPrice(hutId, n);
  return NextResponse.json({ hutId, price: n });
}
