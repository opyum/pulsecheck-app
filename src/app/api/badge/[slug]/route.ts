import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUS_COLORS: Record<string, string> = {
  UP: "#16a34a",
  LATE: "#d97706",
  DOWN: "#dc2626",
  PAUSED: "#6b7280",
  NEW: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  UP: "up",
  LATE: "late",
  DOWN: "down",
  PAUSED: "paused",
  NEW: "pending",
};

function buildSvg(label: string, status: string, color: string): string {
  const labelWidth = label.length * 7 + 10;
  const statusText = STATUS_LABELS[status] ?? "unknown";
  const statusWidth = statusText.length * 7 + 10;
  const totalWidth = labelWidth + statusWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${statusWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + statusWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${statusText}</text>
    <text x="${labelWidth + statusWidth / 2}" y="14">${statusText}</text>
  </g>
</svg>`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const check = await prisma.check.findUnique({
    where: { slug },
    select: { name: true, status: true },
  });

  const label = "pulsecheck";
  const status = check?.status ?? "NEW";
  const color = STATUS_COLORS[status] ?? "#6b7280";

  const svg = buildSvg(label, status, color);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
