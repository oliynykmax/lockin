# lockin

Task timer with two modes: countdown to deadline, or lock-in to track time spent.

**[lockin.oliinyk.dev](https://lockin.oliinyk.dev)**

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

## deploy

```bash
bun run deploy
```

A Cloudflare Worker serves the SPA and the `/api` routes, with D1 for storage. See `ENVIRONMENT_SETUP.md` for secrets.

## stack

React · Tailwind · Radix · Bun · Cloudflare Workers · D1 · Better Auth
