import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  interval: z.number().int().min(60).max(86400 * 30).optional(),
  gracePeriod: z.number().int().min(0).max(86400).optional(),
  alertEmail: z.boolean().optional(),
  slackWebhookUrl: z.string().url().optional().or(z.literal("")).optional(),
});

function rateLimitHeaders(limit: number, remaining: number) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed, limit, remaining } = await checkRateLimit(auth.apiKeyId, auth.plan);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimitHeaders(limit, 0) });

  const { id } = await params;
  const check = await prisma.check.findFirst({
    where: { id, userId: auth.userId },
    include: {
      events: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: check }, { headers: rateLimitHeaders(limit, remaining) });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed, limit, remaining } = await checkRateLimit(auth.apiKeyId, auth.plan);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimitHeaders(limit, 0) });

  const { id } = await params;
  const check = await prisma.check.findFirst({ where: { id, userId: auth.userId } });
  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.check.update({
      where: { id },
      data: {
        ...data,
        slackWebhookUrl: data.slackWebhookUrl === "" ? null : data.slackWebhookUrl,
      },
    });

    return NextResponse.json({ data: updated }, { headers: rateLimitHeaders(limit, remaining) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed, limit, remaining } = await checkRateLimit(auth.apiKeyId, auth.plan);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimitHeaders(limit, 0) });

  const { id } = await params;
  const check = await prisma.check.findFirst({ where: { id, userId: auth.userId } });
  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.check.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { headers: rateLimitHeaders(limit, remaining) });
}
