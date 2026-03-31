import { prisma } from "@/lib/prisma";

const RATE_LIMITS: Record<string, number> = {
  FREE: 100,
  INDIE: 1000,
  TEAM: 1000,
};

function currentWindow(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}T${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
}

export async function checkRateLimit(
  apiKeyId: string,
  plan: string
): Promise<{ allowed: boolean; limit: number; remaining: number }> {
  const limit = RATE_LIMITS[plan] ?? 100;
  const window = currentWindow();

  const result = await prisma.apiRateLimit.upsert({
    where: { apiKeyId_window: { apiKeyId, window } },
    update: { count: { increment: 1 } },
    create: { apiKeyId, window, count: 1 },
  });

  const remaining = Math.max(0, limit - result.count);
  return { allowed: result.count <= limit, limit, remaining };
}
