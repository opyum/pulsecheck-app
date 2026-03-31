import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed, limit, remaining } = await checkRateLimit(auth.apiKeyId, auth.plan);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { id } = await params;
  const check = await prisma.check.findFirst({ where: { id, userId: auth.userId } });
  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.check.update({
    where: { id },
    data: { paused: true, status: "PAUSED" },
  });

  return NextResponse.json(
    { data: updated },
    { headers: { "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(remaining) } }
  );
}
