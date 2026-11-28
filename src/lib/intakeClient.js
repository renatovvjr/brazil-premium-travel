const INTAKE_FEATURE_ENABLED = import.meta.env.VITE_WORKSPACE_V2_INTAKE_ENABLED === 'true'
const keys = new Map()

const getAttribution = () => {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    source: params.get('utm_source') || '',
    medium: params.get('utm_medium') || '',
    campaign: params.get('utm_campaign') || '',
    term: params.get('utm_term') || '',
    content: params.get('utm_content') || '',
    agency: params.get('agency') || params.get('partner') || '',
    referrer: document.referrer || '',
    landingPath: `${window.location.pathname}${window.location.search}`,
  }
}

const getKey = (fingerprint) => {
  const existing = keys.get(fingerprint)
  if (existing && Date.now() - existing.createdAt < 10 * 60 * 1000) return existing.value
  const value = crypto.randomUUID()
  keys.set(fingerprint, { value, createdAt: Date.now() })
  return value
}

export const isWorkspaceV2IntakeEnabled = () => INTAKE_FEATURE_ENABLED

export async function submitIntake(formType, productCode, data, form) {
  const widget = form.querySelector('[data-intake-widget]')?.dataset.intakeWidget
  const captchaToken = new FormData(form).get('cf-turnstile-response')
  const payload = { formType, productCode, data, attribution: getAttribution() }
  if (import.meta.env.VITE_TURNSTILE_SITE_KEY && !captchaToken) {
    throw new Error('Human verification is required.')
  }

  for (const [key, entry] of keys) {
    if (Date.now() - entry.createdAt >= 10 * 60 * 1000) keys.delete(key)
  }
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)))
  const fingerprint = [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  try {
    const response = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': getKey(fingerprint) },
      body: JSON.stringify({ ...payload, locale: document.documentElement.lang, captchaToken }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || !result.submissionReference) {
      throw new Error(result.error || 'Your enquiry could not be submitted.')
    }
    return result
  } finally {
    if (widget && form.isConnected) window.turnstile?.reset(widget)
  }
}
