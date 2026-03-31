import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Docs — PulseCheck Integration Guide",
  description:
    "Learn how to integrate PulseCheck into your cron jobs and background tasks. Examples in curl, Node.js, Python, and Go.",
};

const PING_URL = "https://pulsecheck-app-ivory.vercel.app/api/ping/YOUR-SLUG";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">PulseCheck</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link href="/register" className="font-medium text-primary hover:underline">Get started free →</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Integration Guide</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Add PulseCheck to any cron job in under 2 minutes. Every language that can make an HTTP request works.
        </p>

        {/* Quick start */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Quick start</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-6">
            <li>
              <Link href="/register" className="text-primary hover:underline font-medium">Create a free account</Link>
              {" "}and add a new check from your dashboard.
            </li>
            <li>Copy your unique ping URL — it looks like <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">/api/ping/your-slug</code>.</li>
            <li>Append a ping call to the end of your cron job (see examples below).</li>
            <li>{"That's it. PulseCheck alerts you if the ping stops arriving."}</li>
          </ol>

          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <p className="text-gray-400 text-xs mb-3 font-mono uppercase tracking-wider">Your ping URL</p>
            <code className="font-mono text-green-400 text-sm break-all">{PING_URL}</code>
            <p className="text-gray-400 text-xs mt-3">Replace <span className="text-yellow-400">YOUR-SLUG</span> with the slug shown in your dashboard.</p>
          </div>
        </section>

        {/* curl */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-2">curl</h2>
          <p className="text-muted-foreground mb-4">The simplest integration — works in any shell script or crontab.</p>
          <div className="bg-gray-900 rounded-xl p-6 text-white space-y-4">
            <div>
              <p className="text-gray-400 text-xs mb-2 font-mono">crontab -e</p>
              <code className="font-mono text-green-400 text-sm block">
                {`# Run backup hourly, then ping PulseCheck
0 * * * * /path/to/backup.sh && curl -fsS -m 10 ${PING_URL}`}
              </code>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-2 font-mono">With start/fail tracking (optional)</p>
              <code className="font-mono text-green-400 text-sm block whitespace-pre">
                {`0 * * * * curl -fsS ${PING_URL}/start \\
  && /path/to/backup.sh \\
  && curl -fsS ${PING_URL} \\
  || curl -fsS ${PING_URL}/fail`}
              </code>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <code className="bg-gray-100 px-1 rounded">-fsS</code> suppresses output but still fails on HTTP errors.{" "}
            <code className="bg-gray-100 px-1 rounded">-m 10</code> adds a 10-second timeout so a slow ping never blocks your job.
          </p>
        </section>

        {/* Node.js */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-2">Node.js</h2>
          <p className="text-muted-foreground mb-4">Works with any scheduler — node-cron, Bull, BullMQ, Agenda, etc.</p>
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <p className="text-gray-400 text-xs mb-3 font-mono">node-cron example</p>
            <code className="font-mono text-green-400 text-sm block whitespace-pre">
              {`import cron from "node-cron";

const PING_URL = "${PING_URL}";

cron.schedule("0 * * * *", async () => {
  try {
    await fetch(\`\${PING_URL}/start\`);
    await runBackup();
    await fetch(PING_URL); // success ping
  } catch (err) {
    await fetch(\`\${PING_URL}/fail\`);
    console.error("Backup failed:", err);
  }
});`}
            </code>
          </div>
        </section>

        {/* Python */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-2">Python</h2>
          <p className="text-muted-foreground mb-4">Works with APScheduler, Celery beat, or plain cron calling a Python script.</p>
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <p className="text-gray-400 text-xs mb-3 font-mono">requests example</p>
            <code className="font-mono text-green-400 text-sm block whitespace-pre">
              {`import requests

PING_URL = "${PING_URL}"

def run_job():
    try:
        requests.get(PING_URL + "/start", timeout=10)
        # ... your job logic here ...
        do_backup()
        requests.get(PING_URL, timeout=10)  # success
    except Exception as e:
        requests.get(PING_URL + "/fail", timeout=10)
        raise

if __name__ == "__main__":
    run_job()`}
            </code>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Use <code className="bg-gray-100 px-1 rounded">timeout=10</code> so a slow network never hangs your job.
          </p>
        </section>

        {/* Go */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-2">Go</h2>
          <p className="text-muted-foreground mb-4">{"Drop this helper anywhere in your worker or service."}</p>
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <p className="text-gray-400 text-xs mb-3 font-mono">net/http example</p>
            <code className="font-mono text-green-400 text-sm block whitespace-pre">
              {`package main

import (
	"log"
	"net/http"
	"time"
)

const pingURL = "${PING_URL}"

func ping(suffix string) {
	client := &http.Client{Timeout: 10 * time.Second}
	_, err := client.Get(pingURL + suffix)
	if err != nil {
		log.Printf("pulsecheck ping failed: %v", err)
	}
}

func runJob() error {
	ping("/start")
	if err := doBackup(); err != nil {
		ping("/fail")
		return err
	}
	ping("") // success
	return nil
}`}
            </code>
          </div>
        </section>

        {/* Ping types */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Ping endpoints</h2>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Endpoint</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { ep: "/api/ping/YOUR-SLUG", desc: "Job ran successfully. Resets the missed-check timer." },
                  { ep: "/api/ping/YOUR-SLUG/start", desc: "Job started. Begins duration tracking." },
                  { ep: "/api/ping/YOUR-SLUG/fail", desc: "Job failed explicitly. Triggers an alert immediately." },
                ].map((row) => (
                  <tr key={row.ep}>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{row.ep}</td>
                    <td className="px-4 py-3 text-gray-600">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            All endpoints accept GET and POST. They return <code className="bg-gray-100 px-1 rounded">200 OK</code> on success.
          </p>
        </section>


        {/* REST API */}
        <section id="api" className="mb-12">
          <h2 className="text-2xl font-bold mb-2">REST API</h2>
          <p className="text-muted-foreground mb-4">
            Manage checks programmatically. Create an API key from your{" "}
            <a href="/dashboard/keys" className="text-primary underline">dashboard</a>.
          </p>

          <h3 className="text-lg font-semibold mb-3">Authentication</h3>
          <div className="bg-gray-900 rounded-xl p-6 text-white mb-6">
            <code className="font-mono text-sm text-green-400">
              Authorization: Bearer pc_live_&lt;your-key&gt;
            </code>
          </div>

          <h3 className="text-lg font-semibold mb-3">Endpoints</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Method</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Endpoint</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { method: "GET", ep: "/api/v1/checks", desc: "List all your checks" },
                  { method: "POST", ep: "/api/v1/checks", desc: "Create a new check" },
                  { method: "GET", ep: "/api/v1/checks/:id", desc: "Get check details + event history" },
                  { method: "PATCH", ep: "/api/v1/checks/:id", desc: "Update check name, interval, grace period" },
                  { method: "DELETE", ep: "/api/v1/checks/:id", desc: "Delete a check permanently" },
                  { method: "POST", ep: "/api/v1/checks/:id/pause", desc: "Pause alerting for this check" },
                  { method: "POST", ep: "/api/v1/checks/:id/resume", desc: "Resume a paused check" },
                ].map((row) => (
                  <tr key={row.ep}>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{row.method}</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{row.ep}</td>
                    <td className="px-4 py-3 text-gray-600">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mb-3">Example: create a check</h3>
          <div className="bg-gray-900 rounded-xl p-6 text-white space-y-1 font-mono text-sm">
            <p className="text-gray-400"># Create a check (interval=3600s, grace=300s)</p>
            <p className="text-green-400">curl -X POST https://pulsecheck-app-ivory.vercel.app/api/v1/checks \</p>
            <p className="text-green-400 ml-4">-H <span className="text-yellow-300">&quot;Authorization: Bearer pc_live_...&quot;</span> \</p>
            <p className="text-green-400 ml-4">-H <span className="text-yellow-300">&quot;Content-Type: application/json&quot;</span> \</p>
            <p className="text-green-400 ml-4">-d <span className="text-yellow-300">&apos;&#123;&quot;name&quot;:&quot;Daily backup&quot;,&quot;interval&quot;:3600,&quot;gracePeriod&quot;:300&#125;&apos;</span></p>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Rate limits: Free plan 100 req/min · Paid plans 1000 req/min. Limits are returned in{" "}
            <code className="bg-gray-100 px-1 rounded">X-RateLimit-Limit</code> and{" "}
            <code className="bg-gray-100 px-1 rounded">X-RateLimit-Remaining</code> headers.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to start monitoring?</h2>
          <p className="text-muted-foreground mb-6">Free forever. No credit card. 3 checks included.</p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Create free account
          </Link>
        </section>
      </div>
    </div>
  );
}
