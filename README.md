# lockin

Task timer with two modes: countdown to deadline, or lock-in to track time spent.

**[lockin-dob.pages.dev](https://lockin-dob.pages.dev)**

## what it does

- **Countdown** — shows time remaining until your next deadline
- **Lock-in** — count-up timer that tracks how long you've been working on a task; persists across sessions
- Subtasks, reordering, overdue alerts
- Dark mode
- Everything in local storage, no account needed

## dev

```bash
bun install
bun run dev
```

## deploy

```bash
bun run deploy
```

Cloudflare Pages via Wrangler. Auto-deploys on commit.

## stack

React · Vite · Tailwind · Radix · Bun
