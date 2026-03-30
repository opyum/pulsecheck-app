# PulseCheck

Dead-simple cron job and background job monitoring. Get alerted when your scheduled tasks fail to run on time.

## How it works

1. Create a check in the dashboard (name, interval, grace period)
2. Add `curl https://your-domain/api/ping/your-slug` to your cron job
3. Get alerted by email (and Slack) within 60 seconds if the ping is missed

## Tech Stack

- **Framework:** Next.js 15 App Router, TypeScript
- **UI:** Tailwind CSS, shadcn/ui components
- **Database:** PostgreSQL (Neon) + Prisma
- **Auth:** NextAuth.js (GitHub OAuth + email/password)
- **Email:** Resend
- **Billing:** Stripe
- **Deploy:** Vercel

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL (or Neon account)
- GitHub OAuth App
- Resend account
- Stripe account

### Setup

1. Clone and install:

```bash
npm install
npx prisma generate
```

2. Copy env and fill in values:

```bash
cp .env.example .env.local
```

3. Push the database schema:

```bash
npm run db:push
```

4. Start dev server:

```bash
npm run dev
```

### Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `DIRECT_URL` | Neon direct (non-pooled) URL |
| `AUTH_SECRET` | Random secret for NextAuth |
| `AUTH_GITHUB_ID` | GitHub OAuth App client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App secret |
| `RESEND_API_KEY` | Resend API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_INDIE_PRICE_ID` | Stripe price ID for Indie plan |
| `STRIPE_TEAM_PRICE_ID` | Stripe price ID for Team plan |
| `CRON_SECRET` | Secret to authenticate Vercel cron calls |

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel, set all env vars
3. Add the Vercel Cron (already in `vercel.json` — runs every minute)
4. Set up Stripe webhook pointing to `https://your-domain.vercel.app/api/stripe/webhook`

## Ping URL Reference

| URL | Method | Description |
|---|---|---|
| `/api/ping/:slug` | GET/POST | Standard ping — job completed |
| `/api/ping/:slug/start` | GET | Job started (for duration tracking) |
| `/api/ping/:slug/fail` | GET | Job failed explicitly |

## Plans

| Plan | Price | Checks | Alerts |
|---|---|---|---|
| Free | $0 | 3 | Email |
| Indie | $9/month | 20 | Email + Slack |
| Team | $29/month | Unlimited | Email + Slack |
