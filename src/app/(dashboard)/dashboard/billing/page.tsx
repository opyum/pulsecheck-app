import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BillingActions } from "@/components/billing/billing-actions";
import { Check } from "lucide-react";

// Re-export PLANS to avoid importing stripe on client
const PLAN_INFO = {
  FREE: { name: "Free", price: 0, checks: 3, features: ["3 checks", "Email alerts"] },
  INDIE: { ...PLANS.INDIE, checks: 20 },
  TEAM: { ...PLANS.TEAM, checks: "Unlimited" },
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; cancelled?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Current plan: <strong>{user.plan}</strong>
          {user.stripeCurrentPeriodEnd && (
            <span className="ml-2 text-sm">
              · renews {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString()}
            </span>
          )}
        </p>
      </div>

      {params.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          Subscription activated. Thank you!
        </div>
      )}
      {params.cancelled && (
        <div className="bg-gray-50 border rounded-lg p-4 text-muted-foreground">
          Checkout cancelled.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Free */}
        <Card className={user.plan === "FREE" ? "border-primary border-2" : ""}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {["3 checks", "Email alerts", "30-day history", "Status badges"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
            {user.plan === "FREE" && (
              <div className="text-sm font-medium text-primary">Current plan</div>
            )}
          </CardContent>
        </Card>

        {/* Indie */}
        <Card className={user.plan === "INDIE" ? "border-primary border-2" : ""}>
          <CardHeader>
            <CardTitle>Indie</CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold text-foreground">$9</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {PLANS.INDIE.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
            <BillingActions plan="INDIE" currentPlan={user.plan} hasCustomer={!!user.stripeCustomerId} />
          </CardContent>
        </Card>

        {/* Team */}
        <Card className={user.plan === "TEAM" ? "border-primary border-2" : ""}>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold text-foreground">$29</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {PLANS.TEAM.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
            <BillingActions plan="TEAM" currentPlan={user.plan} hasCustomer={!!user.stripeCustomerId} />
          </CardContent>
        </Card>
      </div>

      {user.stripeCustomerId && (
        <div className="pt-4">
          <BillingActions plan="portal" currentPlan={user.plan} hasCustomer={true} />
        </div>
      )}
    </div>
  );
}
