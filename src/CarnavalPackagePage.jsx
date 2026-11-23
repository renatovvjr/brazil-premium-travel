import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Gem, Info, MapPin, Plane, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { carnavalCommercial, getCarnavalPackage } from './carnavalContent'
import { DestinationEditorial, ResponsiveCarnavalImage } from './CarnavalDestinations'
import { CarnavalFooter, CarnavalNav, JourneyMeta, reveal, usePageTop } from './CarnavalShared'

const getInitialEnquiry = () => ({
  fullName: '',
  email: '',
  phone: '',
  countryOfResidence: '',
  departureCity: '',
  travellers: '2',
  accommodation: 'Double / Twin Share',
  internationalFlights: 'Exclude international flights',
  message: '',
})

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-[#263756]">{label}</span>
      {children}
    </label>
  )
}

function CarnavalEnquiryForm({ journey }) {
  const [form, setForm] = useState(getInitialEnquiry)
  const [status, setStatus] = useState('idle')
  const [preview, setPreview] = useState('')
  const includeInternationalFlights = form.internationalFlights === 'Include return international flights'

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setStatus('idle')
  }

  const buildPreview = () => `Subject: New Carnaval 2027 Enquiry — ${journey.title}

Package: CARNAVAL 2027 — ${journey.title.toUpperCase()}
Dates and duration: ${journey.dates} · ${journey.duration}
Guest: ${form.fullName}
Email: ${form.email}
Phone / WhatsApp: ${form.phone}
Country of residence: ${form.countryOfResidence}
Number of travellers: ${form.travellers}
Accommodation: ${form.accommodation}
International flights: ${form.internationalFlights}
Departure city / airport: ${includeInternationalFlights ? form.departureCity : 'Not applicable — international flights excluded'}
Additional requests: ${form.message || 'None provided'}`

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (includeInternationalFlights && !form.departureCity.trim()) {
      setStatus('missing-departure')
      return
    }

    const messagePreview = buildPreview()
    setPreview(messagePreview)
    setStatus('sending')

    const payload = {
      application_type: 'carnaval_2027_enquiry',
      package_id: journey.id,
      preferred_journey: `CARNAVAL 2027 — ${journey.title.toUpperCase()}`,
      journey_title: journey.title,
      journey_dates: journey.dates,
      journey_duration: journey.duration,
      full_name: form.fullName,
      email: form.email,
      whatsapp: form.phone,
      country_of_residence: form.countryOfResidence,
      departure_city_airport: includeInternationalFlights ? form.departureCity : '',
      travelers: form.travellers,
      preferred_accommodation: form.accommodation,
      international_flights: form.internationalFlights,
      additional_requests: form.message,
      submission_timestamp: new Date().toISOString(),
      source: 'carnaval_2027_package_enquiry',
    }

    if (import.meta.env.DEV) {
      setStatus('preview')
      return
    }

    try {
      const response = await fetch('/api/send-application-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        setStatus(response.status === 403 ? 'preview' : 'error')
        return
      }

      setStatus('sent')
    } catch (error) {
      console.error('Carnaval enquiry could not be submitted:', error)
      setStatus('error')
    }
  }

  const inputClass = 'w-full rounded-2xl border border-[#07152d]/15 bg-white px-4 py-3.5 text-base text-[#07152d] outline-none transition placeholder:text-[#7a8497] focus:border-[#a31965] focus:ring-4 focus:ring-[#a31965]/10'

  return (
    <section id="consultation" className="scroll-mt-6 bg-[#07152d] px-5 py-16 text-white md:px-8 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr]">
        <motion.div {...reveal}>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#e2c97f]">Dedicated journey enquiry</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">Enquire about this journey.</h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/68">Tell us how you would like to travel. International airfare will be quoted personally from your departure city and is never calculated automatically.</p>
          <div className="mt-8 rounded-[1.5rem] border border-[#d7b866]/25 bg-white/[0.06] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e2c97f]">Selected package</p>
            <p className="mt-3 text-2xl font-semibold">{journey.title}</p>
            <p className="mt-3 leading-7 text-white/65">{journey.dates} · {journey.duration}</p>
            <p className="mt-4 font-semibold leading-7 text-white">{journey.price}</p>
            <p className="mt-3 text-sm italic leading-6 text-white/48">{carnavalCommercial.priceNote}</p>
          </div>
        </motion.div>

        <motion.form {...reveal} onSubmit={handleSubmit} className="rounded-[2rem] bg-[#f7f5f1] p-6 text-[#07152d] shadow-[0_30px_100px_rgba(0,0,0,0.3)] md:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name">
              <input className={inputClass} name="fullName" value={form.fullName} onChange={updateField} autoComplete="name" required />
            </Field>
            <Field label="Email">
              <input className={inputClass} name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required />
            </Field>
            <Field label="Phone / WhatsApp">
              <input className={inputClass} name="phone" type="tel" value={form.phone} onChange={updateField} autoComplete="tel" required />
            </Field>
            <Field label="Country of Residence">
              <input className={inputClass} name="countryOfResidence" value={form.countryOfResidence} onChange={updateField} autoComplete="country-name" required />
            </Field>
            <Field label="Number of Travellers">
              <input className={inputClass} name="travellers" type="number" min="1" max={journey.maxTravelers} value={form.travellers} onChange={updateField} required />
            </Field>
            <Field label="Preferred Accommodation">
              <span className="relative block">
                <select className={`${inputClass} appearance-none pr-12`} name="accommodation" value={form.accommodation} onChange={updateField}>
                  <option>Double / Twin Share</option>
                  <option>Single Occupancy</option>
                </select>
                <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-[#a31965]">⌄</span>
              </span>
            </Field>
            <Field label="International Flights" className="sm:col-span-2">
              <div className="grid gap-3 sm:grid-cols-2">
                {['Include return international flights', 'Exclude international flights'].map((option) => (
                  <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${form.internationalFlights === option ? 'border-[#a31965] bg-[#a31965]/7' : 'border-[#07152d]/12 bg-white'}`}>
                    <input type="radio" name="internationalFlights" value={option} checked={form.internationalFlights === option} onChange={updateField} className="h-4 w-4 accent-[#a31965]" />
                    <span className="text-sm font-semibold">{option}</span>
                  </label>
                ))}
              </div>
              <span className="mt-2 block text-sm leading-6 text-[#677287]">All domestic flights in the itinerary are included with either option.</span>
            </Field>
            {includeInternationalFlights && (
              <Field label="Departure City / Airport" className="sm:col-span-2">
                <input className={inputClass} name="departureCity" value={form.departureCity} onChange={updateField} placeholder="For example, Sydney (SYD)" required />
              </Field>
            )}
            <Field label="Additional Requests / Message" className="sm:col-span-2">
              <textarea className={`${inputClass} min-h-36 resize-y`} name="message" value={form.message} onChange={updateField} />
            </Field>
          </div>

          {status === 'missing-departure' && <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-900">Please provide your departure city or airport so international flights can be quoted.</p>}
          {status === 'error' && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-800">Your enquiry could not be sent. Please try again or email hello@curatedbraziltravel.com.</p>}
          {status === 'sent' && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">Thank you. Your package-specific enquiry has been sent to Curated Brazil Travel.</p>}
          {status === 'preview' && (
            <div className="mt-5 rounded-2xl border border-[#d7b866]/45 bg-[#fffaf0] p-5">
              <p className="font-semibold text-[#6e5618]">Development preview validated — no email was sent.</p>
              <p className="mt-2 text-sm leading-6 text-[#6f6653]">Email delivery remains disabled outside Production. The message below is what the team will receive in Production.</p>
              <pre className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-white p-4 font-sans text-sm leading-6 text-[#46536b]">{preview}</pre>
            </div>
          )}

          <button type="submit" disabled={status === 'sending'} className="mt-7 w-full rounded-full bg-[#d7b866] px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#07152d] transition hover:bg-[#ead491] disabled:cursor-wait disabled:opacity-65">
            {status === 'sending' ? 'Preparing enquiry…' : 'Enquire About This Journey'}
          </button>
          <p className="mt-4 text-center text-sm leading-6 text-[#6c7689]">Submitting this form begins your tailored quotation process. Final arrangements and availability will be documented in writing before booking confirmation.</p>
        </motion.form>
      </div>
    </section>
  )
}

function JourneySwitcher({ currentId }) {
  const journeys = [
    ['grand-journey', '/carnaval/grand-journey', 'Grand Carnaval Journey'],
    ['rio-bahia', '/carnaval/rio-bahia', 'Rio & Bahia Carnaval Escape'],
    ['rio-minas', '/carnaval/rio-minas', 'Rio & Minas Carnaval Heritage'],
  ]

  return (
    <section className="px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">Explore the complete collection</p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {journeys.map(([id, path, label]) => (
            <Link key={id} to={path} aria-current={id === currentId ? 'page' : undefined} className={`rounded-2xl border px-5 py-4 text-center font-semibold transition ${id === currentId ? 'border-[#a31965] bg-[#a31965] text-white' : 'border-[#07152d]/12 bg-white hover:border-[#d7b866] hover:bg-[#fffaf0]'}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ItinerarySection({ journey }) {
  return (
    <section id="itinerary" className="scroll-mt-8 bg-[#eee8ed] px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div {...reveal} className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">Day-by-day itinerary</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">A thoughtfully designed journey, one chapter at a time.</h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[#536078] lg:justify-self-end">
            Each day balances authentic cultural encounters, coordinated travel, premium experiences and time to enjoy Brazil at a considered pace.
          </p>
        </motion.div>

        <ol className="mt-10 grid gap-4 lg:grid-cols-2">
          {journey.itinerary.map((item, index) => (
            <motion.li
              key={`${item.day}-${item.date}`}
              {...reveal}
              transition={{ ...reveal.transition, delay: Math.min(index * 0.025, 0.18) }}
              className="grid gap-5 rounded-[1.5rem] border border-[#07152d]/10 bg-white p-6 shadow-[0_18px_55px_rgba(7,21,45,0.055)] sm:grid-cols-[3.25rem_1fr]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#07152d] text-sm font-semibold text-[#e2c97f]" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                  <span className="font-semibold text-[#a31965]">{item.day}</span>
                  <span className="text-[#7a8497]">{item.date}</span>
                  <span className="inline-flex items-center gap-1.5 text-[#536078]"><MapPin size={14} aria-hidden="true" />{item.location}</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 leading-7 text-[#5b667a]">{item.description}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function CommercialDetails({ journey }) {
  return (
    <>
      <section id="commercial-details" className="scroll-mt-8 bg-[#07152d] px-5 py-16 text-white md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal} className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#e2c97f]">Travel and pricing options</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">One journey, two ways to arrange your international travel.</h2>
            </div>
            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-lg leading-8 text-white/68">Choose whether to include return international flights. Every scheduled domestic flight in the itinerary remains included with either option.</p>
              <p className="mt-5 inline-flex rounded-full border border-[#d7b866]/35 bg-[#d7b866]/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#e2c97f]">{carnavalCommercial.priceStatus}</p>
            </div>
          </motion.div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {carnavalCommercial.flightOptions.map((option, index) => (
              <motion.article key={option.id} {...reveal} transition={{ ...reveal.transition, delay: index * 0.08 }} className="rounded-[1.75rem] border border-white/12 bg-white/[0.055] p-7 backdrop-blur-sm md:p-9">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d7b866]/14 text-[#e2c97f]"><Plane size={20} aria-hidden="true" /></span>
                <h3 className="mt-6 text-2xl font-semibold">{option.label}</h3>
                <p className="mt-4 leading-7 text-white/68">{option.description}</p>
              </motion.article>
            ))}
          </div>

          <motion.div {...reveal} className="mt-8 rounded-[1.75rem] border border-white/12 bg-white/[0.04] p-7 md:p-9">
            <h3 className="text-2xl font-semibold">Accommodation and occupancy choices</h3>
            <p className="mt-3 max-w-3xl leading-7 text-white/62">Carefully selected premium 4-star hotels, standard rooms and daily breakfast are included. Final hotels and room categories will be specified in the written proposal.</p>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {carnavalCommercial.occupancyOptions.map((option) => (
                <div key={option.label} className="rounded-2xl border border-white/10 bg-black/15 p-5">
                  <p className="text-sm leading-6 text-white/62">{option.label}</p>
                  <p className="mt-3 font-semibold text-[#e2c97f]">{option.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal} className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">What the proposal covers</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">Included services, clearly presented.</h2>
          </motion.div>

          <div className="mt-12 grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.article {...reveal} className="rounded-[2rem] border border-[#07152d]/10 bg-white p-7 shadow-[0_24px_75px_rgba(7,21,45,0.08)] md:p-10">
              <h3 className="text-2xl font-semibold">Included in this package</h3>
              <div className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  ...carnavalCommercial.inclusions,
                  ...(journey.includesSalvadorHospitality ? [carnavalCommercial.salvadorInclusion] : []),
                ].map((item) => (
                  <div key={item} className="flex gap-3 border-b border-[#07152d]/8 pb-4">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c0267b]/10 text-[#a31965]"><Check size={14} aria-hidden="true" /></span>
                    <p className="leading-7 text-[#536078]">{item}</p>
                  </div>
                ))}
              </div>
              <p id="hospitality-conditions" className="mt-7 rounded-2xl border border-[#a31965]/15 bg-[#f8f2f5] p-5 text-base leading-7 text-[#536078]">{carnavalCommercial.hospitalityNotice}</p>
            </motion.article>

            <div className="space-y-7">
              <motion.article {...reveal} className="rounded-[2rem] border border-[#07152d]/10 bg-[#f1ece3] p-7 md:p-9">
                <h3 className="text-2xl font-semibold">Not included</h3>
                <div className="mt-6 space-y-4">
                  {carnavalCommercial.exclusions.map((item) => (
                    <p key={item} className="border-b border-[#07152d]/10 pb-4 leading-7 text-[#5f625f] last:border-0 last:pb-0">{item}</p>
                  ))}
                </div>
              </motion.article>

              <motion.article {...reveal} className="rounded-[2rem] border border-[#07152d]/10 bg-white p-7 md:p-9">
                <h3 className="text-2xl font-semibold">Optional experiences</h3>
                {journey.optionalExperiences.length ? (
                  <div className="mt-6 space-y-4">
                    {journey.optionalExperiences.map((item) => <p key={item} className="leading-7 text-[#536078]">{item}</p>)}
                  </div>
                ) : (
                  <p className="mt-6 leading-7 text-[#536078]">This itinerary is designed as a complete journey. Any tailored additions you request will be clearly identified in the final proposal.</p>
                )}
              </motion.article>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eee8ed] px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.article {...reveal} className="rounded-[2rem] bg-white p-7 shadow-[0_24px_75px_rgba(7,21,45,0.07)] md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#a31965]">Arrival and departure</p>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Meet the journey in São Paulo.</h2>
            <p className="mt-5 rounded-2xl bg-[#07152d] p-5 font-semibold text-white">Required arrival date: {journey.arrivalDate}</p>
            <div className="mt-7 space-y-4">
              {carnavalCommercial.arrivalAndDeparture.map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c0267b]/10 text-[#a31965]"><Check size={14} aria-hidden="true" /></span>
                  <p className="leading-7 text-[#536078]">{item}</p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article {...reveal} className="rounded-[2rem] bg-[#07152d] p-7 text-white shadow-[0_24px_75px_rgba(7,21,45,0.16)] md:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d7b866]/14 text-[#e2c97f]"><Info size={20} aria-hidden="true" /></span>
            <h2 className="mt-6 text-3xl font-semibold md:text-4xl">Booking and journey coordination</h2>
            <div className="mt-7 space-y-4 text-white/70">
              {journey.operationalNotes.map((item) => <p key={item} className="border-b border-white/10 pb-4 leading-7 last:border-0">{item}</p>)}
            </div>
            <p className="mt-7 rounded-2xl border border-[#d7b866]/20 bg-[#d7b866]/8 p-5 text-sm leading-7 text-white/65">{carnavalCommercial.supplierNotice}</p>
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-white/60">{carnavalCommercial.assistanceNotice}</p>
          </motion.article>
        </div>
      </section>
    </>
  )
}

export default function CarnavalPackagePage({ packageId }) {
  const journey = getCarnavalPackage(packageId)
  usePageTop()

  if (!journey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07152d] px-5 text-center text-white">
        <div>
          <p className="text-sm uppercase tracking-[0.26em] text-[#e2c97f]">Carnaval Collection 2027</p>
          <h1 className="mt-4 text-4xl font-semibold">Journey not found</h1>
          <Link to="/carnaval" className="mt-8 inline-flex rounded-full bg-[#d7b866] px-6 py-3 font-semibold text-[#07152d]">Return to the collection</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f5f1] text-[#07152d]">
      <header className="relative min-h-[88vh] overflow-hidden bg-[#050b1b] text-white">
        <CarnavalNav />
        <ResponsiveCarnavalImage image={journey.hero} alt={journey.title} className="absolute inset-0 h-full w-full object-cover object-[60%_center] opacity-92 brightness-[1.05] saturate-[1.1] md:object-center" eager />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,27,0.93)_0%,rgba(5,11,27,0.72)_40%,rgba(5,11,27,0.16)_74%,rgba(5,11,27,0.03)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,27,0.24)_0%,transparent_45%,rgba(5,11,27,0.60)_100%),radial-gradient(circle_at_80%_22%,rgba(192,38,123,0.16),transparent_28%),radial-gradient(circle_at_68%_76%,rgba(215,184,102,0.12),transparent_30%)]" />

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl items-center px-5 pb-16 pt-32 md:px-8">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="max-w-5xl [text-shadow:0_3px_22px_rgba(0,0,0,0.42)]">
            <Link to="/carnaval" className="inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/80 backdrop-blur-md transition hover:border-[#d7b866]/60 hover:text-[#e2c97f]">
              Back to the collection
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#e2c97f]">{journey.tier} · Carnaval Collection 2027</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1] tracking-[-0.04em] text-balance md:text-7xl">{journey.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{journey.summary}</p>
            <div className="mt-9 max-w-5xl"><JourneyMeta item={journey} light /></div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#consultation" className="rounded-full bg-[#d7b866] px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-[#07152d] transition hover:bg-[#ead491]">Enquire About This Journey</a>
              <span className="px-2 text-center font-semibold text-white sm:text-left">{journey.price}</span>
            </div>
            <p className="mt-4 max-w-2xl text-sm italic leading-6 text-white/48">{carnavalCommercial.priceNote}</p>
          </motion.div>
        </div>
      </header>

      <main>
        <section className="px-5 py-16 md:px-8 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <motion.div {...reveal}>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">Journey at a glance</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">A layered expression of Brazil in celebration.</h2>
              <p className="mt-6 text-lg leading-8 text-[#536078]">
                This carefully curated journey combines Carnaval’s intensity with a more measured view of the destinations around it, bringing together cultural immersion, coordinated travel, premium hospitality and personalised attention.
              </p>
              <div className="mt-8 rounded-[1.75rem] bg-[#07152d] p-6 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-[#e2c97f]">Journey route</p>
                <div className="mt-5 flex flex-wrap items-center gap-2" aria-label={`Journey route: ${journey.route.join(' to ')}`}>
                  {journey.route.map((destination, index) => (
                    <div key={`${destination}-${index}`} className="flex items-center gap-2">
                      <span className="rounded-full border border-white/12 bg-white/[0.07] px-4 py-2 text-sm text-white/75">{destination}</span>
                      {index < journey.route.length - 1 && <span className="text-[#e2c97f]" aria-hidden="true">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div {...reveal} className="rounded-[2rem] border border-[#0a1730]/10 bg-white p-7 shadow-[0_24px_75px_rgba(7,21,45,0.08)] md:p-10">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#efe4c0] text-[#8b6a16]"><Sparkles size={19} /></span>
                <h2 className="text-2xl font-semibold">Journey highlights</h2>
              </div>
              <div className="mt-7 space-y-5">
                {journey.highlights.map((highlight) => (
                  <div key={highlight} className="flex gap-4 border-b border-[#0a1730]/10 pb-5 last:border-0 last:pb-0">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c0267b]/10 text-[#a31965]"><Check size={14} /></span>
                    <p className="leading-7 text-[#536078]">{highlight}</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 rounded-2xl bg-[#f5f1e8] p-5 text-sm leading-6 text-[#665f4d]">
                Each highlight forms part of the journey design. Final arrangements are documented in your written proposal, with premium Carnaval hospitality subject to the conditions stated on this page.
              </p>
            </motion.div>
          </div>
        </section>

        <ItinerarySection journey={journey} />

        {journey.editorialDestinations.map((destinationId, index) => (
          <DestinationEditorial key={destinationId} destinationId={destinationId} index={index} />
        ))}

        <CommercialDetails journey={journey} />

        <section className="px-5 py-16 md:px-8 md:py-20">
          <motion.div {...reveal} className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-[#0a1730]/10 bg-white p-7 shadow-[0_24px_75px_rgba(7,21,45,0.08)] md:grid-cols-3 md:p-10">
            {[
              [Gem, 'Positioning', journey.tier],
              [Users, 'Group size', `Maximum ${journey.maxTravelers} travellers`],
              [Sparkles, 'Journey team', 'Dedicated bilingual Tour Leader'],
            ].map(([Icon, label, value]) => (
              <div key={label} className="border-b border-[#0a1730]/10 pb-6 last:border-0 last:pb-0 md:border-b-0 md:border-r md:pb-0 md:pr-6 md:last:border-r-0">
                <Icon size={20} className="text-[#a31965]" />
                <p className="mt-4 text-sm uppercase tracking-[0.18em] text-[#7a8497]">{label}</p>
                <p className="mt-2 text-xl font-semibold">{value}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <JourneySwitcher currentId={journey.id} />
        <CarnavalEnquiryForm journey={journey} />
      </main>

      <CarnavalFooter />
    </div>
  )
}
