
# TimeTwin — Monorepo

Cross‑platform app (React Native / Expo) + Supabase backend. This repo is a **scaffold** matching the spec we discussed.

## Quick start

```bash
# prerequisites: node 20, pnpm 9, gh, supabase cli, eas-cli
pnpm install
pnpm -w run prepare

# run mobile (Expo)
cd apps/mobile
pnpm start
```

## Structure
```
apps/
  mobile/        # Expo app (iOS/Android/Web)
  web/           # (optional) marketing/docs (placeholder)
packages/
  ui/            # shared UI components (placeholder)
  theme/         # tokens/theme (placeholder)
  config/        # eslint/tsconfig/prettier shared configs
  api-sdk/       # Supabase typed helpers (placeholder)
infra/
  supabase/      # migrations, policies, rpc, views
  eas/           # EAS profiles
.github/
  workflows/     # CI/CD pipelines
tooling/
  scripts/       # helper scripts
  agents/        # runbooks for AI agents
```

## Environments & Secrets (GitHub)
- SUPABASE_DB_URL_PROD
- SUPABASE_SERVICE_ROLE_KEY_PROD
- SUPABASE_ANON_KEY_PROD
- EAS_TOKEN
- APPLE_APP_SPECIFIC_PASSWORD
- APPLE_TEAM_ID
- GOOGLE_SERVICE_ACCOUNT_JSON
- (optional for web) VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID

See `.github/workflows/*.yml` and `tooling/agents/SETUP_RUNBOOK.md`.
