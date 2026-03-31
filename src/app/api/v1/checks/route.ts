import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  interval: z.number().int().min(60).max(86400 * 30),
  gracePeriod: z.number().int().min(0).max(86400).optional().default(300),
  alertEmail: z.boolean().optional().default(true),
  slackWebhookUrl: z.string().url().optional().or(z.literal("")).optional(),
});

function rateLimitHeaders(limit: number, remaining: number) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
  };
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed, limit, remaining } = await checkRateLimit(auth.apiKeyId, auth.plan);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: rateLimitHeaders(limit, 0) }
    );
  }

  const checks = await prisma.check.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, slug: true, interval: true, gracePeriod: true,
      status: true, paused: true, lastPingAt: true, nextPingDue: true,
      alertEmail: true, slackWebhookUrl: true, createdAt: true, updatedAt: true,
    },
  });

  return NextResponse.json({ data: checks }, { headers: rateLimitHeaders(limit, remaining) });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed, limit, remaining } = await checkRateLimit(auth.apiKeyId, auth.plan);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: rateLimitHeaders(limit, 0) }
    );
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: { _count: { select: { checks: true } } },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const planLimit = PLAN_LIMITS[user.plan].checks;
    if (user._count.checks >= planLimit) {
      return NextResponse.json(
        { error: `Your ${user.plan} plan allows ${planLimit === Infinity ? "unlimited" : planLimit} checks. Upgrade to add more.` },
        { status: 403, headers: rateLimitHeaders(limit, remaining) }
      );
    }

    const check = await prisma.check.create({
      data: {
        userId: auth.userId,
        name: data.name,
        interval: data.interval,
        gracePeriod: data.gracePeriod,
        alertEmail: data.alertEmail,
        slackWebhookUrl: data.slackWebhookUrl || null,
        nextPingDue: new Date(Date.now() + (data.interval + data.gracePeriod) * 1000),
      },
    });

    return NextResponse.json({ data: check }, { status: 201, headers: rateLimitHeaders(limit, remaining) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
