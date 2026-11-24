import { motion } from 'framer-motion'
import { Compass, Music2, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { carnavalCommercial, carnavalDestinationOrder, carnavalImageMap, carnavalPackages } from './carnavalContent'
import { DestinationDiscovery, ResponsiveCarnavalImage } from './CarnavalDestinations'
import { CarnavalFooter, CarnavalNav, ConsultationBlock, reveal, usePageTop } from './CarnavalShared'
import { useI18n } from './i18n'

const faqs = [
  {
    question: 'Are the 2027 journeys available for commercial enquiries?',
    answer: 'Yes. Each journey is professionally designed and available for commercial enquiries. Once the group is confirmed, Curated Brazil Travel will coordinate the tickets, hospitality arrangements and travel services included in the selected itinerary, subject to market availability and the agreed booking conditions.',
  },
  {
    question: 'How is premium Carnaval hospitality arranged?',
    answer: carnavalCommercial.hospitalityNotice,
  },
  {
    question: 'What does the published from price include?',
    answer: 'The published from price is per person, twin share, and excludes international flights. All domestic flights in the itinerary remain included. Your final quotation will reflect availability, occupancy, departure city and selected options.',
  },
  {
    question: 'How can I request a quotation?',
    answer: 'Open your preferred journey and select Enquire About This Journey. The form identifies the package automatically and lets you choose accommodation and whether international flights should be included in your quotation.',
  },
]

export default function CarnavalLanding() {
  usePageTop()
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-[var(--color-warm-ivory)] text-[var(--color-deep-forest)]">
      <header className="relative min-h-[92vh] overflow-hidden bg-[var(--color-deep-forest-strong)] text-white">
        <CarnavalNav />
        <ResponsiveCarnavalImage
          image={carnavalImageMap.collectionHero}
          alt="Samba school performers in the Rio de Janeiro Sambódromo"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-95 brightness-[1.06] saturate-[1.12] md:object-center"
          eager
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,39,30,0.94)_0%,rgba(0,39,30,0.72)_38%,rgba(0,56,43,0.20)_72%,rgba(0,56,43,0.05)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,39,30,0.20)_0%,transparent_48%,rgba(0,31,24,0.62)_100%),radial-gradient(circle_at_78%_22%,rgba(192,38,123,0.18),transparent_28%),radial-gradient(circle_at_68%_74%,rgba(215,184,102,0.13),transparent_30%)]" />

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-center px-5 pb-14 pt-28 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[52rem] [text-shadow:0_3px_22px_rgba(0,0,0,0.42)] md:ml-[3vw] lg:ml-[4vw]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-luxury-gold-soft)]">{t('carnaval.hero.eyebrow')}</p>
            <h1 className="mt-6 max-w-[50rem] text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-balance md:text-7xl lg:text-[5.5rem]">
              {t('carnaval.hero.title')}
            </h1>
            <p className="mt-6 max-w-[40rem] text-lg leading-8 text-white/80 md:text-[1.35rem] md:leading-9">
              {t('carnaval.hero.copy')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#journeys" className="rounded-full bg-[var(--color-luxury-gold)] px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-deep-forest)] transition hover:bg-[#ead491]">
                {t('carnaval.hero.explore')}
              </a>
              <a href="#journeys" className="rounded-full border border-white/35 bg-white/5 px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] backdrop-blur-md transition hover:bg-white hover:text-[var(--color-deep-forest)]">
                {t('carnaval.hero.compare')}
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      <main>
        <DestinationDiscovery destinationIds={carnavalDestinationOrder} />

        <section className="bg-[radial-gradient(circle_at_12%_20%,rgba(215,184,102,0.12),transparent_25%),radial-gradient(circle_at_92%_75%,rgba(192,38,123,0.10),transparent_28%)] px-5 py-16 md:px-8 md:py-20">
          <motion.div {...reveal} className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">{t('carnaval.perspective.eyebrow')}</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">{t('carnaval.perspective.title')}</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#435b55] lg:justify-self-end">
              Carnaval is not one experience. It changes across regions, rhythms and communities. This collection is designed to introduce those contrasts thoughtfully, pairing landmark moments with food, heritage, landscape and carefully paced transitions.
            </p>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-7xl gap-5 md:grid-cols-3">
            {[
              [Music2, 'The Energy', 'Unforgettable Carnaval celebrations, from the pulse of the Sambódromo to the music-filled streets of Salvador.'],
              [ShieldCheck, 'The Exclusivity', 'Premium hospitality, intimate groups and thoughtful coordination designed around comfort and confidence.'],
              [Compass, 'The Culture', 'Authentic destinations, Brazilian gastronomy and living traditions interpreted with depth and local context.'],
            ].map(([Icon, title, copy], index) => (
              <motion.article
                key={title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.08 }}
                className="rounded-[1.75rem] border border-[var(--color-brazilian-green)]/10 bg-white p-7 shadow-[0_20px_65px_rgba(0,39,30,0.07)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-deep-forest)] text-[var(--color-luxury-gold-soft)]"><Icon size={20} /></span>
                <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-[#536a64]">{copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="journeys" className="bg-[var(--color-deep-forest)] px-5 py-16 text-white md:px-8 md:py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div {...reveal} className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-luxury-gold-soft)]">{t('carnaval.journeys.eyebrow')}</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">{t('carnaval.journeys.title')}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">{t('carnaval.journeys.copy')}</p>
            </motion.div>

            <div className="mt-14 grid gap-7 lg:grid-cols-3">
              {carnavalPackages.map((item, index) => (
                <motion.article
                  key={item.id}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.08 }}
                  className="group flex flex-col overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.055] shadow-[0_28px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl"
                >
                  <div className="relative h-56 overflow-hidden sm:h-60">
                    <img src={item.cardImage} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-deep-forest)] via-transparent to-transparent" />
                    <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-[var(--color-deep-forest)]/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-md">{item.tier}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <p className="text-sm font-medium text-[var(--color-luxury-gold-soft)]">{item.dates}</p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight">{item.title}</h3>
                    <p className="mt-4 flex-1 text-base leading-7 text-white/62">{item.summary}</p>
                    <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm text-white/70">
                      <p><span className="font-semibold text-white">{t('common.duration')}</span> {item.duration}</p>
                      <p><span className="font-semibold text-white">{t('common.group')}</span> {t('common.maximum', { count: item.maxTravelers })}</p>
                      <p className="leading-6"><span className="font-semibold text-white">{t('common.cities')}</span> {item.destinations.join(' · ')}</p>
                    </div>
                    <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5">
                      <span className="font-semibold leading-6 text-white">{item.price}</span>
                      <Link to={item.path} className="rounded-full border border-[var(--color-luxury-gold)]/45 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--color-luxury-gold-soft)] transition hover:bg-[var(--color-luxury-gold)] hover:text-[var(--color-deep-forest)]">
                        {t('common.viewExperience')}
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
            <p className="mt-8 max-w-4xl text-sm italic leading-6 text-white/50">{carnavalCommercial.priceNote}</p>
          </div>
        </section>

        <section className="px-5 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div {...reveal} className="grid gap-10 overflow-hidden rounded-[2.25rem] bg-white p-7 shadow-[0_30px_90px_rgba(0,39,30,0.09)] md:grid-cols-[0.9fr_1.1fr] md:p-12">
              <div className="relative min-h-80 overflow-hidden rounded-[1.5rem]">
                <img src="/images/salvador1.webp" alt="Cultural experience in Salvador" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-deep-forest)]/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-sm uppercase tracking-[0.22em] text-[#f1d991]">One country, many expressions</p>
                  <p className="mt-2 text-xl font-semibold">Designed around place, people and pace.</p>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">Collection notes</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">Your Carnaval Experience, Thoughtfully Curated.</h2>
                <p className="mt-5 leading-7 text-[#4b655f]">Every journey is carefully designed to deliver an authentic and memorable Brazilian Carnaval experience, combining premium comfort, cultural immersion and personalised coordination.</p>
                <div className="mt-7 space-y-5 text-[#4b655f]">
                  {[
                    ['Travel window', 'Late January to mid-February 2027, depending on the selected journey.'],
                    ['Journey style', 'Boutique groups, premium accommodation, coordinated transport and culturally immersive experiences.'],
                    ['Coordination', 'Once the group is confirmed, tickets, hospitality arrangements and travel services will be coordinated according to the selected itinerary and market availability.'],
                    ['Your protection', 'Any material substitution will be disclosed and agreed before booking confirmation, or handled under the applicable booking terms and consumer rights.'],
                  ].map(([label, copy]) => (
                    <div key={label} className="grid gap-1 border-b border-[var(--color-brazilian-green)]/10 pb-5 sm:grid-cols-[9rem_1fr]">
                      <p className="font-semibold text-[var(--color-deep-forest)]">{label}</p>
                      <p className="leading-7">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-[#efeaf0] px-5 py-16 md:px-8 md:py-20">
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
                  className="group rounded-2xl border border-[var(--color-brazilian-green)]/10 bg-white p-6 open:shadow-[0_18px_55px_rgba(0,39,30,0.07)]"
                >
                  <summary className="cursor-pointer list-none pr-8 text-lg font-semibold marker:hidden">{item.question}</summary>
                  <p className="mt-4 max-w-3xl leading-7 text-[#536a64]">{item.answer}</p>
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
