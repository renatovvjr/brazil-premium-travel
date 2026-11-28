import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { localeCatalog } from '../src/locales/catalog.js'
import { renderEnquiryEmail, WEBSITE } from '../api/_lib/transactionalEmail.js'

const logo = await readFile(new URL('../public/images/logo-premium.png', import.meta.url))
const locales = localeCatalog.filter(({ selectable }) => selectable)
const variants = [
  ['signature', 'Brazil Signature Journey', 'signature-journey', 'signature_application'],
  ['all-inclusive', 'Curated Brazil All-Inclusive', 'all-inclusive', 'whatsapp_consultation'],
  ['grand', 'Grand Carnaval Journey', 'grand-journey', 'carnaval_enquiry'],
  ['bahia', 'Rio & Bahia Carnaval Escape', 'rio-bahia', 'carnaval_enquiry'],
  ['minas', 'Rio & Minas Carnaval Heritage', 'rio-minas', 'carnaval_enquiry'],
  ['consultation', 'Private Travel Consultation / WhatsApp', 'signature-journey', 'whatsapp_consultation'],
  ['admin', 'Administrative notification', 'grand-journey', 'carnaval_enquiry'],
]

function previewEmail(variant, locale) {
  const [type, label, code, formType] = variant
  const isAdmin = type === 'admin'
  const isCarnaval = formType === 'carnaval_enquiry'
  const data = { fullName: locale === 'ar' ? 'ليلى أحمد' : 'James Example', email: 'traveller@example.test' }
  if (formType === 'whatsapp_consultation') Object.assign(data, { countryOfResidence: 'Australia', city: 'Sydney', referralSource: 'Internal preview' })
  else Object.assign(data, { phone: '+61 491 570 006', travellers: 2, message: 'Synthetic enquiry for visual review only.' })
  if (isCarnaval) Object.assign(data, {
    countryOfResidence: 'Australia', accommodation: 'Twin share', internationalFlights: 'Include international flights', departureCity: 'Sydney (SYD)',
  })
  return renderEnquiryEmail({ payload: data, recipient_kind: isAdmin ? 'team' : 'customer' }, {
    reference: 'ENQ-EXAMPLE01',
    form_type: formType,
    received_at: '2026-11-29T11:03:00Z',
    product: { name: code === 'signature-journey' ? 'Brazil Signature Journey' : isAdmin ? 'Grand Carnaval Journey' : label, code },
    departure: isCarnaval ? { code: 'preview-departure', starts_on: '2027-01-28', ends_on: '2027-02-14' } : null,
    attribution: { locale, source: 'local-preview', campaign: 'visual-review' },
  })
}

const option = (value, label) => '<option value="' + value + '">' + label.replaceAll('&', '&amp;') + '</option>'
const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Curated Brazil Travel · Email preview</title>
<style>
  * { box-sizing:border-box; }
  body { margin:0; background:#f5f0e5; color:#00271e; font:15px/1.5 Arial,Helvetica,sans-serif; }
  header { padding:20px; color:white; background:#00271e; text-align:center; }
  h1 { margin:0; font:400 29px Georgia,serif; }
  main { max-width:820px; margin:auto; padding:18px; }
  .controls { display:grid; grid-template-columns:2fr 1fr 1fr; gap:12px; }
  label { min-width:0; font-size:13px; font-weight:700; }
  select { margin-top:5px; width:100%; color:inherit; background:#fbfaf7; border:1px solid #e2c97f; border-radius:6px; padding:10px; font:inherit; }
  .subject { margin:16px 0 8px; padding:10px 12px; background:#fbfaf7; border:1px solid #e2c97f; border-radius:6px; }
  iframe { display:block; margin:auto; width:100%; max-width:680px; min-height:950px; background:#f5f0e5; border:1px solid #e2c97f; border-radius:8px; }
  iframe.mobile { max-width:390px; min-height:1040px; }
  details { margin-top:15px; padding:10px; background:#fbfaf7; border-radius:6px; }
  pre { white-space:pre-wrap; overflow-wrap:anywhere; }
  @media(max-width:550px) {.controls{grid-template-columns:1fr;} main{padding:10px;} }
</style></head>
<body><header><h1>Curated Brazil Travel email preview</h1><div>Synthetic data · Local review</div></header>
<main>
  <div class="controls">
    <label>Template<select id="template">${variants.map(([id, label]) => option(id, label)).join('')}</select></label>
    <label>Language<select id="locale">${locales.map(({ code, name }) => option(code, name)).join('')}</select></label>
    <label>Preview width<select id="width"><option value="desktop">Desktop</option><option value="mobile">Mobile</option></select></label>
  </div>
  <p class="subject"><strong>Subject</strong> <bdi id="subject" aria-live="polite"></bdi></p>
  <iframe title="Rendered transactional email" id="email" sandbox="allow-same-origin"></iframe>
  <details><summary>Plain-text alternative</summary><pre id="plain"></pre></details>
</main>
<script>
const template = document.getElementById('template')
const locale = document.getElementById('locale')
const width = document.getElementById('width')
const email = document.getElementById('email')
const subject = document.getElementById('subject')
const plain = document.getElementById('plain')
let revision = 0
async function update() {
  const current = ++revision
  try {
    const query = new URLSearchParams({ template: template.value, locale: locale.value })
    const response = await fetch('/render?' + query)
    if (!response.ok) throw Error('Preview could not be rendered.')
    const content = await response.json()
    if (current !== revision) return
    subject.textContent = content.subject
    plain.textContent = content.text
    plain.dir = locale.value === 'ar' ? 'rtl' : 'ltr'
    email.srcdoc = content.html
  } catch (error) {
    if (current === revision) subject.textContent = error.message
  }
}
template.onchange = locale.onchange = update
width.onchange = () => email.classList.toggle('mobile', width.value === 'mobile')
update()
</script></body></html>`

const port = 5181
createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:' + port)
  if (req.method !== 'GET') return res.writeHead(405).end()
  if (url.pathname === '/') return res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(page)
  if (url.pathname === '/email-logo.png') return res.writeHead(200, { 'Content-Type': 'image/png' }).end(logo)
  if (url.pathname === '/render') {
    const variant = variants.find(([id]) => id === url.searchParams.get('template'))
    const locale = url.searchParams.get('locale')
    if (!variant || !locales.some(({ code }) => code === locale)) return res.writeHead(400).end()
    const { subject, html, text } = previewEmail(variant, locale)
    return res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify({
      subject, text, html: html.replace(WEBSITE + '/images/logo-premium.png', '/email-logo.png'),
    }))
  }
  res.writeHead(404).end()
}).listen(port, '127.0.0.1', () => console.log('Email preview: http://127.0.0.1:' + port))
