import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
})[character])

const render = (event) => {
  const data = event.payload || {}
  const name = escapeHtml(data.fullName || 'Traveller')
  const product = escapeHtml(event.template_key.replaceAll('_', ' '))
  if (event.recipient_kind === 'customer') {
    return {
      to: data.email,
      subject: 'We received your Curated Brazil enquiry',
      html: `<p>Dear ${name},</p><p>Thank you for contacting Curated Brazil Travel. Your ${product} enquiry has been securely received and our team will be in touch.</p>`,
    }
  }
  return {
    to: process.env.APPLICATION_TO_EMAIL || 'hello@curatedbraziltravel.com',
    subject: `New ${product} enquiry`,
    html: `<p>A new product-linked enquiry has been stored.</p><p><strong>Name:</strong> ${name}<br><strong>Email:</strong> ${escapeHtml(data.email)}<br><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>`,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })
  if (process.env.EMAIL_DELIVERY_ENABLED !== 'true') {
    return res.status(503).json({ error: 'Email delivery is disabled.' })
  }
  const expected = process.env.OUTBOX_WORKER_SECRET
  if (!expected || req.headers.authorization !== `Bearer ${expected}`) return res.status(401).json({ error: 'Unauthorized.' })

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || !process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Outbox worker is not configured.' })

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data: events, error } = await supabase.rpc('workspace_claim_outbox', { p_limit: 10 })
  if (error) return res.status(500).json({ error: 'Outbox claim failed.' })

  let sent = 0
  for (const event of events || []) {
    try {
      const message = render(event)
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Curated Brazil <applications@curatedbraziltravel.com>',
        ...message,
      }, { idempotencyKey: `workspace-outbox-${event.event_id}` })
      if (result.error) throw new Error(result.error.name || 'resend_error')
      await supabase.rpc('workspace_complete_outbox', { p_event_id: event.event_id, p_provider_message_id: result.data?.id || null })
      sent += 1
    } catch (sendError) {
      await supabase.rpc('workspace_fail_outbox', { p_event_id: event.event_id, p_error_code: sendError.name || 'delivery_error' })
    }
  }
  return res.status(200).json({ ok: true, claimed: events?.length || 0, sent })
}
