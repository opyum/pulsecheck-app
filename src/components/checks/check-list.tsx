"use client";

import { formatInterval, formatRelativeTime, calculateUptimePercent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Copy, Settings, Pause, Play } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Check, CheckEvent } from "@prisma/client";

type CheckWithEvents = Check & { events: CheckEvent[] };

const STATUS_VARIANT: Record<string, "up" | "down" | "late" | "paused" | "new"> = {
  UP: "up",
  DOWN: "down",
  LATE: "late",
  PAUSED: "paused",
  NEW: "new",
};

const STATUS_LABEL: Record<string, string> = {
  UP: "Up",
  DOWN: "Down",
  LATE: "Late",
  PAUSED: "Paused",
  NEW: "Pending",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground transition-colors"
      title="Copy ping URL"
    >
      <Copy className="h-4 w-4" />
      {copied && <span className="sr-only">Copied!</span>}
    </button>
  );
}

function PauseButton({ check }: { check: CheckWithEvents }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    await fetch(`/api/checks/${check.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paused: !check.paused }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      title={check.paused ? "Resume" : "Pause"}
      onClick={handleToggle}
      disabled={loading}
    >
      {check.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
    </Button>
  );
}

function CheckRow({ check }: { check: CheckWithEvents }) {
  const pingUrl = `${APP_URL}/api/ping/${check.slug}`;
  const uptime = calculateUptimePercent(check.events);
  const status = check.status;

  return (
    <div className="border rounded-lg p-4 flex items-center gap-4">
      {/* Status dot */}
      <div
        className={`w-3 h-3 rounded-full flex-shrink-0 ${
          status === "UP"
            ? "bg-green-500"
            : status === "DOWN"
            ? "bg-red-500"
            : status === "LATE"
            ? "bg-yellow-500"
            : "bg-gray-400"
        }`}
      />

      {/* Name + ping URL */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/checks/${check.id}`}
            className="font-medium hover:underline truncate"
          >
            {check.name}
          </Link>
          <Badge variant={STATUS_VARIANT[status] ?? "new"}>
            {STATUS_LABEL[status] ?? status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <code className="text-xs text-muted-foreground truncate max-w-xs">{pingUrl}</code>
          <CopyButton text={pingUrl} />
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground flex-shrink-0">
        <div className="text-right">
          <p className="text-xs">Interval</p>
          <p className="font-medium text-foreground">every {formatInterval(check.interval)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs">Last ping</p>
          <p className="font-medium text-foreground">{formatRelativeTime(check.lastPingAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs">Uptime (30d)</p>
          <p className="font-medium text-foreground">{uptime}%</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <PauseButton check={check} />
        <Link href={`/dashboard/checks/${check.id}/edit`}>
          <Button variant="ghost" size="icon" title="Edit">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function CheckList({ checks }: { checks: CheckWithEvents[] }) {
  return (
    <div className="space-y-3">
      {checks.map((check) => (
        <CheckRow key={check.id} check={check} />
      ))}
    </div>
  );
}
