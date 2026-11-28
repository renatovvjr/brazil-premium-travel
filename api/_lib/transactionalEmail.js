import { localeByCode } from '../../src/locales/catalog.js'
import { emailCopy } from './transactionalEmailCopy.js'

export const WEBSITE = 'https://www.curatedbraziltravel.com'
export const CONTACT = 'hello@curatedbraziltravel.com'
const BRAND = 'Curated Brazil Travel'
const LOGO = WEBSITE + '/images/logo-premium.png'
const WORKSPACE = WEBSITE + '/workspace'
const forest = '#00271e'
const darkForest = '#001f18'
const gold = '#d4af37'
const softGold = '#e2c97f'
const ivory = '#f5f0e5'
const paper = '#fbfaf7'
const serif = "Georgia, 'Times New Roman', serif"
const sans = 'Arial, Helvetica, sans-serif'

// These destinations are existing official routes. Submitted URLs never become links.
const productPaths = {
  'signature-journey': '/#signature',
  'all-inclusive': '/#all-inclusive',
  'grand-journey': '/carnaval/grand-journey',
  'rio-bahia': '/carnaval/rio-bahia',
  'rio-minas': '/carnaval/rio-minas',
}

const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => htmlEntities[character])
const htmlText = (value) => escapeHtml(value).replace(/\r\n|\r|\n/g, '<br>')
const interpolateName = (template, name) => template.replace('{name}', () => name)

function localeSettings(value) {
  const locale = typeof value === 'string' && Object.hasOwn(localeByCode, value) && localeByCode[value].selectable ? value : 'en-AU'
  const meta = localeByCode[locale]
  return { locale, dir: meta.direction || 'ltr', copy: emailCopy[meta.contentLocale || locale] }
}

function address(value) {
  // Accept one plain email address. Exclude header delimiters, control characters and whitespace.
  if (typeof value !== 'string' || !/^[^\s<>",;:@]+@[^\s<>",;:@]+\.[^\s<>",;:@]+$/u.test(value) ||
      /[\u0000-\u001f\u007f-\u009f]/u.test(value)) throw new Error('invalid_enquiry_email_address')
  return value
}

export function customerTemplateFor(formType, productCode) {
  if (formType === 'whatsapp_consultation' && productCode !== 'all-inclusive') return 'consultation'
  return Object.hasOwn(productPaths, productCode) ? productCode : 'consultation'
}

function renderLayout({ title, label, preheader, body, button, locale, dir, footer, admin = false }) {
  const align = dir === 'rtl' ? 'right' : 'left'
  const header = admin ? darkForest : forest
  return `<!doctype html>
<html lang="${escapeHtml(locale)}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(title)}</title>
  <style>@media only screen and (max-width: 480px) {
    .email-outer { padding: 12px 8px !important; }
    .email-section { padding-left: 18px !important; padding-right: 18px !important; }
    .email-title { font-size: 28px !important; }
    .email-field { display: block !important; width: auto !important; }
  }</style>
</head>
<body style="margin:0;padding:0;background-color:${ivory};color:${darkForest};font-family:${sans};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${ivory}" style="background-color:${ivory};">
    <tr><td align="center" class="email-outer" style="padding:30px 12px;">
      <!--[if mso]><table role="presentation" width="640" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" dir="${dir}"
        style="width:100%;max-width:640px;border:1px solid ${softGold};border-radius:16px;background-color:${paper};border-spacing:0;">
        <tr><td align="center" dir="${dir}" bgcolor="${header}" class="email-section"
          style="padding:26px 34px 24px;border-radius:15px 15px 0 0;border-bottom:2px solid ${gold};background-color:${header};color:#ffffff;">
          <img src="${LOGO}" width="64" height="64" alt="${BRAND}" style="display:block;margin:0 auto;border:0;border-radius:8px;color:${softGold};">
          <p style="margin:12px 0 13px;color:${softGold};font:700 11px/1.5 ${sans};letter-spacing:2.5px;" dir="ltr">${BRAND.toUpperCase()}</p>
          <p style="margin:0 0 8px;color:${softGold};font:14px/1.5 ${sans};">${escapeHtml(label)}</p>
          <h1 class="email-title" style="margin:0;color:#ffffff;font:400 34px/1.19 ${serif};">${escapeHtml(title)}</h1>
        </td></tr>
        <tr><td align="${align}" dir="${dir}" bgcolor="${paper}" class="email-section"
          style="padding:28px 34px 22px;text-align:${align};font:16px/1.65 ${sans};color:${darkForest};">
          ${body}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0;">
            <tr><td bgcolor="${gold}" align="center" style="border-radius:7px;background-color:${gold};mso-padding-alt:13px 22px;">
              <a href="${button.href}" style="display:block;padding:13px 22px;color:${darkForest};font:700 15px/1.4 ${sans};text-decoration:none;mso-padding-alt:0;">${escapeHtml(button.label)}</a>
            </td></tr>
          </table>
          ${footer}
        </td></tr>
        <tr><td align="center" dir="${dir}" bgcolor="${ivory}" class="email-section"
          style="padding:18px 34px 22px;border-top:1px solid ${softGold};border-radius:0 0 15px 15px;color:${forest};font:13px/1.65 ${sans};">
          <p style="margin:0 0 6px;">${escapeHtml(button.tagline)}</p>
          <a href="mailto:${CONTACT}" dir="ltr" style="color:${forest};text-decoration:underline;">${CONTACT}</a><br>
          <a href="${WEBSITE}" dir="ltr" style="color:${forest};text-decoration:underline;">www.curatedbraziltravel.com</a>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`
}

function customerEmail(data, submission, settings, reference, productName) {
  const { copy, dir } = settings
  const variant = copy.variants[customerTemplateFor(submission.form_type, submission.product.code)]
  const name = data.fullName || copy.guest
  const greeting = interpolateName(copy.greeting, name)
  const isConsultation = submission.form_type === 'whatsapp_consultation'
  const next = isConsultation ? copy.nextConsult
    : submission.form_type === 'carnaval_enquiry' ? copy.nextCarnaval : copy.nextJourney
  const label = isConsultation ? copy.ctaConsult : copy.ctaJourney
  const href = WEBSITE + (Object.hasOwn(productPaths, submission.product.code) ? productPaths[submission.product.code] : '/#apply')
  return {
    to: address(data.email),
    subject: variant.subject,
    text: [
      variant.headline, greeting, variant.intro, `${copy.experience}\n${productName}\n${copy.reference}: ${reference}\n${copy.receipt}`,
      next, copy.disclaimer, `${label}: ${href}`, `${copy.signoff}\n${copy.team}`, `${copy.tagline}\n${CONTACT}\n${WEBSITE}`,
    ].join('\n\n'),
    html: renderLayout({
      ...settings, title: variant.headline, label: copy.tagline, preheader: copy.receipt,
      button: { href, label, tagline: copy.tagline },
      body: `<p style="margin:0 0 14px;">${interpolateName(escapeHtml(copy.greeting), `<span dir="auto">${escapeHtml(name)}</span>`)}</p>
        <p style="margin:0 0 18px;">${escapeHtml(variant.intro)}</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 17px;">
          <tr><td dir="${dir}" bgcolor="${ivory}" style="padding:14px 16px;border:1px solid ${softGold};border-radius:8px;">
            <p style="margin:0;font-size:13px;">${escapeHtml(copy.experience)}</p>
            <p style="margin:3px 0 5px;font:700 19px/1.35 ${serif};" dir="auto">${escapeHtml(productName)}</p>
            <p style="margin:0;font-size:13px;">${escapeHtml(copy.reference)}: <strong dir="ltr">${escapeHtml(reference)}</strong></p>
            <p style="margin:0;font-size:13px;">${escapeHtml(copy.receipt)}</p>
          </td></tr>
        </table>
        <p style="margin:0 0 10px;">${escapeHtml(next)}</p>
        <p style="margin:0;font-size:13px;">${escapeHtml(copy.disclaimer)}</p>`,
      footer: `<p style="margin:16px 0 2px;">${escapeHtml(copy.signoff)}</p><p style="margin:0;font-weight:700;">${escapeHtml(copy.team)}</p>`,
    }),
  }
}

function scheduledDates(departure, locale) {
  const dates = [departure?.starts_on, departure?.ends_on].filter(Boolean)
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' })
  return [...new Set(dates)].map((date) => formatter.format(new Date(date + 'T00:00:00Z'))).join(' – ')
}

function administrativeEmail(data, submission, settings, reference, productName, operationsInbox) {
  const { copy, locale, dir } = settings
  const attribution = submission.attribution || {}
  const received = new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    timeZone: 'Australia/Sydney', timeZoneName: 'short',
  }).format(new Date(submission.received_at))
  const fields = [
    [copy.reference, reference], [copy.name, data.fullName], [copy.email, data.email], [copy.phone, data.phone],
    [copy.experience, productName], [copy.departure, submission.departure?.code],
    [copy.scheduled, scheduledDates(submission.departure, locale)], [copy.form, copy.forms[submission.form_type]],
    [copy.received, received], [copy.country, data.countryOfResidence], [copy.city, data.city],
    [copy.travellers, data.travellers], [copy.visitedBrazil, data.visitedBrazil], [copy.visitedPlaces, data.visitedPlaces],
    [copy.interests, Array.isArray(data.interests) ? data.interests.join(', ') : undefined], [copy.budget, data.budget],
    [copy.accommodation, data.accommodation], [copy.flights, data.internationalFlights], [copy.departureCity, data.departureCity],
    [copy.source, attribution.source || copy.forms[submission.form_type]], [copy.campaign, attribution.campaign],
    [copy.referral, data.referralSource], [copy.message, data.message],
  ].filter(([, value]) => value != null && String(value).trim() !== '')
  return {
    to: address(operationsInbox),
    subject: `${copy.adminHeadline} · ${reference}`,
    text: [copy.adminIntro, fields.map(([label, value]) => `${label}: ${value}`).join('\n'),
      `${copy.adminCta}: ${WORKSPACE}`, `${BRAND}\n${copy.tagline}\n${CONTACT}\n${WEBSITE}`].join('\n\n'),
    html: renderLayout({
      ...settings, admin: true, title: copy.adminHeadline, label: reference, preheader: copy.adminIntro,
      button: { href: WORKSPACE, label: copy.adminCta, tagline: copy.tagline },
      body: `<p style="margin:0 0 16px;">${escapeHtml(copy.adminIntro)}</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" dir="${dir}"
          style="table-layout:fixed;border:1px solid ${softGold};">
          ${fields.map(([label, value], index) => `<tr bgcolor="${index % 2 ? paper : ivory}">
            <td class="email-field" width="34%" valign="top" style="padding:8px 10px;font-size:13px;font-weight:700;">${escapeHtml(label)}</td>
            <td class="email-field" valign="top" dir="auto" style="padding:8px 10px;font-size:14px;overflow-wrap:anywhere;word-break:break-word;">${htmlText(value)}</td>
          </tr>`).join('')}
        </table>`,
      footer: '',
    }),
  }
}

export function renderEnquiryEmail(event, submission, operationsInbox = CONTACT) {
  const reference = submission?.reference
  const productName = submission?.product?.name
  if (typeof reference !== 'string' || !/^ENQ-[A-Z0-9-]{1,32}$/.test(reference) || !productName) {
    throw new Error('enquiry_metadata_unavailable')
  }
  const settings = localeSettings(submission.attribution?.locale)
  const data = event.payload || {}
  if (event.recipient_kind === 'customer') return customerEmail(data, submission, settings, reference, productName)
  return administrativeEmail(data, submission, settings, reference, productName, operationsInbox)
}
