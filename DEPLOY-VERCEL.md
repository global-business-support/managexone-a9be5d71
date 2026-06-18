# Deploy to Vercel

## Steps

1. Push code to GitHub (via Lovable → GitHub connect).
2. On https://vercel.com → **Add New Project** → import the repo.
3. Vercel auto-detects `vercel.json`. Leave Framework Preset = **Other**.
4. **Build Command** (already set in vercel.json): `vite build --config vite.vercel.config.ts`
5. **Output Directory**: leave EMPTY (TanStack Start writes to `.vercel/output` which Vercel auto-detects).
6. **Install Command** (already set): `bun install`

## Environment Variables (REQUIRED — add in Vercel → Settings → Environment Variables)

Copy these from your local `.env` file:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # if used
LOVABLE_API_KEY=...             # if used
```

Add for **Production**, **Preview**, and **Development**.

## Deploy

Click **Deploy**. First build takes ~2 min. Future pushes auto-deploy.

## Why 404 was happening

Your project was originally built for Cloudflare Workers (`wrangler.jsonc`). Vercel cannot run that output. The new `vite.vercel.config.ts` + `vercel.json` tells Vite to build for Vercel's serverless runtime instead.

## Lovable preview still works

The original `vite.config.ts` (Cloudflare) is untouched — Lovable's live preview & publish flow continues to work as before. Vercel uses the new config only.
