import { useEffect, useMemo, useState } from 'react'
import { useI18n } from './i18n'
import { workspaceSupabase } from './lib/workspaceSupabase'
import { workspaceEnquiryCopy } from './locales/workspaceEnquiries'

export const enquiryFormTypes = ['signature_application', 'carnaval_enquiry', 'whatsapp_consultation']

export function useEnquiryPresentation() {
  const { locale, localeMeta } = useI18n()
  const copy = workspaceEnquiryCopy[localeMeta.contentLocale || locale] || workspaceEnquiryCopy['en-AU']
  const formatter = useMemo(() => new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    timeZone: 'Australia/Sydney', timeZoneName: 'short',
  }), [locale])
  return { copy, receivedTime: (timestamp) => formatter.format(new Date(timestamp)) }
}

const submittedFields = [
  'fullName', 'email', 'phone', 'countryOfResidence', 'city', 'travellers', 'visitedBrazil',
  'visitedPlaces', 'interests', 'budget', 'accommodation', 'internationalFlights',
  'departureCity', 'referralSource', 'message',
]

export function EnquirySummary({ enquiry, canonicalName, presentation: { copy, receivedTime } }) {
  const submittedName = enquiry.submitted_name?.trim()
  const showSubmittedName = submittedName && submittedName !== canonicalName?.trim()

  return <div className="min-w-0 space-y-1">
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <bdi className="break-all rounded-md bg-[var(--color-luxury-gold)]/15 px-2 py-0.5 font-mono text-xs font-semibold">{enquiry.reference}</bdi>
      <span className="font-medium">{copy[enquiry.form_type]}</span>
    </div>
    {showSubmittedName && <p className="break-words text-zinc-600">{copy.submittedAs} <bdi className="font-medium">{submittedName}</bdi></p>}
    <p className="text-xs text-zinc-600"><time dateTime={enquiry.received_at}>{receivedTime(enquiry.received_at)}</time></p>
  </div>
}

export function EnquiryDetails({ enquiryId, copy }) {
  const [requested, setRequested] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!requested) return
    let current = true
    workspaceSupabase.from('workspace_form_submissions').select('payload').eq('id', enquiryId).maybeSingle()
      .then(({ data, error }) => {
        if (current) setResult({ payload: data?.payload, unavailable: Boolean(error || !data) })
      })
    return () => { current = false }
  }, [enquiryId, requested])

  return <details className="mt-2" onToggle={(event) => { if (event.currentTarget.open) setRequested(true) }}>
    <summary className="table-action w-fit cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2">{copy.details}</summary>
    {!result ? <p role="status" className="mt-2 text-sm text-zinc-600">{copy.loading}</p>
      : result.unavailable ? <p role="status" className="mt-2 text-sm text-zinc-600">{copy.detailsUnavailable}</p>
        : <dl className="mt-3 grid min-w-0 gap-x-4 gap-y-2 border-s border-[var(--color-luxury-gold)]/50 ps-3 text-sm sm:grid-cols-2">
          {submittedFields.map((field) => {
            const raw = result.payload?.[field]
            const value = Array.isArray(raw) ? raw.join(', ') : raw
            if (value == null || value === '') return null
            return <div key={field} className={field === 'message' ? 'sm:col-span-2' : ''}>
              <dt className="text-xs font-semibold text-zinc-600">{copy[field]}</dt>
              <dd className="whitespace-pre-wrap break-words" dir="auto">{String(value)}</dd>
            </div>
          })}
        </dl>}
  </details>
}
