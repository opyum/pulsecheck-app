import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMissedCheckAlerts } from "@/lib/alerts";

// Vercel Cron — runs every minute
// vercel.json: { "crons": [{ "path": "/api/cron/check-missed", "schedule": "* * * * *" }] }

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    // Vercel sets Authorization: Bearer <CRON_SECRET> on cron calls
    // Also allow Vercel's own internal token via x-vercel-signature
    const vercelCron = req.headers.get("x-vercel-cron");
    if (!vercelCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  // Find all checks that are past due and not paused
  const overdueChecks = await prisma.check.findMany({
    where: {
      paused: false,
      status: { in: ["UP", "NEW", "LATE"] },
      nextPingDue: { lte: now },
    },
    include: { user: true },
  });

  const results = { checked: overdueChecks.length, alerted: 0, errors: 0 };

  for (const check of overdueChecks) {
    try {
      const wasLate = check.status === "LATE";

      await prisma.$transaction([
        prisma.check.update({
          where: { id: check.id },
          data: { status: wasLate ? "DOWN" : "LATE" },
        }),
        prisma.checkEvent.create({
          data: { checkId: check.id, type: "MISSED" },
        }),
      ]);

      // Only alert when transitioning to DOWN (not on the first LATE)
      if (wasLate) {
        await sendMissedCheckAlerts(check);
        results.alerted++;
      }
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results, timestamp: now.toISOString() });
}
