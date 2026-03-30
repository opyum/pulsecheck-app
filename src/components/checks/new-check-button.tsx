"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

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

export function NewCheckButton({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    };

    const res = await fetch("/api/checks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Something went wrong");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} disabled={disabled}>
        <Plus className="h-4 w-4 mr-2" />
        New check
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">New check</h2>
          <button onClick={() => setOpen(false)}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Daily backup" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Expected interval</Label>
            <select
              id="interval"
              name="interval"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={3600}
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
              defaultValue={300}
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
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="alertEmail"
              name="alertEmail"
              defaultChecked
              className="h-4 w-4"
            />
            <Label htmlFor="alertEmail">Send email alerts</Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create check"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
