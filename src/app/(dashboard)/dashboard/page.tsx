import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CheckList } from "@/components/checks/check-list";
import { NewCheckButton } from "@/components/checks/new-check-button";
import { PLAN_LIMITS } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      checks: {
        orderBy: { createdAt: "desc" },
        include: {
          events: {
            orderBy: { createdAt: "desc" },
            take: 30,
          },
        },
      },
    },
  });

  if (!user) return null;

  const limit = PLAN_LIMITS[user.plan].checks;
  const atLimit = user.checks.length >= limit;

  const stats = {
    total: user.checks.length,
    up: user.checks.filter((c) => c.status === "UP").length,
    down: user.checks.filter((c) => c.status === "DOWN" || c.status === "LATE").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checks</h1>
          <p className="text-muted-foreground mt-1">
            {user.checks.length} / {limit === Infinity ? "∞" : limit} checks used
          </p>
        </div>
        <NewCheckButton disabled={atLimit} />
      </div>

      {atLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            You&apos;ve reached the limit for your {user.plan} plan.
          </p>
          <Link href="/dashboard/billing">
            <Button size="sm" variant="outline">Upgrade</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total checks</p>
          <p className="text-3xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Healthy</p>
          <p className="text-3xl font-bold mt-1 text-green-600">{stats.up}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Issues</p>
          <p className="text-3xl font-bold mt-1 text-red-600">{stats.down}</p>
        </div>
      </div>

      {user.checks.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <h3 className="text-lg font-medium">No checks yet</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Create your first check to start monitoring your cron jobs.
          </p>
          <NewCheckButton />
        </div>
      ) : (
        <CheckList checks={user.checks} />
      )}
    </div>
  );
}
