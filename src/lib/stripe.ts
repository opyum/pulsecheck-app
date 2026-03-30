import Stripe from "stripe";

// Lazy singleton — avoids throwing at build time when env vars are absent
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() for tree-shaking friendliness */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const PLANS = {
  INDIE: {
    name: "Indie",
    priceId: process.env.STRIPE_INDIE_PRICE_ID!,
    price: 9,
    checks: 20,
    features: ["20 checks", "Email + Slack alerts", "30-day history", "Status badges"],
  },
  TEAM: {
    name: "Team",
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    price: 29,
    checks: Infinity,
    features: [
      "Unlimited checks",
      "All alert channels",
      "30-day history",
      "Status badges",
      "Team members (coming soon)",
    ],
  },
} as const;

export async function createCheckoutSession({
  userId,
  email,
  priceId,
  customerId,
}: {
  userId: string;
  email: string;
  priceId: string;
  customerId?: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : email,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/dashboard/billing?cancelled=true`,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
  });

  return session;
}

export async function createPortalSession(customerId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard/billing`,
  });

  return session;
}
