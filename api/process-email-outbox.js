import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { CONTACT, escapeHtml, renderEnquiryEmail } from './_lib/transactionalEmail.js'

const renderBooking = (event) => {
  const data = event.payload || {}
  const name = escapeHtml(data.fullName || 'Traveller')
  return {
    to: data.email,
    subject: 'Your Curated Brazil booking is confirmed',
    html: `<p>Dear ${name},</p><p>We have confirmed your booking <strong>${escapeHtml(data.reference)}</strong>. Our team will be in touch with your travel details.</p>`,
  }
}

async function loadEnquiryMetadata(supabase, events) {
  const ids = [...new Set(events.filter((event) => event.template_key !== 'booking_confirmation')
    .map((event) => event.submission_id).filter(Boolean))]
  if (!ids.length) return new Map()
  try {
    const { data, error } = await supabase.from('workspace_form_submissions')
      .select('id,reference,form_type,received_at,attribution,product:workspace_products(code,name),departure:workspace_departures(code,starts_on,ends_on)')
      .in('id', ids)
    if (!error) return new Map((data || []).map((submission) => [submission.id, submission]))
  } catch {
    // The normal outbox failure path retries each enquiry. Booking emails can still be sent.
  }
  return new Map()
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

  const submissions = await loadEnquiryMetadata(supabase, events || [])
  let sent = 0
  for (const event of events || []) {
    try {
      const message = event.template_key === 'booking_confirmation' ? renderBooking(event)
        : renderEnquiryEmail(event, submissions.get(event.submission_id), process.env.APPLICATION_TO_EMAIL || CONTACT)
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Curated Brazil <applications@curatedbraziltravel.com>',
        ...message,
      }, { idempotencyKey: `workspace-outbox-${event.event_id}` })
      if (result.error) throw new Error(result.error.name || 'resend_error')
      if (!result.data?.id) throw new Error('missing_provider_message_id')
      const { error: completionError } = await supabase.rpc('workspace_complete_outbox', {
        p_event_id: event.event_id, p_provider_message_id: result.data.id,
      })
      if (completionError) throw new Error('outbox_completion_failed')
      sent += 1
    } catch (sendError) {
      await supabase.rpc('workspace_fail_outbox', { p_event_id: event.event_id, p_error_code: sendError.message || 'delivery_error' })
    }
  }
  return res.status(200).json({ ok: true, claimed: events?.length || 0, sent })
}
