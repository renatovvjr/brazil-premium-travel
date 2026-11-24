import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export default function UnsubscribePage() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', [])
  const [state, setState] = useState('idle')
  const [message, setMessage] = useState('')

  const unsubscribe = async () => {
    setState('loading')
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const result = await response.json().catch(() => ({}))
      setMessage(response.ok ? 'Your marketing preference has been updated.' : result.error || 'Your preference could not be updated.')
      setState(response.ok ? 'done' : 'error')
    } catch {
      setMessage('Your preference could not be updated. Please try again.')
      setState('error')
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-6 py-12 text-[var(--color-deep-forest)]">
    <section className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-[var(--color-luxury-gold)]/25 bg-white shadow-[0_28px_80px_rgba(24,24,27,.12)]">
      <div className="bg-[var(--color-deep-forest)] px-8 py-9 text-white"><p className="eyebrow text-[#f1d991]">Curated Brazil</p><h1 className="mt-4 text-3xl font-semibold">Marketing preferences</h1></div>
      <div className="p-8">
        {state === 'idle' && <><p className="leading-7 text-zinc-600">Confirm that you no longer wish to receive marketing messages through this channel. Essential booking and service communications are unaffected.</p><button disabled={!token} onClick={unsubscribe} className="gold-button mt-7">Confirm unsubscribe</button></>}
        {state === 'loading' && <p>Updating your preference…</p>}
        {(state === 'done' || state === 'error') && <p className={state === 'done' ? 'text-emerald-700' : 'text-red-700'}>{message}</p>}
        <Link to="/" className="mt-7 block text-xs font-semibold uppercase tracking-wider text-[#8b6a21]">Return to Curated Brazil</Link>
      </div>
    </section>
  </main>
}
