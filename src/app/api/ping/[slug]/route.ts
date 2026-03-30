import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRecoveryAlerts } from "@/lib/alerts";

async function handlePing(slug: string, type: "PING" | "START" | "FAIL") {
  const check = await prisma.check.findUnique({
    where: { slug },
    include: { user: true },
  });

  if (!check) {
    return NextResponse.json({ error: "Check not found" }, { status: 404 });
  }

  if (check.paused) {
    return NextResponse.json({ ok: true, message: "Check is paused" });
  }

  const wasDown = check.status === "DOWN" || check.status === "LATE";

  const nextPingDue = new Date(
    Date.now() + (check.interval + check.gracePeriod) * 1000
  );

  await prisma.$transaction([
    prisma.check.update({
      where: { id: check.id },
      data: {
        status: type === "FAIL" ? "DOWN" : "UP",
        lastPingAt: new Date(),
        nextPingDue,
      },
    }),
    prisma.checkEvent.create({
      data: { checkId: check.id, type },
    }),
  ]);

  // Send recovery alert if check was previously down
  if (wasDown && type !== "FAIL") {
    sendRecoveryAlerts(check).catch(() => {});
  }

  return NextResponse.json({ ok: true, received: new Date().toISOString() });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return handlePing(slug, "PING");
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return handlePing(slug, "PING");
}
