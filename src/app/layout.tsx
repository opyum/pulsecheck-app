import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "https://pulsecheck-app-ivory.vercel.app";

export const metadata: Metadata = {
  title: "PulseCheck — Cron Job & Background Job Monitoring",
  description:
    "Get alerted when your scheduled jobs and cron tasks fail to run on time. Add one curl command. Know in 60 seconds when a job misses.",
  keywords: ["cron monitoring", "job monitoring", "uptime monitoring", "cron alerts", "background job monitoring", "devops", "healthchecks"],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "PulseCheck — Cron Job & Background Job Monitoring",
    description:
      "Add one curl command to your cron job. Get alerted within 60 seconds when it stops running. Free forever, no credit card.",
    url: siteUrl,
    siteName: "PulseCheck",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "PulseCheck — Know when your cron jobs fail",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PulseCheck — Cron Job Monitoring",
    description: "Add one curl command. Get alerted in 60s when a cron job misses.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
