import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const check = await prisma.check.findUnique({
    where: { slug },
    include: { user: true },
  });
  if (!check) return NextResponse.json({ error: "Check not found" }, { status: 404 });
  if (check.paused) return NextResponse.json({ ok: true, message: "Check is paused" });

  await prisma.$transaction([
    prisma.check.update({
      where: { id: check.id },
      data: { status: "DOWN", lastPingAt: new Date() },
    }),
    prisma.checkEvent.create({ data: { checkId: check.id, type: "FAIL" } }),
  ]);

  // Trigger alerts asynchronously
  const { sendMissedCheckAlerts } = await import("@/lib/alerts");
  sendMissedCheckAlerts(check).catch(() => {});

  return NextResponse.json({ ok: true, received: new Date().toISOString() });
}
