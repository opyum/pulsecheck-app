import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const raw = crypto.randomBytes(32).toString("hex");
  const key = `pc_live_${raw}`;
  const prefix = key.slice(0, 14); // "pc_live_" + 6 chars
  const hash = hashApiKey(key);
  return { key, prefix, hash };
}

export async function authenticateApiKey(req: NextRequest): Promise<{
  userId: string;
  plan: string;
  apiKeyId: string;
} | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!token.startsWith("pc_live_")) return null;

  const hash = hashApiKey(token);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: { user: { select: { id: true, plan: true } } },
  });

  if (!apiKey) return null;

  // Update lastUsedAt asynchronously (don't await)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return { userId: apiKey.user.id, plan: apiKey.user.plan, apiKeyId: apiKey.id };
}
