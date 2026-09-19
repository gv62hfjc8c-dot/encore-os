# Encore OS

Multi-tenant foundation for the live-performance ecosystem. React, TypeScript, TanStack Start, Supabase Auth/PostgreSQL/RLS. See [the architecture and audit](docs/identity-architecture.md).

## Local setup

Requires Node 22+, npm, Docker, and Supabase CLI 2.117.0.

```sh
npm ci
supabase start
cp .env.example .env.local
# Copy the local API URL and anon/publishable key from supabase status.
npm run dev
```

Use the existing hosted project only with deliberate configuration; local development is independent of Lovable. Never use a service-role key in frontend configuration. Local signup does not require email confirmation; hosted deployments should enable it. Google login requires a configured Google provider and redirect URLs in Supabase. Email/password login works without Google.

After authentication, `/onboarding` offers Organization creation, invitation acceptance or personal-only use. `/pessoal` is the personal space; `/definicoes` manages the selected Organization. Administrators can issue invitation codes, change membership type, grant/revoke administration and remove relationships. The last administrator cannot be removed. Other operational pages are visibly marked demonstrations.

## Validation

```sh
npm test
npm run build
npm run typecheck
# Against disposable local Supabase only:
node --test tests/integration/supabase.mjs
```

CI runs these checks including a fresh Supabase migration/application test. `npm run lint` also checks inherited prototype files, whose formatting debt predates this increment. Changed foundation files are checked separately during implementation. The npm lockfile is used for reproducible CI; the pre-existing Bun lockfile is retained as a historical artifact and is not the supported installation path.

## Database deployment

New installations apply every migration in order. Existing installations apply only pending migrations, including `20260919230000_identity_foundation.sql`. Do not replay or edit older migrations. Back up the database and validate against a staging project before deploying to production. Organization reads now require `x-organization-id`; update clients together with the migration. Creation and discovery deliberately remain global.

No email is sent by the invitation feature: share its single-use code with the recipient, who accepts using the matching confirmed email. Tokens expire after seven days. Existing MCP/Lovable adapters are preserved, optional legacy functionality; the identity flow and build no longer require the Lovable build preset or authentication broker.
