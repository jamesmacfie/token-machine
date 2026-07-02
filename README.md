# 💸 Token Machine

How many LLM tokens is your salary worth? Enter a salary in any currency, pick
an input/output token mix, and see how many tokens each model would buy —
ranked. Prices and FX are fetched live in the browser.

Built with TanStack Start + React 19 + Tailwind, deployed to Cloudflare Workers.

## Data sources

- **Model prices** — [models.dev](https://models.dev) (CORS-open, no key). USD per 1M input/output tokens.
- **FX rates** — [open.er-api.com](https://open.er-api.com) (CORS-open, no key). Falls back to USD-only if unavailable.

Both are fetched client-side. Nothing is stored server-side.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # vitest
pnpm build      # production build
```

## Layout

- `src/routes/index.tsx` — the whole UI.
- `src/lib/pricing.ts` — model list + `tokensFor()`, the token math.
- `src/lib/fx.ts` — currency conversion.

## Deploy

```bash
pnpm deploy     # build + wrangler deploy
```

Bindings and vars live in `wrangler.jsonc`. Set secrets with `wrangler secret put <NAME>`.

---

For fun, not financial advice.
