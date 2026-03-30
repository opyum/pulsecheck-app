"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import type { Check } from "@prisma/client";

const INTERVAL_OPTIONS = [
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "15 minutes", value: 900 },
  { label: "30 minutes", value: 1800 },
  { label: "1 hour", value: 3600 },
  { label: "6 hours", value: 21600 },
  { label: "12 hours", value: 43200 },
  { label: "1 day", value: 86400 },
];

export function EditCheckForm({ check }: { check: Check }) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      interval: parseInt((form.elements.namedItem("interval") as HTMLSelectElement).value),
      gracePeriod: parseInt((form.elements.namedItem("gracePeriod") as HTMLSelectElement).value),
      alertEmail: (form.elements.namedItem("alertEmail") as HTMLInputElement).checked,
      slackWebhookUrl: (form.elements.namedItem("slackWebhookUrl") as HTMLInputElement).value,
      paused: (form.elements.namedItem("paused") as HTMLInputElement).checked,
    };

    const res = await fetch(`/api/checks/${check.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Something went wrong");
      return;
    }

    router.push(`/dashboard/checks/${check.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${check.name}"? This cannot be undone.`)) return;
    setDeleting(true);

    await fetch(`/api/checks/${check.id}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={check.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interval">Expected interval</Label>
        <select
          id="interval"
          name="interval"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue={check.interval}
        >
          {INTERVAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gracePeriod">Grace period</Label>
        <select
          id="gracePeriod"
          name="gracePeriod"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue={check.gracePeriod}
        >
          <option value={0}>None</option>
          <option value={60}>1 minute</option>
          <option value={300}>5 minutes</option>
          <option value={900}>15 minutes</option>
          <option value={1800}>30 minutes</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slackWebhookUrl">Slack webhook URL (optional)</Label>
        <Input
          id="slackWebhookUrl"
          name="slackWebhookUrl"
          type="url"
          defaultValue={check.slackWebhookUrl ?? ""}
          placeholder="https://hooks.slack.com/services/..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="alertEmail"
          name="alertEmail"
          defaultChecked={check.alertEmail}
          className="h-4 w-4"
        />
        <Label htmlFor="alertEmail">Send email alerts</Label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="paused"
          name="paused"
          defaultChecked={check.paused}
          className="h-4 w-4"
        />
        <Label htmlFor="paused">Pause this check</Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <div className="pt-4 border-t">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
          className="w-full"
        >
          {deleting ? "Deleting..." : "Delete check"}
        </Button>
      </div>
    </form>
  );
}
