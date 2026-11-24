import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { isValidUnsubscribeToken } from '../src/lib/workspaceDomain.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })
  const token = String(req.body?.token || '')
  if (!isValidUnsubscribeToken(token)) return res.status(400).json({ error: 'Invalid unsubscribe link.' })

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return res.status(503).json({ error: 'Unsubscribe service is not configured.' })

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const { data, error } = await supabase.rpc('workspace_consume_unsubscribe', { p_token_hash: tokenHash })
  if (error) return res.status(500).json({ error: 'Your preference could not be updated.' })
  if (!data) return res.status(410).json({ error: 'This unsubscribe link is invalid or has expired.' })
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ ok: true })
}
