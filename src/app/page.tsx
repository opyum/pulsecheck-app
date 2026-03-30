import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, Bell, Clock, Zap, CheckCircle } from "lucide-react";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PulseCheck",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Cron job and background job monitoring. Get alerted within 60 seconds when a scheduled job fails to run.",
  url: "https://pulsecheck-app-ivory.vercel.app",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">PulseCheck</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">
              Docs
            </Link>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link href="/register">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium mb-8">
          <Zap className="h-3.5 w-3.5" />
          Dead-simple cron job monitoring
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Your cron jobs are{" "}
          <span className="text-primary">silently failing.</span>
          <br />
          Know before your users do.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          PulseCheck alerts you when scheduled jobs fail to run on time. Add one curl command to your job. Done.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-base px-8">
              Start monitoring free
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline" className="text-base px-8">
              See how it works
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Free forever · No credit card</p>
      </section>

      {/* Code snippet */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-xl p-6 text-white">
          <p className="text-gray-400 text-xs mb-3 font-mono">Add to your cron job:</p>
          <code className="font-mono text-green-400 text-sm block">
            {`0 * * * * /path/to/backup.sh && curl https://pulsecheck.dev/api/ping/your-slug`}
          </code>
          <p className="text-gray-400 text-xs mt-3 font-mono">That&apos;s it. Get alerted if it stops running.</p>
        </div>
      </section>

      {/* Social proof */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-center text-sm text-muted-foreground mb-10 uppercase tracking-widest font-medium">
          Trusted by developers monitoring their cron jobs
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              quote: "Finally stopped getting support tickets about 'nothing happened' — PulseCheck caught 3 silent failures in the first week.",
              author: "Backend engineer, SaaS startup",
            },
            {
              quote: "Healthchecks.io worked but felt dated. PulseCheck has a cleaner dashboard and the free tier is genuinely useful.",
              author: "Indie developer",
            },
            {
              quote: "Setup took 2 minutes. Added the curl line to our nightly ETL and it just works. Dead simple.",
              author: "Data engineer, e-commerce",
            },
          ].map((t) => (
            <div key={t.author} className="bg-gray-50 rounded-xl p-6 border">
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-xs text-muted-foreground font-medium">— {t.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
        <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
          Three steps to protect your cron jobs from silent failures.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Create a check",
              desc: "Name your job, set the expected interval (every 5 min, hourly, daily), and a grace period.",
              icon: Clock,
            },
            {
              step: "2",
              title: "Add one line to your job",
              desc: "Append a curl command to your cron job. PulseCheck receives the ping and resets the clock.",
              icon: Zap,
            },
            {
              step: "3",
              title: "Get alerted when it misses",
              desc: "If the ping doesn't arrive on time, you'll get an email (and Slack) within 60 seconds.",
              icon: Bell,
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Everything you need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Email + Slack alerts", desc: "Get notified where you work, within 60 seconds of a missed ping." },
              { title: "Start/fail pings", desc: "Track job duration. Ping /start before and /ping after for full visibility." },
              { title: "Uptime dashboard", desc: "See check history, last ping time, and 30-day uptime percentage at a glance." },
              { title: "SVG status badges", desc: "Embed a live status badge in your GitHub README. One line of Markdown." },
              { title: "Any stack, any language", desc: "If it can make an HTTP request, it works. curl, fetch, axios — your choice." },
              { title: "60-second resolution", desc: "Missed checks are detected within 60 seconds, not 5 minutes." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border">
                <CheckCircle className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-muted-foreground text-center mb-16">Start free. Upgrade when you need more.</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              name: "Free",
              price: "$0",
              desc: "For personal projects",
              features: ["3 checks", "Email alerts", "30-day history"],
              cta: "Get started",
              href: "/register",
              highlight: false,
            },
            {
              name: "Indie",
              price: "$9",
              desc: "For indie devs",
              features: ["20 checks", "Email + Slack", "30-day history", "Status badges"],
              cta: "Get started",
              href: "/register",
              highlight: true,
            },
            {
              name: "Team",
              price: "$29",
              desc: "For teams",
              features: ["Unlimited checks", "All alert channels", "30-day history", "Status badges"],
              cta: "Get started",
              href: "/register",
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-8 ${plan.highlight ? "border-primary border-2 relative" : ""}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <h3 className="font-bold text-xl">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">{plan.desc}</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "$0" && <span className="text-muted-foreground">/month</span>}
              </div>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stop finding out from users</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Your next cron failure is coming. Be the first to know.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-base px-8">
              Start monitoring free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-medium">PulseCheck</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <p>© {new Date().getFullYear()} PulseCheck</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
