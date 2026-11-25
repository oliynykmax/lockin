# lockin

Task timer with two modes: countdown to deadline, or lock-in to track time spent.

## what it does

- **Countdown** — shows time remaining until your next deadline
- **Lock-in** — count-up timer that tracks how long you've been working on a task; persists across sessions
- Subtasks, reordering, overdue alerts
- Dark mode
- Everything in local storage, no account needed

## dev

```bash
bun install
bun run dev    # builds with Bun, then runs wrangler dev
bun fmt && bun lint && bun check
```

## deploy your own

You need a Cloudflare account and Bun.

```bash
bun install
bunx wrangler login
bunx wrangler secret put BETTER_AUTH_SECRET     # openssl rand -base64 32
bun run deploy:fresh
```

`deploy:fresh` builds the app, deploys the Worker (Wrangler creates the `lockin-db` D1 database) and applies the migrations. The app is then at `https://lockin.<your-subdomain>.workers.dev`. Set `BETTER_AUTH_URL` to that address on later deploys with `bunx wrangler deploy --var BETTER_AUTH_URL:https://...`, and add Google or GitHub sign-in as described in `ENVIRONMENT_SETUP.md`. Later deploys use `bun run deploy`. Do not run `deploy:fresh` against an existing database whose schema was applied without Wrangler migrations.

To deploy from GitHub Actions on every push to `main`, configure the `production` environment as described at the top of `.github/workflows/deploy.yml`. Every setting is in `.env.example`.

## stack

React · Tailwind · Radix · Bun · Cloudflare Workers · D1 · Better Auth
