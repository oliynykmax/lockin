# Environment setup

The app runs as a Cloudflare Worker. The Worker serves the built SPA from `dist/` and handles `/api/*` itself.

## Variables

Pass the public values at deploy time, not in `wrangler.jsonc`: `BETTER_AUTH_URL` (the public origin of the app), `GOOGLE_CLIENT_ID` and `GITHUB_CLIENT_ID`. Use `bunx wrangler deploy --var NAME:VALUE`, or `DEPLOY_VARS` in GitHub Actions.

## Secrets

Set each secret once with Wrangler:

```bash
bunx wrangler secret put BETTER_AUTH_SECRET   # openssl rand -base64 32
bunx wrangler secret put GOOGLE_CLIENT_SECRET
bunx wrangler secret put GITHUB_CLIENT_SECRET
```

## OAuth callback URLs

- Google: `<BETTER_AUTH_URL>/api/auth/callback/google`
- GitHub: `<BETTER_AUTH_URL>/api/auth/callback/github`

A `state_mismatch` error means `BETTER_AUTH_URL` or a callback URL does not match the host you signed in on.

## Local development

Put local values in `.dev.vars`, including `BETTER_AUTH_URL=http://localhost:8787`, then run:

```bash
bunx wrangler d1 migrations apply lockin-db --local
bun run dev
```
