# lockin

Task timer for students. Add tasks with deadlines, watch the countdown, check them off.

**→ [lockin-dob.pages.dev](https://lockin-dob.pages.dev)**

## what it does

- Countdown timers down to the second — hero timer at the top for your most urgent task
- Subtasks within each task
- Reorder tasks with up/down arrows
- Circle checkbox with completion animation
- Overdue tasks count up and pulse red
- Dark mode toggle
- Everything saved in localStorage — no account needed

## run locally

```bash
bun install
bun run dev
```

## deploy

```bash
bun run deploy
```

Pushes to Cloudflare Pages via Wrangler.

## stack

Vanilla HTML/CSS/JS. No framework. Fonts from [Fontshare](https://fontshare.com). Static files in `public/`.
