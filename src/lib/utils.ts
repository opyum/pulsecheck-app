import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInterval(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function formatRelativeTime(date: Date | null): string {
  if (!date) return "Never";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function calculateUptimePercent(
  events: { type: string; createdAt: Date }[],
  windowDays = 30
): number {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const recent = events.filter((e) => e.createdAt >= windowStart);
  if (recent.length === 0) return 100;
  const missed = recent.filter((e) => e.type === "MISSED").length;
  const total = recent.filter((e) =>
    ["PING", "MISSED", "START"].includes(e.type)
  ).length;
  if (total === 0) return 100;
  return Math.round(((total - missed) / total) * 1000) / 10;
}

export const PLAN_LIMITS = {
  FREE: { checks: 3, slack: false },
  INDIE: { checks: 20, slack: true },
  TEAM: { checks: Infinity, slack: true },
} as const;
