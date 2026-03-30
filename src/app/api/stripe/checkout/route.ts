import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, PLANS } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["INDIE", "TEAM"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { plan } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const priceId = PLANS[plan].priceId;
    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      email: user.email,
      priceId,
      customerId: user.stripeCustomerId ?? undefined,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
