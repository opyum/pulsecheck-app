import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const check = await prisma.check.findUnique({ where: { slug } });
  if (!check) return NextResponse.json({ error: "Check not found" }, { status: 404 });
  if (check.paused) return NextResponse.json({ ok: true, message: "Check is paused" });

  await prisma.checkEvent.create({ data: { checkId: check.id, type: "START" } });

  return NextResponse.json({ ok: true, received: new Date().toISOString() });
}
