# SmartHire AI — Vercel Deploy Guide

## Deploy (recommended)

1. Push code to GitHub (already done if you pushed recently)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import **Bavyaece/SmartHireAI**
4. Framework Preset: **Other**
5. Click **Deploy**

Or from terminal (after `npx vercel login`):

```bash
npx vercel --prod
```

## What gets deployed

| Part | How |
|------|-----|
| Frontend (`index.html`, CSS, JS) | Vercel static CDN |
| Backend (`/api/*`) | Vercel Python serverless (`api/index.py`) |

Live URL will look like:
`https://smarthireai.vercel.app`

## Notes

- First PDF analysis on Vercel can be slow (cold start + OCR)
- Hobby plan function timeout is limited — scanned OCR may need a few retries
- SQLite on Vercel is ephemeral (`/tmp`) — fine for demo; use Postgres for production persistence

## Local still works

```bash
start.bat
# → http://localhost:8000
```
