export const WORKSPACE_PRODUCT_CODES = Object.freeze([
  'signature-journey',
  'grand-journey',
  'rio-bahia',
  'rio-minas',
])

export const WORKSPACE_LEAD_STATUSES = Object.freeze([
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'booked',
  'lost',
])

const FORM_TYPES = new Set([
  'carnaval_enquiry',
  'signature_application',
  'whatsapp_consultation',
])

const PRODUCT_CODES = new Set(WORKSPACE_PRODUCT_CODES)
const PRODUCT_CAPACITY = Object.freeze({ 'grand-journey': 12, 'rio-bahia': 8, 'rio-minas': 8 })
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class IntakeValidationError extends Error {
  constructor(message, field = null, status = 422) {
    super(message)
    this.name = 'IntakeValidationError'
    this.field = field
    this.status = status
  }
}

const cleanText = (value, maxLength, required = false) => {
  const result = String(value ?? '').trim().replace(/\s+/g, ' ')
  if (required && !result) throw new IntakeValidationError('Required field is missing.')
  if (result.length > maxLength) throw new IntakeValidationError('Field exceeds the permitted length.')
  return result
}

export const normalizeEmail = (value) => cleanText(value, 320, true).toLowerCase()

export const normalizePhone = (value) => {
  const display = cleanText(value, 40)
  const normalized = display.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
  return { display, normalized }
}

export const isWorkspaceAdmin = (profile) => profile?.role === 'admin'

export const normalizeSegmentTag = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 50)

export const canConfirmBooking = ({ status, expectedPassengers, actualPassengers }) =>
  ['draft', 'provisional'].includes(status) &&
  Number.isInteger(expectedPassengers) &&
  expectedPassengers > 0 &&
  actualPassengers === expectedPassengers

export const getMarketingEligibility = ({ latestConsent, suppressed }) => ({
  suppressed: Boolean(suppressed),
  eligible: latestConsent === 'granted' && !suppressed,
})

export const isValidUnsubscribeToken = (value) => /^[A-Za-z0-9_-]{32,200}$/.test(String(value || ''))

export function validateIntake(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new IntakeValidationError('A JSON object is required.', null, 400)
  }

  const formType = cleanText(input.formType, 50, true)
  if (!FORM_TYPES.has(formType)) throw new IntakeValidationError('Unsupported form type.', 'formType')

  const productCode = cleanText(input.productCode, 80, true)
  if (!PRODUCT_CODES.has(productCode)) throw new IntakeValidationError('Unknown product.', 'productCode')

  if (formType !== 'carnaval_enquiry' && productCode !== 'signature-journey') {
    throw new IntakeValidationError('The selected product is not valid for this form.', 'productCode')
  }
  if (formType === 'carnaval_enquiry' && productCode === 'signature-journey') {
    throw new IntakeValidationError('A Carnaval package is required.', 'productCode')
  }

  const data = input.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new IntakeValidationError('Form data is required.', 'data')
  }

  const email = normalizeEmail(data.email)
  if (!EMAIL_PATTERN.test(email)) throw new IntakeValidationError('A valid email is required.', 'email')

  const phone = normalizePhone(data.phone || data.whatsapp)
  const normalized = {
    fullName: cleanText(data.fullName || data.full_name, 160, true),
    email,
    phone: phone.display,
    phoneNormalized: phone.normalized,
    countryOfResidence: cleanText(data.countryOfResidence, 100),
    city: cleanText(data.city, 100),
    message: cleanText(data.message || data.dreamExperience, 4000),
  }

  if (formType !== 'whatsapp_consultation' && phone.normalized.length < 6) {
    throw new IntakeValidationError('A valid phone number is required.', 'phone')
  }

  if (formType === 'carnaval_enquiry') {
    const travellers = Number.parseInt(data.travellers, 10)
    const capacity = PRODUCT_CAPACITY[productCode]
    if (!Number.isInteger(travellers) || travellers < 1 || travellers > capacity) {
      throw new IntakeValidationError(`Traveller count must be between 1 and ${capacity}.`, 'travellers')
    }
    if (!normalized.countryOfResidence) {
      throw new IntakeValidationError('Country of residence is required.', 'countryOfResidence')
    }
    normalized.travellers = travellers
    normalized.accommodation = cleanText(data.accommodation, 80, true)
    normalized.internationalFlights = cleanText(data.internationalFlights, 80, true)
    normalized.departureCity = cleanText(data.departureCity, 120)
    if (normalized.internationalFlights.startsWith('Include') && !normalized.departureCity) {
      throw new IntakeValidationError('Departure city is required when flights are requested.', 'departureCity')
    }
  }

  if (formType === 'signature_application') {
    normalized.travellers = cleanText(data.travellers, 80, true)
    normalized.visitedBrazil = cleanText(data.visitedBrazil, 20)
    normalized.visitedPlaces = cleanText(data.visitedPlaces, 500)
    normalized.interests = Array.isArray(data.interests)
      ? data.interests.slice(0, 20).map((item) => cleanText(item, 100)).filter(Boolean)
      : []
    normalized.budget = cleanText(data.budget, 100)
  }

  if (formType === 'whatsapp_consultation') {
    normalized.birthDate = cleanText(data.birthDate, 10)
    normalized.referralSource = cleanText(data.referralSource, 120)
  }

  return { formType, productCode, data: normalized }
}

export function sanitizeAttribution(value = {}) {
  const allowed = ['source', 'medium', 'campaign', 'term', 'content', 'referrer', 'landingPath', 'agency']
  return Object.fromEntries(
    allowed.map((key) => [key, cleanText(value[key], key === 'referrer' ? 500 : 200)]).filter(([, item]) => item),
  )
}

const asMinor = (value) => {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed)) throw new TypeError('Financial values must be safe integers in minor units.')
  return parsed
}

export function calculateBookingBalance({ agreedAmountMinor, ledgerEntries = [] }) {
  const agreed = asMinor(agreedAmountMinor)
  if (agreed < 0) throw new RangeError('Agreed amount cannot be negative.')

  let payments = 0
  let refunds = 0
  for (const entry of ledgerEntries) {
    if (!['confirmed', 'processor_verified'].includes(entry.status)) continue
    const amount = asMinor(entry.amountMinor)
    if (amount < 0) throw new RangeError('Ledger amounts cannot be negative.')
    if (entry.kind === 'payment') payments += amount
    if (entry.kind === 'refund') refunds += amount
  }

  const netReceived = payments - refunds
  const outstanding = Math.max(agreed - netReceived, 0)
  const state = netReceived <= 0 ? 'pending' : outstanding === 0 ? 'paid' : 'partial'
  return { agreedAmountMinor: agreed, paymentsMinor: payments, refundsMinor: refunds, netReceivedMinor: netReceived, outstandingMinor: outstanding, state }
}
