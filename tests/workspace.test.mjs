import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'
import { processIntake } from '../api/_lib/intakeService.js'
import { calculateBookingBalance, canConfirmBooking, getMarketingEligibility, isValidUnsubscribeToken, isWorkspaceAdmin, normalizeSegmentTag, validateIntake } from '../src/lib/workspaceDomain.js'

const carnavalBody = (productCode = 'rio-bahia') => ({
  formType: 'carnaval_enquiry',
  productCode,
  data: {
    fullName: 'Test Traveller',
    email: 'traveller@example.test',
    phone: '+61 400 000 000',
    countryOfResidence: 'Australia',
    travellers: '2',
    accommodation: 'Double / Twin Share',
    internationalFlights: 'Exclude international flights',
    message: 'Test submission only',
  },
  attribution: { source: 'newsletter', campaign: 'carnaval-2027' },
})

class MemoryRepository {
  records = new Map()
  async persist(command) {
    const existing = this.records.get(command.idempotencyKey)
    if (existing) {
      if (existing.requestHash !== command.requestHash) {
        const error = new Error('idempotency_conflict')
        error.status = 409
        throw error
      }
      return { ...existing, replayed: true }
    }
    const value = { requestHash: command.requestHash, submissionReference: 'ENQ-TEST00000001', productCode: command.productCode, replayed: false }
    this.records.set(command.idempotencyKey, value)
    return value
  }
}

test('admin authorization requires the explicit admin role', () => {
  assert.equal(isWorkspaceAdmin({ role: 'admin' }), true)
  assert.equal(isWorkspaceAdmin({ role: 'agent' }), false)
  assert.equal(isWorkspaceAdmin(null), false)
})

test('booking confirmation requires a provisional booking and the exact passenger count', () => {
  assert.equal(canConfirmBooking({ status: 'provisional', expectedPassengers: 2, actualPassengers: 2 }), true)
  assert.equal(canConfirmBooking({ status: 'provisional', expectedPassengers: 2, actualPassengers: 1 }), false)
  assert.equal(canConfirmBooking({ status: 'confirmed', expectedPassengers: 2, actualPassengers: 2 }), false)
})

test('marketing helpers preserve suppression and validate opaque unsubscribe tokens', () => {
  assert.deepEqual(getMarketingEligibility({ latestConsent: 'granted', suppressed: true }), { eligible: false, suppressed: true })
  assert.deepEqual(getMarketingEligibility({ latestConsent: 'granted', suppressed: false }), { eligible: true, suppressed: false })
  assert.equal(normalizeSegmentTag('  Luxury Travellers / 2027 '), 'luxury-travellers-2027')
  assert.equal(isValidUnsubscribeToken('A'.repeat(32)), true)
  assert.equal(isValidUnsubscribeToken('short-token'), false)
})

test('all public products are associated with the correct intake type', () => {
  for (const code of ['grand-journey', 'rio-bahia', 'rio-minas']) {
    assert.equal(validateIntake(carnavalBody(code)).productCode, code)
  }
  const signature = validateIntake({
    formType: 'signature_application', productCode: 'signature-journey',
    data: { fullName: 'Test Traveller', email: 'test@example.test', whatsapp: '+61400000000', travellers: '2', interests: [] },
  })
  assert.equal(signature.productCode, 'signature-journey')
  assert.throws(() => validateIntake(carnavalBody('signature-journey')), /Carnaval package/)
  assert.throws(() => validateIntake({ ...carnavalBody('rio-bahia'), data: { ...carnavalBody().data, travellers: 9 } }), /between 1 and 8/)
})

test('Signature Journey browser payload uses the server-side traveller field contract', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /travellers:\s*travelers/)
})

test('transactional email can remain enabled while bulk marketing dispatch stays disabled', async () => {
  const worker = await readFile(new URL('../api/process-email-outbox.js', import.meta.url), 'utf8')
  assert.match(worker, /EMAIL_DELIVERY_ENABLED !== 'true'/)
  assert.doesNotMatch(worker, /MARKETING_DISPATCH_ENABLED !== 'true'/)
})

test('one successful Carnaval submission is stored once and replayed idempotently', async () => {
  const repository = new MemoryRepository()
  const command = { body: carnavalBody(), idempotencyKey: 'test-key-00000001', repository }
  const first = await processIntake(command)
  const second = await processIntake(command)
  assert.equal(first.status, 201)
  assert.equal(second.status, 200)
  assert.equal(second.body.replayed, true)
  assert.equal(repository.records.size, 1)
  assert.equal(repository.records.values().next().value.productCode, 'rio-bahia')
})

test('an idempotency key cannot be reused with different content', async () => {
  const repository = new MemoryRepository()
  const base = { body: carnavalBody(), idempotencyKey: 'test-key-00000002', repository }
  await processIntake(base)
  await assert.rejects(() => processIntake({ ...base, body: { ...base.body, data: { ...base.body.data, travellers: 3 } } }), /idempotency_conflict/)
})

test('partial payment and balance calculations ignore pending records', () => {
  const result = calculateBookingBalance({ agreedAmountMinor: 100000, ledgerEntries: [
    { kind: 'payment', amountMinor: 40000, status: 'confirmed' },
    { kind: 'payment', amountMinor: 20000, status: 'pending' },
  ] })
  assert.deepEqual(result, { agreedAmountMinor: 100000, paymentsMinor: 40000, refundsMinor: 0, netReceivedMinor: 40000, outstandingMinor: 60000, state: 'partial' })
})

test('full and partial refunds reduce net receipts without becoming payments', () => {
  const partial = calculateBookingBalance({ agreedAmountMinor: 100000, ledgerEntries: [
    { kind: 'payment', amountMinor: 100000, status: 'processor_verified' },
    { kind: 'refund', amountMinor: 25000, status: 'confirmed' },
  ] })
  assert.equal(partial.refundsMinor, 25000)
  assert.equal(partial.outstandingMinor, 25000)
  assert.equal(partial.state, 'partial')

  const full = calculateBookingBalance({ agreedAmountMinor: 100000, ledgerEntries: [
    { kind: 'payment', amountMinor: 100000, status: 'confirmed' },
    { kind: 'refund', amountMinor: 100000, status: 'confirmed' },
  ] })
  assert.equal(full.netReceivedMinor, 0)
  assert.equal(full.outstandingMinor, 100000)
  assert.equal(full.state, 'pending')
})

test('legacy production paths remain present and Workspace V2 uses isolated credentials', async () => {
  const [workspace, workspaceV2, app, carnaval, config, securitySql, bookingSql] = await Promise.all([
    readFile(new URL('../src/Workspace.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/WorkspaceV2.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/CarnavalPackagePage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../vite.config.js', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/migrations/20261124092000_workspace_2_security_and_commands.sql', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/migrations/20261124092500_workspace_2_booking_commands.sql', import.meta.url), 'utf8'),
  ])
  assert.match(workspace, /VITE_WORKSPACE_V2_ENABLED/)
  assert.match(app, /isWorkspaceV2IntakeEnabled/)
  assert.match(workspaceV2, /workspaceSupabase/)
  assert.match(app, /from\('luxury_applications'\)/)
  assert.match(app, /from\('leads'\)/)
  assert.match(carnaval, /send-application-email/)
  assert.match(config, /WORKSPACE_V2_PRODUCTION_APPROVED/)
  assert.doesNotMatch(securitySql, /grant select, insert, update, delete on/i)
  assert.match(bookingSql, /workspace_confirm_booking/)
})

test('migration chain is complete, ordered and denies client-side role assignment', async () => {
  const migrationUrl = new URL('../supabase/migrations/', import.meta.url)
  const files = (await readdir(migrationUrl)).filter((name) => name.endsWith('.sql')).sort()
  assert.deepEqual(files, [
    '20261124084500_workspace_2_legacy_profile_compatibility.sql',
    '20261124085000_workspace_2_auth_prerequisites.sql',
    '20261124090000_workspace_2_foundation.sql',
    '20261124091000_workspace_2_bookings_finance.sql',
    '20261124092000_workspace_2_security_and_commands.sql',
    '20261124092500_workspace_2_booking_commands.sql',
    '20261124092700_workspace_2_outbox_commands.sql',
    '20261124093000_workspace_2_product_seed.sql',
    '20261124093500_workspace_2_marketing_readiness.sql',
    '20261124094000_workspace_2_commercial_extensions.sql',
    '20261124094500_workspace_2_intake_pgcrypto_fix.sql',
    '20261124110000_workspace_2_legacy_crm_import.sql',
    '20261126120000_workspace_2_release_completion.sql',
    '20261126121000_workspace_2_private_grants.sql',
  ])
  const [profileCompatibility, prerequisites, extensions, legacyImport] = await Promise.all([
    readFile(new URL('../supabase/migrations/20261124084500_workspace_2_legacy_profile_compatibility.sql', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/migrations/20261124085000_workspace_2_auth_prerequisites.sql', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/migrations/20261124094000_workspace_2_commercial_extensions.sql', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/migrations/20261124110000_workspace_2_legacy_crm_import.sql', import.meta.url), 'utf8'),
  ])
  assert.match(profileCompatibility, /workspace_profiles_legacy_email_compat/)
  assert.match(prerequisites, /create table if not exists public\.profiles/)
  assert.match(prerequisites, /grant select on public\.profiles to authenticated/)
  assert.doesNotMatch(prerequisites, /grant .*update.*public\.profiles.*authenticated/i)
  assert.match(extensions, /create table public\.workspace_proposals/)
  assert.match(extensions, /create table public\.workspace_marketing_campaigns/)
  assert.match(extensions, /create table public\.workspace_booking_price_snapshots/)
  assert.match(extensions, /enable row level security/g)
  assert.match(legacyImport, /unique\(source_table, source_id\)/)
  assert.match(legacyImport, /workspace_legacy_crm_imports_admin_read/)
})
