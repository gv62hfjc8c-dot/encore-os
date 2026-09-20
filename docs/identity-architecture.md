# Identity and multi-tenant foundation

## Repository audit — 19 September 2026

Baseline: `main` at `9f3037f`. Unlike the older Desktop snapshot audited in August, GitHub already contains Supabase clients, authentication, six migrations and identity helpers. The root still mounts the mock shell without an identity gate; there is no OrganizationProvider or onboarding route. The existing create_organization RPC is SECURITY INVOKER while inserts have no RLS policy, so ordinary authenticated users cannot create organizations. Membership UPDATE privileges are too broad; removal of the last administrator is unprotected. No automated tests existed.

## Preserved domain decisions

Person is global, separate from auth.users, and can exist without an Organization. Organization has an intentionally flexible name and no Band requirement. organization_memberships is the independent relationship, unique by person/organization, with one enum value (`member` or `freelancer`) and an independent `is_admin` boolean. Multiple administrators are supported, including Freelancer administrators. The creator becomes Member and administrator. No Work, Song, Availability or Conflict entities are added.

## Minimum technical architecture

Keep React/TanStack Start and the existing Supabase foundation: Auth issues/verifies user JWTs; PostgREST provides the backend API; PostgreSQL constraints, RLS and narrowly granted transactional RPCs enforce domain rules. No new server or microservice is needed for this increment. Google OAuth uses Supabase directly. Vite uses explicit upstream plugins and Nitro's portable Node output, independent of Lovable's build preset. Existing optional Lovable/MCP adapters are preserved and are not used for identity authorization.

All migrations are additive. The auth trigger creates Person and the new migration backfills existing auth users. Person rows remain private to their owner. Only first_name/last_name are directly updatable. Organization names are updatable by administrators only. Direct membership writes are revoked. Administrative RPCs lock the Organization row, recheck current membership, and prevent removal/demotion of its final administrator.

A selected Organization is request context, not authority. Each organizational request captures `x-organization-id` using PostgREST's per-request setHeader. RLS resolves the JWT's Person and verifies membership before honoring that header. Missing, malformed, foreign and revoked contexts fail closed. A member of A and B selects one per request. No shared mutable header or connection/session variable persists across requests. PostgREST supplies transaction-local request headers. Supabase realtime/storage are not used here; future modules must implement their own equivalent policies.

Global exceptions are explicit: self-Person access, discovery of one's organizations, organization creation, and invitation acceptance. Discovery returns only the caller's own memberships. These operations do not need an active tenant. Identity is never inferred from a submitted Person ID, browser admin flag, or organization preference.

Invitations are addressed to a normalized email; acceptance requires the matching confirmed email from auth.users (not editable metadata). Tokens contain two random UUIDs, only SHA-256 digests are stored, expire after 7 days, and are accepted under a row lock. Acceptance consumes a token and inserts one relationship atomically; it never overwrites an existing membership. Only current administrators in the active organization can issue/revoke invitations. Delivery is manual in this increment: the UI displays a code once, with no automatic email sending. An administrator may create a replacement code if needed.

The browser persists a validated selection under a key scoped to the auth user; an explicit empty value denotes personal mode. Query caches and tenant component state are discarded when changing identity/context. Request generations discard late responses after auth changes. Every database operation still independently authorizes the request, including after membership revocation. UI refresh reloads membership and administrator flags.

## Scope and deployment

Operational prototype routes remain demonstrators and display an explicit notice. Their mock content is not protected tenant data and does not become real backend data in this increment. `/definicoes` uses the new organization settings; original prototype code remains in the repository as reference. Optional MCP adapters remain legacy integrations; they are not the identity API and are outside the validated tenant workflow.

No hosted database, production account or main branch is modified by this work. Applying migrations to a hosted Supabase project is a deployment step. Configure email confirmation, SMTP, allowed redirect URLs, Google provider credentials (if desired), and API keys in that deployment. Never expose a secret/service-role key as VITE_ configuration. Built-in Supabase Auth owns session refresh/revocation and authentication rate limits.

Local tests run all migrations unchanged in PGlite PostgreSQL, supplying only the Supabase auth.users/auth.uid contract. They exercise grants, constraints, RLS, RPCs, invitations, and revoked contexts. React tests cover selection, cache cleanup, logout races and onboarding. CI also starts real Supabase and tests Auth/PostgREST/RLS together over HTTP. PGlite is single-connection and does not prove concurrent transaction behavior; CI's HTTP checks validate the deployed API contract, concurrent invitation acceptance and concurrent administrator demotion. The row-lock ordering is documented above; concurrency coverage should be expanded before adding new administrative workflows.

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [database functions](https://supabase.com/docs/guides/database/functions), [TanStack hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting).
