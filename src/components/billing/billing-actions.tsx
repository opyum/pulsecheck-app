"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Plan = "FREE" | "INDIE" | "TEAM";

export function BillingActions({
  plan,
  currentPlan,
  hasCustomer,
}: {
  plan: "INDIE" | "TEAM" | "portal";
  currentPlan: Plan;
  hasCustomer: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  }

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  if (plan === "portal") {
    return (
      <Button variant="outline" onClick={handlePortal} disabled={loading}>
        {loading ? "Loading..." : "Manage subscription"}
      </Button>
    );
  }

  if (currentPlan === plan) {
    return <div className="text-sm font-medium text-primary">Current plan</div>;
  }

  if (currentPlan !== "FREE" && hasCustomer) {
    return (
      <Button variant="outline" onClick={handlePortal} disabled={loading}>
        {loading ? "Loading..." : currentPlan === "INDIE" && plan === "TEAM" ? "Upgrade" : "Change plan"}
      </Button>
    );
  }

  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? "Loading..." : "Get started"}
    </Button>
  );
}
