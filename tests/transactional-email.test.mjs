import assert from 'node:assert/strict'
import test from 'node:test'
import { processIntake } from '../api/_lib/intakeService.js'
import { emailCopy } from '../api/_lib/transactionalEmailCopy.js'
import { CONTACT, renderEnquiryEmail, WEBSITE } from '../api/_lib/transactionalEmail.js'
import outbox from '../api/process-email-outbox.js'
import { localeCatalog } from '../src/locales/catalog.js'

const data = { fullName: 'James & Naomi Example', email: 'traveller@example.test', phone: '+61 491 570 006' }
const signature = {
  id: 'submission-1', reference: 'ENQ-EXAMPLE01', form_type: 'signature_application',
  product: { code: 'signature-journey', name: 'Brazil Signature Journey' }, received_at: '2026-11-28T12:36:38Z',
}
const customer = { recipient_kind: 'customer', payload: data }
const admin = { recipient_kind: 'team', payload: data }
const routes = [
  ['signature_application', 'signature-journey', 'Brazil Signature Journey', 'signature-journey', '/#signature'],
  ['whatsapp_consultation', 'all-inclusive', 'Curated Brazil All-Inclusive', 'all-inclusive', '/#all-inclusive'],
  ['carnaval_enquiry', 'grand-journey', 'Grand Carnaval Journey', 'grand-journey', '/carnaval/grand-journey'],
  ['carnaval_enquiry', 'rio-bahia', 'Rio & Bahia Carnaval Escape', 'rio-bahia', '/carnaval/rio-bahia'],
  ['carnaval_enquiry', 'rio-minas', 'Rio & Minas Carnaval Heritage', 'rio-minas', '/carnaval/rio-minas'],
  ['whatsapp_consultation', 'signature-journey', 'Brazil Signature Journey', 'consultation', '/#signature'],
]

test('six distinct customer templates and the operations template are complete in all supported locales', () => {
  const locales = localeCatalog.filter(({ selectable }) => selectable)
  const expectedKeys = Object.keys(emailCopy['en-AU']).sort()
  assert.equal(locales.length, 12)
  for (const locale of locales) {
    const copy = emailCopy[locale.contentLocale || locale.code]
    assert.deepEqual(Object.keys(copy).sort(), expectedKeys)
    for (const [key, value] of Object.entries(copy)) {
      if (key !== 'forms' && key !== 'variants') assert.ok(value.trim(), key)
    }
    const subjects = new Set()
    for (const [formType, productCode, name, variant, path] of routes) {
      const input = {
        ...signature, product: { code: productCode, name }, form_type: formType,
        attribution: { locale: locale.code },
      }
      const message = renderEnquiryEmail(customer, input)
      const variantCopy = copy.variants[variant]
      assert.ok(variantCopy.subject.trim() && variantCopy.headline.trim() && variantCopy.intro.trim())
      assert.equal(message.subject, variantCopy.subject)
      subjects.add(message.subject)
      assert.equal(message.to, data.email)
      assert.ok(message.html.includes(name.replace('&', '&amp;')))
      assert.ok(message.html.includes('James &amp; Naomi Example'))
      assert.ok(message.html.includes('href="' + WEBSITE + path + '"'))
      assert.ok(message.html.includes('ENQ-EXAMPLE01'))
      assert.ok(message.html.includes('lang="' + locale.code + '" dir="' + (locale.direction || 'ltr') + '"'))
      assert.ok(message.text.includes(name) && message.text.includes(data.fullName) && message.text.includes('ENQ-EXAMPLE01'))
      assert.ok(message.text.includes(copy.disclaimer))
      assert.ok(message.html.includes('/images/logo-premium.png') && message.html.includes('Curated Brazil Travel'))
      assert.ok(message.html.includes('@media only screen') && message.html.includes('<!--[if mso]>'))
    }
    assert.equal(subjects.size, 6)
    const notice = renderEnquiryEmail(admin, { ...signature, attribution: { locale: locale.code } })
    assert.ok(notice.html.includes(copy.forms.signature_application) && notice.text.includes(copy.received))
    assert.ok(notice.html.includes(copy.adminCta) && notice.text.includes(WEBSITE + '/workspace'))
  }
  assert.equal(renderEnquiryEmail(customer, signature).subject, 'Your Curated Brazil Journey Begins ✨')
  assert.equal(renderEnquiryEmail(customer, { ...signature, attribution: { locale: 'fr-FR' } }).subject,
    renderEnquiryEmail(customer, signature).subject)
})

test('administrative details omit private metadata, escape HTML, and constrain destinations', () => {
  const maliciousText = '</td><img src=x onerror=alert(1)>'
  const enquiry = {
    ...signature, attribution: { locale: 'ar', source: maliciousText, campaign: 'https://example.test' },
    departure: { code: 'preview-01', starts_on: '2027-01-28', ends_on: '2027-02-14' },
  }
  const payload = { ...data, fullName: maliciousText, message: 'First line\n' + maliciousText,
    captchaToken: 'never-printed-captcha', ipHash: 'never-printed-ip', birthDate: 'never-printed-birthday' }
  for (const kind of ['customer', 'team']) {
    const message = renderEnquiryEmail({ payload, recipient_kind: kind }, enquiry)
    assert.ok(message.html.includes('&lt;/td&gt;&lt;img src=x onerror=alert(1)&gt;'))
    assert.ok(!message.html.includes(maliciousText))
    assert.doesNotMatch(message.html + message.text, /never-printed/)
    for (const [, href] of message.html.matchAll(/href="([^"]+)"/g)) {
      assert.ok(href.startsWith(WEBSITE) || href === 'mailto:' + CONTACT)
    }
  }
  const notice = renderEnquiryEmail({ ...admin, payload }, enquiry, 'ops@example.test')
  assert.equal(notice.to, 'ops@example.test')
  assert.ok(notice.html.includes('preview-01') && notice.html.includes('First line<br>'))
  assert.ok(!notice.html.includes(emailCopy.ar.budget))
  assert.doesNotMatch(renderEnquiryEmail(customer, enquiry).text, /preview-01/)
  assert.throws(() => renderEnquiryEmail({ ...customer, payload: { ...data, email: 'a@example.test\r\nBcc: b@example.test' } }, enquiry),
    /invalid_enquiry_email_address/)
  assert.throws(() => renderEnquiryEmail(admin, { ...enquiry, reference: 'ENQ-TEST\r\nBcc: b@example.test' }),
    /enquiry_metadata_unavailable/)
  const unlistedProduct = renderEnquiryEmail(customer, { ...signature, product: { code: 'javascript:alert(1)', name: 'Custom' } })
  assert.match(unlistedProduct.html, /href="https:\/\/www.curatedbraziltravel.com\/#apply"/)
  assert.doesNotMatch(unlistedProduct.html, /javascript:/)
})

test('the validated locale is retained without changing existing enquiry fingerprints', async () => {
  const requests = []
  const repository = { persist: async (command) => {
    requests.push(command)
    return { submissionReference: 'ENQ-EXAMPLE01', replayed: requests.length > 1 }
  } }
  const body = {
    formType: 'signature_application', productCode: 'signature-journey',
    attribution: { source: 'preview', locale: 'ar' },
    data: { ...data, travellers: '2' },
  }
  const invoke = (value) => processIntake({ body: value, idempotencyKey: 'local-idempotency-key', repository })
  assert.equal((await invoke(body)).status, 201)
  assert.equal((await invoke({ ...body, locale: 'ar' })).status, 200)
  await invoke({ ...body, locale: 'zh-Hant' })
  assert.deepEqual(requests.map((item) => item.attribution), [
    { source: 'preview' }, { source: 'preview', locale: 'ar' }, { source: 'preview' },
  ])
  assert.equal(new Set(requests.map(({ requestHash }) => requestHash)).size, 1)
})

test('the outbox preserves send idempotency, completion, per-event retries and booking compatibility', async (context) => {
  const environment = {
    EMAIL_DELIVERY_ENABLED: 'true', OUTBOX_WORKER_SECRET: 'mock-worker', SUPABASE_URL: 'https://mock-supabase.example.test',
    SUPABASE_SERVICE_ROLE_KEY: 'mock-role', RESEND_API_KEY: 'mock-key', APPLICATION_TO_EMAIL: 'ops@example.test',
    RESEND_FROM_EMAIL: 'Curated Brazil <applications@example.test>', MARKETING_DISPATCH_ENABLED: 'false',
  }
  const previous = Object.fromEntries(Object.keys(environment).map((key) => [key, process.env[key]]))
  Object.assign(process.env, environment)
  context.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })
  const events = [
    { ...customer, template_key: 'signature_application', event_id: 'customer-event', submission_id: signature.id },
    { ...admin, template_key: 'signature_application', event_id: 'team-event', submission_id: signature.id },
    { ...customer, template_key: 'booking_confirmation', event_id: 'booking-event', submission_id: null,
      payload: { ...data, reference: 'BOOK-TEST' } },
  ]
  const calls = []
  let metadataFault = false
  context.mock.method(globalThis, 'fetch', async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.url || input.href)
    const body = init?.body ? JSON.parse(init.body) : null
    const headers = new Headers(init?.headers)
    const action = url.pathname.split('/').at(-1)
    calls.push({ action, body, key: headers.get('Idempotency-Key') })
    if (url.origin === 'https://mock-supabase.example.test') {
      if (action === 'workspace_claim_outbox') return Response.json(events)
      if (action === 'workspace_form_submissions') {
        assert.equal(url.searchParams.get('id'), 'in.(submission-1)')
        return metadataFault ? Response.json({ message: 'mock failure' }, { status: 503 }) : Response.json([signature])
      }
      if (action === 'workspace_complete_outbox' || action === 'workspace_fail_outbox') return Response.json(null)
    }
    if (url.origin === 'https://api.resend.com' && action === 'emails') {
      if (headers.get('Idempotency-Key') === 'workspace-outbox-team-event') {
        return Response.json({ name: 'validation_error', message: 'mock provider failure' }, { status: 422 })
      }
      return Response.json({ id: 'mock-resend-id' })
    }
    throw new Error('Unexpected mocked URL ' + url.origin + url.pathname)
  })
  const run = async () => {
    const result = {}
    const res = { status(code) { result.code = code; return this }, json(body) { result.body = body; return this } }
    await outbox({ method: 'POST', headers: { authorization: 'Bearer mock-worker' } }, res)
    return result
  }
  assert.deepEqual(await run(), { code: 200, body: { ok: true, claimed: 3, sent: 2 } })
  const emails = calls.filter((call) => call.action === 'emails')
  assert.deepEqual(emails.map(({ key }) => key), ['workspace-outbox-customer-event', 'workspace-outbox-team-event', 'workspace-outbox-booking-event'])
  assert.equal(emails[0].body.subject, 'Your Curated Brazil Journey Begins ✨')
  assert.match(emails[0].body.text, /ENQ-EXAMPLE01/)
  assert.equal(emails[1].body.to, 'ops@example.test')
  assert.equal(emails[2].body.subject, 'Your Curated Brazil booking is confirmed')
  assert.ok(calls.some(({ action, body }) => action === 'workspace_fail_outbox' && body.p_event_id === 'team-event'))

  metadataFault = true
  calls.length = 0
  assert.deepEqual(await run(), { code: 200, body: { ok: true, claimed: 3, sent: 1 } })
  assert.deepEqual(calls.filter(({ action }) => action === 'emails').map(({ key }) => key), ['workspace-outbox-booking-event'])
  assert.deepEqual(calls.filter(({ action }) => action === 'workspace_fail_outbox').map(({ body }) => body.p_error_code),
    ['enquiry_metadata_unavailable', 'enquiry_metadata_unavailable'])
})
