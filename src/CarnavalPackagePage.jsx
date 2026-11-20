import { motion } from 'framer-motion'
import { Check, Gem, Info, MapPin, Plane, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { carnavalCommercial, getCarnavalPackage } from './carnavalContent'
import { DestinationEditorial, ResponsiveCarnavalImage } from './CarnavalDestinations'
import { CarnavalFooter, CarnavalNav, ConsultationBlock, JourneyMeta, reveal, usePageTop } from './CarnavalShared'

function ItinerarySection({ journey }) {
  return (
    <section id="itinerary" className="scroll-mt-8 bg-[#eee8ed] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...reveal} className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">Day-by-day itinerary</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">The intended journey, one chapter at a time.</h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[#536078] lg:justify-self-end">
            The sequence below is the current operating plan. Flight schedules, event access and supplier arrangements remain subject to confirmation and availability.
          </p>
        </motion.div>

        <ol className="mt-14 grid gap-4 lg:grid-cols-2">
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
      <section id="commercial-details" className="scroll-mt-8 bg-[#07152d] px-5 py-20 text-white md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal} className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#e2c97f]">Travel and pricing options</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">One journey, two ways to arrange your international travel.</h2>
            </div>
            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-lg leading-8 text-white/68">Each Carnaval package operates independently with its own dedicated bilingual Tour Leader.</p>
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
            <p className="mt-3 max-w-3xl leading-7 text-white/62">Four- and five-star hotel accommodation with daily breakfast is included. Final hotels and room categories will be specified in the written proposal.</p>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
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

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal} className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">What the proposal covers</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">Included services, clearly presented.</h2>
          </motion.div>

          <div className="mt-12 grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.article {...reveal} className="rounded-[2rem] border border-[#07152d]/10 bg-white p-7 shadow-[0_24px_75px_rgba(7,21,45,0.08)] md:p-10">
              <h3 className="text-2xl font-semibold">Included in every package</h3>
              <div className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {carnavalCommercial.inclusions.map((item) => (
                  <div key={item} className="flex gap-3 border-b border-[#07152d]/8 pb-4">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c0267b]/10 text-[#a31965]"><Check size={14} aria-hidden="true" /></span>
                    <p className="leading-7 text-[#536078]">{item}</p>
                  </div>
                ))}
              </div>
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
                  <p className="mt-6 leading-7 text-[#536078]">No separate optional add-ons are currently published for this itinerary. Any requested additions will be clearly identified in the final proposal.</p>
                )}
              </motion.article>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eee8ed] px-5 py-20 md:px-8 md:py-28">
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
            <h2 className="mt-6 text-3xl font-semibold md:text-4xl">Important operating notes</h2>
            <div className="mt-7 space-y-4 text-white/70">
              {journey.operationalNotes.map((item) => <p key={item} className="border-b border-white/10 pb-4 leading-7 last:border-0">{item}</p>)}
            </div>
            <p className="mt-7 rounded-2xl border border-[#d7b866]/20 bg-[#d7b866]/8 p-5 text-sm leading-7 text-white/65">{carnavalCommercial.supplierNotice}</p>
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
        <ResponsiveCarnavalImage image={journey.hero} alt={journey.title} className="absolute inset-0 h-full w-full object-cover opacity-48" eager />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,27,0.97)_0%,rgba(5,11,27,0.78)_48%,rgba(5,11,27,0.34)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(192,38,123,0.32),transparent_26%),radial-gradient(circle_at_65%_76%,rgba(215,184,102,0.2),transparent_28%)]" />

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl items-center px-5 pb-16 pt-32 md:px-8">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="max-w-5xl">
            <Link to="/carnaval" className="inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/80 backdrop-blur-md transition hover:border-[#d7b866]/60 hover:text-[#e2c97f]">
              Back to the collection
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#e2c97f]">{journey.tier} · Carnaval Collection 2027</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1] tracking-[-0.04em] text-balance md:text-7xl">{journey.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{journey.summary}</p>
            <div className="mt-9 max-w-5xl"><JourneyMeta item={journey} light /></div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#consultation" className="rounded-full bg-[#d7b866] px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-[#07152d] transition hover:bg-[#ead491]">Private enquiry preview</a>
              <span className="px-2 text-center font-semibold text-white sm:text-left">{journey.price}</span>
            </div>
          </motion.div>
        </div>
      </header>

      <main>
        <section className="px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <motion.div {...reveal}>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">Journey at a glance</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">A layered expression of Brazil in celebration.</h2>
              <p className="mt-6 text-lg leading-8 text-[#536078]">
                This concept combines Carnaval’s intensity with a more measured view of the destinations around it. The final sequence will be shaped as access, operating dates and regional arrangements are confirmed.
              </p>
              <div className="mt-8 rounded-[1.75rem] bg-[#07152d] p-6 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-[#e2c97f]">Planned route</p>
                <div className="mt-5 flex flex-wrap items-center gap-2" aria-label={`Planned route: ${journey.route.join(' to ')}`}>
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
                <h2 className="text-2xl font-semibold">Proposed highlights</h2>
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
                These highlights are planning concepts only. Specific tickets, hospitality access, accommodation, transport, suppliers and inclusions are not yet confirmed.
              </p>
            </motion.div>
          </div>
        </section>

        <ItinerarySection journey={journey} />

        {journey.editorialDestinations.map((destinationId, index) => (
          <DestinationEditorial key={destinationId} destinationId={destinationId} index={index} />
        ))}

        <CommercialDetails journey={journey} />

        <section className="px-5 py-20 md:px-8 md:py-28">
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

        <ConsultationBlock compact />
      </main>

      <CarnavalFooter />
    </div>
  )
}
