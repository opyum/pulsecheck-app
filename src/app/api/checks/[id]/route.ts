import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  interval: z.number().int().min(60).max(86400 * 30).optional(),
  gracePeriod: z.number().int().min(0).max(86400).optional(),
  alertEmail: z.boolean().optional(),
  slackWebhookUrl: z.string().url().optional().or(z.literal("")).optional(),
  paused: z.boolean().optional(),
});

async function getCheck(id: string, userId: string) {
  return prisma.check.findFirst({ where: { id, userId } });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const check = await prisma.check.findFirst({
    where: { id, userId: session.user.id },
    include: {
      events: { orderBy: { createdAt: "desc" }, take: 30 },
      alerts: { orderBy: { sentAt: "desc" }, take: 10 },
    },
  });

  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(check);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const check = await getCheck(id, session.user.id);
  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.check.update({
      where: { id },
      data: {
        ...data,
        slackWebhookUrl: data.slackWebhookUrl === "" ? null : data.slackWebhookUrl,
        status: data.paused === true ? "PAUSED" : data.paused === false && check.status === "PAUSED" ? "NEW" : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const check = await getCheck(id, session.user.id);
  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.check.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
