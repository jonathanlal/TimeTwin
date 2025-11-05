
# TimeTwin — Agent Setup Runbook

## Prereqs
- Node 20, pnpm 9, git, gh CLI
- Supabase CLI
- Expo CLI + EAS CLI
- Android SDK and/or Xcode (optional for local builds)

## Steps
1. Install deps: `pnpm install`
2. Create Supabase project(s) and set GitHub secrets.
3. Apply DB: `supabase db push --db-url $SUPABASE_DB_URL_PROD` using `infra/supabase/migrations/0001_init.sql`.
4. Configure `apps/mobile/app.json` `updates.url` with the Expo project ID (u.expo.dev).
5. Set up EAS channels: dev, preview, production.
6. Enable GitHub Actions and verify pipelines on a test commit.
