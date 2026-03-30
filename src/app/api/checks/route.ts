import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  interval: z.number().int().min(60).max(86400 * 30), // 1 min to 30 days
  gracePeriod: z.number().int().min(0).max(86400),
  alertEmail: z.boolean().optional().default(true),
  slackWebhookUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks = await prisma.check.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      _count: { select: { events: true } },
    },
  });

  return NextResponse.json(checks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { _count: { select: { checks: true } } },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const limit = PLAN_LIMITS[user.plan].checks;
    if (user._count.checks >= limit) {
      return NextResponse.json(
        { error: `Your ${user.plan} plan allows ${limit} check${limit === 1 ? "" : "s"}. Upgrade to add more.` },
        { status: 403 }
      );
    }

    const check = await prisma.check.create({
      data: {
        userId: session.user.id,
        name: data.name,
        interval: data.interval,
        gracePeriod: data.gracePeriod,
        alertEmail: data.alertEmail,
        slackWebhookUrl: data.slackWebhookUrl || null,
        nextPingDue: new Date(Date.now() + (data.interval + data.gracePeriod) * 1000),
      },
    });

    return NextResponse.json(check, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
