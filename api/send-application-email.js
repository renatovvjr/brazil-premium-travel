import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const recipientEmail = 'hello@curatedbraziltravel.com'
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Curated Brazil <onboarding@resend.dev>'

const isValidEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

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
  const applicantName = formatValue(application.full_name, 'Guest')
  const applicantEmail = typeof application.email === 'string' ? application.email.trim() : ''
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

    if (isValidEmail(applicantEmail)) {
      try {
        const customerText = `Dear ${applicantName},

Thank you for your interest in Curated Brazil.

We have received your application for our inaugural luxury journey departing on September 4th, 2026.

Our team is now carefully reviewing your preferences and travel aspirations. Over the next few days, we will contact you to discuss the next steps of your personalized experience.

This journey has been designed for a small group of selected guests seeking authenticity, comfort, exclusivity and unforgettable memories across Brazil.

You are now one step closer to experiencing Brazil through a private collection of extraordinary destinations, authentic connections and moments you may remember for a lifetime.

Warm regards,

Curated Brazil
Luxury Travel Experiences
hello@curatedbraziltravel.com
www.curatedbraziltravel.com`

        const { error: customerEmailError } = await resend.emails.send({
          from: fromEmail,
          to: applicantEmail,
          cc: recipientEmail,
          replyTo: recipientEmail,
          subject: 'Your Curated Brazil Journey Begins ✨',
          text: customerText,
          html: `
            <div style="margin:0;padding:0;background:#fbfaf7;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
              <div style="max-width:680px;margin:0 auto;padding:32px 18px;">
                <div style="overflow:hidden;border:1px solid #eadfbe;border-radius:20px;background:#ffffff;box-shadow:0 20px 60px rgba(24,24,27,0.08);">
                  <div style="padding:34px 34px 30px;background:#11100d;color:#ffffff;">
                    <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#f1d991;">Curated Brazil</p>
                    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.25;font-weight:400;color:#ffffff;">Your Journey Begins</h1>
                    <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#eee6cf;">Luxury Travel Experiences across Brazil</p>
                  </div>

                  <div style="padding:34px;color:#292524;">
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.8;">Dear ${escapeHtml(applicantName)},</p>

                    <p style="margin:0 0 18px;font-size:16px;line-height:1.8;">Thank you for your interest in Curated Brazil.</p>

                    <p style="margin:0 0 18px;font-size:16px;line-height:1.8;">We have received your application for our inaugural luxury journey departing on <strong style="color:#18181b;">September 4th, 2026</strong>.</p>

                    <p style="margin:0 0 18px;font-size:16px;line-height:1.8;">Our team is now carefully reviewing your preferences and travel aspirations. Over the next few days, we will contact you to discuss the next steps of your personalized experience.</p>

                    <p style="margin:0 0 18px;font-size:16px;line-height:1.8;">This journey has been designed for a small group of selected guests seeking authenticity, comfort, exclusivity and unforgettable memories across Brazil.</p>

                    <p style="margin:0 0 28px;font-size:16px;line-height:1.8;">You are now one step closer to experiencing Brazil through a private collection of extraordinary destinations, authentic connections and moments you may remember for a lifetime.</p>

                    <div style="height:1px;background:#eadfbe;margin:0 0 26px;"></div>

                    <p style="margin:0 0 6px;font-size:16px;line-height:1.7;">Warm regards,</p>
                    <p style="margin:0;font-size:16px;line-height:1.7;font-weight:700;color:#18181b;">Curated Brazil</p>
                    <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#57534e;">Luxury Travel Experiences</p>
                    <p style="margin:0;font-size:14px;line-height:1.8;">
                      <a href="mailto:hello@curatedbraziltravel.com" style="color:#8a6d1d;text-decoration:none;">hello@curatedbraziltravel.com</a><br />
                      <a href="https://www.curatedbraziltravel.com" style="color:#8a6d1d;text-decoration:none;">www.curatedbraziltravel.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `,
        })

        if (customerEmailError) {
          console.error('Resend customer confirmation email failed:', customerEmailError)
        }
      } catch (error) {
        console.error('Customer confirmation email failed:', error)
      }
    } else {
      console.error('Customer confirmation email skipped: invalid or missing applicant email')
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Application email notification failed:', error)
    return res.status(502).json({ error: 'Email could not be sent' })
  }
}
