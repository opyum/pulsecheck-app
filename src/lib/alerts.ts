import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import type { Check, User } from "@prisma/client";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = () => process.env.RESEND_FROM_EMAIL ?? "PulseCheck <alerts@pulsecheck.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsecheck.dev";

export async function sendMissedCheckAlerts(check: Check & { user: User }) {
  const promises: Promise<void>[] = [];

  if (check.alertEmail && check.user.email) {
    promises.push(sendEmailAlert(check, check.user.email));
  }

  if (check.slackWebhookUrl) {
    promises.push(sendSlackAlert(check, check.slackWebhookUrl));
  }

  await Promise.allSettled(promises);
}

async function sendEmailAlert(check: Check, email: string) {
  try {
    await getResend().emails.send({
      from: FROM(),
      to: email,
      subject: `[PulseCheck] "${check.name}" missed its scheduled ping`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Check missed: ${check.name}</h2>
          <p>Your check <strong>${check.name}</strong> has not pinged in over ${Math.floor(check.interval / 60)} minutes (+ ${Math.floor(check.gracePeriod / 60)}m grace).</p>
          <p><a href="${APP_URL}/dashboard" style="background:#7c3aed;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">View Dashboard</a></p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">
            Ping URL: <code>${APP_URL}/ping/${check.slug}</code><br/>
            Manage alerts in your <a href="${APP_URL}/dashboard/checks/${check.id}/edit">check settings</a>.
          </p>
        </div>
      `,
    });

    await prisma.alert.create({
      data: { checkId: check.id, channel: "EMAIL", status: "SENT" },
    });
  } catch (error) {
    await prisma.alert.create({
      data: {
        checkId: check.id,
        channel: "EMAIL",
        status: "FAILED",
        error: String(error),
      },
    });
  }
}

async function sendSlackAlert(check: Check, webhookUrl: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `*PulseCheck alert*: \`${check.name}\` missed its scheduled ping`,
        attachments: [
          {
            color: "#dc2626",
            fields: [
              { title: "Check", value: check.name, short: true },
              {
                title: "Expected every",
                value: `${Math.floor(check.interval / 60)}m`,
                short: true,
              },
              {
                title: "Dashboard",
                value: `<${APP_URL}/dashboard|View Dashboard>`,
                short: false,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`Slack returned ${response.status}`);

    await prisma.alert.create({
      data: { checkId: check.id, channel: "SLACK", status: "SENT" },
    });
  } catch (error) {
    await prisma.alert.create({
      data: {
        checkId: check.id,
        channel: "SLACK",
        status: "FAILED",
        error: String(error),
      },
    });
  }
}

export async function sendRecoveryAlerts(check: Check & { user: User }) {
  if (check.alertEmail && check.user.email) {
    try {
      await getResend().emails.send({
        from: FROM(),
        to: check.user.email,
        subject: `[PulseCheck] "${check.name}" is back up`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Check recovered: ${check.name}</h2>
            <p>Your check <strong>${check.name}</strong> has pinged again and is back up.</p>
            <p><a href="${APP_URL}/dashboard" style="background:#7c3aed;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">View Dashboard</a></p>
          </div>
        `,
      });
    } catch {
      // Non-critical — recovery email failure silently
    }
  }
}
