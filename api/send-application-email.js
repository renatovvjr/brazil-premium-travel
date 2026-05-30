import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const recipientEmail = 'hello@curatedbraziltravel.com'
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Curated Brazil <onboarding@resend.dev>'

const formatValue = (value, fallback = 'Not provided') => {
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : fallback
  }

  if (typeof value === 'string') {
    return value.trim() || fallback
  }

  return value ?? fallback
}

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const parseBody = (body) => {
  if (!body) {
    return {}
  }

  if (typeof body === 'string') {
    return JSON.parse(body)
  }

  return body
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email delivery is not configured' })
  }

  let application

  try {
    application = parseBody(req.body)
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const fields = [
    ['Full Name', formatValue(application.full_name)],
    ['Email Address', formatValue(application.email)],
    ['WhatsApp Number', formatValue(application.whatsapp)],
    ['Number of Travelers', formatValue(application.travelers)],
    ['Journey Date', 'September 4th, 2026'],
    ['Previous Brazil Experience', formatValue(application.visited_brazil)],
    ['Cities or Regions Visited', formatValue(application.visited_places)],
    ['Selected Experience Types', formatValue(application.experience_interests, 'To be discussed')],
    ['Estimated Budget Range', formatValue(application.budget_range)],
    ['Dream Experience Description', formatValue(application.dream_experience)],
    ['Submission Timestamp', formatValue(application.submission_timestamp)],
  ]

  const text = fields.map(([label, value]) => `${label}: ${value}`).join('\n')
  const htmlRows = fields
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #eee;font-weight:600;color:#18181b;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #eee;color:#3f3f46;vertical-align:top;">${escapeHtml(value).replace(/\n/g, '<br />')}</td>
        </tr>
      `,
    )
    .join('')

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      replyTo: application.email,
      subject: 'New Luxury Journey Application — Curated Brazil',
      text,
      html: `
        <div style="margin:0;padding:24px;background:#fbfaf7;font-family:Arial,sans-serif;color:#18181b;">
          <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #eadfbe;border-radius:18px;overflow:hidden;">
            <div style="padding:28px 32px;background:#11100d;color:#ffffff;">
              <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#f1d991;">Curated Brazil</p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;">New Luxury Journey Application</h1>
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tbody>${htmlRows}</tbody>
            </table>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend application email failed:', error)
      return res.status(502).json({ error: 'Email could not be sent' })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Application email notification failed:', error)
    return res.status(502).json({ error: 'Email could not be sent' })
  }
}
