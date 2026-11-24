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

export async function submitIntake(formType, productCode, data) {
  const fingerprint = `${formType}:${productCode}:${String(data.email || '').trim().toLowerCase()}`
  const response = await fetch('/api/intake', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': getKey(fingerprint),
    },
    body: JSON.stringify({ formType, productCode, data, attribution: getAttribution() }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Your enquiry could not be submitted.')
  return result
}
