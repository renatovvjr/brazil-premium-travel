import { motion } from 'framer-motion'
import { Compass, Music2, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { carnavalDestinationOrder, carnavalImageMap, carnavalPackages } from './carnavalContent'
import { DestinationDiscovery, ResponsiveCarnavalImage } from './CarnavalDestinations'
import { CarnavalFooter, CarnavalNav, ConsultationBlock, reveal, usePageTop } from './CarnavalShared'

const faqs = [
  {
    question: 'Are the 2027 itineraries confirmed?',
    answer: 'The travel windows and collection concepts are published for early planning. The detailed itinerary, sequence of experiences and all access arrangements remain subject to confirmation and availability.',
  },
  {
    question: 'Are Sambódromo tickets or Salvador viewing areas included?',
    answer: 'These are proposed highlights within the collection. Specific tickets, hospitality areas, viewing arrangements and suppliers have not yet been confirmed and should not be considered booked or guaranteed.',
  },
  {
    question: 'What does Price on Enquiry mean?',
    answer: 'Pricing will be shared during the consultation stage once the final inclusions, travel style and availability are clearer. No package price is being advertised or accepted at this preview stage.',
  },
  {
    question: 'When can I register my interest?',
    answer: 'A dedicated private enquiry form will be added in a later release. For now, this preview is designed to help you compare the three journey concepts.',
  },
]

export default function CarnavalLanding() {
  usePageTop()

  return (
    <div className="min-h-screen bg-[#f7f5f1] text-[#07152d]">
      <header className="relative min-h-[92vh] overflow-hidden bg-[#050b1b] text-white">
        <CarnavalNav />
        <ResponsiveCarnavalImage
          image={carnavalImageMap.collectionHero}
          alt="Samba school performers in the Rio de Janeiro Sambódromo"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          eager
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,27,0.96)_0%,rgba(5,11,27,0.75)_48%,rgba(5,11,27,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(192,38,123,0.36),transparent_25%),radial-gradient(circle_at_68%_74%,rgba(215,184,102,0.20),transparent_30%)]" />

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-center px-5 pb-16 pt-32 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#e2c97f]">A limited collection · February 2027</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-balance md:text-7xl lg:text-[5.5rem]">
              Carnaval, curated beyond the obvious.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/76 md:text-xl">
              Three considered journeys through Brazil’s most expressive season — created for travellers who want the energy of Carnaval with cultural context, premium pacing and room to breathe.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#journeys" className="rounded-full bg-[#d7b866] px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-[#07152d] transition hover:bg-[#ead491]">
                Explore the collection
              </a>
              <a href="#consultation" className="rounded-full border border-white/35 bg-white/5 px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] backdrop-blur-md transition hover:bg-white hover:text-[#07152d]">
                Private enquiry preview
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      <main>
        <DestinationDiscovery destinationIds={carnavalDestinationOrder} />

        <section className="px-5 py-20 md:px-8 md:py-28">
          <motion.div {...reveal} className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">The Curated Brazil perspective</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">Celebration with depth, not a checklist.</h2>
            </div>
            <p className="text-lg leading-8 text-[#46536b]">
              Carnaval is not one experience. It changes across regions, rhythms and communities. This collection is designed to introduce those contrasts thoughtfully, pairing landmark moments with food, heritage, landscape and carefully paced transitions.
            </p>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-7xl gap-5 md:grid-cols-3">
            {[
              [Music2, 'Culturally led', 'Each journey is built around local identity, from frevo and samba to Bahia’s street culture and Minas heritage.'],
              [Compass, 'Considered pacing', 'Arrival time, celebration and recovery are balanced so the journey remains immersive rather than overwhelming.'],
              [ShieldCheck, 'Premium by design', 'A private-planning approach focused on comfort, clarity and thoughtful coordination as details are confirmed.'],
            ].map(([Icon, title, copy], index) => (
              <motion.article
                key={title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.08 }}
                className="rounded-[1.75rem] border border-[#0a1730]/10 bg-white p-7 shadow-[0_20px_65px_rgba(7,21,45,0.07)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#07152d] text-[#e2c97f]"><Icon size={20} /></span>
                <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-[#5b667a]">{copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="journeys" className="bg-[#07152d] px-5 py-20 text-white md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <motion.div {...reveal} className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#e2c97f]">Three ways into Carnaval</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">Choose the rhythm that feels like yours.</h2>
              <p className="mt-5 text-lg leading-8 text-white/65">Every concept has its own pace and cultural emphasis. All details remain provisional while the 2027 programme is developed.</p>
            </motion.div>

            <div className="mt-14 grid gap-7 lg:grid-cols-3">
              {carnavalPackages.map((item, index) => (
                <motion.article
                  key={item.id}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.08 }}
                  className="group flex overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.055] shadow-[0_28px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:flex-col"
                >
                  <div className="relative hidden h-60 overflow-hidden sm:block lg:block">
                    <img src={item.cardImage} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07152d] via-transparent to-transparent" />
                    <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-[#07152d]/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-md">{item.tier}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <p className="text-sm font-medium text-[#e2c97f]">{item.dates}</p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight">{item.title}</h3>
                    <p className="mt-4 flex-1 text-base leading-7 text-white/62">{item.summary}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                      <span className="font-semibold text-white">{item.price}</span>
                      <Link to={item.path} className="rounded-full border border-[#d7b866]/45 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.13em] text-[#e2c97f] transition hover:bg-[#d7b866] hover:text-[#07152d]">
                        Explore journey
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <motion.div {...reveal} className="grid gap-10 overflow-hidden rounded-[2.25rem] bg-white p-7 shadow-[0_30px_90px_rgba(7,21,45,0.09)] md:grid-cols-[0.9fr_1.1fr] md:p-12">
              <div className="relative min-h-80 overflow-hidden rounded-[1.5rem]">
                <img src="/images/salvador1.webp" alt="Cultural experience in Salvador" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07152d]/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-sm uppercase tracking-[0.22em] text-[#f1d991]">One country, many expressions</p>
                  <p className="mt-2 text-xl font-semibold">Designed around place, people and pace.</p>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">Collection notes</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">Built for thoughtful early planning.</h2>
                <div className="mt-7 space-y-5 text-[#536078]">
                  {[
                    ['Travel window', 'Late January to mid-February 2027, depending on the selected journey.'],
                    ['Journey style', 'Small-scale, premium and culturally immersive, with final group format to be confirmed.'],
                    ['Commercial status', 'Price on Enquiry. No payment, reservation or booking is available through this preview.'],
                    ['Important', 'Itineraries, experiences, access and inclusions remain subject to confirmation and availability.'],
                  ].map(([label, copy]) => (
                    <div key={label} className="grid gap-1 border-b border-[#0a1730]/10 pb-5 sm:grid-cols-[9rem_1fr]">
                      <p className="font-semibold text-[#07152d]">{label}</p>
                      <p className="leading-7">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-[#efeaf0] px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-5xl">
            <motion.div {...reveal} className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">Planning notes</p>
              <h2 className="mt-4 text-4xl font-semibold md:text-5xl">Frequently asked questions</h2>
            </motion.div>
            <div className="mt-12 space-y-4">
              {faqs.map((item, index) => (
                <motion.details
                  key={item.question}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.05 }}
                  className="group rounded-2xl border border-[#0a1730]/10 bg-white p-6 open:shadow-[0_18px_55px_rgba(7,21,45,0.07)]"
                >
                  <summary className="cursor-pointer list-none pr-8 text-lg font-semibold marker:hidden">{item.question}</summary>
                  <p className="mt-4 max-w-3xl leading-7 text-[#5b667a]">{item.answer}</p>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        <ConsultationBlock />
      </main>

      <CarnavalFooter />
    </div>
  )
}
