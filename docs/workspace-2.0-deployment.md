# Workspace 2.0 deployment gate

Workspace 2.0 is opt-in. The production site keeps the legacy Workspace and form paths unless `VITE_WORKSPACE_V2_ENABLED=true` is explicitly configured and a new build is deployed.

Development is local-only. Do not use the InvoicXEasy VM/EC2, Docker, a remote development host or the production Supabase project. Workspace 2.0 uses the dedicated `VITE_WORKSPACE_V2_SUPABASE_URL` and `VITE_WORKSPACE_V2_SUPABASE_ANON_KEY`; when they are absent its client fails closed.

## Staging sequence

1. Create or identify an isolated Supabase project; never reuse the production project reference.
2. Export and verify a logical backup before any production migration is considered.
3. Apply every migration in timestamp order. The `084500` compatibility migration must run before the original ten-migration chain, and the `110000` legacy CRM import must run last.
4. Run `supabase/tests/001_workspace_2_security.test.sql` against staging.
5. Configure staging-only `SUPABASE_SERVICE_ROLE_KEY`, `INTAKE_HASH_SECRET`, `INTAKE_ALLOWED_ORIGINS`, `OUTBOX_WORKER_SECRET` and Resend test credentials.
6. Configure the isolated public client variables `VITE_WORKSPACE_V2_SUPABASE_URL` and `VITE_WORKSPACE_V2_SUPABASE_ANON_KEY`.
7. Enable `VITE_WORKSPACE_V2_ENABLED=true` only in the staging build.
8. Run the form, authorization, booking, payment, refund, consent and unsubscribe acceptance checks with synthetic data.
9. Verify rollback in staging using `supabase/rollbacks/20261124_workspace_2_rollback.sql`.

## Production approval gate

Separate explicit approval is required to: apply any production migration; change Vercel or Supabase secrets; set `WORKSPACE_V2_PRODUCTION_APPROVED=true`; enable the feature flag; schedule the outbox worker; send transactional test email; merge, push or deploy.

The compatibility migrations do not delete or update the legacy `leads` or `luxury_applications` rows. They map each source row once through the unique `(source_table, source_id)` key, preserve source timestamps/statuses/notes, and deduplicate CRM customers by normalized contact points. Existing `profiles` rows and administrator roles remain in place; the legacy required email is populated from `auth.users` for future profile inserts.

## Production release configuration

Keep these gates during migration and the initial deployment:

```dotenv
VITE_WORKSPACE_V2_ENABLED=false
VITE_WORKSPACE_V2_INTAKE_ENABLED=false
WORKSPACE_V2_PRODUCTION_APPROVED=false
MARKETING_DISPATCH_ENABLED=false
EMAIL_DELIVERY_ENABLED=false
INTAKE_REQUIRE_CAPTCHA=true
```

Do not configure a live payment processor or processor webhook. Workspace financial entries remain manual records only; no payment-card data is accepted or stored.

Production intake fails closed while `INTAKE_REQUIRE_CAPTCHA=true` and `TURNSTILE_SECRET_KEY` is absent. Do not activate Workspace V2 intake until a valid production Turnstile secret is configured, or a separate security decision explicitly approves another anti-abuse control.

The legacy Workspace remains active while `VITE_WORKSPACE_V2_ENABLED=false`. Public forms remain on their legacy handlers while `VITE_WORKSPACE_V2_INTAKE_ENABLED=false`, even after the internal Workspace V2 is activated. Apply database migrations before changing either flag. Workspace activation requires a separate approved build and a successful login by an existing production administrator. Intake activation requires its own anti-abuse readiness check.

Transactional delivery is independent of bulk marketing. After separate approval and configuration of `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `APPLICATION_TO_EMAIL` and `OUTBOX_WORKER_SECRET`, an authenticated scheduler must `POST /api/process-email-outbox` with `Authorization: Bearer <OUTBOX_WORKER_SECRET>`. Then, and only then, set `EMAIL_DELIVERY_ENABLED=true`; leave `MARKETING_DISPATCH_ENABLED=false`.

Production uses the Supabase-managed `pg_cron` and `pg_net` extensions. The active job is named `workspace-outbox-every-minute`, runs once per minute, and reads its bearer token dynamically from the Vault secret `workspace_outbox_worker_secret`; the secret must never be embedded in `cron.job` or source control.

The SQL rollback file is destructive and staging-only. Production rollback is: leave/revert the Workspace feature flag to false, keep legacy tables and authentication online, and use a reviewed corrective migration or the verified logical backup. Never run the staging rollback against production.
