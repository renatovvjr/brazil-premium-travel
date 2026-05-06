import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { firstName, email } = req.body

    const { error } = await resend.emails.send({
      from: 'Renato Valle <onboarding@resend.dev>',
      to: email,
      subject: 'We received your enquiry',
      html: `
        <h2>Thank you for your interest</h2>
        <p>Hi ${firstName},</p>
        <p>We received your enquiry about the Brazil Ultimate Signature Journey.</p>
        <p>We will send you more details shortly.</p>
        <p>Best regards,<br/>Renato Valle</p>
      `,
    })

    if (error) {
      return res.status(500).json({ error })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error' })
  }
}
