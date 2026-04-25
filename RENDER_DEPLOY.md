# Render (single Web Service) deployment

This repo is set up to run **one Render Web Service** that serves:

- `GET /api/*` → Express API
- `GET /*` → React (Vite) static build + React Router SPA fallback

## Render settings

Create a **Web Service** from this repo (root).

### Build command

```
npm ci && npm run render:build
```

This will:

1. Build the frontend (`frontend`)
2. Copy the built files into `backend/public/app`
3. Build the backend (`backend`)

### Start command

```
npm run render:start
```

This runs the backend without `--env-file`, so Render-provided environment variables are used.

### Environment variables (set in Render)

Keep your existing Supabase/Postgres and app env vars (examples based on `backend/.env`):

- `DATABASE_URL`
- `DATABASE_SSL` (e.g. `require`)
- `SESSION_SECRET`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_ADMIN_NAME`
- `LOG_LEVEL` (optional)
- `USE_DB_SESSION_STORE` (optional)
- `DATABASE_POOL_MAX` (optional)
- `DATABASE_POOL_IDLE_TIMEOUT` (optional)
- `DATABASE_POOL_CONNECTION_TIMEOUT` (optional)
- `SKIP_DB_BOOTSTRAP` (optional)

Notes:

- Render injects `PORT` automatically; the backend already listens on `process.env.PORT`.
- Do not rely on committing `backend/.env` to production; configure env vars in Render instead.
