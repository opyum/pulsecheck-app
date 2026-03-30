import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInterval, formatRelativeTime, calculateUptimePercent } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Copy } from "lucide-react";
import { CopyPingUrl } from "@/components/checks/copy-ping-url";

const STATUS_VARIANT: Record<string, "up" | "down" | "late" | "paused" | "new"> = {
  UP: "up",
  DOWN: "down",
  LATE: "late",
  PAUSED: "paused",
  NEW: "new",
};

const EVENT_ICONS: Record<string, string> = {
  PING: "✅",
  START: "▶️",
  FAIL: "❌",
  MISSED: "⚠️",
  RECOVERED: "✅",
  PAUSED: "⏸️",
  RESUMED: "▶️",
};

export default async function CheckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id!;

  const check = await prisma.check.findFirst({
    where: { id, userId },
    include: {
      events: { orderBy: { createdAt: "desc" }, take: 30 },
      alerts: { orderBy: { sentAt: "desc" }, take: 10 },
    },
  });

  if (!check) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const pingUrl = `${appUrl}/api/ping/${check.slug}`;
  const uptime = calculateUptimePercent(check.events);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{check.name}</h1>
            <Badge variant={STATUS_VARIANT[check.status] ?? "new"}>{check.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Pings every {formatInterval(check.interval)} · {check.gracePeriod > 0 ? `${formatInterval(check.gracePeriod)} grace` : "no grace period"}
          </p>
        </div>
        <Link href={`/dashboard/checks/${check.id}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Last ping</p>
            <p className="text-xl font-bold mt-1">{formatRelativeTime(check.lastPingAt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Uptime (30d)</p>
            <p className="text-xl font-bold mt-1 text-green-600">{uptime}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Interval</p>
            <p className="text-xl font-bold mt-1">every {formatInterval(check.interval)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-xl font-bold mt-1">{check.status}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ping URL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ping URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-md p-3">
            <code className="flex-1 text-sm break-all">{pingUrl}</code>
            <CopyPingUrl url={pingUrl} />
          </div>
          <p className="text-sm text-muted-foreground">
            Add this to the end of your cron job: <code className="bg-gray-100 px-1 rounded">curl {pingUrl}</code>
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Start ping (before job runs): <code className="bg-gray-100 px-1 rounded">{pingUrl}/start</code></p>
            <p>Fail ping (job failed): <code className="bg-gray-100 px-1 rounded">{pingUrl}/fail</code></p>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm font-medium mb-2">Status badge for README:</p>
            <code className="text-xs bg-gray-100 p-2 rounded block break-all">
              {`![PulseCheck](${appUrl}/api/badge/${check.slug})`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Event history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent events (last 30)</CardTitle>
        </CardHeader>
        <CardContent>
          {check.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet. Ping the URL to get started.</p>
          ) : (
            <div className="space-y-2">
              {check.events.map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className="text-lg">{EVENT_ICONS[event.type] ?? "•"}</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{event.type}</span>
                    {event.message && (
                      <span className="text-sm text-muted-foreground ml-2">{event.message}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(event.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
