import { createHmac } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { processIntake } from './_lib/intakeService.js'

const MAX_BODY_BYTES = 32 * 1024
const productionOrigin = 'https://www.curatedbraziltravel.com'

const allowedOrigins = () => new Set(
  (process.env.INTAKE_ALLOWED_ORIGINS || productionOrigin)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
)

const getIpHash = (req) => {
  const raw = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()
  const secret = process.env.INTAKE_HASH_SECRET
  return raw && secret ? createHmac('sha256', secret).update(raw).digest('hex') : null
}

const verifyCaptcha = async (token, ip) => {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return process.env.VERCEL_ENV !== 'production' && process.env.INTAKE_REQUIRE_CAPTCHA !== 'true'
  if (!token) return false
  const form = new FormData()
  form.set('secret', secret)
  form.set('response', token)
  if (ip) form.set('remoteip', ip)
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', body: form, signal: AbortSignal.timeout(5000),
  })
  const result = await response.json()
  return result.success === true && (
    process.env.VERCEL_ENV !== 'production' ||
    (new Set(['www.curatedbraziltravel.com', 'curatedbraziltravel.com']).has(result.hostname) && result.action === 'enquiry')
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })
  if (process.env.VERCEL_ENV === 'production' && (
    process.env.VITE_WORKSPACE_V2_INTAKE_ENABLED !== 'true' || process.env.WORKSPACE_V2_PRODUCTION_APPROVED !== 'true'
  )) return res.status(503).json({ error: 'Workspace intake is disabled.' })

  const contentLength = Number(req.headers['content-length'] || 0)
  if (contentLength > MAX_BODY_BYTES) return res.status(413).json({ error: 'Request body is too large.' })

  const origin = String(req.headers.origin || '')
  if (origin && !allowedOrigins().has(origin)) return res.status(403).json({ error: 'Origin is not allowed.' })

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey || !process.env.INTAKE_HASH_SECRET) {
    return res.status(503).json({ error: 'Secure intake is not configured.' })
  }

  const forwardedIp = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const repository = {
    persist: async (command) => {
      const { data, error } = await supabase.rpc('workspace_submit_enquiry', {
        p_form_type: command.formType,
        p_product_code: command.productCode,
        p_payload: command.data,
        p_attribution: command.attribution,
        p_idempotency_key: command.idempotencyKey,
        p_request_hash: command.requestHash,
        p_ip_hash: command.requestContext.ipHash,
        p_user_agent: command.requestContext.userAgent,
        p_environment: process.env.VERCEL_ENV === 'production' ? 'production' : process.env.VERCEL_ENV === 'preview' ? 'staging' : 'local',
      })
      if (error) {
        const wrapped = new Error(error.message)
        if (error.message === 'rate_limit_exceeded') {
          wrapped.status = 429
          wrapped.message = 'Too many enquiries. Please try again shortly.'
        } else {
          wrapped.status = error.message?.includes('idempotency_conflict') ? 409 : 500
        }
        throw wrapped
      }
      return data
    },
  }

  try {
    if (!(await verifyCaptcha(req.body?.captchaToken, forwardedIp))) {
      return res.status(422).json({ error: 'Human verification failed.' })
    }
    const result = await processIntake({
      body: req.body,
      idempotencyKey: req.headers['idempotency-key'],
      requestContext: {
        ipHash: getIpHash(req),
        userAgent: String(req.headers['user-agent'] || '').slice(0, 500),
      },
      repository,
    })
    res.setHeader('Cache-Control', 'no-store')
    return res.status(result.status).json(result.body)
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 500
    if (process.env.NODE_ENV !== 'production') console.error(`[workspace-intake] ${error.message}`)
    return res.status(status).json({ error: status >= 500 ? 'The enquiry could not be stored.' : error.message, field: error.field || undefined })
  }
}
